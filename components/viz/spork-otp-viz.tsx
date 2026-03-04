"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/components/motion";
import { GitMerge, ShieldAlert, Layers, ShieldCheck, Mail } from "lucide-react";

type MessageState = "idle" | "sending" | "received" | "processing" | "replied" | "leaked";

export default function SporkOtpViz() {
  const prefersReduced = useReducedMotion();
  const [msgState, setMsgState] = useState<MessageState>("idle");
  const [isRustMode, setIsRustMode] = useState(true);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const simulateMessage = () => {
    if (msgState !== "idle" && msgState !== "replied" && msgState !== "leaked") return;
    
    clearTimers();
    setMsgState("sending");
    
    const t1 = setTimeout(() => {
      setMsgState("received");
      const t2 = setTimeout(() => {
        setMsgState("processing");
        const t3 = setTimeout(() => {
          // In traditional OTP/Erlang, if the developer forgets to reply, it's a silent leak.
          // In Asupersync (Rust mode), the compiler enforces the reply obligation.
          if (isRustMode) {
             setMsgState("replied");
          } else {
             // Simulate developer forgetting to reply
             setMsgState("leaked");
          }
        }, 1500);
        timersRef.current.push(t3);
      }, 800);
      timersRef.current.push(t2);
    }, 800);
    timersRef.current.push(t1);
  };

  const handleModeSwitch = (rustMode: boolean) => {
    clearTimers();
    setIsRustMode(rustMode);
    setMsgState("idle");
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Spork (Erlang OTP in Rust)</h3>
          <p className="text-sm text-slate-400 mt-1">
            GenServers with mandatory Reply Obligations.
          </p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/10">
           <button 
             onClick={() => handleModeSwitch(false)}
             className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${!isRustMode ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
           >
             Traditional OTP
           </button>
           <button 
             onClick={() => handleModeSwitch(true)}
             className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${isRustMode ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
           >
             Asupersync
           </button>
        </div>
      </div>

      <div className="relative min-h-[16rem] py-8 flex items-center justify-between px-4 sm:px-12 border border-white/5 bg-black/40 rounded-xl overflow-x-auto">
         
         {/* Client Task */}
         <div className="flex flex-col items-center z-10 min-w-[100px]">
            <div className="h-16 w-16 rounded-xl border-2 border-slate-600 bg-slate-800 flex items-center justify-center mb-3">
               <Layers className="h-8 w-8 text-slate-400" />
            </div>
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center">Client Task</div>
            <button 
              onClick={simulateMessage}
              disabled={msgState !== "idle" && msgState !== "replied" && msgState !== "leaked"}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded text-[11px] font-bold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
               Call Server
            </button>
         </div>

         {/* Connection / Message Transit */}
         <div className="flex-1 relative min-w-[160px] h-full flex flex-col justify-center mx-4">
            {/* Track */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -translate-y-1/2" />
            
            {/* The Message / Obligation Token */}
            <AnimatePresence>
               {(msgState === "sending" || msgState === "received" || msgState === "processing") && (
                  <motion.div
                     initial={{ left: "0%" }}
                     animate={{ 
                       left: msgState === "sending" ? "50%" : "90%",
                       scale: msgState === "processing" ? 0 : 1
                     }}
                     transition={{ duration: prefersReduced ? 0 : 0.8 }}
                     className="absolute top-1/2 -translate-y-1/2 -ml-4"
                  >
                     <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center backdrop-blur-md">
                        <Mail className="h-4 w-4 text-blue-400" />
                     </div>
                     {isRustMode && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green-400 whitespace-nowrap bg-green-900/40 px-1.5 py-0.5 rounded border border-green-500/30">
                           + Reply Obligation
                        </div>
                     )}
                  </motion.div>
               )}

               {/* The Reply */}
               {msgState === "replied" && (
                  <motion.div
                     initial={{ left: "90%" }}
                     animate={{ left: "0%" }}
                     transition={{ duration: prefersReduced ? 0 : 0.8 }}
                     className="absolute top-1/2 -translate-y-1/2 -ml-4"
                  >
                     <div className="h-8 w-8 rounded-full bg-green-500/20 border border-green-400 flex items-center justify-center backdrop-blur-md">
                        <ShieldCheck className="h-4 w-4 text-green-400" />
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Error state (leaked) */}
            <AnimatePresence>
               {msgState === "leaked" && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                  >
                     <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-3 backdrop-blur-sm shadow-xl min-w-[140px]">
                        <ShieldAlert className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <div className="text-[11px] font-bold text-red-400 uppercase tracking-widest leading-tight">Client Hangs Forever</div>
                        <div className="text-[11px] text-red-300 mt-1">Server forgot to reply.</div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* GenServer */}
         <div className="flex flex-col items-center z-10 min-w-[100px]">
            <div className={`h-24 w-24 rounded-xl border-2 flex flex-col items-center justify-center mb-3 transition-colors duration-500 ${
               msgState === "processing" ? "border-blue-500 bg-blue-900/20" : 
               msgState === "leaked" ? "border-red-500 bg-red-900/20" :
               "border-slate-600 bg-slate-800"
            }`}>
               <GitMerge className={`h-8 w-8 mb-2 ${
                 msgState === "processing" ? "text-blue-400 animate-pulse" : 
                 msgState === "leaked" ? "text-red-400" :
                 "text-slate-400"
               }`} />
               <div className="text-[11px] font-mono text-slate-400 px-2 text-center">
                  {msgState === "idle" && "handle_call"}
                  {msgState === "sending" && "handle_call"}
                  {msgState === "received" && "handle_call"}
                  {msgState === "processing" && "Processing..."}
                  {msgState === "replied" && "handle_call"}
                  {msgState === "leaked" && "Dropped Reply!"}
               </div>
            </div>
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center">GenServer</div>
         </div>
      </div>

      {/* Description Panel */}
      <div className="mt-6 p-4 rounded-xl border border-white/5 bg-slate-800/30 text-sm text-slate-400 leading-relaxed">
         {isRustMode ? (
            <p><strong className="text-white">Asupersync Guarantee:</strong> GenServer requests are bundled with a linear <span className="text-blue-400 font-mono">ReplyObligation</span> token. The Rust compiler ensures the server developer <em className="text-slate-300">cannot</em> forget to reply. If the token is dropped unhandled, the code will not compile.</p>
         ) : (
            <p><strong className="text-white">Traditional Vulnerability:</strong> In standard Erlang/OTP or basic Rust channels, a server might hit an error path and return early without sending a reply. The client task will asynchronously hang forever waiting for a response that will never arrive.</p>
         )}
      </div>
    </div>
  );
}
