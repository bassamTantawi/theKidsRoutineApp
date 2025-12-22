"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KidName, Period, PeriodKey } from "./data/routines";
import { KIDS, routinesData } from "./data/routines";
import type { AppConfig } from "./data/config";
import { getAppConfig } from "./data/config";
import type { CalendarEvent } from "./data/calendar";
import { fallbackEvents } from "./data/calendar";
import type { Settings } from "./data/settings";
import { defaultSettings } from "./data/settings";

function playSuccessSound() {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new Ctx();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Create a pleasant two-tone success sound
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
  oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
  oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.4);

  // Best-effort cleanup (some browsers may no-op if already closed)
  setTimeout(() => {
    void audioContext.close();
  }, 700);
}

function playCelebrationSound() {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new Ctx();

  // Play a fanfare-like sequence
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }, index * 150);
  });

  setTimeout(() => {
    void audioContext.close();
  }, notes.length * 150 + 800);
}

type Toast = {
  id: string;
  message: string;
  variant: "cheer" | "champ";
};

type TabKey = "routines" | "calendar";
type SettingsTabKey = "family" | "periods";

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function monthToDate(month: string) {
  const [y, m] = month.split("-").map((v) => Number(v));
  // first day of month in local time
  return new Date(y, (m ?? 1) - 1, 1);
}

function addMonths(month: string, delta: number) {
  const d = monthToDate(month);
  d.setMonth(d.getMonth() + delta);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${pad2(m)}`;
}

function formatMonthTitle(month: string) {
  const d = monthToDate(month);
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(d);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export default function Home() {
  const [tab, setTab] = useState<TabKey>("routines");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("family");

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  // Initialize with minimal config - will be populated from Botpress
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    // Minimal fallback until config loads from Botpress
    return {
      app: { pageTitle: "Loading...", defaultMessage: "" },
      kids: [],
      lists: [],
      messages: { cheers: [], champMessages: [] },
    };
  });
  const [configLoading, setConfigLoading] = useState(true);

  const starLayerRef = useRef<HTMLDivElement | null>(null);

  function sprinkleStars(target: HTMLElement) {
    const starLayer = starLayerRef.current;
    if (!starLayer) return;

    const rect = target.getBoundingClientRect();
    const count = 14;
    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "★";

      const spreadX = (Math.random() - 0.5) * rect.width;
      const spreadY = (Math.random() - 0.5) * rect.height;

      // starLayer is position:fixed, so use viewport coords (no scroll offsets needed)
      star.style.left = `${rect.left + rect.width / 2 + spreadX}px`;
      star.style.top = `${rect.top + rect.height / 2 + spreadY}px`;
      star.style.animationDelay = `${Math.random() * 120}ms`;

      starLayer.appendChild(star);
      setTimeout(() => star.remove(), 1000);
    }
  }

  // Fetch config from Botpress first
  useEffect(() => {
    async function fetchConfig() {
      try {
        const config = await getAppConfig("default"); // You can make this dynamic later
        setAppConfig(config);
        
        // Update settings with colors from config
        setSettings((prev) => {
          const updatedKids = prev.kids.map((kid) => {
            const configKid = config.kids.find((k) => k.name === kid.displayName);
            return configKid
              ? {
                  ...kid,
                  color: configKid.color,
                  label: configKid.label,
                  initial: configKid.initial,
                }
              : kid;
          });
          
          return {
            ...prev,
            kids: updatedKids,
          };
        });
      } catch (error) {
        console.error("Error fetching config:", error);
        // Config will remain null, component should handle this
      } finally {
        setConfigLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // load/save settings to localStorage (but preserve colors from config)
  useEffect(() => {
    // Only merge localStorage after config has loaded (has kids data)
    if (appConfig.kids.length === 0) return;
    
    try {
      const raw = window.localStorage.getItem("kidsRoutineApp.settings.v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings((prev) => {
          // Merge localStorage settings but keep colors from config
          const mergedKids = (parsed.kids ?? prev.kids).map((localKid) => {
            const configKid = appConfig.kids.find((k) => k.name === localKid.displayName);
            return configKid
              ? {
                  ...localKid,
                  color: configKid.color, // Always use color from config
                  label: configKid.label, // Always use label from config
                  initial: configKid.initial, // Always use initial from config
                }
              : localKid;
          });
          
          return {
            ...prev,
            ...parsed,
            kids: mergedKids,
            periods: parsed.periods ?? prev.periods,
            familyMembers: parsed.familyMembers ?? prev.familyMembers,
          };
        });
      }
    } catch {
      // ignore
    }
  }, [appConfig]); // Re-run when config is loaded

  useEffect(() => {
    try {
      window.localStorage.setItem("kidsRoutineApp.settings.v1", JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const dayNames = useMemo(
    () => routinesData.days.map((d) => d.name),
    [],
  );

  const defaultDay = dayNames[0] ?? "Sunday";
  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);

  const dayData = useMemo(
    () => routinesData.days.find((d) => d.name === selectedDay),
    [selectedDay],
  );

  const periodOptions = useMemo(() => {
    if (!dayData) return [];
    return dayData.periods.map((p) => ({
      key: p.key,
      name: settings.periods[p.key]?.label || p.name,
    }));
  }, [dayData, settings.periods]);

  const defaultPeriod = periodOptions[0]?.key ?? "morning";
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>(defaultPeriod);

  // keep selection valid if day changes
  const effectivePeriod = useMemo<PeriodKey>(() => {
    if (periodOptions.some((p) => p.key === selectedPeriod)) return selectedPeriod;
    return periodOptions[0]?.key ?? "morning";
  }, [periodOptions, selectedPeriod]);

  const periodData = useMemo<Period | undefined>(
    () => dayData?.periods.find((p) => p.key === effectivePeriod),
    [dayData, effectivePeriod],
  );

  const [doneById, setDoneById] = useState<Record<string, boolean>>({});
  const [hideCompleted, setHideCompleted] = useState(true);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    return () => {
      for (const t of Object.values(toastTimers.current)) {
        window.clearTimeout(t);
      }
    };
  }, []);

  function randomFrom<T>(arr: T[]): T | undefined {
    if (!arr.length) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pushToast(message: string, variant: Toast["variant"]) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [{ id, message, variant }, ...prev].slice(0, 3));
    toastTimers.current[id] = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete toastTimers.current[id];
    }, variant === "champ" ? 3500 : 2200);
  }

  function isDone(taskId: string, initial: boolean) {
    return doneById[taskId] ?? initial;
  }

  const lastAllDoneByKidRef = useRef<Record<string, boolean>>({});

  function toggleDone(
    taskId: string,
    initial: boolean,
    kidName: string,
    kidTasks: { id: string; done: boolean }[],
    targetEl?: HTMLElement,
  ) {
    setDoneById((prev) => {
      const nextDone = !(prev[taskId] ?? initial);

      if (nextDone) {
        playSuccessSound();
        if (targetEl) sprinkleStars(targetEl);
        const cheer = randomFrom(appConfig?.messages?.cheers || []);
        if (cheer) pushToast(cheer, "cheer");
      }

      // compute "all done" for this kid after applying the toggle
      const allDoneAfter = kidTasks.every((t) => {
        const base = prev[t.id] ?? t.done;
        const v = t.id === taskId ? nextDone : base;
        return Boolean(v);
      });

      const wasAllDone = lastAllDoneByKidRef.current[kidName] ?? false;
      if (allDoneAfter && !wasAllDone) {
        lastAllDoneByKidRef.current[kidName] = true;
        playCelebrationSound();
        const template = randomFrom(appConfig?.messages?.champMessages || []);
        if (template) {
          pushToast(template.replaceAll("{name}", kidName), "champ");
        }
      }
      if (!allDoneAfter && wasAllDone) {
        lastAllDoneByKidRef.current[kidName] = false;
      }

      return { ...prev, [taskId]: nextDone };
    });
  }

  // Calendar state (month-by-month)
  const [month, setMonth] = useState("2025-12");
  const monthTitle = formatMonthTitle(month);

  // Fetch events from Botpress tables
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        } else {
          console.error("Failed to fetch events:", response.statusText);
          // Fallback to empty array if API fails
          setEvents(fallbackEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        // Fallback to empty array if API fails
        setEvents(fallbackEvents);
      } finally {
        setEventsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const eventsForMonth = useMemo<CalendarEvent[]>(() => {
    const prefix = `${month}-`;
    return events.filter((e) => e.date.startsWith(prefix));
  }, [month, events]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of eventsForMonth) {
      (map[ev.date] ??= []).push(ev);
    }
    // sort per day by start time, then name
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "") || a.name.localeCompare(b.name));
    }
    return map;
  }, [eventsForMonth]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate[selectedDate] ?? [];
  }, [eventsByDate, selectedDate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedDate(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-sky-100 to-emerald-100 font-sans text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Star layer */}
        <div ref={starLayerRef} className="pointer-events-none fixed inset-0 z-[60]" />

        {/* Toasts */}
        <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[
                "rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ring-1 backdrop-blur",
                t.variant === "champ"
                  ? "bg-amber-100/90 text-amber-900 ring-amber-200"
                  : "bg-white/90 text-zinc-900 ring-black/10",
              ].join(" ")}
            >
              {t.message}
            </div>
          ))}
        </div>

        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-zinc-700 shadow-sm ring-1 ring-black/5 backdrop-blur">
              {appConfig?.app?.pageTitle || "Loading..."}
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {tab === "routines" ? "Today’s Mission Board" : "Family Calendar"}
            </h1>
            <p className="max-w-2xl text-sm text-zinc-700 sm:text-base">
              {tab === "routines"
                ? appConfig?.app?.defaultMessage || ""
                : "Tap a day to see all event details."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSettingsTab("family");
                  setSettingsOpen(true);
                }}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 text-sm font-extrabold text-zinc-900 shadow-sm ring-1 ring-black/5 backdrop-blur hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:w-auto"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 text-xs font-extrabold text-white">
                  {settings.kids[0]?.initial ?? "P"}
                </span>
                Profile
              </button>

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
                    value={effectivePeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as PeriodKey)}
                    className="h-11 w-full rounded-xl bg-white/80 px-4 text-sm font-semibold shadow-sm ring-1 ring-black/5 backdrop-blur focus:outline-none focus:ring-2 focus:ring-pink-400 sm:w-56"
                  >
                    {periodOptions.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name}
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
          <>
            <section className="mb-6 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur sm:mb-8 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-zinc-800">
                    {selectedDay} • {periodData?.name ?? "No tasks"}
                  </p>
                  <p className="text-xs text-zinc-600">
                    Tap a task to mark it done (this is saved only on this device tab for now).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex h-10 cursor-pointer select-none items-center gap-2 rounded-xl bg-white/80 px-3 text-sm font-semibold text-zinc-800 shadow-sm ring-1 ring-black/5 backdrop-blur">
                    <input
                      type="checkbox"
                      checked={hideCompleted}
                      onChange={(e) => setHideCompleted(e.target.checked)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    Hide completed
                  </label>

                  <button
                    type="button"
                    onClick={() => setDoneById({})}
                    className="h-10 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  >
                    Reset checks
                  </button>
                </div>
              </div>
            </section>

            <main className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              {settings.kids.map((kidCfg) => {
                const kid = kidCfg.key;
                const tasks = periodData?.tasks?.kids?.[kid as KidName] ?? [];
                const completedCount = tasks.reduce(
                  (acc, t) => acc + (isDone(t.id, t.done) ? 1 : 0),
                  0,
                );
                const visibleTasks = hideCompleted
                  ? tasks.filter((t) => !isDone(t.id, t.done))
                  : tasks;
                // Generate gradient from hex color
                const hexToRgb = (hex: string) => {
                  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                  return result
                    ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16),
                      }
                    : { r: 113, g: 113, b: 122 }; // Default to zinc-500
                };
                const rgb = hexToRgb(kidCfg.color);
                const headerBg = `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}), rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)}))`;

                return (
                  <section
                    key={kid}
                    className="overflow-hidden rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur"
                  >
                    <div className="px-5 py-4" style={{ background: headerBg }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-xl font-extrabold text-white">{kidCfg.displayName}</h2>
                          <span className="text-xs font-bold text-white/90">
                            {kidCfg.label}
                          </span>
                        </div>
                        <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white">
                          {completedCount}/{tasks.length} done
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      {tasks.length === 0 ? (
                        <div className="rounded-xl bg-white p-4 text-sm text-zinc-600 ring-1 ring-black/5">
                          No tasks for this period.
                        </div>
                      ) : visibleTasks.length === 0 ? (
                        <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-200">
                          All done! Great job 🎉
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {visibleTasks.map((t) => {
                            const done = isDone(t.id, t.done);
                            return (
                              <li key={t.id}>
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    toggleDone(
                                      t.id,
                                      t.done,
                                      kidCfg.displayName,
                                      tasks,
                                      e.currentTarget,
                                    )
                                  }
                                  className={[
                                    "group flex w-full items-center gap-3 rounded-xl p-3 text-left shadow-sm ring-1 ring-black/5 transition",
                                    done
                                      ? "bg-emerald-50 hover:bg-emerald-100"
                                      : "bg-white hover:bg-zinc-50",
                                  ].join(" ")}
                                >
                                  <span
                                    className={[
                                      "flex h-6 w-6 items-center justify-center rounded-lg border-2 transition",
                                      done
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-zinc-300 bg-white text-transparent group-hover:border-zinc-400",
                                    ].join(" ")}
                                    aria-hidden="true"
                                  >
                                    ✓
                                  </span>
                                  <span
                                    className={[
                                      "text-sm font-semibold",
                                      done ? "text-emerald-900 line-through" : "text-zinc-900",
                                    ].join(" ")}
                                  >
                                    {t.name}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </section>
                );
              })}
            </main>
          </>
        ) : (
          <>
            <section className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur sm:p-5">
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-extrabold uppercase tracking-wide text-zinc-700"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {(() => {
                const first = monthToDate(month);
                const year = first.getFullYear();
                const monthIndex = first.getMonth();
                const startWeekday = first.getDay(); // 0=Sun
                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

                const cells: Array<{ date: string | null; dayNumber?: number }> = [];
                for (let i = 0; i < startWeekday; i++) cells.push({ date: null });
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
                  cells.push({ date, dayNumber: day });
                }
                // complete last week to keep grid aligned
                while (cells.length % 7 !== 0) cells.push({ date: null });

                return (
                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {cells.map((c, idx) => {
                      if (!c.date) {
                        return (
                          <div
                            key={`empty-${idx}`}
                            className="h-24 rounded-2xl bg-white/40 ring-1 ring-black/5 sm:h-28"
                          />
                        );
                      }

                      const dayEvents = eventsByDate[c.date] ?? [];
                      const hasEvents = dayEvents.length > 0;
                      return (
                        <button
                          key={c.date}
                          type="button"
                          onClick={() => setSelectedDate(c.date)}
                          className={[
                            "relative h-24 overflow-hidden rounded-2xl p-2 text-left shadow-sm ring-1 transition sm:h-28",
                            hasEvents
                              ? "bg-gradient-to-br from-amber-100 via-pink-100 to-sky-100 ring-amber-200 hover:brightness-[0.98]"
                              : "bg-white/70 ring-black/5 hover:bg-white/90",
                          ].join(" ")}
                        >
                          <div className="absolute right-2 top-2 rounded-lg bg-white/80 px-2 py-0.5 text-xs font-extrabold text-zinc-900 ring-1 ring-black/5">
                            {c.dayNumber}
                          </div>

                          {hasEvents ? (
                            <div className="mt-6 space-y-1">
                              {dayEvents.slice(0, 3).map((ev) => (
                                <div
                                  key={ev.id}
                                  className="truncate rounded-lg bg-white/80 px-2 py-1 text-xs font-extrabold text-zinc-900 ring-1 ring-black/5"
                                  title={ev.name}
                                >
                                  {ev.name}
                                </div>
                              ))}
                              {dayEvents.length > 3 ? (
                                <div className="text-xs font-bold text-zinc-700">
                                  +{dayEvents.length - 3} more
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="mt-8 text-xs font-semibold text-zinc-500">
                              No events
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </section>

            {/* Day overlay */}
            {selectedDate ? (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur sm:items-center">
                <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
                  <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-zinc-900 to-zinc-800 px-5 py-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-extrabold text-white">
                        Events • {selectedDate}
                      </p>
                      <p className="text-xs text-white/80">
                        {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(null)}
                      className="h-10 rounded-xl bg-white/10 px-4 text-sm font-extrabold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                      Close
                    </button>
                  </div>

                  <div className="max-h-[70vh] overflow-auto p-5">
                    {selectedEvents.length === 0 ? (
                      <div className="rounded-2xl bg-zinc-50 p-4 text-sm font-semibold text-zinc-700 ring-1 ring-black/5">
                        No events on this day.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedEvents.map((ev) => (
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
            ) : null}
          </>
        )}

        {/* Settings modal */}
        {settingsOpen ? (
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
                <div className="mb-4 inline-flex overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={() => setSettingsTab("family")}
                    className={[
                      "h-10 px-4 text-sm font-extrabold",
                      settingsTab === "family" ? "bg-white text-zinc-900" : "text-zinc-700 hover:bg-white/60",
                    ].join(" ")}
                  >
                    Family
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsTab("periods")}
                    className={[
                      "h-10 px-4 text-sm font-extrabold",
                      settingsTab === "periods" ? "bg-white text-zinc-900" : "text-zinc-700 hover:bg-white/60",
                    ].join(" ")}
                  >
                    Periods
                  </button>
                </div>

                {settingsTab === "family" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5">
                      <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                        Family members (comma separated)
                      </div>
                      <input
                        value={settings.familyMembers.join(", ")}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            familyMembers: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        className="h-11 w-full rounded-xl bg-white px-4 text-sm font-semibold text-zinc-900 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Mira, Yazan, Mom, Dad"
                      />
                      <p className="mt-2 text-xs text-zinc-600">
                        Tip: these can be used for calendar participants later.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {settings.kids.map((k) => (
                        <div
                          key={k.key}
                          className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="text-sm font-extrabold text-zinc-900">
                              Kid key: <span className="font-black">{k.key}</span>
                            </div>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900 ring-1 ring-amber-200">
                              Key must match routines JSON
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-1">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                                Display name
                              </div>
                              <input
                                value={k.displayName}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    kids: prev.kids.map((x) =>
                                      x.key === k.key ? { ...x, displayName: e.target.value } : x,
                                    ),
                                  }))
                                }
                                className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              />
                            </label>

                            <label className="space-y-1">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                                Label
                              </div>
                              <input
                                value={k.label}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    kids: prev.kids.map((x) =>
                                      x.key === k.key ? { ...x, label: e.target.value } : x,
                                    ),
                                  }))
                                }
                                className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              />
                            </label>

                            <label className="space-y-1">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                                Initial
                              </div>
                              <input
                                value={k.initial}
                                maxLength={2}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    kids: prev.kids.map((x) =>
                                      x.key === k.key ? { ...x, initial: e.target.value } : x,
                                    ),
                                  }))
                                }
                                className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              />
                            </label>

                            <label className="space-y-1">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                                Color
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={k.color}
                                  onChange={(e) =>
                                    setSettings((prev) => ({
                                      ...prev,
                                      kids: prev.kids.map((x) =>
                                        x.key === k.key ? { ...x, color: e.target.value } : x,
                                      ),
                                    }))
                                  }
                                  className="h-11 w-20 cursor-pointer rounded-xl border-0 bg-zinc-50 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                />
                                <input
                                  type="text"
                                  value={k.color}
                                  onChange={(e) =>
                                    setSettings((prev) => ({
                                      ...prev,
                                      kids: prev.kids.map((x) =>
                                        x.key === k.key ? { ...x, color: e.target.value } : x,
                                      ),
                                    }))
                                  }
                                  placeholder="#a855f7"
                                  className="h-11 flex-1 rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                />
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSettings(defaultSettings)}
                        className="h-11 rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                      >
                        Reset to defaults
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(
                      [
                        ["morning", "Morning"],
                        ["afterSchool", "After School"],
                        ["beforeSleep", "Before Sleep"],
                      ] as Array<[PeriodKey, string]>
                    ).map(([key, fallback]) => (
                      <div
                        key={key}
                        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-extrabold text-zinc-900">{fallback}</div>
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-extrabold text-zinc-700 ring-1 ring-black/5">
                            {key}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1">
                            <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                              Label
                            </div>
                            <input
                              value={settings.periods[key]?.label ?? fallback}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  periods: {
                                    ...prev.periods,
                                    [key]: { ...prev.periods[key], label: e.target.value },
                                  },
                                }))
                              }
                              className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                          </label>
                          <label className="space-y-1">
                            <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                              Helper text
                            </div>
                            <input
                              value={settings.periods[key]?.helper ?? ""}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  periods: {
                                    ...prev.periods,
                                    [key]: { ...prev.periods[key], helper: e.target.value },
                                  },
                                }))
                              }
                              className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-pink-400"
                              placeholder="Optional"
                            />
                          </label>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
                      Note: routines still come from your routines JSON; this only changes labels shown in the UI.
                    </div>

                    <button
                      type="button"
                      onClick={() => setSettings(defaultSettings)}
                      className="h-11 rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    >
                      Reset to defaults
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
