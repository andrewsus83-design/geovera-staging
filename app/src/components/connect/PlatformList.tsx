"use client";

export interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  handle?: string;
  plan: "basic" | "premium" | "enterprise";
}

interface PlatformListProps {
  platforms: Platform[];
  selectedId: string;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

const planBadge: Record<string, { label: string; className: string }> = {
  basic: { label: "Basic", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  premium: { label: "Premium", className: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" },
  enterprise: { label: "Enterprise", className: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
};

export default function PlatformList({ platforms, selectedId, onSelect, onToggle }: PlatformListProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h4 className="text-xs font-medium uppercase text-gray-400 mb-3">Platforms</h4>
      <div className="space-y-1.5">
        {platforms.map((p) => {
          const badge = planBadge[p.plan];
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full flex items-center gap-2.5 rounded-lg p-2.5 text-left transition-colors ${
                selectedId === p.id
                  ? "bg-brand-50 border border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                {p.handle && (
                  <p className="text-[10px] text-gray-400 truncate">@{p.handle}</p>
                )}
              </div>
              {p.connected && (
                <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[10px] text-gray-400 text-center">Powered by Sociomonials</p>
      </div>
    </div>
  );
}
