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
import { Cpu, ShieldAlert, CheckCircle2, Lock, LockOpen, Cog, Terminal } from "lucide-react";

type BuildState = "idle" | "agent1_req" | "agent1_building" | "agent2_req" | "agent2_blocked" | "agent1_done" | "agent2_building" | "agent2_done";

export default function BuildSlotCoordinatorViz() {
  const prefersReducedMotion = useVizReducedMotion();
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
      default: break;
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
      default: return "";
    }
  };

  const isBuilding1 = ["agent1_building", "agent2_req", "agent2_blocked"].includes(state);
  const isBuilding2 = ["agent2_building"].includes(state);
  const cpuLoad = isBuilding1 || isBuilding2 ? "High (98%)" : "Low (2%)";
  const cpuColor = isBuilding1 || isBuilding2 ? "text-orange-500" : "text-emerald-500";
  const cpuBg = isBuilding1 || isBuilding2 ? "bg-orange-500/10 border-orange-500/30" : "bg-emerald-500/10 border-emerald-500/30";

  return (
    <VizSurface aria-label="Build Slot Coordinator Mechanism">
      <VizHeader
        accent="amber"
        eyebrow="Resource Management"
        title="Advisory Build Slots"
        subtitle="Prevent heavy concurrent compilations from thrashing CPU or corrupting the Cargo target directory lock."
        controls={
          <VizControlButton tone="blue" onClick={advance}>
            {state === "agent2_done" ? "Reset Scenario" : "Next Step"}
          </VizControlButton>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="CPU Load" value={cpuLoad} tone={isBuilding1 || isBuilding2 ? "amber" : "green"} />
        <VizMetricCard label="Target Dir Lock" value={(isBuilding1 || isBuilding2) ? "Locked" : "Free"} tone={(isBuilding1 || isBuilding2) ? "amber" : "green"} />
        <VizMetricCard label="Active Builds" value={(isBuilding1 || isBuilding2) ? "1" : "0"} tone="blue" />
      </div>

      <div className="relative px-2 py-8 md:p-6 rounded-xl border border-slate-700/50 bg-[#0B1120] flex items-center justify-between mb-6 overflow-hidden min-h-[380px]">
        {/* GreenCastle (Left) */}
        <div className={`z-10 relative flex flex-col items-center p-3 md:p-5 rounded-2xl border-2 transition-all duration-500 w-28 md:w-48 shrink-0 ${isBuilding1 ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-slate-900/80 border-slate-700"}`}>
          <Terminal className={`w-8 h-8 md:w-10 md:h-10 mb-3 ${isBuilding1 ? "text-emerald-400" : "text-slate-500"}`} />
          <span className="font-black tracking-widest uppercase text-[10px] md:text-sm text-slate-200">GreenCastle</span>
          
          <div className="mt-4 h-8 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {state === "agent1_req" && (
                <motion.span key="req1" initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-blue-400 bg-blue-500/20 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-blue-500/30">Acquiring...</motion.span>
              )}
              {isBuilding1 && (
                <motion.div key="build1" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-emerald-500/30 w-full justify-center">
                  <Cog className="w-3 h-3 md:w-4 md:h-4 animate-spin shrink-0" /> <span className="hidden md:inline">cargo build</span>
                </motion.div>
              )}
              {state === "agent1_done" && (
                <motion.span key="done1" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-800 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" /> Released
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Connection Line Left */}
        <div className={`flex-1 h-1 transition-colors duration-500 mx-1 md:mx-4 relative overflow-hidden z-0 ${isBuilding1 ? "bg-emerald-500" : "bg-transparent border-dashed border-t border-slate-600"}`}>
           {isBuilding1 && !prefersReducedMotion && (
             <motion.div className="absolute inset-0 bg-white opacity-50" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
           )}
        </div>

        {/* Central Resource Node */}
        <div className={`relative z-20 flex flex-col items-center justify-center w-24 h-24 md:w-40 md:h-40 rounded-full border-4 transition-all duration-500 shrink-0 ${cpuBg}`}>
          <div className="absolute inset-0 rounded-full overflow-hidden">
             <div className={`w-full h-full opacity-20 ${isBuilding1 || isBuilding2 ? "bg-[repeating-radial-gradient(circle_at_center,transparent_0,transparent_10px,#f97316_10px,#f97316_20px)] animate-[spin_4s_linear_infinite]" : "bg-transparent"}`} />
          </div>
          <Cpu className={`w-8 h-8 md:w-12 md:h-12 mb-2 transition-colors duration-500 relative z-10 ${cpuColor}`} />
          <div className={`font-black text-sm md:text-lg relative z-10 ${cpuColor}`}>{cpuLoad}</div>
          
          <div className="absolute -bottom-6 md:-bottom-6 bg-slate-900 border border-slate-700 rounded-full px-2 py-0.5 md:px-3 md:py-1 flex items-center gap-1 md:gap-2 shadow-lg">
             {(isBuilding1 || isBuilding2) ? <Lock className="w-3 h-3 md:w-4 md:h-4 text-amber-500" /> : <LockOpen className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />}
             <span className="text-[10px] md:text-xs font-bold text-slate-300">target/</span>
          </div>
        </div>

        {/* Connection Line Right */}
        <div className={`flex-1 h-1 transition-colors duration-500 mx-1 md:mx-4 relative overflow-hidden z-0 ${isBuilding2 ? "bg-blue-500" : state === "agent2_blocked" ? "bg-amber-500" : "bg-transparent border-dashed border-t border-slate-600"}`}>
           {isBuilding2 && !prefersReducedMotion && (
             <motion.div className="absolute inset-0 bg-white opacity-50" animate={{ x: ["100%", "-100%"] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
           )}
           {state === "agent2_blocked" && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-amber-500 rounded flex items-center justify-center">
               <Lock className="w-3 h-3 text-black" />
             </div>
           )}
        </div>

        {/* BlueLake (Right) */}
        <div className={`z-10 relative flex flex-col items-center p-3 md:p-5 rounded-2xl border-2 transition-all duration-500 w-28 md:w-48 shrink-0 ${isBuilding2 ? "bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]" : state === "agent2_blocked" ? "bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]" : "bg-slate-900/80 border-slate-700"}`}>
          <Terminal className={`w-8 h-8 md:w-10 md:h-10 mb-3 ${isBuilding2 ? "text-blue-400" : state === "agent2_blocked" ? "text-amber-400" : "text-slate-500"}`} />
          <span className="font-black tracking-widest uppercase text-[10px] md:text-sm text-slate-200">BlueLake</span>
          
          <div className="mt-4 h-8 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {state === "agent2_req" && (
                <motion.span key="req2" initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-blue-400 bg-blue-500/20 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-blue-500/30">Acquiring...</motion.span>
              )}
              {state === "agent2_blocked" && (
                <motion.span key="block2" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-amber-400 bg-amber-500/20 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1 w-full justify-center">
                  <ShieldAlert className="w-3 h-3 shrink-0" /> Blocked
                </motion.span>
              )}
              {isBuilding2 && (
                <motion.div key="build2" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold text-blue-400 bg-blue-500/20 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-blue-500/30 w-full justify-center">
                  <Cog className="w-3 h-3 md:w-4 md:h-4 animate-spin shrink-0" /> <span className="hidden md:inline">cargo build</span>
                </motion.div>
              )}
              {state === "agent2_done" && (
                <motion.span key="done2" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-800 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" /> Released
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
        <p className="text-sm font-medium text-slate-300">{getStepText()}</p>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="amber"
        title="Why Advisory Build Slots?"
        items={[
          "Concurrent cargo builds corrupt the target directory lock and cause opaque compilation failures.",
          "Even if isolated, concurrent heavy compilations thrash the CPU, grinding the entire system to a halt.",
          "Build slots are advisory leases with a TTL. Agents check them before starting heavy operations.",
        ]}
      />
    </VizSurface>
  );
}
