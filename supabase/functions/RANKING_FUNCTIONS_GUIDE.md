# Ranking & Analytics Functions - Deployment Guide

Complete guide for deploying and using the three ranking calculation Edge Functions.

## Overview

Three Edge Functions that provide comprehensive ranking and analytics capabilities:

1. **radar-calculate-rankings**: Calculate creator Mindshare rankings
2. **radar-calculate-marketshare**: Calculate brand Marketshare from mentions
3. **radar-discover-trends**: Discover trending topics and track creator involvement

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Content Analysis Pipeline                │
│                                                               │
│  radar-analyze-content → Scores content quality/originality  │
│           ↓                                                   │
│  radar-calculate-rankings → Calculates Mindshare %           │
│           ↓                                                   │
│  radar-calculate-marketshare → Brand visibility tracking     │
│           ↓                                                   │
│  radar-discover-trends → Trend discovery & matching          │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Database Tables

Required tables must exist before deployment:

```sql
-- Creator rankings table
CREATE TABLE IF NOT EXISTS gv_creator_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id TEXT NOT NULL REFERENCES gv_creators(id),
  category TEXT NOT NULL,
  rank_position INTEGER NOT NULL,
  weighted_score NUMERIC NOT NULL,
  mindshare_percentage NUMERIC NOT NULL,
  total_reach BIGINT NOT NULL,
  avg_quality_score NUMERIC NOT NULL,
  avg_originality_score NUMERIC NOT NULL,
  content_count INTEGER NOT NULL,
  rank_change INTEGER DEFAULT 0,
  rank_trend TEXT CHECK (rank_trend IN ('rising', 'stable', 'falling')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creator_rankings_category ON gv_creator_rankings(category);
CREATE INDEX idx_creator_rankings_rank ON gv_creator_rankings(rank_position);
CREATE INDEX idx_creator_rankings_updated ON gv_creator_rankings(updated_at DESC);
CREATE UNIQUE INDEX idx_creator_rankings_unique ON gv_creator_rankings(creator_id, category, updated_at);

-- Brand marketshare table
CREATE TABLE IF NOT EXISTS gv_brand_marketshare (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  marketshare_percentage NUMERIC NOT NULL,
  total_reach BIGINT NOT NULL,
  total_engagement BIGINT NOT NULL,
  organic_mentions INTEGER DEFAULT 0,
  paid_mentions INTEGER DEFAULT 0,
  total_mentions INTEGER NOT NULL,
  rank_position INTEGER NOT NULL,
  rank_change INTEGER DEFAULT 0,
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_marketshare_category ON gv_brand_marketshare(category);
CREATE INDEX idx_brand_marketshare_rank ON gv_brand_marketshare(rank_position);
CREATE INDEX idx_brand_marketshare_date ON gv_brand_marketshare(date_start, date_end);
CREATE UNIQUE INDEX idx_brand_marketshare_unique ON gv_brand_marketshare(brand, category, date_start, date_end);

-- Trends table
CREATE TABLE IF NOT EXISTS gv_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  trend_name TEXT NOT NULL,
  trend_type TEXT CHECK (trend_type IN ('hashtag', 'challenge', 'product', 'topic')),
  status TEXT CHECK (status IN ('rising', 'peak', 'declining', 'expired')),
  estimated_reach BIGINT DEFAULT 0,
  growth_rate NUMERIC DEFAULT 0,
  source TEXT CHECK (source IN ('perplexity', 'youtube', 'google_trends')),
  metadata JSONB DEFAULT '{}',
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trends_category ON gv_trends(category);
CREATE INDEX idx_trends_status ON gv_trends(status);
CREATE INDEX idx_trends_growth ON gv_trends(growth_rate DESC);
CREATE UNIQUE INDEX idx_trends_unique ON gv_trends(trend_name, category);

-- Trend involvement table
CREATE TABLE IF NOT EXISTS gv_trend_involvement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id TEXT NOT NULL REFERENCES gv_trends(trend_id),
  creator_id TEXT NOT NULL REFERENCES gv_creators(id),
  involvement_level TEXT CHECK (involvement_level IN ('high', 'medium', 'low')),
  content_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trend_involvement_trend ON gv_trend_involvement(trend_id);
CREATE INDEX idx_trend_involvement_creator ON gv_trend_involvement(creator_id);
CREATE INDEX idx_trend_involvement_level ON gv_trend_involvement(involvement_level);
CREATE UNIQUE INDEX idx_trend_involvement_unique ON gv_trend_involvement(trend_id, creator_id);
```

### Environment Variables

```bash
# Required for all functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for radar-discover-trends only
PERPLEXITY_API_KEY=your-perplexity-api-key
SERPAPI_API_KEY=your-serpapi-api-key
```

## Deployment

### Step 1: Set Environment Variables

```bash
# Navigate to project directory
cd /Users/drew83/Desktop/geovera-staging

# Set secrets
supabase secrets set PERPLEXITY_API_KEY=your-perplexity-key
supabase secrets set SERPAPI_API_KEY=your-serpapi-key
```

### Step 2: Deploy Functions

```bash
# Deploy all three functions
supabase functions deploy radar-calculate-rankings
supabase functions deploy radar-calculate-marketshare
supabase functions deploy radar-discover-trends
```

### Step 3: Verify Deployment

```bash
# Test rankings function
supabase functions invoke radar-calculate-rankings \
  --data '{"category":"beauty"}'

# Test marketshare function
supabase functions invoke radar-calculate-marketshare \
  --data '{"category":"beauty"}'

# Test trends function
supabase functions invoke radar-discover-trends \
  --data '{"category":"beauty"}'
```

## Usage Workflow

### Complete Analytics Pipeline

```typescript
// Step 1: Analyze content (prerequisite)
await fetch("https://your-project.supabase.co/functions/v1/radar-analyze-content", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    batch: true,
    category: "beauty",
  }),
});

// Step 2: Calculate creator rankings
const rankingsResponse = await fetch(
  "https://your-project.supabase.co/functions/v1/radar-calculate-rankings",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: "beauty" }),
  }
);

const rankings = await rankingsResponse.json();
console.log(`Top creator rank changes:`, rankings.result.rank_changes);

// Step 3: Calculate brand marketshare
const marketshareResponse = await fetch(
  "https://your-project.supabase.co/functions/v1/radar-calculate-marketshare",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: "beauty" }),
  }
);

const marketshare = await marketshareResponse.json();
console.log(`Top brands:`, marketshare.result.top_brands.slice(0, 5));

// Step 4: Discover trends
const trendsResponse = await fetch(
  "https://your-project.supabase.co/functions/v1/radar-discover-trends",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: "beauty" }),
  }
);

const trends = await trendsResponse.json();
console.log(`Rising trends:`, trends.result.active_trends.filter(t => t.status === "rising"));
```

## Automation with Cron Jobs

### Supabase Cron (pg_cron)

```sql
-- Daily rankings calculation at 2 AM UTC
SELECT cron.schedule(
  'daily-rankings-beauty',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/radar-calculate-rankings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{"category": "beauty"}'::jsonb
  );
  $$
);

-- Daily marketshare calculation at 3 AM UTC
SELECT cron.schedule(
  'daily-marketshare-beauty',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/radar-calculate-marketshare',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{"category": "beauty"}'::jsonb
  );
  $$
);

-- Daily trend discovery at 4 AM UTC
SELECT cron.schedule(
  'daily-trends-beauty',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/radar-discover-trends',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{"category": "beauty"}'::jsonb
  );
  $$
);
```

### External Cron (GitHub Actions, etc.)

```yaml
# .github/workflows/daily-analytics.yml
name: Daily Analytics
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:

jobs:
  run-analytics:
    runs-on: ubuntu-latest
    steps:
      - name: Calculate Rankings
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/radar-calculate-rankings \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"category":"beauty"}'

      - name: Calculate Marketshare
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/radar-calculate-marketshare \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"category":"beauty"}'

      - name: Discover Trends
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/radar-discover-trends \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"category":"beauty"}'
```

## Query Examples

### Top 10 Creators by Mindshare

```sql
SELECT
  c.username,
  c.platform_handle,
  cr.rank_position,
  cr.mindshare_percentage,
  cr.rank_trend,
  cr.rank_change
FROM gv_creator_rankings cr
JOIN gv_creators c ON c.id = cr.creator_id
WHERE cr.category = 'beauty'
  AND cr.updated_at >= NOW() - INTERVAL '1 day'
ORDER BY cr.rank_position ASC
LIMIT 10;
```

### Brand Marketshare Comparison

```sql
WITH current_month AS (
  SELECT *
  FROM gv_brand_marketshare
  WHERE category = 'beauty'
    AND date_start >= DATE_TRUNC('month', NOW())
    AND date_end <= DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
),
previous_month AS (
  SELECT *
  FROM gv_brand_marketshare
  WHERE category = 'beauty'
    AND date_start >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    AND date_end <= DATE_TRUNC('month', NOW())
)
SELECT
  cm.brand,
  cm.marketshare_percentage AS current_share,
  pm.marketshare_percentage AS previous_share,
  cm.marketshare_percentage - pm.marketshare_percentage AS share_change,
  cm.organic_mentions,
  cm.paid_mentions
FROM current_month cm
LEFT JOIN previous_month pm ON cm.brand = pm.brand
ORDER BY cm.rank_position ASC
LIMIT 20;
```

### Rising Trends with Top Creators

```sql
SELECT
  t.trend_name,
  t.trend_type,
  t.growth_rate,
  t.estimated_reach,
  ARRAY_AGG(
    DISTINCT c.username
    ORDER BY c.total_reach DESC
  ) FILTER (WHERE ti.involvement_level = 'high') AS top_creators
FROM gv_trends t
JOIN gv_trend_involvement ti ON ti.trend_id = t.trend_id
JOIN gv_creators c ON c.id = ti.creator_id
WHERE t.category = 'beauty'
  AND t.status = 'rising'
GROUP BY t.trend_name, t.trend_type, t.growth_rate, t.estimated_reach
ORDER BY t.growth_rate DESC
LIMIT 10;
```

## Cost Breakdown

### Rankings Function
- **Cost**: Free (database queries only)
- **Frequency**: Daily updates
- **Storage**: ~100KB per category per day

### Marketshare Function
- **Cost**: Free (database queries only)
- **Frequency**: Daily/monthly updates
- **Storage**: ~50KB per category per time period

### Trends Function
- **Cost**: ~$0.025 per run
  - Perplexity: $0.01
  - SerpAPI (2 requests): $0.01
- **Monthly Cost**: ~$3.75 (daily runs, 5 categories)
- **Storage**: ~200KB per category per day

### Total Monthly Cost
```
Perplexity + SerpAPI: $3.75/month
Supabase storage: ~15MB/month (negligible)
Compute: Free tier sufficient
```

## Monitoring & Debugging

### Function Logs

```bash
# View logs for rankings function
supabase functions logs radar-calculate-rankings

# View logs for marketshare function
supabase functions logs radar-calculate-marketshare

# View logs for trends function
supabase functions logs radar-discover-trends
```

### Performance Metrics

```sql
-- Average processing time per category
SELECT
  category,
  COUNT(*) AS total_runs,
  AVG(snapshots_created) AS avg_snapshots,
  AVG(processing_time_ms) AS avg_time_ms
FROM function_metrics
WHERE function_name = 'radar-calculate-rankings'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY category;
```

## Troubleshooting

### Common Issues

1. **No rankings generated**
   - Ensure content analysis is completed first
   - Check that `content_quality_score` and `originality_score` are not null
   - Verify creators have `discovery_status = 'completed'`

2. **Empty marketshare results**
   - Check that content has `brand_mentions` populated
   - Verify date range contains analyzed content
   - Ensure `analysis_status = 'completed'` on content

3. **Trends not discovered**
   - Verify API keys are set correctly
   - Check API quota limits
   - Review function logs for API errors

4. **High costs**
   - Reduce trend discovery frequency
   - Use date range filters for marketshare
   - Implement caching for repeated queries

## Best Practices

### Data Freshness
- Run rankings after content analysis completes
- Calculate marketshare for closed time periods
- Discover trends daily for timely insights

### Performance
- Use `force_update: false` for rankings to respect snapshot frequency
- Query specific date ranges for marketshare
- Limit trend discovery to active categories

### Storage Management
- Archive old rankings (>90 days)
- Clean up expired trends monthly
- Remove duplicate marketshare entries

## Support & Resources

- **Function Code**: `/supabase/functions/radar-calculate-*`
- **Documentation**: Individual README.md files per function
- **Database Schema**: See prerequisites section above
- **API Keys**: Contact team for Perplexity/SerpAPI access
