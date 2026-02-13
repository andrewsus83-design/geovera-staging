import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RankingsRequest {
  category: string;
  force_update?: boolean;
}

interface CreatorRankingData {
  creator_id: string;
  total_reach: number;
  avg_quality_score: number;
  avg_originality_score: number;
  content_count: number;
}

interface RankingSnapshot {
  creator_id: string;
  category: string;
  rank_position: number;
  weighted_score: number;
  mindshare_percentage: number;
  total_reach: number;
  avg_quality_score: number;
  avg_originality_score: number;
  content_count: number;
  rank_change: number;
  rank_trend: "rising" | "stable" | "falling";
}

interface RankingResult {
  success: boolean;
  category: string;
  total_creators: number;
  snapshots_created: number;
  rank_changes: Array<{
    creator_id: string;
    rank: number;
    previous_rank: number | null;
    change: number;
    trend: string;
  }>;
}

/**
 * Determine if a ranking should be updated based on rank position and last update
 *
 * STAGING (based on follower tiers):
 * - Rank 1 (Mega: 2M-5M followers): Every 24H
 * - Rank 2-3 (Mid: 500K-2M followers): Every 48H
 * - Rank 4-6 (Micro: 10K-500K followers): Every 72H
 *
 * PRODUCTION:
 * - Rank 1-100: Daily snapshots
 * - Rank 101-500: Monthly snapshots
 */
function shouldUpdateRanking(
  rankPosition: number,
  lastUpdatedAt: string | null,
  forceUpdate: boolean
): boolean {
  if (forceUpdate) return true;
  if (!lastUpdatedAt) return true;

  const lastUpdate = new Date(lastUpdatedAt);
  const now = new Date();
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  // Rank 1 (Mega: 2M-5M followers): Every 24 hours
  if (rankPosition === 1) return hoursSinceUpdate >= 24;

  // Rank 2-3 (Mid: 500K-2M followers): Every 48 hours
  if (rankPosition >= 2 && rankPosition <= 3) return hoursSinceUpdate >= 48;

  // Rank 4-6 (Micro: 10K-500K followers): Every 72 hours
  if (rankPosition >= 4 && rankPosition <= 6) return hoursSinceUpdate >= 72;

  // Rank 7-100: Daily updates
  if (rankPosition >= 7 && rankPosition <= 100) return hoursSinceUpdate >= 24;

  // Rank 101-500: Monthly updates only (production)
  if (rankPosition >= 101 && rankPosition <= 500) {
    const daysSinceUpdate = hoursSinceUpdate / 24;
    return daysSinceUpdate >= 30;
  }

  // Beyond 500: No automatic updates
  return false;
}

/**
 * Calculate rank trend based on previous rankings
 */
function calculateRankTrend(
  currentRank: number,
  previousRank: number | null
): "rising" | "stable" | "falling" {
  if (!previousRank) return "stable";

  const change = previousRank - currentRank; // Positive = moved up in rank

  if (change >= 5) return "rising";
  if (change <= -5) return "falling";
  return "stable";
}

/**
 * Fetch aggregated creator data for ranking calculation
 */
async function fetchCreatorRankingData(
  supabase: any,
  category: string
): Promise<CreatorRankingData[]> {
  const { data, error } = await supabase
    .from("gv_creators")
    .select(`
      id,
      total_reach,
      gv_creator_content!inner(
        content_quality_score,
        originality_score,
        reach
      )
    `)
    .eq("category", category)
    .eq("discovery_status", "completed")
    .not("gv_creator_content.content_quality_score", "is", null)
    .not("gv_creator_content.originality_score", "is", null);

  if (error) {
    throw new Error(`Failed to fetch creator data: ${error.message}`);
  }

  // Aggregate content scores per creator
  const creatorMap = new Map<string, CreatorRankingData>();

  for (const creator of data) {
    if (!creatorMap.has(creator.id)) {
      creatorMap.set(creator.id, {
        creator_id: creator.id,
        total_reach: creator.total_reach || 0,
        avg_quality_score: 0,
        avg_originality_score: 0,
        content_count: 0,
      });
    }

    const creatorData = creatorMap.get(creator.id)!;

    // Aggregate content scores
    if (creator.gv_creator_content) {
      const contentArray = Array.isArray(creator.gv_creator_content)
        ? creator.gv_creator_content
        : [creator.gv_creator_content];

      for (const content of contentArray) {
        if (content.content_quality_score && content.originality_score) {
          creatorData.avg_quality_score += content.content_quality_score;
          creatorData.avg_originality_score += content.originality_score;
          creatorData.content_count++;
        }
      }
    }
  }

  // Calculate averages
  const rankings: CreatorRankingData[] = [];
  for (const creatorData of creatorMap.values()) {
    if (creatorData.content_count > 0) {
      creatorData.avg_quality_score /= creatorData.content_count;
      creatorData.avg_originality_score /= creatorData.content_count;
      rankings.push(creatorData);
    }
  }

  return rankings;
}

/**
 * Get previous ranking for a creator
 */
async function getPreviousRanking(
  supabase: any,
  creatorId: string,
  category: string
): Promise<{ rank_position: number; updated_at: string } | null> {
  const { data, error } = await supabase
    .from("gv_creator_rankings")
    .select("rank_position, updated_at")
    .eq("creator_id", creatorId)
    .eq("category", category)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Main ranking calculation function
 */
async function calculateRankings(
  supabase: any,
  category: string,
  forceUpdate: boolean = false
): Promise<RankingResult> {
  console.log(`Starting ranking calculation for category: ${category}`);

  // Fetch creator data
  const creatorData = await fetchCreatorRankingData(supabase, category);

  if (creatorData.length === 0) {
    return {
      success: true,
      category,
      total_creators: 0,
      snapshots_created: 0,
      rank_changes: [],
    };
  }

  // Calculate weighted scores
  const scoredCreators = creatorData.map((creator) => {
    const weighted_score =
      creator.total_reach *
      creator.avg_quality_score *
      creator.avg_originality_score;

    return {
      ...creator,
      weighted_score,
    };
  });

  // Sort by weighted score (descending)
  scoredCreators.sort((a, b) => b.weighted_score - a.weighted_score);

  // Calculate total weighted score for mindshare percentage
  const totalWeightedScore = scoredCreators.reduce(
    (sum, c) => sum + c.weighted_score,
    0
  );

  // Prepare ranking snapshots
  const rankingSnapshots: RankingSnapshot[] = [];
  const rankChanges: Array<{
    creator_id: string;
    rank: number;
    previous_rank: number | null;
    change: number;
    trend: string;
  }> = [];

  for (let i = 0; i < scoredCreators.length; i++) {
    const creator = scoredCreators[i];
    const rankPosition = i + 1;

    // Get previous ranking
    const previousRanking = await getPreviousRanking(
      supabase,
      creator.creator_id,
      category
    );

    // Check if update is needed
    if (
      !shouldUpdateRanking(
        rankPosition,
        previousRanking?.updated_at || null,
        forceUpdate
      )
    ) {
      console.log(
        `Skipping creator ${creator.creator_id} at rank ${rankPosition} (last updated: ${previousRanking?.updated_at})`
      );
      continue;
    }

    // Calculate mindshare percentage
    const mindsharePercentage = (creator.weighted_score / totalWeightedScore) * 100;

    // Calculate rank change
    const previousRankPosition = previousRanking?.rank_position || null;
    const rankChange = previousRankPosition
      ? previousRankPosition - rankPosition
      : 0;

    // Calculate rank trend
    const rankTrend = calculateRankTrend(rankPosition, previousRankPosition);

    // Only save snapshots for top 500
    if (rankPosition <= 500) {
      rankingSnapshots.push({
        creator_id: creator.creator_id,
        category,
        rank_position: rankPosition,
        weighted_score: creator.weighted_score,
        mindshare_percentage: mindsharePercentage,
        total_reach: creator.total_reach,
        avg_quality_score: creator.avg_quality_score,
        avg_originality_score: creator.avg_originality_score,
        content_count: creator.content_count,
        rank_change: rankChange,
        rank_trend: rankTrend,
      });
    }

    // Track rank changes for top 100
    if (rankPosition <= 100) {
      rankChanges.push({
        creator_id: creator.creator_id,
        rank: rankPosition,
        previous_rank: previousRankPosition,
        change: rankChange,
        trend: rankTrend,
      });
    }
  }

  // Insert ranking snapshots
  if (rankingSnapshots.length > 0) {
    const { error: insertError } = await supabase
      .from("gv_creator_rankings")
      .insert(
        rankingSnapshots.map((snapshot) => ({
          ...snapshot,
          updated_at: new Date().toISOString(),
        }))
      );

    if (insertError) {
      throw new Error(`Failed to insert rankings: ${insertError.message}`);
    }

    console.log(`Inserted ${rankingSnapshots.length} ranking snapshots`);
  }

  return {
    success: true,
    category,
    total_creators: creatorData.length,
    snapshots_created: rankingSnapshots.length,
    rank_changes: rankChanges,
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
    const body: RankingsRequest = await req.json();

    if (!body.category) {
      return new Response(
        JSON.stringify({ error: "Missing required field: category" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate rankings
    const result = await calculateRankings(
      supabase,
      body.category,
      body.force_update || false
    );

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
    console.error("Error calculating rankings:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to calculate rankings",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
