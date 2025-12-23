"use client";

import { useMemo } from "react";
import type { KidName, Period, PeriodKey } from "../../data/routines";
import { routinesData } from "../../data/routines";
import type { Settings } from "../../data/settings";
import { KidTaskCard } from "./KidTaskCard";

type RoutinesViewProps = {
  selectedDay: string;
  selectedPeriod: PeriodKey;
  settings: Settings;
  doneById: Record<string, boolean>;
  hideCompleted: boolean;
  onToggleDone: (
    taskId: string,
    initial: boolean,
    kidName: string,
    kidTasks: { id: string; done: boolean }[],
    targetEl?: HTMLElement,
  ) => void;
  onResetChecks: () => void;
  onHideCompletedChange: (hide: boolean) => void;
};

export function RoutinesView({
  selectedDay,
  selectedPeriod,
  settings,
  doneById,
  hideCompleted,
  onToggleDone,
  onResetChecks,
  onHideCompletedChange,
}: RoutinesViewProps) {
  const dayNames = useMemo(
    () => routinesData.days.map((d) => d.name),
    [],
  );

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

  const effectivePeriod = useMemo<PeriodKey>(() => {
    if (periodOptions.some((p) => p.key === selectedPeriod)) return selectedPeriod;
    return periodOptions[0]?.key ?? "morning";
  }, [periodOptions, selectedPeriod]);

  const periodData = useMemo<Period | undefined>(
    () => dayData?.periods.find((p) => p.key === effectivePeriod),
    [dayData, effectivePeriod],
  );

  function isDone(taskId: string, initial: boolean) {
    return doneById[taskId] ?? initial;
  }

  return (
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
                onChange={(e) => onHideCompletedChange(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Hide completed
            </label>

            <button
              type="button"
              onClick={onResetChecks}
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
          
          return (
            <KidTaskCard
              key={kid}
              kidConfig={kidCfg}
              tasks={tasks}
              doneById={doneById}
              hideCompleted={hideCompleted}
              isDone={isDone}
              onToggleDone={onToggleDone}
            />
          );
        })}
      </main>
    </>
  );
}

