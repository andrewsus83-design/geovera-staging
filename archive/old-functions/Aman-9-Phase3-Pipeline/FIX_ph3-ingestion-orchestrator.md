# 🔧 FIX: ph3-ingestion-orchestrator.ts

**File**: ph3-ingestion-orchestrator.ts
**Status**: ❌ NOT PRODUCTION READY (all adapters are stubs)
**Priority**: HIGH (blocking production)

---

## 🚨 PROBLEM

All 4 data source adapters contain TODO/mock implementations:

```typescript
// TODO: Implement actual Google Trends API call
// TODO: Implement actual Apify API call
// TODO: Implement actual Bright Data API call
// TODO: Implement actual SERPAPI call
```

**Current Behavior**: Returns fake/mock data instead of real API calls

---

## ✅ SOLUTION

### **Option 1: Use Existing Real Implementations** (RECOMMENDED)

Real implementations already exist in **Aman-7-Pipeline/**:

1. **✅ SerpAPI** → `Aman-7-Pipeline/serpapi-search.ts`
   - Real Google search scraping
   - Proper token handling (Authorization header)
   - Security fixed (no token in URL)

2. **✅ Apify** → `Aman-7-Pipeline/radar-apify-ingestion.ts`
   - Real TikTok/Instagram scraping
   - Proper token handling (Authorization header)
   - Security fixed (no token in URL)

### **Steps to Fix**:

#### 1. Replace SERPAPIAdapter

**Current (MOCK)**:
```typescript
class SERPAPIAdapter implements SourceAdapter {
  async fetch() {
    // TODO: Implement actual SERPAPI call
    return [{
      source_id: 'serp-001',
      data_points: [{
        signal_layer: '1_verification',
        data_point_name: 'google_ranking',
        raw_value: '{"position": 3, "keyword": "[Test Query]"}',
        // ... mock data
      }]
    }];
  }
}
```

**Fixed (REAL)**:
```typescript
class SERPAPIAdapter implements SourceAdapter {
  async fetch(brandContext: BrandContext) {
    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    if (!serpApiKey) throw new Error('SERPAPI_KEY not configured');

    const results = [];

    for (const query of brandContext.searchQueries) {
      const serpUrl = new URL('https://serpapi.com/search');
      serpUrl.searchParams.set('q', query);
      serpUrl.searchParams.set('location', brandContext.location || 'Indonesia');
      serpUrl.searchParams.set('hl', 'id');
      serpUrl.searchParams.set('gl', 'id');

      const response = await fetch(serpUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${serpApiKey}` // Security: token in header
        }
      });

      if (!response.ok) {
        console.error(`SERPAPI error: ${response.status}`);
        continue;
      }

      const data = await response.json();

      // Transform SERPAPI response to artifact format
      if (data.organic_results) {
        for (const result of data.organic_results) {
          results.push({
            source_id: `serp-${Date.now()}-${Math.random()}`,
            data_points: [{
              signal_layer: '1_verification',
              data_point_name: 'google_ranking',
              raw_value: JSON.stringify({
                position: result.position,
                keyword: query,
                title: result.title,
                link: result.link,
                snippet: result.snippet
              }),
              timestamp: new Date().toISOString(),
              authenticity_score: 0.85, // SERPAPI is reliable
              consistency_tag: 'very_stable',
              corroboration_signal: 'serp'
            }]
          });
        }
      }
    }

    return results;
  }
}
```

#### 2. Replace ApifyAdapter

**Current (MOCK)**:
```typescript
class ApifyAdapter implements SourceAdapter {
  async fetch() {
    // TODO: Implement actual Apify API call
    return [/* mock TikTok data */];
  }
}
```

**Fixed (REAL)**:
```typescript
class ApifyAdapter implements SourceAdapter {
  async fetch(brandContext: BrandContext) {
    const apifyToken = Deno.env.get('APIFY_API_TOKEN');
    if (!apifyToken) throw new Error('APIFY_API_TOKEN not configured');

    const results = [];
    const actorId = brandContext.platform === 'tiktok'
      ? 'clockworks~tiktok-profile-scraper'
      : 'apify~instagram-profile-scraper';

    // Start Apify actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apifyToken}` // Security: token in header
        },
        body: JSON.stringify({
          [brandContext.platform === 'tiktok' ? 'profiles' : 'usernames']:
            [brandContext.handle],
          resultsLimit: 10
        })
      }
    );

    if (!runResponse.ok) {
      throw new Error(`Apify run failed: ${runResponse.status}`);
    }

    const run = await runResponse.json();
    const runId = run.data.id;

    // Poll for completion (max 2 minutes)
    const startTime = Date.now();
    while (Date.now() - startTime < 120000) {
      await new Promise(r => setTimeout(r, 3000));

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}`,
        { headers: { 'Authorization': `Bearer ${apifyToken}` } }
      );

      const status = await statusResponse.json();

      if (status.data.status === 'SUCCEEDED') {
        // Get dataset results
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/datasets/${status.data.defaultDatasetId}/items`,
          { headers: { 'Authorization': `Bearer ${apifyToken}` } }
        );

        const items = await datasetResponse.json();

        // Transform Apify data to artifact format
        for (const item of items) {
          results.push({
            source_id: `apify-${brandContext.platform}-${Date.now()}`,
            data_points: [{
              signal_layer: '2_social',
              data_point_name: 'engagement_rate',
              raw_value: JSON.stringify({
                likes: item.likesCount || item.likes,
                comments: item.commentsCount || item.comments,
                shares: item.sharesCount || item.shares,
                views: item.views || item.viewCount
              }),
              timestamp: new Date(item.createTime || item.timestamp).toISOString(),
              authenticity_score: 0.75, // Apify scraping is good
              consistency_tag: 'fast', // Social data changes fast
              corroboration_signal: 'social'
            }]
          });
        }

        break;
      }

      if (status.data.status === 'FAILED') {
        throw new Error('Apify run failed');
      }
    }

    return results;
  }
}
```

#### 3. Implement GoogleTrendsAdapter

**Google Trends doesn't have official API**, but you can use unofficial library or scraping:

**Option A: Use serpapi.com (has Google Trends support)**
```typescript
class GoogleTrendsAdapter implements SourceAdapter {
  async fetch(brandContext: BrandContext) {
    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    if (!serpApiKey) throw new Error('SERPAPI_KEY required');

    const results = [];

    const trendsUrl = new URL('https://serpapi.com/search');
    trendsUrl.searchParams.set('engine', 'google_trends');
    trendsUrl.searchParams.set('q', brandContext.brandName);
    trendsUrl.searchParams.set('data_type', 'TIMESERIES');

    const response = await fetch(trendsUrl.toString(), {
      headers: { 'Authorization': `Bearer ${serpApiKey}` }
    });

    if (!response.ok) {
      console.error(`Google Trends error: ${response.status}`);
      return results;
    }

    const data = await response.json();

    if (data.interest_over_time) {
      for (const point of data.interest_over_time.timeline_data) {
        results.push({
          source_id: `gtrends-${Date.now()}-${Math.random()}`,
          data_points: [{
            signal_layer: '1_verification',
            data_point_name: 'search_interest',
            raw_value: JSON.stringify({
              date: point.date,
              value: point.values[0].value,
              keyword: brandContext.brandName
            }),
            timestamp: new Date(point.date).toISOString(),
            authenticity_score: 0.9, // Google Trends is very reliable
            consistency_tag: 'slow', // Trends change slowly
            corroboration_signal: 'trends'
          }]
        });
      }
    }

    return results;
  }
}
```

**Option B: Accept that Google Trends is optional**
```typescript
class GoogleTrendsAdapter implements SourceAdapter {
  async fetch(brandContext: BrandContext) {
    console.warn('Google Trends adapter not implemented - skipping');
    return []; // Return empty array, not mock data
  }
}
```

#### 4. Implement BrightDataAdapter

**Bright Data requires subscription**, implement or make optional:

**Option A: Real Implementation** (if you have Bright Data subscription)
```typescript
class BrightDataAdapter implements SourceAdapter {
  async fetch(brandContext: BrandContext) {
    const brightDataToken = Deno.env.get('BRIGHT_DATA_TOKEN');
    if (!brightDataToken) {
      console.warn('BRIGHT_DATA_TOKEN not configured - skipping');
      return [];
    }

    // Bright Data SERP API
    const response = await fetch(
      'https://api.brightdata.com/serp/v1/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${brightDataToken}`
        },
        body: JSON.stringify({
          query: brandContext.brandName,
          country: 'id',
          language: 'id'
        })
      }
    );

    // Transform response to artifacts...
    return results;
  }
}
```

**Option B: Make it optional** (RECOMMENDED for now)
```typescript
class BrightDataAdapter implements SourceAdapter {
  async fetch(brandContext: BrandContext) {
    console.warn('Bright Data adapter not implemented - skipping');
    return []; // Return empty, not mock data
  }
}
```

---

## 📋 QUICK FIX CHECKLIST

- [ ] 1. Copy `serpapi-search.ts` logic to SERPAPIAdapter
- [ ] 2. Copy `radar-apify-ingestion.ts` logic to ApifyAdapter
- [ ] 3. Implement GoogleTrendsAdapter (via SerpAPI) OR make optional
- [ ] 4. Make BrightDataAdapter optional (return empty array)
- [ ] 5. Test with real brand data
- [ ] 6. Verify no more TODO comments
- [ ] 7. Confirm all returned data is real, not mock

---

## ✅ ACCEPTANCE CRITERIA

**BEFORE (Mock)**:
```typescript
const results = GoogleTrendsAdapter.fetch();
// Returns: [{source_id: 'gtrends-001', data_points: [/* fake data */]}]
```

**AFTER (Real)**:
```typescript
const results = GoogleTrendsAdapter.fetch(brandContext);
// Returns: Real Google Trends data from API
// OR: [] if adapter not implemented (no mock data!)
```

**Rule**: Never return mock/fake data. Either return real API data or empty array.

---

## 🚀 IMPACT

**After Fix**:
- ✅ ph3-ingestion-orchestrator.ts → Production Ready
- ✅ Phase 3 pipeline 100% real data
- ✅ Overall production readiness: 69% → 94% (15/16 files)

**Only 1 file left**: phase35-executor.ts (needs de-minification for maintainability)

---

## 💡 ALTERNATIVE: Use External Adapters

Instead of fixing in-file, create separate adapter files:

```
/adapters/
  ├─ serpapi-adapter.ts (from Aman-7-Pipeline/serpapi-search.ts)
  ├─ apify-adapter.ts (from Aman-7-Pipeline/radar-apify-ingestion.ts)
  ├─ google-trends-adapter.ts (new or optional)
  └─ bright-data-adapter.ts (new or optional)
```

Then import in ph3-ingestion-orchestrator.ts:
```typescript
import { SerpAPIAdapter } from './adapters/serpapi-adapter.ts';
import { ApifyAdapter } from './adapters/apify-adapter.ts';
// etc.
```

---

**Priority**: Fix this file ASAP to reach 90%+ production readiness! 🚀
