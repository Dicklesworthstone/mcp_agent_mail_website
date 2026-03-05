"use client";

import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";
import { useReducedMotion } from "@/components/motion";
import { cn } from "@/lib/utils";

export const vizSurfaceClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950 p-6 md:p-8";

export const vizPanelClassName =
  "rounded-xl border border-white/5 bg-black/40";

export const vizMetaLabelClassName =
  "text-xs font-bold uppercase tracking-widest text-slate-500";

export const vizBodyCopyClassName =
  "text-sm text-slate-400";

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
} as const;

type VizButtonTone = keyof typeof vizButtonToneClassName;

export interface VizSurfaceProps extends ComponentPropsWithoutRef<"section"> {
  children: ReactNode;
}

export function VizSurface({ children, className, ...props }: VizSurfaceProps) {
  return (
    <section className={cn(vizSurfaceClassName, className)} {...props}>
      {children}
    </section>
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

export function useVizReducedMotion() {
  return useReducedMotion() ?? false;
}

