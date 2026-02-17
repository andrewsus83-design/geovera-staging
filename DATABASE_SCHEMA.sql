-- =====================================================
-- GEOVERA COMPLETE DATABASE SCHEMA
-- SEO + GEO + Multi-Channel Backlinks + Self-Learning
-- + Claude Feedback System + Real-Time GEO-SEO Sync
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Brands table (existing, reference)
CREATE TABLE IF NOT EXISTS gv_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  website_url TEXT,
  tier TEXT CHECK (tier IN ('basic', 'premium', 'partner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MULTI-CHANNEL BACKLINK DISCOVERY
-- =====================================================

-- Multi-channel backlink opportunities
CREATE TABLE gv_backlink_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'medium', 'substack', 'linkedin', 'reddit', 'github', etc.
  opportunity_type TEXT NOT NULL, -- 'guest_post', 'comment', 'discussion', 'article', etc.
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,

  -- Perplexity AI Ranking
  perplexity_score DECIMAL(5,2), -- 0-100 score from Perplexity
  perplexity_rank INTEGER, -- 1-20 ranking
  perplexity_reasoning TEXT, -- Why Perplexity ranked it this way

  -- Opportunity metrics
  domain_authority INTEGER,
  traffic_estimate INTEGER,
  relevance_score DECIMAL(5,2),
  difficulty_score DECIMAL(5,2), -- How hard to get the backlink

  -- Status tracking
  status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'in_progress', 'contacted', 'approved', 'published', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

  -- AI research
  research_data JSONB, -- Full Perplexity + Gemini research

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backlink_opportunities_brand ON gv_backlink_opportunities(brand_id);
CREATE INDEX idx_backlink_opportunities_platform ON gv_backlink_opportunities(platform);
CREATE INDEX idx_backlink_opportunities_perplexity_rank ON gv_backlink_opportunities(perplexity_rank);
CREATE INDEX idx_backlink_opportunities_status ON gv_backlink_opportunities(status);

-- =====================================================
-- GEO CITATION TRACKING
-- =====================================================

-- AI engine configuration
CREATE TABLE gv_geo_ai_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_name TEXT UNIQUE NOT NULL, -- 'chatgpt', 'claude', 'gemini', 'perplexity'
  is_active BOOLEAN DEFAULT true,
  api_endpoint TEXT,
  popularity_score DECIMAL(5,2) DEFAULT 25.00, -- Initially 25% each, adjusted by research
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default AI engines
INSERT INTO gv_geo_ai_engines (engine_name, api_endpoint) VALUES
  ('chatgpt', 'https://api.openai.com/v1/chat/completions'),
  ('claude', 'https://api.anthropic.com/v1/messages'),
  ('gemini', 'https://generativelanguage.googleapis.com/v1beta/models'),
  ('perplexity', 'https://api.perplexity.ai/chat/completions');

-- Tracked topics for GEO
CREATE TABLE gv_geo_tracked_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  category TEXT CHECK (category IN ('performing_well', 'needs_improvement', 'new_opportunity')),

  -- Performance metrics
  overall_frequency DECIMAL(5,2) DEFAULT 0, -- 0-100%
  last_frequency DECIMAL(5,2) DEFAULT 0,
  frequency_trend TEXT, -- 'improving', 'declining', 'stable'

  -- Priority for queue system
  queue_priority TEXT DEFAULT 'bronze' CHECK (queue_priority IN ('gold', 'silver', 'bronze')),

  -- Scheduling
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ,
  check_interval_days INTEGER DEFAULT 28, -- 7, 14, or 28

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geo_topics_brand ON gv_geo_tracked_topics(brand_id);
CREATE INDEX idx_geo_topics_category ON gv_geo_tracked_topics(category);
CREATE INDEX idx_geo_topics_next_check ON gv_geo_tracked_topics(next_check_at);

-- Citation checks (main table)
CREATE TABLE gv_geo_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES gv_geo_tracked_topics(id) ON DELETE CASCADE,
  ai_engine_id UUID REFERENCES gv_geo_ai_engines(id),

  -- Citation data
  prompt_used TEXT NOT NULL,
  response_text TEXT,
  is_cited BOOLEAN DEFAULT false,
  citation_context TEXT, -- Where in the response was the brand mentioned

  -- Ranking
  rank_position INTEGER, -- 1 = rank #1, null = not cited
  rank_one_competitor TEXT, -- Who is rank #1?
  total_brands_mentioned INTEGER,

  -- Delta caching
  content_hash TEXT, -- MD5 hash for delta detection
  is_delta_check BOOLEAN DEFAULT false,

  -- Metadata
  check_type TEXT DEFAULT 'scheduled' CHECK (check_type IN ('scheduled', 'manual', 'delta_recheck', 'new_topic')),
  check_month TEXT, -- '2025-01' for grouping monthly checks

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geo_citations_brand ON gv_geo_citations(brand_id);
CREATE INDEX idx_geo_citations_topic ON gv_geo_citations(topic_id);
CREATE INDEX idx_geo_citations_engine ON gv_geo_citations(ai_engine_id);
CREATE INDEX idx_geo_citations_month ON gv_geo_citations(check_month);

-- Delta caching for content changes
CREATE TABLE gv_geo_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_url TEXT NOT NULL,
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Cache data
  content_hash TEXT NOT NULL,
  last_content TEXT,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validity
  is_valid BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geo_cache_url ON gv_geo_content_cache(content_url);
CREATE INDEX idx_geo_cache_brand ON gv_geo_content_cache(brand_id);
CREATE INDEX idx_geo_cache_expires ON gv_geo_content_cache(expires_at);

-- Smart queue system
CREATE TABLE gv_geo_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES gv_geo_tracked_topics(id) ON DELETE CASCADE,

  -- Queue metadata
  priority TEXT CHECK (priority IN ('gold', 'silver', 'bronze')),
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,

  -- Results
  checks_completed INTEGER DEFAULT 0,
  citations_found INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_geo_queue_scheduled ON gv_geo_queue(scheduled_for);
CREATE INDEX idx_geo_queue_status ON gv_geo_queue(status);
CREATE INDEX idx_geo_queue_priority ON gv_geo_queue(priority);

-- =====================================================
-- CLAUDE REVERSE ENGINEERING & STRATEGIES
-- =====================================================

-- Reverse engineering analysis
CREATE TABLE gv_geo_reverse_engineering (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES gv_geo_tracked_topics(id) ON DELETE CASCADE,

  -- Current state
  current_rank INTEGER,
  rank_one_brand TEXT NOT NULL,
  rank_one_topic TEXT NOT NULL,

  -- Claude analysis
  gap_analysis JSONB, -- Array of gaps: what rank #1 has that we don't
  path_to_number_one JSONB, -- Step-by-step actions to become #1
  success_probability DECIMAL(5,2), -- 0-100% estimated success rate
  estimated_time_to_rank_one TEXT, -- '3 months', '6 months', etc.

  -- Strategy breakdown
  strategy_summary TEXT,
  key_actions JSONB, -- Array of critical actions

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geo_reverse_eng_brand ON gv_geo_reverse_engineering(brand_id);
CREATE INDEX idx_geo_reverse_eng_topic ON gv_geo_reverse_engineering(topic_id);

-- OpenAI automated execution
CREATE TABLE gv_geo_automated_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES gv_geo_reverse_engineering(id) ON DELETE CASCADE,

  -- Action details
  action_type TEXT NOT NULL, -- 'content_generation', 'publishing', 'outreach', 'technical_optimization'
  action_description TEXT NOT NULL,

  -- Execution
  execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'in_progress', 'completed', 'failed', 'paused')),
  execution_data JSONB, -- Platform-specific execution details

  -- OpenAI tracking
  openai_model TEXT DEFAULT 'gpt-4-turbo',
  openai_tokens_used INTEGER,
  openai_cost DECIMAL(10,4),

  -- Results
  result_data JSONB,
  success_metrics JSONB,

  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geo_actions_brand ON gv_geo_automated_actions(brand_id);
CREATE INDEX idx_geo_actions_strategy ON gv_geo_automated_actions(strategy_id);
CREATE INDEX idx_geo_actions_status ON gv_geo_automated_actions(execution_status);

-- =====================================================
-- DUAL AI RESEARCH LAYER (PERPLEXITY + GEMINI)
-- =====================================================

-- Research sessions
CREATE TABLE gv_research_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Research context
  research_type TEXT NOT NULL, -- 'backlink_discovery', 'geo_citation', 'competitor_analysis'
  topic TEXT,

  -- Perplexity research
  perplexity_query TEXT,
  perplexity_result JSONB,
  perplexity_tokens INTEGER,
  perplexity_cost DECIMAL(10,4),
  perplexity_duration_ms INTEGER,

  -- Gemini research
  gemini_query TEXT,
  gemini_result JSONB,
  gemini_tokens INTEGER,
  gemini_cost DECIMAL(10,4),
  gemini_duration_ms INTEGER,

  -- Combined insights
  combined_insights JSONB,
  cross_validation_score DECIMAL(5,2), -- Agreement between Perplexity and Gemini

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_brand ON gv_research_sessions(brand_id);
CREATE INDEX idx_research_type ON gv_research_sessions(research_type);

-- =====================================================
-- SELF-LEARNING & OPTIMIZATION
-- =====================================================

-- Action-outcome tracking
CREATE TABLE gv_learning_action_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,
  action_id UUID REFERENCES gv_geo_automated_actions(id),

  -- Context
  context JSONB, -- Industry, topic, current_rank, competitors, etc.

  -- Action taken
  action_type TEXT NOT NULL,
  action_details JSONB,

  -- Outcome measured
  outcome_measured_at TIMESTAMPTZ,
  outcome_data JSONB,

  -- Performance metrics
  citation_frequency_before DECIMAL(5,2),
  citation_frequency_after DECIMAL(5,2),
  citation_frequency_change DECIMAL(5,2),

  rank_before INTEGER,
  rank_after INTEGER,
  rank_change INTEGER,

  roi DECIMAL(10,2), -- Return on investment
  success BOOLEAN,

  -- Learning extraction
  what_worked JSONB, -- Array of insights
  what_didnt_work JSONB,
  confidence_score DECIMAL(5,2), -- How confident are we in this learning?

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_brand ON gv_learning_action_outcomes(brand_id);
CREATE INDEX idx_learning_action ON gv_learning_action_outcomes(action_id);
CREATE INDEX idx_learning_success ON gv_learning_action_outcomes(success);

-- Pattern recognition
CREATE TABLE gv_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pattern identification
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL, -- 'success_pattern', 'failure_pattern', 'cost_pattern', 'opportunity_pattern'

  -- Pattern data
  pattern_description TEXT,
  conditions JSONB, -- When does this pattern apply?
  actions JSONB, -- What actions lead to this outcome?
  outcomes JSONB, -- What outcomes does this pattern produce?

  -- Pattern strength
  occurrences INTEGER DEFAULT 1, -- How many times seen
  success_rate DECIMAL(5,2), -- For success patterns
  confidence_score DECIMAL(5,2),

  -- Application
  applicable_to JSONB, -- Industries, topics, contexts where this applies

  -- Gemini analysis
  gemini_analysis JSONB, -- Deep analysis of the pattern

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patterns_type ON gv_learning_patterns(pattern_type);
CREATE INDEX idx_patterns_confidence ON gv_learning_patterns(confidence_score);

-- A/B testing
CREATE TABLE gv_learning_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Test setup
  test_name TEXT NOT NULL,
  hypothesis TEXT NOT NULL,

  -- Variants
  variant_a JSONB, -- Control strategy
  variant_b JSONB, -- Test strategy

  -- Results
  variant_a_results JSONB,
  variant_b_results JSONB,

  -- Winner
  winning_variant TEXT, -- 'A', 'B', or 'inconclusive'
  statistical_significance DECIMAL(5,2),

  -- Status
  status TEXT DEFAULT 'running' CHECK (status IN ('setup', 'running', 'completed', 'cancelled')),

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ab_tests_brand ON gv_learning_ab_tests(brand_id);
CREATE INDEX idx_ab_tests_status ON gv_learning_ab_tests(status);

-- Competitive intelligence
CREATE TABLE gv_learning_competitive_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Competitor info
  competitor_brand TEXT NOT NULL,

  -- What they're doing
  strategies_observed JSONB,
  tactics_observed JSONB,

  -- Their performance
  citation_frequency DECIMAL(5,2),
  typical_rank INTEGER,
  topics_they_rank_for JSONB,

  -- Learnings
  what_we_can_learn JSONB,
  actions_to_replicate JSONB,

  -- Gemini analysis
  gemini_deep_analysis JSONB,

  observed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitive_intel_brand ON gv_learning_competitive_intel(brand_id);
CREATE INDEX idx_competitive_intel_competitor ON gv_learning_competitive_intel(competitor_brand);

-- Cost optimization tracking
CREATE TABLE gv_learning_cost_optimization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Cost analysis period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Costs
  total_cost DECIMAL(10,2),
  cost_per_citation DECIMAL(10,2),
  cost_per_rank_improvement DECIMAL(10,2),

  -- Breakdown
  perplexity_cost DECIMAL(10,2),
  gemini_cost DECIMAL(10,2),
  claude_cost DECIMAL(10,2),
  openai_cost DECIMAL(10,2),

  -- Optimization opportunities
  optimization_recommendations JSONB,
  estimated_savings DECIMAL(10,2),

  -- Actions taken
  optimizations_applied JSONB,
  actual_savings DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cost_optimization_brand ON gv_learning_cost_optimization(brand_id);
CREATE INDEX idx_cost_optimization_period ON gv_learning_cost_optimization(period_start, period_end);

-- =====================================================
-- DATA REFRESH TRACKING
-- =====================================================

-- Refresh schedule
CREATE TABLE gv_data_refresh_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Refresh configuration
  data_type TEXT NOT NULL, -- 'geo_citations', 'backlink_opportunities', 'competitive_intel'
  refresh_tier TEXT CHECK (refresh_tier IN ('gold', 'silver', 'bronze')),
  refresh_cycle_days INTEGER, -- 7, 14, or 28

  -- Scheduling
  last_refresh_at TIMESTAMPTZ,
  next_refresh_at TIMESTAMPTZ NOT NULL,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_schedule_brand ON gv_data_refresh_schedule(brand_id);
CREATE INDEX idx_refresh_schedule_next ON gv_data_refresh_schedule(next_refresh_at);

-- Refresh execution log
CREATE TABLE gv_data_refresh_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES gv_data_refresh_schedule(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Execution details
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Results
  records_checked INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_deleted INTEGER DEFAULT 0,

  -- Status
  status TEXT CHECK (status IN ('in_progress', 'completed', 'failed')),
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_log_schedule ON gv_data_refresh_log(schedule_id);
CREATE INDEX idx_refresh_log_brand ON gv_data_refresh_log(brand_id);

-- =====================================================
-- TIER USAGE TRACKING
-- =====================================================

-- Monthly usage limits
CREATE TABLE gv_tier_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Period
  month TEXT NOT NULL, -- '2025-01'
  tier TEXT NOT NULL,

  -- GEO limits
  geo_citation_checks_limit INTEGER,
  geo_citation_checks_used INTEGER DEFAULT 0,

  geo_tracked_topics_limit INTEGER,
  geo_tracked_topics_used INTEGER DEFAULT 0,

  geo_optimization_suggestions_limit INTEGER,
  geo_optimization_suggestions_used INTEGER DEFAULT 0,

  -- Backlink limits
  backlink_platforms_limit INTEGER,
  backlink_platforms_used INTEGER DEFAULT 0,

  backlink_opportunities_limit INTEGER,
  backlink_opportunities_used INTEGER DEFAULT 0,

  backlink_perplexity_ranked_limit INTEGER,
  backlink_perplexity_ranked_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, month)
);

CREATE INDEX idx_tier_usage_brand_month ON gv_tier_usage(brand_id, month);

-- =====================================================
-- VIEWS FOR EASY ACCESS
-- =====================================================

-- Client-facing citation view (simple)
CREATE OR REPLACE VIEW gv_client_citation_view AS
SELECT
  c.id,
  c.brand_id,
  t.topic,
  c.rank_one_competitor AS rank_one,
  c.rank_position AS your_brand_rank,
  t.category AS status,
  c.created_at
FROM gv_geo_citations c
JOIN gv_geo_tracked_topics t ON c.topic_id = t.id
ORDER BY c.created_at DESC;

-- Internal strategy view (complex)
CREATE OR REPLACE VIEW gv_internal_strategy_view AS
SELECT
  re.id,
  re.brand_id,
  t.topic,
  re.current_rank,
  re.rank_one_brand,
  re.gap_analysis,
  re.path_to_number_one,
  re.success_probability,
  re.estimated_time_to_rank_one,
  COUNT(aa.id) AS total_automated_actions,
  COUNT(CASE WHEN aa.execution_status = 'completed' THEN 1 END) AS completed_actions
FROM gv_geo_reverse_engineering re
JOIN gv_geo_tracked_topics t ON re.topic_id = t.id
LEFT JOIN gv_geo_automated_actions aa ON re.id = aa.strategy_id
GROUP BY re.id, re.brand_id, t.topic, re.current_rank, re.rank_one_brand,
         re.gap_analysis, re.path_to_number_one, re.success_probability,
         re.estimated_time_to_rank_one;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update topic category based on frequency
CREATE OR REPLACE FUNCTION update_topic_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.overall_frequency >= 70 THEN
    NEW.category := 'performing_well';
    NEW.queue_priority := 'gold';
    NEW.check_interval_days := 7;
  ELSIF NEW.overall_frequency >= 30 THEN
    NEW.category := 'needs_improvement';
    NEW.queue_priority := 'silver';
    NEW.check_interval_days := 14;
  ELSE
    NEW.category := 'new_opportunity';
    NEW.queue_priority := 'bronze';
    NEW.check_interval_days := 28;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_topic_category
BEFORE INSERT OR UPDATE OF overall_frequency ON gv_geo_tracked_topics
FOR EACH ROW
EXECUTE FUNCTION update_topic_category();

-- Function: Real-time sync from GEO to SEO
CREATE OR REPLACE FUNCTION trigger_geo_to_seo_sync()
RETURNS TRIGGER AS $$
DECLARE
  v_topic TEXT;
BEGIN
  -- Get topic name
  SELECT topic INTO v_topic
  FROM gv_geo_tracked_topics
  WHERE id = NEW.topic_id;

  -- Insert sync event
  INSERT INTO gv_geo_seo_sync (
    brand_id,
    sync_direction,
    source_type,
    source_id,
    destination_type,
    sync_action,
    sync_data,
    status
  ) VALUES (
    NEW.brand_id,
    'geo_to_seo',
    'citation',
    NEW.id,
    'keyword',
    'new_citation_found',
    jsonb_build_object(
      'topic', v_topic,
      'is_cited', NEW.is_cited,
      'rank_position', NEW.rank_position,
      'rank_one_competitor', NEW.rank_one_competitor,
      'ai_engine', (SELECT engine_name FROM gv_geo_ai_engines WHERE id = NEW.ai_engine_id)
    ),
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_sync_geo_to_seo
AFTER INSERT ON gv_geo_citations
FOR EACH ROW
WHEN (NEW.is_cited = true)
EXECUTE FUNCTION trigger_geo_to_seo_sync();

-- Function to check tier limits
CREATE OR REPLACE FUNCTION check_tier_limit(
  p_brand_id UUID,
  p_limit_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_month TEXT;
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  v_current_month := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get current usage
  SELECT
    CASE p_limit_type
      WHEN 'geo_citation_checks' THEN geo_citation_checks_limit
      WHEN 'geo_tracked_topics' THEN geo_tracked_topics_limit
      WHEN 'geo_optimization_suggestions' THEN geo_optimization_suggestions_limit
      WHEN 'backlink_opportunities' THEN backlink_opportunities_limit
    END,
    CASE p_limit_type
      WHEN 'geo_citation_checks' THEN geo_citation_checks_used
      WHEN 'geo_tracked_topics' THEN geo_tracked_topics_used
      WHEN 'geo_optimization_suggestions' THEN geo_optimization_suggestions_used
      WHEN 'backlink_opportunities' THEN backlink_opportunities_used
    END
  INTO v_limit, v_used
  FROM gv_tier_usage
  WHERE brand_id = p_brand_id AND month = v_current_month;

  RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CLAUDE FEEDBACK SYSTEM
-- =====================================================

-- Claude AI quality analysis feedback
CREATE TABLE gv_claude_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Content reference
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'seo_article',
    'geo_citation',
    'backlink_opportunity',
    'automated_action',
    'outreach_message',
    'social_post'
  )),
  content_text TEXT NOT NULL,

  -- Originality scores
  originality_score DECIMAL(5,2), -- 0-100
  plagiarism_detected BOOLEAN DEFAULT false,
  similar_content_urls JSONB,
  uniqueness_assessment TEXT,
  originality_recommendations JSONB,

  -- NLP quality scores
  nlp_quality_score DECIMAL(5,2), -- 0-100
  grammar_score DECIMAL(5,2),
  readability_score DECIMAL(5,2),
  coherence_score DECIMAL(5,2),
  natural_language_flow TEXT CHECK (natural_language_flow IN ('excellent', 'good', 'needs_improvement', 'poor')),
  nlp_issues JSONB, -- Array of issues found

  -- Overall quality
  overall_quality_score DECIMAL(5,2), -- 0-100
  relevance_to_topic DECIMAL(5,2),
  depth_of_content DECIMAL(5,2),
  value_to_audience DECIMAL(5,2),
  strengths JSONB,
  weaknesses JSONB,
  improvement_actions JSONB,

  -- Decision
  recommendation TEXT CHECK (recommendation IN ('publish', 'revise', 'reject')),
  revision_priority TEXT CHECK (revision_priority IN ('high', 'medium', 'low')),

  -- Claude analysis
  claude_analysis TEXT,
  claude_model TEXT DEFAULT 'claude-sonnet-4',
  claude_tokens_used INTEGER,
  claude_cost DECIMAL(10,4),

  -- Revision tracking
  is_revised BOOLEAN DEFAULT false,
  revision_count INTEGER DEFAULT 0,
  original_feedback_id UUID REFERENCES gv_claude_feedback(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claude_feedback_content ON gv_claude_feedback(content_id, content_type);
CREATE INDEX idx_claude_feedback_brand ON gv_claude_feedback(brand_id);
CREATE INDEX idx_claude_feedback_recommendation ON gv_claude_feedback(recommendation);
CREATE INDEX idx_claude_feedback_quality ON gv_claude_feedback(overall_quality_score);
CREATE INDEX idx_claude_feedback_created ON gv_claude_feedback(created_at);

-- =====================================================
-- REAL-TIME GEO-SEO SYNC & ENRICHMENT
-- =====================================================

-- Sync events between GEO and SEO
CREATE TABLE gv_geo_seo_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Sync direction
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('geo_to_seo', 'seo_to_geo')),

  -- Source
  source_type TEXT NOT NULL, -- 'citation', 'keyword', 'backlink', 'content', etc.
  source_id UUID NOT NULL,

  -- Destination
  destination_type TEXT NOT NULL,
  destination_id UUID,

  -- Sync action
  sync_action TEXT NOT NULL, -- 'keyword_added', 'topic_added', 'competitor_synced', etc.
  sync_data JSONB, -- Full sync payload

  -- Enrichment results
  enrichment_actions JSONB, -- What actions were triggered
  enrichment_results JSONB, -- Results of those actions

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message TEXT,

  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geo_seo_sync_brand ON gv_geo_seo_sync(brand_id);
CREATE INDEX idx_geo_seo_sync_direction ON gv_geo_seo_sync(sync_direction);
CREATE INDEX idx_geo_seo_sync_source ON gv_geo_seo_sync(source_type, source_id);
CREATE INDEX idx_geo_seo_sync_destination ON gv_geo_seo_sync(destination_type, destination_id);
CREATE INDEX idx_geo_seo_sync_synced ON gv_geo_seo_sync(synced_at);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default refresh schedules for each data type
CREATE OR REPLACE FUNCTION initialize_brand_refresh_schedules(p_brand_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO gv_data_refresh_schedule (brand_id, data_type, refresh_tier, refresh_cycle_days, next_refresh_at)
  VALUES
    (p_brand_id, 'geo_citations', 'gold', 7, NOW() + INTERVAL '7 days'),
    (p_brand_id, 'backlink_opportunities', 'silver', 14, NOW() + INTERVAL '14 days'),
    (p_brand_id, 'competitive_intel', 'bronze', 28, NOW() + INTERVAL '28 days');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE gv_backlink_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_geo_tracked_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_geo_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_geo_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_geo_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_geo_reverse_engineering ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_geo_automated_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_learning_action_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_learning_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_learning_competitive_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_learning_cost_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_data_refresh_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_data_refresh_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_tier_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_claude_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_geo_seo_sync ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only see their own brand's data)
CREATE POLICY "Users can view own brand backlink opportunities"
  ON gv_backlink_opportunities FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand GEO topics"
  ON gv_geo_tracked_topics FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand citations"
  ON gv_geo_citations FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand Claude feedback"
  ON gv_claude_feedback FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand GEO-SEO sync"
  ON gv_geo_seo_sync FOR SELECT
  USING (brand_id IN (SELECT id FROM gv_brands WHERE user_id = auth.uid()));

-- Add similar policies for all other tables...

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_citations_brand_topic_engine ON gv_geo_citations(brand_id, topic_id, ai_engine_id);
CREATE INDEX idx_citations_month_brand ON gv_geo_citations(check_month, brand_id);
CREATE INDEX idx_actions_brand_status ON gv_geo_automated_actions(brand_id, execution_status);
CREATE INDEX idx_learning_outcomes_brand_success ON gv_learning_action_outcomes(brand_id, success);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE gv_backlink_opportunities IS 'Multi-channel backlink opportunities from 10+ platforms with Perplexity AI ranking (top 20)';
COMMENT ON TABLE gv_geo_citations IS 'AI engine citation tracking with delta caching and smart queue system';
COMMENT ON TABLE gv_geo_reverse_engineering IS 'Claude-powered reverse engineering: HOW to become rank #1 (not just what ranks)';
COMMENT ON TABLE gv_geo_automated_actions IS 'OpenAI-powered 100% automated execution of strategies (no manual work)';
COMMENT ON TABLE gv_research_sessions IS 'Dual AI research layer: Perplexity (real-time) + Gemini (deep analysis with 2M tokens)';
COMMENT ON TABLE gv_learning_action_outcomes IS 'Self-learning: track every action → outcome for pattern recognition';
COMMENT ON TABLE gv_learning_patterns IS 'Pattern recognition: extract what works/doesn\'t work to auto-optimize strategies';
COMMENT ON TABLE gv_data_refresh_schedule IS 'Data refresh cycles: Gold (7D), Silver (14D), Bronze (28D) - NOT 90D';
COMMENT ON TABLE gv_claude_feedback IS 'Claude AI quality analysis: originality, NLP quality, overall quality (only Claude has access)';
COMMENT ON TABLE gv_geo_seo_sync IS 'Real-time bidirectional sync and enrichment between GEO and SEO systems';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
