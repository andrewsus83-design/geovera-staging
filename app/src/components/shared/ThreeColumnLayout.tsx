"use client";
import { useState } from "react";
import Image from "next/image";

interface ThreeColumnLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  /** Mobile: shows right panel as fullscreen overlay */
  mobileRightOpen?: boolean;
  /** Mobile: called when back button is tapped */
  onMobileBack?: () => void;
  /** Optional title shown in the mobile back bar */
  mobileBackLabel?: string;
}

export default function ThreeColumnLayout({
  left,
  center,
  right,
  mobileRightOpen = false,
  onMobileBack,
  mobileBackLabel = "Back",
}: ThreeColumnLayoutProps) {
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] lg:gap-[9px] lg:p-[9px]">

      {/* ── DESKTOP: Left column ── */}
      <div className="hidden lg:block w-[18%] flex-shrink-0 h-full overflow-y-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {left}
        </div>
      </div>

      {/* ── MOBILE: Left panel slide-in overlay ── */}
      {mobileLeftOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileLeftOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-[82%] max-w-xs bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto flex flex-col">
            {/* Drawer content — NavColumn already has its own header */}
            <div className="flex-1 overflow-y-auto relative">
              {/* Close button — floats top-right over NavColumn header */}
              <button
                onClick={() => setMobileLeftOpen(false)}
                className="absolute top-2 right-2 z-10 h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              {left}
            </div>
          </div>
        </div>
      )}

      {/* ── Center column ── */}
      <div
        className={`
          ${mobileRightOpen ? "hidden lg:flex" : "flex"}
          flex-col flex-1 lg:w-[41%] lg:flex-none h-full
          bg-white dark:bg-gray-900
          lg:rounded-xl lg:border lg:border-gray-200 lg:dark:border-gray-800
          overflow-hidden
        `}
      >
        {/* Mobile-only: top bar with hamburger */}
        <div className="lg:hidden flex-shrink-0 flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={() => setMobileLeftOpen(true)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            {/* Hamburger 3-bar icon */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" />
            </svg>
          </button>
          <Image src="/images/geoveralogo.png" alt="GeoVera" width={24} height={24} className="flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>GeoVera</span>
        </div>

        {/* Center content — scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {center}
        </div>
      </div>

      {/* ── DESKTOP: Right column ── */}
      <div
        className="hidden lg:flex lg:flex-none lg:w-[41%] flex-col overflow-hidden min-w-0 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        style={{ height: "calc(100vh - 1rem)" }}
      >
        {right}
      </div>

      {/* ── MOBILE: Right panel as fullscreen overlay ── */}
      {mobileRightOpen && (
        <div className="lg:hidden fixed inset-0 z-[50] bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
          {/* Back bar */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={onMobileBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {mobileBackLabel}
            </button>
          </div>
          {/* Right content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {right}
          </div>
        </div>
      )}

    </div>
  );
}
