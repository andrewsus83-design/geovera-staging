import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
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

    const requestData: GenerateImageRequest = await req.json();
    const { brand_id, prompt, target_platforms = ["instagram"], size = "1024x1024" } = requestData;

    // Check subscription
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

    if (!brand.subscription_tier || brand.subscription_tier === "free" || brand.subscription_tier === null) {
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
    const { data: quotaExceeded, error: quotaError } = await supabaseClient.rpc("check_tier_limit", {
      p_brand_id: brand_id,
      p_limit_type: "images"
    });

    if (quotaError) {
      throw new Error(`Quota check failed: ${quotaError.message}`);
    }

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

    // Fetch brand visual guidelines
    const { data: visualGuidelines } = await supabaseClient
      .from("gv_brand_visual_guidelines")
      .select("*")
      .eq("brand_id", brand_id)
      .single();

    // Build enhanced prompt with brand consistency
    let enhancedPrompt = `Professional brand image for ${brand.brand_name}: ${prompt}.`;

    if (visualGuidelines && visualGuidelines.training_status === "trained") {
      // Add style keywords
      if (visualGuidelines.style_keywords && visualGuidelines.style_keywords.length > 0) {
        enhancedPrompt += ` Style: ${visualGuidelines.style_keywords.join(", ")}.`;
      }

      // Add visual style
      if (visualGuidelines.visual_style) {
        enhancedPrompt += ` ${visualGuidelines.visual_style} aesthetic.`;
      }

      // Add color palette guidance
      const allColors = [
        ...(visualGuidelines.primary_colors || []),
        ...(visualGuidelines.secondary_colors || []),
        ...(visualGuidelines.accent_colors || [])
      ];
      if (allColors.length > 0) {
        enhancedPrompt += ` Color palette: ${allColors.slice(0, 5).join(", ")}.`;
      }

      // Add composition preferences
      if (visualGuidelines.composition_preferences && visualGuidelines.composition_preferences.length > 0) {
        enhancedPrompt += ` Composition: ${visualGuidelines.composition_preferences[0]}.`;
      }

      // Add lighting preference
      if (visualGuidelines.lighting_preference) {
        enhancedPrompt += ` ${visualGuidelines.lighting_preference} lighting.`;
      }

      // Add background preference
      if (visualGuidelines.background_preference) {
        enhancedPrompt += ` ${visualGuidelines.background_preference} background.`;
      }

      // Use custom prompt template if available
      if (visualGuidelines.image_prompt_template) {
        enhancedPrompt = visualGuidelines.image_prompt_template
          .replace("{brand_name}", brand.brand_name)
          .replace("{prompt}", prompt)
          .replace("{style_keywords}", visualGuidelines.style_keywords?.join(", ") || "modern")
          .replace("{composition_preferences}", visualGuidelines.composition_preferences?.[0] || "balanced")
          .replace("{lighting_preference}", visualGuidelines.lighting_preference || "natural");
      }
    } else {
      // Default high-quality prompt
      enhancedPrompt += " High quality, modern, on-brand, professional.";
    }

    // Add negative prompt handling (DALL-E doesn't support negative prompts, but we can guide the positive prompt)
    if (visualGuidelines?.negative_keywords && visualGuidelines.negative_keywords.length > 0) {
      // Don't add negative keywords directly, but ensure positive prompt is specific enough
      enhancedPrompt += " Clean, professional, high-quality.";
    }

    console.log("[generate-image] Enhanced prompt:", enhancedPrompt);

    // Generate with DALL-E 3
    const dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
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

    // Save to content library with brand consistency metadata
    const { data: contentData, error: contentError } = await supabaseClient
      .from("gv_content_library")
      .insert({
        brand_id,
        user_id: user.id,
        content_type: "image",
        title: prompt,
        slug: prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        content_variations: {
          original: image_url,
          platforms: target_platforms,
          enhanced_prompt: enhancedPrompt
        },
        content_goal: "visibility",
        target_platforms,
        ai_provider_used: "openai",
        model_used: "dall-e-3",
        generation_prompt: enhancedPrompt,
        generation_cost_usd: cost_usd,
        primary_file_url: image_url,
        publish_status: "draft",
        brand_colors_used: visualGuidelines?.primary_colors || null
      })
      .select()
      .single();

    if (contentError) {
      throw new Error(`Failed to save content: ${contentError.message}`);
    }

    // Increment usage
    const { error: usageError } = await supabaseClient.rpc("increment_content_usage", {
      p_brand_id: brand_id,
      p_content_type: "image"
    });

    if (usageError) {
      console.error("[generate-image] Usage increment failed:", usageError);
      throw new Error(`Failed to update usage: ${usageError.message}`);
    }

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
