"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Typewriter - brand equivalent of Cult UI `typewriter`
 * (cult-ui.com/r/typewriter.json). Types each string out, holds, deletes, and
 * cycles. The caret is the single signal red. Used for the hero headline.
 */
interface TypewriterProps {
  /** strings to cycle through; a single string just types once and holds */
  words: string[];
  className?: string;
  caretClassName?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  /** pause at a fully-typed word, ms */
  holdTime?: number;
  loop?: boolean;
}

export function Typewriter({
  words,
  className,
  caretClassName,
  typingSpeed = 65,
  deletingSpeed = 35,
  holdTime = 1800,
  loop = true,
}: TypewriterProps) {
  const [display, setDisplay] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">(
    "typing"
  );
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const single = words.length === 1;

    if (phase === "typing") {
      if (display.length < current.length) {
        timeout.current = setTimeout(
          () => setDisplay(current.slice(0, display.length + 1)),
          typingSpeed
        );
      } else if (single && !loop) {
        // type once and stop
        return;
      } else {
        timeout.current = setTimeout(() => setPhase("holding"), holdTime);
      }
    } else if (phase === "holding") {
      if (single && !loop) return;
      timeout.current = setTimeout(() => setPhase("deleting"), holdTime);
    } else if (phase === "deleting") {
      if (display.length > 0) {
        timeout.current = setTimeout(
          () => setDisplay(current.slice(0, display.length - 1)),
          deletingSpeed
        );
      } else {
        setWordIndex((i) => (i + 1) % words.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout.current);
  }, [
    display,
    phase,
    wordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    holdTime,
    loop,
  ]);

  return (
    <span className={cn("inline", className)}>
      {display}
      <span
        aria-hidden
        className={cn(
          "ml-1 inline-block w-[0.06em] translate-y-[0.06em] animate-[blink_1s_steps(2)_infinite] bg-signal align-baseline",
          caretClassName
        )}
        style={{ height: "0.92em" }}
      />
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  );
}
