"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/**
 * Section 4 - "WHY IT HITS DIFFERENT" BENTO
 * Paper editorial cards: hairline border at rest, tactile lift with a coloured
 * hard offset shadow on hover. Each card owns one accent colour. Asymmetric
 * grid. No glow - clean and confident.
 */

type Accent = "signal" | "electric" | "up" | "ink";

type Card = {
  kicker: string;
  title: string;
  body: string;
  span: string;
  accent: Accent;
  art?: React.ReactNode;
};

const ACCENT: Record<
  Accent,
  { tag: string; shadow: string; rule: string }
> = {
  signal: { tag: "bg-signal text-paper", shadow: "hover:shadow-[8px_8px_0_0_var(--color-signal)]", rule: "bg-signal" },
  electric: { tag: "bg-electric text-paper", shadow: "hover:shadow-[8px_8px_0_0_var(--color-electric)]", rule: "bg-electric" },
  up: { tag: "bg-up text-paper", shadow: "hover:shadow-[8px_8px_0_0_var(--color-up)]", rule: "bg-up" },
  ink: { tag: "bg-ink text-paper", shadow: "hover:shadow-[8px_8px_0_0_var(--color-ink)]", rule: "bg-ink" },
};

function MiniChart() {
  return (
    <svg viewBox="0 0 200 60" className="h-16 w-full" aria-hidden>
      <polyline
        points="0,52 25,50 50,53 75,46 100,49 125,42 150,45 175,38 200,40"
        fill="none"
        stroke="var(--color-ink)"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
      <polyline
        points="0,45 25,40 50,48 75,30 100,34 125,18 150,24 175,10 200,14"
        fill="none"
        stroke="var(--color-up)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CARDS: Card[] = [
  {
    kicker: "01 / The beat",
    title: "The energy desk nobody else runs",
    body: "Oil, gas, power, metals and the money plumbing underneath, covered harder than anyone in your inbox. Plus equities, rates and macro, decoded with a quant brain and said in plain English.",
    span: "md:col-span-2",
    accent: "up",
    art: <MiniChart />,
  },
  {
    kicker: "02 / No gatekeeping",
    title: "Not behind a $24,000 terminal",
    body: "Most finance media is dumbed-down memes or research locked behind a Bloomberg seat. We do the rigour and the readability, and we don't gatekeep.",
    span: "",
    accent: "electric",
  },
  {
    kicker: "03 / The take",
    title: "Every story ends with a take",
    body: "One sharp line that tells you what it actually means, usually an analogy you'll repeat at the desk. Sourced, never hype-y. Receipts included.",
    span: "",
    accent: "signal",
  },
  {
    kicker: "04 / The tone",
    title: "Serious money, unserious selves",
    body: "Built for people who take their money seriously and themselves less so. Sharp takes, a sense of humour, written like a person, not a press release run through a thesaurus.",
    span: "md:col-span-2",
    accent: "ink",
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
      {/* accent rule that grows on hover */}
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
      {card.art && <div className="mt-6">{card.art}</div>}
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
            Markets are loud.
            <br />
            We&apos;re the part worth hearing.
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
