# SerpAPI Integration Examples

## Quick Start Examples

### 1. Scrape YouTube Channel Stats

**Use Case:** Get subscriber count and basic stats for a YouTube creator.

```typescript
const response = await fetch(
  'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operation: 'youtube_channel',
      creator_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      youtube_handle: '@tasya_farasya'
    })
  }
);

const result = await response.json();
console.log(result);
```

**Response:**
```json
{
  "success": true,
  "operation": "youtube_channel",
  "cost_usd": 0.001,
  "result": {
    "creator_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "youtube_handle": "@tasya_farasya",
    "stats": {
      "subscriber_count": 1800000,
      "video_count": 450,
      "view_count": 125000000,
      "description": "Beauty enthusiast sharing makeup tutorials and reviews",
      "custom_url": "https://youtube.com/@tasya_farasya",
      "verified": true
    }
  }
}
```

---

### 2. Scrape Recent YouTube Videos

**Use Case:** Get recent videos to analyze content strategy.

```typescript
const response = await fetch(
  'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operation: 'youtube_videos',
      creator_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      youtube_handle: '@tasya_farasya'
    })
  }
);

const result = await response.json();
console.log(result);
```

**Response:**
```json
{
  "success": true,
  "operation": "youtube_videos",
  "cost_usd": 0.001,
  "result": {
    "creator_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "youtube_handle": "@tasya_farasya",
    "scraped_count": 20,
    "filtered_count": 15,
    "saved_count": 9
  }
}
```

**Database Result:**
The function automatically saves 9 top-performing videos to `gv_creator_content`:

```sql
SELECT
  post_id,
  caption,
  views,
  engagement_total,
  posted_at
FROM gv_creator_content
WHERE creator_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  AND platform = 'youtube'
ORDER BY posted_at DESC
LIMIT 9;
```

---

### 3. Discover Google Trends

**Use Case:** Find rising beauty trends in Indonesia.

```typescript
const response = await fetch(
  'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operation: 'google_trends',
      category: 'beauty',
      country: 'ID',
      timeframe: 'now 7-d'
    })
  }
);

const result = await response.json();
console.log(result);
```

**Response:**
```json
{
  "success": true,
  "operation": "google_trends",
  "cost_usd": 0.001,
  "result": {
    "category": "beauty",
    "country": "ID",
    "timeframe": "now 7-d",
    "trends_count": 15,
    "saved_count": 15
  }
}
```

**Database Result:**
The function saves trends to `gv_trends`:

```sql
SELECT
  trend_name,
  status,
  growth_rate,
  first_detected_at
FROM gv_trends
WHERE category = 'beauty'
  AND status = 'rising'
ORDER BY growth_rate DESC
LIMIT 10;
```

**Example Trends:**
- "korean skincare routine"
- "makeup natural sehari hari"
- "cara pakai cushion"
- "sunscreen untuk kulit berminyak"

---

### 4. Batch Process Multiple Creators

**Use Case:** Weekly update for all YouTube creators in the database.

```typescript
// Fetch all YouTube creators
const { data: creators } = await supabase
  .from('gv_creators')
  .select('id, youtube_handle')
  .not('youtube_handle', 'is', null)
  .eq('platform_primary', 'youtube');

// Batch process (max 50 at a time to avoid timeout)
const batchSize = 50;
const batches = [];

for (let i = 0; i < creators.length; i += batchSize) {
  const batch = creators.slice(i, i + batchSize);

  const response = await fetch(
    'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'batch_youtube',
        batch_creators: batch.map(c => ({
          creator_id: c.id,
          youtube_handle: c.youtube_handle
        }))
      })
    }
  );

  const result = await response.json();
  batches.push(result);
}

console.log('Total batches processed:', batches.length);
```

**Response (per batch):**
```json
{
  "success": true,
  "operation": "batch_youtube",
  "cost_usd": 0.05,
  "result": {
    "batch_size": 50,
    "processed": 50,
    "successful": 48,
    "failed": 2,
    "results": [
      {
        "creator_id": "uuid-1",
        "youtube_handle": "@creator1",
        "success": true,
        "stats": { ... }
      },
      // ... 49 more results
    ]
  }
}
```

---

## Advanced Examples

### 5. Weekly YouTube Content Scraping Workflow

**Use Case:** Automated weekly content scraping for all YouTube creators.

```typescript
async function weeklyYouTubeScraping() {
  // Get all active YouTube creators
  const { data: creators } = await supabase
    .from('gv_creators')
    .select('id, name, youtube_handle')
    .not('youtube_handle', 'is', null)
    .eq('is_active', true)
    .order('follower_count', { ascending: false });

  console.log(`Processing ${creators.length} YouTube creators...`);

  let totalCost = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const creator of creators) {
    try {
      // 1. Update channel stats
      const statsResponse = await fetch(
        'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            operation: 'youtube_channel',
            creator_id: creator.id,
            youtube_handle: creator.youtube_handle
          })
        }
      );

      const statsResult = await statsResponse.json();
      if (!statsResult.success) {
        throw new Error(statsResult.error);
      }

      totalCost += statsResult.cost_usd;

      // 2. Scrape recent videos
      const videosResponse = await fetch(
        'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            operation: 'youtube_videos',
            creator_id: creator.id,
            youtube_handle: creator.youtube_handle
          })
        }
      );

      const videosResult = await videosResponse.json();
      if (!videosResult.success) {
        throw new Error(videosResult.error);
      }

      totalCost += videosResult.cost_usd;
      successCount++;

      console.log(`✓ ${creator.name}: ${videosResult.result.saved_count} videos saved`);

      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`✗ ${creator.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n=== Weekly YouTube Scraping Summary ===');
  console.log(`Total creators: ${creators.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);
}

// Run weekly (every Monday at 2 AM)
weeklyYouTubeScraping();
```

---

### 6. Daily Google Trends Discovery

**Use Case:** Discover trending topics daily across all categories.

```typescript
async function dailyTrendsDiscovery() {
  const categories = [
    'beauty',
    'fashion',
    'skincare',
    'makeup',
    'food',
    'fitness',
    'lifestyle'
  ];

  const country = 'ID'; // Indonesia
  const timeframe = 'now 7-d'; // Last 7 days

  let totalCost = 0;
  let totalTrends = 0;

  for (const category of categories) {
    try {
      const response = await fetch(
        'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            operation: 'google_trends',
            category,
            country,
            timeframe
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        totalCost += result.cost_usd;
        totalTrends += result.result.saved_count;
        console.log(`✓ ${category}: ${result.result.saved_count} trends discovered`);
      } else {
        console.error(`✗ ${category}: ${result.error}`);
      }

      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`✗ ${category}:`, error.message);
    }
  }

  console.log('\n=== Daily Trends Discovery Summary ===');
  console.log(`Categories processed: ${categories.length}`);
  console.log(`Total trends found: ${totalTrends}`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);

  // Query top rising trends
  const { data: risingTrends } = await supabase
    .from('gv_trends')
    .select('*')
    .eq('status', 'rising')
    .gte('first_detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('growth_rate', { ascending: false })
    .limit(10);

  console.log('\n=== Top 10 Rising Trends ===');
  risingTrends?.forEach((trend, idx) => {
    console.log(`${idx + 1}. ${trend.trend_name} (${trend.category}) - Growth: ${trend.growth_rate}%`);
  });
}

// Run daily at 1 AM
dailyTrendsDiscovery();
```

---

### 7. Competitor YouTube Analysis

**Use Case:** Compare your brand's YouTube presence with competitors.

```typescript
async function compareYouTubeCompetitors(yourBrandId: string) {
  // Get your brand's discovered competitors
  const { data: competitors } = await supabase
    .from('gv_discovered_brands')
    .select('id, discovered_brand_name, youtube_handle')
    .eq('brand_id', yourBrandId)
    .not('youtube_handle', 'is', null)
    .eq('is_active', true);

  const results = [];

  for (const competitor of competitors || []) {
    // For discovered brands, we need to find or create a creator record
    // Or just scrape stats directly

    const response = await fetch(
      'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'youtube_channel',
          creator_id: competitor.id, // Using competitor ID
          youtube_handle: competitor.youtube_handle
        })
      }
    );

    const result = await response.json();

    if (result.success) {
      results.push({
        brand: competitor.discovered_brand_name,
        handle: competitor.youtube_handle,
        subscribers: result.result.stats.subscriber_count,
        videos: result.result.stats.video_count,
        views: result.result.stats.view_count
      });
    }
  }

  // Sort by subscribers
  results.sort((a, b) => b.subscribers - a.subscribers);

  console.log('\n=== YouTube Competitor Analysis ===');
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.brand} (${r.handle})`);
    console.log(`   Subscribers: ${r.subscribers.toLocaleString()}`);
    console.log(`   Videos: ${r.videos.toLocaleString()}`);
    console.log(`   Total Views: ${r.views.toLocaleString()}`);
    console.log('');
  });

  return results;
}

// Example usage
compareYouTubeCompetitors('your-brand-id-here');
```

---

### 8. Trend-Based Content Opportunity Detection

**Use Case:** Find trending topics not yet covered by creators in your category.

```typescript
async function detectContentOpportunities(category: string) {
  // 1. Get trending topics from Google Trends
  await fetch(
    'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'google_trends',
        category,
        country: 'ID',
        timeframe: 'now 7-d'
      })
    }
  );

  // 2. Get rising trends from database
  const { data: trends } = await supabase
    .from('gv_trends')
    .select('*')
    .eq('category', category)
    .eq('status', 'rising')
    .order('growth_rate', { ascending: false })
    .limit(20);

  // 3. Get creator content from last 30 days
  const { data: recentContent } = await supabase
    .from('gv_creator_content')
    .select('caption, hashtags')
    .gte('posted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // 4. Find trends not covered by creators
  const opportunities = trends?.filter(trend => {
    const trendKeyword = trend.trend_name.toLowerCase();

    const isCovered = recentContent?.some(content => {
      const caption = (content.caption || '').toLowerCase();
      const hashtags = (content.hashtags || []).join(' ').toLowerCase();
      return caption.includes(trendKeyword) || hashtags.includes(trendKeyword);
    });

    return !isCovered;
  });

  console.log('\n=== Content Opportunities ===');
  console.log(`Category: ${category}`);
  console.log(`Rising trends: ${trends?.length || 0}`);
  console.log(`Uncovered opportunities: ${opportunities?.length || 0}\n`);

  opportunities?.forEach((opp, idx) => {
    console.log(`${idx + 1}. "${opp.trend_name}"`);
    console.log(`   Growth: ${opp.growth_rate}%`);
    console.log(`   First detected: ${opp.first_detected_at}`);
    console.log('');
  });

  return opportunities;
}

// Example usage
detectContentOpportunities('beauty');
```

---

## Error Handling Examples

### 9. Robust Error Handling

```typescript
async function scrapeWithRetry(
  operation: string,
  payload: any,
  maxRetries: number = 3
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ operation, ...payload })
        }
      );

      const result = await response.json();

      if (result.success) {
        return result;
      }

      // Handle specific error codes
      if (result.code === 'RATE_LIMIT_EXCEEDED') {
        console.log(`Rate limit hit on attempt ${attempt}, waiting 60s...`);
        await new Promise(resolve => setTimeout(resolve, 60000));
        continue;
      }

      if (result.code === 'TIMEOUT') {
        console.log(`Timeout on attempt ${attempt}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      throw new Error(result.error);

    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Waiting ${backoff}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

// Example usage
try {
  const result = await scrapeWithRetry('youtube_channel', {
    creator_id: 'uuid',
    youtube_handle: '@channel'
  });
  console.log('Success:', result);
} catch (error) {
  console.error('All retries failed:', error.message);
}
```

---

## Testing Examples

### 10. Test Suite

```typescript
async function testSerpAPIIntegration() {
  console.log('=== SerpAPI Integration Tests ===\n');

  // Test 1: YouTube Channel Stats
  console.log('Test 1: YouTube Channel Stats');
  try {
    const result = await fetch(
      'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'youtube_channel',
          creator_id: 'test-uuid',
          youtube_handle: '@mkbhd'
        })
      }
    ).then(r => r.json());

    console.log('✓ PASS:', result.success ? 'Success' : 'Failed');
    console.log('  Cost:', `$${result.cost_usd}`);
    console.log('  Subscribers:', result.result?.stats?.subscriber_count || 'N/A');
  } catch (error) {
    console.log('✗ FAIL:', error.message);
  }

  console.log('\n---\n');

  // Test 2: YouTube Videos
  console.log('Test 2: YouTube Recent Videos');
  try {
    const result = await fetch(
      'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'youtube_videos',
          creator_id: 'test-uuid',
          youtube_handle: '@mkbhd'
        })
      }
    ).then(r => r.json());

    console.log('✓ PASS:', result.success ? 'Success' : 'Failed');
    console.log('  Cost:', `$${result.cost_usd}`);
    console.log('  Videos saved:', result.result?.saved_count || 0);
  } catch (error) {
    console.log('✗ FAIL:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Google Trends
  console.log('Test 3: Google Trends');
  try {
    const result = await fetch(
      'https://geovera.xyz/functions/v1/radar-scrape-serpapi',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'google_trends',
          category: 'beauty',
          country: 'ID',
          timeframe: 'now 7-d'
        })
      }
    ).then(r => r.json());

    console.log('✓ PASS:', result.success ? 'Success' : 'Failed');
    console.log('  Cost:', `$${result.cost_usd}`);
    console.log('  Trends found:', result.result?.trends_count || 0);
  } catch (error) {
    console.log('✗ FAIL:', error.message);
  }

  console.log('\n=== Tests Complete ===');
}

// Run tests
testSerpAPIIntegration();
```

---

## Cost Monitoring Examples

### 11. Monthly Cost Tracking

```typescript
async function trackMonthlyCost() {
  // Calculate expected monthly cost
  const youtubeCreators = 240;
  const weeklyScrapesPerCreator = 1;
  const weeksPerMonth = 4;

  const youtubeChannelCost = youtubeCreators * weeklyScrapesPerCreator * weeksPerMonth * 0.001;
  const youtubeVideosCost = youtubeCreators * weeklyScrapesPerCreator * weeksPerMonth * 0.001;

  const categories = 7;
  const daysPerMonth = 30;
  const trendsCost = categories * daysPerMonth * 0.001;

  const totalExpected = youtubeChannelCost + youtubeVideosCost + trendsCost;

  console.log('=== SerpAPI Cost Projection ===');
  console.log(`YouTube Channel Stats: $${youtubeChannelCost.toFixed(2)}`);
  console.log(`YouTube Videos: $${youtubeVideosCost.toFixed(2)}`);
  console.log(`Google Trends: $${trendsCost.toFixed(2)}`);
  console.log(`Total: $${totalExpected.toFixed(2)}/month`);
  console.log('\nCompare to Apify: $24.00/month');
  console.log(`Savings: $${(24 - totalExpected).toFixed(2)}/month (${((1 - totalExpected/24) * 100).toFixed(0)}%)`);
}

trackMonthlyCost();
```

---

These examples demonstrate the full capabilities of the SerpAPI integration, from basic operations to advanced workflows and error handling.
