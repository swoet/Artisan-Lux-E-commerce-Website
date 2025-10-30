import { db } from "@/db";
import { products, productArtisans, artisans, provenancePassports } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

interface ArtisanProductBadgeProps {
  productSlug: string;
}

export default async function ArtisanProductBadge({ productSlug }: ArtisanProductBadgeProps) {
  // Fetch product with artisan and passport info
  const [productData] = await db
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
        coverImageId: products.coverImageId,
        model3dAssetId: products.model3dAssetId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      },
      artisan: artisans,
      passport: provenancePassports,
    })
    .from(products)
    .innerJoin(productArtisans, eq(products.id, productArtisans.productId))
    .innerJoin(artisans, eq(productArtisans.artisanId, artisans.id))
    .leftJoin(provenancePassports, eq(products.id, provenancePassports.productId))
    .where(eq(products.slug, productSlug))
    .limit(1);

  if (!productData || !productData.artisan) {
    return null;
  }

  const { artisan, passport } = productData;

  return (
    <div className="space-y-4">
      {/* Artisan Made Badge */}
      <div className="inline-flex items-center gap-2 bg-brand-dark-wood text-white px-4 py-2 rounded-full">
        <span className="text-lg">🎨</span>
        <span className="font-medium">Artisan Made</span>
      </div>

      {/* Artisan Info Card */}
      <div className="border border-neutral-200 rounded-lg p-4 bg-white">
        <h3 className="font-serif font-bold text-lg mb-3">Meet the Artisan</h3>
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
            <div className="flex items-center justify-center h-full text-xl text-brand-dark-wood">
              {artisan.name.charAt(0)}
            </div>
          </div>
          <div className="flex-1">
            <div className="font-bold">{artisan.name}</div>
            {artisan.specialties && artisan.specialties.length > 0 && (
              <div className="text-sm text-neutral-600 mb-2">
                {artisan.specialties.join(", ")}
              </div>
            )}
            <Link
              href={`/artisan/${artisan.slug}`}
              className="text-sm text-brand-dark-wood hover:text-brand-metallic font-medium"
            >
              View Profile →
            </Link>
          </div>
        </div>
      </div>

      {/* Provenance Passport Link */}
      {passport && (
        <Link
          href={`/passport/${passport.serialNumber}`}
          className="block border-2 border-brand-metallic rounded-lg p-4 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏺</div>
            <div className="flex-1">
              <div className="font-serif font-bold text-lg text-brand-dark-wood">
                Provenance Passport
              </div>
              <div className="text-sm text-neutral-600">
                View the complete story, materials origin, and artisan notes
              </div>
            </div>
            <div className="text-brand-dark-wood">→</div>
          </div>
        </Link>
      )}

      {/* Key Features */}
      {passport && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <h4 className="font-bold mb-3">Product Details</h4>
          <div className="space-y-2 text-sm">
            {passport.materialsOrigin && (
              <div className="flex items-start gap-2">
                <span className="text-brand-metallic">📍</span>
                <div>
                  <div className="font-medium">Origin</div>
                  <div className="text-neutral-600">{passport.materialsOrigin}</div>
                </div>
              </div>
            )}
            {passport.productionTimeHours && (
              <div className="flex items-start gap-2">
                <span className="text-brand-metallic">⏱️</span>
                <div>
                  <div className="font-medium">Production Time</div>
                  <div className="text-neutral-600">{passport.productionTimeHours} hours</div>
                </div>
              </div>
            )}
            {passport.warrantyYears && (
              <div className="flex items-start gap-2">
                <span className="text-brand-metallic">✓</span>
                <div>
                  <div className="font-medium">Warranty</div>
                  <div className="text-neutral-600">{passport.warrantyYears} years</div>
                </div>
              </div>
            )}
            {passport.carbonFootprint && (
              <div className="flex items-start gap-2">
                <span className="text-brand-metallic">🌱</span>
                <div>
                  <div className="font-medium">Carbon Footprint</div>
                  <div className="text-neutral-600">{passport.carbonFootprint} kg CO₂</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
