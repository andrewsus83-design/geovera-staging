# 🔒 GeoVera Security Audit Report
**Date:** February 14, 2026
**Platform:** geovera.xyz
**Status:** ⚠️ CRITICAL VULNERABILITIES FOUND - MUST FIX BEFORE LAUNCH

---

## 📊 Executive Summary

**OVERALL STATUS: 🔴 CRITICAL - NOT PRODUCTION READY**

### Issues Found:
- **P0 Critical:** 11 issues (MUST fix immediately)
- **P1 High:** 15 issues (Fix before launch)
- **P2 Medium:** 94 issues (Fix post-launch)
- **Total:** 120 security issues identified

### Top 3 Critical Risks:
1. 🚨 **11 tables exposed without RLS** - Anyone can read/write sensitive data
2. 🚨 **12 tables with RLS but no policies** - RLS enabled but bypassed
3. 🚨 **Hardcoded credentials in frontend** - API keys exposed in HTML files

---

## 🚨 P0 CRITICAL ISSUES (MUST FIX NOW!)

### 1. Tables with RLS Disabled (11 Tables - DATA EXPOSED!)

**Risk:** Anyone with the anon key can read and write ALL data in these tables!

**Affected Tables:**
1. `gv_subscription_pricing` - Pricing data exposed
2. `gv_brand_confirmations` - User confirmations exposed
3. `gv_onboarding_email_queue` - Email queue exposed
4. `gv_hub_collections` - User collections exposed
5. `gv_hub_embedded_content` - User content exposed
6. `gv_radar_creators` - Creator database exposed (Partner-only feature!)
7. `gv_creators` - Global creator database exposed
8. `gv_creator_content` - Creator posts exposed
9. `gv_hub_articles` - User articles exposed
10. `gv_hub_daily_quotas` - Usage quotas exposed
11. `gv_hub_generation_queue` - Generation queue exposed

**Status:** ✅ **PARTIALLY FIXED**
- RLS has been ENABLED on all 11 tables
- Still need policies (see next section)

**Proof of Concept Exploit:**
```javascript
// Anyone can do this with just the anon key!
const { data } = await supabase
  .from('gv_creators')
  .select('*')
  .limit(1000);
// Returns ALL creator data - even for non-Partner users!
```

---

### 2. Tables with RLS Enabled But NO Policies (12 Tables - BYPASSED!)

**Risk:** RLS is ON but has no policies, so data is still exposed!

**Affected Tables:**
1. `gv_brand_authority_patterns` - Brand patterns exposed
2. `gv_brand_marketshare` - Market share data exposed
3. `gv_brands` - 🔴 **CRITICAL!** Main brands table exposed!
4. `gv_creator_rankings` - Rankings exposed
5. `gv_crisis_events` - Crisis data exposed
6. `gv_daily_insights` - Insights exposed
7. `gv_discovered_brands` - Competitor data exposed
8. `gv_radar_processing_queue` - Processing queue exposed
9. `gv_radar_snapshots` - Radar snapshots exposed
10. `gv_task_actions` - Task actions exposed
11. `gv_trend_involvement` - Trend data exposed
12. `gv_trends` - Global trends exposed

**Status:** ⚠️ **NEEDS CUSTOM FIX**
- Tables have different schemas (some have brand_id, some don't)
- Requires table-specific policies based on actual columns
- See "Table-Specific Policy Fixes" section below

**Example Issue:**
```sql
-- gv_brand_authority_patterns has NO brand_id column!
SELECT column_name FROM information_schema.columns
WHERE table_name = 'gv_brand_authority_patterns';
-- Returns: id, category, pattern_type, patterns, confidence_score, sample_size, last_updated, created_at
-- NO BRAND_ID! Cannot use standard brand isolation policy.
```

---

### 3. Hardcoded Supabase Credentials in Frontend (CRITICAL!)

**Risk:** API keys exposed in public HTML files visible to anyone!

**Files with exposed credentials:**
```
/frontend/login-working.html:86
  SUPABASE_URL = 'https://vozjwptzutolvkvfpknk.supabase.co'
  SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

/frontend/chat.html:621
  SUPABASE_URL = 'https://trvvkdmqhtqoxgtxvlac.supabase.co'
  SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

/frontend/content-studio.html:557
/frontend/dashboard.html:688
/frontend/diagnostic.html:101
/frontend/forgot-password.html:390
+ 136 more files found with SUPABASE_URL/KEY
```

**Status:** ❌ **NOT FIXED**

**Required Fix:**
```javascript
// Create /frontend/.env.local (gitignored)
NEXT_PUBLIC_SUPABASE_URL=https://vozjwptzutolvkvfpknk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

// In HTML files, use:
const SUPABASE_URL = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

**NOTE:** Anon key is supposed to be public, but hardcoding makes rotation harder and exposes URLs.

---

### 4. Overly Permissive RLS Policies (4 Tables)

**Risk:** Policies use `WITH CHECK (true)` which bypasses security!

**Affected Tables:**
1. `brands` - "Users can insert own brands" uses `WITH CHECK (true)`
2. `gv_ai_insights` - "Service role can insert insights" uses `WITH CHECK (true)`
3. `gv_daily_briefs` - "Service role can insert daily briefs" uses `WITH CHECK (true)`
4. `gv_engagement_tracking` - "Allow engagement tracking inserts" uses `WITH CHECK (true)`

**Example:**
```sql
-- CURRENT (INSECURE):
CREATE POLICY "Users can insert own brands" ON public.brands
FOR INSERT WITH CHECK (true); -- Anyone can insert!

-- SHOULD BE:
CREATE POLICY "Users can insert own brands" ON public.brands
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  -- Brand-user link enforced by Edge Function
);
```

**Status:** ⚠️ **NEEDS FIX**

---

### 5. Missing Tier-Based Access Control

**Risk:** Non-Partner users can access Partner-only Radar features!

**Issue:** Tables like `gv_creators`, `gv_creator_content`, `gv_radar_creators` should only be accessible to Partner tier ($1299/mo), but currently anyone can access them.

**Required Policy Example:**
```sql
CREATE POLICY "Partner tier only can view creators" ON public.gv_creators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.brands b
    JOIN public.user_brands ub ON b.id = ub.brand_id
    WHERE ub.user_id = auth.uid()
    AND b.subscription_tier = 'partner'
  )
);
```

**Status:** ⚠️ **NEEDS IMPLEMENTATION**

---

## 🔥 P1 HIGH PRIORITY ISSUES

### 1. SECURITY DEFINER Views (15 Views)

**Risk:** Views run with creator permissions, bypassing RLS!

**Affected Views:**
1. `gv_top_influencers_summary`
2. `gv_unified_radar`
3. `gv_attribution_by_channel`
4. `gv_cross_insights`
5. `gv_recent_journeys`
6. `gv_llm_seo_rankings`
7. `gv_conversion_funnel`
8. `gv_social_creators_stale`
9. `gv_brand_chat_context`
10. `gv_unattributed_conversions`
11. `gv_current_authority`
12. `gv_citation_flow`
13. `gv_chat_analytics`
14. `gv_authority_leaderboard`
15. `gv_brand_chat_training`

**Recommendation:**
- Review each view to ensure it doesn't leak data
- Consider changing to `SECURITY INVOKER` where appropriate
- Add WHERE clauses to filter by user's brands

**Status:** ⚠️ **NEEDS MANUAL REVIEW**

---

### 2. Authentication Flow Issues

**Potential Issues Found:**
1. No rate limiting on signup/login endpoints
2. Password reset flow not tested
3. Email confirmation may have 404 error (mentioned in requirements)
4. Session management unclear - tokens stored in localStorage (XSS risk)

**Test Cases Needed:**
```javascript
// Test 1: Signup flow
1. Go to login-working.html
2. Click "Sign Up"
3. Enter email/password
4. Verify email sent
5. Click email link
6. Check for 404 error
7. Verify redirect to onboarding

// Test 2: Login flow
1. Enter valid credentials
2. Verify session created
3. Check localStorage for access_token
4. Verify redirect to dashboard (if brand exists) or onboarding

// Test 3: Tier access
1. Login as Essential tier user
2. Try to access /radar (should fail)
3. Login as Partner tier user
4. Access /radar (should succeed)
```

**Status:** ❌ **NOT TESTED**

---

### 3. Edge Function Security

**Functions Found:** 17 Edge Functions

**Potential Issues:**
1. No input validation visible in most functions
2. CORS set to `*` (allows any domain)
3. Some functions use service role key (dangerous if leaked)
4. No rate limiting implemented

**Critical Functions to Audit:**
```
/supabase/functions/simple-onboarding/index.ts
/supabase/functions/ai-chat/index.ts
/supabase/functions/radar-scrape-content/index.ts
/supabase/functions/generate-article/index.ts
/supabase/functions/generate-image/index.ts
/supabase/functions/generate-video/index.ts
```

**simple-onboarding Security Analysis:**
```typescript
// GOOD: Verifies JWT
const { data: { user }, error: userError } = await supabase.auth.getUser(token);

// GOOD: Checks if user already has brand
const { data: existingBrands } = await supabase
  .from('user_brands')
  .select('brand_id')
  .eq('user_id', user.id);

// ISSUE: No input sanitization
const { brand_name, category, country } = body; // Direct use without validation

// ISSUE: No rate limiting - user can spam brand creation attempts
```

**Status:** ⚠️ **NEEDS FULL AUDIT**

---

## ⚠️ P2 MEDIUM PRIORITY ISSUES

### 1. Function search_path Mutable (94 Functions!)

**Risk:** Functions can be hijacked via search_path manipulation

**Affected:** 94 database functions without fixed search_path

**Fix:**
```sql
-- Add to each function:
ALTER FUNCTION function_name() SET search_path = public, pg_temp;
```

**Status:** ⚠️ **NEEDS BULK FIX**

---

### 2. Extensions in Public Schema (3 Extensions)

**Risk:** Extensions should be in separate schema

**Affected:**
- `pg_net`
- `vector`
- `http`

**Fix:**
```sql
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_net SET SCHEMA extensions;
ALTER EXTENSION vector SET SCHEMA extensions;
ALTER EXTENSION http SET SCHEMA extensions;
```

**Status:** ⚠️ **LOW PRIORITY**

---

### 3. Leaked Password Protection Disabled

**Risk:** Users can use compromised passwords from HaveIBeenPwned database

**Fix:** Enable in Supabase Dashboard > Authentication > Password Settings

**Status:** ⚠️ **NEEDS CONFIGURATION**

---

## 🛠️ TABLE-SPECIFIC POLICY FIXES

### For Tables WITHOUT brand_id (Need Custom Policies)

#### gv_brand_authority_patterns (No brand_id!)
```sql
-- Schema: id, category, pattern_type, patterns, confidence_score, sample_size, last_updated, created_at
-- Solution: This appears to be GLOBAL data (no brand association)
CREATE POLICY "Anyone authenticated can view brand authority patterns" ON public.gv_brand_authority_patterns
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only service role can manage patterns" ON public.gv_brand_authority_patterns
FOR ALL USING (auth.role() = 'service_role');
```

#### gv_brands (Uses 'id' not 'brand_id')
```sql
-- Schema: id, name, domain, industry, subscription_tier, etc.
CREATE POLICY "Users can view own brands via gv_brands" ON public.gv_brands
FOR SELECT USING (
  id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own brands" ON public.gv_brands
FOR UPDATE USING (
  id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid())
);
```

#### gv_creators (Global database - no brand association)
```sql
-- Schema: id, username, platform, category, follower_count, engagement_rate
-- Solution: Partner tier only access
CREATE POLICY "Partner tier users can view creators" ON public.gv_creators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.brands b
    JOIN public.user_brands ub ON b.id = ub.brand_id
    WHERE ub.user_id = auth.uid()
    AND b.subscription_tier = 'partner'
  )
);

CREATE POLICY "Service role can manage creators" ON public.gv_creators
FOR ALL USING (auth.role() = 'service_role');
```

#### gv_hub_collections
```sql
-- Schema: id, brand_id, category, title, subtitle, total_embeds, status, created_at
-- HAS brand_id - standard policy applies
CREATE POLICY "Users can view own hub collections" ON public.gv_hub_collections
FOR SELECT USING (
  brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage own hub collections" ON public.gv_hub_collections
FOR ALL USING (
  brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid())
);
```

---

## ✅ WHAT'S ALREADY SECURE

### Good Security Practices Found:

1. ✅ **RLS Enabled on 170+ tables** (but many need policies)
2. ✅ **JWT Authentication** properly implemented in Edge Functions
3. ✅ **User-Brand Isolation** via `user_brands` junction table
4. ✅ **Proper foreign keys** with CASCADE delete
5. ✅ **Subscription tier column** exists for access control
6. ✅ **Auth triggers** (`handle_new_user`) properly set up
7. ✅ **HTTPS enforced** on all endpoints
8. ✅ **Email confirmation** required for signup

---

## 📋 FIX PRIORITY CHECKLIST

### MUST DO BEFORE LAUNCH (P0):
- [ ] Apply all RLS policies to tables with no policies (12 tables)
- [ ] Add policies to newly RLS-enabled tables (11 tables)
- [ ] Fix overly permissive policies (4 tables)
- [ ] Implement tier-based access control (Partner-only Radar)
- [ ] Move hardcoded credentials to environment variables
- [ ] Test authentication flow end-to-end
- [ ] Fix any 404 errors in auth redirects

### SHOULD DO BEFORE LAUNCH (P1):
- [ ] Audit all 15 SECURITY DEFINER views
- [ ] Add input validation to all Edge Functions
- [ ] Implement rate limiting on auth endpoints
- [ ] Add rate limiting on Edge Functions
- [ ] Test tier-based access control
- [ ] Enable leaked password protection
- [ ] Add CAPTCHA to signup/login forms

### CAN DO POST-LAUNCH (P2):
- [ ] Fix search_path on 94 functions
- [ ] Move extensions to separate schema
- [ ] Add monitoring/alerting for auth failures
- [ ] Implement session refresh mechanism
- [ ] Add 2FA support
- [ ] Security headers (CSP, HSTS, etc.)

---

## 🧪 TESTING CHECKLIST

### Authentication Tests:
```bash
# Test 1: Signup
curl -X POST https://vozjwptzutolvkvfpknk.supabase.co/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Test 2: Login
curl -X POST https://vozjwptzutolvkvfpknk.supabase.co/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Test 3: Access Protected Resource
curl -X GET https://vozjwptzutolvkvfpknk.supabase.co/rest/v1/brands \
  -H "Authorization: Bearer <access_token>" \
  -H "apikey: <anon_key>"
```

### RLS Tests:
```sql
-- Test 1: Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
-- Should return ONLY pricing/reference tables

-- Test 2: Verify policies exist
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) = 0;
-- Should return EMPTY (all tables have policies)

-- Test 3: Test data isolation
SET LOCAL "request.jwt.claims" = '{"sub": "user-1-uuid"}';
SELECT COUNT(*) FROM brands;
-- Should return only brands owned by user-1

SET LOCAL "request.jwt.claims" = '{"sub": "user-2-uuid"}';
SELECT COUNT(*) FROM brands;
-- Should return only brands owned by user-2 (different count!)
```

### Tier Access Tests:
```javascript
// Test 1: Essential tier cannot access Radar
const essentialUser = await supabase.auth.signInWithPassword({
  email: 'essential@test.com',
  password: 'test123'
});

const { data, error } = await supabase
  .from('gv_creators')
  .select('*')
  .limit(10);

console.assert(data === null, 'Essential tier should NOT access creators!');
console.assert(error !== null, 'Should get RLS policy violation error');

// Test 2: Partner tier CAN access Radar
const partnerUser = await supabase.auth.signInWithPassword({
  email: 'partner@test.com',
  password: 'test123'
});

const { data: creators, error: err } = await supabase
  .from('gv_creators')
  .select('*')
  .limit(10);

console.assert(creators.length > 0, 'Partner tier should access creators!');
console.assert(err === null, 'No error for Partner tier');
```

---

## 🚀 DEPLOYMENT READINESS

### Current Status: 🔴 **NOT READY FOR PRODUCTION**

**Blockers:**
1. 23 tables without proper RLS policies
2. Hardcoded credentials in frontend
3. No tier-based access control
4. Auth flow not tested

**Estimated Time to Fix:**
- P0 issues: 4-6 hours
- P1 issues: 8-12 hours
- **Total: 12-18 hours of work**

---

## 📞 IMMEDIATE ACTION REQUIRED

### Step 1: Fix RLS Policies (2-3 hours)
Run the corrected policies for all 23 tables based on table schemas above.

### Step 2: Move Credentials to .env (1 hour)
```bash
# Create .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=https://vozjwptzutolvkvfpknk.supabase.co" > frontend/.env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_key>" >> frontend/.env.local

# Update all HTML files to use env vars
# OR migrate to proper Next.js setup
```

### Step 3: Test Auth Flow (1-2 hours)
- Test signup → email confirm → onboarding
- Test login → dashboard
- Fix any 404 errors
- Verify session persistence

### Step 4: Implement Tier Access (2 hours)
- Add tier check policies to Radar tables
- Test Essential tier CANNOT access
- Test Partner tier CAN access

### Step 5: Verify Everything (1 hour)
```sql
-- Run verification
SELECT * FROM verify_rls_security();
-- Should show ALL tables with status = 'OK'
```

---

## 🎯 SUCCESS CRITERIA

**Ready for Production When:**
- ✅ All tables have RLS enabled AND policies
- ✅ No hardcoded credentials in frontend
- ✅ Auth flow works end-to-end (no 404)
- ✅ Tier-based access enforced (Partner-only Radar)
- ✅ All security tests pass
- ✅ `verify_rls_security()` returns 0 errors

---

## 📚 REFERENCES

- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Report Generated:** February 14, 2026
**Next Review:** After P0 fixes applied
**Security Specialist:** Claude Sonnet 4.5
