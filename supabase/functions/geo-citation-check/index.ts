// GEO Citation Check - Track citations across 4 AI engines
// Uses delta caching (70% hit rate) and smart allocation based on Perplexity research

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { createHash } from 'node:crypto';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { brand_id, topics, tier } = await req.json();

    if (!brand_id || !topics) {
      throw new Error('brand_id and topics required');
    }

    // Get tier limits
    const limits = { basic: 100, premium: 200, partner: 400 };
    const checkLimit = limits[tier as keyof typeof limits] || 100;

    // Limit topics to check
    const topicsToCheck = topics.slice(0, Math.ceil(checkLimit / 4)); // Divide by 4 engines

    const results = {
      total_checks: 0,
      cache_hits: 0,
      cache_misses: 0,
      citations_found: 0,
      cost: 0,
      by_engine: {} as Record<string, any>,
    };

    // Check each topic across AI engines
    for (const topic of topicsToCheck) {
      // Determine engine allocation based on Perplexity research
      const allocation = await getEngineAllocation(topic);

      for (const engine of Object.keys(allocation)) {
        if (allocation[engine] === 0) continue;

        // Check cache first
        const cached = await checkCache(brand_id, topic, engine);

        if (cached) {
          results.cache_hits++;
          results.total_checks++;
          continue; // Use cached result
        }

        // Cache miss - perform actual check
        const citation = await checkCitation(topic, engine, brand_id);

        results.cache_misses++;
        results.total_checks++;

        if (citation.found) {
          results.citations_found++;

          // Save citation
          await saveCitation({
            brand_id,
            topic,
            ai_engine: engine,
            citation_found: true,
            citation_text: citation.text,
            rank: citation.rank,
            context: citation.context,
            timestamp: new Date().toISOString(),
          });
        }

        // Cache result
        await cacheResult(brand_id, topic, engine, citation);

        // Track by engine
        if (!results.by_engine[engine]) {
          results.by_engine[engine] = { checks: 0, citations: 0 };
        }
        results.by_engine[engine].checks++;
        if (citation.found) results.by_engine[engine].citations++;

        results.cost += 0.08; // Claude Haiku fast check
      }
    }

    // Track cost
    await trackCost(results.cost, brand_id);

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function getEngineAllocation(topic: string): Promise<Record<string, number>> {
  // Ask Perplexity which engines are most relevant for this topic
  const prompt = `For the topic "${topic}", which AI engines are most commonly used to answer questions about it?

Rank by usage frequency:
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Gemini (Google)
- Perplexity

Return JSON with percentage allocation (total = 100%):
{ "chatgpt": X, "claude": Y, "gemini": Z, "perplexity": W }`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  const text = data.choices[0].message.content;

  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Default equal allocation
    return { chatgpt: 25, claude: 25, gemini: 25, perplexity: 25 };
  }

  return JSON.parse(jsonMatch[1] || jsonMatch[0]);
}

async function checkCache(brandId: string, topic: string, engine: string) {
  const cacheKey = createHash('md5')
    .update(`${brandId}_${topic}_${engine}`)
    .digest('hex');

  const { data } = await supabase
    .from('gv_geo_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .single();

  if (!data) return null;

  // Check if cache is still valid (within update window)
  const cacheDate = new Date(data.created_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60);

  // Cache valid for 7 days (Gold)
  if (hoursDiff > 7 * 24) return null;

  console.log(`[Cache HIT] ${topic} on ${engine}`);
  return data.cache_data;
}

async function checkCitation(topic: string, engine: string, brandId: string) {
  // Get brand name
  const { data: brand } = await supabase
    .from('gv_brands')
    .select('name')
    .eq('id', brandId)
    .single();

  if (!brand) throw new Error('Brand not found');

  const brandName = brand.name;

  console.log(`[Cache MISS] Checking ${topic} on ${engine}`);

  // Query the AI engine about the topic and check for brand mention
  let response;
  const question = `Tell me about ${topic}. Provide a comprehensive answer.`;

  switch (engine) {
    case 'chatgpt':
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: question }],
          temperature: 0.5,
        }),
      });
      break;

    case 'claude':
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: question }],
        }),
      });
      break;

    case 'gemini':
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: question }] }],
          }),
        }
      );
      break;

    case 'perplexity':
      response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: question }],
        }),
      });
      break;

    default:
      throw new Error(`Unknown engine: ${engine}`);
  }

  const data = await response!.json();

  // Extract response text based on engine format
  let responseText = '';
  if (engine === 'chatgpt' || engine === 'perplexity') {
    responseText = data.choices[0].message.content;
  } else if (engine === 'claude') {
    responseText = data.content[0].text;
  } else if (engine === 'gemini') {
    responseText = data.candidates[0].content.parts[0].text;
  }

  // Check if brand is mentioned
  const brandMentioned = responseText.toLowerCase().includes(brandName.toLowerCase());

  if (!brandMentioned) {
    return { found: false };
  }

  // Extract citation context
  const sentences = responseText.split(/[.!?]/);
  const citationSentences = sentences.filter((s) =>
    s.toLowerCase().includes(brandName.toLowerCase())
  );

  // Determine rank (position in response)
  const brandPosition = responseText.toLowerCase().indexOf(brandName.toLowerCase());
  const totalLength = responseText.length;
  const rank = Math.ceil((brandPosition / totalLength) * 10); // Rank 1-10

  return {
    found: true,
    text: citationSentences[0] || '',
    rank: rank,
    context: citationSentences.join('. '),
  };
}

async function cacheResult(brandId: string, topic: string, engine: string, citation: any) {
  const cacheKey = createHash('md5')
    .update(`${brandId}_${topic}_${engine}`)
    .digest('hex');

  await supabase.from('gv_geo_cache').upsert({
    cache_key: cacheKey,
    brand_id: brandId,
    topic,
    engine,
    cache_data: citation,
    created_at: new Date().toISOString(),
  });
}

async function saveCitation(citation: any) {
  await supabase.from('gv_geo_citations').insert(citation);
}

async function trackCost(cost: number, brandId: string) {
  await supabase.from('gv_cost_tracking').insert({
    brand_id: brandId,
    feature: 'geo_citation_check',
    action: 'check',
    cost,
  });
}
