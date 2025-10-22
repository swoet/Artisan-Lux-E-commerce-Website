import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Send welcome email
    const welcomeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; }
            .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-family: 'Playfair Display', serif; margin: 0;">Artisan Lux</h1>
          </div>
          
          <div class="content">
            <h2>Welcome to Artisan Lux${name ? `, ${name}` : ""}!</h2>
            <p>Thank you for subscribing to our newsletter. You'll receive exclusive updates about:</p>
            <ul>
              <li>New product launches</li>
              <li>Special offers and promotions</li>
              <li>Behind-the-scenes artisan stories</li>
              <li>Luxury lifestyle insights</li>
            </ul>
            <p>Stay tuned for our next edition!</p>
          </div>
        </body>
      </html>
    `;

    const result = await sendNewsletterEmail({
      recipientEmail: email,
      recipientName: name,
      subject: "Welcome to Artisan Lux Newsletter",
      content: welcomeContent,
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Subscribed successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
