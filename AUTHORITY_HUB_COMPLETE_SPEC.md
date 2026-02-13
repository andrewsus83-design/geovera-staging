# 🏛️ GEOVERA AUTHORITY HUB - COMPLETE SPECIFICATION

**Version:** 2.0
**Date:** 2026-02-13
**Status:** ✅ Schema Complete, Functions In Progress

---

## 🎯 MISSION STATEMENT

> "Biarkan pasar itu ramai seperti youtube, social media, dll. Biarkan Geovera menjadikan itu semua mudah dimengerti dalam bahasa, angka dan grafik berdasarkan hasil dari top of voice setiap kategorinya."

**Translation:**
Let the market be noisy like YouTube and social media. Let Geovera make it all easy to understand through **language**, **numbers**, and **graphics** based on top-of-voice results in each category.

---

## 📊 3-TAB ARCHITECTURE

### **TAB 1: EMBEDS** 📺
**Purpose:** Show raw, authentic content from top creators

**Content:**
- 5-10 embedded videos/posts per collection
- Curated from YouTube, TikTok, Instagram
- Top-of-voice creators in category
- Interactive (play inline, no redirects)

**Display:**
```
┌─────────────────────────────────────┐
│   TAB 1: EMBEDS                     │
├─────────────────────────────────────┤
│   [TikTok Embed 1]  [Instagram 1]   │
│   [YouTube Embed 1] [TikTok Embed 2]│
│   [Instagram Embed 2] [YouTube 2]   │
│                                     │
│   5-10 curated pieces               │
└─────────────────────────────────────┘
```

---

### **TAB 2: ARTICLES** 📝
**Purpose:** AI-generated summaries (200-500 words)

**4 Article Types:**

#### **1. HOT 🔥**
- **Focus:** Trending topics, viral conversations
- **Tone:** Exciting, timely, FOMO-inducing
- **Hook Example:** "Everyone's Talking About This New Skincare Hack"
- **Length:** 200-350 words

#### **2. REVIEW 🔍**
- **Focus:** Product/service analysis, comparisons
- **Tone:** Balanced, analytical, trustworthy
- **Hook Example:** "5 Creators Tried This Product - Here's What Happened"
- **Length:** 300-500 words

#### **3. EDUCATION 🎓**
- **Focus:** How-to guides, tutorials, step-by-step
- **Tone:** Instructional, clear, actionable
- **Hook Example:** "The Complete Guide to [Topic] - From Experts"
- **Length:** 350-500 words

#### **4. NICE TO KNOW 💡**
- **Focus:** Industry insights, trends, behind-the-scenes
- **Tone:** Informative, insider knowledge
- **Hook Example:** "What Top Creators Know About [Topic] That You Don't"
- **Length:** 200-400 words

**Generation Pipeline:**
```
5-10 Embedded Videos
    ↓
Perplexity Deep Research (context, trending topics)
    ↓
Claude Reverse Engineering (extract insights)
    ↓
OpenAI Article Writing (200-500 words, hook-driven)
    ↓
Publish to Hub
```

**Quality Requirements:**
- ✅ Natural language (not overly AI)
- ✅ Hook-driven (capture attention in first 2 sentences)
- ✅ Easy to read (Grade 8-10 reading level)
- ✅ User-friendly (short paragraphs, bullet points)
- ✅ No ToS/copyright violations
- ✅ Neutral tone (build authority & trust)

---

### **TAB 3: CHARTS** 📊
**Purpose:** Statista-inspired data visualizations

**Chart Types:**
1. **Line Charts** - Engagement trends over time
2. **Bar Charts** - Top creators by reach/engagement
3. **Pie Charts** - Content type distribution
4. **Area Charts** - Growth metrics
5. **Heatmaps** - Activity by day/time
6. **Scatter Plots** - Quality vs reach analysis

**Data Sources:**
- `gv_creator_content` - Post metrics
- `gv_creator_rankings` - Mindshare data
- `gv_brand_marketshare` - Brand performance
- `gv_trends` - Trending topics

**Design Inspiration:**
- **Statista.com** - Clean, professional charts
- **Professional color schemes**
- **Clear labels and legends**
- **Key insights highlighted**

**Example Charts:**

#### **Chart 1: Engagement Rate Trend (30 Days)**
```
Line Chart
X-Axis: Date (30 days)
Y-Axis: Avg Engagement Rate (%)
Data: Daily average engagement rate for category
Insight: "Engagement increased 15% this month"
```

#### **Chart 2: Top 10 Creators by Reach**
```
Bar Chart (Horizontal)
X-Axis: Total Reach (millions)
Y-Axis: Creator Name
Data: Sum of reach for last 30 days
Insight: "@creator1 reached 2.5M people this month"
```

#### **Chart 3: Content Type Distribution**
```
Pie Chart
Segments: Tutorial (35%), Review (25%), Lifestyle (20%), Other (20%)
Data: Content classification from Claude analysis
Insight: "Tutorials drive 40% more engagement"
```

---

## 🏗️ DATABASE SCHEMA

### **Tables Created:**

#### **1. gv_hub_collections**
**Purpose:** Group content by category/topic (container for 3 tabs)

**Columns:**
- `id` - UUID
- `category` - TEXT (beauty, fashion, fnb, etc.)
- `title` - TEXT (collection title)
- `description` - TEXT
- `tab_embeds_enabled` - BOOLEAN (default: true)
- `tab_articles_enabled` - BOOLEAN (default: true)
- `tab_charts_enabled` - BOOLEAN (default: true)
- `status` - TEXT (draft/published/archived)
- `daily_target` - INTEGER (4-8 per day)

**Goal:** 4-8 collections per day per category

---

#### **2. gv_hub_embedded_content**
**Purpose:** Store social media embeds (Tab 1)

**Updated Columns:**
- `collection_id` - UUID (link to collection)
- `display_order` - INTEGER (order within collection)
- `platform` - TEXT (tiktok/instagram/youtube)
- `embed_url` - TEXT
- `embed_code` - TEXT
- `relevance_score` - NUMERIC(3,2)

---

#### **3. gv_hub_articles**
**Purpose:** AI-generated articles (Tab 2)

**Updated Columns:**
- `collection_id` - UUID (link to collection)
- `article_type` - TEXT (hot/review/education/nice_to_know)
- `word_count` - INTEGER (200-500 constraint)
- `content_markdown` - TEXT
- `content_html` - TEXT
- `reading_time_minutes` - INTEGER
- `neutrality_score` - NUMERIC(3,2)
- `authority_score` - NUMERIC(3,2)

---

#### **4. gv_hub_charts**
**Purpose:** Data visualizations (Tab 3)

**Columns:**
- `id` - UUID
- `collection_id` - UUID (link to collection)
- `chart_type` - TEXT (line/bar/pie/area/scatter/heatmap)
- `title` - TEXT
- `subtitle` - TEXT
- `chart_data` - JSONB (labels, datasets, values)
- `chart_config` - JSONB (styling, options)
- `key_insight` - TEXT (one-liner insight)
- `insight_summary` - TEXT (detailed explanation)

**Example chart_data:**
```json
{
  "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
  "datasets": [{
    "label": "Engagement Rate",
    "data": [4.2, 4.5, 4.8, 5.1],
    "borderColor": "#16a34a",
    "backgroundColor": "rgba(22, 163, 74, 0.1)"
  }]
}
```

---

#### **5. gv_hub_chart_templates**
**Purpose:** Pre-defined chart templates

**Columns:**
- `template_name` - TEXT (unique)
- `chart_type` - TEXT
- `data_query` - TEXT (SQL query template)
- `config_template` - JSONB
- `category` - TEXT

**Pre-installed Templates:**
- `engagement_trend` - Line chart of 30-day engagement rate
- `top_creators_by_reach` - Bar chart of top 10 creators
- `content_type_distribution` - Pie chart of content types

---

## 🚀 EDGE FUNCTIONS (To Be Built)

### **1. hub-discover-content** (Perplexity)
**Purpose:** Find trending topics and relevant content

**Input:**
```json
{
  "category": "beauty",
  "article_type": "hot",
  "count": 10
}
```

**Process:**
1. Perplexity search: "What's trending in [category] this week?"
2. Get top topics/hashtags
3. Query `gv_creator_content` for relevant posts
4. Score by engagement + recency
5. Return top 10 posts

**Output:**
```json
{
  "topic": "K-Beauty Glass Skin",
  "trending_score": 0.92,
  "content_ids": ["uuid1", "uuid2", ...],
  "keywords": ["glass skin", "korean skincare", "dewy"],
  "estimated_reach": 5200000
}
```

---

### **2. hub-generate-article** (Claude + OpenAI)
**Purpose:** Generate 200-500 word article from embeds

**Input:**
```json
{
  "collection_id": "uuid",
  "article_type": "hot",
  "content_ids": ["uuid1", "uuid2", ...],
  "target_words": 350
}
```

**Process:**

**Step 1: Claude Reverse Engineering**
```
Analyze these 5-10 videos/posts:
1. Extract key insights, quotes, tips
2. Identify common themes
3. Find unique angles
4. Detect expertise level
5. Note brand mentions

Return structured insights for article writing.
```

**Step 2: OpenAI Article Writing**
```
Write a 350-word "HOT" article about [topic].

Requirements:
- Hook in first 2 sentences
- Natural language (not AI-sounding)
- Grade 8-10 reading level
- Short paragraphs (2-3 sentences)
- Include 2-3 bullet points
- Neutral tone
- End with key takeaway

Based on insights:
[Claude analysis output]

Target audience: General consumers interested in [category]
```

**Step 3: Quality Check**
- Word count: 200-500 ✓
- Readability score: >60 ✓
- Neutrality score: >0.75 ✓
- No brand bias: ✓

**Output:**
```json
{
  "article_id": "uuid",
  "title": "Everyone's Talking About Glass Skin - Here's Why",
  "content_html": "<p>...</p>",
  "word_count": 347,
  "reading_time": 2,
  "neutrality_score": 0.88
}
```

---

### **3. hub-generate-charts** (SQL + Chart.js)
**Purpose:** Create Statista-inspired visualizations

**Input:**
```json
{
  "collection_id": "uuid",
  "category": "beauty",
  "templates": ["engagement_trend", "top_creators_by_reach"]
}
```

**Process:**
1. For each template:
   - Execute data query from `gv_hub_chart_templates`
   - Transform results to chart data format
   - Apply chart config template
   - Generate key insight
2. Save to `gv_hub_charts`

**Output:**
```json
{
  "charts": [
    {
      "id": "uuid",
      "type": "line",
      "title": "Engagement Rate Trend (30 Days)",
      "data": {...},
      "insight": "Engagement increased 15% this month, driven by tutorial content"
    }
  ]
}
```

---

### **4. hub-create-collection** (Orchestrator)
**Purpose:** Create complete collection (all 3 tabs)

**Input:**
```json
{
  "category": "beauty",
  "daily_batch": true
}
```

**Process:**
1. Discover trending content (Perplexity)
2. Select 5-10 best embeds
3. Create collection record
4. Add embeds to collection (Tab 1)
5. Generate 1 article per type:
   - Hot (trending)
   - Review (if relevant)
   - Education (how-to)
   - Nice to Know (insights)
6. Generate 3-5 charts (Tab 3)
7. Publish collection

**Output:**
```json
{
  "collection_id": "uuid",
  "category": "beauty",
  "status": "published",
  "tabs": {
    "embeds": 7,
    "articles": 4,
    "charts": 4
  }
}
```

---

## 🎨 UI DESIGN SPEC

### **Homepage (Public)**

```
┌─────────────────────────────────────────────────┐
│  GEOVERA AUTHORITY HUB                          │
│  Making Social Media Simple                     │
├─────────────────────────────────────────────────┤
│  [Beauty] [Fashion] [FNB] [Health] [FMCG]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Featured Collection                            │
│  ┌───────────────────────────────────────────┐ │
│  │  [Large Image]                            │ │
│  │  "Glass Skin: What Top Creators Are Using"│ │
│  │  7 Embeds • 4 Articles • 4 Charts         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Latest Collections                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Card 1  │ │ Card 2  │ │ Card 3  │          │
│  │ 5 Embeds│ │ 6 Embeds│ │ 7 Embeds│          │
│  │ 3 Articl│ │ 4 Articl│ │ 4 Articl│          │
│  │ 3 Charts│ │ 4 Charts│ │ 3 Charts│          │
│  └─────────┘ └─────────┘ └─────────┘          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **Collection Page (3 Tabs)**

```
┌─────────────────────────────────────────────────┐
│  Glass Skin: What Top Creators Are Using        │
│  Category: Beauty • Published: 2 hours ago      │
├─────────────────────────────────────────────────┤
│  [📺 EMBEDS] [📝 ARTICLES] [📊 CHARTS]          │
├─────────────────────────────────────────────────┤
│                                                 │
│  TAB 1: EMBEDS (Active)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ TikTok 1 │ │ Insta 1  │ │ YouTube 1│        │
│  │ @creator │ │ @creator │ │ @creator │        │
│  │ 2.5M 👁️  │ │ 500K 👁️  │ │ 1.2M 👁️  │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ TikTok 2 │ │ YouTube 2│ │ Insta 2  │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  7 curated videos from top creators             │
└─────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────┐
│  [📺 EMBEDS] [📝 ARTICLES] [📊 CHARTS]          │
├─────────────────────────────────────────────────┤
│                                                 │
│  TAB 2: ARTICLES (Active)                       │
│                                                 │
│  🔥 HOT                                         │
│  ┌───────────────────────────────────────────┐ │
│  │ Everyone's Talking About Glass Skin       │ │
│  │ 2 min read • 347 words                    │ │
│  │                                           │ │
│  │ [Article preview...]                      │ │
│  │ [Read More →]                             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🔍 REVIEW                                      │
│  ┌───────────────────────────────────────────┐ │
│  │ 5 Creators Tried This Serum - Results    │ │
│  │ 3 min read • 428 words                    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  🎓 EDUCATION                                   │
│  ┌───────────────────────────────────────────┐ │
│  │ How to Get Glass Skin: Step-by-Step      │ │
│  │ 3 min read • 485 words                    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💡 NICE TO KNOW                                │
│  ┌───────────────────────────────────────────┐ │
│  │ What Top Creators Know About Hydration   │ │
│  │ 2 min read • 312 words                    │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────┐
│  [📺 EMBEDS] [📝 ARTICLES] [📊 CHARTS]          │
├─────────────────────────────────────────────────┤
│                                                 │
│  TAB 3: CHARTS (Active)                         │
│                                                 │
│  📈 Engagement Rate Trend (30 Days)             │
│  ┌───────────────────────────────────────────┐ │
│  │        [LINE CHART]                       │ │
│  │    5.0%                    ●              │ │
│  │    4.5%              ●                    │ │
│  │    4.0%        ●                          │ │
│  │    3.5%  ●                                │ │
│  │    ──────────────────────────────────     │ │
│  │    Week 1  Week 2  Week 3  Week 4        │ │
│  └───────────────────────────────────────────┘ │
│  💡 Engagement increased 15% this month        │
│                                                 │
│  📊 Top 10 Creators by Reach                    │
│  ┌───────────────────────────────────────────┐ │
│  │ @creator1    ██████████████████ 2.5M     │ │
│  │ @creator2    ███████████████ 2.1M        │ │
│  │ @creator3    ████████████ 1.8M           │ │
│  │ @creator4    ██████████ 1.5M             │ │
│  │ @creator5    ████████ 1.2M               │ │
│  └───────────────────────────────────────────┘ │
│  💡 Top 5 creators account for 60% of reach    │
│                                                 │
│  🥧 Content Type Distribution                   │
│  ┌───────────────────────────────────────────┐ │
│  │        [PIE CHART]                        │ │
│  │      Tutorial 35%                         │ │
│  │      Review 25%                           │ │
│  │      Lifestyle 20%                        │ │
│  │      Other 20%                            │ │
│  └───────────────────────────────────────────┘ │
│  💡 Tutorials drive 40% more engagement        │
└─────────────────────────────────────────────────┘
```

---

## 📅 DAILY WORKFLOW

### **Goal: 4-8 Collections Per Day Per Category**

**Morning (6 AM):**
1. Run `hub-discover-content` for all 6 categories
2. Queue 6-8 collection generation jobs
3. Priority: Categories with least recent content

**Afternoon (12 PM):**
1. Process generation queue
   - Generate embeds
   - Generate articles (all 4 types)
   - Generate charts
2. Quality check (neutrality, word count)

**Evening (6 PM):**
1. Publish approved collections
2. Update analytics
3. Queue tomorrow's batch

**Output:**
- **24-48 collections/day** (4-8 per category × 6 categories)
- **96-192 articles/day** (4 per collection)
- **120-240 charts/day** (5 per collection)

---

## 💰 COST ESTIMATION

| Component | Per Collection | Daily (30 collections) | Monthly |
|-----------|---------------|------------------------|---------|
| **Perplexity Discovery** | $0.005 | $0.15 | $4.50 |
| **Claude Analysis** | $0.03 | $0.90 | $27.00 |
| **OpenAI Article Writing** | $0.08 (4 articles) | $2.40 | $72.00 |
| **Chart Generation** | $0.00 (SQL queries) | $0.00 | $0.00 |
| **TOTAL** | **$0.115** | **$3.45** | **$103.50** |

**With Optimization:**
- Batch processing: -20%
- Prompt caching: -30%
- **Optimized Monthly Cost: ~$72/month**

---

## ✅ SUCCESS METRICS

**Quantity:**
- ✅ 4-8 collections/day per category
- ✅ 24-48 collections/day total
- ✅ 96-192 articles/day

**Quality:**
- ✅ 200-500 words per article
- ✅ 90%+ neutrality score
- ✅ <Grade 10 reading level
- ✅ 5-10 embeds per collection
- ✅ 3-5 charts per collection

**Engagement (Goals):**
- 🎯 10K+ monthly visitors
- 🎯 3+ min average time on page
- 🎯 30%+ return visitor rate

---

## 🚀 NEXT STEPS

1. ✅ **Database Schema** - Complete!
2. ⏳ **Edge Functions** - Build 4 functions
3. ⏳ **Frontend UI** - 3-tab interface
4. ⏳ **Test Generation** - 1 collection per category
5. ⏳ **Launch Beta** - geovera.xyz/hub

**Timeline:** 1-2 weeks to MVP

---

**All schema deployed and ready for function development!** 🚀
