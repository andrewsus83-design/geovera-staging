import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CF_ACCOUNT_ID = Deno.env.get("CF_ACCOUNT_ID")!;
const CF_API_TOKEN = Deno.env.get("CF_API_TOKEN")!;

// Cloudflare Workers AI model — change to llama-3.3-70b for higher quality
const CF_MODEL = "@cf/meta/llama-3.1-8b-instruct";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Fetch a JSON file from URL and return parsed content (or null on failure)
async function fetchJson(url: string): Promise<unknown> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Build a rich system prompt from uploaded persona files
function buildSystemPrompt(
  persona: {
    persona_name: string;
    persona_title: string | null;
    persona_description: string | null;
    role: string;
  },
  dataset: unknown,
  mindset: unknown,
  skillset: unknown,
  anchor: unknown,
): string {
  const parts: string[] = [];

  parts.push(
    `You are ${persona.persona_name}, an AI agent serving as the ${persona.role} at this company.`,
  );

  if (persona.persona_title) {
    parts.push(`Your title: ${persona.persona_title}.`);
  }

  if (persona.persona_description) {
    parts.push(`\nAbout you:\n${persona.persona_description}`);
  }

  if (anchor) {
    parts.push(`\n## CHARACTER ANCHOR (core identity & behavior rules)\n${JSON.stringify(anchor, null, 2)}`);
  }

  if (mindset) {
    parts.push(`\n## MINDSET (thinking patterns, principles, worldview)\n${JSON.stringify(mindset, null, 2)}`);
  }

  if (skillset) {
    parts.push(`\n## SKILLSET (expertise, capabilities, domain knowledge)\n${JSON.stringify(skillset, null, 2)}`);
  }

  if (dataset) {
    parts.push(`\n## KNOWLEDGE DATASET (facts, frameworks, references)\n${JSON.stringify(dataset, null, 2)}`);
  }

  parts.push(
    `\nAlways respond as ${persona.persona_name}. Apply your unique mindset, frameworks, and expertise to every answer. Be direct, decisive, and insightful.`,
  );

  return parts.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { brand_id, role, message, history } = body as {
      brand_id: string;
      role: string;
      message: string;
      history?: Message[];
    };

    if (!brand_id || !role || !message) {
      return new Response(JSON.stringify({ error: "brand_id, role, and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Load hired agent persona
    const { data: agent, error: agentErr } = await supabase
      .from("gv_ai_agents")
      .select("*")
      .eq("brand_id", brand_id)
      .eq("role", role.toUpperCase())
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (agentErr || !agent) {
      return new Response(
        JSON.stringify({ error: `No active ${role} agent found for this brand` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch all JSON persona files in parallel
    const [dataset, mindset, skillset, anchor] = await Promise.all([
      agent.dataset_url ? fetchJson(agent.dataset_url) : null,
      agent.mindset_url ? fetchJson(agent.mindset_url) : null,
      agent.skillset_url ? fetchJson(agent.skillset_url) : null,
      agent.anchor_character_url ? fetchJson(agent.anchor_character_url) : null,
    ]);

    const systemPrompt = buildSystemPrompt(agent, dataset, mindset, skillset, anchor);

    // Build messages array for Llama
    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).slice(-10), // keep last 10 turns for context
      { role: "user", content: message },
    ];

    // Call Cloudflare Workers AI
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      },
    );

    if (!cfRes.ok) {
      const errText = await cfRes.text();
      console.error("Cloudflare AI error:", errText);
      return new Response(
        JSON.stringify({ error: "Cloudflare Workers AI request failed", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cfData = await cfRes.json() as { result?: { response?: string }; success?: boolean };

    if (!cfData.success || !cfData.result?.response) {
      return new Response(
        JSON.stringify({ error: "Empty response from Cloudflare AI", raw: cfData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: cfData.result.response,
        persona_name: agent.persona_name,
        role: agent.role,
        model: CF_MODEL,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: unknown) {
    console.error("agent-inference error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
