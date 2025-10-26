"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RejectArtisanButton({ artisanId }: { artisanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    const reason = prompt("Reason for rejection (optional):");
    if (reason === null) return; // User cancelled

    if (!confirm("Are you sure you want to reject this application?")) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/artisans/${artisanId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to reject artisan");
        setLoading(false);
        return;
      }

      alert("Application rejected");
      router.push("/dashboard/artisans");
    } catch (error) {
      console.error("Error rejecting artisan:", error);
      alert("An error occurred");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReject}
      disabled={loading}
      className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Rejecting..." : "✗ Reject"}
    </button>
  );
}
