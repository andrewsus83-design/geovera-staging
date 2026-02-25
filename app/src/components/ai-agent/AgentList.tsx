"use client";

export interface Agent {
  id: string;
  name: string;
  title: string;
  icon: string;
  active: boolean;
  locked: boolean;
  description: string;
  dailyTasks: string[];
  skills: string[];
  recentActivity: { title: string; time: string }[];
}

interface AgentListProps {
  agents: Agent[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function AgentList({ agents, selectedId, onSelect }: AgentListProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h4 className="text-xs font-medium uppercase text-gray-400 mb-3">Your AI Team</h4>
      <div className="space-y-1">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
              selectedId === agent.id
                ? "bg-brand-50 border border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/30"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <span className="text-lg">{agent.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{agent.title}</p>
            </div>
            {agent.locked ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            ) : agent.active ? (
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-brand-500" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
