"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  springs,
} from "@/components/motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Lane = "cancel" | "timed" | "ready";

interface Task {
  id: string;
  name: string;
  lane: Lane;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LANE_META: Record<Lane, { label: string; color: string; priority: number }> = {
  cancel: { label: "Cancel", color: "#ef4444", priority: 0 },
  timed:  { label: "Timed",  color: "#eab308", priority: 1 },
  ready:  { label: "Ready",  color: "#22c55e", priority: 2 },
};

const LANE_ORDER: Lane[] = ["cancel", "timed", "ready"];

const INITIAL_TASKS: Task[] = [
  { id: "a", name: "Task A", lane: "ready" },
  { id: "b", name: "Task B", lane: "ready" },
  { id: "c", name: "Task C", lane: "ready" },
  { id: "d", name: "Task D", lane: "ready" },
  { id: "e", name: "Task E", lane: "ready" },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TrafficLight({ activeLane }: { activeLane: Lane | null }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5"
      aria-label={`Polling: ${activeLane ?? "idle"}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Poll
      </span>
      {LANE_ORDER.map((lane) => {
        const active = activeLane === lane;
        const { color } = LANE_META[lane];
        return (
          <span
            key={lane}
            className="block h-3 w-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: active ? color : `${color}30`,
              boxShadow: active ? `0 0 8px ${color}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function TaskCard({
  task,
  reducedMotion,
}: {
  task: Task;
  reducedMotion: boolean;
}) {
  const { color } = LANE_META[task.lane];

  return (
    <motion.div
      layoutId={task.id}
      layout="position"
      transition={reducedMotion ? { duration: 0 } : springs.smooth}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.8, y: -12, transition: { duration: 0.2 } }
      }
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
      style={{
        borderColor: `${color}40`,
        backgroundColor: `${color}10`,
        color: color,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {task.name}
    </motion.div>
  );
}

function LaneColumn({
  lane,
  tasks,
  reducedMotion,
}: {
  lane: Lane;
  tasks: Task[];
  reducedMotion: boolean;
}) {
  const { label, color } = LANE_META[lane];

  return (
    <div className="flex flex-1 flex-col items-stretch gap-3">
      {/* Lane header */}
      <div
        className="flex items-center justify-center gap-2 rounded-t-xl border-b-2 px-3 py-2"
        style={{ borderColor: color }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span
          className="text-xs font-black uppercase tracking-widest"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      {/* Card stack */}
      <div className="flex min-h-[200px] flex-col gap-2 rounded-b-xl border border-white/5 bg-white/[0.02] p-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              reducedMotion={reducedMotion}
            />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <span className="py-6 text-center text-xs text-slate-600">
            Empty
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function SchedulerLanesViz() {
  const reducedMotion = useReducedMotion() ?? false;

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeLane, setActiveLane] = useState<Lane | null>(null);
  const [processed, setProcessed] = useState<string[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  /* ---- helpers ---- */

  const tasksIn = useCallback(
    (lane: Lane) => tasks.filter((t) => t.lane === lane),
    [tasks],
  );

  const moveTask = useCallback(
    (from: Lane, to: Lane) => {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.lane === from);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], lane: to };
        return next;
      });
    },
    [],
  );

  /* ---- actions ---- */

  const injectCancellation = useCallback(() => {
    moveTask("ready", "cancel");
  }, [moveTask]);

  const addDeadline = useCallback(() => {
    moveTask("ready", "timed");
  }, [moveTask]);

  const step = useCallback(() => {
    // Find highest-priority non-empty lane
    for (const lane of LANE_ORDER) {
      const laneTasks = tasks.filter((t) => t.lane === lane);
      if (laneTasks.length > 0) {
        clearTimers();
        setActiveLane(lane);
        const target = laneTasks[0];
        // Remove after a brief flash so the traffic light is visible
        const t1 = setTimeout(() => {
          setTasks((prev) => prev.filter((t) => t.id !== target.id));
          setProcessed((prev) => [...prev, `${target.name} (${LANE_META[lane].label})`]);
        }, 300);
        const t2 = setTimeout(() => setActiveLane(null), 800);
        timersRef.current.push(t1, t2);
        return;
      }
    }
  }, [tasks, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setTasks(INITIAL_TASKS);
    setProcessed([]);
    setActiveLane(null);
  }, [clearTimers]);

  /* ---- derived ---- */

  const readyCount = tasksIn("ready").length;
  const noTasks = tasks.length === 0;

  /* ---- render ---- */

  return (
    <section
      className="w-full rounded-2xl border border-white/10 bg-[#0A1628] p-6"
      aria-label="Scheduler Lanes Visualization"
    >
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-white">
            Three-Lane Scheduler
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Priority: Cancel &gt; Timed &gt; Ready
          </p>
        </div>
        <TrafficLight activeLane={activeLane} />
      </div>

      {/* Lanes */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {LANE_ORDER.map((lane) => (
          <LaneColumn
            key={lane}
            lane={lane}
            tasks={tasksIn(lane)}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={injectCancellation}
          disabled={readyCount === 0}
          className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#ef4444] transition-colors hover:bg-[#ef4444]/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Inject Cancellation
        </button>
        <button
          onClick={addDeadline}
          disabled={readyCount === 0}
          className="rounded-lg border border-[#eab308]/30 bg-[#eab308]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#eab308] transition-colors hover:bg-[#eab308]/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add Deadline
        </button>
        <button
          onClick={step}
          disabled={noTasks}
          className="rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#3B82F6] transition-colors hover:bg-[#3B82F6]/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Step
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/10"
        >
          Reset
        </button>
      </div>

      {/* Processed log */}
      {processed.length > 0 && (
        <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Processed
          </span>
          <div className="mt-1 flex flex-wrap gap-2">
            {processed.map((entry, i) => (
              <span
                key={i}
                className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-500"
              >
                {entry}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
