import { NextRequest, NextResponse } from "next/server";
import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { customOrders, customOrderProductionStages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const artisan = await requireArtisanAuth();
    const data = await request.json();
    const { stage, notes } = data;
    const { id } = await params;

    // Get order details
    const [order] = await db
      .select()
      .from(customOrders)
      .where(
        and(
          eq(customOrders.id, parseInt(id)),
          eq(customOrders.artisanId, artisan.id)
        )
      )
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Insert production stage update
    await db.insert(customOrderProductionStages).values({
      customOrderId: order.id,
      stage,
      notes,
      createdAt: new Date(),
    });

    // Update order timestamp
    await db
      .update(customOrders)
      .set({ updatedAt: new Date() })
      .where(eq(customOrders.id, order.id));

    // Send email notification to customer
    const stageLabels: Record<string, string> = {
      materials_sourced: "Materials Sourced",
      design_finalized: "Design Finalized",
      production_started: "Production Started",
      halfway_complete: "50% Complete",
      finishing_touches: "Finishing Touches",
      quality_check: "Quality Check",
    };

    try {
      await sendEmail({
        to: order.customerEmail || "",
        subject: `Production Update: ${order.title}`,
        html: `
          <h2>Production Update for Your Custom Order</h2>
          <h3>${order.title}</h3>
          <p><strong>Stage:</strong> ${stageLabels[stage] || stage}</p>
          <p><strong>Update:</strong> ${notes}</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/custom-orders/${order.id}">View Full Details</a></p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Production update error:", error);
    return NextResponse.json(
      { error: "Failed to send production update" },
      { status: 500 }
    );
  }
}
