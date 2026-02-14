# GEOVERA API DOCUMENTATION
## Edge Functions Reference

**Version:** 1.0
**Last Updated:** February 14, 2026
**Base URL:** `https://your-project.supabase.co/functions/v1`

---

## TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Rate Limits](#rate-limits)
3. [Error Codes](#error-codes)
4. [Core APIs](#core-apis)
5. [Content Studio APIs](#content-studio-apis)
6. [Authority Hub APIs](#authority-hub-apis)
7. [Radar APIs](#radar-apis-partner-tier-only)
8. [Content Training APIs](#content-training-apis)

---

## AUTHENTICATION

All API endpoints require authentication via JWT token in the Authorization header.

### Request Format

```http
POST /functions/v1/endpoint-name
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "param": "value"
}
```

### Getting JWT Token

```javascript
// Frontend example (using @supabase/supabase-js)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign in
const { data: { user, session } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

const jwt_token = session.access_token
```

### Token Validation

Each function validates the JWT token and checks:
1. Token is valid and not expired
2. User exists in the system
3. User has access to the requested resource (brand ownership)
4. Subscription tier allows access to the feature

---

## RATE LIMITS

### Per-Tier Limits

| Tier | Content Studio | Hub Articles | Radar Access | AI Chat |
|------|----------------|--------------|--------------|---------|
| **Basic** | 1 article/day | 30/month | Not allowed | 30 QA/day |
| **Premium** | 2 articles/day | 60/month | Not allowed | 40 QA/day |
| **Partner** | 3 articles/day | 90/month | Full access | 50 QA/day |

### Rate Limit Headers

All responses include rate limit information:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1708358400
```

### Rate Limit Error Response

```json
{
  "error": "Rate limit exceeded",
  "message": "You have reached your daily quota of 1 article per day (Basic tier)",
  "quota": {
    "limit": 1,
    "used": 1,
    "resets_at": "2026-02-15T00:00:00Z"
  },
  "upgrade_url": "https://geovera.xyz/pricing"
}
```

---

## ERROR CODES

### Standard HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions or tier access |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |
| 503 | Service Unavailable | Temporary service interruption |

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "code": "ERROR_CODE",
  "timestamp": "2026-02-14T10:30:00Z"
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| `AUTH_REQUIRED` | Authorization header missing |
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `BRAND_NOT_FOUND` | Brand ID not found or no access |
| `TIER_INSUFFICIENT` | Feature requires higher subscription tier |
| `QUOTA_EXCEEDED` | Daily/monthly quota exceeded |
| `API_KEY_MISSING` | Required API key not configured |
| `VALIDATION_FAILED` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |

---

## CORE APIs

### 1. Onboarding: Create Brand

**Endpoint:** `POST /onboard-brand-v4`

**Description:** 5-step onboarding wizard to create a new brand profile.

**Authentication:** Required

**Request Body:**

```json
{
  "step": 1,
  // Step 1: Welcome (no additional params)
}
```

**Step 2: Brand Information**

```json
{
  "step": 2,
  "brand_name": "My Beauty Brand",
  "category": "beauty",
  "business_type": "hybrid",
  "country": "ID",
  "google_maps_url": "https://maps.google.com/...",
  "description": "Leading organic skincare brand"
}
```

**Step 3: Social Media Links (Optional)**

```json
{
  "step": 3,
  "brand_id": "uuid-from-step-2",
  "web_url": "https://mybrand.com",
  "instagram_url": "https://instagram.com/mybrand",
  "tiktok_url": "https://tiktok.com/@mybrand",
  "youtube_url": "https://youtube.com/@mybrand",
  "facebook_url": "https://facebook.com/mybrand",
  "whatsapp": "+6281234567890"
}
```

**Step 4: Confirmation**

```json
{
  "step": 4,
  "brand_id": "uuid-from-step-2",
  "understood_30day_lock": true,
  "confirmation_text": "SAYA SETUJU"
}
```

**Step 5: Tier Selection**

```json
{
  "step": 5,
  "brand_id": "uuid-from-step-2",
  "tier": "premium",
  "billing_cycle": "yearly"
}
```

**Response:**

```json
{
  "success": true,
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "brand": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "brand_name": "My Beauty Brand",
    "category": "beauty",
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

**Valid Categories (18):**
```
agency, beauty, car_motorcycle, consultant, contractor,
ecommerce, education, event_organizer, fashion, finance,
fmcg, fnb, health, lifestyle, mom_baby,
other, photo_video, saas
```

---

### 2. AI Chat

**Endpoint:** `POST /ai-chat`

**Description:** Send message to AI brand assistant.

**Authentication:** Required

**Tier Access:** All tiers (quotas vary)

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "optional-existing-session-id",
  "message": "How can I improve my Instagram engagement?"
}
```

**Response:**

```json
{
  "success": true,
  "session_id": "660e8400-e29b-41d4-a716-446655440000",
  "message_id": "770e8400-e29b-41d4-a716-446655440000",
  "response": "To improve your Instagram engagement, consider these strategies: 1) Post consistently at optimal times...",
  "metadata": {
    "ai_provider": "openai",
    "model_used": "gpt-3.5-turbo",
    "tokens_used": 450,
    "cost_usd": 0.0015,
    "prompt_tokens": 200,
    "completion_tokens": 250
  }
}
```

**Rate Limits:**
- Basic: 30 QA/day
- Premium: 40 QA/day
- Partner: 50 QA/day

---

## CONTENT STUDIO APIs

### 1. Generate Article

**Endpoint:** `POST /generate-article`

**Description:** Generate AI-written article for your brand.

**Authentication:** Required

**Tier Access:** All tiers (quotas vary)

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "topic": "10 Skincare Tips for Dry Skin",
  "tone": "professional",
  "length": "medium",
  "keywords": ["skincare", "dry skin", "moisturizer"],
  "include_cta": true
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brand_id` | UUID | Yes | Your brand ID |
| `topic` | string | Yes | Article topic or title |
| `tone` | string | No | Tone: `professional`, `casual`, `friendly` (default: `professional`) |
| `length` | string | No | Length: `short` (200-300), `medium` (300-500), `long` (500-800) |
| `keywords` | string[] | No | SEO keywords to include |
| `include_cta` | boolean | No | Add call-to-action at the end (default: true) |

**Response:**

```json
{
  "success": true,
  "article_id": "880e8400-e29b-41d4-a716-446655440000",
  "article": {
    "title": "10 Proven Skincare Tips for Dry Skin",
    "content": "Are you struggling with dry, flaky skin?...",
    "word_count": 450,
    "reading_time": "2 minutes",
    "keywords": ["skincare", "dry skin", "moisturizer"],
    "metadata": {
      "tone": "professional",
      "generated_by": "openai",
      "model": "gpt-4o-mini",
      "cost_usd": 0.008
    }
  },
  "quota": {
    "used_today": 1,
    "limit_daily": 1,
    "resets_at": "2026-02-15T00:00:00Z"
  }
}
```

**Error: Quota Exceeded**

```json
{
  "error": "Quota exceeded",
  "message": "You have used 1/1 articles today (Basic tier)",
  "quota": {
    "used_today": 1,
    "limit_daily": 1,
    "resets_at": "2026-02-15T00:00:00Z"
  },
  "upgrade_url": "https://geovera.xyz/pricing"
}
```

---

### 2. Generate Image

**Endpoint:** `POST /generate-image`

**Description:** Generate AI image using DALL-E 3.

**Authentication:** Required

**Tier Access:** All tiers (quotas included with articles)

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "prompt": "Minimalist skincare product on marble background with natural lighting",
  "size": "1024x1024",
  "quality": "standard"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brand_id` | UUID | Yes | Your brand ID |
| `prompt` | string | Yes | Image description |
| `size` | string | No | Size: `1024x1024`, `1792x1024`, `1024x1792` (default: `1024x1024`) |
| `quality` | string | No | Quality: `standard`, `hd` (default: `standard`) |

**Response:**

```json
{
  "success": true,
  "image_id": "990e8400-e29b-41d4-a716-446655440000",
  "image": {
    "url": "https://storage.supabase.co/...",
    "prompt": "Minimalist skincare product...",
    "size": "1024x1024",
    "format": "png",
    "metadata": {
      "model": "dall-e-3",
      "quality": "standard",
      "cost_usd": 0.04
    }
  }
}
```

---

## AUTHORITY HUB APIs

### 1. Create Hub Collection

**Endpoint:** `POST /hub-create-collection`

**Description:** Create a curated content collection for Authority Hub articles.

**Authentication:** Required

**Tier Access:** All tiers

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "category": "beauty",
  "article_type": "hot",
  "keywords": ["skincare", "trending", "viral"],
  "content_count": 5
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brand_id` | UUID | Yes | Your brand ID |
| `category` | string | Yes | One of 18 categories |
| `article_type` | string | Yes | Type: `hot`, `review`, `education`, `nice_to_know` |
| `keywords` | string[] | No | Filter keywords |
| `content_count` | integer | No | Number of content pieces (default: 5, max: 10) |

**Response:**

```json
{
  "success": true,
  "collection_id": "aa0e8400-e29b-41d4-a716-446655440000",
  "collection": {
    "id": "aa0e8400-e29b-41d4-a716-446655440000",
    "category": "beauty",
    "article_type": "hot",
    "title": "Trending Beauty Content - February 2026",
    "content_pieces": [
      {
        "id": "content-1",
        "platform": "tiktok",
        "creator": "beautybycia",
        "caption": "Viral glass skin routine...",
        "embed_url": "https://www.tiktok.com/embed/...",
        "engagement": {
          "likes": 125000,
          "comments": 3400,
          "shares": 8900
        }
      }
    ],
    "metadata": {
      "total_reach": 2500000,
      "avg_engagement_rate": 8.5,
      "discovery_method": "perplexity",
      "cost_usd": 0.003
    }
  }
}
```

---

### 2. Discover Content

**Endpoint:** `POST /hub-discover-content`

**Description:** Discover trending content for Authority Hub using Perplexity AI.

**Authentication:** Required

**Tier Access:** All tiers

**Request Body:**

```json
{
  "category": "beauty",
  "article_type": "hot",
  "count": 10
}
```

**Response:**

```json
{
  "success": true,
  "discovery": {
    "topic": "Glass Skin Challenge",
    "keywords": ["glass skin", "viral", "korean beauty", "skincare routine"],
    "trending_score": 0.92,
    "content_ids": [
      "content-1",
      "content-2",
      "content-3"
    ],
    "estimated_reach": 3200000
  },
  "cost_usd": 0.001
}
```

---

### 3. Generate Hub Article

**Endpoint:** `POST /hub-generate-article`

**Description:** Generate a full Hub article with embedded content and charts.

**Authentication:** Required

**Tier Access:** All tiers (quotas apply)

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "collection_id": "aa0e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**

```json
{
  "success": true,
  "article_id": "bb0e8400-e29b-41d4-a716-446655440000",
  "article": {
    "title": "The Glass Skin Challenge: Why Indonesian Beauty Lovers Are Obsessed",
    "content": "Introduction paragraph...",
    "sections": [
      {
        "heading": "What is Glass Skin?",
        "content": "Glass skin is...",
        "embedded_content": [
          {
            "type": "tiktok",
            "url": "https://www.tiktok.com/embed/..."
          }
        ]
      }
    ],
    "charts": [
      {
        "type": "bar",
        "title": "Top Beauty Trends - February 2026",
        "data": {...}
      }
    ],
    "word_count": 480,
    "reading_time": "2 minutes"
  },
  "quota": {
    "used_today": 1,
    "limit_daily": 1,
    "resets_at": "2026-02-15T00:00:00Z"
  }
}
```

---

### 4. Generate Charts

**Endpoint:** `POST /hub-generate-charts`

**Description:** Generate data visualization charts for Hub articles.

**Authentication:** Required

**Tier Access:** All tiers

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "chart_type": "bar",
  "data": {
    "labels": ["Trend 1", "Trend 2", "Trend 3"],
    "values": [45, 32, 23]
  },
  "title": "Top Beauty Trends",
  "style": "modern"
}
```

**Response:**

```json
{
  "success": true,
  "chart": {
    "type": "bar",
    "title": "Top Beauty Trends",
    "image_url": "https://storage.supabase.co/charts/...",
    "config": {...}
  }
}
```

---

## RADAR APIS (PARTNER TIER ONLY)

### Access Control

All Radar APIs require Partner tier subscription. Requests from Basic or Premium tier users will receive `403 Forbidden` error:

```json
{
  "error": "Tier insufficient",
  "message": "Radar is exclusive to Partner tier ($1,099/month)",
  "current_tier": "premium",
  "required_tier": "partner",
  "upgrade_url": "https://geovera.xyz/pricing"
}
```

---

### 1. Discover Creators

**Endpoint:** `POST /radar-discover-creators`

**Description:** Discover influencers in your category using Perplexity AI.

**Authentication:** Required

**Tier Access:** Partner only

**Request Body:**

```json
{
  "category": "beauty",
  "country": "ID",
  "batch_size": 40
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | Yes | One of 6 categories: beauty, fnb, fashion, lifestyle, health, tech |
| `country` | string | Yes | ISO 3166-1 alpha-2 country code (default: ID) |
| `batch_size` | integer | No | Number of creators to discover (default: 40, max: 100) |

**Response:**

```json
{
  "success": true,
  "discovered": 40,
  "creators": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440000",
      "name": "Suhay Salim",
      "category": "beauty",
      "instagram_handle": "suhaysalim",
      "tiktok_handle": "suhaysalim",
      "follower_count": 1200000,
      "engagement_rate": 7.8,
      "content_focus": "Skincare reviews and tutorials"
    }
  ],
  "metadata": {
    "discovery_method": "perplexity",
    "model": "sonar-pro",
    "cost_usd": 0.0035
  }
}
```

---

### 2. Scrape Creator Content

**Endpoint:** `POST /radar-scrape-content`

**Description:** Scrape social media posts from discovered creators.

**Authentication:** Required

**Tier Access:** Partner only

**Request Body:**

```json
{
  "creator_id": "cc0e8400-e29b-41d4-a716-446655440000",
  "platform": "instagram",
  "post_count": 10
}
```

**Response:**

```json
{
  "success": true,
  "scraped": 10,
  "posts": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440000",
      "platform": "instagram",
      "post_id": "CyX1234567890",
      "post_url": "https://instagram.com/p/CyX1234567890",
      "caption": "My morning skincare routine...",
      "hashtags": ["skincare", "glasskin", "beauty"],
      "posted_at": "2026-02-13T08:30:00Z",
      "metrics": {
        "likes": 45000,
        "comments": 890,
        "shares": 230,
        "engagement_rate": 3.8
      }
    }
  ],
  "cost_usd": 0.02
}
```

---

### 3. Analyze Content

**Endpoint:** `POST /radar-analyze-content`

**Description:** Analyze content quality and brand authority using Claude AI.

**Authentication:** Required

**Tier Access:** Partner only

**Request Body:**

```json
{
  "content_id": "dd0e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**

```json
{
  "success": true,
  "analysis": {
    "content_id": "dd0e8400-e29b-41d4-a716-446655440000",
    "quality_score": 8.5,
    "originality_score": 7.9,
    "is_promotional": false,
    "is_giveaway": false,
    "brand_mentions": [
      {
        "brand": "Some By Mi",
        "confidence": 0.95,
        "context": "Product review"
      }
    ],
    "content_type": "tutorial",
    "audience_sentiment": "positive",
    "key_insights": [
      "Authentic product usage demonstration",
      "Step-by-step tutorial format",
      "Engages audience with Q&A"
    ]
  },
  "cost_usd": 0.002
}
```

---

### 4. Calculate Rankings (Mindshare)

**Endpoint:** `POST /radar-calculate-rankings`

**Description:** Calculate creator rankings based on reach and authority.

**Authentication:** Required

**Tier Access:** Partner only

**Request Body:**

```json
{
  "category": "beauty",
  "calculation_date": "2026-02-14"
}
```

**Response:**

```json
{
  "success": true,
  "rankings": [
    {
      "rank": 1,
      "creator_id": "cc0e8400-e29b-41d4-a716-446655440000",
      "creator_name": "Suhay Salim",
      "mindshare_score": 92.5,
      "total_reach": 4500000,
      "quality_score": 8.7,
      "trend_involvement": 15
    }
  ],
  "metadata": {
    "category": "beauty",
    "total_creators": 40,
    "calculation_date": "2026-02-14",
    "data_maturity": "72 hours"
  }
}
```

---

### 5. Calculate Marketshare

**Endpoint:** `POST /radar-calculate-marketshare`

**Description:** Calculate brand marketshare based on creator mentions.

**Authentication:** Required

**Tier Access:** Partner only

**Request Body:**

```json
{
  "category": "beauty"
}
```

**Response:**

```json
{
  "success": true,
  "marketshare": [
    {
      "brand": "Some By Mi",
      "mention_count": 87,
      "total_reach": 12500000,
      "marketshare_percentage": 18.5,
      "rank": 1
    }
  ],
  "metadata": {
    "category": "beauty",
    "analysis_period": "last_30_days",
    "total_brands_tracked": 45
  }
}
```

---

### 6. Discover Trends

**Endpoint:** `POST /radar-discover-trends`

**Description:** Discover trending topics, hashtags, and challenges.

**Authentication:** Required

**Tier Access:** Partner only

**Request Body:**

```json
{
  "category": "beauty"
}
```

**Response:**

```json
{
  "success": true,
  "trends": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440000",
      "trend_name": "Glass Skin Challenge",
      "hashtags": ["#glassskin", "#kbeauty", "#skincareroutine"],
      "trend_score": 0.92,
      "total_posts": 2340,
      "total_reach": 35000000,
      "peak_date": "2026-02-12",
      "creator_involvement": 23,
      "brand_involvement": 12
    }
  ],
  "metadata": {
    "category": "beauty",
    "detection_date": "2026-02-14"
  }
}
```

---

### 7. Learn Brand Authority Patterns

**Endpoint:** `POST /radar-learn-brand-authority`

**Description:** Machine learning to identify brand authority signals vs noise.

**Authentication:** Required

**Tier Access:** Partner only

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "training_data_days": 30
}
```

**Response:**

```json
{
  "success": true,
  "patterns": {
    "authority_indicators": [
      "Detailed product reviews",
      "Before/after comparisons",
      "Long-form tutorials"
    ],
    "noise_indicators": [
      "Generic mentions",
      "Giveaway posts",
      "Mass brand tagging"
    ],
    "model_accuracy": 0.87,
    "training_samples": 450
  }
}
```

---

## CONTENT TRAINING APIS

### 1. Analyze Visual Content

**Endpoint:** `POST /analyze-visual-content`

**Description:** Analyze images and videos for brand voice training.

**Authentication:** Required

**Tier Access:** Premium, Partner

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "media_url": "https://storage.supabase.co/media/...",
  "media_type": "image"
}
```

**Response:**

```json
{
  "success": true,
  "analysis": {
    "visual_style": "minimalist",
    "color_palette": ["#FFFFFF", "#F5F5F5", "#E8E8E8"],
    "composition": "centered",
    "mood": "calm and professional",
    "objects_detected": ["skincare bottle", "marble surface", "plant"],
    "brand_consistency_score": 8.9
  }
}
```

---

### 2. Train Brand Model

**Endpoint:** `POST /train-brand-model`

**Description:** Train custom AI model on your brand's content.

**Authentication:** Required

**Tier Access:** Partner only

**Request Body:**

```json
{
  "brand_id": "550e8400-e29b-41d4-a716-446655440000",
  "training_samples": 100
}
```

**Response:**

```json
{
  "success": true,
  "model": {
    "model_id": "ff0e8400-e29b-41d4-a716-446655440000",
    "training_status": "completed",
    "accuracy": 0.91,
    "samples_used": 100,
    "brand_voice_features": {
      "tone": "professional yet approachable",
      "vocabulary": ["organic", "natural", "sustainable"],
      "sentence_structure": "medium length, clear"
    }
  }
}
```

---

### 3. Record Content Feedback

**Endpoint:** `POST /record-content-feedback`

**Description:** Record user feedback on generated content for model improvement.

**Authentication:** Required

**Tier Access:** All tiers

**Request Body:**

```json
{
  "content_id": "880e8400-e29b-41d4-a716-446655440000",
  "rating": 5,
  "feedback_text": "Perfect tone and style!",
  "improvements": ["Could add more statistics"]
}
```

**Response:**

```json
{
  "success": true,
  "feedback_id": "gg0e8400-e29b-41d4-a716-446655440000",
  "message": "Thank you for your feedback!"
}
```

---

## WEBHOOKS (Coming Soon)

### Event Types

- `brand.onboarding.completed`
- `content.article.generated`
- `hub.collection.created`
- `radar.ranking.updated`
- `quota.limit.reached`
- `subscription.tier.changed`

### Webhook Payload Format

```json
{
  "event": "content.article.generated",
  "timestamp": "2026-02-14T10:30:00Z",
  "data": {
    "brand_id": "550e8400-e29b-41d4-a716-446655440000",
    "article_id": "880e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## SDK EXAMPLES

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Get JWT token
const { data: { session } } = await supabase.auth.getSession()
const jwt_token = session.access_token

// Call Edge Function
const { data, error } = await supabase.functions.invoke('ai-chat', {
  body: {
    brand_id: 'your-brand-id',
    message: 'Hello!'
  },
  headers: {
    Authorization: `Bearer ${jwt_token}`
  }
})

if (error) {
  console.error('Error:', error)
} else {
  console.log('Response:', data.response)
}
```

### Python

```python
import requests

SUPABASE_URL = "https://your-project.supabase.co"
JWT_TOKEN = "your-jwt-token"

response = requests.post(
    f"{SUPABASE_URL}/functions/v1/ai-chat",
    headers={
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    },
    json={
        "brand_id": "your-brand-id",
        "message": "Hello!"
    }
)

if response.status_code == 200:
    data = response.json()
    print("Response:", data['response'])
else:
    print("Error:", response.json())
```

### cURL

```bash
curl -X POST https://your-project.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "your-brand-id",
    "message": "Hello!"
  }'
```

---

## COST TRACKING

All API responses include cost information:

```json
{
  "success": true,
  "data": {...},
  "cost_tracking": {
    "api_provider": "openai",
    "model_used": "gpt-4o-mini",
    "cost_usd": 0.0015,
    "tokens_used": 450
  }
}
```

---

## SUPPORT

**API Issues:** api@geovera.xyz
**Rate Limit Increase:** sales@geovera.xyz
**Documentation:** https://docs.geovera.xyz

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**API Version:** v1
