"use client";
import TaskCard from "./TaskCard";
import type { Task } from "./TaskCard";

interface PrioritySectionProps {
  priority: "high" | "medium" | "low";
  tasks: Task[];
  selectedTaskId: string | null;
  onTaskSelect: (task: Task) => void;
}

const priorityConfig = {
  high: {
    label: "High",
    dotColor: "var(--gv-color-danger-500)",
    textColor: "var(--gv-color-danger-700)",
  },
  medium: {
    label: "Medium",
    dotColor: "var(--gv-color-warning-500)",
    textColor: "var(--gv-color-warning-700)",
  },
  low: {
    label: "Low",
    dotColor: "var(--gv-color-neutral-400)",
    textColor: "var(--gv-color-neutral-500)",
  },
};

export default function PrioritySection({ priority, tasks, selectedTaskId, onTaskSelect }: PrioritySectionProps) {
  if (tasks.length === 0) return null;
  const cfg = priorityConfig[priority];

  return (
    <div className="mt-4 first:mt-0">
      {/* Section label row */}
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <span
          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ background: cfg.dotColor }}
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: cfg.textColor }}
        >
          {cfg.label}
        </span>
        <span
          className="text-[11px] ml-auto tabular-nums"
          style={{ color: "var(--gv-color-neutral-400)" }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task cards */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isSelected={task.id === selectedTaskId}
            onClick={() => onTaskSelect(task)}
          />
        ))}
      </div>
    </div>
  );
}
