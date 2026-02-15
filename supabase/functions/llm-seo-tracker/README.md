# LLM SEO Tracker - GEO (Generative Engine Optimization)

## Overview
Tracks brand visibility across AI platforms (ChatGPT, Gemini, Claude, Perplexity) for **GEO keywords** (Generative Engine Optimization). This is part of Feature 2: LLM SEO, GEO & Social Search.

## What is GEO?
GEO (Generative Engine Optimization) is optimization for AI search engines and chat interfaces. Unlike traditional SEO which focuses on Google search results, GEO tracks:
- Brand mentions in AI chat responses
- Citation frequency in AI-generated answers
- Entity recognition by AI models
- Competitive positioning in AI search results

## Platforms Tracked
1. **ChatGPT** (OpenAI GPT-4)
2. **Gemini** (Google)
3. **Claude** (Anthropic)
4. **Perplexity** (Real-time AI search)

## API Endpoint
```
POST /llm-seo-tracker
```

## Request Body
```typescript
{
  "brand_id": "uuid",
  "keyword_ids": ["uuid", "uuid"], // Optional: specific keywords
  "platforms": ["chatgpt", "gemini", "perplexity", "claude"] // Optional: default all
}
```

## Response
```typescript
{
  "success": true,
  "brand_id": "uuid",
  "keywords_tracked": 5,
  "platforms": ["chatgpt", "gemini", "perplexity", "claude"],
  "cost_usd": 0.0175,
  "results": [
    {
      "keyword_id": "uuid",
      "keyword": "best skincare brands indonesia",
      "platforms": {
        "chatgpt": {
          "brand_appeared": true,
          "brand_rank": 3,
          "competitors_count": 7,
          "top_competitor": "wardah"
        },
        "gemini": {
          "brand_appeared": false,
          "brand_rank": null,
          "competitors_count": 10,
          "top_competitor": "emina"
        }
      }
    }
  ]
}
```

## Database Updates

### 1. gv_search_results
Stores raw search results from each AI platform:
```sql
INSERT INTO gv_search_results (
  keyword_id,
  brand_id,
  platform,
  search_engine, -- 'chatgpt', 'gemini', etc.
  brand_rank,
  brand_url,
  brand_appeared,
  top_results,
  competitors_found,
  competitor_positions,
  total_results,
  raw_response
)
```

### 2. gv_keywords
Updates keyword performance metrics:
```sql
UPDATE gv_keywords SET
  current_rank = 3,
  best_rank = 2,
  total_searches = total_searches + 1,
  last_tracked_at = NOW()
WHERE id = keyword_id
```

## Cost Structure
| Platform | Cost per Query | Model Used |
|----------|---------------|------------|
| ChatGPT | $0.002 | GPT-4 Turbo |
| Gemini | $0.0005 | Gemini Pro |
| Perplexity | $0.001 | Sonar Online |
| Claude | $0.00025 | Claude Haiku |

**Total per keyword**: ~$0.00375 for all 4 platforms

## Tier Limits
| Tier | Keywords/Month | GEO Tracking |
|------|---------------|--------------|
| Basic | 5 | ✅ |
| Premium | 8 | ✅ |
| Partner | 15 | ✅ |

## Environment Variables Required
```bash
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
PERPLEXITY_API_KEY=pplx-...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Usage Example

### Curl
```bash
curl -X POST https://your-project.supabase.co/functions/v1/llm-seo-tracker \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "brand-uuid",
    "platforms": ["chatgpt", "perplexity"]
  }'
```

### JavaScript
```javascript
const { data, error } = await supabase.functions.invoke('llm-seo-tracker', {
  body: {
    brand_id: brandId,
    keyword_ids: [keywordId1, keywordId2], // Optional
    platforms: ['chatgpt', 'gemini'] // Optional
  }
});
```

## How It Works

### 1. Keyword Selection
- Fetches all active **GEO keywords** (`keyword_type = 'geo'`)
- Filters by `brand_id` (personalized per logged-in brand)
- Optional: filter by specific `keyword_ids`

### 2. AI Platform Queries
For each keyword, queries each AI platform:
```
Keyword: "best organic skincare brands"
→ ChatGPT: Returns top 10 brands
→ Gemini: Returns top 10 brands
→ Perplexity: Returns top 10 brands (with citations)
→ Claude: Returns top 10 brands
```

### 3. Brand Detection
Analyzes each result to detect:
- **Brand Appearance**: Is our brand mentioned?
- **Brand Rank**: What position (1-10)?
- **Competitors**: Which other brands appear?
- **Competitor Positions**: Where do they rank?

### 4. Data Storage
- Saves raw results to `gv_search_results`
- Updates keyword performance in `gv_keywords`
- Increments tier usage counter

### 5. Competitor Data as Byproduct
**Important**: Competitor data is collected passively:
- Competitors appear because they rank on same keywords
- We DON'T run separate deep research on competitors
- Competitor insights = analysis of byproduct data
- 1 subscription = 1 brand research ONLY

## Personalization Model
```
User Login → Brand A
↓
Fetch GEO Keywords for Brand A
↓
Query AI Platforms: "best skincare Indonesia"
↓
Results: [Brand A (rank 3), Wardah (rank 1), Emina (rank 2), ...]
↓
Store: Brand A rank = 3
       Competitors = [Wardah, Emina] (byproduct data)
↓
Dashboard shows:
- Your rank: #3
- Top competitor: Wardah (#1)
- Opportunity: Move up 2 positions
```

**NOT**: Running separate research on Wardah or Emina.

## Integration with Daily Insights
Results from LLM SEO Tracker feed into:
- **Daily Insights**: Ranking changes, competitor alerts
- **AI Articles**: Weekly GEO performance reports
- **Action Items**: Tasks to improve AI visibility

## Notes
- This function tracks **GEO keywords** only (keyword_type = 'geo')
- For traditional SEO, use SerpAPI integration
- For Social Search, use Apify integration
- All AI platforms require real API keys (no dummy data)
- Cost tracking updates `gv_tier_usage.total_cost_usd`
