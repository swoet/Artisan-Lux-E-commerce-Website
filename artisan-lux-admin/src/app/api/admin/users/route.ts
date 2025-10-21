import { NextRequest, NextResponse } from "next/server";
import { listCustomers, recentAuthEvents } from "@/db/queries/customers";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);
  const customers = await listCustomers({ limit, offset });
  const events = await recentAuthEvents(50);
  return NextResponse.json({ customers, events });
}
