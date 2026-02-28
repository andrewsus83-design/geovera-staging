/**
 * GeoVera: image-to-synthetic (v2 — fire-and-forget)
 *
 * Takes 1 source image → generates 20 TikTok ad variations using FLUX on Vast.ai GPUs
 *
 * Architecture: Fire-and-forget + auto-destroy
 *   1. Gemini Vision → analyze source image (colors, face, materials, shape)
 *   2. Claude → generate 20 themed FLUX prompts
 *   3. Upload prompts JSON to Supabase Storage
 *   4. Spin up 2 Vast.ai GPU instances (10 images each, parallel)
 *   5. Return immediately with instance IDs + storage folder
 *   6. GPU instances auto-generate, upload to Storage, then self-destruct
 *
 * Total Edge Function time: ~40-80s (well within 150s limit)
 * Total GPU time: ~12-15min (runs async after response)
 *
 * POST body:
 * {
 *   slug: string,                  // campaign identifier
 *   image_url: string,             // 1 source image URL
 *   subject_type?: string,         // "product" | "person" | "model" (default: "product")
 *   brand_name?: string,           // brand or campaign name
 *   trigger_word?: string,         // LoRA trigger (default: SLUG uppercased)
 *   lora_url?: string,             // optional LoRA weights URL
 *   score_similarity?: boolean,    // Gemini quality check on GPU (default: false)
 *   webhook_url?: string,          // optional: POST results here when done
 * }
 *
 * Response (immediate):
 * {
 *   success: true,
 *   slug, trigger_word, subject_analysis,
 *   prompts: [...20 themed prompts],
 *   instance_ids: { batch1: "...", batch2: "..." },
 *   storage_folder: "https://...supabase.co/.../synthetic/{slug}/",
 *   status: "generating",
 *   hint: "Poll storage folder for theme_XX_*.png files. 20 total expected."
 * }
 *
 * Storage output:
 *   report-images/synthetic/{slug}/theme_01_luxury_lifestyle.png
 *   report-images/synthetic/{slug}/theme_02_neon_cyberpunk.png
 *   ... (20 total)
 *   report-images/synthetic/{slug}/_batch1_prompts.json
 *   report-images/synthetic/{slug}/_batch2_prompts.json
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAST_API_KEY   = Deno.env.get('VAST_API_KEY')!;
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const HF_TOKEN       = Deno.env.get('HF_TOKEN') || '';
const GEMINI_KEY     = Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GEMINI_API_KEY')!;

// ──────────────────────────────────────────────────────────────
// 20 TikTok Commercial Ad Themes — ID/label reference only
// Claude generates all creative details using the master_prompt SOP
// ──────────────────────────────────────────────────────────────

const THEME_REF = [
  { id: 'luxury_lifestyle', label: 'Luxury Lifestyle' },
  { id: 'neon_cyberpunk', label: 'Night Neon Cyberpunk' },
  { id: 'golden_hour', label: 'Golden Hour Outdoor' },
  { id: 'high_fashion_editorial', label: 'High-Fashion Studio Editorial' },
  { id: 'minimalist_white', label: 'Minimalist Premium White' },
  { id: 'dark_moody_dramatic', label: 'Moody Dark Dramatic' },
  { id: 'street_urban', label: 'Street Urban Aesthetic' },
  { id: 'coffee_cozy', label: 'Coffee Shop Cozy Vibe' },
  { id: 'executive_business', label: 'Executive Business Power' },
  { id: 'sporty_energetic', label: 'Sporty Energetic' },
  { id: 'rain_cinematic', label: 'Rain Cinematic Slow-Motion' },
  { id: 'rooftop_sunset', label: 'Rooftop Sunset Vibe' },
  { id: 'soft_romantic_pastel', label: 'Soft Romantic Pastel' },
  { id: 'futuristic_tech', label: 'Futuristic Tech Environment' },
  { id: 'black_white_classic', label: 'Black & White Classic' },
  { id: 'vibrant_gen_z', label: 'Vibrant Colorful Gen-Z' },
  { id: 'nature_adventure', label: 'Nature Adventure Aesthetic' },
  { id: 'home_comfort', label: 'Home Comfort Lifestyle' },
  { id: 'party_nightlife', label: 'Party Nightlife Vibe' },
  { id: 'ultra_luxury_spotlight', label: 'Ultra Luxury Dramatic Spotlight' },
];

// ──────────────────────────────────────────────────────────────
// Master Prompt SOP — from claude_tiktok_20_theme_master_prompt.json
// Claude uses this as system prompt to generate all creative details
// ──────────────────────────────────────────────────────────────

const MASTER_PROMPT_SOP = `You are a high-end commercial creative director and prompt engineer.

TASK:
Generate 20 different synthetic image concepts based on ONE uploaded source image.
The subject, face, and identity must remain consistent with the source image.
Do NOT change facial structure or identity.
Only modify environment, styling, wardrobe (if applicable), lighting, mood, and cinematic treatment.

GOAL:
Create 20 TikTok-ready commercial ad visuals.
Each must feel premium, cinematic, emotionally engaging, and scroll-stopping.

FORMAT:
For each of the 20 variations provide:

1. Theme Title
2. Creative Direction (short description)
3. Full Detailed Image Generation Prompt
4. Lighting Style
5. Camera & Lens Style
6. Mood & Color Grade
7. TikTok Ad Hook Context (why this works for TikTok)

GLOBAL REQUIREMENTS:
- Vertical 9:16 ratio
- Ultra high resolution
- Professional photography
- Cinematic lighting
- Depth of field
- Realistic skin texture
- Commercial fashion/editorial quality
- Strong foreground/background separation
- Natural color science
- Subtle film grain
- High dynamic range
- Clean composition
- Ad-ready aesthetic
- No distortion
- No weird hands
- No extra fingers
- No AI artifacts
- No low quality

Now create 20 themes including:

1. Luxury lifestyle
2. Night neon cyberpunk
3. Golden hour outdoor
4. High-fashion studio editorial
5. Minimalist premium white
6. Moody dark dramatic
7. Street urban aesthetic
8. Coffee shop cozy vibe
9. Executive business power
10. Sporty energetic
11. Rain cinematic slow-motion
12. Rooftop sunset vibe
13. Soft romantic pastel
14. Futuristic tech environment
15. Black & white classic
16. Vibrant colorful Gen-Z
17. Nature adventure aesthetic
18. Home comfort lifestyle
19. Party nightlife vibe
20. Ultra luxury dramatic spotlight

Make each concept visually distinct and emotionally different.
Push strong storytelling through lighting and ambience.
Focus on scroll-stopping TikTok ad energy.

Also optimize each concept for TikTok ad performance:

- Clear visual hierarchy
- Strong subject isolation
- Designed space for text overlay
- Instant emotional hook in first 1 second
- Background not too busy
- High contrast between subject and background
- Commercial realism (not fantasy unless specified)`;

// ──────────────────────────────────────────────────────────────
// STEP 1: Gemini Vision — Analyze Source Image
// ──────────────────────────────────────────────────────────────

interface SubjectAnalysis {
  subject_type: 'person' | 'product' | 'mixed';
  description: string;
  face_description?: string;
  skin_tone?: string;
  hair?: string;
  body_type?: string;
  age_appearance?: string;
  colors: string[];
  materials?: string[];
  shape?: string;
  key_features: string[];
  brand_elements?: string[];
  style: string;
  current_outfit?: string;
  background: string;
}

async function analyzeSourceImage(imageUrl: string, subjectType: string): Promise<SubjectAnalysis> {
  console.log(`\n[1/4] Gemini Vision: analyzing source image (type: ${subjectType})...`);

  const isPerson = subjectType === 'person' || subjectType === 'model';

  const personPrompt = `You are a professional AI creative director analyzing a source image for synthetic ad generation.
This image contains a PERSON/MODEL whose identity must remain CONSISTENT across all 20 variations.
CRITICAL: Capture face, skin, hair, and body description in extreme detail for identity preservation.

Return ONLY valid JSON (no markdown):
{
  "subject_type": "person",
  "description": "complete one-sentence description of person and current setup",
  "face_description": "detailed facial features: eye shape, nose, mouth, jawline, eyebrow shape, face shape",
  "skin_tone": "exact skin tone description with color reference",
  "hair": "hair color, length, texture, style",
  "body_type": "body build and proportions",
  "age_appearance": "apparent age range",
  "current_outfit": "detailed description of current clothing",
  "colors": ["dominant color 1", "dominant color 2"],
  "key_features": ["distinguishing feature 1", "feature 2"],
  "style": "luxury|casual|sport|professional|editorial",
  "background": "current background description"
}`;

  const productPrompt = `You are a product photography AI analyst. Analyze this product image in extreme detail for synthetic image generation.

Return ONLY valid JSON (no markdown):
{
  "subject_type": "product",
  "description": "detailed one-sentence product description for AI generation — include exact product type, color, material, size impression, brand name if visible",
  "colors": ["primary color with hex-like description", "secondary color"],
  "materials": ["material1 with texture description", "material2"],
  "shape": "form factor, proportions, silhouette description",
  "key_features": ["distinctive feature 1", "feature 2", "feature 3"],
  "brand_elements": ["logo placement and style", "brand signature details"],
  "style": "luxury|sport|casual|minimalist|bold",
  "background": "current background in image"
}`;

  try {
    console.log(`  Fetching image: ${imageUrl.substring(0, 100)}...`);
    const imgResp = await fetch(imageUrl, { signal: AbortSignal.timeout(20000) });
    if (!imgResp.ok) throw new Error(`Image fetch failed: ${imgResp.status} ${imgResp.statusText}`);

    const buf = await imgResp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    console.log(`  Image size: ${bytes.length} bytes (${(bytes.length / 1024).toFixed(0)}KB)`);

    // Chunked base64 encoding (avoids stack overflow on large images)
    let b64 = '';
    const CHUNK = 32768;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      b64 += String.fromCharCode(...bytes.subarray(i, Math.min(i + CHUNK, bytes.length)));
    }
    b64 = btoa(b64);

    const mime = imgResp.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
    console.log(`  Calling Gemini Vision (key: ${GEMINI_KEY ? GEMINI_KEY.substring(0, 8) + '...' : 'MISSING'})...`);

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mime, data: b64 } },
            { text: isPerson ? personPrompt : productPrompt },
          ] }],
          generationConfig: { temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(30000),
      },
    );

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => 'no body');
      throw new Error(`Gemini API: ${resp.status} ${resp.statusText} — ${errBody.substring(0, 300)}`);
    }
    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON in Gemini response: ${text.substring(0, 200)}`);

    const analysis: SubjectAnalysis = JSON.parse(match[0]);
    console.log(`  OK subject=${analysis.subject_type} | ${analysis.description.substring(0, 80)}`);
    return analysis;
  } catch (e) {
    console.error(`  Gemini FAILED: ${e}`);
    return {
      subject_type: isPerson ? 'person' : 'product',
      description: isPerson ? 'attractive person, model quality, professional appearance' : 'premium product, commercial quality',
      face_description: isPerson ? 'symmetrical features, natural expression' : undefined,
      skin_tone: isPerson ? 'natural warm skin tone' : undefined,
      hair: isPerson ? 'natural hair' : undefined,
      colors: ['natural tones'],
      key_features: ['professional quality'],
      style: 'minimalist',
      background: 'neutral background',
    };
  }
}

// ──────────────────────────────────────────────────────────────
// STEP 2: Claude — Generate 20 FLUX Prompts
// ──────────────────────────────────────────────────────────────

interface ThemePrompt {
  theme_id: string;
  theme_label: string;
  flux_prompt: string;
  negative_prompt: string;
  width: number;
  height: number;
}

async function generateThemePrompts(
  analysis: SubjectAnalysis,
  triggerWord: string,
  brandName: string,
  loraUrl: string | undefined,
): Promise<ThemePrompt[]> {
  console.log('\n[2/4] Gemini: generating 20 themed FLUX prompts via SOP master prompt...');

  const isPerson = analysis.subject_type === 'person';

  // Build subject reference from Gemini analysis
  const subjectRef = isPerson ? [
    `Subject Type: PERSON/MODEL`,
    `Full Description: ${analysis.description}`,
    `Face: ${analysis.face_description || 'natural symmetrical features'}`,
    `Skin Tone: ${analysis.skin_tone || 'natural'}`,
    `Hair: ${analysis.hair || 'natural hair'}`,
    `Body: ${analysis.body_type || 'standard build'}`,
    `Age: ${analysis.age_appearance || 'young adult'}`,
    `Current Outfit: ${analysis.current_outfit || 'casual outfit'}`,
  ].join('\n') : [
    `Subject Type: PRODUCT`,
    `Description: ${analysis.description}`,
    `Colors: ${analysis.colors.join(', ')}`,
    `Materials: ${(analysis.materials || []).join(', ')}`,
    `Form: ${analysis.shape || 'standard form'}`,
    `Key Features: ${analysis.key_features.join(', ')}`,
    `Brand Elements: ${(analysis.brand_elements || []).join(', ')}`,
  ].join('\n');

  const loraNote = loraUrl
    ? `\nLoRA model is active. Start EVERY prompt with trigger word "${triggerWord}" so FLUX renders the accurate subject.`
    : '';

  // Theme ID mapping for JSON output
  const themeIdList = THEME_REF.map((t, i) => `${i + 1}. theme_id: "${t.id}" | theme_label: "${t.label}"`).join('\n');

  const userPrompt = `SOURCE IMAGE ANALYSIS (from Gemini Vision):
${subjectRef}

TRIGGER WORD: "${triggerWord}"
BRAND/CAMPAIGN: "${brandName}"
${loraNote}

ADDITIONAL FLUX.1-dev PROMPT RULES:
- Each "Full Detailed Image Generation Prompt" must be 400-700 characters
- Start each prompt with trigger word "${triggerWord}"
- Include specific camera model, lens, aperture (e.g. "shot on Sony A7IV 85mm f/1.4")
- Include specific lighting description (source, quality, direction, color temp)
- Structure: Trigger Word + Subject + Environment + Lighting + Camera + Style + Quality tags

Use these exact theme_id values for the JSON output:
${themeIdList}

Return ONLY a valid JSON array (no markdown fences, no explanation):
[
  {
    "theme_id": "luxury_lifestyle",
    "theme_label": "Luxury Lifestyle",
    "flux_prompt": "full detailed FLUX.1-dev image generation prompt here (400-700 chars)",
    "negative_prompt": "blurry, watermark, low quality, distorted, deformed, extra fingers, weird hands, AI artifacts, ugly, low resolution"
  },
  ... (20 total)
]

CRITICAL: Return EXACTLY 20 items. Each flux_prompt must be a complete, standalone FLUX.1-dev prompt.`;

  try {
    console.log(`  Calling Gemini 2.0 Flash (key: ${GEMINI_KEY ? GEMINI_KEY.substring(0, 8) + '...' : 'MISSING'})...`);

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: MASTER_PROMPT_SOP }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16000,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(90000),
      },
    );

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => 'no body');
      throw new Error(`Gemini API: ${resp.status} ${resp.statusText} — ${errBody.substring(0, 300)}`);
    }
    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`  Gemini response length: ${text.length} chars`);

    // Try direct JSON parse first (responseMimeType: application/json), fallback to regex
    let parsed: Omit<ThemePrompt, 'width' | 'height'>[];
    try {
      const direct = JSON.parse(text);
      parsed = Array.isArray(direct) ? direct : [direct];
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error(`No JSON array in Gemini response: ${text.substring(0, 200)}`);
      parsed = JSON.parse(match[0]);
    }

    const prompts = parsed;
    const finalPrompts: ThemePrompt[] = prompts.map(p => ({
      ...p,
      width: 576,
      height: 1024,
    }));

    console.log(`  OK ${finalPrompts.length} prompts generated via SOP`);
    return finalPrompts;
  } catch (e) {
    console.error(`  Gemini prompt gen FAILED: ${e}`);
    console.warn('  Using fallback prompts');
    return THEME_REF.map(t => ({
      theme_id: t.id,
      theme_label: t.label,
      flux_prompt: isPerson
        ? `${triggerWord}, ${analysis.description}, ${analysis.face_description || ''}, ${t.label} theme, cinematic 9:16 vertical TikTok commercial photography, ultra-HD, photorealistic, professional lighting, depth of field, film grain`
        : `${triggerWord}, ${brandName}, ${analysis.description}, ${t.label} theme, commercial 9:16 vertical TikTok ad photography, ultra-HD, photorealistic, professional lighting, depth of field, film grain`,
      negative_prompt: 'blurry, watermark, low quality, distorted, deformed, extra fingers, weird hands, AI artifacts, ugly',
      width: 576,
      height: 1024,
    }));
  }
}

// ──────────────────────────────────────────────────────────────
// STEP 3: Upload prompts to Storage
// ──────────────────────────────────────────────────────────────

async function uploadPromptsJson(
  batch: ThemePrompt[],
  slug: string,
  batchName: string,
  indexOffset: number,
): Promise<string> {
  const jsonData = JSON.stringify(batch.map((t, i) => ({
    index: indexOffset + i + 1,
    theme_id: t.theme_id,
    theme_label: t.theme_label,
    prompt: t.flux_prompt,
    negative: t.negative_prompt,
    width: t.width,
    height: t.height,
  })));

  const path = `synthetic/${slug}/_${batchName}_prompts.json`;
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/report-images/${path}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body: jsonData,
  });
  if (!r.ok) throw new Error(`Upload ${batchName} prompts failed: ${r.status}`);
  const url = `${SUPABASE_URL}/storage/v1/object/public/report-images/${path}`;
  console.log(`  OK ${batchName}: ${url}`);
  return url;
}

// ──────────────────────────────────────────────────────────────
// STEP 4: Vast.ai GPU Instance — fire-and-forget
// ──────────────────────────────────────────────────────────────

interface VastOffer {
  id: number;
  gpu_name: string;
  gpu_ram: number;
  dph_total: number;
}

async function findGpuOffers(): Promise<VastOffer[]> {
  const query = {
    verified:      { eq: true },
    rentable:      { eq: true },
    cuda_max_good: { gte: 12.0 },
    gpu_ram:       { gte: 20000 },
    reliability2:  { gte: 0.85 },
    num_gpus:      { eq: 1 },
    dph_total:     { lte: 1.5 },
  };

  console.log(`  Vast.ai key: ${VAST_API_KEY ? VAST_API_KEY.substring(0, 8) + '...' : 'MISSING'}`);
  const queryStr = JSON.stringify(query);
  console.log(`  Query: ${queryStr}`);

  const resp = await fetch(
    `https://console.vast.ai/api/v0/bundles/?q=${encodeURIComponent(queryStr)}&order=dph_total`,
    { headers: { 'Authorization': `Bearer ${VAST_API_KEY}` }, signal: AbortSignal.timeout(15000) },
  );

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => 'no body');
    console.error(`  Vast.ai search FAILED: ${resp.status} ${resp.statusText} — ${errBody.substring(0, 300)}`);
    return [];
  }
  const { offers = [] } = await resp.json();
  console.log(`  Vast.ai returned ${offers.length} offers`);
  if (offers.length === 0) return [];

  console.log(`  Found ${offers.length} GPU offers. Available: ${[...new Set(offers.map((o: VastOffer) => o.gpu_name))].slice(0, 6).join(', ')}`);

  // Priority sort: fast GPUs first
  const tierOrder = ['4090', '3090', 'a6000', '4080', '3080 ti', 'a5000', '3080', 'a40', 'a100'];
  const sorted = [...offers].sort((a: VastOffer, b: VastOffer) => {
    const ai = tierOrder.findIndex(kw => a.gpu_name.toLowerCase().includes(kw));
    const bi = tierOrder.findIndex(kw => b.gpu_name.toLowerCase().includes(kw));
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.dph_total - b.dph_total;
  });

  return sorted;
}

function buildOnstartScript(params: {
  slug: string;
  promptsJsonUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  hfToken: string;
  vastApiKey: string;
  webhookUrl?: string;
  loraUrl?: string;
}): string {
  const { slug, promptsJsonUrl, supabaseUrl, supabaseKey, hfToken, vastApiKey, webhookUrl, loraUrl } = params;

  // Build LoRA download section if provided
  const loraSection = loraUrl ? [
    '# Download LoRA weights',
    `LORA_URL="${loraUrl}"`,
    'mkdir -p $COMFY/models/loras',
    'wget -q "$LORA_URL" -O $COMFY/models/loras/custom_lora.safetensors || echo "LoRA download failed (non-fatal)"',
    'LORA_FILE="custom_lora.safetensors"',
  ].join('\n') : 'LORA_FILE=""';

  // Build webhook section
  const webhookSection = webhookUrl ? [
    `WEBHOOK_URL="${webhookUrl}"`,
  ].join('\n') : 'WEBHOOK_URL=""';

  const lines = [
    '#!/bin/bash',
    '# NO set -e — we handle errors manually to avoid silent death',
    `echo "[GeoVera synth] Starting for slug=${slug}"`,
    '',
    '# Auto-destroy on exit',
    'auto_destroy() {',
    '  echo "[GeoVera] Destroying instance..."',
    '  sleep 30',
    `  curl -sf -X DELETE "https://console.vast.ai/api/v0/instances/$VAST_INSTANCE_ID/" -H "Authorization: Bearer ${vastApiKey}" || true`,
    '}',
    'trap auto_destroy EXIT',
    '',
    `export HF_TOKEN="${hfToken}"`,
    `export HUGGINGFACE_HUB_TOKEN="${hfToken}"`,
    `export SUPABASE_URL="${supabaseUrl}"`,
    `export SUPABASE_KEY="${supabaseKey}"`,
    `export SLUG="${slug}"`,
    `export VAST_API_KEY="${vastApiKey}"`,
    `export PROMPTS_URL="${promptsJsonUrl}"`,
    webhookSection,
    '',
    'echo "[GeoVera] Installing dependencies..."',
    'pip install requests -q 2>/dev/null || pip3 install requests -q 2>/dev/null || true',
    'apt-get update -qq && apt-get install -y -qq git wget curl 2>/dev/null || true',
    '',
    '# Setup ComfyUI',
    'COMFY=/workspace/ComfyUI',
    'if [ ! -d "$COMFY" ]; then',
    '  echo "[GeoVera] Cloning ComfyUI..."',
    '  git clone --depth=1 https://github.com/comfyanonymous/ComfyUI.git $COMFY || { echo "FATAL: git clone failed"; exit 1; }',
    'fi',
    'echo "[GeoVera] Installing ComfyUI requirements..."',
    'pip install -r $COMFY/requirements.txt -q 2>/dev/null || pip3 install -r $COMFY/requirements.txt -q 2>/dev/null || true',
    '',
    '# Download FLUX model (with retry)',
    'mkdir -p $COMFY/models/checkpoints $COMFY/models/vae $COMFY/models/clip $COMFY/models/loras',
    '',
    'download_hf() {',
    '  local url="$1" dest="$2" token="$3"',
    '  [ -f "$dest" ] && { echo "  Already exists: $dest"; return 0; }',
    '  echo "  Downloading: $dest"',
    '  for attempt in 1 2 3; do',
    '    if [ -n "$token" ]; then',
    '      wget -q --header="Authorization: Bearer $token" "$url" -O "$dest" && return 0',
    '    else',
    '      wget -q "$url" -O "$dest" && return 0',
    '    fi',
    '    echo "  Retry $attempt failed, waiting 5s..."',
    '    rm -f "$dest"',
    '    sleep 5',
    '  done',
    '  echo "  FAILED to download: $dest"',
    '  return 1',
    '}',
    '',
    'echo "[GeoVera] Downloading FLUX.1-dev model files (ungated sources)..."',
    'download_hf "https://huggingface.co/Comfy-Org/flux1-dev/resolve/main/flux1-dev-fp8.safetensors" "$COMFY/models/checkpoints/flux1-dev-fp8.safetensors" "" || { echo "FATAL: FLUX checkpoint download failed"; exit 1; }',
    'download_hf "https://huggingface.co/ffxvs/vae-flux/resolve/main/ae.safetensors" "$COMFY/models/vae/ae.safetensors" "" || echo "WARNING: VAE download failed (non-fatal)"',
    'download_hf "https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors" "$COMFY/models/clip/clip_l.safetensors" "" || echo "WARNING: clip_l download failed"',
    'download_hf "https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn.safetensors" "$COMFY/models/clip/t5xxl_fp8_e4m3fn.safetensors" "" || echo "WARNING: t5xxl download failed"',
    '',
    '# Verify critical file exists',
    '[ -f "$COMFY/models/checkpoints/flux1-dev-fp8.safetensors" ] || { echo "FATAL: flux1-dev-fp8.safetensors missing"; exit 1; }',
    'echo "[GeoVera] Model files ready. Checkpoint: $(du -h $COMFY/models/checkpoints/flux1-dev-fp8.safetensors | cut -f1)"',
    '',
    loraSection,
    '',
    '# Start ComfyUI server',
    'echo "[GeoVera] Starting ComfyUI server..."',
    'cd $COMFY && python main.py --listen 0.0.0.0 --port 8188 --disable-auto-launch &',
    'echo "[GeoVera] Waiting for ComfyUI to be ready..."',
    'for i in $(seq 1 120); do curl -sf http://localhost:8188/system_stats >/dev/null 2>&1 && break; sleep 2; done',
    'curl -sf http://localhost:8188/system_stats >/dev/null 2>&1 || { echo "FATAL: ComfyUI failed to start after 240s"; exit 1; }',
    'echo "[GeoVera] ComfyUI ready!"',
    '',
    '# Download prompts',
    'curl -sf "$PROMPTS_URL" -o /tmp/themes.json || { echo "FATAL: Failed to download prompts"; exit 1; }',
    'echo "[GeoVera] Prompts loaded: $(cat /tmp/themes.json | python3 -c \"import sys,json; print(len(json.load(sys.stdin)))\" 2>/dev/null || echo unknown) themes"',
    '',
    '# Generate images',
    'python3 - << \'PYEOF\'',
    'import os, sys, json, time, requests, random, urllib.parse',
    '',
    'COMFY = "http://localhost:8188"',
    'SB_URL = os.environ["SUPABASE_URL"]',
    'SB_KEY = os.environ["SUPABASE_KEY"]',
    'SLUG = os.environ["SLUG"]',
    'WEBHOOK_URL = os.environ.get("WEBHOOK_URL", "")',
    'LORA_FILE = os.environ.get("LORA_FILE", "")',
    'THEMES = json.load(open("/tmp/themes.json"))',
    '',
    'def log(m): print(f"[Synth] {m}", flush=True)',
    '',
    'def build_workflow(prompt, negative, seed, w, h):',
    '    wf = {',
    '        "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "flux1-dev-fp8.safetensors"}},',
    '        "1": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["4", 1], "text": prompt}},',
    '        "2": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["4", 1], "text": negative}},',
    '        "5": {"class_type": "EmptyLatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},',
    '        "3": {"class_type": "KSampler", "inputs": {',
    '            "model": ["4", 0], "positive": ["1", 0], "negative": ["2", 0],',
    '            "latent_image": ["5", 0], "sampler_name": "euler", "scheduler": "simple",',
    '            "steps": 28, "cfg": 3.5, "denoise": 1.0, "seed": seed',
    '        }},',
    '        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},',
    '        "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": f"synth_{seed}"}},',
    '    }',
    '    # Insert LoRA if available',
    '    if LORA_FILE:',
    '        wf["8"] = {"class_type": "LoraLoader", "inputs": {',
    '            "model": ["4", 0], "clip": ["4", 1],',
    '            "lora_name": LORA_FILE, "strength_model": 0.85, "strength_clip": 0.85',
    '        }}',
    '        wf["3"]["inputs"]["model"] = ["8", 0]',
    '        wf["1"]["inputs"]["clip"] = ["8", 1]',
    '        wf["2"]["inputs"]["clip"] = ["8", 1]',
    '    return wf',
    '',
    'def submit_prompt(wf):',
    '    r = requests.post(f"{COMFY}/prompt", json={"prompt": wf}, timeout=30)',
    '    return r.json()["prompt_id"]',
    '',
    'def wait_for_image(pid, timeout=180):',
    '    deadline = time.time() + timeout',
    '    while time.time() < deadline:',
    '        time.sleep(3)',
    '        try:',
    '            h = requests.get(f"{COMFY}/history/{pid}", timeout=10).json().get(pid, {})',
    '            for o in h.get("outputs", {}).values():',
    '                imgs = o.get("images", [])',
    '                if imgs:',
    '                    img = imgs[0]',
    '                    fn = urllib.parse.quote(img["filename"])',
    '                    sf = img.get("subfolder", "")',
    '                    tp = img.get("type", "output")',
    '                    r = requests.get(f"{COMFY}/view?filename={fn}&subfolder={sf}&type={tp}", timeout=60)',
    '                    if r.ok: return r.content',
    '        except: pass',
    '    return None',
    '',
    'def upload_to_storage(data, theme_id, idx):',
    '    path = f"synthetic/{SLUG}/theme_{str(idx).zfill(2)}_{theme_id}.png"',
    '    r = requests.post(',
    '        f"{SB_URL}/storage/v1/object/report-images/{path}",',
    '        data=data,',
    '        headers={',
    '            "apikey": SB_KEY,',
    '            "Authorization": f"Bearer {SB_KEY}",',
    '            "Content-Type": "image/png",',
    '            "x-upsert": "true",',
    '        },',
    '        timeout=60,',
    '    )',
    '    url = f"{SB_URL}/storage/v1/object/public/report-images/{path}"',
    '    return r.status_code in (200, 201), url',
    '',
    'results = []',
    'for t in THEMES:',
    '    idx = t["index"]',
    '    tid = t["theme_id"]',
    '    lbl = t["theme_label"]',
    '    w, h = t.get("width", 576), t.get("height", 1024)',
    '    seed = random.randint(1, 9999999)',
    '    log(f"[{idx}/20] {lbl} ({w}x{h})")',
    '    try:',
    '        wf = build_workflow(t["prompt"], t["negative"], seed, w, h)',
    '        pid = submit_prompt(wf)',
    '        log(f"  queued: {pid}")',
    '        img_data = wait_for_image(pid)',
    '        if not img_data:',
    '            results.append({"index": idx, "theme_id": tid, "success": False, "error": "timeout"})',
    '            continue',
    '        ok, url = upload_to_storage(img_data, tid, idx)',
    '        results.append({"index": idx, "theme_id": tid, "label": lbl, "success": ok, "url": url if ok else None})',
    '        log(f"  {"OK" if ok else "FAIL"}: {len(img_data)//1024}KB -> {url}")',
    '    except Exception as e:',
    '        log(f"  ERROR: {e}")',
    '        results.append({"index": idx, "theme_id": tid, "success": False, "error": str(e)})',
    '',
    '# Summary',
    'ok_count = sum(1 for r in results if r.get("success"))',
    'log(f"Done: {ok_count}/{len(THEMES)} images generated")',
    '',
    '# Upload results summary',
    'summary = {"slug": SLUG, "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"), "total": len(THEMES), "success": ok_count, "results": results}',
    'try:',
    '    requests.post(',
    '        f"{SB_URL}/storage/v1/object/report-images/synthetic/{SLUG}/_results.json",',
    '        json=summary,',
    '        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}", "Content-Type": "application/json", "x-upsert": "true"},',
    '        timeout=30,',
    '    )',
    '    log("Results JSON uploaded")',
    'except: pass',
    '',
    '# Send webhook if configured',
    'if WEBHOOK_URL:',
    '    try:',
    '        requests.post(WEBHOOK_URL, json=summary, timeout=30)',
    '        log(f"Webhook sent to {WEBHOOK_URL}")',
    '    except Exception as e:',
    '        log(f"Webhook failed: {e}")',
    '',
    'sys.exit(0 if ok_count >= len(THEMES) // 2 else 1)',
    'PYEOF',
    '',
    'echo "[GeoVera] All done."',
  ];

  return lines.join('\n');
}

// Stores last error for debugging
let lastCreateError = '';

async function createInstance(offerId: number, onstart: string, label: string): Promise<string | null> {
  const body = {
    image: 'pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime',
    disk: 50,
    onstart: onstart,
    label: label,
    jupyter: false,
    direct: true,
    env: { VAST_INSTANCE_ID: '' },
  };

  console.log(`  createInstance: PUT /asks/${offerId}/ (onstart=${onstart.length}B, label=${label})`);

  const resp = await fetch(`https://console.vast.ai/api/v0/asks/${offerId}/`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${VAST_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  const rawText = await resp.text();
  console.log(`  createInstance response: ${resp.status} ${resp.statusText} | body=${rawText.substring(0, 300)}`);

  if (!resp.ok) {
    lastCreateError = `${resp.status} ${resp.statusText}: ${rawText.substring(0, 500)}`;
    console.error(`  Create instance FAILED: ${lastCreateError}`);
    return null;
  }

  let data: Record<string, unknown>;
  try { data = JSON.parse(rawText); } catch (e) {
    console.error(`  JSON parse failed: ${e}`);
    return null;
  }

  const instanceId = (data.new_contract ?? data.id)?.toString() ?? null;
  if (!instanceId) {
    console.error(`  No instance ID in response: ${JSON.stringify(data).substring(0, 200)}`);
    return null;
  }

  // Patch VAST_INSTANCE_ID for auto-destroy
  try {
    await fetch(`https://console.vast.ai/api/v0/instances/${instanceId}/`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${VAST_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ env: { VAST_INSTANCE_ID: instanceId } }),
    });
  } catch {}

  console.log(`  OK instance ${instanceId} created`);
  return instanceId;
}

// ──────────────────────────────────────────────────────────────
// MAIN HANDLER
// ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const {
      slug,
      image_url,
      brand_name = 'Brand',
      subject_type = 'product',
      trigger_word,
      lora_url,
      score_similarity = false,
      webhook_url,
    } = await req.json();

    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: 'slug required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!image_url) {
      return new Response(JSON.stringify({ success: false, error: 'image_url required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const triggerWord = trigger_word || slug.toUpperCase().replace(/[^A-Z0-9]/g, '_');

    console.log('\n══════ GeoVera: 1 Image -> 20 TikTok Synthetic (fire-and-forget) ══════');
    console.log(`  Slug:    ${slug}`);
    console.log(`  Brand:   ${brand_name}`);
    console.log(`  Type:    ${subject_type}`);
    console.log(`  Trigger: ${triggerWord}`);
    console.log(`  Image:   ${image_url}`);
    console.log(`  LoRA:    ${lora_url || 'none'}`);
    console.log(`  Webhook: ${webhook_url || 'none'}`);

    // ── STEP 1: Gemini analyzes source image (~5-10s) ──
    const analysis = await analyzeSourceImage(image_url, subject_type);

    // ── STEP 2: Claude generates 20 themed prompts (~10-15s) ──
    const allPrompts = await generateThemePrompts(analysis, triggerWord, brand_name, lora_url);

    // Ensure exactly 20 prompts
    while (allPrompts.length < 20) {
      const t = THEME_REF[allPrompts.length % THEME_REF.length];
      allPrompts.push({
        theme_id: t.id,
        theme_label: t.label,
        flux_prompt: `${triggerWord}, ${brand_name}, ${analysis.description}, ${t.label} theme, cinematic 9:16 vertical TikTok commercial photography, ultra-HD, photorealistic, professional lighting, depth of field`,
        negative_prompt: 'blurry, watermark, low quality, distorted, deformed, AI artifacts',
        width: 576,
        height: 1024,
      });
    }
    const finalPrompts = allPrompts.slice(0, 20);

    console.log(`\n  20 prompts ready. Previews:`);
    finalPrompts.slice(0, 3).forEach((p, i) => console.log(`    ${i + 1}. [${p.theme_id}] ${p.flux_prompt.substring(0, 80)}...`));

    // ── STEP 3: Upload prompt batches to Storage (~2s) ──
    console.log('\n[3/4] Uploading prompts to Storage...');
    const batch1 = finalPrompts.slice(0, 10);
    const batch2 = finalPrompts.slice(10, 20);

    const [batch1Url, batch2Url] = await Promise.all([
      uploadPromptsJson(batch1, slug, 'batch1', 0),
      uploadPromptsJson(batch2, slug, 'batch2', 10),
    ]);

    // ── STEP 4: Spin up 2 GPU instances (fire-and-forget, ~10-20s) ──
    console.log('\n[4/4] Launching 2 GPU instances on Vast.ai...');
    const offers = await findGpuOffers();

    if (offers.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No GPU available on Vast.ai (>=20GB VRAM, <=$1.50/hr)',
        prompts: finalPrompts,
        analysis,
        hint: 'Prompts are ready. You can retry later or use prompts manually.',
      }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const sharedParams = {
      slug,
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_KEY,
      hfToken: HF_TOKEN,
      vastApiKey: VAST_API_KEY,
      webhookUrl: webhook_url,
      loraUrl: lora_url,
    };

    const onstart1 = buildOnstartScript({ ...sharedParams, promptsJsonUrl: batch1Url });
    const onstart2 = buildOnstartScript({ ...sharedParams, promptsJsonUrl: batch2Url });

    console.log(`  Onstart sizes: batch1=${onstart1.length}B, batch2=${onstart2.length}B`);

    // Vast.ai has 4048B onstart limit — upload full script to Storage, use tiny bootstrap
    const uploadScript = async (script: string, batchName: string): Promise<string> => {
      const path = `synthetic/${slug}/_${batchName}_onstart.sh`;
      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/report-images/${path}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'text/plain',
          'x-upsert': 'true',
        },
        body: script,
      });
      if (!r.ok) throw new Error(`Upload ${batchName} script failed: ${r.status}`);
      return `${SUPABASE_URL}/storage/v1/object/public/report-images/${path}`;
    };

    const [script1Url, script2Url] = await Promise.all([
      uploadScript(onstart1, 'batch1'),
      uploadScript(onstart2, 'batch2'),
    ]);
    console.log(`  Scripts uploaded: ${script1Url.substring(0, 80)}...`);

    // Tiny bootstrap that downloads and runs the full script (fits in 4048B limit)
    const makeBootstrap = (scriptUrl: string) =>
      `#!/bin/bash\ncurl -sfL '${scriptUrl}' -o /tmp/run.sh && chmod +x /tmp/run.sh && bash /tmp/run.sh`;

    const boot1 = makeBootstrap(script1Url);
    const boot2 = makeBootstrap(script2Url);
    console.log(`  Bootstrap sizes: batch1=${boot1.length}B, batch2=${boot2.length}B (limit 4048)`);

    // Try up to 5 offers per batch — collect error details
    const MAX_RETRIES = 5;
    const launchErrors: string[] = [];
    const launchInstance = async (bootstrap: string, label: string): Promise<string | null> => {
      for (let i = 0; i < Math.min(MAX_RETRIES, offers.length); i++) {
        const offer = offers[i];
        console.log(`  [${label}] Try ${i + 1}: offer_id=${offer.id} ${offer.gpu_name} (${offer.gpu_ram}MB VRAM, $${offer.dph_total.toFixed(2)}/hr)`);
        const id = await createInstance(offer.id, bootstrap, `geovera-synth-${slug}-${label}`);
        if (id) return id;
        launchErrors.push(`${label} try${i+1}: offer_id=${offer.id} ${offer.gpu_name} failed`);
      }
      return null;
    };

    const [instance1Id, instance2Id] = await Promise.all([
      launchInstance(boot1, 'batch1'),
      launchInstance(boot2, 'batch2'),
    ]);

    if (!instance1Id && !instance2Id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create GPU instances after multiple attempts',
        vast_debug: {
          offers_found: offers.length,
          top_offers: offers.slice(0, 5).map(o => ({ id: o.id, gpu: o.gpu_name, vram: o.gpu_ram, dph: o.dph_total })),
          launch_errors: launchErrors,
          last_api_error: lastCreateError,
          onstart_size: onstart1.length,
        },
        prompts: finalPrompts,
        analysis,
        hint: 'Prompts ready for manual use.',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const storageFolder = `${SUPABASE_URL}/storage/v1/object/public/report-images/synthetic/${slug}/`;
    const expectedCount = (instance1Id ? 10 : 0) + (instance2Id ? 10 : 0);

    console.log(`\n  Instance 1 (themes 1-10): ${instance1Id || 'FAILED'}`);
    console.log(`  Instance 2 (themes 11-20): ${instance2Id || 'FAILED'}`);
    console.log(`  Expected: ${expectedCount} images`);
    console.log(`  Est. time: ~10min setup + 5min generation = ~15min`);
    console.log(`  Storage:   ${storageFolder}`);
    console.log(`\n  DONE (fire-and-forget). GPU instances running async.\n`);

    return new Response(JSON.stringify({
      success: true,
      status: 'generating',
      slug,
      brand_name,
      subject_type,
      trigger_word: triggerWord,
      subject_analysis: {
        type: analysis.subject_type,
        description: analysis.description,
        colors: analysis.colors,
        key_features: analysis.key_features,
        face: analysis.face_description,
      },
      instance_ids: {
        batch1: instance1Id,
        batch2: instance2Id,
      },
      expected_images: expectedCount,
      storage_folder: storageFolder,
      results_json: `${storageFolder}_results.json`,
      prompts_urls: {
        batch1: batch1Url,
        batch2: batch2Url,
      },
      themes: finalPrompts.map(p => ({
        theme_id: p.theme_id,
        theme_label: p.theme_label,
        expected_file: `theme_${String(THEME_REF.findIndex(t => t.id === p.theme_id) + 1).padStart(2, '0')}_${p.theme_id}.png`,
        prompt_preview: p.flux_prompt.substring(0, 120) + '...',
      })),
      hint: `Images will appear in ${storageFolder} as theme_XX_*.png files. Poll _results.json for completion status. Est. ~15min.`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[image-to-synthetic] Error:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
