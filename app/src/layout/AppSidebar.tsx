"use client";
import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  CalenderIcon,
  PlugInIcon,
  AiIcon,
  PieChartIcon,
  PencilIcon,
} from "../icons/index";

// TikTok icon (inline SVG)
const TikTokNavIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z" />
  </svg>
);

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  partnerOnly?: boolean;
};

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Home", path: "/" },
  { icon: <CalenderIcon />, name: "Calendar", path: "/calendar" },
  { icon: <PlugInIcon />, name: "Connect", path: "/connect" },
  { icon: <AiIcon />, name: "AI Agent", path: "/ai-agent" },
  { icon: <PencilIcon />, name: "Content Studio", path: "/content-studio" },
  { icon: <TikTokNavIcon />, name: "TikTok Calendar", path: "/tiktok-calendar" },
  { icon: <PieChartIcon />, name: "Analytics", path: "/analytics", partnerOnly: true },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback(
    (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path)),
    [pathname]
  );

  return (
    <aside
      className={`fixed flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-full transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/geoveralogo.png"
            alt="GeoVera"
            width={32}
            height={32}
            className="flex-shrink-0"
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span
              className="text-xl font-bold text-gray-900 dark:text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              GeoVera
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="flex flex-col gap-1">
          {navItems.map((nav) => (
            <li key={nav.name}>
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text flex items-center gap-2">
                    {nav.name}
                    {nav.partnerOnly && (
                      <span className="ml-auto rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 leading-none">
                        ★
                      </span>
                    )}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AppSidebar;
