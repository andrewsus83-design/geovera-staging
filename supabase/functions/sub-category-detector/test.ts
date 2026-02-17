// ============================================================================
// SUB-CATEGORY DETECTOR TESTS
// ============================================================================
// Run with: deno test --allow-net --allow-env test.ts
// ============================================================================

import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

interface TestCase {
  name: string;
  brand_name: string;
  expected_sub_category: string;
  expected_min_confidence: number;
  expected_method: "keyword_match" | "perplexity_ai";
}

const testCases: TestCase[] = [
  // Food & Beverage - Beverages
  {
    name: "Coca-Cola should match Beverages",
    brand_name: "Coca-Cola",
    expected_sub_category: "Beverages",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "Pepsi should match Beverages",
    brand_name: "Pepsi",
    expected_sub_category: "Beverages",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "Gatorade should match Beverages",
    brand_name: "Gatorade",
    expected_sub_category: "Beverages",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "Red Bull should match Beverages",
    brand_name: "Red Bull Energy Drink",
    expected_sub_category: "Beverages",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },

  // Food & Beverage - Fast Food
  {
    name: "McDonald's should match Fast Food",
    brand_name: "McDonald's",
    expected_sub_category: "Fast Food",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "KFC should match Fast Food",
    brand_name: "KFC",
    expected_sub_category: "Fast Food",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "Pizza Hut should match Fast Food",
    brand_name: "Pizza Hut",
    expected_sub_category: "Fast Food",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },

  // Food & Beverage - Snacks
  {
    name: "Lay's should match Snacks",
    brand_name: "Lay's",
    expected_sub_category: "Snacks",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "Oreo should match Snacks",
    brand_name: "Oreo",
    expected_sub_category: "Snacks",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "Doritos should match Snacks",
    brand_name: "Doritos",
    expected_sub_category: "Snacks",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },

  // Food & Beverage - Coffee & Tea
  {
    name: "Starbucks should match Coffee & Tea",
    brand_name: "Starbucks",
    expected_sub_category: "Coffee & Tea",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "Kopi Kenangan should match Coffee & Tea",
    brand_name: "Kopi Kenangan",
    expected_sub_category: "Coffee & Tea",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },

  // Food & Beverage - Packaged Foods
  {
    name: "Indomie should match Packaged Foods",
    brand_name: "Indomie",
    expected_sub_category: "Packaged Foods",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },

  // Beauty & Skincare - Skincare
  {
    name: "Wardah should match Skincare",
    brand_name: "Wardah",
    expected_sub_category: "Skincare",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "Somethinc should match Skincare",
    brand_name: "Somethinc",
    expected_sub_category: "Skincare",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },

  // Beauty & Skincare - Makeup
  {
    name: "Maybelline should match Makeup",
    brand_name: "Maybelline",
    expected_sub_category: "Makeup",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },

  // Technology & Gadgets - Smartphones
  {
    name: "Samsung Galaxy should match Smartphones & Tablets",
    brand_name: "Samsung Galaxy S24",
    expected_sub_category: "Smartphones & Tablets",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
  {
    name: "iPhone should match Smartphones & Tablets",
    brand_name: "iPhone 15 Pro",
    expected_sub_category: "Smartphones & Tablets",
    expected_min_confidence: 0.7,
    expected_method: "keyword_match",
  },
];

async function testSubCategoryDetection(testCase: TestCase): Promise<void> {
  console.log(`\n🧪 Testing: ${testCase.name}`);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/sub-category-detector`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brand_name: testCase.brand_name,
    }),
  });

  const result = await response.json();

  console.log(`   Brand: ${testCase.brand_name}`);
  console.log(`   Expected: ${testCase.expected_sub_category}`);
  console.log(`   Got: ${result.sub_category_name}`);
  console.log(`   Confidence: ${result.confidence}`);
  console.log(`   Method: ${result.detection_method}`);

  // Assertions
  assertExists(result.sub_category_name, "Sub-category name should exist");
  assertEquals(
    result.sub_category_name,
    testCase.expected_sub_category,
    `Expected ${testCase.expected_sub_category}, got ${result.sub_category_name}`
  );
  assertEquals(
    result.confidence >= testCase.expected_min_confidence,
    true,
    `Confidence ${result.confidence} should be >= ${testCase.expected_min_confidence}`
  );

  console.log(`   ✅ PASSED`);
}

async function runAllTests() {
  console.log("=".repeat(60));
  console.log("SUB-CATEGORY DETECTOR TEST SUITE");
  console.log("=".repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      await testSubCategoryDetection(testCase);
      passed++;
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(60));

  if (failed > 0) {
    Deno.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  await runAllTests();
}
