import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Anthropic Claude API configuration
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

// Token costs per 1M tokens (USD) - Claude 3.5 Sonnet
const TOKEN_COSTS = {
  input: 3.00,           // $3 per 1M input tokens
  output: 15.00,         // $15 per 1M output tokens
  cache_write: 3.75,     // $3.75 per 1M cache write tokens
  cache_read: 0.30,      // $0.30 per 1M cache read tokens
};

interface SingleAnalysisRequest {
  content_id: string;
  batch?: never;
  category?: never;
}

interface BatchAnalysisRequest {
  batch: true;
  category: string;
  content_id?: never;
}

type AnalysisRequest = SingleAnalysisRequest | BatchAnalysisRequest;

interface ContentItem {
  id: string;
  platform: string;
  caption: string;
  hashtags: string[];
}

interface ClaudeAnalysisResult {
  originality_score: number;
  quality_score: number;
  brand_mentions: Array<{
    brand: string;
    type: "organic" | "paid";
  }>;
  reasoning: string;
}

interface UsageMetrics {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

// System prompt for Claude analysis (this will be cached)
const SYSTEM_PROMPT = `You are an expert social media content analyst specializing in Indonesian influencer marketing.

Your task is to analyze social media posts and provide objective scores for content quality and originality.

# Scoring Guidelines

## Originality Score (0.0 - 1.0)
- 1.0: Completely original, innovative approach, unique creative direction
- 0.8-0.9: Highly original with fresh perspectives or creative execution
- 0.6-0.7: Some original elements mixed with standard content formats
- 0.4-0.5: Mix of original and template-based content
- 0.2-0.3: Mostly derivative, following trends without unique angle
- 0.0-0.1: Generic, copied, or pure template-based content

## Quality Score (0.0 - 1.0)
- 1.0: Professional production, high engagement potential, compelling narrative
- 0.8-0.9: High quality with strong engagement elements
- 0.6-0.7: Good quality, decent production value
- 0.4-0.5: Moderate quality, acceptable engagement potential
- 0.2-0.3: Low production value, limited engagement potential
- 0.0-0.1: Very poor quality, minimal effort

## Brand Mention Detection
Identify ALL brand mentions in the content:
- "organic": Natural product mentions, authentic recommendations, casual references
- "paid": Sponsored posts, #ad, #sponsored, paid partnerships, clear promotional language

Look for indicators like:
- Paid: "#ad", "#sponsored", "partnership with", "thank you to @brand"
- Organic: Natural integration, casual mentions, product-in-use without emphasis

# Important Context
- Content is from Indonesian creators (100K-2M followers)
- Focus on beauty, fashion, lifestyle, food, tech categories
- All promotional content, giveaways, and pure life updates are already filtered out
- You're analyzing content that represents authentic creator voice

Return your analysis in valid JSON format only.`;

async function analyzeWithClaude(
  content: ContentItem | ContentItem[],
  useCache: boolean = false
): Promise<{ results: ClaudeAnalysisResult[]; usage: UsageMetrics }> {
  const isArray = Array.isArray(content);
  const items = isArray ? content : [content];

  // Build user prompt
  let userPrompt = "";
  if (items.length === 1) {
    const item = items[0];
    userPrompt = `Analyze this social media post:

Platform: ${item.platform}
Caption: ${item.caption || "(no caption)"}
Hashtags: ${item.hashtags.length > 0 ? item.hashtags.join(", ") : "(none)"}

Return JSON in this exact format:
{
  "originality_score": 0.85,
  "quality_score": 0.92,
  "brand_mentions": [
    {"brand": "BrandName", "type": "organic"}
  ],
  "reasoning": "Brief explanation of scores"
}`;
  } else {
    userPrompt = `Analyze these ${items.length} social media posts and return an array of results.

${items.map((item, idx) => `
--- Post ${idx + 1} (ID: ${item.id}) ---
Platform: ${item.platform}
Caption: ${item.caption || "(no caption)"}
Hashtags: ${item.hashtags.length > 0 ? item.hashtags.join(", ") : "(none)"}
`).join("\n")}

Return JSON as an array in this exact format:
[
  {
    "originality_score": 0.85,
    "quality_score": 0.92,
    "brand_mentions": [
      {"brand": "BrandName", "type": "organic"}
    ],
    "reasoning": "Brief explanation"
  },
  ...
]`;
  }

  // Build Claude API request with prompt caching
  const requestBody: any = {
    model: CLAUDE_MODEL,
    max_tokens: isArray ? 4000 : 1000,
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  };

  // Add system prompt with cache control for batch requests
  if (useCache) {
    requestBody.system = [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ];
  } else {
    requestBody.system = SYSTEM_PROMPT;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Claude API error:", errorData);
    throw new Error(`Claude API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const textContent = data.content[0].text;

  // Parse JSON response
  let parsedResults: ClaudeAnalysisResult | ClaudeAnalysisResult[];
  try {
    parsedResults = JSON.parse(textContent);
  } catch (err) {
    console.error("Failed to parse Claude response:", textContent);
    throw new Error("Invalid JSON response from Claude");
  }

  // Normalize to array
  const results = Array.isArray(parsedResults) ? parsedResults : [parsedResults];

  // Extract usage metrics
  const usage: UsageMetrics = {
    input_tokens: data.usage.input_tokens || 0,
    output_tokens: data.usage.output_tokens || 0,
    cache_creation_input_tokens: data.usage.cache_creation_input_tokens || 0,
    cache_read_input_tokens: data.usage.cache_read_input_tokens || 0,
  };

  return { results, usage };
}

function calculateCost(usage: UsageMetrics): number {
  const inputCost = (usage.input_tokens / 1_000_000) * TOKEN_COSTS.input;
  const outputCost = (usage.output_tokens / 1_000_000) * TOKEN_COSTS.output;
  const cacheWriteCost = ((usage.cache_creation_input_tokens || 0) / 1_000_000) * TOKEN_COSTS.cache_write;
  const cacheReadCost = ((usage.cache_read_input_tokens || 0) / 1_000_000) * TOKEN_COSTS.cache_read;

  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

async function processSingleContent(
  supabase: any,
  contentId: string
): Promise<{ success: boolean; content_id: string; analysis: ClaudeAnalysisResult | null; cost_usd: number }> {
  // Fetch content
  const { data: content, error: fetchError } = await supabase
    .from("gv_creator_content")
    .select("id, platform, caption, hashtags, analysis_status")
    .eq("id", contentId)
    .single();

  if (fetchError || !content) {
    throw new Error(`Content not found: ${contentId}`);
  }

  if (content.analysis_status === "completed") {
    return {
      success: true,
      content_id: contentId,
      analysis: null,
      cost_usd: 0,
    };
  }

  // Mark as analyzing
  await supabase
    .from("gv_creator_content")
    .update({ analysis_status: "analyzing" })
    .eq("id", contentId);

  // Analyze with Claude
  const { results, usage } = await analyzeWithClaude({
    id: content.id,
    platform: content.platform,
    caption: content.caption,
    hashtags: content.hashtags || [],
  });

  const analysis = results[0];
  const costUsd = calculateCost(usage);

  // Update database
  await supabase
    .from("gv_creator_content")
    .update({
      originality_score: analysis.originality_score,
      content_quality_score: analysis.quality_score,
      brand_mentions: analysis.brand_mentions,
      analysis_status: "completed",
      analyzed_at: new Date().toISOString(),
    })
    .eq("id", contentId);

  return {
    success: true,
    content_id: contentId,
    analysis,
    cost_usd: costUsd,
  };
}

async function processBatchContent(
  supabase: any,
  category: string
): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  total_cost_usd: number;
  cache_savings_usd: number;
}> {
  // Fetch pending content for category
  const { data: pendingContent, error: fetchError } = await supabase
    .from("gv_creator_content")
    .select(`
      id,
      platform,
      caption,
      hashtags,
      creator_id,
      gv_creators!inner(category)
    `)
    .eq("analysis_status", "pending")
    .eq("gv_creators.category", category)
    .limit(100);

  if (fetchError) {
    throw new Error(`Failed to fetch content: ${fetchError.message}`);
  }

  if (!pendingContent || pendingContent.length === 0) {
    return {
      success: true,
      processed: 0,
      failed: 0,
      total_cost_usd: 0,
      cache_savings_usd: 0,
    };
  }

  console.log(`Processing batch of ${pendingContent.length} posts for category: ${category}`);

  let processed = 0;
  let failed = 0;
  let totalCost = 0;
  let cacheSavings = 0;

  // Process in chunks of 10 to respect rate limits
  const CHUNK_SIZE = 10;
  for (let i = 0; i < pendingContent.length; i += CHUNK_SIZE) {
    const chunk = pendingContent.slice(i, i + CHUNK_SIZE);

    try {
      // Mark all as analyzing
      const chunkIds = chunk.map((c) => c.id);
      await supabase
        .from("gv_creator_content")
        .update({ analysis_status: "analyzing" })
        .in("id", chunkIds);

      // Analyze with Claude (using cache for batch)
      const contentItems = chunk.map((c) => ({
        id: c.id,
        platform: c.platform,
        caption: c.caption || "",
        hashtags: c.hashtags || [],
      }));

      const { results, usage } = await analyzeWithClaude(contentItems, true);
      const costUsd = calculateCost(usage);
      totalCost += costUsd;

      // Calculate cache savings
      if (usage.cache_read_input_tokens && usage.cache_read_input_tokens > 0) {
        const normalCost = (usage.cache_read_input_tokens / 1_000_000) * TOKEN_COSTS.input;
        const cachedCost = (usage.cache_read_input_tokens / 1_000_000) * TOKEN_COSTS.cache_read;
        cacheSavings += (normalCost - cachedCost);
      }

      // Update database with results
      for (let j = 0; j < chunk.length; j++) {
        const content = chunk[j];
        const analysis = results[j];

        await supabase
          .from("gv_creator_content")
          .update({
            originality_score: analysis.originality_score,
            content_quality_score: analysis.quality_score,
            brand_mentions: analysis.brand_mentions,
            analysis_status: "completed",
            analyzed_at: new Date().toISOString(),
          })
          .eq("id", content.id);

        processed++;
      }

      console.log(`Processed chunk ${i / CHUNK_SIZE + 1}: ${chunk.length} posts, $${costUsd.toFixed(4)}`);

      // Rate limiting: wait 1 second between chunks
      if (i + CHUNK_SIZE < pendingContent.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error(`Failed to process chunk:`, err);
      failed += chunk.length;

      // Mark as failed
      const chunkIds = chunk.map((c) => c.id);
      await supabase
        .from("gv_creator_content")
        .update({ analysis_status: "failed" })
        .in("id", chunkIds);
    }
  }

  // Calculate average scores per creator
  const creatorIds = [...new Set(pendingContent.map((c) => c.creator_id))];
  for (const creatorId of creatorIds) {
    const { data: creatorContent } = await supabase
      .from("gv_creator_content")
      .select("content_quality_score, originality_score")
      .eq("creator_id", creatorId)
      .eq("analysis_status", "completed")
      .not("content_quality_score", "is", null);

    if (creatorContent && creatorContent.length > 0) {
      const avgQuality =
        creatorContent.reduce((sum, c) => sum + (c.content_quality_score || 0), 0) / creatorContent.length;
      const avgOriginality =
        creatorContent.reduce((sum, c) => sum + (c.originality_score || 0), 0) / creatorContent.length;

      // This would be stored in gv_creators table if needed
      console.log(`Creator ${creatorId}: Avg Quality=${avgQuality.toFixed(2)}, Avg Originality=${avgOriginality.toFixed(2)}`);
    }
  }

  return {
    success: true,
    processed,
    failed,
    total_cost_usd: totalCost,
    cache_savings_usd: cacheSavings,
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Validate Anthropic API key
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription tier - For batch operations, check user's brand tier
    const { data: userBrands } = await supabase
      .from('user_brands')
      .select('brand_id, role')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (!userBrands) {
      return new Response(
        JSON.stringify({ error: "No brand found for user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: brand } = await supabase
      .from('brands')
      .select('subscription_tier')
      .eq('id', userBrands.brand_id)
      .single();

    if (!brand || brand.subscription_tier !== 'partner') {
      return new Response(
        JSON.stringify({
          error: "Radar feature is only available for Partner tier subscribers",
          current_tier: brand?.subscription_tier || 'none',
          required_tier: 'partner',
          upgrade_url: `${Deno.env.get("FRONTEND_URL") || 'https://geovera.xyz'}/pricing`,
          message: "Upgrade to Partner tier to access advanced Radar analytics"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: AnalysisRequest = await req.json();

    // Route: Single content analysis
    if (body.content_id) {
      const result = await processSingleContent(supabase, body.content_id);

      return new Response(
        JSON.stringify({
          success: true,
          mode: "single",
          result,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Route: Batch content analysis
    if (body.batch && body.category) {
      const result = await processBatchContent(supabase, body.category);

      return new Response(
        JSON.stringify({
          success: true,
          mode: "batch",
          category: body.category,
          result,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Invalid request
    return new Response(
      JSON.stringify({
        error: "Invalid request. Provide either { content_id } or { batch: true, category }",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
