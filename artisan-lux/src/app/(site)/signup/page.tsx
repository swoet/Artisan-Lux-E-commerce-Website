"use client";
import { FormEvent, useState } from "react";
import AnimatedAvatar from "@/components/AnimatedAvatar";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/public/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name })
    });
    if (res.ok) {
      setMessage("Welcome aboard! You're all set.");
      setName("");
      setEmail("");
    } else {
      const data = await res.json().catch(()=>({}));
      setMessage(data.error || "Failed to sign up");
    }
    setLoading(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-100 grid place-items-center p-6 md:p-10">
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-white/10 to-white/0 blur-3xl" />
      <div className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="hidden md:flex items-center justify-center p-10 bg-gradient-to-b from-white/10 to-transparent border-r border-white/10">
          <div className="text-center space-y-6">
            <AnimatedAvatar size={180} />
            <div className="space-y-2">
              <h2 className="text-2xl font-serif tracking-tight">Join the community</h2>
              <p className="text-sm text-neutral-300">Create your account to save favorites and track orders.</p>
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit} className="p-8 md:p-10 space-y-6 max-w-md w-full m-auto">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif tracking-tight">Create your account</h1>
            <p className="text-sm text-neutral-300">It just takes a moment.</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-neutral-200">Name (optional)</label>
            <input
              type="text"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 transition"
              value={name}
              onChange={e=>setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-neutral-200">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 transition"
              value={email}
              onChange={e=>setEmail(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-black px-4 py-3 font-medium text-white ring-1 ring-white/10 transition hover:bg-neutral-900 disabled:opacity-60"
          >
            {loading?"Signing up...":"Sign up"}
          </button>
          {message && <p className="text-sm text-neutral-300">{message}</p>}
          <p className="text-xs text-neutral-400">Already have an account? <a className="underline hover:text-neutral-200" href="/signin">Sign in</a></p>
        </form>
      </div>
    </main>
  );
}
