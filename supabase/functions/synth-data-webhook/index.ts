/**
 * GeoVera: Synthetic Data Webhook
 *
 * Called by synth_gen.py (running in Vast.ai) when synthetic data generation completes.
 * Receives:
 * {
 *   success: boolean,
 *   slug: string,
 *   trigger_word: string,
 *   brand_name: string,
 *   synth_zip_url: string,        // URL to synthetic training data ZIP in Supabase Storage
 *   images_generated: number,
 *   quality_report: object,
 *   pipeline_duration_seconds: number,
 *   source_images: number,
 * }
 *
 * On success → calls train-lora edge function with synth ZIP URL
 * On failure → logs error
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL   = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FUNCTION_URL   = Deno.env.get("SUPABASE_FUNCTION_URL") ?? SUPABASE_URL;

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: HEADERS });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: HEADERS,
    });
  }

  console.log("[synth-data-webhook] Received:", JSON.stringify(body, null, 2));

  const {
    success,
    slug,
    trigger_word,
    brand_name,
    synth_zip_url,
    images_generated,
    quality_report,
    pipeline_duration_seconds,
    error: synthError,
  } = body as Record<string, unknown>;

  if (!success) {
    console.error(`[synth-data-webhook] Synth generation FAILED for ${slug}: ${synthError}`);
    return new Response(JSON.stringify({ received: true, action: "logged_failure" }), {
      headers: HEADERS,
    });
  }

  console.log(`[synth-data-webhook] SUCCESS for ${slug}:`);
  console.log(`  Synthetic images: ${images_generated}`);
  console.log(`  Duration: ${pipeline_duration_seconds}s`);
  console.log(`  ZIP URL: ${synth_zip_url}`);

  // Trigger train-lora with the synthetic data ZIP
  const trainLoraUrl = `${FUNCTION_URL}/functions/v1/train-lora`;

  const trainPayload = {
    slug,
    trigger_word,
    brand_name,
    // Pass synthetic ZIP as the training data source
    zip_url: synth_zip_url,
    // Include quality metadata
    metadata: {
      source: "synthetic",
      images_generated,
      quality_report,
      pipeline_duration_seconds,
    },
  };

  console.log(`[synth-data-webhook] Triggering train-lora for ${slug}...`);

  try {
    const trainResp = await fetch(trainLoraUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(trainPayload),
    });

    const trainResult = await trainResp.json();
    console.log(`[synth-data-webhook] train-lora response: ${trainResp.status}`, trainResult);

    return new Response(JSON.stringify({
      received: true,
      action: "triggered_train_lora",
      slug,
      synth_images: images_generated,
      train_lora_response: trainResult,
    }), { headers: HEADERS });

  } catch (err) {
    console.error(`[synth-data-webhook] Failed to trigger train-lora: ${err}`);
    return new Response(JSON.stringify({
      received: true,
      action: "train_lora_trigger_failed",
      error: String(err),
    }), { status: 500, headers: HEADERS });
  }
});
