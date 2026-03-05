"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizAutoStart,
  useVizReducedMotion,
  useVizInViewport,
} from "@/components/viz/viz-framework";

/* ─── Constants ──────────────────────────────────────────────────── */

const FILES = [
  { path: "src/auth/jwt.rs", short: "jwt.rs" },
  { path: "src/auth/session.rs", short: "session.rs" },
  { path: "src/api/routes.rs", short: "routes.rs" },
  { path: "src/api/handlers.rs", short: "handlers.rs" },
  { path: "src/db/schema.rs", short: "schema.rs" },
  { path: "tests/auth_test.rs", short: "auth_test.rs" },
];

interface AgentDef {
  name: string;
  color: string;
  targets: number[]; // file indices this agent will try to edit
}

const CHAOTIC_AGENTS: AgentDef[] = [
  { name: "Agent A", color: "#3B82F6", targets: [0, 1, 2] },
  { name: "Agent B", color: "#EF4444", targets: [0, 1, 5] },
  { name: "Agent C", color: "#EAB308", targets: [2, 3, 4] },
];

const COORDINATED_AGENTS: AgentDef[] = [
  { name: "GreenCastle", color: "#22C55E", targets: [0, 1] },
  { name: "BlueLake", color: "#3B82F6", targets: [2, 3] },
  { name: "CoralBay", color: "#A855F7", targets: [4, 5] },
];

/* ─── State ──────────────────────────────────────────────────────── */

interface FileState {
  editedBy: string | null;
  color: string | null;
  conflicted: boolean;
  overwritten: boolean;
}

interface SimEvent {
  id: number;
  text: string;
  color: string;
  bad?: boolean;
}

interface SimState {
  step: number;
  maxSteps: number;
  fileStates: FileState[];
  events: SimEvent[];
  nextEventId: number;
  conflicts: number;
  wastedEdits: number;
  running: boolean;
}

function initState(): SimState {
  return {
    step: 0,
    maxSteps: 0,
    fileStates: FILES.map(() => ({ editedBy: null, color: null, conflicted: false, overwritten: false })),
    events: [],
    nextEventId: 1,
    conflicts: 0,
    wastedEdits: 0,
    running: false,
  };
}

/* ─── Chaos scenario steps ───────────────────────────────────────── */

interface ScenarioStep {
  action: string;
  agentIdx: number;
  fileIdx: number;
  description: string;
}

const CHAOS_STEPS: ScenarioStep[] = [
  { action: "edit", agentIdx: 0, fileIdx: 0, description: "Agent A starts editing jwt.rs" },
  { action: "edit", agentIdx: 1, fileIdx: 1, description: "Agent B starts editing session.rs" },
  { action: "edit", agentIdx: 2, fileIdx: 2, description: "Agent C starts editing routes.rs" },
  { action: "edit", agentIdx: 1, fileIdx: 0, description: "Agent B ALSO edits jwt.rs!" },
  { action: "edit", agentIdx: 0, fileIdx: 2, description: "Agent A ALSO edits routes.rs!" },
  { action: "edit", agentIdx: 2, fileIdx: 4, description: "Agent C starts editing schema.rs" },
  { action: "edit", agentIdx: 1, fileIdx: 5, description: "Agent B starts editing auth_test.rs" },
  { action: "edit", agentIdx: 0, fileIdx: 1, description: "Agent A ALSO edits session.rs!" },
];

const COORDINATED_STEPS: ScenarioStep[] = [
  { action: "reserve", agentIdx: 0, fileIdx: 0, description: "GreenCastle reserves src/auth/**" },
  { action: "reserve", agentIdx: 1, fileIdx: 2, description: "BlueLake reserves src/api/**" },
  { action: "reserve", agentIdx: 2, fileIdx: 4, description: "CoralBay reserves tests/** + db/**" },
  { action: "edit", agentIdx: 0, fileIdx: 0, description: "GreenCastle safely edits jwt.rs" },
  { action: "edit", agentIdx: 1, fileIdx: 2, description: "BlueLake safely edits routes.rs" },
  { action: "edit", agentIdx: 2, fileIdx: 4, description: "CoralBay safely edits schema.rs" },
  { action: "edit", agentIdx: 0, fileIdx: 1, description: "GreenCastle safely edits session.rs" },
  { action: "edit", agentIdx: 1, fileIdx: 3, description: "BlueLake safely edits handlers.rs" },
  { action: "edit", agentIdx: 2, fileIdx: 5, description: "CoralBay safely edits auth_test.rs" },
];

/* ─── Component ──────────────────────────────────────────────────── */

export default function ConflictCascadeViz() {
  const reducedMotion = useVizReducedMotion();
  const inViewport = useVizInViewport();
  const [chaosState, setChaosState] = useState<SimState>(initState);
  const [coordState, setCoordState] = useState<SimState>(initState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advanceChaos = useCallback(() => {
    setChaosState((prev) => {
      if (prev.step >= CHAOS_STEPS.length) return prev;
      const step = CHAOS_STEPS[prev.step];
      const agent = CHAOTIC_AGENTS[step.agentIdx];
      const files = [...prev.fileStates];
      const events = [...prev.events];
      let { conflicts, wastedEdits, nextEventId } = prev;

      const fileState = files[step.fileIdx];
      if (fileState.editedBy && fileState.editedBy !== agent.name) {
        // Conflict!
        files[step.fileIdx] = { editedBy: agent.name, color: agent.color, conflicted: true, overwritten: true };
        events.unshift({ id: nextEventId++, text: `${step.description} -- OVERWRITES ${fileState.editedBy}!`, color: "#EF4444", bad: true });
        conflicts++;
        wastedEdits++;
      } else {
        files[step.fileIdx] = { editedBy: agent.name, color: agent.color, conflicted: false, overwritten: false };
        events.unshift({ id: nextEventId++, text: step.description, color: agent.color });
      }

      return { ...prev, step: prev.step + 1, maxSteps: CHAOS_STEPS.length, fileStates: files, events, conflicts, wastedEdits, nextEventId };
    });
  }, []);

  const advanceCoord = useCallback(() => {
    setCoordState((prev) => {
      if (prev.step >= COORDINATED_STEPS.length) return prev;
      const step = COORDINATED_STEPS[prev.step];
      const agent = COORDINATED_AGENTS[step.agentIdx];
      const files = [...prev.fileStates];
      const events = [...prev.events];
      let { nextEventId } = prev;

      if (step.action === "reserve") {
        // Mark reservation (for the agent's target range)
        const targetFiles = COORDINATED_AGENTS[step.agentIdx].targets;
        for (const fi of targetFiles) {
          files[fi] = { editedBy: `${agent.name} (reserved)`, color: `${agent.color}80`, conflicted: false, overwritten: false };
        }
        events.unshift({ id: nextEventId++, text: step.description, color: agent.color });
      } else {
        files[step.fileIdx] = { editedBy: agent.name, color: agent.color, conflicted: false, overwritten: false };
        events.unshift({ id: nextEventId++, text: step.description, color: agent.color });
      }

      return { ...prev, step: prev.step + 1, maxSteps: COORDINATED_STEPS.length, fileStates: files, events, nextEventId, conflicts: 0, wastedEdits: 0 };
    });
  }, []);

  const handlePlay = useCallback(() => {
    setChaosState((s) => ({ ...s, running: true }));
    setCoordState((s) => ({ ...s, running: true }));
  }, []);

  useVizAutoStart(handlePlay);

  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setChaosState(initState());
    setCoordState(initState());
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if ((chaosState.running || coordState.running) && inViewport) {
      intervalRef.current = setInterval(() => {
        advanceChaos();
        advanceCoord();
      }, 900);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [chaosState.running, coordState.running, inViewport, advanceChaos, advanceCoord]);

  // Auto-stop
  useEffect(() => {
    if (chaosState.step >= CHAOS_STEPS.length && coordState.step >= COORDINATED_STEPS.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [chaosState.step, coordState.step]);

  const isDone = chaosState.step >= CHAOS_STEPS.length && coordState.step >= COORDINATED_STEPS.length;

  function renderFileGrid(fileStates: FileState[], label: string, accentBorder: string) {
    return (
      <div className="rounded-xl border bg-black/30 p-4" style={{ borderColor: accentBorder }}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">{label}</p>
        <div className="grid grid-cols-2 gap-2">
          {FILES.map((file, idx) => {
            const fs = fileStates[idx];
            return (
              <motion.div
                key={file.path}
                className="rounded-lg border px-3 py-2 relative overflow-hidden"
                style={{
                  borderColor: fs.conflicted ? "#EF444480" : fs.color ? `${fs.color}40` : "#334155",
                  background: fs.conflicted ? "#EF444415" : fs.color ? `${fs.color}08` : "#020617",
                }}
                animate={fs.overwritten && !reducedMotion ? { x: [0, -3, 3, -2, 2, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <p className="text-[9px] font-mono text-slate-500">{file.short}</p>
                {fs.editedBy ? (
                  <p
                    className="text-[10px] font-bold mt-0.5 truncate"
                    style={{ color: fs.conflicted ? "#EF4444" : (fs.color ?? "#94A3B8") }}
                  >
                    {fs.conflicted ? "OVERWRITTEN!" : fs.editedBy}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-600 mt-0.5">untouched</p>
                )}
                {/* Conflict flash overlay */}
                {fs.conflicted && (
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    initial={{ background: "rgba(239,68,68,0.3)" }}
                    animate={{ background: "rgba(239,68,68,0)" }}
                    transition={{ duration: 1 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderEventLog(events: SimEvent[], maxShow: number) {
    return (
      <div className="mt-3 space-y-1 max-h-40 overflow-hidden">
        <AnimatePresence initial={false}>
          {events.slice(0, maxShow).map((evt) => (
            <motion.p
              key={evt.id}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] leading-tight"
              style={{ color: evt.bad ? "#EF4444" : evt.color }}
            >
              {evt.bad ? "!! " : "> "}
              {evt.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <VizSurface aria-label="Conflict cascade comparison: without vs with Agent Mail">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">The Conflict Problem</h3>
          <p className="text-sm text-slate-400">
            Side-by-side: what happens when multiple agents work without coordination vs. with Agent Mail.
          </p>
        </div>
        <div className="flex gap-2">
          <VizControlButton
            tone={chaosState.running ? "neutral" : "green"}
            onClick={handlePlay}
            disabled={chaosState.running || isDone}
          >
            {isDone ? "Done" : chaosState.running ? "Running..." : "Run Scenario"}
          </VizControlButton>
          <VizControlButton tone="neutral" onClick={handleReset}>
            Reset
          </VizControlButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* LEFT: Chaos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <p className="text-xs font-bold text-red-300">Without Agent Mail</p>
          </div>
          {renderFileGrid(chaosState.fileStates, "Project Files", "#EF444430")}
          {renderEventLog(chaosState.events, 6)}
          {isDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center"
            >
              <p className="text-2xl font-black text-red-400">{chaosState.conflicts} conflicts</p>
              <p className="text-xs text-red-300 mt-1">{chaosState.wastedEdits} wasted edits requiring human intervention</p>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Coordinated */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <p className="text-xs font-bold text-green-300">With Agent Mail</p>
          </div>
          {renderFileGrid(coordState.fileStates, "Project Files", "#22C55E30")}
          {renderEventLog(coordState.events, 6)}
          {isDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center"
            >
              <p className="text-2xl font-black text-green-400">0 conflicts</p>
              <p className="text-xs text-green-300 mt-1">All agents worked in parallel, zero wasted effort</p>
            </motion.div>
          )}
        </div>
      </div>
    </VizSurface>
  );
}
