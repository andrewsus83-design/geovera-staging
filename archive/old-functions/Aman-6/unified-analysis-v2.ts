import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface UnifiedAnalysisRequest {
  brand_id: string;
  analysis_type: 'intelligence' | 'llm_seo' | 'both';
  question_count?: number;
  llm_platforms?: string[];
  use_cached_questions?: boolean;
}

serve(async (req: Request) => {
  try {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, content-type'
        }
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const {
      brand_id,
      analysis_type = 'both',
      question_count,
      llm_platforms = ['chatgpt', 'claude', 'gemini', 'perplexity', 'grok'],
      use_cached_questions = false
    }: UnifiedAnalysisRequest = await req.json();

    if (!brand_id) {
      return new Response(JSON.stringify({ error: 'brand_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get brand with tier configuration
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id, brand_name, subscription_tier, daily_qa_limit, qa_split_config')
      .eq('id', brand_id)
      .single();

    if (brandError || !brand) {
      return new Response(JSON.stringify({ error: 'Brand not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine question allocation based on tier
    const qaConfig = brand.qa_split_config || { intelligence: 30, llm_seo: 30 };
    const totalQuestions = question_count || brand.daily_qa_limit || 60;

    // Generate run ID
    const runId = crypto.randomUUID();

    // Generate questions based on analysis type
    let allQuestions: { text: string; type: string; category: string }[] = [];

    if (analysis_type === 'intelligence' || analysis_type === 'both') {
      const intelCount = analysis_type === 'both' ? qaConfig.intelligence : totalQuestions;
      const intelQuestions = generateQuestions(
        brand.brand_name,
        intelCount,
        'intelligence'
      );
      allQuestions.push(...intelQuestions);
    }

    if (analysis_type === 'llm_seo' || analysis_type === 'both') {
      const llmCount = analysis_type === 'both' ? qaConfig.llm_seo : totalQuestions;
      const llmQuestions = generateQuestions(
        brand.brand_name,
        llmCount,
        'llm_seo'
      );
      allQuestions.push(...llmQuestions);
    }

    if (analysis_type === 'both' && qaConfig.cross_analysis) {
      const crossQuestions = generateQuestions(
        brand.brand_name,
        qaConfig.cross_analysis,
        'cross_analysis'
      );
      allQuestions.push(...crossQuestions);
    }

    // Store question set
    await supabase.from('gv_question_sets').insert({
      run_id: runId,
      questions: allQuestions.map(q => q.text),
      version: '2.0-integrated',
      question_category: analysis_type,
      brand_id: brand_id
    });

    // Simulate multi-AI responses (in production, call actual APIs)
    const responses: any[] = [];

    for (const platform of llm_platforms) {
      for (const question of allQuestions) {
        const mockResponse = generateMockResponse(
          brand.brand_name,
          question.text,
          question.category
        );

        const analysis = analyzeResponse(
          mockResponse,
          brand.brand_name,
          question.category
        );

        const { data, error } = await supabase
          .from('gv_multi_ai_answers')
          .insert({
            run_id: runId,
            question_id: `${runId}-${question.text.substring(0, 20)}`,
            model_name: platform,
            answer_text: mockResponse,
            is_contradiction: false,
            analysis_type: question.category,
            brand_mentioned: analysis.brand_mentioned,
            mention_count: analysis.mention_count,
            mention_position: analysis.mention_position,
            sentiment_score: analysis.sentiment,
            is_recommendation: analysis.is_recommendation,
            competitors_mentioned: analysis.competitors_mentioned
          })
          .select()
          .single();

        if (!error && data) {
          responses.push(data);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        run_id: runId,
        analysis_type,
        stats: {
          total_questions: allQuestions.length,
          intelligence_questions: allQuestions.filter(q => q.category === 'intelligence').length,
          llm_seo_questions: allQuestions.filter(q => q.category === 'llm_seo').length,
          cross_analysis_questions: allQuestions.filter(q => q.category === 'cross_analysis').length,
          llm_platforms: llm_platforms.length,
          total_responses: responses.length
        },
        message: analysis_type === 'both' 
          ? 'Dual analysis complete: Brand Intelligence + LLM SEO'
          : `${analysis_type} analysis complete`
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Unified analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});

function generateQuestions(
  brandName: string,
  count: number,
  category: 'intelligence' | 'llm_seo' | 'cross_analysis'
): { text: string; type: string; category: string }[] {
  const templates: Record<string, string[]> = {
    intelligence: [
      `What is the market position of ${brandName}?`,
      `How does ${brandName} compare to competitors?`,
      `What are the key features of ${brandName}?`,
      `What is the sentiment around ${brandName}?`,
      `What are people saying about ${brandName}?`
    ],
    llm_seo: [
      `What is ${brandName}?`,
      `Tell me about ${brandName}`,
      `Should I use ${brandName}?`,
      `Do you recommend ${brandName}?`,
      `How does ${brandName} work?`,
      `What can I do with ${brandName}?`,
      `Is ${brandName} worth it?`,
      `${brandName} vs alternatives`
    ],
    cross_analysis: [
      `Based on market data, how visible is ${brandName} in AI conversations?`,
      `Does ${brandName}'s market presence match its AI visibility?`,
      `What's the correlation between ${brandName}'s reputation and AI recommendations?`
    ]
  };

  const categoryTemplates = templates[category] || templates.intelligence;
  const questions: { text: string; type: string; category: string }[] = [];

  for (let i = 0; i < count; i++) {
    const template = categoryTemplates[i % categoryTemplates.length];
    questions.push({
      text: template,
      type: category === 'llm_seo' ? 'brand_awareness' : 'general',
      category
    });
  }

  return questions;
}

function generateMockResponse(brandName: string, question: string, category: string): string {
  const responses = [
    `${brandName} is a leading solution in its category. It offers innovative features and has received positive feedback from users.`,
    `I would recommend ${brandName} for your needs. It's known for its quality and reliability.`,
    `${brandName} provides excellent value. Many users have reported great experiences with it.`,
    `Based on available information, ${brandName} is a solid choice. It has strong market presence and good reviews.`,
    `${brandName} stands out for its unique approach. It's worth considering for your requirements.`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

function analyzeResponse(
  responseText: string,
  brandName: string,
  category: string
): {
  brand_mentioned: boolean;
  mention_count: number;
  mention_position: number | null;
  sentiment: number;
  is_recommendation: boolean;
  competitors_mentioned: string[];
} {
  const lowerText = responseText.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  const brandRegex = new RegExp(`\\b${escapeRegex(lowerBrand)}\\b`, 'gi');
  const matches = responseText.match(brandRegex) || [];
  const brandMentioned = matches.length > 0;

  let mentionPosition = null;
  if (brandMentioned) {
    const firstIndex = lowerText.indexOf(lowerBrand);
    const sentencesBefore = responseText.substring(0, firstIndex).split(/[.!?]/).length;
    mentionPosition = sentencesBefore;
  }

  const sentiment = brandMentioned ? calculateSentiment(responseText) : 0;
  const isRecommendation = lowerText.includes('recommend') || lowerText.includes('worth');

  return {
    brand_mentioned: brandMentioned,
    mention_count: matches.length,
    mention_position: mentionPosition,
    sentiment,
    is_recommendation: isRecommendation,
    competitors_mentioned: []
  };
}

function calculateSentiment(text: string): number {
  const positive = ['excellent', 'great', 'best', 'recommended', 'quality', 'innovative', 'solid'];
  const negative = ['poor', 'bad', 'avoid', 'limited', 'lacking'];

  const lowerText = text.toLowerCase();
  let score = 0;

  positive.forEach(word => { if (lowerText.includes(word)) score++; });
  negative.forEach(word => { if (lowerText.includes(word)) score--; });

  return Math.max(-1, Math.min(1, score / 3));
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
