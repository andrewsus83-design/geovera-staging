# Integration Guide: Using Learned Patterns in Content Analysis

This guide shows how to integrate learned brand authority patterns into your content analysis pipeline to optimize costs and improve accuracy.

## Overview

The learned patterns enable a **two-stage filtering approach**:

1. **Pre-Filter (Fast)**: Apply learned patterns to quickly identify obvious authority/noise
2. **Claude Analysis (Slow)**: Only analyze ambiguous content with Claude

This approach can **reduce Claude API calls by 30-50%** while maintaining accuracy.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Content Analysis Pipeline                      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  New Content from Scraper      │
        │  (gv_creator_content)          │
        └────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  1. Load Learned Patterns      │
        │     (gv_brand_authority_patterns)│
        └────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  2. Apply Quick Pre-Filters    │
        │     - Keyword matching          │
        │     - Caption length checks     │
        │     - Rule-based classification │
        └────────────────────────────────┘
                         │
                         ├─────────────┐
                         │             │
                  Definitive?      Ambiguous?
                         │             │
                         ▼             ▼
              ┌──────────────┐  ┌──────────────┐
              │ Skip Claude  │  │ Analyze with │
              │ (Save $$$)   │  │ Claude       │
              └──────────────┘  └──────────────┘
                         │             │
                         └──────┬──────┘
                                ▼
                   ┌─────────────────────┐
                   │  Save Results       │
                   │  (quality scores)   │
                   └─────────────────────┘
```

## Step-by-Step Integration

### Step 1: Modify `radar-analyze-content/index.ts`

Add pattern loading and pre-filtering logic:

```typescript
// Add to radar-analyze-content/index.ts

interface AuthorityPatterns {
  authority_signals: {
    keywords: string[];
    content_types: string[];
    quality_indicators: string[];
  };
  noise_signals: {
    keywords: string[];
    content_types: string[];
    low_value_patterns: string[];
  };
  filtering_rules: Array<{
    rule: string;
    confidence: number;
    applies_to: string;
  }>;
  confidence_score: number;
}

/**
 * Load learned patterns for category
 */
async function loadPatternsForCategory(
  supabase: any,
  category: string
): Promise<AuthorityPatterns | null> {
  const { data: pattern } = await supabase
    .from("gv_brand_authority_patterns")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!pattern) {
    return null;
  }

  return {
    authority_signals: pattern.authority_signals,
    noise_signals: pattern.noise_signals,
    filtering_rules: pattern.filtering_rules,
    confidence_score: pattern.confidence_score,
  };
}

/**
 * Apply learned patterns to pre-filter content
 * Returns: "authority" | "noise" | "unclear"
 */
function applyPreFilter(
  content: { caption: string; hashtags: string[] },
  patterns: AuthorityPatterns
): { classification: "authority" | "noise" | "unclear"; confidence: number; reason: string } {
  const caption = (content.caption || "").toLowerCase();
  const hashtags = content.hashtags.map((h) => h.toLowerCase());
  const allText = `${caption} ${hashtags.join(" ")}`;

  // Apply high-confidence rules first (0.85+)
  const highConfidenceRules = patterns.filtering_rules.filter((r) => r.confidence >= 0.85);

  for (const rule of highConfidenceRules) {
    // Rule 1: Authority keywords in caption
    if (rule.applies_to === "caption" && rule.rule.includes("→ authority")) {
      const authorityKeywords = patterns.authority_signals.keywords;
      const foundKeywords = authorityKeywords.filter((kw) => allText.includes(kw.toLowerCase()));

      if (foundKeywords.length >= 2) {
        return {
          classification: "authority",
          confidence: rule.confidence,
          reason: `Contains authority keywords: ${foundKeywords.join(", ")}`,
        };
      }
    }

    // Rule 2: Noise indicators
    if (rule.applies_to === "caption" && rule.rule.includes("→ noise")) {
      const noiseKeywords = patterns.noise_signals.keywords;
      const foundNoise = noiseKeywords.filter((kw) => allText.includes(kw.toLowerCase()));

      // Short caption + noise keywords = definite noise
      if (caption.length < 100 && foundNoise.length >= 2) {
        return {
          classification: "noise",
          confidence: rule.confidence,
          reason: `Short caption with noise keywords: ${foundNoise.join(", ")}`,
        };
      }
    }
  }

  // Check quality indicators
  const qualityIndicators = patterns.authority_signals.quality_indicators;

  // Long, detailed caption = likely authority
  if (caption.length > 200) {
    const hasStructure = caption.includes("\n") || caption.split(".").length > 3;
    if (hasStructure) {
      return {
        classification: "authority",
        confidence: 0.75,
        reason: "Detailed, structured caption (>200 chars)",
      };
    }
  }

  // Very short caption with no substance = likely noise
  if (caption.length < 50 && hashtags.length < 3) {
    return {
      classification: "noise",
      confidence: 0.70,
      reason: "Very short caption (<50 chars) with minimal hashtags",
    };
  }

  // Unclear - needs Claude analysis
  return {
    classification: "unclear",
    confidence: 0.5,
    reason: "Ambiguous content - requires Claude analysis",
  };
}

/**
 * Process content with pattern-based optimization
 */
async function processContentWithPatterns(
  supabase: any,
  category: string,
  contentId: string
): Promise<{
  success: boolean;
  method: "pre_filter" | "claude_analysis";
  cost_usd: number;
  result: any;
}> {
  // 1. Load learned patterns
  const patterns = await loadPatternsForCategory(supabase, category);

  // 2. Fetch content
  const { data: content } = await supabase
    .from("gv_creator_content")
    .select("id, caption, hashtags")
    .eq("id", contentId)
    .single();

  if (!content) {
    throw new Error(`Content not found: ${contentId}`);
  }

  // 3. Apply pre-filter if patterns exist
  if (patterns && patterns.confidence_score >= 0.70) {
    const preFilterResult = applyPreFilter(content, patterns);

    // If definitive classification (confidence >= 0.75), skip Claude
    if (preFilterResult.confidence >= 0.75 && preFilterResult.classification !== "unclear") {
      const score = preFilterResult.classification === "authority" ? 0.75 : 0.25;

      await supabase
        .from("gv_creator_content")
        .update({
          content_quality_score: score,
          originality_score: score,
          analysis_status: "completed",
          analyzed_at: new Date().toISOString(),
        })
        .eq("id", contentId);

      console.log(`✅ Pre-filtered as ${preFilterResult.classification}: ${preFilterResult.reason}`);

      return {
        success: true,
        method: "pre_filter",
        cost_usd: 0,
        result: {
          classification: preFilterResult.classification,
          confidence: preFilterResult.confidence,
          reason: preFilterResult.reason,
          quality_score: score,
        },
      };
    }
  }

  // 4. Ambiguous content - analyze with Claude
  console.log("⚙️ Requires Claude analysis (ambiguous content)");

  // Call existing Claude analysis function
  const claudeResult = await processSingleContent(supabase, contentId);

  return {
    success: true,
    method: "claude_analysis",
    cost_usd: claudeResult.cost_usd,
    result: claudeResult.analysis,
  };
}
```

### Step 2: Batch Processing with Patterns

```typescript
// Modified batch processing function

async function processBatchContentWithPatterns(
  supabase: any,
  category: string
): Promise<{
  processed: number;
  pre_filtered: number;
  claude_analyzed: number;
  total_cost_usd: number;
  savings_usd: number;
}> {
  // Load patterns
  const patterns = await loadPatternsForCategory(supabase, category);

  // Fetch pending content
  const { data: pendingContent } = await supabase
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

  if (!pendingContent || pendingContent.length === 0) {
    return {
      processed: 0,
      pre_filtered: 0,
      claude_analyzed: 0,
      total_cost_usd: 0,
      savings_usd: 0,
    };
  }

  let preFiltered = 0;
  let claudeAnalyzed = 0;
  let totalCost = 0;

  // Separate into pre-filterable and ambiguous
  const preFilterable: any[] = [];
  const needsClaude: any[] = [];

  if (patterns && patterns.confidence_score >= 0.70) {
    for (const content of pendingContent) {
      const result = applyPreFilter(content, patterns);

      if (result.confidence >= 0.75 && result.classification !== "unclear") {
        preFilterable.push({ content, result });
      } else {
        needsClaude.push(content);
      }
    }
  } else {
    // No patterns - all need Claude
    needsClaude.push(...pendingContent);
  }

  console.log(`📊 Pre-filterable: ${preFilterable.length}, Needs Claude: ${needsClaude.length}`);

  // Process pre-filterable content (no Claude cost)
  for (const { content, result } of preFilterable) {
    const score = result.classification === "authority" ? 0.75 : 0.25;

    await supabase
      .from("gv_creator_content")
      .update({
        content_quality_score: score,
        originality_score: score,
        analysis_status: "completed",
        analyzed_at: new Date().toISOString(),
      })
      .eq("id", content.id);

    preFiltered++;
  }

  // Process ambiguous content with Claude (in batches of 10)
  const CHUNK_SIZE = 10;
  for (let i = 0; i < needsClaude.length; i += CHUNK_SIZE) {
    const chunk = needsClaude.slice(i, i + CHUNK_SIZE);

    // Use existing Claude batch analysis
    const { results, usage } = await analyzeWithClaude(
      chunk.map((c) => ({
        id: c.id,
        platform: c.platform,
        caption: c.caption || "",
        hashtags: c.hashtags || [],
      })),
      true // Use cache
    );

    const cost = calculateCost(usage);
    totalCost += cost;

    // Update database
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

      claudeAnalyzed++;
    }

    // Rate limiting
    if (i + CHUNK_SIZE < needsClaude.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Calculate savings (assumed cost per Claude call: $0.005)
  const assumedCostPerCall = 0.005;
  const savings = preFiltered * assumedCostPerCall;

  return {
    processed: preFiltered + claudeAnalyzed,
    pre_filtered: preFiltered,
    claude_analyzed: claudeAnalyzed,
    total_cost_usd: totalCost,
    savings_usd: savings,
  };
}
```

### Step 3: Update Main Handler

```typescript
Deno.serve(async (req: Request) => {
  // ... existing CORS and validation ...

  const body: AnalysisRequest = await req.json();

  // Route: Single content analysis (with patterns)
  if (body.content_id) {
    const result = await processContentWithPatterns(
      supabase,
      body.category || "beauty", // Pass category
      body.content_id
    );

    return new Response(
      JSON.stringify({
        success: true,
        mode: "single",
        result,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Route: Batch content analysis (with patterns)
  if (body.batch && body.category) {
    const result = await processBatchContentWithPatterns(supabase, body.category);

    return new Response(
      JSON.stringify({
        success: true,
        mode: "batch",
        category: body.category,
        result,
        optimization: {
          pre_filtered_percentage: ((result.pre_filtered / result.processed) * 100).toFixed(1),
          cost_savings_usd: result.savings_usd.toFixed(4),
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ... rest of handler ...
});
```

## Complete Workflow Example

### 1. Initial Setup: Learn Patterns

```bash
# Learn patterns for beauty category
curl -X POST https://your-project.supabase.co/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"category": "beauty", "sample_size": 20}'
```

### 2. Analyze Content (With Patterns)

```bash
# Batch analyze beauty content (will use learned patterns)
curl -X POST https://your-project.supabase.co/functions/v1/radar-analyze-content \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"batch": true, "category": "beauty"}'
```

**Response:**
```json
{
  "success": true,
  "mode": "batch",
  "category": "beauty",
  "result": {
    "processed": 100,
    "pre_filtered": 35,
    "claude_analyzed": 65,
    "total_cost_usd": 0.325,
    "savings_usd": 0.175
  },
  "optimization": {
    "pre_filtered_percentage": "35.0",
    "cost_savings_usd": "0.1750"
  }
}
```

### 3. Monitor Performance

```sql
-- Check pattern effectiveness
SELECT
  p.category,
  p.confidence_score,
  COUNT(c.id) as analyzed_content,
  AVG(c.content_quality_score) as avg_quality,
  COUNT(c.id) FILTER (WHERE c.content_quality_score > 0.7) as authority_count,
  COUNT(c.id) FILTER (WHERE c.content_quality_score < 0.3) as noise_count
FROM gv_brand_authority_patterns p
LEFT JOIN gv_creators cr ON cr.category = p.category
LEFT JOIN gv_creator_content c ON c.creator_id = cr.id
WHERE p.is_active = true
  AND c.analyzed_at > p.learned_at
GROUP BY p.category, p.confidence_score;
```

## Cost Comparison

### Without Patterns (100% Claude)
- **100 posts** analyzed with Claude
- **Cost**: ~$0.50 USD
- **Time**: ~60 seconds

### With Patterns (65% Claude, 35% Pre-Filter)
- **35 posts** pre-filtered (instant, $0)
- **65 posts** analyzed with Claude
- **Cost**: ~$0.33 USD
- **Savings**: ~$0.17 USD (34%)
- **Time**: ~40 seconds

### Monthly Savings
- **10,000 posts/month**
- **Without patterns**: ~$50 USD
- **With patterns**: ~$33 USD
- **Monthly savings**: ~$17 USD
- **Annual savings**: ~$204 USD

## Best Practices

1. **Learn Before Analyzing**: Always learn patterns before processing large batches
2. **Monthly Refresh**: Re-learn patterns monthly to adapt to trends
3. **Confidence Threshold**: Only pre-filter if pattern confidence >= 0.70
4. **Rule Threshold**: Only apply rules with confidence >= 0.75
5. **Monitor Accuracy**: Periodically validate pre-filter accuracy vs Claude

## Troubleshooting

### Issue: Low Pre-Filter Rate (<20%)

**Cause**: Patterns not specific enough or low confidence

**Solution**:
```bash
# Re-learn with larger sample
curl -X POST .../radar-learn-brand-authority \
  -d '{"category": "beauty", "sample_size": 30, "force_relearn": true}'
```

### Issue: High False Positive Rate

**Cause**: Pre-filter rules too aggressive

**Solution**: Increase confidence threshold in `applyPreFilter()`:
```typescript
if (preFilterResult.confidence >= 0.85) { // Increased from 0.75
  // ...
}
```

### Issue: No Patterns Found

**Cause**: No patterns learned for category

**Solution**: Learn patterns first:
```bash
curl -X POST .../radar-learn-brand-authority \
  -d '{"category": "your_category", "sample_size": 20}'
```

## Summary

By integrating learned patterns into your content analysis pipeline, you can:

- ✅ **Reduce Claude API costs by 30-50%**
- ✅ **Speed up content analysis by 40%**
- ✅ **Maintain high accuracy (patterns confidence >= 0.70)**
- ✅ **Automatically adapt to category-specific patterns**
- ✅ **Scale efficiently as content volume grows**

The two-stage approach (pre-filter + Claude) provides the best balance of cost, speed, and accuracy.
