# GeoVera SaaS - Security Testing Checklist & Scenarios

**Project:** staging-geovera (vozjwptzutolvkvfpknk)
**Date:** 2026-02-12
**Purpose:** Comprehensive security testing before production deployment

---

## Table of Contents
1. [Pre-Deployment Security Tests](#1-pre-deployment-security-tests)
2. [Multi-Tenant Isolation Tests](#2-multi-tenant-isolation-tests)
3. [Authentication Security Tests](#3-authentication-security-tests)
4. [Authorization & RLS Tests](#4-authorization--rls-tests)
5. [API Security Tests](#5-api-security-tests)
6. [Input Validation Tests](#6-input-validation-tests)
7. [Session Management Tests](#7-session-management-tests)
8. [Rate Limiting Tests](#8-rate-limiting-tests)
9. [Payment Security Tests](#9-payment-security-tests)
10. [Penetration Testing Scenarios](#10-penetration-testing-scenarios)

---

## 1. Pre-Deployment Security Tests

### 1.1 RLS Coverage Verification

**Test ID:** SEC-001
**Priority:** CRITICAL
**Status:** ⬜ Not Started

```sql
-- Execute this query to verify RLS is enabled on all tables
SELECT
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count,
  CASE
    WHEN NOT t.rowsecurity THEN '❌ FAIL: RLS Disabled'
    WHEN t.rowsecurity AND COUNT(p.policyname) = 0 THEN '❌ FAIL: No Policies'
    WHEN t.rowsecurity AND COUNT(p.policyname) > 0 THEN '✅ PASS'
    ELSE '⚠️  UNKNOWN'
  END AS status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND (t.tablename LIKE 'gv_%' OR t.tablename IN ('profiles', 'brands', 'user_brands', 'customers', 'api_keys'))
GROUP BY t.tablename, t.rowsecurity
ORDER BY status, t.tablename;
```

**Expected Result:** All tables show ✅ PASS

**Acceptance Criteria:**
- [ ] 100% of tables have RLS enabled
- [ ] 100% of tables have at least one RLS policy
- [ ] 0 tables are publicly accessible without authentication

---

### 1.2 Database Security Advisory Check

**Test ID:** SEC-002
**Priority:** HIGH
**Status:** ⬜ Not Started

**Steps:**
1. Run Supabase security advisor:
   ```bash
   # Via Supabase CLI or API
   curl https://vozjwptzutolvkvfpknk.supabase.co/rest/v1/rpc/get_advisors \
     -H "apikey: YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json"
   ```

**Expected Result:**
- [ ] 0 ERROR level issues
- [ ] 0 WARNING level issues related to RLS
- [ ] All security definer views addressed

---

### 1.3 Environment Variable Audit

**Test ID:** SEC-003
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Checklist:**
- [ ] No secrets in git repository
- [ ] `.env.local` in `.gitignore`
- [ ] Service role key NEVER exposed to frontend
- [ ] JWT secret properly configured
- [ ] All environment variables validated at startup
- [ ] Production keys different from development

---

## 2. Multi-Tenant Isolation Tests

### 2.1 Cross-Brand Data Access Prevention

**Test ID:** MTI-001
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Setup:**
```typescript
// Test user credentials
const userA = {
  email: 'test-user-a@example.com',
  password: 'SecurePass123!@#',
  brandId: 'brand-a-uuid'
}

const userB = {
  email: 'test-user-b@example.com',
  password: 'SecurePass123!@#',
  brandId: 'brand-b-uuid'
}
```

**Test Scenario 1: User A Cannot Read User B's Brands**

```typescript
async function testCrossBrandRead() {
  // Sign in as User A
  const { data: sessionA } = await supabase.auth.signInWithPassword({
    email: userA.email,
    password: userA.password
  })

  // Attempt to read User B's brand
  const { data: brandB, error } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('id', userB.brandId)
    .single()

  // EXPECTED: error should exist, brandB should be null
  console.assert(error !== null, '❌ FAIL: User A can read User B brand')
  console.assert(brandB === null, '❌ FAIL: User A retrieved User B data')

  if (error && !brandB) {
    console.log('✅ PASS: Cross-brand read prevented')
    return true
  }

  return false
}
```

**Expected Result:** ✅ User A cannot access User B's brand data

**Acceptance Criteria:**
- [ ] User A cannot SELECT brand B data
- [ ] User A cannot UPDATE brand B data
- [ ] User A cannot DELETE brand B data
- [ ] User A cannot INSERT data into brand B tables

---

**Test Scenario 2: User A Cannot Modify User B's Data**

```typescript
async function testCrossBrandWrite() {
  // Sign in as User A
  const { data: sessionA } = await supabase.auth.signInWithPassword({
    email: userA.email,
    password: userA.password
  })

  // Attempt to update User B's brand
  const { data, error } = await supabase
    .from('gv_brands')
    .update({ name: 'HACKED BY USER A' })
    .eq('id', userB.brandId)

  // EXPECTED: error should exist
  console.assert(error !== null, '❌ FAIL: User A can modify User B brand')

  if (error) {
    console.log('✅ PASS: Cross-brand write prevented')
    return true
  }

  return false
}
```

**Expected Result:** ✅ User A cannot modify User B's data

---

**Test Scenario 3: User A Cannot Access Brand B's Child Records**

```typescript
async function testCrossBrandChildRecords() {
  // Sign in as User A
  const { data: sessionA } = await supabase.auth.signInWithPassword({
    email: userA.email,
    password: userA.password
  })

  // Test tables with brand_id foreign key
  const tablesToTest = [
    'gv_content_assets',
    'gv_tasks',
    'gv_reports',
    'gv_smart_questions',
    'gv_chat_logs',
    'gv_subscriptions',
    'gv_invoices'
  ]

  for (const table of tablesToTest) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('brand_id', userB.brandId)

    if (!error || data?.length > 0) {
      console.log(`❌ FAIL: User A can access ${table} for brand B`)
      return false
    }
  }

  console.log('✅ PASS: All child records protected')
  return true
}
```

**Expected Result:** ✅ User A cannot access any of User B's child records

**Acceptance Criteria:**
- [ ] All brand-related tables enforce brand isolation
- [ ] No data leaks across brands
- [ ] Foreign key relationships respect RLS

---

### 2.2 SQL Injection via Brand ID

**Test ID:** MTI-002
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testSQLInjectionViaBrandId() {
  const { data: sessionA } = await supabase.auth.signInWithPassword({
    email: userA.email,
    password: userA.password
  })

  // Attempt SQL injection via brand_id filter
  const maliciousInput = "'; DROP TABLE gv_brands; --"

  const { data, error } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('id', maliciousInput)

  // EXPECTED: Query should fail gracefully, no SQL execution
  console.assert(error !== null, '❌ FAIL: SQL injection succeeded')

  // Verify table still exists
  const { data: tableCheck } = await supabase
    .from('gv_brands')
    .select('count')
    .limit(1)

  if (tableCheck) {
    console.log('✅ PASS: SQL injection prevented')
    return true
  }

  return false
}
```

**Expected Result:** ✅ SQL injection prevented, table not dropped

---

### 2.3 Unauthenticated Access Prevention

**Test ID:** MTI-003
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testUnauthenticatedAccess() {
  // Create unauthenticated client
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  // Ensure no session exists
  await anonClient.auth.signOut()

  // Attempt to access protected tables
  const protectedTables = [
    'gv_brands',
    'gv_invoices',
    'gv_subscriptions',
    'profiles',
    'user_brands'
  ]

  for (const table of protectedTables) {
    const { data, error } = await anonClient
      .from(table)
      .select('*')
      .limit(1)

    if (!error || data?.length > 0) {
      console.log(`❌ FAIL: Unauthenticated access to ${table}`)
      return false
    }
  }

  console.log('✅ PASS: Unauthenticated access blocked for all tables')
  return true
}
```

**Expected Result:** ✅ All tables require authentication

**Acceptance Criteria:**
- [ ] No table accessible without auth token
- [ ] Proper error messages (not revealing table structure)
- [ ] No data leakage in error responses

---

## 3. Authentication Security Tests

### 3.1 Password Strength Enforcement

**Test ID:** AUTH-001
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenarios:**

```typescript
async function testPasswordStrength() {
  const weakPasswords = [
    'password',        // Too common
    'Password1',       // Too short
    'password123',     // No uppercase/special chars
    'PASSWORD123',     // No lowercase
    'Password!',       // Too short
    'Pass123!',        // Too short
  ]

  for (const password of weakPasswords) {
    const { data, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password
    })

    if (!error) {
      console.log(`❌ FAIL: Weak password accepted: ${password}`)
      return false
    }
  }

  // Test strong password (should succeed)
  const { data, error } = await supabase.auth.signUp({
    email: `test-${Date.now()}@example.com`,
    password: 'SecureP@ssw0rd2024!'
  })

  if (error) {
    console.log('❌ FAIL: Strong password rejected')
    return false
  }

  console.log('✅ PASS: Password strength enforced')
  return true
}
```

**Expected Result:** ✅ Weak passwords rejected, strong passwords accepted

**Acceptance Criteria:**
- [ ] Minimum 12 characters required
- [ ] Uppercase, lowercase, numbers, special chars required
- [ ] Common passwords blocked
- [ ] Clear error messages for password requirements

---

### 3.2 Leaked Password Protection

**Test ID:** AUTH-002
**Priority:** HIGH
**Status:** ⬜ Not Started

**Manual Test:**
1. Navigate to Supabase Dashboard → Authentication → Policies
2. Verify "Leaked Password Protection" is ENABLED
3. Attempt signup with known leaked password: `password123`
4. Verify signup is rejected

**Expected Result:** ✅ Leaked passwords are blocked

---

### 3.3 Email Verification Enforcement

**Test ID:** AUTH-003
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testEmailVerification() {
  // Sign up new user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: `unverified-${Date.now()}@example.com`,
    password: 'SecureP@ssw0rd2024!'
  })

  if (signUpError) {
    console.log('❌ FAIL: Signup failed unexpectedly')
    return false
  }

  // Attempt to access protected resources without verification
  const { data: brands, error: brandsError } = await supabase
    .from('gv_brands')
    .select('*')

  // EXPECTED: Should fail or return empty if email not verified
  // (Depends on Supabase email confirmation settings)

  console.log('User confirmed status:', signUpData.user?.confirmed_at)

  if (signUpData.user?.confirmed_at === null) {
    console.log('✅ PASS: Email verification required')
    return true
  }

  return false
}
```

**Expected Result:** ✅ Users must verify email before access

---

### 3.4 Account Lockout After Failed Attempts

**Test ID:** AUTH-004
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testAccountLockout() {
  const testEmail = `lockout-test-${Date.now()}@example.com`
  const correctPassword = 'SecureP@ssw0rd2024!'
  const wrongPassword = 'WrongPassword123!'

  // Create test user
  await supabase.auth.signUp({
    email: testEmail,
    password: correctPassword
  })

  // Attempt 5 failed logins
  for (let i = 0; i < 5; i++) {
    await supabase.auth.signInWithPassword({
      email: testEmail,
      password: wrongPassword
    })

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // 6th attempt (should be locked)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: correctPassword
  })

  if (!error && data) {
    console.log('❌ FAIL: Account not locked after 5 failed attempts')
    return false
  }

  // Check if error indicates account lock
  if (error?.message.includes('locked') || error?.message.includes('too many attempts')) {
    console.log('✅ PASS: Account locked after failed attempts')
    return true
  }

  return false
}
```

**Expected Result:** ✅ Account locked after 5 failed login attempts

**Acceptance Criteria:**
- [ ] Lock after 5 failed attempts within 15 minutes
- [ ] Lock duration: 60 minutes
- [ ] User notified via email
- [ ] Security event logged

---

## 4. Authorization & RLS Tests

### 4.1 Role-Based Access Control

**Test ID:** AUTHZ-001
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testRoleBasedAccess() {
  // Create users with different roles
  const owner = { email: 'owner@example.com', role: 'owner' }
  const editor = { email: 'editor@example.com', role: 'editor' }
  const viewer = { email: 'viewer@example.com', role: 'viewer' }

  const brandId = 'test-brand-uuid'

  // Test viewer permissions (should only SELECT)
  await supabase.auth.signInWithPassword({
    email: viewer.email,
    password: 'SecurePass123!@#'
  })

  // Viewer should read
  const { data: readData, error: readError } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('id', brandId)

  if (readError) {
    console.log('❌ FAIL: Viewer cannot read')
    return false
  }

  // Viewer should NOT update
  const { error: updateError } = await supabase
    .from('gv_brands')
    .update({ name: 'Updated by viewer' })
    .eq('id', brandId)

  if (!updateError) {
    console.log('❌ FAIL: Viewer can update (should be blocked)')
    return false
  }

  // Test editor permissions (should SELECT, INSERT, UPDATE)
  await supabase.auth.signInWithPassword({
    email: editor.email,
    password: 'SecurePass123!@#'
  })

  const { error: editorUpdateError } = await supabase
    .from('gv_brands')
    .update({ name: 'Updated by editor' })
    .eq('id', brandId)

  if (editorUpdateError) {
    console.log('❌ FAIL: Editor cannot update')
    return false
  }

  // Editor should NOT delete
  const { error: editorDeleteError } = await supabase
    .from('gv_brands')
    .delete()
    .eq('id', brandId)

  if (!editorDeleteError) {
    console.log('❌ FAIL: Editor can delete (should be blocked)')
    return false
  }

  // Test owner permissions (should have all access)
  await supabase.auth.signInWithPassword({
    email: owner.email,
    password: 'SecurePass123!@#'
  })

  const { error: ownerDeleteError } = await supabase
    .from('gv_brands')
    .delete()
    .eq('id', brandId)

  if (ownerDeleteError) {
    console.log('❌ FAIL: Owner cannot delete')
    return false
  }

  console.log('✅ PASS: Role-based access control working')
  return true
}
```

**Expected Result:** ✅ Roles enforced correctly

**Acceptance Criteria:**
- [ ] Viewers can SELECT only
- [ ] Editors can SELECT, INSERT, UPDATE
- [ ] Owners can SELECT, INSERT, UPDATE, DELETE
- [ ] Admins can SELECT, INSERT, UPDATE, manage users

---

### 4.2 Service Role Bypass

**Test ID:** AUTHZ-002
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testServiceRoleBypass() {
  // Create service role client
  const serviceClient = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Service role should bypass RLS
  const { data, error } = await serviceClient
    .from('gv_brands')
    .select('*')

  if (error) {
    console.log('❌ FAIL: Service role cannot access data')
    return false
  }

  // CRITICAL: Ensure service role is NEVER exposed to frontend
  if (typeof window !== 'undefined') {
    console.log('❌ CRITICAL: Service role key exposed to browser!')
    return false
  }

  console.log('✅ PASS: Service role can bypass RLS (backend only)')
  return true
}
```

**Expected Result:** ✅ Service role works, never exposed to frontend

---

## 5. API Security Tests

### 5.1 JWT Token Validation

**Test ID:** API-001
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Test Scenarios:**

```typescript
async function testJWTValidation() {
  // Test 1: Missing token
  const res1 = await fetch(`${supabaseUrl}/rest/v1/gv_brands`, {
    headers: {
      'apikey': supabaseAnonKey
      // Missing Authorization header
    }
  })

  if (res1.ok) {
    console.log('❌ FAIL: Request without JWT succeeded')
    return false
  }

  // Test 2: Invalid token
  const res2 = await fetch(`${supabaseUrl}/rest/v1/gv_brands`, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': 'Bearer invalid-token-here'
    }
  })

  if (res2.ok) {
    console.log('❌ FAIL: Request with invalid JWT succeeded')
    return false
  }

  // Test 3: Expired token
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Create expired token
  const res3 = await fetch(`${supabaseUrl}/rest/v1/gv_brands`, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${expiredToken}`
    }
  })

  if (res3.ok) {
    console.log('❌ FAIL: Request with expired JWT succeeded')
    return false
  }

  console.log('✅ PASS: JWT validation working correctly')
  return true
}
```

**Expected Result:** ✅ Invalid/missing/expired JWTs rejected

---

### 5.2 API Key Security

**Test ID:** API-002
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testAPIKeySecurity() {
  // Generate API key as brand owner
  const { data: apiKeyData } = await supabase.rpc('generate_api_key', {
    brand_id: testBrandId,
    name: 'Test API Key'
  })

  const apiKey = apiKeyData.api_key

  // Test 1: API key works
  const res1 = await fetch(`${edgeFunctionUrl}/api/brands`, {
    headers: {
      'X-API-Key': apiKey
    }
  })

  if (!res1.ok) {
    console.log('❌ FAIL: Valid API key rejected')
    return false
  }

  // Test 2: Invalid API key blocked
  const res2 = await fetch(`${edgeFunctionUrl}/api/brands`, {
    headers: {
      'X-API-Key': 'gv_invalid_key_here'
    }
  })

  if (res2.ok) {
    console.log('❌ FAIL: Invalid API key accepted')
    return false
  }

  // Test 3: Revoked API key blocked
  await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('key_hash', hashAPIKey(apiKey))

  const res3 = await fetch(`${edgeFunctionUrl}/api/brands`, {
    headers: {
      'X-API-Key': apiKey
    }
  })

  if (res3.ok) {
    console.log('❌ FAIL: Revoked API key still works')
    return false
  }

  console.log('✅ PASS: API key security working')
  return true
}
```

**Expected Result:** ✅ API keys validated correctly

---

### 5.3 Edge Function Authentication

**Test ID:** API-003
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Manual Test:**
1. Test each Edge Function without Authorization header
2. Verify 401 Unauthorized response
3. Test with valid JWT
4. Verify 200 OK response

**Edge Functions to Test:**
- [ ] All deployed Edge Functions require authentication
- [ ] No Edge Function bypasses JWT validation
- [ ] Proper error messages for unauthorized access

---

## 6. Input Validation Tests

### 6.1 SQL Injection Prevention

**Test ID:** INP-001
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Test Scenarios:**

```typescript
async function testSQLInjection() {
  const sqlInjectionPayloads = [
    "'; DROP TABLE gv_brands; --",
    "1' OR '1'='1",
    "admin'--",
    "' UNION SELECT * FROM profiles--",
    "'; DELETE FROM user_brands WHERE '1'='1'--"
  ]

  for (const payload of sqlInjectionPayloads) {
    // Test in search/filter fields
    const { data, error } = await supabase
      .from('gv_brands')
      .select('*')
      .ilike('name', payload)

    // Should not execute SQL, should treat as literal string
    // If data is returned or error indicates SQL execution, FAIL

    if (error?.message.includes('syntax') || error?.message.includes('SQL')) {
      console.log(`❌ FAIL: SQL injection possible with payload: ${payload}`)
      return false
    }
  }

  console.log('✅ PASS: SQL injection prevented')
  return true
}
```

**Expected Result:** ✅ All SQL injection attempts blocked

---

### 6.2 XSS Prevention

**Test ID:** INP-002
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testXSSPrevention() {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<svg onload=alert("XSS")>'
  ]

  for (const payload of xssPayloads) {
    // Insert XSS payload into brand name
    const { data, error } = await supabase
      .from('gv_brands')
      .insert({
        name: payload,
        category: 'test'
      })
      .select()

    if (error) continue

    // Read back the data
    const { data: readData } = await supabase
      .from('gv_brands')
      .select('name')
      .eq('id', data[0].id)
      .single()

    // Render in DOM and check if script executes
    const div = document.createElement('div')
    div.innerHTML = readData.name

    // If script tags are present or javascript: protocol, sanitization failed
    if (div.innerHTML.includes('<script') || div.innerHTML.includes('javascript:')) {
      console.log(`❌ FAIL: XSS payload not sanitized: ${payload}`)
      return false
    }
  }

  console.log('✅ PASS: XSS prevention working')
  return true
}
```

**Expected Result:** ✅ All XSS payloads sanitized

---

### 6.3 Input Length Limits

**Test ID:** INP-003
**Priority:** MEDIUM
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testInputLimits() {
  // Test oversized input (potential DoS)
  const hugeString = 'A'.repeat(1000000) // 1MB

  const { data, error } = await supabase
    .from('gv_brands')
    .insert({
      name: hugeString
    })

  if (!error) {
    console.log('❌ FAIL: Oversized input accepted')
    return false
  }

  console.log('✅ PASS: Input length limits enforced')
  return true
}
```

**Expected Result:** ✅ Oversized inputs rejected

---

## 7. Session Management Tests

### 7.1 Token Expiry

**Test ID:** SESS-001
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testTokenExpiry() {
  // Sign in
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: testUser.email,
    password: testUser.password
  })

  const originalAccessToken = session.access_token

  // Wait for token to expire (or manually create expired token)
  // Supabase default: 3600 seconds (1 hour)

  // Attempt to use expired token
  const expiredClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${originalAccessToken}`
      }
    }
  })

  // After expiry, this should fail
  const { data, error } = await expiredClient
    .from('gv_brands')
    .select('*')

  if (!error) {
    console.log('❌ FAIL: Expired token still works')
    return false
  }

  console.log('✅ PASS: Expired tokens rejected')
  return true
}
```

**Expected Result:** ✅ Expired tokens are rejected

---

### 7.2 Session Refresh

**Test ID:** SESS-002
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testSessionRefresh() {
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: testUser.email,
    password: testUser.password
  })

  const originalAccessToken = session.access_token

  // Refresh session
  const { data: { session: newSession }, error } = await supabase.auth.refreshSession()

  if (error) {
    console.log('❌ FAIL: Session refresh failed')
    return false
  }

  if (newSession.access_token === originalAccessToken) {
    console.log('❌ FAIL: Access token not rotated')
    return false
  }

  console.log('✅ PASS: Session refresh working')
  return true
}
```

**Expected Result:** ✅ Session refreshes successfully with new token

---

### 7.3 Session Invalidation on Password Change

**Test ID:** SESS-003
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testSessionInvalidationOnPasswordChange() {
  // Create two sessions
  const { data: session1 } = await supabase.auth.signInWithPassword({
    email: testUser.email,
    password: testUser.password
  })

  const client1 = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${session1.session.access_token}` } }
  })

  // Sign in again (simulate second device)
  const { data: session2 } = await supabase.auth.signInWithPassword({
    email: testUser.email,
    password: testUser.password
  })

  // Change password using session 2
  await supabase.auth.updateUser({
    password: 'NewSecureP@ssw0rd2024!'
  })

  // Session 1 should now be invalid
  const { error } = await client1.from('gv_brands').select('*')

  if (!error) {
    console.log('❌ FAIL: Old session still valid after password change')
    return false
  }

  console.log('✅ PASS: Sessions invalidated on password change')
  return true
}
```

**Expected Result:** ✅ All sessions invalidated on password change

---

## 8. Rate Limiting Tests

### 8.1 Login Rate Limiting

**Test ID:** RATE-001
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testLoginRateLimit() {
  const testEmail = 'ratelimit-test@example.com'
  const wrongPassword = 'WrongPassword123!'

  // Attempt 6 logins in rapid succession
  for (let i = 0; i < 6; i++) {
    const { error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: wrongPassword
    })

    if (i === 5 && error?.message.includes('rate limit')) {
      console.log('✅ PASS: Login rate limit enforced')
      return true
    }
  }

  console.log('❌ FAIL: Login rate limit not enforced')
  return false
}
```

**Expected Result:** ✅ Rate limit blocks after 5 attempts

**Acceptance Criteria:**
- [ ] 5 failed logins per 15 minutes allowed
- [ ] 6th attempt blocked with 429 status
- [ ] Block duration: 60 minutes
- [ ] Rate limit per IP address
- [ ] Rate limit per email address

---

### 8.2 API Rate Limiting

**Test ID:** RATE-002
**Priority:** HIGH
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testAPIRateLimit() {
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: testUser.email,
    password: testUser.password
  })

  // Make 101 rapid API calls
  const requests = []
  for (let i = 0; i < 101; i++) {
    requests.push(
      fetch(`${supabaseUrl}/rest/v1/gv_brands`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        }
      })
    )
  }

  const responses = await Promise.all(requests)

  // At least one should be rate limited (429)
  const rateLimited = responses.some(r => r.status === 429)

  if (!rateLimited) {
    console.log('❌ FAIL: API rate limit not enforced')
    return false
  }

  console.log('✅ PASS: API rate limit enforced')
  return true
}
```

**Expected Result:** ✅ API rate limit enforced (100 requests/minute)

---

## 9. Payment Security Tests

### 9.1 Invoice Data Protection

**Test ID:** PAY-001
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testInvoiceProtection() {
  // User A tries to access User B's invoice
  const { data: sessionA } = await supabase.auth.signInWithPassword({
    email: userA.email,
    password: userA.password
  })

  const { data: invoices, error } = await supabase
    .from('gv_invoices')
    .select('*')
    .eq('brand_id', userB.brandId)

  if (!error || invoices?.length > 0) {
    console.log('❌ CRITICAL: User A can access User B invoices!')
    return false
  }

  console.log('✅ PASS: Invoice data protected')
  return true
}
```

**Expected Result:** ✅ Users can only access their own invoices

**Acceptance Criteria:**
- [ ] Invoices isolated by brand_id
- [ ] No cross-brand invoice access
- [ ] Payment methods never exposed
- [ ] Sensitive financial data encrypted

---

### 9.2 Subscription Data Protection

**Test ID:** PAY-002
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Test Scenario:**

```typescript
async function testSubscriptionProtection() {
  const { data: subscriptions, error } = await supabase
    .from('gv_subscriptions')
    .select('*')
    .neq('brand_id', currentUser.brandId)

  if (!error || subscriptions?.length > 0) {
    console.log('❌ CRITICAL: User can access other subscriptions!')
    return false
  }

  console.log('✅ PASS: Subscription data protected')
  return true
}
```

**Expected Result:** ✅ Users can only access their own subscriptions

---

## 10. Penetration Testing Scenarios

### 10.1 Privilege Escalation

**Test ID:** PEN-001
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Attack Scenario:**
Viewer attempts to elevate to owner role

```typescript
async function testPrivilegeEscalation() {
  // Sign in as viewer
  const { data: viewerSession } = await supabase.auth.signInWithPassword({
    email: viewer.email,
    password: viewer.password
  })

  // Attempt to update own role to owner
  const { error } = await supabase
    .from('user_brands')
    .update({ role: 'owner' })
    .eq('user_id', viewerSession.user.id)

  if (!error) {
    console.log('❌ CRITICAL: Privilege escalation possible!')
    return false
  }

  console.log('✅ PASS: Privilege escalation prevented')
  return true
}
```

**Expected Result:** ✅ Privilege escalation blocked

---

### 10.2 Mass Assignment

**Test ID:** PEN-002
**Priority:** HIGH
**Status:** ⬜ Not Started

**Attack Scenario:**
User attempts to set restricted fields

```typescript
async function testMassAssignment() {
  const { data, error } = await supabase
    .from('gv_brands')
    .insert({
      name: 'Test Brand',
      category: 'test',
      // Attempt to set system fields
      id: 'custom-uuid-here',
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z'
    })

  // System fields should be ignored or cause error
  if (data && data[0].id === 'custom-uuid-here') {
    console.log('❌ FAIL: Mass assignment possible')
    return false
  }

  console.log('✅ PASS: Mass assignment prevented')
  return true
}
```

**Expected Result:** ✅ System fields cannot be set by users

---

### 10.3 IDOR (Insecure Direct Object Reference)

**Test ID:** PEN-003
**Priority:** CRITICAL
**Status:** ⬜ Not Started

**Attack Scenario:**
User attempts to access resources by guessing IDs

```typescript
async function testIDOR() {
  // Generate random UUIDs and attempt to access
  const randomIds = Array.from({ length: 100 }, () => crypto.randomUUID())

  for (const id of randomIds) {
    const { data, error } = await supabase
      .from('gv_brands')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      console.log('❌ FAIL: Accessed resource with random ID')
      return false
    }
  }

  console.log('✅ PASS: IDOR prevented by RLS')
  return true
}
```

**Expected Result:** ✅ Cannot access resources by guessing IDs

---

## Summary Checklist

### Critical Tests (MUST PASS before production)
- [ ] SEC-001: RLS enabled on all tables
- [ ] MTI-001: Multi-tenant isolation verified
- [ ] MTI-003: Unauthenticated access blocked
- [ ] AUTH-001: Password strength enforced
- [ ] AUTH-004: Account lockout working
- [ ] AUTHZ-001: Role-based access working
- [ ] API-001: JWT validation working
- [ ] INP-001: SQL injection prevented
- [ ] PAY-001: Invoice data protected
- [ ] PAY-002: Subscription data protected
- [ ] PEN-001: Privilege escalation prevented
- [ ] PEN-003: IDOR prevented

### High Priority Tests (Should pass)
- [ ] AUTH-002: Leaked password protection enabled
- [ ] AUTH-003: Email verification enforced
- [ ] AUTHZ-002: Service role properly restricted
- [ ] API-002: API key security working
- [ ] API-003: Edge functions authenticated
- [ ] INP-002: XSS prevention working
- [ ] SESS-001: Token expiry working
- [ ] SESS-002: Session refresh working
- [ ] SESS-003: Session invalidation working
- [ ] RATE-001: Login rate limiting working
- [ ] RATE-002: API rate limiting working

### Medium Priority Tests (Nice to have)
- [ ] SEC-002: No security advisories
- [ ] SEC-003: Environment variables secure
- [ ] INP-003: Input length limits enforced
- [ ] PEN-002: Mass assignment prevented

---

## Test Execution Plan

### Phase 1: Pre-Migration Tests (Before applying RLS migration)
1. Run SEC-002 (security advisory check)
2. Document current vulnerabilities
3. Create test user accounts

### Phase 2: Post-Migration Tests (After RLS migration)
1. Run all Critical tests (MTI, AUTH, AUTHZ, API, PAY, PEN)
2. Fix any failures immediately
3. Re-test until all pass

### Phase 3: Integration Tests
1. Run all High Priority tests
2. Test with real user workflows
3. Performance testing under load

### Phase 4: Penetration Testing
1. External security audit
2. Automated vulnerability scanning
3. Manual penetration testing

### Phase 5: Production Monitoring
1. Set up real-time security alerts
2. Monitor audit logs
3. Track security metrics
4. Regular security reviews

---

## Test Report Template

```markdown
# Security Test Report
**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** [Staging/Production]

## Test Results
| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| SEC-001 | RLS Coverage | ✅ PASS | All tables protected |
| MTI-001 | Multi-tenant Isolation | ✅ PASS | No cross-brand access |
| ... | ... | ... | ... |

## Critical Failures
[List any critical failures that block production]

## Recommendations
[Security improvements and next steps]

## Sign-off
- [ ] All critical tests passed
- [ ] All high priority tests passed
- [ ] Security team approval
- [ ] Ready for production
```

---

**End of Security Testing Checklist**
