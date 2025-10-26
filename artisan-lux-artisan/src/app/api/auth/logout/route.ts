import { NextResponse } from "next/server";
import { destroyArtisanSession } from "@/lib/auth";

export async function POST() {
  try {
    await destroyArtisanSession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
