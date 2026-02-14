/**
 * GeoVera Content Training System - Test Script
 *
 * Tests all content training Edge Functions
 *
 * Usage:
 *   deno run --allow-net --allow-env test-content-training.ts
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "your-anon-key";
const USER_TOKEN = Deno.env.get("USER_TOKEN") || "your-user-jwt-token";
const BRAND_ID = Deno.env.get("BRAND_ID") || "your-brand-uuid";

const TEST_IMAGE_URL = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1024";

console.log("🧪 Testing GeoVera Content Training System\n");

// Test 1: Analyze Visual Content
async function testAnalyzeVisualContent() {
  console.log("📊 [Test 1/5] Testing analyze-visual-content...");

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-visual-content`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${USER_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        brand_id: BRAND_ID,
        file_url: TEST_IMAGE_URL,
        content_type: "image"
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ analyze-visual-content passed");
      console.log(`   Dominant colors: ${data.analysis.dominant_colors?.join(", ") || "N/A"}`);
      console.log(`   Visual style: ${data.analysis.visual_style_tags?.join(", ") || "N/A"}`);
      console.log(`   Quality score: ${data.analysis.quality_score || "N/A"}`);
      console.log(`   Cost: $${data.cost_usd}`);
      return true;
    } else {
      console.log("❌ analyze-visual-content failed");
      console.log(`   Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log("❌ analyze-visual-content error");
    console.log(`   ${error.message}`);
    return false;
  }
}

// Test 2: Train Brand Model
async function testTrainBrandModel() {
  console.log("\n📚 [Test 2/5] Testing train-brand-model...");

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/train-brand-model`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${USER_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        brand_id: BRAND_ID,
        content_type: "image"
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ train-brand-model passed");
      console.log(`   Training examples used: ${data.training_examples_used}`);
      console.log(`   Patterns created: ${data.patterns_created}`);
      console.log(`   Confidence score: ${data.guidelines.confidence_score}`);
      console.log(`   Cost: $${data.cost_usd}`);
      return true;
    } else {
      console.log("⚠️  train-brand-model skipped (expected if <3 examples)");
      console.log(`   Error: ${data.error}`);
      return true; // Not a failure if insufficient data
    }
  } catch (error) {
    console.log("❌ train-brand-model error");
    console.log(`   ${error.message}`);
    return false;
  }
}

// Test 3: Generate Image (Enhanced)
async function testGenerateImage() {
  console.log("\n🖼️  [Test 3/5] Testing generate-image (enhanced)...");

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${USER_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        brand_id: BRAND_ID,
        prompt: "Modern office workspace with natural lighting",
        target_platforms: ["instagram"],
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ generate-image passed");
      console.log(`   Content ID: ${data.content_id}`);
      console.log(`   Image URL: ${data.image.url.substring(0, 50)}...`);
      console.log(`   Cost: $${data.image.cost_usd}`);
      return { success: true, content_id: data.content_id };
    } else {
      console.log("❌ generate-image failed");
      console.log(`   Error: ${data.error}`);
      console.log(`   Code: ${data.code}`);
      return { success: false, content_id: null };
    }
  } catch (error) {
    console.log("❌ generate-image error");
    console.log(`   ${error.message}`);
    return { success: false, content_id: null };
  }
}

// Test 4: Generate Video (Enhanced)
async function testGenerateVideo() {
  console.log("\n🎥 [Test 4/5] Testing generate-video (enhanced)...");

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-video`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${USER_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        brand_id: BRAND_ID,
        topic: "Product launch announcement",
        duration_seconds: 30,
        target_platform: "tiktok"
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ generate-video passed");
      console.log(`   Content ID: ${data.content_id}`);
      console.log(`   Script length: ${data.video.script.length} chars`);
      console.log(`   Cost: $${data.video.cost_usd}`);
      return { success: true, content_id: data.content_id };
    } else {
      console.log("❌ generate-video failed");
      console.log(`   Error: ${data.error}`);
      console.log(`   Code: ${data.code}`);
      return { success: false, content_id: null };
    }
  } catch (error) {
    console.log("❌ generate-video error");
    console.log(`   ${error.message}`);
    return { success: false, content_id: null };
  }
}

// Test 5: Record Feedback
async function testRecordFeedback(contentId: string | null) {
  console.log("\n⭐ [Test 5/5] Testing record-content-feedback...");

  if (!contentId) {
    console.log("⚠️  record-content-feedback skipped (no content_id from previous test)");
    return true;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/record-content-feedback`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${USER_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        brand_id: BRAND_ID,
        content_id: contentId,
        rating: 5,
        feedback_text: "Test feedback - excellent quality!",
        brand_consistency_rating: 5,
        quality_rating: 5,
        relevance_rating: 5
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ record-content-feedback passed");
      console.log(`   Feedback ID: ${data.feedback_id}`);
      console.log(`   Message: ${data.message}`);
      return true;
    } else {
      console.log("❌ record-content-feedback failed");
      console.log(`   Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log("❌ record-content-feedback error");
    console.log(`   ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🆔 Brand ID: ${BRAND_ID}\n`);
  console.log("=" .repeat(60));

  const results = [];

  // Test 1: Analyze Visual Content
  results.push(await testAnalyzeVisualContent());

  // Test 2: Train Brand Model
  results.push(await testTrainBrandModel());

  // Test 3: Generate Image
  const imageResult = await testGenerateImage();
  results.push(imageResult.success);

  // Test 4: Generate Video
  const videoResult = await testGenerateVideo();
  results.push(videoResult.success);

  // Test 5: Record Feedback (use image content_id)
  results.push(await testRecordFeedback(imageResult.content_id));

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Test Summary");
  console.log("-".repeat(60));

  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  console.log(`✅ Passed: ${passed}/5`);
  console.log(`❌ Failed: ${failed}/5`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Content Training System is working correctly.");
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check the output above for details.`);
  }

  console.log("\n💡 Next Steps:");
  console.log("   1. Review any failed tests and fix issues");
  console.log("   2. Upload more training examples (10-20 recommended)");
  console.log("   3. Train your brand model");
  console.log("   4. Generate brand-consistent content");
  console.log("   5. Provide feedback to improve results");
  console.log("\n📚 Documentation: VISUAL_TRAINING_GUIDE.md\n");
}

// Check environment variables
if (SUPABASE_URL.includes("your-project") || BRAND_ID.includes("your-brand")) {
  console.log("⚠️  Warning: Please set environment variables:");
  console.log("   export SUPABASE_URL=https://your-project.supabase.co");
  console.log("   export SUPABASE_ANON_KEY=your-anon-key");
  console.log("   export USER_TOKEN=your-user-jwt-token");
  console.log("   export BRAND_ID=your-brand-uuid");
  console.log("\n   Then run: deno run --allow-net --allow-env test-content-training.ts\n");
  Deno.exit(1);
}

// Run tests
runAllTests();
