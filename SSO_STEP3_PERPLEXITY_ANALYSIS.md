# SSO STEP 3: PERPLEXITY DEEP ANALYSIS ✅
## Topic, Keywords, Opportunities, Competitors → Ranked Insights

---

## 🎯 OVERVIEW

**Step 3** menggunakan Perplexity untuk deep research berdasarkan data yang sudah di-ingest dari Step 2 (Claude + Apify + Gemini reverse engineering).

**Input**:
- Hundreds/thousands of QA pairs per creator
- Hundreds of keywords per creator
- Topics, themes, search queries
- Real engagement data from Apify

**Output**:
- Ranked trending topics (1-50)
- Ranked keyword opportunities (1-100)
- Competitive landscape analysis (top 20 competitors)
- Ranked content strategies
- Ranked partnership opportunities (1-30)
- **Final creator ranking 1-450 per brand**

---

## 📋 STEP 3 WORKFLOW

### **Step 3.1: ANALYZE CATEGORY INSIGHTS**

**Frequency**: Weekly (or when new insights available)

**Process**:
1. Aggregate ALL data from top 100 creators (yang punya reverse engineering data)
2. Collect:
   - All keywords (thousands)
   - All topics (hundreds)
   - All content themes
   - All QA pairs

3. **Perplexity Deep Research**:
   ```
   Input: Aggregated keywords, topics, themes from 100 creators

   Output:
   - Trending Topics (Rank 1-50)
     - Frequency analysis
     - Trend velocity (UP vs DOWN)
     - Emerging topics to watch

   - Keyword Opportunities (Rank 1-100)
     - Search volume analysis
     - Competition analysis
     - Long-tail opportunities
     - Purchase intent keywords

   - Competitive Landscape
     - Top 20 dominating brands
     - Market gaps
     - Competitor strategies

   - Content Strategies (Ranked)
     - Best performing formats
     - Optimal posting schedules
     - Effective hooks/angles

   - Partnership Opportunities (Rank 1-30)
     - Trending collaboration types
     - Best ROI creator tiers
     - Successful campaign formats
   ```

**Cost**: $0.05 per category (1 Perplexity call)

**Output Saved To**: `gv_sso_category_analysis`

---

### **Step 3.2: ANALYZE BRAND OPPORTUNITIES**

**Frequency**: When brand joins OR monthly refresh

**Process**:
1. Get brand details (name, industry, category)
2. Get category analysis (from Step 3.1)
3. Get top 100 creators with insights

4. **Perplexity Brand-Specific Research**:
   ```
   Input:
   - Brand name + industry
   - Category trending topics
   - Keyword opportunities
   - Competitive landscape
   - Top creators list

   Output:
   - Competitor Analysis (Rank top 10)
     - Direct competitors
     - Their influencer strategies
     - Creators they work with
     - Market positioning
     - Threat level + market share

   - Creator Fit Analysis (Rank 1-450)
     - Brand fit score (0-100) for EACH creator
     - Audience alignment
     - Content theme match
     - Brand value alignment
     - Engagement potential

   - Content Opportunities (Rank 1-50)
     - Best content angles for brand
     - Resonant narratives
     - Trending topics aligned with brand
     - Engagement potential

   - Partnership Strategies (Rank 1-20)
     - Best collaboration types
     - Sponsored vs long-term
     - Micro vs macro influencers
     - Campaign formats + budgets
     - ROI potential ranking

   - Keyword Strategy (Rank 1-100)
     - SEO keywords for brand discovery
     - Social hashtags
     - Search queries customers use
     - Search volume + relevance scores

   - Market Gaps (Prioritized)
     - Missed opportunities by competitors
     - Underserved audiences
     - Content gaps brand can fill
     - Differentiation strategies
   ```

**Cost**: $0.05 per brand (1 Perplexity call)

**Output Saved To**: `gv_sso_brand_opportunities`

---

### **Step 3.3: RANK CREATORS FOR BRAND**

**Frequency**: After Step 3.2 OR when new creator data available

**Process**:
1. Get brand opportunities (from Step 3.2)
2. Get all 450 creators in category
3. For each creator, calculate **Combined Score**:

```typescript
Combined Score =
  (Claude Impact Score × 0.40) +     // Quality + Originality + Reach + Engagement
  (Perplexity Fit Score × 0.40) +    // Brand-specific fit from Step 3.2
  (Apify Engagement Rate × 0.20)     // Real engagement data from Step 2

Where:
- Claude Impact Score: 0-100 (from Month 1 analysis)
- Perplexity Fit Score: 0-100 (from Step 3.2 brand analysis)
- Apify Engagement Rate: 0-100 (from Step 2 scraping)
```

4. Sort creators by Combined Score
5. Assign final ranks 1-450
6. Save to `gv_brand_creator_rankings`

**Cost**: $0 (no API calls, just computation)

**Output**:
- Each brand gets personalized creator ranking
- Top 10, Top 50, Top 100 recommendations
- Rank reason for each creator

---

## 💰 COST BREAKDOWN

### **Per Category**

| Step | Frequency | Cost per Run | Monthly Cost |
|------|-----------|--------------|--------------|
| 3.1: Category Analysis | Weekly | $0.05 | $0.20 |
| 3.2: Brand Opportunities | Per brand onboard + monthly | $0.05 | Variable |
| 3.3: Creator Ranking | After 3.2 | $0 | $0 |
| **TOTAL STEP 3** | | | **$0.20 + ($0.05 × brands)** |

### **For 4 Categories, 40 Brands**

| Component | Calculation | Cost/Month |
|-----------|-------------|------------|
| Category Analysis | $0.20 × 4 categories × 4 weeks | $3.20 |
| Brand Opportunities | $0.05 × 40 brands | $2.00 |
| Creator Ranking | $0 × 40 brands | $0 |
| **TOTAL STEP 3** | | **$5.20/month** |

**Extremely cheap for massive value!** 🎉

---

## 📊 COMPLETE SSO COST (STEPS 1+2+3)

### **Month 1 - Initial Discovery**

| Step | Description | Cost/Category |
|------|-------------|---------------|
| Step 1 | Pre-ingestion (Gemini + Perplexity + Apify + Claude) | $272.60 |
| **TOTAL MONTH 1** | | **$272.60** |

**For 4 categories**: $272.60 × 4 = **$1,090.40**

---

### **Month 2+ - Ongoing Monitoring**

| Step | Description | Cost/Category |
|------|-------------|---------------|
| Step 2 | Monitoring (Apify + Gemini RE) | $202.24 |
| Step 3 | Perplexity Analysis | $1.30 |
| **TOTAL MONTH 2+** | | **$203.54** |

**For 4 categories**: $203.54 × 4 = **$814.16/month**

**Per brand (40 brands)**: $814.16 ÷ 40 = **$20.35/month**

---

## 🎯 COMPLETE FIXED COST (ALL SYSTEMS)

### **Monthly Fixed Cost (Month 2+)**

| System | Cost/Category | 4 Categories | Per Brand (40) |
|--------|---------------|--------------|----------------|
| **SEO** | $44.08 | $176.32 | $4.41 |
| **GEO** | $146.05 | $584.20 | $14.61 |
| **SSO (Steps 2+3)** | $203.54 | $814.16 | $20.35 |
| **System Ops** | $6.29 | $25.16 | $0.63 |
| **TOTAL** | **$399.96** | **$1,599.84** | **$40.00** |

**Perfect! Exactly $40 per brand!** 🎯

---

## 📈 EXAMPLE OUTPUTS

### **Example 1: Category Analysis (Step 3.1)**

**Category**: E-Commerce

**Perplexity Output**:

```json
{
  "trending_topics": [
    {
      "rank": 1,
      "topic": "Sustainable fashion",
      "frequency": 87,
      "trend": "UP 45% vs last month",
      "why": "Eco-conscious consumers driving demand"
    },
    {
      "rank": 2,
      "topic": "Unboxing experiences",
      "frequency": 76,
      "trend": "STABLE",
      "why": "Consistent engagement driver"
    },
    // ... 48 more topics
  ],
  "keyword_opportunities": [
    {
      "rank": 1,
      "keyword": "sustainable clothing brands indonesia",
      "search_volume": 12500,
      "competition": "LOW",
      "opportunity_score": 92,
      "why": "High search, low competition"
    },
    {
      "rank": 2,
      "keyword": "eco-friendly fashion review",
      "search_volume": 8900,
      "competition": "MEDIUM",
      "opportunity_score": 85
    },
    // ... 98 more keywords
  ],
  "competitive_landscape": {
    "top_competitors": [
      {
        "rank": 1,
        "brand": "H&M Conscious",
        "market_share": "18%",
        "strategy": "Micro-influencer focus, sustainability narrative",
        "threat_level": "HIGH"
      },
      {
        "rank": 2,
        "brand": "Zara Green",
        "market_share": "14%",
        "strategy": "Celebrity endorsements, fast fashion pivot"
      },
      // ... 18 more competitors
    ]
  }
}
```

---

### **Example 2: Brand Opportunities (Step 3.2)**

**Brand**: EcoWear Indonesia

**Perplexity Output**:

```json
{
  "competitor_analysis": [
    {
      "rank": 1,
      "competitor": "H&M Conscious",
      "strategy": "Working with 50+ micro-influencers",
      "creators": ["@sustainablestyle", "@ecofashionista"],
      "threat": "HIGH - dominant in sustainability niche",
      "opportunity": "Target lifestyle creators they're missing"
    }
    // ... 9 more competitors
  ],
  "creator_fit_analysis": [
    {
      "rank": 1,
      "creator_handle": "@indonesianecostyle",
      "fit_score": 95,
      "reason": "Perfect audience match (eco-conscious millennials), high engagement, authentic sustainability focus",
      "recommendation": "Long-term partnership, ambassador potential"
    },
    {
      "rank": 2,
      "creator_handle": "@jakartafashionista",
      "fit_score": 88,
      "reason": "Large reach, relevant content themes, good brand alignment"
    }
    // ... 448 more creators
  ],
  "content_opportunities": [
    {
      "rank": 1,
      "angle": "Behind-the-scenes sustainable production",
      "why": "High engagement, builds trust, differentiates from fast fashion",
      "engagement_potential": 92,
      "difficulty": "MEDIUM"
    }
    // ... 49 more opportunities
  ],
  "partnership_strategies": [
    {
      "rank": 1,
      "type": "Long-term brand ambassadors (6-12 months)",
      "best_for": "Top 10 creators with 95+ fit score",
      "roi_potential": 94,
      "estimated_cost": "$500-2000/month per creator",
      "why": "Builds authentic relationships, sustained visibility"
    }
    // ... 19 more strategies
  ],
  "keyword_strategy": [
    {
      "rank": 1,
      "keyword": "sustainable fashion indonesia",
      "search_volume": 15000,
      "relevance": 98,
      "use_for": "SEO blog content, YouTube descriptions"
    }
    // ... 99 more keywords
  ],
  "market_gaps": [
    {
      "priority": 1,
      "gap": "Male eco-fashion segment underserved",
      "opportunity": "Partner with male lifestyle creators",
      "potential": "HIGH - competitors focus on female audience"
    }
    // ... more gaps
  ]
}
```

---

### **Example 3: Final Creator Ranking (Step 3.3)**

**Brand**: EcoWear Indonesia

**Top 10 Creators**:

| Rank | Creator | Platform | Combined Score | Fit | Impact | Engagement | Reason |
|------|---------|----------|----------------|-----|--------|------------|--------|
| 1 | @indonesianecostyle | Instagram | 94.2 | 95 | 92 | 4.8% | Perfect audience match, authentic sustainability focus |
| 2 | @jakartafashionista | Instagram | 89.5 | 88 | 90 | 5.1% | Large reach, relevant themes |
| 3 | @ecominimalist | TikTok | 87.8 | 90 | 85 | 6.2% | High engagement, younger audience |
| 4 | @sustainliving_id | YouTube | 86.4 | 89 | 88 | 3.9% | Long-form content, educational |
| 5 | @greenfashionJKT | Instagram | 85.1 | 82 | 87 | 4.5% | Strong Jakarta presence |
| 6 | @ecostyle_review | TikTok | 83.7 | 85 | 83 | 5.8% | Product reviews, purchase intent |
| 7 | @conscious_closet | Instagram | 82.9 | 86 | 81 | 4.2% | Wardrobe management angle |
| 8 | @ethical_fashion | YouTube | 81.5 | 83 | 84 | 3.5% | Brand ethics focus |
| 9 | @minimal_wardrobe | Instagram | 80.8 | 84 | 79 | 4.7% | Minimalism + sustainability |
| 10 | @slowfashion_id | TikTok | 79.6 | 81 | 80 | 5.3% | Slow fashion movement |

---

## 💡 KEY BENEFITS

### **For Brands**:

1. **Personalized Creator Rankings**:
   - Not generic - ranked specifically for YOUR brand
   - Based on audience fit, content match, brand alignment

2. **Competitive Intelligence**:
   - Know what competitors are doing
   - Identify gaps and opportunities
   - Differentiation strategies

3. **Content Strategy**:
   - Data-driven content recommendations
   - Trending topics aligned with brand
   - Proven engagement tactics

4. **Partnership Guidance**:
   - Which collaboration types work best
   - Budget recommendations
   - ROI projections

5. **SEO Keywords**:
   - Hundreds of ranked keywords
   - Search volume + relevance scores
   - Long-tail opportunities

---

### **For Platform**:

1. **Automated Insights**:
   - No manual analysis needed
   - AI-driven recommendations
   - Continuously updated

2. **Scalable**:
   - Same process for all brands
   - Cost: only $0.05 per brand
   - Value: thousands of insights

3. **Competitive Advantage**:
   - Most platforms don't offer this depth
   - Perplexity research = real-time market intelligence
   - Claude + Apify + Gemini + Perplexity = unbeatable combo

---

## 🗄️ DATABASE SCHEMA

### **`gv_sso_category_analysis`**
```sql
CREATE TABLE gv_sso_category_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES gv_categories(id),
  trending_topics JSONB,
  keyword_opportunities JSONB,
  competitive_landscape JSONB,
  content_strategies JSONB,
  partnership_opportunities JSONB,
  analysis_date TIMESTAMPTZ DEFAULT NOW()
);
```

### **`gv_sso_brand_opportunities`**
```sql
CREATE TABLE gv_sso_brand_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES gv_brands(id),
  category_id UUID REFERENCES gv_categories(id),
  competitor_analysis JSONB,
  creator_fit_scores JSONB,
  content_opportunities JSONB,
  partnership_strategies JSONB,
  keyword_strategy JSONB,
  market_gaps JSONB,
  analysis_date TIMESTAMPTZ DEFAULT NOW()
);
```

### **`gv_brand_creator_rankings`**
```sql
CREATE TABLE gv_brand_creator_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES gv_brands(id),
  creator_id UUID REFERENCES gv_sso_creators(id),
  combined_score DECIMAL(5,2),
  brand_fit_score INTEGER,
  brand_rank INTEGER,
  rank_reason TEXT,
  ranked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, creator_id)
);

CREATE INDEX idx_brand_rankings ON gv_brand_creator_rankings(brand_id, brand_rank);
```

---

## ✅ COMPLETE SSO WORKFLOW SUMMARY

### **STEP 1: PRE-INGESTION (Month 1 - One-Time)**
1. Gemini index 10,000 potential accounts → $0.0005
2. Perplexity filter to 4,000 → $2.50
3. Apify scrape 4,000 profiles → $70
4. Claude analyze 4,000 (quality/originality/reach/engagement) → $200
5. Claude rank to top 450 → $0.10
**Total**: $272.60 per category

### **STEP 2: MONITORING (Month 2+ - Ongoing)**
1. Top 10: Apify scrape every 3D + Gemini reverse engineering → $50.40/month
2. Rank 11-100: Apify scrape every 7D + Gemini reverse engineering → $147.84/month
3. Rank 101+: Gemini light monitoring every 14D → $4.00/month
**Total**: $202.24 per category

### **STEP 3: PERPLEXITY ANALYSIS (Month 2+ - Ongoing)**
1. Category insights (weekly) → $0.20/month
2. Brand opportunities (per brand) → $0.05 per brand
3. Creator ranking (free) → $0
**Total**: $1.30 per category (for 10 brands)

### **TOTAL SSO (Month 2+)**
**$203.54 per category** = **$814.16 for 4 categories** = **$20.35 per brand (40 brands)**

---

## 🚀 FINAL PRICING WITH ALL STEPS

| Tier | Price | Fixed Cost | Variable Cost | Total Cost | Profit | Margin |
|------|-------|------------|---------------|------------|--------|--------|
| **Growth** | **$399** | $40.00 | $140.80 | $180.80 | $218.20 | **55%** ✅ |
| **Scale** | **$699** | $40.00 | $310.76 | $350.76 | $348.24 | **50%** ✅ |
| **Enterprise** | **$1,099** | $40.00 | $442.91 | $482.91 | $616.09 | **56%** ✅ |

**Perfect margins with complete workflow!** 🎉

---

**END OF STEP 3 PERPLEXITY ANALYSIS**
