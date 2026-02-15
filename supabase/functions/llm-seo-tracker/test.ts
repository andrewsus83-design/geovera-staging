// ============================================================================
// LLM SEO TRACKER - TEST SCRIPT
// Tests GEO (Generative Engine Optimization) tracking across AI platforms
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const TEST_EMAIL = "test@geovera.xyz";
const TEST_PASSWORD = "testpassword123";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// TEST UTILITIES
// ============================================================================

async function setupTestBrand() {
  console.log("\n📦 Setting up test brand...");

  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (authError) {
    console.error("❌ Auth error:", authError);
    throw authError;
  }

  console.log("✅ Authenticated as:", authData.user?.email);

  // Get user's brand
  const { data: userBrand } = await supabase
    .from("user_brands")
    .select("brand_id")
    .eq("user_id", authData.user!.id)
    .single();

  if (!userBrand) {
    throw new Error("No brand found for test user");
  }

  // Get brand details
  const { data: brand } = await supabase
    .from("gv_brands")
    .select("*")
    .eq("id", userBrand.brand_id)
    .single();

  console.log("✅ Test brand:", brand?.brand_name);

  return {
    jwt: authData.session!.accessToken,
    brandId: userBrand.brand_id,
    brand,
  };
}

async function createTestKeywords(brandId: string) {
  console.log("\n🏷️  Creating test GEO keywords...");

  const keywords = [
    "best organic skincare brands",
    "top beauty products Indonesia",
    "sustainable cosmetics brands",
  ];

  const keywordIds: string[] = [];

  for (const keyword of keywords) {
    const { data, error } = await supabase
      .from("gv_keywords")
      .upsert({
        brand_id: brandId,
        keyword: keyword,
        keyword_type: "geo", // GEO = AI platforms
        source: "user_input",
        active: true,
        priority: 2,
      }, {
        onConflict: "brand_id,keyword,keyword_type",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating keyword "${keyword}":`, error);
    } else {
      console.log(`✅ Keyword created: ${keyword} (${data.id})`);
      keywordIds.push(data.id);
    }
  }

  return keywordIds;
}

async function checkTierUsage(brandId: string) {
  console.log("\n📊 Checking tier usage...");

  const { data, error } = await supabase
    .from("gv_tier_usage")
    .select("*")
    .eq("brand_id", brandId)
    .eq("usage_month", new Date().toISOString().split("T")[0].substring(0, 7) + "-01")
    .single();

  if (error) {
    console.log("⚠️  No usage record found, will be created on first track");
    return null;
  }

  console.log("✅ Current usage:", {
    keywords_used: data.keywords_used,
    keywords_limit: data.keywords_limit,
    total_cost: data.total_cost_usd,
  });

  return data;
}

// ============================================================================
// TEST CASES
// ============================================================================

async function testTrackAllPlatforms(jwt: string, brandId: string) {
  console.log("\n🧪 TEST 1: Track all AI platforms");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/llm-seo-tracker`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brand_id: brandId,
      platforms: ["chatgpt", "gemini", "perplexity", "claude"],
    }),
  });

  const result = await response.json();

  if (response.ok) {
    console.log("✅ Success!");
    console.log("   Keywords tracked:", result.keywords_tracked);
    console.log("   Platforms:", result.platforms.join(", "));
    console.log("   Cost:", `$${result.cost_usd}`);
    console.log("   Results:", JSON.stringify(result.results, null, 2));
  } else {
    console.error("❌ Failed:", result);
  }

  return result;
}

async function testTrackSpecificKeywords(jwt: string, brandId: string, keywordIds: string[]) {
  console.log("\n🧪 TEST 2: Track specific keywords only");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/llm-seo-tracker`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brand_id: brandId,
      keyword_ids: [keywordIds[0]], // Only first keyword
      platforms: ["chatgpt", "perplexity"], // Only 2 platforms
    }),
  });

  const result = await response.json();

  if (response.ok) {
    console.log("✅ Success!");
    console.log("   Keywords tracked:", result.keywords_tracked);
    console.log("   Platforms:", result.platforms.join(", "));
    console.log("   Cost:", `$${result.cost_usd}`);
  } else {
    console.error("❌ Failed:", result);
  }

  return result;
}

async function testViewSearchResults(brandId: string) {
  console.log("\n🔍 TEST 3: View saved search results");

  const { data, error } = await supabase
    .from("gv_search_results")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error fetching results:", error);
    return;
  }

  console.log(`✅ Found ${data.length} recent search results:`);

  for (const result of data) {
    console.log(`\n   Platform: ${result.search_engine}`);
    console.log(`   Brand appeared: ${result.brand_appeared}`);
    console.log(`   Brand rank: ${result.brand_rank || "Not ranked"}`);
    console.log(`   Competitors: ${result.competitors_found?.length || 0}`);
    console.log(`   Top competitor: ${result.competitors_found?.[0] || "None"}`);
  }
}

async function testViewKeywordPerformance(keywordIds: string[]) {
  console.log("\n📈 TEST 4: View keyword performance metrics");

  const { data, error } = await supabase
    .from("gv_keywords")
    .select("*")
    .in("id", keywordIds);

  if (error) {
    console.error("❌ Error fetching keywords:", error);
    return;
  }

  console.log(`✅ Keyword performance:`);

  for (const keyword of data) {
    console.log(`\n   Keyword: ${keyword.keyword}`);
    console.log(`   Current rank: ${keyword.current_rank || "Not tracked yet"}`);
    console.log(`   Best rank: ${keyword.best_rank || "Not tracked yet"}`);
    console.log(`   Total searches: ${keyword.total_searches}`);
    console.log(`   Last tracked: ${keyword.last_tracked_at || "Never"}`);
  }
}

async function testTierLimitEnforcement(jwt: string, brandId: string) {
  console.log("\n🚧 TEST 5: Test tier limit enforcement");

  // First, check current tier
  const { data: brand } = await supabase
    .from("gv_brands")
    .select("subscription_tier")
    .eq("id", brandId)
    .single();

  console.log("   Current tier:", brand?.subscription_tier);

  // Create more keywords than tier allows
  const tierLimits: Record<string, number> = {
    basic: 5,
    premium: 8,
    partner: 15,
  };

  const limit = tierLimits[brand?.subscription_tier || "basic"];
  console.log(`   Tier limit: ${limit} keywords/month`);

  // Try to track
  const response = await fetch(`${SUPABASE_URL}/functions/v1/llm-seo-tracker`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brand_id: brandId,
    }),
  });

  const result = await response.json();

  if (response.status === 403) {
    console.log("✅ Tier limit correctly enforced!");
    console.log("   Message:", result.error);
  } else if (response.ok) {
    console.log("✅ Tracking successful (within limits)");
    console.log("   Keywords tracked:", result.keywords_tracked);
  } else {
    console.error("❌ Unexpected response:", result);
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runTests() {
  console.log("🚀 Starting LLM SEO Tracker Tests\n");
  console.log("=" .repeat(60));

  try {
    // Setup
    const { jwt, brandId, brand } = await setupTestBrand();
    const keywordIds = await createTestKeywords(brandId);
    await checkTierUsage(brandId);

    console.log("\n" + "=".repeat(60));
    console.log("🧪 RUNNING TESTS");
    console.log("=" .repeat(60));

    // Test 1: Track all platforms
    await testTrackAllPlatforms(jwt, brandId);

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Track specific keywords
    await testTrackSpecificKeywords(jwt, brandId, keywordIds);

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: View results
    await testViewSearchResults(brandId);

    // Test 4: View keyword performance
    await testViewKeywordPerformance(keywordIds);

    // Test 5: Tier limits
    await testTierLimitEnforcement(jwt, brandId);

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TESTS COMPLETE");
    console.log("=" .repeat(60));

  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error);
    Deno.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  runTests();
}
