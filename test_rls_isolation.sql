-- ============================================================
-- RLS ISOLATION TEST - Verify users can't see each other's data
-- ============================================================

-- This script tests that Row Level Security properly isolates data between users
-- Run this after creating 2 test users and brands for each

-- ============================================================
-- SETUP TEST DATA (Run as service role)
-- ============================================================

-- Test User 1: alice@test.com (will be created via auth UI)
-- Test User 2: bob@test.com (will be created via auth UI)

-- Insert test brands for User 1 (replace USER_1_UUID with actual auth.uid())
-- INSERT INTO brands (id, name, domain, industry)
-- VALUES ('brand-alice-1', 'Alice Brand', 'alice.com', 'Tech');
-- INSERT INTO user_brands (user_id, brand_id, role)
-- VALUES ('USER_1_UUID', 'brand-alice-1', 'owner');

-- Insert test brands for User 2 (replace USER_2_UUID with actual auth.uid())
-- INSERT INTO brands (id, name, domain, industry)
-- VALUES ('brand-bob-1', 'Bob Brand', 'bob.com', 'Finance');
-- INSERT INTO user_brands (user_id, brand_id, role)
-- VALUES ('USER_2_UUID', 'brand-bob-1', 'owner');

-- ============================================================
-- TEST 1: Users can only see their own brands
-- ============================================================

-- Run as User 1 (Alice):
-- Expected: Should see 1 brand (Alice Brand)
SELECT
  'TEST 1 - User 1 Brands' as test_name,
  COUNT(*) as brand_count,
  CASE
    WHEN COUNT(*) = 1 THEN '✅ PASS'
    ELSE '❌ FAIL - Should see exactly 1 brand'
  END as result
FROM brands
WHERE id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid());

-- Run as User 2 (Bob):
-- Expected: Should see 1 brand (Bob Brand)
-- Same query, different user context

-- ============================================================
-- TEST 2: Users can only see their own gv_brands data
-- ============================================================

-- Run as User 1:
SELECT
  'TEST 2 - User 1 gv_brands' as test_name,
  COUNT(*) as brand_count,
  CASE
    WHEN COUNT(*) = 1 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as result
FROM gv_brands
WHERE id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid());

-- ============================================================
-- TEST 3: Cross-user data access should fail
-- ============================================================

-- Run as User 1 trying to access User 2's data:
-- This should return 0 rows
SELECT
  'TEST 3 - Cross-user access prevention' as test_name,
  COUNT(*) as accessible_brands,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS - Cannot see other user data'
    ELSE '❌ FAIL - Can see other user data! CRITICAL SECURITY ISSUE!'
  END as result
FROM brands
WHERE name = 'Bob Brand'; -- User 1 trying to see User 2's brand

-- ============================================================
-- TEST 4: Hub Collections isolation
-- ============================================================

-- Insert test hub collection for User 1
-- INSERT INTO gv_hub_collections (id, brand_id, category, title)
-- VALUES (gen_random_uuid(), 'brand-alice-1', 'tech', 'Alice Collection');

-- Insert test hub collection for User 2
-- INSERT INTO gv_hub_collections (id, brand_id, category, title)
-- VALUES (gen_random_uuid(), 'brand-bob-1', 'finance', 'Bob Collection');

-- Run as User 1:
SELECT
  'TEST 4 - Hub Collections isolation' as test_name,
  COUNT(*) as collection_count,
  CASE
    WHEN COUNT(*) = 1 AND MAX(title) = 'Alice Collection' THEN '✅ PASS'
    ELSE '❌ FAIL - Data leakage detected'
  END as result
FROM gv_hub_collections;

-- ============================================================
-- TEST 5: Partner tier access control
-- ============================================================

-- Test that only Partner tier users can access creator data
-- Set User 1 to Free tier, User 2 to Partner tier

-- Run as User 1 (Free tier):
SELECT
  'TEST 5a - Free tier creator access' as test_name,
  COUNT(*) as creator_count,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS - Free tier blocked'
    ELSE '❌ FAIL - Free tier should not access creators'
  END as result
FROM gv_creators
LIMIT 1;

-- Run as User 2 (Partner tier):
-- Expected: Can access creators
SELECT
  'TEST 5b - Partner tier creator access' as test_name,
  CASE
    WHEN EXISTS(SELECT 1 FROM gv_creators LIMIT 1) THEN '✅ PASS - Partner can access'
    ELSE '❌ FAIL - Partner should access creators'
  END as result;

-- ============================================================
-- TEST 6: Anonymous access should be blocked
-- ============================================================

-- Run as anonymous user (not logged in):
-- Expected: 0 rows for all brand-scoped tables
SELECT
  'TEST 6 - Anonymous access blocked' as test_name,
  COUNT(*) as brand_count,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS - Anonymous blocked'
    ELSE '❌ FAIL - Anonymous can access data!'
  END as result
FROM brands;

-- ============================================================
-- TEST 7: Service role can access everything
-- ============================================================

-- Run as service_role:
SELECT
  'TEST 7 - Service role access' as test_name,
  COUNT(*) as total_brands,
  CASE
    WHEN COUNT(*) >= 2 THEN '✅ PASS - Service role has full access'
    ELSE '❌ FAIL'
  END as result
FROM brands;

-- ============================================================
-- COMPREHENSIVE VERIFICATION
-- ============================================================

-- Run this to verify all tables have proper RLS
SELECT
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count,
  CASE
    WHEN NOT rowsecurity THEN '❌ RLS DISABLED'
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) = 0 THEN '⚠️ NO POLICIES'
    ELSE '✅ SECURED'
  END as status
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename LIKE 'gv_%'
ORDER BY
  CASE
    WHEN NOT rowsecurity THEN 1
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) = 0 THEN 2
    ELSE 3
  END,
  tablename;

-- ============================================================
-- FINAL VERIFICATION QUERY
-- ============================================================

-- This query MUST return insecure_count = 0
SELECT
  COUNT(*) FILTER (WHERE NOT rowsecurity) as tables_without_rls,
  COUNT(*) FILTER (WHERE rowsecurity AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) = 0) as tables_without_policies,
  COUNT(*) FILTER (WHERE rowsecurity AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) > 0) as secured_tables,
  CASE
    WHEN COUNT(*) FILTER (WHERE NOT rowsecurity OR (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) = 0) = 0
    THEN '✅ ALL TABLES SECURED'
    ELSE '❌ SECURITY GAPS EXIST'
  END as overall_status
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename LIKE 'gv_%';
