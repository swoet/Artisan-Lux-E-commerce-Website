import { NextResponse } from "next/server";
import { getVersion } from "@/lib/version";

export const revalidate = 0;

export async function GET() {
  // Always return current in-memory version; no caching
  return new NextResponse(JSON.stringify({ version: getVersion() }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
