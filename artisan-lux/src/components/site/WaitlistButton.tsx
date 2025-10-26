"use client";

import { useState } from "react";

interface WaitlistButtonProps {
  productId: number;
  productName: string;
}

export default function WaitlistButton({ productId, productName }: WaitlistButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          email,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setJoined(true);
      setShowForm(false);
    } catch (error: any) {
      alert(error.message || "Failed to join waitlist");
    } finally {
      setLoading(false);
    }
  };

  if (joined) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">✓</div>
        <div className="font-bold text-green-700 mb-1">You're on the waitlist!</div>
        <div className="text-sm text-green-600">
          We'll notify you when {productName} is back in stock
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="btn btn-secondary w-full justify-center"
      >
        Join Waitlist
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 rounded-lg p-4 bg-white">
      <h3 className="font-bold mb-3">Join Waitlist</h3>
      <p className="text-sm text-neutral-600 mb-4">
        Get notified when this item is back in stock
      </p>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="your@email.com"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Waitlist"}
          </button>
        </div>
      </div>
    </form>
  );
}
