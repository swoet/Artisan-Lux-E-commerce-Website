/**
 * Complete test of the verification flow
 * Tests: Code generation → Email sending → Code verification
 */

import { createVerificationCode, sendVerificationEmail, verifyCode } from "../src/lib/verification";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testFullFlow() {
  console.log("\n🧪 Testing Complete Verification Flow\n");
  console.log("=".repeat(60));

  const testEmail = process.argv[2];
  
  if (!testEmail) {
    console.error("❌ Please provide an email address");
    console.log("\nUsage: npx tsx scripts/test-full-flow.ts your-email@example.com\n");
    process.exit(1);
  }

  console.log(`📧 Test Email: ${testEmail}\n`);

  try {
    // Step 1: Generate verification code
    console.log("Step 1: Generating verification code...");
    const code = await createVerificationCode(testEmail);
    console.log(`✅ Code generated: ${code}`);
    console.log(`   (Expires in 10 minutes)\n`);

    // Step 2: Send email
    console.log("Step 2: Sending verification email...");
    await sendVerificationEmail(testEmail, code, "signup");
    console.log(`✅ Email sent successfully!\n`);

    // Step 3: Verify the code works
    console.log("Step 3: Testing code verification...");
    const isValid = await verifyCode(testEmail, code);
    console.log(`✅ Code verification: ${isValid ? "VALID ✅" : "INVALID ❌"}\n`);

    console.log("=".repeat(60));
    console.log("\n🎉 All tests passed!");
    console.log("\n📝 Next steps:");
    console.log("1. Check your email inbox for the verification code");
    console.log("2. The code should match:", code);
    console.log("3. If you received it, the system is working!");
    console.log("4. Try signing up through the app at http://localhost:3000\n");

  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      console.error(`\n   Stack: ${error.stack}`);
    } else {
      console.error(`   ${JSON.stringify(error, null, 2)}`);
    }
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Ensure RESEND_API_KEY is set in .env.local");
    console.log("2. Ensure database is running and connected");
    console.log("3. Check POSTGRES_URL in .env.local");
    console.log("4. Run: node scripts/check-env.js\n");
    process.exit(1);
  }
}

testFullFlow();
