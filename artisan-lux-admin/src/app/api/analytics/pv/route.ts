import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/db/queries/analytics";

function extractIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  // fallback for local
  return (req as any).ip ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path : req.nextUrl.pathname;
  const referrer = (body.referrer as string) ?? req.headers.get("referer");
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;

  await recordPageView({
    path,
    referrer: referrer ?? null,
    ip: extractIp(req),
    userAgent: req.headers.get("user-agent"),
    sessionId,
  });

  return NextResponse.json({ ok: true });
}
