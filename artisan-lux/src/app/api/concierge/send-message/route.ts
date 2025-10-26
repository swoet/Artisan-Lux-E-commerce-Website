import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conciergeConversations, conciergeMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { conversationId, customerId, message } = data;

    if (!customerId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let activeConversationId = conversationId;

    // Create conversation if it doesn't exist
    if (!activeConversationId) {
      const [newConversation] = await db
        .insert(conciergeConversations)
        .values({
          customerId,
          status: "open",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      activeConversationId = newConversation.id;
    }

    // Insert message
    const [newMessage] = await db
      .insert(conciergeMessages)
      .values({
        conversationId: activeConversationId,
        senderId: customerId,
        senderType: "customer",
        message,
        createdAt: new Date(),
      })
      .returning();

    // Update conversation timestamp
    await db
      .update(conciergeConversations)
      .set({ updatedAt: new Date() })
      .where(eq(conciergeConversations.id, activeConversationId));

    return NextResponse.json({
      success: true,
      message: newMessage,
      conversationId: activeConversationId,
    });
  } catch (error) {
    console.error("Concierge message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
