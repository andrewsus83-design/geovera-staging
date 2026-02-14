# Daily Insights Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Request                          │
│  POST /functions/v1/generate-daily-insights                 │
│  { brandId, tier, forceRegenerate }                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Check Cache (gv_daily_insights)                 │
│  If exists for today AND !forceRegenerate → Return cached   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Collection Phase                      │
│                  (Parallel Execution)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────┐│
│  │   RADAR     │  │   SEARCH    │  │     HUB     │  │CHAT││
│  │ Rankings    │  │  Keywords   │  │  Articles   │  │AI  ││
│  │ Marketshare │  │  GEO Scores │  │  Analytics  │  │Ins.││
│  │ Trends      │  │  Competitors│  │  Pending    │  │    ││
│  │ Content     │  │  Results    │  │  Quota      │  │    ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └────┘│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Crisis Detection Phase                      │
│                  (Real-time Analysis)                        │
├─────────────────────────────────────────────────────────────┤
│  ✓ Ranking Drop Detection     (Threshold: -5 positions)     │
│  ✓ Competitor Surge           (Threshold: +40% in 7 days)   │
│  ✓ Sentiment Spike            (Threshold: ±30% in 48h)      │
│  ✓ Keyword Ranking Crash      (Threshold: -5 positions)     │
│                                                               │
│  Output: CrisisAlert[] → Logged to gv_crisis_events         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Task Generation Phase                         │
│                (Per Source Type)                             │
├─────────────────────────────────────────────────────────────┤
│  RADAR TASKS:                                                │
│    • Competitor surge alerts                                 │
│    • Ranking drop alerts                                     │
│    • Viral trend opportunities                               │
│    • Top creator collaborations                              │
│                                                               │
│  SEARCH TASKS:                                               │
│    • Keyword ranking drops                                   │
│    • GEO score declines                                      │
│    • New keyword opportunities                               │
│                                                               │
│  HUB TASKS:                                                  │
│    • Pending article publishing                              │
│    • Low-performing content promotion                        │
│    • New content creation                                    │
│                                                               │
│  CHAT TASKS:                                                 │
│    • Unaddressed AI insights                                 │
│    • Market opportunities                                    │
│                                                               │
│  CRISIS TASKS:                                               │
│    • Converted from CrisisAlert[]                            │
│    • Automatic priority: urgent                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Priority Scoring Phase                          │
│         Calculate score (0-100) for each task                │
├─────────────────────────────────────────────────────────────┤
│  Formula:                                                     │
│    basePriority * 0.4        (urgent: 90, high: 70, ...)    │
│  + impactScore * 0.3         (0-100)                         │
│  + timeSensitivity * 0.15    (0-20)                          │
│  + confidenceBonus * 0.05    (0-10)                          │
│  + categoryWeight * 0.05     (0-10)                          │
│  + recencyBonus * 0.05       (0-5)                           │
│  ────────────────────────────────────                        │
│  = Priority Score (capped at 100)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Task Ranking Phase                           │
│          Sort all tasks by priorityScore DESC                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Diversity Selection Phase                       │
│        Select top N tasks (tier-based limit)                 │
├─────────────────────────────────────────────────────────────┤
│  Rules:                                                       │
│  1. Always include crisis tasks (max 3)                      │
│  2. Max 4 tasks per category                                 │
│  3. Max 5 tasks per source type                              │
│  4. Total limit: Basic=8, Premium=10, Partner=12             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Save to Database                            │
│         INSERT INTO gv_daily_insights                        │
├─────────────────────────────────────────────────────────────┤
│  • tasks[]                                                    │
│  • crisis_alerts[]                                           │
│  • total_tasks                                               │
│  • crisis_count                                              │
│  • data source flags (radar_scanned, etc.)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Return Response                             │
│  {                                                           │
│    tasks: InsightTask[],                                     │
│    crises: CrisisAlert[],                                    │
│    metadata: { ... }                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
generate-daily-insights/
│
├── index.ts (Main Handler)
│   ├── Request validation
│   ├── Cache check
│   ├── Orchestrates all phases
│   └── Response formatting
│
├── data-collectors.ts
│   ├── fetchRadarData()
│   ├── fetchSearchData()
│   ├── fetchHubData()
│   └── fetchChatData()
│
├── crisis-detection.ts
│   ├── detectRankingDrop()
│   ├── detectCompetitorSurge()
│   ├── detectSentimentSpike()
│   └── detectKeywordRankingCrash()
│
├── task-generators.ts
│   ├── generateRadarTasks()
│   ├── generateSearchTasks()
│   ├── generateHubTasks()
│   └── generateChatTasks()
│
├── priority-scoring.ts
│   ├── calculatePriorityScore()
│   ├── selectDiverseTasks()
│   └── getTierLimit()
│
└── types.ts
    ├── InsightTask
    ├── CrisisAlert
    ├── RadarData / SearchData / HubData / ChatData
    └── Request / Response types
```

## Database Schema

```
┌─────────────────────┐
│   gv_daily_insights │
├─────────────────────┤
│ id (PK)             │
│ brand_id (FK)       │
│ insight_date        │
│ tasks[]             │◄──── InsightTask[]
│ crisis_alerts[]     │◄──── CrisisAlert[]
│ total_tasks         │
│ crisis_count        │
│ radar_scanned       │
│ search_scanned      │
│ hub_scanned         │
│ chat_scanned        │
│ created_at          │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│  gv_crisis_events   │
├─────────────────────┤
│ id (PK)             │
│ brand_id (FK)       │
│ crisis_type         │
│ severity            │
│ title               │
│ description         │
│ metrics (JSONB)     │
│ recommended_actions │
│ status              │
│ detected_at         │
│ resolved_at         │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│  gv_task_actions    │
├─────────────────────┤
│ id (PK)             │
│ insight_id (FK)     │
│ brand_id (FK)       │
│ action_type         │
│ completion_notes    │
│ time_spent_minutes  │
│ success_metrics     │
│ outcome_quality     │
│ action_timestamp    │
└─────────────────────┘
```

## Data Sources

```
                    ┌──────────────────┐
                    │   Brand Context  │
                    │   (gv_brands)    │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   RADAR      │    │   SEARCH     │    │     HUB      │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ • Rankings   │    │ • Keywords   │    │ • Articles   │
│ • Marketshare│    │ • History    │    │ • Analytics  │
│ • Trends     │    │ • GEO Scores │    │ • Queue      │
│ • Content    │    │ • Competitors│    │ • Quota      │
│ • Brands     │    │ • Results    │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      CHAT        │
                    ├──────────────────┤
                    │ • Conversations  │
                    │ • AI Insights    │
                    │ • Daily Briefs   │
                    └──────────────────┘
```

## Task Priority Matrix

```
Priority Score: 0 ──────────────────────────────────── 100
                │                                        │
                │  ┌────────┐  ┌────────┐  ┌─────────┐ │
   Categories:  │  │Content │  │ SEO    │  │ Crisis  │ │
                │  │Publishing│ │ Alert  │  │Response │ │
                │  │(40-50) │  │(75-85) │  │(90-100) │ │
                │  └────────┘  └────────┘  └─────────┘ │
                │                                        │
Tier Limits:    │  Basic: 8    Premium: 10  Partner: 12│
                │                                        │
                └────────────────────────────────────────┘
```

## Crisis Detection Pipeline

```
Raw Data → Thresholds → Crisis Type → Severity → Actions → Database
─────────────────────────────────────────────────────────────────────

Ranking Drop:
  Current: #15, Previous: #8
  → Drop: 7 positions (> 5)
  → Type: ranking_crash
  → Severity: HIGH
  → Actions: ["Audit recent activities", ...]
  → gv_crisis_events

Competitor Surge:
  Previous: 10%, Current: 16%
  → Growth: 60% (> 40%)
  → Type: competitor_surge
  → Severity: CRITICAL
  → Actions: ["Deep-dive analysis", ...]
  → gv_crisis_events

Sentiment Spike:
  Previous: 0.6, Current: 0.3
  → Change: -50% (> 30%)
  → Type: sentiment_crash
  → Severity: HIGH
  → Actions: ["Crisis communication", ...]
  → gv_crisis_events
```

## Performance Optimizations

```
┌─────────────────────────────────────┐
│  Parallel Data Fetching             │
│  ────────────────────────            │
│  Promise.all([                      │
│    fetchRadarData(),   ─┐           │
│    fetchSearchData(),   ├─ Parallel │
│    fetchHubData(),      │           │
│    fetchChatData()      ┘           │
│  ])                                 │
│  Result: 4x faster than sequential  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Automatic Caching                  │
│  ────────────────                   │
│  1. Check: Today's insights exist?  │
│  2. Yes → Return cached (fast)      │
│  3. No → Generate new               │
│  4. Save to gv_daily_insights       │
│  Result: Instant response for       │
│          repeated daily queries     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Efficient Scoring                  │
│  ────────────────                   │
│  1. Pre-computed category weights   │
│  2. Single-pass priority calc       │
│  3. In-memory sorting               │
│  4. O(n log n) complexity           │
│  Result: Fast scoring for 100+ tasks│
└─────────────────────────────────────┘
```

## Error Handling Flow

```
Request
  │
  ├─ Validation Error → 400 Bad Request
  │
  ├─ Auth Error → 401 Unauthorized
  │
  ├─ Data Collection Error
  │   └─ Log warning, continue with available data
  │
  ├─ Crisis Detection Error
  │   └─ Log error, continue without crises
  │
  ├─ Task Generation Error
  │   └─ Log error, continue with other sources
  │
  ├─ Database Save Error → 500 Internal Error
  │
  └─ Success → 200 OK with tasks + crises
```

## Integration Points

```
Frontend (React/Next.js)
    │
    │ POST /generate-daily-insights
    ▼
Edge Function (Deno)
    │
    ├─ Read: gv_creator_rankings
    ├─ Read: gv_brand_marketshare
    ├─ Read: gv_trends
    ├─ Read: gv_keywords
    ├─ Read: gv_hub_articles
    ├─ Read: gv_ai_insights
    │
    ├─ Write: gv_daily_insights
    ├─ Write: gv_crisis_events
    │
    └─ Return: JSON response
```

This architecture ensures:
- ✅ High performance through parallel execution
- ✅ Scalability via caching
- ✅ Reliability through error handling
- ✅ Maintainability via modular design
- ✅ Extensibility for future enhancements
