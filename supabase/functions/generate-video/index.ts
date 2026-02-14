import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface GenerateVideoRequest {
  brand_id: string;
  topic: string;
  duration_seconds?: number;
  target_platform?: string;
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
    const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!claudeKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Anthropic API key not configured" }),
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

    const requestData: GenerateVideoRequest = await req.json();
    const { brand_id, topic, duration_seconds = 60, target_platform = "tiktok" } = requestData;

    // Check subscription - Videos require Premium or Partner
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

    if (!brand.subscription_tier || brand.subscription_tier === "free" || brand.subscription_tier === "basic" || brand.subscription_tier === null) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Video generation requires Premium or Partner subscription",
          code: "TIER_INSUFFICIENT",
          message: "Videos available on Premium ($699/mo) and Partner ($1,099/mo) only",
          current_tier: brand?.subscription_tier || "free"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check quota
    const { data: quotaExceeded, error: quotaError } = await supabaseClient.rpc("check_tier_limit", {
      p_brand_id: brand_id,
      p_limit_type: "videos"
    });

    if (quotaError) {
      throw new Error(`Quota check failed: ${quotaError.message}`);
    }

    if (quotaExceeded === true) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Monthly video quota exceeded",
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
    let brandGuidanceText = "";

    if (visualGuidelines && visualGuidelines.training_status === "trained") {
      brandGuidanceText = `\n\nBRAND VISUAL GUIDELINES:`;

      // Add visual style
      if (visualGuidelines.visual_style) {
        brandGuidanceText += `\n- Visual Style: ${visualGuidelines.visual_style}`;
      }

      // Add mood
      if (visualGuidelines.visual_mood && visualGuidelines.visual_mood.length > 0) {
        brandGuidanceText += `\n- Mood: ${visualGuidelines.visual_mood.join(", ")}`;
      }

      // Add color palette
      const allColors = [
        ...(visualGuidelines.primary_colors || []),
        ...(visualGuidelines.secondary_colors || []),
        ...(visualGuidelines.accent_colors || [])
      ];
      if (allColors.length > 0) {
        brandGuidanceText += `\n- Brand Colors: ${allColors.slice(0, 5).join(", ")}`;
      }

      // Add style keywords
      if (visualGuidelines.style_keywords && visualGuidelines.style_keywords.length > 0) {
        brandGuidanceText += `\n- Style Keywords: ${visualGuidelines.style_keywords.join(", ")}`;
      }

      // Add lighting preference
      if (visualGuidelines.lighting_preference) {
        brandGuidanceText += `\n- Lighting: ${visualGuidelines.lighting_preference}`;
      }

      // Add composition preferences
      if (visualGuidelines.composition_preferences && visualGuidelines.composition_preferences.length > 0) {
        brandGuidanceText += `\n- Composition: ${visualGuidelines.composition_preferences.join(", ")}`;
      }

      // Add preferred video style
      if (visualGuidelines.preferred_video_style) {
        brandGuidanceText += `\n- Video Style: ${visualGuidelines.preferred_video_style}`;
      }

      brandGuidanceText += `\n\nIMPORTANT: Ensure all visual suggestions align with these brand guidelines. Maintain brand consistency throughout.`;
    }

    // Generate script with Claude
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `Create a ${duration_seconds}-second video script for ${target_platform} about: ${topic}

Brand: ${brand.brand_name}
Platform: ${target_platform}
Duration: ${duration_seconds} seconds${brandGuidanceText}

Format:
[HOOK - 0-3s]: (opening line)
[MAIN - 3-${duration_seconds-3}s]: (key points)
[CTA - ${duration_seconds-3}-${duration_seconds}s]: (call to action)

Include:
- Visual suggestions (aligned with brand colors and style)
- Text overlay recommendations (using brand aesthetic)
- Scene descriptions (matching brand visual style)
- Lighting and composition notes (following brand guidelines)
- Platform best practices
- Hashtag suggestions
- Brand consistency notes`
        }]
      })
    });

    const claudeData = await claudeResponse.json();

    if (!claudeResponse.ok) {
      throw new Error(`Claude error: ${claudeData.error?.message || "Unknown error"}`);
    }

    const video_script = claudeData.content[0].text;
    const cost_usd = 0.015;

    // Save to content library with brand consistency metadata
    const { data: contentData, error: contentError } = await supabaseClient
      .from("gv_content_library")
      .insert({
        brand_id,
        user_id: user.id,
        content_type: "video",
        title: topic,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        content_variations: {
          script: video_script,
          duration_seconds,
          platform: target_platform,
          brand_guidelines_applied: visualGuidelines ? true : false
        },
        content_goal: "visibility",
        target_platforms: [target_platform],
        ai_provider_used: "anthropic",
        model_used: "claude-3-5-sonnet-20241022",
        generation_prompt: `Video script for ${topic} with brand guidelines`,
        generation_cost_usd: cost_usd,
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
      p_content_type: "video"
    });

    if (usageError) {
      console.error("[generate-video] Usage increment failed:", usageError);
      throw new Error(`Failed to update usage: ${usageError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        content_id: contentData.id,
        video: {
          script: video_script,
          duration: duration_seconds,
          platform: target_platform,
          cost_usd: cost_usd.toFixed(4)
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-video] Error:", error);

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
