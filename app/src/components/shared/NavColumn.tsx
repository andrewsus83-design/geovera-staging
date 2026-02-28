"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  GridIcon,
  CalenderIcon,
  PieChartIcon,
  PencilIcon,
  AiIcon,
  PlugInIcon,
} from "@/icons/index";
import { supabase } from "@/lib/supabase";

interface NavColumnProps {
  children?: React.ReactNode;
}

const navItems = [
  { icon: <GridIcon />,     name: "Home",              path: "/" },
  { icon: <CalenderIcon />, name: "Calendar",          path: "/calendar" },
  { icon: <PencilIcon />,   name: "Content Studio",    path: "/content-studio" },
  { icon: <AiIcon />,       name: "AI Agent",          path: "/ai-agent" },
  { icon: <PlugInIcon />,   name: "Connect",           path: "/connect" },
  { icon: <PieChartIcon />, name: "Report & Analytics", path: "/analytics" },
];

const DEMO_USER = {
  name: "Catharina Celine",
  role: "Brand Manager",
  initials: "CC",
  avatarColor: "bg-pink-500",
};

export default function NavColumn({ children }: NavColumnProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pt-2 pb-2">
        <Image
          src="/images/geoveralogo.png"
          alt="GeoVera"
          width={32}
          height={32}
          className="flex-shrink-0"
        />
        <span
          className="text-xl font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: "Georgia, serif" }}
        >
          GeoVera
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 px-2 pb-2">
        {navItems.map((nav) => (
          <Link
            key={nav.name}
            href={nav.path}
            className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
              isActive(nav.path)
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            }`}
          >
            <span className="w-5 h-5 flex-shrink-0">{nav.icon}</span>
            {nav.name}
          </Link>
        ))}
      </nav>

      {/* Page-specific content below nav */}
      {children && (
        <>
          <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />
          <div className="px-2 pt-2 pb-2">
            {children}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User card — pinned to bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1.5" ref={menuRef}>

        {/* Logout popup — appears above the card */}
        {showUserMenu && (
          <div className="mb-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{DEMO_USER.name}</p>
              <p className="text-[10px] text-gray-400">{DEMO_USER.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log out
            </button>
          </div>
        )}

        {/* User info card */}
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors min-w-0 ${
            showUserMenu
              ? "border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-500/10"
              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${DEMO_USER.avatarColor} text-white text-xs font-semibold`}>
            {DEMO_USER.initials}
          </span>
          <div className="flex-1 min-w-0 text-left overflow-hidden">
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate leading-tight">{DEMO_USER.name}</p>
            <p className="text-[10px] text-gray-400 truncate leading-tight">{DEMO_USER.role}</p>
          </div>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-gray-400 flex-shrink-0 transition-transform duration-150 ${showUserMenu ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* Theme toggle row */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300"
          title="Toggle theme"
        >
          {dark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
          <span className="text-xs font-medium truncate">{dark ? "Dark Mode" : "Light Mode"}</span>
        </button>
      </div>
    </div>
  );
}