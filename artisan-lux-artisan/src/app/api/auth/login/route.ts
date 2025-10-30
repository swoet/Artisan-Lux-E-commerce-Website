import { NextRequest, NextResponse } from "next/server";
import { createArtisanSession } from "@/lib/auth";

// Ensure this route is always dynamic and runs on Node.js runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("[login] POST start");
    console.time("[login] parse json");
    const { email, password } = await request.json();
    console.timeEnd("[login] parse json");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.time("[login] create session");
    const result = await createArtisanSession(email, password);
    console.timeEnd("[login] create session");

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      artisan: result.session,
    });
    console.log("[login] POST success");
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
