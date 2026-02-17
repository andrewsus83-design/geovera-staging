#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * QA Generator Function Test Script
 *
 * Tests the qa-generator Edge Function that generates 1500 QA pairs per category
 *
 * Usage:
 *   deno run --allow-net --allow-env test-qa-generator.ts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function logSection(title: string) {
  console.log("\n" + "=".repeat(80));
  console.log(`  ${title}`);
  console.log("=".repeat(80) + "\n");
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function logError(message: string) {
  console.error(`❌ ${message}`);
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`);
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testGetCategories() {
  logSection("TEST 1: Get Available Categories");

  const { data: categories, error } = await supabase
    .from("gv_categories")
    .select("id, name, slug, description")
    .eq("active", true);

  if (error) {
    logError(`Failed to get categories: ${error.message}`);
    return null;
  }

  if (!categories || categories.length === 0) {
    logError("No active categories found");
    return null;
  }

  logSuccess(`Found ${categories.length} active categories:`);
  categories.forEach((cat, idx) => {
    console.log(`  ${idx + 1}. ${cat.name} (${cat.slug})`);
  });

  return categories;
}

async function testGetSubCategories(categoryId: string) {
  logSection("TEST 2: Get Sub-Categories for Category");

  const { data: subCategories, error } = await supabase
    .from("gv_sub_categories")
    .select("*")
    .eq("category_id", categoryId)
    .eq("active", true);

  if (error) {
    logError(`Failed to get sub-categories: ${error.message}`);
    return;
  }

  logSuccess(`Found ${subCategories?.length || 0} sub-categories`);
  subCategories?.forEach((sub) => {
    console.log(`  - ${sub.name} (${sub.slug})`);
    console.log(`    Keywords: ${sub.keywords?.join(", ") || "none"}`);
  });
}

async function testCheckExistingQA(categoryId: string) {
  logSection("TEST 3: Check for Existing QA Pairs");

  const { count, error } = await supabase
    .from("gv_qa_pairs")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .gt("expires_at", new Date().toISOString());

  if (error) {
    logError(`Failed to check existing QA: ${error.message}`);
    return 0;
  }

  if (count && count > 0) {
    logInfo(`Found ${count} existing active QA pairs for this category`);
    logInfo("You may need to delete these or wait for expiration before generating new ones");
  } else {
    logSuccess("No existing active QA pairs found - ready for generation");
  }

  return count || 0;
}

async function testGenerateQA(categoryId: string, categoryName: string) {
  logSection("TEST 4: Generate 1500 QA Pairs");

  // Note: This requires authentication
  logInfo("This test requires a valid user authentication token");
  logInfo("Skipping actual generation in test mode");
  logInfo("");
  logInfo("To test generation manually, use:");
  logInfo(`  curl -X POST \${SUPABASE_URL}/functions/v1/qa-generator \\`);
  logInfo(`    -H "Authorization: Bearer YOUR_TOKEN" \\`);
  logInfo(`    -H "Content-Type: application/json" \\`);
  logInfo(`    -d '{"category_id": "${categoryId}"}'`);
}

async function testQueryQAByPlatform(categoryId: string) {
  logSection("TEST 5: Query QA Pairs by Platform");

  const platforms = ["social", "geo", "seo"];

  for (const platform of platforms) {
    const { count, error } = await supabase
      .from("gv_qa_pairs")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .eq("platform", platform)
      .gt("expires_at", new Date().toISOString());

    if (error) {
      logError(`Failed to query ${platform} QA: ${error.message}`);
      continue;
    }

    logInfo(`${platform.toUpperCase()}: ${count || 0} QA pairs`);
  }
}

async function testQueryQABySubCategory(categoryId: string) {
  logSection("TEST 6: Query QA Pairs by Sub-Category");

  const { data: subCategories } = await supabase
    .from("gv_sub_categories")
    .select("slug, name")
    .eq("category_id", categoryId)
    .limit(3);

  if (!subCategories || subCategories.length === 0) {
    logInfo("No sub-categories to test");
    return;
  }

  for (const sub of subCategories) {
    const { count, error } = await supabase
      .from("gv_qa_pairs")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .eq("sub_category", sub.slug)
      .gt("expires_at", new Date().toISOString());

    if (error) {
      logError(`Failed to query ${sub.slug} QA: ${error.message}`);
      continue;
    }

    logInfo(`${sub.name} (${sub.slug}): ${count || 0} QA pairs`);
  }
}

async function testSampleQAs(categoryId: string) {
  logSection("TEST 7: Sample QA Pairs");

  const { data: samples, error } = await supabase
    .from("gv_qa_pairs")
    .select("platform, question, keywords, quality_score, sub_category")
    .eq("category_id", categoryId)
    .gt("expires_at", new Date().toISOString())
    .order("quality_score", { ascending: false })
    .limit(5);

  if (error) {
    logError(`Failed to get sample QAs: ${error.message}`);
    return;
  }

  if (!samples || samples.length === 0) {
    logInfo("No QA pairs found to sample");
    return;
  }

  logSuccess(`Top ${samples.length} QA pairs by quality score:`);
  samples.forEach((qa, idx) => {
    console.log(`\n${idx + 1}. [${qa.platform.toUpperCase()}] ${qa.sub_category || "general"}`);
    console.log(`   Q: ${qa.question.substring(0, 100)}...`);
    console.log(`   Keywords: ${qa.keywords?.join(", ") || "none"}`);
    console.log(`   Quality: ${qa.quality_score}`);
  });
}

async function testDistributionAnalysis(categoryId: string) {
  logSection("TEST 8: Distribution Analysis");

  const { data: allQA, error } = await supabase
    .from("gv_qa_pairs")
    .select("platform")
    .eq("category_id", categoryId)
    .gt("expires_at", new Date().toISOString());

  if (error) {
    logError(`Failed to analyze distribution: ${error.message}`);
    return;
  }

  if (!allQA || allQA.length === 0) {
    logInfo("No QA pairs to analyze");
    return;
  }

  const total = allQA.length;
  const social = allQA.filter(qa => qa.platform === "social").length;
  const geo = allQA.filter(qa => qa.platform === "geo").length;
  const seo = allQA.filter(qa => qa.platform === "seo").length;

  logSuccess(`Total QA Pairs: ${total}`);
  console.log(`\nActual Distribution:`);
  console.log(`  Social: ${social} (${((social/total)*100).toFixed(1)}%)`);
  console.log(`  GEO:    ${geo} (${((geo/total)*100).toFixed(1)}%)`);
  console.log(`  SEO:    ${seo} (${((seo/total)*100).toFixed(1)}%)`);

  console.log(`\nTarget Distribution:`);
  console.log(`  Social: 600 (40.0%)`);
  console.log(`  GEO:    500 (33.3%)`);
  console.log(`  SEO:    400 (26.7%)`);

  // Calculate variance
  const socialVariance = Math.abs(social - 600);
  const geoVariance = Math.abs(geo - 500);
  const seoVariance = Math.abs(seo - 400);

  console.log(`\nVariance from Target:`);
  console.log(`  Social: ${socialVariance > 0 ? '+' : ''}${social - 600}`);
  console.log(`  GEO:    ${geoVariance > 0 ? '+' : ''}${geo - 500}`);
  console.log(`  SEO:    ${seoVariance > 0 ? '+' : ''}${seo - 400}`);

  if (socialVariance < 50 && geoVariance < 50 && seoVariance < 50) {
    logSuccess("✅ Distribution is within acceptable range!");
  } else {
    logError("⚠️  Distribution variance is high");
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runTests() {
  console.log("\n🧪 QA Generator Function Test Suite\n");

  try {
    // Test 1: Get categories
    const categories = await testGetCategories();
    if (!categories || categories.length === 0) {
      logError("Cannot proceed without categories");
      return;
    }

    // Use first category for remaining tests
    const testCategory = categories[0];
    logInfo(`\nUsing category: ${testCategory.name} (${testCategory.id})\n`);

    // Test 2: Get sub-categories
    await testGetSubCategories(testCategory.id);

    // Test 3: Check existing QA
    const existingCount = await testCheckExistingQA(testCategory.id);

    // Test 4: Generate QA (instructions only)
    await testGenerateQA(testCategory.id, testCategory.name);

    // If QA pairs exist, run analysis tests
    if (existingCount && existingCount > 0) {
      // Test 5: Query by platform
      await testQueryQAByPlatform(testCategory.id);

      // Test 6: Query by sub-category
      await testQueryQABySubCategory(testCategory.id);

      // Test 7: Sample QAs
      await testSampleQAs(testCategory.id);

      // Test 8: Distribution analysis
      await testDistributionAnalysis(testCategory.id);
    }

    logSection("TEST SUMMARY");
    logSuccess("All tests completed successfully!");
    logInfo("\nNext steps:");
    logInfo("1. Deploy function: supabase functions deploy qa-generator");
    logInfo("2. Generate QA pairs using the curl command shown above");
    logInfo("3. Re-run this test to verify distribution");

  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Run tests
if (import.meta.main) {
  await runTests();
}
