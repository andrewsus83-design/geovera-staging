-- =====================================================
-- SOCIAL SEARCH OPTIMIZATION (SSO) - ADDON SCHEMA
-- To be added to main DATABASE_SCHEMA.sql
-- =====================================================

-- =====================================================
-- SOCIAL SEARCH OPTIMIZATION (SSO) TABLES
-- =====================================================

-- Categories configuration
CREATE TABLE gv_sso_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT UNIQUE NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('social', 'website')),

  -- Limits
  top_creators_limit INTEGER DEFAULT 500,
  top_sites_limit INTEGER DEFAULT 1000,

  -- Metadata
  platforms JSONB, -- Array of platforms for social categories
  description TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO gv_sso_categories (category_name, category_type, platforms, description) VALUES
  ('tech_influencers', 'social', '["twitter", "linkedin", "youtube", "tiktok"]', 'Technology influencers and thought leaders'),
  ('business_leaders', 'social', '["linkedin", "twitter", "medium"]', 'Business executives and entrepreneurs'),
  ('content_creators', 'social', '["youtube", "instagram", "tiktok", "twitter"]', 'Content creators and personalities'),
  ('developers', 'social', '["github", "twitter", "dev.to", "stackoverflow"]', 'Software developers and engineers'),
  ('marketers', 'social', '["twitter", "linkedin", "medium"]', 'Marketing professionals and strategists'),
  ('tech_news', 'website', NULL, 'Technology news websites and blogs'),
  ('business_news', 'website', NULL, 'Business and finance news sites'),
  ('developer_platforms', 'website', NULL, 'Developer communities and platforms'),
  ('industry_blogs', 'website', NULL, 'Industry-specific blogs and publications'),
  ('social_platforms', 'website', NULL, 'Major social media platforms');

-- Top creators tracking (500 per category)
CREATE TABLE gv_sso_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES gv_sso_categories(id) ON DELETE CASCADE,

  -- Creator info
  creator_name TEXT NOT NULL,
  creator_handle TEXT NOT NULL, -- @username
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'youtube', etc.
  profile_url TEXT NOT NULL,

  -- Impact metrics (from Perplexity)
  impact_score DECIMAL(10,2) NOT NULL, -- 0-100
  reach INTEGER, -- Followers/subscribers
  engagement_rate DECIMAL(5,2), -- Percentage
  authority_score DECIMAL(5,2), -- 0-100

  -- Perplexity ranking
  perplexity_rank INTEGER NOT NULL, -- 1-500
  perplexity_reasoning TEXT,

  -- Priority queue assignment
  queue_priority TEXT NOT NULL CHECK (queue_priority IN ('platinum', 'gold', 'silver', 'bronze')),
  update_window_days INTEGER NOT NULL, -- 3, 7, 14, or 28

  -- Scheduling
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ NOT NULL,

  -- Delta caching
  timestamp_hash TEXT, -- MD5(last_modified + content_hash)
  last_modified_at TIMESTAMPTZ,
  content_snapshot_hash TEXT, -- Hash of last content snapshot

  -- Metadata
  metadata JSONB, -- Additional data from Perplexity + Gemini

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, category_id, creator_handle, platform)
);

CREATE INDEX idx_sso_creators_brand ON gv_sso_creators(brand_id);
CREATE INDEX idx_sso_creators_category ON gv_sso_creators(category_id);
CREATE INDEX idx_sso_creators_priority ON gv_sso_creators(queue_priority);
CREATE INDEX idx_sso_creators_next_check ON gv_sso_creators(next_check_at);
CREATE INDEX idx_sso_creators_rank ON gv_sso_creators(perplexity_rank);
CREATE INDEX idx_sso_creators_impact ON gv_sso_creators(impact_score DESC);

-- Top sites tracking (1000 per category)
CREATE TABLE gv_sso_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES gv_sso_categories(id) ON DELETE CASCADE,

  -- Site info
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  domain TEXT NOT NULL,

  -- Impact metrics (from Perplexity)
  impact_score DECIMAL(10,2) NOT NULL,
  domain_authority INTEGER, -- 0-100
  monthly_traffic BIGINT,
  relevance_score DECIMAL(5,2),

  -- Perplexity ranking
  perplexity_rank INTEGER NOT NULL, -- 1-1000
  perplexity_reasoning TEXT,

  -- Priority queue assignment
  queue_priority TEXT NOT NULL CHECK (queue_priority IN ('platinum', 'gold', 'silver', 'bronze')),
  update_window_days INTEGER NOT NULL,

  -- Scheduling
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ NOT NULL,

  -- Delta caching
  timestamp_hash TEXT,
  last_modified_at TIMESTAMPTZ,
  content_snapshot_hash TEXT,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, category_id, domain)
);

CREATE INDEX idx_sso_sites_brand ON gv_sso_sites(brand_id);
CREATE INDEX idx_sso_sites_category ON gv_sso_sites(category_id);
CREATE INDEX idx_sso_sites_priority ON gv_sso_sites(queue_priority);
CREATE INDEX idx_sso_sites_next_check ON gv_sso_sites(next_check_at);
CREATE INDEX idx_sso_sites_rank ON gv_sso_sites(perplexity_rank);
CREATE INDEX idx_sso_sites_impact ON gv_sso_sites(impact_score DESC);

-- Mentions tracking (from creators and sites)
CREATE TABLE gv_sso_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Source
  source_type TEXT NOT NULL CHECK (source_type IN ('creator', 'site')),
  creator_id UUID REFERENCES gv_sso_creators(id) ON DELETE CASCADE,
  site_id UUID REFERENCES gv_sso_sites(id) ON DELETE CASCADE,

  -- Mention details
  mention_url TEXT NOT NULL,
  mention_text TEXT,
  mention_context TEXT,

  -- Sentiment analysis
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(5,2), -- -1 to 1

  -- Engagement
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  -- Metadata
  mentioned_at TIMESTAMPTZ NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_mentions_brand ON gv_sso_mentions(brand_id);
CREATE INDEX idx_sso_mentions_creator ON gv_sso_mentions(creator_id);
CREATE INDEX idx_sso_mentions_site ON gv_sso_mentions(site_id);
CREATE INDEX idx_sso_mentions_sentiment ON gv_sso_mentions(sentiment);
CREATE INDEX idx_sso_mentions_date ON gv_sso_mentions(mentioned_at);

-- Smart queue for batch processing
CREATE TABLE gv_sso_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Batch info
  batch_id TEXT NOT NULL,
  batch_type TEXT NOT NULL CHECK (batch_type IN ('creators', 'sites')),
  category_id UUID REFERENCES gv_sso_categories(id),

  -- Items in batch
  item_ids JSONB NOT NULL, -- Array of creator_ids or site_ids
  total_items INTEGER NOT NULL,

  -- Priority
  priority TEXT NOT NULL CHECK (priority IN ('platinum', 'gold', 'silver', 'bronze')),

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,

  -- Timestamp hash for batch
  batch_timestamp_hash TEXT, -- Uses latest timestamp from batch

  -- Pagination
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 100,
  has_next_page BOOLEAN DEFAULT false,

  -- Results
  mentions_found INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_queue_brand ON gv_sso_queue(brand_id);
CREATE INDEX idx_sso_queue_scheduled ON gv_sso_queue(scheduled_for);
CREATE INDEX idx_sso_queue_status ON gv_sso_queue(status);
CREATE INDEX idx_sso_queue_priority ON gv_sso_queue(priority);
CREATE INDEX idx_sso_queue_batch ON gv_sso_queue(batch_id);

-- Delta cache for content tracking
CREATE TABLE gv_sso_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  cache_type TEXT NOT NULL CHECK (cache_type IN ('creator', 'site')),
  creator_id UUID REFERENCES gv_sso_creators(id) ON DELETE CASCADE,
  site_id UUID REFERENCES gv_sso_sites(id) ON DELETE CASCADE,

  -- Cache data
  content_url TEXT NOT NULL,
  timestamp_hash TEXT NOT NULL, -- MD5(last_modified + content_hash)
  content_snapshot TEXT, -- Compressed snapshot of content
  content_hash TEXT NOT NULL, -- MD5 of content

  -- Timestamps
  last_modified_at TIMESTAMPTZ NOT NULL,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validity
  is_valid BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_cache_creator ON gv_sso_cache(creator_id);
CREATE INDEX idx_sso_cache_site ON gv_sso_cache(site_id);
CREATE INDEX idx_sso_cache_hash ON gv_sso_cache(timestamp_hash);
CREATE INDEX idx_sso_cache_expires ON gv_sso_cache(expires_at);

-- Impact history tracking
CREATE TABLE gv_sso_impact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Reference
  reference_type TEXT NOT NULL CHECK (reference_type IN ('creator', 'site')),
  creator_id UUID REFERENCES gv_sso_creators(id) ON DELETE CASCADE,
  site_id UUID REFERENCES gv_sso_sites(id) ON DELETE CASCADE,

  -- Impact metrics snapshot
  impact_score DECIMAL(10,2) NOT NULL,
  perplexity_rank INTEGER NOT NULL,
  reach INTEGER,
  engagement_rate DECIMAL(5,2),

  -- Changes
  impact_score_change DECIMAL(10,2),
  rank_change INTEGER,

  -- Priority adjustment
  old_priority TEXT,
  new_priority TEXT,
  old_update_window INTEGER,
  new_update_window INTEGER,

  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_impact_history_brand ON gv_sso_impact_history(brand_id);
CREATE INDEX idx_sso_impact_history_creator ON gv_sso_impact_history(creator_id);
CREATE INDEX idx_sso_impact_history_site ON gv_sso_impact_history(site_id);
CREATE INDEX idx_sso_impact_history_date ON gv_sso_impact_history(recorded_at);

-- =====================================================
-- GEMINI FLASH LITE INDEXING TABLES
-- =====================================================

-- Temporary index from Gemini Flash Lite (expires after 24h)
CREATE TABLE gv_sso_temp_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  category TEXT NOT NULL,

  -- Index data from Gemini Flash Lite
  index_data JSONB NOT NULL, -- {creators: [], sites: [], keywords: [], trends: []}
  index_type TEXT DEFAULT 'gemini_flash_lite',

  -- Statistics
  creators_count INTEGER,
  sites_count INTEGER,
  keywords_count INTEGER,

  -- Cost tracking
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  processing_time_ms INTEGER,

  -- Validity
  is_processed BOOLEAN DEFAULT false, -- Used for Perplexity amplification
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_temp_index_brand ON gv_sso_temp_index(brand_id);
CREATE INDEX idx_sso_temp_index_category ON gv_sso_temp_index(category);
CREATE INDEX idx_sso_temp_index_expires ON gv_sso_temp_index(expires_at);
CREATE INDEX idx_sso_temp_index_processed ON gv_sso_temp_index(is_processed);

-- AI model usage tracking (for all AI models)
CREATE TABLE gv_ai_model_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Model info
  model_name TEXT NOT NULL, -- 'gemini-flash-lite', 'perplexity-sonar-pro', 'gemini-2.0-flash', 'claude-sonnet-4', 'gpt-4-turbo'
  model_provider TEXT NOT NULL, -- 'google', 'perplexity', 'anthropic', 'openai'
  model_purpose TEXT NOT NULL, -- 'indexing', 'ranking', 'deep_analysis', 'feedback', 'content_generation', etc.

  -- Usage stats
  requests_count INTEGER DEFAULT 1,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  cost DECIMAL(10,4),
  processing_time_ms INTEGER,

  -- Context
  feature_type TEXT, -- 'sso', 'geo', 'seo', 'backlinks'
  operation TEXT, -- 'creator_indexing', 'site_ranking', 'citation_check', etc.
  operation_metadata JSONB,

  -- Results
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_brand ON gv_ai_model_usage(brand_id);
CREATE INDEX idx_ai_usage_model ON gv_ai_model_usage(model_name);
CREATE INDEX idx_ai_usage_provider ON gv_ai_model_usage(model_provider);
CREATE INDEX idx_ai_usage_feature ON gv_ai_model_usage(feature_type);
CREATE INDEX idx_ai_usage_date ON gv_ai_model_usage(created_at);

-- =====================================================
-- SSO RLS POLICIES
-- =====================================================

ALTER TABLE gv_sso_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sso_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sso_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sso_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sso_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sso_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sso_impact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_sso_temp_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_ai_model_usage ENABLE ROW LEVEL SECURITY;

-- SSO categories are public (read-only)
CREATE POLICY "Anyone can view SSO categories"
  ON gv_sso_categories FOR SELECT
  USING (true);

-- Users can only view their own brand's data
CREATE POLICY "Users can view own brand creators"
  ON gv_sso_creators FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand sites"
  ON gv_sso_sites FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand mentions"
  ON gv_sso_mentions FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand SSO queue"
  ON gv_sso_queue FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand temp index"
  ON gv_sso_temp_index FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand AI usage"
  ON gv_ai_model_usage FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

-- =====================================================
-- SSO FUNCTIONS
-- =====================================================

-- Function to clean expired temporary indexes
CREATE OR REPLACE FUNCTION cleanup_expired_temp_indexes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM gv_sso_temp_index
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update creator/site priority based on impact score
CREATE OR REPLACE FUNCTION update_sso_priority()
RETURNS TRIGGER AS $$
DECLARE
  v_max_rank INTEGER;
BEGIN
  -- Determine max rank based on type
  IF TG_TABLE_NAME = 'gv_sso_creators' THEN
    v_max_rank := 500;
  ELSE
    v_max_rank := 1000;
  END IF;

  -- Assign priority and update window
  IF NEW.perplexity_rank <= v_max_rank * 0.2 AND NEW.impact_score >= 80 THEN
    NEW.queue_priority := 'platinum';
    NEW.update_window_days := 3;
  ELSIF NEW.perplexity_rank <= v_max_rank * 0.4 AND NEW.impact_score >= 60 THEN
    NEW.queue_priority := 'gold';
    NEW.update_window_days := 7;
  ELSIF NEW.perplexity_rank <= v_max_rank * 0.7 OR NEW.impact_score >= 40 THEN
    NEW.queue_priority := 'silver';
    NEW.update_window_days := 14;
  ELSE
    NEW.queue_priority := 'bronze';
    NEW.update_window_days := 28;
  END IF;

  -- Update next check date
  NEW.next_check_at := NOW() + (NEW.update_window_days || ' days')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_creator_priority
BEFORE INSERT OR UPDATE OF impact_score, perplexity_rank ON gv_sso_creators
FOR EACH ROW
EXECUTE FUNCTION update_sso_priority();

CREATE TRIGGER trigger_update_site_priority
BEFORE INSERT OR UPDATE OF impact_score, perplexity_rank ON gv_sso_sites
FOR EACH ROW
EXECUTE FUNCTION update_sso_priority();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE gv_sso_categories IS 'SSO categories: 5 social (500 creators each), 5 website (1000 sites each)';
COMMENT ON TABLE gv_sso_creators IS 'Top 500 creators per category ranked by Perplexity impact score';
COMMENT ON TABLE gv_sso_sites IS 'Top 1000 sites per category ranked by Perplexity impact score';
COMMENT ON TABLE gv_sso_mentions IS 'Brand mentions from creators and sites with sentiment analysis';
COMMENT ON TABLE gv_sso_queue IS 'Smart batch processing queue with pagination and timestamp hash';
COMMENT ON TABLE gv_sso_cache IS 'Delta caching system using timestamp hash (last_modified + content_hash)';
COMMENT ON TABLE gv_sso_impact_history IS 'Historical tracking of impact scores and priority changes';
COMMENT ON TABLE gv_sso_temp_index IS 'Gemini Flash Lite temporary index (24h expiry) for Perplexity amplification';
COMMENT ON TABLE gv_ai_model_usage IS 'Track all AI model usage (Gemini Flash Lite, Perplexity, Gemini, Claude, OpenAI) for cost monitoring';

-- =====================================================
-- END OF SSO ADDON SCHEMA
-- =====================================================
