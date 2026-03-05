"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  VizMetricCard,
  VizHeader,
  VizLearningBlock,
  useVizAutoStart,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { ShieldAlert, Terminal, Lock, Map as MapIcon, RefreshCw } from "lucide-react";

/* ---------- Data Model ---------- */

interface AgentDef {
  id: string;
  name: string;
  color: string;
  glow: string;
}

const AGENTS: AgentDef[] = [
  { id: "A", name: "GreenCastle", color: "#10B981", glow: "rgba(16,185,129,0.4)" }, // emerald
  { id: "B", name: "BlueLake", color: "#3B82F6", glow: "rgba(59,130,246,0.4)" }, // blue
  { id: "C", name: "RedBear", color: "#EF4444", glow: "rgba(239,68,68,0.4)" }, // red
];

const AGENT_MAP = new Map(AGENTS.map((a) => [a.id, a]));

interface Reservation {
  id: number;
  agentId: string;
  glob: string;
  matchingFiles: number[];
  ttlRemaining: number;
  exclusive: boolean;
}

const GLOB_MATCHES: Record<string, number[]> = {
  "src/auth/**/*.ts": [0, 1, 2, 8, 9, 10], // Top-left area
  "src/db/**/*.ts": [6, 7, 14, 15, 22, 23], // Top-right area
  "src/ui/**/*.tsx": [16, 17, 18, 24, 25, 26], // Bottom-left area
  "src/core/*.ts": [11, 12, 13, 19, 20, 21], // Center area
};

const SCENARIO = [
  { glob: "src/auth/**/*.ts", agentId: "A", action: "reserve", description: "GreenCastle locks auth module." },
  { glob: "src/ui/**/*.tsx", agentId: "B", action: "reserve", description: "BlueLake locks UI components." },
  { glob: "src/db/**/*.ts", agentId: "C", action: "reserve", description: "RedBear locks database schema." },
  { glob: "src/core/*.ts", agentId: "A", action: "reserve", description: "GreenCastle expands lock to core." },
  { glob: "src/auth/**/*.ts", agentId: "B", action: "conflict", description: "BlueLake tries to lock auth -> CONFLICT!" },
  { glob: "src/core/*.ts", agentId: "C", action: "conflict", description: "RedBear tries to lock core -> CONFLICT!" },
  { glob: "src/auth/**/*.ts", agentId: "A", action: "release", description: "GreenCastle releases auth module." },
  { glob: "src/auth/**/*.ts", agentId: "B", action: "reserve", description: "BlueLake successfully locks auth." },
  { glob: "src/db/**/*.ts", agentId: "C", action: "release", description: "RedBear releases database schema." },
];

const GRID_W = 8;
const GRID_H = 4;
const CELL_SIZE = 40;
const GAP = 8;

export default function TerritoryMapViz() {
  const reducedMotion = useVizReducedMotion();
  const [step, setStep] = useState(0);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<{ text: string; color: string; bad?: boolean }[]>([]);
  const [running, setRunning] = useState(false);
  const [conflictFlash, setConflictFlash] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const conflictTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextResId = useRef(1);

  const autoStart = useCallback(() => setRunning(true), []);
  useVizAutoStart(autoStart);

  const getFileOwner = useCallback((fileIdx: number): AgentDef | null => {
    for (const res of reservations) {
      if (res.matchingFiles.includes(fileIdx)) {
        return AGENT_MAP.get(res.agentId) ?? null;
      }
    }
    return null;
  }, [reservations]);

  const advanceStep = useCallback(() => {
    if (step >= SCENARIO.length) {
      setRunning(false);
      if (conflictTimerRef.current) {
        clearTimeout(conflictTimerRef.current);
        conflictTimerRef.current = null;
      }
      return;
    }
    const s = SCENARIO[step];
    const agent = AGENT_MAP.get(s.agentId)!;
    const matchingFiles = GLOB_MATCHES[s.glob] ?? [];

    setReservations((prev) => {
      const next = [...prev];
      switch (s.action) {
        case "reserve":
          next.push({
            id: nextResId.current++,
            agentId: s.agentId,
            glob: s.glob,
            matchingFiles,
            ttlRemaining: 3600,
            exclusive: true,
          });
          return next;
        case "release":
        case "expire":
          return next.filter((r) => !(r.agentId === s.agentId && r.glob === s.glob));
        case "conflict":
          setConflictFlash(matchingFiles);
          if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);
          conflictTimerRef.current = setTimeout(() => {
            setConflictFlash([]);
            conflictTimerRef.current = null;
          }, 800);
          return next;
        default:
          return next;
      }
    });

    setEvents((prev) => [
      { text: s.description, color: s.action === "conflict" ? "#EF4444" : agent.color, bad: s.action === "conflict" },
      ...prev,
    ]);
    setStep((prev) => prev + 1);
  }, [step]);

  const handlePlay = useCallback(() => setRunning(true), []);
  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);
    conflictTimerRef.current = null;
    setRunning(false);
    setStep(0);
    setReservations([]);
    setEvents([]);
    setConflictFlash([]);
    nextResId.current = 1;
  }, []);

  const agentCount = useMemo(() => new Set(reservations.map((r) => r.agentId)).size, [reservations]);
  const conflictCount = useMemo(() => events.filter((e) => e.bad).length, [events]);
  const hasConflicts = useMemo(() => events.some((e) => e.bad), [events]);

  useEffect(() => {
    if (running && step < SCENARIO.length) {
      intervalRef.current = setInterval(advanceStep, 1500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (conflictTimerRef.current) {
        clearTimeout(conflictTimerRef.current);
        conflictTimerRef.current = null;
      }
    };
  }, [running, step, advanceStep]);

  // Generate grid cells
  const cells = [];
  for (let i = 0; i < GRID_W * GRID_H; i++) {
    const isConflict = conflictFlash.includes(i);
    const owner = getFileOwner(i);
    
    cells.push(
      <motion.div
        key={i}
        className="relative rounded-lg flex items-center justify-center transition-colors duration-500 overflow-hidden"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          backgroundColor: owner ? owner.color + "1A" : "#1E293B",
          borderColor: owner ? owner.color : "#334155",
          borderWidth: 1,
          boxShadow: owner ? `0 0 10px ${owner.glow}` : "none",
        }}
      >
        <AnimatePresence>
           {owner && (
             <motion.div 
               initial={{ scale: 0 }} 
               animate={{ scale: 1 }} 
               exit={{ scale: 0 }}
               className="absolute z-10"
             >
               <Lock className="w-4 h-4" style={{ color: owner.color }} />
             </motion.div>
           )}
           {isConflict && (
             <motion.div
               initial={{ opacity: 1 }}
               animate={{ opacity: 0 }}
               transition={{ duration: 0.8 }}
               className="absolute inset-0 bg-red-500 z-20 flex items-center justify-center"
             >
               <ShieldAlert className="w-4 h-4 text-white" />
             </motion.div>
           )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <VizSurface aria-label="Agent territory map visualization">
      <VizHeader
        accent="blue"
        eyebrow="Collision Prevention"
        title="Territory Mapping via Reservations"
        subtitle="Watch agents dynamically partition the repository using path-based glob locks. This prevents merge conflicts and duplicated work before code is even written."
        controls={
          <div className="flex gap-2">
            {!running && step < SCENARIO.length && (
              <VizControlButton tone="blue" onClick={handlePlay}>
                Play Scenario
              </VizControlButton>
            )}
            {running && (
              <VizControlButton tone="neutral" onClick={() => setRunning(false)}>
                Pause
              </VizControlButton>
            )}
            <VizControlButton tone="neutral" onClick={handleReset} disabled={step === 0}>
              Reset
            </VizControlButton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <VizMetricCard label="Active Locks" value={reservations.length} tone="blue" />
        <VizMetricCard label="Agents Claiming" value={agentCount} tone="green" />
        <VizMetricCard
          label="Conflicts Averted"
          value={conflictCount}
          tone={hasConflicts ? "red" : "neutral"}
        />
        <VizMetricCard label="Step" value={`${step}/${SCENARIO.length}`} tone="neutral" />
      </div>

      <div className="grid xl:grid-cols-[1fr_250px] gap-6 mb-4">
        {/* Repository Grid Map */}
        <div className="relative rounded-xl border border-white/10 bg-[#0B1120] p-6 flex flex-col items-center justify-center min-h-[350px] overflow-hidden">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px", backgroundPosition: "center" }}></div>
          
          <div className="flex items-center gap-2 mb-6">
            <MapIcon className="w-5 h-5 text-slate-400" />
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-300">Repository Map</h4>
          </div>

          <div 
            className="grid z-10" 
            style={{ 
              gridTemplateColumns: `repeat(${GRID_W}, ${CELL_SIZE}px)`, 
              gap: GAP 
            }}
          >
            {cells}
          </div>

          {/* Active Agents Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 z-10">
             {AGENTS.map(agent => (
                <div key={agent.id} className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: `${agent.color}40`, borderColor: agent.color }}></div>
                  <span className="text-xs font-bold text-slate-300">{agent.name}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Event Log Log */}
        <div className="rounded-xl border border-white/10 bg-black/40 flex flex-col overflow-hidden h-[350px]">
          <div className="p-3 border-b border-white/10 bg-slate-900/50 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Event Log
            </span>
            {running && <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />}
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-2 flex flex-col-reverse">
            <AnimatePresence>
              {events.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 text-center py-4">
                  Press play to start scenario...
                </motion.div>
              )}
              {events.map((e, idx) => (
                <motion.div
                  key={events.length - idx}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs p-2 rounded border ${e.bad ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-slate-800 border-slate-700 text-slate-300"}`}
                >
                  <span className="font-bold" style={{ color: e.color }}>▸</span> {e.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="blue"
        title="Pedagogical Takeaways"
        items={[
          "Path-based glob locking allows dynamic, graph-aware partitioning of the codebase without manual setup.",
          "Conflict detection is immediate and advisory, letting agents wait or negotiate instead of failing a commit 10 minutes later.",
          "Visualizing the territory map prevents swarms from accidentally stepping on each other's toes during massive refactors.",
        ]}
      />
    </VizSurface>
  );
}
