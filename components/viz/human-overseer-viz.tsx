"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion
} from "@/components/viz/viz-framework";
import { UserCog, Bot, PauseCircle, PlayCircle, AlertOctagon } from "lucide-react";

type OverseerState = "working" | "injecting" | "received" | "paused" | "resumed";

export default function HumanOverseerViz() {
  const [state, setState] = useState<OverseerState>("working");
  const reducedMotion = useVizReducedMotion();

  const advance = () => {
    switch(state) {
      case "working": setState("injecting"); break;
      case "injecting": setState("received"); break;
      case "received": setState("paused"); break;
      case "paused": setState("resumed"); break;
      case "resumed": setState("working"); break;
    }
  };

  const getStepText = () => {
    switch(state) {
      case "working": return "Agent RedBear is autonomously refactoring a module.";
      case "injecting": return "The Human Overseer uses the Web UI to inject an 'Urgent' message directly to RedBear.";
      case "received": return "The message drops into the agent's inbox, bypassing normal contact policies.";
      case "paused": return "RedBear detects the urgent override, pauses its current task, and handles the human's request.";
      case "resumed": return "After completing the human's request, RedBear resumes the original task.";
    }
  };

  return (
    <VizSurface aria-label="Human Overseer Control Mechanism">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white">Human Overseer Injection</h3>
        <p className="mt-2 text-sm text-slate-400">
          Operators can inject high-priority messages into an active agent&apos;s inbox via the Web UI to gracefully redirect work mid-session.
        </p>
      </div>

      <div className="relative p-8 rounded-xl border border-slate-700/50 bg-[#0B1120] flex flex-col items-center justify-between min-h-[320px] mb-6">
        
        {/* Human Overseer */}
        <div className="flex flex-col items-center z-10">
          <div className="w-14 h-14 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <UserCog className="w-7 h-7 text-indigo-400" />
          </div>
          <span className="mt-2 font-bold text-sm text-slate-200">Human Operator</span>
          <span className="text-[10px] text-slate-500 font-mono">Web UI (/mail)</span>
        </div>

        {/* The message payload animation */}
        <div className="absolute top-[100px] bottom-[100px] w-0.5 bg-slate-800/50 z-0">
          <AnimatePresence>
            {state === "injecting" && (
              <motion.div 
                initial={{ top: 0, opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: reducedMotion ? 0 : 1.5, ease: "easeInOut" }}
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
              >
                <div className="w-1.5 h-12 bg-gradient-to-b from-transparent via-rose-500 to-rose-400 rounded-full" />
                <div className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30 whitespace-nowrap mt-1 flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                  <AlertOctagon className="w-3 h-3" /> URGENT OVERRIDE
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agent */}
        <div className="flex flex-col items-center z-10 mt-16">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-500 relative ${state === "paused" ? "bg-rose-500/10 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "bg-slate-800/50 border-slate-600"}`}>
            <Bot className={`w-8 h-8 ${state === "paused" ? "text-rose-400" : "text-slate-400"}`} />
            
            {/* Status indicator badge */}
            <div className="absolute -bottom-3 bg-black border border-slate-700 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap flex items-center gap-1">
              {(state === "working" || state === "injecting" || state === "received") && (
                <><PlayCircle className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-400">Refactoring (bd-12)</span></>
              )}
              {state === "paused" && (
                <><PauseCircle className="w-3 h-3 text-rose-500" /> <span className="text-rose-400">Handling Override</span></>
              )}
              {state === "resumed" && (
                <><PlayCircle className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-400">Resumed (bd-12)</span></>
              )}
            </div>
          </div>
          <span className="mt-5 font-bold text-sm text-slate-300">RedBear</span>
        </div>

      </div>

      <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
        <p className="text-sm font-medium text-slate-300">{getStepText()}</p>
        <VizControlButton tone={state === "paused" ? "red" : "blue"} onClick={advance}>
          {state === "resumed" ? "Reset" : "Next Step"}
        </VizControlButton>
      </div>
    </VizSurface>
  );
}
