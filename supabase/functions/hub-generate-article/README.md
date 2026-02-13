# Hub Generate Article Function

Generate 200-500 word articles using Claude (analysis) + OpenAI (writing).

## Purpose

This function analyzes creator content using Claude AI to extract insights, then generates a high-quality, neutral article using OpenAI GPT-4o-mini.

## API Endpoint

```
POST /functions/v1/hub-generate-article
```

## Request Body

```typescript
{
  collection_id: string;      // Collection UUID to attach article to
  article_type: "hot" | "review" | "education" | "nice_to_know";
  content_ids: string[];      // 5-10 content pieces to analyze
  target_words?: number;      // Target word count (default: 350)
}
```

## Response

```typescript
{
  success: true,
  result: {
    article_id: string;         // UUID of created article
    title: string;              // Article title (5-10 words)
    content_html: string;       // Full article HTML
    word_count: number;         // Actual word count (200-500)
    reading_time: number;       // Minutes to read
    neutrality_score: number;   // 0.0-1.0 (higher = more neutral)
    cost_usd: number;          // Total API cost
  }
}
```

## Process Flow

### 1. Fetch Content (Database)
- Retrieve 5-10 content pieces from `gv_creator_content`
- Include captions, hashtags, engagement metrics

### 2. Analyze with Claude 3.5 Sonnet
**Purpose**: Reverse engineering and insight extraction

**Extracts**:
- Key insights (3-5 major takeaways)
- Memorable quotes (2-3 direct quotes)
- Actionable tips (3-5 practical tips)
- Common themes (2-3 recurring topics)
- Brand mentions (products/brands mentioned)
- Expertise level (0.0-1.0 scale)

**Model**: `claude-3-5-sonnet-20241022`
**Cost**: ~$0.003-0.015 per request

### 3. Generate Article with OpenAI
**Purpose**: Natural language article generation

**Model**: `gpt-4o-mini` (much cheaper than gpt-4o)
**Cost**: ~$0.001-0.005 per request

**Style Guidelines**:
- Hook-driven first 2 sentences
- Grade 8-10 reading level
- Short paragraphs (2-3 sentences max)
- 2-3 bullet points
- Neutral tone (no promotional language)
- Natural, conversational language

**Structure**:
1. Hook (2 sentences)
2. Main content (3-4 short paragraphs)
3. Bullet points (2-3 items)
4. Conclusion (1-2 sentences)

### 4. Quality Checks
- **Word count**: 200-500 words ✓
- **Neutrality score**: > 0.7 ✓
- **Reading time**: Auto-calculated
- **Promotional language**: Filtered

### 5. Save to Database
- Insert into `gv_hub_articles`
- Link to collection
- Set status to `published`

## Example Usage

### cURL

```bash
curl -X POST https://your-project.supabase.co/functions/v1/hub-generate-article \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "collection_id": "uuid-here",
    "article_type": "hot",
    "content_ids": ["id1", "id2", "id3", "id4", "id5"],
    "target_words": 350
  }'
```

### JavaScript

```javascript
const { data, error } = await supabase.functions.invoke('hub-generate-article', {
  body: {
    collection_id: 'uuid-here',
    article_type: 'education',
    content_ids: ['id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7'],
    target_words: 400
  }
});

if (error) {
  console.error('Generation failed:', error);
} else {
  console.log('Article created:', data.result.article_id);
  console.log('Title:', data.result.title);
  console.log('Word count:', data.result.word_count);
}
```

### TypeScript

```typescript
interface ArticleResult {
  article_id: string;
  title: string;
  content_html: string;
  word_count: number;
  reading_time: number;
  neutrality_score: number;
  cost_usd: number;
}

const response = await fetch('https://your-project.supabase.co/functions/v1/hub-generate-article', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    collection_id: 'uuid-here',
    article_type: 'review',
    content_ids: ['id1', 'id2', 'id3', 'id4', 'id5'],
    target_words: 300
  })
});

const { result }: { result: ArticleResult } = await response.json();
```

## Article Type Styles

### `hot` (Trending)
**Tone**: Exciting, energetic
**Example Hook**: "Right now, Indonesian beauty enthusiasts are obsessing over a surprising new trend. Glass skin is taking over TikTok, and here's why."

### `review` (Analysis)
**Tone**: Analytical, balanced
**Example Hook**: "After analyzing dozens of creator reviews, we've uncovered the truth about viral skincare products. Let's break down what actually works."

### `education` (How-To)
**Tone**: Clear, instructional
**Example Hook**: "Want to master the Korean 10-step skincare routine? You're in the right place. Let's walk through each step together."

### `nice_to_know` (Insights)
**Tone**: Conversational, insightful
**Example Hook**: "Here's something most beauty brands won't tell you about ingredient lists. Understanding these insider secrets can save you thousands of rupiah."

## Quality Criteria

### Word Count ✓
- Minimum: 200 words
- Maximum: 500 words
- Target: 350 words
- Fails if outside range

### Neutrality Score ✓
- Calculated by detecting promotional words
- Threshold: 0.7 (70% neutral)
- Promotional words detected:
  - "buy now", "limited time", "special offer"
  - "discount", "promo", "sale"
  - "get yours", "order now", "shop now"

### Reading Time
- Average: 200 words per minute
- Displayed to users

## Cost Breakdown

| Service | Model | Cost per 1M Tokens | Typical Cost |
|---------|-------|-------------------|--------------|
| Claude (Analysis) | 3.5 Sonnet | $3 input, $15 output | $0.003-0.015 |
| OpenAI (Writing) | gpt-4o-mini | $0.15 input, $0.60 output | $0.001-0.005 |
| **Total** | - | - | **$0.004-0.020** |

GPT-4o-mini is ~10x cheaper than GPT-4o while maintaining quality for this use case.

## Error Handling

### Common Errors

1. **Invalid Content Count**
   ```json
   {
     "error": "Failed to generate article",
     "details": "Content IDs must be between 5 and 10"
   }
   ```

2. **Quality Check Failed**
   ```json
   {
     "error": "Failed to generate article",
     "details": "Article failed quality checks: 150 words (need 200-500), neutrality: 0.6 (need 0.7+)"
   }
   ```

3. **Missing API Keys**
   ```json
   {
     "error": "Failed to generate article",
     "details": "ANTHROPIC_API_KEY not set"
   }
   ```

## Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

## Database Schema

### Input Table
`gv_creator_content`:
- `id`, `caption`, `hashtags`
- `likes`, `comments`, `shares`
- `quality_score`

### Output Table
`gv_hub_articles`:
```sql
- id (UUID)
- collection_id (UUID, FK)
- slug (TEXT, unique)
- title (TEXT)
- article_type (TEXT)
- category (TEXT)
- content_html (TEXT)
- content_markdown (TEXT)
- word_count (INTEGER, 200-500)
- reading_time_minutes (INTEGER)
- neutrality_score (NUMERIC, 0.0-1.0)
- source_content_ids (UUID[])
- embedding_count (INTEGER)
- ai_model (TEXT)
- generation_cost_usd (NUMERIC)
- status (TEXT, default 'published')
- published_at (TIMESTAMPTZ)
```

## Performance

- **Average execution time**: 15-25 seconds
  - Fetch content: ~1 second
  - Claude analysis: ~5-10 seconds
  - OpenAI generation: ~5-10 seconds
  - Quality checks & save: ~1 second

## Rate Limits

- **Claude API**: 50 requests/minute (check your plan)
- **OpenAI API**: 500 requests/minute (tier-dependent)
- Implement retry logic with exponential backoff

## Retry Logic

```javascript
// Built-in retry for transient errors
const maxRetries = 3;
let attempt = 0;

while (attempt < maxRetries) {
  try {
    const result = await generateArticle(...);
    return result;
  } catch (error) {
    if (attempt === maxRetries - 1) throw error;
    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    attempt++;
  }
}
```

## Testing

```bash
# Test locally
supabase functions serve hub-generate-article

# In another terminal
curl -X POST http://localhost:54321/functions/v1/hub-generate-article \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "collection_id": "test-uuid",
    "article_type": "hot",
    "content_ids": ["id1", "id2", "id3", "id4", "id5"],
    "target_words": 300
  }'
```

## Deployment

```bash
# Deploy to Supabase
supabase functions deploy hub-generate-article

# Set secrets
supabase secrets set ANTHROPIC_API_KEY=your_claude_key
supabase secrets set OPENAI_API_KEY=your_openai_key
```

## Best Practices

1. **Content Selection**: Use high-quality, diverse content (5-10 pieces)
2. **Target Words**: Stick to 300-400 for best results
3. **Error Handling**: Always check quality scores before accepting
4. **Cost Monitoring**: Track `cost_usd` in production
5. **Caching**: Consider caching analysis results for repeated content

## Next Steps

After generating an article:
- View in `gv_hub_articles` table
- Access via public Hub page at `/{slug}`
- Track analytics in `gv_hub_analytics`

## Support

For issues or questions, contact the development team or refer to the main project documentation.
