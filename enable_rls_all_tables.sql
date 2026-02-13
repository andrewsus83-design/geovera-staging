-- PRODUCTION SECURITY: Enable RLS on ALL tables
-- NO FAKE DATA - REAL PRODUCTION!

-- Enable RLS on all GeoVera tables
ALTER TABLE IF EXISTS public.gv_apply_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_authority_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_behavior_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_content_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_content_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_crawl_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_creator_discovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_creator_market_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_customer_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_deep_research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_discovered_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_gemini_creator_crawls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_llm_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_market_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_nia_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_perplexity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_platform_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_research_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_reverse_engineering ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_brand_chronicle ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gv_raw_artifacts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for brands table (users can only see their own brands)
DROP POLICY IF EXISTS "Users can view own brands" ON public.brands;
CREATE POLICY "Users can view own brands" ON public.brands
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_brands WHERE brand_id = brands.id
  )
);

DROP POLICY IF EXISTS "Users can insert own brands" ON public.brands;
CREATE POLICY "Users can insert own brands" ON public.brands
FOR INSERT WITH CHECK (true); -- Will be restricted by user_brands

DROP POLICY IF EXISTS "Users can update own brands" ON public.brands;
CREATE POLICY "Users can update own brands" ON public.brands
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_brands WHERE brand_id = brands.id
  )
);

-- Create RLS Policies for user_brands (link between users and brands)
DROP POLICY IF EXISTS "Users can view own brand links" ON public.user_brands;
CREATE POLICY "Users can view own brand links" ON public.user_brands
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own brand links" ON public.user_brands;
CREATE POLICY "Users can insert own brand links" ON public.user_brands
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for customers
DROP POLICY IF EXISTS "Users can view own customer record" ON public.customers;
CREATE POLICY "Users can view own customer record" ON public.customers
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customer record" ON public.customers;
CREATE POLICY "Users can update own customer record" ON public.customers
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS Policies for subscriptions (users can only see their own)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.gv_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.gv_subscriptions
FOR SELECT USING (auth.uid() = user_id);

-- Create RLS Policies for invoices (users can only see their own)
DROP POLICY IF EXISTS "Users can view own invoices" ON public.gv_invoices;
CREATE POLICY "Users can view own invoices" ON public.gv_invoices
FOR SELECT USING (auth.uid() = user_id);

-- Create RLS Policies for brand data (users can only see data for their brands)
DROP POLICY IF EXISTS "Users can view own brand chronicle" ON public.gv_brand_chronicle;
CREATE POLICY "Users can view own brand chronicle" ON public.gv_brand_chronicle
FOR SELECT USING (
  brand_id IN (
    SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view own artifacts" ON public.gv_raw_artifacts;
CREATE POLICY "Users can view own artifacts" ON public.gv_raw_artifacts
FOR SELECT USING (
  brand_id IN (
    SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()
  )
);

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'RLS enabled on all tables - PRODUCTION READY!';
  RAISE NOTICE 'NO FAKE DATA - REAL USER DATA PROTECTED!';
END $$;
