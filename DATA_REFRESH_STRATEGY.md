# GeoVera Data Refresh Strategy: 7D, 14D, 28D Cycles

## Overview
GeoVera menggunakan **short refresh cycles** untuk data freshness:
- **Data Storage**: >90 days (long-term historical data)
- **Data Validity**: 7D, 14D, 28D (fresh data cycles)
- **Auto-refresh**: Triggered by validity expiration

---

## 1. Three-Tier Refresh Cycle

### Why Short Cycles?

**Traditional SEO tools (90-day refresh):**
- ❌ Outdated data for 3 months
- ❌ Miss trending opportunities
- ❌ Slow to detect competitor changes
- ❌ Can't capitalize on viral content

**GeoVera (7D/14D/28D refresh):**
- ✅ Always fresh data
- ✅ Catch trending opportunities early
- ✅ Real-time competitor monitoring
- ✅ Fast iteration cycles

### Refresh Tiers

```typescript
enum DataRefreshCycle {
  GOLD = 7,      // 7 days - High priority data
  SILVER = 14,   // 14 days - Medium priority data
  BRONZE = 28    // 28 days - Lower priority data
}

interface RefreshCycleConfig {
  cycle_days: number;
  priority: 'gold' | 'silver' | 'bronze';
  auto_refresh: boolean;
  retention_days: number; // How long to keep historical data
  validity_window: number; // Data considered "fresh" for X days
}

const REFRESH_CYCLES = {
  gold: {
    cycle_days: 7,
    priority: 'gold',
    auto_refresh: true,
    retention_days: 365,      // Keep 1 year of history
    validity_window: 7         // Fresh for 7 days only
  },
  silver: {
    cycle_days: 14,
    priority: 'silver',
    auto_refresh: true,
    retention_days: 180,       // Keep 6 months
    validity_window: 14        // Fresh for 14 days
  },
  bronze: {
    cycle_days: 28,
    priority: 'bronze',
    auto_refresh: true,
    retention_days: 90,        // Keep 90 days
    validity_window: 28        // Fresh for 28 days
  }
};
```

---

## 2. Priority-Based Data Classification

### What Gets Which Refresh Cycle?

```typescript
interface DataPriorityClassification {
  // GOLD (7-day refresh) - Critical real-time data
  gold_tier: {
    seo_data: [
      'Top 10 ranking keywords',
      'Competitor movements (rank changes)',
      'Brand mentions (new)',
      'Backlink velocity (trending)',
      'Content performance (viral potential)'
    ];

    geo_data: [
      'AI citation frequency (ChatGPT, Claude, Gemini)',
      'Citation rank changes',
      'New citation opportunities',
      'Competitor citations (new)',
      'Prompt topic trends'
    ];

    backlinks: [
      'Perplexity-ranked top 20 opportunities',
      'Trending content (HackerNews, Reddit)',
      'Viral posts (Medium, LinkedIn)',
      'Time-sensitive opportunities',
      'Author response patterns (active)'
    ];

    social_search: [
      'TikTok trending hashtags',
      'Instagram Reels performance',
      'Twitter/X viral threads',
      'YouTube trending videos',
      'Reddit front page'
    ];
  };

  // SILVER (14-day refresh) - Important but less volatile
  silver_tier: {
    seo_data: [
      'Rank 11-50 keywords',
      'Domain authority changes',
      'Page authority scores',
      'Internal linking opportunities',
      'Content gaps (medium priority)'
    ];

    geo_data: [
      'Citation frequency (stable content)',
      'Optimization suggestions',
      'Content performance metrics',
      'AI engine allocation research',
      'Citation status (needs_improvement)'
    ];

    backlinks: [
      'Multi-channel opportunities (rank 21-50)',
      'Guest post opportunities',
      'Directory listings',
      'Resource page links',
      'Broken link building'
    ];

    social_search: [
      'Pinterest performance',
      'LinkedIn engagement',
      'Facebook group mentions',
      'Discord communities',
      'Slack workspace activity'
    ];
  };

  // BRONZE (28-day refresh) - Stable, slow-changing data
  bronze_tier: {
    seo_data: [
      'Rank 51-100 keywords',
      'Long-tail keyword opportunities',
      'Historical ranking trends',
      'Anchor text distribution',
      'Site speed metrics'
    ];

    geo_data: [
      'Citation status (performing_well)',
      'Historical citation data',
      'Low-frequency topics',
      'Archive content performance',
      'Baseline metrics'
    ];

    backlinks: [
      'Low-priority opportunities (rank 51+)',
      'Cold outreach targets',
      'Link reclamation',
      'Competitor backlink profiles',
      'Historical link velocity'
    ];

    social_search: [
      'Evergreen content performance',
      'Brand sentiment (monthly)',
      'Community growth metrics',
      'Historical social data',
      'Baseline engagement rates'
    ];
  };
}
```

---

## 3. Auto-Refresh Triggers

### When Data Gets Refreshed

```typescript
interface RefreshTrigger {
  trigger_type: 'scheduled' | 'event_based' | 'manual' | 'threshold';
  priority: 'gold' | 'silver' | 'bronze';
  condition: string;
}

const REFRESH_TRIGGERS = [
  // SCHEDULED TRIGGERS (Time-based)
  {
    trigger_type: 'scheduled',
    priority: 'gold',
    condition: 'Every 7 days from last_refreshed_at',
    auto_refresh: true
  },
  {
    trigger_type: 'scheduled',
    priority: 'silver',
    condition: 'Every 14 days from last_refreshed_at',
    auto_refresh: true
  },
  {
    trigger_type: 'scheduled',
    priority: 'bronze',
    condition: 'Every 28 days from last_refreshed_at',
    auto_refresh: true
  },

  // EVENT-BASED TRIGGERS (Real-time events)
  {
    trigger_type: 'event_based',
    priority: 'gold',
    condition: 'Rank change detected (>3 positions)',
    auto_refresh: true,
    immediate: true
  },
  {
    trigger_type: 'event_based',
    priority: 'gold',
    condition: 'New citation detected',
    auto_refresh: true,
    immediate: true
  },
  {
    trigger_type: 'event_based',
    priority: 'gold',
    condition: 'Competitor overtakes brand',
    auto_refresh: true,
    immediate: true
  },
  {
    trigger_type: 'event_based',
    priority: 'silver',
    condition: 'Content published (new)',
    auto_refresh: true,
    delay_hours: 24
  },

  // THRESHOLD TRIGGERS (Performance-based)
  {
    trigger_type: 'threshold',
    priority: 'gold',
    condition: 'Citation frequency drops >10%',
    auto_refresh: true,
    immediate: true
  },
  {
    trigger_type: 'threshold',
    priority: 'silver',
    condition: 'Traffic change >20%',
    auto_refresh: true,
    delay_hours: 48
  },
  {
    trigger_type: 'threshold',
    priority: 'bronze',
    condition: 'Backlink count change >15%',
    auto_refresh: true,
    delay_hours: 72
  }
];
```

### Refresh Logic

```typescript
async function checkAndRefreshData(
  dataType: string,
  dataId: string,
  priority: 'gold' | 'silver' | 'bronze'
): Promise<RefreshResult> {

  const config = REFRESH_CYCLES[priority];
  const data = await getDataRecord(dataType, dataId);

  // Check if data exists
  if (!data) {
    return { needs_refresh: true, reason: 'no_data' };
  }

  // Calculate age
  const daysSinceRefresh = daysBetween(data.last_refreshed_at, new Date());
  const daysSinceCreation = daysBetween(data.created_at, new Date());

  // VALIDITY CHECK: Is data still "fresh"?
  const isValid = daysSinceRefresh <= config.validity_window;

  if (!isValid) {
    return {
      needs_refresh: true,
      reason: 'expired_validity',
      days_since_refresh: daysSinceRefresh,
      validity_window: config.validity_window
    };
  }

  // SCHEDULED REFRESH: Time for next cycle?
  if (daysSinceRefresh >= config.cycle_days) {
    return {
      needs_refresh: true,
      reason: 'scheduled_refresh',
      days_since_refresh: daysSinceRefresh,
      cycle_days: config.cycle_days
    };
  }

  // EVENT-BASED CHECK: Any triggers?
  const eventTrigger = await checkEventTriggers(dataType, dataId, priority);
  if (eventTrigger) {
    return {
      needs_refresh: true,
      reason: 'event_triggered',
      event: eventTrigger.condition
    };
  }

  // THRESHOLD CHECK: Performance thresholds crossed?
  const thresholdTrigger = await checkThresholdTriggers(dataType, dataId, priority);
  if (thresholdTrigger) {
    return {
      needs_refresh: true,
      reason: 'threshold_exceeded',
      threshold: thresholdTrigger.condition
    };
  }

  // Data is fresh, no refresh needed
  return {
    needs_refresh: false,
    reason: 'data_fresh',
    valid_until: addDays(data.last_refreshed_at, config.validity_window),
    next_refresh: addDays(data.last_refreshed_at, config.cycle_days)
  };
}
```

---

## 4. Data Retention & Historical Storage

### Storage Strategy

```typescript
interface DataRetentionPolicy {
  // Active data (validity window)
  active_data: {
    gold: '7 days',     // Last 7 days considered "current"
    silver: '14 days',  // Last 14 days
    bronze: '28 days'   // Last 28 days
  };

  // Historical data (archived but queryable)
  historical_data: {
    gold: '365 days',   // Keep 1 year of 7-day snapshots
    silver: '180 days', // Keep 6 months of 14-day snapshots
    bronze: '90 days'   // Keep 90 days of 28-day snapshots
  };

  // Aggregated data (long-term trends)
  aggregated_data: {
    monthly_snapshots: 'Indefinite', // Monthly aggregates forever
    quarterly_reports: 'Indefinite',
    yearly_summaries: 'Indefinite'
  };
}
```

### Example: GEO Citation Data

```sql
-- Active GEO citation data (last 28 days max)
CREATE TABLE gv_geo_citations_active (
  id UUID PRIMARY KEY,
  brand_id UUID NOT NULL,
  topic_id UUID NOT NULL,
  ai_engine TEXT NOT NULL,

  -- Citation data
  citation_frequency INTEGER,
  citation_rank INTEGER,
  citation_status TEXT,

  -- Metadata
  priority TEXT CHECK(priority IN ('gold', 'silver', 'bronze')),

  -- Freshness tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_refreshed_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ, -- calculated based on priority
  next_refresh_at TIMESTAMPTZ, -- calculated based on priority

  -- Validity constraints
  CONSTRAINT valid_data CHECK (
    NOW() <= valid_until
  ),

  INDEX idx_active_citations_priority (brand_id, priority),
  INDEX idx_active_citations_validity (valid_until),
  INDEX idx_active_citations_refresh (next_refresh_at)
);

-- Historical GEO citation data (>28 days, archived)
CREATE TABLE gv_geo_citations_history (
  id UUID PRIMARY KEY,
  brand_id UUID NOT NULL,
  topic_id UUID NOT NULL,
  ai_engine TEXT NOT NULL,

  -- Citation data (snapshot)
  citation_frequency INTEGER,
  citation_rank INTEGER,
  citation_status TEXT,

  -- Snapshot metadata
  snapshot_date DATE NOT NULL,
  priority TEXT,

  created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_history_citations_brand_date (brand_id, snapshot_date),
  INDEX idx_history_citations_topic (topic_id, snapshot_date)
);

-- Aggregated monthly summaries (indefinite retention)
CREATE TABLE gv_geo_citations_monthly (
  id UUID PRIMARY KEY,
  brand_id UUID NOT NULL,
  topic_id UUID NOT NULL,
  ai_engine TEXT NOT NULL,
  month DATE NOT NULL, -- First day of month

  -- Aggregated metrics
  avg_citation_frequency DECIMAL,
  max_citation_rank INTEGER,
  min_citation_rank INTEGER,
  rank_improvements INTEGER,
  rank_declines INTEGER,

  -- Change tracking
  frequency_change_pct DECIMAL,
  rank_change INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, topic_id, ai_engine, month),
  INDEX idx_monthly_citations_brand (brand_id, month)
);
```

---

## 5. Refresh Cycle Implementation

### GEO Citations (Example)

```typescript
interface GEORefreshConfig {
  // High-priority topics (gold - 7 days)
  gold_topics: {
    criteria: [
      'Citation frequency >= 70% (performing_well)',
      'Brand currently in top 3',
      'Competitor threats detected',
      'New opportunity (high potential)'
    ];
    refresh_cycle: 7;
    validity_window: 7;
  };

  // Medium-priority topics (silver - 14 days)
  silver_topics: {
    criteria: [
      'Citation frequency 30-69% (needs_improvement)',
      'Brand rank 4-10',
      'Stable performance',
      'Optimization in progress'
    ];
    refresh_cycle: 14;
    validity_window: 14;
  };

  // Low-priority topics (bronze - 28 days)
  bronze_topics: {
    criteria: [
      'Citation frequency <30% (new_opportunity)',
      'Brand rank >10 or not cited',
      'Low-volume topics',
      'Archive/evergreen content'
    ];
    refresh_cycle: 28;
    validity_window: 28;
  };
}

async function refreshGEOCitations(brandId: string) {
  const topics = await getTrackedTopics(brandId);

  for (const topic of topics) {
    // Determine priority based on current performance
    const priority = determineGEOPriority(topic);

    // Check if refresh needed
    const refreshCheck = await checkAndRefreshData('geo_citation', topic.id, priority);

    if (refreshCheck.needs_refresh) {
      // Run Perplexity pre-filter
      const perplexityFilter = await runPerplexityPreFilter(topic.id, topic.ai_engine, brandId);

      if (perplexityFilter.recommended_action === 'analyze_now') {
        // Run Claude reverse engineering
        const claudeStrategy = await runClaudeReverseEngineering(topic, brandId, perplexityFilter);

        // Execute with OpenAI
        const executionResult = await executeWithOpenAI(claudeStrategy);

        // Update active data
        await updateActiveCitation({
          topic_id: topic.id,
          citation_data: executionResult,
          priority: priority,
          last_refreshed_at: new Date(),
          valid_until: addDays(new Date(), REFRESH_CYCLES[priority].validity_window),
          next_refresh_at: addDays(new Date(), REFRESH_CYCLES[priority].cycle_days)
        });

        // Archive old data to history
        await archiveToHistory('geo_citation', topic.id);
      }
    }
  }
}

function determineGEOPriority(topic: Topic): 'gold' | 'silver' | 'bronze' {
  // Gold: High-value, high-priority
  if (topic.citation_frequency >= 70 || topic.brand_rank <= 3 || topic.competitor_threat) {
    return 'gold';
  }

  // Silver: Medium priority, needs improvement
  if (topic.citation_frequency >= 30 || (topic.brand_rank >= 4 && topic.brand_rank <= 10)) {
    return 'silver';
  }

  // Bronze: Low priority, new opportunities
  return 'bronze';
}
```

---

## 6. Multi-Channel Backlinks Refresh

```typescript
interface BacklinkRefreshConfig {
  // Gold (7 days) - Trending, time-sensitive
  gold_opportunities: {
    criteria: [
      'Perplexity rank 1-5',
      'Urgency score >= 80',
      'Time sensitivity: HIGH',
      'Trending content (HN, Reddit)',
      'Author responsiveness >= 80%'
    ];
    refresh_cycle: 7;
  };

  // Silver (14 days) - Medium value
  silver_opportunities: {
    criteria: [
      'Perplexity rank 6-20',
      'Urgency score 50-79',
      'Time sensitivity: MEDIUM',
      'Stable platforms (Medium, LinkedIn)',
      'Author responsiveness 50-79%'
    ];
    refresh_cycle: 14;
  };

  // Bronze (28 days) - Lower priority
  bronze_opportunities: {
    criteria: [
      'Perplexity rank 21+',
      'Urgency score <50',
      'Time sensitivity: LOW',
      'Cold outreach',
      'Author responsiveness <50%'
    ];
    refresh_cycle: 28;
  };
}

async function refreshBacklinkOpportunities(brandId: string) {
  const opportunities = await getMultiChannelOpportunities(brandId);

  for (const opp of opportunities) {
    const priority = determineBacklinkPriority(opp);
    const refreshCheck = await checkAndRefreshData('backlink_opportunity', opp.id, priority);

    if (refreshCheck.needs_refresh) {
      // Re-rank with Perplexity (check if still valuable)
      const updatedRanking = await rankOpportunitiesWithPerplexity([opp], { brand_id: brandId });

      // Update active opportunity
      await updateActiveOpportunity({
        opportunity_id: opp.id,
        perplexity_ranking: updatedRanking[0].perplexity_ranking,
        priority: priority,
        last_refreshed_at: new Date(),
        valid_until: addDays(new Date(), REFRESH_CYCLES[priority].validity_window),
        next_refresh_at: addDays(new Date(), REFRESH_CYCLES[priority].cycle_days)
      });
    }
  }
}

function determineBacklinkPriority(opp: BacklinkOpportunity): 'gold' | 'silver' | 'bronze' {
  if (opp.perplexity_rank <= 5 || opp.urgency_score >= 80 || opp.time_sensitivity === 'high') {
    return 'gold';
  }

  if (opp.perplexity_rank <= 20 || opp.urgency_score >= 50) {
    return 'silver';
  }

  return 'bronze';
}
```

---

## 7. Cost Optimization with Short Cycles

### How We Keep Costs Low

```typescript
// Challenge: More frequent refreshes = higher costs?
// Solution: Smart caching + delta detection + prioritization

const COST_OPTIMIZATION_STRATEGIES = {
  // 1. Delta caching (60-70% cost reduction)
  delta_caching: {
    strategy: 'Only refresh if content changed',
    implementation: 'MD5 hash comparison',
    savings: '60-70%'
  },

  // 2. Priority-based allocation
  priority_allocation: {
    gold: '40% of refresh budget',    // 7-day cycle
    silver: '35% of refresh budget',  // 14-day cycle
    bronze: '25% of refresh budget',  // 28-day cycle

    // Example: Premium tier
    total_monthly_budget: '$5.64',
    gold_spend: '$2.26',   // High-value data
    silver_spend: '$1.97', // Medium-value data
    bronze_spend: '$1.41'  // Low-value data
  },

  // 3. Batch processing
  batch_processing: {
    strategy: 'Group similar refreshes together',
    batch_size: 10,
    api_cost_per_batch: '$0.02',
    vs_individual: '$0.002 × 10 = $0.02',
    savings: '0% but faster'
  },

  // 4. Intelligent skipping
  intelligent_skipping: {
    skip_if_no_change: true,
    skip_if_low_value: true,
    skip_if_recent_check: true,
    estimated_savings: '30-40%'
  }
};

// Example cost calculation
const MONTHLY_COSTS_WITH_SHORT_CYCLES = {
  basic: {
    // GEO (100 checks/month)
    geo_gold: 40 * $0.005 = $0.20,    // 7-day: 40 checks
    geo_silver: 35 * $0.005 = $0.175,  // 14-day: 35 checks
    geo_bronze: 25 * $0.005 = $0.125,  // 28-day: 25 checks
    geo_total: $0.50,

    // Backlinks (20 opportunities)
    backlink_gold: 8 * $0.01 = $0.08,   // 7-day: top 8
    backlink_silver: 7 * $0.01 = $0.07, // 14-day: next 7
    backlink_bronze: 5 * $0.01 = $0.05, // 28-day: rest 5
    backlink_total: $0.20,

    // Automation
    openai_execution: $1.20,

    total_per_month: $1.90
  }
};
```

---

## Summary

### Key Principles

✅ **Short refresh cycles**: 7D/14D/28D (not 90D)
✅ **Long-term storage**: Keep data >90 days for trends
✅ **Smart validity**: Data expires based on priority
✅ **Auto-refresh**: Triggered by time/events/thresholds
✅ **Cost-efficient**: Delta caching + prioritization
✅ **Always fresh**: Never serve stale data to clients

### Data Lifecycle

```
1. DATA CREATION
   ↓
2. ACTIVE PERIOD (7D/14D/28D - based on priority)
   ↓ (validity expires)
3. AUTO-REFRESH TRIGGERED
   ↓
4. ARCHIVE TO HISTORY (>28 days)
   ↓
5. MONTHLY AGGREGATION
   ↓
6. LONG-TERM STORAGE (>90 days for trends)
```

### Benefits vs 90-Day Cycles

| Metric | 90-Day Cycle | GeoVera (7/14/28D) |
|--------|--------------|-------------------|
| **Data Freshness** | Stale for 3 months | Fresh within 7-28 days |
| **Trending Detection** | Miss 90% of trends | Catch early (7 days) |
| **Competitor Response** | 90 days late | 7-28 days response time |
| **Cost** | Lower | Optimized with caching |
| **Accuracy** | Outdated | Always current |
| **Iteration Speed** | Quarterly | Weekly/Bi-weekly |

**Result**: GeoVera delivers 12x faster insights than traditional tools! 🚀
