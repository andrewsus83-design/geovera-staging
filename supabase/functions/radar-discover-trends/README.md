# Radar Discover Trends

Discover trending topics, hashtags, and challenges using Perplexity AI and SerpAPI, with automatic creator involvement tracking.

## Overview

This Edge Function discovers trending content across multiple sources (Perplexity, YouTube, Google Trends) and matches trends to creators based on their content. It calculates trend status (rising/peak/declining/expired) based on growth rates and activity.

## Trend Discovery Sources

### 1. Perplexity AI
- Real-time trending hashtags
- Challenges and viral content
- Product trends
- Key creator involvement

### 2. YouTube (via SerpAPI)
- Trending videos by category
- Channel performance
- View counts and engagement

### 3. Google Trends (via SerpAPI)
- Search volume trends
- Geographic data (Indonesia-focused)
- Trend trajectory

## Trend Status Logic

### Status Calculation
```typescript
// Rising: Growth rate > 50% week-over-week
status = "rising" if growth_rate > 0.5

// Declining: Growth rate < -20%
status = "declining" if growth_rate < -0.2

// Peak: Growth plateaued
status = "peak" if -0.2 <= growth_rate <= 0.5

// Expired: No activity in 14 days
status = "expired" if days_since_activity > 14
```

## API Request

### Endpoint
```
POST /supabase/functions/radar-discover-trends
```

### Request Body
```typescript
{
  category: string;  // Required: "beauty", "fashion", "food", etc.
}
```

### Example Request
```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-discover-trends \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty"
  }'
```

## Response Format

### Success Response
```typescript
{
  success: true,
  result: {
    success: boolean;
    category: string;
    trends_discovered: number;      // New trends inserted
    trends_updated: number;         // Existing trends updated
    active_trends: [
      {
        trend_id: string;
        category: string;
        trend_name: string;
        trend_type: "hashtag" | "challenge" | "product" | "topic";
        status: "rising" | "peak" | "declining" | "expired";
        estimated_reach: number;
        growth_rate: number;
        source: "perplexity" | "youtube" | "google_trends";
        metadata: object;
      }
    ];
    cost_usd: number;              // API costs
  }
}
```

### Example Response
```json
{
  "success": true,
  "result": {
    "success": true,
    "category": "beauty",
    "trends_discovered": 12,
    "trends_updated": 8,
    "active_trends": [
      {
        "trend_id": "beauty_glowingskin",
        "category": "beauty",
        "trend_name": "GlowingSkin",
        "trend_type": "hashtag",
        "status": "rising",
        "estimated_reach": 2500000,
        "growth_rate": 0.85,
        "source": "perplexity",
        "metadata": {
          "key_creators": ["rachgoddard", "suhaysalim"],
          "context": "Natural skincare routine trending in Indonesia"
        }
      },
      {
        "trend_id": "beauty_youtube_korean_glass_skin_tutorial",
        "category": "beauty",
        "trend_name": "Korean Glass Skin Tutorial",
        "trend_type": "topic",
        "status": "rising",
        "estimated_reach": 1850000,
        "growth_rate": 0,
        "source": "youtube",
        "metadata": {
          "channel": "Beauty By Nisa",
          "published_date": "2 days ago",
          "url": "https://youtube.com/watch?v=..."
        }
      },
      {
        "trend_id": "beauty_skincareroutine",
        "category": "beauty",
        "trend_name": "SkinCareRoutine",
        "trend_type": "hashtag",
        "status": "peak",
        "estimated_reach": 3200000,
        "growth_rate": 0.15,
        "source": "perplexity",
        "metadata": {
          "key_creators": ["titikamal", "tasyakamila"],
          "context": "Consistent interest in skincare routines"
        }
      }
    ],
    "cost_usd": 0.025
  }
}
```

## Database Tables

### `gv_trends`

Stores discovered trends:

```sql
CREATE TABLE gv_trends (
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trend_name, category)
);

CREATE INDEX idx_trends_category ON gv_trends(category);
CREATE INDEX idx_trends_status ON gv_trends(status);
CREATE INDEX idx_trends_growth ON gv_trends(growth_rate DESC);
```

### `gv_trend_involvement`

Tracks creator involvement in trends:

```sql
CREATE TABLE gv_trend_involvement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id TEXT NOT NULL REFERENCES gv_trends(trend_id),
  creator_id TEXT NOT NULL REFERENCES gv_creators(id),
  involvement_level TEXT CHECK (involvement_level IN ('high', 'medium', 'low')),
  content_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trend_id, creator_id)
);

CREATE INDEX idx_trend_involvement_trend ON gv_trend_involvement(trend_id);
CREATE INDEX idx_trend_involvement_creator ON gv_trend_involvement(creator_id);
CREATE INDEX idx_trend_involvement_level ON gv_trend_involvement(involvement_level);
```

## Creator Involvement Levels

### High Involvement
- 5+ pieces of content mentioning the trend
- Early adopters
- Trend leaders

### Medium Involvement
- 2-4 pieces of content
- Active participants
- Following the trend

### Low Involvement
- 1 piece of content
- Casual mentions
- Testing the trend

## Usage Patterns

### Daily Trend Discovery
```typescript
// Run daily for all categories
const categories = ["beauty", "fashion", "food", "tech", "lifestyle"];

for (const category of categories) {
  const response = await fetch(
    "https://your-project.supabase.co/functions/v1/radar-discover-trends",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category }),
    }
  );

  const data = await response.json();
  console.log(`${category}: ${data.result.trends_discovered} new trends`);
}
```

### Find Rising Trends
```typescript
const response = await fetch(
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

const data = await response.json();
const risingTrends = data.result.active_trends.filter(
  (trend) => trend.status === "rising"
);

console.log("Rising trends:", risingTrends);
```

### Query Trend Leaders
```sql
-- Find creators leading a specific trend
SELECT
  c.username,
  c.total_reach,
  ti.content_count,
  ti.involvement_level
FROM gv_trend_involvement ti
JOIN gv_creators c ON c.id = ti.creator_id
WHERE ti.trend_id = 'beauty_glowingskin'
  AND ti.involvement_level = 'high'
ORDER BY c.total_reach DESC;
```

### Monitor Trend Lifecycle
```sql
-- Track trend status changes over time
SELECT
  trend_name,
  status,
  growth_rate,
  estimated_reach,
  updated_at
FROM gv_trends
WHERE category = 'beauty'
  AND trend_name = 'GlowingSkin'
ORDER BY updated_at DESC
LIMIT 10;
```

## Cost Tracking

### API Costs
```typescript
const API_COSTS = {
  perplexity_request: 0.01,  // ~$0.01 per request
  serpapi_request: 0.005,    // ~$0.005 per search
};

// Total cost per run: ~$0.025
// - 1x Perplexity query
// - 2x SerpAPI queries (YouTube + Google Trends)
```

### Monthly Cost Estimate
```typescript
// Running once daily for 5 categories
daily_cost = 5 categories × $0.025 = $0.125
monthly_cost = $0.125 × 30 days = $3.75
```

## Performance Considerations

- **Rate Limiting**: 1-second delay between API calls
- **Caching**: Trend data cached until next update
- **Selective Storage**: Only active trends stored
- **Creator Matching**: Efficient content search using indexes

## Error Handling

### Missing API Keys

If API keys are not set, the function will:
- Log a warning
- Skip that data source
- Continue with available sources

```json
{
  "success": true,
  "result": {
    "trends_discovered": 5,
    "cost_usd": 0.01,
    "active_trends": [...]
  }
}
```

### API Failures

- Individual API failures don't stop the entire process
- Errors logged for debugging
- Partial results returned

### Common Errors

1. **Missing category**
   - Status: 400
   - Message: "Missing required field: category"

2. **API quota exceeded**
   - Source-specific error
   - Function continues with other sources

3. **Invalid trend data**
   - Skipped silently
   - Logged for review

## Monitoring

### Key Metrics

- Trends discovered per run
- Trends updated vs new
- Growth rate distribution
- Creator involvement statistics
- API cost per category

### Logs

Function logs include:
- Data source results
- Trend status calculations
- Creator matching results
- API costs breakdown

## Environment Variables

```bash
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PERPLEXITY_API_KEY=your-perplexity-key
SERPAPI_API_KEY=your-serpapi-key
```

## Deployment

```bash
# Set environment variables
supabase secrets set PERPLEXITY_API_KEY=your-key
supabase secrets set SERPAPI_API_KEY=your-key

# Deploy function
supabase functions deploy radar-discover-trends

# Test function
supabase functions invoke radar-discover-trends \
  --data '{"category":"beauty"}'
```

## Integration Examples

### Frontend: Display Trending Topics
```typescript
// Fetch active trends
const { data: trends } = await supabase
  .from("gv_trends")
  .select("*")
  .eq("category", "beauty")
  .eq("status", "rising")
  .order("growth_rate", { ascending: false })
  .limit(10);

// Display with icons
trends.forEach((trend) => {
  const icon = {
    hashtag: "#",
    challenge: "🏆",
    product: "🛍️",
    topic: "💬",
  }[trend.trend_type];

  console.log(`${icon} ${trend.trend_name}`);
  console.log(`  Growth: +${(trend.growth_rate * 100).toFixed(0)}%`);
  console.log(`  Reach: ${(trend.estimated_reach / 1000000).toFixed(1)}M`);
});
```

### Find Opportunities for Creators
```typescript
// Find trends a creator hasn't covered yet
const { data: uncoveredTrends } = await supabase
  .from("gv_trends")
  .select("*")
  .eq("category", "beauty")
  .in("status", ["rising", "peak"])
  .not("trend_id", "in",
    supabase
      .from("gv_trend_involvement")
      .select("trend_id")
      .eq("creator_id", "creator_123")
  );

console.log("Opportunities:", uncoveredTrends);
```
