-- =====================================================
-- AI Conversations Table for AI Chat Feature
-- Created: 2026-02-13
-- Description: Store AI chat conversations and sessions
-- =====================================================

-- =====================================================
-- 1. AI CHAT SESSIONS TABLE (renamed to avoid conflict)
-- Purpose: Group AI chat conversations and track metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS gv_ai_chat_sessions (
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

CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_brand ON gv_ai_chat_sessions(brand_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user ON gv_ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_created ON gv_ai_chat_sessions(created_at DESC);

-- =====================================================
-- 2. AI CONVERSATIONS TABLE
-- Purpose: Store chat message history with AI providers
-- =====================================================
CREATE TABLE IF NOT EXISTS gv_ai_conversations (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_brand ON gv_ai_conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON gv_ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON gv_ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created ON gv_ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_parent ON gv_ai_conversations(parent_message_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE gv_ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gv_ai_conversations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: AI Chat Sessions
-- =====================================================

-- Users can view chat sessions for their brands
CREATE POLICY "Users can view own brand ai chat sessions"
  ON gv_ai_chat_sessions
  FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert chat sessions for their brands
CREATE POLICY "Users can create ai chat sessions for own brands"
  ON gv_ai_chat_sessions
  FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can update their own chat sessions
CREATE POLICY "Users can update own ai chat sessions"
  ON gv_ai_chat_sessions
  FOR UPDATE
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can delete their own chat sessions
CREATE POLICY "Users can delete own ai chat sessions"
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
CREATE POLICY "Users can view own brand ai conversations"
  ON gv_ai_conversations
  FOR SELECT
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert conversations for their brands
CREATE POLICY "Users can create ai conversations for own brands"
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
CREATE POLICY "Users can update own ai conversations"
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
CREATE POLICY "Users can delete own ai conversations"
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
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to update chat session stats
CREATE OR REPLACE FUNCTION update_ai_chat_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.session_id IS NOT NULL THEN
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_ai_chat_session_stats ON gv_ai_conversations;

-- Create trigger to update chat session stats
CREATE TRIGGER trigger_update_ai_chat_session_stats
  AFTER INSERT ON gv_ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_chat_session_stats();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE gv_ai_chat_sessions IS 'AI chat sessions grouping multiple conversation messages';
COMMENT ON TABLE gv_ai_conversations IS 'Individual AI chat messages with provider tracking and token usage';

COMMENT ON COLUMN gv_ai_conversations.conversation_type IS 'Type: chat, daily_brief, insight, or research';
COMMENT ON COLUMN gv_ai_conversations.parent_message_id IS 'For threaded conversations';
COMMENT ON COLUMN gv_ai_conversations.tokens_used IS 'Total tokens used for this message';
COMMENT ON COLUMN gv_ai_conversations.cost_usd IS 'Cost in USD for this message';

-- =====================================================
-- Migration Complete
-- =====================================================
