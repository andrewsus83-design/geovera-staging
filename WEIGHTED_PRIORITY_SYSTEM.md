# ⚖️ WEIGHTED CLIENT CATEGORY PRIORITY SYSTEM
## Advanced Resource Allocation with Multiple Factors

**Date**: February 17, 2026
**Purpose**: Smart priority allocation based on client value, not just count
**Improvement**: Considers revenue, tier, and engagement - not just client count!

---

## 🎯 THE ADVANCED CONCEPT

### **Basic Priority (Previous)**:
```
Priority = Client Count

Problem: 10 Growth clients ($399 each) = Same priority as 3 Enterprise clients ($1,099 each)
But Enterprise clients pay 2.75x more!
```

### **Weighted Priority (NEW)**:
```
Priority Score = (Client Count × Revenue Weight) + Engagement Factor + Tier Bonus

Result: Enterprise clients get MUCH higher priority than Growth clients
Coca-Cola Enterprise gets 3x resources vs Coca-Cola Growth
```

---

## 📊 PRIORITY WEIGHT FACTORS

### **Factor 1: Revenue Weight (60% of score)**

| Tier | Monthly Revenue | Weight Multiplier |
|------|-----------------|-------------------|
| **Enterprise** | $1,099 | **3.0x** |
| **Scale** | $699 | **2.0x** |
| **Growth** | $399 | **1.0x** (baseline) |

**Example**:
```
1 Enterprise client = 3.0 weight units
1 Scale client = 2.0 weight units
1 Growth client = 1.0 weight units

Category Priority = Sum of all weight units
```

---

### **Factor 2: Engagement Score (25% of score)**

Measures how actively clients use the platform:

| Engagement Level | Criteria | Bonus Multiplier |
|------------------|----------|------------------|
| **High** | Logs in daily, views all reports | **+30%** |
| **Medium** | Logs in weekly, views some reports | **+15%** |
| **Low** | Logs in monthly, minimal usage | **+0%** |

**Why This Matters**:
- Active clients get more value → Prioritize them
- Inactive clients don't notice delays → Lower priority

---

### **Factor 3: Tier Bonus (15% of score)**

Additional boost for premium tiers:

| Tier | Base Priority | Tier Bonus |
|------|---------------|------------|
| **Enterprise** | Revenue-based | **+20%** (white-label, API access) |
| **Scale** | Revenue-based | **+10%** (advanced features) |
| **Growth** | Revenue-based | **+0%** (standard) |

**Why**: Premium tiers expect premium service!

---

## 🧮 WEIGHTED PRIORITY FORMULA

```typescript
Category Priority Score =
  (Σ Client Revenue Weights × 0.60) +
  (Σ Client Engagement Scores × 0.25) +
  (Σ Client Tier Bonuses × 0.15)

Then normalize to 100% resources
```

---

## 📊 WEIGHTED PRIORITY EXAMPLES

### **Example 1: Single Client Per Category**

#### **Food & Beverage**:
- 1 Enterprise client (Coca-Cola)
- Revenue weight: 3.0
- Engagement: High (+30% = 0.9)
- Tier bonus: +20% = 0.6
- **Total**: 3.0 + 0.9 + 0.6 = **4.5 points**

#### **Beauty**:
- 1 Growth client (LocalBrand)
- Revenue weight: 1.0
- Engagement: Medium (+15% = 0.15)
- Tier bonus: +0% = 0
- **Total**: 1.0 + 0.15 + 0 = **1.15 points**

#### **Fashion & Tech**:
- 0 clients
- Minimum allocation: **0.5 points each** (authority building)

**Total Points**: 4.5 + 1.15 + 0.5 + 0.5 = **6.65 points**

**Resource Allocation**:
```
F&B (Coca-Cola Enterprise): 4.5 / 6.65 = 67.7%  ⭐⭐⭐⭐⭐
Beauty (LocalBrand Growth): 1.15 / 6.65 = 17.3% ⭐⭐
Fashion (No clients): 0.5 / 6.65 = 7.5%         ⭐
Tech (No clients): 0.5 / 6.65 = 7.5%            ⭐
```

**Coca-Cola gets 4x more resources than the Growth client!**

---

### **Example 2: Multiple Clients, Mixed Tiers**

#### **Food & Beverage**:
- 1 Enterprise (Coca-Cola): 3.0 + 0.9 + 0.6 = 4.5
- 2 Scale (Pepsi, Sprite): (2.0 + 0.45 + 0.3) × 2 = 5.5
- 3 Growth (local brands): (1.0 + 0.15 + 0) × 3 = 3.45
- **Total**: 4.5 + 5.5 + 3.45 = **13.45 points**

#### **Beauty**:
- 5 Growth clients: (1.0 + 0.15 + 0) × 5 = **5.75 points**

#### **Fashion**:
- 2 Scale clients: (2.0 + 0.45 + 0.3) × 2 = **5.5 points**

#### **Tech**:
- 0 clients: **0.5 points** (minimum)

**Total Points**: 13.45 + 5.75 + 5.5 + 0.5 = **25.2 points**

**Resource Allocation**:
```
F&B (6 clients, mixed tiers): 13.45 / 25.2 = 53.4% ⭐⭐⭐⭐⭐
Beauty (5 Growth clients): 5.75 / 25.2 = 22.8%    ⭐⭐⭐
Fashion (2 Scale clients): 5.5 / 25.2 = 21.8%     ⭐⭐⭐
Tech (No clients): 0.5 / 25.2 = 2.0%              ⭐
```

**Key Insight**: 6 clients in F&B (with Enterprise) get MORE resources than 5 Growth clients in Beauty!

---

## 🎯 WEIGHTED MONITORING FREQUENCIES

### **Based on Weighted Priority Score**:

| Priority Score | Monitoring Frequency | QA Allocation |
|----------------|---------------------|---------------|
| **>40%** (Very High) | 2D/4D/8D (4x boost) | +75% (2,625 QA) |
| **30-40%** (High) | 3D/6D/12D (2.5x boost) | +50% (2,250 QA) |
| **20-30%** (Medium-High) | 5D/10D/20D (1.5x boost) | +25% (1,875 QA) |
| **10-20%** (Medium) | 7D/14D/28D (standard) | +0% (1,500 QA) |
| **<10%** (Low) | 14D/28D/56D (0.5x) | -25% (1,125 QA) |

### **Coca-Cola Enterprise Example** (67.7% priority):
```
SSO Monitoring:
├─ Top 30 creators: Every 2 days (4x faster!)
├─ Rank 11-100: Every 4 days (3.5x faster!)
└─ Rank 101-450: Every 8 days (1.75x faster!)

QA Allocation: 2,625 QA pairs/month (+75%)
├─ 1,050 Social (40%)
├─ 866 GEO (33%)
└─ 709 SEO (27%)
```

---

## 💰 WEIGHTED COST ALLOCATION

### **Fixed Cost Distribution**:

Total Fixed Cost: $1,345.16/month

**Allocated by weighted priority**:

#### **Example with Coca-Cola Enterprise (67.7%)**:
```
F&B Category Cost: $1,345.16 × 67.7% = $910.67
├─ SSO: $819.20 × 67.7% = $554.40
├─ SEO: $258.00 × 67.7% = $174.67
├─ GEO: $50.80 × 67.7% = $34.39
├─ QA: $192.00 × 67.7% = $130.00
└─ Ops: $25.16 × 67.7% = $17.03

Other Categories: $1,345.16 × 32.3% = $434.49 (shared)
```

**Per-Brand Fixed Cost (Coca-Cola)**:
```
If F&B has 1 client (Coca-Cola):
$910.67 / 1 = $910.67 allocated to Coca-Cola

Add Variable: $910.67 + $1.80 = $912.47 total cost

Pricing: $1,099 (Enterprise)
Profit: $1,099 - $912.47 = $186.53
Margin: 17% (lower due to high resource allocation)

BUT: Coca-Cola gets PREMIUM service (4x monitoring!)
```

**If F&B had 6 clients (mixed tiers)**:
```
F&B allocation: $717.51 (53.4% of fixed cost)
Per brand: $717.51 / 6 = $119.59 per brand (average)

Enterprise client (Coca-Cola):
Allocated: $119.59 × 1.5 = $179.38 (premium share)
Variable: $1.80
Total: $181.18
Pricing: $1,099
Profit: $917.82
Margin: 83.5% ✅
```

---

## 📊 DYNAMIC REBALANCING

### **When New Client Joins**:

```sql
-- Automatic priority recalculation
CREATE OR REPLACE FUNCTION recalculate_weighted_priorities()
RETURNS TRIGGER AS $$
DECLARE
  total_weighted_score DECIMAL;
  min_allocation DECIMAL := 0.02; -- Minimum 2% for any category
BEGIN
  -- Calculate weighted scores for all categories
  WITH category_scores AS (
    SELECT
      c.id as category_id,
      c.name as category_name,

      -- Revenue weight (60%)
      SUM(
        CASE
          WHEN b.tier = 'enterprise' THEN 3.0
          WHEN b.tier = 'scale' THEN 2.0
          WHEN b.tier = 'growth' THEN 1.0
          ELSE 0
        END
      ) * 0.60 as revenue_score,

      -- Engagement weight (25%)
      SUM(
        CASE
          WHEN b.engagement_level = 'high' THEN 0.30
          WHEN b.engagement_level = 'medium' THEN 0.15
          ELSE 0
        END
      ) * 0.25 as engagement_score,

      -- Tier bonus (15%)
      SUM(
        CASE
          WHEN b.tier = 'enterprise' THEN 0.20
          WHEN b.tier = 'scale' THEN 0.10
          ELSE 0
        END
      ) * 0.15 as tier_bonus,

      COUNT(b.id) as client_count

    FROM gv_categories c
    LEFT JOIN gv_brands b ON b.category_id = c.id AND b.active = true
    GROUP BY c.id, c.name
  )

  -- Calculate total weighted score
  SELECT SUM(
    COALESCE(revenue_score, 0) +
    COALESCE(engagement_score, 0) +
    COALESCE(tier_bonus, 0) +
    CASE WHEN client_count = 0 THEN 0.5 ELSE 0 END -- Minimum for no clients
  ) INTO total_weighted_score
  FROM category_scores;

  -- Update each category's allocation
  UPDATE gv_categories c
  SET
    weighted_priority_score = (
      SELECT
        COALESCE(revenue_score, 0) +
        COALESCE(engagement_score, 0) +
        COALESCE(tier_bonus, 0) +
        CASE WHEN cs.client_count = 0 THEN 0.5 ELSE 0 END
      FROM category_scores cs
      WHERE cs.category_id = c.id
    ),
    resource_allocation = GREATEST(
      (
        SELECT
          (
            COALESCE(revenue_score, 0) +
            COALESCE(engagement_score, 0) +
            COALESCE(tier_bonus, 0) +
            CASE WHEN cs.client_count = 0 THEN 0.5 ELSE 0 END
          ) / NULLIF(total_weighted_score, 0) * 100
        FROM category_scores cs
        WHERE cs.category_id = c.id
      ),
      min_allocation * 100 -- Ensure minimum allocation
    ),
    priority_tier = CASE
      WHEN (SELECT client_count FROM category_scores WHERE category_id = c.id) >= 1 THEN 1
      ELSE 3
    END,
    last_priority_update = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on brand changes
CREATE TRIGGER update_weighted_priorities
AFTER INSERT OR UPDATE OR DELETE ON gv_brands
FOR EACH STATEMENT
EXECUTE FUNCTION recalculate_weighted_priorities();
```

---

## 🎯 WEIGHTED PRIORITY DASHBOARD

### **Real-Time Category Allocation**:

```
WEIGHTED CATEGORY PRIORITIES (Live):

┌─────────────────────────────────────────────────────────┐
│ 🏆 FOOD & BEVERAGE - 67.7% Resources                   │
├─────────────────────────────────────────────────────────┤
│ Weighted Score: 4.5 / 6.65 total                       │
│                                                          │
│ Coca-Cola (Enterprise) ⭐⭐⭐⭐⭐                        │
│ ├─ Revenue Weight: 3.0 (60%)                           │
│ ├─ Engagement: High (+30% = 0.9)                       │
│ ├─ Tier Bonus: +20% = 0.6                             │
│ ├─ Total Contribution: 4.5 points                      │
│ ├─ Monitoring: 2D/4D/8D (4x faster!)                  │
│ ├─ QA Allocation: 2,625/month (+75%)                  │
│ └─ Last Processed: 1 hour ago                         │
│                                                          │
│ Category Stats:                                          │
│ ├─ Total Clients: 1                                    │
│ ├─ Total Revenue: $1,099/month                         │
│ ├─ Resources Used: 67.7% (Premium!)                   │
│ └─ Processing Queue: Position #1 (Always first)       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🥈 BEAUTY - 17.3% Resources                            │
├─────────────────────────────────────────────────────────┤
│ Weighted Score: 1.15 / 6.65 total                      │
│                                                          │
│ LocalBrand (Growth) ⭐⭐                                │
│ ├─ Revenue Weight: 1.0 (60%)                           │
│ ├─ Engagement: Medium (+15% = 0.15)                   │
│ ├─ Tier Bonus: +0% = 0                                │
│ ├─ Total Contribution: 1.15 points                     │
│ ├─ Monitoring: 7D/14D/28D (Standard)                  │
│ ├─ QA Allocation: 1,500/month (Standard)              │
│ └─ Last Processed: 4 days ago                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🥉 FASHION & TECH - 15% Resources (Authority Mode)     │
├─────────────────────────────────────────────────────────┤
│ No clients yet - Building authority                     │
│ ├─ Monitoring: 14D/28D/56D (Background)               │
│ ├─ QA Allocation: 1,125/month (-25%)                  │
│ └─ Last Processed: 12 days ago                        │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 ADVANCED FEATURES

### **1. Engagement Tracking**:

```typescript
// Update engagement score based on activity
async function updateEngagementScore(brandId: string) {
  const last30Days = await supabase
    .from('gv_user_activity')
    .select('*')
    .eq('brand_id', brandId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  const loginCount = last30Days.filter(a => a.action === 'login').length;
  const reportViews = last30Days.filter(a => a.action === 'view_report').length;

  const engagementLevel =
    loginCount >= 20 && reportViews >= 50 ? 'high' :
    loginCount >= 5 && reportViews >= 10 ? 'medium' : 'low';

  await supabase
    .from('gv_brands')
    .update({ engagement_level: engagementLevel })
    .eq('id', brandId);
}
```

---

### **2. Auto-Tier Upgrade Recommendations**:

```typescript
// Suggest tier upgrades based on usage
async function checkTierUpgradeOpportunity(brandId: string) {
  const brand = await supabase
    .from('gv_brands')
    .select('*, usage_stats(*)')
    .eq('id', brandId)
    .single();

  if (brand.tier === 'growth' && brand.engagement_level === 'high') {
    // Heavy user on Growth tier - suggest Scale
    await supabase
      .from('gv_notifications')
      .insert({
        brand_id: brandId,
        type: 'tier_upgrade_suggestion',
        message: 'Based on your high usage, consider upgrading to Scale tier for faster monitoring and more features!',
        priority: 'medium'
      });
  }

  if (brand.tier === 'scale' && brand.usage_stats.api_calls > 10000) {
    // Heavy API user on Scale - suggest Enterprise
    await supabase
      .from('gv_notifications')
      .insert({
        brand_id: brandId,
        type: 'tier_upgrade_suggestion',
        message: 'Your API usage suggests Enterprise tier would provide better value. Contact us for white-label options!',
        priority: 'high'
      });
  }
}
```

---

### **3. Fair Usage Alerts**:

```typescript
// Alert if category is monopolizing resources
async function checkFairUsageBalance() {
  const categories = await supabase
    .from('gv_categories')
    .select('*')
    .order('resource_allocation', { ascending: false });

  const topCategory = categories[0];

  if (topCategory.resource_allocation > 80) {
    // One category using >80% resources
    console.warn(`⚠️ ${topCategory.name} using ${topCategory.resource_allocation}% resources`);

    // Consider adding another processing instance for balance
    await considerScalingResources();
  }
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### **Database Schema**:
- [ ] Add `weighted_priority_score` to `gv_categories`
- [ ] Add `engagement_level` to `gv_brands` (high/medium/low)
- [ ] Add `tier` to `gv_brands` (enterprise/scale/growth)
- [ ] Create `gv_user_activity` table for tracking engagement
- [ ] Create `recalculate_weighted_priorities()` function
- [ ] Add trigger on brand insert/update/delete

### **Processing Logic**:
- [ ] Update monitoring cron with weighted frequency calculation
- [ ] Implement QA allocation boost based on priority score
- [ ] Add weighted queue processing (highest score first)
- [ ] Create engagement tracking system
- [ ] Build auto-rebalancing on priority changes

### **Dashboard**:
- [ ] Show weighted priority scores per category
- [ ] Display resource allocation percentages
- [ ] Show processing frequency per client tier
- [ ] Add engagement level indicators
- [ ] Create tier upgrade suggestions UI

---

## 🎉 SUMMARY

**WEIGHTED PRIORITY = SMART + FAIR ALLOCATION**

### **Key Improvements**:
1. ✅ **Revenue-based**: Enterprise clients get 3x priority vs Growth
2. ✅ **Engagement-based**: Active users get faster service
3. ✅ **Tier-based**: Premium tiers get premium treatment
4. ✅ **Fair minimum**: Even non-clients get 2% resources
5. ✅ **Auto-rebalancing**: System adjusts as clients join/leave

### **Example (Coca-Cola Enterprise)**:
- Weighted score: 4.5 points
- Resource allocation: 67.7%
- Monitoring frequency: 4x faster (2D/4D/8D)
- QA pairs: 2,625/month (+75%)
- Processing: Always first in queue

### **Cost**:
- Fixed cost: $1,345.16 (unchanged)
- Variable cost: $1.80 per brand
- Result: Premium clients get premium service without increasing total cost!

---

**Status**: ✅ Ready to Implement
**Complexity**: High (but worth it!)
**Impact**: VERY HIGH (fair + smart allocation)
**Timeline**: 2-3 weeks for full implementation

---

**END OF WEIGHTED PRIORITY SYSTEM**
