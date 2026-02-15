# SEO, GEO, Social Search - Complete Implementation Guide
**Date:** February 15, 2026
**Architecture:** 6-Step Intelligence Pipeline

---

## 🎯 SYSTEM OVERVIEW

### **Three Distinct Optimization Channels:**

1. **SEO (Search Engine Optimization)**
   - Target: Traditional search engines (Google, Bing)
   - Focus: Web search rankings
   - Metrics: Keyword positions, backlinks, domain authority

2. **GEO (Generative Engine Optimization)**
   - Target: AI platforms (ChatGPT, Gemini, Claude, Perplexity)
   - Focus: AI-generated responses
   - Metrics: Mention frequency, recommendation likelihood, position in AI answers

3. **Social Search**
   - Target: Social platforms (TikTok, Instagram, YouTube)
   - Focus: In-platform search visibility
   - Metrics: Hashtag rankings, content discovery, creator visibility

---

## 🔄 6-STEP PIPELINE

### **STEP 1: Data Ingestion (Onboarding)**

**Source:** User onboarding form
**File:** `gv_brands` table

**Data Collected:**
```json
{
  "brand_id": "uuid",
  "brand_name": "Batik Nusantara",
  "brand_category": "Fashion",
  "brand_country": "Indonesia",
  "brand_city": "Jakarta",
  "website": "https://batiknusantara.id",
  "instagram": "@batiknusantara",
  "tiktok": "@batiknusantara",
  "youtube": "@batiknusantara",
  "target_audience": "Women 25-45, middle-upper class",
  "business_description": "Traditional Indonesian batik with modern designs"
}
```

**Status:** ✅ Already implemented in onboarding

---

### **STEP 2: Data Enrichment (300QA from Claude)**

**Purpose:** Generate 300 strategic questions from Claude
**Input:** Brand data from Step 1
**Output:** 300 questions categorized by channel

**Question Distribution:**
```javascript
{
  seo_web: [      // 100 questions for SEO
    "batik modern jakarta",
    "batik nusantara review",
    "where to buy batik in jakarta",
    "best batik brands indonesia",
    "batik online shop",
    // ... 95 more
  ],

  geo_ai: [       // 100 questions for GEO
    "recommend batik brands in jakarta",
    "compare batik nusantara with competitors",
    "best batik for office wear indonesia",
    "sustainable batik brands",
    "batik price range jakarta",
    // ... 95 more
  ],

  social: [       // 100 questions for Social Search
    "#batikmodern",
    "#batiknusantara",
    "batik styling tips",
    "batik fashion 2026",
    "batik outfit ideas",
    // ... 95 more
  ]
}
```

**Implementation:**
```typescript
// /supabase/functions/generate-300qa-claude/index.ts

interface Generate300QARequest {
  brand_id: string;
}

interface Question {
  id: string;
  text: string;
  channel: 'seo' | 'geo' | 'social';
  sub_channel?: 'google' | 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | 'tiktok' | 'instagram' | 'youtube';
  priority: 1 | 2 | 3 | 4 | 5;
  category: 'brand' | 'competitor' | 'product' | 'pricing' | 'review' | 'opportunity';
}

async function generate300Questions(brand: Brand): Promise<Question[]> {
  const claudePrompt = `
You are a digital marketing strategist specializing in SEO, GEO, and Social Search.

Brand Information:
- Name: ${brand.brand_name}
- Category: ${brand.brand_category}
- Country: ${brand.brand_country}
- Description: ${brand.business_description}

Generate 300 strategic questions/keywords distributed as:

1. SEO (100 questions) - For Google/Bing web search
   - Brand keywords (20)
   - Competitor keywords (20)
   - Product/service keywords (20)
   - Long-tail keywords (20)
   - Local SEO keywords (20)

2. GEO (100 questions) - For AI platforms (ChatGPT, Gemini, Claude, Perplexity)
   - Direct brand queries (25)
   - Comparison queries (25)
   - Recommendation queries (25)
   - Information queries (25)

3. Social Search (100 questions) - For TikTok, Instagram, YouTube
   - Hashtags (30)
   - Content discovery phrases (30)
   - Trend-based searches (20)
   - Creator discovery (20)

For each question, specify:
- Channel (seo/geo/social)
- Sub-channel (if applicable)
- Priority (1-5, where 5 = highest)
- Category (brand/competitor/product/pricing/review/opportunity)

Output format: JSON array of questions
  `;

  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: claudePrompt
    }]
  });

  const questions = parseClaudeResponse(response.content);

  // Store in database
  await storeQuestions(brand.brand_id, questions);

  return questions;
}
```

**Database Table:**
```sql
CREATE TABLE gv_300qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id),

  question_text TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('seo', 'geo', 'social')),
  sub_channel TEXT,

  priority INTEGER CHECK (priority BETWEEN 1 AND 5),
  category TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'researched', 'analyzed')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_300qa_brand ON gv_300qa_questions(brand_id);
CREATE INDEX idx_300qa_channel ON gv_300qa_questions(channel);
CREATE INDEX idx_300qa_status ON gv_300qa_questions(status);
```

---

### **STEP 3: Perplexity Deep Research (Optimized per Channel)**

**Purpose:** Research each question using Perplexity, optimized for SEO/GEO/Social

#### **3A. SEO Research (Google/Bing Web Search)**

**Tools:** SerpAPI (primary), Apify (backup)
**Target:** Traditional search engines

**Process:**
```typescript
// /supabase/functions/seo-deep-research/index.ts

async function researchSEOKeywords(brand: Brand, questions: Question[]) {
  const results = [];

  for (const question of questions.filter(q => q.channel === 'seo')) {
    // Use SerpAPI for Google search
    const serpResult = await serpapi.search({
      q: question.text,
      location: brand.brand_country,
      gl: getCountryCode(brand.brand_country), // 'id' for Indonesia
      hl: getLanguageCode(brand.brand_country), // 'id' for Indonesian
      num: 100 // Get top 100 results
    });

    // Analyze results
    const analysis = {
      keyword: question.text,

      // Brand Position
      brand_position: findBrandPosition(serpResult, brand.brand_name, brand.website),
      brand_url: findBrandURL(serpResult, brand.website),
      brand_appears: brandAppearsInResults(serpResult, brand),

      // Competitor Analysis
      competitors_found: extractCompetitors(serpResult),
      competitor_positions: getCompetitorPositions(serpResult),

      // Top Results
      top_10_results: serpResult.organic_results.slice(0, 10).map(r => ({
        position: r.position,
        title: r.title,
        url: r.link,
        domain: extractDomain(r.link),
        is_competitor: isCompetitor(r, brand.competitors)
      })),

      // Search Metrics
      total_results: serpResult.search_information.total_results,
      search_volume: await getSearchVolume(question.text), // From Google Keyword Planner API
      difficulty_score: calculateSEODifficulty(serpResult),

      // Opportunities
      featured_snippet: serpResult.featured_snippet || null,
      people_also_ask: serpResult.related_questions || [],
      related_searches: serpResult.related_searches || []
    };

    results.push(analysis);

    // Store in database
    await storeSEOResult(brand.brand_id, question.id, analysis);
  }

  return results;
}

function calculateSEODifficulty(serpResult) {
  // Based on:
  // - Domain authority of top 10 results
  // - Number of backlinks
  // - Content quality
  // - SERP features present

  let score = 0;

  // High DA domains = harder
  const avgDA = getAverageDomainAuthority(serpResult.organic_results);
  score += (avgDA / 100) * 40; // Max 40 points

  // SERP features = harder
  if (serpResult.featured_snippet) score += 15;
  if (serpResult.knowledge_graph) score += 15;
  if (serpResult.local_pack) score += 10;

  // Many backlinks = harder
  const avgBacklinks = getAverageBacklinks(serpResult.organic_results);
  score += Math.min((avgBacklinks / 1000) * 20, 20); // Max 20 points

  return Math.min(score, 100); // 0-100 scale
}
```

**Expected Output (SEO):**
```json
{
  "keyword": "batik modern jakarta",
  "brand_position": 15,
  "brand_url": "https://batiknusantara.id/modern-collection",
  "brand_appears": true,
  "competitors_found": [
    {
      "name": "Batik Keris",
      "position": 3,
      "url": "https://batikkeris.co.id"
    },
    {
      "name": "Danar Hadi",
      "position": 7,
      "url": "https://danarhadi.com"
    }
  ],
  "difficulty_score": 72,
  "search_volume": 2400,
  "opportunity_score": 65
}
```

---

#### **3B. GEO Research (AI Platforms)**

**Tools:** Direct API calls to ChatGPT, Gemini, Claude, Perplexity
**Target:** AI-generated responses

**Process:**
```typescript
// /supabase/functions/geo-deep-research/index.ts

async function researchGEOKeywords(brand: Brand, questions: Question[]) {
  const platforms = ['chatgpt', 'gemini', 'claude', 'perplexity'];
  const results = [];

  for (const question of questions.filter(q => q.channel === 'geo')) {
    const platformResults = await Promise.all(
      platforms.map(platform => queryAIPlatform(platform, question.text, brand))
    );

    const analysis = {
      keyword: question.text,

      // Overall GEO Metrics
      mention_rate: calculateMentionRate(platformResults, brand),
      avg_position: calculateAvgPosition(platformResults, brand),
      sentiment_score: analyzeSentiment(platformResults, brand),

      // Per-platform breakdown
      chatgpt: analyzePlatformResponse(platformResults[0], brand),
      gemini: analyzePlatformResponse(platformResults[1], brand),
      claude: analyzePlatformResponse(platformResults[2], brand),
      perplexity: analyzePlatformResponse(platformResults[3], brand),

      // Competitive Analysis
      competitors_mentioned: extractCompetitorsFromAI(platformResults),
      brand_vs_competitors: compareWithCompetitors(platformResults, brand),

      // Opportunities
      missing_info: identifyMissingInfo(platformResults, brand),
      improvement_areas: suggestImprovements(platformResults, brand)
    };

    results.push(analysis);
    await storeGEOResult(brand.brand_id, question.id, analysis);
  }

  return results;
}

async function queryAIPlatform(platform: string, query: string, brand: Brand) {
  switch (platform) {
    case 'chatgpt':
      return await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: query }]
      });

    case 'gemini':
      return await googleai.generateContent({
        model: "gemini-pro",
        prompt: query
      });

    case 'claude':
      return await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        messages: [{ role: "user", content: query }]
      });

    case 'perplexity':
      return await perplexity.chat.completions.create({
        model: "pplx-70b-online",
        messages: [{ role: "user", content: query }]
      });
  }
}

function analyzePlatformResponse(response: any, brand: Brand) {
  const answer = extractAnswerText(response);

  return {
    brand_mentioned: answer.toLowerCase().includes(brand.brand_name.toLowerCase()),
    position: findBrandPositionInText(answer, brand.brand_name),
    context: extractBrandContext(answer, brand.brand_name),
    sentiment: analyzeSentimentInContext(answer, brand.brand_name),
    competitors_mentioned: extractCompetitorsFromText(answer),
    quality_of_mention: rateQualityOfMention(answer, brand.brand_name),
    full_response: answer
  };
}
```

**Expected Output (GEO):**
```json
{
  "keyword": "recommend batik brands in jakarta",
  "mention_rate": 75,
  "avg_position": 2.5,
  "sentiment_score": 0.8,
  "chatgpt": {
    "brand_mentioned": true,
    "position": 2,
    "context": "Batik Nusantara offers modern designs...",
    "sentiment": "positive"
  },
  "gemini": {
    "brand_mentioned": true,
    "position": 3,
    "context": "Known for quality and modern styles...",
    "sentiment": "positive"
  },
  "competitors_mentioned": ["Batik Keris", "Danar Hadi"],
  "geo_score": 78
}
```

---

#### **3C. Social Search Research (TikTok, Instagram, YouTube)**

**Tools:** Apify (TikTok, Instagram), SerpAPI (YouTube)
**Target:** In-platform search visibility

**Process:**
```typescript
// /supabase/functions/social-search-research/index.ts

async function researchSocialKeywords(brand: Brand, questions: Question[]) {
  const results = [];

  for (const question of questions.filter(q => q.channel === 'social')) {
    let analysis;

    if (question.sub_channel === 'tiktok') {
      analysis = await researchTikTok(question.text, brand);
    } else if (question.sub_channel === 'instagram') {
      analysis = await researchInstagram(question.text, brand);
    } else if (question.sub_channel === 'youtube') {
      analysis = await researchYouTube(question.text, brand);
    }

    results.push(analysis);
    await storeSocialResult(brand.brand_id, question.id, analysis);
  }

  return results;
}

async function researchTikTok(keyword: string, brand: Brand) {
  // Use Apify TikTok Scraper
  const apifyResult = await apify.call('apify/tiktok-scraper', {
    searchQueries: [keyword],
    resultsPerPage: 100,
    shouldDownloadVideos: false
  });

  const videos = apifyResult.items;

  return {
    keyword: keyword,
    platform: 'tiktok',

    // Brand Presence
    brand_videos_found: videos.filter(v =>
      v.authorMeta.name.toLowerCase().includes(brand.brand_name.toLowerCase()) ||
      v.text.toLowerCase().includes(brand.brand_name.toLowerCase())
    ).length,

    brand_best_position: findBrandBestPosition(videos, brand),

    // Top Content
    top_10_videos: videos.slice(0, 10).map(v => ({
      rank: v.position || null,
      creator: v.authorMeta.name,
      video_url: v.webVideoUrl,
      views: v.playCount,
      likes: v.diggCount,
      engagement_rate: (v.diggCount + v.commentCount + v.shareCount) / v.playCount
    })),

    // Hashtag Analysis
    hashtag_volume: videos.length,
    trending_status: determineTrendingStatus(videos),

    // Competitor Analysis
    competitors_found: extractCompetitorsFromTikTok(videos, brand.competitors),

    // Content Insights
    avg_views: calculateAverage(videos, 'playCount'),
    avg_engagement: calculateAverageEngagement(videos),
    top_sounds: extractTopSounds(videos),
    content_themes: analyzeContentThemes(videos)
  };
}

async function researchInstagram(keyword: string, brand: Brand) {
  // Use Apify Instagram Scraper
  const apifyResult = await apify.call('apify/instagram-scraper', {
    search: keyword,
    searchLimit: 100,
    searchType: 'hashtag'
  });

  const posts = apifyResult.items;

  return {
    keyword: keyword,
    platform: 'instagram',

    // Brand Presence
    brand_posts_found: posts.filter(p =>
      p.ownerUsername.toLowerCase().includes(brand.instagram.replace('@', '').toLowerCase()) ||
      p.caption.toLowerCase().includes(brand.brand_name.toLowerCase())
    ).length,

    // Top Posts
    top_10_posts: posts.slice(0, 10).map(p => ({
      rank: p.position,
      creator: p.ownerUsername,
      post_url: p.url,
      likes: p.likesCount,
      comments: p.commentsCount,
      engagement_rate: (p.likesCount + p.commentsCount) / p.ownerFollowersCount
    })),

    // Hashtag Metrics
    total_posts: posts.length,
    hashtag_reach: calculateHashtagReach(posts),

    // Competitors
    competitors_found: extractCompetitorsFromInstagram(posts, brand.competitors)
  };
}

async function researchYouTube(keyword: string, brand: Brand) {
  // Use SerpAPI YouTube Search
  const serpResult = await serpapi.search({
    engine: 'youtube',
    search_query: keyword,
    num: 100
  });

  const videos = serpResult.video_results;

  return {
    keyword: keyword,
    platform: 'youtube',

    // Brand Presence
    brand_videos_found: videos.filter(v =>
      v.channel.name.toLowerCase().includes(brand.brand_name.toLowerCase()) ||
      v.title.toLowerCase().includes(brand.brand_name.toLowerCase())
    ).length,

    // Top Videos
    top_10_videos: videos.slice(0, 10).map(v => ({
      rank: v.position,
      channel: v.channel.name,
      video_url: v.link,
      views: v.views,
      published: v.published_date
    })),

    // Search Metrics
    total_results: serpResult.search_information.total_results,

    // Competitors
    competitors_found: extractCompetitorsFromYouTube(videos, brand.competitors)
  };
}
```

**Expected Output (Social Search):**
```json
{
  "keyword": "#batikmodern",
  "platform": "tiktok",
  "brand_videos_found": 12,
  "brand_best_position": 8,
  "hashtag_volume": 15000,
  "trending_status": "rising",
  "avg_views": 25000,
  "competitors_found": ["Batik Keris", "Alleira"],
  "opportunity_score": 72
}
```

---

### **STEP 4: Keywords Validation (Backlinks, Citations, Scores)**

**Purpose:** Validate keywords with authority metrics
**Tools:** Ahrefs API, Moz API, or SEMrush API

**Process:**
```typescript
// /supabase/functions/keywords-validation/index.ts

async function validateKeywords(brand: Brand, keywords: Keyword[]) {
  const validatedKeywords = [];

  for (const keyword of keywords) {
    let validation;

    if (keyword.channel === 'seo') {
      validation = await validateSEOKeyword(keyword, brand);
    } else if (keyword.channel === 'geo') {
      validation = await validateGEOKeyword(keyword, brand);
    } else if (keyword.channel === 'social') {
      validation = await validateSocialKeyword(keyword, brand);
    }

    validatedKeywords.push({
      ...keyword,
      validation
    });

    await storeValidation(brand.brand_id, keyword.id, validation);
  }

  return validatedKeywords;
}

async function validateSEOKeyword(keyword: Keyword, brand: Brand) {
  // Get backlinks data (use Ahrefs, Moz, or SEMrush)
  const backlinksData = await getBacklinksData(brand.website);

  // Get domain authority
  const domainAuthority = await getDomainAuthority(brand.website);

  // Get page authority for ranking page
  const pageAuthority = await getPageAuthority(keyword.brand_url);

  // Get competitor backlinks
  const competitorBacklinks = await Promise.all(
    keyword.competitors_found.map(c => getBacklinksData(c.url))
  );

  return {
    // Brand Authority
    brand_domain_authority: domainAuthority,
    brand_page_authority: pageAuthority,
    brand_backlinks: {
      total: backlinksData.total_backlinks,
      referring_domains: backlinksData.referring_domains,
      dofollow: backlinksData.dofollow_backlinks,
      nofollow: backlinksData.nofollow_backlinks,
      quality_score: calculateBacklinkQuality(backlinksData)
    },

    // Competitor Comparison
    competitors_authority: competitorBacklinks.map((cb, i) => ({
      name: keyword.competitors_found[i].name,
      domain_authority: cb.domain_authority,
      total_backlinks: cb.total_backlinks,
      referring_domains: cb.referring_domains
    })),

    // Gap Analysis
    authority_gap: domainAuthority - getAverageCompetitorDA(competitorBacklinks),
    backlinks_gap: backlinksData.total_backlinks - getAverageCompetitorBacklinks(competitorBacklinks),

    // Citations & Mentions
    brand_citations: await getBrandCitations(brand.brand_name),
    competitor_citations: await getCompetitorCitations(keyword.competitors_found),

    // Overall Score
    seo_strength_score: calculateSEOStrength({
      domain_authority: domainAuthority,
      backlinks: backlinksData,
      position: keyword.brand_position
    })
  };
}

async function validateGEOKeyword(keyword: Keyword, brand: Brand) {
  return {
    // Entity Recognition
    entity_status: await checkEntityStatus(brand.brand_name),
    knowledge_graph: await checkKnowledgeGraph(brand.brand_name),

    // Structured Data
    structured_data_score: await analyzeStructuredData(brand.website),
    schema_markup: await checkSchemaMarkup(brand.website),

    // AI Platform Presence
    wikipedia_presence: await checkWikipedia(brand.brand_name),
    wikidata_presence: await checkWikidata(brand.brand_name),

    // Citations in AI Training Data
    estimated_citations: estimateAICitations(brand),

    // Overall GEO Score
    geo_strength_score: calculateGEOStrength({
      mention_rate: keyword.mention_rate,
      avg_position: keyword.avg_position,
      entity_status: entityStatus,
      structured_data: structuredDataScore
    })
  };
}

async function validateSocialKeyword(keyword: Keyword, brand: Brand) {
  return {
    // Social Authority
    follower_count: await getFollowerCount(keyword.platform, brand),
    engagement_rate: await getEngagementRate(keyword.platform, brand),
    content_velocity: await getContentVelocity(keyword.platform, brand),

    // Hashtag Performance
    hashtag_ranking: keyword.brand_best_position,
    hashtag_volume: keyword.hashtag_volume,
    hashtag_growth: await getHashtagGrowth(keyword.keyword),

    // Competitor Comparison
    competitor_followers: await getCompetitorFollowers(keyword.platform, keyword.competitors_found),

    // Overall Social Score
    social_strength_score: calculateSocialStrength({
      position: keyword.brand_best_position,
      volume: keyword.hashtag_volume,
      engagement: engagementRate
    })
  };
}
```

**Expected Output (Validation):**
```json
{
  "keyword": "batik modern jakarta",
  "channel": "seo",
  "validation": {
    "brand_domain_authority": 45,
    "brand_backlinks": {
      "total": 1250,
      "referring_domains": 320,
      "quality_score": 62
    },
    "competitors_authority": [
      {
        "name": "Batik Keris",
        "domain_authority": 72,
        "total_backlinks": 8500
      }
    ],
    "authority_gap": -27,
    "backlinks_gap": -7250,
    "seo_strength_score": 48,
    "improvement_potential": "high"
  }
}
```

---

### **STEP 5: Claude Analysis (Reverse Engineering Strategy)**

**Purpose:** Send all data to Claude for strategic analysis
**Input:** Keywords + Rankings + Competitors + Backlinks + Citations
**Output:** Strategy + Action Plan

**Process:**
```typescript
// /supabase/functions/claude-strategy-analysis/index.ts

async function analyzeWithClaude(brand: Brand, validatedKeywords: ValidatedKeyword[]) {
  const claudePrompt = `
You are a digital marketing strategist with expertise in SEO, GEO, and Social Search.

Brand: ${brand.brand_name}
Category: ${brand.brand_category}
Country: ${brand.brand_country}

I have analyzed ${validatedKeywords.length} keywords across three channels:
- SEO (web search)
- GEO (AI platforms)
- Social Search (TikTok, Instagram, YouTube)

DATA SUMMARY:

SEO Keywords (${validatedKeywords.filter(k => k.channel === 'seo').length}):
${summarizeSEOData(validatedKeywords.filter(k => k.channel === 'seo'))}

GEO Keywords (${validatedKeywords.filter(k => k.channel === 'geo').length}):
${summarizeGEOData(validatedKeywords.filter(k => k.channel === 'geo'))}

Social Keywords (${validatedKeywords.filter(k => k.channel === 'social').length}):
${summarizeSocialData(validatedKeywords.filter(k => k.channel === 'social'))}

COMPETITOR ANALYSIS:
${summarizeCompetitorData(validatedKeywords)}

AUTHORITY METRICS:
- Domain Authority: ${brand.domain_authority || 'N/A'}
- Total Backlinks: ${brand.total_backlinks || 'N/A'}
- GEO Entity Status: ${brand.entity_status || 'N/A'}
- Social Followers: ${brand.total_social_followers || 'N/A'}

TASK:

Using reverse engineering methodology, analyze this data and provide:

1. STRATEGIC ASSESSMENT
   - Current position analysis (where we are)
   - Competitive landscape (who we're competing against)
   - Strengths and weaknesses
   - Market opportunities

2. GAP ANALYSIS
   - SEO gaps (keywords, backlinks, authority)
   - GEO gaps (AI visibility, entity recognition)
   - Social gaps (hashtag rankings, content reach)

3. PRIORITY KEYWORDS
   For each channel (SEO, GEO, Social), identify:
   - Top 10 opportunity keywords (high value, achievable)
   - Top 10 competitive keywords (must defend)
   - Top 10 long-tail keywords (quick wins)

4. STRATEGY RECOMMENDATIONS
   - SEO strategy (content, backlinks, technical)
   - GEO strategy (entity building, structured data, AI optimization)
   - Social strategy (content, hashtags, engagement)

5. ACTION PLAN
   Priority ranking of specific actions needed to improve:
   - High priority (do first)
   - Medium priority (do next)
   - Low priority (do later)

For each action, specify:
- What to do (specific task)
- Why (expected impact)
- How (execution steps)
- Timeline (weeks/months)
- Difficulty (easy/medium/hard)
- Expected improvement (e.g., "move from position 15 to top 5")

Output format: Structured JSON
  `;

  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: claudePrompt
    }]
  });

  const strategy = parseClaudeStrategy(response.content);

  // Store in database
  await storeStrategy(brand.brand_id, strategy);

  return strategy;
}

function summarizeSEOData(keywords: ValidatedKeyword[]) {
  return `
Average Position: ${calculateAverage(keywords, 'brand_position')}
Keywords in Top 10: ${keywords.filter(k => k.brand_position <= 10).length}
Keywords in Top 100: ${keywords.filter(k => k.brand_position <= 100).length}
Average SEO Score: ${calculateAverage(keywords, 'validation.seo_strength_score')}

Top Performing Keywords:
${keywords.sort((a, b) => a.brand_position - b.brand_position).slice(0, 5).map(k =>
  `- "${k.keyword}": Position ${k.brand_position}, Score ${k.validation.seo_strength_score}`
).join('\n')}

Worst Performing Keywords:
${keywords.sort((a, b) => b.brand_position - a.brand_position).slice(0, 5).map(k =>
  `- "${k.keyword}": Position ${k.brand_position}, Score ${k.validation.seo_strength_score}`
).join('\n')}
  `;
}
```

**Expected Output (Claude Analysis):**
```json
{
  "strategic_assessment": {
    "current_position": "Mid-tier player in Indonesian batik market",
    "strengths": [
      "Strong social media presence (78/100)",
      "Good brand sentiment (80% positive)",
      "Modern positioning differentiates from traditional brands"
    ],
    "weaknesses": [
      "Weak SEO (48/100) - losing to established competitors",
      "Low domain authority (45 vs competitor avg 72)",
      "Poor GEO visibility (58/100) - rarely mentioned by AI"
    ],
    "opportunities": [
      "Sustainable fashion trend rising (+150%)",
      "Weak competitor presence on TikTok",
      "Long-tail keywords uncontested"
    ]
  },

  "gap_analysis": {
    "seo": {
      "authority_gap": -27,
      "backlinks_needed": 7000,
      "content_gaps": ["batik care guide", "batik history", "styling tips"]
    },
    "geo": {
      "entity_status": "Not recognized",
      "structured_data_missing": true,
      "wikipedia_needed": true
    },
    "social": {
      "hashtag_dominance": "Low on Instagram, Medium on TikTok",
      "content_frequency": "Too low (2x/week vs competitor 5x/week)"
    }
  },

  "priority_keywords": {
    "seo_opportunities": [
      {
        "keyword": "batik care guide",
        "current_position": null,
        "opportunity_score": 95,
        "reason": "No competition, high search volume"
      }
    ],
    "geo_opportunities": [
      {
        "keyword": "sustainable batik brands indonesia",
        "current_mention_rate": 0,
        "opportunity_score": 92,
        "reason": "Trending topic, low AI coverage"
      }
    ],
    "social_opportunities": [
      {
        "keyword": "#batikoffice",
        "current_position": null,
        "opportunity_score": 88,
        "reason": "Underutilized hashtag, growing searches"
      }
    ]
  },

  "action_plan": {
    "high_priority": [
      {
        "action": "Build 50 high-quality backlinks from fashion blogs",
        "why": "Close 7000-backlink gap with competitors",
        "how": [
          "Identify 100 fashion blogs in Indonesia",
          "Create outreach campaign",
          "Offer guest posts or product reviews",
          "Target DA 40+ sites"
        ],
        "timeline": "3 months",
        "difficulty": "medium",
        "expected_improvement": "DA +10, Rankings +5-10 positions"
      },
      {
        "action": "Create comprehensive batik care guide",
        "why": "Capture uncontested keyword with 2400 monthly searches",
        "how": [
          "Write 2000+ word guide",
          "Include infographics and videos",
          "Optimize for 'batik care', 'how to wash batik'",
          "Build internal links from product pages"
        ],
        "timeline": "2 weeks",
        "difficulty": "easy",
        "expected_improvement": "Rank #1 for care-related keywords"
      }
    ],
    "medium_priority": [...],
    "low_priority": [...]
  }
}
```

---

### **STEP 6: OpenAI Execution (Points, Content, Action)**

**Purpose:** Convert Claude's strategy into executable tasks and content
**Input:** Claude's strategy analysis
**Output:** Specific tasks, content briefs, implementation steps

**Process:**
```typescript
// /supabase/functions/openai-execution-generator/index.ts

async function generateExecutionPlan(brand: Brand, strategy: ClaudeStrategy) {
  const openaiPrompt = `
You are an execution planner for digital marketing campaigns.

I have a strategic analysis from our strategist. Your job is to convert this into:
1. Specific, actionable tasks
2. Content briefs ready for creation
3. Step-by-step implementation guides

STRATEGY:
${JSON.stringify(strategy, null, 2)}

Generate:

A. TASK LIST (Organized by priority)
   For each task:
   - Task ID
   - Title
   - Description
   - Assigned role (SEO Specialist, Content Writer, etc.)
   - Priority (high/medium/low)
   - Deadline (calculate from timeline)
   - Dependencies
   - Success metrics
   - Checklist of sub-tasks

B. CONTENT BRIEFS
   For each content piece needed:
   - Content type (blog post, video, infographic, etc.)
   - Title
   - Target keyword(s)
   - Outline (headings, sections)
   - Word count / length
   - Tone and style
   - Call-to-action
   - SEO requirements (meta, headers, etc.)
   - Assets needed (images, data, etc.)

C. IMPLEMENTATION GUIDES
   For technical tasks:
   - Step-by-step instructions
   - Tools required
   - Code snippets (if applicable)
   - Testing criteria
   - Rollback plan

Output format: Structured JSON with task_list, content_briefs, implementation_guides
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{
      role: "system",
      content: "You are an expert execution planner for digital marketing. Output valid JSON only."
    }, {
      role: "user",
      content: openaiPrompt
    }],
    response_format: { type: "json_object" }
  });

  const executionPlan = JSON.parse(response.choices[0].message.content);

  // Store tasks in database
  await storeTasks(brand.brand_id, executionPlan.task_list);

  // Store content briefs
  await storeContentBriefs(brand.brand_id, executionPlan.content_briefs);

  // Store implementation guides
  await storeImplementationGuides(brand.brand_id, executionPlan.implementation_guides);

  return executionPlan;
}
```

**Expected Output (OpenAI Execution):**
```json
{
  "task_list": [
    {
      "task_id": "SEO-001",
      "title": "Build 50 High-Quality Backlinks",
      "description": "Acquire backlinks from DA 40+ fashion blogs in Indonesia",
      "assigned_to": "SEO Specialist",
      "priority": "high",
      "deadline": "2026-05-15",
      "dependencies": [],
      "success_metrics": {
        "backlinks_acquired": 50,
        "avg_domain_authority": 40,
        "dofollow_percentage": 70
      },
      "checklist": [
        {
          "step": 1,
          "task": "Research 100 fashion blogs in Indonesia (DA 40+)",
          "status": "pending"
        },
        {
          "step": 2,
          "task": "Create outreach email template",
          "status": "pending"
        },
        {
          "step": 3,
          "task": "Send outreach to 100 blogs",
          "status": "pending"
        },
        {
          "step": 4,
          "task": "Write guest posts for accepting blogs",
          "status": "pending"
        },
        {
          "step": 5,
          "task": "Track backlink placement and monitor DA",
          "status": "pending"
        }
      ]
    }
  ],

  "content_briefs": [
    {
      "content_id": "BLOG-001",
      "type": "blog_post",
      "title": "Complete Guide to Batik Care: Keep Your Batik Beautiful for Years",
      "target_keywords": [
        "batik care guide",
        "how to wash batik",
        "batik maintenance",
        "caring for batik"
      ],
      "outline": {
        "h1": "Complete Guide to Batik Care",
        "intro": "Introduction to batik fabric and why proper care matters",
        "sections": [
          {
            "h2": "Understanding Batik Fabric",
            "subsections": [
              "What makes batik special",
              "Different types of batik",
              "Why batik needs special care"
            ]
          },
          {
            "h2": "Washing Your Batik",
            "subsections": [
              "Hand washing vs machine washing",
              "Best detergents for batik",
              "Water temperature guide",
              "Step-by-step washing instructions"
            ]
          },
          {
            "h2": "Drying and Ironing",
            "subsections": [
              "Proper drying techniques",
              "Ironing temperature settings",
              "Avoiding fabric damage"
            ]
          },
          {
            "h2": "Storage Tips",
            "subsections": [
              "Best storage conditions",
              "Preventing color fade",
              "Protecting from insects"
            ]
          }
        ],
        "conclusion": "Summary and CTA to shop batik collection"
      },
      "word_count": 2000,
      "tone": "Helpful, authoritative, friendly",
      "cta": "Shop our modern batik collection with proper care instructions included",
      "seo_requirements": {
        "meta_title": "Batik Care Guide: How to Wash, Dry & Store Your Batik (2026)",
        "meta_description": "Complete guide to batik care. Learn how to wash, dry, iron, and store your batik to keep it beautiful for years. Expert tips from Batik Nusantara.",
        "focus_keyword": "batik care guide",
        "internal_links": [
          "Link to product pages",
          "Link to batik history page",
          "Link to modern collection"
        ],
        "external_links": [
          "Link to fabric care authority sites"
        ]
      },
      "assets_needed": [
        "Infographic: Batik washing steps",
        "Photos: Before/after proper care",
        "Video: Batik washing demonstration (optional)"
      ]
    }
  ],

  "implementation_guides": [
    {
      "guide_id": "IMPL-001",
      "title": "Add Structured Data to Website for GEO Optimization",
      "steps": [
        {
          "step": 1,
          "instruction": "Add Organization Schema to homepage",
          "code": `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Batik Nusantara",
  "url": "https://batiknusantara.id",
  "logo": "https://batiknusantara.id/logo.png",
  "description": "Traditional Indonesian batik with modern designs",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Batik No. 123",
    "addressLocality": "Jakarta",
    "addressCountry": "ID"
  },
  "sameAs": [
    "https://instagram.com/batiknusantara",
    "https://tiktok.com/@batiknusantara"
  ]
}
</script>
          `
        },
        {
          "step": 2,
          "instruction": "Add Product Schema to product pages",
          "code": "..."
        }
      ],
      "tools_required": [
        "Access to website HTML",
        "Google Structured Data Testing Tool"
      ],
      "testing": [
        "Validate schema with Google Rich Results Test",
        "Check for errors in Search Console",
        "Monitor entity recognition in AI platforms (2-4 weeks)"
      ]
    }
  ]
}
```

---

## 🛠️ TOOLS & APIS USAGE

### **SerpAPI** (SEO & YouTube - Cost-Effective)
```javascript
// Use for:
- Google Search results
- YouTube search results
- Google Trends data

// Cost: $0.001 per query (20x cheaper than Apify)

const serpapi = require('google-search-results-nodejs');
const search = new serpapi.GoogleSearch("YOUR_API_KEY");

// Google Search
search.json({
  q: "batik modern jakarta",
  location: "Jakarta, Indonesia",
  gl: "id",
  hl: "id",
  num: 100
}, (result) => {
  console.log(result.organic_results);
});

// YouTube Search
search.json({
  engine: "youtube",
  search_query: "#batikmodern",
  num: 100
}, (result) => {
  console.log(result.video_results);
});
```

### **Apify** (TikTok & Instagram - High Quality)
```javascript
// Use for:
- TikTok video scraping
- Instagram post scraping
- Detailed social metrics

// Cost: $0.02 per query (higher quality, worth it for social)

const { ApifyClient } = require('apify-client');
const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

// TikTok Scraper
const tikTokRun = await client.actor("apify/tiktok-scraper").call({
  searchQueries: ["#batikmodern"],
  resultsPerPage: 100
});

// Instagram Scraper
const igRun = await client.actor("apify/instagram-scraper").call({
  search: "#batikmodern",
  searchLimit: 100,
  searchType: "hashtag"
});
```

### **Cost Optimization Strategy**
```
For 100 keywords per brand:

SEO Research (SerpAPI):
- 100 keywords × $0.001 = $0.10

GEO Research (Direct APIs):
- 100 keywords × 4 platforms × $0.02 = $8.00

Social Research:
- 50 TikTok (Apify): 50 × $0.02 = $1.00
- 50 Instagram (Apify): 50 × $0.02 = $1.00
- 50 YouTube (SerpAPI): 50 × $0.001 = $0.05

TOTAL per brand: ~$10.15
```

---

## 📊 DATABASE SCHEMA

```sql
-- Keywords with research results
CREATE TABLE gv_keywords_research (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),
  keyword TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('seo', 'geo', 'social')),

  -- SEO Data
  seo_position INTEGER,
  seo_search_volume INTEGER,
  seo_difficulty DECIMAL,
  seo_competitors JSONB,

  -- GEO Data
  geo_mention_rate DECIMAL,
  geo_avg_position DECIMAL,
  geo_platforms JSONB,

  -- Social Data
  social_platform TEXT,
  social_volume INTEGER,
  social_position INTEGER,
  social_trending BOOLEAN,

  -- Validation
  backlinks INTEGER,
  domain_authority INTEGER,
  citations INTEGER,

  -- Scores
  opportunity_score INTEGER,
  strength_score INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategy from Claude
CREATE TABLE gv_strategy_analysis (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),

  strategic_assessment JSONB,
  gap_analysis JSONB,
  priority_keywords JSONB,
  action_plan JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Execution tasks from OpenAI
CREATE TABLE gv_execution_tasks (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),
  strategy_id UUID REFERENCES gv_strategy_analysis(id),

  task_title TEXT,
  description TEXT,
  assigned_to TEXT,
  priority TEXT,
  deadline DATE,
  status TEXT DEFAULT 'pending',

  checklist JSONB,
  success_metrics JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content briefs from OpenAI
CREATE TABLE gv_content_briefs (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),
  strategy_id UUID REFERENCES gv_strategy_analysis(id),

  content_type TEXT,
  title TEXT,
  target_keywords TEXT[],
  outline JSONB,
  seo_requirements JSONB,

  status TEXT DEFAULT 'draft',

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

**Last Updated:** February 15, 2026
**Status:** Architecture Complete - Ready for Implementation
**Next Step:** Build Step 2 (300QA Generator with Claude)

---

*GeoVera Intelligence Platform - SEO, GEO, Social Search Pipeline*
