import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artisans } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    + "-" + Math.random().toString(36).substring(2, 6);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, studioName, specialties } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(artisans)
      .where(eq(artisans.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Generate slug
    const slug = generateSlug(name);

    // Parse specialties
    const specialtiesArray = specialties
      ? specialties.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Create artisan account
    const [artisan] = await db
      .insert(artisans)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        slug,
        studioName: studioName || null,
        specialties: specialtiesArray.length > 0 ? specialtiesArray : null,
        status: "pending",
        emailVerified: false,
        verificationCode,
        verificationCodeExpiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Send verification email
    try {
      const emailApiUrl = process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`
        : `${request.nextUrl.origin}/api/send-email`;
      
      const emailRes = await fetch(emailApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Verify Your Artisan Lux Account",
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
                .info-box {
                  background: #fff9f0;
                  border-left: 4px solid #b87333;
                  padding: 15px 20px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .info-box p {
                  color: #4a3020;
                  font-size: 14px;
                  margin: 0;
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
                .social-links {
                  margin-top: 20px;
                }
                .social-links a {
                  color: #b87333;
                  text-decoration: none;
                  margin: 0 10px;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="header">
                  <div class="logo">🏺</div>
                  <h1>Welcome to Artisan Lux</h1>
                  <p>Artisan Portal</p>
                </div>
                
                <div class="content">
                  <div class="greeting">Hi ${name}! 👋</div>
                  
                  <p class="message">
                    Thank you for joining <strong>Artisan Lux</strong> as an artisan creator. 
                    We're thrilled to have you as part of our community of talented craftspeople!
                  </p>
                  
                  <p class="message">
                    To complete your registration and verify your email address, please enter the code below:
                  </p>
                  
                  <div class="code-container">
                    <div class="code-label">Your Verification Code</div>
                    <div class="code">${verificationCode}</div>
                    <div class="expiry">⏱️ Expires in 15 minutes</div>
                  </div>
                  
                  <div class="info-box">
                    <p><strong>📋 What happens next?</strong></p>
                    <p style="margin-top: 8px;">
                      Once verified, your account will be reviewed by our team. 
                      You'll receive an email within 24-48 hours once your artisan profile is activated.
                    </p>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <p style="color: #666; font-size: 13px; text-align: center;">
                    If you didn't create this account, you can safely ignore this email.
                  </p>
                </div>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Artisan Lux. All rights reserved.</p>
                  <p style="margin-top: 10px;">Crafted with passion and precision.</p>
                  <div class="social-links">
                    <a href="#">Instagram</a> • 
                    <a href="#">Facebook</a> • 
                    <a href="#">Twitter</a>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!emailRes.ok) {
        console.error("Failed to send verification email");
      }
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Account created! Check your email for verification code.",
      artisanId: artisan.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
