"use client";
import { useState } from "react";
import TaskItem from "./TaskItem";
import { Task } from "./types/Task";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { HorizontaLDots } from "@/icons";

interface TaskLaneProps {
  lane: string;
  tasks: Task[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

const laneConfig: Record<string, { label: string; badgeBg: string; badgeColor: string }> = {
  todo: {
    label: "To Do",
    badgeBg: "var(--gv-color-neutral-100)",
    badgeColor: "var(--gv-color-neutral-700)",
  },
  "in-progress": {
    label: "In Progress",
    badgeBg: "var(--gv-color-warning-50)",
    badgeColor: "var(--gv-color-warning-700)",
  },
  completed: {
    label: "Completed",
    badgeBg: "var(--gv-color-success-50)",
    badgeColor: "var(--gv-color-success-700)",
  },
};

const TaskLane: React.FC<TaskLaneProps> = ({
  lane,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = laneConfig[lane] || { label: lane, badgeBg: "var(--gv-color-neutral-100)", badgeColor: "var(--gv-color-neutral-700)" };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div onDragOver={onDragOver} onDrop={onDrop}>
      {/* Lane header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3
            style={{
              fontFamily: "var(--gv-font-heading)",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--gv-color-neutral-900)",
            }}
          >
            {config.label}
          </h3>
          <span
            className="gv-badge"
            style={{
              background: config.badgeBg,
              color: config.badgeColor,
            }}
          >
            {tasks.length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={toggleDropdown}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "var(--gv-radius-xs)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--gv-color-neutral-400)",
              transition: "all var(--gv-duration-fast)",
            }}
          >
            <HorizontaLDots />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="absolute right-0 top-full z-40 w-[140px] space-y-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-md dark:border-gray-800 dark:bg-gray-dark"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Edit
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Clear All
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Task items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            {...task}
            onDragStart={(e) => onDragStart(e, task.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskLane;
