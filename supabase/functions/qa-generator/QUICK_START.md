# QA Generator - Quick Start Guide

Get started with the QA Generator function in 5 minutes.

## Prerequisites

- Supabase project set up
- Anthropic API key (Claude)
- Categories created in `gv_categories` table

## Step 1: Deploy Function (1 min)

```bash
cd /Users/drew83/Desktop/geovera-staging

# Deploy the function
./supabase/functions/deploy-qa-generator.sh
```

## Step 2: Get Category ID (1 min)

```bash
# Option A: Using Supabase Dashboard
# Go to Table Editor > gv_categories > Copy ID

# Option B: Using SQL
psql $DATABASE_URL -c "SELECT id, name FROM gv_categories WHERE active = true;"
```

## Step 3: Generate QA Pairs (2 min)

```bash
# Replace with your values
export SUPABASE_URL="https://your-project.supabase.co"
export CATEGORY_ID="your-category-uuid"
export YOUR_TOKEN="your-auth-token"

# Generate 1500 QA pairs
curl -X POST $SUPABASE_URL/functions/v1/qa-generator \
  -H "Authorization: Bearer $YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"category_id\": \"$CATEGORY_ID\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "qa_pairs_generated": 1500,
  "distribution": {
    "social": "600 (40.0%)",
    "geo": "500 (33.3%)",
    "seo": "400 (26.7%)"
  },
  "cost_usd": 0.48
}
```

## Step 4: Query QA Pairs (1 min)

```sql
-- Get all QA pairs for category
SELECT platform, COUNT(*) as count
FROM gv_qa_pairs
WHERE category_id = 'your-category-uuid'
  AND expires_at > NOW()
GROUP BY platform;

-- Get top 10 Social QA
SELECT question, keywords, quality_score
FROM gv_qa_pairs
WHERE category_id = 'your-category-uuid'
  AND platform = 'social'
  AND expires_at > NOW()
ORDER BY quality_score DESC
LIMIT 10;
```

## Usage Examples

### 1. Get Social Content for TikTok

```typescript
const { data: socialQA } = await supabase
  .from('gv_qa_pairs')
  .select('question, answer, keywords')
  .eq('category_id', categoryId)
  .eq('platform', 'social')
  .gte('quality_score', 0.85)
  .order('quality_score', { ascending: false })
  .limit(50);
```

### 2. Get GEO Content for AI Optimization

```typescript
const { data: geoQA } = await supabase
  .from('gv_qa_pairs')
  .select('question, answer, keywords')
  .eq('category_id', categoryId)
  .eq('platform', 'geo')
  .order('quality_score', { ascending: false })
  .limit(50);
```

### 3. Get SEO Content for Blog Posts

```typescript
const { data: seoQA } = await supabase
  .from('gv_qa_pairs')
  .select('question, answer, keywords')
  .eq('category_id', categoryId)
  .eq('platform', 'seo')
  .order('quality_score', { ascending: false })
  .limit(50);
```

### 4. Filter by Sub-Category

```typescript
const { data: skincareQA } = await supabase
  .from('gv_qa_pairs')
  .select('*')
  .eq('category_id', categoryId)
  .eq('sub_category', 'skincare')
  .order('quality_score', { ascending: false });
```

## Common Tasks

### Check Distribution

```sql
SELECT
  platform,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM gv_qa_pairs
WHERE category_id = 'your-category-uuid'
  AND expires_at > NOW()
GROUP BY platform;
```

**Expected Output:**
```
platform | count | percentage
---------|-------|------------
social   |   600 |       40.0
geo      |   500 |       33.3
seo      |   400 |       26.7
```

### Delete Expired QA

```sql
DELETE FROM gv_qa_pairs
WHERE expires_at < NOW();
```

### Regenerate QA (Monthly)

```bash
# Wait for existing QA to expire, then
curl -X POST $SUPABASE_URL/functions/v1/qa-generator \
  -H "Authorization: Bearer $YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"category_id\": \"$CATEGORY_ID\"}"
```

## Troubleshooting

### Error: "Category already has active QA pairs"

**Solution:** Wait for expiration (30 days) or delete manually:
```sql
DELETE FROM gv_qa_pairs WHERE category_id = 'your-category-uuid';
```

### Error: "Category not found"

**Solution:** Check category exists and ID is correct:
```sql
SELECT id, name FROM gv_categories WHERE id = 'your-category-uuid';
```

### Error: "Claude API key not configured"

**Solution:** Set environment variable in Supabase:
```bash
supabase secrets set ANTHROPIC_API_KEY=your_key_here
```

## Cost Tracking

```sql
-- Track total cost
SELECT
  category_id,
  COUNT(*) as generation_count,
  SUM(0.48) as total_cost_usd
FROM (
  SELECT DISTINCT category_id, DATE(generated_at) as gen_date
  FROM gv_qa_pairs
) grouped
GROUP BY category_id;
```

## Automated Monthly Generation

### Option A: Vercel Cron (Recommended)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/generate-qa",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

```typescript
// app/api/cron/generate-qa/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get all categories
  const { data: categories } = await supabase
    .from('gv_categories')
    .select('id, name')
    .eq('active', true);

  // Generate QA for each
  for (const category of categories) {
    await fetch(`${process.env.SUPABASE_URL}/functions/v1/qa-generator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category_id: category.id })
    });

    // Wait 2 seconds between categories
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return NextResponse.json({ success: true });
}
```

### Option B: GitHub Actions

```yaml
# .github/workflows/monthly-qa-generation.yml
name: Monthly QA Generation
on:
  schedule:
    - cron: '0 0 1 * *'  # 1st of every month

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate QA
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/qa-generator \
            -H "Authorization: Bearer ${{ secrets.SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"category_id": "${{ secrets.CATEGORY_ID }}"}'
```

## Next Steps

1. ✅ Deploy function
2. ✅ Generate QA for first category
3. ✅ Verify distribution
4. 📖 Read full documentation: `README.md`
5. 🔧 Integrate into app: `INTEGRATION_EXAMPLE.md`
6. 📅 Set up monthly cron
7. 📊 Monitor usage and costs

## Support

- **Full Documentation**: `/supabase/functions/qa-generator/README.md`
- **Integration Examples**: `/supabase/functions/qa-generator/INTEGRATION_EXAMPLE.md`
- **Test Suite**: `deno run --allow-net --allow-env supabase/functions/test-qa-generator.ts`

---

**Happy QA Generating!** 🚀
