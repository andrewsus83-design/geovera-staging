"use client";
import ImpactFireIcons from "./ImpactFireIcons";

export interface ReplyComment {
  id: string;
  platform: string;
  platformIcon: string;
  author: string;
  authorScore: number;
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
      className="w-full text-left transition-all duration-200"
      style={{
        borderRadius: "var(--gv-radius-md)",
        border: `1px solid ${isSelected ? "var(--gv-color-primary-200)" : "var(--gv-color-neutral-200)"}`,
        background: isSelected ? "var(--gv-color-primary-50)" : "var(--gv-color-bg-surface)",
        boxShadow: isSelected ? "var(--gv-shadow-focus)" : "var(--gv-shadow-card)",
        padding: "12px",
      }}
    >
      {/* Top row: badges + fire */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Agent badge */}
          <span
            className="gv-badge"
            style={
              task.agent === "CEO"
                ? { background: "var(--gv-color-info-50)", color: "var(--gv-color-info-700)" }
                : { background: "var(--gv-color-primary-50)", color: "var(--gv-color-primary-700)" }
            }
          >
            {task.agent}
          </span>
          {/* Platform badge */}
          {task.platform && (
            <span
              className="gv-badge"
              style={{ background: "var(--gv-color-neutral-100)", color: "var(--gv-color-neutral-500)" }}
            >
              {task.platform}
            </span>
          )}
        </div>
        <ImpactFireIcons level={task.impact} />
      </div>

      {/* Title */}
      <h4
        className="text-[14px] font-semibold leading-snug mb-1"
        style={{ color: "var(--gv-color-neutral-900)" }}
      >
        {task.title}
      </h4>

      {/* Description */}
      <p
        className="text-[12px] leading-relaxed line-clamp-2"
        style={{ color: "var(--gv-color-neutral-500)" }}
      >
        {task.description}
      </p>
    </button>
  );
}
