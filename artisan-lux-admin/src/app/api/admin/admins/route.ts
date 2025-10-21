import { NextRequest, NextResponse } from "next/server";
import { createAdmin, getSession } from "@/db/queries/admins";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function requireSuperAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value || "";
  const s = token ? await getSession(token) : null;
  if (!s) return null;
  const [admin] = await db.select().from(admins).where(eq(admins.id, s.adminId)).limit(1);
  if (!admin || admin.role !== "superadmin") return null;
  return admin;
}

export async function GET(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const rows = await db.select().from(admins).orderBy(desc(admins.createdAt));
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = (body.role as string) === "superadmin" ? "superadmin" : "admin";
  if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });
  const created = await createAdmin({ email, password, role: role as any });
  return NextResponse.json({ ok: true, admin: created }, { status: 201 });
}
