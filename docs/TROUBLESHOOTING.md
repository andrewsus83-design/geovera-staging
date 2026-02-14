# GEOVERA TROUBLESHOOTING GUIDE
## Common Errors, Fixes, and Performance Issues

**Version:** 1.0
**Last Updated:** February 14, 2026
**Platform:** geovera.xyz

---

## TABLE OF CONTENTS

1. [Authentication Errors](#authentication-errors)
2. [API Rate Limit Errors](#api-rate-limit-errors)
3. [Database Connection Issues](#database-connection-issues)
4. [Content Generation Failures](#content-generation-failures)
5. [Cost Overrun Issues](#cost-overrun-issues)
6. [Performance Issues](#performance-issues)
7. [Tier Access Errors](#tier-access-errors)
8. [Payment & Billing Issues](#payment--billing-issues)

---

## AUTHENTICATION ERRORS

### Error 1: Missing Authorization Header

**Error Message:**
```json
{
  "error": "Missing Authorization header - Please login first",
  "code": "AUTH_REQUIRED",
  "status": 401
}
```

**Cause:**
- User not logged in
- JWT token expired
- Token not included in request

**Solution:**
```javascript
// 1. Check if user is logged in
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  // Redirect to login
  window.location.href = '/login.html';
}

// 2. Include Authorization header in all API calls
const { data, error } = await supabase.functions.invoke('function-name', {
  headers: {
    Authorization: `Bearer ${session.access_token}`
  },
  body: { /* request data */ }
});

// 3. Refresh expired token
const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
```

---

### Error 2: Invalid JWT Token

**Error Message:**
```json
{
  "error": "Invalid token",
  "code": "INVALID_TOKEN",
  "status": 401
}
```

**Cause:**
- Token tampered with
- Token expired
- Token from different environment (staging vs production)

**Solution:**
```javascript
// 1. Clear local storage and re-login
localStorage.clear();
await supabase.auth.signOut();
window.location.href = '/login.html';

// 2. Check token expiration
const { data: { session } } = await supabase.auth.getSession();
const expiresAt = new Date(session.expires_at * 1000);
const now = new Date();

if (expiresAt < now) {
  console.log('Token expired, refreshing...');
  await supabase.auth.refreshSession();
}

// 3. Verify Supabase URL matches environment
console.log('Supabase URL:', Deno.env.get('SUPABASE_URL'));
// Should match frontend VITE_SUPABASE_URL
```

---

### Error 3: User Not Found

**Error Message:**
```json
{
  "error": "User not found or deleted",
  "code": "USER_NOT_FOUND",
  "status": 404
}
```

**Cause:**
- User account deleted
- Database record missing
- RLS policy blocking access

**Solution:**
```sql
-- 1. Check user exists in auth.users
SELECT id, email, created_at, deleted_at
FROM auth.users
WHERE id = 'user-uuid';

-- 2. Check RLS policies allow access
SET ROLE authenticated;
SELECT * FROM brands WHERE user_id = 'user-uuid';

-- 3. Re-create user if necessary
-- (Support team only - requires admin access)
```

---

## API RATE LIMIT ERRORS

### Error 4: Daily Quota Exceeded

**Error Message:**
```json
{
  "error": "Rate limit exceeded",
  "message": "You have reached your daily quota of 1 article per day (Basic tier)",
  "quota": {
    "limit": 1,
    "used": 1,
    "resets_at": "2026-02-15T00:00:00Z"
  },
  "upgrade_url": "https://geovera.xyz/pricing",
  "code": "QUOTA_EXCEEDED",
  "status": 429
}
```

**Cause:**
- User exceeded tier-based daily quota
- Basic tier: 1 article/day
- Premium tier: 2 articles/day
- Partner tier: 3 articles/day

**Solutions:**

**Option 1: Wait for reset (free)**
```javascript
// Calculate time until reset
const resetDate = new Date('2026-02-15T00:00:00Z');
const now = new Date();
const hoursUntilReset = Math.ceil((resetDate - now) / (1000 * 60 * 60));

console.log(`Quota resets in ${hoursUntilReset} hours`);

// Display to user:
// "Your daily quota will reset in 8 hours. Upgrade to Premium for 2 articles/day."
```

**Option 2: Upgrade tier**
```javascript
// Redirect to pricing page
window.location.href = '/pricing.html?upgrade=true';

// After upgrading, quota immediately increases:
// Basic → Premium: 1/day → 2/day
// Premium → Partner: 2/day → 3/day
```

**Option 3: Request quota increase (Enterprise only)**
```
Contact: sales@geovera.xyz
Subject: Quota increase request
Include: Current tier, monthly usage, business case
```

---

### Error 5: AI Chat Quota Exceeded

**Error Message:**
```json
{
  "error": "Daily AI Chat quota exceeded",
  "message": "You have used 30/30 questions today (Basic tier)",
  "quota": {
    "limit_daily": 30,
    "used_today": 30,
    "resets_at": "2026-02-15T00:00:00Z"
  },
  "code": "CHAT_QUOTA_EXCEEDED",
  "status": 429
}
```

**Tier Quotas:**
- Basic: 30 QA/day
- Premium: 40 QA/day
- Partner: 50 QA/day

**Solution:**
```javascript
// 1. Check remaining quota before calling
const { data: quota } = await supabase
  .from('gv_ai_chat_sessions')
  .select('messages:gv_ai_chat_messages(count)')
  .eq('brand_id', brandId)
  .gte('created_at', new Date().toISOString().split('T')[0])
  .single();

const used = quota.messages[0].count;
const limit = { basic: 30, premium: 40, partner: 50 }[tier];
const remaining = limit - used;

if (remaining <= 0) {
  alert('Daily quota exceeded. Upgrade or wait until tomorrow.');
}

// 2. Display quota in UI
<div class="quota-badge">
  {remaining}/{limit} questions remaining today
</div>
```

---

### Error 6: Third-Party API Rate Limit

**Error Message:**
```json
{
  "error": "External API rate limit exceeded",
  "message": "Anthropic API rate limit: 50 requests per minute",
  "provider": "anthropic",
  "retry_after": 45,
  "code": "EXTERNAL_RATE_LIMIT",
  "status": 429
}
```

**Cause:**
- Claude API: 50 req/min
- OpenAI API: 500 req/min
- Perplexity API: 50 req/min
- Apify API: No limit (pay per use)
- SerpAPI: 100 req/min

**Solution:**
```typescript
// Implement exponential backoff
async function callWithRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i); // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Usage:
const result = await callWithRetry(async () => {
  return await supabase.functions.invoke('generate-article', {
    body: { /* ... */ }
  });
});
```

---

## DATABASE CONNECTION ISSUES

### Error 7: Too Many Connections

**Error Message:**
```json
{
  "error": "Database connection failed",
  "message": "FATAL: sorry, too many clients already",
  "code": "DB_CONNECTION_FAILED",
  "status": 503
}
```

**Cause:**
- PostgreSQL connection pool exhausted
- Default: 15 connections (Supabase Free tier)
- Pro tier: 90 connections

**Solution:**

**Option 1: Upgrade Supabase tier**
```
Free: 15 connections → Pro: 90 connections
Cost: $25/month
```

**Option 2: Optimize connection usage**
```typescript
// Use connection pooling
const supabase = createClient(url, key, {
  db: {
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000
    }
  }
});

// Always close connections
try {
  const { data, error } = await supabase.from('table').select();
  // ... use data
} finally {
  // Connection auto-released
}
```

**Option 3: Check for connection leaks**
```sql
-- View active connections
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change
FROM pg_stat_activity
WHERE datname = 'postgres'
ORDER BY query_start DESC;

-- Kill stuck connections (admin only)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '5 minutes';
```

---

### Error 8: Query Timeout

**Error Message:**
```json
{
  "error": "Query execution timeout",
  "message": "Query exceeded 30 second timeout",
  "query": "SELECT * FROM gv_creator_content WHERE...",
  "code": "QUERY_TIMEOUT",
  "status": 504
}
```

**Cause:**
- Query too complex
- Missing indexes
- Large dataset (1M+ rows)
- Inefficient joins

**Solution:**

**Option 1: Add indexes**
```sql
-- Check missing indexes
SELECT
  schemaname,
  tablename,
  attname AS column_name,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
AND tablename = 'gv_creator_content'
ORDER BY n_distinct DESC;

-- Add indexes on frequently queried columns
CREATE INDEX idx_creator_content_brand
ON gv_creator_content(brand_mentions);

CREATE INDEX idx_creator_content_date
ON gv_creator_content(posted_at DESC);
```

**Option 2: Optimize query**
```sql
-- Bad: Full table scan
SELECT * FROM gv_creator_content
WHERE brand_mentions::text LIKE '%Nike%';

-- Good: Use GIN index
CREATE INDEX idx_brand_mentions_gin
ON gv_creator_content USING GIN (brand_mentions);

SELECT * FROM gv_creator_content
WHERE brand_mentions @> '[{"brand": "Nike"}]'::jsonb;
```

**Option 3: Paginate results**
```javascript
// Bad: Load all 100K rows
const { data } = await supabase
  .from('gv_creator_content')
  .select('*');

// Good: Load 50 rows at a time
const pageSize = 50;
const page = 1;
const { data } = await supabase
  .from('gv_creator_content')
  .select('*')
  .range((page - 1) * pageSize, page * pageSize - 1);
```

---

## CONTENT GENERATION FAILURES

### Error 9: Content Generation Failed

**Error Message:**
```json
{
  "error": "Content generation failed",
  "message": "OpenAI API error: Model overloaded, please try again",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "code": "GENERATION_FAILED",
  "status": 500
}
```

**Cause:**
- AI provider API down
- Model overloaded
- Invalid prompt
- Insufficient credits

**Solution:**

**Option 1: Retry with exponential backoff**
```javascript
async function generateArticleWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: params
      });

      if (!error) return data;

      console.error(`Attempt ${i + 1} failed:`, error.message);

      if (i < maxRetries - 1) {
        const delay = 2000 * Math.pow(2, i); // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (err) {
      if (i === maxRetries - 1) throw err;
    }
  }
}
```

**Option 2: Fallback to alternative model**
```typescript
// Try GPT-4o-mini first, fallback to GPT-3.5-turbo
let model = 'gpt-4o-mini';
try {
  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }]
  });
} catch (error) {
  if (error.code === 'model_overloaded') {
    model = 'gpt-3.5-turbo';
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }]
    });
  }
}
```

**Option 3: Check API status**
```bash
# OpenAI Status
curl https://status.openai.com/api/v2/status.json

# Anthropic Status
curl https://status.anthropic.com/api/v2/status.json

# If down, wait or use alternative provider
```

---

### Error 10: Image Generation Failed

**Error Message:**
```json
{
  "error": "Image generation failed",
  "message": "DALL-E 3 content policy violation",
  "prompt": "...",
  "violation": "Unsafe content detected",
  "code": "CONTENT_POLICY_VIOLATION",
  "status": 400
}
```

**Cause:**
- Prompt violates OpenAI content policy
- NSFW content requested
- Copyrighted characters/brands
- Violent or harmful content

**Solution:**

**Option 1: Sanitize prompt**
```javascript
// Remove unsafe keywords
function sanitizePrompt(prompt) {
  const unsafeKeywords = [
    'nude', 'naked', 'nsfw', 'explicit', 'violent', 'blood',
    'gun', 'weapon', 'drug', 'alcohol', 'celebrity name'
  ];

  let clean = prompt.toLowerCase();
  unsafeKeywords.forEach(keyword => {
    clean = clean.replace(new RegExp(keyword, 'gi'), '');
  });

  return clean.trim();
}

const safePrompt = sanitizePrompt(userPrompt);
```

**Option 2: Use content policy checker**
```javascript
// Check prompt before generation
async function checkContentPolicy(prompt) {
  const { data } = await openai.moderations.create({
    input: prompt
  });

  if (data.results[0].flagged) {
    throw new Error('Content policy violation: ' + data.results[0].categories);
  }
}

await checkContentPolicy(prompt);
// Only generate if passes check
```

---

## COST OVERRUN ISSUES

### Error 11: Budget Exceeded

**Error Message:**
```json
{
  "error": "Monthly budget exceeded",
  "message": "You have used $1,200 of $1,100 monthly budget (Partner tier)",
  "usage": {
    "claude": 450.23,
    "openai": 380.45,
    "perplexity": 120.18,
    "apify": 180.50,
    "serpapi": 68.64
  },
  "code": "BUDGET_EXCEEDED",
  "status": 402
}
```

**Cause:**
- Excessive API usage
- Inefficient prompts (too long)
- Too many retries
- Unoptimized workflows

**Solution:**

**Option 1: Set up cost alerts**
```javascript
// Monitor daily costs
const { data: costs } = await supabase
  .from('gv_cost_tracking')
  .select('provider, cost_usd')
  .gte('created_at', new Date().toISOString().split('T')[0])
  .order('cost_usd', { ascending: false });

const totalToday = costs.reduce((sum, c) => sum + c.cost_usd, 0);

if (totalToday > 50) {
  alert('Warning: Daily costs exceeding $50. Review usage.');
}
```

**Option 2: Optimize prompts**
```typescript
// Bad: Verbose prompt (1,500 tokens)
const prompt = `You are an expert content writer with 10 years of experience...
[500 words of instructions]
Now write an article about: ${topic}`;

// Good: Concise prompt (200 tokens)
const prompt = `Write a professional 300-word article about: ${topic}
Tone: ${tone}. Keywords: ${keywords.join(', ')}.`;

// Cost savings: 1,300 tokens × $0.15/1M = $0.000195 per request
// At 1,000 requests/month: $195 savings
```

**Option 3: Cache responses**
```javascript
// Cache AI responses for 24 hours
const cacheKey = `article:${topic}:${tone}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached); // No API call, $0 cost
}

const article = await generateArticle(topic, tone);
await redis.setex(cacheKey, 86400, JSON.stringify(article)); // 24h TTL
return article;
```

**Option 4: Upgrade budget tier**
```
Contact: billing@geovera.xyz
Subject: Budget increase request
Include: Current usage, expected growth, business justification
```

---

## PERFORMANCE ISSUES

### Issue 12: Slow Page Load

**Symptoms:**
- Dashboard takes 5+ seconds to load
- White screen before content appears
- Slow navigation between pages

**Diagnosis:**
```javascript
// Measure page load time
window.addEventListener('load', () => {
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  console.log('Page load time:', loadTime, 'ms');

  // Breakdown:
  const dns = performance.timing.domainLookupEnd - performance.timing.domainLookupStart;
  const tcp = performance.timing.connectEnd - performance.timing.connectStart;
  const ttfb = performance.timing.responseStart - performance.timing.requestStart;
  const download = performance.timing.responseEnd - performance.timing.responseStart;
  const dom = performance.timing.domContentLoadedEventEnd - performance.timing.domLoading;

  console.log('DNS:', dns, 'ms');
  console.log('TCP:', tcp, 'ms');
  console.log('TTFB:', ttfb, 'ms');
  console.log('Download:', download, 'ms');
  console.log('DOM:', dom, 'ms');
});
```

**Solutions:**

**1. Enable caching:**
```javascript
// Service worker for offline caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

**2. Lazy load images:**
```html
<!-- Bad: All images load immediately -->
<img src="large-image.jpg" />

<!-- Good: Load when visible -->
<img src="large-image.jpg" loading="lazy" />
```

**3. Minify assets:**
```bash
# Install terser for JS minification
npm install -g terser

# Minify JavaScript
terser app.js -o app.min.js -c -m

# Minify CSS
npx clean-css-cli -o styles.min.css styles.css
```

**4. Use CDN:**
```javascript
// Vercel Edge Network automatically caches static assets
// No configuration needed if deployed on Vercel
```

---

### Issue 13: Slow API Responses

**Symptoms:**
- API calls take 10+ seconds
- Edge Functions timeout
- Database queries slow

**Diagnosis:**
```javascript
// Measure API response time
const start = Date.now();
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* ... */ }
});
const duration = Date.now() - start;
console.log('API response time:', duration, 'ms');

// Check Edge Function logs
supabase functions logs function-name --tail
```

**Solutions:**

**1. Add database indexes:**
```sql
-- Check slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Add indexes for slow queries
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_content_brand_date ON gv_content_library(brand_id, created_at DESC);
```

**2. Optimize Edge Function:**
```typescript
// Bad: Sequential API calls (10s total)
const result1 = await callAPI1(); // 5s
const result2 = await callAPI2(); // 5s

// Good: Parallel API calls (5s total)
const [result1, result2] = await Promise.all([
  callAPI1(), // 5s
  callAPI2()  // 5s
]);
```

**3. Use database connection pooling:**
```typescript
// Configure connection pool
const supabase = createClient(url, key, {
  db: {
    pool: {
      min: 2,
      max: 10
    }
  }
});
```

---

## TIER ACCESS ERRORS

### Error 14: Radar Access Denied

**Error Message:**
```json
{
  "error": "Tier insufficient",
  "message": "Radar is exclusive to Partner tier ($1,099/month)",
  "current_tier": "premium",
  "required_tier": "partner",
  "upgrade_url": "https://geovera.xyz/pricing",
  "code": "TIER_INSUFFICIENT",
  "status": 403
}
```

**Cause:**
- Basic or Premium tier trying to access Radar
- Radar is Partner-tier exclusive

**Solution:**
```javascript
// Check tier before showing Radar UI
const { data: brand } = await supabase
  .from('brands')
  .select('subscription_tier')
  .eq('id', brandId)
  .single();

if (brand.subscription_tier !== 'partner') {
  // Hide Radar navigation
  document.getElementById('radar-nav').style.display = 'none';

  // Show upgrade CTA
  showUpgradeCTA('Upgrade to Partner tier to access Radar');
}

// Or redirect to pricing
if (brand.subscription_tier !== 'partner') {
  window.location.href = '/pricing.html?feature=radar';
}
```

---

## PAYMENT & BILLING ISSUES

### Error 15: Payment Failed

**Error Message:**
```json
{
  "error": "Payment failed",
  "message": "Card declined: insufficient funds",
  "payment_method": "card_1234",
  "amount": 699.00,
  "currency": "USD",
  "code": "PAYMENT_FAILED",
  "status": 402
}
```

**Cause:**
- Insufficient funds
- Card expired
- Bank declined transaction
- Incorrect billing details

**Solution:**
```javascript
// 1. Update payment method
const { error } = await stripe.paymentMethods.update('pm_1234', {
  card: {
    exp_month: 12,
    exp_year: 2027
  }
});

// 2. Retry payment
const { paymentIntent, error } = await stripe.paymentIntents.create({
  amount: 69900, // $699.00
  currency: 'usd',
  payment_method: 'pm_1234',
  confirm: true
});

// 3. Contact support if persistent
// Email: billing@geovera.xyz
```

---

## SUPPORT ESCALATION

### When to Contact Support

**Immediate (P0 - Critical):**
- Complete system outage
- Data loss or corruption
- Security breach
- Payment processing failure affecting multiple users

**Within 1 hour (P1 - High):**
- Feature completely broken
- Cannot access account
- API errors affecting all users

**Within 4 hours (P2 - Medium):**
- Performance degradation
- Partial feature failure
- Tier access issues

**Within 24 hours (P3 - Low):**
- UI bugs
- Minor functionality issues
- Feature requests

### Support Channels

**Email:** support@geovera.xyz
**Emergency:** emergency@geovera.xyz (P0 only)
**Live Chat:** Available in dashboard (Mon-Fri 9am-5pm PST)
**Status Page:** https://status.geovera.xyz

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Next Review:** March 1, 2026
**Maintained By:** Support Engineering Team

**Questions or Issues?**
- Technical Support: support@geovera.xyz
- Billing Issues: billing@geovera.xyz
- Emergency: emergency@geovera.xyz
