"use client";

import { useState, useEffect } from "react";
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, Currency } from "@/lib/currency";

export function CurrencySelector() {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_currency") as Currency;
    if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
      setCurrency(saved);
    }
  }, []);

  const handleChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem("preferred_currency", newCurrency);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent("currencyChange", { detail: newCurrency }));
  };

  return (
    <select
      value={currency}
      onChange={(e) => handleChange(e.target.value as Currency)}
      className="bg-transparent border border-neutral-300 rounded-md px-3 py-2 text-sm"
    >
      {SUPPORTED_CURRENCIES.map((curr) => (
        <option key={curr} value={curr}>
          {CURRENCY_SYMBOLS[curr]} {curr}
        </option>
      ))}
    </select>
  );
}
