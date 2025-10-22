/**
 * Direct test of Resend API - bypasses all app logic
 */

import { Resend } from "resend";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testResendDirect() {
  console.log("\n🔍 Direct Resend API Test\n");
  console.log("=".repeat(60));

  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not set!");
    process.exit(1);
  }

  console.log("✅ API Key found:", apiKey.substring(0, 10) + "...");
  console.log("");

  const resend = new Resend(apiKey);
  const testEmail = "auyamhirizhonga@gmail.com";
  const testCode = "123456";

  console.log("📧 Sending test email to:", testEmail);
  console.log("🔑 Test code:", testCode);
  console.log("");

  try {
    const result = await resend.emails.send({
      from: "Artisan Lux <onboarding@resend.dev>",
      to: testEmail,
      subject: "TEST - Artisan Lux Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Test Email from Artisan Lux</h1>
            <p>This is a direct test of the Resend API.</p>
            <p>Your test verification code is: <strong style="font-size: 24px; color: #cd7f32;">${testCode}</strong></p>
            <p>If you received this, Resend is working correctly!</p>
          </body>
        </html>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("");
    console.log("📊 Full Response:");
    console.log(JSON.stringify(result, null, 2));
    console.log("");
    console.log("📬 Email ID:", result.data?.id || "N/A");
    console.log("");
    console.log("=".repeat(60));
    console.log("");
    console.log("✅ SUCCESS! Check your email inbox (and spam folder)");
    console.log("   Email: auyamhirizhonga@gmail.com");
    console.log("");
    console.log("🔍 Also check Resend Dashboard:");
    console.log("   https://resend.com/emails");
    console.log("");

  } catch (error) {
    console.error("\n❌ FAILED to send email!");
    console.error("");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("");
      console.error("Full error:", error);
    } else {
      console.error("Error:", JSON.stringify(error, null, 2));
    }
    console.log("");
    console.log("🔧 Possible issues:");
    console.log("1. Invalid API key");
    console.log("2. Resend account suspended or out of credits");
    console.log("3. Network/firewall blocking Resend API");
    console.log("4. API key doesn't have sending permissions");
    console.log("");
    console.log("📝 Check your Resend dashboard:");
    console.log("   https://resend.com/api-keys");
    console.log("   https://resend.com/emails");
    console.log("");
    process.exit(1);
  }
}

testResendDirect();
