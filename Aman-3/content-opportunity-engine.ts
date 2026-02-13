import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.3'

/**
 * Content Opportunity Engine
 * Analyzes trending content and identifies content opportunities for brands
 * Uses Claude AI to analyze patterns and suggest actionable content ideas
 */

interface OpportunityRequest {
  brand_id: string
  min_engagement_score?: number
  lookback_days?: number
  max_opportunities?: number
}

interface ContentOpportunity {
  title: string
  opportunity_type: 'trending_topic' | 'viral_format' | 'competitor_gap' | 'seasonal_trend' | 'audience_interest'
  description: string
  confidence_score: number
  suggested_platforms: string[]
  reasoning: string
  data_sources: string[]
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

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY') ?? '',
    })

    const {
      brand_id,
      min_engagement_score = 60,
      lookback_days = 7,
      max_opportunities = 10
    }: OpportunityRequest = await req.json()

    if (!brand_id) {
      throw new Error('brand_id is required')
    }

    console.log(`🔍 Analyzing content opportunities for brand: ${brand_id}`)

    // 1. Get brand context
    const { data: brand } = await supabaseClient
      .from('gv_brands')
      .select('name, industry, domain')
      .eq('id', brand_id)
      .single()

    if (!brand) {
      throw new Error('Brand not found')
    }

    // 2. Get recent high-performing content from raw artifacts
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - lookback_days)

    const { data: artifacts } = await supabaseClient
      .from('gv_raw_artifacts')
      .select('platform, payload, created_at')
      .eq('brand_id', brand_id)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (!artifacts || artifacts.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        opportunities: [],
        message: 'No recent data available for analysis'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Extract high-engagement content
    const highEngagementContent = artifacts
      .filter(a => {
        const engagement = a.payload?.engagement_score || a.payload?.likes || 0
        return engagement >= min_engagement_score
      })
      .slice(0, 50)

    // 4. Use Claude to analyze patterns and identify opportunities
    const prompt = `You are a content strategist analyzing social media data for "${brand.name}" in the ${brand.industry} industry.

RECENT HIGH-PERFORMING CONTENT:
${JSON.stringify(highEngagementContent.map(a => ({
  platform: a.platform,
  content_type: a.payload?.type || 'post',
  engagement: a.payload?.engagement_score || a.payload?.likes || 0,
  caption: a.payload?.caption?.substring(0, 200),
  hashtags: a.payload?.hashtags,
  posted_date: a.created_at
})), null, 2)}

TASK:
Analyze the data above and identify ${max_opportunities} actionable content opportunities. For each opportunity:
1. Identify a clear trend or pattern
2. Explain why it's relevant for this brand
3. Suggest specific platforms to target
4. Provide confidence score (0-100)

Return ONLY a valid JSON array with this structure:
[
  {
    "title": "Brief opportunity title",
    "opportunity_type": "trending_topic|viral_format|competitor_gap|seasonal_trend|audience_interest",
    "description": "Detailed description of the opportunity",
    "confidence_score": 85,
    "suggested_platforms": ["instagram", "tiktok"],
    "reasoning": "Why this is a good opportunity",
    "data_sources": ["List of data points that support this"]
  }
]`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response (handle markdown code blocks)
    let opportunities: ContentOpportunity[] = []
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        opportunities = JSON.parse(jsonMatch[0])
      } else {
        opportunities = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError)
      throw new Error('Failed to parse AI response. Please try again.')
    }

    // Calculate cost
    const inputTokens = message.usage.input_tokens
    const outputTokens = message.usage.output_tokens
    const costUsd = (inputTokens * 3 / 1_000_000) + (outputTokens * 15 / 1_000_000)

    // 5. Save opportunities to database
    const opportunityRecords = opportunities.map(opp => ({
      brand_id,
      title: opp.title,
      opportunity_type: opp.opportunity_type,
      description: opp.description,
      confidence_score: opp.confidence_score,
      suggested_platforms: opp.suggested_platforms,
      reasoning: opp.reasoning,
      data_sources: opp.data_sources,
      status: 'pending',
      created_at: new Date().toISOString()
    }))

    await supabaseClient
      .from('gv_content_opportunities')
      .insert(opportunityRecords)

    console.log(`✅ Identified ${opportunities.length} content opportunities (Cost: $${costUsd.toFixed(4)})`)

    return new Response(JSON.stringify({
      success: true,
      opportunities,
      metadata: {
        brand_name: brand.name,
        analyzed_content_count: highEngagementContent.length,
        lookback_days,
        cost_usd: costUsd,
        tokens: { input: inputTokens, output: outputTokens }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Content opportunity error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
