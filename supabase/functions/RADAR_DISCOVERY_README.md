# Radar Discovery Edge Functions

Two production-ready Edge Functions for discovering competitor brands and content creators using Perplexity AI.

---

## 1. radar-discover-brands

Discovers 2-3 competitor brands in a specific category and country using Perplexity's Sonar Pro model.

### Endpoint
```
POST /functions/v1/radar-discover-brands
```

### Request
```json
{
  "brand_id": "uuid",
  "category": "beauty",
  "country": "United States"
}
```

### Response
```json
{
  "success": true,
  "message": "Discovered 3 competitor brands",
  "brands": [
    {
      "brand_name": "Competitor Brand",
      "instagram_handle": "username",
      "tiktok_handle": "username",
      "youtube_handle": "channelname",
      "facebook_handle": "pagename",
      "follower_count_estimate": 150000,
      "positioning": "Premium organic skincare for millennials",
      "differentiators": [
        "Sustainable packaging",
        "Vegan certified",
        "Subscription model"
      ]
    }
  ],
  "competitors_saved": 3,
  "tokens": 1250,
  "cost_usd": "0.0013"
}
```

### Database Table: `gv_competitors`
```sql
CREATE TABLE gv_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  competitor_name TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  competitor_url TEXT,
  competitor_type TEXT,
  market_position TEXT,
  tracking_priority TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Features
- Discovers brands with 10K-500K followers
- Extracts social media handles across 4 platforms
- Saves to `gv_competitors` table
- Auto-assigns tracking priority based on follower count
- Includes cost tracking

---

## 2. radar-discover-creators

Discovers up to 40 content creators per category using Perplexity's Sonar Pro model.

### Endpoint
```
POST /functions/v1/radar-discover-creators
```

### Request
```json
{
  "category": "beauty",
  "country": "United States",
  "batch_size": 40
}
```

### Response
```json
{
  "success": true,
  "message": "Discovered 40 creators",
  "creators": [
    {
      "name": "Creator Name",
      "instagram_handle": "username",
      "tiktok_handle": "username",
      "youtube_handle": "channelname",
      "facebook_handle": "pagename",
      "follower_count": 250000,
      "engagement_rate": 4.5,
      "content_focus": "Makeup tutorials and product reviews",
      "recent_collaborations": ["Sephora", "NYX Cosmetics"]
    }
  ],
  "creators_saved": 38,
  "creators_failed": 2,
  "tokens": 3500,
  "cost_usd": "0.0035"
}
```

### Database Table: `gv_discovered_creators`
```sql
CREATE TABLE gv_discovered_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  category TEXT,
  expected_tier TEXT,
  discovered_via TEXT,
  research_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending_verification',
  verification_result JSONB,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  estimated_followers BIGINT,
  UNIQUE(platform, username)
);
```

### Features
- Discovers 100K-2M follower creators (mid-tier)
- Filters for >3% engagement rate
- Filters for active posting (last 14 days)
- Auto-assigns follower tier (nano/micro/mid/macro/mega)
- Upsert strategy to avoid duplicates
- Batch insert with error handling
- Stores rich metadata in `verification_result` JSONB

---

## Environment Variables Required

Add these to your Supabase project:

```bash
PERPLEXITY_API_KEY=pplx-xxx...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
ALLOWED_ORIGIN=https://geovera.xyz
```

---

## Deployment

```bash
# Deploy both functions
supabase functions deploy radar-discover-brands
supabase functions deploy radar-discover-creators

# Set environment variable
supabase secrets set PERPLEXITY_API_KEY=pplx-xxx...
```

---

## Usage Examples

### Using cURL

**Discover Brands:**
```bash
curl -X POST 'https://PROJECT_ID.supabase.co/functions/v1/radar-discover-brands' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "uuid-here",
    "category": "beauty",
    "country": "United States"
  }'
```

**Discover Creators:**
```bash
curl -X POST 'https://PROJECT_ID.supabase.co/functions/v1/radar-discover-creators' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "country": "United States",
    "batch_size": 40
  }'
```

### Using JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Discover brands
const { data: brandsData } = await supabase.functions.invoke('radar-discover-brands', {
  body: {
    brand_id: 'uuid-here',
    category: 'beauty',
    country: 'United States'
  }
});

// Discover creators
const { data: creatorsData } = await supabase.functions.invoke('radar-discover-creators', {
  body: {
    category: 'beauty',
    country: 'United States',
    batch_size: 40
  }
});
```

---

## Cost Estimates

**Perplexity Sonar Pro Pricing:** ~$1.00 per 1M tokens

| Function | Avg Tokens | Cost per Call |
|----------|------------|---------------|
| radar-discover-brands | ~1,500 | $0.0015 |
| radar-discover-creators | ~3,500 | $0.0035 |

---

## Error Handling

Both functions include comprehensive error handling:

- **401 Unauthorized:** Missing or invalid authorization token
- **400 Bad Request:** Missing required fields
- **404 Not Found:** Brand not found (brands function only)
- **500 Internal Server Error:** API errors, database errors, parsing errors

All errors return:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Features Summary

### Security
- Authorization required via Supabase Auth
- Service role key for database operations
- CORS headers configured

### Reliability
- Comprehensive error handling
- JSON parsing with markdown cleanup
- Batch insert with individual error tracking
- Upsert strategy for duplicates

### Observability
- Console logging at key points
- Token usage tracking
- Cost calculation
- Detailed response metadata

### Data Quality
- Auto-assigns follower tiers
- Determines primary platform
- Stores rich metadata
- Tracks discovery source

---

## Next Steps

1. Deploy functions to Supabase
2. Set `PERPLEXITY_API_KEY` environment variable
3. Test with sample requests
4. Monitor logs and costs
5. Integrate into frontend workflow

---

## Support

For issues or questions:
- Check Supabase function logs
- Verify environment variables are set
- Ensure tables exist with proper schema
- Check Perplexity API key is valid
