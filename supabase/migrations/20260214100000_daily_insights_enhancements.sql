-- ============================================================================
-- DAILY INSIGHTS SYSTEM ENHANCEMENTS
-- Add crisis detection and enhanced task structure
-- ============================================================================

-- ============================================================================
-- 1. CRISIS EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gv_crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Crisis details
  crisis_type TEXT NOT NULL CHECK (crisis_type IN (
    'viral_negative_mentions',
    'sentiment_crash',
    'sentiment_surge',
    'ranking_crash',
    'competitor_surge',
    'geo_score_crash',
    'engagement_collapse'
  )),

  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Crisis metrics
  metrics JSONB NOT NULL,

  -- Recommendations
  recommended_actions JSONB,

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved', 'escalated')),

  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Linked insight task (auto-generated)
  insight_task_id UUID REFERENCES gv_daily_insights(id) ON DELETE SET NULL,

  -- Timestamps
  detected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crisis_events_brand ON gv_crisis_events(brand_id);
CREATE INDEX idx_crisis_events_type ON gv_crisis_events(crisis_type);
CREATE INDEX idx_crisis_events_severity ON gv_crisis_events(severity);
CREATE INDEX idx_crisis_events_status ON gv_crisis_events(status);
CREATE INDEX idx_crisis_events_detected ON gv_crisis_events(detected_at DESC);

COMMENT ON TABLE gv_crisis_events IS 'Log and track brand crisis events detected by the insights system';


-- ============================================================================
-- 2. TASK ACTIONS TABLE (Track task completion)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gv_task_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to insight task
  insight_id UUID NOT NULL REFERENCES gv_daily_insights(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Action tracking
  action_type TEXT NOT NULL CHECK (action_type IN (
    'started',
    'completed',
    'dismissed',
    'snoozed',
    'escalated'
  )),

  -- Completion details
  completion_notes TEXT,
  time_spent_minutes INTEGER,
  success_metrics_achieved JSONB,

  -- Quality assessment (post-completion)
  outcome_quality TEXT CHECK (outcome_quality IN ('poor', 'average', 'good', 'excellent')),
  user_feedback TEXT,

  -- Timestamps
  action_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_actions_insight ON gv_task_actions(insight_id);
CREATE INDEX idx_task_actions_brand ON gv_task_actions(brand_id);
CREATE INDEX idx_task_actions_user ON gv_task_actions(user_id);
CREATE INDEX idx_task_actions_type ON gv_task_actions(action_type);

COMMENT ON TABLE gv_task_actions IS 'Track user actions on daily insight tasks';


-- ============================================================================
-- 3. UPDATE DAILY INSIGHTS TABLE (Add missing fields)
-- ============================================================================

-- Add new task-related columns
ALTER TABLE gv_daily_insights
ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_tasks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tasks_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tasks_snoozed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tasks_dismissed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crisis_alerts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS crisis_level TEXT CHECK (crisis_level IN ('none', 'low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS crisis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS radar_scanned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hub_scanned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS search_scanned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chat_scanned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expected_outcome TEXT,
ADD COLUMN IF NOT EXISTS expected_duration INTEGER,
ADD COLUMN IF NOT EXISTS success_metrics JSONB,
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('radar', 'search', 'hub', 'chat', 'crisis')),
ADD COLUMN IF NOT EXISTS source_data JSONB,
ADD COLUMN IF NOT EXISTS priority_score NUMERIC(5,2);

-- Create index on priority score
CREATE INDEX IF NOT EXISTS idx_daily_insights_priority_score
ON gv_daily_insights(priority_score DESC);

-- Comments
COMMENT ON COLUMN gv_daily_insights.tasks IS 'Array of InsightTask objects generated for this date';
COMMENT ON COLUMN gv_daily_insights.expected_outcome IS 'Clear, measurable expected result';
COMMENT ON COLUMN gv_daily_insights.success_metrics IS 'Array of {metric, target, unit, timeframe}';
COMMENT ON COLUMN gv_daily_insights.source_type IS 'Data source: radar, search, hub, chat, or crisis';
COMMENT ON COLUMN gv_daily_insights.priority_score IS 'Calculated priority score (0-100) for ranking';


-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

-- Crisis Events
ALTER TABLE gv_crisis_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand crisis events"
  ON gv_crisis_events FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );

-- Task Actions
ALTER TABLE gv_task_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand task actions"
  ON gv_task_actions FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );


-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp for crisis events
CREATE TRIGGER update_crisis_events_updated_at
  BEFORE UPDATE ON gv_crisis_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function: Get active crises for a brand
CREATE OR REPLACE FUNCTION get_active_crises(p_brand_id UUID)
RETURNS SETOF gv_crisis_events AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM gv_crisis_events
  WHERE brand_id = p_brand_id
    AND status IN ('active', 'monitoring')
  ORDER BY severity DESC, detected_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Update insights tier limits (now 8/10/12)
CREATE OR REPLACE FUNCTION get_tier_limits(p_brand_id UUID)
RETURNS TABLE(
  keywords_limit INTEGER,
  insights_limit INTEGER,
  articles_limit INTEGER,
  images_limit INTEGER,
  videos_limit INTEGER
) AS $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM gv_brands
  WHERE id = p_brand_id;

  CASE v_tier
    WHEN 'basic' THEN
      RETURN QUERY SELECT 5, 8, 1, 1, 0;
    WHEN 'premium' THEN
      RETURN QUERY SELECT 8, 10, 3, 3, 1;
    WHEN 'partner' THEN
      RETURN QUERY SELECT 15, 12, 6, 6, 3;
    ELSE
      RETURN QUERY SELECT 5, 8, 1, 1, 0; -- Default to basic
  END CASE;
END;
$$ LANGUAGE plpgsql;
