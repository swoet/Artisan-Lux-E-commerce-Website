import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { findAdminByEmail, createAdmin } from "@/db/queries/admins";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-reset-token") ?? "";
  const expected = process.env.ADMIN_RESET_TOKEN ?? "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const createIfMissing = Boolean(body.createIfMissing);

  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const existing = await findAdminByEmail(email);
  if (!existing) {
    if (!createIfMissing) {
      return NextResponse.json({ error: "admin not found" }, { status: 404 });
    }
    const created = await createAdmin({ email, password, role: "superadmin" });
    return NextResponse.json({ ok: true, created: true, id: created.id });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.update(admins).set({ passwordHash }).where(eq(admins.id, existing.id));
  return NextResponse.json({ ok: true, updated: true });
}
