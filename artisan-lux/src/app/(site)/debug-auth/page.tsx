"use client";
import { useEffect, useState } from "react";
import { isAuthenticated, getCustomerEmail } from "@/lib/auth";

export default function DebugAuthPage() {
  const [cookies, setCookies] = useState<string>("");
  const [isAuth, setIsAuth] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie);
    
    // Check auth status
    setIsAuth(isAuthenticated());
    setEmail(getCustomerEmail());
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-6">
          <h1 className="text-3xl font-serif tracking-tight">Auth Debug Page</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
              <p className={`text-lg ${isAuth ? "text-green-400" : "text-red-400"}`}>
                {isAuth ? "✅ Authenticated" : "❌ Not Authenticated"}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Customer Email</h2>
              <p className="text-lg">
                {email || "No email found"}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">All Cookies</h2>
              <div className="bg-black/50 p-4 rounded-lg">
                {cookies ? (
                  <pre className="text-xs whitespace-pre-wrap break-all">
                    {cookies.split(';').map((cookie, i) => (
                      <div key={i} className="mb-1">
                        {cookie.trim()}
                      </div>
                    ))}
                  </pre>
                ) : (
                  <p className="text-neutral-400">No cookies found</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Expected Cookies</h2>
              <ul className="space-y-1 text-sm text-neutral-300">
                <li>• <code className="text-green-400">customer_session</code> - httpOnly (not visible here)</li>
                <li>• <code className="text-green-400">customer_auth</code> - should be "true"</li>
                <li>• <code className="text-green-400">customer_email</code> - your email address</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <a
              href="/signin"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Go to Sign In
            </a>
            <a
              href="/profile"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              Go to Profile
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
