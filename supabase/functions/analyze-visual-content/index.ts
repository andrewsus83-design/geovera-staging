import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AnalyzeVisualContentRequest {
  brand_id: string;
  file_url: string;
  content_type: "image" | "video";
  training_data_id?: string;
}

interface VisualAnalysis {
  dominant_colors: string[];
  color_palette: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  visual_style_tags: string[];
  composition_type: string;
  quality_score: number;
  brand_consistency_score: number;
  composition_score: number;
  mood: string[];
  subject_matter: string;
  lighting: string;
  background_style: string;
  text_overlay_detected: boolean;
  recommendations: string[];
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

    const requestData: AnalyzeVisualContentRequest = await req.json();
    const { brand_id, file_url, content_type, training_data_id } = requestData;

    // Validate brand access
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

    // Fetch the image for analysis
    const imageResponse = await fetch(file_url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Analyze with Claude 3.5 Sonnet (vision)
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Image
              }
            },
            {
              type: "text",
              content: `Analyze this ${content_type} for brand visual consistency training. Brand: ${brand.brand_name}

ANALYZE AND RETURN JSON ONLY (no additional text):
{
  "dominant_colors": ["#HEX1", "#HEX2", "#HEX3"],
  "color_palette": {
    "primary": ["#HEX"],
    "secondary": ["#HEX"],
    "accent": ["#HEX"]
  },
  "visual_style_tags": ["modern", "minimal", "bold"],
  "composition_type": "centered|rule-of-thirds|symmetrical|asymmetrical",
  "quality_score": 0.0-1.0,
  "composition_score": 0.0-1.0,
  "mood": ["professional", "energetic"],
  "subject_matter": "brief description",
  "lighting": "natural|studio|low-key|high-key|dramatic",
  "background_style": "solid|gradient|textured|photo|minimal",
  "text_overlay_detected": true|false,
  "recommendations": ["specific improvement suggestions"]
}

Focus on:
1. Extract exact hex color codes for dominant colors
2. Identify visual style (minimal, bold, elegant, playful, corporate, artistic, modern, vintage)
3. Composition quality and type
4. Lighting and mood
5. Brand consistency potential
6. Professional quality assessment`
            }
          ]
        }]
      })
    });

    const claudeData = await claudeResponse.json();

    if (!claudeResponse.ok) {
      throw new Error(`Claude error: ${claudeData.error?.message || "Unknown error"}`);
    }

    const analysisText = claudeData.content[0].text;

    // Extract JSON from response (handle potential markdown formatting)
    let analysis: VisualAnalysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error("[analyze-visual-content] Failed to parse Claude response:", analysisText);
      throw new Error("Failed to parse visual analysis");
    }

    // Calculate brand consistency score if guidelines exist
    const { data: existingGuidelines } = await supabaseClient
      .from("gv_brand_visual_guidelines")
      .select("primary_colors, secondary_colors, accent_colors, style_keywords")
      .eq("brand_id", brand_id)
      .single();

    let brand_consistency_score = 0.5; // Default neutral score

    if (existingGuidelines && existingGuidelines.primary_colors?.length > 0) {
      // Calculate color overlap
      const brandColors = [
        ...(existingGuidelines.primary_colors || []),
        ...(existingGuidelines.secondary_colors || []),
        ...(existingGuidelines.accent_colors || [])
      ];

      const colorMatches = analysis.dominant_colors.filter(color =>
        brandColors.some(brandColor => brandColor.toLowerCase() === color.toLowerCase())
      ).length;

      const colorScore = colorMatches / Math.max(analysis.dominant_colors.length, 1);

      // Calculate style overlap
      const styleMatches = analysis.visual_style_tags.filter(tag =>
        existingGuidelines.style_keywords?.includes(tag)
      ).length;

      const styleScore = styleMatches / Math.max(analysis.visual_style_tags.length, 1);

      // Weighted average
      brand_consistency_score = (colorScore * 0.6) + (styleScore * 0.4);
    }

    analysis.brand_consistency_score = Math.round(brand_consistency_score * 100) / 100;

    // Update training data if provided
    if (training_data_id) {
      await supabaseClient
        .from("gv_content_training_data")
        .update({
          visual_analysis: analysis as any,
          quality_score: analysis.quality_score,
          brand_consistency_score: analysis.brand_consistency_score,
          composition_score: analysis.composition_score,
          dominant_colors: analysis.dominant_colors,
          color_palette: analysis.color_palette as any,
          visual_style_tags: analysis.visual_style_tags,
          composition_type: analysis.composition_type,
          updated_at: new Date().toISOString()
        })
        .eq("id", training_data_id);
    }

    const cost_usd = 0.003; // Claude Sonnet vision cost per image

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        cost_usd: cost_usd.toFixed(4)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[analyze-visual-content] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: "ANALYSIS_FAILED"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
