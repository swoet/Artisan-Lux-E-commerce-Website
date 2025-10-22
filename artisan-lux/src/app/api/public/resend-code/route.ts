import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ADMIN_BASE_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const type = typeof body.type === "string" ? body.type : "signin";
  
  if (!email) return NextResponse.json({ ok: false, error: "email required" }, { status: 200 });

  try {
    const upstream = await fetch(`${BASE}/api/public/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type })
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json({ ok: false, error: data?.error || "Failed to resend code" }, { status: 200 });
    }
    return NextResponse.json({ ok: true, ...data }, { status: 200 });
  } catch (error) {
    console.error("Resend code proxy error:", error);
    return NextResponse.json({ ok: false, error: "Service temporarily unavailable" }, { status: 200 });
  }
}
