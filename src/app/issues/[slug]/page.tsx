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

  // Full-bleed dark reading band: the page IS the dark surface, with one
  // centered, comfortable reading column. No floating card to mis-center.
  return (
    <div className="bg-[#0a0b0d] text-[#f5f5f6]">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <TransitionLink
          href="/issues"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8b9099] transition-colors hover:text-[#f5f5f6]"
        >
          ← All issues
        </TransitionLink>

        <div className="mt-8">
          <NewsletterIssue issue={issue} />
        </div>

        {/* prev / next */}
        <nav className="mt-14 flex items-center justify-between gap-4 border-t border-white/10 pt-7 font-mono text-[11px] uppercase tracking-[0.14em]">
          {prev ? (
            <TransitionLink
              href={`/issues/${prev.slug}`}
              className="text-[#8b9099] transition-colors hover:text-[#f5f5f6]"
            >
              ← {prev.date}
            </TransitionLink>
          ) : (
            <span />
          )}
          {next ? (
            <TransitionLink
              href={`/issues/${next.slug}`}
              className="text-[#8b9099] transition-colors hover:text-[#f5f5f6]"
            >
              {next.date} →
            </TransitionLink>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
