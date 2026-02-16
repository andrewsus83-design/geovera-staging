# 🎯 Intelligent Pre-Crawl Indexing System

**Date**: February 15, 2026
**Strategy**: Perplexity Discovery → Gemini Indexing → Scored Database → Client Allocation
**Goal**: Build comprehensive index, present only highest-value items per plan

---

## 🧠 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 1: DISCOVERY (Monthly)                                    │
│ Perplexity discovers top 5000 sites + top 500 keywords          │
│ Cost: $0.50/brand/month                                         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 2: INDEXING (Monthly)                                     │
│ Gemini indexes Google SERP + trends for all 5000×500 combos     │
│ Cost: $2.50/brand/month                                         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 3: SCORING (Monthly)                                      │
│ Perplexity scores & ranks based on multi-factor analysis        │
│ Cost: $1.00/brand/month                                         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 4: CLIENT ALLOCATION (Real-time)                          │
│ Present top N items per plan tier from scored database          │
│ Basic: Top 50 KW, 50 BL, 1 comp                                │
│ Premium: Top 100 KW, 100 BL, 2 comp                            │
│ Partner: Top 150 KW, 200 BL, 5 comp                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 PHASE 1: Perplexity Discovery

### **Discover Top 5000 Sites + Top 500 Keywords**

```typescript
interface DiscoveryConfig {
  brand_id: string;
  discovery_scope: {
    target_sites: 5000;      // Top sites to discover
    target_keywords: 500;    // Top keywords to discover
  };
}

class PerplexityDiscoveryEngine {
  async runMonthlyDiscovery(brand: BrandProfile): Promise<DiscoveryResult> {
    console.log(`[Discovery] Starting for: ${brand.brand_name}`);

    const result: DiscoveryResult = {
      sites: [],
      keywords: [],
      discovery_date: new Date(),
      brand_id: brand.id
    };

    // Step 1: Discover top 5000 sites
    result.sites = await this.discoverSites(brand);

    // Step 2: Discover top 500 keywords
    result.keywords = await this.discoverKeywords(brand);

    // Step 3: Store in discovery index
    await this.storeDiscoveryIndex(result);

    console.log(`[Discovery] Complete: ${result.sites.length} sites, ${result.keywords.length} keywords`);
    return result;
  }

  private async discoverSites(brand: BrandProfile): Promise<DiscoveredSite[]> {
    const sitePrompt = `You are an SEO discovery expert. Find the top 5000 most relevant websites for: "${brand.brand_name}" in the ${brand.brand_category} industry.

**DISCOVERY STRATEGY**:

1. **Category Leaders (500 sites)**:
   - Top authority sites in ${brand.brand_category}
   - Industry publications, review sites
   - E-commerce platforms selling ${brand.brand_category}

2. **Google Index Analysis (2000 sites)**:
   - Sites currently ranking in Google top 50 for:
     * "${brand.brand_category}"
     * "best ${brand.brand_category} brands"
     * "${brand.brand_category} ${brand.brand_country}"
     * Product-related queries
   - Include: organic results, featured snippets, PAA sources

3. **Competitor Ecosystem (1000 sites)**:
   - Sites linking to competitors
   - Sites mentioning competitors
   - Sites comparing competitors
   - Industry directories listing competitors

4. **Backlink Sources (1000 sites)**:
   - High-authority sites accepting guest posts
   - Resource pages in ${brand.brand_category}
   - Industry associations and communities
   - Media outlets covering ${brand.brand_category}

5. **Social & Emerging (500 sites)**:
   - Influencer blogs and websites
   - Emerging content platforms
   - Niche communities
   - Podcast and video creator sites

**OUTPUT REQUIREMENTS**:
For EACH site provide:
- Domain (exact URL)
- Domain Authority (1-100 estimate)
- Site Type (competitor/media/directory/blog/ecommerce/influencer)
- Relevance Score (1-100 to ${brand.brand_category})
- Monthly Traffic Estimate
- Reason for inclusion (why relevant)
- Best content types (blog/review/comparison/guide)

Return JSON array of EXACTLY 5000 sites, deduplicated, sorted by (authority × relevance).

**CRITICAL**: Only return sites that are ACTIVE and have published content in the last 6 months.`;

    const response = await this.queryPerplexity(sitePrompt, { max_tokens: 16000 });
    const sites = this.parseSitesList(response);

    console.log(`[Discovery] Found ${sites.length} sites`);
    return sites.slice(0, 5000);
  }

  private async discoverKeywords(brand: BrandProfile): Promise<DiscoveredKeyword[]> {
    const keywordPrompt = `You are a keyword research expert. Find the top 500 most valuable keywords for: "${brand.brand_name}" (${brand.brand_category}).

**KEYWORD DISCOVERY STRATEGY**:

1. **Brand Keywords (50)**:
   - Brand name variations
   - Misspellings and typos
   - "[brand] + category" combinations
   - "[brand] + location" combinations

2. **Product Keywords (150)**:
   - Product names and categories
   - "best [product]" queries
   - "[product] for [use case]"
   - Commercial intent keywords

3. **Comparison Keywords (50)**:
   - "[brand] vs [competitor]"
   - "better than [competitor]"
   - "[category] comparison"
   - "alternative to [product]"

4. **Long-tail Keywords (150)**:
   - Question-based queries
   - "how to" queries
   - Problem-solving queries
   - Local queries with city names

5. **Trending Keywords (100)**:
   - Rising searches in ${brand.brand_category}
   - Seasonal trends (2026)
   - Emerging topics
   - Social media trending topics

**KEYWORD ANALYSIS**:
For EACH keyword provide:
- Keyword phrase (exact match)
- Search Volume (monthly estimate)
- Keyword Difficulty (1-100)
- Search Intent (informational/commercial/transactional/navigational)
- CPC Estimate (if available)
- Trend (rising/stable/declining)
- Opportunity Score (1-100: volume × intent / difficulty)

**GOOGLE TRENDS INTEGRATION**:
Include keywords trending UP in the last 90 days in ${brand.brand_country}.

Return JSON array of EXACTLY 500 keywords, sorted by Opportunity Score (highest first).`;

    const response = await this.queryPerplexity(keywordPrompt, { max_tokens: 16000 });
    const keywords = this.parseKeywordsList(response);

    console.log(`[Discovery] Found ${keywords.length} keywords`);
    return keywords.slice(0, 500);
  }

  private async queryPerplexity(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          {
            role: "system",
            content: "You are an expert SEO researcher. Provide comprehensive, data-driven discovery with real domains and metrics. Always return valid JSON arrays."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: options.max_tokens || 8000,
        return_citations: true,
        search_recency_filter: "month"
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}
```

**Discovery Cost:**
- Sites discovery: 1 query × $0.005 = $0.005
- Keywords discovery: 1 query × $0.005 = $0.005
- **Total: $0.01/brand/month** (way cheaper than expected!)

---

## 🗂️ PHASE 2: Gemini Indexing (Google SERP + Trends)

### **Index All 5000 Sites × 500 Keywords Combinations**

```typescript
class GeminiIndexingEngine {
  async runMonthlyIndexing(discovery: DiscoveryResult): Promise<IndexedData> {
    console.log(`[Indexing] Processing ${discovery.sites.length} sites × ${discovery.keywords.length} keywords`);

    const indexedData: IndexedData = {
      serp_positions: [],
      trending_data: [],
      indexed_at: new Date()
    };

    // Strategy: Smart sampling instead of full matrix
    // Full matrix: 5000 × 500 = 2.5M combinations (too expensive)
    // Smart sampling: Top 1000 sites × Top 200 keywords = 200K combinations (manageable)

    const topSites = discovery.sites.slice(0, 1000); // Top 1000 highest-scored sites
    const topKeywords = discovery.keywords.slice(0, 200); // Top 200 highest-opportunity keywords

    // Batch processing: 100 site-keyword pairs per Gemini call
    const batches = this.createBatches(topSites, topKeywords, 100);

    for (const batch of batches) {
      const batchResults = await this.indexBatch(batch);
      indexedData.serp_positions.push(...batchResults.serp);
      indexedData.trending_data.push(...batchResults.trends);

      // Rate limit: 1 batch per 2 seconds
      await this.sleep(2000);
    }

    console.log(`[Indexing] Indexed ${indexedData.serp_positions.length} SERP positions`);
    return indexedData;
  }

  private async indexBatch(batch: SiteKeywordPair[]): Promise<BatchIndexResult> {
    const prompt = `You are a Google SERP analyzer. For each site-keyword pair below, determine:

1. **Current Google Ranking** (if site ranks for keyword)
2. **SERP Features** (featured snippet, PAA, videos, etc.)
3. **Trend Status** (rising/stable/declining in last 30 days)

**SITE-KEYWORD PAIRS**:
${batch.map((pair, i) => `${i+1}. Site: ${pair.site.domain} | Keyword: "${pair.keyword.phrase}"`).join('\n')}

**ANALYSIS REQUIREMENTS**:

For each pair, provide:
- site_domain: string
- keyword: string
- current_position: number | null (1-100, null if not ranking)
- serp_features: string[] (featured_snippet, paa, videos, images, news, etc.)
- trend_direction: "rising" | "stable" | "declining"
- trend_score: number (1-100, how fast is trend moving)
- last_updated: "2026-02-15"

**DATA SOURCES**:
- Use real-time Google Search data
- Use Google Trends data for trend analysis
- Include only sites actually ranking in top 100

Return JSON array with analysis for all ${batch.length} pairs.

**IMPORTANT**: If a site doesn't rank for a keyword, set current_position to null but still analyze trend.`;

    const response = await this.callGemini(prompt);
    return this.parseIndexBatch(response);
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192
          }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  private createBatches(
    sites: DiscoveredSite[],
    keywords: DiscoveredKeyword[],
    batchSize: number
  ): SiteKeywordPair[][] {
    const pairs: SiteKeywordPair[] = [];

    // Smart pairing: Match high-authority sites with high-opportunity keywords
    for (const site of sites) {
      for (const keyword of keywords) {
        // Only pair if site type matches keyword intent
        if (this.isPairRelevant(site, keyword)) {
          pairs.push({ site, keyword });
        }
      }
    }

    // Split into batches
    const batches: SiteKeywordPair[][] = [];
    for (let i = 0; i < pairs.length; i += batchSize) {
      batches.push(pairs.slice(i, i + batchSize));
    }

    return batches;
  }

  private isPairRelevant(site: DiscoveredSite, keyword: DiscoveredKeyword): boolean {
    // Only index relevant site-keyword combinations
    // Example: Don't index "ecommerce" site for "how to" informational keyword

    const relevanceRules = {
      competitor: ["commercial", "transactional", "navigational"],
      media: ["informational", "commercial"],
      blog: ["informational"],
      ecommerce: ["commercial", "transactional"],
      directory: ["navigational", "commercial"]
    };

    const allowedIntents = relevanceRules[site.site_type] || [];
    return allowedIntents.includes(keyword.search_intent);
  }
}
```

**Indexing Cost Calculation:**

```
Top 1000 sites × Top 200 keywords = 200,000 pairs
After relevance filtering (50% relevant) = 100,000 pairs
Batches of 100 pairs each = 1,000 batches

Gemini cost: 1,000 batches × $0.001 = $1.00/brand/month
```

---

## 🏆 PHASE 3: Perplexity Scoring & Ranking

### **Score & Rank Indexed Data**

```typescript
class PerplexityScoringEngine {
  async scoreAndRank(indexedData: IndexedData, brand: BrandProfile): Promise<ScoredDatabase> {
    console.log(`[Scoring] Analyzing ${indexedData.serp_positions.length} indexed items`);

    const scoredDb: ScoredDatabase = {
      scored_keywords: [],
      scored_backlinks: [],
      scored_competitors: [],
      scored_at: new Date()
    };

    // Score keywords
    scoredDb.scored_keywords = await this.scoreKeywords(indexedData, brand);

    // Score backlink opportunities
    scoredDb.scored_backlinks = await this.scoreBacklinks(indexedData, brand);

    // Score competitors
    scoredDb.scored_competitors = await this.scoreCompetitors(indexedData, brand);

    // Store in database
    await this.storeScoredDatabase(brand.id, scoredDb);

    return scoredDb;
  }

  private async scoreKeywords(
    indexedData: IndexedData,
    brand: BrandProfile
  ): Promise<ScoredKeyword[]> {
    const prompt = `You are an SEO opportunity scorer. Analyze these keywords and score each based on multiple factors.

**BRAND CONTEXT**:
- Brand: ${brand.brand_name}
- Category: ${brand.brand_category}
- Current Authority: ${brand.domain_authority || 50}

**INDEXED KEYWORDS** (sample of top 100):
${indexedData.serp_positions.slice(0, 100).map(sp => `
  Keyword: "${sp.keyword}"
  Current Ranking: ${sp.current_position || 'Not ranking'}
  Trend: ${sp.trend_direction} (${sp.trend_score}/100)
  SERP Features: ${sp.serp_features.join(', ')}
`).join('\n')}

**SCORING METHODOLOGY**:

For EACH keyword, calculate:

1. **Ranking Opportunity Score** (1-100):
   - If not ranking: How easy to rank? (keyword difficulty, competition)
   - If ranking: How easy to improve? (current position, trend)
   - Factor in: authority gap, content quality potential

2. **Traffic Potential Score** (1-100):
   - Search volume × expected CTR at target position
   - Seasonal factors
   - Trend momentum (rising = higher score)

3. **Conversion Potential Score** (1-100):
   - Search intent alignment (transactional = 100, informational = 30)
   - User journey position
   - Competition level

4. **Quick Win Score** (1-100):
   - Low-hanging fruit (positions 11-20 = high quick win)
   - Low difficulty keywords not yet targeted
   - Rising trend keywords

5. **Overall Priority Score** (1-100):
   - Weighted average:
     * Ranking Opportunity: 30%
     * Traffic Potential: 25%
     * Conversion Potential: 25%
     * Quick Win: 20%

**OUTPUT JSON**:
Return scored keywords sorted by Overall Priority Score (highest first).

{
  "keyword": "...",
  "scores": {
    "ranking_opportunity": 85,
    "traffic_potential": 72,
    "conversion_potential": 90,
    "quick_win": 65,
    "overall_priority": 78
  },
  "recommendation": "Target within 30 days - high conversion, medium difficulty",
  "estimated_impact": {
    "monthly_traffic": 1200,
    "conversion_rate": 0.03,
    "estimated_revenue": "$2,160"
  }
}`;

    const response = await this.queryPerplexity(prompt);
    return this.parseScoredKeywords(response);
  }

  private async scoreBacklinks(
    indexedData: IndexedData,
    brand: BrandProfile
  ): Promise<ScoredBacklink[]> {
    const prompt = `You are a backlink opportunity scorer. Analyze these sites for backlink potential.

**BRAND CONTEXT**:
- Brand: ${brand.brand_name}
- Category: ${brand.brand_category}

**DISCOVERED SITES** (top 100 by authority):
${indexedData.serp_positions
  .map(sp => sp.site_domain)
  .filter((v, i, a) => a.indexOf(v) === i) // Unique domains
  .slice(0, 100)
  .map(domain => `- ${domain}`)
  .join('\n')}

**SCORING METHODOLOGY**:

For EACH site, calculate:

1. **Authority Score** (1-100):
   - Domain authority
   - Page authority
   - Trust signals

2. **Relevance Score** (1-100):
   - Content alignment with ${brand.brand_category}
   - Audience overlap
   - Topic match

3. **Acquisition Difficulty** (1-100):
   - Outreach success probability
   - Guest post acceptance rate estimate
   - Relationship building required

4. **Link Value Score** (1-100):
   - SEO value (dofollow, authority passing)
   - Referral traffic potential
   - Brand exposure value

5. **Overall Backlink Score** (1-100):
   - Weighted: Authority 30%, Relevance 30%, Value 25%, Difficulty 15%

**OUTPUT JSON**:
Return scored backlink opportunities sorted by Overall Backlink Score.

Include:
- Outreach strategy ("guest post", "resource page", "broken link", "partnership")
- Estimated effort (low/medium/high)
- Success probability (0-1)`;

    const response = await this.queryPerplexity(prompt);
    return this.parseScoredBacklinks(response);
  }

  private async scoreCompetitors(
    indexedData: IndexedData,
    brand: BrandProfile
  ): Promise<ScoredCompetitor[]> {
    // Extract competitors from indexed data (sites ranking for our keywords)
    const competitorDomains = this.extractCompetitors(indexedData);

    const prompt = `You are a competitive intelligence analyst. Score these competitors.

**OUR BRAND**:
- ${brand.brand_name} (${brand.brand_category})

**COMPETITORS DETECTED**:
${competitorDomains.slice(0, 20).map(c => `- ${c.domain} (appears in ${c.keyword_count} keyword SERPs)`).join('\n')}

**SCORING METHODOLOGY**:

For EACH competitor:

1. **Threat Level** (1-100):
   - Market overlap
   - Keyword competition intensity
   - Growth trajectory

2. **Market Share Estimate** (0-1):
   - Based on keyword visibility
   - Brand mentions
   - Traffic estimates

3. **Strategy Alignment** (1-100):
   - How similar is their strategy to ours?
   - Content approach
   - Target audience

4. **Opportunity Score** (1-100):
   - What can we learn/copy from them?
   - Gaps in their strategy we can exploit
   - Partnership potential

5. **Priority Score** (1-100):
   - Which competitors to monitor closely?
   - Weighted: Threat 40%, Market Share 30%, Opportunity 30%

**OUTPUT JSON**:
Return scored competitors sorted by Priority Score.`;

    const response = await this.queryPerplexity(prompt);
    return this.parseScoredCompetitors(response);
  }
}
```

**Scoring Cost:**
- Keywords scoring: 1 query × $0.005 = $0.005
- Backlinks scoring: 1 query × $0.005 = $0.005
- Competitors scoring: 1 query × $0.005 = $0.005
- **Total: $0.015/brand/month**

---

## 🎁 PHASE 4: Client Allocation (Per Plan)

### **Present Top N Items Based on Subscription Tier**

```typescript
class ClientAllocationEngine {
  async allocateForClient(brandId: string, tier: string): Promise<ClientAllocation> {
    // Get tier limits
    const limits = this.getTierLimits(tier);

    // Fetch scored database
    const scoredDb = await this.fetchScoredDatabase(brandId);

    // Allocate top items per tier
    const allocation: ClientAllocation = {
      keywords: scoredDb.scored_keywords
        .sort((a, b) => b.scores.overall_priority - a.scores.overall_priority)
        .slice(0, limits.keywords),

      backlinks: scoredDb.scored_backlinks
        .sort((a, b) => b.overall_score - a.overall_score)
        .slice(0, limits.backlinks),

      competitors: scoredDb.scored_competitors
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, limits.competitors),

      tier,
      allocated_at: new Date()
    };

    return allocation;
  }

  private getTierLimits(tier: string): TierLimits {
    const limits = {
      basic: { keywords: 50, backlinks: 50, competitors: 1 },
      premium: { keywords: 100, backlinks: 100, competitors: 2 },
      partner: { keywords: 150, backlinks: 200, competitors: 5 }
    };

    return limits[tier] || limits.basic;
  }
}
```

**Database Schema:**

```sql
-- Discovery Index (refreshed monthly)
CREATE TABLE gv_discovery_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES gv_brands(id),
  discovery_type TEXT, -- 'site' or 'keyword'

  -- For sites
  domain TEXT,
  domain_authority INTEGER,
  site_type TEXT,
  relevance_score INTEGER,

  -- For keywords
  keyword TEXT,
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  search_intent TEXT,
  opportunity_score INTEGER,

  -- Metadata
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  discovery_batch TEXT -- '2026-02-sites' or '2026-02-keywords'
);

-- SERP Index (from Gemini indexing)
CREATE TABLE gv_serp_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES gv_brands(id),
  site_domain TEXT,
  keyword TEXT,
  current_position INTEGER, -- null if not ranking
  serp_features TEXT[], -- ['featured_snippet', 'paa', 'videos']
  trend_direction TEXT, -- 'rising', 'stable', 'declining'
  trend_score INTEGER, -- 1-100
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scored Database (from Perplexity scoring)
CREATE TABLE gv_scored_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES gv_brands(id),
  keyword TEXT,

  -- Scores
  ranking_opportunity INTEGER, -- 1-100
  traffic_potential INTEGER,
  conversion_potential INTEGER,
  quick_win_score INTEGER,
  overall_priority INTEGER,

  -- Estimates
  estimated_monthly_traffic INTEGER,
  estimated_conversion_rate DECIMAL(5, 4),
  estimated_revenue_usd DECIMAL(10, 2),

  recommendation TEXT,
  scored_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gv_scored_backlinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES gv_brands(id),
  site_domain TEXT,

  -- Scores
  authority_score INTEGER,
  relevance_score INTEGER,
  acquisition_difficulty INTEGER,
  link_value_score INTEGER,
  overall_score INTEGER,

  -- Strategy
  outreach_strategy TEXT, -- 'guest_post', 'resource_page', etc.
  estimated_effort TEXT, -- 'low', 'medium', 'high'
  success_probability DECIMAL(3, 2), -- 0-1

  scored_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gv_scored_competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES gv_brands(id),
  competitor_domain TEXT,
  competitor_name TEXT,

  -- Scores
  threat_level INTEGER, -- 1-100
  market_share_estimate DECIMAL(3, 2), -- 0-1
  strategy_alignment INTEGER,
  opportunity_score INTEGER,
  priority_score INTEGER,

  keyword_overlap_count INTEGER,
  scored_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scored_keywords_priority ON gv_scored_keywords(brand_id, overall_priority DESC);
CREATE INDEX idx_scored_backlinks_score ON gv_scored_backlinks(brand_id, overall_score DESC);
CREATE INDEX idx_scored_competitors_priority ON gv_scored_competitors(brand_id, priority_score DESC);
```

---

## 💰 Complete Cost Analysis

### **Monthly Pre-Crawl Costs per Brand:**

| Phase | Task | API | Cost |
|-------|------|-----|------|
| **Phase 1** | Discover 5000 sites | Perplexity | $0.005 |
| **Phase 1** | Discover 500 keywords | Perplexity | $0.005 |
| **Phase 2** | Index 100K site-keyword pairs | Gemini | $1.00 |
| **Phase 3** | Score keywords | Perplexity | $0.005 |
| **Phase 3** | Score backlinks | Perplexity | $0.005 |
| **Phase 3** | Score competitors | Perplexity | $0.005 |
| **Phase 4** | Client allocation | Database | $0.00 |
| **TOTAL** | | | **$1.025** |

**Amortized Monthly Cost:** ~$1.00/brand

---

### **Total System Cost (Complete):**

| Tier | 500QA | Daily Research | Pre-Crawl Index | Dual AI Crawl | **TOTAL** |
|------|-------|---------------|----------------|--------------|-----------|
| **Basic** | $0.35 | $3.00 | $1.00 | $0.60 | **$4.95** |
| **Premium** | $0.35 | $4.50 | $1.00 | $1.20 | **$7.05** |
| **Partner** | $0.35 | $7.50 | $1.00 | $2.00 | **$10.85** |

---

## 🎯 Client Dashboard View

### **What Client Sees (Premium Tier Example):**

```
┌──────────────────────────────────────────────────────────────┐
│ SEO INTELLIGENCE DASHBOARD                                   │
├──────────────────────────────────────────────────────────────┤
│ Plan: Premium (100 keywords, 100 backlinks, 2 competitors)  │
│ Data Freshness: Updated 2 days ago                          │
│ Next Update: Feb 28, 2026                                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ TOP 100 KEYWORDS (Highest Priority)                         │
├──────────────────────────────────────────────────────────────┤
│ 1. "organic skincare Jakarta"                               │
│    Priority: 95/100 | Traffic: 2,400/mo | Difficulty: 45    │
│    💡 Quick Win: Rank #11 → Target top 5                     │
│    📈 Trend: Rising +28% this month                          │
│    💰 Est. Revenue: $3,600/mo at position #3                │
│                                                              │
│ 2. "natural beauty products Indonesia"                      │
│    Priority: 92/100 | Traffic: 1,800/mo | Difficulty: 52    │
│    💡 Content Gap: Create comprehensive guide                │
│    📈 Trend: Stable                                          │
│    💰 Est. Revenue: $2,160/mo                                │
│                                                              │
│ ... (98 more keywords)                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ TOP 100 BACKLINK OPPORTUNITIES                              │
├──────────────────────────────────────────────────────────────┤
│ 1. beautyinsider.id (DR 78)                                 │
│    Score: 94/100 | Strategy: Guest Post                     │
│    💡 Topic: "Sustainable Packaging in Indonesian Beauty"   │
│    🎯 Success Probability: 75%                               │
│    ⏱️ Estimated Effort: Medium (2-3 weeks)                   │
│                                                              │
│ 2. lifestyle-magazine.com (DR 65)                           │
│    Score: 89/100 | Strategy: Product Review                 │
│    💡 They review organic brands monthly                     │
│    🎯 Success Probability: 82%                               │
│    ⏱️ Estimated Effort: Low (send sample)                    │
│                                                              │
│ ... (98 more opportunities)                                  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ TOP 2 COMPETITORS TO MONITOR                                │
├──────────────────────────────────────────────────────────────┤
│ 1. Competitor A (somethinc.com)                             │
│    Threat Level: 87/100 (High) ⚠️                           │
│    Market Share: ~18% (keyword visibility)                   │
│    📊 Appears in 45 of your target keyword SERPs             │
│    💡 Opportunity: They lack content on "sustainable..."     │
│                                                              │
│ 2. Competitor B (wardah.co.id)                              │
│    Threat Level: 75/100 (Medium-High)                       │
│    Market Share: ~22% (market leader)                        │
│    📊 Appears in 52 of your target keyword SERPs             │
│    💡 Opportunity: Partner on eco-friendly initiatives       │
└──────────────────────────────────────────────────────────────┘
```

**Key Benefits for Client:**
- ✅ Only see highest-value items (no overwhelm)
- ✅ Actionable insights (not just raw data)
- ✅ Probability scores (realistic expectations)
- ✅ Estimated impact (revenue projections)
- ✅ Clear next steps (what to do)

---

## 🚀 Implementation Workflow

### **Monthly Cycle:**

```
Day 1 (1st of month):
├─ Run Perplexity Discovery
│  └─ Find top 5000 sites + 500 keywords
│  └─ Cost: $0.01
│
├─ Run Gemini Indexing
│  └─ Index 100K site-keyword pairs
│  └─ Cost: $1.00
│  └─ Duration: ~6 hours (batched)
│
└─ Run Perplexity Scoring
   └─ Score all keywords, backlinks, competitors
   └─ Cost: $0.015
   └─ Duration: ~30 minutes

Day 2-30:
├─ Client sees allocated top N items
├─ Daily enriched crawls continue (on allocated items only)
└─ Real-time updates to scores based on crawl data
```

---

## ✅ Final System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ MONTHLY (1st of month)                                          │
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│ │ Perplexity   │ → │ Gemini       │ → │ Perplexity   │         │
│ │ Discovery    │   │ Indexing     │   │ Scoring      │         │
│ │ 5K sites     │   │ Google SERP  │   │ Rank & Score │         │
│ │ 500 keywords │   │ + Trends     │   │ Multi-factor │         │
│ └──────────────┘   └──────────────┘   └──────────────┘         │
│       $0.01              $1.00              $0.015              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ SCORED DATABASE (stored monthly)                               │
│ ✅ 500 keywords scored & ranked                                │
│ ✅ 5000 backlink opportunities scored                           │
│ ✅ Top 20 competitors scored                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT ALLOCATION (real-time)                                  │
│ Basic: Top 50 KW, 50 BL, 1 Comp                                │
│ Premium: Top 100 KW, 100 BL, 2 Comp                            │
│ Partner: Top 150 KW, 200 BL, 5 Comp                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ DAILY (ongoing)                                                 │
│ ┌──────────────┐   ┌──────────────┐                            │
│ │ Gemini       │ → │ Claude       │                            │
│ │ Fast Extract │   │ Deep Intel   │                            │
│ │ On allocated │   │ On allocated │                            │
│ │ items only   │   │ items only   │                            │
│ └──────────────┘   └──────────────┘                            │
│    $0.001/page        $0.005/page                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎉 Summary

### **APPROVED: Intelligent Pre-Crawl Indexing**

**Strategy:**
1. ✅ **Perplexity Discovery**: Find top 5000 sites + 500 keywords ($0.01)
2. ✅ **Gemini Indexing**: Index Google SERP + trends ($1.00)
3. ✅ **Perplexity Scoring**: Multi-factor scoring & ranking ($0.015)
4. ✅ **Client Allocation**: Present top N per tier (free)
5. ✅ **Daily Enrichment**: Gemini + Claude on allocated items only

**Benefits:**
- 🎯 **Clients see only highest-value items** (no overwhelm)
- 💰 **Cost-efficient**: Index once, allocate many times
- 📊 **Data-driven allocation**: Scored by multiple factors
- 🔄 **Always fresh**: Monthly refresh cycle
- ⚡ **Fast dashboard**: Pre-scored data = instant load

**Total Monthly Cost:**
- Basic: $4.95
- Premium: $7.05
- Partner: $10.85

**ROI**: Exponential (comprehensive intelligence at scale)

---

**Status**: ✅ **ARCHITECTURE COMPLETE**
**Next**: Build pre-crawl indexing pipeline
**Impact**: Game-changing intelligent allocation system! 🧠🚀

