"use client";
import type { Agent } from "./AgentList";

interface AgentDetailCardProps {
  agent: Agent;
}

export default function AgentDetailCard({ agent }: AgentDetailCardProps) {
  return (
    <div className="space-y-4">
      {/* Agent header */}
      <div className={`rounded-xl border p-5 ${
        agent.locked
          ? "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      }`}>
        {agent.locked && (
          <div className="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            Upgrade your plan to unlock this agent
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{agent.icon}</span>
          <div>
            <h2
              className="text-lg font-semibold text-gray-900 dark:text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {agent.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{agent.title}</p>
          </div>
          {agent.active && !agent.locked && (
            <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
              Active
            </span>
          )}
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {agent.description}
        </p>

        {/* Daily Tasks */}
        <div className="mb-4">
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-2">Daily Job Description</h4>
          <ul className="space-y-1.5">
            {agent.dailyTasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-500 flex-shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {task}
              </li>
            ))}
          </ul>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {agent.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {!agent.locked && agent.recentActivity.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {agent.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <span className="text-xs text-gray-700 dark:text-gray-300">{activity.title}</span>
                <span className="text-[10px] text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
