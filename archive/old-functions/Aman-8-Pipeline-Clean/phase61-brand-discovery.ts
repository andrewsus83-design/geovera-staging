import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  try {
    const { category, count } = await req.json();
    
    console.log(`🔍 Discovering ${count} ${category} brands...`);
    
    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{
          role: 'user',
          content: `List the top ${count} ${category} brands in Indonesia in 2026.

For each brand provide in JSON format:
{
  "brands": [
    {
      "brand_name": "string",
      "website_url": "string",
      "instagram_handle": "string",
      "tiktok_handle": "string", 
      "description": "string",
      "market_position": "leader|fast-grower|regional|niche|emerging"
    }
  ]
}

Return ONLY valid JSON.`
        }],
        temperature: 0.2,
        max_tokens: 4000
      })
    });
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in Perplexity response');
    }
    
    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    const brands = parsed.brands || [];
    
    console.log(`✅ Discovered ${brands.length} brands`);
    
    // Insert into database
    const results = [];
    
    for (const brand of brands) {
      // Check if brand exists
      const { data: existing } = await supabase
        .from('brands')
        .select('id')
        .eq('brand_name', brand.brand_name)
        .single();
      
      let brand_id;
      
      if (!existing) {
        // Create new brand
        const { data: newBrand, error } = await supabase
          .from('brands')
          .insert({
            brand_name: brand.brand_name,
            category: category,
            website_url: brand.website_url,
            description: brand.description
          })
          .select()
          .single();
        
        if (error) {
          console.error(`Error creating brand ${brand.brand_name}:`, error);
          continue;
        }
        
        brand_id = newBrand.id;
      } else {
        brand_id = existing.id;
      }
      
      // Insert into brand universe
      const { error: universeError } = await supabase
        .from('gv_brand_universe')
        .insert({
          brand_id: brand_id,
          brand_name: brand.brand_name,
          category: category,
          tier: 'market',
          status: 'active',
          market_position: brand.market_position || 'regional',
          priority_score: 50 + Math.random() * 25
        })
        .select()
        .single();
      
      if (universeError && universeError.code !== '23505') {
        console.error(`Error adding to universe:`, universeError);
        continue;
      }
      
      // Add Instagram account if provided
      if (brand.instagram_handle) {
        await supabase
          .from('gv_brand_accounts')
          .insert({
            brand_id: brand_id,
            platform: 'instagram',
            account_handle: brand.instagram_handle,
            is_competitor: true
          })
          .select();
      }
      
      // Add TikTok account if provided
      if (brand.tiktok_handle) {
        await supabase
          .from('gv_brand_accounts')
          .insert({
            brand_id: brand_id,
            platform: 'tiktok',
            account_handle: brand.tiktok_handle,
            is_competitor: true
          })
          .select();
      }
      
      results.push({
        brand_name: brand.brand_name,
        brand_id: brand_id,
        status: 'created'
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      category: category,
      discovered: brands.length,
      inserted: results.length,
      brands: results
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});