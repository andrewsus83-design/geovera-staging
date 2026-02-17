// Discover Backlinks - Multi-channel discovery
// Uses Perplexity to find and rank top 20 opportunities across 10+ platforms

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PLATFORMS = [
  'Medium',
  'LinkedIn',
  'Reddit',
  'GitHub',
  'Quora',
  'Dev.to',
  'Hashnode',
  'HackerNoon',
  'Stack Overflow',
  'ProductHunt',
];

serve(async (req) => {
  try {
    const { brand_id, category, keywords, tier } = await req.json();

    // Validate
    if (!brand_id || !category) {
      throw new Error('brand_id and category are required');
    }

    // Discover opportunities
    const opportunities = await discoverOpportunities(category, keywords || []);

    // Rank with Perplexity
    const ranked = await rankOpportunities(opportunities, category);

    // Filter by tier limits
    const tierLimits = { basic: 20, premium: 50, partner: 100 };
    const limit = tierLimits[tier as keyof typeof tierLimits] || 20;
    const filtered = ranked.slice(0, limit);

    // Save to database
    const toSave = filtered.map((opp) => ({
      brand_id,
      platform: opp.platform,
      url: opp.url,
      title: opp.title,
      domain_authority: opp.domain_authority,
      traffic_score: opp.traffic_score,
      perplexity_rank: opp.rank,
      opportunity_type: opp.type,
      status: 'pending',
    }));

    const { error } = await supabase.from('gv_backlink_opportunities').insert(toSave);

    if (error) throw error;

    // Track cost
    const cost = 0.03 * opportunities.length; // Perplexity discovery
    await trackCost(cost, brand_id);

    return new Response(
      JSON.stringify({
        success: true,
        discovered: opportunities.length,
        ranked: ranked.length,
        saved: filtered.length,
        cost,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function discoverOpportunities(category: string, keywords: string[]) {
  const opportunities = [];

  for (const platform of PLATFORMS) {
    const keywordList = keywords.length > 0 ? keywords.join(', ') : category;

    const prompt = `Find top 50 backlink opportunities on ${platform} for "${category}" niche.

Keywords: ${keywordList}

For each opportunity provide:
- url
- title
- type (guest_post, sponsored, discussion, review, tutorial)
- domain_authority (0-100)
- estimated_traffic (monthly)
- acceptance_likelihood (high/medium/low)
- contact_info (if available)

Return JSON array.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const platformOpps = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      opportunities.push(
        ...platformOpps.map((opp: any) => ({ ...opp, platform }))
      );
    }
  }

  console.log(`Discovered ${opportunities.length} total opportunities`);
  return opportunities;
}

async function rankOpportunities(opportunities: any[], category: string) {
  const oppList = opportunities.map((o, i) => `${i + 1}. ${o.title} (${o.platform})`).join('\n');

  const prompt = `Rank these backlink opportunities for "${category}" by overall value:
${oppList}

Consider:
- Domain authority
- Traffic potential
- Acceptance likelihood
- Relevance to niche
- Link quality

Return JSON array with: title, platform, rank (1-${opportunities.length}), overall_score (0-100)`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  const text = data.choices[0].message.content;

  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return opportunities;

  const ranked = JSON.parse(jsonMatch[1] || jsonMatch[0]);

  // Merge rankings back
  const merged = opportunities.map((opp) => {
    const ranking = ranked.find(
      (r: any) => r.title === opp.title && r.platform === opp.platform
    );
    return ranking ? { ...opp, ...ranking } : opp;
  });

  return merged.sort((a, b) => (a.rank || 999) - (b.rank || 999));
}

async function trackCost(cost: number, brandId: string) {
  await supabase.from('gv_cost_tracking').insert({
    brand_id: brandId,
    feature: 'backlink_discovery',
    action: 'discover',
    cost,
  });
}
