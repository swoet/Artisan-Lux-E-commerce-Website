import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { createCustomer } from "@/db/queries/customers";
import { eq } from "drizzle-orm";
import { createVerificationCode, sendVerificationEmail } from "@/lib/verification";

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
    await createCustomer({ email, name: name || null });

    // Generate and send verification code
    const code = await createVerificationCode(email);
    await sendVerificationEmail(email, code, "signup");

    return NextResponse.json({ 
      ok: true,
      message: "Verification code sent to your email",
      requiresVerification: true
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
