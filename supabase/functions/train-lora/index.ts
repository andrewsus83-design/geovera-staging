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

// ─── Shopify Auto-Discovery ────────────────────────────────────────────────
// For resellers/multi-brand stores: automatically finds the product with
// the MOST images (= best candidate for LoRA training) and returns all its angles.

interface ShopifyProduct {
  title: string;
  handle: string;
  images: Array<{ src: string }>;
}

async function discoverImagesViaShopify(
  shopifyStoreUrl: string,
  preferredProductHandle?: string,  // optional: target specific product
  maxProducts?: number,
): Promise<{ urls: string[]; productTitle: string; productHandle: string } | null> {
  console.log(`   🛍️  Shopify auto-discovery: ${shopifyStoreUrl}`);
  try {
    // Normalize store URL
    const base = shopifyStoreUrl.replace(/\/$/, '').replace(/^(?!https?:\/\/)/, 'https://');
    const apiUrl = `${base}/products.json?limit=${maxProducts || 250}`;

    const resp = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeoVera/1.0)' },
      signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) {
      console.warn(`   ✗ Shopify products.json failed: HTTP ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const products: ShopifyProduct[] = data.products || [];
    if (products.length === 0) return null;

    console.log(`   ✓ Found ${products.length} products in store`);

    let bestProduct: ShopifyProduct | null = null;

    // If a specific handle is requested, use that
    if (preferredProductHandle) {
      bestProduct = products.find(p => p.handle === preferredProductHandle) || null;
    }

    // Otherwise: pick product with the MOST images (best angle coverage)
    if (!bestProduct) {
      bestProduct = products.reduce((best, p) =>
        (p.images?.length || 0) > (best.images?.length || 0) ? p : best
      );
    }

    if (!bestProduct || !bestProduct.images?.length) return null;

    // Clean URLs: remove version params, get full resolution
    const urls = bestProduct.images.map(img => {
      let url = img.src;
      // Shopify CDN: remove _medium/_small/_thumb size suffixes for full res
      url = url.replace(/_(pico|icon|thumb|small|compact|medium|large|grande|1024x1024|2048x2048)(?=\.)/, '');
      // Remove version query param
      url = url.replace(/\?v=\d+$/, '');
      return url;
    }).filter(url => /\.(jpg|jpeg|png|webp)/i.test(url));

    console.log(`   ✓ Best product: "${bestProduct.title}" (${urls.length} images)`);
    return {
      urls,
      productTitle: bestProduct.title,
      productHandle: bestProduct.handle,
    };
  } catch (err) {
    console.warn(`   Shopify discovery failed: ${err}`);
    return null;
  }
}

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

// GPU preference tiers — higher tier = preferred first
// RTX 5090 (Blackwell, 32GB) → H200 → H100 → RTX 4090 → RTX 3090 → fallback any ≥20GB
const GPU_PREFERENCE_TIERS: { keywords: string[]; label: string }[] = [
  { keywords: ['5090'],               label: 'RTX 5090' },
  { keywords: ['H200'],               label: 'H200' },
  { keywords: ['H100'],               label: 'H100' },
  { keywords: ['A100'],               label: 'A100' },
  { keywords: ['4090'],               label: 'RTX 4090' },
  { keywords: ['3090'],               label: 'RTX 3090' },
  { keywords: ['4080'],               label: 'RTX 4080' },
];

async function findCheapestGpuOffer(
  vastApiKey: string,
  preferredGpu?: string,  // e.g. "RTX 5090", "H200" — overrides tier preference
): Promise<VastOffer | null> {
  // Search all available GPUs with ≥20GB VRAM, CUDA 12+, reliability ≥0.90
  const query = {
    verified: { eq: true },
    rentable: { eq: true },
    cuda_max_good: { gte: 12.0 },
    gpu_ram: { gte: 20000 },      // ≥20GB VRAM in MB (FLUX needs ~24GB)
    reliability2: { gte: 0.90 },
    num_gpus: { eq: 1 },
    dph_total: { lte: 5.0 },      // up to $5/hr (covers H200, RTX 5090)
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

  console.log(`   Found ${offers.length} GPU offers. Available: ${[...new Set(offers.map(o => o.gpu_name))].join(', ')}`);

  // If specific GPU requested, filter for it first
  if (preferredGpu) {
    const keyword = preferredGpu.toLowerCase();
    const preferred = offers.filter(o => o.gpu_name.toLowerCase().includes(keyword));
    if (preferred.length > 0) {
      const best = preferred[0]; // cheapest matching
      console.log(`   ✓ Using requested GPU: ${best.gpu_name} ${Math.round(best.gpu_ram / 1024)}GB @ $${best.dph_total.toFixed(2)}/hr`);
      return best;
    }
    console.warn(`   ⚠ Requested GPU "${preferredGpu}" not available — falling back to tier selection`);
  }

  // Otherwise use tier preference (RTX 5090 → H200 → H100 → ...)
  for (const tier of GPU_PREFERENCE_TIERS) {
    const match = offers.find(o =>
      tier.keywords.some(kw => o.gpu_name.toLowerCase().includes(kw.toLowerCase()))
    );
    if (match) {
      console.log(`   ✓ Best GPU offer [tier: ${tier.label}]: ${match.gpu_name} ${Math.round(match.gpu_ram / 1024)}GB @ $${match.dph_total.toFixed(2)}/hr (offer_id: ${match.id})`);
      return match;
    }
  }

  // Fallback: cheapest available
  const best = offers[0];
  console.log(`   ✓ Fallback GPU: ${best.gpu_name} ${Math.round(best.gpu_ram / 1024)}GB @ $${best.dph_total.toFixed(2)}/hr`);
  return best;
}

// ─── Script URLs in Supabase Storage (public, no auth needed) ────────────────
// Scripts are hosted in Supabase Storage to keep onstart small (< 1KB vs 20KB base64).
// To update: re-upload to report-images/scripts/ with x-upsert: true.
const SCRIPTS_BASE_URL = 'https://vozjwptzutolvkvfpknk.supabase.co/storage/v1/object/public/report-images/scripts';

// ─── Build onstart script for ostris/aitoolkit:latest ────────────────────────
// Downloads train.py + config from Supabase Storage at runtime — keeps onstart tiny.
// ai-toolkit is pre-installed at /workspace/ai-toolkit in ostris/aitoolkit image.

function buildOnstartScript(envVars: Record<string, string>): string {
  // Export env vars explicitly (Vast.ai sometimes doesn't pass them to onstart)
  const envExports = Object.entries(envVars)
    .map(([k, v]) => `export ${k}="${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
    .join('\n');

  const script = [
    '#!/bin/bash',
    'echo "[GeoVera] Starting LoRA training setup..."',
    '',
    '# Export all env vars (Vast.ai may not pass them to subprocesses)',
    envExports,
    '',
    '# ── Auto-destroy: always terminate instance after training (success OR failure)',
    '# This prevents idle billing if training crashes or finishes early.',
    'auto_destroy() {',
    '  EXIT_CODE=$?',
    '  echo "[GeoVera] Training finished (exit code: $EXIT_CODE). Destroying instance in 30s..."',
    '  sleep 30  # Give time for logs/webhook to flush',
    '  INSTANCE_ID=$(cat /proc/self/cgroup 2>/dev/null | grep -oP "(?<=docker-)[a-f0-9]+" | head -1 || echo "")',
    '  # Try Vast.ai self-destruct endpoint',
    '  curl -s -X DELETE "https://console.vast.ai/api/v0/instances/${VAST_INSTANCE_ID}/" \\',
    '    -H "Authorization: Bearer ${VAST_API_KEY}" 2>/dev/null || true',
    '  # Fallback: use vast CLI if available',
    '  vastai destroy instance ${VAST_INSTANCE_ID} 2>/dev/null || true',
    '  echo "[GeoVera] Destroy signal sent."',
    '}',
    'trap auto_destroy EXIT',
    '',
    '# Prevent set -e from killing the script before trap fires',
    'set -e',
    '',
    '# Install requests if not present',
    'pip install requests --quiet 2>/dev/null || true',
    '',
    '# Download train.py from Supabase Storage',
    'echo "[GeoVera] Downloading train.py..."',
    `curl -fsSL "${SCRIPTS_BASE_URL}/train.py" -o /tmp/geovera_train.py`,
    'chmod +x /tmp/geovera_train.py',
    '',
    '# Download config_template.yaml from Supabase Storage',
    'echo "[GeoVera] Downloading config_template.yaml..."',
    `curl -fsSL "${SCRIPTS_BASE_URL}/config_template.yaml" -o /tmp/config_template.yaml`,
    '',
    '# Find ai-toolkit run.py location in ostris/aitoolkit image',
    'AI_TOOLKIT_PATH=""',
    'for p in /workspace/ai-toolkit /app/ai-toolkit /root/ai-toolkit /ai-toolkit; do',
    '  if [ -f "$p/run.py" ]; then',
    '    AI_TOOLKIT_PATH=$p',
    '    echo "[GeoVera] Found ai-toolkit at: $p"',
    '    break',
    '  fi',
    'done',
    '',
    'if [ -z "$AI_TOOLKIT_PATH" ]; then',
    '  echo "[GeoVera] ERROR: ai-toolkit not found!"',
    '  find / -name "run.py" -path "*/ai-toolkit/*" 2>/dev/null | head -5',
    '  exit 1',
    'fi',
    '',
    'export AI_TOOLKIT_PATH=$AI_TOOLKIT_PATH',
    '',
    '# Run training (trap will auto-destroy instance when this exits)',
    'echo "[GeoVera] Starting training..."',
    'python3 /tmp/geovera_train.py',
    'echo "[GeoVera] Training script completed successfully."',
  ].join('\n');

  return script;
}

// ─── Vast.ai Instance Creation ────────────────────────────────────────────

async function createVastInstance(
  vastApiKey: string,
  offerId: number,
  envVars: Record<string, string>,
): Promise<{ instance_id: string } | null> {
  // Use ostris/aitoolkit:latest (official, 10GB, updated Jan 2026, 83K pulls)
  // Inject our train.py + config via onstart bash script (no custom Docker needed)
  const onstart = buildOnstartScript(envVars);

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
        image: 'ostris/aitoolkit:latest',  // Official ai-toolkit image, no custom Docker needed
        disk: 50,               // GB disk (FLUX model ~24GB + training data + output)
        env: envVars,
        onstart: onstart,
        runtype: 'ssh',         // ssh runtype supports onstart scripts properly
        image_login: null,
        label: `geovera-lora-${envVars.SLUG || 'training'}`,
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
    const {
      slug, brand_name, image_urls, trigger_word, country, zip_url, force,
      shopify_url,        // e.g. "https://thewatch.co" — auto-scrape best product
      product_handle,     // e.g. "g-shock-digital-black-resin-strap-46-8mm-men-dw-5900bb-1dr"
      preferred_gpu,      // e.g. "RTX 5090", "H200", "H100" — GPU preference for training
    } = await req.json();

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
    let discoveredProductTitle = brand_name;
    let discoveredProductHandle = '';
    console.log(`   Provided URLs: ${productImageUrls.length}`);

    // Priority 1: Shopify auto-discovery (best for resellers/multi-brand stores)
    if (shopify_url && productImageUrls.length < 4) {
      console.log(`\n🛍️  Shopify auto-discovery mode...`);
      const shopifyResult = await discoverImagesViaShopify(shopify_url, product_handle);
      if (shopifyResult && shopifyResult.urls.length >= 4) {
        productImageUrls = [...productImageUrls, ...shopifyResult.urls];
        discoveredProductTitle = shopifyResult.productTitle;
        discoveredProductHandle = shopifyResult.productHandle;
        console.log(`   ✓ Shopify: found ${shopifyResult.urls.length} images for "${shopifyResult.productTitle}"`);
      }
    }

    // Priority 2: Gemini web search fallback
    if (productImageUrls.length < 4 && GEMINI_API_KEY) {
      const geminiImages = await discoverImagesViaGemini(brand_name, brandCountry, GEMINI_API_KEY);
      productImageUrls = [...productImageUrls, ...geminiImages];
    }

    productImageUrls = [...new Set(productImageUrls)].slice(0, 25);

    if (productImageUrls.length < 4 && !zip_url) {
      return new Response(JSON.stringify({
        success: false,
        error: `Need ≥4 product image URLs. Found: ${productImageUrls.length}. Try passing shopify_url or image_urls directly.`,
        images_found: productImageUrls.length,
        tip: shopify_url
          ? `Shopify returned <4 images. Try passing product_handle to target a specific product.`
          : `Pass shopify_url to auto-discover images, or provide image_urls manually.`,
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
      const offer = await findCheapestGpuOffer(VAST_API_KEY!, preferred_gpu);
      if (!offer) {
        return new Response(JSON.stringify({
          success: false, error: 'No suitable GPU available on Vast.ai right now. Try again in a few minutes.',
        }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Webhook URL — called by train.py when training completes
      const webhookUrl = `${FUNCTION_BASE_URL}/lora-webhook?slug=${slug}&trigger_word=${encodeURIComponent(loraTrigggerWord)}`;

      // Create Vast.ai instance with training env vars
      // VAST_API_KEY + VAST_INSTANCE_ID passed so onstart script can self-destroy when done
      const instance = await createVastInstance(VAST_API_KEY!, offer.id, {
        ZIP_URL:          zipPublicUrl,
        TRIGGER_WORD:     loraTrigggerWord,
        SLUG:             slug,
        SUPABASE_URL:     SUPABASE_URL,
        SUPABASE_KEY:     SUPABASE_SERVICE_KEY,
        WEBHOOK_URL:      webhookUrl,
        HF_TOKEN:         HF_TOKEN,
        STEPS:            '1500',
        VAST_API_KEY:     VAST_API_KEY!,   // For auto-destroy after training
        VAST_INSTANCE_ID: '',              // Patched below after instance creation
      });

      if (!instance) {
        return new Response(JSON.stringify({
          success: false, error: 'Failed to create Vast.ai instance. Check VAST_API_KEY.',
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Patch VAST_INSTANCE_ID env var so the instance can self-destroy
      // (instance_id is only known after creation, so we update it via Vast.ai API)
      try {
        await fetch(
          `https://console.vast.ai/api/v0/instances/${instance.instance_id}/`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${VAST_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              env: { VAST_INSTANCE_ID: instance.instance_id },
            }),
          }
        );
        console.log(`   ✓ Patched VAST_INSTANCE_ID=${instance.instance_id} into instance env`);
      } catch (e) {
        console.warn(`   ⚠ Could not patch VAST_INSTANCE_ID: ${e} (auto-destroy may not work)`);
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
        trained_product: discoveredProductTitle !== brand_name ? discoveredProductTitle : undefined,
        product_handle: discoveredProductHandle || undefined,
        metadata_url: `${SUPABASE_URL}/storage/v1/object/public/report-images/lora-models/${slug}/metadata.json`,
        estimated_cost_usd: estimatedCost,
        note: 'Training in progress (~10-15 min). Poll check-lora-status or wait for webhook.',
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
