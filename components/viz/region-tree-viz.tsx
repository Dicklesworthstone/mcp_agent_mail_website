"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type RegionStatus = "running" | "cancel-requested" | "draining" | "quiescent";

interface Region {
  id: string;
  label: string;
  parentId: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  status: RegionStatus;
}

interface Task {
  id: string;
  regionId: string;
  cx: number;
  cy: number;
  alive: boolean;
}

/* ------------------------------------------------------------------ */
/*  Palette                                                           */
/* ------------------------------------------------------------------ */

const BLUE = "#3B82F6";
const BLUE_GLOW = "#60A5FA";
const ORANGE = "#F97316";
const BG = "#020a14";
const SURFACE = "#0A1628";

/* ------------------------------------------------------------------ */
/*  Initial data                                                      */
/* ------------------------------------------------------------------ */

function makeInitialRegions(): Region[] {
  return [
    { id: "root", label: "Root Region", parentId: null, x: 20, y: 20, w: 760, h: 400, status: "running" },
    { id: "http", label: "HTTP Handler", parentId: "root", x: 40, y: 60, w: 350, h: 340, status: "running" },
    { id: "db", label: "Database Pool", parentId: "root", x: 410, y: 60, w: 350, h: 340, status: "running" },
    { id: "req-a", label: "Request A", parentId: "http", x: 60, y: 110, w: 150, h: 270, status: "running" },
    { id: "req-b", label: "Request B", parentId: "http", x: 220, y: 110, w: 150, h: 270, status: "running" },
    { id: "conn", label: "Connection", parentId: "db", x: 430, y: 110, w: 310, h: 270, status: "running" },
  ];
}

function makeInitialTasks(): Task[] {
  return [
    { id: "t1", regionId: "req-a", cx: 110, cy: 200, alive: true },
    { id: "t2", regionId: "req-a", cx: 150, cy: 280, alive: true },
    { id: "t3", regionId: "req-b", cx: 270, cy: 220, alive: true },
    { id: "t4", regionId: "req-b", cx: 320, cy: 310, alive: true },
    { id: "t5", regionId: "conn", cx: 530, cy: 210, alive: true },
    { id: "t6", regionId: "conn", cx: 620, cy: 300, alive: true },
  ];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getDescendantIds(regionId: string, regions: Region[]): string[] {
  const children = regions.filter((r) => r.parentId === regionId);
  const ids: string[] = [];
  for (const c of children) {
    ids.push(c.id);
    ids.push(...getDescendantIds(c.id, regions));
  }
  return ids;
}

function statusFill(status: RegionStatus): string {
  if (status === "running") return `${BLUE}18`;
  if (status === "cancel-requested") return `${ORANGE}30`;
  if (status === "draining") return `${ORANGE}20`;
  return `${SURFACE}40`;
}

function statusStroke(status: RegionStatus): string {
  if (status === "running") return `${BLUE}66`;
  if (status === "cancel-requested") return `${ORANGE}AA`;
  if (status === "draining") return `${ORANGE}66`;
  return `${SURFACE}88`;
}

/* ------------------------------------------------------------------ */
/*  Budget bar: countdown visual                                      */
/* ------------------------------------------------------------------ */

function BudgetBar({
  active,
  durationMs,
  reduced,
}: {
  active: boolean;
  durationMs: number;
  reduced: boolean;
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        >
          <rect x={20} y={438} width={760} height={8} rx={4} fill={`${SURFACE}80`} />
          <motion.rect
            x={20}
            y={438}
            height={8}
            rx={4}
            fill={ORANGE}
            initial={{ width: 760 }}
            animate={{ width: 0 }}
            transition={{ duration: reduced ? 0.01 : durationMs / 1000, ease: "linear" }}
          />
          <text x={400} y={464} textAnchor="middle" fill={ORANGE} fontSize={11} fontFamily="monospace">
            cancel budget remaining
          </text>
        </motion.g>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function RegionTreeViz() {
  const prefersReducedMotion = useVizReducedMotion();
  const reduced = !!prefersReducedMotion;

  const [regions, setRegions] = useState<Region[]>(makeInitialRegions);
  const [tasks, setTasks] = useState<Task[]>(makeInitialTasks);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [globalStatus, setGlobalStatus] = useState<"Running" | "Cancelling..." | "Quiescent">("Running");
  const [budgetActive, setBudgetActive] = useState(false);

  const cancellingRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      const id = setTimeout(fn, reduced ? 0 : ms);
      timersRef.current.push(id);
    },
    [reduced],
  );

  /* ---- Cancel cascade ---- */
  const handleCancel = useCallback(
    (regionId: string) => {
      if (cancellingRef.current) return;
      cancellingRef.current = true;
      setGlobalStatus("Cancelling...");
      setBudgetActive(true);

      const affectedIds = [regionId, ...getDescendantIds(regionId, makeInitialRegions())];

      // Phase 1: mark cancel-requested with stagger
      affectedIds.forEach((id, i) => {
        schedule(() => {
          setRegions((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "cancel-requested" } : r)),
          );
        }, i * 180);
      });

      // Phase 2: drain tasks
      const drainStart = reduced ? 0 : affectedIds.length * 180 + 200;
      const affectedSet = new Set(affectedIds);

      schedule(() => {
        setRegions((prev) =>
          prev.map((r) => (affectedSet.has(r.id) ? { ...r, status: "draining" } : r)),
        );
      }, drainStart);

      // Kill tasks one by one
      const tasksInScope = makeInitialTasks().filter((t) => affectedSet.has(t.regionId));
      tasksInScope.forEach((t, i) => {
        schedule(() => {
          setTasks((prev) => prev.map((pt) => (pt.id === t.id ? { ...pt, alive: false } : pt)));
        }, drainStart + (reduced ? 0 : i * 250 + 100));
      });

      // Phase 3: quiescent
      const quiescentTime = drainStart + (reduced ? 0 : tasksInScope.length * 250 + 600);
      schedule(() => {
        setRegions((prev) =>
          prev.map((r) => (affectedSet.has(r.id) ? { ...r, status: "quiescent" } : r)),
        );
        setGlobalStatus("Quiescent");
        setBudgetActive(false);
        cancellingRef.current = false;
      }, quiescentTime);
    },
    [schedule, reduced],
  );

  /* ---- Reset ---- */
  const handleReset = useCallback(() => {
    clearTimers();
    cancellingRef.current = false;
    setRegions(makeInitialRegions());
    setTasks(makeInitialTasks());
    setGlobalStatus("Running");
    setBudgetActive(false);
  }, [clearTimers]);

  /* ---- Cleanup timers on unmount ---- */
  useEffect(() => () => clearTimers(), [clearTimers]);

  /* ---- Budget bar total duration ---- */
  const budgetDuration = reduced ? 10 : 3200;

  return (
    <div className="relative w-full" style={{ background: BG }}>
      {/* Header controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor:
                globalStatus === "Running" ? BLUE : globalStatus === "Cancelling..." ? ORANGE : "#6B7280",
              boxShadow:
                globalStatus === "Running"
                  ? `0 0 8px ${BLUE}80`
                  : globalStatus === "Cancelling..."
                    ? `0 0 8px ${ORANGE}80`
                    : "none",
            }}
          />
          <span className="font-mono text-sm" style={{ color: BLUE_GLOW }}>
            {globalStatus}
          </span>
        </div>
        <VizControlButton
          onClick={handleReset}
          tone="neutral"
          className="rounded-md px-3 py-1 font-mono text-xs normal-case tracking-normal hover:bg-white/5"
          style={{ color: BLUE_GLOW }}
        >
          Reset
        </VizControlButton>
      </div>

      {/* SVG canvas */}
      <svg
        viewBox="0 0 800 480"
        className="w-full"
        style={{ maxHeight: 520 }}
        role="img"
        aria-label="Region tree visualization showing nested structured concurrency regions with tasks"
      >
        <defs>
          <filter id="region-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Regions (render in order so parents are behind children) */}
        {regions.map((region) => {
          const isHovered = hoveredRegion === region.id;
          const isQuiescent = region.status === "quiescent";

          return (
            <motion.g
              key={region.id}
              initial={false}
              animate={{
                opacity: isQuiescent ? 0.25 : 1,
              }}
              transition={{ duration: reduced ? 0 : 0.5 }}
              style={{ cursor: region.status === "running" ? "pointer" : "default" }}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => {
                if (region.status === "running") handleCancel(region.id);
              }}
            >
              {/* Glass border + fill */}
              <motion.rect
                x={region.x}
                y={region.y}
                width={region.w}
                height={region.h}
                rx={16}
                fill={statusFill(region.status)}
                stroke={statusStroke(region.status)}
                strokeWidth={isHovered && region.status === "running" ? 2 : 1}
                filter={isHovered && region.status === "running" ? "url(#region-glow)" : undefined}
                animate={{
                  fill: statusFill(region.status),
                  stroke: statusStroke(region.status),
                }}
                transition={{ duration: reduced ? 0 : 0.4 }}
              />

              {/* Label */}
              <text
                x={region.x + 14}
                y={region.y + 22}
                fill={
                  region.status === "cancel-requested" || region.status === "draining"
                    ? ORANGE
                    : BLUE_GLOW
                }
                fontSize={12}
                fontFamily="monospace"
                fontWeight={500}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {region.label}
              </text>
            </motion.g>
          );
        })}

        {/* Tasks */}
        <AnimatePresence>
          {tasks.map(
            (task) =>
              task.alive && (
                <motion.circle
                  key={task.id}
                  cx={task.cx}
                  cy={task.cy}
                  r={8}
                  fill={BLUE}
                  stroke={BLUE_GLOW}
                  strokeWidth={1.5}
                  style={{ pointerEvents: "none" }}
                  initial={{ scale: 1, opacity: 0.9 }}
                  animate={{
                    scale: [1, 1.12, 1],
                    opacity: [0.85, 1, 0.85],
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    transition: { duration: reduced ? 0 : 0.35, ease: "easeIn" },
                  }}
                  transition={{
                    duration: reduced ? 0 : 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ),
          )}
        </AnimatePresence>

        {/* Budget countdown bar */}
        <BudgetBar active={budgetActive} durationMs={budgetDuration} reduced={reduced} />

        {/* Hint text */}
        {globalStatus === "Running" && (
          <text
            x={400}
            y={464}
            textAnchor="middle"
            fill={`${BLUE_GLOW}66`}
            fontSize={11}
            fontFamily="monospace"
          >
            click a region to trigger cancel cascade
          </text>
        )}
      </svg>
    </div>
  );
}
