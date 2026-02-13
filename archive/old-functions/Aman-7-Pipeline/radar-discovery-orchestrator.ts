import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * RADAR DISCOVERY ORCHESTRATOR
 * Coordinates batch discovery across 8 creator categories
 *
 * REWRITTEN: Unminified for maintainability and security audit
 * Original was single-line minified code (impossible to audit)
 *
 * Cost: ~$3.20 per full batch (8 categories × $0.40 Perplexity API)
 */

// Get batch URL from environment or use default
const BATCH_URL = Deno.env.get('DISCOVERY_BATCH_URL') ||
  "https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/radar-creator-discovery-batch";

// Category configuration: 8 categories with Instagram + TikTok counts
const CATEGORIES = [
  { category: "Beauty", ig: 15, tt: 15 },
  { category: "Food", ig: 15, tt: 15 },
  { category: "Fashion", ig: 15, tt: 15 },
  { category: "Tech", ig: 15, tt: 15 },
  { category: "Travel", ig: 15, tt: 15 },
  { category: "Health", ig: 15, tt: 15 },
  { category: "Parenting", ig: 14, tt: 14 },
  { category: "Business", ig: 13, tt: 14 }
];

// Total creators expected: 227 (computed from above)
const TOTAL_CREATORS_EXPECTED = CATEGORIES.reduce(
  (sum, cat) => sum + cat.ig + cat.tt,
  0
);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POST method required" }),
      {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log(`🚀 Starting discovery orchestrator for ${CATEGORIES.length} categories`);
    console.log(`📊 Expected total creators: ${TOTAL_CREATORS_EXPECTED}`);

    const results = [];
    let totalDiscovered = 0;
    let totalSaved = 0;
    let successCount = 0;

    // Process each category sequentially (with delay to respect rate limits)
    for (const cat of CATEGORIES) {
      console.log(`\n📁 Processing category: ${cat.category} (IG: ${cat.ig}, TT: ${cat.tt})`);

      try {
        const response = await fetch(BATCH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            category: cat.category,
            instagram_count: cat.ig,
            tiktok_count: cat.tt
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed ${cat.category}:`, errorText);

          results.push({
            category: cat.category,
            status: 'failed',
            error: errorText
          });
          continue;
        }

        const data = await response.json();
        console.log(`✅ ${cat.category}: Discovered ${data.total_discovered} creators`);

        // Accumulate totals
        totalDiscovered += data.total_discovered || 0;
        totalSaved += data.saved_to_db || 0;
        successCount++;

        results.push({
          category: cat.category,
          status: 'success',
          discovered: data.total_discovered,
          saved: data.saved_to_db,
          instagram: data.instagram,
          tiktok: data.tiktok,
          by_tier: data.by_tier,
          avg_quality: data.avg_quality_score
        });

        // Rate limiting: Wait 3 seconds between categories
        // Prevents overwhelming Perplexity API
        if (cat !== CATEGORIES[CATEGORIES.length - 1]) {
          console.log('⏱️  Waiting 3s before next category...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error: any) {
        console.error(`❌ Exception in ${cat.category}:`, error.message);

        results.push({
          category: cat.category,
          status: 'error',
          error: error.message
        });
      }
    }

    // Calculate metrics
    const successRate = ((successCount / CATEGORIES.length) * 100).toFixed(1);
    const estimatedCost = (CATEGORIES.length * 0.40).toFixed(2); // $0.40 per category

    const summary = {
      orchestrator: 'radar-discovery',
      status: 'completed',
      timestamp: new Date().toISOString(),

      // Totals
      total_categories: CATEGORIES.length,
      total_discovered: totalDiscovered,
      total_saved: totalSaved,
      expected_creators: TOTAL_CREATORS_EXPECTED,

      // Success metrics
      success_rate: `${successRate}%`,
      successful_categories: successCount,
      failed_categories: CATEGORIES.length - successCount,

      // Cost tracking
      estimated_cost_usd: estimatedCost,
      cost_per_category: '0.40',

      // Detailed results
      by_category: results
    };

    console.log('\n✨ Orchestrator complete!');
    console.log(`📊 Total discovered: ${totalDiscovered}/${TOTAL_CREATORS_EXPECTED}`);
    console.log(`💰 Estimated cost: $${estimatedCost}`);

    return new Response(
      JSON.stringify(summary, null, 2),
      {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error('🔥 Fatal error in orchestrator:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
