"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import {
  Activity,
  ArrowDown,
  CheckCircle2,
  Timer,
  Heart,
} from "lucide-react";

type SystemPhase =
  | "idle"
  | "write_burst"
  | "coalescing"
  | "commit"
  | "backpressure"
  | "recovery"
  | "healthy";

interface WorkerState {
  name: string;
  icon: typeof Activity;
  status: "idle" | "active" | "stalled" | "recovered";
  processed: number;
}

const phaseDescriptions: Record<SystemPhase, string> = {
  idle: "System is idle. Workers are polling at low frequency. Write queue is empty.",
  write_burst:
    "Burst of writes arrives: 12 messages, 3 reservations, 2 ACK updates in 50ms.",
  coalescing:
    "Commit coalescer batches individual writes into a single WAL transaction.",
  commit:
    "Single WAL commit flushes all 17 operations atomically. fsync completes in 4ms.",
  backpressure:
    "Write queue depth exceeds threshold (128). Backpressure signal sent to callers.",
  recovery:
    "Queue drains below threshold. Lock contention resolves. Workers resume normal polling.",
  healthy:
    "All health signals green. Throughput: 2,400 ops/sec. p99 latency: 8ms.",
};

const phases: SystemPhase[] = [
  "idle",
  "write_burst",
  "coalescing",
  "commit",
  "backpressure",
  "recovery",
  "healthy",
];

const initialWorkers: WorkerState[] = [
  { name: "ACK Worker", icon: CheckCircle2, status: "idle", processed: 0 },
  { name: "Retention", icon: Timer, status: "idle", processed: 0 },
  { name: "Metrics", icon: Activity, status: "idle", processed: 0 },
  { name: "Integrity", icon: Heart, status: "idle", processed: 0 },
];

function derivePhaseState(phase: SystemPhase) {
  switch (phase) {
    case "idle":
      return {
        queueDepth: 0,
        coalescedOps: 0,
        commitLatency: 0,
        workers: initialWorkers.map((w) => ({ ...w, status: "idle" as const, processed: 0 })),
      };
    case "write_burst":
      return {
        queueDepth: 17,
        coalescedOps: 0,
        commitLatency: 0,
        workers: initialWorkers.map((w) => ({ ...w, status: "active" as const })),
      };
    case "coalescing":
      return {
        queueDepth: 1,
        coalescedOps: 17,
        commitLatency: 0,
        workers: initialWorkers.map((w) => ({ ...w, status: "active" as const })),
      };
    case "commit":
      return {
        queueDepth: 0,
        coalescedOps: 0,
        commitLatency: 4,
        workers: initialWorkers.map((w) => ({ ...w, status: "active" as const, processed: 4 })),
      };
    case "backpressure":
      return {
        queueDepth: 142,
        coalescedOps: 0,
        commitLatency: 4,
        workers: initialWorkers.map((w, i) =>
          i === 2
            ? { ...w, status: "stalled" as const, processed: 4 }
            : { ...w, status: "active" as const, processed: 4 }
        ),
      };
    case "recovery":
      return {
        queueDepth: 24,
        coalescedOps: 0,
        commitLatency: 4,
        workers: initialWorkers.map((w) => ({ ...w, status: "recovered" as const, processed: 12 })),
      };
    case "healthy":
      return {
        queueDepth: 3,
        coalescedOps: 0,
        commitLatency: 2,
        workers: initialWorkers.map((w) => ({ ...w, status: "active" as const, processed: 24 })),
      };
  }
}

export default function ReliabilityInternalsViz() {
  const reducedMotion = useVizReducedMotion();
  const [phase, setPhase] = useState<SystemPhase>("idle");
  const [autoPlay, setAutoPlay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { queueDepth, coalescedOps, commitLatency, workers } = useMemo(
    () => derivePhaseState(phase),
    [phase]
  );

  useEffect(() => {
    if (!autoPlay) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const idx = phases.indexOf(phase);
    const nextIdx = (idx + 1) % phases.length;
    timerRef.current = setTimeout(() => setPhase(phases[nextIdx]), 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlay, phase]);

  const advance = () => {
    const idx = phases.indexOf(phase);
    setPhase(phases[(idx + 1) % phases.length]);
  };

  const queueColor =
    queueDepth > 128
      ? "text-red-400"
      : queueDepth > 64
        ? "text-amber-400"
        : queueDepth > 0
          ? "text-blue-400"
          : "text-slate-500";

  const queueBarWidth = Math.min(100, (queueDepth / 160) * 100);

  const workerStatusColor = (s: WorkerState["status"]) => {
    switch (s) {
      case "idle":
        return "border-slate-700 bg-slate-900";
      case "active":
        return "border-green-500/40 bg-green-500/10";
      case "stalled":
        return "border-red-500/40 bg-red-500/10";
      case "recovered":
        return "border-blue-500/40 bg-blue-500/10";
    }
  };

  const workerStatusLabel = (s: WorkerState["status"]) => {
    switch (s) {
      case "idle":
        return { text: "Idle", cls: "text-slate-500" };
      case "active":
        return { text: "Active", cls: "text-green-400" };
      case "stalled":
        return { text: "Stalled", cls: "text-red-400" };
      case "recovered":
        return { text: "Recovered", cls: "text-blue-400" };
    }
  };

  return (
    <VizSurface aria-label="Reliability Internals">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white">
          Reliability Internals
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Write batching, backpressure management, lock recovery, and worker
          loop health monitoring.
        </p>
      </div>

      {/* Health Dashboard Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl border border-white/5 bg-black/40 text-center">
          <div className={`text-2xl font-black font-mono ${queueColor}`}>
            {queueDepth}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
            Queue Depth
          </div>
        </div>
        <div className="p-3 rounded-xl border border-white/5 bg-black/40 text-center">
          <div className="text-2xl font-black font-mono text-purple-400">
            {coalescedOps}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
            Coalesced
          </div>
        </div>
        <div className="p-3 rounded-xl border border-white/5 bg-black/40 text-center">
          <div className="text-2xl font-black font-mono text-cyan-400">
            {commitLatency}ms
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
            Commit Lat.
          </div>
        </div>
        <div className="p-3 rounded-xl border border-white/5 bg-black/40 text-center">
          <div
            className={`text-2xl font-black font-mono ${phase === "healthy" ? "text-green-400" : phase === "backpressure" ? "text-red-400" : "text-slate-400"}`}
          >
            {phase === "healthy" ? "OK" : phase === "backpressure" ? "BP" : "--"}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
            Health
          </div>
        </div>
      </div>

      {/* Write Queue Pressure Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
          <span>Write Buffer Queue</span>
          <span>Threshold: 128</span>
        </div>
        <div className="h-4 rounded-full bg-slate-900 border border-white/5 overflow-hidden relative">
          <motion.div
            className={`h-full rounded-full ${queueDepth > 128 ? "bg-gradient-to-r from-red-600 to-red-400" : queueDepth > 64 ? "bg-gradient-to-r from-amber-600 to-amber-400" : "bg-gradient-to-r from-blue-600 to-blue-400"}`}
            animate={{ width: `${queueBarWidth}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          />
          {/* Threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500/60"
            style={{ left: "80%" }}
          />
        </div>
      </div>

      {/* Commit Coalescer Pipeline */}
      <div className="mb-6 p-4 rounded-xl border border-white/5 bg-black/30">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
          Commit Coalescer Pipeline
        </div>
        <div className="flex items-center justify-between gap-2">
          {["Incoming", "Batch", "WAL Write", "fsync", "Done"].map(
            (stage, i) => {
              const activeIdx =
                phase === "write_burst"
                  ? 0
                  : phase === "coalescing"
                    ? 1
                    : phase === "commit"
                      ? 3
                      : phase === "healthy"
                        ? 4
                        : -1;
              const isActive = i <= activeIdx;

              return (
                <div key={stage} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex-1 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-colors ${isActive ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-white/5 bg-slate-900 text-slate-600"}`}
                  >
                    {stage}
                  </div>
                  {i < 4 && (
                    <ArrowDown
                      className={`w-3 h-3 rotate-[-90deg] ${isActive ? "text-cyan-400" : "text-slate-700"}`}
                    />
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Worker Loops */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {workers.map((worker) => {
          const { text, cls } = workerStatusLabel(worker.status);
          const Icon = worker.icon;
          return (
            <div
              key={worker.name}
              className={`p-3 rounded-xl border transition-colors ${workerStatusColor(worker.status)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className={`w-4 h-4 ${worker.status === "stalled" ? "text-red-400" : worker.status === "active" ? "text-green-400" : "text-slate-500"}`}
                />
                <span className="text-xs font-bold text-slate-200">
                  {worker.name}
                </span>
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${cls}`}>
                {text}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                {worker.processed} ops
              </div>
            </div>
          );
        })}
      </div>

      {/* Status + Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
        <p className="text-sm font-medium text-slate-300">
          {phaseDescriptions[phase]}
        </p>
        <div className="flex gap-2 shrink-0">
          <VizControlButton
            tone={autoPlay ? "red" : "green"}
            onClick={() => setAutoPlay(!autoPlay)}
          >
            {autoPlay ? "Pause" : "Auto"}
          </VizControlButton>
          <VizControlButton tone="blue" onClick={advance}>
            {phase === "healthy" ? "Reset" : "Next"}
          </VizControlButton>
        </div>
      </div>
    </VizSurface>
  );
}
