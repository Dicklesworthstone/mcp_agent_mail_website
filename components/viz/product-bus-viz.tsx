"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { Network, FolderGit, Package, Mail, Search, UserCheck, ShieldAlert, ShieldCheck } from "lucide-react";

/* ---------- data ---------- */

interface Project {
  id: string;
  name: string;
  path: string;
  agents: string[];
  color: string;
}

interface ProductLink {
  productName: string;
  projects: Project[];
}

const PRODUCT: ProductLink = {
  productName: "acme-platform",
  projects: [
    { id: "backend", name: "Backend API", path: "/data/projects/backend", agents: ["GreenCastle", "BlueLake"], color: "#3B82F6" },
    { id: "frontend", name: "Frontend App", path: "/data/projects/frontend", agents: ["RedBear"], color: "#EF4444" },
    { id: "infra", name: "Infrastructure", path: "/data/projects/infra", agents: ["SilverOwl"], color: "#8B5CF6" },
  ],
};

type DemoStep =
  | "idle"
  | "link"
  | "cross-search"
  | "contact-request"
  | "contact-approved"
  | "contact-denied"
  | "cross-message";

interface StepInfo {
  label: string;
  description: string;
  highlight: string[];
  activeLink?: [string, string];
  particles?: boolean;
}

const STEPS: Record<DemoStep, StepInfo> = {
  idle: {
    label: "Isolated Repositories",
    description: "Three separate repos exist on disk. By default, they have no shared context. Agents cannot see each other's messages.",
    highlight: [],
  },
  link: {
    label: "Establish Product Bus",
    description: "The operator creates a product and links the repos. This enables cross-project operations like unified search and inbox aggregation.",
    highlight: ["backend", "frontend", "infra"],
    particles: true,
  },
  "cross-search": {
    label: "Cross-Project Search",
    description: "An agent issues `search_messages_product`. The query broadcasts across the bus, federating hits from all linked repos.",
    highlight: ["backend", "frontend", "infra"],
    particles: true,
  },
  "contact-request": {
    label: "Contact Request",
    description: "Before messaging across projects, agents must establish a contact relationship. GreenCastle sends a contact request to RedBear.",
    highlight: ["backend", "frontend"],
    activeLink: ["backend", "frontend"],
  },
  "contact-denied": {
    label: "Contact Denied (Policy Block)",
    description: "Alternate outcome: with policy set to 'deny_all', the request is rejected. Cross-project messaging remains blocked.",
    highlight: ["backend", "frontend"],
    activeLink: ["backend", "frontend"],
  },
  "contact-approved": {
    label: "Contact Approved",
    description: "RedBear approves the contact request. A persistent trust link is established in the graph.",
    highlight: ["backend", "frontend"],
    activeLink: ["backend", "frontend"],
  },
  "cross-message": {
    label: "Cross-Project Messaging",
    description: "After approval, GreenCastle@backend can send a thread message directly to RedBear@frontend.",
    highlight: ["backend", "frontend"],
    activeLink: ["backend", "frontend"],
    particles: true,
  },
};

const STEP_ORDER: DemoStep[] = [
  "idle",
  "link",
  "cross-search",
  "contact-request",
  "contact-denied",
  "contact-approved",
  "cross-message",
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
      <VizHeader
        accent="amber"
        eyebrow="Cross-Project Federation"
        title="Product Bus + Governance"
        subtitle="Follow how multi-repo linking enables cross-project search and messaging while still enforcing strict contact policy gates."
        controls={
          <div className="flex gap-2">
            <VizControlButton tone="neutral" onClick={handlePrev} disabled={stepIdx === 0}>
              Previous
            </VizControlButton>
            <VizControlButton tone="amber" onClick={handleNext} disabled={stepIdx >= STEP_ORDER.length - 1}>
              Next Step
            </VizControlButton>
            <VizControlButton tone="neutral" onClick={handleReset}>
              Reset
            </VizControlButton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="Current Step" value={`${stepIdx + 1}/${STEP_ORDER.length}`} tone="neutral" />
        <VizMetricCard label="Projects Linked" value={currentStep === "idle" ? "0" : PRODUCT.projects.length} tone={currentStep === "idle" ? "neutral" : "amber"} />
        <VizMetricCard label="Global Roster" value={PRODUCT.projects.reduce((n, p) => n + p.agents.length, 0)} tone="blue" />
      </div>

      <div className="relative rounded-xl border border-slate-700/50 bg-[#0B1120] p-6 mb-6 overflow-hidden min-h-[400px] flex flex-col justify-center">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

        {/* Central Product Bus Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
           <AnimatePresence>
             {currentStep !== "idle" && (
                <motion.div
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="w-32 h-32 rounded-full bg-orange-500/10 border-4 border-orange-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.2)] backdrop-blur-md"
                >
                  <Package className="w-10 h-10 text-orange-400" />
                  <div className="absolute -bottom-6 bg-slate-900 border border-slate-700 rounded-full px-3 py-1 shadow-lg whitespace-nowrap">
                    <span className="text-[10px] font-black tracking-widest text-orange-300 uppercase">Product Bus</span>
                  </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Repositories */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 w-full px-4 md:px-8 max-w-4xl mx-auto h-[300px]">
          
          {/* Connection Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
             {PRODUCT.projects.map((proj, i) => {
               // Approximate positions
               const startX = i === 0 ? "15%" : i === 1 ? "50%" : "85%";
               const startY = i === 1 ? "20%" : "80%";
               const endX = "50%";
               const endY = "50%";
               const isHighlighted = currentStep !== "idle" && stepInfo.highlight.includes(proj.id);
               const isLinkActive = currentStep !== "idle";

               return (
                 <g key={proj.id}>
                   {isLinkActive && (
                     <path
                       d={`M ${startX} ${startY} L ${endX} ${endY}`}
                       fill="none"
                       stroke={isHighlighted ? proj.color : "#334155"}
                       strokeWidth={isHighlighted ? "2" : "1"}
                       strokeDasharray="4 4"
                       className="transition-colors duration-500"
                     />
                   )}
                   {isLinkActive && isHighlighted && stepInfo.particles && !reducedMotion && (
                     <motion.circle r="3" fill={proj.color} filter="blur(1px)">
                       <animateMotion dur={currentStep === "cross-search" ? "1s" : "2s"} repeatCount="indefinite" path={`M ${startX} ${startY} L ${endX} ${endY}`} />
                     </motion.circle>
                   )}
                   {isLinkActive && isHighlighted && stepInfo.particles && !reducedMotion && currentStep === "cross-search" && (
                     <motion.circle r="3" fill={proj.color} filter="blur(1px)">
                       <animateMotion dur="1s" repeatCount="indefinite" path={`M ${endX} ${endY} L ${startX} ${startY}`} />
                     </motion.circle>
                   )}
                 </g>
               );
             })}

             {/* Direct Contact Links */}
             {stepInfo.activeLink && (
                <path
                  d="M 15% 80% L 50% 20%" // Backend to Frontend
                  fill="none"
                  stroke={currentStep === "contact-denied" ? "#EF4444" : currentStep === "contact-approved" || currentStep === "cross-message" ? "#22C55E" : "#F59E0B"}
                  strokeWidth="3"
                  strokeDasharray={currentStep === "cross-message" ? "none" : "6 6"}
                  className="transition-colors duration-500"
                />
             )}
             {stepInfo.activeLink && currentStep === "cross-message" && !reducedMotion && (
               <motion.circle r="4" fill="#22C55E">
                 <animateMotion dur="1.5s" repeatCount="indefinite" path="M 15% 80% L 50% 20%" />
               </motion.circle>
             )}
          </svg>

          {PRODUCT.projects.map((proj, i) => {
            const isHighlighted = stepInfo.highlight.includes(proj.id);
            const isTarget = currentStep === "contact-request" && proj.id === "frontend";
            const isDenied = currentStep === "contact-denied" && proj.id === "frontend";
            const isApproved = (currentStep === "contact-approved" || currentStep === "cross-message") && proj.id === "frontend";

            return (
              <div
                key={proj.id}
                className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-500 w-40 ${i === 1 ? "-translate-y-24" : "translate-y-24"}`}
                style={{
                  borderColor: isHighlighted ? proj.color : "#334155",
                  background: isHighlighted ? `${proj.color}15` : "#0F172A",
                  boxShadow: isHighlighted ? `0 0 20px ${proj.color}30` : "none"
                }}
              >
                <FolderGit className="w-8 h-8 mb-2" style={{ color: isHighlighted ? proj.color : "#64748B" }} />
                <span className="text-xs font-black text-white">{proj.name}</span>
                <span className="text-[9px] font-mono text-slate-500 mb-3">{proj.path.split('/').pop()}</span>
                
                <div className="flex flex-col gap-1 w-full">
                  {proj.agents.map((agent) => (
                    <div
                      key={agent}
                      className="text-[9px] font-bold px-2 py-1 rounded text-center border"
                      style={{ 
                        backgroundColor: "#00000040",
                        borderColor: isHighlighted ? `${proj.color}50` : "#334155",
                        color: isHighlighted ? "#F1F5F9" : "#94A3B8"
                      }}
                    >
                      {agent}
                    </div>
                  ))}
                </div>

                {/* Overlays for Contact Flow */}
                <AnimatePresence>
                  {isTarget && (
                    <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                      <UserCheck className="w-4 h-4 text-black" />
                    </motion.div>
                  )}
                  {isDenied && (
                    <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                      <ShieldAlert className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                  {isApproved && (
                    <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/30 p-5 min-h-[140px] flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            Action Log
          </p>
          <p className="text-lg font-bold text-white leading-tight mb-2">{stepInfo.label}</p>
          <p className="text-sm text-slate-300">{stepInfo.description}</p>
        </article>

        {/* Capabilities panel */}
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
            Cross-Project Capabilities
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Network, label: "Product link", desc: "Group repos" },
              { icon: Search, label: "Unified search", desc: "Federated FTS5" },
              { icon: Mail, label: "Cross-mail", desc: "Name@project" },
              { icon: UserCheck, label: "Governance", desc: "Strict policies" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col gap-1 bg-slate-900 border border-slate-800 p-2 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">{label}</span>
                </div>
                <span className="text-[9px] text-slate-500 pl-5">{desc}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="amber"
        title="Pedagogical Takeaways"
        items={[
          "Product linking expands retrieval/messaging scope without merging repo boundaries or polluting git history.",
          "Contact policy is an explicit governance layer. Agents cannot spam other projects without an approved handshake.",
          "Cross-project workflows remain auditable because message and policy events are first-class records in the sender's DB.",
        ]}
      />
    </VizSurface>
  );
}