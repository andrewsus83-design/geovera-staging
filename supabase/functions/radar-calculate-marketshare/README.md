# Radar Calculate Marketshare

Calculate brand marketshare based on creator content mentions, tracking both organic and paid mentions.

## Overview

This Edge Function analyzes brand mentions across creator content to calculate marketshare percentages within a category. It distinguishes between organic mentions and paid partnerships, providing insights into brand visibility and influence.

## Marketshare Formula

### Brand Reach Aggregation
```typescript
brand_reach = SUM(post_reach WHERE brand_mentioned)
brand_engagement = SUM(post_engagement WHERE brand_mentioned)
```

### Marketshare Percentage
```typescript
marketshare_percentage = (brand_reach / total_category_reach) × 100
```

## Mention Types

### Organic Mentions
- Natural product mentions
- Authentic recommendations
- Casual references
- Product-in-use without emphasis
- User-generated content

### Paid Mentions
- Sponsored posts
- #ad or #sponsored tags
- Paid partnerships
- Clear promotional language
- "Thank you to @brand" posts

## API Request

### Endpoint
```
POST /supabase/functions/radar-calculate-marketshare
```

### Request Body
```typescript
{
  category: string;              // Required: "beauty", "fashion", etc.
  date_range?: {                 // Optional: defaults to last 30 days
    start: string;               // ISO 8601 date
    end: string;                 // ISO 8601 date
  }
}
```

### Example Request (Default 30 Days)
```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-calculate-marketshare \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty"
  }'
```

### Example Request (Custom Date Range)
```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-calculate-marketshare \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "date_range": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-01-31T23:59:59Z"
    }
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
    date_range: {
      start: string;
      end: string;
    };
    total_brands: number;
    top_brands: [
      {
        brand: string;
        category: string;
        marketshare_percentage: number;
        total_reach: number;
        total_engagement: number;
        organic_mentions: number;
        paid_mentions: number;
        total_mentions: number;
        rank_position: number;
        rank_change: number;         // Positive = moved up
      }
    ]
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
    "date_range": {
      "start": "2025-01-01T00:00:00.000Z",
      "end": "2025-01-31T23:59:59.999Z"
    },
    "total_brands": 156,
    "top_brands": [
      {
        "brand": "Wardah",
        "category": "beauty",
        "marketshare_percentage": 15.4,
        "total_reach": 8500000,
        "total_engagement": 425000,
        "organic_mentions": 42,
        "paid_mentions": 8,
        "total_mentions": 50,
        "rank_position": 1,
        "rank_change": 0
      },
      {
        "brand": "Maybelline",
        "category": "beauty",
        "marketshare_percentage": 12.8,
        "total_reach": 7100000,
        "total_engagement": 380000,
        "organic_mentions": 35,
        "paid_mentions": 12,
        "total_mentions": 47,
        "rank_position": 2,
        "rank_change": 1
      },
      {
        "brand": "L'Oreal",
        "category": "beauty",
        "marketshare_percentage": 11.2,
        "total_reach": 6200000,
        "total_engagement": 315000,
        "organic_mentions": 28,
        "paid_mentions": 15,
        "total_mentions": 43,
        "rank_position": 3,
        "rank_change": -1
      }
    ]
  }
}
```

## Database Tables

### `gv_brand_marketshare`

Stores marketshare calculations:

```sql
CREATE TABLE gv_brand_marketshare (
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand, category, date_start, date_end)
);

CREATE INDEX idx_brand_marketshare_category ON gv_brand_marketshare(category);
CREATE INDEX idx_brand_marketshare_rank ON gv_brand_marketshare(rank_position);
CREATE INDEX idx_brand_marketshare_date ON gv_brand_marketshare(date_start, date_end);
```

### Brand Mention Format in `gv_creator_content`

```typescript
// brand_mentions column (JSONB)
[
  {
    "brand": "Wardah",
    "type": "organic"
  },
  {
    "brand": "Maybelline",
    "type": "paid"
  }
]
```

## Usage Patterns

### Monthly Marketshare Report
```typescript
// Calculate marketshare for the previous month
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

const response = await fetch(
  "https://your-project.supabase.co/functions/v1/radar-calculate-marketshare",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: "beauty",
      date_range: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
    }),
  }
);

const data = await response.json();
console.log(`Top brand: ${data.result.top_brands[0].brand}`);
console.log(`Marketshare: ${data.result.top_brands[0].marketshare_percentage}%`);
```

### Real-Time Marketshare (Last 30 Days)
```typescript
// Get current marketshare snapshot
const response = await fetch(
  "https://your-project.supabase.co/functions/v1/radar-calculate-marketshare",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: "beauty",
    }),
  }
);
```

### Compare Organic vs Paid Mentions
```typescript
const data = await response.json();

for (const brand of data.result.top_brands) {
  const organicRatio = brand.organic_mentions / brand.total_mentions;
  const paidRatio = brand.paid_mentions / brand.total_mentions;

  console.log(`${brand.brand}:`);
  console.log(`  Organic: ${(organicRatio * 100).toFixed(1)}%`);
  console.log(`  Paid: ${(paidRatio * 100).toFixed(1)}%`);
}
```

## Insights from Marketshare

### Brand Health Indicators

1. **High Organic Mentions**
   - Strong brand loyalty
   - Authentic creator relationships
   - Positive brand sentiment

2. **High Paid Mentions**
   - Active marketing campaigns
   - Influencer partnerships
   - Promotional initiatives

3. **Rank Changes**
   - Positive change: Growing brand presence
   - Negative change: Declining visibility
   - Stable: Consistent brand performance

### Use Cases

- **Brand Monitoring**: Track competitor marketshare
- **Campaign Analysis**: Measure impact of influencer campaigns
- **Partnership Decisions**: Identify top brands for collaborations
- **Trend Analysis**: Spot emerging brands gaining traction

## Performance Considerations

- **Date Range**: Shorter ranges process faster
- **Top 100 Storage**: Only stores top 100 brands to save space
- **Aggregation**: Pre-aggregated data reduces query complexity
- **Index Usage**: Optimized for category and date range queries

## Error Handling

### Error Response Format
```json
{
  "error": "Failed to calculate marketshare",
  "details": "Specific error message"
}
```

### Common Errors

1. **Missing category**
   - Status: 400
   - Message: "Missing required field: category"

2. **Invalid date range**
   - Validates date format
   - End date must be after start date

3. **No content data**
   - Returns success with empty top_brands array
   - Indicates no analyzed content in date range

## Monitoring

### Key Metrics

- Brands analyzed per category
- Average mentions per brand
- Organic vs paid ratio
- Rank change distribution
- Processing time per category

### Logs

Function logs include:
- Total brands discovered
- Top brands saved
- Date range processed
- Rank comparison results

## Dependencies

- Supabase Client
- Tables: `gv_creators`, `gv_creator_content`, `gv_brand_marketshare`
- Required columns: `brand_mentions`, `reach`, `engagement`, `posted_at`

## Environment Variables

```bash
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Deployment

```bash
# Deploy function
supabase functions deploy radar-calculate-marketshare

# Test function
supabase functions invoke radar-calculate-marketshare \
  --data '{"category":"beauty"}'
```
