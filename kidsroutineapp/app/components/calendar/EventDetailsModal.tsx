"use client";

import type { CalendarEvent } from "../../data/calendar";

type EventDetailsModalProps = {
  date: string | null;
  events: CalendarEvent[];
  onClose: () => void;
  onAddEvent: (date: string) => void;
};

export function EventDetailsModal({ date, events, onClose, onAddEvent }: EventDetailsModalProps) {
  if (!date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-zinc-900 to-zinc-800 px-5 py-4">
          <div className="space-y-0.5">
            <p className="text-sm font-extrabold text-white">
              Events • {date}
            </p>
            <p className="text-xs text-white/80">
              {events.length} event{events.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onAddEvent(date);
                onClose();
              }}
              className="h-10 rounded-xl bg-emerald-500 px-4 text-sm font-extrabold text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Add Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl bg-white/10 px-4 text-sm font-extrabold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-auto p-5">
          {events.length === 0 ? (
            <div className="rounded-2xl bg-zinc-50 p-4 text-sm font-semibold text-zinc-700 ring-1 ring-black/5">
              No events on this day.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-extrabold text-zinc-900">
                      {ev.name}
                    </h3>
                    {(ev.startTime || ev.endTime) && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-900 ring-1 ring-emerald-200">
                        {(ev.startTime ?? "").trim()}
                        {ev.endTime ? `–${ev.endTime}` : ""}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
                    {ev.location ? (
                      <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-black/5">
                        <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                          Location
                        </div>
                        <div className="font-semibold">{ev.location}</div>
                      </div>
                    ) : null}

                    {ev.participants?.length ? (
                      <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-black/5">
                        <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                          Participants
                        </div>
                        <div className="font-semibold">
                          {ev.participants.join(", ")}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {ev.description ? (
                    <div className="mt-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
                      {ev.description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

