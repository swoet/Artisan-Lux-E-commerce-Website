import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ADMIN_BASE_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  
  if (!email || !code) {
    return NextResponse.json({ error: "email and code required" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BASE}/api/public/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    const data = await upstream.json().catch(() => ({}));
    const res = NextResponse.json(data, { status: upstream.status });
    
    if (upstream.ok) {
      const sessionValue = Buffer.from(`${email}:${Date.now()}`).toString("base64");
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      
      // Get customer name from response
      const customerName = data.customer?.name || "";
      
      // Set httpOnly session cookie (secure, can't be read by JS)
      res.cookies.set({
        name: "customer_session",
        value: sessionValue,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge,
        secure: process.env.NODE_ENV === "production",
      });
      
      // Set a readable flag cookie for client-side auth checks
      res.cookies.set({
        name: "customer_auth",
        value: "true",
        httpOnly: false, // Can be read by JavaScript
        sameSite: "lax",
        path: "/",
        maxAge,
        secure: process.env.NODE_ENV === "production",
      });
      
      // Also set email in a readable cookie
      res.cookies.set({
        name: "customer_email",
        value: email,
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge,
        secure: process.env.NODE_ENV === "production",
      });
      
      // Set customer name in a readable cookie
      if (customerName) {
        res.cookies.set({
          name: "customer_name",
          value: customerName,
          httpOnly: false,
          sameSite: "lax",
          path: "/",
          maxAge,
          secure: process.env.NODE_ENV === "production",
        });
      }

      // Rotate cart token and wishlist session to isolate carts per account
      const newCartToken = crypto.randomUUID();
      res.cookies.set({
        name: "cart_token",
        value: newCartToken,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        secure: process.env.NODE_ENV === "production",
      });
      const newWishlistToken = crypto.randomUUID();
      res.cookies.set({
        name: "wishlist_session",
        value: newWishlistToken,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        secure: process.env.NODE_ENV === "production",
      });
    }
    return res;
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
