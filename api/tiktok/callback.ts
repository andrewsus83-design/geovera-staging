import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = process.env.SUPABASE_URL      || "https://vozjwptzutolvkvfpknk.supabase.co";
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TIKTOK_CLIENT_KEY    = process.env.TIKTOK_CLIENT_KEY    || "";
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || "";
const REDIRECT_URI         = "https://report.geovera.xyz/api/tiktok/callback";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state, error, error_description } = req.query as Record<string, string>;

  // Determine frontend redirect based on state context
  const [, context] = state ? state.split(":") : [];
  const frontendBase = context === "tiktok-calendar"
    ? "https://app.geovera.xyz/tiktok-calendar"
    : "https://app.geovera.xyz/connect";

  // ── OAuth error from TikTok ───────────────────────────────────────────────
  if (error) {
    console.error("[TikTok callback] OAuth error:", error, error_description);
    return res.redirect(
      302,
      `${frontendBase}?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (!code || !state) {
    return res.redirect(302, `${frontendBase}?error=missing_params`);
  }

  // state = "brandId:context"
  const [brandId] = state.split(":");

  try {
    // ── Exchange code for access token ────────────────────────────────────
    const tokenRes = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key:    TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          code:          code as string,
          grant_type:    "authorization_code",
          redirect_uri:  REDIRECT_URI,
        }).toString(),
      }
    );

    const tokenData = (await tokenRes.json()) as {
      access_token?:       string;
      refresh_token?:      string;
      expires_in?:         number;
      refresh_expires_in?: number;
      open_id?:            string;
      scope?:              string;
      token_type?:         string;
      error?:              string;
      error_description?:  string;
    };

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[TikTok callback] Token exchange failed:", JSON.stringify(tokenData));
      return res.redirect(
        302,
        `${frontendBase}?error=${encodeURIComponent(tokenData.error_description || tokenData.error || "token_exchange_failed")}`
      );
    }

    // ── Fetch basic user info ────────────────────────────────────────────
    const userRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const userData = (await userRes.json()) as {
      data?: { user?: { open_id?: string; display_name?: string; avatar_url?: string } };
    };
    const tiktokUser = userData.data?.user;

    // ── Upsert OAuth token in Supabase ────────────────────────────────────
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;
    const refreshExpiresAt = tokenData.refresh_expires_in
      ? new Date(Date.now() + tokenData.refresh_expires_in * 1000).toISOString()
      : null;

    await supabase.from("social_oauth_tokens").upsert(
      {
        brand_id:              brandId,
        platform:              "tiktok",
        platform_user_id:      tokenData.open_id || tiktokUser?.open_id,
        platform_username:     tiktokUser?.display_name,
        access_token:          tokenData.access_token,
        refresh_token:         tokenData.refresh_token,
        token_expires_at:      expiresAt,
        refresh_expires_at:    refreshExpiresAt,
        scopes:                tokenData.scope,
        raw_token:             tokenData,
        updated_at:            new Date().toISOString(),
      },
      { onConflict: "brand_id,platform" }
    );

    // ── Upsert social_connections ─────────────────────────────────────────
    await supabase.from("social_connections").upsert(
      {
        brand_id:              brandId,
        platform:              "tiktok",
        platform_account_id:   tokenData.open_id || tiktokUser?.open_id,
        platform_username:     tiktokUser?.display_name,
        status:                "active",
        connected_at:          new Date().toISOString(),
        updated_at:            new Date().toISOString(),
      },
      { onConflict: "brand_id,platform" }
    );

    return res.redirect(302, `${frontendBase}?tiktok_connected=true`);
  } catch (err) {
    console.error("[TikTok callback] Unexpected error:", err);
    return res.redirect(302, `${frontendBase}?error=server_error`);
  }
}
