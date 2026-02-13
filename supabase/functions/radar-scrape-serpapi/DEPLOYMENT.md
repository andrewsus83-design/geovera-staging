# Deployment Guide: radar-scrape-serpapi

## Prerequisites

1. **SerpAPI Account**
   - Sign up at [https://serpapi.com](https://serpapi.com)
   - Get your API key from the dashboard
   - Choose a plan (Free: 100 searches/month, Starter: $50/month for 5,000 searches)

2. **Supabase Project**
   - Access to Supabase CLI
   - Service role key
   - Database migrations applied (radar_schema.sql)

---

## Step 1: Set Environment Variables

Add your SerpAPI key to Supabase secrets:

```bash
# Navigate to project root
cd /Users/drew83/Desktop/geovera-staging

# Set SerpAPI key
supabase secrets set SERPAPI_KEY=your_serpapi_key_here

# Verify other required secrets exist
supabase secrets list
```

**Required Secrets:**
- `SERPAPI_KEY` - Your SerpAPI API key
- `SUPABASE_URL` - Your Supabase project URL (auto-configured)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (auto-configured)
- `ALLOWED_ORIGIN` - Set to `https://geovera.xyz`

---

## Step 2: Deploy the Function

```bash
cd supabase/functions

# Deploy to Supabase
supabase functions deploy radar-scrape-serpapi

# Expected output:
# Deploying radar-scrape-serpapi (project ref: <your-ref>)
# Bundled radar-scrape-serpapi in <time>
# radar-scrape-serpapi deployed successfully
```

---

## Step 3: Verify Deployment

### Test YouTube Channel Stats

```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "youtube_channel",
    "creator_id": "test-uuid",
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
    "creator_id": "test-uuid",
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

### Test Google Trends

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

---

## Step 4: Database Verification

Verify data is being saved correctly:

```sql
-- Check creator updates (YouTube channel stats)
SELECT
  id,
  name,
  youtube_handle,
  follower_count,
  last_scraped_at
FROM gv_creators
WHERE youtube_handle IS NOT NULL
ORDER BY last_scraped_at DESC
LIMIT 10;

-- Check creator content (YouTube videos)
SELECT
  creator_id,
  platform,
  post_id,
  caption,
  views,
  engagement_total,
  posted_at
FROM gv_creator_content
WHERE platform = 'youtube'
ORDER BY posted_at DESC
LIMIT 10;

-- Check trends (Google Trends data)
SELECT
  trend_name,
  category,
  status,
  growth_rate,
  first_detected_at
FROM gv_trends
WHERE discovery_source = 'serpapi'
ORDER BY first_detected_at DESC
LIMIT 10;
```

---

## Step 5: Set Up Automated Workflows

### Option A: Supabase Cron Jobs (Recommended)

Create scheduled jobs using pg_cron:

```sql
-- Weekly YouTube creator updates (every Monday at 2 AM)
SELECT cron.schedule(
  'weekly-youtube-scraping',
  '0 2 * * 1', -- Every Monday at 2 AM
  $$
  SELECT net.http_post(
    url := 'https://geovera.xyz/functions/v1/radar-orchestrator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
    body := '{"operation": "weekly_youtube_batch"}'::jsonb
  );
  $$
);

-- Daily Google Trends discovery (every day at 1 AM)
SELECT cron.schedule(
  'daily-trends-discovery',
  '0 1 * * *', -- Every day at 1 AM
  $$
  SELECT net.http_post(
    url := 'https://geovera.xyz/functions/v1/radar-orchestrator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
    body := '{"operation": "daily_trends_batch"}'::jsonb
  );
  $$
);
```

### Option B: External Cron Service

Use a service like GitHub Actions, Vercel Cron, or cron-job.org:

```yaml
# .github/workflows/radar-youtube-weekly.yml
name: Weekly YouTube Scraping

on:
  schedule:
    - cron: '0 2 * * 1' # Every Monday at 2 AM UTC

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger YouTube Batch
        run: |
          curl -X POST https://geovera.xyz/functions/v1/radar-orchestrator \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"operation": "weekly_youtube_batch"}'
```

---

## Step 6: Cost Monitoring

### Set Up Cost Alerts

Create a function to monitor SerpAPI usage:

```sql
-- Create cost tracking table
CREATE TABLE IF NOT EXISTS gv_serpapi_cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  operation TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, operation)
);

-- Update cost tracking (call from Edge Function)
CREATE OR REPLACE FUNCTION track_serpapi_cost(
  p_operation TEXT,
  p_cost_usd NUMERIC
) RETURNS void AS $$
BEGIN
  INSERT INTO gv_serpapi_cost_tracking (date, operation, request_count, cost_usd)
  VALUES (CURRENT_DATE, p_operation, 1, p_cost_usd)
  ON CONFLICT (date, operation)
  DO UPDATE SET
    request_count = gv_serpapi_cost_tracking.request_count + 1,
    cost_usd = gv_serpapi_cost_tracking.cost_usd + p_cost_usd;
END;
$$ LANGUAGE plpgsql;
```

### Query Monthly Cost

```sql
-- Get current month cost
SELECT
  operation,
  SUM(request_count) as total_requests,
  SUM(cost_usd) as total_cost
FROM gv_serpapi_cost_tracking
WHERE date >= date_trunc('month', CURRENT_DATE)
GROUP BY operation
ORDER BY total_cost DESC;

-- Compare to budget
SELECT
  SUM(cost_usd) as current_month_cost,
  5.00 as monthly_budget,
  5.00 - SUM(cost_usd) as remaining_budget,
  (SUM(cost_usd) / 5.00 * 100)::numeric(5,2) as budget_used_percent
FROM gv_serpapi_cost_tracking
WHERE date >= date_trunc('month', CURRENT_DATE);
```

---

## Step 7: Integration with Radar Pipeline

Update the radar orchestrator to use SerpAPI for YouTube:

```typescript
// In radar-orchestrator or similar
async function processYouTubeCreators() {
  // Get creators that need YouTube updates
  const { data: creators } = await supabase
    .from('gv_creators')
    .select('id, youtube_handle')
    .not('youtube_handle', 'is', null)
    .or('last_scraped_at.is.null,last_scraped_at.lt.' + sevenDaysAgo);

  // Use batch processing for efficiency
  const batchSize = 50;
  for (let i = 0; i < creators.length; i += batchSize) {
    const batch = creators.slice(i, i + batchSize);

    await fetch('https://geovera.xyz/functions/v1/radar-scrape-serpapi', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'batch_youtube',
        batch_creators: batch.map(c => ({
          creator_id: c.id,
          youtube_handle: c.youtube_handle
        }))
      })
    });
  }
}
```

---

## Troubleshooting

### Issue: "SerpAPI key not configured"

**Solution:**
```bash
# Verify secrets are set
supabase secrets list

# Set the key again if missing
supabase secrets set SERPAPI_KEY=your_key_here

# Redeploy the function
supabase functions deploy radar-scrape-serpapi
```

---

### Issue: Rate Limit Exceeded (429)

**Solution:**
1. Check your SerpAPI plan limits
2. Implement request throttling
3. Upgrade your SerpAPI plan if needed

```typescript
// Add rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

for (const creator of creators) {
  await scrapeYouTube(creator);
  await delay(100); // 100ms delay between requests
}
```

---

### Issue: Database Insert Errors

**Solution:**
Check if the radar schema is applied:

```sql
-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('gv_creators', 'gv_creator_content', 'gv_trends');

-- If missing, run migration
-- psql -f supabase/migrations/20260213240000_radar_schema.sql
```

---

### Issue: Missing YouTube Handle

**Solution:**
Ensure creators have YouTube handles populated:

```sql
-- Check for missing handles
SELECT id, name, youtube_handle
FROM gv_creators
WHERE platform_primary = 'youtube'
  AND youtube_handle IS NULL;

-- Manually update if needed
UPDATE gv_creators
SET youtube_handle = '@actual_handle'
WHERE id = 'creator-uuid';
```

---

## Monitoring & Logging

### View Edge Function Logs

```bash
# Stream logs in real-time
supabase functions log radar-scrape-serpapi --follow

# View last 100 logs
supabase functions log radar-scrape-serpapi --limit 100
```

### Key Metrics to Monitor

1. **Request Success Rate**
   - Target: >95%
   - Alert if: <90%

2. **Average Response Time**
   - Target: <2s per request
   - Alert if: >5s

3. **Monthly Cost**
   - Budget: $5/month
   - Alert if: >$4 (80% of budget)

4. **Data Quality**
   - Check for missing fields
   - Validate subscriber counts are reasonable
   - Verify trends are saving correctly

---

## Rollback Plan

If issues occur after deployment:

```bash
# 1. Check previous deployments
supabase functions list

# 2. Rollback to previous version (if available)
supabase functions deploy radar-scrape-serpapi --version <previous-version>

# 3. Or restore from backup
# (Supabase automatically keeps function versions)

# 4. Verify rollback
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"operation": "youtube_channel", "creator_id": "test", "youtube_handle": "@test"}'
```

---

## Post-Deployment Checklist

- [ ] SerpAPI key configured and verified
- [ ] Function deployed successfully
- [ ] Test YouTube channel stats endpoint
- [ ] Test YouTube videos endpoint
- [ ] Test Google Trends endpoint
- [ ] Test batch processing endpoint
- [ ] Database inserts working correctly
- [ ] Cost tracking enabled
- [ ] Automated workflows scheduled
- [ ] Monitoring and alerting configured
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## Next Steps

1. **Week 1:** Monitor closely for errors and performance
2. **Week 2:** Optimize batch sizes based on actual performance
3. **Week 3:** Review cost vs. budget and adjust scraping frequency
4. **Week 4:** Analyze data quality and adjust filtering logic if needed

---

## Support

- **SerpAPI Documentation:** [https://serpapi.com/docs](https://serpapi.com/docs)
- **Supabase Edge Functions:** [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **Internal Team:** Contact @radar-team on Slack

---

## Success Criteria

✅ Function deployed without errors
✅ Successfully scraping YouTube channel stats
✅ Successfully scraping YouTube videos
✅ Successfully discovering Google Trends
✅ Data saving correctly to database
✅ Cost within budget ($5/month)
✅ Automated workflows running on schedule
✅ No critical errors in production

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Version:** v1.0.0
**Status:** 🟢 Ready for Production
