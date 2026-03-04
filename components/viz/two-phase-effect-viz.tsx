"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

type Stage = "idle" | "reserving" | "reserved" | "checkpoint" | "committing" | "committed" | "cancelled";

const STAGE_INFO: Record<Stage, { label: string; description: string; color: string }> = {
  idle: { label: "Idle", description: "No effects staged. Ready to begin.", color: "#64748B" },
  reserving: { label: "Reserving", description: "Staging side effects. Each reservation is reversible.", color: "#F97316" },
  reserved: { label: "Reserved", description: "Both effects staged. Waiting for cancellation checkpoint.", color: "#EAB308" },
  checkpoint: { label: "Checkpoint", description: "Checking for pending cancellation. Safe to proceed?", color: "#3B82F6" },
  committing: { label: "Committing", description: "Applying effects atomically. Past the point of no return.", color: "#8B5CF6" },
  committed: { label: "Committed", description: "Both effects applied permanently. Operation complete.", color: "#22C55E" },
  cancelled: { label: "Rolled Back", description: "Cancellation detected at checkpoint. All reservations automatically reversed.", color: "#EF4444" },
};

const COLUMNS = [
  { id: "reserve", label: "Reserve", x: 0 },
  { id: "checkpoint", label: "Checkpoint", x: 1 },
  { id: "commit", label: "Commit", x: 2 },
] as const;

export default function TwoPhaseEffectViz() {
  const prefersReduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>("idle");
  const [, setCancelAt] = useState<"none" | "before" | "after">("none");
  const [isAnimating, setIsAnimating] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setStage("idle");
    setCancelAt("none");
    setIsAnimating(false);
  }, [clearTimers]);

  const runDemo = useCallback((cancelBefore: boolean) => {
    if (isAnimating) return;
    reset();
    setIsAnimating(true);
    setCancelAt(cancelBefore ? "before" : "after");

    const t1 = setTimeout(() => setStage("reserving"), 400);
    const t2 = setTimeout(() => setStage("reserved"), 1200);
    const t3 = setTimeout(() => setStage("checkpoint"), 2000);

    if (cancelBefore) {
      const t4 = setTimeout(() => {
        setStage("cancelled");
        setIsAnimating(false);
      }, 2800);
      timersRef.current = [t1, t2, t3, t4];
    } else {
      const t4 = setTimeout(() => setStage("committing"), 2800);
      const t5 = setTimeout(() => {
        setStage("committed");
        setIsAnimating(false);
      }, 3600);
      timersRef.current = [t1, t2, t3, t4, t5];
    }
  }, [isAnimating, reset]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const info = STAGE_INFO[stage];
  const dur = prefersReduced ? 0 : 0.4;

  // Token position: 0 = reserve, 1 = checkpoint, 2 = commit, -1 = rolled back
  const tokenPos = (() => {
    switch (stage) {
      case "idle": return -0.5;
      case "reserving": return 0;
      case "reserved": return 0.3;
      case "checkpoint": return 1;
      case "committing": return 1.5;
      case "committed": return 2;
      case "cancelled": return -0.5;
    }
  })();

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <h3 className="mb-1 text-lg font-semibold text-white">Two-Phase Effects</h3>
      <p className="mb-6 text-sm" style={{ color: "#F97316" }}>Reserve → Checkpoint → Commit</p>

      {/* Pipeline SVG */}
      <div className="overflow-x-auto">
        <svg viewBox="0 0 600 120" className="mx-auto w-full max-w-2xl" aria-label="Two-phase effect pipeline">
          {/* Column backgrounds */}
          {COLUMNS.map((col, i) => (
            <g key={col.id}>
              <rect
                x={30 + i * 190}
                y={10}
                width={170}
                height={80}
                rx={12}
                fill={stage !== "idle" && (
                  (col.id === "reserve" && ["reserving", "reserved"].includes(stage)) ||
                  (col.id === "checkpoint" && stage === "checkpoint") ||
                  (col.id === "commit" && ["committing", "committed"].includes(stage))
                ) ? `${info.color}15` : "#0A1628"}
                stroke={stage !== "idle" && (
                  (col.id === "reserve" && ["reserving", "reserved"].includes(stage)) ||
                  (col.id === "checkpoint" && stage === "checkpoint") ||
                  (col.id === "commit" && ["committing", "committed"].includes(stage))
                ) ? `${info.color}66` : "#1E293B"}
                strokeWidth={1}
              />
              <text
                x={115 + i * 190}
                y={55}
                textAnchor="middle"
                fill={stage !== "idle" && (
                  (col.id === "reserve" && ["reserving", "reserved", "checkpoint", "committing", "committed"].includes(stage)) ||
                  (col.id === "checkpoint" && ["checkpoint", "committing", "committed"].includes(stage)) ||
                  (col.id === "commit" && ["committing", "committed"].includes(stage))
                ) ? "#E2E8F0" : "#475569"}
                fontSize={13}
                fontWeight={700}
                fontFamily="inherit"
              >
                {col.label}
              </text>
            </g>
          ))}

          {/* Arrows between columns */}
          {[0, 1].map(i => (
            <g key={`arrow-${i}`}>
              <line x1={200 + i * 190} y1={50} x2={220 + i * 190} y2={50} stroke="#334155" strokeWidth={1.5} strokeDasharray="4 3" />
              <polygon points={`${218 + i * 190},46 ${224 + i * 190},50 ${218 + i * 190},54`} fill="#334155" />
            </g>
          ))}

          {/* Animated token */}
          {stage !== "idle" && stage !== "cancelled" && (
            <motion.circle
              cx={115}
              cy={50}
              r={8}
              fill={info.color}
              animate={{
                cx: 115 + tokenPos * 190,
                fill: info.color,
              }}
              transition={{ duration: dur, ease: "easeInOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${info.color})` }}
            />
          )}

          {/* Rollback animation */}
          <AnimatePresence>
            {stage === "cancelled" && (
              <motion.g
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
              >
                <motion.circle
                  cx={115 + 1 * 190}
                  cy={50}
                  r={8}
                  fill="#EF4444"
                  animate={{ cx: 115 - 0.5 * 190, opacity: [1, 0.5, 0] }}
                  transition={{ duration: prefersReduced ? 0 : 0.8 }}
                />
                <motion.text
                  x={300}
                  y={110}
                  textAnchor="middle"
                  fill="#EF4444"
                  fontSize={11}
                  fontWeight={700}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Reservations rolled back
                </motion.text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: prefersReduced ? 0 : 0.2 }}
        >
          <span className="text-sm font-bold" style={{ color: info.color }}>{info.label}</span>
          <span className="mx-2 text-slate-600">—</span>
          <span className="text-sm text-slate-400">{info.description}</span>
        </motion.div>
      </AnimatePresence>

      {/* Buttons */}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => runDemo(false)}
          disabled={isAnimating}
          className="rounded-lg px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "#22C55E" }}
        >
          Run (No Cancel)
        </button>
        <button
          onClick={() => runDemo(true)}
          disabled={isAnimating}
          className="rounded-lg px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "#EF4444" }}
        >
          Run (Cancel at Checkpoint)
        </button>
        <button
          onClick={reset}
          className="rounded-lg border px-5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          style={{ borderColor: "#1e293b" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
