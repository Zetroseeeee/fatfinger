import type { Metadata } from "next";
import { getAllIssues } from "@/lib/issues";
import { setting } from "@/lib/settings";
import { TransitionLink } from "@/components/ui/page-transition";

// always reflect the latest auto-published issues
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Brief · fatfinger.",
  description:
    "Read Fat Finger: the sharpest, wittiest read on markets, energy and macro. Illustrative data only.",
};

export default async function IssuesIndex() {
  const issues = await getAllIssues();
  const tagline = await setting(
    "tagline",
    "Markets, energy and macro. Decoded, not reported."
  );
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-signal">
        The Brief · sample issues
      </p>
      <h1 className="mt-4 font-display text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.9] text-ink">
        What lands in your
        <br />
        inbox, most mornings.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
        {tagline} Read one in five minutes, sound like the smartest person on
        the desk. Numbers below are illustrative.
      </p>

      <ul className="mt-14 divide-y divide-ink/12 border-y-2 border-ink">
        {issues.map((issue) => (
          <li key={issue.slug}>
            <TransitionLink
              href={`/issues/${issue.slug}`}
              className="group flex flex-col gap-3 py-7 transition-colors sm:flex-row sm:items-start sm:gap-8"
            >
              <span className="w-40 shrink-0 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-soft">
                {issue.date}
              </span>
              <div className="flex-1">
                <h2 className="font-display text-2xl uppercase leading-[0.98] text-ink transition-colors group-hover:text-signal sm:text-3xl">
                  {issue.bigSlip.headline}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  {issue.preview}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  Mood: <span className="text-ink">{issue.mood}</span>
                </span>
              </div>
              <span
                aria-hidden
                className="hidden font-display text-3xl text-ink transition-transform duration-300 group-hover:translate-x-1 group-hover:text-signal sm:block"
              >
                →
              </span>
            </TransitionLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
