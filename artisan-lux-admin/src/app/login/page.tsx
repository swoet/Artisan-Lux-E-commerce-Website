"use client";
import { useState } from "react";
import AnimatedAvatar from "@/components/AnimatedAvatar";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      window.location.href = "/";
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-fg)] grid place-items-center p-6 md:p-10">
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--brand-from)]/20 to-transparent blur-3xl" />
      <div className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-card)]/90 backdrop-blur-xl shadow-2xl">
        <div className="hidden md:flex items-center justify-center p-10 bg-gradient-to-b from-[var(--brand-from)]/10 to-transparent border-r border-[var(--color-border)]/60">
          <div className="text-center space-y-6">
            <AnimatedAvatar size={180} />
            <div className="space-y-2">
              <h2 className="text-2xl font-serif tracking-tight bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Admin Portal</h2>
              <p className="text-sm text-neutral-300">Secure sign in for administrators.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleLogin} className="p-8 md:p-10 space-y-6 max-w-md w-full m-auto">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif tracking-tight bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Admin Sign in</h1>
            <p className="text-sm text-neutral-300">Use your administrator credentials.</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Email</label>
            <input
              className="input px-4 py-3"
              type="email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Password</label>
            <input
              className="input px-4 py-3"
              type="password"
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>
          <p className="text-xs text-neutral-400">Tip: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env, then sign in once to create your super admin.</p>
          <button
            type="submit"
            disabled={loading}
            className="btn w-full px-4 py-3"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
