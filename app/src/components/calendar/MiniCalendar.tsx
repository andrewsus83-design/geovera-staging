"use client";
import { useState, useMemo } from "react";

interface MiniCalendarProps {
  taskDates?: string[];
  onDateSelect?: (date: string) => void;
  selectedDate?: string | null;
  maxDate?: string; // days after this are locked/grayed (72H window)
}

export default function MiniCalendar({ taskDates = [], onDateSelect, selectedDate, maxDate }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Count tasks per date
  const taskCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of taskDates) {
      const key = d.slice(0, 10);
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [taskDates]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const monthName = currentMonth.toLocaleString("en", { month: "long", year: "numeric" });

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Build grid with padding
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
    onDateSelect?.(today);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h4
          className="text-sm font-semibold text-gray-900 dark:text-white"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {monthName}
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={goToToday}
            className="rounded-md px-2 py-1 text-[10px] font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase text-gray-400 py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="px-2 pb-3">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day, di) => {
              if (day === null) return <div key={`empty-${wi}-${di}`} className="h-9" />;

              const dateStr = getDateStr(day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const isLocked = maxDate != null && dateStr > maxDate;
              const taskCount = taskCountMap[dateStr] || 0;

              return (
                <button
                  key={day}
                  onClick={() => !isLocked && onDateSelect?.(dateStr)}
                  disabled={isLocked}
                  title={isLocked ? "Content locked beyond 72H window" : undefined}
                  className={`relative h-9 rounded-lg text-xs font-medium transition-all mx-0.5 flex flex-col items-center justify-center
                    ${isLocked
                      ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                      : isSelected
                      ? "bg-brand-500 text-white shadow-sm"
                      : isToday
                      ? "bg-brand-50 text-brand-700 ring-1 ring-brand-300 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/30"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <span>{day}</span>
                  {taskCount > 0 && !isLocked && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                        isSelected ? "bg-white" : "bg-brand-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {" "}&middot;{" "}
              {taskCountMap[selectedDate] || 0} task{(taskCountMap[selectedDate] || 0) !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => onDateSelect?.(selectedDate)}
              className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
