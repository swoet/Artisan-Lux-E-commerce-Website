"use client";
import { FormEvent, useState, useEffect } from "react";
import AnimatedAvatar from "@/components/AnimatedAvatar";
import { isAuthenticated } from "@/lib/auth";

export default function SignInPage() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = "/";
    }
  }, []);

  async function onEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/public/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.requiresVerification) {
        setMessage("Check your email for the verification code!");
        setStep("code");
      }
    } else {
      const data = await res.json().catch(()=>({}));
      setMessage(data.error || "Failed to sign in");
    }
    setLoading(false);
  }

  async function onCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/public/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    if (res.ok) {
      setMessage("Verified! Redirecting...");
      setTimeout(() => {
        // Force a full page reload to ensure cookie is read
        window.location.replace("/");
      }, 1000);
    } else {
      const data = await res.json().catch(()=>({}));
      setMessage(data.error || "Invalid code");
    }
    setLoading(false);
  }

  async function handleResendCode() {
    setResending(true);
    setMessage(null);
    const res = await fetch("/api/public/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "signin" })
    });
    if (res.ok) {
      setMessage("New code sent! Check your email.");
    } else {
      const data = await res.json().catch(()=>({}));
      setMessage(data.error || "Failed to resend code");
    }
    setResending(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-100 grid place-items-center p-6 md:p-10">
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-white/10 to-white/0 blur-3xl" />
      <div className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="hidden md:flex items-center justify-center p-10 bg-gradient-to-b from-white/10 to-transparent border-r border-white/10">
          <div className="text-center space-y-6">
            <AnimatedAvatar size={180} />
            <div className="space-y-2">
              <h2 className="text-2xl font-serif tracking-tight">Welcome back</h2>
              <p className="text-sm text-neutral-300">Sign in to continue discovering curated pieces.</p>
            </div>
          </div>
        </div>
        {step === "email" ? (
          <form onSubmit={onEmailSubmit} className="p-8 md:p-10 space-y-6 max-w-md w-full m-auto">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif tracking-tight">Sign in</h1>
            <p className="text-sm text-neutral-300">Enter your email to continue.</p>
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
            {loading?"Signing in...":"Sign in"}
          </button>
          {message && <p className="text-sm text-neutral-300">{message}</p>}
          <p className="text-xs text-neutral-400">New here? <a className="underline hover:text-neutral-200" href="/signup">Create an account</a></p>
        </form>
        ) : (
          <form onSubmit={onCodeSubmit} className="p-8 md:p-10 space-y-6 max-w-md w-full m-auto">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); setMessage(null); }}
                className="text-sm text-neutral-300 hover:text-white flex items-center gap-1 mb-4"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-serif tracking-tight">Enter Code</h1>
              <p className="text-sm text-neutral-300">We sent a 6-digit code to <strong>{email}</strong></p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-neutral-200">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-center text-2xl tracking-widest font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 transition"
                value={code}
                onChange={e=>setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
              />
            </div>
            <button
              disabled={loading || code.length !== 6}
              className="w-full inline-flex items-center justify-center rounded-lg bg-black px-4 py-3 font-medium text-white ring-1 ring-white/10 transition hover:bg-neutral-900 disabled:opacity-60"
            >
              {loading?"Verifying...":"Verify & Continue"}
            </button>
            {message && <p className={`text-sm ${message.includes("Verified") || message.includes("sent") ? "text-green-400" : "text-red-400"}`}>{message}</p>}
            <div className="space-y-2">
              <p className="text-xs text-neutral-400 text-center">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="underline hover:text-neutral-200 transition-colors disabled:opacity-60"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </p>
              <p className="text-xs text-neutral-400 text-center">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => { setStep("email"); setCode(""); setMessage(null); }}
                  className="underline hover:text-neutral-200 transition-colors"
                >
                  Go back
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
