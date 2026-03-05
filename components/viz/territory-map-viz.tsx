"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  VizMetricCard,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";

/* ─── File tree structure ────────────────────────────────────────── */

interface FileNode {
  path: string;
  shortName: string;
  size: number; // Relative visual weight
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Reservation {
  id: number;
  agentId: string;
  glob: string;
  matchingFiles: number[];
  ttlRemaining: number;
  exclusive: boolean;
}

interface AgentDef {
  id: string;
  name: string;
  color: string;
  borderColor: string;
}

const AGENTS: AgentDef[] = [
  { id: "gc", name: "GreenCastle", color: "#22C55E", borderColor: "#22C55E60" },
  { id: "bl", name: "BlueLake", color: "#3B82F6", borderColor: "#3B82F660" },
  { id: "rh", name: "RedHarbor", color: "#EF4444", borderColor: "#EF444460" },
  { id: "gp", name: "GoldPeak", color: "#EAB308", borderColor: "#EAB30860" },
];

// File tree laid out in a grid (pre-computed treemap positions)
const FILES: FileNode[] = [
  // src/auth/
  { path: "src/auth/jwt.rs", shortName: "jwt.rs", size: 3, x: 0, y: 0, w: 2, h: 2 },
  { path: "src/auth/session.rs", shortName: "session.rs", size: 2, x: 2, y: 0, w: 2, h: 1 },
  { path: "src/auth/middleware.rs", shortName: "middleware.rs", size: 2, x: 2, y: 1, w: 2, h: 1 },
  // src/api/
  { path: "src/api/routes.rs", shortName: "routes.rs", size: 3, x: 4, y: 0, w: 2, h: 2 },
  { path: "src/api/handlers.rs", shortName: "handlers.rs", size: 2, x: 6, y: 0, w: 2, h: 1 },
  { path: "src/api/middleware.rs", shortName: "api_mw.rs", size: 1, x: 6, y: 1, w: 2, h: 1 },
  // src/db/
  { path: "src/db/schema.rs", shortName: "schema.rs", size: 3, x: 0, y: 2, w: 2, h: 2 },
  { path: "src/db/queries.rs", shortName: "queries.rs", size: 2, x: 2, y: 2, w: 2, h: 1 },
  { path: "src/db/pool.rs", shortName: "pool.rs", size: 1, x: 2, y: 3, w: 2, h: 1 },
  // tests/
  { path: "tests/auth_test.rs", shortName: "auth_test.rs", size: 2, x: 4, y: 2, w: 2, h: 1 },
  { path: "tests/api_test.rs", shortName: "api_test.rs", size: 2, x: 6, y: 2, w: 2, h: 1 },
  { path: "tests/db_test.rs", shortName: "db_test.rs", size: 2, x: 4, y: 3, w: 2, h: 1 },
  // config/
  { path: "config/default.toml", shortName: "default.toml", size: 1, x: 6, y: 3, w: 1, h: 1 },
  { path: "config/test.toml", shortName: "test.toml", size: 1, x: 7, y: 3, w: 1, h: 1 },
];

// Glob patterns and which file indices they match
const GLOB_MATCHES: Record<string, number[]> = {
  "src/auth/**": [0, 1, 2],
  "src/api/**": [3, 4, 5],
  "src/db/**": [6, 7, 8],
  "tests/**": [9, 10, 11],
  "config/**": [12, 13],
};

/* ─── Scenario steps ─────────────────────────────────────────────── */

interface ScenarioStep {
  action: "reserve" | "release" | "conflict" | "expire";
  agentId: string;
  glob: string;
  description: string;
}

const SCENARIO: ScenarioStep[] = [
  { action: "reserve", agentId: "gc", glob: "src/auth/**", description: "GreenCastle reserves src/auth/**" },
  { action: "reserve", agentId: "bl", glob: "src/api/**", description: "BlueLake reserves src/api/**" },
  { action: "reserve", agentId: "rh", glob: "src/db/**", description: "RedHarbor reserves src/db/**" },
  { action: "reserve", agentId: "gp", glob: "tests/**", description: "GoldPeak reserves tests/**" },
  { action: "conflict", agentId: "bl", glob: "src/auth/**", description: "BlueLake tries src/auth/** -- BLOCKED (GreenCastle holds it)" },
  { action: "reserve", agentId: "bl", glob: "config/**", description: "BlueLake reserves config/** instead" },
  { action: "release", agentId: "gc", glob: "src/auth/**", description: "GreenCastle releases src/auth/**" },
  { action: "reserve", agentId: "bl", glob: "src/auth/**", description: "BlueLake now reserves src/auth/**" },
  { action: "expire", agentId: "rh", glob: "src/db/**", description: "RedHarbor's reservation on src/db/** expires (TTL)" },
  { action: "release", agentId: "gp", glob: "tests/**", description: "GoldPeak releases tests/** (work done)" },
];

/* ─── Component ──────────────────────────────────────────────────── */

const CELL_SIZE = 38;
const GAP = 3;
const PAD = 16;
const GRID_W = 8;
const GRID_H = 4;
const SVG_W = GRID_W * (CELL_SIZE + GAP) + PAD * 2;
const SVG_H = GRID_H * (CELL_SIZE + GAP) + PAD * 2;

const AGENT_MAP = new Map(AGENTS.map((a) => [a.id, a]));

export default function TerritoryMapViz() {
  const reducedMotion = useVizReducedMotion();
  const [step, setStep] = useState(0);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<{ text: string; color: string; bad?: boolean }[]>([]);
  const [running, setRunning] = useState(false);
  const [conflictFlash, setConflictFlash] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextResId = useRef(1);

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
          setTimeout(() => setConflictFlash([]), 1200);
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
    setRunning(false);
    setStep(0);
    setReservations([]);
    setEvents([]);
    setConflictFlash([]);
    nextResId.current = 1;
  }, []);

  useEffect(() => {
    if (running && step < SCENARIO.length) {
      intervalRef.current = setInterval(advanceStep, 1200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, step, advanceStep]);

  const isDone = step >= SCENARIO.length;

  // Gather directory group labels
  const dirGroups = [
    { label: "src/auth/", x: 0, y: 0, w: 4, h: 2 },
    { label: "src/api/", x: 4, y: 0, w: 4, h: 2 },
    { label: "src/db/", x: 0, y: 2, w: 4, h: 2 },
    { label: "tests/", x: 4, y: 2, w: 2, h: 2 },
    { label: "config/", x: 6, y: 3, w: 2, h: 1 },
  ];

  return (
    <VizSurface aria-label="File reservation territory map showing which agent owns which files">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Reservation Territory Map</h3>
          <p className="text-sm text-slate-400">
            Spatial view of file ownership: agents claim glob patterns, conflicts are caught, TTLs expire.
          </p>
        </div>
        <div className="flex gap-2">
          <VizControlButton tone="blue" onClick={running ? () => setRunning(false) : handlePlay} disabled={isDone}>
            {isDone ? "Complete" : running ? "Pause" : "Play Scenario"}
          </VizControlButton>
          {!running && step < SCENARIO.length && (
            <VizControlButton tone="neutral" onClick={advanceStep}>
              Step
            </VizControlButton>
          )}
          <VizControlButton tone="neutral" onClick={handleReset}>
            Reset
          </VizControlButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Territory map */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-center">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-xl" role="img" aria-label="Treemap of project files with colored territory ownership">
            {/* Directory group outlines */}
            {dirGroups.map((g) => (
              <g key={g.label}>
                <rect
                  x={PAD + g.x * (CELL_SIZE + GAP) - 2}
                  y={PAD + g.y * (CELL_SIZE + GAP) - 2}
                  width={g.w * (CELL_SIZE + GAP) - GAP + 4}
                  height={g.h * (CELL_SIZE + GAP) - GAP + 4}
                  rx={4}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <text
                  x={PAD + g.x * (CELL_SIZE + GAP)}
                  y={PAD + g.y * (CELL_SIZE + GAP) - 5}
                  fill="#475569"
                  fontSize="6"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {g.label}
                </text>
              </g>
            ))}

            {/* File cells */}
            {FILES.map((file, idx) => {
              const owner = getFileOwner(idx);
              const isConflictTarget = conflictFlash.includes(idx);
              const cellX = PAD + file.x * (CELL_SIZE + GAP);
              const cellY = PAD + file.y * (CELL_SIZE + GAP);
              const cellW = file.w * (CELL_SIZE + GAP) - GAP;
              const cellH = file.h * (CELL_SIZE + GAP) - GAP;

              return (
                <g key={file.path}>
                  {/* Background */}
                  <motion.rect
                    x={cellX} y={cellY}
                    width={cellW} height={cellH}
                    rx={4}
                    fill={
                      isConflictTarget ? "#EF444430"
                      : owner ? `${owner.color}18`
                      : "#0F172A"
                    }
                    stroke={
                      isConflictTarget ? "#EF4444"
                      : owner ? owner.borderColor
                      : "#1E293B"
                    }
                    strokeWidth={isConflictTarget ? 2 : owner ? 1.5 : 0.8}
                    animate={isConflictTarget && !reducedMotion
                      ? { x: [cellX, cellX - 2, cellX + 2, cellX - 1, cellX + 1, cellX] }
                      : {}}
                    transition={{ duration: 0.3 }}
                  />

                  {/* File name */}
                  <text
                    x={cellX + cellW / 2}
                    y={cellY + cellH / 2 - (owner ? 3 : 0)}
                    textAnchor="middle"
                    fill={owner ? "#E2E8F0" : "#64748B"}
                    fontSize="6"
                    fontFamily="monospace"
                    fontWeight={owner ? "bold" : "normal"}
                  >
                    {file.shortName}
                  </text>

                  {/* Owner label */}
                  {owner && (
                    <text
                      x={cellX + cellW / 2}
                      y={cellY + cellH / 2 + 7}
                      textAnchor="middle"
                      fill={owner.color}
                      fontSize="5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {owner.name}
                    </text>
                  )}

                  {/* Conflict X marker */}
                  {isConflictTarget && (
                    <text
                      x={cellX + cellW - 6}
                      y={cellY + 9}
                      fill="#EF4444"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      X
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Event log + Legend */}
        <div className="space-y-4">
          {/* Agent legend */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
              Agents
            </p>
            <div className="space-y-1.5">
              {AGENTS.map((a) => {
                const hasReservation = reservations.some((r) => r.agentId === a.id);
                return (
                  <div key={a.id} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: a.color, opacity: hasReservation ? 1 : 0.3 }}
                    />
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: hasReservation ? a.color : "#64748B" }}
                    >
                      {a.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event feed */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 max-h-56 overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
              Events ({step}/{SCENARIO.length})
            </p>
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {events.slice(0, 10).map((evt, i) => (
                  <motion.p
                    key={`${step}-${i}`}
                    initial={reducedMotion ? {} : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[9px] leading-tight"
                    style={{ color: evt.color }}
                  >
                    {evt.bad ? "!! " : "> "}
                    {evt.text}
                  </motion.p>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <VizMetricCard label="Active Reservations" value={reservations.length} tone="blue" />
        <VizMetricCard label="Files Covered" value={new Set(reservations.flatMap((r) => r.matchingFiles)).size} tone="green" />
        <VizMetricCard
          label="Conflicts Blocked"
          value={events.filter((e) => e.bad).length}
          tone={events.some((e) => e.bad) ? "red" : "neutral"}
        />
        <VizMetricCard label="Step" value={`${step}/${SCENARIO.length}`} tone="neutral" />
      </div>
    </VizSurface>
  );
}
