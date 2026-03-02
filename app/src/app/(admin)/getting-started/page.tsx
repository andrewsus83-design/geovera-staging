"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThreeColumnLayout from "@/components/shared/ThreeColumnLayout";
import NavColumn from "@/components/shared/NavColumn";
import { supabase } from "@/lib/supabase";

/* ══════════════════════════════════════════════════════════════════════════
   /getting-started  — GeoVera Workflow Step 7 + 8
   10 things to do to use GeoVera to the maximum
   DS v5.8 compliant
══════════════════════════════════════════════════════════════════════════ */

const FALLBACK_BRAND_ID = process.env.NEXT_PUBLIC_DEMO_BRAND_ID || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";
const LS_KEY = "gv_getting_started_done";

/* ── FAQ types ─────────────────────────────────────────────────────────── */
interface FAQPair { q: string; a: string; }
type FAQType = "general" | "product" | "geo";

/* ── Checklist item definition ─────────────────────────────────────────── */
interface CheckItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  category: "profile" | "platform" | "connect" | "faq" | "research" | "ideation" | "training";
}

const ITEMS: CheckItem[] = [
  { id: "brand_profile",   icon: "🏷️", title: "Complete Brand Profile",          subtitle: "Add logo, tagline & brand DNA",                  category: "profile"   },
  { id: "instagram",       icon: "📸", title: "Create Instagram Account",         subtitle: "Step-by-step business account setup",            category: "platform"  },
  { id: "tiktok",          icon: "🎵", title: "Create TikTok Account",            subtitle: "Set up your TikTok Business profile",            category: "platform"  },
  { id: "youtube",         icon: "▶️", title: "Create YouTube Channel",           subtitle: "Launch your brand channel on YouTube",           category: "platform"  },
  { id: "linkedin",        icon: "💼", title: "Create LinkedIn Company Page",     subtitle: "Build professional presence on LinkedIn",        category: "platform"  },
  { id: "x_twitter",      icon: "𝕏",  title: "Create X (Twitter) Account",       subtitle: "Establish your brand voice on X",                category: "platform"  },
  { id: "connect_all",    icon: "🔗", title: "Connect All Platforms to GeoVera", subtitle: "Link your accounts for AI-powered management",    category: "connect"   },
  { id: "faq_general",    icon: "❓", title: "Create General FAQ",               subtitle: "Brand, company & contact basics",                 category: "faq"       },
  { id: "faq_product",    icon: "📦", title: "Create Product/Service FAQ",       subtitle: "What you offer, pricing & how to buy",            category: "faq"       },
  { id: "faq_geo",        icon: "🤖", title: "Create AI/GEO-Optimized FAQ",      subtitle: "Structured for Perplexity, Gemini & ChatGPT",    category: "faq"       },
  { id: "build_training", icon: "🦙", title: "Build & Train Brand AI",            subtitle: "Cloudflare Llama + KIE Flux 2 Pro LoRA training", category: "training"  },
  { id: "tasks_ideation", icon: "🧠", title: "Tasks Ideation",                   subtitle: "Research results + trends + priority filter",     category: "ideation"  },
  { id: "tasks_audit",    icon: "📋", title: "Tasks Audit",                      subtitle: "Score completed tasks + impact analysis (Claude)",  category: "ideation"  },
  { id: "llm_learning",  icon: "🔄", title: "LLM Learning Process",               subtitle: "Llama + Perplexity + Claude — daily trends & QA cycle", category: "training"  },
];

/* ── Platform guide data ────────────────────────────────────────────────── */
const PLATFORM_GUIDES: Record<string, {
  platform: string; color: string; why: string; steps: string[]; tips: string[];
}> = {
  instagram: {
    platform: "Instagram",
    color: "#E1306C",
    why: "Instagram is the #1 discovery platform for lifestyle, fashion, food & local brands. Having an active Instagram business profile signals authority to Google and AI search engines.",
    steps: [
      "Go to instagram.com or download the Instagram app",
      "Tap 'Sign up' → enter your brand email & password",
      "Enter your brand name (use your exact brand name for SEO consistency)",
      "Go to Settings → Account → Switch to Professional Account",
      "Select 'Business' (not Creator) and choose your category",
      "Add your bio (150 chars): include brand keyword + location + website",
      "Upload your brand logo as profile picture (minimum 320×320px)",
      "Add your website URL in the bio link",
      "Create your first 3 posts (product, behind-the-scenes, story)",
      "Return to GeoVera and connect your account below",
    ],
    tips: [
      "Use your exact brand name — no underscores or random numbers",
      "Fill in every profile field: category, contact info, address if applicable",
      "Enable professional dashboard to track insights from day 1",
    ],
  },
  tiktok: {
    platform: "TikTok",
    color: "#010101",
    why: "TikTok's algorithm gives new accounts massive organic reach in the first 48 hours. Business accounts get access to analytics and the TikTok Creator Marketplace.",
    steps: [
      "Download TikTok or go to tiktok.com",
      "Tap 'Sign Up' → use your brand email",
      "Set username to your brand name (or closest available)",
      "Go to Profile → Edit → Switch to Business Account",
      "Select your business category",
      "Add your brand bio (80 chars): focus on what you do + your niche",
      "Upload your brand logo as profile photo",
      "Add your website link in bio",
      "Post your first video (even a simple brand intro works great)",
      "Return to GeoVera and connect your TikTok account",
    ],
    tips: [
      "TikTok favors new accounts — post 3 videos in your first week",
      "Use 3-5 niche hashtags per video, not generic ones",
      "Business accounts can add links and access analytics from day 1",
    ],
  },
  youtube: {
    platform: "YouTube",
    color: "#FF0000",
    why: "YouTube is the world's #2 search engine. Videos indexed on YouTube also appear in Google search, giving your brand dual visibility. It's essential for GEO (Generative Engine Optimization).",
    steps: [
      "Go to youtube.com and sign in with your Google account",
      "Click your profile picture → 'Create a channel'",
      "Choose 'Use a custom name' → enter your brand name",
      "Upload your logo as channel icon (800×800px recommended)",
      "Upload a channel banner (2560×1440px, safe zone: 1546×423px)",
      "Fill in 'About' section: brand description with keywords",
      "Add your website and social media links",
      "Set your channel country and category",
      "Create a channel trailer (30-60 second brand introduction)",
      "Upload your first 3 videos with SEO-optimized titles & descriptions",
    ],
    tips: [
      "Include target keywords in your channel name description",
      "Consistently upload — YouTube rewards active channels",
      "Enable all notifications so subscribers stay engaged",
    ],
  },
  linkedin: {
    platform: "LinkedIn",
    color: "#0A66C2",
    why: "LinkedIn Company Pages rank highly on Google and are indexed by all AI search engines as authoritative sources. Essential for B2B brands and professional credibility.",
    steps: [
      "Go to linkedin.com → sign in with your personal account",
      "Click 'Work' icon (top right) → 'Create a Company Page'",
      "Choose 'Company' as page type",
      "Enter your brand name exactly as it appears elsewhere",
      "Add your website URL and company size",
      "Choose your industry from the dropdown",
      "Upload your brand logo (300×300px minimum)",
      "Write a compelling 'About' section (250-2000 chars) with keywords",
      "Add your location and founding year",
      "Publish your first 3 posts (company news, insights, behind the scenes)",
    ],
    tips: [
      "Verify your page with your company website for higher trust",
      "Post at least 3× per week for algorithm favor",
      "Invite your team members to follow the page immediately",
    ],
  },
  x_twitter: {
    platform: "X (Twitter)",
    color: "#000000",
    why: "X content is indexed by AI search engines including Perplexity in real-time. Brand accounts on X signal authority and appear in news-related AI search results.",
    steps: [
      "Go to x.com → click 'Sign up'",
      "Use your brand email address",
      "Set your display name to your brand name",
      "Set your @handle to your brand name (or closest available)",
      "Upload your brand logo as profile photo",
      "Add a banner image (1500×500px) — use your brand color palette",
      "Write your bio (160 chars): brand description + location + link",
      "Add your website URL to your profile",
      "Follow 20-30 relevant accounts in your industry",
      "Post your first 5 tweets introducing your brand",
    ],
    tips: [
      "Post threads — they get 3× more engagement than single tweets",
      "Reply to trending topics in your niche for free exposure",
      "Use X Premium (blue check) for higher algorithmic reach",
    ],
  },
};

/* ── FAQ defaults ────────────────────────────────────────────────────────── */
const FAQ_DEFAULTS: Record<FAQType, { title: string; desc: string; color: string; examples: string[] }> = {
  general: {
    title: "General FAQ",
    desc: "Answer the most common questions people ask about your brand — who you are, where you're located, how to contact you, and your story.",
    color: "#3B82F6",
    examples: [
      "What is [Brand Name]?",
      "Where is [Brand Name] located?",
      "When was [Brand Name] founded?",
      "How can I contact [Brand Name]?",
      "Is [Brand Name] available in my city?",
    ],
  },
  product: {
    title: "Product/Service FAQ",
    desc: "Cover everything a potential customer needs to know before buying — what you offer, pricing, how to purchase, delivery, and guarantees.",
    color: "#8B5CF6",
    examples: [
      "What products/services does [Brand Name] offer?",
      "How much does [Product] cost?",
      "How do I order/book with [Brand Name]?",
      "What is your return/refund policy?",
      "Do you offer bulk or corporate pricing?",
    ],
  },
  geo: {
    title: "AI/GEO-Optimized FAQ",
    desc: "Structured specifically for AI search engines (Perplexity, Gemini, ChatGPT). Use complete sentences with your brand name as subject — AI systems quote verbatim answers.",
    color: "#10B981",
    examples: [
      "What does [Brand Name] specialize in?",
      "Why should I choose [Brand Name] over competitors?",
      "What makes [Brand Name] unique in the market?",
      "What are the most popular products/services at [Brand Name]?",
      "How does [Brand Name] ensure quality?",
    ],
  },
};

/* ── Components ─────────────────────────────────────────────────────────── */
function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct    = (done / total) * 100;
  const r      = 36;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="url(#pg)" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3D6B68" />
            <stop offset="100%" stopColor="#5F8F8B" />
          </linearGradient>
        </defs>
        <text x="48" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{done}</text>
        <text x="48" y="60" textAnchor="middle" fontSize="11" fill="#9CA3AF">of {total}</text>
      </svg>
      <p className="text-[13px] font-bold text-[#374151]">{Math.round(pct)}% Complete</p>
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  const bg = color + "18";
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

/* ── Platform guide panel ───────────────────────────────────────────────── */
function PlatformGuide({ itemId, onConnectClick }: { itemId: string; onConnectClick: () => void }) {
  const guide = PLATFORM_GUIDES[itemId];
  if (!guide) return null;
  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* Why this platform */}
      <div className="rounded-[16px] p-5" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#16A34A] mb-2">Why {guide.platform}?</p>
        <p className="text-[14px] text-[#374151] leading-relaxed">{guide.why}</p>
      </div>

      {/* Step-by-step */}
      <div>
        <p className="text-[14px] font-bold text-[#111827] mb-4">Step-by-step setup guide</p>
        <div className="flex flex-col gap-3">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: guide.color + "18", color: guide.color }}
              >
                {i + 1}
              </div>
              <p className="text-[13px] text-[#374151] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pro tips */}
      <div className="rounded-[16px] p-5" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#D97706] mb-3">Pro Tips</p>
        {guide.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[#D97706] text-[12px] mt-0.5">⚡</span>
            <p className="text-[13px] text-[#374151]">{tip}</p>
          </div>
        ))}
      </div>

      {/* Connect CTA */}
      <button
        onClick={onConnectClick}
        className="w-full py-3 rounded-[14px] text-[14px] font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${guide.color}, ${guide.color}CC)` }}
      >
        I have a {guide.platform} account — Connect it to GeoVera →
      </button>
    </div>
  );
}

const MIN_PLATFORMS_BASIC = 3;

/* ── Connect guide panel ─────────────────────────────────────────────────── */
function ConnectGuide({ connectedCount = 0 }: { connectedCount?: number }) {
  const router = useRouter();
  const platformsMet = connectedCount >= MIN_PLATFORMS_BASIC;
  return (
    <div className="flex flex-col gap-5">
      {/* Deep Research Requirement */}
      <div
        className="rounded-[16px] p-4"
        style={{
          background: platformsMet ? "#F0FDF4" : "#FFFBEB",
          border: `1.5px solid ${platformsMet ? "#BBF7D0" : "#FDE68A"}`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-bold uppercase tracking-widest"
            style={{ color: platformsMet ? "#16A34A" : "#D97706" }}>
            {platformsMet ? "✓ Deep Research Ready" : "⚡ Syarat Deep Research"}
          </p>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5"
            style={{
              background: platformsMet ? "#DCFCE7" : "#FEF3C7",
              color: platformsMet ? "#16A34A" : "#D97706",
            }}>
            {connectedCount} / {MIN_PLATFORMS_BASIC}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/60 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((connectedCount / MIN_PLATFORMS_BASIC) * 100, 100)}%`,
              background: platformsMet
                ? "linear-gradient(90deg, #16A34A, #22C55E)"
                : "linear-gradient(90deg, #F59E0B, #FCD34D)",
            }}
          />
        </div>
        <p className="text-[12px]" style={{ color: platformsMet ? "#15803D" : "#92400E" }}>
          {platformsMet
            ? "Semua platform sudah terhubung. Deep Research GeoVera siap berjalan penuh."
            : `Plan Basic memerlukan minimal ${MIN_PLATFORMS_BASIC} platform. Hubungkan ${MIN_PLATFORMS_BASIC - connectedCount} lagi agar Deep Research berjalan maksimal.`}
        </p>
      </div>

      <div className="rounded-[16px] p-5" style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
        <p className="text-[13px] font-bold text-[#0369A1] mb-1">Why connect your platforms?</p>
        <p className="text-[14px] text-[#374151] leading-relaxed">
          Connecting your platforms lets GeoVera's AI agents publish, monitor, and reply on your behalf — turning your social presence into a 24/7 automated marketing machine. Semakin banyak platform terhubung, semakin akurat Deep Research GeoVera.
        </p>
      </div>

      {[
        { platform: "Instagram", icon: "📸", steps: ["Go to Connect page", "Click 'Connect Instagram'", "Log in with your Instagram Business account", "Approve the permissions requested", "Your account is now linked!"] },
        { platform: "TikTok", icon: "🎵", steps: ["Go to Connect page", "Click 'Connect TikTok'", "Log in with your TikTok Business account", "Approve TikTok permissions", "GeoVera can now publish to TikTok!"] },
        { platform: "Google Business Profile", icon: "📍", steps: ["Go to Connect page", "Click 'Connect Google Business'", "Sign in with the Google account that owns your GBP", "Select your business location", "GeoVera will monitor your GBP reviews & citations"] },
      ].map((item) => (
        <div key={item.platform} className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
          <p className="text-[14px] font-bold text-[#111827] mb-3">{item.icon} {item.platform}</p>
          {item.steps.map((s, i) => (
            <div key={i} className="flex gap-2 mt-2">
              <span className="text-[12px] font-bold text-[#3D6B68] w-4 flex-shrink-0">{i + 1}.</span>
              <p className="text-[13px] text-[#374151]">{s}</p>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={() => router.push("/connect")}
        className="w-full py-3 rounded-[14px] text-[14px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #3D6B68, #5F8F8B)" }}
      >
        Go to Connect Page →
      </button>
    </div>
  );
}

/* ── FAQ Builder ─────────────────────────────────────────────────────────── */
function FAQBuilder({
  type, pairs, onChange,
}: {
  type: FAQType; pairs: FAQPair[]; onChange: (p: FAQPair[]) => void;
}) {
  const meta = FAQ_DEFAULTS[type];

  const addPair = () => onChange([...pairs, { q: "", a: "" }]);
  const removePair = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const updatePair = (i: number, field: "q" | "a", val: string) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const addExample = (example: string) => {
    if (!pairs.find(p => p.q === example)) {
      onChange([...pairs, { q: example, a: "" }]);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-[16px] p-5" style={{ background: meta.color + "0F", border: `1px solid ${meta.color}30` }}>
        <div className="flex items-center gap-2 mb-2">
          <Chip label={meta.title} color={meta.color} />
        </div>
        <p className="text-[14px] text-[#374151] leading-relaxed">{meta.desc}</p>
      </div>

      {/* Example questions */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Suggested Questions — click to add</p>
        <div className="flex flex-wrap gap-2">
          {meta.examples.map((ex) => (
            <button
              key={ex}
              onClick={() => addExample(ex)}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-all"
              style={{
                background: pairs.find(p => p.q === ex) ? meta.color + "20" : "#F3F4F6",
                color: pairs.find(p => p.q === ex) ? meta.color : "#374151",
                border: `1px solid ${pairs.find(p => p.q === ex) ? meta.color + "40" : "transparent"}`,
              }}
            >
              {pairs.find(p => p.q === ex) ? "✓ " : "+ "}{ex}
            </button>
          ))}
        </div>
      </div>

      {/* Q&A pairs */}
      <div className="flex flex-col gap-4">
        {pairs.map((pair, i) => (
          <div key={i} className="rounded-[16px] p-4" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-[12px] font-bold" style={{ color: meta.color }}>Q{i + 1}</span>
              <button onClick={() => removePair(i)} className="text-[#9CA3AF] hover:text-[#EF4444] text-[12px] transition-colors">✕</button>
            </div>
            <input
              value={pair.q}
              onChange={e => updatePair(i, "q", e.target.value)}
              placeholder="Question…"
              className="w-full rounded-[10px] px-3 py-2.5 text-[13px] font-semibold mb-2"
              style={{ background: "white", border: "1.5px solid #E5E7EB", outline: "none", color: "#111827" }}
            />
            <textarea
              value={pair.a}
              onChange={e => updatePair(i, "a", e.target.value)}
              placeholder="Answer… (write in complete sentences for best AI indexing)"
              rows={3}
              className="w-full rounded-[10px] px-3 py-2.5 text-[13px] resize-none"
              style={{ background: "white", border: "1.5px solid #E5E7EB", outline: "none", color: "#374151", lineHeight: 1.5 }}
            />
          </div>
        ))}
      </div>

      {/* Add Q&A button */}
      <button
        onClick={addPair}
        className="w-full py-2.5 rounded-[12px] text-[13px] font-semibold transition-all"
        style={{ background: meta.color + "10", color: meta.color, border: `1.5px dashed ${meta.color}40` }}
      >
        + Add Question & Answer
      </button>

      {type === "geo" && (
        <div className="rounded-[16px] p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <p className="text-[12px] font-bold text-[#D97706] mb-1">GEO Tip: Write for AI, not humans</p>
          <p className="text-[13px] text-[#374151] leading-relaxed">
            Always start your answers with your brand name as the subject. Example: "GeoVera is an AI-powered marketing platform that…" — AI search engines quote this verbatim in their answers.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Brand profile guide ─────────────────────────────────────────────────── */
function BrandProfileGuide() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[16px] p-5" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
        <p className="text-[13px] font-bold text-[#16A34A] mb-1">Why Brand DNA matters</p>
        <p className="text-[14px] text-[#374151] leading-relaxed">
          Your Brand DNA feeds GeoVera's AI agents — the more complete it is, the better your CEO and CMO agents perform. It also helps AI search engines understand and cite your brand correctly.
        </p>
      </div>
      {[
        { title: "Brand Identity", items: ["Brand name (exact, consistent spelling)", "Tagline / slogan", "Industry & niche", "Target audience description"] },
        { title: "Brand Story", items: ["Founding year and story", "Mission statement", "Core values (3-5 values)", "What makes you different"] },
        { title: "Visual Identity", items: ["Logo (transparent PNG, 500×500px min)", "Primary brand colors (hex codes)", "Secondary colors", "Brand font preferences"] },
        { title: "Contact & Location", items: ["Official website URL", "Business address (if applicable)", "Primary contact email", "Operating hours"] },
      ].map((section) => (
        <div key={section.title} className="rounded-[16px] p-4" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
          <p className="text-[13px] font-bold text-[#111827] mb-3">{section.title}</p>
          {section.items.map((item) => (
            <div key={item} className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-[#3D6B68]">✓</span>
              <p className="text-[13px] text-[#374151]">{item}</p>
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={() => router.push("/")}
        className="w-full py-3 rounded-[14px] text-[14px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #3D6B68, #5F8F8B)" }}
      >
        Go to Brand Profile →
      </button>
    </div>
  );
}

/* ── Build & Train Brand AI guide panel ─────────────────────────────────── */
function BuildTrainingGuide() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-[16px] p-5" style={{ background: "linear-gradient(135deg, #F5F3FF, #FFF7ED)", border: "1px solid #C4B5FD" }}>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#7C3AED] mb-1">Build & Train Your Brand AI</p>
        <p className="text-[14px] text-[#374151] leading-relaxed">
          Feed your brand's voice, assets, and style into two AI systems — <strong>Cloudflare Llama</strong> for text intelligence and <strong>KIE Flux 2 Pro</strong> for visual consistency. Your brand AI gets smarter every cycle.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#F5742220", color: "#F57422" }}>🦙 CF Workers AI</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#7C3AED20", color: "#7C3AED" }}>⚡ KIE Flux 2 Pro</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#16A34A20", color: "#16A34A" }}>🔄 Auto-updates monthly</span>
        </div>
      </div>

      {/* Part 1: Cloudflare Llama — Brand Voice */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[20px]">🦙</span>
          <p className="text-[14px] font-bold text-[#111827]">1. Brand Voice Training — Cloudflare Llama</p>
        </div>
        <p className="text-[11px] font-bold text-[#9CA3AF] mb-3">Llama 3.3-70B · Edge-deployed · Private inference</p>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
          GeoVera uses your FAQ content, brand profile, and sample posts to fine-tune a <strong>Llama model on Cloudflare Workers AI</strong> — running at the edge for speed and privacy. This powers your CEO & CMO agents' writing voice.
        </p>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Training Data Sources</p>
        {[
          { icon: "❓", label: "General FAQ", desc: "Brand personality, tone, and contact information" },
          { icon: "📦", label: "Product/Service FAQ", desc: "Pricing, features, objection handling language" },
          { icon: "🤖", label: "GEO-Optimized FAQ", desc: "AI-structured sentences — the highest signal for LLM tone" },
          { icon: "🏷️", label: "Brand Profile", desc: "Mission, values, target audience, unique positioning" },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 mt-3 rounded-[10px] p-3" style={{ background: "white", border: "1px solid #F3F4F6" }}>
            <span className="text-[16px] flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-[12px] font-bold text-[#374151]">{item.label}</p>
              <p className="text-[11px] text-[#9CA3AF]">{item.desc}</p>
            </div>
          </div>
        ))}
        <div className="mt-3 rounded-[10px] px-3 py-2" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
          <p className="text-[12px] font-bold text-[#7C3AED]">Output: Your Brand AI Agent</p>
          <p className="text-[11px] text-[#6B7280] mt-1">CEO agent writes strategy memos in your brand voice. CMO agent generates captions that sound like you — not generic AI.</p>
        </div>
      </div>

      {/* Part 2: KIE Flux 2 Pro — Visual Training */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[20px]">⚡</span>
          <p className="text-[14px] font-bold text-[#111827]">2. Visual Asset Training — KIE Flux 2 Pro</p>
        </div>
        <p className="text-[11px] font-bold text-[#9CA3AF] mb-3">LoRA fine-tuning · 1,000 training steps · Flux 2 Pro base</p>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
          Upload photos of your products or brand character to train a custom <strong>LoRA model on Flux 2 Pro</strong>. Once trained, GeoVera can generate unlimited consistent product images for any platform — Instagram, TikTok, YouTube thumbnails.
        </p>

        <p className="text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Training Types</p>
        {[
          {
            type: "Product LoRA",
            icon: "📦",
            color: "#3B82F6",
            steps: [
              "Upload 4 product photos (front, left, back, right angle)",
              "GeoVera generates 8 synthetic training images via Flux 2 Pro",
              "Training job starts: 1,000 steps on KIE API",
              "Done in ~10 min — use trigger word to generate product images",
            ],
          },
          {
            type: "Character LoRA",
            icon: "🧑",
            color: "#8B5CF6",
            steps: [
              "Upload 4 consistent photos of your mascot or brand character",
              "GeoVera generates 8 diverse synthetic poses",
              "Training job: 1,000 steps on KIE Flux 2 Pro base",
              "Generate your character in any setting, style, or platform format",
            ],
          },
        ].map((t) => (
          <div key={t.type} className="mt-3 rounded-[14px] p-4" style={{ background: "white", border: `1.5px solid ${t.color}20` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[18px]">{t.icon}</span>
              <p className="text-[13px] font-bold" style={{ color: t.color }}>{t.type}</p>
            </div>
            {t.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 mt-1.5">
                <span className="text-[11px] font-bold w-4 flex-shrink-0 mt-0.5" style={{ color: t.color }}>{i + 1}.</span>
                <p className="text-[12px] text-[#374151]">{s}</p>
              </div>
            ))}
          </div>
        ))}

        <div className="mt-3 flex gap-2 flex-wrap">
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#3B82F620", color: "#3B82F6" }}>Basic: 5 LoRA models</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#8B5CF620", color: "#8B5CF6" }}>Premium: 10 LoRA models</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#F59E0B20", color: "#D97706" }}>Partner: 20 LoRA models</span>
        </div>
      </div>

      {/* Flow: Training → Image Gen → Publish */}
      <div className="rounded-[16px] p-4" style={{ background: "linear-gradient(135deg, #F5F3FF, #F0FDF4)", border: "1px solid #DDD6FE" }}>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#7C3AED] mb-3">Full Pipeline After Training</p>
        {[
          { step: "1", label: "LoRA trained", desc: "Your product/character LoRA is ready in Studio" },
          { step: "2", label: "Task comes in", desc: "Tasks Ideation generates a content task (e.g. 'post product Reel')" },
          { step: "3", label: "Generate image/video", desc: "Studio auto-uses your LoRA + Flux 2 Pro to create on-brand visuals" },
          { step: "4", label: "Publish via Late API", desc: "One click → Late API posts to Instagram, TikTok, YouTube" },
        ].map((row) => (
          <div key={row.step} className="flex items-start gap-3 mt-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
              style={{ background: "#7C3AED20", color: "#7C3AED" }}>
              {row.step}
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#374151]">{row.label}</p>
              <p className="text-[11px] text-[#9CA3AF]">{row.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/content-studio")}
        className="w-full py-3 rounded-[14px] text-[14px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #7C3AED, #F57422)" }}
      >
        Go to Content Studio → Start Training
      </button>
    </div>
  );
}

/* ── Tasks Ideation guide panel ─────────────────────────────────────────── */
function TasksIdeationGuide() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-[16px] p-5" style={{ background: "linear-gradient(135deg, #FAF5FF, #FFF7ED)", border: "1px solid #DDD6FE" }}>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#7C3AED] mb-1">What is Tasks Ideation?</p>
        <p className="text-[14px] text-[#374151] leading-relaxed">
          Before executing tasks, GeoVera synthesizes your Deep Research results, current trends, and business priorities to generate a focused, ranked task list — so you always work on what matters most.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#7C3AED20", color: "#7C3AED" }}>🔍 Research Results</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#F59E0B20", color: "#D97706" }}>📈 Trend Alignments</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#EF444420", color: "#EF4444" }}>🎯 Priority Filter</span>
        </div>
      </div>

      {/* 1. Deep Research Results */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[20px]">🔍</span>
          <p className="text-[14px] font-bold text-[#111827]">1. Deep Research Results</p>
        </div>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
          GeoVera pulls insights from your latest Deep Research cycle — SEO gaps, GEO opportunities, and social performance — and converts them into actionable tasks.
        </p>
        {[
          "SEO gaps: missing schema, broken links, thin content pages",
          "GEO opportunities: questions AI engines ask about your niche",
          "Social gaps: underperforming formats & optimal posting times",
          "Competitor moves: what competitors published this month",
          "Brand citation gaps: where your brand should be mentioned but isn't",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[11px] font-bold text-[#3D6B68] w-5 flex-shrink-0">{i + 1}.</span>
            <p className="text-[13px] text-[#374151]">{item}</p>
          </div>
        ))}
      </div>

      {/* 2. Trend Alignments */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[20px]">📈</span>
          <p className="text-[14px] font-bold text-[#111827]">2. Trend Alignments</p>
        </div>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
          GeoVera cross-references your brand niche with trending topics on TikTok, Instagram Reels, YouTube Shorts, and AI search — surfacing trends you can authentically align with this cycle.
        </p>
        {[
          "Trending hashtags in your niche (Apify + TikTok API)",
          "Viral content formats performing in your industry right now",
          "Emerging keywords spiking in AI search this week",
          "Seasonal & event-based content opportunities",
          "Competitor trend adoption — what's working for them",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[11px] font-bold text-[#8E6FD8] w-5 flex-shrink-0">{i + 1}.</span>
            <p className="text-[13px] text-[#374151]">{item}</p>
          </div>
        ))}
      </div>

      {/* 3. Priority Tasks Filter */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[20px]">🎯</span>
          <p className="text-[14px] font-bold text-[#111827]">3. Priority Tasks Filter</p>
        </div>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
          All generated tasks are scored by impact × effort. Your AI agents surface only the highest-ROI tasks first — so you never waste time on low-impact work.
        </p>
        {[
          { label: "🔴 Critical", desc: "Must-do this week — SEO fixes, broken elements, urgent GEO opportunities" },
          { label: "🟡 High", desc: "High-impact content aligned with current trends and competitor gaps" },
          { label: "🟢 Medium", desc: "Content creation, FAQ updates, platform optimization & A/B tests" },
          { label: "⚪ Low", desc: "Nice-to-have improvements, long-term experiments, and backlog items" },
        ].map((priority, i) => (
          <div key={i} className="flex items-start gap-3 mt-3 rounded-[10px] p-3" style={{ background: "white", border: "1px solid #F3F4F6" }}>
            <p className="text-[12px] font-bold w-20 flex-shrink-0 mt-0.5">{priority.label}</p>
            <p className="text-[12px] text-[#6B7280] leading-relaxed">{priority.desc}</p>
          </div>
        ))}
      </div>

      {/* Output */}
      <div className="rounded-[16px] p-4" style={{ background: "linear-gradient(135deg, #FAF5FF, #F0FDF4)", border: "1px solid #DDD6FE" }}>
        <p className="text-[13px] font-bold text-[#7C3AED] mb-2">Output: Your Prioritized Task Board</p>
        {[
          "Top 5 critical tasks (must do this week)",
          "10–15 content tasks aligned with this cycle's trends",
          "SEO + GEO fix list derived from deep research",
          "Platform-specific action items per connected account",
          "Monthly content calendar skeleton (ready to execute)",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2 mt-2">
            <span className="text-[#7C3AED]">✓</span>
            <p className="text-[13px] text-[#374151]">{item}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/calendar")}
        className="w-full py-3 rounded-[14px] text-[14px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #7C3AED, #8E6FD8)" }}
      >
        Go to Tasks Board →
      </button>
    </div>
  );
}

/* ── Tasks Audit guide panel ─────────────────────────────────────────────── */
function TasksAuditGuide() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-[16px] p-5" style={{ background: "linear-gradient(135deg, #FFF7ED, #FEF2F2)", border: "1px solid #FED7AA" }}>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#EA580C] mb-1">Tasks Audit — End of Cycle Scoring</p>
        <p className="text-[14px] text-[#374151] leading-relaxed">
          Before your biweekly/monthly report, GeoVera uses <strong>Claude</strong> to score how many tasks were completed, analyze the implications of what was done (and what wasn't), and predict the impact on your next research cycle's results.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#EA580C20", color: "#EA580C" }}>📊 Completion Score</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#7C3AED20", color: "#7C3AED" }}>🤖 Claude Analysis</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#16A34A20", color: "#16A34A" }}>📈 Impact Prediction</span>
        </div>
      </div>

      {/* Completion Scoring */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[20px]">📊</span>
          <p className="text-[14px] font-bold text-[#111827]">1. Completion Scoring</p>
        </div>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
          GeoVera tallies all tasks generated in the previous Tasks Ideation cycle and calculates your completion rate across each category.
        </p>
        {[
          { label: "SEO Tasks", example: "12 / 15 done (80%)" },
          { label: "GEO Tasks", example: "8 / 10 done (80%)" },
          { label: "Content Tasks", example: "20 / 30 done (67%)" },
          { label: "Social Tasks", example: "14 / 14 done (100%)" },
          { label: "Overall Score", example: "54 / 69 done (78%)" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between mt-2 rounded-[10px] px-3 py-2" style={{ background: "white", border: "1px solid #F3F4F6" }}>
            <p className="text-[13px] font-semibold text-[#374151]">{row.label}</p>
            <span className="text-[12px] font-bold text-[#6B7280]">{row.example}</span>
          </div>
        ))}
      </div>

      {/* Implications: Completed */}
      <div className="rounded-[16px] p-5" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[20px]">✅</span>
          <p className="text-[14px] font-bold text-[#111827]">2. Completed Tasks — Impact on Results</p>
        </div>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
          Claude analyzes which completed tasks already impacted your metrics — and projects how they'll improve your next Deep Research score.
        </p>
        {[
          "Fixed LLM.txt → Perplexity citation rate projected +12%",
          "Published 3 GEO FAQ articles → AI brand mention score improving",
          "Added schema markup → Core Web Vitals passed (was failing)",
          "Posted 5 trending Reels → Avg reach +40% this period",
          "Replied to top 50 competitor mentions → Brand awareness signal up",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[#16A34A]">✓</span>
            <p className="text-[13px] text-[#374151]">{item}</p>
          </div>
        ))}
      </div>

      {/* Implications: Incomplete */}
      <div className="rounded-[16px] p-5" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[20px]">⚠️</span>
          <p className="text-[14px] font-bold text-[#111827]">3. Incomplete Tasks — Missed Opportunities</p>
        </div>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
          Claude flags what you skipped and quantifies the cost — carried-over tasks get re-prioritized as Critical in the next ideation cycle.
        </p>
        {[
          "Skipped 10 content tasks → estimated -15% organic reach this period",
          "Didn't update Google Business Profile → GBP score stagnant",
          "No YouTube Shorts published → missed 3 trending audio opportunities",
          "Competitor gap report not acted on → 2 keywords lost to competitor",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[#EF4444]">✕</span>
            <p className="text-[13px] text-[#374151]">{item}</p>
          </div>
        ))}
        <div className="mt-3 rounded-[10px] px-3 py-2" style={{ background: "#FEE2E2", border: "1px solid #FECACA" }}>
          <p className="text-[12px] font-bold text-[#B91C1C]">→ Incomplete tasks are automatically carried over to the next Tasks Ideation cycle as Critical priority.</p>
        </div>
      </div>

      {/* Claude Analysis */}
      <div className="rounded-[16px] p-4" style={{ background: "linear-gradient(135deg, #FAF5FF, #F0FDF4)", border: "1px solid #DDD6FE" }}>
        <p className="text-[13px] font-bold text-[#7C3AED] mb-2">🤖 Claude — Cycle Impact Summary</p>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-2">
          At the end of each cycle, Claude generates a written impact summary:
        </p>
        {[
          "Overall cycle performance grade (A → F)",
          "Top 3 wins: tasks that had the highest measured impact",
          "Top 3 misses: highest-cost incomplete tasks",
          "Prediction: expected score changes in next Deep Research",
          "Recommended focus areas for the next ideation cycle",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2 mt-2">
            <span className="text-[#7C3AED]">✦</span>
            <p className="text-[13px] text-[#374151]">{item}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/analytics")}
        className="w-full py-3 rounded-[14px] text-[14px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #EA580C, #F97316)" }}
      >
        View Report & Analytics →
      </button>
    </div>
  );
}

/* ── LLM Learning Process guide panel (Step 15) ─────────────────────────── */
function LlmLearningGuide() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[22px] font-bold text-[#111827] leading-tight">LLM Learning Process</p>
        <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">
          At the end of each cycle, GeoVera re-trains its understanding of your brand using three AI layers — so every next cycle is smarter than the last.
        </p>
      </div>

      {/* Stack overview */}
      <div className="grid gap-3">
        {[
          {
            label: "Cloudflare Llama",
            sub: "Core re-training engine",
            desc: "Llama 3.3-70B re-ingests your updated Brand DNA, completed task outcomes, and new FAQ content. The brand voice model is updated with this cycle's performance data.",
            color: "#F97316",
            bg: "#FFF7ED",
            border: "#FED7AA",
          },
          {
            label: "Perplexity",
            sub: "Daily trend injection",
            desc: "Perplexity adds fresh daily trend signals — emerging keywords, new competitor moves, and AI search changes — so your next Deep Research starts with current market intelligence.",
            color: "#7C3AED",
            bg: "#FAF5FF",
            border: "#DDD6FE",
          },
          {
            label: "Claude",
            sub: "QA, optimizer & cycle analyzer",
            desc: "Claude processes your monthly QA results, biweekly/monthly reports, and comment/sentiment data to generate an optimization brief: what to fix, double down on, or drop next cycle.",
            color: "#3D6B68",
            bg: "#F0FDF4",
            border: "#BBF7D0",
          },
        ].map((tool) => (
          <div key={tool.label} className="rounded-[14px] p-4" style={{ background: tool.bg, border: `1px solid ${tool.border}` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[13px] font-bold" style={{ color: tool.color }}>{tool.label}</p>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "white", color: tool.color, border: `1px solid ${tool.border}` }}>{tool.sub}</span>
            </div>
            <p className="text-[12px] text-[#374151] leading-relaxed">{tool.desc}</p>
          </div>
        ))}
      </div>

      {/* What feeds the re-training */}
      <div className="rounded-[16px] p-4" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        <p className="text-[13px] font-bold text-[#111827] mb-3">Data Inputs Per Cycle</p>
        <div className="space-y-2">
          {[
            { label: "Daily Trend Updates", source: "Perplexity", desc: "Keyword shifts, viral formats, AI search spikes" },
            { label: "Monthly QA Results", source: "Claude", desc: "Deep Research score delta, content quality grades" },
            { label: "Biweekly/Monthly Reports", source: "Claude", desc: "Engagement, reach, conversion, and GEO metrics" },
            { label: "Comments & Sentiments", source: "Claude + Late API", desc: "Tone calibration from real audience feedback" },
            { label: "Completed Tasks Impact", source: "Tasks Audit", desc: "Which task types drove the most measurable growth" },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-3">
              <div className="mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: "#3D6B68", marginTop: "6px" }} />
              <div>
                <p className="text-[12px] font-semibold text-[#111827]">{row.label} <span className="font-normal text-[#6B7280]">— {row.source}</span></p>
                <p className="text-[11px] text-[#6B7280]">{row.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      <div className="rounded-[16px] p-4" style={{ background: "linear-gradient(135deg, #F0FDF4, #F0F9FF)", border: "1px solid #BBF7D0" }}>
        <p className="text-[13px] font-bold text-[#16A34A] mb-2">Output: Smarter Next Cycle</p>
        {[
          "Updated brand voice model with this cycle's learnings",
          "Pre-loaded trend context for next Deep Research",
          "Optimization brief: what to prioritize, fix, or drop",
          "Recalibrated AI CMO agent for next Tasks Ideation",
          "Re-ranked keyword targets based on QA + sentiment data",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[#16A34A] text-[12px]">✓</span>
            <p className="text-[13px] text-[#374151]">{item}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/analytics")}
        className="w-full py-3 rounded-[14px] text-[14px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #3D6B68, #5F8F8B)" }}
      >
        View Analytics & Reports →
      </button>
    </div>
  );
}

/* ── Research trigger panel (Step 8) ────────────────────────────────────── */
function ResearchTrigger({ onLaunch, connectedCount = 0 }: { onLaunch: () => void; connectedCount?: number }) {
  const [launched, setLaunched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const platformsReady = connectedCount >= MIN_PLATFORMS_BASIC;

  const handle = async () => {
    if (!platformsReady) { router.push("/connect"); return; }
    setLoading(true);
    try {
      // 1. Trigger analytics sync (Late API + Claude scoring — existing route)
      await fetch("/api/analytics/sync", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
      }).catch(() => {});
      // 2. Trigger brand deep research (Gemini + Perplexity — existing onboarding-workflow)
      const saved = (() => { try { return JSON.parse(localStorage.getItem("gv_onboarding") || "{}"); } catch { return {}; } })();
      if (saved.brand_name) {
        await fetch("/api/onboarding", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand_name: saved.brand_name, country: saved.country || "Indonesia" }),
        }).catch(() => {});
      }
    } finally {
      setLoading(false);
      setLaunched(true);
      onLaunch();
    }
  };

  const seoPoints = [
    "Crawl & index coverage (Firecrawl + SerpAPI)",
    "Core Web Vitals & page speed score",
    "Keyword ranking positions (top 100)",
    "Backlink profile & domain authority",
    "Structured data & Schema.org validation",
    "Content quality score vs competitors (Claude)",
    "LLM.txt & AI-readability check (Gemini)",
    "Image alt-text & media SEO",
    "Internal linking structure analysis",
    "Competitor content gap report (Apify)",
  ];

  const geoPoints = [
    "Perplexity citation check — is your brand mentioned?",
    "Gemini Knowledge Panel presence",
    "ChatGPT brand awareness test (Q&A reverse engineering)",
    "Brand entity recognition in AI answers",
    "FAQ schema effectiveness score",
    "AI-readable content ratio (Late API)",
    "Brand authority signals (Wikipedia, Crunchbase, GBP)",
    "Competitor GEO score comparison",
    "AI answer freshness — how current is your brand data?",
  ];

  const socialPoints = [
    "Content quality score per platform (Claude analysis)",
    "Hashtag performance & reach estimates (Apify)",
    "Optimal posting time recommendations",
    "Format suggestions aligned with SEO + GEO goals",
    "Engagement rate benchmarking vs industry average",
    "Trending topic opportunities in your niche",
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-[16px] p-5" style={{ background: "linear-gradient(135deg, #F0FDF4, #F0F9FF)", border: "1px solid #BAE6FD" }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[22px] font-bold text-[#111827]">Step 8 — Monthly Deep Research</span>
        </div>
        <p className="text-[14px] text-[#374151] leading-relaxed">
          A comprehensive monthly audit powered by <strong>Late API</strong>, <strong>Apify</strong>, <strong>Gemini</strong>, <strong>Claude</strong>, <strong>SerpAPI</strong>, and <strong>Firecrawl</strong> — generating your to-do list for the next 30 days.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#3D6B6820", color: "#3D6B68" }}>🔄 Monthly</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#8E6FD820", color: "#8E6FD8" }}>⚡ Automated</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#F59E0B20", color: "#D97706" }}>🦙 Llama-trained</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#EF444420", color: "#EF4444" }}>200–500 QA / client</span>
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Research Stack</p>
        <div className="grid grid-cols-2 gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {[
            { icon: "🔗", name: "Late API",          desc: "Social listening & comment monitoring" },
            { icon: "🕷️", name: "Apify",            desc: "Web scraping & competitor crawling" },
            { icon: "✦",  name: "Gemini",           desc: "Knowledge Graph & GEO analysis" },
            { icon: "🤖", name: "Claude",           desc: "Content scoring & gap analysis" },
            { icon: "📊", name: "SerpAPI",          desc: "Search ranking & keyword positions" },
            { icon: "🕸️", name: "Firecrawl",        desc: "Site crawl & structured data check" },
            { icon: "🦙", name: "Cloudflare Llama", desc: "Llama inference via Cloudflare Workers AI — fast, private, edge-deployed" },
            { icon: "⚡", name: "CF Workers",       desc: "Serverless edge compute — orchestrates the monthly research pipeline" },
          ].map((tool) => (
            <div key={tool.name} className="rounded-[12px] p-3" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[16px]">{tool.icon}</span>
                <p className="text-[12px] font-bold text-[#111827]">{tool.name}</p>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SEO — 10 points */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <p className="text-[13px] font-bold text-[#111827] mb-3">🔍 SEO Audit — 10 Check Points</p>
        {seoPoints.map((pt, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[11px] font-bold text-[#3D6B68] w-5 flex-shrink-0">{i + 1}.</span>
            <p className="text-[13px] text-[#374151]">{pt}</p>
          </div>
        ))}
      </div>

      {/* GEO — 9 points */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <p className="text-[13px] font-bold text-[#111827] mb-1">✦ GEO Audit — Q&A + Reverse Engineering</p>
        <p className="text-[11px] text-[#9CA3AF] mb-1">We ask AI engines about your brand, then reverse-engineer what content changes would make them cite you more</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "#3D6B6820", color: "#3D6B68" }}>Basic: 200 QA/month</span>
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "#8E6FD820", color: "#8E6FD8" }}>Premium: 300 QA/month</span>
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "#F59E0B20", color: "#D97706" }}>Partner: 500 QA/month</span>
        </div>
        {geoPoints.map((pt, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[11px] font-bold text-[#8E6FD8] w-5 flex-shrink-0">{i + 1}.</span>
            <p className="text-[13px] text-[#374151]">{pt}</p>
          </div>
        ))}
      </div>

      {/* Social Search */}
      <div className="rounded-[16px] p-5" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <p className="text-[13px] font-bold text-[#111827] mb-1">📱 Social Search — Content Scoring</p>
        <p className="text-[11px] text-[#9CA3AF] mb-3">AI scores your social content and generates suggestions aligned with your SEO + GEO goals</p>
        {socialPoints.map((pt, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[11px] font-bold text-[#F59E0B] w-5 flex-shrink-0">{i + 1}.</span>
            <p className="text-[13px] text-[#374151]">{pt}</p>
          </div>
        ))}
      </div>

      {/* Llama + Cloudflare */}
      <div className="rounded-[16px] p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <p className="text-[13px] font-bold text-[#D97706] mb-1">🦙 Llama on Cloudflare Workers AI</p>
        <p className="text-[13px] text-[#374151] leading-relaxed">
          Your brand's dataset, mindset, and skillset are used to fine-tune a <strong>Llama</strong> model via <strong>Cloudflare Workers AI</strong> — running at the edge for speed and privacy. Every monthly research cycle updates your model so your AI agents get smarter and more brand-accurate over time.
        </p>
        <div className="flex gap-2 mt-3">
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#F5742220", color: "#F57422" }}>⚡ Edge-deployed</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#0074D920", color: "#0074D9" }}>🔒 Private inference</span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#3D6B6820", color: "#3D6B68" }}>🔄 Monthly fine-tune</span>
        </div>
      </div>

      {/* What you'll get */}
      <div className="rounded-[16px] p-4" style={{ background: "linear-gradient(135deg, #F0FDF4, #F0F9FF)", border: "1px solid #BBF7D0" }}>
        <p className="text-[13px] font-bold text-[#16A34A] mb-2">Output: Your 30-Day To-Do List</p>
        {[
          "Must-do fixes: LLM.txt, FAQ schema, structured data",
          "Content calendar suggestions (SEO + GEO + Social aligned)",
          "Top 5 keyword opportunities to target this month",
          "Platform-specific recommendations (Instagram, TikTok, YouTube)",
          "Competitor moves to respond to this month",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2 mt-2">
            <span className="text-[#16A34A]">✓</span>
            <p className="text-[13px] text-[#374151]">{item}</p>
          </div>
        ))}
      </div>

      {/* Platform gate warning */}
      {!platformsReady && (
        <div className="rounded-[16px] px-5 py-4" style={{ background: "#FEF3C7", border: "1.5px solid #FDE68A" }}>
          <p className="text-[13px] font-bold text-[#D97706] mb-1">⚡ Hubungkan Platform Dulu</p>
          <p className="text-[13px] text-[#92400E] mb-3">
            Deep Research memerlukan minimal <strong>{MIN_PLATFORMS_BASIC} platform</strong> terhubung agar data sosial & konten dapat dianalisis secara penuh. Saat ini Anda baru menghubungkan <strong>{connectedCount} platform</strong>.
          </p>
          <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden mb-3">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((connectedCount / MIN_PLATFORMS_BASIC) * 100, 100)}%`,
                background: "linear-gradient(90deg, #F59E0B, #FCD34D)",
              }}
            />
          </div>
          <button
            onClick={() => router.push("/connect")}
            className="w-full py-2.5 rounded-[12px] text-[13px] font-bold"
            style={{ background: "#3D6B68", color: "white" }}
          >
            Hubungkan {MIN_PLATFORMS_BASIC - connectedCount} Platform Lagi →
          </button>
        </div>
      )}

      <button
        onClick={handle}
        disabled={launched || loading}
        className="w-full py-4 rounded-[16px] text-[15px] font-bold text-white transition-all"
        style={{
          background: !platformsReady
            ? "#D1D5DB"
            : launched
            ? "#6B7280"
            : "linear-gradient(135deg, #3D6B68 0%, #5F8F8B 40%, #8E6FD8 100%)",
          cursor: (!platformsReady || launched) ? "not-allowed" : "pointer",
          opacity: !platformsReady ? 0.6 : 1,
        }}
      >
        {!platformsReady
          ? `🔗 Connect ${MIN_PLATFORMS_BASIC - connectedCount} More Platforms First`
          : loading
          ? "⏳ Running Research Pipeline…"
          : launched
          ? "✓ Deep Research Launched — Check Analytics for Results"
          : "🚀 Launch Monthly Deep Research"}
      </button>
      <p className="text-center text-[12px] text-[#9CA3AF]">
        {platformsReady
          ? "Results will appear in Analytics → Report within 2-5 minutes"
          : `Minimal ${MIN_PLATFORMS_BASIC} platform diperlukan untuk Deep Research optimal`}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════════════════ */
export default function GettingStartedPage() {
  const router = useRouter();
  const [selected, setSelected]         = useState<string>("brand_profile");
  const [done, setDone]                 = useState<Set<string>>(new Set());
  const [mobileRightOpen, setMRO]       = useState(false);
  const [researchDone, setRD]           = useState(false);
  const [connectedPlatformCount, setCPC] = useState(0);

  // FAQ state per type
  const [faqGeneral, setFaqGeneral] = useState<FAQPair[]>([{ q: "", a: "" }]);
  const [faqProduct, setFaqProduct] = useState<FAQPair[]>([{ q: "", a: "" }]);
  const [faqGeo, setFaqGeo]         = useState<FAQPair[]>([{ q: "", a: "" }]);

  // Load persisted done state from localStorage + connected platform count
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setDone(new Set(JSON.parse(saved)));
    } catch {}

    // Fetch connected platform count from Supabase
    supabase
      .from("social_connections")
      .select("platform", { count: "exact", head: true })
      .eq("brand_id", FALLBACK_BRAND_ID)
      .eq("status", "active")
      .then(({ count }) => { if (count !== null) setCPC(count); });
  }, []);

  const toggleDone = (id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(LS_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const markDoneAndNext = (id: string) => {
    toggleDone(id);
    const idx = ITEMS.findIndex(i => i.id === id);
    if (idx < ITEMS.length - 1) setSelected(ITEMS[idx + 1].id);
  };

  const doneCount  = done.size;
  const totalCount = ITEMS.length;
  const allDone    = doneCount === totalCount;

  /* ── LEFT COLUMN ── */
  const leftCol = (
    <div className="h-full overflow-y-auto">
      <NavColumn />

      {/* Checklist container */}
      <div
        className="ml-[88px] h-full overflow-y-auto p-4 flex flex-col gap-2"
        style={{ paddingRight: 8 }}
      >
        <div className="mb-2 px-1">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--gv-color-neutral-400, #9CA3AF)" }}>
            Getting Started
          </p>
          <p className="text-[13px] font-semibold mt-1" style={{ color: "var(--gv-color-neutral-700, #374151)" }}>
            {doneCount} / {totalCount} complete
          </p>
        </div>

        {ITEMS.map((item, idx) => {
          const isSelected = selected === item.id;
          const isDone     = done.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => { setSelected(item.id); setMRO(true); }}
              className="w-full flex items-center gap-3 rounded-[14px] px-3 py-3 text-left transition-all"
              style={{
                background: isSelected ? "var(--gv-color-primary-50, #F0F9FF)" : "transparent",
                border: `1.5px solid ${isSelected ? "var(--gv-color-primary-200, #BAE6FD)" : "transparent"}`,
              }}
            >
              {/* Number / check */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold transition-all"
                style={{
                  background: isDone ? "#DCFCE7" : isSelected ? "var(--gv-color-primary-100, #E0F2FE)" : "var(--gv-color-neutral-100, #F3F4F6)",
                  color: isDone ? "#16A34A" : isSelected ? "var(--gv-color-primary-700, #0369A1)" : "var(--gv-color-neutral-500, #6B7280)",
                }}
              >
                {isDone ? "✓" : idx + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold truncate"
                  style={{ color: isSelected ? "var(--gv-color-primary-700, #0369A1)" : isDone ? "#16A34A" : "var(--gv-color-neutral-700, #374151)" }}>
                  {item.icon} {item.title}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--gv-color-neutral-400, #9CA3AF)" }}>
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}

        {/* Deep Research unlock */}
        {allDone && (
          <button
            onClick={() => { setSelected("research"); setMRO(true); }}
            className="w-full flex items-center gap-3 rounded-[14px] px-3 py-3 text-left mt-2 transition-all"
            style={{
              background: selected === "research" ? "linear-gradient(135deg, #F0FDF4, #F0F9FF)" : "linear-gradient(135deg, #3D6B6810, #5F8F8B10)",
              border: `1.5px solid ${selected === "research" ? "#BBF7D0" : "#3D6B6840"}`,
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px]"
              style={{ background: "linear-gradient(135deg, #3D6B68, #5F8F8B)" }}>
              🚀
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: "#3D6B68" }}>Launch Deep Research</p>
              <p className="text-[11px]" style={{ color: "#9CA3AF" }}>Step 8 — AI brand audit</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  /* ── CENTER COLUMN ── */
  const centerItem = ITEMS.find(i => i.id === selected);
  const centerCol = (
    <div className="h-full overflow-y-auto">
      {selected === "research" ? (
        <div className="p-6">
          <ResearchTrigger onLaunch={() => { setRD(true); router.push("/analytics"); }} connectedCount={connectedPlatformCount} />
        </div>
      ) : (
        <div className="p-6 flex flex-col gap-0">
          {/* Item header */}
          {centerItem && (
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[24px]">{centerItem.icon}</span>
                  <h2 className="text-[20px] font-bold text-[#111827]">{centerItem.title}</h2>
                </div>
                <p className="text-[14px] text-[#6B7280]">{centerItem.subtitle}</p>
              </div>
              <button
                onClick={() => markDoneAndNext(centerItem.id)}
                className="flex items-center gap-2 rounded-[12px] px-4 py-2 text-[13px] font-bold transition-all flex-shrink-0"
                style={{
                  background: done.has(centerItem.id) ? "#DCFCE7" : "var(--gv-color-primary-600, #3D6B68)",
                  color: done.has(centerItem.id) ? "#16A34A" : "white",
                  border: done.has(centerItem.id) ? "1.5px solid #BBF7D0" : "none",
                }}
              >
                {done.has(centerItem.id) ? "✓ Done" : "Mark as Done"}
              </button>
            </div>
          )}

          {/* Content per step */}
          {selected === "brand_profile" && <BrandProfileGuide />}
          {["instagram", "tiktok", "youtube", "linkedin", "x_twitter"].includes(selected) && (
            <PlatformGuide
              itemId={selected}
              onConnectClick={() => { toggleDone(selected); setSelected("connect_all"); }}
            />
          )}
          {selected === "connect_all" && <ConnectGuide connectedCount={connectedPlatformCount} />}
          {selected === "faq_general" && (
            <FAQBuilder type="general" pairs={faqGeneral} onChange={setFaqGeneral} />
          )}
          {selected === "faq_product" && (
            <FAQBuilder type="product" pairs={faqProduct} onChange={setFaqProduct} />
          )}
          {selected === "faq_geo" && (
            <FAQBuilder type="geo" pairs={faqGeo} onChange={setFaqGeo} />
          )}
          {selected === "build_training" && <BuildTrainingGuide />}
          {selected === "tasks_ideation" && <TasksIdeationGuide />}
          {selected === "tasks_audit" && <TasksAuditGuide />}
          {selected === "llm_learning" && <LlmLearningGuide />}
        </div>
      )}
    </div>
  );

  /* ── RIGHT COLUMN ── */
  const rightCol = (
    <div className="h-full overflow-y-auto p-6 flex flex-col gap-5">
      {/* Progress ring */}
      <div className="flex flex-col items-center py-4">
        <ProgressRing done={doneCount} total={totalCount} />
        {allDone && (
          <div className="mt-3 rounded-full px-3 py-1" style={{ background: "#DCFCE7", border: "1px solid #BBF7D0" }}>
            <p className="text-[12px] font-bold text-[#16A34A]">All steps complete! 🎉</p>
          </div>
        )}
      </div>

      {/* Next step */}
      {!allDone && (
        <div className="rounded-[16px] p-4" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Up Next</p>
          {ITEMS.filter(i => !done.has(i.id)).slice(0, 3).map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className="w-full flex items-center gap-2 mt-2 text-left"
            >
              <span className="text-[14px]">{item.icon}</span>
              <p className="text-[13px] text-[#374151] hover:text-[#3D6B68] transition-colors">{item.title}</p>
            </button>
          ))}
        </div>
      )}

      {/* What happens after */}
      <div className="rounded-[16px] p-4" style={{ background: "linear-gradient(135deg, #F0FDF4, #F0F9FF)", border: "1px solid #BAE6FD" }}>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#0369A1] mb-3">After Setup</p>
        {[
          { step: "Step 8",  label: "Deep Research",              icon: "🔍" },
          { step: "Step 9",  label: "Tasks Ideation",             icon: "🧠" },
          { step: "Step 10", label: "Tasks → Image/Video",        icon: "🎬" },
          { step: "Step 11", label: "Publish (Late API)",         icon: "📤" },
          { step: "Step 12", label: "Auto Reply (Late API)",      icon: "💬" },
          { step: "Step 13", label: "Tasks Audit (Claude)",       icon: "📊" },
          { step: "Step 14", label: "Biweekly/Monthly Report",    icon: "📈" },
          { step: "Step 15", label: "LLM Learning (Llama + Perplexity + Claude)", icon: "🔄" },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-3 mt-3">
            <span className="text-[16px]">{s.icon}</span>
            <div>
              <p className="text-[10px] font-bold text-[#0369A1]">{s.step}</p>
              <p className="text-[12px] font-semibold text-[#374151]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="rounded-[16px] p-4" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Quick Actions</p>
        {[
          { label: "Connect Platforms", path: "/connect", icon: "🔗" },
          { label: "Configure AI Agents", path: "/ai-agent", icon: "🤖" },
          { label: "Create Content", path: "/content-studio", icon: "🎨" },
          { label: "View Analytics", path: "/analytics", icon: "📊" },
        ].map((link) => (
          <button
            key={link.label}
            onClick={() => router.push(link.path)}
            className="w-full flex items-center gap-2 mt-2 text-left"
          >
            <span className="text-[14px]">{link.icon}</span>
            <p className="text-[13px] text-[#374151] hover:text-[#3D6B68] transition-colors">{link.label}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ThreeColumnLayout
          left={leftCol}
          center={centerCol}
          right={rightCol}
          mobileRightOpen={mobileRightOpen}
          onMobileBack={() => setMRO(false)}
          mobileBackLabel="Getting Started"
        />
      </div>
    </div>
  );
}
