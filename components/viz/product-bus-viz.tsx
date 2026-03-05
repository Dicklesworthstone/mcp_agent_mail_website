"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { Network, FolderGit, Package, Mail, Search, UserCheck, ArrowRight } from "lucide-react";

/* ---------- data ---------- */

interface Project {
  id: string;
  name: string;
  path: string;
  agents: string[];
}

interface ProductLink {
  productName: string;
  projects: Project[];
}

const PRODUCT: ProductLink = {
  productName: "acme-platform",
  projects: [
    { id: "backend", name: "Backend API", path: "/data/projects/backend", agents: ["GreenCastle", "BlueLake"] },
    { id: "frontend", name: "Frontend App", path: "/data/projects/frontend", agents: ["RedBear"] },
    { id: "infra", name: "Infrastructure", path: "/data/projects/infra", agents: ["SilverOwl"] },
  ],
};

type DemoStep =
  | "idle"
  | "link"
  | "cross-search"
  | "cross-message"
  | "contact-request"
  | "contact-approved"
  | "contact-denied";

interface StepInfo {
  label: string;
  description: string;
  highlight: string[];
}

const STEPS: Record<DemoStep, StepInfo> = {
  idle: {
    label: "Product Bus Overview",
    description: "Three repos linked under one product. Each repo has its own agents, messages, and reservations.",
    highlight: [],
  },
  link: {
    label: "ensure_product + link",
    description: "The operator creates a product and links repos. This enables cross-project operations like unified search and inbox aggregation.",
    highlight: ["backend", "frontend", "infra"],
  },
  "cross-search": {
    label: "Cross-Project Search",
    description: "search_messages_product queries all linked repos. Results include project origin and relevance scores.",
    highlight: ["backend", "frontend"],
  },
  "contact-request": {
    label: "Contact Request",
    description: "Before messaging across projects, agents must establish a contact relationship. GreenCastle sends a contact request to RedBear.",
    highlight: ["backend", "frontend"],
  },
  "contact-approved": {
    label: "Contact Approved",
    description: "RedBear approves the contact request. Bidirectional messaging is now permitted. The contact graph records the relationship.",
    highlight: ["backend", "frontend"],
  },
  "contact-denied": {
    label: "Contact Denied",
    description: "If policy is set to 'deny_all', the request is rejected. Agents cannot message each other until policy changes.",
    highlight: [],
  },
  "cross-message": {
    label: "Cross-Project Messaging",
    description: "After approval, GreenCastle@backend can send a thread message to RedBear@frontend with thread continuity across repos.",
    highlight: ["backend", "frontend"],
  },
};

const STEP_ORDER: DemoStep[] = [
  "idle",
  "link",
  "cross-search",
  "contact-request",
  "contact-approved",
  "cross-message",
  "contact-denied",
];

/* ---------- component ---------- */

export default function ProductBusViz() {
  const reducedMotion = useVizReducedMotion();
  const [stepIdx, setStepIdx] = useState(0);

  const currentStep = STEP_ORDER[stepIdx];
  const stepInfo = STEPS[currentStep];

  const handleNext = () => setStepIdx((prev) => Math.min(STEP_ORDER.length - 1, prev + 1));
  const handlePrev = () => setStepIdx((prev) => Math.max(0, prev - 1));
  const handleReset = () => setStepIdx(0);

  return (
    <VizSurface aria-label="Cross-project product bus visualization">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-black text-white">Product Bus + Contact Governance</h3>
        <p className="text-sm text-slate-400">
          Link repos under a product for cross-project search, messaging, and contact-governed communication.
        </p>
      </div>

      {/* Product topology */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-bold text-orange-200">
            Product: {PRODUCT.productName}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {PRODUCT.projects.map((proj) => {
            const isHighlighted = stepInfo.highlight.includes(proj.id);
            return (
              <motion.div
                key={proj.id}
                className="rounded-lg border p-3 transition-colors"
                style={{
                  borderColor: isHighlighted ? "#F97316" : "#334155",
                  background: isHighlighted ? "#F973161A" : "#020617",
                }}
                animate={
                  isHighlighted && !reducedMotion
                    ? { borderColor: ["#F97316", "#F9731680", "#F97316"] }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FolderGit className="w-4 h-4" style={{ color: isHighlighted ? "#F97316" : "#64748B" }} />
                  <span className="text-sm font-bold text-white">{proj.name}</span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 mb-2">{proj.path}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.agents.map((agent) => (
                    <span
                      key={agent}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Connectors */}
        {currentStep !== "idle" && (
          <div className="flex justify-center mt-3 gap-1">
            {PRODUCT.projects.slice(0, -1).map((_, i) => (
              <motion.div
                key={i}
                className="h-0.5 flex-1 rounded-full bg-orange-500/40"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Step detail */}
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <AnimatePresence mode="wait">
          <motion.article
            key={currentStep}
            className="rounded-xl border border-white/10 bg-black/30 p-4"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
              Step {stepIdx + 1}/{STEP_ORDER.length}
            </p>
            <p className="text-base font-bold text-white mb-2">{stepInfo.label}</p>
            <p className="text-sm text-slate-300">{stepInfo.description}</p>

            {currentStep === "cross-search" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-300">
                <Search className="w-4 h-4" />
                <code className="font-mono">search_messages_product(&quot;auth refactor&quot;)</code>
              </div>
            )}
            {currentStep === "cross-message" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-300">
                <Mail className="w-4 h-4" />
                <span>GreenCastle</span>
                <ArrowRight className="w-3 h-3" />
                <span>RedBear@frontend</span>
              </div>
            )}
            {(currentStep === "contact-request" || currentStep === "contact-approved") && (
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-300">
                <UserCheck className="w-4 h-4" />
                <span>
                  {currentStep === "contact-request"
                    ? "Pending approval..."
                    : "Approved — bidirectional messaging enabled"}
                </span>
              </div>
            )}
            {currentStep === "contact-denied" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-300">
                <UserCheck className="w-4 h-4" />
                <span>Denied — contact_policy: deny_all</span>
              </div>
            )}
          </motion.article>
        </AnimatePresence>

        {/* Capabilities panel */}
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
            Cross-Project Capabilities
          </p>
          <div className="space-y-2">
            {[
              { icon: Network, label: "Product linking", desc: "Group repos under shared products" },
              { icon: Search, label: "Unified search", desc: "Query all linked repos at once" },
              { icon: Mail, label: "Cross-project mail", desc: "Address agents by name@project" },
              { icon: UserCheck, label: "Contact governance", desc: "Approve/deny inter-agent messaging" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-300">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-2 rounded-lg border border-white/5 bg-black/30">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
              Contact Policies
            </p>
            <div className="space-y-1 text-xs text-slate-400">
              <p><code className="text-green-300">auto</code> — auto-approve all requests</p>
              <p><code className="text-blue-300">approve_all</code> — require explicit approval</p>
              <p><code className="text-red-300">deny_all</code> — reject all requests</p>
            </div>
          </div>
        </article>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <VizControlButton tone="neutral" onClick={handlePrev} disabled={stepIdx === 0}>
          Previous
        </VizControlButton>
        <VizControlButton tone="blue" onClick={handleNext} disabled={stepIdx >= STEP_ORDER.length - 1}>
          Next
        </VizControlButton>
        <VizControlButton tone="neutral" onClick={handleReset}>
          Reset
        </VizControlButton>
      </div>
    </VizSurface>
  );
}
