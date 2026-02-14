# 🛠️ COST OPTIMIZATION IMPLEMENTATION GUIDE

**Date:** February 14, 2026
**Purpose:** Step-by-step implementation guide with code examples
**Target:** 33% cost reduction ($338/month savings)

---

## 📋 TABLE OF CONTENTS

1. [Phase 1: Quick Wins (Week 1)](#phase-1-quick-wins)
2. [Phase 2: Intelligent Scraping (Week 2-3)](#phase-2-intelligent-scraping)
3. [Phase 3: Advanced Caching (Week 4)](#phase-3-advanced-caching)
4. [Testing & Validation](#testing--validation)
5. [Monitoring & Rollback](#monitoring--rollback)

---

## 🚀 PHASE 1: QUICK WINS (Week 1)

**Target Savings:** $147/month
**Implementation Time:** 6 hours
**Risk Level:** LOW

### 1.1 Perplexity Model Routing ($60/month savings)

**File:** `/supabase/functions/hub-discover-content/index.ts`

**Current Code (Lines 60-82):**
```typescript
const response = await fetch("https://api.perplexity.ai/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
  },
  body: JSON.stringify({
    model: "sonar-pro", // ❌ Always using expensive model
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
```

**NEW OPTIMIZED CODE:**
```typescript
// Add model selection helper
function selectPerplexityModel(articleType: "hot" | "review" | "education" | "nice_to_know"): {
  model: string;
  maxTokens: number;
  estimatedCost: number;
} {
  const modelConfig = {
    hot: {
      model: "llama-3.1-sonar-small-128k-online",
      maxTokens: 400,
      estimatedCost: 0.001,
      reason: "Need real-time data, but simple queries"
    },
    review: {
      model: "sonar-pro",
      maxTokens: 500,
      estimatedCost: 0.001,
      reason: "Need deep analysis for product comparisons"
    },
    education: {
      model: "llama-3.1-sonar-small-128k-online",
      maxTokens: 300,
      estimatedCost: 0.0005,
      reason: "How-to queries are straightforward"
    },
    nice_to_know: {
      model: "llama-3.1-sonar-small-128k-online",
      maxTokens: 300,
      estimatedCost: 0.0005,
      reason: "Simple fact-finding queries"
    }
  };

  return modelConfig[articleType];
}

// Update API call
async function discoverTrendingTopics(
  category: string,
  articleType: "hot" | "review" | "education" | "nice_to_know"
): Promise<{ topic: string; keywords: string[]; trending_score: number }> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY not set");
  }

  // ⚡ NEW: Select appropriate model
  const config = selectPerplexityModel(articleType);

  console.log(`[Perplexity] Using ${config.model} for ${articleType} (estimated: $${config.estimatedCost})`);

  const prompts = {
    hot: `What is the most trending topic in the ${category} category in Indonesia RIGHT NOW (last 24-48 hours)? Focus on viral moments, breaking news, or trending conversations. Return ONE specific topic.`,
    review: `What product, brand, or service in the ${category} category is getting the most reviews and discussions in Indonesia this week? Focus on newly launched or controversial items.`,
    education: `What is the most searched "how-to" or educational topic in the ${category} category in Indonesia this month? Focus on skills, tutorials, or learning content that people are actively seeking.`,
    nice_to_know: `What interesting insight, fact, or industry knowledge in the ${category} category would Indonesian audiences find valuable to know? Focus on surprising or lesser-known information.`,
  };

  const prompt = prompts[articleType];

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: config.model, // ✅ Dynamic model selection
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
      max_tokens: config.maxTokens, // ✅ Optimized token limit
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
```

**Testing:**
```bash
# Test with different article types
curl -X POST https://your-project.supabase.co/functions/v1/hub-discover-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "article_type": "hot",
    "count": 10
  }'

# Should log: "Using llama-3.1-sonar-small-128k-online for hot (estimated: $0.001)"

curl -X POST https://your-project.supabase.co/functions/v1/hub-discover-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "article_type": "education",
    "count": 10
  }'

# Should log: "Using llama-3.1-sonar-small-128k-online for education (estimated: $0.0005)"
```

---

### 1.2 Claude Cache Optimization ($52/month savings)

**File:** `/supabase/functions/radar-analyze-content/index.ts`

**ISSUE 1: Dynamic timestamps in system prompt prevent caching**

**Current Code (Lines 61-98):**
```typescript
const SYSTEM_PROMPT = `You are an expert social media content analyst specializing in Indonesian influencer marketing.

Your task is to analyze social media posts and provide objective scores for content quality and originality.

# Scoring Guidelines
...`;
```

**This is actually GOOD!** ✅ No timestamps in prompt. But let's improve caching further:

**OPTIMIZATION: Pre-warm cache at start of processing**

**Add to file (after imports):**
```typescript
// Cache warming function
async function prewarmClaudeCache(): Promise<void> {
  console.log('[Cache] Pre-warming Claude cache for all categories...');

  const categories = ["beauty", "fashion", "food", "tech", "lifestyle", "health"];

  for (const category of categories) {
    try {
      // Get 2 sample posts from this category (already analyzed)
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: samplePosts } = await supabase
        .from("gv_creator_content")
        .select(`
          id, platform, caption, hashtags,
          gv_creators!inner(category)
        `)
        .eq("gv_creators.category", category)
        .eq("analysis_status", "completed")
        .limit(2);

      if (samplePosts && samplePosts.length > 0) {
        const contentItems = samplePosts.map(p => ({
          id: p.id,
          platform: p.platform,
          caption: p.caption || "",
          hashtags: p.hashtags || []
        }));

        // Make dummy request to warm cache
        const { results, usage } = await analyzeWithClaude(contentItems, true);
        console.log(`[Cache] Warmed ${category}: ${usage.cache_creation_input_tokens} tokens cached`);
      }
    } catch (err) {
      console.error(`[Cache] Failed to warm ${category}:`, err);
      // Continue with other categories
    }
  }

  console.log('[Cache] Pre-warming complete!');
}
```

**OPTIMIZATION: Batch by category for better cache locality**

**Current Code (Lines 288-402):**
```typescript
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

  // ... rest of function
}
```

**This is GOOD!** ✅ Already batching by category. But let's add cache warming:

**Add at start of batch processing:**
```typescript
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
  // ⚡ NEW: Pre-warm cache if this is first batch of the day
  const lastWarmKey = `cache_warm:${category}:${new Date().toISOString().split('T')[0]}`;
  const { data: warmCheck } = await supabase
    .from('gv_cache_metadata')
    .select('key')
    .eq('key', lastWarmKey)
    .single();

  if (!warmCheck) {
    console.log(`[Cache] First batch of day for ${category}, warming cache...`);
    await prewarmClaudeCache(); // Warm for all categories

    // Mark as warmed for today
    await supabase
      .from('gv_cache_metadata')
      .insert({
        key: lastWarmKey,
        value: { warmed_at: new Date().toISOString() },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
  }

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

  // ... rest of function unchanged
}
```

**Database Migration for cache metadata:**
```sql
-- File: supabase/migrations/20260214000000_cache_metadata.sql
CREATE TABLE IF NOT EXISTS gv_cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_cache_metadata_key ON gv_cache_metadata(key);
CREATE INDEX idx_cache_metadata_expires ON gv_cache_metadata(expires_at);

COMMENT ON TABLE gv_cache_metadata IS 'Cache metadata and warming status';
```

---

### 1.3 Skip Re-Analysis ($35/month savings)

**File:** `/supabase/functions/radar-analyze-content/index.ts`

**Current Code (Lines 227-286):**
```typescript
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

  // ... continue with analysis
}
```

**OPTIMIZATION: Also check for existing quality scores**

**Updated Code:**
```typescript
async function processSingleContent(
  supabase: any,
  contentId: string
): Promise<{
    success: boolean;
    content_id: string;
    analysis: ClaudeAnalysisResult | null;
    cost_usd: number;
    skipped: boolean;
    skip_reason?: string;
  }> {
  // Fetch content with scores
  const { data: content, error: fetchError } = await supabase
    .from("gv_creator_content")
    .select("id, platform, caption, hashtags, analysis_status, content_quality_score, originality_score")
    .eq("id", contentId)
    .single();

  if (fetchError || !content) {
    throw new Error(`Content not found: ${contentId}`);
  }

  // ✅ OPTIMIZATION 1: Check if already completed
  if (content.analysis_status === "completed") {
    console.log(`[Skip] Content ${contentId} already analyzed (status: completed)`);
    return {
      success: true,
      content_id: contentId,
      analysis: null,
      cost_usd: 0,
      skipped: true,
      skip_reason: "already_completed"
    };
  }

  // ⚡ NEW OPTIMIZATION 2: Check if scores already exist (duplicate posts)
  if (
    content.content_quality_score !== null &&
    content.originality_score !== null &&
    content.content_quality_score > 0
  ) {
    console.log(`[Skip] Content ${contentId} has existing scores (quality: ${content.content_quality_score}, originality: ${content.originality_score})`);

    // Mark as completed if not already
    if (content.analysis_status !== "completed") {
      await supabase
        .from("gv_creator_content")
        .update({
          analysis_status: "completed",
          analyzed_at: new Date().toISOString()
        })
        .eq("id", contentId);
    }

    return {
      success: true,
      content_id: contentId,
      analysis: null,
      cost_usd: 0,
      skipped: true,
      skip_reason: "has_existing_scores"
    };
  }

  // ⚡ NEW OPTIMIZATION 3: Check if duplicate post_id (same content, different scrape)
  const { data: duplicates } = await supabase
    .from("gv_creator_content")
    .select("id, content_quality_score, originality_score, brand_mentions")
    .eq("post_id", content.post_id)
    .eq("platform", content.platform)
    .neq("id", contentId)
    .eq("analysis_status", "completed")
    .not("content_quality_score", "is", null)
    .limit(1);

  if (duplicates && duplicates.length > 0) {
    const source = duplicates[0];
    console.log(`[Skip] Found duplicate post ${content.post_id}, copying scores from ${source.id}`);

    // Copy scores from duplicate
    await supabase
      .from("gv_creator_content")
      .update({
        content_quality_score: source.content_quality_score,
        originality_score: source.originality_score,
        brand_mentions: source.brand_mentions,
        analysis_status: "completed",
        analyzed_at: new Date().toISOString()
      })
      .eq("id", contentId);

    return {
      success: true,
      content_id: contentId,
      analysis: null,
      cost_usd: 0,
      skipped: true,
      skip_reason: "duplicate_post"
    };
  }

  // No skip conditions met, proceed with analysis
  console.log(`[Analyze] Processing new content ${contentId}`);

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
    skipped: false
  };
}
```

**Testing:**
```bash
# Test skip logic
# 1. Analyze a post
curl -X POST https://your-project.supabase.co/functions/v1/radar-analyze-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content_id": "POST_ID_1"}'

# Should: Analyze and return cost

# 2. Try to analyze same post again
curl -X POST https://your-project.supabase.co/functions/v1/radar-analyze-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content_id": "POST_ID_1"}'

# Should: Skip with reason "already_completed", cost $0
```

---

## 🎯 PHASE 2: INTELLIGENT SCRAPING (Week 2-3)

**Target Savings:** $178/month
**Implementation Time:** 11 hours
**Risk Level:** MEDIUM

### 2.1 Creator Tier System ($164/month savings)

**Database Migration:**

```sql
-- File: supabase/migrations/20260214010000_creator_tiers.sql

-- Add tier fields to gv_creators
ALTER TABLE gv_creators ADD COLUMN IF NOT EXISTS scrape_tier INTEGER DEFAULT 2 CHECK (scrape_tier IN (1, 2, 3));
ALTER TABLE gv_creators ADD COLUMN IF NOT EXISTS scrape_frequency_days INTEGER DEFAULT 14;
ALTER TABLE gv_creators ADD COLUMN IF NOT EXISTS next_scrape_date TIMESTAMPTZ DEFAULT now();
ALTER TABLE gv_creators ADD COLUMN IF NOT EXISTS tier_calculated_at TIMESTAMPTZ;
ALTER TABLE gv_creators ADD COLUMN IF NOT EXISTS avg_quality_score NUMERIC(3,2);
ALTER TABLE gv_creators ADD COLUMN IF NOT EXISTS avg_originality_score NUMERIC(3,2);

CREATE INDEX idx_creators_next_scrape ON gv_creators(next_scrape_date) WHERE is_active = true;
CREATE INDEX idx_creators_tier ON gv_creators(scrape_tier, next_scrape_date);

COMMENT ON COLUMN gv_creators.scrape_tier IS 'Creator performance tier: 1=high, 2=mid, 3=low';
COMMENT ON COLUMN gv_creators.scrape_frequency_days IS 'How often to scrape: 7/14/30 days';
COMMENT ON COLUMN gv_creators.next_scrape_date IS 'Next scheduled scrape date';
```

**Tier Calculation Function:**

**File:** `/supabase/functions/radar-calculate-tiers/index.ts` (NEW)

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CreatorStats {
  id: string;
  follower_count: number;
  engagement_rate: number;
  avg_quality_score: number;
  avg_originality_score: number;
  last_post_date: string | null;
  content_count: number;
}

interface TierResult {
  tier: 1 | 2 | 3;
  frequency_days: 7 | 14 | 30;
  reason: string;
  next_scrape_date: string;
}

function calculateDaysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateCreatorTier(stats: CreatorStats): TierResult {
  const {
    engagement_rate,
    avg_quality_score,
    avg_originality_score,
    follower_count,
    last_post_date,
    content_count
  } = stats;

  const daysSinceLastPost = calculateDaysSince(last_post_date);

  // TIER 3: Low performers or inactive (30% of creators)
  // - Scrape monthly
  if (
    daysSinceLastPost > 30 || // Inactive for 30+ days
    engagement_rate < 2 || // Very low engagement
    (avg_quality_score > 0 && avg_quality_score < 0.4) || // Poor quality
    content_count < 5 // Not enough data
  ) {
    return {
      tier: 3,
      frequency_days: 30,
      reason: `Low: ER=${engagement_rate}%, Quality=${avg_quality_score}, Inactive=${daysSinceLastPost}d`,
      next_scrape_date: addDays(new Date(), 30).toISOString()
    };
  }

  // TIER 1: High performers (20% of creators)
  // - Scrape weekly
  if (
    engagement_rate > 5 && // High engagement
    avg_quality_score > 0.7 && // High quality
    avg_originality_score > 0.7 && // Original content
    follower_count > 200000 && // Significant reach
    daysSinceLastPost < 7 && // Recently active
    content_count >= 10 // Sufficient data
  ) {
    return {
      tier: 1,
      frequency_days: 7,
      reason: `High: ER=${engagement_rate}%, Quality=${avg_quality_score}, Followers=${follower_count}`,
      next_scrape_date: addDays(new Date(), 7).toISOString()
    };
  }

  // TIER 2: Mid performers (50% of creators)
  // - Scrape bi-weekly
  return {
    tier: 2,
    frequency_days: 14,
    reason: `Mid: ER=${engagement_rate}%, Quality=${avg_quality_score}`,
    next_scrape_date: addDays(new Date(), 14).toISOString()
  };
}

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch all active creators with their stats
    const { data: creators, error: fetchError } = await supabase
      .from("gv_creators")
      .select(`
        id,
        name,
        follower_count,
        engagement_rate,
        last_scraped_at,
        scrape_tier,
        category
      `)
      .eq("is_active", true);

    if (fetchError) {
      throw new Error(`Failed to fetch creators: ${fetchError.message}`);
    }

    console.log(`Processing ${creators.length} creators for tier calculation...`);

    let tier1Count = 0;
    let tier2Count = 0;
    let tier3Count = 0;
    const updates = [];

    for (const creator of creators) {
      // Calculate average scores from content
      const { data: contentStats } = await supabase
        .from("gv_creator_content")
        .select("content_quality_score, originality_score, posted_at")
        .eq("creator_id", creator.id)
        .eq("analysis_status", "completed")
        .not("content_quality_score", "is", null)
        .order("posted_at", { ascending: false })
        .limit(20); // Last 20 posts

      if (!contentStats || contentStats.length === 0) {
        // No analyzed content yet, default to Tier 2
        updates.push({
          id: creator.id,
          scrape_tier: 2,
          scrape_frequency_days: 14,
          next_scrape_date: addDays(new Date(), 14).toISOString(),
          tier_calculated_at: new Date().toISOString()
        });
        tier2Count++;
        continue;
      }

      const avgQuality = contentStats.reduce((sum, c) => sum + (c.content_quality_score || 0), 0) / contentStats.length;
      const avgOriginality = contentStats.reduce((sum, c) => sum + (c.originality_score || 0), 0) / contentStats.length;
      const lastPostDate = contentStats[0]?.posted_at || null;

      const stats: CreatorStats = {
        id: creator.id,
        follower_count: creator.follower_count || 0,
        engagement_rate: creator.engagement_rate || 0,
        avg_quality_score: avgQuality,
        avg_originality_score: avgOriginality,
        last_post_date: lastPostDate,
        content_count: contentStats.length
      };

      const tierResult = calculateCreatorTier(stats);

      updates.push({
        id: creator.id,
        scrape_tier: tierResult.tier,
        scrape_frequency_days: tierResult.frequency_days,
        next_scrape_date: tierResult.next_scrape_date,
        avg_quality_score: avgQuality,
        avg_originality_score: avgOriginality,
        tier_calculated_at: new Date().toISOString()
      });

      if (tierResult.tier === 1) tier1Count++;
      else if (tierResult.tier === 2) tier2Count++;
      else tier3Count++;

      console.log(`[Tier] ${creator.name}: Tier ${tierResult.tier} (${tierResult.reason})`);
    }

    // Bulk update
    for (const update of updates) {
      await supabase
        .from("gv_creators")
        .update({
          scrape_tier: update.scrape_tier,
          scrape_frequency_days: update.scrape_frequency_days,
          next_scrape_date: update.next_scrape_date,
          avg_quality_score: update.avg_quality_score,
          avg_originality_score: update.avg_originality_score,
          tier_calculated_at: update.tier_calculated_at,
          updated_at: new Date().toISOString()
        })
        .eq("id", update.id);
    }

    console.log(`Tier calculation complete!`);
    console.log(`Tier 1 (weekly): ${tier1Count} (${(tier1Count/creators.length*100).toFixed(1)}%)`);
    console.log(`Tier 2 (bi-weekly): ${tier2Count} (${(tier2Count/creators.length*100).toFixed(1)}%)`);
    console.log(`Tier 3 (monthly): ${tier3Count} (${(tier3Count/creators.length*100).toFixed(1)}%)`);

    return new Response(
      JSON.stringify({
        success: true,
        total_creators: creators.length,
        tier_distribution: {
          tier1: { count: tier1Count, percentage: (tier1Count/creators.length*100).toFixed(1) },
          tier2: { count: tier2Count, percentage: (tier2Count/creators.length*100).toFixed(1) },
          tier3: { count: tier3Count, percentage: (tier3Count/creators.length*100).toFixed(1) }
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error calculating tiers:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Tier calculation failed"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

**Deploy the function:**
```bash
cd supabase/functions/radar-calculate-tiers
supabase functions deploy radar-calculate-tiers
```

**Update Scraping Function to Respect Tiers:**

**File:** `/supabase/functions/radar-scrape-content/index.ts`

**Add before scraping logic (around line 399):**
```typescript
// ⚡ NEW: Check if creator should be scraped based on tier
async function shouldScrapeCreator(
  supabase: any,
  creatorId: string
): Promise<{ should_scrape: boolean; reason: string }> {
  const { data: creator } = await supabase
    .from('gv_creators')
    .select('scrape_tier, next_scrape_date, last_scraped_at, name')
    .eq('id', creatorId)
    .single();

  if (!creator) {
    return { should_scrape: true, reason: "New creator, scrape immediately" };
  }

  const now = new Date();
  const nextScrape = new Date(creator.next_scrape_date);

  if (now < nextScrape) {
    const daysUntilNext = Math.ceil((nextScrape.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      should_scrape: false,
      reason: `Not due yet (Tier ${creator.scrape_tier}, next scrape in ${daysUntilNext} days)`
    };
  }

  return {
    should_scrape: true,
    reason: `Scrape due (Tier ${creator.scrape_tier}, last scraped ${creator.last_scraped_at})`
  };
}

// Update main handler to check before scraping
Deno.serve(async (req: Request) => {
  // ... existing validation code ...

  const { creator_id, platform } = requestData;

  // ⚡ NEW: Check if scraping is due
  const scrapeCheck = await shouldScrapeCreator(supabaseClient, creator_id);

  if (!scrapeCheck.should_scrape) {
    console.log(`[Skip] ${scrapeCheck.reason}`);
    return new Response(
      JSON.stringify({
        success: true,
        skipped: true,
        reason: scrapeCheck.reason,
        cost_usd: 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`[Scrape] ${scrapeCheck.reason}`);

  // ... continue with existing scraping logic ...
});
```

**Schedule Tier Recalculation (Weekly):**

Using Supabase pg_cron:
```sql
-- Schedule tier calculation every Sunday at 2 AM
SELECT cron.schedule(
  'recalculate-creator-tiers',
  '0 2 * * 0', -- Every Sunday at 2 AM
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/radar-calculate-tiers',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## 📊 PHASE 3: ADVANCED CACHING (Week 4)

**Target Savings:** $27/month
**Implementation Time:** 5 hours
**Risk Level:** LOW

### 3.1 Perplexity Trend Caching ($27/month savings)

**Database Migration:**
```sql
-- File: supabase/migrations/20260214020000_trend_cache.sql

CREATE TABLE IF NOT EXISTS gv_trend_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  article_type TEXT NOT NULL,
  trend_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_trend_cache_lookup ON gv_trend_cache(category, article_type, expires_at);
CREATE INDEX idx_trend_cache_expires ON gv_trend_cache(expires_at);

COMMENT ON TABLE gv_trend_cache IS 'Cached Perplexity trend discovery results (24H TTL)';

-- Auto-delete expired cache entries
SELECT cron.schedule(
  'clean-trend-cache',
  '0 */6 * * *', -- Every 6 hours
  $$
  DELETE FROM gv_trend_cache WHERE expires_at < now();
  $$
);
```

**Update Hub Discovery Function:**

**File:** `/supabase/functions/hub-discover-content/index.ts`

**Add cache functions (after imports):**
```typescript
interface TrendCache {
  category: string;
  article_type: string;
  trend_data: any;
  cached_at: string;
  expires_at: string;
}

async function getCachedTrends(
  supabase: any,
  category: string,
  articleType: string
): Promise<{ topic: string; keywords: string[]; trending_score: number } | null> {
  const { data, error } = await supabase
    .from('gv_trend_cache')
    .select('trend_data')
    .eq('category', category)
    .eq('article_type', articleType)
    .gt('expires_at', new Date().toISOString())
    .order('cached_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.log(`[Cache MISS] ${category}/${articleType}`);
    return null;
  }

  console.log(`[Cache HIT] ${category}/${articleType} (saved $0.001)`);
  return data.trend_data;
}

async function cacheTrends(
  supabase: any,
  category: string,
  articleType: string,
  trendData: any,
  ttlHours: number = 24
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  // Adjust TTL for "hot" articles (shorter, need freshness)
  if (articleType === "hot") {
    expiresAt.setHours(expiresAt.getHours() - 18); // 6 hours instead of 24
  }

  await supabase
    .from('gv_trend_cache')
    .insert({
      category,
      article_type: articleType,
      trend_data: trendData,
      cached_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    });

  console.log(`[Cache WRITE] ${category}/${articleType} (expires: ${expiresAt.toISOString()})`);
}
```

**Update discoverTrendingTopics function:**
```typescript
async function discoverTrendingTopics(
  supabase: any,  // ⚡ NEW: Pass supabase for caching
  category: string,
  articleType: "hot" | "review" | "education" | "nice_to_know"
): Promise<{ topic: string; keywords: string[]; trending_score: number; from_cache: boolean; cost: number }> {
  // ⚡ NEW: Check cache first
  const cached = await getCachedTrends(supabase, category, articleType);
  if (cached) {
    return {
      ...cached,
      from_cache: true,
      cost: 0  // FREE!
    };
  }

  // Cache miss - call Perplexity
  if (!PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY not set");
  }

  const config = selectPerplexityModel(articleType);
  console.log(`[Perplexity] Using ${config.model} for ${articleType} (estimated: $${config.estimatedCost})`);

  const prompts = {
    hot: `What is the most trending topic in the ${category} category in Indonesia RIGHT NOW (last 24-48 hours)? Focus on viral moments, breaking news, or trending conversations. Return ONE specific topic.`,
    review: `What product, brand, or service in the ${category} category is getting the most reviews and discussions in Indonesia this week? Focus on newly launched or controversial items.`,
    education: `What is the most searched "how-to" or educational topic in the ${category} category in Indonesia this month? Focus on skills, tutorials, or learning content that people are actively seeking.`,
    nice_to_know: `What interesting insight, fact, or industry knowledge in the ${category} category would Indonesian audiences find valuable to know? Focus on surprising or lesser-known information.`,
  };

  const prompt = prompts[articleType];

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: config.model,
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
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Perplexity API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "{}";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in Perplexity response");
  }

  try {
    const result = JSON.parse(jsonMatch[0]);
    const trendData = {
      topic: result.topic || "Unknown Topic",
      keywords: result.keywords || [],
      trending_score: result.trending_score || 0.5,
    };

    // ⚡ NEW: Cache for next time
    await cacheTrends(supabase, category, articleType, trendData);

    return {
      ...trendData,
      from_cache: false,
      cost: config.estimatedCost
    };
  } catch (err) {
    console.error("Failed to parse Perplexity response:", content);
    throw new Error("Invalid JSON response from Perplexity");
  }
}

// Update main discoverContent function
async function discoverContent(
  supabase: any,
  category: string,
  articleType: "hot" | "review" | "education" | "nice_to_know",
  count: number = 10
): Promise<DiscoveryResult> {
  console.log(`Discovering content for category: ${category}, type: ${articleType}`);

  let totalCost = 0;

  // Step 1: Get trending topic from Perplexity (with caching!)
  const trendingData = await discoverTrendingTopics(supabase, category, articleType);
  totalCost += trendingData.cost; // $0 if from cache!

  if (trendingData.from_cache) {
    console.log(`✨ Cache saved $${API_COSTS.perplexity_sonar_pro.toFixed(4)}!`);
  }

  console.log(`Discovered trending topic: ${trendingData.topic}`);
  console.log(`Keywords: ${trendingData.keywords.join(", ")}`);

  // ... rest of function unchanged ...
}
```

---

## ✅ TESTING & VALIDATION

### Test Suite 1: Phase 1 (Quick Wins)

```bash
# Test 1: Perplexity Model Routing
echo "Testing Perplexity model routing..."

# Test each article type
for TYPE in "hot" "review" "education" "nice_to_know"; do
  echo "Testing $TYPE..."
  curl -X POST https://your-project.supabase.co/functions/v1/hub-discover-content \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"category\": \"beauty\", \"article_type\": \"$TYPE\", \"count\": 10}" \
    | jq '.result.cost_usd'
done

# Expected: hot & review use $0.001, education & nice_to_know use $0.0005

# Test 2: Claude Skip Logic
echo "\nTesting Claude skip re-analysis..."

# Analyze a post
POST_ID=$(curl -X POST https://your-project.supabase.co/functions/v1/radar-analyze-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content_id": "TEST_POST_ID"}' \
  | jq -r '.result.content_id')

# Try to analyze again (should skip)
curl -X POST https://your-project.supabase.co/functions/v1/radar-analyze-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content_id\": \"$POST_ID\"}" \
  | jq '.result.skipped'

# Expected: true (skipped), cost_usd: 0

# Test 3: Cache Warming
echo "\nTesting Claude cache warming..."

# First batch of day should warm cache
curl -X POST https://your-project.supabase.co/functions/v1/radar-analyze-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batch": true, "category": "beauty"}' \
  | jq '.result.cache_savings_usd'

# Expected: Some cache savings even on first run
```

### Test Suite 2: Phase 2 (Tiered Scraping)

```bash
# Test 1: Tier Calculation
echo "Testing tier calculation..."

curl -X POST https://your-project.supabase.co/functions/v1/radar-calculate-tiers \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '.tier_distribution'

# Expected: ~20% tier1, ~50% tier2, ~30% tier3

# Test 2: Scrape Scheduling
echo "\nTesting scrape scheduling..."

# Get a Tier 3 creator (should be skipped if recently scraped)
TIER3_CREATOR=$(psql $DATABASE_URL -t -c "SELECT id FROM gv_creators WHERE scrape_tier = 3 AND next_scrape_date > now() LIMIT 1;")

curl -X POST https://your-project.supabase.co/functions/v1/radar-scrape-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"creator_id\": \"$TIER3_CREATOR\", \"platform\": \"instagram\"}" \
  | jq '.skipped'

# Expected: true (not due yet)

# Test 3: Tier Distribution Check
echo "\nChecking tier distribution..."

psql $DATABASE_URL -c "
  SELECT
    scrape_tier,
    COUNT(*) as count,
    ROUND(AVG(engagement_rate), 2) as avg_engagement,
    ROUND(AVG(avg_quality_score), 2) as avg_quality
  FROM gv_creators
  WHERE is_active = true
  GROUP BY scrape_tier
  ORDER BY scrape_tier;
"

# Expected:
# Tier 1: High engagement, high quality
# Tier 2: Mid engagement, mid quality
# Tier 3: Low engagement, low quality
```

### Test Suite 3: Phase 3 (Trend Caching)

```bash
# Test 1: Cache Miss (First Call)
echo "Testing trend cache - first call (should be MISS)..."

TIME1_START=$(date +%s)
RESULT1=$(curl -X POST https://your-project.supabase.co/functions/v1/hub-discover-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "beauty", "article_type": "hot", "count": 10"}')
TIME1_END=$(date +%s)

echo $RESULT1 | jq '.result.cost_usd'
echo "Time: $((TIME1_END - TIME1_START))s"

# Expected: cost > 0, time ~5s

# Test 2: Cache Hit (Second Call)
echo "\nTesting trend cache - second call (should be HIT)..."

TIME2_START=$(date +%s)
RESULT2=$(curl -X POST https://your-project.supabase.co/functions/v1/hub-discover-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "beauty", "article_type": "hot", "count": 10"}')
TIME2_END=$(date +%s)

echo $RESULT2 | jq '.result.cost_usd'
echo "Time: $((TIME2_END - TIME2_START))s"

# Expected: cost = 0, time ~2s (60% faster!)

# Test 3: Cache Expiry Check
echo "\nChecking cache expiry times..."

psql $DATABASE_URL -c "
  SELECT
    category,
    article_type,
    cached_at,
    expires_at,
    EXTRACT(EPOCH FROM (expires_at - cached_at)) / 3600 as ttl_hours
  FROM gv_trend_cache
  ORDER BY cached_at DESC
  LIMIT 10;
"

# Expected: "hot" articles = 6h TTL, others = 24h TTL
```

---

## 📊 MONITORING & ROLLBACK

### Monitoring Dashboard Queries

**Daily Cost Tracking:**
```sql
-- Create monitoring view
CREATE OR REPLACE VIEW gv_api_cost_daily AS
SELECT
  DATE(created_at) as date,
  'perplexity' as api,
  COUNT(*) as requests,
  SUM(CASE
    WHEN article_type IN ('education', 'nice_to_know') THEN 0.0005
    ELSE 0.001
  END) as cost_usd
FROM gv_hub_articles
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)

UNION ALL

SELECT
  DATE(analyzed_at) as date,
  'claude' as api,
  COUNT(*) as requests,
  SUM(0.002) as cost_usd  -- Approximate with caching
FROM gv_creator_content
WHERE analyzed_at >= CURRENT_DATE - INTERVAL '30 days'
  AND analysis_status = 'completed'
GROUP BY DATE(analyzed_at)

UNION ALL

SELECT
  DATE(scraped_at) as date,
  'apify' as api,
  COUNT(*) as requests,
  SUM(0.017) as cost_usd
FROM gv_creator_content
WHERE scraped_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(scraped_at)

ORDER BY date DESC, api;
```

**Cache Hit Rate Tracking:**
```sql
CREATE OR REPLACE VIEW gv_cache_stats AS
SELECT
  DATE(cached_at) as date,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN cached_at IS NOT NULL THEN 1 END) as cache_hits,
  ROUND(
    100.0 * COUNT(CASE WHEN cached_at IS NOT NULL THEN 1 END) / NULLIF(COUNT(*), 0),
    2
  ) as cache_hit_rate
FROM gv_trend_cache
WHERE cached_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(cached_at)
ORDER BY date DESC;
```

**Tier Distribution Monitoring:**
```sql
SELECT
  scrape_tier,
  scrape_frequency_days,
  COUNT(*) as creator_count,
  ROUND(AVG(engagement_rate), 2) as avg_engagement,
  ROUND(AVG(avg_quality_score), 2) as avg_quality,
  COUNT(*) * CASE
    WHEN scrape_frequency_days = 7 THEN 4
    WHEN scrape_frequency_days = 14 THEN 2
    ELSE 1
  END as monthly_scrapes,
  COUNT(*) * CASE
    WHEN scrape_frequency_days = 7 THEN 4
    WHEN scrape_frequency_days = 14 THEN 2
    ELSE 1
  END * 0.031 as monthly_cost_usd
FROM gv_creators
WHERE is_active = true
GROUP BY scrape_tier, scrape_frequency_days
ORDER BY scrape_tier;
```

### Alert Configuration

**File:** `monitoring/alerts.sql`
```sql
-- Alert: Daily cost exceeds budget
CREATE OR REPLACE FUNCTION check_daily_cost_alert()
RETURNS void AS $$
DECLARE
  daily_cost NUMERIC;
  budget_limit NUMERIC := 35.00; -- $35/day = $1,050/month
BEGIN
  SELECT SUM(cost_usd) INTO daily_cost
  FROM gv_api_cost_daily
  WHERE date = CURRENT_DATE;

  IF daily_cost > budget_limit THEN
    INSERT INTO gv_alerts (type, severity, message, data)
    VALUES (
      'cost_exceeded',
      'critical',
      'Daily API cost exceeded budget',
      jsonb_build_object(
        'daily_cost', daily_cost,
        'budget_limit', budget_limit,
        'overage', daily_cost - budget_limit
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Alert: Cache hit rate below threshold
CREATE OR REPLACE FUNCTION check_cache_hit_rate_alert()
RETURNS void AS $$
DECLARE
  hit_rate NUMERIC;
  threshold NUMERIC := 85.0; -- 85% minimum
BEGIN
  SELECT cache_hit_rate INTO hit_rate
  FROM gv_cache_stats
  WHERE date = CURRENT_DATE;

  IF hit_rate < threshold THEN
    INSERT INTO gv_alerts (type, severity, message, data)
    VALUES (
      'cache_degraded',
      'warning',
      'Cache hit rate below threshold',
      jsonb_build_object(
        'hit_rate', hit_rate,
        'threshold', threshold
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Schedule alerts (runs every hour)
SELECT cron.schedule(
  'check-cost-alerts',
  '0 * * * *',
  $$SELECT check_daily_cost_alert();$$
);

SELECT cron.schedule(
  'check-cache-alerts',
  '0 * * * *',
  $$SELECT check_cache_hit_rate_alert();$$
);
```

### Rollback Plan

**If optimizations cause issues, rollback with:**

```sql
-- Rollback Phase 1: Restore original Perplexity settings
-- Manual: Change model back to "sonar-pro" in hub-discover-content/index.ts

-- Rollback Phase 2: Disable tiered scraping
UPDATE gv_creators
SET
  scrape_tier = 2,
  scrape_frequency_days = 7,
  next_scrape_date = now()
WHERE is_active = true;

-- Rollback Phase 3: Clear trend cache
TRUNCATE TABLE gv_trend_cache;
```

---

**END OF IMPLEMENTATION GUIDE**

**Next Steps:**
1. Review this guide with engineering team
2. Set up monitoring dashboards
3. Begin Phase 1 implementation (6 hours)
4. Test thoroughly before production
5. Deploy with feature flags for gradual rollout
