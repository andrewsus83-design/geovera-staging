# Content Studio - Technical Specification
**Date:** February 15, 2026
**Design Inspiration:** Pinterest Masonry Layout
**AI Engine:** Perplexity Deep Research + Sora-style Generation

---

## 🎯 OVERVIEW

Content Studio adalah AI-powered content generator dengan Pinterest-inspired masonry layout yang menghasilkan konten visual dan text untuk berbagai platform social media dengan optimasi platform-specific.

---

## 🎨 DESIGN LAYOUT

### Masonry Grid (Pinterest-style)

```
┌──────────────────────────────────────────────────────────────┐
│  Content Studio                                              │
│  AI-powered content ready to publish                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Filter: All ▼] [Platform ▼] [Type ▼] [Generate New +]    │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐      │
│  │ Image 1 │  │ Image 2 │  │  Video 1 │  │ Image 3 │      │
│  │ tall    │  │ medium  │  │  tall    │  │ short   │      │
│  │         │  └─────────┘  │          │  └─────────┘      │
│  │         │                │          │                    │
│  │         │  ┌─────────┐  │          │  ┌──────────┐     │
│  │         │  │Article 1│  │          │  │  Video 2 │     │
│  └─────────┘  │ medium  │  └──────────┘  │  medium  │     │
│               └─────────┘                 └──────────┘     │
│  ┌──────────┐                                              │
│  │ Image 4  │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ tall     │  │Article 2│  │ Image 5 │  │ Video 3 │     │
│  │          │  │ short   │  │ tall    │  │ short   │     │
│  │          │  └─────────┘  │         │  └─────────┘     │
│  └──────────┘               │         │                    │
│                              └─────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 CONTENT CARD STRUCTURE

### Image Content Card
```html
<div class="content-card image-card">
  <!-- Image -->
  <div class="content-image">
    <img src="ai-generated-image.jpg" alt="Content">

    <!-- Platform badges -->
    <div class="platform-badges">
      <span class="badge badge-instagram">Instagram</span>
      <span class="badge badge-pinterest">Pinterest</span>
    </div>

    <!-- Optimization score -->
    <div class="optimization-score">
      <span class="score-value">98</span>
      <span class="score-label">SEO</span>
    </div>
  </div>

  <!-- Content info -->
  <div class="content-info">
    <h4 class="content-title">Luxury Wedding Decor Inspiration</h4>
    <p class="content-description">AI-optimized for Instagram & Pinterest</p>

    <!-- Optimization details -->
    <div class="optimization-tags">
      <span class="tag tag-visibility">↑ Visibility</span>
      <span class="tag tag-discovery">🔍 Discovery</span>
      <span class="tag tag-tone">✨ Aspirational</span>
    </div>

    <!-- Caption preview -->
    <div class="caption-preview">
      <p>"Transform your special day with luxury florals..."</p>
    </div>

    <!-- Stats -->
    <div class="content-stats">
      <span>240 chars</span>
      <span>•</span>
      <span>15 hashtags</span>
    </div>
  </div>

  <!-- Action buttons -->
  <div class="content-actions">
    <button class="action-btn like-btn">
      <svg>❤️</svg> Like
    </button>
    <button class="action-btn dislike-btn">
      <svg>👎</svg> Dislike
    </button>
    <button class="action-btn comment-btn">
      <svg>💬</svg> Comment
    </button>
    <button class="action-btn remix-btn">
      <svg>🎨</svg> Remix
    </button>
    <button class="action-btn publish-btn">
      <svg>🚀</svg> Publish
    </button>
  </div>
</div>
```

---

## 🤖 AI FEATURES

### 1. Content Generation (Sora-style)

**Generate Button Flow:**
```
[Generate New +]
    ↓
Pop-up Modal:
├── Platform Selection
│   ├── Instagram
│   ├── TikTok
│   ├── YouTube/Shorts
│   ├── Pinterest
│   └── Blog
│
├── Content Type
│   ├── Image
│   ├── Video
│   ├── Article (Short 240 chars)
│   ├── Article (Medium 800 words)
│   └── Article (Long 800-2500 words)
│
├── Objective
│   ├── 📈 Visibility (Reach more people)
│   ├── 🔍 Discovery (Get found in search)
│   ├── 👑 Authority (Build expertise)
│   └── 🤝 Trust (Build relationships)
│
├── Audience Tone
│   ├── Professional
│   ├── Casual
│   ├── Aspirational
│   ├── Educational
│   └── Entertaining
│
├── Prompt Input
│   [Text area: "Describe your content..."]
│
├── File Upload (Optional)
│   [Drag & drop or browse]
│   - Reference images
│   - Brand assets
│   - Style guides
│
└── [Generate] button
```

---

### 2. Remix Feature (Sora-inspired)

**Remix Button Flow:**
```
Click "Remix" on any content
    ↓
Pop-up Modal shows:
├── Original Content (preview)
├── "What would you like to change?"
│
├── Style Variations
│   ├── More vibrant colors
│   ├── Minimalist
│   ├── Luxury/Premium
│   └── Playful/Fun
│
├── Platform Optimization
│   ├── Re-optimize for TikTok
│   ├── Re-optimize for LinkedIn
│   └── Re-optimize for Blog
│
├── Objective Change
│   └── Switch from Visibility → Trust
│
├── Prompt Input
│   [Pre-filled with original prompt]
│   "Add more flowers, change to sunset lighting"
│
├── File Upload
│   [Optional new references]
│
└── [Generate Variation] button
```

---

### 3. Like System (Learning Engine)

**When user clicks "Like" ❤️:**

```javascript
// Frontend action
likeContent(contentId) {
  // 1. Visual feedback
  showLikeAnimation()

  // 2. Send to AI learning engine
  await fetch('/api/content/like', {
    method: 'POST',
    body: JSON.stringify({
      contentId: contentId,
      userId: userId,
      contentFeatures: {
        style: 'luxury-floral',
        colors: ['pink', 'white', 'gold'],
        composition: 'centered',
        lighting: 'soft-romantic',
        platform: 'instagram',
        objective: 'visibility',
        tone: 'aspirational'
      }
    })
  })

  // 3. Update user preference profile
  updatePreferenceProfile({
    likedStyles: [...existingStyles, 'luxury-floral'],
    likedTones: [...existingTones, 'aspirational']
  })

  // 4. Show feedback
  showToast('✓ Saved to your preferences')
}
```

**AI Learning Backend:**
```
User likes content
    ↓
AI analyzes:
├── Visual features (colors, composition, style)
├── Text tone (aspirational, professional, casual)
├── Platform performance (Instagram, TikTok, etc.)
├── Objective match (visibility, discovery, authority)
└── Engagement patterns
    ↓
Updates user preference model
    ↓
Future content generated with:
├── More similar styles
├── Similar color palettes
├── Similar tones
└── Same successful patterns
```

---

### 4. Dislike System (Negative Learning)

**When user clicks "Dislike" 👎:**

```
Click Dislike
    ↓
Pop-up Modal:
┌─────────────────────────────────────┐
│ Why don't you like this content?    │
├─────────────────────────────────────┤
│ ☐ Wrong style/aesthetic             │
│ ☐ Colors don't match brand          │
│ ☐ Tone is off                       │
│ ☐ Not relevant to my audience       │
│ ☐ Low quality                       │
│ ☐ Other: [text input]               │
├─────────────────────────────────────┤
│ [Delete & Learn] [Cancel]           │
└─────────────────────────────────────┘
    ↓
If confirmed:
├── Delete content from gallery
├── Send feedback to AI
├── Update "avoid" patterns
└── Show: "We'll generate less content like this"
```

**AI Learning from Dislikes:**
```javascript
dislikeContent(contentId, reasons) {
  // 1. Remove from gallery
  removeContent(contentId)

  // 2. Send to AI learning
  await fetch('/api/content/dislike', {
    method: 'POST',
    body: JSON.stringify({
      contentId: contentId,
      userId: userId,
      reasons: reasons, // ['wrong-style', 'colors-off']
      contentFeatures: {
        style: 'minimalist',
        colors: ['gray', 'black'],
        tone: 'professional'
      }
    })
  })

  // 3. Update "avoid" patterns
  updateAvoidPatterns({
    avoidStyles: ['minimalist'],
    avoidColors: ['gray', 'black'],
    avoidTones: ['too-professional']
  })

  // 4. Feedback
  showToast('✓ We will avoid this style in future')
}
```

---

### 5. Comment System (Refinement)

**When user clicks "Comment" 💬:**

```
Click Comment
    ↓
Pop-up Modal:
┌─────────────────────────────────────┐
│ How can we improve this?            │
├─────────────────────────────────────┤
│ [Text area for feedback]            │
│ "Make it more vibrant"              │
│ "Add more close-up shots"           │
│ "Change the tone to casual"         │
├─────────────────────────────────────┤
│ Quick suggestions:                  │
│ • More colors                       │
│ • Different composition             │
│ • Change lighting                   │
│ • Adjust tone                       │
├─────────────────────────────────────┤
│ [Submit Feedback] [Cancel]          │
└─────────────────────────────────────┘
    ↓
Feedback stored for:
├── Future generation improvements
├── Style refinement
└── Personalization learning
```

---

## 📊 PERPLEXITY DEEP RESEARCH INTEGRATION

### Research Flow for Each Content

**Before generating content:**

```
User requests content generation
    ↓
AI triggers Perplexity Deep Research:

1. Platform Research
   ├── Analyze current trends on target platform
   ├── Identify high-performing content styles
   ├── Research optimal posting times
   └── Study platform-specific algorithms

2. Objective Research
   ├── If Visibility: Research viral patterns
   ├── If Discovery: Research SEO keywords
   ├── If Authority: Research thought leadership
   └── If Trust: Research engagement tactics

3. Audience Research
   ├── Analyze target demographic behavior
   ├── Research preferred content formats
   ├── Study language patterns
   └── Identify pain points/interests

4. Competitor Research
   ├── Analyze top performers in niche
   ├── Identify content gaps
   ├── Study successful formats
   └── Research unique angles
    ↓
Compile Research Brief
    ↓
Generate optimized content
```

---

## 🎯 OPTIMIZATION SYSTEM

### Platform-Specific Optimization

#### Instagram
```javascript
instagramOptimization = {
  imageSpecs: {
    ratio: '1:1 or 4:5',
    resolution: '1080x1080 or 1080x1350',
    format: 'JPG or PNG'
  },

  caption: {
    maxLength: 2200,
    optimalLength: 138-150, // First line
    hashtags: 15-20,
    tone: 'aspirational + casual',
    cta: 'Save this post / Share with a friend'
  },

  objective: {
    visibility: {
      strategy: 'Trending hashtags + Reels',
      timing: 'Peak engagement hours',
      format: 'Carousel or Reel'
    },
    discovery: {
      strategy: 'SEO hashtags + Alt text',
      timing: 'Consistent posting',
      format: 'High-quality single image'
    }
  }
}
```

#### TikTok
```javascript
tiktokOptimization = {
  videoSpecs: {
    ratio: '9:16',
    duration: '15-60 seconds (optimal 21-34s)',
    format: 'MP4',
    hooks: 'First 3 seconds critical'
  },

  caption: {
    maxLength: 150,
    hashtags: 3-5 relevant,
    tone: 'casual + entertaining',
    cta: 'Duet this / Stitch this'
  },

  objective: {
    visibility: {
      strategy: 'Trending sounds + effects',
      timing: 'Post 2-4 times daily',
      format: 'Jump cuts + fast pacing'
    },
    discovery: {
      strategy: 'Niche hashtags + SEO keywords',
      timing: 'Off-peak for less competition',
      format: 'Educational + entertaining'
    }
  }
}
```

#### YouTube/Shorts
```javascript
youtubeOptimization = {
  videoSpecs: {
    shorts: {
      ratio: '9:16',
      duration: 'Under 60 seconds',
      format: 'MP4'
    },
    longForm: {
      ratio: '16:9',
      duration: '8-15 minutes (optimal)',
      format: 'MP4'
    }
  },

  title: {
    maxLength: 100,
    optimalLength: 60-70,
    keywords: 'Front-loaded',
    tone: 'Compelling + clear value'
  },

  description: {
    maxLength: 5000,
    optimalLength: 200-350,
    keywords: 'First 2-3 sentences',
    timestamps: 'Include for long videos'
  }
}
```

#### Blog Articles

**Short Articles (240 chars - Tweet/LinkedIn style):**
```javascript
shortArticle = {
  length: '240 characters max',
  structure: 'Hook + Value + CTA',
  tone: 'Punchy + actionable',
  objective: {
    visibility: 'Controversial take + question',
    authority: 'Expert insight + stat',
    trust: 'Personal story + lesson'
  }
}
```

**Medium Articles (800 words):**
```javascript
mediumArticle = {
  length: '800 words',
  structure: `
    - Hook (50 words)
    - Problem (150 words)
    - Solution (400 words)
    - Examples (150 words)
    - Conclusion + CTA (50 words)
  `,
  seo: {
    keywords: '5-7 primary + secondary',
    headings: 'H2, H3 structure',
    images: '2-3 optimized images'
  }
}
```

**Long Articles (800-2500 words):**
```javascript
longArticle = {
  length: '800-2500 words',
  structure: `
    - Introduction (100 words)
    - Table of Contents
    - Main Sections (5-7 H2s)
    - Each section (200-400 words)
    - Conclusion (100 words)
    - Resources/Links
  `,
  seo: {
    keywords: '10-15 keywords',
    headings: 'Full H2, H3, H4 hierarchy',
    images: '5-8 optimized images',
    internalLinks: '5-10 links',
    externalLinks: '3-5 authoritative sources'
  }
}
```

---

## 🎨 UI COMPONENTS SPECIFICATION

### Content Card CSS

```css
/* Content Card */
.content-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  break-inside: avoid;
  transition: all 0.3s ease;
  cursor: pointer;
}

.content-card:hover {
  box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08);
  transform: translateY(-4px);
}

/* Image container */
.content-image {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.content-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Platform badges */
.platform-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.badge-tiktok {
  background: #000000;
  color: #00F2EA;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.badge-youtube {
  background: #FF0000;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

/* Optimization score */
.optimization-score {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(22, 163, 74, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
}

.score-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  display: block;
  font-size: 10px;
  font-weight: 500;
  margin-top: 2px;
}

/* Content info */
.content-info {
  padding: 16px;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.content-description {
  font-size: 13px;
  color: #6B7280;
  margin: 0 0 12px 0;
}

/* Optimization tags */
.optimization-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.tag-visibility {
  background: #FEF3C7;
  color: #92400E;
}

.tag-discovery {
  background: #DBEAFE;
  color: #1E40AF;
}

.tag-authority {
  background: #E0E7FF;
  color: #3730A3;
}

.tag-trust {
  background: #D1FAE5;
  color: #065F46;
}

.tag-tone {
  background: #FCE7F3;
  color: #9F1239;
}

/* Caption preview */
.caption-preview {
  background: #F9FAFB;
  border-left: 3px solid #16A34A;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.caption-preview p {
  font-size: 13px;
  color: #374151;
  margin: 0;
  font-style: italic;
  line-height: 1.5;
}

/* Stats */
.content-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #9CA3AF;
  margin-bottom: 12px;
}

/* Action buttons */
.content-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #E5E7EB;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.like-btn:hover {
  background: #FEF2F2;
  border-color: #FCA5A5;
  color: #DC2626;
}

.dislike-btn:hover {
  background: #FEF2F2;
  border-color: #FCA5A5;
  color: #DC2626;
}

.remix-btn:hover {
  background: #F0FDF4;
  border-color: #BBF7D0;
  color: #16A34A;
}

.publish-btn {
  background: #16A34A;
  color: white;
  border-color: #16A34A;
}

.publish-btn:hover {
  background: #15803D;
}

/* Masonry grid */
.content-masonry {
  column-count: 4;
  column-gap: 24px;
  padding: 24px;
}

@media (max-width: 1400px) {
  .content-masonry {
    column-count: 3;
  }
}

@media (max-width: 1024px) {
  .content-masonry {
    column-count: 2;
  }
}

@media (max-width: 640px) {
  .content-masonry {
    column-count: 1;
  }
}
```

---

## 📱 MODAL DESIGNS

### Generate Content Modal

```html
<div class="modal-overlay-tailadmin">
  <div class="modal-tailadmin" style="max-width: 800px;">

    <!-- Header -->
    <div class="modal-header-tailadmin">
      <h3 class="modal-title-tailadmin">Generate New Content</h3>
      <button class="modal-close-button">×</button>
    </div>

    <!-- Body -->
    <div class="modal-body-tailadmin">

      <!-- Platform Selection -->
      <div class="form-group">
        <label class="label-tailadmin">Platform</label>
        <div class="platform-selector">
          <button class="platform-option">
            <img src="instagram-icon.svg">
            Instagram
          </button>
          <button class="platform-option">
            <img src="tiktok-icon.svg">
            TikTok
          </button>
          <button class="platform-option active">
            <img src="pinterest-icon.svg">
            Pinterest
          </button>
          <button class="platform-option">
            <img src="youtube-icon.svg">
            YouTube
          </button>
          <button class="platform-option">
            <img src="blog-icon.svg">
            Blog
          </button>
        </div>
      </div>

      <!-- Content Type -->
      <div class="form-group">
        <label class="label-tailadmin">Content Type</label>
        <select class="select-tailadmin">
          <option>Image (1:1)</option>
          <option>Image (4:5)</option>
          <option>Video (9:16)</option>
          <option>Article - Short (240 chars)</option>
          <option>Article - Medium (800 words)</option>
          <option>Article - Long (800-2500 words)</option>
        </select>
      </div>

      <!-- Objective -->
      <div class="form-group">
        <label class="label-tailadmin">Content Objective</label>
        <div class="objective-selector">
          <button class="objective-option">
            📈 Visibility
            <span class="objective-desc">Reach more people</span>
          </button>
          <button class="objective-option active">
            🔍 Discovery
            <span class="objective-desc">Get found in search</span>
          </button>
          <button class="objective-option">
            👑 Authority
            <span class="objective-desc">Build expertise</span>
          </button>
          <button class="objective-option">
            🤝 Trust
            <span class="objective-desc">Build relationships</span>
          </button>
        </div>
      </div>

      <!-- Audience Tone -->
      <div class="form-group">
        <label class="label-tailadmin">Audience Tone</label>
        <select class="select-tailadmin">
          <option>Professional</option>
          <option>Casual</option>
          <option selected>Aspirational</option>
          <option>Educational</option>
          <option>Entertaining</option>
        </select>
      </div>

      <!-- Prompt -->
      <div class="form-group">
        <label class="label-tailadmin">Describe your content</label>
        <textarea class="textarea-tailadmin" placeholder="e.g., Luxury wedding decor with pink and white roses, elegant chandeliers, romantic atmosphere..."></textarea>
      </div>

      <!-- File Upload -->
      <div class="form-group">
        <label class="label-tailadmin">Reference Images (Optional)</label>
        <div class="file-upload-area">
          <svg>📁</svg>
          <p>Drag & drop images or <span>browse</span></p>
          <span class="file-hint">PNG, JPG up to 10MB</span>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="modal-footer-tailadmin">
      <button class="btn-outline-tailadmin">Cancel</button>
      <button class="btn-primary-tailadmin">
        <svg>✨</svg> Generate Content
      </button>
    </div>

  </div>
</div>
```

---

## 🔄 DATA FLOW

```
User Action → Frontend → AI Engine → Learning Database
                                   ↓
                        Perplexity Research
                                   ↓
                        Content Generation
                                   ↓
                        Optimization Engine
                                   ↓
                        User Presentation
```

---

## 📊 ANALYTICS TRACKING

Track for each content:
```javascript
contentAnalytics = {
  generated: timestamp,
  platform: 'instagram',
  type: 'image',
  objective: 'discovery',
  tone: 'aspirational',
  userAction: 'liked', // liked, disliked, commented, remixed, published
  optimizationScore: 98,
  engagement: {
    likes: 0,
    dislikes: 0,
    comments: 0,
    remixes: 0,
    published: false
  }
}
```

---

**Status:** Ready for implementation
**Priority:** High
**Estimated Build Time:** 2 weeks

*AI-Powered Content Studio - GeoVera Intelligence Platform*
