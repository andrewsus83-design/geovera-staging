"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ── Inline GV icons (from GeoVera_40_Icon_Master_Pack_48px_SVG, converted to currentColor) ── */

const HomeIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22L24 10L40 22M14 20V38H34V20" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" fill="none">
    <rect x="10" y="14" width="28" height="24" rx="6" stroke="currentColor" strokeWidth="2.5" />
    <line x1="10" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="10" x2="16" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="32" y1="10" x2="32" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const StudioIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" fill="none">
    <rect x="10" y="14" width="28" height="20" rx="8" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="4" fill="currentColor" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" fill="none">
    <rect x="12" y="12" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2.5" />
    <path d="M18 30V24M24 30V18M30 30V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" className={className}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ── Nav items ── */
const navItems = [
  { icon: <HomeIcon />,      name: "Home",               path: "/" },
  { icon: <CalendarIcon />,  name: "Calendar",            path: "/calendar" },
  { icon: <StudioIcon />,    name: "Content Studio",      path: "/content-studio" },
  { icon: <AnalyticsIcon />, name: "Report & Analytics",  path: "/analytics" },
];

const DEMO_USER = {
  name: "Catharina Celine",
  role: "Brand Manager",
  initials: "CC",
};

/* ══════════════════════════════════════════════════════════════════════════════
   NavColumn — GeoVera Design System v5 Floating Pill Sidebar
   • Collapsed: 72 px wide, icon-only
   • Hover-expanded: 240 px wide, icons + labels
   • Glass morphism: backdrop-blur, rgba white bg
   • Active item: teal bg pill with soft glow ring
   • children prop accepted but not rendered (v5 moves page content to center)
══════════════════════════════════════════════════════════════════════════════ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function NavColumn({ children }: { children?: React.ReactNode } = {}) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [dark, setDark]           = useState(false);
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
    /**
     * Floating pill sidebar — fixed to left edge, vertically centered.
     * Width transitions from 72 → 240 px on hover.
     * group/sidebar propagates hover state to children.
     */
    <nav
      className={[
        "group/sidebar",
        "fixed left-4 top-1/2 -translate-y-1/2 z-50",
        "w-[72px] hover:w-[240px]",
        "transition-[width] duration-300 ease-out",
        "rounded-[48px]",
        "border border-white/60",
        "overflow-hidden",
      ].join(" ")}
      style={{
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(31,36,40,0.06)",
      }}
    >
      {/* Inner wrapper — fixed 240 px wide so layout doesn't shift */}
      <div className="flex flex-col w-[240px] px-3 py-4 gap-1">

        {/* ── Logo row ── */}
        <div className="flex items-center gap-3 h-12 px-1.5 mb-2">
          <Image
            src="/images/geoveralogo.png"
            alt="GeoVera"
            width={34}
            height={34}
            className="flex-shrink-0 rounded-xl"
          />
          <span
            className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75 whitespace-nowrap text-[17px] font-bold text-[#1F2428] leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            GeoVera
          </span>
        </div>

        {/* ── Navigation items ── */}
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                href={item.path}
                className={[
                  "flex items-center gap-3 w-full h-12 px-2",
                  "rounded-[10px] transition-all duration-200",
                  active
                    ? "bg-[#EDF5F4] text-[#5F8F8B]"
                    : "text-[#4A545B] hover:bg-[#F3F4F6] hover:text-[#1F2428]",
                ].join(" ")}
                style={active ? {
                  border: "1px solid rgba(95,143,139,0.3)",
                  boxShadow: "0 0 0 3px rgba(95,143,139,0.10)",
                } : {}}
              >
                {/* Icon — always visible */}
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {item.icon}
                </span>
                {/* Label — fades in on hover */}
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75 whitespace-nowrap text-[14px] font-[550] leading-none">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── Flexible spacer ── */}
        <div className="flex-1 min-h-[16px]" />

        {/* ── Bottom section: user + theme ── */}
        <div className="flex flex-col gap-0.5" ref={menuRef}>

          {/* User popup menu (appears above) */}
          {showUserMenu && (
            <div
              className="mb-1 rounded-[16px] overflow-hidden"
              style={{
                border: "1px solid #E5E7EB",
                background: "white",
                boxShadow: "0 8px 24px rgba(31,36,40,0.10)",
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

          {/* User card button */}
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className={[
              "flex items-center gap-2.5 w-full h-12 px-2",
              "rounded-[10px] transition-all duration-200",
              showUserMenu
                ? "bg-[#EDF5F4]"
                : "hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            {/* Avatar */}
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-pink-500 text-white text-[11px] font-bold tracking-wide">
              {DEMO_USER.initials}
            </span>
            {/* Info — fades in */}
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75 flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-[#1F2428] truncate leading-tight">{DEMO_USER.name}</p>
              <p className="text-[11px] text-[#9CA3AF] truncate leading-tight mt-0.5">{DEMO_USER.role}</p>
            </div>
            {/* Chevron */}
            <ChevronIcon
              className={[
                "opacity-0 group-hover/sidebar:opacity-100 transition-all duration-200 text-[#9CA3AF] flex-shrink-0",
                showUserMenu ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 w-full h-11 px-2 rounded-[10px] text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#4A545B] transition-colors"
          >
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {dark ? <MoonIcon /> : <SunIcon />}
            </span>
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75 text-[13px] font-medium whitespace-nowrap">
              {dark ? "Dark Mode" : "Light Mode"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
