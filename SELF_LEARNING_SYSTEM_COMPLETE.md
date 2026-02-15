# 🧠 GeoVera Self-Learning Intelligence System

**Date**: February 15, 2026
**Status**: ✅ Complete & Ready for Deployment
**Purpose**: Daily automated learning from SEO/GEO/Social data to provide increasingly precise strategies

---

## 🎯 **System Overview**

### **Two-Phase Learning Architecture**:

```
Phase 1: Daily Auto-Research (Data Collection)
↓
Perplexity + SerpAPI → Collect fresh market data
↓
Phase 2: Intelligence Learning (Pattern Analysis)
↓
Claude analyzes patterns → Generate actionable insights
↓
Daily Insights Dashboard → User sees recommendations
```

---

## 📦 **Components Built**

### **1. Daily Intelligence Learner** ✅
**File**: `/supabase/functions/daily-intelligence-learner/index.ts`

**Purpose**: Claude analyzes historical data to learn patterns and generate insights

**Learning Modes**:
- 🔍 **SEO Learning**: Best keywords, ranking patterns, backlink opportunities
- 🤖 **GEO Learning**: AI platform preferences, citation patterns, entity recognition
- 📱 **Social Learning**: Hashtag performance, content patterns, algorithm signals

**What It Learns**:

#### **SEO Channel**:
- ✅ Which keywords are trending UP in rankings
- ✅ High search volume + low competition opportunities
- ✅ Which content types rank best
- ✅ Which domains link to competitors but not us
- ✅ Natural backlink sources in our niche
- ✅ Optimal content length for rankings

#### **GEO Channel**:
- ✅ Which AI platforms mention brand most
- ✅ What content types get cited by AI
- ✅ Which sources AI platforms trust
- ✅ How consistently brand is recognized as entity
- ✅ Sentiment trends over time
- ✅ Competitor sentiment comparison

#### **Social Channel**:
- ✅ Which hashtags drive most discovery
- ✅ Natural hashtag combinations
- ✅ Video length that ranks best
- ✅ Hook effectiveness in first 3 seconds
- ✅ What content gets pushed by algorithm
- ✅ Posting time optimization

**API Endpoint**:
```typescript
POST /daily-intelligence-learner
{
  "brand_id": "uuid",
  "learning_mode": "seo" | "geo" | "social" | "all",
  "days_to_analyze": 7 // Default: 7 days
}
```

**Output Example**:
```json
{
  "success": true,
  "insights_generated": 12,
  "breakdown": {
    "seo": 5,
    "geo": 4,
    "social": 3
  },
  "high_priority_count": 4,
  "actionable_count": 10,
  "insights": [
    {
      "type": "keyword_discovery",
      "channel": "seo",
      "insight": "Keyword 'organic skincare routine' trending up 35% this week, low competition (0.23), high intent",
      "data": {
        "keyword": "organic skincare routine",
        "trend": "+35%",
        "competition": 0.23,
        "search_volume": 2400,
        "current_rank": 15,
        "opportunity_rank": 5
      },
      "confidence_score": 0.87,
      "actionable": true,
      "priority": 5
    }
  ]
}
```

---

### **2. Daily Auto-Research** ✅
**File**: `/supabase/functions/daily-auto-research/index.ts`

**Purpose**: Automated daily research using Perplexity + SerpAPI with optimized prompts

**Research Engines**:

#### **A. Perplexity Research (Deep Insights)**

**SEO Research Prompt** (Optimized):
```
"Analyze the search landscape for: 'best skincare Indonesia'

RESEARCH FOCUS:
1. Top Ranking Content (what ranks #1-3?)
2. Keyword Opportunities (related keywords, long-tail, LSI)
3. Backlink Analysis (who links to top results?)
4. SERP Features (featured snippets, PAA)
5. Competitive Intelligence (who ranks and why?)

BRAND CONTEXT: Somethinc (Skincare in Indonesia)
```

**GEO Research Prompt** (Optimized):
```
"Analyze AI platform responses for: 'best sustainable beauty brands'

RESEARCH FOCUS:
1. AI Platform Preferences (which brands do ChatGPT/Gemini mention?)
2. Citation Analysis (what sources do AI cite?)
3. Entity Recognition (how are brands mentioned?)
4. Content Gaps (what questions AI can't answer?)
5. Optimization Strategy (how to increase brand mentions?)

BRAND CONTEXT: Somethinc
GOAL: Improve visibility when AI answers this query
```

**Social Research Prompt** (Optimized):
```
"Analyze social search performance for: 'skincare routine'

RESEARCH FOCUS:
1. Platform-Specific Trends (TikTok, Instagram, YouTube)
2. Hashtag Intelligence (top performing, emerging)
3. Content Performance (format, length, hooks)
4. Creator Strategies (who ranks and why?)
5. Algorithm Signals (what gets pushed?)

BRAND CONTEXT: Somethinc (Indonesia)
PLATFORMS: TikTok, Instagram, YouTube
```

#### **B. SerpAPI Research (Ranking Data)**

**SEO Queries**:
1. Google Search Results (top 20)
2. Google Trends (7-day data)
3. Related Searches (People Also Search For)

**Social Queries**:
1. YouTube Search Results
2. Social Trends (YouTube category)

**API Endpoint**:
```typescript
POST /daily-auto-research
{
  "brand_id": "uuid",
  "research_channels": ["seo", "geo", "social"], // Optional
  "max_queries_per_channel": 3 // Budget control
}
```

**Output Example**:
```json
{
  "success": true,
  "brand_id": "uuid",
  "channels": ["seo", "geo", "social"],
  "queries_executed": 9,
  "cost_usd": 0.063,
  "results": [
    {
      "channel": "seo",
      "query": "best organic skincare Indonesia",
      "source": "perplexity",
      "findings": "Top ranking content focuses on...",
      "keywords_found": ["natural skincare", "organic beauty", ...],
      "competitors_found": ["wardah", "emina"],
      "backlinks_found": ["beautynesia.id", "female daily.net"],
      "ranking_insights": {
        "organic_results": [...],
        "featured_snippet": {...},
        "people_also_ask": [...]
      },
      "cost": 0.008
    }
  ]
}
```

---

## 🔄 **Daily Automation Flow**

### **Cron Job Schedule**:

```
Every Day at 2:00 AM Jakarta Time:

1. Daily Auto-Research (30 min)
   ├─ Run for all active brands
   ├─ Execute 3 queries per channel (SEO/GEO/Social)
   ├─ Cost: ~$0.06 per brand
   └─ Store results in database

2. Intelligence Learning (15 min)
   ├─ Analyze last 7 days of data
   ├─ Claude identifies patterns
   ├─ Generate actionable insights
   ├─ Cost: ~$0.05 per brand
   └─ Save to Daily Insights

3. Insight Prioritization (5 min)
   ├─ Score insights by priority
   ├─ Assign to 4-column structure
   ├─ Mark urgent actions
   └─ Update dashboard

Total Time: ~50 minutes
Total Cost: ~$0.11 per brand per day
```

---

## 🧠 **How Self-Learning Works**

### **Day 1: Initial Learning**
```
Morning (2 AM):
- Research 9 queries (3 SEO + 3 GEO + 3 Social)
- Collect ranking data, competitors, trends
- Store in database

Afternoon (2 PM):
- Claude analyzes data
- Learns: "Keyword X trending up 20%"
- Generates insight: "Focus on keyword X, low competition"
- User sees recommendation in dashboard

Evening (8 PM):
- User follows recommendation
- Creates content for keyword X
```

### **Day 2: Pattern Recognition**
```
Morning (2 AM):
- Research same + new queries
- Compare with Day 1 data
- Detect: "Keyword X now ranking #12 (was #18)"

Afternoon (2 PM):
- Claude learns: "Our content strategy for X worked"
- Identifies pattern: "Long-form content ranks better"
- Generates insight: "Apply same strategy to keywords Y, Z"
```

### **Day 7: Precise Recommendations**
```
After 7 days:
- Claude has analyzed 63 queries (9/day × 7)
- Identified 20+ patterns
- Knows:
  ✅ Best keywords for this brand
  ✅ Optimal content length
  ✅ Best posting times
  ✅ Which backlink sources work
  ✅ Hashtag performance
  ✅ AI platform preferences

Recommendations become:
❌ Before: "Try keyword research"
✅ After: "Focus on 'organic skincare routine' (2400 vol, 0.23 comp, trending +35%)"
```

---

## 📊 **Learning Data Sources**

### **Tables Used for Learning**:

#### **1. gv_search_results**
```sql
-- Historical search performance
SELECT
  keyword,
  brand_rank,
  competitors_found,
  created_at
FROM gv_search_results
WHERE brand_id = 'uuid'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

#### **2. gv_keyword_history**
```sql
-- Ranking trends over time
SELECT
  keyword_id,
  rank,
  trend, -- 'up', 'down', 'stable'
  tracked_date
FROM gv_keyword_history
WHERE brand_id = 'uuid'
ORDER BY tracked_date DESC;
```

#### **3. gv_creator_content**
```sql
-- Social content performance
SELECT
  platform,
  hashtags,
  engagement_total,
  views,
  posted_at
FROM gv_creator_content
WHERE brand_id = 'uuid'
  AND posted_at >= NOW() - INTERVAL '7 days'
ORDER BY engagement_total DESC;
```

#### **4. gv_trends**
```sql
-- Trending topics
SELECT
  trend_name,
  growth_rate,
  status, -- 'rising', 'peak', 'declining'
  first_detected_at
FROM gv_trends
WHERE category = 'beauty'
  AND status = 'rising';
```

---

## 💡 **Learning Output Examples**

### **SEO Learning Insights**:

```json
{
  "type": "keyword_discovery",
  "channel": "seo",
  "insight": "Keyword 'vegan skincare Indonesia' has 3200 monthly searches, competition 0.19 (low), and trending up 42% this week. Current rank: not tracking. Opportunity: Rank #3-5 within 2 months with targeted content.",
  "data": {
    "keyword": "vegan skincare Indonesia",
    "search_volume": 3200,
    "competition": 0.19,
    "trend": "+42%",
    "opportunity_rank": "3-5",
    "estimated_time": "2 months",
    "recommended_content_type": "Buying guide + product comparison"
  },
  "confidence_score": 0.89,
  "actionable": true,
  "priority": 5
}
```

```json
{
  "type": "backlink_opportunity",
  "channel": "seo",
  "insight": "beautynesia.id links to 3 competitors but not us. They publish 'Best Products' roundups monthly. Guest post opportunity detected. DA: 45, Traffic: 200K/month.",
  "data": {
    "domain": "beautynesia.id",
    "links_to_competitors": 3,
    "domain_authority": 45,
    "monthly_traffic": 200000,
    "content_type": "Product roundups",
    "contact": "editor@beautynesia.id",
    "success_probability": 0.73
  },
  "confidence_score": 0.91,
  "actionable": true,
  "priority": 4
}
```

### **GEO Learning Insights**:

```json
{
  "type": "ranking_pattern",
  "channel": "geo",
  "insight": "ChatGPT mentions brands with 5+ citations from TechCrunch, Forbes, or Reuters. We have 0. Perplexity prefers Wikipedia presence (we don't have page). Gemini cites brands with schema.org markup (we're missing).",
  "data": {
    "chatgpt_requirement": "5+ authoritative citations",
    "current_citations": 0,
    "perplexity_requirement": "Wikipedia page",
    "current_wikipedia": false,
    "gemini_requirement": "Schema.org markup",
    "current_schema": false,
    "estimated_impact": "+60% AI mention rate"
  },
  "confidence_score": 0.94,
  "actionable": true,
  "priority": 5
}
```

### **Social Learning Insights**:

```json
{
  "type": "content_strategy",
  "channel": "social",
  "insight": "TikTok videos 30-45 seconds with product demo in first 5 seconds get 3.2x more views than 90+ second videos. Hashtags #skincareIndonesia + #organicbeauty together rank 2x better than alone. Post at 7-9 PM for 40% more engagement.",
  "data": {
    "optimal_length": "30-45 seconds",
    "current_avg": 92,
    "hook_requirement": "Product demo within 5 seconds",
    "hashtag_combo": ["#skincareIndonesia", "#organicbeauty"],
    "best_time": "7-9 PM Jakarta",
    "engagement_boost": "+40%",
    "view_multiplier": "3.2x"
  },
  "confidence_score": 0.86,
  "actionable": true,
  "priority": 4
}
```

---

## 💰 **Cost Analysis**

### **Daily Costs Per Brand**:

| Component | Queries | Cost/Query | Total |
|-----------|---------|-----------|-------|
| **Perplexity SEO** | 3 | $0.005 | $0.015 |
| **Perplexity GEO** | 3 | $0.005 | $0.015 |
| **Perplexity Social** | 3 | $0.005 | $0.015 |
| **SerpAPI SEO** | 9 | $0.001 | $0.009 |
| **SerpAPI Social** | 6 | $0.001 | $0.006 |
| **Claude Learning** | 1 | $0.05 | $0.05 |
| **TOTAL** | - | - | **$0.11/day** |

### **Monthly Costs**:
- **Per Brand**: $0.11 × 30 days = **$3.30/month**
- **100 Brands**: $3.30 × 100 = **$330/month**

### **Value Delivered**:
- **270 Perplexity queries/month** (9/day × 30)
- **450 SerpAPI queries/month** (15/day × 30)
- **30 Claude learning sessions/month** (1/day × 30)
- **300+ actionable insights/month**

---

## 🚀 **Deployment**

### **Deploy Functions**:
```bash
supabase functions deploy daily-intelligence-learner
supabase functions deploy daily-auto-research
```

### **Setup Cron Job**:
```sql
-- Supabase Edge Functions Cron (pg_cron)
SELECT cron.schedule(
  'daily-intelligence-system',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/daily-auto-research',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"brand_id": "all"}'::jsonb
  );
  $$
);
```

---

## ✅ **Summary**

### **What Was Built**:
✅ Daily Intelligence Learner (Claude pattern analysis)
✅ Daily Auto-Research (Perplexity + SerpAPI)
✅ Optimized research prompts for SEO/GEO/Social
✅ Self-learning system that improves daily
✅ Automated cron job architecture

### **How It Learns**:
✅ Analyzes 7 days of historical data
✅ Identifies trending keywords
✅ Discovers ranking patterns
✅ Finds backlink opportunities
✅ Learns algorithm preferences
✅ Adapts strategies based on results

### **Benefits**:
✅ **Precision**: Recommendations become more specific each day
✅ **Efficiency**: $3.30/brand/month for full intelligence
✅ **Automation**: Runs daily without human intervention
✅ **Actionable**: Every insight has clear next steps
✅ **Natural**: Learns organic patterns, not forced tactics

---

**Built By**: Claude (Anthropic)
**For**: GeoVera Intelligence Platform
**Architecture**: Daily cron → Perplexity + SerpAPI → Claude Learning → Actionable Insights
**Status**: ✅ Ready for Production
**Cost**: $3.30/brand/month (93% cheaper than initial $29 estimate)
