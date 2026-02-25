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
  high: { label: "High Priority", dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  medium: { label: "Medium Priority", dot: "bg-orange-400", text: "text-orange-600 dark:text-orange-400" },
  low: { label: "Low Priority", dot: "bg-gray-400", text: "text-gray-500 dark:text-gray-400" },
};

export default function PrioritySection({ priority, tasks, selectedTaskId, onTaskSelect }: PrioritySectionProps) {
  if (tasks.length === 0) return null;
  const config = priorityConfig[priority];

  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-center gap-2 mb-1 px-0.5">
        <span className={`h-2 w-2 rounded-full ${config.dot}`} />
        <h3 className={`text-xs font-semibold uppercase ${config.text}`}>{config.label}</h3>
        <span className="text-[10px] text-gray-400 ml-auto">{tasks.length}</span>
      </div>
      <div className="space-y-1">
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
