/**
 * social-connect
 * Unified social account connection via Late API (getlate.dev).
 *
 * Supports all 13 platforms in one function:
 * instagram, tiktok, facebook, linkedin, youtube, pinterest,
 * reddit, bluesky, threads, twitter, google_business, telegram, snapchat
 *
 * ── Endpoints ──────────────────────────────────────────────────────────────
 *
 * GET  /social-connect?platform={platform}&brand_id={supabaseBrandId}
 *   → Looks up late_profile_id from brands table, returns { auth_url: string }
 *   → Also accepts legacy ?profile_id={lateProfileId} for backward compat
 *
 * GET  /social-connect/status?brand_id={supabaseBrandId}
 *   → Looks up late_profile_id, returns { accounts: [...] }
 *   → Also accepts legacy ?profile_id={lateProfileId}
 *
 * DELETE /social-connect?platform={platform}&account_id={accountId}
 *   → Returns { success: true }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const LATE_API_BASE = "https://getlate.dev/api/v1";
const LATE_API_KEY  = Deno.env.get("LATE_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function lateHeaders() {
  return {
    "Authorization": `Bearer ${LATE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

/** Resolve Late profileId from either brand_id (Supabase) or direct profile_id */
async function resolveLateProfileId(
  brandId: string | null,
  directProfileId: string | null
): Promise<{ profileId: string | null; error?: string }> {
  // Direct profile_id takes precedence (legacy / backward compat)
  if (directProfileId) return { profileId: directProfileId };

  if (!brandId) return { profileId: null, error: "brand_id or profile_id is required" };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data, error } = await supabase
    .from("brands")
    .select("late_profile_id")
    .eq("id", brandId)
    .single();

  if (error || !data) {
    console.error("[social-connect] brand lookup error:", error?.message);
    return { profileId: null, error: "Brand not found" };
  }

  if (!data.late_profile_id) {
    // Brand exists but no Late profile yet — create one now
    try {
      const { data: brandData } = await supabase
        .from("brands")
        .select("brand_name")
        .eq("id", brandId)
        .single();

      const res = await fetch(`${LATE_API_BASE}/profiles`, {
        method: "POST",
        headers: lateHeaders(),
        body: JSON.stringify({
          name: brandData?.brand_name || "GeoVera Brand",
          description: `GeoVera brand profile — ${brandId}`,
        }),
      });

      if (res.ok) {
        const created = await res.json() as { id?: string; profileId?: string };
        const newProfileId = created.id || created.profileId || null;
        if (newProfileId) {
          await supabase
            .from("brands")
            .update({ late_profile_id: newProfileId })
            .eq("id", brandId);
          console.log(`[social-connect] Auto-created Late profile: ${newProfileId} for brand: ${brandId}`);
          return { profileId: newProfileId };
        }
      }
      const errBody = await res.json().catch(() => ({}));
      console.error("[social-connect] Late profile auto-create failed:", JSON.stringify(errBody));
    } catch (e) {
      console.error("[social-connect] Late profile auto-create error:", e);
    }
    return { profileId: null, error: "Late profile not yet created for this brand" };
  }

  return { profileId: data.late_profile_id };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!LATE_API_KEY) {
    return json({ error: "LATE_API_KEY not configured" }, 500);
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // ── GET /social-connect/status ─────────────────────────────────────────────
  if (req.method === "GET" && path.endsWith("/status")) {
    const brandId   = url.searchParams.get("brand_id");
    const profileId = url.searchParams.get("profile_id");

    const { profileId: resolvedId, error: resolveErr } = await resolveLateProfileId(brandId, profileId);
    if (!resolvedId) return json({ error: resolveErr || "profile_id required" }, 400);

    const res = await fetch(`${LATE_API_BASE}/accounts?profileId=${resolvedId}`, {
      headers: lateHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("[social-connect] status error:", JSON.stringify(data));
      return json({ error: (data as { message?: string }).message || "fetch_failed" }, res.status);
    }

    return json({ accounts: data });
  }

  // ── GET /social-connect — get OAuth auth URL for a platform ───────────────
  if (req.method === "GET") {
    const platform    = url.searchParams.get("platform");
    const brandId     = url.searchParams.get("brand_id");
    const profileId   = url.searchParams.get("profile_id");
    const redirectUri = url.searchParams.get("redirect_uri") || "https://app.geovera.xyz/oauth-done";

    if (!platform) return json({ error: "platform is required" }, 400);

    const { profileId: resolvedId, error: resolveErr } = await resolveLateProfileId(brandId, profileId);
    if (!resolvedId) return json({ error: resolveErr || "brand_id or profile_id required" }, 400);

    // Pass redirectUri to Late API so it sends user back to GeoVera after OAuth
    const lateUrl = new URL(`${LATE_API_BASE}/connect/${encodeURIComponent(platform)}`);
    lateUrl.searchParams.set("profileId", resolvedId);
    lateUrl.searchParams.set("redirectUri", redirectUri);

    const res = await fetch(lateUrl.toString(), { headers: lateHeaders() });
    const data = await res.json() as { authUrl?: string; message?: string; error?: string };

    if (!res.ok || !data.authUrl) {
      console.error("[social-connect] get auth URL error:", JSON.stringify(data));
      return json({ error: data.message || data.error || "auth_url_failed" }, res.status || 502);
    }

    return json({ auth_url: data.authUrl, platform, profile_id: resolvedId });
  }

  // ── DELETE /social-connect — disconnect a platform account ────────────────
  if (req.method === "DELETE") {
    const platform  = url.searchParams.get("platform");
    const accountId = url.searchParams.get("account_id");

    if (!platform)  return json({ error: "platform is required" }, 400);
    if (!accountId) return json({ error: "account_id is required" }, 400);

    const res = await fetch(`${LATE_API_BASE}/accounts/${encodeURIComponent(accountId)}`, {
      method: "DELETE",
      headers: lateHeaders(),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { message?: string };
      console.error("[social-connect] disconnect error:", JSON.stringify(data));
      return json({ error: data.message || "disconnect_failed" }, res.status);
    }

    return json({ success: true, platform, account_id: accountId });
  }

  return json({ error: "Method not allowed" }, 405);
});
