import { NextResponse } from "next/server";
import { recordImpression } from "@/lib/db";

/** POST /api/ab - record one A/B impression for the visitor's arm. */
export async function POST(req: Request) {
  let bucket: unknown;
  try {
    ({ bucket } = await req.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (bucket === "a" || bucket === "b") {
    await recordImpression(bucket);
  }
  return NextResponse.json({ ok: true });
}
