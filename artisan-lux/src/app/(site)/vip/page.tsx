import { db } from "@/db";
import { vipTiers } from "@/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";

export const metadata = {
  title: "VIP Membership | Artisan Lux",
  description: "Exclusive benefits and privileges for our most valued customers",
};

export default async function VIPPage() {
  // Fetch all VIP tiers; benefits are stored on the tier as an array
  const tiers = await db
    .select()
    .from(vipTiers)
    .orderBy(asc(vipTiers.priority));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark-wood to-brand-metallic text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            VIP Membership
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Unlock exclusive benefits, early access, and personalized service
          </p>
        </div>
      </div>

      {/* Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => {
            const isPopular = index === 1; // Middle tier is popular
            
            return (
              <div
                key={tier.id}
                className={`card relative ${
                  isPopular ? "ring-2 ring-brand-metallic transform scale-105" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand-metallic text-white text-sm px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                {/* Tier Header */}
                <div className="text-center mb-6 pb-6 border-b border-neutral-200">
                  <h3 className="text-2xl font-serif font-bold mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-brand-dark-wood mb-2">
                    ${Number(tier.minSpend || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-600">annual spend</div>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {(tier.benefits || []).map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="text-green-600 mt-1">✓</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{benefit}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href="/account/vip"
                  className={`btn w-full justify-center ${
                    isPopular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  Learn More
                </Link>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-serif font-bold mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-neutral-700">
              <p>
                <strong>Automatic Enrollment:</strong> Your VIP tier is automatically determined by your annual spending.
              </p>
              <p>
                <strong>Year-Round Benefits:</strong> Enjoy your tier benefits for 12 months from qualification.
              </p>
              <p>
                <strong>Tier Upgrades:</strong> Move up tiers as your spending increases throughout the year.
              </p>
              <p>
                <strong>Renewal:</strong> Maintain your tier by meeting the annual spend threshold each year.
              </p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <h3 className="text-xl font-serif font-bold mb-4">VIP Perks Include</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>🎁</span>
                <span>Exclusive gifts and surprises</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Early access to new collections</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>Personal concierge service</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎨</span>
                <span>Private artisan events</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚚</span>
                <span>Complimentary shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span>Priority customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
