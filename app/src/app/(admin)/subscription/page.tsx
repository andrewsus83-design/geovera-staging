"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavColumn from "@/components/shared/NavColumn";
import { supabase } from "@/lib/supabase";

const BRAND_ID = process.env.NEXT_PUBLIC_brandId || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";

interface Plan {
  id: string;
  tier: string;
  monthly_price_usd: string;
  yearly_price_usd: string;
  yearly_months_free: number;
  features: {
    name: string;
    support: string;
    daily_insights: number | string;
    content_generation: string;
    white_label?: boolean;
  };
}

interface Subscription {
  tier: string;
  status: string;
  current_period_end: string;
}

const TIER_COLORS: Record<string, string> = {
  basic: "var(--gv-color-neutral-100)",
  premium: "var(--gv-color-primary-50, #EDF5F4)",
  partner: "#1a2e2b",
};
const TIER_TEXT: Record<string, string> = {
  basic: "var(--gv-color-neutral-800)",
  premium: "var(--gv-color-primary-800, #1a3d38)",
  partner: "#ffffff",
};
const TIER_BADGE: Record<string, string> = {
  basic: "Basic",
  premium: "⭐ Most Popular",
  partner: "🏆 Partner",
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: pricingData } = await supabase
          .from("gv_subscription_pricing")
          .select("*")
          .eq("active", true)
          .order("monthly_price_usd", { ascending: true });

        if (pricingData) setPlans(pricingData);

        // Get current subscription
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_subscription", brand_id: BRAND_ID }),
        });
        const data = await res.json();
        if (data.success && data.subscription) {
          setCurrentSub(data.subscription);
        }
      } catch {
        // ok
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleCheckout(plan: Plan) {
    setCheckoutLoading(plan.tier);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const priceUsd = billing === "monthly"
        ? parseFloat(plan.monthly_price_usd)
        : parseFloat(plan.yearly_price_usd);

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_invoice",
          brand_id: BRAND_ID,
          user_id: user?.id,
          tier: plan.tier,
          billing_cycle: billing,
          amount: Math.round(priceUsd * 15000), // USD → IDR approx
          currency: "IDR",
          email: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success && data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        setError(data.error || "Gagal membuat invoice. Coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }
    setCheckoutLoading(null);
  }

  async function handleFreeTier() {
    setCheckoutLoading("free");
    setError(null);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate_free_tier", brand_id: BRAND_ID }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/getting-started");
      } else {
        setError(data.error || "Gagal aktivasi free tier.");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }
    setCheckoutLoading(null);
  }

  const fmtPrice = (usd: string) => {
    const n = parseFloat(usd);
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--gv-color-bg-base)" }}>
      {/* Nav */}
      <div className="hidden lg:block flex-shrink-0 w-[88px]">
        <NavColumn />
      </div>
      <div className="hidden lg:block flex-shrink-0 w-4" />

      {/* Center */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-y-auto lg:rounded-[32px] my-0 lg:my-4 custom-scrollbar"
        style={{
          background: "var(--gv-color-bg-surface)",
          border: "1px solid var(--gv-color-neutral-200)",
          boxShadow: "var(--gv-shadow-card)",
        }}
      >
        <div className="p-6 lg:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-bold mb-2" style={{ color: "var(--gv-color-neutral-900)", fontFamily: "Georgia, serif" }}>
              Pilih Plan GeoVera
            </h1>
            <p className="text-[15px]" style={{ color: "var(--gv-color-neutral-500)" }}>
              Semua plan termasuk AI CMO, content generation, dan competitive intelligence.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 mt-4 p-1 rounded-[12px]"
              style={{ background: "var(--gv-color-neutral-100)" }}>
              {(["monthly", "yearly"] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all"
                  style={{
                    background: billing === b ? "white" : "transparent",
                    color: billing === b ? "var(--gv-color-neutral-900)" : "var(--gv-color-neutral-500)",
                    boxShadow: billing === b ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {b === "monthly" ? "Bulanan" : "Tahunan"}
                  {b === "yearly" && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: "var(--gv-color-primary-100, #C8E6E4)", color: "var(--gv-color-primary-700, #1d4f4a)" }}>
                      Hemat 1 bulan
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current subscription banner */}
          {currentSub && (
            <div className="mb-6 p-4 rounded-[16px] flex items-center gap-3"
              style={{ background: "var(--gv-color-primary-50, #EDF5F4)", border: "1px solid var(--gv-color-primary-200, #A8D5D2)" }}>
              <span className="text-[20px]">✅</span>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: "var(--gv-color-primary-800, #1a3d38)" }}>
                  Plan aktif: {currentSub.tier.charAt(0).toUpperCase() + currentSub.tier.slice(1)}
                </p>
                <p className="text-[12px]" style={{ color: "var(--gv-color-neutral-500)" }}>
                  Status: {currentSub.status}
                  {currentSub.current_period_end && ` · Berlaku hingga ${new Date(currentSub.current_period_end).toLocaleDateString("id-ID")}`}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-[12px] text-[13px]"
              style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          {/* Plans grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "var(--gv-color-primary-400)" }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {plans.map(plan => {
                const isCurrentPlan = currentSub?.tier === plan.tier;
                const price = billing === "monthly" ? plan.monthly_price_usd : plan.yearly_price_usd;
                const isLoading = checkoutLoading === plan.tier;

                return (
                  <div
                    key={plan.id}
                    className="rounded-[20px] p-6 flex flex-col"
                    style={{
                      background: TIER_COLORS[plan.tier] ?? "var(--gv-color-neutral-50)",
                      border: isCurrentPlan
                        ? "2px solid var(--gv-color-primary-500)"
                        : "1px solid var(--gv-color-neutral-200)",
                    }}
                  >
                    {/* Badge */}
                    <div className="text-[11px] font-bold uppercase tracking-wider mb-3"
                      style={{ color: plan.tier === "partner" ? "#9dddd9" : "var(--gv-color-primary-500)" }}>
                      {TIER_BADGE[plan.tier]}
                    </div>

                    {/* Name & price */}
                    <h2 className="text-[22px] font-bold mb-1" style={{ color: TIER_TEXT[plan.tier] }}>
                      {plan.features.name}
                    </h2>
                    <div className="flex items-end gap-1 mb-4">
                      <span className="text-[32px] font-bold" style={{ color: TIER_TEXT[plan.tier] }}>
                        {fmtPrice(price)}
                      </span>
                      <span className="text-[13px] mb-2" style={{ color: plan.tier === "partner" ? "#aaa" : "var(--gv-color-neutral-400)" }}>
                        /{billing === "monthly" ? "bulan" : "tahun"}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="flex flex-col gap-2 mb-6 flex-1">
                      {[
                        `${plan.features.daily_insights === "unlimited" ? "Unlimited" : plan.features.daily_insights + "x"} daily insights`,
                        `Content generation: ${plan.features.content_generation}`,
                        `Support: ${plan.features.support}`,
                        ...(plan.features.white_label ? ["White label"] : []),
                        `${billing === "monthly" ? "1" : plan.yearly_months_free} bulan ${billing === "monthly" ? "" : "gratis "}termasuk`,
                      ].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-[13px]"
                          style={{ color: plan.tier === "partner" ? "#ccc" : "var(--gv-color-neutral-600)" }}>
                          <span style={{ color: plan.tier === "partner" ? "#9dddd9" : "var(--gv-color-primary-500)" }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handleCheckout(plan)}
                      disabled={isCurrentPlan || isLoading}
                      className="w-full py-3 rounded-[12px] text-[14px] font-bold transition-all"
                      style={{
                        background: isCurrentPlan
                          ? "var(--gv-color-neutral-200)"
                          : plan.tier === "partner"
                            ? "white"
                            : "var(--gv-color-primary-600)",
                        color: isCurrentPlan
                          ? "var(--gv-color-neutral-400)"
                          : plan.tier === "partner"
                            ? "#1a2e2b"
                            : "white",
                        opacity: isLoading ? 0.7 : 1,
                      }}
                    >
                      {isLoading ? "Memproses..." : isCurrentPlan ? "Plan Aktif" : `Pilih ${plan.features.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Free tier */}
          {!currentSub && (
            <div className="mt-6 text-center">
              <button
                onClick={handleFreeTier}
                disabled={checkoutLoading === "free"}
                className="text-[13px] transition-colors"
                style={{ color: "var(--gv-color-neutral-400)" }}
              >
                {checkoutLoading === "free" ? "Mengaktifkan..." : "Lanjut dengan Free Trial →"}
              </button>
            </div>
          )}

          {/* Footer notes */}
          <div className="mt-8 p-4 rounded-[14px] text-center"
            style={{ background: "var(--gv-color-neutral-50)", border: "1px solid var(--gv-color-neutral-100)" }}>
            <p className="text-[12px]" style={{ color: "var(--gv-color-neutral-400)" }}>
              Harga dalam USD · Pembayaran via Xendit (kartu kredit, transfer bank, e-wallet) ·
              Batalkan kapan saja · Tidak ada biaya tersembunyi
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-shrink-0 w-4" />
    </div>
  );
}
