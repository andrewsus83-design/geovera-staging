# GeoVera SaaS - Authentication & API Security Configuration Guide

**Project:** staging-geovera (vozjwptzutolvkvfpknk)
**Date:** 2026-02-12
**Classification:** Production Security Documentation

---

## Table of Contents
1. [Authentication Security](#1-authentication-security)
2. [Password Security](#2-password-security)
3. [Session Management](#3-session-management)
4. [Rate Limiting](#4-rate-limiting)
5. [API Security](#5-api-security)
6. [Edge Function Security](#6-edge-function-security)
7. [JWT Token Security](#7-jwt-token-security)
8. [OAuth Security](#8-oauth-security)
9. [CORS Configuration](#9-cors-configuration)
10. [Input Validation](#10-input-validation)

---

## 1. Authentication Security

### 1.1 Current Configuration (Supabase Auth)

GeoVera uses Supabase Authentication with Google OAuth. Current setup:

```typescript
// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 1.2 Required Security Settings (Supabase Dashboard)

Navigate to: **Authentication → Settings**

```yaml
Enable Email Confirmations: true
Disable Signups: false  # Enable for public launch
Enable Phone Confirmations: false  # SMS not used
Require Email Confirmations: true  # CRITICAL for production

# Password Requirements
Minimum Password Length: 12
Require Uppercase: true
Require Lowercase: true
Require Numbers: true
Require Special Characters: true
```

### 1.3 Enable Leaked Password Protection

**CRITICAL - Currently DISABLED**

Navigate to: **Authentication → Policies**

```yaml
Leaked Password Protection: ENABLED
Provider: HaveIBeenPwned.org
Action: Reject passwords found in breaches
```

This prevents users from using passwords that have been exposed in data breaches.

### 1.4 Email Verification Flow

```typescript
// Current flow (verify this is implemented)
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        // Additional user metadata
      }
    }
  })

  if (error) throw error

  // User must verify email before accessing system
  // Show: "Please check your email to confirm your account"
  return data
}
```

### 1.5 Multi-Factor Authentication (MFA)

**Recommended for Production (Phase 2)**

```typescript
// Enable MFA for high-value accounts
async function enableMFA() {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'GeoVera App'
  })

  if (error) throw error

  // Show QR code to user
  return data
}
```

**Configuration:**
```yaml
MFA Settings (Dashboard → Authentication → MFA):
  Enable TOTP: true
  Require for Admin Roles: true (Phase 2)
  Grace Period: 7 days
```

---

## 2. Password Security

### 2.1 Password Requirements

**Current Requirements (to be enforced):**

```typescript
// Password validation function
function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain special characters')
  }

  // Check against common passwords
  const commonPasswords = [
    'password123',
    'qwerty123',
    'admin123',
    // ... add more
  ]

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 2.2 Password Reset Security

```typescript
// Secure password reset flow
async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  if (error) throw error

  // Always show same message (prevent user enumeration)
  return "If that email exists, we've sent a password reset link"
}

// Password reset handler
async function resetPassword(newPassword: string) {
  // Validate password strength
  const validation = validatePassword(newPassword)
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '))
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error

  // Log security event
  await logSecurityEvent({
    event_type: 'password_reset',
    severity: 'medium',
    description: 'User successfully reset password'
  })
}
```

### 2.3 Password Change Policy

```typescript
// Change password (authenticated user)
async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  // Verify current password first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  })

  if (signInError) {
    throw new Error('Current password is incorrect')
  }

  // Validate new password
  const validation = validatePassword(newPassword)
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '))
  }

  // Prevent reusing current password
  if (currentPassword === newPassword) {
    throw new Error('New password must be different from current password')
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error

  // Log security event
  await logSecurityEvent({
    event_type: 'password_changed',
    severity: 'medium',
    description: 'User changed password'
  })

  // Invalidate all other sessions
  await supabase.auth.signOut({ scope: 'others' })
}
```

---

## 3. Session Management

### 3.1 JWT Token Configuration

**Supabase Dashboard → Settings → API**

```yaml
JWT Settings:
  JWT Secret: [auto-generated by Supabase]
  JWT Expiry: 3600 seconds (1 hour)
  Refresh Token Expiry: 2592000 seconds (30 days)
  Refresh Token Rotation: ENABLED
  Reuse Interval: 10 seconds
```

### 3.2 Session Refresh Logic

```typescript
// Automatic session refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user.id)

    // Store session
    localStorage.setItem('session', JSON.stringify(session))
  }

  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed')

    // Update stored session
    localStorage.setItem('session', JSON.stringify(session))
  }

  if (event === 'SIGNED_OUT') {
    console.log('User signed out')

    // Clear session
    localStorage.removeItem('session')
  }
})

// Proactive refresh before expiry
setInterval(async () => {
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now

    // Refresh if within 5 minutes of expiry
    if (timeUntilExpiry < 5 * 60 * 1000) {
      await supabase.auth.refreshSession()
    }
  }
}, 60000) // Check every minute
```

### 3.3 Session Invalidation

```typescript
// Sign out current session
async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Sign out all sessions (security action)
async function signOutAllSessions() {
  const { error } = await supabase.auth.signOut({ scope: 'global' })
  if (error) throw error

  await logSecurityEvent({
    event_type: 'all_sessions_terminated',
    severity: 'high',
    description: 'User terminated all active sessions'
  })
}
```

### 3.4 Concurrent Session Limits

```typescript
// Track active sessions (implement in Edge Function)
async function trackSession(userId: string, sessionToken: string) {
  // Store session in database
  await supabase.from('active_sessions').insert({
    user_id: userId,
    session_token: sessionToken,
    ip_address: request.headers.get('x-forwarded-for'),
    user_agent: request.headers.get('user-agent'),
    expires_at: new Date(Date.now() + 3600000) // 1 hour
  })

  // Check concurrent sessions
  const { data: sessions } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date())

  // Limit to 5 concurrent sessions
  if (sessions.length > 5) {
    // Terminate oldest session
    const oldestSession = sessions[0]
    await supabase
      .from('active_sessions')
      .delete()
      .eq('id', oldestSession.id)

    await logSecurityEvent({
      event_type: 'session_limit_exceeded',
      severity: 'medium',
      description: 'User exceeded concurrent session limit'
    })
  }
}
```

---

## 4. Rate Limiting

### 4.1 Authentication Rate Limits

**Implement via Edge Functions or Supabase Edge Middleware**

```typescript
// rate-limiter.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

interface RateLimitConfig {
  maxAttempts: number
  windowSeconds: number
  blockDurationSeconds: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowSeconds: 900, blockDurationSeconds: 3600 }, // 5 attempts per 15 min, block 1 hour
  signup: { maxAttempts: 3, windowSeconds: 3600, blockDurationSeconds: 7200 }, // 3 attempts per hour, block 2 hours
  password_reset: { maxAttempts: 3, windowSeconds: 3600, blockDurationSeconds: 3600 },
  api_call: { maxAttempts: 100, windowSeconds: 60, blockDurationSeconds: 300 } // 100 per minute, block 5 min
}

export async function checkRateLimit(
  identifier: string, // IP or user ID
  action: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number }> {
  const config = RATE_LIMITS[action]
  const key = `ratelimit:${action}:${identifier}`
  const blockKey = `blocked:${action}:${identifier}`

  // Check if blocked
  const blocked = await redis.get(blockKey)
  if (blocked) {
    return { allowed: false, remaining: 0 }
  }

  // Get current count
  const count = await redis.incr(key)

  // Set expiry on first request
  if (count === 1) {
    await redis.expire(key, config.windowSeconds)
  }

  // Check if exceeded
  if (count > config.maxAttempts) {
    // Block the identifier
    await redis.setex(blockKey, config.blockDurationSeconds, '1')

    // Log security event
    await logSecurityEvent({
      event_type: 'rate_limit_exceeded',
      severity: 'high',
      description: `Rate limit exceeded for ${action}`,
      metadata: { identifier, action, count }
    })

    return { allowed: false, remaining: 0 }
  }

  return {
    allowed: true,
    remaining: config.maxAttempts - count
  }
}

// Middleware wrapper
export function withRateLimit(
  action: keyof typeof RATE_LIMITS,
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const identifier = req.headers.get('x-forwarded-for') || 'unknown'

    const { allowed, remaining } = await checkRateLimit(identifier, action)

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': RATE_LIMITS[action].blockDurationSeconds.toString()
          }
        }
      )
    }

    const response = await handler(req)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Limit', RATE_LIMITS[action].maxAttempts.toString())

    return response
  }
}
```

### 4.2 Failed Login Tracking

```typescript
// Track failed login attempts
async function trackFailedLogin(email: string, ipAddress: string) {
  const { error } = await supabase.from('security_events').insert({
    event_type: 'failed_login',
    severity: 'medium',
    description: `Failed login attempt for ${email}`,
    metadata: { email },
    ip_address: ipAddress,
    user_agent: navigator.userAgent
  })

  // Check if account should be locked
  const { data: recentFailures } = await supabase
    .from('security_events')
    .select('*')
    .eq('event_type', 'failed_login')
    .eq('metadata->>email', email)
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000)) // Last 15 minutes

  if (recentFailures && recentFailures.length >= 5) {
    // Lock account
    await lockAccount(email, 60) // Lock for 60 minutes

    await supabase.from('security_events').insert({
      event_type: 'account_locked',
      severity: 'high',
      description: `Account locked due to multiple failed login attempts`,
      metadata: { email, failed_attempts: recentFailures.length },
      ip_address: ipAddress
    })
  }
}

async function lockAccount(email: string, minutes: number) {
  const { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (user) {
    const lockedUntil = new Date(Date.now() + minutes * 60 * 1000)

    await supabase
      .from('user_brands')
      .update({
        locked_until: lockedUntil,
        locked_at: new Date()
      })
      .eq('user_id', user.id)
  }
}
```

### 4.3 Account Lockout Policy

```typescript
// Check if account is locked before authentication
async function checkAccountLock(email: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('profiles')
    .select(`
      id,
      user_brands (
        locked_until,
        locked_at
      )
    `)
    .eq('email', email)
    .single()

  if (!user?.user_brands?.[0]) return false

  const lockedUntil = user.user_brands[0].locked_until

  if (lockedUntil && new Date(lockedUntil) > new Date()) {
    const minutesRemaining = Math.ceil(
      (new Date(lockedUntil).getTime() - Date.now()) / 60000
    )

    throw new Error(
      `Account is locked. Please try again in ${minutesRemaining} minutes.`
    )
  }

  // Unlock if lock period has expired
  if (lockedUntil) {
    await supabase
      .from('user_brands')
      .update({
        locked_until: null,
        locked_at: null
      })
      .eq('user_id', user.id)
  }

  return false
}
```

---

## 5. API Security

### 5.1 API Key Management

```typescript
// Generate API key (for brand owners)
async function generateAPIKey(brandId: string, name: string) {
  const user = await supabase.auth.getUser()

  // Verify user is brand owner
  const { data: userBrand } = await supabase
    .from('user_brands')
    .select('role')
    .eq('user_id', user.data.user?.id)
    .eq('brand_id', brandId)
    .single()

  if (userBrand?.role !== 'owner') {
    throw new Error('Only brand owners can generate API keys')
  }

  // Generate secure random key
  const apiKey = `gv_${crypto.randomUUID().replace(/-/g, '')}`

  // Hash the key (store hash, not plaintext)
  const hashedKey = await hashAPIKey(apiKey)

  // Store in database
  await supabase.from('api_keys').insert({
    brand_id: brandId,
    name,
    key_hash: hashedKey,
    key_prefix: apiKey.substring(0, 10), // For display
    created_by: user.data.user?.id
  })

  // Return plaintext key ONCE (user must save it)
  return apiKey
}

async function hashAPIKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verify API key (in Edge Function)
async function verifyAPIKey(apiKey: string): Promise<{ brandId: string } | null> {
  const hashedKey = await hashAPIKey(apiKey)

  const { data } = await supabase
    .from('api_keys')
    .select('brand_id, revoked')
    .eq('key_hash', hashedKey)
    .single()

  if (!data || data.revoked) {
    return null
  }

  // Update last_used
  await supabase
    .from('api_keys')
    .update({ last_used: new Date() })
    .eq('key_hash', hashedKey)

  return { brandId: data.brand_id }
}
```

### 5.2 API Request Validation

```typescript
// Validate and sanitize API requests
function validateAPIRequest(req: Request, schema: any) {
  const contentType = req.headers.get('content-type')

  // Require JSON content type
  if (!contentType?.includes('application/json')) {
    throw new Error('Content-Type must be application/json')
  }

  // Validate request size (prevent DoS)
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
    throw new Error('Request payload too large')
  }

  // Validate against schema (use Zod or similar)
  const body = await req.json()
  const validated = schema.parse(body)

  return validated
}
```

---

## 6. Edge Function Security

### 6.1 Secure Edge Function Template

```typescript
// functions/secure-endpoint/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // 2. Rate limiting
    const { allowed } = await checkRateLimit(user.id, 'api_call')
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Validate input
    const body = await validateAPIRequest(req, requestSchema)

    // 4. Execute business logic
    const result = await processRequest(body, user.id, supabase)

    // 5. Return response
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // Log error (but don't expose internal details)
    console.error('Error:', error)

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 6.2 Input Sanitization

```typescript
import { z } from 'zod'

// Example schema for brand creation
const createBrandSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  website: z.string().url().optional(),
  category: z.enum(['ecommerce', 'saas', 'content', 'other']),
  description: z.string().max(500).trim().optional()
})

// Sanitize HTML input (prevent XSS)
function sanitizeHTML(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Sanitize SQL input (use parameterized queries instead, but this is a backup)
function sanitizeSQL(input: string): string {
  return input.replace(/['";]/g, '')
}
```

---

## 7. JWT Token Security

### 7.1 Token Validation

```typescript
// Validate JWT in Edge Function
import { jwtVerify } from 'https://deno.land/x/jose@v4.14.4/index.ts'

async function verifyJWT(token: string): Promise<any> {
  const secret = new TextEncoder().encode(
    Deno.env.get('SUPABASE_JWT_SECRET')
  )

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'supabase',
      audience: 'authenticated'
    })

    // Check expiry
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired')
    }

    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}
```

### 7.2 Token Claims Verification

```typescript
// Verify required claims
function verifyTokenClaims(payload: any) {
  if (!payload.sub) {
    throw new Error('Missing user ID claim')
  }

  if (!payload.email) {
    throw new Error('Missing email claim')
  }

  if (!payload.role || payload.role !== 'authenticated') {
    throw new Error('Invalid role claim')
  }

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role
  }
}
```

---

## 8. OAuth Security

### 8.1 Google OAuth Configuration

**Supabase Dashboard → Authentication → Providers → Google**

```yaml
Client ID: [Your Google Client ID]
Client Secret: [Your Google Client Secret]
Authorized redirect URIs:
  - https://vozjwptzutolvkvfpknk.supabase.co/auth/v1/callback
  - http://localhost:3000/auth/callback (dev only)
```

### 8.2 OAuth Flow Security

```typescript
// Initiate OAuth flow with PKCE
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email profile',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })

  if (error) throw error
  return data
}

// Handle OAuth callback
async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (!code) {
    throw new Error('Missing authorization code')
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) throw error

  // Create profile if new user
  if (data.user) {
    await ensureProfileExists(data.user)
  }

  return data
}

async function ensureProfileExists(user: any) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existing) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url
    })
  }
}
```

---

## 9. CORS Configuration

### 9.1 Secure CORS Policy

```typescript
// Edge Function CORS configuration
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  // Dev environments (remove in production)
  'http://localhost:3000',
  'http://localhost:5173'
]

function getCORSHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin')

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  }

  // Return restrictive headers for unknown origins
  return {
    'Access-Control-Allow-Origin': 'null'
  }
}
```

---

## 10. Input Validation

### 10.1 SQL Injection Prevention

```typescript
// ALWAYS use parameterized queries via Supabase client
// ✅ CORRECT (safe from SQL injection)
const { data } = await supabase
  .from('brands')
  .select('*')
  .eq('name', userInput) // Automatically parameterized

// ❌ NEVER do this (vulnerable to SQL injection)
// const { data } = await supabase.rpc('raw_query', {
//   query: `SELECT * FROM brands WHERE name = '${userInput}'`
// })
```

### 10.2 XSS Prevention

```typescript
// Sanitize user input before rendering
import DOMPurify from 'dompurify'

function sanitizeUserContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title']
  })
}

// React component example
function UserContent({ content }: { content: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitizeUserContent(content)
      }}
    />
  )
}
```

### 10.3 CSRF Protection

```typescript
// Generate CSRF token
function generateCSRFToken(): string {
  return crypto.randomUUID()
}

// Verify CSRF token in Edge Function
function verifyCSRFToken(req: Request): boolean {
  const cookieToken = getCookie(req, 'csrf_token')
  const headerToken = req.headers.get('X-CSRF-Token')

  if (!cookieToken || !headerToken) {
    return false
  }

  return cookieToken === headerToken
}

// Set CSRF cookie
function setCSRFCookie(res: Response, token: string) {
  res.headers.set(
    'Set-Cookie',
    `csrf_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
  )
}
```

---

## 11. Security Headers

### 11.1 Required Response Headers

```typescript
// Add security headers to all responses
function addSecurityHeaders(res: Response): Response {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co"
  )
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  return res
}
```

---

## 12. Environment Variables Security

### 12.1 Sensitive Variables (Never Commit to Git)

```bash
# .env.local (NEVER commit this file)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vozjwptzutolvkvfpknk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # Public anon key (safe to expose)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...     # NEVER expose to frontend
SUPABASE_JWT_SECRET=your-jwt-secret     # NEVER expose

# Rate Limiting
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=your-token

# OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### 12.2 Environment Variable Validation

```typescript
// validate-env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test'])
})

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format())
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}
```

---

## 13. Deployment Checklist

Before deploying to production:

### Authentication
- [ ] Email verification enabled
- [ ] Leaked password protection enabled
- [ ] Password requirements enforced (12+ chars, complexity)
- [ ] MFA available for admin accounts
- [ ] OAuth redirect URIs configured correctly

### Rate Limiting
- [ ] Login rate limiting active (5 per 15 min)
- [ ] Signup rate limiting active (3 per hour)
- [ ] API rate limiting active (100 per minute)
- [ ] Account lockout after 5 failed attempts

### Session Management
- [ ] JWT expiry set to 1 hour
- [ ] Refresh token rotation enabled
- [ ] Session invalidation on password change
- [ ] Concurrent session limits enforced

### API Security
- [ ] All Edge Functions require JWT
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS sanitization implemented
- [ ] CSRF protection active

### Headers & CORS
- [ ] Security headers set on all responses
- [ ] CORS restricted to allowed origins
- [ ] HTTPS enforced (no HTTP)
- [ ] CSP policy configured

### Monitoring
- [ ] Audit logs enabled
- [ ] Security events logged
- [ ] Failed login tracking active
- [ ] Rate limit violations logged
- [ ] Alerting configured for critical events

---

## 14. Emergency Response

### Account Compromise Response

1. **Immediate Actions:**
   ```typescript
   // Revoke all sessions
   await supabase.auth.signOut({ scope: 'global' })

   // Lock account
   await lockAccount(email, 24 * 60) // 24 hours

   // Revoke API keys
   await supabase
     .from('api_keys')
     .update({ revoked: true })
     .eq('brand_id', brandId)

   // Log incident
   await supabase.from('security_events').insert({
     event_type: 'account_compromised',
     severity: 'critical',
     description: 'Account compromise detected - all sessions revoked',
     user_id: userId
   })

   // Send email notification
   await sendSecurityAlert(email, 'account_compromised')
   ```

2. **Investigation:**
   - Review audit logs
   - Check for unauthorized data access
   - Identify attack vector
   - Document incident

3. **Recovery:**
   - Force password reset
   - Review and revoke suspicious API keys
   - Unlock account after user verification
   - Update security measures

---

## Conclusion

This authentication and API security configuration guide provides production-grade security for the GeoVera SaaS platform. All configurations should be tested in staging before production deployment.

**Priority Actions:**
1. Enable leaked password protection (Dashboard)
2. Implement rate limiting (Edge Functions)
3. Configure CORS properly
4. Set up audit logging
5. Test all security measures

**Ongoing:**
- Regular security audits
- Monitor security events
- Update dependencies
- Review and rotate secrets
- Train team on security practices
