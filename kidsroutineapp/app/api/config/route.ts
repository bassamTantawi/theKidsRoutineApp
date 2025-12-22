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

    // Get clientId from query parameter, default to "default"
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") || "default";

    // Fetch config from ConfigTable using Botpress client
    const { rows } = await client.findTableRows({
      table: "ConfigTable",
      filter: {
        clientId: { $eq: clientId },
      },
      limit: 1,
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: `Config not found for clientId: ${clientId}` },
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

