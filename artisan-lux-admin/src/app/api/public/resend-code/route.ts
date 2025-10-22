import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createVerificationCode, sendVerificationEmail } from "@/lib/verification";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const type = typeof body.type === "string" ? body.type : "signin";
  
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  try {
    // Check if customer exists
    const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    
    if (!customer) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Generate and send new verification code
    const code = await createVerificationCode(email);
    await sendVerificationEmail(email, code, type === "signup" ? "signup" : "signin");

    return NextResponse.json({ 
      ok: true,
      message: "New verification code sent to your email"
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json({ error: "Failed to resend code" }, { status: 500 });
  }
}
