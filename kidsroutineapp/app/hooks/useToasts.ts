import { useEffect, useRef, useState } from "react";
import type { Toast } from "../utils/toasts";

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    return () => {
      for (const t of Object.values(toastTimers.current)) {
        window.clearTimeout(t);
      }
    };
  }, []);

  function pushToast(message: string, variant: Toast["variant"]) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [{ id, message, variant }, ...prev].slice(0, 3));
    toastTimers.current[id] = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete toastTimers.current[id];
    }, variant === "champ" ? 3500 : 2200);
  }

  return { toasts, pushToast };
}

