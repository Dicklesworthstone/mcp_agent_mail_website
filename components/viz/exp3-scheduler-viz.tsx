"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/components/motion";
import { Zap, AlertTriangle } from "lucide-react";

type Workload = "normal" | "cancel-flood";

export default function Exp3SchedulerViz() {
  const prefersReduced = useReducedMotion();
  const [workload, setWorkload] = useState<Workload>("normal");
  
  // 5 arms representing cancel-streak thresholds
  const arms = [4, 8, 16, 32, 64];
  
  // Weights for each arm. In normal workload, lower thresholds are favored (fairness).
  // In cancel-flood, higher thresholds are favored (throughput).
  const [weights, setWeights] = useState([0.4, 0.3, 0.15, 0.1, 0.05]);

  useEffect(() => {
    const targetWeights = 
       workload === "normal" 
       ? [0.45, 0.3, 0.15, 0.08, 0.02] // Favor 4 and 8
       : [0.02, 0.05, 0.13, 0.3, 0.5]; // Favor 32 and 64

    const interval = setInterval(() => {
       setWeights(prev => {
          return prev.map((w, i) => {
             // Smoothly interpolate towards target
             return w + (targetWeights[i] - w) * 0.1;
          });
       });
    }, 100);

    return () => clearInterval(interval);
  }, [workload]);

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">EXP3 Adaptive Scheduler</h3>
          <p className="text-sm text-slate-400 mt-1">
            Multi-armed bandit tuning for cancel-streak limits.
          </p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/10">
           <button 
             onClick={() => setWorkload("normal")}
             className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${workload === "normal" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
           >
             Normal Load
           </button>
           <button 
             onClick={() => setWorkload("cancel-flood")}
             className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${workload === "cancel-flood" ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)]" : "text-slate-400 hover:text-slate-200"}`}
           >
             <AlertTriangle className="h-3 w-3" /> Cancel Flood
           </button>
        </div>
      </div>

      <div className="relative flex flex-col gap-6 p-6 border border-white/5 bg-black/40 rounded-xl overflow-hidden min-h-[220px]">
        
        {/* State indicator */}
        <div className="absolute top-4 left-6 flex items-center gap-2">
            <Zap className={`h-4 w-4 ${workload === "normal" ? "text-blue-400" : "text-pink-500 animate-pulse"}`} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
               {workload === "normal" ? "Fairness Optimized" : "Throughput Optimized"}
            </span>
        </div>

        {/* Arms Chart */}
        <div className="flex items-end justify-around w-full h-32 mt-8 border-b border-slate-700 pb-2 relative">
           {/* Grid lines */}
           <div className="absolute top-[25%] left-0 w-full border-t border-dashed border-white/5 z-0" />
           <div className="absolute top-[50%] left-0 w-full border-t border-dashed border-white/5 z-0" />
           <div className="absolute top-[75%] left-0 w-full border-t border-dashed border-white/5 z-0" />

           {arms.map((arm, i) => {
              const weight = weights[i];
              const isDominant = weight === Math.max(...weights);
              
              return (
                 <div key={arm} className="flex flex-col items-center z-10 w-12 group">
                    <div className="relative w-full flex justify-center items-end h-full">
                       {/* Probability Label */}
                       <div className="absolute -top-6 text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(weight * 100).toFixed(0)}%
                       </div>
                       
                       {/* Bar */}
                       <motion.div 
                          className="w-8 rounded-t-md border border-slate-600/50"
                          style={{ 
                             backgroundColor: isDominant ? (workload === "normal" ? "#3b82f6" : "#ec4899") : "#1e293b",
                             boxShadow: isDominant ? `0 0 20px ${workload === "normal" ? "rgba(59,130,246,0.3)" : "rgba(236,72,153,0.3)"}` : "none"
                          }}
                          animate={{ height: `${weight * 100}%` }}
                          transition={{ duration: prefersReduced ? 0 : 0.1 }}
                       />
                    </div>
                 </div>
              );
           })}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-around w-full">
           {arms.map((arm) => (
              <div key={`label-${arm}`} className="w-12 text-center text-xs font-bold text-slate-500">
                 {arm}x
              </div>
           ))}
        </div>
        <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">
           Cancel-Streak Limits (Arms)
        </div>

      </div>

      {/* Metrics */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-center">
        <div className="text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Learning Mechanism</div>
          <div className="text-sm font-medium text-slate-300">
             Regret Minimization (γ=0.07)
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Current Strategy</div>
          <div className={`text-sm font-black uppercase ${workload === "normal" ? "text-blue-400" : "text-pink-400"}`}>
             {workload === "normal" ? "Low Preemption" : "Aggressive Drain"}
          </div>
        </div>
      </div>
    </div>
  );
}
