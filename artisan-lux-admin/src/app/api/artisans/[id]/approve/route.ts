import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artisans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artisanId = parseInt(params.id);

    // Get artisan
    const [artisan] = await db
      .select()
      .from(artisans)
      .where(eq(artisans.id, artisanId))
      .limit(1);

    if (!artisan) {
      return NextResponse.json({ error: "Artisan not found" }, { status: 404 });
    }

    if (artisan.status === "active") {
      return NextResponse.json({ error: "Artisan already active" }, { status: 400 });
    }

    if (!artisan.emailVerified) {
      return NextResponse.json(
        { error: "Cannot approve artisan with unverified email" },
        { status: 400 }
      );
    }

    // Update status to active
    await db
      .update(artisans)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(artisans.id, artisanId));

    // Send activation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: artisan.email,
          subject: "🎉 Your Artisan Lux Account is Active!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2a1a10 0%, #4a3020 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .button { display: inline-block; background: #b87333; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                ul { padding-left: 20px; }
                li { margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to Artisan Lux!</h1>
                </div>
                <div class="content">
                  <h2>Hi ${artisan.name}!</h2>
                  
                  <div class="success">
                    <h3 style="margin: 0 0 10px 0;">✅ Your Account is Now Active!</h3>
                    <p style="margin: 0;">You can now access the Artisan Portal</p>
                  </div>
                  
                  <p>Congratulations! Your artisan account has been approved and activated. You can now:</p>
                  
                  <ul>
                    <li><strong>Create and manage products</strong> - Add your beautiful creations to the marketplace</li>
                    <li><strong>Handle custom orders</strong> - Work directly with customers on bespoke pieces</li>
                    <li><strong>Track your sales</strong> - Monitor your performance and earnings</li>
                    <li><strong>Update your profile</strong> - Showcase your studio and specialties</li>
                  </ul>
                  
                  <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_ARTISAN_URL || 'https://artisan.artisanlux.com'}/login" class="button">
                      Access Artisan Portal →
                    </a>
                  </div>
                  
                  <h3>Getting Started</h3>
                  <ol>
                    <li>Log in to the <a href="${process.env.NEXT_PUBLIC_ARTISAN_URL || 'https://artisan.artisanlux.com'}/login">Artisan Portal</a></li>
                    <li>Complete your profile with photos and bio</li>
                    <li>Add your first product</li>
                    <li>Start selling!</li>
                  </ol>
                  
                  <p>If you have any questions, our support team is here to help at <a href="mailto:support@artisanlux.com">support@artisanlux.com</a></p>
                  
                  <p>We're excited to have you as part of the Artisan Lux community!</p>
                  
                  <div class="footer">
                    <p><strong>Artisan Portal:</strong> ${process.env.NEXT_PUBLIC_ARTISAN_URL || 'https://artisan.artisanlux.com'}</p>
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
      console.error("Failed to send activation email:", emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Artisan approved and activation email sent",
    });
  } catch (error) {
    console.error("Error approving artisan:", error);
    return NextResponse.json(
      { error: "Failed to approve artisan" },
      { status: 500 }
    );
  }
}
