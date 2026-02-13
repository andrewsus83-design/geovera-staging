# radar-learn-brand-authority

**Edge Function for Claude-Powered Brand Authority Learning**

## Overview

This function uses Claude to analyze sample content and learn what constitutes "brand authority" signals vs noise. It samples 10-20 pieces of content per category, identifies patterns, and saves learned filtering rules to optimize future content analysis.

## Purpose

**Problem**: Not all creator content is valuable for brand monitoring. We need to distinguish:
- **Authority Content**: Expertise, product reviews, tutorials, industry insights
- **Noise**: Generic lifestyle posts, engagement bait, low-effort content

**Solution**: Use Claude to learn category-specific patterns by analyzing sample content, then apply these patterns to filter future content efficiently.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  radar-learn-brand-authority                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  1. Sample 10-20 Random Posts     │
        │     from gv_creator_content       │
        │     (filtered: no promo/giveaway) │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  2. Send to Claude for Analysis   │
        │     - Identify authority signals  │
        │     - Identify noise signals      │
        │     - Extract filtering rules     │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  3. Save Learned Patterns         │
        │     to gv_brand_authority_patterns│
        │     (expires in 30 days)          │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  4. Use Patterns in Future        │
        │     Content Analysis              │
        └───────────────────────────────────┘
```

## Database Schema

### Table: `gv_brand_authority_patterns`

```sql
CREATE TABLE gv_brand_authority_patterns (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL,
  authority_signals JSONB NOT NULL,     -- Keywords, content types, quality indicators
  noise_signals JSONB NOT NULL,          -- Patterns to filter out
  filtering_rules JSONB NOT NULL,        -- Actionable rules with confidence scores
  sample_size INTEGER NOT NULL,
  confidence_score NUMERIC(3,2),         -- Overall pattern confidence (0-1)
  learned_from_content_ids TEXT[],       -- Sample IDs used for learning
  model_used TEXT,                       -- Claude model version
  learning_cost_usd NUMERIC(10,4),       -- Cost of learning
  learned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,                -- Patterns expire after 30 days
  is_active BOOLEAN DEFAULT true
);
```

## API Reference

### Endpoint

```
POST /radar-learn-brand-authority
```

### Request Body

```typescript
{
  category: string;           // Required: Category to learn patterns for
  sample_size?: number;       // Optional: 10-50 posts (default: 20)
  force_relearn?: boolean;    // Optional: Force re-learning even if patterns exist (default: false)
}
```

### Response

```typescript
{
  success: true,
  category: string,
  result: {
    success: boolean,
    patterns: {
      authority_signals: {
        keywords: string[],              // ["tutorial", "review", "how-to"]
        content_types: string[],         // ["product review", "educational"]
        quality_indicators: string[],    // ["detailed caption", "professional visuals"]
        engagement_patterns: string[]    // ["high comment-to-like ratio"]
      },
      noise_signals: {
        keywords: string[],              // ["mood", "vibes", "ootd"]
        content_types: string[],         // ["outfit post", "selfie"]
        low_value_patterns: string[]     // ["caption <20 words", "no context"]
      },
      filtering_rules: [
        {
          rule: string,                  // "If caption contains 'tutorial' → authority"
          confidence: number,            // 0.95
          applies_to: string             // "caption"
        }
      ],
      key_insights: string[],            // Category-specific insights
      confidence_score: number           // Overall confidence (0-1)
    },
    sample_size: number,
    cost_usd: number,
    status: "learned_new_patterns" | "using_existing_patterns"
  },
  usage_notes: string
}
```

## Usage Examples

### 1. Learn Patterns for a Category (First Time)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "sample_size": 20
  }'
```

**Response:**
```json
{
  "success": true,
  "category": "beauty",
  "result": {
    "success": true,
    "patterns": {
      "authority_signals": {
        "keywords": ["tutorial", "review", "skincare routine", "makeup tips"],
        "content_types": ["product review", "tutorial", "comparison"],
        "quality_indicators": ["detailed caption (>100 words)", "before/after"],
        "engagement_patterns": ["high save rate"]
      },
      "noise_signals": {
        "keywords": ["mood", "ootd", "vibes"],
        "content_types": ["selfie", "outfit post"],
        "low_value_patterns": ["caption <20 words", "no product mention"]
      },
      "filtering_rules": [
        {
          "rule": "If caption contains 'tutorial', 'review', or 'routine' → authority",
          "confidence": 0.95,
          "applies_to": "caption"
        },
        {
          "rule": "If caption <20 words AND no product mention → noise",
          "confidence": 0.85,
          "applies_to": "caption"
        }
      ],
      "key_insights": [
        "Beauty authority content typically includes detailed product comparisons",
        "Tutorials and routines show 2x higher save rates than selfies"
      ],
      "confidence_score": 0.88
    },
    "sample_size": 20,
    "cost_usd": 0.0234,
    "status": "learned_new_patterns"
  },
  "usage_notes": "New patterns learned successfully. Patterns expire in 30 days."
}
```

### 2. Check Existing Patterns (Cached)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty"
  }'
```

**Response:**
```json
{
  "success": true,
  "category": "beauty",
  "result": {
    "success": true,
    "patterns": { ... },
    "sample_size": 20,
    "cost_usd": 0.0,
    "status": "using_existing_patterns"
  },
  "usage_notes": "Using existing patterns. Set force_relearn: true to re-learn."
}
```

### 3. Force Re-Learning (Monthly Refresh)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "force_relearn": true,
    "sample_size": 25
  }'
```

## Integration with Content Analysis

### How to Use Learned Patterns in `radar-analyze-content`

```typescript
// In radar-analyze-content/index.ts

// 1. Fetch active patterns for category
const { data: patterns } = await supabase
  .from("gv_brand_authority_patterns")
  .select("*")
  .eq("category", category)
  .eq("is_active", true)
  .gt("expires_at", new Date().toISOString())
  .single();

if (patterns) {
  // 2. Apply quick pre-filters BEFORE Claude analysis
  const authorityKeywords = patterns.authority_signals.keywords;
  const noiseKeywords = patterns.noise_signals.keywords;

  // Skip obvious noise (save Claude API calls)
  if (caption.length < 20 && !hasProductMention(caption)) {
    markAsNoise(content);
    return; // Skip Claude analysis
  }

  // 3. Use filtering rules to prioritize content
  for (const rule of patterns.filtering_rules) {
    if (rule.confidence >= 0.85) {
      applyRule(rule, content);
    }
  }

  // 4. Only send non-obvious content to Claude
  if (!hasDefinitiveRuling(content)) {
    analyzeWithClaude(content);
  }
}
```

## Cost Optimization

### Learning Cost
- **Sample Size**: 20 posts
- **Input Tokens**: ~3,000 tokens (system prompt + samples)
- **Output Tokens**: ~800 tokens (patterns JSON)
- **Cost per Learning**: ~$0.02-0.03 USD

### ROI Analysis
- **One-time learning**: $0.02
- **Patterns valid for**: 30 days
- **Content analyzed per month**: ~10,000 posts
- **Claude calls saved**: ~30% (3,000 posts filtered pre-Claude)
- **Savings**: ~$15-20 USD per month

**Break-even**: First 1-2 posts filtered

## Workflow Integration

### 1. Initial Setup (One-time per Category)

```bash
# Learn patterns for all categories
for category in beauty fashion food tech lifestyle; do
  curl -X POST .../radar-learn-brand-authority \
    -d "{ \"category\": \"$category\", \"sample_size\": 20 }"
done
```

### 2. Monthly Refresh (Automated)

```sql
-- Create scheduled job (Supabase cron)
SELECT cron.schedule(
  'refresh-brand-authority-patterns',
  '0 0 1 * *', -- First day of each month
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/radar-learn-brand-authority',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"category": "beauty", "force_relearn": true}'::jsonb
  );
  $$
);
```

### 3. Content Analysis Pipeline

```
1. Scrape content → gv_creator_content
2. Learn patterns (if not exist) → gv_brand_authority_patterns
3. Apply pre-filters using patterns
4. Analyze remaining content with Claude → radar-analyze-content
5. Calculate rankings → radar-calculate-rankings
```

## Pattern Examples by Category

### Beauty
**Authority Signals:**
- Keywords: tutorial, skincare routine, product review, makeup tips
- Content Types: before/after, comparison, step-by-step
- Quality: Detailed captions (>100 words), ingredient lists

**Noise Signals:**
- Keywords: mood, aesthetic, vibes, ootd
- Content Types: selfie, mirror pic, outfit dump
- Patterns: Short captions (<20 words), no product mention

### Fashion
**Authority Signals:**
- Keywords: styling tips, outfit guide, brand review, fashion haul
- Content Types: lookbook, brand comparison, trend analysis
- Quality: Multiple outfit shots, detailed styling notes

**Noise Signals:**
- Keywords: random, feeling, casual
- Content Types: single outfit pic, mirror selfie
- Patterns: No context, generic poses

### Food
**Authority Signals:**
- Keywords: recipe, cooking tutorial, restaurant review, food guide
- Content Types: step-by-step recipe, detailed review, food comparison
- Quality: Recipe details, taste description, plating tips

**Noise Signals:**
- Keywords: yummy, delicious, craving
- Content Types: single food photo, generic food pic
- Patterns: No recipe/details, just food photo

## Monitoring & Maintenance

### Check Pattern Status

```sql
-- View all active patterns
SELECT
  category,
  confidence_score,
  sample_size,
  learned_at,
  expires_at,
  learning_cost_usd
FROM gv_brand_authority_patterns
WHERE is_active = true
ORDER BY learned_at DESC;
```

### Pattern Performance Metrics

```sql
-- Calculate pattern effectiveness
SELECT
  p.category,
  p.confidence_score,
  COUNT(c.id) as total_content,
  COUNT(c.id) FILTER (WHERE c.content_quality_score > 0.7) as authority_content,
  COUNT(c.id) FILTER (WHERE c.content_quality_score < 0.3) as noise_content,
  ROUND(
    COUNT(c.id) FILTER (WHERE c.content_quality_score > 0.7)::NUMERIC /
    NULLIF(COUNT(c.id), 0) * 100,
    2
  ) as authority_percentage
FROM gv_brand_authority_patterns p
LEFT JOIN gv_creator_content c ON c.id = ANY(p.learned_from_content_ids)
WHERE p.is_active = true
GROUP BY p.category, p.confidence_score
ORDER BY authority_percentage DESC;
```

### Expire Old Patterns

```sql
-- Manually expire patterns for re-learning
SELECT expire_old_authority_patterns('beauty');
```

## Error Handling

### Common Errors

1. **Insufficient Samples**
```json
{
  "error": "Insufficient samples (8). Need at least 10 posts."
}
```
**Solution**: Ensure category has at least 10 non-promo posts with captions.

2. **Invalid Sample Size**
```json
{
  "error": "sample_size must be between 10 and 50"
}
```
**Solution**: Use sample_size between 10-50.

3. **Missing Category**
```json
{
  "error": "Missing required field: category"
}
```
**Solution**: Include category in request body.

## Testing

### Test Learning Function

```typescript
// test-radar-learn.ts
const response = await fetch("http://localhost:54321/functions/v1/radar-learn-brand-authority", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ANON_KEY}`,
  },
  body: JSON.stringify({
    category: "beauty",
    sample_size: 15,
  }),
});

const result = await response.json();
console.log("Learned patterns:", result.result.patterns);
console.log("Confidence:", result.result.patterns.confidence_score);
console.log("Cost:", result.result.cost_usd);
```

## Deployment

### 1. Apply Migration

```bash
supabase db push
```

### 2. Deploy Function

```bash
supabase functions deploy radar-learn-brand-authority --no-verify-jwt
```

### 3. Verify Deployment

```bash
curl -X POST https://your-project.supabase.co/functions/v1/radar-learn-brand-authority \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"category": "beauty"}'
```

## Best Practices

1. **Learn Once, Use Many**: Learn patterns once per category, use for 30 days
2. **Monthly Refresh**: Re-learn patterns monthly to adapt to trends
3. **Sample Diversity**: Use 15-25 posts for balanced learning
4. **Pre-Filter First**: Apply learned patterns before Claude analysis to save costs
5. **Monitor Confidence**: Re-learn if confidence drops below 0.70

## Roadmap

- [ ] Auto-detect when patterns become stale (accuracy drops)
- [ ] Multi-language pattern learning (Indonesian + English)
- [ ] Pattern versioning (compare pattern evolution over time)
- [ ] A/B testing different pattern confidence thresholds
- [ ] Integration with real-time content filtering

## Support

For issues or questions:
- Check logs: `supabase functions logs radar-learn-brand-authority`
- Verify patterns: Query `gv_brand_authority_patterns` table
- Test locally: `supabase functions serve radar-learn-brand-authority`
