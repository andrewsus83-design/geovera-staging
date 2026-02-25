"use client";
import ImpactFireIcons from "./ImpactFireIcons";

export interface ReplyComment {
  id: string;
  platform: string;
  platformIcon: string;
  author: string;
  authorScore: number; // 1-100 priority score
  comment: string;
  draftReply: string;
  status: "pending" | "approved" | "rejected";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  agent: "CEO" | "CMO";
  priority: "high" | "medium" | "low";
  impact: 1 | 2 | 3;
  dueDate: string;
  platform?: string;
  imageUrl?: string;
  taskType?: "content" | "reply" | "strategy";
  replyQueue?: ReplyComment[];
  content?: {
    caption?: string;
    hashtags?: string[];
    imageUrl?: string;
  };
}

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onClick: () => void;
}

export default function TaskCard({ task, isSelected, onClick }: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-2.5 transition-all ${
        isSelected
          ? "border-brand-500 bg-brand-50/50 shadow-sm dark:border-brand-400 dark:bg-brand-500/5"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              task.agent === "CEO"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
            }`}>
              {task.agent}
            </span>
            {task.platform && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {task.platform}
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{task.title}</h4>
        </div>
        <ImpactFireIcons level={task.impact} />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
    </button>
  );
}
