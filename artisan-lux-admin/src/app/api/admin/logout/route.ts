import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/db/queries/admins";

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get("admin_session_v2") ?? req.cookies.get("admin_session");
  const token = sessionCookie?.value;
  if (token) await deleteSession(token);
  
  const res = NextResponse.redirect(new URL("/login", req.url));
  // Clear both old and new cookie names
  res.cookies.set({ 
    name: "admin_session_v2", 
    value: "", 
    path: "/", 
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax"
  });
  res.cookies.set({ 
    name: "admin_session", 
    value: "", 
    path: "/", 
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax"
  });
  return res;
}
