import { db } from "@/db";
import { drops, products, artisans } from "@/db/schema";
import { eq, gte } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import DropCountdown from "@/components/site/DropCountdown";

export const metadata = {
  title: "Limited Drops | Artisan Lux",
  description: "Exclusive limited releases from our artisans",
};

export default async function DropsPage() {
  const now = new Date();

  // Fetch upcoming drops
  const upcomingDrops = await db
    .select({
      drop: drops,
      product: products,
      artisan: artisans,
    })
    .from(drops)
    .innerJoin(products, eq(drops.productId, products.id))
    .leftJoin(artisans, eq(drops.artisanId, artisans.id))
    .where(gte(drops.dropDate, now))
    .orderBy(drops.dropDate);

  // Fetch active drops (live now)
  const activeDrops = await db
    .select({
      drop: drops,
      product: products,
      artisan: artisans,
    })
    .from(drops)
    .innerJoin(products, eq(drops.productId, products.id))
    .leftJoin(artisans, eq(drops.artisanId, artisans.id))
    .where(eq(drops.status, "active"));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Limited Drops
          </h1>
          <p className="text-xl opacity-90">
            Exclusive releases from our master artisans
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Active Drops */}
        {activeDrops.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold mb-6">Live Now 🔥</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDrops.map(({ drop, product, artisan }) => (
                <Link
                  key={drop.id}
                  href={`/product/${product.slug}`}
                  className="card hover:shadow-xl transition-shadow relative overflow-hidden"
                >
                  {/* Live Badge */}
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse z-10">
                    LIVE NOW
                  </div>

                  {/* Product Image */}
                  <div className="relative w-full h-64 bg-neutral-100 rounded-lg mb-4 overflow-hidden">
                    {product.coverImageId ? (
                      <div className="flex items-center justify-center h-full text-neutral-400">
                        Product Image
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <h3 className="font-serif font-bold text-xl mb-2">{product.title}</h3>
                  {artisan && (
                    <p className="text-sm text-neutral-600 mb-3">by {artisan.name}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-brand-dark-wood">
                      ${parseFloat(product.priceDecimal).toFixed(2)}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {drop.quantityAvailable} available
                    </div>
                  </div>

                  <div className="btn btn-primary w-full justify-center">
                    Shop Now
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Drops */}
        {upcomingDrops.length > 0 && (
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingDrops.map(({ drop, product, artisan }) => (
                <div
                  key={drop.id}
                  className="card relative overflow-hidden"
                >
                  {/* VIP Badge */}
                  {drop.vipEarlyAccess && (
                    <div className="absolute top-4 right-4 bg-brand-metallic text-white text-xs px-3 py-1 rounded-full z-10">
                      VIP Early Access
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative w-full h-64 bg-neutral-100 rounded-lg mb-4 overflow-hidden opacity-75">
                    <div className="flex items-center justify-center h-full text-neutral-400">
                      Coming Soon
                    </div>
                  </div>

                  {/* Product Info */}
                  <h3 className="font-serif font-bold text-xl mb-2">{product.title}</h3>
                  {artisan && (
                    <p className="text-sm text-neutral-600 mb-3">by {artisan.name}</p>
                  )}
                  
                  <div className="mb-4">
                    <DropCountdown dropDate={drop.dropDate} />
                  </div>

                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <span>{drop.quantityAvailable} pieces</span>
                    <span>${parseFloat(product.priceDecimal).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeDrops.length === 0 && upcomingDrops.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-serif font-bold mb-2">No Drops Scheduled</h2>
            <p className="text-neutral-600 mb-6">
              Check back soon for exclusive limited releases
            </p>
            <Link href="/products" className="btn btn-primary">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
