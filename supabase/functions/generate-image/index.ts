import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface GenerateImageRequest {
  brand_id: string;
  prompt: string;
  target_platforms?: string[];
  size?: string;
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: GenerateImageRequest = await req.json();
    const { brand_id, prompt, target_platforms = ["instagram"], size = "1024x1024" } = requestData;

    // Check subscription
    const { data: brand } = await supabaseClient
      .from("gv_brands")
      .select("subscription_tier, brand_name")
      .eq("id", brand_id)
      .single();

    if (!brand?.subscription_tier || brand.subscription_tier === "free") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Image generation requires a paid subscription",
          code: "SUBSCRIPTION_REQUIRED",
          current_tier: brand?.subscription_tier || "free"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check quota
    const { data: quotaExceeded } = await supabaseClient.rpc("check_tier_limit", {
      p_brand_id: brand_id,
      p_limit_type: "images"
    });

    if (quotaExceeded === true) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Monthly image quota exceeded",
          code: "QUOTA_EXCEEDED"
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate with DALL-E 3
    const dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Professional brand image for ${brand.brand_name}: ${prompt}. High quality, modern, on-brand.`,
        n: 1,
        size,
        quality: "hd",
        style: "vivid"
      })
    });

    const dalleData = await dalleResponse.json();

    if (!dalleResponse.ok) {
      throw new Error(`DALL-E error: ${dalleData.error?.message || "Unknown error"}`);
    }

    const image_url = dalleData.data[0].url;
    const cost_usd = size === "1024x1024" ? 0.04 : 0.08;

    // Save to content library
    const { data: contentData } = await supabaseClient
      .from("gv_content_library")
      .insert({
        brand_id,
        user_id: user.id,
        content_type: "image",
        title: prompt,
        slug: prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        content_variations: {
          original: image_url,
          platforms: target_platforms
        },
        content_goal: "visibility",
        target_platforms,
        ai_provider_used: "openai",
        model_used: "dall-e-3",
        generation_cost_usd: cost_usd,
        primary_file_url: image_url,
        publish_status: "draft"
      })
      .select()
      .single();

    // Increment usage
    await supabaseClient.rpc("increment_content_usage", {
      p_brand_id: brand_id,
      p_content_type: "image"
    });

    return new Response(
      JSON.stringify({
        success: true,
        content_id: contentData.id,
        image: {
          url: image_url,
          cost_usd: cost_usd.toFixed(4)
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-image] Error:", error);

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
