import { NextResponse } from "next/server";

/**
 * GET /api/ticker - daily (end-of-day) market snapshot for the top ticker.
 *
 * Strategy (resilient by design - a ticker must NEVER render broken):
 *   • Crypto  → CoinGecko (keyless, batched)
 *   • Macro   → Twelve Data ETF proxies when MARKET_DATA_API_KEY is set,
 *               else Yahoo (works locally; datacenter IPs get 429'd)
 *   • Any symbol that fails falls back to a curated last-known value
 *
 * Refreshed once a day (end-of-day snapshot), not live, so we stay well within
 * every free-tier limit. The curated SEED ships as the first paint.
 */

export const revalidate = 86400;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

type Tick = {
  label: string;
  value: string;
  chg: string;
  dir: "up" | "down";
  live: boolean;
};

function fmt(value: number, decimals: number, prefix = "", suffix = "") {
  return `${prefix}${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

function tick(
  label: string,
  value: number,
  chgPct: number,
  decimals: number,
  live: boolean,
  prefix = "",
  suffix = ""
): Tick {
  return {
    label,
    value: fmt(value, decimals, prefix, suffix),
    chg: `${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}%`,
    dir: chgPct >= 0 ? "up" : "down",
    live,
  };
}

// ── Crypto via CoinGecko (keyless, batched) ───────────────────────────────
const COINS = [
  { id: "bitcoin", label: "BTC", decimals: 0 },
  { id: "ethereum", label: "ETH", decimals: 0 },
  { id: "solana", label: "SOL", decimals: 2 },
];

async function cryptoTicks(): Promise<Tick[]> {
  const fallback: Tick[] = [
    tick("BTC", 63800, 2.5, 0, false, "$"),
    tick("ETH", 1686, 3.1, 0, false, "$"),
    tick("SOL", 142.3, 4.2, 2, false, "$"),
  ];
  try {
    const ids = COINS.map((c) => c.id).join(",");
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { headers: { Accept: "application/json" }, next: { revalidate: 86400 } }
    );
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    return COINS.map((c, i) => {
      const px = j?.[c.id]?.usd;
      const chg = j?.[c.id]?.usd_24h_change;
      if (typeof px !== "number" || typeof chg !== "number") return fallback[i];
      return tick(c.label, px, chg, c.decimals, true, "$");
    });
  } catch {
    return fallback;
  }
}

// ── Macro symbols (Yahoo symbol + Twelve Data symbol + curated fallback) ──
type Macro = {
  label: string;
  symbol: string; // Yahoo
  td: string; // Twelve Data
  decimals: number;
  prefix?: string;
  suffix?: string;
  fb: { v: number; c: number };
};

// Liquid ETF proxies - real traded instruments, live on Twelve Data's free
// tier (indices/commodities themselves are paid-only). SPY=S&P 500, QQQ=Nasdaq
// 100, USO=WTI oil, BNO=Brent, GLD=gold, UNG=nat gas, UUP=US dollar. Yahoo and
// Twelve Data share the same ticker for ETFs.
const MACRO: Macro[] = [
  { label: "SPY", symbol: "SPY", td: "SPY", decimals: 2, prefix: "$", fb: { v: 744.99, c: 1.01 } },
  { label: "QQQ", symbol: "QQQ", td: "QQQ", decimals: 2, prefix: "$", fb: { v: 722.65, c: 2.49 } },
  { label: "USO", symbol: "USO", td: "USO", decimals: 2, prefix: "$", fb: { v: 135.36, c: 1.76 } },
  { label: "BNO", symbol: "BNO", td: "BNO", decimals: 2, prefix: "$", fb: { v: 52.15, c: 1.86 } },
  { label: "GLD", symbol: "GLD", td: "GLD", decimals: 2, prefix: "$", fb: { v: 397.84, c: 0.4 } },
  { label: "UNG", symbol: "UNG", td: "UNG", decimals: 2, prefix: "$", fb: { v: 11.28, c: -3.38 } },
  { label: "UUP", symbol: "UUP", td: "UUP", decimals: 2, prefix: "$", fb: { v: 28.0, c: -0.07 } },
];

const macroFb = (m: Macro) =>
  tick(m.label, m.fb.v, m.fb.c, m.decimals, false, m.prefix, m.suffix);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Macro via Twelve Data (keyed, batched, works from datacenter IPs) ──────
// Free key (800 req/day, 8/min) at twelvedata.com. One request for all symbols.
async function twelveDataMacro(key: string): Promise<Tick[]> {
  try {
    const syms = MACRO.map((m) => m.td).join(",");
    const r = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
        syms
      )}&apikey=${key}`,
      // once-a-day fetch: ~7 Twelve Data credits/day, trivially within the free tier.
      { next: { revalidate: 86400 } }
    );
    if (!r.ok) return MACRO.map(macroFb);
    const j = await r.json();
    // batch → { "GSPC": {...}, ... }; single symbol → the quote object itself
    return MACRO.map((m) => {
      const q = j?.[m.td] ?? (j?.symbol === m.td ? j : null);
      const price = q ? parseFloat(q.close) : NaN;
      const chg = q ? parseFloat(q.percent_change) : NaN;
      if (!q || Number.isNaN(price) || Number.isNaN(chg)) return macroFb(m);
      return tick(m.label, price, chg, m.decimals, true, m.prefix, m.suffix);
    });
  } catch {
    return MACRO.map(macroFb);
  }
}

// ── Macro via Yahoo (keyless, sequential, blocked on most datacenter IPs) ──
async function yahooMacro(): Promise<Tick[]> {
  const out: Tick[] = [];
  for (const m of MACRO) {
    let done: Tick | null = null;
    try {
      const r = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
          m.symbol
        )}?range=1d&interval=1d`,
        {
          headers: { "User-Agent": UA, Accept: "application/json" },
          next: { revalidate: 86400 },
        }
      );
      if (r.ok) {
        const j = await r.json();
        const meta = j?.chart?.result?.[0]?.meta;
        const px = meta?.regularMarketPrice;
        const prev = meta?.chartPreviousClose ?? meta?.previousClose;
        if (typeof px === "number" && typeof prev === "number" && prev) {
          done = tick(
            m.label,
            px,
            ((px - prev) / prev) * 100,
            m.decimals,
            true,
            m.prefix,
            m.suffix
          );
        }
      }
    } catch {
      /* fall through to fallback */
    }
    out.push(done ?? macroFb(m));
    await sleep(120); // be gentle - avoid Yahoo's burst rate limit
  }
  return out;
}

export async function GET() {
  // Prefer the keyed feed (reliable in prod); fall back to Yahoo (works locally).
  const key = process.env.MARKET_DATA_API_KEY;
  const [crypto, macro] = await Promise.all([
    cryptoTicks(),
    key ? twelveDataMacro(key) : yahooMacro(),
  ]);
  // interleave so crypto isn't clumped; lead with equities, energy up front
  const ticks: Tick[] = [
    macro[0], macro[1], // SPY, QQQ
    macro[2], macro[3], macro[5], // USO, BNO, UNG (energy)
    macro[4], // GLD
    crypto[0], crypto[1], crypto[2], // BTC, ETH, SOL
    macro[6], // UUP
  ].filter(Boolean);

  return NextResponse.json(
    { ticks, liveCount: ticks.filter((t) => t.live).length, asOf: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" } }
  );
}
