"use client";

interface DesignAssetsCardProps {
  isSelected: boolean;
  onClick: () => void;
}

const brandColors = ["#16A34A", "#0B0F19", "#6B7280", "#F9FAFB", "#DC2626"];

export default function DesignAssetsCard({ isSelected, onClick }: DesignAssetsCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        isSelected
          ? "border-brand-500 bg-brand-50/50 shadow-sm dark:border-brand-400 dark:bg-brand-500/5"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Design Assets</h3>

      {/* Brand Colors */}
      <div className="mb-3">
        <p className="text-[10px] uppercase text-gray-400 mb-1.5">Brand Colors</p>
        <div className="flex gap-1.5">
          {brandColors.map((color) => (
            <div
              key={color}
              className="h-6 w-6 rounded-md border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* LoRA Training */}
      <div className="mb-3">
        <p className="text-[10px] uppercase text-gray-400 mb-1.5">LoRA Product Training</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Products trained</span>
          <span className="text-gray-700 dark:text-gray-300">3 / 10</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-1.5 rounded-full bg-brand-500" style={{ width: "30%" }} />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Logos</span>
          <span className="text-gray-700 dark:text-gray-300">3 files</span>
        </div>
        <div className="flex justify-between">
          <span>Storage</span>
          <span className="text-gray-700 dark:text-gray-300">24.5 MB</span>
        </div>
      </div>
    </button>
  );
}
