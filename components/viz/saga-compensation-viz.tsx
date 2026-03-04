"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CreditCard, Truck, PackageCheck, AlertTriangle, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";

export default function SagaCompensationViz() {
  const [step, setStep] = useState(0); // 0: init, 1: pay, 2: inventory, 3: ship (fails), 4: rollback inv, 5: rollback pay
  const [status, setStatus] = useState<"idle" | "running" | "failed" | "rolling-back" | "compensated">("idle");

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const runSaga = () => {
    if (status !== "idle" && status !== "compensated") return;
    clearTimers();
    setStatus("running");
    setStep(1);

    const t1 = setTimeout(() => setStep(2), 800);
    timersRef.current.push(t1);
    
    // Step 3 (Shipping) fails
    const t2 = setTimeout(() => {
       setStep(3);
       setStatus("failed");
       
       // Begin LIFO rollback
       const t3 = setTimeout(() => {
          setStatus("rolling-back");
          setStep(4);
          
          const t4 = setTimeout(() => {
             setStep(5);
             
             const t5 = setTimeout(() => {
                setStatus("compensated");
             }, 800);
             timersRef.current.push(t5);
          }, 800);
          timersRef.current.push(t4);
       }, 1200);
       timersRef.current.push(t3);
    }, 1600);
    timersRef.current.push(t2);
  };

  const steps = [
    { 
       id: 1, 
       name: "Process Payment", 
       icon: CreditCard,
       forward: "Charge Card",
       backward: "Refund Card",
       isComplete: step >= 1 && step < 5,
       isCompensated: step >= 5
    },
    { 
       id: 2, 
       name: "Update Inventory", 
       icon: PackageCheck,
       forward: "Deduct Stock",
       backward: "Restock Item",
       isComplete: step >= 2 && step < 4,
       isCompensated: step >= 4
    },
    { 
       id: 3, 
       name: "Schedule Freight", 
       icon: Truck,
       forward: "Book Truck",
       backward: "Cancel Booking",
       isComplete: false,
       isCompensated: false,
       isFailed: step >= 3
    }
  ];

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Distributed Sagas</h3>
          <p className="text-sm text-slate-400 mt-1">
            Automatic LIFO compensation when long-running workflows fail.
          </p>
        </div>
        
        <button
          onClick={runSaga}
          disabled={status === "running" || status === "rolling-back"}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {status === "compensated" ? <RotateCcw className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          {status === "compensated" ? "Restart Saga" : "Execute Checkout Saga"}
        </button>
      </div>

      <div className="relative p-6 border border-white/5 bg-black/40 rounded-xl overflow-hidden min-h-[260px] flex flex-col justify-center">
        
        {/* Status Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors"
           style={{
              backgroundColor: status === "idle" ? "#1e293b" :
                               status === "running" ? "#04785722" :
                               status === "failed" ? "#9f123922" :
                               status === "rolling-back" ? "#eab30822" :
                               "#3b82f622",
              color: status === "idle" ? "#94a3b8" :
                     status === "running" ? "#34d399" :
                     status === "failed" ? "#f87171" :
                     status === "rolling-back" ? "#fbbf24" :
                     "#60a5fa",
              borderColor: status === "idle" ? "#334155" :
                           status === "running" ? "#10b981" :
                           status === "failed" ? "#e11d48" :
                           status === "rolling-back" ? "#f59e0b" :
                           "#3b82f6",
              borderWidth: "1px"
           }}
        >
           {status === "idle" && "Ready"}
           {status === "running" && "Executing Forward Actions"}
           {status === "failed" && "Failure Detected at Step 3"}
           {status === "rolling-back" && "Running Compensating Actions (LIFO)"}
           {status === "compensated" && "Saga Safely Aborted & Refunded"}
        </div>

        {/* Nodes */}
        <div className="flex items-center justify-between w-full max-w-lg mx-auto mt-6 relative">
           
           {/* Connecting Line */}
           <div className="absolute top-8 left-10 right-10 h-1 bg-slate-800 -z-10" />

           {steps.map((s) => {
              const Icon = s.icon;
              
              const nodeState = 
                 s.isFailed ? "failed" :
                 s.isCompensated ? "compensated" :
                 s.isComplete ? "complete" :
                 step === s.id ? "active" : "pending";

              return (
                 <div key={s.id} className="flex flex-col items-center gap-3 relative z-10 w-24">
                    
                    <motion.div 
                       layout
                       className={`h-16 w-16 rounded-2xl flex items-center justify-center border-2 transition-colors duration-500 shadow-xl ${
                          nodeState === "complete" ? "bg-emerald-950/80 border-emerald-500" :
                          nodeState === "active" ? "bg-slate-800 border-blue-500" :
                          nodeState === "failed" ? "bg-red-950/80 border-red-500" :
                          nodeState === "compensated" ? "bg-yellow-950/50 border-yellow-500/50 opacity-60 text-yellow-500" :
                          "bg-slate-900 border-slate-700 opacity-50"
                       }`}
                    >
                       {nodeState === "failed" ? <AlertTriangle className="h-6 w-6 text-red-500" /> : <Icon className="h-6 w-6" />}
                    </motion.div>
                    
                    <div className="text-center">
                       <div className="text-[10px] font-bold text-slate-300 leading-tight mb-1">{s.name}</div>
                       
                       {/* Action indicator */}
                       <div className="h-4">
                          {nodeState === "complete" && (
                             <span className="text-[9px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                                <ArrowRight className="h-2.5 w-2.5" /> {s.forward}
                             </span>
                          )}
                          {nodeState === "compensated" && (
                             <span className="text-[9px] text-yellow-400 font-mono flex items-center justify-center gap-1">
                                <ArrowLeft className="h-2.5 w-2.5" /> {s.backward}
                             </span>
                          )}
                       </div>
                    </div>
                 </div>
              );
           })}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl border border-white/5 bg-slate-800/30 text-sm text-slate-400 leading-relaxed">
         <p>
            When a distributed transaction spans multiple services, you cannot hold a single database lock. Instead, <strong className="text-white">Sagas</strong> define a forward path and a backward (compensating) path. If an error occurs (or if the user clicks &apos;Cancel&apos; midway through), Asupersync automatically walks backward up the tree, executing the registered compensations in strict LIFO order to restore the system to a clean state.
         </p>
      </div>
    </div>
  );
}
