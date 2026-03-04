"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

type Step = {
  label: string;
  description: string;
};

const WITHOUT_STEPS: Step[] = [
  { label: "Task Running", description: "Database query in progress, HTTP response half-written, file handle open." },
  { label: "Cancel Signal!", description: "Runtime drops the future. Execution stops instantly mid-operation." },
  { label: "Aftermath", description: "DB connection leaked. File half-written. Background task orphaned. No cleanup ran." },
];

const WITH_STEPS: Step[] = [
  { label: "Task Running", description: "Database query in progress, HTTP response half-written, file handle open." },
  { label: "Cancel Requested", description: "Signal received. Task notified. Drain phase begins with time budget." },
  { label: "Draining", description: "Task flushes HTTP response, commits DB transaction, closes file handle." },
  { label: "Finalized", description: "Finalizers run in LIFO order. All resources released. Clean exit. Zero leaks." },
];

const COLORS = {
  bad: { accent: "#EF4444", glow: "#F8717133", bg: "#EF444411" },
  good: { accent: "#22C55E", glow: "#4ADE8033", bg: "#22C55E11" },
} as const;

function ResourceDot({ leaked, label }: { leaked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="h-2.5 w-2.5 rounded-full"
        animate={{
          backgroundColor: leaked ? "#EF4444" : "#22C55E",
          boxShadow: leaked ? "0 0 8px #EF444466" : "0 0 8px #22C55E66",
        }}
        transition={{ duration: 0.3 }}
      />
      <span className={`text-xs font-medium ${leaked ? "text-red-400" : "text-green-400"}`}>
        {label}
      </span>
    </div>
  );
}

function PanelTimeline({
  steps,
  currentStep,
  colors,
}: {
  steps: Step[];
  currentStep: number;
  colors: { accent: string; glow: string; bg: string };
}) {
  const prefersReduced = useReducedMotion();
  const dur = prefersReduced ? 0 : 0.3;

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isPast = i < currentStep;
        const isFuture = i > currentStep;

        return (
          <motion.div
            key={step.label}
            className="relative rounded-xl border p-4 transition-colors"
            style={{
              borderColor: isActive ? colors.accent : isPast ? `${colors.accent}44` : "#1E293B",
              background: isActive ? colors.bg : "transparent",
            }}
            animate={{
              scale: isActive ? 1.02 : 1,
              opacity: isFuture ? 0.4 : 1,
            }}
            transition={{ duration: dur }}
          >
            {isActive && !prefersReduced && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ boxShadow: `0 0 20px ${colors.glow}` }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: isActive || isPast ? colors.accent : "#334155",
                  }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: isActive ? colors.accent : isPast ? "#94A3B8" : "#475569" }}
                >
                  {step.label}
                </span>
              </div>
              <AnimatePresence mode="wait">
                {(isActive || isPast) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: dur }}
                    className="text-xs text-slate-400 leading-relaxed ml-4"
                  >
                    {step.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ProblemScenario() {
  const [withoutStep, setWithoutStep] = useState(0);
  const [withStep, setWithStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setWithoutStep(0);
    setWithStep(0);
    setIsPlaying(false);
  }, [clearTimers]);

  const play = useCallback(() => {
    if (isPlaying) return;
    reset();
    setIsPlaying(true);

    const delays = [800, 1600, 2400, 3200];

    // "Without" panel — fast 3-step sequence
    const t1 = setTimeout(() => setWithoutStep(1), delays[0]);
    const t2 = setTimeout(() => setWithoutStep(2), delays[1]);

    // "With" panel — graceful 4-step sequence
    const t3 = setTimeout(() => setWithStep(1), delays[0]);
    const t4 = setTimeout(() => setWithStep(2), delays[1]);
    const t5 = setTimeout(() => setWithStep(3), delays[2]);
    const t6 = setTimeout(() => setIsPlaying(false), delays[3]);

    timersRef.current = [t1, t2, t3, t4, t5, t6];
  }, [isPlaying, reset]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const withoutDone = withoutStep === WITHOUT_STEPS.length - 1;
  const withDone = withStep === WITH_STEPS.length - 1;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Without Asupersync */}
        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{
            borderColor: withoutDone ? "#EF444444" : "#1E293B",
            background: "#020A14",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-400">
              Without Asupersync
            </span>
          </div>

          <PanelTimeline steps={WITHOUT_STEPS} currentStep={withoutStep} colors={COLORS.bad} />

          {/* Resource Status */}
          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3">
              Resource Status
            </p>
            <div className="space-y-2">
              <ResourceDot leaked={withoutDone} label={withoutDone ? "DB connection leaked" : "DB connection open"} />
              <ResourceDot leaked={withoutDone} label={withoutDone ? "File half-written" : "File handle open"} />
              <ResourceDot leaked={withoutDone} label={withoutDone ? "Background task orphaned" : "Background task running"} />
            </div>
          </div>
        </div>

        {/* Right Panel: With Asupersync */}
        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{
            borderColor: withDone ? "#22C55E44" : "#1E293B",
            background: "#020A14",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-green-400">
              With Asupersync
            </span>
          </div>

          <PanelTimeline steps={WITH_STEPS} currentStep={withStep} colors={COLORS.good} />

          {/* Resource Status */}
          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3">
              Resource Status
            </p>
            <div className="space-y-2">
              <ResourceDot leaked={false} label={withDone ? "DB connection closed" : "DB connection open"} />
              <ResourceDot leaked={false} label={withDone ? "File written + flushed" : "File handle open"} />
              <ResourceDot leaked={false} label={withDone ? "Task cleanly exited" : "Background task running"} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={play}
          disabled={isPlaying}
          className="rounded-lg px-6 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "#F97316" }}
        >
          {withoutDone || withDone ? "Replay" : "Trigger Cancellation"}
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
