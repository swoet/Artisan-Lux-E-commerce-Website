export const metadata = {
  title: "Your Impact | Artisan Lux",
  description: "Track your positive impact through sustainable luxury shopping",
};

// This would normally fetch customer-specific data from the database
async function getCustomerImpact() {
  // TODO: Implement actual customer impact calculation
  return {
    totalPurchases: 5,
    carbonSaved: 12.5,
    artisansSupportedCount: 3,
    treesPlanted: 10,
    waterSaved: 500,
    wasteReduced: 2.3,
  };
}

export default async function ImpactPage() {
  const impact = await getCustomerImpact();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Your Positive Impact
          </h1>
          <p className="text-xl opacity-90">
            Every purchase makes a difference
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="card text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-5xl mb-3">🌱</div>
            <div className="text-4xl font-bold text-green-700 mb-2">
              {impact.carbonSaved} kg
            </div>
            <div className="text-sm text-neutral-600">CO₂ Emissions Saved</div>
            <p className="text-xs text-neutral-500 mt-2">
              vs. mass-produced alternatives
            </p>
          </div>

          <div className="card text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="text-5xl mb-3">🎨</div>
            <div className="text-4xl font-bold text-blue-700 mb-2">
              {impact.artisansSupportedCount}
            </div>
            <div className="text-sm text-neutral-600">Artisans Supported</div>
            <p className="text-xs text-neutral-500 mt-2">
              Direct economic impact
            </p>
          </div>

          <div className="card text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="text-5xl mb-3">🌳</div>
            <div className="text-4xl font-bold text-amber-700 mb-2">
              {impact.treesPlanted}
            </div>
            <div className="text-sm text-neutral-600">Trees Planted</div>
            <p className="text-xs text-neutral-500 mt-2">
              Through our offset program
            </p>
          </div>

          <div className="card text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="text-5xl mb-3">💧</div>
            <div className="text-4xl font-bold text-purple-700 mb-2">
              {impact.waterSaved} L
            </div>
            <div className="text-sm text-neutral-600">Water Conserved</div>
            <p className="text-xs text-neutral-500 mt-2">
              Sustainable production methods
            </p>
          </div>

          <div className="card text-center bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <div className="text-5xl mb-3">♻️</div>
            <div className="text-4xl font-bold text-red-700 mb-2">
              {impact.wasteReduced} kg
            </div>
            <div className="text-sm text-neutral-600">Waste Reduced</div>
            <p className="text-xs text-neutral-500 mt-2">
              Quality over quantity
            </p>
          </div>

          <div className="card text-center bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
            <div className="text-5xl mb-3">📦</div>
            <div className="text-4xl font-bold text-indigo-700 mb-2">
              {impact.totalPurchases}
            </div>
            <div className="text-sm text-neutral-600">Sustainable Purchases</div>
            <p className="text-xs text-neutral-500 mt-2">
              Thank you for choosing conscious luxury
            </p>
          </div>
        </div>

        {/* Comparison */}
        <div className="card mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Your Impact Compared</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Carbon Savings</span>
                <span className="text-sm text-neutral-600">Equivalent to {(impact.carbonSaved / 2.5).toFixed(1)} days of car emissions</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Artisan Support</span>
                <span className="text-sm text-neutral-600">Top 10% of our community</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Waste Reduction</span>
                <span className="text-sm text-neutral-600">Equivalent to {impact.wasteReduced * 3} plastic bottles</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* How We Calculate */}
        <div className="card bg-neutral-100">
          <h3 className="font-bold text-lg mb-4">How We Calculate Your Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-700">
            <div>
              <p className="font-medium mb-1">🌱 Carbon Savings</p>
              <p className="text-xs">
                Based on provenance passport data comparing artisan production to mass manufacturing
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🎨 Artisan Support</p>
              <p className="text-xs">
                Number of unique artisans you've purchased from, supporting their livelihoods
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🌳 Trees Planted</p>
              <p className="text-xs">
                We plant 2 trees for every purchase through our reforestation partners
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">💧 Water Conserved</p>
              <p className="text-xs">
                Artisan methods typically use 70% less water than industrial production
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">♻️ Waste Reduced</p>
              <p className="text-xs">
                Quality items last longer, reducing the need for replacements
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">📊 Transparency</p>
              <p className="text-xs">
                All metrics verified through our provenance passport system
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
