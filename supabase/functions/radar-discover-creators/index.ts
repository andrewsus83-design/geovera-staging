import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DiscoverCreatorsRequest {
  category: string;
  country: string;
  batch_size?: number;
}

interface DiscoveredCreator {
  name: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  youtube_handle?: string;
  facebook_handle?: string;
  follower_count?: number;
  engagement_rate?: number;
  content_focus?: string;
  recent_collaborations?: string[];
  primary_language?: string;
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

    const requestData: DiscoverCreatorsRequest = await req.json();
    const { category, country, batch_size = 40 } = requestData;

    if (!category || !country) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: category, country"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription tier - For batch operations, check user's brand tier
    const { data: userBrands } = await supabaseClient
      .from('user_brands')
      .select('brand_id, role')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (!userBrands) {
      return new Response(
        JSON.stringify({ error: "No brand found for user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: brand } = await supabaseClient
      .from('brands')
      .select('subscription_tier')
      .eq('id', userBrands.brand_id)
      .single();

    if (!brand || brand.subscription_tier !== 'partner') {
      return new Response(
        JSON.stringify({
          error: "Radar feature is only available for Partner tier subscribers",
          current_tier: brand?.subscription_tier || 'none',
          required_tier: 'partner',
          upgrade_url: `${Deno.env.get("FRONTEND_URL") || 'https://geovera.xyz'}/pricing`,
          message: "Upgrade to Partner tier to access advanced Radar analytics"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate batch size (max 40 to avoid token limits)
    const validBatchSize = Math.min(Math.max(1, batch_size), 40);

    // Build Perplexity query - GLOBAL SUPPORT for 50+ countries
    const perplexityQuery = `Find ${validBatchSize} top content creators in the ${category} industry in ${country} (GLOBAL SEARCH - not limited to any single country) with the following criteria:

- Follower range: 100K - 2M (mid-tier influencers)
- Active posting (last 14 days)
- High engagement rate (>3%)
- Content language: Any (English, Indonesian, Spanish, French, German, Japanese, Korean, Chinese, etc.)

For each creator, provide:
- Name (full name or creator name)
- Social media handles (Instagram, TikTok, YouTube, Facebook) - provide handles without @ symbol
- Follower count (approximate number)
- Engagement rate (as percentage, e.g., 4.5)
- Content focus (brief description of their niche)
- Recent brand collaborations (1-2 examples if available)
- Primary language of content (e.g., "en", "id", "es", "ja")

Return ONLY valid JSON in this exact format with no additional text:
{
  "creators": [
    {
      "name": "Creator Name",
      "instagram_handle": "username",
      "tiktok_handle": "username",
      "youtube_handle": "channelname",
      "facebook_handle": "pagename",
      "follower_count": 250000,
      "engagement_rate": 4.5,
      "content_focus": "Description of content niche",
      "recent_collaborations": ["Brand 1", "Brand 2"],
      "primary_language": "en"
    }
  ]
}`;

    console.log(`[radar-discover-creators] Discovering ${validBatchSize} creators in ${category} (${country})...`);

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
            content: "You are a GLOBAL creator research expert specializing in social media influencers across 50+ countries worldwide. Always return valid JSON only, no additional text or markdown. Support creators from ALL countries and languages."
          },
          {
            role: "user",
            content: perplexityQuery
          }
        ] as PerplexityMessage[],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("[radar-discover-creators] Perplexity API error:", errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status} - ${errorText}`);
    }

    const perplexityData: PerplexityResponse = await perplexityResponse.json();

    if (!perplexityData.choices || perplexityData.choices.length === 0) {
      throw new Error("No response from Perplexity API");
    }

    const responseContent = perplexityData.choices[0].message.content;
    console.log("[radar-discover-creators] Raw response length:", responseContent.length);

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
      console.error("[radar-discover-creators] JSON parse error:", parseError);
      console.error("[radar-discover-creators] Response content:", responseContent.substring(0, 500));
      throw new Error(`Failed to parse Perplexity response: ${parseError.message}`);
    }

    const discoveredCreators: DiscoveredCreator[] = parsedResponse.creators || [];

    if (discoveredCreators.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No creators found",
          creators: [],
          tokens: perplexityData.usage.total_tokens
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[radar-discover-creators] Discovered ${discoveredCreators.length} creators`);

    // Determine follower tier based on follower count
    const getFollowerTier = (followerCount: number): string => {
      if (followerCount < 10000) return "nano";
      if (followerCount < 50000) return "micro";
      if (followerCount < 500000) return "mid";
      if (followerCount < 1000000) return "macro";
      return "mega";
    };

    // Determine primary platform (where they have most followers)
    const getPrimaryPlatform = (creator: DiscoveredCreator): string => {
      if (creator.instagram_handle) return "instagram";
      if (creator.tiktok_handle) return "tiktok";
      if (creator.youtube_handle) return "youtube";
      if (creator.facebook_handle) return "facebook";
      return "instagram";
    };

    // Insert discovered creators into gv_discovered_creators table
    const creatorsToInsert = discoveredCreators.map(creator => {
      const platform = getPrimaryPlatform(creator);
      const username = creator.instagram_handle
        || creator.tiktok_handle
        || creator.youtube_handle
        || creator.facebook_handle
        || creator.name.toLowerCase().replace(/\s+/g, "_");

      return {
        platform: platform,
        username: username,
        category: category,
        country: country, // GLOBAL: Store which country this creator was discovered for
        primary_language: creator.primary_language || "en", // GLOBAL: Store content language
        expected_tier: getFollowerTier(creator.follower_count || 100000),
        discovered_via: "perplexity_radar",
        research_date: new Date().toISOString(),
        status: "pending_verification",
        estimated_followers: creator.follower_count || null,
        verification_result: {
          name: creator.name,
          content_focus: creator.content_focus,
          engagement_rate: creator.engagement_rate,
          recent_collaborations: creator.recent_collaborations,
          primary_language: creator.primary_language,
          handles: {
            instagram: creator.instagram_handle,
            tiktok: creator.tiktok_handle,
            youtube: creator.youtube_handle,
            facebook: creator.facebook_handle
          }
        }
      };
    });

    // Insert in batches to avoid conflicts
    const insertResults = [];
    const insertErrors = [];

    for (const creator of creatorsToInsert) {
      try {
        const { data, error } = await supabaseClient
          .from("gv_discovered_creators")
          .upsert(
            creator,
            {
              onConflict: "platform,username",
              ignoreDuplicates: false
            }
          )
          .select()
          .single();

        if (error) {
          console.error(`[radar-discover-creators] Insert error for ${creator.username}:`, error);
          insertErrors.push({ username: creator.username, error: error.message });
        } else {
          insertResults.push(data);
        }
      } catch (err) {
        console.error(`[radar-discover-creators] Exception for ${creator.username}:`, err);
        insertErrors.push({ username: creator.username, error: err.message });
      }
    }

    console.log(`[radar-discover-creators] Successfully saved ${insertResults.length}/${creatorsToInsert.length} creators`);

    if (insertErrors.length > 0) {
      console.warn(`[radar-discover-creators] ${insertErrors.length} insert errors:`, insertErrors);
    }

    // Calculate cost (Perplexity pricing: ~$1 per 1M tokens for sonar-pro)
    const costUsd = (perplexityData.usage.total_tokens / 1_000_000) * 1.0;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Discovered ${discoveredCreators.length} creators`,
        creators: discoveredCreators,
        creators_saved: insertResults.length,
        creators_failed: insertErrors.length,
        errors: insertErrors.length > 0 ? insertErrors : undefined,
        tokens: perplexityData.usage.total_tokens,
        cost_usd: costUsd.toFixed(4)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[radar-discover-creators] Error:", error);

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
