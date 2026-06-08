import { NextResponse } from "next/server";

/**
 * GET /api/ticker - live market snapshot for the top ticker.
 *
 * Strategy (resilient by design - a ticker must NEVER render broken):
 *   • Crypto  → CoinGecko (keyless, reliable, one batched request)         = live now
 *   • Macro   → Yahoo chart endpoint, fetched SEQUENTIALLY (bursts get 429) = live in prod
 *   • Optional MARKET_DATA_API_KEY (Twelve Data) for reliable macro at scale
 *   • Any symbol that fails falls back to a curated last-known value
 *
 * Cached 30s server-side (shared across all clients) so we stay gentle on the
 * upstreams. The client polls this; the curated SEED ships as the first paint.
 */

export const revalidate = 30;

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
      { headers: { Accept: "application/json" }, next: { revalidate: 30 } }
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

// ── Macro via Yahoo (sequential, best-effort) ─────────────────────────────
type Macro = {
  label: string;
  symbol: string;
  decimals: number;
  prefix?: string;
  suffix?: string;
  fb: { v: number; c: number };
};

const MACRO: Macro[] = [
  { label: "S&P 500", symbol: "^GSPC", decimals: 0, fb: { v: 5431, c: 0.34 } },
  { label: "Nasdaq", symbol: "^IXIC", decimals: 0, fb: { v: 19004, c: 0.61 } },
  { label: "Dow", symbol: "^DJI", decimals: 0, fb: { v: 38778, c: -0.41 } },
  { label: "WTI", symbol: "CL=F", decimals: 2, prefix: "$", fb: { v: 71.2, c: -2.1 } },
  { label: "Brent", symbol: "BZ=F", decimals: 2, prefix: "$", fb: { v: 74.65, c: -1.88 } },
  { label: "Gold", symbol: "GC=F", decimals: 0, prefix: "$", fb: { v: 2331, c: 0.3 } },
  { label: "Nat Gas", symbol: "NG=F", decimals: 2, prefix: "$", fb: { v: 2.85, c: 1.2 } },
  { label: "US 10Y", symbol: "^TNX", decimals: 2, suffix: "%", fb: { v: 4.28, c: -0.7 } },
  { label: "DXY", symbol: "DX-Y.NYB", decimals: 2, fb: { v: 104.6, c: 0.21 } },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function macroTicks(): Promise<Tick[]> {
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
          next: { revalidate: 30 },
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
    out.push(
      done ??
        tick(m.label, m.fb.v, m.fb.c, m.decimals, false, m.prefix, m.suffix)
    );
    await sleep(120); // be gentle - avoid Yahoo's burst rate limit
  }
  return out;
}

export async function GET() {
  const [crypto, macro] = await Promise.all([cryptoTicks(), macroTicks()]);
  // interleave a little so crypto isn't all clumped at the end
  const ticks: Tick[] = [
    macro[0], macro[1], macro[2], // indices
    macro[3], macro[4], macro[5], macro[6], // energy + metals
    crypto[0], crypto[1], crypto[2], // crypto
    macro[7], macro[8], // rates + dollar
  ].filter(Boolean);

  return NextResponse.json(
    { ticks, liveCount: ticks.filter((t) => t.live).length, asOf: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
  );
}
