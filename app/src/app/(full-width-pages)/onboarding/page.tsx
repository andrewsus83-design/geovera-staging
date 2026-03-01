"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3;

interface BrandForm {
  brand_name: string;
  website: string;
  country: string;
  industry: string;
  description: string;
  target_audience: string;
}

const INDUSTRIES = [
  "Fashion & Apparel", "Food & Beverage", "Health & Beauty", "Technology",
  "E-Commerce", "Education", "Travel & Hospitality", "Finance",
  "Real Estate", "Entertainment", "Automotive", "Sports & Fitness",
  "Home & Living", "Arts & Culture", "Professional Services", "Other",
];

const RESEARCH_STEPS = [
  { label: "Scanning brand presence on Google…",     engine: "G", color: "#4285F4" },
  { label: "Checking Perplexity indexing & citations…", engine: "P", color: "#20B2AA" },
  { label: "Analyzing Gemini AI visibility…",         engine: "✦", color: "#8E6FD8" },
  { label: "Mapping competitor landscape…",            engine: "🔍", color: "#F59E0B" },
  { label: "Identifying content authority gaps…",      engine: "⚡", color: "#10B981" },
];

/* ── Step indicator ─────────────────────────────────────────────────────── */
function StepPill({ step, current }: { step: number; current: Step }) {
  const done    = current > step;
  const active  = current === step;
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
        style={{
          background: done ? "rgba(255,255,255,0.95)" : active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.10)",
          color:      done ? "#3D6B68" : active ? "white" : "rgba(255,255,255,0.5)",
          border:     active ? "1.5px solid rgba(255,255,255,0.6)" : "none",
        }}
      >
        {done ? "✓" : step}
      </div>
      <span className={`text-[13px] font-medium ${active ? "text-white" : done ? "text-white/80" : "text-white/40"}`}>
        {step === 1 ? "Brand Details" : step === 2 ? "Deep Research" : "Create Account"}
      </span>
    </div>
  );
}

/* ── Left panel ─────────────────────────────────────────────────────────── */
function LeftPanel({ step }: { step: Step }) {
  return (
    <div
      className="hidden lg:flex flex-col justify-between h-full p-10"
      style={{
        background: "linear-gradient(145deg, #3D6B68 0%, #2A4E4B 50%, #1E3836 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image src="/images/geoveralogo.png" alt="GeoVera" width={40} height={40} className="rounded-xl" />
        <span className="text-white font-bold text-[20px] tracking-tight">GeoVera</span>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-4">
        <p className="text-white/50 text-[11px] uppercase tracking-widest font-semibold mb-2">Your Journey</p>
        {[1, 2, 3].map((s) => (
          <StepPill key={s} step={s} current={step} />
        ))}
      </div>

      {/* Quote */}
      <div className="rounded-[20px] p-5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <p className="text-white/90 text-[14px] leading-relaxed font-medium">
          "Brands that are indexed by AI search engines get 3× more organic discovery than those that aren't."
        </p>
        <p className="text-white/40 text-[12px] mt-3">— GeoVera Research, 2026</p>
      </div>
    </div>
  );
}

/* ── Field ──────────────────────────────────────────────────────────────── */
function Field({
  label, value, onChange, placeholder, type = "text", as,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; as?: "textarea" | "select";
}) {
  const base: React.CSSProperties = {
    width: "100%",
    borderRadius: "12px",
    border: "1.5px solid var(--gv-color-neutral-200, #E5E7EB)",
    padding: "10px 14px",
    fontSize: "14px",
    color: "var(--gv-color-neutral-900, #111827)",
    background: "white",
    outline: "none",
    transition: "border-color 0.15s",
  };
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      {as === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ ...base, resize: "none", lineHeight: 1.5 }} />
      ) : as === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={base}>
          <option value="">Select industry…</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

/* ── Step 1: Brand form ─────────────────────────────────────────────────── */
function Step1({ form, setForm, onNext }: {
  form: BrandForm; setForm: (f: BrandForm) => void; onNext: () => void;
}) {
  const set = (k: keyof BrandForm) => (v: string) => setForm({ ...form, [k]: v });
  const canNext = form.brand_name.trim() && form.country.trim() && form.industry;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-bold text-[#111827] leading-tight">Tell us about your brand</h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          We'll research your brand's presence and find opportunities to grow your AI visibility.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Brand Name *" value={form.brand_name} onChange={set("brand_name")} placeholder="e.g. Kopi Kenangan" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Website URL" value={form.website} onChange={set("website")} placeholder="https://yourbrand.com" type="url" />
          <Field label="Country *" value={form.country} onChange={set("country")} placeholder="e.g. Indonesia" />
        </div>
        <Field label="Industry *" value={form.industry} onChange={set("industry")} as="select" />
        <Field label="Brand Description" value={form.description} onChange={set("description")}
          placeholder="What does your brand do? What makes it unique?" as="textarea" />
        <Field label="Target Audience" value={form.target_audience} onChange={set("target_audience")}
          placeholder="e.g. Young professionals, 25-35, urban Indonesia" />
      </div>

      <button
        onClick={onNext}
        disabled={!canNext}
        className="w-full py-3 rounded-[14px] text-[15px] font-bold text-white transition-all"
        style={{
          background: canNext ? "linear-gradient(135deg, #3D6B68, #5F8F8B)" : "#D1D5DB",
          cursor: canNext ? "pointer" : "not-allowed",
        }}
      >
        Start Deep Research →
      </button>

      <p className="text-center text-[13px] text-[#9CA3AF]">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold" style={{ color: "#3D6B68" }}>Sign in</Link>
      </p>
    </div>
  );
}

/* ── Step 2: Research in progress ───────────────────────────────────────── */
function Step2({ brandName, onDone }: { brandName: string; onDone: () => void }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone]       = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    RESEARCH_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setCurrent(i);
        timers.push(setTimeout(() => {
          setDone(prev => [...prev, i]);
          if (i === RESEARCH_STEPS.length - 1) {
            timers.push(setTimeout(onDone, 800));
          } else {
            setCurrent(i + 1);
          }
        }, 1400));
      }, i * 1600));
    });
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const progress = Math.round(((done.length) / RESEARCH_STEPS.length) * 100);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[26px] font-bold text-[#111827] leading-tight">Researching your brand…</h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Our AI is scanning the web for <span className="font-semibold text-[#3D6B68]">{brandName}</span> across multiple intelligence sources.
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] font-semibold text-[#6B7280]">Analysis progress</span>
          <span className="text-[12px] font-bold text-[#3D6B68]">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #3D6B68, #5F8F8B)" }}
          />
        </div>
      </div>

      {/* Research items */}
      <div className="flex flex-col gap-3">
        {RESEARCH_STEPS.map((step, i) => {
          const isDone   = done.includes(i);
          const isActive = current === i && !isDone;
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-[14px] p-4 transition-all duration-300"
              style={{
                background: isDone ? "#F0FDF4" : isActive ? "#F0F9FF" : "#F9FAFB",
                border: `1.5px solid ${isDone ? "#86EFAC" : isActive ? "#7DD3FC" : "#F3F4F6"}`,
                opacity: (!isDone && !isActive && i > current) ? 0.4 : 1,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                style={{ background: step.color + "18", color: step.color }}
              >
                {isDone ? "✓" : isActive ? (
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : step.engine}
              </div>
              <span className="text-[14px] font-medium text-[#374151]">{step.label}</span>
              {isDone && <span className="ml-auto text-[12px] text-[#16A34A] font-semibold">Done</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 3: Results + CTA ──────────────────────────────────────────────── */
function Step3({ brandName, form }: { brandName: string; form: BrandForm }) {
  const router = useRouter();

  const handleCreateAccount = () => {
    // Persist onboarding data for post-signup pickup
    try {
      localStorage.setItem("gv_onboarding", JSON.stringify(form));
    } catch {}
    router.push("/signup");
  };

  const insights = [
    { icon: "🔍", title: "Search Visibility", value: "Low–Medium", color: "#F59E0B", note: "Your brand has limited AI search indexing" },
    { icon: "✦", title: "AI Citation Score", value: "Not indexed", color: "#8E6FD8", note: "Not yet found in Perplexity or Gemini" },
    { icon: "📊", title: "Authority Gaps", value: "8 found", color: "#EF4444", note: "Competitor brands outrank you in AI search" },
    { icon: "🚀", title: "Growth Potential", value: "High", color: "#10B981", note: "Strong opportunity to dominate your niche" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3"
          style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
          <span className="text-[11px] font-bold text-[#16A34A]">✓ Research Complete</span>
        </div>
        <h1 className="text-[26px] font-bold text-[#111827] leading-tight">
          We found opportunities for <span style={{ color: "#3D6B68" }}>{brandName}</span>
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Create your account to see the full report and start improving your AI visibility today.
        </p>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-2 gap-3">
        {insights.map((ins) => (
          <div key={ins.title} className="rounded-[16px] p-4"
            style={{ background: "#F9FAFB", border: "1.5px solid #F3F4F6" }}>
            <div className="text-[22px] mb-2">{ins.icon}</div>
            <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{ins.title}</p>
            <p className="text-[18px] font-bold mt-0.5" style={{ color: ins.color }}>{ins.value}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed">{ins.note}</p>
          </div>
        ))}
      </div>

      {/* What you'll get */}
      <div className="rounded-[16px] p-5" style={{ background: "linear-gradient(135deg, #F0FDF4, #F0F9FF)", border: "1.5px solid #E0F2FE" }}>
        <p className="text-[13px] font-bold text-[#374151] mb-3">What you'll get with Geovera:</p>
        {[
          "Full brand intelligence report (SEO, GEO, Social)",
          "AI agent workforce: CEO + CMO to run your marketing",
          "Automatic indexing across Perplexity, Gemini & ChatGPT",
          "Daily to-do list generated by AI based on your brand",
          "One-click publish to Instagram, TikTok, YouTube & more",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2 mt-2">
            <span className="text-[#10B981] text-[13px] font-bold mt-0.5">✓</span>
            <span className="text-[13px] text-[#374151]">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleCreateAccount}
        className="w-full py-3.5 rounded-[14px] text-[15px] font-bold text-white transition-all"
        style={{ background: "linear-gradient(135deg, #3D6B68, #5F8F8B)" }}
      >
        Create Your Free Account →
      </button>

      <p className="text-center text-[12px] text-[#9CA3AF]">
        Free during setup · No credit card required to explore
      </p>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<BrandForm>({
    brand_name: "", website: "", country: "", industry: "", description: "", target_audience: "",
  });

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--gv-color-bg-base, #F4F7F8)" }}>
      {/* Left branding panel — 40% on desktop, hidden on mobile */}
      <div className="hidden lg:block lg:w-[40%] flex-shrink-0">
        <LeftPanel step={step} />
      </div>

      {/* Right form panel — 60% */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8 lg:p-12"
        style={{ background: "white" }}>
        <div className="w-full max-w-[480px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/images/geoveralogo.png" alt="GeoVera" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-[18px] text-[#111827]">GeoVera</span>
          </div>

          {/* Mobile step indicator */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: step >= s ? "#3D6B68" : "#E5E7EB", width: step === s ? 20 : 8 }}
                />
              </div>
            ))}
          </div>

          {step === 1 && <Step1 form={form} setForm={setForm} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 brandName={form.brand_name} onDone={() => setStep(3)} />}
          {step === 3 && <Step3 brandName={form.brand_name} form={form} />}
        </div>
      </div>
    </div>
  );
}
