import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { db } from "@/db";
import { orders, customers, paymentProofs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { emitOrderEvent } from "@/lib/socket";
import { sendOwnerPaymentProofEmail } from "@/lib/email";
import { getStore } from "@netlify/blobs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("proof") as File | null;
    const orderId = formData.get("orderId") as string | null;
    const paymentMethod = formData.get("paymentMethod") as string | null;

    if (!file || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Validate file type (images or PDF)
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Only image or PDF files are allowed" }, { status: 400 });
    }

    // Store in Netlify Blobs (persisted across deploys)
    const timestamp = Date.now();
    const ext = path.extname(file.name || "");
    const key = `order-${orderId}-${timestamp}${ext}`;
    const store = getStore("payment-proofs");
    await store.set(key, file, { metadata: { contentType: file.type } });

    // API streaming URL
    const proofUrl = `/api/payment-proofs/${encodeURIComponent(key)}`;

    // Emit real-time notification to admin with customer email
    const order = (
      await db
        .select({
          id: orders.id,
          total: orders.total,
          currency: orders.currency,
          email: customers.email,
        })
        .from(orders)
        .leftJoin(customers, eq(customers.id, orders.customerId))
        .where(eq(orders.id, parseInt(orderId, 10)))
        .limit(1)
    )[0];

    if (order) {
      // Save to DB (non-invasive addition)
      try {
        await db.insert(paymentProofs).values({
          orderId: order.id,
          url: proofUrl,
          paymentMethod: paymentMethod || null as any,
        });
      } catch (e) {
        console.error("Failed to persist payment proof:", e);
      }

      emitOrderEvent("payment.proof.uploaded", {
        orderId: order.id,
        email: order.email ?? "",
        total: order.total,
        proofUrl,
        paymentMethod,
      });

      // Owner notification email (if ADMIN_NOTIFICATION_EMAIL set)
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
        const absoluteUrl = proofUrl.startsWith("http") ? proofUrl : `${siteUrl}${proofUrl}`;
        const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.OWNER_EMAIL;
        if (to) {
          await sendOwnerPaymentProofEmail({
            to,
            orderId: order.id,
            customerEmail: order.email || "",
            total: String(order.total),
            currency: "USD",
            paymentMethod: paymentMethod || "unknown",
            proofUrl: absoluteUrl,
          });
        }
      } catch (e) {
        console.error("Failed to send owner payment proof email:", e);
      }
    }

    return NextResponse.json({ 
      success: true,
      proofUrl 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
