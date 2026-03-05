"use client";

import {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";
import { useReducedMotion } from "@/components/motion";
import { cn } from "@/lib/utils";

/* ─── Viewport awareness ─────────────────────────────────────────── */

const VizViewportCtx = createContext(true);

type ObserverHandler = (entry: IntersectionObserverEntry) => void;

interface SharedObserverState {
  observer: IntersectionObserver | null;
  handlers: Map<Element, ObserverHandler>;
}

const vizSurfaceObserverState: SharedObserverState = {
  observer: null,
  handlers: new Map<Element, ObserverHandler>(),
};

const lazyVizObserverState: SharedObserverState = {
  observer: null,
  handlers: new Map<Element, ObserverHandler>(),
};

function observeWithSharedObserver(
  state: SharedObserverState,
  element: Element,
  handler: ObserverHandler,
  options: IntersectionObserverInit
) {
  if (typeof IntersectionObserver === "undefined") {
    return () => {};
  }

  if (!state.observer) {
    state.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        state.handlers.get(entry.target)?.(entry);
      }
    }, options);
  }

  state.handlers.set(element, handler);
  state.observer.observe(element);

  return () => {
    state.handlers.delete(element);
    state.observer?.unobserve(element);

    if (state.handlers.size === 0 && state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }
  };
}

/**
 * Returns whether the enclosing VizSurface is currently within or near the
 * browser viewport.  Components can use this to pause expensive work
 * (setInterval ticks, requestAnimationFrame loops) when the user has scrolled
 * away, and resume transparently when the section comes back into view.
 *
 * Defaults to `true` so components that render outside a VizSurface (e.g. in
 * tests) behave as if always visible.
 */
export function useVizInViewport(): boolean {
  return useContext(VizViewportCtx);
}

export const vizSurfaceClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950 p-6 md:p-8";

export const vizPanelClassName =
  "rounded-xl border border-white/5 bg-black/40";

export const vizMetaLabelClassName =
  "text-xs font-bold uppercase tracking-widest text-slate-500";

export const vizBodyCopyClassName =
  "text-sm text-slate-400";

const vizAccentClassName = {
  blue: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-200",
    chip: "border-blue-500/40 bg-blue-500/10 text-blue-100",
  },
  green: {
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    text: "text-green-200",
    chip: "border-green-500/40 bg-green-500/10 text-green-100",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-200",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  },
  red: {
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    text: "text-red-200",
    chip: "border-red-500/40 bg-red-500/10 text-red-100",
  },
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    text: "text-violet-200",
    chip: "border-violet-500/40 bg-violet-500/10 text-violet-100",
  },
  cyan: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-200",
    chip: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100",
  },
} as const;

const vizButtonToneClassName = {
  neutral:
    "border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-400",
  blue:
    "border-blue-500/40 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20 focus-visible:ring-blue-400",
  green:
    "border-green-500/40 bg-green-500/10 text-green-100 hover:bg-green-500/20 focus-visible:ring-green-400",
  red:
    "border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/20 focus-visible:ring-red-400",
  amber:
    "border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 focus-visible:ring-amber-400",
  violet:
    "border-violet-500/40 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 focus-visible:ring-violet-400",
} as const;

type VizButtonTone = keyof typeof vizButtonToneClassName;
type VizAccentTone = keyof typeof vizAccentClassName;

export interface VizSurfaceProps extends ComponentPropsWithoutRef<"section"> {
  children: ReactNode;
}

export function VizSurface({ children, className, ...props }: VizSurfaceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    return observeWithSharedObserver(
      vizSurfaceObserverState,
      el,
      (entry) => {
        setInViewport((prev) => (prev === entry.isIntersecting ? prev : entry.isIntersecting));
      },
      { rootMargin: "200px" }
    );
  }, []);

  return (
    <VizViewportCtx.Provider value={inViewport}>
      <section
        ref={sectionRef}
        className={cn(vizSurfaceClassName, className)}
        {...props}
      >
        {children}
      </section>
    </VizViewportCtx.Provider>
  );
}

export interface VizControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: VizButtonTone;
}

export function VizControlButton({
  tone = "neutral",
  className,
  type = "button",
  ...props
}: VizControlButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40",
        vizButtonToneClassName[tone],
        className
      )}
      {...props}
    />
  );
}

export interface VizHeaderProps extends ComponentPropsWithoutRef<"header"> {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: VizAccentTone;
  controls?: ReactNode;
}

export function VizHeader({
  eyebrow,
  title,
  subtitle,
  accent = "blue",
  controls,
  className,
  ...props
}: VizHeaderProps) {
  const tone = vizAccentClassName[accent];

  return (
    <header className={cn("mb-5 rounded-xl border bg-black/30 p-4 md:p-5", tone.border, className)} {...props}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          {eyebrow && (
            <p className={cn("inline-flex rounded px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] border", tone.chip)}>
              {eyebrow}
            </p>
          )}
          <h3 className="text-lg font-black text-white md:text-xl">{title}</h3>
          {subtitle && <p className="max-w-3xl text-sm text-slate-300">{subtitle}</p>}
        </div>
        {controls ? <div className="shrink-0">{controls}</div> : null}
      </div>
    </header>
  );
}

export interface VizLearningBlockProps extends ComponentPropsWithoutRef<"aside"> {
  title?: string;
  accent?: VizAccentTone;
  items: string[];
}

export function VizLearningBlock({
  title = "What To Observe",
  accent = "blue",
  items,
  className,
  ...props
}: VizLearningBlockProps) {
  const tone = vizAccentClassName[accent];
  return (
    <aside className={cn("rounded-xl border bg-black/30 p-4", tone.border, className)} {...props}>
      <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", tone.text)}>{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={cn("select-none", tone.text)}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export interface VizMetricCardProps extends ComponentPropsWithoutRef<"article"> {
  label: string;
  value: ReactNode;
  tone?: VizButtonTone;
}

export function VizMetricCard({
  label,
  value,
  tone = "neutral",
  className,
  ...props
}: VizMetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-black/40 p-3 text-center",
        vizButtonToneClassName[tone],
        "hover:bg-black/60",
        className
      )}
      {...props}
    >
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
    </article>
  );
}

export function useVizReducedMotion() {
  return useReducedMotion() ?? false;
}

/**
 * Auto-starts a viz animation when the enclosing VizSurface first enters
 * the viewport.  Calls `start` once, then never again.  Components should
 * still honour `useVizInViewport()` for pause/resume while running.
 */
export function useVizAutoStart(start: () => void) {
  const inViewport = useVizInViewport();
  const fired = useRef(false);
  useEffect(() => {
    if (inViewport && !fired.current) {
      fired.current = true;
      start();
    }
  }, [inViewport, start]);
}

/* ─── Viewport-gated lazy loading ───────────────────────────────── */

const vizPlaceholderClassName =
  "flex items-center justify-center h-64 text-slate-600 text-sm font-mono";

/**
 * Defers mounting children (and thus triggering their dynamic import) until
 * the wrapper scrolls within 600px of the viewport.  Once triggered, children
 * stay mounted permanently (triggerOnce).
 *
 * Use this around dynamically imported viz components to avoid downloading
 * all chunks simultaneously on page load.
 */
export function LazyViz({ children }: { children: ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || activated) return;
    if (typeof IntersectionObserver === "undefined") {
      const timeoutId = window.setTimeout(() => {
        setActivated(true);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    return observeWithSharedObserver(
      lazyVizObserverState,
      el,
      (entry) => {
        if (entry.isIntersecting) {
          setActivated(true);
        }
      },
      { rootMargin: "600px" }
    );
  }, [activated]);

  return (
    <div ref={sentinelRef}>
      {activated ? (
        <Suspense fallback={<div className={vizPlaceholderClassName}>Loading visualization...</div>}>
          {children}
        </Suspense>
      ) : (
        <div className={vizPlaceholderClassName}>Loading visualization...</div>
      )}
    </div>
  );
}
