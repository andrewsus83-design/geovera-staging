import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CreateCollectionRequest {
  category: string;
  daily_batch?: boolean;
}

interface CollectionResult {
  collection_id: string;
  category: string;
  status: string;
  tabs: {
    embeds: number;
    articles: number;
    charts: number;
  };
  total_cost_usd: number;
  execution_time_seconds: number;
}

/**
 * Call hub-discover-content function
 */
async function discoverContent(
  category: string,
  articleType: string,
  count: number = 10
): Promise<any> {
  const functionUrl = Deno.env.get("SUPABASE_URL")?.replace(
    "https://",
    "https://"
  ) + "/functions/v1/hub-discover-content";

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
    },
    body: JSON.stringify({
      category,
      article_type: articleType,
      count,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Discovery failed: ${error.details || error.error}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Call hub-generate-article function
 */
async function generateArticle(
  collectionId: string,
  articleType: string,
  contentIds: string[],
  targetWords: number = 350
): Promise<any> {
  const functionUrl = Deno.env.get("SUPABASE_URL")?.replace(
    "https://",
    "https://"
  ) + "/functions/v1/hub-generate-article";

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
    },
    body: JSON.stringify({
      collection_id: collectionId,
      article_type: articleType,
      content_ids: contentIds,
      target_words: targetWords,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Article generation failed: ${error.details || error.error}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Call hub-generate-charts function
 */
async function generateCharts(
  collectionId: string,
  category: string,
  templates: string[]
): Promise<any> {
  const functionUrl = Deno.env.get("SUPABASE_URL")?.replace(
    "https://",
    "https://"
  ) + "/functions/v1/hub-generate-charts";

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
    },
    body: JSON.stringify({
      collection_id: collectionId,
      category,
      templates,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Chart generation failed: ${error.details || error.error}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Fetch official embed code from oEmbed APIs (ToS compliant)
 */
async function fetchOfficialEmbedCode(
  platform: string,
  postUrl: string
): Promise<string | null> {
  try {
    let oembedUrl: string;

    switch (platform.toLowerCase()) {
      case "tiktok":
        // TikTok oEmbed API (official & free)
        oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl)}`;
        break;

      case "youtube":
        // YouTube oEmbed API (official & free)
        oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(postUrl)}&format=json`;
        break;

      case "instagram":
        // Instagram oEmbed API (requires Facebook access token)
        // For now, return null - will need FB_ACCESS_TOKEN env var
        const fbAccessToken = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
        if (!fbAccessToken) {
          console.warn("Instagram embeds require FACEBOOK_ACCESS_TOKEN - skipping");
          return null;
        }
        oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&access_token=${fbAccessToken}`;
        break;

      default:
        console.warn(`Unknown platform: ${platform} - skipping embed`);
        return null;
    }

    // Fetch oEmbed data
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      console.error(`oEmbed API failed for ${platform}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.html || null;
  } catch (err) {
    console.error(`Error fetching embed code for ${platform}:`, err);
    return null;
  }
}

/**
 * Add embeds to collection (ToS compliant with official embed codes)
 */
async function addEmbedsToCollection(
  supabase: any,
  collectionId: string,
  contentIds: string[]
): Promise<number> {
  // Fetch content details
  const { data: contents, error } = await supabase
    .from("gv_creator_content")
    .select(`
      id,
      platform,
      post_url,
      caption,
      thumbnail_url,
      posted_at,
      likes,
      comments,
      shares,
      reach,
      gv_creators!inner(name, handle)
    `)
    .in("id", contentIds);

  if (error || !contents) {
    throw new Error(`Failed to fetch content: ${error?.message}`);
  }

  // Prepare embeds (take first 5-10)
  const embedCount = Math.min(Math.max(contents.length, 5), 10);
  const selectedContents = contents.slice(0, embedCount);

  // Fetch official embed codes for each content
  const embedsWithCodes = [];
  for (let index = 0; index < selectedContents.length; index++) {
    const content = selectedContents[index];

    // Fetch official embed code (ToS compliant)
    const embedCode = await fetchOfficialEmbedCode(content.platform, content.post_url);

    // Skip if embed code fetch failed
    if (!embedCode) {
      console.warn(`Skipping ${content.platform} embed - no official code available`);
      continue;
    }

    embedsWithCodes.push({
      collection_id: collectionId,
      platform: content.platform,
      content_id: content.id,
      embed_url: content.post_url || "",
      embed_code: embedCode, // Official HTML embed code
      title: content.caption?.substring(0, 100) || "",
      description: content.caption?.substring(0, 200) || "",
      thumbnail_url: content.thumbnail_url,
      creator_name: content.gv_creators?.name || "Unknown",
      creator_handle: content.gv_creators?.handle || "",
      posted_at: content.posted_at,
      views: content.reach,
      likes: content.likes,
      comments: content.comments,
      shares: content.shares,
      display_order: index,
      selection_reason: "High engagement and relevance",
      relevance_score: 0.85,
    });
  }

  if (embedsWithCodes.length === 0) {
    console.warn("No embeds with valid codes - skipping insert");
    return 0;
  }

  console.log(`Inserting ${embedsWithCodes.length} ToS-compliant embeds`);

  // Insert embeds with official codes
  const { error: insertError } = await supabase
    .from("gv_hub_embedded_content")
    .insert(embedsWithCodes);

  if (insertError) {
    throw new Error(`Failed to insert embeds: ${insertError.message}`);
  }

  return embedsWithCodes.length;
}

/**
 * Main orchestrator function
 */
async function createCollection(
  supabase: any,
  category: string,
  dailyBatch: boolean = false
): Promise<CollectionResult> {
  const startTime = Date.now();
  let totalCost = 0;

  console.log(`Creating collection for category: ${category}`);

  // Step 1: Discover trending topic
  console.log("Step 1: Discovering trending content...");
  const discovery = await discoverContent(category, "hot", 10);
  totalCost += discovery.cost_usd;

  console.log(`Discovered topic: ${discovery.topic}`);
  console.log(`Found ${discovery.content_ids.length} content pieces`);

  // Step 2: Create collection
  console.log("Step 2: Creating collection...");
  const { data: collection, error: collectionError } = await supabase
    .from("gv_hub_collections")
    .insert({
      category,
      title: discovery.topic,
      description: `Trending content about ${discovery.topic} in ${category}`,
      status: "draft",
    })
    .select()
    .single();

  if (collectionError || !collection) {
    throw new Error(`Failed to create collection: ${collectionError?.message}`);
  }

  const collectionId = collection.id;
  console.log(`Collection created: ${collectionId}`);

  // Step 3: Add embeds (5-10 pieces)
  console.log("Step 3: Adding embeds to collection...");
  const embedCount = await addEmbedsToCollection(
    supabase,
    collectionId,
    discovery.content_ids
  );
  console.log(`Added ${embedCount} embeds`);

  // Step 4: Generate 4 articles (one per type)
  console.log("Step 4: Generating articles...");
  const articleTypes = ["hot", "review", "education", "nice_to_know"] as const;
  const articles = [];

  for (const articleType of articleTypes) {
    try {
      console.log(`Generating ${articleType} article...`);

      // Discover content for this article type
      const articleDiscovery = await discoverContent(
        category,
        articleType,
        7 // Get 5-7 pieces per article
      );
      totalCost += articleDiscovery.cost_usd;

      // Generate article
      const article = await generateArticle(
        collectionId,
        articleType,
        articleDiscovery.content_ids.slice(0, 7),
        350
      );
      totalCost += article.cost_usd;

      articles.push(article);
      console.log(`${articleType} article created: ${article.article_id}`);
    } catch (err) {
      console.error(`Failed to generate ${articleType} article:`, err);
      // Continue with other articles
    }
  }

  console.log(`Generated ${articles.length} articles`);

  // Step 5: Generate 3-5 charts
  console.log("Step 5: Generating charts...");
  const chartTemplates = [
    "engagement_trend",
    "top_creators_by_reach",
    "content_type_distribution",
  ];

  let chartResult;
  try {
    chartResult = await generateCharts(collectionId, category, chartTemplates);
    console.log(`Generated ${chartResult.total_charts} charts`);
  } catch (err) {
    console.error("Failed to generate charts:", err);
    chartResult = { total_charts: 0 };
  }

  // Step 6: Publish collection
  console.log("Step 6: Publishing collection...");
  const { error: publishError } = await supabase
    .from("gv_hub_collections")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", collectionId);

  if (publishError) {
    console.error("Failed to publish collection:", publishError);
  }

  const executionTime = (Date.now() - startTime) / 1000;

  console.log(`Collection creation complete in ${executionTime.toFixed(2)}s`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);

  return {
    collection_id: collectionId,
    category,
    status: "published",
    tabs: {
      embeds: embedCount,
      articles: articles.length,
      charts: chartResult.total_charts,
    },
    total_cost_usd: totalCost,
    execution_time_seconds: executionTime,
  };
}

/**
 * Batch process multiple categories
 */
async function batchCreateCollections(
  supabase: any,
  categories: string[]
): Promise<CollectionResult[]> {
  console.log(`Starting batch creation for ${categories.length} categories`);

  const results: CollectionResult[] = [];

  for (const category of categories) {
    try {
      const result = await createCollection(supabase, category, true);
      results.push(result);
    } catch (err) {
      console.error(`Failed to create collection for ${category}:`, err);
      // Continue with other categories
    }
  }

  return results;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const body: CreateCollectionRequest = await req.json();

    if (!body.category) {
      return new Response(
        JSON.stringify({ error: "Missing required field: category" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const dailyBatch = body.daily_batch || false;

    // Create collection
    const result = await createCollection(supabase, body.category, dailyBatch);

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error creating collection:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to create collection",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
