"use client";

import { CardStackScroll } from "@/components/v1/skiper16";
import { TerminalAnimation } from "@/components/ui/terminal-animation";
import { Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/page-transition";

/**
 * Section 5 - PRODUCT SHOWCASE
 * Fat Finger brief cards stacking on scroll. Each is the bespoke card:
 * run-rate / Anton headline / red take / SOURCE - now on paper with a bold ink
 * border + hard shadow, a dark terminal inset for contrast.
 */

type Brief = {
  date: string;
  runRate: string;
  runRateLabel: string;
  headline: string;
  take: string;
  source: string;
  accent: "signal" | "electric" | "up";
  terminal?: { text: string; tone?: "muted" | "signal" | "up" | "paper" }[];
};

const BRIEFS: Brief[] = [
  {
    date: "MON · 06.08",
    runRate: "188k",
    runRateLabel: "barrels added. the market needed 10 million",
    headline: "OPEC+ added 188,000 barrels. The market needed 10 million.",
    take: "Context beats clickbait: a rounding error dressed as a policy shift.",
    source: "SOURCE: OPEC Secretariat · ICE Brent",
    accent: "signal",
    terminal: [
      { text: "OPEC+   +188,000 bbl/d  from Jul", tone: "paper" },
      { text: "Brent   $74.65   -1.88%", tone: "muted" },
      { text: "verdict DEMAND FEAR > SUPPLY ADD", tone: "signal" },
    ],
  },
  {
    date: "THU · 06.04",
    runRate: "$920M",
    runRateLabel: "a month, to borrow compute",
    headline: "Google is paying SpaceX $920M a month to borrow compute.",
    take: "Compute is the new oil, and even Google is renting it.",
    source: "SOURCE: filings · reporting (illustrative)",
    accent: "electric",
  },
  {
    date: "TUE · 06.02",
    runRate: "-9%",
    runRateLabel: "bitcoin's worst week in months",
    headline: "Bitcoin had its worst week in months. The maxis blamed AI.",
    take: "When the safe-haven trade is crypto, there is no safe haven.",
    source: "SOURCE: spot exchanges · ETF flows",
    accent: "up",
  },
];

const ACCENT = {
  signal: { text: "text-signal", border: "border-signal", chip: "bg-signal text-paper" },
  electric: { text: "text-electric", border: "border-electric", chip: "bg-electric text-paper" },
  up: { text: "text-up", border: "border-up", chip: "bg-up text-paper" },
};

function FatFingerCard({ brief }: { brief: Brief }) {
  const a = ACCENT[brief.accent];
  return (
    <article className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[10px_10px_0_0_var(--color-ink)]">
      {/* header strip */}
      <div className="flex items-center justify-between border-b-2 border-ink px-6 py-3 sm:px-8">
        <span className="font-body text-lg font-bold lowercase tracking-[-0.03em] text-ink">
          fatfinger<span className="text-signal">.</span>
        </span>
        <span className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] ${a.chip}`}>
          {brief.date}
        </span>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-5 sm:p-8">
        <div className="sm:col-span-3">
          {/* run-rate */}
          <div className="flex items-baseline gap-3">
            <span className={`font-display text-5xl leading-none sm:text-6xl ${a.text}`}>
              {brief.runRate}
            </span>
            <span className="font-mono text-[11px] uppercase leading-tight tracking-[0.12em] text-ink-soft">
              {brief.runRateLabel}
            </span>
          </div>

          {/* Anton headline */}
          <h3 className="mt-5 font-display text-2xl leading-[0.98] text-ink sm:text-[2.1rem]">
            {brief.headline}
          </h3>

          {/* red take */}
          <p className={`mt-5 border-l-[3px] ${a.border} pl-4 text-sm font-medium italic leading-relaxed text-ink`}>
            “{brief.take}”
          </p>

          {/* SOURCE */}
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            {brief.source}
          </p>
        </div>

        {/* terminal accent / sidebar */}
        <div className="sm:col-span-2">
          {brief.terminal ? (
            <TerminalAnimation lines={brief.terminal} />
          ) : (
            <div className="flex h-full flex-col justify-between rounded-xl border-2 border-ink bg-paper-2 p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                Today&apos;s read
              </span>
              <span className={`font-display text-4xl ${a.text}`}>→</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                3 min · 1 chart · 0 jargon
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function Showcase() {
  return (
    <section id="showcase" className="relative border-t border-ink/15 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-4 max-w-2xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-electric">
            See it before you subscribe
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.92] text-ink">
            Three real issues, top to bottom.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
            Exactly what lands in your inbox: the number that moved the
            market, the story behind it, the take, the receipts.
            Scroll through three.{" "}
            <TransitionLink
              href="/issues"
              className="font-medium text-ink underline decoration-signal decoration-2 underline-offset-4 hover:text-signal"
            >
              Read the full issues →
            </TransitionLink>
          </p>
        </Reveal>
      </div>

      {/* stacking deck - each card is a full-height pinned section */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <CardStackScroll>
          {BRIEFS.map((b) => (
            <FatFingerCard key={b.date} brief={b} />
          ))}
        </CardStackScroll>
      </div>
    </section>
  );
}
