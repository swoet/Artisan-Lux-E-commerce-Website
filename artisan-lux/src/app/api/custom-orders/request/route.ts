import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customOrders, artisans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      artisanId,
      title,
      description,
      budgetMin,
      budgetMax,
      desiredCompletionDate,
      preferredMaterials,
      referenceImages,
      customerName,
      customerEmail,
    } = data;

    // Validate required fields
    if (!artisanId || !title || !description || !budgetMin || !budgetMax || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify artisan exists and is active
    const [artisan] = await db
      .select()
      .from(artisans)
      .where(eq(artisans.id, artisanId))
      .limit(1);

    if (!artisan || artisan.status !== "active") {
      return NextResponse.json(
        { error: "Artisan not found or not available" },
        { status: 404 }
      );
    }

    // Create custom order
    const [newOrder] = await db
      .insert(customOrders)
      .values({
        artisanId,
        title,
        description,
        budgetMin: budgetMin.toString(),
        budgetMax: budgetMax.toString(),
        desiredCompletionDate: desiredCompletionDate ? new Date(desiredCompletionDate) : null,
        preferredMaterials: preferredMaterials || [],
        referenceImages: referenceImages || [],
        customerName,
        customerEmail,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Send email notification to artisan
    try {
      const emailRes = await fetch(`${process.env.NEXT_PUBLIC_ARTISIAN_URL}/api/notify-artisan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanEmail: artisan.email,
          orderTitle: title,
          customerName,
          orderId: newOrder.id,
        }),
      });

      if (!emailRes.ok) {
        console.error("Failed to send artisan notification");
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      message: "Custom order request submitted successfully",
    });
  } catch (error) {
    console.error("Custom order request error:", error);
    return NextResponse.json(
      { error: "Failed to submit custom order request" },
      { status: 500 }
    );
  }
}
