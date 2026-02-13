import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * Real-Time Progress Tracker
 * 
 * Broadcasts pipeline execution progress via Server-Sent Events (SSE)
 * Allows frontend to monitor runs, insights generation, and cost accumulation in real-time
 */

interface ProgressEvent {
  run_id: string
  brand_id: string
  stage: string
  status: 'started' | 'in_progress' | 'completed' | 'failed'
  progress_pct: number
  message: string
  cost_accumulated?: number
  timestamp: string
}

serve(async (req) => {
  const url = new URL(req.url)
  const brandId = url.searchParams.get('brand_id')
  const runId = url.searchParams.get('run_id')

  if (!brandId) {
    return new Response(
      JSON.stringify({ error: 'brand_id required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // SSE endpoint for real-time progress
  if (url.pathname.endsWith('/stream')) {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        const encoder = new TextEncoder()
        controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

        // Subscribe to Supabase Realtime for progress updates
        const channel = supabaseClient
          .channel(`progress:${brandId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'gv_run_progress',
              filter: `brand_id=eq.${brandId}`,
            },
            (payload) => {
              const event: ProgressEvent = {
                run_id: payload.new.run_id,
                brand_id: payload.new.brand_id,
                stage: payload.new.stage,
                status: payload.new.status,
                progress_pct: payload.new.progress_pct || 0,
                message: payload.new.message,
                cost_accumulated: payload.new.cost_accumulated,
                timestamp: new Date().toISOString(),
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
            }
          )
          .subscribe()

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        }, 30000)

        // Cleanup on disconnect
        req.signal.addEventListener('abort', () => {
          clearInterval(heartbeat)
          channel.unsubscribe()
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // REST endpoint to get current progress
  if (req.method === 'GET') {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    let query = supabaseClient
      .from('gv_run_progress')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })

    if (runId) {
      query = query.eq('run_id', runId)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Calculate overall progress if run_id specified
    let overallProgress = 0
    if (runId && data && data.length > 0) {
      const stages = ['data_collection', 'signal_processing', 'insight_synthesis', 'task_generation', 'completed']
      const currentStage = data[0].stage
      const stageIndex = stages.indexOf(currentStage)
      const stageProgress = data[0].progress_pct || 0
      overallProgress = stageIndex >= 0 
        ? ((stageIndex / stages.length) * 100) + ((stageProgress / stages.length))
        : 0
    }

    return new Response(
      JSON.stringify({
        progress: data,
        overall_progress: Math.round(overallProgress),
        latest_stage: data?.[0]?.stage,
        latest_status: data?.[0]?.status,
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }

  // POST endpoint to update progress (internal use)
  if (req.method === 'POST') {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const { run_id, stage, status, progress_pct, message, cost_accumulated } = payload

    const { data, error } = await supabaseClient
      .from('gv_run_progress')
      .insert({
        run_id,
        brand_id: brandId,
        stage,
        status,
        progress_pct,
        message,
        cost_accumulated,
      })
      .select()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  )
})