# GeoVera Intelligence Platform - RLS Verification Checklist

## Row Level Security (RLS) Verification
**Status:** ✅ EXCELLENT (95/100 from audit)
**Date:** February 14, 2026

---

## Overview

According to the audit report, GeoVera has **excellent RLS coverage** with:
- 30+ tables with RLS enabled
- 104+ RLS policies across 6 migration files
- Proper user-scoped access control
- Brand-scoped data filtering through user_brands join table

---

## Critical Tables - RLS Status

### Core User & Brand Tables ✅
- [x] **brands** - SELECT, INSERT, UPDATE policies
- [x] **user_brands** - SELECT, INSERT policies
- [x] **customers** - SELECT, UPDATE policies

### Subscription & Billing Tables ✅
- [x] **gv_subscriptions** - SELECT policy
- [x] **gv_invoices** - SELECT policy

### Content & AI Tables ✅
- [x] **gv_brand_chronicle** - SELECT policy
- [x] **gv_raw_artifacts** - SELECT policy
- [x] **gv_ai_chat_sessions** - User-scoped policies
- [x] **gv_ai_conversations** - User-scoped policies
- [x] **gv_daily_briefs** - User-scoped policies
- [x] **gv_content_pieces** - User-scoped policies
- [x] **gv_training_collections** - User-scoped policies

### Radar Feature Tables ✅
- [x] **gv_creator_discovery** - User-scoped policies
- [x] **gv_market_benchmarks** - User-scoped policies

### Authority Hub Tables ✅
- [x] **gv_authority_citations** - User-scoped policies
- [x] **gv_content_patterns** - User-scoped policies

---

## RLS Policy Quality Checks

### ✅ Proper User Authentication
All policies correctly reference `auth.uid()` for user identification.

### ✅ Brand-Scoped Data Protection
Data is properly filtered through the `user_brands` join table:
```sql
-- Example pattern used throughout
WHERE EXISTS (
  SELECT 1 FROM user_brands
  WHERE user_brands.brand_id = table_name.brand_id
  AND user_brands.user_id = auth.uid()
)
```

### ✅ Proper CASCADE Rules
Foreign keys have proper CASCADE delete rules to maintain data integrity.

### ✅ Tier-Based Access Control
Subscription tier validation is enforced at the application level (Edge Functions).

---

## Manual Testing Checklist

To verify RLS policies work correctly in production, perform these tests:

### Test 1: User Isolation Test
**Goal:** Verify users cannot see each other's data

1. **Create User A:**
   ```
   Email: test-user-a@example.com
   Password: TestPass123!
   ```

2. **Create Brand A (as User A):**
   ```
   Brand Name: Test Brand A
   Category: Technology
   ```

3. **Create User B:**
   ```
   Email: test-user-b@example.com
   Password: TestPass123!
   ```

4. **Create Brand B (as User B):**
   ```
   Brand Name: Test Brand B
   Category: Finance
   ```

5. **Verify Isolation:**
   - Login as User A
   - Navigate to dashboard
   - Verify you ONLY see Brand A
   - Verify you CANNOT see Brand B

   - Login as User B
   - Navigate to dashboard
   - Verify you ONLY see Brand B
   - Verify you CANNOT see Brand A

### Test 2: Content Isolation Test
**Goal:** Verify content is properly scoped to brands

1. **As User A (Brand A):**
   - Create a content piece in Content Studio
   - Create an AI chat session
   - Create a training collection

2. **As User B (Brand B):**
   - Navigate to Content Studio
   - Verify you CANNOT see User A's content
   - Create your own content piece
   - Verify you ONLY see your own content

### Test 3: Subscription Data Test
**Goal:** Verify billing data is properly isolated

1. **As User A:**
   - Navigate to subscription/billing page
   - Verify you ONLY see your own subscription
   - Verify you ONLY see your own invoices

2. **As User B:**
   - Navigate to subscription/billing page
   - Verify you ONLY see your own subscription
   - Verify you CANNOT see User A's billing data

### Test 4: API Direct Access Test
**Goal:** Verify RLS blocks unauthorized API access

1. **Get User A's access token:**
   ```javascript
   // In browser console as User A
   const { data: { session } } = await sbClient.auth.getSession();
   console.log(session.access_token);
   ```

2. **Try to access User B's brand data:**
   ```bash
   # Get User B's brand_id from database
   # Try to query it with User A's token
   curl -X GET 'https://vozjwptzutolvkvfpknk.supabase.co/rest/v1/brands?id=eq.<USER_B_BRAND_ID>' \
     -H "apikey: <SUPABASE_ANON_KEY>" \
     -H "Authorization: Bearer <USER_A_TOKEN>"
   ```

3. **Expected Result:**
   - Query should return empty array or 403 forbidden
   - Should NOT return User B's brand data

### Test 5: Brand Association Test
**Goal:** Verify user_brands join table works correctly

1. **As Admin (if applicable):**
   - Add User A to Brand B (in database)
   - Login as User A
   - Verify User A can now see BOTH Brand A and Brand B

2. **Remove Association:**
   - Remove User A from Brand B
   - Login as User A
   - Verify User A can ONLY see Brand A again

---

## RLS Policy Verification Script

Use the Supabase SQL Editor to run these verification queries:

### Check RLS Status on All Tables
```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All tables should have `rowsecurity = true`

### Check Policy Count
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected:** Should return 104+ policies

### Test User Isolation Query
```sql
-- Run as authenticated user
-- Should only return brands associated with current user
SELECT b.*
FROM brands b
INNER JOIN user_brands ub ON ub.brand_id = b.id
WHERE ub.user_id = auth.uid();
```

---

## Common RLS Issues & Solutions

### Issue 1: "New row violates row-level security policy"
**Cause:** INSERT policy is too restrictive
**Solution:** Verify INSERT policies allow `auth.uid()` to insert their own data

### Issue 2: "No rows returned but data exists"
**Cause:** SELECT policy is filtering out the data
**Solution:** Verify user has proper association in `user_brands` table

### Issue 3: "Cannot update row"
**Cause:** UPDATE policy doesn't allow the operation
**Solution:** Verify UPDATE policies check for ownership via `auth.uid()`

### Issue 4: "RLS policy bypass via Edge Functions"
**Cause:** Edge Functions using service_role key
**Solution:** Ensure Edge Functions use anon key and pass user JWT token

---

## Security Best Practices

### ✅ Already Implemented:
1. RLS enabled on all user-facing tables
2. Policies reference `auth.uid()` for authentication
3. Brand-scoped data uses join table pattern
4. CASCADE delete rules maintain integrity

### 🔒 Additional Recommendations:
1. **Regular Audits:** Run RLS verification script monthly
2. **New Table Checklist:** Always enable RLS on new tables
3. **Policy Testing:** Test policies with multiple users before production
4. **Edge Function Security:** Always pass user JWT, never use service_role in client-facing functions
5. **Monitoring:** Set up alerts for RLS policy violations

---

## Emergency RLS Disable (ONLY FOR DEBUGGING)

If you need to temporarily disable RLS for debugging (DO NOT USE IN PRODUCTION):

```sql
-- Disable RLS on a specific table (USE WITH EXTREME CAUTION)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS (ALWAYS RE-ENABLE AFTER DEBUGGING)
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**WARNING:** NEVER disable RLS in production. Use Supabase logs to debug policy issues.

---

## RLS Verification Sign-Off

After completing all tests, sign off on RLS verification:

- [ ] Test 1: User Isolation Test - PASSED
- [ ] Test 2: Content Isolation Test - PASSED
- [ ] Test 3: Subscription Data Test - PASSED
- [ ] Test 4: API Direct Access Test - PASSED
- [ ] Test 5: Brand Association Test - PASSED
- [ ] RLS Policy Verification Script - All tables have RLS enabled
- [ ] No RLS bypass vulnerabilities found
- [ ] Edge Functions using proper authentication

**Verified By:** ___________________
**Date:** ___________________
**Status:** PRODUCTION READY ✅

---

## References

- Audit Report: `FINAL_AUDIT_REPORT_FEB2026.md`
- Security Fixes: `SECURITY_FIX_INSTRUCTIONS.md`
- Supabase RLS Documentation: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS Documentation: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

**Last Updated:** February 14, 2026
**Next Review:** March 14, 2026 (monthly review recommended)
