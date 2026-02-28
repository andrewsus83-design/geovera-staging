import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Resend webhook event types ────────────────────────────────────────────────
type ResendEvent = {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.opened"
    | "email.clicked"
    | "email.bounced"
    | "email.complained"
    | "email.unsubscribed";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
    click?: { link: string; timestamp: string };
    bounce?: { type: string; message?: string };
    tags?: Array<{ name: string; value: string }>;
  };
};

// ── Verify Resend webhook signature (optional but recommended) ────────────────
async function verifySignature(req: Request, body: string): Promise<boolean> {
  if (!RESEND_WEBHOOK_SECRET) return true; // skip if not configured
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const encoder = new TextEncoder();

  // Resend uses multiple secrets, try each
  const secrets = RESEND_WEBHOOK_SECRET.split(",").map((s) => s.trim());
  for (const secret of secrets) {
    try {
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret.replace("whsec_", "")),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedContent));
      const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
      if (svixSignature.includes(`v1,${sigB64}`)) return true;
    } catch (_) { /* try next */ }
  }
  return false;
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawBody = await req.text();

  // Optionally verify signature
  if (RESEND_WEBHOOK_SECRET) {
    const valid = await verifySignature(req, rawBody);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { type, data, created_at } = event;
  const emailId = data.email_id;
  const now = created_at || new Date().toISOString();
  const recipientEmail = data.to?.[0] || "";

  console.log(`[email-webhook] ${type} → ${emailId}`);

  try {
    switch (type) {
      case "email.delivered": {
        await supabase.from("email_analytics")
          .update({ status: "delivered", delivered_at: now })
          .eq("resend_email_id", emailId);
        break;
      }

      case "email.opened": {
        // Increment open count, set first open timestamp
        const { data: existing } = await supabase
          .from("email_analytics")
          .select("open_count, opened_at")
          .eq("resend_email_id", emailId)
          .single();

        const openCount = (existing?.open_count || 0) + 1;
        const openedAt = existing?.opened_at || now;

        await supabase.from("email_analytics")
          .update({ open_count: openCount, opened_at: openedAt })
          .eq("resend_email_id", emailId);
        break;
      }

      case "email.clicked": {
        const clickedUrl = data.click?.link || "";
        const { data: existing } = await supabase
          .from("email_analytics")
          .select("click_count, clicked_at")
          .eq("resend_email_id", emailId)
          .single();

        const clickCount = (existing?.click_count || 0) + 1;
        const clickedAt = existing?.clicked_at || now;

        await supabase.from("email_analytics")
          .update({
            click_count: clickCount,
            clicked_at: clickedAt,
            clicked_url: clickedUrl || existing?.clicked_at,
          })
          .eq("resend_email_id", emailId);
        break;
      }

      case "email.bounced": {
        const bounceType = data.bounce?.type || "unknown";
        await supabase.from("email_analytics")
          .update({ status: "bounced", bounced_at: now, bounce_type: bounceType })
          .eq("resend_email_id", emailId);
        break;
      }

      case "email.complained": {
        await supabase.from("email_analytics")
          .update({ status: "complained", complained_at: now })
          .eq("resend_email_id", emailId);

        // Auto-add to unsubscribe list
        if (recipientEmail) {
          await supabase.from("email_unsubscribes").upsert({
            email: recipientEmail,
            reason: "spam_complaint",
            unsubscribed_at: now,
          });
        }
        break;
      }

      case "email.unsubscribed": {
        await supabase.from("email_analytics")
          .update({ unsubscribed_at: now })
          .eq("resend_email_id", emailId);

        if (recipientEmail) {
          await supabase.from("email_unsubscribes").upsert({
            email: recipientEmail,
            reason: "unsubscribed",
            unsubscribed_at: now,
          });
        }
        break;
      }

      case "email.sent":
      case "email.delivery_delayed":
      default:
        // Acknowledged but no action needed
        break;
    }

    return new Response(JSON.stringify({ received: true, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[email-webhook] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
