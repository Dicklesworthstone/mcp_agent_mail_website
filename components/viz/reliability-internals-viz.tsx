"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizAutoStart,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import {
  Activity,
  CheckCircle2,
  Timer,
  Heart,
  ArrowDownToLine,
  Layers,
  Zap,
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
  write_burst: "Burst of writes arrives: 12 messages, 3 reservations, 2 ACK updates in 50ms.",
  coalescing: "Commit coalescer catches the burst and batches individual writes into a single WAL transaction.",
  commit: "Single WAL commit flushes all 17 operations atomically. fsync completes in 4ms.",
  backpressure: "Write queue depth exceeds threshold (128). Backpressure signal sent to callers to throttle.",
  recovery: "Queue drains below threshold. Lock contention resolves. Workers resume normal polling.",
  healthy: "All health signals green. Throughput: 2,400 ops/sec. p99 latency: 8ms.",
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
  const [workload, setWorkload] = useState<"normal" | "stress">("normal");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoStart = useCallback(() => setAutoPlay(true), []);
  useVizAutoStart(autoStart);

  const { queueDepth, coalescedOps, commitLatency, workers } = useMemo(
    () => derivePhaseState(phase),
    [phase]
  );
  
  const loadMultiplier = workload === "stress" ? 2 : 1;
  const viewQueueDepth = queueDepth * loadMultiplier;
  const viewCoalescedOps = coalescedOps * loadMultiplier;
  const viewCommitLatency = commitLatency + (workload === "stress" ? 5 : 0);
  const viewWorkers = workers.map((w) => ({
    ...w,
    processed: w.processed * loadMultiplier,
  }));

  useEffect(() => {
    if (!autoPlay) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const idx = phases.indexOf(phase);
    const nextIdx = (idx + 1) % phases.length;
    timerRef.current = setTimeout(() => setPhase(phases[nextIdx]), 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlay, phase]);

  const advance = () => {
    const idx = phases.indexOf(phase);
    setPhase(phases[(idx + 1) % phases.length]);
  };

  const queueBarWidth = Math.min(100, (viewQueueDepth / 160) * 100);
  const isBackpressure = viewQueueDepth > 128;
  const isWarning = viewQueueDepth > 64 && !isBackpressure;

  return (
    <VizSurface aria-label="Reliability Internals">
      <VizHeader
        accent="red"
        eyebrow="Performance + Durability"
        title="Reliability Internals"
        subtitle="Compare normal vs stress profiles while stepping through burst ingestion, commit coalescing, backpressure, and recovery phases."
        controls={
          <div className="flex gap-2">
            <VizControlButton
              tone={workload === "normal" ? "green" : "neutral"}
              onClick={() => setWorkload("normal")}
            >
              Normal Load
            </VizControlButton>
            <VizControlButton
              tone={workload === "stress" ? "red" : "neutral"}
              onClick={() => setWorkload("stress")}
            >
              Stress Load
            </VizControlButton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <VizMetricCard label="Queue Depth" value={viewQueueDepth} tone={isBackpressure ? "red" : isWarning ? "amber" : "blue"} />
        <VizMetricCard label="Coalesced Ops" value={viewCoalescedOps} tone="green" />
        <VizMetricCard label="Commit Latency" value={`${viewCommitLatency}ms`} tone={workload === "stress" ? "red" : "neutral"} />
        <VizMetricCard label="Phase" value={phase.replace("_", " ")} tone={phase === "healthy" ? "green" : phase === "backpressure" ? "red" : "amber"} />
      </div>

      <div className="relative rounded-xl border border-slate-700/50 bg-[#0B1120] p-6 mb-6 overflow-hidden min-h-[400px]">
        {/* Animated Background Lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, #fff 19px, #fff 20px)", backgroundSize: "20px 20px" }}></div>

        {/* Top Section: Write Queue Pressure Bar */}
        <div className="mb-8 relative z-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2"><ArrowDownToLine className="w-4 h-4 text-blue-400"/> Write Buffer Queue (WBQ)</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isBackpressure ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-500"}`}>Threshold: 128</span>
          </div>
          <div className="h-6 rounded-full bg-slate-900 border border-slate-700 overflow-hidden relative shadow-inner">
            <motion.div
              className={`h-full rounded-full relative overflow-hidden ${isBackpressure ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-blue-500"}`}
              animate={{ width: `${queueBarWidth}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.5, type: "spring", stiffness: 100 }}
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.1)_8px,rgba(0,0,0,0.1)_16px)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
            
            {/* Threshold marker */}
            <div className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] z-10" style={{ left: "80%" }} />
            
            {/* Overlay pulse on backpressure */}
            {isBackpressure && !reducedMotion && (
              <motion.div className="absolute inset-0 bg-red-500/30 mix-blend-overlay" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
            )}
          </div>
        </div>

        {/* Middle Section: Commit Coalescer Pipeline */}
        <div className="mb-8 relative z-10">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-2">
             <Layers className="w-4 h-4 text-cyan-400" /> Commit Coalescer Pipeline
          </div>
          <div className="flex flex-col sm:flex-row items-stretch justify-between gap-3 relative">
            
            {/* Connecting lines */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 hidden sm:block z-0">
               {(phase === "write_burst" || phase === "coalescing" || phase === "commit" || phase === "healthy") && !reducedMotion && (
                 <motion.div className="h-full w-full bg-cyan-500/50" animate={{ scaleX: [0, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ transformOrigin: "left" }} />
               )}
            </div>

            {["Incoming", "Batch", "WAL Write", "fsync", "Done"].map((stage, i) => {
              const activeIdx = phase === "write_burst" ? 0 : phase === "coalescing" ? 1 : phase === "commit" ? 3 : phase === "healthy" ? 4 : -1;
              const isActive = i === activeIdx;
              const isPassed = i < activeIdx;

              return (
                <div key={stage} className="relative z-10 flex-1">
                  <motion.div
                    className={`h-12 rounded-xl border-2 flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all duration-300 ${isActive ? "border-cyan-400 bg-cyan-900/40 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105" : isPassed ? "border-cyan-900 bg-cyan-950/20 text-cyan-700" : "border-slate-800 bg-slate-900 text-slate-600"}`}
                  >
                    {stage}
                    {isActive && i === 1 && <span className="ml-2 bg-cyan-500 text-black px-1.5 py-0.5 rounded text-[10px]">x17</span>}
                    {isActive && i === 3 && <Zap className="w-3 h-3 ml-2 text-amber-400 animate-pulse" />}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Worker Loops */}
        <div className="relative z-10">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-3 flex items-center gap-2">
             <Activity className="w-4 h-4 text-fuchsia-400" /> Independent Worker Loops
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {viewWorkers.map((worker) => {
              const isStalled = worker.status === "stalled";
              const isRecovered = worker.status === "recovered";
              const isActive = worker.status === "active";
              const Icon = worker.icon;
              
              return (
                <div
                  key={worker.name}
                  className={`p-4 rounded-xl border-2 transition-all duration-500 relative overflow-hidden ${isStalled ? "border-red-500 bg-red-900/20" : isRecovered ? "border-blue-500 bg-blue-900/20" : isActive ? "border-green-500/50 bg-green-900/10" : "border-slate-800 bg-slate-900"}`}
                >
                  {isStalled && !reducedMotion && (
                    <motion.div className="absolute inset-0 bg-red-500/10" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
                  )}
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className={`p-2 rounded-lg ${isStalled ? "bg-red-500/20" : isRecovered ? "bg-blue-500/20" : isActive ? "bg-green-500/20" : "bg-slate-800"}`}>
                      <Icon className={`w-4 h-4 ${isStalled ? "text-red-400" : isRecovered ? "text-blue-400" : isActive ? "text-green-400" : "text-slate-500"}`} />
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${isStalled ? "bg-red-500 text-white" : isRecovered ? "bg-blue-500/20 text-blue-300" : isActive ? "bg-green-500/20 text-green-300" : "text-slate-500"}`}>
                      {worker.status}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="text-sm font-bold text-slate-200">{worker.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{worker.processed} ops</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status + Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900/50 rounded-xl border border-slate-800 shadow-inner">
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Live Phase Log</p>
           <p className="text-sm font-medium text-slate-300 leading-snug">{phaseDescriptions[phase]}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <VizControlButton tone={autoPlay ? "red" : "green"} onClick={() => setAutoPlay(!autoPlay)}>
            {autoPlay ? "Pause Auto-Play" : "Start Auto-Play"}
          </VizControlButton>
          <VizControlButton tone="blue" onClick={advance}>
            {phase === "healthy" ? "Reset" : "Next Phase"}
          </VizControlButton>
        </div>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="red"
        title="Pedagogical Takeaways"
        items={[
          "Coalescing converts write bursts into fewer durable commits, preserving IOPS and latency headroom.",
          "Backpressure is a safety valve, not a failure state; it protects tail latency and lock health under massive load.",
          "Independent worker loops limit blast radius so one stalled subsystem does not freeze the whole runtime.",
        ]}
      />
    </VizSurface>
  );
}