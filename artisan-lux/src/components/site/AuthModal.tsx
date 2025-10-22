"use client";

import { FormEvent, useState } from "react";
import AnimatedAvatar from "@/components/AnimatedAvatar";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const endpoint = mode === "signup" ? "/api/public/register" : "/api/public/login";
    const body = mode === "signup" ? { email, name } : { email };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.requiresVerification) {
        setMessage("Check your email for the verification code!");
        setStep("code");
      }
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Failed to authenticate");
    }
    setLoading(false);
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/public/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (res.ok) {
      setMessage("Verified! Logging you in...");
      setTimeout(() => {
        onSuccess();
        onClose();
        // Force page reload to ensure cookie is read
        window.location.reload();
      }, 800);
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Invalid code");
    }
    setLoading(false);
  }

  function resetForm() {
    setEmail("");
    setName("");
    setCode("");
    setStep("email");
    setMessage(null);
  }

  function switchMode() {
    resetForm();
    setMode(mode === "signin" ? "signup" : "signin");
  }

  function goBackToEmail() {
    setCode("");
    setStep("email");
    setMessage(null);
  }

  async function handleResendCode() {
    setResending(true);
    setMessage(null);

    const res = await fetch("/api/public/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: mode }),
    });

    if (res.ok) {
      setMessage("New code sent! Check your email.");
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Failed to resend code");
    }
    setResending(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl grid md:grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left side - Avatar & Info */}
        <div className="hidden md:flex items-center justify-center p-10 bg-gradient-to-b from-white/10 to-transparent border-r border-white/10">
          <div className="text-center space-y-6">
            <AnimatedAvatar size={150} />
            <div className="space-y-2">
              <h2 className="text-2xl font-serif tracking-tight text-white">
                {mode === "signup" ? "Join Artisan Lux" : "Welcome Back"}
              </h2>
              <p className="text-sm text-neutral-300">
                {mode === "signup"
                  ? "Create an account to purchase luxury artisan goods"
                  : "Sign in to continue your shopping"}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="p-8 md:p-10">
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6 max-w-md w-full m-auto">
            <div className="space-y-1">
              <h1 className="text-3xl font-serif tracking-tight text-white">
                {mode === "signup" ? "Create Account" : "Sign In"}
              </h1>
              <p className="text-sm text-neutral-300">
                {mode === "signup" ? "Get started in seconds" : "Welcome back to Artisan Lux"}
              </p>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <label className="block text-sm text-neutral-200">Name (optional)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#cd7f32] focus:border-[#cd7f32] transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm text-neutral-200">Email *</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#cd7f32] focus:border-[#cd7f32] transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <button
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#b87333] to-[#cd7f32] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
            </button>

            {message && (
              <p className={`text-sm ${message.includes("Success") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}

            <p className="text-xs text-neutral-400 text-center">
              {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="underline hover:text-neutral-200 transition-colors"
              >
                {mode === "signup" ? "Sign in" : "Sign up"}
              </button>
            </p>
          </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-6 max-w-md w-full m-auto">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={goBackToEmail}
                  className="text-sm text-neutral-400 hover:text-white flex items-center gap-1 mb-4"
                >
                  ← Back
                </button>
                <h1 className="text-3xl font-serif tracking-tight text-white">Enter Code</h1>
                <p className="text-sm text-neutral-300">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-neutral-200">Verification Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-center text-2xl tracking-widest font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#cd7f32] focus:border-[#cd7f32] transition"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <button
                disabled={loading || code.length !== 6}
                className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#b87333] to-[#cd7f32] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              {message && (
                <p className={`text-sm ${ message.includes("Verified") || message.includes("sent") ? "text-green-400" : "text-red-400"}`}>
                  {message}
                </p>
              )}

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
                    onClick={goBackToEmail}
                    className="underline hover:text-neutral-200 transition-colors"
                  >
                    Go back
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
