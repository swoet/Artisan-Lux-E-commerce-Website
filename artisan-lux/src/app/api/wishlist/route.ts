import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { wishlists, wishlistItems, categories, mediaAssets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Get wishlist
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wishlist_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ items: [] });
    }

    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.sessionToken, sessionToken))
      .limit(1);

    if (wishlist.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const items = await db
      .select({
        id: wishlistItems.id,
        productId: categories.id,
        slug: categories.slug,
        title: categories.name,
        priceDecimal: categories.priceDecimal,
        currency: categories.currency,
        coverImageUrl: mediaAssets.url,
        addedAt: wishlistItems.createdAt,
      })
      .from(wishlistItems)
      .innerJoin(categories, eq(wishlistItems.productId, categories.id))
      .leftJoin(mediaAssets, eq(categories.coverImageId, mediaAssets.id))
      .where(eq(wishlistItems.wishlistId, wishlist[0].id));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    const cookieStore = await cookies();
    let sessionToken = cookieStore.get("wishlist_session")?.value;

    // Create session if doesn't exist
    if (!sessionToken) {
      sessionToken = crypto.randomUUID();
      cookieStore.set("wishlist_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // Get or create wishlist
    let wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.sessionToken, sessionToken))
      .limit(1);

    if (wishlist.length === 0) {
      const newWishlist = await db
        .insert(wishlists)
        .values({ sessionToken })
        .returning();
      wishlist = newWishlist;
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist[0].id),
          eq(wishlistItems.productId, productId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ message: "Already in wishlist" });
    }

    // Add to wishlist
    await db.insert(wishlistItems).values({
      wishlistId: wishlist[0].id,
      productId,
    });

    return NextResponse.json({ message: "Added to wishlist" });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    await db.delete(wishlistItems).where(eq(wishlistItems.id, Number(itemId)));

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
