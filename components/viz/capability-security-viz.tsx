"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Globe, FileDigit, Clock, GitFork, ShieldAlert, ShieldCheck } from "lucide-react";

type Capability = "net" | "fs" | "timer" | "spawn";

const CAPABILITIES: { id: Capability; label: string; icon: React.ElementType; color: string }[] = [
  { id: "net", label: "Network I/O", icon: Globe, color: "#3B82F6" },
  { id: "fs", label: "File System", icon: FileDigit, color: "#F59E0B" },
  { id: "timer", label: "Timers", icon: Clock, color: "#8B5CF6" },
  { id: "spawn", label: "Spawn Tasks", icon: GitFork, color: "#10B981" },
];

type AttemptState = "idle" | "checking" | "granted" | "denied";

export default function CapabilitySecurityViz() {
  const [activeCaps, setActiveCaps] = useState<Set<Capability>>(new Set(["net", "timer"]));
  const [attemptState, setAttemptState] = useState<AttemptState>("idle");
  const [, setActiveAction] = useState<Capability | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const toggleCap = (cap: Capability) => {
    if (attemptState !== "idle") return;
    const next = new Set(activeCaps);
    if (next.has(cap)) next.delete(cap);
    else next.add(cap);
    setActiveCaps(next);
  };

  const attemptAction = (cap: Capability) => {
    if (attemptState !== "idle") return;
    clearTimers();
    setActiveAction(cap);
    setAttemptState("checking");

    const t1 = setTimeout(() => {
      if (activeCaps.has(cap)) {
        setAttemptState("granted");
      } else {
        setAttemptState("denied");
      }
      
      const t2 = setTimeout(() => {
        setAttemptState("idle");
        setActiveAction(null);
      }, 2000);
      timersRef.current.push(t2);
    }, 600);
    timersRef.current.push(t1);
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="mb-8 text-center">
        <h3 className="text-lg font-semibold text-white">Capability Gates</h3>
        <p className="text-sm text-slate-400 mt-1">
          Configure the <span className="text-blue-400 font-mono">Cx</span> token and attempt operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Cx Token Configuration */}
        <div className="flex flex-col items-center">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            Task Context (Cx)
          </div>
          
          <div className="relative p-6 rounded-xl border border-white/10 bg-black/40 w-full max-w-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#020a14] px-2 text-blue-500">
              <Key className="h-5 w-5" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              {CAPABILITIES.map((cap) => {
                const isActive = activeCaps.has(cap.id);
                const Icon = cap.icon;
                return (
                  <button
                    key={cap.id}
                    onClick={() => toggleCap(cap.id)}
                    disabled={attemptState !== "idle"}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all"
                    style={{
                      borderColor: isActive ? cap.color : "#1e293b",
                      backgroundColor: isActive ? `${cap.color}15` : "transparent",
                      opacity: attemptState !== "idle" ? 0.5 : 1
                    }}
                  >
                    <Icon 
                      className="h-5 w-5 transition-colors" 
                      style={{ color: isActive ? cap.color : "#475569" }} 
                    />
                    <span 
                      className="text-xs font-medium transition-colors"
                      style={{ color: isActive ? "#fff" : "#64748b" }}
                    >
                      {cap.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Simulation */}
        <div className="flex flex-col items-center">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            Attempt Operations
          </div>
          
          <div className="relative p-6 rounded-xl border border-white/10 bg-black/40 w-full max-w-sm flex flex-col justify-center min-h-[220px]">
            
            {attemptState === "idle" ? (
              <div className="grid grid-cols-2 gap-3">
                {CAPABILITIES.map((cap) => (
                  <button
                    key={`action-${cap.id}`}
                    onClick={() => attemptAction(cap.id)}
                    className="py-3 px-4 rounded-lg border border-slate-700/50 bg-slate-800/30 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    Use {cap.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <AnimatePresence mode="wait">
                  {attemptState === "checking" && (
                    <motion.div
                      key="checking"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center"
                    >
                      <div className="h-12 w-12 rounded-full border-2 border-slate-600 border-t-blue-500 animate-spin mb-4" />
                      <span className="text-sm font-medium text-slate-400">Verifying capability...</span>
                    </motion.div>
                  )}
                  
                  {attemptState === "granted" && (
                    <motion.div
                      key="granted"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center"
                    >
                      <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mb-4">
                        <ShieldCheck className="h-8 w-8 text-green-500" />
                      </div>
                      <span className="text-lg font-bold text-green-400">Access Granted</span>
                      <span className="text-xs text-slate-500 mt-1">Operation succeeded</span>
                    </motion.div>
                  )}
                  
                  {attemptState === "denied" && (
                    <motion.div
                      key="denied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center"
                    >
                      <div className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mb-4">
                        <ShieldAlert className="h-8 w-8 text-red-500" />
                      </div>
                      <span className="text-lg font-bold text-red-400">Access Denied</span>
                      <span className="text-xs text-slate-500 mt-1">Cx lacks required capability</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
