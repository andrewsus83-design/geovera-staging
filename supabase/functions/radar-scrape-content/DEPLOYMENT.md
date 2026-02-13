# Deployment Checklist: radar-scrape-content

## Prerequisites

Before deploying this function, ensure the following are complete:

### 1. Database Schema
- [ ] Apply migration: `20260213240000_radar_schema.sql`
- [ ] Verify tables exist:
  - `gv_creators`
  - `gv_creator_content`
- [ ] Check indexes are created
- [ ] Verify RLS policies are set

```bash
# Check if migration is applied
supabase db pull

# Or apply manually
supabase db push
```

### 2. Apify Account Setup
- [ ] Create Apify account at https://apify.com
- [ ] Generate API token (Settings → Integrations → API Token)
- [ ] Choose appropriate plan:
  - Free: 5 actor hours/month (testing only)
  - Starter: $49/month (100 hours) - recommended for staging
  - Scale: $499/month (1000 hours) - for production
- [ ] Test API token with a simple request

### 3. Environment Variables
- [ ] Set `APIFY_API_TOKEN` in Supabase

```bash
# Set the Apify token
supabase secrets set APIFY_API_TOKEN=apify_api_YOUR_TOKEN_HERE

# Verify it's set
supabase secrets list
```

### 4. Test Data
- [ ] Insert test creator(s) in `gv_creators` table
- [ ] Ensure creators have platform handles set

```sql
-- Example test creator
INSERT INTO gv_creators (
  id,
  name,
  category,
  country,
  instagram_handle,
  tiktok_handle,
  youtube_handle,
  follower_count,
  platform_primary,
  is_active
) VALUES (
  gen_random_uuid(),
  'Test Creator',
  'beauty',
  'ID',
  '@testcreator',
  '@testcreator',
  '@testcreator',
  500000,
  'instagram',
  true
);
```

## Deployment Steps

### Step 1: Deploy Function

```bash
# Navigate to project root
cd /Users/drew83/Desktop/geovera-staging

# Deploy the function
supabase functions deploy radar-scrape-content

# Expected output:
# Deploying radar-scrape-content (project ref: your-project-ref)
# Version: vX.Y.Z
# Deployed successfully in X.XXs
```

### Step 2: Verify Deployment

```bash
# List all functions
supabase functions list

# Should show:
# NAME                    VERSION  STATUS   REGIONS
# radar-scrape-content    vX.Y.Z   ACTIVE   [...]
```

### Step 3: Test in Production

```bash
# Get a test user token
# (Use Supabase dashboard or auth.signInWithPassword)

# Test Instagram scraping
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/radar-scrape-content' \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "creator_id": "YOUR_TEST_CREATOR_ID",
    "platform": "instagram"
  }'
```

### Step 4: Monitor Logs

```bash
# View real-time logs
supabase functions logs radar-scrape-content --tail

# Look for:
# ✅ "[radar-scrape-content] Scraping instagram for @handle"
# ✅ "[radar-scrape-content] Scraped X posts"
# ✅ "[radar-scrape-content] Filtered to Y posts"
# ✅ "[radar-scrape-content] Successfully saved Z posts"
```

### Step 5: Verify Data

```sql
-- Check if posts were inserted
SELECT
  c.name as creator_name,
  cc.platform,
  COUNT(*) as posts_scraped,
  MAX(cc.scraped_at) as last_scraped
FROM gv_creator_content cc
JOIN gv_creators c ON c.id = cc.creator_id
WHERE cc.scraped_at > NOW() - INTERVAL '1 hour'
GROUP BY c.name, cc.platform;

-- Check filtering results
SELECT
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE is_promo) as promo_filtered,
  COUNT(*) FILTER (WHERE is_giveaway) as giveaway_filtered,
  COUNT(*) FILTER (WHERE is_life_update) as life_update_filtered,
  COUNT(*) FILTER (WHERE NOT is_promo AND NOT is_giveaway AND NOT is_life_update) as quality_posts
FROM gv_creator_content
WHERE scraped_at > NOW() - INTERVAL '1 hour';
```

## Post-Deployment

### 1. Set Up Monitoring

Create a monitoring dashboard to track:

- **Success Rate**: % of successful scrapes
- **Average Posts Saved**: Should be ~9 per run
- **Error Rate**: Track 4xx and 5xx errors
- **Apify Usage**: Monitor actor hours consumed
- **Processing Time**: Average time per scrape

```sql
-- Create a monitoring view
CREATE OR REPLACE VIEW radar_scraping_stats AS
SELECT
  DATE(scraped_at) as scrape_date,
  platform,
  COUNT(DISTINCT creator_id) as unique_creators,
  COUNT(*) as total_posts,
  AVG(engagement_total) as avg_engagement,
  SUM(CASE WHEN is_promo THEN 1 ELSE 0 END) as promo_count,
  SUM(CASE WHEN is_giveaway THEN 1 ELSE 0 END) as giveaway_count,
  SUM(CASE WHEN is_life_update THEN 1 ELSE 0 END) as life_update_count
FROM gv_creator_content
WHERE scraped_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(scraped_at), platform
ORDER BY scrape_date DESC;
```

### 2. Set Up Alerts

Configure alerts for:

- [ ] Apify usage > 80% of monthly quota
- [ ] Error rate > 10%
- [ ] No posts scraped for 24 hours
- [ ] Timeout errors > 5 per hour

### 3. Cost Monitoring

```bash
# Check Apify usage daily
# https://console.apify.com/usage

# Expected costs:
# - Instagram: ~$0.50 per 50 creators
# - TikTok: ~$1.00 per 50 creators
# - YouTube: ~$0.75 per 50 creators
```

### 4. Schedule Regular Scraping

Create a cron job or scheduled function to scrape creators weekly:

```sql
-- Example: Create a job queue
INSERT INTO gv_radar_processing_queue (
  job_type,
  status,
  priority,
  category,
  creator_id,
  payload
)
SELECT
  'scrape_content',
  'pending',
  5,
  category,
  id,
  jsonb_build_object('platform', platform_primary)
FROM gv_creators
WHERE is_active = true
  AND (
    last_scraped_at IS NULL
    OR last_scraped_at < NOW() - INTERVAL '7 days'
  );
```

## Rollback Plan

If issues occur after deployment:

### Option 1: Redeploy Previous Version

```bash
# List function versions
supabase functions list

# Deploy specific version
supabase functions deploy radar-scrape-content --version vX.Y.Z
```

### Option 2: Disable Function

```bash
# Delete function temporarily
supabase functions delete radar-scrape-content

# Confirm deletion
# The function will stop accepting requests immediately
```

### Option 3: Update Environment Variables

```bash
# If Apify token is the issue
supabase secrets unset APIFY_API_TOKEN
supabase secrets set APIFY_API_TOKEN=new_token_here
```

## Performance Optimization

After deployment, monitor and optimize:

### 1. Batch Processing

Instead of scraping one creator at a time, batch process:

```typescript
// Batch scrape 10 creators concurrently
const creators = await getCreatorsToScrape(10);

await Promise.allSettled(
  creators.map(creator =>
    scrapeCreatorContent(creator.id, creator.platform_primary)
  )
);
```

### 2. Caching

Implement delta caching to avoid re-scraping unchanged content:

```sql
-- Store snapshot checksums
INSERT INTO gv_radar_snapshots (
  snapshot_type,
  snapshot_date,
  category,
  data,
  checksum
) VALUES (
  'content_metadata',
  CURRENT_DATE,
  'beauty',
  jsonb_build_object('post_ids', ARRAY[...]),
  md5(...)
);
```

### 3. Rate Limit Queue

Implement a queue to respect rate limits:

```typescript
// Process queue with delays
async function processQueue() {
  const jobs = await getQueuedJobs('scrape_content', 10);

  for (const job of jobs) {
    await scrapeCreatorContent(job.creator_id, job.payload.platform);
    await sleep(5000); // 5 second delay
  }
}
```

## Success Criteria

Deployment is successful when:

- ✅ Function deploys without errors
- ✅ Test scrape returns 200 status
- ✅ Posts are saved to `gv_creator_content`
- ✅ Filtering correctly removes promo/giveaway/life updates
- ✅ ~9 posts saved per run
- ✅ No authentication errors
- ✅ Logs show expected output
- ✅ Apify usage is tracked correctly

## Support

If you encounter issues:

1. Check function logs: `supabase functions logs radar-scrape-content`
2. Verify environment variables: `supabase secrets list`
3. Check Apify status: https://status.apify.com
4. Review database constraints and RLS policies
5. Contact Apify support if actor-specific issues occur

## Maintenance Schedule

- **Daily**: Check error logs
- **Weekly**: Review Apify usage and costs
- **Monthly**: Analyze scraping efficiency and adjust filters
- **Quarterly**: Review and update Apify actors to latest versions
