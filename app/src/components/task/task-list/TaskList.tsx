"use client";
import { Task } from "@/components/task/task-list/types/Task";
import TaskLane from "@/components/task/task-list/TaskLane";
import TaskHeader from "@/components/task/TaskHeader";
import { useState } from "react";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Finish user onboarding",
    isChecked: false,
    dueDate: "Tomorrow",
    commentCount: 1,
    category: "Marketing",
    userAvatar: "/images/user/user-01.jpg",
    status: "todo",
    toggleChecked: () => {},
  },
  {
    id: "2",
    title: "Solve the Dribble prioritization issue with the team",
    isChecked: false,
    dueDate: "Tomorrow",
    commentCount: 2,
    category: "Marketing",
    userAvatar: "/images/user/user-02.jpg",
    status: "todo",
    toggleChecked: () => {},
  },
  {
    id: "3",
    title: "Finish user onboarding",
    isChecked: true,
    dueDate: "Feb 12, 2024",
    commentCount: 1,
    category: "Marketing",
    userAvatar: "/images/user/user-03.jpg",
    status: "todo",
    toggleChecked: () => {},
  },
  {
    id: "4",
    title: "Work in Progress (WIP) Dashboard",
    isChecked: false,
    dueDate: "Jan 8, 2027",
    commentCount: 2,
    category: "Template",
    userAvatar: "/images/user/user-04.jpg",
    status: "in-progress",
    toggleChecked: () => {},
  },
  {
    id: "5",
    title: "Product Update - Q4 2024",
    isChecked: false,
    dueDate: "Jan 8, 2027",
    commentCount: 2,
    userAvatar: "/images/user/user-05.jpg",
    status: "in-progress",
    toggleChecked: () => {},
  },
  {
    id: "6",
    title: "Kanban Flow Manager",
    isChecked: true,
    dueDate: "Jan 8, 2027",
    commentCount: 2,
    userAvatar: "/images/user/user-06.jpg",
    status: "in-progress",
    toggleChecked: () => {},
  },
  {
    id: "7",
    title: "Make internal feedback",
    isChecked: false,
    dueDate: "Jan 8, 2027",
    commentCount: 2,
    userAvatar: "/images/user/user-07.jpg",
    status: "in-progress",
    toggleChecked: () => {},
  },
  {
    id: "8",
    title: "Do some projects on React Native with Flutter",
    isChecked: false,
    dueDate: "Feb 12, 2027",
    commentCount: 1,
    category: "Marketing",
    userAvatar: "/images/user/user-08.jpg",
    status: "completed",
    toggleChecked: () => {},
  },
  {
    id: "9",
    title: "Design marketing assets",
    isChecked: false,
    dueDate: "Feb 12, 2027",
    commentCount: 1,
    category: "Marketing",
    userAvatar: "/images/user/user-09.jpg",
    status: "completed",
    toggleChecked: () => {},
  },
  {
    id: "10",
    title: "Kanban Flow Manager",
    isChecked: false,
    dueDate: "Feb 12, 2027",
    commentCount: 1,
    category: "Marketing",
    userAvatar: "/images/user/user-10.jpg",
    status: "completed",
    toggleChecked: () => {},
  },
  {
    id: "11",
    title: "Change license and remove products",
    isChecked: false,
    dueDate: "Feb 12, 2027",
    commentCount: 1,
    category: "Marketing",
    userAvatar: "/images/user/user-11.jpg",
    status: "completed",
    toggleChecked: () => {},
  },
];

const lanes = ["todo", "in-progress", "completed"];

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(
    initialTasks.map((task) => ({
      ...task,
      toggleChecked: () => toggleChecked(task.id),
    }))
  );
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    taskId: string
  ) => {
    setDragging(taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (dragging === null) return;

    const updatedTasks = tasks.map((task) =>
      task.id === dragging ? { ...task, status } : task
    );

    const statusTasks = updatedTasks.filter((task) => task.status === status);
    const otherTasks = updatedTasks.filter((task) => task.status !== status);

    const dropY = e.clientY;
    const droppedIndex = statusTasks.findIndex((task) => {
      const taskElement = document.getElementById(`task-${task.id}`);
      if (!taskElement) return false;
      const rect = taskElement.getBoundingClientRect();
      const taskMiddleY = rect.top + rect.height / 2;
      return dropY < taskMiddleY;
    });

    if (droppedIndex !== -1) {
      const draggedTask = statusTasks.find((task) => task.id === dragging);
      if (draggedTask) {
        statusTasks.splice(statusTasks.indexOf(draggedTask), 1);
        statusTasks.splice(droppedIndex, 0, draggedTask);
      }
    }

    setTasks([...otherTasks, ...statusTasks]);
    setDragging(null);
  };

  const toggleChecked = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, isChecked: !task.isChecked } : task
      )
    );
  };

  return (
    <div
      style={{
        background: "var(--gv-color-bg-surface)",
        borderRadius: "var(--gv-radius-xl)",
        border: "1px solid var(--gv-color-neutral-200)",
        boxShadow: "var(--gv-shadow-card)",
        overflow: "hidden",
      }}
    >
      <TaskHeader />

      <div
        style={{
          borderTop: "1px solid var(--gv-color-neutral-200)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {lanes.map((lane) => (
          <TaskLane
            key={lane}
            lane={lane}
            tasks={tasks.filter((task) => task.status === lane)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, lane)}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
}
