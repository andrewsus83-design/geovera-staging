# GeoVera Backend Implementation Audit
**Date:** February 15, 2026
**Focus:** LLM SEO, GEO, dan Social Search Implementation

---

## 🎯 EXECUTIVE SUMMARY

### ✅ SUDAH DIIMPLEMENTASIKAN (Database Schema Complete)

**Database Tables (9 tables for LLM SEO/GEO/Social):**
1. ✅ `gv_keywords` - Keyword tracking (SEO, GEO, Social)
2. ✅ `gv_search_results` - Search results dari berbagai platform
3. ✅ `gv_geo_scores` - Google Maps ranking scores
4. ✅ `gv_daily_insights` - Daily insights generation
5. ✅ `gv_ai_articles` - AI-generated reports
6. ✅ `gv_tier_usage` - Usage limits enforcement
7. ✅ `gv_competitors` - Competitor tracking
8. ✅ `gv_keyword_history` - Historical performance
9. ✅ `gv_creator_rankings` - Creator mindshare rankings

**Edge Functions (12+ functions):**
1. ✅ `radar-scrape-serpapi` - YouTube & Google Trends scraping
2. ✅ `radar-calculate-rankings` - Creator mindshare calculation
3. ✅ `radar-calculate-marketshare` - Brand marketshare tracking
4. ✅ `radar-discover-trends` - Trend discovery
5. ✅ `radar-analyze-content` - Content quality scoring
6. ✅ `generate-daily-insights` - Daily insights generator
7. ✅ More functions available...

### ⚠️ YANG BELUM ADA (Need Implementation)

1. ❌ **LLM SEO Tracking Functions** - Belum ada function untuk track ChatGPT, Gemini, Claude, Perplexity
2. ❌ **300 Questions Generation** - System untuk generate & distribute 300 strategic questions
3. ❌ **Perplexity Deep Research** - Brief & deep research automation
4. ❌ **Daily Intelligence Collection** - Automated daily collection dari 300 questions
5. ❌ **Insights to Actions Converter** - Auto-generate tasks & content ideas

---

## 📊 DETAILED AUDIT

### 1. **LLM SEO (Generative Engine Optimization)**

#### ✅ Database Schema - READY
```sql
-- gv_keywords table supports 'geo' type
keyword_type TEXT CHECK (keyword_type IN ('seo', 'geo', 'social'))

-- gv_search_results tracks AI platforms
platform TEXT CHECK (platform IN (
  'google', 'google_maps', 'instagram', 'tiktok',
  'youtube', 'reddit', 'linkedin'
))
```

**What's Missing:**
- Platform column needs: 'chatgpt', 'gemini', 'claude', 'perplexity'
- Need `gv_llm_seo_scores` table for AI search tracking

#### ❌ Edge Functions - MISSING

**Need to Create:**
```typescript
// /supabase/functions/llm-seo-tracker/index.ts

/**
 * LLM SEO Tracker
 * Checks brand visibility in AI-generated responses
 *
 * Platforms: ChatGPT, Gemini, Claude, Perplexity
 * Frequency: Daily
 */

interface LLMCheckRequest {
  brand_id: string;
  platforms: ('chatgpt' | 'gemini' | 'claude' | 'perplexity')[];
  test_queries: string[]; // e.g., "Best batik brands in Jakarta"
}

interface LLMCheckResult {
  platform: string;
  query: string;
  brand_mentioned: boolean;
  mention_position: number | null; // Position in AI response (1, 2, 3...)
  mention_context: string; // How brand was described
  sentiment: 'positive' | 'neutral' | 'negative';
  competitors_mentioned: string[];
  full_response: string;
  timestamp: string;
}

/**
 * Process:
 * 1. Query each AI platform with test questions
 * 2. Parse responses to find brand mentions
 * 3. Score position (rank 1 = best)
 * 4. Analyze sentiment
 * 5. Identify competitors mentioned
 * 6. Store in gv_llm_seo_scores table
 * 7. Calculate overall LLM SEO score (0-100)
 */
```

**Score Calculation:**
```
LLM SEO Score = (
  Brand Mention Rate × 40% +
  Average Position Score × 30% +
  Positive Sentiment Rate × 20% +
  Vs Competitors Score × 10%
) × 100

Where:
- Brand Mention Rate = (queries where brand mentioned / total queries)
- Position Score = (1 / average_position) // rank 1 = 1.0, rank 2 = 0.5, etc.
- Sentiment Rate = (positive mentions / total mentions)
- Vs Competitors = (times ranked higher than competitors / total)
```

**Example Implementation:**
```typescript
async function checkChatGPT(query: string, brand: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "user",
      content: query
    }]
  });

  const answer = response.choices[0].message.content;

  // Parse response
  const brandMentioned = answer.toLowerCase().includes(brand.toLowerCase());
  const position = findBrandPosition(answer, brand);
  const sentiment = analyzeSentiment(answer, brand);
  const competitors = extractCompetitors(answer);

  return {
    platform: 'chatgpt',
    query,
    brand_mentioned: brandMentioned,
    mention_position: position,
    sentiment,
    competitors_mentioned: competitors,
    full_response: answer
  };
}
```

---

### 2. **GEO (Generative Engine Optimization) - Broader**

**Current Implementation:**
- ✅ `gv_geo_scores` table exists
- ✅ Tracks Google Maps ranking
- ✅ Reviews, ratings, photos count

**What's Missing:**
GEO should include **ALL AI platforms**, not just Google Maps!

**Proper GEO Implementation:**
```sql
-- Update gv_geo_scores to track ALL AI engines
CREATE TABLE gv_geo_scores_v2 (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),

  -- Platform
  platform TEXT CHECK (platform IN (
    'google_maps',    -- Traditional GEO
    'chatgpt',        -- ChatGPT search
    'gemini',         -- Google Gemini
    'claude',         -- Anthropic Claude
    'perplexity',     -- Perplexity AI
    'bing_chat',      -- Bing Chat
    'bard'            -- Google Bard
  )),

  -- Visibility metrics
  mention_frequency DECIMAL, -- % of queries that mention brand
  average_position DECIMAL,  -- Average rank in responses
  sentiment_score DECIMAL,   -- -1.0 to 1.0

  -- Competitive positioning
  competitors_found TEXT[],
  win_rate DECIMAL, -- % times ranked above competitors

  -- Overall score
  geo_score INTEGER, -- 0-100

  tracked_date DATE,
  created_at TIMESTAMPTZ
);
```

**GEO Score Components:**
1. **Entity Recognition** (25 points)
   - Is brand recognized as entity by AI?
   - Correct categorization?
   - Accurate information?

2. **Recommendation Likelihood** (30 points)
   - How often AI recommends brand?
   - Position in recommendation lists?

3. **Sentiment Quality** (20 points)
   - Positive/neutral/negative mentions?
   - Quality of descriptions?

4. **Knowledge Completeness** (15 points)
   - Does AI know products, services, USPs?
   - Accurate pricing, location, features?

5. **Competitive Standing** (10 points)
   - Ranked above competitors?
   - Mentioned alongside leaders?

---

### 3. **Social Search**

#### ✅ Database Schema - READY
```sql
-- gv_keywords supports 'social' type
keyword_type TEXT CHECK (keyword_type IN ('seo', 'geo', 'social'))

-- gv_search_results supports social platforms
platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'reddit', 'linkedin'))
```

#### ✅ Edge Functions - PARTIALLY READY

**Existing Functions:**
1. ✅ `radar-scrape-serpapi` - YouTube scraping
2. ✅ `radar-discover-trends` - TikTok/Instagram trends
3. ✅ `radar-analyze-content` - Content quality scoring

**What's Working:**
- YouTube channel stats tracking
- Google Trends data collection
- Content quality analysis
- Creator ranking calculation

**What's Missing:**
- Instagram search ranking tracker
- TikTok search ranking tracker
- Real-time hashtag performance
- Social search visibility score

---

## 🔧 WHAT NEEDS TO BE BUILT

### Priority 1: LLM SEO Tracking System

**Files to Create:**
```
/supabase/functions/llm-seo-tracker/
  ├── index.ts                    // Main function
  ├── platforms/
  │   ├── chatgpt.ts             // ChatGPT integration
  │   ├── gemini.ts              // Google Gemini integration
  │   ├── claude.ts              // Anthropic Claude integration
  │   └── perplexity.ts          // Perplexity AI integration
  ├── analyzers/
  │   ├── mention-detector.ts    // Detect brand mentions
  │   ├── position-scorer.ts     // Calculate position scores
  │   ├── sentiment-analyzer.ts  // Sentiment analysis
  │   └── competitor-extractor.ts // Extract competitors
  └── scorers/
      └── llm-seo-score.ts       // Calculate overall score
```

**Database Migration:**
```sql
-- Add new table
CREATE TABLE gv_llm_seo_scores (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),

  platform TEXT CHECK (platform IN ('chatgpt', 'gemini', 'claude', 'perplexity')),
  test_query TEXT,

  brand_mentioned BOOLEAN,
  mention_position INTEGER,
  mention_context TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),

  competitors_mentioned TEXT[],
  competitors_ranked_higher TEXT[],

  full_response TEXT,

  tracked_date DATE,
  created_at TIMESTAMPTZ
);

-- Add comprehensive GEO score table
CREATE TABLE gv_geo_comprehensive_scores (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),

  -- Overall GEO score
  geo_score INTEGER, -- 0-100

  -- Component scores
  entity_recognition_score INTEGER,
  recommendation_score INTEGER,
  sentiment_score INTEGER,
  knowledge_completeness_score INTEGER,
  competitive_standing_score INTEGER,

  -- Platform breakdown
  chatgpt_score INTEGER,
  gemini_score INTEGER,
  claude_score INTEGER,
  perplexity_score INTEGER,

  -- Tracking
  tracked_date DATE,
  created_at TIMESTAMPTZ
);
```

---

### Priority 2: 300 Questions Generation System

**File to Create:**
```typescript
// /supabase/functions/generate-300-questions/index.ts

/**
 * 300 Questions Generator
 * Uses Claude to reverse-engineer research into strategic questions
 */

interface Generate300QuestionsRequest {
  brand_id: string;
  research_report_id: string; // From deep research
}

interface QuestionDistribution {
  tiktok: Question[];      // 75 questions
  instagram: Question[];   // 75 questions
  seo_web: Question[];     // 50 questions
  ai_chat: Question[];     // 50 questions
  web_index: Question[];   // 50 questions
}

interface Question {
  id: string;
  text: string;
  channel: 'tiktok' | 'instagram' | 'seo' | 'ai_chat' | 'web_index';
  category: string; // 'competitor', 'product', 'pricing', etc.
  priority: 1 | 2 | 3 | 4 | 5;
  expected_intelligence_value: number; // 1-10
  deployment_schedule: {
    week: number; // Which week to deploy (1-4)
    day: number;  // Which day (1-7)
  };
}

/**
 * Process:
 * 1. Fetch deep research report
 * 2. Send to Claude for analysis
 * 3. Claude reverse-engineers: "What questions would reveal this intelligence?"
 * 4. Categorize 300 questions by channel
 * 5. Prioritize by expected value
 * 6. Schedule deployment (10/day for 30 days)
 * 7. Store in gv_strategic_questions table
 */

const claudePrompt = `
You are a brand intelligence strategist.

I have conducted deep research on [Brand Name] in [Category] [Country].

Key findings:
- Competitor strategies
- Market gaps
- Customer sentiment
- SEO opportunities
- Social media trends

Generate 300 strategic questions that, when asked and answered, would reveal similar intelligence to other analysts.

Distribute as:
- 75 TikTok search queries
- 75 Instagram search queries
- 50 Google/Web searches
- 50 AI chatbot questions (ChatGPT, Gemini, Claude, Perplexity)
- 50 Web index questions (forums, blogs, Q&A sites)

For each question, specify:
1. Channel (where to ask)
2. Category (competitor/product/pricing/etc)
3. Priority (1-5)
4. Expected intelligence value (1-10)

Make questions natural, varied, and strategic.
`;
```

---

### Priority 3: Daily Intelligence Collection

**File to Create:**
```typescript
// /supabase/functions/daily-intelligence-collector/index.ts

/**
 * Daily Intelligence Collector
 * Runs every day at 03:00 AM
 * Collects intelligence from deployed questions
 */

interface DailyCollectionRequest {
  brand_id: string;
  collection_date: string; // YYYY-MM-DD
}

/**
 * Process:
 * 1. Get today's 10 questions (from 300 pool)
 * 2. Execute questions on respective channels:
 *    - TikTok: Search + analyze top results
 *    - Instagram: Search + analyze top posts
 *    - SEO: Google search + scrape results
 *    - AI Chat: Query ChatGPT, Gemini, Claude, Perplexity
 *    - Web Index: Search forums, Reddit, Q&A sites
 * 3. Store results in gv_intelligence_data
 * 4. Update question status to 'answered'
 * 5. Calculate intelligence value from responses
 */

async function collectTikTokIntelligence(question: Question) {
  // Use TikTok API or scraping
  const results = await tiktokSearch(question.text);

  return {
    question_id: question.id,
    channel: 'tiktok',
    results_found: results.length,
    top_creators: extractCreators(results),
    trending_sounds: extractSounds(results),
    engagement_metrics: calculateEngagement(results),
    intelligence_summary: summarizeFindings(results)
  };
}

async function collectAIChatIntelligence(question: Question) {
  // Query all AI platforms
  const responses = await Promise.all([
    queryChatGPT(question.text),
    queryGemini(question.text),
    queryClaude(question.text),
    queryPerplexity(question.text)
  ]);

  return {
    question_id: question.id,
    channel: 'ai_chat',
    platforms_queried: 4,
    brand_mentioned_count: countBrandMentions(responses),
    competitor_insights: extractCompetitorInfo(responses),
    market_insights: extractMarketInfo(responses),
    intelligence_summary: summarizeAIFindings(responses)
  };
}
```

---

### Priority 4: Perplexity Integration (Deep Research)

**File to Create:**
```typescript
// /supabase/functions/perplexity-deep-research/index.ts

/**
 * Perplexity Deep Research
 * Conducts 100+ queries for comprehensive brand analysis
 */

interface DeepResearchRequest {
  brand_id: string;
  research_type: 'brief' | 'deep';
}

interface DeepResearchTopics {
  brand_analysis: string[];       // 20 queries
  competitor_analysis: string[];  // 30 queries
  seo_analysis: string[];         // 15 queries
  geo_analysis: string[];         // 10 queries
  social_analysis: string[];      // 20 queries
  market_intelligence: string[];  // 15 queries
  content_analysis: string[];     // 10 queries
}

/**
 * Brief Research (10 queries - FREE tier preview):
 * - Brand overview
 * - Top 3 competitors
 * - Social presence snapshot
 * - SEO ranking preview
 * - Market positioning
 */

const briefResearchQueries = [
  "Overview and reputation of [Brand] in [Country]",
  "Top 3 competitors of [Brand] in [Category] [Country]",
  "Social media presence analysis of [Brand]",
  "[Brand] website SEO ranking for main keywords",
  "Target audience and market positioning of [Brand]",
  "Recent news and press coverage about [Brand]",
  "Customer reviews and sentiment about [Brand]",
  "Price range and product offering of [Brand]",
  "[Brand] strengths and weaknesses analysis",
  "Market opportunities for [Brand] in [Country]"
];

/**
 * Deep Research (100+ queries - PAID tier):
 * Comprehensive analysis across all dimensions
 */

async function conductDeepResearch(brand: Brand) {
  const queries = generateDeepResearchQueries(brand);
  const results = [];

  for (const query of queries) {
    const response = await perplexity.search({
      query: query,
      focus: brand.category,
      country: brand.country
    });

    results.push({
      query,
      response: response.answer,
      sources: response.sources,
      insights: extractInsights(response)
    });

    // Rate limiting
    await sleep(1000);
  }

  return {
    brand_id: brand.id,
    research_type: 'deep',
    total_queries: results.length,
    report: compileResearchReport(results),
    insights: aggregateInsights(results),
    competitor_map: buildCompetitorMap(results),
    opportunity_matrix: identifyOpportunities(results)
  };
}
```

---

### Priority 5: Insights to Actions Converter

**File to Create:**
```typescript
// /supabase/functions/insights-to-actions/index.ts

/**
 * Insights to Actions Converter
 * Converts insights into actionable tasks and content ideas
 */

interface ConvertInsightsRequest {
  brand_id: string;
  insight_ids: string[];
}

interface GeneratedActions {
  tasks: Task[];
  content_ideas: ContentIdea[];
}

/**
 * Task Generation Logic:
 *
 * Insight Type → Task Mapping:
 * - negative_sentiment → "Monitor mentions", "Respond to complaints"
 * - crisis_detection → "Crisis response plan", "PR statement"
 * - opportunity → "Research opportunity", "Create campaign"
 * - competitor_alert → "Analyze competitor", "Counter strategy"
 * - seo_gap → "Optimize keywords", "Build backlinks"
 * - geo_weakness → "Improve AI visibility", "Update content"
 */

async function generateTasks(insight: Insight): Promise<Task[]> {
  const tasks: Task[] = [];

  switch (insight.type) {
    case 'negative_sentiment':
      tasks.push({
        title: "Monitor social media mentions",
        description: `Track all mentions of ${insight.data.topic}`,
        priority: "high",
        assignee: "Social Media Manager",
        deadline: addDays(new Date(), 7),
        expected_impact: "Prevent reputation damage"
      });
      break;

    case 'opportunity':
      tasks.push({
        title: `Research ${insight.data.opportunity_name}`,
        description: insight.data.description,
        priority: "medium",
        assignee: "Strategy Team",
        deadline: addDays(new Date(), 14),
        expected_impact: insight.data.potential_impact
      });
      break;

    case 'seo_gap':
      tasks.push({
        title: `Optimize for "${insight.data.keyword}"`,
        description: `Currently rank ${insight.data.current_rank}, target: Top 5`,
        priority: "high",
        assignee: "SEO Team",
        deadline: addDays(new Date(), 30),
        expected_impact: `+${insight.data.estimated_traffic} monthly visits`
      });
      break;
  }

  return tasks;
}

/**
 * Content Idea Generation Logic:
 */

async function generateContentIdeas(insight: Insight): Promise<ContentIdea[]> {
  const ideas: ContentIdea[] = [];

  // Use Claude to generate content ideas
  const prompt = `
  Based on this insight about ${insight.brand_name}:

  Type: ${insight.type}
  Finding: ${insight.description}
  Data: ${JSON.stringify(insight.data)}

  Generate 5 content ideas (TikTok, Instagram, Blog) to:
  - Capitalize on opportunities
  - Address threats
  - Leverage trends
  - Compete with competitors

  For each idea, include:
  - Content type (tiktok_video, instagram_post, blog_article)
  - Title
  - Brief (what to create)
  - Goal (why create it)
  - Expected impact (reach, engagement, conversions)
  `;

  const response = await claude.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: prompt
    }]
  });

  // Parse Claude's response into structured content ideas
  const parsedIdeas = parseContentIdeas(response.content);

  return parsedIdeas;
}
```

---

## 📋 IMPLEMENTATION ROADMAP

### Week 1-2: LLM SEO Foundation
- [ ] Create `gv_llm_seo_scores` table
- [ ] Build `llm-seo-tracker` function
- [ ] Integrate ChatGPT, Gemini, Claude, Perplexity APIs
- [ ] Implement mention detection & scoring
- [ ] Test with sample queries

### Week 3-4: 300 Questions System
- [ ] Create `gv_strategic_questions` table
- [ ] Build `generate-300-questions` function
- [ ] Implement Claude-based question generation
- [ ] Create deployment scheduler
- [ ] Test question quality

### Week 5-6: Daily Intelligence Collection
- [ ] Create `gv_intelligence_data` table
- [ ] Build `daily-intelligence-collector` function
- [ ] Implement channel-specific collectors:
  - TikTok intelligence
  - Instagram intelligence
  - SEO intelligence
  - AI Chat intelligence
  - Web Index intelligence
- [ ] Set up cron job (daily 03:00 AM)

### Week 7-8: Perplexity Research
- [ ] Build `perplexity-brief-research` function (10 queries)
- [ ] Build `perplexity-deep-research` function (100+ queries)
- [ ] Implement research report compiler
- [ ] Create opportunity matrix generator
- [ ] Test with real brands

### Week 9-10: Insights to Actions
- [ ] Build `insights-to-actions` function
- [ ] Implement task generation logic
- [ ] Implement content idea generation (Claude)
- [ ] Create prioritization algorithms
- [ ] Test full pipeline

---

## 🎯 CURRENT STATUS SUMMARY

### ✅ What's Working Well:
1. **Database Architecture** - Complete and well-designed
2. **Radar Functions** - YouTube, Google Trends, content analysis working
3. **Rankings System** - Creator mindshare, brand marketshare calculations
4. **Tier Limits** - Usage tracking and enforcement
5. **Social Scraping** - YouTube data collection via SerpAPI

### ⚠️ What Needs Attention:
1. **LLM SEO** - Not implemented (0%)
2. **GEO Tracking** - Only Google Maps, missing AI platforms (30%)
3. **300 Questions** - Not implemented (0%)
4. **Daily Intelligence** - Not automated (0%)
5. **Perplexity Research** - Not implemented (0%)
6. **Insights to Actions** - Partially done (40%)

### 🚀 Quick Wins:
1. **Add AI platforms to search_results** - 1 day
2. **Create basic LLM SEO tracker** - 3 days
3. **Implement ChatGPT integration** - 2 days
4. **Build 300 questions generator** - 5 days
5. **Set up daily cron job** - 1 day

---

## 💡 RECOMMENDATIONS

### Immediate Actions (This Week):
1. **Extend `gv_search_results.platform`** to include AI platforms
2. **Create basic LLM SEO tracker** for ChatGPT only (MVP)
3. **Test with 10 sample queries** to validate approach
4. **Document API costs** for each platform

### Short-term (Next 2 Weeks):
1. **Complete LLM SEO tracker** for all 4 platforms
2. **Build 300 questions generator** with Claude
3. **Create daily intelligence collector** (basic version)
4. **Implement GEO comprehensive scoring**

### Long-term (Next Month):
1. **Full Perplexity integration** (brief + deep research)
2. **Automated insights to actions** conversion
3. **Complete 7-step intelligence cycle**
4. **Frontend dashboard** for all metrics

---

## 📊 API COST ESTIMATES

### Per Daily Collection Cycle:
```
Daily Questions: 10 questions/day × 30 days = 300 questions/month

Cost Breakdown:
- TikTok searches (3 questions): $0.06 (Apify)
- Instagram searches (3 questions): $0.06 (Apify)
- SEO searches (2 questions): $0.002 (SerpAPI)
- AI Chat (4 platforms × 2 questions): $0.16 (API calls)
- Web Index (2 questions): $0.04 (scraping)

Daily Total: ~$0.32
Monthly Total: ~$9.60 per brand
```

### LLM SEO Tracking:
```
4 platforms × 10 test queries = 40 API calls/day

Costs:
- ChatGPT (GPT-4): $0.03 per query × 10 = $0.30
- Gemini: $0.01 per query × 10 = $0.10
- Claude: $0.02 per query × 10 = $0.20
- Perplexity: $0.005 per query × 10 = $0.05

Daily Total: ~$0.65
Monthly Total: ~$19.50 per brand
```

### Total Monthly Cost Per Brand:
```
Daily Intelligence: $9.60
LLM SEO Tracking: $19.50
Deep Research (one-time): $15.00

Monthly Total: ~$44.10 per active brand
```

---

**Last Updated:** February 15, 2026
**Status:** Schema Complete | Functions 40% Complete
**Next Priority:** Build LLM SEO Tracker (Week 1-2)

---

*GeoVera Intelligence Platform - Backend Implementation Audit*
