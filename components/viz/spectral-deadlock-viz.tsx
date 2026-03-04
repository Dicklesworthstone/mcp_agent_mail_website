"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/components/motion";
import { Activity, AlertOctagon, CheckCircle2, RefreshCw } from "lucide-react";

type DeadlockState = "healthy" | "forming" | "critical" | "intervened";

export default function SpectralDeadlockViz() {
  const prefersReduced = useReducedMotion();
  const [stage, setStage] = useState<DeadlockState>("healthy");
  const [fiedlerValue, setFiedlerValue] = useState(1.0);
  const elapsedRef = useRef(0);

  const startSimulation = () => {
    setStage("healthy");
    setFiedlerValue(1.0);
    elapsedRef.current = 0;
  };

  useEffect(() => {
    if (stage === "intervened") return;

    const interval = setInterval(() => {
      elapsedRef.current += 1;
      const e = elapsedRef.current;

      if (e > 40 && stage === "critical") {
         setStage("intervened");
         clearInterval(interval);
         return;
      }

      if (e > 20 && stage === "forming") {
         setStage("critical");
      } else if (e > 5 && stage === "healthy") {
         setStage("forming");
      }

      setFiedlerValue(prev => {
         let target = 1.0;
         if (stage === "forming") target = 0.4;
         if (stage === "critical") target = 0.05;
         return prev + (target - prev) * 0.1;
      });

    }, 100);

    return () => clearInterval(interval);
  }, [stage]);

  // Determine graph colors based on state
  const isForming = stage === "forming" || stage === "critical";
  const isCritical = stage === "critical";
  const nodeColor = stage === "intervened" ? "#22c55e" : isCritical ? "#ef4444" : isForming ? "#eab308" : "#3b82f6";
  const edgeColor = stage === "intervened" ? "#22c55e66" : isCritical ? "#ef444499" : isForming ? "#eab30899" : "#3b82f666";

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Spectral Deadlock Detection</h3>
          <p className="text-sm text-slate-400 mt-1">
            Real-time wait-graph eigenvalue analysis.
          </p>
        </div>
        
        <button
          onClick={startSimulation}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all bg-white/10 text-slate-300 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <RefreshCw className="h-4 w-4" />
          Restart Simulation
        </button>
      </div>

      <div className="relative min-h-[16rem] w-full grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:py-8 border border-white/5 bg-black/40 rounded-xl overflow-hidden">
        
        {/* Wait-Graph Visualization */}
        <div className="relative flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-4 min-h-[200px]">
           <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 absolute top-0 left-0 md:left-0 z-10">Wait-Graph</div>
           
           <svg viewBox="0 0 200 200" className="w-full h-full max-w-[180px]">
              <defs>
                 <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={edgeColor} />
                 </marker>
                 <marker id="arrow-broken" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                 </marker>
              </defs>

              {/* Edges */}
              <motion.line x1="100" y1="40" x2="160" y2="100" stroke={edgeColor} strokeWidth="2" markerEnd="url(#arrow)" animate={{ stroke: edgeColor }} />
              <motion.line x1="160" y1="100" x2="100" y2="160" stroke={edgeColor} strokeWidth="2" markerEnd="url(#arrow)" animate={{ stroke: edgeColor }} />
              <motion.line x1="100" y1="160" x2="40" y2="100" stroke={edgeColor} strokeWidth="2" markerEnd="url(#arrow)" animate={{ stroke: edgeColor }} />
              
              {/* Critical cycle edge that completes the deadlock */}
              <motion.line 
                x1="40" y1="100" x2="100" y2="40" 
                stroke={stage === "healthy" ? "#334155" : stage === "intervened" ? "#334155" : edgeColor} 
                strokeWidth="2" 
                strokeDasharray={stage === "forming" ? "4 4" : "0"}
                markerEnd={stage === "healthy" || stage === "intervened" ? "url(#arrow-broken)" : "url(#arrow)"} 
                animate={{ stroke: stage === "healthy" || stage === "intervened" ? "#334155" : edgeColor }} 
              />

              {/* Nodes */}
              <motion.circle cx="100" cy="40" r="15" fill="#0A1628" stroke={nodeColor} strokeWidth="3" animate={{ stroke: nodeColor }} />
              <text x="100" y="44" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace">A</text>

              <motion.circle cx="160" cy="100" r="15" fill="#0A1628" stroke={nodeColor} strokeWidth="3" animate={{ stroke: nodeColor }} />
              <text x="160" y="104" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace">B</text>

              <motion.circle cx="100" cy="160" r="15" fill="#0A1628" stroke={nodeColor} strokeWidth="3" animate={{ stroke: nodeColor }} />
              <text x="100" y="164" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace">C</text>

              <motion.circle cx="40" cy="100" r="15" fill="#0A1628" stroke={nodeColor} strokeWidth="3" animate={{ stroke: nodeColor }} />
              <text x="40" y="104" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace">D</text>

              {/* Intervention indicator */}
              <AnimatePresence>
                 {stage === "intervened" && (
                    <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                       <circle cx="70" cy="70" r="10" fill="#ef4444" />
                       <line x1="65" y1="65" x2="75" y2="75" stroke="#fff" strokeWidth="2" />
                       <line x1="75" y1="65" x2="65" y2="75" stroke="#fff" strokeWidth="2" />
                    </motion.g>
                 )}
              </AnimatePresence>
           </svg>
        </div>

        {/* Fiedler Value Chart */}
        <div className="relative flex flex-col items-center justify-center pt-6 md:pt-0 md:pl-4 min-h-[200px]">
           <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 absolute top-0 left-0 md:left-4 z-10">Laplacian Eigenvalues</div>
           
           <div className="w-full flex-1 mt-6 flex flex-col justify-end relative">
              {/* Threshold lines */}
              <div className="absolute top-[20%] left-0 w-full border-t border-dashed border-slate-700" />
              <div className="absolute top-[60%] left-0 w-full border-t border-dashed border-yellow-900/50" />
              <div className="absolute top-[90%] left-0 w-full border-t border-dashed border-red-900/50" />

              {/* Fiedler Value Bar */}
              <div className="w-16 mx-auto bg-slate-800 rounded-t-sm relative flex flex-col justify-end h-full border border-slate-700 overflow-hidden min-h-[140px]">
                 <motion.div 
                    className="w-full"
                    style={{ background: nodeColor }}
                    animate={{ height: `${fiedlerValue * 100}%` }}
                    transition={{ duration: prefersReduced ? 0 : 0.1 }}
                 />
                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white font-mono font-black text-sm drop-shadow-md">
                    {fiedlerValue.toFixed(2)}
                 </div>
              </div>

              <div className="text-center mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 Fiedler Value (\u03BB₂)
              </div>
           </div>
        </div>

        {/* Status Overlay */}
        <AnimatePresence>
          {stage === "intervened" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-10 p-6 text-center"
            >
              <div className="h-16 w-16 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-blue-500" />
              </div>
              <h4 className="text-xl font-black text-white">Preemptive Intervention</h4>
              <p className="text-sm text-slate-300 mt-2 max-w-sm">
                Fiedler value dropped below the critical threshold (0.1). The scheduler injected a cancellation to break the wait-cycle before a total system deadlock occurred.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Metrics */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">System State</div>
          <div className="flex justify-center items-center gap-1.5">
             {stage === "healthy" && <><Activity className="h-3 w-3 text-blue-400" /><span className="text-sm font-black text-blue-400 uppercase tracking-wide">Flowing</span></>}
             {stage === "forming" && <><AlertOctagon className="h-3 w-3 text-yellow-400" /><span className="text-sm font-black text-yellow-400 uppercase tracking-wide">Congestion</span></>}
             {stage === "critical" && <><AlertOctagon className="h-3 w-3 text-red-400" /><span className="text-sm font-black text-red-400 uppercase tracking-wide">Cycle Imminent</span></>}
             {stage === "intervened" && <><CheckCircle2 className="h-3 w-3 text-green-400" /><span className="text-sm font-black text-green-400 uppercase tracking-wide">Resolved</span></>}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Graph Connectivity</div>
          <div className={`text-xl font-black font-mono transition-colors ${stage === "critical" ? "text-red-400" : "text-white"}`}>
            {(fiedlerValue * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}
