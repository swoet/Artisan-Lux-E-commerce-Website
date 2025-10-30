import { NextRequest, NextResponse } from "next/server";
import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { customOrders, customers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const artisan = await requireArtisanAuth();
    const data = await request.json();
    const { status } = data;
    const { id } = await params;

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set specific timestamps based on status
    if (status === "in_production") {
      updateData.productionStartedAt = new Date();
    } else if (status === "completed") {
      updateData.completedAt = new Date();
    } else if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    // Update order status
    const [updatedOrder] = await db
      .update(customOrders)
      .set(updateData)
      .where(
        and(
          eq(customOrders.id, parseInt(id)),
          eq(customOrders.artisanId, artisan.id)
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
    const emailSubjects: Record<string, string> = {
      in_production: "Production Started",
      completed: "Your Custom Order is Complete!",
      delivered: "Order Delivered",
      cancelled: "Order Cancelled",
    };

    const emailMessages: Record<string, string> = {
      in_production: "Great news! The artisan has started working on your custom order.",
      completed: "Your custom order has been completed and is ready for delivery!",
      delivered: "Your custom order has been delivered. We hope you love it!",
      cancelled: "Your custom order has been cancelled.",
    };

    if (emailSubjects[status]) {
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
            subject: `${emailSubjects[status]}: ${updatedOrder.title}`,
            html: `
              <h2>${emailSubjects[status]}</h2>
              <p>${emailMessages[status]}</p>
              <h3>${updatedOrder.title}</h3>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/custom-orders/${updatedOrder.id}">View Order Details</a></p>
            `,
          });
        }
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
