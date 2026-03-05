"use client";

import { useState, type ReactNode } from "react";
import { motion } from "@/components/motion";
import { cn } from "@/lib/utils";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Link2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export type HandshakeState =
  | "unconnected"
  | "request"
  | "pending"
  | "accepted"
  | "rejected"
  | "messaging";
export type DecisionMode = "accept" | "reject";

type FlowState = Exclude<HandshakeState, "rejected">;

const ORDER: FlowState[] = ["unconnected", "request", "pending", "accepted", "messaging"];

const HANDSHAKE_COPY: Record<
  HandshakeState,
  { title: string; summary: string; command: string }
> = {
  unconnected: {
    title: "No Relationship",
    summary: "Agents cannot message each other until a contact relationship exists.",
    command: "send_message(...) -> CONTACT_BLOCKED",
  },
  request: {
    title: "Request Contact",
    summary: "GreenCastle submits a targeted contact request to BlueLake.",
    command: "request_contact(project_key, from=GreenCastle, to=BlueLake)",
  },
  pending: {
    title: "Pending Approval",
    summary: "BlueLake receives an approval request and can approve or reject.",
    command: "fetch_inbox(..., agent=BlueLake) -> pending request visible",
  },
  accepted: {
    title: "Approved",
    summary: "BlueLake accepts; a bidirectional policy edge is created.",
    command: "respond_contact(project_key, from=BlueLake, to=GreenCastle, accept=true)",
  },
  rejected: {
    title: "Rejected",
    summary: "BlueLake rejects the request based on contact policy. Messaging remains blocked.",
    command: "respond_contact(project_key, from=BlueLake, to=GreenCastle, accept=false)",
  },
  messaging: {
    title: "Messaging Allowed",
    summary: "Both agents can now exchange direct thread messages.",
    command: "send_message(project_key, from=GreenCastle, to=BlueLake, ...)",
  },
};

const FLOW_BADGE_COPY = {
  unconnected: "No Relationship",
  request: "Request Contact",
  pending: "Pending Approval",
  accepted: "Approved",
  messaging: "Messaging Allowed",
} as const;

export function getNextHandshakeState(
  state: HandshakeState,
  decisionMode: DecisionMode
): HandshakeState {
  if (state === "pending") {
    return decisionMode === "accept" ? "accepted" : "rejected";
  }
  if (state === "rejected") {
    return "request";
  }
  const idx = ORDER.indexOf(state as FlowState);
  if (idx < 0) {
    return "unconnected";
  }
  return ORDER[(idx + 1) % ORDER.length];
}

export function getPreviousHandshakeState(state: HandshakeState): HandshakeState {
  if (state === "rejected") {
    return "pending";
  }
  const idx = ORDER.indexOf(state as FlowState);
  if (idx <= 0) {
    return "unconnected";
  }
  return ORDER[idx - 1];
}

export default function AgentHandshakeViz() {
  const [state, setState] = useState<HandshakeState>("unconnected");
  const [decisionMode, setDecisionMode] = useState<DecisionMode>("accept");
  const reducedMotion = useVizReducedMotion();

  const advance = () => {
    setState((prev) => getNextHandshakeState(prev, decisionMode));
  };

  const back = () => {
    setState((prev) => getPreviousHandshakeState(prev));
  };

  const copy = HANDSHAKE_COPY[state];
  const isConnected = state === "accepted" || state === "messaging";
  const isPending = state === "request" || state === "pending";
  const blockedState = state === "unconnected" || state === "rejected";
  const flowIndex = state === "rejected" ? 2 : ORDER.indexOf(state);

  return (
    <VizSurface aria-label="Agent Contact Handshake">
      <VizHeader
        accent="green"
        eyebrow="Trust + Governance"
        title="Contact Handshake + Policy Outcome"
        subtitle="Messaging permission is explicit and auditable. Switch the policy decision to compare accepted vs rejected outcomes from the same pending request."
        controls={
          <div className="rounded-xl border border-white/10 bg-slate-950/85 p-1.5">
            <div className="flex gap-1">
              <VizControlButton
                tone={decisionMode === "accept" ? "green" : "neutral"}
                onClick={() => setDecisionMode("accept")}
                className="rounded-md px-3 py-1.5 text-[10px]"
              >
                Pending &rarr; Accept
              </VizControlButton>
              <VizControlButton
                tone={decisionMode === "reject" ? "red" : "neutral"}
                onClick={() => setDecisionMode("reject")}
                className="rounded-md px-3 py-1.5 text-[10px]"
              >
                Pending &rarr; Reject
              </VizControlButton>
            </div>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Relationship"
          value={copy.title}
          tone={isConnected ? "green" : blockedState ? "red" : "amber"}
          icon={isConnected ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
        />
        <SummaryCard
          label="Pending Outcome"
          value={decisionMode === "accept" ? "Accept" : "Reject"}
          tone={decisionMode === "accept" ? "green" : "red"}
          icon={decisionMode === "accept" ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
        />
        <SummaryCard
          label="Messaging Gate"
          value={isConnected ? "Allowed" : "Blocked"}
          tone={isConnected ? "green" : "red"}
          icon={isConnected ? <Mail className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
        />
      </div>

      <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-950 to-black p-4 md:p-5">
        <div className="pointer-events-none absolute -top-20 -left-8 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 -bottom-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <ol className="relative mb-4 grid gap-2 sm:grid-cols-5">
          {ORDER.map((step, index) => {
            const isStepActive = state === step || (state === "rejected" && step === "pending");
            const isStepComplete = flowIndex > index && state !== "rejected";
            return (
              <li
                key={step}
                className={cn(
                  "rounded-lg border px-2.5 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em]",
                  isStepActive
                    ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                    : isStepComplete
                      ? "border-blue-400/35 bg-blue-500/15 text-blue-100"
                      : "border-white/8 bg-black/35 text-slate-500",
                )}
              >
                {FLOW_BADGE_COPY[step]}
              </li>
            );
          })}
        </ol>

        {state === "rejected" ? (
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-red-400/35 bg-red-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-red-100">
            <Ban className="h-3.5 w-3.5" />
            Pending &rarr; Reject branch active
          </p>
        ) : null}

        <div className="relative flex h-52 items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-black/45 px-4 md:px-8">
          <div className="z-10 flex flex-col items-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400/60 bg-emerald-500/15 shadow-[0_0_35px_-16px_rgba(16,185,129,0.9)]">
              <span className="font-black text-emerald-200">GC</span>
            </div>
            <span className="text-sm font-black text-slate-100">GreenCastle</span>
            <span className="mt-1 text-[11px] text-slate-400">Requester</span>
          </div>

          <div className="absolute left-14 right-14 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-800/80 md:left-24 md:right-24">
            {state === "request" && !reducedMotion ? (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "120%" }}
                transition={{ duration: 1.25, repeat: Infinity, ease: "linear" }}
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent to-amber-400"
              />
            ) : null}
            {state === "request" && reducedMotion ? <div className="h-full w-full rounded-full bg-amber-500/50" /> : null}
            {state === "pending" ? <div className="h-full w-full rounded-full bg-amber-500/65" /> : null}
            {state === "accepted" && !reducedMotion ? (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: "-120%" }}
                transition={{ duration: 1.35, repeat: Infinity, ease: "linear" }}
                className="h-full w-1/2 rounded-full bg-gradient-to-l from-transparent to-blue-400"
              />
            ) : null}
            {state === "accepted" && reducedMotion ? <div className="h-full w-full rounded-full bg-blue-500/55" /> : null}
            {state === "messaging" ? <div className="h-full w-full rounded-full bg-emerald-500/65" /> : null}
            {state === "rejected" ? <div className="h-full w-full rounded-full bg-red-500/60" /> : null}
          </div>

          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 shadow-[0_0_30px_-14px_rgba(59,130,246,0.9)]">
              {state === "unconnected" && <ShieldAlert className="h-5 w-5 text-slate-500" />}
              {state === "request" && <Mail className="h-5 w-5 text-amber-400" />}
              {state === "pending" && <Clock3 className="h-5 w-5 text-amber-400" />}
              {state === "accepted" && <ShieldCheck className="h-5 w-5 text-emerald-400" />}
              {state === "rejected" && <ShieldAlert className="h-5 w-5 text-red-400" />}
              {state === "messaging" && <Link2 className="h-5 w-5 text-emerald-300" />}
            </div>
          </div>

          <div className="z-10 flex flex-col items-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-400/60 bg-blue-500/15 shadow-[0_0_35px_-16px_rgba(59,130,246,0.95)]">
              <span className="font-black text-blue-200">BL</span>
            </div>
            <span className="text-sm font-black text-slate-100">BlueLake</span>
            <span className="mt-1 text-[11px] text-slate-400">Approver</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <article className="rounded-xl border border-white/10 bg-black/35 p-4 md:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Current Outcome</p>
          <p className="mt-2 text-lg font-black text-white">{copy.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{copy.summary}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200">
            {isConnected ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            ) : isPending ? (
              <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            )}
            {isConnected ? "trusted" : isPending ? "pending" : "blocked"}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/35 p-4 md:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Command</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-slate-900/90 p-3 text-xs font-mono text-slate-300">
{copy.command}
          </pre>
          <div className="mt-3 flex gap-2">
            <VizControlButton tone="neutral" onClick={back}>
              Previous
            </VizControlButton>
            <VizControlButton tone="green" onClick={advance}>
              {state === "messaging" ? "Reset" : "Next"}
            </VizControlButton>
          </div>
        </article>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="green"
        title="Pedagogical Takeaways"
        items={[
          "Contact edge creation is a first-class state transition, not an implicit side effect.",
          "Policy controls gate communication before message send, reducing noisy failures later.",
          "Rejected paths still preserve auditability through explicit command + state evidence.",
        ]}
      />
    </VizSurface>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: "green" | "amber" | "red";
}) {
  const toneClassName =
    tone === "green"
      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
      : tone === "amber"
        ? "border-amber-400/35 bg-amber-500/10 text-amber-100"
        : "border-red-400/35 bg-red-500/10 text-red-100";

  return (
    <article className={cn("rounded-xl border p-3", toneClassName)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{label}</p>
          <p className="mt-1 text-sm font-black text-white">{value}</p>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/35">
          {icon}
        </span>
      </div>
    </article>
  );
}
