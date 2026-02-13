# Radar Functions - Deployment Guide

Step-by-step guide to deploy and test all Radar Edge Functions.

---

## Prerequisites

1. Supabase CLI installed
   ```bash
   npm install -g supabase
   ```

2. Logged into Supabase
   ```bash
   supabase login
   ```

3. Linked to your project
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. API Keys Required
   - **Perplexity API key** (for brand/creator discovery)
     - Sign up at https://www.perplexity.ai/
     - Get API key from dashboard
     - Note: Requires paid plan for API access

   - **SerpAPI key** (for YouTube/Google Trends)
     - Sign up at https://serpapi.com
     - Get API key from dashboard
     - Free plan: 100 searches/month
     - Recommended: Pay-as-you-go at $0.001/search

   - **Apify API token** (for Instagram/TikTok)
     - Sign up at https://apify.com
     - Get API token from dashboard

---

## Step 1: Set Environment Variables

```bash
# Set Perplexity API key
supabase secrets set PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx

# Set SerpAPI key (NEW)
supabase secrets set SERPAPI_KEY=your_serpapi_key_here

# Set Apify API token
supabase secrets set APIFY_API_TOKEN=your_apify_token_here

# Verify secrets
supabase secrets list
```

Expected output:
```
PERPLEXITY_API_KEY
SERPAPI_KEY
APIFY_API_TOKEN
SUPABASE_URL (auto-set)
SUPABASE_SERVICE_ROLE_KEY (auto-set)
```

---

## Step 2: Deploy Functions

Deploy all Radar functions:

```bash
# Deploy brand discovery function
supabase functions deploy radar-discover-brands

# Deploy creator discovery function
supabase functions deploy radar-discover-creators

# Deploy content scraping functions
supabase functions deploy radar-scrape-content
supabase functions deploy radar-scrape-serpapi

# Deploy analysis function
supabase functions deploy radar-analyze-content

# Deploy calculation functions
supabase functions deploy radar-calculate-rankings
supabase functions deploy radar-calculate-marketshare
supabase functions deploy radar-discover-trends
```

Expected output:
```
Deploying function: radar-discover-brands
Function deployed successfully!
Function URL: https://PROJECT_ID.supabase.co/functions/v1/radar-discover-brands

Deploying function: radar-discover-creators
Function deployed successfully!
Function URL: https://PROJECT_ID.supabase.co/functions/v1/radar-discover-creators

Deploying function: radar-scrape-serpapi
Function deployed successfully!
Function URL: https://PROJECT_ID.supabase.co/functions/v1/radar-scrape-serpapi

... (additional functions)
```

---

## Step 3: Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs radar-discover-brands
supabase functions logs radar-discover-creators
```

---

## Step 4: Test Functions

### Option A: Using the Test Script

```bash
# Set environment variables
export SUPABASE_URL=https://YOUR_PROJECT.supabase.co
export SUPABASE_ANON_KEY=your-anon-key

# Test brand discovery
deno run --allow-net --allow-env supabase/functions/test-radar-discovery.ts brands

# Test creator discovery
deno run --allow-net --allow-env supabase/functions/test-radar-discovery.ts creators
```

### Option B: Using cURL

**Test Brand Discovery:**
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/radar-discover-brands' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "uuid-here",
    "category": "beauty",
    "country": "United States"
  }'
```

**Test Creator Discovery:**
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/radar-discover-creators' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "beauty",
    "country": "United States",
    "batch_size": 10
  }'
```

### Option C: Using Supabase CLI

```bash
# Invoke brand discovery
supabase functions invoke radar-discover-brands \
  --body '{
    "brand_id": "uuid-here",
    "category": "beauty",
    "country": "United States"
  }'

# Invoke creator discovery
supabase functions invoke radar-discover-creators \
  --body '{
    "category": "beauty",
    "country": "United States",
    "batch_size": 10
  }'
```

---

## Step 5: Monitor and Debug

### View Logs

```bash
# Real-time logs
supabase functions logs radar-discover-brands --follow
supabase functions logs radar-discover-creators --follow

# Recent logs
supabase functions logs radar-discover-brands --limit 50
```

### Check Database

```sql
-- View discovered brands
SELECT * FROM gv_competitors ORDER BY created_at DESC LIMIT 10;

-- View discovered creators
SELECT * FROM gv_discovered_creators ORDER BY created_at DESC LIMIT 10;

-- Check creator discovery stats
SELECT
  category,
  status,
  COUNT(*) as count,
  SUM(estimated_followers) as total_followers
FROM gv_discovered_creators
GROUP BY category, status
ORDER BY category, status;
```

---

## Step 6: Integration into Frontend

### Example: React Component

```tsx
import { useSupabaseClient } from '@supabase/auth-helpers-react';

function BrandDiscovery({ brandId }: { brandId: string }) {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const discoverBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'radar-discover-brands',
        {
          body: {
            brand_id: brandId,
            category: 'beauty',
            country: 'United States'
          }
        }
      );

      if (error) throw error;
      setResults(data);
    } catch (err) {
      console.error('Discovery failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={discoverBrands} disabled={loading}>
        {loading ? 'Discovering...' : 'Discover Competitors'}
      </button>
      {results && (
        <div>
          <h3>Found {results.brands?.length} competitors</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## Troubleshooting

### Error: "Perplexity API key not configured"

```bash
# Check if secret is set
supabase secrets list

# Set the secret
supabase secrets set PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx

# Redeploy function
supabase functions deploy radar-discover-brands
```

### Error: "Unauthorized"

- Verify you're passing the correct `Authorization` header
- Check that the token is valid (not expired)
- Ensure user is authenticated

### Error: "Brand not found"

- Verify the `brand_id` exists in the `brands` table
- Check that the UUID format is correct

### Error: "Failed to parse Perplexity response"

- Check function logs for the raw response
- Perplexity might have returned non-JSON content
- Try with a different category or country

### No results returned

- Check Perplexity API key is valid
- Verify API quota is not exceeded
- Try a more popular category/country combination

---

## Cost Management

### Monitor Usage

```sql
-- Create a view for cost tracking (optional)
CREATE VIEW v_radar_discovery_costs AS
SELECT
  'brands' as function_name,
  COUNT(*) as calls,
  AVG((verification_result->>'tokens')::numeric) as avg_tokens,
  SUM((verification_result->>'tokens')::numeric) as total_tokens
FROM gv_competitors
WHERE created_at > NOW() - INTERVAL '30 days'
UNION ALL
SELECT
  'creators' as function_name,
  COUNT(*) as calls,
  0 as avg_tokens, -- Not tracked in this table
  0 as total_tokens
FROM gv_discovered_creators
WHERE created_at > NOW() - INTERVAL '30 days';
```

### Expected Costs

| Function | Tokens/Call | Cost/Call | Cost/100 Calls |
|----------|-------------|-----------|----------------|
| radar-discover-brands | ~1,500 | $0.0015 | $0.15 |
| radar-discover-creators | ~3,500 | $0.0035 | $0.35 |

### Cost Optimization Tips

1. **Cache results** - Store and reuse discoveries for 30+ days
2. **Batch requests** - Discover multiple categories at once
3. **Rate limiting** - Limit calls to 1 per minute per user
4. **Use smaller batch_size** - Start with 10-20 creators instead of 40

---

## Production Checklist

- [ ] Perplexity API key set and verified
- [ ] Both functions deployed successfully
- [ ] Test calls completed without errors
- [ ] Database tables have proper indexes
- [ ] RLS policies configured (if needed)
- [ ] Error monitoring set up
- [ ] Cost alerts configured
- [ ] Frontend integration tested
- [ ] Rate limiting implemented
- [ ] Documentation reviewed by team

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Perplexity API Docs:** https://docs.perplexity.ai/
- **Edge Functions Logs:** `supabase functions logs <function-name>`
- **Database Studio:** https://app.supabase.com/project/YOUR_PROJECT/editor

---

## Next Steps

1. Deploy to production
2. Set up monitoring and alerts
3. Integrate into frontend workflows
4. Create automated discovery pipelines
5. Build analytics dashboards for discoveries

---

**Deployment Complete!** 🎉

Your Radar Discovery functions are now live and ready to discover competitors and creators using Perplexity AI.
