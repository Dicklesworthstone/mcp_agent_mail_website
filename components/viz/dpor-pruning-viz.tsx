"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/components/motion";
import { GitMerge, Scissors } from "lucide-react";

export default function DporPruningViz() {
  const prefersReduced = useReducedMotion();
  const [isDporEnabled, setIsDporEnabled] = useState(false);
  const [nodesExplored, setNodesExplored] = useState(0);

  // A simplified tree structure for visualization
  const levels = [
    { nodes: 1 },
    { nodes: 2 },
    { nodes: 4 },
    { nodes: 8 },
    { nodes: 16 },
    { nodes: 32 },
  ];

  // Number of nodes effectively explored in each mode
  const targetNodesNormal = 63; // 1 + 2 + 4 + 8 + 16 + 32
  const targetNodesDpor = 11;   // Reduced path

  useEffect(() => {
    let current = isDporEnabled ? targetNodesNormal : targetNodesDpor;
    const target = isDporEnabled ? targetNodesDpor : targetNodesNormal;
    const step = isDporEnabled ? -2 : 2;
    
    const interval = setInterval(() => {
      if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
        setNodesExplored(target);
        clearInterval(interval);
      } else {
        current += step;
        setNodesExplored(current);
      }
    }, 20);
    
    return () => clearInterval(interval);
  }, [isDporEnabled]);

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Dynamic Partial Order Reduction</h3>
          <p className="text-sm text-slate-400 mt-1">
            {isDporEnabled 
              ? "Pruning redundant commutations from the search space." 
              : "Naive exploration of all possible task interleavings."}
          </p>
        </div>
        
        <button
          onClick={() => setIsDporEnabled(!isDporEnabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
            isDporEnabled 
              ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
              : "bg-white/10 text-slate-300 hover:bg-white/20"
          }`}
        >
          {isDporEnabled ? <Scissors className="h-4 w-4" /> : <GitMerge className="h-4 w-4" />}
          {isDporEnabled ? "DPOR Active" : "Enable DPOR"}
        </button>
      </div>

      <div className="relative min-h-[16rem] py-8 w-full flex flex-col items-center justify-between">
        
        {/* Tree Visualization */}
        <div className="relative w-full max-w-md flex-1 flex flex-col justify-between min-h-[200px]">
          {levels.map((level, depth) => {
            const isPrunedLevel = depth > 2;
            const nodes = Array.from({ length: level.nodes }).map((_, i) => {
              // Determine if this specific node is pruned when DPOR is active
              // We'll just keep the leftmost branch active for the visual
              const isPruned = isDporEnabled && isPrunedLevel && i > 0;
              
              return (
                <motion.div
                  key={`node-${depth}-${i}`}
                  initial={false}
                  animate={{
                    scale: isPruned ? 0.4 : 1,
                    opacity: isPruned ? 0.1 : 1,
                    backgroundColor: isPruned ? "#334155" : (isDporEnabled ? "#a855f7" : "#3b82f6")
                  }}
                  transition={{ duration: prefersReduced ? 0 : 0.5, delay: prefersReduced ? 0 : depth * 0.05 }}
                  className="h-2 w-2 md:h-3 md:w-3 rounded-full z-10"
                />
              );
            });

            return (
              <div key={`level-${depth}`} className="flex justify-evenly w-full">
                {nodes}
              </div>
            );
          })}
          
          {/* Abstract connecting lines background */}
          <div className="absolute inset-0 z-0 pointer-events-none" style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 18%, ${isDporEnabled ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)'} 19%, transparent 20%)`,
            transition: 'background 0.5s ease'
          }} />
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Interleavings Explored</div>
          <div className="text-2xl font-black font-mono text-white">
            {nodesExplored.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Time to Verify</div>
          <div className={`text-2xl font-black font-mono transition-colors ${isDporEnabled ? "text-green-400" : "text-red-400"}`}>
            {isDporEnabled ? "0.02s" : "Timeout"}
          </div>
        </div>
      </div>
    </div>
  );
}
