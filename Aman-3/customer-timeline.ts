import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

interface TimelineEvent {
  brand_id: string
  event_type: 'foundation_check' | 'run_started' | 'run_completed' | 'run_failed' | 'content_generated' | 'alert_triggered' | 'budget_warning' | 'budget_exceeded' | 'apify_run' | 'custom'
  event_title: string
  event_description?: string
  metadata?: Record<string, any>
  severity?: 'info' | 'warning' | 'critical'
  related_run_id?: string
  related_job_id?: string
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { brand_id, event_type, event_title, event_description, metadata, severity, related_run_id, related_job_id } = await req.json()

    if (!brand_id || !event_type || !event_title) {
      throw new Error('brand_id, event_type, and event_title are required')
    }

    // Validate event_type
    const validEventTypes = [
      'foundation_check',
      'run_started',
      'run_completed',
      'run_failed',
      'content_generated',
      'alert_triggered',
      'budget_warning',
      'budget_exceeded',
      'apify_run',
      'custom'
    ]

    if (!validEventTypes.includes(event_type)) {
      throw new Error(`Invalid event_type. Must be one of: ${validEventTypes.join(', ')}`)
    }

    // Insert timeline event
    const { data, error } = await supabaseClient
      .from('gv_customer_timeline')
      .insert({
        brand_id,
        event_type,
        event_title,
        event_description: event_description || null,
        metadata: metadata || {},
        severity: severity || 'info',
        related_run_id: related_run_id || null,
        related_job_id: related_job_id || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    console.log(`📌 Timeline event logged: ${event_type} - ${event_title}`)

    return new Response(JSON.stringify({
      success: true,
      event: data,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Timeline error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
