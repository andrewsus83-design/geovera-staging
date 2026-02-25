"use client";

interface ThreeColumnLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

export default function ThreeColumnLayout({ left, center, right }: ThreeColumnLayoutProps) {
  return (
    <div className="flex h-screen gap-[9px] p-[9px]">
      {/* Column 1: 18% — Nav card (locked, no outer scroll) */}
      <div className="w-[18%] flex-shrink-0 h-full overflow-y-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {left}
        </div>
      </div>
      {/* Column 2: 41% — Main content card (scrollable) */}
      <div className="w-[41%] flex-shrink-0 h-full overflow-y-auto custom-scrollbar rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {center}
      </div>
      {/* Column 3: remaining (~36%) — Detail/edit panel card */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" style={{ height: "calc(100vh - 1rem)" }}>
        {right}
      </div>
    </div>
  );
}
