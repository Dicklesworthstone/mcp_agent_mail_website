"use client";

import { useMemo, useState } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";

interface LifecycleStage {
  id: string;
  label: string;
  description: string;
  writes: string[];
}

const BASE_STAGES: LifecycleStage[] = [
  {
    id: "compose",
    label: "Compose",
    description: "Sender prepares subject/body, recipients, importance, and thread metadata.",
    writes: ["Outbox draft payload"],
  },
  {
    id: "persist",
    label: "Persist",
    description: "Server commits canonical message row and recipient envelope in SQLite.",
    writes: ["messages table row", "recipient mapping", "thread linkage seed"],
  },
  {
    id: "deliver",
    label: "Deliver",
    description: "Inbox/outbox copies and canonical markdown artifact are materialized.",
    writes: ["recipient inbox copies", "sender outbox copy", "messages/YYYY/MM/*.md"],
  },
  {
    id: "read",
    label: "Read",
    description: "Recipient marks message as read; unread counters and views update.",
    writes: ["read_ts receipt", "inbox counters"],
  },
  {
    id: "ack",
    label: "Acknowledge",
    description: "Recipient sends explicit acknowledgement for ack_required workflows.",
    writes: ["ack_ts receipt", "acknowledged flag"],
  },
  {
    id: "thread",
    label: "Thread + Search",
    description: "Thread timeline and search index receive the event for retrieval and replay.",
    writes: ["thread event append", "search document update", "audit trail continuity"],
  },
];

function getStages(ackRequired: boolean) {
  if (ackRequired) {
    return BASE_STAGES;
  }
  return BASE_STAGES.filter((stage) => stage.id !== "ack");
}

export default function MessageLifecycleViz() {
  const reducedMotion = useVizReducedMotion();
  const [ackRequired, setAckRequired] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const stages = useMemo(() => getStages(ackRequired), [ackRequired]);
  const clampedStep = Math.min(stepIndex, stages.length - 1);
  const currentStage = stages[clampedStep];
  const completedStages = stages.slice(0, clampedStep + 1);

  const handleToggleAck = (enabled: boolean) => {
    setAckRequired(enabled);
    setStepIndex(0);
  };

  const handleReset = () => setStepIndex(0);
  const handlePrev = () => setStepIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setStepIndex((prev) => Math.min(stages.length - 1, prev + 1));

  return (
    <VizSurface aria-label="Message lifecycle and threading visualization">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Messaging Lifecycle + Threading</h3>
          <p className="text-sm text-slate-400">
            Step through send → persist → delivery → read/ack → thread/search continuity.
          </p>
        </div>
        <div className="flex gap-2">
          <VizControlButton
            tone={ackRequired ? "blue" : "neutral"}
            onClick={() => handleToggleAck(true)}
          >
            ack_required=true
          </VizControlButton>
          <VizControlButton
            tone={!ackRequired ? "green" : "neutral"}
            onClick={() => handleToggleAck(false)}
          >
            ack_required=false
          </VizControlButton>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="grid gap-3 md:grid-cols-6">
          {stages.map((stage, idx) => {
            const isCurrent = idx === clampedStep;
            const isDone = idx < clampedStep;
            return (
              <div
                key={stage.id}
                className="relative rounded-lg border p-3"
                style={{
                  borderColor: isCurrent ? "#3B82F6" : isDone ? "#22C55E66" : "#334155",
                  background: isCurrent ? "#3B82F61A" : isDone ? "#22C55E14" : "#020617",
                }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Step {idx + 1}
                </p>
                <p className="mt-1 text-sm font-bold text-white">{stage.label}</p>
                {isCurrent && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-blue-400"
                    animate={reducedMotion ? { opacity: 1 } : { opacity: [0.45, 1, 0.45] }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <VizControlButton tone="neutral" onClick={handlePrev} disabled={clampedStep === 0}>
            Previous
          </VizControlButton>
          <VizControlButton
            tone="blue"
            onClick={handleNext}
            disabled={clampedStep >= stages.length - 1}
          >
            Next
          </VizControlButton>
          <VizControlButton tone="neutral" onClick={handleReset}>
            Reset
          </VizControlButton>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Stage</p>
          <p className="mt-2 text-base font-bold text-white">{currentStage.label}</p>
          <p className="mt-2 text-sm text-slate-300">{currentStage.description}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {currentStage.writes.map((writeTarget) => (
              <li key={writeTarget}>• {writeTarget}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timeline Log</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {completedStages.map((stage, idx) => (
              <li key={stage.id}>
                <span className="mr-2 text-blue-300">{idx + 1}.</span>
                {stage.label} completed
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Thread IDs keep replies on one timeline while archive + search make the entire exchange queryable.
          </p>
        </article>
      </div>
    </VizSurface>
  );
}

