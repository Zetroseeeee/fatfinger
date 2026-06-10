"use client";

import { useEffect, useState } from "react";
import { ListenButton } from "./listen-button";

/**
 * Wraps an issue in the themeable reading surface (dark by default, toggle to
 * light, remembered in localStorage) and floats the reading controls -
 * Listen + the light/dark toggle - bottom-right, out of the way.
 */
export function ReadingShell({
  slug,
  narration,
  defaultTheme = "dark",
  children,
}: {
  slug: string;
  narration: string;
  defaultTheme?: "dark" | "light";
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"dark" | "light">(defaultTheme);

  useEffect(() => {
    const saved = localStorage.getItem("ff-read-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("ff-read-theme", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={`ff-read ${theme} min-h-screen`}>
      {children}

      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <ListenButton slug={slug} narration={narration} />
        <button
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-[15px] transition-colors"
          style={{
            borderColor: "var(--rd-line)",
            background: "var(--rd-bg)",
            color: "var(--rd-text)",
          }}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </div>
  );
}
