import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ADMIN_BASE_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const type = typeof body.type === "string" ? body.type : "signin";
  
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  try {
    const upstream = await fetch(`${BASE}/api/public/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type })
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Resend code proxy error:", error);
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
