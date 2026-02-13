import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface MarketshareRequest {
  category: string;
  date_range?: {
    start: string;
    end: string;
  };
}

interface BrandMentionData {
  brand: string;
  mention_type: "organic" | "paid";
  post_reach: number;
  post_engagement: number;
  creator_id: string;
  content_id: string;
}

interface BrandMarketshare {
  brand: string;
  category: string;
  marketshare_percentage: number;
  total_reach: number;
  total_engagement: number;
  organic_mentions: number;
  paid_mentions: number;
  total_mentions: number;
  rank_position: number;
  rank_change: number;
}

interface MarketshareResult {
  success: boolean;
  category: string;
  date_range: {
    start: string;
    end: string;
  };
  total_brands: number;
  top_brands: BrandMarketshare[];
}

/**
 * Fetch brand mentions from creator content
 */
async function fetchBrandMentions(
  supabase: any,
  category: string,
  dateRange?: { start: string; end: string }
): Promise<BrandMentionData[]> {
  let query = supabase
    .from("gv_creator_content")
    .select(`
      id,
      reach,
      engagement,
      brand_mentions,
      creator_id,
      posted_at,
      gv_creators!inner(category)
    `)
    .eq("gv_creators.category", category)
    .eq("analysis_status", "completed")
    .not("brand_mentions", "is", null);

  // Apply date range filter if provided
  if (dateRange) {
    query = query
      .gte("posted_at", dateRange.start)
      .lte("posted_at", dateRange.end);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch brand mentions: ${error.message}`);
  }

  // Extract brand mentions from content
  const brandMentions: BrandMentionData[] = [];

  for (const content of data) {
    if (content.brand_mentions && Array.isArray(content.brand_mentions)) {
      for (const mention of content.brand_mentions) {
        if (mention.brand && mention.type) {
          brandMentions.push({
            brand: mention.brand,
            mention_type: mention.type,
            post_reach: content.reach || 0,
            post_engagement: content.engagement || 0,
            creator_id: content.creator_id,
            content_id: content.id,
          });
        }
      }
    }
  }

  return brandMentions;
}

/**
 * Get previous marketshare rankings for comparison
 */
async function getPreviousMarketshare(
  supabase: any,
  category: string
): Promise<Map<string, { rank: number; percentage: number }>> {
  const { data, error } = await supabase
    .from("gv_brand_marketshare")
    .select("brand, rank_position, marketshare_percentage")
    .eq("category", category)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    return new Map();
  }

  const previousRankings = new Map();
  for (const entry of data) {
    if (!previousRankings.has(entry.brand)) {
      previousRankings.set(entry.brand, {
        rank: entry.rank_position,
        percentage: entry.marketshare_percentage,
      });
    }
  }

  return previousRankings;
}

/**
 * Calculate brand marketshare
 */
async function calculateMarketshare(
  supabase: any,
  category: string,
  dateRange?: { start: string; end: string }
): Promise<MarketshareResult> {
  console.log(`Calculating marketshare for category: ${category}`);

  // Default date range: last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const effectiveDateRange = dateRange || {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };

  // Fetch brand mentions
  const brandMentions = await fetchBrandMentions(
    supabase,
    category,
    effectiveDateRange
  );

  if (brandMentions.length === 0) {
    return {
      success: true,
      category,
      date_range: effectiveDateRange,
      total_brands: 0,
      top_brands: [],
    };
  }

  // Aggregate by brand
  const brandMap = new Map<
    string,
    {
      total_reach: number;
      total_engagement: number;
      organic_mentions: number;
      paid_mentions: number;
    }
  >();

  for (const mention of brandMentions) {
    if (!brandMap.has(mention.brand)) {
      brandMap.set(mention.brand, {
        total_reach: 0,
        total_engagement: 0,
        organic_mentions: 0,
        paid_mentions: 0,
      });
    }

    const brandData = brandMap.get(mention.brand)!;
    brandData.total_reach += mention.post_reach;
    brandData.total_engagement += mention.post_engagement;

    if (mention.mention_type === "organic") {
      brandData.organic_mentions++;
    } else if (mention.mention_type === "paid") {
      brandData.paid_mentions++;
    }
  }

  // Calculate total category reach
  const totalCategoryReach = Array.from(brandMap.values()).reduce(
    (sum, brand) => sum + brand.total_reach,
    0
  );

  // Calculate marketshare percentages
  const brandMarketshares = Array.from(brandMap.entries()).map(
    ([brand, data]) => {
      const marketsharePercentage =
        totalCategoryReach > 0
          ? (data.total_reach / totalCategoryReach) * 100
          : 0;

      return {
        brand,
        category,
        marketshare_percentage: marketsharePercentage,
        total_reach: data.total_reach,
        total_engagement: data.total_engagement,
        organic_mentions: data.organic_mentions,
        paid_mentions: data.paid_mentions,
        total_mentions: data.organic_mentions + data.paid_mentions,
        rank_position: 0, // Will be set after sorting
        rank_change: 0, // Will be calculated
      };
    }
  );

  // Sort by marketshare percentage (descending)
  brandMarketshares.sort(
    (a, b) => b.marketshare_percentage - a.marketshare_percentage
  );

  // Get previous rankings for comparison
  const previousRankings = await getPreviousMarketshare(supabase, category);

  // Assign ranks and calculate rank changes
  const rankedBrands: BrandMarketshare[] = [];
  for (let i = 0; i < brandMarketshares.length; i++) {
    const brand = brandMarketshares[i];
    brand.rank_position = i + 1;

    const previousRank = previousRankings.get(brand.brand);
    if (previousRank) {
      brand.rank_change = previousRank.rank - brand.rank_position;
    }

    rankedBrands.push(brand);
  }

  // Insert/update marketshare records
  const timestamp = new Date().toISOString();

  // Only save top 100 brands
  const top100Brands = rankedBrands.slice(0, 100);

  if (top100Brands.length > 0) {
    const { error: insertError } = await supabase
      .from("gv_brand_marketshare")
      .insert(
        top100Brands.map((brand) => ({
          ...brand,
          date_start: effectiveDateRange.start,
          date_end: effectiveDateRange.end,
          updated_at: timestamp,
        }))
      );

    if (insertError) {
      throw new Error(`Failed to insert marketshare data: ${insertError.message}`);
    }

    console.log(`Inserted ${top100Brands.length} brand marketshare records`);
  }

  // Return top 20 brands
  return {
    success: true,
    category,
    date_range: effectiveDateRange,
    total_brands: brandMarketshares.length,
    top_brands: rankedBrands.slice(0, 20),
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
    const body: MarketshareRequest = await req.json();

    if (!body.category) {
      return new Response(
        JSON.stringify({ error: "Missing required field: category" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate marketshare
    const result = await calculateMarketshare(
      supabase,
      body.category,
      body.date_range
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
    console.error("Error calculating marketshare:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to calculate marketshare",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
