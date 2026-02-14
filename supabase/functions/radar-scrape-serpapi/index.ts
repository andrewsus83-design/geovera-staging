import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================
// Types
// ============================================================

interface SerpAPIRequest {
  operation: "youtube_channel" | "youtube_videos" | "google_trends" | "batch_youtube";
  creator_id?: string;
  youtube_handle?: string;
  category?: string;
  country?: string;
  timeframe?: string;
  batch_creators?: Array<{
    creator_id: string;
    youtube_handle: string;
  }>;
}

interface YouTubeChannelStats {
  subscriber_count?: number;
  video_count?: number;
  view_count?: number;
  description?: string;
  custom_url?: string;
  verified?: boolean;
}

interface YouTubeVideo {
  video_id: string;
  title: string;
  link: string;
  thumbnail?: string;
  channel?: string;
  published_date?: string;
  views?: string;
  length?: string;
  description?: string;
}

interface GoogleTrendItem {
  query: string;
  value: number;
  extracted_value?: number;
  link?: string;
  serpapi_link?: string;
}

// ============================================================
// SerpAPI Client
// ============================================================

class SerpAPIClient {
  private apiKey: string;
  private baseUrl = "https://serpapi.com/search.json";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildUrl(params: Record<string, string>): string {
    const url = new URL(this.baseUrl);
    url.searchParams.set("api_key", this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value.toString());
      }
    }

    return url.toString();
  }

  async getYouTubeChannel(handle: string, country: string = "us", language: string = "en"): Promise<any> {
    const cleanHandle = handle.replace("@", "");
    const url = this.buildUrl({
      engine: "youtube",
      search_query: `@${cleanHandle}`,
      gl: country.toLowerCase(), // GLOBAL: Support any country (us, uk, sg, id, etc.)
      hl: language.toLowerCase(), // GLOBAL: Support any language (en, id, es, etc.)
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI YouTube channel request failed: ${response.status}`);
    }

    return await response.json();
  }

  async getYouTubeVideos(handle: string, maxResults: number = 20, country: string = "us", language: string = "en"): Promise<any> {
    const cleanHandle = handle.replace("@", "");
    const url = this.buildUrl({
      engine: "youtube",
      search_query: `@${cleanHandle}`,
      gl: country.toLowerCase(), // GLOBAL: Support any country
      hl: language.toLowerCase(), // GLOBAL: Support any language
      num: maxResults.toString(),
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI YouTube videos request failed: ${response.status}`);
    }

    return await response.json();
  }

  async getGoogleTrends(params: {
    q: string;
    data_type?: string;
    geo?: string;
    date?: string;
    cat?: string;
  }): Promise<any> {
    const url = this.buildUrl({
      engine: "google_trends",
      q: params.q,
      data_type: params.data_type || "TIMESERIES",
      geo: params.geo || "US", // GLOBAL: Default to US (was ID for Indonesia)
      date: params.date || "now 7-d",
      cat: params.cat || "0",
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI Google Trends request failed: ${response.status}`);
    }

    return await response.json();
  }

  async getRelatedQueries(params: {
    q: string;
    geo?: string;
    date?: string;
    cat?: string;
  }): Promise<any> {
    const url = this.buildUrl({
      engine: "google_trends",
      q: params.q,
      data_type: "RELATED_QUERIES",
      geo: params.geo || "US", // GLOBAL: Default to US (was ID for Indonesia)
      date: params.date || "now 7-d",
      cat: params.cat || "0",
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI Related Queries request failed: ${response.status}`);
    }

    return await response.json();
  }
}

// ============================================================
// YouTube Data Processing
// ============================================================

function extractChannelStats(data: any): YouTubeChannelStats | null {
  try {
    // Look for channel info in various locations
    const channelData = data.channel_results || data.channels?.[0] || null;

    if (!channelData) {
      return null;
    }

    return {
      subscriber_count: parseSubscriberCount(channelData.subscribers),
      video_count: parseInt(channelData.video_count || "0"),
      view_count: parseInt(channelData.views || "0"),
      description: channelData.description,
      custom_url: channelData.link,
      verified: channelData.verified || false,
    };
  } catch (error) {
    console.error("[extractChannelStats] Error:", error);
    return null;
  }
}

function parseSubscriberCount(subscriberText: string): number {
  if (!subscriberText) return 0;

  const text = subscriberText.toLowerCase().replace(/,/g, "");

  // Handle formats: "1.5M subscribers", "500K subscribers", "1000 subscribers"
  const match = text.match(/([\d.]+)\s*([km]?)/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "m") return Math.floor(value * 1_000_000);
  if (unit === "k") return Math.floor(value * 1_000);
  return Math.floor(value);
}

function extractVideos(data: any): YouTubeVideo[] {
  try {
    const videos = data.video_results || [];

    return videos.map((video: any) => ({
      video_id: video.video_id || extractVideoId(video.link),
      title: video.title,
      link: video.link,
      thumbnail: video.thumbnail,
      channel: video.channel?.name,
      published_date: video.published_date,
      views: video.views,
      length: video.length,
      description: video.description,
    }));
  } catch (error) {
    console.error("[extractVideos] Error:", error);
    return [];
  }
}

function extractVideoId(url: string): string {
  if (!url) return "";

  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : "";
}

function normalizeYouTubeVideo(video: YouTubeVideo, creatorId: string): any {
  const viewCount = parseViewCount(video.views);

  return {
    creator_id: creatorId,
    platform: "youtube",
    post_id: video.video_id,
    post_url: video.link,
    caption: `${video.title}\n\n${video.description || ""}`,
    hashtags: [],
    posted_at: video.published_date ? parsePublishedDate(video.published_date) : null,
    reach: null,
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    views: viewCount,
    engagement_total: viewCount,
    is_promo: detectPromo(video.title, video.description),
    is_giveaway: detectGiveaway(video.title, video.description),
    is_life_update: detectLifeUpdate(video.title, video.description),
    content_quality_score: null,
    originality_score: null,
    brand_mentions: [],
    analysis_status: "pending",
  };
}

function parseViewCount(viewText: string): number {
  if (!viewText) return 0;

  const text = viewText.toLowerCase().replace(/,/g, "");
  const match = text.match(/([\d.]+)\s*([km]?)/i);

  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "m") return Math.floor(value * 1_000_000);
  if (unit === "k") return Math.floor(value * 1_000);
  return Math.floor(value);
}

function parsePublishedDate(dateStr: string): string | null {
  try {
    // Handle relative dates: "2 days ago", "1 week ago", "3 months ago"
    const now = new Date();

    const daysMatch = dateStr.match(/(\d+)\s*day/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      now.setDate(now.getDate() - days);
      return now.toISOString();
    }

    const weeksMatch = dateStr.match(/(\d+)\s*week/i);
    if (weeksMatch) {
      const weeks = parseInt(weeksMatch[1]);
      now.setDate(now.getDate() - (weeks * 7));
      return now.toISOString();
    }

    const monthsMatch = dateStr.match(/(\d+)\s*month/i);
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1]);
      now.setMonth(now.getMonth() - months);
      return now.toISOString();
    }

    // Try parsing as ISO date
    return new Date(dateStr).toISOString();
  } catch (error) {
    return null;
  }
}

// ============================================================
// Content Filtering (Reused from radar-scrape-content)
// ============================================================

function detectPromo(title?: string, description?: string): boolean {
  const text = `${title || ""} ${description || ""}`.toLowerCase();

  const keywords = [
    "sponsored", "paid partnership", "#ad", "promo", "advertisement",
    "diskon", "discount", "kode promo", "link in bio", "swipe up",
    "affiliate", "partner", "#gifted", "sponsored by",
  ];

  return keywords.some(kw => text.includes(kw));
}

function detectGiveaway(title?: string, description?: string): boolean {
  const text = `${title || ""} ${description || ""}`.toLowerCase();

  const keywords = [
    "giveaway", "free", "gratis", "menang", "hadiah",
    "kontes", "lomba", "win", "prize", "contest",
    "raffle", "lucky draw", "undian",
  ];

  return keywords.some(kw => text.includes(kw));
}

function detectLifeUpdate(title?: string, description?: string): boolean {
  const text = `${title || ""} ${description || ""}`.toLowerCase();

  const keywords = [
    "birthday", "anniversary", "vacation", "liburan", "holiday",
    "family", "keluarga", "personal", "vlog", "behind the scenes",
    "bts", "wedding", "married", "menikah", "ulang tahun",
  ];

  return keywords.some(kw => text.includes(kw));
}

// ============================================================
// Google Trends Data Processing
// ============================================================

function extractTrendsData(data: any, category: string): any[] {
  try {
    const trends: any[] = [];

    // Extract rising queries
    if (data.rising_queries) {
      for (const item of data.rising_queries) {
        trends.push({
          trend_name: item.query,
          trend_hashtag: null,
          category,
          trend_type: "topic",
          first_detected_at: new Date().toISOString().split("T")[0],
          status: "rising",
          total_posts: 0,
          total_creators: 0,
          total_reach: 0,
          total_engagement: 0,
          growth_rate: item.value || item.extracted_value || 0,
          discovery_source: "serpapi",
          description: `Rising search query with ${item.value || item.extracted_value} growth`,
        });
      }
    }

    // Extract top queries
    if (data.top_queries) {
      for (const item of data.top_queries) {
        trends.push({
          trend_name: item.query,
          trend_hashtag: null,
          category,
          trend_type: "topic",
          first_detected_at: new Date().toISOString().split("T")[0],
          status: "peak",
          total_posts: 0,
          total_creators: 0,
          total_reach: 0,
          total_engagement: 0,
          growth_rate: item.value || item.extracted_value || 0,
          discovery_source: "serpapi",
          description: `Top search query with ${item.value || item.extracted_value} interest`,
        });
      }
    }

    return trends;
  } catch (error) {
    console.error("[extractTrendsData] Error:", error);
    return [];
  }
}

// ============================================================
// Main Handler
// ============================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Validate environment variables
    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "SerpAPI key not configured" }),
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

    const requestData: SerpAPIRequest = await req.json();
    const { operation } = requestData;

    console.log(`[radar-scrape-serpapi] Operation: ${operation}`);

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

    const serpClient = new SerpAPIClient(serpApiKey);
    let result: any = {};
    let totalCost = 0;

    // ============================================================
    // YouTube Channel Stats
    // ============================================================
    if (operation === "youtube_channel") {
      const { creator_id, youtube_handle } = requestData;

      if (!creator_id || !youtube_handle) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing required fields: creator_id, youtube_handle",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[radar-scrape-serpapi] Fetching YouTube channel: ${youtube_handle}`);

      const data = await serpClient.getYouTubeChannel(youtube_handle);
      const channelStats = extractChannelStats(data);

      if (channelStats) {
        // Update creator with YouTube stats
        await supabaseClient
          .from("gv_creators")
          .update({
            follower_count: channelStats.subscriber_count || 0,
            last_scraped_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", creator_id);

        result = {
          creator_id,
          youtube_handle,
          stats: channelStats,
        };
      } else {
        result = {
          creator_id,
          youtube_handle,
          error: "Channel stats not found",
        };
      }

      totalCost = 0.001; // $0.001 per query
    }

    // ============================================================
    // YouTube Recent Videos
    // ============================================================
    else if (operation === "youtube_videos") {
      const { creator_id, youtube_handle } = requestData;

      if (!creator_id || !youtube_handle) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing required fields: creator_id, youtube_handle",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[radar-scrape-serpapi] Fetching YouTube videos: ${youtube_handle}`);

      const data = await serpClient.getYouTubeVideos(youtube_handle, 20);
      const videos = extractVideos(data);
      const normalizedVideos = videos.map(v => normalizeYouTubeVideo(v, creator_id));

      // Filter out promo, giveaways, life updates
      const filteredVideos = normalizedVideos.filter(
        v => !v.is_promo && !v.is_giveaway && !v.is_life_update
      );

      // Keep top 30% by engagement
      const targetCount = Math.ceil(filteredVideos.length * 0.3);
      const finalVideos = filteredVideos
        .sort((a, b) => (b.engagement_total || 0) - (a.engagement_total || 0))
        .slice(0, Math.max(targetCount, 9));

      console.log(`[radar-scrape-serpapi] Filtered to ${finalVideos.length} videos`);

      // Insert to database
      let insertedCount = 0;
      const errors: string[] = [];

      for (const video of finalVideos) {
        const { error: insertError } = await supabaseClient
          .from("gv_creator_content")
          .upsert(video, {
            onConflict: "creator_id,platform,post_id",
            ignoreDuplicates: false,
          });

        if (insertError) {
          console.error(`[radar-scrape-serpapi] Insert error:`, insertError);
          errors.push(`Video ${video.post_id}: ${insertError.message}`);
        } else {
          insertedCount++;
        }
      }

      // Update creator's last_scraped_at
      await supabaseClient
        .from("gv_creators")
        .update({
          last_scraped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", creator_id);

      result = {
        creator_id,
        youtube_handle,
        scraped_count: videos.length,
        filtered_count: filteredVideos.length,
        saved_count: insertedCount,
        errors: errors.length > 0 ? errors : undefined,
      };

      totalCost = 0.001; // $0.001 per query
    }

    // ============================================================
    // Google Trends
    // ============================================================
    else if (operation === "google_trends") {
      const { category, country, timeframe } = requestData;

      if (!category) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing required field: category",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[radar-scrape-serpapi] Fetching Google Trends for category: ${category}`);

      // Map category to search query
      const categoryQueries: Record<string, string> = {
        beauty: "beauty products",
        fashion: "fashion trends",
        skincare: "skincare routine",
        makeup: "makeup tutorial",
        food: "food recipes",
        fitness: "fitness workout",
      };

      const query = categoryQueries[category.toLowerCase()] || category;

      const data = await serpClient.getRelatedQueries({
        q: query,
        geo: country || "ID",
        date: timeframe || "now 7-d",
      });

      const trends = extractTrendsData(data, category);

      console.log(`[radar-scrape-serpapi] Found ${trends.length} trends`);

      // Insert trends to database (upsert to avoid duplicates)
      let insertedCount = 0;
      const errors: string[] = [];

      for (const trend of trends) {
        const { error: insertError } = await supabaseClient
          .from("gv_trends")
          .upsert(trend, {
            onConflict: "trend_name,category",
            ignoreDuplicates: false,
          });

        if (insertError) {
          console.error(`[radar-scrape-serpapi] Insert error:`, insertError);
          errors.push(`Trend ${trend.trend_name}: ${insertError.message}`);
        } else {
          insertedCount++;
        }
      }

      result = {
        category,
        country: country || "ID",
        timeframe: timeframe || "now 7-d",
        trends_count: trends.length,
        saved_count: insertedCount,
        errors: errors.length > 0 ? errors : undefined,
      };

      totalCost = 0.001; // $0.001 per query
    }

    // ============================================================
    // Batch YouTube Processing
    // ============================================================
    else if (operation === "batch_youtube") {
      const { batch_creators } = requestData;

      if (!batch_creators || batch_creators.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing required field: batch_creators",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[radar-scrape-serpapi] Batch processing ${batch_creators.length} creators`);

      const results: any[] = [];

      for (const creator of batch_creators) {
        try {
          const data = await serpClient.getYouTubeChannel(creator.youtube_handle);
          const channelStats = extractChannelStats(data);

          if (channelStats) {
            await supabaseClient
              .from("gv_creators")
              .update({
                follower_count: channelStats.subscriber_count || 0,
                last_scraped_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", creator.creator_id);

            results.push({
              creator_id: creator.creator_id,
              youtube_handle: creator.youtube_handle,
              success: true,
              stats: channelStats,
            });
          } else {
            results.push({
              creator_id: creator.creator_id,
              youtube_handle: creator.youtube_handle,
              success: false,
              error: "Channel stats not found",
            });
          }

          totalCost += 0.001;
        } catch (error) {
          console.error(
            `[radar-scrape-serpapi] Error processing ${creator.youtube_handle}:`,
            error
          );
          results.push({
            creator_id: creator.creator_id,
            youtube_handle: creator.youtube_handle,
            success: false,
            error: error.message,
          });
        }
      }

      result = {
        batch_size: batch_creators.length,
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    }

    // ============================================================
    // Invalid Operation
    // ============================================================
    else {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid operation: ${operation}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[radar-scrape-serpapi] Operation complete. Cost: $${totalCost.toFixed(4)}`);

    return new Response(
      JSON.stringify({
        success: true,
        operation,
        cost_usd: totalCost,
        result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[radar-scrape-serpapi] Error:", error);

    // Handle rate limit errors
    if (error.message?.includes("rate limit") || error.message?.includes("429")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "SerpAPI rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle timeout errors
    if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "SerpAPI request timeout. Please try again.",
          code: "TIMEOUT",
        }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "SerpAPI request failed",
        code: "SERPAPI_FAILED",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
