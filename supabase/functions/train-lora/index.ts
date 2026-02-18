import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import JSZip from "https://esm.sh/jszip@3.10.1";

/**
 * train-lora v4 — Vast.ai self-hosted GPU (replaces Fal.ai $2/run)
 *
 * Cost comparison:
 *   Before (Fal.ai):  $2.00/training × 167/month = $334/month
 *   After  (Vast.ai): ~$0.07/training × 167/month = $12/month (95% savings)
 *
 * How it works:
 *   1. Idempotency check — skip if LoRA already exists in Supabase Storage
 *   2. Collect + download product images → zip → upload to Supabase Storage
 *   3. Find cheapest available Vast.ai GPU offer (A100/H100, ≥24GB VRAM)
 *   4. Spin up Vast.ai instance with our Docker image (geovera/lora-trainer)
 *   5. Instance runs train.py → uploads weights to Supabase → self-destructs
 *   6. Return { status: "training", vast_instance_id }
 *   7. check-lora-status polls Supabase Storage for completed weights
 *
 * Input:
 *   { slug, brand_name, image_urls?, trigger_word?, country?, zip_url?, force? }
 *
 * Output:
 *   { success, status, vast_instance_id, trigger_word, images_used, cost_usd_estimate }
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
Requirements: must be direct image file URLs, must end with image extension, official/e-commerce sources only.`,
            }],
          }],
          tools: [{ google_search: {} }],
          generation_config: { temperature: 0.1, max_output_tokens: 1000 },
        }),
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) return [];
    const urls: string[] = JSON.parse(jsonMatch[0]);
    const imageUrls = urls.filter(u =>
      typeof u === 'string' && u.startsWith('http') &&
      /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u) &&
      !u.includes('favicon') && !u.includes('icon')
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

  const targetUrls = urls.slice(0, 20);
  for (let idx = 0; idx < targetUrls.length; idx++) {
    const url = targetUrls[idx];
    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeoVera/1.0; image-collector)' },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) { console.warn(`   ✗ HTTP ${resp.status} for image ${idx + 1}`); continue; }
      const contentType = resp.headers.get('content-type') || '';
      const buffer = await resp.arrayBuffer();
      if (buffer.byteLength < 500) { console.warn(`   ✗ Image ${idx + 1} too small (${buffer.byteLength} bytes)`); continue; }
      let ext = 'jpg';
      if (url.match(/\.png(\?|$)/i) || contentType.includes('png')) ext = 'png';
      else if (url.match(/\.webp(\?|$)/i) || contentType.includes('webp')) ext = 'webp';
      results.push({ idx, buffer, ext });
      console.log(`   ✓ Downloaded image ${idx + 1} (${Math.round(buffer.byteLength / 1024)}KB)`);
    } catch (e) {
      console.warn(`   ✗ Failed to download image ${idx + 1}: ${e}`);
    }
  }

  if (results.length < 4) {
    console.warn(`   ✗ Only downloaded ${results.length} images — need ≥4`);
    return null;
  }

  for (const { idx, buffer, ext } of results) {
    zip.file(`image_${String(idx + 1).padStart(2, '0')}.${ext}`, buffer);
  }

  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
  const zipPath = `lora-training/${slug}/training-images.zip`;
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
    console.error(`   ✗ Failed to upload zip: ${await uploadResp.text()}`);
    return null;
  }

  const zipPublicUrl = `${supabaseUrl}/storage/v1/object/public/report-images/${zipPath}`;
  console.log(`   ✓ Zip uploaded (${results.length} images): ${zipPublicUrl}`);
  return { zipPublicUrl, downloadedCount: results.length };
}

// ─── Vast.ai GPU Discovery ─────────────────────────────────────────────────

interface VastOffer {
  id: number;
  dph_total: number;       // $/hour total
  gpu_name: string;
  gpu_ram: number;         // MB
  num_gpus: number;
  cuda_max_good: number;
  reliability2: number;    // 0-1
  rentable: boolean;
}

async function findCheapestGpuOffer(vastApiKey: string): Promise<VastOffer | null> {
  // Search for cheapest GPU with ≥20GB VRAM that can run FLUX LoRA training
  // Requirements: CUDA 12+, ≥20GB VRAM, reliability ≥0.90
  const query = {
    verified: { eq: true },
    rentable: { eq: true },
    cuda_max_good: { gte: 12.0 },
    gpu_ram: { gte: 20000 },      // ≥20GB VRAM in MB
    reliability2: { gte: 0.90 },
    num_gpus: { eq: 1 },
    dph_total: { lte: 2.0 },      // max $2/hr to avoid expensive H100s
  };

  const queryStr = encodeURIComponent(JSON.stringify(query));
  const resp = await fetch(
    `https://console.vast.ai/api/v0/bundles/?q=${queryStr}&order=dph_total`,
    {
      headers: { 'Authorization': `Bearer ${vastApiKey}` },
    }
  );

  if (!resp.ok) {
    console.error(`Vast.ai offer search failed: ${resp.status} ${await resp.text()}`);
    return null;
  }

  const data = await resp.json();
  const offers: VastOffer[] = data.offers || [];

  if (offers.length === 0) {
    console.error('No Vast.ai GPU offers found matching requirements');
    return null;
  }

  // Pick cheapest reliable offer
  const best = offers[0];
  console.log(`   ✓ Best GPU offer: ${best.gpu_name} ${Math.round(best.gpu_ram / 1024)}GB @ $${best.dph_total.toFixed(2)}/hr (offer_id: ${best.id})`);
  return best;
}

// ─── Vast.ai Instance Creation ────────────────────────────────────────────

async function createVastInstance(
  vastApiKey: string,
  offerId: number,
  envVars: Record<string, string>,
): Promise<{ instance_id: string } | null> {
  // Create Vast.ai instance with our Docker image
  // The Docker CMD is "python3 /app/train.py" which reads env vars and runs training
  const resp = await fetch(
    `https://console.vast.ai/api/v0/asks/${offerId}/`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${vastApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 'me',
        image: 'geovera/lora-trainer:latest',
        disk: 40,               // GB disk (FLUX model is ~24GB, plus images/output)
        env: envVars,
        onstart: 'python3 /app/train.py',
        runtype: 'args',
        image_login: null,      // public Docker Hub image, no auth needed
        label: `geovera-lora-${envVars.SLUG || 'training'}`,
        extra_env: envVars,
      }),
    }
  );

  if (!resp.ok) {
    console.error(`Vast.ai instance creation failed: ${resp.status} ${await resp.text()}`);
    return null;
  }

  const data = await resp.json();
  const instanceId = data.new_contract || data.id || null;

  if (!instanceId) {
    console.error('Vast.ai returned no instance ID:', JSON.stringify(data).substring(0, 200));
    return null;
  }

  return { instance_id: String(instanceId) };
}

// ─── Main handler ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { slug, brand_name, image_urls, trigger_word, country, zip_url, force } = await req.json();

    if (!slug || !brand_name) {
      return new Response(JSON.stringify({ success: false, error: 'slug and brand_name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const VAST_API_KEY       = Deno.env.get('VAST_API_KEY');
    const GEMINI_API_KEY     = Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    const HF_TOKEN           = Deno.env.get('HF_TOKEN') || '';
    const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const FUNCTION_BASE_URL  = `${SUPABASE_URL}/functions/v1`;

    // Fallback to Fal.ai if Vast.ai not configured yet
    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    const useVastai = !!VAST_API_KEY;

    const safeSlug = slug.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const loraTrigggerWord = trigger_word || `${safeSlug}_PRODUCT`;
    const brandCountry = country || 'Indonesia';

    console.log(`\n🎨 LoRA training pipeline: ${brand_name} (${slug})`);
    console.log(`   Platform: ${useVastai ? 'Vast.ai (self-hosted ~$0.07/run)' : 'Fal.ai ($2.00/run)'}`);
    console.log(`   Trigger word: ${loraTrigggerWord}`);

    // ─── Idempotency check — skip if LoRA already exists ──────────────────────
    const existingMetaUrl = `${SUPABASE_URL}/storage/v1/object/public/report-images/lora-models/${slug}/metadata.json`;
    if (!force) {
      try {
        const existingResp = await fetch(existingMetaUrl);
        if (existingResp.ok) {
          const existingMeta = await existingResp.json();
          if (existingMeta.status === 'ready' && existingMeta.lora_weights_url) {
            console.log(`   ✓ LoRA already exists — skipping training (no cost)`);
            return new Response(JSON.stringify({
              success: true, status: 'ready',
              lora_weights_url: existingMeta.lora_weights_url,
              trigger_word: existingMeta.trigger_word || loraTrigggerWord,
              images_used: existingMeta.images_used || 0,
              metadata_url: existingMetaUrl,
              cost_usd: 0, skipped: true,
              reason: 'LoRA already trained — reusing existing weights',
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          if (existingMeta.status === 'training' && existingMeta.vast_instance_id) {
            console.log(`   ⏳ Training in progress (vast_instance_id: ${existingMeta.vast_instance_id})`);
            return new Response(JSON.stringify({
              success: true, status: 'training',
              vast_instance_id: existingMeta.vast_instance_id,
              trigger_word: existingMeta.trigger_word || loraTrigggerWord,
              metadata_url: existingMetaUrl,
              cost_usd: 0, skipped: true,
              reason: 'Training already in progress — poll check-lora-status',
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
      } catch { /* No existing LoRA — proceed */ }
    }

    // ─── Step 1: Collect product image URLs ────────────────────────────────────
    let productImageUrls: string[] = [...(image_urls || [])];
    console.log(`   Provided URLs: ${productImageUrls.length}`);

    if (productImageUrls.length < 4 && GEMINI_API_KEY) {
      const geminiImages = await discoverImagesViaGemini(brand_name, brandCountry, GEMINI_API_KEY);
      productImageUrls = [...productImageUrls, ...geminiImages];
    }

    productImageUrls = [...new Set(productImageUrls)].slice(0, 25);

    if (productImageUrls.length < 4 && !zip_url) {
      return new Response(JSON.stringify({
        success: false,
        error: `Need ≥4 product image URLs. Found: ${productImageUrls.length}. Upload product photos manually.`,
        images_found: productImageUrls.length,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── Step 2: Download images + create zip ──────────────────────────────────
    let zipPublicUrl: string;
    let downloadedCount: number;

    if (zip_url) {
      console.log(`\n📦 Using provided zip URL: ${zip_url}`);
      zipPublicUrl = zip_url;
      downloadedCount = productImageUrls.length || 5;
    } else {
      const zipResult = await downloadAndZipImages(productImageUrls, SUPABASE_URL, SUPABASE_SERVICE_KEY, slug);
      if (!zipResult) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to download enough product images (need ≥4). Try uploading photos directly.',
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      zipPublicUrl = zipResult.zipPublicUrl;
      downloadedCount = zipResult.downloadedCount;
    }

    // ─── Step 3: Submit training ────────────────────────────────────────────────
    if (useVastai) {
      // ── Vast.ai path (self-hosted, ~$0.07/run) ────────────────────────────────
      console.log(`\n🚀 Submitting to Vast.ai (self-hosted GPU)...`);

      // Find cheapest available GPU
      const offer = await findCheapestGpuOffer(VAST_API_KEY!);
      if (!offer) {
        return new Response(JSON.stringify({
          success: false, error: 'No suitable GPU available on Vast.ai right now. Try again in a few minutes.',
        }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Webhook URL — called by train.py when training completes
      const webhookUrl = `${FUNCTION_BASE_URL}/lora-webhook?slug=${slug}&trigger_word=${encodeURIComponent(loraTrigggerWord)}`;

      // Create Vast.ai instance with training env vars
      const instance = await createVastInstance(VAST_API_KEY!, offer.id, {
        ZIP_URL:       zipPublicUrl,
        TRIGGER_WORD:  loraTrigggerWord,
        SLUG:          slug,
        SUPABASE_URL:  SUPABASE_URL,
        SUPABASE_KEY:  SUPABASE_SERVICE_KEY,
        WEBHOOK_URL:   webhookUrl,
        HF_TOKEN:      HF_TOKEN,
        STEPS:         '1000',
      });

      if (!instance) {
        return new Response(JSON.stringify({
          success: false, error: 'Failed to create Vast.ai instance. Check VAST_API_KEY.',
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Save metadata with vast_instance_id for polling
      const estimatedCost = offer.dph_total * (8 / 60); // ~8 min training
      const loraMetadata = {
        slug, brand_name,
        trigger_word: loraTrigggerWord,
        vast_instance_id: instance.instance_id,
        vast_offer_id: offer.id,
        vast_gpu: offer.gpu_name,
        vast_gpu_ram_gb: Math.round(offer.gpu_ram / 1024),
        images_used: downloadedCount,
        zip_url: zipPublicUrl,
        training_started_at: new Date().toISOString(),
        model: 'ostris/ai-toolkit (FLUX.1-dev)',
        training_platform: 'vast.ai',
        status: 'training',
        estimated_cost_usd: estimatedCost,
      };

      await fetch(
        `${SUPABASE_URL}/storage/v1/object/report-images/lora-models/${slug}/metadata.json`,
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

      console.log(`   ✓ Vast.ai instance created: ${instance.instance_id}`);
      console.log(`   ✓ GPU: ${offer.gpu_name} @ $${offer.dph_total.toFixed(2)}/hr`);
      console.log(`   ✓ Estimated cost: ~$${estimatedCost.toFixed(2)} (8 min training)`);

      return new Response(JSON.stringify({
        success: true,
        status: 'training',
        platform: 'vast.ai',
        vast_instance_id: instance.instance_id,
        gpu: offer.gpu_name,
        trigger_word: loraTrigggerWord,
        images_used: downloadedCount,
        metadata_url: `${SUPABASE_URL}/storage/v1/object/public/report-images/lora-models/${slug}/metadata.json`,
        estimated_cost_usd: estimatedCost,
        note: 'Training in progress (~5-10 min). Poll check-lora-status or wait for webhook.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else {
      // ── Fal.ai fallback (when VAST_API_KEY not configured) ───────────────────
      if (!FAL_API_KEY) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Neither VAST_API_KEY nor FAL_API_KEY is configured. Set one to enable training.',
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      console.log(`\n🎓 Submitting to Fal.ai FLUX LoRA training (${downloadedCount} images)...`);
      // CRITICAL: ALWAYS use queue.fal.run (async), NEVER fal.run (sync).
      const falResponse = await fetch('https://queue.fal.run/fal-ai/flux-lora-fast-training', {
        method: 'POST',
        headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images_data_url: zipPublicUrl,
          trigger_word: loraTrigggerWord,
          steps: 1000,
          learning_rate: 0.0004,
          lora_rank: 16,
          create_masks: true,
        }),
      });

      if (!falResponse.ok) {
        const errText = await falResponse.text();
        return new Response(JSON.stringify({
          success: false,
          error: `Fal.ai training failed (${falResponse.status}): ${errText.substring(0, 200)}`,
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const falData = await falResponse.json();
      const requestId = falData.request_id || null;
      const loraWeightsUrl = falData.diffusers_lora_file?.url || null;
      const status = loraWeightsUrl ? 'ready' : (requestId ? 'training' : 'failed');

      await fetch(
        `${SUPABASE_URL}/storage/v1/object/report-images/lora-models/${slug}/metadata.json`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json', 'x-upsert': 'true',
          },
          body: JSON.stringify({
            slug, brand_name, trigger_word: loraTrigggerWord,
            lora_weights_url: loraWeightsUrl, fal_request_id: requestId,
            images_used: downloadedCount, trained_at: new Date().toISOString(),
            model: 'fal-ai/flux-lora-fast-training', status,
          }, null, 2),
        }
      );

      return new Response(JSON.stringify({
        success: true, status,
        platform: 'fal.ai',
        lora_id: requestId,
        lora_weights_url: loraWeightsUrl,
        trigger_word: loraTrigggerWord,
        images_used: downloadedCount,
        cost_usd: 2.00,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('[train-lora] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
