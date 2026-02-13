import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ValidateStorytellingRequest {
  asset_id: string;
}

interface StorytellingScore {
  hook_strength: number;
  conflict_clarity: number;
  value_delivery: number;
  resolution_impact: number;
  overall_score: number;
  feedback: string;
  passed: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { asset_id } = await req.json() as ValidateStorytellingRequest;

    // Get asset
    const { data: asset, error: assetError } = await supabase
      .from('gv_content_assets')
      .select('*')
      .eq('id', asset_id)
      .single();

    if (assetError) throw new Error(`Asset not found: ${assetError.message}`);

    const content = asset.body_text || asset.description || '';
    if (!content) throw new Error('No content to validate');

    // Validate with GPT-4o
    const systemPrompt = `You are an expert content strategist specializing in storytelling evaluation.\n\nEvaluate content on these criteria (0-100 each):\n1. Hook Strength: Does it grab attention immediately?\n2. Conflict Clarity: Is there a clear problem/challenge?\n3. Value Delivery: Does it provide actionable insights?\n4. Resolution Impact: Does the conclusion inspire action?\n\nMinimum passing score: 70/100 overall.\n\nRespond ONLY with valid JSON in this exact format:\n{\n  "hook_strength": 0-100,\n  "conflict_clarity": 0-100,\n  "value_delivery": 0-100,\n  "resolution_impact": 0-100,\n  "overall_score": 0-100,\n  "feedback": "brief explanation",\n  "passed": true/false\n}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Evaluate this content:\n\n${content.substring(0, 2000)}` }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    const openaiData = await openaiResponse.json();
    const analysis: StorytellingScore = JSON.parse(openaiData.choices[0].message.content);

    // Update asset with scores
    const { error: updateError } = await supabase
      .from('gv_content_assets')
      .update({
        storytelling_score: analysis.overall_score,
        storytelling_analysis: analysis,
        status: analysis.passed ? 'ready' : 'reviewing'
      })
      .eq('id', asset_id);

    if (updateError) throw new Error(`Update failed: ${updateError.message}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        asset_id,
        ...analysis
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});