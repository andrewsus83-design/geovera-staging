# Deployment Checklist: radar-learn-brand-authority

Complete deployment guide for the brand authority learning system.

## Prerequisites

- [ ] Supabase project set up
- [ ] Anthropic API key configured (`ANTHROPIC_API_KEY`)
- [ ] Content scraped and available in `gv_creator_content` table
- [ ] At least 20+ posts per category for learning

## Deployment Steps

### 1. Apply Database Migration

```bash
# Navigate to project root
cd /path/to/geovera-staging

# Apply migration
supabase db push

# Verify tables created
supabase db execute "
  SELECT table_name
  FROM information_schema.tables
  WHERE table_name = 'gv_brand_authority_patterns';
"
```

**Expected Output:**
```
           table_name
─────────────────────────────────
 gv_brand_authority_patterns
```

### 2. Deploy Edge Function

```bash
# Deploy function (public access, no JWT verification)
supabase functions deploy radar-learn-brand-authority --no-verify-jwt

# Verify deployment
supabase functions list
```

**Expected Output:**
```
┌────────────────────────────────┬────────────┬──────────────────┐
│ Name                           │ Status     │ Updated          │
├────────────────────────────────┼────────────┼──────────────────┤
│ radar-learn-brand-authority    │ ACTIVE     │ 2 minutes ago    │
└────────────────────────────────┴────────────┴──────────────────┘
```

### 3. Set Environment Variables

```bash
# Set Anthropic API key (if not already set)
supabase secrets set ANTHROPIC_API_KEY=your_actual_key_here

# Verify secrets
supabase secrets list
```

**Expected Output:**
```
┌──────────────────────┬────────────────────┐
│ Name                 │ Digest             │
├──────────────────────┼────────────────────┤
│ ANTHROPIC_API_KEY    │ 8f4e...           │
└──────────────────────┴────────────────────┘
```

### 4. Test Deployment

```bash
# Get your Supabase URL and anon key
SUPABASE_URL=$(supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

# Test learning function
curl -X POST "$SUPABASE_URL/functions/v1/radar-learn-brand-authority" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "sample_size": 15
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "category": "beauty",
  "result": {
    "success": true,
    "patterns": {
      "authority_signals": {
        "keywords": [...],
        "content_types": [...],
        "quality_indicators": [...]
      },
      "noise_signals": {...},
      "filtering_rules": [...],
      "confidence_score": 0.85
    },
    "sample_size": 15,
    "cost_usd": 0.0234,
    "status": "learned_new_patterns"
  }
}
```

### 5. Initial Pattern Learning (All Categories)

```bash
# Learn patterns for all active categories
for category in beauty fashion food tech lifestyle; do
  echo "Learning patterns for: $category"

  curl -X POST "$SUPABASE_URL/functions/v1/radar-learn-brand-authority" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"category\": \"$category\", \"sample_size\": 20}"

  echo "\n---\n"
  sleep 2
done
```

### 6. Verify Patterns Saved

```sql
-- Check saved patterns
SELECT
  category,
  sample_size,
  confidence_score,
  learned_at,
  expires_at,
  is_active,
  learning_cost_usd
FROM gv_brand_authority_patterns
ORDER BY learned_at DESC;
```

**Expected Output:**
```
 category | sample_size | confidence_score |      learned_at      |      expires_at      | is_active | learning_cost_usd
----------+-------------+------------------+----------------------+----------------------+-----------+-------------------
 beauty   |          20 |             0.88 | 2026-02-13 10:30:00 | 2026-03-15 10:30:00 | t         |            0.0234
 fashion  |          20 |             0.82 | 2026-02-13 10:30:05 | 2026-03-15 10:30:05 | t         |            0.0241
 food     |          20 |             0.85 | 2026-02-13 10:30:10 | 2026-03-15 10:30:10 | t         |            0.0228
```

### 7. Setup Automated Monthly Refresh (Optional)

```sql
-- Create cron job for monthly pattern refresh
SELECT cron.schedule(
  'refresh-brand-authority-patterns-beauty',
  '0 0 1 * *', -- First day of each month at midnight
  $$
  SELECT
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/radar-learn-brand-authority',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'category', 'beauty',
        'sample_size', 25,
        'force_relearn', true
      )
    );
  $$
);

-- Verify cron job created
SELECT jobid, schedule, command FROM cron.job WHERE jobname LIKE 'refresh-brand-authority%';
```

### 8. Integration with Content Analysis (Optional)

See [INTEGRATION.md](./INTEGRATION.md) for detailed integration steps.

Quick integration test:

```bash
# Test content analysis with patterns
curl -X POST "$SUPABASE_URL/functions/v1/radar-analyze-content" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "batch": true,
    "category": "beauty"
  }'
```

## Verification Checklist

- [ ] Migration applied successfully
- [ ] Function deployed and active
- [ ] Environment variables set
- [ ] Test request successful
- [ ] Patterns saved to database
- [ ] All categories have learned patterns
- [ ] Pattern expiration dates correct (30 days from now)
- [ ] Cron job scheduled (if using automated refresh)

## Monitoring Setup

### 1. Create Monitoring View

```sql
-- View for pattern performance monitoring
CREATE OR REPLACE VIEW v_pattern_performance AS
SELECT
  p.category,
  p.confidence_score,
  p.sample_size,
  p.learned_at,
  p.expires_at,
  p.learning_cost_usd,
  p.is_active,
  -- Count content analyzed after pattern learning
  COUNT(c.id) as content_analyzed,
  AVG(c.content_quality_score) as avg_quality_score,
  COUNT(c.id) FILTER (WHERE c.content_quality_score > 0.7) as authority_count,
  COUNT(c.id) FILTER (WHERE c.content_quality_score < 0.3) as noise_count,
  -- Calculate effectiveness
  ROUND(
    (COUNT(c.id) FILTER (WHERE c.content_quality_score > 0.7)::NUMERIC /
     NULLIF(COUNT(c.id), 0) * 100),
    2
  ) as authority_percentage
FROM gv_brand_authority_patterns p
LEFT JOIN gv_creators cr ON cr.category = p.category
LEFT JOIN gv_creator_content c ON c.creator_id = cr.id
  AND c.analyzed_at > p.learned_at
WHERE p.is_active = true
GROUP BY p.id, p.category, p.confidence_score, p.sample_size,
         p.learned_at, p.expires_at, p.is_active, p.learning_cost_usd;

-- Check pattern performance
SELECT * FROM v_pattern_performance;
```

### 2. Setup Alerts (Optional)

```sql
-- Alert for expiring patterns (< 7 days)
CREATE OR REPLACE FUNCTION check_expiring_patterns()
RETURNS TABLE(category TEXT, expires_in_days INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.category,
    EXTRACT(DAY FROM (p.expires_at - NOW()))::INTEGER as expires_in_days
  FROM gv_brand_authority_patterns p
  WHERE p.is_active = true
    AND p.expires_at < (NOW() + INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Check for expiring patterns
SELECT * FROM check_expiring_patterns();
```

### 3. Cost Tracking

```sql
-- Track learning costs over time
SELECT
  DATE_TRUNC('month', learned_at) as month,
  COUNT(*) as patterns_learned,
  SUM(learning_cost_usd) as total_cost_usd,
  AVG(confidence_score) as avg_confidence
FROM gv_brand_authority_patterns
GROUP BY DATE_TRUNC('month', learned_at)
ORDER BY month DESC;
```

## Troubleshooting

### Issue: Function deployment fails

**Error:**
```
Error: Failed to deploy function
```

**Solution:**
```bash
# Check function logs
supabase functions logs radar-learn-brand-authority --tail

# Verify function exists
ls -la supabase/functions/radar-learn-brand-authority/

# Redeploy with verbose logging
supabase functions deploy radar-learn-brand-authority --no-verify-jwt --debug
```

### Issue: Missing ANTHROPIC_API_KEY

**Error:**
```json
{
  "error": "Internal server error",
  "details": "ANTHROPIC_API_KEY environment variable is not set"
}
```

**Solution:**
```bash
# Set the API key
supabase secrets set ANTHROPIC_API_KEY=your_key_here

# Redeploy function to pick up new environment
supabase functions deploy radar-learn-brand-authority --no-verify-jwt
```

### Issue: Insufficient samples

**Error:**
```json
{
  "error": "Internal server error",
  "details": "Insufficient samples (5). Need at least 10 posts."
}
```

**Solution:**
```bash
# Check available content for category
supabase db execute "
  SELECT
    c.category,
    COUNT(*) as content_count
  FROM gv_creators c
  JOIN gv_creator_content cc ON cc.creator_id = c.id
  WHERE cc.is_promo = false
    AND cc.is_giveaway = false
    AND cc.caption IS NOT NULL
  GROUP BY c.category;
"

# If insufficient, scrape more content first
curl -X POST "$SUPABASE_URL/functions/v1/radar-scrape-content" \
  -d '{"creator_id": "some-creator-id"}'
```

### Issue: Pattern learning takes too long

**Cause**: Large sample size or slow Claude API response

**Solution:**
```bash
# Use smaller sample size (still effective)
curl -X POST "$SUPABASE_URL/functions/v1/radar-learn-brand-authority" \
  -d '{"category": "beauty", "sample_size": 15}'

# Check Claude API status
curl https://status.anthropic.com/api/v2/status.json
```

### Issue: Low confidence scores (<0.70)

**Cause**: Insufficient or inconsistent sample data

**Solution:**
```bash
# Re-learn with larger, more diverse sample
curl -X POST "$SUPABASE_URL/functions/v1/radar-learn-brand-authority" \
  -d '{
    "category": "beauty",
    "sample_size": 30,
    "force_relearn": true
  }'
```

## Rollback Procedure

If deployment causes issues:

```bash
# 1. Deactivate patterns
supabase db execute "
  UPDATE gv_brand_authority_patterns
  SET is_active = false
  WHERE is_active = true;
"

# 2. Delete function
supabase functions delete radar-learn-brand-authority

# 3. Rollback migration (if needed)
supabase db reset
```

## Post-Deployment Checklist

- [ ] All patterns learned successfully
- [ ] Confidence scores >= 0.70 for all categories
- [ ] Integration tested with content analysis
- [ ] Monitoring views created
- [ ] Cost tracking enabled
- [ ] Documentation updated
- [ ] Team notified of new feature

## Performance Benchmarks

**Expected Performance:**
- **Learning time**: 5-10 seconds per category
- **Learning cost**: $0.02-0.03 per category
- **Pattern validity**: 30 days
- **Pre-filter accuracy**: 75-85%
- **Claude cost savings**: 30-50%

## Next Steps

1. Monitor pattern performance for first week
2. Validate pre-filter accuracy vs Claude
3. Adjust confidence thresholds if needed
4. Schedule monthly pattern refresh
5. Integrate with automated content pipeline

## Support

For issues or questions:
- Check function logs: `supabase functions logs radar-learn-brand-authority`
- Review migration: `supabase/migrations/20260213250000_brand_authority_patterns.sql`
- See integration guide: `INTEGRATION.md`
- Test locally: `supabase functions serve radar-learn-brand-authority`

---

**Deployment Complete!** 🎉

Your brand authority learning system is now live and ready to optimize content analysis.
