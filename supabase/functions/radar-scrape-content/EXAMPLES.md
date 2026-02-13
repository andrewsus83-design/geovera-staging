# Usage Examples: radar-scrape-content

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Batch Processing](#batch-processing)
3. [Error Handling](#error-handling)
4. [Monitoring](#monitoring)
5. [Orchestration](#orchestration)

## Basic Usage

### Example 1: Scrape Single Creator (Instagram)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get user token
const { data: { session } } = await supabase.auth.getSession();

// Scrape Instagram
const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    creator_id: '123e4567-e89b-12d3-a456-426614174000',
    platform: 'instagram'
  })
});

const result = await response.json();

if (result.success) {
  console.log(`✅ Scraped ${result.scraped_count} posts`);
  console.log(`✅ Saved ${result.saved_count} quality posts`);
  console.log(`📊 Filtered out: ${result.summary.removed_promo} promo posts`);
} else {
  console.error(`❌ Error: ${result.error}`);
}
```

### Example 2: Scrape Multiple Platforms

```typescript
async function scrapeAllPlatforms(creatorId: string) {
  const platforms = ['instagram', 'tiktok', 'youtube'];
  const results = [];

  for (const platform of platforms) {
    console.log(`Scraping ${platform}...`);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creator_id: creatorId, platform })
    });

    const result = await response.json();
    results.push({ platform, ...result });

    // Wait 5 seconds between platforms to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  return results;
}

// Usage
const results = await scrapeAllPlatforms('creator-uuid');
console.log('Total posts saved:', results.reduce((sum, r) => sum + r.saved_count, 0));
```

## Batch Processing

### Example 3: Scrape All Creators in Category

```typescript
async function scrapeCategoryCreators(category: string) {
  // Get creators from database
  const { data: creators } = await supabase
    .from('gv_creators')
    .select('id, name, platform_primary, instagram_handle, tiktok_handle, youtube_handle')
    .eq('category', category)
    .eq('is_active', true)
    .order('follower_count', { ascending: false })
    .limit(50);

  console.log(`Found ${creators.length} creators in ${category}`);

  const results = [];

  for (const creator of creators) {
    // Skip if no handle for primary platform
    const platformHandle = creator[`${creator.platform_primary}_handle`];
    if (!platformHandle) {
      console.log(`⚠️  ${creator.name}: No ${creator.platform_primary} handle, skipping`);
      continue;
    }

    console.log(`\nScraping ${creator.name} (${creator.platform_primary})...`);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator_id: creator.id,
          platform: creator.platform_primary
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`  ✅ Saved ${result.saved_count} posts`);
        results.push({ creator: creator.name, ...result });
      } else {
        console.log(`  ❌ Error: ${result.error}`);
      }

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }

    // Wait 5 seconds between creators
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total creators processed: ${results.length}`);
  console.log(`Total posts saved: ${results.reduce((sum, r) => sum + r.saved_count, 0)}`);

  return results;
}

// Usage
await scrapeCategoryCreators('beauty');
```

### Example 4: Parallel Batch Processing

```typescript
async function scrapeCreatorsBatch(creatorIds: string[], platform: string, batchSize = 5) {
  const results = [];

  // Process in batches
  for (let i = 0; i < creatorIds.length; i += batchSize) {
    const batch = creatorIds.slice(i, i + batchSize);

    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}...`);

    // Scrape batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(creatorId =>
        fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ creator_id: creatorId, platform })
        }).then(r => r.json())
      )
    );

    // Collect results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`❌ Batch error: ${result.reason}`);
      }
    }

    // Wait 10 seconds between batches
    if (i + batchSize < creatorIds.length) {
      console.log('Waiting 10 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  return results;
}

// Usage
const creatorIds = ['uuid1', 'uuid2', 'uuid3', ...];
const results = await scrapeCreatorsBatch(creatorIds, 'instagram', 5);
```

## Error Handling

### Example 5: Retry on Failure

```typescript
async function scrapeWithRetry(
  creatorId: string,
  platform: string,
  maxRetries = 3,
  delayMs = 5000
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}...`);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creator_id: creatorId, platform })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Success on attempt ${attempt}`);
        return result;
      }

      // Handle specific error codes
      if (result.code === 'RATE_LIMIT_EXCEEDED') {
        console.log('⏳ Rate limit hit, waiting 5 minutes...');
        await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutes
        continue;
      }

      if (result.code === 'TIMEOUT') {
        console.log('⏱️  Timeout, retrying...');
        lastError = result;
        continue;
      }

      // Non-retryable error
      console.error(`❌ Error: ${result.error}`);
      return result;

    } catch (error) {
      console.error(`❌ Network error: ${error.message}`);
      lastError = error;
    }

    // Wait before retry
    if (attempt < maxRetries) {
      console.log(`Waiting ${delayMs / 1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`❌ Failed after ${maxRetries} attempts`);
  throw lastError;
}

// Usage
try {
  const result = await scrapeWithRetry('creator-uuid', 'instagram');
  console.log(`Saved ${result.saved_count} posts`);
} catch (error) {
  console.error('Final failure:', error);
}
```

### Example 6: Handle Missing Handles

```typescript
async function scrapeCreatorSafely(creatorId: string) {
  // Get creator with all handles
  const { data: creator } = await supabase
    .from('gv_creators')
    .select('id, name, instagram_handle, tiktok_handle, youtube_handle')
    .eq('id', creatorId)
    .single();

  if (!creator) {
    console.error('Creator not found');
    return { success: false, error: 'Creator not found' };
  }

  // Try platforms in order of preference
  const platforms = ['instagram', 'tiktok', 'youtube'];
  const results = [];

  for (const platform of platforms) {
    const handle = creator[`${platform}_handle`];

    if (!handle) {
      console.log(`⚠️  No ${platform} handle, skipping`);
      continue;
    }

    console.log(`Scraping ${platform} (@${handle})...`);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creator_id: creatorId, platform })
    });

    const result = await response.json();
    results.push({ platform, ...result });

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  return {
    creator: creator.name,
    platforms_scraped: results.filter(r => r.success).length,
    total_posts: results.reduce((sum, r) => sum + (r.saved_count || 0), 0),
    results
  };
}
```

## Monitoring

### Example 7: Real-time Progress Monitoring

```typescript
async function scrapeWithProgress(creatorIds: string[], platform: string) {
  let completed = 0;
  let failed = 0;
  let totalPosts = 0;

  console.log(`Starting scrape for ${creatorIds.length} creators\n`);

  for (const creatorId of creatorIds) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creator_id: creatorId, platform })
      });

      const result = await response.json();

      if (result.success) {
        completed++;
        totalPosts += result.saved_count;
        console.log(`[${completed}/${creatorIds.length}] ✅ ${result.creator_name}: ${result.saved_count} posts`);
      } else {
        failed++;
        console.log(`[${completed + failed}/${creatorIds.length}] ❌ Error: ${result.error}`);
      }

    } catch (error) {
      failed++;
      console.error(`[${completed + failed}/${creatorIds.length}] ❌ Network error`);
    }

    // Progress bar
    const progress = Math.round(((completed + failed) / creatorIds.length) * 100);
    console.log(`Progress: ${'█'.repeat(progress / 5)}${'░'.repeat(20 - progress / 5)} ${progress}%\n`);

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Final summary
  console.log('\n=== Final Summary ===');
  console.log(`✅ Completed: ${completed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total posts saved: ${totalPosts}`);
  console.log(`📈 Average per creator: ${(totalPosts / completed).toFixed(1)}`);
}
```

### Example 8: Check Scraping Stats

```typescript
async function getScrapingStats(days = 7) {
  const { data, error } = await supabase
    .from('gv_creator_content')
    .select(`
      creator_id,
      platform,
      scraped_at,
      is_promo,
      is_giveaway,
      is_life_update,
      engagement_total
    `)
    .gte('scraped_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

  if (error) throw error;

  // Calculate stats
  const stats = {
    total_posts: data.length,
    by_platform: {},
    filtered_out: {
      promo: data.filter(p => p.is_promo).length,
      giveaway: data.filter(p => p.is_giveaway).length,
      life_update: data.filter(p => p.is_life_update).length
    },
    quality_posts: data.filter(p => !p.is_promo && !p.is_giveaway && !p.is_life_update).length,
    avg_engagement: data.reduce((sum, p) => sum + (p.engagement_total || 0), 0) / data.length,
    unique_creators: new Set(data.map(p => p.creator_id)).size
  };

  // By platform
  for (const post of data) {
    if (!stats.by_platform[post.platform]) {
      stats.by_platform[post.platform] = 0;
    }
    stats.by_platform[post.platform]++;
  }

  console.log('=== Scraping Stats (Last 7 Days) ===');
  console.log(`Total posts scraped: ${stats.total_posts}`);
  console.log(`Quality posts: ${stats.quality_posts}`);
  console.log(`Unique creators: ${stats.unique_creators}`);
  console.log(`\nBy platform:`);
  Object.entries(stats.by_platform).forEach(([platform, count]) => {
    console.log(`  ${platform}: ${count}`);
  });
  console.log(`\nFiltered out:`);
  console.log(`  Promo: ${stats.filtered_out.promo}`);
  console.log(`  Giveaway: ${stats.filtered_out.giveaway}`);
  console.log(`  Life update: ${stats.filtered_out.life_update}`);
  console.log(`\nAverage engagement: ${Math.round(stats.avg_engagement)}`);

  return stats;
}

// Usage
await getScrapingStats(7);
```

## Orchestration

### Example 9: Weekly Scraping Job

```typescript
async function weeklyScrapingJob() {
  console.log('🚀 Starting weekly scraping job...\n');

  // Get creators that haven't been scraped in 7 days
  const { data: creators } = await supabase
    .from('gv_creators')
    .select('id, name, platform_primary, category, last_scraped_at')
    .eq('is_active', true)
    .or('last_scraped_at.is.null,last_scraped_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('last_scraped_at', { ascending: true, nullsFirst: true })
    .limit(100);

  console.log(`Found ${creators.length} creators to scrape\n`);

  // Group by category
  const byCategory = creators.reduce((acc, creator) => {
    if (!acc[creator.category]) acc[creator.category] = [];
    acc[creator.category].push(creator);
    return acc;
  }, {});

  // Process each category
  for (const [category, categoryCreators] of Object.entries(byCategory)) {
    console.log(`\n=== Category: ${category} (${categoryCreators.length} creators) ===\n`);

    for (const creator of categoryCreators) {
      const result = await scrapeWithRetry(creator.id, creator.platform_primary);

      if (result.success) {
        console.log(`✅ ${creator.name}: ${result.saved_count} posts saved`);
      } else {
        console.log(`❌ ${creator.name}: ${result.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log(`\nCompleted ${category} category`);
  }

  console.log('\n✅ Weekly scraping job complete!');
}

// Schedule with cron or run manually
await weeklyScrapingJob();
```

### Example 10: Integration with Job Queue

```typescript
async function processScrapingQueue() {
  // Get pending jobs from queue
  const { data: jobs } = await supabase
    .from('gv_radar_processing_queue')
    .select('*')
    .eq('job_type', 'scrape_content')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('scheduled_at', { ascending: true })
    .limit(10);

  console.log(`Processing ${jobs.length} queued scraping jobs\n`);

  for (const job of jobs) {
    // Mark as processing
    await supabase
      .from('gv_radar_processing_queue')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', job.id);

    try {
      // Execute scraping
      const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator_id: job.creator_id,
          platform: job.payload.platform
        })
      });

      const result = await response.json();

      if (result.success) {
        // Mark as completed
        await supabase
          .from('gv_radar_processing_queue')
          .update({
            status: 'completed',
            result: result,
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        console.log(`✅ Job ${job.id}: ${result.saved_count} posts saved`);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error(`❌ Job ${job.id} failed: ${error.message}`);

      // Update retry count
      const retryCount = (job.retry_count || 0) + 1;
      const newStatus = retryCount >= job.max_retries ? 'failed' : 'retrying';

      await supabase
        .from('gv_radar_processing_queue')
        .update({
          status: newStatus,
          retry_count: retryCount,
          error_message: error.message
        })
        .eq('id', job.id);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\n✅ Queue processing complete');
}

// Run every hour via cron
await processScrapingQueue();
```

## Testing

### Example 11: Test Function Locally

```bash
# In terminal
supabase functions serve radar-scrape-content --env-file .env.local

# Then in another terminal
curl -X POST 'http://localhost:54321/functions/v1/radar-scrape-content' \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "creator_id": "test-uuid",
    "platform": "instagram"
  }'
```

### Example 12: Unit Test Helper

```typescript
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Helper function for testing
async function testScrapeCreator(creatorId: string, platform: string) {
  const startTime = Date.now();

  const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-scrape-content`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ creator_id: creatorId, platform })
  });

  const result = await response.json();
  const duration = Date.now() - startTime;

  console.log(`\nTest Results:`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Success: ${result.success}`);
  console.log(`Posts saved: ${result.saved_count}`);

  // Assertions
  assertEquals(result.success, true, 'Should succeed');
  assertEquals(typeof result.saved_count, 'number', 'Should return post count');

  return { result, duration };
}

// Run test
await testScrapeCreator('test-creator-uuid', 'instagram');
```
