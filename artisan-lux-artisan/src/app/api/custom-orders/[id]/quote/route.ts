import { NextRequest, NextResponse } from "next/server";
import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { artisanCustomOrders, customers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const artisan = await requireArtisanAuth();
    const data = await request.json();
    const { quotedPrice, estimatedCompletionDate, quoteNotes } = data;
    const { id } = await params;

    // Update order with quote
    const [updatedOrder] = await db
      .update(artisanCustomOrders)
      .set({
        status: "quoted",
        quotedPrice: quotedPrice.toString(),
        estimatedCompletionDate: new Date(estimatedCompletionDate),
        quoteNotes,
        quotedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(artisanCustomOrders.id, parseInt(id)),
          eq(artisanCustomOrders.artisanId, artisan.id)
        )
      )
      .returning();

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Send email notification to customer
    try {
      let toEmail = "";
      if (updatedOrder.customerId) {
        const [cust] = await db
          .select({ email: customers.email })
          .from(customers)
          .where(eq(customers.id, updatedOrder.customerId))
          .limit(1);
        toEmail = cust?.email || "";
      }
      if (toEmail) {
        await sendEmail({
          to: toEmail,
          subject: `Quote Ready: ${updatedOrder.title}`,
          html: `
            <h2>Your Custom Order Quote is Ready!</h2>
            <p>The artisan has prepared a quote for your custom order request.</p>
            <h3>${updatedOrder.title}</h3>
            <p><strong>Quoted Price:</strong> $${quotedPrice}</p>
            <p><strong>Estimated Completion:</strong> ${new Date(estimatedCompletionDate).toLocaleDateString()}</p>
            ${quoteNotes ? `<p><strong>Notes:</strong> ${quoteNotes}</p>` : ""}
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/custom-orders/${updatedOrder.id}">View Quote & Accept</a></p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Quote submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit quote" },
      { status: 500 }
    );
  }
}
