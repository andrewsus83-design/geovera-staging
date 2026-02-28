"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import ThreeColumnLayout from "@/components/shared/ThreeColumnLayout";
import NavColumn from "@/components/shared/NavColumn";
import BrandEditPanel from "@/components/home/BrandEditPanel";
import DesignAssetsEditPanel from "@/components/home/DesignAssetsEditPanel";
import type { Agent } from "@/components/ai-agent/AgentList";
import AgentDetailCard from "@/components/ai-agent/AgentDetailCard";
import SubscriptionTierCard, { PLANS } from "@/components/home/SubscriptionTierCard";
import type { PlanId } from "@/components/home/SubscriptionTierCard";
import PlanDetailPanel from "@/components/home/PlanDetailPanel";
import PlatformIcon from "@/components/shared/PlatformIcon";
import { supabase } from "@/lib/supabase";

const SUPABASE_FN_URL = "https://vozjwptzutolvkvfpknk.supabase.co/functions/v1";
// Fallback brand_id used only if user lookup fails (demo / local dev)
const FALLBACK_BRAND_ID = process.env.NEXT_PUBLIC_DEMO_BRAND_ID || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";

// Late platform id map (our id → Late's platform name)
const LATE_PLATFORM: Record<string, string> = {
  tiktok:    "tiktok",
  instagram: "instagram",
  facebook:  "facebook",
  youtube:   "youtube",
  linkedin:  "linkedin",
  x:         "twitter",
  threads:   "threads",
  reddit:    "reddit",
  gbp:       "google_business",
};

// ── localStorage persistence helpers ────────────────────────────
const LS_CONNECTIONS = "gv_connections";    // JSON array of connected platform ids
const SS_PENDING     = "gv_pending_connect"; // platform id waiting for OAuth callback

const loadLS = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(LS_CONNECTIONS) || "[]")); } catch { return new Set(); }
};
const saveLS = (ps: Platform[]) => {
  try { localStorage.setItem(LS_CONNECTIONS, JSON.stringify(ps.filter(p => p.connected).map(p => p.id))); } catch {}
};

// ── Connect / Platform types ─────────────────────────────────────
interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  handle?: string;
  plan: "basic" | "premium" | "enterprise";
}
const CONNECT_PLAN = "enterprise";
const planOrder: Record<string, number> = { basic: 0, premium: 1, enterprise: 2 };
const planLabel: Record<string, string> = { basic: "Basic", premium: "Premium", enterprise: "Partner" };
const initialPlatforms: Platform[] = [
  { id: "tiktok",    name: "TikTok",                  icon: "🎵", connected: false, plan: "premium" },
  { id: "instagram", name: "Instagram",               icon: "📸", connected: true,  handle: "geovera.id", plan: "basic" },
  { id: "facebook",  name: "Facebook",                icon: "💬", connected: false, plan: "basic" },
  { id: "youtube",   name: "YouTube",                 icon: "▶️", connected: false, plan: "premium" },
  { id: "linkedin",  name: "LinkedIn",                icon: "💼", connected: false, plan: "premium" },
  { id: "x",         name: "X (Twitter)",             icon: "𝕏", connected: false, plan: "basic" },
  { id: "threads",   name: "Threads",                 icon: "🧵", connected: false, plan: "premium" },
  { id: "reddit",    name: "Reddit",                  icon: "🟠", connected: false, plan: "basic" },
  { id: "gbp",       name: "Google Business Profile", icon: "📍", connected: false, plan: "enterprise" },
];

// CURRENT_PLAN is now dynamic state in HomePage

const agents: Agent[] = [
  {
    id: "ceo",
    name: "CEO Agent",
    title: "Strategic Planning & Oversight",
    icon: "🧑‍💼",
    active: true,
    locked: false,
    description:
      "Your AI CEO handles high-level strategic decisions, budget allocation, partnership evaluations, and KPI setting. It analyzes market trends and provides daily actionable insights to grow your brand.",
    dailyTasks: [
      "Review and optimize marketing budget allocation",
      "Evaluate partnership and collaboration proposals",
      "Set and track monthly KPIs and growth targets",
      "Analyze competitor landscape and market trends",
      "Generate strategic recommendations for brand growth",
    ],
    skills: ["Strategy", "Analytics", "Budget", "Partnerships", "KPIs", "Market Analysis"],
    recentActivity: [
      { title: "Reviewed Q1 Marketing Budget", time: "2h ago" },
      { title: "Set March KPIs for Team", time: "5h ago" },
      { title: "Analyzed Competitor Strategy Report", time: "1d ago" },
      { title: "Approved BrandX Partnership", time: "2d ago" },
      { title: "Generated Weekly Growth Insights", time: "3d ago" },
    ],
  },
  {
    id: "cmo",
    name: "CMO Agent",
    title: "Marketing & Content Strategy",
    icon: "📣",
    active: true,
    locked: false,
    description:
      "Your AI CMO creates and manages content across all platforms. It generates post ideas, writes captions, selects hashtags, schedules content, and responds to trending topics — all aligned with your brand voice.",
    dailyTasks: [
      "Create and schedule social media content",
      "Write blog posts and long-form articles",
      "Monitor and respond to trending topics",
      "Optimize content for SEO and engagement",
      "Manage cross-platform content calendar",
    ],
    skills: ["Content", "Social Media", "Copywriting", "SEO", "Trends", "Branding"],
    recentActivity: [
      { title: "Created Instagram Carousel: Summer Collection", time: "1h ago" },
      { title: "Scheduled 3 TikTok Videos", time: "3h ago" },
      { title: "Published Blog: Eco-Friendly Materials", time: "1d ago" },
      { title: "Responded to Trending TikTok Sound", time: "1d ago" },
      { title: "Optimized 5 Product Page Descriptions", time: "2d ago" },
    ],
  },
  {
    id: "cto",
    name: "CTO Agent",
    title: "Technical Strategy",
    icon: "💻",
    active: false,
    locked: true,
    description:
      "Your AI CTO handles technical strategy including website optimization, analytics setup, automation workflows, and integration management. Available on Partner plan.",
    dailyTasks: [
      "Monitor website performance and uptime",
      "Optimize page speed and Core Web Vitals",
      "Set up and manage marketing automation",
      "Configure analytics tracking and reporting",
      "Manage API integrations and data pipelines",
    ],
    skills: ["Web Dev", "Analytics", "Automation", "APIs", "Performance", "Security"],
    recentActivity: [],
  },
  {
    id: "support",
    name: "Customer Support",
    title: "Auto-Reply & Engagement",
    icon: "🎧",
    active: false,
    locked: true,
    description:
      "Your AI Customer Support agent handles comment replies, DM responses, and customer inquiries across all connected platforms using Late API. Available on Partner plan.",
    dailyTasks: [
      "Reply to top-priority comments (by score)",
      "Respond to customer DMs and inquiries",
      "Escalate complex issues to human team",
      "Track customer sentiment trends",
      "Generate weekly support summary report",
    ],
    skills: ["Support", "Auto-Reply", "Sentiment", "Triage", "Engagement", "Reporting"],
    recentActivity: [],
  },
];

// ── Billing toggle (monthly / yearly) ───────────────────────────
function BillingToggle({ yearly, onChange }: { yearly: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-[12px] bg-[#F9FAFB] border border-[#F3F4F6] px-4 py-3">
      <div>
        <p className="text-[12px] font-semibold text-[#1F2428]">Billing cycle</p>
        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
          {yearly ? "Yearly — pay 11 months, get 1 free" : "Monthly billing"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[11px] font-medium ${!yearly ? "text-[#1F2428]" : "text-[#9CA3AF]"}`}>Monthly</span>
        <button
          onClick={() => onChange(!yearly)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${yearly ? "bg-[#5F8F8B]" : "bg-[#D1D5DB]"}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${yearly ? "translate-x-4.5" : "translate-x-0.5"}`} />
        </button>
        <span className={`text-[11px] font-medium ${yearly ? "text-[#4E7C78]" : "text-[#9CA3AF]"}`}>
          Yearly
          {yearly && <span className="ml-1 rounded-full bg-[#EDF5F4] px-1.5 py-0.5 text-[9px] font-semibold text-[#3D6562]">1 mo free</span>}
        </span>
      </div>
    </div>
  );
}

// ── Subscription Panel (right column) ───────────────────────────
function SubscriptionPanel({
  selectedPlanId, onSelectPlan, currentPlan, billingYearly, onBillingChange,
}: {
  selectedPlanId: PlanId;
  onSelectPlan: (id: PlanId) => void;
  currentPlan: PlanId;
  billingYearly: boolean;
  onBillingChange: (v: boolean) => void;
}) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-[#F3F4F6] px-5 py-4">
        <h3 className="text-[16px] font-bold text-[#1F2428]" style={{ fontFamily: "Georgia, serif" }}>
          Subscription Plans
        </h3>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">Click a plan to see details</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3">
        <BillingToggle yearly={billingYearly} onChange={onBillingChange} />
        {PLANS.map((plan) => (
          <SubscriptionTierCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlan}
            isSelected={selectedPlanId === plan.id}
            onClick={() => onSelectPlan(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Plan label / price maps for billing display
const PLAN_LABEL: Record<string, string> = { BASIC: "Basic", PREMIUM: "Premium", PARTNER: "Partner" };
const PLAN_PRICE_IDR: Record<string, Record<string, string>> = {
  BASIC:   { monthly: "Rp 5.990.000", yearly: "Rp 65.835.000" },
  PREMIUM: { monthly: "Rp 10.485.000", yearly: "Rp 115.335.000" },
  PARTNER: { monthly: "Rp 16.485.000", yearly: "Rp 181.335.000" },
};

interface InvoiceRow { id: string; external_id: string; created_at: string; amount: number; currency: string; status: string; }
interface SubData {
  plan: string; billing_cycle: string; status: string;
  current_period_end: string; amount_paid: number; currency: string; payment_method: string;
}

// ── Billing Panel (right column) — live Xendit data ──────────────
function BillingPanel({ brandId }: { brandId: string }) {
  const [sub, setSub] = useState<SubData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!brandId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [subRes, invRes] = await Promise.all([
          fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get_subscription", brand_id: brandId }),
          }),
          supabase.from("gv_invoices").select("id, external_id, created_at, amount, currency, status").eq("brand_id", brandId).order("created_at", { ascending: false }).limit(10),
        ]);
        const subData = await subRes.json();
        if (subData.success && subData.subscription) setSub(subData.subscription as SubData);
        if (invRes.data) setInvoices(invRes.data as InvoiceRow[]);
      } catch { /* keep empty */ }
      setLoading(false);
    };
    load();
  }, [brandId]);

  const planKey = sub?.plan?.toUpperCase() ?? "";
  const planLabel = PLAN_LABEL[planKey] ?? planKey;
  const cycle = sub?.billing_cycle ?? "monthly";
  const idrPrice = PLAN_PRICE_IDR[planKey]?.[cycle] ?? "—";
  const nextBilling = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtAmt = (amt: number, cur: string) =>
    `${cur} ${amt.toLocaleString()}`;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-[#F3F4F6] px-5 py-4">
        <h3 className="text-[16px] font-bold text-[#1F2428]" style={{ fontFamily: "Georgia, serif" }}>
          Billing
        </h3>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">
          {sub ? `Next billing: ${nextBilling}` : loading ? "Loading…" : "No active subscription"}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Current billing summary */}
            <div className="rounded-[12px] border border-[#E5E7EB] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#F3F4F6]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Current Subscription</p>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-[#F3F4F6]">
                  {[
                    {
                      label: "Plan",
                      value: sub ? (
                        <span className="inline-flex items-center rounded-full bg-[#EDF5F4] px-2 py-0.5 text-[10px] font-semibold text-[#3D6562]">
                          {planLabel}
                        </span>
                      ) : "—",
                    },
                    { label: "Price", value: sub ? idrPrice + (cycle === "yearly" ? " / yr" : " / bln") : "—" },
                    { label: "Billing Cycle", value: sub ? (cycle === "yearly" ? "Yearly" : "Monthly") : "—" },
                    { label: "Next Billing", value: nextBilling },
                    {
                      label: "Status",
                      value: sub ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          sub.status === "active"
                            ? "bg-[#ECFDF3] text-[#047857]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      ) : <span className="text-[#9CA3AF]">No subscription</span>,
                    },
                  ].map(({ label, value }) => (
                    <tr key={label}>
                      <td className="px-4 py-2.5 text-[12px] text-[#9CA3AF] w-1/3">{label}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#1F2428] font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Method (Xendit) */}
            {sub && (
              <div className="rounded-[12px] border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#F3F4F6]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Payment Method</p>
                </div>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {[
                      { label: "Gateway", value: "Xendit" },
                      { label: "Method", value: sub.payment_method || "—" },
                      { label: "Currency", value: "IDR (Indonesian Rupiah)" },
                    ].map(({ label, value }) => (
                      <tr key={label}>
                        <td className="px-4 py-2.5 text-[12px] text-[#9CA3AF] w-1/3">{label}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#1F2428] font-medium">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Invoice History */}
            <div className="rounded-[12px] border border-[#E5E7EB] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#F3F4F6]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Invoice History</p>
              </div>
              {invoices.length === 0 ? (
                <p className="px-4 py-5 text-[12px] text-[#9CA3AF] text-center">No invoices yet</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#F3F4F6]">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="px-4 py-2.5 text-[12px] text-[#6B7280]">{fmtDate(inv.created_at)}</td>
                        <td className="px-4 py-2.5 text-right text-[12px] text-[#1F2428] font-medium">{fmtAmt(inv.amount, inv.currency)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            inv.status === "PAID" || inv.status === "SETTLED"
                              ? "bg-[#ECFDF3] text-[#047857]"
                              : inv.status === "PENDING"
                              ? "bg-[#FFFBEB] text-[#B45309]"
                              : "bg-[#F3F4F6] text-[#6B7280]"
                          }`}>
                            {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// (platformFeatures removed — no longer used in ConnectAllPanel)

// ── Connect All Platforms Panel (right column) ──────────────────
function ConnectAllPanel({
  platforms, replyEnabled, isAccessible, onToggleConnect, onToggleReply,
}: {
  platforms: Platform[];
  replyEnabled: Record<string, boolean>;
  isAccessible: (p: Platform) => boolean;
  onToggleConnect: (id: string) => void;
  onToggleReply: (id: string) => void;
}) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[#F3F4F6] px-5 py-4">
        <h3 className="text-[16px] font-bold text-[#1F2428]" style={{ fontFamily: "Georgia, serif" }}>
          Connected Platforms
        </h3>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">
          {platforms.filter((p) => p.connected).length} of {platforms.length} connected
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-5 py-2.5 border-b border-[#F3F4F6] bg-[#F9FAFB]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Platform</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] w-16 text-center">Connect</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] w-16 text-center">Auto-Reply</span>
      </div>

      {/* Platform rows — scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="divide-y divide-[#F3F4F6]">
          {platforms.map((platform) => {
            const accessible = isAccessible(platform);
            const isConnected = platform.connected;
            const replyOn = replyEnabled[platform.id] ?? false;
            return (
              <div
                key={platform.id}
                className={`grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-5 py-3 ${!accessible ? "opacity-50" : ""}`}
              >
                {/* Platform info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex-shrink-0 ${!accessible ? "opacity-40" : ""}`}>
                    <PlatformIcon id={platform.id} size={22} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[13px] font-medium text-[#1F2428] truncate">{platform.name}</p>
                      {!accessible && (
                        <span className="rounded-full bg-[#FFF7ED] px-1.5 py-0.5 text-[9px] font-semibold text-[#C2410C] flex-shrink-0">
                          {planLabel[platform.plan]}+
                        </span>
                      )}
                    </div>
                    {platform.handle && accessible && isConnected && (
                      <p className="text-[11px] text-[#9CA3AF] truncate">@{platform.handle}</p>
                    )}
                    {!isConnected && accessible && (
                      <p className="text-[11px] text-[#9CA3AF]">Not connected</p>
                    )}
                  </div>
                </div>

                {/* Connect toggle */}
                <div className="w-16 flex justify-center">
                  {accessible ? (
                    <button
                      onClick={() => onToggleConnect(platform.id)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isConnected ? "bg-[#5F8F8B]" : "bg-[#D1D5DB]"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isConnected ? "translate-x-5.5" : "translate-x-0.5"}`} />
                    </button>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#D1D5DB]">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  )}
                </div>

                {/* Auto-Reply toggle */}
                <div className="w-16 flex justify-center">
                  {accessible ? (
                    <button
                      onClick={() => onToggleReply(platform.id)}
                      disabled={!isConnected}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${replyOn && isConnected ? "bg-[#10B981]" : "bg-[#D1D5DB]"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${replyOn && isConnected ? "translate-x-5.5" : "translate-x-0.5"}`} />
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#D1D5DB]">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Late note */}
        <div className="mx-4 mt-3 mb-4 rounded-[12px] border border-[#A8D5CF] bg-[#EDF5F4] p-3">
          <p className="text-[12px] font-semibold text-[#3D6562]">Late Auto-Reply Limits</p>
          <p className="text-[11px] text-[#5F8F8B] mt-1">Basic: 50/day · Premium: 100/day · Partner: 150/day</p>
        </div>
      </div>
    </div>
  );
}

// ── Security Panel (right column) ───────────────────────────────
function SecurityPanel() {
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const handleToggle2FA = () => {
    if (!twoFaEnabled) { setShowQr(true); setTwoFaEnabled(true); }
    else { setTwoFaEnabled(false); setShowQr(false); }
  };

  const handleChangePw = () => {
    setPwError("");
    if (!currentPw) { setPwError("Current password is required."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwSaved(true);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwSaved(false), 3000);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-[#F3F4F6] px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FEE2E2]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#DC2626]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#1F2428]" style={{ fontFamily: "Georgia, serif" }}>Security</h3>
        </div>
        <p className="text-[12px] text-[#9CA3AF]">Manage your account security settings</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 space-y-6">

        {/* ── Two-Factor Authentication ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[14px] font-semibold text-[#1F2428]">Two-Factor Authentication</p>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                twoFaEnabled ? "bg-[#5F8F8B]" : "bg-[#D1D5DB]"
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFaEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {twoFaEnabled && (
            <div className="rounded-[12px] border border-[#A8D5CF] bg-[#EDF5F4] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E7C78] flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-[12px] font-semibold text-[#3D6562]">2FA is enabled on your account</p>
              </div>

              {showQr && (
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-2">Scan with your authenticator app (Google Authenticator, Authy):</p>
                  <div className="w-28 h-28 rounded-[10px] bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      {[0,30,60].map(x => [0,30,60].map(y => (
                        <rect key={`${x}-${y}`} x={x+2} y={y+2} width="26" height="26" rx="3" fill="none" stroke="#374151" strokeWidth="2"/>
                      )))}
                      <rect x="8" y="8" width="14" height="14" rx="1" fill="#374151"/>
                      <rect x="38" y="8" width="14" height="14" rx="1" fill="#374151"/>
                      <rect x="8" y="38" width="14" height="14" rx="1" fill="#374151"/>
                      <rect x="38" y="38" width="6" height="6" rx="1" fill="#374151"/>
                      <rect x="50" y="38" width="6" height="6" rx="1" fill="#374151"/>
                      <rect x="62" y="38" width="6" height="6" rx="1" fill="#374151"/>
                      <rect x="68" y="8" width="14" height="14" rx="1" fill="#374151"/>
                      <rect x="68" y="68" width="14" height="14" rx="1" fill="#374151"/>
                      <rect x="8" y="68" width="14" height="14" rx="1" fill="#374151"/>
                      <rect x="32" y="62" width="6" height="6" rx="1" fill="#374151"/>
                      <rect x="44" y="62" width="6" height="6" rx="1" fill="#374151"/>
                      <rect x="56" y="56" width="6" height="6" rx="1" fill="#374151"/>
                    </svg>
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] text-center mt-1">Demo QR — connect real auth in production</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">Recovery Codes</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {["8F2K-9XPQ", "3M7R-2WNT", "6B4H-5CYL", "1J9V-8ZUE"].map((code) => (
                    <code key={code} className="rounded-[6px] bg-white border border-[#E5E7EB] px-2 py-1.5 text-[10px] font-mono text-[#1F2428] text-center">
                      {code}
                    </code>
                  ))}
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-1.5">Save these codes in a safe place. Each can only be used once.</p>
              </div>

              <button
                onClick={() => setTwoFaEnabled(false)}
                className="w-full rounded-[10px] border border-[#FCA5A5] py-2 text-[12px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
              >
                Disable 2FA
              </button>
            </div>
          )}

          {!twoFaEnabled && (
            <div className="rounded-[12px] border border-dashed border-[#E5E7EB] p-3 text-center">
              <p className="text-[12px] text-[#9CA3AF]">2FA is currently <span className="font-semibold text-[#4A545B]">disabled</span>. Enable it to protect your account.</p>
            </div>
          )}
        </div>

        <div className="h-px bg-[#F3F4F6]" />

        {/* ── Change Password ── */}
        <div>
          <p className="text-[14px] font-semibold text-[#1F2428] mb-1">Change Password</p>
          <p className="text-[12px] text-[#9CA3AF] mb-4">Use a strong password with letters, numbers, and symbols</p>

          <div className="space-y-3">
            {[
              { id: "current", label: "Current Password", value: currentPw, setter: setCurrentPw, placeholder: "••••••••" },
              { id: "new",     label: "New Password",     value: newPw,     setter: setNewPw,     placeholder: "Min. 8 characters" },
              { id: "confirm", label: "Confirm Password", value: confirmPw, setter: setConfirmPw, placeholder: "••••••••" },
            ].map(({ id, label, value, setter, placeholder }) => (
              <div key={id}>
                <label className="block text-[12px] font-semibold text-[#4A545B] mb-1.5">{label}</label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="gv-input"
                />
              </div>
            ))}

            {pwError && <p className="text-[12px] text-[#DC2626]">{pwError}</p>}
            {pwSaved  && <p className="text-[12px] text-[#4E7C78] font-medium">✓ Password updated successfully</p>}

            <button onClick={handleChangePw} className="gv-btn-primary w-full">
              Update Password
            </button>
          </div>
        </div>

        <div className="h-px bg-[#F3F4F6]" />

        {/* ── Active Sessions ── */}
        <div>
          <p className="text-[14px] font-semibold text-[#1F2428] mb-3">Active Sessions</p>
          <div className="space-y-2">
            {[
              { device: "MacBook Pro · Chrome", location: "Jakarta, ID", time: "Current session", current: true },
              { device: "iPhone 15 · Safari",   location: "Jakarta, ID", time: "2 hours ago",    current: false },
            ].map((s) => (
              <div key={s.device} className={`rounded-[12px] border p-3 flex items-center justify-between gap-3 ${
                s.current ? "border-[#A8D5CF] bg-[#EDF5F4]" : "border-[#E5E7EB] bg-white"
              }`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-medium text-[#1F2428] truncate">{s.device}</p>
                    {s.current && <span className="rounded-full bg-[#5F8F8B] px-1.5 py-0.5 text-[8px] font-bold text-white flex-shrink-0">Now</span>}
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{s.location} · {s.time}</p>
                </div>
                {!s.current && (
                  <button className="flex-shrink-0 text-[11px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

type Section = "profile" | "agents" | null;
type RightPanelMode = "brand" | "assets" | "agent" | "plan" | "connect" | "subscription" | "billing" | "security";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`text-[#9CA3AF] transition-transform duration-200 flex-shrink-0 ${open ? "rotate-90" : ""}`}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function HomePage() {
  const [openSection, setOpenSection] = useState<Section>("profile");
  const [rightMode, setRightMode] = useState<RightPanelMode>("brand");
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("ceo");
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("basic");
  // Brand / auth state (production multi-tenant)
  const [brandId, setBrandId] = useState<string>(FALLBACK_BRAND_ID);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [currentPlan, setCurrentPlan] = useState<PlanId>("basic");
  const [billingYearly, setBillingYearly] = useState(false);
  // Connect state
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [replyEnabled, setReplyEnabled] = useState<Record<string, boolean>>({ instagram: true });
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Mobile: open right panel when a section card is clicked
  const openRightMode = (mode: RightPanelMode) => {
    setRightMode(mode);
    setMobileRightOpen(true);
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)!;
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId)!;
  const connectedCount = platforms.filter((p) => p.connected).length;
  const isAccessible = (p: Platform) => planOrder[p.plan] <= planOrder[CONNECT_PLAN];
  const billingCycle: "monthly" | "yearly" = billingYearly ? "yearly" : "monthly";

  const toggleSection = (section: Section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // Load connection state on mount
  useEffect(() => {
    // 0) If running in a popup after OAuth redirect → close popup
    if (typeof window !== "undefined" && window.opener && window.location.search.includes("oauth_done=1")) {
      window.opener.postMessage({ type: "gv_oauth_done" }, window.location.origin);
      window.close();
      return;
    }

    // 0a) Resolve brand_id for the logged-in user + load subscription
    const resolveBrandId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        setUserEmail(user.email ?? "");
        setUserName(user.user_metadata?.full_name ?? user.email ?? "");
        const { data: ub } = await supabase
          .from("user_brands")
          .select("brand_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();
        if (ub?.brand_id) {
          setBrandId(ub.brand_id);
          // Load subscription data
          try {
            const res = await fetch("/api/payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "get_subscription", brand_id: ub.brand_id }),
            });
            const subData = await res.json();
            if (subData.success) {
              const tier = subData.brand_payment?.subscription_tier as string | undefined;
              // Map DB tier to PlanId (partner → enterprise)
              const planId: PlanId = tier === "partner" ? "enterprise" : (tier as PlanId) ?? "basic";
              setCurrentPlan(planId);
              setSelectedPlanId(planId);
            }
          } catch { /* keep defaults */ }
        }
      } catch {
        // keep fallback brand_id
      }
    };
    resolveBrandId();

    // 0b) Listen for popup postMessage from OAuth callback
    const handleOAuthMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "gv_oauth_done") {
        setTimeout(() => refreshStatus(), 1500);
      }
    };
    window.addEventListener("message", handleOAuthMessage);

    // 1) Check if we just returned from an OAuth flow (fallback redirect path)
    const pendingId = sessionStorage.getItem(SS_PENDING);
    if (pendingId) {
      sessionStorage.removeItem(SS_PENDING);
      setPlatforms((prev) => {
        const updated = prev.map((p) => (p.id === pendingId ? { ...p, connected: true } : p));
        saveLS(updated);
        setSaveToast(`✅ ${updated.find(p => p.id === pendingId)?.name || pendingId} connected!`);
        setTimeout(() => setSaveToast(null), 4000);
        return updated;
      });
    }

    // 2) Restore from localStorage instantly (before API responds)
    const saved = loadLS();
    if (saved.size > 0) {
      setPlatforms((prev) => prev.map((p) => ({ ...p, connected: saved.has(p.id) })));
    }

    // 3) Verify with Late API (async — updates if different)
    refreshStatus();

    return () => window.removeEventListener("message", handleOAuthMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reusable: fetch connection status from Supabase DB (no edge function cold start)
  const refreshStatus = async () => {
    try {
      const { data: conns, error } = await supabase
        .from("social_connections")
        .select("platform, platform_username")
        .eq("brand_id", brandId)
        .eq("status", "active");
      if (error || !conns) return;
      const connectedPlatforms = new Set(conns.map((c) => c.platform as string));
      setPlatforms((prev) => {
        const updated = prev.map((p) => ({
          ...p,
          connected: connectedPlatforms.has(p.id),
          handle: conns.find((c) => c.platform === p.id)?.platform_username || p.handle,
        }));
        saveLS(updated);
        return updated;
      });
    } catch {
      // silently fail — keep localStorage state
    }
  };

  const handleToggleConnect = async (id: string) => {
    const platform = platforms.find((p) => p.id === id);
    if (!platform) return;

    if (!platform.connected) {
      // ── Connect: open OAuth in popup so user stays on GeoVera ──
      try {
        const latePlatform = LATE_PLATFORM[id] || id;
        const res = await fetch(
          `${SUPABASE_FN_URL}/social-connect?platform=${latePlatform}&brand_id=${brandId}`
        );
        const data = await res.json() as { auth_url?: string; error?: string };
        if (data.auth_url) {
          const popup = window.open(
            data.auth_url,
            "oauth_connect",
            "width=600,height=700,left=200,top=100,noopener=0"
          );
          if (popup) {
            // Poll until popup closes, then refresh status
            const poll = setInterval(() => {
              if (popup.closed) {
                clearInterval(poll);
                setTimeout(async () => {
                  await refreshStatus();
                  setSaveToast(`✅ ${platform.name} — checking connection…`);
                  setTimeout(() => setSaveToast(null), 3000);
                }, 1500);
              }
            }, 600);
          } else {
            // Popup blocked — fallback to full-page redirect
            sessionStorage.setItem(SS_PENDING, id);
            window.location.href = data.auth_url;
          }
          return;
        } else {
          setSaveToast(`❌ Failed to connect ${platform.name}: ${data.error || "unknown error"}`);
          setTimeout(() => setSaveToast(null), 4000);
        }
      } catch {
        setSaveToast(`❌ Connection error for ${platform.name}`);
        setTimeout(() => setSaveToast(null), 4000);
      }
    } else {
      // ── Disconnect: optimistic UI + auto-persist ───────────────
      setPlatforms((prev) => {
        const updated = prev.map((p) => (p.id === id ? { ...p, connected: false } : p));
        saveLS(updated);
        return updated;
      });
    }
  };
  const handleToggleReply = (id: string) => {
    setReplyEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };


  const left = (
    <NavColumn>
      <h3
        className="text-base font-semibold text-gray-900 dark:text-white px-1"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Home
      </h3>
      <p className="text-xs text-gray-400 px-1 mt-1">
        Manage your brand, agents, and subscription.
      </p>
    </NavColumn>
  );

  const center = (
    <div className="space-y-3 p-4 pb-8">
      {saveToast && (
        <div className={`rounded-[12px] px-4 py-3 text-[13px] font-medium ${
          saveToast.startsWith("✅")
            ? "bg-[#EDF5F4] text-[#3D6562] border border-[#A8D5CF]"
            : "bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]"
        }`}>
          {saveToast}
        </div>
      )}

      {/* ── PROFILE ─────────────────────────────────────── */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}>
        <button
          onClick={() => { toggleSection("profile"); if (openSection !== "profile") openRightMode("brand"); else openRightMode("brand"); }}
          className="w-full flex items-center justify-between p-4 hover:bg-[#F9FAFB] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#D4EAE7] flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E7C78]">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[14px] font-semibold text-[#1F2428]">Profile</p>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">GeoVera · Jakarta, ID</p>
            </div>
          </div>
          <ChevronIcon open={openSection === "profile"} />
        </button>

        {openSection === "profile" && (
          <div className="border-t border-[#F3F4F6] p-4 space-y-4">
            {/* Brand Overview */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: "Industry", value: "Marketing Intelligence" },
                { label: "Location", value: "Jakarta, ID" },
                { label: "Website",  value: "geovera.xyz" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">{label}</span>
                  <p className="text-[13px] text-[#1F2428] font-medium mt-1">{value}</p>
                </div>
              ))}
              <div>
                <span className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">Plan</span>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-[#EDF5F4] px-2.5 py-0.5 text-[11px] font-semibold text-[#3D6562]">
                    {currentPlan === "enterprise" ? "Partner" : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* DNA / Brand Storytelling */}
            <div className="rounded-[12px] bg-[#F9FAFB] border border-[#F3F4F6] p-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Brand DNA</p>
              <p className="text-[13px] text-[#4A545B] leading-relaxed">
                GeoVera is a marketing intelligence platform built for modern brands navigating the complexity of multi-channel digital growth. Rooted in Jakarta&apos;s vibrant startup ecosystem, GeoVera blends AI-driven automation with human-centric brand storytelling — empowering founders and CMOs to scale their presence without scaling their team.
              </p>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">
                At its core, GeoVera believes that every brand has a unique story worth telling — and that the right intelligence layer can amplify that story across every platform, every audience, and every moment that matters.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── ASSETS ──────────────────────────────────────── */}
      <button
        onClick={() => openRightMode("assets")}
        className={`w-full rounded-[16px] border overflow-hidden flex items-center justify-between p-4 transition-all ${
          rightMode === "assets"
            ? "border-[#C4B5FD] bg-[#F5F3FF]"
            : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
        }`}
        style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EDE9FE] flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#7C3AED]">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-[#1F2428]">Assets</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">Colors · Logos · LoRA models</p>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9CA3AF] flex-shrink-0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* ── SUBSCRIPTION ────────────────────────────────── */}
      <button
        onClick={() => openRightMode("subscription")}
        className={`w-full rounded-[16px] border overflow-hidden flex items-center justify-between p-4 transition-all ${
          rightMode === "subscription"
            ? "border-[#FCD34D] bg-[#FFFBEB]"
            : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
        }`}
        style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FEF3C7] flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#D97706]">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-[#1F2428]">Subscription</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">
              <span className="font-semibold text-[#D97706]">
                {currentPlan === "enterprise" ? "Partner" : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </span>
              {" · "}
              {currentPlan === "basic" ? "$299" : currentPlan === "premium" ? "$499" : "$999"}/mo
            </p>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9CA3AF] flex-shrink-0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* ── BILLING ─────────────────────────────────────── */}
      <button
        onClick={() => openRightMode("billing")}
        className={`w-full rounded-[16px] border overflow-hidden flex items-center justify-between p-4 transition-all ${
          rightMode === "billing"
            ? "border-[#93C5FD] bg-[#EFF6FF]"
            : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
        }`}
        style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#DBEAFE] flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2563EB]">
              <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-[#1F2428]">Billing</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">Payment · Xendit · IDR</p>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9CA3AF] flex-shrink-0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* ── SECURITY ────────────────────────────────────── */}
      <button
        onClick={() => openRightMode("security")}
        className={`w-full rounded-[16px] border overflow-hidden flex items-center justify-between p-4 transition-all ${
          rightMode === "security"
            ? "border-[#FCA5A5] bg-[#FEF2F2]"
            : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
        }`}
        style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FEE2E2] flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#DC2626]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-[#1F2428]">Security</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">2FA · Password · Sessions</p>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9CA3AF] flex-shrink-0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* ── CONNECT ─────────────────────────────────────── */}
      <button
        onClick={() => openRightMode("connect")}
        className={`w-full rounded-[16px] border overflow-hidden flex items-center justify-between p-4 transition-all ${
          rightMode === "connect"
            ? "border-[#A8D5CF] bg-[#EDF5F4]"
            : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
        }`}
        style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#D4EAE7] flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E7C78]">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-[#1F2428]">Connect</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">
              <span className="font-semibold text-[#5F8F8B]">{connectedCount}</span> connected · {platforms.length} platforms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {platforms.filter(p => p.connected).slice(0, 4).map((p) => (
              <PlatformIcon key={p.id} id={p.id} size={18} />
            ))}
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9CA3AF] flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </button>

      {/* ── AI AGENTS ───────────────────────────────────── */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}>
        <button
          onClick={() => toggleSection("agents")}
          className="w-full flex items-center justify-between p-4 hover:bg-[#F9FAFB] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FFE4E6] flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#E11D48]">
                <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7H3a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2z" /><path d="M3 14v7h18v-7" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[14px] font-semibold text-[#1F2428]">AI Agents</p>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">CEO · CMO · 2 active</p>
            </div>
          </div>
          <ChevronIcon open={openSection === "agents"} />
        </button>

        {openSection === "agents" && (
          <div className="border-t border-[#F3F4F6] p-3 space-y-2">
            {agents.map((agent) => {
              const isSelected = rightMode === "agent" && selectedAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => { setSelectedAgentId(agent.id); openRightMode("agent"); }}
                  className={`w-full text-left rounded-[12px] border p-3 transition-all ${
                    isSelected
                      ? "border-[#A8D5CF] bg-[#EDF5F4]"
                      : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-[#1F2428]">{agent.name}</p>
                        {agent.active && !agent.locked && (
                          <span className="rounded-full bg-[#EDF5F4] px-2 py-0.5 text-[10px] font-semibold text-[#3D6562]">Active</span>
                        )}
                        {agent.locked && (
                          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">Locked</span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#6B7280] mt-0.5">{agent.title}</p>
                    </div>
                    {agent.locked ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#D1D5DB] flex-shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9CA3AF] flex-shrink-0">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const right = (
    <>
      {rightMode === "brand" && <BrandEditPanel />}
      {rightMode === "assets" && <DesignAssetsEditPanel />}
      {rightMode === "agent" && <AgentDetailCard agent={selectedAgent} />}
      {rightMode === "plan" && (
        <PlanDetailPanel
          plan={selectedPlan}
          currentPlan={currentPlan}
          brandId={brandId}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          billingCycle={billingCycle}
        />
      )}
      {rightMode === "subscription" && (
        <SubscriptionPanel
          selectedPlanId={selectedPlanId}
          onSelectPlan={(id) => { setSelectedPlanId(id); openRightMode("plan"); }}
          currentPlan={currentPlan}
          billingYearly={billingYearly}
          onBillingChange={setBillingYearly}
        />
      )}
      {rightMode === "billing" && <BillingPanel brandId={brandId} />}
      {rightMode === "security" && <SecurityPanel />}
      {rightMode === "connect" && (
        <ConnectAllPanel
          platforms={platforms}
          replyEnabled={replyEnabled}
          isAccessible={isAccessible}
          onToggleConnect={handleToggleConnect}
          onToggleReply={handleToggleReply}
        />
      )}
    </>
  );

  return (
    <ThreeColumnLayout
      left={left}
      center={center}
      right={right}
      mobileRightOpen={mobileRightOpen}
      onMobileBack={() => setMobileRightOpen(false)}
      mobileBackLabel="Home"
    />
  );
}
