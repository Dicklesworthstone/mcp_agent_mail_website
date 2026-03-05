"use client";

import { useState } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import {
  FileCode,
  Lock,
  LockOpen,
  Shield,
  ShieldAlert,
  Timer,
  User,
} from "lucide-react";

type GuardMode = "enforce" | "warn" | "bypass";

interface ReservationStep {
  id: string;
  title: string;
  summary: string;
  lockHolder: "none" | "BlueLake" | "RedBear";
  ttlSeconds: number;
  guardMode: GuardMode;
  preCommit: "n/a" | "blocked" | "warn" | "allowed";
  prePush: "n/a" | "blocked" | "warn" | "allowed";
  command: string;
}

const RESERVATION_STEPS: ReservationStep[] = [
  {
    id: "idle",
    title: "Idle",
    summary: "No active reservation. src/auth.ts is free to reserve.",
    lockHolder: "none",
    ttlSeconds: 0,
    guardMode: "enforce",
    preCommit: "n/a",
    prePush: "n/a",
    command: "file_reservation_paths(..., paths=[\"src/auth.ts\"], exclusive=true)",
  },
  {
    id: "blue-granted",
    title: "Acquire",
    summary: "BlueLake acquires an exclusive reservation with a 3600s TTL.",
    lockHolder: "BlueLake",
    ttlSeconds: 3600,
    guardMode: "enforce",
    preCommit: "allowed",
    prePush: "allowed",
    command: "file_reservation_paths(..., agent_name=\"BlueLake\", ttl_seconds=3600)",
  },
  {
    id: "red-conflict",
    title: "Conflict Detection",
    summary: "RedBear requests the same path and receives an advisory conflict response.",
    lockHolder: "BlueLake",
    ttlSeconds: 3450,
    guardMode: "enforce",
    preCommit: "blocked",
    prePush: "blocked",
    command: "file_reservation_paths(..., agent_name=\"RedBear\") -> FILE_RESERVATION_CONFLICT",
  },
  {
    id: "blue-renew",
    title: "Renew",
    summary: "BlueLake renews the lease while still editing. TTL resets safely.",
    lockHolder: "BlueLake",
    ttlSeconds: 3600,
    guardMode: "enforce",
    preCommit: "allowed",
    prePush: "allowed",
    command: "file_reservation_paths(..., agent_name=\"BlueLake\", ttl_seconds=3600)",
  },
  {
    id: "guard-precommit-block",
    title: "Pre-Commit Guard",
    summary:
      "RedBear tries to commit an overlapping file while enforce mode is active. Pre-commit blocks.",
    lockHolder: "BlueLake",
    ttlSeconds: 3300,
    guardMode: "enforce",
    preCommit: "blocked",
    prePush: "blocked",
    command: "git commit -> blocked by mcp-agent-mail-guard (overlap: src/auth.ts)",
  },
  {
    id: "guard-prepush-warn",
    title: "Warning Mode",
    summary:
      "Guard mode switches to warn. RedBear sees conflict warnings but push is not hard-blocked.",
    lockHolder: "BlueLake",
    ttlSeconds: 3200,
    guardMode: "warn",
    preCommit: "warn",
    prePush: "warn",
    command: "AGENT_MAIL_GUARD_MODE=warn git push -> warning emitted",
  },
  {
    id: "guard-bypass",
    title: "Bypass Escape Hatch",
    summary:
      "Emergency override bypasses guard checks. Conflict remains visible in reservation data.",
    lockHolder: "BlueLake",
    ttlSeconds: 3150,
    guardMode: "bypass",
    preCommit: "allowed",
    prePush: "allowed",
    command: "AGENT_MAIL_BYPASS=1 git commit && git push",
  },
  {
    id: "stale-force-release",
    title: "Stale Force Release",
    summary:
      "BlueLake crashes and lease becomes stale. Operator force-releases reservation to unblock the swarm.",
    lockHolder: "none",
    ttlSeconds: 0,
    guardMode: "enforce",
    preCommit: "allowed",
    prePush: "allowed",
    command: "file_reservations force-release --agent BlueLake --path src/auth.ts",
  },
  {
    id: "red-granted",
    title: "Retry + Grant",
    summary: "RedBear retries and now acquires the reservation cleanly.",
    lockHolder: "RedBear",
    ttlSeconds: 3600,
    guardMode: "enforce",
    preCommit: "allowed",
    prePush: "allowed",
    command: "file_reservation_paths(..., agent_name=\"RedBear\", exclusive=true)",
  },
  {
    id: "red-release",
    title: "Release",
    summary: "RedBear finishes work and explicitly releases reservation ownership.",
    lockHolder: "none",
    ttlSeconds: 0,
    guardMode: "enforce",
    preCommit: "n/a",
    prePush: "n/a",
    command: "release_file_reservations(..., agent_name=\"RedBear\")",
  },
];

const guardModeTone: Record<GuardMode, string> = {
  enforce: "text-red-300 bg-red-500/10 border-red-500/30",
  warn: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  bypass: "text-blue-300 bg-blue-500/10 border-blue-500/30",
};

const gateTone: Record<ReservationStep["preCommit"], string> = {
  "n/a": "text-slate-500",
  blocked: "text-red-300",
  warn: "text-amber-300",
  allowed: "text-green-300",
};

export default function FileReservationViz() {
  const reducedMotion = useVizReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const step = RESERVATION_STEPS[stepIndex];
  const isBlueActive = step.lockHolder === "BlueLake";
  const isRedActive = step.lockHolder === "RedBear";
  const activeHolder = step.lockHolder === "none" ? "None" : step.lockHolder;

  const stepForward = () => {
    setStepIndex((prev) => Math.min(prev + 1, RESERVATION_STEPS.length - 1));
  };

  const stepBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const reset = () => {
    setStepIndex(0);
  };

  return (
    <VizSurface aria-label="File reservation and guardrail enforcement visualization">
      <VizHeader
        accent="amber"
        eyebrow="Conflict Prevention"
        title="File Reservations + Guardrail Policy"
        subtitle="Step through the full lifecycle: acquire, overlap detection, renewals, enforce/warn/bypass policy behavior, stale lock recovery, and release handoff."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="Step" value={`${stepIndex + 1}/${RESERVATION_STEPS.length}`} tone="blue" />
        <VizMetricCard label="Active Holder" value={activeHolder} tone={step.lockHolder === "none" ? "neutral" : step.lockHolder === "BlueLake" ? "blue" : "red"} />
        <VizMetricCard label="TTL" value={`${step.ttlSeconds}s`} tone={step.ttlSeconds > 0 ? "green" : "neutral"} />
      </div>

      <div className="relative mb-4 flex min-h-[420px] flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-[#0B1120] px-4 py-8 md:min-h-[300px] md:flex-row md:justify-between md:gap-0 md:p-6">
        {/* Background Grids */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

        {/* BlueLake (Left) */}
        <div className={`z-10 relative flex w-full max-w-[11rem] shrink-0 flex-col items-center rounded-xl border-2 p-3 transition-all duration-500 md:w-36 md:p-4 ${isBlueActive ? "bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-slate-900/80 border-slate-700"}`}>
          <User className={`w-8 h-8 md:w-10 md:h-10 mb-2 ${isBlueActive ? "text-blue-400" : "text-slate-500"}`} />
          <span className="font-black tracking-widest uppercase text-[10px] md:text-xs text-slate-200">BlueLake</span>
          <span className="text-[9px] md:text-[10px] text-slate-500 font-mono mt-1">claude-code</span>
        </div>

        {/* Connection Line Left */}
        <div className={`relative z-0 h-10 w-1 overflow-hidden transition-colors duration-500 md:-mx-2 md:h-1 md:w-auto md:flex-1 ${isBlueActive ? "bg-blue-500" : "border-l border-dashed border-slate-600 bg-transparent md:border-l-0 md:border-t"}`}>
           {isBlueActive && !reducedMotion && (
             <motion.div className="absolute inset-0 hidden bg-white opacity-50 md:block" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
           )}
        </div>

        {/* Central File Node */}
        <div className={`z-20 relative flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-xl border-2 transition-all duration-500 md:h-36 md:w-36 ${step.lockHolder !== "none" ? "bg-black/80 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "bg-black/40 border-slate-700"}`}>
          <FileCode className={`w-8 h-8 md:w-12 md:h-12 mb-2 transition-colors duration-500 ${step.lockHolder !== "none" ? "text-amber-400" : "text-slate-400"}`} />
          <p className="font-mono text-xs md:text-sm font-bold text-slate-200">src/auth.ts</p>
          <div className="absolute -top-3 -right-3">
             <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${step.lockHolder !== "none" ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-slate-800 border-slate-600 text-slate-400"}`}>
               {step.lockHolder === "none" ? <LockOpen className="w-3 h-3 md:w-4 md:h-4" /> : <Lock className="w-3 h-3 md:w-4 md:h-4" />}
             </div>
          </div>
          <div className="absolute -bottom-4 bg-slate-900 border border-slate-700 rounded-full px-2 py-0.5 md:px-3 md:py-1 flex items-center gap-1 shadow-lg">
             <Timer className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
             <span className="font-mono text-[10px] md:text-xs text-amber-300 font-bold">{step.ttlSeconds}s</span>
          </div>
        </div>

        {/* Connection Line Right */}
        <div className={`relative z-0 h-10 w-1 overflow-hidden transition-colors duration-500 md:-mx-2 md:h-1 md:w-auto md:flex-1 ${isRedActive ? "bg-red-500" : step.id === "red-conflict" || step.id === "guard-precommit-block" || step.id === "guard-prepush-warn" ? "bg-amber-500" : "border-l border-dashed border-slate-600 bg-transparent md:border-l-0 md:border-t"}`}>
           {isRedActive && !reducedMotion && (
             <motion.div className="absolute inset-0 hidden bg-white opacity-50 md:block" animate={{ x: ["100%", "-100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
           )}
           {(step.id === "red-conflict" || step.id === "guard-precommit-block") && (
             <div className="absolute top-1/2 left-1/2 flex h-4 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded bg-amber-500 md:h-8 md:w-4">
               <ShieldAlert className="w-3 h-3 text-black" />
             </div>
           )}
        </div>

        {/* RedBear (Right) */}
        <div className={`z-10 relative flex w-full max-w-[11rem] shrink-0 flex-col items-center rounded-xl border-2 p-3 transition-all duration-500 md:w-36 md:p-4 ${isRedActive ? "bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : step.id === "red-conflict" || step.id === "guard-precommit-block" || step.id === "guard-prepush-warn" ? "bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-slate-900/80 border-slate-700"}`}>
          <User className={`w-8 h-8 md:w-10 md:h-10 mb-2 ${isRedActive ? "text-red-400" : step.id === "red-conflict" || step.id === "guard-precommit-block" || step.id === "guard-prepush-warn" ? "text-amber-400" : "text-slate-500"}`} />
          <span className="font-black tracking-widest uppercase text-[10px] md:text-xs text-slate-200">RedBear</span>
          <span className="text-[9px] md:text-[10px] text-slate-500 font-mono mt-1">cursor</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Current Step</p>
          <p className="mt-2 text-base font-bold text-white">{step.title}</p>
          <p className="mt-2 text-sm text-slate-300">{step.summary}</p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-white/5 bg-slate-900 p-3 text-xs font-mono text-slate-400">
{step.command}
          </pre>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Guard Mode</span>
            <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-bold ${guardModeTone[step.guardMode]}`}>
              {step.guardMode === "enforce" ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
              {step.guardMode}
            </span>
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Guardrail Gates</p>
          <div className="mt-3 grid gap-2">
            <div className="flex items-center justify-between rounded border border-white/5 bg-slate-900 px-3 py-2">
              <span className="text-sm text-slate-300">pre-commit</span>
              <span className={`text-xs font-bold uppercase ${gateTone[step.preCommit]}`}>{step.preCommit}</span>
            </div>
            <div className="flex items-center justify-between rounded border border-white/5 bg-slate-900 px-3 py-2">
              <span className="text-sm text-slate-300">pre-push</span>
              <span className={`text-xs font-bold uppercase ${gateTone[step.prePush]}`}>{step.prePush}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Timeline</p>
            <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-1">
              {RESERVATION_STEPS.map((item, idx) => {
                const isDone = idx < stepIndex;
                const isCurrent = idx === stepIndex;
                return (
                  <div key={item.id} className="flex items-center gap-1">
                    <div
                      className="rounded px-2 py-1 text-[10px] font-bold uppercase"
                      style={{
                        color: isCurrent ? "#BFDBFE" : isDone ? "#86EFAC" : "#64748B",
                        background: isCurrent ? "#1D4ED833" : isDone ? "#16653433" : "#0F172A",
                        border: `1px solid ${isCurrent ? "#3B82F6AA" : isDone ? "#22C55E66" : "#334155"}`,
                      }}
                    >
                      {idx + 1}
                    </div>
                    {idx < RESERVATION_STEPS.length - 1 && (
                      <motion.div
                        className="h-0.5 w-3 rounded"
                        style={{ backgroundColor: isDone ? "#22C55E" : "#334155" }}
                        animate={reducedMotion ? { opacity: 1 } : { opacity: [0.6, 1, 0.6] }}
                        transition={reducedMotion ? { duration: 0 } : { duration: 1.1, repeat: Infinity }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="amber"
        title="Pedagogical Takeaways"
        items={[
          "Reservations are advisory coordination signals, not immutable locks.",
          "Guard policy changes outcome at commit/push time: enforce, warn, or explicit bypass.",
          "Stale reservation recovery protects throughput without requiring manual DB surgery.",
        ]}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <VizControlButton tone="neutral" onClick={stepBack} disabled={stepIndex === 0}>
          Previous
        </VizControlButton>
        <VizControlButton
          tone="blue"
          onClick={stepForward}
          disabled={stepIndex >= RESERVATION_STEPS.length - 1}
        >
          Next
        </VizControlButton>
        <VizControlButton tone="neutral" onClick={reset}>
          Reset
        </VizControlButton>
      </div>
    </VizSurface>
  );
}
