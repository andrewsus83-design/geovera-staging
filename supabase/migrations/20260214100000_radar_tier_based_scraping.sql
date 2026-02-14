-- ============================================================
-- Migration: Radar Tier-Based Scraping Frequencies
-- Date: 2026-02-14 10:00:00
-- Purpose: Add tier-based update frequencies for creator scraping
--          - High tier: 24H (>100K followers OR engagement >5%)
--          - Medium tier: 48H (10K-100K followers)
--          - Low tier: 72H (<10K followers)
-- ============================================================

-- ============================================================
-- 1. ADD TIER COLUMN TO gv_creators
-- ============================================================
ALTER TABLE gv_creators
ADD COLUMN IF NOT EXISTS tier TEXT
CHECK (tier IN ('high', 'medium', 'low'))
DEFAULT 'medium';

ALTER TABLE gv_creators
ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_creators_tier ON gv_creators(tier);
CREATE INDEX IF NOT EXISTS idx_creators_last_scraped ON gv_creators(last_scraped_at);

COMMENT ON COLUMN gv_creators.tier IS 'Creator tier for update frequency: high (24H), medium (48H), low (72H)';
COMMENT ON COLUMN gv_creators.last_scraped_at IS 'Timestamp of last successful content scrape';

-- ============================================================
-- 2. ADD NEXT_UPDATE_AT TO gv_radar_processing_queue
-- ============================================================
ALTER TABLE gv_radar_processing_queue
ADD COLUMN IF NOT EXISTS next_update_at TIMESTAMPTZ;

ALTER TABLE gv_radar_processing_queue
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES gv_creators(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_radar_queue_next_update ON gv_radar_processing_queue(next_update_at);
CREATE INDEX IF NOT EXISTS idx_radar_queue_creator ON gv_radar_processing_queue(creator_id);

COMMENT ON COLUMN gv_radar_processing_queue.next_update_at IS 'Scheduled next update time based on creator tier';

-- ============================================================
-- 3. FUNCTION: CLASSIFY CREATOR TIER
-- ============================================================
CREATE OR REPLACE FUNCTION classify_creator_tier(
  p_follower_count INTEGER,
  p_engagement_rate NUMERIC
) RETURNS TEXT AS $$
BEGIN
  -- High tier: >100K followers OR engagement >5%
  IF p_follower_count > 100000 OR (p_engagement_rate IS NOT NULL AND p_engagement_rate > 5.0) THEN
    RETURN 'high';

  -- Medium tier: 10K-100K followers
  ELSIF p_follower_count >= 10000 AND p_follower_count <= 100000 THEN
    RETURN 'medium';

  -- Low tier: <10K followers
  ELSE
    RETURN 'low';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION classify_creator_tier IS 'Classifies creator tier based on followers and engagement rate';

-- ============================================================
-- 4. FUNCTION: GET UPDATE FREQUENCY (IN HOURS)
-- ============================================================
CREATE OR REPLACE FUNCTION get_update_frequency_hours(
  p_tier TEXT
) RETURNS INTEGER AS $$
BEGIN
  RETURN CASE p_tier
    WHEN 'high' THEN 24
    WHEN 'medium' THEN 48
    WHEN 'low' THEN 72
    ELSE 48  -- Default to medium
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_update_frequency_hours IS 'Returns update frequency in hours for a given tier';

-- ============================================================
-- 5. FUNCTION: CALCULATE NEXT UPDATE TIME
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_next_update_at(
  p_tier TEXT,
  p_last_scraped_at TIMESTAMPTZ DEFAULT now()
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_hours INTEGER;
BEGIN
  v_hours := get_update_frequency_hours(p_tier);
  RETURN p_last_scraped_at + (v_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_next_update_at IS 'Calculates next update timestamp based on tier and last scrape time';

-- ============================================================
-- 6. FUNCTION: CHECK IF CREATOR NEEDS UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION creator_needs_update(
  p_creator_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_last_scraped_at TIMESTAMPTZ;
  v_update_frequency_hours INTEGER;
BEGIN
  -- Get creator tier and last scrape time
  SELECT tier, last_scraped_at
  INTO v_tier, v_last_scraped_at
  FROM gv_creators
  WHERE id = p_creator_id;

  -- If never scraped, needs update
  IF v_last_scraped_at IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Get update frequency for tier
  v_update_frequency_hours := get_update_frequency_hours(v_tier);

  -- Check if enough time has passed
  RETURN (now() >= v_last_scraped_at + (v_update_frequency_hours || ' hours')::INTERVAL);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION creator_needs_update IS 'Returns TRUE if creator is due for content scraping based on tier frequency';

-- ============================================================
-- 7. AUTO-CLASSIFY EXISTING CREATORS
-- ============================================================
UPDATE gv_creators
SET tier = classify_creator_tier(
  COALESCE(follower_count, 0),
  engagement_rate
)
WHERE tier IS NULL OR tier = 'medium';  -- Update all or reset to recalculate

-- ============================================================
-- 8. TRIGGER: AUTO-UPDATE TIER ON FOLLOWER/ENGAGEMENT CHANGE
-- ============================================================
CREATE OR REPLACE FUNCTION update_creator_tier_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate tier when follower_count or engagement_rate changes
  IF (NEW.follower_count IS DISTINCT FROM OLD.follower_count) OR
     (NEW.engagement_rate IS DISTINCT FROM OLD.engagement_rate) THEN
    NEW.tier := classify_creator_tier(
      COALESCE(NEW.follower_count, 0),
      NEW.engagement_rate
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_creator_tier ON gv_creators;
CREATE TRIGGER trigger_update_creator_tier
  BEFORE UPDATE ON gv_creators
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_tier_trigger();

COMMENT ON TRIGGER trigger_update_creator_tier ON gv_creators IS 'Auto-updates creator tier when follower count or engagement rate changes';

-- ============================================================
-- 9. FUNCTION: GET CREATORS DUE FOR SCRAPING
-- ============================================================
CREATE OR REPLACE FUNCTION get_creators_due_for_scraping(
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  username TEXT,
  platform TEXT,
  tier TEXT,
  follower_count INTEGER,
  engagement_rate NUMERIC,
  last_scraped_at TIMESTAMPTZ,
  hours_since_scrape NUMERIC,
  update_frequency_hours INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.username,
    c.platform,
    c.tier,
    c.follower_count,
    c.engagement_rate,
    c.last_scraped_at,
    EXTRACT(EPOCH FROM (now() - c.last_scraped_at)) / 3600 AS hours_since_scrape,
    get_update_frequency_hours(c.tier) AS update_frequency_hours
  FROM gv_creators c
  WHERE
    c.status = 'active'
    AND (p_category IS NULL OR c.category = p_category)
    AND creator_needs_update(c.id) = TRUE
  ORDER BY
    -- Prioritize by tier (high first), then by how overdue
    CASE c.tier
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      ELSE 4
    END,
    c.last_scraped_at NULLS FIRST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_creators_due_for_scraping IS 'Returns creators that need content scraping based on tier frequency';

-- ============================================================
-- 10. GRANT PERMISSIONS
-- ============================================================
GRANT EXECUTE ON FUNCTION classify_creator_tier TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_update_frequency_hours TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION calculate_next_update_at TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION creator_needs_update TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_creators_due_for_scraping TO authenticated, service_role;

-- ============================================================
-- Migration complete
-- ============================================================
