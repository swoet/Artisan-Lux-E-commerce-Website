import CareBookingForm from "@/components/site/CareBookingForm";

export const metadata = {
  title: "Care & Repair Services | Artisan Lux",
  description: "Professional care and repair services for your Artisan Lux pieces",
};

export default function CarePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Care & Repair Services
          </h1>
          <p className="text-xl opacity-90">
            Expert maintenance to keep your pieces looking their best
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="font-bold text-lg mb-2">Cleaning & Polishing</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Professional cleaning to restore original luster
            </p>
            <div className="text-brand-dark-wood font-bold">From $50</div>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">🔧</div>
            <h3 className="font-bold text-lg mb-2">Repairs & Restoration</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Expert repairs by skilled artisans
            </p>
            <div className="text-brand-dark-wood font-bold">Custom Quote</div>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-bold text-lg mb-2">Protective Treatment</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Seal and protect against wear
            </p>
            <div className="text-brand-dark-wood font-bold">From $75</div>
          </div>
        </div>

        {/* Why Choose Our Care Services */}
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-8">
          <h3 className="font-bold text-lg mb-4">Why Choose Our Care Services?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span>Serviced by original artisans when possible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span>Authentic materials and techniques</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span>Free shipping both ways</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span>30-day satisfaction guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span>Documented in provenance passport</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span>Extends product warranty</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <CareBookingForm />
      </div>
    </div>
  );
}
