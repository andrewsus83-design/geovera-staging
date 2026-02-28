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

interface Generate500QARequest {
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
  category: string; // 'seo', 'geo', 'social', 'brand', 'competitor', 'market', 'content', 'technical'
  priority: number; // 1-5 (5 = highest)
  impact_score: number; // 1-100 (estimated business impact)
  search_type: string; // 'google', 'ai_platform', 'social_media'
  expected_answer_contains: string[]; // Keywords we expect in answers
  difficulty: string; // 'easy', 'medium', 'hard' (ranking difficulty)
}

// ============================================================================
// CLAUDE CLIENT FOR 500QA GENERATION
// ============================================================================

class ClaudeQAGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate500Questions(brand: BrandData): Promise<GeneratedQuestion[]> {
    console.log(`[ClaudeQAGenerator] Generating 500 DEEP questions for: ${brand.brand_name}`);

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
          model: "claude-3-5-sonnet-latest",
          max_tokens: 16384, // Max output for deeper analysis
          temperature: 0.8, // Higher creativity for variety
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
    return `You are an advanced brand intelligence strategist with deep expertise in SEO, GEO, and Social Search. Your task is to generate EXACTLY 500 strategic, high-impact questions for comprehensive monthly market research.

**BRAND INFORMATION:**
- Name: ${brand.brand_name}
- Category: ${brand.brand_category}
- Country: ${brand.brand_country}
- Website: ${brand.brand_website}
- Description: ${brand.brand_description || "Not provided"}
- Target Audience: ${brand.target_audience || "General consumers"}
- Key Products: ${brand.key_products?.join(", ") || "Not specified"}

**YOUR TASK:**
Generate EXACTLY 500 questions divided into these categories:

1. **SEO Questions (100 questions)** - Traditional search engine optimization
   - Commercial intent queries (20): "buy [product]", "price [product]", "[product] near me"
   - Informational queries (30): "how to [use product]", "benefits of [product]"
   - Comparison queries (25): "[brand] vs [competitor]", "best [category] brands"
   - Local SEO (15): "[product] Jakarta", "toko [brand] Surabaya"
   - Long-tail keywords (10): Very specific, low competition queries

2. **GEO Questions (120 questions)** - AI platform optimization (EXPANDED for deeper AI insights)
   - Direct brand queries (25): "what is ${brand.brand_name}", "tell me about ${brand.brand_name}"
   - Recommendation queries (30): "recommend [product] for [use case]", "best [category] brands"
   - Comparison queries (25): "compare ${brand.brand_name} with [competitor]"
   - Use case queries (20): "which [product] for [specific need]"
   - Knowledge queries (20): "[ingredient] in ${brand.brand_name}", "is ${brand.brand_name} safe"

3. **Social Search Questions (100 questions)** - Social media platform queries
   - TikTok queries (35): "[brand] review", "unboxing [product]", "[brand] haul", trending formats
   - Instagram queries (30): "[product] tutorial", "[brand] transformation", Reels ideas
   - YouTube queries (35): "[product] review indonesia", "cara pakai [product]", long-form content

4. **Brand Awareness (60 questions)** - Direct brand visibility
   - Product queries (20): "[brand] products", "[brand] best sellers", "[brand] new launch"
   - Information queries (20): "[brand] ingredients", "[brand] halal certified", "[brand] price list"
   - Store queries (10): "[brand] official store", "where to buy [brand]", "[brand] distributor"
   - Corporate queries (10): "[brand] founder", "[brand] sustainability", "[brand] awards"

5. **Competitive Intelligence (60 questions)** - Market positioning (byproduct data)
   - Direct comparison (20): "${brand.brand_name} vs [competitor A]", "better than [competitor]"
   - Alternative seeking (20): "alternative to [competitor]", "similar to [competitor]"
   - Category leaders (10): "top [category] brands", "best [category] ${brand.brand_country}"
   - Market gaps (10): "affordable [category]", "premium [category]", "natural [category]"

6. **Market Trends (30 questions)** - Industry intelligence
   - Trending topics (10): "trending [category] ${new Date().getFullYear()}", "viral [product]"
   - Seasonal trends (10): "[category] musim hujan", "[product] lebaran", holiday queries
   - Emerging trends (10): "new [category] trends", "[category] innovation"

7. **Content Strategy (20 questions)** - Content opportunities
   - Tutorial content (7): "how to use [product]", "cara aplikasi [product]"
   - Problem-solving (7): "[problem] solution", "best [product] for [issue]"
   - Educational (6): "benefits of [ingredient]", "why [product] works"

8. **Technical SEO (10 questions)** - Technical optimization
   - Schema markup queries (3): Questions that trigger rich snippets
   - Featured snippet targets (4): Questions with featured snippet opportunities
   - Voice search (3): Conversational, question-based queries

**CRITICAL RULES:**
1. ALL 500 questions MUST be about "${brand.brand_name}" or its category
2. Focus on questions REAL USERS would search (based on search intent data)
3. Mix Bahasa Indonesia (60%) and English (40%) based on ${brand.brand_country} market
4. Include competitor names ONLY in comparison context (byproduct model)
5. Prioritize HIGH COMMERCIAL INTENT and HIGH IMPACT questions
6. Include keyword variations (singular/plural, synonyms, common misspellings)
7. Cover the ENTIRE customer journey (awareness → consideration → purchase → loyalty)
8. Think like a customer, not a marketer

**IMPACT SCORE CALCULATION:**
Rate business impact (1-100) based on:
- Commercial intent (ready to buy = 100, informational = 20)
- Search volume potential (high volume = +20, low volume = +5)
- Conversion potential (direct purchase intent = +30)
- Brand visibility (brand mention in SERP = +10)

**DIFFICULTY RATING:**
- easy: Low competition, long-tail, specific queries
- medium: Moderate competition, mid-tail queries
- hard: High competition, head terms, broad queries

**OUTPUT FORMAT (JSON):**
Return EXACTLY 500 questions as a JSON array:

[
  {
    "question": "beli skincare organic murah Jakarta",
    "category": "seo",
    "priority": 5,
    "impact_score": 95,
    "search_type": "google",
    "expected_answer_contains": ["${brand.brand_name}", "organic", "skincare", "Jakarta"],
    "difficulty": "medium"
  },
  {
    "question": "what are the top sustainable beauty brands in Indonesia",
    "category": "geo",
    "priority": 4,
    "impact_score": 85,
    "search_type": "ai_platform",
    "expected_answer_contains": ["${brand.brand_name}", "sustainable", "beauty"],
    "difficulty": "hard"
  },
  {
    "question": "${brand.brand_name} skincare review honest",
    "category": "social",
    "priority": 5,
    "impact_score": 90,
    "search_type": "social_media",
    "expected_answer_contains": ["${brand.brand_name}", "review", "honest"],
    "difficulty": "easy"
  },
  ... (497 more questions)
]

**PRIORITY LEVELS:**
- 5 = Highest (ready to buy, strong commercial intent)
- 4 = High (comparing options, strong consideration)
- 3 = Medium (research phase, learning)
- 2 = Low (awareness phase, discovering)
- 1 = Informational only

**QUALITY STANDARDS:**
✅ Each question must be realistic (real users would search this)
✅ Questions should be diverse (avoid repetition)
✅ Cover all customer touchpoints (online, offline, social, search)
✅ Include local context (Indonesian market specifics)
✅ Think DEEP: what would customers REALLY want to know?

Start generating now. Return ONLY the JSON array, no explanations or other text.`;
  }

  private parseQuestions(content: string): GeneratedQuestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);

      // Validate we got 500 questions
      console.log(`[ClaudeQAGenerator] Parsed ${questions.length} questions (target: 500)`);

      if (questions.length < 450) {
        console.warn(
          `[ClaudeQAGenerator] Warning: Only ${questions.length} questions generated, expected 500`
        );
      }

      // Validate structure
      const validQuestions = questions.filter(
        (q) =>
          q.question &&
          q.category &&
          q.priority &&
          q.impact_score &&
          q.search_type &&
          Array.isArray(q.expected_answer_contains)
      );

      console.log(`[ClaudeQAGenerator] ${validQuestions.length} valid questions after validation`);

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

    // Store in gv_keywords table
    const keywordRecords = questions.map((q) => ({
      brand_id: brandId,
      keyword: q.question,
      keyword_type: q.category === "social" ? "social" : q.category === "seo" ? "seo" : "geo",
      source: "ai_suggested",
      suggested_by_ai: "claude_500qa",
      priority: q.priority,
      active: true,
      impact_score: q.impact_score, // New field for impact scoring
      difficulty: q.difficulty, // New field for difficulty rating
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
    // Store generation metadata
    const { error } = await this.supabase.from("gv_ai_articles").insert({
      brand_id: brandId,
      title: `500 Deep Questions Generated - ${new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`,
      article_type: "daily_report",
      content_html: `<p>Generated ${questionCount} strategic deep-dive questions for comprehensive market research.</p>`,
      content_markdown: `Generated ${questionCount} strategic questions covering SEO, GEO, Social, and Market Intelligence.`,
      summary: `Claude generated ${questionCount} high-impact questions with priority and impact scoring.`,
      ai_provider: "claude",
      model_used: "claude-3-5-sonnet-latest",
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
      .eq("suggested_by_ai", "claude_500qa")
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

    const requestData: Generate500QARequest = await req.json();
    const { brand_id, force_regenerate } = requestData;

    console.log(`[generate-500qa] Processing for brand: ${brand_id}`);

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
          error: "500 questions already generated for this month",
          message: "Use force_regenerate=true to regenerate",
          current_month: new Date().toISOString().split("T")[0].substring(0, 7),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 500 questions
    const generator = new ClaudeQAGenerator(claudeKey);
    const questions = await generator.generate500Questions(brand);

    console.log(`[generate-500qa] Generated ${questions.length} questions`);

    // Calculate cost (Claude Sonnet 3.5: ~$3 per million input tokens, ~$15 per million output tokens)
    // Estimate for 500 questions: ~6000 input tokens, ~20000 output tokens
    const estimatedCost = (6000 * 0.000003) + (20000 * 0.000015);

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

    console.log(`[generate-500qa] Complete. Cost: $${estimatedCost.toFixed(4)}`);

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
          content: questions.filter((q) => q.category === "content").length,
          technical: questions.filter((q) => q.category === "technical").length,
        },
        month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-500qa] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate 500 questions",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
