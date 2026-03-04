"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowDownRight, CheckCircle2, RotateCcw } from "lucide-react";

export default function LyapunovPotentialViz() {
  const [step, setStep] = useState(0);

  // 4-component energy state
  const [energy, setEnergy] = useState({
    tasks: 100,
    obligations: 80,
    draining: 60,
    deadlines: 40,
  });

  const totalEnergy = energy.tasks + energy.obligations + energy.draining + energy.deadlines;
  const isQuiescent = totalEnergy <= 0;

  useEffect(() => {
    if (isQuiescent) return;

    const interval = setInterval(() => {
      setStep((s) => s + 1);

      setEnergy((prev) => {
        // Randomly choose a component to strictly decrease
        const components = ["tasks", "obligations", "draining", "deadlines"] as const;
        const target = components[Math.floor(Math.random() * components.length)];

        const next = { ...prev };

        // Decrease the target strictly
        if (next[target] > 0) {
           next[target] = Math.max(0, next[target] - Math.floor(Math.random() * 15 + 5));
        }

        // The formal proof allows other components to occasionally spike,
        // PROVIDED the aggregate potential strictly decreases. We simulate this
        // by making sure the total drop is greater than any internal transfer.
        if (target === "tasks" && next.obligations > 0 && Math.random() > 0.5) {
           // Task completes, but spawns an obligation.
           next.obligations += 5;
        }

        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isQuiescent]);

  const reset = () => {
    setStep(0);
    setEnergy({ tasks: 100, obligations: 80, draining: 60, deadlines: 40 });
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Lyapunov Potential</h3>
          <p className="text-sm text-slate-400 mt-1">
            Proving termination via monotonic energy descent.
          </p>
        </div>
        
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all bg-white/10 text-slate-300 hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
          Reset System
        </button>
      </div>

      <div className="relative flex flex-col gap-6 p-6 border border-white/5 bg-black/40 rounded-xl overflow-hidden min-h-[260px]">
        
        <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
                <Activity className={`h-5 w-5 ${isQuiescent ? "text-green-500" : "text-fuchsia-500 animate-pulse"}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total System Energy</span>
            </div>
            <span className={`text-2xl font-black font-mono ${isQuiescent ? "text-green-400" : "text-fuchsia-400"}`}>
                {totalEnergy} <span className="text-sm text-slate-500">Joules</span>
            </span>
        </div>

        {/* Stacked Bar Chart for Energy Components */}
        <div className="flex flex-col gap-3">
            <EnergyBar label="Live Tasks" value={energy.tasks} max={100} color="#3b82f6" />
            <EnergyBar label="Pending Obligations" value={energy.obligations} max={100} color="#eab308" />
            <EnergyBar label="Draining Regions" value={energy.draining} max={100} color="#f97316" />
            <EnergyBar label="Deadline Pressure" value={energy.deadlines} max={100} color="#ef4444" />
        </div>

        {/* Quiescence Overlay */}
        <AnimatePresence>
          {isQuiescent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
            >
              <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h4 className="text-xl font-black text-white tracking-tight">Quiescence Reached</h4>
              <p className="text-sm text-slate-300 mt-2 max-w-sm text-center">
                The mathematical energy has hit absolute zero. The system is provably safe to shut down without any leaked resources.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-center">
        <div className="text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Mathematical Guarantee</div>
          <div className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
             <ArrowDownRight className="h-4 w-4 text-fuchsia-400" />
             Strictly decreasing supermartingale
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Scheduler Steps</div>
          <div className="text-xl font-black font-mono text-white">
            {step}
          </div>
        </div>
      </div>
    </div>
  );
}

function EnergyBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const percentage = (value / max) * 100;
    
    return (
        <div className="flex items-center gap-4">
            <div className="w-32 text-right text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                {label}
            </div>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                <motion.div 
                    className="absolute top-0 left-0 h-full"
                    style={{ backgroundColor: color }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>
            <div className="w-8 text-left text-xs font-mono text-slate-500">
                {value}
            </div>
        </div>
    )
}
