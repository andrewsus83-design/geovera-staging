# Hub Create Collection Function

Orchestrate complete Authority Hub collection creation (all 3 tabs: Embeds, Articles, Charts).

## Purpose

This function is the main orchestrator that creates a complete Hub collection by calling all other Hub functions in sequence. It discovers trending content, creates a collection, adds embeds, generates 4 articles (one per type), and creates 3-5 charts.

## API Endpoint

```
POST /functions/v1/hub-create-collection
```

## Request Body

```typescript
{
  category: string;           // Category to create collection for
  daily_batch?: boolean;      // Whether this is part of daily batch (default: false)
}
```

## Response

```typescript
{
  success: true,
  result: {
    collection_id: string;           // UUID of created collection
    category: string;                // Category name
    status: "published";             // Collection status
    tabs: {
      embeds: number;                // Number of embeds added (5-10)
      articles: number;              // Number of articles generated (0-4)
      charts: number;                // Number of charts created (0-5)
    };
    total_cost_usd: number;         // Total API costs
    execution_time_seconds: number;  // Total execution time
  }
}
```

## Complete Process Flow

### Step 1: Discover Trending Topic
- Call `hub-discover-content` with `article_type: "hot"`
- Get trending topic, keywords, and content IDs
- Cost: ~$0.001

### Step 2: Create Collection
- Insert into `gv_hub_collections`
- Set title from trending topic
- Status: `draft` (will be published at end)

### Step 3: Add Embeds (5-10 pieces)
- Fetch full content details from `gv_creator_content`
- Select 5-10 best pieces based on discovery results
- Insert into `gv_hub_embedded_content`
- Set display order

### Step 4: Generate 4 Articles
For each article type (`hot`, `review`, `education`, `nice_to_know`):
1. Call `hub-discover-content` for specific type
2. Get 5-7 relevant content pieces
3. Call `hub-generate-article`
4. Cost per article: ~$0.004-0.020

Total cost for 4 articles: ~$0.016-0.080

### Step 5: Generate 3-5 Charts
- Call `hub-generate-charts` with templates:
  - `engagement_trend` (line chart)
  - `top_creators_by_reach` (bar chart)
  - `content_type_distribution` (pie chart)
- Charts use fallback data if queries fail
- Cost: negligible (no external API calls)

### Step 6: Publish Collection
- Update collection status to `published`
- Set `published_at` timestamp
- Collection now visible on Hub homepage

## Example Usage

### cURL

```bash
curl -X POST https://your-project.supabase.co/functions/v1/hub-create-collection \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty"
  }'
```

### JavaScript

```javascript
const { data, error } = await supabase.functions.invoke('hub-create-collection', {
  body: {
    category: 'beauty',
    daily_batch: false
  }
});

if (error) {
  console.error('Collection creation failed:', error);
} else {
  console.log('Collection created:', data.result.collection_id);
  console.log('Tabs:', data.result.tabs);
  console.log('Cost:', `$${data.result.total_cost_usd.toFixed(4)}`);
  console.log('Time:', `${data.result.execution_time_seconds.toFixed(2)}s`);
}
```

### TypeScript

```typescript
interface CollectionResult {
  collection_id: string;
  category: string;
  status: 'published';
  tabs: {
    embeds: number;
    articles: number;
    charts: number;
  };
  total_cost_usd: number;
  execution_time_seconds: number;
}

const response = await fetch('https://your-project.supabase.co/functions/v1/hub-create-collection', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'food'
  })
});

const { result }: { result: CollectionResult } = await response.json();
```

## Daily Batch Processing

For automated daily collection creation across multiple categories:

```javascript
// Run daily batch for all categories
const categories = ['beauty', 'food', 'tech', 'fashion', 'lifestyle'];

for (const category of categories) {
  await supabase.functions.invoke('hub-create-collection', {
    body: {
      category,
      daily_batch: true
    }
  });
}
```

**Goal**: 4-8 collections per day per category

## Cost Analysis

### Per Collection
| Component | API Calls | Cost Range |
|-----------|-----------|------------|
| Discovery (Step 1) | 1 Perplexity | $0.001 |
| 4x Article Discovery | 4 Perplexity | $0.004 |
| 4x Article Generation | 4 Claude + 4 OpenAI | $0.016-0.080 |
| Chart Generation | 0 external | $0.000 |
| **Total** | **9 API calls** | **$0.021-0.085** |

### Daily Batch (5 categories, 6 collections each)
- Collections: 30
- Cost: $0.63-2.55 per day
- Articles: 120 per day
- Embeds: 150-300 per day

## Performance

### Timeline
| Step | Duration | Status |
|------|----------|--------|
| Discovery | 2-4s | ⚡ Fast |
| Create Collection | <1s | ⚡ Fast |
| Add Embeds | 1-2s | ⚡ Fast |
| Generate 4 Articles | 60-100s | 🐌 Slow (main bottleneck) |
| Generate Charts | 5-10s | ✓ Medium |
| Publish | <1s | ⚡ Fast |
| **Total** | **70-120s** | **1-2 minutes** |

### Optimization Tips
1. **Parallel Article Generation**: Generate articles in parallel (not implemented yet)
2. **Cache Discovery Results**: Reuse discovery results for similar requests
3. **Async Processing**: Move to background job queue for daily batches

## Error Handling

### Partial Success
The function is designed to handle partial failures gracefully:

```javascript
// If one article fails, continue with others
for (const articleType of ['hot', 'review', 'education', 'nice_to_know']) {
  try {
    await generateArticle(articleType);
  } catch (err) {
    console.error(`Failed to generate ${articleType} article:`, err);
    // Continue with other articles
  }
}
```

### Common Errors

1. **Discovery Failed**
   ```json
   {
     "error": "Failed to create collection",
     "details": "Discovery failed: No relevant content found"
   }
   ```

2. **Article Generation Failed**
   - Collection still created
   - Other articles still generated
   - Result shows `tabs.articles < 4`

3. **Chart Generation Failed**
   - Collection still created
   - Falls back to mock data
   - Result shows `tabs.charts: 0`

## Environment Variables

Required:
- `PERPLEXITY_API_KEY` - For discovery
- `ANTHROPIC_API_KEY` - For article analysis
- `OPENAI_API_KEY` - For article generation
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - For calling other functions
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

## Database Tables Involved

### Created/Updated
1. `gv_hub_collections` - Main collection record
2. `gv_hub_embedded_content` - Embeds (5-10)
3. `gv_hub_articles` - Articles (4)
4. `gv_hub_charts` - Charts (3-5)

### Read From
1. `gv_creator_content` - Content pieces
2. `gv_creators` - Creator details
3. `gv_hub_chart_templates` - Chart templates

## Monitoring

### Key Metrics to Track

```javascript
{
  collections_created: 30,        // Per day
  success_rate: 0.95,            // 95% success
  avg_cost_per_collection: 0.05, // $0.05
  avg_execution_time: 85,        // 85 seconds
  tabs: {
    embeds: {
      total: 180,
      avg_per_collection: 6
    },
    articles: {
      total: 115,
      avg_per_collection: 3.8
    },
    charts: {
      total: 90,
      avg_per_collection: 3
    }
  }
}
```

### Logging

All steps are logged with timestamps:

```
[2024-01-15 10:00:00] Creating collection for category: beauty
[2024-01-15 10:00:02] Step 1: Discovering trending content...
[2024-01-15 10:00:06] Discovered topic: Glass Skin Trend
[2024-01-15 10:00:06] Found 10 content pieces
[2024-01-15 10:00:06] Step 2: Creating collection...
[2024-01-15 10:00:07] Collection created: uuid-here
[2024-01-15 10:00:07] Step 3: Adding embeds to collection...
[2024-01-15 10:00:09] Added 7 embeds
[2024-01-15 10:00:09] Step 4: Generating articles...
[2024-01-15 10:00:10] Generating hot article...
[2024-01-15 10:00:35] hot article created: uuid-here
[2024-01-15 10:00:35] Generating review article...
[2024-01-15 10:01:00] review article created: uuid-here
...
[2024-01-15 10:01:50] Generated 4 articles
[2024-01-15 10:01:50] Step 5: Generating charts...
[2024-01-15 10:01:58] Generated 3 charts
[2024-01-15 10:01:58] Step 6: Publishing collection...
[2024-01-15 10:01:59] Collection creation complete in 119.23s
[2024-01-15 10:01:59] Total cost: $0.0453
```

## Testing

### Test Single Collection

```bash
# Test locally
supabase functions serve hub-create-collection

# In another terminal
curl -X POST http://localhost:54321/functions/v1/hub-create-collection \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty"
  }'
```

### Test Daily Batch

```javascript
// Test script for daily batch
const categories = ['beauty', 'food'];

for (const category of categories) {
  console.log(`\nCreating collection for ${category}...`);

  const { data, error } = await supabase.functions.invoke('hub-create-collection', {
    body: { category, daily_batch: true }
  });

  if (error) {
    console.error(`❌ Failed: ${error.message}`);
  } else {
    console.log(`✅ Success: ${data.result.collection_id}`);
    console.log(`   Tabs: ${data.result.tabs.embeds} embeds, ${data.result.tabs.articles} articles, ${data.result.tabs.charts} charts`);
    console.log(`   Cost: $${data.result.total_cost_usd.toFixed(4)}`);
    console.log(`   Time: ${data.result.execution_time_seconds.toFixed(2)}s`);
  }
}
```

## Deployment

```bash
# Deploy all Hub functions
supabase functions deploy hub-discover-content
supabase functions deploy hub-generate-article
supabase functions deploy hub-generate-charts
supabase functions deploy hub-create-collection

# Set secrets (only need to do once)
supabase secrets set PERPLEXITY_API_KEY=your_key
supabase secrets set ANTHROPIC_API_KEY=your_key
supabase secrets set OPENAI_API_KEY=your_key
```

## Automation

### Daily Cron Job

Set up a cron job to run daily batches:

```javascript
// Deno Deploy cron
Deno.cron("Daily Hub Collections", "0 2 * * *", async () => {
  // Run at 2 AM daily
  const categories = ['beauty', 'food', 'tech', 'fashion', 'lifestyle'];

  for (const category of categories) {
    await fetch('https://your-project.supabase.co/functions/v1/hub-create-collection', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_ANON_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category, daily_batch: true })
    });
  }
});
```

### Supabase pg_cron (Alternative)

```sql
-- Schedule daily collection creation
SELECT cron.schedule(
  'daily-hub-collections',
  '0 2 * * *', -- 2 AM daily
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/hub-create-collection',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{"category": "beauty", "daily_batch": true}'::jsonb
  );
  $$
);
```

## Best Practices

1. **Scheduling**: Run during off-peak hours (2-4 AM)
2. **Rate Limiting**: Add delays between categories in batch processing
3. **Cost Monitoring**: Track daily API costs
4. **Error Alerts**: Set up alerts for failed collections
5. **Quality Checks**: Manually review first few collections

## Troubleshooting

### Collection Created But No Articles
- Check API keys are set correctly
- Review function logs for specific errors
- Test individual article generation function

### High API Costs
- Reduce number of categories in daily batch
- Lower `count` parameter in discovery
- Use shorter target word counts

### Slow Execution
- Articles are the bottleneck (60-100s)
- Consider parallel processing
- Move to background queue

## Related Functions

- `hub-discover-content` - Content discovery
- `hub-generate-article` - Article generation
- `hub-generate-charts` - Chart creation

## Support

For issues or questions, contact the development team or refer to the main project documentation.
