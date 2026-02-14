# Generate Daily Insights Edge Function

This Edge Function implements the Daily Insights task generation algorithm based on the INSIGHTS_IMPLEMENTATION_PLAN.md specification.

## Overview

The function analyzes data from Radar, Search, Hub, and Chat features to generate prioritized, actionable tasks daily. It also includes real-time crisis detection.

## Features Implemented

### 1. Task Generation Algorithm
- ✅ Tier-based limits (Basic: 8, Premium: 10, Partner: 12)
- ✅ Multi-source data collection (Radar, Search, Hub, Chat)
- ✅ Priority scoring (0-100)
- ✅ Task diversity selection
- ✅ Automatic deadline calculation

### 2. Crisis Detection
- ✅ **Ranking Drop Detection**: Detects 5+ position drops in creator mindshare
- ✅ **Competitor Surge Detection**: Identifies 40%+ marketshare growth in 7 days
- ✅ **Sentiment Spike Detection**: Monitors +/- 30% sentiment changes in 48h
- ✅ **Keyword Ranking Crash**: Alerts on -5 position drops for priority keywords

### 3. Task Types Generated

#### Radar Tasks
- Competitor surge alerts
- Ranking drop alerts
- Viral trend opportunities
- Top creator collaboration opportunities

#### Search Tasks
- Keyword ranking drops
- GEO score declines
- New keyword opportunities

#### Hub Tasks
- Pending article publishing
- Low-performing content promotion
- New content creation suggestions

#### Chat Tasks
- Unaddressed AI insights
- Market opportunity alerts

## API Usage

### Generate Daily Insights

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-daily-insights \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "uuid-here",
    "tier": "premium",
    "forceRegenerate": false
  }'
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| brandId | string (UUID) | Yes | Brand ID to generate insights for |
| tier | string | Yes | Subscription tier: "basic", "premium", or "partner" |
| forceRegenerate | boolean | No | Skip cache and regenerate insights (default: false) |

### Response Format

```json
{
  "tasks": [
    {
      "brand_id": "uuid",
      "title": "Task title",
      "why": "Explanation of why this matters",
      "category": "competitor_intelligence",
      "priority": "high",
      "priorityScore": 85.5,
      "deadline": "2026-02-16T08:00:00Z",
      "expectedDuration": 180,
      "expectedOutcome": "What success looks like",
      "parameters": {},
      "sourceType": "radar",
      "sourceData": {
        "dataPoints": ["gv_creator_rankings:uuid"],
        "confidenceScore": 0.9
      },
      "actionStatus": "pending"
    }
  ],
  "crises": [
    {
      "type": "ranking_crash",
      "severity": "high",
      "title": "Crisis title",
      "description": "Crisis description",
      "detectedAt": "2026-02-14T10:00:00Z",
      "metrics": {},
      "recommendedActions": []
    }
  ],
  "metadata": {
    "generatedAt": "2026-02-14T10:00:00Z",
    "taskCount": 10,
    "crisisCount": 1,
    "dataSourcesCovered": ["radar", "search", "hub", "chat"]
  }
}
```

## Task Categories

| Category | Priority Weight | Description |
|----------|----------------|-------------|
| crisis_response | 10 | Urgent brand crises requiring immediate action |
| competitor_intelligence | 8 | Competitor monitoring and analysis |
| performance_decline | 8 | Brand performance drops |
| seo_alert | 7 | SEO ranking issues |
| local_seo_alert | 7 | Google Maps visibility issues |
| trend_opportunity | 6 | Viral trend participation opportunities |
| ai_recommendation | 6 | AI-generated insights |
| market_opportunity | 6 | Untapped market opportunities |
| keyword_opportunity | 5 | New keyword targeting opportunities |
| content_optimization | 4 | Content quality improvements |
| partnership_opportunity | 4 | Creator collaboration opportunities |
| content_publishing | 3 | Pending content publishing |
| content_promotion | 2 | Content distribution and promotion |
| content_creation | 2 | New content generation |

## Priority Scoring Formula

```
finalScore = (
  basePriority * 0.4 +        // urgent: 90, high: 70, medium: 50, low: 30
  impactScore * 0.3 +          // 0-100
  timeSensitivity * 0.15 +     // 0-20 based on deadline
  confidenceBonus * 0.05 +     // 0-10 from data confidence
  categoryWeight * 0.05 +      // 0-10 from category
  recencyBonus * 0.05          // 0-5 from data freshness
)
```

## Crisis Thresholds

| Crisis Type | Threshold | Severity | Response Time |
|-------------|-----------|----------|---------------|
| Ranking Drop | -5 positions | High | < 24 hours |
| Competitor Surge | +40% marketshare in 7 days | High | < 48 hours |
| Sentiment Crash | -30% sentiment in 48h | High | < 4 hours |
| Sentiment Surge | +30% sentiment in 48h | Medium | < 24 hours |
| Keyword Crash | -5 positions in 48h | High | < 24 hours |

## Database Tables

### gv_daily_insights
Stores daily insight records with tasks and crisis alerts.

### gv_crisis_events
Logs all detected crises with status tracking.

### gv_task_actions
Tracks user actions on tasks (started, completed, dismissed).

## Caching

The function automatically caches results for the current day. Use `forceRegenerate: true` to bypass the cache and generate fresh insights.

## Deployment

```bash
npx supabase functions deploy generate-daily-insights
```

## Testing

Test with a real brand ID:

```bash
curl -X POST http://localhost:54321/functions/v1/generate-daily-insights \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "YOUR_BRAND_UUID",
    "tier": "premium"
  }'
```

## Architecture

```
generate-daily-insights/
├── index.ts                  # Main handler
├── types.ts                  # TypeScript interfaces
├── priority-scoring.ts       # Priority calculation & task selection
├── crisis-detection.ts       # Crisis detection algorithms
├── data-collectors.ts        # Data fetching from all sources
├── task-generators.ts        # Task generation per source
└── README.md                 # This file
```

## Future Enhancements

- [ ] Add engagement collapse detection
- [ ] Implement viral negative mentions tracking
- [ ] Add GEO score crash detection
- [ ] Competitor keyword gap analysis
- [ ] Weekly performance analytics
- [ ] Automated task scheduling
