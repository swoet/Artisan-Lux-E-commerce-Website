// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artisans } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
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

    // Check verification code
    if (artisan.verificationCode !== code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if code expired
    if (new Date() > artisan.verificationCodeExpiresAt) {
      return NextResponse.json(
        { error: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Update artisan - mark as verified
    await db
      .update(artisans)
      .set({
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(artisans.id, artisan.id));

    // Send welcome email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Welcome to Artisan Lux - Account Under Review",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2a1a10 0%, #4a3020 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">✅ Email Verified!</h1>
                </div>
                <div class="content">
                  <h2>Hi ${artisan.name}!</h2>
                  
                  <div class="success">
                    <strong>Your email has been successfully verified!</strong>
                  </div>
                  
                  <p>Your artisan account is now under review by our team. We'll review your application and activate your account within <strong>24-48 hours</strong>.</p>
                  
                  <h3>What happens next?</h3>
                  <ul>
                    <li>Our team will review your application</li>
                    <li>You'll receive an email once your account is activated</li>
                    <li>Once activated, you can start creating and selling your products</li>
                  </ul>
                  
                  <p>If you have any questions, feel free to contact us at <a href="mailto:support@artisanlux.com">support@artisanlux.com</a></p>
                  
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
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Email verified! Your account is under review.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
