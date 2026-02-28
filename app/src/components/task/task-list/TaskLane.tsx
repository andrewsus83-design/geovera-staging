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

const TaskLane: React.FC<TaskLaneProps> = ({
  lane,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div onDragOver={onDragOver} onDrop={onDrop}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center gap-3 text-base font-medium capitalize dark:text-white/90" style={{ fontFamily: "var(--gv-font-heading)", color: "var(--gv-color-neutral-900)" }}>
          {lane}
          <span
            className={`gv-badge ${
      lane === "todo"
        ? ""
        : lane === "in-progress"
        ? "gv-badge-warning"
        : lane === "completed"
        ? "gv-badge-success"
        : ""
    }`}
            style={lane === "todo" ? { background: "var(--gv-color-neutral-100)", color: "var(--gv-color-neutral-700)" } : undefined}
          >
            {tasks.length}
          </span>
        </h3>

        <div className="relative">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <HorizontaLDots className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="absolute right-0 top-full z-40 w-[140px] space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-theme-md dark:border-gray-800 dark:bg-gray-dark"
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
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          {...task}
          onDragStart={(e) => onDragStart(e, task.id)}
        />
      ))}
    </div>
  );
};

export default TaskLane;
