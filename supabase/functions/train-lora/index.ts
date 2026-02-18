import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * train-lora v1
 *
 * Trains a FLUX LoRA model on Fal.ai using product images.
 * Images can come from:
 *   a) URLs scraped/found automatically from brand research
 *   b) User-uploaded photos in Supabase Storage
 *
 * Input:
 *   { slug, brand_name, image_urls: string[], trigger_word?: string }
 *
 * Output:
 *   { success, lora_weights_url, lora_id, cost_usd, images_used }
 *
 * Pricing: ~$2 per training run (1000 steps, default)
 * Model: fal-ai/flux-lora-fast-training
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { slug, brand_name, image_urls, trigger_word } = await req.json();

    if (!slug || !brand_name || !image_urls || image_urls.length < 4) {
      return new Response(JSON.stringify({
        success: false,
        error: `Minimum 4 product images required. Got: ${image_urls?.length || 0}`,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!FAL_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: 'FAL_API_KEY not configured',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Use brand slug as trigger word (e.g., "AQUVIVA_PRODUCT")
    const safeSlug = slug.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const triggerWord = trigger_word || `${safeSlug}_PRODUCT`;

    // Use up to 20 images (Fal.ai recommends 4-20 for FLUX LoRA)
    const trainingImages = image_urls.slice(0, 20);

    console.log(`\n🎨 Starting FLUX LoRA training for: ${brand_name} (${slug})`);
    console.log(`   Trigger word: ${triggerWord}`);
    console.log(`   Images: ${trainingImages.length}`);

    // Fal.ai FLUX LoRA fast training
    // POST to fal-ai/flux-lora-fast-training
    const falPayload = {
      images_data_url: trainingImages, // Array of image URLs
      trigger_word: triggerWord,
      steps: 1000,           // Default: 1000 steps (~$2)
      learning_rate: 0.0004, // Good default for product LoRA
      lora_rank: 16,         // Higher = more detail, lower = smaller file
      create_masks: true,    // Auto-segment product from background
    };

    console.log('   Sending training request to Fal.ai...');

    const falResponse = await fetch('https://fal.run/fal-ai/flux-lora-fast-training', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(falPayload),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      console.error('Fal.ai training error:', errText);
      return new Response(JSON.stringify({
        success: false,
        error: `Fal.ai training failed: ${falResponse.status} — ${errText}`,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const falData = await falResponse.json();
    console.log('   Fal.ai response:', JSON.stringify(falData).substring(0, 300));

    // Fal.ai returns: { request_id } for async, or { diffusers_lora_file, config_file } for sync
    // flux-lora-fast-training is synchronous — returns results directly
    const loraWeightsUrl = falData.diffusers_lora_file?.url || falData.lora_weights_url || null;
    const loraConfigUrl = falData.config_file?.url || null;
    const requestId = falData.request_id || null;

    if (!loraWeightsUrl && !requestId) {
      console.error('No LoRA weights or request_id in response:', falData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Fal.ai did not return LoRA weights URL',
        fal_response: falData,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Store LoRA metadata in Supabase (brand_assets table or brands table)
    // We store in the reports bucket as a JSON metadata file for simplicity
    const loraMetadata = {
      slug,
      brand_name,
      trigger_word: triggerWord,
      lora_weights_url: loraWeightsUrl,
      lora_config_url: loraConfigUrl,
      fal_request_id: requestId,
      images_used: trainingImages.length,
      trained_at: new Date().toISOString(),
      model: 'fal-ai/flux-lora-fast-training',
      status: loraWeightsUrl ? 'ready' : 'training',
    };

    const metadataPath = `lora-models/${slug}/metadata.json`;
    await fetch(
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

    const metadataUrl = `${SUPABASE_URL}/storage/v1/object/public/report-images/${metadataPath}`;
    console.log(`   ✓ LoRA metadata saved: ${metadataUrl}`);
    console.log(`   ✓ LoRA weights: ${loraWeightsUrl || 'training in progress'}`);

    return new Response(JSON.stringify({
      success: true,
      lora_weights_url: loraWeightsUrl,
      lora_config_url: loraConfigUrl,
      lora_id: requestId,
      trigger_word: triggerWord,
      images_used: trainingImages.length,
      status: loraWeightsUrl ? 'ready' : 'training',
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
