"use client";

export type PlanId = "basic" | "premium" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  priceNote: string;
  agents: string[];
  loraProducts: number;
  features: string[];
  color: string;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$299",
    priceNote: "/mo",
    agents: ["CEO"],
    loraProducts: 5,
    features: [
      "1 AI Agent (CEO)",
      "Daily strategic insights",
      "Budget optimization",
      "5 LoRA product models",
      "1 connected platform",
    ],
    color: "gray",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$499",
    priceNote: "/mo",
    agents: ["CEO", "CMO"],
    loraProducts: 10,
    features: [
      "2 AI Agents (CEO + CMO)",
      "Everything in Basic",
      "Content strategy & creation",
      "Social media management",
      "10 LoRA product models",
      "5 connected platforms",
    ],
    color: "brand",
  },
  {
    id: "enterprise",
    name: "Partner",
    price: "$999",
    priceNote: "/mo",
    agents: ["CEO", "CMO", "CTO", "Support"],
    loraProducts: 15,
    features: [
      "4 AI Agents (full team)",
      "Everything in Premium",
      "24/7 auto-reply support",
      "Custom AI training",
      "15 LoRA product models",
      "Unlimited platforms",
    ],
    color: "purple",
  },
];

interface SubscriptionTierCardProps {
  plan: Plan;
  isCurrent: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const colorMap = {
  gray: {
    ring: "border-gray-300 dark:border-gray-600",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    price: "text-gray-900 dark:text-white",
    check: "text-gray-500",
  },
  brand: {
    ring: "border-brand-500 dark:border-brand-400",
    badge: "bg-brand-500 text-white",
    price: "text-brand-700 dark:text-brand-400",
    check: "text-brand-500",
  },
  purple: {
    ring: "border-purple-500 dark:border-purple-400",
    badge: "bg-purple-500 text-white",
    price: "text-purple-700 dark:text-purple-400",
    check: "text-purple-500",
  },
};

export default function SubscriptionTierCard({ plan, isCurrent, isSelected, onClick }: SubscriptionTierCardProps) {
  const colors = colorMap[plan.color as keyof typeof colorMap];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? `${colors.ring} bg-white shadow-md dark:bg-gray-900`
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3
              className="text-sm font-semibold text-gray-900 dark:text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {plan.name}
            </h3>
            {isCurrent && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors.badge}`}>
                Current
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-xl font-bold ${colors.price}`}>{plan.price}</span>
            {plan.priceNote && (
              <span className="text-xs text-gray-400">{plan.priceNote}</span>
            )}
          </div>
        </div>

        {/* Agent count badge */}
        <div className="text-right">
          <p className="text-[10px] text-gray-400 mb-1">Agents</p>
          <div className="flex gap-1 justify-end">
            {plan.agents.map((a) => (
              <span
                key={a}
                className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-1">
        {plan.features.slice(0, 4).map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`flex-shrink-0 ${colors.check}`}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {f}
          </li>
        ))}
        {plan.features.length > 4 && (
          <li className="text-[10px] text-gray-400 pl-4">+{plan.features.length - 4} more</li>
        )}
      </ul>
    </button>
  );
}
