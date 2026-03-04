"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

interface Oracle {
  name: string;
  short: string;
  status: "idle" | "checking" | "pass" | "fail";
}

const ORACLES_INIT: Omit<Oracle, "status">[] = [
  { name: "TaskLeak", short: "Tasks escaping scope" },
  { name: "ObligationLeak", short: "Dropped Permits/Leases" },
  { name: "CancelProtocol", short: "3-phase compliance" },
  { name: "BudgetOverrun", short: "Exceeded drain time" },
  { name: "RegionNesting", short: "Tree invariants" },
  { name: "SchedulerFairness", short: "Lane priority" },
  { name: "QuiescenceCheck", short: "Region silence" },
  { name: "FinalizerOrder", short: "LIFO execution" },
  { name: "CapabilityEscalation", short: "Permission bounds" },
  { name: "SporkInvariant", short: "Fork consistency" },
  { name: "DeadlockFreedom", short: "Wait-graph cycles" },
  { name: "ProgressGuarantee", short: "Martingale cert" },
  { name: "SeedDeterminism", short: "Replay fidelity" },
  { name: "MemoryOrdering", short: "Acquire/Release" },
  { name: "FuelExhaustion", short: "Cancel termination" },
  { name: "SupervisorPolicy", short: "Restart bounds" },
  { name: "EffectAtomicity", short: "Two-phase commit" },
];

// Simulate a test run: most oracles pass, some might fail
function simulateRun(): Oracle[] {
  // Pick 1-2 random indices to fail
  const failCount = Math.random() > 0.5 ? 2 : 1;
  const failIndices = new Set<number>();
  while (failIndices.size < failCount) {
    failIndices.add(Math.floor(Math.random() * ORACLES_INIT.length));
  }

  return ORACLES_INIT.map((o, i) => ({
    ...o,
    status: failIndices.has(i) ? "fail" as const : "pass" as const,
  }));
}

const VIOLATION_MESSAGES: Record<string, string> = {
  TaskLeak: "task 'worker-3' escaped region 'server' after cancellation",
  ObligationLeak: "Permit<TcpStream> dropped without consumption at conn_handler:42",
  CancelProtocol: "task 'processor' skipped Drain phase, jumped directly to Finalize",
  BudgetOverrun: "task 'db-sync' exceeded 5s drain budget by 1.2s",
  RegionNesting: "child region 'pool' outlived parent region 'server'",
  SchedulerFairness: "Cancel Lane starved for 3 consecutive scheduler ticks",
  QuiescenceCheck: "region 'workers' reported quiescent with 2 tasks still pending",
  FinalizerOrder: "finalizer at scope:28 ran before finalizer at scope:15 (LIFO violated)",
  CapabilityEscalation: "task with FiberCap attempted IoCap::tcp_connect",
  SporkInvariant: "forked region 'child-4' inherited capabilities not in parent set",
  DeadlockFreedom: "cycle detected: task-A → task-B → task-C → task-A",
  ProgressGuarantee: "martingale certificate decreased by 0 for 50 consecutive steps",
  SeedDeterminism: "seed 42 produced different schedule on replay (tick 1847 diverged)",
  MemoryOrdering: "store at epoch 5 visible before acquire at epoch 4",
  FuelExhaustion: "cancel fuel underflow: propagation attempted with fuel=0",
  SupervisorPolicy: "supervisor 'main' exceeded max-restarts (5) within 10s window",
  EffectAtomicity: "Effect::credit committed without paired Effect::debit commit",
};

export default function OracleDashboardViz() {
  const prefersReduced = useReducedMotion();
  const [oracles, setOracles] = useState<Oracle[]>(
    ORACLES_INIT.map((o) => ({ ...o, status: "idle" }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [violation, setViolation] = useState<{ name: string; message: string } | null>(null);
  const [passCount, setPassCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setOracles(ORACLES_INIT.map((o) => ({ ...o, status: "idle" })));
    setIsRunning(false);
    setViolation(null);
    setPassCount(0);
    setFailCount(0);
  }, [clearTimers]);

  const runTest = useCallback(() => {
    if (isRunning) return;
    reset();
    setIsRunning(true);

    const finalResults = simulateRun();

    // Animate oracles checking one by one
    ORACLES_INIT.forEach((_, i) => {
      const checkDelay = 80 + i * 100;
      const resultDelay = checkDelay + 200;

      const t1 = setTimeout(() => {
        setOracles((prev) => prev.map((o, j) => (j === i ? { ...o, status: "checking" } : o)));
      }, checkDelay);

      const t2 = setTimeout(() => {
        setOracles((prev) => prev.map((o, j) => (j === i ? { ...o, status: finalResults[i].status } : o)));
        if (finalResults[i].status === "pass") setPassCount((c) => c + 1);
        if (finalResults[i].status === "fail") {
          setFailCount((c) => c + 1);
          setViolation({
            name: finalResults[i].name,
            message: VIOLATION_MESSAGES[finalResults[i].name] || "Unknown violation",
          });
        }
      }, resultDelay);

      timersRef.current.push(t1, t2);
    });

    const tDone = setTimeout(() => setIsRunning(false), 80 + ORACLES_INIT.length * 100 + 400);
    timersRef.current.push(tDone);
  }, [isRunning, reset]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const dur = prefersReduced ? 0 : 0.2;

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Lab Oracle Dashboard</h3>
          <p className="text-sm text-purple-400">17 built-in correctness monitors</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-green-400">{passCount} pass</span>
          <span className="text-slate-600">/</span>
          <span className="text-red-400">{failCount} fail</span>
        </div>
      </div>

      {/* Oracle Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-6">
        {oracles.map((oracle) => {
          const statusColor = (() => {
            switch (oracle.status) {
              case "idle": return "#334155";
              case "checking": return "#EAB308";
              case "pass": return "#22C55E";
              case "fail": return "#EF4444";
            }
          })();

          return (
            <motion.div
              key={oracle.name}
              className="rounded-lg border p-2.5 text-center cursor-default"
              style={{
                borderColor: `${statusColor}44`,
                background: oracle.status !== "idle" ? `${statusColor}11` : "transparent",
              }}
              animate={{ scale: oracle.status === "checking" ? 1.05 : 1 }}
              transition={{ duration: dur }}
              title={oracle.short}
            >
              <motion.div
                className="mx-auto mb-1.5 h-3 w-3 rounded-full"
                style={{ backgroundColor: statusColor }}
                animate={{
                  boxShadow: oracle.status === "checking"
                    ? `0 0 12px ${statusColor}`
                    : oracle.status === "fail"
                      ? `0 0 8px ${statusColor}88`
                      : `0 0 4px ${statusColor}44`,
                }}
                transition={{ duration: dur }}
              />
              <div className="text-[9px] font-bold text-slate-400 leading-tight truncate">
                {oracle.name}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Violation Panel */}
      <AnimatePresence>
        {violation && (
          <motion.div
            className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 mb-6"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                Violation Detected
              </span>
            </div>
            <p className="text-sm font-mono text-red-300">
              <span className="text-red-500 font-bold">{violation.name}:</span>{" "}
              {violation.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={runTest}
          disabled={isRunning}
          className="rounded-lg px-6 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "#8B5CF6" }}
        >
          Run Test
        </button>
        <button
          onClick={reset}
          className="rounded-lg border px-6 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          style={{ borderColor: "#1e293b" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
