import { db } from "@/db";
import { provenancePassports, products, artisans, productArtisans, ownershipHistory, serviceHistory, mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PassportPageProps {
  params: {
    serialNumber: string;
  };
}

export async function generateMetadata({ params }: PassportPageProps) {
  const [passport] = await db
    .select({
      passport: provenancePassports,
      product: products,
    })
    .from(provenancePassports)
    .innerJoin(products, eq(provenancePassports.productId, products.id))
    .where(eq(provenancePassports.serialNumber, params.serialNumber))
    .limit(1);

  if (!passport) {
    return {
      title: "Passport Not Found",
    };
  }

  return {
    title: `Provenance Passport: ${passport.product.title} | Artisan Lux`,
    description: `Discover the story behind ${passport.product.title}`,
  };
}

export default async function PassportPage({ params }: PassportPageProps) {
  // Fetch passport with product and artisan details + product cover image
  const [passportData] = await db
    .select({
      passport: provenancePassports,
      product: products,
      artisan: artisans,
      productCover: mediaAssets,
    })
    .from(provenancePassports)
    .innerJoin(products, eq(provenancePassports.productId, products.id))
    .innerJoin(productArtisans, eq(products.id, productArtisans.productId))
    .innerJoin(artisans, eq(productArtisans.artisanId, artisans.id))
    .leftJoin(mediaAssets, eq(products.coverImageId, mediaAssets.id))
    .where(eq(provenancePassports.serialNumber, params.serialNumber))
    .limit(1);

  if (!passportData) {
    notFound();
  }

  const { passport, product, artisan, productCover } = passportData;

  // Fetch ownership history
  const ownership = await db
    .select()
    .from(ownershipHistory)
    .where(eq(ownershipHistory.passportId, passport.id))
    .orderBy(ownershipHistory.transferDate);

  // Fetch service history
  const services = await db
    .select()
    .from(serviceHistory)
    .where(eq(serviceHistory.passportId, passport.id))
    .orderBy(serviceHistory.serviceDate);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🏺</div>
          <h1 className="text-4xl font-serif font-bold mb-4">Provenance Passport</h1>
          <p className="text-xl opacity-90 mb-2">{product.title}</p>
          <p className="text-sm opacity-75">Serial: {passport.serialNumber}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Product Overview */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
              {productCover?.url ? (
                <Image
                  src={productCover.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  No Image
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">{product.title}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Price</span>
                  <span className="font-bold">${Number(product.priceDecimal ?? 0).toFixed(2)} {product.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Created</span>
                  <span className="font-medium">
                    {new Date(passport.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {passport.warrantyYears && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Warranty</span>
                    <span className="font-medium">{passport.warrantyYears} years</span>
                  </div>
                )}
              </div>

              <Link href={`/product/${product.slug}`} className="btn btn-primary w-full justify-center">
                View Product
              </Link>
            </div>
          </div>
        </div>

        {/* Artisan Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Meet the Artisan</h2>
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
              <div className="flex items-center justify-center h-full text-2xl text-brand-dark-wood">
                {artisan.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{artisan.name}</h3>
              {artisan.specialties && artisan.specialties.length > 0 && (
                <p className="text-sm text-neutral-600 mb-2">
                  {artisan.specialties.join(", ")}
                </p>
              )}
              {artisan.bio && (
                <p className="text-neutral-700 mb-4">{artisan.bio}</p>
              )}
              <Link href={`/artisan/${artisan.slug}`} className="text-brand-dark-wood hover:text-brand-metallic font-medium">
                View Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Artisan Notes */}
        {passport.artisanNotes && (
          <div className="card mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Artisan's Story</h2>
            <div className="bg-neutral-50 border-l-4 border-brand-metallic p-6 rounded">
              <p className="text-neutral-700 italic leading-relaxed">
                "{passport.artisanNotes}"
              </p>
              <p className="text-sm text-neutral-600 mt-4">— {artisan.name}</p>
            </div>
          </div>
        )}

        {/* Materials & Origin */}
        <div className="card mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Materials & Origin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {passport.materialsOrigin && (
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <span>📍</span> Origin
                </h3>
                <p className="text-neutral-700">{passport.materialsOrigin}</p>
              </div>
            )}
            {/* Materials description not available in schema */}
            {passport.productionTimeHours && (
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <span>⏱️</span> Production Time
                </h3>
                <p className="text-neutral-700">{passport.productionTimeHours} hours</p>
              </div>
            )}
            {passport.carbonFootprint && (
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <span>🌱</span> Carbon Footprint
                </h3>
                <p className="text-neutral-700">{passport.carbonFootprint} kg CO₂</p>
              </div>
            )}
          </div>

          {passport.sustainabilityCertifications && passport.sustainabilityCertifications.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {passport.sustainabilityCertifications.map((cert, index) => (
                  <span key={index} className="badge badge-success">
                    ✓ {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Care Instructions */}
        {passport.careInstructions && (
          <div className="card mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Care Instructions</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {passport.careInstructions}
              </p>
            </div>
          </div>
        )}

        {/* Ownership History */}
        {ownership.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-serif font-bold mb-6">Ownership History</h2>
            <div className="space-y-4">
              {ownership.map((record, index) => (
                <div key={record.id} className="flex items-start gap-4 pb-4 border-b border-neutral-200 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-brand-dark-wood text-white flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Ownership transfer {record.transferType ? `(${record.transferType})` : ""}</div>
                    <div className="text-sm text-neutral-600">
                      {new Date(record.transferDate).toLocaleDateString()}
                    </div>
                    {record.transferPrice && (
                      <p className="text-sm text-neutral-700 mt-1">Price: ${record.transferPrice}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service History */}
        {services.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-serif font-bold mb-6">Service History</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="border-l-4 border-brand-metallic pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium capitalize">{service.serviceType}</span>
                    <span className="text-sm text-neutral-600">
                      {new Date(service.serviceDate).toLocaleDateString()}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-neutral-700">{service.description}</p>
                  )}
                  {service.cost && (
                    <p className="text-sm text-neutral-600 mt-1">Cost: ${service.cost}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resale Info */}
        <div className="card bg-neutral-100">
          <div className="flex items-start gap-4">
            <div className="text-3xl">♻️</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Resale & Trade-In</h3>
              {passport.resaleEligible ? (
                <p className="text-neutral-700 mb-4">
                  This product is eligible for our trade-in program. Contact us to get a valuation
                  and apply credit toward your next purchase.
                </p>
              ) : (
                <p className="text-neutral-700 mb-4">
                  This product is not currently eligible for trade-in.
                </p>
              )}
              {passport.resaleEligible && (
                <Link href="/trade-in" className="btn btn-secondary">
                  Start Trade-In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
