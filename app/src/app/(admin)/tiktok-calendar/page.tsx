"use client";
import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ThreeColumnLayout from "@/components/shared/ThreeColumnLayout";
import NavColumn from "@/components/shared/NavColumn";

// ── Config ────────────────────────────────────────────────────────────────────
const TIKTOK_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || "";
const TIKTOK_REDIRECT_URI =
  process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI ||
  "https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/tiktok-oauth-callback";
const DEMO_BRAND_ID =
  process.env.NEXT_PUBLIC_DEMO_BRAND_ID || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";

// ── Types ─────────────────────────────────────────────────────────────────────
type PostStatus = "draft" | "scheduled" | "published" | "failed";

type TikTokPost = {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  title: string;
  caption: string;
  hashtags: string[];
  status: PostStatus;
  duration: string;
  videoUrl?: string;
  accentColor: string;
};

// ── Demo Posts (February 2026) ────────────────────────────────────────────────
const DEMO_POSTS: TikTokPost[] = [
  {
    id: "tt1",
    date: "2026-02-24",
    time: "09:00",
    title: "5 Cara Tingkatkan Engagement Brand di TikTok",
    caption:
      "Brand kamu stuck di bawah 1000 followers? Ini 5 cara yang terbukti meningkatkan engagement TikTok untuk brand UMKM Indonesia! 🚀✨",
    hashtags: [
      "#TikTokBrand",
      "#UMKM",
      "#BrandIndonesia",
      "#ContentMarketing",
      "#GeoVera",
      "#TipsMarketing",
    ],
    status: "published",
    duration: "45s",
    accentColor: "#FF0050",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "tt2",
    date: "2026-02-25",
    time: "11:00",
    title: "Strategi Konten TikTok untuk UMKM Indonesia",
    caption:
      "Mau viral di TikTok tapi nggak tahu harus mulai dari mana? Simak strategi konten yang kami gunakan untuk brand-brand lokal Indonesia 🇮🇩",
    hashtags: [
      "#StrategiKonten",
      "#TikTokMarketing",
      "#BrandLokal",
      "#DigitalMarketing",
      "#GeoVera",
    ],
    status: "scheduled",
    duration: "60s",
    accentColor: "#010101",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "tt3",
    date: "2026-02-26",
    time: "14:00",
    title: "Behind the Scenes: AI Generate Konten Viral",
    caption:
      "Ini dia rahasia bagaimana GeoVera menggunakan AI untuk generate konten yang relevan dan engaging untuk brand kamu. Semua dalam hitungan menit! ⚡🤖",
    hashtags: [
      "#AIMarketing",
      "#BehindTheScenes",
      "#ContentCreation",
      "#TechStartup",
      "#GeoVera",
    ],
    status: "scheduled",
    duration: "30s",
    accentColor: "#25F4EE",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "tt4",
    date: "2026-02-27",
    time: "16:00",
    title: "3 Brand Lokal yang Viral Karena Konten TikTok",
    caption:
      "Siapa sangka 3 brand lokal ini bisa bersaing dengan brand global hanya lewat konten TikTok yang tepat? Pelajari rahasianya! 🌟💡",
    hashtags: [
      "#BrandLokal",
      "#ViralTikTok",
      "#IndonesianBrand",
      "#MarketingInspiration",
      "#GeoVera",
    ],
    status: "scheduled",
    duration: "50s",
    accentColor: "#FE2C55",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "tt5",
    date: "2026-02-28",
    time: "10:00",
    title: "Brand Lokal vs Brand Global: Siapa Menang?",
    caption:
      "Gimana brand lokal bisa bersaing dengan brand global di TikTok? Ada keunggulan unik yang hanya dimiliki brand Indonesia! 🏆",
    hashtags: [
      "#BrandLokal",
      "#BrandGlobal",
      "#TikTokStrategy",
      "#MarketingIndonesia",
      "#GeoVera",
    ],
    status: "draft",
    duration: "55s",
    accentColor: "#69C9D0",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function todayStr() {
  const n = new Date();
  return toDateStr(n.getFullYear(), n.getMonth(), n.getDate());
}

// ── PKCE ─────────────────────────────────────────────────────────────────────
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  const verifier = btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return { verifier, challenge };
}

// ── TikTok SVG icon ───────────────────────────────────────────────────────────
const TikTokIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z" />
  </svg>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PostStatus }) {
  const map: Record<PostStatus, { cls: string; label: string }> = {
    published: { cls: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400", label: "✓ Published" },
    scheduled:  { cls: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",   label: "⏰ Scheduled" },
    draft:      { cls: "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400", label: "Draft" },
    failed:     { cls: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",       label: "⚠ Failed" },
  };
  const { cls, label } = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniMonthCalendar({
  year, month, selectedDate, postDates, onSelect,
}: {
  year: number; month: number; selectedDate: string | null;
  postDates: Set<string>; onSelect: (d: string) => void;
}) {
  const days = getDaysInMonth(year, month);
  const first = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [...Array(first).fill(null)];
  for (let d = 1; d <= days; d++) cells.push(d);
  const today = todayStr();

  return (
    <div className="pt-1">
      <div className="grid grid-cols-7 mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-gray-400 text-center">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = toDateStr(year, month, day);
          const hasPost = postDates.has(ds);
          const isSel = selectedDate === ds;
          const isToday = ds === today;
          return (
            <button
              key={i}
              onClick={() => onSelect(ds)}
              className={`relative mx-auto w-6 h-6 rounded-full text-[10px] flex items-center justify-center transition-colors ${
                isSel
                  ? "bg-[#FE2C55] text-white font-bold"
                  : isToday
                  ? "bg-brand-50 text-brand-600 font-semibold dark:bg-brand-500/10 dark:text-brand-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
              }`}
            >
              {day}
              {hasPost && (
                <span
                  className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSel ? "bg-white" : "bg-[#FE2C55]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Phone Mockup ──────────────────────────────────────────────────────────────
function TikTokPhoneMockup({
  post, caption, hashtags,
}: {
  post: TikTokPost; caption: string; hashtags: string[];
}) {
  return (
    <div className="flex justify-center py-3">
      <div
        className="relative w-[160px] h-[284px] rounded-[20px] overflow-hidden shadow-2xl border-[3px] border-gray-800"
        style={{ background: "#000" }}
      >
        {/* Gradient bg simulating video */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${post.accentColor}99 0%, #000 60%)`,
          }}
        />
        {/* Play icon watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white/50 text-lg ml-0.5">▶</span>
          </div>
        </div>

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 flex justify-between items-start px-2 pt-2">
          <span className="text-white/70 text-[7px] font-medium">Following  |  For You</span>
          <span className="text-white/70 text-[9px]">🔍</span>
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 inset-x-0 px-2 pb-8">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-4 h-4 rounded-full bg-gray-500 border border-gray-400 flex-shrink-0" />
            <span className="text-white text-[8px] font-bold">@geovera.id</span>
          </div>
          <p className="text-white text-[7px] leading-tight line-clamp-3 mb-1">{caption}</p>
          <p className="text-[#25F4EE] text-[7px] leading-tight truncate">
            {hashtags.slice(0, 3).join(" ")}
          </p>
        </div>

        {/* Side actions */}
        <div className="absolute right-1.5 bottom-10 flex flex-col items-center gap-2.5">
          {[
            { icon: "♥", val: "89.4K" },
            { icon: "💬", val: "1.2K" },
            { icon: "↗", val: "Share" },
          ].map(({ icon, val }) => (
            <div key={val} className="flex flex-col items-center">
              <span className="text-white text-[11px]">{icon}</span>
              <span className="text-white/70 text-[6px] mt-0.5">{val}</span>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="absolute bottom-0 inset-x-0 h-7 bg-black/70 flex items-center justify-around px-3">
          {["🏠","🔍","＋","📬","👤"].map((ic, i) => (
            <span key={i} className={`text-[10px] ${i === 2 ? "text-white" : "text-white/50"}`}>{ic}</span>
          ))}
        </div>

        {/* Duration badge */}
        <div className="absolute top-8 right-2 bg-black/50 rounded px-1 py-0.5">
          <span className="text-white text-[7px]">{post.duration}</span>
        </div>
      </div>
    </div>
  );
}

// ── Inner Page ────────────────────────────────────────────────────────────────
function TikTokCalendarInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(1); // 0-indexed; 1 = February

  const [posts,         setPosts]         = useState<TikTokPost[]>(DEMO_POSTS);
  const [selectedId,    setSelectedId]    = useState<string | null>("tt2");
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [publishing,    setPublishing]    = useState(false);
  const [toast,         setToast]         = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [editCaption,   setEditCaption]   = useState("");
  const [editHashtags,  setEditHashtags]  = useState("");

  // Handle OAuth callback params
  useEffect(() => {
    const tk = searchParams.get("tiktok_connected");
    const err = searchParams.get("error");
    if (tk === "true") {
      setTiktokConnected(true);
      showToast("success", "TikTok account connected successfully!");
      router.replace("/tiktok-calendar");
    } else if (err) {
      showToast("error", `Connection failed: ${decodeURIComponent(err)}`);
      router.replace("/tiktok-calendar");
    }
  }, [searchParams]); // eslint-disable-line

  // Sync edit fields when selected post changes
  const selectedPost = posts.find((p) => p.id === selectedId) ?? null;
  useEffect(() => {
    if (selectedPost) {
      setEditCaption(selectedPost.caption);
      setEditHashtags(selectedPost.hashtags.join(" "));
    }
  }, [selectedId]); // eslint-disable-line

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  // Derived data
  const postDates    = useMemo(() => new Set(posts.map((p) => p.date)), [posts]);
  const postsByDate  = useMemo(() => {
    const m: Record<string, TikTokPost[]> = {};
    posts.forEach((p) => { (m[p.date] ??= []).push(p); });
    return m;
  }, [posts]);

  // Month navigation
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Calendar cells
  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [...Array(getFirstDayOfMonth(year, month)).fill(null)];
    for (let d = 1; d <= getDaysInMonth(year, month); d++) cells.push(d);
    return cells;
  }, [year, month]);

  // Connect TikTok OAuth
  const handleConnectTikTok = useCallback(async () => {
    const { verifier, challenge } = await generatePKCE();
    sessionStorage.setItem("tiktok_code_verifier", verifier);

    const params = new URLSearchParams({
      client_key:            TIKTOK_CLIENT_KEY || "aw_demo_key",
      response_type:         "code",
      scope:                 "user.info.basic,video.publish,video.upload",
      redirect_uri:          TIKTOK_REDIRECT_URI,
      state:                 `${DEMO_BRAND_ID}:tiktok-calendar`,
      code_challenge:        challenge,
      code_challenge_method: "S256",
    });
    window.location.href = `https://www.tiktok.com/v2/auth/authorize/?${params}`;
  }, []);

  // Publish to TikTok
  const handlePublish = useCallback(async () => {
    if (!selectedPost) return;
    if (!tiktokConnected) { handleConnectTikTok(); return; }

    setPublishing(true);
    try {
      const res = await fetch("/api/tiktok/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId:   selectedPost.id,
          caption:  `${editCaption}\n\n${editHashtags}`.trim(),
          videoUrl: selectedPost.videoUrl,
          brandId:  DEMO_BRAND_ID,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === selectedPost.id ? { ...p, status: "published" as PostStatus } : p
          )
        );
        showToast("success", "✅ Post sent to TikTok! Open TikTok app to review and publish.");
      } else {
        showToast("error", data.error || "Publish failed — check logs.");
      }
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setPublishing(false);
    }
  }, [selectedPost, tiktokConnected, editCaption, editHashtags, handleConnectTikTok]);

  // ── LEFT COLUMN ───────────────────────────────────────────────────────────
  const leftCol = (
    <NavColumn>
      <div className="space-y-4">
        {/* TikTok connection card */}
        <div className={`rounded-xl p-3 border ${
          tiktokConnected
            ? "border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10"
            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-white/[0.03]"
        }`}>
          <div className="flex items-center gap-2 mb-2.5">
            <TikTokIcon size={16} className={tiktokConnected ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-300"} />
            <span className="text-xs font-semibold text-gray-800 dark:text-white">TikTok Account</span>
          </div>
          {tiktokConnected ? (
            <div>
              <p className="text-[11px] font-semibold text-green-700 dark:text-green-400">✓ Connected</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">@geovera.id</p>
            </div>
          ) : (
            <button
              onClick={handleConnectTikTok}
              className="w-full rounded-lg bg-black text-white text-[11px] font-semibold py-2 flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors"
            >
              <TikTokIcon size={12} />
              Connect TikTok
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-1">
            {MONTH_NAMES[month]}
          </p>
          {(
            [
              { label: "Scheduled", status: "scheduled", color: "text-blue-600 dark:text-blue-400" },
              { label: "Published",  status: "published",  color: "text-green-600 dark:text-green-400" },
              { label: "Draft",      status: "draft",      color: "text-gray-500 dark:text-gray-400" },
            ] as const
          ).map(({ label, status, color }) => (
            <div key={label} className="flex items-center justify-between px-1 py-0.5">
              <span className="text-[11px] text-gray-600 dark:text-gray-400">{label}</span>
              <span className={`text-[12px] font-bold ${color}`}>
                {posts.filter((p) => p.status === status).length}
              </span>
            </div>
          ))}
        </div>

        {/* Mini calendar */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {MONTH_NAMES[month]} {year}
            </p>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs">‹</button>
              <button onClick={nextMonth} className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs">›</button>
            </div>
          </div>
          <MiniMonthCalendar
            year={year}
            month={month}
            selectedDate={selectedPost?.date ?? null}
            postDates={postDates}
            onSelect={(dateStr) => {
              const p = posts.find((x) => x.date === dateStr);
              if (p) setSelectedId(p.id);
            }}
          />
        </div>
      </div>
    </NavColumn>
  );

  // ── CENTER COLUMN (Calendar grid) ─────────────────────────────────────────
  const today = todayStr();
  const centerCol = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TikTokIcon size={18} className="text-[#FE2C55]" />
            TikTok Content Calendar
          </h1>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Schedule & publish TikTok content
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/[0.05] text-xs font-bold"
          >
            ‹
          </button>
          <span className="text-xs font-semibold text-gray-800 dark:text-white min-w-[100px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/[0.05] text-xs font-bold"
          >
            ›
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-hidden">
        {calendarCells.map((day, i) => {
          const ds       = day ? toDateStr(year, month, day) : "";
          const dayPosts = day ? (postsByDate[ds] ?? []) : [];
          const isToday  = ds === today;
          return (
            <div
              key={i}
              className={`border-b border-r border-gray-100 dark:border-gray-800 p-1 flex flex-col overflow-hidden ${
                !day ? "bg-gray-50/60 dark:bg-white/[0.01]" : ""
              }`}
            >
              {day && (
                <>
                  <span
                    className={`self-start text-[10px] font-semibold mb-0.5 w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-[#FE2C55] text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {day}
                  </span>
                  {dayPosts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`text-left rounded px-1.5 py-0.5 mb-0.5 w-full text-[9px] leading-tight transition-all ${
                        selectedId === p.id
                          ? "ring-1 ring-[#FE2C55] bg-red-50 dark:bg-[#FE2C55]/10 font-medium"
                          : "bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.08]"
                      }`}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                        style={{ background: p.accentColor }}
                      />
                      <span className="text-gray-700 dark:text-gray-300 truncate">
                        {p.time} · {p.title.split(":")[0].split(",")[0].slice(0, 22)}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {posts.length} posts this month ·{" "}
          {posts.filter((p) => p.status === "scheduled").length} pending
        </span>
        <button className="flex items-center gap-1 rounded-lg bg-[#FE2C55] text-white text-[11px] font-semibold px-3 py-1.5 hover:bg-[#e0264c] transition-colors">
          <span className="text-sm leading-none">+</span> New Post
        </button>
      </div>
    </div>
  );

  // ── RIGHT COLUMN (Post detail) ─────────────────────────────────────────────
  const rightCol = selectedPost ? (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <StatusBadge status={selectedPost.status} />
            <h2 className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white leading-snug">
              {selectedPost.title}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {selectedPost.date} · {selectedPost.time} WIB · {selectedPost.duration}
            </p>
          </div>
          <span
            className="flex-shrink-0 w-3 h-3 rounded-full mt-1.5"
            style={{ background: selectedPost.accentColor }}
          />
        </div>
      </div>

      {/* Phone preview */}
      <TikTokPhoneMockup
        post={selectedPost}
        caption={editCaption}
        hashtags={editHashtags.split(/\s+/)}
      />

      {/* Edit fields */}
      <div className="px-4 pb-6 space-y-3">
        {/* Caption */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Caption
          </label>
          <textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            rows={4}
            className="w-full text-[12px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/30"
          />
          <span className="text-[10px] text-gray-400 float-right">
            {editCaption.length}/2200
          </span>
        </div>

        {/* Hashtags */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Hashtags
          </label>
          <input
            value={editHashtags}
            onChange={(e) => setEditHashtags(e.target.value)}
            className="w-full text-[12px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/30"
            placeholder="#hashtag1 #hashtag2 ..."
          />
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/[0.04] rounded-xl p-3">
          <span className="text-sm">📅</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              {selectedPost.date}
            </p>
            <p className="text-[10px] text-gray-400">at {selectedPost.time} WIB</p>
          </div>
          <button className="text-[11px] text-brand-500 hover:underline font-medium">
            Edit
          </button>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          {!tiktokConnected ? (
            <button
              onClick={handleConnectTikTok}
              className="w-full rounded-xl bg-black text-white font-semibold py-3 text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
            >
              <TikTokIcon size={16} />
              Connect TikTok to Publish
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing || selectedPost.status === "published"}
              className={`w-full rounded-xl font-semibold py-3 text-sm flex items-center justify-center gap-2 transition-colors ${
                selectedPost.status === "published"
                  ? "bg-green-100 text-green-700 cursor-default dark:bg-green-500/10 dark:text-green-400"
                  : publishing
                  ? "bg-[#FE2C55]/60 text-white cursor-wait"
                  : "bg-[#FE2C55] text-white hover:bg-[#e0264c]"
              }`}
            >
              {selectedPost.status === "published"
                ? "✓ Published to TikTok"
                : publishing
                ? "Publishing…"
                : "Publish to TikTok Now"}
            </button>
          )}

          {tiktokConnected && selectedPost.status !== "published" && (
            <button className="w-full rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
              Schedule · {selectedPost.date} {selectedPost.time}
            </button>
          )}
        </div>

        {/* API info badge */}
        <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
          <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">
            📡 TikTok Content Posting API v2
          </p>
          <p className="text-[10px] text-blue-600 dark:text-blue-300 mt-0.5 leading-relaxed">
            Scopes: <code className="font-mono">video.publish</code> ·{" "}
            <code className="font-mono">video.upload</code>
            <br />
            Mode: <code className="font-mono">SEND_TO_USER_INBOX</code>
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-gray-400 dark:text-gray-600">
        <TikTokIcon size={40} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Select a post to view details</p>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <ThreeColumnLayout left={leftCol} center={centerCol} right={rightCol} />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 shadow-lg text-sm font-medium flex items-center gap-2 max-w-sm ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Export with Suspense ──────────────────────────────────────────────────────
export default function TikTokCalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-400 text-sm">
          Loading TikTok Calendar…
        </div>
      }
    >
      <TikTokCalendarInner />
    </Suspense>
  );
}
