/**
 * GeoVera: Generate Synthetic Training Data
 *
 * PHASE 1 — Edge Function (FREE, ~30-60s):
 *   Perplexity  → brand deep research (visual identity, style, materials)
 *   Gemini Vision → analyze each real product image (colors, angles, details)
 *   Claude      → generate rich training captions + optimal training config
 *
 * PHASE 2 — Vast.ai RTX 3090 INSTANCE inference (~$0.002/img):
 *   Spin up 1× RTX 3090 (24GB VRAM, ~$0.30/hr)
 *   Install ComfyUI + download FLUX.1-dev (once per session)
 *   → generate 20 synthetic product images in 1 session (~7-10 min total)
 *   → upload each image to Supabase Storage during generation
 *   → auto-destroy instance when done
 *   → Gemini Vision scores each vs original (accept ≥70%, log quality)
 *
 * PHASE 3 — Automatic (via Storage Webhook):
 *   ZIP upload → lora-auto-trigger webhook fires → train-lora
 *   → Vast.ai TRAINING INSTANCE (H200/A100) spins up → pure training
 *   → auto-destroy after done
 *
 * POST body:
 * {
 *   slug: string,                    // e.g. "twc-gshock-dw5900"
 *   brand_name: string,              // e.g. "The Watch Co - G-Shock"
 *   image_urls: string[],            // real product images (min 3)
 *   trigger_word?: string,           // default: SLUG_PRODUCT
 *   country?: string,                // default: Indonesia
 *   product_type?: string,           // default: watch
 *   target_images?: number,          // synthetic count (default: 20)
 *   similarity_threshold?: number,   // min score 0-1 (default: 0.70)
 *   then_train?: boolean,            // auto-trigger training (default: true)
 * }
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAST_API_KEY       = Deno.env.get('VAST_API_KEY')!;
const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const HF_TOKEN           = Deno.env.get('HF_TOKEN') || '';
const PERPLEXITY_KEY     = Deno.env.get('PERPLEXITY_API_KEY')!;
const GEMINI_KEY         = Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GEMINI_API_KEY')!;
const ANTHROPIC_KEY      = Deno.env.get('ANTHROPIC_API_KEY')!;

// ════════════════════════════════════════════════════════════════
// VAST.AI GPU OFFER SEARCH — RTX 3090 (inference, cheap)
// ════════════════════════════════════════════════════════════════

interface VastOffer {
  id: number;
  gpu_name: string;
  gpu_ram: number;
  dph_total: number;
  cuda_max_good: number;
  reliability2: number;
}

// Inference GPU tiers: prefer cheapest 24GB GPU (3090 > 4090 > 3080 Ti > etc.)
const INFERENCE_GPU_TIERS: { keywords: string[]; label: string }[] = [
  { keywords: ['3090'],   label: 'RTX 3090' },
  { keywords: ['4090'],   label: 'RTX 4090' },
  { keywords: ['3080 ti', '3080ti'], label: 'RTX 3080 Ti' },
  { keywords: ['4080'],   label: 'RTX 4080' },
  { keywords: ['A5000'],  label: 'A5000' },
];

async function findInferenceGpuOffer(): Promise<VastOffer | null> {
  // RTX 3090: 24GB VRAM, runs FLUX.1-dev comfortably, ~$0.25-0.40/hr
  const query = {
    verified:      { eq: true },
    rentable:      { eq: true },
    cuda_max_good: { gte: 12.0 },
    gpu_ram:       { gte: 20000 },   // ≥20GB VRAM (3090 = 24GB)
    reliability2:  { gte: 0.85 },
    num_gpus:      { eq: 1 },
    dph_total:     { lte: 1.0 },     // max $1/hr — inference only needs cheap GPU
  };

  const queryStr = encodeURIComponent(JSON.stringify(query));
  const resp = await fetch(
    `https://console.vast.ai/api/v0/bundles/?q=${queryStr}&order=dph_total`,
    { headers: { 'Authorization': `Bearer ${VAST_API_KEY}` } }
  );

  if (!resp.ok) {
    console.error(`Vast.ai offer search failed: ${resp.status}`);
    return null;
  }

  const data = await resp.json();
  const offers: VastOffer[] = data.offers || [];
  if (offers.length === 0) return null;

  console.log(`   Found ${offers.length} GPU offers ≤$1/hr. Available: ${[...new Set(offers.map((o: VastOffer) => o.gpu_name))].slice(0, 6).join(', ')}`);

  // Try preferred tiers (cheapest 3090 first)
  for (const tier of INFERENCE_GPU_TIERS) {
    const match = offers.find((o: VastOffer) =>
      tier.keywords.some(kw => o.gpu_name.toLowerCase().includes(kw.toLowerCase()))
    );
    if (match) {
      console.log(`   ✓ Inference GPU [${tier.label}]: ${match.gpu_name} ${Math.round(match.gpu_ram / 1024)}GB @ $${match.dph_total.toFixed(2)}/hr`);
      return match;
    }
  }

  // Fallback: cheapest available ≥20GB
  const best = offers[0];
  console.log(`   ✓ Fallback GPU: ${best.gpu_name} ${Math.round(best.gpu_ram / 1024)}GB @ $${best.dph_total.toFixed(2)}/hr`);
  return best;
}

// ════════════════════════════════════════════════════════════════
// BUILD INFERENCE ONSTART SCRIPT — ComfyUI + FLUX.1-dev + generate all images
// ════════════════════════════════════════════════════════════════

function buildInferenceOnstartScript(params: {
  slug: string;
  prompts: string[];
  supabaseUrl: string;
  supabaseKey: string;
  hfToken: string;
  vastApiKey: string;
  callbackUrl: string;   // edge function URL to call when all images done
}): string {
  const { slug, prompts, supabaseUrl, supabaseKey, hfToken, vastApiKey, callbackUrl } = params;

  // Escape prompts for bash — wrap each in single quotes, escape single quotes inside
  const promptsJson = JSON.stringify(prompts).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  return [
    '#!/bin/bash',
    'set -e',
    'echo "[GeoVera Inference] Starting RTX 3090 synthetic image generation..."',
    '',
    '# ── Auto-destroy on exit (success OR failure) ──────────────────',
    'auto_destroy() {',
    '  EXIT_CODE=$?',
    '  echo "[GeoVera] Session done (exit: $EXIT_CODE). Destroying in 30s..."',
    '  sleep 30',
    `  curl -s -X DELETE "https://console.vast.ai/api/v0/instances/$\{VAST_INSTANCE_ID\}/" \\`,
    `    -H "Authorization: Bearer ${vastApiKey}" 2>/dev/null || true`,
    '  echo "[GeoVera] Instance destroyed."',
    '}',
    'trap auto_destroy EXIT',
    '',
    `export HF_TOKEN="${hfToken}"`,
    `export HUGGINGFACE_HUB_TOKEN="${hfToken}"`,
    `export SUPABASE_URL="${supabaseUrl}"`,
    `export SUPABASE_KEY="${supabaseKey}"`,
    `export SLUG="${slug}"`,
    `export CALLBACK_URL="${callbackUrl}"`,
    `export VAST_INSTANCE_ID="\${VAST_INSTANCE_ID:-}"`,
    `export VAST_API_KEY="${vastApiKey}"`,
    '',
    '# ── Install dependencies ─────────────────────────────────────────',
    'pip install requests comfy-cli 2>/dev/null || pip install requests 2>/dev/null || true',
    '',
    '# ── Setup ComfyUI ────────────────────────────────────────────────',
    'echo "[GeoVera] Setting up ComfyUI..."',
    'COMFY_DIR=/workspace/ComfyUI',
    'if [ ! -d "$COMFY_DIR" ]; then',
    '  git clone --depth=1 https://github.com/comfyanonymous/ComfyUI.git $COMFY_DIR',
    '  pip install -r $COMFY_DIR/requirements.txt --quiet',
    'fi',
    '',
    '# ── Download FLUX.1-dev model ─────────────────────────────────────',
    'MODEL_DIR=$COMFY_DIR/models/checkpoints',
    'MODEL_PATH=$MODEL_DIR/flux1-dev.safetensors',
    'mkdir -p $MODEL_DIR',
    'if [ ! -f "$MODEL_PATH" ]; then',
    '  echo "[GeoVera] Downloading FLUX.1-dev (~24GB)..."',
    '  huggingface-cli download black-forest-labs/FLUX.1-dev flux1-dev.safetensors \\',
    '    --local-dir $MODEL_DIR --local-dir-use-symlinks False 2>/dev/null || \\',
    `  wget -q --header="Authorization: Bearer ${hfToken}" \\`,
    '    "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/flux1-dev.safetensors" \\',
    '    -O $MODEL_PATH',
    '  echo "[GeoVera] FLUX.1-dev downloaded: $(du -sh $MODEL_PATH | cut -f1)"',
    'else',
    '  echo "[GeoVera] FLUX.1-dev already cached: $(du -sh $MODEL_PATH | cut -f1)"',
    'fi',
    '',
    '# Download FLUX VAE + CLIP if missing',
    'VAE_DIR=$COMFY_DIR/models/vae',
    'CLIP_DIR=$COMFY_DIR/models/clip',
    'mkdir -p $VAE_DIR $CLIP_DIR',
    'if [ ! -f "$VAE_DIR/ae.safetensors" ]; then',
    '  echo "[GeoVera] Downloading FLUX VAE..."',
    `  wget -q --header="Authorization: Bearer ${hfToken}" \\`,
    '    "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/ae.safetensors" \\',
    '    -O $VAE_DIR/ae.safetensors || true',
    'fi',
    'if [ ! -f "$CLIP_DIR/clip_l.safetensors" ]; then',
    '  echo "[GeoVera] Downloading CLIP models..."',
    '  wget -q "https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors" \\',
    '    -O $CLIP_DIR/clip_l.safetensors || true',
    '  wget -q "https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn.safetensors" \\',
    '    -O $CLIP_DIR/t5xxl_fp8_e4m3fn.safetensors || true',
    'fi',
    '',
    '# ── Start ComfyUI server ──────────────────────────────────────────',
    'echo "[GeoVera] Starting ComfyUI server..."',
    'cd $COMFY_DIR',
    'python main.py --listen 0.0.0.0 --port 8188 --disable-auto-launch &',
    'COMFY_PID=$!',
    '',
    '# Wait for ComfyUI to be ready',
    'echo "[GeoVera] Waiting for ComfyUI..."',
    'for i in $(seq 1 60); do',
    '  if curl -sf http://localhost:8188/system_stats >/dev/null 2>&1; then',
    '    echo "[GeoVera] ComfyUI ready after ${i}s"',
    '    break',
    '  fi',
    '  sleep 2',
    'done',
    '',
    '# ── Generate images via Python ────────────────────────────────────',
    'cat > /tmp/geovera_generate.py << \'PYEOF\'',
    'import os, sys, json, time, requests, base64, urllib.parse',
    '',
    'COMFY_URL = "http://localhost:8188"',
    'SUPABASE_URL = os.environ["SUPABASE_URL"]',
    'SUPABASE_KEY = os.environ["SUPABASE_KEY"]',
    'SLUG = os.environ["SLUG"]',
    'CALLBACK_URL = os.environ.get("CALLBACK_URL", "")',
    `PROMPTS = json.loads('${promptsJson}')`,
    '',
    'def log(msg):',
    '    print(f"[GeoVera Generate] {msg}", flush=True)',
    '',
    'def submit_workflow(prompt_text, seed):',
    '    workflow = {',
    '        "1": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["4", 1], "text": prompt_text}},',
    '        "2": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["4", 1], "text": "blurry, watermark, low quality, distorted, deformed"}},',
    '        "3": {"class_type": "KSampler", "inputs": {',
    '            "model": ["4", 0], "positive": ["1", 0], "negative": ["2", 0],',
    '            "latent_image": ["5", 0], "sampler_name": "euler", "scheduler": "simple",',
    '            "steps": 28, "cfg": 3.5, "denoise": 1.0, "seed": seed',
    '        }},',
    '        "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "flux1-dev.safetensors"}},',
    '        "5": {"class_type": "EmptyLatentImage", "inputs": {"width": 1024, "height": 1024, "batch_size": 1}},',
    '        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},',
    '        "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": f"synth_{seed}"}},',
    '    }',
    '    r = requests.post(f"{COMFY_URL}/prompt", json={"prompt": workflow}, timeout=30)',
    '    r.raise_for_status()',
    '    return r.json()["prompt_id"]',
    '',
    'def wait_for_image(prompt_id, timeout=120):',
    '    for _ in range(timeout // 2):',
    '        time.sleep(2)',
    '        r = requests.get(f"{COMFY_URL}/history/{prompt_id}", timeout=10)',
    '        if not r.ok: continue',
    '        hist = r.json().get(prompt_id, {})',
    '        for node_out in hist.get("outputs", {}).values():',
    '            imgs = node_out.get("images", [])',
    '            if imgs:',
    '                img = imgs[0]',
    '                url = f"{COMFY_URL}/view?filename={urllib.parse.quote(img[\"filename\"])}&type={img.get(\"type\",\"output\")}"',
    '                ir = requests.get(url, timeout=30)',
    '                if ir.ok: return ir.content',
    '    return None',
    '',
    'def upload_to_supabase(img_bytes, path):',
    '    r = requests.post(',
    '        f"{SUPABASE_URL}/storage/v1/object/report-images/{path}",',
    '        data=img_bytes,',
    '        headers={',
    '            "apikey": SUPABASE_KEY,',
    '            "Authorization": f"Bearer {SUPABASE_KEY}",',
    '            "Content-Type": "image/png",',
    '            "x-upsert": "true",',
    '        },',
    '        timeout=60,',
    '    )',
    '    return r.status_code in (200, 201)',
    '',
    'results = []',
    'import random',
    'for i, prompt in enumerate(PROMPTS):',
    '    seed = random.randint(1, 9999999)',
    '    log(f"[{i+1}/{len(PROMPTS)}] Generating: {prompt[:80]}...")',
    '    try:',
    '        pid = submit_workflow(prompt, seed)',
    '        img_bytes = wait_for_image(pid)',
    '        if not img_bytes:',
    '            log(f"  FAILED: timeout")',
    '            results.append({"index": i+1, "success": False, "error": "timeout"})',
    '            continue',
    '        storage_path = f"report-html/{SLUG}/synth_{str(i+1).zfill(2)}.png"',
    '        ok = upload_to_supabase(img_bytes, storage_path)',
    '        pub_url = f"{SUPABASE_URL}/storage/v1/object/public/report-images/{storage_path}"',
    '        log(f"  ✓ Done ({len(img_bytes)//1024}KB) → {pub_url}")',
    '        results.append({"index": i+1, "success": True, "url": pub_url, "prompt": prompt, "bytes": len(img_bytes)})',
    '    except Exception as e:',
    '        log(f"  FAILED: {e}")',
    '        results.append({"index": i+1, "success": False, "error": str(e)})',
    '',
    'success_count = sum(1 for r in results if r.get("success"))',
    'log(f"Complete: {success_count}/{len(PROMPTS)} images generated")',
    '',
    '# Call callback edge function with results',
    'if CALLBACK_URL:',
    '    try:',
    '        cb = requests.post(CALLBACK_URL, json={',
    '            "slug": SLUG,',
    '            "results": results,',
    '            "success_count": success_count,',
    '            "total": len(PROMPTS)',
    '        }, timeout=30)',
    '        log(f"Callback: {cb.status_code}")',
    '    except Exception as e:',
    '        log(f"Callback failed: {e}")',
    '',
    'sys.exit(0 if success_count >= len(PROMPTS) // 2 else 1)',
    'PYEOF',
    '',
    'echo "[GeoVera] Running image generation..."',
    'python3 /tmp/geovera_generate.py',
    'echo "[GeoVera] Generation complete."',
  ].join('\n');
}

// ════════════════════════════════════════════════════════════════
// SPIN UP RTX 3090 INFERENCE INSTANCE + WAIT FOR IMAGES
// ════════════════════════════════════════════════════════════════

async function createInferenceInstance(
  vastApiKey: string,
  offerId: number,
  onstart: string,
): Promise<{ instance_id: string } | null> {
  const resp = await fetch(
    `https://console.vast.ai/api/v0/asks/${offerId}/`,
    {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${vastApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image:           'pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime',
        disk:            40,           // 40GB: FLUX model ~24GB + ComfyUI + outputs
        onstart:         onstart,
        env:             { VAST_INSTANCE_ID: '' },  // patched after creation
        label:           'geovera-inference',
        jupyter:         false,
        direct:          true,
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Vast.ai create instance failed: ${resp.status} — ${text}`);
    return null;
  }

  const data = await resp.json();
  const instance_id = data.new_contract?.toString() || data.id?.toString() || null;
  if (!instance_id) {
    console.error('No instance_id in Vast.ai response:', JSON.stringify(data).substring(0, 200));
    return null;
  }

  // Patch VAST_INSTANCE_ID env var so auto-destroy works
  await fetch(`https://console.vast.ai/api/v0/instances/${instance_id}/`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${vastApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ env: { VAST_INSTANCE_ID: instance_id } }),
  });

  return { instance_id };
}

// ════════════════════════════════════════════════════════════════
// POLL SUPABASE STORAGE for generated synth images
// ════════════════════════════════════════════════════════════════

async function pollForSynthImages(
  slug: string,
  targetCount: number,
  timeoutMs: number = 600000,   // 10 min max
): Promise<Array<{ url: string; index: number }>> {
  const storageBase = `${SUPABASE_URL}/storage/v1/object/public/report-images`;
  const previewBase = `report-html/${slug}`;
  const collected: Array<{ url: string; index: number }> = [];
  const found = new Set<number>();

  const deadline = Date.now() + timeoutMs;
  console.log(`\n⏳ Polling Storage for ${targetCount} synth images (timeout: ${timeoutMs/60000}min)...`);

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 10000)); // check every 10s

    // List files in preview folder via Storage API
    const listResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/list/report-images`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: previewBase + '/', limit: 100 }),
      }
    );

    if (listResp.ok) {
      const files: Array<{ name: string }> = await listResp.json();
      for (const f of files) {
        const m = f.name.match(/synth_(\d+)\.png/);
        if (m) {
          const idx = parseInt(m[1]);
          if (!found.has(idx)) {
            found.add(idx);
            const url = `${storageBase}/${previewBase}/${f.name}`;
            collected.push({ url, index: idx });
            console.log(`  ✓ [${collected.length}/${targetCount}] synth_${String(idx).padStart(2,'0')}.png`);
          }
        }
      }
    }

    if (collected.length >= targetCount) break;

    const elapsed = Math.round((Date.now() - (deadline - timeoutMs)) / 1000);
    if (elapsed % 60 < 10) {
      console.log(`  Waiting... ${collected.length}/${targetCount} ready (${elapsed}s elapsed)`);
    }
  }

  return collected.sort((a, b) => a.index - b.index);
}

// ════════════════════════════════════════════════════════════════
// PHASE 1A — Perplexity: Brand Intelligence
// ════════════════════════════════════════════════════════════════

async function researchBrand(brandName: string, country: string, productType: string): Promise<string> {
  console.log(`\n🔍 [1A] Perplexity: researching ${brandName}...`);
  try {
    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: `Research brand "${brandName}" from ${country}. Focus ONLY on visual attributes for AI image generation:
1. Color palette: primary + secondary colors (hex codes)
2. Materials & textures: e.g. brushed steel, matte rubber, glossy ceramic
3. ${productType} design DNA: shapes, proportions, signature elements
4. Photography style: backgrounds, lighting, angles used in official photos
5. Brand mood: luxury/casual/sport/minimalist/bold

Be concise, visual, bullet points only.`,
        }],
        max_tokens: 600,
      }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const research = data.choices?.[0]?.message?.content || '';
    console.log(`  ✓ Research: ${research.length} chars`);
    return research;
  } catch (e) {
    console.warn(`  ⚠ Perplexity failed (${e}), using fallback`);
    return `${brandName} ${productType}, professional product photography, clean background, commercial style`;
  }
}

// ════════════════════════════════════════════════════════════════
// PHASE 1B — Gemini Vision: Analyze Real Product Images
// ════════════════════════════════════════════════════════════════

interface ImageAnalysis {
  url: string;
  colors: string[];
  materials: string[];
  angle: string;
  background: string;
  lighting: string;
  features: string[];
  quality: number;  // 0-1
  description: string;
}

async function analyzeImages(urls: string[]): Promise<ImageAnalysis[]> {
  console.log(`\n👁️  [1B] Gemini Vision: analyzing ${urls.length} images...`);
  const results: ImageAnalysis[] = [];

  for (let i = 0; i < urls.length; i++) {
    try {
      const imgResp = await fetch(urls[i], { signal: AbortSignal.timeout(15000) });
      if (!imgResp.ok) { console.warn(`  ✗ Image ${i+1}: fetch failed`); continue; }
      const buf = await imgResp.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const mime = imgResp.headers.get('content-type')?.split(';')[0] || 'image/jpeg';

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { inline_data: { mime_type: mime, data: b64 } },
              { text: `Analyze this product image for AI training. Return ONLY valid JSON:
{"colors":["#hex description"],"materials":["material1"],"angle":"view angle","background":"bg desc","lighting":"lighting desc","features":["unique feature1","feature2"],"quality":0.0-1.0,"description":"one detailed sentence for AI image generation"}` }
            ]}],
            generationConfig: { temperature: 0.1 },
          }),
        }
      );

      if (!resp.ok) { console.warn(`  ✗ Image ${i+1}: Gemini failed`); continue; }
      const gData = await resp.json();
      const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) { console.warn(`  ✗ Image ${i+1}: no JSON`); continue; }

      const analysis: ImageAnalysis = { url: urls[i], ...JSON.parse(match[0]) };
      if (analysis.quality >= 0.5) {
        results.push(analysis);
        console.log(`  ✓ Image ${i+1}: ${analysis.angle} | quality ${analysis.quality.toFixed(2)}`);
      } else {
        console.log(`  ✗ Image ${i+1}: quality too low (${analysis.quality.toFixed(2)})`);
      }
    } catch (e) {
      console.warn(`  ✗ Image ${i+1}: ${e}`);
    }
  }

  console.log(`  ✓ ${results.length}/${urls.length} images passed quality filter`);
  return results;
}

// ════════════════════════════════════════════════════════════════
// PHASE 1C — Claude: Captions + Training Config + Prompts
// ════════════════════════════════════════════════════════════════

interface TrainingPlan {
  captions: Array<{ url: string; caption: string }>;
  prompts: string[];       // inference prompts for FLUX synthetic generation
  config: {
    rank: number;
    steps: number;
    lr: number;
    caption_dropout: number;
  };
}

async function buildTrainingPlan(
  brandName: string,
  triggerWord: string,
  research: string,
  analyses: ImageAnalysis[],
  targetImages: number,
): Promise<TrainingPlan> {
  console.log(`\n🧠 [1C] Claude: building training plan...`);

  const imgSummary = analyses.map((a, i) =>
    `[${i+1}] ${a.angle} — ${a.description} | colors: ${a.colors.slice(0,3).join(', ')} | materials: ${a.materials.join(', ')}`
  ).join('\n');

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 6000,
        messages: [{
          role: 'user',
          content: `You are a FLUX LoRA training expert for product photography.

BRAND: ${brandName}
TRIGGER WORD: ${triggerWord}
REAL IMAGES: ${analyses.length}
TARGET SYNTHETIC: ${targetImages} images from EXACTLY ${targetImages} DIFFERENT ANGLES

BRAND RESEARCH:
${research.substring(0, 800)}

REAL IMAGE ANALYSES:
${imgSummary}

Generate EXACTLY ${targetImages} unique FLUX prompts, each from a DIFFERENT camera angle/scenario.
Required 20 angles (use ALL of these):
1. front view, white seamless background, studio lighting
2. back view, white seamless background, studio lighting
3. left side profile, white background
4. right side 3/4 angle, white background
5. top-down overhead, flat lay, white background
6. close-up dial/face detail, macro lens, shallow depth of field
7. close-up strap/band detail, macro lens
8. close-up clasp/buckle detail
9. close-up logo/branding detail
10. worn on wrist, lifestyle, neutral indoor background
11. worn on wrist, lifestyle, outdoor natural light
12. floating/levitating, white background, dramatic lighting
13. dark/moody background, spotlight effect, luxury feel
14. reflective surface (mirror/glass), artistic angle
15. side view inside open box, unboxing style
16. stacked/grouped with box and accessories
17. dramatic 45° angle, gradient background
18. low angle looking up, editorial style
19. soft natural window light, matte white background
20. hero shot, centered, perfect symmetry, white background

For each prompt: start with "${triggerWord}", include brand-specific colors/materials from research, be hyper-specific.
Similarity target: >95% visual match to original product.

Return ONLY valid JSON (no markdown, no backticks):
{
  "captions": [
    {"url": "<image url>", "caption": "${triggerWord}, <brand> <product>, <angle>, <exact colors>, <exact materials>, <lighting>, commercial product photography"}
  ],
  "prompts": [
    "${triggerWord}, ${brandName}, <angle 1 from list above>, <specific colors from research>, <specific materials>, studio lighting, sharp focus, 8k product photography",
    "<repeat for all ${targetImages} angles — MUST be exactly ${targetImages} items>"
  ],
  "config": {
    "rank": <32-64 for complex products, 16-32 for simple>,
    "steps": <scale: ${analyses.length + targetImages} total images × 50-70 steps per image, min 1500>,
    "lr": <0.0001-0.0003, lower = more detail preserved>,
    "caption_dropout": 0.05
  }
}`,
        }],
      }),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const text = data.content?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');

    const plan: TrainingPlan = JSON.parse(match[0]);
    console.log(`  ✓ ${plan.captions?.length} captions, ${plan.prompts?.length} prompts`);
    console.log(`  ✓ Config: rank=${plan.config.rank}, steps=${plan.config.steps}, lr=${plan.config.lr}`);
    return plan;

  } catch (e) {
    console.warn(`  ⚠ Claude failed (${e}), using fallback`);
    const angles = ['front view', 'back view', 'side profile', '3/4 angle', 'top down', 'close-up detail', 'macro shot', 'lifestyle'];
    const bgs = ['white background', 'light grey background', 'dark background', 'lifestyle setting'];
    return {
      captions: analyses.map((a) => ({
        url: a.url,
        caption: `${triggerWord}, ${brandName}, ${a.angle}, ${a.materials.join(' ')}, ${a.lighting}, professional product photography`,
      })),
      prompts: Array.from({ length: targetImages }, (_, i) =>
        `${triggerWord}, ${brandName}, ${angles[i % angles.length]}, ${bgs[i % bgs.length]}, studio lighting, sharp focus, commercial product photography`
      ),
      config: { rank: 32, steps: 1200, lr: 0.0002, caption_dropout: 0.05 },
    };
  }
}

// ════════════════════════════════════════════════════════════════
// PHASE 2 — RTX 3090 Instance: Generate all images in 1 session
// ════════════════════════════════════════════════════════════════

async function generateAllImagesViaInstance(
  slug: string,
  prompts: string[],
  analyses: ImageAnalysis[],
  similarityThreshold: number,
): Promise<Array<{ buf: ArrayBuffer; prompt: string; score: number; angle: string }>> {
  console.log(`\n🖥️  [2] Spinning up RTX 3090 for ${prompts.length} image generation...`);

  // Find cheapest RTX 3090 offer
  const offer = await findInferenceGpuOffer();
  if (!offer) {
    throw new Error('No inference GPU available on Vast.ai. Try again in a few minutes.');
  }

  // Build onstart script — ComfyUI + FLUX + generate all images
  const onstart = buildInferenceOnstartScript({
    slug,
    prompts,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_KEY,
    hfToken: HF_TOKEN,
    vastApiKey: VAST_API_KEY,
    callbackUrl: '',   // images uploaded to Storage; we poll instead
  });

  const instance = await createInferenceInstance(VAST_API_KEY, offer.id, onstart);
  if (!instance) {
    throw new Error('Failed to create Vast.ai inference instance');
  }

  console.log(`  ✅ Instance created: ${instance.instance_id}`);
  console.log(`  GPU: ${offer.gpu_name} @ $${offer.dph_total.toFixed(2)}/hr`);
  console.log(`  Estimated: ~8-12 min setup + ~${prompts.length * 12}s generation`);

  // Poll Storage for uploaded synth images (instance uploads each as it's done)
  const synthFiles = await pollForSynthImages(slug, prompts.length, 720000); // 12 min max

  if (synthFiles.length === 0) {
    throw new Error('No synthetic images generated — instance may have failed to start. Check Vast.ai dashboard.');
  }

  console.log(`\n  📥 Downloading + scoring ${synthFiles.length} synthetic images...`);

  // Download each image and run Gemini similarity scoring
  const results: Array<{ buf: ArrayBuffer; prompt: string; score: number; angle: string }> = [];

  for (const f of synthFiles) {
    try {
      const resp = await fetch(f.url, { signal: AbortSignal.timeout(30000) });
      if (!resp.ok) { console.warn(`  ✗ synth_${f.index}: download failed`); continue; }
      const buf = await resp.arrayBuffer();

      // Detect angle from prompt
      const prompt = prompts[f.index - 1] || prompts[0];
      const angle = detectAngle(prompt);

      // Gemini similarity scoring
      const { score, issues } = await scoreSimilarity(buf, analyses);
      const pct = (score * 100).toFixed(1);
      const pass = score >= similarityThreshold;
      console.log(`  ${pass ? '✅' : '⚠️ '} synth_${f.index} [${angle}]: ${pct}% similarity${issues.length ? ` — ${issues.join(', ')}` : ''}`);

      results.push({ buf, prompt, score, angle });
    } catch (e) {
      console.warn(`  ✗ synth_${f.index}: ${e}`);
    }
  }

  return results;
}

// Detect angle label from prompt text for logging/metadata
function detectAngle(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('front')) return 'front';
  if (p.includes('back')) return 'back';
  if (p.includes('side')) return 'side';
  if (p.includes('top') || p.includes('overhead') || p.includes('flat lay')) return 'overhead';
  if (p.includes('macro') || p.includes('close-up') || p.includes('detail')) return 'macro';
  if (p.includes('3/4') || p.includes('three quarter')) return '3/4';
  if (p.includes('lifestyle') || p.includes('wrist') || p.includes('worn')) return 'lifestyle';
  if (p.includes('unbox') || p.includes('packag')) return 'packaging';
  return 'angle';
}

// ════════════════════════════════════════════════════════════════
// PHASE 2B — Gemini: Similarity Scoring
// ════════════════════════════════════════════════════════════════

async function scoreSimilarity(
  synBuf: ArrayBuffer,
  references: ImageAnalysis[],
): Promise<{ score: number; issues: string[] }> {
  try {
    const b64 = btoa(String.fromCharCode(...new Uint8Array(synBuf)));
    const refDesc = references.slice(0, 3).map(r =>
      `${r.description} | colors: ${r.colors.slice(0,3).join(', ')} | materials: ${r.materials.join(', ')} | features: ${r.features.join(', ')}`
    ).join('\n');

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: 'image/png', data: b64 } },
            { text: `Score similarity of this synthetic image vs the original product.

ORIGINAL PRODUCT:
${refDesc}

Rate each 0.0-1.0:
- color_accuracy: do colors match?
- shape_accuracy: correct proportions/form?
- material_accuracy: textures look right?
- brand_fidelity: brand-specific features present?
- overall: would this pass as same product?

Return ONLY JSON: {"color_accuracy":0.0,"shape_accuracy":0.0,"material_accuracy":0.0,"brand_fidelity":0.0,"overall":0.0,"weighted_score":0.0,"issues":["issue1"]}` }
          ]}],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!resp.ok) return { score: 0.5, issues: ['scoring unavailable'] };
    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { score: 0.5, issues: ['parse error'] };
    const scores = JSON.parse(match[0]);
    return {
      score: scores.weighted_score || scores.overall || 0.5,
      issues: scores.issues || [],
    };
  } catch (e) {
    return { score: 0.5, issues: [String(e)] };
  }
}

// ════════════════════════════════════════════════════════════════
// PHASE 2C — Build ZIP + Upload to Storage
// (This upload triggers lora-auto-trigger webhook → training starts)
// ════════════════════════════════════════════════════════════════

async function uploadDatasetZip(
  slug: string,
  realImages: ImageAnalysis[],
  captions: Array<{ url: string; caption: string }>,
  synthImages: Array<{ buf: ArrayBuffer; prompt: string; score: number }>,
  config: TrainingPlan['config'],
  triggerWord: string,
): Promise<string | null> {
  console.log(`\n📦 [2C] Building dataset ZIP...`);

  const { default: JSZip } = await import('npm:jszip@3.10.1');
  const zip = new JSZip();
  let count = 0;

  // Add real images + AI captions
  for (let i = 0; i < realImages.length; i++) {
    try {
      const r = await fetch(realImages[i].url, { signal: AbortSignal.timeout(15000) });
      if (!r.ok) continue;
      const buf = await r.arrayBuffer();
      const ext = realImages[i].url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
      const name = `real_${String(i+1).padStart(2,'0')}`;
      const caption = captions.find(c => c.url === realImages[i].url)?.caption
        || `${triggerWord}, ${realImages[i].description}`;
      zip.file(`${name}.${ext}`, buf);
      zip.file(`${name}.txt`, caption);
      count++;
      console.log(`  ✓ real_${i+1}: ${caption.substring(0,70)}...`);
    } catch (e) { console.warn(`  ✗ real_${i+1}: ${e}`); }
  }

  // Add synthetic images + prompts as captions
  for (let i = 0; i < synthImages.length; i++) {
    const name = `synth_${String(i+1).padStart(2,'0')}`;
    zip.file(`${name}.png`, synthImages[i].buf);
    zip.file(`${name}.txt`, synthImages[i].prompt);
    count++;
    console.log(`  ✓ synth_${i+1} (score: ${(synthImages[i].score*100).toFixed(0)}%): ${synthImages[i].prompt.substring(0,70)}...`);
  }

  // dataset_metadata.json — training config embedded
  const avgScore = synthImages.reduce((s, img) => s + img.score, 0) / (synthImages.length || 1);
  zip.file('dataset_metadata.json', JSON.stringify({
    slug, trigger_word: triggerWord,
    total_images: count,
    real_images: realImages.length,
    synthetic_images: synthImages.length,
    avg_similarity_score: parseFloat((avgScore * 100).toFixed(1)),
    lora_config: config,
    generated_at: new Date().toISOString(),
    pipeline: 'perplexity+gemini+claude+flux-serverless',
  }, null, 2));

  // config_override.json — train.py will read this to use AI-optimized config
  zip.file('config_override.json', JSON.stringify({ lora_config: config }, null, 2));

  console.log(`  Compressing ${count} images...`);
  const zipBuf = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
  const zipMB = (zipBuf.byteLength / 1024 / 1024).toFixed(1);
  console.log(`  ZIP size: ${zipMB} MB`);

  // Upload → this triggers lora-auto-trigger webhook automatically!
  const path = `lora-training/${slug}/training-images.zip`;
  const uploadResp = await fetch(`${SUPABASE_URL}/storage/v1/object/report-images/${path}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/zip',
      'x-upsert': 'true',
    },
    body: zipBuf,
  });

  if (!uploadResp.ok) {
    console.error(`  ✗ Upload failed: ${uploadResp.status} — ${await uploadResp.text()}`);
    return null;
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/report-images/${path}`;
  console.log(`  ✅ Dataset uploaded! (${zipMB} MB)`);
  console.log(`  ✅ Storage webhook will auto-trigger training instance!`);
  return publicUrl;
}

// ════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ════════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const {
      slug, brand_name, image_urls = [],
      trigger_word, country = 'Indonesia', product_type = 'watch',
      target_images = 20, similarity_threshold = 0.95, then_train = false,  // default: preview first!
    } = await req.json();

    if (!slug || !brand_name) {
      return new Response(JSON.stringify({ success: false, error: 'slug and brand_name required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (image_urls.length < 1) {
      return new Response(JSON.stringify({ success: false, error: 'At least 1 image_url required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const triggerWord = trigger_word || `${slug.toUpperCase().replace(/[^A-Z0-9]/g,'_')}_PRODUCT`;

    console.log(`\n🚀 ══════ GeoVera Synthetic Data Pipeline ══════`);
    console.log(`   Brand:     ${brand_name} (${slug})`);
    console.log(`   Trigger:   ${triggerWord}`);
    console.log(`   Images:    ${image_urls.length} real → target ${target_images} synthetic`);
    console.log(`   Threshold: ${(similarity_threshold*100).toFixed(0)}% similarity (Gemini scored)`);
    console.log(`   Inference: RTX 3090 instance (24GB, ~$0.30/hr, auto-destroy)`);
    console.log(`   Training:  auto via Storage webhook (instance only when data ready!)`);

    // ── PHASE 1: AI Intelligence (FREE) ─────────────────────────────────────
    console.log(`\n━━━ PHASE 1: AI Intelligence (free) ━━━━━━━━━━`);

    const [research, analyses] = await Promise.all([
      researchBrand(brand_name, country, product_type),
      analyzeImages(image_urls),
    ]);

    if (analyses.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No images passed quality filter. Use clearer product photos.',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const plan = await buildTrainingPlan(brand_name, triggerWord, research, analyses, target_images);

    // Ensure exactly target_images prompts (pad or trim)
    while (plan.prompts.length < target_images) {
      const i = plan.prompts.length;
      plan.prompts.push(`${triggerWord}, ${brand_name}, angle ${i+1}, studio lighting, white background, product photography`);
    }
    plan.prompts = plan.prompts.slice(0, target_images);

    console.log(`\n✅ Phase 1 done: ${analyses.length} imgs analyzed, ${plan.prompts.length} prompts`);
    console.log(`   LoRA config: rank=${plan.config.rank}, steps=${plan.config.steps}, lr=${plan.config.lr}`);

    // ── PHASE 2: RTX 3090 Instance FLUX Inference ────────────────────────────
    console.log(`\n━━━ PHASE 2: RTX 3090 Inference (${target_images} angles) ━━`);

    let syntheticImages: Array<{ buf: ArrayBuffer; prompt: string; score: number; angle: string }> = [];

    try {
      syntheticImages = await generateAllImagesViaInstance(
        slug, plan.prompts, analyses, similarity_threshold
      );
    } catch (inferenceErr) {
      console.error(`Phase 2 inference failed: ${inferenceErr}`);
      return new Response(JSON.stringify({
        success: false,
        error: `Inference instance failed: ${inferenceErr}`,
        phase1_complete: true,
        prompts_ready: plan.prompts.length,
        hint: 'Check Vast.ai dashboard for instance logs. Retry in a few minutes.',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── GEMINI QUALITY CHECK ─────────────────────────────────────────────────
    const passing = syntheticImages.filter(img => img.score >= similarity_threshold);
    const avgScore = syntheticImages.reduce((s, img) => s + img.score, 0) / (syntheticImages.length || 1);
    const passRate = syntheticImages.length > 0 ? (passing.length / syntheticImages.length * 100).toFixed(1) : '0';

    console.log(`\n📊 Gemini Quality Report:`);
    console.log(`   Total generated: ${syntheticImages.length}/${target_images}`);
    console.log(`   Pass (≥${(similarity_threshold*100).toFixed(0)}%): ${passing.length} images (${passRate}%)`);
    console.log(`   Average similarity: ${(avgScore*100).toFixed(1)}%`);
    console.log(`   Angles covered: ${[...new Set(syntheticImages.map(i => i.angle))].join(', ')}`);

    // Log per-image breakdown
    syntheticImages.forEach((img, i) => {
      const flag = img.score >= similarity_threshold ? '✅' : img.score >= 0.70 ? '⚠️' : '❌';
      console.log(`   ${flag} [${i+1}] ${img.angle}: ${(img.score*100).toFixed(1)}%`);
    });

    // Images below 95% threshold → retry with tighter prompt on same instance
    const belowThreshold = syntheticImages.filter(img => img.score < similarity_threshold);
    if (belowThreshold.length > 0) {
      console.log(`\n🔄 ${belowThreshold.length} images below ${(similarity_threshold*100).toFixed(0)}% — retrying with enhanced prompts...`);

      // Build tighter prompts for failed images using Gemini issue feedback
      const retryPrompts = belowThreshold.map(img => {
        const issues = img.score < 0.80 ? ', highly detailed, photorealistic, exact color match' : ', sharp focus, precise product rendering';
        return `${img.prompt}${issues}, professional commercial photography, perfect fidelity`;
      });

      try {
        const retryResults = await generateAllImagesViaInstance(
          slug + '_retry',
          retryPrompts,
          analyses,
          similarity_threshold,
        );

        // Replace low-scoring images with retried versions where improved
        for (let i = 0; i < retryResults.length; i++) {
          const orig = belowThreshold[i];
          const retry = retryResults[i];
          if (retry && retry.score > orig.score) {
            const idx = syntheticImages.findIndex(img => img.prompt === orig.prompt);
            if (idx >= 0) {
              syntheticImages[idx] = retry;
              console.log(`  ✅ Retry improved [${orig.angle}]: ${(orig.score*100).toFixed(1)}% → ${(retry.score*100).toFixed(1)}%`);
            }
          } else if (retry) {
            console.log(`  ⚠️  Retry did not improve [${orig?.angle}]: ${(retry.score*100).toFixed(1)}% (kept original)`);
          }
        }
      } catch (retryErr) {
        console.warn(`  Retry instance failed (non-fatal): ${retryErr}`);
      }
    }

    // Final quality gate: accept images ≥70% (includes retried)
    const accepted = syntheticImages.filter(img => img.score >= 0.70);
    const finalPassing = syntheticImages.filter(img => img.score >= similarity_threshold);
    const finalAvg = syntheticImages.reduce((s, img) => s + img.score, 0) / (syntheticImages.length || 1);

    console.log(`\n📊 Final Quality after retries:`);
    console.log(`   Pass ≥${(similarity_threshold*100).toFixed(0)}%: ${finalPassing.length}/${syntheticImages.length} images`);
    console.log(`   Final avg similarity: ${(finalAvg*100).toFixed(1)}%`);

    if (accepted.length < 5) {
      return new Response(JSON.stringify({
        success: false,
        error: `Only ${accepted.length} images met minimum quality (≥70%) after retries.`,
        quality_report: {
          total_generated: syntheticImages.length,
          passing_95pct: finalPassing.length,
          passing_70pct: accepted.length,
          avg_similarity: `${(finalAvg*100).toFixed(1)}%`,
        },
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── Build preview gallery HTML ────────────────────────────────────────────
    const previewStorageBase = `${SUPABASE_URL}/storage/v1/object/public/report-images/report-html/${slug}`;
    const perImageReport = accepted.map((img, i) => ({
      index: i + 1,
      angle: img.angle,
      similarity_pct: parseFloat((img.score * 100).toFixed(1)),
      pass_95: img.score >= similarity_threshold,
      url: `${previewStorageBase}/synth_${String(i + 1).padStart(2, '0')}.png`,
      prompt_preview: img.prompt.substring(0, 100),
    }));

    // Upload Gemini quality report JSON to Storage for reference
    const reportJson = JSON.stringify({
      slug, brand_name, trigger_word: triggerWord,
      generated_at: new Date().toISOString(),
      real_images: analyses.length,
      synthetic_images: accepted.length,
      passing_95pct: finalPassing.length,
      avg_similarity: `${(finalAvg * 100).toFixed(1)}%`,
      lora_config: plan.config,
      images: perImageReport,
    }, null, 2);

    await fetch(`${SUPABASE_URL}/storage/v1/object/report-images/report-html/${slug}/quality-report.json`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json', 'x-upsert': 'true',
      },
      body: reportJson,
    });

    // If then_train=true (user explicitly approved), go ahead and build ZIP + start training
    if (then_train) {
      console.log(`\n━━━ PHASE 2C: Upload Dataset → Auto-trigger Training ━━`);

      const zipUrl = await uploadDatasetZip(
        slug, analyses, plan.captions, accepted, plan.config, triggerWord
      );

      if (!zipUrl) {
        return new Response(JSON.stringify({
          success: false, error: 'Failed to upload dataset ZIP',
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      console.log(`\n🎉 ══════ Pipeline Complete (Training Started) ══════`);
      console.log(`   ZIP: ${zipUrl}`);
      console.log(`   Total: ${analyses.length} real + ${accepted.length} synthetic`);
      console.log(`   Quality: ${finalPassing.length}/${accepted.length} passed ≥${(similarity_threshold*100).toFixed(0)}%`);

      return new Response(JSON.stringify({
        success: true,
        status: 'training_queued',
        slug,
        trigger_word: triggerWord,
        dataset_url: zipUrl,
        quality_report: {
          real_images: analyses.length,
          synthetic_accepted: accepted.length,
          passing_95pct: finalPassing.length,
          avg_similarity: `${(finalAvg * 100).toFixed(1)}%`,
          angles_covered: [...new Set(accepted.map(i => i.angle))],
          per_image: perImageReport,
          lora_config: plan.config,
        },
        pipeline_used: ['perplexity', 'gemini-vision', 'claude-20angles', 'vast-rtx3090-flux', 'gemini-scoring'],
        next_step: '🤖 Training auto-starts via Storage webhook → Vast.ai H200/A100',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Default: PREVIEW MODE — return gallery for user to check before training
    console.log(`\n🎉 ══════ Preview Ready — Awaiting Your Approval ══════`);
    console.log(`   Synthetic images: ${accepted.length} saved to report-html/${slug}/`);
    console.log(`   Quality: ${finalPassing.length}/${accepted.length} passed ≥${(similarity_threshold*100).toFixed(0)}%`);
    console.log(`   → Review images, then call with then_train=true to start training`);

    return new Response(JSON.stringify({
      success: true,
      status: 'preview_ready',
      slug,
      trigger_word: triggerWord,
      message: `✅ ${accepted.length} synthetic images generated & scored by Gemini. Review them, then approve training.`,
      quality_report: {
        real_images: analyses.length,
        synthetic_generated: syntheticImages.length,
        synthetic_accepted: accepted.length,
        passing_95pct: finalPassing.length,
        avg_similarity: `${(finalAvg * 100).toFixed(1)}%`,
        angles_covered: [...new Set(accepted.map(i => i.angle))],
        per_image: perImageReport,
        lora_config: plan.config,
      },
      preview_folder: `${previewStorageBase}/`,
      quality_report_url: `${previewStorageBase}/quality-report.json`,
      next_step: `📋 Review images at preview_folder, then POST with { slug, brand_name, image_urls, then_train: true } to start training`,
      pipeline_used: ['perplexity', 'gemini-vision', 'claude-20angles', 'vast-rtx3090-flux', 'gemini-similarity-scoring'],
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[generate-synthetic-data] Fatal:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
