import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  const common = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };

  // Clear auth cookies
  res.cookies.set({ name: "customer_session", value: "", maxAge: 0, ...common });
  // customer_auth and others are readable (non-httpOnly), but server can still clear
  res.cookies.set({ name: "customer_auth", value: "", maxAge: 0, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.cookies.set({ name: "customer_email", value: "", maxAge: 0, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.cookies.set({ name: "customer_name", value: "", maxAge: 0, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });

  // Clear cart and wishlist session cookies to avoid cross-account mixing
  res.cookies.set({ name: "cart_token", value: "", maxAge: 0, ...common });
  res.cookies.set({ name: "wishlist_session", value: "", maxAge: 0, ...common });

  return res;
}
