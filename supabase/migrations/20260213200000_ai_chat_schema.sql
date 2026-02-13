-- =====================================================
-- AI Chat Feature Database Schema
-- Created: 2026-02-13
-- Description: Multi-AI orchestration system for deep brand intelligence
-- Note: Using gv_ai_chat_sessions to avoid conflict with existing gv_chat_sessions
-- =====================================================

-- =====================================================
-- 1. AI CHAT SESSIONS TABLE
-- Purpose: Group AI conversations and track metadata
-- =====================================================
CREATE TABLE gv_ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT DEFAULT 'New Chat',
  summary TEXT,

  -- Metadata
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_chat_sessions_brand ON gv_ai_chat_sessions(brand_id);
CREATE INDEX idx_ai_chat_sessions_user ON gv_ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_sessions_created ON gv_ai_chat_sessions(created_at DESC);

-- =====================================================
-- 2. AI CONVERSATIONS TABLE
-- Purpose: Store chat message history
-- =====================================================
CREATE TABLE gv_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),

  -- AI Provider tracking
  ai_provider TEXT CHECK (ai_provider IN ('gemini', 'openai', 'perplexity', 'claude')),
  model_used TEXT, -- e.g., 'gpt-4', 'gemini-pro', 'claude-3-opus'

  -- Context & metadata
  conversation_type TEXT CHECK (conversation_type IN ('chat', 'daily_brief', 'insight', 'research')),
  parent_message_id UUID REFERENCES gv_ai_conversations(id), -- for threading
  session_id UUID REFERENCES gv_ai_chat_sessions(id) ON DELETE CASCADE,

  -- Token usage tracking
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraints
  CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES gv_brands(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX idx_ai_conversations_brand ON gv_ai_conversations(brand_id);
CREATE INDEX idx_ai_conversations_user ON gv_ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session ON gv_ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_created ON gv_ai_conversations(created_at DESC);
CREATE INDEX idx_ai_conversations_parent ON gv_ai_conversations(parent_message_id);

-- =====================================================
-- 3. DAILY BRIEFS TABLE
-- Purpose: Proactive AI intelligence summaries
-- =====================================================
CREATE TABLE gv_daily_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Brief date
  brief_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Section A: Competitor Intelligence
  competitor_questions JSONB, -- [{question: "...", frequency: 100, brands: ["..."]}]
  competitor_strategies JSONB, -- [{strategy: "...", brands: ["..."], impact: "high"}]

  -- Section B: Consumer Insights
  customer_questions JSONB, -- [{question: "...", volume: 340, sentiment: "positive"}]
  brand_visibility JSONB, -- {search_rank: 5, mentions: 120, reach: 50000}
  trending_topics JSONB, -- [{topic: "...", volume: 1000, trend: "up"}]

  -- Section C: Gap Analysis (Blue Ocean)
  untapped_opportunities JSONB, -- [{topic: "...", volume: 5000, competition: "low"}]

  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  ai_providers_used TEXT[], -- ['gemini', 'perplexity', 'openai']
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Delivery status
  delivered BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  UNIQUE(brand_id, brief_date)
);

CREATE INDEX idx_daily_briefs_brand ON gv_daily_briefs(brand_id);
CREATE INDEX idx_daily_briefs_date ON gv_daily_briefs(brief_date DESC);
CREATE INDEX idx_daily_briefs_delivered ON gv_daily_briefs(delivered);

-- =====================================================
-- 4. AI INSIGHTS TABLE
-- Purpose: Store specific actionable findings
-- =====================================================
CREATE TABLE gv_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Insight details
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'competitor_strategy',
    'customer_question',
    'gap_opportunity',
    'trend_alert',
    'seo_recommendation',
    'content_idea'
  )),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB, -- Full insight data

  -- Actionability
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  actionable BOOLEAN DEFAULT TRUE,
  action_taken BOOLEAN DEFAULT FALSE,
  action_notes TEXT,

  -- Source tracking
  ai_provider TEXT NOT NULL,
  source_urls TEXT[], -- Reference links
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00

  -- Timestamps
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For time-sensitive insights

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_brand ON gv_ai_insights(brand_id);
CREATE INDEX idx_ai_insights_type ON gv_ai_insights(insight_type);
CREATE INDEX idx_ai_insights_priority ON gv_ai_insights(priority);
CREATE INDEX idx_ai_insights_action_taken ON gv_ai_insights(action_taken);
CREATE INDEX idx_ai_insights_discovered ON gv_ai_insights(discovered_at DESC);

-- =====================================================
-- 5. AI PROVIDERS TABLE
-- Purpose: Manage API keys and track usage
-- =====================================================
CREATE TABLE gv_ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL CHECK (provider IN ('gemini', 'openai', 'perplexity', 'claude')),

  -- API Configuration
  api_key_encrypted TEXT NOT NULL, -- Encrypted with Supabase vault
  endpoint_url TEXT,
  model_default TEXT NOT NULL,

  -- Usage tracking (monthly)
  current_month DATE DEFAULT DATE_TRUNC('month', NOW()),
  requests_this_month INTEGER DEFAULT 0,
  tokens_this_month BIGINT DEFAULT 0,
  cost_this_month_usd DECIMAL(10, 2) DEFAULT 0,

  -- Limits
  monthly_budget_usd DECIMAL(10, 2) DEFAULT 100,
  rate_limit_rpm INTEGER DEFAULT 60, -- requests per minute

  -- Status
  active BOOLEAN DEFAULT TRUE,
  last_error TEXT,
  last_success_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_providers_active ON gv_ai_providers(active);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE gv_ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_daily_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_ai_providers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: AI Chat Sessions
-- =====================================================

-- Users can view AI chat sessions for their brands
CREATE POLICY "Users can view own brand AI chat sessions"
  ON gv_ai_chat_sessions
  FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert AI chat sessions for their brands
CREATE POLICY "Users can create AI chat sessions for own brands"
  ON gv_ai_chat_sessions
  FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can update their own AI chat sessions
CREATE POLICY "Users can update own AI chat sessions"
  ON gv_ai_chat_sessions
  FOR UPDATE
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can delete their own AI chat sessions
CREATE POLICY "Users can delete own AI chat sessions"
  ON gv_ai_chat_sessions
  FOR DELETE
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- =====================================================
-- RLS: AI Conversations
-- =====================================================

-- Users can view conversations for their brands
CREATE POLICY "Users can view own brand conversations"
  ON gv_ai_conversations
  FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert conversations for their brands
CREATE POLICY "Users can create conversations for own brands"
  ON gv_ai_conversations
  FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON gv_ai_conversations
  FOR UPDATE
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON gv_ai_conversations
  FOR DELETE
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- =====================================================
-- RLS: Daily Briefs
-- =====================================================

-- Users can view daily briefs for their brands
CREATE POLICY "Users can view own brand daily briefs"
  ON gv_daily_briefs
  FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- System can insert daily briefs (service role only)
CREATE POLICY "Service role can insert daily briefs"
  ON gv_daily_briefs
  FOR INSERT
  WITH CHECK (
    -- This will be executed by Edge Functions with service role
    true
  );

-- Users can update read status of their brand's briefs
CREATE POLICY "Users can update own brand brief read status"
  ON gv_daily_briefs
  FOR UPDATE
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS: AI Insights
-- =====================================================

-- Users can view insights for their brands
CREATE POLICY "Users can view own brand insights"
  ON gv_ai_insights
  FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- System can insert insights (service role only)
CREATE POLICY "Service role can insert insights"
  ON gv_ai_insights
  FOR INSERT
  WITH CHECK (
    -- This will be executed by Edge Functions with service role
    true
  );

-- Users can update action status of their brand's insights
CREATE POLICY "Users can update own brand insight actions"
  ON gv_ai_insights
  FOR UPDATE
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS: AI Providers
-- =====================================================

-- Only admins can access AI provider settings
-- For now, we'll restrict to service role only
CREATE POLICY "Only service role can manage AI providers"
  ON gv_ai_providers
  FOR ALL
  USING (
    -- Only service role can access
    false
  );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to update AI chat session stats
CREATE OR REPLACE FUNCTION update_ai_chat_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gv_ai_chat_sessions
    SET
      message_count = message_count + 1,
      total_tokens = total_tokens + COALESCE(NEW.tokens_used, 0),
      total_cost_usd = total_cost_usd + COALESCE(NEW.cost_usd, 0),
      updated_at = NOW()
    WHERE id = NEW.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update AI chat session stats
CREATE TRIGGER trigger_update_ai_chat_session_stats
  AFTER INSERT ON gv_ai_conversations
  FOR EACH ROW
  WHEN (NEW.session_id IS NOT NULL)
  EXECUTE FUNCTION update_ai_chat_session_stats();

-- Function to reset monthly AI provider stats
CREATE OR REPLACE FUNCTION reset_ai_provider_monthly_stats()
RETURNS void AS $$
BEGIN
  UPDATE gv_ai_providers
  SET
    current_month = DATE_TRUNC('month', NOW()),
    requests_this_month = 0,
    tokens_this_month = 0,
    cost_this_month_usd = 0
  WHERE current_month < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE gv_ai_chat_sessions IS 'AI chat sessions grouping multiple conversation messages';
COMMENT ON TABLE gv_ai_conversations IS 'Individual AI chat messages with provider tracking';
COMMENT ON TABLE gv_daily_briefs IS 'Automated daily intelligence briefings for brands';
COMMENT ON TABLE gv_ai_insights IS 'Actionable insights discovered by AI analysis';
COMMENT ON TABLE gv_ai_providers IS 'AI provider API configuration and usage tracking';

COMMENT ON COLUMN gv_ai_conversations.conversation_type IS 'Type: chat, daily_brief, insight, or research';
COMMENT ON COLUMN gv_ai_conversations.parent_message_id IS 'For threaded conversations';
COMMENT ON COLUMN gv_ai_insights.confidence_score IS 'AI confidence level from 0.00 to 1.00';
COMMENT ON COLUMN gv_ai_providers.api_key_encrypted IS 'Encrypted API key - use Supabase Vault';

-- =====================================================
-- Migration Complete
-- =====================================================
