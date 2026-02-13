# Integration Guide: Radar Content Analysis

Complete guide for integrating the Claude content analysis function into the Geovera Radar pipeline.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Pipeline Integration](#pipeline-integration)
3. [Frontend Integration](#frontend-integration)
4. [Workflow Automation](#workflow-automation)
5. [Performance Optimization](#performance-optimization)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Deploy the Function

```bash
cd supabase/functions/radar-analyze-content
./deploy.sh
```

### 2. Set Environment Variables

```bash
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Test the Function

```bash
# Test single analysis
curl -X POST 'https://[project-ref].supabase.co/functions/v1/radar-analyze-content' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [SUPABASE_ANON_KEY]' \
  -d '{"content_id": "uuid-here"}'

# Test batch analysis
curl -X POST 'https://[project-ref].supabase.co/functions/v1/radar-analyze-content' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [SUPABASE_ANON_KEY]' \
  -d '{"batch": true, "category": "beauty"}'
```

---

## Pipeline Integration

### Phase 1: Content Ingestion

After Apify scrapes content, insert into database with `analysis_status = 'pending'`.

```typescript
// After Apify scraping
const scrapedPosts = await apify.run("instagram-scraper", { ... });

// Insert into database
const { data: insertedContent } = await supabase
  .from("gv_creator_content")
  .insert(
    scrapedPosts.map((post) => ({
      creator_id: creatorId,
      platform: "instagram",
      post_id: post.id,
      post_url: post.url,
      caption: post.caption,
      hashtags: post.hashtags,
      likes: post.likes,
      comments: post.comments,
      analysis_status: "pending", // Ready for analysis
    }))
  )
  .select("id");
```

### Phase 2: Trigger Analysis

**Option A: Immediate Analysis (for real-time needs)**

```typescript
// Analyze each post immediately after insertion
for (const content of insertedContent) {
  await supabase.functions.invoke("radar-analyze-content", {
    body: { content_id: content.id },
  });
}
```

**Option B: Batch Analysis (recommended for cost efficiency)**

```typescript
// Trigger batch analysis once scraping is complete
await supabase.functions.invoke("radar-analyze-content", {
  body: {
    batch: true,
    category: "beauty",
  },
});
```

### Phase 3: Score Aggregation

After analysis completes, aggregate scores for creator rankings:

```typescript
// Calculate creator averages
const { data: creatorScores } = await supabase
  .from("gv_creator_content")
  .select("creator_id, content_quality_score, originality_score")
  .eq("analysis_status", "completed")
  .not("content_quality_score", "is", null);

const creatorAverages = creatorScores.reduce((acc, score) => {
  if (!acc[score.creator_id]) {
    acc[score.creator_id] = { quality: [], originality: [] };
  }
  acc[score.creator_id].quality.push(score.content_quality_score);
  acc[score.creator_id].originality.push(score.originality_score);
  return acc;
}, {});

// Use averages in ranking calculation
for (const [creatorId, scores] of Object.entries(creatorAverages)) {
  const avgQuality = scores.quality.reduce((a, b) => a + b, 0) / scores.quality.length;
  const avgOriginality = scores.originality.reduce((a, b) => a + b, 0) / scores.originality.length;

  // Calculate weighted score for rankings
  const weightedScore = totalReach * avgQuality * avgOriginality;

  // Store in gv_creator_rankings
}
```

### Phase 4: Brand Marketshare Calculation

Extract brand mentions and calculate marketshare:

```typescript
// Get all brand mentions for a category
const { data: brandMentions } = await supabase
  .from("gv_creator_content")
  .select("brand_mentions, creator_id, reach, gv_creators!inner(category)")
  .eq("gv_creators.category", "beauty")
  .eq("analysis_status", "completed")
  .not("brand_mentions", "eq", "[]");

// Aggregate by brand
const brandStats = brandMentions.reduce((acc, content) => {
  for (const mention of content.brand_mentions) {
    if (!acc[mention.brand]) {
      acc[mention.brand] = {
        totalMentions: 0,
        totalReach: 0,
        organicCount: 0,
        paidCount: 0,
      };
    }
    acc[mention.brand].totalMentions++;
    acc[mention.brand].totalReach += content.reach || 0;
    acc[mention.brand][mention.type === "organic" ? "organicCount" : "paidCount"]++;
  }
  return acc;
}, {});

// Calculate marketshare percentage
const totalReach = Object.values(brandStats).reduce((sum, b) => sum + b.totalReach, 0);

for (const [brand, stats] of Object.entries(brandStats)) {
  const marketsharePercentage = (stats.totalReach / totalReach) * 100;

  // Store in gv_brand_marketshare
  await supabase.from("gv_brand_marketshare").insert({
    brand_name: brand,
    category: "beauty",
    snapshot_date: new Date().toISOString().split("T")[0],
    total_creator_mentions: stats.totalMentions,
    total_reach: stats.totalReach,
    marketshare_percentage: marketsharePercentage,
    organic_mentions: stats.organicCount,
    paid_mentions: stats.paidCount,
  });
}
```

---

## Frontend Integration

### Display Analysis Results

```typescript
// Fetch analyzed content for a creator
const { data: content } = await supabase
  .from("gv_creator_content")
  .select("*, gv_creators(*)")
  .eq("creator_id", creatorId)
  .eq("analysis_status", "completed")
  .order("content_quality_score", { ascending: false });

// Display in UI
{content.map((post) => (
  <ContentCard key={post.id}>
    <h3>{post.caption}</h3>
    <div className="scores">
      <Badge>Quality: {(post.content_quality_score * 100).toFixed(0)}%</Badge>
      <Badge>Originality: {(post.originality_score * 100).toFixed(0)}%</Badge>
    </div>
    {post.brand_mentions.length > 0 && (
      <div className="brands">
        {post.brand_mentions.map((mention) => (
          <Chip key={mention.brand} type={mention.type}>
            {mention.brand}
          </Chip>
        ))}
      </div>
    )}
  </ContentCard>
))}
```

### Real-time Progress Tracking

```typescript
// Subscribe to analysis progress
const subscription = supabase
  .channel("content-analysis")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "gv_creator_content",
      filter: `creator_id=eq.${creatorId}`,
    },
    (payload) => {
      console.log("Analysis update:", payload.new);
      // Update UI with new status
      if (payload.new.analysis_status === "completed") {
        refetchContent();
      }
    }
  )
  .subscribe();
```

### Trigger Analysis from UI

```typescript
// Button to trigger batch analysis
async function handleAnalyzeCategory(category: string) {
  setIsAnalyzing(true);

  try {
    const { data, error } = await supabase.functions.invoke("radar-analyze-content", {
      body: { batch: true, category },
    });

    if (error) throw error;

    toast.success(`Analyzed ${data.result.processed} posts`);
    toast.info(`Cost: $${data.result.total_cost_usd.toFixed(4)}`);
  } catch (err) {
    toast.error("Analysis failed");
  } finally {
    setIsAnalyzing(false);
  }
}
```

---

## Workflow Automation

### Cron Job: Daily Batch Analysis

**Setup (using Supabase Edge Functions + pg_cron)**

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily analysis at 2 AM UTC
SELECT cron.schedule(
  'daily-content-analysis',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/radar-analyze-content',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb,
    body := '{"batch": true, "category": "beauty"}'::jsonb
  );
  $$
);
```

**Alternative: GitHub Actions**

```yaml
# .github/workflows/daily-analysis.yml
name: Daily Content Analysis

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:  # Manual trigger

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Analyze Beauty Category
        run: |
          curl -X POST '${{ secrets.SUPABASE_URL }}/functions/v1/radar-analyze-content' \
            -H 'Content-Type: application/json' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}' \
            -d '{"batch": true, "category": "beauty"}'

      - name: Analyze Fashion Category
        run: |
          curl -X POST '${{ secrets.SUPABASE_URL }}/functions/v1/radar-analyze-content' \
            -H 'Content-Type: application/json' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}' \
            -d '{"batch": true, "category": "fashion"}'
```

### Webhook: Trigger After Apify Completes

```typescript
// Apify webhook handler
export async function POST(request: Request) {
  const { status, actorRunId, datasetId } = await request.json();

  if (status === "SUCCEEDED") {
    // Trigger content analysis
    const category = extractCategoryFromRun(actorRunId);

    await supabase.functions.invoke("radar-analyze-content", {
      body: { batch: true, category },
    });

    return new Response("Analysis triggered", { status: 200 });
  }

  return new Response("Ignored", { status: 200 });
}
```

---

## Performance Optimization

### 1. Batch Size Tuning

Adjust chunk size based on rate limits and performance:

```typescript
// In index.ts, modify CHUNK_SIZE
const CHUNK_SIZE = 10; // Default: 10 posts per API call

// For faster processing (if rate limits allow):
const CHUNK_SIZE = 20;

// For lower rate limits:
const CHUNK_SIZE = 5;
```

### 2. Parallel Category Processing

Process multiple categories simultaneously:

```typescript
const categories = ["beauty", "fashion", "lifestyle", "food", "tech"];

await Promise.all(
  categories.map((category) =>
    supabase.functions.invoke("radar-analyze-content", {
      body: { batch: true, category },
    })
  )
);
```

### 3. Database Indexing

Ensure proper indexes for fast queries:

```sql
-- Already created in migration, but verify:
CREATE INDEX IF NOT EXISTS idx_creator_content_analysis_status
  ON gv_creator_content(analysis_status);

CREATE INDEX IF NOT EXISTS idx_creator_content_category_pending
  ON gv_creator_content(analysis_status)
  WHERE analysis_status = 'pending';
```

### 4. Prompt Caching Validation

Monitor cache hit rates:

```typescript
// After batch analysis, check cache efficiency
const cacheHitRate = (usage.cache_read_input_tokens / usage.input_tokens) * 100;
console.log(`Cache hit rate: ${cacheHitRate.toFixed(1)}%`);

// Target: >90% cache hit rate for batch operations
if (cacheHitRate < 90) {
  console.warn("Low cache hit rate. Check Claude API configuration.");
}
```

---

## Troubleshooting

### Issue: High Analysis Costs

**Symptoms:** Costs exceeding budget expectations.

**Solutions:**
1. Enable prompt caching (already enabled in batch mode)
2. Reduce batch size to test caching effectiveness
3. Monitor cache hit rates in logs
4. Consider analyzing only top creators first

```typescript
// Prioritize high-follower creators
const { data } = await supabase
  .from("gv_creator_content")
  .select("*, gv_creators!inner(follower_count)")
  .eq("analysis_status", "pending")
  .gte("gv_creators.follower_count", 500000)
  .order("gv_creators.follower_count", { ascending: false });
```

### Issue: Rate Limit Errors

**Symptoms:** 429 errors from Claude API.

**Solutions:**
1. Increase delay between chunks (default: 1s)
2. Reduce CHUNK_SIZE
3. Implement exponential backoff

```typescript
// Add exponential backoff
async function analyzeWithRetry(content, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await analyzeWithClaude(content, true);
    } catch (err) {
      if (err.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}
```

### Issue: Inconsistent Scores

**Symptoms:** Scores don't match manual review.

**Solutions:**
1. Review system prompt for clarity
2. Add more examples to prompt
3. Adjust temperature (default: 0.3)
4. Sample and manually review 5% of analyses

```typescript
// Lower temperature for more consistent scoring
const requestBody = {
  model: CLAUDE_MODEL,
  temperature: 0.1, // Lower = more deterministic
  // ...
};
```

### Issue: Missing Brand Mentions

**Symptoms:** Claude not detecting obvious brand names.

**Solutions:**
1. Add common Indonesian brand names to prompt
2. Check for non-English brand names
3. Review caption preprocessing

```typescript
// Add brand context to system prompt
const BRAND_CONTEXT = `
Common Indonesian brands to watch for:
- Beauty: Wardah, Emina, Make Over, Sariayu, Pixy
- Fashion: Erigo, 3Second, UNIQLO, Zara
- Food: Indomie, ABC, Chitato, Teh Botol Sosro
`;

// Append to SYSTEM_PROMPT
```

### Issue: Slow Batch Processing

**Symptoms:** Batch analysis takes >30 minutes.

**Solutions:**
1. Increase CHUNK_SIZE (if rate limits allow)
2. Reduce delay between chunks
3. Process categories in parallel
4. Use database pooling

```typescript
// Parallel chunk processing (if API limits allow)
const chunks = chunkArray(pendingContent, CHUNK_SIZE);
await Promise.all(chunks.map((chunk) => processChunk(chunk)));
```

---

## Monitoring and Alerts

### Key Metrics to Track

1. **Analysis completion rate**: Target >95%
2. **Average cost per analysis**: Target <$0.005
3. **Cache hit rate**: Target >90%
4. **Processing time**: Target <1 minute per 10 posts
5. **Failed analyses**: Target <5%

### Setup Alerts

```typescript
// Alert if costs exceed threshold
if (totalCost > 10.0) {
  await sendAlert("High analysis costs", `Total: $${totalCost.toFixed(2)}`);
}

// Alert if failure rate is high
const failureRate = (failed / (processed + failed)) * 100;
if (failureRate > 10) {
  await sendAlert("High failure rate", `${failureRate.toFixed(1)}% failed`);
}
```

---

## Next Steps

1. **Deploy function**: Run `./deploy.sh`
2. **Test with sample data**: Analyze 10 posts manually
3. **Monitor costs**: Track first batch analysis
4. **Integrate into pipeline**: Connect to Apify scraper
5. **Setup automation**: Configure cron jobs
6. **Monitor and optimize**: Review metrics weekly

For support, check function logs:
```bash
supabase functions logs radar-analyze-content --follow
```
