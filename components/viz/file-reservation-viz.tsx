"use client";

import { useState } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import {
  AlertTriangle,
  CheckCircle2,
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
      <div className="mb-5">
        <h3 className="text-xl font-black text-white">File Reservations + Guardrails</h3>
        <p className="mt-2 text-sm text-slate-400">
          End-to-end flow: acquire, detect overlap conflicts, renew, pre-commit/pre-push gate checks,
          stale force-release, and clean handoff.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div
            className={`rounded-lg border p-4 text-center transition-colors ${
              isBlueActive ? "border-blue-500/40 bg-blue-500/10" : "border-white/10 bg-slate-900"
            }`}
          >
            <User className={`mx-auto mb-2 h-8 w-8 ${isBlueActive ? "text-blue-300" : "text-slate-500"}`} />
            <p className="text-sm font-bold text-slate-200">BlueLake</p>
            <p className="text-xs text-slate-500">claude-code</p>
            {isBlueActive && (
              <p className="mt-2 inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-xs text-green-300">
                <CheckCircle2 className="h-3 w-3" />
                Holds Lease
              </p>
            )}
          </div>

          <div className="relative rounded-lg border border-slate-700 bg-black p-4 text-center">
            <FileCode className="mx-auto mb-2 h-10 w-10 text-slate-300" />
            <p className="font-mono text-sm text-slate-200">src/auth.ts</p>
            <p className="mt-1 text-xs text-slate-500">exclusive reservation</p>
            <div className="absolute right-2 top-2">
              {step.lockHolder === "none" && <LockOpen className="h-5 w-5 text-slate-500" />}
              {step.lockHolder === "BlueLake" && <Lock className="h-5 w-5 text-blue-400" />}
              {step.lockHolder === "RedBear" && <Lock className="h-5 w-5 text-red-400" />}
            </div>
            <div className="mt-3 inline-flex items-center gap-1 rounded border border-white/10 bg-slate-900 px-2 py-1 text-xs">
              <Timer className="h-3 w-3 text-slate-400" />
              <span className="text-slate-300">TTL</span>
              <span className="font-mono text-blue-300">{step.ttlSeconds}s</span>
            </div>
          </div>

          <div
            className={`rounded-lg border p-4 text-center transition-colors ${
              isRedActive ? "border-red-500/40 bg-red-500/10" : "border-white/10 bg-slate-900"
            }`}
          >
            <User className={`mx-auto mb-2 h-8 w-8 ${isRedActive ? "text-red-300" : "text-slate-500"}`} />
            <p className="text-sm font-bold text-slate-200">RedBear</p>
            <p className="text-xs text-slate-500">cursor</p>
            {step.id === "red-conflict" && (
              <p className="mt-2 inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                Conflict Warning
              </p>
            )}
            {isRedActive && (
              <p className="mt-2 inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-xs text-green-300">
                <CheckCircle2 className="h-3 w-3" />
                Holds Lease
              </p>
            )}
          </div>
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
