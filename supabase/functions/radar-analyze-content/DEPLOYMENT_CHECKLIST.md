# Deployment Checklist: Radar Content Analysis

## Pre-Deployment

### 1. Environment Setup
- [ ] Supabase CLI installed (`brew install supabase/tap/supabase`)
- [ ] Supabase project linked (`supabase link`)
- [ ] Anthropic API key obtained (https://console.anthropic.com)
- [ ] Database migration applied (`20260213240000_radar_schema.sql`)

### 2. Verify Database Schema
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('gv_creators', 'gv_creator_content', 'gv_creator_rankings', 'gv_brand_marketshare');

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gv_creator_content'
AND column_name IN ('originality_score', 'content_quality_score', 'brand_mentions', 'analysis_status');
```

- [ ] All tables exist
- [ ] All required columns present
- [ ] Indexes created

### 3. Test Data Setup
```sql
-- Insert test creator
INSERT INTO gv_creators (name, category, country, follower_count, platform_primary)
VALUES ('Test Creator', 'beauty', 'ID', 500000, 'instagram');

-- Insert test content
INSERT INTO gv_creator_content (creator_id, platform, post_id, post_url, caption, hashtags, analysis_status)
VALUES (
  (SELECT id FROM gv_creators WHERE name = 'Test Creator'),
  'instagram',
  'test_post_001',
  'https://instagram.com/p/test',
  'Testing this amazing product! #beauty #skincare',
  ARRAY['beauty', 'skincare'],
  'pending'
);
```

- [ ] Test creator created
- [ ] Test content inserted
- [ ] Status is 'pending'

## Deployment Steps

### 4. Set Environment Variables
```bash
# Set Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-..."
supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"

# Verify secret is set
supabase secrets list
```

- [ ] ANTHROPIC_API_KEY set in Supabase
- [ ] Secret appears in list
- [ ] No exposure in logs

### 5. Deploy Function
```bash
cd supabase/functions/radar-analyze-content

# Option 1: Use deploy script
./deploy.sh

# Option 2: Manual deploy
supabase functions deploy radar-analyze-content
```

- [ ] Function deployed successfully
- [ ] No deployment errors
- [ ] Function appears in dashboard

### 6. Verify Deployment
```bash
# Check function exists
supabase functions list

# View initial logs
supabase functions logs radar-analyze-content
```

- [ ] Function listed
- [ ] Status is active
- [ ] No error logs

## Testing Phase

### 7. Test Single Analysis
```bash
# Get test content ID
TEST_CONTENT_ID=$(psql -t -c "SELECT id FROM gv_creator_content WHERE analysis_status = 'pending' LIMIT 1")

# Test single analysis
curl -X POST 'https://[project-ref].supabase.co/functions/v1/radar-analyze-content' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [SUPABASE_ANON_KEY]' \
  -d "{\"content_id\": \"$TEST_CONTENT_ID\"}"
```

Expected response:
```json
{
  "success": true,
  "mode": "single",
  "result": {
    "success": true,
    "content_id": "uuid",
    "analysis": {
      "originality_score": 0.0-1.0,
      "quality_score": 0.0-1.0,
      "brand_mentions": [...],
      "reasoning": "..."
    },
    "cost_usd": 0.003-0.007
  }
}
```

Checklist:
- [ ] Request completes successfully (200 status)
- [ ] Response contains all fields
- [ ] Scores are between 0 and 1
- [ ] Brand mentions detected (if applicable)
- [ ] Cost is reasonable (~$0.005)

### 8. Verify Database Update
```sql
-- Check analysis results
SELECT
  id,
  originality_score,
  content_quality_score,
  brand_mentions,
  analysis_status,
  analyzed_at
FROM gv_creator_content
WHERE id = '[TEST_CONTENT_ID]';
```

- [ ] originality_score updated (0-1)
- [ ] content_quality_score updated (0-1)
- [ ] brand_mentions populated (JSONB array)
- [ ] analysis_status = 'completed'
- [ ] analyzed_at timestamp set

### 9. Test Batch Analysis
```bash
# Test batch analysis
curl -X POST 'https://[project-ref].supabase.co/functions/v1/radar-analyze-content' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [SUPABASE_ANON_KEY]' \
  -d '{"batch": true, "category": "beauty"}'
```

Expected response:
```json
{
  "success": true,
  "mode": "batch",
  "category": "beauty",
  "result": {
    "processed": 10-100,
    "failed": 0,
    "total_cost_usd": 0.02-0.50,
    "cache_savings_usd": 0.01-0.30
  }
}
```

Checklist:
- [ ] Request completes successfully
- [ ] Processed count matches pending posts
- [ ] Failed count is 0 (or minimal)
- [ ] Cache savings > 0 (if >1 post)
- [ ] Cost is reasonable

### 10. Monitor Function Logs
```bash
# View logs in real-time
supabase functions logs radar-analyze-content --follow
```

Look for:
- [ ] No error messages
- [ ] Successful API calls to Claude
- [ ] Database updates successful
- [ ] Cache hit rates >90% (for batch)

## Performance Verification

### 11. Test Performance
```bash
# Time single analysis
time curl -X POST '[FUNCTION_URL]' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [KEY]' \
  -d '{"content_id": "[UUID]"}'
```

Expected:
- [ ] Single analysis: 2-5 seconds
- [ ] Batch (10 posts): 10-20 seconds
- [ ] Batch (100 posts): 60-120 seconds

### 12. Cost Validation
```sql
-- Calculate average cost per analysis
SELECT
  COUNT(*) as total_analyzed,
  AVG(CASE WHEN analysis_status = 'completed' THEN 1 ELSE 0 END) as completion_rate
FROM gv_creator_content;
```

Track costs:
- [ ] Single analysis: ~$0.005/post
- [ ] Batch (with cache): ~$0.002/post
- [ ] Daily budget: Set alert threshold

### 13. Error Handling Test
```bash
# Test invalid content_id
curl -X POST '[FUNCTION_URL]' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [KEY]' \
  -d '{"content_id": "invalid-uuid"}'

# Test invalid category
curl -X POST '[FUNCTION_URL]' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [KEY]' \
  -d '{"batch": true, "category": "invalid"}'
```

Expected:
- [ ] Returns error message (not crash)
- [ ] Proper HTTP status code (400/404/500)
- [ ] Error details in response
- [ ] Error logged properly

## Integration Testing

### 14. Frontend Integration Test
```typescript
// Test from frontend code
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data, error } = await supabase.functions.invoke(
  'radar-analyze-content',
  { body: { batch: true, category: 'beauty' } }
);

console.log('Result:', data);
console.log('Error:', error);
```

- [ ] Frontend can call function
- [ ] CORS works correctly
- [ ] Response format matches expectations
- [ ] Errors handled gracefully

### 15. Apify Integration Test
```typescript
// Test after Apify scraping
const scrapedPosts = [...]; // From Apify

// Insert posts
const { data: inserted } = await supabase
  .from('gv_creator_content')
  .insert(scrapedPosts.map(post => ({...})))
  .select('id');

// Trigger analysis
const { data: analysis } = await supabase.functions.invoke(
  'radar-analyze-content',
  { body: { batch: true, category: 'beauty' } }
);
```

- [ ] Posts inserted successfully
- [ ] Analysis triggered automatically
- [ ] Results stored in database
- [ ] Pipeline completes end-to-end

## Production Readiness

### 16. Security Audit
- [ ] API key stored securely (not in code)
- [ ] No sensitive data in logs
- [ ] CORS configured properly
- [ ] Database RLS policies active
- [ ] Rate limiting implemented

### 17. Monitoring Setup
```bash
# Set up log alerts
# Monitor these metrics:
# - Analysis success rate
# - Average cost per analysis
# - Cache hit rate
# - Error rate
# - Processing time
```

- [ ] Logging configured
- [ ] Alerts set up (optional)
- [ ] Dashboard access confirmed
- [ ] Cost alerts configured

### 18. Documentation Review
- [ ] README.md reviewed
- [ ] INTEGRATION.md reviewed
- [ ] QUICK_REFERENCE.md reviewed
- [ ] ARCHITECTURE.md reviewed
- [ ] Team trained on usage

### 19. Backup and Rollback Plan
```bash
# Document current version
supabase functions list --format json > function-versions.json

# Plan rollback procedure
# 1. Keep previous version reference
# 2. Know how to redeploy old version
# 3. Have database backup ready
```

- [ ] Current version documented
- [ ] Rollback procedure documented
- [ ] Database backup available
- [ ] Team knows rollback process

## Post-Deployment

### 20. Production Monitoring (First 24 Hours)
- [ ] Hour 1: Check logs every 15 minutes
- [ ] Hour 2-4: Check logs every hour
- [ ] Hour 4-24: Check logs every 4 hours
- [ ] Monitor cost accumulation
- [ ] Watch error rates

### 21. Production Metrics (First Week)
Track these daily:
```sql
-- Daily analysis stats
SELECT
  DATE(analyzed_at) as date,
  COUNT(*) as total_analyzed,
  COUNT(*) FILTER (WHERE analysis_status = 'completed') as completed,
  COUNT(*) FILTER (WHERE analysis_status = 'failed') as failed,
  AVG(originality_score) as avg_originality,
  AVG(content_quality_score) as avg_quality
FROM gv_creator_content
WHERE analyzed_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(analyzed_at)
ORDER BY date DESC;
```

- [ ] Success rate >95%
- [ ] Average cost <$0.005/post
- [ ] Cache hit rate >90%
- [ ] No critical errors
- [ ] Performance within targets

### 22. Optimization Review (After 1 Week)
- [ ] Review cost trends
- [ ] Analyze error patterns
- [ ] Check cache efficiency
- [ ] Evaluate processing speed
- [ ] Plan optimizations if needed

## Scaling Preparation

### 23. Load Testing
```bash
# Test with large batch
curl -X POST '[FUNCTION_URL]' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [KEY]' \
  -d '{"batch": true, "category": "beauty"}'

# Monitor:
# - Processing time
# - Cost scaling
# - Error rates
# - Cache performance
```

- [ ] Handles 100 posts successfully
- [ ] Scales linearly with batch size
- [ ] No memory issues
- [ ] Rate limits respected

### 24. Production Scale Plan
Estimate for full production:

| Scenario | Posts/Day | Cost/Day | Notes |
|----------|-----------|----------|-------|
| Pilot | 1,000 | $2.00 | 50 creators |
| Phase 1 | 10,000 | $20.00 | 500 creators |
| Phase 2 | 50,000 | $100.00 | 2,500 creators |
| Full Scale | 240,000 | $480.00 | 8,000 creators |

- [ ] Budget approved for target scale
- [ ] Scaling plan documented
- [ ] Team ready for increased volume

## Sign-Off

### Final Approval
- [ ] Technical lead approval
- [ ] Product owner approval
- [ ] DevOps approval (if applicable)
- [ ] Budget approval
- [ ] Documentation complete

### Deployment Date
- **Deployed By:** _______________
- **Date:** _______________
- **Time:** _______________
- **Version:** _______________

### Post-Deployment Notes
```
[Add any observations, issues, or learnings from deployment]
```

---

## Quick Reference Commands

```bash
# Deploy
supabase functions deploy radar-analyze-content

# Test
curl -X POST 'https://[ref].supabase.co/functions/v1/radar-analyze-content' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [KEY]' \
  -d '{"batch": true, "category": "beauty"}'

# Logs
supabase functions logs radar-analyze-content --follow

# Secrets
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."
supabase secrets list
```

## Emergency Contacts

- **Anthropic Support:** https://support.anthropic.com
- **Supabase Support:** https://supabase.com/support
- **Team Lead:** [Name/Contact]
- **On-Call:** [Name/Contact]

---

**Deployment Status:** ☐ Not Started | ☐ In Progress | ☐ Complete

**Production Ready:** ☐ Yes | ☐ No | ☐ Pending Review
