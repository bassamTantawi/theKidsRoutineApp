import { Workflow, z, context } from "@botpress/runtime";
import ConfigTable from "../tables/config";

/**
 * Idempotent seeder for ConfigTable:
 * - If config for clientId already exists, do nothing (unless force=true)
 * - Otherwise, inserts default config
 */
export default new Workflow({
  name: "seed_config",
  input: z.object({
    force: z
      .boolean()
      .optional()
      .describe("If true, seed even when config already exists"),
    clientId: z
      .string()
      .optional()
      .describe("Client ID for the config (defaults to 'default')"),
  }),
  output: z.object({
    seeded: z.boolean(),
    existing: z.boolean().optional(),
    insertedCount: z.number().optional(),
  }),
  handler: async ({ input }) => {
    const clientId = input.clientId || "default";
    console.log("[SEED_CONFIG] Starting seed workflow", {
      force: input.force ?? false,
      clientId,
      timestamp: new Date().toISOString(),
    });

    try {
      console.log("[SEED_CONFIG] Checking for existing config...");
      const { rows: existing } = await ConfigTable.findRows({
        filter: {
          clientId: { $eq: clientId },
        },
        limit: 1,
      });

      const hasExisting = existing.length > 0;

      console.log("[SEED_CONFIG] Found existing config:", {
        hasExisting,
        clientId,
      });

      if (hasExisting && !input.force) {
        console.log("[SEED_CONFIG] Skipping seed - config already exists and force=false");
        return {
          seeded: false,
          existing: true,
        };
      }

      if (hasExisting && input.force) {
        console.log("[SEED_CONFIG] Force mode enabled - will recreate config");
        // Delete existing config
        const client = context.get("client");
        await client.deleteTableRows({
          table: "ConfigTable",
          ids: existing.map((r) => Number(r.id)),
        });
        console.log("[SEED_CONFIG] Deleted existing config");
      }

      const seedRow = {
        clientId,
        title: "Bassam's House",
        subtitle: "Pick a list and let's start crushing these tasks! 🚀",
        kids: [
          {
            name: "Mira",
            label: "Super Star",
            initial: "M",
            color: "#a855f7", // Purple (fuchsia-500 equivalent)
          },
          {
            name: "Yazan",
            label: "Power Champ",
            initial: "Y",
            color: "#06b6d4", // Cyan (sky-500 equivalent)
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
      };

      console.log("[SEED_CONFIG] Preparing to insert config row:", {
        clientId: seedRow.clientId,
        title: seedRow.title,
      });

      console.log("[SEED_CONFIG] Calling ConfigTable.createRows...");
      const { rows } = await ConfigTable.createRows({ rows: [seedRow] });

      console.log("[SEED_CONFIG] Insert successful:", {
        insertedCount: rows.length,
        insertedId: rows[0]?.id,
      });

      const result = {
        seeded: true,
        insertedCount: rows.length,
      };

      console.log("[SEED_CONFIG] Workflow completed successfully", result);
      return result;
    } catch (error) {
      console.error("[SEED_CONFIG] Error during seed workflow:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        input,
      });
      throw error;
    }
  },
});

