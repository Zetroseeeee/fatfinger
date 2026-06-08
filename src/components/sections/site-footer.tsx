"use client";

import { TransitionLink } from "@/components/ui/page-transition";

/**
 * Section 7b - FOOTER
 * Ink (near-black) block anchoring the paper page. Wordmark on dark, link
 * columns, mono fine-print. Internal links use the branded curtain transition;
 * external links open safely in a new tab.
 */
const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Read",
    links: [
      { label: "Sample issues", href: "/issues" },
      { label: "Chart of the day", href: "/#chart" },
      { label: "Why Fat Finger", href: "/#why" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Editorial standards", href: "#" },
      { label: "Contact", href: "mailto:desk@fatfinger.news" },
    ],
  },
  {
    title: "Subscribe",
    links: [
      { label: "Daily email", href: "https://fatfinger.news" },
      { label: "Instagram", href: "https://instagram.com/fatfinger" },
      { label: "X / @fatfinger", href: "https://x.com/fatfinger" },
    ],
  },
];

const linkClass =
  "group relative inline-block text-sm text-paper/85 transition-colors hover:text-paper";

function FooterLink({ href, label }: { href: string; label: string }) {
  const underline = (
    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-300 group-hover:scale-x-100" />
  );
  // internal route → branded curtain transition
  if (href.startsWith("/")) {
    return (
      <TransitionLink href={href} className={linkClass}>
        {label}
        {underline}
      </TransitionLink>
    );
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={linkClass}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {label}
      {underline}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-2">
            <a
              href="#top"
              className="font-body text-3xl font-bold lowercase tracking-[-0.03em] text-paper"
            >
              fatfinger<span className="text-signal">.</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
              Markets media for people who take their money seriously and
              themselves less so. Quant-grade analysis, a sense of humour, no
              gatekeeping.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/45">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href} label={l.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-paper/15 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/45">
            © 2026 fatfinger<span className="text-signal">.</span> · all rights
            reserved
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/45">
            Illustrative data only · not investment advice
          </p>
        </div>
      </div>
    </footer>
  );
}
