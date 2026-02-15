# ✅ LLM SEO, GEO & Social Search - IMPLEMENTATION COMPLETE

**Date**: February 15, 2026
**Status**: Backend Functions Ready for Staging
**Approach**: Real APIs Only (No Dummy Data)

---

## 🎯 **What Was Built**

### **1. LLM SEO Tracker** (`llm-seo-tracker/`)
**Purpose**: Track brand visibility across AI platforms (GEO = Generative Engine Optimization)

**Platforms Supported**:
- ✅ ChatGPT (OpenAI GPT-4)
- ✅ Gemini (Google)
- ✅ Claude (Anthropic)
- ✅ Perplexity (Real-time AI search)

**Key Features**:
- Queries AI platforms with brand keywords
- Detects brand mentions and rankings
- Identifies competitors (as byproduct only)
- Tracks sentiment (positive/neutral/negative)
- Saves results to `gv_search_results` table
- Updates keyword performance metrics

**API Endpoint**:
```
POST /llm-seo-tracker
{
  "brand_id": "uuid",
  "keyword_ids": ["uuid"], // Optional
  "platforms": ["chatgpt", "gemini"] // Optional
}
```

**Cost**: ~$0.00375 per keyword (all 4 platforms)

---

### **2. 300QA Generator** (`generate-300qa/`)
**Purpose**: Generate 300 monthly strategic questions using Claude

**What It Does**:
- Analyzes brand profile from onboarding
- Uses Claude Sonnet 3.5 to generate 300 questions
- Categorizes questions:
  - SEO (60 questions) - Traditional search
  - GEO (80 questions) - AI platform queries
  - Social (60 questions) - Social media search
  - Brand (40 questions) - Direct brand queries
  - Competitor (40 questions) - Comparison queries
  - Market (20 questions) - Industry trends
- Stores in `gv_keywords` table
- Questions used for automated research

**API Endpoint**:
```
POST /generate-300qa
{
  "brand_id": "uuid",
  "force_regenerate": false // Optional
}
```

**Cost**: ~$0.20 per generation (monthly)

**Important**:
- 300 questions = Claude's research budget, NOT user limits
- Users see daily question limits: 5/10/20 questions/day
- 300 questions used by backend for automated intelligence gathering

---

### **3. Perplexity Research** (`perplexity-research/`)
**Purpose**: Deep market research using Perplexity AI with real-time web search

**Research Types**:

**A. Brief Research** (10 queries)
- Quick preview before paid research
- Uses top 10 high-priority questions
- Cost: ~$0.05

**B. Deep Research** (100+ queries)
- Comprehensive market intelligence
- Uses questions from 300QA pool
- Can focus on specific channel (SEO/GEO/Social)
- Cost: ~$0.50-$0.60

**What It Analyzes**:
- Brand mention frequency
- Brand position in answers
- Sentiment analysis
- Citation sources (with URLs)
- Competitor mentions (byproduct)
- Key market insights

**API Endpoint**:
```
POST /perplexity-research
{
  "brand_id": "uuid",
  "research_type": "brief" | "deep",
  "focus_channel": "seo" | "geo" | "social" | "all"
}
```

---

## 📊 **Database Integration**

### **Tables Used**:

#### **1. gv_keywords**
Stores all keywords (user-input + AI-generated 300QA)
```sql
INSERT INTO gv_keywords (
  brand_id,
  keyword,
  keyword_type, -- 'seo', 'geo', 'social'
  source, -- 'user_input', 'ai_suggested'
  suggested_by_ai, -- 'claude'
  priority, -- 1-5
  active
)
```

#### **2. gv_search_results**
Stores AI platform search results
```sql
INSERT INTO gv_search_results (
  keyword_id,
  brand_id,
  platform, -- 'google' (used for all web/AI)
  search_engine, -- 'chatgpt', 'gemini', 'perplexity', 'claude'
  brand_rank,
  brand_appeared,
  competitors_found, -- BYPRODUCT ONLY
  competitor_positions, -- BYPRODUCT ONLY
  raw_response
)
```

#### **3. gv_competitors**
Stores competitor data (BYPRODUCT from search results)
```sql
INSERT INTO gv_competitors (
  brand_id, -- YOUR brand ID
  competitor_name,
  discovered_via, -- 'search_results', 'ai_analysis'
  keywords_competing_on,
  average_rank,
  win_rate -- % where YOU rank higher
)
```

**⚠️ IMPORTANT**: Competitors are NEVER researched deeply. They appear as byproduct when ranking on same keywords as YOUR brand.

---

## 🔐 **Environment Variables Required**

Add these to Supabase secrets:
```bash
# AI Platform APIs
OPENAI_API_KEY=sk-...              # ChatGPT
GEMINI_API_KEY=...                  # Google Gemini
PERPLEXITY_API_KEY=pplx-...        # Perplexity
ANTHROPIC_API_KEY=sk-ant-...       # Claude

# Already configured (from previous features)
SERPAPI_KEY=...                     # For traditional SEO
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🚀 **Deployment**

### **Option 1: Automated Deployment**
```bash
cd /Users/drew83/Desktop/geovera-staging/supabase/functions
./deploy-llm-seo.sh
```

### **Option 2: Manual Deployment**
```bash
# Set secrets first
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GEMINI_API_KEY=...
supabase secrets set PERPLEXITY_API_KEY=pplx-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Deploy functions
supabase functions deploy llm-seo-tracker
supabase functions deploy generate-300qa
supabase functions deploy perplexity-research
```

---

## 🧪 **Testing**

### **1. Test LLM SEO Tracker**
```bash
deno run --allow-all supabase/functions/llm-seo-tracker/test.ts
```

### **2. Manual API Test**
```bash
# Generate 300 questions first
curl -X POST https://your-project.supabase.co/functions/v1/generate-300qa \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "brand-uuid"}'

# Run LLM SEO tracking
curl -X POST https://your-project.supabase.co/functions/v1/llm-seo-tracker \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "brand-uuid", "platforms": ["chatgpt", "perplexity"]}'

# Run Perplexity research
curl -X POST https://your-project.supabase.co/functions/v1/perplexity-research \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "brand-uuid", "research_type": "brief"}'
```

---

## 💰 **Cost Breakdown**

| Function | Per Brand/Month | Notes |
|----------|----------------|-------|
| **300QA Generator** | $0.20 | Once per month |
| **LLM SEO Tracker** | $0.02-$0.06 | Depends on keyword count (5-15 keywords) |
| **Perplexity Brief** | $0.05 | 10 queries preview |
| **Perplexity Deep** | $0.50-$0.60 | 100-120 queries |
| **SerpAPI (SEO)** | $0.10-$0.30 | Traditional search tracking |
| **Apify (Social)** | $0.40-$0.80 | TikTok/Instagram scraping |
| **TOTAL** | **~$1.27-$1.96** | Per brand per month |

**Compared to Initial Estimate**: $29/month → **93% cost reduction** through optimization!

---

## 🎯 **Personalization Model**

### **How It Works**:

```
User Login → Brand A (logged in)
↓
1. Generate 300 questions ABOUT Brand A
2. Run Perplexity research ABOUT Brand A
3. Track AI platforms for Brand A keywords
4. Analyze Brand A performance
↓
Competitors appear as BYPRODUCT:
- They rank on same keywords
- They're mentioned in AI responses
- NO separate deep research on them
↓
Dashboard shows:
┌─────────────────────────────────┐
│ YOUR PERFORMANCE (Deep Data)    │
│ - Rankings                      │
│ - Trends                        │
│ - Opportunities                 │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ COMPETITIVE CONTEXT (Byproduct) │
│ - Top competitor: Wardah        │
│ - You're ahead of: 4 brands     │
└─────────────────────────────────┘
```

**NOT**: Creating separate subscriptions or deep research on Wardah, Emina, etc.

---

## 📈 **Integration with Daily Insights**

These functions feed data into Feature 3 (Daily Insights):

### **Insights Generated**:
1. **Ranking Changes**
   - "You moved up 2 positions on 'best skincare Indonesia'"
   - Source: `gv_search_results`

2. **Competitor Alerts**
   - "Wardah overtook you on keyword X"
   - Source: `gv_search_results.competitor_positions`

3. **Sentiment Shifts**
   - "Positive sentiment increased by 15% this week"
   - Source: `perplexity-research` sentiment analysis

4. **Keyword Opportunities**
   - "5 new high-priority keywords discovered"
   - Source: `generate-300qa`

5. **Market Trends**
   - "Trending topic: 'sustainable beauty' gaining traction"
   - Source: `perplexity-research` insights

---

## 🔄 **Automation Flow (Planned)**

### **Daily Cron Job**:
```
Every Day at 2 AM:
1. Run llm-seo-tracker for all active brands
2. Analyze results
3. Generate daily insights
4. Update dashboard metrics
```

### **Monthly Cron Job**:
```
1st of Each Month:
1. Run generate-300qa for all brands
2. Run perplexity-research (deep) for premium+ tiers
3. Generate monthly report
4. Reset tier usage counters
```

---

## 📋 **Next Steps**

### **Completed** ✅:
- [x] LLM SEO Tracker function
- [x] 300QA Generator function
- [x] Perplexity Research function
- [x] Deployment script
- [x] Test scripts
- [x] Documentation

### **TODO** (Priority Order):

1. **Deploy to Staging** (Next Immediate Step)
   - Set API keys in Supabase secrets
   - Run deployment script
   - Test with real brand data

2. **Create Cron Jobs**
   - Daily intelligence collection
   - Monthly 300QA regeneration
   - Automated insights generation

3. **Build Daily Insights Processor**
   - Analyze search results
   - Generate actionable insights
   - Assign to 4-column structure (Now/Progress/Potential/Competitors)

4. **Frontend Integration**
   - Add "Track Keywords" button
   - Show real-time tracking status
   - Display insights dashboard
   - Competitive context section

5. **Social Search Integration**
   - Apify TikTok scraper
   - Apify Instagram scraper
   - YouTube integration (SerpAPI already done)

---

## ⚠️ **Important Notes**

### **1. Competitor Data Boundaries**
- ✅ Collect competitor names from search results
- ✅ Track their rankings on YOUR keywords
- ✅ Show win/loss rate vs YOUR brand
- ❌ Never run 300QA for competitors
- ❌ Never run deep Perplexity research on competitors
- ❌ Never analyze competitor content strategies

### **2. API Rate Limits**
- OpenAI: 10,000 requests/minute (safe)
- Gemini: 60 requests/minute (add 1s delay)
- Perplexity: 20 requests/minute (add 3s delay)
- Claude: 5 requests/minute (only for 300QA, monthly)

### **3. Cost Control**
- Brief research before deep research (preview)
- Tier limits enforced in database
- Real-time cost tracking in `gv_tier_usage`
- Alert user when 80% of budget used

---

## 🎉 **Summary**

**What We Built**:
- Complete GEO (Generative Engine Optimization) tracking system
- AI-powered 300 question generation
- Deep market research with Perplexity
- Competitor intelligence (as byproduct)
- Real API integrations (no dummy data)
- Cost-optimized architecture ($1.27-$1.96/brand/month)

**Ready for**:
- Staging deployment
- Real brand testing
- Daily insights generation
- Frontend integration

**Personalization**: 1 subscription = 1 brand research ONLY. Competitors discovered passively.

---

**Built By**: Claude (Anthropic)
**For**: GeoVera Intelligence Platform
**Architecture**: Supabase Edge Functions + AI APIs
**Deployment**: Ready for staging environment
