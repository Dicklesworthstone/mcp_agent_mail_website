"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

type Phase =
  | "Running"
  | "CancelRequested"
  | "Draining"
  | "Finalizing"
  | "Completed";

type TokioPhase = "Running" | "Dropped";

const STATES: { id: Phase; label: string; color: string }[] = [
  { id: "Running", label: "Running", color: "#22c55e" },
  { id: "CancelRequested", label: "Cancel\nRequested", color: "#eab308" },
  { id: "Draining", label: "Draining", color: "#f97316" },
  { id: "Finalizing", label: "Finalizing", color: "#ef4444" },
  { id: "Completed", label: "Completed", color: "#3b82f6" },
];

const STATUS_TEXT: Record<Phase, string> = {
  Running: "All tasks executing normally.",
  CancelRequested:
    "Cancel signal received. Notifying running tasks of shutdown budget...",
  Draining:
    "Tasks winding down gracefully. Flushing buffers, closing connections...",
  Finalizing:
    "Budget nearly exhausted. Forcing remaining stragglers to complete...",
  Completed:
    "All resources released cleanly. Zero leaked state. Zero lost writes.",
};

const TOKIO_TEXT: Record<TokioPhase, string> = {
  Running: "Tasks running...",
  Dropped: "Runtime dropped. In-flight futures abandoned mid-execution.",
};

const BOX_W = 110;
const BOX_H = 50;
const GAP = 30;
const TOTAL_W = STATES.length * BOX_W + (STATES.length - 1) * GAP;

const SVG_W = TOTAL_W + 40;
const SVG_H = BOX_H + 40;

function boxX(index: number) {
  return 20 + index * (BOX_W + GAP);
}

const BUDGET_DURATION = 3000;

export default function CancelProtocolViz() {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("Running");
  const [tokioPhase, setTokioPhase] = useState<TokioPhase>("Running");
  const [budget, setBudget] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLeak, setShowLeak] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearAllTimers();
    setIsAnimating(false);
    setPhase("Running");
    setTokioPhase("Running");
    setBudget(100);
    setShowLeak(false);
  }, [clearAllTimers]);

  const triggerCancel = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Immediate: Running -> CancelRequested
    setPhase("CancelRequested");
    setBudget(100);

    // Tokio: instant drop
    const tokioDrop = setTimeout(() => {
      setTokioPhase("Dropped");
      setShowLeak(true);
    }, 400);
    timersRef.current.push(tokioDrop);

    // Start budget countdown
    const budgetStart = Date.now();
    const budgetInterval = setInterval(() => {
      const elapsed = Date.now() - budgetStart;
      const remaining = Math.max(0, 100 - (elapsed / BUDGET_DURATION) * 100);
      setBudget(remaining);
      if (remaining <= 0) clearInterval(budgetInterval);
    }, 30);
    intervalsRef.current.push(budgetInterval);

    // CancelRequested -> Draining
    const t1 = setTimeout(() => setPhase("Draining"), 500);
    // Draining -> Finalizing
    const t2 = setTimeout(() => setPhase("Finalizing"), 1500);
    // Finalizing -> Completed
    const t3 = setTimeout(() => {
      setPhase("Completed");
      setBudget(0);
      setIsAnimating(false);
      clearInterval(budgetInterval);
    }, 2500);
    timersRef.current.push(t1, t2, t3);
  }, [isAnimating]);

  // Clean up on unmount
  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const activeIndex = STATES.findIndex((s) => s.id === phase);
  const dur = prefersReduced ? 0 : 0.3;

  return (
    <div
      className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950"
    >
      <h3 className="mb-1 text-lg font-semibold text-white">
        Asupersync Cancel Protocol
      </h3>
      <p className="mb-5 text-sm" style={{ color: "#60A5FA" }}>
        Graceful shutdown state machine
      </p>

      {/* ---- State Machine SVG ---- */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="mx-auto w-full max-w-2xl"
          aria-label="Cancel protocol state machine"
        >
          {/* Arrows between boxes */}
          {STATES.slice(0, -1).map((_, i) => {
            const x1 = boxX(i) + BOX_W;
            const x2 = boxX(i + 1);
            const y = SVG_H / 2;
            const passed = i < activeIndex;
            return (
              <g key={`arrow-${i}`}>
                <motion.line
                  x1={x1}
                  y1={y}
                  x2={x2 - 6}
                  y2={y}
                  stroke={passed ? STATES[i + 1].color : "#1e293b"}
                  strokeWidth={2}
                  animate={{ stroke: passed ? STATES[i + 1].color : "#1e293b" }}
                  transition={{ duration: dur }}
                />
                <motion.polygon
                  points={`${x2 - 6},${y - 4} ${x2},${y} ${x2 - 6},${y + 4}`}
                  fill={passed ? STATES[i + 1].color : "#1e293b"}
                  animate={{ fill: passed ? STATES[i + 1].color : "#1e293b" }}
                  transition={{ duration: dur }}
                />
              </g>
            );
          })}

          {/* State boxes */}
          {STATES.map((s, i) => {
            const x = boxX(i);
            const y = SVG_H / 2 - BOX_H / 2;
            const isActive = s.id === phase;
            const isPast = i < activeIndex;
            return (
              <g key={s.id}>
                {/* Glow */}
                {isActive && !prefersReduced && (
                  <motion.rect
                    x={x - 3}
                    y={y - 3}
                    width={BOX_W + 6}
                    height={BOX_H + 6}
                    rx={12}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <motion.rect
                  x={x}
                  y={y}
                  width={BOX_W}
                  height={BOX_H}
                  rx={10}
                  fill={isActive ? s.color + "22" : isPast ? s.color + "11" : "#0A1628"}
                  stroke={isActive ? s.color : isPast ? s.color + "66" : "#1e293b"}
                  strokeWidth={isActive ? 2 : 1}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    fill: isActive ? s.color + "22" : isPast ? s.color + "11" : "#0A1628",
                    stroke: isActive ? s.color : isPast ? s.color + "66" : "#1e293b",
                  }}
                  transition={{ duration: dur }}
                  style={{ transformOrigin: `${x + BOX_W / 2}px ${y + BOX_H / 2}px` }}
                />
                {/* Label — handle newline for "Cancel\nRequested" */}
                {s.label.includes("\n") ? (
                  <text
                    x={x + BOX_W / 2}
                    y={y + BOX_H / 2 - 6}
                    textAnchor="middle"
                    fill={isActive || isPast ? "#fff" : "#64748b"}
                    fontSize={10}
                    fontWeight={isActive ? 700 : 500}
                    fontFamily="inherit"
                  >
                    {s.label.split("\n").map((line, li) => (
                      <tspan
                        key={li}
                        x={x + BOX_W / 2}
                        dy={li === 0 ? 0 : 13}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                ) : (
                  <text
                    x={x + BOX_W / 2}
                    y={y + BOX_H / 2 + 4}
                    textAnchor="middle"
                    fill={isActive || isPast ? "#fff" : "#64748b"}
                    fontSize={10}
                    fontWeight={isActive ? 700 : 500}
                    fontFamily="inherit"
                  >
                    {s.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ---- Budget Bar ---- */}
      <div className="mx-auto mt-4 max-w-2xl">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-400">Shutdown Budget</span>
          <span className="font-mono text-white">{Math.round(budget)}%</span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900/40"
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                budget > 60
                  ? "#22c55e"
                  : budget > 30
                    ? "#f97316"
                    : "#ef4444",
            }}
            animate={{ width: `${budget}%` }}
            transition={{ duration: prefersReduced ? 0 : 0.05 }}
          />
        </div>
      </div>

      {/* ---- Status Text ---- */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-300"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: prefersReduced ? 0 : 0.2 }}
        >
          {STATUS_TEXT[phase]}
        </motion.p>
      </AnimatePresence>

      {/* ---- Buttons ---- */}
      <div className="mx-auto mt-5 flex max-w-2xl justify-center gap-3">
        <button
          onClick={triggerCancel}
          disabled={isAnimating || phase === "Completed"}
          className="rounded-lg px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          style={{ background: "#F97316" }}
        >
          Trigger Cancel
        </button>
        <button
          onClick={reset}
          className="rounded-lg border px-5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          style={{ borderColor: "#1e293b" }}
        >
          Reset
        </button>
      </div>

      {/* ---- Comparison Panel ---- */}
      <div
        className="mx-auto mt-6 max-w-2xl rounded-xl border p-4 bg-slate-900/40"
        style={{ borderColor: "#1e293b" }}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Comparison: Tokio&apos;s Approach
        </p>
        <div className="flex items-center gap-4">
          {/* Running box */}
          <div
            className="flex h-10 items-center justify-center rounded-lg border px-4 text-xs font-medium"
            style={{
              borderColor:
                tokioPhase === "Running" ? "#22c55e" : "#22c55e66",
              color: tokioPhase === "Running" ? "#fff" : "#64748b",
              background:
                tokioPhase === "Running" ? "#22c55e22" : "transparent",
            }}
          >
            Running
          </div>

          {/* Arrow */}
          <svg width="32" height="12" viewBox="0 0 32 12">
            <line
              x1="0"
              y1="6"
              x2="26"
              y2="6"
              stroke={tokioPhase === "Dropped" ? "#ef4444" : "#1e293b"}
              strokeWidth={2}
            />
            <polygon
              points="26,2 32,6 26,10"
              fill={tokioPhase === "Dropped" ? "#ef4444" : "#1e293b"}
            />
          </svg>

          {/* Dropped box */}
          <div
            className="flex h-10 items-center justify-center rounded-lg border px-4 text-xs font-medium"
            style={{
              borderColor:
                tokioPhase === "Dropped" ? "#ef4444" : "#1e293b",
              color: tokioPhase === "Dropped" ? "#fff" : "#64748b",
              background:
                tokioPhase === "Dropped" ? "#ef444422" : "transparent",
            }}
          >
            Dropped
          </div>

          {/* Leaked warning */}
          <AnimatePresence>
            {showLeak && (
              <motion.span
                className="ml-2 rounded-md px-3 py-1 text-xs font-bold"
                style={{ background: "#ef444433", color: "#ef4444" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [1, 0.6, 1], scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: prefersReduced ? 0 : 0.8,
                  opacity: {
                    duration: prefersReduced ? 0 : 1.2,
                    repeat: Infinity,
                  },
                }}
              >
                Resources Leaked!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={tokioPhase}
            className="mt-2 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
          >
            {TOKIO_TEXT[tokioPhase]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
