import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * STEP 1: Brand Chronicle Analyzer
 * Claude Sonnet 4 reverse engineers complete brand DNA
 */

const CLAUDE_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), 
      { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { brand_id } = await req.json()
    if (!brand_id) throw new Error('brand_id required')

    // Gather all brand data
    const brandData = await gatherBrandData(supabase, brand_id)
    if (!brandData.brand) throw new Error('Brand not found')

    // Build comprehensive prompt
    const prompt = `You are an elite brand intelligence analyst. Analyze this brand's complete data and reverse-engineer their Brand Chronicle - a comprehensive DNA document.

# BRAND: ${brandData.brand.brand_name}
Category: ${brandData.brand.category || 'Unknown'}
Country: ${brandData.brand.country || 'Unknown'}

# DATA AVAILABLE:
- ${brandData.insights.length} AI insights
- ${brandData.reviews.length} customer reviews & mentions
- ${brandData.social.length} social signals
- ${brandData.search.length} search data points

# INSIGHTS SUMMARY:
${JSON.stringify(brandData.insights.slice(0, 10), null, 2)}

# CUSTOMER REVIEWS:
${JSON.stringify(brandData.reviews.slice(0, 15), null, 2)}

# SOCIAL SIGNALS:
${JSON.stringify(brandData.social.slice(0, 10), null, 2)}

# YOUR TASK:
Reverse-engineer complete brand DNA in JSON format:

{
  "brand_dna": {
    "core_identity": "Deep essence of the brand",
    "brand_voice": "Communication style and tone",
    "visual_identity": "Design patterns and aesthetics",
    "emotional_positioning": "Emotional appeal strategy"
  },
  "business_model": {
    "revenue_streams": ["primary income sources"],
    "target_market": "Ideal customer segments",
    "value_proposition": "Unique value offering",
    "distribution_channels": ["how they reach customers"]
  },
  "competitive_position": {
    "strengths": ["key advantages"],
    "weaknesses": ["areas to improve"],
    "differentiators": ["what makes them unique"],
    "market_position": "Leader/Challenger/Niche"
  },
  "customer_profile": {
    "demographics": "Age, location, income",
    "psychographics": "Lifestyle, values, attitudes",
    "pain_points": ["customer problems"],
    "motivations": ["why they buy"]
  },
  "brand_narrative": "Compelling brand story (200-300 words)",
  "key_themes": ["3-5 main themes"],
  "strategic_focus": ["3-5 focus areas"],
  "brand_pillars": ["3-5 core pillars"]
}

Be insightful, data-driven, and comprehensive. Output ONLY valid JSON.`

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192, // Claude Sonnet 4 recommended limit for structured output
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const claudeData = await response.json()
    const chronicleText = claudeData.content[0].text
    
    // Parse JSON (strip markdown if present)
    const jsonMatch = chronicleText.match(/```json\n([\s\S]*?)\n```/) || 
                      chronicleText.match(/```\n([\s\S]*?)\n```/)
    const cleanJson = jsonMatch ? jsonMatch[1] : chronicleText
    const chronicle = JSON.parse(cleanJson)

    // Save to database
    const { data: saved } = await supabase
      .from('gv_brand_chronicle')
      .insert({
        brand_id,
        brand_dna: chronicle.brand_dna,
        business_model: chronicle.business_model,
        competitive_position: chronicle.competitive_position,
        customer_profile: chronicle.customer_profile,
        brand_narrative: chronicle.brand_narrative,
        key_themes: chronicle.key_themes,
        strategic_focus: chronicle.strategic_focus,
        brand_pillars: chronicle.brand_pillars || [],
        full_document: chronicleText,
        data_sources_count: {
          insights: brandData.insights.length,
          reviews: brandData.reviews.length,
          social: brandData.social.length,
          search: brandData.search.length
        },
        tokens_used: claudeData.usage?.output_tokens || 0,
        cost_usd: (claudeData.usage?.output_tokens || 0) * 0.000015
      })
      .select()
      .single()

    return new Response(JSON.stringify({
      success: true,
      chronicle_id: saved.id,
      brand_name: brandData.brand.brand_name,
      analysis: {
        themes: chronicle.key_themes?.length || 0,
        pillars: chronicle.brand_pillars?.length || 0,
        narrative_words: chronicle.brand_narrative?.split(' ').length || 0,
        data_sources: Object.values(saved.data_sources_count).reduce((a: any, b: any) => a + b, 0)
      },
      cost_usd: saved.cost_usd,
      next_step: 'Run step-2-platform-research with chronicle_id: ' + saved.id
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})

async function gatherBrandData(supabase: any, brand_id: string) {
  const [brand, insights, reviews, social, search] = await Promise.all([
    supabase.from('brands').select('*').eq('id', brand_id).single(),
    supabase.from('gv_insights').select('*').eq('brand_id', brand_id).limit(20),
    supabase.from('gv_strategic_evidence').select('*').eq('brand_id', brand_id).limit(30),
    supabase.from('gv_pulse_signals').select('*').eq('brand_id', brand_id).limit(20),
    supabase.from('gv_search_visibility').select('*').eq('brand_id', brand_id).limit(10)
  ])
  return {
    brand: brand.data,
    insights: insights.data || [],
    reviews: reviews.data || [],
    social: social.data || [],
    search: search.data || []
  }
}