import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Anthropic Claude API configuration
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const CLAUDE_MODEL = "claude-3-5-sonnet-latest";

// Token costs per 1M tokens (USD) - Claude 3.5 Sonnet
const TOKEN_COSTS = {
  input: 3.00,
  output: 15.00,
};

interface LearnRequest {
  category: string;
  sample_size?: number;
  force_relearn?: boolean;
}

interface ContentSample {
  id: string;
  platform: string;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: number;
  engagement_total: number;
  creator_name: string;
  creator_follower_count: number;
}

interface AuthoritySignals {
  keywords: string[];
  content_types: string[];
  quality_indicators: string[];
  engagement_patterns: string[];
}

interface NoiseSignals {
  keywords: string[];
  content_types: string[];
  low_value_patterns: string[];
}

interface FilteringRule {
  rule: string;
  confidence: number;
  applies_to: string;
}

interface ClaudeLearnedPatterns {
  authority_signals: AuthoritySignals;
  noise_signals: NoiseSignals;
  filtering_rules: FilteringRule[];
  key_insights: string[];
  confidence_score: number;
}

interface UsageMetrics {
  input_tokens: number;
  output_tokens: number;
}

// System prompt for brand authority learning
const LEARNING_SYSTEM_PROMPT = `You are an expert social media analyst specializing in identifying brand authority signals in creator content.

Your task is to analyze a sample of social media posts from Indonesian creators (100K-2M followers) and learn what distinguishes HIGH-VALUE brand authority content from LOW-VALUE noise.

# Your Analysis Framework

## BRAND AUTHORITY SIGNALS (Content to Prioritize)
This content builds brand credibility and provides value:
- **Expertise/Thought Leadership**: Industry insights, expert opinions, trend analysis
- **Product Innovation**: New launches, product reviews, comparisons, tutorials
- **Educational Value**: How-to content, tips, guides, problem-solving
- **Authentic Reviews**: Genuine product experiences, detailed reviews, use cases
- **Professional Content**: High production value, detailed captions, informative

## NOISE SIGNALS (Content to Filter Out)
This content is low-value for brand monitoring:
- **Generic Lifestyle**: Daily routines, outfit posts, mood boards without substance
- **Low-Effort Posts**: Single-photo dumps, vague captions, no context
- **Engagement Bait**: "Comment your favorite!", "Tag a friend!", purely viral content
- **Pure Entertainment**: Memes, jokes, dancing without educational value
- **Life Updates**: Personal announcements, travel logs, behind-the-scenes without insights

# What to Extract from the Sample

1. **Keywords & Phrases**: What words/phrases appear in authority content vs noise?
2. **Content Formats**: What post types signal authority? (tutorial, review, vs selfie, vlog)
3. **Quality Indicators**: What makes content high-quality? (caption length, hashtag strategy, etc.)
4. **Engagement Patterns**: Do authority posts have different engagement characteristics?

# Output Requirements

Return a JSON object with:
- Specific, actionable patterns (not generic)
- High-confidence filtering rules (0.7+ confidence only)
- Category-specific insights (what works for this category)
- Clear distinction between authority and noise

Focus on patterns that can be programmatically detected (keywords, formats, engagement metrics).`;

async function learnPatternsWithClaude(
  samples: ContentSample[],
  category: string
): Promise<{ patterns: ClaudeLearnedPatterns; usage: UsageMetrics }> {
  // Build detailed sample analysis prompt
  const userPrompt = `Analyze these ${samples.length} social media posts from ${category} creators and identify patterns that distinguish BRAND AUTHORITY content from NOISE.

# Sample Posts (${samples.length} posts)

${samples.map((sample, idx) => `
--- Post ${idx + 1} (ID: ${sample.id}) ---
Creator: ${sample.creator_name} (${sample.creator_follower_count.toLocaleString()} followers)
Platform: ${sample.platform}
Caption: ${sample.caption || "(no caption)"}
Hashtags: ${sample.hashtags.length > 0 ? sample.hashtags.join(", ") : "(none)"}
Engagement: ${sample.likes} likes, ${sample.comments} comments (Total: ${sample.engagement_total})
`).join("\n")}

# Your Task

Analyze these posts and identify:
1. Which posts demonstrate BRAND AUTHORITY (expertise, innovation, education, authentic reviews)
2. Which posts are NOISE (generic lifestyle, low-effort, engagement bait, entertainment)
3. What patterns distinguish them (keywords, formats, quality indicators)

Return JSON in this EXACT format:
{
  "authority_signals": {
    "keywords": ["tutorial", "review", "how-to", "tips", "guide", ...],
    "content_types": ["product review", "educational", "comparison", "tutorial", ...],
    "quality_indicators": ["detailed caption (>100 words)", "professional photography", "structured content", ...],
    "engagement_patterns": ["high comment-to-like ratio", "saves > likes/10", ...]
  },
  "noise_signals": {
    "keywords": ["mood", "vibes", "random", "ootd", "selfie", ...],
    "content_types": ["outfit post", "daily vlog", "selfie", "meme", ...],
    "low_value_patterns": ["caption <20 words", "no context", "engagement bait language", ...]
  },
  "filtering_rules": [
    {
      "rule": "If caption contains 'tutorial', 'how-to', 'tips', or 'guide' → authority",
      "confidence": 0.95,
      "applies_to": "caption"
    },
    {
      "rule": "If post is product review with detailed comparison → authority",
      "confidence": 0.90,
      "applies_to": "content_type"
    },
    {
      "rule": "If caption <20 words AND no product mention → noise",
      "confidence": 0.85,
      "applies_to": "caption"
    }
  ],
  "key_insights": [
    "In ${category}, authority content typically includes detailed product comparisons",
    "Noise posts often have <20 word captions with generic lifestyle themes",
    "Educational content (how-to, tutorials) consistently shows higher save rates"
  ],
  "confidence_score": 0.85
}

IMPORTANT:
- Only include patterns you see in at least 3+ posts
- Only create rules with 0.70+ confidence
- Be specific to the ${category} category
- Focus on detectable patterns (not subjective quality)`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      temperature: 0.3,
      system: LEARNING_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Claude API error:", errorData);
    throw new Error(`Claude API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const textContent = data.content[0].text;

  // Parse JSON response
  let patterns: ClaudeLearnedPatterns;
  try {
    patterns = JSON.parse(textContent);
  } catch (err) {
    console.error("Failed to parse Claude response:", textContent);
    throw new Error("Invalid JSON response from Claude");
  }

  // Extract usage metrics
  const usage: UsageMetrics = {
    input_tokens: data.usage.input_tokens || 0,
    output_tokens: data.usage.output_tokens || 0,
  };

  return { patterns, usage };
}

function calculateCost(usage: UsageMetrics): number {
  const inputCost = (usage.input_tokens / 1_000_000) * TOKEN_COSTS.input;
  const outputCost = (usage.output_tokens / 1_000_000) * TOKEN_COSTS.output;
  return inputCost + outputCost;
}

async function sampleContentForCategory(
  supabase: any,
  category: string,
  sampleSize: number
): Promise<ContentSample[]> {
  // Get random sample of content from category
  // Strategy: Get diverse content (different creators, platforms, engagement levels)

  const { data: samples, error } = await supabase
    .from("gv_creator_content")
    .select(`
      id,
      platform,
      caption,
      hashtags,
      likes,
      comments,
      engagement_total,
      gv_creators!inner(
        name,
        follower_count,
        category
      )
    `)
    .eq("gv_creators.category", category)
    .eq("is_promo", false)
    .eq("is_giveaway", false)
    .eq("is_life_update", false)
    .not("caption", "is", null)
    .order("RANDOM()")
    .limit(sampleSize);

  if (error) {
    throw new Error(`Failed to sample content: ${error.message}`);
  }

  if (!samples || samples.length === 0) {
    throw new Error(`No content found for category: ${category}`);
  }

  // Transform to ContentSample format
  return samples.map((s: any) => ({
    id: s.id,
    platform: s.platform,
    caption: s.caption || "",
    hashtags: s.hashtags || [],
    likes: s.likes || 0,
    comments: s.comments || 0,
    engagement_total: s.engagement_total || 0,
    creator_name: s.gv_creators.name,
    creator_follower_count: s.gv_creators.follower_count,
  }));
}

async function processLearning(
  supabase: any,
  category: string,
  sampleSize: number,
  forceRelearn: boolean
): Promise<{
  success: boolean;
  patterns: ClaudeLearnedPatterns | null;
  sample_size: number;
  cost_usd: number;
  status: string;
}> {
  // Check if active patterns exist
  if (!forceRelearn) {
    const { data: existingPattern } = await supabase
      .from("gv_brand_authority_patterns")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existingPattern) {
      console.log(`Active patterns exist for ${category}, skipping learning`);
      return {
        success: true,
        patterns: {
          authority_signals: existingPattern.authority_signals,
          noise_signals: existingPattern.noise_signals,
          filtering_rules: existingPattern.filtering_rules,
          key_insights: [],
          confidence_score: existingPattern.confidence_score,
        },
        sample_size: existingPattern.sample_size,
        cost_usd: 0,
        status: "using_existing_patterns",
      };
    }
  }

  console.log(`Learning brand authority patterns for ${category} (sample: ${sampleSize})`);

  // Sample content
  const samples = await sampleContentForCategory(supabase, category, sampleSize);
  console.log(`Sampled ${samples.length} posts for learning`);

  if (samples.length < 10) {
    throw new Error(`Insufficient samples (${samples.length}). Need at least 10 posts.`);
  }

  // Learn patterns with Claude
  const { patterns, usage } = await learnPatternsWithClaude(samples, category);
  const costUsd = calculateCost(usage);

  console.log(`Learned patterns with confidence: ${patterns.confidence_score}`);
  console.log(`Cost: $${costUsd.toFixed(4)}`);

  // Expire old patterns for this category
  if (forceRelearn) {
    await supabase.rpc("expire_old_authority_patterns", { p_category: category });
  }

  // Save learned patterns to database
  const { data: savedPattern, error: saveError } = await supabase
    .from("gv_brand_authority_patterns")
    .insert({
      category,
      authority_signals: patterns.authority_signals,
      noise_signals: patterns.noise_signals,
      filtering_rules: patterns.filtering_rules,
      sample_size: samples.length,
      confidence_score: patterns.confidence_score,
      learned_from_content_ids: samples.map((s) => s.id),
      model_used: CLAUDE_MODEL,
      learning_cost_usd: costUsd,
      is_active: true,
    })
    .select()
    .single();

  if (saveError) {
    console.error("Failed to save patterns:", saveError);
    throw new Error(`Failed to save patterns: ${saveError.message}`);
  }

  console.log(`Patterns saved with ID: ${savedPattern.id}`);

  return {
    success: true,
    patterns,
    sample_size: samples.length,
    cost_usd: costUsd,
    status: "learned_new_patterns",
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
    const body: LearnRequest = await req.json();

    if (!body.category) {
      return new Response(
        JSON.stringify({ error: "Missing required field: category" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const sampleSize = body.sample_size || 20;
    const forceRelearn = body.force_relearn || false;

    // Validate sample size
    if (sampleSize < 10 || sampleSize > 50) {
      return new Response(
        JSON.stringify({ error: "sample_size must be between 10 and 50" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process learning
    const result = await processLearning(supabase, body.category, sampleSize, forceRelearn);

    return new Response(
      JSON.stringify({
        success: true,
        category: body.category,
        result,
        usage_notes: result.status === "using_existing_patterns"
          ? "Using existing patterns. Set force_relearn: true to re-learn."
          : "New patterns learned successfully. Patterns expire in 30 days.",
      }),
      {
        status: 200,
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
