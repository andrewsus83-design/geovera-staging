import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { ApifyClient } from "https://esm.sh/apify-client@2.9.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================
// Types
// ============================================================
interface ScrapeRequest {
  creator_id: string;
  platform: "instagram" | "tiktok" | "youtube";
}

interface InstagramPost {
  id: string;
  url: string;
  caption?: string;
  hashtags?: string[];
  timestamp?: string;
  likesCount?: number;
  commentsCount?: number;
  displayUrl?: string;
}

interface TikTokPost {
  id: string;
  webVideoUrl: string;
  text?: string;
  hashtags?: string[];
  createTime?: number;
  diggCount?: number;
  commentCount?: number;
  shareCount?: number;
  playCount?: number;
}

interface YouTubePost {
  id: string;
  url: string;
  title?: string;
  description?: string;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

// ============================================================
// Content Filtering Functions
// ============================================================
function detectPromo(caption: string): boolean {
  if (!caption) return false;
  const keywords = [
    'sponsored', 'paid partnership', '#ad', 'promo', 'advertisement',
    'diskon', 'discount', 'kode promo', 'link in bio', 'swipe up',
    'affiliate', 'partner', '#gifted'
  ];
  const lowerCaption = caption.toLowerCase();
  return keywords.some(kw => lowerCaption.includes(kw));
}

function detectGiveaway(caption: string): boolean {
  if (!caption) return false;
  const keywords = [
    'giveaway', 'free', 'gratis', 'menang', 'hadiah',
    'kontes', 'lomba', 'win', 'prize', 'contest',
    'raffle', 'lucky draw', 'undian'
  ];
  const lowerCaption = caption.toLowerCase();
  return keywords.some(kw => lowerCaption.includes(kw));
}

function detectLifeUpdate(caption: string): boolean {
  if (!caption) return false;
  const keywords = [
    'birthday', 'anniversary', 'vacation', 'liburan', 'holiday',
    'family', 'keluarga', 'personal', 'vlog', 'behind the scenes',
    'bts', 'wedding', 'married', 'menikah', 'ulang tahun'
  ];
  const lowerCaption = caption.toLowerCase();
  return keywords.some(kw => lowerCaption.includes(kw));
}

function shouldKeepPost(caption: string): boolean {
  const isPromo = detectPromo(caption);
  const isGiveaway = detectGiveaway(caption);
  const isLifeUpdate = detectLifeUpdate(caption);

  return !isPromo && !isGiveaway && !isLifeUpdate;
}

// ============================================================
// Apify Actor Configurations
// ============================================================
const APIFY_ACTORS = {
  instagram: "apify/instagram-scraper",
  tiktok: "apify/tiktok-scraper",
  youtube: "apify/youtube-scraper"
};

// ============================================================
// Scrape Instagram
// ============================================================
async function scrapeInstagram(
  apifyClient: ApifyClient,
  handle: string
): Promise<any[]> {
  const input = {
    usernames: [handle.replace('@', '')],
    resultsLimit: 30,
    resultsType: "posts",
    searchType: "user",
    addParentData: false
  };

  const run = await apifyClient.actor(APIFY_ACTORS.instagram).call(input, {
    timeout: 300, // 5 minutes
    memory: 2048
  });

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  return items;
}

// ============================================================
// Scrape TikTok
// ============================================================
async function scrapeTikTok(
  apifyClient: ApifyClient,
  handle: string
): Promise<any[]> {
  const input = {
    profiles: [handle.replace('@', '')],
    resultsPerPage: 30,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false
  };

  const run = await apifyClient.actor(APIFY_ACTORS.tiktok).call(input, {
    timeout: 300,
    memory: 2048
  });

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  return items;
}

// ============================================================
// Scrape YouTube
// ============================================================
async function scrapeYouTube(
  apifyClient: ApifyClient,
  handle: string
): Promise<any[]> {
  const input = {
    searchKeywords: `@${handle.replace('@', '')}`,
    maxResults: 30,
    searchType: "channel"
  };

  const run = await apifyClient.actor(APIFY_ACTORS.youtube).call(input, {
    timeout: 300,
    memory: 2048
  });

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  return items;
}

// ============================================================
// Normalize Instagram Post
// ============================================================
function normalizeInstagramPost(post: InstagramPost, creator_id: string) {
  const caption = post.caption || '';

  return {
    creator_id,
    platform: 'instagram',
    post_id: post.id,
    post_url: post.url,
    caption,
    hashtags: post.hashtags || [],
    posted_at: post.timestamp ? new Date(post.timestamp).toISOString() : null,
    reach: null,
    likes: post.likesCount || 0,
    comments: post.commentsCount || 0,
    shares: 0,
    saves: 0,
    views: null,
    engagement_total: (post.likesCount || 0) + (post.commentsCount || 0),
    is_promo: detectPromo(caption),
    is_giveaway: detectGiveaway(caption),
    is_life_update: detectLifeUpdate(caption),
    content_quality_score: null,
    originality_score: null,
    brand_mentions: [],
    analysis_status: 'pending'
  };
}

// ============================================================
// Normalize TikTok Post
// ============================================================
function normalizeTikTokPost(post: TikTokPost, creator_id: string) {
  const caption = post.text || '';

  return {
    creator_id,
    platform: 'tiktok',
    post_id: post.id,
    post_url: post.webVideoUrl,
    caption,
    hashtags: post.hashtags || [],
    posted_at: post.createTime ? new Date(post.createTime * 1000).toISOString() : null,
    reach: null,
    likes: post.diggCount || 0,
    comments: post.commentCount || 0,
    shares: post.shareCount || 0,
    saves: 0,
    views: post.playCount || 0,
    engagement_total: (post.diggCount || 0) + (post.commentCount || 0) + (post.shareCount || 0),
    is_promo: detectPromo(caption),
    is_giveaway: detectGiveaway(caption),
    is_life_update: detectLifeUpdate(caption),
    content_quality_score: null,
    originality_score: null,
    brand_mentions: [],
    analysis_status: 'pending'
  };
}

// ============================================================
// Normalize YouTube Post
// ============================================================
function normalizeYouTubePost(post: YouTubePost, creator_id: string) {
  const caption = `${post.title || ''} ${post.description || ''}`;

  return {
    creator_id,
    platform: 'youtube',
    post_id: post.id,
    post_url: post.url,
    caption,
    hashtags: [],
    posted_at: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
    reach: null,
    likes: post.likeCount || 0,
    comments: post.commentCount || 0,
    shares: 0,
    saves: 0,
    views: post.viewCount || 0,
    engagement_total: (post.likeCount || 0) + (post.commentCount || 0),
    is_promo: detectPromo(caption),
    is_giveaway: detectGiveaway(caption),
    is_life_update: detectLifeUpdate(caption),
    content_quality_score: null,
    originality_score: null,
    brand_mentions: [],
    analysis_status: 'pending'
  };
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
    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    if (!apifyToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Apify API token not configured" }),
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

    const requestData: ScrapeRequest = await req.json();
    const { creator_id, platform } = requestData;

    if (!creator_id || !platform) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: creator_id, platform"
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

    // Get creator info
    const { data: creator, error: creatorError } = await supabaseClient
      .from("gv_creators")
      .select("id, name, instagram_handle, tiktok_handle, youtube_handle")
      .eq("id", creator_id)
      .single();

    if (creatorError || !creator) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Creator not found",
          code: "CREATOR_NOT_FOUND"
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get platform handle
    let handle: string | null = null;
    if (platform === "instagram") handle = creator.instagram_handle;
    else if (platform === "tiktok") handle = creator.tiktok_handle;
    else if (platform === "youtube") handle = creator.youtube_handle;

    if (!handle) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `No ${platform} handle found for this creator`,
          code: "HANDLE_NOT_FOUND"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[radar-scrape-content] Scraping ${platform} for @${handle}`);

    // Initialize Apify client
    const apifyClient = new ApifyClient({ token: apifyToken });

    // Scrape content based on platform
    let rawPosts: any[] = [];

    if (platform === "instagram") {
      rawPosts = await scrapeInstagram(apifyClient, handle);
    } else if (platform === "tiktok") {
      rawPosts = await scrapeTikTok(apifyClient, handle);
    } else if (platform === "youtube") {
      rawPosts = await scrapeYouTube(apifyClient, handle);
    }

    console.log(`[radar-scrape-content] Scraped ${rawPosts.length} posts`);

    // Normalize posts
    let normalizedPosts: any[] = [];

    if (platform === "instagram") {
      normalizedPosts = rawPosts.map(p => normalizeInstagramPost(p, creator_id));
    } else if (platform === "tiktok") {
      normalizedPosts = rawPosts.map(p => normalizeTikTokPost(p, creator_id));
    } else if (platform === "youtube") {
      normalizedPosts = rawPosts.map(p => normalizeYouTubePost(p, creator_id));
    }

    // Filter posts (remove promo, giveaway, life updates)
    const filteredPosts = normalizedPosts.filter(post =>
      shouldKeepPost(post.caption || '')
    );

    console.log(`[radar-scrape-content] Filtered to ${filteredPosts.length} posts (removed ${normalizedPosts.length - filteredPosts.length})`);

    // Further filter to ~30% (target ~9 posts from 30)
    const targetCount = Math.ceil(filteredPosts.length * 0.3);
    const finalPosts = filteredPosts
      .sort((a, b) => (b.engagement_total || 0) - (a.engagement_total || 0)) // Sort by engagement
      .slice(0, Math.max(targetCount, 9)); // Keep at least 9 posts

    console.log(`[radar-scrape-content] Selected top ${finalPosts.length} posts by engagement`);

    // Insert to database (upsert to avoid duplicates)
    let insertedCount = 0;
    const errors: string[] = [];

    for (const post of finalPosts) {
      const { error: insertError } = await supabaseClient
        .from("gv_creator_content")
        .upsert(post, {
          onConflict: 'creator_id,platform,post_id',
          ignoreDuplicates: false
        });

      if (insertError) {
        console.error(`[radar-scrape-content] Insert error for post ${post.post_id}:`, insertError);
        errors.push(`Post ${post.post_id}: ${insertError.message}`);
      } else {
        insertedCount++;
      }
    }

    // Update creator's last_scraped_at
    await supabaseClient
      .from("gv_creators")
      .update({
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", creator_id);

    console.log(`[radar-scrape-content] Successfully saved ${insertedCount} posts`);

    return new Response(
      JSON.stringify({
        success: true,
        creator_id,
        creator_name: creator.name,
        platform,
        handle,
        scraped_count: rawPosts.length,
        filtered_count: filteredPosts.length,
        saved_count: insertedCount,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          removed_promo: normalizedPosts.filter(p => p.is_promo).length,
          removed_giveaway: normalizedPosts.filter(p => p.is_giveaway).length,
          removed_life_update: normalizedPosts.filter(p => p.is_life_update).length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[radar-scrape-content] Error:", error);

    // Handle rate limit errors
    if (error.message?.includes("rate limit") || error.message?.includes("429")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Apify rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED"
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle timeout errors
    if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Scraping timeout. The platform may be slow or unreachable.",
          code: "TIMEOUT"
        }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Scraping failed",
        code: "SCRAPING_FAILED"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
