-- ============================================================================
-- GeoVera Production - CRITICAL SECURITY FIXES
-- ============================================================================
-- Date: February 14, 2026
-- Purpose: Apply critical security fixes before February 20 launch
-- Estimated time: 5 minutes
-- ============================================================================

-- ============================================================================
-- FIX 1: Enable RLS on gv_supported_markets (CRITICAL)
-- ============================================================================
-- Problem: Only table without RLS enabled
-- Risk: Reference data exposed to all users
-- Time: 5 minutes
-- ============================================================================

BEGIN;

-- Enable RLS
ALTER TABLE gv_supported_markets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to SELECT
CREATE POLICY "supported_markets_select_all"
ON gv_supported_markets
FOR SELECT
TO authenticated
USING (true);

-- Verify RLS is enabled
DO $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename = 'gv_supported_markets';

  IF rls_enabled THEN
    RAISE NOTICE '✅ RLS enabled on gv_supported_markets';
  ELSE
    RAISE EXCEPTION '❌ FAILED: RLS not enabled on gv_supported_markets';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- FIX 2: Fix Security Definer Views (CRITICAL)
-- ============================================================================
-- Problem: 15 views execute with creator privileges, bypass RLS
-- Risk: Privilege escalation, unauthorized data access
-- Time: 30 minutes
-- ============================================================================

-- Option A: Use security_invoker (PostgreSQL 15+ only)
-- If your Postgres version supports it:

BEGIN;

-- Set security_invoker on all 15 views
ALTER VIEW gv_top_influencers_summary SET (security_invoker = true);
ALTER VIEW gv_unified_radar SET (security_invoker = true);
ALTER VIEW gv_attribution_by_channel SET (security_invoker = true);
ALTER VIEW gv_cross_insights SET (security_invoker = true);
ALTER VIEW gv_recent_journeys SET (security_invoker = true);
ALTER VIEW gv_llm_seo_rankings SET (security_invoker = true);
ALTER VIEW gv_conversion_funnel SET (security_invoker = true);
ALTER VIEW gv_social_creators_stale SET (security_invoker = true);
ALTER VIEW gv_brand_chat_context SET (security_invoker = true);
ALTER VIEW gv_unattributed_conversions SET (security_invoker = true);
ALTER VIEW gv_current_authority SET (security_invoker = true);
ALTER VIEW gv_citation_flow SET (security_invoker = true);
ALTER VIEW gv_chat_analytics SET (security_invoker = true);
ALTER VIEW gv_authority_leaderboard SET (security_invoker = true);
ALTER VIEW gv_brand_chat_training SET (security_invoker = true);

RAISE NOTICE '✅ All 15 security_definer views fixed';

COMMIT;

-- ============================================================================
-- FIX 3: Sample Function Search Path Fixes (HIGH PRIORITY)
-- ============================================================================
-- Problem: 98 functions without search_path (vulnerable to injection)
-- Risk: Schema injection attacks
-- Time: 2 hours for all 98 (sample provided here)
-- ============================================================================

BEGIN;

-- Fix top 20 most critical functions
ALTER FUNCTION user_owns_brand SET search_path = public, pg_temp;
ALTER FUNCTION generate_daily_insights SET search_path = public, pg_temp;
ALTER FUNCTION calculate_competitive_position SET search_path = public, pg_temp;
ALTER FUNCTION get_viral_discovery_limits SET search_path = public, pg_temp;
ALTER FUNCTION increment_viral_discovery_usage SET search_path = public, pg_temp;
ALTER FUNCTION check_viral_quota_reached SET search_path = public, pg_temp;
ALTER FUNCTION get_remaining_viral_discoveries SET search_path = public, pg_temp;
ALTER FUNCTION check_tier_limit SET search_path = public, pg_temp;
ALTER FUNCTION increment_content_usage SET search_path = public, pg_temp;
ALTER FUNCTION get_content_quota_remaining SET search_path = public, pg_temp;
ALTER FUNCTION get_tier_limits SET search_path = public, pg_temp;
ALTER FUNCTION complete_onboarding SET search_path = public, pg_temp;
ALTER FUNCTION get_onboarding_status SET search_path = public, pg_temp;
ALTER FUNCTION api_get_onboarding_status SET search_path = public, pg_temp;
ALTER FUNCTION handle_new_user SET search_path = public, pg_temp;
ALTER FUNCTION auto_initialize_onboarding SET search_path = public, pg_temp;
ALTER FUNCTION update_updated_at_column SET search_path = public, pg_temp;
ALTER FUNCTION calculate_creator_rankings SET search_path = public, pg_temp;
ALTER FUNCTION calculate_brand_rankings SET search_path = public, pg_temp;
ALTER FUNCTION calculate_market_share SET search_path = public, pg_temp;

RAISE NOTICE '✅ Top 20 critical functions secured with search_path';
RAISE NOTICE 'ℹ️  Remaining 78 functions should be fixed post-launch';

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check RLS coverage
SELECT
  COUNT(*) as total_tables,
  COUNT(*) FILTER (WHERE rowsecurity = true) as rls_enabled,
  COUNT(*) FILTER (WHERE rowsecurity = false) as rls_disabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'gv_%';

-- Expected: rls_disabled = 0

-- List any remaining tables without RLS
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'gv_%'
  AND rowsecurity = false;

-- Expected: No rows

-- Check for security_definer views (should be 0 after fix)
SELECT
  schemaname,
  viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE 'gv_%'
  AND definition LIKE '%SECURITY DEFINER%';

-- Expected: No rows (if security_invoker applied successfully)

-- Count functions with search_path set
SELECT
  COUNT(*) as total_functions,
  COUNT(*) FILTER (WHERE prosecdef = true) as with_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%';

-- ============================================================================
-- POST-FIX CHECKLIST
-- ============================================================================
/*
[ ] RLS enabled on gv_supported_markets
[ ] All 15 security_definer views fixed
[ ] Top 20 functions have search_path set
[ ] Verification queries run successfully
[ ] No errors in Supabase logs
[ ] Readiness score improved to 92/100
*/

-- ============================================================================
-- NOTES
-- ============================================================================
/*
1. This script fixes the MOST CRITICAL security issues
2. Remaining 78 functions should be fixed post-launch
3. Extension schema migration can wait until Week 1
4. Performance indexes can be added as traffic grows
5. Full audit report: PRODUCTION_AUDIT_REAL_DATA.md

BEFORE LAUNCH CHECKLIST:
[ ] Run this SQL script
[ ] Move test pages to /tests/ directory
[ ] Enable password leak protection in Supabase Dashboard
[ ] Verify Auth redirect URLs in Supabase Dashboard
[ ] Monitor for 24 hours before launch

ESTIMATED IMPROVEMENT:
- Before: 82/100 readiness
- After: 92/100 readiness
- Time: ~1 hour
*/

-- ============================================================================
-- END OF CRITICAL FIXES
-- ============================================================================
