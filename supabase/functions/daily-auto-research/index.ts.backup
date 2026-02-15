import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================================
// DAILY AUTO-RESEARCH SYSTEM
// Purpose: Automated daily research with Perplexity + SerpAPI
// ============================================================================

interface DailyResearchRequest {
  brand_id: string;
  research_channels?: ("seo" | "geo" | "social")[]; // Default: all
  max_queries_per_channel?: number; // Budget control
}

interface BrandProfile {
  id: string;
  brand_name: string;
  brand_category: string;
  brand_country: string;
  brand_description: string;
  target_audience: string;
  key_products: string[];
}

interface ResearchResult {
  channel: "seo" | "geo" | "social";
  query: string;
  source: "perplexity" | "serpapi";
  findings: string;
  keywords_found: string[];
  competitors_found: string[];
  backlinks_found: string[];
  ranking_insights: any;
  cost: number;
}

// ============================================================================
// OPTIMIZED PERPLEXITY RESEARCH ENGINE
// ============================================================================

class PerplexityResearchEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async researchSEO(brand: BrandProfile, query: string): Promise<any> {
    const optimizedPrompt = `You are an SEO research expert. Analyze the search landscape for: "${query}"

**RESEARCH FOCUS**:
1. **Top Ranking Content**:
   - What content ranks #1-3 for this query?
   - Content length, format, structure?
   - What makes them rank (backlinks, authority, freshness)?

2. **Keyword Opportunities**:
   - Related keywords with search volume
   - Long-tail variations with low competition
   - LSI keywords (semantically related)

3. **Backlink Analysis**:
   - Which websites link to top results?
   - What content attracts backlinks naturally?
   - Guest post opportunities in this niche?

4. **SERP Features**:
   - Featured snippets, People Also Ask, videos?
   - How to optimize for these features?
   - Current brand visibility on SERP?

5. **Competitive Intelligence**:
   - Who ranks for "${query}"?
   - What's their content strategy?
   - Gaps we can exploit?

**BRAND CONTEXT**: ${brand.brand_name} (${brand.brand_category} in ${brand.brand_country})

Provide detailed, actionable insights with specific data. Include URLs when relevant.`;

    return await this.query(optimizedPrompt);
  }

  async researchGEO(brand: BrandProfile, query: string): Promise<any> {
    const optimizedPrompt = `You are a GEO (Generative Engine Optimization) research expert. Analyze AI platform responses for: "${query}"

**RESEARCH FOCUS**:
1. **AI Platform Preferences**:
   - Which brands does ChatGPT/Gemini/Claude mention?
   - What sources do they cite?
   - Why are these brands chosen?

2. **Citation Analysis**:
   - What makes content citation-worthy for AI?
   - Which news sources, research papers, or websites are cited?
   - Authority signals AI platforms trust?

3. **Entity Recognition**:
   - How are brands mentioned (full name, variations)?
   - Context of brand mentions (positive, neutral, features)?
   - Brand associations (e.g., "sustainable", "affordable")?

4. **Content Gaps**:
   - What questions do AI struggle to answer about "${query}"?
   - Missing information we can provide?
   - Emerging topics in this space?

5. **Optimization Strategy**:
   - How to increase brand mentions in AI responses?
   - What content to create for better AI visibility?
   - Schema markup or structured data needs?

**BRAND CONTEXT**: ${brand.brand_name} (${brand.brand_category})
**GOAL**: Improve "${brand.brand_name}" visibility when AI platforms answer "${query}"

Provide specific, implementable strategies with examples.`;

    return await this.query(optimizedPrompt);
  }

  async researchSocial(brand: BrandProfile, query: string): Promise<any> {
    const optimizedPrompt = `You are a Social Media Search expert. Analyze social search performance for: "${query}"

**RESEARCH FOCUS**:
1. **Platform-Specific Trends**:
   - TikTok: Trending sounds, hashtags, video formats?
   - Instagram: Reel trends, carousel styles, Stories usage?
   - YouTube: Video length, thumbnail strategies, titles?

2. **Hashtag Intelligence**:
   - Top performing hashtags for "${query}"?
   - Hashtag volume, competition, engagement rate?
   - Emerging hashtags before they peak?

3. **Content Performance**:
   - What content format ranks best (tutorial, review, unboxing)?
   - Optimal video length per platform?
   - Hook strategies (first 3 seconds)?

4. **Creator Strategies**:
   - Who ranks for "${query}" on social?
   - What makes their content perform well?
   - Collaboration opportunities?

5. **Algorithm Signals**:
   - What content gets pushed by algorithms?
   - Watch time, engagement, shares priority?
   - Best posting times for "${brand.brand_category}"?

**BRAND CONTEXT**: ${brand.brand_name} (${brand.brand_category} in ${brand.brand_country})
**PLATFORMS**: TikTok, Instagram, YouTube
**AUDIENCE**: ${brand.target_audience}

Provide data-driven insights with specific examples and metrics.`;

    return await this.query(optimizedPrompt);
  }

  private async query(prompt: string): Promise<any> {
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-large-128k-online",
          messages: [
            {
              role: "system",
              content:
                "You are a market research expert. Provide detailed, data-driven insights with specific examples, metrics, and actionable recommendations. Include URLs when citing sources.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 4000,
          return_citations: true,
          search_recency_filter: "day", // Focus on recent data
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        answer: data.choices?.[0]?.message?.content || "",
        citations: data.citations || [],
        cost: 0.005, // ~$0.005 per query
      };
    } catch (error) {
      console.error("[PerplexityResearchEngine] Error:", error);
      throw error;
    }
  }
}

// ============================================================================
// OPTIMIZED SERPAPI RESEARCH ENGINE
// ============================================================================

class SerpAPIResearchEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async researchSEO(brand: BrandProfile, query: string): Promise<any> {
    console.log(`[SerpAPIResearchEngine] SEO research for: ${query}`);

    const results: any = {};

    // 1. Google Search Results
    const searchResults = await this.googleSearch(query, brand.brand_country);
    results.search = searchResults;

    // 2. Google Trends
    const trendsData = await this.googleTrends(query, brand.brand_country);
    results.trends = trendsData;

    // 3. Related Searches
    const relatedSearches = await this.relatedSearches(query, brand.brand_country);
    results.related = relatedSearches;

    return results;
  }

  async researchSocial(brand: BrandProfile, query: string): Promise<any> {
    console.log(`[SerpAPIResearchEngine] Social research for: ${query}`);

    const results: any = {};

    // YouTube Search (via SerpAPI)
    const youtubeResults = await this.youtubeSearch(query);
    results.youtube = youtubeResults;

    // Google Trends for Social Signals
    const socialTrends = await this.googleTrends(query, brand.brand_country, "YouTube");
    results.social_trends = socialTrends;

    return results;
  }

  private async googleSearch(query: string, country: string): Promise<any> {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("engine", "google");
    url.searchParams.set("q", query);
    url.searchParams.set("gl", country.toLowerCase());
    url.searchParams.set("hl", "en");
    url.searchParams.set("num", "20"); // Top 20 results

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data = await response.json();
    return {
      organic_results: data.organic_results || [],
      featured_snippet: data.featured_snippet || null,
      people_also_ask: data.related_questions || [],
      cost: 0.001,
    };
  }

  private async googleTrends(query: string, country: string, category?: string): Promise<any> {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("engine", "google_trends");
    url.searchParams.set("q", query);
    url.searchParams.set("data_type", "RELATED_QUERIES");
    url.searchParams.set("geo", country.toUpperCase());
    url.searchParams.set("date", "now 7-d");

    if (category) {
      url.searchParams.set("cat", "18"); // YouTube category
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpAPI Trends error: ${response.status}`);
    }

    const data = await response.json();
    return {
      rising_queries: data.rising_queries || [],
      top_queries: data.top_queries || [],
      cost: 0.001,
    };
  }

  private async relatedSearches(query: string, country: string): Promise<any> {
    // Get "People Also Search For" data
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("engine", "google");
    url.searchParams.set("q", query);
    url.searchParams.set("gl", country.toLowerCase());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpAPI Related error: ${response.status}`);
    }

    const data = await response.json();
    return {
      related_searches: data.related_searches || [],
      cost: 0.001,
    };
  }

  private async youtubeSearch(query: string): Promise<any> {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("engine", "youtube");
    url.searchParams.set("search_query", query);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpAPI YouTube error: ${response.status}`);
    }

    const data = await response.json();
    return {
      video_results: data.video_results || [],
      cost: 0.001,
    };
  }
}

// ============================================================================
// RESEARCH ORCHESTRATOR
// ============================================================================

class DailyResearchOrchestrator {
  private perplexity: PerplexityResearchEngine;
  private serpapi: SerpAPIResearchEngine;
  private supabase: any;

  constructor(perplexity: PerplexityResearchEngine, serpapi: SerpAPIResearchEngine, supabase: any) {
    this.perplexity = perplexity;
    this.serpapi = serpapi;
    this.supabase = supabase;
  }

  async runDailyResearch(
    brand: BrandProfile,
    channels: string[],
    maxQueriesPerChannel: number
  ): Promise<ResearchResult[]> {
    const allResults: ResearchResult[] = [];

    // Get today's priority questions from 300QA
    const { data: priorityQuestions } = await this.supabase
      .from("gv_keywords")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("source", "ai_suggested")
      .eq("active", true)
      .order("priority", { ascending: false })
      .limit(maxQueriesPerChannel * channels.length);

    if (!priorityQuestions || priorityQuestions.length === 0) {
      console.log("[DailyResearchOrchestrator] No questions found");
      return [];
    }

    // SEO Research
    if (channels.includes("seo")) {
      const seoQuestions = priorityQuestions.filter((q) => q.keyword_type === "seo").slice(0, maxQueriesPerChannel);

      for (const q of seoQuestions) {
        try {
          // Perplexity for deep insights
          const perplexityResult = await this.perplexity.researchSEO(brand, q.keyword);

          // SerpAPI for ranking data
          const serpapiResult = await this.serpapi.researchSEO(brand, q.keyword);

          allResults.push({
            channel: "seo",
            query: q.keyword,
            source: "perplexity",
            findings: perplexityResult.answer,
            keywords_found: this.extractKeywords(perplexityResult.answer),
            competitors_found: this.extractCompetitors(perplexityResult.answer),
            backlinks_found: this.extractBacklinks(perplexityResult.citations),
            ranking_insights: serpapiResult,
            cost: perplexityResult.cost + 0.003, // Perplexity + 3 SerpAPI calls
          });

          // Rate limit: wait 2 seconds between queries
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`[DailyResearchOrchestrator] SEO error for "${q.keyword}":`, error);
        }
      }
    }

    // GEO Research (AI platforms)
    if (channels.includes("geo")) {
      const geoQuestions = priorityQuestions.filter((q) => q.keyword_type === "geo").slice(0, maxQueriesPerChannel);

      for (const q of geoQuestions) {
        try {
          const perplexityResult = await this.perplexity.researchGEO(brand, q.keyword);

          allResults.push({
            channel: "geo",
            query: q.keyword,
            source: "perplexity",
            findings: perplexityResult.answer,
            keywords_found: this.extractKeywords(perplexityResult.answer),
            competitors_found: this.extractCompetitors(perplexityResult.answer),
            backlinks_found: this.extractBacklinks(perplexityResult.citations),
            ranking_insights: { citations: perplexityResult.citations },
            cost: perplexityResult.cost,
          });

          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`[DailyResearchOrchestrator] GEO error for "${q.keyword}":`, error);
        }
      }
    }

    // Social Research
    if (channels.includes("social")) {
      const socialQuestions = priorityQuestions
        .filter((q) => q.keyword_type === "social")
        .slice(0, maxQueriesPerChannel);

      for (const q of socialQuestions) {
        try {
          const perplexityResult = await this.perplexity.researchSocial(brand, q.keyword);
          const serpapiResult = await this.serpapi.researchSocial(brand, q.keyword);

          allResults.push({
            channel: "social",
            query: q.keyword,
            source: "perplexity",
            findings: perplexityResult.answer,
            keywords_found: this.extractKeywords(perplexityResult.answer),
            competitors_found: this.extractCompetitors(perplexityResult.answer),
            backlinks_found: [],
            ranking_insights: serpapiResult,
            cost: perplexityResult.cost + 0.002, // Perplexity + 2 SerpAPI calls
          });

          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`[DailyResearchOrchestrator] Social error for "${q.keyword}":`, error);
        }
      }
    }

    return allResults;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (can be enhanced)
    const keywords: string[] = [];
    const matches = text.match(/["']([^"']{10,50})["']/g);
    if (matches) {
      keywords.push(...matches.map((m) => m.replace(/["']/g, "")));
    }
    return [...new Set(keywords)].slice(0, 10);
  }

  private extractCompetitors(text: string): string[] {
    // Extract brand names (simplified)
    const knownBrands = [
      "wardah",
      "emina",
      "somethinc",
      "skintific",
      "avoskin",
      "garnier",
      "loreal",
      "maybelline",
    ];
    const found = knownBrands.filter((brand) => text.toLowerCase().includes(brand));
    return [...new Set(found)];
  }

  private extractBacklinks(citations: any[]): string[] {
    return citations.map((c) => c.url || c.link).filter(Boolean).slice(0, 10);
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    const serpapiKey = Deno.env.get("SERPAPI_KEY");

    if (!perplexityKey || !serpapiKey) {
      return new Response(
        JSON.stringify({ error: "API keys not configured" }),
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
        JSON.stringify({ error: "Missing Authorization" }),
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

    const requestData: DailyResearchRequest = await req.json();
    const { brand_id, research_channels, max_queries_per_channel } = requestData;

    const { data: brand } = await supabaseClient.from("gv_brands").select("*").eq("id", brand_id).single();

    if (!brand) {
      return new Response(
        JSON.stringify({ error: "Brand not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const channels = research_channels || ["seo", "geo", "social"];
    const maxQueries = max_queries_per_channel || 3; // Default: 3 queries per channel

    const perplexity = new PerplexityResearchEngine(perplexityKey);
    const serpapi = new SerpAPIResearchEngine(serpapiKey);
    const orchestrator = new DailyResearchOrchestrator(perplexity, serpapi, supabaseClient);

    console.log(`[daily-auto-research] Starting research for brand: ${brand.brand_name}`);

    const results = await orchestrator.runDailyResearch(brand, channels, maxQueries);

    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

    console.log(`[daily-auto-research] Complete. ${results.length} queries. Cost: $${totalCost.toFixed(3)}`);

    return new Response(
      JSON.stringify({
        success: true,
        brand_id,
        channels,
        queries_executed: results.length,
        cost_usd: parseFloat(totalCost.toFixed(3)),
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[daily-auto-research] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Research failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
