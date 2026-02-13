import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DiscoverBrandsRequest {
  brand_id: string;
  category: string;
  country: string;
}

interface DiscoveredBrand {
  brand_name: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  youtube_handle?: string;
  facebook_handle?: string;
  follower_count_estimate?: number;
  positioning?: string;
  differentiators?: string[];
}

interface PerplexityMessage {
  role: string;
  content: string;
}

interface PerplexityResponse {
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
    // Validate Perplexity API key
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Perplexity API key not configured" }),
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

    const requestData: DiscoverBrandsRequest = await req.json();
    const { brand_id, category, country } = requestData;

    if (!brand_id || !category || !country) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: brand_id, category, country"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get brand details and check subscription tier
    const { data: brand, error: brandError } = await supabaseClient
      .from("brands")
      .select("brand_name, category, subscription_tier")
      .eq("id", brand_id)
      .single();

    if (brandError || !brand) {
      return new Response(
        JSON.stringify({ success: false, error: "Brand not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription tier - Radar feature requires Partner tier
    if (brand.subscription_tier !== 'partner') {
      return new Response(
        JSON.stringify({
          error: "Radar feature is only available for Partner tier subscribers",
          current_tier: brand.subscription_tier || 'none',
          required_tier: 'partner',
          upgrade_url: `${Deno.env.get("FRONTEND_URL") || 'https://geovera.xyz'}/pricing`,
          message: "Upgrade to Partner tier to access advanced Radar analytics"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Perplexity query
    const perplexityQuery = `Find 2-3 recommended competitor brands in the ${category} industry in ${country} similar to ${brand.brand_name}.

Please provide detailed information including:
- Brand name
- Social media handles (Instagram, TikTok, YouTube, Facebook) - provide full handles without @ symbol
- Follower count estimate (approximate number)
- Brand positioning (what makes them unique)
- Key differentiators (2-3 main points)

Focus on brands with 10K-500K followers that are active on social media.

Return ONLY valid JSON in this exact format with no additional text:
{
  "brands": [
    {
      "brand_name": "Brand Name",
      "instagram_handle": "username",
      "tiktok_handle": "username",
      "youtube_handle": "channelname",
      "facebook_handle": "pagename",
      "follower_count_estimate": 50000,
      "positioning": "Description of brand positioning",
      "differentiators": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}`;

    console.log("[radar-discover-brands] Calling Perplexity API...");

    // Call Perplexity API
    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityKey}`
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are a brand research expert. Always return valid JSON only, no additional text or markdown."
          },
          {
            role: "user",
            content: perplexityQuery
          }
        ] as PerplexityMessage[],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("[radar-discover-brands] Perplexity API error:", errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status} - ${errorText}`);
    }

    const perplexityData: PerplexityResponse = await perplexityResponse.json();

    if (!perplexityData.choices || perplexityData.choices.length === 0) {
      throw new Error("No response from Perplexity API");
    }

    const responseContent = perplexityData.choices[0].message.content;
    console.log("[radar-discover-brands] Raw response:", responseContent);

    // Parse JSON response (handle potential markdown code blocks)
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const jsonContent = responseContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      parsedResponse = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("[radar-discover-brands] JSON parse error:", parseError);
      throw new Error(`Failed to parse Perplexity response: ${parseError.message}`);
    }

    const discoveredBrands: DiscoveredBrand[] = parsedResponse.brands || [];

    if (discoveredBrands.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No competitor brands found",
          brands: [],
          tokens: perplexityData.usage.total_tokens
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert discovered brands into gv_competitors table
    const competitorsToInsert = discoveredBrands.map(brand => ({
      brand_id: brand_id,
      competitor_name: brand.brand_name,
      competitor_domain: brand.instagram_handle
        ? `instagram.com/${brand.instagram_handle}`
        : "unknown",
      competitor_url: brand.instagram_handle
        ? `https://instagram.com/${brand.instagram_handle}`
        : null,
      competitor_type: "social_media_competitor",
      market_position: brand.positioning || null,
      tracking_priority: brand.follower_count_estimate && brand.follower_count_estimate > 100000
        ? "high"
        : "medium",
      is_active: true
    }));

    const { data: insertedCompetitors, error: insertError } = await supabaseClient
      .from("gv_competitors")
      .insert(competitorsToInsert)
      .select();

    if (insertError) {
      console.error("[radar-discover-brands] Insert error:", insertError);
      throw new Error(`Failed to save competitors: ${insertError.message}`);
    }

    console.log(`[radar-discover-brands] Successfully saved ${insertedCompetitors?.length || 0} competitors`);

    // Calculate cost (Perplexity pricing: ~$1 per 1M tokens for sonar-pro)
    const costUsd = (perplexityData.usage.total_tokens / 1_000_000) * 1.0;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Discovered ${discoveredBrands.length} competitor brands`,
        brands: discoveredBrands,
        competitors_saved: insertedCompetitors?.length || 0,
        tokens: perplexityData.usage.total_tokens,
        cost_usd: costUsd.toFixed(4)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[radar-discover-brands] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: "DISCOVERY_FAILED"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
