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

export default async function Home() {
  const bucket = await getBucket();

  return (
    <>
      <AbBeacon bucket={bucket} />
      <TickerBar />
      <SiteNav />
      <main className="flex-1">
        <Hero ctaLabel={pick("heroCta", bucket)} />
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
