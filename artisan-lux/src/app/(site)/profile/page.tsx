"use client";
import { useEffect, useState } from "react";
import { isAuthenticated, getCustomerEmail, logout } from "@/lib/auth";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      window.location.href = "/signin";
      return;
    }

    // Get user email
    const userEmail = getCustomerEmail();
    setEmail(userEmail);
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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-6">
          <h1 className="text-3xl font-serif tracking-tight">Profile</h1>
          
          <div className="space-y-4">
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
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Log Out
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
