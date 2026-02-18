import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * check-lora-status v3 — supports both Vast.ai and Fal.ai
 *
 * For Vast.ai training:
 *   - Polls Supabase Storage for completed weights (train.py uploads directly)
 *   - If weights found, destroys the Vast.ai instance (stops billing)
 *   - Returns status: "training" | "ready" | "failed"
 *
 * For Fal.ai training (legacy):
 *   - Polls Fal.ai queue status endpoint
 *   - On completion, saves weights URL to Supabase Storage metadata
 *
 * Input:  { slug, request_id?, trigger_word? }
 *   - slug:       required
 *   - request_id: required for Fal.ai; optional for Vast.ai (reads from metadata)
 *   - trigger_word: optional (reconstructed from slug if missing)
 *
 * Output: { success, status, lora_weights_url?, trigger_word, ... }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function destroyVastInstance(instanceId: string, vastApiKey: string): Promise<void> {
  try {
    const resp = await fetch(
      `https://console.vast.ai/api/v0/instances/${instanceId}/`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${vastApiKey}` },
      }
    );
    if (resp.ok) {
      console.log(`   ✓ Vast.ai instance ${instanceId} destroyed (billing stopped)`);
    } else {
      console.warn(`   ⚠️ Failed to destroy instance ${instanceId}: ${resp.status}`);
    }
  } catch (err) {
    console.warn(`   ⚠️ Error destroying Vast.ai instance: ${err}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { slug, request_id, trigger_word } = await req.json();

    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: 'slug is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const VAST_API_KEY       = Deno.env.get('VAST_API_KEY');
    const FAL_API_KEY        = Deno.env.get('FAL_API_KEY');
    const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Reconstruct trigger_word if not provided
    const resolvedTriggerWord = trigger_word ||
      `${slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_PRODUCT`;

    const metaStorageUrl  = `${SUPABASE_URL}/storage/v1/object/public/report-images/lora-models/${slug}/metadata.json`;
    const weightsPublicUrl = `${SUPABASE_URL}/storage/v1/object/public/report-images/lora-models/${slug}/pytorch_lora_weights.safetensors`;

    console.log(`\n🔍 Checking LoRA status for: ${slug}`);

    // ─── Read current metadata ─────────────────────────────────────────────────
    let existingMeta: Record<string, unknown> = {};
    try {
      const metaResp = await fetch(metaStorageUrl);
      if (metaResp.ok) {
        existingMeta = await metaResp.json();
        console.log(`   Metadata found: status=${existingMeta.status}, platform=${existingMeta.training_platform || 'fal.ai'}`);
      }
    } catch { /* No metadata yet */ }

    const platform = (existingMeta.training_platform as string) || (request_id ? 'fal.ai' : 'vast.ai');

    // ─── If already ready, return immediately ─────────────────────────────────
    if (existingMeta.status === 'ready' && existingMeta.lora_weights_url) {
      console.log(`   ✓ Already ready: ${existingMeta.lora_weights_url}`);
      return new Response(JSON.stringify({
        success: true,
        status: 'ready',
        lora_weights_url: existingMeta.lora_weights_url,
        trigger_word: (existingMeta.trigger_word as string) || resolvedTriggerWord,
        platform,
        metadata_url: metaStorageUrl,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── Vast.ai path ──────────────────────────────────────────────────────────
    if (platform === 'vast.ai' || VAST_API_KEY) {
      console.log(`   Platform: Vast.ai`);

      const vastInstanceId = (existingMeta.vast_instance_id as string) || null;

      // Check if weights have been uploaded to Supabase Storage (train.py does this on completion)
      const weightsResp = await fetch(weightsPublicUrl, { method: 'HEAD' });

      if (weightsResp.ok) {
        // Weights are ready! Update metadata and destroy instance
        console.log(`   ✓ Weights found in Supabase Storage — training complete!`);

        // Destroy Vast.ai instance to stop billing
        if (vastInstanceId && VAST_API_KEY) {
          await destroyVastInstance(vastInstanceId, VAST_API_KEY);
        }

        // Update metadata to ready state
        const updatedMeta = {
          ...existingMeta,
          status: 'ready',
          trigger_word: resolvedTriggerWord,
          lora_weights_url: weightsPublicUrl,
          trained_at: new Date().toISOString(),
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
            body: JSON.stringify(updatedMeta, null, 2),
          }
        );

        return new Response(JSON.stringify({
          success: true,
          status: 'ready',
          lora_weights_url: weightsPublicUrl,
          trigger_word: resolvedTriggerWord,
          platform: 'vast.ai',
          vast_instance_destroyed: !!vastInstanceId,
          metadata_url: metaStorageUrl,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      } else {
        // Weights not yet uploaded — training still in progress
        console.log(`   ⏳ Weights not yet in Storage — training in progress`);

        // Optionally check Vast.ai instance status
        let instanceStatus = 'unknown';
        if (vastInstanceId && VAST_API_KEY) {
          try {
            const instResp = await fetch(
              `https://console.vast.ai/api/v0/instances/${vastInstanceId}/`,
              { headers: { 'Authorization': `Bearer ${VAST_API_KEY}` } }
            );
            if (instResp.ok) {
              const instData = await instResp.json();
              instanceStatus = instData.actual_status || instData.status || 'unknown';
              console.log(`   Instance status: ${instanceStatus}`);

              // If instance is gone but weights not found → failed
              if (instanceStatus === 'deleted' || instanceStatus === 'exited') {
                console.log(`   ✗ Instance exited but no weights found — training may have failed`);
                return new Response(JSON.stringify({
                  success: false,
                  status: 'failed',
                  platform: 'vast.ai',
                  error: 'Vast.ai instance exited without uploading weights. Check logs.',
                  vast_instance_id: vastInstanceId,
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
              }
            }
          } catch { /* Can't reach Vast.ai API */ }
        }

        return new Response(JSON.stringify({
          success: true,
          status: 'training',
          platform: 'vast.ai',
          vast_instance_id: vastInstanceId,
          vast_instance_status: instanceStatus,
          trigger_word: resolvedTriggerWord,
          message: 'Training in progress. Poll again in 60 seconds.',
          metadata_url: metaStorageUrl,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // ─── Fal.ai path (legacy) ─────────────────────────────────────────────────
    if (!request_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'request_id required for Fal.ai status check',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!FAL_API_KEY) {
      return new Response(JSON.stringify({
        success: false, error: 'FAL_API_KEY not configured',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`   Platform: Fal.ai (request_id: ${request_id})`);

    // Check Fal.ai queue status
    const statusResp = await fetch(
      `https://queue.fal.run/fal-ai/flux-lora-fast-training/requests/${request_id}/status`,
      { headers: { 'Authorization': `Key ${FAL_API_KEY}` } }
    );

    if (!statusResp.ok) {
      return new Response(JSON.stringify({
        success: false, error: `Fal.ai status check failed: ${statusResp.status}`,
      }), { status: statusResp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const statusData = await statusResp.json();
    const queueStatus = statusData.status; // IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED

    console.log(`   Fal.ai queue status: ${queueStatus}`);

    if (queueStatus !== 'COMPLETED') {
      return new Response(JSON.stringify({
        success: true,
        status: 'training',
        platform: 'fal.ai',
        queue_status: queueStatus,
        trigger_word: resolvedTriggerWord,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch completed result
    const resultResp = await fetch(
      `https://queue.fal.run/fal-ai/flux-lora-fast-training/requests/${request_id}`,
      { headers: { 'Authorization': `Key ${FAL_API_KEY}` } }
    );

    if (!resultResp.ok) {
      return new Response(JSON.stringify({
        success: false, error: `Failed to fetch Fal.ai result: ${resultResp.status}`,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await resultResp.json();
    const loraWeightsUrl = result.diffusers_lora_file?.url || result.lora_weights_url || null;
    const loraConfigUrl  = result.config_file?.url || null;

    // Save completed metadata
    const loraMetadata = {
      slug, trigger_word: resolvedTriggerWord,
      fal_request_id: request_id,
      lora_weights_url: loraWeightsUrl,
      lora_config_url: loraConfigUrl,
      trained_at: new Date().toISOString(),
      model: 'fal-ai/flux-lora-fast-training',
      training_platform: 'fal.ai',
      status: loraWeightsUrl ? 'ready' : 'failed',
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

    return new Response(JSON.stringify({
      success: true,
      status: loraWeightsUrl ? 'ready' : 'failed',
      platform: 'fal.ai',
      lora_weights_url: loraWeightsUrl,
      lora_config_url: loraConfigUrl,
      trigger_word: resolvedTriggerWord,
      request_id,
      metadata_url: metaStorageUrl,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[check-lora-status] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
