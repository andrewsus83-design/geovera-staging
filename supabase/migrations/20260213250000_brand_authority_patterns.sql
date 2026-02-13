-- ============================================================
-- Migration: Brand Authority Learning Patterns
-- Date: 2026-02-13 25:00:00
-- Purpose: Store Claude-learned patterns for content filtering
-- ============================================================

-- ============================================================
-- BRAND AUTHORITY PATTERNS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_brand_authority_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  authority_signals JSONB NOT NULL DEFAULT '{
    "keywords": [],
    "content_types": [],
    "quality_indicators": [],
    "engagement_patterns": []
  }',
  noise_signals JSONB NOT NULL DEFAULT '{
    "keywords": [],
    "content_types": [],
    "low_value_patterns": []
  }',
  filtering_rules JSONB NOT NULL DEFAULT '[]',
  sample_size INTEGER NOT NULL DEFAULT 0,
  confidence_score NUMERIC(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  learned_from_content_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  model_used TEXT DEFAULT 'claude-3-5-sonnet-20241022',
  learning_cost_usd NUMERIC(10,4) DEFAULT 0.0,
  learned_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_brand_authority_category ON gv_brand_authority_patterns(category);
CREATE INDEX idx_brand_authority_active ON gv_brand_authority_patterns(is_active, expires_at)
  WHERE is_active = true;
CREATE INDEX idx_brand_authority_learned_at ON gv_brand_authority_patterns(learned_at DESC);

-- Only one active pattern per category at a time
CREATE UNIQUE INDEX idx_brand_authority_unique_active
  ON gv_brand_authority_patterns(category)
  WHERE is_active = true;

COMMENT ON TABLE gv_brand_authority_patterns IS 'Claude-learned patterns for identifying brand authority signals vs noise';
COMMENT ON COLUMN gv_brand_authority_patterns.authority_signals IS 'Patterns that indicate high-quality, authority-building content';
COMMENT ON COLUMN gv_brand_authority_patterns.noise_signals IS 'Patterns that indicate low-value or irrelevant content';
COMMENT ON COLUMN gv_brand_authority_patterns.filtering_rules IS 'Actionable rules for content filtering with confidence scores';
COMMENT ON COLUMN gv_brand_authority_patterns.confidence_score IS 'Overall confidence in learned patterns (0-1)';
COMMENT ON COLUMN gv_brand_authority_patterns.expires_at IS 'Patterns expire after 30 days (re-learn monthly)';

-- ============================================================
-- HELPER FUNCTION: Get active patterns for category
-- ============================================================
CREATE OR REPLACE FUNCTION get_active_authority_patterns(p_category TEXT)
RETURNS gv_brand_authority_patterns AS $$
DECLARE
  active_pattern gv_brand_authority_patterns;
BEGIN
  SELECT * INTO active_pattern
  FROM gv_brand_authority_patterns
  WHERE category = p_category
    AND is_active = true
    AND expires_at > now()
  ORDER BY learned_at DESC
  LIMIT 1;

  RETURN active_pattern;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- HELPER FUNCTION: Expire old patterns for category
-- ============================================================
CREATE OR REPLACE FUNCTION expire_old_authority_patterns(p_category TEXT)
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE gv_brand_authority_patterns
  SET is_active = false,
      updated_at = now()
  WHERE category = p_category
    AND is_active = true
    AND expires_at <= now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_brand_authority_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brand_authority_patterns_updated_at
  BEFORE UPDATE ON gv_brand_authority_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_authority_patterns_updated_at();

-- ============================================================
-- PERMISSIONS
-- ============================================================
GRANT SELECT ON gv_brand_authority_patterns TO authenticated;
GRANT ALL ON gv_brand_authority_patterns TO service_role;

-- ============================================================
-- Migration complete
-- ============================================================
