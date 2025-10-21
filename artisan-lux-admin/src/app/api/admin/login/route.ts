import { NextRequest, NextResponse } from "next/server";
import { findAdminByEmail, createAdmin, createSession } from "@/db/queries/admins";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });

  let admin = await findAdminByEmail(email);
  if (!admin) {
    // Seed superadmin if credentials match env on first login
    if (process.env.SEED_ADMIN_EMAIL === email && process.env.SEED_ADMIN_PASSWORD === password) {
      admin = await createAdmin({ email, password, role: "superadmin" });
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const session = await createSession(admin.id);
  const res = NextResponse.json({ ok: true, role: admin.role });
  res.cookies.set({
    name: "admin_session_v2",
    value: session.token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
