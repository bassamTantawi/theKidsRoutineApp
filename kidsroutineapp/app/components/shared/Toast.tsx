import type { Toast } from "../../utils/toasts";

type ToastProps = {
  toasts: Toast[];
};

export function ToastContainer({ toasts }: ToastProps) {
  return (
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
  );
}

