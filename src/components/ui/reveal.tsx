"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Reveal - scroll-triggered entrance. Children rise + fade with a spring once
 * in view. Use `stagger` on a parent <Reveal> and wrap each child in
 * <RevealItem> for a cascading editorial reveal.
 */
const ease = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  stagger,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number;
  as?: "div" | "section" | "ul" | "h2";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (stagger) {
    const container: Variants = {
      hidden: {},
      show: {
        transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay },
      },
    };
    return (
      <MotionTag
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-12% 0px" }}
        className={className}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease, delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag variants={revealItem} className={className}>
      {children}
    </MotionTag>
  );
}
