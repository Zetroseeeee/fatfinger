"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wordmark } from "@/components/wordmark";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { TransitionLink } from "@/components/ui/page-transition";
import { cn } from "@/lib/utils";

/**
 * Section 2 - STICKY NAV + SUBSCRIBE
 * Paper nav, fatfinger. wordmark, mono links with a wipe underline, magnetic
 * Subscribe pill → /subscribe. Hairline on scroll. On mobile the links collapse
 * into an animated hamburger → slide-down menu.
 */
const LINKS = [
  { label: "Why us", href: "/#why" },
  { label: "Charts", href: "/#chart" },
  { label: "Issues", href: "/issues" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
        scrolled || open
          ? "border-b border-ink/12 bg-paper/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Wordmark className="text-2xl" />

        {/* desktop links */}
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

        <div className="flex items-center gap-3">
          <MagneticButton href="/subscribe" variant="ink" className="px-5 py-2">
            Subscribe
          </MagneticButton>

          {/* hamburger (mobile) */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-ink/15 md:hidden"
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-3 w-4">
              <span
                className={cn(
                  "absolute left-0 top-0 h-[2px] w-4 bg-ink transition-transform duration-300",
                  open && "top-1.5 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 h-[2px] w-4 bg-ink transition-opacity duration-200",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-3 h-[2px] w-4 bg-ink transition-transform duration-300",
                  open && "top-1.5 -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-ink/10 bg-paper/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col px-5 py-2">
              {LINKS.map((l) => (
                <TransitionLink
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-ink/8 py-4 font-display text-2xl uppercase text-ink last:border-0"
                >
                  {l.label}
                </TransitionLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
