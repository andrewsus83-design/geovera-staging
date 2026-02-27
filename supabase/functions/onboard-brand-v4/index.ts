import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================================
// BUSINESS RULES CONFIGURATION
// ============================================================================

// 18 OFFICIAL CATEGORIES (exactly 18, no more, no less)
const VALID_CATEGORIES = [
  "agency", "beauty", "car_motorcycle", "consultant", "contractor",
  "ecommerce", "education", "event_organizer", "fashion", "finance",
  "fmcg", "fnb", "health", "lifestyle", "mom_baby",
  "other", "photo_video", "saas"
] as const;

// 3 SUBSCRIPTION TIERS with pricing
const SUBSCRIPTION_TIERS = {
  basic: {
    name: "Basic",
    monthly_usd: 399,
    yearly_usd: 4389, // 11 months price (1 month FREE)
    yearly_savings_usd: 399,
  },
  premium: {
    name: "Premium",
    monthly_usd: 699,
    yearly_usd: 7689, // 11 months price (1 month FREE)
    yearly_savings_usd: 699,
  },
  partner: {
    name: "Partner",
    monthly_usd: 1099,
    yearly_usd: 12089, // 11 months price (1 month FREE)
    yearly_savings_usd: 1099,
  },
} as const;

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

    // Initialize Supabase clients
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header - Please login first" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract token from Authorization header
    const token = authHeader.replace("Bearer ", "");

    // Create ANON client to validate user JWT
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    let userId: string;
    let userEmail: string;

    try {
      // Pass token explicitly to getUser() - this is the correct way!
      const { data: { user }, error: userError } = await userClient.auth.getUser(token);

      if (userError || !user) {
        console.error("[onboard-brand-v4] Auth error:", userError);
        console.error("[onboard-brand-v4] User object:", user);
        console.error("[onboard-brand-v4] Auth header:", authHeader?.substring(0, 50) + "...");
        return new Response(
          JSON.stringify({
            error: "Unauthorized - Invalid or expired token",
            debug: {
              hasError: !!userError,
              errorMessage: userError?.message,
              hasUser: !!user,
              authHeaderPresent: !!authHeader
            }
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = user.id;
      userEmail = user.email || "";
      console.log("[onboard-brand-v4] User authenticated:", userId);

    // ============================================================
    // STEP 1: Welcome to GeoVera! (just acknowledge)
    // ============================================================
    if (step === 1) {
      return new Response(JSON.stringify({
        success: true,
        next_step: 2,
        message: "Welcome to GeoVera! Let's get started.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // STEP 2: Brand Information (NO tier/pricing)
    // ============================================================
    if (step === 2) {
      const { brand_name, category, business_type, country } = body;

      // Validate brand name
      if (!brand_name || typeof brand_name !== "string" || brand_name.trim().length < 2) {
        errors.push("Brand name wajib diisi (minimal 2 karakter)");
      }

      // Validate category (EXACTLY 18 categories)
      if (!VALID_CATEGORIES.includes(category)) {
        errors.push(`Category wajib salah satu dari 18 kategori: ${VALID_CATEGORIES.join(", ")}`);
      }

      // Validate business type
      if (!["offline", "online", "hybrid"].includes(business_type)) {
        errors.push("Business type wajib: offline, online, atau hybrid");
      }

      // Validate country
      if (!country || typeof country !== "string" || country.trim().length !== 2) {
        errors.push("Country wajib diisi (kode 2 huruf, contoh: ID, US, SG)");
      } else if (!VALID_COUNTRIES.has(country.trim().toUpperCase())) {
        errors.push(`Country code '${country}' tidak dikenali. Gunakan ISO 3166-1 alpha-2`);
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

      // Check if user already owns a brand (BUSINESS RULE: 1 user = 1 brand ownership)
      const { data: existingBrands } = await supabase
        .from('user_brands')
        .select('brand_id, role')
        .eq('user_id', userId)
        .eq('role', 'owner');

      if (existingBrands && existingBrands.length > 0) {
        errors.push("Anda sudah memiliki brand. 1 user hanya bisa memiliki 1 brand.");
      }

      if (errors.length > 0) {
        return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create brand WITHOUT tier (will be set later in Step 5)
      const { data: brand, error: brandError} = await supabase
        .from('brands')
        .insert({
          brand_name: brand_name.trim(),
          category: category,
          business_type: business_type,
          country: country.trim().toUpperCase(),
          google_maps_url: body.google_maps_url?.trim() || null,
          description: body.description?.trim() || null,
          onboarding_completed: false,
        })
        .select()
        .single();

      if (brandError) {
        console.error("Brand creation error:", brandError);
        return new Response(JSON.stringify({ error: brandError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Link user as owner
      const { error: linkError } = await supabase
        .from('user_brands')
        .insert({
          user_id: userId,
          brand_id: brand.id,
          role: 'owner'
        });

      if (linkError) {
        console.error("User-brand link error:", linkError);
        return new Response(JSON.stringify({ error: linkError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create a Late profile for this brand (for social media connections)
      let lateProfileId: string | null = null;
      try {
        const lateApiKey = Deno.env.get("LATE_API_KEY") || "";
        if (lateApiKey) {
          const lateRes = await fetch("https://getlate.dev/api/v1/profiles", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lateApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: brand_name.trim(),
              description: `GeoVera brand profile for ${brand_name.trim()}`,
            }),
          });
          if (lateRes.ok) {
            const lateData = await lateRes.json() as { id?: string; profileId?: string };
            lateProfileId = lateData.id || lateData.profileId || null;
            if (lateProfileId) {
              await supabase
                .from('brands')
                .update({ late_profile_id: lateProfileId })
                .eq('id', brand.id);
              console.log(`[onboard] Late profile created: ${lateProfileId} for brand: ${brand.id}`);
            }
          } else {
            const errData = await lateRes.json().catch(() => ({}));
            console.error("[onboard] Late profile creation failed:", JSON.stringify(errData));
          }
        }
      } catch (lateErr) {
        // Non-fatal — brand is still created, Late profile can be created later
        console.error("[onboard] Late profile creation error:", lateErr);
      }

      return new Response(JSON.stringify({
        success: true,
        brand_id: brand.id,
        brand: { ...brand, late_profile_id: lateProfileId },
        late_profile_id: lateProfileId,
        next_step: 3,
        message: "Brand created! Please connect your social media.",
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // STEP 3: Let's Connect! Social Media Links (Optional)
    // ============================================================
    if (step === 3) {
      if (!body.brand_id) {
        errors.push("brand_id wajib untuk Step 3");
      }

      // Validate URLs
      const urlFields = ["web_url", "instagram_url", "tiktok_url", "youtube_url"];
      for (const field of urlFields) {
        if (body[field] && typeof body[field] === "string" && body[field].trim() !== "") {
          try { new URL(body[field]); } catch {
            errors.push(`${field} harus URL valid (contoh: https://...)`);
          }
        }
      }

      // Validate WhatsApp
      if (body.whatsapp && typeof body.whatsapp === "string" && body.whatsapp.trim() !== "") {
        const cleaned = body.whatsapp.replace(/[^0-9+]/g, "");
        if (cleaned.length < 10 || cleaned.length > 15) {
          errors.push("Nomor WhatsApp harus 10-15 digit");
        }
      }

      if (errors.length > 0) {
        return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update brand with social media links
      const { data: updatedBrand, error: updateError } = await supabase
        .from('brands')
        .update({
          web_url: body.web_url?.trim() || null,
          whatsapp: body.whatsapp?.trim() || null,
          instagram_url: body.instagram_url?.trim() || null,
          tiktok_url: body.tiktok_url?.trim() || null,
          youtube_url: body.youtube_url?.trim() || null,
          facebook_url: body.facebook_url?.trim() || null,
        })
        .eq('id', body.brand_id)
        .select()
        .single();

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        brand_id: updatedBrand.id,
        brand: updatedBrand,
        next_step: 4,
        message: "Social media links saved! Please confirm your brand setup.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // STEP 4: CONFIRMATION (30-day brand lock warning)
    // ============================================================
    if (step === 4) {
      if (!body.brand_id) {
        errors.push("brand_id wajib untuk Step 4");
      }

      if (!body.understood_30day_lock) {
        errors.push("Anda harus memahami bahwa brand tidak bisa diganti selama 30 hari");
      }

      if (!body.confirmation_text || body.confirmation_text !== "SAYA SETUJU") {
        errors.push("Ketik 'SAYA SETUJU' untuk konfirmasi");
      }

      if (errors.length > 0) {
        return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get brand details
      const { data: brand } = await supabase
        .from('brands')
        .select('*')
        .eq('id', body.brand_id)
        .single();

      if (!brand) {
        return new Response(JSON.stringify({ error: "Brand not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Record confirmation
      const { error: confirmError } = await supabase
        .from('gv_brand_confirmations')
        .insert({
          brand_id: body.brand_id,
          user_id: userId,
          confirmed_brand_name: brand.brand_name,
          confirmed_category: brand.category,
          confirmed_tier: brand.subscription_tier || null,
          confirmed_billing_cycle: brand.billing_cycle || null,
          understood_30day_lock: true,
          confirmation_text: body.confirmation_text,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
        });

      if (confirmError) {
        console.error("Confirmation error:", confirmError);
      }

      // Mark brand_change_confirmed = true
      const { error: confirmUpdateError } = await supabase
        .from('brands')
        .update({
          brand_change_confirmed: true,
        })
        .eq('id', body.brand_id);

      if (confirmUpdateError) {
        console.error("Confirm update error:", confirmUpdateError);
      }

      return new Response(JSON.stringify({
        success: true,
        brand_id: body.brand_id,
        brand: brand,
        next_step: 5,
        message: "Confirmation recorded! Continue to final step.",
        warning: "⚠️ Brand terkunci selama 30 hari karena alasan personalisasi.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // STEP 5: Thank You! + Tier & Pricing (can be skipped)
    // ============================================================
    if (step === 5) {
      if (!body.brand_id) {
        errors.push("brand_id wajib untuk Step 5");
      }

      // If user skipped tier selection
      if (body.skip_tier_selection) {
        // Mark onboarding as completed WITHOUT tier
        const { error: completeError } = await supabase
          .from('brands')
          .update({
            onboarding_completed: true,
          })
          .eq('id', body.brand_id);

        if (completeError) {
          console.error("Complete error:", completeError);
        }

        // Queue onboarding email
        const { data: emailQueue1, error: emailError } = await supabase
          .from('gv_onboarding_email_queue')
          .insert({
            brand_id: body.brand_id,
            user_id: userId,
            email: userEmail,
            report_type: 'onboarding_complete',
            status: 'pending',
            cta_text: '🚀 Mulai Campaign Pertama Anda',
            cta_url: `${Deno.env.get('FRONTEND_URL') || 'https://geovera.vercel.app'}/dashboard?brand_id=${body.brand_id}`,
          })
          .select('id')
          .single();

        if (emailError) {
          console.error("Email queue error:", emailError);
        } else if (emailQueue1?.id) {
          // Fire-and-forget: trigger email processor
          fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/email-processor`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ queue_id: emailQueue1.id }),
          }).catch((e) => console.error("Email processor trigger failed:", e));
        }

        return new Response(JSON.stringify({
          success: true,
          brand_id: body.brand_id,
          message: "🎉 Onboarding completed! Welcome to GeoVera! (No tier selected)",
          email_report: "📧 Laporan lengkap akan dikirim ke email Anda dalam beberapa menit.",
          redirect_to: "/dashboard",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // User selected a tier
      const { tier, billing_cycle } = body;

      // Validate tier (EXACTLY 3 tiers)
      if (!["basic", "premium", "partner"].includes(tier)) {
        errors.push("Tier wajib: basic ($399), premium ($699), atau partner ($1,099)");
      }

      // Validate billing cycle
      if (!["monthly", "yearly"].includes(billing_cycle)) {
        errors.push("Billing cycle wajib: monthly atau yearly");
      }

      if (errors.length > 0) {
        return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update brand with tier and billing
      const { data: updatedBrand, error: updateError } = await supabase
        .from('brands')
        .update({
          subscription_tier: tier,
          billing_cycle: billing_cycle,
          yearly_discount_applied: billing_cycle === 'yearly',
          onboarding_completed: true,
        })
        .eq('id', body.brand_id)
        .select()
        .single();

      if (updateError) {
        console.error("Update brand tier error:", updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Queue onboarding email
      const { data: emailQueue2, error: emailError } = await supabase
        .from('gv_onboarding_email_queue')
        .insert({
          brand_id: body.brand_id,
          user_id: userId,
          email: userEmail,
          report_type: 'onboarding_complete',
          status: 'pending',
          cta_text: '🚀 Mulai Campaign Pertama Anda',
          cta_url: `${Deno.env.get('FRONTEND_URL') || 'https://geovera.vercel.app'}/dashboard?brand_id=${body.brand_id}`,
        })
        .select('id')
        .single();

      if (emailError) {
        console.error("Email queue error:", emailError);
      } else if (emailQueue2?.id) {
        // Fire-and-forget: trigger email processor
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/email-processor`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ queue_id: emailQueue2.id }),
        }).catch((e) => console.error("Email processor trigger failed:", e));
      }

      // Calculate pricing
      const tierInfo = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
      const pricing = {
        tier: tier,
        tier_name: tierInfo.name,
        billing_cycle: billing_cycle,
        monthly_price: tierInfo.monthly_usd,
        yearly_price: tierInfo.yearly_usd,
        yearly_savings: billing_cycle === 'yearly' ? tierInfo.yearly_savings_usd : 0,
        total_price: billing_cycle === 'yearly' ? tierInfo.yearly_usd : tierInfo.monthly_usd,
        currency: 'USD',
        note: billing_cycle === 'yearly' ? '✨ Bayar tahunan dapat 1 bulan GRATIS!' : null,
      };

      return new Response(JSON.stringify({
        success: true,
        brand_id: body.brand_id,
        brand: updatedBrand,
        pricing: pricing,
        message: "🎉 Onboarding completed! Welcome to GeoVera!",
        warning: "⚠️ Brand terkunci selama 30 hari dan tidak bisa diganti.",
        locked_until: updatedBrand.brand_locked_until,
        email_report: "📧 Laporan lengkap akan dikirim ke email Anda dalam beberapa menit.",
        redirect_to: "/dashboard",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid step" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    } catch (jwtError) {
      console.error("[onboard-brand-v4] JWT parsing error:", jwtError);
      return new Response(
        JSON.stringify({ error: "Invalid or malformed JWT token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
