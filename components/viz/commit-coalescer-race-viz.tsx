"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { Play, Pause, RotateCcw } from "lucide-react";

// ---- Constants ---------------------------------------------------------------

const COLORS = [
  "#60a5fa", "#a78bfa", "#f472b6", "#fb923c",
  "#34d399", "#fbbf24", "#f87171", "#14b8a6",
];

const LANE_H = 24;
const QUEUE_X = 140;
const GIT_X = 260;

// ---- Types -------------------------------------------------------------------

interface WriteOp {
  id: number;
  color: string;
  x: number;
  state: "queued" | "committing" | "done" | "error" | "batched";
  progress: number;
  batchId: number;
}

interface SimState {
  left: WriteOp[];
  right: WriteOp[];
  leftCommits: number;
  rightCommits: number;
  leftMessages: number;
  rightMessages: number;
  leftErrors: number;
  rightErrors: number;
  leftLockActive: boolean;
  rightBatchQueue: number;
  rightBatchFlushCount: number;
  elapsed: number;
  nextId: number;
  rightBatchTimer: number;
}

// ---- Component ---------------------------------------------------------------

export default function CommitCoalescerRaceViz() {
  const prefersReducedMotion = useVizReducedMotion();
  const [isRunning, setIsRunning] = useState(false);
  const [messageRate, setMessageRate] = useState(8);
  const [batchWindow, setBatchWindow] = useState(500);
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);

  const [state, setState] = useState<SimState>(() => initState());

  const paramsRef = useRef({ messageRate, batchWindow, speed });
  useEffect(() => {
    paramsRef.current = { messageRate, batchWindow, speed };
  }, [messageRate, batchWindow, speed]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setState(initState());
    lastTimeRef.current = 0;
    spawnTimerRef.current = 0;
  }, []);

  const tickRef = useRef<(now: number) => void>(undefined);
  useEffect(() => {
    tickRef.current = (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const rawDelta = now - lastTimeRef.current;
      const delta = rawDelta * paramsRef.current.speed;
      lastTimeRef.current = now;
      if (delta > 0 && delta < 200) {
        spawnTimerRef.current += delta;
        const spawnInterval = 1000 / paramsRef.current.messageRate;
        let spawns = 0;
        while (spawnTimerRef.current >= spawnInterval && spawns < 3) {
          spawnTimerRef.current -= spawnInterval;
          spawns++;
        }
        setState((prev) =>
          simulateTick(prev, delta, paramsRef.current, spawns)
        );
      }
      rafRef.current = requestAnimationFrame((t) => tickRef.current?.(t));
    };
  });

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      spawnTimerRef.current = 0;
      rafRef.current = requestAnimationFrame((t) => tickRef.current?.(t));
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning]);

  const elapsedSec = state.elapsed / 1000;
  const leftMps = elapsedSec > 0.5 ? Math.round(state.leftMessages / elapsedSec) : 0;
  const rightMps = elapsedSec > 0.5 ? Math.round(state.rightMessages / elapsedSec) : 0;
  const batchRatio =
    state.rightCommits > 0
      ? (state.rightMessages / state.rightCommits).toFixed(1)
      : "0";

  if (prefersReducedMotion) {
    return (
      <VizSurface aria-label="Commit coalescer comparison (reduced motion)">
        <VizHeader
          accent="cyan"
          eyebrow="Write Pipeline"
          title="Commit Coalescer: Python vs Rust"
          subtitle="Python commits every message individually, causing lock contention. Rust batches via a write-behind queue."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-red-500/20 bg-black/40 p-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400">Python</div>
            <div className="text-xs font-bold text-red-300">1 commit per message</div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Every send_message triggers an immediate git commit. Under 30-agent load,
              index.lock contention causes cascading failures and SQLITE_BUSY errors.
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Rust</div>
            <div className="text-xs font-bold text-cyan-300">Write-Behind Queue</div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Messages queue in a write-behind buffer. The commit coalescer flushes
              periodically, achieving 9.1x batching ratio (100 writes to 11 commits).
            </p>
          </div>
        </div>
      </VizSurface>
    );
  }

  return (
    <VizSurface aria-label="Commit coalescer race simulation">
      <VizHeader
        accent="cyan"
        eyebrow="Write Pipeline"
        title="Commit Coalescer: Python vs Rust"
        subtitle="Watch how batching write-behind queues eliminate git lock contention under load."
        controls={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning((r) => !r)}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:border-cyan-500/30 focus-visible:ring-2 focus-visible:ring-cyan-500/50 outline-none"
              aria-label={isRunning ? "Pause" : "Play"}
            >
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:border-cyan-500/30 focus-visible:ring-2 focus-visible:ring-cyan-500/50 outline-none"
              aria-label="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        }
      />

      {/* Metrics row */}
      <div className="mb-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
        <VizMetricCard label="Python Commits" value={state.leftCommits} tone="red" />
        <VizMetricCard label="Rust Commits" value={state.rightCommits} tone="blue" />
        <VizMetricCard label="Batch Ratio" value={`${batchRatio}x`} tone="green" />
        <VizMetricCard label="Lock Errors" value={state.leftErrors} tone="red" />
      </div>

      {/* Split screen race */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <RacePanel
          label="Python"
          sublabel="1 commit per message"
          mps={leftMps}
          commits={state.leftCommits}
          accent={false}
          lockActive={state.leftLockActive}
          errors={state.leftErrors}
        >
          <PythonWriteViz ops={state.left} lockActive={state.leftLockActive} />
        </RacePanel>

        <RacePanel
          label="Rust"
          sublabel="Write-Behind Queue"
          mps={rightMps}
          commits={state.rightCommits}
          accent={true}
          lockActive={false}
          errors={0}
          batchQueue={state.rightBatchQueue}
          batchFlushes={state.rightBatchFlushCount}
        >
          <RustWriteViz ops={state.right} batchQueue={state.rightBatchQueue} />
        </RacePanel>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-xl border border-white/5 bg-black/20">
        <SliderControl
          label={`Msg/sec: ${messageRate}`}
          min={1}
          max={20}
          step={1}
          value={messageRate}
          onChange={setMessageRate}
        />
        <SliderControl
          label={`Batch: ${batchWindow}ms`}
          min={100}
          max={2000}
          step={100}
          value={batchWindow}
          onChange={setBatchWindow}
        />
        <SliderControl
          label={`${speed}x`}
          min={0.5}
          max={3}
          step={0.5}
          value={speed}
          onChange={setSpeed}
        />
      </div>

      <VizLearningBlock
        accent="cyan"
        title="Key Insights"
        items={[
          "Python: 1 message = 1 git commit. Under load, concurrent commits fight over index.lock.",
          "Rust: Write-behind queue accumulates messages, then batch-commits (9.1x reduction observed in stress tests).",
          "Lock-free git plumbing commits avoid index.lock entirely in most cases.",
          "Stale lock recovery: crashed-process locks detected via PID checking and cleaned automatically.",
        ]}
      />
    </VizSurface>
  );
}

// ---- UI sub-components -------------------------------------------------------

function RacePanel({
  label,
  sublabel,
  mps,
  commits,
  accent,
  lockActive,
  errors,
  batchQueue,
  batchFlushes,
  children,
}: {
  label: string;
  sublabel: string;
  mps: number;
  commits: number;
  accent: boolean;
  lockActive: boolean;
  errors: number;
  batchQueue?: number;
  batchFlushes?: number;
  children: React.ReactNode;
}) {
  const borderClass = accent ? "border-cyan-500/20" : "border-red-500/20";
  const labelColor = accent ? "text-cyan-500" : "text-red-400";
  const subColor = accent ? "text-cyan-400/80" : "text-red-300/80";

  return (
    <div className={`rounded-xl border ${borderClass} bg-black/40 p-3 md:p-4 overflow-hidden`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${labelColor}`}>
            {label}
          </div>
          <div className={`text-xs font-bold ${subColor}`}>{sublabel}</div>
        </div>
        <div className="text-right space-y-0.5">
          <div className={`text-lg font-black tabular-nums ${accent ? "text-cyan-400" : "text-red-400"}`}>
            {mps}
          </div>
          <div className={`text-[8px] font-black uppercase tracking-widest ${accent ? "text-cyan-600" : "text-red-600"}`}>
            msg/sec
          </div>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${accent ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/10" : "border-slate-600 text-slate-400 bg-slate-800"}`}>
          Commits: {commits}
        </span>
        {lockActive && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/40 text-red-300 bg-red-500/15 animate-pulse">
            LOCK HELD
          </span>
        )}
        {errors > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/40 text-red-300 bg-red-500/15">
            Errors: {errors}
          </span>
        )}
        {batchQueue !== undefined && batchQueue > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 text-amber-300 bg-amber-500/10">
            Queued: {batchQueue}
          </span>
        )}
        {batchFlushes !== undefined && batchFlushes > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/30 text-green-300 bg-green-500/10">
            Flushes: {batchFlushes}
          </span>
        )}
      </div>

      <svg viewBox="0 0 320 200" className="w-full" style={{ minHeight: 180 }}>
        {children}
      </svg>
    </div>
  );
}

function SliderControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="font-bold text-slate-400 whitespace-nowrap">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 md:w-24 accent-cyan-500 h-6"
      />
    </label>
  );
}

// ---- SVG viz components ------------------------------------------------------

function PythonWriteViz({
  ops,
  lockActive,
}: {
  ops: WriteOp[];
  lockActive: boolean;
}) {
  return (
    <>
      {/* Lock barrier */}
      <line
        x1={QUEUE_X}
        y1={4}
        x2={QUEUE_X}
        y2={188}
        stroke="#ef4444"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        opacity={lockActive ? 0.7 : 0.25}
      />
      <text
        x={QUEUE_X}
        y={196}
        textAnchor="middle"
        fill="#ef4444"
        fontSize={7}
        fontWeight={900}
        opacity={0.5}
      >
        index.lock
      </text>

      {/* Git repo icon */}
      <rect x={GIT_X} y={70} width={45} height={55} rx={5} fill="rgba(255,255,255,0.02)" stroke="#475569" strokeWidth={1} opacity={0.5} />
      <text x={GIT_X + 22} y={92} textAnchor="middle" fill="#475569" fontSize={8} fontWeight={900}>
        .git
      </text>
      <text x={GIT_X + 22} y={105} textAnchor="middle" fill="#475569" fontSize={6} fontWeight={700}>
        archive
      </text>

      {/* Write ops */}
      {ops.map((op, i) => {
        const y = 12 + (i % 8) * LANE_H;
        const isWriting = op.state === "committing";
        const isDone = op.state === "done";
        const isError = op.state === "error";
        const wx = isWriting
          ? QUEUE_X + 8 + op.progress * (GIT_X - QUEUE_X - 20)
          : isDone
            ? GIT_X - 5
            : Math.min(op.x, QUEUE_X - 10);

        return (
          <g key={op.id}>
            <line x1={8} y1={y} x2={QUEUE_X - 2} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
            {/* Write dot */}
            <circle
              cx={wx}
              cy={y}
              r={4}
              fill={isError ? "#ef4444" : op.color}
              opacity={isDone ? 0.3 : isError ? 0.8 : op.state === "queued" && op.x >= QUEUE_X - 14 ? 0.4 : 0.85}
            >
              {op.state === "queued" && op.x >= QUEUE_X - 14 && (
                <animate attributeName="opacity" values="0.25;0.55;0.25" dur="0.8s" repeatCount="indefinite" />
              )}
            </circle>
            {/* Label */}
            <text x={10} y={y + 3} fill={op.color} fontSize={6} fontWeight={700} opacity={0.4}>
              M{op.id}
            </text>
            {/* BUSY tag */}
            {op.state === "queued" && op.x >= QUEUE_X - 14 && (
              <text x={wx + 7} y={y + 3} fill="#ef4444" fontSize={5} fontWeight={900} opacity={0.7}>
                BUSY
              </text>
            )}
            {/* Error flash */}
            {isError && (
              <>
                <circle cx={wx} cy={y} r={8} fill="#ef4444" opacity={0.15}>
                  <animate attributeName="r" values="4;12;4" dur="0.6s" repeatCount="indefinite" />
                </circle>
                <text x={wx + 8} y={y + 3} fill="#ef4444" fontSize={5} fontWeight={900}>
                  ERR
                </text>
              </>
            )}
            {/* Commit line to git */}
            {isWriting && (
              <line
                x1={wx + 4}
                y1={y}
                x2={GIT_X}
                y2={97}
                stroke={op.color}
                strokeWidth={1}
                opacity={0.2}
                strokeDasharray="3 3"
              />
            )}
          </g>
        );
      })}
    </>
  );
}

function RustWriteViz({
  ops,
  batchQueue,
}: {
  ops: WriteOp[];
  batchQueue: number;
}) {
  return (
    <>
      {/* Write-behind queue box */}
      <rect
        x={QUEUE_X - 25}
        y={30}
        width={50}
        height={130}
        rx={6}
        fill="rgba(6,182,212,0.06)"
        stroke="rgba(6,182,212,0.25)"
        strokeWidth={1}
      />
      <text x={QUEUE_X} y={24} textAnchor="middle" fill="#06B6D4" fontSize={6} fontWeight={900} opacity={0.6}>
        WBQ
      </text>
      <text x={QUEUE_X} y={170} textAnchor="middle" fill="#06B6D4" fontSize={5} fontWeight={700} opacity={0.4}>
        {batchQueue} queued
      </text>

      {/* Batch fill indicator */}
      {batchQueue > 0 && (
        <rect
          x={QUEUE_X - 23}
          y={158 - Math.min(batchQueue * 12, 120)}
          width={46}
          height={Math.min(batchQueue * 12, 120)}
          rx={4}
          fill="rgba(6,182,212,0.12)"
          stroke="rgba(6,182,212,0.15)"
          strokeWidth={0.5}
        />
      )}

      {/* Git repo icon */}
      <rect x={GIT_X} y={70} width={45} height={55} rx={5} fill="rgba(6,182,212,0.04)" stroke="#06B6D4" strokeWidth={1} opacity={0.4} />
      <text x={GIT_X + 22} y={92} textAnchor="middle" fill="#06B6D4" fontSize={8} fontWeight={900} opacity={0.7}>
        .git
      </text>
      <text x={GIT_X + 22} y={105} textAnchor="middle" fill="#06B6D4" fontSize={6} fontWeight={700} opacity={0.5}>
        archive
      </text>

      {/* Batch flush arrow */}
      {ops.some((o) => o.state === "batched") && (
        <>
          <line
            x1={QUEUE_X + 25}
            y1={97}
            x2={GIT_X - 2}
            y2={97}
            stroke="#06B6D4"
            strokeWidth={2}
            opacity={0.5}
          />
          <polygon
            points={`${GIT_X - 2},93 ${GIT_X + 4},97 ${GIT_X - 2},101`}
            fill="#06B6D4"
            opacity={0.5}
          />
          <text x={(QUEUE_X + 25 + GIT_X) / 2} y={88} textAnchor="middle" fill="#22D3EE" fontSize={6} fontWeight={900} opacity={0.6}>
            BATCH
          </text>
        </>
      )}

      {/* Write ops */}
      {ops.map((op, i) => {
        const y = 12 + (i % 8) * LANE_H;

        let wx: number;
        let wy = y;
        if (op.state === "done") {
          wx = GIT_X - 5;
        } else if (op.state === "batched") {
          // Moving from queue to git
          wx = QUEUE_X + 25 + op.progress * (GIT_X - QUEUE_X - 30);
          wy = y + (97 - y) * Math.min(op.progress * 1.5, 1);
        } else if (op.state === "queued" && op.x >= QUEUE_X - 30) {
          // In the queue buffer
          wx = QUEUE_X;
          wy = 40 + (i % 8) * 14;
        } else {
          wx = Math.min(op.x, QUEUE_X - 30);
        }

        return (
          <g key={op.id}>
            {op.x < QUEUE_X - 30 && (
              <line x1={8} y1={y} x2={QUEUE_X - 26} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
            )}
            <circle
              cx={wx}
              cy={wy}
              r={4}
              fill={op.color}
              opacity={op.state === "done" ? 0.3 : 0.85}
            >
              {op.state === "batched" && (
                <animate attributeName="r" values="4;5;4" dur="0.3s" repeatCount="1" />
              )}
            </circle>
            {op.x < QUEUE_X - 30 && (
              <text x={10} y={y + 3} fill={op.color} fontSize={6} fontWeight={700} opacity={0.4}>
                M{op.id}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

// ---- Simulation logic --------------------------------------------------------

function initState(): SimState {
  return {
    left: [],
    right: [],
    leftCommits: 0,
    rightCommits: 0,
    leftMessages: 0,
    rightMessages: 0,
    leftErrors: 0,
    rightErrors: 0,
    leftLockActive: false,
    rightBatchQueue: 0,
    rightBatchFlushCount: 0,
    elapsed: 0,
    nextId: 0,
    rightBatchTimer: 0,
  };
}

function simulateTick(
  prev: SimState,
  deltaMs: number,
  params: { messageRate: number; batchWindow: number; speed: number },
  spawns: number
): SimState {
  const dt = deltaMs / 1000;
  const left = prev.left.map((o) => ({ ...o }));
  const right = prev.right.map((o) => ({ ...o }));
  let {
    leftCommits,
    rightCommits,
    leftMessages,
    rightMessages,
    leftErrors,
    leftLockActive,
    rightBatchQueue,
    rightBatchFlushCount,
    nextId,
    rightBatchTimer,
  } = prev;
  const { rightErrors } = prev;

  // Spawn new writes
  for (let s = 0; s < spawns; s++) {
    const color = COLORS[nextId % COLORS.length];
    left.push({ id: nextId, color, x: 8, state: "queued", progress: 0, batchId: 0 });
    right.push({ id: nextId, color, x: 8, state: "queued", progress: 0, batchId: 0 });
    nextId++;
  }

  // ---- Left side: Python - 1 commit per message, lock contention ----
  let lockTaken = left.some((w) => w.state === "committing");

  for (const w of left) {
    if (w.state === "queued") {
      w.x = Math.min(w.x + dt * 80, QUEUE_X - 10);
      if (!lockTaken && w.x >= QUEUE_X - 14) {
        w.state = "committing";
        w.progress = 0;
        lockTaken = true;
      } else if (lockTaken && w.x >= QUEUE_X - 14 && Math.random() < dt * 0.3) {
        // Occasional lock error under contention
        w.state = "error";
        w.progress = 0;
        leftErrors++;
      }
    } else if (w.state === "committing") {
      w.progress += dt * 0.8;
      if (w.progress >= 1) {
        w.state = "done";
        w.progress = 0;
        leftCommits++;
        leftMessages++;
      }
    } else if (w.state === "error") {
      w.progress += dt * 2;
      if (w.progress >= 1) {
        // Retry
        w.state = "queued";
        w.x = 20 + Math.random() * 30;
        w.progress = 0;
      }
    } else if (w.state === "done") {
      w.progress += dt * 3;
      if (w.progress >= 1) {
        // Remove completed ops to prevent unbounded growth
        w.state = "done";
        w.progress = 2; // Mark for cleanup
      }
    }
  }
  leftLockActive = left.some((w) => w.state === "committing");

  // ---- Right side: Rust - write-behind queue with batching ----
  rightBatchTimer += deltaMs;

  for (const w of right) {
    if (w.state === "queued" && w.x < QUEUE_X - 30) {
      w.x = Math.min(w.x + dt * 120, QUEUE_X - 30);
      if (w.x >= QUEUE_X - 30) {
        rightBatchQueue++;
      }
    }
  }

  // Batch flush when timer expires
  if (rightBatchTimer >= params.batchWindow && rightBatchQueue > 0) {
    rightBatchTimer = 0;
    const batchId = rightBatchFlushCount + 1;
    let flushed = 0;
    for (const w of right) {
      if (w.state === "queued" && w.x >= QUEUE_X - 30) {
        w.state = "batched";
        w.progress = 0;
        w.batchId = batchId;
        flushed++;
      }
    }
    if (flushed > 0) {
      rightCommits++;
      rightMessages += flushed;
      rightBatchQueue = 0;
      rightBatchFlushCount++;
    }
  }

  // Animate batched ops moving to git
  for (const w of right) {
    if (w.state === "batched") {
      w.progress += dt * 2.5;
      if (w.progress >= 1) {
        w.state = "done";
        w.progress = 0;
      }
    } else if (w.state === "done") {
      w.progress += dt * 3;
      if (w.progress >= 1) {
        w.progress = 2; // Mark for cleanup
      }
    }
  }

  // Cleanup old done ops (keep last 8)
  const cleanLeft = left.filter((w) => w.progress < 2 || w.state !== "done");
  const cleanRight = right.filter((w) => w.progress < 2 || w.state !== "done");

  return {
    left: cleanLeft.slice(-16),
    right: cleanRight.slice(-16),
    leftCommits,
    rightCommits,
    leftMessages,
    rightMessages,
    leftErrors,
    rightErrors,
    leftLockActive,
    rightBatchQueue,
    rightBatchFlushCount,
    elapsed: prev.elapsed + deltaMs,
    nextId,
    rightBatchTimer,
  };
}
