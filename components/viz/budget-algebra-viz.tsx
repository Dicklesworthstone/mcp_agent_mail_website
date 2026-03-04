"use client";

import { useState } from "react";
import { Activity, Clock, ArrowDown } from "lucide-react";

export default function BudgetAlgebraViz() {
  const [sysDeadline, setSysDeadline] = useState(10);
  const [sysPriority, setSysPriority] = useState(1);
  
  const [srvDeadline, setSrvDeadline] = useState(5);
  const [srvPriority, setSrvPriority] = useState(3);
  
  const [hndDeadline, setHndDeadline] = useState(15);
  const [hndPriority, setHndPriority] = useState(2);

  // Semiring logic
  const effSysDeadline = sysDeadline;
  const effSysPriority = sysPriority;

  const effSrvDeadline = Math.min(effSysDeadline, srvDeadline);
  const effSrvPriority = Math.max(effSysPriority, srvPriority);

  const effHndDeadline = Math.min(effSrvDeadline, hndDeadline);
  const effHndPriority = Math.max(effSrvPriority, hndPriority);

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Budget Algebra</h3>
          <p className="text-sm text-slate-400 mt-1">
            Cancel budgets compose as a product semiring across nested regions.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <BudgetNode 
           title="Root Region" 
           localDeadline={sysDeadline} 
           localPriority={sysPriority}
           effDeadline={effSysDeadline}
           effPriority={effSysPriority}
           setDeadline={setSysDeadline}
           setPriority={setSysPriority}
        />
        <ArrowDown className="text-slate-600 h-5 w-5" />
        <BudgetNode 
           title="Server Region" 
           localDeadline={srvDeadline} 
           localPriority={srvPriority}
           effDeadline={effSrvDeadline}
           effPriority={effSrvPriority}
           setDeadline={setSrvDeadline}
           setPriority={setSrvPriority}
        />
        <ArrowDown className="text-slate-600 h-5 w-5" />
        <BudgetNode 
           title="Handler Region" 
           localDeadline={hndDeadline} 
           localPriority={hndPriority}
           effDeadline={effHndDeadline}
           effPriority={effHndPriority}
           setDeadline={setHndDeadline}
           setPriority={setHndPriority}
        />
      </div>

      <div className="mt-8 p-4 rounded-xl border border-white/5 bg-slate-800/30 text-sm text-slate-400 leading-relaxed text-center">
         <p>
            <strong className="text-white">The Semiring Rules:</strong> Deadlines compose using <code className="text-blue-400 bg-blue-900/30 px-1 rounded">min()</code> because a child cannot outlive its parent. Priorities compose using <code className="text-orange-400 bg-orange-900/30 px-1 rounded">max()</code> because a critical child task forces the entire cancellation tree to be prioritized.
         </p>
      </div>
    </div>
  );
}

function BudgetNode({ title, localDeadline, localPriority, effDeadline, effPriority, setDeadline, setPriority }: {
  title: string;
  localDeadline: number;
  localPriority: number;
  effDeadline: number;
  effPriority: number;
  setDeadline: (v: number) => void;
  setPriority: (v: number) => void;
}) {
   return (
      <div className="w-full max-w-md bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
         <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 font-bold text-sm text-slate-300">
            {title}
         </div>
         <div className="flex divide-x divide-slate-800">
            {/* Inputs */}
            <div className="p-4 flex-1 space-y-4">
               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Requested Budget</div>
               
               <div>
                  <div className="flex justify-between text-xs mb-2">
                     <span className="text-slate-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Deadline</span>
                     <span className="font-mono text-blue-400 font-medium">{localDeadline}s</span>
                  </div>
                  <input 
                     type="range" min="1" max="20" value={localDeadline} 
                     onChange={(e) => setDeadline(parseInt(e.target.value))}
                     className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 hover:[&::-webkit-slider-thumb]:bg-blue-400 transition-all"
                  />
               </div>
               
               <div>
                  <div className="flex justify-between text-xs mb-2">
                     <span className="text-slate-400 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Priority</span>
                     <span className="font-mono text-orange-400 font-medium">P{localPriority}</span>
                  </div>
                  <input 
                     type="range" min="1" max="5" value={localPriority} 
                     onChange={(e) => setPriority(parseInt(e.target.value))}
                     className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 hover:[&::-webkit-slider-thumb]:bg-orange-400 transition-all"
                  />
               </div>
            </div>
            
            {/* Effective Outputs */}
            <div className="p-4 w-32 flex flex-col justify-center items-center bg-slate-900/40">
               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 text-center">Effective</div>
               
               <div className="flex flex-col gap-2 w-full">
                  <div className="bg-slate-950 border border-blue-500/30 rounded-lg p-2 text-center shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                     <div className="text-[10px] text-blue-400 uppercase tracking-wider">Deadline</div>
                     <div className="font-mono font-black text-white text-base">{effDeadline}s</div>
                  </div>
                  <div className="bg-slate-950 border border-orange-500/30 rounded-lg p-2 text-center shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                     <div className="text-[10px] text-orange-400 uppercase tracking-wider">Priority</div>
                     <div className="font-mono font-black text-white text-base">P{effPriority}</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
