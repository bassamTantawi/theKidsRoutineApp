"use client";

import type { CalendarEvent } from "../../data/calendar";

type CalendarCellProps = {
  date: string | null;
  dayNumber?: number;
  events: CalendarEvent[];
  onDateClick: (date: string) => void;
  onAddEvent: (date: string) => void;
};

export function CalendarCell({ date, dayNumber, events, onDateClick, onAddEvent }: CalendarCellProps) {
  if (!date) {
    return (
      <div className="h-24 rounded-2xl bg-white/40 ring-1 ring-black/5 sm:h-28" />
    );
  }

  const hasEvents = events.length > 0;

  return (
    <div
      className={[
        "relative h-24 overflow-hidden rounded-2xl p-2 text-left shadow-sm ring-1 transition sm:h-28",
        hasEvents
          ? "bg-gradient-to-br from-amber-100 via-pink-100 to-sky-100 ring-amber-200"
          : "bg-white/70 ring-black/5",
      ].join(" ")}
    >
      <div className="absolute right-2 top-2 flex items-center gap-1">
        <div className="rounded-lg bg-white/80 px-2 py-0.5 text-xs font-extrabold text-zinc-900 ring-1 ring-black/5">
          {dayNumber}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddEvent(date);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-600 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95 transition-transform"
          title="Add event"
          aria-label="Add event"
        >
          <span className="text-sm font-bold">+</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDateClick(date)}
        className="h-full w-full text-left"
      >
        {hasEvents ? (
          <div className="mt-6 space-y-1">
            {events.slice(0, 2).map((ev) => (
              <div
                key={ev.id}
                className="truncate rounded-lg bg-white/80 px-2 py-1 text-xs font-extrabold text-zinc-900 ring-1 ring-black/5"
                title={ev.name}
              >
                {ev.name}
              </div>
            ))}
            {events.length > 2 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDateClick(date);
                }}
                className="w-full rounded-lg bg-white/80 px-2 py-1 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95 transition-transform"
              >
                +{events.length - 2}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 text-xs font-semibold text-zinc-500">
            No events
          </div>
        )}
      </button>
    </div>
  );
}

