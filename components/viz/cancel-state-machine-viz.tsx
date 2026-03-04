"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

interface State {
  id: string;
  label: string;
  color: string;
  description: string;
}

interface Transition {
  from: string;
  to: string;
  label: string;
}

const STATES: State[] = [
  { id: "running", label: "Running", color: "#22C55E", description: "Task executing normally. No cancellation pending." },
  { id: "cancel-requested", label: "Cancel\nRequested", color: "#EAB308", description: "Cancel signal received. Task sees CancelRequested on its Cx. Begins preparing for shutdown." },
  { id: "cancelling", label: "Cancelling", color: "#F97316", description: "Drain phase active. Task has budgeted time to flush buffers, close connections, release locks." },
  { id: "finalizing", label: "Finalizing", color: "#EF4444", description: "Drain budget expired or task finished draining. Registered finalizers execute in LIFO order." },
  { id: "completed", label: "Completed", color: "#3B82F6", description: "All finalizers have run. Resources released. Cancel Fuel fully consumed. Clean exit." },
];

const TRANSITIONS: Transition[] = [
  { from: "running", to: "cancel-requested", label: "cancel signal received" },
  { from: "cancel-requested", to: "cancelling", label: "task acknowledges cancel" },
  { from: "cancelling", to: "finalizing", label: "drain budget expired" },
  { from: "finalizing", to: "completed", label: "finalizers complete" },
];

const BOX_W = 110;
const BOX_H = 56;
const GAP = 28;
const SVG_W = STATES.length * BOX_W + (STATES.length - 1) * GAP + 40;
const SVG_H = 140;

function boxX(index: number) {
  return 20 + index * (BOX_W + GAP);
}

export default function CancelStateMachineViz() {
  const prefersReduced = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const dur = prefersReduced ? 0 : 0.3;

  const advance = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, STATES.length - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const currentState = STATES[currentIndex];
  const currentTransition = currentIndex > 0 ? TRANSITIONS[currentIndex - 1] : null;

  // Cancel fuel decreases with each state
  const fuelPercent = Math.max(0, 100 - (currentIndex / (STATES.length - 1)) * 100);

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <h3 className="mb-1 text-lg font-semibold text-white">Cancel State Machine</h3>
      <p className="mb-5 text-sm text-orange-400">5-state cancellation lifecycle</p>

      {/* State Machine SVG */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="mx-auto w-full"
          aria-label="Cancel state machine with 5 states"
        >
          {/* Arrows between boxes */}
          {TRANSITIONS.map((t, i) => {
            const x1 = boxX(i) + BOX_W;
            const x2 = boxX(i + 1);
            const y = 45;
            const isPassed = i < currentIndex;
            const isActive = i === currentIndex - 1;
            const color = isPassed || isActive ? STATES[i + 1].color : "#1E293B";

            return (
              <g key={`${t.from}-${t.to}`}>
                <motion.line
                  x1={x1}
                  y1={y}
                  x2={x2 - 6}
                  y2={y}
                  stroke={color}
                  strokeWidth={2}
                  animate={{ stroke: color }}
                  transition={{ duration: dur }}
                />
                <motion.polygon
                  points={`${x2 - 6},${y - 4} ${x2},${y} ${x2 - 6},${y + 4}`}
                  fill={color}
                  animate={{ fill: color }}
                  transition={{ duration: dur }}
                />
                {/* Edge label */}
                <text
                  x={(x1 + x2) / 2}
                  y={y + 24}
                  textAnchor="middle"
                  fill={isPassed || isActive ? "#94A3B8" : "#334155"}
                  fontSize={7}
                  fontFamily="inherit"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* State boxes */}
          {STATES.map((s, i) => {
            const x = boxX(i);
            const y = 45 - BOX_H / 2;
            const isActive = i === currentIndex;
            const isPast = i < currentIndex;

            return (
              <g key={s.id}>
                {/* Glow for active state */}
                {isActive && !prefersReduced && (
                  <motion.rect
                    x={x - 3}
                    y={y - 3}
                    width={BOX_W + 6}
                    height={BOX_H + 6}
                    rx={14}
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
                  rx={12}
                  fill={isActive ? `${s.color}22` : isPast ? `${s.color}11` : "#0A1628"}
                  stroke={isActive ? s.color : isPast ? `${s.color}66` : "#1E293B"}
                  strokeWidth={isActive ? 2 : 1}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: dur }}
                  style={{ transformOrigin: `${x + BOX_W / 2}px ${y + BOX_H / 2}px` }}
                />
                {s.label.includes("\n") ? (
                  <text
                    x={x + BOX_W / 2}
                    y={y + BOX_H / 2 - 6}
                    textAnchor="middle"
                    fill={isActive || isPast ? "#fff" : "#64748B"}
                    fontSize={10}
                    fontWeight={isActive ? 700 : 500}
                    fontFamily="inherit"
                  >
                    {s.label.split("\n").map((line, li) => (
                      <tspan key={li} x={x + BOX_W / 2} dy={li === 0 ? 0 : 13}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                ) : (
                  <text
                    x={x + BOX_W / 2}
                    y={y + BOX_H / 2 + 4}
                    textAnchor="middle"
                    fill={isActive || isPast ? "#fff" : "#64748B"}
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

      {/* Cancel Fuel Bar */}
      <div className="mx-auto mt-4 max-w-2xl">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-400">Cancel Fuel</span>
          <span className="font-mono text-white">{Math.round(fuelPercent)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "#0A1628" }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: fuelPercent > 60 ? "#22C55E" : fuelPercent > 30 ? "#F97316" : "#EF4444",
            }}
            animate={{ width: `${fuelPercent}%` }}
            transition={{ duration: prefersReduced ? 0 : 0.5 }}
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-600">
          Monotonically decreasing — guarantees cancellation terminates
        </p>
      </div>

      {/* Status Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentState.id}
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: prefersReduced ? 0 : 0.2 }}
        >
          <span className="text-sm font-bold" style={{ color: currentState.color }}>
            {currentState.label.replace("\n", " ")}
          </span>
          {currentTransition && (
            <span className="text-xs text-slate-600 ml-2">
              (via: {currentTransition.label})
            </span>
          )}
          <p className="text-sm text-slate-400 mt-1">{currentState.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-5 flex justify-center gap-3">
        <button
          onClick={advance}
          disabled={currentIndex >= STATES.length - 1}
          className="rounded-lg px-6 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "#F97316" }}
        >
          Advance
        </button>
        <button
          onClick={reset}
          className="rounded-lg border px-6 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          style={{ borderColor: "#1e293b" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
