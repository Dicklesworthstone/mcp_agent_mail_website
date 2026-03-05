"use client";

import { useState } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion
} from "@/components/viz/viz-framework";
import { Mail, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";

type HandshakeState = "unconnected" | "request" | "pending" | "accepted" | "messaging";

export default function AgentHandshakeViz() {
  const [state, setState] = useState<HandshakeState>("unconnected");
  const reducedMotion = useVizReducedMotion();
  
  const advance = () => {
    switch(state) {
      case "unconnected": setState("request"); break;
      case "request": setState("pending"); break;
      case "pending": setState("accepted"); break;
      case "accepted": setState("messaging"); break;
      case "messaging": setState("unconnected"); break;
    }
  };

  const getStatusText = () => {
    switch(state) {
      case "unconnected": return "Agents must explicitly request contact before messaging.";
      case "request": return "GreenCastle calls request_contact()";
      case "pending": return "Contact request queued. BlueLake receives notification.";
      case "accepted": return "BlueLake calls respond_contact(accept=true). Trust established.";
      case "messaging": return "Bi-directional send_message() is now permitted.";
    }
  }

  return (
    <VizSurface aria-label="Agent Contact Handshake">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white">Contact Handshake Protocol</h3>
        <p className="mt-2 text-sm text-slate-400">
          Agent Mail enforces consent-based communication to prevent inbox spam and unwanted distraction.
        </p>
      </div>

      <div className="relative h-48 mb-6 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between px-6 md:px-12 overflow-hidden">
        <div className="z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-2">
            <span className="font-bold text-emerald-400">GC</span>
          </div>
          <span className="text-sm font-bold text-slate-300">GreenCastle</span>
        </div>

        {/* Connection Line */}
        <div className="absolute left-24 right-24 md:left-32 md:right-32 h-1 bg-slate-800 top-1/2 -translate-y-1/2 rounded-full overflow-hidden">
          {state === "request" && (
             <motion.div initial={{x: "-100%"}} animate={{x: "100%"}} transition={{duration: reducedMotion ? 0 : 1.5, repeat: Infinity}} className="h-full w-1/2 bg-gradient-to-r from-transparent to-amber-500" />
          )}
          {state === "accepted" && (
             <motion.div initial={{x: "100%"}} animate={{x: "-100%"}} transition={{duration: reducedMotion ? 0 : 1.5}} className="h-full w-1/2 bg-gradient-to-l from-transparent to-blue-500" />
          )}
          {state === "messaging" && (
             <div className="h-full w-full bg-green-500/50" />
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
            {state === "pending" && <UserCheck className="w-5 h-5 text-amber-500" />}
            {state === "accepted" && <ShieldCheck className="w-5 h-5 text-green-500" />}
            {state === "messaging" && <Mail className="w-5 h-5 text-green-500" />}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
        <p className="text-sm font-medium text-slate-300">{getStatusText()}</p>
        <VizControlButton tone="green" onClick={advance}>
          {state === "messaging" ? "Reset" : "Next"}
        </VizControlButton>
      </div>
    </VizSurface>
  );
}
