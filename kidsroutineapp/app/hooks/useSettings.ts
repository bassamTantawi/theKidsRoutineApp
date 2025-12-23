import { useEffect, useState } from "react";
import type { Settings } from "../data/settings";
import { defaultSettings } from "../data/settings";
import type { AppConfig } from "../data/config";

export function useSettings(appConfig: AppConfig) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Update settings with colors from config
  useEffect(() => {
    if (appConfig.kids.length === 0) return;
    
    setSettings((prev) => {
      const updatedKids = prev.kids.map((kid) => {
        const configKid = appConfig.kids.find((k) => k.name === kid.displayName);
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
  }, [appConfig]);

  // load/save settings to localStorage
  useEffect(() => {
    if (appConfig.kids.length === 0) return;
    
    try {
      const raw = window.localStorage.getItem("kidsRoutineApp.settings.v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings((prev) => {
          const mergedKids = (parsed.kids ?? prev.kids).map((localKid) => {
            const configKid = appConfig.kids.find((k) => k.name === localKid.displayName);
            return configKid
              ? {
                  ...localKid,
                  color: configKid.color,
                  label: configKid.label,
                  initial: configKid.initial,
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
  }, [appConfig]);

  useEffect(() => {
    try {
      window.localStorage.setItem("kidsRoutineApp.settings.v1", JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  return { settings, setSettings };
}

