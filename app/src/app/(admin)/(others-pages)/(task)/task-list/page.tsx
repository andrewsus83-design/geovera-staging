import { Metadata } from "next";
import TaskList from "@/components/task/task-list/TaskList";

export const metadata: Metadata = {
  title: "Tasks | GeoVera Intelligence Platform",
  description: "Manage and track your marketing tasks across all channels.",
};

export default function TaskListPage() {
  return (
    <div style={{ padding: "24px 24px 48px" }}>
      <TaskList />
    </div>
  );
}
