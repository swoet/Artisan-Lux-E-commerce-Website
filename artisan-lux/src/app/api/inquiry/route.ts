import { NextRequest, NextResponse } from "next/server";

type InquiryPayload = {
  name: string;
  email: string;
  message: string;
  productName: string;
  productSlug: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InquiryPayload;

    // Validate required fields
    if (!body.name || !body.email || !body.message || !body.productName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // TODO: Implement actual inquiry handling
    // Options:
    // 1. Send email notification (using Resend, SendGrid, etc.)
    // 2. Store in database (PostgreSQL)
    // 3. Send to CRM system
    // 4. Post to webhook/notification service

    console.log("Inquiry received:", {
      name: body.name,
      email: body.email,
      product: body.productName,
      slug: body.productSlug,
      message: body.message,
      timestamp: new Date().toISOString(),
    });

    // For now, log the inquiry and return success
    return NextResponse.json(
      {
        success: true,
        message: "Inquiry received successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return NextResponse.json(
      { error: "Failed to process inquiry" },
      { status: 500 }
    );
  }
}
