import { cn } from "@/lib/utils";

/**
 * The "fatfinger." wordmark.
 * Matches the real brand logo: a clean, rounded, lowercase geometric sans
 * (Poppins) - NOT the condensed Anton used for editorial headlines. Tight
 * tracking + bold weight to mirror the logo lockup. The red full-stop is the
 * single signal-red signature of the mark.
 */
export function Wordmark({
  className,
  href = "#top",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <a
      href={href}
      aria-label="fatfinger. home"
      className={cn(
        "font-body font-bold lowercase tracking-[-0.03em] text-ink leading-none transition-opacity hover:opacity-80",
        className
      )}
    >
      fatfinger<span className="text-signal">.</span>
    </a>
  );
}
