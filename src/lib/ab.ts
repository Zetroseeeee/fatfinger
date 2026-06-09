import { cookies, headers } from "next/headers";
import { getDecisionCached } from "./db";

/**
 * The A/B experiment registry. Add an entry with an `a` (control) and `b`
 * (challenger) value, then read it in a server component:
 *
 *   const bucket = await getBucket();
 *   <Hero ctaLabel={pick("heroCta", bucket)} />
 *
 * The visitor's arm is assigned once at the edge (see src/middleware.ts) and
 * stays sticky for a year. Conversions are attributed to the arm in Supabase
 * (see src/lib/db.ts + /api/subscribe), so you can compare signup rate per arm
 * at /ab.
 */

export type Bucket = "a" | "b";
export const AB_COOKIE = "ff_ab";

export const EXPERIMENTS = {
  // The hero's primary call-to-action label.
  heroCta: { a: "Subscribe, it's free", b: "Get tomorrow's brief" },
} as const;

export type Experiment = keyof typeof EXPERIMENTS;

/** The variant value for an experiment, given the visitor's arm. */
export function pick(exp: Experiment, bucket: Bucket): string {
  return EXPERIMENTS[exp][bucket];
}

/**
 * The variant to serve. Once the nightly optimizer (/api/cron/optimize) has
 * crowned a statistically-significant winner, EVERYONE gets the winning arm and
 * the test is effectively over. Until then, the visitor's sticky 50/50 arm.
 */
export async function getBucket(): Promise<Bucket> {
  const winner = await getDecisionCached("site");
  if (winner === "a" || winner === "b") return winner;

  const c = (await cookies()).get(AB_COOKIE)?.value;
  if (c === "a" || c === "b") return c;
  const h = (await headers()).get("x-ff-ab");
  return h === "b" ? "b" : "a";
}
