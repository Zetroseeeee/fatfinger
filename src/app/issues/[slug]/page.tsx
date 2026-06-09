import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllIssues, resolveIssue } from "@/lib/issues";
import { narrate } from "@/lib/narrate";
import { NewsletterIssue } from "@/components/newsletter/newsletter-issue";
import { ReadingShell } from "@/components/newsletter/reading-shell";
import { TransitionLink } from "@/components/ui/page-transition";

// render on demand so auto-published issues are always available + current
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const issue = await resolveIssue(slug);
  if (!issue) return { title: "Issue not found · fatfinger." };
  return {
    title: `${issue.bigSlip.headline} · fatfinger.`,
    description: issue.preview,
  };
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = await getAllIssues();
  const idx = all.findIndex((i) => i.slug === slug);
  if (idx === -1) notFound();
  const issue = all[idx];
  const prev = all[idx + 1];
  const next = all[idx - 1];

  // Themeable reading surface (dark by default, toggle to light) with one
  // centered reading column and floating Listen + theme controls.
  return (
    <ReadingShell slug={issue.slug} narration={narrate(issue)}>
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <TransitionLink
          href="/issues"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--rd-muted)] transition-colors hover:text-[var(--rd-text)]"
        >
          ← All issues
        </TransitionLink>

        <div className="mt-8">
          <NewsletterIssue issue={issue} />
        </div>

        {/* prev / next */}
        <nav className="mt-14 flex items-center justify-between gap-4 border-t border-[var(--rd-line)] pt-7 font-mono text-[11px] uppercase tracking-[0.14em]">
          {prev ? (
            <TransitionLink
              href={`/issues/${prev.slug}`}
              className="text-[var(--rd-muted)] transition-colors hover:text-[var(--rd-text)]"
            >
              ← {prev.date}
            </TransitionLink>
          ) : (
            <span />
          )}
          {next ? (
            <TransitionLink
              href={`/issues/${next.slug}`}
              className="text-[var(--rd-muted)] transition-colors hover:text-[var(--rd-text)]"
            >
              {next.date} →
            </TransitionLink>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </ReadingShell>
  );
}
