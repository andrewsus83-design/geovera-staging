# Quick Reference: Radar Content Analysis

## Function Endpoint

```
POST https://[project-ref].supabase.co/functions/v1/radar-analyze-content
```

## Request Formats

### Single Analysis
```json
{ "content_id": "uuid-here" }
```

### Batch Analysis
```json
{ "batch": true, "category": "beauty" }
```

## Response Format

### Single
```json
{
  "success": true,
  "mode": "single",
  "result": {
    "success": true,
    "content_id": "uuid",
    "analysis": {
      "originality_score": 0.85,
      "quality_score": 0.92,
      "brand_mentions": [{"brand": "X", "type": "organic"}],
      "reasoning": "..."
    },
    "cost_usd": 0.0042
  }
}
```

### Batch
```json
{
  "success": true,
  "mode": "batch",
  "category": "beauty",
  "result": {
    "processed": 87,
    "failed": 0,
    "total_cost_usd": 0.1245,
    "cache_savings_usd": 0.0823
  }
}
```

## Quick Commands

### Deploy
```bash
supabase functions deploy radar-analyze-content
```

### Test Locally
```bash
supabase functions serve radar-analyze-content
```

### Set Secret
```bash
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."
```

### View Logs
```bash
supabase functions logs radar-analyze-content --follow
```

### Invoke from CLI
```bash
supabase functions invoke radar-analyze-content \
  --body '{"batch":true,"category":"beauty"}'
```

## Quick Integration (TypeScript)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(URL, KEY);

// Single analysis
const { data } = await supabase.functions.invoke(
  "radar-analyze-content",
  { body: { content_id: "uuid" } }
);

// Batch analysis
const { data } = await supabase.functions.invoke(
  "radar-analyze-content",
  { body: { batch: true, category: "beauty" } }
);
```

## Cost Reference

| Operation | Tokens | Cost |
|-----------|--------|------|
| Single analysis | ~750 | ~$0.005 |
| Batch (100 posts, cached) | ~75,000 | ~$0.20 |
| Cache write (per request) | ~500 | $0.0019 |
| Cache read (per request) | ~500 | $0.00015 |

## Score Interpretation

### Originality
- 0.9-1.0: Exceptional, truly unique
- 0.7-0.8: Very good, fresh approach
- 0.5-0.6: Average, some originality
- 0.3-0.4: Below average, derivative
- 0.0-0.2: Poor, generic content

### Quality
- 0.9-1.0: Professional production
- 0.7-0.8: High quality
- 0.5-0.6: Good quality
- 0.3-0.4: Acceptable quality
- 0.0-0.2: Low quality

## Database Updates

Function automatically updates `gv_creator_content`:
- `originality_score` (0-1)
- `content_quality_score` (0-1)
- `brand_mentions` (JSONB array)
- `analysis_status` ('completed')
- `analyzed_at` (timestamp)

## Categories Supported

- beauty
- fashion
- lifestyle
- food
- tech

## Rate Limits

- 10 posts per chunk
- 1 second delay between chunks
- Max 100 posts per batch request

## Common Issues

| Issue | Solution |
|-------|----------|
| 429 Rate Limit | Reduce CHUNK_SIZE or increase delay |
| High costs | Verify caching enabled, reduce batch size |
| Inconsistent scores | Lower temperature to 0.1 |
| Missing brands | Add brand context to prompt |

## Support

- Logs: `supabase functions logs radar-analyze-content`
- Dashboard: `https://supabase.com/dashboard/project/[ref]/functions`
- Anthropic status: `https://status.anthropic.com`

## Files

- `index.ts` - Main function code
- `README.md` - Full documentation
- `INTEGRATION.md` - Integration guide
- `QUICK_REFERENCE.md` - This file
- `examples.ts` - Usage examples
- `test.ts` - Test suite
- `deploy.sh` - Deployment script
