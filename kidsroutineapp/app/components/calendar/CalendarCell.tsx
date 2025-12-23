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
        "relative h-24 overflow-hidden rounded-2xl p-1.5 text-left shadow-sm ring-1 transition sm:h-28",
        hasEvents
          ? "bg-gradient-to-br from-pink-50 via-sky-50 to-emerald-50 ring-pink-200/50"
          : "bg-white/70 ring-black/5",
      ].join(" ")}
    >
      <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
        <div className="rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-extrabold text-zinc-700 ring-1 ring-black/5">
          {dayNumber}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddEvent(date);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-pink-500 text-white shadow-sm ring-1 ring-sky-600/30 hover:from-sky-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-sky-400 active:scale-95 transition-transform"
          title="Add event"
          aria-label="Add event"
        >
          <span className="text-xs font-bold leading-none">+</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDateClick(date)}
        className="h-full w-full text-left pt-6"
      >
        {hasEvents ? (
          <div className="space-y-0.5">
            {events.slice(0, 2).map((ev) => (
              <div
                key={ev.id}
                className="truncate rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-800 ring-1 ring-black/5"
                title={ev.name}
              >
                {ev.name}
              </div>
            ))}
            {events.length > 2 ? (
              <div className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 ring-1 ring-black/5">
                +{events.length - 2}
              </div>
            ) : null}
          </div>
        ) : null}
      </button>
    </div>
  );
}

