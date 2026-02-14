-- ============================================================================
-- GEOVERA - CONTENT TRAINING SYSTEM
-- Research Model Training for Brand-Consistent Visual Content Generation
-- ============================================================================

-- ============================================================================
-- 1. CONTENT TRAINING DATA (Successful Examples Storage)
-- ============================================================================

CREATE TABLE gv_content_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Training content metadata
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video')),
  training_source TEXT NOT NULL CHECK (training_source IN ('user_upload', 'generated_approved', 'external_example')),

  -- File storage
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_kb INTEGER,
  file_format TEXT,

  -- Content analysis results (populated by analyze-visual-content)
  visual_analysis JSONB,

  -- Analysis scores
  quality_score DECIMAL(3, 2),
  brand_consistency_score DECIMAL(3, 2),
  composition_score DECIMAL(3, 2),

  -- Extracted patterns (for learning)
  dominant_colors TEXT[],
  color_palette JSONB,
  visual_style_tags TEXT[],
  composition_type TEXT,

  -- Content description (user-provided or AI-extracted)
  title TEXT,
  description TEXT,
  tags TEXT[],

  -- Training usage
  times_referenced INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  approved_for_training BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_data_brand ON gv_content_training_data(brand_id);
CREATE INDEX idx_training_data_type ON gv_content_training_data(content_type);
CREATE INDEX idx_training_data_active ON gv_content_training_data(is_active);
CREATE INDEX idx_training_data_created ON gv_content_training_data(created_at DESC);


-- ============================================================================
-- 2. BRAND VISUAL GUIDELINES (Visual Identity & Style)
-- ============================================================================

CREATE TABLE gv_brand_visual_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Color palette (primary, secondary, accent)
  primary_colors TEXT[] DEFAULT '{}',
  secondary_colors TEXT[] DEFAULT '{}',
  accent_colors TEXT[] DEFAULT '{}',
  color_palette_json JSONB,

  -- Typography (for text overlays)
  primary_font TEXT,
  secondary_font TEXT,
  font_styles TEXT[],

  -- Visual style attributes
  visual_style TEXT CHECK (visual_style IN ('minimal', 'bold', 'elegant', 'playful', 'corporate', 'artistic', 'modern', 'vintage')),
  visual_mood TEXT[] DEFAULT '{}',
  composition_preferences TEXT[] DEFAULT '{}',

  -- Image/video specific guidelines
  preferred_image_style TEXT,
  preferred_video_style TEXT,
  lighting_preference TEXT,
  background_preference TEXT,

  -- Prompt templates (generated from training)
  image_prompt_template TEXT,
  video_prompt_template TEXT,
  style_keywords TEXT[] DEFAULT '{}',
  negative_keywords TEXT[] DEFAULT '{}',

  -- Learning metrics
  total_training_examples INTEGER DEFAULT 0,
  last_trained_at TIMESTAMPTZ,
  model_version INTEGER DEFAULT 1,
  confidence_score DECIMAL(3, 2),

  -- Training status
  training_status TEXT DEFAULT 'untrained' CHECK (training_status IN ('untrained', 'training', 'trained', 'needs_update')),
  training_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id)
);

CREATE INDEX idx_visual_guidelines_brand ON gv_brand_visual_guidelines(brand_id);
CREATE INDEX idx_visual_guidelines_status ON gv_brand_visual_guidelines(training_status);


-- ============================================================================
-- 3. CONTENT FEEDBACK LOOP (User Ratings & Corrections)
-- ============================================================================

CREATE TABLE gv_content_feedback_loop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content_id UUID NOT NULL REFERENCES gv_content_library(id) ON DELETE CASCADE,

  -- Feedback metadata
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'image', 'video')),

  -- User rating (1-5 stars)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Specific feedback
  feedback_text TEXT,
  improvement_suggestions TEXT,

  -- What was wrong? (for ratings < 3)
  issues_reported TEXT[] DEFAULT '{}',

  -- Specific aspect ratings
  brand_consistency_rating INTEGER CHECK (brand_consistency_rating >= 1 AND brand_consistency_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  relevance_rating INTEGER CHECK (relevance_rating >= 1 AND relevance_rating <= 5),

  -- Did user regenerate?
  was_regenerated BOOLEAN DEFAULT FALSE,
  regeneration_count INTEGER DEFAULT 0,

  -- Did user edit/modify?
  was_edited BOOLEAN DEFAULT FALSE,
  edit_percentage INTEGER,

  -- Learning signal (how this affects future generations)
  learning_weight DECIMAL(3, 2) DEFAULT 1.0,
  applied_to_model BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_brand ON gv_content_feedback_loop(brand_id);
CREATE INDEX idx_feedback_content ON gv_content_feedback_loop(content_id);
CREATE INDEX idx_feedback_rating ON gv_content_feedback_loop(rating);
CREATE INDEX idx_feedback_created ON gv_content_feedback_loop(created_at DESC);


-- ============================================================================
-- 4. VISUAL STYLE PATTERNS (ML Learning Patterns)
-- ============================================================================

CREATE TABLE gv_visual_style_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Pattern metadata
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('color_harmony', 'composition', 'lighting', 'style', 'mood', 'object_placement')),
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video')),

  -- Pattern data
  pattern_name TEXT NOT NULL,
  pattern_description TEXT,
  pattern_data JSONB NOT NULL,

  -- Pattern strength (how often this appears in training data)
  occurrence_count INTEGER DEFAULT 1,
  confidence_score DECIMAL(3, 2),

  -- Performance tracking
  times_used INTEGER DEFAULT 0,
  avg_user_rating DECIMAL(3, 2),
  success_rate DECIMAL(3, 2),

  -- Learning metadata
  learned_from_examples TEXT[],
  reinforcement_score DECIMAL(5, 2) DEFAULT 0,

  -- Pattern status
  is_active BOOLEAN DEFAULT TRUE,
  is_validated BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_style_patterns_brand ON gv_visual_style_patterns(brand_id);
CREATE INDEX idx_style_patterns_type ON gv_visual_style_patterns(pattern_type);
CREATE INDEX idx_style_patterns_content_type ON gv_visual_style_patterns(content_type);
CREATE INDEX idx_style_patterns_active ON gv_visual_style_patterns(is_active);
CREATE INDEX idx_style_patterns_confidence ON gv_visual_style_patterns(confidence_score DESC);


-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Training Data
ALTER TABLE gv_content_training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand training data"
  ON gv_content_training_data FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Visual Guidelines
ALTER TABLE gv_brand_visual_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand visual guidelines"
  ON gv_brand_visual_guidelines FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Feedback Loop
ALTER TABLE gv_content_feedback_loop ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand feedback"
  ON gv_content_feedback_loop FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Style Patterns
ALTER TABLE gv_visual_style_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand style patterns"
  ON gv_visual_style_patterns FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );


-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_training_data_updated_at
  BEFORE UPDATE ON gv_content_training_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visual_guidelines_updated_at
  BEFORE UPDATE ON gv_brand_visual_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_loop_updated_at
  BEFORE UPDATE ON gv_content_feedback_loop
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_style_patterns_updated_at
  BEFORE UPDATE ON gv_visual_style_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get brand training status
CREATE OR REPLACE FUNCTION get_brand_training_status(p_brand_id UUID)
RETURNS TABLE(
  is_trained BOOLEAN,
  training_examples_count INTEGER,
  last_trained_at TIMESTAMPTZ,
  confidence_score DECIMAL(3, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(vg.training_status = 'trained', FALSE) as is_trained,
    COALESCE(vg.total_training_examples, 0) as training_examples_count,
    vg.last_trained_at,
    COALESCE(vg.confidence_score, 0.0) as confidence_score
  FROM gv_brand_visual_guidelines vg
  WHERE vg.brand_id = p_brand_id;

  -- If no record exists, return defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, NULL::TIMESTAMPTZ, 0.0::DECIMAL(3, 2);
  END IF;
END;
$$ LANGUAGE plpgsql;


-- Function: Update pattern success metrics
CREATE OR REPLACE FUNCTION update_pattern_success_metrics(
  p_pattern_id UUID,
  p_user_rating INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE gv_visual_style_patterns
  SET
    times_used = times_used + 1,
    avg_user_rating = COALESCE(
      (avg_user_rating * (times_used - 1) + p_user_rating) / times_used,
      p_user_rating
    ),
    success_rate = CASE
      WHEN p_user_rating >= 4 THEN COALESCE((success_rate * (times_used - 1) + 100) / times_used, 100)
      WHEN p_user_rating >= 3 THEN COALESCE((success_rate * (times_used - 1) + 50) / times_used, 50)
      ELSE COALESCE((success_rate * (times_used - 1) + 0) / times_used, 0)
    END,
    last_used_at = NOW()
  WHERE id = p_pattern_id;
END;
$$ LANGUAGE plpgsql;


-- Function: Calculate brand consistency score
CREATE OR REPLACE FUNCTION calculate_brand_consistency_score(
  p_brand_id UUID,
  p_dominant_colors TEXT[],
  p_visual_style_tags TEXT[]
)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
  v_brand_colors TEXT[];
  v_brand_styles TEXT[];
  v_color_match_score DECIMAL(3, 2);
  v_style_match_score DECIMAL(3, 2);
  v_final_score DECIMAL(3, 2);
BEGIN
  -- Get brand visual guidelines
  SELECT
    primary_colors || secondary_colors || accent_colors,
    style_keywords
  INTO v_brand_colors, v_brand_styles
  FROM gv_brand_visual_guidelines
  WHERE brand_id = p_brand_id;

  -- If no guidelines exist, return neutral score
  IF NOT FOUND THEN
    RETURN 0.50;
  END IF;

  -- Calculate color matching score (0-1)
  SELECT COALESCE(
    COUNT(DISTINCT color) FILTER (WHERE color = ANY(v_brand_colors)) * 1.0 /
    NULLIF(array_length(p_dominant_colors, 1), 0),
    0.0
  )
  INTO v_color_match_score
  FROM unnest(p_dominant_colors) AS color;

  -- Calculate style matching score (0-1)
  SELECT COALESCE(
    COUNT(DISTINCT style) FILTER (WHERE style = ANY(v_brand_styles)) * 1.0 /
    NULLIF(array_length(p_visual_style_tags, 1), 0),
    0.0
  )
  INTO v_style_match_score
  FROM unnest(p_visual_style_tags) AS style;

  -- Weighted average (colors 60%, styles 40%)
  v_final_score := (v_color_match_score * 0.6) + (v_style_match_score * 0.4);

  RETURN LEAST(1.0, v_final_score);
END;
$$ LANGUAGE plpgsql;


-- Function: Get recommended style patterns for generation
CREATE OR REPLACE FUNCTION get_recommended_style_patterns(
  p_brand_id UUID,
  p_content_type TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  pattern_id UUID,
  pattern_type TEXT,
  pattern_name TEXT,
  pattern_data JSONB,
  confidence_score DECIMAL(3, 2),
  success_rate DECIMAL(3, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    vsp.pattern_type,
    pattern_name,
    vsp.pattern_data,
    vsp.confidence_score,
    vsp.success_rate
  FROM gv_visual_style_patterns vsp
  WHERE vsp.brand_id = p_brand_id
    AND vsp.content_type = p_content_type
    AND vsp.is_active = TRUE
    AND vsp.is_validated = TRUE
  ORDER BY
    vsp.confidence_score DESC,
    vsp.success_rate DESC,
    vsp.times_used DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Function: Record content feedback
CREATE OR REPLACE FUNCTION record_content_feedback(
  p_brand_id UUID,
  p_user_id UUID,
  p_content_id UUID,
  p_rating INTEGER,
  p_feedback_text TEXT DEFAULT NULL,
  p_issues_reported TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_feedback_id UUID;
  v_content_type TEXT;
BEGIN
  -- Get content type
  SELECT content_type INTO v_content_type
  FROM gv_content_library
  WHERE id = p_content_id;

  -- Insert feedback
  INSERT INTO gv_content_feedback_loop (
    brand_id,
    user_id,
    content_id,
    content_type,
    rating,
    feedback_text,
    issues_reported
  )
  VALUES (
    p_brand_id,
    p_user_id,
    p_content_id,
    v_content_type,
    p_rating,
    p_feedback_text,
    p_issues_reported
  )
  RETURNING id INTO v_feedback_id;

  RETURN v_feedback_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- INITIAL SETUP
-- ============================================================================

-- Create default visual guidelines for existing brands
INSERT INTO gv_brand_visual_guidelines (brand_id, training_status)
SELECT id, 'untrained'
FROM gv_brands
ON CONFLICT (brand_id) DO NOTHING;
