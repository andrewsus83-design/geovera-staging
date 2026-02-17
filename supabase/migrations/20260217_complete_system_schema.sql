-- ============================================================================
-- GEOVERA COMPLETE SYSTEM SCHEMA
-- Fixed/Variable Model + Priority System + Sub-Categories
-- Date: February 17, 2026
-- ============================================================================

-- ============================================================================
-- 1. CORE TABLES (Categories, Brands, Sub-Categories)
-- ============================================================================

-- Categories table (4 main categories)
CREATE TABLE IF NOT EXISTS gv_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Priority system fields
  priority_tier INTEGER DEFAULT 3, -- 1=Client, 2=Growth, 3=Authority
  client_count INTEGER DEFAULT 0,
  weighted_priority_score DECIMAL(10,2) DEFAULT 0,
  resource_allocation DECIMAL(5,2) DEFAULT 25.00, -- Percentage (0-100)

  -- Metadata
  active BOOLEAN DEFAULT true,
  last_priority_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sub-categories table (Product categories within main categories)
CREATE TABLE IF NOT EXISTS gv_sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  keywords TEXT[], -- Keywords for auto-detection
  description TEXT,

  -- Statistics
  creator_count INTEGER DEFAULT 0,
  brand_count INTEGER DEFAULT 0,

  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(category_id, slug)
);

-- Brands table
CREATE TABLE IF NOT EXISTS gv_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Brand info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES gv_categories(id),
  sub_category TEXT, -- Sub-category slug
  sub_category_confidence DECIMAL(3,2) DEFAULT 1.00,
  sub_category_detected_by TEXT, -- 'auto', 'perplexity', 'manual'

  -- Subscription
  tier TEXT NOT NULL CHECK (tier IN ('growth', 'scale', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),

  -- Engagement tracking (for weighted priority)
  engagement_level TEXT DEFAULT 'low' CHECK (engagement_level IN ('high', 'medium', 'low')),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  report_views INTEGER DEFAULT 0,

  -- Metadata
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_brands_category ON gv_brands(category_id);
CREATE INDEX IF NOT EXISTS idx_brands_sub_category ON gv_brands(sub_category);
CREATE INDEX IF NOT EXISTS idx_brands_tier ON gv_brands(tier);
CREATE INDEX IF NOT EXISTS idx_brands_user ON gv_brands(user_id);

-- ============================================================================
-- 2. SSO TABLES (Social Search Optimization)
-- ============================================================================

-- SSO Creators table
CREATE TABLE IF NOT EXISTS gv_sso_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id),

  -- Creator info
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube')),
  username TEXT NOT NULL,
  profile_url TEXT NOT NULL,

  -- Sub-category tagging
  sub_categories TEXT[], -- Can belong to multiple sub-categories
  primary_sub_category TEXT, -- Main sub-category

  -- Metrics
  follower_count BIGINT,
  engagement_rate DECIMAL(5,2),
  avg_views BIGINT,
  avg_likes BIGINT,

  -- Ranking
  category_rank INTEGER,
  impact_score DECIMAL(10,2),

  -- Monitoring
  last_scraped_at TIMESTAMPTZ,
  scrape_frequency TEXT DEFAULT '7D' CHECK (scrape_frequency IN ('3D', '7D', '14D')),

  -- Metadata
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(platform, username)
);

CREATE INDEX IF NOT EXISTS idx_sso_creators_category ON gv_sso_creators(category_id);
CREATE INDEX IF NOT EXISTS idx_sso_creators_rank ON gv_sso_creators(category_rank);
CREATE INDEX IF NOT EXISTS idx_sso_creators_sub_category ON gv_sso_creators USING GIN(sub_categories);

-- SSO Creator Insights (Step 2C output)
CREATE TABLE IF NOT EXISTS gv_sso_creator_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES gv_sso_creators(id) ON DELETE CASCADE,

  -- Insights data
  qa_pairs JSONB, -- 100-200 QA pairs
  keywords JSONB, -- 150-300 keywords
  search_queries JSONB, -- 100-150 queries
  topics JSONB, -- 30-50 topics
  themes JSONB, -- 15-25 themes
  strategic_insights JSONB, -- 10-20 insights

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Cache expiry

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sso_insights_creator ON gv_sso_creator_insights(creator_id);

-- SSO Category Analysis (Step 3.1 output)
CREATE TABLE IF NOT EXISTS gv_sso_category_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id),

  -- Analysis data
  trending_topics JSONB, -- Rank 1-50 with velocity
  keyword_opportunities JSONB, -- Rank 1-100
  competitive_landscape JSONB, -- Top 20 brands
  content_strategies JSONB, -- Ranked strategies
  partnership_opportunities JSONB, -- Rank 1-30

  -- Metadata
  analysis_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(category_id, analysis_date)
);

-- SSO Brand Opportunities (Step 3.2 output)
CREATE TABLE IF NOT EXISTS gv_sso_brand_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Opportunities data
  competitor_analysis JSONB, -- Top 10 competitors
  creator_fit_scores JSONB, -- All 450 creators with fit scores
  content_opportunities JSONB, -- Rank 1-50
  partnership_strategies JSONB, -- Rank 1-20
  keyword_strategy JSONB, -- Rank 1-100
  market_gaps JSONB, -- Prioritized gaps

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SSO Brand Creator Rankings (Step 3.3 output)
CREATE TABLE IF NOT EXISTS gv_brand_creator_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES gv_sso_creators(id) ON DELETE CASCADE,

  -- Ranking scores
  combined_score DECIMAL(10,2), -- Final weighted score
  impact_score DECIMAL(10,2), -- From Claude (40%)
  fit_score DECIMAL(10,2), -- From Perplexity (40%)
  engagement_rate DECIMAL(5,2), -- From Apify (20%)

  -- Ranking
  brand_rank INTEGER, -- 1-450 for this brand

  -- Sub-category relevance
  sub_category_match BOOLEAN DEFAULT false,

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_creator_rank ON gv_brand_creator_rankings(brand_id, brand_rank);

-- ============================================================================
-- 3. SEO TABLES (Search Engine Optimization)
-- ============================================================================

-- SEO Category Keywords (Fixed cost - Step SEO-3 output)
CREATE TABLE IF NOT EXISTS gv_seo_category_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id),

  -- Keyword data
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER, -- 0-100
  opportunity_score INTEGER, -- 0-100
  trending BOOLEAN DEFAULT false,

  -- Sub-category association
  sub_categories TEXT[],

  -- Ranking
  category_rank INTEGER, -- 1-500

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(category_id, keyword)
);

CREATE INDEX IF NOT EXISTS idx_seo_keywords_category ON gv_seo_category_keywords(category_id);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_rank ON gv_seo_category_keywords(category_rank);

-- SEO Category Content (Fixed cost - Step SEO-2 output)
CREATE TABLE IF NOT EXISTS gv_seo_category_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id),

  -- Content data
  url TEXT NOT NULL,
  domain TEXT,
  ranking_position INTEGER,
  ranking_factors JSONB,
  content_type TEXT,

  -- Sub-category
  sub_category TEXT,

  -- Metadata
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO Brand Strategy (Variable cost - Step SEO-3 output)
CREATE TABLE IF NOT EXISTS gv_seo_brand_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Strategy data
  keywords JSONB, -- 50-100 brand keywords
  content_plan JSONB,
  priority_ranking JSONB,

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO Published Content (Variable cost - Step SEO-5 output)
CREATE TABLE IF NOT EXISTS gv_seo_published_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Content data
  title TEXT,
  content TEXT,
  target_keywords TEXT[],
  published_url TEXT,
  performance_metrics JSONB,

  -- Metadata
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. GEO TABLES (Generative Engine Optimization)
-- ============================================================================

-- GEO Category Citations (Fixed cost - Step GEO-2 output)
CREATE TABLE IF NOT EXISTS gv_geo_category_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id),

  -- Citation data
  source_url TEXT NOT NULL,
  citation_frequency INTEGER DEFAULT 0,
  ai_engines TEXT[], -- Which AI engines cite this
  content_type TEXT,
  ranking_factors JSONB,

  -- Sub-category
  sub_category TEXT,

  -- Metadata
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GEO Category Opportunities (Fixed cost - Step GEO-2 output)
CREATE TABLE IF NOT EXISTS gv_geo_category_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id),

  -- Opportunity data
  topic TEXT NOT NULL,
  opportunity_score INTEGER, -- 0-100
  current_leaders TEXT[],
  gap_analysis JSONB,

  -- Sub-category
  sub_category TEXT,

  -- Ranking
  category_rank INTEGER, -- 1-500

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GEO Brand Strategy (Variable cost - Step GEO-3 output)
CREATE TABLE IF NOT EXISTS gv_geo_brand_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Strategy data
  target_topics JSONB, -- 20-30 topics
  citation_plan JSONB,
  priority_ranking JSONB,

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GEO Published Content (Variable cost - Step GEO-5 output)
CREATE TABLE IF NOT EXISTS gv_geo_published_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Content data
  title TEXT,
  content TEXT,
  platforms JSONB, -- Where published
  citation_tracking JSONB,
  performance_metrics JSONB,

  -- Metadata
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. QA PAIRS TABLE (1500 QA generation output)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gv_qa_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id),

  -- QA data
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('seo', 'geo', 'social')),

  -- Sub-category
  sub_category TEXT,

  -- Metadata
  keywords TEXT[],
  quality_score DECIMAL(3,2),
  used_count INTEGER DEFAULT 0,

  -- Generation
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Monthly regeneration
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_category ON gv_qa_pairs(category_id);
CREATE INDEX IF NOT EXISTS idx_qa_platform ON gv_qa_pairs(platform);
CREATE INDEX IF NOT EXISTS idx_qa_sub_category ON gv_qa_pairs(sub_category);

-- ============================================================================
-- 6. PROCESSING QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gv_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task info
  task_type TEXT NOT NULL, -- 'sso_monitoring', 'seo_monitoring', 'geo_monitoring', 'qa_generation'
  category_id UUID REFERENCES gv_categories(id),
  brand_id UUID REFERENCES gv_brands(id),

  -- Priority
  category_priority INTEGER DEFAULT 3, -- From category priority_tier
  priority_boost BOOLEAN DEFAULT false,
  weighted_score DECIMAL(10,2),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  error_message TEXT,

  -- Scheduling
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON gv_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_priority ON gv_processing_queue(category_priority, weighted_score DESC);

-- ============================================================================
-- 7. USER ACTIVITY TRACKING (for engagement scoring)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gv_user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity data
  action TEXT NOT NULL, -- 'login', 'view_report', 'view_dashboard', etc.
  metadata JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_brand ON gv_user_activity(brand_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON gv_user_activity(created_at);

-- ============================================================================
-- 8. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON gv_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON gv_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: Calculate weighted priority scores
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
    client_count = (SELECT client_count FROM category_scores WHERE category_id = c.id),
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

-- ============================================================================
-- 9. INITIAL DATA: Insert 4 main categories
-- ============================================================================

INSERT INTO gv_categories (name, slug, description) VALUES
('Food & Beverage', 'food_beverage', 'Food, beverages, restaurants, and culinary brands'),
('Beauty & Skincare', 'beauty_skincare', 'Beauty products, skincare, makeup, and personal care'),
('Fashion & Lifestyle', 'fashion_lifestyle', 'Fashion, apparel, accessories, and lifestyle brands'),
('Technology & Gadgets', 'technology_gadgets', 'Tech products, gadgets, electronics, and software')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 10. INITIAL DATA: Insert sub-categories
-- ============================================================================

-- Food & Beverage sub-categories
INSERT INTO gv_sub_categories (category_id, name, slug, keywords) VALUES
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Beverages',
  'beverages',
  ARRAY['cola', 'soda', 'drink', 'water', 'juice', 'energy', 'gatorade', 'sprite', 'pepsi', 'aqua', 'beverage']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Fast Food',
  'fast_food',
  ARRAY['burger', 'pizza', 'chicken', 'mcdonald', 'kfc', 'sandwich', 'chipotle', 'fries', 'fastfood']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Snacks',
  'snacks',
  ARRAY['chips', 'chocolate', 'candy', 'oreo', 'lay', 'doritos', 'snickers', 'snack', 'crisp']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Coffee & Tea',
  'coffee_tea',
  ARRAY['coffee', 'tea', 'starbucks', 'kopi', 'teh', 'latte', 'espresso', 'cafe']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Packaged Foods',
  'packaged_foods',
  ARRAY['noodles', 'indomie', 'sedaap', 'frozen', 'instant', 'packaged', 'canned']
)
ON CONFLICT (category_id, slug) DO NOTHING;

-- Beauty & Skincare sub-categories
INSERT INTO gv_sub_categories (category_id, name, slug, keywords) VALUES
(
  (SELECT id FROM gv_categories WHERE slug = 'beauty_skincare'),
  'Skincare',
  'skincare',
  ARRAY['moisturizer', 'cleanser', 'serum', 'toner', 'sunscreen', 'skincare', 'facial']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'beauty_skincare'),
  'Makeup',
  'makeup',
  ARRAY['lipstick', 'foundation', 'eyeshadow', 'mascara', 'makeup', 'cosmetic']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'beauty_skincare'),
  'Haircare',
  'haircare',
  ARRAY['shampoo', 'conditioner', 'hair', 'styling', 'treatment', 'haircare']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'beauty_skincare'),
  'Personal Care',
  'personal_care',
  ARRAY['deodorant', 'body wash', 'perfume', 'soap', 'lotion', 'bodycare']
)
ON CONFLICT (category_id, slug) DO NOTHING;

-- Fashion & Lifestyle sub-categories
INSERT INTO gv_sub_categories (category_id, name, slug, keywords) VALUES
(
  (SELECT id FROM gv_categories WHERE slug = 'fashion_lifestyle'),
  'Apparel',
  'apparel',
  ARRAY['clothing', 'shoes', 'accessories', 'fashion', 'wear', 'apparel']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'fashion_lifestyle'),
  'Bags & Luggage',
  'bags_luggage',
  ARRAY['bag', 'backpack', 'luggage', 'suitcase', 'wallet', 'purse']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'fashion_lifestyle'),
  'Watches & Jewelry',
  'watches_jewelry',
  ARRAY['watch', 'jewelry', 'necklace', 'bracelet', 'ring', 'accessory']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'fashion_lifestyle'),
  'Home & Living',
  'home_living',
  ARRAY['home', 'furniture', 'decor', 'living', 'interior', 'household']
)
ON CONFLICT (category_id, slug) DO NOTHING;

-- Technology & Gadgets sub-categories
INSERT INTO gv_sub_categories (category_id, name, slug, keywords) VALUES
(
  (SELECT id FROM gv_categories WHERE slug = 'technology_gadgets'),
  'Smartphones & Tablets',
  'smartphones_tablets',
  ARRAY['smartphone', 'phone', 'tablet', 'mobile', 'iphone', 'samsung', 'android']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'technology_gadgets'),
  'Laptops & Computers',
  'laptops_computers',
  ARRAY['laptop', 'computer', 'pc', 'macbook', 'notebook', 'desktop']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'technology_gadgets'),
  'Audio',
  'audio',
  ARRAY['headphone', 'speaker', 'earphone', 'audio', 'sound', 'airpods']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'technology_gadgets'),
  'Smart Home & Wearables',
  'smart_home_wearables',
  ARRAY['smartwatch', 'fitness', 'tracker', 'smart home', 'wearable', 'iot']
)
ON CONFLICT (category_id, slug) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Grant permissions (adjust as needed for your RLS policies)
-- These are basic grants - you should set up proper RLS policies

ALTER TABLE gv_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sso_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_brand_creator_rankings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read categories and sub-categories
CREATE POLICY "Categories are viewable by all authenticated users"
  ON gv_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sub-categories are viewable by all authenticated users"
  ON gv_sub_categories FOR SELECT
  TO authenticated
  USING (true);

-- Brands: Users can only see their own brands
CREATE POLICY "Users can view own brands"
  ON gv_brands FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brands"
  ON gv_brands FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brands"
  ON gv_brands FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Creators: Viewable by authenticated users (shared data)
CREATE POLICY "Creators viewable by authenticated users"
  ON gv_sso_creators FOR SELECT
  TO authenticated
  USING (true);

-- Brand creator rankings: Only for brand owner
CREATE POLICY "Users can view own brand creator rankings"
  ON gv_brand_creator_rankings FOR SELECT
  TO authenticated
  USING (
    brand_id IN (
      SELECT id FROM gv_brands WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
