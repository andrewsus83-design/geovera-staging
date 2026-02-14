import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

interface GetDiscoveriesRequest {
  brand_id: string;
  week_start?: string; // Optional: filter by specific week
  limit?: number;
  include_dismissed?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
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

    // Parse request data
    let requestData: GetDiscoveriesRequest;

    if (req.method === "POST") {
      requestData = await req.json();
    } else {
      // GET request - parse query params
      const url = new URL(req.url);
      requestData = {
        brand_id: url.searchParams.get("brand_id") || "",
        week_start: url.searchParams.get("week_start") || undefined,
        limit: parseInt(url.searchParams.get("limit") || "50"),
        include_dismissed: url.searchParams.get("include_dismissed") === "true",
      };
    }

    const { brand_id, week_start, limit = 50, include_dismissed = false } = requestData;

    if (!brand_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required field: brand_id"
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

    // Build query for viral discoveries
    let discoveriesQuery = supabaseClient
      .from("gv_viral_discoveries")
      .select(`
        *,
        story:gv_viral_stories(*)
      `)
      .eq("brand_id", brand_id);

    if (!include_dismissed) {
      discoveriesQuery = discoveriesQuery.eq("dismissed", false);
    }

    if (week_start) {
      discoveriesQuery = discoveriesQuery.eq("week_start", week_start);
    }

    discoveriesQuery = discoveriesQuery
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: discoveries, error: discoveriesError } = await discoveriesQuery;

    if (discoveriesError) {
      console.error("Discoveries fetch error:", discoveriesError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch viral discoveries" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current week's quota info
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
    const weekStartStr = currentWeekStart.toISOString().split('T')[0];

    const { data: quotaInfo, error: quotaError } = await supabaseClient
      .from("gv_viral_quotas")
      .select("*")
      .eq("brand_id", brand_id)
      .eq("week_start", weekStartStr)
      .single();

    // If no quota record, get limits from function
    let remaining = 0;
    if (!quotaInfo) {
      const { data: limitData } = await supabaseClient
        .rpc("get_viral_discovery_limits", { p_brand_id: brand_id });
      remaining = limitData?.[0]?.weekly_discoveries || 5;
    } else {
      remaining = Math.max(quotaInfo.discoveries_limit - quotaInfo.discoveries_used, 0);
    }

    // Get brand tier info
    const { data: brand } = await supabaseClient
      .from("brands")
      .select("subscription_tier")
      .eq("id", brand_id)
      .single();

    // Get weekly breakdown (group by week)
    const { data: weeklyStats, error: weeklyStatsError } = await supabaseClient
      .from("gv_viral_discoveries")
      .select("week_start, discovery_date")
      .eq("brand_id", brand_id)
      .order("week_start", { ascending: false });

    // Group by week
    const weeklyBreakdown = weeklyStats?.reduce((acc: any, item: any) => {
      const week = item.week_start;
      if (!acc[week]) {
        acc[week] = { week_start: week, count: 0 };
      }
      acc[week].count += 1;
      return acc;
    }, {});

    const weeklyBreakdownArray = weeklyBreakdown
      ? Object.values(weeklyBreakdown).slice(0, 4) // Last 4 weeks
      : [];

    return new Response(
      JSON.stringify({
        success: true,
        discoveries: discoveries || [],
        total_count: discoveries?.length || 0,
        quota: {
          current_week: {
            used: quotaInfo?.discoveries_used || 0,
            limit: quotaInfo?.discoveries_limit || 5,
            remaining,
            week_start: weekStartStr,
            week_end: quotaInfo?.week_end || new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
          tier: brand?.subscription_tier || "basic",
          total_cost_usd: quotaInfo?.total_cost_usd || 0,
        },
        weekly_breakdown: weeklyBreakdownArray,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in buzzsumo-get-discoveries:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
