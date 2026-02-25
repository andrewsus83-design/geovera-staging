"use client";
import { useState } from "react";
import type { Plan, PlanId } from "./SubscriptionTierCard";

interface PlanDetailPanelProps {
  plan: Plan;
  currentPlan: PlanId;
}

const colorMap = {
  gray: {
    icon: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    button: "bg-gray-700 hover:bg-gray-800 text-white",
    check: "text-gray-500",
    border: "border-gray-300 dark:border-gray-600",
  },
  brand: {
    icon: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    badge: "bg-brand-500 text-white",
    button: "bg-brand-500 hover:bg-brand-600 text-white",
    check: "text-brand-500",
    border: "border-brand-500 dark:border-brand-400",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    badge: "bg-purple-500 text-white",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
    check: "text-purple-500",
    border: "border-purple-500 dark:border-purple-400",
  },
};

const planOrder: PlanId[] = ["basic", "premium", "enterprise"];

export default function PlanDetailPanel({ plan, currentPlan }: PlanDetailPanelProps) {
  const [showConfirm, setShowConfirm] = useState<"upgrade" | "downgrade" | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const colors = colorMap[plan.color as keyof typeof colorMap];
  const isCurrent = plan.id === currentPlan;
  const currentIdx = planOrder.indexOf(currentPlan);
  const planIdx = planOrder.indexOf(plan.id);
  const isUpgrade = planIdx > currentIdx;
  const isDowngrade = planIdx < currentIdx;

  const handleConfirm = () => {
    setConfirmed(true);
    setShowConfirm(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`border-b-2 ${colors.border} p-2`}>
        <div className="flex items-center justify-between mb-1">
          <h3
            className="text-base font-semibold text-gray-900 dark:text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {plan.name} Plan
          </h3>
          {isCurrent && (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${colors.badge}`}>
              Active
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
          {plan.priceNote && <span className="text-sm text-gray-400">{plan.priceNote}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Current plan note */}
        {isCurrent && (
          <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 dark:bg-brand-500/10 dark:border-brand-500/30">
            <p className="text-xs font-medium text-brand-700 dark:text-brand-400">
              You are on this plan
            </p>
            <p className="text-xs text-brand-600/70 dark:text-brand-400/70 mt-0.5">
              Next billing: March 23, 2026
            </p>
          </div>
        )}

        {/* Confirmed action */}
        {confirmed && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 dark:bg-green-500/10 dark:border-green-500/30">
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              Change requested successfully!
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-0.5">
              Our team will contact you shortly.
            </p>
          </div>
        )}

        {/* AI Agents */}
        <div>
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">AI Agents Included</h4>
          <div className="space-y-2">
            {plan.agents.map((agent) => (
              <div key={agent} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${colors.icon}`}>
                  {agent === "CEO" ? "🧑‍💼" : agent === "CMO" ? "📣" : agent === "CTO" ? "💻" : "🎧"}
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{agent} Agent</p>
                  <p className="text-[10px] text-gray-400">
                    {agent === "CEO" ? "Strategy & oversight" :
                     agent === "CMO" ? "Marketing & content" :
                     agent === "CTO" ? "Technical strategy" :
                     "Auto-reply & support"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Features */}
        <div>
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">What's Included</h4>
          <ul className="space-y-1.5">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`flex-shrink-0 mt-0.5 ${colors.check}`}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* LoRA info */}
        <div className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">LoRA Product Models</p>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{plan.loraProducts}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Custom AI-generated product images using your brand's style
          </p>
        </div>
      </div>

      {/* CTA */}
      {!isCurrent && !confirmed && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-2">
          {showConfirm ? (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                {showConfirm === "upgrade"
                  ? `Upgrade to ${plan.name}?`
                  : `Downgrade to ${plan.name}?`}
              </p>
              <p className="text-[10px] text-gray-400 text-center">
                {showConfirm === "upgrade"
                  ? "You'll be charged the new rate from your next billing cycle."
                  : "Features will be limited from your next billing cycle."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${colors.button}`}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {isUpgrade && (
                <button
                  onClick={() => setShowConfirm("upgrade")}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm ${colors.button}`}
                >
                  Upgrade to {plan.name}
                </button>
              )}
              {isDowngrade && (
                <button
                  onClick={() => setShowConfirm("downgrade")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Downgrade to {plan.name}
                </button>
              )}
              <p className="text-center text-[10px] text-gray-400">
                Changes take effect next billing cycle
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
