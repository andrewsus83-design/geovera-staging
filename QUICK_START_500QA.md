# 🚀 Quick Start: 500QA System

## TL;DR

**What**: Upgraded from 300 → 500 monthly questions + tier-based daily research
**Cost**: $3.35 (Basic) | $4.85 (Premium) | $7.85 (Partner) per month
**Deploy**: Run `./supabase/functions/deploy-500qa-system.sh`
**Status**: ✅ Ready to deploy

---

## ⚡ Quick Deploy (5 Minutes)

### 1. Deploy Functions

```bash
cd /Users/drew83/Desktop/geovera-staging/supabase/functions
./deploy-500qa-system.sh
```

### 2. Setup Cron Jobs

```sql
-- Daily research (2 AM Jakarta)
SELECT cron.schedule('geovera-daily-research-500qa', '0 2 * * *',
  $$SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/daily-auto-research',
    headers := '{"Authorization": "Bearer SERVICE_KEY"}'::jsonb,
    body := '{"brand_id": "all"}'::jsonb
  );$$
);

-- Monthly 500QA (1st of month, 3 AM)
SELECT cron.schedule('geovera-500qa-monthly', '0 3 1 * *',
  $$SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-500qa',
    headers := '{"Authorization": "Bearer SERVICE_KEY"}'::jsonb,
    body := '{"brand_id": "all"}'::jsonb
  );$$
);
```

### 3. Test

```bash
# Test 500QA
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-500qa \
  -H "Authorization: Bearer JWT" -d '{"brand_id": "uuid"}'

# Test daily research
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/daily-auto-research \
  -H "Authorization: Bearer JWT" -d '{"brand_id": "uuid"}'
```

---

## 📊 What You Get

### Basic Tier ($3.35/month)
- 500 monthly questions
- 20 researched daily
- **5 top suggestions** daily
- 30 negative alerts/month
- Auto-sync to dashboard

### Premium Tier ($4.85/month)
- 500 monthly questions
- 30 researched daily
- **10 top suggestions** daily
- 60 negative alerts/month
- Auto-sync to dashboard

### Partner Tier ($7.85/month)
- 500 monthly questions
- 50 researched daily
- **20 top suggestions** daily
- 100 negative alerts/month
- Auto-sync to dashboard

---

## 🎯 Key Features

✅ **500 Deep Questions** (was 300)
✅ **Tier-Based Research** (20/30/50 daily)
✅ **20% Negative Sentiment** (proactive alerts)
✅ **Auto-Sync** to Insights, To-Do, Content Studio
✅ **Impact Scoring** (priority × impact from Perplexity)

---

## 📚 Full Documentation

- **`/500QA_SYSTEM_COMPLETE.md`** - Complete technical guide
- **`/UPGRADE_300_TO_500QA_SUMMARY.md`** - Upgrade summary
- **`/supabase/functions/generate-500qa/README.md`** - 500QA docs
- **`/IMPLEMENTATION_COMPLETE_FEB15.md`** - Original backend docs

---

## 🔧 API Endpoints

### Generate 500 Questions
```bash
POST /generate-500qa
Body: {"brand_id": "uuid", "force_regenerate": false}
Response: {questions_generated: 500, cost_usd: 0.35, breakdown: {...}}
```

### Daily Research
```bash
POST /daily-auto-research
Body: {"brand_id": "uuid", "research_channels": ["seo","geo","social"]}
Response: {
  total_researched: 20,
  suggested_count: 5,
  sentiment_breakdown: {negative: 4, positive: 12, neutral: 4},
  synced_to: ["insights", "todo", "content_studio"]
}
```

---

## ✅ Checklist

- [ ] Deploy `generate-500qa` function
- [ ] Deploy `daily-auto-research` function
- [ ] Setup daily cron job (2 AM Jakarta)
- [ ] Setup monthly cron job (1st of month)
- [ ] Test with real brand
- [ ] Verify sync to Insights
- [ ] Verify sync to To-Do
- [ ] Verify sync to Content Studio
- [ ] Monitor costs
- [ ] Roll out to users

---

**Status**: ✅ READY TO DEPLOY
**Next**: Run deployment script → Setup cron jobs → Test
