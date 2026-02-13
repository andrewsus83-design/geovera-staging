# GeoVera - Staging vs Production Requirements

## Executive Summary

**Critical Rule:** Staging MUST be identical to Production in ALL aspects except quantity and Xendit payment integration.

---

## 🎯 Core Principles

### 1. **NO DUMMY DATA** ✅
- Staging uses REAL brands (30 brands across 6 categories)
- Staging uses REAL creators (200 creators)
- All data must be production-quality for QC and consistency testing
- No bypasses, no shortcuts, no test placeholders

### 2. **SAME PROCESSES** ✅
- All guardrails identical to Production
- All RLS (Row Level Security) policies identical
- All validation rules identical
- All AI workflows identical
- All quota enforcement identical

### 3. **SAME SECURITY** ✅
- RLS policies enforced
- Authentication required
- No admin backdoors
- No testing bypasses

---

## 📊 Staging Environment Specifications

### Data Volume
```
Production:        Unlimited brands & creators
Staging:           30 brands (6 categories) + 200 creators

Purpose:           Quality control, consistency testing, market analysis
Quality Standard:  100% production-ready
```

### Brand Distribution (30 Total)
```
6 Categories × 5 Brands Each = 30 Brands

Examples:
- Fashion & Apparel:    5 brands
- Food & Beverage:      5 brands
- Technology:           5 brands
- Health & Wellness:    5 brands
- Home & Lifestyle:     5 brands
- Professional Services: 5 brands
```

### Creator Distribution (200 Total)
```
Distributed across platforms:
- Instagram:  60 creators
- TikTok:     60 creators
- YouTube:    40 creators
- LinkedIn:   20 creators
- Twitter:    20 creators
```

---

## 💰 Content Generation Access Control

### CRITICAL RULE: Paid Brands Only

**Content Generation (Feature 4) ONLY for PAYING brands:**

```typescript
// Pseudo-code for access control
if (brand.subscription_tier === 'free' || brand.subscription_tier === null) {
  // NO content generation features
  // GeoVera only collects data for:
  // - IP (Intellectual Property) analysis
  // - Case studies
  // - Market analysis
  // - Internal content generation for GeoVera marketing

  return {
    access: 'denied',
    reason: 'Content generation requires paid subscription',
    available_features: [
      'Data collection',
      'Market insights (view only)',
      'Basic analytics'
    ]
  };
}

if (brand.subscription_tier in ['basic', 'premium', 'partner']) {
  // Full content generation access
  return {
    access: 'granted',
    quota: getTierLimits(brand.subscription_tier),
    features: [
      'AI article generation',
      'AI image generation',
      'AI video script generation',
      'Platform optimization',
      'Brand voice learning'
    ]
  };
}
```

### Free/Non-Paying Brands
**What GeoVera Does:**
- ✅ Collect search data (SEO, GEO, Social)
- ✅ Track competitor movements
- ✅ Analyze market trends
- ✅ Generate insights for GeoVera's internal use
- ✅ Build case studies
- ✅ Create market intelligence reports

**What GeoVera Does NOT Do:**
- ❌ Generate content for the brand
- ❌ Create articles for brand
- ❌ Create images for brand
- ❌ Create videos for brand
- ❌ Provide content optimization

**Purpose:** IP collection, market research, GeoVera's own content

---

## 🔐 Subscription Tiers & Access

### Basic Tier ($399/month)
```json
{
  "keywords": 5,
  "insights": 5,
  "articles": 1,
  "images": 1,
  "videos": 0,
  "content_generation": true,
  "data_collection": true
}
```

### Premium Tier ($699/month)
```json
{
  "keywords": 8,
  "insights": 8,
  "articles": 3,
  "images": 3,
  "videos": 1,
  "content_generation": true,
  "data_collection": true
}
```

### Partner Tier ($1,099/month)
```json
{
  "keywords": 15,
  "insights": 12,
  "articles": 6,
  "images": 6,
  "videos": 3,
  "content_generation": true,
  "data_collection": true
}
```

### Free Tier (No Payment)
```json
{
  "keywords": 0,
  "insights": 0,
  "articles": 0,
  "images": 0,
  "videos": 0,
  "content_generation": false,
  "data_collection": true,
  "purpose": "IP collection, market analysis, GeoVera internal content"
}
```

---

## 🚫 The ONLY Difference: Payment Integration

### Staging
```typescript
// Xendit integration DISABLED
const PAYMENT_PROVIDER = null;
const XENDIT_ENABLED = false;

// Reason: Waiting for Xendit approval
// Alternative: Manual subscription activation by admin
```

### Production
```typescript
// Xendit integration ENABLED
const PAYMENT_PROVIDER = 'xendit';
const XENDIT_ENABLED = true;
const XENDIT_API_KEY = process.env.XENDIT_SECRET_KEY;
```

**Workaround in Staging:**
- Admin manually activates subscriptions in Supabase Dashboard
- User signs up → Admin assigns tier manually
- All other features work identically to Production

---

## ✅ Identical Features Checklist

### Database
- [x] Same RLS policies
- [x] Same triggers
- [x] Same helper functions
- [x] Same constraints
- [x] Same indexes
- [x] Same data types

### Edge Functions
- [x] Same AI providers (Gemini, OpenAI, Claude, Perplexity)
- [x] Same API integrations (SerpAPI, Apify)
- [x] Same tier enforcement logic
- [x] Same quota checking
- [x] Same error handling
- [x] Same response formats

### Frontend
- [x] Same UI/UX
- [x] Same authentication flow
- [x] Same onboarding process
- [x] Same dashboard features
- [x] Same content generation UI
- [x] ONLY difference: Payment button disabled

### Security
- [x] Same RLS policies
- [x] Same auth.uid() checks
- [x] Same user_brands junction table
- [x] Same API key validation
- [x] Same CORS policies

### Business Logic
- [x] Same tier limits enforcement
- [x] Same quota tracking
- [x] Same content generation rules
- [x] Same AI orchestration
- [x] Same platform optimization

---

## 🎯 Quality Control Strategy

### Why 30 Brands + 200 Creators?

**Purpose:**
1. **Consistency Testing:** Verify all features work identically to Production
2. **Market Analysis:** Real data for GeoVera's IP and research
3. **Case Studies:** Generate authentic success stories
4. **QA Validation:** Test edge cases with real-world data
5. **Performance Benchmarking:** Measure system performance at scale

**Benefits:**
- Real data = Real insights
- Authentic testing scenarios
- Production-ready validation
- No need to "clean up" before Production launch
- Seamless migration path

---

## 🔄 Deployment Workflow

### Staging → Production Migration
```bash
# When Xendit is approved:

1. Enable Xendit in Production
   - Add XENDIT_SECRET_KEY to environment variables
   - Deploy payment integration Edge Functions
   - Update frontend to show payment UI

2. Everything else: ALREADY IDENTICAL
   - Database schemas ✅
   - Edge Functions ✅
   - RLS policies ✅
   - Business logic ✅
   - UI/UX ✅

3. Zero downtime migration
   - No code changes needed
   - Just enable payment provider
   - Deploy to Production
```

---

## 📝 Implementation Notes

### Content Generation Access Control

**Implementation in Edge Functions:**

```typescript
// Example: generate-article/index.ts

export async function generateArticle(req: Request) {
  const { brand_id, topic } = await req.json();

  // Get brand subscription tier
  const { data: brand } = await supabase
    .from('gv_brands')
    .select('subscription_tier')
    .eq('id', brand_id)
    .single();

  // CRITICAL CHECK: Only paid brands can generate content
  if (!brand.subscription_tier || brand.subscription_tier === 'free') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Content generation requires an active paid subscription',
      message: 'Upgrade to Basic, Premium, or Partner tier to generate content',
      data_collection: 'enabled',
      purpose: 'Your brand data is being collected for market analysis'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check tier quota
  const quotaExceeded = await check_tier_limit(brand_id, 'articles');
  if (quotaExceeded) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Monthly article quota exceeded',
      message: 'Upgrade your tier or wait until next month'
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Proceed with content generation
  const article = await generateWithAI(topic, brand);
  await increment_content_usage(brand_id, 'article');

  return new Response(JSON.stringify({
    success: true,
    article
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### RLS Policy for Content Library

```sql
-- Ensure users only see content for brands they own AND that are paid
CREATE POLICY "Users access own paid brand content"
  ON gv_content_library FOR ALL
  USING (
    brand_id IN (
      SELECT b.id FROM gv_brands b
      JOIN user_brands ub ON b.id = ub.brand_id
      WHERE ub.user_id = auth.uid()
      AND b.subscription_tier IN ('basic', 'premium', 'partner')
    )
  );
```

---

## 🎯 Validation Requirements

### Before Production Launch

**Database Validation:**
- [ ] All tables have RLS enabled
- [ ] All foreign keys properly set
- [ ] All triggers functioning
- [ ] All helper functions tested
- [ ] No dummy data in any table
- [ ] All 30 brands are real companies
- [ ] All 200 creators are real accounts

**Edge Functions Validation:**
- [ ] All 12 core functions deployed
- [ ] Tier enforcement working
- [ ] Quota tracking accurate
- [ ] AI providers responding
- [ ] API integrations working
- [ ] Error handling comprehensive

**Frontend Validation:**
- [ ] Onboarding works end-to-end
- [ ] Dashboard shows real data
- [ ] Content generation respects tiers
- [ ] Chat AI orchestration works
- [ ] Insights display correctly

**Security Validation:**
- [ ] RLS prevents unauthorized access
- [ ] Users can't see other brands
- [ ] API keys are secure
- [ ] Auth flow is secure
- [ ] No SQL injection vulnerabilities

---

## 🚀 Conclusion

**Staging = Production** except:
1. Data volume (30 brands vs unlimited)
2. Xendit payment (disabled vs enabled)

**Everything else is IDENTICAL:**
- Same code
- Same database schemas
- Same RLS policies
- Same business logic
- Same AI integrations
- Same security
- Same user experience

**Result:**
- 100% confidence in Production deployment
- Zero surprises during launch
- Seamless migration path
- Real data for quality control
- Authentic testing environment

---

**Last Updated:** 2026-02-13
**Status:** ✅ Staging environment ready for 30 brands + 200 creators
