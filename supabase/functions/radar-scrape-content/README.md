# Radar Scrape Content Edge Function

## Overview
This Edge Function scrapes social media content from creators using Apify actors. It fetches recent posts from Instagram, TikTok, or YouTube, filters out promotional/giveaway/life update content, and stores high-quality posts for analysis.

## Features
- Multi-platform scraping (Instagram, TikTok, YouTube)
- Apify actor integration with proper error handling
- Content filtering (removes promo, giveaway, life updates)
- Engagement-based post selection (~30% of filtered posts)
- Automatic deduplication via upsert
- Rate limit handling
- Timeout protection
- Cost-efficient scraping (30 posts per run)

## Environment Variables

Set the following environment variables in your Supabase project:

```bash
APIFY_API_TOKEN=apify_api_...    # Required: Your Apify API token
SUPABASE_URL=https://...         # Auto-set by Supabase
SUPABASE_SERVICE_ROLE_KEY=...    # Auto-set by Supabase
ALLOWED_ORIGIN=https://geovera.xyz  # Optional: CORS origin
```

## Apify Actors Used

- **Instagram**: `apify/instagram-scraper`
- **TikTok**: `apify/tiktok-scraper`
- **YouTube**: `apify/youtube-scraper`

### Scraping Configuration

- **Posts limit**: 30 (last 30 posts per creator)
- **Timeout**: 5 minutes per scraping job
- **Memory**: 2048 MB per actor run
- **Data extracted**:
  - Caption/description
  - Hashtags
  - Likes, comments, shares, saves
  - Views (TikTok, YouTube)
  - Posted timestamp
  - Post URL

## Content Filtering

The function applies three-layer filtering to ensure quality:

### 1. Promo Detection
Filters out sponsored/paid content:
```typescript
Keywords: 'sponsored', 'paid partnership', '#ad', 'promo',
'diskon', 'discount', 'kode promo', 'link in bio', 'affiliate'
```

### 2. Giveaway Detection
Filters out giveaway/contest posts:
```typescript
Keywords: 'giveaway', 'free', 'gratis', 'menang', 'hadiah',
'kontes', 'lomba', 'win', 'prize', 'contest'
```

### 3. Life Update Detection
Filters out personal/lifestyle posts:
```typescript
Keywords: 'birthday', 'anniversary', 'vacation', 'liburan',
'family', 'keluarga', 'personal', 'vlog', 'wedding'
```

### Selection Strategy
1. Remove all promo/giveaway/life update posts
2. Sort remaining posts by engagement (likes + comments + shares)
3. Select top ~30% (minimum 9 posts)

## API Endpoint

### POST /radar-scrape-content

Scrape content from a specific creator's platform.

#### Request Headers
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "creator_id": "uuid",                    // Required: Creator UUID from gv_creators
  "platform": "instagram"                  // Required: 'instagram' | 'tiktok' | 'youtube'
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "creator_id": "uuid",
  "creator_name": "Creator Name",
  "platform": "instagram",
  "handle": "@creatorhandle",
  "scraped_count": 30,                     // Total posts fetched
  "filtered_count": 18,                    // Posts after filtering
  "saved_count": 9,                        // Posts saved to database
  "summary": {
    "removed_promo": 8,
    "removed_giveaway": 3,
    "removed_life_update": 1
  }
}
```

#### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "success": false,
  "error": "Missing required fields: creator_id, platform"
}
```

**400 Bad Request - No Handle**
```json
{
  "success": false,
  "error": "No instagram handle found for this creator",
  "code": "HANDLE_NOT_FOUND"
}
```

**404 Not Found - Creator Missing**
```json
{
  "success": false,
  "error": "Creator not found",
  "code": "CREATOR_NOT_FOUND"
}
```

**429 Rate Limit**
```json
{
  "success": false,
  "error": "Apify rate limit exceeded. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**504 Timeout**
```json
{
  "success": false,
  "error": "Scraping timeout. The platform may be slow or unreachable.",
  "code": "TIMEOUT"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Scraping failed",
  "code": "SCRAPING_FAILED"
}
```

## Usage Examples

### JavaScript/TypeScript
```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/radar-scrape-content', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    creator_id: 'creator-uuid',
    platform: 'instagram'
  })
});

const data = await response.json();
console.log(`Saved ${data.saved_count} posts for ${data.creator_name}`);
```

### cURL
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/radar-scrape-content' \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "creator_id": "creator-uuid",
    "platform": "tiktok"
  }'
```

### Batch Scraping
```typescript
// Scrape all platforms for a creator
const platforms = ['instagram', 'tiktok', 'youtube'];

for (const platform of platforms) {
  await fetch('https://your-project.supabase.co/functions/v1/radar-scrape-content', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creator_id: 'creator-uuid',
      platform
    })
  });

  // Wait 5 seconds between platforms to avoid rate limits
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

## Database Schema

### Tables Used

#### gv_creators (Read)
Source table for creator information.

```sql
CREATE TABLE gv_creators (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  last_scraped_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### gv_creator_content (Write)
Target table for scraped content.

```sql
CREATE TABLE gv_creator_content (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES gv_creators(id),
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'facebook')),
  post_id TEXT NOT NULL,
  post_url TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT[],
  posted_at TIMESTAMPTZ,
  reach INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  views INTEGER,
  engagement_total INTEGER,             -- likes + comments + shares + saves
  is_promo BOOLEAN DEFAULT false,
  is_giveaway BOOLEAN DEFAULT false,
  is_life_update BOOLEAN DEFAULT false,
  content_quality_score NUMERIC(3,2),  -- Filled by analysis function
  originality_score NUMERIC(3,2),      -- Filled by analysis function
  brand_mentions JSONB DEFAULT '[]',
  scraped_at TIMESTAMPTZ DEFAULT now(),
  analyzed_at TIMESTAMPTZ,
  analysis_status TEXT DEFAULT 'pending',
  UNIQUE(creator_id, platform, post_id)
);
```

## Security

### Authentication
- Requires valid Supabase user JWT token
- Service role used for database operations

### Rate Limiting
- Apify enforces rate limits per account tier
- Function handles 429 errors gracefully
- Recommended: Wait 5 seconds between scraping calls

### Data Privacy
- Only public social media data is scraped
- No private/restricted content access
- Complies with platform terms of service

## Cost Management

### Apify Costs
- **Free tier**: 5 actor hours/month
- **Starter**: $49/month (100 actor hours)
- **Scale**: $499/month (1000 actor hours)

### Cost Per Scrape (Estimated)
- **Instagram**: ~0.01 actor hours (30 posts)
- **TikTok**: ~0.02 actor hours (30 posts)
- **YouTube**: ~0.015 actor hours (30 posts)

### Optimization Tips
1. Scrape creators once per week (not daily)
2. Use batch processing during off-peak hours
3. Monitor Apify usage dashboard
4. Set alerts for 80% quota usage
5. Cache results in `gv_radar_snapshots` table

## Deployment

### Deploy Function
```bash
supabase functions deploy radar-scrape-content
```

### Set Environment Variables
```bash
supabase secrets set APIFY_API_TOKEN=apify_api_...
```

### Verify Deployment
```bash
supabase functions list
```

## Testing

### Test Locally
```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve radar-scrape-content --env-file .env.local

# Test with curl
curl -X POST 'http://localhost:54321/functions/v1/radar-scrape-content' \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"creator_id": "test-uuid", "platform": "instagram"}'
```

### Test in Production
```typescript
// Use a test creator first
const testCreatorId = 'your-test-creator-uuid';

const response = await fetch('https://your-project.supabase.co/functions/v1/radar-scrape-content', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    creator_id: testCreatorId,
    platform: 'instagram'
  })
});

console.log(await response.json());
```

## Migration

Apply the database migration before deploying:

```bash
supabase db push
```

Or manually apply the migration file:
```
supabase/migrations/20260213240000_radar_schema.sql
```

## Monitoring

### Check Logs
```bash
# View real-time logs
supabase functions logs radar-scrape-content --tail

# View recent logs
supabase functions logs radar-scrape-content
```

### Key Metrics to Monitor
1. **Success rate**: % of successful scrapes
2. **Average posts saved**: Should be ~9 per run
3. **Filter efficiency**: % of posts filtered out
4. **Error types**: Rate limits, timeouts, missing handles
5. **Apify usage**: Track monthly actor hours

### Query Performance
```sql
-- Check recent scraping activity
SELECT
  creator_id,
  platform,
  COUNT(*) as posts_scraped,
  MAX(scraped_at) as last_scraped
FROM gv_creator_content
WHERE scraped_at > NOW() - INTERVAL '7 days'
GROUP BY creator_id, platform
ORDER BY last_scraped DESC;

-- Check filtering effectiveness
SELECT
  COUNT(*) FILTER (WHERE is_promo) as promo_count,
  COUNT(*) FILTER (WHERE is_giveaway) as giveaway_count,
  COUNT(*) FILTER (WHERE is_life_update) as life_update_count,
  COUNT(*) FILTER (WHERE NOT is_promo AND NOT is_giveaway AND NOT is_life_update) as quality_count
FROM gv_creator_content
WHERE scraped_at > NOW() - INTERVAL '7 days';
```

## Troubleshooting

### "Apify API token not configured"
- Set the secret: `supabase secrets set APIFY_API_TOKEN=apify_api_...`
- Verify: `supabase secrets list`

### "Creator not found"
- Verify creator exists in `gv_creators` table
- Check creator_id is correct UUID

### "No instagram handle found for this creator"
- Ensure creator has platform handle set in database
- Update creator: `UPDATE gv_creators SET instagram_handle = '@handle' WHERE id = 'uuid'`

### Rate Limit Exceeded
- Check Apify dashboard for usage
- Upgrade Apify plan if needed
- Implement exponential backoff in caller

### Timeout Errors
- Platform might be experiencing issues
- Try again after 5 minutes
- Check Apify status page

### No Posts Returned
- Creator might have private account
- Handle might be incorrect
- Creator might have no recent posts

## Best Practices

1. **Scheduling**: Scrape creators once per week
2. **Batch Processing**: Process 10 creators at a time with 5-second delays
3. **Error Handling**: Retry failed scrapes once after 5 minutes
4. **Data Validation**: Check if handle exists before scraping
5. **Cost Control**: Monitor Apify usage daily

## Integration with Radar Pipeline

This function is part of the larger Radar feature:

```
1. Discover Creators (Perplexity)
   ↓
2. → Scrape Content (THIS FUNCTION) ←
   ↓
3. Analyze Content (Claude)
   ↓
4. Calculate Rankings (Mindshare)
   ↓
5. Calculate Marketshare
   ↓
6. Discover Trends
```

### Orchestration Example
```typescript
// Scrape all creators in a category
const { data: creators } = await supabase
  .from('gv_creators')
  .select('id, name, category')
  .eq('category', 'beauty')
  .eq('is_active', true);

for (const creator of creators) {
  // Scrape primary platform
  const platform = creator.platform_primary || 'instagram';

  await fetch('https://your-project.supabase.co/functions/v1/radar-scrape-content', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creator_id: creator.id,
      platform
    })
  });

  // Wait 5 seconds between creators
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

## Future Enhancements

Potential improvements:
1. Add Facebook scraping support
2. Implement incremental scraping (only new posts)
3. Add post image/video download option
4. Support custom filtering rules per category
5. Add webhook notifications on completion
6. Implement parallel scraping with rate limit queue
7. Add sentiment analysis during scraping
