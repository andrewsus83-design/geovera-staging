# SSO INCREMENTAL DISCOVERY WITH DELTA CACHING
## Perplexity Only Adds Better Creators/Sites - No Full Re-Discovery

---

## OVERVIEW

**CRITICAL RULE**: Setiap bulan, Perplexity **HANYA** menambahkan creators/sites baru yang **score-nya LEBIH BAIK** dari top rank bulan sebelumnya.

**NO FULL RE-DISCOVERY**:
- Jangan crawl ulang semua 500 creators atau 1000 sites
- Jangan research ulang dari awal
- Hanya cari "rising stars" yang lebih baik dari existing top performers
- Delta caching untuk semua existing creators/sites

---

## 1. MONTHLY INCREMENTAL DISCOVERY LOGIC

### 1.1 Discovery Rules

```typescript
interface MonthlyDiscoveryRules {
  // Rule 1: Get current top scores from last month
  baseline_creator_score: number; // Top 1 creator impact score from last month
  baseline_site_score: number; // Top 1 site impact score from last month

  // Rule 2: Perplexity ONLY searches for NEW items with BETTER scores
  search_criteria: {
    creators: {
      min_impact_score: baseline_creator_score + 1, // Must be BETTER than current #1
      min_rank: null, // Don't care about rank, care about score
      discovery_type: 'incremental' // NOT full re-discovery
    },
    sites: {
      min_impact_score: baseline_site_score + 1,
      min_rank: null,
      discovery_type: 'incremental'
    }
  };

  // Rule 3: Existing items use delta caching
  existing_items: {
    check_method: 'delta_cache', // NOT re-crawl
    only_if_changed: true,
    use_timestamp_hash: true
  };
}
```

### 1.2 Monthly Discovery Workflow

```
Month 1 (Initial Discovery):
  ├─→ Perplexity discovers top 500 creators (full discovery)
  ├─→ Perplexity discovers top 1000 sites (full discovery)
  ├─→ Save baseline scores:
  │     - Top creator impact: 95
  │     - Top site impact: 92
  └─→ Start monitoring with delta cache

Month 2 (Incremental Discovery):
  ├─→ Check existing 500 creators via delta cache
  │     ├─→ Content unchanged? Skip
  │     └─→ Content changed? Update only
  ├─→ Perplexity searches for NEW creators with impact > 95
  │     ├─→ Found 3 new creators with impact 96-98
  │     ├─→ Add to top 500 list
  │     └─→ Remove bottom 3 creators (rank 498-500)
  ├─→ Update baseline: Top creator impact = 98
  └─→ Repeat for sites

Month 3 (Incremental Discovery):
  ├─→ Delta cache for existing items
  ├─→ Perplexity searches for NEW items with impact > 98
  ├─→ Add/remove as needed
  └─→ Update baseline
```

---

## 2. DATABASE SCHEMA ADDITIONS

```sql
-- Track monthly baseline scores
CREATE TABLE gv_sso_monthly_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES gv_sso_categories(id) ON DELETE CASCADE,

  -- Month tracking
  month TEXT NOT NULL, -- '2025-01'

  -- Creator baseline (top 1 impact score)
  top_creator_impact DECIMAL(10,2) NOT NULL,
  top_creator_id UUID REFERENCES gv_sso_creators(id),
  total_creators_count INTEGER DEFAULT 0,

  -- Site baseline (top 1 impact score)
  top_site_impact DECIMAL(10,2) NOT NULL,
  top_site_id UUID REFERENCES gv_sso_sites(id),
  total_sites_count INTEGER DEFAULT 0,

  -- Discovery stats
  new_creators_added INTEGER DEFAULT 0,
  creators_removed INTEGER DEFAULT 0,
  new_sites_added INTEGER DEFAULT 0,
  sites_removed INTEGER DEFAULT 0,

  -- Cost tracking
  perplexity_requests INTEGER DEFAULT 0,
  perplexity_cost DECIMAL(10,4),

  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, category_id, month)
);

CREATE INDEX idx_sso_baselines_brand ON gv_sso_monthly_baselines(brand_id);
CREATE INDEX idx_sso_baselines_category ON gv_sso_monthly_baselines(category_id);
CREATE INDEX idx_sso_baselines_month ON gv_sso_monthly_baselines(month);

-- Track incremental discovery attempts
CREATE TABLE gv_sso_incremental_discovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES gv_sso_categories(id) ON DELETE CASCADE,

  -- Discovery info
  month TEXT NOT NULL,
  discovery_type TEXT NOT NULL CHECK (discovery_type IN ('full', 'incremental')),

  -- Search criteria
  min_creator_impact DECIMAL(10,2),
  min_site_impact DECIMAL(10,2),

  -- Results
  new_creators_found INTEGER DEFAULT 0,
  new_sites_found INTEGER DEFAULT 0,
  existing_items_cached INTEGER DEFAULT 0,
  existing_items_updated INTEGER DEFAULT 0,

  -- Perplexity query
  perplexity_query TEXT,
  perplexity_cost DECIMAL(10,4),

  discovered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_discovery_log_brand ON gv_sso_incremental_discovery_log(brand_id);
CREATE INDEX idx_sso_discovery_log_month ON gv_sso_incremental_discovery_log(month);
```

---

## 3. INCREMENTAL DISCOVERY FUNCTION

### 3.1 Get Baseline Scores

```typescript
async function getMonthlyBaseline(
  brandId: string,
  categoryId: string,
  currentMonth: string
): Promise<{
  topCreatorImpact: number;
  topSiteImpact: number;
} | null> {
  // Get last month's baseline
  const lastMonth = getPreviousMonth(currentMonth);

  const baseline = await supabase
    .from('gv_sso_monthly_baselines')
    .select('*')
    .eq('brand_id', brandId)
    .eq('category_id', categoryId)
    .eq('month', lastMonth)
    .maybeSingle();

  if (!baseline.data) {
    // First month - no baseline yet
    return null;
  }

  return {
    topCreatorImpact: baseline.data.top_creator_impact,
    topSiteImpact: baseline.data.top_site_impact
  };
}
```

### 3.2 Incremental Discovery with Perplexity

```typescript
async function runIncrementalDiscovery(
  brandId: string,
  categoryId: string,
  categoryName: string
): Promise<IncrementalDiscoveryResult> {
  const currentMonth = getCurrentMonth(); // '2025-01'

  // Step 1: Get baseline from last month
  const baseline = await getMonthlyBaseline(brandId, categoryId, currentMonth);

  if (!baseline) {
    // First month - run full discovery
    console.log('[Incremental Discovery] No baseline found. Running full discovery.');
    return await runFullDiscovery(brandId, categoryId, categoryName);
  }

  console.log(`[Incremental Discovery] Baseline: Creator=${baseline.topCreatorImpact}, Site=${baseline.topSiteImpact}`);

  // Step 2: Delta cache check for existing items
  console.log('[Incremental Discovery] Checking existing items via delta cache...');

  const existingCreators = await supabase
    .from('gv_sso_creators')
    .select('*')
    .eq('brand_id', brandId)
    .eq('category_id', categoryId);

  let cachedCount = 0;
  let updatedCount = 0;

  for (const creator of existingCreators.data) {
    const cacheCheck = await checkDeltaCache(creator.id, 'creator');

    if (cacheCheck.needsProcessing) {
      // Content changed - update
      await updateCreatorContent(creator.id);
      updatedCount++;
    } else {
      // Cache hit - skip
      cachedCount++;
    }
  }

  console.log(`[Incremental Discovery] Existing items: ${cachedCount} cached, ${updatedCount} updated`);

  // Step 3: Perplexity searches for NEW creators with BETTER scores
  const perplexityQuery = `
Find NEW rising star creators in "${categoryName}" category.

CRITICAL REQUIREMENTS:
1. Impact score MUST be > ${baseline.topCreatorImpact} (higher than current #1)
2. Must NOT be in this existing list:
${existingCreators.data.map(c => `- ${c.creator_name} (@${c.creator_handle})`).join('\n')}

3. Must be genuinely NEW or rapidly rising
4. Return ONLY creators that meet criteria #1

If NO creators meet the criteria, return empty array.

Format: JSON array with impact_score, name, handle, platform, reasoning`;

  const perplexityResponse = await perplexity.chat({
    model: 'sonar-pro',
    messages: [
      { role: 'user', content: perplexityQuery }
    ]
  });

  const newCreators = JSON.parse(perplexityResponse.choices[0].message.content);

  console.log(`[Incremental Discovery] Found ${newCreators.length} new creators with better scores`);

  // Step 4: Add new creators and remove bottom performers
  if (newCreators.length > 0) {
    // Sort new creators by impact score
    const sortedNew = newCreators.sort((a, b) => b.impact_score - a.impact_score);

    // Get bottom creators to remove (same count as new ones added)
    const bottomCreators = await supabase
      .from('gv_sso_creators')
      .select('*')
      .eq('brand_id', brandId)
      .eq('category_id', categoryId)
      .order('impact_score', { ascending: true })
      .limit(sortedNew.length);

    // Remove bottom creators
    await supabase
      .from('gv_sso_creators')
      .delete()
      .in('id', bottomCreators.data.map(c => c.id));

    // Add new creators
    await Promise.all(
      sortedNew.map(async (creator, index) => {
        const rank = index + 1; // Will be re-ranked
        const { priority, updateWindowDays } = assignPriority(creator.impact_score, rank, 500);

        return await supabase.from('gv_sso_creators').insert({
          brand_id: brandId,
          category_id: categoryId,
          creator_name: creator.name,
          creator_handle: creator.handle,
          platform: creator.platform,
          profile_url: creator.profile_url,
          impact_score: creator.impact_score,
          reach: creator.reach,
          engagement_rate: creator.engagement_rate,
          authority_score: creator.authority_score,
          perplexity_rank: rank,
          perplexity_reasoning: creator.reasoning,
          queue_priority: priority,
          update_window_days: updateWindowDays,
          next_check_at: new Date(Date.now() + updateWindowDays * 24 * 60 * 60 * 1000)
        });
      })
    );

    // Re-rank all creators
    await reRankCreators(brandId, categoryId);
  }

  // Step 5: Repeat for sites
  const newSites = await runIncrementalSiteDiscovery(
    brandId,
    categoryId,
    categoryName,
    baseline.topSiteImpact
  );

  // Step 6: Update baseline for this month
  const newTopCreator = await supabase
    .from('gv_sso_creators')
    .select('*')
    .eq('brand_id', brandId)
    .eq('category_id', categoryId)
    .order('impact_score', { descending: true })
    .limit(1)
    .single();

  const newTopSite = await supabase
    .from('gv_sso_sites')
    .select('*')
    .eq('brand_id', brandId)
    .eq('category_id', categoryId)
    .order('impact_score', { descending: true })
    .limit(1)
    .single();

  await supabase.from('gv_sso_monthly_baselines').insert({
    brand_id: brandId,
    category_id: categoryId,
    month: currentMonth,
    top_creator_impact: newTopCreator.data.impact_score,
    top_creator_id: newTopCreator.data.id,
    total_creators_count: existingCreators.data.length,
    top_site_impact: newTopSite.data.impact_score,
    top_site_id: newTopSite.data.id,
    total_sites_count: newSites.total,
    new_creators_added: newCreators.length,
    creators_removed: newCreators.length,
    new_sites_added: newSites.added,
    sites_removed: newSites.removed,
    perplexity_requests: 2, // One for creators, one for sites
    perplexity_cost: calculatePerplexityCost(2)
  });

  // Log discovery
  await supabase.from('gv_sso_incremental_discovery_log').insert({
    brand_id: brandId,
    category_id: categoryId,
    month: currentMonth,
    discovery_type: 'incremental',
    min_creator_impact: baseline.topCreatorImpact,
    min_site_impact: baseline.topSiteImpact,
    new_creators_found: newCreators.length,
    new_sites_found: newSites.added,
    existing_items_cached: cachedCount,
    existing_items_updated: updatedCount,
    perplexity_query: perplexityQuery,
    perplexity_cost: calculatePerplexityCost(2)
  });

  return {
    new_creators_added: newCreators.length,
    new_sites_added: newSites.added,
    existing_cached: cachedCount,
    existing_updated: updatedCount,
    cost_saved: calculateCostSavings(cachedCount)
  };
}
```

---

## 4. MONTHLY CRON JOB

```typescript
// Run on 1st day of every month at 2 AM
Deno.cron("sso-monthly-incremental-discovery", "0 2 1 * *", async () => {
  console.log('[SSO Monthly] Starting incremental discovery...');

  // Get all brands and categories
  const brands = await supabase.from('gv_brands').select('*');

  for (const brand of brands.data) {
    const categories = await supabase
      .from('gv_sso_categories')
      .select('*')
      .eq('is_active', true);

    for (const category of categories.data) {
      console.log(`[SSO Monthly] Processing ${brand.brand_name} - ${category.category_name}`);

      const result = await runIncrementalDiscovery(
        brand.id,
        category.id,
        category.category_name
      );

      console.log(`[SSO Monthly] Results:
- New creators: ${result.new_creators_added}
- New sites: ${result.new_sites_added}
- Cached items: ${result.existing_cached}
- Updated items: ${result.existing_updated}
- Cost saved: $${result.cost_saved}`);
    }
  }

  console.log('[SSO Monthly] Incremental discovery complete');
});
```

---

## 5. COST COMPARISON

### Without Incremental Discovery (Full Re-Discovery Every Month)

```
Month 1: Full discovery
- Perplexity: 500 creators + 1000 sites = $50

Month 2: Full re-discovery (REDUNDANT!)
- Perplexity: 500 creators + 1000 sites = $50

Month 3: Full re-discovery (REDUNDANT!)
- Perplexity: 500 creators + 1000 sites = $50

Total for 3 months: $150
```

### With Incremental Discovery + Delta Caching

```
Month 1: Full discovery
- Perplexity: 500 creators + 1000 sites = $50

Month 2: Incremental discovery
- Delta cache: 1500 items cached (free!)
- Perplexity: Search for new items > baseline = $2
- Total: $2

Month 3: Incremental discovery
- Delta cache: 1500 items cached (free!)
- Perplexity: Search for new items > baseline = $2
- Total: $2

Total for 3 months: $54
Savings: $150 - $54 = $96 (64% reduction!)
```

---

## 6. RE-RANKING LOGIC

```typescript
async function reRankCreators(
  brandId: string,
  categoryId: string
): Promise<void> {
  // Get all creators sorted by impact score
  const creators = await supabase
    .from('gv_sso_creators')
    .select('*')
    .eq('brand_id', brandId)
    .eq('category_id', categoryId)
    .order('impact_score', { descending: true });

  // Update ranks (1-500)
  await Promise.all(
    creators.data.map((creator, index) => {
      const newRank = index + 1;
      const { priority, updateWindowDays } = assignUnifiedPriority(
        { ...creator, perplexity_rank: newRank },
        'sso_creator'
      );

      return supabase
        .from('gv_sso_creators')
        .update({
          perplexity_rank: newRank,
          queue_priority: priority,
          update_window_days: updateWindowDays,
          next_check_at: new Date(Date.now() + updateWindowDays * 24 * 60 * 60 * 1000)
        })
        .eq('id', creator.id);
    })
  );

  console.log(`[Re-Rank] ${creators.data.length} creators re-ranked`);
}
```

---

## 7. MONITORING DASHBOARD

### 7.1 Monthly Discovery Stats View

```sql
CREATE OR REPLACE VIEW gv_sso_monthly_stats AS
SELECT
  mb.month,
  mb.brand_id,
  c.category_name,

  -- Baselines
  mb.top_creator_impact,
  mb.top_site_impact,

  -- Changes
  mb.new_creators_added,
  mb.creators_removed,
  mb.new_sites_added,
  mb.sites_removed,

  -- Costs
  mb.perplexity_requests,
  mb.perplexity_cost,

  -- Discovery log
  idl.existing_items_cached,
  idl.existing_items_updated,

  -- Calculate savings
  (idl.existing_items_cached * 0.05) AS cost_saved_by_caching

FROM gv_sso_monthly_baselines mb
JOIN gv_sso_categories c ON mb.category_id = c.id
LEFT JOIN gv_sso_incremental_discovery_log idl
  ON mb.brand_id = idl.brand_id
  AND mb.category_id = idl.category_id
  AND mb.month = idl.month
ORDER BY mb.month DESC, c.category_name;
```

### 7.2 Expected Output

```
| Month   | Category        | New Added | Cached | Updated | Cost | Saved |
|---------|-----------------|-----------|--------|---------|------|-------|
| 2025-01 | tech_influencers| 500       | 0      | 0       | $50  | $0    |
| 2025-02 | tech_influencers| 5         | 1450   | 50      | $2   | $72.5 |
| 2025-03 | tech_influencers| 3         | 1480   | 20      | $2   | $74   |
```

---

## 8. SUMMARY

### ✅ **BENEFITS**

1. **64% Cost Reduction**: $150 → $54 for 3 months
2. **Faster Discovery**: Only search for rising stars (2-3 queries vs 50+)
3. **Always Fresh**: Top performers always have best scores
4. **Delta Caching**: Existing items use cache (free!)
5. **Smart Updates**: Only update changed content

### 📊 **LOGIC**

- **Month 1**: Full discovery (baseline established)
- **Month 2+**: Incremental (only add if score > baseline)
- **Delta Cache**: All existing items checked via cache first
- **Re-Ranking**: Automatic after new additions
- **Baseline Update**: Every month tracks new top scores

### 🎯 **RULES**

1. ✅ Perplexity ONLY searches for items with score > baseline
2. ✅ NO full re-discovery after month 1
3. ✅ Delta cache for ALL existing items
4. ✅ Add/remove maintains top 500/1000 limit
5. ✅ Re-rank after changes
6. ✅ Update baseline monthly

---

**END OF DOCUMENT**
