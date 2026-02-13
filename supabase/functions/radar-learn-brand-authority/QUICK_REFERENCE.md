# Quick Reference: radar-learn-brand-authority

Fast reference guide for common operations.

## API Endpoints

### Learn Patterns (First Time)
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"category": "beauty", "sample_size": 20}'
```

### Force Re-Learn (Monthly Refresh)
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"category": "beauty", "force_relearn": true}'
```

### Check Existing Patterns (No Cost)
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"category": "beauty"}'
```

## SQL Queries

### View All Patterns
```sql
SELECT
  category,
  confidence_score,
  sample_size,
  learned_at,
  expires_at,
  is_active
FROM gv_brand_authority_patterns
ORDER BY learned_at DESC;
```

### Get Active Pattern for Category
```sql
SELECT * FROM get_active_authority_patterns('beauty');
```

### Check Pattern Expiration
```sql
SELECT
  category,
  expires_at,
  EXTRACT(DAY FROM (expires_at - NOW())) as days_until_expiry
FROM gv_brand_authority_patterns
WHERE is_active = true
ORDER BY expires_at ASC;
```

### Expire Old Patterns
```sql
SELECT expire_old_authority_patterns('beauty');
```

### Pattern Performance
```sql
SELECT * FROM v_pattern_performance;
```

### Total Learning Costs
```sql
SELECT
  SUM(learning_cost_usd) as total_cost,
  COUNT(*) as total_patterns,
  AVG(learning_cost_usd) as avg_cost_per_pattern
FROM gv_brand_authority_patterns;
```

## TypeScript Integration

### Load Patterns
```typescript
const { data: pattern } = await supabase
  .from("gv_brand_authority_patterns")
  .select("*")
  .eq("category", "beauty")
  .eq("is_active", true)
  .gt("expires_at", new Date().toISOString())
  .single();
```

### Apply Pre-Filter
```typescript
function isAuthorityContent(
  caption: string,
  keywords: string[]
): boolean {
  const lowerCaption = caption.toLowerCase();
  return keywords.some(kw => lowerCaption.includes(kw.toLowerCase()));
}

// Check if content has authority keywords
const hasAuthority = isAuthorityContent(
  content.caption,
  pattern.authority_signals.keywords
);
```

### Check Pattern Validity
```typescript
function isPatternsValid(pattern: any): boolean {
  return (
    pattern.is_active &&
    new Date(pattern.expires_at) > new Date() &&
    pattern.confidence_score >= 0.70
  );
}
```

## Common Workflows

### 1. Initial Setup (All Categories)
```bash
for category in beauty fashion food tech lifestyle; do
  curl -X POST .../radar-learn-brand-authority \
    -H "Authorization: Bearer $ANON_KEY" \
    -d "{\"category\": \"$category\", \"sample_size\": 20}"
  sleep 2
done
```

### 2. Monthly Refresh (Automated)
```sql
-- Schedule monthly refresh
SELECT cron.schedule(
  'refresh-patterns-beauty',
  '0 0 1 * *',
  $$ /* HTTP call to function */ $$
);
```

### 3. Check and Re-Learn if Needed
```bash
# Check pattern status
PATTERN=$(curl -s .../radar-learn-brand-authority \
  -d '{"category": "beauty"}' | jq -r '.result.status')

# Re-learn if using old patterns
if [ "$PATTERN" == "using_existing_patterns" ]; then
  curl .../radar-learn-brand-authority \
    -d '{"category": "beauty", "force_relearn": true}'
fi
```

## Cost Reference

| Operation | Input Tokens | Output Tokens | Cost (USD) |
|-----------|--------------|---------------|------------|
| Learn (10 posts) | ~2,000 | ~600 | $0.015 |
| Learn (20 posts) | ~3,500 | ~800 | $0.025 |
| Learn (30 posts) | ~5,000 | ~1,000 | $0.035 |
| Check existing | 0 | 0 | $0.000 |

**Claude 3.5 Sonnet Pricing:**
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

## Pattern Structure

```typescript
{
  "authority_signals": {
    "keywords": string[],           // ["tutorial", "review"]
    "content_types": string[],      // ["product review"]
    "quality_indicators": string[], // ["detailed caption"]
    "engagement_patterns": string[] // ["high save rate"]
  },
  "noise_signals": {
    "keywords": string[],           // ["mood", "vibes"]
    "content_types": string[],      // ["selfie"]
    "low_value_patterns": string[]  // ["caption <20 words"]
  },
  "filtering_rules": [
    {
      "rule": string,               // Description
      "confidence": number,         // 0-1
      "applies_to": string          // "caption" | "content_type"
    }
  ],
  "key_insights": string[],
  "confidence_score": number        // 0-1
}
```

## Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 400 | Missing category | Add `"category"` to request |
| 400 | Invalid sample_size | Use 10-50 |
| 500 | Insufficient samples | Scrape more content first |
| 500 | ANTHROPIC_API_KEY not set | Set environment variable |

## Status Codes

| Status | Meaning |
|--------|---------|
| `learned_new_patterns` | New patterns created |
| `using_existing_patterns` | Active patterns found (no cost) |

## Confidence Thresholds

| Score | Interpretation | Action |
|-------|----------------|--------|
| 0.85-1.0 | Excellent | Use patterns confidently |
| 0.70-0.84 | Good | Use patterns with validation |
| 0.50-0.69 | Moderate | Re-learn with more samples |
| <0.50 | Poor | Insufficient data |

## Best Practices

1. **Sample Size**: Use 15-25 posts for balanced learning
2. **Refresh Frequency**: Monthly or when confidence drops
3. **Pre-Filter Threshold**: Only apply rules with confidence >= 0.75
4. **Pattern Validity**: Check `expires_at` and `confidence_score`
5. **Cost Optimization**: Use existing patterns when available

## Local Testing

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve radar-learn-brand-authority

# Test locally
curl http://localhost:54321/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_LOCAL_ANON_KEY" \
  -d '{"category": "beauty", "sample_size": 15}'
```

## Logs

```bash
# View function logs
supabase functions logs radar-learn-brand-authority --tail

# View recent errors
supabase functions logs radar-learn-brand-authority --filter error
```

## Database Indexes

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'gv_brand_authority_patterns';
```

## Maintenance Tasks

### Weekly
- [ ] Check pattern expiration dates
- [ ] Review pattern performance metrics

### Monthly
- [ ] Re-learn patterns for all categories
- [ ] Validate pattern accuracy vs Claude
- [ ] Review and optimize confidence thresholds

### Quarterly
- [ ] Analyze cost savings
- [ ] Review and update pattern categories
- [ ] Adjust sample sizes based on performance

## Performance Metrics

**Target Benchmarks:**
- Learning time: <10 seconds
- Confidence score: >=0.75
- Pre-filter accuracy: >=75%
- Cost per learning: <$0.03
- Pattern validity: 30 days

## Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| No patterns | Run learning function |
| Low confidence | Increase sample_size |
| Expired patterns | Set force_relearn: true |
| High costs | Use existing patterns |
| Wrong classification | Adjust confidence thresholds |

## Related Functions

- `radar-analyze-content`: Uses learned patterns for content analysis
- `radar-scrape-content`: Provides content for pattern learning
- `radar-calculate-rankings`: Benefits from improved content quality scores

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# From Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Support Resources

- Full README: [README.md](./README.md)
- Integration Guide: [INTEGRATION.md](./INTEGRATION.md)
- Deployment Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Test Script: [test.ts](./test.ts)
