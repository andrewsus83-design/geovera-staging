"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ── Inline GV icons ── */

const HomeIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22L24 10L40 22M14 20V38H34V20" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" fill="none">
    <rect x="10" y="14" width="28" height="24" rx="6" stroke="currentColor" strokeWidth="2.5" />
    <line x1="10" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="10" x2="16" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="32" y1="10" x2="32" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const StudioIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" fill="none">
    <rect x="10" y="14" width="28" height="20" rx="8" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="4" fill="currentColor" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" fill="none">
    <rect x="12" y="12" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2.5" />
    <path d="M18 30V24M24 30V18M30 30V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const RocketIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" fill="none">
    <path d="M24 8C24 8 14 18 14 28C14 33.5 18.5 38 24 38C29.5 38 34 33.5 34 28C34 18 24 8 24 8Z"
      stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="24" cy="27" r="3" stroke="currentColor" strokeWidth="2.5" />
    <path d="M17 34L12 39M31 34L36 39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" className={className}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ── Nav items ── */
const navItems = [
  { icon: <HomeIcon />,      name: "Home",    path: "/" },
  { icon: <RocketIcon />,    name: "Start",   path: "/getting-started" },
  { icon: <CalendarIcon />,  name: "Tasks",   path: "/calendar" },
  { icon: <StudioIcon />,    name: "Studio",  path: "/content-studio" },
  { icon: <AnalyticsIcon />, name: "Report",  path: "/analytics" },
];

const DEMO_USER = {
  name: "Catharina Celine",
  role: "Brand Manager",
  initials: "CC",
};

/* ══════════════════════════════════════════════════════════════════════════════
   NavColumn — GeoVera Design System v5.1
   • Fixed 72 px — no hover expansion
   • Active item: filled teal circle + label below icon
   • Inactive item: icon only, no label, hover softens bg
   • No shadow / border on selected state
══════════════════════════════════════════════════════════════════════════════ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function NavColumn({ children }: { children?: React.ReactNode } = {}) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [dark, setDark]                 = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const toggleTheme = () => {
    setDark((v) => !v);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-[72px] rounded-[48px] border border-white/60 overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(31,36,40,0.06)",
      }}
    >
      {/* Inner wrapper — 72px wide, centered content */}
      <div className="flex flex-col w-[72px] px-2 py-4 gap-1">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center h-11 mb-2">
          <Image
            src="/images/geoveralogo.png"
            alt="GeoVera"
            width={34}
            height={34}
            className="rounded-xl"
          />
        </div>

        {/* ── Navigation items ── */}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                href={item.path}
                className="flex flex-col items-center justify-center py-1.5 px-1 rounded-[14px] transition-colors duration-200 hover:bg-[#F3F4F6]"
              >
                {/* Circle icon container */}
                <span
                  className={[
                    "w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200",
                    active
                      ? "bg-[#EDF5F4] text-[#5F8F8B]"
                      : "text-[#6B7280]",
                  ].join(" ")}
                >
                  {item.icon}
                </span>

                {/* Label — always rendered, visible only when active */}
                <span
                  className={[
                    "text-[10px] font-semibold leading-none mt-1 transition-all duration-200",
                    active ? "text-[#5F8F8B] opacity-100" : "opacity-0 h-0 mt-0 overflow-hidden",
                  ].join(" ")}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── Flexible spacer ── */}
        <div className="flex-1 min-h-[16px]" />

        {/* ── Bottom: user + theme ── */}
        <div className="flex flex-col gap-1" ref={menuRef}>

          {/* User popup menu (appears above) */}
          {showUserMenu && (
            <div
              className="mb-1 rounded-[16px] overflow-hidden"
              style={{
                border: "1px solid #E5E7EB",
                background: "white",
                boxShadow: "0 8px 24px rgba(31,36,40,0.10)",
                // Position to the right of the sidebar
                position: "absolute",
                left: "80px",
                bottom: "60px",
                width: "180px",
              }}
            >
              <div className="px-3 py-2.5" style={{ borderBottom: "1px solid #F3F4F6" }}>
                <p className="text-[13px] font-semibold text-[#1F2428] leading-tight">{DEMO_USER.name}</p>
                <p className="text-[11px] text-[#9CA3AF] leading-tight mt-0.5">{DEMO_USER.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogoutIcon />
                Log out
              </button>
            </div>
          )}

          {/* User avatar button */}
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className={[
              "flex flex-col items-center justify-center py-1.5 px-1 rounded-[14px] transition-colors duration-200",
              showUserMenu ? "bg-[#EDF5F4]" : "hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            <span className="w-9 h-9 flex items-center justify-center rounded-full bg-pink-500 text-white text-[11px] font-bold tracking-wide">
              {DEMO_USER.initials}
            </span>
            {showUserMenu && (
              <ChevronIcon className="text-[#9CA3AF] mt-0.5 rotate-180" />
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full h-9 rounded-[14px] text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#4A545B] transition-colors"
          >
            {dark ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}
