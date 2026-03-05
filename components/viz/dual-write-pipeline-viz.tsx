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
import { Play, Pause, RotateCcw } from "lucide-react";

// ---- Layout Constants --------------------------------------------------------

const SVG_W = 600;
const SVG_H = 340;

// Pipeline stages (x positions)
const ENTRY_X = 30;
const SPLIT_X = 130;
const SQLITE_PATH_Y = 100;
const GIT_PATH_Y = 240;

// SQLite path stages
const SQLITE_STAGES = [
  { x: 200, y: SQLITE_PATH_Y, label: "WAL Write", sublabel: "busy_timeout=60s" },
  { x: 310, y: SQLITE_PATH_Y, label: "FTS5 Index", sublabel: "full-text search" },
  { x: 420, y: SQLITE_PATH_Y, label: "Search V3", sublabel: "lexical+semantic" },
  { x: 530, y: SQLITE_PATH_Y, label: "Query Ready", sublabel: "sub-ms reads" },
];

// Git path stages
const GIT_STAGES = [
  { x: 200, y: GIT_PATH_Y, label: "WBQ Buffer", sublabel: "write-behind queue" },
  { x: 310, y: GIT_PATH_Y, label: "Coalescer", sublabel: "batch commits" },
  { x: 420, y: GIT_PATH_Y, label: "Git Commit", sublabel: "plumbing write" },
  { x: 530, y: GIT_PATH_Y, label: "Archive", sublabel: "Markdown + inbox" },
];

// ---- Types -------------------------------------------------------------------

interface Particle {
  id: number;
  path: "sqlite" | "git";
  stageIndex: number;
  progress: number; // 0-1 within current stage transition
  color: string;
  label: string;
}

interface PipelineState {
  particles: Particle[];
  sqliteWrites: number;
  gitCommits: number;
  gitBatchQueue: number;
  gitBatchTimer: number;
  searchQueries: number;
  auditReads: number;
  elapsed: number;
  nextId: number;
  spawnTimer: number;
}

// ---- Colors ------------------------------------------------------------------

const PARTICLE_COLORS = [
  "#60a5fa", "#a78bfa", "#f472b6", "#fb923c",
  "#34d399", "#fbbf24", "#22d3ee", "#e879f9",
];

function colorForId(id: number): string {
  return PARTICLE_COLORS[id % PARTICLE_COLORS.length];
}

// ---- Component ---------------------------------------------------------------

export default function DualWritePipelineViz() {
  const prefersReducedMotion = useVizReducedMotion();
  const inViewport = useVizInViewport();
  const [isRunning, setIsRunning] = useState(false);
  const [messageRate, setMessageRate] = useState(3);
  const [showReadPath, setShowReadPath] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const shouldAnimate = isRunning && inViewport;
  const shouldAnimateRef = useRef(shouldAnimate);

  const autoStart = useCallback(() => setIsRunning(true), []);
  useVizAutoStart(autoStart);

  const [state, setState] = useState<PipelineState>(() => initPipeline());

  const paramsRef = useRef({ messageRate });
  useEffect(() => {
    paramsRef.current = { messageRate };
  }, [messageRate]);

  useEffect(() => {
    shouldAnimateRef.current = shouldAnimate;
  }, [shouldAnimate]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setState(initPipeline());
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
        setState((prev) => pipelineTick(prev, delta, paramsRef.current));
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

  if (prefersReducedMotion) {
    return (
      <VizSurface aria-label="Dual persistence pipeline (reduced motion)">
        <VizHeader
          accent="violet"
          eyebrow="Dual Persistence"
          title="The Write Pipeline: SQLite + Git"
          subtitle="Every message is written to both SQLite (fast queries) and Git (audit trail) simultaneously."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-500/20 bg-black/40 p-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">SQLite Path</div>
            <div className="text-xs font-bold text-blue-300">Fast Indexing + Search</div>
            <p className="mt-2 text-xs text-slate-400">
              WAL-mode writes with busy_timeout → FTS5 full-text index → Search V3 hybrid routing.
              Sub-millisecond query latency for inbox, threads, and search.
            </p>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-black/40 p-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">Git Path</div>
            <div className="text-xs font-bold text-violet-300">Audit Trail + Archive</div>
            <p className="mt-2 text-xs text-slate-400">
              Write-behind queue → commit coalescer batching → date-partitioned Markdown files
              in per-project Git repos. Human-auditable, diffable, recoverable.
            </p>
          </div>
        </div>
      </VizSurface>
    );
  }

  return (
    <VizSurface aria-label="Dual persistence pipeline animation">
      <VizHeader
        accent="violet"
        eyebrow="Dual Persistence"
        title="The Write Pipeline: SQLite + Git"
        subtitle="Watch every message split into two parallel paths: fast indexing and permanent audit trail."
        controls={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRunning((r) => !r)}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:border-violet-500/30 focus-visible:ring-2 focus-visible:ring-violet-500/50 outline-none"
              aria-label={isRunning ? "Pause" : "Play"}
            >
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:border-violet-500/30 focus-visible:ring-2 focus-visible:ring-violet-500/50 outline-none"
              aria-label="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        }
      />

      {/* Metrics */}
      <div className="mb-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
        <VizMetricCard label="SQLite Writes" value={state.sqliteWrites} tone="blue" />
        <VizMetricCard label="Git Commits" value={state.gitCommits} tone="green" />
        <VizMetricCard label="WBQ Queued" value={state.gitBatchQueue} tone="amber" />
        <VizMetricCard
          label="Batch Ratio"
          value={
            state.gitCommits > 0
              ? `${((state.sqliteWrites) / state.gitCommits).toFixed(1)}x`
              : "---"
          }
          tone="neutral"
        />
      </div>

      {/* SVG Pipeline */}
      <div className="rounded-xl border border-white/10 bg-[#060A14] overflow-x-auto mb-4">
        <div className="min-w-[600px]">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ minHeight: 300 }}>
            {/* Background gradient hints */}
            <defs>
              <linearGradient id="sqliteGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="gitGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Path backgrounds */}
            <rect x={160} y={SQLITE_PATH_Y - 30} width={400} height={60} rx={8} fill="url(#sqliteGrad)" />
            <rect x={160} y={GIT_PATH_Y - 30} width={400} height={60} rx={8} fill="url(#gitGrad)" />

            {/* Path labels */}
            <text x={170} y={SQLITE_PATH_Y - 35} fill="#3B82F6" fontSize={8} fontWeight={900} opacity={0.5}>
              SQLITE PATH (FAST INDEX)
            </text>
            <text x={170} y={GIT_PATH_Y - 35} fill="#A855F7" fontSize={8} fontWeight={900} opacity={0.5}>
              GIT PATH (AUDIT TRAIL)
            </text>

            {/* Entry point */}
            <rect x={ENTRY_X - 15} y={SVG_H / 2 - 20} width={50} height={40} rx={8} fill="#1E293B" stroke="#475569" strokeWidth={1} />
            <text x={ENTRY_X + 10} y={SVG_H / 2 - 3} textAnchor="middle" fill="#94A3B8" fontSize={7} fontWeight={900}>
              send_
            </text>
            <text x={ENTRY_X + 10} y={SVG_H / 2 + 7} textAnchor="middle" fill="#94A3B8" fontSize={7} fontWeight={900}>
              message
            </text>

            {/* Split point */}
            <circle cx={SPLIT_X} cy={SVG_H / 2} r={12} fill="#1E293B" stroke="#64748B" strokeWidth={1.5} />
            <text x={SPLIT_X} y={SVG_H / 2 + 3} textAnchor="middle" fill="#94A3B8" fontSize={7} fontWeight={900}>
              SPLIT
            </text>

            {/* Entry to split line */}
            <line x1={ENTRY_X + 35} y1={SVG_H / 2} x2={SPLIT_X - 12} y2={SVG_H / 2} stroke="#475569" strokeWidth={1} />

            {/* Split to SQLite path */}
            <path
              d={`M ${SPLIT_X + 12} ${SVG_H / 2} Q ${SPLIT_X + 40} ${SVG_H / 2} ${SPLIT_X + 55} ${SQLITE_PATH_Y}`}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={1}
              opacity={0.3}
            />
            <line x1={SPLIT_X + 55} y1={SQLITE_PATH_Y} x2={SQLITE_STAGES[0].x - 30} y2={SQLITE_PATH_Y} stroke="#3B82F6" strokeWidth={1} opacity={0.3} />

            {/* Split to Git path */}
            <path
              d={`M ${SPLIT_X + 12} ${SVG_H / 2} Q ${SPLIT_X + 40} ${SVG_H / 2} ${SPLIT_X + 55} ${GIT_PATH_Y}`}
              fill="none"
              stroke="#A855F7"
              strokeWidth={1}
              opacity={0.3}
            />
            <line x1={SPLIT_X + 55} y1={GIT_PATH_Y} x2={GIT_STAGES[0].x - 30} y2={GIT_PATH_Y} stroke="#A855F7" strokeWidth={1} opacity={0.3} />

            {/* SQLite stage nodes */}
            {SQLITE_STAGES.map((stage, i) => (
              <g key={`sql-${i}`}>
                {i < SQLITE_STAGES.length - 1 && (
                  <line
                    x1={stage.x + 28}
                    y1={stage.y}
                    x2={SQLITE_STAGES[i + 1].x - 28}
                    y2={SQLITE_STAGES[i + 1].y}
                    stroke="#3B82F6"
                    strokeWidth={1}
                    opacity={0.2}
                  />
                )}
                <rect
                  x={stage.x - 28}
                  y={stage.y - 18}
                  width={56}
                  height={36}
                  rx={6}
                  fill="#0F172A"
                  stroke="#3B82F6"
                  strokeWidth={1}
                  opacity={0.6}
                />
                <text x={stage.x} y={stage.y - 3} textAnchor="middle" fill="#93C5FD" fontSize={7} fontWeight={900}>
                  {stage.label}
                </text>
                <text x={stage.x} y={stage.y + 9} textAnchor="middle" fill="#475569" fontSize={5} fontWeight={700}>
                  {stage.sublabel}
                </text>
              </g>
            ))}

            {/* Git stage nodes */}
            {GIT_STAGES.map((stage, i) => (
              <g key={`git-${i}`}>
                {i < GIT_STAGES.length - 1 && (
                  <line
                    x1={stage.x + 28}
                    y1={stage.y}
                    x2={GIT_STAGES[i + 1].x - 28}
                    y2={GIT_STAGES[i + 1].y}
                    stroke="#A855F7"
                    strokeWidth={1}
                    opacity={0.2}
                  />
                )}
                <rect
                  x={stage.x - 28}
                  y={stage.y - 18}
                  width={56}
                  height={36}
                  rx={6}
                  fill="#0F172A"
                  stroke="#A855F7"
                  strokeWidth={1}
                  opacity={0.6}
                />
                <text x={stage.x} y={stage.y - 3} textAnchor="middle" fill="#C4B5FD" fontSize={7} fontWeight={900}>
                  {stage.label}
                </text>
                <text x={stage.x} y={stage.y + 9} textAnchor="middle" fill="#475569" fontSize={5} fontWeight={700}>
                  {stage.sublabel}
                </text>
              </g>
            ))}

            {/* WBQ fill indicator on git path */}
            {state.gitBatchQueue > 0 && (
              <g>
                <rect
                  x={GIT_STAGES[0].x - 26}
                  y={GIT_STAGES[0].y + 18 - Math.min(state.gitBatchQueue * 4, 16)}
                  width={52}
                  height={Math.min(state.gitBatchQueue * 4, 16)}
                  rx={3}
                  fill="rgba(168,85,247,0.15)"
                />
                <text
                  x={GIT_STAGES[0].x}
                  y={GIT_STAGES[0].y + 28}
                  textAnchor="middle"
                  fill="#A855F7"
                  fontSize={6}
                  fontWeight={900}
                  opacity={0.6}
                >
                  {state.gitBatchQueue} queued
                </text>
              </g>
            )}

            {/* Read path indicators */}
            {showReadPath && (
              <>
                <text x={530} y={SQLITE_PATH_Y - 50} textAnchor="middle" fill="#22D3EE" fontSize={6} fontWeight={900} opacity={0.6}>
                  READ: fetch_inbox, search
                </text>
                <line x1={530} y1={SQLITE_PATH_Y - 45} x2={530} y2={SQLITE_PATH_Y - 20} stroke="#22D3EE" strokeWidth={1} opacity={0.3} strokeDasharray="3 2" />
                <text x={530} y={GIT_PATH_Y + 40} textAnchor="middle" fill="#F472B6" fontSize={6} fontWeight={900} opacity={0.6}>
                  AUDIT: git log, diff
                </text>
                <line x1={530} y1={GIT_PATH_Y + 20} x2={530} y2={GIT_PATH_Y + 35} stroke="#F472B6" strokeWidth={1} opacity={0.3} strokeDasharray="3 2" />
              </>
            )}

            {/* Animated particles */}
            {state.particles.map((p) => {
              const stages = p.path === "sqlite" ? SQLITE_STAGES : GIT_STAGES;
              const pathY = p.path === "sqlite" ? SQLITE_PATH_Y : GIT_PATH_Y;

              let px: number;
              let py: number;

              if (p.stageIndex < 0) {
                // Traveling from entry to split
                const t = p.progress;
                px = ENTRY_X + 35 + t * (SPLIT_X - ENTRY_X - 35);
                py = SVG_H / 2;
              } else if (p.stageIndex === 0 && p.progress < 0.3) {
                // Split to first stage
                const t = p.progress / 0.3;
                px = SPLIT_X + 55 + t * (stages[0].x - SPLIT_X - 55 - 28);
                py = SVG_H / 2 + t * (pathY - SVG_H / 2);
              } else if (p.stageIndex < stages.length) {
                // Between stages
                const fromX = p.stageIndex === 0 ? stages[0].x - 28 : stages[p.stageIndex - 1].x + 28;
                const toX = stages[p.stageIndex].x - 28;
                const adjustedProgress = p.stageIndex === 0 ? (p.progress - 0.3) / 0.7 : p.progress;
                px = fromX + adjustedProgress * (toX - fromX);
                py = pathY;
              } else {
                // Past last stage
                px = stages[stages.length - 1].x + 28;
                py = pathY;
              }

              const pathColor = p.path === "sqlite" ? "#3B82F6" : "#A855F7";

              return (
                <g key={`${p.path}-${p.id}`}>
                  {/* Glow */}
                  <circle cx={px} cy={py} r={8} fill={pathColor} opacity={0.1} />
                  {/* Core */}
                  <circle cx={px} cy={py} r={4} fill={p.color} opacity={0.9}>
                    <animate attributeName="r" values="3;5;3" dur="0.6s" repeatCount="indefinite" />
                  </circle>
                  {/* Label */}
                  <text x={px} y={py - 8} textAnchor="middle" fill={p.color} fontSize={5} fontWeight={900} opacity={0.6}>
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-xl border border-white/5 bg-black/20">
        <label className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-400 whitespace-nowrap">Msg/sec: {messageRate}</span>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={messageRate}
            onChange={(e) => setMessageRate(Number(e.target.value))}
            className="w-24 accent-violet-500 h-6"
          />
        </label>
        <VizControlButton
          tone={showReadPath ? "blue" : "neutral"}
          onClick={() => setShowReadPath((v) => !v)}
        >
          {showReadPath ? "Hide Read Paths" : "Show Read Paths"}
        </VizControlButton>
      </div>

      <VizLearningBlock
        accent="violet"
        title="Why Dual Persistence?"
        items={[
          "SQLite: Sub-ms query latency for inbox, threads, and hybrid search. WAL mode enables unlimited readers alongside writers.",
          "Git: Every message, agent profile, and reservation is a file in Git. Human-auditable, diffable, recoverable.",
          "Write-behind queue: Batches rapid-fire messages into fewer git commits (9.1x reduction). Prevents index.lock contention.",
          "Neither is authoritative alone: SQLite is the fast index, Git is the source of truth. Both stay in sync through the write pipeline.",
        ]}
      />
    </VizSurface>
  );
}

// ---- Simulation logic --------------------------------------------------------

function initPipeline(): PipelineState {
  return {
    particles: [],
    sqliteWrites: 0,
    gitCommits: 0,
    gitBatchQueue: 0,
    gitBatchTimer: 0,
    searchQueries: 0,
    auditReads: 0,
    elapsed: 0,
    nextId: 0,
    spawnTimer: 0,
  };
}

function pipelineTick(
  prev: PipelineState,
  deltaMs: number,
  params: { messageRate: number }
): PipelineState {
  const dt = deltaMs / 1000;
  let {
    sqliteWrites,
    gitCommits,
    gitBatchQueue,
    gitBatchTimer,
    nextId,
    spawnTimer,
  } = prev;

  const particles = prev.particles.map((p) => ({ ...p }));

  // Spawn new particles
  spawnTimer += deltaMs;
  const spawnInterval = 1000 / params.messageRate;
  while (spawnTimer >= spawnInterval) {
    spawnTimer -= spawnInterval;
    const color = colorForId(nextId);
    const msgLabel = `M${nextId + 1}`;
    // Spawn two particles: one for each path
    particles.push({
      id: nextId,
      path: "sqlite",
      stageIndex: -1, // pre-split
      progress: 0,
      color,
      label: msgLabel,
    });
    particles.push({
      id: nextId,
      path: "git",
      stageIndex: -1,
      progress: 0,
      color,
      label: msgLabel,
    });
    nextId++;
  }

  // Advance particles
  const sqliteSpeed = 1.2;
  const gitSpeed = 0.8;

  for (const p of particles) {
    const speed = p.path === "sqlite" ? sqliteSpeed : gitSpeed;
    p.progress += dt * speed;

    if (p.progress >= 1) {
      p.progress = 0;
      p.stageIndex++;

      const maxStages = p.path === "sqlite" ? SQLITE_STAGES.length : GIT_STAGES.length;

      // Track completions
      if (p.path === "sqlite" && p.stageIndex >= maxStages) {
        sqliteWrites++;
      }
      if (p.path === "git" && p.stageIndex === 1) {
        // Entered WBQ
        gitBatchQueue++;
      }
    }
  }

  // Git batch flush
  gitBatchTimer += deltaMs;
  if (gitBatchTimer >= 1500 && gitBatchQueue > 0) {
    gitBatchTimer = 0;
    gitCommits++;
    gitBatchQueue = 0;
  }

  // Remove particles that are past the end
  const sqliteMaxIdx = SQLITE_STAGES.length;
  const gitMaxIdx = GIT_STAGES.length;
  const activeParticles = particles.filter((p) => {
    const max = p.path === "sqlite" ? sqliteMaxIdx : gitMaxIdx;
    return p.stageIndex < max + 1;
  });

  return {
    particles: activeParticles.slice(-30), // Cap to prevent unbounded growth
    sqliteWrites,
    gitCommits,
    gitBatchQueue,
    gitBatchTimer,
    searchQueries: prev.searchQueries,
    auditReads: prev.auditReads,
    elapsed: prev.elapsed + deltaMs,
    nextId,
    spawnTimer,
  };
}
