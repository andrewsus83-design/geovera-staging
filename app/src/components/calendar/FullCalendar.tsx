"use client";
import { useState, useMemo } from "react";
import type { Task } from "./TaskCard";

interface FullCalendarProps {
  tasks: Task[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export default function FullCalendar({ tasks, selectedDate, onDateSelect }: FullCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const monthName = currentMonth.toLocaleString("en", { month: "long", year: "numeric" });

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      const d = t.dueDate.slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(t);
    }
    return map;
  }, [tasks]);

  // Build calendar grid: 6 rows x 7 cols
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect(today);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2
          className="text-lg font-semibold text-gray-900 dark:text-white"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {monthName}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-2 py-2.5 text-center text-[11px] font-medium uppercase text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-[repeat(auto-fill,minmax(0,1fr))]">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800/50 last:border-b-0">
            {week.map((day, di) => {
              if (day === null) {
                return <div key={`empty-${wi}-${di}`} className="border-r border-gray-100 dark:border-gray-800/50 last:border-r-0" />;
              }

              const dateStr = getDateStr(day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const dayTasks = tasksByDate[dateStr] || [];
              const highCount = dayTasks.filter((t) => t.priority === "high").length;
              const medCount = dayTasks.filter((t) => t.priority === "medium").length;
              const lowCount = dayTasks.filter((t) => t.priority === "low").length;

              return (
                <button
                  key={day}
                  onClick={() => onDateSelect(dateStr)}
                  className={`border-r border-gray-100 dark:border-gray-800/50 last:border-r-0 p-1.5 text-left transition-colors min-h-[72px] ${
                    isSelected
                      ? "bg-brand-50/70 dark:bg-brand-500/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? "bg-brand-500 text-white"
                          : isSelected
                          ? "text-brand-700 font-semibold dark:text-brand-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] text-gray-400">{dayTasks.length}</span>
                    )}
                  </div>

                  {/* Task indicators */}
                  <div className="space-y-0.5">
                    {highCount > 0 && (
                      <div className="flex items-center gap-1 rounded px-1 py-0.5 bg-red-50 dark:bg-red-500/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="text-[9px] text-red-600 dark:text-red-400 truncate">
                          {highCount} high
                        </span>
                      </div>
                    )}
                    {medCount > 0 && (
                      <div className="flex items-center gap-1 rounded px-1 py-0.5 bg-orange-50 dark:bg-orange-500/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                        <span className="text-[9px] text-orange-600 dark:text-orange-400 truncate">
                          {medCount} med
                        </span>
                      </div>
                    )}
                    {lowCount > 0 && (
                      <div className="flex items-center gap-1 rounded px-1 py-0.5 bg-gray-50 dark:bg-gray-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate">
                          {lowCount} low
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
