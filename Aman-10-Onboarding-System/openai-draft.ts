// supabase/functions/openai-draft/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AUTHORITY_DRAFT_PROMPT = `You are a Senior Authority Writer & Action Articulator.

CRITICAL: You are NOT allowed to create new insights. You can ONLY articulate what has been prepared for you.

Your job:
1. Read the synthesis package (already prepared by another AI)
2. Articulate insights into:
   - Authority Content Draft (evidence-bound)
   - To-Do List (max 12 tasks)
   - Learning Note (DRAFT)

PROHIBITED:
- Creating new insights
- Filling evidence gaps
- Resolving contradictions
- Hiding uncertainty

For each task, you MUST provide:
{
  "description": "Task description",
  "pillar": "V | D | A | T",
  "impact": 1-3,
  "risk": 1-3,
  "effort": 1-3,
  "time_sensitivity": 1-3,
  "external_pressure": 0-2,
  "dod": "Definition of Done"
}

Output JSON:
{
  "authority_content": "...",
  "todo_list": [...], // MAX 12 tasks
  "learning_note": {...}
}`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { run_id, brand_id, synthesis_package_ref } = await req.json()

    console.log(`🎨 Generating authority draft for run ${run_id}`)

    // 1. Cost guard
    const costCheckResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/cost-guard`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        brand_id,
        job_type: 'openai_draft',
        estimated_tokens: 12000,
        model: 'gpt-4o'
      })
    })

    const costCheck = await costCheckResponse.json()

    if (!costCheck.approved) {
      return new Response(
        JSON.stringify({ error: 'Budget exceeded' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Load synthesis package
    const { data: synthPackage, error: synthError } = await supabase
      .from('gv_synthesis_packages')
      .select('*')
      .eq('run_id', run_id)
      .single()

    if (synthError || !synthPackage) {
      throw new Error('Synthesis package not found')
    }

    // 3. Call OpenAI API
    console.log('🤖 Calling OpenAI API...')
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: AUTHORITY_DRAFT_PROMPT
          },
          {
            role: 'user',
            content: `Generate authority draft from this synthesis package:\n\n${JSON.stringify(synthPackage)}`
          }
        ],
        max_tokens: 12000,
        temperature: 0.7
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    const responseText = openaiData.choices[0].message.content

    // 4. Parse draft
    let draft
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        draft = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      throw new Error('Failed to parse OpenAI response')
    }

    // 5. Validate: 3 artifacts
    if (!draft.authority_content || !draft.todo_list || !draft.learning_note) {
      return new Response(
        JSON.stringify({ error: 'Incomplete draft - missing artifacts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Validate: Max 12 tasks
    if (draft.todo_list.length > 12) {
      return new Response(
        JSON.stringify({
          error: 'Too many tasks',
          max: 12,
          actual: draft.todo_list.length
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Validate: All tasks have required attributes
    for (const task of draft.todo_list) {
      if (!task.impact || !task.risk || !task.time_sensitivity || 
          task.external_pressure === undefined || !task.pillar || !task.effort || !task.dod) {
        return new Response(
          JSON.stringify({
            error: 'Task missing required attributes',
            task: task.description
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log(`✅ Draft validated: ${draft.todo_list.length} tasks`)

    // 8. Save draft
    const { data: savedDraft, error: saveError } = await supabase
      .from('gv_authority_drafts')
      .insert({
        run_id,
        authority_content: draft.authority_content,
        todo_list: draft.todo_list,
        learning_note_draft: draft.learning_note,
        status: 'draft'
      })
      .select()
      .single()

    if (saveError) {
      throw new Error(`Failed to save draft: ${saveError.message}`)
    }

    // 9. Save tasks individually
    for (const task of draft.todo_list) {
      await supabase
        .from('gv_tasks')
        .insert({
          run_id,
          description: task.description,
          pillar: task.pillar,
          impact: task.impact,
          risk: task.risk,
          effort: task.effort,
          time_sensitivity: task.time_sensitivity,
          external_pressure: task.external_pressure,
          status: 'pending'
        })
    }

    // 10. Update job
    await supabase
      .from('gv_jobs')
      .update({
        status: 'completed',
        result: { 
          draft_id: savedDraft.id,
          task_count: draft.todo_list.length 
        },
        cost_usd: costCheck.cost_estimate
      })
      .eq('run_id', run_id)
      .eq('job_type', 'openai-draft')

    console.log('✅ Draft completed and saved')

    return new Response(
      JSON.stringify({
        success: true,
        draft_id: savedDraft.id,
        task_count: draft.todo_list.length,
        cost_usd: costCheck.cost_estimate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ OpenAI draft error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})