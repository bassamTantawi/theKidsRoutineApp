"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { PeriodKey } from "./data/routines";
import { routinesData } from "./data/routines";
import { defaultSettings } from "./data/settings";
import { useAppConfig } from "./hooks/useAppConfig";
import { useEvents } from "./hooks/useEvents";
import { useSettings } from "./hooks/useSettings";
import { useToasts } from "./hooks/useToasts";
import { useTaskCompletion } from "./hooks/useTaskCompletion";
import { addMonths, formatMonthTitle } from "./utils/calendar";
import { sprinkleStars } from "./utils/stars";
import { ToastContainer } from "./components/shared/Toast";
import { LoginScreen } from "./components/shared/LoginScreen";
import { Chatbot } from "./components/shared/Chatbot";
import { RoutinesView } from "./components/routines/RoutinesView";
import { CalendarView } from "./components/calendar/CalendarView";
import { EventDetailsModal } from "./components/calendar/EventDetailsModal";
import { AddEventForm } from "./components/calendar/AddEventForm";

type TabKey = "routines" | "calendar";
type SettingsTabKey = "family" | "periods";

function HomeContent() {
  const searchParams = useSearchParams();
  const shareableId = searchParams.get("id") || searchParams.get("shareableId");

  const [tab, setTab] = useState<TabKey>("routines");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("family");

  const { appConfig } = useAppConfig(shareableId || undefined);
  const { settings, setSettings } = useSettings(appConfig);
  const { events, refreshEvents } = useEvents();
  const { toasts, pushToast } = useToasts();

  const starLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const starLayer = document.createElement("div");
    starLayer.className = "pointer-events-none fixed inset-0 z-[60]";
    document.body.appendChild(starLayer);
    starLayerRef.current = starLayer;
    return () => {
      document.body.removeChild(starLayer);
    };
  }, []);

  const sprinkleStarsWrapper = (target: HTMLElement) => {
    sprinkleStars(target, starLayerRef.current);
  };

  const { doneById, isDone, toggleDone, resetChecks } = useTaskCompletion({
    appConfig,
    pushToast,
    sprinkleStars: sprinkleStarsWrapper,
  });

  // Routines state
  const dayNames = useMemo(() => routinesData.days.map((d) => d.name), []);
  const defaultDay = dayNames[0] ?? "Sunday";
  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("morning");
  const [hideCompleted, setHideCompleted] = useState(true);

  // Calendar state
  const [month, setMonth] = useState("2025-12");
  const monthTitle = formatMonthTitle(month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventFormDate, setEventFormDate] = useState<string>("");

  const eventsForMonth = useMemo(() => {
    const prefix = `${month}-`;
    return events.filter((e) => e.date.startsWith(prefix));
  }, [month, events]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {};
    for (const ev of eventsForMonth) {
      (map[ev.date] ??= []).push(ev);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "") || a.name.localeCompare(b.name));
    }
    return map;
  }, [eventsForMonth]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate[selectedDate] ?? [];
  }, [eventsByDate, selectedDate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedDate(null);
        setEventFormOpen(false);
        setSettingsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function openAddEventForm(date: string) {
    setEventFormDate(date);
    setEventFormOpen(true);
  }

  function handleEventFormSuccess() {
    refreshEvents();
    setSelectedDate(eventFormDate);
  }

  // Show login screen if no shareable ID is provided
  if (!shareableId) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-sky-100 to-emerald-100 font-sans text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div ref={starLayerRef} className="pointer-events-none fixed inset-0 z-[60]" />
        <ToastContainer toasts={toasts} />

        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-zinc-700 shadow-sm ring-1 ring-black/5 backdrop-blur">
              {appConfig?.app?.pageTitle || "Loading..."}
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {tab === "routines" ? "Today's Mission Board" : "Family Calendar"}
            </h1>
            <p className="max-w-2xl text-sm text-zinc-700 sm:text-base">
              {tab === "routines"
                ? appConfig?.app?.defaultMessage || ""
                : "Tap a day to see all event details."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/parents"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 text-sm font-extrabold text-zinc-900 shadow-sm ring-1 ring-black/5 backdrop-blur hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:w-auto"
              >
                Parents View
              </Link>

              <div className="inline-flex w-full overflow-hidden rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur sm:w-auto">
                <button
                  type="button"
                  onClick={() => setTab("routines")}
                  className={[
                    "h-11 flex-1 px-4 text-sm font-extrabold transition sm:flex-none",
                    tab === "routines" ? "bg-zinc-900 text-white" : "text-zinc-800 hover:bg-white/60",
                  ].join(" ")}
                >
                  Routines
                </button>
                <button
                  type="button"
                  onClick={() => setTab("calendar")}
                  className={[
                    "h-11 flex-1 px-4 text-sm font-extrabold transition sm:flex-none",
                    tab === "calendar" ? "bg-zinc-900 text-white" : "text-zinc-800 hover:bg-white/60",
                  ].join(" ")}
                >
                  Calendar
                </button>
              </div>
            </div>

            {tab === "routines" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                    Weekday
                  </span>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="h-11 w-full rounded-xl bg-white/80 px-4 text-sm font-semibold shadow-sm ring-1 ring-black/5 backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-400 sm:w-48"
                  >
                    {dayNames.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                    Period
                  </span>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as PeriodKey)}
                    className="h-11 w-full rounded-xl bg-white/80 px-4 text-sm font-semibold shadow-sm ring-1 ring-black/5 backdrop-blur focus:outline-none focus:ring-2 focus:ring-pink-400 sm:w-56"
                  >
                    {routinesData.days
                      .find((d) => d.name === selectedDay)
                      ?.periods.map((p) => (
                        <option key={p.key} value={p.key}>
                          {settings.periods[p.key]?.label || p.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                  className="h-11 rounded-xl bg-white/80 px-4 text-sm font-extrabold text-zinc-900 shadow-sm ring-1 ring-black/5 backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  ← Prev
                </button>
                <div className="h-11 min-w-[12rem] rounded-xl bg-white/80 px-4 text-sm font-extrabold text-zinc-900 shadow-sm ring-1 ring-black/5 backdrop-blur flex items-center justify-center">
                  {monthTitle}
                </div>
                <button
                  type="button"
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                  className="h-11 rounded-xl bg-white/80 px-4 text-sm font-extrabold text-zinc-900 shadow-sm ring-1 ring-black/5 backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </header>

        {tab === "routines" ? (
          <RoutinesView
            selectedDay={selectedDay}
            selectedPeriod={selectedPeriod}
            settings={settings}
            doneById={doneById}
            hideCompleted={hideCompleted}
            onToggleDone={toggleDone}
            onResetChecks={resetChecks}
            onHideCompletedChange={setHideCompleted}
          />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <CalendarView
                  month={month}
                  eventsByDate={eventsByDate}
                  onDateClick={setSelectedDate}
                  onAddEvent={openAddEventForm}
                />
              </div>
              <div>
                <Chatbot height="600px" />
              </div>
            </div>

            {selectedDate && (
              <EventDetailsModal
                date={selectedDate}
                events={selectedEvents}
                onClose={() => setSelectedDate(null)}
                onAddEvent={openAddEventForm}
              />
            )}

            {eventFormOpen && (
              <AddEventForm
                date={eventFormDate}
                settings={settings}
                onClose={() => setEventFormOpen(false)}
                onSuccess={handleEventFormSuccess}
              />
            )}
          </>
        )}

        {/* Settings modal - keeping inline for now, can extract later */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur sm:items-center">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
              <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-extrabold text-white">Profile & Settings</p>
                  <p className="text-xs text-white/90">Customize your family and periods.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="h-10 rounded-xl bg-white/15 px-4 text-sm font-extrabold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Close
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-zinc-600">
                  Settings modal content - can be extracted to a component if needed.
                  For now, keeping it inline to maintain functionality.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-pink-100 via-sky-100 to-emerald-100 font-sans text-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-zinc-700">Loading...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
