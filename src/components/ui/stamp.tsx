"use client";

import { cn } from "@/lib/utils";

/**
 * Stamp - a slowly rotating circular text badge with a centre glyph. A bit of
 * editorial "fun" (think a press stamp / seal). Pure CSS rotation.
 */
export function Stamp({
  text = "FREE · DAILY · NO GATEKEEPING · ",
  glyph = "↓",
  className,
  accent = "bg-electric text-paper",
}: {
  text?: string;
  glyph?: string;
  className?: string;
  accent?: string;
}) {
  const chars = text.split("");
  const step = 360 / chars.length;

  return (
    <div
      className={cn(
        "relative grid h-28 w-28 place-items-center rounded-full",
        accent,
        className
      )}
    >
      <div className="absolute inset-0 animate-spin-slow">
        {chars.map((c, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{
              transform: `rotate(${i * step}deg) translateY(-46px)`,
              transformOrigin: "0 0",
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <span className="text-2xl leading-none">{glyph}</span>
    </div>
  );
}
