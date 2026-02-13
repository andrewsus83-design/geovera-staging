import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * Task Management API
 * Allows updating task status, priority, and assignments
 */

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // PATCH /tasks/:id - Update task
    if (req.method === 'PATCH' && pathParts[0] === 'tasks' && pathParts[1]) {
      const taskId = pathParts[1]
      const updates = await req.json()

      // Validate allowed fields
      const allowedFields = ['status', 'priority', 'assigned_to', 'notes', 'completed_at']
      const filteredUpdates: any = {}
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field]
        }
      }

      // Auto-set completed_at if status changes to 'done'
      if (updates.status === 'done' && !filteredUpdates.completed_at) {
        filteredUpdates.completed_at = new Date().toISOString()
      }

      // Auto-clear completed_at if status changes away from 'done'
      if (updates.status && updates.status !== 'done') {
        filteredUpdates.completed_at = null
      }

      const { data, error } = await supabaseClient
        .from('gv_tasks')
        .update(filteredUpdates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, task: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /tasks - Create new task
    if (req.method === 'POST' && pathParts[0] === 'tasks') {
      const taskData = await req.json()

      // Required fields
      if (!taskData.brand_id || !taskData.title) {
        return new Response(
          JSON.stringify({ error: 'brand_id and title are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabaseClient
        .from('gv_tasks')
        .insert({
          brand_id: taskData.brand_id,
          run_id: taskData.run_id,
          title: taskData.title,
          description: taskData.description,
          task_type: taskData.task_type || 'optimization',
          priority: taskData.priority || 100,
          status: taskData.status || 'todo',
          estimated_effort: taskData.estimated_effort,
          assigned_to: taskData.assigned_to,
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, task: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /tasks/:id - Delete task
    if (req.method === 'DELETE' && pathParts[0] === 'tasks' && pathParts[1]) {
      const taskId = pathParts[1]

      const { error } = await supabaseClient
        .from('gv_tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Task deleted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /tasks/stats - Get task statistics
    if (req.method === 'GET' && pathParts[0] === 'tasks' && pathParts[1] === 'stats') {
      const brandId = url.searchParams.get('brand_id')

      if (!brandId) {
        return new Response(
          JSON.stringify({ error: 'brand_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get task counts by status
      const { data: tasks } = await supabaseClient
        .from('gv_tasks')
        .select('status, priority')
        .eq('brand_id', brandId)

      const stats = {
        total: tasks?.length || 0,
        by_status: {
          todo: tasks?.filter(t => t.status === 'todo').length || 0,
          in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
          done: tasks?.filter(t => t.status === 'done').length || 0,
          blocked: tasks?.filter(t => t.status === 'blocked').length || 0,
        },
        by_priority: {
          urgent: tasks?.filter(t => t.priority <= 25).length || 0,
          high: tasks?.filter(t => t.priority > 25 && t.priority <= 50).length || 0,
          normal: tasks?.filter(t => t.priority > 50 && t.priority <= 100).length || 0,
          low: tasks?.filter(t => t.priority > 100).length || 0,
        },
        completion_rate: tasks && tasks.length > 0
          ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
          : 0,
      }

      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})