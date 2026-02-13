import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

interface CostDashboardResponse {
  brand_id: string
  period: string
  summary: {
    total_spend_usd: number
    budget_total_usd: number
    budget_utilization_percent: number
    budget_remaining_usd: number
  }
  by_provider: {
    apify: {
      total_usd: number
      actor_runs: number
      compute_units: number
    }
    perplexity: number
    claude: number
    openai: number
  }
  recent_runs: Array<{
    id: string
    created_at: string
    total_cost: number
    status: string
  }>
  alerts: Array<{
    severity: 'warning' | 'critical'
    message: string
  }>
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const url = new URL(req.url)
    const brandId = url.searchParams.get('brand_id')
    const period = url.searchParams.get('period') || 'current_month'

    if (!brandId) {
      throw new Error('brand_id parameter required')
    }

    const startOfMonth = getStartOfMonth()

    // Get Apify usage for current month
    const { data: apifyUsage } = await supabaseClient
      .from('gv_apify_usage')
      .select('*')
      .eq('brand_id', brandId)
      .gte('created_at', startOfMonth)

    const apifyTotalCost = apifyUsage?.reduce((sum, u) => sum + (u.cost_usd || 0), 0) || 0
    const apifyActorRuns = apifyUsage?.length || 0
    const apifyComputeUnits = apifyUsage?.reduce((sum, u) => sum + (u.compute_units || 0), 0) || 0

    // Get AI provider costs from gv_runs
    const { data: runs } = await supabaseClient
      .from('gv_runs')
      .select('id, created_at, perplexity_cost, claude_cost, openai_cost, status')
      .eq('brand_id', brandId)
      .gte('created_at', startOfMonth)
      .order('created_at', { ascending: false })
      .limit(10)

    const perplexityCost = runs?.reduce((sum, r) => sum + (r.perplexity_cost || 0), 0) || 0
    const claudeCost = runs?.reduce((sum, r) => sum + (r.claude_cost || 0), 0) || 0
    const openaiCost = runs?.reduce((sum, r) => sum + (r.openai_cost || 0), 0) || 0

    // Calculate total spend and budget
    const totalSpend = apifyTotalCost + perplexityCost + claudeCost + openaiCost

    // Get brand budget configuration (you may need to adjust this query)
    const { data: brandConfig } = await supabaseClient
      .from('gv_brands')
      .select('monthly_budget_usd')
      .eq('id', brandId)
      .single()

    const totalBudget = brandConfig?.monthly_budget_usd || 0

    // Generate alerts
    const alerts = []
    const utilizationPercent = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0

    if (utilizationPercent >= 100) {
      alerts.push({
        severity: 'critical' as const,
        message: `Monthly budget exceeded (${utilizationPercent.toFixed(0)}%)`,
      })
    } else if (utilizationPercent >= 80) {
      alerts.push({
        severity: 'warning' as const,
        message: `Monthly budget at ${utilizationPercent.toFixed(0)}% utilization`,
      })
    }

    // Check Apify-specific budget (optional)
    const apifyBudgetLimit = 100 // $100/month as mentioned in crawler-orchestrator-budget
    if (apifyTotalCost >= apifyBudgetLimit) {
      alerts.push({
        severity: 'critical' as const,
        message: `Apify costs exceeded target budget ($${apifyTotalCost.toFixed(2)} / $${apifyBudgetLimit})`,
      })
    } else if (apifyTotalCost >= apifyBudgetLimit * 0.8) {
      alerts.push({
        severity: 'warning' as const,
        message: `Apify costs at ${((apifyTotalCost / apifyBudgetLimit) * 100).toFixed(0)}% of target`,
      })
    }

    const response: CostDashboardResponse = {
      brand_id: brandId,
      period,
      summary: {
        total_spend_usd: totalSpend,
        budget_total_usd: totalBudget,
        budget_utilization_percent: utilizationPercent,
        budget_remaining_usd: Math.max(0, totalBudget - totalSpend),
      },
      by_provider: {
        apify: {
          total_usd: apifyTotalCost,
          actor_runs: apifyActorRuns,
          compute_units: apifyComputeUnits,
        },
        perplexity: perplexityCost,
        claude: claudeCost,
        openai: openaiCost,
      },
      recent_runs: runs?.map(r => ({
        id: r.id,
        created_at: r.created_at,
        total_cost: (r.perplexity_cost || 0) + (r.claude_cost || 0) + (r.openai_cost || 0),
        status: r.status,
      })) || [],
      alerts,
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function getStartOfMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}
