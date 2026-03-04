"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Braces, Terminal } from "lucide-react";

export default function SmallStepSemanticsViz() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Define a small program and its evaluation trace
  // Let's model a simple let-binding and task spawn:
  // e = let x = spawn(f) in x.await
  
  const trace = [
    {
       name: "INIT",
       expr: "let x = spawn(f) in await(x)",
       env: "{}",
       heap: "[]"
    },
    {
       name: "EVAL_SPAWN",
       expr: "let x = tid_1 in await(x)",
       env: "{}",
       heap: "[tid_1: Pending]"
    },
    {
       name: "BIND_VAR",
       expr: "await(x)",
       env: "{x: tid_1}",
       heap: "[tid_1: Pending]"
    },
    {
       name: "EVAL_VAR",
       expr: "await(tid_1)",
       env: "{x: tid_1}",
       heap: "[tid_1: Pending]"
    },
    {
       name: "ASYNC_STEP",
       expr: "await(tid_1)",
       env: "{x: tid_1}",
       heap: "[tid_1: Completed(42)]"
    },
    {
       name: "EVAL_AWAIT",
       expr: "42",
       env: "{x: tid_1}",
       heap: "[tid_1: Completed(42)]"
    }
  ];

  const togglePlay = () => {
    if (step >= trace.length - 1) {
       setStep(0);
       setIsPlaying(true);
    } else {
       setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
       setStep(s => {
          if (s >= trace.length - 1) {
             setIsPlaying(false);
             return s;
          }
          return s + 1;
       });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, trace.length]);

  const current = trace[step];

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Small-Step Operational Semantics</h3>
          <p className="text-sm text-slate-400 mt-1">
            Machine-checked execution rules in Lean 4.
          </p>
        </div>
        
        <div className="flex gap-2">
           <button
             onClick={() => { setStep(0); setIsPlaying(false); }}
             className="p-2.5 rounded-lg border border-white/10 bg-slate-800/50 text-slate-400 hover:text-white transition-all"
             aria-label="Reset"
           >
             <RotateCcw className="h-4 w-4" />
           </button>
           <button
             onClick={togglePlay}
             className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all bg-indigo-600 text-white hover:bg-indigo-500"
           >
             {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
             {isPlaying ? "Pause Evaluation" : step >= trace.length - 1 ? "Replay Trace" : "Step Forward"}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         
         {/* Formal Rule Panel */}
         <div className="relative border border-indigo-500/30 bg-indigo-950/20 rounded-xl overflow-hidden flex flex-col min-h-[220px]">
            <div className="bg-indigo-900/40 px-4 py-2 border-b border-indigo-500/20 flex justify-between items-center">
               <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                  <Braces className="h-3 w-3" /> Transition Rule
               </span>
               <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/30 px-1.5 rounded bg-indigo-950">
                  {current.name}
               </span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-center items-center font-serif text-lg lg:text-xl text-slate-200">
               {/* Math representation of transition: <e, env, heap> -> <e', env', heap'> */}
               <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                     <span className="text-slate-500">⟨</span>
                     <motion.span key={`expr1-${step}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-blue-400 font-mono text-sm">{current.expr}</motion.span>
                     <span className="text-slate-500">,</span>
                     <motion.span key={`env1-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 font-mono text-sm">{current.env}</motion.span>
                     <span className="text-slate-500">,</span>
                     <motion.span key={`heap1-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 font-mono text-sm">{current.heap}</motion.span>
                     <span className="text-slate-500">⟩</span>
                  </div>
                  
                  <div className="my-2 text-indigo-500 font-black">
                     ↓
                  </div>

                  {step < trace.length - 1 ? (
                     <div className="flex items-center gap-2">
                        <span className="text-slate-500">⟨</span>
                        <motion.span key={`expr2-${step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-blue-400 font-mono text-sm">{trace[step+1].expr}</motion.span>
                        <span className="text-slate-500">,</span>
                        <motion.span key={`env2-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 font-mono text-sm">{trace[step+1].env}</motion.span>
                        <span className="text-slate-500">,</span>
                        <motion.span key={`heap2-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 font-mono text-sm">{trace[step+1].heap}</motion.span>
                        <span className="text-slate-500">⟩</span>
                     </div>
                  ) : (
                     <div className="text-emerald-500 font-black tracking-widest uppercase text-sm mt-2 flex items-center gap-2">
                        Normal Form Reached
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* State Explorer Panel */}
         <div className="border border-white/5 bg-black/40 rounded-xl overflow-hidden flex flex-col min-h-[220px]">
            <div className="bg-slate-900/50 px-4 py-2 border-b border-white/5 flex items-center gap-2">
               <Terminal className="h-3 w-3 text-slate-500" />
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Runtime State (σ)
               </span>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4 font-mono text-xs">
               <div>
                  <span className="text-slate-500 mb-1 block">{"// Expression AST"}</span>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-blue-300">
                     {current.expr}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <span className="text-slate-500 mb-1 block">{"// Environment (Γ)"}</span>
                     <div className="bg-slate-950 p-2 rounded border border-slate-800 text-emerald-300 h-12 flex items-center">
                        {current.env}
                     </div>
                  </div>
                  <div>
                     <span className="text-slate-500 mb-1 block">{"// Global Heap (H)"}</span>
                     <div className="bg-slate-950 p-2 rounded border border-slate-800 text-orange-300 h-12 flex items-center">
                        {current.heap}
                     </div>
                  </div>
               </div>
            </div>
         </div>
         
      </div>
      
      <div className="mt-4 p-4 rounded-xl border border-white/5 bg-slate-800/30 text-sm text-slate-400 leading-relaxed text-center max-w-3xl mx-auto">
         Instead of relying on &quot;it compiles, ship it&quot;, Asupersync&apos;s behavior is strictly defined by a set of formal mathematical rules (Small-Step Semantics) written in Lean 4. Every evaluation step, cancellation cascade, and obligation transfer is mathematically proven to be sound before it is ever translated into Rust code.
      </div>
    </div>
  );
}
