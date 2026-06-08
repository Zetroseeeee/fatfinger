"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";
import { AnimatedNumber } from "@/components/v1/skiper37";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Stamp } from "@/components/ui/stamp";
import { Reveal, RevealItem } from "@/components/ui/reveal";

/**
 * Section 3 - HERO
 * Editorial, paper, left-aligned. Oversized Anton headline with a typewriter
 * line + red caret, a colour-block highlight, a rotating stamp, and a stat row.
 * The stats are LIVE (real counts from /api/stats); they default to 0 when there
 * is nothing yet. No glow / grid-beam / grain - clean and confident.
 */

type Stats = { subscribers: number; issues: number; openRate: number };

export function Hero() {
  const [stats, setStats] = useState<Stats>({
    subscribers: 0,
    issues: 0,
    openRate: 0,
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setStats(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const STATS = [
    { value: stats.subscribers, suffix: "", label: "readers on the desk", color: "text-electric" },
    { value: stats.issues, suffix: "", label: "issues published", color: "text-signal" },
    { value: stats.openRate, suffix: "%", label: "open rate, last issue", color: "text-up" },
  ];

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          {/* headline + copy */}
          <div className="max-w-4xl">
            <Reveal stagger={0.12}>
              <RevealItem>
                <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-ink-soft">
                  fat finger <span className="text-ink-soft/60">(n.)</span>: your sharpest read on the markets
                </p>
              </RevealItem>

              <RevealItem as="div">
                <h1 className="mt-5 font-display text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.86] text-ink">
                  <span className="block">The slip that</span>
                  <span className="relative inline-block">
                    {/* colour-block highlight behind the word */}
                    <span
                      aria-hidden
                      className="absolute -inset-x-2 bottom-1 top-2 -z-0 -skew-y-1 bg-electric/90"
                    />
                    <span className="relative z-10 px-1 text-paper">moves</span>
                  </span>{" "}
                  <span className="block sm:inline">markets.</span>
                </h1>
              </RevealItem>

              <RevealItem>
                <div className="mt-7 h-[1.2em] font-display text-[clamp(1.1rem,3.2vw,2rem)] leading-none text-signal">
                  <span className="text-ink-soft/70">today: </span>
                  <Typewriter
                    className="text-ink"
                    caretClassName="bg-signal"
                    words={[
                      "OIL, POWER, METALS. DECODED.",
                      "THE FAT FINGER THAT MOVED MILLIONS.",
                      "BLOOMBERG'S BRAIN, A TRADER'S MOUTH.",
                    ]}
                  />
                </div>
              </RevealItem>

              <RevealItem>
                <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
                  The sharpest, wittiest read on markets, energy and macro.
                  Decoded, not reported. Get the number that moved the tape, the
                  commodities story nobody else covers, and one sharp take per
                  story. Five minutes. No jargon. No gatekeeping.
                </p>
              </RevealItem>

              <RevealItem>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <MagneticButton href="/subscribe" variant="red">
                    Subscribe, it&apos;s free
                  </MagneticButton>
                  <MagneticButton href="/issues" variant="ghost">
                    Read a sample issue ↓
                  </MagneticButton>
                </div>
              </RevealItem>
            </Reveal>
          </div>

          {/* rotating stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden self-start lg:block"
          >
            <Stamp />
          </motion.div>
        </div>

        {/* stat row */}
        <Reveal
          stagger={0.1}
          delay={0.2}
          className="mt-16 grid grid-cols-1 divide-y divide-ink/15 border-y border-ink/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {STATS.map((s) => (
            <RevealItem
              key={s.label}
              className="flex items-baseline gap-3 px-0 py-5 sm:px-6"
            >
              <span className={`font-display text-4xl leading-none sm:text-5xl ${s.color}`}>
                <AnimatedNumber value={s.value} suffix={s.suffix} />
              </span>
              <span className="font-mono text-[11px] uppercase leading-tight tracking-[0.14em] text-ink-soft">
                {s.label}
              </span>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
