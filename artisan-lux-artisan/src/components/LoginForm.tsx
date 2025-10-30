"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const verified = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (verified === "true") {
      setSuccess("Email verified! Your account is under review. You can log in once it's activated.");
    }
  }, [verified]);

  const handleResendVerification = async () => {
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
        setSuccess("Verification code sent! Check your email.");
        setShowResendVerification(false);
        // Redirect to verify page
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || "Login failed";
        setError(errorMsg);
        
        // Show resend verification option if email not verified
        if (errorMsg.toLowerCase().includes("verify your email")) {
          setShowResendVerification(true);
        }
        
        setLoading(false);
        return;
      }

      // Redirect to dashboard or original destination
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" suppressHydrationWarning>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-brand-metallic to-brand-copper bg-clip-text text-transparent mb-2">
            🏺 Artisan Portal
          </h1>
          <p className="text-neutral-400">Sign in to manage your studio</p>
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
                <p>{error}</p>
                {showResendVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="mt-3 text-sm underline hover:text-red-200 transition-colors disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend verification code"}
                  </button>
                )}
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
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-400">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-brand-metallic hover:text-brand-copper hover:underline font-medium transition-colors">
                Register as Artisan
              </Link>
            </p>
          </div>
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
