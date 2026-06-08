import { MagneticButton } from "@/components/ui/magnetic-button";
import { TransitionLink } from "@/components/ui/page-transition";

export default function IssuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-50 border-b border-ink/12 bg-paper/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <TransitionLink
            href="/"
            className="font-body text-2xl font-bold lowercase tracking-[-0.03em] text-ink transition-opacity hover:opacity-80"
          >
            fatfinger<span className="text-signal">.</span>
          </TransitionLink>
          <div className="flex items-center gap-6">
            <TransitionLink
              href="/"
              className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
            >
              ← Home
            </TransitionLink>
            <MagneticButton
              href="/subscribe"
              variant="ink"
              className="px-5 py-2"
            >
              Subscribe
            </MagneticButton>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink/12 py-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Not investment advice. · Illustrative data only. · © 2026 fatfinger
          <span className="text-signal">.</span>
        </p>
      </footer>
    </div>
  );
}
