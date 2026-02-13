-- ============================================================================
-- GEOVERA - CONTENT STUDIO SCHEMA
-- Feature 4: AI-Powered Content Generation (Articles, Images, Videos)
-- ============================================================================

-- ============================================================================
-- 1. CONTENT GENERATION QUEUE
-- ============================================================================

CREATE TABLE gv_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Content specifications
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'image', 'video')),
  content_goal TEXT NOT NULL CHECK (content_goal IN ('visibility', 'discovery', 'authority', 'trust')),
  target_platforms TEXT[] NOT NULL,

  -- Topic & keywords
  topic TEXT NOT NULL,
  keywords TEXT[],
  target_audience TEXT,

  -- Generation status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'published')),
  priority INTEGER DEFAULT 1,

  -- AI providers used
  ai_provider_article TEXT,
  ai_provider_image TEXT,
  ai_provider_video TEXT,

  -- Cost tracking
  generation_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Results
  result_content_id UUID REFERENCES gv_content_library(id),
  error_message TEXT
);

CREATE INDEX idx_content_queue_brand ON gv_content_queue(brand_id);
CREATE INDEX idx_content_queue_status ON gv_content_queue(status);
CREATE INDEX idx_content_queue_priority ON gv_content_queue(priority DESC);


-- ============================================================================
-- 2. CONTENT LIBRARY (Generated Content Storage)
-- ============================================================================

CREATE TABLE gv_content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Content metadata
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'image', 'video')),
  title TEXT NOT NULL,
  slug TEXT,

  -- Content data (platform-specific variations)
  content_variations JSONB NOT NULL,

  -- SEO & Discovery
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  target_audience TEXT,

  -- Brand consistency tracking
  brand_voice_score DECIMAL(3, 2),
  brand_colors_used TEXT[],
  brand_fonts_used TEXT[],

  -- Content goal & performance
  content_goal TEXT NOT NULL CHECK (content_goal IN ('visibility', 'discovery', 'authority', 'trust')),
  target_platforms TEXT[] NOT NULL,

  -- AI generation metadata
  ai_provider_used TEXT NOT NULL,
  model_used TEXT,
  generation_prompt TEXT,
  generation_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- File storage
  primary_file_url TEXT,
  thumbnail_url TEXT,
  file_size_kb INTEGER,
  file_format TEXT,

  -- Publishing status
  published_to_platforms TEXT[],
  publish_scheduled_at TIMESTAMPTZ,
  publish_status TEXT DEFAULT 'draft' CHECK (publish_status IN ('draft', 'scheduled', 'published', 'archived')),

  -- Performance tracking
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5, 2),
  sentiment_score DECIMAL(3, 2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_content_library_brand ON gv_content_library(brand_id);
CREATE INDEX idx_content_library_type ON gv_content_library(content_type);
CREATE INDEX idx_content_library_goal ON gv_content_library(content_goal);
CREATE INDEX idx_content_library_status ON gv_content_library(publish_status);
CREATE INDEX idx_content_library_created ON gv_content_library(created_at DESC);


-- ============================================================================
-- 3. CONTENT PERFORMANCE ANALYTICS
-- ============================================================================

CREATE TABLE gv_content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES gv_content_library(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Platform-specific metrics
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'twitter', 'youtube', 'reddit', 'medium', 'blog')),

  -- Engagement metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,

  -- Goal achievement
  goal_achieved BOOLEAN DEFAULT FALSE,
  goal_score DECIMAL(5, 2),

  -- Sentiment analysis
  positive_comments INTEGER DEFAULT 0,
  negative_comments INTEGER DEFAULT 0,
  neutral_comments INTEGER DEFAULT 0,
  overall_sentiment DECIMAL(3, 2),

  -- Timestamps
  tracked_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_performance_content ON gv_content_performance(content_id);
CREATE INDEX idx_content_performance_platform ON gv_content_performance(platform);


-- ============================================================================
-- 4. BRAND VOICE GUIDELINES (Learning System)
-- ============================================================================

CREATE TABLE gv_brand_voice_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Voice attributes
  tone TEXT NOT NULL,
  language_style TEXT,

  -- Writing rules
  do_phrases TEXT[],
  dont_phrases TEXT[],

  -- Brand personality
  personality_traits TEXT[],
  values TEXT[],

  -- Content preferences
  preferred_content_length TEXT,
  preferred_hashtag_count INTEGER DEFAULT 5,
  emoji_usage TEXT CHECK (emoji_usage IN ('none', 'minimal', 'moderate', 'frequent')),

  -- Learning data
  total_content_generated INTEGER DEFAULT 0,
  user_approval_rate DECIMAL(5, 2),
  avg_edit_percentage DECIMAL(5, 2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id)
);

CREATE INDEX idx_brand_voice_brand ON gv_brand_voice_guidelines(brand_id);


-- ============================================================================
-- 5. CONTENT TEMPLATES (Reusable Structures)
-- ============================================================================

CREATE TABLE gv_content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Template metadata
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('article', 'image', 'video')),
  template_category TEXT,

  -- Template structure
  prompt_template TEXT NOT NULL,

  -- Platform optimization rules
  platform_rules JSONB,

  -- Usage stats
  times_used INTEGER DEFAULT 0,
  avg_performance_score DECIMAL(5, 2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_templates_type ON gv_content_templates(template_type);
CREATE INDEX idx_content_templates_category ON gv_content_templates(template_category);


-- ============================================================================
-- 6. PLATFORM PUBLISHING LOGS
-- ============================================================================

CREATE TABLE gv_platform_publishing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES gv_content_library(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Publishing details
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  platform_url TEXT,

  -- Status
  publish_status TEXT CHECK (publish_status IN ('scheduled', 'publishing', 'published', 'failed')),
  error_message TEXT,

  -- API response
  api_response JSONB,

  -- Timestamps
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_publishing_logs_content ON gv_platform_publishing_logs(content_id);
CREATE INDEX idx_publishing_logs_platform ON gv_platform_publishing_logs(platform);
CREATE INDEX idx_publishing_logs_status ON gv_platform_publishing_logs(publish_status);


-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Content Queue
ALTER TABLE gv_content_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand content queue"
  ON gv_content_queue FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Content Library
ALTER TABLE gv_content_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand content library"
  ON gv_content_library FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Content Performance
ALTER TABLE gv_content_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand content performance"
  ON gv_content_performance FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Brand Voice Guidelines
ALTER TABLE gv_brand_voice_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand voice guidelines"
  ON gv_brand_voice_guidelines FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Content Templates
ALTER TABLE gv_content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access templates"
  ON gv_content_templates FOR SELECT
  USING (
    brand_id IS NULL OR brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own brand templates"
  ON gv_content_templates FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Publishing Logs
ALTER TABLE gv_platform_publishing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand publishing logs"
  ON gv_platform_publishing_logs FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );


-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_content_library_updated_at
  BEFORE UPDATE ON gv_content_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_voice_updated_at
  BEFORE UPDATE ON gv_brand_voice_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at
  BEFORE UPDATE ON gv_content_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get content quota remaining for brand
CREATE OR REPLACE FUNCTION get_content_quota_remaining(p_brand_id UUID)
RETURNS TABLE(
  articles_remaining INTEGER,
  images_remaining INTEGER,
  videos_remaining INTEGER
) AS $$
DECLARE
  v_limits RECORD;
  v_usage RECORD;
BEGIN
  -- Get tier limits
  SELECT * INTO v_limits FROM get_tier_limits(p_brand_id);

  -- Get current usage
  SELECT
    content_articles,
    content_images,
    content_videos
  INTO v_usage
  FROM gv_tier_usage
  WHERE brand_id = p_brand_id
    AND usage_month = DATE_TRUNC('month', NOW());

  -- If no usage record exists, create one
  IF NOT FOUND THEN
    INSERT INTO gv_tier_usage (brand_id, keywords_limit, insights_limit)
    SELECT p_brand_id, v_limits.keywords_limit, v_limits.insights_limit;

    v_usage.content_articles := 0;
    v_usage.content_images := 0;
    v_usage.content_videos := 0;
  END IF;

  RETURN QUERY SELECT
    GREATEST(0, v_limits.articles_limit - COALESCE(v_usage.content_articles, 0)),
    GREATEST(0, v_limits.images_limit - COALESCE(v_usage.content_images, 0)),
    GREATEST(0, v_limits.videos_limit - COALESCE(v_usage.content_videos, 0));
END;
$$ LANGUAGE plpgsql;


-- Function: Increment content usage
CREATE OR REPLACE FUNCTION increment_content_usage(
  p_brand_id UUID,
  p_content_type TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO gv_tier_usage (brand_id, keywords_limit, insights_limit)
  SELECT p_brand_id, keywords_limit, insights_limit
  FROM get_tier_limits(p_brand_id)
  ON CONFLICT (brand_id, usage_month) DO NOTHING;

  UPDATE gv_tier_usage
  SET
    content_articles = CASE WHEN p_content_type = 'article' THEN content_articles + 1 ELSE content_articles END,
    content_images = CASE WHEN p_content_type = 'image' THEN content_images + 1 ELSE content_images END,
    content_videos = CASE WHEN p_content_type = 'video' THEN content_videos + 1 ELSE content_videos END
  WHERE brand_id = p_brand_id
    AND usage_month = DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;
