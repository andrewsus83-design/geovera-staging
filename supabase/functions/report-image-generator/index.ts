import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * report-image-generator v3 — FLUX Pro only (no DALL-E)
 *
 * Generates 6 images — one per major report section — using Fal.ai FLUX Pro.
 *
 * Two modes:
 *   A) No LoRA: FLUX Pro standard with editorial/documentary prompts
 *      (human scenes + abstract minimal — no product shots)
 *   B) LoRA trained: FLUX Pro + LoRA weights for accurate product renders
 *      (product shots for product sections, editorial for context sections)
 *
 * Auto-discovery pipeline:
 *   1. Extract image URLs from visual_research text
 *   2. If <4 found, Perplexity image search for brand product photos
 *   3. If ≥4 total: trigger LoRA training (fire-and-forget, ~$2)
 *   4. Current report uses FLUX standard; next report uses LoRA
 *
 * Input:  { slug, brand_name, report_markdown, visual_research, country, product_photo_urls? }
 * Output: { success, images, report_url, lora_training_started, engine }
 */

interface SectionData {
  sectionNum: string;
  title: string;
  excerpt: string;
  htmlMarker: string;
}

interface ImageSpec {
  sectionNum: string;
  sectionTitle: string;
  prompt: string;
  alt: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Section extraction ────────────────────────────────────────────────────

function extractSections(markdown: string): SectionData[] {
  // Use partial/prefix matching so "Search & Discovery Strategy" matches "Search & Discovery"
  // and "Top Creators to Watch" matches "Top Creators"
  const targetSectionPatterns = [
    { num: '01', pattern: /## (The Brief[^\n]*)\n([\s\S]*?)(?=\n## |\n# |$)/, titleGroup: 1, bodyGroup: 2 },
    { num: '03', pattern: /## (Origin Story[^\n]*)\n([\s\S]*?)(?=\n## |\n# |$)/, titleGroup: 1, bodyGroup: 2 },
    { num: '05', pattern: /## (The Competition[^\n]*)\n([\s\S]*?)(?=\n## |\n# |$)/, titleGroup: 1, bodyGroup: 2 },
    { num: '08', pattern: /## (Five Big Opportunities[^\n]*)\n([\s\S]*?)(?=\n## |\n# |$)/, titleGroup: 1, bodyGroup: 2 },
    { num: '10', pattern: /## (Search[^\n]*Discovery[^\n]*)\n([\s\S]*?)(?=\n## |\n# |$)/, titleGroup: 1, bodyGroup: 2 },
    { num: '14', pattern: /## (Top Creators[^\n]*)\n([\s\S]*?)(?=\n## |\n# |$)/, titleGroup: 1, bodyGroup: 2 },
  ];

  const sections: SectionData[] = [];

  for (const target of targetSectionPatterns) {
    const match = markdown.match(target.pattern);
    if (match) {
      const fullTitle = match[target.titleGroup].trim();
      const body = match[target.bodyGroup] || '';
      const excerpt = body.replace(/\*\*TAG:[^\n]+\*\*\n?/, '').substring(0, 600).trim();
      sections.push({
        sectionNum: target.num,
        title: fullTitle,
        excerpt,
        htmlMarker: `<h2>${fullTitle}</h2>`,
      });
    }
  }

  // Fallback: if we couldn't match 6, grab any ## sections
  // Spread picks across the full section list to get variety
  if (sections.length < 3) {
    const allSections = [...markdown.matchAll(/^## (.+)$/gm)];
    const totalSections = allSections.length;
    // Pick 6 evenly distributed indices from available sections
    const fallbackTargets: number[] = [];
    if (totalSections >= 6) {
      // Evenly spread: pick sections at 0, 20%, 40%, 60%, 80%, last
      for (let i = 0; i < 6; i++) {
        fallbackTargets.push(Math.round(i * (totalSections - 1) / 5));
      }
    } else {
      // Fewer sections: use all of them
      for (let i = 0; i < totalSections; i++) fallbackTargets.push(i);
    }
    for (const idx of fallbackTargets) {
      if (allSections[idx] && sections.length < 6) {
        const title = allSections[idx][1].trim();
        if (!sections.find(s => s.title === title)) {
          sections.push({
            sectionNum: String(idx + 1).padStart(2, '0'),
            title,
            excerpt: '',
            htmlMarker: `<h2>${title}</h2>`,
          });
        }
      }
    }
  }

  return sections.slice(0, 6);
}

// ─── Image auto-discovery ──────────────────────────────────────────────────

function extractProductImageUrls(visualResearch: string): string[] {
  if (!visualResearch) return [];
  const urlPattern = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi;
  const matches = visualResearch.match(urlPattern) || [];
  const filtered = matches.filter(url => {
    const lower = url.toLowerCase();
    return !lower.includes('favicon') &&
           !lower.includes('icon') &&
           !lower.includes('logo') &&
           !lower.includes('avatar') &&
           !lower.includes('thumbnail') &&
           !lower.includes('16x16') &&
           !lower.includes('32x32');
  });
  return [...new Set(filtered)].slice(0, 20);
}

async function searchBrandImages(brandName: string, country: string, perplexityKey: string): Promise<string[]> {
  try {
    console.log(`   🔍 Searching for ${brandName} product images via Perplexity...`);
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: `Find 10-15 direct image URLs (ending in .jpg, .jpeg, .png, or .webp) of ${brandName} product photos from their official website, Instagram, or press materials in ${country}.

Return ONLY a JSON array of image URLs, nothing else:
["https://...", "https://..."]

Focus on: product packaging, hero shots, brand campaign images. Direct image links only (not pages). Official brand sources only.`,
        }],
        max_tokens: 800,
        temperature: 0.1,
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) return [];
    const urls: string[] = JSON.parse(jsonMatch[0]);
    const imageUrls = urls.filter(u =>
      typeof u === 'string' &&
      u.startsWith('http') &&
      /\.(jpg|jpeg|png|webp)/i.test(u)
    );
    console.log(`   Found ${imageUrls.length} product image URLs via Perplexity`);
    return imageUrls;
  } catch (err) {
    console.warn('   Perplexity image search failed:', err);
    return [];
  }
}

// ─── LoRA helpers ──────────────────────────────────────────────────────────

async function getExistingLora(slug: string, supabaseUrl: string): Promise<{ weights_url: string; trigger_word: string } | null> {
  try {
    const metaUrl = `${supabaseUrl}/storage/v1/object/public/report-images/lora-models/${slug}/metadata.json`;
    const resp = await fetch(metaUrl);
    if (!resp.ok) return null;
    const meta = await resp.json();
    if (meta.status === 'ready' && meta.lora_weights_url) {
      // Fallback: if trigger_word missing from metadata, reconstruct from slug
      const triggerWord = meta.trigger_word ||
        `${slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_PRODUCT`;
      console.log(`   ✓ Found existing LoRA: trigger="${triggerWord}" → ${meta.lora_weights_url.substring(0, 60)}...`);
      return { weights_url: meta.lora_weights_url, trigger_word: triggerWord };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── FLUX Pro generation ───────────────────────────────────────────────────

async function generateFluxImage(
  prompt: string,
  falApiKey: string,
  loraWeightsUrl?: string,
  loraScale?: number,
): Promise<string | null> {
  try {
    const payload: Record<string, unknown> = {
      prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      safety_tolerance: '2',
      output_format: 'jpeg',
    };

    if (loraWeightsUrl) {
      payload.loras = [{ path: loraWeightsUrl, scale: loraScale ?? 0.85 }];
    }

    const response = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('FLUX API error:', response.status, err.substring(0, 200));
      return null;
    }

    const data = await response.json();
    return data.images?.[0]?.url || null;
  } catch (err) {
    console.error('FLUX generation error:', err);
    return null;
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { slug, brand_name, report_markdown, visual_research, country, product_photo_urls } = await req.json();

    if (!slug || !brand_name || !report_markdown) {
      throw new Error('slug, brand_name, and report_markdown are required');
    }

    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY') || null;
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;  // Still used for prompt crafting (GPT-4o)
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!FAL_API_KEY) {
      throw new Error('FAL_API_KEY is required for image generation');
    }

    console.log(`\n🎨 Starting FLUX image generation for: ${brand_name} (${slug})\n`);

    const sections = extractSections(report_markdown);
    console.log(`📋 Identified ${sections.length} sections for images:`, sections.map(s => s.title).join(', '));

    // ─── LoRA Discovery ──────────────────────────────────────────────────────
    let loraInfo: { weights_url: string; trigger_word: string } | null = null;
    let loraTrainingStarted = false;

    // 1. Check for existing trained LoRA
    loraInfo = await getExistingLora(slug, SUPABASE_URL);

    if (!loraInfo) {
      // 2. Collect product images for training
      let productImageUrls: string[] = [...(product_photo_urls || [])];

      // Auto-discover from visual_research text
      if (visual_research) {
        const discovered = extractProductImageUrls(visual_research);
        if (discovered.length > 0) {
          console.log(`   🔍 Auto-discovered ${discovered.length} image URLs from visual research`);
          productImageUrls = [...productImageUrls, ...discovered];
        }
      }

      // If still not enough, try Perplexity image search
      if (productImageUrls.length < 4 && PERPLEXITY_API_KEY) {
        const perplexityImages = await searchBrandImages(brand_name, country || 'Indonesia', PERPLEXITY_API_KEY);
        productImageUrls = [...productImageUrls, ...perplexityImages];
      }

      // Deduplicate
      productImageUrls = [...new Set(productImageUrls)].slice(0, 20);

      if (productImageUrls.length >= 4) {
        console.log(`\n🎓 Triggering LoRA training with ${productImageUrls.length} product images (fire-and-forget)...`);
        fetch(`${SUPABASE_URL}/functions/v1/train-lora`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
          },
          body: JSON.stringify({ slug, brand_name, image_urls: productImageUrls }),
        }).then(r => r.json()).then(d => {
          console.log(d.success
            ? `   ✓ LoRA ${d.status === 'ready' ? 'complete' : 'started'}: ${d.lora_weights_url || 'training...'}`
            : `   ✗ LoRA failed: ${d.error}`
          );
        }).catch(err => console.warn('LoRA training error:', err));
        loraTrainingStarted = true;
        console.log(`   → Training started. This report: FLUX standard. Next report: FLUX + LoRA.\n`);
      } else {
        console.log(`   ℹ️ ${productImageUrls.length}/4 product images found — LoRA training skipped. Using FLUX standard.\n`);
      }
    }

    // ─── Section visual concepts ─────────────────────────────────────────────
    // Pre-assigned editorial concepts per section.
    // When LoRA is available, product sections get product-aware prompts.

    const isIndonesia = (country || 'Indonesia').toLowerCase().includes('indonesia');
    const location = isIndonesia ? 'Indonesia' : (country || 'Southeast Asia');

    const sectionModeMap: Record<string, { mode: string; concept: string; productSection?: boolean }> = {
      'The Brief':              {
        mode: 'LIFESTYLE PRODUCT',
        productSection: true,
        concept: `Young ${isIndonesia ? 'Indonesian' : 'local'} professional walking briskly on a busy city sidewalk, morning commute, carrying a bag, drinking from the product bottle mid-stride, golden morning light, candid street photography style, f/1.8 bokeh background of urban ${location}`,
      },
      'Origin Story':           {
        mode: 'MACRO PRODUCT',
        productSection: true,
        concept: `Macro close-up beauty shot — crystal clear water droplets falling in slow motion into an open product bottle mouth, multiple droplets mid-fall, pure and clean, cool blue water tones, black background, studio backlit lighting, commercial water photography style`,
      },
      'The Competition':        {
        mode: 'LIFESTYLE PRODUCT',
        productSection: true,
        concept: `${isIndonesia ? 'Indonesian' : 'local'} gym scene — person just finished a workout, sitting on a bench catching breath, holding the product bottle up, sweat visible, dramatic gym lighting from above, authentic athletic lifestyle`,
      },
      'Five Big Opportunities': {
        mode: 'LIFESTYLE PRODUCT',
        productSection: true,
        concept: `Group of young ${isIndonesia ? 'Indonesian' : 'local'} friends at a casual outdoor cafe, laughing together, product bottles on the table, relaxed social scene, warm afternoon light, candid and authentic feeling`,
      },
      'Search & Discovery':     {
        mode: 'LIFESTYLE PRODUCT',
        productSection: true,
        concept: `${isIndonesia ? 'Indonesian' : 'local'} office worker at a standing desk, focused on laptop screen, product bottle beside the laptop within easy reach, clean modern workspace, natural daylight from window, professional lifestyle`,
      },
      'Top Creators':           {
        mode: 'LIFESTYLE PRODUCT',
        productSection: true,
        concept: `Young ${isIndonesia ? 'Indonesian' : 'local'} content creator filming a TikTok in their bedroom — they're holding up the product bottle toward their phone camera, ring light glow, authentic creator vibe, fun and energetic mood`,
      },
    };

    // ─── Step 1: Craft prompts via GPT-4o ───────────────────────────────────
    console.log('📝 Step 1: Crafting FLUX prompts via GPT-4o...');

    const brandContext = visual_research
      ? `Brand visual research:\n${visual_research.substring(0, 800)}`
      : `Brand: ${brand_name} — consumer brand in ${location}`;

    const usingLora = !!(loraInfo);
    const loraContext = usingLora
      ? `\n\nIMPORTANT: A LoRA model trained on real ${brand_name} product photos is active. Trigger word: "${loraInfo!.trigger_word}". ALWAYS start every prompt with this trigger word — it tells FLUX to render the accurate product bottle. Every image must show the ${brand_name} bottle in a natural lifestyle context.`
      : '';

    // Fuzzy-match section title to mode map (handles "Top Creators to Watch" → "Top Creators")
    function findSectionMode(title: string) {
      // Direct match first
      if (sectionModeMap[title]) return sectionModeMap[title];
      // Prefix match
      for (const key of Object.keys(sectionModeMap)) {
        if (title.startsWith(key) || key.startsWith(title)) return sectionModeMap[key];
      }
      // Keyword match
      if (title.includes('Brief')) return sectionModeMap['The Brief'];
      if (title.includes('Origin')) return sectionModeMap['Origin Story'];
      if (title.includes('Competition')) return sectionModeMap['The Competition'];
      if (title.includes('Opportunit')) return sectionModeMap['Five Big Opportunities'];
      if (title.includes('Search') || title.includes('Discovery')) return sectionModeMap['Search & Discovery'];
      if (title.includes('Creator')) return sectionModeMap['Top Creators'];
      return { mode: 'HUMAN SCENE', concept: `Authentic ${location} everyday life scene, documentary style`, productSection: false };
    }

    const sectionBriefs = sections.map((s, i) => {
      const mode = findSectionMode(s.title);
      const loraNote = usingLora
        ? `\n[INCLUDE TRIGGER WORD "${loraInfo!.trigger_word}" at the START of the prompt]`
        : '';
      return `IMAGE ${i + 1} — Section "${s.title}"\nMODE: ${mode.mode}${loraNote}\nCONCEPT: ${mode.concept}\nSECTION CONTEXT: ${s.excerpt?.substring(0, 200) || '(general brand context)'}`;
    }).join('\n\n---\n\n');

    const promptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert FLUX Pro prompt engineer creating photorealistic lifestyle images for a brand intelligence report. You specialize in crafting prompts that produce stunning, magazine-quality editorial photography using the Fal.ai FLUX Pro model with LoRA.
${loraContext}

## FLUX PRO PROMPT ENGINEERING — MASTER GUIDE:

FLUX Pro (Black Forest Labs) responds best to prompts that are:
1. **Highly descriptive** — describe exactly what's in frame, not abstract concepts
2. **Technically precise** — specify camera, lens, aperture, ISO, shutter speed
3. **Lighting-focused** — FLUX renders light extremely well; describe the source, quality, direction
4. **Style-referenced** — name specific photographers, films, magazines for visual style
5. **Sequential structure**: Subject → Action → Environment → Lighting → Camera → Style

## TRIGGER WORD USAGE (CRITICAL):
- The LoRA trigger word MUST appear early in the prompt (first 5-10 words)
- It activates the brand's custom product model trained on real photos
- After the trigger word, describe how the product appears in the scene

## VISUAL STYLE TARGET:
All 6 images should look like they belong in a single editorial story — consistent mood:
- **Color grade**: Slightly desaturated, cinematic — not oversaturated Instagram style
- **People**: Real ${isIndonesia ? 'Indonesian' : location} people, diverse ages, authentic clothes — not models
- **Moments**: Candid, mid-action — not posed, not looking at camera
- **Product**: Always present, naturally integrated, label visible but not front-and-center

## FLUX-SPECIFIC TECHNIQUES:
- "shot on [camera model]" dramatically improves photorealism (use: Sony A7IV, Canon R5, Leica Q3, Fujifilm X-T5)
- "RAW photo, photorealistic" unlocks maximum detail
- Specify: f/[number], ISO [number], [focal length]mm
- For bokeh: "f/1.4, 85mm portrait lens, subject in sharp focus, background compressed"
- For motion: "1/500s shutter speed, frozen motion" or "1/30s, motion blur suggesting movement"
- "editorial photography, [magazine name] style" — use: Vogue, National Geographic, TIME, Monocle, Kinfolk
- Lighting descriptors FLUX loves: "Rembrandt lighting", "golden hour backlighting", "practical light sources", "hard rim light", "soft diffused window light"

## ANATOMY OF A PERFECT PROMPT (500-600 characters):
[TRIGGER WORD], [subject age/gender/ethnicity/clothing], [exact action], [precise location], [environmental detail], [lighting: source + quality + direction + color temp], [camera: model + lens + aperture + focus], [style: mood + magazine reference + film stock or grade]

EXAMPLE:
"AQUVIVA_PRODUCT, 28-year-old Indonesian woman in crisp white office blazer and jeans, drinking from the AQUVIVA water bottle while walking, Jakarta CBD sidewalk at 7:30am, glass skyscrapers blurred behind her, warm golden backlight from rising sun creating rim light on her hair, foreground bokeh of passing commuters, shot on Sony A7IV 85mm f/1.4 ISO 400, Kinfolk magazine editorial style, cinematic color grade"

Return ONLY a valid JSON array with no markdown fences:
[{"sectionNum":"01","sectionTitle":"The Brief","prompt":"...","alt":"..."}]`,
          },
          {
            role: 'user',
            content: `${brandContext}

Generate one FLUX Pro prompt per section. Follow the pre-assigned MODE and CONCEPT exactly:

${sectionBriefs}`,
          },
        ],
        temperature: 0.6,
        max_tokens: 3000,
      }),
    });

    const promptData = await promptResponse.json();
    if (!promptData.choices?.[0]?.message?.content) {
      throw new Error('Failed to generate image prompts: ' + JSON.stringify(promptData.error || promptData));
    }

    let imageSpecs: ImageSpec[];
    try {
      const raw = promptData.choices[0].message.content;
      const jsonStr = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
      imageSpecs = JSON.parse(jsonStr);
      console.log(`✅ Generated ${imageSpecs.length} FLUX prompts:`);
      imageSpecs.forEach((s, i) => console.log(`  ${i+1}. [${s.sectionTitle}] ${s.prompt.substring(0, 120)}...`));
    } catch (parseErr) {
      console.error('Failed to parse image specs:', promptData.choices[0].message.content);
      throw new Error('Failed to parse image prompts from GPT-4o');
    }

    // ─── Step 2: Generate images via FLUX Pro ────────────────────────────────
    // IMPORTANT: Run sequentially (not Promise.all) to avoid edge function 150s timeout.
    // Each FLUX + LoRA call takes ~15-25s. 6 parallel = 90-150s risk of timeout.
    // Sequential = ~90-150s total but only ONE outstanding request at a time — more stable.
    // We process in batches of 2 to balance speed vs stability.
    console.log(`\n🚀 Step 2: Generating images via FLUX Pro ${usingLora ? `+ LoRA (trigger: ${loraInfo!.trigger_word})` : '(standard)'}...`);
    console.log(`   Strategy: sequential batches of 2 to avoid 150s timeout\n`);

    const images: Array<{url: string; alt: string; sectionTitle: string; sectionNum: string; htmlMarker: string | null}> = [];

    async function generateAndUpload(spec: ImageSpec, idx: number) {
      try {
        console.log(`  [${idx + 1}/6] Generating: "${spec.sectionTitle}"...`);

        // All sections use LoRA when available — product is in every image
        // The GPT-4o prompt already includes the trigger word; prepend it as safety backup
        const finalPrompt = (usingLora && loraInfo && !spec.prompt.includes(loraInfo.trigger_word))
          ? `${loraInfo.trigger_word} ${spec.prompt}`
          : spec.prompt;

        const imageUrl = await generateFluxImage(
          finalPrompt,
          FAL_API_KEY,
          usingLora ? loraInfo!.weights_url : undefined,
          0.85,  // Consistent LoRA scale for all sections
        );

        if (!imageUrl) {
          console.error(`  ✗ FLUX failed for image ${idx + 1}`);
          return null;
        }

        // Download image bytes
        const imgResponse = await fetch(imageUrl);
        const imgBlob = await imgResponse.arrayBuffer();

        // Upload to Supabase Storage
        const storagePath = `${slug}/section-${spec.sectionNum || String(idx).padStart(2, '0')}.jpg`;
        const uploadResponse = await fetch(
          `${SUPABASE_URL}/storage/v1/object/report-images/${storagePath}`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'image/jpeg',
              'x-upsert': 'true',
            },
            body: imgBlob,
          }
        );

        if (!uploadResponse.ok) {
          const err = await uploadResponse.text();
          console.error(`  Storage upload error for image ${idx}:`, err);
          return null;
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/report-images/${storagePath}`;
        console.log(`  ✓ [${idx + 1}/6] Done: ${spec.sectionTitle} ${usingLora ? '[LoRA+trigger]' : ''}`);

        // Flexible section matching: exact title, sectionNum, or partial title overlap
        const matchedSection = sections.find(s =>
          s.title === spec.sectionTitle ||
          s.sectionNum === spec.sectionNum ||
          spec.sectionTitle.startsWith(s.title) ||
          s.title.startsWith(spec.sectionTitle) ||
          (spec.sectionTitle.includes(s.title.split(' ')[0]) && s.title.length > 5)
        );

        return {
          url: publicUrl,
          alt: spec.alt,
          sectionTitle: spec.sectionTitle,
          sectionNum: spec.sectionNum,
          htmlMarker: matchedSection?.htmlMarker || null,
        };
      } catch (err) {
        console.error(`  Image ${idx} failed:`, err);
        return null;
      }
    }

    // Process in batches of 2 (parallel pairs) to balance speed vs timeout risk
    for (let i = 0; i < imageSpecs.length; i += 2) {
      const batch = imageSpecs.slice(i, i + 2);
      const batchResults = await Promise.all(
        batch.map((spec, batchIdx) => generateAndUpload(spec, i + batchIdx))
      );
      for (const result of batchResults) {
        if (result) images.push(result);
      }
    }

    console.log(`\n✅ ${images.length}/6 images generated and uploaded\n`);

    // ─── Step 3: Inject images into HTML ────────────────────────────────────
    if (images.length > 0) {
      console.log('📄 Step 3: Injecting images into report HTML...');

      const htmlUrl = `${SUPABASE_URL}/storage/v1/object/public/reports/report-html/${slug}.html`;
      const htmlResponse = await fetch(htmlUrl);

      if (htmlResponse.ok) {
        let html = await htmlResponse.text();

        // First pass: strip ALL previously injected <figure> blocks that follow any <h2>
        // Uses a greedy loop to handle multiple stacked figures after one h2
        // Pattern: <h2>...</h2> followed by one or more <figure>...</figure> blocks
        let prevHtml = '';
        while (prevHtml !== html) {
          prevHtml = html;
          html = html.replace(
            /(<h2>[^<]+<\/h2>)(\s*<figure\b[\s\S]*?<\/figure>)+/g,
            '$1'
          );
        }

        for (const img of images) {
          if (!img.htmlMarker || !html.includes(img.htmlMarker)) {
            console.log(`  ⚠️ No marker found for: ${img.sectionTitle}`);
            continue;
          }

          const figureHtml = `<figure style="margin:0 0 28px 0;border-radius:10px;overflow:hidden;border:1px solid #e4e7ec;box-shadow:0 2px 12px rgba(16,24,40,0.06)">
<img src="${img.url}" alt="${img.alt}" style="width:100%;height:360px;object-fit:cover;display:block" loading="lazy" onerror="this.parentElement.style.display='none'">
<figcaption style="padding:10px 18px;font-size:12px;color:#667085;border-top:1px solid #f2f4f7;background:#fcfcfd;font-family:Inter,system-ui,sans-serif;font-weight:500;letter-spacing:0.02em;display:flex;align-items:center;gap:8px"><span style="width:6px;height:6px;border-radius:50%;background:#16a34a;display:inline-block;flex-shrink:0"></span>${img.alt}</figcaption>
</figure>`;

          // Replace only the FIRST occurrence to avoid duplicating across sections
          const markerIdx = html.indexOf(img.htmlMarker);
          if (markerIdx !== -1) {
            html = html.slice(0, markerIdx + img.htmlMarker.length) +
                   '\n' + figureHtml +
                   html.slice(markerIdx + img.htmlMarker.length);
          }
          console.log(`  ✓ Injected image into: ${img.sectionTitle}`);
        }

        const reuploadResponse = await fetch(
          `${SUPABASE_URL}/storage/v1/object/reports/report-html/${slug}.html`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'text/html',
              'x-upsert': 'true',
            },
            body: html,
          }
        );

        if (reuploadResponse.ok) {
          console.log('✅ Report HTML updated with FLUX images\n');
        } else {
          const err = await reuploadResponse.text();
          console.error('Failed to re-upload HTML:', err);
        }
      } else {
        console.log('⚠️ Could not fetch HTML from storage — images uploaded but not injected');
      }
    }

    const reportUrl = `https://report.geovera.xyz/report/${slug}`;
    console.log(`🎉 Done! Report: ${reportUrl}\n`);

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        engine: usingLora ? 'flux-pro-lora' : 'flux-pro-standard',
        images: images.map(img => ({ url: img.url, alt: img.alt, section: img.sectionTitle })),
        report_url: reportUrl,
        lora_training_started: loraTrainingStarted,
        lora_active: usingLora,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
