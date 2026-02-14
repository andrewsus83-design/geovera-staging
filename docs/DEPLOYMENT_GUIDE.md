# GEOVERA PRODUCTION DEPLOYMENT GUIDE
## Complete End-to-End Deployment to geovera.xyz

**Version:** 2.0
**Last Updated:** February 14, 2026
**Target Domain:** geovera.xyz
**Status:** Production Ready - Global Rollout

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Database Migration](#database-migration)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Global Operations](#global-operations)

---

## OVERVIEW

### System Architecture

**Frontend:**
- Framework: Vanilla HTML/CSS/JavaScript
- CDN: Vercel Edge Network
- Domain: geovera.xyz
- Global deployment: 300+ edge locations

**Backend:**
- Database: Supabase PostgreSQL (AWS US-East-1)
- Edge Functions: Deno runtime on Supabase
- Authentication: Supabase Auth (JWT-based)
- Storage: Supabase Storage (AWS S3)

**Third-Party APIs:**
- Claude 3.5 Sonnet (Anthropic) - Content analysis, brand intelligence
- GPT-4o-mini (OpenAI) - Article generation, chat
- Perplexity Sonar Pro - Deep research, creator discovery
- Apify - Instagram/TikTok scraping
- SerpAPI - YouTube/Google Trends data

### Deployment Scope

This deployment includes:
- **23 Edge Functions** (24 total endpoints)
- **11 Database Migrations** (28+ tables)
- **Row-Level Security (RLS)** on all tables
- **Multi-tier subscription system** (Basic $399, Premium $699, Partner $1,099)
- **Global support** for 100+ countries

### Cost Structure

**Soft Launch Scale (30% capacity):**
| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| Radar Processing (3K creators) | $245 | 240 creators × 6 categories |
| Authority Hub (60 brands) | $24 | Daily article generation |
| Content Studio | $36 | AI content creation |
| Supabase Pro | $25 | Database + Auth + Storage |
| Vercel Pro | $20 | Frontend hosting + CDN |
| **TOTAL** | **$350/month** | Break-even: 1 customer |

**Full Scale (100% capacity):**
| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| Radar Processing (10K creators) | $816 | 8,000-10,000 creators |
| Authority Hub (200 brands) | $80 | Daily generation |
| Content Studio | $120 | Volume pricing |
| Supabase Pro | $25 | Same tier |
| Vercel Pro | $20 | Same tier |
| **TOTAL** | **$1,061/month** | Break-even: 3 customers |

---

## PRE-DEPLOYMENT CHECKLIST

### Critical Requirements

**Infrastructure:**
- [ ] Supabase project created (recommended: US-East-1 for global latency)
- [ ] Custom domain geovera.xyz configured with DNS provider
- [ ] SSL certificate ready (Vercel auto-provisions)
- [ ] Vercel project created and linked to repository
- [ ] Database backup mechanism enabled (Supabase daily backups)

**API Keys & Secrets:**
- [ ] Anthropic API key (Claude 3.5 Sonnet)
- [ ] OpenAI API key (GPT-4o-mini)
- [ ] Perplexity API key (Sonar Pro)
- [ ] Apify API token
- [ ] SerpAPI key
- [ ] All keys have sufficient quota/credits

**Team Access:**
- [ ] Database Admin: Full PostgreSQL access
- [ ] Function Deployer: Supabase CLI authenticated
- [ ] Frontend Developer: Vercel deployment rights
- [ ] QA Engineer: Test user accounts created

**Monitoring & Observability:**
- [ ] Error tracking (optional: Sentry)
- [ ] Performance monitoring (optional: LogRocket)
- [ ] Uptime monitoring (optional: UptimeRobot)
- [ ] Cost alerts configured (Supabase + Vercel dashboards)

### API Keys Required

```bash
# Core Platform
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# AI Providers
ANTHROPIC_API_KEY=sk-ant-api03-...              # Claude 3.5 Sonnet
OPENAI_API_KEY=sk-proj-...                      # GPT-4o-mini
PERPLEXITY_API_KEY=pplx-...                     # Sonar Pro

# Data Scraping
APIFY_API_TOKEN=apify_api_...                   # Instagram/TikTok scraping
SERP_API_KEY=...                                # YouTube/Google Trends

# Frontend
FRONTEND_URL=https://geovera.xyz
```

---

## ENVIRONMENT SETUP

### Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Linux/WSL
npm install -g supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verify installation
supabase --version
# Expected: >= 1.123.4
```

### Step 2: Login to Supabase

```bash
# Generate access token from: https://supabase.com/dashboard/account/tokens
supabase login

# Link to your production project
cd /path/to/geovera-staging
supabase link --project-ref YOUR_PROJECT_REF

# Verify link
supabase status
```

### Step 3: Set Environment Secrets

```bash
# Set all required API keys as Supabase secrets (encrypted)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set PERPLEXITY_API_KEY=pplx-...
supabase secrets set APIFY_API_TOKEN=apify_api_...
supabase secrets set SERP_API_KEY=...
supabase secrets set FRONTEND_URL=https://geovera.xyz

# Verify secrets are set (will show names only, not values)
supabase secrets list

# Expected output:
# NAME                  | DIGEST
# ----------------------|--------
# ANTHROPIC_API_KEY     | e3b0c4...
# OPENAI_API_KEY        | a1b2c3...
# PERPLEXITY_API_KEY    | d4e5f6...
# APIFY_API_TOKEN       | g7h8i9...
# SERP_API_KEY          | j0k1l2...
# FRONTEND_URL          | m3n4o5...
```

### Step 4: Configure Frontend Environment

Create `frontend/.env.production`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Frontend URL (for redirects and CORS)
FRONTEND_URL=https://geovera.xyz
```

**Security Note:** Never commit `.env.production` to Git. Add to `.gitignore`.

---

## DATABASE MIGRATION

### Overview

**Total migrations:** 11 files
**Total tables:** 28+
**Estimated time:** 5-10 minutes
**Downtime:** None (migrations are additive)

### Migration Files

```
supabase/migrations/
├── 20260212160914_enable_production_rls.sql       # RLS policies (security)
├── 20260213135543_create_ai_conversations.sql     # AI Chat feature
├── 20260213200000_ai_chat_schema.sql              # AI Chat tables
├── 20260213210000_search_insights_schema.sql      # Search tracking
├── 20260213220000_content_studio_schema.sql       # Content generation
├── 20260213230000_fix_onboarding_schema.sql       # Onboarding wizard
├── 20260213240000_radar_schema.sql                # Radar (Partner only)
├── 20260213250000_brand_authority_patterns.sql    # ML patterns
├── 20260213260000_authority_hub_schema.sql        # Hub collections
├── 20260213270000_hub_3tab_update.sql             # Hub UI update
└── 20260214100000_radar_tier_based_scraping.sql   # Tier-based scraping
```

### Step 1: Backup Existing Database (If Applicable)

```bash
# Create full database backup before migration
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh backup_*.sql

# Expected output:
# -rw-r--r-- 1 user staff 45M Feb 14 10:00 backup_20260214_100000.sql
```

### Step 2: Review Migration Plan

```bash
# Check which migrations need to be applied
supabase migration list

# Expected output:
# Migrations applied to production:
# 20260211000000_initial_schema.sql
# 20260212000000_add_subscriptions.sql
# ...
#
# Pending migrations:
# 20260212160914_enable_production_rls.sql
# 20260213135543_create_ai_conversations.sql
# (list continues...)

# Review pending migrations
supabase db diff
```

### Step 3: Apply Migrations

```bash
# DRY RUN: Preview changes without applying
supabase db push --dry-run

# Review output carefully, then apply:
supabase db push

# Expected output:
# Applying migration 20260212160914_enable_production_rls.sql...
# Applying migration 20260213135543_create_ai_conversations.sql...
# Applying migration 20260213200000_ai_chat_schema.sql...
# Applying migration 20260213210000_search_insights_schema.sql...
# Applying migration 20260213220000_content_studio_schema.sql...
# Applying migration 20260213230000_fix_onboarding_schema.sql...
# Applying migration 20260213240000_radar_schema.sql...
# Applying migration 20260213250000_brand_authority_patterns.sql...
# Applying migration 20260213260000_authority_hub_schema.sql...
# Applying migration 20260213270000_hub_3tab_update.sql...
# Applying migration 20260214100000_radar_tier_based_scraping.sql...
#
# ✅ All migrations applied successfully!
```

### Step 4: Verify Database Schema

```bash
# Connect to production database
supabase db reset --db-url postgresql://...

# Verify critical tables exist
psql $DATABASE_URL -c "\dt"

# Expected tables:
# - brands
# - users
# - subscriptions
# - gv_content_library
# - gv_hub_collections
# - gv_hub_embedded_content
# - gv_creators
# - gv_creator_content
# - gv_discovered_brands
# - gv_creator_rankings
# - gv_brand_marketshare
# - gv_trends
# (28+ tables total)
```

### Step 5: Verify RLS Policies

```bash
# Check RLS is enabled on critical tables
psql $DATABASE_URL -c "
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'gv_%'
ORDER BY tablename;
"

# Expected: rowsecurity = t (true) for all tables
```

---

## EDGE FUNCTIONS DEPLOYMENT

### Overview

**Total functions:** 23 Edge Functions (24 endpoints)
**Runtime:** Deno (V8 isolate)
**Deployment time:** 10-15 minutes
**Rollback:** Automatic version control

### Function List

**Core Platform (4):**
1. `onboard-brand-v4` - 5-step onboarding wizard
2. `simple-onboarding` - Simplified onboarding (deprecated)
3. `ai-chat` - AI brand assistant
4. `generate-daily-insights` - Daily task generation (Q2 2026)

**Content Studio (4):**
5. `generate-article` - AI article generation
6. `generate-image` - DALL-E 3 image generation
7. `generate-video` - Runway video generation
8. `analyze-visual-content` - Image/video analysis

**Authority Hub (6):**
9. `hub-create-collection` - Create content collection
10. `hub-discover-content` - Discover trending content
11. `hub-generate-article` - Generate Hub article
12. `hub-generate-charts` - Data visualization
13. `buzzsumo-discover-viral` - Viral topic discovery
14. `buzzsumo-generate-story` - Story generation
15. `buzzsumo-get-discoveries` - Discovery retrieval

**Radar - Partner Tier Only (9):**
16. `radar-discover-brands` - Competitor discovery
17. `radar-discover-creators` - Influencer discovery
18. `radar-discover-trends` - Trend discovery
19. `radar-scrape-content` - Content scraping (Apify)
20. `radar-scrape-serpapi` - YouTube/Google scraping
21. `radar-analyze-content` - Claude content analysis
22. `radar-calculate-rankings` - Mindshare rankings
23. `radar-calculate-marketshare` - Marketshare calculation
24. `radar-learn-brand-authority` - ML pattern learning

**Content Training (3):**
25. `train-brand-model` - Custom brand model training
26. `record-content-feedback` - User feedback tracking

### Step 1: Deploy All Functions

```bash
# Deploy all functions at once
cd /path/to/geovera-staging

# Deploy all Edge Functions
supabase functions deploy --no-verify-jwt

# Expected output:
# Deploying function: onboard-brand-v4
# ✅ Function deployed successfully
#
# Deploying function: ai-chat
# ✅ Function deployed successfully
#
# (continues for all 23 functions...)
#
# ✅ All functions deployed successfully!
```

### Step 2: Deploy Individual Functions (Alternative)

```bash
# Deploy specific function
supabase functions deploy onboard-brand-v4

# Deploy with custom settings
supabase functions deploy ai-chat \
  --no-verify-jwt \
  --import-map supabase/functions/_shared/import_map.json

# Verify deployment
supabase functions list

# Expected output:
# NAME                          | VERSION | UPDATED
# ------------------------------|---------|--------
# onboard-brand-v4              | v2      | 2 minutes ago
# ai-chat                       | v1      | 5 minutes ago
# (list continues...)
```

### Step 3: Test Edge Functions

```bash
# Test onboarding function
curl -X POST https://your-project.supabase.co/functions/v1/onboard-brand-v4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"step": 1}'

# Expected response:
# {
#   "success": true,
#   "step": 1,
#   "message": "Welcome to GeoVera!"
# }

# Test AI chat function
curl -X POST https://your-project.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "your-brand-id",
    "message": "Hello, how can you help me?"
  }'

# Expected response:
# {
#   "success": true,
#   "session_id": "...",
#   "response": "I can help you with..."
# }
```

### Step 4: Configure Function Timeouts

```bash
# Edge Functions have default 150s timeout
# Increase for long-running functions:

# Radar scraping (up to 5 minutes)
supabase functions deploy radar-scrape-content --timeout 300

# Content generation (up to 3 minutes)
supabase functions deploy generate-article --timeout 180
```

---

## FRONTEND DEPLOYMENT

### Overview

**Platform:** Vercel Edge Network
**Domain:** geovera.xyz
**CDN:** 300+ global edge locations
**Deployment time:** 2-3 minutes

### Step 1: Configure Vercel Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
cd frontend
vercel link

# Follow prompts:
# ? Set up and deploy "~/geovera-staging/frontend"? [Y/n] Y
# ? Which scope do you want to deploy to? Your Team
# ? Link to existing project? [y/N] N
# ? What's your project's name? geovera
# ? In which directory is your code located? ./
```

### Step 2: Configure Custom Domain

```bash
# Add custom domain geovera.xyz
vercel domains add geovera.xyz

# Configure DNS records at your domain provider:
# Type: A
# Name: @
# Value: 76.76.21.21
#
# Type: CNAME
# Name: www
# Value: cname.vercel-dns.com
```

### Step 3: Set Environment Variables

```bash
# Set production environment variables
vercel env add VITE_SUPABASE_URL production
# Enter: https://your-project.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Enter: eyJhbGciOiJIUzI1NiIs...

vercel env add FRONTEND_URL production
# Enter: https://geovera.xyz
```

### Step 4: Deploy to Production

```bash
# Deploy to production (geovera.xyz)
cd frontend
vercel --prod

# Expected output:
# 🔍 Inspect: https://vercel.com/...
# ✅ Production: https://geovera.xyz [copied to clipboard]
#
# Deployment complete! Your site is live at:
# https://geovera.xyz
```

### Step 5: Verify Frontend Deployment

```bash
# Check site is live
curl -I https://geovera.xyz

# Expected response:
# HTTP/2 200
# content-type: text/html
# x-vercel-cache: HIT
# x-vercel-id: ...

# Test onboarding page
curl https://geovera.xyz/onboarding-v4.html | grep "GeoVera"

# Expected: HTML content with GeoVera branding
```

---

## POST-DEPLOYMENT VERIFICATION

### Step 1: Smoke Tests

**Test User Registration:**
```bash
# Create test user account
curl -X POST https://your-project.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@geovera.xyz",
    "password": "TestPassword123!"
  }'

# Expected: Email confirmation sent
```

**Test Onboarding Flow:**
1. Visit https://geovera.xyz/onboarding-v4.html
2. Complete Step 1: Welcome
3. Complete Step 2: Brand information
4. Complete Step 3: Social media links
5. Complete Step 4: Confirmation
6. Complete Step 5: Tier selection
7. Verify redirect to dashboard

**Test Content Generation:**
```bash
# Generate test article
curl -X POST https://your-project.supabase.co/functions/v1/generate-article \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "your-brand-id",
    "topic": "Test Article",
    "tone": "professional"
  }'

# Expected: Article generated successfully
```

### Step 2: Load Testing

```bash
# Install k6 load testing tool
brew install k6

# Run load test (100 concurrent users)
k6 run --vus 100 --duration 30s loadtest.js

# Expected: <1s response time, 0 errors
```

### Step 3: Security Verification

**Test RLS Policies:**
```sql
-- Try to access another user's brand (should fail)
SELECT * FROM brands WHERE id = 'other-user-brand-id';

-- Expected: No rows returned (RLS blocks access)
```

**Test API Key Security:**
```bash
# Try to call Edge Function without auth (should fail)
curl -X POST https://your-project.supabase.co/functions/v1/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "test", "message": "hello"}'

# Expected: 401 Unauthorized
```

### Step 4: Cost Monitoring

**Set Up Cost Alerts:**
1. Supabase Dashboard → Project → Settings → Billing
2. Set alert threshold: $100/month
3. Enable email notifications

**Monitor API Usage:**
```bash
# Check Anthropic usage
curl https://api.anthropic.com/v1/usage \
  -H "x-api-key: $ANTHROPIC_API_KEY"

# Check OpenAI usage
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## ROLLBACK PROCEDURES

### Scenario 1: Edge Function Failure

```bash
# List function versions
supabase functions list --include-versions

# Rollback to previous version
supabase functions deploy function-name --version v1

# Example: Rollback ai-chat to v1
supabase functions deploy ai-chat --version v1
```

### Scenario 2: Database Migration Failure

```bash
# Restore from backup
psql $DATABASE_URL < backup_20260214_100000.sql

# Revert specific migration
supabase migration down 20260214100000_radar_tier_based_scraping.sql

# Verify database state
supabase db diff
```

### Scenario 3: Frontend Deployment Failure

```bash
# Rollback Vercel deployment
vercel rollback

# Or rollback to specific deployment
vercel rollback deployment-url

# Verify rollback
curl -I https://geovera.xyz
```

### Scenario 4: Complete System Rollback

```bash
# 1. Rollback frontend
vercel rollback

# 2. Rollback all Edge Functions
for func in $(ls supabase/functions); do
  supabase functions deploy $func --version v1
done

# 3. Restore database from backup
psql $DATABASE_URL < backup_20260214_100000.sql

# 4. Verify all systems operational
./scripts/health-check.sh
```

---

## GLOBAL OPERATIONS

### Supported Countries

GeoVera supports **100+ countries** with ISO 3166-1 alpha-2 codes:

**Priority Markets (Phase 1 - Q1 2026):**
- United States (US)
- United Kingdom (GB)
- Australia (AU)
- Canada (CA)
- Singapore (SG)

**Expansion Markets (Phase 2 - Q2 2026):**
- Germany (DE), France (FR), Italy (IT), Spain (ES)
- Japan (JP), South Korea (KR), Hong Kong (HK)
- United Arab Emirates (AE), Saudi Arabia (SA)

**Full Country List:**
```
ID, US, GB, SG, MY, TH, PH, VN, AU, JP, KR, CN, IN, DE, FR, IT, ES, NL, BR, CA, MX,
AE, SA, TR, RU, ZA, NG, EG, KE, NZ, HK, TW, PK, BD, LK, MM, KH, LA, BN, SE, NO, DK,
FI, PL, CZ, AT, CH, BE, PT, GR, IE, IL, QA, KW, BH, OM, JO, LB, AR, CL, CO, PE, EC,
UY, PY, BO, VE, CR, PA, GT, HN, SV, NI, DO, CU, JM, TT, PR, GH, CM, CI, SN, TZ, UG,
ET, MA, TN, DZ, LY, UA, RO, HU, BG, HR, RS, SK, SI, LT, LV, EE, MT, CY, LU, IS
```

### Multi-Currency Support

**Pricing Currency:** USD (all tiers)

**Regional Pricing (Coming Q2 2026):**
| Region | Currency | Exchange Rate | Local Price |
|--------|----------|---------------|-------------|
| United States | USD | 1.00 | $399, $699, $1,099 |
| Europe | EUR | 0.92 | €367, €643, €1,011 |
| United Kingdom | GBP | 0.79 | £315, £552, £868 |
| Australia | AUD | 1.52 | A$607, A$1,062, A$1,670 |
| Singapore | SGD | 1.34 | S$535, S$937, S$1,473 |
| Japan | JPY | 149.50 | ¥59,651, ¥104,521, ¥164,281 |

### Timezone Handling

**Server Timezone:** UTC (all timestamps stored in UTC)

**Supported Timezones:** All IANA timezone identifiers

**Example Conversion:**
```javascript
// User in Tokyo (JST = UTC+9)
const userTime = new Date('2026-02-14T10:00:00Z'); // UTC
const tokyoTime = userTime.toLocaleString('ja-JP', {
  timeZone: 'Asia/Tokyo'
});
// Output: 2026/2/14 19:00:00

// User in New York (EST = UTC-5)
const nyTime = userTime.toLocaleString('en-US', {
  timeZone: 'America/New_York'
});
// Output: 2/14/2026, 5:00:00 AM
```

### Language Support

**Current (Q1 2026):**
- English (US, UK, AU)

**Roadmap:**
- **Q2 2026:** Spanish (ES), French (FR), German (DE)
- **Q3 2026:** Japanese (JP), Korean (KR), Mandarin (CN)
- **Q4 2026:** Arabic (AR), Portuguese (PT), Hindi (HI)

---

## SUPPORT & MAINTENANCE

### Monitoring Dashboards

**Supabase Dashboard:**
- Database health: CPU, memory, connections
- Edge Function performance: latency, errors
- Auth metrics: signups, logins, active users

**Vercel Dashboard:**
- Frontend performance: load time, cache hit rate
- Traffic analytics: pageviews, unique visitors
- Error tracking: 4xx, 5xx errors

### Incident Response

**Severity Levels:**
| Level | Response Time | Description |
|-------|---------------|-------------|
| P0 - Critical | 15 minutes | System down, no access |
| P1 - High | 1 hour | Feature broken, user impact |
| P2 - Medium | 4 hours | Degraded performance |
| P3 - Low | 24 hours | Minor bug, no user impact |

**On-Call Rotation:**
- Primary: Database admin
- Secondary: Function deployer
- Escalation: CTO

### Regular Maintenance

**Daily:**
- Monitor cost dashboards
- Review error logs
- Check API quota usage

**Weekly:**
- Database vacuum and analyze
- Review slow query logs
- Update dependencies

**Monthly:**
- Security patch updates
- Performance optimization
- Cost review and optimization

---

## APPENDIX

### A. Environment Variables Reference

```bash
# Core Platform
SUPABASE_URL                    # Supabase project URL
SUPABASE_ANON_KEY               # Public API key
SUPABASE_SERVICE_ROLE_KEY       # Admin API key (secret)

# AI Providers
ANTHROPIC_API_KEY               # Claude 3.5 Sonnet
OPENAI_API_KEY                  # GPT-4o-mini, DALL-E 3
PERPLEXITY_API_KEY              # Sonar Pro

# Data Scraping
APIFY_API_TOKEN                 # Instagram/TikTok scraping
SERP_API_KEY                    # YouTube/Google Trends

# Frontend
FRONTEND_URL                    # Production frontend URL
```

### B. API Rate Limits

| API Provider | Rate Limit | Cost per 1M tokens |
|--------------|------------|---------------------|
| Claude 3.5 Sonnet | 50 req/min | $3.00 input, $15.00 output |
| GPT-4o-mini | 500 req/min | $0.15 input, $0.60 output |
| Perplexity Sonar Pro | 50 req/min | $3.00 per 1M tokens |
| Apify | No limit | $0.50 per 1,000 requests |
| SerpAPI | 100 req/min | $0.001 per search |

### C. Database Backup Schedule

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Automatic | Daily 2:00 AM UTC | 7 days | Supabase |
| Manual | On-demand | 30 days | S3 bucket |
| Weekly | Sunday 2:00 AM UTC | 90 days | S3 bucket |
| Monthly | 1st of month | 1 year | S3 bucket |

### D. Useful Commands

```bash
# Check Supabase status
supabase status

# View function logs
supabase functions logs function-name --tail

# Database shell
psql $DATABASE_URL

# Reset local database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --linked > types/supabase.ts
```

---

**Document Version:** 2.0
**Last Updated:** February 14, 2026
**Next Review:** February 21, 2026
**Maintained By:** DevOps Team

**Questions or Issues?**
- Technical: devops@geovera.xyz
- Security: security@geovera.xyz
- General: support@geovera.xyz
