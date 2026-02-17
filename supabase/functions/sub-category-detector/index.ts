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

interface SubCategoryDetectionRequest {
  brand_name: string;
  category_id?: string;
  industry?: string; // Fallback if category_id not provided
  brand_id?: string; // Optional: to update the brand record directly
}

interface SubCategoryDetectionResponse {
  success: boolean;
  sub_category_id?: string;
  sub_category_name?: string;
  sub_category_slug?: string;
  confidence: number;
  detection_method: "keyword_match" | "perplexity_ai" | "manual";
  matched_keywords?: string[];
  error?: string;
}

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  keywords: string[];
  description: string;
  active: boolean;
}

interface KeywordMatchResult {
  sub_category: SubCategory;
  matched_keywords: string[];
  confidence: number;
}

// ============================================================================
// KEYWORD MATCHER
// ============================================================================

class KeywordMatcher {
  /**
   * Matches brand name against sub-category keywords
   * Returns the best matching sub-category with confidence score
   */
  static matchBrandToSubCategory(
    brandName: string,
    subCategories: SubCategory[]
  ): KeywordMatchResult | null {
    const normalizedBrandName = brandName.toLowerCase().trim();
    const matches: KeywordMatchResult[] = [];

    for (const subCategory of subCategories) {
      if (!subCategory.active || !subCategory.keywords || subCategory.keywords.length === 0) {
        continue;
      }

      const matchedKeywords: string[] = [];

      // Check each keyword against brand name
      for (const keyword of subCategory.keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim();

        if (normalizedBrandName.includes(normalizedKeyword)) {
          matchedKeywords.push(keyword);
        }
      }

      if (matchedKeywords.length > 0) {
        // Calculate confidence based on:
        // 1. Number of keywords matched
        // 2. Length of matched keywords relative to brand name
        // 3. Total keywords in sub-category
        const matchRatio = matchedKeywords.length / subCategory.keywords.length;
        const coverageRatio = matchedKeywords.reduce((sum, kw) => sum + kw.length, 0) / normalizedBrandName.length;
        const confidence = Math.min(0.5 + (matchRatio * 0.3) + (coverageRatio * 0.2), 1.0);

        matches.push({
          sub_category: subCategory,
          matched_keywords: matchedKeywords,
          confidence: parseFloat(confidence.toFixed(2)),
        });
      }
    }

    if (matches.length === 0) {
      return null;
    }

    // Return the match with highest confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches[0];
  }

  /**
   * Check if confidence is high enough to skip Perplexity
   */
  static isConfidenceHigh(confidence: number): boolean {
    return confidence >= 0.7;
  }
}

// ============================================================================
// PERPLEXITY DETECTOR (Fallback)
// ============================================================================

class PerplexityDetector {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Use Perplexity AI to determine sub-category when keyword matching fails
   */
  async detectSubCategory(
    brandName: string,
    subCategories: SubCategory[]
  ): Promise<{ sub_category: SubCategory; confidence: number } | null> {
    try {
      const subCategoryOptions = subCategories
        .map((sc) => `- ${sc.name} (${sc.description})`)
        .join("\n");

      const prompt = `
Brand Name: "${brandName}"

Based on the brand name, determine which sub-category this brand belongs to from the following options:

${subCategoryOptions}

Analyze the brand name and determine the most appropriate sub-category. Respond ONLY with the exact sub-category name, nothing else.

Example responses:
- "Beverages"
- "Fast Food"
- "Snacks"
`.trim();

      console.log(`[PerplexityDetector] Querying Perplexity for brand: ${brandName}`);

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
              content: "You are a brand categorization expert. Respond only with the exact sub-category name.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PerplexityDetector] API error: ${response.status} - ${errorText}`);
        return null;
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content?.trim() || "";

      console.log(`[PerplexityDetector] Response: ${answer}`);

      // Match the response to one of our sub-categories (fuzzy match)
      const matchedSubCategory = this.findClosestMatch(answer, subCategories);

      if (matchedSubCategory) {
        return {
          sub_category: matchedSubCategory,
          confidence: 0.65, // Perplexity responses get medium-high confidence
        };
      }

      return null;
    } catch (error) {
      console.error("[PerplexityDetector] Error:", error);
      return null;
    }
  }

  /**
   * Find closest matching sub-category from Perplexity response
   */
  private findClosestMatch(response: string, subCategories: SubCategory[]): SubCategory | null {
    const normalizedResponse = response.toLowerCase().trim();

    // Exact match on name
    for (const subCategory of subCategories) {
      if (normalizedResponse.includes(subCategory.name.toLowerCase())) {
        return subCategory;
      }
    }

    // Exact match on slug (underscore to space)
    for (const subCategory of subCategories) {
      const slugWords = subCategory.slug.replace(/_/g, " ");
      if (normalizedResponse.includes(slugWords)) {
        return subCategory;
      }
    }

    // Fuzzy match on keywords
    for (const subCategory of subCategories) {
      for (const keyword of subCategory.keywords) {
        if (normalizedResponse.includes(keyword.toLowerCase())) {
          return subCategory;
        }
      }
    }

    return null;
  }
}

// ============================================================================
// SUB-CATEGORY DETECTOR ORCHESTRATOR
// ============================================================================

class SubCategoryDetectorOrchestrator {
  private supabase: any;
  private perplexityDetector: PerplexityDetector | null;

  constructor(supabase: any, perplexityApiKey?: string) {
    this.supabase = supabase;
    this.perplexityDetector = perplexityApiKey ? new PerplexityDetector(perplexityApiKey) : null;
  }

  /**
   * Main detection flow:
   * 1. Get sub-categories for the category
   * 2. Try keyword matching first
   * 3. If confidence < 0.7, fall back to Perplexity
   * 4. Return result with confidence score
   */
  async detect(request: SubCategoryDetectionRequest): Promise<SubCategoryDetectionResponse> {
    const { brand_name, category_id, industry, brand_id } = request;

    console.log(`[SubCategoryDetector] Detecting sub-category for: ${brand_name}`);

    // Get sub-categories for this category
    const subCategories = await this.getSubCategories(category_id, industry);

    if (subCategories.length === 0) {
      return {
        success: false,
        error: "No sub-categories found for this category",
        confidence: 0,
        detection_method: "keyword_match",
      };
    }

    console.log(`[SubCategoryDetector] Found ${subCategories.length} sub-categories to check`);

    // Step 1: Try keyword matching
    const keywordMatch = KeywordMatcher.matchBrandToSubCategory(brand_name, subCategories);

    if (keywordMatch && KeywordMatcher.isConfidenceHigh(keywordMatch.confidence)) {
      console.log(
        `[SubCategoryDetector] High confidence keyword match: ${keywordMatch.sub_category.name} (${keywordMatch.confidence})`
      );

      // Update brand if brand_id provided
      if (brand_id) {
        await this.updateBrandSubCategory(brand_id, keywordMatch.sub_category.id, keywordMatch.confidence, "keyword_match");
      }

      return {
        success: true,
        sub_category_id: keywordMatch.sub_category.id,
        sub_category_name: keywordMatch.sub_category.name,
        sub_category_slug: keywordMatch.sub_category.slug,
        confidence: keywordMatch.confidence,
        detection_method: "keyword_match",
        matched_keywords: keywordMatch.matched_keywords,
      };
    }

    // Step 2: Fallback to Perplexity if confidence is low
    if (this.perplexityDetector) {
      console.log(
        `[SubCategoryDetector] Low confidence (${keywordMatch?.confidence || 0}), trying Perplexity...`
      );

      const perplexityResult = await this.perplexityDetector.detectSubCategory(brand_name, subCategories);

      if (perplexityResult) {
        console.log(
          `[SubCategoryDetector] Perplexity match: ${perplexityResult.sub_category.name} (${perplexityResult.confidence})`
        );

        // Update brand if brand_id provided
        if (brand_id) {
          await this.updateBrandSubCategory(
            brand_id,
            perplexityResult.sub_category.id,
            perplexityResult.confidence,
            "perplexity_ai"
          );
        }

        return {
          success: true,
          sub_category_id: perplexityResult.sub_category.id,
          sub_category_name: perplexityResult.sub_category.name,
          sub_category_slug: perplexityResult.sub_category.slug,
          confidence: perplexityResult.confidence,
          detection_method: "perplexity_ai",
        };
      }
    }

    // Step 3: Return best keyword match even if confidence is low
    if (keywordMatch) {
      console.log(
        `[SubCategoryDetector] Returning low-confidence keyword match: ${keywordMatch.sub_category.name} (${keywordMatch.confidence})`
      );

      // Update brand if brand_id provided
      if (brand_id) {
        await this.updateBrandSubCategory(brand_id, keywordMatch.sub_category.id, keywordMatch.confidence, "keyword_match");
      }

      return {
        success: true,
        sub_category_id: keywordMatch.sub_category.id,
        sub_category_name: keywordMatch.sub_category.name,
        sub_category_slug: keywordMatch.sub_category.slug,
        confidence: keywordMatch.confidence,
        detection_method: "keyword_match",
        matched_keywords: keywordMatch.matched_keywords,
      };
    }

    // No match found
    return {
      success: false,
      error: "Could not detect sub-category",
      confidence: 0,
      detection_method: "keyword_match",
    };
  }

  /**
   * Get sub-categories from database
   */
  private async getSubCategories(categoryId?: string, industry?: string): Promise<SubCategory[]> {
    try {
      let query = this.supabase.from("gv_sub_categories").select("*").eq("active", true);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else if (industry) {
        // Fallback: try to match industry to category
        // This would need a mapping table or intelligent matching
        console.log(`[SubCategoryDetector] No category_id provided, using industry: ${industry}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[SubCategoryDetector] Error fetching sub-categories:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("[SubCategoryDetector] Exception fetching sub-categories:", error);
      return [];
    }
  }

  /**
   * Update brand with detected sub-category
   */
  private async updateBrandSubCategory(
    brandId: string,
    subCategoryId: string,
    confidence: number,
    method: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("gv_brands")
        .update({
          sub_category_id: subCategoryId,
          sub_category_confidence: confidence,
          sub_category_detected_by: method,
          updated_at: new Date().toISOString(),
        })
        .eq("id", brandId);

      if (error) {
        console.error("[SubCategoryDetector] Error updating brand:", error);
      } else {
        console.log(`[SubCategoryDetector] Updated brand ${brandId} with sub-category ${subCategoryId}`);
      }
    } catch (error) {
      console.error("[SubCategoryDetector] Exception updating brand:", error);
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

    // Validate Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestData: SubCategoryDetectionRequest = await req.json();

    if (!requestData.brand_name) {
      return new Response(JSON.stringify({ success: false, error: "brand_name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize detector
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
    const detector = new SubCategoryDetectorOrchestrator(supabaseClient, perplexityApiKey);

    // Run detection
    const result = await detector.detect(requestData);

    // Calculate cost (only if Perplexity was used)
    const cost = result.detection_method === "perplexity_ai" ? 0.005 : 0;

    console.log(
      `[sub-category-detector] Complete. Method: ${result.detection_method}, Confidence: ${result.confidence}, Cost: $${cost}`
    );

    return new Response(
      JSON.stringify({
        ...result,
        cost_usd: cost,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[sub-category-detector] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Sub-category detection failed",
        confidence: 0,
        detection_method: "keyword_match",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
