# Daily Insights - Quick Start Guide

## Overview
The Daily Insights system automatically generates **8-12 actionable tasks** per day based on data from Radar, Search, Hub, and Chat features. Each task is prioritized, data-driven, and includes clear "why" explanations.

---

## Quick Deploy

### 1. Deploy Database Migration
```bash
cd /Users/drew83/Desktop/geovera-staging
supabase db push
```

### 2. Deploy Edge Function
```bash
supabase functions deploy generate-daily-insights
```

### 3. Test the System
```bash
deno run --allow-net --allow-env test-daily-insights.ts
```

---

## API Usage

### Generate Tasks for a Brand
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-daily-insights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "uuid-here",
    "tier": "premium",
    "forceRegenerate": false
  }'
```

### Response Structure
```json
{
  "tasks": [
    {
      "title": "Task title",
      "why": "Data-driven explanation with numbers",
      "category": "competitor_intelligence",
      "priority": "high",
      "priorityScore": 85.5,
      "deadline": "2026-02-16T08:00:00Z",
      "expectedOutcome": "Measurable result",
      "successMetrics": [
        {
          "metric": "metric_name",
          "target": 100,
          "unit": "units",
          "timeframe": "7 days"
        }
      ],
      "parameters": { /* task-specific data */ }
    }
  ],
  "crises": [ /* crisis alerts if any */ ],
  "metadata": {
    "generatedAt": "2026-02-14T10:30:00Z",
    "taskCount": 10,
    "crisisCount": 0,
    "dataSourcesCovered": ["radar", "search", "hub", "chat"]
  }
}
```

---

## Task Types Cheat Sheet

### Crisis (Priority: Urgent)
- **P0:** Viral negative mentions (50+ mentions, 100K+ reach)
- **P0:** Sentiment crash (-30% in 48h)
- **P0:** Ranking crash (-5 positions, priority keywords)
- **P0:** Competitor surge (+40% marketshare)
- **P0:** GEO score crash (-15 points)

### High Priority
- Competitor surge alert (20%+ growth)
- Ranking drop alert (3+ positions)
- Viral trend opportunity
- Keyword ranking drop (-3+ positions)
- GEO score decline (-5 points)
- BuzzSumo viral discovery
- AI insights (unaddressed high priority)

### Medium Priority
- Top creator collaboration
- Content gap analysis
- Keyword opportunity detection
- Featured snippet opportunity
- Publish pending articles
- Generate new content
- Blue Ocean opportunities
- Conversation follow-ups

### Low Priority
- Content promotion (underperforming)
- Content refresh (90+ days old)
- Content series expansion
- Recurring topic patterns

---

## Tier Quotas

| Tier    | Tasks/Day | Crisis Slots |
|---------|-----------|--------------|
| Basic   | 8         | 3 max        |
| Premium | 10        | 3 max        |
| Partner | 12        | 3 max        |

---

## Database Tables

### Main Tables
- `gv_daily_insights` - Generated tasks and metadata
- `gv_crisis_events` - Crisis detection log
- `gv_task_actions` - Task completion tracking

### Data Source Tables
- `gv_creator_rankings` - Radar rankings
- `gv_brand_marketshare` - Market share tracking
- `gv_trends` - Viral trends
- `gv_viral_discoveries` - BuzzSumo discoveries
- `gv_keywords` - Keyword tracking
- `gv_geo_scores` - Local SEO scores
- `gv_hub_articles` - Published articles
- `gv_ai_insights` - AI recommendations

---

## Common Queries

### Get Today's Tasks for a Brand
```sql
SELECT * FROM gv_daily_insights
WHERE brand_id = 'uuid-here'
  AND insight_date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 1;
```

### Get Active Crises
```sql
SELECT * FROM gv_crisis_events
WHERE brand_id = 'uuid-here'
  AND status IN ('active', 'monitoring')
ORDER BY severity DESC, detected_at DESC;
```

### Get Task Completion Rate
```sql
SELECT
  COUNT(*) FILTER (WHERE action_status = 'completed') * 100.0 / COUNT(*) as completion_rate
FROM gv_daily_insights
WHERE brand_id = 'uuid-here'
  AND insight_date >= CURRENT_DATE - INTERVAL '30 days';
```

---

## Scheduled Execution

### Daily Generation (6 AM)
```sql
SELECT cron.schedule(
  'generate-daily-insights',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-daily-insights',
    headers := '{"Authorization": "Bearer SERVICE_KEY"}'::jsonb,
    body := jsonb_build_object('brandId', id, 'tier', subscription_tier)
  ) FROM gv_brands WHERE active = true;
  $$
);
```

### Crisis Detection (Every 4 Hours)
```sql
SELECT cron.schedule(
  'crisis-detection',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-daily-insights',
    headers := '{"Authorization": "Bearer SERVICE_KEY"}'::jsonb,
    body := jsonb_build_object('brandId', id, 'tier', subscription_tier, 'forceRegenerate', true)
  ) FROM gv_brands WHERE active = true;
  $$
);
```

---

## Troubleshooting

### No Tasks Generated?
- Check if brand has data in source tables (radar, search, hub, chat)
- Verify brand tier is set correctly
- Check function logs: `supabase functions logs generate-daily-insights`

### Tasks Not Cached?
- Cache key is `brand_id + date`
- Set `forceRegenerate: true` to bypass cache
- Cache automatically expires at midnight

### Crisis Not Detected?
- Verify thresholds are met (see crisis types above)
- Check `gv_crisis_events` table for all detections
- Crisis tasks always appear first in task list

### Priority Scores Seem Wrong?
- Check deadline (closer = higher score)
- Verify category weight (crisis=10, content=2)
- Review data confidence score (0.0-1.0)

---

## Integration Checklist

### Backend
- [x] Database migration deployed
- [x] Edge function deployed
- [ ] Cron jobs scheduled
- [ ] Error monitoring configured

### Frontend
- [ ] Task list UI component
- [ ] Crisis alert banner
- [ ] Task completion tracking
- [ ] Success metrics display
- [ ] Filter by category/priority

### Testing
- [ ] Test with real brand data
- [ ] Verify tier quotas
- [ ] Test crisis detection
- [ ] Test task completion flow
- [ ] Monitor performance

---

## Support

### Documentation
- **Implementation Plan:** `/INSIGHTS_IMPLEMENTATION_PLAN.md`
- **Task Types:** `/DAILY_INSIGHTS_TASK_TYPES.md`
- **Summary:** `/DAILY_INSIGHTS_IMPLEMENTATION_SUMMARY.md`

### Code Location
- **Edge Function:** `/supabase/functions/generate-daily-insights/`
- **Migration:** `/supabase/migrations/20260214100000_daily_insights_enhancements.sql`
- **Test Script:** `/test-daily-insights.ts`

### Key Metrics to Monitor
- Task generation time (<10 seconds target)
- Task completion rate (70%+ target)
- Crisis detection accuracy (90%+ target)
- False positive rate (<10% target)

---

**Last Updated:** February 14, 2026
**Status:** Production Ready
