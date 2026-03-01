"use client";

interface PlanDetailsProps {
  currentPlan: "basic" | "premium" | "enterprise";
}

const plans = [
  {
    id: "basic" as const,
    name: "Basic",
    price: "Rp 3,99jt/bln",
    platforms: ["Instagram", "Facebook", "X (Twitter)", "Reddit"],
    features: [
      "3 tasks/hari",
      "Unlimited auto reply komentar",
      "5 LoRA product/character training",
      "10 images/hari",
      "4 platform connect & auto publish",
    ],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "Rp 6,99jt/bln",
    platforms: ["All Basic +", "TikTok", "LinkedIn", "YouTube", "Threads"],
    features: [
      "6 tasks/hari",
      "Unlimited auto reply komentar",
      "10 LoRA product/character training",
      "15 images/hari",
      "8 platform connect & auto publish",
      "1 video/hari (maks. 10 detik)",
      "Report & Analytics",
    ],
  },
  {
    id: "enterprise" as const,
    name: "Partner",
    price: "Rp 15,99jt/bln",
    platforms: ["All Premium +", "Google Business Profile"],
    features: [
      "12 tasks/hari",
      "Unlimited auto reply komentar",
      "20 LoRA product/character training",
      "30 images/hari",
      "9 platform connect & auto publish",
      "2 video/hari (maks. 25 detik)",
      "1 YouTube video/bln (3 mnt, avatar)",
      "Report & Analytics",
    ],
  },
];

export default function PlanDetails({ currentPlan }: PlanDetailsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col">
      <h3
        className="text-base font-semibold text-gray-900 dark:text-white mb-4"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Plans
      </h3>

      <div className="flex-1 space-y-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-4 ${
                isCurrent
                  ? "border-brand-500 bg-brand-50/50 dark:border-brand-400 dark:bg-brand-500/5"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                  <p className="text-xs text-gray-500">{plan.price}</p>
                </div>
                {isCurrent && (
                  <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-medium text-white">
                    Current
                  </span>
                )}
              </div>

              {/* Platforms */}
              <div className="mb-2">
                <p className="text-[10px] uppercase text-gray-400 mb-1">Platforms</p>
                <div className="flex flex-wrap gap-1">
                  {plan.platforms.map((p) => (
                    <span key={p} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <ul className="space-y-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-500 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <button className="mt-3 w-full rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors dark:text-brand-400 dark:hover:bg-brand-500/10">
                  Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
