// supabase/functions/task-prioritization/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { run_id, brand_id, cycle_window } = await req.json()

    console.log(`📊 Prioritizing tasks for run ${run_id}`)

    // 1. Load tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('gv_tasks')
      .select('*')
      .eq('run_id', run_id)

    if (tasksError || !tasks) {
      throw new Error('Tasks not found')
    }

    // 2. Validate: Max 12
    if (tasks.length > 12) {
      return new Response(
        JSON.stringify({ error: 'Too many tasks', max: 12, actual: tasks.length }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📋 ${tasks.length} tasks to prioritize`)

    // 3. Compute PRIORITY scores (DIMENSION 1: Importance)
    const pillarWeights = { V: 1.0, D: 1.0, A: 1.2, T: 1.3 }
    
    for (const task of tasks) {
      const pillarWeight = pillarWeights[task.pillar as keyof typeof pillarWeights] || 1.0
      task.priority_score = (pillarWeight * task.impact * task.risk) / task.effort
    }

    // 4. Compute URGENCY scores (DIMENSION 2: Time-sensitivity)
    for (const task of tasks) {
      task.urgency_score = task.time_sensitivity + task.external_pressure
    }

    // 5. Classify into 2x2 matrix
    for (const task of tasks) {
      if (task.priority_score >= 4.0 && task.urgency_score >= 4) {
        task.category = 'DO_FIRST'
        task.due_window = '7d'
      } else if (task.priority_score >= 4.0 && task.urgency_score < 4) {
        task.category = 'PLAN_IT'
        task.due_window = task.urgency_score >= 2 ? '14d' : '28d'
      } else if (task.priority_score < 4.0 && task.urgency_score >= 4) {
        task.category = 'DELEGATE'
        task.due_window = '14d'
      } else {
        task.category = 'DEFER'
        task.due_window = 'later'
      }
    }

    // 6. Enforce capacity limits
    const doFirst = tasks.filter(t => t.category === 'DO_FIRST')
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 4)
    
    const planIt = tasks.filter(t => t.category === 'PLAN_IT')
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 6)
    
    const delegate = tasks.filter(t => t.category === 'DELEGATE')
      .sort((a, b) => b.urgency_score - a.urgency_score)
      .slice(0, 2)
    
    const active = [...doFirst, ...planIt, ...delegate]
    const deferred = tasks.filter(t => !active.includes(t))

    console.log(`✅ Prioritized: ${doFirst.length} DO_FIRST, ${planIt.length} PLAN_IT, ${delegate.length} DELEGATE, ${deferred.length} DEFER`)

    // 7. Update tasks in database
    for (const task of active) {
      await supabase
        .from('gv_tasks')
        .update({
          priority_score: task.priority_score,
          urgency_score: task.urgency_score,
          category: task.category,
          due_window: task.due_window,
          status: 'active'
        })
        .eq('id', task.id)
    }

    for (const task of deferred) {
      await supabase
        .from('gv_tasks')
        .update({
          priority_score: task.priority_score,
          urgency_score: task.urgency_score,
          category: 'DEFER',
          status: 'deferred'
        })
        .eq('id', task.id)
    }

    // 8. Update job
    await supabase
      .from('gv_jobs')
      .update({
        status: 'completed',
        result: {
          active_count: active.length,
          by_category: {
            do_first: doFirst.length,
            plan_it: planIt.length,
            delegate: delegate.length,
            defer: deferred.length
          }
        }
      })
      .eq('run_id', run_id)
      .eq('job_type', 'task-prioritization')

    return new Response(
      JSON.stringify({
        success: true,
        active_count: active.length,
        deferred_count: deferred.length,
        by_category: {
          do_first: doFirst.length,
          plan_it: planIt.length,
          delegate: delegate.length,
          defer: deferred.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Task prioritization error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})