import type { FatFingerChartProps } from "@/components/charts/fat-finger-chart";
import { normalizeChart, withContextMA, type RawChart } from "./chart-gen";

/**
 * Real market data for the chart generator (Twelve Data /time_series).
 *
 * This is the "proper analysis and generation" layer: instead of the model
 * fabricating chart points, we pull REAL daily price series and build the chart
 * from them, then layer on real technical analysis (the move, a moving-average
 * context line). The model only chooses the instrument and writes the take.
 *
 * Free tier covers stocks, FX, crypto and ETFs, so energy/macro is charted via
 * liquid ETF proxies (indices/commodities themselves are paid-only). Daily
 * cache; everything degrades to null so the engine falls back to an illustrative
 * chart rather than ever rendering broken.
 */

export type SeriesPoint = { date: string; close: number };

/** instrument key the engine can name -> Twelve Data symbol + display + format */
export const SYMBOLS: Record<
  string,
  { td: string; label: string; prefix: string; decimals: number }
> = {
  // Energy/macro are charted via liquid ETF proxies, so the ticker is shown in
  // the label (the chart is the ETF's real price, which tracks the move, not the
  // commodity's absolute level). Crypto is the real spot price.
  BRENT: { td: "BNO", label: "Brent crude · BNO", prefix: "$", decimals: 2 },
  WTI: { td: "USO", label: "WTI crude · USO", prefix: "$", decimals: 2 },
  NATGAS: { td: "UNG", label: "US nat gas · UNG", prefix: "$", decimals: 2 },
  GOLD: { td: "GLD", label: "Gold · GLD", prefix: "$", decimals: 2 },
  SP500: { td: "SPY", label: "S&P 500 · SPY", prefix: "$", decimals: 2 },
  NASDAQ: { td: "QQQ", label: "Nasdaq 100 · QQQ", prefix: "$", decimals: 2 },
  DOLLAR: { td: "UUP", label: "US dollar · UUP", prefix: "$", decimals: 2 },
  BTC: { td: "BTC/USD", label: "Bitcoin", prefix: "$", decimals: 0 },
  ETH: { td: "ETH/USD", label: "Ethereum", prefix: "$", decimals: 0 },
};

/** Pull a real daily close series (oldest -> newest). Null on any failure. */
export async function fetchDailySeries(
  symbol: string,
  outputsize = 14
): Promise<SeriesPoint[] | null> {
  const key = process.env.MARKET_DATA_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
        symbol
      )}&interval=1day&outputsize=${outputsize}&apikey=${key}`,
      { next: { revalidate: 86400 } } as RequestInit
    );
    if (!r.ok) return null;
    const j = await r.json();
    if (j?.status !== "ok" || !Array.isArray(j.values)) return null;
    const points: SeriesPoint[] = j.values
      .map((v: { datetime: string; close: string }) => ({
        date: String(v.datetime),
        close: Number(v.close),
      }))
      .filter((p: SeriesPoint) => Number.isFinite(p.close))
      .reverse(); // Twelve Data returns newest-first; we want oldest-first
    return points.length >= 4 ? points : null;
  } catch {
    return null;
  }
}

/** "2026-06-08" -> "Jun 8" for a clean x-axis */
function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const mon = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][m - 1];
  return `${mon} ${d}`;
}

/**
 * Build a REAL chart for an instrument the engine named. Pulls live history,
 * runs it through the generator (correct highlight, marker, move-in-title), and
 * layers a moving-average context line. Returns null if the symbol is unknown or
 * the data fetch fails, so the caller falls back to the model's illustrative chart.
 */
export async function buildMarketChart(
  symbolKey: string,
  meta: { take: string; source?: string }
): Promise<FatFingerChartProps | null> {
  const sym = SYMBOLS[symbolKey?.toUpperCase?.()];
  if (!sym) return null;

  const series = await fetchDailySeries(sym.td, 14);
  if (!series) return null;

  const raw: RawChart = {
    type: "area",
    title: sym.label, // generator appends the real move, e.g. "(down 2%)"
    take: meta.take,
    source: meta.source?.trim()
      ? meta.source
      : `SOURCE: Twelve Data (${sym.td}), daily close`,
    valuePrefix: sym.prefix,
    valueDecimals: sym.decimals,
    highlightIndex: series.length - 1, // the latest print
    data: series.map((p) => ({ x: shortDate(p.date), y: p.close })),
  };

  return withContextMA(normalizeChart(raw), 4);
}
