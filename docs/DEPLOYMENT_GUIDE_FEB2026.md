# GEOVERA PRODUCTION DEPLOYMENT GUIDE
## February 2026 Edition

**Version:** 1.0
**Last Updated:** February 14, 2026
**Target Deployment:** February 20, 2026
**Status:** Production Ready

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Database Migration](#database-migration)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

### System Architecture

GeoVera is built on:
- **Frontend:** React + Vite (deployed on Vercel)
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **APIs:** Claude 3.5, OpenAI, Perplexity, Apify, SerpAPI

### Deployment Scope

This deployment includes:
- 23 Edge Functions
- 11 Database Migrations
- 28+ Database Tables
- Row-Level Security (RLS) Policies
- Multi-tier subscription system (Basic, Premium, Partner)

### Cost Structure (Soft Launch - 30% Scale)

| Component | Monthly Cost |
|-----------|--------------|
| Radar Processing (3K creators) | $245 |
| Authority Hub (60 brands) | $24 |
| Content Studio (estimated) | $36 |
| **TOTAL** | **$305/month** |

**Break-even:** 1 Basic tier customer ($399/month)

---

## PRE-DEPLOYMENT CHECKLIST

### Critical Requirements

- [ ] Supabase project created and accessible
- [ ] All API keys obtained and verified
- [ ] Frontend repository deployed on Vercel
- [ ] Database backup created (if upgrading existing)
- [ ] Team notified of deployment window
- [ ] Monitoring tools configured (optional: Sentry, LogRocket)

### API Keys Required

```bash
# Core Platform
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
ANTHROPIC_API_KEY=sk-ant-xxxxx              # Claude 3.5 Sonnet
OPENAI_API_KEY=sk-xxxxx                     # GPT-4o-mini
PERPLEXITY_API_KEY=pplx-xxxxx               # Deep research

# Data Scraping
APIFY_API_TOKEN=apify_api_xxxxx             # Instagram/TikTok
SERP_API_KEY=xxxxx                          # YouTube/Google Trends

# Frontend
FRONTEND_URL=https://geovera.vercel.app
```

### Team Access

Ensure these team members have access:
- **Database Admin:** Full PostgreSQL access
- **Function Deployer:** Supabase CLI access
- **Frontend Developer:** Vercel deploy rights
- **QA Engineer:** Test credentials

---

## ENVIRONMENT SETUP

### Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Linux/WSL
npm install -g supabase

# Verify installation
supabase --version
```

### Step 2: Login to Supabase

```bash
# Login with access token
supabase login

# Link to your project
cd /path/to/geovera-staging
supabase link --project-ref your-project-ref
```

### Step 3: Set Environment Secrets

```bash
# Set all required API keys as Supabase secrets
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
supabase secrets set OPENAI_API_KEY=sk-xxxxx
supabase secrets set PERPLEXITY_API_KEY=pplx-xxxxx
supabase secrets set APIFY_API_TOKEN=apify_api_xxxxx
supabase secrets set SERP_API_KEY=xxxxx
supabase secrets set FRONTEND_URL=https://geovera.vercel.app

# Verify secrets are set (will show names only, not values)
supabase secrets list
```

### Step 4: Configure Frontend Environment

Create `/frontend/.env.production`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
FRONTEND_URL=https://geovera.vercel.app
```

Deploy to Vercel:

```bash
cd frontend
vercel --prod
```

---

## DATABASE MIGRATION

### Overview

Total migrations: **11 files**
Total tables: **28+**
Estimated time: **5-10 minutes**

### Migration Files

```
supabase/migrations/
├── 20260212160914_enable_production_rls.sql
├── 20260213135543_create_ai_conversations.sql
├── 20260213200000_ai_chat_schema.sql
├── 20260213210000_search_insights_schema.sql
├── 20260213220000_content_studio_schema.sql
├── 20260213230000_fix_onboarding_schema.sql
├── 20260213240000_radar_schema.sql
├── 20260213250000_brand_authority_patterns.sql
├── 20260213260000_authority_hub_schema.sql
├── 20260213270000_hub_3tab_update.sql
└── 20260214000000_content_training_system.sql
```

### Step 1: Backup Existing Database (If Applicable)

```bash
# Create backup before migration
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh backup_*.sql
```

### Step 2: Review Migration Plan

```bash
# Check which migrations need to be applied
supabase migration list

# Review pending migrations
supabase db diff
```

### Step 3: Apply All Migrations

```bash
# Apply all pending migrations
supabase db push

# Expected output:
# Applying migration 20260212160914_enable_production_rls.sql...
# Applying migration 20260213135543_create_ai_conversations.sql...
# ... (9 more migrations)
# All migrations applied successfully!
```

### Step 4: Verify Tables Created

```bash
# List all tables
psql $DATABASE_URL -c "\dt public.gv_*"

# Expected tables (28+):
# gv_brands, gv_users, gv_user_brands
# gv_onboarding_progress, gv_brand_confirmations
# gv_ai_chat_sessions, gv_ai_conversations
# gv_content_library, gv_content_queue, gv_content_performance
# gv_hub_collections, gv_hub_embedded_content, gv_hub_articles
# gv_creators, gv_creator_content, gv_creator_rankings
# gv_brand_marketshare, gv_trends, gv_trend_involvement
# gv_radar_processing_queue, gv_radar_snapshots
# gv_brand_authority_patterns, gv_discovered_brands
# gv_daily_insights, gv_crisis_events, gv_task_actions
# ... and more
```

### Step 5: Verify RLS Policies

```bash
# Check RLS is enabled on all tables
psql $DATABASE_URL -c "
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'gv_%'
ORDER BY tablename;
"

# All tables should show rowsecurity = true
```

---

## EDGE FUNCTIONS DEPLOYMENT

### Overview

Total functions: **23**
Deployment method: **Supabase CLI**
Estimated time: **10-15 minutes**

### Function List

**AI & Chat (1):**
- `ai-chat` - AI chat assistant with OpenAI

**Onboarding (2):**
- `simple-onboarding` - Legacy onboarding
- `onboard-brand-v4` - Current 5-step onboarding

**Content Studio (3):**
- `generate-article` - AI article generation
- `generate-image` - AI image generation (DALL-E)
- `generate-video` - AI video generation (Runway)

**Authority Hub (4):**
- `hub-create-collection` - Create content collections
- `hub-discover-content` - Discover trending content
- `hub-generate-article` - Generate Hub articles
- `hub-generate-charts` - Generate data visualizations

**Radar (9):**
- `radar-discover-brands` - Discover competitor brands
- `radar-discover-creators` - Discover influencers (Perplexity)
- `radar-scrape-content` - Scrape social media (Apify)
- `radar-scrape-serpapi` - Scrape YouTube/Google (SerpAPI)
- `radar-analyze-content` - Analyze content quality (Claude)
- `radar-learn-brand-authority` - ML pattern learning
- `radar-calculate-rankings` - Calculate Mindshare
- `radar-calculate-marketshare` - Calculate Marketshare
- `radar-discover-trends` - Discover trending topics

**Content Training (3):**
- `analyze-visual-content` - Analyze images/videos
- `train-brand-model` - Train brand voice models
- `record-content-feedback` - Record user feedback

### Deployment Methods

#### Option A: Deploy All Functions (Recommended)

```bash
# Use the automated deployment script
chmod +x DEPLOY_ALL_PRODUCTION.sh
./DEPLOY_ALL_PRODUCTION.sh

# This will:
# 1. Deploy all 23 functions
# 2. Verify database schema
# 3. Check environment variables
# 4. Run basic tests
# 5. Show deployment summary
```

#### Option B: Deploy Individual Functions

```bash
# Deploy a single function
supabase functions deploy ai-chat --no-verify-jwt

# Deploy multiple functions
for func in ai-chat hub-create-collection radar-discover-creators; do
  supabase functions deploy $func --no-verify-jwt
done
```

#### Option C: Deploy by Feature Group

```bash
# Deploy Radar functions only
cd supabase/functions
chmod +x deploy-ranking-functions.sh
./deploy-ranking-functions.sh

# Deploy Hub functions only
chmod +x deploy-hub-functions.sh
./deploy-hub-functions.sh

# Deploy Content Training functions
chmod +x deploy-content-training.sh
./deploy-content-training.sh
```

### JWT Verification Note

**Important:** All functions use `--no-verify-jwt` flag because JWT verification is handled internally within each function. Do NOT remove this flag unless you modify the authentication logic.

### Verify Functions Deployed

```bash
# List all deployed functions
supabase functions list

# Expected output:
# NAME                           CREATED_AT              VERSION
# ai-chat                        2026-02-14 10:30:00     1
# hub-create-collection          2026-02-14 10:31:00     1
# radar-discover-creators        2026-02-14 10:32:00     1
# ... (20 more functions)
```

### Test Function Invocation

```bash
# Test ai-chat function
curl -X POST \
  https://your-project.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "test-brand-id",
    "message": "Hello, how are you?"
  }'

# Expected response:
# {
#   "success": true,
#   "session_id": "uuid...",
#   "response": "Hello! I'm here to help you with...",
#   "metadata": { ... }
# }
```

---

## POST-DEPLOYMENT VERIFICATION

### 1. Database Health Check

```bash
# Check table row counts
psql $DATABASE_URL -c "
SELECT
  'gv_brands' as table_name, COUNT(*) as row_count FROM gv_brands
UNION ALL
SELECT 'gv_users', COUNT(*) FROM gv_users
UNION ALL
SELECT 'gv_creators', COUNT(*) FROM gv_creators
UNION ALL
SELECT 'gv_hub_collections', COUNT(*) FROM gv_hub_collections;
"
```

### 2. Edge Functions Health Check

```bash
# Test critical functions
echo "Testing ai-chat..."
curl -s https://your-project.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" | jq .

echo "Testing hub-create-collection..."
curl -s -X POST https://your-project.supabase.co/functions/v1/hub-create-collection \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"category":"beauty"}' | jq .
```

### 3. API Keys Verification

```bash
# Test Perplexity API
curl -X POST https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sonar-pro",
    "messages": [{"role": "user", "content": "Test"}]
  }'

# Test Claude API
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Test"}]
  }'

# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### 4. Frontend Integration Check

```bash
# Test frontend can connect to Supabase
curl https://geovera.vercel.app/api/health

# Check frontend environment
curl https://geovera.vercel.app/_vercel/env | jq .
```

### 5. End-to-End Workflow Tests

#### Test 1: User Onboarding Flow

1. Visit: `https://geovera.vercel.app/onboarding`
2. Complete all 5 steps
3. Verify brand created in database
4. Check onboarding email queued

#### Test 2: Hub Collection Creation

```bash
# Create a test Hub collection
curl -X POST https://your-project.supabase.co/functions/v1/hub-create-collection \
  -H "Authorization: Bearer $TEST_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "article_type": "hot",
    "keywords": ["skincare", "trending"]
  }'
```

#### Test 3: Radar Creator Discovery (Partner Tier Only)

```bash
# Discover creators in beauty category
curl -X POST https://your-project.supabase.co/functions/v1/radar-discover-creators \
  -H "Authorization: Bearer $PARTNER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "country": "ID",
    "batch_size": 10
  }'
```

### 6. Monitoring Setup

```bash
# Monitor function logs (real-time)
supabase functions logs ai-chat --tail

# Monitor database connections
psql $DATABASE_URL -c "
SELECT count(*), state
FROM pg_stat_activity
GROUP BY state;
"

# Monitor database size
psql $DATABASE_URL -c "
SELECT pg_size_pretty(pg_database_size(current_database()));
"
```

---

## ROLLBACK PROCEDURES

### Emergency Rollback Steps

#### If Functions Fail

```bash
# 1. Rollback specific function to previous version
supabase functions deploy ai-chat --version previous

# 2. Or delete problematic function
supabase functions delete ai-chat

# 3. Redeploy from backup
git checkout HEAD~1 supabase/functions/ai-chat/
supabase functions deploy ai-chat --no-verify-jwt
```

#### If Database Migration Fails

```bash
# 1. Stop immediately
# DO NOT apply more migrations

# 2. Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# 3. Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM gv_brands;"

# 4. Fix migration file
# Edit problematic migration file

# 5. Re-attempt migration
supabase db push
```

#### If Complete System Failure

```bash
# NUCLEAR OPTION: Restore entire project

# 1. Create new Supabase project
supabase projects create geovera-staging-rollback

# 2. Restore database from backup
psql $NEW_DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# 3. Redeploy all functions
./DEPLOY_ALL_PRODUCTION.sh

# 4. Update frontend environment variables
# Point VITE_SUPABASE_URL to new project

# 5. Redeploy frontend
cd frontend && vercel --prod
```

### Rollback Decision Matrix

| Issue | Severity | Action | Rollback? |
|-------|----------|--------|-----------|
| Single function error | Low | Fix and redeploy | No |
| Multiple functions failing | Medium | Rollback functions | Partial |
| Database migration error | High | Stop and restore | Yes |
| Data corruption | Critical | Full rollback | Yes |
| Performance degradation | Medium | Investigate first | No |
| API rate limits exceeded | Low | Adjust rate limits | No |

---

## TROUBLESHOOTING

### Common Issues

#### Issue 1: Function Deployment Fails

**Symptoms:**
```
Error: Function deployment failed
Reason: Missing environment variable
```

**Solution:**
```bash
# Check all secrets are set
supabase secrets list

# Set missing secret
supabase secrets set MISSING_KEY=value

# Redeploy function
supabase functions deploy function-name --no-verify-jwt
```

#### Issue 2: Database Connection Error

**Symptoms:**
```
Error: Connection to database failed
FATAL: remaining connection slots are reserved
```

**Solution:**
```bash
# Check active connections
psql $DATABASE_URL -c "
SELECT count(*) FROM pg_stat_activity;
"

# If too many connections, kill idle ones
psql $DATABASE_URL -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND query_start < NOW() - INTERVAL '10 minutes';
"
```

#### Issue 3: RLS Policy Blocks Queries

**Symptoms:**
```
Error: new row violates row-level security policy
```

**Solution:**
```bash
# Check RLS policies
psql $DATABASE_URL -c "
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'gv_%';
"

# Temporarily disable RLS for testing (NOT for production!)
psql $DATABASE_URL -c "
ALTER TABLE gv_brands DISABLE ROW LEVEL SECURITY;
"

# Re-enable after testing
psql $DATABASE_URL -c "
ALTER TABLE gv_brands ENABLE ROW LEVEL SECURITY;
"
```

#### Issue 4: API Rate Limits Exceeded

**Symptoms:**
```
Error: Rate limit exceeded (429)
Provider: Perplexity/Claude/OpenAI
```

**Solution:**
```bash
# Check API usage logs
psql $DATABASE_URL -c "
SELECT
  ai_provider,
  COUNT(*) as request_count,
  SUM(cost_usd) as total_cost
FROM gv_ai_conversations
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ai_provider;
"

# Implement rate limiting in functions
# Add delay between requests
# Switch to cheaper model temporarily
```

#### Issue 5: Frontend Can't Connect to Backend

**Symptoms:**
```
Error: Failed to fetch
Network error when attempting to reach Supabase
```

**Solution:**
```bash
# Check CORS settings
# Verify in Supabase Dashboard > Settings > API

# Allowed origins should include:
# - https://geovera.vercel.app
# - https://*.vercel.app (for preview deployments)
# - http://localhost:5173 (for local development)

# Check frontend environment variables
vercel env ls

# Pull latest environment
vercel env pull .env.production
```

### Logs and Debugging

```bash
# View function logs
supabase functions logs ai-chat --tail

# View database logs (requires admin access)
psql $DATABASE_URL -c "
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
"

# View recent errors
supabase logs --type edge-function --level error

# Export logs for analysis
supabase logs --type edge-function --since 1h > logs.txt
```

### Performance Monitoring

```bash
# Monitor function response times
curl -w "@curl-format.txt" -o /dev/null -s \
  https://your-project.supabase.co/functions/v1/ai-chat

# curl-format.txt contents:
# time_total: %{time_total}s
# time_namelookup: %{time_namelookup}s
# time_connect: %{time_connect}s
# time_starttransfer: %{time_starttransfer}s

# Monitor database query performance
psql $DATABASE_URL -c "
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
"
```

---

## DEPLOYMENT TIMELINE

### Pre-Launch (Feb 14-19)

- [ ] Day 1-2: Deploy all functions and migrations
- [ ] Day 3: End-to-end testing with real APIs
- [ ] Day 4: Seed initial data (creators, test brands)
- [ ] Day 5: Performance testing and optimization
- [ ] Day 6: Final security audit

### Launch Day (Feb 20)

- [ ] 9:00 AM: Final system check
- [ ] 10:00 AM: Enable sign-ups
- [ ] 11:00 AM: Send announcement emails
- [ ] 12:00 PM: Post on social media
- [ ] Throughout day: Monitor logs and performance
- [ ] 5:00 PM: Deployment retrospective

### Post-Launch (Feb 21-27)

- [ ] Day 1: Monitor first customer onboarding
- [ ] Day 2-7: Daily check-ins and bug fixes
- [ ] Day 7: First weekly metrics review

---

## SUCCESS METRICS

### Week 1 Goals
- [ ] 5+ customer sign-ups
- [ ] 95%+ uptime
- [ ] Average response time < 2 seconds
- [ ] Zero critical bugs
- [ ] API costs within budget ($305/month)

### Month 1 Goals
- [ ] 10+ customer sign-ups
- [ ] $3,990+ MRR (Monthly Recurring Revenue)
- [ ] <5% churn rate
- [ ] 4.5+ average customer rating

---

## SUPPORT CONTACTS

**Technical Issues:** tech@geovera.xyz
**Emergency Hotline:** +62-XXX-XXXX-XXXX
**Deployment Lead:** [Your Name]
**Database Admin:** [DBA Name]

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Next Review:** March 1, 2026
