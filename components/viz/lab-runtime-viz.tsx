"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

/* ── Task definitions ─────────────────────────────────────────────── */

interface Task {
  id: string;
  label: string;
  color: string;
  duration: number; // relative bar width (0–1)
}

const TASKS: Task[] = [
  { id: "A", label: "Task A — parse config", color: "#3B82F6", duration: 0.85 },
  { id: "B", label: "Task B — build graph", color: "#22c55e", duration: 0.65 },
  { id: "C", label: "Task C — sync state", color: "#F97316", duration: 1.0 },
  { id: "D", label: "Task D — emit events", color: "#8B5CF6", duration: 0.55 },
];

/* ── Seeded PRNG (mulberry32) ─────────────────────────────────────── */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(items: Task[], seed: number): Task[] {
  const rng = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ── Timeline panel ───────────────────────────────────────────────── */

function TimelinePanel({
  seed,
  tasks,
  playing,
  reducedMotion,
}: {
  seed: number;
  tasks: Task[];
  playing: boolean;
  reducedMotion: boolean;
}) {
  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-3 py-1 font-mono text-xs text-slate-400">
          seed:&nbsp;<span className="text-blue-400 font-bold">{seed}</span>
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {/* Timeline tracks */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {playing &&
            tasks.map((task, index) => (
              <motion.div
                key={`${seed}-${task.id}-${index}`}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
                transition={{
                  delay: reducedMotion ? 0 : index * 0.18,
                  duration: reducedMotion ? 0.1 : 0.5,
                  ease: [0.19, 1, 0.22, 1],
                }}
                className="flex items-center gap-3"
              >
                {/* Order number */}
                <span className="w-5 shrink-0 text-right font-mono text-[10px] font-bold text-slate-600">
                  {index + 1}
                </span>

                {/* Task bar */}
                <div className="relative flex-1 h-9 rounded-lg overflow-hidden bg-white/[0.03] border border-white/5">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-lg"
                    style={{ backgroundColor: task.color }}
                    initial={{ width: 0, opacity: 0.7 }}
                    animate={{
                      width: `${task.duration * 100}%`,
                      opacity: 1,
                    }}
                    transition={{
                      delay: reducedMotion ? 0 : index * 0.18 + 0.2,
                      duration: reducedMotion ? 0.1 : 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                  {/* Glow overlay */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-lg opacity-30 blur-sm"
                    style={{ backgroundColor: task.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${task.duration * 100}%` }}
                    transition={{
                      delay: reducedMotion ? 0 : index * 0.18 + 0.2,
                      duration: reducedMotion ? 0.1 : 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                  {/* Label */}
                  <div className="relative z-10 flex items-center h-full px-3">
                    <span className="text-[11px] font-bold text-white/90 truncate">
                      {task.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Execution hash (shows determinism) */}
      {playing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0.1 : 1.0 }}
          className="mt-4 font-mono text-[10px] text-slate-600 truncate"
        >
          order: [{tasks.map((t) => t.id).join(" → ")}]
        </motion.div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export default function LabRuntimeViz() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  const [leftSeed] = useState(42);
  const [rightSeed, setRightSeed] = useState(7);
  const [playing, setPlaying] = useState(true);
  const [generation, setGeneration] = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const leftTasks = useMemo(() => shuffleWithSeed(TASKS, leftSeed), [leftSeed]);
  const rightTasks = useMemo(() => shuffleWithSeed(TASKS, rightSeed), [rightSeed]);

  const handleReplay = useCallback(() => {
    clearTimers();
    setPlaying(false);
    // Force a re-mount of AnimatePresence children
    const timeout = setTimeout(() => {
      setGeneration((g) => g + 1);
      setPlaying(true);
    }, 80);
    timersRef.current.push(timeout);
  }, [clearTimers]);

  const handleSeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      clearTimers();
      setRightSeed(val);
      // Restart animation with new seed
      setPlaying(false);
      const timeout = setTimeout(() => {
        setGeneration((g) => g + 1);
        setPlaying(true);
      }, 80);
      timersRef.current.push(timeout);
    }
  }, [clearTimers]);

  // Clean up on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div className="w-full rounded-2xl border border-white/[0.06] bg-slate-950 p-6 md:p-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Terminal dots */}
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Lab Runtime — Deterministic Replay
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Seed input */}
          <label className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-mono">Right seed:</span>
            <input
              type="number"
              value={rightSeed}
              onChange={handleSeedChange}
              className="w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-center font-mono text-xs text-blue-400 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </label>

          {/* Replay button */}
          <button
            onClick={handleReplay}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:border-blue-500/30 hover:text-white active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path
                fillRule="evenodd"
                d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z"
                clipRule="evenodd"
              />
            </svg>
            Replay
          </button>
        </div>
      </div>

      {/* Side-by-side panels */}
      <div
        key={generation}
        className="flex flex-col md:flex-row gap-6 md:gap-8"
      >
        <TimelinePanel
          seed={leftSeed}
          tasks={leftTasks}
          playing={playing}
          reducedMotion={reducedMotion}
        />

        {/* Divider */}
        <div className="hidden md:flex flex-col items-center gap-2 pt-10">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-700 [writing-mode:vertical-lr]">
            vs
          </span>
          <div className="h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>
        <div className="md:hidden h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <TimelinePanel
          seed={rightSeed}
          tasks={rightTasks}
          playing={playing}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Insight text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reducedMotion ? 0.2 : 1.4, duration: 0.6 }}
        className="mt-8 text-center text-sm font-medium text-slate-500 border-t border-white/5 pt-5"
      >
        Same code, same seed&nbsp;=&nbsp;same execution order.{" "}
        <span className="text-blue-400">Every time.</span>
      </motion.p>
    </div>
  );
}
