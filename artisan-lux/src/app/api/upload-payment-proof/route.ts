import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { emitOrderEvent } from "@/lib/socket";

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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "payment-proofs");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `order-${orderId}-${timestamp}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Update order with payment proof URL
    const proofUrl = `/uploads/payment-proofs/${filename}`;
    await db
      .update(orders)
      .set({ 
        paymentProofUrl: proofUrl,
        paymentMethod: paymentMethod || "bank_transfer"
      })
      .where(eq(orders.id, parseInt(orderId, 10)));

    // Emit real-time notification to admin
    const order = (await db.select().from(orders).where(eq(orders.id, parseInt(orderId, 10))).limit(1))[0];
    if (order) {
      emitOrderEvent("payment.proof.uploaded", {
        orderId: order.id,
        email: order.email,
        total: order.total,
        proofUrl,
        paymentMethod,
      });
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
