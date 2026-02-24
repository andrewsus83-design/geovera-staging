"use client";
import { useState } from "react";
import ThreeColumnLayout from "@/components/shared/ThreeColumnLayout";
import NavColumn from "@/components/shared/NavColumn";
import BrandEditPanel from "@/components/home/BrandEditPanel";
import DesignAssetsEditPanel from "@/components/home/DesignAssetsEditPanel";
import type { Agent } from "@/components/ai-agent/AgentList";
import AgentDetailCard from "@/components/ai-agent/AgentDetailCard";
import SubscriptionTierCard, { PLANS } from "@/components/home/SubscriptionTierCard";
import type { PlanId } from "@/components/home/SubscriptionTierCard";
import PlanDetailPanel from "@/components/home/PlanDetailPanel";
import { supabase } from "@/lib/supabase";

const DEMO_BRAND_ID = process.env.NEXT_PUBLIC_DEMO_BRAND_ID || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";

// ── Connect / Platform types ─────────────────────────────────────
interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  handle?: string;
  plan: "basic" | "premium" | "enterprise";
}
const CONNECT_PLAN = "premium";
const planOrder: Record<string, number> = { basic: 0, premium: 1, enterprise: 2 };
const planLabel: Record<string, string> = { basic: "Basic", premium: "Premium", enterprise: "Enterprise" };
const initialPlatforms: Platform[] = [
  { id: "instagram", name: "Instagram", icon: "📸", connected: true, handle: "geovera.id", plan: "basic" },
  { id: "reels", name: "Reels", icon: "🎬", connected: false, plan: "premium" },
  { id: "tiktok", name: "TikTok", icon: "🎵", connected: false, plan: "premium" },
  { id: "x", name: "X (Twitter)", icon: "𝕏", connected: false, plan: "basic" },
  { id: "blog", name: "Blog", icon: "✍️", connected: false, plan: "basic" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", connected: false, plan: "premium" },
  { id: "youtube-shorts", name: "YouTube Shorts", icon: "▶️", connected: false, plan: "premium" },
  { id: "youtube-video", name: "YouTube Video", icon: "🎥", connected: false, plan: "enterprise" },
];

const CURRENT_PLAN: PlanId = "premium";

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
      "Your AI CTO handles technical strategy including website optimization, analytics setup, automation workflows, and integration management. Available on Enterprise plan.",
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
      "Your AI Customer Support agent handles comment replies, DM responses, and customer inquiries across all connected platforms using FeedGuardian technology. Available on Enterprise plan.",
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

// ── Connect Detail Panel (right column) ─────────────────────────
const platformFeatures: Record<string, string[]> = {
  instagram: ["Auto-publish Posts", "Auto-reply Comments", "Schedule Content", "Comment Score Analysis"],
  reels: ["Auto-publish Reels", "Auto-reply Comments", "Schedule Content", "Engagement Analytics"],
  tiktok: ["Auto-publish Videos", "Auto-reply Comments", "Schedule Content", "Comment Analysis"],
  x: ["Auto-publish Tweets", "Auto-reply Mentions", "Schedule Content", "Engagement Tracking"],
  blog: ["Auto-publish Articles", "Short Article Posts", "SEO Optimization", "Internal Linking"],
  linkedin: ["Auto-publish Posts", "Auto-reply Comments", "Schedule Content", "Network Analytics"],
  "youtube-shorts": ["Auto-publish Shorts", "Auto-reply Comments", "Schedule Content", "Performance Analytics"],
  "youtube-video": ["Auto-publish Videos", "Auto-reply Comments", "Schedule Content", "Advanced Analytics"],
};

function ConnectDetailPanel({
  platform, isAccessible, isConnected, replyOn, onToggleConnect, onToggleReply,
  hasUnsaved, saving, onSave,
}: {
  platform: Platform; isAccessible: boolean; isConnected: boolean; replyOn: boolean;
  onToggleConnect: () => void; onToggleReply: () => void;
  hasUnsaved: boolean; saving: boolean; onSave: () => void;
}) {
  const features = platformFeatures[platform.id] || [];
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-3xl ${!isAccessible ? "grayscale opacity-50" : ""}`}>{platform.icon}</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
              {platform.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isConnected ? `Connected${platform.handle ? ` · @${platform.handle}` : ""}` :
               isAccessible ? "Not connected" : `Requires ${planLabel[platform.plan]} plan`}
            </p>
          </div>
        </div>
        {/* Connect + Reply toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Connect</p>
              <p className="text-[11px] text-gray-400">Enable publishing & syncing</p>
            </div>
            {isAccessible ? (
              <button
                onClick={onToggleConnect}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isConnected ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isConnected ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            ) : (
              <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                {planLabel[platform.plan]}+
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${!isConnected || !isAccessible ? "text-gray-400" : "text-gray-900 dark:text-white"}`}>Auto-Reply</p>
              <p className="text-[11px] text-gray-400">FeedGuardian comment responses</p>
            </div>
            {isAccessible ? (
              <button
                onClick={onToggleReply}
                disabled={!isConnected}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${replyOn && isConnected ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${replyOn && isConnected ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            ) : (
              <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
            )}
          </div>
        </div>
      </div>
      {/* Features */}
      <div className="p-5 space-y-2 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Available Features</p>
        {features.map((f) => (
          <div key={f} className="flex items-center gap-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isAccessible ? "text-brand-500" : "text-gray-300"}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className={`text-xs font-medium ${isAccessible ? "text-gray-700 dark:text-gray-300" : "text-gray-400"}`}>{f}</span>
          </div>
        ))}
        {/* FeedGuardian note */}
        <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5 p-3">
          <p className="text-[11px] font-medium text-brand-700 dark:text-brand-300">FeedGuardian Limits</p>
          <p className="text-[10px] text-brand-500 dark:text-brand-400 mt-1">Basic: 50/day · Premium: 100/day · Enterprise: 150/day</p>
        </div>

      </div>{/* end features */}
      </div>{/* end scrollable content */}

      {/* Save button — sticky at bottom, always visible */}
      <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 p-4">
        <button
          onClick={onSave}
          disabled={saving || !hasUnsaved}
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            hasUnsaved
              ? "bg-brand-500 text-white hover:bg-brand-600 shadow-sm"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
          } disabled:opacity-60`}
        >
          {saving ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {hasUnsaved ? "Save Changes" : "No changes"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

type Section = "profile" | "assets" | "subscription" | "billing" | "agents" | "connect" | null;
type RightPanelMode = "brand" | "assets" | "agent" | "plan" | "connect";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-90" : ""}`}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function HomePage() {
  const [openSection, setOpenSection] = useState<Section>("profile");
  const [rightMode, setRightMode] = useState<RightPanelMode>("brand");
  const [selectedAgentId, setSelectedAgentId] = useState("ceo");
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(CURRENT_PLAN);
  // Connect state
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [replyEnabled, setReplyEnabled] = useState<Record<string, boolean>>({ instagram: true });
  const [selectedPlatformId, setSelectedPlatformId] = useState("instagram");
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)!;
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId)!;
  const connectedCount = platforms.filter((p) => p.connected).length;
  const isAccessible = (p: Platform) => planOrder[p.plan] <= planOrder[CONNECT_PLAN];

  const toggleSection = (section: Section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleToggleConnect = (id: string) => {
    setPlatforms((prev) => prev.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p)));
    setHasUnsaved(true);
  };
  const handleToggleReply = (id: string) => {
    setReplyEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
    setHasUnsaved(true);
  };

  const handleSaveConnections = async () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const connected = platforms.filter((p) => p.connected);
      const disconnected = platforms.filter((p) => !p.connected);
      for (const p of connected) {
        await supabase.from("social_connections").upsert(
          {
            brand_id:            DEMO_BRAND_ID,
            platform:            p.id,
            platform_account_id: p.handle ? p.handle : `demo_${p.id}_user`,
            platform_username:   p.handle || `geovera_${p.id}`,
            status:              "active",
            connected_at:        now,
            updated_at:          now,
          },
          { onConflict: "brand_id,platform" }
        );
      }
      for (const p of disconnected) {
        await supabase
          .from("social_connections")
          .update({ status: "disconnected", updated_at: now })
          .eq("brand_id", DEMO_BRAND_ID)
          .eq("platform", p.id);
      }
      setHasUnsaved(false);
      const names = connected.map((p) => p.name).join(", ") || "connections";
      setSaveToast(`✅ Saved: ${names}`);
      setTimeout(() => setSaveToast(null), 4000);
    } catch {
      setSaveToast("❌ Failed to save. Try again.");
      setTimeout(() => setSaveToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const left = (
    <NavColumn>
      <h3
        className="text-sm font-semibold text-gray-900 dark:text-white px-1"
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
    <div className="space-y-2 p-2">
      {saveToast && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          saveToast.startsWith("✅")
            ? "bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30"
            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30"
        }`}>
          {saveToast}
        </div>
      )}

      {/* ── PROFILE ─────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <button
          onClick={() => { toggleSection("profile"); if (openSection !== "profile") setRightMode("brand"); }}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/10 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-600 dark:text-brand-400">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Profile</p>
              <p className="text-[11px] text-gray-400 mt-0.5">GeoVera · Jakarta, ID</p>
            </div>
          </div>
          <ChevronIcon open={openSection === "profile"} />
        </button>

        {openSection === "profile" && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-4">
            {/* Brand Overview */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div>
                  <span className="text-gray-400">Industry</span>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">Marketing Intelligence</p>
                </div>
                <div>
                  <span className="text-gray-400">Location</span>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">Jakarta, ID</p>
                </div>
                <div>
                  <span className="text-gray-400">Website</span>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">geovera.xyz</p>
                </div>
                <div>
                  <span className="text-gray-400">Plan</span>
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 mt-0.5">
                    Premium
                  </span>
                </div>
              </div>
            </div>

            {/* DNA / Brand Storytelling */}
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Brand DNA</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                GeoVera is a marketing intelligence platform built for modern brands navigating the complexity of multi-channel digital growth. Rooted in Jakarta&apos;s vibrant startup ecosystem, GeoVera blends AI-driven automation with human-centric brand storytelling — empowering founders and CMOs to scale their presence without scaling their team.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                At its core, GeoVera believes that every brand has a unique story worth telling — and that the right intelligence layer can amplify that story across every platform, every audience, and every moment that matters.
              </p>
            </div>

            {/* Edit button */}
            <button
              onClick={() => setRightMode("brand")}
              className={`w-full rounded-lg border py-2 text-xs font-medium transition-colors ${
                rightMode === "brand"
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              Edit Brand Profile
            </button>
          </div>
        )}
      </div>

      {/* ── ASSETS ──────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <button
          onClick={() => { toggleSection("assets"); if (openSection !== "assets") setRightMode("assets"); }}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/10 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 dark:text-purple-400">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Assets</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Colors · Logos · LoRA models</p>
            </div>
          </div>
          <ChevronIcon open={openSection === "assets"} />
        </button>

        {openSection === "assets" && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-4">

            {/* Logos */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Logos</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { name: "logo-primary.svg", size: "12 KB" },
                  { name: "logo-white.png", size: "48 KB" },
                  { name: "favicon.ico", size: "4 KB" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div>
                      <p className="text-[11px] text-gray-700 dark:text-gray-300">{f.name}</p>
                      <p className="text-[9px] text-gray-400">{f.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Color Palette</p>
              <div className="flex gap-2">
                {[
                  { color: "#16A34A", label: "Primary" },
                  { color: "#0F172A", label: "Dark" },
                  { color: "#F1F5F9", label: "Light" },
                  { color: "#DCFCE7", label: "Accent" },
                  { color: "#DC2626", label: "Alert" },
                ].map((c) => (
                  <div key={c.color} className="flex flex-col items-center gap-1">
                    <div className="h-8 w-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" style={{ backgroundColor: c.color }} />
                    <span className="text-[9px] text-gray-400">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trained Assets (LoRA) */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Trained Assets</p>
              <div className="space-y-1.5">
                {[
                  { name: "Summer Collection", status: "Ready", date: "Feb 18" },
                  { name: "Eco Line Products", status: "Ready", date: "Jan 30" },
                ].map((model) => (
                  <div key={model.name} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
                    <div>
                      <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{model.name}</p>
                      <p className="text-[9px] text-gray-400">Trained {model.date}</p>
                    </div>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                      {model.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">Models used</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">2 / 10</span>
              </div>
              <div className="mt-1 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-1 rounded-full bg-brand-500" style={{ width: "20%" }} />
              </div>
            </div>

            {/* Upload for Training */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Upload for Training</p>
              <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-3 text-center">
                <svg className="mx-auto mb-1.5 h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5" />
                </svg>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Drop product photos here</p>
                <p className="text-[9px] text-gray-400 mt-0.5">5–15 images per product · JPG, PNG</p>
              </div>
            </div>

            <button
              onClick={() => setRightMode("assets")}
              className={`w-full rounded-lg border py-2 text-xs font-medium transition-colors ${
                rightMode === "assets"
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              Manage Assets
            </button>
          </div>
        )}
      </div>

      {/* ── SUBSCRIPTION ────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <button
          onClick={() => toggleSection("subscription")}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/10 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Subscription</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Premium plan · Active</p>
            </div>
          </div>
          <ChevronIcon open={openSection === "subscription"} />
        </button>

        {openSection === "subscription" && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-2">
            {PLANS.map((plan) => (
              <SubscriptionTierCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === CURRENT_PLAN}
                isSelected={rightMode === "plan" && selectedPlanId === plan.id}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setRightMode("plan");
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── BILLING ─────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <button
          onClick={() => toggleSection("billing")}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400">
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Billing</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Next billing Mar 23, 2026</p>
            </div>
          </div>
          <ChevronIcon open={openSection === "billing"} />
        </button>

        {openSection === "billing" && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-3">
            {/* Current billing info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Premium · $79/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Next billing</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Mar 23, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment method</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Visa ···· 4242</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                  Active
                </span>
              </div>
            </div>

            {/* Invoice history placeholder */}
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Recent Invoices</p>
              {[
                { date: "Feb 23, 2026", amount: "$79.00", status: "Paid" },
                { date: "Jan 23, 2026", amount: "$79.00", status: "Paid" },
                { date: "Dec 23, 2025", amount: "$79.00", status: "Paid" },
              ].map((inv) => (
                <div key={inv.date} className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <span className="text-xs text-gray-500">{inv.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 dark:text-gray-300">{inv.amount}</span>
                    <span className="text-[10px] text-green-600 dark:text-green-400">{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 transition-colors">
              Update Payment Method
            </button>
          </div>
        )}
      </div>

      {/* ── CONNECT ─────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <button
          onClick={() => toggleSection("connect")}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Connect</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{connectedCount} connected · {platforms.length} platforms</p>
            </div>
          </div>
          <ChevronIcon open={openSection === "connect"} />
        </button>

        {openSection === "connect" && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            {/* Platform rows — click to open right panel with toggles */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {platforms.map((platform) => {
                const accessible = isAccessible(platform);
                const isConnected = platform.connected;
                const isSelected = selectedPlatformId === platform.id && rightMode === "connect";
                return (
                  <button
                    key={platform.id}
                    onClick={() => { setSelectedPlatformId(platform.id); setRightMode("connect"); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                      isSelected ? "bg-brand-50/40 dark:bg-brand-500/5" :
                      accessible ? "hover:bg-gray-50 dark:hover:bg-gray-800/40" : "opacity-50"
                    }`}
                  >
                    <span className={`text-base flex-shrink-0 ${!accessible ? "grayscale" : ""}`}>{platform.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-medium ${accessible ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{platform.name}</p>
                        {!accessible && (
                          <span className="rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">{planLabel[platform.plan]}+</span>
                        )}
                        {isConnected && accessible && (
                          <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">Connected</span>
                        )}
                      </div>
                      {platform.handle && accessible && (
                        <p className="text-[10px] text-gray-400">@{platform.handle}</p>
                      )}
                    </div>
                    {/* Small status indicator */}
                    <div className="flex-shrink-0">
                      {isConnected && accessible ? (
                        <div className="h-2 w-2 rounded-full bg-brand-500" />
                      ) : accessible ? (
                        <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── AI AGENTS ───────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <button
          onClick={() => toggleSection("agents")}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/10 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600 dark:text-rose-400">
                <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7H3a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2z" /><path d="M3 14v7h18v-7" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">AI Agents</p>
              <p className="text-[11px] text-gray-400 mt-0.5">CEO · CMO · 2 active</p>
            </div>
          </div>
          <ChevronIcon open={openSection === "agents"} />
        </button>

        {openSection === "agents" && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-2">
            {agents.map((agent) => {
              const isSelected = rightMode === "agent" && selectedAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => { setSelectedAgentId(agent.id); setRightMode("agent"); }}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/50 shadow-sm dark:border-brand-400 dark:bg-brand-500/5"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        {agent.active && !agent.locked && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">Active</span>
                        )}
                        {agent.locked && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">Locked</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{agent.title}</p>
                    </div>
                    {agent.locked ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0">
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

  const selectedPlatform = platforms.find((p) => p.id === selectedPlatformId)!;

  const right = (
    <>
      {rightMode === "brand" && <BrandEditPanel />}
      {rightMode === "assets" && <DesignAssetsEditPanel />}
      {rightMode === "agent" && <AgentDetailCard agent={selectedAgent} />}
      {rightMode === "plan" && (
        <PlanDetailPanel plan={selectedPlan} currentPlan={CURRENT_PLAN} />
      )}
      {rightMode === "connect" && (
        <ConnectDetailPanel
          platform={selectedPlatform}
          isAccessible={isAccessible(selectedPlatform)}
          isConnected={selectedPlatform.connected}
          replyOn={replyEnabled[selectedPlatformId] ?? false}
          onToggleConnect={() => handleToggleConnect(selectedPlatformId)}
          onToggleReply={() => handleToggleReply(selectedPlatformId)}
          hasUnsaved={hasUnsaved}
          saving={saving}
          onSave={handleSaveConnections}
        />
      )}
    </>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
