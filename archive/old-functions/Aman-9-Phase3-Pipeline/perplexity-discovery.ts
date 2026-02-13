/**
 * PERPLEXITY: 235 Indonesian Creators Discovery
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function callPerplexity(category: string) {
  const query = "Find top 12 active Indonesian " + category + " creators on Instagram and TikTok 2026. List: username, platform, followers, quality (1-10). Mix mega/macro/micro. 6 Instagram + 6 TikTok. Active last 30 days. Return structured list.";
  
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + PERPLEXITY_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-large-128k-online",
      messages: [{ role: "user", content: query }],
      temperature: 0.2,
      max_tokens: 3000
    })
  });

  if (!response.ok) throw new Error("Perplexity error " + response.status);
  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");

  try {
    const categories = ["Beauty", "F&B", "Fashion", "Lifestyle", "Tech", "Travel", "Finance", "Health", "Parenting", "Entertainment"];
    const allCreators = [];

    for (const cat of categories) {
      console.log("Researching " + cat);
      const result = await callPerplexity(cat);
      const answer = result.choices[0].message.content;
      
      const lines = answer.split("\n");
      for (const line of lines) {
        const igMatch = line.match(/(?:@|instagram.com\/)([a-z0-9._]+)/i);
        const ttMatch = line.match(/(?:@|tiktok.com\/@)([a-z0-9._]+)/i);
        
        if (igMatch) allCreators.push({ platform: "instagram", username: igMatch[1], category: cat });
        if (ttMatch) allCreators.push({ platform: "tiktok", username: ttMatch[1], category: cat });
      }
      
      await new Promise(r => setTimeout(r, 2000));
    }

    const { data: session } = await supabase.from("gv_perplexity_research_sessions").insert({
      research_topic: "235 Indonesian Creators",
      research_type: "creator_discovery",
      research_summary: "Found " + allCreators.length + " creators",
      detailed_findings: { creators: allCreators },
      status: "completed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    }).select().single();

    return new Response(JSON.stringify({ success: true, total: allCreators.length, session_id: session.id, preview: allCreators.slice(0, 20) }, null, 2));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
