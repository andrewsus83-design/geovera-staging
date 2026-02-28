import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TrainBrandModelRequest {
  brand_id: string;
  content_type: "image" | "video";
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

    const requestData: TrainBrandModelRequest = await req.json();
    const { brand_id, content_type } = requestData;

    // Validate brand
    const { data: brand, error: brandError } = await supabaseClient
      .from("gv_brands")
      .select("brand_name, brand_description")
      .eq("id", brand_id)
      .single();

    if (brandError || !brand) {
      return new Response(
        JSON.stringify({ success: false, error: "Brand not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update training status
    await supabaseClient
      .from("gv_brand_visual_guidelines")
      .upsert({
        brand_id,
        training_status: "training",
        updated_at: new Date().toISOString()
      });

    // Fetch all training data for this brand and content type
    const { data: trainingData, error: trainingError } = await supabaseClient
      .from("gv_content_training_data")
      .select("*")
      .eq("brand_id", brand_id)
      .eq("content_type", content_type)
      .eq("is_active", true)
      .eq("approved_for_training", true);

    if (trainingError) {
      throw new Error(`Failed to fetch training data: ${trainingError.message}`);
    }

    if (!trainingData || trainingData.length < 3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Insufficient training data. Please upload at least 3 examples.",
          code: "INSUFFICIENT_TRAINING_DATA"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare training data summary for Claude
    const trainingDataSummary = trainingData.map((item: any) => ({
      dominant_colors: item.dominant_colors,
      visual_style_tags: item.visual_style_tags,
      composition_type: item.composition_type,
      visual_analysis: item.visual_analysis,
      quality_score: item.quality_score
    }));

    // Use Claude to extract patterns and generate guidelines
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `Analyze these ${trainingData.length} brand ${content_type} examples and extract visual brand guidelines.

Brand: ${brand.brand_name}
Description: ${brand.brand_description || "N/A"}

Training Data:
${JSON.stringify(trainingDataSummary, null, 2)}

EXTRACT AND RETURN JSON ONLY:
{
  "primary_colors": ["#HEX1", "#HEX2"],
  "secondary_colors": ["#HEX1", "#HEX2"],
  "accent_colors": ["#HEX1"],
  "visual_style": "minimal|bold|elegant|playful|corporate|artistic|modern|vintage",
  "visual_mood": ["professional", "energetic"],
  "composition_preferences": ["centered", "rule-of-thirds"],
  "preferred_style": "detailed description",
  "lighting_preference": "natural|studio|dramatic",
  "background_preference": "solid|gradient|minimal",
  "style_keywords": ["modern", "clean", "bold"],
  "negative_keywords": ["cluttered", "outdated"],
  "prompt_template": "Professional {content_type} for {brand_name}, featuring {style_keywords}. {composition_preferences}. {lighting_preference} lighting. High quality, on-brand.",
  "confidence_score": 0.0-1.0,
  "pattern_insights": {
    "color_harmony": "description",
    "composition_patterns": "description",
    "style_consistency": "description"
  }
}

Guidelines:
1. Identify the most frequent colors (primary, secondary, accent)
2. Determine consistent visual style across examples
3. Extract composition patterns
4. Generate a prompt template for DALL-E/Runway ML
5. Include negative keywords to avoid
6. Calculate confidence score based on consistency across examples`
        }]
      })
    });

    const claudeData = await claudeResponse.json();

    if (!claudeResponse.ok) {
      throw new Error(`Claude error: ${claudeData.error?.message || "Unknown error"}`);
    }

    const analysisText = claudeData.content[0].text;

    // Extract JSON from response
    let guidelines: any;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        guidelines = JSON.parse(jsonMatch[0]);
      } else {
        guidelines = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error("[train-brand-model] Failed to parse Claude response:", analysisText);
      throw new Error("Failed to parse training results");
    }

    // Save visual guidelines
    const guidelinesUpdate: any = {
      brand_id,
      primary_colors: guidelines.primary_colors || [],
      secondary_colors: guidelines.secondary_colors || [],
      accent_colors: guidelines.accent_colors || [],
      visual_style: guidelines.visual_style || null,
      visual_mood: guidelines.visual_mood || [],
      composition_preferences: guidelines.composition_preferences || [],
      lighting_preference: guidelines.lighting_preference || null,
      background_preference: guidelines.background_preference || null,
      style_keywords: guidelines.style_keywords || [],
      negative_keywords: guidelines.negative_keywords || [],
      total_training_examples: trainingData.length,
      last_trained_at: new Date().toISOString(),
      training_status: "trained",
      confidence_score: guidelines.confidence_score || 0.8,
      updated_at: new Date().toISOString()
    };

    // Set appropriate field for content type
    if (content_type === "image") {
      guidelinesUpdate.image_prompt_template = guidelines.prompt_template;
      guidelinesUpdate.preferred_image_style = guidelines.preferred_style;
    } else {
      guidelinesUpdate.video_prompt_template = guidelines.prompt_template;
      guidelinesUpdate.preferred_video_style = guidelines.preferred_style;
    }

    const { error: updateError } = await supabaseClient
      .from("gv_brand_visual_guidelines")
      .upsert(guidelinesUpdate);

    if (updateError) {
      throw new Error(`Failed to save guidelines: ${updateError.message}`);
    }

    // Create style patterns
    if (guidelines.pattern_insights) {
      const patterns = [];

      if (guidelines.pattern_insights.color_harmony) {
        patterns.push({
          brand_id,
          pattern_type: "color_harmony",
          content_type,
          pattern_name: "Brand Color Harmony",
          pattern_description: guidelines.pattern_insights.color_harmony,
          pattern_data: {
            primary_colors: guidelines.primary_colors,
            secondary_colors: guidelines.secondary_colors,
            accent_colors: guidelines.accent_colors
          },
          confidence_score: guidelines.confidence_score,
          is_validated: true
        });
      }

      if (guidelines.pattern_insights.composition_patterns) {
        patterns.push({
          brand_id,
          pattern_type: "composition",
          content_type,
          pattern_name: "Brand Composition Pattern",
          pattern_description: guidelines.pattern_insights.composition_patterns,
          pattern_data: {
            preferences: guidelines.composition_preferences
          },
          confidence_score: guidelines.confidence_score,
          is_validated: true
        });
      }

      if (guidelines.pattern_insights.style_consistency) {
        patterns.push({
          brand_id,
          pattern_type: "style",
          content_type,
          pattern_name: "Brand Visual Style",
          pattern_description: guidelines.pattern_insights.style_consistency,
          pattern_data: {
            visual_style: guidelines.visual_style,
            mood: guidelines.visual_mood,
            keywords: guidelines.style_keywords
          },
          confidence_score: guidelines.confidence_score,
          is_validated: true
        });
      }

      if (patterns.length > 0) {
        await supabaseClient
          .from("gv_visual_style_patterns")
          .insert(patterns);
      }
    }

    const cost_usd = 0.015; // Claude Sonnet cost

    return new Response(
      JSON.stringify({
        success: true,
        guidelines: {
          primary_colors: guidelines.primary_colors,
          secondary_colors: guidelines.secondary_colors,
          accent_colors: guidelines.accent_colors,
          visual_style: guidelines.visual_style,
          prompt_template: guidelines.prompt_template,
          confidence_score: guidelines.confidence_score
        },
        training_examples_used: trainingData.length,
        patterns_created: guidelines.pattern_insights ? Object.keys(guidelines.pattern_insights).length : 0,
        cost_usd: cost_usd.toFixed(4)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[train-brand-model] Error:", error);

    // Update training status to error
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
      const requestData = await req.json();
      await supabaseClient
        .from("gv_brand_visual_guidelines")
        .update({
          training_status: "needs_update",
          training_error: error.message,
          updated_at: new Date().toISOString()
        })
        .eq("brand_id", requestData.brand_id);
    } catch (updateError) {
      console.error("[train-brand-model] Failed to update error status:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: "TRAINING_FAILED"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
