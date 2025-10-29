import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { waitlists, products, customers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { productId, email, name } = data;

    if (!productId || !email || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if product exists
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Find or create customer
    let [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (!customer) {
      const [created] = await db
        .insert(customers)
        .values({ email, name })
        .returning();
      customer = created;
    }

    // Check if already on waitlist
    const existing = await db
      .select()
      .from(waitlists)
      .where(
        and(
          eq(waitlists.productId, productId),
          eq(waitlists.customerId, customer.id)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "You're already on the waitlist for this product" },
        { status: 400 }
      );
    }

    // Add to waitlist
    const [waitlistEntry] = await db
      .insert(waitlists)
      .values({
        productId,
        customerId: customer.id,
      })
      .returning();

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: `You're on the waitlist for ${product.title}`,
          html: `
            <h2>Waitlist Confirmation</h2>
            <p>Hi ${name},</p>
            <p>You've successfully joined the waitlist for <strong>${product.title}</strong>.</p>
            <p>We'll notify you as soon as it's back in stock!</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}">View Product</a></p>
          `,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined waitlist",
      waitlistId: waitlistEntry.id,
    });
  } catch (error) {
    console.error("Waitlist join error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
