"use client";

import { useEffect, useRef, useState } from "react";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

/**
 * Section 1 - TICKER BAR
 * Ink band, edge to edge. Prices are LIVE:
 *   - Crypto (BTC/ETH/SOL): real-time via Binance WebSocket, updates by the
 *     second; every change flashes green/red.
 *   - ETFs (SPY/QQQ/USO/BNO/UNG/GLD/UUP): from /api/ticker (Twelve Data),
 *     polled. The curated SEED is the first paint + fallback so it never breaks.
 * ▲ green = up, ▼ red = down.
 */

type Tick = { sym: string; px: string; chg: string; dir: "up" | "down" };

const SEED: Tick[] = [
  { sym: "SPY", px: "$744.99", chg: "+1.01%", dir: "up" },
  { sym: "QQQ", px: "$722.65", chg: "+2.49%", dir: "up" },
  { sym: "USO", px: "$135.36", chg: "+1.76%", dir: "up" },
  { sym: "BNO", px: "$52.15", chg: "+1.86%", dir: "up" },
  { sym: "UNG", px: "$11.28", chg: "-3.38%", dir: "down" },
  { sym: "GLD", px: "$397.84", chg: "+0.40%", dir: "up" },
  { sym: "BTC", px: "$63,800", chg: "+2.50%", dir: "up" },
  { sym: "ETH", px: "$1,686", chg: "+3.10%", dir: "up" },
  { sym: "SOL", px: "$67.03", chg: "+3.46%", dir: "up" },
  { sym: "UUP", px: "$28.00", chg: "-0.07%", dir: "down" },
];

// Binance stream symbol -> our label + price decimals
const CRYPTO: Record<string, { sym: string; dp: number }> = {
  btcusdt: { sym: "BTC", dp: 0 },
  ethusdt: { sym: "ETH", dp: 0 },
  solusdt: { sym: "SOL", dp: 2 },
};

function money(n: number, dp: number) {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })}`;
}

function TickItem({ t }: { t: Tick }) {
  const up = t.dir === "up";
  const prev = useRef(t.px);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (t.px === prev.current) return;
    // numeric compare for the flash direction
    const a = parseFloat(prev.current.replace(/[^0-9.-]/g, ""));
    const b = parseFloat(t.px.replace(/[^0-9.-]/g, ""));
    setFlash(b >= a ? "up" : "down");
    prev.current = t.px;
    const id = setTimeout(() => setFlash(null), 650);
    return () => clearTimeout(id);
  }, [t.px]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded px-5 py-0.5 font-mono text-[12px] tracking-tight transition-colors duration-500",
        flash === "up" && "bg-up/15",
        flash === "down" && "bg-signal/15"
      )}
    >
      <span className="font-semibold text-paper">{t.sym}</span>
      <span className="text-paper/55 tabular-nums">{t.px}</span>
      <span className={cn("tabular-nums", up ? "text-up" : "text-signal")}>
        {up ? "▲" : "▼"} {t.chg}
      </span>
      <span className="text-paper/20">/</span>
    </div>
  );
}

export function TickerBar() {
  const [ticks, setTicks] = useState<Tick[]>(SEED);
  const [live, setLive] = useState(false);
  // real-time crypto overrides, keyed by label (BTC/ETH/SOL)
  const crypto = useRef<Record<string, Tick>>({});

  // ETF + fallback feed (polled)
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/ticker", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !Array.isArray(data?.ticks)) return;
        setTicks((prev) => {
          const next: Tick[] = data.ticks.map(
            (t: { label: string; value: string; chg: string; dir: "up" | "down" }) => {
              const c = crypto.current[t.label];
              return c ?? { sym: t.label, px: t.value, chg: t.chg, dir: t.dir };
            }
          );
          return next.length ? next : prev;
        });
        setLive((data.liveCount ?? 0) > 0);
      } catch {
        /* keep last good */
      }
    }
    load();
    const id = setInterval(load, 45_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // real-time crypto via Binance WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const streams = Object.keys(CRYPTO)
      .map((s) => `${s}@ticker`)
      .join("/");

    function connect() {
      try {
        ws = new WebSocket(
          `wss://stream.binance.com:9443/stream?streams=${streams}`
        );
      } catch {
        return;
      }
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          const d = msg?.data;
          const key = d?.s?.toLowerCase();
          const meta = key && CRYPTO[key];
          if (!meta) return;
          const price = parseFloat(d.c);
          const chg = parseFloat(d.P);
          if (Number.isNaN(price) || Number.isNaN(chg)) return;
          const t: Tick = {
            sym: meta.sym,
            px: money(price, meta.dp),
            chg: `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`,
            dir: chg >= 0 ? "up" : "down",
          };
          crypto.current[meta.sym] = t;
          setLive(true);
          setTicks((prev) =>
            prev.map((x) => (x.sym === meta.sym ? t : x))
          );
        } catch {
          /* ignore frame */
        }
      };
      ws.onclose = () => {
        if (!closed) retry = setTimeout(connect, 4000);
      };
      ws.onerror = () => ws?.close();
    }
    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, []);

  return (
    <div className="relative w-full bg-ink py-2">
      <Marquee duration={55} gap={0} pauseOnHover>
        {ticks.map((t, i) => (
          <TickItem key={`${t.sym}-${i}`} t={t} />
        ))}
      </Marquee>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-ink to-transparent sm:w-24"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-30 flex items-center gap-1.5 bg-gradient-to-l from-ink via-ink to-transparent pl-8 pr-4 sm:pr-5"
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            live ? "animate-pulse bg-up" : "bg-paper/30"
          )}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">
          {live ? "Live" : "Mkt"}
        </span>
      </div>
    </div>
  );
}
