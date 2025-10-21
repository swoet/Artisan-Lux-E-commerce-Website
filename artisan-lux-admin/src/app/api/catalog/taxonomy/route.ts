import { NextResponse } from "next/server";
import { TAXONOMY } from "@/lib/taxonomy";

export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ taxonomy: TAXONOMY });
}
