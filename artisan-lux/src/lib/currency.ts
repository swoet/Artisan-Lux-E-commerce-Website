// Currency conversion utility
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "ZWL"] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ZWL: "ZWL",
};

// Exchange rates (base: USD)
// In production, fetch from API like exchangerate-api.com
export async function getExchangeRates(): Promise<Record<Currency, number>> {
  try {
    // Free API: https://api.exchangerate-api.com/v4/latest/USD
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    const data = await response.json();
    
    return {
      USD: 1,
      EUR: data.rates.EUR || 0.92,
      GBP: data.rates.GBP || 0.79,
      ZWL: data.rates.ZWL || 322,
    };
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    // Fallback rates
    return {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      ZWL: 322,
    };
  }
}

export function convertPrice(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / rates[fromCurrency];
  return usdAmount * rates[toCurrency];
}

export function formatPrice(
  amount: number,
  currency: Currency,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
