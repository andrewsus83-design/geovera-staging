"use client";

interface BrandOverviewCardProps {
  isSelected: boolean;
  onClick: () => void;
}

export default function BrandOverviewCard({ isSelected, onClick }: BrandOverviewCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        isSelected
          ? "border-brand-500 bg-brand-50/50 shadow-sm dark:border-brand-400 dark:bg-brand-500/5"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg">
          G
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">GeoVera</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Marketing Intelligence</p>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Industry</span>
          <span className="text-gray-700 dark:text-gray-300">Marketing Intelligence</span>
        </div>
        <div className="flex justify-between">
          <span>Location</span>
          <span className="text-gray-700 dark:text-gray-300">Jakarta, ID</span>
        </div>
        <div className="flex justify-between">
          <span>Website</span>
          <span className="text-gray-700 dark:text-gray-300">geovera.xyz</span>
        </div>
        <div className="flex justify-between">
          <span>Plan</span>
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            Premium
          </span>
        </div>
      </div>
    </button>
  );
}
