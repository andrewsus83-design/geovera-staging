-- ============================================================
-- Test Script: Tier-Based Scraping Frequencies
-- Purpose: Verify tier classification and update frequency logic
-- ============================================================

-- 1. Check current tier distribution
SELECT
  tier,
  COUNT(*) as creator_count,
  get_update_frequency_hours(tier) as update_frequency_hours,
  AVG(follower_count) as avg_followers,
  AVG(engagement_rate) as avg_engagement
FROM gv_creators
GROUP BY tier
ORDER BY CASE tier
  WHEN 'high' THEN 1
  WHEN 'medium' THEN 2
  WHEN 'low' THEN 3
END;

-- 2. View sample creators by tier
SELECT
  username,
  platform,
  tier,
  follower_count,
  engagement_rate,
  last_scraped_at,
  CASE
    WHEN last_scraped_at IS NULL THEN 'Never scraped'
    ELSE 'Scraped ' || ROUND(EXTRACT(EPOCH FROM (now() - last_scraped_at)) / 3600, 1) || ' hours ago'
  END as scrape_status
FROM gv_creators
ORDER BY tier, follower_count DESC
LIMIT 10;

-- 3. Test tier classification function
SELECT
  'High tier (500K followers, 4% engagement)' as test_case,
  classify_creator_tier(500000, 4.0) as result
UNION ALL
SELECT
  'High tier (150K followers, 6% engagement)',
  classify_creator_tier(150000, 6.0)
UNION ALL
SELECT
  'Medium tier (50K followers, 3% engagement)',
  classify_creator_tier(50000, 3.0)
UNION ALL
SELECT
  'Low tier (5K followers, 2% engagement)',
  classify_creator_tier(5000, 2.0);

-- 4. Get creators due for scraping (all categories)
SELECT
  id,
  username,
  platform,
  tier,
  follower_count,
  last_scraped_at,
  update_frequency_hours,
  CASE
    WHEN last_scraped_at IS NULL THEN 'Never scraped - needs immediate update'
    WHEN hours_since_scrape >= update_frequency_hours THEN 'Overdue by ' || ROUND(hours_since_scrape - update_frequency_hours, 1) || ' hours'
    ELSE 'Due now'
  END as status
FROM get_creators_due_for_scraping(NULL, 20);

-- 5. Test creator_needs_update function
-- (This will show TRUE for creators that need scraping)
SELECT
  id,
  username,
  tier,
  last_scraped_at,
  creator_needs_update(id) as needs_update,
  get_update_frequency_hours(tier) as frequency_hours
FROM gv_creators
ORDER BY tier, username
LIMIT 10;

-- 6. Calculate next update times for recently scraped creators
SELECT
  username,
  tier,
  last_scraped_at,
  calculate_next_update_at(tier, COALESCE(last_scraped_at, now())) as next_update_at,
  get_update_frequency_hours(tier) as frequency_hours
FROM gv_creators
WHERE last_scraped_at IS NOT NULL
ORDER BY last_scraped_at DESC
LIMIT 5;

-- 7. Simulate updating a creator and check tier recalculation
-- Update a creator's follower count to trigger tier recalculation
-- (Uncomment to test)
-- UPDATE gv_creators
-- SET follower_count = 150000, engagement_rate = 6.5
-- WHERE username = 'beautyinfluencer1';

-- 8. View processing queue with next update times
SELECT
  id,
  job_type,
  status,
  creator_id,
  next_update_at,
  CASE
    WHEN next_update_at IS NULL THEN 'Not scheduled'
    WHEN next_update_at > now() THEN 'Scheduled in ' || ROUND(EXTRACT(EPOCH FROM (next_update_at - now())) / 3600, 1) || ' hours'
    ELSE 'Overdue by ' || ROUND(EXTRACT(EPOCH FROM (now() - next_update_at)) / 3600, 1) || ' hours'
  END as schedule_status
FROM gv_radar_processing_queue
WHERE job_type = 'scrape_content'
ORDER BY next_update_at NULLS LAST
LIMIT 10;
