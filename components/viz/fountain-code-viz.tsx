"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/components/motion";
import { Download, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

export default function FountainCodeViz() {
  const prefersReduced = useReducedMotion();
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [receivedDrops, setReceivedDrops] = useState(0);
  const [lostDrops, setLostDrops] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "reconstructed">("idle");
  const dropsRef = useRef<number>(0);
  
  const targetDrops = 40; // Arbitrary target needed to reconstruct
  
  const startTransmission = () => {
    if (status === "sending") return;
    setStatus("sending");
    setIsTransmitting(true);
    setProgress(0);
    setReceivedDrops(0);
    setLostDrops(0);
    dropsRef.current = 0;
  };

  useEffect(() => {
    if (!isTransmitting) return;

    const interval = setInterval(() => {
      // Simulate a droplet being sent
      const isLost = Math.random() < 0.3; // 30% packet loss
      
      if (isLost) {
        setLostDrops(prev => prev + 1);
      } else {
        setReceivedDrops(prev => {
          const next = prev + 1;
          dropsRef.current = next;
          setProgress(Math.min(100, (next / targetDrops) * 100));
          return next;
        });
      }

      if (dropsRef.current >= targetDrops) {
        setIsTransmitting(false);
        setStatus("reconstructed");
        clearInterval(interval);
      }
    }, 100); // Send a drop every 100ms

    return () => clearInterval(interval);
  }, [isTransmitting]);

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">RaptorQ Data Transfer</h3>
          <p className="text-sm text-slate-400 mt-1">
            Rateless erasure coding over lossy channels.
          </p>
        </div>
        
        <button
          onClick={startTransmission}
          disabled={status === "sending"}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {status === "reconstructed" ? <RefreshCw className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          {status === "reconstructed" ? "Restart Transfer" : "Start Transfer"}
        </button>
      </div>

      <div className="relative min-h-[16rem] w-full flex flex-col items-center justify-center border border-white/5 bg-black/40 rounded-xl overflow-hidden py-8 px-4 sm:px-6">
        
        {/* Connection visualization */}
        <div className="flex items-center justify-between w-full max-w-sm mb-4">
          <div className="text-center">
            <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-400 font-black text-xs">TX</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sender</div>
          </div>

          {/* Droplet Stream Area */}
          <div className="flex-1 h-12 mx-4 relative overflow-hidden flex items-center bg-blue-900/10 rounded-full border border-blue-500/10">
            {/* We will just use a generic animated stream when active */}
            <AnimatePresence>
              {isTransmitting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5) 50%, transparent)",
                    backgroundSize: "200% 100%",
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ backgroundPosition: ["100% 0", "-100% 0"] }}
                    transition={{ repeat: Infinity, duration: prefersReduced ? 0 : 0.8, ease: "linear" }}
                    style={{
                       backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(59,130,246,0.8) 10px, rgba(59,130,246,0.8) 15px)"
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Interference marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-12 flex flex-col justify-center items-center opacity-50">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mb-1" />
                <span className="text-[8px] text-yellow-500 font-bold uppercase">30% Loss</span>
            </div>
          </div>

          <div className="text-center">
            <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center mx-auto mb-2">
              <span className="text-green-400 font-black text-xs">RX</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Receiver</div>
          </div>
        </div>

        {/* Reconstruction Bucket */}
        <div className="w-full max-w-sm">
          <div className="flex justify-between items-end mb-2">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reconstruction Buffer</span>
             <span className="text-xs font-mono font-bold text-blue-400">{Math.floor(progress)}%</span>
          </div>
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
             <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: prefersReduced ? 0 : 0.1 }}
             />
             {status === "reconstructed" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-green-500"
                />
             )}
          </div>
        </div>

        {/* Success Overlay */}
        <AnimatePresence>
          {status === "reconstructed" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10"
            >
              <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h4 className="text-xl font-black text-white">File Reconstructed</h4>
              <p className="text-sm text-slate-300 mt-2 text-center max-w-xs">
                Sufficient encoded symbols received. No retransmission requests (NACKs) were required despite 30% packet loss.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Metrics */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Status</div>
          <div className={`text-sm font-black uppercase ${status === "idle" ? "text-slate-500" : status === "sending" ? "text-blue-400" : "text-green-400"}`}>
            {status}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Symbols Received</div>
          <div className="text-lg font-black font-mono text-white">
            {receivedDrops} <span className="text-xs text-slate-500">/ {targetDrops}</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Symbols Lost</div>
          <div className="text-lg font-black font-mono text-red-400">
            {lostDrops}
          </div>
        </div>
      </div>
    </div>
  );
}
