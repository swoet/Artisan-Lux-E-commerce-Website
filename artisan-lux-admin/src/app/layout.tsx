import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const serif = Playfair_Display({ variable: "--font-serif", subsets: ["latin"], display: "swap" });
const sans = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Artisan Lux Admin",
  description: "Manage your luxury e-commerce platform.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="antialiased min-h-screen text-[var(--color-fg)] bg-gradient-to-b from-[#2a1a10] to-[#1a0f08]">
        <header className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur border-b border-[var(--color-border)] ring-1 ring-black/10">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Artisan Lux Admin</Link>
            <nav className="flex items-center gap-4 text-sm text-[var(--color-fg)]/80">
              <Link href="/" className="hover:text-[var(--brand-to)] transition-colors">Dashboard</Link>
              <Link href="/catalog" className="hover:text-[var(--brand-to)] transition-colors">Catalog</Link>
              <Link href="/users" className="hover:text-[var(--brand-to)] transition-colors">Users</Link>
              <Link href="/analytics" className="hover:text-[var(--brand-to)] transition-colors">Analytics</Link>
              <Link href="/admins" className="hover:text-[var(--brand-to)] transition-colors">Admins</Link>
              <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="hover:text-[var(--brand-to)] transition-colors">View Site</a>
              <form action="/api/admin/logout" method="post">
                <button className="btn-outline px-3 py-1.5" type="submit">Sign out</button>
              </form>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
        <script src="/analytics.js" async />
      </body>
    </html>
  );
}
