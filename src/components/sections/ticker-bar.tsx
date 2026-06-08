"use client";

import { useEffect, useState } from "react";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

/**
 * Section 1 - TICKER BAR
 * A solid ink band running edge to edge (high contrast against the paper page).
 * LIVE prices from /api/ticker (Yahoo, cached 30s), polled client-side. The
 * curated set below is the initial paint + fallback, so it never renders broken.
 * ▲ green = up, ▼ red = down.
 */

type Tick = { sym: string; px: string; chg: string; dir: "up" | "down" };

// initial paint / fallback (matches the API's symbol set + fallbacks)
const SEED: Tick[] = [
  { sym: "S&P 500", px: "5,431", chg: "+0.34%", dir: "up" },
  { sym: "Nasdaq", px: "19,004", chg: "+0.61%", dir: "up" },
  { sym: "Dow", px: "38,778", chg: "-0.41%", dir: "down" },
  { sym: "WTI", px: "$71.20", chg: "-2.10%", dir: "down" },
  { sym: "Brent", px: "$74.65", chg: "-1.88%", dir: "down" },
  { sym: "Gold", px: "$2,331", chg: "+0.30%", dir: "up" },
  { sym: "Nat Gas", px: "$2.85", chg: "+1.20%", dir: "up" },
  { sym: "BTC", px: "$63,800", chg: "+2.50%", dir: "up" },
  { sym: "ETH", px: "$1,686", chg: "+3.10%", dir: "up" },
  { sym: "US 10Y", px: "4.28%", chg: "-0.70%", dir: "down" },
  { sym: "DXY", px: "104.60", chg: "+0.21%", dir: "up" },
];

function TickItem({ t }: { t: Tick }) {
  const up = t.dir === "up";
  return (
    <div className="flex items-center gap-2 px-5 font-mono text-[12px] tracking-tight">
      <span className="font-semibold text-paper">{t.sym}</span>
      <span className="text-paper/55">{t.px}</span>
      <span className={cn("tabular-nums", up ? "text-up" : "text-signal")}>
        {up ? "▲" : "▼"} {t.chg}
      </span>
      <span className="text-paper/20">/</span>
    </div>
  );
}

export function TickerBar() {
  const [ticks, setTicks] = useState<Tick[]>(SEED);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/ticker", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !Array.isArray(data?.ticks)) return;
        setTicks(
          data.ticks.map(
            (t: { label: string; value: string; chg: string; dir: "up" | "down" }) => ({
              sym: t.label,
              px: t.value,
              chg: t.chg,
              dir: t.dir,
            })
          )
        );
        setIsLive((data.liveCount ?? 0) > 0);
      } catch {
        /* keep the seed/last good values */
      }
    }
    load();
    const id = setInterval(load, 45_000); // poll every 45s
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="relative w-full bg-ink py-2.5">
      <Marquee duration={55} gap={0} pauseOnHover>
        {ticks.map((t, i) => (
          <TickItem key={`${t.sym}-${i}`} t={t} />
        ))}
      </Marquee>
      {/* faded ink edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-ink to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-30 flex items-center gap-1.5 bg-gradient-to-l from-ink via-ink to-transparent pl-8 pr-5"
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isLive ? "animate-pulse bg-up" : "bg-paper/30"
          )}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">
          {isLive ? "Live" : "Mkt"}
        </span>
      </div>
    </div>
  );
}
