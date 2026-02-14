/**
 * Test script for Daily Insights generation
 * Run with: deno run --allow-net --allow-env test-daily-insights.ts
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

async function testDailyInsights() {
  console.log("\n=== Testing Daily Insights Generation ===\n");

  // First, get a test brand
  const brandsResponse = await fetch(`${SUPABASE_URL}/rest/v1/gv_brands?select=id,name,subscription_tier&limit=1`, {
    headers: {
      "apikey": SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });

  const brands = await brandsResponse.json();

  if (!brands || brands.length === 0) {
    console.error("❌ No brands found in database");
    return;
  }

  const testBrand = brands[0];
  console.log(`✓ Testing with brand: ${testBrand.name} (${testBrand.id})`);
  console.log(`  Tier: ${testBrand.subscription_tier}\n`);

  // Call the generate-daily-insights function
  console.log("Calling generate-daily-insights Edge Function...\n");

  const startTime = Date.now();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-daily-insights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      brandId: testBrand.id,
      tier: testBrand.subscription_tier || "basic",
      forceRegenerate: true,
    }),
  });

  const duration = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Function failed with status ${response.status}:\n${error}`);
    return;
  }

  const result = await response.json();

  console.log(`✓ Function completed in ${duration}ms\n`);
  console.log("=== RESULTS ===\n");
  console.log(`Tasks generated: ${result.tasks?.length || 0}`);
  console.log(`Crises detected: ${result.crises?.length || 0}`);
  console.log(`Data sources: ${result.metadata?.dataSourcesCovered?.join(", ") || "none"}\n`);

  if (result.crises && result.crises.length > 0) {
    console.log("CRISIS ALERTS:");
    result.crises.forEach((crisis: any, idx: number) => {
      console.log(`  ${idx + 1}. [${crisis.severity.toUpperCase()}] ${crisis.title}`);
    });
    console.log();
  }

  if (result.tasks && result.tasks.length > 0) {
    console.log("GENERATED TASKS:");
    result.tasks.forEach((task: any, idx: number) => {
      console.log(`  ${idx + 1}. [${task.priority.toUpperCase()}] ${task.title}`);
      console.log(`     Why: ${task.why.substring(0, 100)}...`);
      console.log(`     Category: ${task.category}`);
      console.log(`     Priority Score: ${task.priorityScore.toFixed(2)}`);
      console.log(`     Deadline: ${new Date(task.deadline).toLocaleDateString()}`);
      console.log();
    });
  }

  // Verify database storage
  console.log("Verifying database storage...");
  const verifyResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/gv_daily_insights?brand_id=eq.${testBrand.id}&select=*&order=created_at.desc&limit=1`,
    {
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const savedInsights = await verifyResponse.json();

  if (savedInsights && savedInsights.length > 0) {
    console.log("✓ Insights successfully saved to database");
    console.log(`  Total tasks in DB: ${savedInsights[0].total_tasks}`);
    console.log(`  Crisis count in DB: ${savedInsights[0].crisis_count}`);
  } else {
    console.log("❌ Insights not found in database");
  }

  console.log("\n=== Test Complete ===\n");
}

// Run the test
testDailyInsights().catch(console.error);
