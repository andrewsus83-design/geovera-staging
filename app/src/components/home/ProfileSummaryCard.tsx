"use client";

interface ProfileSummaryCardProps {
  isSelected: boolean;
  onClick: () => void;
}

export default function ProfileSummaryCard({ isSelected, onClick }: ProfileSummaryCardProps) {
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold text-sm dark:bg-gray-700 dark:text-gray-300">
          DA
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Drew Anderson</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Brand Owner</p>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Email</span>
          <span className="text-gray-700 dark:text-gray-300">drew@geovera.xyz</span>
        </div>
        <div className="flex justify-between">
          <span>Role</span>
          <span className="text-gray-700 dark:text-gray-300">Brand Owner</span>
        </div>
        <div className="flex justify-between">
          <span>Joined</span>
          <span className="text-gray-700 dark:text-gray-300">Jan 2026</span>
        </div>
      </div>
    </button>
  );
}
