-- ============================================================================
-- GEOVERA - SEARCH INTELLIGENCE & DAILY INSIGHTS SCHEMA
-- Features 2 & 3: LLM SEO, GEO & Social Search + Daily Insights & Todo
-- ============================================================================

-- ============================================================================
-- 1. KEYWORDS TRACKING (Feature 2)
-- ============================================================================

CREATE TABLE gv_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Keyword data
  keyword TEXT NOT NULL,
  keyword_type TEXT NOT NULL CHECK (keyword_type IN ('seo', 'geo', 'social')),

  -- Discovery source
  source TEXT CHECK (source IN ('user_input', 'ai_suggested', 'competitor_analysis')),
  suggested_by_ai TEXT, -- 'gemini', 'perplexity', 'claude'

  -- Tier enforcement
  tier_limit_reached BOOLEAN DEFAULT FALSE,

  -- Performance tracking
  current_rank INTEGER,
  best_rank INTEGER,
  total_searches INTEGER DEFAULT 0,

  -- Status
  active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_tracked_at TIMESTAMPTZ,

  UNIQUE(brand_id, keyword, keyword_type)
);

CREATE INDEX idx_keywords_brand ON gv_keywords(brand_id);
CREATE INDEX idx_keywords_type ON gv_keywords(keyword_type);
CREATE INDEX idx_keywords_active ON gv_keywords(active);


-- ============================================================================
-- 2. SEARCH RESULTS (SerpAPI, Apify, AI Platform Data)
-- ============================================================================

CREATE TABLE gv_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES gv_keywords(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Search metadata
  platform TEXT NOT NULL CHECK (platform IN ('google', 'google_maps', 'instagram', 'tiktok', 'youtube', 'reddit', 'linkedin')),
  search_engine TEXT, -- 'serpapi', 'apify', 'perplexity'

  -- Brand position
  brand_rank INTEGER,
  brand_url TEXT,
  brand_appeared BOOLEAN DEFAULT FALSE,

  -- Top results
  top_results JSONB, -- [{rank: 1, title: "...", url: "...", brand: "..."}]

  -- Competitor data
  competitors_found TEXT[], -- ['nike', 'adidas', 'puma']
  competitor_positions JSONB, -- {nike: 1, adidas: 3, puma: 5}

  -- Insights
  total_results INTEGER,
  search_volume INTEGER,
  difficulty_score DECIMAL(3, 2), -- 0.00 to 1.00

  -- Raw data
  raw_response JSONB,

  -- Tracking
  search_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_results_keyword ON gv_search_results(keyword_id);
CREATE INDEX idx_search_results_brand ON gv_search_results(brand_id);
CREATE INDEX idx_search_results_date ON gv_search_results(search_date DESC);


-- ============================================================================
-- 3. GEO SCORES (Google Maps Ranking)
-- ============================================================================

CREATE TABLE gv_geo_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- GEO data
  location TEXT NOT NULL,
  radius_km INTEGER DEFAULT 5,

  -- Score calculation
  current_score INTEGER, -- 0-100
  previous_score INTEGER,
  score_change INTEGER, -- +/- change

  -- Ranking factors
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(2, 1), -- 0.0 to 5.0
  response_rate DECIMAL(5, 2), -- %
  photos_count INTEGER DEFAULT 0,

  -- Position tracking
  map_rank INTEGER, -- Position in Google Maps results
  search_visibility TEXT CHECK (search_visibility IN ('high', 'medium', 'low')),

  -- Competitors
  top_competitors JSONB, -- [{name: "...", score: 95, rank: 1}]

  -- Timestamps
  tracked_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, location, tracked_date)
);

CREATE INDEX idx_geo_scores_brand ON gv_geo_scores(brand_id);
CREATE INDEX idx_geo_scores_date ON gv_geo_scores(tracked_date DESC);


-- ============================================================================
-- 4. DAILY INSIGHTS (Feature 3)
-- ============================================================================

CREATE TABLE gv_daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Insight type
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'competitor_alert',
    'ranking_change',
    'keyword_opportunity',
    'content_suggestion',
    'geo_update',
    'social_trend',
    'action_item'
  )),

  -- Insight data
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB, -- Full insight details

  -- Priority
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  impact_score INTEGER, -- 0-100 (expected impact)

  -- Column assignment (4-column structure)
  column_type TEXT CHECK (column_type IN ('now', 'progress', 'potential', 'competitors')),

  -- Action tracking
  actionable BOOLEAN DEFAULT TRUE,
  action_status TEXT DEFAULT 'pending' CHECK (action_status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  action_deadline DATE,

  -- AI source
  ai_provider TEXT, -- 'gemini', 'perplexity', 'claude', 'openai'
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00

  -- User interaction
  read_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Timestamps
  insight_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_daily_insights_brand ON gv_daily_insights(brand_id);
CREATE INDEX idx_daily_insights_date ON gv_daily_insights(insight_date DESC);
CREATE INDEX idx_daily_insights_type ON gv_daily_insights(insight_type);
CREATE INDEX idx_daily_insights_column ON gv_daily_insights(column_type);
CREATE INDEX idx_daily_insights_status ON gv_daily_insights(action_status);


-- ============================================================================
-- 5. AI ARTICLES (Feature 3 - Daily Reports)
-- ============================================================================

CREATE TABLE gv_ai_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Article metadata
  title TEXT NOT NULL,
  slug TEXT,
  article_type TEXT CHECK (article_type IN ('daily_report', 'weekly_summary', 'competitor_analysis', 'trend_analysis')),

  -- Content
  content_html TEXT NOT NULL,
  content_markdown TEXT,
  summary TEXT,

  -- Data source
  insights_used UUID[], -- Array of insight IDs used
  keywords_analyzed UUID[], -- Array of keyword IDs

  -- AI generation
  ai_provider TEXT NOT NULL,
  model_used TEXT,
  generation_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  reading_time INTEGER, -- minutes

  -- Publishing
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  article_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_articles_brand ON gv_ai_articles(brand_id);
CREATE INDEX idx_ai_articles_date ON gv_ai_articles(article_date DESC);
CREATE INDEX idx_ai_articles_type ON gv_ai_articles(article_type);


-- ============================================================================
-- 6. TIER USAGE TRACKING (Enforce Limits)
-- ============================================================================

CREATE TABLE gv_tier_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Usage period
  usage_month DATE DEFAULT DATE_TRUNC('month', NOW()),

  -- Feature 2: Search limits
  keywords_used INTEGER DEFAULT 0,
  keywords_limit INTEGER NOT NULL, -- Based on tier: 5, 8, 15
  serpapi_calls INTEGER DEFAULT 0,
  apify_calls INTEGER DEFAULT 0,

  -- Feature 3: Insights limits
  insights_generated INTEGER DEFAULT 0,
  insights_limit INTEGER NOT NULL, -- Based on tier: 5, 8, 12
  articles_generated INTEGER DEFAULT 0,

  -- Feature 4: Content limits (will be populated later)
  content_articles INTEGER DEFAULT 0,
  content_images INTEGER DEFAULT 0,
  content_videos INTEGER DEFAULT 0,

  -- Cost tracking
  total_cost_usd DECIMAL(10, 2) DEFAULT 0,

  -- Timestamps
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  next_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),

  UNIQUE(brand_id, usage_month)
);

CREATE INDEX idx_tier_usage_brand ON gv_tier_usage(brand_id);
CREATE INDEX idx_tier_usage_month ON gv_tier_usage(usage_month DESC);


-- ============================================================================
-- 7. COMPETITOR TRACKING
-- ============================================================================

CREATE TABLE gv_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Competitor info
  competitor_name TEXT NOT NULL,
  competitor_brand TEXT,
  competitor_url TEXT,

  -- Discovery
  discovered_via TEXT CHECK (discovered_via IN ('user_input', 'ai_analysis', 'search_results')),

  -- Tracking data
  keywords_competing_on UUID[], -- Array of keyword IDs
  average_rank DECIMAL(5, 2),
  win_rate DECIMAL(5, 2), -- % of keywords where brand ranks higher

  -- Activity
  active BOOLEAN DEFAULT TRUE,
  track_closely BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, competitor_name)
);

CREATE INDEX idx_competitors_brand ON gv_competitors(brand_id);
CREATE INDEX idx_competitors_active ON gv_competitors(active);


-- ============================================================================
-- 8. KEYWORD PERFORMANCE HISTORY (Trend Tracking)
-- ============================================================================

CREATE TABLE gv_keyword_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES gv_keywords(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Performance snapshot
  rank INTEGER,
  search_volume INTEGER,
  competitors_count INTEGER,
  brand_visibility TEXT CHECK (brand_visibility IN ('not_found', 'page_2+', 'page_1', 'top_5', 'top_3', 'rank_1')),

  -- Changes
  rank_change INTEGER, -- +/- from previous
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),

  -- Timestamp
  tracked_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keyword_history_keyword ON gv_keyword_history(keyword_id);
CREATE INDEX idx_keyword_history_date ON gv_keyword_history(tracked_date DESC);


-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

-- Keywords
ALTER TABLE gv_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand keywords"
  ON gv_keywords FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Search Results
ALTER TABLE gv_search_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand search results"
  ON gv_search_results FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- GEO Scores
ALTER TABLE gv_geo_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand geo scores"
  ON gv_geo_scores FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Daily Insights
ALTER TABLE gv_daily_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand insights"
  ON gv_daily_insights FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- AI Articles
ALTER TABLE gv_ai_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand articles"
  ON gv_ai_articles FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Tier Usage
ALTER TABLE gv_tier_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand usage"
  ON gv_tier_usage FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Competitors
ALTER TABLE gv_competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand competitors"
  ON gv_competitors FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Keyword History
ALTER TABLE gv_keyword_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand keyword history"
  ON gv_keyword_history FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get tier limits for a brand
CREATE OR REPLACE FUNCTION get_tier_limits(p_brand_id UUID)
RETURNS TABLE(
  keywords_limit INTEGER,
  insights_limit INTEGER,
  articles_limit INTEGER,
  images_limit INTEGER,
  videos_limit INTEGER
) AS $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM gv_brands
  WHERE id = p_brand_id;

  CASE v_tier
    WHEN 'basic' THEN
      RETURN QUERY SELECT 5, 5, 1, 1, 0;
    WHEN 'premium' THEN
      RETURN QUERY SELECT 8, 8, 3, 3, 1;
    WHEN 'partner' THEN
      RETURN QUERY SELECT 15, 12, 6, 6, 3;
    ELSE
      RETURN QUERY SELECT 5, 5, 1, 1, 0; -- Default to basic
  END CASE;
END;
$$ LANGUAGE plpgsql;


-- Function: Check if tier limit reached
CREATE OR REPLACE FUNCTION check_tier_limit(
  p_brand_id UUID,
  p_limit_type TEXT -- 'keywords', 'insights', 'articles', 'images', 'videos'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_usage INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get current usage
  SELECT
    CASE p_limit_type
      WHEN 'keywords' THEN keywords_used
      WHEN 'insights' THEN insights_generated
      WHEN 'articles' THEN content_articles
      WHEN 'images' THEN content_images
      WHEN 'videos' THEN content_videos
    END,
    CASE p_limit_type
      WHEN 'keywords' THEN keywords_limit
      WHEN 'insights' THEN insights_limit
      WHEN 'articles' THEN (SELECT articles_limit FROM get_tier_limits(p_brand_id))
      WHEN 'images' THEN (SELECT images_limit FROM get_tier_limits(p_brand_id))
      WHEN 'videos' THEN (SELECT videos_limit FROM get_tier_limits(p_brand_id))
    END
  INTO v_current_usage, v_limit
  FROM gv_tier_usage
  WHERE brand_id = p_brand_id
    AND usage_month = DATE_TRUNC('month', NOW());

  RETURN v_current_usage >= v_limit;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON gv_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON gv_competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_search_results_brand_date ON gv_search_results(brand_id, search_date DESC);
CREATE INDEX idx_insights_brand_column_date ON gv_daily_insights(brand_id, column_type, insight_date DESC);
CREATE INDEX idx_keyword_history_keyword_date ON gv_keyword_history(keyword_id, tracked_date DESC);
