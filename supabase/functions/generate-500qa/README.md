# Generate 500QA - Deep Strategic Questions

## Overview
Generates **500 deep strategic questions** monthly using Claude Sonnet 3.5 for comprehensive brand intelligence across SEO, GEO, Social, and Market channels.

**Upgrade from 300QA**: 66% more questions, enhanced categories, impact scoring, difficulty rating.

---

## API Endpoint
```
POST /generate-500qa
```

## Request Body
```typescript
{
  "brand_id": "uuid",
  "force_regenerate"?: boolean  // Optional: regenerate even if already exists this month
}
```

## Response
```typescript
{
  "success": true,
  "brand_id": "uuid",
  "questions_generated": 500,
  "cost_usd": 0.35,
  "breakdown": {
    "seo": 100,          // Traditional search optimization
    "geo": 120,          // AI platform optimization
    "social": 100,       // Social media search
    "brand": 60,         // Direct brand visibility
    "competitor": 60,    // Market positioning (byproduct)
    "market": 30,        // Industry trends
    "content": 20,       // Content opportunities (NEW)
    "technical": 10      // Technical SEO (NEW)
  },
  "month": "February 2026"
}
```

---

## Question Categories (500 Total)

### 1. **SEO Questions (100)** - Traditional Search
- **Commercial Intent (20)**: "buy [product]", "price [product]", "[product] near me"
- **Informational (30)**: "how to [use product]", "benefits of [product]"
- **Comparison (25)**: "[brand] vs [competitor]", "best [category] brands"
- **Local SEO (15)**: "[product] Jakarta", "toko [brand] Surabaya"
- **Long-tail (10)**: Very specific, low competition queries

### 2. **GEO Questions (120)** - AI Platform Optimization
- **Direct Brand (25)**: "what is [brand]", "tell me about [brand]"
- **Recommendation (30)**: "recommend [product] for [use case]"
- **Comparison (25)**: "compare [brand] with [competitor]"
- **Use Case (20)**: "which [product] for [specific need]"
- **Knowledge (20)**: "[ingredient] in [brand]", "is [brand] safe"

### 3. **Social Search Questions (100)** - Social Media
- **TikTok (35)**: "[brand] review", "unboxing [product]", "[brand] haul"
- **Instagram (30)**: "[product] tutorial", "[brand] transformation"
- **YouTube (35)**: "[product] review indonesia", "cara pakai [product]"

### 4. **Brand Awareness (60)** - Direct Brand Visibility
- **Product Queries (20)**: "[brand] products", "[brand] best sellers"
- **Information (20)**: "[brand] ingredients", "[brand] halal certified"
- **Store Queries (10)**: "[brand] official store", "where to buy [brand]"
- **Corporate (10)**: "[brand] founder", "[brand] sustainability"

### 5. **Competitive Intelligence (60)** - Market Positioning
- **Direct Comparison (20)**: "[brand] vs [competitor]"
- **Alternative Seeking (20)**: "alternative to [competitor]"
- **Category Leaders (10)**: "top [category] brands"
- **Market Gaps (10)**: "affordable [category]", "premium [category]"

### 6. **Market Trends (30)** - Industry Intelligence
- **Trending Topics (10)**: "trending [category] 2026"
- **Seasonal Trends (10)**: "[category] musim hujan", "[product] lebaran"
- **Emerging Trends (10)**: "new [category] trends"

### 7. **Content Strategy (20)** - Content Opportunities (NEW)
- **Tutorial Content (7)**: "how to use [product]"
- **Problem-Solving (7)**: "[problem] solution"
- **Educational (6)**: "benefits of [ingredient]"

### 8. **Technical SEO (10)** - Technical Optimization (NEW)
- **Schema Markup (3)**: Questions triggering rich snippets
- **Featured Snippets (4)**: Featured snippet opportunities
- **Voice Search (3)**: Conversational, question-based queries

---

## Enhanced Fields

Each question includes:

```typescript
{
  "question": "beli skincare organic murah Jakarta",
  "category": "seo",
  "priority": 5,                    // 1-5 (5 = highest)
  "impact_score": 95,               // 1-100 (business impact)
  "search_type": "google",          // 'google', 'ai_platform', 'social_media'
  "expected_answer_contains": [...],
  "difficulty": "medium"            // 'easy', 'medium', 'hard'
}
```

### **Impact Score (1-100)**
Calculated based on:
- **Commercial Intent**: Ready to buy = 100, informational = 20
- **Search Volume**: High volume = +20, low volume = +5
- **Conversion Potential**: Direct purchase intent = +30
- **Brand Visibility**: Brand mention in SERP = +10

### **Difficulty Rating**
- **Easy**: Low competition, long-tail, specific queries
- **Medium**: Moderate competition, mid-tail queries
- **Hard**: High competition, head terms, broad queries

---

## Database Storage

Questions are stored in `gv_keywords` table:

```sql
INSERT INTO gv_keywords (
  brand_id,
  keyword,              -- The question
  keyword_type,         -- 'seo', 'geo', or 'social'
  source,               -- 'ai_suggested'
  suggested_by_ai,      -- 'claude_500qa'
  priority,             -- 1-5
  impact_score,         -- 1-100 (NEW)
  difficulty,           -- 'easy', 'medium', 'hard' (NEW)
  active                -- true
)
```

---

## Cost Structure

| Component | Cost |
|-----------|------|
| Claude Sonnet 3.5 Input (~6000 tokens) | $0.018 |
| Claude Sonnet 3.5 Output (~20000 tokens) | $0.30 |
| **Total per Generation** | **$0.35** |

**Frequency**: Once per month (1st of each month)
**Monthly Cost**: $0.35/brand

---

## Usage Example

### cURL
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-500qa \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "your-brand-uuid"
  }'
```

### JavaScript
```javascript
const { data, error } = await supabase.functions.invoke('generate-500qa', {
  body: {
    brand_id: brandId,
    force_regenerate: false  // Optional
  }
});

console.log(`Generated ${data.questions_generated} questions`);
console.log(`Cost: $${data.cost_usd}`);
console.log('Breakdown:', data.breakdown);
```

---

## Quality Standards

✅ **Realistic**: All questions are queries real users would search
✅ **Diverse**: Covers entire customer journey (awareness → loyalty)
✅ **Strategic**: High commercial intent and business impact
✅ **Localized**: Mix of Bahasa Indonesia (60%) and English (40%)
✅ **Deep**: Includes long-tail, niche, and emerging queries
✅ **Prioritized**: Impact scores guide daily research selection

---

## Integration with Daily Research

500QA feeds into **daily-auto-research** function:

```
Monthly: Generate 500QA
↓
Daily: Select top questions based on priority × impact_score
↓
Research with Perplexity + SerpAPI
↓
Suggest top 5/10/20 to user (tier-based)
```

---

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...     # Claude API key
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Notes

- Runs **monthly** (typically 1st of each month)
- Prevents duplicate generation within same month (unless `force_regenerate=true`)
- Questions stored with `suggested_by_ai='claude_500qa'` for tracking
- Cost tracked in `gv_tier_usage.total_cost_usd`
- Replaces `generate-300qa` function (deprecated)

---

**Built**: February 15, 2026
**Status**: ✅ Production Ready
**Cost**: $0.35/month per brand
