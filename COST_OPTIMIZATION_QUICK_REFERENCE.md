# ⚡ COST OPTIMIZATION QUICK REFERENCE

**Last Updated:** February 14, 2026
**For:** Developers implementing cost optimizations

---

## 🎯 TARGET: 33% Cost Reduction ($338/month savings)

**From:** $1,017/month → **To:** $679/month

---

## 📋 CHECKLIST

### Phase 1: Quick Wins (Week 1) [$147/month]
- [ ] Perplexity model routing ($60)
- [ ] Claude cache optimization ($52)
- [ ] Skip re-analysis logic ($35)

### Phase 2: Intelligent Scraping (Week 2-3) [$178/month]
- [ ] Creator tier system ($164)
- [ ] Inactive detection ($14)

### Phase 3: Advanced Caching (Week 4) [$27/month]
- [ ] Trend caching infrastructure ($27)

---

## 🔧 KEY CODE CHANGES

### 1. Perplexity Model Selection
**File:** `supabase/functions/hub-discover-content/index.ts`

```typescript
function selectPerplexityModel(articleType: string): string {
  return {
    "hot": "llama-3.1-sonar-small-128k-online",      // $0.001
    "review": "sonar-pro",                            // $0.001
    "education": "llama-3.1-sonar-small-128k-online", // $0.0005 ⬇️
    "nice_to_know": "llama-3.1-sonar-small-128k-online" // $0.0005 ⬇️
  }[articleType];
}
```

### 2. Creator Tier Logic
**File:** `supabase/functions/radar-calculate-tiers/index.ts` (NEW)

```typescript
function calculateCreatorTier(stats: CreatorStats): TierResult {
  // Tier 3: Low performers → Monthly (30 days)
  if (engagement < 2 || daysSincePost > 30 || quality < 0.4) {
    return { tier: 3, frequency_days: 30 };
  }

  // Tier 1: High performers → Weekly (7 days)
  if (engagement > 5 && quality > 0.7 && followers > 200K) {
    return { tier: 1, frequency_days: 7 };
  }

  // Tier 2: Mid performers → Bi-weekly (14 days)
  return { tier: 2, frequency_days: 14 };
}
```

### 3. Skip Re-Analysis
**File:** `supabase/functions/radar-analyze-content/index.ts`

```typescript
// Check if already analyzed
if (content.analysis_status === "completed" || content.quality_score !== null) {
  return { skipped: true, cost: 0 };
}

// Check for duplicate post_id
const duplicate = await findDuplicatePost(post_id);
if (duplicate) {
  await copyScoresFromDuplicate(duplicate);
  return { skipped: true, cost: 0 };
}
```

### 4. Trend Caching
**File:** `supabase/functions/hub-discover-content/index.ts`

```typescript
// Check cache first
const cached = await getCachedTrends(category, articleType);
if (cached) {
  return { ...cached, from_cache: true, cost: 0 };
}

// Cache miss - call Perplexity
const result = await callPerplexityAPI(category, articleType);

// Cache for 24h (6h for "hot" articles)
await cacheTrends(category, articleType, result, ttl);
```

---

## 📊 API COST REFERENCE

### Perplexity
- `sonar-pro`: $0.001 per request
- `sonar-small`: $0.0005 per request (50% cheaper)
- `sonar-online`: $0.001 per request (real-time)

### Claude
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens
- Cache write: $3.75 per 1M tokens
- **Cache read: $0.30 per 1M tokens** ⬅️ 90% cheaper!

### Apify
- Instagram scrape: $0.015 per creator
- TikTok scrape: $0.020 per creator
- YouTube scrape: $0.015 per creator
- Average: $0.017 per creator

### OpenAI (gpt-4o-mini)
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- Average article: $0.12

### SerpAPI
- YouTube search: $0.001 per query
- Google Trends: $0.001 per query

---

## 🎯 OPTIMIZATION FORMULAS

### Tier-Based Scraping Savings
```
Before: 8,000 creators × $0.017 × 4 weeks = $544/month

After:
- Tier 1 (1,600): $0.017 × 4 = $109/month
- Tier 2 (4,000): $0.017 × 2 = $136/month
- Tier 3 (2,400): $0.017 × 1 = $41/month
Total: $286/month

Savings: $544 - $286 = $258/month (47%)
```

### Cache Savings Formula
```
Savings = Requests × Cache_Hit_Rate × (Normal_Cost - Cache_Cost)

Example (Claude):
= 7,200 requests × 0.95 × ($0.002 - $0.0002)
= $13/batch × 27 batches
= $52/month saved
```

### Model Routing Savings
```
Before: 400 requests × $0.001 = $0.40

After:
- 25% hot: 100 × $0.001 = $0.10
- 25% review: 100 × $0.001 = $0.10
- 50% simple: 200 × $0.0005 = $0.10
Total: $0.30

Savings: $0.40 - $0.30 = $0.10 per cycle (25%)
```

---

## 🔍 MONITORING QUERIES

### Daily Cost Check
```sql
SELECT
  DATE(created_at) as date,
  SUM(cost_usd) as total_cost,
  COUNT(*) as api_calls
FROM (
  SELECT created_at, 0.001 as cost_usd FROM gv_hub_articles WHERE created_at >= CURRENT_DATE
  UNION ALL
  SELECT analyzed_at, 0.002 FROM gv_creator_content WHERE analyzed_at >= CURRENT_DATE
  UNION ALL
  SELECT scraped_at, 0.017 FROM gv_creator_content WHERE scraped_at >= CURRENT_DATE
) costs
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Cache Hit Rate
```sql
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN cached_at IS NOT NULL THEN 1 END) as hits,
  ROUND(100.0 * COUNT(CASE WHEN cached_at IS NOT NULL THEN 1 END) / COUNT(*), 2) as hit_rate
FROM gv_trend_cache
WHERE cached_at >= CURRENT_DATE - INTERVAL '7 days';
```

### Tier Distribution
```sql
SELECT
  scrape_tier,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 1) as percentage,
  ROUND(AVG(engagement_rate), 2) as avg_engagement
FROM gv_creators
WHERE is_active = true
GROUP BY scrape_tier
ORDER BY scrape_tier;
```

---

## ⚠️ ALERT THRESHOLDS

| Metric | Warning | Critical |
|--------|---------|----------|
| **Daily Cost** | >$35 | >$40 |
| **Claude Cache Hit** | <85% | <80% |
| **API Error Rate** | >2% | >5% |
| **Tier 1 %** | <15% or >25% | <10% or >30% |

---

## 🧪 TESTING COMMANDS

### Test Perplexity Routing
```bash
# Should use sonar-small (cheaper)
curl -X POST $SUPABASE_URL/functions/v1/hub-discover-content \
  -d '{"category":"beauty","article_type":"education"}' | jq '.result.cost_usd'

# Expected: $0.0005
```

### Test Tier Calculation
```bash
curl -X POST $SUPABASE_URL/functions/v1/radar-calculate-tiers \
  -H "Authorization: Bearer $SERVICE_KEY" | jq '.tier_distribution'

# Expected: ~20% tier1, ~50% tier2, ~30% tier3
```

### Test Cache
```bash
# First call (cache miss)
time curl -X POST $SUPABASE_URL/functions/v1/hub-discover-content \
  -d '{"category":"beauty","article_type":"hot"}' | jq '.result.cost_usd'

# Expected: $0.001, time: ~5s

# Second call (cache hit)
time curl -X POST $SUPABASE_URL/functions/v1/hub-discover-content \
  -d '{"category":"beauty","article_type":"hot"}' | jq '.result.cost_usd'

# Expected: $0.000, time: ~2s
```

---

## 🚨 ROLLBACK COMMANDS

### Disable Tier System
```sql
UPDATE gv_creators SET scrape_tier = 2, scrape_frequency_days = 7, next_scrape_date = now();
```

### Clear Cache
```sql
TRUNCATE TABLE gv_trend_cache;
TRUNCATE TABLE gv_cache_metadata;
```

### Reset Model Selection
```typescript
// In hub-discover-content/index.ts
const model = "sonar-pro"; // Back to expensive model
```

---

## 📞 SUPPORT

**Issues?**
- Slack: `#cost-optimization`
- Email: `eng-team@geovera.xyz`
- On-call: Check PagerDuty

**Documentation:**
- Full Report: `GEOVERA_API_COST_OPTIMIZATION_REPORT.md`
- Implementation: `COST_OPTIMIZATION_IMPLEMENTATION_GUIDE.md`
- Workflows: `API_WORKFLOW_OPTIMIZATION_DIAGRAMS.md`
- Executive Summary: `COST_OPTIMIZATION_EXECUTIVE_SUMMARY.md`

---

## ✅ SUCCESS METRICS

| Phase | Target Savings | Implementation | Status |
|-------|----------------|----------------|--------|
| Phase 1 | $147/month | 6 hours | ⏳ Pending |
| Phase 2 | $178/month | 11 hours | ⏳ Pending |
| Phase 3 | $27/month | 5 hours | ⏳ Pending |
| **TOTAL** | **$338/month** | **22 hours** | **⏳ Pending** |

---

## 🎓 KEY LEARNINGS

1. **Cache aggressively** - 90% cost reduction on cached requests
2. **Tier creators** - 20% drive 80% of value
3. **Route by complexity** - Cheaper models work for simple tasks
4. **Skip duplicates** - ~10% of work is redundant
5. **Monitor everything** - Can't optimize what you don't measure

---

**READY TO IMPLEMENT? START WITH PHASE 1!**

Good luck! 🚀
