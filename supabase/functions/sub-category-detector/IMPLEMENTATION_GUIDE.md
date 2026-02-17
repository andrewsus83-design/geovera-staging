# Sub-Category Detector Implementation Guide

Quick reference for implementing sub-category detection in GeoVera.

---

## 🚀 Quick Start

### 1. Deploy the Edge Function

```bash
# From project root
cd supabase/functions

# Deploy the function
supabase functions deploy sub-category-detector

# Set environment variables
supabase secrets set PERPLEXITY_API_KEY=your-key-here
```

### 2. Run the Database Migration

```bash
# Apply the migration
supabase db push

# Or manually run
psql $DATABASE_URL -f supabase/migrations/20260217_sub_category_system.sql
```

### 3. Test the Function

```bash
# Test locally
supabase functions serve sub-category-detector

# In another terminal, test it
curl -X POST http://localhost:54321/functions/v1/sub-category-detector \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"brand_name": "Coca-Cola"}'
```

---

## 📋 Integration Checklist

### Backend Integration

- [ ] Deploy Edge Function to Supabase
- [ ] Run database migration
- [ ] Set `PERPLEXITY_API_KEY` secret (optional)
- [ ] Test with sample brands
- [ ] Add function call to brand onboarding flow
- [ ] Set up monitoring/logging

### Frontend Integration

- [ ] Add sub-category selector to brand onboarding form
- [ ] Call detection API on brand name input
- [ ] Show detected sub-category with confidence
- [ ] Allow manual override for confidence < 0.8
- [ ] Display sub-category in brand dashboard
- [ ] Filter brand comparisons by sub-category

### Data Migration

- [ ] Run detection on existing brands
- [ ] Review and validate results
- [ ] Manually correct low-confidence detections
- [ ] Update brand records with sub-categories

---

## 🔧 Code Snippets

### Detect Sub-Category (TypeScript/Frontend)

```typescript
interface DetectSubCategoryParams {
  brandName: string;
  categoryId?: string;
  brandId?: string;
}

async function detectSubCategory(params: DetectSubCategoryParams) {
  const { brandName, categoryId, brandId } = params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sub-category-detector`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseClient.auth.session()?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brand_name: brandName,
        category_id: categoryId,
        brand_id: brandId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to detect sub-category');
  }

  return await response.json();
}
```

### Use in Brand Onboarding Form

```tsx
import { useState, useEffect } from 'react';

function BrandOnboardingForm() {
  const [brandName, setBrandName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [detectedSubCategory, setDetectedSubCategory] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Auto-detect when brand name changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (brandName && categoryId) {
        setIsDetecting(true);
        try {
          const result = await detectSubCategory({
            brandName,
            categoryId,
          });

          if (result.success) {
            setDetectedSubCategory(result);
          }
        } catch (error) {
          console.error('Detection failed:', error);
        } finally {
          setIsDetecting(false);
        }
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [brandName, categoryId]);

  return (
    <form>
      <input
        type="text"
        placeholder="Brand Name"
        value={brandName}
        onChange={(e) => setBrandName(e.target.value)}
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Select Category</option>
        <option value="uuid-food-beverage">Food & Beverage</option>
        <option value="uuid-beauty">Beauty & Skincare</option>
        {/* ... */}
      </select>

      {isDetecting && <div>Detecting sub-category...</div>}

      {detectedSubCategory && (
        <div className="detected-sub-category">
          <p>
            Detected: <strong>{detectedSubCategory.sub_category_name}</strong>
          </p>
          <p>
            Confidence: {(detectedSubCategory.confidence * 100).toFixed(0)}%
          </p>
          <p>
            Method: {detectedSubCategory.detection_method}
          </p>

          {detectedSubCategory.confidence < 0.8 && (
            <button type="button" onClick={() => showManualSelector()}>
              Change Sub-Category
            </button>
          )}
        </div>
      )}
    </form>
  );
}
```

### Batch Detect Existing Brands

```typescript
async function batchDetectSubCategories() {
  // Get all brands without sub-category
  const { data: brands } = await supabase
    .from('gv_brands')
    .select('id, name, industry')
    .is('sub_category_id', null)
    .eq('is_active', true);

  console.log(`Processing ${brands.length} brands...`);

  let processed = 0;
  let errors = 0;

  for (const brand of brands) {
    try {
      const result = await detectSubCategory({
        brandName: brand.name,
        brandId: brand.id,
      });

      if (result.success) {
        console.log(`✅ ${brand.name} → ${result.sub_category_name}`);
        processed++;
      } else {
        console.log(`❌ ${brand.name} → Failed`);
        errors++;
      }

      // Rate limiting: 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${brand.name}:`, error);
      errors++;
    }
  }

  console.log(`\nComplete: ${processed} processed, ${errors} errors`);
}
```

### Query Brands by Sub-Category

```typescript
async function getBrandsInSubCategory(subCategorySlug: string) {
  const { data: brands } = await supabase
    .from('gv_brands')
    .select(`
      *,
      sub_category:gv_sub_categories(
        id,
        name,
        slug
      )
    `)
    .eq('sub_category.slug', subCategorySlug)
    .eq('is_active', true);

  return brands;
}

// Usage
const beverageBrands = await getBrandsInSubCategory('beverages');
console.log(`Found ${beverageBrands.length} beverage brands`);
```

### Filter Competitors by Sub-Category

```typescript
async function getCompetitors(brandId: string) {
  // Get brand's sub-category
  const { data: brand } = await supabase
    .from('gv_brands')
    .select('sub_category_id')
    .eq('id', brandId)
    .single();

  if (!brand.sub_category_id) {
    throw new Error('Brand has no sub-category');
  }

  // Get competitors in same sub-category
  const { data: competitors } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('sub_category_id', brand.sub_category_id)
    .neq('id', brandId) // Exclude current brand
    .eq('is_active', true)
    .order('name');

  return competitors;
}
```

---

## 🗃️ Database Queries

### Get Sub-Categories with Brand Count

```sql
SELECT
  sc.*,
  COUNT(b.id) as brand_count,
  AVG(b.sub_category_confidence) as avg_confidence
FROM gv_sub_categories sc
LEFT JOIN gv_brands b ON b.sub_category_id = sc.id AND b.is_active = true
WHERE sc.active = true
GROUP BY sc.id
ORDER BY brand_count DESC;
```

### Get Brands with Low Confidence

```sql
SELECT
  b.id,
  b.name,
  b.sub_category_confidence,
  b.sub_category_detected_by,
  sc.name as sub_category_name
FROM gv_brands b
JOIN gv_sub_categories sc ON sc.id = b.sub_category_id
WHERE b.sub_category_confidence < 0.7
  AND b.is_active = true
ORDER BY b.sub_category_confidence ASC;
```

### Update Sub-Category Manually

```sql
UPDATE gv_brands
SET
  sub_category_id = 'uuid-of-correct-sub-category',
  sub_category_confidence = 1.00,
  sub_category_detected_by = 'manual',
  updated_at = NOW()
WHERE id = 'uuid-of-brand';
```

---

## 📊 Monitoring Queries

### Detection Method Distribution

```sql
SELECT
  sub_category_detected_by,
  COUNT(*) as count,
  ROUND(AVG(sub_category_confidence), 2) as avg_confidence
FROM gv_brands
WHERE sub_category_id IS NOT NULL
  AND is_active = true
GROUP BY sub_category_detected_by
ORDER BY count DESC;
```

### Sub-Category Distribution

```sql
SELECT
  sc.name,
  COUNT(b.id) as brand_count,
  ROUND(AVG(b.sub_category_confidence), 2) as avg_confidence
FROM gv_sub_categories sc
LEFT JOIN gv_brands b ON b.sub_category_id = sc.id AND b.is_active = true
GROUP BY sc.id, sc.name
ORDER BY brand_count DESC;
```

### Confidence Score Distribution

```sql
SELECT
  CASE
    WHEN sub_category_confidence >= 0.9 THEN 'Very High (0.9+)'
    WHEN sub_category_confidence >= 0.7 THEN 'High (0.7-0.9)'
    WHEN sub_category_confidence >= 0.5 THEN 'Medium (0.5-0.7)'
    ELSE 'Low (<0.5)'
  END as confidence_level,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM gv_brands
WHERE sub_category_id IS NOT NULL
  AND is_active = true
GROUP BY confidence_level
ORDER BY
  CASE confidence_level
    WHEN 'Very High (0.9+)' THEN 1
    WHEN 'High (0.7-0.9)' THEN 2
    WHEN 'Medium (0.5-0.7)' THEN 3
    ELSE 4
  END;
```

---

## 🔍 Troubleshooting

### Issue: All detections have low confidence

**Diagnosis**:
```sql
-- Check keyword coverage
SELECT name, slug, array_length(keywords, 1) as keyword_count
FROM gv_sub_categories
WHERE active = true
ORDER BY keyword_count ASC;
```

**Solution**: Add more keywords to sub-categories with low counts.

### Issue: Wrong sub-category detected

**Diagnosis**: Check which keywords matched.

**Solution**: Either:
1. Remove misleading keywords from wrong sub-category
2. Add more specific keywords to correct sub-category
3. Manually override: `UPDATE gv_brands SET sub_category_id = 'correct-id' WHERE id = 'brand-id'`

### Issue: Perplexity calls too frequent (high cost)

**Diagnosis**:
```sql
SELECT COUNT(*) as perplexity_calls
FROM gv_brands
WHERE sub_category_detected_by = 'perplexity_ai';
```

**Solution**:
1. Lower confidence threshold in code (change 0.7 to 0.6)
2. Expand keyword arrays
3. Accept manual assignment for ambiguous brands

---

## 🎯 Best Practices

### When to Use Auto-Detection

✅ **Use for**:
- New brand onboarding
- Bulk imports
- Generic brand names (Coca-Cola, McDonald's)

❌ **Don't use for**:
- Multi-category brands (Amazon = multiple sub-categories)
- Very ambiguous names (HealthyChoice could be beverage, snack, or packaged food)
- Brands with specialized focus

### Confidence Thresholds

- **>= 0.9**: Very confident, auto-assign
- **>= 0.7**: Confident, show to user for confirmation
- **>= 0.5**: Low confidence, require manual selection
- **< 0.5**: Failed detection, require manual selection

### Manual Override Flow

1. Run auto-detection
2. If confidence < 0.8, show manual selector
3. Pre-select detected sub-category
4. User confirms or changes
5. Save with `sub_category_detected_by = 'manual'`

---

## 📈 Performance Optimization

### Batch Processing

Instead of calling the function for each brand individually:

```typescript
// ❌ BAD: Sequential calls
for (const brand of brands) {
  await detectSubCategory({ brandName: brand.name });
}

// ✅ GOOD: Batch with Promise.all (but rate limit!)
const chunks = chunkArray(brands, 5); // 5 at a time

for (const chunk of chunks) {
  await Promise.all(
    chunk.map(brand =>
      detectSubCategory({ brandName: brand.name })
    )
  );
  await sleep(1000); // Rate limit: 5 calls per second
}
```

### Caching

Cache sub-categories in frontend to avoid repeated fetches:

```typescript
// Use SWR or React Query
import useSWR from 'swr';

function useSubCategories() {
  const { data, error } = useSWR('/api/sub-categories', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    subCategories: data,
    isLoading: !error && !data,
    isError: error,
  };
}
```

---

## 🚨 Common Mistakes

### 1. Not handling null category_id

```typescript
// ❌ BAD
const result = await detectSubCategory({
  brand_name: 'Coca-Cola',
  category_id: null, // Will fail!
});

// ✅ GOOD
const result = await detectSubCategory({
  brand_name: 'Coca-Cola',
  category_id: selectedCategory?.id,
  industry: 'Food & Beverage', // Fallback
});
```

### 2. Ignoring confidence scores

```typescript
// ❌ BAD: Auto-assign regardless of confidence
if (result.success) {
  updateBrand({ sub_category_id: result.sub_category_id });
}

// ✅ GOOD: Check confidence first
if (result.success && result.confidence >= 0.8) {
  updateBrand({ sub_category_id: result.sub_category_id });
} else {
  showManualSelector(result.sub_category_name);
}
```

### 3. Not providing brand_id for updates

```typescript
// ❌ BAD: Two calls (detect + update)
const result = await detectSubCategory({ brand_name: 'Coca-Cola' });
await supabase.from('gv_brands').update({ sub_category_id: result.sub_category_id });

// ✅ GOOD: Single call with auto-update
const result = await detectSubCategory({
  brand_name: 'Coca-Cola',
  brand_id: brandId, // Auto-updates brand record
});
```

---

## ✅ Testing Checklist

- [ ] Test with obvious brand names (Coca-Cola → Beverages)
- [ ] Test with ambiguous names (HealthyChoice → requires Perplexity)
- [ ] Test with non-existent category_id (should fail gracefully)
- [ ] Test with empty brand_name (should return error)
- [ ] Test with special characters in brand name
- [ ] Test batch processing (10+ brands)
- [ ] Verify confidence scores are reasonable (0.0-1.0)
- [ ] Verify cost tracking (Perplexity calls = $0.005 each)
- [ ] Test manual override flow
- [ ] Verify database triggers update sub_category counts

---

**Need Help?**
- Check [README.md](./README.md) for full documentation
- Review [SUB_CATEGORY_FOCUS_SYSTEM.md](/SUB_CATEGORY_FOCUS_SYSTEM.md) for system design
- Run tests: `deno test --allow-net --allow-env test.ts`
