"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

/* ══════════════════════════════════════════════════════════════════════════
   /onboarding — Typeform-style full-screen wizard  DS v5.8
   ──────────────────────────────────────────────────────────────────────────
   Screen 0 : Welcome + Sign Up / Login   ← auth happens HERE first
   Screen 1 : Brand Info  (name · industry · description)
   Screen 2 : Presence    (platform · country · audience · whatsapp)
   Screen 3 : Processing  (research animation + create brand)
   Screen 4 : Results     (thank you + report notice)
   Screen 5 : Pricing     (Basic / Premium / Partner + skip)
   Screen 6 : Payment     (Xendit invoice)
══════════════════════════════════════════════════════════════════════════ */

const GV_TEAL  = "#3D6B68";
const GV_TEAL2 = "#5F8F8B";
const GV_LIGHT = "#EDF5F4";
const LS_KEY   = "gv_onboarding_v3";

const RESEARCH_STEPS = [
  { label: "Scanning brand presence on Google…",        engine: "G",  color: "#4285F4" },
  { label: "Checking Perplexity indexing & citations…", engine: "P",  color: "#20B2AA" },
  { label: "Analyzing Gemini AI visibility…",           engine: "✦",  color: "#8E6FD8" },
  { label: "Mapping competitor landscape…",             engine: "🔍", color: "#F59E0B" },
  { label: "Identifying content authority gaps…",       engine: "⚡", color: "#10B981" },
];

const INDUSTRIES = [
  "Fashion & Apparel", "Food & Beverage", "Health & Beauty", "Technology",
  "E-Commerce", "Education", "Travel & Hospitality", "Finance",
  "Real Estate", "Entertainment", "Automotive", "Sports & Fitness",
  "Home & Living", "Arts & Culture", "Professional Services", "Other",
];

const COUNTRIES = [
  "Indonesia", "Malaysia", "Singapore", "Philippines", "Thailand",
  "Vietnam", "Australia", "United States", "United Kingdom", "Canada",
  "Germany", "France", "Netherlands", "Japan", "South Korea",
  "India", "China", "Hong Kong", "Taiwan", "New Zealand",
  "Brazil", "Mexico", "Argentina", "Colombia", "Chile",
  "United Arab Emirates", "Saudi Arabia", "South Africa", "Nigeria", "Kenya",
  "Egypt", "Turkey", "Russia", "Poland", "Spain", "Italy",
  "Sweden", "Norway", "Denmark", "Finland", "Belgium",
  "Switzerland", "Austria", "Portugal", "Greece", "Czech Republic",
  "Hungary", "Romania", "Ukraine", "Pakistan", "Bangladesh",
  "Sri Lanka", "Myanmar", "Cambodia", "Papua New Guinea", "Other",
];

const PRICING_PLANS = [
  {
    id: "basic", name: "Basic",
    price_mo: "3,99", price_yr_mo: "3,66", price_yr_total: "43,89",
    idr_mo: 3990000, idr_yr: 43890000,
    features: [
      "3 tasks/hari",
      "Unlimited auto reply komentar",
      "5 LoRA product/character training",
      "10 images/hari",
      "4 platform connect & auto publish",
    ],
    color: GV_TEAL, xendit_plan: "BASIC",
  },
  {
    id: "premium", name: "Premium",
    price_mo: "6,99", price_yr_mo: "6,41", price_yr_total: "76,89",
    idr_mo: 6990000, idr_yr: 76890000,
    features: [
      "6 tasks/hari",
      "Unlimited auto reply komentar",
      "10 LoRA product/character training",
      "15 images/hari",
      "8 platform connect & auto publish",
      "1 video/hari (maks. 10 detik)",
      "Report & Analytics",
    ],
    color: "#6D28D9", highlight: true, xendit_plan: "PREMIUM",
  },
  {
    id: "partner", name: "Partner",
    price_mo: "15,99", price_yr_mo: "14,66", price_yr_total: "175,89",
    idr_mo: 15990000, idr_yr: 175890000,
    features: [
      "12 tasks/hari",
      "Unlimited auto reply komentar",
      "20 LoRA product/character training",
      "30 images/hari",
      "9 platform connect & auto publish",
      "2 video/hari (maks. 25 detik)",
      "1 YouTube video/bln (3 mnt, avatar)",
      "Report & Analytics",
    ],
    color: "#B45309", xendit_plan: "PARTNER",
  },
];

type PlatformType = "web" | "tiktok" | "instagram";

interface FormData {
  brand_name: string; industry: string; description: string;
  platform_type: PlatformType; platform_url: string;
  country: string; target_audience: string; whatsapp: string;
}

const DEFAULT_FORM: FormData = {
  brand_name: "", industry: "", description: "",
  platform_type: "web", platform_url: "",
  country: "", target_audience: "", whatsapp: "",
};

/* ── Google Icon ─────────────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M18.75 10.19C18.75 9.47 18.69 8.95 18.56 8.41H10.18V11.65H15.1C15 12.46 14.47 13.68 13.27 14.49L15.91 16.61C17.78 15.1 18.75 12.86 18.75 10.19Z" fill="#4285F4"/>
    <path d="M10.18 18.75C12.59 18.75 14.61 17.97 16.09 16.63L13.27 14.49C12.52 15.01 11.51 15.37 10.18 15.37C7.82 15.37 5.81 13.84 5.1 11.73L2.2 13.93C3.67 16.79 6.69 18.75 10.18 18.75Z" fill="#34A853"/>
    <path d="M5.1 11.73C4.91 11.19 4.8 10.6 4.8 10C4.8 9.4 4.91 8.81 5.09 8.27L2.2 6.07C1.6 7.26 1.25 8.59 1.25 10C1.25 11.41 1.6 12.74 2.2 13.93L5.1 11.73Z" fill="#FBBC05"/>
    <path d="M10.18 4.63C11.85 4.63 12.99 5.34 13.63 5.94L16.15 3.53C14.6 2.12 12.59 1.25 10.18 1.25C6.69 1.25 3.67 3.21 2.2 6.07L5.09 8.27C5.81 6.16 7.82 4.63 10.18 4.63Z" fill="#EB4335"/>
  </svg>
);

/* ── Screen wrapper — page locked, inner content scrolls if needed ────────── */
function Screen({ children, visible, direction = "up", scrollable = false }: {
  children: React.ReactNode; visible: boolean;
  direction?: "up" | "down"; scrollable?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : direction === "up" ? "translateY(36px)" : "translateY(-36px)",
        pointerEvents: visible ? "auto" : "none",
        overflowY: scrollable ? "auto" : "hidden",
        paddingTop: scrollable ? "68px" : 0,
        paddingBottom: scrollable ? "72px" : 0,
        justifyContent: scrollable ? "flex-start" : "center",
      }}
    >
      <div className={`w-full max-w-[520px] px-6 ${scrollable ? "" : "flex flex-col justify-center min-h-full"}`}>
        {children}
      </div>
    </div>
  );
}

/* ── Progress bar ─────────────────────────────────────────────────────────── */
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px]" style={{ background: "rgba(0,0,0,0.06)" }}>
      <div className="h-full transition-all duration-600 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${GV_TEAL}, ${GV_TEAL2})` }} />
    </div>
  );
}

/* ── Small utilities ──────────────────────────────────────────────────────── */
function FieldLabel({ text }: { text: string }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">{text}</p>;
}

function InlineInput({ value, onChange, placeholder, type = "text", autoFocus, prefix, onEnter }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  type?: string; autoFocus?: boolean; prefix?: string; onEnter?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) setTimeout(() => ref.current?.focus(), 80); }, [autoFocus]);
  return (
    <div className="flex items-end gap-2">
      {prefix && <span className="text-[15px] text-[#9CA3AF] pb-1.5 flex-shrink-0">{prefix}</span>}
      <input ref={ref} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[18px] sm:text-[20px] font-medium text-[#111827] outline-none border-b-2 pb-1.5 transition-colors placeholder:text-[#D1D5DB]"
        style={{ borderColor: value ? GV_TEAL : "#E5E7EB" }}
      />
    </div>
  );
}

function CompactTextarea({ value, onChange, placeholder, maxLength, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder: string; maxLength?: number; rows?: number;
}) {
  return (
    <div>
      <textarea value={value} rows={rows}
        onChange={e => maxLength ? onChange(e.target.value.slice(0, maxLength)) : onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[16px] font-medium text-[#111827] outline-none border-b-2 pb-1.5 resize-none transition-colors placeholder:text-[#D1D5DB]"
        style={{ borderColor: value ? GV_TEAL : "#E5E7EB", lineHeight: 1.55 }}
      />
      {maxLength && (
        <div className="flex justify-end">
          <span className="text-[11px]" style={{ color: value.length > maxLength * 0.85 ? "#EF4444" : "#9CA3AF" }}>
            {value.length} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={wrapRef} className="relative">
      <div className="w-full text-[18px] sm:text-[20px] font-medium border-b-2 pb-1.5 cursor-pointer flex items-center justify-between"
        style={{ borderColor: value ? GV_TEAL : "#E5E7EB", color: value ? "#111827" : "#D1D5DB" }}
        onClick={() => setOpen(o => !o)}>
        <span>{value || "Pilih negara…"}</span>
        <span className="text-[14px] text-[#9CA3AF]">{open ? "↑" : "↓"}</span>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-[12px] shadow-xl z-[100] overflow-hidden"
          style={{ background: "white", border: "1.5px solid #E5E7EB", maxHeight: "200px" }}>
          <div className="sticky top-0 bg-white p-2 border-b border-[#F3F4F6]">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari negara…"
              className="w-full text-[13px] outline-none bg-[#F9FAFB] rounded-[8px] px-3 py-1.5 placeholder:text-[#9CA3AF]" />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "140px" }}>
            {filtered.map(c => (
              <button key={c} onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                className="w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-[#F9FAFB]"
                style={{ color: c === value ? GV_TEAL : "#374151", background: c === value ? GV_LIGHT : undefined }}>
                {c === value ? "✓ " : ""}{c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContinueBtn({ onClick, disabled, label = "Lanjut →", full = false }: {
  onClick: () => void; disabled?: boolean; label?: string; full?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${full ? "w-full" : "inline-flex"} items-center justify-center gap-2 rounded-[10px] px-6 py-3 text-[14px] font-bold transition-all`}
      style={{
        background: disabled ? "#E5E7EB" : `linear-gradient(135deg, ${GV_TEAL}, ${GV_TEAL2})`,
        color: disabled ? "#9CA3AF" : "white",
        cursor: disabled ? "not-allowed" : "pointer",
      }}>
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function OnboardingPage() {
  const router = useRouter();
  const [screen, setScreen]         = useState(0);
  const [prevScreen, setPrevScreen] = useState(0);
  const [form, setForm]             = useState<FormData>(DEFAULT_FORM);

  // Auth
  const [userId, setUserId]         = useState<string | null>(null);
  const [userEmail, setUserEmail]   = useState("");
  const [brandId, setBrandId]       = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]   = useState("");
  const [authMode, setAuthMode]     = useState<"options" | "signup" | "login">("options");
  const [emailInput, setEmailInput] = useState("");
  const [passInput, setPassInput]   = useState("");

  // Research
  const [researchDone, setRDone]    = useState<number[]>([]);
  const [researchCurrent, setRC]    = useState(0);
  const [researchData, setResearchData] = useState<{
    competitors?: string[];
    social_media?: Record<string, string | null>;
    market_positioning?: string;
    unique_selling_proposition?: string;
    key_features?: string[];
    brand_dna?: { core_values?: string[]; personality_traits?: string[] };
    opportunities?: string[];
  } | null>(null);

  // Pricing + payment
  const [selectedPlan, setSelected]   = useState("");
  const [billingCycle, setBilling]     = useState<"monthly" | "yearly">("monthly");
  const [payLoading, setPayLoading]   = useState(false);
  const [payError, setPayError]       = useState("");

  const go = useCallback((next: number) => {
    setPrevScreen(screen);
    setScreen(next);
  }, [screen]);

  /* ── Load cached form on mount + check existing session ─────────────── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<FormData>;
        setForm(f => ({ ...f, ...saved }));
      }
    } catch { /* ignore */ }

    // Check if user is already logged in (e.g., returning OAuth)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        // If user already has a brand, go straight to dashboard
        const { data: brands } = await supabase
          .from("brand_users")
          .select("brand_id")
          .eq("user_id", session.user.id)
          .limit(1);
        if (brands && brands.length > 0) {
          router.push("/calendar");
        } else {
          setScreen(s => s === 0 ? 1 : s);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        setAuthError("");
        // If user already has a brand, go straight to dashboard
        const { data: brands } = await supabase
          .from("brand_users")
          .select("brand_id")
          .eq("user_id", session.user.id)
          .limit(1);
        if (brands && brands.length > 0) {
          router.push("/calendar");
        } else {
          setScreen(s => s <= 0 ? 1 : s);
        }
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auto-save form to localStorage ────────────────────────────────── */
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(form)); } catch { /* ignore */ }
  }, [form]);

  /* ── Create brand (called during processing) ────────────────────────── */
  const createBrand = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      // Sync userId state if not yet set (e.g. OAuth return race condition)
      if (!userId) setUserId(session.user.id);
      const res = await fetch("/api/brands/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          brand_name: form.brand_name,
          industry: form.industry,
          description: form.description,
          platform_type: form.platform_type,
          platform_url: form.platform_url,
          country: form.country,
          target_audience: form.target_audience,
          whatsapp: form.whatsapp,
        }),
      });
      const data = await res.json();
      if (data.brand_id) { setBrandId(data.brand_id); return data.brand_id; }
    } catch { /* ignore */ }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, form]);

  /* ── Research animation + brand creation ────────────────────────────── */
  useEffect(() => {
    if (screen !== 3) return;
    setRDone([]); setRC(0); setResearchData(null);

    // Coordinate: advance to screen 4 only when BOTH animation AND api complete
    const apiDone = { current: false };
    const animDone = { current: false };
    const tryAdvance = () => { if (apiDone.current && animDone.current) go(4); };

    // Create brand in background
    createBrand();

    // Real API call with 90s timeout
    const controller = new AbortController();
    const apiTimeout = setTimeout(() => { controller.abort(); apiDone.current = true; tryAdvance(); }, 90000);

    fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_name: form.brand_name,
        country: form.country,
        industry: form.industry,
        description: form.description,
        email: userEmail,
      }),
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(data => {
        clearTimeout(apiTimeout);
        if (data?.metadata?.step1_indexed_data) {
          const s1 = data.metadata.step1_indexed_data;
          const s3 = data.metadata.step3_analysis;
          setResearchData({
            competitors: s1.competitors,
            social_media: s1.social_media,
            market_positioning: s1.market_positioning,
            unique_selling_proposition: s1.unique_selling_proposition,
            key_features: s1.key_features,
            brand_dna: s3?.brand_dna,
            opportunities: s3?.competitive_analysis?.opportunities,
          });
        }
        apiDone.current = true;
        tryAdvance();
      })
      .catch(() => {
        clearTimeout(apiTimeout);
        apiDone.current = true;
        tryAdvance();
      });

    // Animation: each step takes ~1.6s, total ~8s for 5 steps
    const timers: ReturnType<typeof setTimeout>[] = [];
    RESEARCH_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setRC(i);
        timers.push(setTimeout(() => {
          setRDone(prev => [...prev, i]);
          if (i === RESEARCH_STEPS.length - 1) {
            timers.push(setTimeout(() => { animDone.current = true; tryAdvance(); }, 800));
          }
        }, 1400));
      }, i * 1600));
    });
    return () => { timers.forEach(clearTimeout); clearTimeout(apiTimeout); controller.abort(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  /* ── Google OAuth (redirects back to /onboarding) ───────────────────── */
  const handleGoogleAuth = async () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(form)); } catch {}
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" },
    });
  };

  /* ── Email signup ────────────────────────────────────────────────────── */
  const handleEmailSignup = async () => {
    if (!emailInput.trim() || !passInput.trim() || authLoading) return;
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signUp({
      email: emailInput.trim(), password: passInput,
      options: { emailRedirectTo: window.location.origin + "/auth/callback" },
    });
    if (error) setAuthError(error.message);
    else setAuthError("✓ Cek email Anda untuk konfirmasi akun, lalu kembali ke sini.");
    setAuthLoading(false);
  };

  /* ── Email login ─────────────────────────────────────────────────────── */
  const handleEmailLogin = async () => {
    if (!emailInput.trim() || !passInput.trim() || authLoading) return;
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(), password: passInput,
    });
    if (error) { setAuthError(error.message); setAuthLoading(false); return; }
    // onAuthStateChange will fire SIGNED_IN and handle redirect/advance
    setAuthLoading(false);
  };

  /* ── Payment ─────────────────────────────────────────────────────────── */
  const handlePayment = async (planId: string) => {
    if (payLoading) return;
    if (!userId) {
      setPayError("Sesi Anda telah berakhir. Silakan muat ulang halaman dan login kembali.");
      return;
    }
    setPayLoading(true); setPayError("");

    // Make sure brand exists
    let bid = brandId;
    if (!bid) bid = await createBrand();
    if (!bid) { setPayError("Gagal membuat profil brand. Coba lagi."); setPayLoading(false); return; }

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_invoice",
          user_id: userId,
          brand_id: bid,
          plan: planId,          // already uppercase: BASIC / PREMIUM / PARTNER
          billing_cycle: billingCycle,
          customer_email: userEmail,
          customer_name: form.brand_name,
        }),
      });
      const data = await res.json();
      const url = data.invoice?.invoice_url || data.invoice_url || data.checkout_url;
      if (url) { try { localStorage.removeItem(LS_KEY); } catch {} window.location.href = url; }
      else { router.push("/getting-started"); }
    } catch {
      setPayError("Gagal memuat halaman pembayaran. Silakan coba lagi.");
    } finally {
      setPayLoading(false);
    }
  };

  const set = (k: keyof FormData) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const dir = screen > prevScreen ? "up" : "down";
  const pct = screen === 1 ? 33 : screen === 2 ? 66 : screen >= 3 ? 100 : 0;
  const group1Valid = !!form.brand_name.trim() && !!form.industry;
  const group2Valid = !!form.country;

  return (
    <div className="h-screen w-screen overflow-hidden relative"
      style={{ background: "white", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Progress bar (form screens 1-2) */}
      {screen >= 1 && screen <= 2 && <ProgressBar pct={pct} />}
      {screen >= 3 && <ProgressBar pct={100} />}

      {/* Logo */}
      <div className="fixed top-5 left-6 z-40 flex items-center gap-2">
        <Image src="/images/geoveralogo.png" alt="GeoVera" width={28} height={28} className="rounded-lg" />
        <span className="text-[15px] font-bold text-[#111827] hidden sm:block">GeoVera</span>
      </div>

      {/* Step counter */}
      {(screen === 1 || screen === 2) && (
        <div className="fixed top-5 right-6 z-40">
          <span className="text-[13px] font-medium text-[#9CA3AF]">Step {screen} / 2</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 0: Welcome + Auth
      ══════════════════════════════════════════════════════════════════ */}
      <Screen visible={screen === 0} direction={dir} scrollable>
        <div className="py-8">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${GV_TEAL}, ${GV_TEAL2})` }}>
              <span className="text-white text-[28px]">✦</span>
            </div>
            <h1 className="text-[28px] sm:text-[36px] font-black text-[#111827] mb-3 leading-tight">
              Jadikan brand Anda<br />
              <span style={{ color: GV_TEAL }}>dikenal oleh AI</span>
            </h1>
            <p className="text-[14px] text-[#6B7280] max-w-[360px] mx-auto leading-relaxed">
              Analisis SEO, GEO & Social Search untuk brand Anda — ditenagai Gemini, Perplexity, dan Llama AI.
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["🔍 SEO & GEO Analysis", "✦ AI Visibility Report", "📈 Monthly Growth Plan"].map(f => (
              <div key={f} className="flex items-center gap-1.5 rounded-[10px] px-3 py-2"
                style={{ background: GV_LIGHT, border: `1px solid ${GV_TEAL}20` }}>
                <span className="text-[12px] font-semibold" style={{ color: GV_TEAL }}>{f}</span>
              </div>
            ))}
          </div>

          {/* ── Auth panel ───────────────────────────────────────────────── */}
          <div className="max-w-[380px] mx-auto">
            {authMode === "options" && (
              <div className="flex flex-col gap-3">
                <button onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-[14px] text-[15px] font-semibold text-[#374151] transition-all hover:bg-[#F3F4F6]"
                  style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}>
                  <GoogleIcon /> Lanjut dengan Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                  <span className="text-[12px] text-[#9CA3AF]">atau</span>
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                </div>

                <button onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                  className="w-full py-3.5 rounded-[14px] text-[15px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${GV_TEAL}, ${GV_TEAL2})` }}>
                  Daftar dengan Email →
                </button>

                <p className="text-center text-[12px] text-[#9CA3AF]">
                  Sudah punya akun?{" "}
                  <button onClick={() => { setAuthMode("login"); setAuthError(""); }}
                    className="font-semibold" style={{ color: GV_TEAL }}>Masuk</button>
                </p>
              </div>
            )}

            {(authMode === "signup" || authMode === "login") && (
              <div className="flex flex-col gap-4">
                <button onClick={() => { setAuthMode("options"); setAuthError(""); }}
                  className="flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151]">
                  ← {authMode === "signup" ? "Daftar" : "Masuk"} dengan opsi lain
                </button>

                <div>
                  <FieldLabel text="Email" />
                  <InlineInput value={emailInput} onChange={setEmailInput} placeholder="nama@email.com"
                    type="email" autoFocus
                    onEnter={() => authMode === "signup" ? handleEmailSignup() : handleEmailLogin()} />
                </div>
                <div>
                  <FieldLabel text="Password" />
                  <InlineInput value={passInput} onChange={setPassInput}
                    placeholder={authMode === "signup" ? "Minimal 8 karakter" : "Password Anda"}
                    type="password"
                    onEnter={() => authMode === "signup" ? handleEmailSignup() : handleEmailLogin()} />
                </div>

                {authError && (
                  <p className="text-[13px] rounded-[8px] px-3 py-2"
                    style={{
                      background: authError.startsWith("✓") ? "#F0FDF4" : "#FEF2F2",
                      color: authError.startsWith("✓") ? "#16A34A" : "#EF4444",
                    }}>
                    {authError}
                  </p>
                )}

                <button
                  onClick={authMode === "signup" ? handleEmailSignup : handleEmailLogin}
                  disabled={authLoading || !emailInput.trim() || !passInput.trim()}
                  className="w-full py-3.5 rounded-[14px] text-[15px] font-bold text-white flex items-center justify-center gap-2"
                  style={{
                    background: authLoading || !emailInput.trim() || !passInput.trim()
                      ? "#E5E7EB"
                      : `linear-gradient(135deg, ${GV_TEAL}, ${GV_TEAL2})`,
                    color: authLoading || !emailInput.trim() || !passInput.trim() ? "#9CA3AF" : "white",
                    cursor: authLoading ? "not-allowed" : "pointer",
                  }}>
                  {authLoading
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        {authMode === "signup" ? "Mendaftar…" : "Masuk…"}</>
                    : authMode === "signup" ? "Buat Akun →" : "Masuk →"}
                </button>

                {authMode === "signup" ? (
                  <p className="text-center text-[12px] text-[#9CA3AF]">
                    Sudah punya akun?{" "}
                    <button onClick={() => { setAuthMode("login"); setAuthError(""); }}
                      className="font-semibold" style={{ color: GV_TEAL }}>Masuk</button>
                  </p>
                ) : (
                  <p className="text-center text-[12px] text-[#9CA3AF]">
                    Belum punya akun?{" "}
                    <button onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                      className="font-semibold" style={{ color: GV_TEAL }}>Daftar gratis</button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Screen>

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 1: Brand Info
      ══════════════════════════════════════════════════════════════════ */}
      <Screen visible={screen === 1} direction={dir} scrollable>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: GV_LIGHT, color: GV_TEAL }}>Brand Info</span>
          {userEmail && (
            <span className="text-[11px] text-[#9CA3AF] truncate max-w-[160px]">· {userEmail}</span>
          )}
        </div>
        <h2 className="text-[20px] sm:text-[24px] font-bold text-[#111827] mb-6">Ceritakan tentang brand Anda</h2>

        <div className="mb-6">
          <FieldLabel text="1 · Nama Brand *" />
          <InlineInput value={form.brand_name} onChange={set("brand_name")}
            placeholder="cth. Kopi Kenangan" autoFocus={screen === 1} />
        </div>

        <div className="mb-6">
          <FieldLabel text="2 · Industri *" />
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(ind => {
              const on = form.industry === ind;
              return (
                <button key={ind} onClick={() => set("industry")(on ? "" : ind)}
                  className="rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition-all"
                  style={{
                    background: on ? GV_LIGHT : "#F9FAFB",
                    border: `1.5px solid ${on ? GV_TEAL : "#E5E7EB"}`,
                    color: on ? GV_TEAL : "#374151",
                  }}>
                  {on ? "✓ " : ""}{ind}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <FieldLabel text="3 · Deskripsi Brand (maks. 1000 karakter)" />
          <CompactTextarea value={form.description} onChange={set("description")} rows={4} maxLength={1000}
            placeholder="Apa yang Anda jual? Apa yang membuat Anda berbeda dari kompetitor?" />
        </div>

        <div className="flex items-center gap-3 pb-4">
          <ContinueBtn onClick={() => go(2)} disabled={!group1Valid} label="Lanjut ke Step 2 →" />
          {!group1Valid && <span className="text-[12px] text-[#9CA3AF]">Lengkapi nama & industri</span>}
        </div>
      </Screen>

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 2: Presence & Audience
      ══════════════════════════════════════════════════════════════════ */}
      <Screen visible={screen === 2} direction={dir} scrollable>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: GV_LIGHT, color: GV_TEAL }}>Presence & Audience</span>
        </div>
        <h2 className="text-[20px] sm:text-[24px] font-bold text-[#111827] mb-6">Di mana brand Anda hadir?</h2>

        {/* Platform */}
        <div className="mb-6">
          <FieldLabel text="4 · Platform Utama" />
          <div className="flex gap-2 mb-3 flex-wrap">
            {(["web", "tiktok", "instagram"] as PlatformType[]).map(pt => {
              const icons: Record<PlatformType, string> = { web: "🌐", tiktok: "🎵", instagram: "📸" };
              const labels: Record<PlatformType, string> = { web: "Website", tiktok: "TikTok", instagram: "Instagram" };
              const on = form.platform_type === pt;
              return (
                <button key={pt} onClick={() => setForm(f => ({ ...f, platform_type: pt, platform_url: "" }))}
                  className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[13px] font-semibold transition-all"
                  style={{
                    background: on ? GV_LIGHT : "#F9FAFB",
                    border: `2px solid ${on ? GV_TEAL : "#F3F4F6"}`,
                    color: on ? GV_TEAL : "#374151",
                  }}>
                  {icons[pt]} {labels[pt]}
                </button>
              );
            })}
          </div>
          {form.platform_type === "web"
            ? <InlineInput value={form.platform_url} onChange={set("platform_url")} placeholder="https://yourbrand.com" type="url" />
            : <InlineInput value={form.platform_url}
                onChange={v => set("platform_url")(v.replace(/^@/, ""))}
                placeholder="@yourbrand"
                prefix={form.platform_type === "tiktok" ? "tiktok.com/@" : "instagram.com/"} />
          }
        </div>

        {/* Country */}
        <div className="mb-6">
          <FieldLabel text="5 · Negara *" />
          <CountrySelect value={form.country} onChange={set("country")} />
        </div>

        {/* Target Audience */}
        <div className="mb-6">
          <FieldLabel text="6 · Target Audiens" />
          <CompactTextarea value={form.target_audience} onChange={set("target_audience")} rows={3} maxLength={500}
            placeholder="cth. Perempuan 20-35 tahun, kota besar, aktif di Instagram, tertarik fashion & lifestyle…" />
        </div>

        {/* WhatsApp */}
        <div className="mb-8">
          <FieldLabel text="7 · WhatsApp Bisnis" />
          <InlineInput value={form.whatsapp} onChange={v => set("whatsapp")(v.replace(/[^0-9]/g, ""))}
            placeholder="81234567890" type="tel" prefix="+62" />
        </div>

        <div className="flex items-center gap-3 pb-4">
          <ContinueBtn onClick={() => go(3)} disabled={!group2Valid} label="Mulai Analisis →" />
          {!group2Valid && <span className="text-[12px] text-[#9CA3AF]">Pilih negara terlebih dahulu</span>}
        </div>
      </Screen>

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 3: Processing
      ══════════════════════════════════════════════════════════════════ */}
      <Screen visible={screen === 3} direction={dir}>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${GV_TEAL}, ${GV_TEAL2})` }}>
            <span className="text-white text-[24px]">✦</span>
          </div>
          <h2 className="text-[22px] font-bold text-[#111827]">
            Menganalisis <span style={{ color: GV_TEAL }}>{form.brand_name || "brand Anda"}</span>…
          </h2>
          <p className="text-[14px] text-[#6B7280] mt-2">Memindai berbagai sumber AI intelligence</p>
        </div>

        <div className="mb-5">
          <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(researchDone.length / RESEARCH_STEPS.length) * 100}%`,
                background: `linear-gradient(90deg, ${GV_TEAL}, ${GV_TEAL2})` }} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {RESEARCH_STEPS.map((step, i) => {
            const isDone = researchDone.includes(i);
            const isActive = researchCurrent === i && !isDone;
            return (
              <div key={i} className="flex items-center gap-3 rounded-[12px] px-4 py-3 transition-all duration-300"
                style={{
                  background: isDone ? "#F0FDF4" : isActive ? "#F0F9FF" : "#F9FAFB",
                  border: `1.5px solid ${isDone ? "#86EFAC" : isActive ? "#BAE6FD" : "transparent"}`,
                  opacity: !isDone && !isActive && i > researchCurrent ? 0.3 : 1,
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                  style={{ background: step.color + "18", color: step.color }}>
                  {isDone ? "✓" : isActive
                    ? <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin block" />
                    : step.engine}
                </div>
                <span className="text-[14px] font-medium text-[#374151]">{step.label}</span>
                {isDone && <span className="ml-auto text-[12px] font-semibold text-[#16A34A]">Selesai</span>}
              </div>
            );
          })}
        </div>
      </Screen>

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 4: Results / Thank You
      ══════════════════════════════════════════════════════════════════ */}
      <Screen visible={screen === 4} direction={dir}>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5"
          style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span className="text-[12px] font-bold text-[#16A34A]">Analisis Selesai!</span>
        </div>

        <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111827] mb-2">
          Peluang ditemukan untuk{" "}
          <span style={{ color: GV_TEAL }}>{form.brand_name}</span>!
        </h2>
        <p className="text-[14px] text-[#6B7280] mb-5">
          {userEmail
            ? <>Laporan lengkap telah dikirim ke <strong>{userEmail}</strong>.</>
            : "Laporan brand intelligence siap untuk Anda."}
        </p>

        {/* Insight pills — real data from API or fallback */}
        <div className="flex flex-wrap gap-2 mb-7">
          {(() => {
            const pills: { label: string; color: string }[] = [];
            if (researchData) {
              const compCount = researchData.competitors?.length ?? 0;
              if (compCount > 0) pills.push({ label: `${compCount} Kompetitor Terdeteksi`, color: "#F59E0B" });
              const socialGaps = ["instagram", "tiktok", "facebook", "youtube"].filter(p => !researchData.social_media?.[p]);
              if (socialGaps.length > 0) pills.push({ label: `${socialGaps.length} Platform Gaps`, color: "#EF4444" });
              else if (compCount === 0) pills.push({ label: "8 Authority Gaps", color: "#EF4444" });
              const trait = researchData.brand_dna?.personality_traits?.[0];
              if (trait) pills.push({ label: `Brand Voice: ${trait}`, color: "#8E6FD8" });
              else pills.push({ label: "AI Search: Belum terindeks", color: "#8E6FD8" });
              pills.push({ label: "Growth Potential: Tinggi", color: "#10B981" });
              const opp = researchData.opportunities?.[0];
              if (opp) pills.push({ label: opp.length > 28 ? opp.slice(0, 28) + "…" : opp, color: "#3D6B68" });
            } else {
              pills.push(
                { label: "AI Search: Belum terindeks", color: "#8E6FD8" },
                { label: "8 Authority Gaps", color: "#EF4444" },
                { label: "Growth Potential: Tinggi", color: "#10B981" },
                { label: "Competitor gap terdeteksi", color: "#F59E0B" },
              );
            }
            return pills.map(ins => (
              <span key={ins.label} className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{ background: ins.color + "12", color: ins.color, border: `1px solid ${ins.color}25` }}>
                {ins.label}
              </span>
            ));
          })()}
        </div>

        {/* Market positioning snippet if available */}
        {researchData?.market_positioning && (
          <div className="rounded-xl px-4 py-3 mb-5 text-[13px] text-[#374151]"
            style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
            <span className="font-semibold text-[#16A34A]">✓ Posisi Pasar: </span>
            {researchData.market_positioning}
          </div>
        )}

        {/* Competitors preview if available */}
        {researchData?.competitors && researchData.competitors.length > 0 && (
          <div className="rounded-xl px-4 py-3 mb-5"
            style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#92400E] mb-2">Kompetitor Utama</p>
            <div className="flex flex-wrap gap-1.5">
              {researchData.competitors.slice(0, 4).map(c => (
                <span key={c} className="text-[12px] font-medium text-[#92400E] rounded-full px-2.5 py-1"
                  style={{ background: "#FEF3C7" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 max-w-[380px]">
          <ContinueBtn onClick={() => go(5)} label="Lihat Paket Harga →" full />
          <button onClick={() => router.push("/getting-started")}
            className="text-center text-[13px] text-[#9CA3AF] hover:text-[#374151] py-1">
            Lewati, masuk ke dashboard
          </button>
        </div>
      </Screen>

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 5: Pricing
      ══════════════════════════════════════════════════════════════════ */}
      <Screen visible={screen === 5} direction={dir} scrollable>
        <div className="py-2">
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111827] mb-1">Pilih Paket Anda</h2>
            <p className="text-[13px] text-[#6B7280]">7 hari trial gratis · Batalkan kapan saja</p>
          </div>

          {/* Billing toggle — DS style pill */}
          <div className="flex justify-center mb-2">
            <div className="relative inline-flex p-1 rounded-full" style={{ background: "#F3F4F6" }}>
              <span className="absolute top-1/2 -translate-y-1/2 h-9 w-[108px] rounded-full bg-white transition-all duration-200"
                style={{
                  boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                  transform: `translateY(-50%) translateX(${billingCycle === "yearly" ? "108px" : "0px"})`,
                }} />
              {(["monthly", "yearly"] as const).map(c => (
                <button key={c} onClick={() => setBilling(c)}
                  className="relative z-10 flex h-9 w-[108px] items-center justify-center gap-1.5 text-[13px] font-medium transition-colors"
                  style={{ color: billingCycle === c ? "#111827" : "#9CA3AF" }}>
                  {c === "monthly" ? "Bulanan" : "Tahunan"}
                  {c === "yearly" && (
                    <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black text-white"
                      style={{ background: "#16A34A" }}>-8%</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {billingCycle === "yearly" && (
            <p className="text-center text-[11px] font-semibold mb-4" style={{ color: "#16A34A" }}>
              🎁 Hemat 1 bulan gratis dengan bayar tahunan!
            </p>
          )}

          {/* Pricing cards — DS style */}
          <div className="flex flex-col gap-4 mb-5">
            {PRICING_PLANS.map(plan => {
              const isSel = selectedPlan === plan.id;
              const isDark = !!plan.highlight;
              const dispPrice = billingCycle === "monthly" ? plan.price_mo : plan.price_yr_mo;
              return (
                <div key={plan.id} className="relative" style={{ paddingTop: plan.highlight ? "14px" : "0" }}>
                  {plan.highlight && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 rounded-full px-3 py-1 text-[10px] font-black tracking-widest text-white whitespace-nowrap"
                      style={{ background: GV_TEAL }}>
                      MOST POPULAR
                    </div>
                  )}
                  <button onClick={() => setSelected(isSel ? "" : plan.id)}
                    className="w-full text-left rounded-2xl p-6 transition-all"
                    style={{
                      background: isDark ? "#1A2B28" : "white",
                      border: isDark ? "none" : isSel ? `2px solid ${GV_TEAL}` : "1.5px solid #E5E7EB",
                      boxShadow: isDark
                        ? "0 8px 24px rgba(61,107,104,0.25)"
                        : isSel ? `0 0 0 4px ${GV_TEAL}18` : "0 1px 4px rgba(0,0,0,0.05)",
                    }}>

                    {/* Plan name */}
                    <span className="block text-[15px] font-semibold mb-3"
                      style={{ color: isDark ? "white" : "#111827" }}>
                      {plan.name}
                    </span>

                    {/* Price */}
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-[42px] font-black leading-none"
                        style={{ color: isDark ? "white" : "#111827" }}>
                        {dispPrice}jt
                      </span>
                      <span className="text-[13px] pb-1.5"
                        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#9CA3AF" }}>
                        /bln
                      </span>
                    </div>
                    <p className="text-[12px] mb-4"
                      style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#9CA3AF" }}>
                      {billingCycle === "yearly"
                        ? `IDR ${plan.price_yr_total}jt/tahun`
                        : "Ditagih bulanan"}
                    </p>

                    {/* Divider */}
                    <div className="mb-4 h-px"
                      style={{ background: isDark ? "rgba(255,255,255,0.12)" : "#F3F4F6" }} />

                    {/* Features */}
                    <ul className="space-y-2.5 mb-5">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-[13px]"
                          style={{ color: isDark ? "rgba(255,255,255,0.80)" : "#6B7280" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke={isDark ? "white" : GV_TEAL} strokeWidth="2.5" className="flex-shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex w-full items-center justify-center rounded-[10px] h-11 text-[14px] font-semibold transition-all"
                      style={{
                        background: isDark ? "white" : isSel ? GV_TEAL : "#F3F4F6",
                        color: isDark ? "#1A2B28" : isSel ? "white" : "#374151",
                      }}>
                      {isSel ? "✓ Dipilih" : isDark ? "Mulai Sekarang →" : "Pilih Paket"}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Continue */}
          <div className="flex flex-col gap-2 pb-4">
            <ContinueBtn
              onClick={() => selectedPlan && go(6)}
              disabled={!selectedPlan}
              label={selectedPlan
                ? `Lanjut dengan ${PRICING_PLANS.find(p => p.id === selectedPlan)?.name} →`
                : "Pilih paket di atas"}
              full
            />
            <button onClick={() => router.push("/getting-started")}
              className="text-center text-[13px] text-[#9CA3AF] hover:text-[#374151] py-2">
              Lewati, mulai tanpa berlangganan
            </button>
          </div>
        </div>
      </Screen>

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 6: Payment (Xendit)
      ══════════════════════════════════════════════════════════════════ */}
      <Screen visible={screen === 6} direction={dir} scrollable>
        {(() => {
          const plan = PRICING_PLANS.find(p => p.id === selectedPlan);
          if (!plan) return (
            <div className="py-8 text-center">
              <p className="text-[15px] text-[#6B7280] mb-4">Belum ada paket dipilih.</p>
              <button onClick={() => go(5)} className="text-[14px] font-semibold" style={{ color: GV_TEAL }}>
                ← Kembali ke pilihan paket
              </button>
            </div>
          );
          return (
            <div className="py-4">
              <div className="text-center mb-5">
                <h2 className="text-[22px] font-bold text-[#111827] mb-1">Konfirmasi Pembayaran</h2>
                <p className="text-[13px] text-[#6B7280]">Dibayar aman via Xendit · BCA · Mandiri · OVO · DANA · QRIS</p>
              </div>

              {/* Order summary */}
              <div className="rounded-[14px] p-4 mb-5"
                style={{ background: plan.color + "08", border: `1.5px solid ${plan.color}25` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[15px] font-bold text-[#111827]">Paket {plan.name}</span>
                  <span className="text-[14px] font-bold" style={{ color: plan.color }}>
                    {billingCycle === "monthly"
                      ? `IDR ${plan.price_mo}jt/bln`
                      : `IDR ${plan.price_yr_total}jt/thn`}
                  </span>
                </div>
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-[#6B7280] mb-1">
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </div>
                ))}
                <div className="pt-3 mt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-[12px] text-[#6B7280]">
                    Brand: <strong className="text-[#111827]">{form.brand_name}</strong>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: plan.color + "15", color: plan.color }}>
                    7 hari trial gratis
                  </span>
                </div>
              </div>

              {/* Invoice to email */}
              <div className="rounded-[12px] px-4 py-3 mb-5 flex items-center gap-3"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}>
                <span className="text-[18px]">📧</span>
                <div>
                  <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-0.5">Invoice dikirim ke</p>
                  <p className="text-[14px] font-semibold text-[#111827]">{userEmail}</p>
                </div>
              </div>

              {payError && (
                <p className="text-[13px] text-[#EF4444] mb-3 rounded-[8px] px-3 py-2 bg-[#FEF2F2]">{payError}</p>
              )}

              <div className="flex flex-col gap-2 pb-4">
                <button
                  onClick={() => handlePayment(plan.xendit_plan)}
                  disabled={payLoading}
                  className="w-full py-3.5 rounded-[14px] text-[15px] font-bold text-white flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: payLoading ? "#E5E7EB" : `linear-gradient(135deg, ${plan.color}, ${GV_TEAL2})`,
                    color: payLoading ? "#9CA3AF" : "white",
                    cursor: payLoading ? "not-allowed" : "pointer",
                  }}>
                  {payLoading
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Memuat…</>
                    : "Bayar Sekarang →"}
                </button>
                <button onClick={() => go(5)}
                  className="text-center text-[13px] text-[#9CA3AF] hover:text-[#374151] py-1">
                  ← Kembali ke pilihan paket
                </button>
              </div>
            </div>
          );
        })()}
      </Screen>

      {/* ── Back button (form screens 1 & 2 only) ────────────────────────── */}
      {(screen === 1 || screen === 2) && (
        <button onClick={() => go(screen - 1)}
          className="fixed bottom-8 right-8 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "#F3F4F6", color: "#6B7280" }}
          aria-label="Back">
          ↑
        </button>
      )}
    </div>
  );
}
