# Deployment Checklist: radar-scrape-serpapi

Use this checklist to ensure proper deployment and verification of the radar-scrape-serpapi Edge Function.

---

## Pre-Deployment

### 1. Prerequisites
- [ ] Supabase CLI installed and updated
- [ ] Logged into Supabase (`supabase login`)
- [ ] Project linked (`supabase link --project-ref YOUR_PROJECT_ID`)
- [ ] SerpAPI account created at https://serpapi.com
- [ ] SerpAPI API key obtained from dashboard

### 2. Code Review
- [ ] Read through `/supabase/functions/radar-scrape-serpapi/index.ts`
- [ ] Understand all 4 operations (youtube_channel, youtube_videos, google_trends, batch_youtube)
- [ ] Review error handling logic
- [ ] Verify CORS headers configuration

### 3. Documentation Review
- [ ] Read README.md for overview
- [ ] Read QUICK_START.md for basic usage
- [ ] Bookmark EXAMPLES.md for reference
- [ ] Review COST_ANALYSIS.md to understand savings

---

## Deployment

### 4. Set Environment Variables
```bash
# Set SerpAPI key
supabase secrets set SERPAPI_KEY=your_serpapi_key_here

# Verify all secrets are set
supabase secrets list
```

Expected secrets:
- [ ] `SERPAPI_KEY` is set
- [ ] `SUPABASE_URL` exists (auto-set)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` exists (auto-set)
- [ ] `ALLOWED_ORIGIN` is set to `https://geovera.xyz`

### 5. Deploy Function
```bash
cd supabase/functions
supabase functions deploy radar-scrape-serpapi
```

Verify deployment:
- [ ] Deployment completed without errors
- [ ] Function URL displayed in output
- [ ] Function listed in `supabase functions list`

### 6. Check Function Logs
```bash
supabase functions log radar-scrape-serpapi --limit 10
```

Verify:
- [ ] No error logs on startup
- [ ] Function is responsive

---

## Testing

### 7. Test YouTube Channel Stats

**Test Command:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "youtube_channel",
    "creator_id": "test-uuid-1",
    "youtube_handle": "@mkbhd"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "operation": "youtube_channel",
  "cost_usd": 0.001,
  "result": {
    "creator_id": "test-uuid-1",
    "youtube_handle": "@mkbhd",
    "stats": {
      "subscriber_count": 18000000,
      "video_count": 1500,
      "view_count": 3500000000,
      "verified": true
    }
  }
}
```

Verify:
- [ ] Response status is 200
- [ ] `success: true` in response
- [ ] `cost_usd` is 0.001
- [ ] `subscriber_count` is a reasonable number (>0)
- [ ] `video_count` exists
- [ ] `view_count` exists

### 8. Test YouTube Videos

**Test Command:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "youtube_videos",
    "creator_id": "test-uuid-2",
    "youtube_handle": "@mkbhd"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "operation": "youtube_videos",
  "cost_usd": 0.001,
  "result": {
    "creator_id": "test-uuid-2",
    "youtube_handle": "@mkbhd",
    "scraped_count": 20,
    "filtered_count": 15,
    "saved_count": 9
  }
}
```

Verify:
- [ ] Response status is 200
- [ ] `success: true` in response
- [ ] `scraped_count` > 0
- [ ] `saved_count` > 0 (ideally 9 videos)

### 9. Test Google Trends

**Test Command:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "google_trends",
    "category": "beauty",
    "country": "ID",
    "timeframe": "now 7-d"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "operation": "google_trends",
  "cost_usd": 0.001,
  "result": {
    "category": "beauty",
    "trends_count": 15,
    "saved_count": 15
  }
}
```

Verify:
- [ ] Response status is 200
- [ ] `success: true` in response
- [ ] `trends_count` > 0
- [ ] `saved_count` > 0

### 10. Test Batch Processing

**Test Command:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "batch_youtube",
    "batch_creators": [
      {"creator_id": "test-uuid-3", "youtube_handle": "@mkbhd"},
      {"creator_id": "test-uuid-4", "youtube_handle": "@linustechtips"}
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "operation": "batch_youtube",
  "cost_usd": 0.002,
  "result": {
    "batch_size": 2,
    "processed": 2,
    "successful": 2,
    "failed": 0,
    "results": [...]
  }
}
```

Verify:
- [ ] Response status is 200
- [ ] `success: true` in response
- [ ] `batch_size` matches input (2)
- [ ] `processed` equals `batch_size`
- [ ] `successful` > 0

### 11. Test Error Handling

**Test Missing Fields:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "youtube_channel",
    "youtube_handle": "@mkbhd"
  }'
```

Verify:
- [ ] Response status is 400
- [ ] `success: false` in response
- [ ] Error message mentions "Missing required fields"

**Test Invalid Operation:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "invalid_operation"
  }'
```

Verify:
- [ ] Response status is 400
- [ ] `success: false` in response
- [ ] Error message mentions "Invalid operation"

**Test Unauthorized:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "youtube_channel",
    "creator_id": "test",
    "youtube_handle": "@test"
  }'
```

Verify:
- [ ] Response status is 401
- [ ] `success: false` in response
- [ ] Error message mentions "Unauthorized" or "Missing Authorization"

### 12. Test CORS

**Test Preflight:**
```bash
curl -X OPTIONS https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Origin: https://geovera.xyz" \
  -H "Access-Control-Request-Method: POST"
```

Verify:
- [ ] Response status is 200
- [ ] `Access-Control-Allow-Origin` header present
- [ ] `Access-Control-Allow-Methods` header includes POST

---

## Database Verification

### 13. Check Creator Updates (YouTube Channel Stats)

**Query:**
```sql
SELECT
  id,
  name,
  youtube_handle,
  follower_count,
  last_scraped_at
FROM gv_creators
WHERE id IN ('test-uuid-1', 'test-uuid-3', 'test-uuid-4')
ORDER BY last_scraped_at DESC;
```

Verify:
- [ ] Test creators exist in database
- [ ] `follower_count` updated with subscriber count
- [ ] `last_scraped_at` is recent (within last few minutes)

### 14. Check Creator Content (YouTube Videos)

**Query:**
```sql
SELECT
  creator_id,
  platform,
  post_id,
  caption,
  views,
  engagement_total,
  is_promo,
  is_giveaway,
  is_life_update,
  posted_at,
  analysis_status
FROM gv_creator_content
WHERE creator_id = 'test-uuid-2'
  AND platform = 'youtube'
ORDER BY posted_at DESC
LIMIT 10;
```

Verify:
- [ ] YouTube videos saved to database
- [ ] `platform` is 'youtube'
- [ ] `post_id` is populated (YouTube video ID)
- [ ] `caption` contains video title and description
- [ ] `views` is populated
- [ ] `is_promo`, `is_giveaway`, `is_life_update` are detected
- [ ] `analysis_status` is 'pending'

### 15. Check Trends (Google Trends)

**Query:**
```sql
SELECT
  trend_name,
  category,
  trend_type,
  status,
  growth_rate,
  discovery_source,
  first_detected_at
FROM gv_trends
WHERE category = 'beauty'
  AND discovery_source = 'serpapi'
ORDER BY first_detected_at DESC
LIMIT 10;
```

Verify:
- [ ] Trends saved to database
- [ ] `category` is 'beauty'
- [ ] `trend_type` is 'topic'
- [ ] `status` is 'rising' or 'peak'
- [ ] `growth_rate` is populated
- [ ] `discovery_source` is 'serpapi'

---

## Performance Verification

### 16. Check Response Times

Run all 4 operations and measure response time:

- [ ] YouTube Channel Stats: < 3s
- [ ] YouTube Videos: < 3s
- [ ] Google Trends: < 3s
- [ ] Batch (2 creators): < 5s

### 17. Check Error Rate

- [ ] No 500 errors in function logs
- [ ] No rate limit errors (429)
- [ ] No timeout errors (504)

---

## Cost Verification

### 18. Track First Day Costs

After running tests, verify costs:

**Manual Calculation:**
```
YouTube Channel Stats: 3 tests × $0.001 = $0.003
YouTube Videos: 1 test × $0.001 = $0.001
Google Trends: 1 test × $0.001 = $0.001
Batch Processing: 1 test (2 creators) × $0.002 = $0.002
Total: $0.007
```

Verify:
- [ ] SerpAPI dashboard shows ~6-8 requests
- [ ] Cost matches expected ($0.007)

### 19. Set Up Cost Monitoring

**Create Cost Tracking Table:**
```sql
CREATE TABLE IF NOT EXISTS gv_serpapi_cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  operation TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, operation)
);
```

Verify:
- [ ] Table created successfully

**Set Up Cost Alert:**
```sql
-- Query to check monthly cost
SELECT
  SUM(cost_usd) as current_month_cost,
  5.00 as monthly_budget,
  5.00 - SUM(cost_usd) as remaining_budget
FROM gv_serpapi_cost_tracking
WHERE date >= date_trunc('month', CURRENT_DATE);
```

Verify:
- [ ] Query runs without errors
- [ ] Returns expected structure

---

## Automation Setup

### 20. Set Up Weekly YouTube Scraping

**Option A: Supabase Cron (Recommended)**
```sql
SELECT cron.schedule(
  'weekly-youtube-scraping',
  '0 2 * * 1', -- Every Monday at 2 AM
  $$
  SELECT net.http_post(
    url := 'https://geovera.xyz/functions/v1/radar-orchestrator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"operation": "weekly_youtube_batch"}'::jsonb
  );
  $$
);
```

Verify:
- [ ] Cron job created successfully
- [ ] Listed in `SELECT * FROM cron.job;`

**Option B: External Cron (GitHub Actions)**
- [ ] Create `.github/workflows/radar-youtube-weekly.yml`
- [ ] Configure secrets in GitHub
- [ ] Test manual trigger

### 21. Set Up Daily Google Trends

**Supabase Cron:**
```sql
SELECT cron.schedule(
  'daily-trends-discovery',
  '0 1 * * *', -- Every day at 1 AM
  $$
  SELECT net.http_post(
    url := 'https://geovera.xyz/functions/v1/radar-orchestrator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"operation": "daily_trends_batch"}'::jsonb
  );
  $$
);
```

Verify:
- [ ] Cron job created successfully
- [ ] Listed in cron jobs

---

## Integration Testing

### 22. Test with Radar Pipeline

**Create a real creator with YouTube handle:**
```sql
INSERT INTO gv_creators (name, category, youtube_handle, follower_count, platform_primary)
VALUES ('Test Creator', 'beauty', '@tasya_farasya', 0, 'youtube');
```

**Run scraping:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "youtube_videos",
    "creator_id": "ACTUAL_CREATOR_ID",
    "youtube_handle": "@tasya_farasya"
  }'
```

Verify:
- [ ] Videos saved to `gv_creator_content`
- [ ] Can be queried by Content Studio
- [ ] Ready for analysis by `radar-analyze-content`

### 23. Test with Radar Analyze

**Trigger analysis on saved YouTube videos:**
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-analyze-content \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "creator_id": "ACTUAL_CREATOR_ID",
    "platform": "youtube"
  }'
```

Verify:
- [ ] Analysis runs successfully
- [ ] `content_quality_score` and `originality_score` populated
- [ ] `brand_mentions` extracted
- [ ] `analysis_status` updated to 'completed'

---

## Monitoring Setup

### 24. Set Up Logging

**Configure log retention:**
```bash
supabase functions log radar-scrape-serpapi --follow
```

Verify:
- [ ] Logs streaming in real-time
- [ ] Log format is readable
- [ ] Error logs clearly identifiable

### 25. Set Up Alerts

**Cost Alert (SQL Alert):**
```sql
-- Run daily to check if cost > 80% of budget
SELECT
  CASE
    WHEN SUM(cost_usd) > 4.00 THEN 'WARNING: 80% of budget used'
    ELSE 'OK'
  END as status
FROM gv_serpapi_cost_tracking
WHERE date >= date_trunc('month', CURRENT_DATE);
```

Verify:
- [ ] Alert query runs successfully
- [ ] Can be scheduled via Supabase cron

**Error Rate Alert:**
- [ ] Set up monitoring for 5xx errors
- [ ] Alert if error rate > 5%

---

## Documentation Verification

### 26. Update Team Documentation

- [ ] Add radar-scrape-serpapi to API documentation
- [ ] Update Radar feature README
- [ ] Add to deployment guide
- [ ] Share QUICK_START.md with team

### 27. Update Frontend Documentation

- [ ] Document new `platform: 'youtube'` in Content Studio
- [ ] Document Google Trends data structure
- [ ] Update API reference

---

## Final Checklist

### 28. Pre-Production Verification

- [ ] All tests passed (12/12)
- [ ] Database inserts working correctly
- [ ] Cost tracking accurate
- [ ] Performance within SLA (<3s per request)
- [ ] Error handling tested
- [ ] Automation configured
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Team notified

### 29. Production Readiness

- [ ] Staging tests passed
- [ ] Cost within budget ($2-3/month for 240 creators)
- [ ] No critical bugs found
- [ ] Integration with existing functions verified
- [ ] Rollback plan documented
- [ ] Support team trained

### 30. Go-Live

- [ ] Switch production traffic to new function
- [ ] Monitor logs for first 24 hours
- [ ] Check costs daily for first week
- [ ] Review data quality weekly for first month
- [ ] Collect user feedback

---

## Post-Deployment

### Week 1: Monitor Closely

- [ ] Check logs daily
- [ ] Review cost daily
- [ ] Verify data quality
- [ ] Address any errors immediately

### Week 2: Optimize

- [ ] Adjust batch sizes if needed
- [ ] Fine-tune filtering thresholds
- [ ] Optimize scraping frequency
- [ ] Review performance metrics

### Month 1: Review

- [ ] Compare actual costs vs projected
- [ ] Measure data quality vs Apify
- [ ] Collect team feedback
- [ ] Plan next improvements

---

## Rollback Procedure

If issues occur:

1. **Stop Automation**
   ```sql
   SELECT cron.unschedule('weekly-youtube-scraping');
   SELECT cron.unschedule('daily-trends-discovery');
   ```

2. **Switch Back to Apify**
   - Re-enable Apify for YouTube
   - Document issues found

3. **Root Cause Analysis**
   - Review logs
   - Identify failure point
   - Fix and redeploy

---

## Success Criteria

Function is considered successfully deployed when:

- ✅ All 12 tests pass
- ✅ Cost < $5/month for 240 creators
- ✅ Response time < 3s per request
- ✅ Error rate < 5%
- ✅ Data quality matches Apify
- ✅ Automation running smoothly
- ✅ No production incidents

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Verified By:** _____________
**Status:** ⏳ Pending Deployment

---

## Notes

Use this space to document any issues, observations, or deviations from the checklist during deployment:

```
[Add notes here]
```
