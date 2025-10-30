"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      setSuccess("Email verified! Redirecting to login...");
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("New verification code sent! Check your email.");
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" suppressHydrationWarning>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-brand-metallic to-brand-copper bg-clip-text text-transparent mb-2">
            🔐 Verify Your Email
          </h1>
          <p className="text-neutral-400">Enter the code we sent to your email</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-900/30 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="artisan@example.com"
                disabled={loading || !!emailParam}
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-neutral-300 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength={6}
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-neutral-500 mt-2">
                Enter the 6-digit code from your email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="btn btn-primary w-full justify-center"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending || !email}
                className="text-sm text-brand-metallic hover:text-brand-copper hover:underline transition-colors disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend verification code"}
              </button>

              <p className="text-sm text-neutral-400">
                <Link href="/login" className="text-brand-metallic hover:text-brand-copper hover:underline transition-colors">
                  ← Back to login
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-neutral-500">
          <a href={process.env.NEXT_PUBLIC_SITE_URL} className="hover:text-brand-metallic transition-colors">
            ← Back to Artisan Lux
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
