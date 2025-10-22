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
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/">
          <h1 className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent cursor-pointer">
            Artisan Lux
          </h1>
        </Link>
        <Link href="/" className="text-sm hover:text-[#cd7f32] transition-colors">
          ← Back to Home
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <h1 className="font-serif text-5xl font-bold mb-2 bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
          My Wishlist
        </h1>
        <p className="text-neutral-400 mb-12">Your curated collection of favorites</p>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="text-6xl mb-6">💝</div>
            <h2 className="text-2xl font-serif mb-4">Your wishlist is empty</h2>
            <p className="text-neutral-400 mb-8">Start adding items you love</p>
            <Link
              href="/categories"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#b87333]/20"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="group">
                <Link href={`/product/${item.slug}`}>
                  <div className="relative aspect-square bg-black/30 rounded-xl overflow-hidden mb-4 border border-white/10 hover:border-[#cd7f32]/50 transition-all">
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500">
                        No image
                      </div>
                    )}
                    {/* Wishlist heart indicator */}
                    <div className="absolute top-3 right-3 w-10 h-10 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">❤️</span>
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-white mb-2 group-hover:text-[#cd7f32] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[#cd7f32] font-semibold">
                    {item.currency} {parseFloat(item.priceDecimal).toFixed(2)}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
