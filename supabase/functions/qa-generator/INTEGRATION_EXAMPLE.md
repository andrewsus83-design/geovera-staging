# QA Generator Integration Examples

Complete examples showing how to integrate the QA Generator function into your GeoVera application.

## Table of Contents

1. [Monthly Category QA Generation](#monthly-category-qa-generation)
2. [Brand-Specific QA Selection](#brand-specific-qa-selection)
3. [Platform-Specific Content](#platform-specific-content)
4. [Sub-Category Filtering](#sub-category-filtering)
5. [Quality-Based Ranking](#quality-based-ranking)
6. [Content Distribution Pipeline](#content-distribution-pipeline)

---

## 1. Monthly Category QA Generation

Run this monthly for each category to generate fresh QA pairs.

```typescript
// /lib/services/qa-generation.service.ts

import { createClient } from '@supabase/supabase-js';

export class QAGenerationService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Generate 1500 QA pairs for a category
   */
  async generateCategoryQA(categoryId: string) {
    try {
      const { data, error } = await this.supabase.functions.invoke(
        'qa-generator',
        {
          body: { category_id: categoryId }
        }
      );

      if (error) throw error;

      console.log(`✅ Generated ${data.qa_pairs_generated} QA pairs`);
      console.log(`Distribution:`, data.distribution);
      console.log(`Cost: $${data.cost_usd}`);

      return data;
    } catch (error) {
      console.error('QA generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate QA for all active categories
   */
  async generateAllCategories() {
    const { data: categories } = await this.supabase
      .from('gv_categories')
      .select('id, name')
      .eq('active', true);

    if (!categories) return;

    const results = [];

    for (const category of categories) {
      console.log(`Generating QA for ${category.name}...`);

      try {
        const result = await this.generateCategoryQA(category.id);
        results.push({ category: category.name, success: true, ...result });
      } catch (error) {
        results.push({
          category: category.name,
          success: false,
          error: error.message
        });
      }

      // Wait 2 seconds between categories to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }
}
```

**Usage:**

```typescript
// app/api/cron/generate-qa/route.ts (Vercel Cron Job)

import { NextResponse } from 'next/server';
import { QAGenerationService } from '@/lib/services/qa-generation.service';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const service = new QAGenerationService();
  const results = await service.generateAllCategories();

  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString()
  });
}
```

---

## 2. Brand-Specific QA Selection

Select the most relevant QA pairs for a specific brand.

```typescript
// /lib/services/brand-qa-selector.service.ts

export class BrandQASelector {
  private supabase;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * Get best QA pairs for a brand based on sub-category and quality
   */
  async getBrandQAPairs(brandId: string, limit = 100) {
    // Get brand details
    const { data: brand } = await this.supabase
      .from('gv_brands')
      .select('category_id, sub_category')
      .eq('id', brandId)
      .single();

    if (!brand) throw new Error('Brand not found');

    // Query QA pairs
    let query = this.supabase
      .from('gv_qa_pairs')
      .select('*')
      .eq('category_id', brand.category_id)
      .gt('expires_at', new Date().toISOString())
      .order('quality_score', { ascending: false });

    // Prioritize sub-category match if available
    if (brand.sub_category) {
      query = query.or(`sub_category.eq.${brand.sub_category},sub_category.is.null`);
    }

    const { data: qaPairs, error } = await query.limit(limit);

    if (error) throw error;

    // Separate by sub-category match
    const matched = qaPairs?.filter(qa => qa.sub_category === brand.sub_category) || [];
    const general = qaPairs?.filter(qa => !qa.sub_category) || [];

    return {
      sub_category_matched: matched,
      general_category: general,
      total: qaPairs?.length || 0
    };
  }

  /**
   * Get platform-specific QA for brand
   */
  async getBrandQAByPlatform(brandId: string, platform: 'seo' | 'geo' | 'social', limit = 50) {
    const { data: brand } = await this.supabase
      .from('gv_brands')
      .select('category_id, sub_category')
      .eq('id', brandId)
      .single();

    if (!brand) throw new Error('Brand not found');

    const { data, error } = await this.supabase
      .from('gv_qa_pairs')
      .select('*')
      .eq('category_id', brand.category_id)
      .eq('platform', platform)
      .gt('expires_at', new Date().toISOString())
      .order('quality_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  }
}
```

**Usage:**

```typescript
// app/dashboard/[brandId]/qa-library/page.tsx

export default async function QALibraryPage({ params }: { params: { brandId: string } }) {
  const supabase = createServerClient();
  const selector = new BrandQASelector(supabase);

  const qaPairs = await selector.getBrandQAPairs(params.brandId, 100);

  return (
    <div>
      <h1>QA Library</h1>

      <Tabs>
        <TabPanel title="Sub-Category Match">
          <QAList items={qaPairs.sub_category_matched} />
        </TabPanel>

        <TabPanel title="General Category">
          <QAList items={qaPairs.general_category} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
```

---

## 3. Platform-Specific Content

Get QA pairs optimized for specific platforms.

```typescript
// /components/content/PlatformQASelector.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PlatformQASelectorProps {
  brandId: string;
  platform: 'seo' | 'geo' | 'social';
}

export function PlatformQASelector({ brandId, platform }: PlatformQASelectorProps) {
  const [qaPairs, setQAPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadQAPairs();
  }, [platform]);

  async function loadQAPairs() {
    setLoading(true);

    // Get brand category
    const { data: brand } = await supabase
      .from('gv_brands')
      .select('category_id, sub_category')
      .eq('id', brandId)
      .single();

    if (!brand) return;

    // Get platform-specific QA
    const { data: qa } = await supabase
      .from('gv_qa_pairs')
      .select('*')
      .eq('category_id', brand.category_id)
      .eq('platform', platform)
      .gt('expires_at', new Date().toISOString())
      .order('quality_score', { ascending: false })
      .limit(50);

    setQAPairs(qa || []);
    setLoading(false);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {platform.toUpperCase()} Optimized QA Pairs
      </h2>

      {platform === 'social' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Social Platform Optimization:</strong> Viral hooks, short answers (50-150 words),
            engagement triggers. Perfect for TikTok, Instagram, YouTube content.
          </p>
        </div>
      )}

      {platform === 'geo' && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm">
            <strong>GEO Platform Optimization:</strong> Citation-worthy facts, authority signals,
            structured data. Optimized for ChatGPT, Perplexity, Claude, Gemini.
          </p>
        </div>
      )}

      {platform === 'seo' && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm">
            <strong>SEO Platform Optimization:</strong> Long-form answers (200-400 words),
            keyword density, search intent alignment. Perfect for Google, Bing rankings.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {qaPairs.map((qa: any) => (
          <QACard key={qa.id} qa={qa} />
        ))}
      </div>
    </div>
  );
}
```

---

## 4. Sub-Category Filtering

Filter QA pairs by product sub-category.

```typescript
// /lib/hooks/useSubCategoryQA.ts

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useSubCategoryQA(categoryId: string, subCategory?: string) {
  const [qaPairs, setQAPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    social: 0,
    geo: 0,
    seo: 0
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadQAPairs();
  }, [categoryId, subCategory]);

  async function loadQAPairs() {
    setLoading(true);

    let query = supabase
      .from('gv_qa_pairs')
      .select('*')
      .eq('category_id', categoryId)
      .gt('expires_at', new Date().toISOString());

    if (subCategory) {
      query = query.eq('sub_category', subCategory);
    }

    const { data, error } = await query.order('quality_score', { ascending: false });

    if (error) {
      console.error('Failed to load QA pairs:', error);
      setLoading(false);
      return;
    }

    setQAPairs(data || []);

    // Calculate stats
    const social = data?.filter(qa => qa.platform === 'social').length || 0;
    const geo = data?.filter(qa => qa.platform === 'geo').length || 0;
    const seo = data?.filter(qa => qa.platform === 'seo').length || 0;

    setStats({
      total: data?.length || 0,
      social,
      geo,
      seo
    });

    setLoading(false);
  }

  return { qaPairs, loading, stats };
}
```

**Usage:**

```typescript
// app/dashboard/qa-explorer/page.tsx

export default function QAExplorerPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>();

  const { qaPairs, loading, stats } = useSubCategoryQA(
    selectedCategory,
    selectedSubCategory
  );

  return (
    <div>
      <CategorySelector onChange={setSelectedCategory} />
      <SubCategorySelector onChange={setSelectedSubCategory} />

      <div className="grid grid-cols-3 gap-4 my-4">
        <StatCard title="Social" count={stats.social} />
        <StatCard title="GEO" count={stats.geo} />
        <StatCard title="SEO" count={stats.seo} />
      </div>

      <QAList items={qaPairs} loading={loading} />
    </div>
  );
}
```

---

## 5. Quality-Based Ranking

Get highest quality QA pairs for content creation.

```typescript
// /lib/services/qa-quality-ranking.service.ts

export class QAQualityRanking {
  private supabase;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * Get top quality QA pairs across all platforms
   */
  async getTopQualityQA(categoryId: string, limit = 100) {
    const { data, error } = await this.supabase
      .from('gv_qa_pairs')
      .select('*')
      .eq('category_id', categoryId)
      .gt('expires_at', new Date().toISOString())
      .gte('quality_score', 0.85) // Only high-quality
      .order('quality_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Group by platform
    const grouped = {
      social: data?.filter(qa => qa.platform === 'social') || [],
      geo: data?.filter(qa => qa.platform === 'geo') || [],
      seo: data?.filter(qa => qa.platform === 'seo') || []
    };

    return grouped;
  }

  /**
   * Get trending QA based on keywords
   */
  async getTrendingQA(categoryId: string, trendingKeywords: string[]) {
    const { data, error } = await this.supabase
      .from('gv_qa_pairs')
      .select('*')
      .eq('category_id', categoryId)
      .gt('expires_at', new Date().toISOString())
      .order('quality_score', { ascending: false });

    if (error) throw error;

    // Filter by trending keywords
    const trending = data?.filter(qa => {
      const qaKeywords = qa.keywords || [];
      return trendingKeywords.some(keyword =>
        qaKeywords.some((k: string) => k.toLowerCase().includes(keyword.toLowerCase()))
      );
    });

    return trending || [];
  }
}
```

---

## 6. Content Distribution Pipeline

Automated pipeline for distributing QA content to brands.

```typescript
// /lib/services/qa-distribution.service.ts

export class QADistributionService {
  private supabase;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * Distribute QA pairs to all brands in a category
   */
  async distributeToCategory(categoryId: string) {
    // Get all active brands in category
    const { data: brands } = await this.supabase
      .from('gv_brands')
      .select('id, name, sub_category, tier')
      .eq('category_id', categoryId)
      .eq('active', true);

    if (!brands) return;

    const results = [];

    for (const brand of brands) {
      const result = await this.distributeToBrand(brand.id);
      results.push({ brand: brand.name, ...result });
    }

    return results;
  }

  /**
   * Distribute QA to a specific brand
   */
  async distributeToBrand(brandId: string) {
    // Get brand details
    const { data: brand } = await this.supabase
      .from('gv_brands')
      .select('category_id, sub_category, tier')
      .eq('id', brandId)
      .single();

    if (!brand) throw new Error('Brand not found');

    // Determine QA allocation based on tier
    const allocation = {
      growth: 50,
      scale: 100,
      enterprise: 200
    }[brand.tier] || 50;

    // Get best QA pairs for this brand
    let query = this.supabase
      .from('gv_qa_pairs')
      .select('*')
      .eq('category_id', brand.category_id)
      .gt('expires_at', new Date().toISOString())
      .order('quality_score', { ascending: false });

    // Prioritize sub-category match
    if (brand.sub_category) {
      query = query.or(`sub_category.eq.${brand.sub_category},sub_category.is.null`);
    }

    const { data: qaPairs } = await query.limit(allocation);

    // Store brand-specific QA selections
    const selections = qaPairs?.map(qa => ({
      brand_id: brandId,
      qa_pair_id: qa.id,
      relevance_score: qa.sub_category === brand.sub_category ? 1.0 : 0.8,
      assigned_at: new Date().toISOString()
    }));

    // Insert selections (you'll need to create this table)
    const { error } = await this.supabase
      .from('gv_brand_qa_selections')
      .upsert(selections, { onConflict: 'brand_id,qa_pair_id' });

    return {
      allocated: qaPairs?.length || 0,
      tier_limit: allocation,
      error: error?.message
    };
  }
}
```

---

## Cron Job Setup (Vercel)

Set up monthly QA generation:

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

---

## Cost Tracking

Track QA generation costs:

```typescript
// /lib/services/cost-tracking.service.ts

export async function trackQAGenerationCost(
  categoryId: string,
  cost: number
) {
  const supabase = createServiceClient();

  await supabase.from('gv_cost_tracking').insert({
    category_id: categoryId,
    feature: 'qa_generation',
    action: 'generate_1500_qa',
    cost_usd: cost,
    model_used: 'claude-3-5-sonnet',
    created_at: new Date().toISOString()
  });
}
```

---

## Complete Example: Dashboard Integration

```typescript
// app/dashboard/[brandId]/content/qa-library/page.tsx

import { QALibraryClient } from '@/components/content/QALibraryClient';
import { BrandQASelector } from '@/lib/services/brand-qa-selector.service';
import { createServerClient } from '@/lib/supabase/server';

export default async function QALibraryPage({
  params
}: {
  params: { brandId: string }
}) {
  const supabase = createServerClient();
  const selector = new BrandQASelector(supabase);

  // Get all QA categories
  const qaPairs = await selector.getBrandQAPairs(params.brandId, 200);

  // Get platform breakdowns
  const [socialQA, geoQA, seoQA] = await Promise.all([
    selector.getBrandQAByPlatform(params.brandId, 'social', 50),
    selector.getBrandQAByPlatform(params.brandId, 'geo', 50),
    selector.getBrandQAByPlatform(params.brandId, 'seo', 50)
  ]);

  return (
    <QALibraryClient
      qaPairs={qaPairs}
      platformBreakdown={{ social: socialQA, geo: geoQA, seo: seoQA }}
    />
  );
}
```

This comprehensive integration guide provides all the building blocks needed to use the QA Generator function throughout your GeoVera application!
