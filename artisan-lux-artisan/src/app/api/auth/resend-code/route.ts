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
      const emailApiUrl = process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`
        : `${request.nextUrl.origin}/api/send-email`;
      
      await fetch(emailApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Your New Verification Code - Artisan Lux",
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  line-height: 1.6; 
                  background: linear-gradient(135deg, #1a0f08 0%, #2a1a10 50%, #1a0f08 100%);
                  padding: 40px 20px;
                }
                .email-wrapper {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }
                .header {
                  background: linear-gradient(135deg, #2a1a10 0%, #4a3020 50%, #2a1a10 100%);
                  padding: 50px 30px;
                  text-align: center;
                  position: relative;
                  overflow: hidden;
                }
                .header::before {
                  content: '';
                  position: absolute;
                  top: -50%;
                  left: -50%;
                  width: 200%;
                  height: 200%;
                  background: radial-gradient(circle, rgba(184, 115, 51, 0.1) 0%, transparent 70%);
                  animation: pulse 4s ease-in-out infinite;
                }
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 0.5; }
                  50% { transform: scale(1.1); opacity: 0.8; }
                }
                .logo {
                  font-size: 48px;
                  margin-bottom: 10px;
                  display: inline-block;
                  animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                }
                .header h1 {
                  color: white;
                  font-size: 28px;
                  font-weight: 600;
                  margin: 0;
                  position: relative;
                  z-index: 1;
                  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }
                .header p {
                  color: #b87333;
                  font-size: 14px;
                  margin-top: 8px;
                  position: relative;
                  z-index: 1;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                }
                .content {
                  padding: 40px 30px;
                  background: linear-gradient(to bottom, #ffffff 0%, #faf8f6 100%);
                }
                .greeting {
                  font-size: 24px;
                  color: #2a1a10;
                  margin-bottom: 20px;
                  font-weight: 600;
                }
                .message {
                  color: #4a3020;
                  margin-bottom: 30px;
                  font-size: 16px;
                }
                .code-container {
                  background: linear-gradient(135deg, #2a1a10 0%, #4a3020 100%);
                  border-radius: 12px;
                  padding: 30px;
                  margin: 30px 0;
                  text-align: center;
                  box-shadow: 0 10px 30px rgba(184, 115, 51, 0.3);
                  position: relative;
                  overflow: hidden;
                }
                .code-container::before {
                  content: '';
                  position: absolute;
                  top: -2px;
                  left: -2px;
                  right: -2px;
                  bottom: -2px;
                  background: linear-gradient(45deg, #b87333, #cd7f32, #b87333);
                  border-radius: 12px;
                  z-index: 0;
                  animation: borderGlow 3s linear infinite;
                }
                @keyframes borderGlow {
                  0%, 100% { opacity: 0.5; }
                  50% { opacity: 1; }
                }
                .code-label {
                  color: #b87333;
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  margin-bottom: 15px;
                  position: relative;
                  z-index: 1;
                }
                .code {
                  background: white;
                  color: #2a1a10;
                  font-size: 42px;
                  font-weight: bold;
                  letter-spacing: 12px;
                  padding: 20px;
                  border-radius: 8px;
                  display: inline-block;
                  font-family: 'Courier New', monospace;
                  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
                  position: relative;
                  z-index: 1;
                }
                .expiry {
                  color: #b87333;
                  font-size: 13px;
                  margin-top: 15px;
                  position: relative;
                  z-index: 1;
                }
                .divider {
                  height: 1px;
                  background: linear-gradient(to right, transparent, #b87333, transparent);
                  margin: 30px 0;
                }
                .footer {
                  background: #2a1a10;
                  padding: 30px;
                  text-align: center;
                }
                .footer p {
                  color: #b87333;
                  font-size: 12px;
                  margin: 5px 0;
                }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="header">
                  <div class="logo">🔑</div>
                  <h1>New Verification Code</h1>
                  <p>Artisan Portal</p>
                </div>
                
                <div class="content">
                  <div class="greeting">Hi ${artisan.name}! 👋</div>
                  
                  <p class="message">
                    You requested a new verification code for your <strong>Artisan Lux</strong> account.
                  </p>
                  
                  <p class="message">
                    Here's your fresh verification code:
                  </p>
                  
                  <div class="code-container">
                    <div class="code-label">Your New Verification Code</div>
                    <div class="code">${verificationCode}</div>
                    <div class="expiry">⏱️ Expires in 15 minutes</div>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <p style="color: #666; font-size: 13px; text-align: center;">
                    If you didn't request this code, you can safely ignore this email.
                  </p>
                </div>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Artisan Lux. All rights reserved.</p>
                  <p style="margin-top: 10px;">Crafted with passion and precision.</p>
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
