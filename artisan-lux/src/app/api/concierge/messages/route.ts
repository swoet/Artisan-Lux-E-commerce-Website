import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conciergeMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID required" },
        { status: 400 }
      );
    }

    const messages = await db
      .select()
      .from(conciergeMessages)
      .where(eq(conciergeMessages.conversationId, parseInt(conversationId)))
      .orderBy(conciergeMessages.createdAt);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
