import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_MODEL = "gpt-4o";

interface GenerateStoryRequest {
  discovery_id: string;
  brand_id: string;
}

interface StoryContent {
  story_title: string;
  story_hook: string;
  story_body: string;
  story_cta: string;
  narrative_angle: string;
  emotional_tone: string;
  brand_integration_suggestion: string;
  expert_quotes: Array<{ quote: string; source: string }>;
  data_points: Array<{ stat: string; context: string }>;
  actionable_takeaways: string[];
  suggested_formats: string[];
  hashtag_suggestions: string[];
  target_audience: string;
  storytelling_quality_score: number;
  brand_fit_score: number;
  viral_potential_score: number;
}

interface OpenAIResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: GenerateStoryRequest = await req.json();
    const { discovery_id, brand_id } = requestData;

    if (!discovery_id || !brand_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: discovery_id, brand_id"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has access to this brand
    const { data: brandAccess, error: brandAccessError } = await supabaseClient
      .from("user_brands")
      .select("brand_id")
      .eq("user_id", user.id)
      .eq("brand_id", brand_id)
      .single();

    if (brandAccessError || !brandAccess) {
      return new Response(
        JSON.stringify({ success: false, error: "Access denied to this brand" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the viral discovery
    const { data: discovery, error: discoveryError } = await supabaseClient
      .from("gv_viral_discoveries")
      .select("*")
      .eq("id", discovery_id)
      .eq("brand_id", brand_id)
      .single();

    if (discoveryError || !discovery) {
      return new Response(
        JSON.stringify({ success: false, error: "Viral discovery not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if story already generated
    if (discovery.story_generated && discovery.story_id) {
      const { data: existingStory } = await supabaseClient
        .from("gv_viral_stories")
        .select("*")
        .eq("id", discovery.story_id)
        .single();

      if (existingStory) {
        return new Response(
          JSON.stringify({
            success: true,
            story: existingStory,
            already_existed: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get brand info for context
    const { data: brand } = await supabaseClient
      .from("brands")
      .select("brand_name, category, description")
      .eq("id", brand_id)
      .single();

    // Generate story using OpenAI GPT-4o
    const systemPrompt = `You are an expert storytelling content creator specializing in viral social media content that builds brand authority and trust.

Your task is to transform viral trends into compelling, high-authority storytelling content that brands can use to engage their audience and build credibility.

Key principles:
1. Lead with emotion and human interest
2. Include concrete data and expert perspectives
3. Make it actionable and valuable
4. Suggest how brands can authentically participate
5. Maintain professional tone while being engaging
6. Build trust through transparency and authenticity

Return ONLY valid JSON with no markdown formatting.`;

    const userPrompt = `Create a compelling storytelling piece based on this viral trend:

BRAND CONTEXT:
- Brand: ${brand?.brand_name || "Brand"}
- Category: ${brand?.category || "General"}
- Description: ${brand?.description || "N/A"}

VIRAL TREND DATA:
- Title: ${discovery.topic_title}
- Description: ${discovery.topic_description}
- Keywords: ${discovery.trending_keywords?.join(", ")}
- Industry Relevance: ${discovery.industry_relevance}
- Estimated Reach: ${discovery.estimated_reach?.toLocaleString()} people
- Platforms: ${discovery.social_platforms?.join(", ")}
- Trust Building Angle: ${discovery.trust_building_angle}
- Authority Score: ${discovery.authority_score}/1.0

Create a story that:
1. Hooks attention immediately
2. Tells a compelling narrative
3. Includes expert insights and data
4. Provides actionable takeaways
5. Shows how the brand can authentically participate
6. Builds authority and trust

Return ONLY valid JSON in this exact format:
{
  "story_title": "Engaging title (60-80 chars)",
  "story_hook": "Compelling opening that grabs attention (100-150 words)",
  "story_body": "Main narrative with storytelling elements (400-600 words)",
  "story_cta": "Clear call-to-action for audience",
  "narrative_angle": "inspirational|cautionary|educational|entertaining",
  "emotional_tone": "uplifting|urgent|curious|empowering",
  "brand_integration_suggestion": "How the brand can participate authentically",
  "expert_quotes": [
    {"quote": "Expert quote", "source": "Expert name/title"}
  ],
  "data_points": [
    {"stat": "Specific statistic", "context": "What it means"}
  ],
  "actionable_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "suggested_formats": ["carousel", "reel", "thread", "article"],
  "hashtag_suggestions": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "target_audience": "Who should this content target",
  "storytelling_quality_score": 0.85,
  "brand_fit_score": 0.90,
  "viral_potential_score": 0.88
}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to generate story" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData: OpenAIResponse = await openaiResponse.json();
    const openaiContent = openaiData.choices[0]?.message?.content;

    if (!openaiContent) {
      return new Response(
        JSON.stringify({ success: false, error: "No content from OpenAI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse OpenAI response
    let storyContent: StoryContent;
    try {
      storyContent = JSON.parse(openaiContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", openaiContent);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid response format from OpenAI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate OpenAI cost (GPT-4o: $2.50/1M input, $10/1M output tokens)
    const openaiCost = (
      (openaiData.usage.prompt_tokens / 1000000) * 2.50 +
      (openaiData.usage.completion_tokens / 1000000) * 10
    );

    // Save story to database
    const { data: story, error: storyError } = await supabaseClient
      .from("gv_viral_stories")
      .insert({
        brand_id,
        discovery_id,
        story_title: storyContent.story_title,
        story_hook: storyContent.story_hook,
        story_body: storyContent.story_body,
        story_cta: storyContent.story_cta,
        narrative_angle: storyContent.narrative_angle,
        emotional_tone: storyContent.emotional_tone,
        brand_integration_suggestion: storyContent.brand_integration_suggestion,
        expert_quotes: storyContent.expert_quotes,
        data_points: storyContent.data_points,
        actionable_takeaways: storyContent.actionable_takeaways,
        suggested_formats: storyContent.suggested_formats,
        hashtag_suggestions: storyContent.hashtag_suggestions,
        target_audience: storyContent.target_audience,
        openai_model: OPENAI_MODEL,
        openai_prompt_tokens: openaiData.usage.prompt_tokens,
        openai_completion_tokens: openaiData.usage.completion_tokens,
        generation_cost_usd: openaiCost,
        storytelling_quality_score: storyContent.storytelling_quality_score,
        brand_fit_score: storyContent.brand_fit_score,
        viral_potential_score: storyContent.viral_potential_score,
      })
      .select()
      .single();

    if (storyError) {
      console.error("Story save error:", storyError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save story" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        story,
        cost: openaiCost,
        tokens: {
          prompt: openaiData.usage.prompt_tokens,
          completion: openaiData.usage.completion_tokens,
          total: openaiData.usage.total_tokens,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in buzzsumo-generate-story:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
