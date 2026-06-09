"use client";

import { Marquee } from "@/components/ui/marquee";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Reveal } from "@/components/ui/reveal";

/**
 * Section 6 - CTA BAND
 * An outline-type marquee flourish on paper, then a full-bleed electric colour
 * block with the headline. Bold, minimal, one big interactive button.
 */
export function CtaBand() {
  return (
    <section id="cta" className="relative">
      {/* outline marquee flourish */}
      <div className="border-y-2 border-ink py-4">
        <Marquee duration={28} pauseOnHover={false}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="font-display text-outline px-6 text-4xl sm:text-6xl"
            >
              The sharpest read on markets, energy and macro&nbsp;
              <span className="text-signal [-webkit-text-stroke:0]">●</span>&nbsp;
            </span>
          ))}
        </Marquee>
      </div>

      {/* electric colour block */}
      <div className="bg-electric text-paper">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:py-32">
          <Reveal>
            <p className="mb-5 font-mono text-[12px] uppercase tracking-[0.22em] text-paper/70">
              Before the bell tomorrow
            </p>
            <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] text-paper">
              Don&apos;t read the market.
              <br />
              Beat it to the open
              <span className="text-ink">.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-paper/85">
              For traders, analysts, and the merely curious. One email,
              every market morning.
            </p>
            <div className="mt-9 flex justify-center">
              <MagneticButton
                href="/subscribe"
                variant="ink"
                className="px-8 py-3.5 text-[13px]"
              >
                Subscribe free →
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
