import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Admin-only: trigger the daily writer immediately (reuses the cron handler). */
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fatfinger.news";
  const secret = process.env.CRON_SECRET || "";
  try {
    // force=1: a manual run from the dashboard bypasses the weekday/hour guards
    const r = await fetch(`${base}/api/cron/write-issue?force=1`, {
      headers: { authorization: `Bearer ${secret}` },
    });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json({ ok: r.ok, ...data });
  } catch {
    return NextResponse.json({ ok: false, error: "request_failed" }, { status: 502 });
  }
}
