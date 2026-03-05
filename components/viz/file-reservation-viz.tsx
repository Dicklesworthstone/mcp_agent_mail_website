"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion
} from "@/components/viz/viz-framework";
import { Lock, LockOpen, User, FileCode, AlertTriangle, CheckCircle2 } from "lucide-react";

type ReservationState = "idle" | "req_blue" | "granted_blue" | "req_red" | "conflict_red" | "release_blue" | "granted_red";

export default function FileReservationViz() {
  const [state, setState] = useState<ReservationState>("idle");
  const reducedMotion = useVizReducedMotion();

  const getStepText = () => {
    switch (state) {
      case "idle": return "Both agents are idle. src/auth.ts is unlocked.";
      case "req_blue": return "BlueLake requests exclusive reservation for src/auth.ts.";
      case "granted_blue": return "Reservation granted. BlueLake holds the lock.";
      case "req_red": return "RedBear attempts to reserve src/auth.ts.";
      case "conflict_red": return "Conflict! RedBear receives advisory conflict and waits.";
      case "release_blue": return "BlueLake finishes editing and releases the reservation.";
      case "granted_red": return "RedBear retries and is granted the reservation.";
    }
  };

  const advance = () => {
    switch (state) {
      case "idle": setState("req_blue"); break;
      case "req_blue": setState("granted_blue"); break;
      case "granted_blue": setState("req_red"); break;
      case "req_red": setState("conflict_red"); break;
      case "conflict_red": setState("release_blue"); break;
      case "release_blue": setState("granted_red"); break;
      case "granted_red": setState("idle"); break;
    }
  };

  const isLockedByBlue = ["granted_blue", "req_red", "conflict_red"].includes(state);
  const isLockedByRed = state === "granted_red";

  return (
    <VizSurface aria-label="File Reservation Mechanism">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white">Advisory File Reservations</h3>
        <p className="mt-2 text-sm text-slate-400">
          Agents coordinate via MCP Agent Mail to prevent conflicting edits using TTL-based advisory locks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* BlueLake */}
        <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-colors ${state.includes("blue") ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-slate-900"}`}>
          <User className={`w-8 h-8 mb-2 ${state.includes("blue") ? "text-blue-400" : "text-slate-500"}`} />
          <h4 className="font-bold text-slate-200">BlueLake</h4>
          <p className="text-xs text-slate-400 mt-1">claude-code</p>
          {state === "req_blue" && <div className="mt-3 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Requesting Lock...</div>}
          {isLockedByBlue && <div className="mt-3 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Editing</div>}
        </div>

        {/* File */}
        <div className="p-4 rounded-xl border border-slate-700 bg-black flex flex-col items-center justify-center relative">
          <FileCode className="w-10 h-10 text-slate-300 mb-2" />
          <span className="font-mono text-sm text-slate-300">src/auth.ts</span>
          
          <AnimatePresence>
            {isLockedByBlue && (
              <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute top-2 right-2 text-blue-400">
                <Lock className="w-5 h-5" />
              </motion.div>
            )}
            {isLockedByRed && (
              <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute top-2 right-2 text-red-400">
                <Lock className="w-5 h-5" />
              </motion.div>
            )}
            {(!isLockedByBlue && !isLockedByRed) && (
              <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute top-2 right-2 text-slate-500">
                <LockOpen className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RedBear */}
        <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-colors ${state.includes("red") ? "border-red-500 bg-red-500/10" : "border-white/10 bg-slate-900"}`}>
          <User className={`w-8 h-8 mb-2 ${state.includes("red") ? "text-red-400" : "text-slate-500"}`} />
          <h4 className="font-bold text-slate-200">RedBear</h4>
          <p className="text-xs text-slate-400 mt-1">cursor</p>
          {state === "req_red" && <div className="mt-3 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">Requesting Lock...</div>}
          {state === "conflict_red" && <div className="mt-3 text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Blocked (Wait)</div>}
          {isLockedByRed && <div className="mt-3 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Editing</div>}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800">
        <p className="text-sm font-medium text-slate-300">{getStepText()}</p>
        <VizControlButton tone="blue" onClick={advance}>
          {state === "granted_red" ? "Reset" : "Next Step"}
        </VizControlButton>
      </div>
    </VizSurface>
  );
}
