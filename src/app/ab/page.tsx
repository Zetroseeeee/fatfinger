import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAbStats,
  getSignupsBySource,
  getDecision,
  type AbRow,
} from "@/lib/db";
import { EXPERIMENTS } from "@/lib/ab";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "A/B · fatfinger.",
  robots: { index: false, follow: false },
};

function pct(num: number, den: number) {
  return den > 0 ? `${((num / den) * 100).toFixed(1)}%` : "—";
}

const EMPTY: AbRow = { bucket: "", impressions: 0, conversions: 0, confirmed: 0 };

export default async function AbPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const gate = process.env.AB_DASH_KEY;
  if (gate && key !== gate) notFound();

  const stats = await getAbStats();
  const sources = await getSignupsBySource();
  const winner = await getDecision("site");
  const byBucket: Record<string, AbRow> = {};
  for (const r of stats) byBucket[r.bucket] = r;
  const arms = ["a", "b"] as const;

  return (
    <main className="min-h-screen bg-paper px-5 py-14 text-ink sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-signal">
          A/B results
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] leading-[0.92] text-ink">
          What&apos;s winning.
        </h1>

        {!gate ? (
          <p className="mt-5 rounded-xl border border-ink/20 bg-paper-2 px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
            This page is public. Set <span className="text-ink">AB_DASH_KEY</span>{" "}
            in your environment and open <span className="text-ink">/ab?key=…</span>{" "}
            to lock it.
          </p>
        ) : null}

        <section className="mt-10">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft">
            Experiment · heroCta (the hero button label)
          </h2>
          <p
            className={`mt-3 inline-block rounded-full border-2 px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.12em] ${
              winner === "a" || winner === "b"
                ? "border-up bg-up/10 text-up"
                : "border-ink/30 text-ink-soft"
            }`}
          >
            {winner === "a" || winner === "b"
              ? `✓ Auto-promoted: arm ${winner.toUpperCase()} is live for everyone`
              : "Optimizer: still testing (auto-picks a winner at 95% confidence)"}
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border-2 border-ink">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-ink font-mono text-[11px] uppercase tracking-[0.1em] text-paper">
                  <th className="px-4 py-3">Arm</th>
                  <th className="px-4 py-3">Button says</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3 text-right">Signups</th>
                  <th className="px-4 py-3 text-right">Confirmed</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {arms.map((arm) => {
                  const r = byBucket[arm] ?? EMPTY;
                  return (
                    <tr key={arm} className="border-t border-ink/15">
                      <td className="px-4 py-3 uppercase">
                        {arm}
                        {arm === "a" ? (
                          <span className="ml-2 lowercase text-ink-soft">
                            (control)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        &ldquo;{EXPERIMENTS.heroCta[arm]}&rdquo;
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {r.impressions}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {r.conversions}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {r.confirmed}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-signal">
                        {pct(r.conversions, r.impressions)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-soft">
            Views = unique sessions per arm. Signups = emails captured. Confirmed =
            double-opt-in completed. Rate = signups / views. Let a few hundred
            views per arm accrue before trusting the winner.
          </p>
        </section>

        {/* signups by first-touch source */}
        <section className="mt-12">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft">
            Signups by source (first touch)
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border-2 border-ink">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-ink font-mono text-[11px] uppercase tracking-[0.1em] text-paper">
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Signups</th>
                  <th className="px-4 py-3 text-right">Confirmed</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {sources.length ? (
                  sources.map((s) => (
                    <tr key={s.source} className="border-t border-ink/15">
                      <td className="px-4 py-3">{s.source}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {s.signups}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {s.confirmed}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-ink/15">
                    <td className="px-4 py-3 text-ink-soft" colSpan={3}>
                      No signups yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-soft">
            Tag every ad/post link with ?utm_source=…&amp;utm_medium=…&amp;utm_campaign=…
            and it shows up here. Untagged visits fall back to the referring
            domain, or &ldquo;direct&rdquo;.
          </p>
        </section>

        {stats.length === 0 && sources.length === 0 ? (
          <p className="mt-8 font-mono text-[12px] text-ink-soft">
            No data yet. Numbers appear once the site has traffic and the database
            is connected (DATABASE_URL).
          </p>
        ) : null}
      </div>
    </main>
  );
}
