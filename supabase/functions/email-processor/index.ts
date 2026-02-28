import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const FROM_EMAIL = "GeoVera <hello@geovera.xyz>";
const REPLY_TO = "hello@geovera.xyz";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Design Tokens (matching app.geovera.xyz) ─────────────────────────────────
// Brand:   #16a34a (brand-500 green)
// Gray:    #101828 (900), #344054 (700), #475467 (600), #667085 (500), #98a2b3 (400)
//          #e4e7ec (200), #f2f4f7 (100), #f9fafb (50)
// Success: #f0fdf4 bg, #16a34a border
// Font:    Inter, -apple-system, BlinkMacSystemFont, sans-serif
// Logo:    Georgia serif

// ── HTML Email Template ───────────────────────────────────────────────────────
function buildEmailHtml(opts: {
  brandName: string;
  email: string;
  ctaUrl: string;
  ctaText: string;
  todoList?: Array<{ task: string; priority?: string }>;
  insights?: string[];
  radarPreview?: { topCompetitors?: string[] };
  brandDna?: { tagline?: string; positioning?: string };
}): string {
  const { brandName, ctaUrl, ctaText, todoList, insights, radarPreview, brandDna } = opts;

  // Priority dot colors (matching app warning/success/gray)
  const todoItems = (todoList || []).slice(0, 5).map((t) => {
    const task = typeof t === "string" ? t : t.task || "";
    const priority = typeof t === "object" ? t.priority : undefined;
    const dot = priority === "high" ? "#f04438" : priority === "medium" ? "#f79009" : "#16a34a";
    const label = priority === "high" ? "Prioritas" : priority === "medium" ? "Segera" : "Normal";
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f2f4f7;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="8" valign="middle">
                <div style="width:8px;height:8px;border-radius:50%;background:${dot};"></div>
              </td>
              <td style="font-size:14px;color:#344054;padding-left:10px;line-height:20px;">${task}</td>
              <td width="60" align="right">
                <span style="font-size:12px;color:${dot};font-weight:500;">${label}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join("");

  const insightItems = (insights || []).slice(0, 3).map((ins) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f2f4f7;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="28" valign="top">
              <div style="width:24px;height:24px;background:#f0fdf4;border-radius:6px;text-align:center;line-height:24px;font-size:14px;">💡</div>
            </td>
            <td style="font-size:14px;color:#475467;padding-left:10px;line-height:20px;">${ins}</td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const competitors = (radarPreview?.topCompetitors || []).slice(0, 3);
  const competitorChips = competitors.map((c) =>
    `<span style="display:inline-block;background:#f9fafb;border:1px solid #e4e7ec;border-radius:20px;padding:4px 12px;font-size:12px;color:#475467;margin:3px 3px 3px 0;">${c}</span>`
  ).join("");

  const tagline = brandDna?.tagline || brandDna?.positioning || "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Selamat datang di GeoVera — ${brandName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; }
    * { box-sizing: border-box; }
    /* Font size scale — matching app.geovera.xyz */
    /* theme-xl  = 20px / 30px */
    /* theme-sm  = 14px / 20px */
    /* theme-xs  = 12px / 18px */
  </style>
</head>
<body style="margin:0;padding:0;background:#f2f4f7;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:20px;-webkit-font-smoothing:antialiased;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f2f4f7;padding:32px 16px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;">

  <!-- TOP ACCENT BAR -->
  <tr><td>
    <div style="height:4px;background:#16a34a;border-radius:4px 4px 0 0;"></div>
  </td></tr>

  <!-- HEADER -->
  <tr><td style="background:#ffffff;padding:24px 40px;border-bottom:1px solid #e4e7ec;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td valign="middle">
          <a href="https://geovera.xyz" style="text-decoration:none;display:inline-block;">
            <img src="https://vozjwptzutolvkvfpknk.supabase.co/storage/v1/object/public/brand-assets/geoveralogo.png"
              alt="GeoVera"
              width="140"
              style="display:block;height:auto;border:0;outline:none;"
            />
          </a>
        </td>
        <td align="right" valign="middle">
          <span style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:4px 12px;font-size:12px;color:#16a34a;font-weight:500;">✓ Onboarding Selesai</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- HERO SECTION -->
  <tr><td style="background:#ffffff;padding:36px 40px 32px 40px;">
    <div style="font-size:24px;font-weight:700;color:#101828;line-height:32px;letter-spacing:-0.5px;">
      🎉 ${brandName} siap tampil<br>di era AI Search!
    </div>
    ${tagline ? `
    <div style="margin-top:12px;padding:12px 16px;background:#f9fafb;border-left:3px solid #16a34a;border-radius:0 6px 6px 0;">
      <div style="font-size:14px;color:#475467;font-style:italic;line-height:20px;">"${tagline}"</div>
    </div>` : ""}
    <div style="font-size:14px;color:#667085;margin-top:16px;line-height:20px;">
      Onboarding Anda selesai. AI Agents sudah dipersonalisasi khusus untuk brand
      <strong style="color:#344054;">${brandName}</strong>.
      Semua tools siap digunakan dari dashboard Anda.
    </div>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="background:#ffffff;padding:0 40px;">
    <div style="height:1px;background:#f2f4f7;"></div>
  </td></tr>

  <!-- NEXT STEPS -->
  ${todoItems ? `
  <tr><td style="background:#ffffff;padding:28px 40px;">
    <div style="font-size:12px;font-weight:600;color:#16a34a;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:16px;">
      ⚡ Next Steps untuk ${brandName}
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      ${todoItems}
    </table>
  </td></tr>
  <tr><td style="background:#ffffff;padding:0 40px;">
    <div style="height:1px;background:#f2f4f7;"></div>
  </td></tr>` : ""}

  <!-- INSIGHTS -->
  ${insightItems ? `
  <tr><td style="background:#ffffff;padding:28px 40px;">
    <div style="font-size:12px;font-weight:600;color:#16a34a;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:16px;">
      🔍 Insight Pertama untuk Brand Anda
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      ${insightItems}
    </table>
  </td></tr>
  <tr><td style="background:#ffffff;padding:0 40px;">
    <div style="height:1px;background:#f2f4f7;"></div>
  </td></tr>` : ""}

  <!-- COMPETITOR RADAR -->
  ${competitorChips ? `
  <tr><td style="background:#ffffff;padding:28px 40px;">
    <div style="font-size:12px;font-weight:600;color:#16a34a;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:16px;">
      🎯 Radar Kompetitor Terdeteksi
    </div>
    <div style="background:#f9fafb;border:1px solid #e4e7ec;border-radius:12px;padding:16px 20px;">
      <div>${competitorChips}</div>
      <div style="font-size:12px;color:#98a2b3;margin-top:10px;">Pantau pergerakan kompetitor secara real-time di dashboard →</div>
    </div>
  </td></tr>
  <tr><td style="background:#ffffff;padding:0 40px;">
    <div style="height:1px;background:#f2f4f7;"></div>
  </td></tr>` : ""}

  <!-- WHAT'S READY -->
  <tr><td style="background:#ffffff;padding:28px 40px;">
    <div style="font-size:12px;font-weight:600;color:#16a34a;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:16px;">
      ✅ Yang Sudah Siap di Dashboard Anda
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      ${[
        ["🤖", `AI CEO Agent — dipersonalisasi untuk ${brandName}`],
        ["📊", "GEO Analyzer — pantau visibilitas di ChatGPT & Gemini"],
        ["🔍", "SEO Monitor — analisa performa keyword"],
        ["📡", "Radar Kompetitor — deteksi gerakan kompetitor"],
        ["✍️", "Authority Hub — buat konten yang direkomendasikan AI"],
      ].map(([icon, text]) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f2f4f7;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="28" style="font-size:16px;">${icon}</td>
                <td style="font-size:14px;color:#344054;padding-left:8px;line-height:20px;">${text}</td>
              </tr>
            </table>
          </td>
        </tr>`).join("")}
    </table>
  </td></tr>

  <!-- CTA SECTION -->
  <tr><td style="background:#f9fafb;padding:32px 40px;border-top:1px solid #e4e7ec;border-bottom:1px solid #e4e7ec;">
    <div style="text-align:center;">
      <a href="${ctaUrl}"
        style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;
               font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px;
               box-shadow:0 1px 3px 0 rgba(16,24,40,0.1),0 1px 2px 0 rgba(16,24,40,0.06);
               letter-spacing:-0.1px;">
        ${ctaText}
      </a>
      <div style="font-size:12px;color:#98a2b3;margin-top:12px;">
        Langsung ke dashboard — tidak perlu login ulang
      </div>
    </div>
  </td></tr>

  <!-- 3 PILLARS BANNER -->
  <tr><td style="background:#ffffff;padding:24px 40px;border-bottom:1px solid #e4e7ec;">
    <div style="font-size:12px;font-weight:600;color:#98a2b3;letter-spacing:1.2px;text-transform:uppercase;text-align:center;margin-bottom:20px;">
      Framework Distribusi Konten GeoVera
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="33%" align="center" style="padding:4px 8px;">
          <div style="font-size:22px;">🔍</div>
          <div style="font-size:14px;font-weight:600;color:#344054;margin-top:6px;">SEO</div>
          <div style="font-size:12px;color:#98a2b3;margin-top:2px;">Google Search</div>
        </td>
        <td width="33%" align="center" style="padding:4px 8px;border-left:1px solid #e4e7ec;border-right:1px solid #e4e7ec;">
          <div style="font-size:22px;">🤖</div>
          <div style="font-size:14px;font-weight:600;color:#344054;margin-top:6px;">GEO</div>
          <div style="font-size:12px;color:#98a2b3;margin-top:2px;">ChatGPT · Gemini · Perplexity</div>
        </td>
        <td width="33%" align="center" style="padding:4px 8px;">
          <div style="font-size:22px;">📱</div>
          <div style="font-size:14px;font-weight:600;color:#344054;margin-top:6px;">Social</div>
          <div style="font-size:12px;color:#98a2b3;margin-top:2px;">TikTok · IG · YouTube</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;border:1px solid #e4e7ec;border-top:none;">
    <div style="margin-bottom:10px;">
      <img src="https://vozjwptzutolvkvfpknk.supabase.co/storage/v1/object/public/brand-assets/geoveralogo.png"
        alt="GeoVera" width="90" style="display:inline-block;height:auto;border:0;opacity:0.7;" />
    </div>
    <div style="font-size:12px;color:#98a2b3;line-height:20px;">
      Anda menerima email ini karena baru menyelesaikan onboarding GeoVera.<br>
      <a href="https://geovera.xyz/unsubscribe?email=${opts.email}" style="color:#16a34a;text-decoration:none;">Berhenti berlangganan</a>
      &nbsp;·&nbsp;
      <a href="https://geovera.xyz" style="color:#98a2b3;text-decoration:none;">geovera.xyz</a>
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

// ── Send via Resend ───────────────────────────────────────────────────────────
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  queueId: string;
}): Promise<{ success: boolean; resendId?: string; error?: string }> {
  if (!RESEND_API_KEY) return { success: false, error: "RESEND_API_KEY not set" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      reply_to: REPLY_TO,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      tags: [
        { name: "queue_id", value: opts.queueId },
        { name: "type", value: "onboarding_complete" },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: err };
  }

  const data = await res.json();
  return { success: true, resendId: data.id };
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const queueId: string | null = body.queue_id || null; // process specific ID, or all pending
    const dryRun: boolean = body.dry_run === true;

    // Check unsubscribes list
    const { data: unsubs } = await supabase
      .from("email_unsubscribes")
      .select("email");
    const unsubSet = new Set((unsubs || []).map((u: { email: string }) => u.email));

    // Fetch pending emails
    let query = supabase
      .from("gv_onboarding_email_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(20);
    if (queueId) query = query.eq("id", queueId);

    const { data: queue, error: qErr } = await query;
    if (qErr) throw qErr;
    if (!queue || queue.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: "No pending emails" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const item of queue) {
      const recipientEmail = item.email as string;

      // Skip unsubscribed
      if (unsubSet.has(recipientEmail)) {
        await supabase.from("gv_onboarding_email_queue").update({ status: "skipped" }).eq("id", item.id);
        results.push({ id: item.id, status: "skipped", reason: "unsubscribed" });
        continue;
      }

      // Get brand name
      let brandName = "Brand Anda";
      if (item.brand_id) {
        const { data: brand } = await supabase
          .from("brands")
          .select("brand_name")
          .eq("id", item.brand_id)
          .single();
        if (brand?.brand_name) brandName = brand.brand_name;
      }

      // Extract rich data from queue
      const todoList = item.todo_list as Array<{ task: string; priority?: string }> | null;
      const insights = item.daily_insights_samples as string[] | null;
      const radarPreview = item.radar_preview as { topCompetitors?: string[] } | null;
      const brandDna = item.brand_dna as { tagline?: string; positioning?: string } | null;

      const subject = `🎉 ${brandName} siap tampil di ChatGPT & Gemini — Dashboard siap!`;

      const html = buildEmailHtml({
        brandName,
        email: recipientEmail,
        ctaUrl: item.cta_url || "https://app.geovera.xyz",
        ctaText: item.cta_text || "🚀 Buka Dashboard GeoVera",
        todoList: todoList || undefined,
        insights: insights || undefined,
        radarPreview: radarPreview || undefined,
        brandDna: brandDna || undefined,
      });

      if (dryRun) {
        results.push({ id: item.id, status: "dry_run", to: recipientEmail, subject });
        continue;
      }

      // Mark as processing
      await supabase.from("gv_onboarding_email_queue")
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("id", item.id);

      // Send via Resend
      const { success, resendId, error: sendErr } = await sendEmail({
        to: recipientEmail,
        subject,
        html,
        queueId: item.id,
      });

      const now = new Date().toISOString();

      if (success && resendId) {
        // Update queue to sent
        await supabase.from("gv_onboarding_email_queue")
          .update({ status: "sent", sent_at: now, updated_at: now })
          .eq("id", item.id);

        // Log to email_analytics
        await supabase.from("email_analytics").insert({
          email_queue_id: item.id,
          resend_email_id: resendId,
          email: recipientEmail,
          email_type: item.report_type || "onboarding_complete",
          brand_id: item.brand_id,
          user_id: item.user_id,
          status: "sent",
          subject,
        });

        results.push({ id: item.id, status: "sent", resendId, to: recipientEmail });
      } else {
        const retryCount = (item.retry_count || 0) + 1;
        const newStatus = retryCount >= 3 ? "failed" : "pending";

        await supabase.from("gv_onboarding_email_queue")
          .update({
            status: newStatus,
            retry_count: retryCount,
            error_message: sendErr,
            updated_at: now,
          })
          .eq("id", item.id);

        results.push({ id: item.id, status: "error", error: sendErr, retry: retryCount });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
