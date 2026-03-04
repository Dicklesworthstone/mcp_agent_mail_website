"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */

const BLUE = "#3B82F6";
const BLUE_GLOW = "#60A5FA";
const ORANGE = "#F97316";
const BG = "#020a14";
const SURFACE = "#0A1628";

const RED = "#EF4444";
const RED_GLOW = "#F87171";
const GREEN = "#22C55E";
const GREEN_GLOW = "#4ADE80";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Phase = "running" | "cancelling" | "done";

interface Resource {
  name: string;
  status: "active" | "leaked" | "closing" | "closed";
}

/* ------------------------------------------------------------------ */
/*  Initial data                                                       */
/* ------------------------------------------------------------------ */

const RESOURCE_NAMES = ["DB Connection", "File Handle", "Network Socket"];

function makeResources(): Resource[] {
  return RESOURCE_NAMES.map((name) => ({ name, status: "active" }));
}

/* ------------------------------------------------------------------ */
/*  Resource Row                                                       */
/* ------------------------------------------------------------------ */

function ResourceRow({
  resource,
  reduced,
}: {
  resource: Resource;
  reduced: boolean;
}) {
  const isLeaked = resource.status === "leaked";
  const isClosed = resource.status === "closed";
  const isClosing = resource.status === "closing";

  let dotColor = `${BLUE}88`;
  let labelColor = `${BLUE_GLOW}99`;
  let statusLabel = "";

  if (isLeaked) {
    dotColor = RED;
    labelColor = RED_GLOW;
    statusLabel = "LEAKED";
  } else if (isClosed) {
    dotColor = GREEN;
    labelColor = GREEN_GLOW;
    statusLabel = "Closed";
  } else if (isClosing) {
    dotColor = ORANGE;
    labelColor = ORANGE;
    statusLabel = "Closing...";
  }

  return (
    <motion.div
      className="flex items-center justify-between rounded-md px-3 py-1.5"
      style={{ background: `${SURFACE}80` }}
      initial={false}
      animate={{
        borderColor: isLeaked ? `${RED}44` : isClosed ? `${GREEN}44` : "transparent",
      }}
      transition={{ duration: reduced ? 0 : 0.3 }}
    >
      <div className="flex items-center gap-2">
        <motion.span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor }}
          animate={{
            backgroundColor: dotColor,
            boxShadow: isLeaked
              ? `0 0 6px ${RED}80`
              : isClosed
                ? `0 0 6px ${GREEN}80`
                : "none",
          }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        />
        <span className="font-mono text-xs" style={{ color: labelColor }}>
          {resource.name}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {statusLabel && (
          <motion.span
            key={statusLabel}
            className="font-mono text-xs font-semibold"
            style={{ color: isLeaked ? RED_GLOW : isClosed ? GREEN_GLOW : ORANGE }}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            {isLeaked && "⚠ "}
            {statusLabel}
            {isClosed && " ✓"}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                       */
/* ------------------------------------------------------------------ */

function ProgressBar({
  progress,
  color,
  glowColor,
  reduced,
}: {
  progress: number;
  color: string;
  glowColor: string;
  reduced: boolean;
}) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full"
      style={{ background: `${SURFACE}` }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${glowColor}60` }}
        initial={false}
        animate={{ width: `${progress}%` }}
        transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */

function Panel({
  title,
  side,
  phase,
  resources,
  progress,
  statusText,
  taskVisible,
  reduced,
}: {
  title: string;
  side: "tokio" | "asupersync";
  phase: Phase;
  resources: Resource[];
  progress: number;
  statusText: string;
  taskVisible: boolean;
  reduced: boolean;
}) {
  const isTokio = side === "tokio";
  const accentGlow = isTokio ? RED_GLOW : BLUE_GLOW;
  const borderColor =
    phase === "done"
      ? isTokio
        ? `${RED}44`
        : `${GREEN}44`
      : phase === "cancelling"
        ? `${ORANGE}44`
        : `${BLUE}22`;

  const progressColor =
    phase === "cancelling"
      ? ORANGE
      : phase === "done"
        ? isTokio
          ? RED
          : GREEN
        : BLUE;

  const progressGlow =
    phase === "cancelling"
      ? ORANGE
      : phase === "done"
        ? isTokio
          ? RED_GLOW
          : GREEN_GLOW
        : BLUE_GLOW;

  return (
    <motion.div
      className="flex flex-1 flex-col gap-3 rounded-xl border p-4"
      style={{
        background: `${SURFACE}60`,
        borderColor,
        minWidth: 0,
      }}
      animate={{ borderColor }}
      transition={{ duration: reduced ? 0 : 0.4 }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <h3
          className="font-mono text-sm font-bold tracking-wide"
          style={{ color: accentGlow }}
        >
          {title}
        </h3>
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{
            backgroundColor:
              phase === "running"
                ? BLUE
                : phase === "cancelling"
                  ? ORANGE
                  : isTokio
                    ? RED
                    : GREEN,
            boxShadow:
              phase === "done"
                ? `0 0 6px ${isTokio ? RED : GREEN}80`
                : `0 0 6px ${phase === "cancelling" ? ORANGE : BLUE}80`,
          }}
        />
      </div>

      {/* Task label */}
      <AnimatePresence mode="wait">
        {taskVisible ? (
          <motion.div
            key="task"
            className="flex items-center gap-2 rounded-md px-3 py-2"
            style={{ background: `${BLUE}15` }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: isTokio ? 0.85 : 1,
              transition: { duration: reduced ? 0 : isTokio ? 0.15 : 0.3 },
            }}
          >
            <span className="font-mono text-xs" style={{ color: BLUE_GLOW }}>
              Task: HTTP Request
            </span>
          </motion.div>
        ) : phase === "cancelling" && !isTokio ? (
          <motion.div
            key="draining"
            className="flex items-center gap-2 rounded-md px-3 py-2"
            style={{ background: `${ORANGE}15` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            <span className="font-mono text-xs" style={{ color: ORANGE }}>
              Task: Draining...
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Progress */}
      <ProgressBar
        progress={progress}
        color={progressColor}
        glowColor={progressGlow}
        reduced={reduced}
      />

      {/* Resources */}
      <div className="flex flex-col gap-1.5">
        {resources.map((r) => (
          <ResourceRow key={r.name} resource={r} reduced={reduced} />
        ))}
      </div>

      {/* Status message */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.p
            className="mt-1 text-center font-mono text-xs font-semibold"
            style={{
              color: isTokio ? RED_GLOW : GREEN_GLOW,
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
          >
            {statusText}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function TokioComparisonViz() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  const [phase, setPhase] = useState<Phase>("running");
  const [tokioResources, setTokioResources] = useState<Resource[]>(makeResources);
  const [asyncResources, setAsyncResources] = useState<Resource[]>(makeResources);
  const [tokioProgress, setTokioProgress] = useState(60);
  const [asyncProgress, setAsyncProgress] = useState(60);
  const [tokioTaskVisible, setTokioTaskVisible] = useState(true);
  const [asyncTaskVisible, setAsyncTaskVisible] = useState(true);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dur = useCallback((ms: number) => (reduced ? 0 : ms), [reduced]);

  /* clear all pending timers */
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      const id = setTimeout(fn, dur(ms));
      timersRef.current.push(id);
    },
    [dur],
  );

  /* ---- Cancel handler ---- */
  const handleCancel = useCallback(() => {
    if (phase !== "running") return;
    setPhase("cancelling");

    // Start "running" progress tick
    setTokioProgress(65);
    setAsyncProgress(65);

    /* === Tokio side: instant drop === */
    schedule(() => {
      setTokioTaskVisible(false);
      setTokioProgress(0);
    }, 150);

    // Leak resources one by one (fast)
    RESOURCE_NAMES.forEach((name, i) => {
      schedule(() => {
        setTokioResources((prev) =>
          prev.map((r) => (r.name === name ? { ...r, status: "leaked" } : r)),
        );
      }, 300 + i * 250);
    });

    /* === Asupersync side: graceful drain === */
    // Enter draining state
    schedule(() => {
      setAsyncTaskVisible(false);
      setAsyncProgress(80);
    }, 400);

    schedule(() => setAsyncProgress(90), 800);

    // Close resources one by one
    RESOURCE_NAMES.forEach((name, i) => {
      // Mark closing
      schedule(() => {
        setAsyncResources((prev) =>
          prev.map((r) => (r.name === name ? { ...r, status: "closing" } : r)),
        );
      }, 1000 + i * 500);

      // Mark closed
      schedule(() => {
        setAsyncResources((prev) =>
          prev.map((r) => (r.name === name ? { ...r, status: "closed" } : r)),
        );
      }, 1200 + i * 500);
    });

    // Final progress
    schedule(() => setAsyncProgress(100), 2200);

    // Done
    schedule(() => {
      setPhase("done");
    }, 2600);
  }, [phase, schedule]);

  /* ---- Reset ---- */
  const handleReset = useCallback(() => {
    clearTimers();
    setPhase("running");
    setTokioResources(makeResources());
    setAsyncResources(makeResources());
    setTokioProgress(60);
    setAsyncProgress(60);
    setTokioTaskVisible(true);
    setAsyncTaskVisible(true);
  }, [clearTimers]);

  /* Cleanup on unmount */
  useEffect(() => () => clearTimers(), [clearTimers]);

  const tokioStatus = "Task dropped. Resources leaked.";
  const asyncStatus = "Task cancelled cleanly. All resources released.";

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ background: BG }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: `${BLUE}18` }}>
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor:
                phase === "running"
                  ? BLUE
                  : phase === "cancelling"
                    ? ORANGE
                    : GREEN,
              boxShadow: `0 0 8px ${
                phase === "running"
                  ? BLUE
                  : phase === "cancelling"
                    ? ORANGE
                    : GREEN
              }80`,
            }}
          />
          <span className="font-mono text-sm" style={{ color: BLUE_GLOW }}>
            Cancel Behavior Comparison
          </span>
        </div>

        {phase === "done" && (
          <motion.button
            onClick={handleReset}
            className="rounded-md border px-3 py-1 font-mono text-xs transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            style={{ borderColor: `${BLUE}44`, color: BLUE_GLOW }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            Reset
          </motion.button>
        )}
      </div>

      {/* Cancel button */}
      <div className="flex justify-center px-4 pt-4 pb-2">
        <motion.button
          onClick={handleCancel}
          disabled={phase === "cancelling" || phase === "done"}
          className="rounded-lg border px-6 py-2 font-mono text-sm font-bold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          style={{
            borderColor: phase === "running" ? `${RED}88` : `${SURFACE}88`,
            color: phase === "running" ? RED_GLOW : `${BLUE_GLOW}44`,
            background: phase === "running" ? `${RED}12` : "transparent",
          }}
          whileHover={
            phase === "running"
              ? { scale: 1.03, background: `${RED}22` }
              : {}
          }
          whileTap={
            phase === "running" ? { scale: 0.97 } : {}
          }
        >
          Cancel Now
        </motion.button>
      </div>

      {/* Side-by-side panels */}
      <div className="flex flex-col md:flex-row gap-4 p-4 pt-2">
        <Panel
          title="Tokio"
          side="tokio"
          phase={phase}
          resources={tokioResources}
          progress={tokioProgress}
          statusText={tokioStatus}
          taskVisible={tokioTaskVisible}
          reduced={reduced}
        />
        <Panel
          title="Asupersync"
          side="asupersync"
          phase={phase}
          resources={asyncResources}
          progress={asyncProgress}
          statusText={asyncStatus}
          taskVisible={asyncTaskVisible}
          reduced={reduced}
        />
      </div>

      {/* Hint text */}
      <AnimatePresence>
        {(phase === "running") && (
          <motion.p
            className="pb-4 text-center font-mono text-xs"
            style={{ color: `${BLUE_GLOW}44` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            Press &quot;Cancel Now&quot; to compare cancel behavior
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
