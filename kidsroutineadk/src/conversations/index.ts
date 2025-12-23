import {
  actions,
  adk,
  Autonomous,
  Conversation,
  context,
  z,
} from "@botpress/runtime";
import EventsTable from "../tables/events";
import analyzeImageAction from "../actions/analyze-image";

/**
 * Main conversation handler for webchat.
 * Handles image uploads, analyzes them for event information,
 * and manages events in the EventsTable.
 */
export default new Conversation({
  channel: "webchat.channel",
  state: z.object({
    pendingEvent: z
      .object({
        name: z.string(),
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        location: z.string(),
        participants: z.array(z.string()),
        description: z.string().optional(),
      })
      .optional()
      .describe("Event data pending user confirmation"),
  }),
  handler: async ({ execute, conversation, state, message }) => {
    // Check if the latest message has an image attachment
    const chat = context.get("chat");
    const transcript = await chat.getTranscript();
    const lastMessage = transcript[transcript.length - 1];
    const hasImage =
      lastMessage?.role === "user" &&
      lastMessage?.attachments?.some((x) => x.type === "image");

    // If there's an image, get its URL
    // Image attachments can have url property or be accessible via message payload
    let imageUrl: string | undefined;
    if (hasImage && lastMessage.attachments) {
      const imageAttachment = lastMessage.attachments.find(
        (x) => x.type === "image"
      );
      // Try different possible properties for the image URL
      imageUrl =
        (imageAttachment as any)?.url ||
        (imageAttachment as any)?.imageUrl ||
        (message.payload as any)?.imageUrl;
    }

    // Tool to analyze images - convert action to tool
    const analyzeImageTool = analyzeImageAction.asTool();

    // Tool to create event in EventsTable
    const createEventTool = new Autonomous.Tool({
      name: "create_event",
      description:
        "Create a new event in the EventsTable. Use this after the user has confirmed the event details.",
      input: z.object({
        clientId: z
          .string()
          .default("default")
          .describe("Client ID for the event"),
        eventId: z
          .string()
          .describe("Unique event ID (e.g., 'ev-001')"),
        date: z.string().describe("Event date in ISO format (e.g., '2025-12-19')"),
        name: z.string().describe("Event name"),
        startTime: z.string().describe("Start time (e.g., '17:00')"),
        endTime: z.string().describe("End time (e.g., '18:30')"),
        participants: z
          .array(z.string())
          .describe("List of participant names"),
        location: z.string().describe("Event location"),
        description: z.string().optional().describe("Event description"),
      }),
      output: z.object({
        success: z.boolean(),
        eventId: z.string(),
        message: z.string(),
      }),
      handler: async ({ input }) => {
        try {
          const { rows } = await EventsTable.createRows({
            rows: [
              {
                clientId: input.clientId,
                eventId: input.eventId,
                date: input.date,
                name: input.name,
                startTime: input.startTime,
                endTime: input.endTime,
                participants: input.participants,
                location: input.location,
                description: input.description,
              },
            ],
          });

          return {
            success: true,
            eventId: rows[0]?.eventId || input.eventId,
            message: `Event "${input.name}" has been created successfully!`,
          };
        } catch (error) {
          return {
            success: false,
            eventId: input.eventId,
            message: `Failed to create event: ${
              error instanceof Error ? error.message : String(error)
            }`,
          };
        }
      },
    });

    // Tool to find events in EventsTable
    const findEventsTool = new Autonomous.Tool({
      name: "find_events",
      description:
        "Search for events in the EventsTable by various criteria (date, name, location, etc.)",
      input: z.object({
        clientId: z
          .string()
          .optional()
          .describe("Filter by client ID"),
        date: z.string().optional().describe("Filter by date (ISO format)"),
        name: z.string().optional().describe("Search by event name"),
        location: z.string().optional().describe("Filter by location"),
        limit: z.number().default(10).describe("Maximum number of results"),
      }),
      output: z.object({
        events: z.array(
          z.object({
            id: z.string(),
            eventId: z.string(),
            name: z.string(),
            date: z.string(),
            startTime: z.string(),
            endTime: z.string(),
            location: z.string(),
            participants: z.array(z.string()),
            description: z.string().optional(),
          })
        ),
      }),
      handler: async ({ input }) => {
        const filter: Record<string, any> = {};
        if (input.clientId) {
          filter.clientId = { $eq: input.clientId };
        }
        if (input.date) {
          filter.date = { $eq: input.date };
        }
        if (input.name) {
          filter.name = { $contains: input.name };
        }
        if (input.location) {
          filter.location = { $contains: input.location };
        }

        const { rows } = await EventsTable.findRows({
          filter: Object.keys(filter).length > 0 ? filter : undefined,
          limit: input.limit,
        });

        return {
          events: rows.map((row) => ({
            id: String(row.id),
            eventId: row.eventId,
            name: row.name,
            date: row.date,
            startTime: row.startTime,
            endTime: row.endTime,
            location: row.location,
            participants: row.participants,
            description: row.description,
          })),
        };
      },
    });

    // Tool to update events in EventsTable
    const updateEventTool = new Autonomous.Tool({
      name: "update_event",
      description: "Update an existing event in the EventsTable",
      input: z.object({
        id: z.string().describe("Table row ID of the event to update"),
        name: z.string().optional().describe("Updated event name"),
        date: z.string().optional().describe("Updated date (ISO format)"),
        startTime: z.string().optional().describe("Updated start time"),
        endTime: z.string().optional().describe("Updated end time"),
        location: z.string().optional().describe("Updated location"),
        participants: z.array(z.string()).optional().describe("Updated participants"),
        description: z.string().optional().describe("Updated description"),
      }),
      output: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      handler: async ({ input }) => {
        try {
          const { id, ...updates } = input;
          const client = context.get("client");
          await client.updateTableRows({
            table: "EventsTable",
            rows: [
              {
                id: Number(id),
                ...updates,
              },
            ],
          });

          return {
            success: true,
            message: "Event updated successfully!",
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to update event: ${
              error instanceof Error ? error.message : String(error)
            }`,
          };
        }
      },
    });

    // Build instructions with image context if available
    let imageContext = "";
    if (hasImage && imageUrl) {
      imageContext = `\n\n## IMPORTANT: The user has just uploaded an image!
The image URL is: ${imageUrl}

You MUST:
1. Immediately call the analyze_image tool with image_url="${imageUrl}" to analyze the image
2. Extract all information from the image
3. Determine if it contains event information
4. If it's an event, present the details and ask for confirmation before creating it
5. If it's not an event, acknowledge what you see and offer help

Do NOT skip analyzing the image - this is the user's request!`;
    }

    await execute({
      model: hasImage ? "openai:gpt-4o-mini" : undefined,
      instructions: `You are a friendly and helpful assistant that helps users manage events by analyzing images.

## Your Personality
- Be warm, friendly, and approachable
- Use a conversational, helpful tone
- Show enthusiasm when helping users
- Be patient and understanding

## Core Functionality

### When a User Uploads an Image:
1. **Automatically analyze the image** using the analyze_image tool to extract information
2. **Check if it looks like an event** (calendar, invitation, flyer, poster, etc.)
3. If it's an event:
   - Extract all event details (name, date, time, location, participants, etc.)
   - Present the extracted information to the user in a clear, friendly format
   - **Ask for confirmation** before creating the event: "I found this event information. Would you like me to add it to your calendar?"
   - Wait for user confirmation (yes/confirm/ok/go ahead/etc.)
   - Once confirmed, use the create_event tool to save it
4. If it's not an event:
   - Acknowledge what you see in the image
   - Offer to help with something else

### Managing Events:
- Use find_events to search for existing events
- Use update_event to modify existing events
- Use create_event to add new events (only after user confirmation)

## Important Rules:
- **Always confirm with the user** before creating an event from an image
- Extract as much information as possible from images
- If information is missing (like date or time), ask the user to clarify
- Be helpful with general questions and conversation
- If you're not sure about something, ask the user

## Example Flow:
User: [uploads image of event flyer]
You: "I can see this is an event flyer! Let me analyze it for you..."
[Call analyze_image tool]
You: "I found this event information:
- Event: School Winter Show
- Date: December 19, 2025
- Time: 5:00 PM - 6:30 PM
- Location: School Auditorium
- Participants: Mira, Yazan

Would you like me to add this to your calendar?"

User: "Yes, please!"
You: [Call create_event tool]
You: "Perfect! I've added the School Winter Show to your calendar. Is there anything else I can help you with?"${imageContext}`,
      tools: [
        analyzeImageTool,
        createEventTool,
        findEventsTool,
        updateEventTool,
      ],
    });
  },
});
