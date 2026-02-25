"use client";

export type AgentType = "all" | "CEO" | "CMO";

interface AgentFilterProps {
  selected: AgentType;
  onChange: (agent: AgentType) => void;
}

const agents: { value: AgentType; label: string; icon: string }[] = [
  { value: "all", label: "All Agents", icon: "" },
  { value: "CEO", label: "CEO", icon: "" },
  { value: "CMO", label: "CMO", icon: "" },
];

export default function AgentFilter({ selected, onChange }: AgentFilterProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h4 className="text-xs font-medium uppercase text-gray-400 mb-2">Filter by Agent</h4>
      <div className="space-y-1">
        {agents.map((agent) => (
          <button
            key={agent.value}
            onClick={() => onChange(agent.value)}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
              selected === agent.value
                ? "bg-brand-50 text-brand-700 font-medium dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {agent.label}
          </button>
        ))}
      </div>
    </div>
  );
}
