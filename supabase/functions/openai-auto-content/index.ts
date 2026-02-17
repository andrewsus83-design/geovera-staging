// OpenAI Auto Content - 100% automation
// Executes strategies from Claude feedback + reverse engineering

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { action, brand_id, strategy_id, content_type } = await req.json();

    let result;

    switch (action) {
      case 'generate_content':
        result = await generateContent(brand_id, strategy_id, content_type);
        break;
      case 'execute_outreach':
        result = await executeOutreach(brand_id, strategy_id);
        break;
      case 'auto_publish':
        result = await autoPublish(brand_id, content_type);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function generateContent(brandId: string, strategyId: string, contentType: string) {
  // Get strategy from reverse engineering
  const { data: strategy } = await supabase
    .from('gv_geo_reverse_engineering')
    .select('*')
    .eq('id', strategyId)
    .single();

  if (!strategy) throw new Error('Strategy not found');

  // Get brand details
  const { data: brand } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('id', brandId)
    .single();

  const prompt = `Generate ${contentType} content for ${brand.name} based on this strategy:

**Topic**: ${strategy.topic}
**Strategy**: ${JSON.stringify(strategy.analysis_data.action_plan)}

**Requirements**:
- Follow best practices from competitor analysis
- Optimize for AI citations (GEO)
- Include target keywords naturally
- Add unique insights and data
- Structure for readability

Generate complete ${contentType}.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Send to Claude for feedback
  const feedbackResponse = await fetch(
    `${SUPABASE_URL}/functions/v1/claude-feedback-analysis`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        brand_id: brandId,
        content,
        content_type: contentType,
      }),
    }
  );

  const feedback = await feedbackResponse.json();

  // Auto-revise if score 60-79
  if (feedback.overall_quality_score >= 60 && feedback.overall_quality_score < 80) {
    console.log('[Auto-Revision] Score 60-79, improving content...');
    return await reviseContent(content, feedback.claude_analysis, brand, contentType);
  }

  // Reject if < 60
  if (feedback.overall_quality_score < 60) {
    console.log('[Reject] Score < 60, regenerating...');
    return await generateContent(brandId, strategyId, contentType); // Retry
  }

  // Save if ≥ 80
  await supabase.from('gv_automated_actions').insert({
    brand_id: brandId,
    action_type: 'content_generation',
    status: 'completed',
    content_generated: content,
    feedback_score: feedback.overall_quality_score,
  });

  return { success: true, content, feedback_score: feedback.overall_quality_score };
}

async function reviseContent(
  originalContent: string,
  feedback: string,
  brand: any,
  contentType: string
) {
  const prompt = `Revise this ${contentType} content based on feedback:

**Original Content**:
${originalContent}

**Feedback from Claude**:
${feedback}

**Brand**: ${brand.name}

Improve originality, NLP quality, and overall value. Return ONLY the revised content.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 4000,
    }),
  });

  const data = await response.json();
  const revised = data.choices[0].message.content;

  return { success: true, content: revised, revised: true };
}

async function executeOutreach(brandId: string, strategyId: string) {
  // Get backlink opportunities
  const { data: opportunities } = await supabase
    .from('gv_backlink_opportunities')
    .select('*')
    .eq('brand_id', brandId)
    .eq('status', 'pending')
    .limit(10);

  if (!opportunities || opportunities.length === 0) {
    return { success: true, outreach_sent: 0, message: 'No pending opportunities' };
  }

  const { data: brand } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('id', brandId)
    .single();

  let sent = 0;

  for (const opp of opportunities) {
    // Generate personalized outreach message
    const prompt = `Generate personalized outreach email for ${brand.name} to ${opp.platform} (${opp.url}).

**Opportunity**: ${opp.title}
**Type**: ${opp.opportunity_type}

Create professional, personalized pitch that:
- Explains value proposition
- Mentions specific article/discussion
- Proposes collaboration
- Includes clear CTA

Return JSON with: subject, body, follow_up_subject, follow_up_body`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const outreachData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

      // Save outreach
      await supabase.from('gv_automated_actions').insert({
        brand_id: brandId,
        action_type: 'outreach',
        target_url: opp.url,
        outreach_message: outreachData,
        status: 'pending_send',
      });

      // Update opportunity
      await supabase
        .from('gv_backlink_opportunities')
        .update({ status: 'outreach_sent' })
        .eq('id', opp.id);

      sent++;
    }
  }

  return { success: true, outreach_sent: sent };
}

async function autoPublish(brandId: string, contentType: string) {
  // Get approved content
  const { data: actions } = await supabase
    .from('gv_automated_actions')
    .select('*')
    .eq('brand_id', brandId)
    .eq('action_type', 'content_generation')
    .eq('status', 'completed')
    .gte('feedback_score', 80)
    .limit(5);

  if (!actions || actions.length === 0) {
    return { success: true, published: 0, message: 'No approved content' };
  }

  // In real implementation, integrate with CMS/publishing platform
  // For now, mark as published
  for (const action of actions) {
    await supabase
      .from('gv_automated_actions')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', action.id);
  }

  return { success: true, published: actions.length };
}
