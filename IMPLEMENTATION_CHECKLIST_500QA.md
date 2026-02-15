# ✅ 500QA System Implementation Checklist

**Project**: GeoVera 500QA Upgrade
**Date**: February 15, 2026
**Status**: Development Complete, Ready for Deployment

---

## 📋 Implementation Status

### **Phase 1: Backend Development** ✅ COMPLETE

- [x] **generate-500qa function**
  - [x] Created `/supabase/functions/generate-500qa/index.ts`
  - [x] 500 questions across 8 categories (vs 300 in 6 categories)
  - [x] Impact scoring (1-100)
  - [x] Difficulty rating (easy/medium/hard)
  - [x] Cost: $0.35/month per brand
  - [x] README documentation

- [x] **daily-auto-research function (UPDATED)**
  - [x] Updated `/supabase/functions/daily-auto-research/index.ts`
  - [x] Tier-based research: Basic (20Q), Premium (30Q), Partner (50Q)
  - [x] Top suggestions: Basic (5), Premium (10), Partner (20)
  - [x] 20% negative sentiment enforcement
  - [x] Auto-sync to Insights, To-Do, Content Studio
  - [x] Impact scoring from Perplexity research

- [x] **Deployment Tools**
  - [x] Created `/supabase/functions/deploy-500qa-system.sh`
  - [x] Automated deployment script
  - [x] API key validation
  - [x] Function verification

- [x] **Documentation**
  - [x] `/500QA_SYSTEM_COMPLETE.md` - Technical overview
  - [x] `/UPGRADE_300_TO_500QA_SUMMARY.md` - Upgrade summary
  - [x] `/QUICK_START_500QA.md` - Quick reference
  - [x] `/IMPLEMENTATION_CHECKLIST_500QA.md` - This file
  - [x] `/supabase/functions/generate-500qa/README.md` - API docs

---

## 📦 Deliverables

### **Files Created:**
```
/supabase/functions/
├── generate-500qa/
│   ├── index.ts          ✅ NEW - 500QA generator
│   └── README.md         ✅ NEW - API documentation
├── daily-auto-research/
│   ├── index.ts          ✅ UPDATED - Tier-based + sync
│   └── index.ts.backup   ✅ Backup of previous version
└── deploy-500qa-system.sh ✅ NEW - Deployment script

/
├── 500QA_SYSTEM_COMPLETE.md              ✅ Technical overview
├── UPGRADE_300_TO_500QA_SUMMARY.md       ✅ Upgrade summary
├── QUICK_START_500QA.md                  ✅ Quick reference
└── IMPLEMENTATION_CHECKLIST_500QA.md     ✅ This file
```

### **Database Tables Used:**
- ✅ `gv_keywords` - Stores 500 questions (existing, no migration needed)
- ✅ `gv_daily_insights` - Insights synced from research
- ✅ `gv_user_todo` - Action items from high-priority suggestions
- ✅ `gv_content_studio_posts` - Content ideas from research
- ✅ `gv_tier_usage` - Cost tracking

### **New Fields Used:**
- ✅ `gv_keywords.impact_score` (integer 1-100)
- ✅ `gv_keywords.difficulty` (text: 'easy', 'medium', 'hard')
- ✅ `gv_keywords.suggested_by_ai` = 'claude_500qa'
- ✅ `gv_daily_insights.sentiment` (text: 'positive', 'negative', 'neutral')
- ✅ `gv_user_todo.tags` (array of strings)

---

## 🚀 Deployment Checklist

### **Pre-Deployment** (Do First)

- [ ] **Verify API Keys in Supabase**
  ```bash
  supabase secrets list
  ```
  Required:
  - [ ] `ANTHROPIC_API_KEY` (Claude)
  - [ ] `PERPLEXITY_API_KEY` (Perplexity)
  - [ ] `SERPAPI_KEY` (SerpAPI)
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Test Environment**
  - [ ] Supabase CLI installed (`supabase --version`)
  - [ ] Logged in to Supabase (`supabase login`)
  - [ ] Project linked (`supabase projects list`)

### **Deployment** (Execute)

- [ ] **Step 1: Deploy Functions**
  ```bash
  cd /Users/drew83/Desktop/geovera-staging/supabase/functions
  ./deploy-500qa-system.sh
  ```

  Or manual:
  ```bash
  supabase functions deploy generate-500qa
  supabase functions deploy daily-auto-research
  ```

- [ ] **Step 2: Verify Deployment**
  ```bash
  supabase functions list | grep -E "(generate-500qa|daily-auto-research)"
  ```

- [ ] **Step 3: Setup Cron Jobs**

  Connect to Supabase SQL Editor and run:

  ```sql
  -- Daily research at 2 AM Jakarta time (UTC+7 = 19:00 UTC)
  SELECT cron.schedule(
    'geovera-daily-research-500qa',
    '0 19 * * *',  -- 2 AM Jakarta = 7 PM UTC
    $$
    SELECT net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/daily-auto-research',
      headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{"brand_id": "all", "research_channels": ["seo", "geo", "social"]}'::jsonb
    );
    $$
  );

  -- Monthly 500QA generation (1st of month at 3 AM Jakarta = 8 PM UTC)
  SELECT cron.schedule(
    'geovera-500qa-monthly',
    '0 20 1 * *',  -- 3 AM Jakarta on 1st = 8 PM UTC on 1st
    $$
    SELECT net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-500qa',
      headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{"brand_id": "all"}'::jsonb
    );
    $$
  );
  ```

- [ ] **Step 4: Verify Cron Jobs**
  ```sql
  SELECT * FROM cron.job WHERE jobname LIKE 'geovera%';
  ```

### **Testing** (Validate)

- [ ] **Test 500QA Generation**
  ```bash
  curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-500qa \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"brand_id": "TEST_BRAND_UUID"}'
  ```

  Expected:
  - [ ] Returns 500 questions
  - [ ] Cost: $0.35
  - [ ] Breakdown shows 8 categories
  - [ ] Questions stored in `gv_keywords` table

- [ ] **Test Daily Research**
  ```bash
  curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/daily-auto-research \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"brand_id": "TEST_BRAND_UUID"}'
  ```

  Expected (Basic tier):
  - [ ] Researched 20 questions
  - [ ] Suggested 5 top items
  - [ ] Sentiment breakdown: ~4 negative, ~12 positive, ~4 neutral
  - [ ] Cost: ~$0.10
  - [ ] Synced to: insights, todo, content_studio

- [ ] **Verify Database Sync**
  ```sql
  -- Check insights
  SELECT * FROM gv_daily_insights
  WHERE brand_id = 'TEST_BRAND_UUID'
  ORDER BY created_at DESC LIMIT 10;

  -- Check to-dos
  SELECT * FROM gv_user_todo
  WHERE brand_id = 'TEST_BRAND_UUID'
  AND tags @> ARRAY['ai_suggested']
  ORDER BY created_at DESC LIMIT 10;

  -- Check content ideas
  SELECT * FROM gv_content_studio_posts
  WHERE brand_id = 'TEST_BRAND_UUID'
  AND ai_generated = true
  ORDER BY created_at DESC LIMIT 10;
  ```

### **Monitoring** (After Deployment)

- [ ] **Cost Tracking**
  ```sql
  SELECT brand_id, usage_month, total_cost_usd
  FROM gv_tier_usage
  WHERE usage_month = '2026-02-01'
  ORDER BY total_cost_usd DESC;
  ```

- [ ] **Function Logs**
  ```bash
  supabase functions logs generate-500qa
  supabase functions logs daily-auto-research
  ```

- [ ] **Error Monitoring**
  - [ ] Check Supabase Dashboard → Functions → Logs
  - [ ] Look for failed invocations
  - [ ] Check API rate limits

---

## 📊 Cost Monitoring

### **Expected Monthly Costs per Brand:**

| Tier | 500QA | Daily Research | Total |
|------|-------|---------------|-------|
| Basic | $0.35 | $3.00 | **$3.35** |
| Premium | $0.35 | $4.50 | **$4.85** |
| Partner | $0.35 | $7.50 | **$7.85** |

### **Cost Breakdown:**

**500QA Generation (Monthly)**
- Claude Sonnet 3.5: ~6000 input + 20000 output tokens
- Cost: $0.35/brand

**Daily Research (per day)**
- Basic: 20 queries × $0.005 (Perplexity) + 60 queries × $0.001 (SerpAPI) = $0.10
- Premium: 30 queries × $0.005 + 90 queries × $0.001 = $0.15
- Partner: 50 queries × $0.005 + 150 queries × $0.001 = $0.25

---

## 🎯 Success Metrics

### **After 7 Days:**
- [ ] All brands have 500 questions generated
- [ ] Daily research running without errors
- [ ] Insights dashboard showing new items daily
- [ ] To-do lists populated with high-priority items
- [ ] Content Studio has draft ideas
- [ ] Cost tracking accurate
- [ ] No API rate limit errors

### **After 30 Days:**
- [ ] Basic tier: 150 suggestions delivered (5/day × 30)
- [ ] Premium tier: 300 suggestions delivered (10/day × 30)
- [ ] Partner tier: 600 suggestions delivered (20/day × 30)
- [ ] 20% negative alerts distributed correctly
- [ ] User feedback positive
- [ ] Cost within budget
- [ ] System stable

---

## 🐛 Troubleshooting

### **Common Issues:**

**1. "API key not configured"**
```bash
# Set missing API key
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

**2. "Questions already generated for this month"**
```json
// Use force_regenerate flag
{"brand_id": "uuid", "force_regenerate": true}
```

**3. "Perplexity API error: 429"**
- Rate limit hit, reduce `max_queries_per_channel`
- Add delays between queries (current: 2 seconds)

**4. "No questions found" in daily research**
- Run `generate-500qa` first to populate questions
- Check `gv_keywords` table has questions with `source='ai_suggested'`

**5. Cron job not running**
```sql
-- Check cron job status
SELECT * FROM cron.job_run_details
WHERE jobname LIKE 'geovera%'
ORDER BY start_time DESC LIMIT 10;
```

---

## 📞 Support

### **Documentation:**
- **Technical**: `/500QA_SYSTEM_COMPLETE.md`
- **Upgrade**: `/UPGRADE_300_TO_500QA_SUMMARY.md`
- **Quick Start**: `/QUICK_START_500QA.md`
- **API Docs**: `/supabase/functions/generate-500qa/README.md`

### **Code:**
- **500QA Generator**: `/supabase/functions/generate-500qa/index.ts`
- **Daily Research**: `/supabase/functions/daily-auto-research/index.ts`
- **Deploy Script**: `/supabase/functions/deploy-500qa-system.sh`

---

## ✅ Final Sign-Off

- [ ] All functions deployed successfully
- [ ] Cron jobs scheduled and running
- [ ] Test brand verified (500QA + daily research)
- [ ] Database sync confirmed (Insights, To-Do, Content)
- [ ] Cost tracking verified
- [ ] Documentation reviewed
- [ ] Team notified of deployment
- [ ] Production rollout approved

---

**Status**: ✅ **READY FOR DEPLOYMENT**
**Deployed By**: _____________
**Deployment Date**: _____________
**Sign-Off**: _____________

---

**Built By**: Claude (Anthropic)
**Date**: February 15, 2026
**Version**: 500QA v1.0
