# GeoVera Intelligence System - Complete Architecture
**Date:** February 15, 2026
**Type:** AI-Powered Brand Intelligence & Automation Platform

---

## 🎯 SYSTEM OVERVIEW

GeoVera adalah **autonomous brand intelligence platform** yang menggunakan AI untuk:
1. Research brand & competitors secara mendalam
2. Generate & distribute 300 strategic questions
3. Collect market intelligence dari multiple channels
4. Analyze data menjadi actionable insights
5. Convert insights menjadi to-do tasks & content ideas

---

## 🔄 7-STEP INTELLIGENCE CYCLE

### **STEP 1: Data Ingestion (Brand Onboarding)**

**When:** User completes onboarding
**Source:** Onboarding form data

**Data Collected:**
```javascript
{
    // Basic Brand Info
    brand_name: "Batik Nusantara",
    brand_category: "Fashion",
    brand_country: "Indonesia",
    brand_city: "Jakarta",

    // Business Details
    website: "https://batiknusantara.id",
    instagram: "@batiknusantara",
    tiktok: "@batiknusantara",
    target_audience: "Women 25-45, middle-upper class",
    price_range: "$50-$200",

    // Initial Context
    business_description: "Traditional Indonesian batik with modern designs",
    main_competitors: ["Batik Keris", "Danar Hadi", "Alleira"],
    goals: ["Increase brand awareness", "Improve SEO ranking"],

    // Metadata
    onboarding_completed: true,
    subscription_status: "trial", // or "paid"
    onboarding_date: "2026-02-15"
}
```

**Database:** `gv_brands` table
**Status:** ✅ Already implemented in onboarding.html

---

### **STEP 2: Brief Research (Perplexity - Free Tier)**

**When:** Immediately after onboarding (before payment)
**Purpose:** Give user preview of what full research will reveal
**Research Depth:** Surface level (10 queries max)

**Perplexity Queries:**
1. "What is [Brand Name] in [Country]? Overview and reputation"
2. "Top 3 competitors of [Brand Name] in [Category] [Country]"
3. "Current social media presence of [Brand Name]"
4. "Basic SEO ranking for [Brand Name] website"
5. "Main target audience for [Category] in [Country]"

**Output - Brief Report:**
```markdown
# Brand Intelligence Preview: Batik Nusantara

## Brand Overview
- Established: 2015
- Known for: Traditional batik with modern twist
- Social presence: 25K Instagram followers, 10K TikTok

## Competitive Landscape
1. **Batik Keris** - Market leader, 200+ stores
2. **Danar Hadi** - Heritage brand, strong offline presence
3. **Alleira** - Modern competitor, strong online

## Quick Insights
- ⚠️ Website SEO ranking: Page 3 for "batik modern Jakarta"
- ✅ Strong Instagram engagement (4.5%)
- ⚠️ Limited TikTok presence
- 💡 Opportunity: Partner with fashion influencers

**This is a preview. Subscribe for deep analysis →**
```

**Stored in:** `gv_research_reports` table
```sql
INSERT INTO gv_research_reports (
    user_id,
    brand_id,
    report_type,
    report_data,
    status,
    created_at
) VALUES (
    user.id,
    brand.id,
    'brief_research',
    jsonb_brief_report,
    'completed',
    NOW()
);
```

**User sees:** Preview card in dashboard with "Upgrade for full report" CTA

---

### **STEP 3: Deep Research (Perplexity - Paid Subscription)**

**When:** Immediately after subscription payment confirmed
**Purpose:** Comprehensive brand intelligence gathering
**Research Depth:** A to Z analysis (100+ queries)

**Perplexity Deep Research Topics:**

**3.1 Brand Deep Dive (20 queries)**
- Brand history and evolution
- Product range and pricing strategy
- Brand voice and messaging
- Customer reviews and sentiment
- Awards and recognition
- Press mentions and media coverage
- Brand partnerships and collaborations
- Offline presence (stores, events)
- Online presence (all platforms)
- Brand strengths and weaknesses

**3.2 Competitor Analysis (30 queries)**
- Identify all competitors (direct + indirect)
- Competitor market share
- Competitor pricing strategies
- Competitor social media strategies
- Competitor SEO keywords
- Competitor content strategies
- Competitor influencer partnerships
- Competitor customer reviews
- Competitor strengths/weaknesses
- Competitive gaps and opportunities

**3.3 SEO Analysis (15 queries)**
- Current keyword rankings
- Backlink profile
- Domain authority
- Page load speed
- Mobile optimization
- Top performing pages
- SEO gaps vs competitors
- Local SEO presence
- Search volume for brand keywords
- Featured snippets opportunities

**3.4 GEO (Generative Engine Optimization) (10 queries)**
- Brand visibility in AI search (ChatGPT, Perplexity, Gemini)
- AI-generated summaries about brand
- How AI describes brand vs competitors
- Entity recognition in AI systems
- Knowledge graph presence
- AI search result positioning
- Voice search optimization
- AI recommendation likelihood
- Structured data implementation
- Schema markup quality

**3.5 Social Media Deep Dive (20 queries)**

**Instagram:**
- Follower demographics
- Engagement rate trends
- Top performing posts
- Hashtag strategy analysis
- Stories vs Feed performance
- Reels performance
- Influencer collaborations
- Competitor comparison

**TikTok:**
- Follower growth rate
- Viral content analysis
- Trending sounds usage
- Hashtag challenges participation
- Creator partnerships
- Competitor TikTok strategies

**Other Platforms:**
- Facebook presence
- Twitter/X mentions
- Pinterest boards
- YouTube channel (if any)

**3.6 Market & Audience Intelligence (15 queries)**
- Target market size in [Country]
- Customer demographics
- Purchase behavior patterns
- Price sensitivity
- Seasonal trends
- Geographic distribution
- Customer pain points
- Customer desires and aspirations
- Brand perception study
- Market trends and forecasts

**3.7 Content & Creative Analysis (10 queries)**
- Content themes that resonate
- Visual style analysis
- Copywriting tone analysis
- Video vs photo performance
- User-generated content (UGC)
- Content gaps
- Trending content formats
- Competitor content strategies
- Influencer content styles
- Viral content patterns

**Deep Research Report Structure:**
```json
{
    "research_id": "uuid",
    "brand_id": "uuid",
    "research_date": "2026-02-15",
    "research_type": "deep_research",

    "brand_profile": {
        "overview": "...",
        "strengths": [...],
        "weaknesses": [...],
        "opportunities": [...],
        "threats": [...]
    },

    "competitors": [
        {
            "name": "Batik Keris",
            "market_share": "35%",
            "strengths": [...],
            "weaknesses": [...],
            "strategies": {
                "seo": {...},
                "social": {...},
                "content": {...}
            }
        }
    ],

    "seo_analysis": {
        "current_rankings": {...},
        "keyword_opportunities": [...],
        "backlink_strategy": {...},
        "technical_seo": {...},
        "competitor_comparison": {...}
    },

    "geo_analysis": {
        "ai_visibility": "Medium",
        "ai_descriptions": [...],
        "optimization_recommendations": [...]
    },

    "social_media": {
        "instagram": {...},
        "tiktok": {...},
        "engagement_benchmarks": {...},
        "content_recommendations": [...]
    },

    "market_intelligence": {
        "market_size": "...",
        "target_audience": {...},
        "trends": [...],
        "opportunities": [...]
    },

    "content_analysis": {
        "top_themes": [...],
        "visual_style": {...},
        "performance_metrics": {...}
    }
}
```

**Stored in:** `gv_research_reports` table with type = 'deep_research'

**Processing Time:** ~30 minutes
**User notification:** Email + dashboard notification when complete

---

### **STEP 4: Generate 300 Strategic Questions (Claude)**

**When:** After deep research completes
**Purpose:** Create intelligence-gathering questions distributed across channels
**Method:** Reverse engineering research data

**Claude's Analysis Process:**
```
Input: Deep Research Report (100+ pages)
↓
Analyze: Gaps, opportunities, competitor strategies, market trends
↓
Reverse Engineer: What questions would reveal this intelligence?
↓
Generate: 300 strategic questions
↓
Categorize: By channel and purpose
```

**300 Questions Breakdown:**

**4.1 TikTok Questions (75 questions)**
Purpose: Social search, trend discovery, viral content intelligence
```
Examples:
1. "Best batik modern designs Jakarta 2026"
2. "How to style batik for office work Indonesia"
3. "Batik Nusantara vs Batik Keris comparison"
4. "Affordable luxury batik brands Jakarta"
5. "Batik fashion trends Indonesia 2026"
...
```

**4.2 Instagram Questions (75 questions)**
Purpose: Visual discovery, influencer intelligence, UGC research
```
Examples:
1. "Where to buy authentic batik Jakarta"
2. "Batik outfit ideas for wedding guest"
3. "Modern batik fashion inspiration"
4. "Batik Nusantara customer reviews"
5. "Best batik brands for millennials Indonesia"
...
```

**4.3 SEO/Web Questions (50 questions)**
Purpose: Search ranking, knowledge graph, featured snippets
```
Examples:
1. "Batik Nusantara Jakarta review"
2. "Best batik stores in Jakarta"
3. "Traditional vs modern batik difference"
4. "Batik price range Indonesia"
5. "How to care for batik fabric"
...
```

**4.4 AI Chat Questions (50 questions)**
Purpose: GEO optimization, AI training, entity recognition
```
Examples for ChatGPT, Gemini, Claude, Perplexity:
1. "Recommend batik brands in Jakarta for modern designs"
2. "Compare Batik Nusantara with competitors"
3. "What makes Batik Nusantara unique?"
4. "Best batik for office wear in Indonesia"
5. "Batik Nusantara price and quality analysis"
...
```

**4.5 General Web Index (50 questions)**
Purpose: Backlinks, citations, brand mentions
```
Examples:
1. "Batik Nusantara sustainability practices"
2. "Batik Nusantara designer collaboration"
3. "History of Batik Nusantara brand"
4. "Batik Nusantara store locations"
5. "Batik Nusantara shipping policy"
...
```

**Question Distribution Strategy:**
```javascript
{
    "distribution_schedule": {
        "tiktok": {
            "questions_per_day": 2-3,
            "via": "Search queries, comments, hashtag research",
            "timing": "Peak engagement hours"
        },
        "instagram": {
            "questions_per_day": 2-3,
            "via": "Search, DMs to influencers, comment analysis",
            "timing": "Morning/evening peak"
        },
        "seo": {
            "questions_per_day": 1-2,
            "via": "Google Search, Bing, organic search behavior",
            "timing": "Spread throughout day"
        },
        "ai_chat": {
            "questions_per_day": 1-2,
            "via": "ChatGPT, Gemini, Claude, Perplexity queries",
            "timing": "Random intervals"
        },
        "web_index": {
            "questions_per_day": 1-2,
            "via": "Blog comments, forum posts, Q&A sites",
            "timing": "Business hours"
        }
    },

    "monthly_total": 300,
    "daily_distribution": 10,
    "automation_level": "High",
    "human_oversight": "Weekly review"
}
```

**Stored in:** `gv_strategic_questions` table
```sql
CREATE TABLE gv_strategic_questions (
    id UUID PRIMARY KEY,
    brand_id UUID REFERENCES gv_brands(id),
    question_text TEXT NOT NULL,
    channel VARCHAR(50), -- 'tiktok', 'instagram', 'seo', 'ai_chat', 'web_index'
    category VARCHAR(100), -- 'competitor', 'product', 'pricing', etc.
    priority INT, -- 1-5 (5 = highest)
    status VARCHAR(20), -- 'pending', 'deployed', 'answered', 'analyzed'
    deployed_at TIMESTAMP,
    response_data JSONB, -- Collected responses
    intelligence_value INT, -- 1-10 score
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### **STEP 5: Intelligence Collection & Analysis**

**When:** Continuous (24/7 automated)
**Purpose:** Gather market intelligence from deployed questions

**5.1 Daily Perplexity Research (Using 300 Questions)**

**Every Day at 03:00 AM (Server Time):**
```javascript
// Automated Daily Research Flow
async function dailyIntelligenceGathering() {
    // Get today's questions (10 questions/day from 300 pool)
    const todayQuestions = await selectDailyQuestions(brand_id, 10);

    // Perplexity researches each question
    for (const question of todayQuestions) {
        const research = await perplexity.research({
            query: question.text,
            focus: [question.channel, question.category],
            depth: 'comprehensive',
            include_sources: true
        });

        // Store results
        await storeResearchResults(question.id, research);
    }

    // Analyze collected data
    const insights = await analyzeResearch(brand_id);

    return insights;
}
```

**Research Categories:**

**A. Market Research (Daily)**
- Trending topics in [Category] [Country]
- Competitor activities and launches
- Customer sentiment shifts
- Pricing changes in market
- New entrants and threats
- Market size fluctuations

**B. Brand Research (Daily)**
- Brand mentions across platforms
- Customer reviews and feedback
- Influencer mentions
- Press coverage
- Social media sentiment
- Search volume trends

**C. Competitor Research (Daily)**
- Competitor content performance
- Competitor pricing changes
- Competitor partnerships
- Competitor SEO rankings
- Competitor ad campaigns
- Competitor customer feedback

**5.2 LLM SEO Intelligence**

**Purpose:** Track brand visibility in AI-generated content

**Daily Checks:**
```javascript
// Check brand presence in AI responses
const aiChecks = [
    {
        platform: "ChatGPT",
        query: "Best batik brands in Jakarta",
        check: "Is Batik Nusantara mentioned?",
        position: null, // Track ranking in AI response
        sentiment: null // Positive/Neutral/Negative
    },
    {
        platform: "Gemini",
        query: "Recommend modern batik for office wear",
        check: "Is Batik Nusantara recommended?",
        position: null,
        sentiment: null
    },
    {
        platform: "Claude",
        query: "Compare Indonesian batik brands",
        check: "How is Batik Nusantara described?",
        position: null,
        sentiment: null
    },
    {
        platform: "Perplexity",
        query: "Where to buy quality batik in Jakarta",
        check: "Is Batik Nusantara included in results?",
        position: null,
        sentiment: null
    }
];

// Execute checks and track changes
const llmSeoScore = await calculateLLMSEOScore(aiChecks);
```

**5.3 GEO (Generative Engine Optimization) Tracking**

**Metrics Tracked:**
- AI mention frequency
- AI recommendation likelihood
- Position in AI-generated lists
- Sentiment in AI descriptions
- Entity recognition accuracy
- Knowledge graph completeness

**5.4 Social Search Intelligence**

**TikTok Search:**
- Hashtag performance
- Sound/music trends
- Creator collaborations
- Viral content patterns
- Comment sentiment
- Engagement metrics

**Instagram Search:**
- Explore page visibility
- Hashtag reach
- Reel performance
- Story engagement
- DM conversations
- Shop tags performance

**Data Aggregation:**
```sql
CREATE TABLE gv_intelligence_data (
    id UUID PRIMARY KEY,
    brand_id UUID,
    collection_date DATE,

    -- Market Intelligence
    market_trends JSONB,
    competitor_activities JSONB,
    customer_sentiment JSONB,

    -- SEO Intelligence
    keyword_rankings JSONB,
    backlink_growth JSONB,
    organic_traffic JSONB,

    -- GEO Intelligence
    ai_mentions JSONB,
    ai_sentiment JSONB,
    ai_ranking_position JSONB,

    -- Social Intelligence
    tiktok_metrics JSONB,
    instagram_metrics JSONB,
    engagement_rates JSONB,

    -- Metadata
    intelligence_score INT, -- Overall 1-100
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### **STEP 6: Generate Actionable Insights**

**When:** Daily at 06:00 AM (after intelligence collection)
**Purpose:** Convert raw data into strategic insights

**6.1 Data Analysis (Claude)**

**Input:**
- Deep research report
- 30 days of intelligence data
- Competitor tracking data
- Market trends
- Customer sentiment

**Claude's Analysis Framework:**
```javascript
const analysisFramework = {
    // Comprehensive data analysis
    dataPoints: [
        'intelligence_data',
        'research_reports',
        'competitor_tracking',
        'market_trends',
        'customer_feedback',
        'seo_rankings',
        'geo_scores',
        'social_metrics'
    ],

    // Analysis dimensions
    dimensions: [
        'sentiment_analysis',
        'trend_detection',
        'competitive_positioning',
        'opportunity_identification',
        'threat_assessment',
        'performance_benchmarking'
    ],

    // Confidence levels
    confidence: {
        high: '>80% data accuracy',
        medium: '60-80% data accuracy',
        low: '<60% data accuracy'
    }
};
```

**6.2 Insight Categories**

**A. Negative Sentiment Detection**
```javascript
{
    type: "negative_sentiment",
    severity: "high", // low, medium, high, critical
    source: "TikTok comments",
    issue: "Customers complaining about slow shipping",
    data: {
        mentions: 45,
        sentiment_score: -0.7,
        trend: "increasing",
        affected_products: ["Batik Blazer", "Batik Dress"],
        time_period: "Last 7 days"
    },
    impact: {
        brand_reputation: "High risk",
        potential_lost_sales: "Estimated 15-20 orders/week",
        urgency: "Immediate action required"
    },
    recommendation: "Address shipping delays publicly, offer compensation"
}
```

**B. Crisis Early Detection**
```javascript
{
    type: "crisis_warning",
    severity: "critical",
    trigger: "Viral negative review",
    details: {
        platform: "Instagram",
        influencer: "@fashionista_jkt (150K followers)",
        post: "Disappointed with Batik Nusantara quality",
        engagement: "8K likes, 500 comments",
        sentiment: "85% negative",
        spread_velocity: "Rapid (shared 200+ times)"
    },
    risk_assessment: {
        brand_damage: "High",
        estimated_reach: "500K+ people",
        conversion_impact: "20-30% drop in next 2 weeks"
    },
    recommended_action: {
        priority: "URGENT - within 4 hours",
        steps: [
            "Public response on Instagram",
            "Direct contact with influencer",
            "Quality assurance review",
            "Compensation offer",
            "PR statement preparation"
        ]
    }
}
```

**C. Opportunity Detection**
```javascript
{
    type: "opportunity",
    category: "market_gap",
    opportunity: "Rising demand for sustainable batik",
    data: {
        search_volume: "+150% in 30 days",
        platforms: ["TikTok", "Instagram", "Google"],
        keywords: [
            "eco-friendly batik",
            "sustainable Indonesian fashion",
            "ethical batik brands"
        ],
        competitor_coverage: "Low (only 1 competitor)",
        market_potential: "High"
    },
    recommendation: {
        action: "Launch sustainable batik line",
        timeline: "Q2 2026",
        investment: "Medium",
        expected_roi: "High",
        steps: [
            "Source eco-friendly materials",
            "Develop sustainable collection",
            "Create marketing campaign",
            "Partner with eco-influencers"
        ]
    },
    priority: "High"
}
```

**D. Action Items (What Needs to Be Done)**
```javascript
{
    type: "action_required",
    category: "seo_optimization",
    issue: "Competitor ranking higher for key terms",
    current_state: {
        brand_ranking: "Page 2, Position 15",
        competitor_ranking: "Page 1, Position 3",
        keyword: "modern batik Jakarta",
        search_volume: "2,400/month",
        traffic_loss: "~800 visitors/month"
    },
    required_actions: [
        {
            task: "Optimize homepage for 'modern batik Jakarta'",
            priority: "High",
            effort: "Medium",
            timeline: "2 weeks",
            responsible: "SEO team",
            expected_impact: "Move to Page 1"
        },
        {
            task: "Create blog content around 'modern batik'",
            priority: "High",
            effort: "Low",
            timeline: "1 week",
            responsible: "Content team",
            expected_impact: "Long-tail keyword coverage"
        },
        {
            task: "Build backlinks from fashion blogs",
            priority: "Medium",
            effort: "High",
            timeline: "4 weeks",
            responsible: "Outreach team",
            expected_impact: "Domain authority boost"
        }
    ]
}
```

**E. Score & Rank Compared to Competitors**
```javascript
{
    type: "competitive_analysis",
    date: "2026-02-15",

    overall_scores: [
        {
            brand: "Batik Nusantara",
            overall_score: 72,
            rank: 3,
            trend: "↑ +5 from last month"
        },
        {
            brand: "Batik Keris",
            overall_score: 85,
            rank: 1,
            trend: "→ stable"
        },
        {
            brand: "Danar Hadi",
            overall_score: 78,
            rank: 2,
            trend: "↓ -2 from last month"
        },
        {
            brand: "Alleira",
            overall_score: 68,
            rank: 4,
            trend: "↑ +8 from last month (rising fast!)"
        }
    ],

    detailed_scores: {
        seo: {
            "Batik Nusantara": 65,
            "Batik Keris": 88,
            "Danar Hadi": 75,
            "Alleira": 70
        },
        geo: {
            "Batik Nusantara": 58,
            "Batik Keris": 72,
            "Danar Hadi": 60,
            "Alleira": 65
        },
        social_search: {
            "Batik Nusantara": 78,
            "Batik Keris": 85,
            "Danar Hadi": 82,
            "Alleira": 88 // Best performer!
        },
        brand_sentiment: {
            "Batik Nusantara": 80,
            "Batik Keris": 90,
            "Danar Hadi": 85,
            "Alleira": 75
        }
    },

    insights: [
        {
            finding: "Alleira is rising fast in social search",
            implication: "Strong TikTok presence attracting Gen Z",
            action: "Increase TikTok investment, collaborate with young creators"
        },
        {
            finding: "We're underperforming in GEO",
            implication: "AI chatbots rarely recommend our brand",
            action: "Optimize for AI discoverability, improve structured data"
        },
        {
            finding: "Strong brand sentiment but weak SEO",
            implication: "Customers love us but can't find us",
            action: "Urgent SEO optimization needed"
        }
    ]
}
```

**Stored in:** `gv_insights` table
```sql
CREATE TABLE gv_insights (
    id UUID PRIMARY KEY,
    brand_id UUID,
    insight_date DATE,

    -- Insight metadata
    insight_type VARCHAR(50), -- 'negative_sentiment', 'crisis', 'opportunity', etc.
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    category VARCHAR(100),

    -- Core data
    title TEXT,
    description TEXT,
    data JSONB, -- Full analysis data

    -- Impact assessment
    impact_score INT, -- 1-100
    urgency VARCHAR(20), -- 'low', 'medium', 'high', 'urgent'
    confidence_level VARCHAR(20), -- 'low', 'medium', 'high'

    -- Status
    status VARCHAR(20), -- 'new', 'reviewed', 'actioned', 'resolved'
    assigned_to UUID,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

---

### **STEP 7: Convert Insights to Actions**

**When:** Immediately after insights generation
**Purpose:** Make insights actionable with specific tasks and content ideas

**7.1 Generate To-Do Tasks**

**Task Generation Logic:**
```javascript
async function generateActionTasks(insight) {
    // Analyze insight
    const insightType = insight.type;
    const severity = insight.severity;
    const category = insight.category;

    // Generate appropriate tasks
    let tasks = [];

    if (insightType === 'negative_sentiment') {
        tasks = [
            {
                task: "Monitor social media mentions",
                priority: "High",
                assignee: "Social Media Manager",
                deadline: "Daily",
                recurring: true
            },
            {
                task: "Respond to negative comments",
                priority: "High",
                assignee: "Customer Service",
                deadline: "Within 2 hours",
                recurring: true
            },
            {
                task: "Analyze root cause of complaints",
                priority: "High",
                assignee: "Operations Manager",
                deadline: "3 days"
            },
            {
                task: "Implement solution to address issue",
                priority: "High",
                assignee: "Operations Team",
                deadline: "1 week"
            }
        ];
    }

    if (insightType === 'opportunity') {
        tasks = [
            {
                task: "Research opportunity in detail",
                priority: "Medium",
                assignee: "Strategy Team",
                deadline: "1 week"
            },
            {
                task: "Create go-to-market plan",
                priority: "Medium",
                assignee: "Marketing Manager",
                deadline: "2 weeks"
            },
            {
                task: "Develop product/content for opportunity",
                priority: "Medium",
                assignee: "Product Team",
                deadline: "1 month"
            },
            {
                task: "Launch campaign",
                priority: "Medium",
                assignee: "Marketing Team",
                deadline: "6 weeks"
            }
        ];
    }

    if (category === 'seo_optimization') {
        tasks = insight.required_actions.map(action => ({
            task: action.task,
            priority: action.priority,
            assignee: action.responsible,
            deadline: action.timeline,
            expected_impact: action.expected_impact
        }));
    }

    return tasks;
}
```

**Task Structure:**
```javascript
{
    id: "uuid",
    brand_id: "uuid",
    insight_id: "uuid", // Link to parent insight

    // Task details
    task_title: "Optimize homepage for 'modern batik Jakarta'",
    task_description: "Update meta tags, headings, and content to target keyword",
    task_type: "seo_optimization",

    // Assignment
    priority: "high", // low, medium, high, urgent
    assignee: "SEO Specialist",
    status: "pending", // pending, in_progress, completed, cancelled

    // Timeline
    deadline: "2026-03-01",
    estimated_effort: "4 hours",
    actual_effort: null,

    // Impact
    expected_impact: "Move from Page 2 to Page 1 for target keyword",
    success_metric: "Ranking Position < 10",

    // Tracking
    created_at: "2026-02-15",
    started_at: null,
    completed_at: null,

    // Related data
    related_tasks: [], // Dependencies
    attachments: [], // Files, links, etc.
    comments: [] // Team discussions
}
```

**Stored in:** `gv_tasks` table

**User sees in Dashboard:**
```
┌─────────────────────────────────────────────────────┐
│ 📋 Today's To-Do Tasks                              │
├─────────────────────────────────────────────────────┤
│ 🔴 URGENT (2)                                       │
│ • Respond to negative review on Instagram          │
│   Deadline: Within 2 hours | Assigned: CS Team     │
│                                                     │
│ • Address shipping delay complaints                │
│   Deadline: Today | Assigned: Operations           │
│                                                     │
│ 🟠 HIGH PRIORITY (5)                                │
│ • Optimize homepage for "modern batik Jakarta"     │
│   Deadline: 2 weeks | Assigned: SEO Team           │
│                                                     │
│ • Create TikTok content for sustainable batik      │
│   Deadline: This week | Assigned: Content Team     │
│                                                     │
│ 🟢 MEDIUM PRIORITY (8)                              │
│ • Research eco-friendly material suppliers         │
│   Deadline: 1 month | Assigned: Procurement        │
│                                                     │
│ [View All Tasks →]                                  │
└─────────────────────────────────────────────────────┘
```

---

**7.2 Generate Content Ideation**

**Content Generation Based on Insights:**
```javascript
async function generateContentIdeas(insights, brand) {
    const contentIdeas = [];

    for (const insight of insights) {
        if (insight.type === 'opportunity') {
            // Opportunity = content opportunity
            const ideas = await claudeGenerate({
                prompt: `Based on this opportunity: "${insight.title}"
                        Brand: ${brand.name} (${brand.category} in ${brand.country})

                        Generate 10 content ideas for:
                        - 3 TikTok videos
                        - 3 Instagram posts/reels
                        - 2 Blog articles
                        - 2 Email campaigns`,

                context: insight.data
            });

            contentIdeas.push(...ideas);
        }

        if (insight.type === 'competitor_analysis') {
            // Learn from competitor success
            const ideas = await claudeGenerate({
                prompt: `Competitor ${insight.data.competitor} is performing well at:
                        ${insight.data.success_areas}

                        Generate content ideas to compete:
                        - What content can we create?
                        - What angle should we take?
                        - How can we differentiate?`,

                brand_voice: brand.brand_voice
            });

            contentIdeas.push(...ideas);
        }

        if (insight.category === 'trending_topic') {
            // Trend = timely content opportunity
            const ideas = await claudeGenerate({
                prompt: `Trending: ${insight.data.trend}
                        Trend velocity: ${insight.data.growth_rate}

                        Create content to capitalize on trend:
                        - Quick-to-produce content (24-48h)
                        - Evergreen content for long-term
                        - Collaborations to amplify reach`,

                deadline: 'urgent'
            });

            contentIdeas.push(...ideas);
        }
    }

    return contentIdeas;
}
```

**Content Idea Structure:**
```javascript
{
    id: "uuid",
    brand_id: "uuid",
    insight_id: "uuid",

    // Content details
    content_type: "tiktok_video", // tiktok_video, instagram_reel, blog_post, etc.
    content_title: "How to Style Sustainable Batik for Office",
    content_brief: "Show 3 outfit ideas using eco-friendly batik pieces...",

    // Strategy
    goal: "Capitalize on sustainable fashion trend",
    target_audience: "Working women 25-40",
    key_message: "Sustainable batik is stylish AND professional",

    // Creative direction
    visual_style: "Clean, modern, office setting",
    tone: "Professional yet approachable",
    hook: "You don't have to sacrifice style for sustainability",
    call_to_action: "Shop sustainable batik collection",

    // Production
    estimated_effort: "2 hours",
    required_assets: ["Batik blazer", "Office props", "Model"],
    deadline: "2026-02-20",

    // Distribution
    platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    hashtags: ["#SustainableFashion", "#BatikModern", "#EcoFriendly"],
    posting_time: "7 PM (peak engagement)",

    // Performance prediction
    predicted_reach: "10K-50K views",
    predicted_engagement: "5-8%",
    predicted_conversions: "15-25 clicks to website",

    // Status
    status: "draft", // draft, approved, in_production, scheduled, published
    assigned_to: "Content Creator",

    // Metadata
    created_at: "2026-02-15",
    published_at: null
}
```

**Stored in:** `gv_content_ideas` table

**User sees in Content Studio:**
```
┌─────────────────────────────────────────────────────┐
│ 💡 Content Ideas Generated from Insights            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🎥 TikTok Video Ideas (3 new)                       │
│                                                     │
│ 1. "How to Style Sustainable Batik for Office"     │
│    Insight: Rising sustainable fashion trend        │
│    Predicted: 10K-50K views | 5-8% engagement       │
│    Deadline: 5 days                                 │
│    [Use This Idea]                                  │
│                                                     │
│ 2. "Batik Nusantara vs Fast Fashion: True Cost"    │
│    Insight: Price sensitivity concern detected      │
│    Predicted: 5K-20K views | 8-12% engagement       │
│    Deadline: 1 week                                 │
│    [Use This Idea]                                  │
│                                                     │
│ 📸 Instagram Post Ideas (3 new)                     │
│                                                     │
│ 1. "Meet Our Artisan: Behind the Batik"            │
│    Insight: Customers value authenticity            │
│    Predicted: 2K-5K likes | 4-6% engagement         │
│    [Use This Idea]                                  │
│                                                     │
│ ✍️ Blog Article Ideas (2 new)                       │
│                                                     │
│ 1. "Complete Guide to Batik Care and Maintenance"  │
│    Insight: Common question from customers          │
│    SEO value: High (500 searches/month)             │
│    [Create Article]                                 │
│                                                     │
│ [View All Ideas →]                                  │
└─────────────────────────────────────────────────────┘
```

**Content Idea Prioritization:**
```javascript
// Auto-prioritize content ideas
function prioritizeContent(ideas) {
    return ideas.sort((a, b) => {
        // Priority factors:
        const scoreA = calculateContentScore(a);
        const scoreB = calculateContentScore(b);
        return scoreB - scoreA;
    });
}

function calculateContentScore(idea) {
    let score = 0;

    // Urgency (trending topics = higher score)
    if (idea.deadline === 'urgent') score += 50;
    else if (idea.deadline < 7 days) score += 30;

    // Predicted impact
    score += idea.predicted_reach / 1000; // Higher reach = higher score
    score += idea.predicted_engagement * 5;

    // Effort (lower effort = higher score for quick wins)
    if (idea.estimated_effort < 2 hours) score += 20;
    else if (idea.estimated_effort < 4 hours) score += 10;

    // Strategic alignment
    if (idea.goal === 'crisis_response') score += 100; // Crisis = top priority
    if (idea.goal === 'capitalize_on_trend') score += 40;
    if (idea.goal === 'competitor_response') score += 30;

    return score;
}
```

---

## 📊 COMPLETE DATA FLOW VISUALIZATION

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: ONBOARDING                                           │
│ User Input → gv_brands table                                 │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: BRIEF RESEARCH (Perplexity)                          │
│ 10 queries → Preview Report → Show to user                   │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: DEEP RESEARCH (Perplexity - After Payment)           │
│ 100+ queries → Comprehensive Report → gv_research_reports    │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: GENERATE 300 QUESTIONS (Claude)                      │
│ Reverse engineer research → 300 strategic questions          │
│ → gv_strategic_questions → Deploy across channels            │
│                                                               │
│ Distribution:                                                 │
│ • TikTok: 75 questions                                        │
│ • Instagram: 75 questions                                     │
│ • SEO/Web: 50 questions                                       │
│ • AI Chat: 50 questions                                       │
│ • Web Index: 50 questions                                     │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: DAILY INTELLIGENCE COLLECTION (24/7 Automated)       │
│                                                               │
│ Perplexity Daily Research:                                   │
│ • 10 questions/day from 300 pool                              │
│ • Market research                                             │
│ • Brand monitoring                                            │
│ • Competitor tracking                                         │
│                                                               │
│ LLM SEO Tracking:                                             │
│ • ChatGPT, Gemini, Claude, Perplexity                         │
│ • Check brand mentions & recommendations                      │
│ • Track sentiment & positioning                               │
│                                                               │
│ Social Search Intelligence:                                   │
│ • TikTok: Hashtags, trends, engagement                        │
│ • Instagram: Explore, reach, stories                          │
│                                                               │
│ → gv_intelligence_data (daily aggregation)                    │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 6: GENERATE INSIGHTS (Claude - Daily 06:00 AM)          │
│                                                               │
│ Analyze:                                                      │
│ • 30 days intelligence data                                   │
│ • Deep research report                                        │
│ • Competitor benchmarks                                       │
│ • Market trends                                               │
│                                                               │
│ Output Insights:                                              │
│ ✅ Negative Sentiment Detection                               │
│ ✅ Crisis Early Detection                                     │
│ ✅ Opportunity Identification                                 │
│ ✅ Action Items (What needs to be done)                       │
│ ✅ Score & Rank (vs Competitors)                              │
│    • SEO Score                                                │
│    • GEO Score                                                │
│    • Social Search Score                                      │
│    • Overall Brand Score                                      │
│                                                               │
│ → gv_insights table                                           │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 7: CONVERT TO ACTIONS (Immediate)                       │
│                                                               │
│ A. Generate To-Do Tasks:                                      │
│    • Crisis response tasks                                    │
│    • SEO optimization tasks                                   │
│    • Competitor response tasks                                │
│    • Opportunity execution tasks                              │
│    → gv_tasks table                                           │
│                                                               │
│ B. Generate Content Ideas:                                    │
│    • TikTok videos                                            │
│    • Instagram posts/reels                                    │
│    • Blog articles                                            │
│    • Email campaigns                                          │
│    → gv_content_ideas table                                   │
│                                                               │
│ User sees:                                                    │
│ • Task list in Dashboard                                      │
│ • Content ideas in Content Studio                             │
└──────────────────────────────────────────────────────────────┘

     ↓ CONTINUOUS CYCLE ↓

┌──────────────────────────────────────────────────────────────┐
│ EXECUTION & MONITORING                                        │
│                                                               │
│ • User executes tasks                                         │
│ • User creates content from ideas                             │
│ • System monitors performance                                 │
│ • Results feed back into intelligence cycle                   │
│ • Continuous improvement                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA (Complete)

```sql
-- 1. Brand profiles
CREATE TABLE gv_brands (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES gv_users(id),
    brand_name VARCHAR(255),
    brand_category VARCHAR(100),
    brand_country VARCHAR(100),
    brand_city VARCHAR(100),
    website VARCHAR(255),
    instagram VARCHAR(255),
    tiktok VARCHAR(255),
    business_description TEXT,
    target_audience TEXT,
    main_competitors TEXT[],
    goals TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Research reports
CREATE TABLE gv_research_reports (
    id UUID PRIMARY KEY,
    user_id UUID,
    brand_id UUID,
    report_type VARCHAR(50), -- 'brief_research', 'deep_research'
    report_data JSONB,
    status VARCHAR(20), -- 'pending', 'processing', 'completed'
    perplexity_queries_used INT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- 3. Strategic questions (300 questions)
CREATE TABLE gv_strategic_questions (
    id UUID PRIMARY KEY,
    brand_id UUID,
    question_text TEXT NOT NULL,
    channel VARCHAR(50), -- 'tiktok', 'instagram', 'seo', 'ai_chat', 'web_index'
    category VARCHAR(100),
    priority INT, -- 1-5
    status VARCHAR(20), -- 'pending', 'deployed', 'answered', 'analyzed'
    deployed_at TIMESTAMP,
    response_data JSONB,
    intelligence_value INT, -- 1-10
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Intelligence data (daily collection)
CREATE TABLE gv_intelligence_data (
    id UUID PRIMARY KEY,
    brand_id UUID,
    collection_date DATE,
    market_trends JSONB,
    competitor_activities JSONB,
    customer_sentiment JSONB,
    keyword_rankings JSONB,
    backlink_growth JSONB,
    ai_mentions JSONB,
    ai_sentiment JSONB,
    tiktok_metrics JSONB,
    instagram_metrics JSONB,
    intelligence_score INT, -- 1-100
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Insights
CREATE TABLE gv_insights (
    id UUID PRIMARY KEY,
    brand_id UUID,
    insight_date DATE,
    insight_type VARCHAR(50),
    severity VARCHAR(20),
    category VARCHAR(100),
    title TEXT,
    description TEXT,
    data JSONB,
    impact_score INT,
    urgency VARCHAR(20),
    confidence_level VARCHAR(20),
    status VARCHAR(20), -- 'new', 'reviewed', 'actioned', 'resolved'
    assigned_to UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- 6. Tasks
CREATE TABLE gv_tasks (
    id UUID PRIMARY KEY,
    brand_id UUID,
    insight_id UUID REFERENCES gv_insights(id),
    task_title TEXT,
    task_description TEXT,
    task_type VARCHAR(50),
    priority VARCHAR(20),
    assignee VARCHAR(255),
    status VARCHAR(20), -- 'pending', 'in_progress', 'completed', 'cancelled'
    deadline DATE,
    estimated_effort VARCHAR(50),
    actual_effort VARCHAR(50),
    expected_impact TEXT,
    success_metric TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- 7. Content ideas
CREATE TABLE gv_content_ideas (
    id UUID PRIMARY KEY,
    brand_id UUID,
    insight_id UUID,
    content_type VARCHAR(50),
    content_title TEXT,
    content_brief TEXT,
    goal TEXT,
    target_audience TEXT,
    key_message TEXT,
    visual_style TEXT,
    tone TEXT,
    hook TEXT,
    call_to_action TEXT,
    estimated_effort VARCHAR(50),
    required_assets TEXT[],
    deadline DATE,
    platforms TEXT[],
    hashtags TEXT[],
    predicted_reach VARCHAR(50),
    predicted_engagement VARCHAR(50),
    status VARCHAR(20), -- 'draft', 'approved', 'in_production', 'scheduled', 'published'
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- 8. Competitor tracking
CREATE TABLE gv_competitor_tracking (
    id UUID PRIMARY KEY,
    brand_id UUID,
    competitor_name VARCHAR(255),
    tracking_date DATE,
    seo_score INT,
    geo_score INT,
    social_score INT,
    overall_score INT,
    rank INT,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 IMPLEMENTATION PRIORITIES

### Phase 1: Foundation (Weeks 1-2)
- [x] Step 1: Onboarding data collection (DONE)
- [ ] Database schema creation
- [ ] Perplexity API integration
- [ ] Brief research implementation
- [ ] Deep research implementation

### Phase 2: Intelligence Engine (Weeks 3-4)
- [ ] Step 4: 300 questions generation (Claude)
- [ ] Question distribution system
- [ ] Step 5: Daily intelligence collection (Perplexity)
- [ ] LLM SEO tracking
- [ ] Social search monitoring

### Phase 3: Insights & Actions (Weeks 5-6)
- [ ] Step 6: Insights generation (Claude)
- [ ] Sentiment analysis
- [ ] Crisis detection
- [ ] Opportunity identification
- [ ] Competitive scoring

### Phase 4: Action Conversion (Weeks 7-8)
- [ ] Step 7: Task generation
- [ ] Content ideation system
- [ ] Task management UI
- [ ] Content studio integration

### Phase 5: Automation & Optimization (Weeks 9-10)
- [ ] Automated daily cycles
- [ ] Performance monitoring
- [ ] System optimization
- [ ] User testing & refinement

---

**Last Updated:** February 15, 2026
**Status:** Architecture Complete - Ready for Implementation
**Next Step:** Begin Phase 1 implementation

---

*GeoVera Intelligence Platform - Autonomous Brand Intelligence System*
