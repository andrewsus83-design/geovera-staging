# CATEGORICAL-FIRST ARCHITECTURE 🔄
## Revolutionary Shift: All Data at Category Level, Brands Use Shared Pool

---

## 🎯 STRATEGIC SHIFT

### **OLD MODEL** ❌
- Each brand monitored separately
- Duplicate operations across brands
- High fixed cost per brand

### **NEW MODEL** ✅
- **GeoVera monitors EVERYTHING at category level**
- **All brands share the same pool**
- **Brand-specific actions = variable cost only**
- **As platform grows = better data for everyone**

---

## 📐 ARCHITECTURE OVERVIEW

```
GEOVERA PLATFORM (Categorical Level)
├── SEO System (Categorical)
│   ├── Track top 1,000 keywords per category
│   ├── Monitor top 500 backlink opportunities per category
│   ├── Analyze top 100 competitors per category
│   └── Share pool across ALL brands
│
├── GEO System (Categorical)
│   ├── Track 1,000 Q&A per category (pro-rated by impact)
│   ├── Monitor 4 AI engines per category
│   ├── Track citation patterns per category
│   └── Share insights across ALL brands
│
├── Social Search (Categorical)
│   ├── Monitor top 500 creators per category
│   ├── Track top 1,000 sites per category
│   ├── Analyze trending topics per category
│   └── Share mentions across ALL brands
│
└── BRANDS (Use Shared Pool + Variable Cost for Custom)
    ├── Basic Tier: Access top 20% of pool
    ├── Premium Tier: Access top 50% of pool
    ├── Partner Tier: Access top 100% of pool
    └── Custom tracking = variable cost
```

---

## 💡 HOW IT WORKS

### **1. Platform Monitors at Category Level**

**Example: "Digital Marketing" Category**

GeoVera monitors:
- **SEO**: Top 1,000 keywords, 500 backlinks, 100 competitors
- **GEO**: 1,000 Q&A (pro-rated by impact), citation patterns
- **SSO**: Top 500 creators, 1,000 sites

**Cost**: $110/month per category (shared across ALL brands)

---

### **2. Brands Access Shared Pool (Tiered)**

**Brand A (Digital Marketing Agency) - Premium Tier**
- Gets: Top 50% of keywords (500 keywords)
- Gets: Top 50% of creators (250 creators)
- Gets: All Q&A data (1,000 Q&A)
- Gets: Top 50% backlink opportunities (250 opportunities)
- **Cost**: $10/month (allocation from shared pool)

**Brand B (SEO Tool) - Partner Tier**
- Gets: Top 100% of keywords (1,000 keywords)
- Gets: Top 100% of creators (500 creators)
- Gets: All Q&A data (1,000 Q&A)
- Gets: All backlink opportunities (500 opportunities)
- **Cost**: $20/month (allocation from shared pool)

**Brand C wants custom keyword "geovera pricing 2026"**:
- Not in categorical pool
- OpenAI tracks custom keyword
- **Cost**: $2/month variable cost (added to their bill)

---

### **3. As Platform Grows = Better for Everyone**

**Month 1**: 50 brands in "Digital Marketing"
- Platform tracks 1,000 keywords
- Each brand shares $110 ÷ 50 = **$2.20 fixed cost**

**Month 6**: 200 brands in "Digital Marketing"
- Platform STILL tracks same 1,000 keywords
- Each brand shares $110 ÷ 200 = **$0.55 fixed cost**

**Result**: 75% cost reduction as platform scales!

---

## 🔢 PRO-RATED Q&A BY IMPACT

### **Problem**: Not all Q&A are equal in value

**Low Impact Q&A**: "What is SEO?" (generic, low revenue)
**High Impact Q&A**: "Best enterprise SEO tool for e-commerce 2026?" (specific, high revenue)

### **Solution**: Pro-rate 1,000 Q&A based on visibility + revenue impact

```typescript
interface QAImpactWeighting {
  visibility_score: number;  // 0-100 (how often asked)
  revenue_score: number;     // 0-100 (purchase intent)
  combined_score: number;    // visibility * 0.6 + revenue * 0.4
}

// Example allocation for "Digital Marketing" category
const qaAllocation = {
  high_impact: {
    count: 400,  // 40% of pool
    criteria: 'combined_score >= 70',
    examples: [
      'Best digital marketing agency for SaaS startups 2026?',
      'Which marketing automation tool has highest ROI?',
      'Top 10 enterprise marketing platforms comparison'
    ]
  },
  medium_impact: {
    count: 400,  // 40% of pool
    criteria: 'combined_score 40-69',
    examples: [
      'How to measure marketing ROI?',
      'Digital marketing best practices 2026',
      'Content marketing vs paid ads effectiveness'
    ]
  },
  low_impact: {
    count: 200,  // 20% of pool
    criteria: 'combined_score < 40',
    examples: [
      'What is digital marketing?',
      'History of online advertising',
      'Basic marketing terminology explained'
    ]
  }
};
```

### **How Perplexity Pro-Rates Q&A**

```typescript
async function proRateQAByImpact(categoryId: string): Promise<void> {
  const perplexityPrompt = `
    Analyze "Digital Marketing" category and identify 1,000 Q&A with this distribution:

    HIGH IMPACT (400 Q&A):
    - Questions with high purchase intent
    - Questions asked by decision-makers
    - Questions leading directly to revenue
    - Specific product/service comparisons
    - Enterprise/B2B focused questions

    MEDIUM IMPACT (400 Q&A):
    - Educational questions with indirect revenue
    - Strategy and best practices
    - Industry trends and insights
    - How-to guides for professionals

    LOW IMPACT (200 Q&A):
    - Generic definitional questions
    - Basic 101 content
    - Historical context
    - Broad awareness topics

    Provide visibility score (0-100) and revenue score (0-100) for each.
  `;

  const qaList = await perplexity.search(perplexityPrompt);

  // Calculate combined score
  for (const qa of qaList) {
    qa.combined_score = (qa.visibility_score * 0.6) + (qa.revenue_score * 0.4);
  }

  // Sort by combined score (highest first)
  qaList.sort((a, b) => b.combined_score - a.combined_score);

  // Store in database with impact tier
  await storeProRatedQA(categoryId, qaList);
}
```

---

## 🔑 KEYWORD TRACKING (CATEGORICAL FIRST)

### **Platform Tracks 1,000 Keywords Per Category**

**Example: "Digital Marketing" Category**

Perplexity discovers top 1,000 keywords:
1. "digital marketing agency" (score: 95)
2. "marketing automation software" (score: 92)
3. "content marketing tools" (score: 88)
...
1000. "basic marketing tips" (score: 20)

**All brands in category can access these keywords (based on tier)**

---

### **Brand-Specific Keyword Tracking = Variable Cost**

**Scenario**: Brand wants to track "geovera SEO tool"
- Not in top 1,000 categorical keywords
- Brand adds custom keyword
- **Cost**: $2/month variable (per keyword)

**If keyword becomes popular**:
- Month 3: "geovera SEO tool" enters top 1,000
- GeoVera adds to categorical pool
- Brand's variable cost DROPS (now in fixed pool)
- **Result**: Brand saved $2/month!

---

### **Database Schema**

```sql
-- Categorical keyword pool (shared across brands)
CREATE TABLE gv_category_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES gv_categories(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  competition_score DECIMAL(5,2),
  perplexity_rank INTEGER NOT NULL,
  combined_score DECIMAL(10,2) NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, keyword)
);

-- Brand-specific keyword tracking (variable cost)
CREATE TABLE gv_brand_custom_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  tracking_cost DECIMAL(10,2) DEFAULT 2.00,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  in_categorical_pool BOOLEAN DEFAULT FALSE,
  UNIQUE(brand_id, keyword)
);

-- When custom keyword enters categorical pool
CREATE OR REPLACE FUNCTION promote_keyword_to_categorical()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this keyword is in categorical pool now
  IF EXISTS (
    SELECT 1 FROM gv_category_keywords
    WHERE keyword = NEW.keyword
    AND category_id = (SELECT category_id FROM gv_brands WHERE id = NEW.brand_id)
  ) THEN
    -- Mark as in pool (no more variable cost)
    UPDATE gv_brand_custom_keywords
    SET in_categorical_pool = TRUE,
        tracking_cost = 0.00
    WHERE id = NEW.id;

    -- Notify brand
    INSERT INTO gv_notifications (brand_id, message, type)
    VALUES (
      NEW.brand_id,
      'Great news! Your custom keyword "' || NEW.keyword || '" is now in the categorical pool. You will no longer be charged variable cost for tracking it.',
      'cost_savings'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_keyword_promotion
AFTER INSERT OR UPDATE ON gv_brand_custom_keywords
FOR EACH ROW
EXECUTE FUNCTION promote_keyword_to_categorical();
```

---

## 💰 UPDATED COST STRUCTURE

### **1. Platform Fixed Cost (Shared Across ALL Brands)**

| Component | Scope | Cost/Month |
|-----------|-------|------------|
| SEO Monitoring | 1,000 keywords + 500 backlinks per category | $35 |
| GEO Monitoring | 1,000 Q&A (pro-rated) per category | $40 |
| SSO Monitoring | 500 creators + 1,000 sites per category | $35 |
| **Total per category** | **Full monitoring** | **$110** |

**Example with 4 categories**: $110 × 4 = **$440/month platform cost**

**If 200 brands share 4 categories**: $440 ÷ 200 = **$2.20/brand fixed cost**

---

### **2. Brand Allocation Cost (Based on Tier)**

| Tier | Access Level | Cost/Month |
|------|--------------|------------|
| Basic | Top 20% of pool | $2-5 |
| Premium | Top 50% of pool | $5-10 |
| Partner | Top 100% of pool | $10-20 |

**Note**: As more brands join, this cost DECREASES

---

### **3. Brand Variable Cost (Custom Actions)**

| Feature | Scope | Cost |
|---------|-------|------|
| Custom keyword tracking | Per keyword (not in pool) | $2/month |
| Custom competitor tracking | Per competitor (not in pool) | $5/month |
| Brand-specific Q&A generation | Per question | $0.01-0.50 |
| Content generation | Per article/post | $0.25-3.00 |
| Citation optimization | Per check | $0.10 |
| Backlink outreach | Per opportunity | $0.50 |

---

## 📊 COST COMPARISON

### **OLD MODEL (Per-Brand Monitoring)**

**Brand A** wants to track:
- 100 keywords
- 20 competitors
- 50 creators
- 100 Q&A

**Cost**: $86/month fixed (just for Brand A)

---

### **NEW MODEL (Categorical Shared Pool)**

**GeoVera** tracks for "Digital Marketing" category:
- 1,000 keywords (Brand A gets 200 based on tier)
- 100 competitors (Brand A gets 20 best matches)
- 500 creators (Brand A gets 100 best matches)
- 1,000 Q&A (Brand A gets all, pro-rated by impact)

**Cost for Brand A**:
- Fixed: $2.20/month (shared with 199 other brands)
- Variable: $0 (no custom tracking needed)
- **Total**: **$2.20/month** 💰

**Savings**: $86 - $2.20 = **$83.80/month (97.4% reduction!)**

---

## 🚀 NETWORK EFFECTS

### **As GeoVera Grows, Everyone Benefits**

**Month 1**: 50 brands
- Fixed cost per brand: $440 ÷ 50 = **$8.80/month**
- Data quality: Good (50 brands' insights)

**Month 6**: 200 brands
- Fixed cost per brand: $440 ÷ 200 = **$2.20/month**
- Data quality: **Excellent** (200 brands' insights)

**Month 12**: 500 brands
- Fixed cost per brand: $440 ÷ 500 = **$0.88/month**
- Data quality: **Outstanding** (500 brands' insights)

### **Benefits Increase Over Time**

1. **More brands** = more data points
2. **Better patterns** = smarter self-learning
3. **Larger pool** = better keyword/creator discovery
4. **Lower cost** = more accessible for small businesses

---

## 🎯 IMPLEMENTATION CHANGES

### **Database Architecture Changes**

**NEW TABLES**:
```sql
-- All data now at category level
CREATE TABLE gv_category_keywords (...);      -- 1,000 per category
CREATE TABLE gv_category_qa (...);            -- 1,000 per category (pro-rated)
CREATE TABLE gv_category_backlinks (...);     -- 500 per category
CREATE TABLE gv_category_competitors (...);   -- 100 per category
CREATE TABLE gv_category_creators (...);      -- 500 per category
CREATE TABLE gv_category_sites (...);         -- 1,000 per category

-- Brand access via allocation
CREATE TABLE gv_brand_keyword_allocation (...);
CREATE TABLE gv_brand_creator_allocation (...);
CREATE TABLE gv_brand_backlink_allocation (...);

-- Custom tracking = variable cost
CREATE TABLE gv_brand_custom_keywords (...);
CREATE TABLE gv_brand_custom_competitors (...);
```

---

### **Edge Functions Changes**

**OLD**: Per-brand monitoring
```typescript
async function checkBrandCitations(brandId: string) {
  // Check only this brand's topics
}
```

**NEW**: Categorical monitoring
```typescript
async function checkCategoryCitations(categoryId: string) {
  // Check all topics in category
  // ALL brands benefit from this single check
}
```

---

## ✅ FINAL ARCHITECTURE

```
GEOVERA PLATFORM
│
├── CATEGORICAL MONITORING ($440/month for 4 categories)
│   ├── SEO: 1,000 keywords × 4 = 4,000 keywords
│   ├── GEO: 1,000 Q&A × 4 = 4,000 Q&A (pro-rated by impact)
│   ├── SSO: 500 creators × 4 = 2,000 creators
│   └── Shared across ALL brands
│
├── BRAND ALLOCATION (Based on Tier)
│   ├── Basic: Top 20% access = $2.20/month
│   ├── Premium: Top 50% access = $5.50/month
│   ├── Partner: Top 100% access = $11.00/month
│   └── Cost DECREASES as platform grows
│
└── VARIABLE COST (Custom Tracking)
    ├── Custom keywords not in pool
    ├── Custom competitors not in pool
    ├── Brand-specific content generation
    └── Pay only for what you use
```

---

## 🎉 KEY BENEFITS

### **1. Cost Efficiency**
- 97.4% cost reduction vs per-brand monitoring
- Shared fixed cost across all brands
- Variable cost only for custom needs

### **2. Data Quality**
- Larger dataset = better insights
- More brands = more patterns
- Self-learning improves for everyone

### **3. Network Effects**
- Early adopters get growing benefits
- As platform scales, cost drops
- Everyone benefits from collective intelligence

### **4. Flexibility**
- Start with shared pool (low cost)
- Add custom tracking as needed (variable cost)
- Custom keywords may become free (if promoted to pool)

### **5. Transparency**
- Clear fixed vs variable costs
- Real-time cost tracking
- No surprises

---

## 📈 PRICING EXAMPLES

### **Startup (Basic Tier) - 1 Category**

**Fixed Cost**: $110 ÷ 200 brands = **$0.55/month**
**Allocation**: Top 20% access = **$2/month**
**Variable**: 5 custom keywords = **$10/month**
**Total**: **$12.55/month**

### **Growing Business (Premium Tier) - 2 Categories**

**Fixed Cost**: $220 ÷ 200 brands = **$1.10/month**
**Allocation**: Top 50% access = **$10/month**
**Variable**: 10 custom keywords + content gen = **$35/month**
**Total**: **$46.10/month**

### **Enterprise (Partner Tier) - 4 Categories**

**Fixed Cost**: $440 ÷ 200 brands = **$2.20/month**
**Allocation**: Top 100% access = **$20/month**
**Variable**: 20 custom keywords + heavy usage = **$100/month**
**Total**: **$122.20/month**

---

## 🔒 SYSTEM LOCKED

**Status**: ✅ **CATEGORICAL-FIRST ARCHITECTURE COMPLETE**

**Next**: Update all existing documents to reflect this new model

---

**END OF CATEGORICAL-FIRST ARCHITECTURE**
