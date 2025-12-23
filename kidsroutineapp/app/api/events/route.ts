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

export async function POST(request: Request) {
  try {
    if (!process.env.BOTPRESS_TOKEN || !process.env.BOTPRESS_BOT_ID) {
      return NextResponse.json(
        { error: "Botpress credentials not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      date,
      name,
      startTime,
      endTime,
      participants,
      location,
      description,
      clientId = "1",
    } = body;

    // Validate required fields
    if (!date || !name) {
      return NextResponse.json(
        { error: "Date and name are required" },
        { status: 400 }
      );
    }

    // Generate a unique eventId
    const eventId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Create event row for Botpress
    const eventRow = {
      clientId,
      eventId,
      date,
      name,
      startTime: startTime || "",
      endTime: endTime || "",
      participants: participants || [],
      location: location || "",
      description: description || "",
    };

    // Insert into Botpress EventsTable
    const { rows } = await client.createTableRows({
      table: "EventsTable",
      rows: [eventRow],
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    // Transform to CalendarEvent format
    const createdEvent = {
      id: eventRow.eventId,
      date: eventRow.date,
      name: eventRow.name,
      startTime: eventRow.startTime || undefined,
      endTime: eventRow.endTime || undefined,
      participants: eventRow.participants.length > 0 ? eventRow.participants : undefined,
      location: eventRow.location || undefined,
      description: eventRow.description || undefined,
    };

    return NextResponse.json({ event: createdEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating event in Botpress:", error);
    return NextResponse.json(
      { error: "Failed to create event", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

