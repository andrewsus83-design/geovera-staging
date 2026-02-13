# Hub Discover Content Function

Find trending topics and relevant content using Perplexity AI.

## Purpose

This function discovers trending topics in a specific category and finds the most relevant, high-quality creator content to feature in Authority Hub collections.

## API Endpoint

```
POST /functions/v1/hub-discover-content
```

## Request Body

```typescript
{
  category: string;           // Category to search (e.g., "beauty", "food", "tech")
  article_type: "hot" | "review" | "education" | "nice_to_know";
  count?: number;             // Number of content pieces to return (default: 10)
}
```

## Response

```typescript
{
  success: true,
  result: {
    topic: string;              // Trending topic discovered
    trending_score: number;     // How trending it is (0.0-1.0)
    content_ids: string[];      // Array of content IDs (5-10 pieces)
    keywords: string[];         // Keywords associated with topic
    estimated_reach: number;    // Total reach of selected content
    cost_usd: number;          // API cost for this request
  }
}
```

## Process Flow

1. **Discover Trending Topic (Perplexity)**
   - Query Perplexity AI with category-specific prompt
   - Model: `sonar-pro` (real-time web search)
   - Get topic, keywords, and trending score

2. **Find Relevant Content (Database)**
   - Search `gv_creator_content` using keywords
   - Filter by category, date range (last 30 days), quality score
   - Return top 50 candidates

3. **Score and Rank Content**
   - Calculate engagement rate (likes + comments + shares / reach)
   - Calculate recency score (exponential decay over 30 days)
   - Combine with quality score
   - Final score = engagement × recency × quality

4. **Select Top Content**
   - Sort by score descending
   - Return top N pieces (default 10)

## Example Usage

### cURL

```bash
curl -X POST https://your-project.supabase.co/functions/v1/hub-discover-content \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "article_type": "hot",
    "count": 10
  }'
```

### JavaScript

```javascript
const { data, error } = await supabase.functions.invoke('hub-discover-content', {
  body: {
    category: 'beauty',
    article_type: 'hot',
    count: 10
  }
});

if (error) {
  console.error('Discovery failed:', error);
} else {
  console.log('Discovered topic:', data.result.topic);
  console.log('Content IDs:', data.result.content_ids);
}
```

### TypeScript

```typescript
interface DiscoveryResult {
  topic: string;
  trending_score: number;
  content_ids: string[];
  keywords: string[];
  estimated_reach: number;
  cost_usd: number;
}

const response = await fetch('https://your-project.supabase.co/functions/v1/hub-discover-content', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'food',
    article_type: 'review',
    count: 7
  })
});

const { result }: { result: DiscoveryResult } = await response.json();
```

## Article Type Behaviors

### `hot` (Trending)
- Focuses on viral moments in last 24-48 hours
- Prioritizes recency over quality
- Example: "What's trending in beauty RIGHT NOW?"

### `review` (Analysis)
- Looks for product reviews and discussions
- Focuses on newly launched or controversial items
- Example: "What beauty products are getting the most reviews?"

### `education` (How-To)
- Searches for educational content and tutorials
- Targets "how-to" searches and skill-building
- Example: "What beauty tutorials are people searching for?"

### `nice_to_know` (Insights)
- Finds interesting facts and industry knowledge
- Focuses on surprising or lesser-known information
- Example: "What beauty insights would Indonesian audiences find valuable?"

## Scoring Algorithm

```
Final Score = Engagement Rate × Recency Score × Quality Score

Where:
- Engagement Rate = (likes + comments + shares) / reach
- Recency Score = exp(-age_in_days / 15)  // Half-life of 15 days
- Quality Score = 0.0 - 1.0 (from Claude analysis)
```

## Cost Tracking

- Perplexity sonar-pro: ~$0.001 per request
- Total cost returned in `cost_usd` field

## Error Handling

### Common Errors

1. **Missing API Key**
   ```json
   {
     "error": "Failed to discover content",
     "details": "PERPLEXITY_API_KEY not set"
   }
   ```

2. **Invalid Article Type**
   ```json
   {
     "error": "Invalid article_type. Must be: hot, review, education, or nice_to_know"
   }
   ```

3. **No Content Found**
   ```json
   {
     "error": "Failed to discover content",
     "details": "No relevant content found for the given criteria"
   }
   ```

## Environment Variables

Required:
- `PERPLEXITY_API_KEY` - Perplexity API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

## Database Dependencies

### Tables Used
- `gv_creator_content` - Creator content with engagement metrics
- `gv_creators` - Creator profiles (joined for category)

### Required Columns
- `category` - Content category
- `caption` - Post caption (searched for keywords)
- `hashtags` - Hashtags (searched for keywords)
- `posted_at` - Post date (for recency)
- `likes`, `comments`, `shares` - Engagement metrics
- `reach` - Total reach (for engagement rate)
- `quality_score` - Claude quality score (0.0-1.0)
- `originality_score` - Claude originality score

## Performance

- Average execution time: 2-4 seconds
- Perplexity API: ~1 second
- Database query: ~1-2 seconds
- Scoring & ranking: <1 second

## Rate Limits

- Perplexity API: 100 requests/minute (check your plan)
- Implement retry logic with exponential backoff
- Consider caching results for popular categories

## Testing

```bash
# Test with local Supabase
supabase functions serve hub-discover-content

# In another terminal
curl -X POST http://localhost:54321/functions/v1/hub-discover-content \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "article_type": "hot",
    "count": 5
  }'
```

## Deployment

```bash
# Deploy to Supabase
supabase functions deploy hub-discover-content

# Set environment variables
supabase secrets set PERPLEXITY_API_KEY=your_key_here
```

## Next Steps

After discovering content, use the returned `content_ids` with:
- `hub-generate-article` - Generate articles from content
- `hub-create-collection` - Create complete collection

## Support

For issues or questions, contact the development team or refer to the main project documentation.
