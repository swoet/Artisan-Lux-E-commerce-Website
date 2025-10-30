import AnalyticsClient from "@/components/AnalyticsClient";
import { aggregateVisitorsByCity } from "@/db/queries/analytics";

// Force dynamic rendering to avoid build-time timeout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  try {
    const points = await aggregateVisitorsByCity(500);
    const countryTotals = new Map<string, number>();
    for (const p of points as any[]) {
      const code = (p.country || "??") as string;
      const cnt = (p.count ?? p.visits ?? 0) as number;
      countryTotals.set(code, (countryTotals.get(code) ?? 0) + cnt);
    }
    const countries = Array.from(countryTotals.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
    return { points, countries };
  } catch (error) {
    console.error('Analytics data fetch error:', error);
    return { points: [], countries: [] };
  }
}

export default async function AnalyticsPage() {
  const data = await getData();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Analytics</h1>
      <AnalyticsClient points={data.points ?? []} countries={data.countries ?? []} />
    </div>
  );
}
