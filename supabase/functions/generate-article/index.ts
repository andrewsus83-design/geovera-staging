import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface GenerateArticleRequest {
  brand_id: string;
  topic: string;
  target_platforms?: string[];
  keywords?: string[];
  target_audience?: string;
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
    // Validate API key exists
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

    const requestData: GenerateArticleRequest = await req.json();
    const { brand_id, topic, target_platforms = ["linkedin"], keywords = [], target_audience } = requestData;

    // CRITICAL: Check subscription tier
    const { data: brand, error: brandError } = await supabaseClient
      .from("gv_brands")
      .select("subscription_tier, brand_name")
      .eq("id", brand_id)
      .single();

    if (brandError || !brand) {
      return new Response(
        JSON.stringify({ success: false, error: "Brand not found", code: "BRAND_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // REJECT free tier
    if (!brand.subscription_tier || brand.subscription_tier === "free" || brand.subscription_tier === null) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Content generation requires a paid subscription",
          code: "SUBSCRIPTION_REQUIRED",
          message: "Upgrade to Basic ($399/mo), Premium ($699/mo), or Partner ($1,099/mo)",
          current_tier: brand.subscription_tier || "free",
          upgrade_url: "/pricing"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check quota
    const { data: quotaExceeded, error: quotaError } = await supabaseClient.rpc("check_tier_limit", {
      p_brand_id: brand_id,
      p_limit_type: "articles"
    });

    if (quotaError) {
      throw new Error(`Quota check failed: ${quotaError.message}`);
    }

    if (quotaExceeded === true) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Monthly article quota exceeded",
          code: "QUOTA_EXCEEDED",
          current_tier: brand.subscription_tier
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get brand voice
    const { data: voiceData } = await supabaseClient
      .from("gv_brand_voice_guidelines")
      .select("*")
      .eq("brand_id", brand_id)
      .maybeSingle();

    // Generate with OpenAI
    const systemPrompt = `You are an expert content writer for ${brand.brand_name}.

Brand Voice: ${voiceData?.tone || "professional and engaging"}
Language Style: ${voiceData?.language_style || "clear and accessible"}
Target Platforms: ${target_platforms.join(", ")}
Length: ${voiceData?.preferred_content_length || "800-1200 words"}`;

    const userPrompt = `Write a compelling article about: ${topic}

${keywords.length > 0 ? `Focus Keywords: ${keywords.join(", ")}` : ""}
${target_audience ? `Target Audience: ${target_audience}` : ""}

Requirements:
- Engaging hook in first paragraph
- Clear H2/H3 structure
- Actionable insights
- Strong CTA conclusion
- SEO-optimized`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI error: ${openaiData.error?.message || "Unknown error"}`);
    }

    const article_content = openaiData.choices[0].message.content;
    const cost_usd = (openaiData.usage.total_tokens / 1_000_000) * 2.5;

    // Save to content library
    const { data: contentData, error: contentError } = await supabaseClient
      .from("gv_content_library")
      .insert({
        brand_id,
        user_id: user.id,
        content_type: "article",
        title: topic,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        content_variations: {
          full: article_content,
          platforms: target_platforms.reduce((acc: any, platform: string) => {
            acc[platform] = article_content;
            return acc;
          }, {})
        },
        meta_title: topic,
        meta_description: article_content.slice(0, 160),
        keywords,
        target_audience,
        content_goal: "visibility",
        target_platforms,
        ai_provider_used: "openai",
        model_used: "gpt-4o",
        generation_prompt: userPrompt,
        generation_cost_usd: cost_usd,
        publish_status: "draft"
      })
      .select()
      .single();

    if (contentError) {
      throw new Error(`Failed to save: ${contentError.message}`);
    }

    // Increment usage
    const { error: usageError } = await supabaseClient.rpc("increment_content_usage", {
      p_brand_id: brand_id,
      p_content_type: "article"
    });

    if (usageError) {
      console.error("[generate-article] Usage increment failed:", usageError);
      throw new Error(`Failed to update usage: ${usageError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        content_id: contentData.id,
        article: {
          title: topic,
          content: article_content,
          platforms: target_platforms,
          cost_usd: cost_usd.toFixed(4),
          tokens: openaiData.usage.total_tokens
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-article] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: "GENERATION_FAILED"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
