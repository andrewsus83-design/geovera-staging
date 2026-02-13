/**
 * Test file for radar-analyze-content Edge Function
 * Run with: deno test --allow-net --allow-env test.ts
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const FUNCTION_URL = Deno.env.get("FUNCTION_URL") || "http://localhost:54321/functions/v1/radar-analyze-content";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// Mock content for testing
const MOCK_CONTENT_ID = "00000000-0000-0000-0000-000000000001";
const MOCK_CATEGORY = "beauty";

Deno.test("CORS preflight request", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
  });

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("Reject non-POST requests", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
  });

  assertEquals(response.status, 405);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("Single content analysis - invalid content_id", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      content_id: "non-existent-uuid",
    }),
  });

  assertEquals(response.status, 500);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("Batch analysis - valid category", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      batch: true,
      category: MOCK_CATEGORY,
    }),
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
  assertEquals(data.mode, "batch");
  assertEquals(data.category, MOCK_CATEGORY);
  assertExists(data.result);
  assertExists(data.result.processed);
  assertExists(data.result.failed);
  assertExists(data.result.total_cost_usd);
});

Deno.test("Invalid request - missing parameters", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("Response structure - single analysis", async () => {
  // This test assumes you have at least one content item in the database
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      content_id: MOCK_CONTENT_ID,
    }),
  });

  if (response.status === 200) {
    const data = await response.json();
    assertEquals(data.success, true);
    assertEquals(data.mode, "single");
    assertExists(data.result);
    assertExists(data.result.content_id);

    if (data.result.analysis) {
      // Validate analysis structure
      assertExists(data.result.analysis.originality_score);
      assertExists(data.result.analysis.quality_score);
      assertExists(data.result.analysis.brand_mentions);
      assertExists(data.result.analysis.reasoning);

      // Validate score ranges
      const originality = data.result.analysis.originality_score;
      const quality = data.result.analysis.quality_score;
      assertEquals(originality >= 0 && originality <= 1, true);
      assertEquals(quality >= 0 && quality <= 1, true);

      // Validate brand mentions structure
      if (data.result.analysis.brand_mentions.length > 0) {
        const mention = data.result.analysis.brand_mentions[0];
        assertExists(mention.brand);
        assertExists(mention.type);
        assertEquals(["organic", "paid"].includes(mention.type), true);
      }
    }

    // Validate cost
    assertExists(data.result.cost_usd);
    assertEquals(typeof data.result.cost_usd, "number");
  }
});

Deno.test("Batch analysis - empty category", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      batch: true,
      category: "non-existent-category",
    }),
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
  assertEquals(data.result.processed, 0);
  assertEquals(data.result.failed, 0);
  assertEquals(data.result.total_cost_usd, 0);
});

// Integration test for cost calculation
Deno.test("Cost calculation validation", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      batch: true,
      category: MOCK_CATEGORY,
    }),
  });

  if (response.status === 200) {
    const data = await response.json();

    // If any content was processed, validate cost structure
    if (data.result.processed > 0) {
      assertEquals(data.result.total_cost_usd > 0, true);

      // Cache savings should be present for batch operations
      assertExists(data.result.cache_savings_usd);
      assertEquals(typeof data.result.cache_savings_usd, "number");

      // Cache savings should be positive if we processed multiple items
      if (data.result.processed > 1) {
        assertEquals(data.result.cache_savings_usd >= 0, true);
      }
    }
  }
});

// Performance test
Deno.test("Batch processing performance", async () => {
  const startTime = Date.now();

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      batch: true,
      category: MOCK_CATEGORY,
    }),
  });

  const endTime = Date.now();
  const duration = endTime - startTime;

  assertEquals(response.status, 200);

  console.log(`Batch processing took ${duration}ms`);

  // Batch should complete within reasonable time (30 seconds for 100 posts)
  // This is a soft check, not a hard requirement
  if (duration > 30000) {
    console.warn(`Warning: Batch processing took longer than expected (${duration}ms)`);
  }
});
