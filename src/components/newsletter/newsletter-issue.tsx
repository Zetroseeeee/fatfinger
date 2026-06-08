import { FatFingerChart } from "@/components/charts/fat-finger-chart";
import type { Issue } from "@/content/issues";

/**
 * NewsletterIssue - the dark, mobile-first Fat Finger brief template
 * (EDITORIAL.md §5). Renders one issue end to end:
 * Masthead → The Tape → The Big Slip → The Desk → Energy Desk →
 * Fat Finger of the Day → Chart of the Day → Sign-off → footer.
 *
 * Dark #0a0b0d, off-white text, red ONLY for emphasis and ▼. Anton section
 * headers, Poppins body, IBM Plex Mono for every number/label.
 */

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-5 mt-12 flex items-center gap-3">
      <span className="font-mono text-[11px] text-signal">{index}</span>
      <h2 className="font-display text-2xl uppercase leading-none tracking-tight text-[#f5f5f6] sm:text-[1.7rem]">
        {title}
      </h2>
      <span className="ml-1 h-px flex-1 bg-white/10" />
    </div>
  );
}

function Take({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 border-l-2 border-signal pl-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
        The take
      </p>
      <p className="mt-1 text-[15px] font-medium leading-snug text-[#f5f5f6]">
        {children}
      </p>
    </div>
  );
}

function Source({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b9099]">
      {children}
    </p>
  );
}

export function NewsletterIssue({ issue }: { issue: Issue }) {
  return (
    <article className="mx-auto w-full max-w-xl bg-[#0a0b0d] px-5 py-8 text-[#f5f5f6] sm:px-8 sm:py-10">
      {/* 1 - MASTHEAD */}
      <header className="border-b border-white/10 pb-6">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-body text-2xl font-bold lowercase tracking-[-0.03em] text-[#f5f5f6]">
            fatfinger<span className="text-signal">.</span>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8b9099]">
            {issue.date}
          </span>
        </div>
        <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.16em] text-[#8b9099]">
          Market mood:{" "}
          <span className="text-[#f5f5f6]">{issue.mood}</span>
        </p>
      </header>

      {/* 2 - THE TAPE */}
      <SectionHeader index="01" title="The Tape" />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2">
        {issue.tape.map((t) => {
          const up = t.dir === "up";
          return (
            <div
              key={t.label}
              className="flex items-baseline justify-between gap-2 bg-[#0a0b0d] px-3 py-2.5"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#8b9099]">
                {t.label}
              </span>
              <span className="flex items-baseline gap-1.5 font-mono text-[12px] tabular-nums">
                <span className="text-[#f5f5f6]">{t.value}</span>
                <span className={up ? "text-[#f5f5f6]" : "text-signal"}>
                  {up ? "▲" : "▼"} {t.chg}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* 3 - THE BIG SLIP */}
      <SectionHeader index="02" title="The Big Slip" />
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
        {issue.bigSlip.kicker}
      </p>
      <h3 className="mt-2 font-display text-[clamp(1.7rem,6vw,2.4rem)] uppercase leading-[0.95] text-[#f5f5f6]">
        {issue.bigSlip.headline}
      </h3>
      <div className="mt-4 space-y-3">
        {issue.bigSlip.paragraphs.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-[#d8d9dc]">
            {p}
          </p>
        ))}
      </div>
      <Take>{issue.bigSlip.take}</Take>
      <Source>{issue.bigSlip.source}</Source>

      {/* 4 - THE DESK */}
      <SectionHeader index="03" title="The Desk" />
      <ul className="space-y-4">
        {issue.desk.map((d, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
            <div>
              <p className="text-[15px] font-medium leading-snug text-[#f5f5f6]">
                {d.headline}
              </p>
              <p className="mt-0.5 text-[14px] leading-snug text-[#8b9099]">
                {d.take}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* 5 - ENERGY DESK (signature) */}
      <div className="mb-5 mt-12 flex items-center gap-3">
        <span className="font-mono text-[11px] text-signal">04</span>
        <h2 className="font-display text-2xl uppercase leading-none tracking-tight text-[#f5f5f6] sm:text-[1.7rem]">
          Energy Desk
        </h2>
        <span className="rounded-full border border-signal/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-signal">
          our beat
        </span>
        <span className="ml-1 h-px flex-1 bg-white/10" />
      </div>
      <div className="space-y-7">
        {issue.energy.map((e, i) => (
          <div key={i}>
            <h4 className="font-display text-lg uppercase leading-tight text-[#f5f5f6]">
              {e.headline}
            </h4>
            <p className="mt-2 text-[15px] leading-relaxed text-[#d8d9dc]">
              {e.body}
            </p>
            <Take>{e.take}</Take>
            <Source>{e.source}</Source>
          </div>
        ))}
      </div>

      {/* 6 - FAT FINGER OF THE DAY */}
      <SectionHeader index="05" title="Fat Finger of the Day" />
      <div className="rounded-xl border border-signal/30 bg-signal/[0.06] p-5">
        <h4 className="font-display text-xl uppercase leading-tight text-[#f5f5f6]">
          {issue.fatFinger.headline}
        </h4>
        <p className="mt-2 text-[15px] leading-relaxed text-[#d8d9dc]">
          {issue.fatFinger.body}
        </p>
        <Take>{issue.fatFinger.take}</Take>
        <Source>{issue.fatFinger.source}</Source>
      </div>

      {/* 7 - CHART OF THE DAY */}
      <SectionHeader index="06" title="Chart of the Day" />
      <FatFingerChart {...issue.chart} />

      {/* 8 - SIGN-OFF */}
      <div className="mt-12 border-t border-white/10 pt-7 text-center">
        <p className="mx-auto max-w-md text-[15px] leading-relaxed text-[#d8d9dc]">
          {issue.signOff}
        </p>
        <a
          href="https://fatfinger.news"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-signal px-7 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-[#f5f5f6] transition-transform hover:-translate-y-0.5"
        >
          Subscribe free →
        </a>
      </div>

      {/* footer */}
      <footer className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-center">
        <span className="font-body text-lg font-bold lowercase tracking-[-0.03em] text-[#f5f5f6]">
          fatfinger<span className="text-signal">.</span>
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8b9099]">
          Not investment advice. · Illustrative data only.
        </p>
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8b9099]">
          <a className="hover:text-[#f5f5f6]" href="#">
            X / @fatfinger
          </a>
          <a className="hover:text-[#f5f5f6]" href="#">
            Instagram
          </a>
          <a className="hover:text-[#f5f5f6]" href="#">
            LinkedIn
          </a>
        </div>
      </footer>
    </article>
  );
}
