import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ADMIN_BASE_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  try {
    const upstream = await fetch(`${BASE}/api/public/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name })
    });
    const data = await upstream.json().catch(() => ({}));
    const res = NextResponse.json(data, { status: upstream.status });
    // Note: Session cookie is set after verification, not here
    return res;
  } catch (error) {
    console.error("Register proxy error:", error);
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
