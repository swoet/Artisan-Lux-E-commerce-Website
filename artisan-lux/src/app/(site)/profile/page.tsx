"use client";
import { useEffect, useState } from "react";
import { isAuthenticated, getCustomerEmail, getCustomerName, logout } from "@/lib/auth";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      window.location.href = "/signin";
      return;
    }

    // Get user info
    const userEmail = getCustomerEmail();
    const userName = getCustomerName();
    setEmail(userEmail);
    setName(userName);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <a href="/">
          <h1 className="text-2xl font-serif tracking-wide bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent cursor-pointer">
            Artisan Lux
          </h1>
        </a>
        <a href="/" className="text-sm hover:text-[#cd7f32] transition-colors">
          ← Back to Home
        </a>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="font-serif text-5xl font-bold mb-2 bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-neutral-400 mb-12">Manage your account information</p>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-neutral-400">Name</label>
              <p className="text-lg">{name || "Not provided"}</p>
            </div>
            
            <div>
              <label className="text-sm text-neutral-400">Email</label>
              <p className="text-lg">{email}</p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-green-400 mb-2">✅ You are logged in!</p>
              <p className="text-xs text-neutral-400">
                Your session is active. You won't need to verify your email again until you log out.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 rounded-lg transition"
            >
              Log Out
            </button>
            <a
              href="/orders"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              View Orders
            </a>
            <a
              href="/wishlist"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              My Wishlist
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
