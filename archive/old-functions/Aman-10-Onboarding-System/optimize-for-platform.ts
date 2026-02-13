import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface OptimizeForPlatformRequest {
  master_asset_id: string;
  target_platforms: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { master_asset_id, target_platforms } = await req.json() as OptimizeForPlatformRequest;

    // Get master asset
    const { data: masterAsset, error: assetError } = await supabase
      .from('gv_content_assets')
      .select('*')
      .eq('id', master_asset_id)
      .single();

    if (assetError) throw new Error(`Master asset not found: ${assetError.message}`);

    // Get platform rules
    const { data: rulesData } = await supabase
      .from('gv_platform_optimization_rules')
      .select('rules')
      .eq('brand_id', masterAsset.brand_id)
      .single();

    const variants = [];

    // Generate variant for each platform
    for (const platform of target_platforms) {
      const platform_rules = rulesData?.rules?.[platform] || {};
      const content = masterAsset.body_text || masterAsset.description || '';

      const systemPrompt = `You are a platform optimization expert.\n\nRewrite content specifically for ${platform}.\n\nPlatform DNA:\n- Style: ${platform_rules.style}\n- Max length: ${platform_rules.max_caption} chars\n- Hook timing: ${platform_rules.hook_timing}\n- Aspect ratio: ${platform_rules.aspect_ratio}\n- Tone: ${platform_rules.tone || 'engaging'}\n\nDo NOT just resize - completely rewrite for platform algorithms and user behavior.`;

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
            { role: 'user', content: `Original content:\n\n${content}\n\nRewrite for ${platform}:` }
          ],
          temperature: 0.8,
          max_tokens: 1500
        })
      });

      const openaiData = await openaiResponse.json();
      const optimized_content = openaiData.choices[0].message.content;

      // Create variant asset
      const { data: variantAsset, error: variantError } = await supabase
        .from('gv_content_assets')
        .insert({
          brand_id: masterAsset.brand_id,
          content_type: masterAsset.content_type,
          platform,
          title: masterAsset.title,
          description: masterAsset.content_type === 'article' ? optimized_content.substring(0, 500) : optimized_content,
          body_text: masterAsset.content_type === 'article' ? optimized_content : null,
          image_url: masterAsset.image_url,
          video_url: masterAsset.video_url,
          target_pillar: masterAsset.target_pillar,
          insight_id: masterAsset.insight_id,
          parent_asset_id: master_asset_id,
          is_master: false,
          status: 'draft',
          generation_metadata: { optimized_for: platform, model: 'gpt-4o' }
        })
        .select()
        .single();

      if (variantError) {
        console.error(`Failed to create variant for ${platform}:`, variantError);
        continue;
      }

      variants.push({
        platform,
        asset_id: variantAsset.id,
        filename: variantAsset.filename
      });
    }

    // Mark master asset
    await supabase
      .from('gv_content_assets')
      .update({ is_master: true })
      .eq('id', master_asset_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        master_asset_id,
        variants,
        total_variants: variants.length
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