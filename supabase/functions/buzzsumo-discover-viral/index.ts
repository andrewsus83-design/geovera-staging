import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DiscoverViralRequest {
  brand_id: string;
  category: string;
  country?: string;
}

interface ViralDiscovery {
  topic_title: string;
  topic_description: string;
  trending_keywords: string[];
  industry_relevance: string;
  estimated_reach: number;
  social_platforms: string[];
  trending_since: string;
  peak_engagement_score: number;
  authority_score: number;
  trust_building_angle: string;
  source_urls: string[];
  target_country?: string;
  content_language?: string;
  region?: string;
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
    // Validate API keys
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!perplexityKey || !openaiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "API keys not configured" }),
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

    const requestData: DiscoverViralRequest = await req.json();
    const { brand_id, category, country } = requestData;

    if (!brand_id || !category) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: brand_id, category"
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

    // Check quota
    const { data: quotaCheck, error: quotaError } = await supabaseClient
      .rpc("check_viral_quota_reached", { p_brand_id: brand_id });

    if (quotaError) {
      console.error("Quota check error:", quotaError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to check quota" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (quotaCheck === true) {
      const { data: remaining } = await supabaseClient
        .rpc("get_remaining_viral_discoveries", { p_brand_id: brand_id });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Weekly viral discovery quota reached",
          quota_reached: true,
          remaining: remaining || 0
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Use Perplexity to discover viral trends - GLOBAL SUPPORT for 50+ countries
    const perplexityPrompt = `You are a GLOBAL viral content analyst specializing in social media trends and authority building across 50+ countries worldwide.

Find ONE highly viral, trending topic in the "${category}" industry${country ? ` in ${country}` : " (search globally across all countries)"} that has gained significant traction in the last 7-14 days.

Focus on topics that:
1. Have demonstrable viral metrics (millions of views/engagements)
2. Are relevant to brands in the "${category}" space
3. Offer opportunities for building trust and authority
4. Can be turned into compelling storytelling content
5. Are appropriate for professional brand content
6. Can be trending in ANY country or language (English, Spanish, Indonesian, Japanese, Korean, Chinese, French, German, etc.)

Return ONLY valid JSON in this exact format:
{
  "topic_title": "Short, catchy title (max 100 chars)",
  "topic_description": "Detailed description of what's trending and why (200-300 words)",
  "trending_keywords": ["keyword1", "keyword2", "keyword3"],
  "industry_relevance": "How this specifically relates to ${category} brands",
  "estimated_reach": 5000000,
  "social_platforms": ["tiktok", "instagram", "twitter"],
  "trending_since": "2026-02-07",
  "peak_engagement_score": 87.5,
  "authority_score": 0.85,
  "trust_building_angle": "Why this topic builds trust/authority for brands",
  "source_urls": ["url1", "url2", "url3"],
  "target_country": "${country || 'global'}",
  "content_language": "en",
  "region": "North America"
}

Make sure all data is current, real, and verifiable. Use your real-time search capabilities. Search GLOBALLY across all markets.`;

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are a GLOBAL viral content discovery expert covering 50+ countries and multiple languages worldwide. Search across ALL markets and languages. Always return valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: perplexityPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("Perplexity API error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to discover viral content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const perplexityData: PerplexityResponse = await perplexityResponse.json();
    const perplexityContent = perplexityData.choices[0]?.message?.content;

    if (!perplexityContent) {
      return new Response(
        JSON.stringify({ success: false, error: "No content from Perplexity" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse Perplexity response (clean markdown if present)
    let viralDiscovery: ViralDiscovery;
    try {
      const cleanContent = perplexityContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      viralDiscovery = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse Perplexity response:", perplexityContent);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid response format from Perplexity" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate Perplexity cost (Sonar Pro: $5/1M input, $15/1M output tokens)
    const perplexityCost = (
      (perplexityData.usage.prompt_tokens / 1000000) * 5 +
      (perplexityData.usage.completion_tokens / 1000000) * 15
    );

    // Step 2: Generate story using OpenAI (will be called separately, so we just save discovery first)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Get Monday

    // Save viral discovery to database - GLOBAL: Include country, language, region
    const { data: discovery, error: discoveryError } = await supabaseClient
      .from("gv_viral_discoveries")
      .insert({
        brand_id,
        discovery_date: new Date().toISOString().split('T')[0],
        week_start: weekStart.toISOString().split('T')[0],
        topic_title: viralDiscovery.topic_title,
        topic_description: viralDiscovery.topic_description,
        trending_keywords: viralDiscovery.trending_keywords,
        industry_relevance: viralDiscovery.industry_relevance,
        estimated_reach: viralDiscovery.estimated_reach,
        social_platforms: viralDiscovery.social_platforms,
        trending_since: viralDiscovery.trending_since,
        peak_engagement_score: viralDiscovery.peak_engagement_score,
        authority_score: viralDiscovery.authority_score,
        trust_building_angle: viralDiscovery.trust_building_angle,
        perplexity_response: perplexityData,
        source_urls: viralDiscovery.source_urls,
        target_country: viralDiscovery.target_country || country || null, // GLOBAL: Store target country
        content_language: viralDiscovery.content_language || "en", // GLOBAL: Store content language
        region: viralDiscovery.region || null, // GLOBAL: Store region
        story_generated: false,
      })
      .select()
      .single();

    if (discoveryError) {
      console.error("Discovery save error:", discoveryError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save viral discovery" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Automatically call story generation function
    const storyResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/buzzsumo-generate-story`,
      {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discovery_id: discovery.id,
          brand_id: brand_id,
        }),
      }
    );

    let storyData = null;
    let openaiCost = 0;

    if (storyResponse.ok) {
      const storyResult = await storyResponse.json();
      if (storyResult.success) {
        storyData = storyResult.story;
        openaiCost = storyResult.cost || 0;

        // Update discovery with story reference
        await supabaseClient
          .from("gv_viral_discoveries")
          .update({
            story_generated: true,
            story_id: storyData.id,
          })
          .eq("id", discovery.id);
      }
    }

    // Step 4: Create daily insight for this viral discovery
    const { error: insightError } = await supabaseClient
      .from("gv_daily_insights")
      .insert({
        brand_id,
        insight_type: "content_suggestion",
        title: `New viral opportunity: ${viralDiscovery.topic_title}`,
        description: `${viralDiscovery.topic_description.substring(0, 150)}...`,
        data: {
          discovery_id: discovery.id,
          estimated_reach: viralDiscovery.estimated_reach,
          platforms: viralDiscovery.social_platforms,
          authority_score: viralDiscovery.authority_score,
        },
        priority: "high",
        impact_score: Math.round(viralDiscovery.peak_engagement_score),
        column_type: "potential",
        ai_provider: "perplexity",
        confidence_score: viralDiscovery.authority_score,
        insight_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (!insightError) {
      await supabaseClient
        .from("gv_viral_discoveries")
        .update({
          insight_created: true,
          insight_id: insightError ? null : discovery.id,
        })
        .eq("id", discovery.id);
    }

    // Update quota
    await supabaseClient.rpc("increment_viral_discovery_usage", {
      p_brand_id: brand_id,
      p_perplexity_cost: perplexityCost,
      p_openai_cost: openaiCost,
    });

    // Get remaining quota
    const { data: remaining } = await supabaseClient
      .rpc("get_remaining_viral_discoveries", { p_brand_id: brand_id });

    return new Response(
      JSON.stringify({
        success: true,
        discovery,
        story: storyData,
        costs: {
          perplexity: perplexityCost,
          openai: openaiCost,
          total: perplexityCost + openaiCost,
        },
        quota: {
          remaining: remaining || 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in buzzsumo-discover-viral:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
