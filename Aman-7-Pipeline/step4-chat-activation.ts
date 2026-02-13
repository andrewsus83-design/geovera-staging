import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * STEP 4: Chat Activation System
 * OpenAI GPT-4 Turbo processes questions into platform-specific Q&A with NLP profiling
 * Fixed: Changed from o1-mini to gpt-4-turbo (o1-mini doesn't support system prompts)
 */

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

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

    // Get all questions for this research
    const { data: questions } = await supabase
      .from('gv_smart_questions')
      .select(`
        *,
        gv_platform_research!inner(
          brand_id,
          primary_platform,
          gv_brand_chronicle(
            brand_dna,
            brand_narrative,
            brands(brand_name)
          )
        )
      `)
      .eq('research_id', research_id)
      .order('priority_rank')

    if (!questions || questions.length === 0) {
      throw new Error('No questions found')
    }

    const brandName = questions[0].gv_platform_research.gv_brand_chronicle.brands.brand_name
    const brandDNA = questions[0].gv_platform_research.gv_brand_chronicle.brand_dna
    const brandNarrative = questions[0].gv_platform_research.gv_brand_chronicle.brand_narrative
    const brand_id = questions[0].gv_platform_research.brand_id

    console.log(`Activating chat for ${brandName} with ${questions.length} questions`)

    // Group questions by platform
    const questionsByPlatform: any = {}
    questions.forEach((q: any) => {
      if (!questionsByPlatform[q.platform]) {
        questionsByPlatform[q.platform] = []
      }
      questionsByPlatform[q.platform].push(q)
    })

    // Generate platform-specific configs and Q&A
    const platformConfigs: any = {}
    const qaBank: any = []
    let totalTokens = 0

    for (const [platform, platformQuestions] of Object.entries(questionsByPlatform)) {
      console.log(`Processing ${platform}: ${(platformQuestions as any).length} questions`)

      // Define platform personality
      const platformProfile = getPlatformProfile(platform)
      
      // Build OpenAI prompt for this platform
      const prompt = buildChatActivationPrompt(
        brandName,
        brandDNA,
        brandNarrative,
        platform,
        platformProfile,
        platformQuestions as any[]
      )

      // Call OpenAI GPT-4 Turbo for Q&A generation
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          temperature: 0.3,
          max_tokens: 3000,
          messages: [
            {
              role: 'system',
              content: 'You are a Q&A specialist that generates concise, accurate answers for brand communication across different platforms.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      const openaiData = await response.json()
      const qaResponse = openaiData.choices[0].message.content
      totalTokens += openaiData.usage?.total_tokens || 0

      // Parse Q&A
      const platformQA = parseQAResponse(qaResponse, platform, platformQuestions as any[])
      qaBank.push(...platformQA)

      // Save platform config
      platformConfigs[platform] = {
        tone: platformProfile.tone,
        max_length: platformProfile.max_length,
        emoji_usage: platformProfile.emoji_usage,
        formality: platformProfile.formality,
        questions_count: (platformQuestions as any).length
      }
    }

    // Generate user behavior profiles
    const userProfiles = generateUserProfiles(questionsByPlatform)

    // Generate NLP patterns
    const nlpPatterns = generateNLPPatterns(questions)

    // Create brand persona
    const brandPersona = {
      tone: brandDNA.brand_voice || 'professional and friendly',
      style: 'conversational',
      emoji_usage: 'moderate',
      response_length: 'concise',
      personality_traits: ['helpful', 'knowledgeable', 'authentic']
    }

    // Save chat activation
    const { data: activation } = await supabase
      .from('gv_chat_activation')
      .insert({
        brand_id,
        platform_configs: platformConfigs,
        qa_bank: qaBank,
        total_questions: qaBank.length,
        user_profiles: userProfiles,
        nlp_patterns: nlpPatterns,
        brand_persona: brandPersona,
        activation_status: 'active',
        openai_tokens_used: totalTokens,
        activation_cost_usd: (totalTokens / 1000) * 0.01 // gpt-4-turbo pricing (~$0.01 per 1K tokens avg)
      })
      .select()
      .single()

    // Get priority breakdown
    const urgentQA = qaBank.filter((qa: any) => qa.urgency === 'high')
    const highImpactQA = qaBank.filter((qa: any) => qa.impact === 'high')

    return new Response(JSON.stringify({
      success: true,
      activation_id: activation.id,
      brand_name: brandName,
      chat_ready: true,
      statistics: {
        total_qa_pairs: qaBank.length,
        platforms_configured: Object.keys(platformConfigs).length,
        urgent_questions: urgentQA.length,
        high_impact_questions: highImpactQA.length,
        platform_breakdown: Object.entries(platformConfigs).map(([p, config]: any) => ({
          platform: p,
          questions: config.questions_count,
          tone: config.tone
        }))
      },
      tokens_used: totalTokens,
      cost_usd: activation.activation_cost_usd,
      next_step: 'Chat is LIVE! Use the chat API with activation_id: ' + activation.id
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Chat activation error:', error)
    return new Response(JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})

function getPlatformProfile(platform: string): any {
  const profiles: any = {
    tiktok: { tone: 'casual', max_length: 150, emoji_usage: 'high', formality: 'very_low' },
    instagram: { tone: 'friendly', max_length: 200, emoji_usage: 'high', formality: 'low' },
    twitter: { tone: 'witty', max_length: 280, emoji_usage: 'medium', formality: 'medium' },
    linkedin: { tone: 'professional', max_length: 500, emoji_usage: 'low', formality: 'high' },
    youtube: { tone: 'informative', max_length: 300, emoji_usage: 'medium', formality: 'medium' },
    google: { tone: 'informative', max_length: 400, emoji_usage: 'low', formality: 'high' },
    reddit: { tone: 'authentic', max_length: 500, emoji_usage: 'low', formality: 'medium' }
  }
  return profiles[platform] || profiles.google
}

function buildChatActivationPrompt(
  brandName: string,
  brandDNA: any,
  narrative: string,
  platform: string,
  profile: any,
  questions: any[]
): string {
  return `You are a Q&A specialist for ${brandName}. Generate perfect answers for ${platform}.

BRAND DNA: ${JSON.stringify(brandDNA)}
BRAND STORY: ${narrative}

PLATFORM: ${platform}
TONE: ${profile.tone}
MAX LENGTH: ${profile.max_length} chars
FORMALITY: ${profile.formality}

QUESTIONS (Top ${Math.min(questions.length, 20)}):
${questions.slice(0, 20).map((q: any, i: number) => `${i+1}. ${q.question_text} (Urgency: ${q.urgency_score}, Impact: ${q.impact_score})`).join('\n')}

GENERATE:
For each question, provide:
1. Concise answer (${profile.max_length} chars max)
2. Key points (3-5 bullets)
3. Urgency level (high/medium/low)
4. Impact level (high/medium/low)
5. Suggested follow-up questions

Output as JSON array: [{"question", "answer", "key_points", "urgency", "impact", "follow_ups"}]`
}

function parseQAResponse(response: string, platform: string, questions: any[]): any[] {
  try {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\[[\s\S]*\]/)
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response
    const parsed = JSON.parse(jsonStr)
    
    return parsed.map((qa: any, i: number) => ({
      question: qa.question || questions[i]?.question_text,
      answer: qa.answer,
      key_points: qa.key_points || [],
      platform,
      urgency: qa.urgency || 'medium',
      impact: qa.impact || 'medium',
      follow_ups: qa.follow_ups || [],
      priority: questions[i]?.priority_rank || i + 1
    }))
  } catch {
    return questions.slice(0, 10).map((q: any) => ({
      question: q.question_text,
      answer: `[Answer for: ${q.question_text}]`,
      key_points: [],
      platform,
      urgency: 'medium',
      impact: 'medium',
      follow_ups: [],
      priority: q.priority_rank
    }))
  }
}

function generateUserProfiles(questionsByPlatform: any): any {
  const profiles: any = {}
  Object.keys(questionsByPlatform).forEach(platform => {
    profiles[platform] = {
      age_range: platform === 'tiktok' ? '18-25' : platform === 'linkedin' ? '25-45' : '18-35',
      behavior: platform === 'tiktok' ? 'casual_browsers' : 'active_researchers',
      intent: 'informational',
      session_length: platform === 'tiktok' ? 'short' : 'medium'
    }
  })
  return profiles
}

function generateNLPPatterns(questions: any[]): any {
  const patterns: any = {}
  questions.forEach(q => {
    if (!patterns[q.platform]) {
      patterns[q.platform] = { common_phrases: [], keywords: [], slang: [] }
    }
    patterns[q.platform].keywords.push(...(q.keywords || []))
  })
  return patterns
}