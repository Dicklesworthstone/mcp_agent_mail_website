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
import { Clock3, Mail, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";

type HandshakeState = "unconnected" | "request" | "pending" | "accepted" | "rejected" | "messaging";
type DecisionMode = "accept" | "deny";

const ORDER: HandshakeState[] = ["unconnected", "request", "pending", "accepted", "messaging"];

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

export default function AgentHandshakeViz() {
  const [state, setState] = useState<HandshakeState>("unconnected");
  const [decisionMode, setDecisionMode] = useState<DecisionMode>("accept");
  const reducedMotion = useVizReducedMotion();

  const advance = () => {
    if (state === "pending") {
      setState(decisionMode === "accept" ? "accepted" : "rejected");
      return;
    }
    if (state === "rejected") {
      setState("request");
      return;
    }
    const idx = ORDER.indexOf(state);
    setState(ORDER[(idx + 1) % ORDER.length]);
  };

  const back = () => {
    if (state === "rejected") {
      setState("pending");
      return;
    }
    const idx = ORDER.indexOf(state);
    setState(ORDER[Math.max(0, idx - 1)]);
  };

  const copy = HANDSHAKE_COPY[state];
  const isConnected = state === "accepted" || state === "messaging";
  const isPending = state === "request" || state === "pending";
  const blockedState = state === "unconnected" || state === "rejected";

  return (
    <VizSurface aria-label="Agent Contact Handshake">
      <VizHeader
        accent="green"
        eyebrow="Trust + Governance"
        title="Contact Handshake + Policy Outcome"
        subtitle="Messaging permission is explicit and auditable. Switch the policy decision to compare accepted vs rejected outcomes from the same pending request."
        controls={
          <div className="flex gap-2">
            <VizControlButton
              tone={decisionMode === "accept" ? "green" : "neutral"}
              onClick={() => setDecisionMode("accept")}
            >
              Pending &rarr; Accept
            </VizControlButton>
            <VizControlButton
              tone={decisionMode === "deny" ? "red" : "neutral"}
              onClick={() => setDecisionMode("deny")}
            >
              Pending &rarr; Reject
            </VizControlButton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="State" value={copy.title} tone={isConnected ? "green" : blockedState ? "red" : "amber"} />
        <VizMetricCard label="Decision Mode" value={decisionMode === "accept" ? "accept" : "deny"} tone={decisionMode === "accept" ? "green" : "red"} />
        <VizMetricCard label="Messaging" value={isConnected ? "allowed" : "blocked"} tone={isConnected ? "green" : "red"} />
      </div>

      <div className="relative mb-4 flex h-48 items-center justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900 px-6 md:px-12">
        <div className="z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-2">
            <span className="font-bold text-emerald-400">GC</span>
          </div>
          <span className="text-sm font-bold text-slate-300">GreenCastle</span>
        </div>

        {/* Connection Line */}
        <div className="absolute left-24 right-24 md:left-32 md:right-32 h-1 bg-slate-800 top-1/2 -translate-y-1/2 rounded-full overflow-hidden">
          {state === "request" && !reducedMotion && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-full w-1/2 bg-gradient-to-r from-transparent to-amber-500"
            />
          )}
          {state === "request" && reducedMotion && (
            <div className="h-full w-full bg-amber-500/45" />
          )}
          {state === "pending" && (
            <div className="h-full w-full bg-amber-500/55" />
          )}
          {state === "accepted" && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "-100%" }}
              transition={reducedMotion ? { duration: 0 } : { duration: 1.5 }}
              className="h-full w-1/2 bg-gradient-to-l from-transparent to-blue-500"
            />
          )}
          {state === "messaging" && (
            <div className="h-full w-full bg-green-500/50" />
          )}
          {state === "rejected" && (
            <div className="h-full w-full bg-red-500/45" />
          )}
        </div>

        <div className="z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mb-2">
            <span className="font-bold text-blue-400">BL</span>
          </div>
          <span className="text-sm font-bold text-slate-300">BlueLake</span>
        </div>

        {/* Central Icon Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-12 h-12 bg-black rounded-full border border-slate-700 flex items-center justify-center">
            {state === "unconnected" && <ShieldAlert className="w-5 h-5 text-slate-500" />}
            {state === "request" && <Mail className="w-5 h-5 text-amber-500" />}
            {state === "pending" && <Clock3 className="w-5 h-5 text-amber-500" />}
            {state === "accepted" && <ShieldCheck className="w-5 h-5 text-green-500" />}
            {state === "rejected" && <ShieldAlert className="w-5 h-5 text-red-500" />}
            {state === "messaging" && <Mail className="w-5 h-5 text-green-500" />}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-white/10 bg-black/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">State</p>
          <p className="mt-2 text-base font-bold text-white">{copy.title}</p>
          <p className="mt-2 text-sm text-slate-300">{copy.summary}</p>
          <p className="mt-3 inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-300 border-white/10 bg-slate-900">
            {isConnected ? <ShieldCheck className="h-3 w-3 text-green-400" /> : isPending ? <UserCheck className="h-3 w-3 text-amber-400" /> : <ShieldAlert className="h-3 w-3 text-red-400" />}
            {isConnected ? "trusted" : isPending ? "pending" : "blocked"}
          </p>
        </article>

        <article className="rounded-lg border border-white/10 bg-black/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Command</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-white/5 bg-slate-900 p-3 text-xs font-mono text-slate-400">
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
