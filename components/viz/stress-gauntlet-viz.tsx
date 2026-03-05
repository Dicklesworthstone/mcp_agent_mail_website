"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";

// ---- Test definitions --------------------------------------------------------

interface TestDef {
  id: number;
  name: string;
  description: string;
  scenario: string;
  metric: string;
  threshold: string;
}

const GAUNTLET_TESTS: TestDef[] = [
  { id: 1, name: "Pool Warmup", description: "50 threads, pool=64, concurrent PRAGMA", scenario: "50 threads hammer pool", metric: "SQLITE_BUSY errors", threshold: "0 errors" },
  { id: 2, name: "Concurrent Project", description: "8 threads ensure same project key", scenario: "8 threads, same key", metric: "Idempotent ID", threshold: "All same ID" },
  { id: 3, name: "Concurrent Agent", description: "8 threads register same agent name", scenario: "8 threads, same name", metric: "Agent ID match", threshold: "All same ID" },
  { id: 4, name: "Message Pipeline", description: "30 agents send 150 messages", scenario: "30-agent pipeline", metric: "0 errors, p99", threshold: "p99 < 7s" },
  { id: 5, name: "File Reservations", description: "2 agents claim same path pattern", scenario: "Concurrent claims", metric: "Conflict detected", threshold: "Both recorded" },
  { id: 6, name: "WBQ Saturation", description: "2000 writes enqueued to coalescer", scenario: "2000 rapid writes", metric: "0 fallbacks", threshold: "All enqueued" },
  { id: 7, name: "Pool Exhaustion", description: "60 threads on 15-connection pool", scenario: "4x oversubscription", metric: "0 timeouts", threshold: "All complete" },
  { id: 8, name: "Sustained Load", description: "30 seconds continuous workload", scenario: "30s @ ~50 RPS", metric: "1494 ops, p99", threshold: "p99 < 2.6s" },
  { id: 9, name: "Thundering Herd", description: "50 threads on 1 agent identity", scenario: "50-thread stampede", metric: "All succeed", threshold: "Same agent ID" },
  { id: 10, name: "Inbox Storm", description: "150 sends + 300 reads concurrently", scenario: "Mixed read/write", metric: "0 errors", threshold: "All complete" },
];

// ---- Types -------------------------------------------------------------------

type TestStatus = "idle" | "checking" | "pass" | "fail";

interface TestState {
  status: TestStatus;
  progress: number; // 0-1 during checking
  metric: string;
  duration: number; // ms for this test
}

interface GauntletState {
  tests: TestState[];
  currentTest: number; // -1 = not started, 0-9 = running, 10 = done
  elapsed: number;
  passCount: number;
  failCount: number;
  phase: "idle" | "running" | "complete";
}

// ---- Component ---------------------------------------------------------------

export default function StressGauntletViz() {
  const prefersReducedMotion = useVizReducedMotion();
  const [state, setState] = useState<GauntletState>(() => initGauntlet());
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runTokenRef = useRef(0);

  const clearTimers = useCallback(() => {
    runTokenRef.current += 1;
    for (const t of timerRef.current) clearTimeout(t);
    timerRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setState(initGauntlet());
  }, [clearTimers]);

  const runGauntlet = useCallback(() => {
    clearTimers();
    setState(initGauntlet());
    const runToken = runTokenRef.current;

    // Stagger test execution
    GAUNTLET_TESTS.forEach((test, i) => {
      const startDelay = i * 600;
      const checkDuration = 300 + Math.random() * 400;

      // Start checking
      timerRef.current.push(setTimeout(() => {
        if (runTokenRef.current !== runToken) return;

        setState((prev) => {
          const tests = [...prev.tests];
          tests[i] = { ...tests[i], status: "checking", progress: 0 };
          return { ...prev, tests, currentTest: i, phase: "running" };
        });

        // Animate progress during check
        const progressStart = performance.now();
        const animateProgress = () => {
          if (runTokenRef.current !== runToken) return;

          const elapsed = performance.now() - progressStart;
          const progress = Math.min(elapsed / checkDuration, 1);
          setState((prev) => {
            const tests = [...prev.tests];
            if (tests[i].status === "checking") {
              tests[i] = { ...tests[i], progress };
            }
            return { ...prev, tests };
          });
          if (progress < 1) {
            requestAnimationFrame(animateProgress);
          }
        };
        requestAnimationFrame(animateProgress);
      }, startDelay));

      // Complete test
      timerRef.current.push(setTimeout(() => {
        if (runTokenRef.current !== runToken) return;

        // All tests pass in the demo (mirrors real gauntlet results)
        const passed = true;
        const metricText = getMetricResult(test.id);
        const duration = checkDuration;

        setState((prev) => {
          const tests = [...prev.tests];
          tests[i] = {
            status: passed ? "pass" : "fail",
            progress: 1,
            metric: metricText,
            duration: Math.round(duration),
          };
          const passCount = tests.filter((t) => t.status === "pass").length;
          const failCount = tests.filter((t) => t.status === "fail").length;
          const isComplete = i === GAUNTLET_TESTS.length - 1;

          return {
            ...prev,
            tests,
            passCount,
            failCount,
            currentTest: isComplete ? GAUNTLET_TESTS.length : i,
            phase: isComplete ? "complete" : "running",
          };
        });
      }, startDelay + checkDuration));
    });
  }, [clearTimers]);

  const totalTests = GAUNTLET_TESTS.length;
  const completedTests = state.passCount + state.failCount;

  if (prefersReducedMotion) {
    return (
      <VizSurface aria-label="Stress gauntlet test suite (reduced motion)">
        <VizHeader
          accent="amber"
          eyebrow="Battle Tested"
          title="10-Test Stress Gauntlet"
          subtitle="Every commit runs 10 concurrent stress tests that validate the system under extreme multi-agent load."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GAUNTLET_TESTS.map((test) => (
            <div key={test.id} className="rounded-lg border border-green-500/20 bg-black/40 p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-white">{test.name}</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{test.description}</p>
              <div className="mt-1 text-[9px] font-bold text-green-400">{test.threshold}</div>
            </div>
          ))}
        </div>
      </VizSurface>
    );
  }

  return (
    <VizSurface aria-label="Stress gauntlet test runner">
      <VizHeader
        accent="amber"
        eyebrow="Battle Tested"
        title="10-Test Stress Gauntlet"
        subtitle="Run the full stress test suite and watch each test execute and report results."
        controls={
          <div className="flex items-center gap-2">
            <VizControlButton
              tone={state.phase === "idle" ? "green" : state.phase === "complete" ? "amber" : "red"}
              onClick={state.phase === "idle" ? runGauntlet : reset}
            >
              {state.phase === "idle" ? "Run Gauntlet" : state.phase === "complete" ? "Reset" : "Stop"}
            </VizControlButton>
          </div>
        }
      />

      {/* Metrics row */}
      <div className="mb-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
        <VizMetricCard label="Tests" value={`${completedTests}/${totalTests}`} tone="neutral" />
        <VizMetricCard label="Passed" value={state.passCount} tone="green" />
        <VizMetricCard label="Failed" value={state.failCount} tone="red" />
        <VizMetricCard
          label="Status"
          value={state.phase === "complete" ? (state.failCount === 0 ? "ALL PASS" : "FAILED") : state.phase === "running" ? "RUNNING" : "READY"}
          tone={state.phase === "complete" ? (state.failCount === 0 ? "green" : "red") : "neutral"}
        />
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${(completedTests / totalTests) * 100}%`,
            backgroundColor: state.failCount > 0 ? "#EF4444" : "#22C55E",
          }}
        />
      </div>

      {/* Test grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {GAUNTLET_TESTS.map((test, i) => {
          const ts = state.tests[i];
          const borderColor = ts.status === "pass"
            ? "border-green-500/30"
            : ts.status === "fail"
              ? "border-red-500/30"
              : ts.status === "checking"
                ? "border-amber-500/30"
                : "border-white/5";

          const bgColor = ts.status === "pass"
            ? "bg-green-500/5"
            : ts.status === "fail"
              ? "bg-red-500/5"
              : ts.status === "checking"
                ? "bg-amber-500/5"
                : "bg-black/40";

          return (
            <div key={test.id} className={`relative rounded-xl border ${borderColor} ${bgColor} p-3 overflow-hidden transition-colors duration-300`}>
              {/* Progress overlay for checking state */}
              {ts.status === "checking" && (
                <div
                  className="absolute inset-0 bg-amber-500/5 transition-transform"
                  style={{ transformOrigin: "left", transform: `scaleX(${ts.progress})` }}
                />
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={ts.status} />
                    <span className="text-xs font-bold text-white">
                      <span className="text-slate-500 mr-1">#{test.id}</span>
                      {test.name}
                    </span>
                  </div>
                  {ts.duration > 0 && (
                    <span className="text-[9px] font-bold text-slate-500 tabular-nums">{ts.duration}ms</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-[10px] text-slate-400 mb-1">{test.description}</p>

                {/* Scenario + metric */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500">{test.scenario}</span>
                  {ts.metric ? (
                    <span className={`text-[9px] font-black ${ts.status === "pass" ? "text-green-400" : ts.status === "fail" ? "text-red-400" : "text-slate-500"}`}>
                      {ts.metric}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-600">{test.threshold}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion banner */}
      {state.phase === "complete" && state.failCount === 0 && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/5 p-4 text-center">
          <div className="text-lg font-black text-green-400 mb-1">ALL 10 TESTS PASSED</div>
          <div className="text-xs text-green-300/60">
            30-agent pipeline, 50-thread herd, 60-thread pool exhaustion, 30s sustained load. Zero errors across the board.
          </div>
        </div>
      )}

      <VizLearningBlock
        accent="amber"
        title="What The Gauntlet Proves"
        items={[
          "Pool warmup: 50 threads on a 64-connection pool, zero SQLITE_BUSY errors. WAL mode + busy_timeout eliminates contention.",
          "Thundering herd: 50 threads registering the same agent identity all get the same ID. Idempotent upserts are race-free.",
          "WBQ saturation: 2000 rapid-fire writes enqueued with zero fallbacks. Spill buffers handle overflow gracefully.",
          "Sustained load: 30 seconds at ~50 RPS (1494 ops), p99 latency under 2.6 seconds. No degradation over time.",
        ]}
      />
    </VizSurface>
  );
}

// ---- Sub-components ----------------------------------------------------------

function StatusIcon({ status }: { status: TestStatus }) {
  if (status === "idle") {
    return <div className="w-3 h-3 rounded-full border border-slate-600 bg-slate-800" />;
  }
  if (status === "checking") {
    return (
      <div className="w-3 h-3 rounded-full bg-amber-500/80">
        <svg viewBox="0 0 12 12" className="w-3 h-3">
          <circle cx={6} cy={6} r={4} fill="none" stroke="#EAB308" strokeWidth={1.5} opacity={0.5}>
            <animate attributeName="r" values="3;5;3" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    );
  }
  if (status === "pass") {
    return (
      <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5">
          <path d="M3 6 L5 8 L9 4" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  // fail
  return (
    <div className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5">
        <path d="M4 4 L8 8 M8 4 L4 8" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ---- Helpers -----------------------------------------------------------------

function initGauntlet(): GauntletState {
  return {
    tests: GAUNTLET_TESTS.map(() => ({
      status: "idle" as TestStatus,
      progress: 0,
      metric: "",
      duration: 0,
    })),
    currentTest: -1,
    elapsed: 0,
    passCount: 0,
    failCount: 0,
    phase: "idle",
  };
}

function getMetricResult(testId: number): string {
  const results: Record<number, string> = {
    1: "0 SQLITE_BUSY",
    2: "Same ID (idempotent)",
    3: "Same agent ID",
    4: "150/150, p99=6.8s",
    5: "Both recorded",
    6: "2000/2000 enqueued",
    7: "60/60, 0 timeouts",
    8: "1494 ops, 49 RPS",
    9: "50/50 succeed",
    10: "150+300, 0 errors",
  };
  return results[testId] || "PASS";
}
