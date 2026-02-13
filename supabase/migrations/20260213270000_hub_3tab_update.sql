-- ============================================================
-- Migration: Authority Hub 3-Tab Structure Update
-- Date: 2026-02-13 27:00:00
-- Purpose: Add support for 3-tab Hub structure
--          Tab 1: Embeds, Tab 2: Articles, Tab 3: Charts
-- ============================================================

-- ============================================================
-- 1. UPDATE ARTICLES TABLE - Add Article Subtypes
-- ============================================================
ALTER TABLE gv_hub_articles
  DROP CONSTRAINT IF EXISTS gv_hub_articles_article_type_check;

ALTER TABLE gv_hub_articles
  ADD CONSTRAINT gv_hub_articles_article_type_check
  CHECK (article_type IN ('hot', 'review', 'education', 'nice_to_know'));

COMMENT ON COLUMN gv_hub_articles.article_type IS 'Article type: hot (trending), review (analysis), education (how-to), nice_to_know (insights)';

-- Add word count validation
ALTER TABLE gv_hub_articles
  ADD COLUMN IF NOT EXISTS word_count INTEGER;

ALTER TABLE gv_hub_articles
  ADD CONSTRAINT word_count_range CHECK (word_count >= 200 AND word_count <= 500);

COMMENT ON COLUMN gv_hub_articles.word_count IS 'Article word count (200-500 words)';

-- ============================================================
-- 2. CREATE HUB COLLECTIONS (Group content by category/topic)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_hub_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- 3-Tab Content
  tab_embeds_enabled BOOLEAN DEFAULT true,
  tab_articles_enabled BOOLEAN DEFAULT true,
  tab_charts_enabled BOOLEAN DEFAULT true,

  -- Collection Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Goal: 4-8 per day per category
  daily_target INTEGER DEFAULT 6,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hub_collections_category ON gv_hub_collections(category);
CREATE INDEX idx_hub_collections_status ON gv_hub_collections(status);

COMMENT ON TABLE gv_hub_collections IS 'Hub collections grouping embeds, articles, and charts by category/topic';

-- ============================================================
-- 3. UPDATE EMBEDDED CONTENT - Link to Collections
-- ============================================================
ALTER TABLE gv_hub_embedded_content
  ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES gv_hub_collections(id) ON DELETE CASCADE;

CREATE INDEX idx_hub_embedded_collection ON gv_hub_embedded_content(collection_id);

-- Add display order
ALTER TABLE gv_hub_embedded_content
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

COMMENT ON COLUMN gv_hub_embedded_content.collection_id IS 'Group embeds into collections (5-10 per collection)';

-- ============================================================
-- 4. CREATE CHARTS TABLE (Statista-Inspired)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_hub_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES gv_hub_collections(id) ON DELETE CASCADE,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('line', 'bar', 'pie', 'area', 'scatter', 'heatmap')),
  title TEXT NOT NULL,
  subtitle TEXT,

  -- Chart Data (JSON format for flexibility)
  chart_data JSONB NOT NULL,
  chart_config JSONB DEFAULT '{}',

  -- Visual Style
  color_scheme TEXT DEFAULT 'default',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),

  -- Data Source
  data_source TEXT,
  data_period TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),

  -- Insights
  key_insight TEXT,
  insight_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hub_charts_collection ON gv_hub_charts(collection_id);
CREATE INDEX idx_hub_charts_type ON gv_hub_charts(chart_type);

COMMENT ON TABLE gv_hub_charts IS 'Statista-inspired charts and visualizations for Hub Tab 3';
COMMENT ON COLUMN gv_hub_charts.chart_data IS 'Chart data in JSON format (labels, datasets, values)';

-- Example chart_data structure:
-- {
--   "labels": ["Week 1", "Week 2", "Week 3"],
--   "datasets": [{
--     "label": "Engagement Rate",
--     "data": [4.2, 4.5, 4.8]
--   }]
-- }

-- ============================================================
-- 5. CREATE CHART TEMPLATES (Pre-defined Chart Types)
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_hub_chart_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  chart_type TEXT NOT NULL,
  description TEXT,

  -- SQL Query Template
  data_query TEXT NOT NULL,
  query_params JSONB DEFAULT '{}',

  -- Chart Config Template
  config_template JSONB NOT NULL,

  -- Metadata
  category TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE gv_hub_chart_templates IS 'Reusable chart templates for common visualizations';

-- Insert default templates
INSERT INTO gv_hub_chart_templates (template_name, chart_type, description, data_query, config_template, category) VALUES
  (
    'engagement_trend',
    'line',
    'Engagement rate trend over time',
    'SELECT DATE_TRUNC(''day'', posted_at) as date, AVG((likes + comments + shares)::float / NULLIF(reach, 0) * 100) as engagement_rate FROM gv_creator_content WHERE category = $1 AND posted_at >= NOW() - INTERVAL ''30 days'' GROUP BY date ORDER BY date',
    '{"xAxis": {"type": "timeseries"}, "yAxis": {"label": "Engagement Rate (%)"}}',
    'all'
  ),
  (
    'top_creators_by_reach',
    'bar',
    'Top 10 creators by total reach',
    'SELECT c.name, SUM(cc.reach) as total_reach FROM gv_creators c JOIN gv_creator_content cc ON c.id = cc.creator_id WHERE c.category = $1 GROUP BY c.id, c.name ORDER BY total_reach DESC LIMIT 10',
    '{"xAxis": {"label": "Creator"}, "yAxis": {"label": "Total Reach"}}',
    'all'
  ),
  (
    'content_type_distribution',
    'pie',
    'Distribution of content types',
    'SELECT CASE WHEN caption LIKE ''%tutorial%'' THEN ''Tutorial'' WHEN caption LIKE ''%review%'' THEN ''Review'' ELSE ''Other'' END as type, COUNT(*) as count FROM gv_creator_content WHERE category = $1 GROUP BY type',
    '{"legend": {"position": "right"}}',
    'all'
  );

-- ============================================================
-- 6. UPDATE ARTICLES TABLE - Link to Collections
-- ============================================================
ALTER TABLE gv_hub_articles
  ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES gv_hub_collections(id) ON DELETE CASCADE;

CREATE INDEX idx_hub_articles_collection ON gv_hub_articles(collection_id);

-- ============================================================
-- 7. HELPER FUNCTIONS
-- ============================================================

-- Function: Get complete collection with all tabs
CREATE OR REPLACE FUNCTION get_hub_collection(p_collection_id UUID)
RETURNS JSON AS $$
DECLARE
  v_collection JSON;
BEGIN
  SELECT json_build_object(
    'collection', row_to_json(c),
    'embeds', (
      SELECT json_agg(row_to_json(e) ORDER BY e.display_order)
      FROM gv_hub_embedded_content e
      WHERE e.collection_id = p_collection_id
    ),
    'articles', (
      SELECT json_agg(row_to_json(a))
      FROM gv_hub_articles a
      WHERE a.collection_id = p_collection_id
        AND a.status = 'published'
    ),
    'charts', (
      SELECT json_agg(row_to_json(ch))
      FROM gv_hub_charts ch
      WHERE ch.collection_id = p_collection_id
    )
  ) INTO v_collection
  FROM gv_hub_collections c
  WHERE c.id = p_collection_id;

  RETURN v_collection;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Generate chart data from template
CREATE OR REPLACE FUNCTION generate_chart_from_template(
  p_template_name TEXT,
  p_category TEXT,
  p_collection_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_template RECORD;
  v_chart_id UUID;
  v_data JSONB;
BEGIN
  -- Get template
  SELECT * INTO v_template
  FROM gv_hub_chart_templates
  WHERE template_name = p_template_name
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chart template not found: %', p_template_name;
  END IF;

  -- Execute data query (simplified - in production use proper parameterization)
  EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', v_template.data_query)
    INTO v_data
    USING p_category;

  -- Create chart
  INSERT INTO gv_hub_charts (
    collection_id,
    chart_type,
    title,
    chart_data,
    chart_config,
    data_source,
    key_insight
  ) VALUES (
    p_collection_id,
    v_template.chart_type,
    v_template.description,
    v_data,
    v_template.config_template,
    'Template: ' || p_template_name,
    'Auto-generated from top-of-voice data'
  )
  RETURNING id INTO v_chart_id;

  RETURN v_chart_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Hub homepage (all categories)
CREATE OR REPLACE FUNCTION get_hub_homepage()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'category', c.category,
        'title', c.title,
        'collections', (
          SELECT json_agg(
            json_build_object(
              'id', col.id,
              'title', col.title,
              'description', col.description,
              'embed_count', (SELECT COUNT(*) FROM gv_hub_embedded_content WHERE collection_id = col.id),
              'article_count', (SELECT COUNT(*) FROM gv_hub_articles WHERE collection_id = col.id AND status = 'published'),
              'chart_count', (SELECT COUNT(*) FROM gv_hub_charts WHERE collection_id = col.id)
            )
          )
          FROM gv_hub_collections col
          WHERE col.category = c.category
            AND col.status = 'published'
          ORDER BY col.published_at DESC
          LIMIT 10
        )
      )
    )
    FROM (SELECT DISTINCT category, MAX(title) as title FROM gv_hub_collections WHERE status = 'published' GROUP BY category) c
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 8. GRANT PERMISSIONS
-- ============================================================

GRANT SELECT ON gv_hub_collections TO anon, authenticated;
GRANT SELECT ON gv_hub_charts TO anon, authenticated;
GRANT SELECT ON gv_hub_chart_templates TO anon, authenticated;

-- ============================================================
-- Migration complete
-- ============================================================
