/**
 * Example usage scripts for radar-analyze-content Edge Function
 * These examples demonstrate how to integrate the function into your application
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================================================
// Example 1: Analyze single post immediately after scraping
// ==================================================
export async function analyzeSinglePost(contentId: string) {
  console.log(`Analyzing post: ${contentId}`);

  const { data, error } = await supabase.functions.invoke("radar-analyze-content", {
    body: { content_id: contentId },
  });

  if (error) {
    console.error("Analysis failed:", error);
    return null;
  }

  console.log("Analysis complete:", data);
  return data;
}

// Usage:
// await analyzeSinglePost("uuid-here");

// ==================================================
// Example 2: Batch analyze all pending content for a category
// ==================================================
export async function batchAnalyzeCategory(category: string) {
  console.log(`Starting batch analysis for category: ${category}`);

  const { data, error } = await supabase.functions.invoke("radar-analyze-content", {
    body: {
      batch: true,
      category: category,
    },
  });

  if (error) {
    console.error("Batch analysis failed:", error);
    return null;
  }

  console.log(`Batch complete: ${data.result.processed} processed, ${data.result.failed} failed`);
  console.log(`Total cost: $${data.result.total_cost_usd.toFixed(4)}`);
  console.log(`Cache savings: $${data.result.cache_savings_usd.toFixed(4)}`);

  return data;
}

// Usage:
// await batchAnalyzeCategory("beauty");

// ==================================================
// Example 3: Scheduled batch analysis (daily cron job)
// ==================================================
export async function scheduledDailyAnalysis() {
  const categories = ["beauty", "fashion", "lifestyle", "food", "tech"];

  console.log("Starting scheduled daily analysis...");

  const results = [];
  for (const category of categories) {
    console.log(`\n--- Processing ${category} ---`);

    const result = await batchAnalyzeCategory(category);
    if (result) {
      results.push({
        category,
        processed: result.result.processed,
        failed: result.result.failed,
        cost: result.result.total_cost_usd,
      });
    }

    // Wait 2 seconds between categories to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n=== Daily Analysis Summary ===");
  const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Total failed: ${totalFailed}`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);

  return results;
}

// Usage (set up as cron job):
// await scheduledDailyAnalysis();

// ==================================================
// Example 4: Analyze content immediately after Apify scraping
// ==================================================
export async function analyzeAfterScraping(creatorId: string, scrapedContent: any[]) {
  console.log(`Processing ${scrapedContent.length} posts for creator ${creatorId}`);

  // Insert scraped content into database
  const { data: insertedContent, error: insertError } = await supabase
    .from("gv_creator_content")
    .insert(
      scrapedContent.map((post) => ({
        creator_id: creatorId,
        platform: post.platform,
        post_id: post.post_id,
        post_url: post.post_url,
        caption: post.caption,
        hashtags: post.hashtags,
        posted_at: post.posted_at,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        analysis_status: "pending",
      }))
    )
    .select("id");

  if (insertError) {
    console.error("Failed to insert content:", insertError);
    return null;
  }

  console.log(`Inserted ${insertedContent.length} posts, starting analysis...`);

  // Analyze each post
  const analysisResults = [];
  for (const content of insertedContent) {
    const result = await analyzeSinglePost(content.id);
    if (result) {
      analysisResults.push(result);
    }

    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`Analysis complete: ${analysisResults.length}/${insertedContent.length} successful`);
  return analysisResults;
}

// Usage:
// const scrapedPosts = await apifyScrapeInstagram(creatorHandle);
// await analyzeAfterScraping(creatorId, scrapedPosts);

// ==================================================
// Example 5: Get analyzed content with scores
// ==================================================
export async function getAnalyzedContent(creatorId: string) {
  const { data, error } = await supabase
    .from("gv_creator_content")
    .select("*")
    .eq("creator_id", creatorId)
    .eq("analysis_status", "completed")
    .order("content_quality_score", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to fetch content:", error);
    return null;
  }

  console.log(`Found ${data.length} analyzed posts for creator ${creatorId}`);

  // Calculate averages
  const avgQuality = data.reduce((sum, c) => sum + (c.content_quality_score || 0), 0) / data.length;
  const avgOriginality = data.reduce((sum, c) => sum + (c.originality_score || 0), 0) / data.length;

  console.log(`Average Quality: ${avgQuality.toFixed(2)}`);
  console.log(`Average Originality: ${avgOriginality.toFixed(2)}`);

  // Find brand mentions
  const allBrandMentions = data
    .flatMap((c) => c.brand_mentions || [])
    .reduce((acc, mention) => {
      const key = mention.brand;
      if (!acc[key]) {
        acc[key] = { organic: 0, paid: 0 };
      }
      acc[key][mention.type]++;
      return acc;
    }, {} as Record<string, { organic: number; paid: number }>);

  console.log("Brand mentions:", allBrandMentions);

  return { data, avgQuality, avgOriginality, brandMentions: allBrandMentions };
}

// Usage:
// const analysis = await getAnalyzedContent(creatorId);

// ==================================================
// Example 6: Retry failed analyses
// ==================================================
export async function retryFailedAnalyses(category: string) {
  console.log(`Retrying failed analyses for category: ${category}`);

  // Reset failed statuses to pending
  const { error: resetError } = await supabase
    .from("gv_creator_content")
    .update({ analysis_status: "pending" })
    .eq("analysis_status", "failed")
    .eq("gv_creators.category", category);

  if (resetError) {
    console.error("Failed to reset statuses:", resetError);
    return null;
  }

  console.log("Statuses reset, starting batch analysis...");

  // Run batch analysis
  return await batchAnalyzeCategory(category);
}

// Usage:
// await retryFailedAnalyses("beauty");

// ==================================================
// Example 7: Monitor analysis progress
// ==================================================
export async function getAnalysisProgress(category: string) {
  const { data, error } = await supabase
    .from("gv_creator_content")
    .select("analysis_status, gv_creators!inner(category)")
    .eq("gv_creators.category", category);

  if (error) {
    console.error("Failed to fetch progress:", error);
    return null;
  }

  const statusCounts = data.reduce(
    (acc, item) => {
      acc[item.analysis_status]++;
      return acc;
    },
    { pending: 0, analyzing: 0, completed: 0, failed: 0 }
  );

  const total = data.length;
  const completionRate = (statusCounts.completed / total) * 100;

  console.log(`\nAnalysis Progress for ${category}:`);
  console.log(`Total: ${total}`);
  console.log(`Pending: ${statusCounts.pending} (${((statusCounts.pending / total) * 100).toFixed(1)}%)`);
  console.log(`Analyzing: ${statusCounts.analyzing} (${((statusCounts.analyzing / total) * 100).toFixed(1)}%)`);
  console.log(`Completed: ${statusCounts.completed} (${completionRate.toFixed(1)}%)`);
  console.log(`Failed: ${statusCounts.failed} (${((statusCounts.failed / total) * 100).toFixed(1)}%)`);

  return statusCounts;
}

// Usage:
// await getAnalysisProgress("beauty");

// ==================================================
// Example 8: Cost estimation before batch analysis
// ==================================================
export async function estimateBatchCost(category: string) {
  const { data, error } = await supabase
    .from("gv_creator_content")
    .select("id, gv_creators!inner(category)")
    .eq("analysis_status", "pending")
    .eq("gv_creators.category", category);

  if (error) {
    console.error("Failed to count pending content:", error);
    return null;
  }

  const pendingCount = data.length;

  // Rough cost estimation (based on average token usage)
  // ~500 tokens system (cached after 1st), ~150 tokens user, ~100 tokens output
  const avgInputTokens = 150;
  const avgOutputTokens = 100;
  const systemTokens = 500;

  // First request: system write + input + output
  const firstRequestCost = (systemTokens / 1_000_000) * 3.75 + (avgInputTokens / 1_000_000) * 3.0 + (avgOutputTokens / 1_000_000) * 15.0;

  // Subsequent requests: system read + input + output
  const subsequentCost =
    (systemTokens / 1_000_000) * 0.3 + (avgInputTokens / 1_000_000) * 3.0 + (avgOutputTokens / 1_000_000) * 15.0;

  const totalCost = firstRequestCost + (pendingCount - 1) * subsequentCost;

  console.log(`\nCost Estimation for ${category}:`);
  console.log(`Pending posts: ${pendingCount}`);
  console.log(`Estimated cost: $${totalCost.toFixed(4)}`);
  console.log(`Cost per post: $${(totalCost / pendingCount).toFixed(6)}`);

  return { pendingCount, estimatedCost: totalCost, costPerPost: totalCost / pendingCount };
}

// Usage:
// await estimateBatchCost("beauty");

// ==================================================
// Main execution (for testing)
// ==================================================
if (import.meta.main) {
  console.log("=== Radar Content Analysis Examples ===\n");

  // Example: Run scheduled analysis
  await scheduledDailyAnalysis();
}
