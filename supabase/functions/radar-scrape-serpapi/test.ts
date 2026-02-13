#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Test Suite for radar-scrape-serpapi Edge Function
 *
 * Usage:
 *   deno run --allow-net --allow-env test.ts
 *
 * Or make executable and run:
 *   chmod +x test.ts
 *   ./test.ts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ============================================================
// Configuration
// ============================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/radar-scrape-serpapi`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// Test Helpers
// ============================================================

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  console.log(`\n🧪 Running: ${name}`);
  console.log("─".repeat(60));

  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration });
    console.log(`✅ PASS (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    results.push({
      name,
      passed: false,
      duration,
      error: error.message,
    });
    console.log(`❌ FAIL (${duration}ms)`);
    console.log(`   Error: ${error.message}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertExists(value: any, fieldName: string): void {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${fieldName} to exist, but got ${value}`);
  }
}

// ============================================================
// Test: YouTube Channel Stats
// ============================================================

await runTest("YouTube Channel Stats - Valid Handle", async () => {
  const { data: authData } = await supabase.auth.signInAnonymously();
  const token = authData.session?.access_token;

  assertExists(token, "auth token");

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "youtube_channel",
      creator_id: "test-uuid-1",
      youtube_handle: "@mkbhd",
    }),
  });

  const result = await response.json();

  console.log("Response:", JSON.stringify(result, null, 2));

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(result.success === true, "Expected success: true");
  assert(result.operation === "youtube_channel", "Expected operation: youtube_channel");
  assertExists(result.cost_usd, "cost_usd");
  assertExists(result.result, "result");
  assertExists(result.result.stats, "stats");
  assertExists(result.result.stats.subscriber_count, "subscriber_count");

  console.log(`   Subscribers: ${result.result.stats.subscriber_count}`);
  console.log(`   Videos: ${result.result.stats.video_count}`);
  console.log(`   Cost: $${result.cost_usd}`);
});

// ============================================================
// Test: YouTube Channel Stats - Invalid Handle
// ============================================================

await runTest("YouTube Channel Stats - Invalid Handle", async () => {
  const { data: authData } = await supabase.auth.signInAnonymously();
  const token = authData.session?.access_token;

  assertExists(token, "auth token");

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "youtube_channel",
      creator_id: "test-uuid-2",
      youtube_handle: "@nonexistentchannel123456789",
    }),
  });

  const result = await response.json();

  console.log("Response:", JSON.stringify(result, null, 2));

  // Should still succeed but with error in result
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(result.success === true, "Expected success: true");
  assertExists(result.result, "result");
});

// ============================================================
// Test: YouTube Videos
// ============================================================

await runTest("YouTube Videos - Valid Handle", async () => {
  const { data: authData } = await supabase.auth.signInAnonymously();
  const token = authData.session?.access_token;

  assertExists(token, "auth token");

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "youtube_videos",
      creator_id: "test-uuid-3",
      youtube_handle: "@mkbhd",
    }),
  });

  const result = await response.json();

  console.log("Response:", JSON.stringify(result, null, 2));

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(result.success === true, "Expected success: true");
  assert(result.operation === "youtube_videos", "Expected operation: youtube_videos");
  assertExists(result.cost_usd, "cost_usd");
  assertExists(result.result, "result");
  assertExists(result.result.scraped_count, "scraped_count");
  assertExists(result.result.saved_count, "saved_count");

  console.log(`   Scraped: ${result.result.scraped_count} videos`);
  console.log(`   Filtered: ${result.result.filtered_count} videos`);
  console.log(`   Saved: ${result.result.saved_count} videos`);
  console.log(`   Cost: $${result.cost_usd}`);
});

// ============================================================
// Test: Google Trends
// ============================================================

await runTest("Google Trends - Valid Category", async () => {
  const { data: authData } = await supabase.auth.signInAnonymously();
  const token = authData.session?.access_token;

  assertExists(token, "auth token");

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "google_trends",
      category: "beauty",
      country: "ID",
      timeframe: "now 7-d",
    }),
  });

  const result = await response.json();

  console.log("Response:", JSON.stringify(result, null, 2));

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(result.success === true, "Expected success: true");
  assert(result.operation === "google_trends", "Expected operation: google_trends");
  assertExists(result.cost_usd, "cost_usd");
  assertExists(result.result, "result");
  assertExists(result.result.category, "category");
  assertExists(result.result.trends_count, "trends_count");

  console.log(`   Trends found: ${result.result.trends_count}`);
  console.log(`   Saved: ${result.result.saved_count}`);
  console.log(`   Cost: $${result.cost_usd}`);
});

// ============================================================
// Test: Batch YouTube Processing
// ============================================================

await runTest("Batch YouTube Processing", async () => {
  const { data: authData } = await supabase.auth.signInAnonymously();
  const token = authData.session?.access_token;

  assertExists(token, "auth token");

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "batch_youtube",
      batch_creators: [
        {
          creator_id: "test-uuid-4",
          youtube_handle: "@mkbhd",
        },
        {
          creator_id: "test-uuid-5",
          youtube_handle: "@linustechtips",
        },
      ],
    }),
  });

  const result = await response.json();

  console.log("Response:", JSON.stringify(result, null, 2));

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(result.success === true, "Expected success: true");
  assert(result.operation === "batch_youtube", "Expected operation: batch_youtube");
  assertExists(result.cost_usd, "cost_usd");
  assertExists(result.result, "result");
  assertExists(result.result.batch_size, "batch_size");
  assertExists(result.result.processed, "processed");
  assert(result.result.batch_size === 2, "Expected batch_size: 2");

  console.log(`   Batch size: ${result.result.batch_size}`);
  console.log(`   Processed: ${result.result.processed}`);
  console.log(`   Successful: ${result.result.successful}`);
  console.log(`   Failed: ${result.result.failed}`);
  console.log(`   Cost: $${result.cost_usd}`);
});

// ============================================================
// Test: Error Handling - Missing Fields
// ============================================================

await runTest("Error Handling - Missing Creator ID", async () => {
  const { data: authData } = await supabase.auth.signInAnonymously();
  const token = authData.session?.access_token;

  assertExists(token, "auth token");

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "youtube_channel",
      youtube_handle: "@mkbhd",
      // Missing creator_id
    }),
  });

  const result = await response.json();

  console.log("Response:", JSON.stringify(result, null, 2));

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(result.success === false, "Expected success: false");
  assertExists(result.error, "error message");
  assert(
    result.error.includes("Missing required fields"),
    "Expected error about missing fields"
  );
});

// ============================================================
// Test: Error Handling - Invalid Operation
// ============================================================

await runTest("Error Handling - Invalid Operation", async () => {
  const { data: authData } = await supabase.auth.signInAnonymously();
  const token = authData.session?.access_token;

  assertExists(token, "auth token");

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "invalid_operation",
      creator_id: "test-uuid",
      youtube_handle: "@test",
    }),
  });

  const result = await response.json();

  console.log("Response:", JSON.stringify(result, null, 2));

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(result.success === false, "Expected success: false");
  assertExists(result.error, "error message");
  assert(
    result.error.includes("Invalid operation"),
    "Expected error about invalid operation"
  );
});

// ============================================================
// Test: Error Handling - Unauthorized
// ============================================================

await runTest("Error Handling - Unauthorized (No Auth Token)", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "youtube_channel",
      creator_id: "test-uuid",
      youtube_handle: "@test",
    }),
  });

  const result = await response.json();

  console.log("Response:", JSON.stringify(result, null, 2));

  assert(response.status === 401, `Expected 401, got ${response.status}`);
  assert(result.success === false, "Expected success: false");
  assertExists(result.error, "error message");
});

// ============================================================
// Test: CORS Headers
// ============================================================

await runTest("CORS Preflight Request", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      "Origin": "https://geovera.xyz",
      "Access-Control-Request-Method": "POST",
    },
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);

  const corsOrigin = response.headers.get("Access-Control-Allow-Origin");
  const corsMethods = response.headers.get("Access-Control-Allow-Methods");

  assertExists(corsOrigin, "Access-Control-Allow-Origin header");
  assertExists(corsMethods, "Access-Control-Allow-Methods header");

  console.log(`   CORS Origin: ${corsOrigin}`);
  console.log(`   CORS Methods: ${corsMethods}`);
});

// ============================================================
// Test Summary
// ============================================================

console.log("\n" + "=".repeat(60));
console.log("TEST SUMMARY");
console.log("=".repeat(60));

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
const total = results.length;
const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

console.log(`\nTotal Tests: ${total}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⏱️  Total Duration: ${totalDuration}ms`);
console.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

if (failed > 0) {
  console.log("\n❌ FAILED TESTS:");
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`   - ${r.name}`);
      console.log(`     Error: ${r.error}`);
    });
}

console.log("\n" + "=".repeat(60));

// Exit with appropriate code
Deno.exit(failed > 0 ? 1 : 0);
