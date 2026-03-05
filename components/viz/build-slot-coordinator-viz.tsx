"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface
} from "@/components/viz/viz-framework";
import { Cpu, Terminal, ShieldAlert, CheckCircle2, Lock, LockOpen, Server, Hammer } from "lucide-react";

type BuildState = "idle" | "agent1_req" | "agent1_building" | "agent2_req" | "agent2_blocked" | "agent1_done" | "agent2_building" | "agent2_done";

export default function BuildSlotCoordinatorViz() {
  const [state, setState] = useState<BuildState>("idle");

  const advance = () => {
    switch (state) {
      case "idle": setState("agent1_req"); break;
      case "agent1_req": setState("agent1_building"); break;
      case "agent1_building": setState("agent2_req"); break;
      case "agent2_req": setState("agent2_blocked"); break;
      case "agent2_blocked": setState("agent1_done"); break;
      case "agent1_done": setState("agent2_building"); break;
      case "agent2_building": setState("agent2_done"); break;
      case "agent2_done": setState("idle"); break;
    }
  };

  const getStepText = () => {
    switch (state) {
      case "idle": return "System is idle. CPU resources and the build directory are free.";
      case "agent1_req": return "GreenCastle needs to compile the project. It calls acquire_build_slot().";
      case "agent1_building": return "Slot granted. GreenCastle begins cargo build. CPU load increases.";
      case "agent2_req": return "BlueLake also needs to compile and requests a build slot.";
      case "agent2_blocked": return "Slot denied! BlueLake receives an advisory conflict to prevent Cargo lock contention and CPU thrashing.";
      case "agent1_done": return "GreenCastle finishes compilation and calls release_build_slot().";
      case "agent2_building": return "BlueLake retries, acquires the slot, and begins its build safely.";
      case "agent2_done": return "BlueLake finishes. System returns to idle.";
    }
  };

  const isBuilding1 = ["agent1_building", "agent2_req", "agent2_blocked"].includes(state);
  const isBuilding2 = ["agent2_building"].includes(state);
  const cpuLoad = isBuilding1 || isBuilding2 ? "High (98%)" : "Low (2%)";
  const cpuColor = isBuilding1 || isBuilding2 ? "text-orange-500" : "text-emerald-500";

  return (
    <VizSurface aria-label="Build Slot Coordinator Mechanism">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white">Build Slot Coordination</h3>
        <p className="mt-2 text-sm text-slate-400">
          Agents use advisory build slots to prevent CPU thrashing and dependency lock contention during heavy compilations.
        </p>
      </div>

      <div className="relative p-6 rounded-xl border border-slate-700/50 bg-black/40 flex flex-col items-center justify-center mb-6 overflow-hidden">
        {/* System Resource Monitor */}
        <div className="flex items-center justify-between w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-4 mb-8 z-10">
          <div className="flex items-center gap-3">
            <Cpu className={`w-8 h-8 ${cpuColor} transition-colors duration-500`} />
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">CPU Load</div>
              <div className={`text-lg font-mono font-bold ${cpuColor} transition-colors duration-500`}>{cpuLoad}</div>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Dir</div>
              <div className="text-sm font-bold text-slate-200 flex items-center gap-1">
                {(isBuilding1 || isBuilding2) ? <Lock className="w-4 h-4 text-amber-500" /> : <LockOpen className="w-4 h-4 text-emerald-500" />}
                {(isBuilding1 || isBuilding2) ? "Locked" : "Unlocked"}
              </div>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="flex justify-between w-full max-w-lg z-10 relative">
          
          {/* GreenCastle */}
          <div className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300 w-40 ${isBuilding1 ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-slate-900/80 border-slate-800"}`}>
            <Terminal className={`w-8 h-8 mb-2 ${isBuilding1 ? "text-emerald-400" : "text-slate-500"}`} />
            <span className="font-bold text-slate-200">GreenCastle</span>
            
            <div className="mt-3 h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {state === "agent1_req" && (
                  <motion.span key="req1" initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="text-[10px] uppercase tracking-widest font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded">Acquiring...</motion.span>
                )}
                {isBuilding1 && (
                  <motion.span key="build1" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Hammer className="w-3 h-3" /> cargo build
                  </motion.span>
                )}
                {state === "agent1_done" && (
                  <motion.span key="done1" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Released
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Connection paths */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center opacity-30 pointer-events-none -z-10">
            <svg width="300" height="100" viewBox="0 0 300 100" fill="none">
              <path d="M 50 50 Q 150 -20 250 50" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="4 4" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* BlueLake */}
          <div className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300 w-40 ${isBuilding2 ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : state === "agent2_blocked" ? "bg-amber-500/10 border-amber-500/50" : "bg-slate-900/80 border-slate-800"}`}>
            <Terminal className={`w-8 h-8 mb-2 ${isBuilding2 ? "text-blue-400" : state === "agent2_blocked" ? "text-amber-400" : "text-slate-500"}`} />
            <span className="font-bold text-slate-200">BlueLake</span>
            
            <div className="mt-3 h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {state === "agent2_req" && (
                  <motion.span key="req2" initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="text-[10px] uppercase tracking-widest font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded">Acquiring...</motion.span>
                )}
                {state === "agent2_blocked" && (
                  <motion.span key="block2" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="text-[10px] uppercase tracking-widest font-bold text-amber-400 bg-amber-500/20 px-2 py-1 rounded flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Blocked
                  </motion.span>
                )}
                {isBuilding2 && (
                  <motion.span key="build2" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="text-xs font-bold text-blue-400 flex items-center gap-1">
                    <Hammer className="w-3 h-3" /> cargo build
                  </motion.span>
                )}
                {state === "agent2_done" && (
                  <motion.span key="done2" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Released
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
        <p className="text-sm font-medium text-slate-300">{getStepText()}</p>
        <VizControlButton tone="blue" onClick={advance}>
          {state === "agent2_done" ? "Reset" : "Next Step"}
        </VizControlButton>
      </div>
    </VizSurface>
  );
}
