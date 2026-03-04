"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ShieldAlert, ArrowRight, Lock, Unlock } from "lucide-react";

export default function CalmViz() {
  const [activeTab, setActiveTab] = useState<"monotone" | "non-monotone">("monotone");

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">CALM Theorem Optimization</h3>
          <p className="text-sm text-slate-400 mt-1">
            Minimizing locks using formal monotonicity analysis.
          </p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/10">
           <button 
             onClick={() => setActiveTab("monotone")}
             className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${activeTab === "monotone" ? "bg-green-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
           >
             <Unlock className="h-3 w-3" /> Monotone
           </button>
           <button 
             onClick={() => setActiveTab("non-monotone")}
             className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${activeTab === "non-monotone" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
           >
             <Lock className="h-3 w-3" /> Non-Monotone
           </button>
        </div>
      </div>

      <div className="relative min-h-[16rem] py-8 w-full flex items-center justify-center px-6 border border-white/5 bg-black/40 rounded-xl overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Monotone Visualization */}
          {activeTab === "monotone" && (
            <motion.div 
              key="monotone"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md h-full flex flex-col justify-center gap-8 relative"
            >
               <div className="text-center absolute -top-4 left-1/2 -translate-x-1/2 w-full">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[11px] font-bold uppercase tracking-widest">
                     Coordination-Free Fast Path
                  </span>
               </div>
               
               <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-4 gap-6 sm:gap-0">
                  {/* Thread A */}
                  <div className="flex flex-col items-center z-10 w-full sm:w-24">
                     <div className="h-10 w-10 bg-slate-800 border-2 border-green-500 rounded-full flex items-center justify-center mb-2 z-10 relative">
                       <span className="text-white font-mono font-bold text-xs">T1</span>
                       <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }} 
                          animate={{ scale: 1.5, opacity: 0 }} 
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 bg-green-500 rounded-full z-[-1]" 
                       />
                     </div>
                     <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">Reserve<br className="hidden sm:block"/>(Obligation)</span>
                  </div>

                  {/* Shared State (Set) */}
                  <div className="flex-1 flex justify-center relative w-full sm:w-auto h-24 sm:h-auto items-center">
                     <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-green-500/30 -translate-y-1/2 z-0" />
                     <div className="block sm:hidden absolute left-1/2 top-0 h-full w-0.5 bg-green-500/30 -translate-x-1/2 z-0" />
                     
                     {/* Flow Arrows */}
                     <motion.div
                        animate={{ x: [0, 60], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        className="hidden sm:block absolute top-1/2 left-[20%] -translate-y-1/2 text-green-400 z-10"
                     >
                       <ArrowRight className="h-4 w-4" />
                     </motion.div>
                     <motion.div
                        animate={{ x: [0, -60], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear", delay: 0.3 }}
                        className="hidden sm:block absolute top-1/2 right-[20%] -translate-y-1/2 rotate-180 text-green-400 z-10"
                     >
                       <ArrowRight className="h-4 w-4" />
                     </motion.div>

                     <div className="h-20 w-28 bg-slate-950 border-2 border-green-500/50 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)] z-10 relative bg-opacity-90">
                        <Layers className="h-6 w-6 text-green-400 mb-1" />
                        <span className="text-[10px] sm:text-xs font-mono text-green-300 tracking-wider">Set \u222A {`{x}`}</span>
                     </div>
                  </div>

                  {/* Thread B */}
                  <div className="flex flex-col items-center z-10 w-full sm:w-24">
                     <div className="h-10 w-10 bg-slate-800 border-2 border-green-500 rounded-full flex items-center justify-center mb-2 z-10 relative">
                       <span className="text-white font-mono font-bold text-xs">T2</span>
                       <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }} 
                          animate={{ scale: 1.5, opacity: 0 }} 
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                          className="absolute inset-0 bg-green-500 rounded-full z-[-1]" 
                       />
                     </div>
                     <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">Acquire<br className="hidden sm:block"/>(Lease)</span>
                  </div>
               </div>
            </motion.div>
          )}

          {/* Non-Monotone Visualization */}
          {activeTab === "non-monotone" && (
            <motion.div 
              key="non-monotone"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md h-full flex flex-col justify-center gap-8 relative"
            >
               <div className="text-center absolute -top-4 left-1/2 -translate-x-1/2 w-full">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[11px] font-bold uppercase tracking-widest">
                     Synchronization Barrier Required
                  </span>
               </div>
               
               <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-4 gap-6 sm:gap-0">
                  {/* Thread A */}
                  <div className="flex flex-col items-center z-10 w-full sm:w-24">
                     <div className="h-10 w-10 bg-slate-800 border-2 border-red-500 rounded-full flex items-center justify-center mb-2 z-10 opacity-50 grayscale">
                       <span className="text-white font-mono font-bold text-xs">T1</span>
                     </div>
                     <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider text-center">Blocked</span>
                  </div>

                  {/* Shared State (Threshold) */}
                  <div className="flex-1 flex justify-center relative w-full sm:w-auto h-24 sm:h-auto items-center">
                     <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-red-500/30 -translate-y-1/2 z-0" />
                     <div className="block sm:hidden absolute left-1/2 top-0 h-full w-0.5 bg-red-500/30 -translate-x-1/2 z-0" />
                     
                     {/* Lock barrier */}
                     <div className="hidden sm:block absolute top-1/2 left-1/4 -translate-y-1/2 h-16 w-2 bg-red-500/50 rounded-full" />
                     <div className="hidden sm:block absolute top-1/2 right-1/4 -translate-y-1/2 h-16 w-2 bg-red-500/50 rounded-full" />
                     
                     <div className="block sm:hidden absolute left-1/2 top-[-10px] -translate-x-1/2 w-16 h-2 bg-red-500/50 rounded-full" />
                     <div className="block sm:hidden absolute left-1/2 bottom-[-10px] -translate-x-1/2 w-16 h-2 bg-red-500/50 rounded-full" />

                     <div className="h-20 w-28 bg-slate-950 border-2 border-red-500/50 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.15)] z-10 relative bg-opacity-90">
                        <ShieldAlert className="h-6 w-6 text-red-400 mb-1" />
                        <span className="text-[10px] sm:text-xs font-mono text-red-300 tracking-wider">if count == 0</span>
                     </div>
                  </div>

                  {/* Thread B */}
                  <div className="flex flex-col items-center z-10 w-full sm:w-24">
                     <div className="h-10 w-10 bg-slate-800 border-2 border-blue-500 rounded-full flex items-center justify-center mb-2 z-10 relative">
                       <span className="text-white font-mono font-bold text-xs">T2</span>
                       <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }} 
                          animate={{ scale: 1.5, opacity: 0 }} 
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 bg-blue-500 rounded-full z-[-1]" 
                       />
                     </div>
                     <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">RegionClose()</span>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Description Panel */}
      <div className="mt-6 p-4 rounded-xl border border-white/5 bg-slate-800/30 text-sm text-slate-400 leading-relaxed min-h-[100px]">
        <AnimatePresence mode="wait">
          {activeTab === "monotone" ? (
            <motion.div
              key="desc-monotone"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <p><strong className="text-white">Monotone Operations:</strong> Actions that only add information (like appending to a channel or reserving an obligation) never depend on the <em>absence</em> of data. According to the CALM theorem, these operations can execute entirely in parallel without any coordination locks.</p>
            </motion.div>
          ) : (
            <motion.div
              key="desc-non-monotone"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <p><strong className="text-white">Non-Monotone Operations:</strong> Actions that check a threshold or depend on negation (like <code className="text-red-400 bg-red-900/30 px-1 rounded">RegionClose</code> ensuring <em>zero</em> active tasks remain) fundamentally require a synchronization barrier. Asupersync pushes these heavy barriers out of the hot path.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
