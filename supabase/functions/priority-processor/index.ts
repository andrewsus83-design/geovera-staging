// Priority Processor - Weighted Resource Allocation System
// Calculates and updates category priorities based on revenue (60%), engagement (25%), and tier (15%)
// Date: February 17, 2026

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Constants for weighted priority calculation
const WEIGHT_REVENUE = 0.60; // 60% weight for revenue
const WEIGHT_ENGAGEMENT = 0.25; // 25% weight for engagement
const WEIGHT_TIER = 0.15; // 15% weight for tier bonus
const MIN_ALLOCATION_PERCENT = 2.0; // Minimum 2% allocation for any category
const NO_CLIENT_SCORE = 0.5; // Minimum score for categories with no clients

// Revenue weights by tier
const TIER_REVENUE_MULTIPLIER = {
  enterprise: 3.0, // $1,099/month = 3x weight
  scale: 2.0, // $699/month = 2x weight
  growth: 1.0, // $399/month = 1x weight (baseline)
};

// Engagement bonuses
const ENGAGEMENT_MULTIPLIER = {
  high: 0.30, // +30% for high engagement (daily logins, all reports)
  medium: 0.15, // +15% for medium engagement (weekly logins, some reports)
  low: 0.0, // +0% for low engagement (monthly logins, minimal usage)
};

// Tier bonuses
const TIER_BONUS = {
  enterprise: 0.20, // +20% for Enterprise (white-label, API access)
  scale: 0.10, // +10% for Scale (advanced features)
  growth: 0.0, // +0% for Growth (standard)
};

interface CategoryScore {
  category_id: string;
  category_name: string;
  client_count: number;
  revenue_score: number;
  engagement_score: number;
  tier_bonus_score: number;
  total_score: number;
  allocation_percent: number;
}

interface AllocationSummary {
  category: string;
  allocation: number;
  client_count: number;
  weighted_score: number;
  priority_tier: number;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Priority Processor] Starting weighted priority recalculation...');

    // Step 1: Calculate weighted scores for all categories
    const categoryScores = await calculateCategoryScores();

    console.log(`[Priority Processor] Calculated scores for ${categoryScores.length} categories`);

    // Step 2: Calculate total weighted score
    const totalScore = categoryScores.reduce((sum, cat) => sum + cat.total_score, 0);

    console.log(`[Priority Processor] Total weighted score: ${totalScore.toFixed(2)}`);

    if (totalScore === 0) {
      throw new Error('Total weighted score is zero. Cannot allocate resources.');
    }

    // Step 3: Calculate allocation percentages
    const allocations: CategoryScore[] = categoryScores.map((cat) => ({
      ...cat,
      allocation_percent: Math.max(
        (cat.total_score / totalScore) * 100,
        MIN_ALLOCATION_PERCENT
      ),
    }));

    // Step 4: Normalize allocations to ensure they sum to 100%
    const totalAllocation = allocations.reduce((sum, cat) => sum + cat.allocation_percent, 0);
    const normalizedAllocations = allocations.map((cat) => ({
      ...cat,
      allocation_percent: (cat.allocation_percent / totalAllocation) * 100,
    }));

    console.log('[Priority Processor] Normalized allocations to 100%');

    // Step 5: Update database with new allocations
    await updateCategoryAllocations(normalizedAllocations);

    console.log('[Priority Processor] Updated database with new allocations');

    // Step 6: Prepare response summary
    const summary: AllocationSummary[] = normalizedAllocations.map((cat) => ({
      category: cat.category_name,
      allocation: parseFloat(cat.allocation_percent.toFixed(2)),
      client_count: cat.client_count,
      weighted_score: parseFloat(cat.total_score.toFixed(2)),
      priority_tier: cat.client_count >= 1 ? 1 : 3,
    }));

    // Sort by allocation (highest first)
    summary.sort((a, b) => b.allocation - a.allocation);

    console.log('[Priority Processor] ✅ Priority recalculation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weighted priorities recalculated successfully',
        timestamp: new Date().toISOString(),
        total_weighted_score: parseFloat(totalScore.toFixed(2)),
        allocations: summary,
        weights_used: {
          revenue: `${WEIGHT_REVENUE * 100}%`,
          engagement: `${WEIGHT_ENGAGEMENT * 100}%`,
          tier_bonus: `${WEIGHT_TIER * 100}%`,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Priority Processor] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Calculate weighted priority scores for all categories
 * Formula: (Revenue Weight × 0.60) + (Engagement Score × 0.25) + (Tier Bonus × 0.15)
 */
async function calculateCategoryScores(): Promise<CategoryScore[]> {
  console.log('[Priority Processor] Fetching categories and brands...');

  // Fetch all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('gv_categories')
    .select('id, name')
    .eq('active', true);

  if (categoriesError) {
    throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
  }

  if (!categories || categories.length === 0) {
    throw new Error('No active categories found');
  }

  // Fetch all active brands
  const { data: brands, error: brandsError } = await supabase
    .from('gv_brands')
    .select('id, category_id, tier, engagement_level, active')
    .eq('active', true);

  if (brandsError) {
    throw new Error(`Failed to fetch brands: ${brandsError.message}`);
  }

  console.log(`[Priority Processor] Found ${categories.length} categories and ${brands?.length || 0} active brands`);

  // Group brands by category
  const brandsByCategory = new Map<string, typeof brands>();
  categories.forEach((cat) => {
    brandsByCategory.set(cat.id, []);
  });

  if (brands) {
    brands.forEach((brand) => {
      const categoryBrands = brandsByCategory.get(brand.category_id);
      if (categoryBrands) {
        categoryBrands.push(brand);
      }
    });
  }

  // Calculate scores for each category
  const scores: CategoryScore[] = categories.map((category) => {
    const categoryBrands = brandsByCategory.get(category.id) || [];
    const clientCount = categoryBrands.length;

    // Revenue score (60% weight)
    const revenueScore = categoryBrands.reduce((sum, brand) => {
      const multiplier = TIER_REVENUE_MULTIPLIER[brand.tier as keyof typeof TIER_REVENUE_MULTIPLIER] || 1.0;
      return sum + multiplier;
    }, 0) * WEIGHT_REVENUE;

    // Engagement score (25% weight)
    const engagementScore = categoryBrands.reduce((sum, brand) => {
      const multiplier = ENGAGEMENT_MULTIPLIER[brand.engagement_level as keyof typeof ENGAGEMENT_MULTIPLIER] || 0;
      return sum + multiplier;
    }, 0) * WEIGHT_ENGAGEMENT;

    // Tier bonus (15% weight)
    const tierBonusScore = categoryBrands.reduce((sum, brand) => {
      const bonus = TIER_BONUS[brand.tier as keyof typeof TIER_BONUS] || 0;
      return sum + bonus;
    }, 0) * WEIGHT_TIER;

    // Total score (with minimum for categories with no clients)
    const baseScore = revenueScore + engagementScore + tierBonusScore;
    const totalScore = clientCount === 0 ? NO_CLIENT_SCORE : baseScore;

    console.log(`[Priority Processor] ${category.name}:`);
    console.log(`  - Clients: ${clientCount}`);
    console.log(`  - Revenue Score: ${revenueScore.toFixed(2)}`);
    console.log(`  - Engagement Score: ${engagementScore.toFixed(2)}`);
    console.log(`  - Tier Bonus: ${tierBonusScore.toFixed(2)}`);
    console.log(`  - Total Score: ${totalScore.toFixed(2)}`);

    return {
      category_id: category.id,
      category_name: category.name,
      client_count: clientCount,
      revenue_score: revenueScore,
      engagement_score: engagementScore,
      tier_bonus_score: tierBonusScore,
      total_score: totalScore,
      allocation_percent: 0, // Will be calculated later
    };
  });

  return scores;
}

/**
 * Update gv_categories table with new allocations
 */
async function updateCategoryAllocations(allocations: CategoryScore[]): Promise<void> {
  console.log('[Priority Processor] Updating category allocations in database...');

  const updatePromises = allocations.map(async (allocation) => {
    const { error } = await supabase
      .from('gv_categories')
      .update({
        client_count: allocation.client_count,
        weighted_priority_score: parseFloat(allocation.total_score.toFixed(2)),
        resource_allocation: parseFloat(allocation.allocation_percent.toFixed(2)),
        priority_tier: allocation.client_count >= 1 ? 1 : 3,
        last_priority_update: new Date().toISOString(),
      })
      .eq('id', allocation.category_id);

    if (error) {
      console.error(`[Priority Processor] Failed to update ${allocation.category_name}:`, error);
      throw new Error(`Failed to update category ${allocation.category_name}: ${error.message}`);
    }

    console.log(`[Priority Processor] ✓ Updated ${allocation.category_name}: ${allocation.allocation_percent.toFixed(2)}% allocation`);
  });

  await Promise.all(updatePromises);
}
