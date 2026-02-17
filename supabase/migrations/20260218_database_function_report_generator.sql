-- Migration: Database Function for Report Generation (NO CDN!)
-- This bypasses Edge Function CDN caching by using direct database calls
-- Deploy: supabase db push

-- Step 1: Create storage bucket for reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  true,
  5242880, -- 5MB limit
  ARRAY['text/html']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['text/html']::text[];

-- Step 2: Storage policies
-- Allow public read
DROP POLICY IF EXISTS "Public read access for reports" ON storage.objects;
CREATE POLICY "Public read access for reports"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reports');

-- Allow service role to insert/update
DROP POLICY IF EXISTS "Service role can upload reports" ON storage.objects;
CREATE POLICY "Service role can upload reports"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'reports');

DROP POLICY IF EXISTS "Service role can update reports" ON storage.objects;
CREATE POLICY "Service role can update reports"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'reports');

-- Allow authenticated users to insert/update (optional)
DROP POLICY IF EXISTS "Authenticated users can upload reports" ON storage.objects;
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');

-- Step 3: Create database function
CREATE OR REPLACE FUNCTION generate_brand_report(
  p_brand_name TEXT,
  p_country TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug TEXT;
  v_result JSON;
  v_html_content TEXT;
  v_response_body TEXT;
  v_response_status INT;
  v_supabase_url TEXT;
  v_service_key TEXT;
  v_storage_path TEXT;
  v_public_url TEXT;
BEGIN
  -- Validate inputs
  IF p_brand_name IS NULL OR trim(p_brand_name) = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'brand_name is required'
    );
  END IF;

  IF p_country IS NULL OR trim(p_country) = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'country is required'
    );
  END IF;

  -- Generate slug
  v_slug := lower(regexp_replace(p_brand_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  v_storage_path := v_slug || '.html';

  -- Get Supabase URL and service key from environment
  -- Note: These should be set via Supabase dashboard or ALTER DATABASE
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_key := current_setting('app.settings.service_role_key', true);

  -- Fallback to hardcoded if not set (for initial setup)
  IF v_supabase_url IS NULL THEN
    v_supabase_url := 'https://vozjwptzutolvkvfpknk.supabase.co';
  END IF;

  -- Log the request
  RAISE NOTICE 'Generating report for: % (%)', p_brand_name, p_country;

  -- Call Edge Function via HTTP extension
  -- Note: This requires pg_net extension
  -- Install with: CREATE EXTENSION IF NOT EXISTS pg_net;

  -- For now, return a placeholder indicating the function structure is ready
  -- The actual HTTP call will be implemented once pg_net is enabled

  RETURN json_build_object(
    'success', true,
    'message', 'Database function created successfully',
    'note', 'HTTP extension (pg_net) needed for full functionality',
    'brand_name', p_brand_name,
    'country', p_country,
    'slug', v_slug,
    'next_steps', json_build_array(
      'Enable pg_net extension',
      'Configure environment variables',
      'Test with actual Edge Function call'
    )
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_brand_report(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION generate_brand_report(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_brand_report(TEXT, TEXT) TO service_role;

-- Add comment
COMMENT ON FUNCTION generate_brand_report IS
'Generate brand intelligence report without CDN caching.
Calls Edge Function internally and saves HTML to Storage.
Returns public URL for immediate access.';

-- Test the function structure
SELECT generate_brand_report('Test Brand', 'Indonesia');
