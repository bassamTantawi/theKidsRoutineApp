"use client";

import type { Settings } from "../../data/settings";
import { TaskItem } from "./TaskItem";

type KidTaskCardProps = {
  kidConfig: Settings["kids"][0];
  tasks: Array<{ id: string; name: string; done: boolean }>;
  doneById: Record<string, boolean>;
  hideCompleted: boolean;
  isDone: (taskId: string, initial: boolean) => boolean;
  onToggleDone: (
    taskId: string,
    initial: boolean,
    kidName: string,
    kidTasks: { id: string; done: boolean }[],
    targetEl?: HTMLElement,
  ) => void;
};

export function KidTaskCard({
  kidConfig,
  tasks,
  doneById,
  hideCompleted,
  isDone,
  onToggleDone,
}: KidTaskCardProps) {
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
  const rgb = hexToRgb(kidConfig.color);
  const headerBg = `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}), rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)}))`;

  return (
    <section className="overflow-hidden rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur">
      <div className="px-5 py-4" style={{ background: headerBg }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-extrabold text-white">{kidConfig.displayName}</h2>
            <span className="text-xs font-bold text-white/90">
              {kidConfig.label}
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
            {visibleTasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                isDone={isDone(t.id, t.done)}
                onToggle={() =>
                  onToggleDone(
                    t.id,
                    t.done,
                    kidConfig.displayName,
                    tasks,
                  )
                }
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

