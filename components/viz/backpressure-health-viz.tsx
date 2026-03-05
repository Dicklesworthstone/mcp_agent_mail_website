"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizAutoStart,
  useVizInViewport,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";

// ---- Constants ---------------------------------------------------------------

const SVG_W = 600;
const SVG_H = 320;

type HealthLevel = "green" | "yellow" | "red";

const HEALTH_COLORS: Record<HealthLevel, { fill: string; stroke: string; glow: string; label: string; bg: string }> = {
  green: { fill: "#22C55E", stroke: "#16A34A", glow: "rgba(34,197,94,0.25)", label: "Healthy", bg: "rgba(34,197,94,0.06)" },
  yellow: { fill: "#EAB308", stroke: "#CA8A04", glow: "rgba(234,179,8,0.25)", label: "Elevated", bg: "rgba(234,179,8,0.06)" },
  red: { fill: "#EF4444", stroke: "#DC2626", glow: "rgba(239,68,68,0.25)", label: "Overload", bg: "rgba(239,68,68,0.06)" },
};

interface ToolCall {
  id: number;
  name: string;
  priority: "high" | "low";
  state: "pending" | "accepted" | "shed";
  x: number;
  opacity: number;
}

interface HealthState {
  level: HealthLevel;
  poolUtilPct: number;
  poolAcquireP95Ms: number;
  wbqDepthPct: number;
  commitDepthPct: number;
  poolOver80Sec: number;
  toolCalls: ToolCall[];
  shedCount: number;
  acceptedCount: number;
  elapsed: number;
  nextId: number;
  spawnTimer: number;
  // Oscillation state for natural gauge movement
  phase: number;
  loadBias: number;
}

const HIGH_PRIORITY_TOOLS = ["fetch_inbox", "send_message", "search_messages", "register_agent"];
const LOW_PRIORITY_TOOLS = ["archive_repair", "compact_index", "export_jsonl", "gc_stale_locks"];

// ---- Component ---------------------------------------------------------------

export default function BackpressureHealthViz() {
  const prefersReducedMotion = useVizReducedMotion();
  const inViewport = useVizInViewport();
  const [isRunning, setIsRunning] = useState(false);
  const [loadMultiplier, setLoadMultiplier] = useState(1.0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const shouldAnimate = isRunning && inViewport;
  const shouldAnimateRef = useRef(shouldAnimate);

  const [state, setState] = useState<HealthState>(() => initHealth());

  const autoStart = useCallback(() => setIsRunning(true), []);
  useVizAutoStart(autoStart);

  const paramsRef = useRef({ loadMultiplier });
  useEffect(() => {
    paramsRef.current = { loadMultiplier };
  }, [loadMultiplier]);

  useEffect(() => {
    shouldAnimateRef.current = shouldAnimate;
  }, [shouldAnimate]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setState(initHealth());
    lastTimeRef.current = 0;
  }, []);

  const tickRef = useRef<(now: number) => void>(undefined);
  useEffect(() => {
    tickRef.current = (now: number) => {
      if (!shouldAnimateRef.current) return;
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      if (delta > 0 && delta < 200) {
        setState((prev) => healthTick(prev, delta, paramsRef.current));
      }
      if (shouldAnimateRef.current) {
        rafRef.current = requestAnimationFrame((t) => tickRef.current?.(t));
      }
    };
  });

  useEffect(() => {
    if (shouldAnimate) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame((t) => tickRef.current?.(t));
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [shouldAnimate]);

  const hc = HEALTH_COLORS[state.level];

  if (prefersReducedMotion) {
    return (
      <VizSurface aria-label="Backpressure health system (reduced motion)">
        <VizHeader
          accent="green"
          eyebrow="Reliability"
          title="Three-Level Health & Backpressure"
          subtitle="The system monitors pool utilization, WBQ depth, and commit queue to shed low-priority tools under overload."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["green", "yellow", "red"] as HealthLevel[]).map((level) => {
            const c = HEALTH_COLORS[level];
            return (
              <div key={level} className="rounded-xl border bg-black/40 p-4" style={{ borderColor: `${c.fill}33` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.fill }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: c.fill }}>{c.label}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {level === "green" && "All subsystems healthy. Accept all tool calls normally."}
                  {level === "yellow" && "Elevated load. Pool p95 > 50ms or WBQ > 50%. Defer non-critical archive writes."}
                  {level === "red" && "Overload. Pool p95 > 200ms or WBQ > 80%. Shed low-priority maintenance tools."}
                </p>
              </div>
            );
          })}
        </div>
      </VizSurface>
    );
  }

  return (
    <VizSurface aria-label="Backpressure health gauge simulation">
      <VizHeader
        accent="green"
        eyebrow="Reliability"
        title="Three-Level Health & Backpressure"
        subtitle="Watch the system shed low-priority tools as load increases from Green to Yellow to Red."
        controls={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRunning((r) => !r)}
              className="flex items-center justify-center h-10 px-4 rounded-lg border border-white/10 bg-white/5 text-white text-xs font-bold transition-all hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-green-500/50 outline-none"
              aria-label={isRunning ? "Pause" : "Play"}
            >
              {isRunning ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center h-10 px-4 rounded-lg border border-white/10 bg-white/5 text-white text-xs font-bold transition-all hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-green-500/50 outline-none"
              aria-label="Reset"
            >
              Reset
            </button>
          </div>
        }
      />

      {/* Metrics row */}
      <div className="mb-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
        <VizMetricCard label="Health Level" value={hc.label} tone={state.level === "green" ? "green" : state.level === "yellow" ? "amber" : "red"} />
        <VizMetricCard label="Pool Util" value={`${Math.round(state.poolUtilPct)}%`} tone={state.poolUtilPct > 80 ? "red" : state.poolUtilPct > 60 ? "amber" : "neutral"} />
        <VizMetricCard label="Accepted" value={state.acceptedCount} tone="green" />
        <VizMetricCard label="Shed" value={state.shedCount} tone="red" />
      </div>

      {/* Main visualization */}
      <div className="rounded-xl border border-white/10 bg-[#060A14] overflow-hidden mb-4">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ minHeight: 280 }}>
          {/* Health traffic light */}
          <g>
            <rect x={20} y={30} width={70} height={200} rx={12} fill="#0F172A" stroke="#1E293B" strokeWidth={2} />
            {/* Green light */}
            <circle cx={55} cy={75} r={22} fill={state.level === "green" ? HEALTH_COLORS.green.glow : "#0F172A"} />
            <circle cx={55} cy={75} r={16} fill={state.level === "green" ? HEALTH_COLORS.green.fill : "#1E293B"} opacity={state.level === "green" ? 1 : 0.2}>
              {state.level === "green" && <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />}
            </circle>
            {/* Yellow light */}
            <circle cx={55} cy={130} r={22} fill={state.level === "yellow" ? HEALTH_COLORS.yellow.glow : "#0F172A"} />
            <circle cx={55} cy={130} r={16} fill={state.level === "yellow" ? HEALTH_COLORS.yellow.fill : "#1E293B"} opacity={state.level === "yellow" ? 1 : 0.2}>
              {state.level === "yellow" && <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />}
            </circle>
            {/* Red light */}
            <circle cx={55} cy={185} r={22} fill={state.level === "red" ? HEALTH_COLORS.red.glow : "#0F172A"} />
            <circle cx={55} cy={185} r={16} fill={state.level === "red" ? HEALTH_COLORS.red.fill : "#1E293B"} opacity={state.level === "red" ? 1 : 0.2}>
              {state.level === "red" && <animate attributeName="opacity" values="0.6;1;0.6" dur="0.8s" repeatCount="indefinite" />}
            </circle>
            {/* Labels */}
            <text x={55} y={256} textAnchor="middle" fill="#64748B" fontSize={7} fontWeight={900}>HEALTH</text>
          </g>

          {/* Gauge bars */}
          <g>
            {/* Pool utilization gauge */}
            <GaugeBar x={120} y={40} width={160} height={28} value={state.poolUtilPct} label="Pool Utilization" unit="%" yellowThreshold={70} redThreshold={90} />
            {/* Pool acquire p95 gauge */}
            <GaugeBar x={120} y={85} width={160} height={28} value={Math.min(state.poolAcquireP95Ms / 3, 100)} label="Acquire P95" unit={`${Math.round(state.poolAcquireP95Ms)}ms`} yellowThreshold={50 / 3} redThreshold={200 / 3} />
            {/* WBQ depth gauge */}
            <GaugeBar x={120} y={130} width={160} height={28} value={state.wbqDepthPct} label="WBQ Depth" unit="%" yellowThreshold={50} redThreshold={80} />
            {/* Commit queue gauge */}
            <GaugeBar x={120} y={175} width={160} height={28} value={state.commitDepthPct} label="Commit Queue" unit="%" yellowThreshold={50} redThreshold={80} />
          </g>

          {/* Tool call area */}
          <g>
            <text x={330} y={35} fill="#64748B" fontSize={8} fontWeight={900}>TOOL CALLS</text>
            <line x1={330} y1={42} x2={580} y2={42} stroke="#1E293B" strokeWidth={1} />

            {/* Accepted lane */}
            <text x={330} y={62} fill="#22C55E" fontSize={6} fontWeight={900} opacity={0.5}>ACCEPTED</text>
            <rect x={330} y={66} width={250} height={80} rx={6} fill="rgba(34,197,94,0.03)" stroke="rgba(34,197,94,0.1)" strokeWidth={0.5} />

            {/* Shed lane */}
            <text x={330} y={166} fill="#EF4444" fontSize={6} fontWeight={900} opacity={0.5}>SHED (LOW PRIORITY)</text>
            <rect x={330} y={170} width={250} height={60} rx={6} fill="rgba(239,68,68,0.03)" stroke="rgba(239,68,68,0.1)" strokeWidth={0.5} />

            {/* Tool calls */}
            {state.toolCalls.map((tc) => {
              const isHigh = tc.priority === "high";
              const baseY = tc.state === "shed" ? 185 : 80;
              const row = tc.id % 4;
              const y = baseY + row * 16;

              const fillColor = tc.state === "shed"
                ? "#EF4444"
                : isHigh ? "#22C55E" : "#3B82F6";

              return (
                <g key={tc.id} opacity={tc.opacity}>
                  <rect
                    x={tc.x}
                    y={y}
                    width={72}
                    height={12}
                    rx={3}
                    fill={`${fillColor}15`}
                    stroke={`${fillColor}40`}
                    strokeWidth={0.5}
                  />
                  <text x={tc.x + 4} y={y + 9} fill={fillColor} fontSize={5.5} fontWeight={800}>
                    {tc.name}
                  </text>
                  {tc.state === "shed" && (
                    <text x={tc.x + 68} y={y + 9} textAnchor="end" fill="#EF4444" fontSize={5} fontWeight={900}>
                      X
                    </text>
                  )}
                  {tc.state === "accepted" && (
                    <text x={tc.x + 68} y={y + 9} textAnchor="end" fill="#22C55E" fontSize={5} fontWeight={900}>
                      OK
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Legend */}
          <g>
            <rect x={120} y={230} width={8} height={8} rx={2} fill="#22C55E" opacity={0.6} />
            <text x={132} y={237} fill="#64748B" fontSize={6} fontWeight={700}>High priority (always accepted)</text>
            <rect x={300} y={230} width={8} height={8} rx={2} fill="#3B82F6" opacity={0.6} />
            <text x={312} y={237} fill="#64748B" fontSize={6} fontWeight={700}>Low priority (shed under Red)</text>
            <rect x={460} y={230} width={8} height={8} rx={2} fill="#EF4444" opacity={0.6} />
            <text x={472} y={237} fill="#64748B" fontSize={6} fontWeight={700}>Shed</text>
          </g>

          {/* Thresholds reference */}
          <g>
            <text x={120} y={268} fill="#475569" fontSize={5.5} fontWeight={700}>
              Yellow: pool p95 &gt; 50ms | WBQ &gt; 50% | commit &gt; 50% | pool util &gt; 70%
            </text>
            <text x={120} y={280} fill="#475569" fontSize={5.5} fontWeight={700}>
              Red: pool p95 &gt; 200ms | WBQ &gt; 80% | commit &gt; 80% | pool util &gt; 90%
            </text>
          </g>
        </svg>
      </div>

      {/* Load control */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-xl border border-white/5 bg-black/20">
        <label className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-400 whitespace-nowrap">Load: {loadMultiplier.toFixed(1)}x</span>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.1}
            value={loadMultiplier}
            onChange={(e) => setLoadMultiplier(Number(e.target.value))}
            className="w-28 accent-green-500 h-6"
          />
        </label>
        <div className="flex gap-2">
          <VizControlButton tone="green" onClick={() => setLoadMultiplier(0.5)}>Low Load</VizControlButton>
          <VizControlButton tone="amber" onClick={() => setLoadMultiplier(1.5)}>Medium</VizControlButton>
          <VizControlButton tone="red" onClick={() => setLoadMultiplier(2.5)}>High Load</VizControlButton>
        </div>
      </div>

      <VizLearningBlock
        accent="green"
        title="How Backpressure Works"
        items={[
          "Green: All subsystems healthy. Every tool call is accepted immediately.",
          "Yellow: Pool acquire P95 > 50ms or WBQ > 50%. Non-critical archive writes deferred. Logging reduced.",
          "Red: Pool acquire P95 > 200ms or WBQ > 80%. Low-priority maintenance tools (archive_repair, compact_index) are rejected.",
          "High-priority tools (fetch_inbox, send_message, search) are never shed, even under Red. Only maintenance work is sacrificed.",
        ]}
      />
    </VizSurface>
  );
}

// ---- SVG sub-components ------------------------------------------------------

function GaugeBar({
  x, y, width, height, value, label, unit, yellowThreshold, redThreshold,
}: {
  x: number; y: number; width: number; height: number;
  value: number; label: string; unit: string;
  yellowThreshold: number; redThreshold: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fillW = (pct / 100) * (width - 4);
  const color = pct >= redThreshold ? "#EF4444" : pct >= yellowThreshold ? "#EAB308" : "#22C55E";

  return (
    <g>
      <text x={x} y={y - 4} fill="#64748B" fontSize={6.5} fontWeight={900}>
        {label}
      </text>
      <text x={x + width} y={y - 4} textAnchor="end" fill={color} fontSize={6.5} fontWeight={900}>
        {unit}
      </text>
      <rect x={x} y={y} width={width} height={height} rx={5} fill="#0F172A" stroke="#1E293B" strokeWidth={1} />
      <rect x={x + 2} y={y + 2} width={fillW} height={height - 4} rx={3} fill={color} opacity={0.7}>
        <animate attributeName="opacity" values="0.6;0.8;0.6" dur="2s" repeatCount="indefinite" />
      </rect>
      {/* Threshold markers */}
      <line x1={x + (yellowThreshold / 100) * (width - 4) + 2} y1={y} x2={x + (yellowThreshold / 100) * (width - 4) + 2} y2={y + height} stroke="#EAB308" strokeWidth={0.5} opacity={0.3} strokeDasharray="2 2" />
      <line x1={x + (redThreshold / 100) * (width - 4) + 2} y1={y} x2={x + (redThreshold / 100) * (width - 4) + 2} y2={y + height} stroke="#EF4444" strokeWidth={0.5} opacity={0.3} strokeDasharray="2 2" />
    </g>
  );
}

// ---- Simulation logic --------------------------------------------------------

function initHealth(): HealthState {
  return {
    level: "green",
    poolUtilPct: 25,
    poolAcquireP95Ms: 10,
    wbqDepthPct: 15,
    commitDepthPct: 10,
    poolOver80Sec: 0,
    toolCalls: [],
    shedCount: 0,
    acceptedCount: 0,
    elapsed: 0,
    nextId: 0,
    spawnTimer: 0,
    phase: 0,
    loadBias: 0,
  };
}

function determineHealth(s: HealthState): HealthLevel {
  if (
    s.poolAcquireP95Ms > 200 ||
    s.wbqDepthPct > 80 ||
    s.commitDepthPct > 80 ||
    s.poolUtilPct > 90
  ) return "red";

  if (
    s.poolAcquireP95Ms > 50 ||
    s.wbqDepthPct > 50 ||
    s.commitDepthPct > 50 ||
    s.poolUtilPct > 70
  ) return "yellow";

  return "green";
}

function healthTick(
  prev: HealthState,
  deltaMs: number,
  params: { loadMultiplier: number },
): HealthState {
  const dt = deltaMs / 1000;
  let {
    poolUtilPct, poolAcquireP95Ms, wbqDepthPct, commitDepthPct,
    poolOver80Sec, shedCount, acceptedCount, nextId, spawnTimer,
    phase, loadBias,
  } = prev;

  const toolCalls = prev.toolCalls.map((tc) => ({ ...tc }));

  // Oscillate load naturally with sin wave + load multiplier
  phase += dt * 0.4;
  const targetBias = params.loadMultiplier;
  loadBias += (targetBias - loadBias) * dt * 0.5;

  const wave = Math.sin(phase) * 0.3 + Math.sin(phase * 2.3) * 0.15;
  const loadFactor = Math.max(0.2, loadBias + wave);

  // Update gauges with natural oscillation
  const targetPool = Math.min(98, Math.max(10, loadFactor * 35 + Math.sin(phase * 1.7) * 8));
  const targetP95 = Math.min(300, Math.max(5, loadFactor * 80 + Math.sin(phase * 1.3) * 20));
  const targetWbq = Math.min(98, Math.max(5, loadFactor * 30 + Math.sin(phase * 0.9) * 10));
  const targetCommit = Math.min(98, Math.max(5, loadFactor * 28 + Math.sin(phase * 1.1) * 8));

  poolUtilPct += (targetPool - poolUtilPct) * dt * 2;
  poolAcquireP95Ms += (targetP95 - poolAcquireP95Ms) * dt * 2;
  wbqDepthPct += (targetWbq - wbqDepthPct) * dt * 2;
  commitDepthPct += (targetCommit - commitDepthPct) * dt * 2;

  if (poolUtilPct > 80) poolOver80Sec += dt;
  else poolOver80Sec = Math.max(0, poolOver80Sec - dt * 2);

  // Spawn tool calls
  spawnTimer += deltaMs;
  const spawnInterval = 800 / loadFactor;
  while (spawnTimer >= spawnInterval && toolCalls.length < 20) {
    spawnTimer -= spawnInterval;
    const isHigh = Math.random() < 0.6;
    const tools = isHigh ? HIGH_PRIORITY_TOOLS : LOW_PRIORITY_TOOLS;
    const name = tools[nextId % tools.length];
    toolCalls.push({
      id: nextId,
      name,
      priority: isHigh ? "high" : "low",
      state: "pending",
      x: 335,
      opacity: 1,
    });
    nextId++;
  }

  // Determine current health level
  const newState: HealthState = {
    ...prev,
    poolUtilPct, poolAcquireP95Ms, wbqDepthPct, commitDepthPct,
    poolOver80Sec, shedCount, acceptedCount, nextId, spawnTimer,
    phase, loadBias, toolCalls,
  };
  const level = determineHealth(newState);

  // Process pending tool calls
  for (const tc of toolCalls) {
    if (tc.state === "pending") {
      if (level === "red" && tc.priority === "low") {
        tc.state = "shed";
        shedCount++;
      } else {
        tc.state = "accepted";
        acceptedCount++;
      }
    }

    // Animate tool calls moving right and fading
    if (tc.state === "accepted") {
      tc.x += dt * 60;
      if (tc.x > 500) tc.opacity -= dt * 2;
    } else if (tc.state === "shed") {
      tc.opacity -= dt * 0.8;
    }
  }

  // Remove faded tool calls
  const activeCalls = toolCalls.filter((tc) => tc.opacity > 0);

  return {
    ...newState,
    level,
    toolCalls: activeCalls.slice(-16),
    shedCount,
    acceptedCount,
    elapsed: prev.elapsed + deltaMs,
  };
}
