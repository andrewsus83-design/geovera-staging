import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
const SERPAPI_API_KEY = Deno.env.get("SERPAPI_API_KEY");

// Cost tracking for APIs
const API_COSTS = {
  perplexity_request: 0.01, // $0.01 per request (estimated)
  serpapi_request: 0.005,   // $0.005 per search
};

interface TrendsRequest {
  category: string;
}

interface PerplexityTrend {
  name: string;
  type: "hashtag" | "challenge" | "product" | "topic";
  estimated_reach: number;
  key_creators: string[];
  context: string;
}

interface YouTubeTrend {
  title: string;
  channel: string;
  views: number;
  published_date: string;
  url: string;
}

interface GoogleTrend {
  query: string;
  search_volume: number;
  trend_status: string;
}

interface TrendData {
  trend_id: string;
  category: string;
  trend_name: string;
  trend_type: "hashtag" | "challenge" | "product" | "topic";
  status: "rising" | "peak" | "declining" | "expired";
  estimated_reach: number;
  growth_rate: number;
  source: "perplexity" | "youtube" | "google_trends";
  metadata: Record<string, any>;
}

interface CreatorInvolvement {
  trend_id: string;
  creator_id: string;
  involvement_level: "high" | "medium" | "low";
  content_count: number;
}

interface TrendDiscoveryResult {
  success: boolean;
  category: string;
  trends_discovered: number;
  trends_updated: number;
  active_trends: TrendData[];
  cost_usd: number;
}

/**
 * Query Perplexity for trending topics
 */
async function discoverWithPerplexity(
  category: string
): Promise<PerplexityTrend[]> {
  if (!PERPLEXITY_API_KEY) {
    console.warn("PERPLEXITY_API_KEY not set, skipping Perplexity discovery");
    return [];
  }

  const prompt = `Find trending hashtags and topics in the ${category} category in Indonesia in the last 7 days.

Include:
- Hashtag/topic name (without the # symbol)
- Type (hashtag, challenge, product, or topic)
- Estimated reach or popularity metric
- Key Indonesian creators or influencers involved (if known)

Focus on Indonesian social media trends, particularly Instagram, TikTok, and YouTube.

Return your findings as a JSON array with this structure:
[
  {
    "name": "trend name",
    "type": "hashtag",
    "estimated_reach": 500000,
    "key_creators": ["creator1", "creator2"],
    "context": "Brief description"
  }
]`;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are a social media trend analyst specializing in Indonesian influencer marketing. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Perplexity API error:", errorData);
    throw new Error(`Perplexity API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "[]";

  // Extract JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.warn("No JSON found in Perplexity response");
    return [];
  }

  try {
    const trends = JSON.parse(jsonMatch[0]);
    return Array.isArray(trends) ? trends : [];
  } catch (err) {
    console.error("Failed to parse Perplexity response:", content);
    return [];
  }
}

/**
 * Query SerpAPI for YouTube trending videos
 */
async function discoverYouTubeTrends(
  category: string
): Promise<YouTubeTrend[]> {
  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY not set, skipping YouTube discovery");
    return [];
  }

  const searchQuery = `${category} Indonesia trending`;
  const url = new URL("https://serpapi.com/search");
  url.searchParams.append("engine", "youtube");
  url.searchParams.append("search_query", searchQuery);
  url.searchParams.append("gl", "id"); // Indonesia
  url.searchParams.append("hl", "id"); // Indonesian language
  url.searchParams.append("api_key", SERPAPI_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    console.error("SerpAPI YouTube error:", response.statusText);
    return [];
  }

  const data = await response.json();
  const videos = data.video_results || [];

  return videos.slice(0, 10).map((video: any) => ({
    title: video.title,
    channel: video.channel?.name || "Unknown",
    views: video.views || 0,
    published_date: video.published_date || "",
    url: video.link || "",
  }));
}

/**
 * Query SerpAPI for Google Trends data
 */
async function discoverGoogleTrends(
  category: string
): Promise<GoogleTrend[]> {
  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY not set, skipping Google Trends discovery");
    return [];
  }

  const url = new URL("https://serpapi.com/search");
  url.searchParams.append("engine", "google_trends");
  url.searchParams.append("q", category);
  url.searchParams.append("geo", "ID"); // Indonesia
  url.searchParams.append("data_type", "TIMESERIES");
  url.searchParams.append("api_key", SERPAPI_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    console.error("SerpAPI Google Trends error:", response.statusText);
    return [];
  }

  const data = await response.json();
  const trends = data.interest_over_time?.timeline_data || [];

  // Analyze recent trend data
  if (trends.length < 2) return [];

  const recentTrend = trends[trends.length - 1];
  const previousTrend = trends[trends.length - 2];

  const searchVolume = recentTrend.values?.[0]?.value || 0;
  const previousVolume = previousTrend.values?.[0]?.value || 0;

  let trendStatus = "stable";
  if (searchVolume > previousVolume * 1.2) trendStatus = "rising";
  else if (searchVolume < previousVolume * 0.8) trendStatus = "declining";

  return [
    {
      query: category,
      search_volume: searchVolume,
      trend_status: trendStatus,
    },
  ];
}

/**
 * Calculate trend status based on growth rate
 */
function calculateTrendStatus(
  growthRate: number,
  lastActivityDate: string | null
): "rising" | "peak" | "declining" | "expired" {
  // Check if expired (no activity in 14 days)
  if (lastActivityDate) {
    const lastActivity = new Date(lastActivityDate);
    const now = new Date();
    const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceActivity > 14) {
      return "expired";
    }
  }

  // Calculate status based on growth rate
  if (growthRate > 0.5) return "rising";  // Growth > 50%
  if (growthRate < -0.2) return "declining"; // Decline > 20%
  return "peak"; // Plateaued
}

/**
 * Match trends to creators based on content
 */
async function matchTrendsToCreators(
  supabase: any,
  trendId: string,
  trendName: string,
  category: string
): Promise<CreatorInvolvement[]> {
  // Search for content that mentions the trend
  const { data: matchingContent, error } = await supabase
    .from("gv_creator_content")
    .select(`
      creator_id,
      caption,
      hashtags,
      gv_creators!inner(category)
    `)
    .eq("gv_creators.category", category)
    .or(`caption.ilike.%${trendName}%,hashtags.cs.{${trendName}}`);

  if (error || !matchingContent) {
    console.warn(`Failed to match trends to creators:`, error);
    return [];
  }

  // Count content per creator
  const creatorContentCount = new Map<string, number>();
  for (const content of matchingContent) {
    const count = creatorContentCount.get(content.creator_id) || 0;
    creatorContentCount.set(content.creator_id, count + 1);
  }

  // Determine involvement level
  const involvements: CreatorInvolvement[] = [];
  for (const [creatorId, contentCount] of creatorContentCount.entries()) {
    let involvementLevel: "high" | "medium" | "low" = "low";
    if (contentCount >= 5) involvementLevel = "high";
    else if (contentCount >= 2) involvementLevel = "medium";

    involvements.push({
      trend_id: trendId,
      creator_id: creatorId,
      involvement_level: involvementLevel,
      content_count: contentCount,
    });
  }

  return involvements;
}

/**
 * Get previous trend data for growth calculation
 */
async function getPreviousTrendData(
  supabase: any,
  trendName: string,
  category: string
): Promise<{ estimated_reach: number; updated_at: string } | null> {
  const { data, error } = await supabase
    .from("gv_trends")
    .select("estimated_reach, updated_at")
    .eq("trend_name", trendName)
    .eq("category", category)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Main trend discovery function
 */
async function discoverTrends(
  supabase: any,
  category: string
): Promise<TrendDiscoveryResult> {
  console.log(`Starting trend discovery for category: ${category}`);

  let totalCost = 0;
  const discoveredTrends: TrendData[] = [];

  // 1. Discover with Perplexity
  const perplexityTrends = await discoverWithPerplexity(category);
  totalCost += API_COSTS.perplexity_request;

  for (const trend of perplexityTrends) {
    const trendId = `${category}_${trend.name.toLowerCase().replace(/\s+/g, "_")}`;

    // Get previous trend data
    const previousData = await getPreviousTrendData(supabase, trend.name, category);

    // Calculate growth rate
    let growthRate = 0;
    if (previousData) {
      const previousReach = previousData.estimated_reach;
      if (previousReach > 0) {
        growthRate = (trend.estimated_reach - previousReach) / previousReach;
      }
    }

    // Determine status
    const status = calculateTrendStatus(
      growthRate,
      previousData?.updated_at || null
    );

    discoveredTrends.push({
      trend_id: trendId,
      category,
      trend_name: trend.name,
      trend_type: trend.type,
      status,
      estimated_reach: trend.estimated_reach,
      growth_rate: growthRate,
      source: "perplexity",
      metadata: {
        key_creators: trend.key_creators,
        context: trend.context,
      },
    });
  }

  // 2. Discover YouTube trends
  const youtubeTrends = await discoverYouTubeTrends(category);
  totalCost += API_COSTS.serpapi_request;

  for (const video of youtubeTrends) {
    const trendId = `${category}_youtube_${video.title.toLowerCase().replace(/\s+/g, "_").substring(0, 50)}`;

    discoveredTrends.push({
      trend_id: trendId,
      category,
      trend_name: video.title,
      trend_type: "topic",
      status: "rising",
      estimated_reach: video.views,
      growth_rate: 0,
      source: "youtube",
      metadata: {
        channel: video.channel,
        published_date: video.published_date,
        url: video.url,
      },
    });
  }

  // 3. Discover Google Trends
  const googleTrends = await discoverGoogleTrends(category);
  totalCost += API_COSTS.serpapi_request;

  for (const trend of googleTrends) {
    const trendId = `${category}_google_${trend.query.toLowerCase().replace(/\s+/g, "_")}`;

    let status: "rising" | "peak" | "declining" | "expired" = "peak";
    if (trend.trend_status === "rising") status = "rising";
    else if (trend.trend_status === "declining") status = "declining";

    discoveredTrends.push({
      trend_id: trendId,
      category,
      trend_name: trend.query,
      trend_type: "topic",
      status,
      estimated_reach: trend.search_volume * 1000, // Convert to estimated reach
      growth_rate: 0,
      source: "google_trends",
      metadata: {
        search_volume: trend.search_volume,
      },
    });
  }

  // Insert/update trends in database
  let trendsCreated = 0;
  let trendsUpdated = 0;
  const activeTrends: TrendData[] = [];

  for (const trend of discoveredTrends) {
    // Check if trend exists
    const { data: existingTrend } = await supabase
      .from("gv_trends")
      .select("id")
      .eq("trend_name", trend.trend_name)
      .eq("category", trend.category)
      .single();

    const timestamp = new Date().toISOString();

    if (existingTrend) {
      // Update existing trend
      await supabase
        .from("gv_trends")
        .update({
          status: trend.status,
          estimated_reach: trend.estimated_reach,
          growth_rate: trend.growth_rate,
          metadata: trend.metadata,
          updated_at: timestamp,
        })
        .eq("id", existingTrend.id);

      trendsUpdated++;
    } else {
      // Insert new trend
      await supabase
        .from("gv_trends")
        .insert({
          trend_id: trend.trend_id,
          category: trend.category,
          trend_name: trend.trend_name,
          trend_type: trend.trend_type,
          status: trend.status,
          estimated_reach: trend.estimated_reach,
          growth_rate: trend.growth_rate,
          source: trend.source,
          metadata: trend.metadata,
          discovered_at: timestamp,
          updated_at: timestamp,
        });

      trendsCreated++;
    }

    // Match trends to creators
    if (trend.status === "rising" || trend.status === "peak") {
      const involvements = await matchTrendsToCreators(
        supabase,
        trend.trend_id,
        trend.trend_name,
        category
      );

      // Insert creator involvements
      if (involvements.length > 0) {
        await supabase
          .from("gv_trend_involvement")
          .upsert(involvements, {
            onConflict: "trend_id,creator_id",
          });
      }

      activeTrends.push(trend);
    }
  }

  return {
    success: true,
    category,
    trends_discovered: trendsCreated,
    trends_updated: trendsUpdated,
    active_trends: activeTrends,
    cost_usd: totalCost,
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription tier - For batch operations, check user's brand tier
    const { data: userBrands } = await supabase
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

    const { data: brand } = await supabase
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

    // Parse request body
    const body: TrendsRequest = await req.json();

    if (!body.category) {
      return new Response(
        JSON.stringify({ error: "Missing required field: category" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Discover trends
    const result = await discoverTrends(supabase, body.category);

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error discovering trends:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to discover trends",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
