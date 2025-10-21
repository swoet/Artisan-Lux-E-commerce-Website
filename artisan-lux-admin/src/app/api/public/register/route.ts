import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { createCustomer, recordAuthEvent } from "@/db/queries/customers";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  try {
    // Check if customer already exists
    const [existing] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create new customer
    const customer = await createCustomer({ email, name: name || null });

    // Record auth event
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;
    await recordAuthEvent({
      customerId: customer.id,
      type: "register",
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
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
