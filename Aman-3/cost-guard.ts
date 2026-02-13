import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * Cost Guard Orchestrator v2
 * Manages 9-job sequential pipeline with retry logic and error handling
 * Jobs: cost-guard → evidence-acquisition → claude-question-gen →
 *       multi-ai-answers → claude-synthesis → openai-draft →
 *       task-prioritization → learning-note → customer-timeline
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  timeoutMs: 300000, // 5 minutes per job
}

interface JobConfig {
  name: string
  retryable: boolean
  critical: boolean
  timeoutMs?: number
}

const JOB_PIPELINE: JobConfig[] = [
  { name: 'cost-guard', retryable: false, critical: true },
  { name: 'evidence-acquisition', retryable: true, critical: true },
  { name: 'claude-question-gen', retryable: true, critical: true },
  { name: 'multi-ai-answers', retryable: true, critical: true },
  { name: 'claude-synthesis', retryable: true, critical: true },
  { name: 'openai-draft', retryable: true, critical: false },
  { name: 'task-prioritization', retryable: true, critical: false },
  { name: 'learning-note', retryable: true, critical: false },
  { name: 'customer-timeline', retryable: true, critical: false },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { brand_id, run_mode, cycle_window } = await req.json()

    // Validate inputs
    if (!brand_id || !run_mode || !cycle_window) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: brand_id, run_mode, cycle_window' }),
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
        status: 'running',
        started_at: new Date().toISOString()
      })

    if (runError) {
      throw new Error(`Failed to create run: ${runError.message}`)
    }

    console.log(`✅ Run created: ${run_id}`)

    // Step 1: Foundation Gate Check
    console.log('🔍 Checking Foundation Gate...')
    const foundationGate = await checkFoundationGate(supabase, brand_id)

    if (!foundationGate.passed) {
      await supabase
        .from('gv_runs')
        .update({
          status: 'failed_foundation_gate',
          error_message: foundationGate.reason,
          completed_at: new Date().toISOString()
        })
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

    // Step 2: Execute job pipeline with retry logic
    const jobResults: Record<string, any> = {}
    let pipelineFailed = false
    let failureReason = ''

    for (const jobConfig of JOB_PIPELINE) {
      console.log(`🚀 Starting job: ${jobConfig.name}`)

      // Create job record
      const { data: jobRecord, error: jobInsertError } = await supabase
        .from('gv_jobs')
        .insert({
          run_id,
          job_type: jobConfig.name,
          status: 'running',
          payload: { brand_id, cycle_window },
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (jobInsertError) {
        console.error(`Failed to create job record for ${jobConfig.name}:`, jobInsertError)
        continue
      }

      // Execute job with retry logic
      const jobResult = await executeJobWithRetry(
        supabase,
        run_id,
        jobRecord.id,
        jobConfig,
        brand_id,
        cycle_window
      )

      jobResults[jobConfig.name] = jobResult

      // Handle job failure
      if (!jobResult.success) {
        console.error(`❌ Job ${jobConfig.name} failed after retries`)

        // Update job status
        await supabase
          .from('gv_jobs')
          .update({
            status: 'failed',
            error_message: jobResult.error,
            retry_count: jobResult.retryCount || 0,
            completed_at: new Date().toISOString()
          })
          .eq('id', jobRecord.id)

        // If critical job failed, stop pipeline
        if (jobConfig.critical) {
          pipelineFailed = true
          failureReason = `Critical job ${jobConfig.name} failed: ${jobResult.error}`
          break
        } else {
          // Non-critical job failed, continue but log warning
          console.warn(`⚠️  Non-critical job ${jobConfig.name} failed, continuing...`)
          continue
        }
      }

      // Job succeeded
      console.log(`✅ Job ${jobConfig.name} completed`)
      await supabase
        .from('gv_jobs')
        .update({
          status: 'completed',
          result: jobResult.data,
          retry_count: jobResult.retryCount || 0,
          completed_at: new Date().toISOString()
        })
        .eq('id', jobRecord.id)
    }

    // Update final run status
    const finalStatus = pipelineFailed ? 'failed' : 'completed'
    await supabase
      .from('gv_runs')
      .update({
        status: finalStatus,
        error_message: pipelineFailed ? failureReason : null,
        completed_at: new Date().toISOString()
      })
      .eq('id', run_id)

    if (pipelineFailed) {
      return new Response(
        JSON.stringify({
          success: false,
          run_id,
          error: failureReason,
          job_results: jobResults
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🎉 Pipeline completed successfully for run: ${run_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        run_id,
        jobs_executed: JOB_PIPELINE.length,
        status: 'completed',
        job_results: jobResults
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

/**
 * Execute job with exponential backoff retry logic
 */
async function executeJobWithRetry(
  supabase: any,
  run_id: string,
  job_id: string,
  jobConfig: JobConfig,
  brand_id: string,
  cycle_window: string
): Promise<{ success: boolean; data?: any; error?: string; retryCount: number }> {
  const maxRetries = jobConfig.retryable ? RETRY_CONFIG.maxRetries : 0
  let retryCount = 0
  let lastError = ''

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = Math.min(
          RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
          RETRY_CONFIG.maxDelayMs
        )
        console.log(`⏳ Retry ${attempt}/${maxRetries} for ${jobConfig.name} after ${delayMs}ms...`)
        await sleep(delayMs)
      }

      // Execute the actual job function
      const result = await executeJobFunction(
        supabase,
        run_id,
        jobConfig.name,
        brand_id,
        cycle_window,
        jobConfig.timeoutMs || RETRY_CONFIG.timeoutMs
      )

      // Success!
      return { success: true, data: result, retryCount: attempt }

    } catch (error) {
      lastError = error.message
      retryCount = attempt

      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed for ${jobConfig.name}:`, error.message)

      // If not retryable or last attempt, fail
      if (!jobConfig.retryable || attempt >= maxRetries) {
        break
      }
    }
  }

  return { success: false, error: lastError, retryCount }
}

/**
 * Execute actual job function (simulate for now, replace with real function calls)
 */
async function executeJobFunction(
  supabase: any,
  run_id: string,
  job_type: string,
  brand_id: string,
  cycle_window: string,
  timeoutMs: number
): Promise<any> {
  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Job ${job_type} timed out after ${timeoutMs}ms`)), timeoutMs)
  })

  // Execute job with timeout
  const jobPromise = (async () => {
    // In production, this should call the actual Supabase Edge Function
    // For now, simulate with HTTP call to function endpoint
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const response = await fetch(`${supabaseUrl}/functions/v1/${job_type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        run_id,
        brand_id,
        cycle_window
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`${job_type} failed: ${errorText}`)
    }

    return await response.json()
  })()

  return Promise.race([jobPromise, timeoutPromise])
}

/**
 * Check foundation gate requirements
 */
async function checkFoundationGate(supabase: any, brand_id: string): Promise<{ passed: boolean; reason?: string }> {
  const { data: brand, error } = await supabase
    .from('gv_brands')
    .select('name, industry, monthly_budget_usd')
    .eq('id', brand_id)
    .single()

  if (error || !brand) {
    return { passed: false, reason: 'Brand not found' }
  }

  if (!brand.name || brand.name.trim() === '') {
    return { passed: false, reason: 'Missing brand name' }
  }

  if (!brand.industry || brand.industry.trim() === '') {
    return { passed: false, reason: 'Missing brand industry' }
  }

  if (!brand.monthly_budget_usd || brand.monthly_budget_usd <= 0) {
    return { passed: false, reason: 'Missing or invalid monthly budget' }
  }

  return { passed: true }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
