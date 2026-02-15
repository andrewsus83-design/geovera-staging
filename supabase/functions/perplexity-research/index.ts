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

interface PerplexityResearchRequest {
  brand_id: string;
  research_type: "brief" | "deep"; // brief = 10 queries, deep = 100+ queries
  focus_channel?: "seo" | "geo" | "social" | "all"; // Default: all
  custom_questions?: string[]; // Optional: use specific questions instead of 300QA
}

interface BrandData {
  id: string;
  brand_name: string;
  brand_category: string;
  brand_country: string;
  brand_website: string;
  brand_description: string;
  subscription_tier: string;
}

interface ResearchResult {
  question: string;
  answer: string;
  citations: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  brand_mentioned: boolean;
  brand_position: number | null; // 1-based position in answer
  competitors_mentioned: string[];
  sentiment: "positive" | "neutral" | "negative" | "not_mentioned";
  key_insights: string[];
}

// ============================================================================
// PERPLEXITY CLIENT
// ============================================================================

class PerplexityClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async research(question: string): Promise<any> {
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
                "You are a market research assistant. Provide detailed, factual answers with citations. Include all relevant brands and sources.",
            },
            {
              role: "user",
              content: question,
            },
          ],
          temperature: 0.2,
          max_tokens: 4000,
          return_citations: true,
          return_images: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[PerplexityClient] Error:", error);
      throw error;
    }
  }
}

// ============================================================================
// RESEARCH PROCESSOR
// ============================================================================

class ResearchProcessor {
  private brand: BrandData;

  constructor(brand: BrandData) {
    this.brand = brand;
  }

  async processResponse(question: string, response: any): Promise<ResearchResult> {
    const answer = response.choices?.[0]?.message?.content || "";
    const citations = this.extractCitations(response);

    // Analyze answer
    const brandMentioned = this.checkBrandMention(answer);
    const brandPosition = this.findBrandPosition(answer);
    const competitorsMentioned = this.extractCompetitors(answer);
    const sentiment = this.analyzeSentiment(answer, brandMentioned);
    const keyInsights = this.extractKeyInsights(answer);

    return {
      question,
      answer,
      citations,
      brand_mentioned: brandMentioned,
      brand_position: brandPosition,
      competitors_mentioned: competitorsMentioned,
      sentiment,
      key_insights: keyInsights,
    };
  }

  private extractCitations(response: any): Array<any> {
    const citations = response.citations || [];
    return citations.map((citation: any) => ({
      title: citation.title || "",
      url: citation.url || "",
      snippet: citation.snippet || citation.text || "",
    }));
  }

  private checkBrandMention(text: string): boolean {
    const brandName = this.brand.brand_name.toLowerCase();
    const brandWebsite = this.brand.brand_website.toLowerCase();
    const textLower = text.toLowerCase();

    return textLower.includes(brandName) || textLower.includes(brandWebsite);
  }

  private findBrandPosition(text: string): number | null {
    const brandName = this.brand.brand_name.toLowerCase();

    // Split by common delimiters (numbered lists, bullets, etc.)
    const lines = text.split(/\n|•|[0-9]+\.|[\-\*]/);

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(brandName)) {
        return i + 1; // 1-based position
      }
    }

    return null;
  }

  private extractCompetitors(text: string): string[] {
    // Common Indonesian beauty/skincare brands (example)
    const knownBrands = [
      "wardah",
      "emina",
      "somethinc",
      "skintific",
      "avoskin",
      "npure",
      "glad2glow",
      "lacoco",
      "scarlett",
      "ms glow",
      "hanasui",
      "garnier",
      "loreal",
      "maybelline",
      "pond's",
      "nivea",
    ];

    const textLower = text.toLowerCase();
    const brandNameLower = this.brand.brand_name.toLowerCase();

    const mentioned = knownBrands.filter(
      (brand) => brand !== brandNameLower && textLower.includes(brand)
    );

    return [...new Set(mentioned)]; // Remove duplicates
  }

  private analyzeSentiment(
    text: string,
    brandMentioned: boolean
  ): "positive" | "neutral" | "negative" | "not_mentioned" {
    if (!brandMentioned) {
      return "not_mentioned";
    }

    const brandName = this.brand.brand_name.toLowerCase();
    const textLower = text.toLowerCase();

    // Find sentences mentioning the brand
    const sentences = text.split(/[.!?]/).filter((s) => s.toLowerCase().includes(brandName));

    if (sentences.length === 0) {
      return "neutral";
    }

    const positiveWords = [
      "best",
      "good",
      "great",
      "excellent",
      "top",
      "recommended",
      "popular",
      "quality",
      "effective",
      "affordable",
      "trusted",
      "favorite",
      "terbaik",
      "bagus",
      "berkualitas",
      "recommended",
    ];

    const negativeWords = [
      "bad",
      "poor",
      "worst",
      "avoid",
      "expensive",
      "overpriced",
      "ineffective",
      "disappointing",
      "buruk",
      "jelek",
      "mahal",
      "tidak efektif",
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      positiveCount += positiveWords.filter((w) => sentenceLower.includes(w)).length;
      negativeCount += negativeWords.filter((w) => sentenceLower.includes(w)).length;
    }

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  private extractKeyInsights(text: string): string[] {
    const insights: string[] = [];

    // Extract bullet points or numbered items
    const bullets = text.match(/(?:•|\-|\*|[0-9]+\.)\s*([^\n•\-\*0-9][^\n]+)/g);

    if (bullets) {
      insights.push(...bullets.map((b) => b.replace(/^(?:•|\-|\*|[0-9]+\.)\s*/, "").trim()));
    }

    // Limit to top 5 insights
    return insights.slice(0, 5);
  }
}

// ============================================================================
// RESEARCH ORCHESTRATOR
// ============================================================================

class ResearchOrchestrator {
  private supabase: any;
  private perplexityClient: PerplexityClient;
  private brand: BrandData;

  constructor(supabase: any, perplexityClient: PerplexityClient, brand: BrandData) {
    this.supabase = supabase;
    this.perplexityClient = perplexityClient;
    this.brand = brand;
  }

  async runBriefResearch(): Promise<ResearchResult[]> {
    console.log("[ResearchOrchestrator] Running BRIEF research (10 queries)");

    // Get top 10 high-priority questions from 300QA
    const { data: questions } = await this.supabase
      .from("gv_keywords")
      .select("keyword, keyword_type")
      .eq("brand_id", this.brand.id)
      .eq("source", "ai_suggested")
      .eq("active", true)
      .order("priority", { ascending: false })
      .limit(10);

    if (!questions || questions.length === 0) {
      throw new Error("No questions found. Please generate 300QA first.");
    }

    return await this.processQuestions(questions.map((q) => q.keyword));
  }

  async runDeepResearch(focusChannel?: string): Promise<ResearchResult[]> {
    console.log(`[ResearchOrchestrator] Running DEEP research (100+ queries) - Focus: ${focusChannel || "all"}`);

    // Get questions from 300QA
    let query = this.supabase
      .from("gv_keywords")
      .select("keyword, keyword_type")
      .eq("brand_id", this.brand.id)
      .eq("source", "ai_suggested")
      .eq("active", true);

    // Filter by channel if specified
    if (focusChannel && focusChannel !== "all") {
      query = query.eq("keyword_type", focusChannel);
    }

    const { data: questions } = await query.order("priority", { ascending: false }).limit(120);

    if (!questions || questions.length === 0) {
      throw new Error("No questions found. Please generate 300QA first.");
    }

    console.log(`[ResearchOrchestrator] Processing ${questions.length} questions`);

    return await this.processQuestions(questions.map((q) => q.keyword));
  }

  private async processQuestions(questions: string[]): Promise<ResearchResult[]> {
    const results: ResearchResult[] = [];
    const processor = new ResearchProcessor(this.brand);

    let processedCount = 0;

    for (const question of questions) {
      try {
        console.log(`[ResearchOrchestrator] Query ${processedCount + 1}/${questions.length}: ${question}`);

        const response = await this.perplexityClient.research(question);
        const result = await processor.processResponse(question, response);

        results.push(result);
        processedCount++;

        // Rate limiting: wait 1 second between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[ResearchOrchestrator] Error processing question "${question}":`, error);
        // Continue with next question
      }
    }

    console.log(`[ResearchOrchestrator] Completed ${processedCount}/${questions.length} queries`);

    return results;
  }

  async saveResults(results: ResearchResult[], researchType: string): Promise<void> {
    console.log(`[ResearchOrchestrator] Saving ${results.length} research results`);

    // Aggregate data for insights
    const mentionCount = results.filter((r) => r.brand_mentioned).length;
    const averagePosition =
      results.filter((r) => r.brand_position !== null).reduce((sum, r) => sum + (r.brand_position || 0), 0) /
        results.filter((r) => r.brand_position !== null).length || null;

    const sentimentBreakdown = {
      positive: results.filter((r) => r.sentiment === "positive").length,
      neutral: results.filter((r) => r.sentiment === "neutral").length,
      negative: results.filter((r) => r.sentiment === "negative").length,
      not_mentioned: results.filter((r) => r.sentiment === "not_mentioned").length,
    };

    const competitorFrequency = results
      .flatMap((r) => r.competitors_mentioned)
      .reduce((acc, comp) => {
        acc[comp] = (acc[comp] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Create AI article summarizing research
    const { error } = await this.supabase.from("gv_ai_articles").insert({
      brand_id: this.brand.id,
      title: `${researchType === "brief" ? "Brief" : "Deep"} Research Report - ${new Date().toLocaleDateString()}`,
      article_type: "competitor_analysis",
      content_markdown: this.generateMarkdownReport(results, mentionCount, averagePosition, sentimentBreakdown, competitorFrequency),
      summary: `Perplexity research: ${mentionCount}/${results.length} queries mentioned ${this.brand.brand_name}`,
      ai_provider: "perplexity",
      model_used: "llama-3.1-sonar-large-128k-online",
      generation_cost_usd: results.length * 0.005, // ~$0.005 per query
      published: false,
      article_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      console.error("[ResearchOrchestrator] Save error:", error);
    }
  }

  private generateMarkdownReport(
    results: ResearchResult[],
    mentionCount: number,
    averagePosition: number | null,
    sentimentBreakdown: any,
    competitorFrequency: Record<string, number>
  ): string {
    const topCompetitors = Object.entries(competitorFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return `# Perplexity Deep Research Report

## Brand Visibility

- **Mention Rate**: ${mentionCount}/${results.length} queries (${((mentionCount / results.length) * 100).toFixed(1)}%)
- **Average Position**: ${averagePosition ? `#${averagePosition.toFixed(1)}` : "Not ranked"}

## Sentiment Analysis

- ✅ Positive: ${sentimentBreakdown.positive} queries
- ⚪ Neutral: ${sentimentBreakdown.neutral} queries
- ❌ Negative: ${sentimentBreakdown.negative} queries
- ⚫ Not Mentioned: ${sentimentBreakdown.not_mentioned} queries

## Competitive Landscape (Byproduct Data)

Top competitors mentioned:

${topCompetitors.map(([comp, count], i) => `${i + 1}. **${comp}** - ${count} mentions`).join("\n")}

## Key Insights

${results
  .filter((r) => r.key_insights.length > 0)
  .slice(0, 10)
  .map((r) => `- ${r.key_insights[0]}`)
  .join("\n")}

---

*Research Type: Deep Analysis*
*Total Queries: ${results.length}*
*Generated: ${new Date().toLocaleString()}*
`;
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
    // Validate API key
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Perplexity API key not configured" }),
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

    const requestData: PerplexityResearchRequest = await req.json();
    const { brand_id, research_type, focus_channel } = requestData;

    console.log(`[perplexity-research] ${research_type} research for brand: ${brand_id}`);

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

    // Initialize clients
    const perplexityClient = new PerplexityClient(perplexityKey);
    const orchestrator = new ResearchOrchestrator(supabaseClient, perplexityClient, brand);

    // Run research
    let results: ResearchResult[];

    if (research_type === "brief") {
      results = await orchestrator.runBriefResearch();
    } else {
      results = await orchestrator.runDeepResearch(focus_channel);
    }

    // Save results
    await orchestrator.saveResults(results, research_type);

    // Calculate cost
    const costPerQuery = 0.005; // ~$0.005 per Perplexity query
    const totalCost = results.length * costPerQuery;

    console.log(`[perplexity-research] Complete. Processed ${results.length} queries. Cost: $${totalCost.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        success: true,
        brand_id,
        research_type,
        focus_channel: focus_channel || "all",
        queries_processed: results.length,
        brand_mentions: results.filter((r) => r.brand_mentioned).length,
        average_position:
          results.filter((r) => r.brand_position !== null).reduce((sum, r) => sum + (r.brand_position || 0), 0) /
            results.filter((r) => r.brand_position !== null).length || null,
        sentiment_breakdown: {
          positive: results.filter((r) => r.sentiment === "positive").length,
          neutral: results.filter((r) => r.sentiment === "neutral").length,
          negative: results.filter((r) => r.sentiment === "negative").length,
          not_mentioned: results.filter((r) => r.sentiment === "not_mentioned").length,
        },
        cost_usd: parseFloat(totalCost.toFixed(2)),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[perplexity-research] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Perplexity research failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
