"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A rounded node element for corners — tech-clean aesthetic
 * Glowing dot with concentric pulse on hover
 */
export function SyncNode({
  className,
  color = "#60A5FA",
  baseScale = 1
}: {
  className?: string;
  color?: string;
  baseScale?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        rest: { scale: baseScale },
        hover: { scale: baseScale * 1.15 },
      }}
      initial="rest"
      animate="rest"
      whileHover={prefersReducedMotion ? undefined : "hover"}
      className={cn(
        "group relative h-3.5 w-3.5 rounded-md flex items-center justify-center",
        className
      )}
    >
      {/* Core dot */}
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />

      {/* Concentric pulse ring */}
      <motion.div
        className="absolute inset-[-3px] rounded-lg border"
        style={{ borderColor: color }}
        variants={{
          rest: { scale: 1, opacity: 0 },
          hover: {
            scale: [1, 1.8, 1],
            opacity: [0.6, 0, 0.6],
            transition: {
              duration: 1.2,
              repeat: Infinity,
              ease: "easeOut",
            },
          },
        }}
      />
    </motion.div>
  );
}

/**
 * Dashed data-flow connection lines
 */
export function ConnectionLine({
  className,
  orientation = "horizontal",
  color = "currentColor",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
  color?: string;
}) {
  if (orientation === "horizontal") {
    return (
      <svg
        width="100%"
        height="12"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        className={cn("pointer-events-none cursor-default opacity-30", className)}
        aria-hidden="true"
      >
        <line
          x1="5" y1="6" x2="95" y2="6"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="100%"
      viewBox="0 0 12 100"
      preserveAspectRatio="none"
      className={cn("pointer-events-none cursor-default opacity-30", className)}
      aria-hidden="true"
    >
      <line
        x1="6" y1="5" x2="6" y2="95"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A traveling data packet that moves along the border of a container
 */
export function DataPulse({
  className,
  color = "#60A5FA",
  active = true,
}: {
  className?: string;
  color?: string;
  active?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion || !active) {
    return null;
  }

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]", className)}
      style={{ ["--pulse-color" as string]: color }}
    >
      <motion.div
        initial={{ top: 0, left: 0, opacity: 0 }}
        animate={{
          top: ["0%", "0%", "100%", "100%", "0%"],
          left: ["0%", "100%", "100%", "0%", "0%"],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
        className="absolute h-[1.5px] w-12 bg-gradient-to-r from-transparent via-[var(--pulse-color)] to-transparent blur-[2px] z-0"
      />
      <motion.div
        initial={{ top: 0, left: 0, opacity: 0 }}
        animate={{
          top: ["0%", "0%", "100%", "100%", "0%"],
          left: ["0%", "100%", "100%", "0%", "0%"],
          opacity: [0, 0.8, 0.8, 0.8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.25, 0.5, 0.75, 1],
          delay: 2,
        }}
        className="absolute w-[1.5px] h-12 bg-gradient-to-b from-transparent via-[var(--pulse-color)] to-transparent blur-[2px] z-0"
      />
    </div>
  );
}

/**
 * A PCB junction node — small SVG with a central dot and radiating trace lines.
 * Placed at container corners (replaces simple dots / FrankenBolt role).
 */
export function CircuitJunction({
  className,
  color = "#60A5FA",
  size = 16,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      className={cn("pointer-events-none", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        aria-hidden="true"
        className="overflow-visible"
      >
        {/* Radiating trace lines at 90° angles */}
        <line x1="8" y1="0" x2="8" y2="5" stroke={color} strokeWidth="0.8" opacity="0.5" />
        <line x1="8" y1="11" x2="8" y2="16" stroke={color} strokeWidth="0.8" opacity="0.5" />
        <line x1="0" y1="8" x2="5" y2="8" stroke={color} strokeWidth="0.8" opacity="0.5" />
        <line x1="11" y1="8" x2="16" y2="8" stroke={color} strokeWidth="0.8" opacity="0.5" />
        {/* Central filled circle with glow */}
        <circle cx="8" cy="8" r="2.5" fill={color} opacity="0.9" />
        <circle cx="8" cy="8" r="4" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
      </svg>
    </div>
  );
}

/**
 * PCB trace line with right-angle dashed pattern.
 * Runs along container edges (replaces FrankenStitch role).
 */
export function CircuitTrace({
  className,
  orientation = "horizontal",
  color = "#60A5FA",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
  color?: string;
}) {
  if (orientation === "horizontal") {
    return (
      <svg
        width="100%"
        height="8"
        viewBox="0 0 200 8"
        preserveAspectRatio="none"
        className={cn("pointer-events-none opacity-20 group-hover/container:opacity-50 transition-opacity duration-500", className)}
        aria-hidden="true"
      >
        {/* Main trace */}
        <line x1="0" y1="4" x2="60" y2="4" stroke={color} strokeWidth="0.6" strokeDasharray="4 3" />
        {/* Right-angle bend */}
        <polyline points="60,4 60,1 70,1 70,4" fill="none" stroke={color} strokeWidth="0.6" opacity="0.7" />
        {/* Continue */}
        <line x1="70" y1="4" x2="130" y2="4" stroke={color} strokeWidth="0.6" strokeDasharray="4 3" />
        {/* Another bend */}
        <polyline points="130,4 130,7 140,7 140,4" fill="none" stroke={color} strokeWidth="0.6" opacity="0.7" />
        {/* Finish */}
        <line x1="140" y1="4" x2="200" y2="4" stroke={color} strokeWidth="0.6" strokeDasharray="4 3" />
      </svg>
    );
  }

  return (
    <svg
      width="8"
      height="100%"
      viewBox="0 0 8 200"
      preserveAspectRatio="none"
      className={cn("pointer-events-none opacity-20 group-hover/container:opacity-50 transition-opacity duration-500", className)}
      aria-hidden="true"
    >
      <line x1="4" y1="0" x2="4" y2="60" stroke={color} strokeWidth="0.6" strokeDasharray="4 3" />
      <polyline points="4,60 1,60 1,70 4,70" fill="none" stroke={color} strokeWidth="0.6" opacity="0.7" />
      <line x1="4" y1="70" x2="4" y2="130" stroke={color} strokeWidth="0.6" strokeDasharray="4 3" />
      <polyline points="4,130 7,130 7,140 4,140" fill="none" stroke={color} strokeWidth="0.6" opacity="0.7" />
      <line x1="4" y1="140" x2="4" y2="200" stroke={color} strokeWidth="0.6" strokeDasharray="4 3" />
    </svg>
  );
}

/**
 * A container with sync nodes, hexagonal grid texture, connection lines, and data pulse
 */
export function SyncContainer({
  children,
  className,
  withNodes = true,
  withLines = true,
  withPulse = false,
  accentColor = "#60A5FA",
}: {
  children: React.ReactNode;
  className?: string;
  withNodes?: boolean;
  withLines?: boolean;
  withPulse?: boolean;
  accentColor?: string;
}) {
  const [pulseActive, setPulseActive] = useState(false);

  return (
    <div
      className={cn("relative group/container rounded-2xl border border-white/5 bg-black/40", className)}
      onMouseEnter={() => setPulseActive(true)}
      onMouseLeave={() => setPulseActive(false)}
      onFocusCapture={() => setPulseActive(true)}
      onBlurCapture={(event) => {
        const next = event.relatedTarget as Node | null;
        if (!next || !event.currentTarget.contains(next)) {
          setPulseActive(false);
        }
      }}
    >
      {/* Internal Skin Layer */}
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none z-0">
        {/* Hexagonal grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 15v22L30 52 0 37V15z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
               backgroundSize: '60px 52px'
             }}
        />
        {/* Subtle curved top border (glass dome inspired) */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        {withPulse && (
          <DataPulse
            color={accentColor}
            active={pulseActive}
            className="opacity-0 group-hover/container:opacity-100 transition-opacity duration-700"
          />
        )}
      </div>

      {withNodes && (
        <>
          <SyncNode color={accentColor} className="absolute -left-1.5 -top-1.5 z-30" />
          <SyncNode color={accentColor} className="absolute -right-1.5 -top-1.5 z-30" />
          <SyncNode color={accentColor} className="absolute -left-1.5 -bottom-1.5 z-30" />
          <SyncNode color={accentColor} className="absolute -right-1.5 -bottom-1.5 z-30" />
        </>
      )}

      {withLines && (
        <>
          <ConnectionLine color={accentColor} className="absolute top-0 left-1/4 right-1/4 w-1/2 group-hover/container:opacity-60 transition-opacity z-20" />
          <ConnectionLine color={accentColor} className="absolute bottom-0 left-1/4 right-1/4 w-1/2 group-hover/container:opacity-60 transition-opacity z-20" />
          <ConnectionLine color={accentColor} orientation="vertical" className="absolute left-0 top-1/4 bottom-1/4 h-1/2 group-hover/container:opacity-40 transition-opacity z-20" />
          <ConnectionLine color={accentColor} orientation="vertical" className="absolute right-0 top-1/4 bottom-1/4 h-1/2 group-hover/container:opacity-40 transition-opacity z-20" />
        </>
      )}

      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}
