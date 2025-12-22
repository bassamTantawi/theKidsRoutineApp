import { Table, z } from "@botpress/runtime";

/**
 * Config Table
 * Stores configuration per client (multi-tenant support)
 */
export default new Table({
  name: "ConfigTable",
  columns: {
    // Client identifier (e.g., "client-001")
    clientId: { schema: z.string(), searchable: true },

    // Page title
    title: { schema: z.string(), searchable: true },

    // Subtitle / default message
    subtitle: { schema: z.string(), searchable: true },

    // Kids array - stored as JSON string
    kids: z.array(
      z.object({
        name: z.string(),
        label: z.string(),
        initial: z.string(),
        color: z.string(), // Hex color code
      })
    ),

    // Lists array - stored as JSON string
    lists: z.array(
      z.object({
        id: z.string(),
        displayName: z.string(),
        prettyName: z.string(),
      })
    ),

    // Cheers messages array
    cheers: z.array(z.string()),

    // Champ messages array
    champMessages: z.array(z.string()),
  },
});

export type ConfigRow = {
  id: string;
  clientId: string;
  title: string;
  subtitle: string;
  kids: Array<{
    name: string;
    label: string;
    initial: string;
    color: string;
  }>;
  lists: Array<{
    id: string;
    displayName: string;
    prettyName: string;
  }>;
  cheers: string[];
  champMessages: string[];
};

