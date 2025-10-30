import { NextRequest, NextResponse } from "next/server";
import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { artisanCustomOrders, artisanCustomOrderMessages, customers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const artisan = await requireArtisanAuth();
    const data = await request.json();
    const { message } = data;
    const { id } = await params;

    // Verify order belongs to artisan
    const [order] = await db
      .select()
      .from(artisanCustomOrders)
      .where(
        and(
          eq(artisanCustomOrders.id, parseInt(id)),
          eq(artisanCustomOrders.artisanId, artisan.id)
        )
      )
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Insert message
    const [newMessage] = await db
      .insert(artisanCustomOrderMessages)
      .values({
        customOrderId: order.id,
        senderId: artisan.id,
        senderType: "artisan",
        message,
        createdAt: new Date(),
      })
      .returning();

    // Send email notification to customer
    try {
      let toEmail = "";
      if (order.customerId) {
        const [cust] = await db
          .select({ email: customers.email })
          .from(customers)
          .where(eq(customers.id, order.customerId))
          .limit(1);
        toEmail = cust?.email || "";
      }
      if (toEmail) {
        await sendEmail({
          to: toEmail,
          subject: `New Message: ${order.title}`,
          html: `
            <h2>New Message from Your Artisan</h2>
            <h3>${order.title}</h3>
            <p>${message}</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/custom-orders/${order.id}">Reply to Message</a></p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
