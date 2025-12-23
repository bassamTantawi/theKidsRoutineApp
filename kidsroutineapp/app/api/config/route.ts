import { Client } from "@botpress/client";
import { NextResponse } from "next/server";

// Use Node.js runtime instead of Edge runtime to support @botpress/client
export const runtime = "nodejs";

const client = new Client({
  token: process.env.BOTPRESS_TOKEN,
  botId: process.env.BOTPRESS_BOT_ID,
});

export async function GET(request: Request) {
  try {
    if (!process.env.BOTPRESS_TOKEN || !process.env.BOTPRESS_BOT_ID) {
      return NextResponse.json(
        { error: "Botpress credentials not configured" },
        { status: 500 }
      );
    }

    // Get clientId or shareableId from query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const shareableId = searchParams.get("shareableId") || searchParams.get("id");

    // Build filter based on which parameter is provided
    let filter: any;
    if (shareableId) {
      // Normalize shareableId to uppercase for case-insensitive lookup
      filter = {
        shareableId: { $eq: shareableId.toUpperCase() },
      };
    } else {
      // Default to clientId or "default"
      filter = {
        clientId: { $eq: clientId || "default" },
      };
    }

    // Fetch config from ConfigTable using Botpress client
    const { rows } = await client.findTableRows({
      table: "ConfigTable",
      filter,
      limit: 1,
    });

    if (rows.length === 0) {
      const identifier = shareableId ? `shareableId: ${shareableId}` : `clientId: ${clientId || "default"}`;
      return NextResponse.json(
        { error: `Config not found for ${identifier}` },
        { status: 404 }
      );
    }

    const configRow = rows[0] as any;

    // Transform Botpress table row to AppConfig format
    const config = {
      app: {
        pageTitle: configRow.title || "",
        defaultMessage: configRow.subtitle || "",
      },
      kids: configRow.kids || [],
      lists: configRow.lists || [],
      messages: {
        cheers: configRow.cheers || [],
        champMessages: configRow.champMessages || [],
      },
    };

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error fetching config from Botpress:", error);
    return NextResponse.json(
      { error: "Failed to fetch config", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

