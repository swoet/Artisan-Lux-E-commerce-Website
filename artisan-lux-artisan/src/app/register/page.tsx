"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          studioName,
          specialties,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Move to verification step
      setStep("verify");
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      // Redirect to login
      router.push("/login?verified=true");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend code");
        setLoading(false);
        return;
      }

      alert("Verification code sent! Check your email.");
      setLoading(false);
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
            {step === "register" ? "🏺 Join Artisan Lux" : "📧 Verify Your Email"}
          </h1>
          <p className="text-neutral-400">
            {step === "register"
              ? "Create your artisan account"
              : "Enter the code we sent to your email"}
          </p>
        </div>

        <div className="card">
          {step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4" suppressHydrationWarning>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email Address *
                </label>
                <input
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
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Studio Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="input"
                  placeholder="Your Studio Name"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Specialties
                </label>
                <input
                  type="text"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="input"
                  placeholder="Jewelry, Ceramics, Woodwork"
                  disabled={loading}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Separate multiple specialties with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
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
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4" suppressHydrationWarning>
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-blue-900/30 border border-blue-700/50 text-blue-300 px-4 py-3 rounded-lg text-sm">
                We sent a 6-digit code to <strong>{email}</strong>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className="input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="btn btn-primary w-full justify-center"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              <button
                type="button"
                onClick={resendCode}
                disabled={loading}
                className="btn btn-secondary w-full justify-center"
              >
                Resend Code
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-neutral-400">
            {step === "register" ? (
              <p>
                Already have an account?{" "}
                <Link href="/login" className="text-brand-metallic hover:text-brand-copper hover:underline font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            ) : (
              <button
                onClick={() => setStep("register")}
                className="text-brand-metallic hover:text-brand-copper hover:underline transition-colors"
              >
                ← Back to Registration
              </button>
            )}
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
