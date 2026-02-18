import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * check-lora-status
 * Polls Fal.ai queue for LoRA training status and saves result when ready.
 *
 * Input: { slug, request_id }
 * Output: { status, lora_weights_url, lora_config_url, ... }
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
    const { slug, request_id } = await req.json();

    if (!slug || !request_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'slug and request_id are required',
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

    // Check Fal.ai queue status
    const statusResp = await fetch(
      `https://queue.fal.run/fal-ai/flux-lora-fast-training/requests/${request_id}/status`,
      {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      }
    );

    if (!statusResp.ok) {
      const err = await statusResp.text();
      return new Response(JSON.stringify({
        success: false,
        error: `Fal.ai status check failed (${statusResp.status}): ${err.substring(0, 200)}`,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const statusData = await statusResp.json();
    console.log('Fal.ai status:', JSON.stringify(statusData).substring(0, 300));

    // Status: IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED
    const queueStatus = statusData.status;

    if (queueStatus !== 'COMPLETED') {
      return new Response(JSON.stringify({
        success: true,
        status: queueStatus === 'FAILED' ? 'failed' : 'training',
        queue_status: queueStatus,
        request_id,
        logs: (statusData.logs || []).slice(-5),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // COMPLETED — fetch full result
    const resultResp = await fetch(
      `https://queue.fal.run/fal-ai/flux-lora-fast-training/requests/${request_id}`,
      {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      }
    );

    if (!resultResp.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Failed to fetch training result: ${resultResp.status}`,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await resultResp.json();
    console.log('Fal.ai result:', JSON.stringify(result).substring(0, 500));

    const loraWeightsUrl = result.diffusers_lora_file?.url || result.lora_weights_url || null;
    const loraConfigUrl = result.config_file?.url || null;

    // Save metadata to Supabase Storage
    const loraMetadata = {
      slug,
      fal_request_id: request_id,
      lora_weights_url: loraWeightsUrl,
      lora_config_url: loraConfigUrl,
      trained_at: new Date().toISOString(),
      model: 'fal-ai/flux-lora-fast-training',
      status: loraWeightsUrl ? 'ready' : 'failed',
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
      console.warn('Failed to save metadata:', await saveResp.text());
    }

    const metadataUrl = `${SUPABASE_URL}/storage/v1/object/public/report-images/${metadataPath}`;
    console.log(`✓ LoRA training COMPLETE! Weights: ${loraWeightsUrl}`);
    console.log(`✓ Metadata saved: ${metadataUrl}`);

    return new Response(JSON.stringify({
      success: true,
      status: loraWeightsUrl ? 'ready' : 'failed',
      lora_weights_url: loraWeightsUrl,
      lora_config_url: loraConfigUrl,
      request_id,
      metadata_url: metadataUrl,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[check-lora-status] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
