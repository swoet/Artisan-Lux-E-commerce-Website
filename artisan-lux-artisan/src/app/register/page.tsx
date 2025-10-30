"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters");
      return;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError("Password must contain uppercase, lowercase, numbers, and special characters");
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

      // Show success message and redirect to login
      setSuccess(data.message || "Account created successfully! Redirecting to login...");
      setLoading(false);
      
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 3000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: "" };
    let strength = 0;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return { strength, label: labels[strength - 1] || "" };
  };

  const passwordStrength = getPasswordStrength();

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
            🏺 Join Artisan Lux
          </h1>
          <p className="text-neutral-400">
            Create your artisan account with secure encryption
          </p>
        </div>

        <div className="card">
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={12}
                    className="input pr-10"
                    placeholder="••••••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i <= passwordStrength.strength
                              ? passwordStrength.strength <= 2
                                ? "bg-red-500"
                                : passwordStrength.strength === 3
                                ? "bg-yellow-500"
                                : passwordStrength.strength === 4
                                ? "bg-blue-500"
                                : "bg-green-500"
                              : "bg-neutral-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-400">{passwordStrength.label}</p>
                  </div>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                  Min 12 chars with uppercase, lowercase, numbers & symbols
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={12}
                  className="input"
                  placeholder="••••••••••••"
                  disabled={loading}
                />
              </div>

              {success && (
                <div className="bg-green-900/30 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

          <div className="mt-6 text-center text-sm text-neutral-400">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-brand-metallic hover:text-brand-copper hover:underline font-medium transition-colors">
                Sign In
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
