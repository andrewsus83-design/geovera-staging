# GEOVERA SOCIAL SEARCH OPTIMIZATION (SSO)
## Smart Pagination + Delta Caching + Impact Priority + Smart Queue

---

## OVERVIEW

Social Search Optimization (SSO) tracks brand mentions and presence across social platforms and websites, prioritizing high-impact creators and sites.

### Key Features:
1. **Smart Pagination**: Efficiently process large datasets in batches
2. **Delta Caching**: Only re-process content that has changed (timestamp hash-based)
3. **Impact Priority**: Perplexity AI ranks creators/sites by impact
4. **Smart Looping Queue**: Automatic scheduling based on priority
5. **Timestamp Hash Update**: Batch processing using latest timestamp
6. **Top 500 Creators**: Per category tracking
7. **Top 1000 Sites**: Per category tracking
8. **Dynamic Update Windows**: 3D/7D/14D/28D based on impact

---

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                  SOCIAL SEARCH OPTIMIZATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STEP 1: DISCOVERY & PRIORITIZATION                             │
│  ├─→ Perplexity discovers top creators/sites per category       │
│  ├─→ Ranks by impact (reach, engagement, authority)             │
│  └─→ Saves to tracking tables (top 500 creators, 1000 sites)    │
│                                                                   │
│  STEP 2: SMART PAGINATION                                        │
│  ├─→ Process in batches (100 items per batch)                   │
│  ├─→ Parallel processing where possible                         │
│  └─→ Resume from last processed item                            │
│                                                                   │
│  STEP 3: DELTA CACHING                                           │
│  ├─→ Check timestamp hash (last_modified + content_hash)        │
│  ├─→ Skip if unchanged                                           │
│  ├─→ Process only if changed                                     │
│  └─→ Update cache with new timestamp hash                       │
│                                                                   │
│  STEP 4: SMART LOOPING QUEUE                                     │
│  ├─→ Platinum (3D): Top 100 highest impact                      │
│  ├─→ Gold (7D): Top 101-300                                     │
│  ├─→ Silver (14D): Top 301-700                                  │
│  └─→ Bronze (28D): Top 701+                                     │
│                                                                   │
│  STEP 5: BATCH PROCESSING                                        │
│  ├─→ Group by category and priority                             │
│  ├─→ Use latest timestamp for batch hash                        │
│  └─→ Process all items in batch atomically                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. CATEGORIES & TRACKING

### 2.1 Social Platform Categories

```typescript
const SOCIAL_CATEGORIES = {
  'tech_influencers': {
    platforms: ['twitter', 'linkedin', 'youtube', 'tiktok'],
    top_creators: 500,
    update_window: 'dynamic' // 3D/7D/14D/28D based on impact
  },
  'business_leaders': {
    platforms: ['linkedin', 'twitter', 'medium'],
    top_creators: 500,
    update_window: 'dynamic'
  },
  'content_creators': {
    platforms: ['youtube', 'instagram', 'tiktok', 'twitter'],
    top_creators: 500,
    update_window: 'dynamic'
  },
  'developers': {
    platforms: ['github', 'twitter', 'dev.to', 'stackoverflow'],
    top_creators: 500,
    update_window: 'dynamic'
  },
  'marketers': {
    platforms: ['twitter', 'linkedin', 'medium'],
    top_creators: 500,
    update_window: 'dynamic'
  }
};
```

### 2.2 Website Categories

```typescript
const WEBSITE_CATEGORIES = {
  'tech_news': {
    examples: ['techcrunch.com', 'theverge.com', 'wired.com', 'arstechnica.com'],
    top_sites: 1000,
    update_window: 'dynamic'
  },
  'business_news': {
    examples: ['bloomberg.com', 'forbes.com', 'businessinsider.com', 'cnbc.com'],
    top_sites: 1000,
    update_window: 'dynamic'
  },
  'developer_platforms': {
    examples: ['github.com', 'stackoverflow.com', 'dev.to', 'hackernews.com'],
    top_sites: 1000,
    update_window: 'dynamic'
  },
  'industry_blogs': {
    examples: ['medium.com', 'substack.com', 'notion.so', 'blog.*'],
    top_sites: 1000,
    update_window: 'dynamic'
  },
  'social_platforms': {
    examples: ['twitter.com', 'linkedin.com', 'reddit.com', 'facebook.com'],
    top_sites: 1000,
    update_window: 'dynamic'
  }
};
```

---

## 3. DATABASE SCHEMA

```sql
-- =====================================================
-- SOCIAL SEARCH OPTIMIZATION TABLES
-- =====================================================

-- Categories configuration
CREATE TABLE gv_sso_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT UNIQUE NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('social', 'website')),

  -- Limits
  top_creators_limit INTEGER DEFAULT 500,
  top_sites_limit INTEGER DEFAULT 1000,

  -- Metadata
  platforms JSONB, -- Array of platforms for social categories
  description TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Top creators tracking (500 per category)
CREATE TABLE gv_sso_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES gv_sso_categories(id) ON DELETE CASCADE,

  -- Creator info
  creator_name TEXT NOT NULL,
  creator_handle TEXT NOT NULL, -- @username
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'youtube', etc.
  profile_url TEXT NOT NULL,

  -- Impact metrics (from Perplexity)
  impact_score DECIMAL(10,2) NOT NULL, -- 0-100
  reach INTEGER, -- Followers/subscribers
  engagement_rate DECIMAL(5,2), -- Percentage
  authority_score DECIMAL(5,2), -- 0-100

  -- Perplexity ranking
  perplexity_rank INTEGER NOT NULL, -- 1-500
  perplexity_reasoning TEXT,

  -- Priority queue assignment
  queue_priority TEXT NOT NULL CHECK (queue_priority IN ('platinum', 'gold', 'silver', 'bronze')),
  update_window_days INTEGER NOT NULL, -- 3, 7, 14, or 28

  -- Scheduling
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ NOT NULL,

  -- Delta caching
  timestamp_hash TEXT, -- MD5(last_modified + content_hash)
  last_modified_at TIMESTAMPTZ,
  content_snapshot_hash TEXT, -- Hash of last content snapshot

  -- Metadata
  metadata JSONB, -- Additional data from Perplexity

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, category_id, creator_handle, platform)
);

CREATE INDEX idx_sso_creators_brand ON gv_sso_creators(brand_id);
CREATE INDEX idx_sso_creators_category ON gv_sso_creators(category_id);
CREATE INDEX idx_sso_creators_priority ON gv_sso_creators(queue_priority);
CREATE INDEX idx_sso_creators_next_check ON gv_sso_creators(next_check_at);
CREATE INDEX idx_sso_creators_rank ON gv_sso_creators(perplexity_rank);
CREATE INDEX idx_sso_creators_impact ON gv_sso_creators(impact_score DESC);

-- Top sites tracking (1000 per category)
CREATE TABLE gv_sso_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES gv_sso_categories(id) ON DELETE CASCADE,

  -- Site info
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  domain TEXT NOT NULL,

  -- Impact metrics (from Perplexity)
  impact_score DECIMAL(10,2) NOT NULL,
  domain_authority INTEGER, -- 0-100
  monthly_traffic BIGINT,
  relevance_score DECIMAL(5,2),

  -- Perplexity ranking
  perplexity_rank INTEGER NOT NULL, -- 1-1000
  perplexity_reasoning TEXT,

  -- Priority queue assignment
  queue_priority TEXT NOT NULL CHECK (queue_priority IN ('platinum', 'gold', 'silver', 'bronze')),
  update_window_days INTEGER NOT NULL,

  -- Scheduling
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ NOT NULL,

  -- Delta caching
  timestamp_hash TEXT,
  last_modified_at TIMESTAMPTZ,
  content_snapshot_hash TEXT,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, category_id, domain)
);

CREATE INDEX idx_sso_sites_brand ON gv_sso_sites(brand_id);
CREATE INDEX idx_sso_sites_category ON gv_sso_sites(category_id);
CREATE INDEX idx_sso_sites_priority ON gv_sso_sites(queue_priority);
CREATE INDEX idx_sso_sites_next_check ON gv_sso_sites(next_check_at);
CREATE INDEX idx_sso_sites_rank ON gv_sso_sites(perplexity_rank);
CREATE INDEX idx_sso_sites_impact ON gv_sso_sites(impact_score DESC);

-- Mentions tracking (from creators and sites)
CREATE TABLE gv_sso_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Source
  source_type TEXT NOT NULL CHECK (source_type IN ('creator', 'site')),
  creator_id UUID REFERENCES gv_sso_creators(id) ON DELETE CASCADE,
  site_id UUID REFERENCES gv_sso_sites(id) ON DELETE CASCADE,

  -- Mention details
  mention_url TEXT NOT NULL,
  mention_text TEXT,
  mention_context TEXT,

  -- Sentiment analysis
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(5,2), -- -1 to 1

  -- Engagement
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  -- Metadata
  mentioned_at TIMESTAMPTZ NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_mentions_brand ON gv_sso_mentions(brand_id);
CREATE INDEX idx_sso_mentions_creator ON gv_sso_mentions(creator_id);
CREATE INDEX idx_sso_mentions_site ON gv_sso_mentions(site_id);
CREATE INDEX idx_sso_mentions_sentiment ON gv_sso_mentions(sentiment);
CREATE INDEX idx_sso_mentions_date ON gv_sso_mentions(mentioned_at);

-- Smart queue for batch processing
CREATE TABLE gv_sso_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Batch info
  batch_id TEXT NOT NULL,
  batch_type TEXT NOT NULL CHECK (batch_type IN ('creators', 'sites')),
  category_id UUID REFERENCES gv_sso_categories(id),

  -- Items in batch
  item_ids JSONB NOT NULL, -- Array of creator_ids or site_ids
  total_items INTEGER NOT NULL,

  -- Priority
  priority TEXT NOT NULL CHECK (priority IN ('platinum', 'gold', 'silver', 'bronze')),

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,

  -- Timestamp hash for batch
  batch_timestamp_hash TEXT, -- Uses latest timestamp from batch

  -- Pagination
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 100,
  has_next_page BOOLEAN DEFAULT false,

  -- Results
  mentions_found INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_queue_brand ON gv_sso_queue(brand_id);
CREATE INDEX idx_sso_queue_scheduled ON gv_sso_queue(scheduled_for);
CREATE INDEX idx_sso_queue_status ON gv_sso_queue(status);
CREATE INDEX idx_sso_queue_priority ON gv_sso_queue(priority);
CREATE INDEX idx_sso_queue_batch ON gv_sso_queue(batch_id);

-- Delta cache for content tracking
CREATE TABLE gv_sso_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  cache_type TEXT NOT NULL CHECK (cache_type IN ('creator', 'site')),
  creator_id UUID REFERENCES gv_sso_creators(id) ON DELETE CASCADE,
  site_id UUID REFERENCES gv_sso_sites(id) ON DELETE CASCADE,

  -- Cache data
  content_url TEXT NOT NULL,
  timestamp_hash TEXT NOT NULL, -- MD5(last_modified + content_hash)
  content_snapshot TEXT, -- Compressed snapshot of content
  content_hash TEXT NOT NULL, -- MD5 of content

  -- Timestamps
  last_modified_at TIMESTAMPTZ NOT NULL,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validity
  is_valid BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_cache_creator ON gv_sso_cache(creator_id);
CREATE INDEX idx_sso_cache_site ON gv_sso_cache(site_id);
CREATE INDEX idx_sso_cache_hash ON gv_sso_cache(timestamp_hash);
CREATE INDEX idx_sso_cache_expires ON gv_sso_cache(expires_at);

-- Impact history tracking
CREATE TABLE gv_sso_impact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Reference
  reference_type TEXT NOT NULL CHECK (reference_type IN ('creator', 'site')),
  creator_id UUID REFERENCES gv_sso_creators(id) ON DELETE CASCADE,
  site_id UUID REFERENCES gv_sso_sites(id) ON DELETE CASCADE,

  -- Impact metrics snapshot
  impact_score DECIMAL(10,2) NOT NULL,
  perplexity_rank INTEGER NOT NULL,
  reach INTEGER,
  engagement_rate DECIMAL(5,2),

  -- Changes
  impact_score_change DECIMAL(10,2),
  rank_change INTEGER,

  -- Priority adjustment
  old_priority TEXT,
  new_priority TEXT,
  old_update_window INTEGER,
  new_update_window INTEGER,

  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_impact_history_brand ON gv_sso_impact_history(brand_id);
CREATE INDEX idx_sso_impact_history_creator ON gv_sso_impact_history(creator_id);
CREATE INDEX idx_sso_impact_history_site ON gv_sso_impact_history(site_id);
CREATE INDEX idx_sso_impact_history_date ON gv_sso_impact_history(recorded_at);
```

---

## 4. PRIORITY ASSIGNMENT LOGIC

### 4.1 Dynamic Priority Based on Impact Score

```typescript
function assignPriority(
  impactScore: number,
  rank: number,
  maxRank: number // 500 for creators, 1000 for sites
): {
  priority: 'platinum' | 'gold' | 'silver' | 'bronze';
  updateWindowDays: 3 | 7 | 14 | 28;
} {
  // Platinum: Top 20% AND impact score >= 80
  if (rank <= maxRank * 0.2 && impactScore >= 80) {
    return { priority: 'platinum', updateWindowDays: 3 };
  }

  // Gold: Top 40% AND impact score >= 60
  if (rank <= maxRank * 0.4 && impactScore >= 60) {
    return { priority: 'gold', updateWindowDays: 7 };
  }

  // Silver: Top 70% OR impact score >= 40
  if (rank <= maxRank * 0.7 || impactScore >= 40) {
    return { priority: 'silver', updateWindowDays: 14 };
  }

  // Bronze: Everyone else
  return { priority: 'bronze', updateWindowDays: 28 };
}

// Example for creators (top 500):
// Platinum: Rank 1-100 AND impact >= 80 → Check every 3 days
// Gold: Rank 101-200 AND impact >= 60 → Check every 7 days
// Silver: Rank 201-350 OR impact >= 40 → Check every 14 days
// Bronze: Rank 351-500 → Check every 28 days

// Example for sites (top 1000):
// Platinum: Rank 1-200 AND impact >= 80 → Check every 3 days
// Gold: Rank 201-400 AND impact >= 60 → Check every 7 days
// Silver: Rank 401-700 OR impact >= 40 → Check every 14 days
// Bronze: Rank 701-1000 → Check every 28 days
```

---

## 5. SMART PAGINATION SYSTEM

### 5.1 Batch Processing Logic

```typescript
interface PaginationConfig {
  pageSize: number; // 100 items per page
  maxConcurrent: number; // 5 parallel batches
  retryAttempts: number; // 3 retries on failure
}

async function processWithSmartPagination(
  brandId: string,
  categoryId: string,
  type: 'creators' | 'sites'
): Promise<void> {
  const config: PaginationConfig = {
    pageSize: 100,
    maxConcurrent: 5,
    retryAttempts: 3
  };

  // Get all items due for check
  const items = await getItemsDueForCheck(brandId, categoryId, type);

  // Group into batches
  const batches = chunkArray(items, config.pageSize);

  // Process batches with concurrency control
  const results = await processBatchesConcurrently(
    batches,
    config.maxConcurrent,
    async (batch, batchIndex) => {
      return await processBatch(batch, batchIndex, config);
    }
  );

  // Log results
  console.log(`Processed ${results.totalItems} items in ${results.batchesCompleted} batches`);
}

async function processBatch(
  items: Array<Creator | Site>,
  batchIndex: number,
  config: PaginationConfig
): Promise<BatchResult> {
  const batchId = `batch_${Date.now()}_${batchIndex}`;

  // Create batch timestamp hash (use latest timestamp from batch)
  const latestTimestamp = Math.max(...items.map(i => i.last_modified_at.getTime()));
  const batchTimestampHash = md5(`${latestTimestamp}_${batchId}`);

  // Create queue entry
  await supabase.from('gv_sso_queue').insert({
    brand_id: items[0].brand_id,
    batch_id: batchId,
    batch_type: items[0].type,
    category_id: items[0].category_id,
    item_ids: items.map(i => i.id),
    total_items: items.length,
    priority: items[0].queue_priority,
    scheduled_for: new Date(),
    batch_timestamp_hash: batchTimestampHash,
    page_number: batchIndex + 1,
    page_size: config.pageSize,
    has_next_page: false, // Will be updated if needed
    status: 'processing'
  });

  // Process each item in batch
  const results = await Promise.allSettled(
    items.map(item => processItem(item, batchTimestampHash))
  );

  // Calculate metrics
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  const cacheHits = results.filter(r =>
    r.status === 'fulfilled' && r.value.cacheHit
  ).length;

  // Update queue entry
  await supabase.from('gv_sso_queue').update({
    status: 'completed',
    processed_items: succeeded,
    failed_items: failed,
    cache_hits: cacheHits,
    cache_misses: succeeded - cacheHits,
    completed_at: new Date()
  }).eq('batch_id', batchId);

  return {
    batchId,
    succeeded,
    failed,
    cacheHits
  };
}
```

---

## 6. DELTA CACHING SYSTEM

### 6.1 Timestamp Hash Implementation

```typescript
interface TimestampHashData {
  lastModified: Date;
  contentHash: string;
}

function generateTimestampHash(data: TimestampHashData): string {
  const combined = `${data.lastModified.getTime()}_${data.contentHash}`;
  return md5(combined);
}

async function checkDeltaCache(
  itemId: string,
  itemType: 'creator' | 'site'
): Promise<{ needsProcessing: boolean; reason: string }> {
  // Fetch current content
  const currentContent = await fetchItemContent(itemId, itemType);
  const currentContentHash = md5(currentContent);
  const currentTimestampHash = generateTimestampHash({
    lastModified: currentContent.lastModified,
    contentHash: currentContentHash
  });

  // Check cache
  const cache = await supabase
    .from('gv_sso_cache')
    .select('*')
    .eq(itemType === 'creator' ? 'creator_id' : 'site_id', itemId)
    .single();

  // No cache entry → needs processing
  if (!cache.data) {
    return { needsProcessing: true, reason: 'no_cache_entry' };
  }

  // Cache expired → needs processing
  if (new Date() > new Date(cache.data.expires_at)) {
    return { needsProcessing: true, reason: 'cache_expired' };
  }

  // Timestamp hash different → content changed → needs processing
  if (currentTimestampHash !== cache.data.timestamp_hash) {
    return { needsProcessing: true, reason: 'content_changed' };
  }

  // Cache hit → skip processing
  return { needsProcessing: false, reason: 'cache_hit' };
}

async function updateDeltaCache(
  itemId: string,
  itemType: 'creator' | 'site',
  content: any,
  updateWindowDays: number
): Promise<void> {
  const contentHash = md5(content.text);
  const timestampHash = generateTimestampHash({
    lastModified: content.lastModified,
    contentHash
  });

  await supabase.from('gv_sso_cache').upsert({
    cache_type: itemType,
    [itemType === 'creator' ? 'creator_id' : 'site_id']: itemId,
    content_url: content.url,
    timestamp_hash: timestampHash,
    content_snapshot: compressContent(content.text),
    content_hash: contentHash,
    last_modified_at: content.lastModified,
    last_checked_at: new Date(),
    is_valid: true,
    expires_at: new Date(Date.now() + updateWindowDays * 24 * 60 * 60 * 1000)
  }, {
    onConflict: itemType === 'creator' ? 'creator_id' : 'site_id'
  });
}
```

---

## 7. PERPLEXITY IMPACT RANKING

### 7.1 Discover and Rank Top Creators

```typescript
async function discoverTopCreatorsByPerplexity(
  categoryId: string,
  categoryName: string,
  brandId: string
): Promise<Creator[]> {
  const perplexityQuery = `
Identify the top 500 most impactful creators in the "${categoryName}" category.

For each creator, provide:
1. Name and handle (@username)
2. Platform (Twitter, LinkedIn, YouTube, etc.)
3. Profile URL
4. Impact score (0-100) based on:
   - Reach (followers/subscribers)
   - Engagement rate (likes, comments, shares per post)
   - Authority (verified status, influence, credibility)
   - Content quality and consistency
5. Follower count
6. Average engagement rate (%)
7. Authority score (0-100)

Rank them from 1-500 by overall impact. Provide reasoning for top 100.

Format: JSON array`;

  const perplexityResponse = await perplexity.chat({
    model: 'sonar-pro',
    messages: [
      { role: 'user', content: perplexityQuery }
    ]
  });

  const creators = JSON.parse(perplexityResponse.choices[0].message.content);

  // Save to database with priority assignment
  const savedCreators = await Promise.all(
    creators.map(async (creator, index) => {
      const rank = index + 1;
      const { priority, updateWindowDays } = assignPriority(
        creator.impact_score,
        rank,
        500 // max rank for creators
      );

      return await supabase.from('gv_sso_creators').upsert({
        brand_id: brandId,
        category_id: categoryId,
        creator_name: creator.name,
        creator_handle: creator.handle,
        platform: creator.platform,
        profile_url: creator.profile_url,
        impact_score: creator.impact_score,
        reach: creator.follower_count,
        engagement_rate: creator.engagement_rate,
        authority_score: creator.authority_score,
        perplexity_rank: rank,
        perplexity_reasoning: rank <= 100 ? creator.reasoning : null,
        queue_priority: priority,
        update_window_days: updateWindowDays,
        next_check_at: new Date(Date.now() + updateWindowDays * 24 * 60 * 60 * 1000),
        metadata: creator
      }, {
        onConflict: 'brand_id,category_id,creator_handle,platform'
      }).select().single();
    })
  );

  return savedCreators.map(r => r.data);
}
```

### 7.2 Discover and Rank Top Sites

```typescript
async function discoverTopSitesByPerplexity(
  categoryId: string,
  categoryName: string,
  brandId: string
): Promise<Site[]> {
  const perplexityQuery = `
Identify the top 1000 most impactful websites/sites in the "${categoryName}" category.

For each site, provide:
1. Site name
2. Full URL
3. Domain
4. Impact score (0-100) based on:
   - Domain authority (Moz/Ahrefs metrics)
   - Monthly traffic
   - Relevance to category
   - Content quality
5. Domain authority (0-100)
6. Estimated monthly traffic
7. Relevance score (0-100)

Rank them from 1-1000 by overall impact. Provide reasoning for top 200.

Format: JSON array`;

  const perplexityResponse = await perplexity.chat({
    model: 'sonar-pro',
    messages: [
      { role: 'user', content: perplexityQuery }
    ]
  });

  const sites = JSON.parse(perplexityResponse.choices[0].message.content);

  // Save to database with priority assignment
  const savedSites = await Promise.all(
    sites.map(async (site, index) => {
      const rank = index + 1;
      const { priority, updateWindowDays } = assignPriority(
        site.impact_score,
        rank,
        1000 // max rank for sites
      );

      return await supabase.from('gv_sso_sites').upsert({
        brand_id: brandId,
        category_id: categoryId,
        site_name: site.name,
        site_url: site.url,
        domain: site.domain,
        impact_score: site.impact_score,
        domain_authority: site.domain_authority,
        monthly_traffic: site.monthly_traffic,
        relevance_score: site.relevance_score,
        perplexity_rank: rank,
        perplexity_reasoning: rank <= 200 ? site.reasoning : null,
        queue_priority: priority,
        update_window_days: updateWindowDays,
        next_check_at: new Date(Date.now() + updateWindowDays * 24 * 60 * 60 * 1000),
        metadata: site
      }, {
        onConflict: 'brand_id,category_id,domain'
      }).select().single();
    })
  );

  return savedSites.map(r => r.data);
}
```

---

## 8. SMART LOOPING QUEUE

### 8.1 Queue Scheduler

```typescript
// Run every hour
Deno.cron("sso-queue-scheduler", "0 * * * *", async () => {
  console.log('[SSO Queue] Starting scheduled processing...');

  // Process items due for check
  await processQueueByPriority('platinum', 3);
  await processQueueByPriority('gold', 7);
  await processQueueByPriority('silver', 14);
  await processQueueByPriority('bronze', 28);

  console.log('[SSO Queue] Scheduled processing complete');
});

async function processQueueByPriority(
  priority: 'platinum' | 'gold' | 'silver' | 'bronze',
  updateWindowDays: number
): Promise<void> {
  // Get creators due for check
  const creators = await supabase
    .from('gv_sso_creators')
    .select('*')
    .eq('queue_priority', priority)
    .lte('next_check_at', new Date().toISOString())
    .order('perplexity_rank', { ascending: true })
    .limit(1000);

  if (creators.data && creators.data.length > 0) {
    await processWithSmartPagination(
      creators.data[0].brand_id,
      creators.data[0].category_id,
      'creators'
    );
  }

  // Get sites due for check
  const sites = await supabase
    .from('gv_sso_sites')
    .select('*')
    .eq('queue_priority', priority)
    .lte('next_check_at', new Date().toISOString())
    .order('perplexity_rank', { ascending: true })
    .limit(1000);

  if (sites.data && sites.data.length > 0) {
    await processWithSmartPagination(
      sites.data[0].brand_id,
      sites.data[0].category_id,
      'sites'
    );
  }
}
```

---

## 9. COMPLETE PROCESSING WORKFLOW

```typescript
async function processItem(
  item: Creator | Site,
  batchTimestampHash: string
): Promise<{ cacheHit: boolean; mentionsFound: number }> {
  // Step 1: Check delta cache
  const cacheCheck = await checkDeltaCache(item.id, item.type);

  if (!cacheCheck.needsProcessing) {
    console.log(`[Cache Hit] Skipping ${item.type} ${item.id}: ${cacheCheck.reason}`);
    return { cacheHit: true, mentionsFound: 0 };
  }

  // Step 2: Fetch fresh content
  const content = await fetchItemContent(item.id, item.type);

  // Step 3: Search for brand mentions
  const mentions = await searchBrandMentions(content, item.brand_id);

  // Step 4: Save mentions
  if (mentions.length > 0) {
    await saveMentions(mentions, item.id, item.type);
  }

  // Step 5: Update delta cache
  await updateDeltaCache(item.id, item.type, content, item.update_window_days);

  // Step 6: Update next check time
  await supabase
    .from(item.type === 'creator' ? 'gv_sso_creators' : 'gv_sso_sites')
    .update({
      last_checked_at: new Date(),
      next_check_at: new Date(Date.now() + item.update_window_days * 24 * 60 * 60 * 1000),
      timestamp_hash: batchTimestampHash
    })
    .eq('id', item.id);

  return { cacheHit: false, mentionsFound: mentions.length };
}
```

---

## 10. COST OPTIMIZATION

### 10.1 Expected Savings with Delta Caching

```
Month 1 (No cache):
- 500 creators × 4 categories = 2,000 creators
- 1,000 sites × 5 categories = 5,000 sites
- Total items: 7,000
- Average checks per month: 7,000 × 2 = 14,000 checks
- Cost per check: $0.05
- Total cost: 14,000 × $0.05 = $700

Month 2+ (With delta cache, 70% cache hit rate):
- Cache hits: 14,000 × 70% = 9,800 (skip processing)
- Cache misses: 14,000 × 30% = 4,200 (process)
- Total cost: 4,200 × $0.05 = $210
- Savings: $700 - $210 = $490 (70% reduction)
```

---

## 11. INTEGRATION WITH FEEDBACK & SYNC

### 11.1 Real-Time Sync with GEO/SEO

When SSO discovers a mention:
1. **Trigger GEO sync**: Add creator/site as potential citation source
2. **Trigger SEO sync**: Add mention URL as backlink opportunity
3. **Claude feedback**: Analyze mention sentiment and quality
4. **Self-learning**: Track which creators/sites mention brand most

---

**END OF STRATEGY DOCUMENT**
