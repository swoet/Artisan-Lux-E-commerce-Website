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
    const [artisan] = await db
      .select()
      .from(artisans)
      .where(eq(artisans.email, email.toLowerCase()))
      .limit(1);

    if (!artisan) {
      return { success: false, error: "Invalid credentials" };
    }

    const validPassword = await bcrypt.compare(password, artisan.passwordHash);
    if (!validPassword) {
      return { success: false, error: "Invalid credentials" };
    }

    if (!artisan.emailVerified) {
      return { success: false, error: "Please verify your email before logging in. Check your inbox for the verification code." };
    }

    if (artisan.status !== "active") {
      return { success: false, error: "Your account is under review. You'll receive an email once it's activated." };
    }

    // Generate session token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await db.insert(artisanSessions).values({
      artisanId: artisan.id,
      token,
      expiresAt,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

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
    return { success: false, error: "An error occurred" };
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
