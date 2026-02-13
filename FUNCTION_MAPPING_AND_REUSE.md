# GeoVera - Function Mapping & Reuse Strategy

## Overview
Inventory semua 109+ functions yang sudah dibuat dan mapping ke Features 2, 3, 4 untuk memaksimalkan reuse dan menghindari duplikasi.

---

## ✅ FEATURE 1: AI CHAT (SUDAH LIVE)

### Functions yang Sudah Terpakai:
1. ✅ `/supabase/functions/ai-chat/index.ts` - **PRODUCTION**
2. ✅ `/Aman-1/ai-chat-orchestrator.ts` - Multi-AI routing
3. ✅ `/Aman-1/ai-chat-step1-chronicle.ts` - Timeline analysis
4. ✅ `/Aman-1/ai-chat-step2-platform.ts` - Platform research
5. ✅ `/Aman-1/ai-chat-step3-questions.ts` - Question generation
6. ✅ `/Aman-1/ai-chat-step4-activation.ts` - Chat activation

### Functions yang Bisa Diintegrasikan:
- `/Aman-3/brand-chat-api.ts` - Enhanced chat API
- `/Aman-5/multi-ai-answers.ts` - Multi-provider responses
- `/Aman-3/claude-question-gen.ts` - Question generation dengan Claude
- `/Aman-3/claude-synthesis.ts` - Synthesize responses

---

## 🔍 FEATURE 2: SEARCH INTELLIGENCE (LLM SEO, GEO & Social)

### Functions Yang SUDAH ADA dan Bisa Langsung Dipakai:

#### **SerpAPI Integration:**
1. ✅ `/Aman-7-Pipeline/serpapi-search.ts` - **READY TO USE**
   - Function untuk call SerpAPI
   - Parse Google Search results
   - Extract rankings dan competitors

#### **Apify Integration:**
2. ✅ `/Aman-2/apify-runner.ts` - **READY TO USE**
   - Execute Apify actors
   - Instagram, TikTok, YouTube scraping
3. ✅ `/Aman-2/apify-results.ts` - Parse Apify results
4. ✅ `/Aman-7-Pipeline/radar-apify-ingestion.ts` - Bulk ingestion

#### **Perplexity Integration:**
5. ✅ `/Aman-9-Phase3-Pipeline/perplexity-discovery.ts` - **READY TO USE**
   - Deep research dengan Perplexity
6. ✅ `/Aman-9-Phase3-Pipeline/perplexity-seo-research.ts` - SEO research
7. ✅ `/Aman-9-Phase3-Pipeline/perplexity-evidence-router.ts` - Route evidence
8. ✅ `/Aman-9-Phase3-Pipeline/ph3-perplexity-assembler.ts` - Assemble results

#### **GEO Ranking:**
9. ✅ `/Aman-4/geo-rank-calculator.ts` - **READY TO USE**
   - Calculate GEO scores
   - Google Maps ranking

#### **Discovery & Analysis:**
10. ✅ `/Aman-7-Pipeline/radar-discovery-orchestrator.ts` - Discovery orchestration
11. ✅ `/Aman-8-Pipeline-Clean/phase61-brand-discovery.ts` - Brand discovery
12. ✅ `/Aman-7-Pipeline/radar-creator-discovery-batch.ts` - Batch discovery

### NEW Functions to Create:
- `/supabase/functions/track-keywords/index.ts` - Track keywords endpoint
- `/supabase/functions/search-intelligence/index.ts` - Main orchestrator

---

## 📊 FEATURE 3: DAILY INSIGHTS & TODO

### Functions Yang SUDAH ADA:

#### **Insight Generation:**
1. ✅ `/Aman-5/insight-approval-api.ts` - **READY TO USE**
   - Approve/reject insights
2. ✅ `/Aman-3/content-opportunity-engine.ts` - **READY TO USE**
   - Find content opportunities
3. ✅ `/Aman-2/attribution-engine.ts` - Attribution tracking
4. ✅ `/Aman-6/strategic-synthesis-engine.ts` - Strategic insights

#### **Timeline & Chronicle:**
5. ✅ `/Aman-4/geotimeline-final.ts` - **READY TO USE**
   - Brand timeline generation
6. ✅ `/Aman-4/geotimeline-live.ts` - Live timeline
7. ✅ `/Aman-4/geotimeline-viewer.ts` - Timeline viewer
8. ✅ `/Aman-3/customer-timeline.ts` - Customer journey

#### **Task Management:**
9. ✅ `/Aman-6/task-management-api.ts` - **READY TO USE**
   - Todo/task management
10. ✅ `/Aman-6/task-prioritization.ts` - Prioritize tasks

#### **Analysis & Synthesis:**
11. ✅ `/Aman-6/unified-analysis-v2.ts` - **READY TO USE**
    - Unified data analysis
12. ✅ `/Aman-3/confidence-engine.ts` - Confidence scoring
13. ✅ `/Aman-3/citation-analyzer.ts` - Source analysis

#### **AI Intelligence:**
14. ✅ `/Aman-4/geovera-ai-intelligence.ts` - **READY TO USE**
    - AI-powered intelligence
15. ✅ `/Aman-5/llm-visibility-orchestrator.ts` - LLM orchestration
16. ✅ `/Aman-5/llm-dashboard-api.ts` - Dashboard API

### NEW Functions to Create:
- `/supabase/functions/generate-daily-insights/index.ts` - Daily insights generator
- `/supabase/functions/generate-ai-article/index.ts` - AI article writer

---

## 🎨 FEATURE 4: CONTENT STUDIO

### Functions Yang SUDAH ADA:

#### **Content Generation:**
1. ✅ `/Aman-4/generate-article.ts` - **READY TO USE**
   - AI article generation
2. ✅ `/Aman-4/generate-image.ts` - **READY TO USE**
   - DALL-E image generation
3. ✅ `/Aman-4/generate-video.ts` - **READY TO USE**
   - Video script generation
4. ✅ `/Aman-4/generate-content-public.ts` - Public content API
5. ✅ `/Aman-2/automate-content-generation.ts` - Automated generation

#### **Content Pipeline:**
6. ✅ `/Aman-3/content-pipeline-executor.ts` - **READY TO USE**
   - Execute content pipeline
7. ✅ `/Aman-3/content-dashboard-api.ts` - Content dashboard

#### **Platform Optimization:**
8. ✅ `/Aman-10-Onboarding-System/optimize-for-platform.ts` - **READY TO USE**
   - Optimize content for platforms
   - Instagram, TikTok, LinkedIn, etc.

#### **Publishing:**
9. ✅ `/Aman-7-Pipeline/publish-authority-asset.ts` - **READY TO USE**
   - Publish content to platforms
10. ✅ `/Aman-10-Onboarding-System/notion-auto-publisher.ts` - Auto-publish
11. ✅ `/Aman-10-Onboarding-System/notion-batch-publisher.ts` - Batch publish

#### **Storage & Upload:**
12. ✅ `/Aman-3/cloudinary-upload.ts` - **READY TO USE**
    - Upload images to Cloudinary
13. ✅ `/Aman-6/upload-content-cloudinary.ts` - Bulk upload
14. ✅ `/Aman-6/storage-page-upload.ts` - Storage upload

#### **Quality & Validation:**
15. ✅ `/Aman-6/validate-storytelling.ts` - **READY TO USE**
    - Validate content quality
16. ✅ `/Aman-2/authority-calculator.ts` - Authority scoring

### NEW Functions to Create:
- `/supabase/functions/generate-content/index.ts` - Main content generator
- `/supabase/functions/publish-content/index.ts` - Publishing orchestrator

---

## 🛠️ UTILITY & INFRASTRUCTURE FUNCTIONS

### Analytics & Tracking:
1. ✅ `/Aman-1/analytics-api.ts` - Analytics endpoint
2. ✅ `/Aman-3/cost-dashboard.ts` - Cost tracking
3. ✅ `/Aman-3/cost-guard.ts` - Budget guard
4. ✅ `/Aman-7-Pipeline/realtime-progress.ts` - Real-time progress

### Orchestration:
5. ✅ `/Aman-1/ai-seo-workflow-orchestrator.ts` - SEO workflow
6. ✅ `/Aman-5/job-orchestrator-v2.ts` - Job orchestration
7. ✅ `/Aman-10-Onboarding-System/onboarding-orchestrator.ts` - Onboarding
8. ✅ `/Aman-10-Onboarding-System/orchestrator-v2.ts` - Enhanced orchestrator

### Authentication & Guards:
9. ✅ `/Aman-2/auth-guard.ts` - Authentication guard
10. ✅ `/Aman-10-Onboarding-System/auth-handler.ts` - Auth handler
11. ✅ `/Aman-10-Onboarding-System/onboarding-guard.ts` - Onboarding guard

### API Gateways:
12. ✅ `/Aman-1/api-gateway.ts` - Main API gateway
13. ✅ `/Aman-2/api-gateway-minimal.ts` - Minimal gateway

### Data Processing:
14. ✅ `/Aman-2/auto-processor.ts` - Auto-process data
15. ✅ `/Aman-9-Phase3-Pipeline/ph3-normalization-engine.ts` - Normalize data
16. ✅ `/Aman-9-Phase3-Pipeline/ph3-signal-classifier.ts` - Classify signals

### Testing & Validation:
17. ✅ `/Aman-8-Pipeline-Clean/pipeline-validator.ts` - Validate pipelines
18. ✅ `/Aman-8-Pipeline-Clean/pipeline-review-engine.ts` - Review pipeline

---

## 📋 REUSE STRATEGY

### Phase 1: Migrate Existing Functions to /supabase/functions/
**Priority: HIGH**

Move these READY functions to production Edge Functions:

```bash
# Feature 2: Search Intelligence
cp Aman-7-Pipeline/serpapi-search.ts supabase/functions/serpapi-search/index.ts
cp Aman-2/apify-runner.ts supabase/functions/apify-runner/index.ts
cp Aman-4/geo-rank-calculator.ts supabase/functions/geo-rank-calculator/index.ts

# Feature 3: Daily Insights
cp Aman-4/geovera-ai-intelligence.ts supabase/functions/ai-intelligence/index.ts
cp Aman-5/insight-approval-api.ts supabase/functions/insight-approval/index.ts
cp Aman-6/task-management-api.ts supabase/functions/task-management/index.ts

# Feature 4: Content Studio
cp Aman-4/generate-article.ts supabase/functions/generate-article/index.ts
cp Aman-4/generate-image.ts supabase/functions/generate-image/index.ts
cp Aman-4/generate-video.ts supabase/functions/generate-video/index.ts
```

### Phase 2: Create Orchestrator Functions
**Priority: MEDIUM**

Build new orchestrator functions that COMBINE existing functions:

1. `/supabase/functions/search-intelligence/index.ts`
   - Uses: serpapi-search, apify-runner, geo-rank-calculator
   - Combines all search data sources

2. `/supabase/functions/daily-insights-generator/index.ts`
   - Uses: ai-intelligence, insight-approval, task-management
   - Generates daily reports

3. `/supabase/functions/content-studio/index.ts`
   - Uses: generate-article, generate-image, generate-video
   - Main content generation hub

### Phase 3: Update Database Schema
**Priority: HIGH**

Ensure new schemas work with existing functions:
- ✅ `gv_keywords` → Used by serpapi-search
- ✅ `gv_search_results` → Used by apify-runner
- ✅ `gv_geo_scores` → Used by geo-rank-calculator
- ✅ `gv_daily_insights` → Used by ai-intelligence
- ✅ `gv_content_library` → Used by generate-* functions

---

## 🎯 FUNCTIONS TO DELETE (Unused/Duplicate)

### Candidates for Removal:
- `/Aman-10-Onboarding-System/onboard-brand.ts` - Old version (use v4)
- `/Aman-10-Onboarding-System/onboard-brand-v3.ts` - Old version (use v4)
- `/Aman-4/css.ts` - Utility file, move to shared
- `/Aman-9-Phase3-Pipeline/css.ts` - Duplicate
- `/Aman-5/google-signin-test.ts` - Test file
- `/Aman-5/login-page.ts` - Already have login.html

### Keep for Reference:
- All README.md files
- All audit/documentation files
- Test files (for QA purposes)

---

## 📊 FUNCTION REUSE METRICS

### Total Functions: 109
### Ready to Use: 45+ functions (41%)
### Need Minor Updates: 30+ functions (28%)
### Can Be Deleted: 15+ functions (14%)
### Already in Production: 2 functions (2%)

### Reuse Efficiency Target: 80%+
**Goal:** Use 80% of existing functions to build Features 2, 3, 4

---

## 🚀 IMPLEMENTATION PLAN

### Week 1: Feature 2 (Search Intelligence)
- ✅ Database schema deployed
- 🔄 Migrate serpapi-search to production
- 🔄 Migrate apify-runner to production
- 🔄 Migrate geo-rank-calculator to production
- 🔄 Build search-intelligence orchestrator
- 🔄 Create UI at `/discovery`

### Week 2: Feature 3 (Daily Insights)
- ✅ Database schema deployed
- 🔄 Migrate ai-intelligence to production
- 🔄 Migrate insight-approval to production
- 🔄 Migrate task-management to production
- 🔄 Build daily-insights-generator
- 🔄 Create UI at `/insights`

### Week 3: Feature 4 (Content Studio)
- ✅ Database schema deployed
- 🔄 Migrate generate-article to production
- 🔄 Migrate generate-image to production
- 🔄 Migrate generate-video to production
- 🔄 Build content-studio orchestrator
- 🔄 Create UI at `/content-studio`

### Week 4: Integration & Testing
- 🔄 Connect all features to dashboard
- 🔄 End-to-end testing
- 🔄 Performance optimization
- 🔄 Deploy to production

---

## ✅ NEXT IMMEDIATE ACTIONS

1. **Deploy Database Schemas** ✅ DONE
   - Search Intelligence schema
   - Content Studio schema

2. **Migrate Core Functions** (Next)
   - Move 3 search functions to /supabase/functions/
   - Test with new database schema
   - Deploy to production

3. **Build Orchestrators** (After migration)
   - Create wrapper functions
   - Combine existing logic
   - Add tier enforcement

4. **Create UIs** (Final step)
   - Discovery page
   - Insights dashboard
   - Content Studio

---

**Status:** Ready to migrate existing functions to production! 🚀
