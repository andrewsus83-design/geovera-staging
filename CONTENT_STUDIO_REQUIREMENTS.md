# GeoVera Content Studio - Technical Requirements & Architecture

## Overview
AI-powered content creation system yang generate artikel, images, dan video scripts yang konsisten dengan brand identity, dioptimasi untuk platform spesifik, dan terukur berdasarkan goal (visibility, discovery, authority, trust).

---

## 1. BUSINESS RULES - TIER LIMITS

### Content Quota per Month (berdasarkan subscription tier):

| Tier | Articles | Images | Videos | Total Content/mo |
|------|----------|--------|--------|------------------|
| **Basic** ($399/mo) | 1 | 1 | 0 | 2 pieces |
| **Premium** ($699/mo) | 3 | 3 | 1 | 7 pieces |
| **Partner** ($1,099/mo) | 6 | 6 | 3 | 15 pieces |

### Platform Optimization Matrix:

| Content Type | Optimized Platforms |
|--------------|---------------------|
| **Articles** | LinkedIn, Medium, Reddit, Blog (backlinks) |
| **Images** | Instagram, Twitter/X, LinkedIn, Pinterest |
| **Videos** | TikTok, Instagram Reels, YouTube Shorts |

### Content Goals (Measurable Outcomes):

1. **Visibility** - Meningkatkan impression, reach, views
2. **Discovery** - Meningkatkan organic search traffic, hashtag reach
3. **Authority** - Meningkatkan backlinks, shares, saves
4. **Trust** - Meningkatkan engagement rate, positive sentiment

---

## 2. DATABASE SCHEMA

### New Tables Required:

```sql
-- Content Generation Queue
CREATE TABLE gv_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Content specifications
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'image', 'video')),
  content_goal TEXT NOT NULL CHECK (content_goal IN ('visibility', 'discovery', 'authority', 'trust')),
  target_platforms TEXT[] NOT NULL, -- ['instagram', 'tiktok', 'linkedin', etc.]

  -- Topic & keywords (dari AI insights atau user request)
  topic TEXT NOT NULL,
  keywords TEXT[],
  target_audience TEXT, -- 'B2B decision makers', 'Gen Z consumers', etc.

  -- Generation status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'published')),
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent

  -- AI providers used
  ai_provider_article TEXT, -- 'openai', 'claude'
  ai_provider_image TEXT, -- 'dall-e', 'midjourney', 'stable-diffusion'
  ai_provider_video TEXT, -- 'runway', 'pika'

  -- Cost tracking
  generation_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Results
  result_content_id UUID REFERENCES gv_content_library(id),
  error_message TEXT
);

CREATE INDEX idx_content_queue_brand ON gv_content_queue(brand_id);
CREATE INDEX idx_content_queue_status ON gv_content_queue(status);
CREATE INDEX idx_content_queue_priority ON gv_content_queue(priority DESC);


-- Content Library (Generated Content Storage)
CREATE TABLE gv_content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Content metadata
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'image', 'video')),
  title TEXT NOT NULL,
  slug TEXT, -- URL-friendly version

  -- Content data (platform-specific)
  content_variations JSONB NOT NULL, -- Platform-optimized versions
  -- Example structure:
  -- {
  --   "instagram": { "caption": "...", "hashtags": [...], "image_url": "...", "aspect_ratio": "1:1" },
  --   "tiktok": { "description": "...", "video_url": "...", "duration": 30, "hooks": [...] },
  --   "linkedin": { "post_text": "...", "article_url": "...", "professional_tone": true }
  -- }

  -- SEO & Discovery
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  target_audience TEXT,

  -- Brand consistency tracking
  brand_voice_score DECIMAL(3, 2), -- 0.00 to 1.00 (how consistent with brand DNA)
  brand_colors_used TEXT[], -- HEX codes used in image/video
  brand_fonts_used TEXT[], -- Fonts used (if applicable)

  -- Content goal & performance
  content_goal TEXT NOT NULL CHECK (content_goal IN ('visibility', 'discovery', 'authority', 'trust')),
  target_platforms TEXT[] NOT NULL,

  -- AI generation metadata
  ai_provider_used TEXT NOT NULL,
  model_used TEXT,
  generation_prompt TEXT, -- Full prompt used
  generation_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- File storage
  primary_file_url TEXT, -- Supabase Storage URL
  thumbnail_url TEXT,
  file_size_kb INTEGER,
  file_format TEXT, -- 'jpg', 'png', 'mp4', 'md', etc.

  -- Publishing status
  published_to_platforms TEXT[], -- ['instagram', 'linkedin'] (platforms where it's been published)
  publish_scheduled_at TIMESTAMPTZ,
  publish_status TEXT DEFAULT 'draft' CHECK (publish_status IN ('draft', 'scheduled', 'published', 'archived')),

  -- Performance tracking (updated after publish)
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5, 2), -- %
  sentiment_score DECIMAL(3, 2), -- -1.00 to 1.00

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_content_library_brand ON gv_content_library(brand_id);
CREATE INDEX idx_content_library_type ON gv_content_library(content_type);
CREATE INDEX idx_content_library_goal ON gv_content_library(content_goal);
CREATE INDEX idx_content_library_status ON gv_content_library(publish_status);
CREATE INDEX idx_content_library_created ON gv_content_library(created_at DESC);


-- Content Performance Analytics
CREATE TABLE gv_content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES gv_content_library(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Platform-specific metrics
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'twitter', 'youtube', 'reddit', 'medium', 'blog')),

  -- Engagement metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,

  -- Goal achievement
  goal_achieved BOOLEAN DEFAULT FALSE,
  goal_score DECIMAL(5, 2), -- 0.00 to 100.00 (% of goal achieved)

  -- Sentiment analysis (from comments)
  positive_comments INTEGER DEFAULT 0,
  negative_comments INTEGER DEFAULT 0,
  neutral_comments INTEGER DEFAULT 0,
  overall_sentiment DECIMAL(3, 2), -- -1.00 to 1.00

  -- Timestamps
  tracked_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_performance_content ON gv_content_performance(content_id);
CREATE INDEX idx_content_performance_platform ON gv_content_performance(platform);


-- Brand Voice Guidelines (Learning from user feedback)
CREATE TABLE gv_brand_voice_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Voice attributes
  tone TEXT NOT NULL, -- 'professional', 'casual', 'humorous', 'authoritative', etc.
  language_style TEXT, -- 'formal', 'conversational', 'technical', etc.

  -- Writing rules
  do_phrases TEXT[], -- Phrases to USE
  dont_phrases TEXT[], -- Phrases to AVOID

  -- Brand personality
  personality_traits TEXT[], -- ['innovative', 'trustworthy', 'bold']
  values TEXT[], -- ['sustainability', 'transparency', 'excellence']

  -- Content preferences (learned from user edits & approvals)
  preferred_content_length TEXT, -- 'short', 'medium', 'long'
  preferred_hashtag_count INTEGER DEFAULT 5,
  emoji_usage TEXT CHECK (emoji_usage IN ('none', 'minimal', 'moderate', 'frequent')),

  -- Learning data
  total_content_generated INTEGER DEFAULT 0,
  user_approval_rate DECIMAL(5, 2), -- % of content approved without edits
  avg_edit_percentage DECIMAL(5, 2), -- Average % of content user edits

  -- Auto-updated
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_voice_brand ON gv_brand_voice_guidelines(brand_id);


-- Content Usage Tracking (Monthly quota enforcement)
CREATE TABLE gv_content_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Tracking period
  usage_month DATE DEFAULT DATE_TRUNC('month', NOW()),

  -- Content counts (by type)
  articles_generated INTEGER DEFAULT 0,
  articles_limit INTEGER NOT NULL, -- Based on tier
  images_generated INTEGER DEFAULT 0,
  images_limit INTEGER NOT NULL,
  videos_generated INTEGER DEFAULT 0,
  videos_limit INTEGER NOT NULL,

  -- Cost tracking
  total_cost_usd DECIMAL(10, 2) DEFAULT 0,

  -- Reset tracking
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  next_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),

  UNIQUE(brand_id, usage_month)
);

CREATE INDEX idx_content_usage_brand ON gv_content_usage_tracking(brand_id);
CREATE INDEX idx_content_usage_month ON gv_content_usage_tracking(usage_month DESC);


-- Content Templates (Reusable structures)
CREATE TABLE gv_content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE, -- NULL = global template

  -- Template metadata
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('article', 'image', 'video')),
  template_category TEXT, -- 'how-to', 'listicle', 'case-study', 'announcement', etc.

  -- Template structure (AI prompt template)
  prompt_template TEXT NOT NULL,
  -- Example: "Write a {length} article about {topic} for {audience} focusing on {goal}. Include {cta}."

  -- Platform optimization rules
  platform_rules JSONB, -- Platform-specific customization rules
  -- Example:
  -- {
  --   "instagram": { "max_caption_length": 2200, "hashtag_count": 10, "aspect_ratio": "1:1" },
  --   "tiktok": { "max_duration": 60, "hook_style": "question", "cta_placement": "end" }
  -- }

  -- Usage stats
  times_used INTEGER DEFAULT 0,
  avg_performance_score DECIMAL(5, 2), -- Average goal achievement

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_templates_type ON gv_content_templates(template_type);
CREATE INDEX idx_content_templates_category ON gv_content_templates(template_category);
```

---

## 3. EDGE FUNCTIONS

### Function 1: `generate-content`

**Path:** `/supabase/functions/generate-content/index.ts`

**Purpose:** Generate AI-powered content (article, image, or video script) optimized for specific platforms

**Request:**
```json
{
  "brand_id": "uuid",
  "content_type": "article", // or "image", "video"
  "topic": "How to improve SEO for sustainable fashion brands",
  "keywords": ["sustainable fashion", "SEO optimization", "eco-friendly"],
  "content_goal": "authority", // visibility | discovery | authority | trust
  "target_platforms": ["linkedin", "medium", "blog"],
  "target_audience": "B2B marketing managers in fashion industry",
  "template_id": "uuid" // optional
}
```

**Response:**
```json
{
  "success": true,
  "content_id": "uuid",
  "content": {
    "title": "5 SEO Strategies for Sustainable Fashion Brands in 2024",
    "variations": {
      "linkedin": {
        "post_text": "🌱 Sustainability meets SEO...",
        "hashtags": ["#SustainableFashion", "#SEOTips", "#GreenMarketing"],
        "tone": "professional",
        "cta": "Download our full guide →"
      },
      "medium": {
        "article_html": "<h1>5 SEO Strategies...</h1>...",
        "reading_time": "7 min read",
        "seo_title": "SEO for Sustainable Fashion: 5 Proven Strategies (2024)",
        "meta_description": "Boost your eco-friendly fashion brand..."
      }
    },
    "brand_voice_score": 0.94,
    "keywords_used": ["sustainable fashion", "SEO", "organic traffic"],
    "estimated_performance": {
      "visibility_score": 85,
      "authority_score": 92,
      "seo_potential": "high"
    }
  },
  "ai_provider": "claude",
  "generation_cost_usd": 0.15,
  "quota_remaining": {
    "articles": 2,
    "images": 3,
    "videos": 1
  }
}
```

**Process:**
1. Verify user quota (check `gv_content_usage_tracking`)
2. Fetch brand DNA (colors, fonts, voice guidelines)
3. Select AI provider:
   - **Articles**: Claude (complex, long-form), OpenAI (creative, engaging)
   - **Images**: DALL-E 3, Midjourney API (via replicate.com)
   - **Videos**: Generate script + storyboard (Runway ML for generation)
4. Generate platform-specific variations
5. Check brand consistency score
6. Store in `gv_content_library`
7. Update usage tracking
8. Return content + metadata

---

### Function 2: `optimize-content-for-platform`

**Path:** `/supabase/functions/optimize-content-for-platform/index.ts`

**Purpose:** Re-optimize existing content for different platform

**Request:**
```json
{
  "content_id": "uuid",
  "target_platform": "tiktok", // new platform not in original
  "customization": {
    "add_hooks": true,
    "max_duration": 30,
    "cta_placement": "beginning"
  }
}
```

**Response:**
```json
{
  "success": true,
  "optimized_content": {
    "platform": "tiktok",
    "description": "Did you know 70% of fashion brands ignore THIS SEO trick? 🤯",
    "video_script": {
      "hook": "Stop scrolling! Your fashion brand is invisible...",
      "body": "Here are 3 SEO hacks...",
      "cta": "Follow for more SEO tips! 🚀"
    },
    "hashtags": ["#SEOHacks", "#FashionBusiness", "#SmallBusinessTips"],
    "duration_seconds": 28,
    "aspect_ratio": "9:16"
  }
}
```

---

### Function 3: `publish-content`

**Path:** `/supabase/functions/publish-content/index.ts`

**Purpose:** Publish content to selected platforms (via APIs)

**Supported Platforms:**
- **Instagram**: Meta Graph API
- **TikTok**: TikTok for Business API
- **Twitter/X**: X API v2
- **LinkedIn**: LinkedIn Pages API
- **YouTube**: YouTube Data API (upload shorts)
- **Reddit**: Reddit API (post to subreddits)
- **Medium**: Medium API (publish articles)

**Request:**
```json
{
  "content_id": "uuid",
  "platforms": ["instagram", "linkedin"],
  "schedule_at": "2024-02-15T10:00:00Z" // optional, immediate if not set
}
```

**Response:**
```json
{
  "success": true,
  "published_to": {
    "instagram": {
      "post_id": "1234567890",
      "url": "https://instagram.com/p/ABC123",
      "status": "published"
    },
    "linkedin": {
      "post_id": "urn:li:share:9876543210",
      "url": "https://linkedin.com/feed/update/urn:li:share:9876543210",
      "status": "published"
    }
  },
  "failed": []
}
```

---

### Function 4: `analyze-content-performance`

**Path:** `/supabase/functions/analyze-content-performance/index.ts`

**Purpose:** Track content performance across platforms (cron job: daily)

**Triggered by:** Cron schedule (daily at 2 AM UTC)

**Process:**
1. Fetch all published content from last 30 days
2. For each platform, call analytics API:
   - Instagram: Graph API Insights
   - TikTok: Analytics API
   - LinkedIn: Analytics API
   - etc.
3. Calculate goal achievement:
   - **Visibility goal**: impressions vs target
   - **Discovery goal**: organic reach vs target
   - **Authority goal**: shares + saves vs target
   - **Trust goal**: engagement rate + positive sentiment
4. Store in `gv_content_performance`
5. Update brand voice learning data (if high performance)

---

### Function 5: `learn-brand-voice`

**Path:** `/supabase/functions/learn-brand-voice/index.ts`

**Purpose:** Machine learning from user edits and feedback to improve brand voice

**Triggered by:** User edits content, approves/rejects

**Request:**
```json
{
  "content_id": "uuid",
  "user_action": "edited", // or "approved", "rejected"
  "original_content": "...",
  "edited_content": "...",
  "feedback": "Too formal, make it more casual"
}
```

**Process:**
1. Compare original vs edited (if edited)
2. Extract patterns:
   - Tone changes (formal → casual)
   - Phrase replacements (what user prefers)
   - Structure changes (longer vs shorter)
3. Update `gv_brand_voice_guidelines`
4. Adjust future generation prompts
5. Calculate approval rate for learning metrics

---

## 4. AI PROVIDERS & MODELS

### Article Generation:

**Provider 1: Claude (Anthropic)**
- **Model**: `claude-3-opus-20240229`
- **Use case**: Long-form, complex, authoritative articles
- **Cost**: ~$15 per 1M input tokens, ~$75 per 1M output tokens
- **Avg cost per article**: $0.20 - $0.50

**Provider 2: OpenAI**
- **Model**: `gpt-4-turbo`
- **Use case**: Creative, engaging, storytelling articles
- **Cost**: ~$10 per 1M input tokens, ~$30 per 1M output tokens
- **Avg cost per article**: $0.15 - $0.40

### Image Generation:

**Provider 1: DALL-E 3 (OpenAI)**
- **Resolution**: 1024x1024, 1024x1792, 1792x1024
- **Cost**: $0.04 per image (standard), $0.08 per image (HD)
- **Use case**: High-quality, brand-consistent visuals

**Provider 2: Midjourney (via Replicate)**
- **Model**: Midjourney v6
- **Cost**: ~$0.05 per image
- **Use case**: Artistic, unique visuals

**Provider 3: Stable Diffusion (Replicate)**
- **Model**: SDXL 1.0
- **Cost**: ~$0.002 per image (much cheaper)
- **Use case**: Bulk generation, variations

### Video Script Generation:

**Provider: Claude + OpenAI**
- Script writing: Claude (structured, detailed)
- Hook generation: OpenAI (creative, attention-grabbing)
- **Cost**: $0.10 - $0.30 per video script

### Video Generation (Future):

**Provider: Runway Gen-2 API**
- **Cost**: ~$0.05 per second of video
- **Use case**: Text-to-video, image-to-video
- **Note**: High cost, use sparingly for Partner tier only

---

## 5. PLATFORM-SPECIFIC OPTIMIZATION RULES

### Instagram:
```javascript
{
  "image": {
    "aspect_ratio": "1:1", // Square posts
    "min_resolution": "1080x1080",
    "max_file_size_mb": 30,
    "format": "jpg"
  },
  "caption": {
    "max_length": 2200,
    "hashtag_count": 10,
    "emoji_usage": "moderate",
    "first_line_hook": true, // Capture attention
    "cta_placement": "end"
  },
  "reels": {
    "aspect_ratio": "9:16",
    "duration_seconds": 15-60,
    "hook_timing": "0-3s",
    "text_overlay": true,
    "trending_audio": true
  }
}
```

### TikTok:
```javascript
{
  "video": {
    "aspect_ratio": "9:16",
    "duration_seconds": 15-60,
    "min_resolution": "1080x1920",
    "format": "mp4"
  },
  "description": {
    "max_length": 300,
    "hashtag_count": 5,
    "trending_hashtags": true
  },
  "hooks": [
    "Question hook: 'Did you know...'",
    "Shock hook: 'Stop doing this!'",
    "Story hook: 'This changed everything...'"
  ],
  "cta": "end" // Last 3 seconds
}
```

### LinkedIn:
```javascript
{
  "article": {
    "min_word_count": 1000,
    "professional_tone": true,
    "data_driven": true, // Include stats, case studies
    "cta": "Download whitepaper, Book demo"
  },
  "post": {
    "max_length": 3000,
    "hashtag_count": 3,
    "tag_people": true,
    "document_carousel": true // LinkedIn native format
  },
  "image": {
    "aspect_ratio": "1.91:1", // Landscape
    "infographic_style": true
  }
}
```

### Twitter/X:
```javascript
{
  "post": {
    "max_length": 280,
    "thread_enabled": true, // Break long content into threads
    "hashtag_count": 2,
    "mention_limit": 3
  },
  "image": {
    "aspect_ratio": "16:9",
    "max_count": 4
  }
}
```

### YouTube Shorts:
```javascript
{
  "video": {
    "aspect_ratio": "9:16",
    "duration_seconds": 15-60,
    "hook_timing": "0-5s",
    "text_overlay": true,
    "end_screen": "Subscribe CTA"
  },
  "description": {
    "keywords": true,
    "timestamps": false, // Not needed for shorts
    "links": "max 3"
  }
}
```

### Reddit:
```javascript
{
  "post": {
    "title_max_length": 300,
    "body_format": "markdown",
    "tone": "conversational", // No corporate speak
    "provide_value": true, // Reddit hates ads
    "community_rules": true // Check subreddit rules
  },
  "image": {
    "aspect_ratio": "flexible",
    "infographic": true,
    "watermark": "subtle" // Don't be too promotional
  }
}
```

### Medium / Blog:
```javascript
{
  "article": {
    "min_word_count": 800,
    "seo_optimized": true,
    "internal_links": 3,
    "external_links": 5,
    "reading_time": "5-10 min"
  },
  "structure": {
    "h1": 1,
    "h2": 4-6,
    "paragraphs": "short", // 2-3 sentences max
    "images": 3-5,
    "cta_placement": "middle + end"
  },
  "seo": {
    "meta_title": 60,
    "meta_description": 160,
    "alt_text": true,
    "schema_markup": true
  }
}
```

---

## 6. CONTENT GENERATION WORKFLOW

### Step 1: User Request
```
User → "Generate article about sustainable packaging for Instagram & LinkedIn"
```

### Step 2: System Checks
1. Verify subscription tier → Premium (3 articles/month)
2. Check usage → 1 article used, 2 remaining ✅
3. Fetch brand DNA:
   - Colors: #16A34A, #0B0F19
   - Tone: Professional, eco-conscious
   - Values: Sustainability, transparency

### Step 3: AI Orchestration
```javascript
// Select AI provider based on content type + goal
if (content_goal === 'authority' && content_type === 'article') {
  provider = 'claude'; // Best for authoritative, well-researched content
} else if (content_goal === 'visibility' && content_type === 'article') {
  provider = 'openai'; // Best for engaging, viral content
}

// Generate base content
const prompt = `
You are a content strategist for ${brand_name}, a ${category} brand.

Brand Voice:
- Tone: ${brand_voice.tone}
- Values: ${brand_voice.values.join(', ')}
- Avoid: ${brand_voice.dont_phrases.join(', ')}

Task: Write a ${content_type} about "${topic}" targeting ${target_audience}.

Goal: ${content_goal} (optimize for ${goal_definition})

Keywords to include: ${keywords.join(', ')}

Generate platform-optimized versions for: ${target_platforms.join(', ')}

Requirements:
- Use brand colors: ${brand_colors.join(', ')}
- Consistent with brand personality: ${brand_personality}
- Include clear CTA
- Optimize for ${content_goal}
`;

const content = await ai_provider.generate(prompt);
```

### Step 4: Platform Optimization
```javascript
// Instagram optimization
const instagramVersion = {
  caption: truncate(content.body, 2200),
  hashtags: extractHashtags(content, limit: 10),
  image_prompt: generateImagePrompt(content.topic, brand_colors),
  cta: "Link in bio for full article 👆"
};

// LinkedIn optimization
const linkedinVersion = {
  article_html: formatAsHTML(content.body),
  professional_headline: content.title,
  hashtags: extractHashtags(content, limit: 3, professional: true),
  cta: "Download our free guide →"
};
```

### Step 5: Brand Consistency Check
```javascript
const brand_voice_score = calculateBrandConsistency({
  content: content.body,
  brand_guidelines: brand_voice,
  brand_colors_used: image_colors,
  tone_match: tone_analysis
});

if (brand_voice_score < 0.7) {
  // Regenerate with stricter brand guidelines
  content = await regenerateWithStrictGuidelines();
}
```

### Step 6: Store & Return
```javascript
const content_id = await storeInContentLibrary({
  brand_id,
  content_type,
  content_variations: {
    instagram: instagramVersion,
    linkedin: linkedinVersion
  },
  brand_voice_score,
  generation_cost_usd
});

await updateUsageTracking(brand_id, content_type);

return {
  success: true,
  content_id,
  content: content_variations,
  quota_remaining
};
```

---

## 7. LEARNING & IMPROVEMENT

### User Feedback Loop:

**When user edits content:**
```javascript
// Track edit patterns
const editAnalysis = compareTexts(original, edited);

// Extract learning points
const learnings = {
  tone_adjustment: editAnalysis.tone_change, // "formal" → "casual"
  phrase_replacements: editAnalysis.replaced_phrases,
  length_preference: editAnalysis.length_change,
  structure_changes: editAnalysis.structure_diff
};

// Update brand voice guidelines
await updateBrandVoice(brand_id, learnings);

// Improve future prompts
brand_voice_guidelines.do_phrases.push(...editAnalysis.preferred_phrases);
brand_voice_guidelines.dont_phrases.push(...editAnalysis.avoided_phrases);
```

**When content performs well:**
```javascript
// If content achieves goal (e.g., visibility goal met)
if (performance.goal_score >= 80) {
  // Extract successful patterns
  const successPatterns = {
    topic_category: content.category,
    platform: performance.platform,
    content_structure: content.structure,
    keywords_used: content.keywords,
    posting_time: content.published_at
  };

  // Save as best practice
  await saveBestPractice(brand_id, successPatterns);

  // Suggest similar content
  await suggestContentIdeas(brand_id, successPatterns);
}
```

---

## 8. COST ESTIMATION

### Per Brand Per Month:

**Basic Tier ($399/mo):**
- 1 article (~$0.30) + 1 image (~$0.05) = **$0.35/mo**
- Profit margin: $398.65 (99.9%)

**Premium Tier ($699/mo):**
- 3 articles (~$0.90) + 3 images (~$0.15) + 1 video script (~$0.20) = **$1.25/mo**
- Profit margin: $697.75 (99.8%)

**Partner Tier ($1,099/mo):**
- 6 articles (~$1.80) + 6 images (~$0.30) + 3 video scripts (~$0.60) = **$2.70/mo**
- Profit margin: $1,096.30 (99.75%)

**Total AI cost for Content Studio: ~$0.35 - $2.70 per brand/month**

Very high profit margins! 🚀

---

## 9. FRONTEND UI REQUIREMENTS

### Page: `/content-studio`

**Sections:**

1. **Content Dashboard**
   - Quota overview (articles, images, videos remaining)
   - Recent content library
   - Performance metrics

2. **Generate New Content**
   - Content type selector (Article, Image, Video)
   - Topic input
   - Goal selector (Visibility, Discovery, Authority, Trust)
   - Platform selector (multi-select)
   - Template selector (optional)

3. **Content Library**
   - Grid view of all generated content
   - Filter by type, platform, goal, date
   - Performance indicators
   - Edit, publish, duplicate actions

4. **Publishing Center**
   - Schedule content across platforms
   - Calendar view
   - Auto-scheduling recommendations

5. **Analytics Dashboard**
   - Content performance by platform
   - Goal achievement tracking
   - ROI calculator

---

## 10. IMPLEMENTATION PRIORITY

### Phase 1 (Week 1-2): MVP
1. ✅ Database schema setup
2. ✅ `generate-content` Edge Function (articles only, OpenAI)
3. ✅ Basic content library storage
4. ✅ Simple UI for content generation

### Phase 2 (Week 3-4):
1. ✅ Add Claude for article generation
2. ✅ Image generation (DALL-E 3)
3. ✅ Platform optimization logic
4. ✅ Brand voice guidelines

### Phase 3 (Week 5-6):
1. ✅ Publishing API integrations (Instagram, LinkedIn)
2. ✅ Performance tracking
3. ✅ Learning & improvement system
4. ✅ Video script generation

### Phase 4 (Week 7-8):
1. ✅ Advanced features (templates, scheduling)
2. ✅ Multi-platform publishing
3. ✅ Analytics dashboard
4. ✅ Auto-content suggestions

---

## 11. SECURITY & COMPLIANCE

### Platform API Keys:
- Store in Supabase Vault (encrypted)
- Separate keys per brand (user connects own accounts)
- OAuth flow for Instagram, LinkedIn, etc.

### Content Ownership:
- All generated content belongs to user
- GeoVera can't reuse or resell
- User can export all content

### Copyright:
- AI-generated content is original
- No copyrighted material used
- User responsible for final review

### RLS Policies:
```sql
-- Users can only access their own brand's content
CREATE POLICY "Users access own brand content"
  ON gv_content_library
  FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );
```

---

## 12. NEXT STEPS

**Immediate Actions:**
1. [ ] Setup database schema (run migrations)
2. [ ] Create Edge Function `generate-content` (OpenAI MVP)
3. [ ] Integrate DALL-E 3 for image generation
4. [ ] Build basic UI at `/content-studio`
5. [ ] Test end-to-end content generation flow

**Questions:**
1. Should we auto-generate monthly content or wait for user request?
2. Allow users to connect their own API keys (OpenAI, etc.) for unlimited usage?
3. Include content calendar with auto-scheduling AI?
4. Add collaboration features (team review/approval workflow)?

---

**Ready to implement Content Studio?** 🎨📝🎥
