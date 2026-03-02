import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vozjwptzutolvkvfpknk.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: cors });
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
    }
    const token = authHeader.slice(7);

    // Verify user via anon client + token
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvemp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODI0NzcsImV4cCI6MjA4NTQ1ODQ3N30.p-RiTR1Iva9Y4KiZu8gnF2CZjvnMWNAHUVCbp57PDF8";
    const userClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: cors });
    }

    const body = await request.json();
    const {
      brand_name, industry, description,
      platform_type, platform_url,
      country, target_audience, whatsapp,
    } = body;

    if (!brand_name) {
      return NextResponse.json({ error: "brand_name is required" }, { status: 400, headers: cors });
    }

    // Use service role client for DB operations
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Check if user already has a brand
    const { data: existing } = await admin
      .from("user_brands")
      .select("brand_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.brand_id) {
      // Update existing brand with onboarding data
      await admin.from("brands").update({
        brand_name,
        category: industry || null,
        description: description || null,
        country: country || null,
        whatsapp: whatsapp || null,
        web_url: platform_type === "web" ? platform_url || null : null,
        instagram_url: platform_type === "instagram" ? `https://instagram.com/${platform_url}` : null,
        tiktok_url: platform_type === "tiktok" ? `https://tiktok.com/@${platform_url}` : null,
        onboarding_step: 2,
        updated_at: new Date().toISOString(),
      }).eq("id", existing.brand_id);

      return NextResponse.json(
        { success: true, brand_id: existing.brand_id, user_id: user.id, created: false },
        { headers: cors }
      );
    }

    // Create new brand
    const { data: brand, error: brandError } = await admin
      .from("brands")
      .insert({
        brand_name,
        category: industry || null,
        description: description || null,
        country: country || null,
        whatsapp: whatsapp || null,
        web_url: platform_type === "web" ? platform_url || null : null,
        instagram_url: platform_type === "instagram" ? `https://instagram.com/${platform_url}` : null,
        tiktok_url: platform_type === "tiktok" ? `https://tiktok.com/@${platform_url}` : null,
        onboarding_step: 2,
        subscription_tier: "starter",
      })
      .select("id")
      .single();

    if (brandError || !brand) {
      throw new Error(brandError?.message || "Failed to create brand");
    }

    // Link user to brand as owner
    await admin.from("user_brands").insert({
      user_id: user.id,
      brand_id: brand.id,
      role: "owner",
    });

    return NextResponse.json(
      { success: true, brand_id: brand.id, user_id: user.id, created: true },
      { status: 201, headers: cors }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500, headers: cors });
  }
}
