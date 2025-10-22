import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createVerificationCode, sendVerificationEmail } from "@/lib/verification";

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

    // Generate and send verification code
    const code = await createVerificationCode(email);
    await sendVerificationEmail(email, code, "signin");

    return NextResponse.json({ 
      ok: true,
      message: "Verification code sent to your email",
      requiresVerification: true
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
