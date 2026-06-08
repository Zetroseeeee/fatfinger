"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * TerminalAnimation - a small dark "tape feed" that types itself in once on
 * screen. Sits as a dark ink block inside the paper brief cards for contrast.
 */
type Line = { text: string; tone?: "muted" | "signal" | "up" | "paper" };

export function TerminalAnimation({
  lines,
  className,
}: {
  lines: Line[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 440);
    return () => clearTimeout(t);
  }, [inView, shown, lines.length]);

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border-2 border-ink bg-ink p-4 font-mono text-[11px] leading-relaxed text-paper",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-signal" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f5b301]" />
        <span className="h-2.5 w-2.5 rounded-full bg-up" />
        <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-paper/50">
          tape · live
        </span>
      </div>
      <div className="space-y-1">
        {lines.slice(0, shown).map((l, i) => (
          <div
            key={i}
            className={cn(
              l.tone === "signal" && "text-signal",
              l.tone === "up" && "text-up",
              l.tone === "paper" && "text-paper",
              (!l.tone || l.tone === "muted") && "text-paper/55"
            )}
          >
            <span className="text-up">$ </span>
            {l.text}
          </div>
        ))}
        {shown < lines.length && (
          <span className="inline-block h-3 w-1.5 animate-pulse bg-up align-middle" />
        )}
      </div>
    </div>
  );
}
