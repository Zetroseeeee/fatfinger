import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import {
  getSubscriberBreakdown,
  getRecentSubscribers,
  getAbStats,
  getSignupsBySource,
  getDecision,
  type AbRow,
} from "@/lib/db";
import { EXPERIMENTS } from "@/lib/ab";
import { Roadmap } from "@/components/admin/roadmap";
import { AdminControls } from "@/components/admin/admin-controls";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mission Control · fatfinger.",
  robots: { index: false, follow: false },
};

const pct = (n: number, d: number) => (d > 0 ? `${((n / d) * 100).toFixed(1)}%` : "—");
const fmtDate = (s: string) => (s ? s.slice(0, 10) : "");

/** never let one slow query hang the dashboard - fall back after `ms` */
function withTimeout<T>(p: Promise<T>, fallback: T, ms = 7000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [bd, recent, ab, sources, winner] = await Promise.all([
    withTimeout(getSubscriberBreakdown(), { confirmed: 0, pending: 0, unsubscribed: 0, total: 0 }),
    withTimeout(getRecentSubscribers(50), []),
    withTimeout(getAbStats(), []),
    withTimeout(getSignupsBySource(), []),
    withTimeout(getDecision("site"), null),
  ]);
  const byBucket: Record<string, AbRow> = {};
  for (const r of ab) byBucket[r.bucket] = r;
  const arms = ["a", "b"] as const;

  const kpis = [
    { label: "Confirmed subscribers", value: String(bd.confirmed), color: "text-up" },
    { label: "Pending confirm", value: String(bd.pending), color: "text-electric" },
    { label: "Unsubscribed", value: String(bd.unsubscribed), color: "text-ink-soft" },
    { label: "MRR", value: "£0", color: "text-signal", note: "paid tiers / Stripe next" },
  ];

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-signal">
              Mission control
            </p>
            <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.5rem)] uppercase leading-[0.92]">
              The whole desk.
            </h1>
          </div>
          <AdminControls />
        </div>

        {/* KPIs */}
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_0_var(--color-ink)]">
              <div className={`font-display text-4xl leading-none ${k.color}`}>{k.value}</div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {k.label}
              </div>
              {k.note ? (
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft/70">
                  {k.note}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* pipeline */}
        <section className="mt-14">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft">
            The pipeline — what&apos;s done, live, and next
          </h2>
          <div className="mt-5">
            <Roadmap />
          </div>
        </section>

        {/* A/B */}
        <section className="mt-14">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft">
            A/B test — hero button (auto-optimizing)
          </h2>
          <p
            className={`mt-3 inline-block rounded-full border-2 px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.12em] ${
              winner === "a" || winner === "b"
                ? "border-up bg-up/10 text-up"
                : "border-ink/30 text-ink-soft"
            }`}
          >
            {winner === "a" || winner === "b"
              ? `✓ Auto-promoted arm ${winner.toUpperCase()} (live for everyone)`
              : "Still testing — auto-picks a winner at 95% confidence"}
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border-2 border-ink">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink font-mono text-[11px] uppercase tracking-[0.1em] text-paper">
                    <th className="px-4 py-3">Arm</th>
                    <th className="px-4 py-3">Button</th>
                    <th className="px-4 py-3 text-right">Views</th>
                    <th className="px-4 py-3 text-right">Signups</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px]">
                  {arms.map((arm) => {
                    const r = byBucket[arm] ?? { impressions: 0, conversions: 0, confirmed: 0 };
                    return (
                      <tr key={arm} className="border-t border-ink/15">
                        <td className="px-4 py-3 uppercase">{arm}</td>
                        <td className="px-4 py-3">&ldquo;{EXPERIMENTS.heroCta[arm]}&rdquo;</td>
                        <td className="px-4 py-3 text-right tabular-nums">{r.impressions}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{r.conversions}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-signal">
                          {pct(r.conversions, r.impressions)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="overflow-hidden rounded-2xl border-2 border-ink">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink font-mono text-[11px] uppercase tracking-[0.1em] text-paper">
                    <th className="px-4 py-3">Signups by source</th>
                    <th className="px-4 py-3 text-right">Signups</th>
                    <th className="px-4 py-3 text-right">Confirmed</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px]">
                  {sources.length ? (
                    sources.map((s) => (
                      <tr key={s.source} className="border-t border-ink/15">
                        <td className="px-4 py-3">{s.source}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{s.signups}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{s.confirmed}</td>
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
          </div>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-soft">
            Tag ad links with ?utm_source=…&amp;utm_campaign=… to attribute them here. To run a
            new test (pricing, layout, headline), add it to src/lib/ab.ts — the optimizer picks
            the winner automatically.
          </p>
        </section>

        {/* subscribers */}
        <section className="mt-14">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft">
            Subscribers — who signed up to what ({bd.total})
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-ink">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="bg-ink font-mono text-[11px] uppercase tracking-[0.1em] text-paper">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[12px]">
                {recent.length ? (
                  recent.map((s) => (
                    <tr key={s.email} className="border-t border-ink/15">
                      <td className="px-4 py-2.5">{s.email}</td>
                      <td className="px-4 py-2.5 uppercase">{s.tier}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            s.status === "confirmed"
                              ? "text-up"
                              : s.status === "unsubscribed"
                                ? "text-ink-soft"
                                : "text-electric"
                          }
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{s.source}</td>
                      <td className="px-4 py-2.5 text-ink-soft">{fmtDate(s.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-ink/15">
                    <td className="px-4 py-3 text-ink-soft" colSpan={5}>
                      No subscribers yet. Launch the £50 campaign (LAUNCH.md) to get the first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
