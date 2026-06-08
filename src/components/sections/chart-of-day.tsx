import { LazyFatFingerChart as FatFingerChart } from "@/components/charts/lazy-fat-finger-chart";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Reveal } from "@/components/ui/reveal";

/**
 * Section - CHART OF THE DAY (site teaser)
 * Shows the themed <FatFingerChart> on the paper page: dark terminal panels
 * where red highlights only the one thing the story is about. Illustrative data.
 */
export function ChartOfDay() {
  return (
    <section id="chart" className="relative border-t border-ink/15 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-12 max-w-3xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-signal">
            Chart of the day
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.92] text-ink">
            One chart. One point.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
            Refined terminal, not Excel. Everything stays muted except the one
            thing the story is about, so your eye goes straight to it.
          </p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <FatFingerChart
              type="area"
              title="Brent crude, last 12 sessions"
              take="The barrels were symbolic. The selloff wasn't."
              source="SOURCE: ICE Brent front-month · illustrative"
              xKey="d"
              yKey="px"
              highlightIndex={11}
              markerLabel="$74.65 post-OPEC"
              valuePrefix="$"
              valueDecimals={0}
              data={[
                { d: "May 22", px: 79.1 },
                { d: "May 23", px: 78.6 },
                { d: "May 27", px: 78.9 },
                { d: "May 28", px: 77.8 },
                { d: "May 29", px: 78.2 },
                { d: "May 30", px: 77.1 },
                { d: "Jun 2", px: 76.9 },
                { d: "Jun 3", px: 77.4 },
                { d: "Jun 4", px: 76.2 },
                { d: "Jun 5", px: 76.0 },
                { d: "Jun 6", px: 75.3 },
                { d: "Jun 8", px: 74.65 },
              ]}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <FatFingerChart
              type="bar"
              title="Hyperscaler AI infra spend / month"
              take="Compute is the new oil, and even Google is renting it."
              source="SOURCE: filings + estimates · illustrative"
              xKey="co"
              yKey="spend"
              highlightIndex={3}
              valuePrefix="$"
              valueSuffix="M"
              data={[
                { co: "Cloud A", spend: 540 },
                { co: "Cloud B", spend: 610 },
                { co: "Cloud C", spend: 480 },
                { co: "Google", spend: 920 },
                { co: "Cloud D", spend: 350 },
              ]}
            />
          </Reveal>
        </div>

        <div className="mt-10">
          <MagneticButton href="/issues" variant="ghost">
            See it in a full issue →
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
