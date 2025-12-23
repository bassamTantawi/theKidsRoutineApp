import type { PeriodKey } from "./routines";

export type KidKey = "Mira" | "Yazan";

export type SettingsTabKey = "family" | "periods";

export type Settings = {
  familyMembers: string[]; // includes kids + parents, etc
  kids: Array<{
    key: KidKey; // MUST match routinesData task keys
    displayName: string; // what we show in UI
    label: string;
    initial: string;
    color: string; // Hex color code (e.g., "#a855f7")
  }>;
  periods: Record<
    PeriodKey,
    {
      label: string; // UI label (override)
      helper?: string; // small description shown in settings
    }
  >;
};

// Default settings - kids will be populated from Botpress config
export const defaultSettings: Settings = {
  familyMembers: ["Mira", "Yazan", "Mom", "Dad"],
  kids: [
    {
      key: "Mira",
      displayName: "Mira",
      label: "Super Star",
      initial: "M",
      color: "#a855f7", // Will be overridden by config from Botpress
    },
    {
      key: "Yazan",
      displayName: "Yazan",
      label: "Power Champ",
      initial: "Y",
      color: "#06b6d4", // Will be overridden by config from Botpress
    },
  ],
  periods: {
    morning: { label: "Morning", helper: "Before school / start of day" },
    afterSchool: { label: "After School", helper: "After school / afternoon" },
    beforeSleep: { label: "Before Sleep", helper: "Evening wind-down" },
  },
};


