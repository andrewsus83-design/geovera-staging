# 🔍 AUDIT LENGKAP: GeoVera TypeScript Functions

**Tanggal Audit**: 12 Februari 2026
**Total Files Diaudit**: 45 files TypeScript
**Status**: ⚠️ **CRITICAL ISSUES FOUND**

---

## 📊 EXECUTIVE SUMMARY

### Issues Ditemukan:
1. ✅ **FIXED**: Missing dependencies `css.ts` dan `body.ts`
2. ⚠️ **CRITICAL**: 13 files dalam format RTF (tidak bisa dijalankan)
3. ⚠️ **HIGH**: Mock data yang belum diganti dengan real API calls
4. ⚠️ **MEDIUM**: Sequential processing di crawler (bisa diparallelkan)
5. ⚠️ **LOW**: Missing error handling di beberapa API calls

---

## 🗂️ DEPENDENCY MAP

### External Dependencies

#### 1. OpenAI APIs
**Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Files menggunakan**:
  - `generate-article.ts` → GPT-4o untuk article generation
  - `Aman-3/brand-chat-api.ts` → Brand Q&A
  - `Aman-3/code-review-openai.ts` → Code review
  - `Aman-2/auto-processor.ts` → Automation
  - `Aman-2/automate-content-generation.ts` → Multi-platform content

**Endpoint**: `https://api.openai.com/v1/images/generations`
- **Files menggunakan**:
  - `generate-image.ts` → DALL-E 3 HD image generation
  - `generate-content-public.ts` → Content router

**Cost**:
- GPT-4o: ~$2.50 per 1M tokens
- DALL-E 3 HD: $0.08 per image

---

#### 2. Google Gemini APIs
**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- **Files menggunakan**:
  - `gemini-seo-crawler.ts` → SEO intelligence extraction

**Prompt Example**:
```
Analyze this webpage for SEO intelligence:
URL: {target_url}
HTML Content: {html.substring(0, 50000)}

Extract and analyze:
1. Content Structure (H1/H2/H3, paragraphs, keywords)
2. SEO Elements (title, meta, headers, internal links)
3. Keyword Strategy (primary, secondary, long-tail)
4. Technical SEO (page structure, schema, mobile)
5. Content Patterns (writing style, format, CTAs)

Provide structured JSON output.
```

**Cost**: ~$0.0001 per request (free tier available)

---

#### 3. Runway ML APIs
**Endpoint**: `https://api.runwayml.com/v1/image_to_video`
- **Files menggunakan**:
  - `generate-video.ts` → Gen-3A Turbo image-to-video

**Parameters**:
```typescript
{
  promptImage: base64_image_url,
  model: "gen3a_turbo",
  promptText: motion_description,
  duration: 5, // seconds
  watermark: false,
  ratio: "9:16" // TikTok/Instagram
}
```

**Polling**: `https://api.runwayml.com/v1/tasks/{task_id}`
- Interval: 5 seconds
- Max attempts: 60 (5 minutes timeout)
- States: PENDING → RUNNING → SUCCEEDED/FAILED

**Cost**: $0.05 per second = $0.25 per 5-second video

---

#### 4. Anthropic Claude APIs
**Endpoint**: `https://api.anthropic.com/v1/messages`
- **Files menggunakan**:
  - `Aman-3/claude-synthesis.ts` → Content synthesis
  - `Aman-3/claude-question-gen.ts` → Question generation
  - `Aman-3/claude-seo-reverse-engineer.ts` → SEO reverse engineering
  - `Aman-3/content-opportunity-engine.ts` → Content opportunities

**Model**: `claude-3-haiku-20240307` (fast & cheap)

**Cost**: ~$0.25 per 1M input tokens

---

### Database Tables (Supabase)

#### Content Generation Tables:
```sql
-- Stores all generated content (articles, images, videos)
gv_content_assets (
  id uuid,
  brand_id uuid,
  content_type text, -- 'article' | 'image' | 'video'
  platform text,     -- 'linkedin' | 'instagram' | 'tiktok'
  title text,
  body_text text,
  image_url text,
  alt_text text,
  target_pillar text,
  insight_id uuid,
  status text,       -- 'draft' | 'published'
  prompts_used jsonb,
  generation_metadata jsonb,
  filename text,
  created_at timestamp
)
USED BY: generate-article.ts, generate-image.ts, generate-video.ts

-- Job queue for content generation
gv_content_jobs (
  id uuid,
  brand_id uuid,
  content_type text,
  target_platform text,
  insight_id uuid,
  status text,       -- 'pending' | 'processing' | 'completed' | 'failed'
  created_at timestamp
)
USED BY: generate-article.ts, generate-image.ts, generate-video.ts

-- Brand-specific AI prompts and voice
gv_master_prompts (
  brand_id uuid,
  master_prompt jsonb {
    identity_block text,
    voice_rules text[],
    visual_direction text
  }
)
USED BY: generate-article.ts, generate-image.ts

-- Platform-specific content rules
gv_platform_optimization_rules (
  brand_id uuid,
  rules jsonb {
    linkedin: { optimal_caption: 1200, style: 'professional' },
    instagram: { optimal_caption: 800, aspect_ratio: '1:1' },
    tiktok: { optimal_caption: 150, aspect_ratio: '9:16' }
  }
)
USED BY: generate-article.ts, generate-image.ts, generate-video.ts
```

#### SEO & Crawler Tables:
```sql
-- Gemini-powered SEO crawl sessions
gv_gemini_crawl_sessions (
  id uuid,
  brand_id uuid,
  target_url text,
  target_domain text,
  crawl_type text,   -- 'competitor_site' | 'serp_scraping'
  max_pages int,
  crawl_depth int,
  status text,       -- 'crawling' | 'completed' | 'failed'
  pages_discovered int,
  pages_analyzed int,
  structured_data jsonb,     -- Gemini extraction results
  content_patterns jsonb,    -- Title, meta, H1/H2 counts
  gemini_insights jsonb,     -- AI analysis
  content_quality_score numeric,
  seo_optimization_score numeric,
  pages_data jsonb[],
  completed_at timestamp
)
USED BY: gemini-seo-crawler.ts

-- Creator leaderboard data
gv_creator_leaderboards (
  id uuid,
  category text,     -- 'Beauty' | 'F&B' | 'Tech'
  tier text,         -- 'mega' | 'macro' | 'micro'
  platform text,     -- 'instagram' | 'tiktok'
  creator_handle text,
  creator_name text,
  follower_count bigint,
  avg_engagement_rate numeric,
  authenticity_score int,
  brand_safety_score int,
  influence_score int,
  growth_score int,
  engagement_score int,
  overall_score int,
  snapshot_date date
)
USED BY: geovera-crawler-orchestrator.ts
```

#### GEO Ranking Tables:
```sql
-- Generative Engine Optimization rankings
gv_geo_rankings (
  id uuid,
  brand_id uuid,
  test_id uuid,
  citation_frequency int,
  avg_sentiment numeric,       -- -1 to 1
  recommendation_pct numeric,   -- 0 to 100
  competitor_mention_count int,
  visibility_score numeric,     -- Calculated weighted score
  test_status text,             -- 'pending' | 'completed'
  rank_vs_competitors int,
  updated_at timestamp
)
USED BY: geo-rank-calculator.ts

-- LLM responses for GEO testing
gv_llm_responses (
  id uuid,
  test_id uuid,
  question text,
  response text,
  brand_mentioned boolean,
  is_recommendation boolean,
  sentiment numeric,
  competitors_mentioned text[],
  created_at timestamp
)
USED BY: geo-rank-calculator.ts
```

---

## 🔗 FUNCTION DEPENDENCIES

### 1. generate-article.ts
**Calls**:
- ✅ `Supabase.rpc('create_content_job')` → Creates job record
- ✅ `Supabase.from('gv_master_prompts').select()` → Gets brand voice
- ✅ `Supabase.from('gv_platform_optimization_rules').select()` → Platform rules
- ✅ `fetch('https://api.openai.com/v1/chat/completions')` → GPT-4o generation
- ✅ `Supabase.from('gv_content_assets').insert()` → Stores article
- ✅ `Supabase.rpc('complete_content_job')` → Marks job complete

**Called by**: NONE (Edge Function entry point)

**Dependencies**: OpenAI API key, Supabase credentials

---

### 2. generate-image.ts
**Calls**:
- ✅ `Supabase.rpc('create_content_job')`
- ✅ `Supabase.from('gv_master_prompts').select()`
- ✅ `Supabase.from('gv_platform_optimization_rules').select()`
- ✅ `fetch('https://api.openai.com/v1/images/generations')` → DALL-E 3
- ✅ `fetch('https://api.openai.com/v1/chat/completions')` → Alt text with GPT-4o
- ✅ `Supabase.from('gv_content_assets').insert()`
- ✅ `Supabase.rpc('complete_content_job')`

**Called by**: NONE (Edge Function entry point)

**Dependencies**: OpenAI API key, Supabase credentials

---

### 3. generate-video.ts
**Calls**:
- ✅ `Supabase.rpc('create_content_job')`
- ✅ `Supabase.from('gv_content_assets').select()` → Gets base image
- ✅ `Supabase.from('gv_platform_optimization_rules').select()`
- ✅ `fetch('https://api.runwayml.com/v1/image_to_video')` → Start video gen
- ⚠️ **POLLING LOOP**: `fetch('https://api.runwayml.com/v1/tasks/{id}')` every 5 sec
- ✅ `Supabase.from('gv_content_assets').insert()`
- ✅ `Supabase.rpc('complete_content_job')`

**Called by**: NONE (Edge Function entry point)

**Dependencies**: Runway ML API key, Supabase credentials

**⚠️ Issue**: Polling bisa diganti dengan webhook untuk efficiency

---

### 4. gemini-seo-crawler.ts
**Calls**:
- ✅ `Supabase.from('gv_gemini_crawl_sessions').insert()` → Create session
- ✅ `fetch(target_url)` → Get webpage HTML
- ✅ `fetch('https://generativelanguage.googleapis.com/.../gemini-2.0-flash-exp:generateContent')` → AI extraction
- ✅ HTML regex parsing (title, meta, H1/H2, links)
- ✅ `Supabase.from('gv_gemini_crawl_sessions').update()` → Store results

**Internal Functions**:
- None (all inline processing)

**Called by**: NONE (Edge Function entry point)

**Dependencies**: Gemini API key, Supabase credentials

---

### 5. geo-rank-calculator.ts
**Calls**:
- ✅ `Supabase.from('gv_llm_responses').select()` → Get test responses
- ✅ `calculateVisibilityScore(metrics, totalQuestions)` → **LOCAL FUNCTION**
- ✅ `calculateCompetitorShare(responses)` → **LOCAL FUNCTION**
- ✅ `Supabase.from('gv_geo_rankings').update()` → Store scores

**Internal Functions**:
```typescript
calculateVisibilityScore(metrics: GEOMetrics, totalQuestions: number): number
  // Weighted scoring:
  // - Citation: 30%
  // - Sentiment: 25%
  // - Recommendation: 25%
  // - Competitor Share: 20%

calculateCompetitorShare(responses: any[]): number
  // brand_mentions / (brand_mentions + competitor_mentions)
```

**Called by**: NONE (Edge Function entry point)

**Dependencies**: Supabase credentials only

---

### 6. geovera-crawler-orchestrator.ts
**Calls**:
- ✅ `getTargets(category, tier, platform, mode)` → **LOCAL FUNCTION**
- ⚠️ **SEQUENTIAL LOOP**: `fetch(SUPABASE_URL/functions/v1/geovera-ai-crawler)` for each target
- ⚠️ **RATE LIMITING**: `setTimeout(1000)` between requests
- ✅ `Supabase.from('gv_creator_leaderboards').insert()` → Store creator data

**Internal Functions**:
```typescript
getTargets(category, tier, platform, mode)
  // Returns hardcoded targets:
  // Beauty.mega: ['rachelvennya', 'tasyafarasya', 'suhaysalim']
  // Beauty.macro: ['nadyanissa', 'titikamal']
  // F&B.mega: ['mgdalenaf', 'jktfoodbang']
```

**Called by**: NONE (Edge Function entry point)

**Dependencies**: Supabase credentials, geovera-ai-crawler function

**⚠️ Issue**: Sequential processing lambat, bisa pakai `Promise.all()`

---

### 7. geovera-ai-intelligence.ts
**Calls**:
- ✅ `Supabase.from('gv_creator_leaderboards').select()` → Get creator data
- ⚠️ `runNLPAnalysis(creator, content_samples)` → **MOCK IMPLEMENTATION**
- ⚠️ `runBehaviorAnalysis(creator, content_samples)` → **MOCK IMPLEMENTATION**
- ⚠️ `runTruthValidation(creator, content_samples)` → **MOCK IMPLEMENTATION**
- ✅ `calculateComposite(nlp, behavior, truth)` → **LOCAL FUNCTION**
- ✅ `generateRecommendation(compositeScore)` → **LOCAL FUNCTION**

**Internal Functions (MOCK - NEED REAL API)**:
```typescript
runNLPAnalysis(creator, samples)
  ├─ analyzeSentiment(captions) → Keyword-based (FAKE)
  ├─ extractTopics(captions) → Keyword matching (FAKE)
  ├─ analyzeLanguageQuality(captions) → Simple heuristics (FAKE)
  └─ predictEngagement(captions, creator) → Simple multiplier (FAKE)

runBehaviorAnalysis(creator, samples)
  ├─ analyzePostingBehavior(samples) → Hardcoded 85 (FAKE)
  ├─ analyzeAudienceBehavior(samples, creator) → Simple formula (FAKE)
  └─ analyzeGrowthPatterns(creator) → Hardcoded values (FAKE)

runTruthValidation(creator, samples)
  └─ ALL MOCK DATA
```

**⚠️ CRITICAL**: This file needs real Claude/Gemini API integration!

**Called by**: NONE (Edge Function entry point)

**Dependencies**: Supabase credentials (should also use Claude/Gemini)

---

### 8. geovera-ai-crawler.ts
**Calls**:
- ⚠️ `simulateFetch(url, platform)` → **RETURNS MOCK HTML**
- ⚠️ `extractWithAI(html, platform, extract_type)` → **MOCK EXTRACTION**

**Internal Functions (ALL MOCK)**:
```typescript
simulateFetch(url, platform)
  // Returns hardcoded HTML with embedded JSON
  // Instagram: window._sharedData
  // TikTok: __UNIVERSAL_DATA_FOR_REHYDRATION__

extractWithAI(html, platform, extract_type)
  // Regex parsing of mock JSON
  // Should use Claude/Gemini for real extraction

calculateEngagement(followers)
  // Simple formula based on follower count
```

**⚠️ CRITICAL**: No real BrightData proxy, no real AI extraction!

**Called by**: `geovera-crawler-orchestrator.ts`

**Dependencies**: NONE (should use BrightData + Claude/Gemini)

---

## ⚠️ CRITICAL ISSUES

### 1. RTF File Format (BLOCKING)
**Affected Files**: ALL 13 root files
```
deploy-dashboard-page.ts
gemini-seo-crawler.ts
generate-article.ts
generate-content-public.ts
generate-image.ts
generate-video.ts
geo-rank-calculator.ts
geotimeline-final.ts
geotimeline-live.ts
geotimeline-viewer.ts
geovera-ai-crawler.ts
geovera-ai-intelligence.ts
geovera-crawler-orchestrator.ts
```

**Fix**: Convert to plain text dengan command:
```bash
cd "/Users/drew83/Desktop/untitled folder"
for file in *.ts; do
  textutil -convert txt "$file" -output "${file}.txt"
  mv "${file}.txt" "$file"
done
```

---

### 2. Mock Data Not Connected to Real APIs (HIGH PRIORITY)

#### geovera-ai-intelligence.ts:
```typescript
// CURRENT (FAKE):
function analyzeSentiment(captions) {
  const positiveWords = ['love', 'amazing', 'best'];
  let positiveCount = 0;
  // ... keyword matching
}

// SHOULD BE (REAL):
async function analyzeSentiment(captions) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    headers: { 'anthropic-api-key': ANTHROPIC_API_KEY },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      messages: [{
        role: 'user',
        content: `Analyze sentiment of these captions: ${captions.join('\n')}`
      }]
    })
  });
  return await response.json();
}
```

#### geovera-ai-crawler.ts:
```typescript
// CURRENT (FAKE):
async function simulateFetch(url, platform) {
  return `<html><script>window._sharedData = {...mock data...}</script></html>`;
}

// SHOULD BE (REAL):
async function fetchWithProxy(url, platform) {
  const proxyUrl = `http://${BRIGHTDATA_USERNAME}:${BRIGHTDATA_PASSWORD}@brd.superproxy.io:22225`;
  const response = await fetch(url, {
    agent: new HttpsProxyAgent(proxyUrl)
  });
  return await response.text();
}
```

---

### 3. Sequential Processing (MEDIUM PRIORITY)

#### geovera-crawler-orchestrator.ts:
```typescript
// CURRENT (SLOW):
for (const target of targets) {
  const response = await fetch(...);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// SHOULD BE (FAST):
const results = await Promise.all(
  targets.map(async (target, index) => {
    await new Promise(resolve => setTimeout(resolve, index * 1000)); // Stagger
    return await fetch(...);
  })
);
```

---

## 📋 REKOMENDASI PERBAIKAN

### Priority 1 (CRITICAL - Do Now):
1. ✅ **DONE**: Create `css.ts` and `body.ts`
2. ⚠️ **TODO**: Convert all RTF files to plain text
3. ⚠️ **TODO**: Replace mock sentiment analysis with Claude API
4. ⚠️ **TODO**: Replace mock crawler with BrightData proxy + Claude extraction

### Priority 2 (HIGH - Do This Week):
5. ⚠️ **TODO**: Parallelize crawler orchestrator
6. ⚠️ **TODO**: Add comprehensive error handling to all API calls
7. ⚠️ **TODO**: Replace video polling with webhook
8. ⚠️ **TODO**: Add request retry logic (exponential backoff)

### Priority 3 (MEDIUM - Do This Month):
9. ⚠️ **TODO**: Add rate limiting middleware
10. ⚠️ **TODO**: Implement caching for expensive API calls
11. ⚠️ **TODO**: Add logging/monitoring (Sentry or similar)
12. ⚠️ **TODO**: Create unit tests for calculation functions

### Priority 4 (LOW - Nice to Have):
13. ⚠️ **TODO**: Add TypeScript strict mode
14. ⚠️ **TODO**: Implement queue system (BullMQ or similar)
15. ⚠️ **TODO**: Add cost tracking per API call
16. ⚠️ **TODO**: Create admin dashboard for monitoring

---

## 💰 COST ANALYSIS

### Current Monthly Estimates (100 operations/day):

| Service | Operation | Cost per Call | Monthly Cost |
|---------|-----------|---------------|--------------|
| OpenAI GPT-4o | Article gen | $0.005 | $15 |
| OpenAI DALL-E 3 | Image gen | $0.08 | $240 |
| Runway ML Gen-3A | Video gen (5s) | $0.25 | $750 |
| Google Gemini | SEO crawl | $0.0001 | $0.30 |
| Anthropic Claude | Intelligence | $0.0005 | $1.50 |
| BrightData Proxy | Web crawl | $0.002 | $6 |
| **TOTAL** | | | **~$1,013/month** |

---

## 🎯 SUCCESS METRICS

### After Fixing:
- ✅ All files executable as TypeScript
- ✅ Real AI API integrations (not mocks)
- ✅ 5x faster crawler (parallel processing)
- ✅ 99.9% uptime (error handling + retries)
- ✅ <500ms response time (with caching)
- ✅ Cost tracking per operation

---

## 📞 NEXT STEPS

1. Review this audit report
2. Prioritize fixes based on business impact
3. Convert RTF files to plain text (blocking issue)
4. Implement real API integrations for mock functions
5. Test each function individually
6. Deploy to production with monitoring

---

**Audit Completed By**: Claude Sonnet 4.5
**Contact**: noreply@anthropic.com
