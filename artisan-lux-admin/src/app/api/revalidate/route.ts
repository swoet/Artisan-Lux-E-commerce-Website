import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const { token, tags = [], paths = [] } = await req.json().catch(() => ({}));
  if (token !== process.env.REVALIDATE_TOKEN) return NextResponse.json({ ok:false }, { status: 401 });
  for (const t of tags) revalidateTag(t);
  for (const p of paths) revalidatePath(p);
  return NextResponse.json({ ok: true });
}
