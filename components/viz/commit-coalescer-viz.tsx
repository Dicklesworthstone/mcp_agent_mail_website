"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  VizMetricCard,
  useVizAutoStart,
  useVizReducedMotion,
  useVizInViewport,
} from "@/components/viz/viz-framework";

/* ─── Types ──────────────────────────────────────────────────────── */

interface WriteOp {
  id: number;
  label: string;
  color: string;
  arrivedAt: number;
  batchId: number | null;
}

interface Batch {
  id: number;
  writeCount: number;
  committedAt: number | null;
  color: string;
}

interface CoalescerState {
  running: boolean;
  tick: number;
  // Pipeline stages
  incoming: WriteOp[];
  buffered: WriteOp[];
  batches: Batch[];
  // Counters
  totalWrites: number;
  totalCommits: number;
  nextWriteId: number;
  nextBatchId: number;
  // Timing
  batchAccumulator: number;
  burstComplete: boolean;
}

type CoalescerAction =
  | { type: "TICK" }
  | { type: "START_BURST" }
  | { type: "RESET" };

/* ─── Colors ─────────────────────────────────────────────────────── */

const WRITE_COLORS = [
  "#3B82F6", "#22C55E", "#A855F7", "#EAB308", "#EF4444",
  "#14B8A6", "#F97316", "#EC4899", "#6366F1", "#84CC16",
];

/* ─── Reducer ────────────────────────────────────────────────────── */

const BURST_SIZE = 100;
const BATCH_THRESHOLD = 8; // Flush every N ticks
const WRITES_PER_TICK = 5; // Writes that arrive per tick during burst

function coalescerReducer(state: CoalescerState, action: CoalescerAction): CoalescerState {
  switch (action.type) {
    case "RESET":
      return initCoalescer();

    case "START_BURST":
      return { ...state, running: true, burstComplete: false };

    case "TICK": {
      if (!state.running) return state;

      const tick = state.tick + 1;
      let { totalWrites, totalCommits, nextWriteId, nextBatchId, batchAccumulator } = state;
      const incoming = [...state.incoming];
      const buffered = [...state.buffered];
      const batches = [...state.batches];
      let { burstComplete } = state;

      // Phase 1: Generate incoming writes (if burst not complete)
      if (totalWrites < BURST_SIZE) {
        const toGenerate = Math.min(WRITES_PER_TICK, BURST_SIZE - totalWrites);
        for (let i = 0; i < toGenerate; i++) {
          const wid = nextWriteId++;
          incoming.push({
            id: wid,
            label: `write-${wid}`,
            color: WRITE_COLORS[(wid - 1) % WRITE_COLORS.length],
            arrivedAt: tick,
            batchId: null,
          });
          totalWrites++;
        }
      }

      // Phase 2: Move incoming → buffer (1 tick delay)
      const readyToBuffer = incoming.filter((w) => w.arrivedAt < tick);
      const stillIncoming = incoming.filter((w) => w.arrivedAt >= tick);

      for (const w of readyToBuffer) {
        buffered.push(w);
      }

      // Phase 3: Coalesce buffer → batch
      batchAccumulator++;
      if (batchAccumulator >= BATCH_THRESHOLD && buffered.length > 0) {
        const batchId = nextBatchId++;
        const batch: Batch = {
          id: batchId,
          writeCount: buffered.length,
          committedAt: tick,
          color: WRITE_COLORS[batchId % WRITE_COLORS.length],
        };
        batches.push(batch);
        totalCommits++;
        buffered.length = 0; // Clear buffer
        batchAccumulator = 0;
      }

      // Check if burst is complete
      if (totalWrites >= BURST_SIZE && buffered.length === 0 && stillIncoming.length === 0) {
        // Final flush of any remaining
        if (!burstComplete) {
          burstComplete = true;
        }
      }

      const isFinished = burstComplete && buffered.length === 0 && stillIncoming.length === 0;

      return {
        ...state,
        running: !isFinished,
        tick,
        incoming: stillIncoming,
        buffered,
        batches: batches.slice(-20), // Keep last 20 batches visible
        totalWrites,
        totalCommits,
        nextWriteId,
        nextBatchId,
        batchAccumulator,
        burstComplete,
      };
    }

    default:
      return state;
  }
}

function initCoalescer(): CoalescerState {
  return {
    running: false,
    tick: 0,
    incoming: [],
    buffered: [],
    batches: [],
    totalWrites: 0,
    totalCommits: 0,
    nextWriteId: 1,
    nextBatchId: 1,
    batchAccumulator: 0,
    burstComplete: false,
  };
}

/* ─── SVG Pipeline Visualization ─────────────────────────────────── */

const SVG_W = 600;
const SVG_H = 200;

function PipelineSVG({
  incoming,
  buffered,
  batches,
  reducedMotion,
}: {
  incoming: WriteOp[];
  buffered: WriteOp[];
  batches: Batch[];
  reducedMotion: boolean;
}) {
  // Incoming writes: left cluster
  const incomingDots = incoming.slice(-15).map((w, i) => ({
    x: 30 + (i % 5) * 12,
    y: 60 + Math.floor(i / 5) * 14,
    color: w.color,
    id: w.id,
  }));

  // Buffer: middle area
  const bufferDots = buffered.slice(-20).map((w, i) => ({
    x: 230 + (i % 5) * 12,
    y: 55 + Math.floor(i / 5) * 12,
    color: w.color,
    id: w.id,
  }));

  // Batches: right column
  const batchBlocks = batches.slice(-8).map((b, i) => ({
    x: 470,
    y: 30 + i * 20,
    width: Math.min(80, 20 + b.writeCount * 3),
    color: b.color,
    count: b.writeCount,
    id: b.id,
  }));

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" role="img" aria-label="Pipeline showing writes being coalesced into batched commits">
      {/* Stage labels */}
      <text x={50} y={25} textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="bold" fontFamily="monospace">
        INCOMING
      </text>
      <text x={260} y={25} textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="bold" fontFamily="monospace">
        BUFFER
      </text>
      <text x={500} y={25} textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="bold" fontFamily="monospace">
        GIT COMMITS
      </text>

      {/* Flow arrows */}
      <defs>
        <marker id="coal-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
        </marker>
      </defs>
      <line x1={110} y1={100} x2={190} y2={100} stroke="#475569" strokeWidth="1.5" markerEnd="url(#coal-arrow)" strokeDasharray="4 3" />
      <line x1={350} y1={100} x2={430} y2={100} stroke="#475569" strokeWidth="1.5" markerEnd="url(#coal-arrow)" strokeDasharray="4 3" />

      {/* Coalescer funnel shape */}
      <path
        d="M200,40 L320,40 L300,160 L220,160 Z"
        fill="none"
        stroke="#334155"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <text x={260} y={105} textAnchor="middle" fill="#475569" fontSize="7" fontFamily="monospace">
        COALESCER
      </text>

      {/* Incoming dots */}
      <AnimatePresence>
        {incomingDots.map((d) => (
          <motion.circle
            key={`in-${d.id}`}
            cx={d.x} cy={d.y} r={4}
            fill={d.color}
            initial={reducedMotion ? { opacity: 0.8 } : { opacity: 0, scale: 0 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
          />
        ))}
      </AnimatePresence>

      {/* Buffer dots */}
      <AnimatePresence>
        {bufferDots.map((d) => (
          <motion.circle
            key={`buf-${d.id}`}
            cx={d.x} cy={d.y} r={3.5}
            fill={d.color}
            opacity={0.6}
            initial={reducedMotion ? { opacity: 0.6 } : { opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
          />
        ))}
      </AnimatePresence>

      {/* Batch blocks */}
      <AnimatePresence>
        {batchBlocks.map((b) => (
          <motion.g key={`batch-${b.id}`}>
            <motion.rect
              x={b.x - b.width / 2}
              y={b.y}
              width={b.width}
              height={14}
              rx={3}
              fill={b.color}
              opacity={0.7}
              initial={reducedMotion ? { opacity: 0.7 } : { opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.7, scaleX: 1 }}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
            />
            <text
              x={b.x}
              y={b.y + 10}
              textAnchor="middle"
              fill="white"
              fontSize="7"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {b.count}x
            </text>
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function CommitCoalescerViz() {
  const reducedMotion = useVizReducedMotion();
  const inViewport = useVizInViewport();
  const [state, dispatch] = useReducer(coalescerReducer, undefined, initCoalescer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleBurst = useCallback(() => {
    dispatch({ type: "START_BURST" });
  }, []);

  useVizAutoStart(handleBurst);

  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    if (state.running && inViewport) {
      intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.running, inViewport]);

  const ratio = state.totalCommits > 0
    ? (state.totalWrites / state.totalCommits).toFixed(1)
    : "---";

  const compressionPct = state.totalCommits > 0
    ? Math.round((1 - state.totalCommits / state.totalWrites) * 100)
    : 0;

  const isDone = !state.running && state.totalWrites >= BURST_SIZE;

  return (
    <VizSurface aria-label="Git commit coalescer batching visualization">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Git Commit Coalescer</h3>
          <p className="text-sm text-slate-400">
            Watch 100 rapid-fire writes get batched into far fewer git commits, eliminating lock contention.
          </p>
        </div>
        <div className="flex gap-2">
          <VizControlButton
            tone={state.running ? "neutral" : "blue"}
            onClick={handleBurst}
            disabled={state.running || isDone}
          >
            {isDone ? "Complete" : state.running ? "Coalescing..." : "Fire 100 Writes"}
          </VizControlButton>
          <VizControlButton tone="neutral" onClick={handleReset}>
            Reset
          </VizControlButton>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <PipelineSVG
          incoming={state.incoming}
          buffered={state.buffered}
          batches={state.batches}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Compression bar */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Compression Ratio
          </p>
          <p className="text-sm font-bold text-white">
            {state.totalWrites} writes &rarr; {state.totalCommits} commits
          </p>
        </div>
        <div className="h-4 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, #3B82F6, #22C55E)`,
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${compressionPct}%` }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-[10px] text-slate-500">0%</p>
          <p className="text-[10px] font-bold text-green-400">
            {compressionPct > 0 ? `${compressionPct}% fewer commits` : ""}
          </p>
          <p className="text-[10px] text-slate-500">100%</p>
        </div>
      </div>

      {/* Comparison callout */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid gap-4 md:grid-cols-2"
        >
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">
              Without Coalescer
            </p>
            <p className="text-lg font-black text-red-300">{state.totalWrites} git commits</p>
            <p className="text-xs text-red-300/70 mt-1">
              Lock file contention, index.lock errors, cascading failures
            </p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-2">
              With Coalescer
            </p>
            <p className="text-lg font-black text-green-300">{state.totalCommits} git commits</p>
            <p className="text-xs text-green-300/70 mt-1">
              Zero lock contention, {ratio}x batching ratio, 0 errors
            </p>
          </div>
        </motion.div>
      )}

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <VizMetricCard label="Total Writes" value={state.totalWrites} tone="blue" />
        <VizMetricCard label="Git Commits" value={state.totalCommits} tone="green" />
        <VizMetricCard label="Batching Ratio" value={`${ratio}x`} tone="neutral" />
        <VizMetricCard label="In Buffer" value={state.buffered.length} tone="amber" />
      </div>
    </VizSurface>
  );
}
