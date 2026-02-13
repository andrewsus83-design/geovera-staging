# Radar Scrape SerpAPI

**Cost-effective alternative to Apify for YouTube and Google Trends data scraping.**

## Overview

This Edge Function uses SerpAPI to scrape YouTube channel stats, video metadata, and Google Trends data at **20x lower cost** than Apify.

## Cost Comparison

| Service | Cost per Query | Use Case |
|---------|---------------|----------|
| **Apify** | $0.02 | Instagram, TikTok (high-quality scraping) |
| **SerpAPI** | $0.001 | YouTube, Google Trends (20x cheaper!) |

## Operations

### 1. YouTube Channel Stats

Get subscriber count, video count, and view count for a YouTube channel.

**Request:**
```json
{
  "operation": "youtube_channel",
  "creator_id": "uuid",
  "youtube_handle": "@channel"
}
```

**Response:**
```json
{
  "success": true,
  "operation": "youtube_channel",
  "cost_usd": 0.001,
  "result": {
    "creator_id": "uuid",
    "youtube_handle": "@channel",
    "stats": {
      "subscriber_count": 1500000,
      "video_count": 300,
      "view_count": 50000000,
      "description": "Channel description",
      "custom_url": "https://youtube.com/@channel",
      "verified": true
    }
  }
}
```

**Database Update:**
- Updates `gv_creators.follower_count` with subscriber count
- Updates `gv_creators.last_scraped_at`

---

### 2. YouTube Recent Videos

Scrape recent videos from a YouTube channel (up to 20).

**Request:**
```json
{
  "operation": "youtube_videos",
  "creator_id": "uuid",
  "youtube_handle": "@channel"
}
```

**Response:**
```json
{
  "success": true,
  "operation": "youtube_videos",
  "cost_usd": 0.001,
  "result": {
    "creator_id": "uuid",
    "youtube_handle": "@channel",
    "scraped_count": 20,
    "filtered_count": 15,
    "saved_count": 9
  }
}
```

**Filtering Logic:**
1. Remove promo/sponsored content
2. Remove giveaways
3. Remove life updates (vlogs, birthdays, etc.)
4. Keep top 30% by engagement (minimum 9 videos)

**Database Insert:**
- Inserts videos into `gv_creator_content` with `platform: 'youtube'`
- Upserts to avoid duplicates (unique on: creator_id, platform, post_id)

---

### 3. Google Trends

Get trending search queries for a category.

**Request:**
```json
{
  "operation": "google_trends",
  "category": "beauty",
  "country": "ID",
  "timeframe": "now 7-d"
}
```

**Response:**
```json
{
  "success": true,
  "operation": "google_trends",
  "cost_usd": 0.001,
  "result": {
    "category": "beauty",
    "country": "ID",
    "timeframe": "now 7-d",
    "trends_count": 15,
    "saved_count": 15
  }
}
```

**Trend Types Captured:**
- Rising queries (fast-growing searches)
- Top queries (highest volume searches)

**Database Insert:**
- Inserts trends into `gv_trends` table
- Status: "rising" for rising queries, "peak" for top queries

---

### 4. Batch YouTube Processing

Process multiple YouTube creators in a single request (cost-efficient).

**Request:**
```json
{
  "operation": "batch_youtube",
  "batch_creators": [
    {
      "creator_id": "uuid-1",
      "youtube_handle": "@creator1"
    },
    {
      "creator_id": "uuid-2",
      "youtube_handle": "@creator2"
    }
  ]
}
```

**Response:**
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
    "results": [
      {
        "creator_id": "uuid-1",
        "youtube_handle": "@creator1",
        "success": true,
        "stats": { ... }
      }
    ]
  }
}
```

**Use Case:**
- Weekly batch update for all YouTube creators
- More efficient than individual requests

---

## Scheduling Recommendations

| Operation | Frequency | Reason |
|-----------|-----------|--------|
| **YouTube Channel Stats** | Weekly | Subscriber count changes slowly |
| **YouTube Videos** | Weekly | YouTube posts less frequently than IG/TikTok |
| **Google Trends** | Daily | Trends change rapidly |
| **Batch YouTube** | Weekly | Cost-efficient batch processing |

---

## Category Mapping (Google Trends)

The function automatically maps categories to search queries:

| Category | Search Query |
|----------|--------------|
| beauty | "beauty products" |
| fashion | "fashion trends" |
| skincare | "skincare routine" |
| makeup | "makeup tutorial" |
| food | "food recipes" |
| fitness | "fitness workout" |

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `RATE_LIMIT_EXCEEDED` | SerpAPI rate limit hit | 429 |
| `TIMEOUT` | SerpAPI request timed out | 504 |
| `SERPAPI_FAILED` | Generic SerpAPI error | 500 |

---

## Environment Variables

Required in Supabase Edge Functions:

```bash
SERPAPI_KEY=your_serpapi_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALLOWED_ORIGIN=https://geovera.xyz
```

---

## SerpAPI Account Setup

1. Sign up at [https://serpapi.com](https://serpapi.com)
2. Get API key from dashboard
3. Choose plan based on usage:
   - **Free Plan:** 100 searches/month
   - **Starter:** $50/month (5,000 searches)
   - **Pro:** $150/month (30,000 searches)

**Cost Calculation:**
- 240 creators × 1 query/week = 960 queries/month
- Daily Google Trends: 7 categories × 30 days = 210 queries/month
- **Total:** ~1,200 queries/month = **$1.20/month** 🎉

Compare to Apify: 1,200 queries × $0.02 = **$24/month**

---

## Content Filtering

The function applies the same filtering as `radar-scrape-content`:

**Promo Detection Keywords:**
- sponsored, paid partnership, #ad, promo, advertisement
- diskon, discount, kode promo, link in bio, affiliate

**Giveaway Detection Keywords:**
- giveaway, free, gratis, menang, hadiah, kontes, lomba, win, prize

**Life Update Detection Keywords:**
- birthday, anniversary, vacation, liburan, family, keluarga, vlog, bts

**Filtering Goal:**
- Remove low-quality content
- Keep only genuine creator content
- Target ~30% of scraped posts (top engagement)

---

## Integration with Radar Pipeline

### YouTube Creator Discovery
```typescript
// After discovering creators with Perplexity
// Use SerpAPI to validate YouTube presence

const response = await fetch(
  'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operation: 'youtube_channel',
      creator_id: creator.id,
      youtube_handle: creator.youtube_handle
    })
  }
);
```

### Weekly Batch Update
```typescript
// Update all YouTube creators weekly
const creators = await supabase
  .from('gv_creators')
  .select('id, youtube_handle')
  .not('youtube_handle', 'is', null)
  .eq('platform_primary', 'youtube');

const response = await fetch(
  'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operation: 'batch_youtube',
      batch_creators: creators.data.map(c => ({
        creator_id: c.id,
        youtube_handle: c.youtube_handle
      }))
    })
  }
);
```

### Daily Trend Discovery
```typescript
// Run daily for each category
const categories = ['beauty', 'fashion', 'skincare', 'makeup'];

for (const category of categories) {
  await fetch(
    'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'google_trends',
        category,
        country: 'ID',
        timeframe: 'now 7-d'
      })
    }
  );
}
```

---

## Testing

### Test YouTube Channel
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "youtube_channel",
    "creator_id": "test-uuid",
    "youtube_handle": "@mkbhd"
  }'
```

### Test Google Trends
```bash
curl -X POST https://geovera.xyz/functions/v1/radar-scrape-serpapi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "google_trends",
    "category": "beauty",
    "country": "ID",
    "timeframe": "now 7-d"
  }'
```

---

## Deployment

```bash
cd supabase/functions
supabase functions deploy radar-scrape-serpapi

# Set secrets
supabase secrets set SERPAPI_KEY=your_key_here
```

---

## Database Schema

### Updates `gv_creators`
- `follower_count`: Subscriber count from YouTube
- `last_scraped_at`: Timestamp of last scrape
- `updated_at`: Timestamp of update

### Inserts to `gv_creator_content`
- All normalized YouTube videos
- Filtered by content quality
- Platform: 'youtube'

### Inserts to `gv_trends`
- Rising search queries
- Top search queries
- Status: 'rising' or 'peak'

---

## Advantages Over Apify

1. **20x Cheaper:** $0.001 vs $0.02 per query
2. **Batch-Friendly:** Process multiple creators in one request
3. **Google Trends:** Built-in trend discovery (not available in Apify)
4. **Faster:** Direct API calls, no actor spin-up time
5. **Simpler:** No dataset management, direct JSON response

---

## Limitations

1. **No Instagram/TikTok:** SerpAPI doesn't support these platforms well
2. **Limited Engagement Data:** YouTube API provides less engagement metrics
3. **Rate Limits:** Free plan has only 100 searches/month
4. **Historical Data:** Limited to recent content only

---

## Recommended Hybrid Approach

| Platform | Service | Frequency | Cost/Month |
|----------|---------|-----------|------------|
| Instagram | Apify | Daily | $14.40 (240 creators × 30 days × $0.02) |
| TikTok | Apify | Daily | $14.40 |
| YouTube | SerpAPI | Weekly | $0.96 (240 creators × 4 weeks × $0.001) |
| Google Trends | SerpAPI | Daily | $0.21 (7 categories × 30 days × $0.001) |
| **Total** | - | - | **$29.97/month** |

Compare to all-Apify: $43.20/month (45% savings!)

---

## Support

For SerpAPI documentation, visit:
- [SerpAPI YouTube Engine](https://serpapi.com/youtube-search-api)
- [SerpAPI Google Trends](https://serpapi.com/google-trends-api)
- [SerpAPI Documentation](https://serpapi.com/docs)
