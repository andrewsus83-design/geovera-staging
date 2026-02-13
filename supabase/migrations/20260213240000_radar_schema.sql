-- ============================================================
-- Migration: Radar Feature Schema
-- Date: 2026-02-13 24:00:00
-- Purpose: Create complete schema for Radar feature
--          (Mindshare, Marketshare, Trendshare)
-- ============================================================

-- ============================================================
-- 1. DISCOVERED BRANDS (Competitor Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_discovered_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  discovered_brand_name TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT DEFAULT 'ID',
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  facebook_handle TEXT,
  follower_estimate INTEGER,
  positioning TEXT,
  key_differentiators JSONB DEFAULT '[]',
  discovery_source TEXT DEFAULT 'perplexity',
  discovered_at TIMESTAMPTZ DEFAULT now(),
  is_competitor BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_discovered_brands_brand_id ON gv_discovered_brands(brand_id);
CREATE INDEX idx_discovered_brands_category ON gv_discovered_brands(category);

COMMENT ON TABLE gv_discovered_brands IS 'Competitor brands discovered via Perplexity for user brands';

-- ============================================================
-- 2. CREATORS DATABASE (240 creators for staging, 8000-10000 for production)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT DEFAULT 'ID',
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  facebook_handle TEXT,
  follower_count INTEGER NOT NULL,
  engagement_rate NUMERIC(5,2),
  content_focus TEXT,
  recent_brands JSONB DEFAULT '[]',
  platform_primary TEXT CHECK (platform_primary IN ('instagram', 'tiktok', 'youtube', 'facebook')),
  discovery_source TEXT DEFAULT 'perplexity',
  last_scraped_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_creators_category ON gv_creators(category);
CREATE INDEX idx_creators_country ON gv_creators(country);
CREATE INDEX idx_creators_follower_range ON gv_creators(follower_count);
CREATE INDEX idx_creators_active ON gv_creators(is_active) WHERE is_active = true;

COMMENT ON TABLE gv_creators IS 'Content creator database (100K-2M followers range)';
COMMENT ON COLUMN gv_creators.follower_count IS 'Total followers across all platforms (estimated)';
COMMENT ON COLUMN gv_creators.engagement_rate IS 'Average engagement rate percentage';

-- ============================================================
-- 3. CREATOR CONTENT (Scraped Posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_creator_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES gv_creators(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'facebook')),
  post_id TEXT NOT NULL,
  post_url TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  posted_at TIMESTAMPTZ,
  reach INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  views INTEGER,
  engagement_total INTEGER,
  is_promo BOOLEAN DEFAULT false,
  is_giveaway BOOLEAN DEFAULT false,
  is_life_update BOOLEAN DEFAULT false,
  content_quality_score NUMERIC(3,2),
  originality_score NUMERIC(3,2),
  brand_mentions JSONB DEFAULT '[]',
  scraped_at TIMESTAMPTZ DEFAULT now(),
  analyzed_at TIMESTAMPTZ,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_creator_content_unique ON gv_creator_content(creator_id, platform, post_id);
CREATE INDEX idx_creator_content_creator ON gv_creator_content(creator_id);
CREATE INDEX idx_creator_content_platform ON gv_creator_content(platform);
CREATE INDEX idx_creator_content_posted_at ON gv_creator_content(posted_at DESC);
CREATE INDEX idx_creator_content_filtered ON gv_creator_content(creator_id, is_promo, is_giveaway, is_life_update)
  WHERE is_promo = false AND is_giveaway = false AND is_life_update = false;

COMMENT ON TABLE gv_creator_content IS 'Scraped social media posts from creators (filtered: NO PROMO, NO GIVEAWAY, NOT LIFE UPDATE)';
COMMENT ON COLUMN gv_creator_content.is_promo IS 'Detected promo/sponsored content (filtered out)';
COMMENT ON COLUMN gv_creator_content.content_quality_score IS 'Claude-analyzed quality score (0-1)';
COMMENT ON COLUMN gv_creator_content.originality_score IS 'Claude-analyzed originality score (0-1)';

-- ============================================================
-- 4. CREATOR RANKINGS (Mindshare)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_creator_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES gv_creators(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  snapshot_type TEXT DEFAULT 'daily' CHECK (snapshot_type IN ('daily', 'weekly', 'monthly')),
  rank_position INTEGER NOT NULL,
  mindshare_percentage NUMERIC(5,2) NOT NULL,
  total_reach BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  avg_quality_score NUMERIC(3,2),
  avg_originality_score NUMERIC(3,2),
  weighted_score NUMERIC(10,2),
  rank_change INTEGER DEFAULT 0,
  rank_trend TEXT DEFAULT 'stable' CHECK (rank_trend IN ('rising', 'stable', 'falling')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_creator_rankings_unique ON gv_creator_rankings(creator_id, snapshot_date, snapshot_type);
CREATE INDEX idx_creator_rankings_category_date ON gv_creator_rankings(category, snapshot_date DESC);
CREATE INDEX idx_creator_rankings_position ON gv_creator_rankings(snapshot_date, rank_position);

COMMENT ON TABLE gv_creator_rankings IS 'Creator ranking snapshots (Mindshare calculation)';
COMMENT ON COLUMN gv_creator_rankings.mindshare_percentage IS '% contribution to category (based on weighted reach × quality)';
COMMENT ON COLUMN gv_creator_rankings.weighted_score IS 'Total reach × quality_score × originality_score';

-- ============================================================
-- 5. BRAND MARKETSHARE
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_brand_marketshare (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  category TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  total_creator_mentions INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_reach BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  marketshare_percentage NUMERIC(5,2) NOT NULL,
  marketshare_change NUMERIC(5,2) DEFAULT 0,
  rank_position INTEGER,
  mention_type_breakdown JSONB DEFAULT '{"organic": 0, "paid": 0}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_brand_marketshare_unique ON gv_brand_marketshare(brand_name, category, snapshot_date);
CREATE INDEX idx_brand_marketshare_category_date ON gv_brand_marketshare(category, snapshot_date DESC);
CREATE INDEX idx_brand_marketshare_rank ON gv_brand_marketshare(snapshot_date, rank_position);

COMMENT ON TABLE gv_brand_marketshare IS 'Brand marketshare calculation based on creator mentions';
COMMENT ON COLUMN gv_brand_marketshare.marketshare_percentage IS '% of category activity (based on reach from brand mentions)';

-- ============================================================
-- 6. TRENDS (Trendshare)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_name TEXT NOT NULL,
  trend_hashtag TEXT,
  category TEXT NOT NULL,
  trend_type TEXT CHECK (trend_type IN ('hashtag', 'topic', 'product', 'challenge', 'meme')),
  first_detected_at DATE NOT NULL,
  peak_date DATE,
  status TEXT DEFAULT 'rising' CHECK (status IN ('rising', 'peak', 'declining', 'expired')),
  total_posts INTEGER DEFAULT 0,
  total_creators INTEGER DEFAULT 0,
  total_reach BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  growth_rate NUMERIC(5,2),
  discovery_source TEXT DEFAULT 'perplexity',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trends_category ON gv_trends(category);
CREATE INDEX idx_trends_status ON gv_trends(status);
CREATE INDEX idx_trends_detected_at ON gv_trends(first_detected_at DESC);

COMMENT ON TABLE gv_trends IS 'Detected trends per category (hashtags, topics, challenges)';
COMMENT ON COLUMN gv_trends.status IS 'Trend lifecycle: rising → peak → declining → expired';

-- ============================================================
-- 7. TREND INVOLVEMENT (Creator/Brand Participation)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_trend_involvement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES gv_trends(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('creator', 'brand')),
  entity_id UUID,
  entity_name TEXT NOT NULL,
  contribution_percentage NUMERIC(5,2) NOT NULL,
  posts_count INTEGER DEFAULT 0,
  total_reach BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  first_post_date DATE,
  last_post_date DATE,
  involvement_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trend_involvement_trend ON gv_trend_involvement(trend_id);
CREATE INDEX idx_trend_involvement_entity ON gv_trend_involvement(entity_type, entity_id);
CREATE INDEX idx_trend_involvement_rank ON gv_trend_involvement(trend_id, involvement_rank);

COMMENT ON TABLE gv_trend_involvement IS 'Creator/Brand involvement in trends (Trendshare)';
COMMENT ON COLUMN gv_trend_involvement.contribution_percentage IS '% of trend activity by this creator/brand';

-- ============================================================
-- 8. RADAR PROCESSING QUEUE (Job Queue)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_radar_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('discover_brands', 'discover_creators', 'scrape_content', 'analyze_content', 'calculate_rankings', 'calculate_marketshare', 'discover_trends')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
  priority INTEGER DEFAULT 5,
  category TEXT,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES gv_creators(id) ON DELETE CASCADE,
  payload JSONB DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_radar_queue_status ON gv_radar_processing_queue(status, priority DESC, scheduled_at);
CREATE INDEX idx_radar_queue_job_type ON gv_radar_processing_queue(job_type, status);

COMMENT ON TABLE gv_radar_processing_queue IS 'Job queue for Radar processing tasks';

-- ============================================================
-- 9. RADAR SNAPSHOTS (Delta Caching)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_radar_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('creator_profile', 'content_metadata', 'ranking', 'marketshare', 'trend')),
  snapshot_date DATE NOT NULL,
  category TEXT NOT NULL,
  data JSONB NOT NULL,
  checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_radar_snapshots_type_date ON gv_radar_snapshots(snapshot_type, snapshot_date DESC);
CREATE INDEX idx_radar_snapshots_category ON gv_radar_snapshots(category, snapshot_date DESC);

COMMENT ON TABLE gv_radar_snapshots IS 'Delta caching for Radar data (optimize costs)';

-- ============================================================
-- 10. HELPER FUNCTIONS
-- ============================================================

-- Function: Calculate weighted score for creator
CREATE OR REPLACE FUNCTION calculate_weighted_score(
  p_total_reach BIGINT,
  p_quality_score NUMERIC,
  p_originality_score NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  RETURN p_total_reach * COALESCE(p_quality_score, 0.5) * COALESCE(p_originality_score, 0.5);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get creators by follower range
CREATE OR REPLACE FUNCTION get_creators_by_follower_range(
  p_category TEXT,
  p_min_followers INTEGER DEFAULT 100000,
  p_max_followers INTEGER DEFAULT 2000000
) RETURNS SETOF gv_creators AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM gv_creators
  WHERE category = p_category
    AND follower_count >= p_min_followers
    AND follower_count <= p_max_followers
    AND is_active = true
  ORDER BY follower_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get latest ranking for creator
CREATE OR REPLACE FUNCTION get_latest_creator_ranking(
  p_creator_id UUID
) RETURNS gv_creator_rankings AS $$
DECLARE
  latest_ranking gv_creator_rankings;
BEGIN
  SELECT * INTO latest_ranking
  FROM gv_creator_rankings
  WHERE creator_id = p_creator_id
  ORDER BY snapshot_date DESC
  LIMIT 1;

  RETURN latest_ranking;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 11. GRANT PERMISSIONS
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON gv_discovered_brands TO authenticated;
GRANT SELECT ON gv_creators TO authenticated;
GRANT SELECT ON gv_creator_content TO authenticated;
GRANT SELECT ON gv_creator_rankings TO authenticated;
GRANT SELECT ON gv_brand_marketshare TO authenticated;
GRANT SELECT ON gv_trends TO authenticated;
GRANT SELECT ON gv_trend_involvement TO authenticated;
GRANT SELECT ON gv_radar_snapshots TO authenticated;

-- Service role has full access for background jobs
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================
-- Migration complete
-- ============================================================
