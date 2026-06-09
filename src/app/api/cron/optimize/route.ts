import { NextResponse } from "next/server";
import { getAbStats, getDecision, setDecision } from "@/lib/db";

/**
 * GET /api/cron/optimize - the self-optimizing A/B brain.
 *
 * Runs nightly (see vercel.json). It reads the live conversion data per arm,
 * runs a two-proportion z-test, and the moment one variant is a
 * statistically-significant winner (with enough sample) it PROMOTES it: from
 * then on every visitor gets the winner (see getBucket). No human in the loop.
 *
 * Conservative on purpose - it would rather keep testing than ship a false
 * winner on thin data.
 */
export const dynamic = "force-dynamic";

const MIN_IMPRESSIONS_PER_ARM = 200; // don't decide on tiny traffic
const MIN_TOTAL_SIGNUPS = 30; // ...or tiny conversions
const Z_95 = 1.96; // 95% confidence

function authed(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function evaluate(iA: number, cA: number, iB: number, cB: number) {
  if (iA < MIN_IMPRESSIONS_PER_ARM || iB < MIN_IMPRESSIONS_PER_ARM) {
    return { winner: null as string | null, z: 0, reason: "not enough views yet" };
  }
  if (cA + cB < MIN_TOTAL_SIGNUPS) {
    return { winner: null, z: 0, reason: "not enough signups yet" };
  }
  const pA = cA / iA;
  const pB = cB / iB;
  const pooled = (cA + cB) / (iA + iB);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / iA + 1 / iB));
  if (se === 0) return { winner: null, z: 0, reason: "no variance" };
  const z = (pB - pA) / se;
  if (Math.abs(z) < Z_95) {
    return { winner: null, z, reason: "not significant yet (keep testing)" };
  }
  return { winner: pB > pA ? "b" : "a", z, reason: "significant winner" };
}

export async function GET(req: Request) {
  if (!authed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // already concluded? leave it (sticky winner)
  const current = await getDecision("site");
  if (current === "a" || current === "b") {
    return NextResponse.json({ ok: true, status: "already_decided", winner: current });
  }

  const stats = await getAbStats();
  const a = stats.find((s) => s.bucket === "a");
  const b = stats.find((s) => s.bucket === "b");
  const iA = a?.impressions ?? 0;
  const cA = a?.conversions ?? 0;
  const iB = b?.impressions ?? 0;
  const cB = b?.conversions ?? 0;

  const result = evaluate(iA, cA, iB, cB);
  const detail = { a: { views: iA, signups: cA }, b: { views: iB, signups: cB }, ...result };

  if (result.winner) {
    await setDecision("site", result.winner, result.z, detail);
  } else {
    // record progress (winner stays null) so /ab shows the running verdict
    await setDecision("site", null, result.z, detail);
  }

  return NextResponse.json({ ok: true, ...detail });
}
