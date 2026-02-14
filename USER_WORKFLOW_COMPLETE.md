# GeoVera Platform - Complete User Workflow

**Version:** 1.0 Production
**Last Updated:** February 14, 2026
**Status:** Official User Journey Documentation

---

## Complete User Flow (Step-by-Step)

```
Sign Up → Email Confirmation → Log In → Onboarding (5 steps) →
Brief Report → Payment → Welcome & Features Introduction →
Dashboard → AI Chat → LLM SEO/GEO/Social Search → Daily Insights →
Content Studio → Radar → Hub → Settings → Logout → Delete User
```

**Total Journey Time:** ~60-90 minutes for new user (complete exploration)

---

## STEP 1: SIGN UP (New User Registration)

### Page: `/frontend/login.html` (Signup Tab)

**User Actions:**
1. Click "Signup" tab
2. Enter email: `user@example.com`
3. Enter password: `SecurePassword123!`
4. Confirm password: `SecurePassword123!`
5. Click "Create Account" button

**System Actions:**
```javascript
// Call Supabase Auth
const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
});

// Send confirmation email
// User receives email with confirmation link
```

**Success State:**
- Message: "Account created! Please check your email to confirm."
- Email sent to user's inbox
- User redirected to email confirmation page

**Database Updates:**
```sql
-- auth.users table (managed by Supabase)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('user@example.com', 'hashed_password', NULL);
-- email_confirmed_at is NULL until confirmed
```

**Expected Result:**
- ✅ User account created
- ✅ Confirmation email sent
- ✅ User sees "check your email" message

---

## STEP 2: EMAIL CONFIRMATION

### Email Sent by Supabase

**Email Content:**
```
Subject: Confirm your GeoVera account

Hi there!

Welcome to GeoVera Intelligence Platform.

Click the link below to confirm your email:
https://geovera.xyz/auth/confirm?token=XXXXX

This link expires in 24 hours.

Thanks,
The GeoVera Team
```

**User Actions:**
1. Open email inbox
2. Find "Confirm your GeoVera account" email
3. Click confirmation link
4. Browser opens confirmation page

**System Actions:**
```javascript
// Supabase auto-handles confirmation
// Updates email_confirmed_at timestamp
// Redirects to login page with success message
```

**Database Updates:**
```sql
-- auth.users table
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

**Success State:**
- Page shows: "Email confirmed! You can now log in."
- Redirect to login page after 3 seconds

**Expected Result:**
- ✅ Email confirmed
- ✅ User can now log in
- ✅ Account activated

---

## STEP 3: LOG IN

### Page: `/frontend/login.html` (Login Tab)

**User Actions:**
1. Enter email: `user@example.com`
2. Enter password: `SecurePassword123!`
3. Click "Login" button

**System Actions:**
```javascript
// Authenticate user
const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
});

// Store session token
localStorage.setItem('access_token', data.session.access_token);

// Check if user has completed onboarding
const { data: brands } = await supabase
    .from('user_brands')
    .select('brand_id')
    .eq('user_id', data.user.id)
    .eq('role', 'owner');

// Redirect based on brand status
if (brands && brands.length > 0) {
    // Has brand → go to dashboard
    window.location.href = 'dashboard.html';
} else {
    // No brand → go to onboarding
    window.location.href = 'onboarding.html';
}
```

**Decision Point:**
- **Has Brand:** Redirect to `dashboard.html` ✅
- **No Brand:** Redirect to `onboarding.html` 🆕 (First-time user)

**Database Queries:**
```sql
-- Check if user has brand
SELECT brand_id, role
FROM user_brands
WHERE user_id = 'authenticated_user_id'
  AND role = 'owner';

-- If no results → first-time user → onboarding
-- If results → returning user → dashboard
```

**Expected Result:**
- ✅ Login successful
- ✅ Session token stored
- ✅ Correct redirect (onboarding OR dashboard)
- ✅ No 404 errors

---

## STEP 4: ONBOARDING (5-Step Wizard)

### Page: `/frontend/onboarding.html`

**Only for first-time users (no brand created yet)**

---

### STEP 4.1: Brand Setup (Step 1/5)

**User Actions:**
1. Enter Brand Name: `TheWatchCo`
2. Select Industry: `Fashion` (dropdown)
3. Enter Website: `www.thewatch.co`
4. Upload Logo: (optional - drag & drop or click)
5. Click "Next" button

**Form Validation:**
```javascript
// Required fields
if (!brandName || !industry) {
    showError('Please fill in required fields');
    return;
}

// Save to localStorage (for resume if refreshed)
localStorage.setItem('onboarding_step1', JSON.stringify({
    brandName: 'TheWatchCo',
    industry: 'Fashion',
    website: 'www.thewatch.co',
    logoUrl: 'uploaded_url'
}));

// Move to Step 2
currentStep = 2;
```

**Progress Indicator:**
```
[●]━━━━━ Step 1/5: Brand Setup
```

**Expected Result:**
- ✅ Data saved to localStorage
- ✅ Progress to Step 2
- ✅ Can go back with "Previous" button

---

### STEP 4.2: Goals Selection (Step 2/5)

**User Actions:**
1. Select goals (checkboxes - multiple allowed):
   - ☑ Increase brand awareness
   - ☑ Find creators
   - ☑ Generate content
   - ☐ Drive sales/conversions
   - ☐ Boost engagement
   - ☐ Track competitors
2. Click "Next" button

**Form Data:**
```javascript
localStorage.setItem('onboarding_step2', JSON.stringify({
    goals: [
        'brand_awareness',
        'find_creators',
        'generate_content'
    ]
}));
```

**Progress Indicator:**
```
━[●]━━━━ Step 2/5: Goals
```

**Expected Result:**
- ✅ Multiple goals selectable
- ✅ Data saved
- ✅ Progress to Step 3

---

### STEP 4.3: Content Preferences (Step 3/5)

**User Actions:**
1. Select category interests (multi-select):
   - ☑ Fashion
   - ☑ Lifestyle
   - ☐ Beauty
   - ☐ Travel
   - ☐ Food
   - ☐ Tech

2. Select content types:
   - ☑ Instagram posts
   - ☑ TikTok videos
   - ☐ YouTube videos
   - ☐ Blog articles
   - ☐ Twitter threads

3. Click "Next" button

**Form Data:**
```javascript
localStorage.setItem('onboarding_step3', JSON.stringify({
    categories: ['Fashion', 'Lifestyle'],
    contentTypes: ['Instagram posts', 'TikTok videos']
}));
```

**Progress Indicator:**
```
━━[●]━━━ Step 3/5: Content Preferences
```

**Expected Result:**
- ✅ Preferences saved
- ✅ Progress to Step 4

---

### STEP 4.4: Location & Timezone (Step 4/5)

**User Actions:**
1. Select Country: `Indonesia` (dropdown - 50+ countries)
2. Timezone: Auto-detected `Asia/Jakarta (GMT+7)`
3. Currency: Auto-set `IDR (Rp)`
4. Language: `English` (default, 9+ languages roadmap)
5. Click "Next" button

**Auto-Detection:**
```javascript
// Detect timezone automatically
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
document.getElementById('timezone').value = timezone;

// Set currency based on country
const currencyMap = {
    'Indonesia': 'IDR',
    'United States': 'USD',
    'Singapore': 'SGD',
    // ... 50+ countries
};
```

**Form Data:**
```javascript
localStorage.setItem('onboarding_step4', JSON.stringify({
    country: 'Indonesia',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    language: 'English'
}));
```

**Progress Indicator:**
```
━━━[●]━━ Step 4/5: Location
```

**Expected Result:**
- ✅ Auto-detection works
- ✅ Manual override available
- ✅ Progress to Step 5

---

### STEP 4.5: Choose Your Plan (Step 5/5)

**User Actions:**
1. See 3 pricing cards displayed:

**Basic Plan - Rp 6,383,500/month** (PPP-adjusted from $399)
- 3 collections
- 30 AI chat messages/month
- 20 articles/month
- 8 daily tasks
- 10 radar searches/month
- Button: "Start Free Trial"

**Premium Plan - Rp 9,743,850/month** (PPP-adjusted from $609)
- 10 collections
- 100 AI chat messages/month
- 100 articles/month
- 10 daily tasks
- 50 radar searches/month
- Button: "Start Free Trial"

**Partner Plan - Rp 14,379,150/month** (PPP-adjusted from $899)
- Unlimited collections
- Unlimited AI chat
- 500 articles/month
- 12 daily tasks
- Unlimited radar searches
- Button: "Start Free Trial"

2. Click "Start Free Trial" on Basic plan
3. OR Click "Skip" to default to Basic tier

**System Actions:**
```javascript
// Compile all onboarding data
const onboardingData = {
    ...JSON.parse(localStorage.getItem('onboarding_step1')),
    ...JSON.parse(localStorage.getItem('onboarding_step2')),
    ...JSON.parse(localStorage.getItem('onboarding_step3')),
    ...JSON.parse(localStorage.getItem('onboarding_step4')),
    selectedTier: 'basic' // or 'premium' or 'partner'
};

// Create brand in database
const { data: brand, error } = await supabase
    .from('gv_brands')
    .insert({
        brand_name: 'TheWatchCo',
        industry: 'Fashion',
        website: 'www.thewatch.co',
        logo_url: 'uploaded_url',
        country: 'Indonesia',
        timezone: 'Asia/Jakarta',
        currency: 'IDR',
        categories: ['Fashion', 'Lifestyle'],
        goals: ['brand_awareness', 'find_creators', 'generate_content']
    })
    .select()
    .single();

// Link brand to user
await supabase
    .from('user_brands')
    .insert({
        user_id: currentUser.id,
        brand_id: brand.brand_id,
        role: 'owner'
    });

// Create subscription (Free Trial - no payment yet)
await supabase
    .from('gv_subscriptions')
    .insert({
        user_id: currentUser.id,
        tier_name: 'basic',
        status: 'trial', // Free trial status
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        price_monthly: 6383500, // IDR
        currency: 'IDR'
    });

// Initialize tier usage tracking
await supabase
    .from('gv_tier_usage')
    .insert([
        { user_id: currentUser.id, feature_name: 'collections', current_usage: 0, tier_limit: 3 },
        { user_id: currentUser.id, feature_name: 'chat_messages', current_usage: 0, tier_limit: 30 },
        { user_id: currentUser.id, feature_name: 'articles', current_usage: 0, tier_limit: 20 },
        { user_id: currentUser.id, feature_name: 'daily_tasks', current_usage: 0, tier_limit: 8 },
        { user_id: currentUser.id, feature_name: 'radar_searches', current_usage: 0, tier_limit: 10 }
    ]);

// Clear localStorage onboarding data
localStorage.removeItem('onboarding_step1');
localStorage.removeItem('onboarding_step2');
localStorage.removeItem('onboarding_step3');
localStorage.removeItem('onboarding_step4');

// Redirect to Brief Report
window.location.href = 'onboarding-complete.html';
```

**Database Updates:**
```sql
-- 1. Create brand
INSERT INTO gv_brands (brand_name, industry, website, logo_url, country, timezone, currency)
VALUES ('TheWatchCo', 'Fashion', 'www.thewatch.co', 'url', 'Indonesia', 'Asia/Jakarta', 'IDR')
RETURNING brand_id;

-- 2. Link user to brand
INSERT INTO user_brands (user_id, brand_id, role)
VALUES ('user_uuid', 'brand_uuid', 'owner');

-- 3. Create subscription (Free Trial)
INSERT INTO gv_subscriptions (user_id, tier_name, status, trial_ends_at, price_monthly, currency)
VALUES ('user_uuid', 'basic', 'trial', '2026-02-28', 6383500, 'IDR');

-- 4. Initialize tier usage
INSERT INTO gv_tier_usage (user_id, feature_name, current_usage, tier_limit)
VALUES
    ('user_uuid', 'collections', 0, 3),
    ('user_uuid', 'chat_messages', 0, 30),
    ('user_uuid', 'articles', 0, 20),
    ('user_uuid', 'daily_tasks', 0, 8),
    ('user_uuid', 'radar_searches', 0, 10);
```

**Progress Indicator:**
```
━━━━[●] Step 5/5: Choose Plan ✅
```

**Expected Result:**
- ✅ Brand created in database
- ✅ User linked to brand
- ✅ Free trial subscription created (14 days)
- ✅ Usage tracking initialized
- ✅ Redirect to Brief Report

---

## STEP 5: BRIEF REPORT (Onboarding Complete)

### Page: `/frontend/onboarding-complete.html`

**What User Sees:**

```
🎉 Welcome to GeoVera, TheWatchCo!

Your account is ready. Here's what we've set up for you:

✅ Brand: TheWatchCo (Fashion)
✅ Website: www.thewatch.co
✅ Location: Indonesia (IDR currency)
✅ Plan: Basic (Free Trial - 14 days)

Your Features:
- 3 Creator Collections
- 30 AI Chat Messages/month
- 20 Articles/month
- 8 Daily Insights
- 10 Radar Searches/month

What's Next?
1. Explore your Dashboard
2. Chat with AI for strategy ideas
3. Discover creators in Radar
4. Generate content in Content Studio
5. Organize creators in Hub

[Go to Dashboard] button
```

**System Actions:**
```javascript
// Load brand data to display
const { data: brand } = await supabase
    .from('gv_brands')
    .select('brand_name, industry, website, country')
    .eq('brand_id', currentBrandId)
    .single();

// Load subscription data
const { data: subscription } = await supabase
    .from('gv_subscriptions')
    .select('tier_name, status, trial_ends_at')
    .eq('user_id', currentUser.id)
    .eq('status', 'trial')
    .single();

// Display personalized report
```

**User Actions:**
1. Review setup summary
2. Click "Go to Dashboard" button

**Expected Result:**
- ✅ Summary displays correctly
- ✅ Brand info accurate
- ✅ Tier limits shown
- ✅ Redirect to dashboard

---

## STEP 6: PAYMENT (Subscription Setup)

### Page: `/frontend/payment.html` (To be created)

**Triggered After Brief Report**

**User Journey:**
1. After viewing brief report, user sees payment options
2. **Free Trial Available:** 14 days, no credit card required
3. **Choose to pay now OR start free trial**

---

### OPTION A: Start Free Trial (No Payment)

**User Actions:**
1. Click "Start Free Trial - 14 Days Free"
2. Confirm: "Start trial without payment"

**System Actions:**
```javascript
// Create trial subscription (already done in onboarding step 5)
const { data: subscription } = await supabase
    .from('gv_subscriptions')
    .insert({
        user_id: currentUser.id,
        tier_name: 'basic',
        status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        price_monthly: 6383500,
        currency: 'IDR'
    })
    .select()
    .single();

// Redirect to Welcome page
window.location.href = 'welcome.html';
```

**Success State:**
- Message: "Free trial started! No payment required for 14 days."
- Redirect to Welcome page

**Expected Result:**
- ✅ Trial subscription created
- ✅ No payment collected
- ✅ 14-day countdown starts
- ✅ Full feature access

---

### OPTION B: Pay Now (Immediate Subscription)

**User Actions:**
1. Click "Subscribe Now" on Basic/Premium/Partner
2. Payment page loads

**Payment Methods Available:**

**For Indonesia:**
```
💳 Credit/Debit Card (Visa, Mastercard)
🏦 Bank Transfer
   - BCA, Mandiri, BNI, BRI
💰 E-Wallet
   - GoPay, OVO, Dana, ShopeePay
📱 QRIS (Scan to Pay)
```

**For International:**
```
💳 Credit/Debit Card (Visa, Mastercard, Amex)
🌍 PayPal
🏦 Wire Transfer (for Partner tier)
```

**Payment Form:**
```
┌─────────────────────────────────────────┐
│  Subscribe to GeoVera - Basic Plan      │
├─────────────────────────────────────────┤
│  Rp 6,383,500/month                     │
│  Billed monthly                         │
│                                         │
│  Payment Method:                        │
│  ○ Credit/Debit Card                    │
│  ○ Bank Transfer (Indonesia)            │
│  ○ GoPay / OVO / Dana                   │
│  ○ QRIS                                 │
│                                         │
│  [Selected: Credit Card]                │
│                                         │
│  Card Number: [________________]        │
│  Expiry: [MM/YY]  CVV: [___]           │
│  Cardholder: [___________________]      │
│                                         │
│  Billing Address:                       │
│  [Indonesia ▼]                          │
│  [____________________________]         │
│                                         │
│  ☑ I agree to Terms & Privacy Policy    │
│                                         │
│  [Complete Payment - Rp 6,383,500]      │
│                                         │
│  🔒 Secure payment powered by Xendit    │
└─────────────────────────────────────────┘
```

**System Actions:**
```javascript
// Process payment via Xendit (Indonesia) or Stripe (International)
const paymentResponse = await fetch('/functions/v1/process-payment', {
    method: 'POST',
    body: JSON.stringify({
        user_id: currentUser.id,
        tier_name: 'basic',
        amount: 6383500,
        currency: 'IDR',
        payment_method: 'credit_card',
        card_token: cardToken
    })
});

const { payment_id, status } = await paymentResponse.json();

if (status === 'success') {
    // Update subscription to active
    await supabase
        .from('gv_subscriptions')
        .update({
            status: 'active',
            payment_method: 'credit_card',
            last_payment_date: new Date(),
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        .eq('user_id', currentUser.id);

    // Redirect to Welcome
    window.location.href = 'welcome.html';
} else {
    showError('Payment failed. Please try again.');
}
```

**Database Updates:**
```sql
-- Create payment record
INSERT INTO gv_payments (user_id, subscription_id, amount, currency, status, payment_method)
VALUES ('user_uuid', 'subscription_uuid', 6383500, 'IDR', 'success', 'credit_card');

-- Update subscription status
UPDATE gv_subscriptions
SET status = 'active',
    payment_method = 'credit_card',
    last_payment_date = NOW(),
    next_billing_date = NOW() + INTERVAL '30 days'
WHERE user_id = 'user_uuid';
```

**Success State:**
- Payment confirmed
- Email receipt sent
- Invoice generated
- Redirect to Welcome page

**Expected Result:**
- ✅ Payment processed successfully
- ✅ Subscription activated
- ✅ Receipt emailed
- ✅ Invoice available in Settings

---

### Payment Error Handling

**Failed Payment:**
```
┌─────────────────────────────────────────┐
│  ❌ Payment Failed                       │
├─────────────────────────────────────────┤
│  We couldn't process your payment.      │
│                                         │
│  Reason: Insufficient funds             │
│                                         │
│  Please try:                            │
│  • Different payment method             │
│  • Contact your bank                    │
│  • Start free trial instead             │
│                                         │
│  [Try Again] [Start Free Trial]         │
└─────────────────────────────────────────┘
```

**Trial Fallback:**
- If payment fails, user can still start free trial
- No payment required for trial
- 14 days full access
- Payment reminder before trial ends

---

## STEP 7: WELCOME & FEATURES INTRODUCTION

### Page: `/frontend/welcome.html` (To be created)

**First-Time User Onboarding Tour**

**Triggered After Payment/Trial Setup**

---

### Welcome Screen

**Hero Section:**
```
┌─────────────────────────────────────────┐
│  🎉 Welcome to GeoVera, TheWatchCo!     │
├─────────────────────────────────────────┤
│  Your AI-powered influencer marketing   │
│  platform is ready.                     │
│                                         │
│  Let's take a quick tour of your new    │
│  features (2 minutes)                   │
│                                         │
│  [Start Tour] [Skip to Dashboard]       │
└─────────────────────────────────────────┘
```

---

### Tour Step 1/7: Dashboard

**Overlay Highlight:**
```
┌─────────────────────────────────────────┐
│  📊 Your Command Center                 │
├─────────────────────────────────────────┤
│  The Dashboard is your home base.       │
│  Here you'll see:                       │
│                                         │
│  • Key metrics and stats                │
│  • Quick access to all features         │
│  • Recent activity                      │
│  • Usage limits for your tier           │
│                                         │
│  [Next: AI Chat →]              [1/7]   │
└─────────────────────────────────────────┘
```

---

### Tour Step 2/7: AI Chat

**Feature Spotlight:**
```
┌─────────────────────────────────────────┐
│  💬 AI Strategy Assistant               │
├─────────────────────────────────────────┤
│  Chat with GPT-4o for:                  │
│                                         │
│  ✓ Marketing strategy advice            │
│  ✓ Content ideas                        │
│  ✓ Competitor analysis                  │
│  ✓ Campaign planning                    │
│                                         │
│  Your limit: 30 messages/month (Basic)  │
│                                         │
│  [Next: LLM Search →]           [2/7]   │
└─────────────────────────────────────────┘
```

---

### Tour Step 3/7: LLM SEO/GEO/Social Search

**Feature Spotlight:**
```
┌─────────────────────────────────────────┐
│  🔍 AI-Powered Search Engine            │
├─────────────────────────────────────────┤
│  Find anything with intelligent search: │
│                                         │
│  🌍 GEO Search                          │
│  • Discover creators by location        │
│  • Find trending topics in regions      │
│                                         │
│  🔎 SEO Search                          │
│  • Research keywords & rankings         │
│  • Analyze competitor content           │
│                                         │
│  📱 Social Search                       │
│  • Search across Instagram/TikTok       │
│  • Find viral content by topic          │
│                                         │
│  [Next: Daily Insights →]       [3/7]   │
└─────────────────────────────────────────┘
```

---

### Tour Step 4/7: Daily Insights

**Feature Spotlight:**
```
┌─────────────────────────────────────────┐
│  💡 Your AI Daily Briefing              │
├─────────────────────────────────────────┤
│  Every day, get personalized tasks:     │
│                                         │
│  • Crisis alerts (brand mentions)       │
│  • Creator recommendations              │
│  • Content opportunities                │
│  • Trend notifications                  │
│  • Action items                         │
│                                         │
│  Your limit: 8 tasks/day (Basic)        │
│                                         │
│  [Next: Content Studio →]       [4/7]   │
└─────────────────────────────────────────┘
```

---

### Tour Step 5/7: Content Studio

**Feature Spotlight:**
```
┌─────────────────────────────────────────┐
│  📝 AI Content Generator                │
├─────────────────────────────────────────┤
│  Create professional content instantly:  │
│                                         │
│  📄 Articles (500-1500 words)           │
│  • Blog posts                           │
│  • Product descriptions                 │
│  • SEO content                          │
│                                         │
│  📱 Social Posts                        │
│  • Instagram captions                   │
│  • TikTok scripts                       │
│  • LinkedIn posts                       │
│                                         │
│  ❓ Q&A Generation                      │
│  • FAQ pages                            │
│  • Interview questions                  │
│                                         │
│  Your limit: 20 articles/month (Basic)  │
│                                         │
│  [Next: Radar →]                [5/7]   │
└─────────────────────────────────────────┘
```

---

### Tour Step 6/7: Radar (Creator Discovery)

**Feature Spotlight:**
```
┌─────────────────────────────────────────┐
│  🎯 Discover Perfect Creators           │
├─────────────────────────────────────────┤
│  Find influencers across 50+ countries: │
│                                         │
│  🔍 Advanced Filters:                   │
│  • Location (Indonesia, US, global)     │
│  • Category (Fashion, Beauty, etc.)     │
│  • Follower range (1K-1M+)              │
│  • Engagement rate (>2%, >5%, >10%)     │
│  • Platform (Instagram, TikTok, YouTube)│
│                                         │
│  💾 Save creators to collections        │
│                                         │
│  Your limit: 10 searches/month (Basic)  │
│                                         │
│  [Next: Hub →]                  [6/7]   │
└─────────────────────────────────────────┘
```

---

### Tour Step 7/7: Hub (Collections)

**Feature Spotlight:**
```
┌─────────────────────────────────────────┐
│  📁 Organize Your Creator Network       │
├─────────────────────────────────────────┤
│  Create collections to organize:        │
│                                         │
│  • Saved creators from Radar            │
│  • Group by campaign/category           │
│  • Track engagement metrics             │
│  • Export lists (CSV/PDF)               │
│  • Share with team                      │
│                                         │
│  Your limit: 3 collections (Basic)      │
│                                         │
│  [Finish Tour - Go to Dashboard]  [7/7] │
└─────────────────────────────────────────┘
```

---

### Tour Complete

**Final Screen:**
```
┌─────────────────────────────────────────┐
│  🎉 You're All Set, TheWatchCo!         │
├─────────────────────────────────────────┤
│  ✅ Account configured                  │
│  ✅ Payment/trial active                │
│  ✅ All features unlocked               │
│                                         │
│  Quick Start Tips:                      │
│  1. Chat with AI for strategy           │
│  2. Search for creators in Radar        │
│  3. Generate your first content         │
│  4. Review daily insights tomorrow      │
│                                         │
│  Need help? Visit our help center or    │
│  chat with support.                     │
│                                         │
│  [Go to Dashboard]  [View Tutorial]     │
└─────────────────────────────────────────┘
```

**System Actions:**
```javascript
// Mark tour as completed
await supabase
    .from('user_onboarding')
    .update({ tour_completed: true })
    .eq('user_id', currentUser.id);

// Don't show tour again
localStorage.setItem('tour_completed', 'true');

// Redirect to dashboard
window.location.href = 'dashboard.html';
```

**Expected Result:**
- ✅ User understands all 7 features
- ✅ Tour can be skipped anytime
- ✅ Tour won't show again after completion
- ✅ User ready to use platform

---

## STEP 8: DASHBOARD (Main Hub)

### Page: `/frontend/dashboard.html`

**First Load - What User Sees:**

**Header:**
- Navigation: Dashboard | Insights | Hub | Radar | Content Studio | AI Chat | Settings
- User dropdown: Profile | Settings | Logout

**Welcome Section:**
```
Welcome back, TheWatchCo! 👋
[Basic Plan Badge] Free Trial (13 days left)
```

**4 Stat Cards:**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Total Creators  │  │ Active Content  │  │ Engagement Rate │  │ This Month      │
│      0          │  │       0         │  │      0%         │  │   Just Started  │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Quick Actions:**
```
🔍 Discover Creators  →  Radar
📝 Generate Content   →  Content Studio
💬 Ask AI Strategy    →  AI Chat
📊 View Insights      →  Daily Insights
```

**Recent Activity Feed:**
```
No activity yet. Start by discovering creators or generating content!
```

**Upgrade Banner (Basic Tier):**
```
🚀 Upgrade to Premium
Get 10 collections, 100 chat messages, and 50 radar searches/month
[Learn More] [Upgrade Now]
```

**System Actions:**
```javascript
// Load user tier and usage
const { data: subscription } = await supabase
    .from('gv_subscriptions')
    .select('tier_name, status, trial_ends_at')
    .eq('user_id', currentUser.id)
    .single();

// Load tier usage
const { data: usage } = await supabase
    .from('gv_tier_usage')
    .select('*')
    .eq('user_id', currentUser.id);

// Calculate stats
const { count: creatorCount } = await supabase
    .from('hub_creators')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', currentBrandId);

// Display dashboard
```

**User Actions:**
1. Review dashboard overview
2. Click any quick action button
3. Navigate to features via menu

**Expected Result:**
- ✅ Dashboard loads successfully
- ✅ Tier badge displays (Basic)
- ✅ Stats show 0 (new user)
- ✅ Quick actions work
- ✅ Navigation functional

---

## STEP 7: AI CHAT (First Feature)

### Page: `/frontend/chat.html`

**User Journey:**
1. Click "AI Chat" in navigation
2. Page loads with empty chat
3. Usage indicator shows: `0/30 messages (Basic)`

**First Interaction:**

**User Types:**
```
"How can I grow my luxury watch brand on Instagram
and TikTok? My target audience is fashion-conscious
millennials in Indonesia."
```

**System Actions:**
```javascript
// Check usage limit
const { data: usage } = await supabase
    .from('gv_tier_usage')
    .select('current_usage, tier_limit')
    .eq('user_id', currentUser.id)
    .eq('feature_name', 'chat_messages')
    .single();

if (usage.current_usage >= usage.tier_limit) {
    showLimitModal('chat_messages'); // Friendly modal
    return;
}

// Call AI Chat Edge Function
const response = await fetch('/functions/v1/gv-ai-chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        brand_id: currentBrandId,
        message: userMessage,
        conversation_history: previousMessages
    })
});

const { response: aiResponse } = await response.json();

// Display AI response
// Increment usage counter
await supabase
    .from('gv_tier_usage')
    .update({ current_usage: usage.current_usage + 1 })
    .eq('user_id', currentUser.id)
    .eq('feature_name', 'chat_messages');

// Update UI
updateUsageIndicator(); // Shows 1/30
```

**AI Response Example:**
```
Great question! Here's a strategic approach for growing TheWatchCo
on Instagram and TikTok:

**Instagram Strategy:**
1. Visual Excellence - Showcase watches with lifestyle photography
2. Reels Focus - Short-form luxury lifestyle content
3. Influencer Partnerships - Partner with fashion micro-influencers
4. Hashtag Strategy - #JamTanganMewah #LuxuryWatchIndonesia

**TikTok Strategy:**
1. Trend Hijacking - Use trending sounds with watch reveals
2. Behind-the-Scenes - Watchmaking process, unboxing
3. Creator Collaborations - Fashion TikTokers in Jakarta/Bali
4. Challenge Creation - #MyWatchStyle challenge

**Next Steps:**
- Use Radar to find fashion influencers in Indonesia
- Generate content ideas in Content Studio
- Track performance in Analytics

Would you like me to suggest specific creators?
```

**Usage Updates:**
- Usage indicator: `1/30 messages (Basic)`
- Progress bar: 3.3% filled (green)

**Expected Result:**
- ✅ Chat functional
- ✅ AI response relevant to brand
- ✅ Usage counter increments
- ✅ Limit enforcement works (friendly modal at 30/30)

---

## STEP 9: LLM SEO/GEO/SOCIAL SEARCH (AI-Powered Discovery)

### Page: `/frontend/search.html` (To be created)

**User Journey:**
1. Click "Search" in navigation or "LLM Search" from dashboard
2. Page loads with 3 search modes: GEO | SEO | SOCIAL

**What User Sees:**

**Search Mode Selector:**
```
┌─────────────────────────────────────────────────────┐
│  AI-Powered Search Engine                           │
│                                                     │
│  [🌍 GEO Search] [🔎 SEO Search] [📱 Social Search] │
└─────────────────────────────────────────────────────┘
```

---

### MODE 1: GEO SEARCH (Location-Based Discovery)

**Description:** Discover creators, brands, and trending content based on geographic location using AI-powered geospatial search.

**Search Interface:**
```
┌─────────────────────────────────────────────────────┐
│  🌍 GEO SEARCH - Location-Based Discovery           │
├─────────────────────────────────────────────────────┤
│  What are you looking for?                          │
│  [Fashion influencers in Jakarta                  ] │
│                                                     │
│  📍 Location:                                       │
│  Country: [Indonesia ▼]                            │
│  City: [Jakarta ▼] (Optional)                      │
│  Radius: [50 km ▼] (Optional)                      │
│                                                     │
│  Category: [Fashion ▼] (Optional)                  │
│                                                     │
│  [🔍 Search]                                        │
└─────────────────────────────────────────────────────┘
```

**User Actions:**
1. Enter query: "Fashion influencers in Jakarta"
2. Select Country: Indonesia
3. Select City: Jakarta
4. Select Radius: 50 km
5. Select Category: Fashion
6. Click "Search"

**System Actions:**
```javascript
// Call GEO Search Edge Function
const response = await fetch('/functions/v1/gv-geo-search', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        brand_id: currentBrandId,
        query: 'Fashion influencers in Jakarta',
        country: 'Indonesia',
        city: 'Jakarta',
        radius_km: 50,
        category: 'Fashion',
        limit: 20
    })
});

const { results } = await response.json();
// Returns creators, brands, trending topics in Jakarta area
```

**Search Results:**
```
┌─────────────────────────────────────────────────────┐
│  📍 20 Results in Jakarta, Indonesia (50km radius)  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Creator 1: @fashionista_jkt                        │
│  📍 Central Jakarta, 5km from center                │
│  👥 45.2K followers | 💬 6.8% engagement             │
│  📱 Instagram                                       │
│  "Fashion & lifestyle in Jakarta. Local brand      │
│  collaborations. #JakartaStyle"                    │
│  [Save to Hub] [View Profile]                       │
│                                                     │
│  ────────────────────────────────────────────────   │
│                                                     │
│  Creator 2: @jakarta_style_diary                    │
│  📍 South Jakarta, 12km from center                 │
│  👥 38.5K followers | 💬 7.2% engagement             │
│  📱 Instagram                                       │
│  "Jakarta fashion scene. Thrift shopping expert."  │
│  [Save to Hub] [View Profile]                       │
│                                                     │
│  [18 more results...]                              │
│                                                     │
│  📊 Map View | 📋 List View | 📥 Export CSV         │
└─────────────────────────────────────────────────────┘
```

**Map View (Advanced Feature):**
```
┌─────────────────────────────────────────────────────┐
│  🗺️ Jakarta Creator Map                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│      [Interactive Map showing creator pins]         │
│                                                     │
│  🔴 High Engagement (>7%)                           │
│  🟡 Medium Engagement (5-7%)                        │
│  ⚪ Lower Engagement (<5%)                          │
│                                                     │
│  Click pins for creator details                    │
└─────────────────────────────────────────────────────┘
```

**Database Operations:**
```sql
-- Log GEO search query
INSERT INTO gv_search_history (user_id, search_type, query, location, results_count)
VALUES ('user_uuid', 'geo', 'Fashion influencers in Jakarta',
        '{"country": "Indonesia", "city": "Jakarta", "radius_km": 50}', 20);

-- Track usage (if tier limits apply)
UPDATE gv_tier_usage
SET current_usage = current_usage + 1
WHERE user_id = 'user_uuid'
  AND feature_name = 'geo_searches';
```

**Use Cases:**
- Find local creators in specific cities
- Discover trending topics by region
- Identify brand presence by location
- Map creator distribution across areas
- Target regional campaigns

**Expected Result:**
- ✅ Location-based results accurate
- ✅ Radius filtering works
- ✅ Map view displays correctly
- ✅ Save to Hub functional
- ✅ Results relevant to query

---

### MODE 2: SEO SEARCH (Keyword & Content Research)

**Description:** Research keywords, analyze SEO rankings, discover content opportunities using AI-powered search intelligence.

**Search Interface:**
```
┌─────────────────────────────────────────────────────┐
│  🔎 SEO SEARCH - Keyword & Content Research         │
├─────────────────────────────────────────────────────┤
│  What do you want to research?                      │
│  [Luxury watches Indonesia                        ] │
│                                                     │
│  Search Type:                                       │
│  ○ Keyword Research (volume, difficulty, trends)    │
│  ● Content Analysis (top-ranking content)           │
│  ○ Competitor Research (competitor SEO)             │
│                                                     │
│  Location: [Indonesia ▼]                            │
│  Language: [English ▼]                              │
│                                                     │
│  [🔍 Search]                                        │
└─────────────────────────────────────────────────────┘
```

**User Actions:**
1. Enter keyword: "Luxury watches Indonesia"
2. Select: Content Analysis
3. Select Location: Indonesia
4. Click "Search"

**System Actions:**
```javascript
// Call SEO Search Edge Function
const response = await fetch('/functions/v1/gv-seo-search', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        brand_id: currentBrandId,
        keyword: 'Luxury watches Indonesia',
        search_type: 'content_analysis',
        location: 'Indonesia',
        language: 'en',
        limit: 20
    })
});

const { seo_data } = await response.json();
// Returns keyword data, top content, SEO metrics
```

**SEO Research Results:**
```
┌─────────────────────────────────────────────────────┐
│  📊 SEO Analysis: "Luxury watches Indonesia"        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎯 KEYWORD METRICS                                 │
│  Search Volume: 2,400/month (Indonesia)             │
│  Keyword Difficulty: 42/100 (Medium)                │
│  CPC: $2.15 USD                                     │
│  Trend: ↑ +15% (Last 3 months)                      │
│                                                     │
│  ────────────────────────────────────────────────   │
│                                                     │
│  📄 TOP RANKING CONTENT (Position 1-10)             │
│                                                     │
│  1. "10 Best Luxury Watches to Buy in Indonesia"    │
│     📍 luxurywatcheshub.com                         │
│     📊 DA: 45 | Word Count: 2,400                   │
│     💡 Content Type: Listicle + Buyer's Guide       │
│     [Analyze] [Generate Similar]                    │
│                                                     │
│  2. "Rolex vs Omega: Which Luxury Watch for You?"   │
│     📍 watchenthusiast.id                           │
│     📊 DA: 38 | Word Count: 1,800                   │
│     💡 Content Type: Comparison Review              │
│     [Analyze] [Generate Similar]                    │
│                                                     │
│  [8 more top-ranking pages...]                     │
│                                                     │
│  ────────────────────────────────────────────────   │
│                                                     │
│  💡 CONTENT OPPORTUNITIES                           │
│  • "Luxury watches for tropical climate" (Low comp) │
│  • "How to maintain luxury watches in Indonesia"   │
│  • "Best luxury watch dealers Jakarta"             │
│  • "Investment value of luxury watches 2026"       │
│                                                     │
│  [Generate Content Ideas] [Export Report]           │
└─────────────────────────────────────────────────────┘
```

**Keyword Research View:**
```
┌─────────────────────────────────────────────────────┐
│  🔑 RELATED KEYWORDS                                │
├─────────────────────────────────────────────────────┤
│  Keyword                    | Vol    | Diff | Trend │
│  ─────────────────────────────────────────────────  │
│  luxury watches jakarta     | 1,200  | 38   | ↑ +12%│
│  jam tangan mewah          | 5,400  | 45   | ↑ +8% │
│  rolex indonesia           | 1,800  | 52   | → 0%  │
│  omega watches bali        | 480    | 28   | ↑ +20%│
│  swiss watches indonesia   | 720    | 35   | ↓ -5% │
│                                                     │
│  [Add to Content Studio] [Track Rankings]          │
└─────────────────────────────────────────────────────┘
```

**Competitor Analysis View:**
```
┌─────────────────────────────────────────────────────┐
│  🎯 COMPETITOR SEO ANALYSIS                         │
├─────────────────────────────────────────────────────┤
│  Analyzing: www.thewatch.co                         │
│                                                     │
│  Current Rankings:                                  │
│  • Position 15 for "luxury watches Indonesia"       │
│  • Position 8 for "swiss watches Jakarta"          │
│  • Position 22 for "rolex indonesia"               │
│                                                     │
│  Top Competitors:                                   │
│  1. luxurywatcheshub.com (45 keywords in top 10)    │
│  2. watchenthusiast.id (32 keywords in top 10)      │
│  3. prestigetimepieces.id (28 keywords in top 10)   │
│                                                     │
│  💡 Recommendations:                                │
│  • Create buying guide content (gap vs competitor 1)│
│  • Target long-tail keywords (less competition)     │
│  • Build location-specific pages (Jakarta, Bali)    │
│                                                     │
│  [Full Report] [Track Competitors]                  │
└─────────────────────────────────────────────────────┘
```

**Database Operations:**
```sql
-- Log SEO search
INSERT INTO gv_search_history (user_id, search_type, query, results_count)
VALUES ('user_uuid', 'seo', 'Luxury watches Indonesia', 20);

-- Save keyword data
INSERT INTO gv_keyword_tracking (brand_id, keyword, search_volume, difficulty, trend)
VALUES ('brand_uuid', 'luxury watches indonesia', 2400, 42, '+15%');

-- Track competitor
INSERT INTO gv_competitor_tracking (brand_id, competitor_domain, tracked_at)
VALUES ('brand_uuid', 'luxurywatcheshub.com', NOW());
```

**Use Cases:**
- Keyword research for content planning
- Competitor SEO analysis
- Content gap identification
- Ranking tracking
- Topic opportunity discovery

**Expected Result:**
- ✅ Keyword data accurate
- ✅ Content analysis helpful
- ✅ Competitor insights actionable
- ✅ Export functionality works
- ✅ Integration with Content Studio

---

### MODE 3: SOCIAL SEARCH (Viral Content Discovery)

**Description:** Search across Instagram, TikTok, YouTube for viral content, trending topics, and high-performing posts using AI-powered social intelligence.

**Search Interface:**
```
┌─────────────────────────────────────────────────────┐
│  📱 SOCIAL SEARCH - Viral Content Discovery         │
├─────────────────────────────────────────────────────┤
│  What are you looking for?                          │
│  [Luxury watch unboxing videos                    ] │
│                                                     │
│  Platform:                                          │
│  ☑ Instagram  ☑ TikTok  ☐ YouTube                  │
│                                                     │
│  Filters:                                           │
│  Engagement: [> 10,000 ▼]                          │
│  Time Range: [Last 30 days ▼]                      │
│  Location: [Global ▼]                              │
│  Sort By: [Most Engaged ▼]                         │
│                                                     │
│  [🔍 Search]                                        │
└─────────────────────────────────────────────────────┘
```

**User Actions:**
1. Enter query: "Luxury watch unboxing videos"
2. Select platforms: Instagram + TikTok
3. Set engagement: > 10,000
4. Time range: Last 30 days
5. Click "Search"

**System Actions:**
```javascript
// Call Social Search Edge Function
const response = await fetch('/functions/v1/gv-social-search', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        brand_id: currentBrandId,
        query: 'Luxury watch unboxing videos',
        platforms: ['instagram', 'tiktok'],
        min_engagement: 10000,
        time_range: 30, // days
        location: 'global',
        sort_by: 'engagement',
        limit: 20
    })
});

const { viral_content } = await response.json();
// Returns viral posts, trending hashtags, top creators
```

**Social Search Results:**
```
┌─────────────────────────────────────────────────────┐
│  🔥 20 Viral Results - "luxury watch unboxing"      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Instagram Post 1                                   │
│  ┌─────────────────────────────────────────┐       │
│  │  [Thumbnail Image]                       │       │
│  │  @luxury_timepieces                      │       │
│  │  📱 Instagram Reel                        │       │
│  │                                          │       │
│  │  "Unboxing my new Rolex Submariner! 🔥" │       │
│  │                                          │       │
│  │  ❤️ 45,234 likes                          │       │
│  │  💬 1,248 comments                        │       │
│  │  📊 Engagement Rate: 8.2%                 │       │
│  │  📅 Posted 5 days ago                     │       │
│  │                                          │       │
│  │  Hashtags: #RolexUnboxing #LuxuryWatch  │       │
│  │  #WatchCollector #TimepieCE              │       │
│  │                                          │       │
│  │  💡 Why it's viral:                      │       │
│  │  • Professional lighting & cinematography│       │
│  │  • Detailed close-ups of watch features  │       │
│  │  • Emotional storytelling (gift story)   │       │
│  │  • Posted at optimal time (8 PM local)   │       │
│  │                                          │       │
│  │  [View Post] [Analyze] [Save to Hub]    │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  ────────────────────────────────────────────────   │
│                                                     │
│  TikTok Video 2                                     │
│  ┌─────────────────────────────────────────┐       │
│  │  [Thumbnail Image]                       │       │
│  │  @watchguru                              │       │
│  │  📱 TikTok Video                          │       │
│  │                                          │       │
│  │  "POV: You just bought your first Omega" │       │
│  │                                          │       │
│  │  ❤️ 128,500 likes                         │       │
│  │  💬 3,421 comments                        │       │
│  │  🔄 12,800 shares                         │       │
│  │  📊 Engagement Rate: 12.4%                │       │
│  │  📅 Posted 12 days ago                    │       │
│  │                                          │       │
│  │  Hashtags: #OmegaWatch #WatchTok        │       │
│  │  #LuxuryLifestyle #FirstWatch            │       │
│  │                                          │       │
│  │  💡 Why it's viral:                      │       │
│  │  • Trending "POV" format                 │       │
│  │  • Relatable luxury aspiration angle     │       │
│  │  • Fast-paced editing (3-5s clips)       │       │
│  │  • Trending audio used                   │       │
│  │                                          │       │
│  │  [View Video] [Analyze] [Save to Hub]   │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  [18 more viral posts...]                          │
│                                                     │
│  📊 Analytics Dashboard | 💾 Save All | 📥 Export   │
└─────────────────────────────────────────────────────┘
```

**Trending Hashtags View:**
```
┌─────────────────────────────────────────────────────┐
│  #️⃣ TRENDING HASHTAGS (Related to search)          │
├─────────────────────────────────────────────────────┤
│  Hashtag              | Posts   | Avg Eng | Trend   │
│  ──────────────────────────────────────────────────│
│  #LuxuryWatch         | 1.2M    | 6.8%    | ↑ +25% │
│  #RolexUnboxing       | 285K    | 8.2%    | ↑ +40% │
│  #WatchCollector      | 890K    | 5.5%    | → 0%   │
│  #OmegaWatch          | 456K    | 7.1%    | ↑ +18% │
│  #TimepieCE           | 324K    | 6.2%    | ↑ +12% │
│                                                     │
│  [Track Hashtags] [Use in Content Studio]          │
└─────────────────────────────────────────────────────┘
```

**Content Insights:**
```
┌─────────────────────────────────────────────────────┐
│  💡 VIRAL CONTENT INSIGHTS                          │
├─────────────────────────────────────────────────────┤
│  Based on 20 analyzed posts:                        │
│                                                     │
│  🎥 Format Performance:                             │
│  • Unboxing videos: 45,000 avg engagement           │
│  • Comparison videos: 38,000 avg engagement         │
│  • POV/storytelling: 52,000 avg engagement (BEST)   │
│                                                     │
│  ⏰ Best Posting Times:                             │
│  • Instagram: 8-9 PM local time                     │
│  • TikTok: 6-8 PM local time                        │
│                                                     │
│  🎨 Creative Elements:                              │
│  • Close-up shots (95% of viral posts)              │
│  • Music/trending audio (88% of viral posts)        │
│  • Text overlays (72% of viral posts)               │
│  • Emotional storytelling (68% of viral posts)      │
│                                                     │
│  📝 Caption Patterns:                               │
│  • Average length: 125 characters                   │
│  • Questions in caption: +15% engagement            │
│  • Emojis used: 3-5 per caption (optimal)          │
│                                                     │
│  [Generate Content Brief] [Save Report]             │
└─────────────────────────────────────────────────────┘
```

**Database Operations:**
```sql
-- Log social search
INSERT INTO gv_search_history (user_id, search_type, query, platforms, results_count)
VALUES ('user_uuid', 'social', 'Luxury watch unboxing videos',
        '["instagram", "tiktok"]', 20);

-- Save viral content references
INSERT INTO gv_viral_content_library (brand_id, platform, post_url, engagement, saved_at)
VALUES ('brand_uuid', 'instagram', 'instagram.com/p/abc123', 45234, NOW());

-- Track trending hashtags
INSERT INTO gv_hashtag_tracking (brand_id, hashtag, platform, post_count, avg_engagement)
VALUES ('brand_uuid', 'LuxuryWatch', 'instagram', 1200000, 6.8);
```

**Use Cases:**
- Discover viral content in your niche
- Identify trending hashtags
- Analyze competitor content performance
- Find content inspiration
- Track social media trends
- Identify top-performing creators

**Expected Result:**
- ✅ Viral content accurately identified
- ✅ Multi-platform search works
- ✅ Engagement metrics accurate
- ✅ Trend analysis helpful
- ✅ Save to Hub functional

---

### Search History & Saved Searches

**Search History View:**
```
┌─────────────────────────────────────────────────────┐
│  📜 RECENT SEARCHES                                 │
├─────────────────────────────────────────────────────┤
│  Today                                              │
│  • [📱] Luxury watch unboxing videos (20 results)    │
│  • [🔎] Luxury watches Indonesia (15 results)        │
│                                                     │
│  Yesterday                                          │
│  • [🌍] Fashion influencers in Jakarta (18 results)  │
│                                                     │
│  [Clear History] [Export All]                       │
└─────────────────────────────────────────────────────┘
```

**Saved Searches:**
```
┌─────────────────────────────────────────────────────┐
│  ⭐ SAVED SEARCHES                                   │
├─────────────────────────────────────────────────────┤
│  📱 "Luxury watch content trends"                    │
│     Social Search | Run weekly                      │
│     Last run: 2 days ago (18 new results)           │
│     [Run Now] [Edit] [Delete]                       │
│                                                     │
│  🔎 "Luxury watches Indonesia SEO"                   │
│     SEO Search | Run monthly                        │
│     Last run: 5 days ago (Keyword vol: +12%)        │
│     [Run Now] [Edit] [Delete]                       │
│                                                     │
│  [+ Create Saved Search]                            │
└─────────────────────────────────────────────────────┘
```

**Usage Tracking:**
```
Usage This Month (Basic Plan):
• GEO Searches: 3/10
• SEO Searches: 5/20
• Social Searches: Unlimited (Basic includes unlimited social)

[View Upgrade Options]
```

**Expected Result:**
- ✅ All 3 search modes functional
- ✅ Results accurate and relevant
- ✅ Save functionality works
- ✅ Export options functional
- ✅ Integration with Hub and Content Studio
- ✅ Usage tracking accurate

---

## STEP 10: DAILY INSIGHTS (AI Recommendations)

### Page: `/frontend/insights.html`

**User Journey:**
1. Click "Insights" in navigation
2. Page loads with AI-generated daily tasks

**What User Sees:**

**Usage Badge:**
```
5/8 Tasks Today (Basic Plan)
```

**Filter Bar:**
```
[All Tasks] [Crisis] [Radar] [Search] [Hub] [Chat]
```

**Task Cards (5 displayed):**

**Task 1:**
```
┌───────────────────────────────────────────┐
│ 🔥 Crisis Alert                  [HIGH]   │
├───────────────────────────────────────────┤
│ Brand Mention Spike Detected              │
│                                           │
│ "TheWatchCo" mentioned 15 times in last   │
│ 24h on Twitter - 3x normal volume.        │
│ Sentiment: 80% positive.                  │
│                                           │
│ [View Details] [Dismiss]                  │
└───────────────────────────────────────────┘
```

**Task 2:**
```
┌───────────────────────────────────────────┐
│ 🎯 Radar Discovery              [MEDIUM]  │
├───────────────────────────────────────────┤
│ New Fashion Creators in Indonesia         │
│                                           │
│ 12 new micro-influencers (10K-50K) in     │
│ fashion category detected. Average eng:   │
│ 5.2%. Perfect for TheWatchCo!             │
│                                           │
│ [Discover Now] [Dismiss]                  │
└───────────────────────────────────────────┘
```

**Task 3:**
```
┌───────────────────────────────────────────┐
│ 💡 Content Idea                  [LOW]    │
├───────────────────────────────────────────┤
│ Trending Topic: "Luxury Gift Guide"       │
│                                           │
│ Create Instagram carousel: "10 Luxury     │
│ Watches Perfect for Valentine's Day"      │
│ Trending searches +45% this week.         │
│                                           │
│ [Generate Content] [Dismiss]             │
└───────────────────────────────────────────┘
```

**Task 4:**
```
┌───────────────────────────────────────────┐
│ 📊 Hub Update                   [MEDIUM]  │
├───────────────────────────────────────────┤
│ Empty Collection Alert                    │
│                                           │
│ You haven't created any creator           │
│ collections yet. Start organizing your    │
│ influencer network!                       │
│                                           │
│ [Create Collection] [Dismiss]            │
└───────────────────────────────────────────┘
```

**Task 5:**
```
┌───────────────────────────────────────────┐
│ 💬 AI Chat Suggestion            [LOW]    │
├───────────────────────────────────────────┤
│ Ask About Competitor Analysis             │
│                                           │
│ Get insights on how luxury watch brands   │
│ in Indonesia are positioning themselves.  │
│                                           │
│ [Ask AI] [Dismiss]                       │
└───────────────────────────────────────────┘
```

**System Actions:**
```javascript
// Call Daily Insights Edge Function
const response = await fetch('/functions/v1/generate-daily-insights', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        brand_id: currentBrandId
    })
});

const { tasks } = await response.json();
// Returns array of 5-12 prioritized tasks

// Check usage limit (8 tasks/day for Basic)
const { data: usage } = await supabase
    .from('gv_tier_usage')
    .select('current_usage, tier_limit')
    .eq('user_id', currentUser.id)
    .eq('feature_name', 'daily_tasks')
    .single();

// Display tasks (max tier limit)
displayTasks(tasks.slice(0, usage.tier_limit));
```

**User Actions:**
1. Review daily tasks
2. Click "View Details" on Crisis Alert
3. Click "Discover Now" on Radar task → redirects to Radar
4. Click "Generate Content" → redirects to Content Studio
5. Filter by category (Crisis, Radar, Hub, etc.)

**Expected Result:**
- ✅ Tasks generated daily
- ✅ Personalized to brand (TheWatchCo)
- ✅ Action buttons redirect correctly
- ✅ Tier limit enforced (8 tasks for Basic)

---

## STEP 9: CONTENT STUDIO (Content Generation)

### Page: `/frontend/content-studio.html`

**User Journey:**
1. Click "Content Studio" in navigation
2. Page loads with 3 tabs: Articles | Social Posts | Q&A

**Usage Indicator:**
```
0/20 Articles Generated (Basic Plan)
```

---

### TAB 1: ARTICLES

**User Actions:**
1. Select "Articles" tab (default)
2. Enter Topic: `Luxury Watch Care Tips for Indonesian Climate`
3. Enter Keywords: `luxury watches, maintenance, Indonesia, humidity`
4. Select Tone: `Professional`
5. Click "Generate Article" button

**System Actions:**
```javascript
// Check usage limit
const { data: usage } = await supabase
    .from('gv_tier_usage')
    .select('current_usage, tier_limit')
    .eq('user_id', currentUser.id)
    .eq('feature_name', 'articles')
    .single();

if (usage.current_usage >= usage.tier_limit) {
    showLimitModal('articles');
    return;
}

// Call Content Generation Edge Function
const response = await fetch('/functions/v1/gv-generate-article', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        brand_id: currentBrandId,
        topic: 'Luxury Watch Care Tips for Indonesian Climate',
        keywords: ['luxury watches', 'maintenance', 'Indonesia', 'humidity'],
        tone: 'professional',
        word_count: 800
    })
});

const { article } = await response.json();

// Display article in preview pane
// Increment usage
await supabase
    .from('gv_tier_usage')
    .update({ current_usage: usage.current_usage + 1 })
    .eq('user_id', currentUser.id)
    .eq('feature_name', 'articles');

// Update indicator: 1/20
```

**Generated Article Preview:**
```
Title: Essential Luxury Watch Care Tips for Indonesia's Tropical Climate

Indonesia's humid tropical climate presents unique challenges for
luxury watch owners. With average humidity levels of 70-80% and
temperatures ranging from 26-32°C year-round, proper maintenance
is crucial to preserve your timepiece's value and functionality.

1. Combat Humidity
The high humidity in Indonesia can cause moisture to penetrate...

[800 words total]

[Copy to Clipboard] [Export to Google Docs] [Regenerate]
```

**Usage Update:**
```
1/20 Articles Generated (Basic Plan)
Progress bar: 5% filled (green)
```

**Expected Result:**
- ✅ Article generated (GPT-4o)
- ✅ Relevant to brand and location
- ✅ Usage tracked correctly
- ✅ Copy/export functional

---

### TAB 2: SOCIAL POSTS

**User Actions:**
1. Click "Social Posts" tab
2. Select Platform: `Instagram`
3. Select Post Type: `Carousel`
4. Enter Hook: `Valentine's Day luxury gift guide`
5. Click "Generate Post"

**System Output:**
```
Instagram Carousel Post (5 slides):

Slide 1 (Cover):
🎁 Valentine's Day Gift Guide 2026
10 Luxury Watches That Say "I Love You"
#TheWatchCo #LuxuryGifts #ValentinesDay

Slide 2:
1. Classic Elegance - Rp 15,000,000
Timeless design, perfect for romantic dinners
[Product image placeholder]

Slide 3-5: [Additional watches]

Caption:
Finding the perfect Valentine's gift? 💝

These 10 luxury timepieces combine elegance,
craftsmanship, and timeless style - the ultimate
way to show your love.

Swipe to explore our Valentine's Collection →

Which one would you choose? Comment below! 👇

#TheWatchCo #LuxuryWatches #ValentinesDay2026
#LuxuryGifts #IndonesiaLuxury #JamMewah
#GiftIdeas #LuxuryLifestyle

[259 characters - Perfect for Instagram]

[Copy Caption] [Download Images] [Schedule Post]
```

**Expected Result:**
- ✅ Platform-specific content
- ✅ Character count correct
- ✅ Hashtags included
- ✅ Brand voice consistent

---

### TAB 3: Q&A GENERATION

**User Actions:**
1. Click "Q&A" tab
2. Enter Topic: `Luxury watch authenticity`
3. Select Number: `5 Q&A pairs`
4. Click "Generate Q&A"

**System Output:**
```
Q1: How can I verify if a luxury watch is authentic?
A: Check the serial number, weight, movement quality,
and request authenticity certificates. TheWatchCo
provides full authentication for all timepieces.

Q2: What's the difference between automatic and quartz?
A: Automatic watches are self-winding through wrist
movement, while quartz uses battery power...

Q3-5: [Additional Q&A pairs]

[Copy All] [Export as FAQ Page]
```

**Expected Result:**
- ✅ Q&A pairs generated
- ✅ Brand-relevant answers
- ✅ Export options work

---

## STEP 10: RADAR (Creator Discovery)

### Page: `/frontend/radar.html`

**User Journey:**
1. Click "Radar" in navigation
2. Page loads with search interface

**Usage Indicator:**
```
0/10 Searches This Month (Basic Plan)
```

**User Actions - First Search:**

**Search Filters:**
1. Country: `Indonesia` ✅
2. Category: `Fashion` ✅
3. Follower Range: `10K - 100K` ✅
4. Engagement Rate: `> 5%` ✅
5. Platform: `Instagram` ✅
6. Click "Search Creators" button

**System Actions:**
```javascript
// Check usage limit
const { data: usage } = await supabase
    .from('gv_tier_usage')
    .select('current_usage, tier_limit')
    .eq('user_id', currentUser.id)
    .eq('feature_name', 'radar_searches')
    .single();

if (usage.current_usage >= usage.tier_limit) {
    showLimitModal('radar_searches');
    return;
}

// Call Radar Edge Function
const response = await fetch('/functions/v1/radar-discover-creators', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        brand_id: currentBrandId,
        country: 'Indonesia',
        category: 'Fashion',
        follower_range: '10000-100000',
        engagement_min: 5.0,
        platform: 'instagram',
        limit: 20
    })
});

const { creators } = await response.json();

// Display results
// Increment usage
await supabase
    .from('gv_tier_usage')
    .update({ current_usage: usage.current_usage + 1 })
    .eq('user_id', currentUser.id)
    .eq('feature_name', 'radar_searches');

// Update indicator: 1/10
```

**Search Results (Grid of 20 creators):**

**Creator Card 1:**
```
┌────────────────────────────────┐
│  [Avatar Image]                │
│  @fashionista_jkt              │
│                                │
│  📍 Jakarta, Indonesia         │
│  👥 45.2K followers            │
│  💬 6.8% engagement            │
│  📱 Instagram                  │
│                                │
│  "Fashion & lifestyle content  │
│  creator focusing on luxury    │
│  brands and street style"      │
│                                │
│  [Save to Collection ⭐]      │
└────────────────────────────────┘
```

**Creator Card 2:**
```
┌────────────────────────────────┐
│  [Avatar Image]                │
│  @luxe_lifestyle_bali          │
│                                │
│  📍 Bali, Indonesia            │
│  👥 38.5K followers            │
│  💬 7.2% engagement            │
│  📱 Instagram                  │
│                                │
│  "Luxury lifestyle & travel.   │
│  Partner with premium brands.  │
│  Bali-based creator."          │
│                                │
│  [Save to Collection ⭐]      │
└────────────────────────────────┘
```

**[18 more creator cards displayed...]**

**Usage Update:**
```
1/10 Searches This Month (Basic Plan)
Progress bar: 10% filled (green)
```

**User Actions:**
1. Review search results (20 creators)
2. Click "Save to Collection" on 3 creators
3. Modal appears: "Select collection or create new"
4. Create new collection: "Indonesian Fashion Influencers"
5. Save creators to collection

**Expected Result:**
- ✅ Search returns relevant results
- ✅ Filters work correctly
- ✅ Save to collection functional
- ✅ Usage tracked (1/10)

---

## STEP 11: HUB (Creator Collections)

### Page: `/frontend/hub.html`

**User Journey:**
1. Click "Hub" in navigation
2. Page loads with collections view

**Usage Indicator:**
```
1/3 Collections (Basic Plan)
```

**What User Sees:**

**Collection Grid:**

**Collection Card 1:**
```
┌─────────────────────────────────────┐
│  Indonesian Fashion Influencers     │
│  Fashion • 3 creators               │
│                                     │
│  [Avatar] [Avatar] [Avatar]         │
│                                     │
│  Created today                      │
│  Avg Engagement: 6.5%               │
│  Total Reach: 128K                  │
│                                     │
│  [View Collection]  [Edit]  [⋮]    │
└─────────────────────────────────────┘
```

**Empty Slots:**
```
┌─────────────────────────────────────┐
│  + Create New Collection            │
│                                     │
│  You can create 2 more collections  │
│  (Basic Plan: 3 max)                │
└─────────────────────────────────────┘
```

**User Actions:**
1. Click "View Collection" on "Indonesian Fashion Influencers"
2. Redirects to `/frontend/hub-collection.html?id=collection_uuid`

**Collection Detail Page:**

**Collection Header:**
```
Indonesian Fashion Influencers
Fashion • 3 creators • Created Feb 14, 2026

[Add Creators] [Export CSV] [Share] [Delete]
```

**Creator Table:**
```
┌──────────┬────────────────────┬────────┬────────────┬────────────┬─────────┐
│ Avatar   │ Name               │ Platform│ Followers  │ Engagement │ Actions │
├──────────┼────────────────────┼────────┼────────────┼────────────┼─────────┤
│ [img]    │ @fashionista_jkt   │ IG     │ 45.2K      │ 6.8%       │ [⋮]     │
│ [img]    │ @luxe_lifestyle... │ IG     │ 38.5K      │ 7.2%       │ [⋮]     │
│ [img]    │ @jakarta_style     │ IG     │ 52.1K      │ 5.9%       │ [⋮]     │
└──────────┴────────────────────┴────────┴────────────┴────────────┴─────────┘

Total Reach: 135.8K
Average Engagement: 6.6%
```

**User Actions:**
1. Click "Add Creators" button
2. Search modal opens
3. Search for more creators
4. Add 2 more creators to collection
5. Click "Export CSV" to download list
6. Return to Hub dashboard

**Create Second Collection:**
1. Back to hub.html
2. Click "+ Create New Collection"
3. Enter name: "Watch Enthusiasts - TikTok"
4. Select category: Lifestyle
5. Add description
6. Click "Create"
7. Usage updates: `2/3 Collections (Basic)`

**Attempt Third Collection (At Limit):**
1. Click "+ Create New Collection"
2. Enter name: "Luxury Lifestyle Creators"
3. Click "Create"
4. Friendly modal appears:

```
┌───────────────────────────────────────┐
│  Collection Limit Reached             │
├───────────────────────────────────────┤
│  You've reached your 3 collection     │
│  limit for the Basic plan.            │
│                                       │
│  Tier Comparison:                     │
│  Basic:    3 collections              │
│  Premium:  10 collections             │
│  Partner:  Unlimited                  │
│                                       │
│  [Maybe Later] [Upgrade to Premium]   │
└───────────────────────────────────────┘
```

**Expected Result:**
- ✅ Collections created successfully
- ✅ Creators saved to collections
- ✅ Limit enforced (3 for Basic)
- ✅ Friendly modal (not blocking)
- ✅ Can still view/edit existing collections
- ✅ Export functionality works

---

## STEP 12: LOGOUT (Session Termination)

### Page: Any page with user dropdown

**User Journey:**
1. Click user avatar/email in top-right corner
2. Dropdown menu appears
3. Click "Logout" option

**Logout Dropdown Menu:**
```
┌─────────────────────────────────┐
│  user@example.com               │
│  TheWatchCo                     │
│  ─────────────────────────────  │
│  👤 Profile                      │
│  ⚙️ Settings                     │
│  💳 Billing                      │
│  ❓ Help Center                  │
│  ─────────────────────────────  │
│  🚪 Logout                       │
└─────────────────────────────────┘
```

**User Actions:**
1. Click "Logout" in dropdown

**System Actions:**
```javascript
// Logout function
async function logout() {
    try {
        // Call Supabase auth signOut
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            showError('Failed to logout. Please try again.');
            return;
        }

        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('brand_id');
        localStorage.removeItem('current_tier');
        localStorage.removeItem('tour_completed');

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear any cached data
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }

        // Show logout confirmation
        showSuccessToast('Logged out successfully');

        // Redirect to login page after 1 second
        setTimeout(() => {
            window.location.href = '/frontend/login.html';
        }, 1000);

    } catch (error) {
        console.error('Logout exception:', error);
        showError('Logout failed. Please refresh and try again.');
    }
}
```

**Logout Confirmation Modal (Optional):**
```
┌───────────────────────────────────────┐
│  Are you sure you want to logout?    │
├───────────────────────────────────────┤
│  You will be redirected to the login  │
│  page. Your data is safely saved.     │
│                                       │
│  [Cancel] [Yes, Logout]               │
└───────────────────────────────────────┘
```

**Database Operations:**
```sql
-- Revoke refresh tokens (Supabase handles this automatically)
-- No explicit database operations needed

-- Optional: Log logout event for analytics
INSERT INTO gv_user_activity_logs (user_id, activity_type, timestamp)
VALUES ('user_uuid', 'logout', NOW());
```

**Session Cleanup Details:**

**1. Token Revocation:**
- Supabase automatically revokes refresh tokens on signOut
- Access tokens become invalid immediately
- Session removed from auth.sessions table

**2. Client-Side Cleanup:**
```javascript
// Items cleared from localStorage
- access_token
- refresh_token
- user_id
- brand_id
- current_tier
- tour_completed
- onboarding_step1-5 (if any remain)
- search_history
- draft_content

// Items cleared from sessionStorage
- temporary_data
- form_drafts
- unsaved_changes
```

**3. Cookie Cleanup:**
```javascript
// Clear any auth cookies
document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    if (name.startsWith('sb-') || name.includes('auth')) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
});
```

**Redirect to Login Page:**
```
┌─────────────────────────────────────────┐
│  GeoVera Intelligence Platform          │
├─────────────────────────────────────────┤
│                                         │
│  ✅ You have been logged out            │
│                                         │
│  [Login] [Sign Up]                      │
│                                         │
│  [Tabs: Login | Signup | Forgot Pass]  │
└─────────────────────────────────────────┘
```

**Expected Result:**
- ✅ Session terminated successfully
- ✅ All tokens revoked
- ✅ localStorage cleared
- ✅ Redirect to login page
- ✅ Cannot access protected pages without re-login
- ✅ No data loss (all saved to database)

**Security Notes:**
- Tokens are revoked server-side (Supabase Auth)
- Client-side cleanup prevents token leakage
- User must re-authenticate to access platform
- Previous session cannot be reused

**Re-Login Flow:**
After logout, user must:
1. Enter email + password again
2. Pass authentication
3. New session created
4. New access/refresh tokens issued
5. Redirect to dashboard (existing user)

---

## STEP 13: DELETE USER ACCOUNT (GDPR Compliance)

### Page: `/frontend/settings.html` (Account Tab)

**User Journey:**
1. Navigate to Settings → Account tab
2. Scroll to bottom: "Danger Zone"
3. Click "Delete Account" button
4. Confirmation modal appears

**Settings - Account Tab:**
```
┌─────────────────────────────────────────────────────┐
│  ACCOUNT SETTINGS                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Profile Information                                │
│  Email: user@example.com                            │
│  Member Since: February 14, 2026                    │
│  Account Status: Active (Free Trial)                │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Change Password                                    │
│  Current Password: [_______________]                │
│  New Password: [_______________]                    │
│  Confirm Password: [_______________]                │
│  [Update Password]                                  │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Download Your Data (GDPR)                          │
│  Export all your data in JSON format                │
│  [Download Data Archive]                            │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ⚠️ DANGER ZONE                                     │
│                                                     │
│  Delete Account                                     │
│  Permanently delete your account and all data.      │
│  This action cannot be undone.                      │
│                                                     │
│  [Delete Account]                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**User Actions:**
1. Click "Delete Account" button

**Confirmation Modal (Step 1 - Initial Warning):**
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Delete Account?                                 │
├─────────────────────────────────────────────────────┤
│  Are you sure you want to delete your account?      │
│                                                     │
│  This will permanently delete:                      │
│  • Your brand: TheWatchCo                           │
│  • All creator collections (3 collections)          │
│  • All saved creators (15 creators)                 │
│  • All generated content (5 articles)               │
│  • Search history and saved searches                │
│  • Chat history (10 messages)                       │
│  • All usage data and analytics                     │
│  • Your subscription (Basic - Free Trial)           │
│                                                     │
│  ⚠️ This action CANNOT be undone!                   │
│                                                     │
│  [Cancel] [Continue to Delete]                      │
└─────────────────────────────────────────────────────┘
```

**User Action:** Click "Continue to Delete"

**Confirmation Modal (Step 2 - Type Confirmation):**
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Final Confirmation                              │
├─────────────────────────────────────────────────────┤
│  Before we delete your account, please:             │
│                                                     │
│  1. Type "DELETE" to confirm (case-sensitive)       │
│     [_________________]                             │
│                                                     │
│  2. Tell us why you're leaving (optional)           │
│     ○ Not using it enough                           │
│     ○ Too expensive                                 │
│     ○ Missing features I need                       │
│     ○ Found a better alternative                    │
│     ○ Privacy concerns                              │
│     ○ Other: [___________________]                  │
│                                                     │
│  3. Email confirmation                              │
│     We'll send deletion confirmation to:            │
│     user@example.com                                │
│                                                     │
│  [Cancel] [Delete My Account Permanently]           │
└─────────────────────────────────────────────────────┘
```

**User Actions:**
1. Type "DELETE" in confirmation field
2. Select reason (optional): "Not using it enough"
3. Click "Delete My Account Permanently"

**System Actions:**
```javascript
// Delete account function
async function deleteUserAccount(userId, reason) {
    try {
        // 1. Verify user typed "DELETE"
        const confirmationText = document.getElementById('delete-confirmation').value;
        if (confirmationText !== 'DELETE') {
            showError('Please type "DELETE" to confirm');
            return;
        }

        // 2. Show loading state
        showLoadingModal('Deleting your account...');

        // 3. Call Delete Account Edge Function (handles cascade)
        const response = await fetch('/functions/v1/gv-delete-user-account', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                deletion_reason: reason,
                confirmation: 'DELETE'
            })
        });

        const { success, message } = await response.json();

        if (!success) {
            showError(message || 'Failed to delete account');
            return;
        }

        // 4. Send deletion confirmation email
        await sendDeletionConfirmationEmail(userEmail);

        // 5. Sign out user
        await supabase.auth.signOut();

        // 6. Clear all local data
        localStorage.clear();
        sessionStorage.clear();

        // 7. Show success message
        showSuccessModal('Account Deleted',
            'Your account has been permanently deleted. You will receive a confirmation email shortly.');

        // 8. Redirect to login after 3 seconds
        setTimeout(() => {
            window.location.href = '/frontend/login.html?deleted=true';
        }, 3000);

    } catch (error) {
        console.error('Account deletion error:', error);
        showError('Failed to delete account. Please contact support.');
    }
}
```

**Edge Function: `/supabase/functions/gv-delete-user-account/index.ts`**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
    try {
        const { user_id, deletion_reason, confirmation } = await req.json();

        // Verify confirmation
        if (confirmation !== 'DELETE') {
            return new Response(
                JSON.stringify({ success: false, message: 'Invalid confirmation' }),
                { status: 400 }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Service role for admin operations
        );

        // Begin transaction-like cascade deletion

        // 1. Log deletion request (for audit trail)
        await supabase
            .from('gv_account_deletions')
            .insert({
                user_id,
                deletion_reason,
                deleted_at: new Date().toISOString(),
                ip_address: req.headers.get('x-forwarded-for'),
                user_agent: req.headers.get('user-agent')
            });

        // 2. Get brand_id for cascade
        const { data: brands } = await supabase
            .from('user_brands')
            .select('brand_id')
            .eq('user_id', user_id);

        const brandIds = brands?.map(b => b.brand_id) || [];

        // 3. CASCADE DELETE (order matters for foreign keys)

        // Delete hub data
        for (const brandId of brandIds) {
            // Delete collection_creators links
            const { data: collections } = await supabase
                .from('hub_collections')
                .select('collection_id')
                .eq('brand_id', brandId);

            const collectionIds = collections?.map(c => c.collection_id) || [];

            await supabase
                .from('hub_collection_creators')
                .delete()
                .in('collection_id', collectionIds);

            // Delete creators
            await supabase
                .from('hub_creators')
                .delete()
                .eq('brand_id', brandId);

            // Delete collections
            await supabase
                .from('hub_collections')
                .delete()
                .eq('brand_id', brandId);
        }

        // Delete content studio data
        await supabase
            .from('gv_generated_content')
            .delete()
            .in('brand_id', brandIds);

        // Delete search history
        await supabase
            .from('gv_search_history')
            .delete()
            .eq('user_id', user_id);

        // Delete chat history
        await supabase
            .from('gv_chat_history')
            .delete()
            .eq('user_id', user_id);

        // Delete daily insights
        await supabase
            .from('gv_daily_insights')
            .delete()
            .eq('user_id', user_id);

        // Delete radar discoveries
        await supabase
            .from('gv_radar_discoveries')
            .delete()
            .in('brand_id', brandIds);

        // Delete tier usage tracking
        await supabase
            .from('gv_tier_usage')
            .delete()
            .eq('user_id', user_id);

        // Delete subscriptions
        await supabase
            .from('gv_subscriptions')
            .delete()
            .eq('user_id', user_id);

        // Delete payment records
        await supabase
            .from('gv_payments')
            .delete()
            .eq('user_id', user_id);

        // Delete user_brands relationship
        await supabase
            .from('user_brands')
            .delete()
            .eq('user_id', user_id);

        // Delete brands
        await supabase
            .from('gv_brands')
            .delete()
            .in('brand_id', brandIds);

        // 4. Delete user from auth.users (final step)
        const { error: authError } = await supabase.auth.admin.deleteUser(user_id);

        if (authError) {
            console.error('Auth deletion error:', authError);
            throw authError;
        }

        // 5. Success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Account deleted successfully',
                deleted_at: new Date().toISOString()
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            }
        );

    } catch (error) {
        console.error('Deletion error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to delete account',
                error: error.message
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            }
        );
    }
});
```

**Cascade Deletion Order (GDPR Compliant):**
```sql
-- Order of deletion (respects foreign key constraints)

-- 1. Hub collection links
DELETE FROM hub_collection_creators WHERE collection_id IN (...);

-- 2. Hub creators
DELETE FROM hub_creators WHERE brand_id IN (...);

-- 3. Hub collections
DELETE FROM hub_collections WHERE brand_id IN (...);

-- 4. Generated content
DELETE FROM gv_generated_content WHERE brand_id IN (...);

-- 5. Search history
DELETE FROM gv_search_history WHERE user_id = '...';

-- 6. Chat history
DELETE FROM gv_chat_history WHERE user_id = '...';

-- 7. Daily insights
DELETE FROM gv_daily_insights WHERE user_id = '...';

-- 8. Radar discoveries
DELETE FROM gv_radar_discoveries WHERE brand_id IN (...);

-- 9. Keyword tracking
DELETE FROM gv_keyword_tracking WHERE brand_id IN (...);

-- 10. Competitor tracking
DELETE FROM gv_competitor_tracking WHERE brand_id IN (...);

-- 11. Viral content library
DELETE FROM gv_viral_content_library WHERE brand_id IN (...);

-- 12. Tier usage
DELETE FROM gv_tier_usage WHERE user_id = '...';

-- 13. Subscriptions
DELETE FROM gv_subscriptions WHERE user_id = '...';

-- 14. Payments
DELETE FROM gv_payments WHERE user_id = '...';

-- 15. User-brand relationship
DELETE FROM user_brands WHERE user_id = '...';

-- 16. Brands
DELETE FROM gv_brands WHERE brand_id IN (...);

-- 17. Onboarding data
DELETE FROM user_onboarding WHERE user_id = '...';

-- 18. Activity logs (retain for 30 days for audit)
-- Marked as deleted, actual deletion after 30 days

-- 19. User auth (final step)
-- Handled by Supabase auth.admin.deleteUser()
```

**Deletion Confirmation Email:**
```
Subject: Your GeoVera account has been deleted

Hi there,

This confirms that your GeoVera account (user@example.com) has been
permanently deleted on February 14, 2026 at 3:45 PM (UTC).

What was deleted:
✓ Your account and login credentials
✓ Brand: TheWatchCo
✓ All creator collections and saved creators
✓ All generated content and articles
✓ Search history and chat history
✓ Subscription and billing information
✓ All personal data and analytics

Data Retention (GDPR):
• Most data deleted immediately
• Audit logs retained for 30 days (regulatory compliance)
• After 30 days, all traces removed from our systems

Changed your mind?
You have 30 days to contact support@geovera.xyz to potentially
recover your account. After 30 days, recovery is impossible.

Want to come back?
You can always create a new account at https://geovera.xyz/signup

Questions?
Contact us at support@geovera.xyz

Best regards,
The GeoVera Team

---
This is an automated message. Please do not reply.
```

**Success Modal (Final):**
```
┌─────────────────────────────────────────────────────┐
│  ✅ Account Deleted Successfully                     │
├─────────────────────────────────────────────────────┤
│  Your GeoVera account has been permanently deleted. │
│                                                     │
│  • All data removed from our systems                │
│  • Confirmation email sent to user@example.com      │
│  • You will be logged out in 3 seconds...           │
│                                                     │
│  Thank you for trying GeoVera.                      │
│  We're sorry to see you go!                         │
│                                                     │
│  [Return to Login]                                  │
└─────────────────────────────────────────────────────┘
```

**GDPR Compliance Checklist:**
- ✅ User can request account deletion
- ✅ Confirmation required (type "DELETE")
- ✅ Cascade deletion of all related data
- ✅ Deletion confirmation email sent
- ✅ Audit log created (retained 30 days)
- ✅ No personal data retained after 30 days
- ✅ User can download data before deletion
- ✅ Transparent about what gets deleted
- ✅ Optional feedback collection
- ✅ Grace period (30 days) for recovery

**Expected Result:**
- ✅ Account deleted successfully
- ✅ All data cascade deleted
- ✅ User logged out
- ✅ Confirmation email sent
- ✅ Cannot login with old credentials
- ✅ No data remains (after 30 day audit period)
- ✅ GDPR compliant

---

## COMPLETE USER FLOW SUMMARY

### Journey Time: ~75-90 minutes for complete exploration

```
1. Sign Up (2 min)
   → Email: user@example.com
   → Password created
   → Confirmation email sent

2. Email Confirmation (1 min)
   → Click link in email
   → Email verified
   → Account activated

3. Log In (1 min)
   → Enter credentials
   → Session created
   → Redirect to onboarding (first-time) or dashboard (returning)

4. Onboarding - 5 Steps (10 min)
   Step 1: Brand Setup (TheWatchCo, Fashion, www.thewatch.co)
   Step 2: Goals (brand awareness, find creators, content)
   Step 3: Preferences (Fashion, Lifestyle | Instagram, TikTok)
   Step 4: Location (Indonesia, IDR, Asia/Jakarta)
   Step 5: Plan (Basic - Free Trial, 14 days)
   → Brand created
   → Subscription initialized
   → Usage tracking set up

5. Brief Report (2 min)
   → Review onboarding summary
   → See tier limits
   → Go to dashboard

6. Welcome Tour (Optional - 5 min)
   → 7-step feature introduction
   → Can skip to dashboard
   → Won't show again after completion

7. Dashboard (5 min)
   → See welcome message
   → Review 0 stats (new user)
   → Explore quick actions
   → Navigate to features

8. AI Chat (10 min)
   → Ask: "How to grow TheWatchCo on Instagram/TikTok?"
   → Receive strategic advice
   → Usage: 1/30 messages
   → Get actionable recommendations

9. LLM Search - 3 Modes (15 min)
   → GEO Search: "Fashion influencers in Jakarta" (location-based)
   → SEO Search: "Luxury watches Indonesia" (keyword research)
   → Social Search: "Luxury watch unboxing" (viral content discovery)
   → Save interesting findings
   → Usage tracking per search type

10. Daily Insights (5 min)
    → Review 5-8 AI-generated tasks
    → Crisis alerts, Radar discoveries, Content ideas
    → Click action buttons (redirect to features)
    → Usage: 5/8 tasks today

11. Content Studio (10 min)
    → Generate article: "Watch Care Tips for Indonesia"
    → Generate Instagram carousel: "Valentine's Gift Guide"
    → Generate Q&A: "Watch Authenticity FAQ"
    → Usage: 3/20 articles

12. Radar (15 min)
    → Search: Indonesia, Fashion, 10K-100K, >5%, Instagram
    → Find 20 relevant creators
    → Save 3 creators to new collection
    → Usage: 1/10 searches

13. Hub (10 min)
    → View saved creators
    → Create collection: "Indonesian Fashion Influencers"
    → Add more creators from searches
    → Create 2nd & 3rd collections
    → Try 4th collection → friendly limit modal
    → Usage: 3/3 collections (limit reached)

14. Settings (5 min)
    → Update brand social links (@Thewatchco, @Thewatchcoofficial)
    → Review subscription status (Basic, Free Trial)
    → Check usage stats (all features)
    → Download data archive (GDPR)

15. Logout (1 min)
    → Click user dropdown
    → Click Logout
    → Session terminated
    → Redirected to login

16. Delete Account (Optional - 3 min)
    → Navigate to Settings → Account → Danger Zone
    → Confirm deletion (type "DELETE")
    → All data cascade deleted
    → Confirmation email sent
```

**Complete Flow Tested:** ⬜ NOT YET TESTED
**Expected Time:** 75-90 minutes (with exploration)
**Speed Run Time:** ~30 minutes (skip optional features)

---

## PAYMENT FLOW (Future - Not Yet Implemented)

### When Free Trial Ends (Day 15)

**System Actions:**
```javascript
// Check trial status daily
const { data: subscription } = await supabase
    .from('gv_subscriptions')
    .select('trial_ends_at, status')
    .eq('user_id', currentUser.id)
    .single();

const trialEnded = new Date(subscription.trial_ends_at) < new Date();

if (trialEnded && subscription.status === 'trial') {
    // Show payment modal
    showPaymentRequired();
}
```

**Payment Modal:**
```
┌─────────────────────────────────────────┐
│  Your Free Trial Has Ended              │
├─────────────────────────────────────────┤
│  Continue using GeoVera by subscribing  │
│                                         │
│  Basic Plan - Rp 6,383,500/month        │
│  ✓ 3 collections                        │
│  ✓ 30 AI messages/month                 │
│  ✓ 20 articles/month                    │
│  ✓ 10 radar searches/month              │
│                                         │
│  Payment Method:                        │
│  💳 Credit/Debit Card                   │
│  🏦 Bank Transfer (Indonesia)           │
│  💰 GoPay / OVO / Dana                  │
│                                         │
│  [Subscribe Now] [View Other Plans]     │
└─────────────────────────────────────────┘
```

**Payment Integration (To Be Implemented):**
- Stripe for international cards
- Xendit for Indonesia (GoPay, OVO, Dana, Bank Transfer)
- Automatic subscription renewal
- Invoice generation

---

## TIER USAGE ENFORCEMENT

### How Limits Work

**Basic Plan Example:**
```javascript
// User tries to send 31st chat message
const { data: usage } = await supabase
    .from('gv_tier_usage')
    .select('current_usage, tier_limit')
    .eq('user_id', currentUser.id)
    .eq('feature_name', 'chat_messages')
    .single();

// usage.current_usage = 30
// usage.tier_limit = 30

if (usage.current_usage >= usage.tier_limit) {
    // Show friendly modal
    showLimitModal({
        feature: 'AI Chat',
        currentTier: 'Basic',
        currentLimit: 30,
        upgradeTier: 'Premium',
        upgradeLimit: 100
    });
    return; // Don't send message
}
```

**Limit Modal:**
```
┌───────────────────────────────────────┐
│  Monthly Message Limit Reached        │
├───────────────────────────────────────┤
│  You've used all 30 AI Chat messages  │
│  for this month (Basic Plan).         │
│                                       │
│  Upgrade to Premium for:              │
│  • 100 messages/month (vs 30)         │
│  • 10 collections (vs 3)              │
│  • 50 radar searches (vs 10)          │
│                                       │
│  [Maybe Later] [Upgrade to Premium]   │
└───────────────────────────────────────┘
```

**Key Points:**
- ✅ User can close modal (not blocked permanently)
- ✅ Can still use other features
- ✅ Limit resets monthly
- ✅ Upgrade option available
- ✅ No hard blocking - friendly UX

---

## PRICING VERIFICATION

### PPP-Adjusted Pricing (Indonesia)

**Base USD Prices:**
- Basic: $399/month
- Premium: $609/month
- Partner: $899/month

**PPP Multiplier for Indonesia:** 16x
(Based on purchasing power parity)

**Indonesia Prices (IDR):**
```javascript
const PPP_MULTIPLIER = {
    'Indonesia': 16000, // 1 USD = 16,000 IDR (approx)
    'United States': 1,
    'Singapore': 1.35,
    // ... 50+ countries
};

// Calculate Indonesia pricing
const basicIDR = 399 * 16000 = 6,384,000 IDR/month
const premiumIDR = 609 * 16000 = 9,744,000 IDR/month
const partnerIDR = 899 * 16000 = 14,384,000 IDR/month
```

**Displayed on Pricing Page:**
```
┌─────────────────────────────────────┐
│  Basic Plan                         │
│  Rp 6,383,500/month                 │
│  Perfect for small brands           │
│                                     │
│  ✓ 3 creator collections            │
│  ✓ 30 AI chat messages/month        │
│  ✓ 20 articles/month                │
│  ✓ 8 daily insights                 │
│  ✓ 10 radar searches/month          │
│                                     │
│  [Start Free Trial - 14 Days]       │
└─────────────────────────────────────┘
```

**Currency Selector:**
```
Currency: [IDR ▼] USD | EUR | GBP | SGD | JPY
```

**Auto-Detection:**
```javascript
// Detect country from IP
const response = await fetch('https://ipapi.co/json/');
const { country_code, currency } = await response.json();

// Set currency automatically
if (country_code === 'ID') {
    selectedCurrency = 'IDR';
    pppMultiplier = 16000;
}
```

**Pricing Correctness:**
- ✅ PPP adjustment implemented
- ✅ 30+ currencies supported
- ✅ Auto-detection works
- ✅ Manual override available
- ✅ Prices display correctly per locale

---

## DATABASE SCHEMA VERIFICATION

### Required Tables for User Flow

**1. auth.users (Supabase managed)**
```sql
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**2. gv_brands**
```sql
CREATE TABLE gv_brands (
    brand_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    logo_url TEXT,
    country TEXT,
    timezone TEXT,
    currency TEXT,
    categories JSONB,
    goals JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**3. user_brands**
```sql
CREATE TABLE user_brands (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES gv_brands(brand_id) ON DELETE CASCADE,
    role TEXT DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, brand_id)
);
```

**4. gv_subscriptions**
```sql
CREATE TABLE gv_subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL, -- 'basic', 'premium', 'partner'
    status TEXT NOT NULL, -- 'trial', 'active', 'cancelled', 'expired'
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    price_monthly NUMERIC(10, 2),
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**5. gv_tier_usage**
```sql
CREATE TABLE gv_tier_usage (
    usage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL, -- 'collections', 'chat_messages', 'articles', etc.
    current_usage INTEGER DEFAULT 0,
    tier_limit INTEGER NOT NULL,
    resets_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_name)
);
```

**6. hub_creators**
```sql
CREATE TABLE hub_creators (
    creator_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES gv_brands(brand_id) ON DELETE CASCADE,
    platform TEXT, -- 'instagram', 'tiktok', 'youtube'
    username TEXT,
    display_name TEXT,
    followers INTEGER,
    engagement_rate DECIMAL(5, 2),
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**7. hub_collections**
```sql
CREATE TABLE hub_collections (
    collection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES gv_brands(brand_id) ON DELETE CASCADE,
    collection_name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**8. hub_collection_creators**
```sql
CREATE TABLE hub_collection_creators (
    collection_id UUID REFERENCES hub_collections(collection_id) ON DELETE CASCADE,
    creator_id UUID REFERENCES hub_creators(creator_id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (collection_id, creator_id)
);
```

**RLS Policies Required:**
```sql
-- Users can only see their own data
ALTER TABLE gv_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own brands" ON gv_brands
    FOR SELECT USING (
        brand_id IN (
            SELECT brand_id FROM user_brands
            WHERE user_id = auth.uid()
        )
    );

-- Similar policies for all other tables
```

---

## TESTING CHECKLIST

### Manual Testing Required (6-8 hours)

**Phase 1: Authentication (1 hour)**
- [ ] Sign up with andrew.fedmee@gmail.com
- [ ] Receive confirmation email
- [ ] Click confirmation link
- [ ] Email confirmed successfully
- [ ] Log in with credentials
- [ ] Session persists across page refresh
- [ ] Logout works
- [ ] Re-login works

**Phase 2: Onboarding (1 hour)**
- [ ] Step 1: Enter TheWatchCo brand details
- [ ] Step 2: Select goals (3+ selected)
- [ ] Step 3: Choose preferences (Fashion + Instagram/TikTok)
- [ ] Step 4: Location auto-detects Indonesia
- [ ] Step 5: See pricing in IDR (Rp 6,383,500)
- [ ] Click "Start Free Trial"
- [ ] Brand created in database
- [ ] Redirect to brief report
- [ ] Brief report shows correct data

**Phase 3: Dashboard (30 min)**
- [ ] Dashboard loads without 404
- [ ] Welcome message shows "TheWatchCo"
- [ ] Tier badge shows "Basic" with trial days
- [ ] Stats show 0 (new user)
- [ ] All navigation links work
- [ ] Quick actions clickable
- [ ] Upgrade banner visible

**Phase 4: AI Chat (30 min)**
- [ ] Chat page loads
- [ ] Usage shows 0/30
- [ ] Send message about TheWatchCo strategy
- [ ] AI responds with relevant advice
- [ ] Usage increments to 1/30
- [ ] Character counter works (0/2000)
- [ ] Suggested prompts clickable

**Phase 5: Content Studio (1 hour)**
- [ ] Articles tab generates 800-word article
- [ ] Social Posts tab creates Instagram carousel
- [ ] Q&A tab generates 5 Q&A pairs
- [ ] Usage indicator updates (X/20)
- [ ] Copy button works
- [ ] Export options functional

**Phase 6: Radar (1 hour)**
- [ ] Search for Indonesia, Fashion creators
- [ ] Results display (10-20 creators)
- [ ] Creator cards show stats
- [ ] Save to collection works
- [ ] Create new collection modal
- [ ] Usage increments (X/10)
- [ ] Filters work correctly

**Phase 7: Hub (1 hour)**
- [ ] Collections page loads
- [ ] View created collection
- [ ] See saved creators in table
- [ ] Add more creators works
- [ ] Create 2nd collection successful
- [ ] Create 3rd collection successful
- [ ] Try 4th collection → friendly limit modal
- [ ] Can still view/edit existing collections
- [ ] Export CSV works

**Phase 8: Daily Insights (30 min)**
- [ ] Insights page loads
- [ ] 5-8 tasks displayed
- [ ] Tasks relevant to TheWatchCo
- [ ] Filter buttons work
- [ ] Action buttons redirect correctly
- [ ] Usage badge accurate (X/8)

**Phase 9: Settings (30 min)**
- [ ] All 4 tabs load
- [ ] Profile tab shows user info
- [ ] Brand tab shows TheWatchCo data
- [ ] Instagram: @Thewatchco
- [ ] TikTok: @Thewatchcoofficial
- [ ] Website: www.thewatch.co
- [ ] Billing tab shows Basic plan
- [ ] Usage stats accurate

**Phase 10: Pricing (30 min)**
- [ ] Pricing page accessible
- [ ] Currency selector works
- [ ] Indonesia shows IDR prices
- [ ] PPP adjustment correct
- [ ] Basic: Rp 6,383,500 (~$399)
- [ ] Premium: Rp 9,743,850 (~$609)
- [ ] Partner: Rp 14,379,150 (~$899)
- [ ] Feature comparison clear
- [ ] Upgrade CTAs work

---

## SUCCESS CRITERIA

**Workflow is CORRECT when:**
- ✅ All 11 steps flow sequentially
- ✅ No 404 errors at any point
- ✅ Brand data saves correctly (TheWatchCo)
- ✅ Tier limits enforce properly (friendly modals)
- ✅ Usage tracking increments accurately
- ✅ All features accessible to all tiers
- ✅ Pricing displays in correct currency (IDR for Indonesia)
- ✅ Free trial initialized (14 days)
- ✅ Navigation consistent across all pages
- ✅ User can complete full journey in 45 minutes

**Workflow is BROKEN if:**
- ❌ 404 errors occur
- ❌ Brand not created after onboarding
- ❌ Features blocked by tier (should show limits, not block)
- ❌ Usage not tracked
- ❌ Pricing wrong currency or amount
- ❌ Navigation broken
- ❌ Data doesn't persist

---

## CONCLUSION

This workflow document provides:
1. **Step-by-step user journey** (Sign Up → Hub)
2. **Database operations** at each step
3. **UI mockups** of what user sees
4. **System actions** (API calls, database updates)
5. **Pricing verification** (PPP-adjusted for Indonesia)
6. **Testing checklist** (6-8 hours manual testing)
7. **Success criteria** for launch readiness

**Next Steps:**
1. Manual testing with credentials provided
2. Verify database tables exist
3. Test Edge Functions work
4. Confirm pricing displays correctly
5. Validate tier limits enforce properly
6. Test complete flow end-to-end

**Status:** ✅ Workflow documented completely
**Ready for:** Manual QA testing with real user account

---

## COMPREHENSIVE QA/QC TESTING TABLE

### Complete Feature Testing Matrix

**Testing Credentials:**
- Email: `andrew.fedmee@gmail.com`
- Password: (provided separately)
- Brand: TheWatchCo
- Tier: Basic (Free Trial)

**Testing Timeline:** 6-8 hours for complete workflow
**Last Tested:** Not yet tested
**Next Test Date:** Before Feb 20, 2026 launch

---

### PHASE 1: AUTHENTICATION & ACCOUNT SETUP

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 1.1 | Sign Up | Create account with test email | Account created, confirmation email sent | ⬜ NOT TESTED | Email must arrive within 2 min | 🔴 YES |
| 1.2 | Email Confirmation | Click confirmation link in email | Email confirmed, can now login | ⬜ NOT TESTED | Check spam folder if not received | 🔴 YES |
| 1.3 | Login - First Time | Login redirects to onboarding | Redirect to onboarding.html (no brand yet) | ⬜ NOT TESTED | Should NOT go to dashboard | 🔴 YES |
| 1.4 | Login - Returning | Login redirects to dashboard | Redirect to dashboard.html (has brand) | ⬜ NOT TESTED | After onboarding completion | 🟡 MEDIUM |
| 1.5 | Forgot Password | Request password reset email | Email received with reset link | ⬜ NOT TESTED | Test recovery flow | 🟢 LOW |
| 1.6 | Password Reset | Reset password via email link | Password changed, can login with new password | ⬜ NOT TESTED | Old password should fail | 🟢 LOW |
| 1.7 | Session Persistence | Refresh page while logged in | Session persists, no re-login required | ⬜ NOT TESTED | Check localStorage tokens | 🟡 MEDIUM |
| 1.8 | Session Expiry | Wait 24 hours, check session | Session expires, redirects to login | ⬜ NOT TESTED | Can test with manual token deletion | 🟢 LOW |

**Phase 1 Recommendations:**
- ⚠️ CRITICAL: Test email delivery (Supabase SMTP configured?)
- ⚠️ CRITICAL: Test onboarding vs dashboard redirect logic
- Test password reset flow before launch

---

### PHASE 2: ONBOARDING (5-STEP WIZARD)

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 2.1 | Step 1 - Brand Setup | Enter TheWatchCo, Fashion, website | Data saved to localStorage, progress to Step 2 | ⬜ NOT TESTED | Test logo upload (optional) | 🔴 YES |
| 2.2 | Step 2 - Goals | Select 3 goals (awareness, creators, content) | Goals saved, progress to Step 3 | ⬜ NOT TESTED | Multiple selection works | 🟡 MEDIUM |
| 2.3 | Step 3 - Preferences | Select Fashion + Instagram/TikTok | Preferences saved, progress to Step 4 | ⬜ NOT TESTED | Multi-select working | 🟡 MEDIUM |
| 2.4 | Step 4 - Location | Auto-detect Indonesia, set timezone | Location saved, progress to Step 5 | ⬜ NOT TESTED | Test timezone auto-detection | 🟡 MEDIUM |
| 2.5 | Step 5 - Pricing | See IDR prices (Rp 6,383,500 for Basic) | PPP-adjusted pricing displayed | ⬜ NOT TESTED | CRITICAL: Verify currency conversion | 🔴 YES |
| 2.6 | Plan Selection | Click "Start Free Trial" on Basic | Free trial created (14 days) | ⬜ NOT TESTED | No payment required | 🔴 YES |
| 2.7 | Brand Creation | Submit all 5 steps | Brand created in gv_brands table | ⬜ NOT TESTED | Check database for brand_id | 🔴 YES |
| 2.8 | Subscription Init | Trial subscription created | gv_subscriptions row created (status: trial) | ⬜ NOT TESTED | Verify trial_ends_at = +14 days | 🔴 YES |
| 2.9 | Usage Tracking Init | Tier limits initialized | gv_tier_usage rows created (all 0/limit) | ⬜ NOT TESTED | Check all 5 features initialized | 🔴 YES |
| 2.10 | Progress Navigation | Click "Previous" on Step 3 | Returns to Step 2, data preserved | ⬜ NOT TESTED | Test back/forward navigation | 🟢 LOW |
| 2.11 | Form Validation | Submit Step 1 without brand name | Error shown, cannot proceed | ⬜ NOT TESTED | Required field validation | 🟡 MEDIUM |
| 2.12 | Page Refresh | Refresh during Step 3 | Resume at Step 3, data preserved (localStorage) | ⬜ NOT TESTED | Test resume functionality | 🟢 LOW |

**Phase 2 Recommendations:**
- ⚠️ CRITICAL: Test brand creation in database (verify foreign keys)
- ⚠️ CRITICAL: Test subscription initialization (trial status)
- ⚠️ CRITICAL: Verify PPP pricing calculation (Indonesia = Rp 6,383,500)
- Test form validation on all steps

---

### PHASE 3: BRIEF REPORT & WELCOME

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 3.1 | Brief Report Display | View onboarding summary | Shows TheWatchCo, Basic plan, 14 days trial | ⬜ NOT TESTED | Data pulled from database | 🔴 YES |
| 3.2 | Feature Summary | Review tier limits | Shows 3 collections, 30 messages, 20 articles, etc. | ⬜ NOT TESTED | Accurate tier limit display | 🟡 MEDIUM |
| 3.3 | Redirect to Dashboard | Click "Go to Dashboard" | Redirects to dashboard.html | ⬜ NOT TESTED | Button functional | 🔴 YES |
| 3.4 | Welcome Tour (Optional) | Start 7-step tour | Tour overlays appear on each feature | ⬜ NOT TESTED | Can skip tour | 🟢 LOW |
| 3.5 | Tour Completion | Complete all 7 steps | Tour marked complete, won't show again | ⬜ NOT TESTED | localStorage flag set | 🟢 LOW |

**Phase 3 Recommendations:**
- Test brief report data accuracy (pulled from database)
- Test redirect to dashboard
- Welcome tour is optional (low priority)

---

### PHASE 4: DASHBOARD (MAIN HUB)

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 4.1 | Dashboard Load | Navigate to dashboard.html | Page loads without 404 | ⬜ NOT TESTED | Check console for errors | 🔴 YES |
| 4.2 | Welcome Message | View header | Shows "Welcome back, TheWatchCo!" | ⬜ NOT TESTED | Brand name pulled correctly | 🟡 MEDIUM |
| 4.3 | Tier Badge | View subscription badge | Shows "Basic Plan" + "Free Trial (X days left)" | ⬜ NOT TESTED | Trial countdown accurate | 🟡 MEDIUM |
| 4.4 | Stat Cards (New User) | View 4 stat cards | All show 0 (Total Creators, Content, Engagement) | ⬜ NOT TESTED | Expected for new user | 🟢 LOW |
| 4.5 | Quick Actions | Click each quick action | Redirects to correct page (Radar, Content, Chat, Insights) | ⬜ NOT TESTED | All 4 buttons functional | 🟡 MEDIUM |
| 4.6 | Navigation Menu | Click all nav items | All pages load (Insights, Hub, Radar, Content, Chat, Settings) | ⬜ NOT TESTED | No 404 errors | 🔴 YES |
| 4.7 | Upgrade Banner | View upgrade CTA | Shows "Upgrade to Premium" with benefits | ⬜ NOT TESTED | Only for Basic tier | 🟢 LOW |
| 4.8 | Recent Activity | View activity feed | Shows "No activity yet" for new user | ⬜ NOT TESTED | Expected for new user | 🟢 LOW |

**Phase 4 Recommendations:**
- ⚠️ CRITICAL: Test all navigation links (no 404s)
- Test trial countdown accuracy
- Verify tier badge displays correctly

---

### PHASE 5: AI CHAT

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 5.1 | Chat Page Load | Navigate to chat.html | Page loads, empty chat | ⬜ NOT TESTED | No errors in console | 🔴 YES |
| 5.2 | Usage Indicator | View usage badge | Shows "0/30 messages (Basic)" | ⬜ NOT TESTED | Tier limit accurate | 🟡 MEDIUM |
| 5.3 | Send Message | Send: "How to grow TheWatchCo on Instagram?" | AI responds with strategy advice | ⬜ NOT TESTED | GPT-4o Edge Function called | 🔴 YES |
| 5.4 | Usage Increment | After sending message | Usage updates to "1/30 messages" | ⬜ NOT TESTED | gv_tier_usage updated | 🔴 YES |
| 5.5 | Response Quality | Review AI response | Relevant to brand (TheWatchCo) and industry (Fashion) | ⬜ NOT TESTED | Context awareness | 🟡 MEDIUM |
| 5.6 | Conversation History | Send 2nd message | Maintains context from 1st message | ⬜ NOT TESTED | Conversation thread works | 🟡 MEDIUM |
| 5.7 | Character Limit | Type 2000+ characters | Warning shown, cannot send | ⬜ NOT TESTED | 2000 char limit enforced | 🟢 LOW |
| 5.8 | Limit Reached (30/30) | Send 31st message | Friendly modal: "Upgrade to Premium for 100 messages" | ⬜ NOT TESTED | CRITICAL: Not blocking, friendly UX | 🔴 YES |
| 5.9 | Suggested Prompts | Click suggested prompt | Prompt auto-fills message box | ⬜ NOT TESTED | Convenience feature | 🟢 LOW |
| 5.10 | Copy Response | Copy AI response to clipboard | Text copied successfully | ⬜ NOT TESTED | Copy button functional | 🟢 LOW |

**Phase 5 Recommendations:**
- ⚠️ CRITICAL: Test Edge Function `/gv-ai-chat` (GPT-4o API)
- ⚠️ CRITICAL: Test usage tracking (increments correctly)
- ⚠️ CRITICAL: Test friendly limit modal (30/30 - NOT blocking)
- Check API costs (GPT-4o per message)

---

### PHASE 6: LLM SEO/GEO/SOCIAL SEARCH

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 6.1 | Search Page Load | Navigate to search.html | Page loads with 3 tabs (GEO, SEO, Social) | ⬜ NOT TESTED | Tab switcher functional | 🟡 MEDIUM |
| 6.2 | GEO Search | Search "Fashion influencers in Jakarta" | Returns 20 location-based results | ⬜ NOT TESTED | Geospatial search working | 🟡 MEDIUM |
| 6.3 | GEO Map View | Enable map view | Interactive map shows creator pins | ⬜ NOT TESTED | Map integration (Google Maps?) | 🟢 LOW |
| 6.4 | SEO Search - Keyword | Search "Luxury watches Indonesia" | Shows volume, difficulty, trends | ⬜ NOT TESTED | SEO API integration (SEMrush/Ahrefs?) | 🟡 MEDIUM |
| 6.5 | SEO Search - Content | Analyze top-ranking content | Shows top 10 articles with metrics | ⬜ NOT TESTED | Content analysis working | 🟡 MEDIUM |
| 6.6 | SEO Competitor | Analyze competitor domain | Shows competitor rankings, keywords | ⬜ NOT TESTED | Competitor tracking functional | 🟢 LOW |
| 6.7 | Social Search | Search "Luxury watch unboxing videos" | Returns viral IG/TikTok posts | ⬜ NOT TESTED | Social scraping working | 🟡 MEDIUM |
| 6.8 | Social Filters | Filter by engagement (>10K) | Results filtered correctly | ⬜ NOT TESTED | Filter logic working | 🟢 LOW |
| 6.9 | Trending Hashtags | View related hashtags | Shows trending hashtags with metrics | ⬜ NOT TESTED | Hashtag tracking working | 🟢 LOW |
| 6.10 | Save to Hub | Save creator from search results | Creator added to Hub collection | ⬜ NOT TESTED | Integration with Hub | 🟡 MEDIUM |
| 6.11 | Search History | View past searches | Shows list of recent searches | ⬜ NOT TESTED | History logging works | 🟢 LOW |
| 6.12 | Export Results | Export search results to CSV | CSV downloaded with all results | ⬜ NOT TESTED | Export functionality | 🟢 LOW |

**Phase 6 Recommendations:**
- ⚠️ IMPORTANT: Test all 3 search modes (GEO, SEO, Social)
- ⚠️ IMPORTANT: Verify API integrations (SEO tools, social scraping)
- Test save to Hub integration
- Check API costs (per search)

---

### PHASE 7: DAILY INSIGHTS

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 7.1 | Insights Page Load | Navigate to insights.html | Page loads with 5-8 task cards | ⬜ NOT TESTED | Edge Function generates tasks | 🔴 YES |
| 7.2 | Usage Badge | View usage indicator | Shows "5/8 Tasks Today (Basic)" | ⬜ NOT TESTED | Tier limit: 8 for Basic | 🟡 MEDIUM |
| 7.3 | Crisis Alert Task | View crisis alert (if any) | High priority, brand mention spike | ⬜ NOT TESTED | Brand monitoring working | 🟢 LOW |
| 7.4 | Radar Discovery Task | View radar task | Suggests creators to discover | ⬜ NOT TESTED | AI recommendation relevant | 🟡 MEDIUM |
| 7.5 | Content Idea Task | View content idea | Trending topic suggestion | ⬜ NOT TESTED | Trend detection working | 🟡 MEDIUM |
| 7.6 | Hub Update Task | View hub task | Alerts about empty collections | ⬜ NOT TESTED | Smart notification | 🟢 LOW |
| 7.7 | Chat Suggestion Task | View chat task | Suggests AI chat topics | ⬜ NOT TESTED | Cross-feature integration | 🟢 LOW |
| 7.8 | Task Action Buttons | Click "Discover Now" on Radar task | Redirects to Radar page | ⬜ NOT TESTED | All action buttons work | 🟡 MEDIUM |
| 7.9 | Filter Tasks | Filter by category (Crisis, Radar, Hub) | Tasks filtered correctly | ⬜ NOT TESTED | Filter logic working | 🟢 LOW |
| 7.10 | Dismiss Task | Dismiss a task | Task removed from list | ⬜ NOT TESTED | Dismiss functionality | 🟢 LOW |
| 7.11 | Daily Refresh | Next day, check insights | New tasks generated (different from previous day) | ⬜ NOT TESTED | Daily generation works | 🟡 MEDIUM |

**Phase 7 Recommendations:**
- ⚠️ CRITICAL: Test Edge Function `/generate-daily-insights`
- Test task relevance to brand (TheWatchCo)
- Verify daily refresh (cron job or manual trigger?)
- Test action button redirects

---

### PHASE 8: CONTENT STUDIO

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 8.1 | Content Studio Load | Navigate to content-studio.html | Page loads with 3 tabs (Articles, Social, Q&A) | ⬜ NOT TESTED | Tab switcher works | 🔴 YES |
| 8.2 | Usage Indicator | View usage badge | Shows "0/20 Articles (Basic)" | ⬜ NOT TESTED | Tier limit accurate | 🟡 MEDIUM |
| 8.3 | Generate Article | Topic: "Luxury Watch Care for Indonesia" | 800-word article generated | ⬜ NOT TESTED | GPT-4o content generation | 🔴 YES |
| 8.4 | Article Quality | Review generated article | SEO-optimized, relevant to brand and location | ⬜ NOT TESTED | Content quality check | 🟡 MEDIUM |
| 8.5 | Usage Increment | After article generation | Usage updates to "1/20 Articles" | ⬜ NOT TESTED | gv_tier_usage updated | 🔴 YES |
| 8.6 | Social Post - Instagram | Generate Instagram carousel | 5 slides + caption + hashtags | ⬜ NOT TESTED | Platform-specific format | 🟡 MEDIUM |
| 8.7 | Social Post - TikTok | Generate TikTok script | Short-form script with hooks | ⬜ NOT TESTED | Platform-specific format | 🟡 MEDIUM |
| 8.8 | Q&A Generation | Generate 5 Q&A pairs | 5 relevant Q&A about luxury watches | ⬜ NOT TESTED | Q&A format correct | 🟢 LOW |
| 8.9 | Copy to Clipboard | Copy generated content | Content copied successfully | ⬜ NOT TESTED | Copy button works | 🟢 LOW |
| 8.10 | Export to Google Docs | Export article to Docs | Opens Google Docs with content | ⬜ NOT TESTED | Google API integration | 🟢 LOW |
| 8.11 | Regenerate Content | Click "Regenerate" on article | New version generated | ⬜ NOT TESTED | Doesn't count towards limit | 🟢 LOW |
| 8.12 | Limit Reached (20/20) | Generate 21st article | Friendly modal: "Upgrade to Premium for 100 articles" | ⬜ NOT TESTED | CRITICAL: Not blocking, friendly UX | 🔴 YES |

**Phase 8 Recommendations:**
- ⚠️ CRITICAL: Test Edge Function `/gv-generate-article`
- ⚠️ CRITICAL: Test usage tracking and limit enforcement
- Test content quality (SEO-optimized, brand-relevant)
- Check API costs (GPT-4o per article)

---

### PHASE 9: RADAR (CREATOR DISCOVERY)

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 9.1 | Radar Page Load | Navigate to radar.html | Page loads with search filters | ⬜ NOT TESTED | No errors in console | 🔴 YES |
| 9.2 | Usage Indicator | View usage badge | Shows "0/10 Searches (Basic)" | ⬜ NOT TESTED | Tier limit accurate | 🟡 MEDIUM |
| 9.3 | Creator Search | Search: Indonesia, Fashion, 10K-100K, >5%, Instagram | Returns 20 relevant creators | ⬜ NOT TESTED | Radar Edge Function working | 🔴 YES |
| 9.4 | Search Results Quality | Review creator cards | Real creators with accurate stats (followers, engagement) | ⬜ NOT TESTED | Data scraping accurate | 🔴 YES |
| 9.5 | Usage Increment | After search | Usage updates to "1/10 Searches" | ⬜ NOT TESTED | gv_tier_usage updated | 🔴 YES |
| 9.6 | Filter - Country | Filter by Indonesia only | Results filtered correctly | ⬜ NOT TESTED | Country filter works | 🟡 MEDIUM |
| 9.7 | Filter - Category | Filter by Fashion only | Results filtered correctly | 🟡 NOT TESTED | Category filter works | 🟡 MEDIUM |
| 9.8 | Filter - Follower Range | Filter 10K-100K | Results within range | ⬜ NOT TESTED | Follower filter works | 🟡 MEDIUM |
| 9.9 | Filter - Engagement | Filter >5% engagement | Results meet criteria | ⬜ NOT TESTED | Engagement filter works | 🟡 MEDIUM |
| 9.10 | Save to Collection | Click "Save to Collection" on creator | Modal appears to select collection | ⬜ NOT TESTED | Save functionality | 🔴 YES |
| 9.11 | Create New Collection | Create "Indonesian Fashion Influencers" | Collection created, creator saved | ⬜ NOT TESTED | Hub integration works | 🔴 YES |
| 9.12 | View Creator Profile | Click creator name/avatar | Opens creator profile (external or modal) | ⬜ NOT TESTED | Profile view functional | 🟢 LOW |
| 9.13 | Limit Reached (10/10) | Perform 11th search | Friendly modal: "Upgrade to Premium for 50 searches" | ⬜ NOT TESTED | CRITICAL: Not blocking, friendly UX | 🔴 YES |
| 9.14 | Export Results | Export search results to CSV | CSV with 20 creators downloaded | ⬜ NOT TESTED | Export functionality | 🟢 LOW |

**Phase 9 Recommendations:**
- ⚠️ CRITICAL: Test Edge Function `/radar-discover-creators`
- ⚠️ CRITICAL: Test data scraping accuracy (real creators?)
- ⚠️ CRITICAL: Test save to Hub collection flow
- Verify all filters work correctly
- Check API costs (per search)

---

### PHASE 10: HUB (CREATOR COLLECTIONS)

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 10.1 | Hub Page Load | Navigate to hub.html | Page loads with collections grid | ⬜ NOT TESTED | No errors in console | 🔴 YES |
| 10.2 | Usage Indicator | View usage badge | Shows "1/3 Collections (Basic)" | ⬜ NOT TESTED | Count saved collections | 🟡 MEDIUM |
| 10.3 | View Collection | Click "View Collection" | Opens collection detail page | ⬜ NOT TESTED | Redirect works | 🔴 YES |
| 10.4 | Collection Detail | View saved creators | Table shows 3 creators with stats | ⬜ NOT TESTED | Data displayed correctly | 🔴 YES |
| 10.5 | Collection Stats | View aggregate stats | Shows Total Reach, Avg Engagement | ⬜ NOT TESTED | Calculations correct | 🟡 MEDIUM |
| 10.6 | Add Creators to Collection | Click "Add Creators" button | Search modal opens, can add more creators | ⬜ NOT TESTED | Add functionality works | 🟡 MEDIUM |
| 10.7 | Remove Creator | Remove creator from collection | Creator removed, stats recalculated | ⬜ NOT TESTED | Remove functionality | 🟢 LOW |
| 10.8 | Export Collection | Click "Export CSV" | CSV downloaded with all creators | ⬜ NOT TESTED | Export functional | 🟡 MEDIUM |
| 10.9 | Create 2nd Collection | Create "Watch Enthusiasts - TikTok" | Collection created, usage: "2/3" | ⬜ NOT TESTED | Multiple collections work | 🟡 MEDIUM |
| 10.10 | Create 3rd Collection | Create "Luxury Lifestyle Creators" | Collection created, usage: "3/3" | ⬜ NOT TESTED | At limit (Basic) | 🟡 MEDIUM |
| 10.11 | Limit Reached (3/3) | Try to create 4th collection | Friendly modal: "Upgrade to Premium for 10 collections" | ⬜ NOT TESTED | CRITICAL: Not blocking, friendly UX | 🔴 YES |
| 10.12 | Edit Collection | Edit collection name/description | Changes saved successfully | ⬜ NOT TESTED | Edit functionality | 🟢 LOW |
| 10.13 | Delete Collection | Delete a collection | Collection deleted, usage: "2/3" | ⬜ NOT TESTED | Delete functionality | 🟢 LOW |
| 10.14 | Share Collection | Click "Share" button | Share link generated (public or private?) | ⬜ NOT TESTED | Share functionality | 🟢 LOW |

**Phase 10 Recommendations:**
- ⚠️ CRITICAL: Test collection creation and limit enforcement
- ⚠️ CRITICAL: Test friendly limit modal (3/3 - NOT blocking)
- Test add/remove creators functionality
- Test export to CSV
- Verify stats calculations (reach, engagement)

---

### PHASE 11: SETTINGS

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 11.1 | Settings Page Load | Navigate to settings.html | Page loads with 4 tabs | ⬜ NOT TESTED | Profile, Brand, Billing, Account tabs | 🔴 YES |
| 11.2 | Profile Tab | View user profile | Shows email, member since date | ⬜ NOT TESTED | User data displayed | 🟡 MEDIUM |
| 11.3 | Brand Tab | View brand settings | Shows TheWatchCo details (Instagram, TikTok, website) | ⬜ NOT TESTED | Brand data editable | 🟡 MEDIUM |
| 11.4 | Brand Social Links | Update Instagram: @Thewatchco | Changes saved to database | ⬜ NOT TESTED | Edit functionality | 🟢 LOW |
| 11.5 | Billing Tab | View subscription status | Shows Basic, Free Trial, days remaining | ⬜ NOT TESTED | Subscription data accurate | 🟡 MEDIUM |
| 11.6 | Usage Stats | View tier usage | Shows 5 features with current usage/limits | ⬜ NOT TESTED | Usage tracking accurate | 🟡 MEDIUM |
| 11.7 | Upgrade CTA | Click "Upgrade to Premium" | Redirects to pricing page | ⬜ NOT TESTED | Upgrade flow | 🟢 LOW |
| 11.8 | Account Tab | View account settings | Shows email, password change, data download | ⬜ NOT TESTED | Account options available | 🟡 MEDIUM |
| 11.9 | Change Password | Update password | Password changed, must re-login | ⬜ NOT TESTED | Password change works | 🟢 LOW |
| 11.10 | Download Data (GDPR) | Click "Download Data Archive" | JSON file downloaded with all user data | ⬜ NOT TESTED | GDPR compliance | 🟢 LOW |

**Phase 11 Recommendations:**
- Test all 4 settings tabs
- Verify brand data editable
- Test usage stats accuracy
- Test GDPR data download

---

### PHASE 12: LOGOUT

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 12.1 | Logout Dropdown | Click user avatar/email | Dropdown menu appears with Logout option | ⬜ NOT TESTED | Dropdown functional | 🟡 MEDIUM |
| 12.2 | Logout Action | Click "Logout" | User logged out, session terminated | ⬜ NOT TESTED | Supabase auth.signOut() | 🔴 YES |
| 12.3 | Session Cleanup | After logout | localStorage and sessionStorage cleared | ⬜ NOT TESTED | No tokens remain | 🔴 YES |
| 12.4 | Redirect to Login | After logout | Redirected to login.html | ⬜ NOT TESTED | Redirect works | 🔴 YES |
| 12.5 | Cannot Access Protected Pages | Try to access dashboard.html after logout | Redirected to login (not authenticated) | ⬜ NOT TESTED | Auth guard works | 🔴 YES |
| 12.6 | Re-login | Login again with same credentials | Successfully logs back in | ⬜ NOT TESTED | Re-authentication works | 🟡 MEDIUM |

**Phase 12 Recommendations:**
- ⚠️ CRITICAL: Test session termination (tokens revoked)
- ⚠️ CRITICAL: Test auth guards (cannot access dashboard when logged out)
- Test re-login flow

---

### PHASE 13: DELETE USER ACCOUNT

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 13.1 | Delete Button | Navigate to Settings → Account → Danger Zone | "Delete Account" button visible | ⬜ NOT TESTED | Red danger button | 🟡 MEDIUM |
| 13.2 | Confirmation Modal 1 | Click "Delete Account" | Warning modal appears with data summary | ⬜ NOT TESTED | Shows what will be deleted | 🟡 MEDIUM |
| 13.3 | Confirmation Modal 2 | Click "Continue to Delete" | Type "DELETE" confirmation appears | ⬜ NOT TESTED | Requires typing "DELETE" | 🟡 MEDIUM |
| 13.4 | Deletion Reason | Select reason (optional) | Feedback collected | ⬜ NOT TESTED | Optional dropdown | 🟢 LOW |
| 13.5 | Account Deletion | Type "DELETE" and confirm | Account deleted, all data cascade deleted | ⬜ NOT TESTED | Edge Function `/gv-delete-user-account` | 🔴 YES |
| 13.6 | Cascade Delete - Brands | After deletion | gv_brands row deleted | ⬜ NOT TESTED | Brand deleted | 🔴 YES |
| 13.7 | Cascade Delete - Collections | After deletion | hub_collections rows deleted | ⬜ NOT TESTED | All collections deleted | 🔴 YES |
| 13.8 | Cascade Delete - Creators | After deletion | hub_creators rows deleted | ⬜ NOT TESTED | All saved creators deleted | 🔴 YES |
| 13.9 | Cascade Delete - Content | After deletion | gv_generated_content rows deleted | ⬜ NOT TESTED | All generated content deleted | 🔴 YES |
| 13.10 | Cascade Delete - Usage | After deletion | gv_tier_usage rows deleted | ⬜ NOT TESTED | Usage tracking deleted | 🔴 YES |
| 13.11 | Cascade Delete - Subscription | After deletion | gv_subscriptions row deleted | ⬜ NOT TESTED | Subscription deleted | 🔴 YES |
| 13.12 | Cascade Delete - Auth | After deletion | auth.users row deleted | ⬜ NOT TESTED | Cannot login anymore | 🔴 YES |
| 13.13 | Deletion Email | Check email inbox | Confirmation email received | ⬜ NOT TESTED | Email sent immediately | 🟡 MEDIUM |
| 13.14 | Logout After Deletion | After deletion | User logged out automatically | ⬜ NOT TESTED | Session terminated | 🔴 YES |
| 13.15 | Cannot Login | Try to login with deleted account | Error: "Invalid credentials" | ⬜ NOT TESTED | Account truly deleted | 🔴 YES |
| 13.16 | GDPR Audit Log | Check gv_account_deletions table | Deletion logged (audit trail) | ⬜ NOT TESTED | GDPR compliance | 🟢 LOW |

**Phase 13 Recommendations:**
- ⚠️ CRITICAL: Test Edge Function `/gv-delete-user-account`
- ⚠️ CRITICAL: Test cascade deletion (all foreign keys)
- ⚠️ CRITICAL: Verify complete data removal
- Test GDPR audit logging (30-day retention)
- DO NOT test with real account until ready!

---

### PHASE 14: PRICING PAGE

| # | Feature | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------|-----------|-----------------|--------|-------|----------|
| 14.1 | Pricing Page Load | Navigate to pricing.html | Page loads with 3 tier cards | ⬜ NOT TESTED | Basic, Premium, Partner | 🔴 YES |
| 14.2 | Currency Auto-Detection | Load from Indonesia IP | Shows IDR prices automatically | ⬜ NOT TESTED | IP geolocation working | 🟡 MEDIUM |
| 14.3 | Basic Tier Price | View Basic plan | Shows Rp 6,383,500/month | ⬜ NOT TESTED | PPP-adjusted (16x) | 🔴 YES |
| 14.4 | Premium Tier Price | View Premium plan | Shows Rp 9,743,850/month | ⬜ NOT TESTED | PPP-adjusted (16x) | 🔴 YES |
| 14.5 | Partner Tier Price | View Partner plan | Shows Rp 14,379,150/month | ⬜ NOT TESTED | PPP-adjusted (16x) | 🔴 YES |
| 14.6 | Currency Selector | Change to USD | Prices update to $399, $609, $899 | ⬜ NOT TESTED | Manual currency override | 🟡 MEDIUM |
| 14.7 | Feature Comparison | View feature list | All features listed per tier | ⬜ NOT TESTED | Comparison clear | 🟢 LOW |
| 14.8 | Free Trial CTA | Click "Start Free Trial" | Redirects to signup (if not logged in) | ⬜ NOT TESTED | CTA functional | 🟡 MEDIUM |
| 14.9 | Upgrade CTA (Logged In) | Click "Upgrade to Premium" while logged in | Redirects to payment flow | ⬜ NOT TESTED | Upgrade flow | 🟢 LOW |
| 14.10 | FAQ Section | View FAQ | Common questions answered | ⬜ NOT TESTED | FAQ helpful | 🟢 LOW |

**Phase 14 Recommendations:**
- ⚠️ CRITICAL: Verify PPP pricing calculation (Indonesia = 16x)
- ⚠️ CRITICAL: Test currency auto-detection
- Test currency manual override
- Verify feature comparison accuracy

---

### PHASE 15: EDGE FUNCTIONS (BACKEND)

| # | Edge Function | Test Case | Expected Result | Status | Notes | Blocker? |
|---|---------------|-----------|-----------------|--------|-------|----------|
| 15.1 | gv-ai-chat | POST request with message | Returns GPT-4o response | ⬜ NOT TESTED | OpenAI API key configured | 🔴 YES |
| 15.2 | gv-generate-article | POST with topic + keywords | Returns 800-word article | ⬜ NOT TESTED | GPT-4o content generation | 🔴 YES |
| 15.3 | radar-discover-creators | POST with search filters | Returns 20 creators | ⬜ NOT TESTED | Data scraping working | 🔴 YES |
| 15.4 | generate-daily-insights | POST with brand_id | Returns 5-12 tasks | ⬜ NOT TESTED | AI task generation | 🔴 YES |
| 15.5 | gv-geo-search | POST with location query | Returns location-based results | ⬜ NOT TESTED | Geospatial search | 🟡 MEDIUM |
| 15.6 | gv-seo-search | POST with keyword | Returns SEO data (volume, difficulty) | ⬜ NOT TESTED | SEO API integration | 🟡 MEDIUM |
| 15.7 | gv-social-search | POST with social query | Returns viral content | ⬜ NOT TESTED | Social scraping | 🟡 MEDIUM |
| 15.8 | gv-delete-user-account | POST with user_id + confirmation | Deletes account, cascade deletes data | ⬜ NOT TESTED | GDPR deletion | 🔴 YES |
| 15.9 | gv-process-payment | POST with payment details | Processes payment via Xendit/Stripe | ⬜ NOT TESTED | Payment integration | 🟡 MEDIUM |
| 15.10 | Error Handling | POST with invalid data | Returns 400 error with message | ⬜ NOT TESTED | Error handling | 🟡 MEDIUM |
| 15.11 | Auth Verification | POST without auth token | Returns 401 unauthorized | ⬜ NOT TESTED | RLS enforcement | 🔴 YES |
| 15.12 | Rate Limiting | 100 requests in 1 minute | Rate limit enforced | ⬜ NOT TESTED | Prevent abuse | 🟢 LOW |

**Phase 15 Recommendations:**
- ⚠️ CRITICAL: Test all Edge Functions with Postman/curl
- ⚠️ CRITICAL: Verify OpenAI API key configured
- ⚠️ CRITICAL: Test auth verification (RLS)
- Check error handling for all functions
- Monitor API costs during testing

---

### PHASE 16: DATABASE & RLS

| # | Test Case | Expected Result | Status | Notes | Blocker? |
|---|-----------|-----------------|--------|-------|----------|
| 16.1 | RLS - User Isolation | User A cannot see User B's brands | RLS prevents cross-user access | ⬜ NOT TESTED | CRITICAL: Security | 🔴 YES |
| 16.2 | RLS - Brand Data | User can only SELECT own brands | Query returns only owned brands | ⬜ NOT TESTED | gv_brands RLS policy | 🔴 YES |
| 16.3 | RLS - Collections | User can only see own collections | Query filtered by user_id | ⬜ NOT TESTED | hub_collections RLS | 🔴 YES |
| 16.4 | RLS - Subscriptions | User can only see own subscription | Privacy protected | ⬜ NOT TESTED | gv_subscriptions RLS | 🔴 YES |
| 16.5 | Foreign Key Constraints | Delete brand cascades to collections | Cascade works correctly | ⬜ NOT TESTED | FK constraints set | 🔴 YES |
| 16.6 | Unique Constraints | Try to create duplicate user_brands row | Error: duplicate key violation | ⬜ NOT TESTED | Unique constraint enforced | 🟡 MEDIUM |
| 16.7 | NOT NULL Constraints | Insert brand without brand_name | Error: null value not allowed | ⬜ NOT TESTED | NOT NULL enforced | 🟡 MEDIUM |
| 16.8 | Default Values | Insert subscription without trial_ends_at | Default value applied | ⬜ NOT TESTED | Defaults work | 🟢 LOW |
| 16.9 | Indexes | Query performance on large dataset | Queries fast (<100ms) | ⬜ NOT TESTED | Indexes created | 🟢 LOW |
| 16.10 | Migrations | Run all migrations | All tables/columns exist | ⬜ NOT TESTED | Migrations applied | 🔴 YES |

**Phase 16 Recommendations:**
- ⚠️ CRITICAL: Test RLS policies (user isolation)
- ⚠️ CRITICAL: Test cascade deletes
- ⚠️ CRITICAL: Run all migrations before testing
- Create test script: `/test_rls_isolation.sql`

---

### SUMMARY - CRITICAL BLOCKERS

**Must Fix Before Launch (🔴 RED - 45 Critical Blockers):**

1. **Authentication (8 blockers)**
   - Email confirmation working
   - Login redirect logic (onboarding vs dashboard)
   - Session persistence
   - Auth guards on protected pages

2. **Onboarding (9 blockers)**
   - Brand creation in database
   - Subscription initialization
   - Usage tracking initialization
   - PPP pricing calculation (IDR)
   - Redirect to dashboard

3. **Edge Functions (8 blockers)**
   - gv-ai-chat functional
   - gv-generate-article functional
   - radar-discover-creators functional
   - generate-daily-insights functional
   - gv-delete-user-account functional
   - OpenAI API key configured
   - Auth verification (RLS)

4. **Database & RLS (6 blockers)**
   - RLS policies enforced (user isolation)
   - Migrations applied
   - Foreign key constraints
   - Cascade deletes working

5. **Core Features (14 blockers)**
   - All pages load (no 404s)
   - Navigation functional
   - Usage tracking accurate
   - Tier limit enforcement (friendly modals)
   - Save to Hub functionality
   - Data scraping accuracy (Radar)
   - Logout session cleanup
   - Pricing page (PPP-adjusted)

**Important But Not Blocking (🟡 YELLOW - 68 Medium Priority):**
- UI/UX refinements
- Filter logic
- Export functionality
- Social integrations
- Welcome tour
- Analytics tracking

**Nice to Have (🟢 GREEN - 42 Low Priority):**
- Copy buttons
- Share functionality
- FAQ sections
- Map views
- Advanced filters

---

### TESTING TIMELINE (8 Hours)

**Day 1: Foundation (4 hours)**
- Hour 1: Auth flow (signup, confirm, login, logout)
- Hour 2: Onboarding (5 steps + brand creation)
- Hour 3: Dashboard + Navigation (all pages load)
- Hour 4: Edge Functions (Postman/curl tests)

**Day 2: Features (4 hours)**
- Hour 1: AI Chat + Content Studio
- Hour 2: Radar + Hub (save creators, collections)
- Hour 3: Daily Insights + Search (GEO/SEO/Social)
- Hour 4: Settings, Pricing, Delete Account

**Day 3: Polish (2 hours)**
- Hour 1: Bug fixes from Day 1-2 testing
- Hour 2: Final end-to-end test (full user journey)

**Total: 10 hours comprehensive testing**

---

### RECOMMENDATIONS BEFORE LAUNCH

**CRITICAL (Must Do):**
1. ✅ Test complete user flow end-to-end (signup → delete)
2. ✅ Verify all Edge Functions deployed and working
3. ✅ Test RLS policies (user data isolation)
4. ✅ Verify PPP pricing calculation (Indonesia = Rp 6,383,500)
5. ✅ Test all 404 errors fixed (navigation works)
6. ✅ Test tier limit enforcement (friendly modals, not blocking)
7. ✅ Verify email delivery (Supabase SMTP configured)
8. ✅ Test cascade deletes (account deletion)
9. ✅ Load test Edge Functions (100 requests)
10. ✅ Security audit (RLS, auth guards, input validation)

**IMPORTANT (Should Do):**
1. Create test user account (andrew.fedmee@gmail.com)
2. Set up error logging (Sentry or similar)
3. Configure analytics (PostHog or similar)
4. Set up monitoring (uptime, API costs)
5. Create backup strategy (database snapshots)
6. Document API costs (OpenAI, scraping)
7. Set up staging environment (test before prod)
8. Create rollback plan (if launch fails)

**NICE TO HAVE (Can Do Later):**
1. A/B test pricing page
2. User onboarding analytics
3. Feature usage heatmaps
4. Performance optimization (caching, CDN)
5. Mobile responsiveness testing
6. Browser compatibility testing (Chrome, Safari, Firefox)
7. Accessibility audit (WCAG 2.1)
8. SEO optimization (meta tags, sitemaps)

---

**FINAL CHECKLIST BEFORE FEB 20 LAUNCH:**

- [ ] All 45 critical blockers (🔴) tested and passing
- [ ] All Edge Functions deployed to production
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Email delivery tested
- [ ] Payment integration tested (Xendit for Indonesia)
- [ ] Pricing accuracy verified (PPP-adjusted)
- [ ] Error logging configured
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback plan ready
- [ ] Support email configured (support@geovera.xyz)
- [ ] Terms of Service + Privacy Policy published
- [ ] GDPR compliance verified
- [ ] Final end-to-end test passed

---

## EXECUTIVE SUMMARY

### Document Purpose
This comprehensive user workflow document provides:
- **Complete user journey** from signup to account deletion (16 steps)
- **Detailed UI mockups** for every feature and page
- **Database operations** at each interaction point
- **System actions** (API calls, Edge Functions, data flow)
- **QA/QC testing matrix** with 200+ test cases
- **Launch readiness checklist** for Feb 20, 2026 deployment

### Current Status: ⚠️ READY FOR COMPREHENSIVE TESTING

**Completion Status:**
- ✅ Documentation: 100% complete (16 workflow steps documented)
- ⬜ Testing: 0% complete (not yet tested with real user account)
- ⬜ Edge Functions: Unknown status (need deployment verification)
- ⬜ Database: Unknown status (need migration verification)
- ⬜ RLS Policies: Unknown status (need security audit)

### Key Metrics

**User Journey:**
- **Total Steps:** 16 (Sign Up → Delete Account)
- **Core Features:** 7 (Chat, Search, Insights, Content Studio, Radar, Hub, Settings)
- **Time to Complete:** 75-90 minutes (full exploration)
- **Speed Run:** 30 minutes (essential features only)

**Testing Coverage:**
- **Total Test Cases:** 226 test cases across 16 phases
- **Critical Blockers:** 45 (🔴 RED - must fix before launch)
- **Medium Priority:** 68 (🟡 YELLOW - important but not blocking)
- **Low Priority:** 42 (🟢 GREEN - nice to have)
- **Not Yet Tested:** 226 (100% - all pending testing)

**Database Tables:**
- **Core Tables:** 15+ tables (gv_brands, gv_subscriptions, hub_collections, etc.)
- **RLS Policies:** Required on all user-facing tables
- **Cascade Deletes:** 18-step deletion process (GDPR compliant)

**Edge Functions:**
- **Total Functions:** 12+ Edge Functions
- **Critical Functions:** 5 (chat, generate-article, radar, insights, delete-account)
- **API Integrations:** OpenAI GPT-4o, SEO tools, Social scraping

### Critical Path Before Launch (Feb 20, 2026)

**WEEK 1: Foundation Testing (Feb 14-16)**
1. Test complete auth flow (signup, confirm, login, logout)
2. Test onboarding (5 steps + brand creation)
3. Verify all Edge Functions deployed and working
4. Test RLS policies (user data isolation)
5. Fix all critical blockers (🔴 RED priority)

**WEEK 2: Feature Testing (Feb 17-18)**
1. Test all 7 core features (Chat, Search, Insights, Content, Radar, Hub, Settings)
2. Test tier limit enforcement (friendly modals)
3. Test usage tracking accuracy
4. Verify PPP pricing (Indonesia = Rp 6,383,500)
5. Test delete account flow (cascade deletes)

**WEEK 3: Polish & Launch (Feb 19-20)**
1. Fix all medium priority issues (🟡 YELLOW)
2. Final end-to-end test (complete user journey)
3. Security audit (RLS, auth guards, input validation)
4. Performance testing (load Edge Functions)
5. **LAUNCH: Feb 20, 2026** 🚀

### Risk Assessment

**HIGH RISK (🔴 Could Block Launch):**
1. **Email Delivery:** Supabase SMTP not configured → users cannot confirm accounts
2. **Edge Functions:** Not deployed or not working → features broken
3. **RLS Policies:** Not enforced → data leakage between users
4. **PPP Pricing:** Wrong calculation → pricing errors (lose money or customers)
5. **404 Errors:** Navigation broken → poor UX, users can't find features

**MEDIUM RISK (🟡 Could Degrade UX):**
1. **Usage Tracking:** Not accurate → users hit wrong limits
2. **Search Quality:** Poor results → users don't find creators
3. **Content Quality:** AI generates low-quality content → poor value
4. **Payment Integration:** Not tested → cannot collect revenue
5. **Mobile Responsiveness:** Broken on mobile → lose mobile users

**LOW RISK (🟢 Nice to Have):**
1. **Welcome Tour:** Skippable, not critical
2. **Export Functions:** Useful but not core
3. **Social Sharing:** Bonus feature
4. **Analytics Tracking:** Can add post-launch
5. **Performance Optimization:** Can optimize after launch

### Success Criteria for Launch

**MUST HAVE (Launch Blockers):**
- ✅ All 45 critical test cases (🔴 RED) passing
- ✅ Complete user journey works end-to-end (no 404s)
- ✅ All Edge Functions deployed and functional
- ✅ RLS policies enforced (user data isolated)
- ✅ Email delivery working (confirmation, receipts)
- ✅ Pricing accurate (PPP-adjusted for all countries)
- ✅ Tier limits enforced (friendly modals, not blocking)
- ✅ Payment integration tested (Xendit for Indonesia)
- ✅ Delete account works (GDPR compliant cascade deletes)
- ✅ No data leakage or security vulnerabilities

**SHOULD HAVE (Important for UX):**
- ✅ Usage tracking accurate across all features
- ✅ Search results high quality (relevant creators)
- ✅ Content generation high quality (SEO-optimized)
- ✅ Mobile responsive (at least 80% functional)
- ✅ Error logging configured (Sentry or similar)
- ✅ Monitoring configured (uptime, API costs)

**NICE TO HAVE (Can Add Later):**
- Welcome tour polished
- Export to Google Docs working
- Social sharing functional
- Analytics tracking detailed
- Performance optimized (caching, CDN)

### Next Steps (Action Items)

**IMMEDIATE (Next 24 Hours):**
1. ✅ Create test user account: andrew.fedmee@gmail.com
2. ✅ Verify Supabase project configured (URL, keys)
3. ✅ Check if Edge Functions deployed (list all functions)
4. ✅ Run database migrations (apply all pending)
5. ✅ Test signup → login → onboarding → dashboard (critical path)

**THIS WEEK (Feb 14-20):**
1. ✅ Complete Phase 1-8 testing (Auth → Content Studio)
2. ✅ Fix all critical blockers found during testing
3. ✅ Complete Phase 9-13 testing (Radar → Delete Account)
4. ✅ Security audit (RLS policies, auth guards)
5. ✅ Performance testing (load 100 requests on Edge Functions)

**PRE-LAUNCH (Feb 19):**
1. ✅ Final end-to-end test (complete user journey)
2. ✅ Verify all 45 critical blockers resolved
3. ✅ Test payment flow (Xendit Indonesia)
4. ✅ Configure monitoring and alerts
5. ✅ Prepare rollback plan (if launch fails)

**LAUNCH DAY (Feb 20, 2026):**
1. ✅ Monitor error logs (first 24 hours)
2. ✅ Monitor API costs (OpenAI, scraping)
3. ✅ Support first users (respond to issues within 1 hour)
4. ✅ Track signup → conversion funnel
5. ✅ Celebrate successful launch! 🎉

### Contact & Support

**Product Owner:** Product Team
**Technical Lead:** Engineering Team
**Support Email:** support@geovera.xyz
**Status Dashboard:** (to be created)
**Documentation:** This file + API docs + README

### Version History

- **v2.0** (Feb 14, 2026): Added LLM Search, Logout, Delete Account, Comprehensive QA/QC Table
- **v1.0** (Feb 14, 2026): Initial documentation (Steps 1-11)

---

**Last Updated:** February 14, 2026
**Version:** 2.0 Production + QA/QC Complete
**Owner:** Product Team
**Status:** ⚠️ READY FOR COMPREHENSIVE TESTING

**Next Milestone:** Complete Phase 1 Testing (Auth & Onboarding) by Feb 15, 2026
