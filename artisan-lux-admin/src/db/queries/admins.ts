import { db } from "../index";
import { admins, sessions } from "../schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function findAdminByEmail(email: string) {
  const [a] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  return a ?? null;
}

export async function createAdmin(input: { email: string; password: string; role?: "admin" | "superadmin" }) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const [a] = await db
    .insert(admins)
    .values({ email: input.email, passwordHash, role: (input.role ?? "admin") as any })
    .returning();
  return a;
}

export async function createSession(adminId: number, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const token = Buffer.from(`${adminId}.${Date.now()}.${Math.random().toString(36).slice(2)}`).toString("base64url");
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
  const [s] = await db.insert(sessions).values({ adminId, token, expiresAt }).returning();
  return s;
}

export async function getSession(token: string) {
  const [s] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  return s ?? null;
}

export async function deleteSession(token: string) {
  // Drizzle doesn't support delete returning in all drivers, ignore return
  await db.delete(sessions).where(eq(sessions.token, token));
}
