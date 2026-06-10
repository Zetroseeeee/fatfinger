import { TickerBar } from "@/components/sections/ticker-bar";
import { SiteNav } from "@/components/sections/site-nav";
import { Hero } from "@/components/sections/hero";
import { Bento } from "@/components/sections/bento";
import { Showcase } from "@/components/sections/showcase";
import { ChartOfDay } from "@/components/sections/chart-of-day";
import { CtaBand } from "@/components/sections/cta-band";
import { Newsletter } from "@/components/sections/newsletter";
import { SiteFooter } from "@/components/sections/site-footer";
import { AbBeacon } from "@/components/ab/ab-beacon";
import { getBucket, pick } from "@/lib/ab";
import { setting } from "@/lib/settings";

export default async function Home() {
  const bucket = await getBucket();
  // admin override wins; otherwise the A/B test picks the label
  const override = await setting("heroCtaOverride", "");
  const ctaLabel = override.trim() ? override : pick("heroCta", bucket);

  return (
    <>
      <AbBeacon bucket={bucket} />
      <TickerBar />
      <SiteNav />
      <main className="flex-1">
        <Hero ctaLabel={ctaLabel} />
        <Bento />
        <Showcase />
        <ChartOfDay />
        <CtaBand />
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
