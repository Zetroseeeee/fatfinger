import { NextResponse } from "next/server";
import { hasEngine, writeIssue, type Packet } from "@/lib/skinny-finger";
import { saveGeneratedIssue } from "@/lib/db";

/**
 * GET /api/cron/write-issue - the Skinny Finger Engine's morning run.
 * Vercel Cron hits this each weekday (see vercel.json). It drafts a full issue
 * and saves it for human review before sending. Protected by CRON_SECRET.
 *
 * Writing an issue can take a while at high effort, so give it room.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authed(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse to run an expensive endpoint unprotected
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function displayDate(d: Date) {
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const rest = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${day} · ${rest}`;
}

const TAPE_LABELS: Record<string, string> = {
  SPY: "S&P 500 (SPY)",
  QQQ: "Nasdaq 100 (QQQ)",
  USO: "WTI oil (USO)",
  BNO: "Brent oil (BNO)",
  UNG: "US nat gas (UNG)",
  GLD: "Gold (GLD)",
  UUP: "US dollar (UUP)",
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
};

/** Pull the real end-of-day tape from our own ticker feed for the packet. */
async function fetchTape(req: Request): Promise<Packet["tape"]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const r = await fetch(`${base}/api/ticker`, { cache: "no-store" });
    if (!r.ok) return undefined;
    const j = await r.json();
    const ticks: { label: string; value: string; chg: string; dir: "up" | "down" }[] =
      Array.isArray(j?.ticks) ? j.ticks : [];
    if (!ticks.length) return undefined;
    return ticks.map((t) => ({
      label: TAPE_LABELS[t.label] ?? t.label,
      value: t.value,
      chg: t.chg,
      dir: t.dir,
    }));
  } catch {
    return undefined;
  }
}

export async function GET(req: Request) {
  if (!authed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!hasEngine) {
    return NextResponse.json(
      { ok: false, error: "engine_offline", hint: "set ANTHROPIC_API_KEY" },
      { status: 503 }
    );
  }

  const now = new Date();
  const iso = now.toISOString().slice(0, 10); // 2026-06-09

  // Feed the engine the REAL tape so it writes around real numbers (and the real
  // chart it picks via chartSymbol stays consistent with the prose).
  const tape = await fetchTape(req);

  const packet: Packet = {
    date: displayDate(now),
    slug: iso,
    tape,
    notes:
      "Cover the day's biggest market mover, the energy/commodities angle, a few rapid-fire desk items, one genuinely funny fat-finger market moment, and one chart. Lead with energy. Use the real tape above; set chartSymbol to the instrument whose live price best tells the lead story.",
  };

  try {
    const issue = await writeIssue(packet);
    const saved = await saveGeneratedIssue(issue.slug, issue.date, issue);
    return NextResponse.json({
      ok: true,
      saved, // false when no DB configured (draft returned but not persisted)
      slug: issue.slug,
      headline: issue.bigSlip.headline,
      issue,
    });
  } catch (err) {
    console.error("[skinny-finger] write failed", err);
    return NextResponse.json({ ok: false, error: "write_failed" }, { status: 500 });
  }
}
