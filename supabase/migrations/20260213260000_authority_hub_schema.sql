-- ============================================================
-- Migration: Authority Hub Schema
-- Date: 2026-02-13 26:00:00
-- Purpose: Create schema for public Authority Hub feature
--          (AI-generated FAQ, Reviews, Education articles)
-- ============================================================

-- ============================================================
-- 1. HUB ARTICLES (Main Content Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_hub_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  article_type TEXT NOT NULL CHECK (article_type IN ('faq', 'review', 'education')),
  category TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  content_html TEXT NOT NULL,
  featured_image_url TEXT,
  reading_time_minutes INTEGER,

  -- SEO & Discovery
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_url TEXT,

  -- AI Generation Metadata
  source_content_ids UUID[],
  embedding_count INTEGER DEFAULT 0,
  generation_prompt TEXT,
  ai_model TEXT DEFAULT 'claude-3-5-sonnet-20241022',
  generation_cost_usd NUMERIC(10,4),

  -- Quality & Moderation
  neutrality_score NUMERIC(3,2),
  authority_score NUMERIC(3,2),
  readability_score NUMERIC(3,2),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hub_articles_brand ON gv_hub_articles(brand_id);
CREATE INDEX idx_hub_articles_slug ON gv_hub_articles(slug);
CREATE INDEX idx_hub_articles_category ON gv_hub_articles(category);
CREATE INDEX idx_hub_articles_status ON gv_hub_articles(status);
CREATE INDEX idx_hub_articles_published_at ON gv_hub_articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_hub_articles_type ON gv_hub_articles(article_type);

COMMENT ON TABLE gv_hub_articles IS 'AI-generated authority articles (public-accessible)';
COMMENT ON COLUMN gv_hub_articles.neutrality_score IS 'How neutral/unbiased is the content (0-1)';
COMMENT ON COLUMN gv_hub_articles.authority_score IS 'How authoritative/trustworthy is the content (0-1)';

-- ============================================================
-- 2. EMBEDDED CONTENT (TikTok, Instagram, YouTube)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_hub_embedded_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES gv_hub_articles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube')),
  content_id TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  embed_code TEXT,

  -- Content Metadata
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  creator_name TEXT,
  creator_handle TEXT,
  posted_at TIMESTAMPTZ,

  -- Engagement Metrics
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,

  -- Selection Reasoning
  selection_reason TEXT,
  relevance_score NUMERIC(3,2),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hub_embedded_article ON gv_hub_embedded_content(article_id);
CREATE INDEX idx_hub_embedded_platform ON gv_hub_embedded_content(platform);

COMMENT ON TABLE gv_hub_embedded_content IS 'Social media embeds within Hub articles (5-10 per article)';

-- ============================================================
-- 3. ARTICLE GENERATION QUEUE
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_hub_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  article_type TEXT NOT NULL CHECK (article_type IN ('faq', 'review', 'education')),
  category TEXT NOT NULL,
  topic TEXT NOT NULL,

  -- Queue Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 5,

  -- Generation Config
  source_content_count INTEGER DEFAULT 7,
  target_word_count INTEGER DEFAULT 1000,
  tone TEXT DEFAULT 'professional',

  -- Results
  article_id UUID REFERENCES gv_hub_articles(id) ON DELETE SET NULL,
  error_message TEXT,

  -- Timing
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hub_queue_status ON gv_hub_generation_queue(status, priority DESC, scheduled_at);
CREATE INDEX idx_hub_queue_brand ON gv_hub_generation_queue(brand_id);

COMMENT ON TABLE gv_hub_generation_queue IS 'Job queue for article generation tasks';

-- ============================================================
-- 4. DAILY QUOTA TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_hub_daily_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  quota_date DATE NOT NULL,
  subscription_tier TEXT NOT NULL,

  -- Quota Limits (by tier)
  daily_limit INTEGER NOT NULL,
  articles_generated INTEGER DEFAULT 0,
  articles_published INTEGER DEFAULT 0,

  -- Remaining
  remaining_quota INTEGER GENERATED ALWAYS AS (daily_limit - articles_generated) STORED,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_hub_quotas_brand_date ON gv_hub_daily_quotas(brand_id, quota_date);
CREATE INDEX idx_hub_quotas_date ON gv_hub_daily_quotas(quota_date DESC);

COMMENT ON TABLE gv_hub_daily_quotas IS 'Track daily article generation quotas by tier (Basic: 1, Premium: 2, Partner: 3)';

-- ============================================================
-- 5. HUB ANALYTICS (Public Page Views)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_hub_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES gv_hub_articles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'share', 'like', 'bookmark')),

  -- Visitor Info
  visitor_id TEXT,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Location (Optional)
  country TEXT,
  city TEXT,

  -- Timing
  event_timestamp TIMESTAMPTZ DEFAULT now(),
  time_on_page INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hub_analytics_article ON gv_hub_analytics(article_id, event_timestamp DESC);
CREATE INDEX idx_hub_analytics_event ON gv_hub_analytics(event_type, event_timestamp DESC);

COMMENT ON TABLE gv_hub_analytics IS 'Track public engagement with Hub articles';

-- ============================================================
-- 6. HELPER FUNCTIONS
-- ============================================================

-- Function: Get daily quota for brand
CREATE OR REPLACE FUNCTION get_hub_daily_quota(p_brand_id UUID)
RETURNS TABLE (
  daily_limit INTEGER,
  articles_generated INTEGER,
  remaining_quota INTEGER
) AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
BEGIN
  -- Get brand tier
  SELECT subscription_tier INTO v_tier
  FROM brands
  WHERE id = p_brand_id;

  -- Set limit based on tier
  v_limit := CASE v_tier
    WHEN 'basic' THEN 1
    WHEN 'premium' THEN 2
    WHEN 'partner' THEN 3
    ELSE 0
  END;

  -- Get or create today's quota record
  INSERT INTO gv_hub_daily_quotas (brand_id, quota_date, subscription_tier, daily_limit)
  VALUES (p_brand_id, CURRENT_DATE, v_tier, v_limit)
  ON CONFLICT (brand_id, quota_date)
  DO UPDATE SET daily_limit = EXCLUDED.daily_limit;

  -- Return quota info
  RETURN QUERY
  SELECT
    q.daily_limit,
    q.articles_generated,
    q.remaining_quota
  FROM gv_hub_daily_quotas q
  WHERE q.brand_id = p_brand_id
    AND q.quota_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if brand can generate article
CREATE OR REPLACE FUNCTION can_generate_hub_article(p_brand_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  SELECT remaining_quota INTO v_remaining
  FROM get_hub_daily_quota(p_brand_id);

  RETURN v_remaining > 0;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment article generation count
CREATE OR REPLACE FUNCTION increment_hub_generation(p_brand_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE gv_hub_daily_quotas
  SET articles_generated = articles_generated + 1,
      updated_at = now()
  WHERE brand_id = p_brand_id
    AND quota_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function: Get public articles (for Hub homepage)
CREATE OR REPLACE FUNCTION get_public_hub_articles(
  p_category TEXT DEFAULT NULL,
  p_article_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  subtitle TEXT,
  article_type TEXT,
  category TEXT,
  featured_image_url TEXT,
  reading_time_minutes INTEGER,
  published_at TIMESTAMPTZ,
  view_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.title,
    a.subtitle,
    a.article_type,
    a.category,
    a.featured_image_url,
    a.reading_time_minutes,
    a.published_at,
    a.view_count
  FROM gv_hub_articles a
  WHERE a.status = 'published'
    AND (p_category IS NULL OR a.category = p_category)
    AND (p_article_type IS NULL OR a.article_type = p_article_type)
  ORDER BY a.published_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 7. GRANT PERMISSIONS
-- ============================================================

-- Public can read published articles
GRANT SELECT ON gv_hub_articles TO anon, authenticated;
GRANT SELECT ON gv_hub_embedded_content TO anon, authenticated;

-- Authenticated users can track analytics
GRANT INSERT ON gv_hub_analytics TO anon, authenticated;

-- Authenticated users can check quotas
GRANT SELECT ON gv_hub_daily_quotas TO authenticated;

-- Service role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================
-- Migration complete
-- ============================================================
