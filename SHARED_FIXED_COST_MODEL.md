# SHARED FIXED COST MODEL
## Fixed Cost Shared Across All Brands - Scale Benefits

---

## OVERVIEW

**REVOLUTIONARY PRICING MODEL**: Fixed cost adalah untuk **monitoring shared pool** (top 500 creators, top 1000 sites), bukan per-brand!

**Key Concept**:
- GeoVera monitors **top 500 creators + 1000 sites** untuk 4 kategori → **Fixed cost $1,200/month**
- Cost ini **shared across ALL brands** di platform
- Semakin banyak brand, semakin murah fixed cost per brand!
- Setiap brand **hanya melihat subset** yang relevant ke brand mereka

---

## 1. SHARED POOL ARCHITECTURE

### 1.1 GeoVera Global Pool (Platform Level)

```typescript
interface GeoVeraGlobalPool {
  // Platform-level monitoring (ALL brands share this)
  sso_global_pool: {
    categories: 4, // tech, business, marketing, developers
    creators_per_category: 500, // Top 500 each
    sites_per_category: 1000,   // Top 1000 each

    total_creators: 2000,  // 4 × 500
    total_sites: 4000,     // 4 × 1000

    // Platform fixed cost (shared)
    monitoring_cost_per_month: 1200.00, // $1,200/month total

    // Cost breakdown
    creator_monitoring: 600.00,  // $0.30 per creator per month
    site_monitoring: 400.00,     // $0.10 per site per month
    system_overhead: 200.00      // Infrastructure, caching, etc.
  };

  // Cost sharing model
  cost_sharing: {
    total_brands: 50,  // Example: 50 brands using GeoVera
    cost_per_brand: 24.00, // $1,200 / 50 = $24 per brand

    // As platform grows
    with_100_brands: 12.00,  // $1,200 / 100 = $12 per brand
    with_500_brands: 2.40,   // $1,200 / 500 = $2.40 per brand
    with_1000_brands: 1.20   // $1,200 / 1000 = $1.20 per brand 🎉
  };
}
```

### 1.2 Per-Brand Allocation (Variable Cost)

```typescript
interface PerBrandAllocation {
  // Brands DON'T pay for monitoring the pool
  // They pay to ACCESS relevant subset

  basic_tier: {
    creators_allocated: 20,  // Top 20 relevant to brand
    sites_allocated: 50,     // Top 50 relevant to brand

    // Cost to populate/filter from global pool
    allocation_cost: 2.00,   // One-time per month

    // Variable cost when viewing
    view_cost_per_creator: 0.05,
    view_cost_per_site: 0.02
  };

  premium_tier: {
    creators_allocated: 50,  // Top 50 relevant to brand
    sites_allocated: 100,    // Top 100 relevant to brand

    allocation_cost: 5.00,
    view_cost_per_creator: 0.05,
    view_cost_per_site: 0.02
  };

  partner_tier: {
    creators_allocated: 100, // Top 100 relevant to brand
    sites_allocated: 200,    // Top 200 relevant to brand

    allocation_cost: 10.00,
    view_cost_per_creator: 0.05,
    view_cost_per_site: 0.02
  };
}
```

---

## 2. HOW IT WORKS

### 2.1 Platform Level (GeoVera)

```
Month 1:
GeoVera monitors top 500 creators × 4 categories = 2,000 creators
GeoVera monitors top 1,000 sites × 4 categories = 4,000 sites

Total Platform Cost: $1,200/month
Brands on platform: 50
Fixed cost per brand: $1,200 / 50 = $24/brand

Month 6:
Same monitoring (2,000 creators + 4,000 sites)
Brands on platform: 200
Fixed cost per brand: $1,200 / 200 = $6/brand 🎉

Month 12:
Same monitoring
Brands on platform: 500
Fixed cost per brand: $1,200 / 500 = $2.40/brand 🎉🎉

Economics of Scale!
```

### 2.2 Brand Level (Individual Brand)

```
Brand "Acme Corp" - Premium Tier

Step 1: Allocation (Monthly - Variable Cost)
  ├─→ GeoVera filters top 2,000 creators → Find 50 most relevant to "Acme Corp"
  ├─→ GeoVera filters top 4,000 sites → Find 100 most relevant to "Acme Corp"
  └─→ Cost: $5 (allocation/filtering cost)

Step 2: Dashboard Surface View (Included in Fixed Cost)
  ├─→ Show: "50 relevant creators tracked"
  ├─→ Show: "100 relevant sites tracked"
  ├─→ Show: "12 mentions this month"
  └─→ Cost: $0 (surface data free)

Step 3: User Clicks "View Creators" (Variable Cost)
  ├─→ Load list of 50 creators (pagination)
  ├─→ Cost: 50 × $0.05 = $2.50
  └─→ Only charged when user actually views

Step 4: User Clicks Creator Details (Variable Cost)
  ├─→ Load full creator profile + mentions + analysis
  ├─→ Cost: $0.25 per creator detail view
  └─→ User clicks 10 creators = $2.50

Total for Acme Corp This Month:
  ├─→ Shared fixed cost: $6 (assuming 200 brands on platform)
  ├─→ Allocation: $5
  ├─→ View creators list: $2.50
  ├─→ View 10 creator details: $2.50
  └─→ Total: $16
```

---

## 3. CREATOR/SITE ALLOCATION LOGIC

### 3.1 From Global Pool to Brand Subset

```typescript
async function allocateCreatorsForBrand(
  brandId: string,
  tier: 'basic' | 'premium' | 'partner',
  category: string
): Promise<Creator[]> {
  // Step 1: Get brand's keywords/topics
  const brandKeywords = await getBrandKeywords(brandId);
  const brandIndustry = await getBrandIndustry(brandId);

  // Step 2: Get global pool (already monitored - no cost!)
  const globalPool = await supabase
    .from('gv_sso_creators')
    .select('*')
    .eq('category_id', getCategoryId(category))
    .order('impact_score', { descending: true })
    .limit(500); // Top 500 from global pool

  // Step 3: Score relevance to brand
  const scoredCreators = await Promise.all(
    globalPool.data.map(async (creator) => {
      const relevanceScore = await calculateRelevance(
        creator,
        brandKeywords,
        brandIndustry
      );

      return {
        ...creator,
        relevance_to_brand: relevanceScore
      };
    })
  );

  // Step 4: Sort by combined score (impact × relevance)
  const sortedByRelevance = scoredCreators
    .map(c => ({
      ...c,
      combined_score: c.impact_score * c.relevance_to_brand
    }))
    .sort((a, b) => b.combined_score - a.combined_score);

  // Step 5: Allocate based on tier
  const allocation = {
    basic: 20,
    premium: 50,
    partner: 100
  }[tier];

  const allocatedCreators = sortedByRelevance.slice(0, allocation);

  // Step 6: Save allocation (for this month)
  await supabase.from('gv_brand_creator_allocation').insert(
    allocatedCreators.map(c => ({
      brand_id: brandId,
      creator_id: c.id,
      relevance_score: c.relevance_to_brand,
      combined_score: c.combined_score,
      allocated_at: new Date(),
      month: getCurrentMonth()
    }))
  );

  return allocatedCreators;
}

// Example relevance calculation
async function calculateRelevance(
  creator: Creator,
  brandKeywords: string[],
  brandIndustry: string
): Promise<number> {
  let score = 0;

  // Factor 1: Creator content matches brand keywords (50%)
  const creatorTopics = creator.metadata?.topics || [];
  const keywordMatches = brandKeywords.filter(kw =>
    creatorTopics.some(t => t.toLowerCase().includes(kw.toLowerCase()))
  ).length;
  score += (keywordMatches / brandKeywords.length) * 50;

  // Factor 2: Creator industry matches brand (30%)
  if (creator.metadata?.industry === brandIndustry) {
    score += 30;
  }

  // Factor 3: Creator mentions similar brands (20%)
  const mentionedBrands = creator.metadata?.brands_mentioned || [];
  const competitorOverlap = mentionedBrands.filter(b =>
    isCompetitor(b, brandId)
  ).length;
  score += (competitorOverlap / 5) * 20; // Max 5 competitors

  return score; // 0-100
}
```

### 3.2 Monthly Re-Allocation

```typescript
// Run monthly on 1st day
Deno.cron("monthly-brand-allocation", "0 3 1 * *", async () => {
  console.log('[Monthly Allocation] Starting...');

  const brands = await supabase.from('gv_brands').select('*');

  for (const brand of brands.data) {
    const tier = brand.tier;

    // Allocate creators for each category
    for (const category of ['tech', 'business', 'marketing', 'developers']) {
      await allocateCreatorsForBrand(brand.id, tier, category);
    }

    // Allocate sites
    for (const category of ['tech_news', 'business_news', 'industry_blogs']) {
      await allocateSitesForBrand(brand.id, tier, category);
    }

    // Track allocation cost
    const allocationCost = {
      basic: 2.00,
      premium: 5.00,
      partner: 10.00
    }[tier];

    await trackVariableCost(
      brand.id,
      'variable',
      'monthly_allocation',
      'brand_allocation',
      allocationCost
    );
  }

  console.log('[Monthly Allocation] Complete');
});
```

---

## 4. UPDATED COST STRUCTURE

### 4.1 Platform Fixed Cost (Shared)

```typescript
interface PlatformFixedCost {
  // Total platform monitoring cost
  total_monthly: 1200.00, // $1,200/month

  // Breakdown
  sso_monitoring: {
    creators: 600.00,  // 2,000 creators × $0.30
    sites: 400.00,     // 4,000 sites × $0.10
    total: 1000.00
  },

  system_overhead: {
    delta_cache: 50.00,
    unified_indexes: 50.00,
    incremental_discovery: 50.00,
    self_learning: 50.00,
    total: 200.00
  },

  // Per-brand share (depends on total brands)
  per_brand_share: {
    with_10_brands: 120.00,   // $1,200 / 10
    with_50_brands: 24.00,    // $1,200 / 50
    with_100_brands: 12.00,   // $1,200 / 100
    with_200_brands: 6.00,    // $1,200 / 200 ✓ Sweet spot
    with_500_brands: 2.40,    // $1,200 / 500
    with_1000_brands: 1.20    // $1,200 / 1000 🎉
  }
}
```

### 4.2 Per-Brand Fixed Cost (NEW)

```typescript
interface PerBrandFixedCost {
  // GEO monitoring (brand-specific topics)
  geo_monitoring: {
    basic: 10.00,   // 10 topics × $1.00
    premium: 20.00, // 20 topics × $1.00
    partner: 40.00  // 40 topics × $1.00
  };

  // SEO monitoring (brand-specific keywords)
  seo_monitoring: {
    all_tiers: 10.00 // 50 keywords × $0.20
  };

  // Share of platform SSO cost (assuming 200 brands)
  sso_share: 6.00, // $1,200 / 200 brands

  // Total per-brand fixed cost
  total_by_tier: {
    basic: 26.00,    // $10 + $10 + $6
    premium: 36.00,  // $20 + $10 + $6
    partner: 56.00   // $40 + $10 + $6
  }
}
```

### 4.3 Variable Costs (NEW)

```typescript
interface PerBrandVariableCost {
  // Monthly allocation (filtering from global pool)
  monthly_allocation: {
    basic: 2.00,     // Filter top 20 creators + 50 sites
    premium: 5.00,   // Filter top 50 creators + 100 sites
    partner: 10.00   // Filter top 100 creators + 200 sites
  };

  // View costs (on-demand)
  view_costs: {
    creator_list: {
      cost_per_creator: 0.05,
      typical_monthly_views: {
        basic: 10,    // View 10 creators × $0.05 = $0.50
        premium: 25,  // View 25 creators × $0.05 = $1.25
        partner: 50   // View 50 creators × $0.05 = $2.50
      }
    },
    site_list: {
      cost_per_site: 0.02,
      typical_monthly_views: {
        basic: 20,    // View 20 sites × $0.02 = $0.40
        premium: 50,  // View 50 sites × $0.02 = $1.00
        partner: 100  // View 100 sites × $0.02 = $2.00
      }
    },
    detail_views: {
      creator_details: 0.25,
      site_details: 0.15,
      typical_monthly: {
        basic: 5,     // 5 × $0.25 = $1.25
        premium: 10,  // 10 × $0.25 = $2.50
        partner: 20   // 20 × $0.25 = $5.00
      }
    }
  };

  // Other variable costs (unchanged)
  ai_chat: 7.50,
  content_generation: 12.80,
  competitor_analysis: 15.00,
  // ... etc

  // Total typical variable
  total_typical: {
    basic: 45.00,    // Allocation + views + other
    premium: 60.00,
    partner: 80.00
  }
}
```

---

## 5. FINAL PRICING (WITH SCALE BENEFITS)

### 5.1 At Scale (200 Brands on Platform)

| Tier | Fixed | Variable | Total/Month |
|------|-------|----------|-------------|
| Basic | $26 | $45 | **$71** ✨ |
| Premium | $36 | $60 | **$96** ✨ |
| Partner | $56 | $80 | **$136** ✨ |

### 5.2 At Different Scale Points

**With 50 Brands** (Early Stage):
- Shared SSO cost: $1,200 / 50 = $24/brand
- Basic tier: $44 fixed + $45 variable = **$89/month**
- Premium tier: $54 fixed + $60 variable = **$114/month**
- Partner tier: $74 fixed + $80 variable = **$154/month**

**With 200 Brands** (Target Scale):
- Shared SSO cost: $1,200 / 200 = $6/brand
- Basic tier: $26 fixed + $45 variable = **$71/month** ✓
- Premium tier: $36 fixed + $60 variable = **$96/month** ✓
- Partner tier: $56 fixed + $80 variable = **$136/month** ✓

**With 500 Brands** (Mature Scale):
- Shared SSO cost: $1,200 / 500 = $2.40/brand
- Basic tier: $22.40 fixed + $45 variable = **$67.40/month** 🎉
- Premium tier: $32.40 fixed + $60 variable = **$92.40/month** 🎉
- Partner tier: $52.40 fixed + $80 variable = **$132.40/month** 🎉

**With 1000 Brands** (Dream Scale):
- Shared SSO cost: $1,200 / 1,000 = $1.20/brand
- Basic tier: $21.20 fixed + $45 variable = **$66.20/month** 🚀
- Premium tier: $31.20 fixed + $60 variable = **$91.20/month** 🚀
- Partner tier: $51.20 fixed + $80 variable = **$131.20/month** 🚀

---

## 6. DATABASE SCHEMA FOR ALLOCATION

```sql
-- Brand creator allocation (from global pool)
CREATE TABLE gv_brand_creator_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES gv_sso_creators(id) ON DELETE CASCADE,

  -- Relevance scoring
  relevance_score DECIMAL(5,2), -- How relevant to brand (0-100)
  combined_score DECIMAL(10,2), -- impact_score × relevance_score

  -- Allocation info
  month TEXT NOT NULL, -- '2025-01'
  rank_for_brand INTEGER, -- 1-100 (brand-specific rank)

  allocated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, creator_id, month)
);

CREATE INDEX idx_brand_creator_alloc_brand ON gv_brand_creator_allocation(brand_id);
CREATE INDEX idx_brand_creator_alloc_month ON gv_brand_creator_allocation(month);
CREATE INDEX idx_brand_creator_alloc_score ON gv_brand_creator_allocation(combined_score DESC);

-- Brand site allocation (from global pool)
CREATE TABLE gv_brand_site_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  site_id UUID REFERENCES gv_sso_sites(id) ON DELETE CASCADE,

  -- Relevance scoring
  relevance_score DECIMAL(5,2),
  combined_score DECIMAL(10,2),

  -- Allocation info
  month TEXT NOT NULL,
  rank_for_brand INTEGER,

  allocated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, site_id, month)
);

CREATE INDEX idx_brand_site_alloc_brand ON gv_brand_site_allocation(brand_id);
CREATE INDEX idx_brand_site_alloc_month ON gv_brand_site_allocation(month);

-- Platform scale tracking
CREATE TABLE gv_platform_scale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL UNIQUE,

  -- Platform stats
  total_brands INTEGER NOT NULL,
  total_creators_monitored INTEGER DEFAULT 2000,
  total_sites_monitored INTEGER DEFAULT 4000,

  -- Cost distribution
  platform_fixed_cost DECIMAL(10,2) DEFAULT 1200.00,
  cost_per_brand DECIMAL(10,4), -- $1,200 / total_brands

  -- Economics
  revenue_per_brand_avg DECIMAL(10,2),
  total_platform_revenue DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. BENEFITS OF SHARED MODEL

### 7.1 For GeoVera (Platform)

✅ **Predictable Costs**: $1,200/month regardless of brand count
✅ **Scale Economics**: More brands = higher profit margin
✅ **Competitive Pricing**: Can offer lower prices as platform grows
✅ **Network Effects**: Better data with more brands

### 7.2 For Brands (Customers)

✅ **Lower Fixed Costs**: Shared monitoring reduces per-brand cost
✅ **Scale Benefits**: Price decreases as platform grows
✅ **High-Quality Data**: Access to top 500 creators/1000 sites
✅ **Relevant Subset**: Only see creators/sites relevant to YOUR brand
✅ **Pay Per View**: Only charged for data you actually use

### 7.3 For Everyone

✅ **Win-Win Model**: Platform profits grow, customer costs decrease
✅ **Sustainable**: Economic model scales efficiently
✅ **Fair Pricing**: Pay for what you use + share infrastructure costs

---

## 8. IMPLEMENTATION

### 8.1 Platform Dashboard (GeoVera Admin)

```
Platform Health Dashboard
┌─────────────────────────────────────────────────┐
│ Total Brands: 200                               │
│ Platform Fixed Cost: $1,200/month               │
│ Cost per Brand: $6.00/month                     │
│                                                  │
│ Creators Monitored: 2,000 (top 500 × 4 cat)    │
│ Sites Monitored: 4,000 (top 1000 × 4 cat)      │
│                                                  │
│ Average Revenue per Brand: $96/month            │
│ Total Platform Revenue: $19,200/month           │
│ Profit Margin: 93.8% ($1,200 cost / $19,200)   │
│                                                  │
│ Growth Projection:                              │
│ ├─ 300 brands: $4/brand fixed cost             │
│ ├─ 500 brands: $2.40/brand fixed cost          │
│ └─ 1000 brands: $1.20/brand fixed cost 🎉      │
└─────────────────────────────────────────────────┘
```

### 8.2 Brand Dashboard (Customer View)

```
Your Monthly Costs - Acme Corp (Premium Tier)
┌─────────────────────────────────────────────────┐
│ Fixed Costs:                                    │
│ ├─ GEO monitoring (20 topics): $20.00          │
│ ├─ SEO monitoring (50 keywords): $10.00        │
│ └─ SSO shared access: $6.00                    │
│ Total Fixed: $36.00                             │
│                                                  │
│ Variable Costs:                                 │
│ ├─ Monthly allocation: $5.00                   │
│ ├─ Creator/site views: $3.50                   │
│ ├─ AI Chat: $8.00                               │
│ ├─ Content generation: $25.00                  │
│ └─ Other: $18.50                                │
│ Total Variable: $60.00                          │
│                                                  │
│ Total This Month: $96.00                        │
│                                                  │
│ 💡 Your SSO cost decreased from $24 to $6      │
│    as GeoVera platform grew! (More brands =     │
│    lower cost for everyone)                     │
└─────────────────────────────────────────────────┘
```

---

## 9. SUMMARY

### Key Innovation: Shared Pool Model

**Traditional Model** (What Competitors Do):
- Monitor 500 creators PER BRAND → $43.50/brand
- 200 brands = $8,700/month total cost
- No scale benefits

**GeoVera Model** (Revolutionary):
- Monitor 500 creators ONCE → $600/month total
- Share cost across 200 brands → $3/brand
- **97% cost reduction** through sharing! 🎉

### Final Pricing at Target Scale (200 brands)

| Tier | Fixed | Variable | Total |
|------|-------|----------|-------|
| Basic | **$26** | $45 | **$71/mo** |
| Premium | **$36** | $60 | **$96/mo** |
| Partner | **$56** | $80 | **$136/mo** |

### At Dream Scale (1000 brands)

| Tier | Fixed | Variable | Total |
|------|-------|----------|-------|
| Basic | **$21** | $45 | **$66/mo** |
| Premium | **$31** | $60 | **$91/mo** |
| Partner | **$51** | $80 | **$131/mo** |

**The more GeoVera grows, the cheaper it gets for everyone!** 🚀

---

**END OF DOCUMENT**
