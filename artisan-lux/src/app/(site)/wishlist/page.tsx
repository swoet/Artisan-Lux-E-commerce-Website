import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/db";
import { wishlists, wishlistItems, products, mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "My Wishlist | Artisan Lux",
  description: "Your saved products",
};

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("wishlist_session")?.value;

  type WishlistItem = {
    id: number;
    productId: number;
    slug: string;
    title: string;
    priceDecimal: string;
    currency: string;
    coverImageUrl: string | null;
    addedAt: Date;
  };
  let items: WishlistItem[] = [];

  if (sessionToken) {
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.sessionToken, sessionToken))
      .limit(1);

    if (wishlist.length > 0) {
      items = await db
        .select({
          id: wishlistItems.id,
          productId: products.id,
          slug: products.slug,
          title: products.title,
          priceDecimal: products.priceDecimal,
          currency: products.currency,
          coverImageUrl: mediaAssets.url,
          addedAt: wishlistItems.createdAt,
        })
        .from(wishlistItems)
        .innerJoin(products, eq(wishlistItems.productId, products.id))
        .leftJoin(mediaAssets, eq(products.coverImageId, mediaAssets.id))
        .where(eq(wishlistItems.wishlistId, wishlist[0].id));
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-6">Your wishlist is empty</p>
          <Link
            href="/categories"
            className="inline-block bg-neutral-900 text-white px-6 py-3 rounded-md hover:bg-neutral-800"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group">
              <Link href={`/product/${item.slug}`}>
                <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-4">
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600">
                  {item.currency} {parseFloat(item.priceDecimal).toFixed(2)}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
