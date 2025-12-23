/**
 * AppConfig type definition
 * This matches the structure stored in Botpress ConfigTable
 */
export type AppConfig = {
  app: {
    pageTitle: string;
    defaultMessage: string;
  };
  kids: Array<{
    name: string;
    label: string;
    initial: string;
    color: string; // Hex color code (e.g., "#a855f7")
  }>;
  lists: Array<{
    id: string;
    displayName: string;
    prettyName: string;
  }>;
  messages: {
    cheers: string[];
    champMessages: string[];
  };
};

/**
 * Minimal fallback config used only when API fails
 * This should match the default data in Botpress ConfigTable
 */
const createFallbackConfig = (): AppConfig => ({
  app: {
    pageTitle: "Bassam's House",
    defaultMessage: "Pick a list and let's start crushing these tasks! 🚀",
  },
  kids: [
    {
      name: "Mira",
      label: "Super Star",
      initial: "M",
      color: "#a855f7",
    },
    {
      name: "Yazan",
      label: "Power Champ",
      initial: "Y",
      color: "#06b6d4",
    },
  ],
  lists: [
    {
      id: "morning",
      displayName: "Morning",
      prettyName: "Morning Mission",
    },
    {
      id: "evening",
      displayName: "Evening",
      prettyName: "Evening Power-Up",
    },
  ],
  messages: {
    cheers: [
      "Boom! You're unstoppable! 🌟",
      "High five! Another one down! 🙌",
      "Look at that streak! Keep it going! 🚀",
      "Legends in the making — great job! 🏆",
      "Tasks fear you. You got this! 💪",
      "Sparkle power activated! ✨",
      "Champion move! Next one? 🔥",
      "So proud of you. Keep shining! ⭐",
    ],
    champMessages: [
      "🏆 {name}, you're a CHAMP! You did it all! 🏆",
      "🌟 {name} is a SUPERSTAR! All tasks complete! 🌟",
      "🎉 {name} crushed it! Everything done! 🎉",
      "⭐ {name}, you're AMAZING! All tasks finished! ⭐",
    ],
  },
});

/**
 * Fetches config from Botpress ConfigTable via API
 * @param options - Either clientId (defaults to "default") or shareableId
 * @returns AppConfig from Botpress or fallback config if API fails
 */
export async function getAppConfig(
  options: string | { clientId?: string; shareableId?: string } = "default"
): Promise<AppConfig> {
  try {
    let url = "/api/config?";
    if (typeof options === "string") {
      // Backward compatibility: treat string as clientId
      url += `clientId=${encodeURIComponent(options)}`;
    } else {
      if (options.shareableId) {
        url += `id=${encodeURIComponent(options.shareableId)}`;
      } else {
        url += `clientId=${encodeURIComponent(options.clientId || "default")}`;
      }
    }

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.config;
    } else {
      console.error("Failed to fetch config:", response.statusText);
      return createFallbackConfig();
    }
  } catch (error) {
    console.error("Error fetching config:", error);
    return createFallbackConfig();
  }
}
