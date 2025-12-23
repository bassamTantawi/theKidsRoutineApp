"use client";

import { useMemo } from "react";
import type { CalendarEvent } from "../../data/calendar";
import { monthToDate, pad2, WEEKDAYS } from "../../utils/calendar";
import { CalendarCell } from "./CalendarCell";

type CalendarViewProps = {
  month: string;
  eventsByDate: Record<string, CalendarEvent[]>;
  onDateClick: (date: string) => void;
  onAddEvent: (date: string) => void;
};

export function CalendarView({ month, eventsByDate, onDateClick, onAddEvent }: CalendarViewProps) {
  const cells = useMemo(() => {
    const first = monthToDate(month);
    const year = first.getFullYear();
    const monthIndex = first.getMonth();
    const startWeekday = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cellArray: Array<{ date: string | null; dayNumber?: number }> = [];
    for (let i = 0; i < startWeekday; i++) cellArray.push({ date: null });
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
      cellArray.push({ date, dayNumber: day });
    }
    // complete last week to keep grid aligned
    while (cellArray.length % 7 !== 0) cellArray.push({ date: null });

    return cellArray;
  }, [month]);

  return (
    <section className="rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur sm:p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-extrabold uppercase tracking-wide text-zinc-600"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((c, idx) => (
          <CalendarCell
            key={c.date || `empty-${idx}`}
            date={c.date}
            dayNumber={c.dayNumber}
            events={c.date ? eventsByDate[c.date] ?? [] : []}
            onDateClick={onDateClick}
            onAddEvent={onAddEvent}
          />
        ))}
      </div>
    </section>
  );
}

