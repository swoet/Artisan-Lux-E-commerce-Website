import { NextResponse } from "next/server";
import { aggregateVisitorsByCity } from "@/db/queries/analytics";

export async function GET() {
  const rows = await aggregateVisitorsByCity(500);
  return NextResponse.json({ points: rows });
}
