import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import JSZip from "https://esm.sh/jszip@3.10.1";

/**
 * train-lora v3
 *
 * Trains a FLUX LoRA model on Fal.ai using product images.
 *
 * Image discovery pipeline (in order):
 *   1. Provided image_urls (from user upload or prior discovery)
 *   2. Gemini 2.0 Flash + Google Search grounding → finds product images by URL
 *   3. Verify URLs are accessible (HTTP 200 check + download)
 *   4. Create zip file from downloaded images → upload to Supabase Storage
 *   5. Pass zip URL to Fal.ai FLUX LoRA training
 *
 * Input:
 *   { slug, brand_name, image_urls?: string[], trigger_word?: string, country?: string }
 *
 * Output:
 *   { success, lora_weights_url, lora_id, trigger_word, images_used, cost_usd, status }
 *
 * Pricing: ~$2 per training run (1000 steps default)
 * Model: fal-ai/flux-lora-fast-training
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Gemini Image Discovery ────────────────────────────────────────────────

async function discoverImagesViaGemini(
  brandName: string,
  country: string,
  geminiKey: string,
): Promise<string[]> {
  console.log(`   🔍 Gemini Google Search: searching for ${brandName} product images...`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Search Google Images for "${brandName}" product photos in ${country}.

Find 10-15 direct image URLs (.jpg, .jpeg, .png, or .webp) of ${brandName} product packaging, bottles, or campaign images.
Look at: official brand website, e-commerce listings (Tokopedia, Shopee, Blibli), press releases, brand Instagram.

Return ONLY a JSON array of direct image file URLs (must end in .jpg/.jpeg/.png/.webp), nothing else:
["https://example.com/product.jpg", "https://cdn.tokopedia.com/image.png"]

Requirements:
- Must be direct image file URLs (not page URLs)
- Must end with image extension
- Must be from official or e-commerce sources (not social media thumbnails)
- Focus on clear product shots showing packaging/bottle`,
            }],
          }],
          tools: [{
            google_search: {},
          }],
          generation_config: {
            temperature: 0.1,
            max_output_tokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.warn(`   Gemini error: ${response.status} — ${err.substring(0, 200)}`);
      return [];
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`   Gemini response (${text.length} chars): ${text.substring(0, 200)}...`);

    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.warn('   No JSON array found in Gemini response');
      return [];
    }

    const urls: string[] = JSON.parse(jsonMatch[0]);
    const imageUrls = urls.filter(u =>
      typeof u === 'string' &&
      u.startsWith('http') &&
      /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u) &&
      !u.includes('favicon') &&
      !u.includes('icon')
    );

    console.log(`   ✓ Gemini found ${imageUrls.length} product image URLs`);
    return imageUrls;
  } catch (err) {
    console.warn(`   Gemini image search failed: ${err}`);
    return [];
  }
}

// ─── Download Images + Build Zip ───────────────────────────────────────────

async function downloadAndZipImages(
  urls: string[],
  supabaseUrl: string,
  supabaseServiceKey: string,
  slug: string,
): Promise<{ zipPublicUrl: string; downloadedCount: number } | null> {
  console.log(`   📦 Downloading ${urls.length} images and creating zip...`);

  const zip = new JSZip();
  const results: Array<{ idx: number; buffer: ArrayBuffer; ext: string }> = [];

  // Download sequentially to avoid race conditions and memory issues
  const targetUrls = urls.slice(0, 20);
  for (let idx = 0; idx < targetUrls.length; idx++) {
    const url = targetUrls[idx];
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GeoVera/1.0; image-collector)',
        },
        signal: AbortSignal.timeout(15000),
      });

      console.log(`   Image ${idx + 1}: status=${resp.status} content-type=${resp.headers.get('content-type')} url=${url.substring(0, 60)}`);

      if (!resp.ok) {
        console.warn(`   ✗ HTTP ${resp.status} for image ${idx + 1}`);
        continue;
      }

      const contentType = resp.headers.get('content-type') || '';
      const buffer = await resp.arrayBuffer();

      if (buffer.byteLength < 500) {
        console.warn(`   ✗ Image ${idx + 1} too small (${buffer.byteLength} bytes), skipping`);
        continue;
      }

      // Accept image/* or octet-stream (some CDNs don't set correct content-type)
      const isImage = contentType.startsWith('image/') ||
                      contentType === 'application/octet-stream' ||
                      contentType === '';

      // Determine extension from URL or content-type
      let ext = 'jpg';
      if (url.match(/\.png(\?|$)/i) || contentType.includes('png')) ext = 'png';
      else if (url.match(/\.webp(\?|$)/i) || contentType.includes('webp')) ext = 'webp';
      else if (url.match(/\.(jpg|jpeg)(\?|$)/i) || contentType.includes('jpeg')) ext = 'jpg';

      // Accept if content looks like an image (non-zero binary data)
      if (!isImage && buffer.byteLength < 100000 && contentType.includes('text')) {
        console.warn(`   ✗ Image ${idx + 1} appears to be text (${contentType}), skipping`);
        continue;
      }

      results.push({ idx, buffer, ext });
      console.log(`   ✓ Downloaded image ${idx + 1} (${Math.round(buffer.byteLength / 1024)}KB, ${ext})`);
    } catch (e) {
      console.warn(`   ✗ Failed to download image ${idx + 1}: ${e}`);
    }
  }

  const downloadedCount = results.length;

  if (downloadedCount < 4) {
    console.warn(`   ✗ Only downloaded ${downloadedCount} images — need ≥4`);
    return null;
  }

  // Add all downloaded images to zip
  for (const { idx, buffer, ext } of results) {
    zip.file(`image_${String(idx + 1).padStart(2, '0')}.${ext}`, buffer);
  }

  console.log(`   📦 Creating zip with ${downloadedCount} images...`);
  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
  const zipPath = `lora-training/${slug}/training-images.zip`;

  // Upload zip to Supabase Storage
  const uploadResp = await fetch(
    `${supabaseUrl}/storage/v1/object/report-images/${zipPath}`,
    {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/zip',
        'x-upsert': 'true',
      },
      body: zipBuffer,
    }
  );

  if (!uploadResp.ok) {
    const errText = await uploadResp.text();
    console.error(`   ✗ Failed to upload zip: ${errText.substring(0, 200)}`);
    return null;
  }

  const zipPublicUrl = `${supabaseUrl}/storage/v1/object/public/report-images/${zipPath}`;
  console.log(`   ✓ Zip uploaded: ${zipPublicUrl}`);
  return { zipPublicUrl, downloadedCount };
}

// ─── Main handler ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { slug, brand_name, image_urls, trigger_word, country, zip_url, force } = await req.json();

    if (!slug || !brand_name) {
      return new Response(JSON.stringify({
        success: false,
        error: 'slug and brand_name are required',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!FAL_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: 'FAL_API_KEY not configured',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const safeSlug = slug.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const loraTrigggerWord = trigger_word || `${safeSlug}_PRODUCT`;
    const brandCountry = country || 'Indonesia';

    console.log(`\n🎨 Starting LoRA training pipeline for: ${brand_name} (${slug})`);
    console.log(`   Trigger word: ${loraTrigggerWord}`);

    // ─── Safety check: Skip if LoRA already exists (prevents double billing) ──
    // Pass force=true to override and retrain anyway
    const existingMetaUrl = `${SUPABASE_URL}/storage/v1/object/public/report-images/lora-models/${slug}/metadata.json`;
    if (!force) try {
      const existingResp = await fetch(existingMetaUrl);
      if (existingResp.ok) {
        const existingMeta = await existingResp.json();
        if (existingMeta.status === 'ready' && existingMeta.lora_weights_url) {
          console.log(`   ✓ LoRA already exists for ${slug} — skipping training to avoid double billing`);
          return new Response(JSON.stringify({
            success: true,
            status: 'ready',
            lora_weights_url: existingMeta.lora_weights_url,
            lora_config_url: existingMeta.lora_config_url || null,
            lora_id: existingMeta.fal_request_id || null,
            trigger_word: existingMeta.trigger_word || loraTrigggerWord,
            images_used: existingMeta.images_used || 0,
            metadata_url: existingMetaUrl,
            cost_usd: 0,
            skipped: true,
            reason: 'LoRA already trained for this slug — reusing existing weights',
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (existingMeta.status === 'training' && existingMeta.fal_request_id) {
          console.log(`   ⏳ LoRA already in training for ${slug} (request_id: ${existingMeta.fal_request_id}) — skipping`);
          return new Response(JSON.stringify({
            success: true,
            status: 'training',
            lora_id: existingMeta.fal_request_id,
            trigger_word: existingMeta.trigger_word || loraTrigggerWord,
            metadata_url: existingMetaUrl,
            cost_usd: 0,
            skipped: true,
            reason: 'LoRA training already in progress — poll check-lora-status to get result',
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    } catch {
      // No existing LoRA — proceed with training
    }

    // ─── Step 1: Collect product image URLs ──────────────────────────────────
    let productImageUrls: string[] = [...(image_urls || [])];
    console.log(`   Provided URLs: ${productImageUrls.length}`);

    // Step 2: Gemini image search if not enough images
    if (productImageUrls.length < 4 && GEMINI_API_KEY) {
      const geminiImages = await discoverImagesViaGemini(brand_name, brandCountry, GEMINI_API_KEY);
      productImageUrls = [...productImageUrls, ...geminiImages];
    } else if (productImageUrls.length < 4) {
      console.log('   ℹ️ GEMINI_API_KEY not available for image discovery');
    }

    // Deduplicate
    productImageUrls = [...new Set(productImageUrls)].slice(0, 25);
    console.log(`   Total URLs to process: ${productImageUrls.length}`);

    if (productImageUrls.length < 4 && !zip_url) {
      return new Response(JSON.stringify({
        success: false,
        error: `Need ≥4 product image URLs for LoRA training. Found: ${productImageUrls.length}. Try uploading product photos manually.`,
        images_found: productImageUrls.length,
        suggestion: 'Upload product photos via onboarding → Step 3 (Product Photos)',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── Step 3: Download images + create zip (or use pre-uploaded zip) ───────
    let zipPublicUrl: string;
    let downloadedCount: number;

    if (zip_url) {
      // Direct zip URL provided — skip download step
      console.log(`\n📦 Using provided zip URL: ${zip_url}`);
      zipPublicUrl = zip_url;
      downloadedCount = productImageUrls.length || 12; // estimate
    } else {
      console.log(`\n📦 Building training zip...`);
      const zipResult = await downloadAndZipImages(
        productImageUrls,
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        slug,
      );

      if (!zipResult) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to download enough accessible product images (need ≥4). Images may be blocked or inaccessible.',
          suggestion: 'Upload product photos directly via onboarding → Step 3 (Product Photos)',
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      zipPublicUrl = zipResult.zipPublicUrl;
      downloadedCount = zipResult.downloadedCount;
    }
    console.log(`\n🎓 Starting Fal.ai FLUX LoRA training with ${downloadedCount} images...`);

    // ─── Step 4: Submit FLUX LoRA training to Fal.ai queue (async) ───────────
    // CRITICAL: ALWAYS use queue.fal.run (async), NEVER fal.run (sync).
    // Reason: training takes ~5min but Supabase edge limit is 150s.
    // fal.run (sync) sends request, waits for response — edge fn times out at 150s
    // but Fal.ai KEEPS RUNNING the job and CHARGES $2 even though we never got the response.
    // queue.fal.run submits job and returns request_id immediately (<10s) — no double billing risk.
    const falPayload = {
      images_data_url: zipPublicUrl,
      trigger_word: loraTrigggerWord,
      steps: 1000,
      learning_rate: 0.0004,
      lora_rank: 16,
      create_masks: true,
    };

    const falResponse = await fetch('https://queue.fal.run/fal-ai/flux-lora-fast-training', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(falPayload),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      console.error('Fal.ai queue error:', errText.substring(0, 300));
      return new Response(JSON.stringify({
        success: false,
        error: `Fal.ai training submission failed (${falResponse.status}): ${errText.substring(0, 200)}`,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const falData = await falResponse.json();
    console.log('   Fal.ai queue response:', JSON.stringify(falData).substring(0, 300));

    // Queue returns: { request_id, status, response_url, status_url, cancel_url }
    const requestId = falData.request_id || null;
    const loraWeightsUrl = falData.diffusers_lora_file?.url || null;
    const loraConfigUrl = falData.config_file?.url || null;
    const trainingStatus = loraWeightsUrl ? 'ready' : (requestId ? 'training' : 'failed');

    // ─── Step 5: Save metadata to Supabase Storage ───────────────────────────
    const loraMetadata = {
      slug,
      brand_name,
      trigger_word: loraTrigggerWord,
      lora_weights_url: loraWeightsUrl,
      lora_config_url: loraConfigUrl,
      fal_request_id: requestId,
      images_used: downloadedCount,
      image_urls: productImageUrls.slice(0, downloadedCount),
      trained_at: new Date().toISOString(),
      model: 'fal-ai/flux-lora-fast-training',
      status: trainingStatus,
    };

    const metadataPath = `lora-models/${slug}/metadata.json`;
    const saveResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/report-images/${metadataPath}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'x-upsert': 'true',
        },
        body: JSON.stringify(loraMetadata, null, 2),
      }
    );

    if (!saveResp.ok) {
      console.warn('Failed to save LoRA metadata:', await saveResp.text());
    }

    const metadataUrl = `${SUPABASE_URL}/storage/v1/object/public/report-images/${metadataPath}`;
    console.log(`   ✓ Status: ${trainingStatus}`);
    console.log(`   ✓ LoRA weights: ${loraWeightsUrl || requestId || 'N/A'}`);
    console.log(`   ✓ Metadata: ${metadataUrl}`);

    return new Response(JSON.stringify({
      success: true,
      status: trainingStatus,
      lora_weights_url: loraWeightsUrl,
      lora_config_url: loraConfigUrl,
      lora_id: requestId,
      trigger_word: loraTrigggerWord,
      images_used: downloadedCount,
      metadata_url: metadataUrl,
      cost_usd: 2.00,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[train-lora] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
