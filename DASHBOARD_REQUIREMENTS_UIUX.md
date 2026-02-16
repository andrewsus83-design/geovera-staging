# GeoVera Dashboard Requirements - UI/UX Specification
## Complete Dashboard Feature Requirements & Data Structure

---

## 📋 Table of Contents

1. [Dashboard Overview](#1-dashboard-overview)
2. [Multi-Channel Backlink Opportunities](#2-multi-channel-backlink-opportunities)
3. [SEO Intelligence Dashboard](#3-seo-intelligence-dashboard)
4. [GEO (Generative Engine Optimization)](#4-geo-generative-engine-optimization)
5. [Social Search & Viral Tracking](#5-social-search--viral-tracking)
6. [Insights & Opportunities](#6-insights--opportunities)
7. [Radar - Competitor Intelligence](#7-radar---competitor-intelligence)
8. [Content Studio](#8-content-studio)
9. [To-Do & Action Items](#9-to-do--action-items)
10. [AI Chat Interface](#10-ai-chat-interface)
11. [Data Models & API Endpoints](#11-data-models--api-endpoints)
12. [Design System Guidelines](#12-design-system-guidelines)

---

## 1. Dashboard Overview

### Main Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│ GeoVera                    [Brand Selector ▼]    [Profile]  │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────┬───────────────────────────────────────────┐   │
│ │           │                                           │   │
│ │ Sidebar   │           Main Content Area              │   │
│ │           │                                           │   │
│ └───────────┴───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar Menu Items

```
📊 Overview (Dashboard Home)
🔗 Multi-Channel Backlinks ⭐ NEW
🔍 SEO Intelligence
🤖 GEO Tracking
📱 Social Search
💡 Insights
🎯 Radar (Competitors)
📝 Content Studio
✅ To-Do
💬 AI Chat
⚙️ Settings
```

### Dashboard Home Widgets

User sees at-a-glance summary of all features:

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard Overview - Last 30 Days                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │ BACKLINKS│  │ KEYWORDS │  │ CITATIONS│  │ INSIGHTS │    │
│ │    73    │  │   127    │  │    47    │  │    38    │    │
│ │  new opps│  │ tracking │  │ AI cites │  │ this week│    │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│ ⚠️ Urgent Actions (3)                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔥 Hacker News thread trending - Post within 2 hours!  │ │
│ │ 📧 3 negative brand mentions - Review needed           │ │
│ │ 💡 Content gap opportunity - 82% citation probability  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📈 Performance Trends                                       │
│ [Weekly Chart: Traffic, Conversions, Brand Mentions]       │
│                                                             │
│ 🎯 Top Performing Channels                                 │
│ 1. LinkedIn Pulse - 1.8K referral traffic                  │
│ 2. Medium - 1.2K referral traffic                          │
│ 3. GitHub - 890 referral traffic                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Channel Backlink Opportunities

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Multi-Channel Backlink Opportunities                        │
│                                                             │
│ [Filters] [Platform ▼] [Urgency ▼] [Status ▼] [Export]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📊 Overview Stats                                           │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┐        │
│ │ Total   │ Urgent  │ High    │ Pending │ Completed│        │
│ │   73    │   3     │   18    │   52    │    21    │        │
│ └─────────┴─────────┴─────────┴─────────┴─────────┘        │
│                                                             │
│ ⭐ PERPLEXITY AI-RANKED TOP 20                              │
│ [View Mode: Cards | List | Table]                          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🥇 RANK #1 - Perplexity Score: 94/100                  │ │
│ │ Platform: HACKER NEWS                    [⚠️ URGENT]    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ "Ask HN: Best analytics tools for SaaS?"               │ │
│ │ Posted: 3 hours ago | 127 ⬆ | 43 💬                   │ │
│ │                                                         │ │
│ │ 🎯 Intelligence                                         │ │
│ │ ├─ Traffic: RISING 📈                                  │ │
│ │ ├─ Audience: 96/100 (tech decision-makers)            │ │
│ │ ├─ Decision Makers: 78%                                │ │
│ │ └─ Timing: ⚠️ NOW (post within 2h)                    │ │
│ │                                                         │ │
│ │ 📈 Predictions                                          │ │
│ │ ├─ Traffic: 2,400/month                                │ │
│ │ ├─ Conversion: 12%                                     │ │
│ │ └─ Signups: ~288                                       │ │
│ │                                                         │ │
│ │ 💡 "URGENT: Thread trending with 78% decision-makers.  │ │
│ │     Comment within 2 hours for max visibility."        │ │
│ │                                                         │ │
│ │ [View Template] [Post Now] [Add to To-Do] [Dismiss]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Load More Rankings 4-20...]                               │
│                                                             │
│ 📊 By Platform                                              │
│ [Tabs: All | Medium | LinkedIn | Reddit | GitHub | ...]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Opportunity Card Components (Detailed)

**Required UI Elements per Opportunity Card:**

1. **Header Section**
   - Rank badge (🥇 #1, 🥈 #2, 🥉 #3, or #4-20)
   - Perplexity score (large, prominent: 94/100)
   - Platform badge with icon
   - Urgency indicator (⚠️ URGENT / ⏰ Time-Sensitive / 📅 Standard)

2. **Title & Meta**
   - Opportunity title (clickable, opens URL)
   - Author name + follower count / influence score
   - Platform-specific metrics (upvotes, claps, stars, etc.)
   - Time posted/published

3. **Intelligence Section (Collapsible)**
   - Traffic trend indicator with icon (📈 Rising, ➡️ Stable, 📉 Declining)
   - Audience quality score with progress bar
   - Decision-maker percentage with visual indicator
   - Author responsiveness score
   - Optimal timing recommendation

4. **Prediction Section**
   - Predicted monthly traffic (numeric + trend)
   - Predicted conversion rate (%)
   - Estimated signups/leads
   - Brand lift score

5. **AI Recommendation Box**
   - Perplexity's strategic recommendation (text)
   - Color-coded by urgency (red = urgent, yellow = soon, green = standard)

6. **Action Buttons**
   - Primary CTA (varies by platform: "Post Now", "Send DM", "Submit PR")
   - "View Template" (opens modal with customized outreach template)
   - "Add to To-Do" (creates task)
   - "Track" (add to tracking list)
   - "Dismiss" (hide from list)

7. **Status Indicator**
   - Current status: Discovered | Outreach Sent | Responded | Completed
   - Progress indicator if in progress

### Filters & Sorting

**Filter Options:**
```
Platform:
☐ All Platforms
☐ Medium (8)
☐ LinkedIn Pulse (6)
☐ Hacker News (2)
☐ Reddit (8)
☐ GitHub (7)
☐ Dev.to (5)
☐ Substack (3)
☐ Product Hunt (4)
☐ Notion (2)
☐ Quora (3)

Urgency:
☐ All
☐ Urgent (3)
☐ High Priority (18)
☐ Medium (32)
☐ Low (20)

Status:
☐ All
☐ Discovered (52)
☐ Outreach Sent (14)
☐ Responded (5)
☐ Completed (2)

Decision Maker %:
[Slider: 0% ────────●──── 100%]
(Filter by audience quality)

Predicted Traffic:
[Slider: 0 ────●──── 5000+/month]

Sort By:
• Perplexity Rank (default)
• Urgency Score
• Predicted Traffic
• Decision Maker %
• Date Discovered
```

### Modal: View Outreach Template

```
┌─────────────────────────────────────────────────────────────┐
│ Outreach Template - Hacker News                        [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Platform: Hacker News                                       │
│ Approach: Helpful Comment                                   │
│ Estimated Time: 10 minutes                                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Comment Template:                                       │ │
│ │                                                         │ │
│ │ This is a great discussion! For anyone looking for     │ │
│ │ analytics tools that don't require a data scientist,   │ │
│ │ I've had success with [approach].                      │ │
│ │                                                         │ │
│ │ [YourBrand] actually addresses this exact use case -   │ │
│ │ we've helped [social proof] achieve [result].          │ │
│ │                                                         │ │
│ │ The key difference is [unique value prop].             │ │
│ │                                                         │ │
│ │ More details: [link]                                   │ │
│ │                                                         │ │
│ │ Happy to answer questions about implementation.        │ │
│ │                                                         │ │
│ │ [Edit in Template ✏️]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💡 Tips for Success:                                        │
│ • Be genuinely helpful, not salesy                         │
│ • Share specific results/numbers                           │
│ • Engage with follow-up questions                          │
│ • Post within 2 hours while thread is hot                  │
│                                                             │
│ [Copy to Clipboard] [Open in HN] [Save & Close]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Required from Backend

**API Endpoint:** `GET /api/multichannel-backlinks`

**Response Structure:**
```typescript
{
  summary: {
    total_opportunities: 73,
    urgent: 3,
    high_priority: 18,
    pending: 52,
    completed: 21,
    platforms_tracked: 10,
    avg_opportunity_value: 78
  },

  perplexity_ranked_top20: [
    {
      id: "uuid",
      rank: 1,
      platform: "hackernews",
      platform_display: "Hacker News",

      // Opportunity details
      title: "Ask HN: Best analytics tools for SaaS?",
      url: "https://news.ycombinator.com/item?id=...",
      author: "username",
      author_influence: 85,

      // Engagement
      engagement_metrics: {
        upvotes: 127,
        comments: 43,
        shares: 12
      },
      posted_at: "2024-02-16T10:30:00Z",

      // Scores
      perplexity_score: 94,
      total_opportunity_value: 92,

      // Intelligence
      intelligence: {
        traffic_trend: "rising",
        traffic_trend_percentage: 45,
        audience_quality: 96,
        audience_relevance: 94,
        decision_maker_percentage: 78,
        author_responsiveness: 88,
        typical_response_time: "within 2h (active thread)",
        collaboration_openness: 85
      },

      // Timing
      timing: {
        optimal_timing: "now",
        urgency_score: 95,
        urgency_level: "urgent", // urgent | high | medium | low
        time_sensitivity: "high",
        deadline: "2024-02-16T12:30:00Z" // 2 hours from posted
      },

      // Predictions
      predictions: {
        referral_traffic_monthly: 2400,
        conversion_rate: 0.12,
        estimated_signups: 288,
        brand_lift: 92
      },

      // Recommendation
      perplexity_recommendation: "URGENT: This thread is trending...",

      // Outreach
      outreach_difficulty: "easy",
      recommended_approach: "helpful_comment",
      outreach_template: "This is a great discussion! For anyone...",

      // Status
      status: "discovered", // discovered | outreach_sent | responded | completed
      outreach_sent_at: null,
      response_received_at: null,

      // Actions available
      actions: ["view_template", "post_now", "add_to_todo", "track", "dismiss"]
    },
    // ... 19 more ranked opportunities
  ],

  by_platform: {
    medium: { count: 8, avg_score: 87 },
    linkedin: { count: 6, avg_score: 91 },
    hackernews: { count: 2, avg_score: 94 },
    reddit: { count: 8, avg_score: 79 },
    github: { count: 7, avg_score: 85 },
    devto: { count: 5, avg_score: 83 },
    substack: { count: 3, avg_score: 89 },
    producthunt: { count: 4, avg_score: 80 },
    notion: { count: 2, avg_score: 76 },
    quora: { count: 3, avg_score: 81 }
  }
}
```

---

## 3. SEO Intelligence Dashboard

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ SEO Intelligence                                            │
│                                                             │
│ [Time Range: Last 30 Days ▼] [Export Report]              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📊 Key Metrics                                              │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Keywords │ Rankings │ Traffic  │ Backlinks│              │
│ │   150    │   #3.2   │  +24%    │   +12    │              │
│ │ tracking │   avg    │          │ this week│              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│                                                             │
│ 🎯 Top Keyword Opportunities (Perplexity Scored)           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Keyword: "marketing analytics platform"                │ │
│ │ ├─ Current Rank: #8                                    │ │
│ │ ├─ Ranking Probability: 76%                            │ │
│ │ ├─ Traffic Potential: 1,200/month                      │ │
│ │ ├─ Competition: Medium                                 │ │
│ │ └─ Quick Win Score: 82/100                             │ │
│ │                                                         │ │
│ │ 💡 Recommendation: "Update content with 2024 data,     │ │
│ │    add comparison table, target featured snippet"      │ │
│ │                                                         │ │
│ │ [View Details] [Create Content Brief] [Track]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📈 Ranking Progress                                         │
│ [Chart: Keyword rankings over time]                        │
│                                                             │
│ 🔗 Backlink Analysis                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ New Backlinks (12 this week)                           │ │
│ │ • example.com (DA 85) - Blog post mention             │ │
│ │ • another.com (DA 72) - Resource list                 │ │
│ │ [View All Backlinks]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required Components

1. **Metric Cards**
   - Total keywords tracking
   - Average ranking position
   - Traffic trend (% change)
   - New backlinks count

2. **Keyword Opportunity Cards**
   - Keyword + current rank
   - Ranking probability (scored by Perplexity)
   - Traffic potential estimate
   - Competition level
   - Quick win score
   - AI recommendation
   - Action buttons

3. **Ranking Progress Chart**
   - Line chart showing ranking changes
   - Multi-keyword comparison
   - Annotations for major events

4. **Backlink List**
   - New backlinks with DA score
   - Source description
   - Link to detail view

### Data Required

**API Endpoint:** `GET /api/seo-intelligence`

```typescript
{
  metrics: {
    keywords_tracking: 150,
    avg_ranking: 3.2,
    traffic_change_percentage: 24,
    new_backlinks_count: 12
  },

  top_keyword_opportunities: [
    {
      keyword: "marketing analytics platform",
      current_rank: 8,
      ranking_probability: 0.76,
      traffic_potential: 1200,
      competition: "medium",
      quick_win_score: 82,
      recommendation: "Update content with 2024 data...",
      actions: ["view_details", "create_brief", "track"]
    }
  ],

  ranking_progress: {
    labels: ["Jan 1", "Jan 8", "Jan 15", "Jan 22", "Jan 29"],
    datasets: [
      {
        keyword: "analytics tool",
        data: [12, 10, 8, 7, 5]
      }
    ]
  },

  new_backlinks: [
    {
      source_domain: "example.com",
      domain_authority: 85,
      description: "Blog post mention",
      url: "https://example.com/post",
      discovered_at: "2024-02-14"
    }
  ]
}
```

---

## 4. GEO (Generative Engine Optimization)

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ GEO - AI Citation Tracking                                  │
│                                                             │
│ [Time Range ▼] [Export Citations]                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🤖 Citation Performance                                     │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Citations│ AI Score │ Predicted│ Trending │              │
│ │    47    │  78/100  │ 12.4K/mo │    ↑ 5   │              │
│ │ tracked  │          │ AI views │          │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│                                                             │
│ 🏆 Top Cited Content                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. "Ultimate Guide to SEO" - 12 citations              │ │
│ │    ├─ Sources: Wikipedia, Forbes, TechCrunch           │ │
│ │    ├─ AI Visibility: 92/100                            │ │
│ │    ├─ Est. Impressions: 3,200/month                    │ │
│ │    └─ Value: High                                      │ │
│ │    [View Sources] [Optimize Further]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💡 Citation Opportunities                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "Sustainable Packaging Research"                       │ │
│ │ Citation Probability: 82%                              │ │
│ │                                                         │ │
│ │ Why this will get cited:                               │ │
│ │ • Data-driven topic (AI engines love data)             │ │
│ │ • Low competition (citation gap)                       │ │
│ │ • High search demand                                   │ │
│ │                                                         │ │
│ │ Recommended Format:                                     │ │
│ │ ✓ Research study with statistics                       │ │
│ │ ✓ Expert quotes                                        │ │
│ │ ✓ Clear H2/H3 structure                                │ │
│ │                                                         │ │
│ │ Est. AI Impressions: 4,500/month                       │ │
│ │                                                         │ │
│ │ [Generate Brief] [Add to Calendar] [Track]            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📊 Citation Sources Breakdown                              │
│ [Pie Chart: Wikipedia, News Sites, Blogs, etc.]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required Components

1. **Performance Metrics**
   - Total citations
   - AI visibility score
   - Predicted monthly AI views
   - Trending citations count

2. **Top Cited Content Cards**
   - Content title + citation count
   - Citation sources list
   - AI visibility score
   - Estimated impressions
   - Value indicator (High/Medium/Low)
   - Action buttons

3. **Citation Opportunity Cards**
   - Opportunity title
   - Citation probability (%)
   - Why it will get cited (bullet points)
   - Recommended format checklist
   - Estimated impressions
   - Action buttons

4. **Citation Sources Chart**
   - Pie/donut chart showing source breakdown
   - Interactive (click to filter)

### Data Required

**API Endpoint:** `GET /api/geo-citations`

```typescript
{
  metrics: {
    total_citations: 47,
    ai_visibility_score: 78,
    predicted_monthly_impressions: 12400,
    trending_citations: 5
  },

  top_cited_content: [
    {
      id: "uuid",
      title: "Ultimate Guide to SEO",
      citation_count: 12,
      sources: [
        { domain: "wikipedia.org", authority: 100 },
        { domain: "forbes.com", authority: 95 },
        { domain: "techcrunch.com", authority: 92 }
      ],
      ai_visibility_score: 92,
      estimated_monthly_impressions: 3200,
      strategic_value: "high"
    }
  ],

  citation_opportunities: [
    {
      id: "uuid",
      title: "Sustainable Packaging Research",
      citation_probability: 0.82,
      reasons: [
        "Data-driven topic (AI engines love data)",
        "Low competition (citation gap)",
        "High search demand"
      ],
      recommended_format: {
        content_type: "research_study",
        checklist: [
          "Research study with statistics",
          "Expert quotes",
          "Clear H2/H3 structure",
          "Data visualizations"
        ]
      },
      estimated_impressions: 4500,
      priority: "high"
    }
  ],

  source_breakdown: {
    labels: ["Wikipedia", "News Sites", "Blogs", "Forums", "Other"],
    data: [15, 12, 10, 7, 3]
  }
}
```

---

## 5. Social Search & Viral Tracking

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Social Search - Viral Intelligence                          │
│                                                             │
│ [Platform Filter ▼] [Time Range ▼] [Export]               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔥 Viral Performance                                        │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Mentions │ Sentiment│ Viral    │ Influencer│              │
│ │    23    │   68% +  │  78/100  │     3     │              │
│ │ last 7d  │          │ potential│  mentions │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│                                                             │
│ ⭐ Top Viral Opportunity                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🐦 @TechInfluencer (45K followers) on Twitter          │ │
│ │ "Just tried [YourBrand] - game changer for analytics!" │ │
│ │                                                         │ │
│ │ Viral Potential: 78/100                                │ │
│ │ Influencer Score: 82/100                               │ │
│ │ Est. Reach: 38,000                                     │ │
│ │                                                         │ │
│ │ ⚡ Recommended Action:                                  │ │
│ │ Amplify within 24 hours for maximum impact             │ │
│ │                                                         │ │
│ │ [Thank Publicly] [Retweet] [Engage] [Add to Campaign] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💬 Recent Mentions                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✅ Positive (18)  ⚠️ Neutral (3)  ❌ Negative (2)      │ │
│ │                                                         │ │
│ │ [Tabs: All | Positive | Neutral | Negative]            │ │
│ │                                                         │ │
│ │ • @user1: "Love the new analytics dashboard!" (2h ago)│ │
│ │   Platform: Twitter | Reach: 3.2K                      │ │
│ │   [Reply] [Amplify] [Track]                            │ │
│ │                                                         │ │
│ │ • @user2: "Best tool for marketing teams" (5h ago)    │ │
│ │   Platform: LinkedIn | Reach: 8.5K                     │ │
│ │   [Comment] [Share] [Track]                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🎯 Trending Topics (Viral Opportunities)                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "AI-powered analytics"                                 │ │
│ │ Trend Velocity: 89% ⚠️ (Act now!)                     │ │
│ │ Viral Probability: 76%                                 │ │
│ │ Optimal Platform: LinkedIn                             │ │
│ │ Best Timing: Within 48 hours                           │ │
│ │ Est. Reach: 45,000                                     │ │
│ │                                                         │ │
│ │ Suggested Content:                                      │ │
│ │ • Thread: "Why AI-powered analytics matters..."        │ │
│ │ • Infographic: Key stats about AI analytics            │ │
│ │ • Poll: "How are you using AI in analytics?"           │ │
│ │                                                         │ │
│ │ [Generate Post] [Schedule] [Add to Content Calendar]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required Components

1. **Viral Performance Metrics**
   - Total mentions (time-filtered)
   - Sentiment breakdown (% positive)
   - Viral potential score
   - Influencer mention count

2. **Top Viral Opportunity Card**
   - Influencer name + follower count
   - Mention text
   - Viral potential score
   - Influencer score
   - Estimated reach
   - Recommended action
   - Action buttons

3. **Recent Mentions List**
   - Sentiment filter tabs
   - Mention cards showing:
     - User + mention text
     - Platform badge
     - Estimated reach
     - Time ago
     - Action buttons

4. **Trending Topics Cards**
   - Topic name
   - Trend velocity (% + visual indicator)
   - Viral probability
   - Optimal platform
   - Best timing
   - Estimated reach
   - Suggested content ideas (bullets)
   - Action buttons

### Data Required

**API Endpoint:** `GET /api/social-search`

```typescript
{
  metrics: {
    mentions_last_7d: 23,
    sentiment_positive_percentage: 68,
    viral_potential_avg: 78,
    influencer_mentions: 3
  },

  top_viral_opportunity: {
    platform: "twitter",
    author: "@TechInfluencer",
    author_followers: 45000,
    mention_text: "Just tried [YourBrand] - game changer for analytics!",
    viral_potential: 78,
    influencer_score: 82,
    estimated_reach: 38000,
    recommended_action: "Amplify within 24 hours for maximum impact",
    actions: ["thank_publicly", "retweet", "engage", "add_to_campaign"]
  },

  recent_mentions: [
    {
      id: "uuid",
      platform: "twitter",
      author: "@user1",
      author_followers: 3200,
      mention_text: "Love the new analytics dashboard!",
      sentiment: "positive",
      estimated_reach: 3200,
      posted_at: "2024-02-16T12:30:00Z",
      actions: ["reply", "amplify", "track"]
    }
  ],

  trending_topics: [
    {
      id: "uuid",
      topic: "AI-powered analytics",
      trend_velocity: 0.89,
      viral_probability: 0.76,
      optimal_platform: "linkedin",
      best_timing: "within 48 hours",
      estimated_reach: 45000,
      suggested_content: [
        "Thread: 'Why AI-powered analytics matters...'",
        "Infographic: Key stats about AI analytics",
        "Poll: 'How are you using AI in analytics?'"
      ],
      urgency: "high"
    }
  ]
}
```

---

## 6. Insights & Opportunities

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Insights & Opportunities                                    │
│                                                             │
│ [Filter: All | Opportunities | Threats | Trends] [Export] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📊 This Week's Intelligence (38 insights)                  │
│                                                             │
│ 🔥 Top Opportunities (5 suggested)                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Content Gap: "AI-powered analytics"                 │ │
│ │    Priority: 92/100 | ROI: 88/100 | Effort: Medium    │ │
│ │                                                         │ │
│ │    Why this matters:                                    │ │
│ │    • 3 competitors have weak coverage                  │ │
│ │    • Ranking probability: 76%                          │ │
│ │    • Citation probability: 81% (GEO opportunity!)      │ │
│ │                                                         │ │
│ │    Next Steps:                                          │ │
│ │    ✓ Create data-driven guide (2000+ words)           │ │
│ │    ✓ Target "ai analytics tools" (1.2K searches/mo)   │ │
│ │    ✓ Reach out to 8 potential citation sources        │ │
│ │                                                         │ │
│ │    [Create Content Brief] [Add to To-Do] [Track]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📈 Trending (2 new)                                         │
│ • "Predictive analytics" - velocity 0.89 - Act now!       │
│ • "Data visualization" - velocity 0.72                     │
│                                                             │
│ ⚠️ Threats (1 urgent)                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3 negative brand mentions detected                     │ │
│ │ Priority: Urgent | Impact: High                        │ │
│ │                                                         │ │
│ │ Sources: Reddit (2), Twitter (1)                       │ │
│ │ Common Theme: "Pricing concerns"                       │ │
│ │                                                         │ │
│ │ Recommended Actions:                                    │ │
│ │ 1. Review pricing communication                        │ │
│ │ 2. Draft FAQ update                                    │ │
│ │ 3. Direct outreach to users                            │ │
│ │                                                         │ │
│ │ [View Mentions] [Create Response] [Add to To-Do]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💡 Opportunity Tracker                                      │
│ [View opportunities by status: Discovered | In Progress |  │
│  Completed]                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required Components

1. **Summary Header**
   - Total insights count
   - Filter tabs (All, Opportunities, Threats, Trends)
   - Export button

2. **Opportunity Cards**
   - Opportunity title + type
   - Priority score (1-100)
   - ROI score (1-100)
   - Effort level (Low/Medium/High)
   - "Why this matters" section (bullets)
   - "Next Steps" checklist
   - Action buttons

3. **Trending Section**
   - Trend name
   - Velocity score
   - Urgency indicator

4. **Threat Cards**
   - Threat description
   - Priority level
   - Impact level
   - Details (sources, themes)
   - Recommended actions (numbered list)
   - Action buttons

5. **Opportunity Tracker**
   - Status filter (Discovered, In Progress, Completed)
   - Progress indicators

### Data Required

**API Endpoint:** `GET /api/insights`

```typescript
{
  summary: {
    total_insights: 38,
    opportunities: 28,
    threats: 4,
    trends: 6
  },

  top_opportunities: [
    {
      id: "uuid",
      type: "content_gap",
      title: "AI-powered analytics",
      priority: 92,
      roi_score: 88,
      effort: "medium",

      why_matters: [
        "3 competitors have weak coverage",
        "Ranking probability: 76%",
        "Citation probability: 81% (GEO opportunity!)"
      ],

      next_steps: [
        "Create data-driven guide (2000+ words)",
        "Target 'ai analytics tools' (1.2K searches/mo)",
        "Reach out to 8 potential citation sources"
      ],

      confidence_score: 0.88,
      channel: "seo",

      actions: ["create_brief", "add_to_todo", "track"]
    }
  ],

  trending: [
    {
      topic: "Predictive analytics",
      velocity: 0.89,
      urgency: "high"
    }
  ],

  threats: [
    {
      id: "uuid",
      title: "3 negative brand mentions detected",
      priority: "urgent",
      impact: "high",

      details: {
        sources: ["Reddit (2)", "Twitter (1)"],
        common_theme: "Pricing concerns"
      },

      recommended_actions: [
        "Review pricing communication",
        "Draft FAQ update",
        "Direct outreach to users"
      ],

      actions: ["view_mentions", "create_response", "add_to_todo"]
    }
  ]
}
```

---

## 7. Radar - Competitor Intelligence

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Radar - Competitor Intelligence                             │
│                                                             │
│ [Competitors: All ▼] [Activity Type ▼] [Time Range ▼]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎯 Tracked Competitors                                      │
│ [Competitor A] [Competitor B] [Competitor C] [+ Add]       │
│                                                             │
│ 📊 Activity Overview (Last 7 Days)                          │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Activities│ High     │ Content  │ Backlinks│              │
│ │    24    │ Threat: 3│ Published│  Gained  │              │
│ │          │          │     8    │     5    │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│                                                             │
│ ⚠️ High-Threat Activities                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Competitor.com published "Ultimate Guide to SEO"       │ │
│ │ Threat Level: HIGH ⚠️                                   │ │
│ │                                                         │ │
│ │ Why it matters:                                         │ │
│ │ • Targets your primary keyword "SEO guide"             │ │
│ │ • Already ranking #3 on Google                         │ │
│ │ • Has 2.5K backlinks                                   │ │
│ │ • Content quality: 92/100                              │ │
│ │                                                         │ │
│ │ Recommended Response:                                   │ │
│ │ 1. Update your existing guide with 2024 data           │ │
│ │ 2. Add interactive tools (your differentiator)         │ │
│ │ 3. Reach out to 15 sites linking to their guide        │ │
│ │                                                         │ │
│ │ [Create To-Do] [Generate Brief] [Dismiss]             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💡 Competitive Gaps (3 opportunities)                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • "AI-powered SEO tools" - weak coverage               │ │
│ │   Opportunity Score: 85/100                            │ │
│ │   [Exploit Gap]                                        │ │
│ │                                                         │ │
│ │ • "Local SEO for SaaS" - no content found              │ │
│ │   Opportunity Score: 92/100                            │ │
│ │   [Create Content]                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📈 Recent Activity Timeline                                 │
│ [Activity feed showing competitor actions chronologically] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required Components

1. **Competitor Selector**
   - Tabs for each tracked competitor
   - Add new competitor button

2. **Activity Metrics**
   - Total activities
   - High threat count
   - Content published
   - Backlinks gained

3. **Threat Activity Cards**
   - Competitor name + action
   - Threat level badge
   - "Why it matters" section (bullets)
   - Recommended response (numbered list)
   - Action buttons

4. **Competitive Gaps Cards**
   - Topic/keyword
   - Opportunity score
   - Brief description
   - Action button

5. **Activity Timeline**
   - Chronological feed
   - Activity type icons
   - Competitor badges
   - Expandable details

### Data Required

**API Endpoint:** `GET /api/radar`

```typescript
{
  tracked_competitors: [
    { id: "uuid", name: "Competitor A", domain: "competitora.com" },
    { id: "uuid", name: "Competitor B", domain: "competitorb.com" }
  ],

  metrics: {
    total_activities_7d: 24,
    high_threat_count: 3,
    content_published: 8,
    backlinks_gained: 5
  },

  high_threat_activities: [
    {
      id: "uuid",
      competitor_id: "uuid",
      competitor_name: "Competitor.com",
      activity_type: "content_published",
      threat_level: "high",

      details: {
        title: "Ultimate Guide to SEO",
        url: "https://competitor.com/guide",
        current_rank: 3,
        backlink_count: 2500,
        content_quality: 92
      },

      why_matters: [
        "Targets your primary keyword 'SEO guide'",
        "Already ranking #3 on Google",
        "Has 2.5K backlinks",
        "Content quality: 92/100"
      ],

      recommended_response: [
        "Update your existing guide with 2024 data",
        "Add interactive tools (your differentiator)",
        "Reach out to 15 sites linking to their guide"
      ],

      detected_at: "2024-02-16T10:00:00Z"
    }
  ],

  competitive_gaps: [
    {
      topic: "AI-powered SEO tools",
      competitor_coverage: "weak",
      opportunity_score: 85,
      description: "Competitors have outdated or weak coverage"
    }
  ],

  activity_timeline: [
    {
      timestamp: "2024-02-16T14:30:00Z",
      competitor_name: "Competitor A",
      activity_type: "backlink_gained",
      summary: "Gained backlink from example.com (DA 85)"
    }
  ]
}
```

---

## 8. Content Studio

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Content Studio                                              │
│                                                             │
│ [View: Briefs | Ideas | Calendar] [+ New Brief]           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📝 AI-Generated Content Briefs (10 new)                    │
│                                                             │
│ [Filter: All | High Priority | By Topic | By Status]       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [HIGH PRIORITY]                                        │ │
│ │ "Sustainable Packaging Solutions for E-commerce"       │ │
│ │                                                         │ │
│ │ 🎯 Opportunity Scores:                                  │ │
│ │ ├─ Ranking Probability: 78%                            │ │
│ │ ├─ Citation Probability: 82% (5 sites likely to cite) │ │
│ │ └─ Viral Potential: 67%                                │ │
│ │                                                         │ │
│ │ 📊 Target Metrics:                                      │ │
│ │ • Keyword: "sustainable ecommerce packaging"           │ │
│ │ • Search Volume: 800/month                             │ │
│ │ • Competition: Medium                                   │ │
│ │ • Est. Traffic: 640/month @ rank #3                   │ │
│ │                                                         │ │
│ │ 📝 Content Outline:                                     │ │
│ │ 1. Introduction: The packaging crisis                  │ │
│ │ 2. 5 sustainable alternatives                          │ │
│ │ 3. Cost-benefit analysis                               │ │
│ │ 4. Implementation roadmap                              │ │
│ │ [View Full Outline]                                    │ │
│ │                                                         │ │
│ │ 🎨 Recommendations:                                     │ │
│ │ SEO: Target featured snippet with comparison table     │ │
│ │ GEO: Format as data-driven research for AI citations   │ │
│ │ Social: LinkedIn performs best for this topic          │ │
│ │                                                         │ │
│ │ [Generate Full Draft] [Add to Calendar] [Assign]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💡 Quick Content Ideas (Social Posts)                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • "Predictive Analytics Trends" - LinkedIn             │ │
│ │   Viral Probability: 72% | Best Time: Tomorrow 10am    │ │
│ │   [Generate Post] [Schedule]                           │ │
│ │                                                         │ │
│ │ • "Data Visualization Tips" - Twitter Thread           │ │
│ │   Viral Probability: 68% | Best Time: Today 3pm        │ │
│ │   [Generate Thread] [Schedule]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📅 Content Calendar                                         │
│ [Monthly calendar view with scheduled content]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required Components

1. **View Selector**
   - Tabs: Briefs, Ideas, Calendar
   - Create new brief button

2. **Content Brief Cards**
   - Priority badge
   - Title
   - Opportunity scores (with progress bars)
   - Target metrics section
   - Content outline (collapsible)
   - Channel-specific recommendations
   - Action buttons

3. **Quick Ideas List**
   - Idea title + platform
   - Viral probability
   - Best timing
   - Action buttons

4. **Content Calendar**
   - Monthly/weekly view
   - Drag-and-drop scheduling
   - Status indicators
   - Platform badges

### Data Required

**API Endpoint:** `GET /api/content-studio`

```typescript
{
  briefs: [
    {
      id: "uuid",
      title: "Sustainable Packaging Solutions for E-commerce",
      priority: "high",
      status: "suggested", // suggested | in_progress | completed

      opportunity_scores: {
        ranking_probability: 0.78,
        citation_probability: 0.82,
        citation_targets_count: 5,
        viral_potential: 0.67
      },

      target_metrics: {
        primary_keyword: "sustainable ecommerce packaging",
        search_volume: 800,
        competition: "medium",
        estimated_traffic: 640,
        target_rank: 3
      },

      outline: [
        { level: "h2", text: "Introduction: The packaging crisis" },
        { level: "h2", text: "5 sustainable alternatives" },
        { level: "h2", text: "Cost-benefit analysis" },
        { level: "h2", text: "Implementation roadmap" }
      ],

      recommendations: {
        seo: "Target featured snippet with comparison table",
        geo: "Format as data-driven research for AI citations",
        social: "LinkedIn performs best for this topic"
      },

      created_at: "2024-02-16T10:00:00Z",
      source: "enriched_crawl"
    }
  ],

  quick_ideas: [
    {
      id: "uuid",
      title: "Predictive Analytics Trends",
      platform: "linkedin",
      viral_probability: 0.72,
      best_timing: "2024-02-17T10:00:00Z",
      topic: "predictive analytics"
    }
  ],

  calendar: [
    {
      date: "2024-02-20",
      content_items: [
        {
          id: "uuid",
          title: "Blog post: SEO trends 2024",
          type: "blog",
          status: "scheduled"
        }
      ]
    }
  ]
}
```

---

## 9. To-Do & Action Items

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ To-Do & Action Items                                        │
│                                                             │
│ [Filter: All | Urgent | High | Medium | Low] [+ New Task] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ Action Items (12 auto-generated, 3 manual)              │
│                                                             │
│ 🔥 Urgent (1)                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Address 3 Negative Brand Mentions                      │ │
│ │ Category: Reputation | Est. Time: 3 hours              │ │
│ │                                                         │ │
│ │ Steps:                                                  │ │
│ │ ☐ Review all negative mentions                         │ │
│ │ ☐ Categorize by severity                               │ │
│ │ ☐ Draft response strategy                              │ │
│ │ ☐ Implement responses                                  │ │
│ │ ☐ Monitor resolution                                   │ │
│ │                                                         │ │
│ │ Source: Auto-generated from enriched crawl             │ │
│ │ Due: Today                                              │ │
│ │                                                         │ │
│ │ [Start Task] [View Context] [Delegate] [Dismiss]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚡ High Priority (5)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Content Gap: "AI-powered analytics"                    │ │
│ │ Category: Content | Est. Time: 4 hours                 │ │
│ │                                                         │ │
│ │ ☐ Generate content brief ✏️                           │ │
│ │ ☐ Write 2000+ word guide                               │ │
│ │ ☐ Optimize for SEO                                     │ │
│ │                                                         │ │
│ │ Priority: 92/100 | ROI: 88/100                         │ │
│ │ [Expand Details]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ │ Backlink Outreach: example.com                         │ │
│ │ Category: Outreach | Est. Time: 1 hour                 │ │
│ │                                                         │ │
│ │ ☐ Research contact info                                │ │
│ │ ☐ Draft outreach email                                 │ │
│ │ ☐ Send email                                           │ │
│ │ ☐ Follow up in 7 days                                  │ │
│ │                                                         │ │
│ │ Link Value: 85/100 | DA: 82                            │ │
│ │ [Start] [View Template]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📅 This Week (3)                                            │
│ • Create Content: "Predictive analytics" (Due: Feb 18)    │
│ • Monitor competitor activity on "SEO tools"               │
│ • Update existing guide with 2024 data                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required Components

1. **Filter & Actions Bar**
   - Priority filters (All, Urgent, High, Medium, Low)
   - Create new task button

2. **Summary Stats**
   - Auto-generated count
   - Manual count
   - Breakdown by priority

3. **Task Cards (Expandable)**
   - Title
   - Category badge
   - Estimated time
   - Checklist (checkboxes)
   - Source indicator
   - Due date
   - Priority/ROI scores (if relevant)
   - Action buttons

4. **Weekly Overview**
   - Tasks due this week
   - Compact list view

### Data Required

**API Endpoint:** `GET /api/todos`

```typescript
{
  summary: {
    total: 15,
    auto_generated: 12,
    manual: 3,
    by_priority: {
      urgent: 1,
      high: 5,
      medium: 6,
      low: 3
    }
  },

  tasks: [
    {
      id: "uuid",
      title: "Address 3 Negative Brand Mentions",
      category: "reputation",
      priority: "urgent",
      estimated_time: "3 hours",
      difficulty: "medium",

      steps: [
        { text: "Review all negative mentions", completed: false },
        { text: "Categorize by severity", completed: false },
        { text: "Draft response strategy", completed: false },
        { text: "Implement responses", completed: false },
        { text: "Monitor resolution", completed: false }
      ],

      source: "auto_generated",
      source_type: "enriched_crawl",
      due_date: "2024-02-16",
      status: "pending",

      context: {
        related_urls: ["url1", "url2"],
        source_insight_id: "uuid"
      }
    }
  ],

  this_week: [
    {
      title: "Create Content: 'Predictive analytics'",
      due_date: "2024-02-18",
      priority: "high"
    }
  ]
}
```

---

## 10. AI Chat Interface

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ AI Chat - Brand Intelligence Assistant                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 💡 Smart Suggestions                                        │
│ [You have 3 negative mentions. Draft responses?]           │
│ [Explore "AI analytics" opportunity?]                      │
│ [Create content for trending topic?]                       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Chat History                                            │ │
│ │                                                         │ │
│ │ User: How is my brand performing?                      │ │
│ │                                                         │ │
│ │ AI: Based on this week's intelligence:                 │ │
│ │                                                         │ │
│ │ 📊 Brand Mentions: 47 mentions detected                │ │
│ │    ✅ 32 positive (68%)                                 │ │
│ │    ⚠️ 3 negative (6%)                                   │ │
│ │    ➖ 12 neutral (26%)                                  │ │
│ │                                                         │ │
│ │ 🔥 Top Opportunity:                                     │ │
│ │    "Content gap in 'sustainable packaging'"            │ │
│ │    (ROI: 85/100, 3 easy steps)                         │ │
│ │                                                         │ │
│ │ 📈 Trending Topic:                                      │ │
│ │    "Eco-friendly materials" - velocity 0.82            │ │
│ │    Your competitors are talking about this             │ │
│ │                                                         │ │
│ │ Would you like me to:                                   │ │
│ │ [Draft responses to negative mentions]                 │ │
│ │ [Create content brief for opportunity]                 │ │
│ │ [Add trending topic to calendar]                       │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────┬──────────────┐│
│ │ Type your message...                      │ [Send]       ││
│ └───────────────────────────────────────────┴──────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required Components

1. **Smart Suggestions Bar**
   - Context-aware suggestion chips
   - Based on recent insights/opportunities
   - Clickable to start conversation

2. **Chat Container**
   - Scrollable message history
   - User messages (right-aligned)
   - AI messages (left-aligned)
   - Rich formatting (bullets, numbers, badges)
   - Action buttons in AI messages

3. **Input Area**
   - Text input field
   - Send button
   - File attachment (optional)

4. **Context Indicators**
   - "AI is typing..." animation
   - Source citations (when AI references data)
   - Timestamp on messages

### Data Required

**API Endpoint:** `GET /api/ai-chat/context`

```typescript
{
  context: {
    recent_mentions: [
      {
        mention_text: "Love this tool!",
        sentiment: "positive",
        impact_score: 85,
        source: "Twitter"
      }
    ],

    top_opportunities: [
      {
        title: "Content gap in 'sustainable packaging'",
        estimated_roi: 85,
        difficulty: "easy",
        actionable_steps: ["step1", "step2", "step3"]
      }
    ],

    trending_topics: [
      {
        name: "Eco-friendly materials",
        trend_velocity: 0.82,
        competitor_activity: true
      }
    ],

    sentiment_summary: {
      positive_count: 32,
      negative_count: 3,
      neutral_count: 12,
      overall_sentiment: 68
    }
  },

  suggestions: [
    {
      text: "You have 3 negative mentions. Draft responses?",
      action: "draft_responses",
      priority: "high"
    },
    {
      text: "Explore 'AI analytics' opportunity?",
      action: "explore_opportunity",
      opportunity_id: "uuid"
    }
  ]
}
```

**Chat Message API:** `POST /api/ai-chat/message`

```typescript
// Request
{
  brand_id: "uuid",
  message: "How is my brand performing?",
  session_id: "uuid"
}

// Response
{
  message_id: "uuid",
  response: "Based on this week's intelligence...",
  response_type: "rich", // text | rich

  // For rich responses
  data: {
    metrics: { ... },
    suggestions: [ ... ],
    action_buttons: [ ... ]
  },

  sources: ["enriched_crawl", "daily_insights"]
}
```

---

## 11. Data Models & API Endpoints

### Complete API Structure

```typescript
// Base URL: https://api.geovera.com/v1

// Authentication
POST /auth/login
POST /auth/logout
POST /auth/refresh

// Brand Management
GET /brands
GET /brands/:id
POST /brands
PUT /brands/:id

// Multi-Channel Backlinks
GET /multichannel-backlinks
GET /multichannel-backlinks/:id
POST /multichannel-backlinks/:id/track
POST /multichannel-backlinks/:id/outreach
PUT /multichannel-backlinks/:id/status
DELETE /multichannel-backlinks/:id

// SEO Intelligence
GET /seo-intelligence
GET /keywords
GET /keywords/:id/history
GET /backlinks
GET /backlinks/new

// GEO Citations
GET /geo-citations
GET /geo-citations/:id
GET /geo-opportunities
POST /geo-opportunities/:id/track

// Social Search
GET /social-mentions
GET /social-mentions/:id
GET /viral-opportunities
GET /trending-topics

// Insights
GET /insights
GET /insights/:id
POST /insights/:id/accept
POST /insights/:id/dismiss
GET /opportunity-tracker

// Radar
GET /competitors
GET /competitors/:id/activities
GET /competitive-gaps
POST /competitors/:id/track

// Content Studio
GET /content-briefs
GET /content-briefs/:id
POST /content-briefs
GET /content-ideas
GET /content-calendar

// To-Do
GET /todos
GET /todos/:id
POST /todos
PUT /todos/:id
DELETE /todos/:id
PUT /todos/:id/steps/:step_id/complete

// AI Chat
GET /ai-chat/context
POST /ai-chat/message
GET /ai-chat/history
POST /ai-chat/suggestions/:id/execute

// Analytics
GET /analytics/dashboard
GET /analytics/performance
GET /analytics/export
```

### Database Tables Summary

```sql
-- Core tables
gv_brands
gv_users
gv_brand_users

-- Multi-Channel Backlinks
gv_multichannel_backlink_opportunities
gv_outreach_history

-- SEO
gv_keywords
gv_keyword_rankings
gv_backlinks

-- GEO
gv_geo_citations
gv_geo_opportunities

-- Social
gv_social_mentions
gv_viral_opportunities
gv_trending_topics

-- Insights
gv_daily_insights
gv_opportunity_tracker

-- Radar
gv_competitors
gv_competitor_activities
gv_competitive_alerts

-- Content Studio
gv_content_briefs
gv_content_ideas
gv_content_calendar

-- To-Do
gv_todos

-- AI Chat
gv_ai_chat_context
gv_ai_chat_suggestions
gv_ai_chat_history

-- Intelligence
gv_enriched_crawls
gv_learning_patterns
```

---

## 12. Design System Guidelines

### Color Palette

```css
/* Primary Colors */
--primary: #6366F1;       /* Indigo - main brand color */
--primary-light: #818CF8;
--primary-dark: #4F46E5;

/* Status Colors */
--urgent: #EF4444;        /* Red - urgent items */
--high: #F59E0B;          /* Amber - high priority */
--medium: #10B981;        /* Green - medium priority */
--low: #6B7280;           /* Gray - low priority */

/* Sentiment Colors */
--positive: #10B981;      /* Green */
--neutral: #6B7280;       /* Gray */
--negative: #EF4444;      /* Red */

/* Platform Colors */
--medium: #00AB6C;
--linkedin: #0A66C2;
--twitter: #1DA1F2;
--reddit: #FF4500;
--github: #181717;
--devto: #0A0A0A;

/* Background */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;

/* Borders */
--border: #E5E7EB;
--border-dark: #D1D5DB;
```

### Typography

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Component Spacing

```css
/* Spacing Scale (Tailwind-based) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Fully rounded */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Component Examples

**Button Styles:**
```css
/* Primary Button */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

/* Urgent Button */
.btn-urgent {
  background: var(--urgent);
  color: white;
  /* Same padding/radius as primary */
}
```

**Card Styles:**
```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card-hover {
  transition: all 0.2s;
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}
```

**Badge Styles:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-urgent {
  background: #FEE2E2;
  color: var(--urgent);
}

.badge-high {
  background: #FEF3C7;
  color: var(--high);
}
```

---

## Summary for UI/UX Team

### Priorities

**Phase 1 (MVP):**
1. Multi-Channel Backlink Opportunities (Main feature)
2. Dashboard Overview
3. Insights & Opportunities
4. To-Do List

**Phase 2:**
5. SEO Intelligence
6. GEO Citations
7. Content Studio

**Phase 3:**
8. Social Search
9. Radar
10. AI Chat

### Key Design Principles

1. **Data-Dense but Scannable**
   - Use cards for opportunities/insights
   - Progressive disclosure (expand for details)
   - Clear visual hierarchy

2. **Action-Oriented**
   - Every insight has clear CTAs
   - One-click actions where possible
   - Urgency indicators visible

3. **Context-Aware**
   - Show "why this matters"
   - Display predictions/estimates
   - Provide recommendations

4. **Responsive**
   - Mobile-first for monitoring
   - Desktop-optimized for deep work
   - Tablet support for reviews

5. **Performance**
   - Lazy load lists (virtualization)
   - Skeleton loaders
   - Optimistic UI updates

### Files to Provide

This document should be shared with:
- UI/UX designers (for mockups)
- Frontend developers (for implementation)
- Backend developers (for API contracts)
- Product managers (for feature specs)

**Additional files needed:**
- Figma design file (based on this spec)
- API documentation (Swagger/OpenAPI)
- Component library (Storybook)
- User flows (Miro/FigJam)
