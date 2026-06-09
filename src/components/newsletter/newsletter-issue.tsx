import { LazyFatFingerChart as FatFingerChart } from "@/components/charts/lazy-fat-finger-chart";
import type { Issue } from "@/content/issues";

/**
 * NewsletterIssue - the dark Fat Finger brief, redesigned to read like a sharp
 * markets magazine, not a wall of text (EDITORIAL.md §5):
 *   masthead + standfirst + byline -> The Tape -> The Big Slip (drop cap) ->
 *   The Desk (numbered) -> Energy Desk -> Fat Finger of the Day -> Chart -> sign-off.
 *
 * Dark #0a0b0d, off-white text, red ONLY for emphasis and the take. Anton
 * section headers, Poppins body, IBM Plex Mono for every number/label. The page
 * supplies the dark background + centered column; this is just the content.
 */

function readingMinutes(issue: Issue): number {
  const text = [
    ...issue.bigSlip.paragraphs,
    issue.bigSlip.headline,
    ...issue.desk.flatMap((d) => [d.headline, d.take]),
    ...issue.energy.flatMap((e) => [e.headline, e.body, e.take]),
    issue.fatFinger.headline,
    issue.fatFinger.body,
    issue.signOff,
  ].join(" ");
  return Math.max(2, Math.round(text.trim().split(/\s+/).length / 200));
}

function SectionHeader({
  index,
  title,
  badge,
}: {
  index: string;
  title: string;
  badge?: string;
}) {
  return (
    <div className="mb-6 mt-14 flex items-center gap-3">
      <span className="font-mono text-[12px] font-medium text-signal">{index}</span>
      <h2 className="font-display text-[1.7rem] uppercase leading-none tracking-tight text-[#f5f5f6] sm:text-[2rem]">
        {title}
      </h2>
      {badge ? (
        <span className="rounded-full border border-signal/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-signal">
          {badge}
        </span>
      ) : null}
      <span className="ml-1 h-px flex-1 bg-white/10" />
    </div>
  );
}

function Take({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 border-l-[3px] border-signal pl-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
        The take
      </p>
      <p className="mt-1.5 text-[17px] font-medium italic leading-snug text-[#f5f5f6]">
        {children}
      </p>
    </div>
  );
}

function Source({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7c8088]">
      {children}
    </p>
  );
}

export function NewsletterIssue({ issue }: { issue: Issue }) {
  const mins = readingMinutes(issue);

  return (
    <article className="w-full">
      {/* 1 - MASTHEAD + STANDFIRST */}
      <header className="border-b border-white/10 pb-8">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-body text-2xl font-bold lowercase tracking-[-0.03em] text-[#f5f5f6]">
            fatfinger<span className="text-signal">.</span>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8b9099]">
            {issue.date}
          </span>
        </div>

        {/* the standfirst - a magazine intro line, sets up the issue */}
        <p className="mt-7 text-balance text-[20px] leading-snug text-[#e8e9ec] sm:text-[23px]">
          {issue.preview}
        </p>

        {/* byline / meta */}
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8b9099]">
          <span>By the Fat Finger desk</span>
          <span className="text-white/20">·</span>
          <span>{mins} min read</span>
          <span className="text-white/20">·</span>
          <span>
            Mood: <span className="text-[#f5f5f6]">{issue.mood}</span>
          </span>
        </div>
      </header>

      {/* 2 - THE TAPE */}
      <SectionHeader index="01" title="The Tape" />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
        {issue.tape.map((t) => {
          const up = t.dir === "up";
          return (
            <div
              key={t.label}
              className="flex items-baseline justify-between gap-2 bg-[#0a0b0d] px-3.5 py-3"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#8b9099]">
                {t.label}
              </span>
              <span className="flex items-baseline gap-1.5 font-mono text-[12px] tabular-nums">
                <span className="text-[#f5f5f6]">{t.value}</span>
                <span className={up ? "text-up" : "text-signal"}>
                  {up ? "▲" : "▼"} {t.chg}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* 3 - THE BIG SLIP */}
      <SectionHeader index="02" title="The Big Slip" />
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
        {issue.bigSlip.kicker}
      </p>
      <h3 className="mt-3 font-display text-[clamp(1.9rem,7vw,2.9rem)] uppercase leading-[0.95] text-[#f5f5f6]">
        {issue.bigSlip.headline}
      </h3>
      <div className="mt-5 space-y-4">
        {issue.bigSlip.paragraphs.map((p, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-[16px] leading-relaxed text-[#dcdde0] first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[3.4rem] first-letter:leading-[0.7] first-letter:text-signal"
                : "text-[16px] leading-relaxed text-[#dcdde0]"
            }
          >
            {p}
          </p>
        ))}
      </div>
      <Take>{issue.bigSlip.take}</Take>
      <Source>{issue.bigSlip.source}</Source>

      {/* 4 - THE DESK (numbered, scannable) */}
      <SectionHeader index="03" title="The Desk" />
      <ol className="space-y-5">
        {issue.desk.map((d, i) => (
          <li key={i} className="flex gap-4">
            <span className="mt-0.5 font-mono text-[13px] font-medium tabular-nums text-signal/80">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-medium leading-snug text-[#f5f5f6]">
                {d.headline}
              </p>
              <p className="mt-1 text-[14px] leading-snug text-[#9398a0]">
                {d.take}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* 5 - ENERGY DESK (signature) */}
      <SectionHeader index="04" title="Energy Desk" badge="our beat" />
      <div className="space-y-8">
        {issue.energy.map((e, i) => (
          <div key={i}>
            <h4 className="font-display text-xl uppercase leading-tight text-[#f5f5f6]">
              {e.headline}
            </h4>
            <p className="mt-2.5 text-[16px] leading-relaxed text-[#dcdde0]">
              {e.body}
            </p>
            <Take>{e.take}</Take>
            <Source>{e.source}</Source>
          </div>
        ))}
      </div>

      {/* 6 - FAT FINGER OF THE DAY */}
      <SectionHeader index="05" title="Fat Finger of the Day" />
      <div className="rounded-2xl border border-signal/30 bg-signal/[0.06] p-6">
        <h4 className="font-display text-xl uppercase leading-tight text-[#f5f5f6]">
          {issue.fatFinger.headline}
        </h4>
        <p className="mt-2.5 text-[16px] leading-relaxed text-[#dcdde0]">
          {issue.fatFinger.body}
        </p>
        <Take>{issue.fatFinger.take}</Take>
        <Source>{issue.fatFinger.source}</Source>
      </div>

      {/* 7 - CHART OF THE DAY */}
      <SectionHeader index="06" title="Chart of the Day" />
      <FatFingerChart {...issue.chart} />

      {/* 8 - SIGN-OFF */}
      <div className="mt-14 border-t border-white/10 pt-8 text-center">
        <p className="mx-auto max-w-md text-[16px] leading-relaxed text-[#dcdde0]">
          {issue.signOff}
        </p>
        <a
          href="https://fatfinger.news/subscribe"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-signal px-7 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-[#f5f5f6] transition-transform hover:-translate-y-0.5"
        >
          Subscribe free →
        </a>
      </div>

      {/* footer */}
      <footer className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 pt-7 text-center">
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
