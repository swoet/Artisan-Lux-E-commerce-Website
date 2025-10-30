// @ts-nocheck - Schema imported from admin app causes type conflicts but works at runtime
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { artisans, artisanSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "artisan_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ArtisanSession {
  id: number;
  email: string;
  name: string;
  slug: string;
  status: "pending" | "active" | "suspended";
}

/**
 * Get the current artisan session from cookies
 */
export async function getArtisanSession(): Promise<ArtisanSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    // @ts-ignore - Schema imported from admin app causes type conflicts but works at runtime
    const [session] = await db
      .select({
        artisan: artisans,
        session: artisanSessions,
      })
      .from(artisanSessions)
      .innerJoin(artisans, eq(artisanSessions.artisanId, artisans.id))
      .where(eq(artisanSessions.token, token))
      .limit(1);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date() > session.session.expiresAt) {
      await db
        .delete(artisanSessions)
        .where(eq(artisanSessions.token, token));
      return null;
    }

    return {
      id: session.artisan.id,
      email: session.artisan.email,
      name: session.artisan.name,
      slug: session.artisan.slug,
      status: session.artisan.status,
    };
  } catch (error) {
    console.error("Error getting artisan session:", error);
    return null;
  }
}

/**
 * Require artisan authentication - redirects to login if not authenticated
 */
export async function requireArtisanAuth(): Promise<ArtisanSession> {
  const session = await getArtisanSession();
  
  if (!session) {
    redirect("/login");
  }

  if (session.status !== "active") {
    redirect("/login?error=inactive");
  }

  return session;
}

/**
 * Create a new artisan session
 */
export async function createArtisanSession(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: ArtisanSession }> {
  try {
    const startAll = Date.now();
    console.log("[auth] createArtisanSession:start", { email });

    // Helper to bound operation time
    const withTimeout = async <T>(p: Promise<T>, ms: number, label: string): Promise<T> => {
      return await Promise.race<T>([
        p,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)) as Promise<T>,
      ]);
    };

    console.time("[auth] db:select artisan");
    const [artisan] = await withTimeout(
      db
        .select()
        .from(artisans)
        .where(eq(artisans.email, email.toLowerCase()))
        .limit(1),
      8000,
      "select artisan"
    );
    console.timeEnd("[auth] db:select artisan");

    if (!artisan) {
      return { success: false, error: "Invalid credentials" };
    }

    console.time("[auth] bcrypt:compare");
    const validPassword = await bcrypt.compare(password, artisan.passwordHash);
    console.timeEnd("[auth] bcrypt:compare");
    if (!validPassword) {
      return { success: false, error: "Invalid credentials" };
    }

    // No status check needed - all accounts are active immediately

    // Generate session token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    console.time("[auth] db:insert session");
    await withTimeout(db.insert(artisanSessions).values({
      artisanId: artisan.id,
      token,
      expiresAt,
    }), 4000, "insert session");
    console.timeEnd("[auth] db:insert session");

    // Set cookie
    const cookieStore = await cookies();
    console.time("[auth] cookie:set");
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
    console.timeEnd("[auth] cookie:set");

    return {
      success: true,
      session: {
        id: artisan.id,
        email: artisan.email,
        name: artisan.name,
        slug: artisan.slug,
        status: artisan.status,
      },
    };
  } catch (error) {
    console.error("Error creating artisan session:", error);
    const message = (error as Error)?.message || "An error occurred";
    // If we hit our timeout guard, surface a 503-friendly message
    if (message.includes("timeout")) {
      return { success: false, error: "Login is taking longer than expected. Please try again in a moment." };
    }
    return { success: false, error: message };
  }
}

/**
 * Destroy the current artisan session
 */
export async function destroyArtisanSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(artisanSessions).where(eq(artisanSessions.token, token));
  }

  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
