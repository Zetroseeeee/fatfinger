"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { TransitionLink } from "@/components/ui/page-transition";
import { cn } from "@/lib/utils";

/**
 * Section 2 - STICKY NAV + SUBSCRIBE
 * Paper nav, fatfinger. wordmark, mono links with a wipe underline, and a
 * magnetic Subscribe pill → https://fatfinger.news. Hairline appears on scroll.
 */
const LINKS = [
  { label: "Why", href: "/#why" },
  { label: "Charts", href: "/#chart" },
  { label: "The Brief", href: "/issues" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-ink/12 bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Wordmark className="text-2xl" />

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <TransitionLink
              key={l.href}
              href={l.href}
              className="group relative font-mono text-[12px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-signal transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
            </TransitionLink>
          ))}
        </div>

        <MagneticButton
          href="/subscribe"
          variant="ink"
          className="px-5 py-2"
        >
          Subscribe
        </MagneticButton>
      </nav>
    </header>
  );
}
