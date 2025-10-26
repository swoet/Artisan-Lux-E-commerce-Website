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
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2a1a10 0%, #4a3020 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .code { background: white; border: 2px dashed #b87333; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2a1a10; margin: 20px 0; border-radius: 8px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; background: #b87333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🏺 Welcome to Artisan Lux</h1>
                </div>
                <div class="content">
                  <h2>Hi ${name}!</h2>
                  <p>Thank you for joining Artisan Lux as an artisan creator. We're excited to have you!</p>
                  <p>To complete your registration, please verify your email address using the code below:</p>
                  
                  <div class="code">${verificationCode}</div>
                  
                  <p><strong>This code will expire in 15 minutes.</strong></p>
                  
                  <p>If you didn't create this account, please ignore this email.</p>
                  
                  <p>Once verified, your account will be reviewed by our team and activated within 24-48 hours.</p>
                  
                  <div class="footer">
                    <p>© ${new Date().getFullYear()} Artisan Lux. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
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
