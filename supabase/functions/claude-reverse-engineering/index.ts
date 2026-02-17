// Claude Reverse Engineering - Analyze "HOW" to rank #1
// Client sees simple view, GeoVera executes complex strategy

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { brand_id, topic, rank_one_competitor } = await req.json();

    if (!brand_id || !topic || !rank_one_competitor) {
      throw new Error('brand_id, topic, and rank_one_competitor required');
    }

    // Get brand details
    const { data: brand } = await supabase
      .from('gv_brands')
      .select('name, website, industry')
      .eq('id', brand_id)
      .single();

    if (!brand) throw new Error('Brand not found');

    // Reverse engineer the #1 competitor
    const analysis = await reverseEngineer(topic, rank_one_competitor, brand);

    // Save analysis
    await supabase.from('gv_geo_reverse_engineering').insert({
      brand_id,
      topic,
      rank_one_competitor,
      analysis_data: analysis,
      created_at: new Date().toISOString(),
    });

    // Track cost
    await trackCost(0.15, brand_id); // Claude 3.5 Sonnet

    return new Response(JSON.stringify({ success: true, ...analysis }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function reverseEngineer(topic: string, competitor: string, brand: any) {
  const prompt = `You are an expert SEO and GEO strategist. Reverse engineer HOW "${competitor}" achieved rank #1 for the topic "${topic}".

**Brand Context**:
- Name: ${brand.name}
- Website: ${brand.website}
- Industry: ${brand.industry}

**Your Task**:
Analyze in extreme detail:

1. **Content Strategy**:
   - What type of content did they create?
   - What angle/perspective did they take?
   - What keywords did they target?
   - Content length, structure, formatting
   - Multimedia usage (images, videos, infographics)

2. **Authority Signals**:
   - Backlink profile (quantity, quality, sources)
   - Domain authority metrics
   - Brand mentions and citations
   - Social proof (reviews, testimonials)
   - Expert endorsements

3. **Technical Excellence**:
   - Page speed and performance
   - Mobile optimization
   - Schema markup and structured data
   - Internal linking structure
   - User experience (UX) elements

4. **Engagement Metrics**:
   - Estimated time on page
   - Bounce rate indicators
   - Social shares and engagement
   - Comments and discussions
   - Return visitor signals

5. **AI-Specific Factors** (for GEO):
   - Why do AI engines prefer citing them?
   - What makes their answer authoritative?
   - How do they structure information for AI consumption?
   - Unique data, research, or insights they provide
   - Credibility signals (studies, statistics, sources)

6. **Competitive Advantages**:
   - What do they have that ${brand.name} doesn't?
   - Unique value propositions
   - First-mover advantages
   - Strategic partnerships

**CRITICAL**: For each factor, provide:
- Current state analysis of competitor
- Gap analysis vs ${brand.name}
- SPECIFIC, ACTIONABLE steps ${brand.name} must take
- Priority level (Critical/High/Medium/Low)
- Estimated timeline to implement
- Expected impact on rankings

Return comprehensive JSON with:
{
  "summary": "Executive summary of why they rank #1",
  "content_strategy": {...},
  "authority_signals": {...},
  "technical_excellence": {...},
  "engagement_metrics": {...},
  "ai_factors": {...},
  "competitive_advantages": {...},
  "action_plan": [
    {
      "step": "Specific action",
      "priority": "Critical/High/Medium/Low",
      "timeline": "X weeks/months",
      "expected_impact": "Description",
      "resources_needed": ["List of resources"],
      "estimated_cost": "$X-Y",
      "success_metrics": ["How to measure success"]
    },
    ...
  ],
  "quick_wins": ["3-5 actions with immediate impact"],
  "long_term_strategy": "Overall strategic direction"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content[0].text;

  // Extract JSON
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract analysis JSON from Claude response');
  }

  const analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);

  // Add metadata
  analysis.analyzed_at = new Date().toISOString();
  analysis.competitor = competitor;
  analysis.topic = topic;
  analysis.model_used = 'claude-3-5-sonnet';

  console.log(`[Reverse Engineering] Completed for ${competitor} on topic: ${topic}`);

  return analysis;
}

async function trackCost(cost: number, brandId: string) {
  await supabase.from('gv_cost_tracking').insert({
    brand_id: brandId,
    feature: 'reverse_engineering',
    action: 'analyze',
    cost,
  });
}
