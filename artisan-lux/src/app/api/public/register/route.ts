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
    if (upstream.ok) {
      res.cookies.set({
        name: "customer_session",
        value: Buffer.from(`${email}:${Date.now()}`).toString("base64"),
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: true,
      });
    }
    return res;
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
