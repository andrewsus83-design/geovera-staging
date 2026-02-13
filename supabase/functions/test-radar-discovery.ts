#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Test script for Radar Discovery Edge Functions
 *
 * Usage:
 *   deno run --allow-net --allow-env test-radar-discovery.ts brands
 *   deno run --allow-net --allow-env test-radar-discovery.ts creators
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "your-anon-key";

interface TestConfig {
  endpoint: string;
  payload: Record<string, unknown>;
  description: string;
}

const tests: Record<string, TestConfig> = {
  brands: {
    endpoint: "radar-discover-brands",
    payload: {
      brand_id: "00000000-0000-0000-0000-000000000000", // Replace with real UUID
      category: "beauty",
      country: "United States"
    },
    description: "Discover competitor brands in beauty industry"
  },
  creators: {
    endpoint: "radar-discover-creators",
    payload: {
      category: "beauty",
      country: "United States",
      batch_size: 10 // Small batch for testing
    },
    description: "Discover 10 beauty creators"
  }
};

async function testFunction(config: TestConfig) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${config.description}`);
  console.log(`Endpoint: ${config.endpoint}`);
  console.log(`Payload:`, JSON.stringify(config.payload, null, 2));
  console.log("=".repeat(60));

  const url = `${SUPABASE_URL}/functions/v1/${config.endpoint}`;

  console.log(`\nCalling: ${url}`);

  try {
    const startTime = Date.now();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(config.payload)
    });

    const duration = Date.now() - startTime;

    console.log(`\nStatus: ${response.status} ${response.statusText}`);
    console.log(`Duration: ${duration}ms`);

    const data = await response.json();

    if (response.ok) {
      console.log("\n✅ SUCCESS");
      console.log("\nResponse:");
      console.log(JSON.stringify(data, null, 2));

      if (data.brands) {
        console.log(`\n📊 Discovered ${data.brands.length} brands`);
      }
      if (data.creators) {
        console.log(`\n📊 Discovered ${data.creators.length} creators`);
      }
      if (data.tokens) {
        console.log(`💰 Tokens used: ${data.tokens}`);
        console.log(`💵 Cost: $${data.cost_usd}`);
      }
    } else {
      console.log("\n❌ ERROR");
      console.log("\nError Response:");
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("\n❌ EXCEPTION");
    console.error(error);
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

// Main
const testName = Deno.args[0] || "brands";

if (!tests[testName]) {
  console.error(`\n❌ Unknown test: ${testName}`);
  console.error(`\nAvailable tests: ${Object.keys(tests).join(", ")}`);
  console.error(`\nUsage: deno run --allow-net --allow-env test-radar-discovery.ts [test-name]`);
  Deno.exit(1);
}

if (SUPABASE_URL.includes("YOUR_PROJECT")) {
  console.error("\n❌ Please set SUPABASE_URL environment variable");
  console.error("   export SUPABASE_URL=https://YOUR_PROJECT.supabase.co");
  Deno.exit(1);
}

if (SUPABASE_ANON_KEY === "your-anon-key") {
  console.error("\n❌ Please set SUPABASE_ANON_KEY environment variable");
  console.error("   export SUPABASE_ANON_KEY=your-anon-key");
  Deno.exit(1);
}

console.log("\n🧪 Radar Discovery Function Test");
console.log(`Environment: ${SUPABASE_URL}`);

await testFunction(tests[testName]);

console.log("✅ Test complete\n");
