import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ResearchRequest {
  brand_id: string;
  research_topic: string;
  research_type: 'keyword_opportunity' | 'competitor_strategy' | 'content_gap_analysis' | 'backlink_opportunities' | 'serp_trends' | 'market_intelligence';
  search_recency?: 'day' | 'week' | 'month' | 'year';
}

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const { brand_id, research_topic, research_type, search_recency = 'month' }: ResearchRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Build Perplexity research query
    let perplexityQuery = '';
    
    switch (research_type) {
      case 'keyword_opportunity':
        perplexityQuery = `Find the top keyword opportunities for "${research_topic}" in SEO. Include:
- High-volume, low-competition keywords
- Long-tail keyword variations
- Question-based keywords
- Related semantic keywords
- Search trends and seasonality
- Competitor keywords we're missing`;
        break;
        
      case 'competitor_strategy':
        perplexityQuery = `Analyze the SEO strategy of "${research_topic}". Research:
- Their top-ranking keywords
- Content strategy and topics
- Backlink profile and sources
- Technical SEO approach
- Content formats they use
- What makes their content rank well`;
        break;
        
      case 'content_gap_analysis':
        perplexityQuery = `Identify content gaps and opportunities for "${research_topic}" based on:
- Topics competitors cover that we don't
- Underserved search queries
- Trending topics in the niche
- Question-based content opportunities
- Format opportunities (video, infographics, etc.)`;
        break;
        
      case 'backlink_opportunities':
        perplexityQuery = `Find backlink opportunities for "${research_topic}":
- High-authority sites in the niche
- Resource pages and link roundups
- Broken link opportunities
- Competitor backlink sources
- Guest posting opportunities
- Industry directories and listings`;
        break;
        
      case 'serp_trends':
        perplexityQuery = `Analyze current SERP trends for "${research_topic}":
- Featured snippet opportunities
- People Also Ask questions
- Related searches
- Top-ranking content types
- SERP features present
- Ranking difficulty and competition`;
        break;
        
      case 'market_intelligence':
        perplexityQuery = `Provide market intelligence for "${research_topic}":
- Industry trends and growth
- Customer pain points and needs
- Emerging topics and technologies
- Competitive landscape
- Market opportunities
- Search demand patterns`;
        break;
    }

    // Create research session
    const { data: session, error: sessionError } = await supabase
      .from('gv_perplexity_research_sessions')
      .insert({
        brand_id,
        research_topic,
        research_type,
        perplexity_query: perplexityQuery,
        search_recency,
        status: 'researching'
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Call Perplexity API
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO researcher. Provide comprehensive, data-driven insights with specific examples and actionable recommendations. Always cite your sources.'
          },
          {
            role: 'user',
            content: perplexityQuery
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        return_citations: true,
        return_images: false,
        search_recency_filter: search_recency
      })
    });

    const perplexityData = await perplexityResponse.json();
    
    const researchSummary = perplexityData.choices?.[0]?.message?.content || '';
    const citations = perplexityData.citations || [];

    // Extract structured insights from research
    const keywordOpportunities: any[] = [];
    const competitorInsights: any[] = [];
    const contentGaps: any[] = [];
    const actionableRecommendations: any[] = [];

    // Parse Perplexity response for structured data
    const lines = researchSummary.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract keywords
      if (trimmed.match(/keyword|search term/i) && trimmed.includes(':')) {
        const keyword = trimmed.split(':')[1]?.trim();
        if (keyword) {
          keywordOpportunities.push({ keyword, source: 'perplexity_research' });
        }
      }
      
      // Extract recommendations
      if (trimmed.match(/^\d+\.|^-|^•/) && trimmed.length > 20) {
        actionableRecommendations.push({
          recommendation: trimmed.replace(/^[\d\.\-•]\s*/, ''),
          priority: actionableRecommendations.length < 3 ? 'high' : 'medium'
        });
      }
    }

    // Process citations
    const sourcesCited = citations.map((citation: any, index: number) => ({
      position: index + 1,
      url: citation.url || citation,
      title: citation.title || '',
      relevance: 'high'
    }));

    // Calculate quality scores
    const researchDepthScore = Math.min(1.0, researchSummary.length / 2000);
    const actionabilityScore = Math.min(1.0, actionableRecommendations.length / 10);
    const confidenceScore = citations.length >= 5 ? 0.9 : 0.7;

    // Update session with results
    await supabase
      .from('gv_perplexity_research_sessions')
      .update({
        status: 'completed',
        research_summary: researchSummary,
        detailed_findings: {
          full_analysis: researchSummary,
          key_points: actionableRecommendations.slice(0, 10)
        },
        sources_cited: sourcesCited,
        confidence_score: confidenceScore,
        keyword_opportunities: keywordOpportunities.length > 0 ? keywordOpportunities : null,
        competitor_insights: competitorInsights.length > 0 ? competitorInsights : null,
        content_gaps: contentGaps.length > 0 ? contentGaps : null,
        actionable_recommendations: actionableRecommendations.length > 0 ? actionableRecommendations : null,
        total_sources: citations.length,
        high_authority_sources: citations.length,
        research_depth_score: researchDepthScore,
        actionability_score: actionabilityScore,
        completed_at: new Date().toISOString()
      })
      .eq('id', session.id);

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        research_summary: researchSummary,
        sources_count: citations.length,
        insights_extracted: {
          keywords: keywordOpportunities.length,
          recommendations: actionableRecommendations.length
        },
        quality_scores: {
          research_depth: researchDepthScore,
          actionability: actionabilityScore,
          confidence: confidenceScore
        },
        top_recommendations: actionableRecommendations.slice(0, 5)
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
    console.error('Perplexity research error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});