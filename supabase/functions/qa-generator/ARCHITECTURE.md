# QA Generator - System Architecture

Complete architecture diagram and data flow for the 1500 QA Generation system.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QA GENERATOR SYSTEM                                  │
│                    (1500 QA Pairs per Category)                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │   Monthly    │
                                    │  Cron Job    │
                                    └──────┬───────┘
                                           │
                                           ▼
                        ┌─────────────────────────────────┐
                        │   qa-generator Edge Function    │
                        │  (Claude 3.5 Sonnet)            │
                        └─────────────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
            │   SOCIAL    │       │     GEO     │       │     SEO     │
            │   600 QA    │       │   500 QA    │       │   400 QA    │
            │   (40%)     │       │   (33%)     │       │   (27%)     │
            └─────────────┘       └─────────────┘       └─────────────┘
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                                           ▼
                                ┌────────────────────┐
                                │  gv_qa_pairs table │
                                │   (1500 records)   │
                                └────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
            │   Brand A   │       │   Brand B   │       │   Brand C   │
            │  Selects QA │       │  Selects QA │       │  Selects QA │
            │  Based on   │       │  Based on   │       │  Based on   │
            │ Sub-Category│       │ Sub-Category│       │ Sub-Category│
            └─────────────┘       └─────────────┘       └─────────────┘
```

## Data Flow

### 1. Generation Phase

```
Input: category_id
    │
    ├─ Fetch Category Data (gv_categories)
    │  └─ name, slug, description
    │
    ├─ Fetch Sub-Categories (gv_sub_categories)
    │  └─ name, slug, keywords[]
    │
    ├─ Build Claude Prompt
    │  ├─ Category context
    │  ├─ Sub-category keywords
    │  ├─ Platform distribution rules
    │  └─ NLP optimization guidelines
    │
    ├─ Claude API Call
    │  ├─ Model: claude-3-5-sonnet-20241022
    │  ├─ Input tokens: ~10,000
    │  ├─ Output tokens: ~30,000
    │  └─ Cost: $0.48
    │
    ├─ Parse Response
    │  ├─ Extract JSON array
    │  ├─ Validate structure
    │  └─ Filter invalid QA
    │
    ├─ Store in Database (gv_qa_pairs)
    │  ├─ Batch insert (1000 per batch)
    │  ├─ Set expires_at (+30 days)
    │  └─ Set quality_score
    │
    └─ Return Summary
       ├─ QA pairs generated: 1500
       ├─ Distribution breakdown
       ├─ Cost: $0.48
       └─ Expiration date
```

### 2. Selection Phase (Brand-Specific)

```
Input: brand_id
    │
    ├─ Fetch Brand Data (gv_brands)
    │  └─ category_id, sub_category, tier
    │
    ├─ Query QA Pairs (gv_qa_pairs)
    │  ├─ Filter: category_id = brand.category_id
    │  ├─ Filter: expires_at > NOW()
    │  ├─ Prioritize: sub_category match
    │  └─ Sort: quality_score DESC
    │
    ├─ Tier-Based Allocation
    │  ├─ Growth: 50 QA
    │  ├─ Scale: 100 QA
    │  └─ Enterprise: 200 QA
    │
    └─ Return Selected QA
       ├─ Sub-category matched
       ├─ General category
       └─ Platform breakdown
```

### 3. Platform Distribution Phase

```
1500 QA Pairs
    │
    ├─ SOCIAL (600 - 40%)
    │  ├─ TikTok (250)
    │  │  ├─ Unboxing videos
    │  │  ├─ Honest reviews
    │  │  ├─ Comparisons
    │  │  └─ Viral challenges
    │  │
    │  ├─ Instagram (200)
    │  │  ├─ Transformations
    │  │  ├─ Tutorials
    │  │  ├─ Tips & tricks
    │  │  └─ Before/after
    │  │
    │  └─ YouTube (150)
    │     ├─ Detailed reviews
    │     ├─ Full guides
    │     ├─ Comparisons
    │     └─ Pros and cons
    │
    ├─ GEO (500 - 33%)
    │  ├─ Direct queries (150)
    │  │  ├─ "what is X"
    │  │  └─ "top X brands"
    │  │
    │  ├─ Recommendations (125)
    │  │  ├─ "recommend X for Y"
    │  │  └─ "which X should I buy"
    │  │
    │  ├─ Knowledge (125)
    │  │  ├─ "how does X work"
    │  │  └─ "is X safe"
    │  │
    │  └─ Comparisons (100)
    │     ├─ "X vs Y which is better"
    │     └─ "difference between X and Y"
    │
    └─ SEO (400 - 27%)
       ├─ Informational (150)
       │  ├─ "how to choose X"
       │  ├─ "benefits of X"
       │  └─ "X guide for beginners"
       │
       ├─ Commercial (100)
       │  ├─ "buy X online"
       │  ├─ "X price comparison"
       │  └─ "best X deals"
       │
       ├─ Comparison (80)
       │  ├─ "X vs Y detailed comparison"
       │  ├─ "X alternative"
       │  └─ "better than X"
       │
       └─ Local SEO (70)
          ├─ "X Jakarta"
          ├─ "where to buy X in Indonesia"
          └─ "X near me"
```

## Database Schema

```sql
┌─────────────────────────────────────────────────────────────┐
│                      gv_categories                           │
├──────────────┬──────────────────────────────────────────────┤
│ id           │ UUID (PK)                                    │
│ name         │ TEXT (Beauty & Skincare)                     │
│ slug         │ TEXT (beauty_skincare)                       │
│ description  │ TEXT                                         │
│ priority_tier│ INTEGER                                      │
│ active       │ BOOLEAN                                      │
└──────────────┴──────────────────────────────────────────────┘
                              │
                              │ has many
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    gv_sub_categories                         │
├──────────────┬──────────────────────────────────────────────┤
│ id           │ UUID (PK)                                    │
│ category_id  │ UUID (FK → gv_categories)                    │
│ name         │ TEXT (Skincare)                              │
│ slug         │ TEXT (skincare)                              │
│ keywords     │ TEXT[] ([moisturizer, serum, ...])           │
│ active       │ BOOLEAN                                      │
└──────────────┴──────────────────────────────────────────────┘
                              │
                              │ referenced by
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       gv_qa_pairs                            │
├──────────────┬──────────────────────────────────────────────┤
│ id           │ UUID (PK)                                    │
│ category_id  │ UUID (FK → gv_categories)                    │
│ question     │ TEXT                                         │
│ answer       │ TEXT                                         │
│ platform     │ TEXT (seo/geo/social)                        │
│ sub_category │ TEXT (skincare)                              │
│ keywords     │ TEXT[] ([skincare, routine, ...])            │
│ quality_score│ DECIMAL(3,2) (0.00-1.00)                     │
│ used_count   │ INTEGER (tracking)                           │
│ generated_at │ TIMESTAMPTZ                                  │
│ expires_at   │ TIMESTAMPTZ (+30 days)                       │
│ created_at   │ TIMESTAMPTZ                                  │
└──────────────┴──────────────────────────────────────────────┘
                              │
                              │ selected by
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        gv_brands                             │
├──────────────┬──────────────────────────────────────────────┤
│ id           │ UUID (PK)                                    │
│ category_id  │ UUID (FK → gv_categories)                    │
│ sub_category │ TEXT (skincare)                              │
│ tier         │ TEXT (growth/scale/enterprise)               │
│ active       │ BOOLEAN                                      │
└──────────────┴──────────────────────────────────────────────┘
```

## Component Architecture

### Edge Function Components

```
qa-generator/index.ts
├─ ClaudeQAGenerator
│  ├─ generate1500QAPairs()
│  │  ├─ Fetches category data
│  │  ├─ Fetches sub-categories
│  │  ├─ Builds prompt
│  │  └─ Calls Claude API
│  │
│  ├─ buildPrompt()
│  │  ├─ Category context
│  │  ├─ Sub-category keywords
│  │  ├─ Platform distribution rules
│  │  ├─ NLP optimization guidelines
│  │  └─ Quality scoring criteria
│  │
│  └─ parseQAPairs()
│     ├─ Extracts JSON
│     ├─ Validates structure
│     └─ Filters invalid entries
│
├─ QAStorage
│  ├─ saveQAPairs()
│  │  ├─ Batch insert (1000/batch)
│  │  ├─ Sets expiration
│  │  └─ Handles errors
│  │
│  ├─ checkExistingQA()
│  │  └─ Prevents duplicates
│  │
│  └─ deleteExpiredQA()
│     └─ Cleanup old QA
│
└─ Main Handler
   ├─ CORS handling
   ├─ Authentication
   ├─ Request validation
   ├─ Error handling
   └─ Response formatting
```

## NLP Optimization Pipeline

```
Category Data → Claude Analysis → Platform Optimization → QA Generation
     │                  │                    │                    │
     │                  │                    │                    │
     ▼                  ▼                    ▼                    ▼
┌─────────┐      ┌──────────┐       ┌──────────┐       ┌──────────┐
│Category │      │ Human    │       │Platform  │       │  Final   │
│Context  │──────▶Behavior  │───────▶Specific  │───────▶  QA      │
│         │      │ Analysis │       │  NLP     │       │  Pairs   │
└─────────┘      └──────────┘       └──────────┘       └──────────┘
     │                  │                    │                    │
     │                  │                    │                    │
Sub-Categories   Search Intent      Keywords, Hooks       Quality Score
Keywords List    User Expectations  Engagement Triggers   Sub-Category Tag
Description      Platform Behavior  Authority Signals     Expiration Date
```

## Quality Scoring Algorithm

```
Quality Score = Weighted Sum of:
├─ Answer Completeness (30%)
│  ├─ Length appropriate for platform
│  ├─ All aspects covered
│  └─ Actionable information
│
├─ Factual Accuracy (25%)
│  ├─ Verifiable facts
│  ├─ Current information (2026)
│  └─ No contradictions
│
├─ Platform Optimization (20%)
│  ├─ Social: Viral hooks, engagement triggers
│  ├─ GEO: Authority signals, citations
│  └─ SEO: Keywords, semantic relevance
│
├─ Keyword Relevance (15%)
│  ├─ Matches sub-category keywords
│  ├─ Target audience language
│  └─ Search intent alignment
│
└─ User Value (10%)
   ├─ Solves real problem
   ├─ Clear and concise
   └─ Immediately actionable
```

## Cost Structure

```
Single Category Generation:
├─ Claude API Call
│  ├─ Input tokens: ~10,000
│  ├─ Output tokens: ~30,000
│  ├─ Model: claude-3-5-sonnet-20241022
│  └─ Cost: $0.48
│
└─ Database Storage
   ├─ 1500 records
   └─ Negligible cost

Monthly Fixed Cost (4 Categories):
├─ Category 1: $0.48
├─ Category 2: $0.48
├─ Category 3: $0.48
├─ Category 4: $0.48
└─ Total: $1.92/month

Annual Cost:
├─ Monthly: $1.92
├─ Annual: $23.04
└─ QA Pairs: 72,000/year
```

## Integration Points

```
Application Layer
├─ Monthly Cron Job
│  └─ Triggers qa-generator for all categories
│
├─ Brand Dashboard
│  ├─ QA Library page
│  ├─ Platform Content Selector
│  └─ Sub-Category Filter
│
├─ Content Generation
│  ├─ Social post generator
│  ├─ SEO article writer
│  └─ GEO optimization
│
└─ Analytics
   ├─ QA usage tracking
   ├─ Quality score monitoring
   └─ Platform distribution analysis
```

## Performance Metrics

```
Generation Speed:
├─ Claude API call: ~30-45 seconds
├─ Database insert: ~5-10 seconds
└─ Total: ~40-60 seconds per category

Storage:
├─ Per QA pair: ~2-5 KB
├─ 1500 QA pairs: ~3-7.5 MB
└─ 4 categories: ~12-30 MB total

Query Performance:
├─ Platform filter: <100ms
├─ Sub-category filter: <100ms
├─ Quality sort: <100ms
└─ Combined: <200ms
```

## Scalability

```
Current: 4 Categories
├─ QA pairs: 6,000
├─ Monthly cost: $1.92
└─ Storage: ~12-30 MB

Scale to 10 Categories:
├─ QA pairs: 15,000
├─ Monthly cost: $4.80
└─ Storage: ~30-75 MB

Scale to 20 Categories:
├─ QA pairs: 30,000
├─ Monthly cost: $9.60
└─ Storage: ~60-150 MB
```

## Monitoring & Alerts

```
Monitor:
├─ Generation success rate
├─ Distribution accuracy (40/33/27)
├─ Quality score average
├─ API costs
└─ Storage usage

Alert on:
├─ Generation failure
├─ Distribution variance > 10%
├─ Quality score < 0.75 average
├─ Cost spike > 20%
└─ Storage > 80% capacity
```

---

This architecture ensures efficient, scalable, and cost-effective generation of 1500 high-quality QA pairs per category, fully aligned with the SEO_GEO_FIXED_VARIABLE_MODEL.md specifications.
