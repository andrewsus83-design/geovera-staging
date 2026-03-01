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
  category: "profile" | "platform" | "connect" | "faq" | "research";
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

/* ── Connect guide panel ─────────────────────────────────────────────────── */
function ConnectGuide() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[16px] p-5" style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
        <p className="text-[13px] font-bold text-[#0369A1] mb-1">Why connect your platforms?</p>
        <p className="text-[14px] text-[#374151] leading-relaxed">
          Connecting your platforms lets GeoVera's AI agents publish, monitor, and reply on your behalf — turning your social presence into a 24/7 automated marketing machine.
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

/* ── Research trigger panel (Step 8) ────────────────────────────────────── */
function ResearchTrigger({ onLaunch }: { onLaunch: () => void }) {
  const [launched, setLaunched] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handle = async () => {
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

      <button
        onClick={handle}
        disabled={launched || loading}
        className="w-full py-4 rounded-[16px] text-[15px] font-bold text-white transition-all"
        style={{
          background: launched ? "#6B7280" : "linear-gradient(135deg, #3D6B68 0%, #5F8F8B 40%, #8E6FD8 100%)",
          cursor: launched ? "default" : "pointer",
        }}
      >
        {loading ? "⏳ Running Research Pipeline…" : launched ? "✓ Deep Research Launched — Check Analytics for Results" : "🚀 Launch Monthly Deep Research"}
      </button>
      <p className="text-center text-[12px] text-[#9CA3AF]">Results will appear in Analytics → Report within 2-5 minutes</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════════════════ */
export default function GettingStartedPage() {
  const router = useRouter();
  const [selected, setSelected]     = useState<string>("brand_profile");
  const [done, setDone]             = useState<Set<string>>(new Set());
  const [mobileRightOpen, setMRO]   = useState(false);
  const [researchDone, setRD]       = useState(false);

  // FAQ state per type
  const [faqGeneral, setFaqGeneral] = useState<FAQPair[]>([{ q: "", a: "" }]);
  const [faqProduct, setFaqProduct] = useState<FAQPair[]>([{ q: "", a: "" }]);
  const [faqGeo, setFaqGeo]         = useState<FAQPair[]>([{ q: "", a: "" }]);

  // Load persisted done state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setDone(new Set(JSON.parse(saved)));
    } catch {}
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
          <ResearchTrigger onLaunch={() => { setRD(true); router.push("/analytics"); }} />
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
          {selected === "connect_all" && <ConnectGuide />}
          {selected === "faq_general" && (
            <FAQBuilder type="general" pairs={faqGeneral} onChange={setFaqGeneral} />
          )}
          {selected === "faq_product" && (
            <FAQBuilder type="product" pairs={faqProduct} onChange={setFaqProduct} />
          )}
          {selected === "faq_geo" && (
            <FAQBuilder type="geo" pairs={faqGeo} onChange={setFaqGeo} />
          )}
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
          { step: "Step 8", label: "Deep Research Scan", icon: "🔍" },
          { step: "Step 9", label: "Daily To-Do Workflow", icon: "📋" },
          { step: "Step 10", label: "Monthly Analytics Report", icon: "📊" },
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
