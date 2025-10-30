import { db } from "@/db";
import { artisans, products, productArtisans, categories, mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface ArtisanPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ArtisanPageProps) {
  const [artisan] = await db
    .select()
    .from(artisans)
    .where(eq(artisans.slug, params.slug))
    .limit(1);

  if (!artisan) {
    return {
      title: "Artisan Not Found",
    };
  }

  return {
    title: `${artisan.name} - Artisan Profile | Artisan Lux`,
    description: artisan.bio || `Discover handcrafted products by ${artisan.name}`,
  };
}

export default async function ArtisanPage({ params }: ArtisanPageProps) {
  // Fetch artisan details with cover media joined
  const [row] = await db
    .select({ artisan: artisans, cover: mediaAssets })
    .from(artisans)
    .leftJoin(mediaAssets, eq(artisans.coverMediaId, mediaAssets.id))
    .where(eq(artisans.slug, params.slug))
    .limit(1);

  if (!row?.artisan) {
    notFound();
  }
  const artisan = row.artisan;
  const artisanCover = row.cover;

  // Fetch artisan's products
  const artisanProducts = await db
    .select({
      product: {
        id: products.id,
        title: products.title,
        slug: products.slug,
        subtitle: products.subtitle,
        descriptionRich: products.descriptionRich,
        materials: products.materials,
        priceDecimal: products.priceDecimal,
        currency: products.currency,
        categoryId: products.categoryId,
        subcategoryId: products.subcategoryId,
        tags: products.tags,
        status: products.status,
        isFeatured: products.isFeatured,
        order: products.order,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
        coverImageId: products.coverImageId,
        model3dAssetId: products.model3dAssetId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      },
      category: categories,
      cover: mediaAssets,
    })
    .from(products)
    .innerJoin(productArtisans, eq(products.id, productArtisans.productId))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(mediaAssets, eq(products.coverImageId, mediaAssets.id))
    .where(eq(productArtisans.artisanId, artisan.id));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-br from-brand-dark-wood to-brand-metallic">
        {artisanCover?.url && (
          <Image
            src={artisanCover.url}
            alt={artisan.name}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <div className="flex items-center justify-center h-full text-4xl text-brand-dark-wood">
                  {artisan.name.charAt(0)}
                </div>
              </div>

              {/* Name & Title */}
              <div className="flex-1 text-white pb-4">
                <h1 className="text-4xl font-serif font-bold mb-2">{artisan.name}</h1>
                {artisan.specialties && artisan.specialties.length > 0 && (
                  <p className="text-lg opacity-90">{artisan.specialties.join(" • ")}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* About */}
            <div className="card">
              <h2 className="text-xl font-serif font-bold mb-4">About</h2>
              <p className="text-neutral-700 leading-relaxed">
                {artisan.bio || "No bio available"}
              </p>
            </div>

            {/* Studio Info */}
            {artisan.studioLocation && (
              <div className="card">
                <h2 className="text-xl font-serif font-bold mb-4">Studio</h2>
                <div className="space-y-2 text-neutral-700">
                  <div className="flex items-start gap-2">
                    <span className="text-brand-metallic">📍</span>
                    <span>{artisan.studioLocation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {(artisan.website || artisan.instagram) && (
              <div className="card">
                <h2 className="text-xl font-serif font-bold mb-4">Connect</h2>
                <div className="space-y-2">
                  {artisan.website && (
                    <a
                      href={artisan.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-dark-wood hover:text-brand-metallic"
                    >
                      🌐 Website
                    </a>
                  )}
                  {artisan.instagram && (
                    <a
                      href={`https://instagram.com/${artisan.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-dark-wood hover:text-brand-metallic"
                    >
                      📷 Instagram
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="card">
              <h2 className="text-xl font-serif font-bold mb-4">Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Products</span>
                  <span className="font-bold">{artisanProducts.length}</span>
                </div>
                {artisan.rating && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Rating</span>
                    <span className="font-bold">⭐ {Number(artisan.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold">Products by {artisan.name}</h2>
              <p className="text-neutral-600 mt-1">
                {artisanProducts.length} {artisanProducts.length === 1 ? "product" : "products"}
              </p>
            </div>

            {artisanProducts.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-neutral-600">No products available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artisanProducts.map(({ product, category, cover }) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="card hover:shadow-lg transition-shadow group"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-64 bg-neutral-100 rounded-lg mb-4 overflow-hidden">
                      {cover?.url ? (
                        <Image
                          src={cover.url}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400">
                          No Image
                        </div>
                      )}
                      {/* Artisan Badge */}
                      <div className="absolute top-2 left-2 bg-brand-dark-wood text-white text-xs px-3 py-1 rounded-full">
                        🎨 Artisan Made
                      </div>
                    </div>

                    {/* Product Info */}
                    <h3 className="font-serif font-bold text-lg mb-1 group-hover:text-brand-metallic transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">{category?.name}</p>
                    <div className="text-xl font-bold text-brand-dark-wood">
                      ${Number(product.priceDecimal).toLocaleString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
