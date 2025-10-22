"use client";

import { useState, useEffect } from "react";
import { locales, Locale } from "@/i18n/request";

export function LanguageSelector() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("locale="))
      ?.split("=")[1] as Locale;
    
    if (saved && locales.includes(saved)) {
      setLocale(saved);
    }
  }, []);

  const handleChange = (newLocale: Locale) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
    setLocale(newLocale);
    window.location.reload(); // Reload to apply new locale
  };

  const languageNames: Record<Locale, string> = {
    en: "English",
    fr: "Français",
    es: "Español",
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value as Locale)}
      className="bg-transparent border border-neutral-300 rounded-md px-3 py-2 text-sm"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {languageNames[loc]}
        </option>
      ))}
    </select>
  );
}
