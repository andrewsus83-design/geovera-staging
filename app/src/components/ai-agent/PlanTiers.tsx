"use client";

interface PlanTiersProps {
  currentPlan: "basic" | "premium" | "enterprise";
}

const tiers = [
  {
    id: "basic" as const,
    name: "Basic",
    price: "$299/mo",
    agents: ["CEO"],
    loraProducts: 5,
    extras: ["Daily strategic insights", "Budget optimization", "5 LoRA product models"],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "$499/mo",
    agents: ["CEO", "CMO"],
    loraProducts: 10,
    extras: ["Everything in Basic", "Content strategy & creation", "Social media management", "10 LoRA product models"],
  },
  {
    id: "enterprise" as const,
    name: "Partner",
    price: "$999/mo",
    agents: ["CEO", "CMO", "Customer Support"],
    loraProducts: 15,
    extras: ["Everything in Premium", "24/7 auto-reply support", "Custom AI training", "15 LoRA product models"],
  },
];

export default function PlanTiers({ currentPlan }: PlanTiersProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col">
      <h3
        className="text-base font-semibold text-gray-900 dark:text-white mb-4"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Agent Plans
      </h3>

      <div className="flex-1 space-y-3">
        {tiers.map((tier) => {
          const isCurrent = tier.id === currentPlan;
          return (
            <div
              key={tier.id}
              className={`rounded-xl border p-4 ${
                isCurrent
                  ? "border-brand-500 bg-brand-50/50 dark:border-brand-400 dark:bg-brand-500/5"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{tier.name}</h4>
                  <p className="text-xs text-gray-500">{tier.price}</p>
                </div>
                {isCurrent && (
                  <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-medium text-white">
                    Current
                  </span>
                )}
              </div>

              {/* Agents included */}
              <div className="mb-2">
                <p className="text-[10px] uppercase text-gray-400 mb-1">Agents included</p>
                <div className="flex gap-1">
                  {tier.agents.map((agent) => (
                    <span key={agent} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              <ul className="space-y-1">
                {tier.extras.map((extra) => (
                  <li key={extra} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-500 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {extra}
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
