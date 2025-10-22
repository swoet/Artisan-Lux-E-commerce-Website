/**
 * Test script to verify Resend email configuration
 * Run with: npx tsx scripts/test-email.ts your-email@example.com
 */

import { Resend } from "resend";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const apiKey = process.env.RESEND_API_KEY;

async function testEmail(recipientEmail: string) {
  console.log("\n🔍 Testing Resend Email Configuration\n");
  console.log("=" .repeat(50));

  // Check API key
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not set!");
    console.log("\n📝 To fix this:");
    console.log("1. Create .env.local in artisan-lux-admin directory");
    console.log("2. Add: RESEND_API_KEY=your_api_key_here");
    console.log("3. Get your API key from https://resend.com/api-keys\n");
    process.exit(1);
  }

  console.log("✅ RESEND_API_KEY is set");
  console.log(`📧 Recipient: ${recipientEmail}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log("=" .repeat(50) + "\n");

  const resend = new Resend(apiKey);

  // Generate test code
  const testCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`🎲 Generated test code: ${testCode}\n`);

  // Send test email
  try {
    console.log("📤 Sending test email...");
    console.log(`   From: Artisan Lux <onboarding@resend.dev>`);
    console.log(`   To: ${recipientEmail}\n`);
    
    const result = await resend.emails.send({
      from: "Artisan Lux <onboarding@resend.dev>",
      to: recipientEmail,
      subject: "Test - Artisan Lux Verification Code",
      html: `
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
                <h2>Test Email - Configuration Successful! ✅</h2>
                <p>This is a test email to verify your Resend configuration.</p>
                <p>Your test verification code is:</p>
                <div class="code-box">
                  <div class="code">${testCode}</div>
                </div>
                <p>If you received this email, your email system is working correctly!</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Artisan Lux. Premier luxury artisan goods.</p>
                <p>This is a test message from your development environment.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("\n✅ Email sent successfully!");
    console.log(`📬 Full Response:`, JSON.stringify(result, null, 2));
    console.log(`📬 Email ID: ${result.data?.id || 'N/A'}`);
    console.log("\n📝 Next steps:");
    console.log("1. Check your email inbox (and spam folder)");
    console.log("2. If you received the email, the system is working!");
    console.log("3. Try signing up/logging in through the app");
    console.log("\n⚠️  NOTE: test@example.com is NOT a real email!");
    console.log("   Use your actual email address to receive the test email.\n");
  } catch (error) {
    console.error("\n❌ Failed to send email:");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error: ${JSON.stringify(error, null, 2)}`);
    }
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Verify your API key is correct");
    console.log("2. Check if your Resend account is active");
    console.log("3. Ensure you have API credits/quota available");
    console.log("4. Visit https://resend.com/docs for more help\n");
    process.exit(1);
  }
}

// Get recipient email from command line
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error("\n❌ Please provide a recipient email address");
  console.log("\nUsage: npx tsx scripts/test-email.ts your-email@example.com\n");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
  console.error("\n❌ Invalid email address format\n");
  process.exit(1);
}

testEmail(recipientEmail);
