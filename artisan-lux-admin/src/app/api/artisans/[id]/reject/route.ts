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
    const { reason } = await request.json();

    // Get artisan
    const [artisan] = await db
      .select()
      .from(artisans)
      .where(eq(artisans.id, artisanId))
      .limit(1);

    if (!artisan) {
      return NextResponse.json({ error: "Artisan not found" }, { status: 404 });
    }

    // Update status to suspended (or you could delete the record)
    await db
      .update(artisans)
      .set({
        status: "suspended",
        updatedAt: new Date(),
      })
      .where(eq(artisans.id, artisanId));

    // Send rejection email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: artisan.email,
          subject: "Artisan Lux Application Update",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2a1a10 0%, #4a3020 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Artisan Lux</h1>
                </div>
                <div class="content">
                  <h2>Hi ${artisan.name},</h2>
                  
                  <p>Thank you for your interest in joining Artisan Lux as an artisan creator.</p>
                  
                  <p>After careful review, we're unable to approve your application at this time.</p>
                  
                  ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                  
                  <p>If you have any questions or would like to discuss this decision, please contact us at <a href="mailto:support@artisanlux.com">support@artisanlux.com</a></p>
                  
                  <p>We appreciate your interest in Artisan Lux.</p>
                  
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
      console.error("Failed to send rejection email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Artisan application rejected",
    });
  } catch (error) {
    console.error("Error rejecting artisan:", error);
    return NextResponse.json(
      { error: "Failed to reject artisan" },
      { status: 500 }
    );
  }
}
