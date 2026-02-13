# Radar Analyze Content Edge Function

Production-ready Edge Function for analyzing creator content using Claude 3.5 Sonnet with prompt caching optimization.

## Overview

Analyzes social media content for:
- **Originality Score** (0-1): How unique and creative the content is
- **Quality Score** (0-1): Production value and engagement potential
- **Brand Mentions**: Detects brand names and classifies as organic or paid

## Features

- Single content analysis
- Batch processing (up to 100 posts per run)
- Prompt caching for cost efficiency
- Rate limiting and error handling
- Automatic creator score aggregation

## API Endpoints

### Single Content Analysis

```bash
POST /radar-analyze-content

{
  "content_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "mode": "single",
  "result": {
    "success": true,
    "content_id": "uuid-here",
    "analysis": {
      "originality_score": 0.85,
      "quality_score": 0.92,
      "brand_mentions": [
        { "brand": "Wardah", "type": "organic" },
        { "brand": "Maybelline", "type": "paid" }
      ],
      "reasoning": "High quality production with authentic brand integration..."
    },
    "cost_usd": 0.0042
  }
}
```

### Batch Analysis

```bash
POST /radar-analyze-content

{
  "batch": true,
  "category": "beauty"
}
```

**Response:**
```json
{
  "success": true,
  "mode": "batch",
  "category": "beauty",
  "result": {
    "success": true,
    "processed": 87,
    "failed": 0,
    "total_cost_usd": 0.1245,
    "cache_savings_usd": 0.0823
  }
}
```

## Cost Optimization

### Prompt Caching Strategy

Claude 3.5 Sonnet with prompt caching provides significant cost savings:

| Token Type | Cost per 1M tokens | Savings |
|------------|-------------------|---------|
| Input (regular) | $3.00 | - |
| Cache Write | $3.75 | +25% |
| Cache Read | $0.30 | **90% savings** |
| Output | $15.00 | - |

### Example Cost Calculation

**Without Caching (100 posts):**
- System prompt: ~500 tokens × 100 = 50,000 tokens
- User prompts: ~150 tokens × 100 = 15,000 tokens
- Output: ~100 tokens × 100 = 10,000 tokens
- **Total: $0.35**

**With Caching (100 posts):**
- Cache write (1st request): 500 tokens = $0.0019
- Cache read (99 requests): 500 × 99 = 49,500 tokens = $0.0148
- User prompts: 15,000 tokens = $0.045
- Output: 10,000 tokens = $0.15
- **Total: $0.21 (40% savings)**

## Scoring Guidelines

### Originality Score (0.0 - 1.0)

| Score | Description |
|-------|-------------|
| 1.0 | Completely original, innovative approach |
| 0.8-0.9 | Highly original with fresh perspectives |
| 0.6-0.7 | Some original elements mixed with standard formats |
| 0.4-0.5 | Mix of original and template-based content |
| 0.2-0.3 | Mostly derivative, following trends |
| 0.0-0.1 | Generic, copied, or pure template content |

### Quality Score (0.0 - 1.0)

| Score | Description |
|-------|-------------|
| 1.0 | Professional production, compelling narrative |
| 0.8-0.9 | High quality with strong engagement elements |
| 0.6-0.7 | Good quality, decent production value |
| 0.4-0.5 | Moderate quality, acceptable engagement |
| 0.2-0.3 | Low production value, limited potential |
| 0.0-0.1 | Very poor quality, minimal effort |

### Brand Mention Detection

**Organic:**
- Natural product mentions
- Authentic recommendations
- Casual references without #ad or sponsorship indicators

**Paid:**
- Contains #ad, #sponsored, #partnership
- "Thank you to @brand" language
- Clear promotional disclosure
- Affiliate links or promo codes

## Workflow Integration

### Step 1: Content Ingestion
Content is scraped via Apify and stored in `gv_creator_content` with `analysis_status = 'pending'`.

### Step 2: Analysis Trigger
```typescript
// Analyze single post
await fetch('https://[project-ref].supabase.co/functions/v1/radar-analyze-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({ content_id: 'uuid-here' })
});

// Batch analyze category
await fetch('https://[project-ref].supabase.co/functions/v1/radar-analyze-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({ batch: true, category: 'beauty' })
});
```

### Step 3: Database Updates
Function automatically updates:
- `gv_creator_content.originality_score`
- `gv_creator_content.content_quality_score`
- `gv_creator_content.brand_mentions` (JSONB)
- `gv_creator_content.analysis_status` → 'completed'
- `gv_creator_content.analyzed_at` → timestamp

### Step 4: Creator Aggregation
Function calculates average quality and originality per creator for ranking purposes.

## Rate Limiting

- Batch processing: 10 posts per chunk
- 1 second delay between chunks
- Maximum 100 posts per batch request
- Automatic retry on failure (status → 'failed')

## Error Handling

| Error | Status | Action |
|-------|--------|--------|
| Missing API key | 500 | Check environment variables |
| Content not found | 404 | Verify content_id exists |
| Invalid JSON response | 500 | Claude parsing error, retry |
| Rate limit exceeded | 429 | Wait and retry |
| Analysis failure | 500 | Mark as 'failed', investigate |

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
```

## Deployment

```bash
# Deploy function
supabase functions deploy radar-analyze-content

# Test locally
supabase functions serve radar-analyze-content

# Invoke remotely
curl -X POST 'https://[project-ref].supabase.co/functions/v1/radar-analyze-content' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [SUPABASE_ANON_KEY]' \
  -d '{"batch": true, "category": "beauty"}'
```

## Monitoring

### Key Metrics
- Analysis completion rate
- Average cost per analysis
- Cache hit rate
- Processing time per batch
- Failed analysis count

### Logs
```bash
# View function logs
supabase functions logs radar-analyze-content

# Monitor specific execution
supabase functions logs radar-analyze-content --follow
```

## Database Schema

### gv_creator_content

```sql
content_quality_score NUMERIC(3,2)      -- 0.00 to 1.00
originality_score NUMERIC(3,2)          -- 0.00 to 1.00
brand_mentions JSONB DEFAULT '[]'       -- [{"brand": "X", "type": "organic"}]
analyzed_at TIMESTAMPTZ                 -- Analysis timestamp
analysis_status TEXT                    -- 'pending', 'analyzing', 'completed', 'failed'
```

## Production Considerations

### Scaling
- Function auto-scales with Supabase Edge Functions
- Claude API rate limits: Monitor usage
- Batch size: Adjust CHUNK_SIZE based on volume

### Cost Management
- Enable prompt caching for all batch operations
- Monitor cache hit rates (target >90%)
- Set budget alerts in Anthropic dashboard

### Quality Assurance
- Sample 5% of analyses for manual review
- Track score distributions over time
- Flag anomalies (all 0.0 or all 1.0 scores)

## Future Enhancements

- [ ] Multi-language support (English, Indonesian)
- [ ] Video content analysis (transcription + visual)
- [ ] Trend detection (viral content patterns)
- [ ] Sentiment analysis
- [ ] Engagement prediction model
- [ ] Real-time analysis webhooks

## Support

For issues or questions:
- Check function logs: `supabase functions logs radar-analyze-content`
- Review Anthropic API status: https://status.anthropic.com
- Verify environment variables are set correctly
