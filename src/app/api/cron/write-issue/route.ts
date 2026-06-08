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
  const packet: Packet = {
    date: displayDate(now),
    slug: iso,
    // TODO: feed a real tape + news/source material (ROADMAP.md - Analysis Engine).
    notes:
      "Cover the day's biggest market mover, the energy/commodities angle, a few rapid-fire desk items, one genuinely funny fat-finger market moment, and one chart. Numbers illustrative until live feeds are wired.",
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
