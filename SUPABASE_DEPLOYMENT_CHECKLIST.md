# 🚀 SUPABASE DEPLOYMENT CHECKLIST - GEOVERA

**Date**: 12 February 2026
**Status**: Ready for verification and deployment
**Total Functions**: 32 Edge Functions
**Total Tables**: 35+ database tables

---

## 📋 DEPLOYMENT VERIFICATION CHECKLIST

### **STEP 1: Environment Variables** ✅

Verify ALL environment variables are set in Supabase:

```bash
# Core Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
PERPLEXITY_API_KEY=pplx-...

# Data Sources
APIFY_API_TOKEN=apify_api_...
SERPAPI_KEY=...

# Publishing
NOTION_API_KEY=secret_...
NOTION_VERSION=2022-06-28
```

**Command to verify**:
```sql
SELECT name FROM vault.secrets;
```

---

## 📊 STEP 2: Database Tables

### **Critical Tables** (Must exist BEFORE deployment)

#### **1. Core Brand Tables**
- [ ] `brands`
  ```sql
  id uuid PRIMARY KEY
  brand_name text NOT NULL
  category text
  country text
  website_url text
  description text
  created_at timestamptz
  updated_at timestamptz
  ```

- [ ] `gv_brand_chronicle`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  brand_dna jsonb
  business_model text
  competitive_position text
  customer_profile text
  brand_narrative text
  key_themes text[]
  strategic_focus text[]
  brand_pillars jsonb
  full_document text
  data_sources_count int
  tokens_used int
  cost_usd numeric
  created_at timestamptz
  ```

- [ ] `gv_platform_research`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  chronicle_id uuid REFERENCES gv_brand_chronicle(id)
  platform_rankings jsonb
  primary_platform text
  secondary_platform text
  platform_distribution jsonb
  question_allocation jsonb
  total_questions_planned int
  market_intelligence text
  competitor_landscape text
  customer_behavior text
  platform_specific_insights jsonb
  sources_analyzed text[]
  perplexity_queries_count int
  tokens_used int
  cost_usd numeric
  created_at timestamptz
  ```

- [ ] `gv_smart_questions`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  research_id uuid REFERENCES gv_platform_research(id)
  question_text text NOT NULL
  question_category text
  platform text
  importance_score numeric
  frequency_score numeric
  urgency_score numeric
  impact_score numeric
  priority_rank int
  user_intent text
  search_volume text
  competitor_mentions int
  keywords text[]
  entities jsonb
  sentiment text
  suggested_answer_length text
  requires_visual boolean
  requires_data boolean
  generation_confidence numeric
  evidence_sources jsonb
  created_at timestamptz
  ```

- [ ] `gv_chat_activation`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  platform_configs jsonb
  qa_bank jsonb
  total_questions int
  user_profiles jsonb
  nlp_patterns jsonb
  brand_persona jsonb
  activation_status text
  openai_tokens_used int
  activation_cost_usd numeric
  created_at timestamptz
  ```

#### **2. Onboarding Tables**
- [ ] `customers`
  ```sql
  id uuid PRIMARY KEY
  email text UNIQUE NOT NULL
  user_id uuid REFERENCES auth.users(id)
  created_at timestamptz
  updated_at timestamptz
  ```

- [ ] `user_brands`
  ```sql
  user_id uuid REFERENCES customers(user_id)
  brand_id uuid REFERENCES brands(id)
  role text DEFAULT 'owner'
  created_at timestamptz
  PRIMARY KEY (user_id, brand_id)
  ```

- [ ] `gv_onboarding_progress`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  pipeline_status text
  pipeline_current_step int
  pipeline_progress_pct int
  pipeline_message text
  pipeline_started_at timestamptz
  created_at timestamptz
  updated_at timestamptz
  ```

- [ ] `gv_brand_dna`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  dna_data jsonb
  created_at timestamptz
  ```

#### **3. Phase 3 Ingestion Tables**
- [ ] `gv_raw_artifacts`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  run_id uuid
  source text
  platform text
  source_category text
  signal_layer int
  impact_level text
  change_rate text
  raw_payload jsonb
  payload_hash text UNIQUE
  collected_at timestamptz
  cycle_window text
  ingestion_version text
  dqs_score numeric
  dqs_authenticity numeric
  dqs_consistency numeric
  dqs_corroboration numeric
  is_eligible_perplexity boolean
  is_evidence_grade boolean
  created_at timestamptz
  ```

- [ ] `gv_ingestion_config`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  source text NOT NULL
  is_enabled boolean DEFAULT true
  frequency text
  max_items_per_run int
  rate_limit_per_hour int
  credential_key text
  last_success_at timestamptz
  last_failure_at timestamptz
  consecutive_failures int DEFAULT 0
  ```

- [ ] `gv_ingestion_logs`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  run_id uuid
  source text
  status text
  items_ingested int
  items_skipped int
  items_failed int
  retry_count int
  error_code text
  error_message text
  started_at timestamptz
  finished_at timestamptz
  duration_ms int
  api_calls_made int
  estimated_cost numeric
  ```

#### **4. Job Orchestrator Tables**
- [ ] `gv_runs`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  run_mode text
  cycle_window text
  status text
  completed_jobs int
  failed_jobs int
  error text
  created_at timestamptz
  updated_at timestamptz
  ```

- [ ] `gv_jobs`
  ```sql
  id uuid PRIMARY KEY
  run_id uuid REFERENCES gv_runs(id)
  job_type text NOT NULL
  status text
  payload jsonb
  result jsonb
  error text
  started_at timestamptz
  finished_at timestamptz
  duration_ms int
  created_at timestamptz
  ```

#### **5. Radar System Tables**
- [ ] `gv_creator_registry`
  ```sql
  platform text NOT NULL
  username text NOT NULL
  user_id text
  follower_tier text
  snapshot_frequency text
  current_followers int
  current_posts int
  last_snapshot_at timestamptz
  next_snapshot_due timestamptz
  is_active boolean DEFAULT true
  discovered_at timestamptz
  discovered_via text
  tier_assigned_at timestamptz
  last_collection_success_at timestamptz
  consecutive_failures int DEFAULT 0
  PRIMARY KEY (platform, username)
  ```

- [ ] `gv_creator_snapshots`
  ```sql
  id uuid PRIMARY KEY
  platform text NOT NULL
  username text NOT NULL
  user_id text
  snapshot_timestamp timestamptz NOT NULL
  snapshot_frequency text
  display_name text
  bio text
  profile_picture_url text
  is_verified boolean
  follower_count int
  following_count int
  total_posts int
  total_likes int
  collected_via text
  apify_job_id text
  apify_actor_id text
  raw_profile_data jsonb
  created_at timestamptz
  ```

- [ ] `gv_creator_discovery`
  ```sql
  platform text NOT NULL
  username text NOT NULL
  category text
  estimated_followers int
  tier text
  quality_score numeric
  discovery_reason text
  discovered_via text
  discovered_at timestamptz DEFAULT now()
  PRIMARY KEY (platform, username)
  ```

- [ ] `gv_search_visibility`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  config_id uuid
  search_type text
  query text
  location text
  language text
  total_results int
  brand_mentions_count int
  top_position int
  avg_position numeric
  visibility_score numeric
  search_results jsonb
  scraped_at timestamptz
  created_at timestamptz
  ```

#### **6. Phase 6.1 Tables**
- [ ] `gv_brand_universe`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  brand_name text NOT NULL
  category text
  tier text
  status text
  market_position text
  priority_score numeric
  created_at timestamptz
  updated_at timestamptz
  ```

- [ ] `gv_brand_accounts`
  ```sql
  brand_id uuid REFERENCES brands(id)
  platform text NOT NULL
  account_handle text
  is_competitor boolean DEFAULT false
  PRIMARY KEY (brand_id, platform)
  ```

- [ ] `gv_creator_leaderboards`
  ```sql
  id uuid PRIMARY KEY
  snapshot_date date NOT NULL
  platform text NOT NULL
  category text
  username text
  rank int
  score numeric
  created_at timestamptz
  ```

- [ ] `gv_mindshare`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  snapshot_date date
  platform text
  mindshare_score numeric
  mentions_count int
  engagement_total int
  created_at timestamptz
  ```

#### **7. Authority & Publishing Tables**
- [ ] `gv_authority_assets`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  run_id uuid
  insight_id uuid
  task_id uuid
  asset_type text
  title text
  slug text UNIQUE
  summary text
  content_body text
  status text
  visibility text
  published_at timestamptz
  evidence_refs jsonb
  confidence numeric
  created_at timestamptz
  updated_at timestamptz
  ```

- [ ] `gv_insights`
  ```sql
  id uuid PRIMARY KEY
  brand_id uuid REFERENCES brands(id)
  title text
  pillar text
  severity text
  confidence numeric
  created_at timestamptz
  ```

#### **8. Additional Supporting Tables**
- [ ] `gv_tasks`
- [ ] `gv_pillar_scores`
- [ ] `gv_strategic_evidence`
- [ ] `gv_pulse_signals`
- [ ] `gv_foundation_validations`
- [ ] `gv_perplexity_payloads`
- [ ] `gv_confidence_scores`
- [ ] `gv_strategic_synthesis`
- [ ] `gv_playbook_actions`
- [ ] `gv_learning_notes`
- [ ] `gv_timelines`
- [ ] `gv_signal_layer_registry`
- [ ] `gv_review_queue`
- [ ] `phase35_execution_log`
- [ ] `gv_run_progress`
- [ ] `gv_brightdata_config`
- [ ] `gv_trending_content`
- [ ] `gv_trendshare`

**Command to check existing tables**:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'gv_%'
ORDER BY table_name;
```

---

## 🔧 STEP 3: RPC Functions

### **Required Database Functions**

#### **1. onboard_brand**
```sql
CREATE OR REPLACE FUNCTION onboard_brand(
  p_email text,
  p_brand_name text,
  p_category text,
  p_business_type text,
  p_country text,
  p_google_maps_url text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_web_url text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_instagram_url text DEFAULT NULL,
  p_tiktok_url text DEFAULT NULL,
  p_youtube_url text DEFAULT NULL,
  p_step int DEFAULT 1,
  p_brand_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation needed
$$;
```

#### **2. complete_onboarding**
```sql
CREATE OR REPLACE FUNCTION complete_onboarding(
  p_brand_id uuid,
  p_first_geo_score numeric,
  p_initial_insights_count int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation needed
$$;
```

#### **3. get_onboarding_status**
```sql
CREATE OR REPLACE FUNCTION get_onboarding_status(
  p_brand_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation needed
$$;
```

#### **4. calculate_creator_rankings**
```sql
CREATE OR REPLACE FUNCTION calculate_creator_rankings(
  snapshot_date date
)
RETURNS void
LANGUAGE plpgsql
AS $$
-- Implementation needed
$$;
```

**Command to check existing functions**:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

---

## 📦 STEP 4: Deploy Edge Functions

### **Priority 1: Core Pipeline** (Deploy FIRST)

```bash
# Aman-7-Pipeline (Core 4-step pipeline)
supabase functions deploy step1-chronicle-analyzer
supabase functions deploy step2-platform-research
supabase functions deploy step3-question-generator
supabase functions deploy step4-chat-activation
```

### **Priority 2: Onboarding** (Deploy SECOND)

```bash
# Aman-10-Onboarding-System
supabase functions deploy onboard-brand
supabase functions deploy onboarding-guard
supabase functions deploy onboarding-orchestrator
supabase functions deploy onboarding-wizard-handler
```

### **Priority 3: Phase 3 Ingestion** (Deploy THIRD)

```bash
# Aman-9-Phase3-Pipeline
supabase functions deploy ph3-ingestion-orchestrator
```

### **Priority 4: Job Orchestrator** (Deploy FOURTH)

```bash
# Aman-10-Onboarding-System
supabase functions deploy orchestrator-v2
```

### **Priority 5: Radar System** (Deploy FIFTH)

```bash
# Aman-7-Pipeline (Radar)
supabase functions deploy radar-apify-ingestion
supabase functions deploy radar-creator-discovery-batch
supabase functions deploy radar-discovery-orchestrator
supabase functions deploy serpapi-search
```

### **Priority 6: Content & Publishing** (Deploy SIXTH)

```bash
# Aman-7-Pipeline (Publishing)
supabase functions deploy publish-authority-asset
supabase functions deploy openai-draft
supabase functions deploy optimize-for-platform

# Aman-10-Onboarding-System (Notion)
supabase functions deploy notion-final-publisher
```

### **Priority 7: Phase 6.1** (Deploy SEVENTH)

```bash
# Aman-8-Pipeline-Clean
supabase functions deploy phase61-brand-discovery
supabase functions deploy phase61-task611-executor
supabase functions deploy phase61-task612-orchestrator
supabase functions deploy phase61-task613-orchestrator
supabase functions deploy phase61-task614-orchestrator
supabase functions deploy pipeline-validator
supabase functions deploy pipeline-review-engine
```

### **Priority 8: Utilities** (Deploy LAST)

```bash
# Aman-7-Pipeline (Utils)
supabase functions deploy profile-api
supabase functions deploy realtime-progress
supabase functions deploy seed-data-generator
```

**Command to verify deployments**:
```bash
supabase functions list
```

---

## ✅ STEP 5: Verification Tests

### **Test 1: Environment Variables**
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/step1-chronicle-analyzer' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"action":"health"}'
```

Expected: `{"status":"ok"}`

### **Test 2: Database Connection**
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/onboard-brand' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "brand_name": "Test Brand",
    "category": "Technology",
    "business_type": "Local Brand",
    "country": "ID",
    "step": 1
  }'
```

Expected: `{"success":true, "brand_id":"..."}`

### **Test 3: Phase 3 Ingestion**
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/ph3-ingestion-orchestrator' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "mode": "health"
  }'
```

Expected: `{"status":"ok", "sources_available":[...]}`

### **Test 4: Onboarding Flow**
```bash
# Step 1: Create brand (use onboard-brand from Test 2)
# Step 2: Trigger pipeline
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/onboarding-orchestrator' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "brand_id": "BRAND_ID_FROM_STEP_1",
    "action": "trigger_pipeline"
  }'
```

Expected: `{"success":true, "metrics":{...}}`

### **Test 5: Job Orchestrator**
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/orchestrator-v2' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "brand_id": "BRAND_ID",
    "run_mode": "full",
    "cycle_window": "7d"
  }'
```

Expected: `{"success":true, "run_id":"...", "jobs_dispatched":9}`

---

## 🔍 STEP 6: Database Schema Verification Script

```sql
-- Run this in Supabase SQL Editor to verify ALL required tables exist

DO $$
DECLARE
  missing_tables text[];
  required_tables text[] := ARRAY[
    'brands',
    'customers',
    'user_brands',
    'gv_brand_chronicle',
    'gv_platform_research',
    'gv_smart_questions',
    'gv_chat_activation',
    'gv_onboarding_progress',
    'gv_brand_dna',
    'gv_raw_artifacts',
    'gv_ingestion_config',
    'gv_ingestion_logs',
    'gv_runs',
    'gv_jobs',
    'gv_creator_registry',
    'gv_creator_snapshots',
    'gv_creator_discovery',
    'gv_search_visibility',
    'gv_brand_universe',
    'gv_brand_accounts',
    'gv_creator_leaderboards',
    'gv_mindshare',
    'gv_authority_assets',
    'gv_insights'
  ];
  tbl text;
  exists boolean;
BEGIN
  FOREACH tbl IN ARRAY required_tables
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) INTO exists;

    IF NOT exists THEN
      missing_tables := array_append(missing_tables, tbl);
    END IF;
  END LOOP;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE 'MISSING TABLES: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'ALL REQUIRED TABLES EXIST ✅';
  END IF;
END $$;
```

---

## 🎯 DEPLOYMENT STATUS TRACKING

### **Pre-Deployment**
- [ ] Environment variables configured (8 APIs)
- [ ] Database tables created (24 critical tables)
- [ ] RPC functions created (4 functions)
- [ ] Supabase CLI installed and authenticated

### **Deployment Phase 1** (Core - 4 functions)
- [ ] step1-chronicle-analyzer
- [ ] step2-platform-research
- [ ] step3-question-generator
- [ ] step4-chat-activation

### **Deployment Phase 2** (Onboarding - 4 functions)
- [ ] onboard-brand
- [ ] onboarding-guard
- [ ] onboarding-orchestrator
- [ ] onboarding-wizard-handler

### **Deployment Phase 3** (Infrastructure - 2 functions)
- [ ] ph3-ingestion-orchestrator
- [ ] orchestrator-v2

### **Deployment Phase 4** (Radar - 4 functions)
- [ ] radar-apify-ingestion
- [ ] radar-creator-discovery-batch
- [ ] radar-discovery-orchestrator
- [ ] serpapi-search

### **Deployment Phase 5** (Publishing - 4 functions)
- [ ] publish-authority-asset
- [ ] openai-draft
- [ ] optimize-for-platform
- [ ] notion-final-publisher

### **Deployment Phase 6** (Phase 6.1 - 7 functions)
- [ ] phase61-brand-discovery
- [ ] phase61-task611-executor
- [ ] phase61-task612-orchestrator
- [ ] phase61-task613-orchestrator
- [ ] phase61-task614-orchestrator
- [ ] pipeline-validator
- [ ] pipeline-review-engine

### **Deployment Phase 7** (Utilities - 3 functions)
- [ ] profile-api
- [ ] realtime-progress
- [ ] seed-data-generator

### **Post-Deployment**
- [ ] Run Test 1: Environment Variables
- [ ] Run Test 2: Database Connection
- [ ] Run Test 3: Phase 3 Ingestion
- [ ] Run Test 4: Onboarding Flow
- [ ] Run Test 5: Job Orchestrator
- [ ] Monitor error logs (24 hours)
- [ ] Check API costs
- [ ] Verify data quality

---

## 🚨 CRITICAL DEPENDENCIES

### **Must Deploy Together**:
1. **4-Step Pipeline**: step1 → step2 → step3 → step4 (sequential)
2. **Onboarding Flow**: onboard-brand → onboarding-wizard-handler → onboarding-orchestrator
3. **Phase 3**: ph3-ingestion-orchestrator (called by onboarding-orchestrator)
4. **Job Chain**: orchestrator-v2 + all job functions

### **Can Deploy Independently**:
- Radar system (apify, creator-discovery, serpapi)
- Publishing (publish-authority-asset, notion-final-publisher)
- Phase 6.1 (brand-discovery, task orchestrators)
- Utilities (profile-api, realtime-progress, seed-data)

---

## 📝 NOTES

1. **Database First**: Create ALL tables BEFORE deploying functions
2. **RPCs Second**: Create ALL RPC functions BEFORE testing onboarding
3. **Sequential Testing**: Test in deployment order (Priority 1 → 2 → 3...)
4. **Error Monitoring**: Watch Supabase logs during first 24 hours
5. **Cost Tracking**: Run `check-api-balances.sh` after testing

---

**🎯 READY TO DEPLOY! Follow this checklist step by step.**
