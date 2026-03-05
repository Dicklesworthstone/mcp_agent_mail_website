"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  VizMetricCard,
  useVizAutoStart,
  useVizReducedMotion,
  useVizInViewport,
} from "@/components/viz/viz-framework";

/* ─── Agent Colors & Identities ─────────────────────────────────── */

interface Agent {
  id: string;
  name: string;
  color: string;
  angle: number; // position on the ring (radians)
}

const AGENTS: Agent[] = [
  { id: "gc", name: "GreenCastle", color: "#22C55E", angle: -Math.PI / 2 },
  { id: "bl", name: "BlueLake", color: "#3B82F6", angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
  { id: "rh", name: "RedHarbor", color: "#EF4444", angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
  { id: "gp", name: "GoldPeak", color: "#EAB308", angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
  { id: "cb", name: "CoralBay", color: "#A855F7", angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
];

const AGENT_MAP = new Map(AGENTS.map((a) => [a.id, a]));

const FILE_ZONES = [
  "src/auth/**",
  "src/api/**",
  "tests/**",
  "src/db/**",
  "config/**",
  "src/tui/**",
];

/* ─── Event Types ────────────────────────────────────────────────── */

interface SwarmEvent {
  id: number;
  tick: number;
  type: "reserve" | "message" | "complete" | "release" | "conflict";
  agent: string;
  target?: string;
  zone?: string;
  description: string;
}

interface MessageParticle {
  id: number;
  fromId: string;
  toId: string;
  progress: number;
  color: string;
}

interface SwarmState {
  running: boolean;
  tick: number;
  rngSeed: number;
  nextEventId: number;
  nextParticleId: number;
  events: SwarmEvent[];
  reservations: Map<string, string>; // zone → agent id
  particles: MessageParticle[];
  messageCount: number;
  reservationCount: number;
  taskCount: number;
  conflictCount: number;
  agentActivity: Map<string, number>; // agent id → last active tick
}

type SwarmAction =
  | { type: "TICK" }
  | { type: "TOGGLE_RUNNING" }
  | { type: "START" }
  | { type: "RESET" };

/* ─── Deterministic PRNG ─────────────────────────────────────────── */

function mulberry32(seed: number) {
  const s = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return {
    seed: s,
    value: ((t ^ (t >>> 14)) >>> 0) / 4294967296,
  };
}

function nextRandom(seed: number) {
  return mulberry32(seed);
}

/* ─── Reducer ────────────────────────────────────────────────────── */

function createEvent(
  tick: number,
  id: number,
  type: SwarmEvent["type"],
  agent: string,
  description: string,
  target?: string,
  zone?: string,
): SwarmEvent {
  return { id, tick, type, agent, target, zone, description };
}

function swarmReducer(state: SwarmState, action: SwarmAction): SwarmState {
  switch (action.type) {
    case "TOGGLE_RUNNING":
      return { ...state, running: !state.running };

    case "START":
      return state.running ? state : { ...state, running: true };

    case "RESET":
      return {
        running: false,
        tick: 0,
        rngSeed: 42,
        nextEventId: 1,
        nextParticleId: 1,
        events: [],
        reservations: new Map(),
        particles: [],
        messageCount: 0,
        reservationCount: 0,
        taskCount: 0,
        conflictCount: 0,
        agentActivity: new Map(),
      };

    case "TICK": {
      if (!state.running) return state;

      const tick = state.tick + 1;
      const newEvents: SwarmEvent[] = [];
      const reservations = new Map(state.reservations);
      const activity = new Map(state.agentActivity);
      let { messageCount, reservationCount, taskCount, conflictCount } = state;
      let { nextEventId, nextParticleId } = state;
      let rngSeed = state.rngSeed;
      const newParticles = state.particles.map((p) => ({ ...p, progress: Math.min(1, p.progress + 0.08) }));

      const draw = () => {
        const next = nextRandom(rngSeed);
        rngSeed = next.seed;
        return next.value;
      };

      const pickRandom = <T,>(arr: readonly T[]): T => arr[Math.floor(draw() * arr.length)];

      // Remove completed particles
      const activeParticles = newParticles.filter((p) => p.progress < 1);

      // Generate 1-2 events per tick based on probability
      const eventChance = draw();

      if (eventChance < 0.35) {
        // Reserve a file zone
        const agent = pickRandom(AGENTS);
        const zone = pickRandom(FILE_ZONES);
        activity.set(agent.id, tick);

        if (reservations.has(zone) && reservations.get(zone) !== agent.id) {
          const holder = AGENT_MAP.get(reservations.get(zone)!)!;
          newEvents.push(
            createEvent(tick, nextEventId++, "conflict", agent.id,
              `${agent.name} blocked on ${zone} (held by ${holder.name})`, undefined, zone)
          );
          conflictCount++;
        } else {
          reservations.set(zone, agent.id);
          newEvents.push(
            createEvent(tick, nextEventId++, "reserve", agent.id,
              `${agent.name} reserved ${zone}`, undefined, zone)
          );
          reservationCount++;
        }
      } else if (eventChance < 0.65) {
        // Send a message
        const from = pickRandom(AGENTS);
        const others = AGENTS.filter((a) => a.id !== from.id);
        const to = others.length > 0 ? pickRandom(others) : from;
        activity.set(from.id, tick);
        activity.set(to.id, tick);

        activeParticles.push({
          id: nextParticleId++,
          fromId: from.id,
          toId: to.id,
          progress: 0,
          color: from.color,
        });

        newEvents.push(
          createEvent(tick, nextEventId++, "message", from.id,
            `${from.name} messaged ${to.name}`, to.id)
        );
        messageCount++;
      } else if (eventChance < 0.8) {
        // Complete a task
        const agent = pickRandom(AGENTS);
        activity.set(agent.id, tick);
        const taskId = `br-${100 + Math.floor(draw() * 400)}`;
        newEvents.push(
          createEvent(tick, nextEventId++, "complete", agent.id,
            `${agent.name} completed ${taskId}`)
        );
        taskCount++;
      } else if (eventChance < 0.92) {
        // Release a reservation
        const held = Array.from(reservations.entries());
        if (held.length > 0) {
          const [zone, agentId] = pickRandom(held);
          const agent = AGENT_MAP.get(agentId)!;
          reservations.delete(zone);
          activity.set(agent.id, tick);
          newEvents.push(
            createEvent(tick, nextEventId++, "release", agent.id,
              `${agent.name} released ${zone}`, undefined, zone)
          );
        }
      }

      return {
        ...state,
        tick,
        rngSeed,
        nextEventId,
        nextParticleId,
        running: true,
        events: [...newEvents, ...state.events].slice(0, 50),
        reservations,
        particles: activeParticles,
        messageCount,
        reservationCount,
        taskCount,
        conflictCount,
        agentActivity: activity,
      };
    }

    default:
      return state;
  }
}

const INITIAL_STATE: SwarmState = {
  running: false,
  tick: 0,
  rngSeed: 42,
  nextEventId: 1,
  nextParticleId: 1,
  events: [],
  reservations: new Map(),
  particles: [],
  messageCount: 0,
  reservationCount: 0,
  taskCount: 0,
  conflictCount: 0,
  agentActivity: new Map(),
};

/* ─── SVG Constants ──────────────────────────────────────────────── */

const CX = 160;
const CY = 140;
const RING_R = 95;
const NODE_R = 22;
const SVG_W = 320;
const SVG_H = 280;

function agentPos(agent: Agent): { x: number; y: number } {
  return {
    x: CX + RING_R * Math.cos(agent.angle),
    y: CY + RING_R * Math.sin(agent.angle),
  };
}

const EVENT_TYPE_COLORS: Record<SwarmEvent["type"], string> = {
  reserve: "#22C55E",
  message: "#3B82F6",
  complete: "#A855F7",
  release: "#94A3B8",
  conflict: "#EF4444",
};

const EVENT_TYPE_LABELS: Record<SwarmEvent["type"], string> = {
  reserve: "RSV",
  message: "MSG",
  complete: "DONE",
  release: "REL",
  conflict: "CONF",
};

/* ─── Component ──────────────────────────────────────────────────── */

export default function SwarmSimulationViz() {
  const reducedMotion = useVizReducedMotion();
  const inViewport = useVizInViewport();
  const [state, dispatch] = useReducer(swarmReducer, INITIAL_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const agentMap = useMemo(() => new Map(AGENTS.map((a) => [a.id, a])), []);

  const startSimulation = useCallback(() => {
    dispatch({ type: "TOGGLE_RUNNING" });
  }, []);

  const autoStart = useCallback(() => {
    dispatch({ type: "START" });
  }, []);
  useVizAutoStart(autoStart);

  const resetSimulation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    if (state.running && inViewport) {
      intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 600);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.running, inViewport]);

  return (
    <VizSurface aria-label="Multi-agent swarm simulation">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Live Agent Swarm</h3>
          <p className="text-sm text-slate-400">
            Watch five agents coordinate in real time: reserving files, sending messages, and completing tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <VizControlButton
            tone={state.running ? "red" : "green"}
            onClick={startSimulation}
          >
            {state.running ? "Pause" : "Start"}
          </VizControlButton>
          <VizControlButton tone="neutral" onClick={resetSimulation}>
            Reset
          </VizControlButton>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {/* SVG constellation — spans 3 columns */}
        <div className="lg:col-span-3 rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-center overflow-hidden">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-lg" role="img" aria-label="Agent constellation showing agents as nodes with message particles flowing between them">
            {/* Faint ring */}
            <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Connection lines between all agents (faint) */}
            {AGENTS.map((a, i) =>
              AGENTS.slice(i + 1).map((b) => {
                const pa = agentPos(a);
                const pb = agentPos(b);
                return (
                  <line
                    key={`${a.id}-${b.id}`}
                    x1={pa.x} y1={pa.y}
                    x2={pb.x} y2={pb.y}
                    stroke="#1E293B"
                    strokeWidth="0.5"
                  />
                );
              })
            )}

            {/* Message particles */}
            <AnimatePresence>
              {state.particles.map((p) => {
                const from = agentMap.get(p.fromId)!;
                const to = agentMap.get(p.toId)!;
                const pFrom = agentPos(from);
                const pTo = agentPos(to);
                const x = pFrom.x + (pTo.x - pFrom.x) * p.progress;
                const y = pFrom.y + (pTo.y - pFrom.y) * p.progress;
                return (
                  <motion.g key={p.id}>
                    <motion.circle
                      cx={x} cy={y} r={4}
                      fill={p.color}
                      initial={{ opacity: 0, r: 0 }}
                      animate={reducedMotion
                        ? { opacity: 0.9, r: 4 }
                        : { opacity: [0.4, 0.9, 0.4], r: [3, 5, 3] }}
                      exit={{ opacity: 0, r: 0 }}
                      transition={reducedMotion
                        ? { duration: 0 }
                        : { duration: 0.8, repeat: Infinity }}
                    />
                    {/* Trail */}
                    <line
                      x1={pFrom.x + (pTo.x - pFrom.x) * Math.max(0, p.progress - 0.15)}
                      y1={pFrom.y + (pTo.y - pFrom.y) * Math.max(0, p.progress - 0.15)}
                      x2={x} y2={y}
                      stroke={p.color}
                      strokeWidth="1.5"
                      opacity={0.3}
                      strokeLinecap="round"
                    />
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* Agent nodes */}
            {AGENTS.map((agent) => {
              const pos = agentPos(agent);
              const isActive = (state.agentActivity.get(agent.id) ?? 0) > state.tick - 3;
              return (
                <g key={agent.id}>
                  {/* Glow ring for active agents */}
                  {isActive && !reducedMotion && (
                    <motion.circle
                      cx={pos.x} cy={pos.y} r={NODE_R + 6}
                      fill="none" stroke={agent.color}
                      strokeWidth="1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {/* Node background */}
                  <circle
                    cx={pos.x} cy={pos.y} r={NODE_R}
                    fill="#0F172A"
                    stroke={agent.color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    opacity={isActive ? 1 : 0.6}
                  />
                  {/* Inner colored dot */}
                  <circle
                    cx={pos.x} cy={pos.y} r={6}
                    fill={agent.color}
                    opacity={isActive ? 0.9 : 0.4}
                  />
                  {/* Name label */}
                  <text
                    x={pos.x}
                    y={pos.y + NODE_R + 14}
                    textAnchor="middle"
                    fill={agent.color}
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {agent.name}
                  </text>
                </g>
              );
            })}

            {/* Center label */}
            <text x={CX} y={CY - 4} textAnchor="middle" fill="#64748B" fontSize="7" fontWeight="bold" fontFamily="monospace">
              AGENT MAIL
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle" fill="#475569" fontSize="6" fontFamily="monospace">
              SERVER
            </text>
          </svg>
        </div>

        {/* Live event feed — spans 2 columns */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-black/30 p-4 max-h-[340px] overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
            Live Event Stream
          </p>
          <div className="space-y-1.5 overflow-hidden">
            <AnimatePresence initial={false}>
              {state.events.slice(0, 12).map((evt) => {
                const agent = agentMap.get(evt.agent);
                return (
                  <motion.div
                    key={evt.id}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
                    className="flex items-start gap-2 text-xs"
                  >
                    <span
                      className="shrink-0 rounded px-1 py-0.5 font-mono text-[9px] font-bold"
                      style={{
                        color: EVENT_TYPE_COLORS[evt.type],
                        background: `${EVENT_TYPE_COLORS[evt.type]}15`,
                        border: `1px solid ${EVENT_TYPE_COLORS[evt.type]}30`,
                      }}
                    >
                      {EVENT_TYPE_LABELS[evt.type]}
                    </span>
                    <span className="text-slate-400 leading-tight">
                      <span style={{ color: agent?.color }} className="font-semibold">
                        {agent?.name}
                      </span>{" "}
                      {evt.description.replace(agent?.name ?? "", "").trim()}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {state.events.length === 0 && (
              <p className="text-xs text-slate-600 italic">
                Press Start to begin the simulation...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File reservations bar */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
          Active File Reservations
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {FILE_ZONES.map((zone) => {
            const holderId = state.reservations.get(zone);
            const holder = holderId ? agentMap.get(holderId) : null;
            return (
              <div
                key={zone}
                className="rounded-lg border px-3 py-2 text-center transition-colors"
                style={{
                  borderColor: holder ? `${holder.color}40` : "#334155",
                  background: holder ? `${holder.color}10` : "#020617",
                }}
              >
                <p className="text-[9px] font-mono text-slate-500 truncate">{zone}</p>
                {holder ? (
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: holder.color }}>
                    {holder.name}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-600 mt-0.5">available</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <VizMetricCard label="Messages Sent" value={state.messageCount} tone="blue" />
        <VizMetricCard label="Reservations" value={state.reservationCount} tone="green" />
        <VizMetricCard label="Tasks Completed" value={state.taskCount} tone="neutral" />
        <VizMetricCard
          label="Conflicts Caught"
          value={state.conflictCount}
          tone={state.conflictCount > 0 ? "red" : "neutral"}
        />
      </div>
    </VizSurface>
  );
}
