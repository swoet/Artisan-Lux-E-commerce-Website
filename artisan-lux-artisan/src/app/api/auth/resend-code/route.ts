// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artisans } from "@/db/schema";
import { eq } from "drizzle-orm";

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find artisan
    const [artisan] = await db
      .select()
      .from(artisans)
      .where(eq(artisans.email, email.toLowerCase()))
      .limit(1);

    if (!artisan) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (artisan.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update artisan with new code
    await db
      .update(artisans)
      .set({
        verificationCode,
        verificationCodeExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(artisans.id, artisan.id));

    // Send verification email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Your New Verification Code - Artisan Lux",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2a1a10 0%, #4a3020 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .code { background: white; border: 2px dashed #b87333; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2a1a10; margin: 20px 0; border-radius: 8px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🔑 New Verification Code</h1>
                </div>
                <div class="content">
                  <h2>Hi ${artisan.name}!</h2>
                  <p>You requested a new verification code for your Artisan Lux account.</p>
                  
                  <div class="code">${verificationCode}</div>
                  
                  <p><strong>This code will expire in 15 minutes.</strong></p>
                  
                  <p>If you didn't request this code, please ignore this email.</p>
                  
                  <div class="footer">
                    <p>© ${new Date().getFullYear()} Artisan Lux. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
