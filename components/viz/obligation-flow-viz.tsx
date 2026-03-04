"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type PathKind = "happy" | "abort" | "leak";

interface StepInfo {
  label: string;
  description: string;
  nodeIndex: number;           // which node the permit sits on (0-based)
  color: string;
}

const COLORS = {
  blue:     "#3B82F6",
  blueGlow: "#60A5FA",
  orange:   "#F97316",
  green:    "#22c55e",
  red:      "#EF4444",
  bg:       "#020a14",
  surface:  "#0A1628",
  muted:    "#64748b",
  text:     "#e2e8f0",
} as const;

const PATHS: Record<PathKind, StepInfo[]> = {
  happy: [
    { label: "Reserve",  description: "A linear permit is allocated. The type system now tracks it -- it MUST be used exactly once.", nodeIndex: 0, color: COLORS.blue },
    { label: "Hold",     description: "The permit is actively held while work is performed. Ownership is exclusive and enforced at compile time.", nodeIndex: 1, color: COLORS.green },
    { label: "Send",     description: "Work is complete. The permit is sent (consumed), fulfilling the linear obligation. All good!", nodeIndex: 2, color: COLORS.blueGlow },
  ],
  abort: [
    { label: "Reserve",  description: "A linear permit is allocated, just like normal.", nodeIndex: 0, color: COLORS.blue },
    { label: "Hold",     description: "The permit is held, but something goes wrong -- an error or cancellation occurs.", nodeIndex: 1, color: COLORS.green },
    { label: "Abort",    description: "Even on abort, the linear type forces cleanup. The permit is safely returned. No resource leak!", nodeIndex: 3, color: COLORS.orange },
  ],
  leak: [
    { label: "Reserve",  description: "A linear permit is allocated as usual.", nodeIndex: 0, color: COLORS.blue },
    { label: "Hold",     description: "The permit is held... but the programmer forgets to send or abort it.", nodeIndex: 1, color: COLORS.green },
    { label: "LEAKED!",  description: "Without linear types this would be a silent resource leak. Asupersync catches this at COMPILE TIME -- this code will not build.", nodeIndex: 4, color: COLORS.red },
  ],
};

const PATH_LABELS: Record<PathKind, { label: string; color: string }> = {
  happy: { label: "Happy Path",    color: COLORS.green },
  abort: { label: "Abort Path",    color: COLORS.orange },
  leak:  { label: "Leak Detection", color: COLORS.red },
};

/* ------------------------------------------------------------------ */
/*  Node layout -- positions inside the SVG viewBox (0 0 600 320)      */
/* ------------------------------------------------------------------ */

interface NodeDef {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
}

const NODES: NodeDef[] = [
  { id: "reserved", x: 80,  y: 160, label: "Reserved", color: COLORS.blue },
  { id: "held",     x: 300, y: 160, label: "Held",     color: COLORS.green },
  { id: "sent",     x: 520, y: 80,  label: "Sent",     color: COLORS.blueGlow },
  { id: "aborted",  x: 520, y: 160, label: "Aborted",  color: COLORS.orange },
  { id: "leaked",   x: 520, y: 244, label: "LEAKED!",  color: COLORS.red },
];

const NODE_R = 36;

/* ------------------------------------------------------------------ */
/*  Permit (key) icon                                                  */
/* ------------------------------------------------------------------ */

function PermitIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* key head (circle with cutout) */}
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="2" fill={`${color}22`} />
      <circle cx="8" cy="8" r="2.5" fill={color} opacity={0.6} />
      {/* key shaft */}
      <line x1="14" y1="8" x2="22" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* key teeth */}
      <line x1="18" y1="8" x2="18" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="8" x2="21" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Edge arrows                                                        */
/* ------------------------------------------------------------------ */

function EdgeArrow({ from, to, color, active, reduced }: {
  from: NodeDef; to: NodeDef; color: string; active: boolean; reduced: boolean;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;

  const x1 = from.x + ux * (NODE_R + 4);
  const y1 = from.y + uy * (NODE_R + 4);
  const x2 = to.x   - ux * (NODE_R + 8);
  const y2 = to.y   - uy * (NODE_R + 8);

  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={active ? 2.5 : 1.2}
      strokeLinecap="round"
      strokeDasharray={active ? "none" : "6 4"}
      opacity={active ? 1 : 0.25}
      markerEnd={`url(#arrow-${color.replace("#", "")})`}
      animate={{ opacity: active ? 1 : 0.25, strokeWidth: active ? 2.5 : 1.2 }}
      transition={reduced ? { duration: 0 } : { duration: 0.4 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ObligationFlowViz() {
  const reduced = useReducedMotion() ?? false;
  const [path, setPath] = useState<PathKind>("happy");
  const [step, setStep] = useState(0);
  const [showError, setShowError] = useState(false);

  const steps = PATHS[path];
  const current = steps[step];
  const permitNode = NODES[current.nodeIndex];

  /* Edges that belong to each path */
  const activeEdges = useMemo(() => {
    const s = steps.map((st) => st.nodeIndex);
    const pairs: [number, number][] = [];
    for (let i = 0; i < s.length - 1; i++) pairs.push([s[i], s[i + 1]]);
    return pairs;
  }, [steps]);

  const allEdges: [number, number, string][] = [
    [0, 1, COLORS.muted],
    [1, 2, COLORS.blueGlow],
    [1, 3, COLORS.orange],
    [1, 4, COLORS.red],
  ];

  const selectPath = useCallback((p: PathKind) => {
    setPath(p);
    setStep(0);
    setShowError(false);
  }, []);

  const nextStep = useCallback(() => {
    if (step < steps.length - 1) {
      const next = step + 1;
      setStep(next);
      if (path === "leak" && next === steps.length - 1) {
        setShowError(true);
      }
    }
  }, [step, steps.length, path]);

  const reset = useCallback(() => {
    setStep(0);
    setShowError(false);
  }, []);

  /* Which edge indices are "active" (already traversed) */
  const traversedUpTo = step; // edges 0..step-1 are traversed

  return (
    <div
      className="w-full rounded-2xl border border-white/[0.06] overflow-hidden select-none"
      style={{ background: COLORS.surface }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <PermitIcon color={COLORS.blue} size={20} />
        <span className="text-sm font-semibold tracking-wide" style={{ color: COLORS.text }}>
          Permit Lifecycle &mdash; Linear Obligation System
        </span>
      </div>

      {/* SVG canvas */}
      <div className="relative w-full" style={{ background: COLORS.bg }}>
        <svg
          viewBox="0 0 600 320"
          className="w-full h-auto"
          role="img"
          aria-label="Permit lifecycle flow diagram"
        >
          <defs>
            {/* arrow markers per color */}
            {[COLORS.muted, COLORS.blueGlow, COLORS.orange, COLORS.red].map((c) => (
              <marker
                key={c}
                id={`arrow-${c.replace("#", "")}`}
                viewBox="0 0 10 10"
                refX="8" refY="5"
                markerWidth="6" markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 Z" fill={c} />
              </marker>
            ))}
            {/* glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {allEdges.map(([fromIdx, toIdx, edgeColor]) => {
            const isInPath = activeEdges.some(([a, b]) => a === fromIdx && b === toIdx);
            const edgePairIndex = activeEdges.findIndex(([a, b]) => a === fromIdx && b === toIdx);
            const isTraversed = isInPath && edgePairIndex < traversedUpTo;
            const activeColor = isInPath
              ? steps[edgePairIndex + 1]?.color ?? edgeColor
              : edgeColor;
            return (
              <EdgeArrow
                key={`${fromIdx}-${toIdx}`}
                from={NODES[fromIdx]}
                to={NODES[toIdx]}
                color={isTraversed ? activeColor : COLORS.muted}
                active={isTraversed}
                reduced={reduced}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node, idx) => {
            const isActive = steps.some((s, si) => s.nodeIndex === idx && si <= step);
            const isCurrent = current.nodeIndex === idx;
            return (
              <g key={node.id}>
                {/* glow ring on current */}
                {isCurrent && !reduced && (
                  <motion.circle
                    cx={node.x} cy={node.y} r={NODE_R + 8}
                    fill="none"
                    stroke={current.color}
                    strokeWidth={1.5}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: 1 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    filter="url(#glow)"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />
                )}
                {/* node circle */}
                <motion.circle
                  cx={node.x} cy={node.y} r={NODE_R}
                  fill={isActive ? `${node.color}18` : `${COLORS.muted}0a`}
                  stroke={isActive ? node.color : COLORS.muted}
                  strokeWidth={isCurrent ? 2.5 : 1.2}
                  animate={{
                    fill: isActive ? `${node.color}18` : `${COLORS.muted}0a`,
                    stroke: isActive ? node.color : COLORS.muted,
                    strokeWidth: isCurrent ? 2.5 : 1.2,
                  }}
                  transition={reduced ? { duration: 0 } : { duration: 0.4 }}
                />
                {/* node label */}
                <text
                  x={node.x} y={node.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={isActive ? node.color : COLORS.muted}
                  fontSize="11" fontWeight={600} fontFamily="inherit"
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Animated permit icon */}
          <motion.g
            animate={{ x: permitNode.x - 11, y: permitNode.y - NODE_R - 22 }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 180, damping: 22 }
            }
          >
            <PermitIcon color={current.color} size={22} />
          </motion.g>
        </svg>

        {/* Compile-error flash overlay */}
        <AnimatePresence>
          {showError && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.3 }}
            >
              <motion.div
                className="px-6 py-4 rounded-xl border-2 text-center pointer-events-auto"
                style={{
                  background: `${COLORS.bg}ee`,
                  borderColor: COLORS.red,
                  boxShadow: `0 0 40px ${COLORS.red}44`,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={
                  reduced
                    ? { scale: 1, opacity: 1 }
                    : { scale: [0.8, 1.05, 1], opacity: 1 }
                }
                transition={reduced ? { duration: 0 } : { duration: 0.5 }}
              >
                <div className="text-lg font-bold tracking-widest mb-1" style={{ color: COLORS.red }}>
                  COMPILE ERROR
                </div>
                <div className="text-xs" style={{ color: COLORS.text }}>
                  Linear permit was never consumed.
                  <br />
                  Asupersync rejects this at compile time.
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls + description */}
      <div className="px-5 py-4 space-y-4 border-t border-white/[0.06]">
        {/* Path selectors */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PATHS) as PathKind[]).map((p) => {
            const meta = PATH_LABELS[p];
            const isSelected = p === path;
            return (
              <button
                key={p}
                onClick={() => selectPath(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  background: isSelected ? `${meta.color}22` : `${COLORS.muted}14`,
                  color: isSelected ? meta.color : COLORS.muted,
                  border: `1px solid ${isSelected ? meta.color : "transparent"}`,
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Step controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={nextStep}
            disabled={step >= steps.length - 1}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: COLORS.blue, color: "#fff" }}
          >
            Next Step
          </button>
          <button
            onClick={reset}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            style={{
              background: `${COLORS.muted}18`,
              color: COLORS.muted,
              border: `1px solid ${COLORS.muted}33`,
            }}
          >
            Reset
          </button>
          {/* step indicator */}
          <div className="flex gap-1.5 ml-auto">
            {steps.map((s, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors"
                style={{
                  background: i <= step ? current.color : `${COLORS.muted}44`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${path}-${step}`}
            initial={reduced ? {} : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -4 }}
            transition={reduced ? { duration: 0 } : { duration: 0.25 }}
            className="text-sm leading-relaxed"
            style={{ color: COLORS.text }}
          >
            <span className="font-bold mr-1.5" style={{ color: current.color }}>
              {current.label}:
            </span>
            {current.description}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
