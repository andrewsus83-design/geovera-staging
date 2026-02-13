import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ISO 3166-1 alpha-2 common codes for validation
const VALID_COUNTRIES = new Set([
  "ID","US","GB","SG","MY","TH","PH","VN","AU","JP","KR","CN","IN","DE","FR",
  "IT","ES","NL","BR","CA","MX","AE","SA","TR","RU","ZA","NG","EG","KE","NZ",
  "HK","TW","PK","BD","LK","MM","KH","LA","BN","SE","NO","DK","FI","PL","CZ",
  "AT","CH","BE","PT","GR","IE","IL","QA","KW","BH","OM","JO","LB","AR","CL",
  "CO","PE","EC","UY","PY","BO","VE","CR","PA","GT","HN","SV","NI","DO","CU",
  "JM","TT","PR","GH","CM","CI","SN","TZ","UG","ET","MA","TN","DZ","LY","UA",
  "RO","HU","BG","HR","RS","SK","SI","LT","LV","EE","MT","CY","LU","IS"
]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const step = body.step ?? 1;
    const errors: string[] = [];

    // ============================================================
    // STEP 1 VALIDATION: Wajib fields
    // ============================================================
    if (step === 1) {
      const { email, brand_name, category, business_type, country } = body;

      if (!email || typeof email !== "string" || !email.includes("@")) {
        errors.push("Email wajib diisi dan harus valid");
      }
      if (!brand_name || typeof brand_name !== "string" || brand_name.trim().length < 2) {
        errors.push("Nama brand wajib diisi (minimal 2 karakter)");
      }
      const VALID_CATEGORIES = [
        "agency", "beauty", "car_motorcycle", "consultant", "contractor",
        "ecommerce", "education", "event_organizer", "fashion", "finance",
        "fmcg", "fnb", "health", "lifestyle", "mom_baby",
        "other", "photo_video", "saas"
      ];

      if (!VALID_CATEGORIES.includes(category)) {
        errors.push(`Category wajib salah satu dari: ${VALID_CATEGORIES.join(", ")}`);
      }
      if (!["offline", "online", "hybrid"].includes(business_type)) {
        errors.push("Type wajib: offline, online, hybrid");
      }
      if (!country || typeof country !== "string" || country.trim().length !== 2) {
        errors.push("Country wajib diisi (kode 2 huruf, contoh: ID, US, SG)");
      } else if (!VALID_COUNTRIES.has(country.trim().toUpperCase())) {
        errors.push(`Country code '${country}' tidak dikenali. Gunakan ISO 3166-1 alpha-2 (contoh: ID, US, SG)`);
      }

      // Google Maps wajib jika offline/hybrid
      if ((business_type === "offline" || business_type === "hybrid")) {
        if (!body.google_maps_url || body.google_maps_url.trim() === "") {
          errors.push("Google Maps URL wajib untuk bisnis offline/hybrid");
        } else {
          const gurl = body.google_maps_url.trim();
          if (!gurl.includes("google.com/maps") && !gurl.includes("maps.google") && !gurl.includes("goo.gl/maps") && !gurl.includes("maps.app.goo.gl")) {
            errors.push("Google Maps URL harus dari Google Maps");
          }
        }
      }
    }

    // ============================================================
    // STEP 2 VALIDATION: Optional fields (light validation)
    // ============================================================
    if (step === 2) {
      if (!body.brand_id) {
        errors.push("brand_id wajib untuk Step 2 (didapat dari response Step 1)");
      }

      const urlFields = ["web_url", "instagram_url", "tiktok_url", "youtube_url"];
      for (const field of urlFields) {
        if (body[field] && typeof body[field] === "string" && body[field].trim() !== "") {
          try { new URL(body[field]); } catch {
            errors.push(`${field} harus URL valid (contoh: https://...)`);
          }
        }
      }

      if (body.whatsapp && typeof body.whatsapp === "string" && body.whatsapp.trim() !== "") {
        const cleaned = body.whatsapp.replace(/[^0-9+]/g, "");
        if (cleaned.length < 10 || cleaned.length > 15) {
          errors.push("Nomor WhatsApp harus 10-15 digit");
        }
      }
    }

    if (step !== 1 && step !== 2) {
      errors.push("step harus 1 atau 2");
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // AUTH + RPC CALL
    // ============================================================
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (authHeader) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user } } = await userClient.auth.getUser();
      if (user) userId = user.id;
    }

    const { data, error } = await supabase.rpc("onboard_brand", {
      p_email: body.email?.trim()?.toLowerCase() ?? null,
      p_brand_name: body.brand_name?.trim() ?? null,
      p_category: body.category ?? null,
      p_business_type: body.business_type ?? null,
      p_country: body.country?.trim()?.toUpperCase() ?? null,
      p_google_maps_url: body.google_maps_url?.trim() || null,
      p_description: body.description?.trim() || null,
      p_web_url: body.web_url?.trim() || null,
      p_whatsapp: body.whatsapp?.trim() || null,
      p_instagram_url: body.instagram_url?.trim() || null,
      p_tiktok_url: body.tiktok_url?.trim() || null,
      p_youtube_url: body.youtube_url?.trim() || null,
      p_step: step,
      p_brand_id: body.brand_id || null,
      p_user_id: userId,
    });

    if (error) {
      console.error("Onboarding error:", error);
      return new Response(JSON.stringify({ error: "Onboarding failed", details: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if RPC returned an error
    if (data && data.success === false) {
      return new Response(JSON.stringify(data), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: step === 1 ? 201 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
