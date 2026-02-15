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

interface Generate300QARequest {
  brand_id: string;
  force_regenerate?: boolean; // Force regenerate even if already exists this month
}

interface BrandData {
  id: string;
  brand_name: string;
  brand_category: string;
  brand_country: string;
  brand_website: string;
  brand_description: string;
  target_audience: string;
  key_products: string[];
  subscription_tier: string;
}

interface GeneratedQuestion {
  question: string;
  category: string; // 'seo', 'geo', 'social', 'brand', 'competitor', 'market'
  priority: number; // 1-5 (5 = highest)
  search_type: string; // 'google', 'ai_platform', 'social_media'
  expected_answer_contains: string[]; // Keywords we expect in answers
}

// ============================================================================
// CLAUDE CLIENT FOR 300QA GENERATION
// ============================================================================

class ClaudeQAGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate300Questions(brand: BrandData): Promise<GeneratedQuestion[]> {
    console.log(`[ClaudeQAGenerator] Generating 300 questions for: ${brand.brand_name}`);

    const prompt = this.buildPrompt(brand);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 16000,
          temperature: 0.7,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || "";

      console.log(`[ClaudeQAGenerator] Received response, parsing questions...`);

      return this.parseQuestions(content);
    } catch (error) {
      console.error("[ClaudeQAGenerator] Error:", error);
      throw error;
    }
  }

  private buildPrompt(brand: BrandData): string {
    return `You are a brand intelligence strategist. Your task is to generate EXACTLY 300 strategic questions about a brand to be used for monthly market research and competitive intelligence.

**BRAND INFORMATION:**
- Name: ${brand.brand_name}
- Category: ${brand.brand_category}
- Country: ${brand.brand_country}
- Website: ${brand.brand_website}
- Description: ${brand.brand_description || "Not provided"}
- Target Audience: ${brand.target_audience || "General consumers"}
- Key Products: ${brand.key_products?.join(", ") || "Not specified"}

**YOUR TASK:**
Generate EXACTLY 300 questions divided into these categories:

1. **SEO Questions (60 questions)** - Traditional search engine queries
   - "best [product] in [country]"
   - "[brand name] vs [competitor]"
   - "where to buy [product] in [city]"
   - "[product] reviews Indonesia"

2. **GEO Questions (80 questions)** - AI platform queries
   - "what are the top [category] brands in [country]"
   - "recommend [product] for [use case]"
   - "compare [brand] with alternatives"
   - "is [brand] good for [specific need]"

3. **Social Search Questions (60 questions)** - Social media platform queries
   - "[brand name] review" (for TikTok/Instagram)
   - "[product] haul" (for YouTube)
   - "unboxing [brand]" (for all platforms)
   - "[brand] tutorial" (for YouTube/Instagram)

4. **Brand Awareness (40 questions)** - Direct brand queries
   - "[brand name] price"
   - "[brand name] official store"
   - "[brand name] ingredients"
   - "is [brand name] halal/vegan/cruelty-free"

5. **Competitive Intelligence (40 questions)** - Competitor comparison
   - "[brand] vs [competitor A]"
   - "better alternative to [competitor]"
   - "[category] brands like [brand]"
   - "why choose [brand] over [competitor]"

6. **Market Trends (20 questions)** - Industry trends
   - "trending [category] products ${new Date().getFullYear()}"
   - "popular [product] in [country]"
   - "best selling [category] brands"
   - "viral [product] trends"

**CRITICAL RULES:**
1. ALL questions must be about "${brand.brand_name}" or its category
2. Focus on questions that REAL USERS would search
3. Mix of local language (Bahasa Indonesia) and English based on market
4. Include competitor names ONLY in comparison context
5. Questions should help track brand visibility, NOT research competitors deeply
6. Prioritize questions that show purchase intent
7. Include variations (singular/plural, synonyms, misspellings)

**OUTPUT FORMAT (JSON):**
Return EXACTLY 300 questions as a JSON array:

[
  {
    "question": "best organic skincare Indonesia",
    "category": "seo",
    "priority": 4,
    "search_type": "google",
    "expected_answer_contains": ["${brand.brand_name}", "organic", "skincare"]
  },
  {
    "question": "what are the top sustainable beauty brands in Indonesia",
    "category": "geo",
    "priority": 5,
    "search_type": "ai_platform",
    "expected_answer_contains": ["${brand.brand_name}", "sustainable", "beauty"]
  },
  ...
]

**PRIORITY LEVELS:**
- 5 = High commercial intent (ready to buy)
- 4 = Strong consideration (comparing options)
- 3 = Research phase (learning about category)
- 2 = Awareness phase (discovering options)
- 1 = Informational only

Start generating now. Return ONLY the JSON array, no other text.`;
  }

  private parseQuestions(content: string): GeneratedQuestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);

      // Validate we got 300 questions
      if (questions.length < 300) {
        console.warn(
          `[ClaudeQAGenerator] Warning: Only ${questions.length} questions generated, expected 300`
        );
      }

      // Validate structure
      const validQuestions = questions.filter(
        (q) =>
          q.question &&
          q.category &&
          q.priority &&
          q.search_type &&
          Array.isArray(q.expected_answer_contains)
      );

      console.log(`[ClaudeQAGenerator] Parsed ${validQuestions.length} valid questions`);

      return validQuestions;
    } catch (error) {
      console.error("[ClaudeQAGenerator] Parse error:", error);
      throw new Error(`Failed to parse questions: ${error.message}`);
    }
  }
}

// ============================================================================
// QUESTION STORAGE
// ============================================================================

class QuestionStorage {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async saveQuestions(
    brandId: string,
    questions: GeneratedQuestion[],
    generationCost: number
  ): Promise<void> {
    console.log(`[QuestionStorage] Saving ${questions.length} questions for brand ${brandId}`);

    const currentMonth = new Date().toISOString().split("T")[0].substring(0, 7);

    // Store in gv_keywords table with special flag
    const keywordRecords = questions.map((q) => ({
      brand_id: brandId,
      keyword: q.question,
      keyword_type: q.category === "social" ? "social" : q.category === "seo" ? "seo" : "geo",
      source: "ai_suggested",
      suggested_by_ai: "claude",
      priority: q.priority,
      active: true,
      // Store metadata in a separate table or JSONB field
    }));

    // Batch insert (Supabase supports max 1000 per batch)
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < keywordRecords.length; i += batchSize) {
      const batch = keywordRecords.slice(i, i + batchSize);

      const { error } = await this.supabase.from("gv_keywords").upsert(batch, {
        onConflict: "brand_id,keyword,keyword_type",
        ignoreDuplicates: true,
      });

      if (error) {
        console.error(`[QuestionStorage] Batch ${i / batchSize + 1} error:`, error);
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`[QuestionStorage] Inserted ${insertedCount} keywords`);

    // Create metadata record
    await this.createGenerationRecord(brandId, questions.length, generationCost);
  }

  private async createGenerationRecord(
    brandId: string,
    questionCount: number,
    cost: number
  ): Promise<void> {
    const currentMonth = new Date().toISOString().split("T")[0].substring(0, 7) + "-01";

    // Store generation metadata
    const { error } = await this.supabase.from("gv_ai_articles").insert({
      brand_id: brandId,
      title: `300 Questions Generated - ${new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`,
      article_type: "daily_report",
      content_html: `<p>Generated ${questionCount} strategic questions for market research.</p>`,
      content_markdown: `Generated ${questionCount} strategic questions for market research.`,
      summary: `Claude generated ${questionCount} questions for SEO, GEO, and Social tracking.`,
      ai_provider: "claude",
      model_used: "claude-3-5-sonnet-20241022",
      generation_cost_usd: cost,
      published: false,
      article_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      console.error("[QuestionStorage] Generation record error:", error);
    }
  }

  async checkExistingGeneration(brandId: string): Promise<boolean> {
    const currentMonth = new Date().toISOString().split("T")[0].substring(0, 7);

    const { data, error } = await this.supabase
      .from("gv_keywords")
      .select("id")
      .eq("brand_id", brandId)
      .eq("source", "ai_suggested")
      .eq("suggested_by_ai", "claude")
      .gte("created_at", `${currentMonth}-01`)
      .limit(1);

    if (error) {
      console.error("[QuestionStorage] Check existing error:", error);
      return false;
    }

    return data && data.length > 0;
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
    const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!claudeKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Claude API key not configured" }),
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

    const requestData: Generate300QARequest = await req.json();
    const { brand_id, force_regenerate } = requestData;

    console.log(`[generate-300qa] Processing for brand: ${brand_id}`);

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

    // Check if already generated this month
    const storage = new QuestionStorage(supabaseClient);
    const alreadyExists = await storage.checkExistingGeneration(brand_id);

    if (alreadyExists && !force_regenerate) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Questions already generated for this month",
          message: "Use force_regenerate=true to regenerate",
          current_month: new Date().toISOString().split("T")[0].substring(0, 7),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 300 questions
    const generator = new ClaudeQAGenerator(claudeKey);
    const questions = await generator.generate300Questions(brand);

    console.log(`[generate-300qa] Generated ${questions.length} questions`);

    // Calculate cost (Claude Sonnet 3.5: ~$3 per million input tokens, ~$15 per million output tokens)
    // Estimate: ~4000 input tokens, ~12000 output tokens
    const estimatedCost = (4000 * 0.000003) + (12000 * 0.000015);

    // Save to database
    await storage.saveQuestions(brand_id, questions, estimatedCost);

    // Update tier usage
    const currentMonth = new Date().toISOString().split("T")[0].substring(0, 7) + "-01";
    await supabaseClient
      .from("gv_tier_usage")
      .upsert({
        brand_id,
        usage_month: currentMonth,
        total_cost_usd: estimatedCost,
      }, {
        onConflict: "brand_id,usage_month",
      });

    console.log(`[generate-300qa] Complete. Cost: $${estimatedCost.toFixed(4)}`);

    return new Response(
      JSON.stringify({
        success: true,
        brand_id,
        questions_generated: questions.length,
        cost_usd: parseFloat(estimatedCost.toFixed(4)),
        breakdown: {
          seo: questions.filter((q) => q.category === "seo").length,
          geo: questions.filter((q) => q.category === "geo").length,
          social: questions.filter((q) => q.category === "social").length,
          brand: questions.filter((q) => q.category === "brand").length,
          competitor: questions.filter((q) => q.category === "competitor").length,
          market: questions.filter((q) => q.category === "market").length,
        },
        month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-300qa] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate 300 questions",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
