"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveArtisanButton({
  artisanId,
  artisanName,
  artisanEmail,
}: {
  artisanId: number;
  artisanName: string;
  artisanEmail: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm(`Approve ${artisanName}'s account? They will be able to access the artisan portal.`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/artisans/${artisanId}/approve`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to approve artisan");
        setLoading(false);
        return;
      }

      alert(`${artisanName}'s account has been approved! They can now log in to the artisan portal.`);
      router.refresh();
    } catch (error) {
      console.error("Error approving artisan:", error);
      alert("An error occurred");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Approving..." : "✓ Approve Account"}
    </button>
  );
}
