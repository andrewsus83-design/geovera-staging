/**
 * PERPLEXITY BATCH: Discover creators in ONE category at a time
 * Call 8 times manually for all categories
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function perplexityResearch(category: string, platform: string, count: number) {
  const prompt = `Find exactly ${count} active Indonesian ${platform} creators in ${category} category.

Must be:
- Active in 2025-2026 (posted in last 30 days)
- Indonesian language content  
- Real, authentic engagement
- Mix of follower tiers

Return ONLY a valid JSON array, no markdown:
[{"username": "exactname", "estimated_followers": 500000, "tier": "macro", "quality_score": 85, "reason": "why quality"}]

IMPORTANT: Use exact ${platform} usernames (no @ symbol), real Indonesian creators only.`;

  try {
    console.log(`Researching ${platform} ${category}...`);
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity error ${response.status}: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw response:', content.substring(0, 500));
    
    const jsonMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response');
      return [];
    }

    const creators = JSON.parse(jsonMatch[0]);
    
    return creators.map((c: any) => ({
      platform,
      username: c.username.replace('@', '').replace(/^@/, '').trim(),
      category,
      estimated_followers: parseInt(c.estimated_followers) || 0,
      tier: c.tier || 'micro',
      quality_score: parseInt(c.quality_score) || 70,
      discovery_reason: c.reason || 'perplexity research',
      discovered_via: 'perplexity_batch',
      discovered_at: new Date().toISOString()
    }));

  } catch (error) {
    console.error(`Research failed for ${platform}/${category}:`, error.message);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const { category, instagram_count = 15, tiktok_count = 15 } = await req.json();
    
    if (!category) {
      throw new Error('Category required. Options: Beauty, Food, Fashion, Tech, Travel, Health, Parenting, Business');
    }

    console.log(`Starting discovery for ${category}`);
    console.log(`Target: ${instagram_count} IG + ${tiktok_count} TT`);
    
    const allCreators = [];

    const igCreators = await perplexityResearch(category, "instagram", instagram_count);
    console.log(`Found ${igCreators.length} Instagram creators`);
    allCreators.push(...igCreators);
    
    await new Promise(r => setTimeout(r, 3000));
    
    const ttCreators = await perplexityResearch(category, "tiktok", tiktok_count);
    console.log(`Found ${ttCreators.length} TikTok creators`);
    allCreators.push(...ttCreators);

    if (allCreators.length === 0) {
      return new Response(JSON.stringify({ error: 'No creators found', category }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { data: saved, error: saveError } = await supabase
      .from('gv_creator_discovery')
      .upsert(allCreators, { onConflict: 'platform,username', ignoreDuplicates: false })
      .select();

    if (saveError) {
      console.error('Save error:', saveError);
      throw saveError;
    }

    const summary = {
      category,
      total_discovered: allCreators.length,
      instagram: igCreators.length,
      tiktok: ttCreators.length,
      saved_to_db: saved?.length || 0,
      by_tier: {
        mega: allCreators.filter(c => c.tier === 'mega').length,
        macro: allCreators.filter(c => c.tier === 'macro').length,
        mid: allCreators.filter(c => c.tier === 'mid').length,
        micro: allCreators.filter(c => c.tier === 'micro').length
      },
      avg_quality_score: Math.round(
        allCreators.reduce((sum, c) => sum + c.quality_score, 0) / allCreators.length
      ),
      sample_creators: allCreators.slice(0, 5).map(c => ({
        platform: c.platform,
        username: c.username,
        tier: c.tier,
        followers: c.estimated_followers
      }))
    };

    console.log('Discovery complete:', summary);

    return new Response(JSON.stringify(summary, null, 2), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[Fatal]', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});