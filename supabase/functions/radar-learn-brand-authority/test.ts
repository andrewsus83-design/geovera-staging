/**
 * Test script for radar-learn-brand-authority function
 *
 * Usage:
 *   deno run --allow-net --allow-env test.ts
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

interface TestCase {
  name: string;
  request: {
    category: string;
    sample_size?: number;
    force_relearn?: boolean;
  };
  expectedStatus: number;
  validate?: (result: any) => boolean;
}

const testCases: TestCase[] = [
  {
    name: "Learn patterns for beauty category (first time)",
    request: {
      category: "beauty",
      sample_size: 15,
    },
    expectedStatus: 200,
    validate: (result) => {
      return (
        result.success === true &&
        result.result.patterns !== null &&
        result.result.patterns.authority_signals.keywords.length > 0 &&
        result.result.patterns.confidence_score > 0
      );
    },
  },
  {
    name: "Check existing patterns (should use cache)",
    request: {
      category: "beauty",
    },
    expectedStatus: 200,
    validate: (result) => {
      return (
        result.success === true &&
        result.result.status === "using_existing_patterns" &&
        result.result.cost_usd === 0
      );
    },
  },
  {
    name: "Force re-learning patterns",
    request: {
      category: "beauty",
      sample_size: 20,
      force_relearn: true,
    },
    expectedStatus: 200,
    validate: (result) => {
      return (
        result.success === true &&
        result.result.status === "learned_new_patterns" &&
        result.result.cost_usd > 0
      );
    },
  },
  {
    name: "Invalid sample size (too small)",
    request: {
      category: "fashion",
      sample_size: 5,
    },
    expectedStatus: 400,
  },
  {
    name: "Invalid sample size (too large)",
    request: {
      category: "fashion",
      sample_size: 100,
    },
    expectedStatus: 400,
  },
  {
    name: "Missing category",
    request: {} as any,
    expectedStatus: 400,
  },
];

async function runTest(testCase: TestCase): Promise<boolean> {
  console.log(`\n🧪 Running: ${testCase.name}`);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-learn-brand-authority`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testCase.request),
    });

    const result = await response.json();

    // Check status code
    if (response.status !== testCase.expectedStatus) {
      console.error(`❌ FAILED: Expected status ${testCase.expectedStatus}, got ${response.status}`);
      console.error(`   Response:`, result);
      return false;
    }

    // Run custom validation if provided
    if (testCase.validate && response.status === 200) {
      const isValid = testCase.validate(result);
      if (!isValid) {
        console.error(`❌ FAILED: Validation failed`);
        console.error(`   Response:`, JSON.stringify(result, null, 2));
        return false;
      }
    }

    console.log(`✅ PASSED`);
    if (response.status === 200) {
      console.log(`   Status: ${result.result?.status}`);
      console.log(`   Sample Size: ${result.result?.sample_size}`);
      console.log(`   Confidence: ${result.result?.patterns?.confidence_score}`);
      console.log(`   Cost: $${result.result?.cost_usd?.toFixed(4)}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ FAILED: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting radar-learn-brand-authority tests...\n");
  console.log(`   Target: ${SUPABASE_URL}`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const success = await runTest(testCase);
    if (success) {
      passed++;
    } else {
      failed++;
    }

    // Wait between tests to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(50));

  if (failed > 0) {
    Deno.exit(1);
  }
}

// Detailed pattern inspection test
async function inspectPatterns(category: string) {
  console.log(`\n🔍 Inspecting learned patterns for: ${category}`);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/radar-learn-brand-authority`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      category,
      sample_size: 20,
    }),
  });

  const result = await response.json();

  if (result.success && result.result.patterns) {
    const patterns = result.result.patterns;

    console.log("\n📋 Authority Signals:");
    console.log("   Keywords:", patterns.authority_signals.keywords.slice(0, 10).join(", "));
    console.log("   Content Types:", patterns.authority_signals.content_types.join(", "));
    console.log("   Quality Indicators:", patterns.authority_signals.quality_indicators.slice(0, 5).join(", "));

    console.log("\n🚫 Noise Signals:");
    console.log("   Keywords:", patterns.noise_signals.keywords.slice(0, 10).join(", "));
    console.log("   Content Types:", patterns.noise_signals.content_types.join(", "));

    console.log("\n📏 Filtering Rules:");
    patterns.filtering_rules.forEach((rule: any, idx: number) => {
      console.log(`   ${idx + 1}. [${(rule.confidence * 100).toFixed(0)}%] ${rule.rule}`);
    });

    console.log("\n💡 Key Insights:");
    patterns.key_insights.forEach((insight: string, idx: number) => {
      console.log(`   ${idx + 1}. ${insight}`);
    });

    console.log(`\n✨ Overall Confidence: ${(patterns.confidence_score * 100).toFixed(0)}%`);
    console.log(`💰 Learning Cost: $${result.result.cost_usd.toFixed(4)}`);
  } else {
    console.error("Failed to get patterns:", result);
  }
}

// Main execution
if (import.meta.main) {
  const args = Deno.args;

  if (args.includes("--inspect")) {
    const category = args[args.indexOf("--inspect") + 1] || "beauty";
    await inspectPatterns(category);
  } else if (args.includes("--help")) {
    console.log(`
Usage:
  deno run --allow-net --allow-env test.ts              Run all tests
  deno run --allow-net --allow-env test.ts --inspect    Inspect patterns for default category
  deno run --allow-net --allow-env test.ts --inspect beauty   Inspect patterns for specific category
  deno run --allow-net --allow-env test.ts --help       Show this help
    `);
  } else {
    await runAllTests();
  }
}
