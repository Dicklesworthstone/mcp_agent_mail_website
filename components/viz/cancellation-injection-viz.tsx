"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bomb, ShieldCheck, ShieldAlert, FastForward, RotateCcw } from "lucide-react";

type RunState = "idle" | "running" | "passed" | "failed";

export default function CancellationInjectionViz() {
  const [currentRun, setCurrentRun] = useState<number>(0);
  const [runState, setRunState] = useState<RunState>("idle");
  const [activeAwait, setActiveAwait] = useState<number | null>(null);

  const totalAwaits = 4;
  const buggyAwait = 3; // The 3rd await point causes a leak if cancelled

  const startSimulation = () => {
    setCurrentRun(1);
    setRunState("running");
    setActiveAwait(1);
  };

  useEffect(() => {
    if (runState !== "running") return;
    let isActive = true;

    const runSimulation = async () => {
       // Step through awaits up to the injection point
       for (let i = 1; i <= currentRun; i++) {
          if (!isActive) return;
          setActiveAwait(i);
          await new Promise(r => setTimeout(r, 600));
       }

       if (!isActive) return;
       // Boom! Cancel injected
       await new Promise(r => setTimeout(r, 400));
       
       if (!isActive) return;
       if (currentRun === buggyAwait) {
          setRunState("failed");
       } else {
          setRunState("passed");
          setTimeout(() => {
             if (!isActive) return;
             if (currentRun < totalAwaits) {
                setCurrentRun(prev => prev + 1);
                setRunState("running");
             } else {
                setRunState("idle");
             }
          }, 1000);
       }
    };

    runSimulation();

    return () => {
      isActive = false;
    };
  }, [currentRun, runState]);

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Cancellation Injection Matrix</h3>
          <p className="text-sm text-slate-400 mt-1">
            Systematically dropping cancel bombs at every `.await` point.
          </p>
        </div>
        
        <button
          onClick={startSimulation}
          disabled={runState === "running"}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-50"
        >
          {runState === "failed" ? <RotateCcw className="h-4 w-4" /> : <FastForward className="h-4 w-4" />}
          {runState === "failed" ? "Restart Scan" : "Start Injection Run"}
        </button>
      </div>

      <div className="relative p-6 border border-white/5 bg-black/40 rounded-xl overflow-hidden min-h-[240px]">
         
         <div className="font-mono text-sm text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <div className="text-blue-400 mb-2">async fn <span className="text-yellow-200">transfer_funds</span>() {'{'}</div>
            
            <div className="pl-4 space-y-4 relative">
               
               {[1, 2, 3, 4].map((awaitNum) => (
                  <div key={awaitNum} className={`flex items-center gap-4 transition-opacity ${activeAwait === awaitNum ? "opacity-100" : "opacity-40"}`}>
                     <div className="w-6 text-right text-slate-600 text-xs">{awaitNum}</div>
                     <div className="flex-1">
                        {awaitNum === 1 && <span>db.verify_balance().<span className="text-pink-400">await</span>;</span>}
                        {awaitNum === 2 && <span>let lock = db.acquire_lock().<span className="text-pink-400">await</span>;</span>}
                        {awaitNum === 3 && <span>api.send_ledger_update().<span className="text-pink-400">await</span>;</span>}
                        {awaitNum === 4 && <span>lock.release().<span className="text-pink-400">await</span>;</span>}
                     </div>
                     
                     {/* Status / Bomb indicator */}
                     <div className="w-10 flex justify-center">
                        <AnimatePresence mode="wait">
                           {activeAwait === awaitNum && runState === "running" && currentRun === awaitNum && (
                              <motion.div
                                 key="bomb"
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1.5, rotate: [0, -10, 10, -10, 10, 0] }}
                                 exit={{ scale: 0, opacity: 0 }}
                                 transition={{ duration: 0.5 }}
                              >
                                 <Bomb className="h-5 w-5 text-orange-500" />
                              </motion.div>
                           )}
                           
                           {currentRun > awaitNum || (currentRun === awaitNum && runState === "passed") ? (
                              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                 <ShieldCheck className="h-5 w-5 text-green-500" />
                              </motion.div>
                           ) : currentRun === awaitNum && runState === "failed" ? (
                              <motion.div key="fail" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                 <ShieldAlert className="h-5 w-5 text-red-500" />
                              </motion.div>
                           ) : null}
                        </AnimatePresence>
                     </div>
                  </div>
               ))}
               
            </div>
            <div className="text-blue-400 mt-2">{'}'}</div>
         </div>

         {/* Failure Overlay */}
         <AnimatePresence>
          {runState === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md w-[90%] max-w-sm"
            >
              <div className="flex items-start gap-3">
                 <ShieldAlert className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-sm font-black text-red-400 uppercase tracking-widest">Oracle Violation Caught</h4>
                    <p className="text-xs text-red-200 mt-1">
                       <strong>ObligationLeak:</strong> Cancellation injected at `await` point 3 caused the function to exit without releasing `lock`.
                    </p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Progress Footer */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-center">
        <div className="text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Testing Strategy</div>
          <div className="text-sm font-medium text-slate-300">
             InjectionStrategy::AllPoints
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Pass / Fail</div>
          <div className="flex items-center gap-2 justify-end font-mono">
            <span className="text-green-400">{Math.min(currentRun - (runState === "failed" ? 1 : 0), totalAwaits)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-red-400">{runState === "failed" ? 1 : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
