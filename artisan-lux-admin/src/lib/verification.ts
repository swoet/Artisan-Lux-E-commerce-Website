import { db } from "@/db";
import { verificationCodes } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { Resend } from "resend";

// Lazy initialization of Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("❌ RESEND_API_KEY is not set in environment variables!");
      throw new Error("Email service is not configured. Please set RESEND_API_KEY environment variable.");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Generate a random 6-digit verification code
 */
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and store a verification code for an email
 */
export async function createVerificationCode(email: string): Promise<string> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(verificationCodes).values({
    email: email.toLowerCase(),
    code,
    expiresAt,
    used: false,
  });

  return code;
}

/**
 * Send verification code email
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  type: "signup" | "signin"
): Promise<void> {
  const subject = type === "signup" 
    ? "Welcome to Artisan Lux - Verify Your Email" 
    : "Sign In to Artisan Lux - Verification Code";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #cd7f32; }
          .header h1 { margin: 0; color: #1a1a1a; font-size: 28px; }
          .content { padding: 30px 20px; }
          .code-box { background: #f5f5f5; border-left: 4px solid #cd7f32; padding: 20px; margin: 20px 0; text-align: center; }
          .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #cd7f32; font-family: 'Courier New', monospace; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Artisan Lux</h1>
          </div>
          <div class="content">
            <h2>${type === "signup" ? "Welcome aboard!" : "Welcome back!"}</h2>
            <p>Your verification code is:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Artisan Lux. Premier luxury artisan goods.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    console.log(`📧 Attempting to send verification email to: ${email}`);
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: "Artisan Lux <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully to ${email}. Email ID: ${result.data?.id}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify a code for an email
 */
export async function verifyCode(email: string, code: string): Promise<boolean> {
  const [record] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email.toLowerCase()),
        eq(verificationCodes.code, code),
        eq(verificationCodes.used, false),
        gt(verificationCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!record) {
    return false;
  }

  // Mark code as used
  await db
    .update(verificationCodes)
    .set({ used: true })
    .where(eq(verificationCodes.id, record.id));

  return true;
}
