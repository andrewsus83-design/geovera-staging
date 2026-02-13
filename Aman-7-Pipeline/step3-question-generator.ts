import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * STEP 3: Smart Question Generator
 * Claude generates 30-50 prioritized questions based on platform distribution
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

    const { research_id } = await req.json()
    if (!research_id) throw new Error('research_id required')

    // Get research data
    const { data: research } = await supabase
      .from('gv_platform_research')
      .select('*, gv_brand_chronicle(*, brands(brand_name, category))')
      .eq('id', research_id)
      .single()

    if (!research) throw new Error('Research not found')

    const brandName = research.gv_brand_chronicle.brands.brand_name
    const chronicle = research.gv_brand_chronicle

    console.log(`Generating questions for ${brandName}...`)
    console.log('Platform allocation:', research.question_allocation)

    // Build comprehensive prompt for question generation
    const prompt = `You are an expert Q&A strategist. Generate 50 highly valuable questions for ${brandName}'s AI chat assistant.

# BRAND DNA
${JSON.stringify(chronicle.brand_dna, null, 2)}

# CUSTOMER PROFILE
${JSON.stringify(chronicle.customer_profile, null, 2)}

# COMPETITIVE POSITION
${JSON.stringify(chronicle.competitive_position, null, 2)}

# PLATFORM DISTRIBUTION (PRIMARY: ${research.primary_platform})
${JSON.stringify(research.question_allocation, null, 2)}

# RESEARCH INSIGHTS
Market: ${JSON.stringify(research.market_intelligence.summary)}
Competitors: ${JSON.stringify(research.competitor_landscape.summary)}

# YOUR TASK:
Generate EXACTLY ${research.total_questions_planned} questions following this distribution:
${Object.entries(research.question_allocation).map(([platform, count]) => `- ${platform}: ${count} questions`).join('\n')}

For EACH question, provide:
1. question_text: The actual question users ask
2. platform: Which platform (match distribution above)
3. category: product, pricing, comparison, how_to, troubleshooting, general
4. importance_score: 1-100 (how critical to answer)
5. frequency_score: 1-100 (how often asked)
6. urgency_score: 1-100 (time sensitivity)
7. impact_score: 1-100 (business impact if answered well)
8. user_intent: informational, transactional, navigational, commercial
9. search_volume: low, medium, high, very_high
10. competitor_mentions: [array of competitors if mentioned]
11. keywords: [key terms in question]
12. requires_visual: true/false
13. requires_data: true/false
14. suggested_answer_length: short, medium, long

PRIORITIZE:
- Questions from PRIMARY platform (${research.primary_platform}) - these are MOST important
- High-frequency customer pain points
- Competitor comparison questions
- Product/service specific questions
- Time-sensitive / trending topics

OUTPUT FORMAT: JSON array of 50 question objects.
Output ONLY valid JSON, no markdown, no explanations.

EXAMPLE:
[
  {
    "question_text": "Is ${brandName} better than [competitor]?",
    "platform": "${research.primary_platform}",
    "category": "comparison",
    "importance_score": 95,
    "frequency_score": 90,
    "urgency_score": 70,
    "impact_score": 85,
    "user_intent": "commercial",
    "search_volume": "very_high",
    "competitor_mentions": ["competitor_name"],
    "keywords": ["${brandName}", "better", "vs"],
    "requires_visual": true,
    "requires_data": true,
    "suggested_answer_length": "medium"
  }
]`

    // Call Claude
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
        temperature: 0.2, // Lower for more consistent question generation
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const claudeData = await response.json()
    const questionsText = claudeData.content[0].text
    
    // Parse questions
    const jsonMatch = questionsText.match(/```json\n([\s\S]*?)\n```/) || 
                      questionsText.match(/\[[\s\S]*\]/)
    const questionsJson = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : questionsText
    const questions = JSON.parse(questionsJson)

    console.log(`Generated ${questions.length} questions`)

    // Calculate priority rank (urgency × impact × frequency)
    const questionsWithPriority = questions.map((q: any, index: number) => {
      const priorityScore = Math.round(
        (q.urgency_score * 0.3 + q.impact_score * 0.4 + q.frequency_score * 0.3)
      )
      
      return {
        brand_id: research.brand_id,
        research_id,
        question_text: q.question_text,
        question_category: q.category,
        platform: q.platform,
        importance_score: q.importance_score,
        frequency_score: q.frequency_score,
        urgency_score: q.urgency_score,
        impact_score: q.impact_score,
        priority_rank: 0, // will update after sorting
        user_intent: q.user_intent,
        search_volume: q.search_volume,
        competitor_mentions: q.competitor_mentions || [],
        keywords: q.keywords || [],
        entities: [], // extracted later
        sentiment: 'neutral',
        suggested_answer_length: q.suggested_answer_length,
        requires_visual: q.requires_visual || false,
        requires_data: q.requires_data || false,
        generation_confidence: 0.88,
        evidence_sources: []
      }
    })

    // Sort by priority and assign ranks
    questionsWithPriority.sort((a: any, b: any) => {
      const scoreA = a.urgency_score * 0.3 + a.impact_score * 0.4 + a.frequency_score * 0.3
      const scoreB = b.urgency_score * 0.3 + b.impact_score * 0.4 + b.frequency_score * 0.3
      return scoreB - scoreA
    })

    questionsWithPriority.forEach((q: any, i: number) => {
      q.priority_rank = i + 1
    })

    // Insert questions
    const { error: insertError } = await supabase
      .from('gv_smart_questions')
      .insert(questionsWithPriority)

    if (insertError) throw insertError

    // Get statistics
    const platformBreakdown = questionsWithPriority.reduce((acc: any, q: any) => {
      acc[q.platform] = (acc[q.platform] || 0) + 1
      return acc
    }, {})

    const categoryBreakdown = questionsWithPriority.reduce((acc: any, q: any) => {
      acc[q.question_category] = (acc[q.question_category] || 0) + 1
      return acc
    }, {})

    const urgentCount = questionsWithPriority.filter((q: any) => q.urgency_score >= 80).length
    const highImpactCount = questionsWithPriority.filter((q: any) => q.impact_score >= 80).length

    return new Response(JSON.stringify({
      success: true,
      brand_name: brandName,
      questions_generated: questionsWithPriority.length,
      platform_breakdown: platformBreakdown,
      category_breakdown: categoryBreakdown,
      priority_analysis: {
        urgent_questions: urgentCount,
        high_impact_questions: highImpactCount,
        top_3_platforms: Object.entries(platformBreakdown)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3)
          .map(([platform, count]) => ({ platform, count }))
      },
      cost_usd: (claudeData.usage?.output_tokens || 0) * 0.000015,
      next_step: 'Run step-4-chat-activation with research_id: ' + research_id
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Question generation error:', error)
    return new Response(JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})