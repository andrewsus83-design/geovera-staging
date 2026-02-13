import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// API Keys
const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

// Cost tracking
const API_COSTS = {
  perplexity_sonar_pro: 0.001, // $0.001 per request (estimated for sonar-pro)
};

interface DiscoverRequest {
  category: string;
  article_type: "hot" | "review" | "education" | "nice_to_know";
  count?: number;
}

interface ContentScore {
  content_id: string;
  score: number;
  engagement_rate: number;
  recency_score: number;
  quality_score: number;
}

interface DiscoveryResult {
  topic: string;
  trending_score: number;
  content_ids: string[];
  keywords: string[];
  estimated_reach: number;
  cost_usd: number;
}

/**
 * Query Perplexity for trending topics in a category
 */
async function discoverTrendingTopics(
  category: string,
  articleType: string
): Promise<{ topic: string; keywords: string[]; trending_score: number }> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY not set");
  }

  const prompts = {
    hot: `What is the most trending topic in the ${category} category in Indonesia RIGHT NOW (last 24-48 hours)? Focus on viral moments, breaking news, or trending conversations. Return ONE specific topic.`,
    review: `What product, brand, or service in the ${category} category is getting the most reviews and discussions in Indonesia this week? Focus on newly launched or controversial items.`,
    education: `What is the most searched "how-to" or educational topic in the ${category} category in Indonesia this month? Focus on skills, tutorials, or learning content that people are actively seeking.`,
    nice_to_know: `What interesting insight, fact, or industry knowledge in the ${category} category would Indonesian audiences find valuable to know? Focus on surprising or lesser-known information.`,
  };

  const prompt = prompts[articleType as keyof typeof prompts];

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: "You are a trending topics analyst for Indonesian social media. Return concise, actionable insights. Format your response as JSON: {\"topic\": \"specific topic\", \"keywords\": [\"keyword1\", \"keyword2\", \"keyword3\"], \"trending_score\": 0.85}",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Perplexity API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "{}";

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in Perplexity response");
  }

  try {
    const result = JSON.parse(jsonMatch[0]);
    return {
      topic: result.topic || "Unknown Topic",
      keywords: result.keywords || [],
      trending_score: result.trending_score || 0.5,
    };
  } catch (err) {
    console.error("Failed to parse Perplexity response:", content);
    throw new Error("Invalid JSON response from Perplexity");
  }
}

/**
 * Query creator content with engagement and quality filters
 */
async function findRelevantContent(
  supabase: any,
  category: string,
  keywords: string[],
  count: number = 10
): Promise<ContentScore[]> {
  // Build search conditions for keywords
  const keywordConditions = keywords.map((kw) =>
    `caption.ilike.%${kw}%`
  ).join(",");

  // Query high-engagement, recent content
  const { data: content, error } = await supabase
    .from("gv_creator_content")
    .select(`
      id,
      caption,
      hashtags,
      posted_at,
      likes,
      comments,
      shares,
      reach,
      quality_score,
      originality_score
    `)
    .eq("category", category)
    .or(keywordConditions)
    .gte("posted_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .not("quality_score", "is", null)
    .gte("quality_score", 0.5) // Minimum quality threshold
    .order("posted_at", { ascending: false })
    .limit(50); // Get more candidates to score

  if (error) {
    console.error("Error fetching content:", error);
    throw new Error(`Failed to fetch content: ${error.message}`);
  }

  if (!content || content.length === 0) {
    throw new Error("No relevant content found for the given criteria");
  }

  // Score and rank content
  const now = Date.now();
  const scoredContent: ContentScore[] = content.map((item: any) => {
    // Calculate engagement rate
    const totalEngagement = (item.likes || 0) + (item.comments || 0) + (item.shares || 0);
    const engagement_rate = item.reach > 0 ? totalEngagement / item.reach : 0;

    // Calculate recency score (exponential decay over 30 days)
    const ageMs = now - new Date(item.posted_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recency_score = Math.exp(-ageDays / 15); // Half-life of 15 days

    // Combined quality score
    const quality_score = item.quality_score || 0.5;

    // Final score: engagement × recency × quality
    const score = engagement_rate * recency_score * quality_score;

    return {
      content_id: item.id,
      score,
      engagement_rate,
      recency_score,
      quality_score,
    };
  });

  // Sort by score and return top N
  scoredContent.sort((a, b) => b.score - a.score);
  return scoredContent.slice(0, count);
}

/**
 * Calculate estimated reach from content
 */
async function calculateEstimatedReach(
  supabase: any,
  contentIds: string[]
): Promise<number> {
  const { data, error } = await supabase
    .from("gv_creator_content")
    .select("reach")
    .in("id", contentIds);

  if (error || !data) {
    return 0;
  }

  return data.reduce((sum: number, item: any) => sum + (item.reach || 0), 0);
}

/**
 * Main discovery function
 */
async function discoverContent(
  supabase: any,
  category: string,
  articleType: "hot" | "review" | "education" | "nice_to_know",
  count: number = 10
): Promise<DiscoveryResult> {
  console.log(`Discovering content for category: ${category}, type: ${articleType}`);

  let totalCost = 0;

  // Step 1: Get trending topic from Perplexity
  const trendingData = await discoverTrendingTopics(category, articleType);
  totalCost += API_COSTS.perplexity_sonar_pro;

  console.log(`Discovered trending topic: ${trendingData.topic}`);
  console.log(`Keywords: ${trendingData.keywords.join(", ")}`);

  // Step 2: Find relevant content
  const scoredContent = await findRelevantContent(
    supabase,
    category,
    trendingData.keywords,
    count
  );

  const contentIds = scoredContent.map((item) => item.content_id);
  console.log(`Found ${contentIds.length} relevant content pieces`);

  // Step 3: Calculate estimated reach
  const estimatedReach = await calculateEstimatedReach(supabase, contentIds);

  return {
    topic: trendingData.topic,
    trending_score: trendingData.trending_score,
    content_ids: contentIds,
    keywords: trendingData.keywords,
    estimated_reach: estimatedReach,
    cost_usd: totalCost,
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const body: DiscoverRequest = await req.json();

    if (!body.category || !body.article_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: category, article_type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate article_type
    const validTypes = ["hot", "review", "education", "nice_to_know"];
    if (!validTypes.includes(body.article_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid article_type. Must be: hot, review, education, or nice_to_know" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const count = body.count || 10;

    // Discover content
    const result = await discoverContent(
      supabase,
      body.category,
      body.article_type,
      count
    );

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error discovering content:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to discover content",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
