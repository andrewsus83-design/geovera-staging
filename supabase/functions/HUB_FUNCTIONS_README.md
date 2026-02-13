# Authority Hub Edge Functions

Complete serverless functions for the Authority Hub feature - automated content discovery, article generation, and data visualization.

## Overview

The Authority Hub is a public-facing content hub that showcases trending creator content, AI-generated articles, and data-driven insights. These 4 Edge Functions work together to create comprehensive collections with 3 tabs:

1. **Tab 1: Embeds** - 5-10 curated social media embeds
2. **Tab 2: Articles** - 4 AI-generated articles (hot, review, education, nice_to_know)
3. **Tab 3: Charts** - 3-5 Statista-style data visualizations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  hub-create-collection                      │
│                    (Main Orchestrator)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐
│hub-discover │ │hub-generate│ │hub-generate│
│  -content   │ │ -article  │ │ -charts   │
└─────────────┘ └──────────┘ └──────────┘
         │            │            │
         └────────────┼────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐       ┌──────────────┐
│   Perplexity    │       │  Supabase    │
│   (Discovery)   │       │  (Storage)   │
└─────────────────┘       └──────────────┘
         │
         ▼
┌─────────────────┐
│  Claude + OpenAI│
│  (Generation)   │
└─────────────────┘
```

## Functions

### 1. hub-discover-content

**Purpose**: Find trending topics and relevant content using Perplexity AI

**Key Features**:
- Real-time trend discovery with Perplexity sonar-pro
- Content scoring (engagement × recency × quality)
- Category and article-type specific prompts
- Returns 5-10 top content pieces

**Cost**: ~$0.001 per request

[Full Documentation →](./hub-discover-content/README.md)

---

### 2. hub-generate-article

**Purpose**: Generate 200-500 word articles using Claude (analysis) + OpenAI (writing)

**Key Features**:
- Claude 3.5 Sonnet for content analysis and insight extraction
- OpenAI GPT-4o-mini for article generation (10x cheaper than GPT-4o)
- Quality checks (word count, neutrality, readability)
- Hook-driven, conversational style
- Auto-generated titles and slugs

**Cost**: ~$0.004-0.020 per article

[Full Documentation →](./hub-generate-article/README.md)

---

### 3. hub-generate-charts

**Purpose**: Create Statista-style charts from data templates

**Key Features**:
- Pre-defined SQL templates for common visualizations
- Chart.js-compatible data format
- Auto-generated key insights
- Fallback mock data if queries fail
- Support for line, bar, pie charts

**Cost**: Negligible (no external API calls)

[Full Documentation →](./hub-generate-charts/README.md)

---

### 4. hub-create-collection

**Purpose**: Orchestrate complete collection creation (all 3 tabs)

**Key Features**:
- Calls all other functions in sequence
- Creates 5-10 embeds, 4 articles, 3-5 charts
- Publishes complete collection
- Handles partial failures gracefully
- Full cost and timing tracking

**Cost**: ~$0.021-0.085 per collection

[Full Documentation →](./hub-create-collection/README.md)

## Quick Start

### Prerequisites

1. **API Keys** (set as Supabase secrets):
   ```bash
   supabase secrets set PERPLEXITY_API_KEY=your_key
   supabase secrets set ANTHROPIC_API_KEY=your_key
   supabase secrets set OPENAI_API_KEY=your_key
   ```

2. **Database Schema**:
   - Run migrations: `20260213260000_authority_hub_schema.sql`
   - Run migrations: `20260213270000_hub_3tab_update.sql`

### Deploy All Functions

```bash
# Deploy all 4 functions
supabase functions deploy hub-discover-content
supabase functions deploy hub-generate-article
supabase functions deploy hub-generate-charts
supabase functions deploy hub-create-collection
```

### Create Your First Collection

```javascript
const { data, error } = await supabase.functions.invoke('hub-create-collection', {
  body: {
    category: 'beauty'
  }
});

console.log('Collection ID:', data.result.collection_id);
console.log('Tabs:', data.result.tabs);
// Output: { embeds: 7, articles: 4, charts: 3 }
```

## Usage Examples

### Example 1: Single Collection Creation

```javascript
// Create a beauty collection
const response = await fetch('https://your-project.supabase.co/functions/v1/hub-create-collection', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'beauty'
  })
});

const { result } = await response.json();
console.log(`Created collection: ${result.collection_id}`);
console.log(`Cost: $${result.total_cost_usd.toFixed(4)}`);
console.log(`Time: ${result.execution_time_seconds.toFixed(2)}s`);
```

### Example 2: Daily Batch Processing

```javascript
// Run daily batch for all categories
const categories = ['beauty', 'food', 'tech', 'fashion', 'lifestyle'];

for (const category of categories) {
  const { data, error } = await supabase.functions.invoke('hub-create-collection', {
    body: {
      category,
      daily_batch: true
    }
  });

  if (error) {
    console.error(`Failed ${category}:`, error);
  } else {
    console.log(`✅ ${category}: ${data.result.collection_id}`);
  }
}
```

### Example 3: Custom Article Generation

```javascript
// Step 1: Discover content
const discovery = await supabase.functions.invoke('hub-discover-content', {
  body: {
    category: 'food',
    article_type: 'education',
    count: 7
  }
});

const contentIds = discovery.data.result.content_ids;

// Step 2: Generate article
const article = await supabase.functions.invoke('hub-generate-article', {
  body: {
    collection_id: 'your-collection-id',
    article_type: 'education',
    content_ids: contentIds,
    target_words: 400
  }
});

console.log('Article:', article.data.result.title);
```

### Example 4: Generate Only Charts

```javascript
// Generate charts for existing collection
const charts = await supabase.functions.invoke('hub-generate-charts', {
  body: {
    collection_id: 'your-collection-id',
    category: 'tech',
    templates: [
      'engagement_trend',
      'top_creators_by_reach',
      'content_type_distribution'
    ]
  }
});

console.log(`Generated ${charts.data.result.total_charts} charts`);
```

## Cost Analysis

### Per Collection

| Component | API | Requests | Cost Range |
|-----------|-----|----------|------------|
| Discovery (main) | Perplexity | 1 | $0.001 |
| Discovery (4 articles) | Perplexity | 4 | $0.004 |
| Article Analysis | Claude | 4 | $0.012-0.060 |
| Article Writing | OpenAI | 4 | $0.004-0.020 |
| **Total** | - | **9** | **$0.021-0.085** |

### Daily Batch (30 collections)

- **Collections**: 30 (5 categories × 6 per day)
- **API Calls**: 270
- **Cost**: $0.63-2.55 per day
- **Content Generated**:
  - 180-300 embeds
  - 120 articles
  - 90-150 charts

### Monthly Costs

| Scale | Collections/Day | Monthly Cost |
|-------|----------------|--------------|
| Small | 10 | $6-25 |
| Medium | 30 | $19-77 |
| Large | 100 | $63-255 |

## Performance

### Execution Times

| Function | Average | Range |
|----------|---------|-------|
| hub-discover-content | 3s | 2-4s |
| hub-generate-article | 18s | 15-25s |
| hub-generate-charts | 7s | 5-10s |
| hub-create-collection | 90s | 70-120s |

### Bottlenecks

1. **Article Generation** (60-100s total)
   - 4 articles × 15-25s each
   - Main bottleneck for collection creation

2. **Solutions**:
   - Parallel article generation (future)
   - Background job queue (future)
   - Cache discovery results

## Database Schema

### Tables Created

1. **gv_hub_collections**
   - Main collection records
   - Groups embeds, articles, charts

2. **gv_hub_embedded_content**
   - Social media embeds (5-10 per collection)
   - Links to gv_creator_content

3. **gv_hub_articles**
   - AI-generated articles (4 per collection)
   - 200-500 words each
   - Linked to source content

4. **gv_hub_charts**
   - Data visualizations (3-5 per collection)
   - Chart.js format
   - Auto-generated insights

5. **gv_hub_chart_templates**
   - Reusable chart templates
   - SQL queries + Chart.js config

### Key Relationships

```
gv_hub_collections (1) ─┬─ (many) gv_hub_embedded_content
                        ├─ (many) gv_hub_articles
                        └─ (many) gv_hub_charts
```

## API Endpoints

All functions follow the same pattern:

```
POST https://your-project.supabase.co/functions/v1/{function-name}
Authorization: Bearer YOUR_ANON_KEY
Content-Type: application/json
```

### Authentication

- Use Supabase `anon` key for public access
- Service role key used internally
- No user authentication required

## Error Handling

### Graceful Degradation

The system is designed to handle partial failures:

```javascript
// Example: If 1 article fails, collection still created with 3 articles
{
  collection_id: "uuid",
  tabs: {
    embeds: 7,      // ✓ Success
    articles: 3,    // ⚠ Partial (4 expected)
    charts: 3       // ✓ Success
  }
}
```

### Retry Logic

Built-in retry for transient errors:
- 3 attempts with exponential backoff
- Logs all failures
- Continues with other operations

## Monitoring

### Key Metrics

Track these in production:

```javascript
{
  daily_collections: 30,
  success_rate: 0.95,
  avg_cost_per_collection: 0.05,
  avg_execution_time: 85,
  articles_generated: 120,
  charts_generated: 90
}
```

### Logging

All functions log:
- Timestamps for each step
- API costs
- Errors and warnings
- Performance metrics

## Testing

### Local Testing

```bash
# Start local Supabase
supabase start

# Serve all functions
supabase functions serve

# Test in another terminal
curl -X POST http://localhost:54321/functions/v1/hub-create-collection \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"category": "beauty"}'
```

### Unit Tests

```bash
# Test discovery only
curl -X POST http://localhost:54321/functions/v1/hub-discover-content \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"category": "beauty", "article_type": "hot", "count": 5}'
```

## Automation

### Daily Cron Job

```javascript
// Deno Deploy cron
Deno.cron("Daily Hub Collections", "0 2 * * *", async () => {
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

### Supabase pg_cron

```sql
-- Schedule daily batches
SELECT cron.schedule(
  'daily-hub-collections-beauty',
  '0 2 * * *',
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

### 1. Cost Management
- Monitor daily API costs
- Set budget alerts
- Use shorter articles for testing

### 2. Quality Control
- Manually review first 10 collections
- Check neutrality scores
- Verify chart accuracy

### 3. Rate Limiting
- Add delays between batch requests
- Respect API rate limits
- Use exponential backoff

### 4. Error Handling
- Log all errors
- Set up alerts for failures
- Review error patterns weekly

### 5. Performance
- Run during off-peak hours (2-4 AM)
- Consider parallel processing
- Cache common queries

## Troubleshooting

### Common Issues

**1. "PERPLEXITY_API_KEY not set"**
```bash
supabase secrets set PERPLEXITY_API_KEY=your_key
```

**2. "No relevant content found"**
- Check if category has content in database
- Verify gv_creator_content table has data
- Try different category

**3. "Article failed quality checks"**
- Check word count constraints
- Review neutrality detection
- Adjust target_words parameter

**4. "Collection created but no articles"**
- Check API keys are set
- Review function logs
- Test article generation separately

**5. High costs**
- Reduce number of categories
- Lower article count
- Use shorter word counts

## Support

For detailed documentation on each function, see:
- [hub-discover-content/README.md](./hub-discover-content/README.md)
- [hub-generate-article/README.md](./hub-generate-article/README.md)
- [hub-generate-charts/README.md](./hub-generate-charts/README.md)
- [hub-create-collection/README.md](./hub-create-collection/README.md)

For issues or questions, contact the development team.

## License

Proprietary - Geovera Platform
