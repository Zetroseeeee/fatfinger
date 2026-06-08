import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ISSUES, getIssue } from "@/content/issues";
import { NewsletterIssue } from "@/components/newsletter/newsletter-issue";
import { TransitionLink } from "@/components/ui/page-transition";

export function generateStaticParams() {
  return ISSUES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const issue = getIssue(slug);
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
  const issue = getIssue(slug);
  if (!issue) notFound();

  const idx = ISSUES.findIndex((i) => i.slug === slug);
  const prev = ISSUES[idx + 1];
  const next = ISSUES[idx - 1];

  return (
    <div className="px-4 py-10 sm:py-16">
      <div className="mx-auto mb-6 max-w-xl">
        <TransitionLink
          href="/issues"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
        >
          ← All issues
        </TransitionLink>
      </div>

      {/* the dark email, framed on the paper page */}
      <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border-2 border-ink shadow-[12px_12px_0_0_var(--color-ink)]">
        <NewsletterIssue issue={issue} />
      </div>

      {/* prev / next */}
      <div className="mx-auto mt-8 flex max-w-xl items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.14em]">
        {prev ? (
          <TransitionLink
            href={`/issues/${prev.slug}`}
            className="text-ink-soft transition-colors hover:text-ink"
          >
            ← {prev.date}
          </TransitionLink>
        ) : (
          <span />
        )}
        {next ? (
          <TransitionLink
            href={`/issues/${next.slug}`}
            className="text-ink-soft transition-colors hover:text-ink"
          >
            {next.date} →
          </TransitionLink>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
