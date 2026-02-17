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

interface QAGeneratorRequest {
  category_id: string;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface QAPair {
  question: string;
  answer: string;
  platform: "seo" | "geo" | "social";
  sub_category?: string;
  keywords: string[];
  quality_score: number;
}

interface PlatformDistribution {
  social: number;  // 600 (40%)
  geo: number;     // 500 (33%)
  seo: number;     // 400 (27%)
}

// ============================================================================
// CLAUDE QA GENERATOR
// ============================================================================

class ClaudeQAGenerator {
  private apiKey: string;
  private supabase: any;

  constructor(apiKey: string, supabase: any) {
    this.apiKey = apiKey;
    this.supabase = supabase;
  }

  async generate1500QAPairs(category: CategoryData): Promise<QAPair[]> {
    console.log(`[ClaudeQAGenerator] Generating 1500 QA pairs for category: ${category.name}`);

    // Get sub-categories for this category
    const { data: subCategories } = await this.supabase
      .from("gv_sub_categories")
      .select("name, slug, keywords")
      .eq("category_id", category.id)
      .eq("active", true);

    const prompt = this.buildPrompt(category, subCategories || []);

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
          max_tokens: 16384,
          temperature: 0.8,
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

      console.log(`[ClaudeQAGenerator] Received response, parsing QA pairs...`);

      return this.parseQAPairs(content);
    } catch (error) {
      console.error("[ClaudeQAGenerator] Error:", error);
      throw error;
    }
  }

  private buildPrompt(category: CategoryData, subCategories: any[]): string {
    const subCatList = subCategories.map(sc => `- ${sc.name} (${sc.slug}): ${sc.keywords?.join(", ")}`).join("\n");

    return `You are a strategic content intelligence expert specializing in SEO, GEO (Generative Engine Optimization), and Social Search. Your task is to generate EXACTLY 1500 high-quality Question-Answer pairs for comprehensive market intelligence.

**CATEGORY INFORMATION:**
- Name: ${category.name}
- Description: ${category.description || "General category"}

**SUB-CATEGORIES:**
${subCatList || "None specified"}

**YOUR TASK:**
Generate EXACTLY 1500 QA pairs distributed across 3 platforms based on user behavior and NLP optimization:

**DISTRIBUTION (Step SEO-5 from SEO_GEO_FIXED_VARIABLE_MODEL.md):**
1. **SOCIAL Questions: 600 QA pairs (40%)** - Visual discovery, engagement-focused
2. **GEO Questions: 500 QA pairs (33%)** - Citation-worthy, authoritative, AI-optimized
3. **SEO Questions: 400 QA pairs (27%)** - Long-form, keyword-optimized, search intent

**PLATFORM BEHAVIOR ANALYSIS:**

**1. SOCIAL (600 QA - 40%)**
**User Behavior:** Visual discovery, quick consumption, engagement-focused, trending content
**NLP Optimization:**
- Viral hooks in questions
- Short-form answers (50-150 words)
- Engagement triggers (emotional, curiosity-driven)
- Visual-ready content
- Trending formats and hashtags

**Question Types:**
- TikTok queries (250 QA): "unboxing X", "X review honest", "X vs Y comparison", "how to use X tutorial"
- Instagram queries (200 QA): "X transformation", "X before after", "best X for Y", "X tips and tricks"
- YouTube queries (150 QA): "X review 2026", "is X worth it", "X full tutorial", "X pros and cons"

**Example Social QA:**
{
  "question": "best skincare routine for oily skin TikTok",
  "answer": "Top TikTok skincare routine for oily skin: 1) Gentle cleanser (CeraVe), 2) BHA toner (Paula's Choice), 3) Niacinamide serum, 4) Oil-free moisturizer, 5) SPF 50 sunscreen. Use AM/PM. Avoid over-washing. Results in 2-4 weeks.",
  "platform": "social",
  "sub_category": "skincare",
  "keywords": ["skincare routine", "oily skin", "tiktok", "viral skincare"],
  "quality_score": 0.92
}

**2. GEO (500 QA - 33%)**
**User Behavior:** AI queries, conversational questions, quick authoritative answers
**NLP Optimization:**
- Citation-worthy facts and statistics
- Authority signals (studies, research, expert quotes)
- Concise, factual answers
- Structured data (lists, comparisons)
- Answer expectations (definitive, authoritative)

**Question Types:**
- Direct category queries (150 QA): "what is the best X", "top X brands", "X comparison"
- Recommendation queries (125 QA): "recommend X for Y", "which X should I buy", "best X for Z"
- Knowledge queries (125 QA): "how does X work", "is X safe", "X ingredients", "X benefits"
- Comparison queries (100 QA): "X vs Y which is better", "difference between X and Y"

**Example GEO QA:**
{
  "question": "what are the best sustainable beauty brands in Indonesia",
  "answer": "Top sustainable beauty brands in Indonesia (2026): 1) Sensatia Botanicals - 100% natural ingredients, zero waste packaging. 2) Luxcrime - cruelty-free, vegan formulas. 3) Base - sustainable sourcing, recyclable packaging. 4) BLP Beauty - clean beauty, eco-conscious. All certified by Indonesian Ecolabel, using biodegradable packaging and ethical sourcing practices.",
  "platform": "geo",
  "sub_category": "skincare",
  "keywords": ["sustainable beauty", "eco-friendly", "indonesia brands", "clean beauty"],
  "quality_score": 0.95
}

**3. SEO (400 QA - 27%)**
**User Behavior:** Information-seeking, detailed research, intent-based searches
**NLP Optimization:**
- Long-form answers (200-400 words)
- Keyword density and semantic relevance
- Search intent alignment (informational, transactional, navigational)
- SEO-optimized structure (headings, lists, bold keywords)
- Comprehensive coverage

**Question Types:**
- Informational queries (150 QA): "how to choose X", "benefits of X", "X guide for beginners"
- Commercial queries (100 QA): "buy X online", "X price comparison", "best X deals"
- Comparison queries (80 QA): "X vs Y detailed comparison", "X alternative", "better than X"
- Local SEO (70 QA): "X Jakarta", "where to buy X in Indonesia", "X near me"

**Example SEO QA:**
{
  "question": "how to choose the best smartphone for photography in 2026",
  "answer": "Choosing the best smartphone for photography requires evaluating 5 key factors: 1) **Sensor Size**: Larger sensors (1/1.3\" or bigger) capture more light for better low-light performance. 2) **Megapixels**: 50MP+ for detailed shots, but sensor quality matters more. 3) **Lens System**: Triple camera setup (wide, ultra-wide, telephoto) offers versatility. 4) **Computational Photography**: AI processing, HDR, night mode capabilities. 5) **Video Features**: 4K 60fps, stabilization, log profiles for professionals. Top picks 2026: iPhone 16 Pro (best overall), Samsung S25 Ultra (zoom), Google Pixel 9 Pro (computational), Sony Xperia Pro (manual controls). Budget options: Nothing Phone 3, Xiaomi 14. Test camera samples before buying.",
  "platform": "seo",
  "sub_category": "smartphones_tablets",
  "keywords": ["best smartphone photography", "camera phone 2026", "smartphone camera comparison"],
  "quality_score": 0.94
}

**CRITICAL DISTRIBUTION RULES:**
✅ EXACTLY 600 Social QA (40%)
✅ EXACTLY 500 GEO QA (33%)
✅ EXACTLY 400 SEO QA (27%)
✅ TOTAL: 1500 QA pairs

**SUB-CATEGORY TAGGING:**
- Analyze question keywords to auto-detect sub-category
- Use sub_category slug if match found
- Leave null if general category question

**QUALITY SCORE CALCULATION (0.00-1.00):**
- Answer completeness: 30%
- Factual accuracy: 25%
- Platform optimization: 20%
- Keyword relevance: 15%
- User value: 10%

**KEYWORDS EXTRACTION:**
- Extract 3-7 relevant keywords per QA pair
- Include platform-specific keywords
- Mix short-tail and long-tail keywords

**OUTPUT FORMAT (JSON):**
Return EXACTLY 1500 QA pairs as a JSON array:

[
  {
    "question": "string",
    "answer": "string",
    "platform": "social" | "geo" | "seo",
    "sub_category": "string or null",
    "keywords": ["keyword1", "keyword2", ...],
    "quality_score": 0.95
  },
  ... (1499 more)
]

**QUALITY STANDARDS:**
✅ Realistic questions (real users would search this)
✅ Comprehensive answers (platform-appropriate length)
✅ Platform-optimized (NLP techniques per platform)
✅ Sub-category tagged (where applicable)
✅ High-quality keywords (relevant, varied)
✅ Diverse coverage (all aspects of category)
✅ Current and accurate (2026 context)

Start generating now. Return ONLY the JSON array, no explanations.`;
  }

  private parseQAPairs(content: string): QAPair[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const qaPairs: QAPair[] = JSON.parse(jsonMatch[0]);

      console.log(`[ClaudeQAGenerator] Parsed ${qaPairs.length} QA pairs (target: 1500)`);

      if (qaPairs.length < 1400) {
        console.warn(
          `[ClaudeQAGenerator] Warning: Only ${qaPairs.length} QA pairs generated, expected 1500`
        );
      }

      // Validate structure
      const validQAPairs = qaPairs.filter(
        (qa) =>
          qa.question &&
          qa.answer &&
          qa.platform &&
          ["seo", "geo", "social"].includes(qa.platform) &&
          Array.isArray(qa.keywords) &&
          typeof qa.quality_score === "number"
      );

      console.log(`[ClaudeQAGenerator] ${validQAPairs.length} valid QA pairs after validation`);

      return validQAPairs;
    } catch (error) {
      console.error("[ClaudeQAGenerator] Parse error:", error);
      throw new Error(`Failed to parse QA pairs: ${error.message}`);
    }
  }
}

// ============================================================================
// QA STORAGE
// ============================================================================

class QAStorage {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async saveQAPairs(
    categoryId: string,
    qaPairs: QAPair[]
  ): Promise<void> {
    console.log(`[QAStorage] Saving ${qaPairs.length} QA pairs for category ${categoryId}`);

    // Calculate expiry (30 days from now for monthly regeneration)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Prepare records
    const records = qaPairs.map((qa) => ({
      category_id: categoryId,
      question: qa.question,
      answer: qa.answer,
      platform: qa.platform,
      sub_category: qa.sub_category || null,
      keywords: qa.keywords,
      quality_score: qa.quality_score,
      used_count: 0,
      expires_at: expiresAt.toISOString(),
    }));

    // Batch insert (max 1000 per batch in Supabase)
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const { error } = await this.supabase
        .from("gv_qa_pairs")
        .insert(batch);

      if (error) {
        console.error(`[QAStorage] Batch ${Math.floor(i / batchSize) + 1} error:`, error);
        throw error;
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`[QAStorage] Successfully inserted ${insertedCount} QA pairs`);
  }

  async checkExistingQA(categoryId: string): Promise<number> {
    // Check for non-expired QA pairs
    const { count, error } = await this.supabase
      .from("gv_qa_pairs")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .gt("expires_at", new Date().toISOString());

    if (error) {
      console.error("[QAStorage] Check existing error:", error);
      return 0;
    }

    return count || 0;
  }

  async deleteExpiredQA(categoryId: string): Promise<void> {
    const { error } = await this.supabase
      .from("gv_qa_pairs")
      .delete()
      .eq("category_id", categoryId)
      .lt("expires_at", new Date().toISOString());

    if (error) {
      console.error("[QAStorage] Delete expired error:", error);
    } else {
      console.log("[QAStorage] Deleted expired QA pairs");
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

    const requestData: QAGeneratorRequest = await req.json();
    const { category_id } = requestData;

    if (!category_id) {
      return new Response(
        JSON.stringify({ error: "category_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[qa-generator] Processing for category: ${category_id}`);

    // Get category data
    const { data: category, error: categoryError } = await supabaseClient
      .from("gv_categories")
      .select("*")
      .eq("id", category_id)
      .single();

    if (categoryError || !category) {
      return new Response(
        JSON.stringify({ error: "Category not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const storage = new QAStorage(supabaseClient);

    // Check for existing QA pairs
    const existingCount = await storage.checkExistingQA(category_id);
    if (existingCount > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Category already has ${existingCount} active QA pairs`,
          message: "QA pairs are valid for 30 days. Wait for expiration or delete manually.",
          existing_count: existingCount,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete any expired QA pairs
    await storage.deleteExpiredQA(category_id);

    // Generate 1500 QA pairs
    const generator = new ClaudeQAGenerator(claudeKey, supabaseClient);
    const qaPairs = await generator.generate1500QAPairs(category);

    console.log(`[qa-generator] Generated ${qaPairs.length} QA pairs`);

    // Calculate distribution
    const distribution: PlatformDistribution = {
      social: qaPairs.filter((qa) => qa.platform === "social").length,
      geo: qaPairs.filter((qa) => qa.platform === "geo").length,
      seo: qaPairs.filter((qa) => qa.platform === "seo").length,
    };

    // Save to database
    await storage.saveQAPairs(category_id, qaPairs);

    // Calculate cost (Claude Sonnet 3.5: ~$3 per million input, ~$15 per million output)
    // Estimate for 1500 QA: ~10000 input tokens, ~30000 output tokens
    const estimatedCost = (10000 * 0.000003) + (30000 * 0.000015);

    console.log(`[qa-generator] Complete. Cost: $${estimatedCost.toFixed(4)}`);

    return new Response(
      JSON.stringify({
        success: true,
        category_id,
        category_name: category.name,
        qa_pairs_generated: qaPairs.length,
        distribution: {
          social: `${distribution.social} (${((distribution.social / qaPairs.length) * 100).toFixed(1)}%)`,
          geo: `${distribution.geo} (${((distribution.geo / qaPairs.length) * 100).toFixed(1)}%)`,
          seo: `${distribution.seo} (${((distribution.seo / qaPairs.length) * 100).toFixed(1)}%)`,
        },
        target_distribution: {
          social: "600 (40%)",
          geo: "500 (33%)",
          seo: "400 (27%)",
        },
        cost_usd: parseFloat(estimatedCost.toFixed(4)),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[qa-generator] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate 1500 QA pairs",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
