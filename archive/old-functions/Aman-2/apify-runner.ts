import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * Apify Runner
 * Universal scraper using Apify actors for social media and web data
 * Supports: Instagram, TikTok, YouTube, Google, Web
 * Tracks costs in gv_apify_usage table
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApifyRequest {
  brand_id: string
  actor_id: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'google' | 'web'
  input: any
  run_mode?: 'async' | 'sync'
  creator_tier?: 'tier1' | 'tier2' | 'tier3' | 'tier4' // from crawler-orchestrator-budget
  profile_url?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'POST method required' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const payload: ApifyRequest = await req.json()
    const { brand_id, actor_id, platform, input, run_mode = 'async', creator_tier, profile_url } = payload

    if (!brand_id || !actor_id || !platform || !input) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: brand_id, actor_id, platform, input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Apify API token
    const apifyToken = Deno.env.get('APIFY_API_TOKEN')
    if (!apifyToken) {
      throw new Error('APIFY_API_TOKEN not configured in Supabase secrets')
    }

    console.log(`🚀 Starting Apify actor ${actor_id} for brand ${brand_id} on ${platform}`)

    // Start Apify actor run
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${actor_id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apifyToken}`,
      },
      body: JSON.stringify(input),
    })

    if (!runResponse.ok) {
      const error = await runResponse.text()
      throw new Error(`Apify actor start failed: ${error}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data.id
    const actorName = runData.data.actorId || actor_id

    console.log(`✅ Apify run started: ${runId}`)

    if (run_mode === 'async') {
      // Async mode: return immediately, store initial record
      await supabaseClient
        .from('gv_apify_usage')
        .insert({
          brand_id,
          actor_id,
          actor_name: actorName,
          run_id: runId,
          status: 'RUNNING',
          platform,
          profile_url: profile_url || null,
          creator_tier: creator_tier || null,
          started_at: new Date().toISOString(),
        })

      // Also create artifact placeholder
      await supabaseClient.from('gv_raw_artifacts').insert({
        brand_id,
        source: 'apify',
        platform,
        source_category: getSourceCategory(platform),
        signal_layer: getSignalLayer(platform),
        impact_level: 'high',
        change_rate: platform === 'tiktok' ? 'fast' : 'slow',
        raw_payload: {
          actor_id,
          run_id: runId,
          status: 'running',
          input,
        },
        payload_hash: runId,
        collected_at: new Date().toISOString(),
        cycle_window: '7d',
      })

      return new Response(
        JSON.stringify({
          success: true,
          run_id: runId,
          status: 'running',
          message: 'Actor started successfully. Results will be stored when completed.',
          poll_url: `https://api.apify.com/v2/actor-runs/${runId}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Sync mode: wait for completion
      console.log('⏳ Waiting for Apify run to complete (sync mode)...')

      const maxWaitTime = 300000 // 5 minutes
      const pollInterval = 5000 // 5 seconds
      const startTime = Date.now()

      while (Date.now() - startTime < maxWaitTime) {
        // Check run status
        const statusResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}`,
          { headers: { 'Authorization': `Bearer ${apifyToken}` } }
        )
        const statusData = await statusResponse.json()
        const status = statusData.data.status

        if (status === 'SUCCEEDED') {
          console.log('✅ Apify run completed successfully')

          // Extract run details
          const runInfo = statusData.data
          const datasetId = runInfo.defaultDatasetId
          const stats = runInfo.stats || {}

          // Calculate duration
          const startedAt = new Date(runInfo.startedAt)
          const finishedAt = new Date(runInfo.finishedAt)
          const durationSeconds = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000)

          // Get cost info (Apify usage)
          const costUsd = runInfo.usageTotalUsd || 0
          const computeUnits = runInfo.usageUsd?.ACTOR_COMPUTE || 0

          // Get results from dataset
          const resultsResponse = await fetch(
            `https://api.apify.com/v2/datasets/${datasetId}/items`,
            { headers: { 'Authorization': `Bearer ${apifyToken}` } }
          )
          const results = await resultsResponse.json()

          // Store cost tracking in gv_apify_usage
          await supabaseClient
            .from('gv_apify_usage')
            .insert({
              brand_id,
              actor_id,
              actor_name: actorName,
              run_id: runId,
              cost_usd: costUsd,
              compute_units: computeUnits,
              status: 'SUCCEEDED',
              started_at: startedAt.toISOString(),
              finished_at: finishedAt.toISOString(),
              duration_seconds: durationSeconds,
              dataset_items: results.length,
              platform,
              profile_url: profile_url || null,
              creator_tier: creator_tier || null,
            })

          // Store results as artifacts
          const artifacts = processApifyResults(brand_id, platform, actor_id, results)

          for (const artifact of artifacts) {
            await supabaseClient.from('gv_raw_artifacts').insert(artifact)
          }

          console.log(`📊 Cost: $${costUsd.toFixed(4)} | Items: ${results.length} | Duration: ${durationSeconds}s`)

          return new Response(
            JSON.stringify({
              success: true,
              run_id: runId,
              status: 'completed',
              cost_usd: costUsd,
              compute_units: computeUnits,
              duration_seconds: durationSeconds,
              items_count: results.length,
              artifacts_created: artifacts.length,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          // Run failed, store failure info
          const errorMessage = statusData.data.statusMessage || 'Unknown error'

          await supabaseClient
            .from('gv_apify_usage')
            .insert({
              brand_id,
              actor_id,
              actor_name: actorName,
              run_id: runId,
              status,
              started_at: statusData.data.startedAt,
              finished_at: statusData.data.finishedAt || new Date().toISOString(),
              platform,
              profile_url: profile_url || null,
              creator_tier: creator_tier || null,
            })

          throw new Error(`Apify run ${status}: ${errorMessage}`)
        }

        // Still running, wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }

      // Timeout
      throw new Error('Apify run timeout after 5 minutes')
    }

  } catch (error) {
    console.error('❌ Apify runner error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getSourceCategory(platform: string): string {
  if (['instagram', 'tiktok', 'youtube'].includes(platform)) return 'social'
  if (platform === 'google') return 'serp'
  return 'open_api'
}

function getSignalLayer(platform: string): number {
  // Social media is L3 (pulse)
  if (['instagram', 'tiktok', 'youtube'].includes(platform)) return 3
  // Google/web is L2 (strategic)
  return 2
}

function processApifyResults(brand_id: string, platform: string, actor_id: string, results: any[]): any[] {
  const artifacts = []

  for (const item of results) {
    const artifact = {
      brand_id,
      source: 'apify',
      platform,
      source_category: getSourceCategory(platform),
      signal_layer: getSignalLayer(platform),
      impact_level: 'high',
      change_rate: platform === 'tiktok' ? 'fast' : 'slow',
      raw_payload: item,
      payload_hash: generateHash(JSON.stringify(item)),
      collected_at: new Date().toISOString(),
      cycle_window: '7d',
    }

    artifacts.push(artifact)
  }

  return artifacts
}

function generateHash(str: string): string {
  // Simple hash function for payload_hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
