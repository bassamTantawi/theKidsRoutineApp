import { useRef, useState } from "react";
import { playSuccessSound, playCelebrationSound } from "../utils/sounds";
import { randomFrom } from "../utils/toasts";
import type { AppConfig } from "../data/config";

type UseTaskCompletionProps = {
  appConfig: AppConfig;
  pushToast: (message: string, variant: "cheer" | "champ") => void;
  sprinkleStars: (target: HTMLElement) => void;
};

export function useTaskCompletion({ appConfig, pushToast, sprinkleStars }: UseTaskCompletionProps) {
  const [doneById, setDoneById] = useState<Record<string, boolean>>({});
  const lastAllDoneByKidRef = useRef<Record<string, boolean>>({});

  function isDone(taskId: string, initial: boolean) {
    return doneById[taskId] ?? initial;
  }

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

  function resetChecks() {
    setDoneById({});
  }

  return { doneById, isDone, toggleDone, resetChecks };
}

