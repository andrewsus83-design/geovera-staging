# GEOVERA ONBOARDING GUIDE
## Complete User Registration & First Brand Setup

**Version:** 1.0
**Last Updated:** February 14, 2026
**Onboarding Version:** v4 (5-step wizard)

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [User Registration](#user-registration)
3. [Onboarding Wizard (5 Steps)](#onboarding-wizard-5-steps)
4. [First Brand Setup](#first-brand-setup)
5. [First Creator Discovery](#first-creator-discovery)
6. [First Content Generation](#first-content-generation)
7. [First Hub Collection](#first-hub-collection)
8. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

### Onboarding Philosophy

GeoVera's onboarding is designed to be:
- **Fast:** 3-5 minutes to complete
- **Simple:** 5 clear steps with progressive disclosure
- **Guided:** Helpful tooltips and validation at each step
- **Flexible:** Skip optional fields, complete later

### User Journey

```
1. Sign Up (Email + Password)
   ↓
2. Email Verification
   ↓
3. Onboarding Wizard (5 Steps)
   - Step 1: Welcome
   - Step 2: Brand Information
   - Step 3: Social Media Links (optional)
   - Step 4: Confirmation
   - Step 5: Tier Selection
   ↓
4. Payment Setup
   ↓
5. Dashboard Access
   ↓
6. First Actions (Content Generation, Creator Discovery)
```

---

## USER REGISTRATION

### Step 1: Sign Up

**Endpoint:** `https://geovera.xyz/signup.html`

**Required Fields:**
- Email address (valid format)
- Password (min 8 characters, 1 uppercase, 1 lowercase, 1 number)
- Agree to Terms of Service & Privacy Policy

**Frontend Code:**
```javascript
// Sign up with email/password
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      full_name: 'John Doe',
      company: 'My Company Ltd.',
    },
    emailRedirectTo: 'https://geovera.xyz/onboarding-v4.html'
  }
});

if (error) {
  console.error('Sign up error:', error.message);
  // Display: "Email already registered" or "Invalid password format"
} else {
  // Display: "Check your email for verification link"
}
```

**Success Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "email_confirmed_at": null,
    "created_at": "2026-02-14T10:00:00Z"
  },
  "session": null
}
```

### Step 2: Email Verification

**Email Content:**
```
Subject: Verify your GeoVera account

Welcome to GeoVera!

Click the link below to verify your email address:
https://geovera.xyz/auth/callback?token=xxxxx

This link expires in 24 hours.

Questions? Reply to this email or visit https://geovera.xyz/help
```

**After Clicking Verification Link:**
- User redirected to: `https://geovera.xyz/onboarding-v4.html`
- Session created automatically
- JWT token stored in browser localStorage

---

## ONBOARDING WIZARD (5 STEPS)

### Architecture

**Page:** `frontend/onboarding-v4.html`

**Edge Function:** `supabase/functions/onboard-brand-v4/index.ts`

**Progress Tracking:**
```javascript
// Progress bar shows: 0% → 20% → 40% → 60% → 80% → 100%
const STEP_PROGRESS = {
  1: 0,   // Welcome
  2: 20,  // Brand info
  3: 40,  // Social media
  4: 60,  // Confirmation
  5: 80,  // Tier selection
  6: 100  // Complete
};
```

---

### Step 1: Welcome

**Purpose:** Introduce GeoVera and set expectations

**UI Elements:**
- Welcome message
- Key benefits (3-4 bullet points)
- "Get Started" button

**No Backend Call:** Pure frontend step

**Example UI:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress: [█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%

Welcome to GeoVera Intelligence

Transform your brand's online presence with AI-powered insights:

✓ AI-Powered Content Generation
  Create professional articles in minutes, not hours

✓ Competitive Intelligence (Radar)
  Track competitors, discover trends, measure marketshare

✓ Authority Hub
  Build trust with data-backed public content

✓ 24/7 AI Brand Assistant
  Get instant answers to your marketing questions

[Get Started →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 2: Brand Information

**Purpose:** Create brand profile in database

**Required Fields:**
- Brand Name (text, max 100 characters)
- Category (dropdown, 18 options)
- Business Type (radio: online_only, offline_only, hybrid)
- Country (dropdown, 100+ options)
- Description (textarea, max 500 characters)

**Optional Fields:**
- Google Maps URL (for offline/hybrid businesses)

**Validation Rules:**
```typescript
// Brand name
if (!brand_name || brand_name.trim().length < 2) {
  errors.push("Brand name must be at least 2 characters");
}

// Category
const VALID_CATEGORIES = [
  "agency", "beauty", "car_motorcycle", "consultant", "contractor",
  "ecommerce", "education", "event_organizer", "fashion", "finance",
  "fmcg", "fnb", "health", "lifestyle", "mom_baby",
  "other", "photo_video", "saas"
];
if (!VALID_CATEGORIES.includes(category)) {
  errors.push("Invalid category selected");
}

// Country
const VALID_COUNTRIES = new Set([
  "US", "GB", "CA", "AU", "DE", "FR", // ... 100+ codes
]);
if (!VALID_COUNTRIES.has(country.toUpperCase())) {
  errors.push("Invalid country code");
}
```

**Frontend Request:**
```javascript
const { data, error } = await supabase.functions.invoke('onboard-brand-v4', {
  body: {
    step: 2,
    brand_name: "Glow Beauty Organics",
    category: "beauty",
    business_type: "hybrid",
    country: "US",
    google_maps_url: "https://maps.google.com/?cid=12345678901234567890",
    description: "Organic skincare brand focusing on natural ingredients and sustainable packaging"
  }
});
```

**Backend Response:**
```json
{
  "success": true,
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "brand": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-uuid",
    "brand_name": "Glow Beauty Organics",
    "category": "beauty",
    "business_type": "hybrid",
    "country": "US",
    "description": "Organic skincare brand...",
    "onboarding_step": 2,
    "created_at": "2026-02-14T10:05:00Z"
  },
  "message": "Brand profile created successfully! Let's connect your social media.",
  "next_step": 3
}
```

**Database Record:**
```sql
INSERT INTO brands (
  id, user_id, brand_name, category, business_type, country,
  google_maps_url, description, onboarding_step, created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'user-uuid',
  'Glow Beauty Organics',
  'beauty',
  'hybrid',
  'US',
  'https://maps.google.com/?cid=12345678901234567890',
  'Organic skincare brand...',
  2,
  NOW()
);
```

---

### Step 3: Social Media Links (Optional)

**Purpose:** Connect brand's social media profiles for better AI analysis

**Optional Fields:**
- Website URL
- Instagram URL
- TikTok URL
- YouTube URL
- Facebook URL
- WhatsApp Number

**Validation:**
```typescript
// Instagram: Must be valid Instagram URL
if (instagram_url && !instagram_url.match(/^https?:\/\/(www\.)?instagram\.com\//)) {
  errors.push("Invalid Instagram URL format");
}

// TikTok: Must be valid TikTok URL
if (tiktok_url && !tiktok_url.match(/^https?:\/\/(www\.)?tiktok\.com\/@/)) {
  errors.push("Invalid TikTok URL format");
}

// YouTube: Must be valid YouTube channel URL
if (youtube_url && !youtube_url.match(/^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|@)/)) {
  errors.push("Invalid YouTube URL format");
}

// WhatsApp: Must be valid international phone number
if (whatsapp && !whatsapp.match(/^\+[1-9]\d{1,14}$/)) {
  errors.push("WhatsApp must be international format (e.g., +1234567890)");
}
```

**Frontend Request:**
```javascript
const { data, error } = await supabase.functions.invoke('onboard-brand-v4', {
  body: {
    step: 3,
    brand_id: "550e8400-e29b-41d4-a716-446655440000",
    web_url: "https://glowbeauty.com",
    instagram_url: "https://instagram.com/glowbeauty",
    tiktok_url: "https://tiktok.com/@glowbeauty",
    youtube_url: "https://youtube.com/@glowbeauty",
    facebook_url: "https://facebook.com/glowbeauty",
    whatsapp: "+14155551234"
  }
});
```

**Backend Response:**
```json
{
  "success": true,
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Social media links saved! Almost done...",
  "next_step": 4
}
```

**Skip Option:**
```javascript
// User can skip this step
const { data } = await supabase.functions.invoke('onboard-brand-v4', {
  body: {
    step: 3,
    brand_id: "550e8400-e29b-41d4-a716-446655440000",
    skip: true
  }
});
```

---

### Step 4: Confirmation

**Purpose:** User confirms understanding of 30-day data lock policy

**Confirmation Text:**
```
Important: 30-Day Data Lock Policy

Once you complete onboarding, your brand data will be analyzed by our AI
systems over the next 30 days to:
- Learn your brand voice and style
- Discover relevant creators and trends
- Build your competitive intelligence database

During this 30-day period:
✓ You can use all platform features
✓ You can generate content and access insights
✗ You CANNOT delete your brand or change core information

After 30 days, you have full control to modify or delete your brand data.

This policy ensures high-quality AI training and prevents gaming the system.
```

**Required Actions:**
- Read and understand policy
- Type confirmation text: "SAYA SETUJU" (Indonesian) or "I AGREE" (English)
- Click "I Understand and Agree"

**Frontend Request:**
```javascript
const { data, error } = await supabase.functions.invoke('onboard-brand-v4', {
  body: {
    step: 4,
    brand_id: "550e8400-e29b-41d4-a716-446655440000",
    understood_30day_lock: true,
    confirmation_text: "I AGREE"
  }
});
```

**Backend Validation:**
```typescript
// Must type exact confirmation text
const acceptedTexts = ["SAYA SETUJU", "I AGREE"];
if (!acceptedTexts.includes(confirmation_text.toUpperCase().trim())) {
  return {
    error: "Please type 'I AGREE' to confirm",
    success: false
  };
}

// Update brand with lock timestamp
await supabase.from('brands').update({
  data_locked_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  onboarding_step: 4
}).eq('id', brand_id);
```

---

### Step 5: Tier Selection

**Purpose:** Choose subscription tier and billing cycle

**Tier Options:**
| Tier | Monthly | Yearly | Features |
|------|---------|--------|----------|
| Basic | $399 | $4,389 | 1 article/day, 30 QA/day, Hub access |
| Premium | $699 | $7,689 | 2 articles/day, 40 QA/day, Hub access |
| Partner | $1,099 | $12,089 | 3 articles/day, 50 QA/day, Hub + Radar access |

**Billing Cycle:**
- Monthly: Pay monthly, cancel anytime
- Yearly: Pay upfront, get 1 month free (11 months price)

**Frontend Request:**
```javascript
const { data, error } = await supabase.functions.invoke('onboard-brand-v4', {
  body: {
    step: 5,
    brand_id: "550e8400-e29b-41d4-a716-446655440000",
    tier: "premium",
    billing_cycle: "yearly"
  }
});
```

**Backend Response:**
```json
{
  "success": true,
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "brand": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "brand_name": "Glow Beauty Organics",
    "subscription_tier": "premium",
    "onboarding_completed": true
  },
  "pricing": {
    "tier": "premium",
    "tier_name": "Premium",
    "billing_cycle": "yearly",
    "monthly_price": 699,
    "yearly_price": 7689,
    "yearly_savings": 699,
    "total_price": 7689,
    "currency": "USD"
  },
  "message": "Onboarding completed! Welcome to GeoVera!",
  "redirect_to": "/dashboard"
}
```

**Database Update:**
```sql
UPDATE brands SET
  subscription_tier = 'premium',
  billing_cycle = 'yearly',
  subscription_status = 'trial', -- 30-day trial
  trial_ends_at = NOW() + INTERVAL '30 days',
  onboarding_completed = true,
  onboarding_step = 5,
  updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## FIRST BRAND SETUP

### Auto-Generated Brand Intelligence

After onboarding completes, GeoVera automatically generates:

**1. Brand Analysis (Claude 3.5 Sonnet):**
```sql
-- 300 Question-Answer pairs generated
INSERT INTO gv_brand_intelligence (
  brand_id,
  question,
  answer,
  confidence_score,
  source,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'What is Glow Beauty Organics'' target audience?',
  'Glow Beauty Organics targets health-conscious women aged 25-45 who value natural, organic skincare products and sustainable packaging...',
  0.92,
  'onboarding_analysis',
  NOW()
);
```

**2. Initial Insights (Perplexity):**
- Industry trends relevant to your category
- Competitor landscape overview
- Content opportunities

**3. Daily Insights Setup:**
- Subscribe to daily AI insights
- First insights delivered within 24 hours
- Tasks generated based on brand goals

---

## FIRST CREATOR DISCOVERY

### For Partner Tier Only

**Navigate to:** Dashboard → Radar → Discover Creators

**Step 1: Choose Category**
```javascript
// Available categories (6):
const RADAR_CATEGORIES = [
  "beauty", "fnb", "fashion", "lifestyle", "health", "tech"
];
```

**Step 2: Discover Creators**
```javascript
const { data } = await supabase.functions.invoke('radar-discover-creators', {
  body: {
    category: "beauty",
    country: "US",
    batch_size: 40
  }
});

// Expected: 40 creators discovered
// Time: 30-60 seconds
// Cost: $0.003-0.005 (Perplexity API)
```

**Step 3: View Creator Profiles**
```sql
SELECT
  name,
  instagram_handle,
  tiktok_handle,
  follower_count,
  engagement_rate,
  content_focus
FROM gv_creators
WHERE category = 'beauty'
AND country = 'US'
ORDER BY follower_count DESC
LIMIT 40;
```

**Step 4: Scrape Creator Content**
```javascript
// Scrape Instagram posts for a creator
const { data } = await supabase.functions.invoke('radar-scrape-content', {
  body: {
    creator_id: "creator-uuid",
    platform: "instagram",
    post_count: 10
  }
});

// Expected: 10 posts scraped
// Time: 20-30 seconds
// Cost: $0.02 (Apify API)
```

---

## FIRST CONTENT GENERATION

### Navigate to Content Studio

**Dashboard → Content Studio → Generate Article**

**Step 1: Choose Topic**
```javascript
// User inputs topic manually or uses AI suggestion
const topic = "10 Skincare Tips for Dry Skin in Winter";
```

**Step 2: Configure Settings**
```javascript
const { data } = await supabase.functions.invoke('generate-article', {
  body: {
    brand_id: "550e8400-e29b-41d4-a716-446655440000",
    topic: "10 Skincare Tips for Dry Skin in Winter",
    tone: "professional", // or "casual", "friendly"
    length: "medium",     // "short" (200-300), "medium" (300-500), "long" (500-800)
    keywords: ["skincare", "dry skin", "winter", "moisturizer"],
    include_cta: true
  }
});
```

**Step 3: Review Generated Article**
```json
{
  "success": true,
  "article_id": "article-uuid",
  "article": {
    "title": "10 Proven Skincare Tips for Dry Skin in Winter",
    "content": "Are you struggling with dry, flaky skin during winter months? You're not alone. Winter weather can be harsh on your skin, stripping away moisture and leaving it feeling tight and uncomfortable. Here are 10 expert-backed tips to keep your skin hydrated and healthy all winter long...",
    "word_count": 482,
    "reading_time": "2 minutes",
    "keywords": ["skincare", "dry skin", "winter", "moisturizer"]
  },
  "quota": {
    "used_today": 1,
    "limit_daily": 2,  // Premium tier
    "resets_at": "2026-02-15T00:00:00Z"
  }
}
```

**Step 4: Edit & Publish**
- Edit content in WYSIWYG editor
- Add images (AI-generated or uploaded)
- Schedule publication date
- Publish to website or export

---

## FIRST HUB COLLECTION

### Navigate to Authority Hub

**Dashboard → Authority Hub → Create Collection**

**Step 1: Configure Collection**
```javascript
const { data } = await supabase.functions.invoke('hub-create-collection', {
  body: {
    brand_id: "550e8400-e29b-41d4-a716-446655440000",
    category: "beauty",
    article_type: "hot",  // "hot", "review", "education", "nice_to_know"
    keywords: ["skincare", "trending", "viral"],
    content_count: 5
  }
});
```

**Step 2: Review Collection**
```json
{
  "success": true,
  "collection_id": "collection-uuid",
  "collection": {
    "id": "collection-uuid",
    "category": "beauty",
    "article_type": "hot",
    "title": "Trending Beauty Content - February 2026",
    "content_pieces": [
      {
        "id": "content-1",
        "platform": "tiktok",
        "creator": "beautybycia",
        "caption": "Viral glass skin routine that actually works! ✨",
        "embed_url": "https://www.tiktok.com/embed/v2/...",
        "engagement": {
          "likes": 125000,
          "comments": 3400,
          "shares": 8900
        }
      },
      {
        "id": "content-2",
        "platform": "instagram",
        "creator": "suhaysalim",
        "caption": "5 skincare mistakes you're probably making...",
        "embed_url": "https://www.instagram.com/p/.../embed",
        "engagement": {
          "likes": 45000,
          "comments": 1200,
          "shares": 230
        }
      }
      // ... 3 more content pieces
    ]
  }
}
```

**Step 3: Generate Hub Article**
```javascript
const { data } = await supabase.functions.invoke('hub-generate-article', {
  body: {
    brand_id: "550e8400-e29b-41d4-a716-446655440000",
    collection_id: "collection-uuid"
  }
});
```

**Step 4: Publish to Public Hub**
- Article generated with embedded content
- Charts visualizing trends
- SEO optimized for search engines
- Public URL: `https://geovera.xyz/hub/article/article-id`

---

## TROUBLESHOOTING

### Common Onboarding Issues

**Issue 1: Email Not Received**

**Symptoms:**
- User signed up but no verification email received
- Waited 5+ minutes

**Solutions:**
```javascript
// 1. Check spam/junk folder

// 2. Resend verification email
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
});

// 3. Check email address is correct
const { data: { user } } = await supabase.auth.getUser();
console.log('Email:', user.email);
```

---

**Issue 2: Invalid Category Error**

**Symptoms:**
- "Invalid category selected" error at Step 2

**Solutions:**
```javascript
// Ensure category matches exactly (case-sensitive)
const VALID_CATEGORIES = [
  "agency", "beauty", "car_motorcycle", "consultant", "contractor",
  "ecommerce", "education", "event_organizer", "fashion", "finance",
  "fmcg", "fnb", "health", "lifestyle", "mom_baby",
  "other", "photo_video", "saas"
];

// Correct:
category: "beauty"

// Incorrect:
category: "Beauty"   // Wrong case
category: "skincare" // Not in list
```

---

**Issue 3: Country Code Not Accepted**

**Symptoms:**
- "Invalid country code" error at Step 2

**Solutions:**
```javascript
// Must use ISO 3166-1 alpha-2 codes (2 letters)
// Correct:
country: "US"  // United States
country: "GB"  // United Kingdom
country: "AU"  // Australia

// Incorrect:
country: "USA"       // 3 letters
country: "America"   // Full name
country: "us"        // Lowercase (though system auto-converts)
```

---

**Issue 4: Social Media URL Validation Failed**

**Symptoms:**
- "Invalid Instagram URL format" at Step 3

**Solutions:**
```javascript
// Instagram: Must include instagram.com
// Correct:
instagram_url: "https://instagram.com/glowbeauty"
instagram_url: "https://www.instagram.com/glowbeauty/"

// Incorrect:
instagram_url: "instagram.com/glowbeauty"    // Missing https://
instagram_url: "https://instagr.am/glowbeauty" // Short URL
instagram_url: "@glowbeauty"                  // Just username
```

---

**Issue 5: Confirmation Text Not Accepted**

**Symptoms:**
- Cannot proceed from Step 4

**Solutions:**
```javascript
// Must type EXACT text (case-insensitive)
// Accepted:
"I AGREE"
"i agree"
"I Agree"

// Not accepted:
"I agree to the terms"  // Extra words
"YES"                   // Wrong text
"SAYA SETUJU"           // Indonesian (also accepted, but region-specific)
```

---

**Issue 6: Payment Failure at Step 5**

**Symptoms:**
- Selected tier but payment processing failed

**Solutions:**
```javascript
// 1. Check card details are correct
// 2. Ensure sufficient funds
// 3. Try different card
// 4. Contact support: billing@geovera.xyz

// Alternative: Continue with 30-day trial
// Payment required only after trial ends
```

---

### Support Channels

**Email:** support@geovera.xyz
**Live Chat:** Available in dashboard
**Help Center:** https://geovera.xyz/help

**Response Times:**
- Critical (account access): 15 minutes
- High (onboarding issues): 1 hour
- Medium (feature questions): 4 hours
- Low (general inquiries): 24 hours

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Onboarding Version:** v4
**Maintained By:** Customer Success Team

**Questions or Issues?**
- Onboarding Support: onboarding@geovera.xyz
- Technical Issues: tech@geovera.xyz
- Billing Questions: billing@geovera.xyz
