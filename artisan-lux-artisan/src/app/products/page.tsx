import { requireArtisanAuth } from "@/lib/auth";
import { db } from "@/db";
import { products, productArtisans, categories, provenancePassports, inventory, mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export default async function ProductsPage() {
  const artisan = await requireArtisanAuth();

  // Fetch artisan's products with categories, passports, inventory, and cover images
  const artisanProducts = await db
    .select({
      product: products,
      category: categories,
      passport: provenancePassports,
      inventory: inventory,
      coverImage: mediaAssets,
    })
    .from(products)
    .innerJoin(productArtisans, eq(products.id, productArtisans.productId))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(provenancePassports, eq(products.id, provenancePassports.productId))
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .leftJoin(mediaAssets, eq(products.coverImageId, mediaAssets.id))
    .where(eq(productArtisans.artisanId, artisan.id));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-dark-wood">
                My Products
              </h1>
              <p className="text-sm text-neutral-400">Manage your product catalog</p>
            </div>
            <Link href="/products/new" className="btn btn-primary">
              + Create Product
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Dashboard
            </Link>
            <Link href="/products" className="py-4 border-b-2 border-brand-dark-wood font-medium text-brand-dark-wood">
              Products
            </Link>
            <Link href="/orders" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Orders
            </Link>
            <Link href="/custom-orders" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Custom Orders
            </Link>
            <Link href="/analytics" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Analytics
            </Link>
            <Link href="/profile" className="py-4 border-b-2 border-transparent hover:border-neutral-600 text-neutral-300 hover:text-neutral-100">
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {artisanProducts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-serif font-bold mb-2">No Products Yet</h2>
            <p className="text-neutral-400 mb-6">
              Create your first product to start selling on Artisan Lux
            </p>
            <Link href="/products/new" className="btn btn-primary">
              Create Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisanProducts.map(({ product, category, passport, inventory: inv, coverImage }) => (
              <div key={product.id} className="card hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative w-full h-48 bg-[var(--color-card)] rounded-lg mb-4 overflow-hidden">
                  {coverImage?.url ? (
                    <Image
                      src={coverImage.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-400">
                      No Image
                    </div>
                  )}
                  {passport && (
                    <div className="absolute top-2 right-2 bg-brand-dark-wood text-white text-xs px-2 py-1 rounded">
                      🏺 Passport
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <h3 className="font-serif font-bold text-lg mb-1">{product.title}</h3>
                <p className="text-sm text-neutral-400 mb-2">{category?.name || "Uncategorized"}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-brand-dark-wood">
                    ${parseFloat(product.priceDecimal).toFixed(2)}
                  </div>
                  <div className="text-sm text-neutral-400">
                    Stock: {inv?.quantityInStock || 0}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`badge ${
                    product.status === "active" ? "badge-success" :
                    product.status === "draft" ? "badge-warning" :
                    "badge-error"
                  }`}>
                    {product.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link 
                    href={`/products/${product.id}/edit`}
                    className="btn btn-secondary flex-1 justify-center text-sm py-2"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`}
                    target="_blank"
                    className="btn btn-secondary flex-1 justify-center text-sm py-2"
                  >
                    View Live
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
