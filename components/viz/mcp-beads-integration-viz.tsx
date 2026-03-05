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
import { CheckCircle2, GitMerge, MessageSquare, Lock, TerminalSquare, Share2 } from "lucide-react";

type PathMode = "standard" | "discovered";

export default function McpBeadsIntegrationViz() {
  const reducedMotion = useVizReducedMotion();
  const [pathMode, setPathMode] = useState<PathMode>("standard");

  return (
    <VizSurface aria-label="MCP Beads Integration">
      <VizHeader
        accent="violet"
        eyebrow="Execution Traceability"
        title="Bead-Centric Coordination Loop"
        subtitle="The same bead ID threads through planning, reservation ownership, message context, and completion evidence. Watch how the ID anchors the entire swarm."
        controls={
          <div className="flex gap-2">
            <VizControlButton
              tone={pathMode === "standard" ? "blue" : "neutral"}
              onClick={() => setPathMode("standard")}
            >
              Standard Path
            </VizControlButton>
            <VizControlButton
              tone={pathMode === "discovered" ? "amber" : "neutral"}
              onClick={() => setPathMode("discovered")}
            >
              Discovered Work
            </VizControlButton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="Anchor" value="br-123" tone="blue" />
        <VizMetricCard label="Thread ID" value="br-123" tone="blue" />
        <VizMetricCard label="Reservation Reason" value="br-123" tone="amber" />
      </div>

      <div className="relative p-6 rounded-xl border border-slate-700/50 bg-[#0B1120] flex flex-col items-center justify-center min-h-[400px] mb-4 overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

        {/* Central Anchor Node */}
        <div className="relative z-20 flex flex-col items-center justify-center mb-12 mt-4">
          <motion.div 
            className="w-24 h-24 rounded-full border-4 border-violet-500/50 bg-violet-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)] backdrop-blur-sm"
            animate={reducedMotion ? {} : { boxShadow: ["0 0 20px rgba(139,92,246,0.2)", "0 0 60px rgba(139,92,246,0.6)", "0 0 20px rgba(139,92,246,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Share2 className="w-10 h-10 text-violet-400" />
          </motion.div>
          <div className="absolute -bottom-4 bg-slate-900 border border-slate-700 rounded-full px-4 py-1.5 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span className="font-black tracking-widest text-sm text-violet-300">br-123</span>
          </div>
        </div>

        {/* Orbiting Elements */}
        <div className="relative w-full max-w-3xl h-48 flex justify-between items-center px-4 md:px-12 mt-4">
          
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" style={{ overflow: "visible" }} preserveAspectRatio="none">
             <path d="M 50 0 Q 20 50 15 100" fill="none" stroke="url(#grad1)" strokeWidth="2" strokeDasharray="6 6" className="opacity-50" />
             <path d="M 50 0 Q 50 50 50 100" fill="none" stroke="url(#grad2)" strokeWidth="2" strokeDasharray="6 6" className="opacity-50" />
             <path d="M 50 0 Q 80 50 85 100" fill="none" stroke="url(#grad3)" strokeWidth="2" strokeDasharray="6 6" className="opacity-50" />

             {!reducedMotion && (
               <>
                 {/* Particles */}
                 <motion.circle r="4" fill="#60A5FA" filter="blur(2px)">
                   <animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 Q 20 50 15 100" />
                 </motion.circle>
                 <motion.circle r="4" fill="#A78BFA">
                   <animateMotion dur="2s" repeatCount="indefinite" path="M 50 0 Q 50 50 50 100" />
                 </motion.circle>
                 <motion.circle r="4" fill="#FBBF24" filter="blur(2px)">
                   <animateMotion dur="3s" repeatCount="indefinite" path="M 50 0 Q 80 50 85 100" />
                 </motion.circle>
               </>
             )}

             <defs>
               <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#8B5CF6" />
                 <stop offset="100%" stopColor="#3B82F6" />
               </linearGradient>
               <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#8B5CF6" />
                 <stop offset="100%" stopColor="#A855F7" />
               </linearGradient>
               <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#8B5CF6" />
                 <stop offset="100%" stopColor="#F59E0B" />
               </linearGradient>
             </defs>
          </svg>

          {/* Left Node: Planning */}
          <div className="z-10 flex flex-col items-center translate-y-12">
            <div className="w-14 h-14 rounded-xl border border-blue-500/50 bg-blue-500/10 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <TerminalSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded p-2 text-center shadow-lg w-28">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Planning</p>
              <code className="text-[10px] text-blue-300">br ready</code>
            </div>
          </div>

          {/* Center Node: Messaging */}
          <div className="z-10 flex flex-col items-center translate-y-12">
            <div className="w-14 h-14 rounded-xl border border-violet-500/50 bg-violet-500/10 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <MessageSquare className="w-6 h-6 text-violet-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded p-2 text-center shadow-lg w-28">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Context</p>
              <code className="text-[10px] text-violet-300">thread_id</code>
            </div>
          </div>

          {/* Right Node: Locks */}
          <div className="z-10 flex flex-col items-center translate-y-12">
            <div className="w-14 h-14 rounded-xl border border-amber-500/50 bg-amber-500/10 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded p-2 text-center shadow-lg w-28">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Locks</p>
              <code className="text-[10px] text-amber-300">reason</code>
            </div>
          </div>

        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
           <h4 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
             <CheckCircle2 className="w-4 h-4 text-green-500" /> Standard Execution Path
           </h4>
           <div className="space-y-3">
             <div className="bg-black/50 border border-slate-700 rounded p-3 font-mono text-xs text-slate-400 flex justify-between items-center">
                <span>1. Select</span>
                <span className="text-blue-400">br ready --json</span>
             </div>
             <div className="bg-black/50 border border-slate-700 rounded p-3 font-mono text-xs text-slate-400 flex justify-between items-center">
                <span>2. Reserve</span>
                <span className="text-amber-400">reason=&quot;br-123&quot;</span>
             </div>
             <div className="bg-black/50 border border-slate-700 rounded p-3 font-mono text-xs text-slate-400 flex justify-between items-center">
                <span>3. Complete</span>
                <span className="text-green-400">br close br-123</span>
             </div>
           </div>
        </div>

        <div className={`rounded-xl border p-5 transition-all duration-500 ${pathMode === "discovered" ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800 bg-slate-900/50 opacity-50 grayscale"}`}>
           <h4 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
             <GitMerge className={`w-4 h-4 ${pathMode === "discovered" ? "text-amber-500" : "text-slate-500"}`} /> Discovered Work Path
           </h4>
           <div className="space-y-3">
             <div className="bg-black/50 border border-slate-700 rounded p-3 font-mono text-xs text-slate-400">
                Agent discovers out-of-scope bug while working on <span className="text-violet-400">br-123</span>.
             </div>
             <div className="bg-black/50 border border-slate-700 rounded p-3 font-mono text-xs text-slate-400 flex flex-col gap-2">
                <span>Instead of ignoring it or silently fixing it:</span>
                <span className="text-amber-400">br create &quot;Auth bug&quot; --deps discovered-from:br-123</span>
             </div>
           </div>
        </div>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="violet"
        title="Pedagogical Takeaways"
        items={[
          "One bead ID becomes the shared semantic key across planning, messaging, and locks.",
          "Threaded updates prevent communication drift when multiple agents touch adjacent scopes.",
          "Discovered-work linking preserves causality instead of creating orphan follow-up tasks.",
        ]}
      />
    </VizSurface>
  );
}