-- ============================================================
-- QUICK FIX SCRIPT - Apply these policies immediately
-- Run this via Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: Tables with brand_id (Standard Policies)
-- ============================================================

-- gv_hub_collections
DROP POLICY IF EXISTS "Users can view own hub collections" ON public.gv_hub_collections;
CREATE POLICY "Users can view own hub collections" ON public.gv_hub_collections
FOR SELECT USING (brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own hub collections" ON public.gv_hub_collections;
CREATE POLICY "Users can manage own hub collections" ON public.gv_hub_collections
FOR ALL USING (brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()));

-- gv_hub_articles
DROP POLICY IF EXISTS "Users can view own hub articles" ON public.gv_hub_articles;
CREATE POLICY "Users can view own hub articles" ON public.gv_hub_articles
FOR SELECT USING (brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own hub articles" ON public.gv_hub_articles;
CREATE POLICY "Users can manage own hub articles" ON public.gv_hub_articles
FOR ALL USING (brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()));

-- gv_hub_daily_quotas
DROP POLICY IF EXISTS "Users can view own hub quotas" ON public.gv_hub_daily_quotas;
CREATE POLICY "Users can view own hub quotas" ON public.gv_hub_daily_quotas
FOR SELECT USING (brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()));

-- gv_hub_generation_queue
DROP POLICY IF EXISTS "Users can view own generation queue" ON public.gv_hub_generation_queue;
CREATE POLICY "Users can view own generation queue" ON public.gv_hub_generation_queue
FOR SELECT USING (brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()));

-- ============================================================
-- PART 2: Tables with collection_id (Nested Check)
-- ============================================================

-- gv_hub_embedded_content
DROP POLICY IF EXISTS "Users can view own embedded content" ON public.gv_hub_embedded_content;
CREATE POLICY "Users can view own embedded content" ON public.gv_hub_embedded_content
FOR SELECT USING (
  collection_id IN (
    SELECT id FROM public.gv_hub_collections
    WHERE brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid())
  )
);

-- ============================================================
-- PART 3: Global Tables (Partner Tier Only)
-- ============================================================

-- gv_creators (Global creator database - Partner tier only)
DROP POLICY IF EXISTS "Partner tier users can view creators" ON public.gv_creators;
CREATE POLICY "Partner tier users can view creators" ON public.gv_creators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.brands b
    JOIN public.user_brands ub ON b.id = ub.brand_id
    WHERE ub.user_id = auth.uid()
    AND b.subscription_tier = 'partner'
  )
);

-- gv_radar_creators (Partner tier only)
DROP POLICY IF EXISTS "Partner tier users can view radar creators" ON public.gv_radar_creators;
CREATE POLICY "Partner tier users can view radar creators" ON public.gv_radar_creators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.brands b
    JOIN public.user_brands ub ON b.id = ub.brand_id
    WHERE ub.user_id = auth.uid()
    AND b.subscription_tier = 'partner'
  )
);

-- gv_creator_content (Partner tier only)
DROP POLICY IF EXISTS "Partner tier users can view creator content" ON public.gv_creator_content;
CREATE POLICY "Partner tier users can view creator content" ON public.gv_creator_content
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.brands b
    JOIN public.user_brands ub ON b.id = ub.brand_id
    WHERE ub.user_id = auth.uid()
    AND b.subscription_tier = 'partner'
  )
);

-- ============================================================
-- PART 4: Public Reference Tables
-- ============================================================

-- gv_subscription_pricing (Public read, service role write)
DROP POLICY IF EXISTS "Anyone can view pricing" ON public.gv_subscription_pricing;
CREATE POLICY "Anyone can view pricing" ON public.gv_subscription_pricing
FOR SELECT USING (true);

-- ============================================================
-- PART 5: User-Scoped Tables
-- ============================================================

-- gv_brand_confirmations
DROP POLICY IF EXISTS "Users can view own confirmations" ON public.gv_brand_confirmations;
CREATE POLICY "Users can view own confirmations" ON public.gv_brand_confirmations
FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- PART 6: Global Shared Data (Category-Based)
-- ============================================================

-- gv_brand_authority_patterns (Global patterns, authenticated read)
DROP POLICY IF EXISTS "Authenticated users can view patterns" ON public.gv_brand_authority_patterns;
CREATE POLICY "Authenticated users can view patterns" ON public.gv_brand_authority_patterns
FOR SELECT USING (auth.uid() IS NOT NULL);

-- gv_trends (Global trends, everyone can read)
DROP POLICY IF EXISTS "Anyone can view global trends" ON public.gv_trends;
CREATE POLICY "Anyone can view global trends" ON public.gv_trends
FOR SELECT USING (true);

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check tables still missing policies
SELECT
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count,
    CASE
        WHEN NOT t.rowsecurity THEN '❌ RLS DISABLED'
        WHEN COUNT(p.policyname) = 0 THEN '⚠️ NO POLICIES'
        ELSE '✅ SECURED'
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
HAVING (NOT t.rowsecurity) OR COUNT(p.policyname) = 0
ORDER BY t.tablename;
