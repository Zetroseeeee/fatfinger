"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * CardStackScroll - brand equivalent of Skiper UI `skiper16` card-stack-scroll.
 * Skiper installs by namespace into @/components/v1/… and the scroll variants
 * pull in GSAP + Lenis; the namespace isn't resolvable here, so the stacking
 * behaviour is rebuilt with Framer Motion's useScroll.
 *
 * Canonical centered-pin deck: each card lives in its own full-height section
 * and pins to the viewport centre. As later cards arrive they cover the earlier
 * ones, which scale down slightly behind the incoming card - so they stack like
 * a physical deck with no bleed-through. Each card peeks a few px lower than the
 * last via a stepped offset.
 */
export function CardStackScroll({
  children,
  className,
}: {
  children: React.ReactNode[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const count = children.length;

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children.map((child, i) => {
        // each earlier card settles at a slightly smaller scale so the stack
        // reads as depth; the topmost card stays at full scale.
        const targetScale = 1 - (count - 1 - i) * 0.05;
        const range: [number, number] = [i / count, 1];
        return (
          <StackItem
            key={i}
            index={i}
            range={range}
            targetScale={targetScale}
            progress={scrollYProgress}
          >
            {child}
          </StackItem>
        );
      })}
    </div>
  );
}

function StackItem({
  index,
  range,
  targetScale,
  progress,
  children,
}: {
  index: number;
  range: [number, number];
  targetScale: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="sticky top-0 flex h-screen items-center justify-center">
      <motion.div
        style={{
          scale,
          // stepped peek so stacked card tops are visible
          top: `calc(${index * 26}px)`,
        }}
        className="relative w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
