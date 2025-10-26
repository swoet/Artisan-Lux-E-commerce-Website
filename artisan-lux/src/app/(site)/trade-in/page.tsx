import TradeInForm from "@/components/site/TradeInForm";

export const metadata = {
  title: "Trade-In Program | Artisan Lux",
  description: "Trade in your pre-loved pieces for credit toward new purchases",
};

export default function TradeInPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Trade-In Program
          </h1>
          <p className="text-xl opacity-90">
            Give your pre-loved pieces a new life and earn credit
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* How It Works */}
        <div className="card mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-dark-wood text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                1
              </div>
              <h3 className="font-bold mb-2">Submit Item</h3>
              <p className="text-sm text-neutral-600">
                Tell us about your piece and upload photos
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-dark-wood text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                2
              </div>
              <h3 className="font-bold mb-2">Get Valuation</h3>
              <p className="text-sm text-neutral-600">
                Receive an offer within 2-3 business days
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-dark-wood text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                3
              </div>
              <h3 className="font-bold mb-2">Ship Item</h3>
              <p className="text-sm text-neutral-600">
                Accept offer and send with prepaid label
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-dark-wood text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                4
              </div>
              <h3 className="font-bold mb-2">Get Credit</h3>
              <p className="text-sm text-neutral-600">
                Receive store credit for your next purchase
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="font-bold text-lg mb-3">Why Trade In?</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Get up to 50% of original value</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Sustainable & eco-friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Free shipping with prepaid label</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Credit never expires</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-lg mb-3">Eligible Items</h3>
            <div className="space-y-2 text-sm text-neutral-700">
              <p>✓ Artisan Lux products with provenance passport</p>
              <p>✓ Items in good to excellent condition</p>
              <p>✓ Original packaging preferred (not required)</p>
              <p>✓ Purchased within the last 5 years</p>
            </div>
          </div>
        </div>

        {/* Trade-In Form */}
        <TradeInForm />
      </div>
    </div>
  );
}
