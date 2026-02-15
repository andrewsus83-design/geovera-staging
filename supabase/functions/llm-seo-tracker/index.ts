import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================================
// TYPES
// ============================================================================

interface LLMSEORequest {
  brand_id: string;
  keyword_ids?: string[]; // Optional: specific keywords to track
  platforms?: ("chatgpt" | "gemini" | "claude" | "perplexity")[]; // Default: all
}

interface BrandData {
  id: string;
  brand_name: string;
  brand_category: string;
  brand_country: string;
  brand_website: string;
  subscription_tier: string;
}

interface KeywordData {
  id: string;
  keyword: string;
  keyword_type: string;
  brand_id: string;
}

interface AISearchResult {
  platform: string;
  brand_appeared: boolean;
  brand_rank: number | null;
  brand_url: string | null;
  top_results: Array<{
    rank: number;
    title: string;
    url: string;
    brand: string;
    snippet?: string;
  }>;
  competitors_found: string[];
  competitor_positions: Record<string, number>;
  total_results: number;
  raw_response: any;
}

// ============================================================================
// AI PLATFORM CLIENTS
// ============================================================================

class ChatGPTClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<any> {
    try {
      // Using OpenAI ChatGPT API for web search
      // Note: ChatGPT doesn't have native search API, we use GPT-4 with web browsing
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are a web search assistant. Return search results in JSON format with: brand_name, url, snippet, and rank for top 10 results.",
            },
            {
              role: "user",
              content: `Search for: "${query}". Return the top 10 results with brand names, URLs, and snippets. Format as JSON array.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`ChatGPT API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseGPTResponse(data);
    } catch (error) {
      console.error("[ChatGPTClient] Error:", error);
      throw error;
    }
  }

  private parseGPTResponse(data: any): any {
    try {
      const content = data.choices?.[0]?.message?.content || "[]";
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("[ChatGPTClient] Parse error:", error);
      return [];
    }
  }
}

class GeminiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<any> {
    try {
      // Using Google Gemini API with grounding (search)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Search the web for: "${query}". List the top 10 brands/companies that appear in search results. For each result, include: brand name, URL, and a brief snippet. Format the response as a JSON array.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2000,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseGeminiResponse(data);
    } catch (error) {
      console.error("[GeminiClient] Error:", error);
      throw error;
    }
  }

  private parseGeminiResponse(data: any): any {
    try {
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("[GeminiClient] Parse error:", error);
      return [];
    }
  }
}

class PerplexityClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<any> {
    try {
      // Using Perplexity API with search
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are a search results analyzer. Return search results in JSON format.",
            },
            {
              role: "user",
              content: `Search for: "${query}". List the top 10 brands/companies found. Return as JSON array with: brand_name, url, snippet, rank.`,
            },
          ],
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parsePerplexityResponse(data);
    } catch (error) {
      console.error("[PerplexityClient] Error:", error);
      throw error;
    }
  }

  private parsePerplexityResponse(data: any): any {
    try {
      const content = data.choices?.[0]?.message?.content || "[]";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("[PerplexityClient] Parse error:", error);
      return [];
    }
  }
}

class ClaudeClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<any> {
    try {
      // Using Anthropic Claude API (no native search, simulated)
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `Search for: "${query}". List the top 10 brands/companies that would appear in search results for this query. Return as JSON array with: brand_name, url, snippet, rank.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseClaudeResponse(data);
    } catch (error) {
      console.error("[ClaudeClient] Error:", error);
      throw error;
    }
  }

  private parseClaudeResponse(data: any): any {
    try {
      const content = data.content?.[0]?.text || "[]";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("[ClaudeClient] Parse error:", error);
      return [];
    }
  }
}

// ============================================================================
// SEARCH PROCESSOR
// ============================================================================

class LLMSearchProcessor {
  private supabase: any;
  private brand: BrandData;

  constructor(supabase: any, brand: BrandData) {
    this.supabase = supabase;
    this.brand = brand;
  }

  async processSearchResults(
    keyword: KeywordData,
    platform: string,
    results: any[]
  ): Promise<AISearchResult> {
    const brandName = this.brand.brand_name.toLowerCase();
    const brandWebsite = this.brand.brand_website.toLowerCase();

    let brandRank: number | null = null;
    let brandUrl: string | null = null;
    let brandAppeared = false;

    const topResults: Array<any> = [];
    const competitorsFound: string[] = [];
    const competitorPositions: Record<string, number> = {};

    // Process each result
    for (let i = 0; i < Math.min(results.length, 10); i++) {
      const result = results[i];
      const resultBrand = (result.brand_name || result.brand || "").toLowerCase();
      const resultUrl = (result.url || "").toLowerCase();
      const rank = i + 1;

      topResults.push({
        rank,
        title: result.title || resultBrand,
        url: result.url || "",
        brand: resultBrand,
        snippet: result.snippet || result.description || "",
      });

      // Check if this is our brand
      if (
        resultBrand.includes(brandName) ||
        resultUrl.includes(brandWebsite) ||
        brandName.includes(resultBrand)
      ) {
        brandAppeared = true;
        brandRank = brandRank || rank; // Keep first occurrence
        brandUrl = brandUrl || result.url;
      } else if (resultBrand && resultBrand !== brandName) {
        // This is a competitor
        if (!competitorsFound.includes(resultBrand)) {
          competitorsFound.push(resultBrand);
          competitorPositions[resultBrand] = rank;
        }
      }
    }

    return {
      platform,
      brand_appeared: brandAppeared,
      brand_rank: brandRank,
      brand_url: brandUrl,
      top_results: topResults,
      competitors_found: competitorsFound,
      competitor_positions: competitorPositions,
      total_results: results.length,
      raw_response: results,
    };
  }

  async saveSearchResult(
    keywordId: string,
    searchResult: AISearchResult
  ): Promise<void> {
    // Map platform to database enum
    const platformMap: Record<string, string> = {
      chatgpt: "google", // ChatGPT uses web search
      gemini: "google", // Gemini uses web search
      claude: "google", // Claude simulates web search
      perplexity: "google", // Perplexity has real-time search
    };

    const { error } = await this.supabase.from("gv_search_results").insert({
      keyword_id: keywordId,
      brand_id: this.brand.id,
      platform: platformMap[searchResult.platform] || "google",
      search_engine: searchResult.platform, // AI platform name
      brand_rank: searchResult.brand_rank,
      brand_url: searchResult.brand_url,
      brand_appeared: searchResult.brand_appeared,
      top_results: searchResult.top_results,
      competitors_found: searchResult.competitors_found,
      competitor_positions: searchResult.competitor_positions,
      total_results: searchResult.total_results,
      raw_response: searchResult.raw_response,
      search_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      console.error("[LLMSearchProcessor] Save error:", error);
      throw error;
    }

    // Update keyword with latest rank
    if (searchResult.brand_appeared && searchResult.brand_rank) {
      const { data: keyword } = await this.supabase
        .from("gv_keywords")
        .select("current_rank, best_rank, total_searches")
        .eq("id", keywordId)
        .single();

      const updates: any = {
        current_rank: searchResult.brand_rank,
        total_searches: (keyword?.total_searches || 0) + 1,
        last_tracked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update best rank if this is better
      if (!keyword?.best_rank || searchResult.brand_rank < keyword.best_rank) {
        updates.best_rank = searchResult.brand_rank;
      }

      await this.supabase.from("gv_keywords").update(updates).eq("id", keywordId);
    }
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
    // Validate API keys
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!openaiKey || !geminiKey || !perplexityKey || !claudeKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "AI API keys not configured",
          missing: {
            openai: !openaiKey,
            gemini: !geminiKey,
            perplexity: !perplexityKey,
            claude: !claudeKey,
          },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate Authorization
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

    const requestData: LLMSEORequest = await req.json();
    const { brand_id, keyword_ids, platforms } = requestData;

    console.log(`[llm-seo-tracker] Tracking for brand: ${brand_id}`);

    // Get brand data
    const { data: brand, error: brandError } = await supabaseClient
      .from("gv_brands")
      .select("*")
      .eq("id", brand_id)
      .single();

    if (brandError || !brand) {
      return new Response(
        JSON.stringify({ error: "Brand not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check tier limits
    const { data: usage } = await supabaseClient
      .from("gv_tier_usage")
      .select("keywords_used, keywords_limit")
      .eq("brand_id", brand_id)
      .eq("usage_month", new Date().toISOString().split("T")[0].substring(0, 7) + "-01")
      .single();

    if (usage && usage.keywords_used >= usage.keywords_limit) {
      return new Response(
        JSON.stringify({
          error: "Keyword tracking limit reached for this month",
          current: usage.keywords_used,
          limit: usage.keywords_limit,
          tier: brand.subscription_tier,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get keywords to track
    let keywordsQuery = supabaseClient
      .from("gv_keywords")
      .select("*")
      .eq("brand_id", brand_id)
      .eq("active", true)
      .eq("keyword_type", "geo"); // GEO = AI platforms

    if (keyword_ids && keyword_ids.length > 0) {
      keywordsQuery = keywordsQuery.in("id", keyword_ids);
    }

    const { data: keywords, error: keywordsError } = await keywordsQuery;

    if (keywordsError || !keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active GEO keywords found for tracking" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[llm-seo-tracker] Tracking ${keywords.length} keywords`);

    // Initialize AI clients
    const clients: Record<string, any> = {
      chatgpt: new ChatGPTClient(openaiKey),
      gemini: new GeminiClient(geminiKey),
      perplexity: new PerplexityClient(perplexityKey),
      claude: new ClaudeClient(claudeKey),
    };

    const targetPlatforms = platforms || ["chatgpt", "gemini", "perplexity", "claude"];
    const processor = new LLMSearchProcessor(supabaseClient, brand);

    const results: any[] = [];
    let totalCost = 0;

    // Process each keyword
    for (const keyword of keywords) {
      const keywordResults: any = {
        keyword_id: keyword.id,
        keyword: keyword.keyword,
        platforms: {},
      };

      // Query each platform
      for (const platform of targetPlatforms) {
        try {
          console.log(`[llm-seo-tracker] Querying ${platform} for: ${keyword.keyword}`);

          const client = clients[platform];
          const searchResults = await client.search(keyword.keyword);

          const processedResult = await processor.processSearchResults(
            keyword,
            platform,
            searchResults
          );

          await processor.saveSearchResult(keyword.id, processedResult);

          keywordResults.platforms[platform] = {
            brand_appeared: processedResult.brand_appeared,
            brand_rank: processedResult.brand_rank,
            competitors_count: processedResult.competitors_found.length,
            top_competitor: processedResult.competitors_found[0] || null,
          };

          // Cost calculation (approximate)
          const costPerQuery: Record<string, number> = {
            chatgpt: 0.002, // GPT-4 Turbo input
            gemini: 0.0005, // Gemini Pro
            perplexity: 0.001, // Perplexity Online
            claude: 0.00025, // Claude Haiku
          };

          totalCost += costPerQuery[platform] || 0.001;
        } catch (error) {
          console.error(`[llm-seo-tracker] Error on ${platform}:`, error);
          keywordResults.platforms[platform] = {
            error: error.message,
          };
        }
      }

      results.push(keywordResults);
    }

    // Update tier usage
    await supabaseClient.rpc("increment_tier_usage", {
      p_brand_id: brand_id,
      p_field: "keywords_used",
      p_increment: keywords.length,
    });

    console.log(`[llm-seo-tracker] Complete. Tracked ${keywords.length} keywords across ${targetPlatforms.length} platforms. Cost: $${totalCost.toFixed(4)}`);

    return new Response(
      JSON.stringify({
        success: true,
        brand_id,
        keywords_tracked: keywords.length,
        platforms: targetPlatforms,
        cost_usd: parseFloat(totalCost.toFixed(4)),
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[llm-seo-tracker] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "LLM SEO tracking failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
