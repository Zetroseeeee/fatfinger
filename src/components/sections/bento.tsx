"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { LazyFatFingerChart as FatFingerChart } from "@/components/charts/lazy-fat-finger-chart";
import { cn } from "@/lib/utils";

/**
 * Section 4 - "WHY IT HITS DIFFERENT"
 * Four plain-spoken value props. Two cards carry a REAL <FatFingerChart>
 * (Recharts) so you can see the house style: everything muted, red marks the one
 * thing that matters. Hover = lift + coloured hard shadow. Charts illustrative.
 */

type Accent = "signal" | "electric" | "up" | "ink";

const ACCENT: Record<Accent, { tag: string; shadow: string; rule: string }> = {
  signal: { tag: "bg-signal text-paper", shadow: "hover:shadow-[8px_8px_0_0_var(--color-signal)]", rule: "bg-signal" },
  electric: { tag: "bg-electric text-paper", shadow: "hover:shadow-[8px_8px_0_0_var(--color-electric)]", rule: "bg-electric" },
  up: { tag: "bg-up text-paper", shadow: "hover:shadow-[8px_8px_0_0_var(--color-up)]", rule: "bg-up" },
  ink: { tag: "bg-ink text-paper", shadow: "hover:shadow-[8px_8px_0_0_var(--color-ink)]", rule: "bg-ink" },
};

// illustrative data - // TODO: swap in real feeds
const BRENT = [
  { d: "1", px: 79.1 }, { d: "2", px: 78.6 }, { d: "3", px: 78.9 },
  { d: "4", px: 77.8 }, { d: "5", px: 78.2 }, { d: "6", px: 77.1 },
  { d: "7", px: 76.4 }, { d: "8", px: 75.2 }, { d: "9", px: 75.0 },
  { d: "10", px: 74.65 },
];
const NATGAS = [
  { d: "Mon", v: 2.71 }, { d: "Tue", v: 2.74 }, { d: "Wed", v: 2.69 },
  { d: "Thu", v: 2.80 }, { d: "Fri", v: 3.15 }, { d: "Mon ", v: 2.92 },
  { d: "Tue ", v: 2.85 },
];

type Card = {
  kicker: string;
  title: string;
  body: string;
  span: string;
  accent: Accent;
  chart?: React.ReactNode;
  footer?: React.ReactNode;
};

const CARDS: Card[] = [
  {
    kicker: "01 / The chart",
    title: "One chart. One point. In red.",
    body: "Every issue gets a single chart where everything is muted except the one number the story is about. Your eye goes straight to it. No spaghetti, no decoration.",
    span: "md:col-span-2",
    accent: "signal",
    chart: (
      <FatFingerChart
        type="area"
        title="Brent crude · last 10 sessions"
        take="Red marks the only number that matters."
        source="SOURCE: ICE Brent · illustrative"
        xKey="d"
        yKey="px"
        highlightIndex={9}
        markerLabel="$74.65"
        valuePrefix="$"
        valueDecimals={0}
        height={170}
        data={BRENT}
      />
    ),
  },
  {
    kicker: "02 / No gatekeeping",
    title: "Bloomberg-grade, not Bloomberg-priced",
    body: "Finance media is either dumbed-down memes or rigour locked behind a $24,000 terminal. We do both, and charge nothing for the daily.",
    span: "",
    accent: "electric",
    footer: (
      <div className="mt-6 flex items-end gap-3">
        <span className="font-display text-[3.4rem] leading-[0.8] text-electric">
          £0
        </span>
        <span className="mb-1 font-mono text-[11px] uppercase leading-tight tracking-[0.14em] text-ink-soft">
          the daily brief
          <br />
          free, forever
        </span>
      </div>
    ),
  },
  {
    kicker: "03 / The take",
    title: "Every story ends with the 'so what'",
    body: "One closing line that tells you what it actually means. The kind of analogy you'll repeat at the desk:",
    span: "",
    accent: "ink",
    footer: (
      <div className="mt-6 border-l-[3px] border-signal pl-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
          for example
        </p>
        <p className="mt-1.5 text-[15px] font-medium italic leading-snug text-ink">
          “Compute is the new oil, and even Google is renting it.”
        </p>
      </div>
    ),
  },
  {
    kicker: "04 / The home beat",
    title: "Energy, covered harder than anyone",
    body: "Oil, gas, power, metals, and the money moving them. The beat nobody else runs, decoded with quant rigour and written in plain English.",
    span: "md:col-span-2",
    accent: "up",
    chart: (
      <FatFingerChart
        type="bar"
        title="US nat gas · $/MMBtu"
        take="The spike was the story. We called it."
        source="SOURCE: Henry Hub · illustrative"
        xKey="d"
        yKey="v"
        highlightIndex={4}
        valuePrefix="$"
        valueDecimals={2}
        height={170}
        data={NATGAS}
      />
    ),
  },
];

function BentoCard({ card, index }: { card: Card; index: number }) {
  const reduce = useReducedMotion();
  const a = ACCENT[card.accent];
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduce ? undefined : { y: -8, x: -2 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-ink bg-paper p-6 transition-shadow duration-200 sm:p-7",
        a.shadow,
        card.span
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100", a.rule)} />

      <div>
        <span className={cn("inline-block rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]", a.tag)}>
          {card.kicker}
        </span>
        <h3 className="mt-4 font-display text-2xl leading-[0.98] text-ink sm:text-[1.8rem]">
          {card.title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          {card.body}
        </p>
      </div>
      {card.chart ? <div className="mt-6">{card.chart}</div> : card.footer}
    </motion.article>
  );
}

export function Bento() {
  return (
    <section id="why" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-12 max-w-3xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-signal">
            Why it hits different
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.92] text-ink">
            Four reasons it's
            <br />
            not like the rest.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <BentoCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
