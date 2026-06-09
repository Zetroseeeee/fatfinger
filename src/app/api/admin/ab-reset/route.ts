import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { resetAbDecision } from "@/lib/db";

/** Admin-only: clear the optimizer verdict so the A/B test re-opens 50/50. */
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await resetAbDecision("site");
  return NextResponse.json({ ok: true });
}
