# Architecture Comparison - Report Generation

## ❌ **Current (BROKEN): Supabase Edge Functions**

```
User Request
   ↓
Cloudflare CDN (CACHED!) ← PROBLEM!
   ↓
Supabase Edge Runtime (Deno)
   ↓
AI APIs (Perplexity, Gemini, Claude, GPT-4)
   ↓
Generate HTML
   ↓
Return JSON
```

**Issues**:
- ❌ CDN caching (cannot disable)
- ❌ Propagation delay (hours)
- ❌ No control over cache invalidation

---

## ✅ **Option A: Supabase Database Functions (NO CDN)**

```
User Request
   ↓
Supabase REST API (NO CDN!)
   ↓
PostgreSQL Function
   ↓
Call Edge Function internally
   ↓
AI APIs
   ↓
Save to Storage Bucket
   ↓
Return public URL
```

**Benefits**:
- ✅ NO CDN caching
- ✅ Instant deployment
- ✅ Stay in Supabase
- ✅ Use Storage for HTML files

**How it works**:
1. Create PostgreSQL function: `generate_report(brand, country)`
2. Function calls Edge Function internally (or call AI APIs directly)
3. Function saves HTML to Supabase Storage
4. Return public Storage URL: `https://storage.supabase.co/...`

---

## ✅ **Option B: Vercel API Routes**

```
User Request
   ↓
Vercel Edge Network
   ↓
Node.js Runtime
   ↓
AI APIs (direct)
   ↓
Save to public/reports/
   ↓
Serve from Vercel CDN
```

**Benefits**:
- ✅ Simple git push deployment
- ✅ Auto-serve static files
- ✅ Vercel CDN (properly configured)
- ✅ No caching issues on API routes

---

## ✅ **Option C: Hybrid (Supabase + Vercel)**

```
User Request
   ↓
Vercel API Route (thin wrapper)
   ↓
Supabase Database Function (NO CDN)
   ↓
AI APIs
   ↓
Vercel saves HTML locally
   ↓
Serve from Vercel
```

**Benefits**:
- ✅ Best of both worlds
- ✅ Supabase for backend logic
- ✅ Vercel for frontend hosting
- ✅ No CDN caching issues

---

## 🎯 **RECOMMENDATION**

### **For Immediate Fix:**
→ **Option A: Supabase Database Functions**

**Why:**
- ✅ Minimal code changes
- ✅ Stay in Supabase ecosystem
- ✅ NO CDN (direct database call)
- ✅ Instant deployment via migration

### **For Long-term:**
→ **Option C: Hybrid**

**Why:**
- ✅ Separation of concerns
- ✅ Vercel handles frontend/static
- ✅ Supabase handles backend/data
- ✅ Both platforms used for their strengths

---

## 📝 **Implementation - Option A (RECOMMENDED NOW)**

### Step 1: Create Supabase Storage Bucket
```sql
-- Create storage bucket for reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true);

-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports');

-- Allow authenticated upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');
```

### Step 2: Create Database Function
```sql
CREATE OR REPLACE FUNCTION generate_brand_report(
  p_brand_name TEXT,
  p_country TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slug TEXT;
  v_html_content TEXT;
  v_file_path TEXT;
  v_public_url TEXT;
BEGIN
  -- Validate inputs
  IF p_brand_name IS NULL OR p_brand_name = '' THEN
    RAISE EXCEPTION 'brand_name is required';
  END IF;

  IF p_country IS NULL OR p_country = '' THEN
    RAISE EXCEPTION 'country is required';
  END IF;

  -- Generate slug
  v_slug := lower(regexp_replace(p_brand_name, '[^a-z0-9]+', '-', 'gi'));
  v_file_path := v_slug || '.html';

  -- Call Edge Function to generate report
  -- (This is internal call, not subject to CDN)
  SELECT content INTO v_html_content
  FROM http((
    'POST',
    current_setting('app.settings.supabase_url') || '/functions/v1/onboarding-workflow',
    ARRAY[
      http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    json_build_object(
      'brand_name', p_brand_name,
      'country', p_country
    )::text
  )::http_request);

  -- Parse response
  v_html_content := (v_html_content::json)->>'html_content';

  IF v_html_content IS NULL THEN
    RAISE EXCEPTION 'Failed to generate report HTML';
  END IF;

  -- Save to Storage
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('reports', v_file_path, '{"content-type": "text/html"}')
  ON CONFLICT (bucket_id, name) DO UPDATE
  SET updated_at = now();

  -- Upload content (using storage.upload function)
  PERFORM storage.upload(
    'reports',
    v_file_path,
    decode(v_html_content, 'escape'),
    'text/html'
  );

  -- Generate public URL
  v_public_url := current_setting('app.settings.supabase_url') ||
                  '/storage/v1/object/public/reports/' || v_file_path;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'report_url', v_public_url,
    'slug', v_slug,
    'brand_name', p_brand_name,
    'country', p_country,
    'message', 'Report generated and saved successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
```

### Step 3: Call via REST API
```bash
curl -X POST 'https://vozjwptzutolvkvfpknk.supabase.co/rest/v1/rpc/generate_brand_report' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_ANON_KEY' \
  -d '{
    "p_brand_name": "Kata Oma",
    "p_country": "Indonesia"
  }'
```

**Response**:
```json
{
  "success": true,
  "report_url": "https://vozjwptzutolvkvfpknk.supabase.co/storage/v1/object/public/reports/kata-oma.html",
  "slug": "kata-oma",
  "brand_name": "Kata Oma",
  "country": "Indonesia",
  "message": "Report generated and saved successfully"
}
```

---

## ✅ **Why Option A is Better**

1. **NO CDN Caching**
   - Database functions = direct execution
   - REST API call = no Cloudflare CDN
   - Changes deploy instantly via migration

2. **Supabase Storage**
   - Built-in CDN (properly configured)
   - Public URLs
   - Version control
   - Easy to manage

3. **Same Ecosystem**
   - No need to add Vercel
   - All in Supabase
   - Simpler architecture

4. **Instant Deployment**
   - Migration = instant
   - No propagation delay
   - No cache invalidation needed

---

## 🎯 **DECISION**

**Mau pakai Option A (Supabase Database Functions)?**

Benefits:
- ✅ Fix CDN issue permanently
- ✅ Stay in Supabase
- ✅ Instant deployment
- ✅ 5-minute implementation

**Atau tetap Option B/C (Vercel)?**

Benefits:
- ✅ Separation of concerns
- ✅ Better for long-term scalability
- ✅ More control over frontend

**Pilih mana?**
