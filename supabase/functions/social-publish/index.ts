/**
 * social-publish
 * Publishes or schedules content to any social platform via Late API (getlate.dev).
 *
 * POST body:
 * {
 *   brand_id: string          — GeoVera brand ID (for logging/storage)
 *   platform: string          — e.g. "instagram", "tiktok", "linkedin"
 *   account_id: string        — Late API account ID for this platform
 *   content: string           — Post text/caption
 *   media_urls?: string[]     — Optional image/video URLs
 *   publish_now?: boolean     — true = publish immediately, false/omit = schedule
 *   scheduled_for?: string    — ISO-8601 datetime (required if publish_now = false)
 *   timezone?: string         — IANA timezone, default "UTC"
 * }
 *
 * Returns:
 * { success: true, post_id: string, post_url?: string }
 * or { error: string }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const LATE_API_BASE = "https://getlate.dev/api/v1";
const LATE_API_KEY  = Deno.env.get("LATE_API_KEY") || "";
const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (!LATE_API_KEY) {
      return new Response(JSON.stringify({ error: "LATE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as {
      brand_id: string;
      platform: string;
      account_id: string;
      content: string;
      media_urls?: string[];
      publish_now?: boolean;
      scheduled_for?: string;
      timezone?: string;
    };

    const { brand_id, platform, account_id, content, media_urls, publish_now, scheduled_for, timezone } = body;

    if (!brand_id || !platform || !account_id || !content) {
      return new Response(JSON.stringify({ error: "brand_id, platform, account_id, and content are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build Late API request
    const latePayload: Record<string, unknown> = {
      content,
      publishNow: publish_now ?? false,
      platforms: [{ platform, accountId: account_id }],
    };

    if (media_urls && media_urls.length > 0) {
      latePayload.mediaUrls = media_urls;
    }

    if (!publish_now && scheduled_for) {
      latePayload.scheduledFor = scheduled_for;
      latePayload.timezone = timezone || "UTC";
    }

    const lateRes = await fetch(`${LATE_API_BASE}/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(latePayload),
    });

    const lateData = await lateRes.json() as {
      id?: string;
      platformPostUrl?: string;
      error?: string;
      message?: string;
    };

    if (!lateRes.ok) {
      console.error("[social-publish] Late API error:", JSON.stringify(lateData));
      return new Response(JSON.stringify({ error: lateData.message || lateData.error || "publish_failed" }), {
        status: lateRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log to Supabase (non-blocking)
    supabase.from("social_publish_log").insert({
      brand_id,
      platform,
      account_id,
      late_post_id: lateData.id,
      post_url: lateData.platformPostUrl || null,
      content_preview: content.slice(0, 200),
      publish_now: publish_now ?? false,
      scheduled_for: scheduled_for || null,
      status: "published",
      created_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.warn("[social-publish] DB log failed:", error.message);
    });

    return new Response(
      JSON.stringify({
        success: true,
        post_id: lateData.id,
        post_url: lateData.platformPostUrl || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[social-publish] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
