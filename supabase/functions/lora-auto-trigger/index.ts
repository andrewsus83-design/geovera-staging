/**
 * lora-auto-trigger — Supabase Database Webhook Handler
 *
 * Fires automatically when a file is uploaded to Supabase Storage.
 * Watches for: lora-training/{slug}/training-images.zip
 * When detected → calls train-lora edge function automatically.
 *
 * Setup (one-time, via Supabase Dashboard):
 *   Dashboard → Database → Webhooks → Create new webhook
 *   Table:  storage.objects
 *   Events: INSERT
 *   URL:    https://{project-ref}.supabase.co/functions/v1/lora-auto-trigger
 *   Headers: Authorization: Bearer {service_role_key}
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Storage path pattern: lora-training/{slug}/training-images.zip
const TRAINING_ZIP_PATTERN = /^lora-training\/([^\/]+)\/training-images\.zip$/;

// Brand name lookup — derive from slug if not in map
const BRAND_NAME_MAP: Record<string, string> = {
  'aquviva':           'Aquviva',
  'kata-oma':          'Kata Oma',
  'the-watch-co':      'The Watch Co',
  'twc-gshock-dw5900': 'The Watch Co - G-Shock DW5900',
  'twc-dw-jolie-silver': 'The Watch Co - DW Jolie Silver',
  'twc-ob-tank-green': 'The Watch Co - OB Tank Green',
};

function slugToBrandName(slug: string): string {
  return BRAND_NAME_MAP[slug] ||
    slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface StorageWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: {
    id: string;
    name: string;           // file path within bucket
    bucket_id: string;
    owner: string | null;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    metadata: Record<string, unknown> | null;
    path_tokens: string[];
  };
  old_record: null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: StorageWebhookPayload = await req.json();

    console.log(`[lora-auto-trigger] Webhook received: ${payload.type} on ${payload.schema}.${payload.table}`);
    console.log(`  File: bucket=${payload.record?.bucket_id}, name=${payload.record?.name}`);

    // Only handle INSERT events on storage.objects
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ skipped: true, reason: 'Not an INSERT event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const record = payload.record;

    // Only watch report-images bucket (where training zips are stored)
    if (record.bucket_id !== 'report-images') {
      return new Response(JSON.stringify({ skipped: true, reason: `Wrong bucket: ${record.bucket_id}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if this is a training zip file
    const match = record.name.match(TRAINING_ZIP_PATTERN);
    if (!match) {
      console.log(`  Skipping — not a training zip: ${record.name}`);
      return new Response(JSON.stringify({ skipped: true, reason: 'Not a training zip file' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const slug = match[1];
    const brandName = slugToBrandName(slug);
    const zipUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/report-images/${record.name}`;

    console.log(`\n🎯 Training zip detected!`);
    console.log(`   slug:      ${slug}`);
    console.log(`   brand:     ${brandName}`);
    console.log(`   zip_url:   ${zipUrl}`);
    console.log(`   file_size: ${JSON.stringify(record.metadata?.size || 'unknown')}`);

    // Small delay to ensure file is fully written before training starts
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Call train-lora edge function
    const trainUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/train-lora`;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log(`\n🚀 Triggering train-lora for: ${slug}`);

    const trainResp = await fetch(trainUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug,
        brand_name: brandName,
        zip_url: zipUrl,
        force: false,          // Don't retrain if LoRA already exists (idempotent)
        preferred_gpu: 'RTX 5090',  // Prefer best GPU, fallback to H200
      }),
    });

    const trainResult = await trainResp.json();

    if (trainResult.success || trainResult.status === 'training' || trainResult.skipped) {
      console.log(`\n✅ train-lora triggered successfully:`);
      console.log(`   status:      ${trainResult.status}`);
      console.log(`   instance_id: ${trainResult.vast_instance_id || 'N/A'}`);
      console.log(`   gpu:         ${trainResult.gpu || 'N/A'}`);
      console.log(`   skipped:     ${trainResult.skipped || false}`);

      return new Response(JSON.stringify({
        success: true,
        slug,
        brand_name: brandName,
        zip_url: zipUrl,
        train_result: trainResult,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error(`\n❌ train-lora failed: ${JSON.stringify(trainResult)}`);
      return new Response(JSON.stringify({
        success: false,
        slug,
        error: trainResult.error || 'train-lora returned failure',
        train_result: trainResult,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (err) {
    console.error(`[lora-auto-trigger] Error:`, err);
    return new Response(JSON.stringify({
      success: false,
      error: String(err),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
