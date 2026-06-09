"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";

/**
 * Branded route transition - an ink "curtain" wipes up to cover the page, we
 * swap routes underneath, then it wipes off the top to reveal the new page.
 * The fatfinger. wordmark rides the curtain. Used for real navigations
 * (e.g. pressing "The Brief" → /issues). Hash links on the same page are left
 * to the browser's smooth scroll. Reduced-motion users just get an instant push.
 *
 * Driven by a deterministic CSS transition + a timed sequence (not framer's
 * enter-animation lifecycle, which proved flaky under React 19 + AnimatePresence).
 */

const COVER_MS = 460; // curtain rises to cover
const HOLD_MS = 280; // hold at FULL cover while the route swaps AND the new page paints
const REVEAL_MS = 460; // curtain lifts off to reveal

type NavFn = (href: string) => void;
const TransitionCtx = createContext<NavFn>(() => {});

/** call to navigate with the curtain; falls back to a plain push when no provider */
export function useRouteTransition() {
  return useContext(TransitionCtx);
}

/** path portion of an href ("/issues#x" -> "/issues", "/#why" -> "/") */
function pathOf(href: string) {
  const p = href.split("#")[0];
  return p === "" ? "/" : p;
}

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const [active, setActive] = useState(false);
  const [y, setY] = useState("100%"); // 100% below → 0% cover → -100% above
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raf = useRef<number | null>(null);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (raf.current !== null) cancelAnimationFrame(raf.current);
  }, []);

  // never leave timers / frames running past unmount
  useEffect(() => () => clearAll(), [clearAll]);

  const navigate = useCallback<NavFn>(
    (href) => {
      // external or mail → let the browser handle it
      if (/^(https?:|mailto:|tel:)/.test(href)) {
        window.location.href = href;
        return;
      }
      // same-page hash → no curtain, browser scrolls
      if (pathOf(href) === pathname) {
        if (href.includes("#")) {
          document
            .getElementById(href.split("#")[1])
            ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        }
        return;
      }
      if (reduce) {
        router.push(href);
        return;
      }
      if (busy.current) return; // already transitioning - ignore extra clicks
      busy.current = true;

      // 1) mount the curtain below the fold
      clearAll();
      setY("100%");
      setActive(true);

      // 2) next frame → transition up to cover (double rAF guarantees the
      //    initial 100% paints before we animate to 0%)
      raf.current = requestAnimationFrame(() => {
        raf.current = requestAnimationFrame(() => setY("0%"));
      });

      // 3) the moment the curtain fully covers, swap the route underneath
      timers.current.push(setTimeout(() => router.push(href), COVER_MS));
      // 4) HOLD at full cover so the new page mounts + paints, THEN lift off.
      //    (revealing too soon is what made heavier pages flash/cut.)
      timers.current.push(
        setTimeout(() => setY("-100%"), COVER_MS + HOLD_MS)
      );
      // 5) done - unmount, release, move focus to the new page's main content
      timers.current.push(
        setTimeout(() => {
          setActive(false);
          busy.current = false;
          const main = document.querySelector("main");
          if (main) {
            main.setAttribute("tabindex", "-1");
            (main as HTMLElement).focus({ preventScroll: true });
          }
        }, COVER_MS + HOLD_MS + REVEAL_MS)
      );
    },
    [pathname, router, reduce, clearAll]
  );

  return (
    <TransitionCtx.Provider value={navigate}>
      {children}
      {active && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[999] flex items-center justify-center bg-ink"
          style={{
            transform: `translateY(${y})`,
            transition: `transform ${
              y === "-100%" ? REVEAL_MS : COVER_MS
            }ms cubic-bezier(0.76,0,0.24,1)`,
          }}
        >
          <span
            className="font-body text-4xl font-bold lowercase tracking-[-0.03em] text-paper transition-opacity duration-300"
            style={{ opacity: y === "0%" ? 1 : 0 }}
          >
            fatfinger<span className="text-signal">.</span>
          </span>
        </div>
      )}
    </TransitionCtx.Provider>
  );
}

/**
 * TransitionLink - drop-in <a> that triggers the curtain for real route
 * changes and prefetches on hover. Same-page hashes pass through.
 */
export function TransitionLink({
  href,
  children,
  className,
  onClick,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const navigate = useRouteTransition();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={() => {
        if (href.startsWith("/") && pathOf(href) !== pathname) {
          router.prefetch(pathOf(href));
        }
      }}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (/^(https?:|mailto:|tel:)/.test(href)) return; // external: default
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
