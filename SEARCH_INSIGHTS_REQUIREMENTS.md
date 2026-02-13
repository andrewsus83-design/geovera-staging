# GeoVera Search Intelligence & Insights - Technical Requirements

## Overview
Kombinasi dari **Search Discovery** (SerpAPI, Apify, AI platforms) dan **Daily Insights & Todo** untuk tracking competitive position dan actionable recommendations.

---

## FITUR 2: LLM SEO, GEO & Social Search

### Core Concept
**Multi-platform search monitoring untuk brand visibility & discovery**

### Data Sources:
1. **SerpAPI** → Google Search (SEO) + Google Maps (GEO)
2. **Apify** → Social media scraping (Instagram, TikTok, YouTube)
3. **AI Platforms** → Perplexity, ChatGPT search results

### Subscription Tier Limits:

| Tier | Keywords | Action Plans | Insights/Day |
|------|----------|--------------|--------------|
| Basic | 5 | 5 | 5 |
| Premium | 8 | 8 | 8 |
| Partner | 15 | 15 | 12 |

---

## FITUR 3: Daily Insights & Todo

### Integration with Search Data
Daily insights berdasarkan hasil search monitoring + competitive analysis

### Output Structure (4 Columns):

| Column | Description | Data Source |
|--------|-------------|-------------|
| **NOW** | Current brand position/visibility | SerpAPI + Apify real-time |
| **Progress** | Trend (↗️ up / ↘️ down / → stable) | Historical comparison (7/30 days) |
| **Potential** | Opportunities to improve | AI analysis gaps |
| **Competitors** | Who ranks for this keyword | SerpAPI competitive data |

### Daily Deliverables:
1. **Progress Report** - Brand visibility changes
2. **Competitor Analysis** - New strategies detected
3. **Insights/Todo** - Actionable recommendations
4. **AI Articles** - Field situation vs competitors analysis
5. **GEO Score Update** - Google Maps ranking changes

---

## 1. DATABASE SCHEMA

```sql
-- Keywords Tracking (per brand, tier-limited)
CREATE TABLE gv_tracked_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Keyword details
  keyword TEXT NOT NULL,
  keyword_type TEXT CHECK (keyword_type IN ('seo', 'geo', 'social', 'ai_platform')),

  -- Search intent
  search_intent TEXT CHECK (search_intent IN ('informational', 'commercial', 'transactional', 'navigational')),

  -- Tracking status
  active BOOLEAN DEFAULT TRUE,
  tracking_frequency TEXT DEFAULT 'daily' CHECK (tracking_frequency IN ('hourly', 'daily', 'weekly')),

  -- Metadata
  added_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ,

  UNIQUE(brand_id, keyword, keyword_type)
);

CREATE INDEX idx_tracked_keywords_brand ON gv_tracked_keywords(brand_id);
CREATE INDEX idx_tracked_keywords_active ON gv_tracked_keywords(active) WHERE active = TRUE;


-- Search Results History (SerpAPI, Apify, AI platforms)
CREATE TABLE gv_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES gv_tracked_keywords(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Search metadata
  platform TEXT NOT NULL CHECK (platform IN ('google_search', 'google_maps', 'instagram', 'tiktok', 'youtube', 'perplexity', 'chatgpt')),
  search_query TEXT NOT NULL,
  location TEXT, -- For GEO searches

  -- Brand ranking
  brand_position INTEGER, -- NULL if not found
  brand_url TEXT,
  brand_snippet TEXT,

  -- Competitor data
  competitors JSONB, -- [{name, position, url, snippet}]
  total_results INTEGER,

  -- Raw API response
  raw_data JSONB,
  api_credits_used INTEGER DEFAULT 1,

  -- Timestamps
  searched_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_keyword FOREIGN KEY (keyword_id) REFERENCES gv_tracked_keywords(id),
  CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES gv_brands(id)
);

CREATE INDEX idx_search_results_keyword ON gv_search_results(keyword_id);
CREATE INDEX idx_search_results_brand ON gv_search_results(brand_id);
CREATE INDEX idx_search_results_platform ON gv_search_results(platform);
CREATE INDEX idx_search_results_searched_at ON gv_search_results(searched_at DESC);


-- Daily Insights & Todo (unified table)
CREATE TABLE gv_daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Insight date
  insight_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Insight details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'progress_report',
    'competitor_alert',
    'seo_opportunity',
    'geo_improvement',
    'social_trend',
    'ai_visibility',
    'action_plan'
  )),

  -- 4-Column Data Structure
  now_status JSONB, -- {position: 5, visibility_score: 75, mentions: 120}
  progress_trend JSONB, -- {direction: "up", change_percent: 15, period: "7days"}
  potential JSONB, -- {opportunity: "Rank for 'sustainable fashion'", estimated_impact: "high"}
  competitors JSONB, -- [{name: "Nike", position: 2, strategy: "..."}]

  -- Priority & Action
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  actionable BOOLEAN DEFAULT TRUE,
  action_plan TEXT,

  -- Todo tracking
  is_todo BOOLEAN DEFAULT FALSE,
  todo_completed BOOLEAN DEFAULT FALSE,
  todo_completed_at TIMESTAMPTZ,
  todo_notes TEXT,

  -- Source tracking
  source_keyword_id UUID REFERENCES gv_tracked_keywords(id),
  source_platform TEXT,
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00

  -- AI generation
  generated_by_ai BOOLEAN DEFAULT TRUE,
  ai_provider TEXT,

  -- Delivery
  delivered BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES gv_brands(id)
);

CREATE INDEX idx_daily_insights_brand ON gv_daily_insights(brand_id);
CREATE INDEX idx_daily_insights_date ON gv_daily_insights(insight_date DESC);
CREATE INDEX idx_daily_insights_type ON gv_daily_insights(insight_type);
CREATE INDEX idx_daily_insights_todo ON gv_daily_insights(is_todo) WHERE is_todo = TRUE;


-- GEO Score Tracking (Google Maps ranking)
CREATE TABLE gv_geo_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- GEO score details
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00

  -- Component scores
  visibility_score DECIMAL(5, 2), -- How often brand appears in local searches
  ranking_score DECIMAL(5, 2), -- Average position in local pack
  review_score DECIMAL(5, 2), -- Review count & rating impact
  engagement_score DECIMAL(5, 2), -- Click-through rate, calls, directions

  -- Metadata
  total_searches_tracked INTEGER,
  average_position DECIMAL(5, 2),
  top_3_count INTEGER, -- How many times in top 3
  top_10_count INTEGER,

  -- Location data
  primary_location TEXT, -- City/region
  location_coverage JSONB, -- {city: "Jakarta", neighborhoods: [...]}

  -- Trend
  score_change_7d DECIMAL(5, 2), -- Change from 7 days ago
  score_change_30d DECIMAL(5, 2), -- Change from 30 days ago
  trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, score_date),
  CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES gv_brands(id)
);

CREATE INDEX idx_geo_scores_brand ON gv_geo_scores(brand_id);
CREATE INDEX idx_geo_scores_date ON gv_geo_scores(score_date DESC);


-- AI Generated Articles (field situation analysis)
CREATE TABLE gv_ai_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Article metadata
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,

  -- Article content
  summary TEXT NOT NULL, -- 2-3 sentences
  content TEXT NOT NULL, -- Full article (markdown)

  -- Article focus
  article_type TEXT CHECK (article_type IN (
    'competitive_analysis',
    'market_situation',
    'customer_perception',
    'trend_report',
    'strategy_recommendation'
  )),

  -- Data sources
  based_on_keywords TEXT[], -- Which keywords informed this article
  based_on_platforms TEXT[], -- Which platforms data was used

  -- Competitive insights
  competitors_mentioned JSONB, -- [{name, position, insight}]
  customer_sentiment JSONB, -- {positive: 60, neutral: 30, negative: 10}

  -- AI generation
  ai_provider TEXT DEFAULT 'openai',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  word_count INTEGER,

  -- Engagement
  read_count INTEGER DEFAULT 0,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES gv_brands(id)
);

CREATE INDEX idx_ai_articles_brand ON gv_ai_articles(brand_id);
CREATE INDEX idx_ai_articles_date ON gv_ai_articles(publish_date DESC);
CREATE INDEX idx_ai_articles_type ON gv_ai_articles(article_type);


-- Search API Usage Tracking
CREATE TABLE gv_search_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- API details
  api_provider TEXT NOT NULL CHECK (api_provider IN ('serpapi', 'apify', 'perplexity', 'chatgpt')),

  -- Usage tracking (monthly)
  usage_month DATE DEFAULT DATE_TRUNC('month', NOW()),
  requests_count INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Limits (based on tier)
  monthly_limit INTEGER NOT NULL,
  limit_reached BOOLEAN DEFAULT FALSE,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, api_provider, usage_month),
  CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES gv_brands(id)
);

CREATE INDEX idx_api_usage_brand ON gv_search_api_usage(brand_id);


-- RLS Policies for all tables
ALTER TABLE gv_tracked_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_geo_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_ai_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_search_api_usage ENABLE ROW LEVEL SECURITY;

-- Users can only access their own brand's data
CREATE POLICY "Users access own brand keywords"
  ON gv_tracked_keywords FOR ALL
  USING (brand_id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users access own brand search results"
  ON gv_search_results FOR ALL
  USING (brand_id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users access own brand insights"
  ON gv_daily_insights FOR ALL
  USING (brand_id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users access own brand geo scores"
  ON gv_geo_scores FOR ALL
  USING (brand_id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users access own brand articles"
  ON gv_ai_articles FOR ALL
  USING (brand_id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users access own brand api usage"
  ON gv_search_api_usage FOR SELECT
  USING (brand_id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid()));
```

---

## 2. SUPABASE EDGE FUNCTIONS

### Function 1: `search-tracker` (Multi-platform search)
**Path:** `/supabase/functions/search-tracker/index.ts`

**Purpose:** Execute searches across all platforms and store results

**Endpoints:**
- `POST /search-tracker` - Manual search trigger
- Cron: Daily automatic tracking

**Process:**
1. Get brand's tracked keywords
2. For each keyword:
   - **SerpAPI**: Google Search + Google Maps
   - **Apify**: Instagram, TikTok, YouTube
   - **Perplexity/ChatGPT**: AI platform search
3. Store results in `gv_search_results`
4. Update `last_checked_at`

**Request:**
```json
{
  "brand_id": "uuid",
  "keyword_id": "uuid", // optional, search specific keyword
  "platforms": ["google_search", "google_maps", "instagram"] // optional
}
```

---

### Function 2: `generate-daily-insights` (AI-powered insights)
**Path:** `/supabase/functions/generate-daily-insights/index.ts`

**Purpose:** Analyze search results and generate actionable insights

**Cron:** Daily at 7 AM UTC

**Process:**
1. Fetch today's search results for brand
2. Compare with historical data (7 days, 30 days)
3. Identify trends (↗️ up / ↘️ down / → stable)
4. Detect competitor movements
5. Generate insights with 4-column structure:
   - NOW: Current position
   - PROGRESS: Trend analysis
   - POTENTIAL: Opportunities
   - COMPETITORS: Competitive landscape
6. Create action plans (based on tier limit)
7. Store in `gv_daily_insights`

**Output Structure:**
```json
{
  "insight_date": "2024-02-13",
  "insights": [
    {
      "title": "Your brand rose 3 positions for 'sustainable fashion'",
      "insight_type": "progress_report",
      "now_status": {
        "position": 5,
        "visibility_score": 78,
        "platform": "google_search"
      },
      "progress_trend": {
        "direction": "up",
        "change_7d": "+3 positions",
        "change_30d": "+8 positions"
      },
      "potential": {
        "opportunity": "Create content targeting 'eco-friendly materials'",
        "estimated_impact": "high",
        "estimated_position_gain": 2
      },
      "competitors": [
        {
          "name": "Nike",
          "position": 2,
          "strategy": "Heavy investment in sustainability content"
        },
        {
          "name": "Adidas",
          "position": 4,
          "strategy": "Partnership with eco-influencers"
        }
      ],
      "action_plan": "1. Write blog post on sustainable materials\n2. Create Instagram series\n3. Update product descriptions"
    }
  ]
}
```

---

### Function 3: `calculate-geo-score` (Google Maps ranking)
**Path:** `/supabase/functions/calculate-geo-score/index.ts`

**Purpose:** Calculate daily GEO score based on Google Maps results

**Cron:** Daily at 8 AM UTC

**Calculation Formula:**
```
GEO Score = (
  Visibility Score (30%) +
  Ranking Score (40%) +
  Review Score (20%) +
  Engagement Score (10%)
)

Where:
- Visibility Score = (Appearances / Total Searches) * 100
- Ranking Score = 100 - (Avg Position * 10)
- Review Score = (Rating / 5) * (Reviews / 100) * 100
- Engagement Score = CTR * 100
```

**Store in:** `gv_geo_scores`

---

### Function 4: `generate-ai-article` (Competitive analysis article)
**Path:** `/supabase/functions/generate-ai-article/index.ts`

**Purpose:** Generate AI-written articles analyzing field situation vs competitors

**Cron:** Weekly (Monday 9 AM UTC)

**Article Types:**
1. **Competitive Analysis** - How competitors are performing
2. **Market Situation** - Industry trends & changes
3. **Customer Perception** - Sentiment analysis from social media
4. **Trend Report** - Emerging patterns in search & social
5. **Strategy Recommendation** - Actionable next steps

**Uses:** OpenAI GPT-4 for article generation

**Store in:** `gv_ai_articles`

---

## 3. EXTERNAL API INTEGRATIONS

### SerpAPI (Google Search & Maps)
```env
SERPAPI_API_KEY=your_key_here
SERPAPI_ENDPOINT=https://serpapi.com/search
```

**Usage:**
```typescript
const params = {
  q: "sustainable fashion Jakarta",
  location: "Jakarta, Indonesia",
  hl: "en",
  gl: "id",
  google_domain: "google.co.id",
  api_key: Deno.env.get('SERPAPI_API_KEY')
};

const response = await fetch(`https://serpapi.com/search?${new URLSearchParams(params)}`);
const data = await response.json();
```

**Cost:** ~$50/month per brand (daily searches)

---

### Apify (Social Media Scraping)
```env
APIFY_API_KEY=your_key_here
```

**Actors:**
- Instagram: `apify/instagram-scraper`
- TikTok: `apify/tiktok-scraper`
- YouTube: `apify/youtube-scraper`

**Usage:**
```typescript
const run = await apifyClient.actor("apify/instagram-scraper").call({
  search: "#sustainablefashion",
  resultsLimit: 50
});
```

**Cost:** ~$30/month per brand

---

### Perplexity API (AI Search)
```env
PERPLEXITY_API_KEY=your_key_here
```

**Usage:**
```typescript
const response = await fetch('https://api.perplexity.ai/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'sonar-medium-online',
    messages: [{
      role: 'user',
      content: 'What are brands saying about sustainable fashion?'
    }]
  })
});
```

**Cost:** ~$20/month per brand

---

## 4. FRONTEND UI

### New Page: `/discovery`
**File:** `/frontend/discovery.html`

**Layout:**

```
+----------------------------------+
|  Header (GeoVera + User menu)   |
+----------------------------------+
| Tabs: [Keywords] [Insights] [GEO Score] [Articles]
+----------------------------------+
|                                  |
| KEYWORDS TAB:                    |
| +------------------------------+ |
| | [Add Keyword] (if under limit)|
| +------------------------------+ |
| | Keyword 1: "sustainable fashion" |
| | NOW: #5 | PROGRESS: ↗️ +3 | POTENTIAL: High | COMPETITORS: Nike(2), Adidas(4) |
| +------------------------------+ |
| | Keyword 2: "eco-friendly shoes" |
| | NOW: #12 | PROGRESS: → 0 | POTENTIAL: Medium | COMPETITORS: Patagonia(3) |
| +------------------------------+ |
|                                  |
+----------------------------------+

INSIGHTS TAB:
- List of daily insights (filtered by type)
- Each insight card shows 4 columns
- Action plan button
- Mark as todo

GEO SCORE TAB:
- Overall score (gauge chart)
- Score trend (7d, 30d)
- Component breakdown (visibility, ranking, review, engagement)
- Map visualization

ARTICLES TAB:
- List of AI-generated articles
- Article cards with title, summary, date
- Read more button
```

---

## 5. CRON SCHEDULES

```sql
-- Daily search tracking (6 AM UTC)
SELECT cron.schedule(
  'daily-search-tracking',
  '0 6 * * *',
  $$ SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/search-tracker',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  ); $$
);

-- Daily insights generation (7 AM UTC)
SELECT cron.schedule(
  'daily-insights-generation',
  '0 7 * * *',
  $$ SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-daily-insights',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  ); $$
);

-- Daily GEO score calculation (8 AM UTC)
SELECT cron.schedule(
  'daily-geo-score-calculation',
  '0 8 * * *',
  $$ SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/calculate-geo-score',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  ); $$
);

-- Weekly AI article generation (Monday 9 AM UTC)
SELECT cron.schedule(
  'weekly-ai-article-generation',
  '0 9 * * 1',
  $$ SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-ai-article',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  ); $$
);
```

---

## 6. COST ESTIMATION

### Per Brand Per Month:

| Service | Usage | Cost |
|---------|-------|------|
| SerpAPI | 30 days × 5-15 keywords × 4 platforms | $40-120 |
| Apify | Social media scraping (daily) | $30 |
| Perplexity | AI search queries | $20 |
| OpenAI | Article generation + insights | $25 |
| **TOTAL** | | **$115-195/mo** |

### Revenue vs Cost (after AI costs from Feature 1):

| Tier | Price | AI Chat Cost | Search Cost | **Profit** |
|------|-------|--------------|-------------|------------|
| Basic | $399 | $50 | $115 | **$234** |
| Premium | $699 | $50 | $145 | **$504** |
| Partner | $1,099 | $50 | $195 | **$854** |

---

## 7. TIER LIMITS ENFORCEMENT

### Helper Function:
```sql
CREATE OR REPLACE FUNCTION check_keyword_limit(p_brand_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_current_count INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get brand tier
  SELECT subscription_tier INTO v_tier FROM gv_brands WHERE id = p_brand_id;

  -- Get current keyword count
  SELECT COUNT(*) INTO v_current_count
  FROM gv_tracked_keywords
  WHERE brand_id = p_brand_id AND active = TRUE;

  -- Determine limit
  v_limit := CASE
    WHEN v_tier = 'basic' THEN 5
    WHEN v_tier = 'premium' THEN 8
    WHEN v_tier = 'partner' THEN 15
    ELSE 0
  END;

  RETURN v_current_count < v_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. IMPLEMENTATION PRIORITY

### Phase 1 (Week 1-2):
1. ✅ Database schema setup
2. ✅ SerpAPI integration (Google Search only)
3. ✅ Basic search tracking
4. ✅ Keyword management UI

### Phase 2 (Week 3-4):
1. ✅ Google Maps (GEO) tracking
2. ✅ GEO score calculation
3. ✅ Daily insights generation (basic)
4. ✅ 4-column dashboard view

### Phase 3 (Week 5-6):
1. ✅ Apify social media integration
2. ✅ AI platform search (Perplexity)
3. ✅ Advanced insights with action plans
4. ✅ Todo integration

### Phase 4 (Week 7-8):
1. ✅ AI article generation
2. ✅ Competitor analysis
3. ✅ Customer sentiment analysis
4. ✅ Full dashboard with all features

---

## NEXT STEPS

**Ready to implement?**

Options:
1. Start with database schema migration
2. Build SerpAPI integration first (Google Search MVP)
3. Create discovery UI mockup
4. Full parallel implementation (all at once)

Choose approach and I'll execute!
