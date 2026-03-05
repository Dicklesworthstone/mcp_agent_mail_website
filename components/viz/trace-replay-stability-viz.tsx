"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { GitCommit, Dice5, CheckCircle2, ServerCrash, FastForward } from "lucide-react";

export default function TraceReplayStabilityViz() {
  const reducedMotion = useVizReducedMotion();
  const [isDeterministic, setIsDeterministic] = useState(true);
  const [runState, setRunState] = useState<"idle" | "running" | "done">("idle");
  const [inbox, setInbox] = useState<number[]>([]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // 3 nodes crashing at the exact same virtual microsecond
  const nodes = [
    { id: 1, name: "Node A", color: "#3b82f6" },
    { id: 2, name: "Node B", color: "#eab308" },
    { id: 3, name: "Node C", color: "#ec4899" },
  ];
  
  const NODE_MAP = new Map(nodes.map(n => [n.id, n]));

  const triggerCrash = () => {
    if (runState === "running") return;
    clearTimers();
    setRunState("running");
    setInbox([]);

    const t1 = setTimeout(() => {
       // All 3 nodes crash simultaneously
       // The difference is how they are inserted into the supervisor's inbox

       if (isDeterministic) {
          // Agent Mail Spork: Always sorted by (vt, tid)
          // Since VT is identical, it sorts strictly by Task ID (1, 2, 3)
          setInbox([1]);
          const t2 = setTimeout(() => setInbox([1, 2]), 300);
          const t3 = setTimeout(() => {
             setInbox([1, 2, 3]);
             setRunState("done");
          }, 600);
          timersRef.current.push(t2, t3);
       } else {
          // Traditional OTP / Non-deterministic: Random order based on thread scheduler races
          const shuffled = [...nodes].sort(() => 0.5 - Math.random()).map(n => n.id);
          
          setInbox([shuffled[0]]);
          const t2 = setTimeout(() => setInbox([shuffled[0], shuffled[1]]), 300);
          const t3 = setTimeout(() => {
             setInbox([shuffled[0], shuffled[1], shuffled[2]]);
             setRunState("done");
          }, 600);
          timersRef.current.push(t2, t3);
       }
    }, 500);
    timersRef.current.push(t1);
  };

  const handleModeSwitch = (deterministic: boolean) => {
    clearTimers();
    setIsDeterministic(deterministic);
    setRunState("idle");
    setInbox([]);
  };

  return (
    <VizSurface>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Trace Replay Stability</h3>
          <p className="text-sm text-slate-400 mt-1">
            Resolving concurrent races mathematically for perfect replay.
          </p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/10">
           <button 
             onClick={() => handleModeSwitch(false)}
             className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${!isDeterministic ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
           >
             <Dice5 className="h-3 w-3" /> Non-Deterministic (OTP)
           </button>
           <button 
             onClick={() => handleModeSwitch(true)}
             className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${isDeterministic ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
           >
             <GitCommit className="h-3 w-3" /> Deterministic (Spork)
           </button>
        </div>
      </div>

      <div className="relative min-h-[16rem] py-8 w-full flex flex-col items-center justify-between p-6 border border-white/5 bg-black/40 rounded-xl overflow-hidden gap-6">
        
        {/* Nodes */}
        <div className="w-full flex justify-around">
           {nodes.map(n => (
              <div key={n.id} className="flex flex-col items-center gap-2">
                 <div className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-colors ${
                    runState !== "idle" ? "bg-red-950/50 border-red-500" : "bg-slate-800 border-slate-600"
                 }`}>
                    {runState !== "idle" ? <ServerCrash className="h-6 w-6 text-red-500" /> : <span className="font-mono text-xs text-slate-400">TID:{n.id}</span>}
                 </div>
                 <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    {runState !== "idle" ? <span className="text-red-400">Crashed at vt=100</span> : "Running"}
                 </div>
              </div>
           ))}
        </div>

        {/* Action Button */}
        <VizControlButton
           onClick={triggerCrash}
           disabled={runState === "running"}
           tone="neutral"
           className="relative z-10 rounded-full px-6 py-2 normal-case tracking-normal text-xs text-white disabled:opacity-50 flex items-center gap-2"
        >
           <FastForward className="h-3 w-3" /> Replay Simultaneous Crash
        </VizControlButton>

        {/* Supervisor Inbox */}
        <div className="w-full max-w-sm">
           <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 text-center">
              Supervisor Inbox (Arrival Order)
           </div>
           <div className="h-14 w-full bg-slate-950 border border-slate-700 rounded-lg flex items-center px-4 gap-3 shadow-inner">
              {inbox.map((nodeId, idx) => {
                 const node = NODE_MAP.get(nodeId)!;
                 return (
                    <motion.div
                       key={`${nodeId}-${idx}`}
                       initial={reducedMotion ? false : { opacity: 0, x: -20, scale: 0.8 }}
                       animate={{ opacity: 1, x: 0, scale: 1 }}
                       transition={reducedMotion ? { duration: 0 } : undefined}
                       className="h-8 px-3 rounded flex items-center justify-center font-mono text-xs font-black shadow-md border"
                       style={{ 
                          backgroundColor: `${node.color}20`,
                          color: node.color,
                          borderColor: `${node.color}50`
                       }}
                    >
                       TID:{node.id}
                    </motion.div>
                 );
              })}
              
              {inbox.length === 0 && (
                 <span className="text-xs text-slate-600 font-mono italic">Waiting for messages...</span>
              )}
           </div>
        </div>

      </div>

      {/* Description Panel */}
      <div className="mt-6 p-4 rounded-xl border border-white/5 bg-slate-800/30 text-sm text-slate-400 leading-relaxed min-h-[100px] flex items-start gap-4">
         <AnimatePresence mode="wait">
           {isDeterministic ? (
              <motion.div
                key="deterministic"
                initial={reducedMotion ? false : { opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 5 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="flex items-start gap-4"
              >
                 <CheckCircle2 className="h-6 w-6 text-indigo-400 shrink-0 mt-0.5" />
                 <p><strong className="text-white">Spork Guarantee:</strong> If multiple monitored tasks die in the exact same scheduling quantum (same virtual time), Spork forces a mathematically stable sort using their internal Task IDs. Replaying the trace 10,000 times will produce the exact same arrival order 10,000 times.</p>
              </motion.div>
           ) : (
              <motion.div
                key="non-deterministic"
                initial={reducedMotion ? false : { opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 5 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="flex items-start gap-4"
              >
                 <Dice5 className="h-6 w-6 text-slate-400 shrink-0 mt-0.5" />
                 <p><strong className="text-white">Traditional Problem:</strong> When concurrent nodes crash simultaneously, their death notifications race to the supervisor&apos;s inbox. The order is determined by chaotic OS thread scheduling. A bug caused by one specific arrival order might never reproduce locally.</p>
              </motion.div>
           )}
         </AnimatePresence>
      </div>
    </VizSurface>
  );
}
