import { db } from "@/db";
import { artisans } from "@/db/schema";
import { eq } from "drizzle-orm";
import CustomOrderRequestForm from "@/components/site/CustomOrderRequestForm";

export const metadata = {
  title: "Request Custom Order | Artisan Lux",
  description: "Commission a unique piece from our talented artisans",
};

export default async function CustomOrderPage() {
  // Fetch all active artisans
  const activeArtisans = await db
    .select()
    .from(artisans)
    .where(eq(artisans.status, "active"));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Commission a Custom Piece
          </h1>
          <p className="text-xl opacity-90">
            Work directly with our artisans to create something truly unique
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-dark-wood text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                1
              </div>
              <h3 className="font-bold mb-2">Submit Request</h3>
              <p className="text-sm text-neutral-600">
                Describe your vision and select an artisan
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-dark-wood text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                2
              </div>
              <h3 className="font-bold mb-2">Receive Quote</h3>
              <p className="text-sm text-neutral-600">
                Artisan reviews and provides pricing
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-dark-wood text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                3
              </div>
              <h3 className="font-bold mb-2">Track Progress</h3>
              <p className="text-sm text-neutral-600">
                Get updates throughout production
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-dark-wood text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                4
              </div>
              <h3 className="font-bold mb-2">Receive Piece</h3>
              <p className="text-sm text-neutral-600">
                Your unique creation arrives
              </p>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <CustomOrderRequestForm artisans={activeArtisans} />
      </div>
    </div>
  );
}
