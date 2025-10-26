import UGCUploadForm from "@/components/site/UGCUploadForm";

export const metadata = {
  title: "Upload Photo | Artisan Lux Gallery",
  description: "Share your Artisan Lux style and earn rewards",
};

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Share Your Style
          </h1>
          <p className="text-xl opacity-90">
            Upload photos of your Artisan Lux pieces and earn reward points
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Rewards Info */}
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-8">
          <h3 className="font-bold text-lg mb-3">Earn Rewards</h3>
          <div className="space-y-2 text-sm text-neutral-700">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>50 points</strong> for approved photos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>100 bonus points</strong> if featured on our homepage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Points can be redeemed for discounts on future purchases</span>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <UGCUploadForm />
      </div>
    </div>
  );
}
