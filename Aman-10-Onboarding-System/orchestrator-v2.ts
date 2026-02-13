// supabase/functions/orchestrator-v2/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobDispatch {
  run_id: string
  brand_id: string
  job_type: string
  cycle_window: string
  payload?: Record<string, any>
}

// Job function mapping (maps job types to Supabase Edge Function names)
const JOB_FUNCTIONS: Record<string, string> = {
  'cost-guard': 'cost-guard',
  'evidence-acquisition': 'evidence-acquisition',
  'claude-question-gen': 'step3-question-generator',
  'multi-ai-answers': 'step4-chat-activation',
  'claude-synthesis': 'step1-chronicle-analyzer',
  'openai-draft': 'openai-draft',
  'task-prioritization': 'task-prioritization',
  'learning-note': 'learning-note',
  'customer-timeline': 'customer-timeline'
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { brand_id, run_mode, cycle_window } = await req.json()

    // Validate inputs
    if (!brand_id || !run_mode || !cycle_window) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create run record
    const run_id = crypto.randomUUID()

    const { error: runError } = await supabase
      .from('gv_runs')
      .insert({
        id: run_id,
        brand_id,
        run_mode,
        cycle_window,
        status: 'running'
      })

    if (runError) {
      throw new Error(`Failed to create run: ${runError.message}`)
    }

    console.log(`✅ Run created: ${run_id}`)

    // Step 1: Foundation Gate Check
    console.log('🚪 Checking Foundation Gate...')
    const foundationGate = await checkFoundationGate(supabase, brand_id)

    if (!foundationGate.passed) {
      await supabase
        .from('gv_runs')
        .update({ status: 'failed_foundation_gate' })
        .eq('id', run_id)

      return new Response(
        JSON.stringify({
          error: 'Foundation gate failed',
          reason: foundationGate.reason,
          run_id
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Foundation Gate passed')

    // Step 2: Dispatch job chain
    const jobs = [
      'cost-guard',
      'evidence-acquisition',
      'claude-question-gen',
      'multi-ai-answers',
      'claude-synthesis',
      'openai-draft',
      'task-prioritization',
      'learning-note',
      'customer-timeline'
    ]

    console.log(`📋 Dispatching ${jobs.length} jobs...`)

    const jobResults = []

    // Dispatch jobs sequentially (dependencies enforced)
    for (const job_type of jobs) {
      console.log(`⏳ Dispatching: ${job_type}`)

      // Insert job record
      const { data: jobRecord, error: jobInsertError } = await supabase
        .from('gv_jobs')
        .insert({
          run_id,
          job_type,
          status: 'pending',
          payload: { brand_id, cycle_window }
        })
        .select('id')
        .single()

      if (jobInsertError) {
        console.error(`❌ Failed to insert job ${job_type}:`, jobInsertError)
        jobResults.push({
          job_type,
          status: 'failed',
          error: 'Failed to create job record'
        })
        continue
      }

      // Execute the job function
      const result = await executeJobFunction(
        supabase,
        run_id,
        job_type,
        brand_id,
        cycle_window
      )

      jobResults.push(result)

      // If job failed critically, stop the chain
      if (result.status === 'failed' && result.critical) {
        console.error(`❌ Critical failure in ${job_type}, stopping chain`)
        await supabase
          .from('gv_runs')
          .update({ status: 'failed', error: result.error })
          .eq('id', run_id)

        return new Response(
          JSON.stringify({
            success: false,
            run_id,
            failed_at: job_type,
            error: result.error,
            results: jobResults
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Update run status
    const completedJobs = jobResults.filter(r => r.status === 'completed').length
    const failedJobs = jobResults.filter(r => r.status === 'failed').length

    await supabase
      .from('gv_runs')
      .update({
        status: failedJobs === 0 ? 'completed' : 'completed_with_errors',
        completed_jobs: completedJobs,
        failed_jobs: failedJobs
      })
      .eq('id', run_id)

    return new Response(
      JSON.stringify({
        success: true,
        run_id,
        jobs_dispatched: jobs.length,
        completed: completedJobs,
        failed: failedJobs,
        status: failedJobs === 0 ? 'completed' : 'completed_with_errors',
        results: jobResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Orchestrator error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function checkFoundationGate(supabase: any, brand_id: string) {
  // Check if brand has research_problem and decision_context
  const { data: brand, error } = await supabase
    .from('brands')
    .select('research_problem, decision_context')
    .eq('id', brand_id)
    .single()

  if (error || !brand) {
    return { passed: false, reason: 'Brand not found' }
  }

  if (!brand.research_problem || brand.research_problem.trim() === '') {
    return { passed: false, reason: 'Missing research_problem' }
  }

  if (!brand.decision_context || brand.decision_context.trim() === '') {
    return { passed: false, reason: 'Missing decision_context' }
  }

  // Validate research_problem is not generic
  const genericPhrases = ['market research', 'competitive analysis', 'general study']
  const isGeneric = genericPhrases.some(phrase =>
    brand.research_problem.toLowerCase().includes(phrase)
  )

  if (isGeneric) {
    return { passed: false, reason: 'Research problem too generic' }
  }

  return { passed: true }
}

async function executeJobFunction(
  supabase: any,
  run_id: string,
  job_type: string,
  brand_id: string,
  cycle_window: string
): Promise<{ job_type: string; status: string; error?: string; critical?: boolean; duration_ms?: number }> {
  const startTime = Date.now()

  try {
    // Update job status to running
    await supabase
      .from('gv_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('run_id', run_id)
      .eq('job_type', job_type)

    // Get the function name for this job type
    const functionName = JOB_FUNCTIONS[job_type]

    if (!functionName) {
      console.warn(`⚠️ No function mapping for job type: ${job_type}`)

      await supabase
        .from('gv_jobs')
        .update({
          status: 'skipped',
          error: 'Function not implemented',
          finished_at: new Date().toISOString()
        })
        .eq('run_id', run_id)
        .eq('job_type', job_type)

      return {
        job_type,
        status: 'skipped',
        error: 'Function not implemented',
        critical: false,
        duration_ms: Date.now() - startTime
      }
    }

    // Execute the Edge Function
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    console.log(`📤 Executing function: ${functionName}`)

    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        brand_id,
        run_id,
        cycle_window,
        job_type
      }),
    })

    const duration_ms = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Function ${functionName} failed:`, errorText)

      await supabase
        .from('gv_jobs')
        .update({
          status: 'failed',
          error: errorText,
          finished_at: new Date().toISOString(),
          duration_ms
        })
        .eq('run_id', run_id)
        .eq('job_type', job_type)

      return {
        job_type,
        status: 'failed',
        error: errorText,
        critical: job_type === 'cost-guard' || job_type === 'evidence-acquisition',
        duration_ms
      }
    }

    const result = await response.json()
    console.log(`✅ Function ${functionName} completed`)

    // Update job status to completed
    await supabase
      .from('gv_jobs')
      .update({
        status: 'completed',
        result,
        finished_at: new Date().toISOString(),
        duration_ms
      })
      .eq('run_id', run_id)
      .eq('job_type', job_type)

    return {
      job_type,
      status: 'completed',
      duration_ms
    }

  } catch (error: any) {
    const duration_ms = Date.now() - startTime
    console.error(`❌ Error executing ${job_type}:`, error.message)

    // Update job status to failed
    await supabase
      .from('gv_jobs')
      .update({
        status: 'failed',
        error: error.message,
        finished_at: new Date().toISOString(),
        duration_ms
      })
      .eq('run_id', run_id)
      .eq('job_type', job_type)

    return {
      job_type,
      status: 'failed',
      error: error.message,
      critical: job_type === 'cost-guard' || job_type === 'evidence-acquisition',
      duration_ms
    }
  }
}
