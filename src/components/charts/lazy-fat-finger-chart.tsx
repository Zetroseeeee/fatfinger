"use client";

import dynamic from "next/dynamic";
import type { FatFingerChartProps } from "./fat-finger-chart";

/**
 * LazyFatFingerChart - code-splits Recharts out of the initial bundle. Charts
 * are below the fold and client-only viz, so they load on demand with a themed
 * skeleton. Big first-load win (Recharts is heavy).
 */
const Chart = dynamic(
  () => import("./fat-finger-chart").then((m) => m.FatFingerChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="ff-chart animate-pulse rounded-2xl border border-white/10 p-5"
        style={{ background: "#0f1115", height: 360 }}
        aria-hidden
      />
    ),
  }
);

export function LazyFatFingerChart(props: FatFingerChartProps) {
  return <Chart {...props} />;
}
