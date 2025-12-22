import { Client } from "@botpress/client";
import { NextResponse } from "next/server";

// Use Node.js runtime instead of Edge runtime to support @botpress/client
export const runtime = "nodejs";

const client = new Client({
  token: process.env.BOTPRESS_TOKEN,
  botId: process.env.BOTPRESS_BOT_ID,
});

export async function GET() {
  try {
    if (!process.env.BOTPRESS_TOKEN || !process.env.BOTPRESS_BOT_ID) {
      return NextResponse.json(
        { error: "Botpress credentials not configured" },
        { status: 500 }
      );
    }

    // Fetch events for clientId "1" from the EventsTable using Botpress client
    const { rows } = await client.findTableRows({
      table: "EventsTable",
      filter: {
        clientId: { $eq: "1" },
      },
      limit: 1000,
    });

    // Transform Botpress table rows to CalendarEvent format
    const events = rows.map((row: any) => ({
      id: row.eventId || "",
      date: row.date || "",
      name: row.name || "",
      startTime: row.startTime || undefined,
      endTime: row.endTime || undefined,
      participants: row.participants || undefined,
      location: row.location || undefined,
      description: row.description || undefined,
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events from Botpress:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

