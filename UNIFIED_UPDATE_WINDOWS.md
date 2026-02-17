# UNIFIED UPDATE WINDOWS - CONSISTENT ACROSS ALL SYSTEMS
## 7D / 14D / 28D Standard + 3D Exception for Top 100 Creators ONLY

---

## OVERVIEW

**CRITICAL RULE**: Semua sistem (SEO, GEO, SSO) menggunakan update window yang SAMA:

- **7 Days (Gold)**: High-performing items (top 40% with high scores)
- **14 Days (Silver)**: Medium-performing items
- **28 Days (Bronze)**: Low-performing items

**EXCEPTION**: **ONLY Top 100 creators** (berdasarkan Perplexity suggestion) menggunakan **3 Days (Platinum)**

---

## 1. UNIFIED UPDATE WINDOW RULES

### 1.1 Standard Windows (SEO + GEO + SSO)

```typescript
const UNIFIED_UPDATE_WINDOWS = {
  // Platinum: ONLY for top 100 creators (Perplexity recommended)
  platinum: {
    days: 3,
    description: 'Top 100 highest-impact creators ONLY',
    applies_to: ['sso_creators'], // ONLY creators, NOT sites
    criteria: 'perplexity_rank <= 100 AND impact_score >= 85'
  },

  // Gold: High-performing (ALL systems)
  gold: {
    days: 7,
    description: 'High-performing items across all systems',
    applies_to: ['seo_keywords', 'geo_topics', 'sso_creators', 'sso_sites'],
    criteria: {
      seo: 'rank_position <= 10 OR search_volume >= 10000',
      geo: 'citation_frequency >= 70%',
      sso_creators: 'perplexity_rank <= 200 AND impact_score >= 70',
      sso_sites: 'perplexity_rank <= 400 AND impact_score >= 70'
    }
  },

  // Silver: Medium-performing (ALL systems)
  silver: {
    days: 14,
    description: 'Medium-performing items',
    applies_to: ['seo_keywords', 'geo_topics', 'sso_creators', 'sso_sites'],
    criteria: {
      seo: 'rank_position <= 30 OR search_volume >= 1000',
      geo: 'citation_frequency >= 30%',
      sso_creators: 'perplexity_rank <= 350 OR impact_score >= 50',
      sso_sites: 'perplexity_rank <= 700 OR impact_score >= 50'
    }
  },

  // Bronze: Low-performing / New (ALL systems)
  bronze: {
    days: 28,
    description: 'Low-performing or new items',
    applies_to: ['seo_keywords', 'geo_topics', 'sso_creators', 'sso_sites'],
    criteria: {
      seo: 'rank_position > 30 OR new item',
      geo: 'citation_frequency < 30% OR new topic',
      sso_creators: 'perplexity_rank > 350',
      sso_sites: 'perplexity_rank > 700'
    }
  }
};
```

### 1.2 Updated Priority Assignment Function

```typescript
function assignUnifiedPriority(
  item: SEOKeyword | GEOTopic | SSOCreator | SSOSite,
  itemType: 'seo_keyword' | 'geo_topic' | 'sso_creator' | 'sso_site'
): {
  priority: 'platinum' | 'gold' | 'silver' | 'bronze';
  updateWindowDays: 3 | 7 | 14 | 28;
  reasoning: string;
} {
  // PLATINUM: ONLY for top 100 creators (Perplexity recommendation)
  if (
    itemType === 'sso_creator' &&
    item.perplexity_rank <= 100 &&
    item.impact_score >= 85
  ) {
    return {
      priority: 'platinum',
      updateWindowDays: 3,
      reasoning: 'Top 100 creator with impact >= 85 (Perplexity recommended)'
    };
  }

  // GOLD (7D): High-performing across all systems
  if (itemType === 'seo_keyword') {
    if (item.rank_position <= 10 || item.search_volume >= 10000) {
      return {
        priority: 'gold',
        updateWindowDays: 7,
        reasoning: 'High SEO performance (rank ≤10 or volume ≥10K)'
      };
    }
  }

  if (itemType === 'geo_topic') {
    if (item.citation_frequency >= 70) {
      return {
        priority: 'gold',
        updateWindowDays: 7,
        reasoning: 'High GEO citation frequency (≥70%)'
      };
    }
  }

  if (itemType === 'sso_creator') {
    if (item.perplexity_rank <= 200 && item.impact_score >= 70) {
      return {
        priority: 'gold',
        updateWindowDays: 7,
        reasoning: 'High-impact creator (rank ≤200, score ≥70)'
      };
    }
  }

  if (itemType === 'sso_site') {
    if (item.perplexity_rank <= 400 && item.impact_score >= 70) {
      return {
        priority: 'gold',
        updateWindowDays: 7,
        reasoning: 'High-impact site (rank ≤400, score ≥70)'
      };
    }
  }

  // SILVER (14D): Medium-performing
  if (itemType === 'seo_keyword') {
    if (item.rank_position <= 30 || item.search_volume >= 1000) {
      return {
        priority: 'silver',
        updateWindowDays: 14,
        reasoning: 'Medium SEO performance (rank ≤30 or volume ≥1K)'
      };
    }
  }

  if (itemType === 'geo_topic') {
    if (item.citation_frequency >= 30) {
      return {
        priority: 'silver',
        updateWindowDays: 14,
        reasoning: 'Medium GEO citation frequency (30-69%)'
      };
    }
  }

  if (itemType === 'sso_creator') {
    if (item.perplexity_rank <= 350 || item.impact_score >= 50) {
      return {
        priority: 'silver',
        updateWindowDays: 14,
        reasoning: 'Medium-impact creator (rank ≤350 or score ≥50)'
      };
    }
  }

  if (itemType === 'sso_site') {
    if (item.perplexity_rank <= 700 || item.impact_score >= 50) {
      return {
        priority: 'silver',
        updateWindowDays: 14,
        reasoning: 'Medium-impact site (rank ≤700 or score ≥50)'
      };
    }
  }

  // BRONZE (28D): Everything else
  return {
    priority: 'bronze',
    updateWindowDays: 28,
    reasoning: 'Low-performing or new item'
  };
}
```

---

## 2. UPDATED DATABASE TRIGGERS

### 2.1 SSO Priority Trigger (Updated)

```sql
-- Updated: Only top 100 creators get platinum (3D)
CREATE OR REPLACE FUNCTION update_sso_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- PLATINUM (3D): ONLY top 100 creators with impact >= 85
  IF TG_TABLE_NAME = 'gv_sso_creators' AND
     NEW.perplexity_rank <= 100 AND
     NEW.impact_score >= 85 THEN
    NEW.queue_priority := 'platinum';
    NEW.update_window_days := 3;

  -- GOLD (7D): High-performing
  ELSIF (
    (TG_TABLE_NAME = 'gv_sso_creators' AND
     NEW.perplexity_rank <= 200 AND
     NEW.impact_score >= 70) OR
    (TG_TABLE_NAME = 'gv_sso_sites' AND
     NEW.perplexity_rank <= 400 AND
     NEW.impact_score >= 70)
  ) THEN
    NEW.queue_priority := 'gold';
    NEW.update_window_days := 7;

  -- SILVER (14D): Medium-performing
  ELSIF (
    (TG_TABLE_NAME = 'gv_sso_creators' AND
     (NEW.perplexity_rank <= 350 OR NEW.impact_score >= 50)) OR
    (TG_TABLE_NAME = 'gv_sso_sites' AND
     (NEW.perplexity_rank <= 700 OR NEW.impact_score >= 50))
  ) THEN
    NEW.queue_priority := 'silver';
    NEW.update_window_days := 14;

  -- BRONZE (28D): Everything else
  ELSE
    NEW.queue_priority := 'bronze';
    NEW.update_window_days := 28;
  END IF;

  -- Update next check date
  NEW.next_check_at := NOW() + (NEW.update_window_days || ' days')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2.2 GEO Priority Trigger (Consistent)

```sql
-- GEO topics use same 7/14/28D windows (NO 3D)
CREATE OR REPLACE FUNCTION update_geo_topic_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- GOLD (7D): High citation frequency
  IF NEW.citation_frequency >= 70 THEN
    NEW.queue_priority := 'gold';
    NEW.check_interval_days := 7;

  -- SILVER (14D): Medium citation frequency
  ELSIF NEW.citation_frequency >= 30 THEN
    NEW.queue_priority := 'silver';
    NEW.check_interval_days := 14;

  -- BRONZE (28D): Low or new
  ELSE
    NEW.queue_priority := 'bronze';
    NEW.check_interval_days := 28;
  END IF;

  -- Update next check date
  NEW.next_check_at := NOW() + (NEW.check_interval_days || ' days')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. UPDATED SSO SCHEMA

### 3.1 Update SSO Tables

```sql
-- Update gv_sso_creators: Platinum only for top 100
ALTER TABLE gv_sso_creators
  DROP CONSTRAINT IF EXISTS gv_sso_creators_queue_priority_check,
  ADD CONSTRAINT gv_sso_creators_queue_priority_check
    CHECK (queue_priority IN ('platinum', 'gold', 'silver', 'bronze'));

ALTER TABLE gv_sso_creators
  DROP CONSTRAINT IF EXISTS gv_sso_creators_update_window_days_check,
  ADD CONSTRAINT gv_sso_creators_update_window_days_check
    CHECK (update_window_days IN (3, 7, 14, 28));

-- Sites NEVER get platinum (only 7/14/28D)
ALTER TABLE gv_sso_sites
  DROP CONSTRAINT IF EXISTS gv_sso_sites_queue_priority_check,
  ADD CONSTRAINT gv_sso_sites_queue_priority_check
    CHECK (queue_priority IN ('gold', 'silver', 'bronze'));

ALTER TABLE gv_sso_sites
  DROP CONSTRAINT IF EXISTS gv_sso_sites_update_window_days_check,
  ADD CONSTRAINT gv_sso_sites_update_window_days_check
    CHECK (update_window_days IN (7, 14, 28));
```

---

## 4. PERPLEXITY TOP 100 RECOMMENDATION

### 4.1 How Perplexity Identifies Top 100

```typescript
async function getPerplexityTop100Creators(
  category: string
): Promise<Creator[]> {
  const perplexityQuery = `
Identify the top 100 MOST IMPACTFUL creators in "${category}" category.

These top 100 creators should be checked FREQUENTLY (every 3 days) because:
1. They have MASSIVE reach (millions of followers)
2. They post DAILY or multiple times per day
3. Their content goes VIRAL quickly
4. They are TRENDSETTERS in the category
5. Missing their brand mention = missing HUGE opportunity

Criteria for top 100:
- Impact score >= 85 (out of 100)
- Follower count >= 100K
- Engagement rate >= 3%
- Post frequency >= 5 posts/week
- Authority score >= 80

Return ONLY the top 100 that meet ALL criteria above.`;

  const response = await perplexity.chat({
    model: 'sonar-pro',
    messages: [
      { role: 'user', content: perplexityQuery }
    ]
  });

  const creators = JSON.parse(response.choices[0].message.content);

  // Validate: ONLY creators with rank 1-100 AND impact >= 85
  return creators
    .filter((c, index) => index < 100 && c.impact_score >= 85)
    .map((c, index) => ({
      ...c,
      perplexity_rank: index + 1,
      recommended_check_frequency: '3 days',
      reasoning: 'Perplexity identified as top 100 high-impact creator requiring frequent monitoring'
    }));
}
```

---

## 5. UNIFIED QUEUE SCHEDULER

### 5.1 Updated Cron Job

```typescript
// Run every hour - process items due for check
Deno.cron("unified-queue-scheduler", "0 * * * *", async () => {
  console.log('[Unified Queue] Starting scheduled processing...');

  // Platinum (3D): ONLY top 100 creators
  await processUnifiedQueue('platinum', 3, ['sso_creators']);

  // Gold (7D): ALL high-performing items
  await processUnifiedQueue('gold', 7, [
    'seo_keywords',
    'geo_topics',
    'sso_creators',
    'sso_sites'
  ]);

  // Silver (14D): ALL medium-performing items
  await processUnifiedQueue('silver', 14, [
    'seo_keywords',
    'geo_topics',
    'sso_creators',
    'sso_sites'
  ]);

  // Bronze (28D): ALL low-performing items
  await processUnifiedQueue('bronze', 28, [
    'seo_keywords',
    'geo_topics',
    'sso_creators',
    'sso_sites'
  ]);

  console.log('[Unified Queue] Processing complete');
});

async function processUnifiedQueue(
  priority: 'platinum' | 'gold' | 'silver' | 'bronze',
  windowDays: number,
  itemTypes: string[]
): Promise<void> {
  console.log(`[Queue] Processing ${priority} (${windowDays}D window)...`);

  // Process each item type
  for (const itemType of itemTypes) {
    const items = await getItemsDueForCheck(priority, itemType);

    if (items.length > 0) {
      console.log(`[Queue] Found ${items.length} ${itemType} items due for check`);
      await processBatch(items, itemType);
    }
  }
}
```

---

## 6. COST COMPARISON

### 6.1 Monthly Processing Costs

**Top 100 Creators (Platinum - 3D)**:
```
- 100 creators × 10 checks/month = 1,000 checks
- Cost per check: $0.05
- Total: $50/month
```

**Remaining 400 Creators (Gold/Silver/Bronze - 7D/14D/28D)**:
```
- 400 creators with varied windows
  - Gold (7D): 100 creators × 4 checks = 400 checks
  - Silver (14D): 150 creators × 2 checks = 300 checks
  - Bronze (28D): 150 creators × 1 check = 150 checks
- Total: 850 checks
- Cost: 850 × $0.05 = $42.50/month
```

**Total SSO Creators: $92.50/month**

**Sites (NEVER Platinum, only 7D/14D/28D)**:
```
- 1000 sites across priorities
  - Gold (7D): 400 sites × 4 checks = 1,600 checks
  - Silver (14D): 300 sites × 2 checks = 600 checks
  - Bronze (28D): 300 sites × 1 check = 300 checks
- Total: 2,500 checks
- Cost: 2,500 × $0.05 = $125/month
```

**Total Monthly Cost: $217.50** (vs $350 if all were 3D)
**Savings: 38% reduction**

---

## 7. MONITORING DASHBOARD

### 7.1 Update Window Distribution

```sql
-- View: Distribution of items by update window
CREATE OR REPLACE VIEW gv_update_window_distribution AS
SELECT
  'SSO Creators' as system,
  queue_priority as priority,
  update_window_days as window_days,
  COUNT(*) as item_count
FROM gv_sso_creators
GROUP BY queue_priority, update_window_days

UNION ALL

SELECT
  'SSO Sites' as system,
  queue_priority,
  update_window_days,
  COUNT(*)
FROM gv_sso_sites
GROUP BY queue_priority, update_window_days

UNION ALL

SELECT
  'GEO Topics' as system,
  queue_priority,
  check_interval_days,
  COUNT(*)
FROM gv_geo_tracked_topics
GROUP BY queue_priority, check_interval_days

ORDER BY window_days ASC, item_count DESC;
```

### 7.2 Expected Output

```
| System       | Priority | Window | Count |
|--------------|----------|--------|-------|
| SSO Creators | platinum | 3D     | 100   | ← ONLY top 100!
| SSO Creators | gold     | 7D     | 100   |
| GEO Topics   | gold     | 7D     | 50    |
| SSO Sites    | gold     | 7D     | 400   |
| SSO Creators | silver   | 14D    | 150   |
| GEO Topics   | silver   | 14D    | 75    |
| SSO Sites    | silver   | 14D    | 300   |
| SSO Creators | bronze   | 28D    | 150   |
| GEO Topics   | bronze   | 28D    | 75    |
| SSO Sites    | bronze   | 28D    | 300   |
```

---

## 8. SUMMARY

### ✅ **CONSISTENT UPDATE WINDOWS**

1. **3 Days (Platinum)**: ONLY top 100 creators (Perplexity recommended)
2. **7 Days (Gold)**: High-performing across ALL systems
3. **14 Days (Silver)**: Medium-performing across ALL systems
4. **28 Days (Bronze)**: Low-performing across ALL systems

### 📊 **BENEFITS**

- **Consistency**: Same windows across SEO, GEO, SSO
- **Focus**: Top 100 creators get special attention (3D)
- **Efficiency**: Sites NEVER get 3D (only 7/14/28D)
- **Cost Savings**: 38% reduction vs all 3D monitoring
- **Perplexity-Driven**: Top 100 based on AI recommendation, not arbitrary

### 🎯 **IMPLEMENTATION**

- ✅ Updated database triggers
- ✅ Updated priority assignment functions
- ✅ Updated schema constraints
- ✅ Updated cron scheduler
- ✅ Monitoring dashboard created

---

**END OF DOCUMENT**
