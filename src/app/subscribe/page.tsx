import type { Metadata } from "next";
import { SubscribeForm } from "@/components/subscribe-form";
import { TransitionLink } from "@/components/ui/page-transition";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Subscribe · fatfinger.",
  description:
    "Get the daily Fat Finger brief free. Premium quant + energy tiers coming soon.",
};

type Tier = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  accent: "ink" | "electric" | "signal";
  state: "free" | "soon";
};

const TIERS: Tier[] = [
  {
    name: "The Brief",
    price: "£0",
    cadence: "free, forever",
    blurb: "The daily read. Markets, energy and macro, decoded in five minutes.",
    accent: "ink",
    state: "free",
    features: [
      "The morning brief, most weekdays",
      "The Big Slip + the Energy Desk",
      "Fat Finger of the day",
      "One chart, one take, sourced",
      "Full web archive",
    ],
  },
  {
    name: "The Terminal",
    price: "£19.99",
    cadence: "/ month",
    blurb: "For people who trade the open. The quant layer under every story.",
    accent: "electric",
    state: "soon",
    features: [
      "Everything in The Brief",
      "Quant charts + the data behind them",
      "The full commodities & energy desk",
      "Midday and close updates",
      "Searchable archive + exports",
    ],
  },
  {
    name: "The Whole Desk",
    price: "£49.99",
    cadence: "/ month",
    blurb: "The works. For the desk that wants the edge before everyone else.",
    accent: "signal",
    state: "soon",
    features: [
      "Everything in The Terminal",
      "Same-day deep dives on the slip that moved it",
      "Raw data feeds + API access",
      "Private community + analyst Q&A",
      "Priority everything",
    ],
  },
];

const ACCENT = {
  ink: { bar: "bg-ink", text: "text-ink", chip: "bg-ink text-paper" },
  electric: { bar: "bg-electric", text: "text-electric", chip: "bg-electric text-paper" },
  signal: { bar: "bg-signal", text: "text-signal", chip: "bg-signal text-paper" },
};

export default function SubscribePage() {
  return (
    <main tabIndex={-1} className="min-h-screen">
      {/* header */}
      <header className="border-b border-ink/15">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <TransitionLink
            href="/"
            className="font-body text-2xl font-bold lowercase tracking-[-0.03em] text-ink transition-opacity hover:opacity-80"
          >
            fatfinger<span className="text-signal">.</span>
          </TransitionLink>
          <TransitionLink
            href="/"
            className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
          >
            ← Home
          </TransitionLink>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-signal">
            Get on the desk
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] text-ink">
            Pick your seat.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
            The daily brief is free and always will be. The paid plans add deeper
            quant analysis, the full energy coverage, and the data behind every
            call. Start free now, upgrade when the paid plans open.
          </p>
        </div>

        {/* tiers */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const a = ACCENT[tier.accent];
            const soon = tier.state === "soon";
            return (
              <section
                key={tier.name}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-3xl border-2 border-ink bg-paper p-7",
                  soon
                    ? "opacity-95"
                    : "shadow-[10px_10px_0_0_var(--color-ink)]"
                )}
              >
                <span className={cn("absolute inset-x-0 top-0 h-1.5", a.bar)} />

                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-ink">{tier.name}</h2>
                  {soon ? (
                    <span className={cn("rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]", a.chip)}>
                      Coming soon
                    </span>
                  ) : (
                    <span className="rounded-full border border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
                      Available now
                    </span>
                  )}
                </div>

                {/* price */}
                <div className="mt-5 flex items-baseline gap-2">
                  <span
                    className={cn(
                      "font-display text-5xl leading-none",
                      soon ? "text-ink/40 line-through decoration-signal decoration-2" : a.text
                    )}
                  >
                    {tier.price}
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                    {tier.cadence}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  {tier.blurb}
                </p>

                {/* features */}
                <ul className="mt-6 flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-ink">
                      <span className={cn("mt-[2px] shrink-0 font-mono text-xs", a.text)}>
                        {soon ? "○" : "›"}
                      </span>
                      <span className={soon ? "text-ink-soft" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* action */}
                <div className="mt-7">
                  {tier.state === "free" ? (
                    <SubscribeForm buttonLabel="Subscribe" />
                  ) : (
                    <button
                      disabled
                      className="h-12 w-full cursor-not-allowed rounded-full border-2 border-ink/30 bg-paper-2 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-soft"
                    >
                      Coming soon
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Free · daily · unsubscribe anytime · not investment advice
        </p>
      </div>
    </main>
  );
}
