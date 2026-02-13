/**
 * PRODUCTION FINAL: Real Apify to Database
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const APIFY_ACTORS = {
  tiktok: "clockworks~tiktok-profile-scraper",
  instagram: "apify~instagram-profile-scraper"
};

async function scrapeProfile(platform: string, username: string) {
  const startTime = Date.now();
  
  try {
    const actorId = APIFY_ACTORS[platform];
    const requestBody = platform === "tiktok" 
      ? { profiles: [username], resultsLimit: 1 }
      : { usernames: [username], resultsLimit: 1 };
    
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${APIFY_API_TOKEN}`
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!runResponse.ok) throw new Error(`API error ${runResponse.status}`);

    const run = await runResponse.json();
    const runId = run.data.id;

    while (Date.now() - startTime < 120000) {
      await new Promise(r => setTimeout(r, 3000));
      const statusResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs/${runId}`, {
        headers: { "Authorization": `Bearer ${APIFY_API_TOKEN}` }
      });
      const status = await statusResponse.json();
      const runStatus = status.data.status;

      if (runStatus === "SUCCEEDED") {
        const datasetId = status.data.defaultDatasetId;
        const dataResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
          headers: { "Authorization": `Bearer ${APIFY_API_TOKEN}` }
        });
        const items = await dataResponse.json();
        
        return { username, platform, success: true, data: items[0], actor_id: actorId, job_id: runId, response_time_ms: Date.now() - startTime };
      }

      if (runStatus === "FAILED" || runStatus === "ABORTED") throw new Error(`Run ${runStatus}`);
    }

    throw new Error("Timeout");
  } catch (error) {
    return { username, platform, success: false, error: error.message, response_time_ms: Date.now() - startTime };
  }
}

function normalize(data: any, platform: string) {
  if (platform === "tiktok") {
    const a = data.authorMeta || {};
    return {
      username: a.name || data.input, user_id: a.id, display_name: a.nickName || a.name,
      bio: a.signature || "", profile_picture_url: a.avatar, is_verified: a.verified || false,
      follower_count: a.fans || 0, following_count: a.following || 0,
      total_posts: a.video || 0, total_likes: a.heart || 0
    };
  } else {
    return {
      username: data.username, user_id: data.id, display_name: data.fullName || data.username,
      bio: data.biography || "", profile_picture_url: data.profilePicUrl, is_verified: data.verified || false,
      follower_count: data.followersCount || 0, following_count: data.followsCount || 0, total_posts: data.postsCount || 0
    };
  }
}

async function saveToDatabase(scraped: any) {
  if (!scraped.success || !scraped.data) return { saved: false, reason: "scrape_failed" };

  const norm = normalize(scraped.data, scraped.platform);
  const follower_tier = norm.follower_count >= 1000000 ? "mega" : norm.follower_count >= 100000 ? "macro" : norm.follower_count >= 10000 ? "mid" : "micro";
  const snapshot_frequency = follower_tier === "mega" ? "24h" : follower_tier === "macro" ? "48h" : follower_tier === "mid" ? "96h" : "monthly";

  const { data: registry, error: regError } = await supabase
    .from("gv_creator_registry")
    .upsert({
      platform: scraped.platform, username: norm.username, user_id: norm.user_id,
      follower_tier, snapshot_frequency, current_followers: norm.follower_count,
      current_posts: norm.total_posts, last_snapshot_at: new Date().toISOString(),
      next_snapshot_due: new Date(Date.now() + 24*60*60*1000).toISOString(),
      is_active: true, discovered_at: new Date().toISOString(), discovered_via: "apify_production",
      tier_assigned_at: new Date().toISOString(), last_collection_success_at: new Date().toISOString(),
      consecutive_failures: 0, updated_at: new Date().toISOString()
    }, { onConflict: "platform,username" }).select().single();

  if (regError) { console.error("Registry error:", regError); return { saved: false, error: regError }; }

  const { error: snapError } = await supabase.from("gv_creator_snapshots").insert({
    platform: scraped.platform, username: norm.username, user_id: norm.user_id,
    snapshot_timestamp: new Date().toISOString(), snapshot_frequency,
    display_name: norm.display_name, bio: norm.bio, profile_picture_url: norm.profile_picture_url,
    is_verified: norm.is_verified, follower_count: norm.follower_count, following_count: norm.following_count,
    total_posts: norm.total_posts, total_likes: norm.total_likes || 0,
    collected_via: "apify", apify_job_id: scraped.job_id, apify_actor_id: scraped.actor_id, raw_profile_data: scraped.data
  });

  if (snapError) { console.error("Snapshot error:", snapError); return { saved: false, error: snapError }; }
  
  return { saved: true, registry_id: registry.id, follower_count: norm.follower_count, tier: follower_tier, verified: norm.is_verified };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });

  try {
    const { creators } = await req.json();
    if (!creators?.length) throw new Error("No creators provided");

    const results = [];
    for (const c of creators) {
      const scraped = await scrapeProfile(c.platform, c.username);
      const saved = await saveToDatabase(scraped);
      results.push({ username: c.username, platform: c.platform, scraped: scraped.success, saved: saved.saved, follower_count: saved.follower_count, tier: saved.tier, verified: saved.verified, error: scraped.error || saved.error });
      await new Promise(r => setTimeout(r, 1000));
    }

    const summary = { total: results.length, scraped: results.filter(r => r.scraped).length, saved: results.filter(r => r.saved).length, failed: results.filter(r => !r.saved).length, results };
    return new Response(JSON.stringify(summary, null, 2), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});