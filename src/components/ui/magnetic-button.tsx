"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouteTransition } from "@/components/ui/page-transition";

/**
 * MagneticButton - a pill CTA that leans toward the cursor (magnetic) with a
 * springy return, plus a colour-fill wipe on hover. Renders an <a>. The whole
 * editorial-but-fun interaction language lives here: tactile, not glowy.
 */
type Variant = "ink" | "red" | "electric" | "ghost";

const VARIANTS: Record<Variant, { base: string; fill: string; text: string }> = {
  ink: {
    base: "bg-ink text-paper border-ink",
    fill: "bg-signal",
    text: "group-hover:text-paper",
  },
  red: {
    base: "bg-signal text-paper border-signal",
    fill: "bg-ink",
    text: "group-hover:text-paper",
  },
  electric: {
    base: "bg-electric text-paper border-electric",
    fill: "bg-ink",
    text: "group-hover:text-paper",
  },
  ghost: {
    base: "bg-transparent text-ink border-ink",
    fill: "bg-ink",
    text: "group-hover:text-paper",
  },
};

type AnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>;

interface MagneticButtonProps extends AnchorProps {
  variant?: Variant;
  strength?: number;
  children: React.ReactNode;
}

export function MagneticButton({
  variant = "ink",
  strength = 0.4,
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const navigate = useRouteTransition();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const v = VARIANTS[variant];
  const href = props.href;
  // internal route (not a hash on this page, not external) → use the curtain
  const isInternalRoute =
    typeof href === "string" && href.startsWith("/") && !href.startsWith("//");
  const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
  const externalAttrs = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    setPos({ x, y });
  }

  return (
    <motion.a
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      onClick={(e) => {
        if (isInternalRoute) {
          e.preventDefault();
          navigate(href as string);
        }
      }}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 260, damping: 15, mass: 0.5 }}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2",
        "px-7 py-3 font-mono text-[12px] uppercase tracking-[0.16em]",
        v.base,
        className
      )}
      {...externalAttrs}
      {...props}
    >
      {/* colour-fill wipe from bottom on hover */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100",
          v.fill
        )}
      />
      <span className={cn("relative z-10 flex items-center gap-2 transition-colors duration-200", v.text)}>
        {children}
      </span>
    </motion.a>
  );
}
