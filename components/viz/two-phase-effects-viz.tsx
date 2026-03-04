"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/components/motion";
import { RotateCcw, CheckCircle2, XCircle } from "lucide-react";

type TxState = "idle" | "reserving" | "reserved" | "committing" | "committed" | "cancelling" | "rolled-back";

export default function TwoPhaseEffectsViz() {
  const prefersReduced = useReducedMotion();
  const [txState, setTxState] = useState<TxState>("idle");
  const [balanceA, setBalanceA] = useState(1000);
  const [balanceB, setBalanceB] = useState(500);
  const transferAmount = 200;

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const startTransfer = () => {
    if (txState !== "idle" && txState !== "committed" && txState !== "rolled-back") return;
    
    clearTimers();
    // Reset balances for demo
    setBalanceA(1000);
    setBalanceB(500);
    
    setTxState("reserving");
    const t1 = setTimeout(() => {
      setTxState("reserved");
    }, 1500);
    timersRef.current.push(t1);
  };

  const commitTransfer = () => {
    if (txState !== "reserved") return;
    clearTimers();
    setTxState("committing");
    
    const t1 = setTimeout(() => {
      setBalanceA(prev => prev - transferAmount);
      setBalanceB(prev => prev + transferAmount);
      setTxState("committed");
    }, 1000);
    timersRef.current.push(t1);
  };

  const cancelTransfer = () => {
    if (txState !== "reserved") return;
    clearTimers();
    setTxState("cancelling");
    
    const t1 = setTimeout(() => {
      setTxState("rolled-back");
    }, 1000);
    timersRef.current.push(t1);
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Two-Phase Effects</h3>
          <p className="text-sm text-slate-400 mt-1">
            Reserve side-effects safely. Cancel rolls back the reservation. Commit applies it permanently.
          </p>
        </div>
      </div>

      <div className="relative min-h-[200px] flex flex-col items-center justify-center p-6 border border-white/5 bg-black/40 rounded-xl">
        
        {/* State Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors duration-300"
          style={{
            backgroundColor: 
              txState === "idle" ? "#1e293b" :
              txState === "reserving" || txState === "reserved" ? "#eab30822" :
              txState === "cancelling" || txState === "rolled-back" ? "#ef444422" :
              "#22c55e22",
            color:
              txState === "idle" ? "#94a3b8" :
              txState === "reserving" || txState === "reserved" ? "#facc15" :
              txState === "cancelling" || txState === "rolled-back" ? "#f87171" :
              "#4ade80",
            borderColor:
              txState === "idle" ? "#334155" :
              txState === "reserving" || txState === "reserved" ? "#eab308" :
              txState === "cancelling" || txState === "rolled-back" ? "#ef4444" :
              "#22c55e",
            borderWidth: "1px"
          }}
        >
          {txState === "idle" && "Ready"}
          {txState === "reserving" && "Phase 1: Reserving..."}
          {txState === "reserved" && "Checkpoint: Awaiting Commit/Cancel"}
          {txState === "committing" && "Phase 2: Committing..."}
          {txState === "committed" && "Transaction Applied"}
          {txState === "cancelling" && "Rolling back reservation..."}
          {txState === "rolled-back" && "Transaction Cancelled Safely"}
        </div>

        {/* Accounts Visualization */}
        <div className="flex items-center justify-between w-full max-w-md mt-8">
          
          {/* Account A */}
          <div className="flex flex-col items-center">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Account A</div>
            <div className="relative h-16 w-24 flex items-center justify-center border border-white/20 rounded-lg bg-slate-800/50">
              <span className="text-xl font-mono text-white">${balanceA}</span>
              
              {/* Hold Indicator */}
              <AnimatePresence>
                {(txState === "reserving" || txState === "reserved" || txState === "cancelling") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -bottom-8 whitespace-nowrap text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded"
                  >
                    Hold: -${transferAmount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Transfer Arrow */}
          <div className="flex-1 flex flex-col items-center px-4 relative">
             <div className="w-full h-0.5 bg-slate-700 relative">
               <AnimatePresence>
                  {(txState === "committing" || txState === "committed") && (
                    <motion.div 
                      initial={{ width: 0, left: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: prefersReduced ? 0 : 0.8 }}
                      className="absolute top-0 left-0 h-full bg-green-500"
                    />
                  )}
               </AnimatePresence>
             </div>
             {txState === "rolled-back" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-2 text-red-500">
                  <XCircle className="h-6 w-6" />
                </div>
             )}
          </div>

          {/* Account B */}
          <div className="flex flex-col items-center">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Account B</div>
            <div className="relative h-16 w-24 flex items-center justify-center border border-white/20 rounded-lg bg-slate-800/50">
              <span className="text-xl font-mono text-white">${balanceB}</span>
              
              {/* Pending Credit Indicator */}
              <AnimatePresence>
                {(txState === "reserving" || txState === "reserved" || txState === "cancelling") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -bottom-8 whitespace-nowrap text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded"
                  >
                    Pending: +${transferAmount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mt-6">
        {(txState === "idle" || txState === "committed" || txState === "rolled-back") && (
          <button
            onClick={startTransfer}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Start Transfer
          </button>
        )}

        {txState === "reserved" && (
          <>
            <button
              onClick={commitTransfer}
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-500 transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              <CheckCircle2 className="h-4 w-4" />
              Commit
            </button>
            <button
              onClick={cancelTransfer}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <RotateCcw className="h-4 w-4" />
              Cancel Execution
            </button>
          </>
        )}
        
        {/* Placeholder for layout stability during animation */}
        {(txState === "reserving" || txState === "committing" || txState === "cancelling") && (
          <div className="h-10 px-5 flex items-center">
            <div className="h-4 w-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

    </div>
  );
}
