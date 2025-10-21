import { db } from "../index";
import { pageViews } from "../schema";
import { desc, sql } from "drizzle-orm";

function lookupGeo(ip?: string | null): Pick<typeof pageViews.$inferInsert, "country" | "region" | "city" | "lat" | "lon"> {
  try {
    if (!ip) return { country: null, region: null, city: null, lat: null, lon: null } as any;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const geoip = require("geoip-lite") as { lookup: (ip: string) => any };
    const res = geoip.lookup(ip);
    if (!res) return { country: null, region: null, city: null, lat: null, lon: null } as any;
    const [lat, lon] = (res.ll || [null, null]) as [number | null, number | null];
    return {
      country: res.country ?? null,
      region: (res.region as any) ?? null,
      city: res.city ?? null,
      lat: lat as any,
      lon: lon as any,
    } as any;
  } catch {
    return { country: null, region: null, city: null, lat: null, lon: null } as any;
  }
}

export async function recordPageView(input: {
  path: string;
  referrer?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  sessionId?: string | null;
}) {
  const geo = lookupGeo(input.ip);
  const [pv] = await db
    .insert(pageViews)
    .values({
      path: input.path,
      referrer: input.referrer ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      sessionId: input.sessionId ?? null,
      ...geo,
    })
    .returning();
  return pv;
}

export async function aggregateVisitorsByCity(limit = 200) {
  try {
    const result = await db.execute(sql`
      select city, country, region,
             avg(lat)::float8 as lat,
             avg(lon)::float8 as lon,
             count(*)::int as visits
      from page_views
      where lat is not null and lon is not null
      group by city, country, region
      order by visits desc
      limit ${limit}
    `);
    const rows = (result as any).rows ?? ([] as any[]);
    return rows.map((r: any) => ({
      city: r.city ?? null,
      country: r.country ?? null,
      region: r.region ?? null,
      lat: typeof r.lat === "number" ? r.lat : Number(r.lat),
      lon: typeof r.lon === "number" ? r.lon : Number(r.lon),
      count: typeof r.visits === "number" ? r.visits : Number(r.visits ?? 0),
    }));
  } catch {
    return [] as any[];
  }
}

export async function recentPageViews(limit = 100) {
  const rows = await db.select().from(pageViews).orderBy(desc(pageViews.createdAt)).limit(limit);
  return rows;
}
