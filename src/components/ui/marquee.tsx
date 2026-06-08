"use client";

import { cn } from "@/lib/utils";

/**
 * Marquee - brand-restyled equivalent of the Watermelon UI marquee
 * (registry.watermelon.sh/marquee.json). The hosted registry only serves a
 * client-rendered SPA shell to non-browser clients, so this is rebuilt with
 * Tailwind + CSS keyframes to the Fat Finger tokens. Duplicates its children
 * once for a seamless loop and exposes pause-on-hover + reverse.
 */
interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** seconds for one full pass */
  duration?: number;
  /** gap between items, in px */
  gap?: number;
  children: React.ReactNode;
}

export function Marquee({
  reverse = false,
  pauseOnHover = true,
  duration = 40,
  gap = 0,
  className,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn("group flex w-full overflow-hidden", className)}
      style={
        {
          "--marquee-duration": `${duration}s`,
          "--marquee-gap": `${gap}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn(
            "flex shrink-0 items-center",
            reverse ? "animate-marquee-reverse" : "animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
