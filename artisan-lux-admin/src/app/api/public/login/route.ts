import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { recordAuthEvent } from "@/db/queries/customers";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  try {
    // Check if customer exists
    const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    
    if (!customer) {
      return NextResponse.json({ error: "Account not found. Please sign up first." }, { status: 404 });
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
