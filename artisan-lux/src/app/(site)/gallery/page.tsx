import { db } from "@/db";
import { userContent, products, customers, mediaAssets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Customer Gallery | Artisan Lux",
  description: "See how our customers style their Artisan Lux pieces",
};

export default async function GalleryPage() {
  // Fetch approved UGC with product and customer info
  const ugcPosts = await db
    .select({
      ugc: userContent,
      product: {
        id: products.id,
        title: products.title,
        slug: products.slug,
        priceDecimal: products.priceDecimal,
        currency: products.currency,
        coverImageId: products.coverImageId,
      },
      customer: customers,
      media: mediaAssets,
    })
    .from(userContent)
    .leftJoin(products, eq(userContent.productId, products.id))
    .leftJoin(customers, eq(userContent.customerId, customers.id))
    .leftJoin(mediaAssets, eq(userContent.mediaId, mediaAssets.id))
    .where(eq(userContent.status, "approved"))
    .orderBy(desc(userContent.createdAt))
    .limit(50);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Customer Gallery
          </h1>
          <p className="text-xl opacity-90">
            See how our community styles their Artisan Lux pieces
          </p>
        </div>
      </div>

      {/* Upload CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Share Your Style</h3>
              <p className="text-sm text-neutral-700">
                Upload photos of your Artisan Lux pieces and earn rewards
              </p>
            </div>
            <Link href="/gallery/upload" className="btn btn-primary">
              Upload Photo
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {ugcPosts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-2xl font-serif font-bold mb-2">No Posts Yet</h2>
            <p className="text-neutral-600 mb-6">
              Be the first to share your Artisan Lux style
            </p>
            <Link href="/gallery/upload" className="btn btn-primary">
              Upload Your First Photo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ugcPosts.map(({ ugc, product, customer, media }) => (
              <div
                key={ugc.id}
                className="group relative aspect-square bg-neutral-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                {media?.url && (
                  <Image
                    src={media.url}
                    alt={ugc.caption || "Customer photo"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    {/* Caption */}
                    {ugc.caption && (
                      <p className="text-sm mb-2 line-clamp-2">{ugc.caption}</p>
                    )}

                    {/* Customer Name */}
                    <div className="text-xs opacity-90 mb-2">
                      by {customer?.name || "Anonymous"}
                    </div>

                    {/* Product Tag */}
                    {product && (
                      <Link
                        href={`/product/${product.slug}`}
                        className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded hover:bg-white/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>🛍️</span>
                        <span>{product.title}</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Likes Badge */}
                {typeof ugc.likes === "number" && ugc.likes > 0 && (
                  <div className="absolute top-2 right-2 bg-brand-metallic text-white text-xs px-2 py-1 rounded-full">
                    ❤️ {ugc.likes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
