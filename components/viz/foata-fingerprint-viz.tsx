"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, Hash, CheckCircle2, ArrowLeftRight } from "lucide-react";

export default function FoataFingerprintViz() {
  
  // We have 4 operations. A and B are independent. C and D are dependent.
  // Original Trace: A -> B -> C -> D
  // Swapped Trace: B -> A -> C -> D
  const [isSwapped, setIsSwapped] = useState(false);

  // Hashes just for visual effect
  const rawHashA = "a3f9b2...8e1";
  const rawHashB = "7c2d1e...9f4";
  const foataHash = "e9a04f...b3c"; // Same for both!

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Foata Fingerprinting</h3>
          <p className="text-sm text-slate-400 mt-1">
            Canonicalizing execution traces to prune DPOR search spaces.
          </p>
        </div>
        
        <button
          onClick={() => setIsSwapped(!isSwapped)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap Independent Ops
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
        
        {/* Timeline Visualization */}
        <div className="md:col-span-8 flex flex-col gap-6 p-6 border border-white/5 bg-black/40 rounded-xl overflow-x-auto">
           
           <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center justify-between min-w-[320px]">
              <span>Thread Interleaving</span>
              <span className="text-indigo-400">Time →</span>
           </div>

           <div className="relative h-32 w-full flex items-center min-w-[320px]">
              {/* Timeline Track */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
              
              <div className="relative w-full flex justify-between px-1 sm:px-4 z-10">
                 {/* Op 1 (A or B) */}
                 <motion.div 
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex flex-col items-center gap-2 w-16 sm:w-20 ${isSwapped ? "order-2" : "order-1"}`}
                 >
                    <div className="h-10 w-10 rounded-lg bg-blue-900/40 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                       <span className="font-mono font-black text-blue-400">Op A</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center leading-tight">Write Log</span>
                 </motion.div>

                 {/* Op 2 (B or A) */}
                 <motion.div 
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex flex-col items-center gap-2 w-16 sm:w-20 ${isSwapped ? "order-1" : "order-2"}`}
                 >
                    <div className="h-10 w-10 rounded-lg bg-emerald-900/40 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                       <span className="font-mono font-black text-emerald-400">Op B</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center leading-tight">Read DB</span>
                 </motion.div>

                 {/* Op 3 (C) */}
                 <div className="flex flex-col items-center gap-2 w-16 sm:w-20 order-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-900/40 border-2 border-orange-500 flex items-center justify-center">
                       <span className="font-mono font-black text-orange-400">Op C</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center leading-tight">Acquire Lock</span>
                 </div>

                 {/* Op 4 (D) */}
                 <div className="flex flex-col items-center gap-2 w-16 sm:w-20 order-4">
                    <div className="h-10 w-10 rounded-lg bg-rose-900/40 border-2 border-rose-500 flex items-center justify-center">
                       <span className="font-mono font-black text-rose-400">Op D</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center leading-tight">Write DB</span>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-3 text-xs text-indigo-200 flex items-center gap-3 min-w-[320px]">
              <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
              <p>Because <strong>Op A</strong> and <strong>Op B</strong> touch entirely different memory, their execution order is mathematically irrelevant to the final state.</p>
           </div>
        </div>

        {/* Hashing Results */}
        <div className="md:col-span-4 flex flex-col gap-4">
           
           <div className="flex-1 p-5 border border-slate-700 bg-slate-900/50 rounded-xl flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-600" />
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5">
                 <Hash className="h-3 w-3" /> Raw Trace Hash
              </div>
              <div className="font-mono text-lg font-black text-slate-300">
                 {isSwapped ? rawHashB : rawHashA}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Naive DPOR would treat these as two different test cases to explore.</p>
           </div>

           <div className="flex-1 p-5 border border-indigo-500/50 bg-indigo-900/20 rounded-xl flex flex-col justify-center relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.1)]">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-1 flex items-center gap-1.5">
                 <GitCompare className="h-3 w-3" /> Foata Fingerprint
              </div>
              <div className="font-mono text-lg font-black text-white">
                 {foataHash}
              </div>
              <p className="text-[11px] text-indigo-300/70 mt-2">Asupersync canonicalizes the trace, proving they belong to the exact same Mazurkiewicz equivalence class. DPOR skips the redundant run.</p>
           </div>

        </div>

      </div>
    </div>
  );
}
