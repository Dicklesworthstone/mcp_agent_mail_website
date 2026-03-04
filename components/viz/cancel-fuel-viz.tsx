"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/components/motion";
import { PowerOff, Flame } from "lucide-react";

export default function CancelFuelViz() {
  const prefersReduced = useReducedMotion();
  const [fuel, setFuel] = useState(10);
  const [isCancelling, setIsCancelling] = useState(false);
  const [nodes, setNodes] = useState<{ id: number; level: number; status: "active" | "cancelling" | "done" }[]>([
    { id: 1, level: 0, status: "active" },
    { id: 2, level: 1, status: "active" },
    { id: 3, level: 1, status: "active" },
    { id: 4, level: 2, status: "active" },
    { id: 5, level: 2, status: "active" },
    { id: 6, level: 2, status: "active" },
    { id: 7, level: 3, status: "active" },
    { id: 8, level: 3, status: "active" },
  ]);

  const MAX_FUEL = 10;
  const currentNodeRef = useRef(0);

  const startCancellation = () => {
    currentNodeRef.current = 0;
    setIsCancelling(true);
    setFuel(MAX_FUEL);
    setNodes(nodes.map(n => ({ ...n, status: "active" })));
  };

  useEffect(() => {
    if (!isCancelling) return;

    currentNodeRef.current = 0;

    const interval = setInterval(() => {
       setFuel(currentFuel => {
          if (currentNodeRef.current >= nodes.length || currentFuel <= 0) {
             setIsCancelling(false);
             clearInterval(interval);
             return currentFuel;
          }

          const idx = currentNodeRef.current;
          setNodes(prev => prev.map((n, i) => {
             if (i === idx) return { ...n, status: "done" };
             return n;
          }));

          currentNodeRef.current += 1;
          return Math.max(0, currentFuel - 1);
       });
    }, 400);

    return () => clearInterval(interval);
  }, [isCancelling, nodes.length]);

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Cancel Fuel</h3>
          <p className="text-sm text-slate-400 mt-1">
            Mathematical termination proof for cancellation cascades.
          </p>
        </div>
        
        <button
          onClick={startCancellation}
          disabled={isCancelling}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all bg-orange-600 text-white hover:bg-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-50"
        >
          <PowerOff className="h-4 w-4" />
          Trigger Shutdown
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
         
         {/* Tree Viz */}
         <div className="md:col-span-8 relative min-h-[16rem] py-8 border border-white/5 bg-black/40 rounded-xl overflow-hidden flex flex-col justify-center">
            {/* Tree nodes */}
            <div className="flex justify-center w-full mb-6">
               <Node status={nodes[0].status} />
            </div>
            
            <div className="flex justify-around w-full max-w-[60%] mx-auto mb-6 relative">
               <Node status={nodes[1].status} />
               <Node status={nodes[2].status} />
               {/* Connecting lines */}
               <svg className="absolute inset-0 w-full h-full -top-10 -z-10 overflow-visible">
                  <line x1="50%" y1="-10" x2="25%" y2="20" stroke="#334155" strokeWidth="2" />
                  <line x1="50%" y1="-10" x2="75%" y2="20" stroke="#334155" strokeWidth="2" />
               </svg>
            </div>
            
            <div className="flex justify-around w-full max-w-[80%] mx-auto mb-6 relative">
               <Node status={nodes[3].status} />
               <Node status={nodes[4].status} />
               <Node status={nodes[5].status} />
               <svg className="absolute inset-0 w-full h-full -top-10 -z-10 overflow-visible">
                  <line x1="30%" y1="-10" x2="15%" y2="20" stroke="#334155" strokeWidth="2" />
                  <line x1="30%" y1="-10" x2="50%" y2="20" stroke="#334155" strokeWidth="2" />
                  <line x1="70%" y1="-10" x2="85%" y2="20" stroke="#334155" strokeWidth="2" />
               </svg>
            </div>

            <div className="flex justify-around w-full relative">
               <Node status={nodes[6].status} />
               <Node status={nodes[7].status} />
               <svg className="absolute inset-0 w-full h-full -top-10 -z-10 overflow-visible">
                  <line x1="20%" y1="-10" x2="30%" y2="20" stroke="#334155" strokeWidth="2" />
                  <line x1="80%" y1="-10" x2="70%" y2="20" stroke="#334155" strokeWidth="2" />
               </svg>
            </div>
         </div>

         {/* Fuel Gauge */}
         <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex-1 p-5 border border-slate-700 bg-slate-900/50 rounded-xl flex flex-col justify-center relative overflow-hidden">
               <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-orange-500" /> Cancel Fuel Tank
               </div>
               
               <div className="relative h-8 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div 
                     className="absolute top-0 left-0 h-full bg-orange-500"
                     animate={{ width: `${(fuel / MAX_FUEL) * 100}%` }}
                     transition={{ duration: prefersReduced ? 0 : 0.2 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-black text-white mix-blend-difference">
                     {fuel} units remaining
                  </div>
               </div>

               <div className="mt-4 text-[11px] text-slate-400">
                  Strictly decreases on every propagation step. Guarantees infinite loops cannot prevent shutdown.
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

function Node({ status }: { status: string }) {
   return (
      <motion.div 
         initial={false}
         animate={{
            backgroundColor: status === "done" ? "#ef4444" : "#3b82f6",
            scale: status === "done" ? 0.8 : 1,
            borderColor: status === "done" ? "#b91c1c" : "#60a5fa"
         }}
         className="h-6 w-6 rounded-full border-2 z-10 shadow-lg"
      />
   );
}
