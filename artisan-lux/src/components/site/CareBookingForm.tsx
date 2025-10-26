"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CareBookingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [passportSerialNumber, setPassportSerialNumber] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/care/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passportSerialNumber,
          serviceType,
          issueDescription,
          preferredDate: preferredDate ? new Date(preferredDate).toISOString() : null,
          customerName,
          customerEmail,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book service");
      }

      router.push(`/care/success?id=${data.bookingId}`);
    } catch (error: any) {
      alert(error.message || "Failed to book service");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-serif font-bold mb-6">Book Care Service</h2>

      <div className="space-y-6">
        {/* Passport Serial Number */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Provenance Passport Serial Number *
          </label>
          <input
            type="text"
            value={passportSerialNumber}
            onChange={(e) => setPassportSerialNumber(e.target.value)}
            required
            className="input"
            placeholder="AL-XXXXX-XXXX"
          />
          <p className="text-xs text-neutral-600 mt-1">
            Found on your product's provenance passport
          </p>
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Service Type *
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            required
            className="input"
          >
            <option value="">Select service...</option>
            <option value="cleaning">Cleaning & Polishing</option>
            <option value="repair">Repair</option>
            <option value="restoration">Restoration</option>
            <option value="protective_treatment">Protective Treatment</option>
            <option value="inspection">General Inspection</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Issue Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Description of Issue or Service Needed *
          </label>
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            required
            rows={5}
            className="input"
            placeholder="Please describe what service you need or any issues with the item..."
          />
        </div>

        {/* Preferred Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Preferred Service Date
          </label>
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="input"
            min={new Date().toISOString().split("T")[0]}
          />
          <p className="text-xs text-neutral-600 mt-1">
            We'll contact you to confirm availability
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="input"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
            className="input"
            placeholder="john@example.com"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-neutral-700">
          <p className="font-medium mb-2">What happens next?</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>We'll review your request within 1 business day</li>
            <li>You'll receive a quote and timeline estimate</li>
            <li>Once approved, we'll send a prepaid shipping label</li>
            <li>Ship your item to our care facility</li>
            <li>We'll service your item and return it within the quoted timeframe</li>
          </ol>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full justify-center text-lg py-3"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Request Service"}
        </button>
      </div>
    </form>
  );
}
