import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = process.env.SUPABASE_URL     || "https://vozjwptzutolvkvfpknk.supabase.co";
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TIKTOK_API_BASE  = "https://open.tiktokapis.com/v2";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { postId, caption, videoUrl, brandId } = req.body as {
    postId: string;
    caption: string;
    videoUrl: string;
    brandId: string;
  };

  if (!postId || !caption || !videoUrl || !brandId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Retrieve stored TikTok access token for this brand
    const { data: tokenRow } = await supabase
      .from("social_oauth_tokens")
      .select("access_token, token_expires_at")
      .eq("brand_id", brandId)
      .eq("platform", "tiktok")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!tokenRow?.access_token) {
      return res.status(401).json({
        error: "TikTok not connected. Please connect via OAuth first.",
        requiresAuth: true,
      });
    }

    const accessToken = tokenRow.access_token;

    // 2. Initialize TikTok Content Posting — SEND_TO_USER_INBOX mode
    //    This sends the post to the user's TikTok inbox (drafts) for review.
    //    Scopes required: video.publish, video.upload
    const initPayload = {
      post_info: {
        title: caption.slice(0, 2200), // TikTok max caption length
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
      post_mode: "SEND_TO_USER_INBOX",
      media_type: "VIDEO",
    };

    const initRes = await fetch(
      `${TIKTOK_API_BASE}/post/publish/inbox/video/init/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(initPayload),
      }
    );

    const initData = (await initRes.json()) as {
      data?: { publish_id?: string };
      error?: { code?: string; message?: string };
    };

    if (!initRes.ok || initData.error?.code !== "ok") {
      console.error("[TikTok publish] API error:", JSON.stringify(initData));
      return res.status(500).json({
        error: initData.error?.message || "TikTok API error",
        tiktokError: initData.error,
      });
    }

    const publishId = initData.data?.publish_id;

    // 3. Log the publish event to Supabase
    await supabase.from("gv_rss_publish_log").insert({
      brand_id:            brandId,
      platform:            "tiktok",
      sociomonials_post_id: publishId,
      sociomonials_status:  "scheduled",
      raw_payload:          initData,
    });

    return res.status(200).json({
      success:   true,
      publishId,
      message:   "Post sent to TikTok inbox! Open TikTok app to review and publish.",
    });
  } catch (err) {
    console.error("[TikTok publish] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
