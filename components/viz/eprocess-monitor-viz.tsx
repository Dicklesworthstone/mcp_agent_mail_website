"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

const THRESHOLD = 20; // 1/α where α = 0.05
const LAMBDA = 0.5;
const P0 = 0.001;
const MAX_POINTS = 80;

interface DataPoint {
  t: number;
  value: number;
  violated: boolean;
}

export default function EProcessMonitorViz() {
  const prefersReduced = useReducedMotion();
  const [points, setPoints] = useState<DataPoint[]>([{ t: 0, value: 1, violated: false }]);
  const [isRunning, setIsRunning] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [injectViolation, setInjectViolation] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eRef = useRef(1);
  const tRef = useRef(0);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    eRef.current = 1;
    tRef.current = 0;
    setPoints([{ t: 0, value: 1, violated: false }]);
    setRejected(false);
    setInjectViolation(false);
  }, [stop]);

  const tick = useCallback(() => {
    tRef.current += 1;
    // X_t = 1 with probability based on whether violation is injected
    const violationProb = injectViolation ? 0.15 : 0.0005;
    const observed = Math.random() < violationProb ? 1 : 0;

    // E_t = E_{t-1} * (1 + λ * (X_t - p₀))
    const prev = eRef.current;
    const next = prev * (1 + LAMBDA * (observed - P0));
    eRef.current = Math.max(0.001, next);

    const newPoint: DataPoint = {
      t: tRef.current,
      value: eRef.current,
      violated: observed === 1,
    };

    setPoints((prev) => {
      const updated = [...prev, newPoint];
      return updated.length > MAX_POINTS ? updated.slice(-MAX_POINTS) : updated;
    });

    if (eRef.current >= THRESHOLD) {
      setRejected(true);
    }
  }, [injectViolation]);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, prefersReduced ? 200 : 120);
  }, [isRunning, tick, prefersReduced]);

  useEffect(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, prefersReduced ? 200 : 120);
    }
  }, [tick, isRunning, prefersReduced]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Chart dimensions
  const chartW = 560;
  const chartH = 180;
  const padL = 45;
  const padR = 10;
  const padT = 10;
  const padB = 25;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  // Scale
  const maxVal = Math.max(THRESHOLD * 1.3, ...points.map((p) => p.value));
  const minT = points.length > 0 ? points[0].t : 0;
  const maxT = points.length > 1 ? points[points.length - 1].t : 1;

  const scaleX = (t: number) => padL + ((t - minT) / Math.max(1, maxT - minT)) * plotW;
  const scaleY = (v: number) => padT + plotH - (Math.log(Math.max(0.01, v)) / Math.log(maxVal)) * plotH;

  // Build path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.t).toFixed(1)},${scaleY(p.value).toFixed(1)}`)
    .join(" ");

  const thresholdY = scaleY(THRESHOLD);

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <h3 className="mb-1 text-lg font-semibold text-white">E-Process Monitor</h3>
      <p className="mb-5 text-sm text-purple-400">
        Anytime-valid invariant monitoring via Ville&apos;s inequality
      </p>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="mx-auto w-full max-w-2xl"
          aria-label="E-process betting martingale chart"
        >
          {/* Grid lines */}
          {[1, THRESHOLD / 4, THRESHOLD / 2, THRESHOLD].map((v) => (
            <line
              key={v}
              x1={padL}
              y1={scaleY(v)}
              x2={chartW - padR}
              y2={scaleY(v)}
              stroke="#1E293B"
              strokeWidth={0.5}
              strokeDasharray="3 3"
            />
          ))}

          {/* Rejection threshold */}
          <line
            x1={padL}
            y1={thresholdY}
            x2={chartW - padR}
            y2={thresholdY}
            stroke="#EF4444"
            strokeWidth={1.5}
            strokeDasharray="6 3"
          />
          <text x={padL + 4} y={thresholdY - 4} fill="#EF4444" fontSize={8} fontWeight={700}>
            1/α = {THRESHOLD} (reject)
          </text>

          {/* Baseline */}
          <line
            x1={padL}
            y1={scaleY(1)}
            x2={chartW - padR}
            y2={scaleY(1)}
            stroke="#334155"
            strokeWidth={0.5}
          />
          <text x={padL - 3} y={scaleY(1) + 3} textAnchor="end" fill="#475569" fontSize={7}>
            1.0
          </text>

          {/* Y-axis label */}
          <text x={8} y={chartH / 2} fill="#64748B" fontSize={8} textAnchor="middle" transform={`rotate(-90, 8, ${chartH / 2})`}>
            E-value (log)
          </text>

          {/* X-axis label */}
          <text x={chartW / 2} y={chartH - 2} fill="#64748B" fontSize={8} textAnchor="middle">
            observations (t)
          </text>

          {/* E-process line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={rejected ? "#EF4444" : "#A855F7"}
            strokeWidth={2}
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 3px ${rejected ? "#EF4444" : "#A855F7"})` }}
          />

          {/* Violation dots */}
          {points
            .filter((p) => p.violated)
            .map((p) => (
              <circle
                key={p.t}
                cx={scaleX(p.t)}
                cy={scaleY(p.value)}
                r={3}
                fill="#EF4444"
                opacity={0.8}
              />
            ))}

          {/* Current value indicator */}
          {points.length > 0 && (
            <circle
              cx={scaleX(points[points.length - 1].t)}
              cy={scaleY(points[points.length - 1].value)}
              r={4}
              fill={rejected ? "#EF4444" : "#A855F7"}
              style={{ filter: `drop-shadow(0 0 4px ${rejected ? "#EF4444" : "#A855F7"})` }}
            />
          )}
        </svg>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        <motion.div
          key={rejected ? "rejected" : "monitoring"}
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: prefersReduced ? 0 : 0.2 }}
        >
          {rejected ? (
            <div>
              <span className="text-sm font-bold text-red-400">Invariant Violated</span>
              <span className="mx-2 text-slate-600">—</span>
              <span className="text-sm text-slate-400">
                E-value crossed 1/α = {THRESHOLD}. Rejection is valid at any stopping time.
              </span>
            </div>
          ) : (
            <div>
              <span className="text-sm font-bold text-purple-400">
                E = {points.length > 0 ? points[points.length - 1].value.toFixed(3) : "1.000"}
              </span>
              <span className="mx-2 text-slate-600">—</span>
              <span className="text-sm text-slate-400">
                {isRunning ? "Monitoring..." : "Idle"} (λ={LAMBDA}, p₀={P0})
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          onClick={isRunning ? stop : start}
          className="rounded-lg px-5 py-2 text-sm font-medium text-white transition"
          style={{ background: isRunning ? "#EAB308" : "#A855F7" }}
        >
          {isRunning ? "Pause" : "Start Monitoring"}
        </button>
        <button
          onClick={() => setInjectViolation((v) => !v)}
          className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition ${
            injectViolation ? "ring-2 ring-red-500/50" : ""
          }`}
          style={{ background: injectViolation ? "#EF4444" : "#334155" }}
        >
          {injectViolation ? "Injecting Violations" : "Inject Violations"}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border px-5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          style={{ borderColor: "#1e293b" }}
        >
          Reset
        </button>
      </div>

      <p className="mt-3 text-center text-[10px] text-slate-600">
        Toggle &quot;Inject Violations&quot; to simulate oracle invariant failures. Watch the E-value climb toward the rejection threshold.
      </p>
    </div>
  );
}
