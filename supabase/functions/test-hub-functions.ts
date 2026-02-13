#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Test Suite for Authority Hub Functions
 *
 * Usage:
 *   deno run --allow-net --allow-env test-hub-functions.ts
 *
 * Requirements:
 *   - Supabase project running (local or remote)
 *   - Environment variables set:
 *     - SUPABASE_URL
 *     - SUPABASE_ANON_KEY
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

if (!SUPABASE_ANON_KEY) {
  console.error("❌ SUPABASE_ANON_KEY not set");
  console.error("   Set it with: export SUPABASE_ANON_KEY=your_key");
  Deno.exit(1);
}

// Colors for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

/**
 * Call a Supabase Edge Function
 */
async function invokeFunction(
  functionName: string,
  body: Record<string, any>
): Promise<any> {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.details || "Unknown error");
  }

  return await response.json();
}

/**
 * Test hub-discover-content
 */
async function testDiscoverContent() {
  console.log("\n" + "=".repeat(60));
  log("Test 1: hub-discover-content", colors.cyan);
  console.log("=".repeat(60));

  try {
    logInfo("Discovering content for category: beauty, type: hot");

    const startTime = Date.now();
    const result = await invokeFunction("hub-discover-content", {
      category: "beauty",
      article_type: "hot",
      count: 5,
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.success && result.result) {
      logSuccess(`Discovery completed in ${duration}s`);
      console.log(`  Topic: ${result.result.topic}`);
      console.log(`  Trending Score: ${result.result.trending_score}`);
      console.log(`  Content IDs: ${result.result.content_ids.length}`);
      console.log(`  Keywords: ${result.result.keywords.join(", ")}`);
      console.log(`  Estimated Reach: ${result.result.estimated_reach.toLocaleString()}`);
      console.log(`  Cost: $${result.result.cost_usd.toFixed(4)}`);
      return result.result;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    logError(`Discovery failed: ${error.message}`);
    return null;
  }
}

/**
 * Test hub-generate-article
 */
async function testGenerateArticle(contentIds: string[]) {
  console.log("\n" + "=".repeat(60));
  log("Test 2: hub-generate-article", colors.cyan);
  console.log("=".repeat(60));

  try {
    logInfo("Generating article (type: hot)");
    logWarning("This test requires a valid collection_id");
    logWarning("Skipping for now - run manually with actual collection_id");

    // Uncomment to test with real collection_id
    /*
    const startTime = Date.now();
    const result = await invokeFunction("hub-generate-article", {
      collection_id: "your-collection-id-here",
      article_type: "hot",
      content_ids: contentIds.slice(0, 5),
      target_words: 300,
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.success && result.result) {
      logSuccess(`Article generated in ${duration}s`);
      console.log(`  Article ID: ${result.result.article_id}`);
      console.log(`  Title: ${result.result.title}`);
      console.log(`  Word Count: ${result.result.word_count}`);
      console.log(`  Reading Time: ${result.result.reading_time} min`);
      console.log(`  Neutrality: ${result.result.neutrality_score.toFixed(2)}`);
      console.log(`  Cost: $${result.result.cost_usd.toFixed(4)}`);
      return result.result;
    }
    */

    logInfo("Test skipped - requires valid collection_id");
    return null;
  } catch (error) {
    logError(`Article generation failed: ${error.message}`);
    return null;
  }
}

/**
 * Test hub-generate-charts
 */
async function testGenerateCharts() {
  console.log("\n" + "=".repeat(60));
  log("Test 3: hub-generate-charts", colors.cyan);
  console.log("=".repeat(60));

  try {
    logInfo("Generating charts");
    logWarning("This test requires a valid collection_id");
    logWarning("Skipping for now - run manually with actual collection_id");

    // Uncomment to test with real collection_id
    /*
    const startTime = Date.now();
    const result = await invokeFunction("hub-generate-charts", {
      collection_id: "your-collection-id-here",
      category: "beauty",
      templates: ["engagement_trend", "top_creators_by_reach"],
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.success && result.result) {
      logSuccess(`Charts generated in ${duration}s`);
      console.log(`  Total Charts: ${result.result.total_charts}`);
      result.result.charts.forEach((chart: any, i: number) => {
        console.log(`  Chart ${i + 1}: ${chart.title}`);
        console.log(`    Type: ${chart.type}`);
        console.log(`    Insight: ${chart.insight}`);
      });
      return result.result;
    }
    */

    logInfo("Test skipped - requires valid collection_id");
    return null;
  } catch (error) {
    logError(`Chart generation failed: ${error.message}`);
    return null;
  }
}

/**
 * Test hub-create-collection (End-to-End)
 */
async function testCreateCollection() {
  console.log("\n" + "=".repeat(60));
  log("Test 4: hub-create-collection (E2E)", colors.cyan);
  console.log("=".repeat(60));

  try {
    logInfo("Creating complete collection for category: beauty");
    logWarning("This is a full E2E test - will take 1-2 minutes");
    logWarning("Will incur API costs (~$0.05)");

    // Ask for confirmation
    logInfo("Press Ctrl+C to cancel, or wait 5 seconds to continue...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const startTime = Date.now();
    const result = await invokeFunction("hub-create-collection", {
      category: "beauty",
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.success && result.result) {
      logSuccess(`Collection created in ${duration}s`);
      console.log(`  Collection ID: ${result.result.collection_id}`);
      console.log(`  Category: ${result.result.category}`);
      console.log(`  Status: ${result.result.status}`);
      console.log(`  Tabs:`);
      console.log(`    Embeds: ${result.result.tabs.embeds}`);
      console.log(`    Articles: ${result.result.tabs.articles}`);
      console.log(`    Charts: ${result.result.tabs.charts}`);
      console.log(`  Total Cost: $${result.result.total_cost_usd.toFixed(4)}`);
      console.log(`  Execution Time: ${result.result.execution_time_seconds.toFixed(2)}s`);
      return result.result;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    logError(`Collection creation failed: ${error.message}`);
    return null;
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log("\n" + "=".repeat(60));
  log("Test 5: Error Handling", colors.cyan);
  console.log("=".repeat(60));

  const tests = [
    {
      name: "Missing required field",
      func: "hub-discover-content",
      body: { article_type: "hot" }, // Missing category
      expectError: true,
    },
    {
      name: "Invalid article type",
      func: "hub-discover-content",
      body: { category: "beauty", article_type: "invalid" },
      expectError: true,
    },
    {
      name: "Invalid content count",
      func: "hub-generate-article",
      body: {
        collection_id: "test",
        article_type: "hot",
        content_ids: ["id1"], // Only 1, need 5-10
      },
      expectError: true,
    },
  ];

  for (const test of tests) {
    try {
      logInfo(`Testing: ${test.name}`);
      await invokeFunction(test.func, test.body);

      if (test.expectError) {
        logError(`Expected error but got success`);
      } else {
        logSuccess(`Test passed`);
      }
    } catch (error) {
      if (test.expectError) {
        logSuccess(`Correctly caught error: ${error.message}`);
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log("\n");
  log("╔════════════════════════════════════════════════════════════╗", colors.cyan);
  log("║          Authority Hub Functions - Test Suite             ║", colors.cyan);
  log("╚════════════════════════════════════════════════════════════╝", colors.cyan);

  logInfo(`Testing against: ${SUPABASE_URL}`);

  // Run tests
  const discoveryResult = await testDiscoverContent();

  if (discoveryResult && discoveryResult.content_ids) {
    await testGenerateArticle(discoveryResult.content_ids);
  }

  await testGenerateCharts();

  await testErrorHandling();

  // Ask before running E2E test
  console.log("\n" + "=".repeat(60));
  log("End-to-End Test", colors.yellow);
  console.log("=".repeat(60));
  logWarning("The E2E test will create a complete collection");
  logWarning("This will take 1-2 minutes and cost ~$0.05");
  console.log("");

  const runE2E = prompt("Run E2E test? (y/n): ");
  if (runE2E?.toLowerCase() === "y") {
    await testCreateCollection();
  } else {
    logInfo("E2E test skipped");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  log("Test Summary", colors.cyan);
  console.log("=".repeat(60));
  logSuccess("Basic tests completed");
  logInfo("For full testing, run individual functions manually");
  console.log("");
  log("Next steps:", colors.yellow);
  console.log("  1. Deploy functions: ./deploy-hub-functions.sh");
  console.log("  2. Set environment variables");
  console.log("  3. Run E2E test with real data");
  console.log("");
}

// Run tests
if (import.meta.main) {
  await main();
}
