import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Admin-only: run the A/B optimizer now (reuses the cron handler). */
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fatfinger.news";
  const secret = process.env.CRON_SECRET || "";
  try {
    const r = await fetch(`${base}/api/cron/optimize`, {
      headers: { authorization: `Bearer ${secret}` },
    });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json({ ok: r.ok, ...data });
  } catch {
    return NextResponse.json({ ok: false, error: "request_failed" }, { status: 502 });
  }
}
