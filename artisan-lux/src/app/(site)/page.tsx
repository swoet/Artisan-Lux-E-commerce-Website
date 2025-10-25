import Link from "next/link";
import CategoryGrid from "@/components/site/CategoryGrid";
import Testimonials from "@/components/site/Testimonials";
import UserMenu from "@/components/site/UserMenu";
import CartIcon from "@/components/site/CartIcon";

// Disable static optimization
export const revalidate = 0;

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/">
          <h1 className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent cursor-pointer">
            Artisan Lux
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <CartIcon />
          <UserMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center space-y-8">
          <h2 className="text-6xl md:text-8xl font-serif leading-tight">
            Shop
            <br />
            <span className="bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
              Curated Luxury
            </span>
          </h2>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Handcrafted pieces from independent artisans. Limited runs, authentic materials, delivered with care.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link
              href="/categories"
              className="px-8 py-4 bg-gradient-to-r from-[#b87333] to-[#cd7f32] rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#b87333]/20"
            >
              Shop New Arrivals
            </Link>
            <Link
              href="/categories"
              className="px-8 py-4 border border-[#cd7f32] rounded-lg font-semibold hover:bg-[#cd7f32]/10 transition-colors"
            >
              Explore Categories
            </Link>
          </div>
        </div>

        {/* Categories - pre-ad & quick links */}
        <CategoryGrid />

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="p-8 border border-white/10 rounded-lg backdrop-blur-sm bg-white/5 hover:border-[#cd7f32]/50 transition-colors">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-serif mb-3 text-[#cd7f32]">Curated Excellence</h3>
            <p className="text-neutral-400 leading-relaxed">
              Every piece is handpicked for its exceptional quality and unique character.
            </p>
          </div>
          <div className="p-8 border border-white/10 rounded-lg backdrop-blur-sm bg-white/5 hover:border-[#cd7f32]/50 transition-colors">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-serif mb-3 text-[#cd7f32]">Immersive Experience</h3>
            <p className="text-neutral-400 leading-relaxed">
              Explore products in 3D, with animations that reveal the craftsmanship behind each item.
            </p>
          </div>
          <div className="p-8 border border-white/10 rounded-lg backdrop-blur-sm bg-white/5 hover:border-[#cd7f32]/50 transition-colors">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-serif mb-3 text-[#cd7f32]">Real-Time Updates</h3>
            <p className="text-neutral-400 leading-relaxed">
              Live catalog managed by our admin team, with instant updates across the platform.
            </p>
          </div>
        </div>

        {/* Testimonials */}
        <Testimonials />
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t border-white/10 p-6 text-center text-sm text-neutral-500">
        <p>© 2025 Artisan Lux. Crafted with passion and precision.</p>
      </footer>
    </div>
  );
}
