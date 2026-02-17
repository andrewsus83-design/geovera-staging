# QA Generator Edge Function

Generates 1500 high-quality Question-Answer pairs per category following the SEO_GEO_FIXED_VARIABLE_MODEL.md specification (Step SEO-5).

## Overview

This Edge Function implements Claude-powered reverse engineering to generate 1500 QA pairs per category with platform-specific NLP optimization and human behavior analysis.

## Distribution Strategy

Based on **Step SEO-5** from SEO_GEO_FIXED_VARIABLE_MODEL.md:

- **Social (600 QA - 40%)**: Visual discovery, engagement-focused, viral hooks
- **GEO (500 QA - 33%)**: Citation-worthy, authoritative, AI-optimized
- **SEO (400 QA - 27%)**: Long-form, keyword-optimized, search intent

## Features

### Platform Behavior Analysis

**SOCIAL (600 QA)**
- User Behavior: Visual discovery, quick consumption, engagement triggers
- NLP Optimization: Viral hooks, short answers (50-150 words), trending formats
- Platforms: TikTok (250), Instagram (200), YouTube (150)

**GEO (500 QA)**
- User Behavior: Conversational AI queries, quick authoritative answers
- NLP Optimization: Citation-worthy facts, authority signals, structured data
- Question Types: Direct queries, recommendations, knowledge, comparisons

**SEO (400 QA)**
- User Behavior: Information-seeking, detailed research, intent-based
- NLP Optimization: Long-form (200-400 words), keyword density, semantic relevance
- Question Types: Informational, commercial, comparison, local SEO

### Sub-Category Tagging

- Auto-detects sub-category from question keywords
- Uses gv_sub_categories table for matching
- Supports multi-category products

### Quality Scoring

Each QA pair receives a quality score (0.00-1.00) based on:
- Answer completeness: 30%
- Factual accuracy: 25%
- Platform optimization: 20%
- Keyword relevance: 15%
- User value: 10%

## API Endpoint

```
POST /qa-generator
```

## Request Format

```json
{
  "category_id": "uuid-of-category"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "category_id": "uuid",
  "category_name": "Beauty & Skincare",
  "qa_pairs_generated": 1500,
  "distribution": {
    "social": "600 (40.0%)",
    "geo": "500 (33.3%)",
    "seo": "400 (26.7%)"
  },
  "target_distribution": {
    "social": "600 (40%)",
    "geo": "500 (33%)",
    "seo": "400 (27%)"
  },
  "cost_usd": 0.48,
  "expires_at": "2026-03-19T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Category already has 1500 active QA pairs",
  "message": "QA pairs are valid for 30 days. Wait for expiration or delete manually.",
  "existing_count": 1500
}
```

## Database Schema

Stores QA pairs in `gv_qa_pairs` table:

```sql
CREATE TABLE gv_qa_pairs (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES gv_categories(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('seo', 'geo', 'social')),
  sub_category TEXT,
  keywords TEXT[],
  quality_score DECIMAL(3,2),
  used_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Usage Examples

### Generate QA Pairs for a Category

```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/qa-generator', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    category_id: 'uuid-of-beauty-category'
  })
});

const data = await response.json();
console.log(`Generated ${data.qa_pairs_generated} QA pairs`);
console.log(`Distribution:`, data.distribution);
```

### Query QA Pairs by Platform

```typescript
// Get all Social QA pairs for a category
const { data: socialQA } = await supabase
  .from('gv_qa_pairs')
  .select('*')
  .eq('category_id', categoryId)
  .eq('platform', 'social')
  .gt('expires_at', new Date().toISOString())
  .order('quality_score', { ascending: false });
```

### Query QA Pairs by Sub-Category

```typescript
// Get skincare QA pairs
const { data: skincareQA } = await supabase
  .from('gv_qa_pairs')
  .select('*')
  .eq('category_id', categoryId)
  .eq('sub_category', 'skincare')
  .gt('expires_at', new Date().toISOString())
  .limit(100);
```

## Cost Estimation

- Model: Claude 3.5 Sonnet
- Input tokens: ~10,000
- Output tokens: ~30,000
- Estimated cost: $0.48 per generation
- Monthly cost (4 categories): $1.92

## Expiration & Regeneration

- QA pairs expire after 30 days
- Automatic cleanup of expired pairs
- Monthly regeneration recommended
- Prevents duplicate generation for active pairs

## Error Handling

The function handles:
- Missing category_id
- Invalid category
- Existing active QA pairs
- Claude API errors
- Database errors
- Batch insert failures

## Testing

### Deploy Function

```bash
supabase functions deploy qa-generator
```

### Test with curl

```bash
curl -X POST https://your-project.supabase.co/functions/v1/qa-generator \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "your-category-uuid"
  }'
```

## Integration with Fixed/Variable Model

This function implements **Step SEO-5** from the Fixed/Variable cost model:

### Fixed Cost (Category-Level)
- Runs monthly for each category
- Generates 1500 QA pairs per category
- Cost: $12.00 per category/month (as per model)
- Shared across all brands in category

### Variable Cost (Brand-Level)
- Brands select relevant QA pairs from pool
- Customize content for brand voice
- Publish to highest-impact platforms first
- Track performance by platform

## Platform Distribution Logic

```
Total: 1500 QA pairs per category

SOCIAL (600 - 40%):
├─ TikTok: 250 QA (viral content, unboxing, reviews)
├─ Instagram: 200 QA (transformations, tutorials, tips)
└─ YouTube: 150 QA (detailed reviews, guides, comparisons)

GEO (500 - 33%):
├─ Direct queries: 150 QA (what is, top brands)
├─ Recommendations: 125 QA (recommend for, which to buy)
├─ Knowledge: 125 QA (how it works, is it safe)
└─ Comparisons: 100 QA (X vs Y, differences)

SEO (400 - 27%):
├─ Informational: 150 QA (how to choose, benefits, guides)
├─ Commercial: 100 QA (buy online, price, deals)
├─ Comparison: 80 QA (detailed vs, alternatives)
└─ Local SEO: 70 QA (Jakarta, near me, local stores)
```

## NLP Optimization Details

### Social Platform
- Engagement triggers: curiosity gaps, emotional hooks
- Trending formats: challenges, transformations, hacks
- Visual-ready: descriptions optimized for visual content
- Hashtag strategy: trending + niche tags

### GEO Platform
- Authority signals: statistics, studies, expert quotes
- Citation-worthy: factual density, structured data
- AI-friendly: clear answers, list formats, comparisons
- Trust factors: certifications, endorsements, proof points

### SEO Platform
- Keyword optimization: density, semantic relevance, LSI
- Search intent: informational, transactional, navigational
- Long-form structure: headings, lists, bold keywords
- Comprehensive coverage: all aspects of topic

## Monitoring & Analytics

Track QA pair performance:
- `used_count`: How many times QA used by brands
- `quality_score`: AI-assigned quality rating
- Platform distribution accuracy
- Sub-category coverage
- Keyword relevance

## Future Enhancements

1. Multi-language support (Bahasa Indonesia + English)
2. Real-time regeneration based on trends
3. A/B testing different answer formats
4. Performance tracking per QA pair
5. Auto-archive low-performing QAs
6. Brand-specific QA customization
7. Integration with content generation pipeline

## Related Documentation

- SEO_GEO_FIXED_VARIABLE_MODEL.md (Step SEO-5)
- GEOVERA_COMPLETE_ARCHITECTURE_2026.md
- gv_qa_pairs table schema in migrations

## Support

For issues or questions, contact the GeoVera development team.
