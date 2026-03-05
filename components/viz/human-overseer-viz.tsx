"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion
} from "@/components/viz/viz-framework";
import { UserCog, Bot, PauseCircle, PlayCircle, AlertOctagon, ShieldAlert } from "lucide-react";

type OverseerState = "working" | "injecting" | "received" | "paused" | "resumed";

export default function HumanOverseerViz() {
  const reducedMotion = useVizReducedMotion();
  const [state, setState] = useState<OverseerState>("working");

  const advance = () => {
    switch(state) {
      case "working": setState("injecting"); break;
      case "injecting": setState("received"); break;
      case "received": setState("paused"); break;
      case "paused": setState("resumed"); break;
      case "resumed": setState("working"); break;
    }
  };

  const isUrgentActive = state === "injecting" || state === "received" || state === "paused";

  return (
    <VizSurface aria-label="Human Overseer Control Mechanism">
      <VizHeader
        accent="red"
        eyebrow="Agent Steering"
        title="Human Overseer Control"
        subtitle="Operators can safely halt and redirect autonomous agents mid-execution by injecting absolute-priority messages that bypass standard contact policies."
        controls={
          <VizControlButton tone={state === "paused" ? "red" : "blue"} onClick={advance}>
            {state === "resumed" ? "Reset Scenario" : "Next Step"}
          </VizControlButton>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="Agent State" value={state === "paused" ? "Suspended" : "Autonomous"} tone={state === "paused" ? "red" : "green"} />
        <VizMetricCard label="Active Task" value={state === "paused" ? "Human Override" : "bd-12 (Refactor)"} tone={state === "paused" ? "red" : "blue"} />
        <VizMetricCard label="Queue Depth" value={state === "paused" ? "0 (Blocked)" : "3 (Polling)"} tone={state === "paused" ? "amber" : "neutral"} />
      </div>

      <div className="relative p-6 rounded-xl border border-slate-700/50 bg-[#0B1120] flex flex-col md:flex-row items-center justify-between min-h-[360px] mb-4 overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

        {/* Human Overseer */}
        <div className="flex flex-col items-center z-10 w-full md:w-1/3 mb-10 md:mb-0">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isUrgentActive ? "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]"}`}>
            <UserCog className={`w-8 h-8 ${isUrgentActive ? "text-red-400" : "text-indigo-400"}`} />
          </div>
          <span className="mt-3 font-black tracking-widest uppercase text-xs text-slate-200">Human Operator</span>
          <span className="text-[10px] text-slate-500 font-mono mt-1 px-2 py-1 bg-slate-900 rounded border border-slate-800">Web UI (/mail)</span>
          
          <AnimatePresence>
            {state === "injecting" && (
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="mt-4 bg-red-950/50 border border-red-900 p-2 rounded-lg text-center"
               >
                 <div className="text-[10px] text-red-400 font-mono mb-1">priority: urgent</div>
                 <div className="text-xs text-slate-300">&quot;Stop refactoring and fix the auth bug immediately.&quot;</div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The message payload animation */}
        <div className="relative w-full md:w-1/3 h-32 md:h-full flex items-center justify-center z-0">
          {/* Default polling paths */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <div className="w-full border-t border-dashed border-slate-500" />
          </div>

          <AnimatePresence>
            {state === "injecting" && (
              <motion.div 
                initial={reducedMotion ? { opacity: 1, scale: 1 } : { x: -100, opacity: 0, scale: 0.8 }}
                animate={reducedMotion ? { opacity: 1, scale: 1 } : { x: 100, opacity: [0, 1, 1, 0], scale: 1 }}
                transition={{ duration: reducedMotion ? 0 : 1.5, ease: "easeInOut" }}
                className="absolute flex flex-col items-center bg-red-500/10 px-4 py-2 rounded-full border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-widest">
                  <ShieldAlert className="w-4 h-4" /> Override Payload
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agent */}
        <div className="flex flex-col items-center z-10 w-full md:w-1/3">
          <div className="relative mb-6">
            {/* Agent Inbox Queue */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-1">
               <div className="w-8 h-2 bg-slate-800 rounded-full border border-slate-700" />
               <div className="w-8 h-2 bg-slate-800 rounded-full border border-slate-700" />
               {(state === "received" || state === "paused") && (
                 <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="w-10 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-red-400 flex items-center justify-center">
                   <AlertOctagon className="w-2 h-2 text-white" />
                 </motion.div>
               )}
            </div>

            <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 relative ${state === "paused" ? "bg-red-500/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "bg-slate-800/50 border-slate-600 shadow-xl"}`}>
              <Bot className={`w-10 h-10 transition-colors duration-500 ${state === "paused" ? "text-red-400" : "text-slate-400"}`} />
              
              {/* Internal processing indicator */}
              <div className="absolute inset-2 border border-white/5 rounded-xl overflow-hidden">
                 <div className={`w-full h-full opacity-20 ${state === "paused" ? "bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#ef4444_5px,#ef4444_10px)]" : "bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#3b82f6_5px,#3b82f6_10px)] animate-[pan_20s_linear_infinite]"}`} />
              </div>

              {/* Status indicator badge */}
              <div className="absolute -bottom-4 bg-black border border-slate-700 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-lg">
                {(state === "working" || state === "injecting" || state === "received") && (
                  <><PlayCircle className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-400">Refactoring (bd-12)</span></>
                )}
                {state === "paused" && (
                  <><PauseCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" /> <span className="text-red-400">Handling Override</span></>
                )}
                {state === "resumed" && (
                  <><PlayCircle className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-400">Resumed (bd-12)</span></>
                )}
              </div>
            </div>
          </div>
          <span className="mt-2 font-black tracking-widest uppercase text-xs text-slate-300">RedBear</span>
          <span className="text-[10px] text-slate-500 font-mono mt-1 px-2 py-1 bg-slate-900 rounded border border-slate-800">Agent Mail Client</span>
        </div>

      </div>

      <VizLearningBlock
        accent="red"
        title="Why This Matters"
        items={[
          "Without an overseer mechanism, you must SIGKILL an agent to change its objective, losing its context and state.",
          "Urgent messages bypass all automated contact policies (like 'block_all' or 'contacts_only'), guaranteeing delivery.",
          "The agent's run loop natively intercepts urgent inbox items before popping the next standard task.",
        ]}
      />
    </VizSurface>
  );
}