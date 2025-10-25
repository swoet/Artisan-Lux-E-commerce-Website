import Link from "next/link";
import CartTable from "@/components/site/CartTable";

export const metadata = {
  title: "Your Cart | Artisan Lux",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">Artisan Lux</Link>
        <div className="flex gap-6 text-sm">
          <Link href="/categories" className="hover:text-[#cd7f32] transition-colors">Categories</Link>
          <Link href="/wishlist" className="hover:text-[#cd7f32] transition-colors">Wishlist</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-5xl md:text-6xl font-serif mb-8">Your Cart</h1>
        <CartTable />
      </main>

      <footer className="mt-32 border-t border-white/10 p-6 text-center text-sm text-neutral-500">
        <p>© 2025 Artisan Lux. Crafted with passion and precision.</p>
      </footer>
    </div>
  );
}
