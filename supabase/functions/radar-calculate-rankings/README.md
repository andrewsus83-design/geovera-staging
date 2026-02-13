# Radar Calculate Rankings

Calculate Mindshare rankings for creators with smart snapshot frequency based on rank position.

## Overview

This Edge Function calculates creator rankings based on a weighted scoring formula that considers reach, content quality, and originality. It implements intelligent snapshot scheduling where top-ranked creators are updated more frequently.

## Ranking Formula

### Weighted Score
```typescript
weighted_score = total_reach × avg_quality_score × avg_originality_score
```

### Mindshare Percentage
```typescript
mindshare_percentage = (weighted_score / total_category_weighted_score) × 100
```

## Snapshot Schedule

Rankings are updated based on position:

- **Rank 1**: Every 24 hours
- **Rank 2-3**: Every 48 hours
- **Rank 4-6**: Every 72 hours
- **Rank 7-100**: Daily snapshots (saved to `gv_creator_rankings`)
- **Rank 101-500**: Monthly snapshots only
- **Rank 501+**: No automatic snapshots

## API Request

### Endpoint
```
POST /supabase/functions/radar-calculate-rankings
```

### Request Body
```typescript
{
  category: string;           // Required: "beauty", "fashion", "food", etc.
  force_update?: boolean;     // Optional: Skip snapshot frequency logic
}
```

### Example Request
```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-calculate-rankings \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty"
  }'
```

### Force Update Example
```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-calculate-rankings \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "force_update": true
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
    total_creators: number;
    snapshots_created: number;
    rank_changes: [
      {
        creator_id: string;
        rank: number;
        previous_rank: number | null;
        change: number;              // Positive = moved up
        trend: "rising" | "stable" | "falling";
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
    "total_creators": 342,
    "snapshots_created": 87,
    "rank_changes": [
      {
        "creator_id": "creator_123",
        "rank": 1,
        "previous_rank": 2,
        "change": 1,
        "trend": "rising"
      },
      {
        "creator_id": "creator_456",
        "rank": 2,
        "previous_rank": 1,
        "change": -1,
        "trend": "falling"
      },
      {
        "creator_id": "creator_789",
        "rank": 3,
        "previous_rank": 3,
        "change": 0,
        "trend": "stable"
      }
    ]
  }
}
```

## Rank Trend Calculation

Trends are calculated based on rank position changes:

- **Rising**: Moved up 5+ positions
- **Falling**: Moved down 5+ positions
- **Stable**: Changed less than 5 positions

## Database Tables

### `gv_creator_rankings`

Stores ranking snapshots:

```sql
CREATE TABLE gv_creator_rankings (
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, category, updated_at)
);

CREATE INDEX idx_creator_rankings_category ON gv_creator_rankings(category);
CREATE INDEX idx_creator_rankings_rank ON gv_creator_rankings(rank_position);
CREATE INDEX idx_creator_rankings_updated ON gv_creator_rankings(updated_at DESC);
```

## Usage Patterns

### Daily Batch Update
```typescript
// Run daily cron job for all categories
const categories = ["beauty", "fashion", "food", "tech", "lifestyle"];

for (const category of categories) {
  await fetch("https://your-project.supabase.co/functions/v1/radar-calculate-rankings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category }),
  });
}
```

### On-Demand Force Update
```typescript
// Force update for a specific category (e.g., after major content analysis)
await fetch("https://your-project.supabase.co/functions/v1/radar-calculate-rankings", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    category: "beauty",
    force_update: true,
  }),
});
```

## Performance Considerations

- **Snapshot Frequency**: Reduces unnecessary database writes for lower-ranked creators
- **Delta Caching**: Only calculates changes when needed based on schedule
- **Top 100 Focus**: Returns detailed rank changes only for top 100
- **Top 500 Storage**: Only stores snapshots for top 500 to save space

## Error Handling

### Error Response Format
```json
{
  "error": "Failed to calculate rankings",
  "details": "Specific error message"
}
```

### Common Errors

1. **Missing category**
   - Status: 400
   - Message: "Missing required field: category"

2. **No creator data**
   - Returns success with 0 snapshots created
   - Indicates no completed content analysis

3. **Database errors**
   - Status: 500
   - Detailed error message in logs

## Monitoring

### Key Metrics to Track

- Snapshots created per run
- Rank changes distribution
- Update frequency per rank tier
- Processing time per category

### Logs

Function logs include:
- Total creators analyzed
- Snapshots created
- Skipped creators (with reasons)
- Previous rank comparisons

## Dependencies

- Supabase Client
- Tables: `gv_creators`, `gv_creator_content`, `gv_creator_rankings`
- Required columns: `total_reach`, `content_quality_score`, `originality_score`

## Environment Variables

```bash
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Deployment

```bash
# Deploy function
supabase functions deploy radar-calculate-rankings

# Test function
supabase functions invoke radar-calculate-rankings \
  --data '{"category":"beauty"}'
```
