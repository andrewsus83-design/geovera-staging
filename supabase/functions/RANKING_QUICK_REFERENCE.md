# Ranking Functions - Quick Reference

Fast reference guide for the three ranking calculation Edge Functions.

## Functions Overview

| Function | Purpose | Cost | Frequency |
|----------|---------|------|-----------|
| **radar-calculate-rankings** | Creator Mindshare rankings | Free | Daily |
| **radar-calculate-marketshare** | Brand visibility tracking | Free | Daily/Monthly |
| **radar-discover-trends** | Trend discovery & matching | $0.025/run | Daily |

## API Endpoints

### 1. Calculate Rankings

```bash
POST /functions/v1/radar-calculate-rankings
```

**Request:**
```json
{
  "category": "beauty",
  "force_update": false  // optional
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "total_creators": 342,
    "snapshots_created": 87,
    "rank_changes": [
      {
        "creator_id": "creator_123",
        "rank": 1,
        "previous_rank": 2,
        "change": 1,
        "trend": "rising"
      }
    ]
  }
}
```

### 2. Calculate Marketshare

```bash
POST /functions/v1/radar-calculate-marketshare
```

**Request:**
```json
{
  "category": "beauty",
  "date_range": {  // optional, defaults to last 30 days
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-01-31T23:59:59Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "total_brands": 156,
    "top_brands": [
      {
        "brand": "Wardah",
        "marketshare_percentage": 15.4,
        "total_reach": 8500000,
        "organic_mentions": 42,
        "paid_mentions": 8,
        "rank_position": 1,
        "rank_change": 0
      }
    ]
  }
}
```

### 3. Discover Trends

```bash
POST /functions/v1/radar-discover-trends
```

**Request:**
```json
{
  "category": "beauty"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "trends_discovered": 12,
    "trends_updated": 8,
    "active_trends": [
      {
        "trend_name": "GlowingSkin",
        "trend_type": "hashtag",
        "status": "rising",
        "estimated_reach": 2500000,
        "growth_rate": 0.85,
        "source": "perplexity"
      }
    ],
    "cost_usd": 0.025
  }
}
```

## Formulas

### Mindshare (Rankings)
```
weighted_score = total_reach × avg_quality_score × avg_originality_score
mindshare_percentage = (weighted_score / total_category_weighted_score) × 100
```

### Marketshare
```
brand_reach = SUM(post_reach WHERE brand_mentioned)
marketshare_percentage = (brand_reach / total_category_reach) × 100
```

### Trend Status
```
rising:    growth_rate > 50%
peak:      -20% ≤ growth_rate ≤ 50%
declining: growth_rate < -20%
expired:   no activity in 14 days
```

## Snapshot Frequency (Rankings)

| Rank Position | Update Frequency |
|---------------|------------------|
| 1 | Every 24 hours |
| 2-3 | Every 48 hours |
| 4-6 | Every 72 hours |
| 7-100 | Daily |
| 101-500 | Monthly |
| 501+ | No auto-update |

## Database Tables

### gv_creator_rankings
```sql
creator_id, category, rank_position, weighted_score,
mindshare_percentage, rank_change, rank_trend, updated_at
```

### gv_brand_marketshare
```sql
brand, category, marketshare_percentage, total_reach,
organic_mentions, paid_mentions, rank_position, date_start, date_end
```

### gv_trends
```sql
trend_id, trend_name, trend_type, status,
estimated_reach, growth_rate, source, metadata
```

### gv_trend_involvement
```sql
trend_id, creator_id, involvement_level, content_count
```

## Curl Examples

### Rankings
```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-calculate-rankings \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"category":"beauty"}'
```

### Marketshare (Last 7 Days)
```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-calculate-marketshare \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "date_range": {
      "start": "2025-01-24T00:00:00Z",
      "end": "2025-01-31T23:59:59Z"
    }
  }'
```

### Trends
```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-discover-trends \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"category":"beauty"}'
```

## Useful Queries

### Top 10 Creators
```sql
SELECT
  c.username,
  cr.rank_position,
  cr.mindshare_percentage,
  cr.rank_trend
FROM gv_creator_rankings cr
JOIN gv_creators c ON c.id = cr.creator_id
WHERE cr.category = 'beauty'
ORDER BY cr.rank_position ASC
LIMIT 10;
```

### Top 10 Brands
```sql
SELECT
  brand,
  marketshare_percentage,
  total_reach,
  organic_mentions,
  paid_mentions
FROM gv_brand_marketshare
WHERE category = 'beauty'
ORDER BY rank_position ASC
LIMIT 10;
```

### Rising Trends
```sql
SELECT
  trend_name,
  trend_type,
  growth_rate,
  estimated_reach
FROM gv_trends
WHERE category = 'beauty'
  AND status = 'rising'
ORDER BY growth_rate DESC
LIMIT 10;
```

### Creators Leading a Trend
```sql
SELECT
  c.username,
  ti.involvement_level,
  ti.content_count
FROM gv_trend_involvement ti
JOIN gv_creators c ON c.id = ti.creator_id
WHERE ti.trend_id = 'beauty_glowingskin'
  AND ti.involvement_level = 'high'
ORDER BY c.total_reach DESC;
```

## Deployment

```bash
# Deploy all three functions
./deploy-ranking-functions.sh

# Or deploy individually
supabase functions deploy radar-calculate-rankings
supabase functions deploy radar-calculate-marketshare
supabase functions deploy radar-discover-trends
```

## Testing

```bash
# Run test suite
./test-ranking-functions.ts

# Test individual function
supabase functions invoke radar-calculate-rankings \
  --data '{"category":"beauty"}'
```

## Environment Variables

```bash
# Required for all functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for radar-discover-trends
PERPLEXITY_API_KEY=your-perplexity-key
SERPAPI_API_KEY=your-serpapi-key

# Set secrets
supabase secrets set PERPLEXITY_API_KEY=your-key
supabase secrets set SERPAPI_API_KEY=your-key
```

## Cron Schedule (Daily)

```sql
-- 2 AM UTC: Rankings
SELECT cron.schedule('daily-rankings-beauty', '0 2 * * *', $$ ... $$);

-- 3 AM UTC: Marketshare
SELECT cron.schedule('daily-marketshare-beauty', '0 3 * * *', $$ ... $$);

-- 4 AM UTC: Trends
SELECT cron.schedule('daily-trends-beauty', '0 4 * * *', $$ ... $$);
```

## Cost Estimate

```
Rankings:       Free
Marketshare:    Free
Trends:         $0.025/run × 30 days × 5 categories = $3.75/month

Total:          ~$3.75/month
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No rankings generated | Run content analysis first |
| Empty marketshare | Check brand_mentions in content |
| Trends not found | Verify API keys are set |
| High costs | Reduce trend discovery frequency |

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Missing required field (category) |
| 405 | Method not allowed (use POST) |
| 500 | Internal server error |

## Next Steps

1. Deploy functions: `./deploy-ranking-functions.sh`
2. Test functions: `./test-ranking-functions.ts`
3. Set up cron jobs for automation
4. Query results from database
5. Build frontend dashboards

## Documentation

- **Full Guide**: `RANKING_FUNCTIONS_GUIDE.md`
- **Rankings README**: `radar-calculate-rankings/README.md`
- **Marketshare README**: `radar-calculate-marketshare/README.md`
- **Trends README**: `radar-discover-trends/README.md`
