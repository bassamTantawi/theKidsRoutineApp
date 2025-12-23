"use client";

type TaskItemProps = {
  task: { id: string; name: string; done: boolean };
  isDone: boolean;
  onToggle: (targetEl?: HTMLElement) => void;
};

export function TaskItem({ task, isDone, onToggle }: TaskItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={(e) => onToggle(e.currentTarget)}
        className={[
          "group flex w-full items-center gap-3 rounded-xl p-3 text-left shadow-sm ring-1 ring-black/5 transition",
          isDone
            ? "bg-emerald-50 hover:bg-emerald-100"
            : "bg-white hover:bg-zinc-50",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-6 w-6 items-center justify-center rounded-lg border-2 transition",
            isDone
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
            isDone ? "text-emerald-900 line-through" : "text-zinc-900",
          ].join(" ")}
        >
          {task.name}
        </span>
      </button>
    </li>
  );
}

