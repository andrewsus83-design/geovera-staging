#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Test script for Ranking & Analytics Edge Functions
 *
 * Tests all three functions with real API calls:
 * - radar-calculate-rankings
 * - radar-calculate-marketshare
 * - radar-discover-trends
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("  SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  Deno.exit(1);
}

const BASE_URL = `${SUPABASE_URL}/functions/v1`;

// Colors for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testFunction(
  name: string,
  endpoint: string,
  payload: Record<string, any>
) {
  log(`\n${"=".repeat(60)}`, colors.cyan);
  log(`Testing: ${name}`, colors.cyan);
  log("=".repeat(60), colors.cyan);

  try {
    log(`\nPayload: ${JSON.stringify(payload, null, 2)}`, colors.yellow);

    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (response.ok) {
      log(`\n✓ Success (${duration}ms)`, colors.green);
      log(`\nResponse:`, colors.blue);
      console.log(JSON.stringify(data, null, 2));

      // Function-specific summaries
      if (endpoint === "radar-calculate-rankings" && data.result) {
        log(`\nSummary:`, colors.cyan);
        log(`  Total Creators: ${data.result.total_creators}`);
        log(`  Snapshots Created: ${data.result.snapshots_created}`);
        log(`  Rank Changes: ${data.result.rank_changes.length}`);

        if (data.result.rank_changes.length > 0) {
          log(`\nTop 5 Rank Changes:`, colors.yellow);
          data.result.rank_changes.slice(0, 5).forEach((change: any) => {
            const arrow = change.change > 0 ? "↑" : change.change < 0 ? "↓" : "→";
            log(
              `  ${arrow} Rank ${change.rank}: ${change.creator_id} (${change.change >= 0 ? "+" : ""}${change.change})`
            );
          });
        }
      }

      if (endpoint === "radar-calculate-marketshare" && data.result) {
        log(`\nSummary:`, colors.cyan);
        log(`  Total Brands: ${data.result.total_brands}`);
        log(`  Top Brands Returned: ${data.result.top_brands.length}`);

        if (data.result.top_brands.length > 0) {
          log(`\nTop 5 Brands by Marketshare:`, colors.yellow);
          data.result.top_brands.slice(0, 5).forEach((brand: any) => {
            log(
              `  ${brand.rank_position}. ${brand.brand}: ${brand.marketshare_percentage.toFixed(2)}%`
            );
            log(
              `     Reach: ${(brand.total_reach / 1000000).toFixed(1)}M | Mentions: ${brand.total_mentions} (${brand.organic_mentions}O, ${brand.paid_mentions}P)`
            );
          });
        }
      }

      if (endpoint === "radar-discover-trends" && data.result) {
        log(`\nSummary:`, colors.cyan);
        log(`  Trends Discovered: ${data.result.trends_discovered}`);
        log(`  Trends Updated: ${data.result.trends_updated}`);
        log(`  Active Trends: ${data.result.active_trends.length}`);
        log(`  Cost: $${data.result.cost_usd.toFixed(4)}`);

        if (data.result.active_trends.length > 0) {
          log(`\nRising Trends:`, colors.yellow);
          data.result.active_trends
            .filter((t: any) => t.status === "rising")
            .slice(0, 5)
            .forEach((trend: any) => {
              const icon = {
                hashtag: "#",
                challenge: "🏆",
                product: "🛍️",
                topic: "💬",
              }[trend.trend_type] || "•";

              log(
                `  ${icon} ${trend.trend_name} (+${(trend.growth_rate * 100).toFixed(0)}%)`
              );
              log(
                `     Reach: ${(trend.estimated_reach / 1000000).toFixed(1)}M | Source: ${trend.source}`
              );
            });
        }
      }

      return true;
    } else {
      log(`\n✗ Failed (${duration}ms)`, colors.red);
      log(`Status: ${response.status} ${response.statusText}`, colors.red);
      log(`\nError Response:`, colors.red);
      console.log(JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    log(`\n✗ Exception:`, colors.red);
    console.error(error);
    return false;
  }
}

async function runTests() {
  log("\n" + "=".repeat(60), colors.cyan);
  log("Ranking & Analytics Functions Test Suite", colors.cyan);
  log("=".repeat(60), colors.cyan);

  const category = "beauty"; // Test with beauty category
  const results: { name: string; passed: boolean }[] = [];

  // Test 1: Calculate Rankings
  const test1 = await testFunction(
    "radar-calculate-rankings",
    "radar-calculate-rankings",
    {
      category,
      force_update: false,
    }
  );
  results.push({ name: "Rankings", passed: test1 });

  // Test 2: Calculate Marketshare
  const test2 = await testFunction(
    "radar-calculate-marketshare",
    "radar-calculate-marketshare",
    {
      category,
    }
  );
  results.push({ name: "Marketshare", passed: test2 });

  // Test 3: Discover Trends
  const test3 = await testFunction(
    "radar-discover-trends",
    "radar-discover-trends",
    {
      category,
    }
  );
  results.push({ name: "Trends", passed: test3 });

  // Test 4: Custom date range marketshare
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days

  const test4 = await testFunction(
    "radar-calculate-marketshare (7-day range)",
    "radar-calculate-marketshare",
    {
      category,
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    }
  );
  results.push({ name: "Marketshare (7-day)", passed: test4 });

  // Test 5: Force update rankings
  const test5 = await testFunction(
    "radar-calculate-rankings (force update)",
    "radar-calculate-rankings",
    {
      category,
      force_update: true,
    }
  );
  results.push({ name: "Rankings (force)", passed: test5 });

  // Summary
  log("\n" + "=".repeat(60), colors.cyan);
  log("Test Results Summary", colors.cyan);
  log("=".repeat(60), colors.cyan);

  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result) => {
    if (result.passed) {
      log(`✓ ${result.name}`, colors.green);
      passedCount++;
    } else {
      log(`✗ ${result.name}`, colors.red);
      failedCount++;
    }
  });

  log("\n" + "-".repeat(60));
  log(
    `Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`,
    passedCount === results.length ? colors.green : colors.yellow
  );
  log("=".repeat(60) + "\n", colors.cyan);

  Deno.exit(failedCount > 0 ? 1 : 0);
}

// Run tests
runTests();
