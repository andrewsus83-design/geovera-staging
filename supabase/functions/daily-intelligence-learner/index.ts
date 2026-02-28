import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================================
// SELF-LEARNING INTELLIGENCE SYSTEM
// Purpose: Learn daily from SEO/GEO/Social data to improve strategies
// ============================================================================

interface LearningRequest {
  brand_id: string;
  learning_mode: "seo" | "geo" | "social" | "all";
  days_to_analyze?: number; // Default: 7 days
}

interface BrandContext {
  id: string;
  brand_name: string;
  brand_category: string;
  brand_country: string;
  subscription_tier: string;
}

interface LearningInsight {
  type: "keyword_discovery" | "ranking_pattern" | "backlink_opportunity" | "content_strategy" | "sentiment_shift";
  channel: "seo" | "geo" | "social";
  insight: string;
  data: any;
  confidence_score: number; // 0.0 to 1.0
  actionable: boolean;
  priority: number; // 1-5
}

// ============================================================================
// CLAUDE LEARNING ENGINE
// ============================================================================

class ClaudeLearningEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeSEOPatterns(brandContext: BrandContext, historicalData: any[]): Promise<LearningInsight[]> {
    const prompt = `You are an SEO learning AI. Analyze historical search data to discover patterns and opportunities.

**BRAND**: ${brandContext.brand_name} (${brandContext.brand_category})

**YOUR TASK**: Analyze the SEO data below and learn patterns to improve future strategy.

**HISTORICAL SEO DATA** (Last 7 days):
${JSON.stringify(historicalData, null, 2)}

**LEARNING OBJECTIVES**:
1. **Best Keywords Discovery**
   - Which keywords are trending UP in rankings?
   - Which have high search volume but low competition?
   - Which keywords convert best (based on click patterns)?

2. **Ranking Patterns**
   - What content types rank best for this brand?
   - What time of day/week shows best rankings?
   - Which SERP features does the brand appear in?

3. **Backlink Opportunities**
   - Which domains link to competitors but not us?
   - What content types attract most backlinks?
   - Natural backlink sources in our niche?

4. **Content Strategy**
   - What topics generate most engagement?
   - Optimal content length for rankings?
   - Natural keyword usage patterns?

**OUTPUT FORMAT** (JSON array):
[
  {
    "type": "keyword_discovery",
    "channel": "seo",
    "insight": "Keyword 'organic skincare routine' trending up 35% this week, low competition (0.23), high intent",
    "data": {
      "keyword": "organic skincare routine",
      "trend": "+35%",
      "competition": 0.23,
      "search_volume": 2400,
      "current_rank": 15,
      "opportunity_rank": 5
    },
    "confidence_score": 0.87,
    "actionable": true,
    "priority": 5
  }
]

Return ONLY JSON array. Focus on actionable, data-driven insights.`;

    return await this.queryClaudeForLearning(prompt);
  }

  async analyzeGEOPatterns(brandContext: BrandContext, historicalData: any[]): Promise<LearningInsight[]> {
    const prompt = `You are a GEO (Generative Engine Optimization) learning AI. Analyze AI platform data to discover patterns.

**BRAND**: ${brandContext.brand_name} (${brandContext.brand_category})

**YOUR TASK**: Analyze historical GEO data from ChatGPT, Gemini, Claude, Perplexity to learn what works.

**HISTORICAL GEO DATA** (Last 7 days):
${JSON.stringify(historicalData, null, 2)}

**LEARNING OBJECTIVES**:
1. **AI Platform Preferences**
   - Which platforms mention our brand most?
   - What content types get cited by AI?
   - Which competitor strategies to learn from?

2. **Citation Patterns**
   - What sources do AI platforms trust?
   - How to increase authoritative citations?
   - Natural language patterns in top results?

3. **Entity Recognition**
   - How consistently is brand recognized as entity?
   - What keywords associate our brand correctly?
   - Schema markup effectiveness?

4. **Sentiment Trends**
   - Is AI sentiment improving over time?
   - What topics generate positive sentiment?
   - Competitor sentiment comparison?

**OUTPUT FORMAT** (JSON array):
[
  {
    "type": "ranking_pattern",
    "channel": "geo",
    "insight": "ChatGPT cites brands with 3+ authoritative news mentions. We only have 1. Opportunity: Get featured in TechCrunch, Forbes Indonesia",
    "data": {
      "platform": "chatgpt",
      "current_citations": 1,
      "competitor_avg": 4.5,
      "recommended_sources": ["TechCrunch", "Forbes Indonesia", "BeautyInsider"],
      "estimated_impact": "+40% mention rate"
    },
    "confidence_score": 0.91,
    "actionable": true,
    "priority": 5
  }
]

Return ONLY JSON array. Focus on specific, actionable patterns.`;

    return await this.queryClaudeForLearning(prompt);
  }

  async analyzeSocialPatterns(brandContext: BrandContext, historicalData: any[]): Promise<LearningInsight[]> {
    const prompt = `You are a Social Search learning AI. Analyze TikTok, Instagram, YouTube patterns.

**BRAND**: ${brandContext.brand_name} (${brandContext.brand_category})

**YOUR TASK**: Analyze social media search performance to discover what content ranks.

**HISTORICAL SOCIAL DATA** (Last 7 days):
${JSON.stringify(historicalData, null, 2)}

**LEARNING OBJECTIVES**:
1. **Hashtag Performance**
   - Which hashtags drive most discovery?
   - Natural hashtag combinations?
   - Trending vs evergreen balance?

2. **Content Patterns**
   - Video length that ranks best?
   - Hook effectiveness in first 3 seconds?
   - Engagement patterns (likes, comments, shares)?

3. **Algorithm Signals**
   - What content gets pushed by algorithm?
   - Watch time vs engagement priority?
   - Posting time optimization?

4. **Competitor Learning**
   - What content formats work for competitors?
   - Viral content patterns in our niche?
   - Collaboration opportunities?

**OUTPUT FORMAT** (JSON array):
[
  {
    "type": "content_strategy",
    "channel": "social",
    "insight": "30-45 second videos with product demo in first 5 seconds rank 3x better than longer videos. Current avg: 90 seconds.",
    "data": {
      "optimal_length": "30-45 seconds",
      "current_avg": 90,
      "rank_improvement": "3x",
      "hook_requirement": "Product demo in first 5 seconds",
      "example_videos": ["video_id_1", "video_id_2"]
    },
    "confidence_score": 0.85,
    "actionable": true,
    "priority": 4
  }
]

Return ONLY JSON array. Focus on practical, implementable strategies.`;

    return await this.queryClaudeForLearning(prompt);
  }

  private async queryClaudeForLearning(prompt: string): Promise<LearningInsight[]> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 8000,
          temperature: 0.3, // Lower temp for more precise learning
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || "[]";

      // Parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("[ClaudeLearningEngine] No JSON in response:", content);
        return [];
      }

      const insights: LearningInsight[] = JSON.parse(jsonMatch[0]);
      return insights;
    } catch (error) {
      console.error("[ClaudeLearningEngine] Error:", error);
      return [];
    }
  }
}

// ============================================================================
// DATA COLLECTOR
// ============================================================================

class LearningDataCollector {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async collectSEOData(brandId: string, daysBack: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get search results history
    const { data: searchResults } = await this.supabase
      .from("gv_search_results")
      .select(`
        *,
        keyword:gv_keywords(keyword, keyword_type, priority)
      `)
      .eq("brand_id", brandId)
      .eq("platform", "google")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    // Get keyword performance history
    const { data: keywordHistory } = await this.supabase
      .from("gv_keyword_history")
      .select("*")
      .eq("brand_id", brandId)
      .gte("tracked_date", startDate.toISOString().split("T")[0])
      .order("tracked_date", { ascending: false });

    return {
      search_results: searchResults || [],
      keyword_history: keywordHistory || [],
      period: `${daysBack} days`,
    };
  }

  async collectGEOData(brandId: string, daysBack: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get AI platform results
    const { data: geoResults } = await this.supabase
      .from("gv_search_results")
      .select(`
        *,
        keyword:gv_keywords(keyword, keyword_type)
      `)
      .eq("brand_id", brandId)
      .in("search_engine", ["chatgpt", "gemini", "claude", "perplexity"])
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    return {
      geo_results: geoResults || [],
      platforms: ["chatgpt", "gemini", "claude", "perplexity"],
      period: `${daysBack} days`,
    };
  }

  async collectSocialData(brandId: string, daysBack: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get social content performance
    const { data: socialContent } = await this.supabase
      .from("gv_creator_content")
      .select("*")
      .eq("brand_id", brandId)
      .gte("posted_at", startDate.toISOString())
      .order("engagement_total", { ascending: false })
      .limit(100);

    // Get trends
    const { data: trends } = await this.supabase
      .from("gv_trends")
      .select("*")
      .eq("category", brandId) // Assuming category filter
      .gte("first_detected_at", startDate.toISOString().split("T")[0])
      .order("growth_rate", { ascending: false });

    return {
      social_content: socialContent || [],
      trends: trends || [],
      period: `${daysBack} days`,
    };
  }
}

// ============================================================================
// INSIGHT STORAGE
// ============================================================================

class LearningInsightStorage {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async saveInsights(brandId: string, insights: LearningInsight[]): Promise<void> {
    console.log(`[LearningInsightStorage] Saving ${insights.length} insights`);

    // Convert to daily insights format
    const dailyInsights = insights.map((insight) => ({
      brand_id: brandId,
      insight_type: this.mapInsightType(insight.type),
      title: this.generateTitle(insight),
      description: insight.insight,
      data: insight.data,
      priority: this.mapPriority(insight.priority),
      column_type: this.assignColumn(insight),
      ai_provider: "claude",
      confidence_score: insight.confidence_score,
      actionable: insight.actionable,
      action_status: "pending",
      insight_date: new Date().toISOString().split("T")[0],
    }));

    // Batch insert
    const { error } = await this.supabase.from("gv_daily_insights").insert(dailyInsights);

    if (error) {
      console.error("[LearningInsightStorage] Error:", error);
      throw error;
    }

    console.log(`[LearningInsightStorage] Saved ${dailyInsights.length} insights successfully`);
  }

  private mapInsightType(type: string): string {
    const mapping: Record<string, string> = {
      keyword_discovery: "keyword_opportunity",
      ranking_pattern: "ranking_change",
      backlink_opportunity: "content_suggestion",
      content_strategy: "action_item",
      sentiment_shift: "social_trend",
    };

    return mapping[type] || "action_item";
  }

  private generateTitle(insight: LearningInsight): string {
    const titleTemplates: Record<string, string> = {
      keyword_discovery: "New High-Potential Keyword Discovered",
      ranking_pattern: "Ranking Pattern Identified",
      backlink_opportunity: "Backlink Opportunity Found",
      content_strategy: "Content Strategy Recommendation",
      sentiment_shift: "Sentiment Trend Detected",
    };

    return titleTemplates[insight.type] || "Learning Insight";
  }

  private mapPriority(priority: number): string {
    if (priority >= 5) return "urgent";
    if (priority >= 4) return "high";
    if (priority >= 3) return "medium";
    return "low";
  }

  private assignColumn(insight: LearningInsight): string {
    // Assign to 4-column structure
    if (insight.priority >= 5) return "now"; // Urgent actions
    if (insight.type === "ranking_pattern") return "progress"; // Track progress
    if (insight.type === "keyword_discovery") return "potential"; // Opportunities
    if (insight.type.includes("competitor")) return "competitors"; // Competitive intel

    return "potential"; // Default to potential
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

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
    const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!claudeKey) {
      return new Response(
        JSON.stringify({ error: "Claude API key not configured" }),
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
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: LearningRequest = await req.json();
    const { brand_id, learning_mode, days_to_analyze } = requestData;

    console.log(`[daily-intelligence-learner] Learning mode: ${learning_mode} for brand: ${brand_id}`);

    // Get brand context
    const { data: brand } = await supabaseClient
      .from("gv_brands")
      .select("*")
      .eq("id", brand_id)
      .single();

    if (!brand) {
      return new Response(
        JSON.stringify({ error: "Brand not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const daysBack = days_to_analyze || 7;
    const learningEngine = new ClaudeLearningEngine(claudeKey);
    const dataCollector = new LearningDataCollector(supabaseClient);
    const insightStorage = new LearningInsightStorage(supabaseClient);

    let allInsights: LearningInsight[] = [];

    // Learn from SEO data
    if (learning_mode === "seo" || learning_mode === "all") {
      console.log("[daily-intelligence-learner] Analyzing SEO patterns...");
      const seoData = await dataCollector.collectSEOData(brand_id, daysBack);
      const seoInsights = await learningEngine.analyzeSEOPatterns(brand, seoData);
      allInsights.push(...seoInsights);
      console.log(`[daily-intelligence-learner] Found ${seoInsights.length} SEO insights`);
    }

    // Learn from GEO data
    if (learning_mode === "geo" || learning_mode === "all") {
      console.log("[daily-intelligence-learner] Analyzing GEO patterns...");
      const geoData = await dataCollector.collectGEOData(brand_id, daysBack);
      const geoInsights = await learningEngine.analyzeGEOPatterns(brand, geoData);
      allInsights.push(...geoInsights);
      console.log(`[daily-intelligence-learner] Found ${geoInsights.length} GEO insights`);
    }

    // Learn from Social data
    if (learning_mode === "social" || learning_mode === "all") {
      console.log("[daily-intelligence-learner] Analyzing Social patterns...");
      const socialData = await dataCollector.collectSocialData(brand_id, daysBack);
      const socialInsights = await learningEngine.analyzeSocialPatterns(brand, socialData);
      allInsights.push(...socialInsights);
      console.log(`[daily-intelligence-learner] Found ${socialInsights.length} Social insights`);
    }

    // Save insights
    if (allInsights.length > 0) {
      await insightStorage.saveInsights(brand_id, allInsights);
    }

    // Calculate cost
    const estimatedCost = 0.05; // ~$0.05 per learning session

    console.log(`[daily-intelligence-learner] Complete. Generated ${allInsights.length} insights. Cost: $${estimatedCost}`);

    return new Response(
      JSON.stringify({
        success: true,
        brand_id,
        learning_mode,
        days_analyzed: daysBack,
        insights_generated: allInsights.length,
        breakdown: {
          seo: allInsights.filter((i) => i.channel === "seo").length,
          geo: allInsights.filter((i) => i.channel === "geo").length,
          social: allInsights.filter((i) => i.channel === "social").length,
        },
        high_priority_count: allInsights.filter((i) => i.priority >= 4).length,
        actionable_count: allInsights.filter((i) => i.actionable).length,
        cost_usd: estimatedCost,
        insights: allInsights,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[daily-intelligence-learner] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Learning process failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
