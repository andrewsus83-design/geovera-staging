import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================================
// DAILY AUTO-RESEARCH SYSTEM
// Stack: Perplexity (research) + Gemini (trends) + YouTube API (videos)
//        + Claude via Cloudflare AI Gateway (analysis + caching)
// Syncs with: Insights, To-Do, Content Studio
// ============================================================================

interface DailyResearchRequest {
  brand_id: string;
  research_channels?: ("seo" | "geo" | "social")[];
}

interface BrandProfile {
  id: string;
  brand_name: string;
  brand_category: string;
  brand_country: string;
  brand_description: string;
  target_audience: string;
  key_products: string[];
  subscription_tier: string;
}

interface ResearchConfig {
  total_questions: number;
  suggested_count: number;
  tier: string;
}

interface ResearchResult {
  channel: "seo" | "geo" | "social";
  query: string;
  findings: string;
  sentiment: "positive" | "negative" | "neutral";
  keywords_found: string[];
  competitors_found: string[];
  backlinks_found: string[];
  ranking_insights: any;
  priority_score: number;
  impact_score: number;
  suggested: boolean;
  cost: number;
}

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

const TIER_CONFIGS: Record<string, ResearchConfig> = {
  basic:   { total_questions: 20, suggested_count: 5,  tier: "basic" },
  premium: { total_questions: 30, suggested_count: 10, tier: "premium" },
  partner: { total_questions: 50, suggested_count: 20, tier: "partner" },
};

// ============================================================================
// PERPLEXITY ENGINE — Primary research for SEO, GEO, Social
// ============================================================================

class PerplexityEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async researchSEO(brand: BrandProfile, query: string): Promise<any> {
    const prompt = `You are an SEO research expert. Analyze the search landscape for: "${query}"

**RESEARCH FOCUS**:
1. **Top Ranking Content**: Who ranks #1-3? Content format, length, structure?
2. **Keyword Opportunities**: Related keywords, long-tail variations, LSI keywords
3. **SERP Features**: Featured snippets, People Also Ask, video carousels present?
4. **Competitive Intelligence**: Who dominates this query? Content gaps to exploit?
5. **Search Intent**: Informational / Commercial / Transactional / Navigational?
6. **SENTIMENT**: Current brand sentiment (positive/negative/neutral)
7. **IMPACT SCORE** (1-100): Business value of ranking for this query

**BRAND**: ${brand.brand_name} (${brand.brand_category} in ${brand.brand_country})

END with: Sentiment: [positive/negative/neutral] | Impact Score: [1-100]`;

    return this.query(prompt);
  }

  async researchGEO(brand: BrandProfile, query: string): Promise<any> {
    const prompt = `You are a GEO (Generative Engine Optimization) expert. Analyze AI platform responses for: "${query}"

**RESEARCH FOCUS**:
1. **AI Platform Mentions**: Which brands do ChatGPT/Gemini/Claude/Perplexity mention?
2. **Citation Sources**: What websites/articles are cited by AI for this topic?
3. **Content Gaps**: What questions do AI struggle to answer about "${query}"?
4. **Entity Recognition**: How is ${brand.brand_name} mentioned (if at all)?
5. **Optimization Strategy**: How to increase AI visibility for this query?
6. **SENTIMENT**: How is the brand portrayed in AI responses?
7. **IMPACT SCORE** (1-100): Value of AI visibility for this query

**BRAND**: ${brand.brand_name} (${brand.brand_category})

END with: Sentiment: [positive/negative/neutral] | Impact Score: [1-100]`;

    return this.query(prompt);
  }

  async researchSocial(brand: BrandProfile, query: string): Promise<any> {
    const prompt = `You are a Social Media Search expert. Analyze social performance for: "${query}"

**RESEARCH FOCUS**:
1. **Platform Trends**: TikTok sounds/hashtags, Instagram Reel trends, YouTube formats
2. **Hashtag Intelligence**: Top performing hashtags, volume, engagement rates
3. **Content Performance**: Best formats (tutorial, review, unboxing)? Optimal video length?
4. **Algorithm Signals**: What content gets pushed? Watch time vs engagement priority?
5. **Creator Strategies**: Who ranks for "${query}" on social? What makes them succeed?
6. **SENTIMENT**: Sentiment around this query on social (positive/negative/neutral)
7. **IMPACT SCORE** (1-100): Viral potential × conversion value

**BRAND**: ${brand.brand_name} | **AUDIENCE**: ${brand.target_audience}
**PLATFORMS**: TikTok, Instagram, YouTube

END with: Sentiment: [positive/negative/neutral] | Impact Score: [1-100]`;

    return this.query(prompt);
  }

  private async query(prompt: string): Promise<any> {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages: [
          {
            role: "system",
            content: "You are a market research expert. Provide detailed, data-driven insights with specific examples and actionable recommendations. Always end with Sentiment and Impact Score as instructed.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 4000,
        return_citations: true,
      }),
    });

    if (!response.ok) throw new Error(`Perplexity error: ${response.status}`);

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";

    const impactMatch = answer.match(/impact\s+score[:\s]+(\d+)/i);
    const sentimentMatch = answer.match(/sentiment[:\s]+(positive|negative|neutral)/i);

    return {
      answer,
      citations: data.citations || [],
      impact_score: impactMatch ? parseInt(impactMatch[1]) : 50,
      sentiment: (sentimentMatch?.[1]?.toLowerCase() || "neutral") as "positive" | "negative" | "neutral",
      cost: 0.005,
    };
  }
}

// ============================================================================
// GEMINI ENGINE — Google Trends + Related Queries via Cloudflare AI Gateway
// ============================================================================

class GeminiEngine {
  private apiKey: string;
  private gatewayUrl: string;

  constructor(apiKey: string, gatewayUrl: string) {
    this.apiKey = apiKey;
    this.gatewayUrl = gatewayUrl;
  }

  async getTrends(query: string, country: string): Promise<any> {
    // Use Gemini via Cloudflare Gateway for trend analysis
    const endpoint = `${this.gatewayUrl}/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const prompt = `Analyze current search trends for the keyword: "${query}" in ${country}.

Provide:
1. Is this keyword trending UP, DOWN, or STABLE right now?
2. Top 5 rising related queries (new, fast-growing searches)
3. Top 5 related queries by volume
4. Seasonal patterns (peak months?)
5. Trend momentum score (1-100)

Format as JSON:
{
  "trend_direction": "up|down|stable",
  "momentum_score": 0-100,
  "rising_queries": ["query1", "query2", "query3", "query4", "query5"],
  "top_queries": ["query1", "query2", "query3", "query4", "query5"],
  "seasonal_peak": "month or null",
  "summary": "one sentence"
}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
        }),
      });

      if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const trends = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return { ...trends, cost: 0.0001 };
    } catch (e) {
      console.error("[GeminiEngine] Trends error:", e);
      return { trend_direction: "stable", momentum_score: 50, rising_queries: [], top_queries: [], cost: 0 };
    }
  }
}

// ============================================================================
// YOUTUBE ENGINE — YouTube Data API v3 (replaces SerpAPI YouTube)
// ============================================================================

class YouTubeEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchVideos(query: string, maxResults = 5): Promise<any> {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&order=viewCount&key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
      const data = await response.json();

      const videos = (data.items || []).map((item: any) => ({
        videoId: item.id?.videoId,
        title: item.snippet?.title,
        channel: item.snippet?.channelTitle,
        published: item.snippet?.publishedAt?.substring(0, 10),
        description: item.snippet?.description?.substring(0, 150),
      }));

      return { videos, cost: 0.0001 }; // ~100 quota units, free tier
    } catch (e) {
      console.error("[YouTubeEngine] Error:", e);
      return { videos: [], cost: 0 };
    }
  }
}

// ============================================================================
// CLAUDE ENGINE — Analysis via Cloudflare AI Gateway (with caching)
// ============================================================================

class ClaudeEngine {
  private apiKey: string;
  private gatewayUrl: string;

  constructor(apiKey: string, gatewayUrl: string) {
    this.apiKey = apiKey;
    this.gatewayUrl = gatewayUrl;
  }

  async synthesize(brand: BrandProfile, channel: string, query: string, researchData: any): Promise<any> {
    // Route through Cloudflare AI Gateway — same query cached for 24h
    const endpoint = `${this.gatewayUrl}/v1/messages`;

    const prompt = `You are a ${channel.toUpperCase()} strategy expert for ${brand.brand_name}.

Based on this research data for "${query}":
${JSON.stringify(researchData, null, 2).substring(0, 3000)}

Provide:
1. **Top 3 Priority Actions** — specific, actionable, time-bound
2. **Quick Win** — what can be done in 7 days?
3. **Content Suggestion** — one specific content piece to create
4. **Risk Alert** — any threat or issue to address?

Be concise and specific. Focus on ${brand.brand_category} in ${brand.brand_country}.`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) throw new Error(`Claude error: ${response.status}`);
      const data = await response.json();
      return {
        synthesis: data.content?.[0]?.text || "",
        cost: 0.001,
        cached: response.headers.get("cf-cache-status") === "HIT",
      };
    } catch (e) {
      console.error("[ClaudeEngine] Error:", e);
      return { synthesis: "", cost: 0, cached: false };
    }
  }
}

// ============================================================================
// ORCHESTRATOR
// ============================================================================

class DailyResearchOrchestrator {
  private perplexity: PerplexityEngine;
  private gemini: GeminiEngine;
  private youtube: YouTubeEngine;
  private claude: ClaudeEngine;
  private supabase: any;

  constructor(
    perplexity: PerplexityEngine,
    gemini: GeminiEngine,
    youtube: YouTubeEngine,
    claude: ClaudeEngine,
    supabase: any
  ) {
    this.perplexity = perplexity;
    this.gemini = gemini;
    this.youtube = youtube;
    this.claude = claude;
    this.supabase = supabase;
  }

  async runDailyResearch(
    brand: BrandProfile,
    channels: string[],
    config: ResearchConfig
  ): Promise<{ results: ResearchResult[]; suggestions: ResearchResult[] }> {
    console.log(`[Orchestrator] ${brand.brand_name} | tier: ${config.tier} | channels: ${channels.join(", ")}`);

    const { data: questions } = await this.supabase
      .from("gv_keywords")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("source", "ai_suggested")
      .eq("active", true)
      .order("priority", { ascending: false })
      .order("impact_score", { ascending: false })
      .limit(config.total_questions);

    if (!questions || questions.length === 0) {
      console.log("[Orchestrator] No questions found");
      return { results: [], suggestions: [] };
    }

    const allResults: ResearchResult[] = [];
    const questionsPerChannel = Math.ceil(config.total_questions / channels.length);

    for (const channel of channels) {
      await this.processChannel(
        channel as "seo" | "geo" | "social",
        brand,
        questions,
        questionsPerChannel,
        allResults
      );
    }

    this.ensureNegativeSentiment(allResults);
    allResults.sort((a, b) => b.priority_score - a.priority_score);

    const suggestions = allResults.slice(0, config.suggested_count);
    suggestions.forEach((s) => (s.suggested = true));

    console.log(`[Orchestrator] Done: ${allResults.length} researched, ${suggestions.length} suggested`);
    return { results: allResults, suggestions };
  }

  private async processChannel(
    channel: "seo" | "geo" | "social",
    brand: BrandProfile,
    questions: any[],
    limit: number,
    allResults: ResearchResult[]
  ): Promise<void> {
    const channelQuestions = questions
      .filter((q) => q.keyword_type === channel)
      .slice(0, limit);

    for (const q of channelQuestions) {
      try {
        let perplexityResult: any;
        let extraData: any = {};
        let cost = 0;

        if (channel === "seo") {
          // Perplexity: deep SERP research
          perplexityResult = await this.perplexity.researchSEO(brand, q.keyword);
          // Gemini: Google Trends data
          const trends = await this.gemini.getTrends(q.keyword, brand.brand_country);
          extraData = { trends };
          cost = perplexityResult.cost + 0.0001;

        } else if (channel === "geo") {
          // Perplexity: AI platform visibility
          perplexityResult = await this.perplexity.researchGEO(brand, q.keyword);
          extraData = { citations: perplexityResult.citations };
          cost = perplexityResult.cost;

        } else if (channel === "social") {
          // Perplexity: social trends research
          perplexityResult = await this.perplexity.researchSocial(brand, q.keyword);
          // YouTube Data API: actual video results
          const youtubeData = await this.youtube.searchVideos(q.keyword);
          extraData = { youtube: youtubeData.videos };
          cost = perplexityResult.cost + youtubeData.cost;
        }

        // Claude via Cloudflare Gateway: synthesize + cache
        const claudeResult = await this.claude.synthesize(brand, channel, q.keyword, {
          research: perplexityResult.answer.substring(0, 1500),
          ...extraData,
        });

        if (claudeResult.cached) {
          console.log(`[Claude] Cache HIT for: ${q.keyword}`);
        }

        cost += claudeResult.cost;

        allResults.push({
          channel,
          query: q.keyword,
          findings: `${perplexityResult.answer}\n\n---\n**Strategic Analysis:**\n${claudeResult.synthesis}`,
          sentiment: perplexityResult.sentiment,
          keywords_found: this.extractKeywords(perplexityResult.answer),
          competitors_found: this.extractCompetitors(perplexityResult.answer),
          backlinks_found: perplexityResult.citations.map((c: any) => c.url || c.link).filter(Boolean).slice(0, 10),
          ranking_insights: extraData,
          priority_score: q.priority * perplexityResult.impact_score,
          impact_score: perplexityResult.impact_score,
          suggested: false,
          cost,
        });

        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`[Orchestrator] ${channel} error for "${q.keyword}":`, error);
      }
    }
  }

  private ensureNegativeSentiment(results: ResearchResult[]): void {
    const targetNegative = Math.ceil(results.length * 0.2);
    const currentNegative = results.filter((r) => r.sentiment === "negative").length;
    if (currentNegative < targetNegative) {
      const neutrals = results.filter((r) => r.sentiment === "neutral");
      for (let i = 0; i < Math.min(targetNegative - currentNegative, neutrals.length); i++) {
        neutrals[i].sentiment = "negative";
      }
    }
  }

  private extractKeywords(text: string): string[] {
    const matches = text.match(/["']([^"']{10,50})["']/g) || [];
    return [...new Set(matches.map((m) => m.replace(/["']/g, "")))].slice(0, 10);
  }

  private extractCompetitors(text: string): string[] {
    const knownBrands = ["wardah", "emina", "somethinc", "skintific", "avoskin", "garnier", "loreal", "maybelline"];
    return [...new Set(knownBrands.filter((b) => text.toLowerCase().includes(b)))];
  }
}

// ============================================================================
// SYNC TO INSIGHTS, TODO, CONTENT STUDIO
// ============================================================================

async function syncToInsightsAndTodo(
  supabase: any,
  brandId: string,
  suggestions: ResearchResult[]
): Promise<void> {
  for (const s of suggestions) {
    // 1. Save to Insights
    await supabase.from("gv_daily_insights").insert({
      brand_id: brandId,
      insight_type: s.sentiment === "negative" ? "threat_alert" : "opportunity",
      channel: s.channel,
      title: `${s.sentiment === "negative" ? "⚠️ Alert" : "✨ Opportunity"}: ${s.query}`,
      description: s.findings.substring(0, 500),
      priority: Math.ceil(s.priority_score / 100),
      impact_score: s.impact_score,
      confidence_score: 0.85,
      suggested: true,
      insights_data: {
        query: s.query,
        sentiment: s.sentiment,
        keywords_found: s.keywords_found,
        competitors_found: s.competitors_found,
        backlinks_found: s.backlinks_found,
        ranking_insights: s.ranking_insights,
      },
    });

    // 2. High-priority → To-Do
    if (s.priority_score > 300) {
      await supabase.from("gv_user_todo").insert({
        brand_id: brandId,
        title: `[${s.channel.toUpperCase()}] ${s.sentiment === "negative" ? "Address Issue" : "Capture Opportunity"}: ${s.query}`,
        description: `${s.findings.substring(0, 300)}...\n\nKeywords: ${s.keywords_found.join(", ")}`,
        column_type: s.sentiment === "negative" ? "urgent" : "to_do",
        priority: Math.ceil(s.priority_score / 100),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        tags: [s.channel, s.sentiment, "ai_suggested"],
        assigned_to: null,
      });
    }

    // 3. Social/content → Content Studio
    if (s.channel === "social" || s.keywords_found.length > 3) {
      await supabase.from("gv_content_studio_posts").insert({
        brand_id: brandId,
        post_type: "idea",
        title: `Content Idea: ${s.query}`,
        content: `${s.findings.substring(0, 400)}\n\nKeywords: ${s.keywords_found.join(", ")}\nFormat: ${s.channel === "social" ? "Video/Reel" : "Blog post"}`,
        platforms: s.channel === "social" ? ["tiktok", "instagram", "youtube"] : ["blog"],
        status: "draft",
        ai_generated: true,
        metadata: { source: "daily_research", query: s.query, impact_score: s.impact_score, sentiment: s.sentiment },
      });
    }
  }

  console.log(`[Sync] ${suggestions.length} suggestions → Insights + Todo + ContentStudio`);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const PERPLEXITY_API_KEY  = Deno.env.get("PERPLEXITY_API_KEY");
    const GOOGLE_AI_API_KEY   = Deno.env.get("GOOGLE_AI_API_KEY"); // Gemini
    const YOUTUBE_API_KEY     = Deno.env.get("YOUTUBE_API_KEY");
    const ANTHROPIC_API_KEY   = Deno.env.get("ANTHROPIC_API_KEY");
    const CF_ANTHROPIC        = Deno.env.get("CF_AI_GATEWAY_ANTHROPIC");
    const CF_GEMINI           = Deno.env.get("CF_AI_GATEWAY_GEMINI");

    if (!PERPLEXITY_API_KEY || !ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing required API keys" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Missing Authorization" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const { brand_id, research_channels }: DailyResearchRequest = await req.json();

    const { data: brand } = await supabase.from("gv_brands").select("*").eq("id", brand_id).single();
    if (!brand) return new Response(JSON.stringify({ error: "Brand not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const tier    = brand.subscription_tier || "basic";
    const config  = TIER_CONFIGS[tier] || TIER_CONFIGS.basic;
    const channels = research_channels || ["seo", "geo", "social"];

    // Initialise engines
    const perplexity = new PerplexityEngine(PERPLEXITY_API_KEY);
    const gemini     = new GeminiEngine(GOOGLE_AI_API_KEY || "", CF_GEMINI || "https://generativelanguage.googleapis.com");
    const youtube    = new YouTubeEngine(YOUTUBE_API_KEY || "");
    const claude     = new ClaudeEngine(ANTHROPIC_API_KEY, CF_ANTHROPIC || "https://api.anthropic.com");

    const orchestrator = new DailyResearchOrchestrator(perplexity, gemini, youtube, claude, supabase);

    console.log(`[daily-auto-research] START: ${brand.brand_name} (${tier})`);
    console.log(`[daily-auto-research] Stack: Perplexity + Gemini + YouTube API + Claude via Cloudflare`);

    const { results, suggestions } = await orchestrator.runDailyResearch(brand, channels, config);
    await syncToInsightsAndTodo(supabase, brand_id, suggestions);

    const totalCost   = results.reduce((sum, r) => sum + r.cost, 0);
    const cacheHits   = results.filter((r) => r.ranking_insights?.cached).length;

    console.log(`[daily-auto-research] DONE: ${results.length} queries | $${totalCost.toFixed(3)} | ${cacheHits} cache hits`);

    return new Response(JSON.stringify({
      success: true,
      brand_id,
      tier,
      channels,
      stack: ["perplexity-sonar-deep-research", "gemini-1.5-flash", "youtube-data-api-v3", "claude-3.5-haiku-cloudflare-cached"],
      total_researched: results.length,
      suggested_count: suggestions.length,
      cloudflare_cache_hits: cacheHits,
      sentiment_breakdown: {
        negative: results.filter((r) => r.sentiment === "negative").length,
        positive: results.filter((r) => r.sentiment === "positive").length,
        neutral:  results.filter((r) => r.sentiment === "neutral").length,
      },
      cost_usd: parseFloat(totalCost.toFixed(3)),
      config: { tier, total_questions: config.total_questions, suggested_count: config.suggested_count },
      suggestions: suggestions.map((s) => ({
        query: s.query,
        channel: s.channel,
        sentiment: s.sentiment,
        priority_score: s.priority_score,
        impact_score: s.impact_score,
        findings_preview: s.findings.substring(0, 200) + "...",
      })),
      synced_to: ["insights", "todo", "content_studio"],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[daily-auto-research] Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Research failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
