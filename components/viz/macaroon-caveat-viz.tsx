"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ShieldAlert, ShieldCheck, Lock, Plus, Server } from "lucide-react";

type Caveat = "read-only" | "time-limit" | "domain-restrict" | "max-uses";

export default function MacaroonCaveatViz() {
  const [activeCaveats, setActiveCaveats] = useState<Set<Caveat>>(new Set());
  const [attemptState, setAttemptState] = useState<"idle" | "checking" | "allowed" | "blocked">("idle");

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const toggleCaveat = (c: Caveat) => {
    if (attemptState !== "idle") return;
    const next = new Set(activeCaveats);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setActiveCaveats(next);
  };

  const simulateAttempt = (type: "safe" | "malicious") => {
    if (attemptState !== "idle") return;
    clearTimers();
    setAttemptState("checking");

    const t1 = setTimeout(() => {
      // Logic: If malicious, it gets blocked IF the right caveats are in place.
      // For the viz, if it's a "malicious" attempt (e.g. POST to evil.com), 
      // the 'domain-restrict' or 'read-only' caveat will block it.
      let blocked = false;
      
      if (type === "malicious") {
        if (activeCaveats.has("domain-restrict") || activeCaveats.has("read-only") || activeCaveats.has("time-limit")) {
           blocked = true;
        }
      }

      setAttemptState(blocked ? "blocked" : "allowed");

      const t2 = setTimeout(() => {
         setAttemptState("idle");
      }, 2500);
      timersRef.current.push(t2);
    }, 800);
    timersRef.current.push(t1);
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Macaroon Capability Tokens</h3>
          <p className="text-sm text-slate-400 mt-1">
            Pass attenuated capabilities to child tasks. They can add restrictions, but never remove them.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
        
        {/* Parent Task */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-white/5 bg-slate-900/30 rounded-xl relative">
          <div className="absolute top-2 left-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Parent Task</div>
          
          <div className="mt-4 h-16 w-16 rounded-full bg-blue-900/40 border-2 border-blue-500 flex items-center justify-center mb-3">
             <Server className="h-8 w-8 text-blue-400" />
          </div>
          
          <div className="bg-[#020a14] border border-blue-500/30 rounded-lg p-3 w-full text-center">
             <div className="text-xs font-bold text-blue-400 mb-1 flex items-center justify-center gap-1.5">
                <Key className="h-3 w-3" /> Master NetCap
             </div>
             <div className="text-[9px] text-slate-400 font-mono">Permissions: <span className="text-green-400">ALL</span></div>
          </div>
        </div>

        {/* Delegation / Attenuation */}
        <div className="md:col-span-4 flex flex-col items-center justify-center relative py-8 md:py-0">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -translate-y-1/2 -z-10" />
          <div className="md:hidden absolute left-1/2 top-0 w-0.5 h-full bg-slate-700 -translate-x-1/2 -z-10" />
          
          <div className="bg-[#020a14] border border-slate-600 rounded-xl p-3 z-10 w-full max-w-[200px] shadow-xl">
             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3">
                Apply Caveats
             </div>
             <div className="space-y-2">
                <CaveatToggle id="domain-restrict" label="Domain: api.com" active={activeCaveats.has("domain-restrict")} onClick={() => toggleCaveat("domain-restrict")} disabled={attemptState !== "idle"} />
                <CaveatToggle id="read-only" label="Methods: GET only" active={activeCaveats.has("read-only")} onClick={() => toggleCaveat("read-only")} disabled={attemptState !== "idle"} />
                <CaveatToggle id="time-limit" label="Expires in 50ms" active={activeCaveats.has("time-limit")} onClick={() => toggleCaveat("time-limit")} disabled={attemptState !== "idle"} />
             </div>
          </div>
        </div>

        {/* Child Task */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-white/5 bg-slate-900/30 rounded-xl relative">
          <div className="absolute top-2 left-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Untrusted Worker</div>
          
          <div className="mt-4 bg-[#020a14] border border-blue-500/30 rounded-lg p-3 w-full mb-6">
             <div className="text-xs font-bold text-blue-400 mb-2 flex items-center justify-center gap-1.5">
                <Key className="h-3 w-3" /> Attenuated Token
             </div>
             <div className="flex flex-wrap gap-1 justify-center min-h-[24px]">
                {activeCaveats.size === 0 && <span className="text-[9px] text-slate-500 italic">No restrictions added</span>}
                {activeCaveats.has("domain-restrict") && <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 rounded">DomainLock</span>}
                {activeCaveats.has("read-only") && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 rounded">ReadOnly</span>}
                {activeCaveats.has("time-limit") && <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 rounded">Deadline</span>}
             </div>
          </div>

          <div className="flex w-full gap-2 relative">
             <button 
                onClick={() => simulateAttempt("safe")}
                disabled={attemptState !== "idle"}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 py-2 rounded transition-colors disabled:opacity-50"
             >
                GET api.com
             </button>
             <button 
                onClick={() => simulateAttempt("malicious")}
                disabled={attemptState !== "idle"}
                className="flex-1 bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-[10px] font-bold text-red-400 py-2 rounded transition-colors disabled:opacity-50"
             >
                POST evil.com
             </button>
             
             {/* Verification Overlay */}
             <AnimatePresence>
                {attemptState !== "idle" && (
                   <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center border border-white/10"
                   >
                      {attemptState === "checking" && <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1" />}
                      {attemptState === "allowed" && <ShieldCheck className="h-6 w-6 text-green-500 mb-1" />}
                      {attemptState === "blocked" && <ShieldAlert className="h-6 w-6 text-red-500 mb-1" />}
                      
                      <span className={`text-[10px] font-bold uppercase ${attemptState === "allowed" ? "text-green-400" : attemptState === "blocked" ? "text-red-400" : "text-blue-400"}`}>
                         {attemptState === "checking" ? "Verifying Caveats..." : attemptState === "allowed" ? "Operation Permitted" : "Violation Blocked"}
                      </span>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

function CaveatToggle({ label, active, onClick, disabled }: { id: string, label: string, active: boolean, onClick: () => void, disabled: boolean }) {
   return (
      <button 
         onClick={onClick}
         disabled={disabled}
         className={`w-full flex items-center justify-between p-2 rounded-md border text-xs transition-all ${
            active 
            ? "bg-blue-500/20 border-blue-500 text-blue-300" 
            : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
         } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
         <span className="font-mono truncate">{label}</span>
         {active ? <Lock className="h-3 w-3 shrink-0" /> : <Plus className="h-3 w-3 shrink-0" />}
      </button>
   );
}
