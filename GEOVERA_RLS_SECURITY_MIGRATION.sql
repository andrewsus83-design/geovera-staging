-- ============================================================================
-- GEOVERA SAAS PLATFORM - PRODUCTION SECURITY MIGRATION
-- ============================================================================
-- Project: staging-geovera (vozjwptzutolvkvfpknk)
-- Date: 2026-02-12
-- Purpose: Enable RLS and create policies for all tables
-- Classification: CRITICAL - PRODUCTION BLOCKER
--
-- IMPORTANT: Execute this in a STAGING environment first!
-- Test thoroughly before applying to production.
--
-- Execution Time: ~5-10 minutes
-- Downtime Required: Yes (maintenance window recommended)
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: ENABLE RLS ON ALL UNPROTECTED TABLES
-- ============================================================================
-- These tables currently have NO RLS protection and are fully exposed

-- Payment & Financial (CRITICAL)
ALTER TABLE public.gv_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_subscriptions ENABLE ROW LEVEL SECURITY;

-- Core Platform
ALTER TABLE public.gv_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_apify_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_crawl_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_upload_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_chat_widget_config ENABLE ROW LEVEL SECURITY;

-- Research & Discovery
ALTER TABLE public.gv_perplexity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_deep_research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_research_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_discovered_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_creator_discovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_gemini_creator_crawls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_creator_market_intel ENABLE ROW LEVEL SECURITY;

-- Analytics & Intelligence
ALTER TABLE public.gv_trending_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_tiktok_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_market_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_customer_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_content_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_platform_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_trend_history ENABLE ROW LEVEL SECURITY;

-- Analysis & Processing
ALTER TABLE public.gv_nlp_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_behavior_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_sentiment_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_authority_network ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_authority_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_content_originality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_reverse_engineering ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_content_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_social_content_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_social_creators_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_truth_validation ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 2: HELPER FUNCTION FOR BRAND ACCESS CONTROL
-- ============================================================================
-- This function checks if the current user has access to a specific brand

CREATE OR REPLACE FUNCTION public.user_has_brand_access(check_brand_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_brands
    WHERE user_id = auth.uid()
      AND brand_id = check_brand_id
  );
$$;

COMMENT ON FUNCTION public.user_has_brand_access IS
  'Check if current authenticated user has access to a specific brand via user_brands junction table';

-- ============================================================================
-- SECTION 3: CORE TABLES RLS POLICIES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: User profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- user_brands: Junction table (users <-> brands)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own brand associations" ON public.user_brands;
DROP POLICY IF EXISTS "Users can insert brand associations as owner" ON public.user_brands;
DROP POLICY IF EXISTS "Brand owners can manage brand associations" ON public.user_brands;

CREATE POLICY "Users can view own brand associations"
  ON public.user_brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert brand associations as owner"
  ON public.user_brands FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'owner');

CREATE POLICY "Brand owners can manage brand associations"
  ON public.user_brands FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ---------------------------------------------------------------------------
-- brands: Legacy brand table (check if still used, prefer gv_brands)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view accessible brands" ON public.brands;
DROP POLICY IF EXISTS "Users can update accessible brands" ON public.brands;
DROP POLICY IF EXISTS "Users can insert own brands" ON public.brands;

CREATE POLICY "Users can view accessible brands"
  ON public.brands FOR SELECT
  USING (
    id IN (
      SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update accessible brands"
  ON public.brands FOR UPDATE
  USING (
    id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can insert own brands"
  ON public.brands FOR INSERT
  WITH CHECK (true); -- Will be linked via user_brands trigger

-- ---------------------------------------------------------------------------
-- gv_brands: Main brand table
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view accessible gv_brands" ON public.gv_brands;
DROP POLICY IF EXISTS "Users can update accessible gv_brands" ON public.gv_brands;
DROP POLICY IF EXISTS "Users can insert gv_brands" ON public.gv_brands;
DROP POLICY IF EXISTS "Users can delete own gv_brands" ON public.gv_brands;

CREATE POLICY "Users can view accessible gv_brands"
  ON public.gv_brands FOR SELECT
  USING (
    id IN (
      SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update accessible gv_brands"
  ON public.gv_brands FOR UPDATE
  USING (
    id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can insert gv_brands"
  ON public.gv_brands FOR INSERT
  WITH CHECK (true); -- Ownership will be set via trigger

CREATE POLICY "Users can delete own gv_brands"
  ON public.gv_brands FOR DELETE
  USING (
    id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================================
-- SECTION 4: BRAND-RELATED TABLES - STANDARD PATTERN
-- ============================================================================
-- All tables with brand_id column follow this pattern

-- Macro to create standard brand-based RLS policies
DO $$
DECLARE
  tbl TEXT;
  brand_tables TEXT[] := ARRAY[
    'gv_brand_dna',
    'gv_brand_universe',
    'gv_brand_chronicle',
    'gv_brand_positioning_analysis',
    'gv_brand_subscriptions',
    'gv_brand_accounts',
    'gv_competitive_intel',
    'gv_competitors',
    'gv_competitive_rankings',
    'gv_competitor_backlinks',
    'gv_competitor_content_analysis',
    'gv_competitor_keyword_rankings',
    'gv_competitor_seo_metrics',
    'gv_content_baseline',
    'gv_content_learnings',
    'gv_content_audits',
    'gv_content_assets',
    'gv_content_feedback',
    'gv_content_jobs',
    'gv_content_recommendations',
    'gv_custom_prompts',
    'gv_article_templates',
    'gv_image_generations',
    'gv_video_generations',
    'gv_master_prompts',
    'gv_platform_optimization_rules',
    'gv_quota_usage',
    'gv_usage_tracking',
    'gv_tasks',
    'gv_task_comments',
    'gv_task_templates',
    'gv_notifications',
    'gv_notification_templates',
    'gv_onboarding_progress',
    'gv_reports',
    'gv_insights',
    'gv_jobs',
    'gv_pipeline_jobs',
    'gv_runs',
    'gv_run_progress',
    'gv_learning_notes',
    'gv_pending_briefs',
    'gv_radar_alerts',
    'gv_radar_heatmap',
    'gv_marketshare',
    'gv_mindshare',
    'gv_trendshare',
    'gv_market_opportunities',
    'gv_authority_scores',
    'gv_authority_assets',
    'gv_authority_influencers',
    'gv_citation_network',
    'gv_backlinks',
    'gv_backlink_alerts',
    'gv_backlink_opportunities',
    'gv_domain_authority',
    'gv_keyword_rankings',
    'gv_keyword_ranking_history',
    'gv_tracked_keywords',
    'gv_ranking_alerts',
    'gv_geo_rankings',
    'gv_llm_responses',
    'gv_llm_test_questions',
    'gv_llm_seo_integrated_intelligence',
    'gv_search_visibility',
    'gv_ai_seo_intelligence',
    'gv_smart_questions',
    'gv_smart_answers',
    'gv_question_sets',
    'gv_question_discovery',
    'gv_multi_ai_answers',
    'gv_chat_config',
    'gv_chat_activation',
    'gv_chat_logs',
    'gv_chat_sessions',
    'gv_chat_conversations',
    'gv_social_posts',
    'gv_social_comments',
    'gv_social_trends',
    'gv_social_content',
    'gv_social_creators',
    'gv_sentiment_analysis',
    'gv_viral_content',
    'gv_trending_content',
    'gv_content_alert_matches',
    'gv_content_alerts',
    'gv_content_ideas',
    'gv_influencers',
    'gv_dark_funnel_touchpoints',
    'gv_conversions',
    'gv_attribution_journeys',
    'gv_attribution_models_config',
    'gv_channel_performance',
    'gv_platform_correlations',
    'gv_timelines',
    'gv_entity_links',
    'gv_strategic_synthesis',
    'gv_strategic_evidence',
    'gv_synthesis_packages',
    'gv_playbook_actions',
    'gv_pulse_signals',
    'gv_confidence_scores',
    'gv_pillar_scores',
    'gv_classification_logs',
    'gv_foundation_validations',
    'gv_signal_layer_registry',
    'gv_normalization_logs',
    'gv_normalized_artifacts',
    'gv_raw_artifacts',
    'gv_ingestion_config',
    'gv_ingestion_logs',
    'gv_review_queue',
    'gv_link_building_campaigns',
    'gv_brightdata_config',
    'gv_editing_tips_library',
    'gv_design_tokens',
    'gv_human_behavior_analysis',
    'gv_engagement_tracking',
    'gv_comment_embeddings',
    'gv_content_semantic_analysis',
    'gv_content_performance_history',
    'gv_perplexity_payloads',
    'gv_perplexity_research_sessions',
    'gv_claude_reverse_engineering',
    'gv_gemini_crawl_sessions'
  ];
BEGIN
  FOREACH tbl IN ARRAY brand_tables
  LOOP
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS "Brand users can view %I" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Brand editors can modify %I" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Brand owners can delete %I" ON public.%I', tbl, tbl);

    -- Create SELECT policy (all brand members can view)
    EXECUTE format('
      CREATE POLICY "Brand users can view %I"
        ON public.%I FOR SELECT
        USING (
          brand_id IN (
            SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
          )
        )', tbl, tbl);

    -- Create INSERT/UPDATE policy (editors and above)
    EXECUTE format('
      CREATE POLICY "Brand editors can modify %I"
        ON public.%I FOR ALL
        USING (
          brand_id IN (
            SELECT brand_id FROM user_brands
            WHERE user_id = auth.uid() AND role IN (''owner'', ''admin'', ''editor'')
          )
        )
        WITH CHECK (
          brand_id IN (
            SELECT brand_id FROM user_brands
            WHERE user_id = auth.uid() AND role IN (''owner'', ''admin'', ''editor'')
          )
        )', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 5: PAYMENT & SUBSCRIPTION TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- gv_subscriptions: Brand subscriptions
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view subscriptions for their brands" ON public.gv_subscriptions;
DROP POLICY IF EXISTS "Brand owners can manage subscriptions" ON public.gv_subscriptions;

CREATE POLICY "Users can view subscriptions for their brands"
  ON public.gv_subscriptions FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brand owners can manage subscriptions"
  ON public.gv_subscriptions FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ---------------------------------------------------------------------------
-- gv_invoices: Payment invoices (sensitive financial data)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view invoices for their brands" ON public.gv_invoices;

CREATE POLICY "Users can view invoices for their brands"
  ON public.gv_invoices FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
    )
  );

-- Service role can insert invoices (payment webhooks)
CREATE POLICY "Service role can manage invoices"
  ON public.gv_invoices FOR ALL
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- customers: Customer accounts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own customer data" ON public.customers;

CREATE POLICY "Users can view own customer data"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own customer data"
  ON public.customers FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- api_keys: API authentication keys
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage api_keys for their brands" ON public.api_keys;

CREATE POLICY "Users can manage api_keys for their brands"
  ON public.api_keys FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- SECTION 6: GLOBAL/SHARED DATA TABLES
-- ============================================================================
-- These tables contain data shared across all users or system-level data

-- ---------------------------------------------------------------------------
-- gv_subscription_tiers: Global tier definitions (read-only for users)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view subscription tiers" ON public.gv_subscription_tiers;

CREATE POLICY "Anyone can view subscription tiers"
  ON public.gv_subscription_tiers FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- gv_creator_registry: Global creator registry (24K creators)
-- ---------------------------------------------------------------------------
-- Replace overly permissive policy with read-only for authenticated users
DROP POLICY IF EXISTS "Allow all operations" ON public.gv_creator_registry;
DROP POLICY IF EXISTS "Authenticated users can view creator registry" ON public.gv_creator_registry;

CREATE POLICY "Authenticated users can view creator registry"
  ON public.gv_creator_registry FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can manage
CREATE POLICY "Service role can manage creator registry"
  ON public.gv_creator_registry FOR ALL
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- gv_creator_snapshots: Creator snapshots
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all operations" ON public.gv_creator_snapshots;
DROP POLICY IF EXISTS "Authenticated users can view creator snapshots" ON public.gv_creator_snapshots;

CREATE POLICY "Authenticated users can view creator snapshots"
  ON public.gv_creator_snapshots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage creator snapshots"
  ON public.gv_creator_snapshots FOR ALL
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- gv_apify_collection_schedule: Collection schedule
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all operations" ON public.gv_apify_collection_schedule;
DROP POLICY IF EXISTS "Service role manages collection schedule" ON public.gv_apify_collection_schedule;

CREATE POLICY "Service role manages collection schedule"
  ON public.gv_apify_collection_schedule FOR ALL
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- gv_creator_leaderboards: Public leaderboards
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view leaderboards" ON public.gv_creator_leaderboards;

CREATE POLICY "Public can view leaderboards"
  ON public.gv_creator_leaderboards FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage leaderboards"
  ON public.gv_creator_leaderboards FOR ALL
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- gv_trend_related, gv_trend_snapshots, gv_trend_terms: Trend data
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view trends" ON public.gv_trend_related;
DROP POLICY IF EXISTS "Authenticated users can view trend snapshots" ON public.gv_trend_snapshots;
DROP POLICY IF EXISTS "Authenticated users can view trend terms" ON public.gv_trend_terms;

CREATE POLICY "Authenticated users can view trends"
  ON public.gv_trend_related FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view trend snapshots"
  ON public.gv_trend_snapshots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view trend terms"
  ON public.gv_trend_terms FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- SECTION 7: SYSTEM/BACKGROUND JOB TABLES
-- ============================================================================
-- These tables are managed by service role only

DO $$
DECLARE
  tbl TEXT;
  system_tables TEXT[] := ARRAY[
    'gv_cron_jobs',
    'gv_upload_queue',
    'gv_crawl_sessions',
    'gv_apify_usage',
    'gv_perplexity_requests',
    'gv_deep_research_sessions',
    'gv_research_artifacts',
    'gv_discovered_creators',
    'gv_creator_discovery',
    'gv_gemini_creator_crawls',
    'gv_creator_market_intel',
    'gv_trending_hashtags',
    'gv_tiktok_posts',
    'gv_market_benchmarks',
    'gv_customer_timeline',
    'gv_content_opportunities',
    'gv_platform_research',
    'gv_trend_history',
    'gv_nlp_analysis',
    'gv_behavior_analysis',
    'gv_sentiment_trends',
    'gv_authority_network',
    'gv_authority_citations',
    'gv_content_originality',
    'gv_reverse_engineering',
    'gv_content_patterns',
    'gv_social_content_analysis',
    'gv_social_creators_cache',
    'gv_truth_validation',
    'gv_chat_widget_config'
  ];
BEGIN
  FOREACH tbl IN ARRAY system_tables
  LOOP
    -- Service role has full access
    EXECUTE format('DROP POLICY IF EXISTS "Service role manages %I" ON public.%I', tbl, tbl);
    EXECUTE format('
      CREATE POLICY "Service role manages %I"
        ON public.%I FOR ALL
        USING (auth.role() = ''service_role'')', tbl, tbl);

    -- Authenticated users can read (for system tables that are informational)
    -- Skip for truly internal tables
    IF tbl NOT IN ('gv_upload_queue', 'gv_cron_jobs') THEN
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can view %I" ON public.%I', tbl, tbl);
      EXECUTE format('
        CREATE POLICY "Authenticated users can view %I"
          ON public.%I FOR SELECT
          USING (auth.role() = ''authenticated'')', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 8: FIX OVERLY PERMISSIVE POLICIES
-- ============================================================================

-- gv_engagement_tracking: Should be brand-scoped or anonymous
DROP POLICY IF EXISTS "Public engagement tracking" ON public.gv_engagement_tracking;

CREATE POLICY "Users can track engagement for their brands"
  ON public.gv_engagement_tracking FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
    ) OR brand_id IS NULL -- Allow anonymous tracking if brand_id is null
  );

CREATE POLICY "Users can view engagement for their brands"
  ON public.gv_engagement_tracking FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
    )
  );

-- gv_onboarding_progress: Should be user-scoped via brand
DROP POLICY IF EXISTS "System can insert onboarding records" ON public.gv_onboarding_progress;

-- Policy already created in brand tables section above

-- ============================================================================
-- SECTION 9: FIX SECURITY DEFINER VIEWS
-- ============================================================================
-- Convert SECURITY DEFINER views to SECURITY INVOKER
-- This ensures RLS policies are respected

-- Note: This requires recreating the views. Since we don't have the view definitions,
-- we'll document the issue here. MANUAL ACTION REQUIRED.

-- MANUAL ACTION REQUIRED:
-- The following views need to be recreated with SECURITY INVOKER:
-- 1. gv_top_influencers_summary
-- 2. gv_unified_radar
-- 3. gv_attribution_by_channel
-- 4. gv_cross_insights
-- 5. gv_recent_journeys
-- 6. gv_llm_seo_rankings
-- 7. gv_conversion_funnel
-- 8. gv_social_creators_stale
-- 9. gv_brand_chat_context
-- 10. gv_unattributed_conversions
-- 11. gv_current_authority
-- 12. gv_citation_flow
-- 13. gv_chat_analytics
-- 14. gv_authority_leaderboard
-- 15. gv_brand_chat_training
-- 16. gv_brand_chat_training

-- Example pattern for recreating a view:
-- DROP VIEW IF EXISTS public.gv_unified_radar;
-- CREATE VIEW public.gv_unified_radar
-- WITH (security_invoker = true)
-- AS
-- SELECT ... -- original view definition
-- WHERE brand_id IN (SELECT brand_id FROM user_brands WHERE user_id = auth.uid());

COMMENT ON SCHEMA public IS
  'SECURITY DEFINER VIEWS: 16 views need manual recreation with SECURITY INVOKER. See migration script comments.';

-- ============================================================================
-- SECTION 10: FIX FUNCTION SEARCH_PATH VULNERABILITIES
-- ============================================================================
-- 70+ functions need search_path set. This is a sample - apply to all functions.

-- Example pattern (apply to all 70+ functions):
/*
CREATE OR REPLACE FUNCTION public.perplexity_submit_async(...)
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ADD THIS LINE
AS $$
BEGIN
  -- function body
END;
$$;
*/

-- MANUAL ACTION REQUIRED:
-- Add "SET search_path = public, pg_temp" to these functions:
-- (See security audit report for full list of 70+ functions)

COMMENT ON SCHEMA public IS
  'FUNCTION SECURITY: 70+ functions need SET search_path = public, pg_temp. See migration script.';

-- ============================================================================
-- SECTION 11: AUDIT LOGGING INFRASTRUCTURE
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.gv_brands(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role and admins can view audit logs
CREATE POLICY "Service role can manage audit logs"
  ON public.audit_logs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Brand owners can view audit logs for their brands"
  ON public.audit_logs FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_brand_id ON public.audit_logs(brand_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

COMMENT ON TABLE public.audit_logs IS
  'Audit trail for all sensitive operations. Retention: 2 years.';

-- ============================================================================
-- SECTION 12: SECURITY EVENT LOGGING
-- ============================================================================

-- Create security events table (failed logins, suspicious activity)
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'failed_login', 'account_locked', 'suspicious_activity', etc.
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only service role can manage security events
CREATE POLICY "Service role can manage security events"
  ON public.security_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);

COMMENT ON TABLE public.security_events IS
  'Security incident tracking. Critical for forensics and compliance.';

-- ============================================================================
-- SECTION 13: RATE LIMITING INFRASTRUCTURE
-- ============================================================================

-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- user_id, ip_address, api_key, etc.
  action TEXT NOT NULL, -- 'login', 'signup', 'api_call', 'password_reset'
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier, action, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier);
CREATE INDEX idx_rate_limits_window_end ON public.rate_limits(window_end);

COMMENT ON TABLE public.rate_limits IS
  'Rate limiting tracking. Auto-cleanup records older than 24 hours.';

-- ============================================================================
-- SECTION 14: GRANT APPROPRIATE PERMISSIONS
-- ============================================================================

-- Grant authenticated users access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO authenticated;

-- Grant service role full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant sequence usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- SECTION 15: VALIDATION QUERIES
-- ============================================================================

-- Create a validation function to check RLS coverage
CREATE OR REPLACE FUNCTION public.validate_rls_coverage()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT,
  status TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    t.tablename::TEXT,
    t.rowsecurity,
    COUNT(p.policyname),
    CASE
      WHEN NOT t.rowsecurity THEN 'CRITICAL: RLS Disabled'
      WHEN t.rowsecurity AND COUNT(p.policyname) = 0 THEN 'ERROR: RLS enabled but no policies'
      WHEN t.rowsecurity AND COUNT(p.policyname) > 0 THEN 'OK'
      ELSE 'UNKNOWN'
    END
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
  WHERE t.schemaname = 'public'
    AND t.tablename LIKE 'gv_%' OR t.tablename IN ('profiles', 'brands', 'user_brands', 'customers', 'api_keys')
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY
    CASE
      WHEN NOT t.rowsecurity THEN 1
      WHEN t.rowsecurity AND COUNT(p.policyname) = 0 THEN 2
      ELSE 3
    END,
    t.tablename;
$$;

-- ============================================================================
-- COMMIT AND VALIDATION
-- ============================================================================

COMMIT;

-- Run validation
SELECT
  'VALIDATION: RLS Coverage Check' as report_section,
  table_name,
  rls_enabled,
  policy_count,
  status
FROM public.validate_rls_coverage()
WHERE status != 'OK'
ORDER BY status, table_name;

-- ============================================================================
-- POST-MIGRATION CHECKLIST
-- ============================================================================
/*

✅ 1. Verify RLS is enabled on all tables:
   SELECT * FROM public.validate_rls_coverage();

✅ 2. Test multi-tenant isolation:
   - Create test user A with brand 1
   - Create test user B with brand 2
   - Verify user A cannot access brand 2 data
   - Verify user B cannot access brand 1 data

✅ 3. Test role-based access:
   - Verify viewers can SELECT only
   - Verify editors can INSERT/UPDATE
   - Verify owners can DELETE

✅ 4. Test service role access:
   - Verify background jobs can execute
   - Verify webhook handlers can insert data

✅ 5. Enable leaked password protection:
   - Navigate to Supabase Dashboard → Authentication → Policies
   - Enable "Leaked Password Protection"

✅ 6. Configure rate limiting:
   - Implement Edge Function middleware for rate limiting
   - Configure limits: 5 failed logins per 15 minutes
   - Configure limits: 10 API calls per second per user

✅ 7. Fix SECURITY DEFINER views:
   - Manually recreate 16 views with SECURITY INVOKER
   - Test that views respect RLS policies

✅ 8. Fix function search_path:
   - Add SET search_path to 70+ functions
   - Test functions still work correctly

✅ 9. Set up monitoring:
   - Create dashboard for audit_logs
   - Create dashboard for security_events
   - Set up alerts for high severity events

✅ 10. Security testing:
    - Run penetration tests
    - Test SQL injection attempts
    - Test XSS attempts
    - Test CSRF protection
    - Test session management

DEPLOYMENT NOTES:
- This migration should be executed during a maintenance window
- Expected execution time: 5-10 minutes
- Backup database before execution
- Test in staging environment first
- Monitor error logs during deployment
- Have rollback plan ready

ROLLBACK PLAN:
To rollback this migration:
1. Disable RLS on all tables: ALTER TABLE ... DISABLE ROW LEVEL SECURITY;
2. Drop all created policies: DROP POLICY ... ON ...;
3. Drop audit tables: DROP TABLE audit_logs, security_events, rate_limits;
4. Restore from backup if needed

*/
