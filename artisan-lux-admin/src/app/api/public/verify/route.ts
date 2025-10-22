import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { recordAuthEvent } from "@/db/queries/customers";
import { eq } from "drizzle-orm";
import { verifyCode } from "@/lib/verification";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  
  if (!email || !code) {
    return NextResponse.json({ error: "email and code required" }, { status: 400 });
  }

  try {
    // Verify the code
    const isValid = await verifyCode(email, code);
    
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Get customer details
    const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Record auth event
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;
    await recordAuthEvent({
      customerId: customer.id,
      type: "login",
      ip,
      userAgent,
    });

    return NextResponse.json({ 
      ok: true, 
      customer: { 
        id: customer.id, 
        email: customer.email, 
        name: customer.name 
      } 
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
