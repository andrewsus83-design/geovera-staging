// =====================================================
// CLAUDE FEEDBACK ANALYSIS EDGE FUNCTION
// Analyzes content for originality, NLP quality, and overall quality
// Only Claude AI has access to this function
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.20.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  content_id: string;
  content_type: 'seo_article' | 'geo_citation' | 'backlink_opportunity' | 'automated_action' | 'outreach_message' | 'social_post';
  content_text: string;
  brand_id: string;
  context?: {
    brand_name?: string;
    topic?: string;
    target_platform?: string;
    ai_engine?: string;
  };
}

interface ClaudeFeedbackResponse {
  originality: {
    score: number;
    plagiarism_detected: boolean;
    similar_content_urls: string[];
    uniqueness_assessment: string;
    recommendations: string[];
  };
  nlp_quality: {
    score: number;
    grammar_score: number;
    readability_score: number;
    coherence_score: number;
    natural_language_flow: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    issues_found: Array<{
      type: 'grammar' | 'readability' | 'coherence' | 'tone';
      description: string;
      suggested_fix: string;
    }>;
  };
  overall_quality: {
    score: number;
    relevance_to_topic: number;
    depth_of_content: number;
    value_to_audience: number;
    strengths: string[];
    weaknesses: string[];
    improvement_actions: string[];
  };
  recommendation: 'publish' | 'revise' | 'reject';
  revision_priority: 'high' | 'medium' | 'low';
  claude_analysis: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from auth
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Parse request
    const { content_id, content_type, content_text, brand_id, context }: FeedbackRequest = await req.json();

    // Verify brand ownership
    const { data: brand, error: brandError } = await supabaseClient
      .from('gv_brands')
      .select('*')
      .eq('id', brand_id)
      .eq('user_id', user.id)
      .single();

    if (brandError || !brand) {
      throw new Error('Brand not found or access denied');
    }

    // Initialize Claude
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY') ?? '',
    });

    // Construct Claude prompt for feedback analysis
    const feedbackPrompt = `You are a content quality analyst. Analyze the following content and provide detailed feedback on three dimensions:

1. **Originality** (0-100): How unique and original is this content? Is there any plagiarism or copied content?
2. **NLP Quality** (0-100): Grammar, readability, coherence, and natural language flow
3. **Overall Quality** (0-100): Relevance, depth, and value to the audience

**Content Type**: ${content_type}
**Context**: ${JSON.stringify(context || {}, null, 2)}

**Content to Analyze**:
"""
${content_text}
"""

**Your Task**:
Provide a comprehensive analysis in JSON format with the following structure:

{
  "originality": {
    "score": <number 0-100>,
    "plagiarism_detected": <boolean>,
    "similar_content_urls": <array of URLs if found>,
    "uniqueness_assessment": "<string describing uniqueness>",
    "recommendations": <array of recommendations to improve originality>
  },
  "nlp_quality": {
    "score": <number 0-100>,
    "grammar_score": <number 0-100>,
    "readability_score": <number 0-100>,
    "coherence_score": <number 0-100>,
    "natural_language_flow": "<excellent|good|needs_improvement|poor>",
    "issues_found": [
      {
        "type": "<grammar|readability|coherence|tone>",
        "description": "<description of issue>",
        "suggested_fix": "<how to fix it>"
      }
    ]
  },
  "overall_quality": {
    "score": <number 0-100>,
    "relevance_to_topic": <number 0-100>,
    "depth_of_content": <number 0-100>,
    "value_to_audience": <number 0-100>,
    "strengths": <array of strengths>,
    "weaknesses": <array of weaknesses>,
    "improvement_actions": <array of specific actions to improve>
  },
  "recommendation": "<publish|revise|reject>",
  "revision_priority": "<high|medium|low>",
  "claude_analysis": "<your detailed reasoning and analysis>"
}

**Scoring Guidelines**:
- 80-100: Excellent, ready to publish
- 60-79: Good but needs revision
- 0-59: Poor, should be rejected and regenerated

**Important**: Be thorough and provide actionable feedback. Focus on practical improvements.`;

    // Call Claude
    const startTime = Date.now();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: feedbackPrompt,
        },
      ],
    });

    const duration = Date.now() - startTime;

    // Extract JSON from Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON (Claude might wrap it in markdown code blocks)
    let feedbackData: ClaudeFeedbackResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedbackData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in Claude response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error(`Failed to parse Claude feedback: ${parseError.message}`);
    }

    // Calculate cost (Claude Sonnet 4: $3 per 1M input tokens, $15 per 1M output tokens)
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = (inputTokens / 1_000_000 * 3) + (outputTokens / 1_000_000 * 15);

    // Save feedback to database
    const { data: feedback, error: feedbackError } = await supabaseClient
      .from('gv_claude_feedback')
      .insert({
        brand_id,
        content_id,
        content_type,
        content_text,

        // Originality
        originality_score: feedbackData.originality.score,
        plagiarism_detected: feedbackData.originality.plagiarism_detected,
        similar_content_urls: feedbackData.originality.similar_content_urls,
        uniqueness_assessment: feedbackData.originality.uniqueness_assessment,
        originality_recommendations: feedbackData.originality.recommendations,

        // NLP Quality
        nlp_quality_score: feedbackData.nlp_quality.score,
        grammar_score: feedbackData.nlp_quality.grammar_score,
        readability_score: feedbackData.nlp_quality.readability_score,
        coherence_score: feedbackData.nlp_quality.coherence_score,
        natural_language_flow: feedbackData.nlp_quality.natural_language_flow,
        nlp_issues: feedbackData.nlp_quality.issues_found,

        // Overall Quality
        overall_quality_score: feedbackData.overall_quality.score,
        relevance_to_topic: feedbackData.overall_quality.relevance_to_topic,
        depth_of_content: feedbackData.overall_quality.depth_of_content,
        value_to_audience: feedbackData.overall_quality.value_to_audience,
        strengths: feedbackData.overall_quality.strengths,
        weaknesses: feedbackData.overall_quality.weaknesses,
        improvement_actions: feedbackData.overall_quality.improvement_actions,

        // Decision
        recommendation: feedbackData.recommendation,
        revision_priority: feedbackData.revision_priority,

        // Claude metadata
        claude_analysis: feedbackData.claude_analysis,
        claude_model: 'claude-sonnet-4',
        claude_tokens_used: inputTokens + outputTokens,
        claude_cost: cost,
      })
      .select()
      .single();

    if (feedbackError) {
      throw feedbackError;
    }

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        feedback_id: feedback.id,
        feedback: feedbackData,
        metadata: {
          tokens_used: inputTokens + outputTokens,
          cost,
          duration_ms: duration,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in Claude feedback analysis:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
