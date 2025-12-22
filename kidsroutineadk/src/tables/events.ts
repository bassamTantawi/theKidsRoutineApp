import { Table, z } from "@botpress/runtime";

/**
 * Events Table
 * Mirrors the event shape used in `kidsroutineapp/app/data/calendar.ts`
 */
export default new Table({
  name: "EventsTable",
  columns: {
    // Client identifier (e.g., "client-001")
    clientId: { schema: z.string(), searchable: true },

    // e.g. "ev-001"
    eventId: { schema: z.string(), searchable: true },

    // e.g. "2025-12-19" (ISO date string)
    date: { schema: z.string(), searchable: true },

    // e.g. "School Winter Show"
    name: { schema: z.string(), searchable: true },

    // e.g. "17:00"
    startTime: z.string(),

    // e.g. "18:30"
    endTime: z.string(),

    // e.g. ["Mira", "Yazan", "Mom", "Dad"]
    participants: z.array(z.string()),

    // e.g. "School Auditorium"
    location: z.string(),

    // Free-form details
    description: z.string().optional(),
  },
});

export type EventRow = {
  id: string;
  clientId: string;
  eventId: string;
  date: string;
  name: string;
  startTime: string;
  endTime: string;
  participants: string[];
  location: string;
  description?: string;
};


