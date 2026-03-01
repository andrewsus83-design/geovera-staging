-- ============================================================
-- Update plan quotas to match advertised features
-- Basic:   3 tasks/day,  10 images/day, 0 videos/day
-- Premium: 6 tasks/day,  15 images/day, 1 video/day
-- Partner: 12 tasks/day, 30 images/day, 3 videos/day
-- ============================================================

-- Update get_tier_limits: articles_limit = tasks/day, images_limit, videos_limit
CREATE OR REPLACE FUNCTION get_tier_limits(p_brand_id UUID)
RETURNS TABLE(
  keywords_limit INTEGER,
  insights_limit INTEGER,
  articles_limit INTEGER,
  images_limit  INTEGER,
  videos_limit  INTEGER
) AS $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM gv_brands
  WHERE id = p_brand_id;

  CASE v_tier
    WHEN 'basic' THEN
      RETURN QUERY SELECT 5, 8, 3, 10, 0;
    WHEN 'premium' THEN
      RETURN QUERY SELECT 8, 10, 6, 15, 1;
    WHEN 'partner' THEN
      RETURN QUERY SELECT 15, 12, 12, 30, 3;
    ELSE
      RETURN QUERY SELECT 5, 8, 3, 10, 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Update get_hub_daily_quota: daily_limit = tasks/day per tier
CREATE OR REPLACE FUNCTION get_hub_daily_quota(p_brand_id UUID)
RETURNS TABLE (
  daily_limit        INTEGER,
  articles_generated INTEGER,
  remaining_quota    INTEGER
) AS $$
DECLARE
  v_tier  TEXT;
  v_limit INTEGER;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM brands
  WHERE id = p_brand_id;

  v_limit := CASE v_tier
    WHEN 'basic'   THEN 3
    WHEN 'premium' THEN 6
    WHEN 'partner' THEN 12
    ELSE 3
  END;

  INSERT INTO gv_hub_daily_quotas (brand_id, quota_date, subscription_tier, daily_limit)
  VALUES (p_brand_id, CURRENT_DATE, v_tier, v_limit)
  ON CONFLICT (brand_id, quota_date)
  DO UPDATE SET daily_limit = EXCLUDED.daily_limit;

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
