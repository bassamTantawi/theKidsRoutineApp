import { Workflow, z, context } from "@botpress/runtime";
import EventsTable from "../tables/events";

/**
 * Idempotent seeder for EventsTable:
 * - If table already has at least 1 row, do nothing
 * - Otherwise, inserts a few sample events
 */
export default new Workflow({
  name: "seed_events",
  input: z.object({
    force: z
      .boolean()
      .optional()
      .describe("If true, seed even when rows already exist"),
  }),
  output: z.object({
    seeded: z.boolean(),
    existingCount: z.number().optional(),
    insertedCount: z.number().optional(),
  }),
  handler: async ({ input }) => {
    console.log("[SEED_EVENTS] Starting seed workflow", {
      force: input.force ?? false,
      timestamp: new Date().toISOString(),
    });

    try {
      console.log("[SEED_EVENTS] Checking for existing rows in EventsTable...");
      const { rows: existing } = await EventsTable.findRows({ limit: 1 });
      const existingCount = existing.length;

      console.log("[SEED_EVENTS] Found existing rows:", {
        count: existingCount,
        sampleRow: existing[0] ? { id: existing[0].id, eventId: existing[0].eventId } : null,
      });

      if (existingCount > 0 && !input.force) {
        console.log("[SEED_EVENTS] Skipping seed - table already has rows and force=false");
        return {
          seeded: false,
          existingCount,
        };
      }

      if (existingCount > 0 && input.force) {
        console.log("[SEED_EVENTS] Force mode enabled - will seed despite existing rows");
      }

      const seedRows = [
        {
          clientId: "1",
          eventId: "ev-001",
          date: "2025-12-19",
          name: "School Winter Show",
          startTime: "17:00",
          endTime: "18:30",
          participants: ["Mira", "Yazan", "Mom", "Dad"],
          location: "School Auditorium",
          description: "Bring warm clothes. Arrive 15 minutes early for seating.",
        },
        {
          clientId: "1",
          eventId: "ev-002",
          date: "2025-12-21",
          name: "Playdate with Friends",
          startTime: "16:00",
          endTime: "18:00",
          participants: ["Mira", "Yazan"],
          location: "Community Park",
          description: "Snacks + water bottles. Meet near the big slide.",
        },
        {
          clientId: "1",
          eventId: "ev-003",
          date: "2025-12-21",
          name: "Library Story Time",
          startTime: "10:30",
          endTime: "11:15",
          participants: ["Mira"],
          location: "City Library",
          description: "Pick 2 books to borrow after the story!",
        },
        {
          clientId: "1",
          eventId: "ev-004",
          date: "2025-12-24",
          name: "Family Dinner",
          startTime: "19:00",
          endTime: "21:00",
          participants: ["Mira", "Yazan", "Family"],
          location: "Grandma's House",
          description: "Bring the drawing gift for grandma.",
        },
      ];

      console.log("[SEED_EVENTS] Preparing to insert rows:", {
        count: seedRows.length,
        eventIds: seedRows.map((r) => r.eventId),
      });

      console.log("[SEED_EVENTS] Calling EventsTable.createRows...");
      const { rows } = await EventsTable.createRows({ rows: seedRows });

      console.log("[SEED_EVENTS] Insert successful:", {
        insertedCount: rows.length,
        insertedIds: rows.map((r: { id: string; eventId: string }) => ({ id: r.id, eventId: r.eventId })),
      });

      const result = {
        seeded: true,
        insertedCount: rows.length,
      };

      console.log("[SEED_EVENTS] Workflow completed successfully", result);
      return result;
    } catch (error) {
      console.error("[SEED_EVENTS] Error during seed workflow:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        input,
      });
      throw error;
    }
  },
});


