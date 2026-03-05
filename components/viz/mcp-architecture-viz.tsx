"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { Bot, Database, Layers, Server, Shield, TerminalSquare } from "lucide-react";

type FlowMode = "messaging" | "reservation" | "search";

const FLOW_META: Record<
  FlowMode,
  {
    label: string;
    accent: string;
    request: string;
    dbPath: string;
    archivePath: string;
    guarantees: string[];
    particleCount: number;
    speed: number;
  }
> = {
  messaging: {
    label: "Message Flow",
    accent: "#3B82F6", // blue
    request: "send_message / reply_message / fetch_inbox",
    dbPath: "messages + thread events + recipient envelopes",
    archivePath: "inbox/outbox markdown artifacts + thread continuity",
    guarantees: [
      "Targeted recipient routing",
      "Explicit read/ack transitions",
      "Thread replay with search continuity",
    ],
    particleCount: 5,
    speed: 2,
  },
  reservation: {
    label: "Reservation Flow",
    accent: "#F59E0B", // amber
    request: "file_reservation_paths / release / force-release",
    dbPath: "reservation rows + overlap checks + TTL state",
    archivePath: "guard-facing reservation artifacts + ownership history",
    guarantees: [
      "Advisory overlap detection",
      "TTL-based stale recovery",
      "Guard policy integration at commit/push",
    ],
    particleCount: 2,
    speed: 1.5,
  },
  search: {
    label: "Search Flow",
    accent: "#A855F7", // violet
    request: "search_messages / robot search / timeline",
    dbPath: "FTS5 index + thread joins + filters",
    archivePath: "Mostly read-heavy path (minimal new artifacts)",
    guarantees: [
      "Cross-thread retrieval",
      "Mode-aware diagnostics",
      "Scope filters across projects/products",
    ],
    particleCount: 15,
    speed: 0.8,
  },
};

export default function McpArchitectureViz() {
  const reducedMotion = useVizReducedMotion();
  const [mode, setMode] = useState<FlowMode>("messaging");
  const flow = useMemo(() => FLOW_META[mode], [mode]);

  return (
    <VizSurface aria-label="MCP Agent Mail Architecture" className="overflow-hidden">
      <div
        className="mb-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Select architecture flow mode"
      >
        <p className="mr-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/90">
          Flow Mode
        </p>
        <VizControlButton
          tone={mode === "messaging" ? "blue" : "neutral"}
          aria-pressed={mode === "messaging"}
          onClick={() => setMode("messaging")}
        >
          Message
        </VizControlButton>
        <VizControlButton
          tone={mode === "reservation" ? "amber" : "neutral"}
          aria-pressed={mode === "reservation"}
          onClick={() => setMode("reservation")}
        >
          Reservation
        </VizControlButton>
        <VizControlButton
          tone={mode === "search" ? "blue" : "neutral"}
          aria-pressed={mode === "search"}
          onClick={() => setMode("search")}
        >
          Search
        </VizControlButton>
      </div>

      <div className="relative mb-4 flex min-h-[420px] items-stretch overflow-hidden rounded-xl border border-white/10 bg-[#060A14] p-4 md:p-6">
        
        {/* Background Network SVG */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
             <path d="M 150 150 Q 300 250 500 250 T 850 150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-700" />
             <path d="M 150 350 Q 300 250 500 250 T 850 350" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-700" />

             {!reducedMotion && Array.from({ length: flow.particleCount }).map((_, i) => (
                <motion.circle key={`${mode}-${i}`} r="3" fill={flow.accent} filter="blur(1px)">
                   <animateMotion dur={`${flow.speed + (i * 0.2)}s`} repeatCount="indefinite" begin={`${i * (flow.speed / flow.particleCount)}s`} path={i % 2 === 0 ? "M 150 150 Q 300 250 500 250 T 850 150" : "M 150 350 Q 300 250 500 250 T 850 350"} />
                </motion.circle>
             ))}
          </svg>
        </div>

        <div className="relative z-10 grid w-full min-w-0 gap-4 xl:grid-cols-2 2xl:grid-cols-[1fr_1.4fr_1.15fr]">
          {/* Column 1: Clients */}
          <article className="min-w-0 rounded-xl border border-white/10 bg-black/60 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight break-words">
                Agent Clients
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 hover:bg-cyan-500/20 transition-colors">
                <div className="p-2 bg-cyan-900/50 rounded"><Bot className="h-4 w-4 text-cyan-400" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white break-words">Claude Code</p>
                  <p className="text-[10px] text-cyan-300 font-mono mt-0.5">stdio MCP client</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 hover:bg-orange-500/20 transition-colors">
                <div className="p-2 bg-orange-900/50 rounded"><Bot className="h-4 w-4 text-orange-400" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white break-words">Cursor / Windsurf</p>
                  <p className="text-[10px] text-orange-300 font-mono mt-0.5 break-words">SSE/HTTP MCP client</p>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-800 pt-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 leading-tight break-words">Active Protocol Envelope</p>
                 <pre className="overflow-x-auto rounded border border-white/5 bg-slate-900 p-2 text-[10px] font-mono text-slate-300 whitespace-pre-wrap break-all" style={{ color: flow.accent }}>{flow.request}</pre>
              </div>
            </div>
          </article>

          {/* Column 2: Server */}
          <article className="min-w-0 rounded-xl border p-5 shadow-2xl backdrop-blur-md flex flex-col justify-center transition-colors duration-500 overflow-hidden xl:order-3 xl:col-span-2 2xl:order-none 2xl:col-span-1" style={{ backgroundColor: `${flow.accent}15`, borderColor: `${flow.accent}50` }}>
            <div className="flex justify-center mb-6 relative">
              <div className="absolute inset-0 blur-xl opacity-50" style={{ backgroundColor: flow.accent }}></div>
              <div className="relative bg-black/50 border rounded-2xl p-4 flex items-center gap-3" style={{ borderColor: flow.accent }}>
                <Server className="h-8 w-8" style={{ color: flow.accent }} />
                <div className="min-w-0">
                  <p className="text-lg font-black text-white break-words">Agent Mail Server</p>
                  <p className="text-[10px] tracking-widest uppercase font-bold leading-tight" style={{ color: flow.accent }}>Rust Core Runtime</p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-1 leading-tight break-words"><Layers className="w-3 h-3" /> MCP Tool Layer</p>
                <p className="text-xs text-slate-300 break-words">Validates JSON-RPC payload, resolves project context & agent identity, enforces global contact/reservation rules.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-1 leading-tight break-words"><Shield className="w-3 h-3" /> Coordination Core</p>
                <p className="text-xs text-slate-300 break-words">Applies strict conflict checks, maintains thread continuity, and triggers mode-specific fallbacks.</p>
              </div>
            </div>
            
            <div className="mt-4 rounded-lg border border-white/10 bg-black/60 p-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 break-words">Active Pipeline Route</p>
              <AnimatePresence mode="wait">
                 <motion.p 
                   key={mode} 
                   initial={{ opacity: 0, y: 5 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   exit={{ opacity: 0, y: -5 }} 
                   className="text-sm font-bold tracking-wider uppercase" 
                   style={{ color: flow.accent }}
                 >
                   {flow.label}
                 </motion.p>
              </AnimatePresence>
            </div>
          </article>

          {/* Column 3: Storage */}
          <article className="min-w-0 rounded-xl border border-white/10 bg-black/60 p-5 shadow-xl backdrop-blur-md xl:order-2 2xl:order-none">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight break-words">Storage Layer</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm font-bold text-white break-words">SQLite + FTS5</p>
                </div>
                <p className="text-[10px] text-emerald-200/70 font-mono leading-relaxed break-words">{flow.dbPath}</p>
              </div>
              
              <div className="rounded-lg border border-slate-500/30 bg-slate-800/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TerminalSquare className="h-4 w-4 text-slate-300" />
                  <p className="text-sm font-bold text-white break-words">Git Archive</p>
                </div>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed break-words">{flow.archivePath}</p>
              </div>

              <div className="rounded-lg border border-white/5 bg-black/40 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 leading-tight break-words">Guarantees Applied</p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <AnimatePresence mode="wait">
                    {flow.guarantees.map((item, i) => (
                      <motion.li 
                        key={`${mode}-g-${i}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-2 items-start"
                      >
                        <Shield className="mt-0.5 h-3 w-3 shrink-0" style={{ color: flow.accent }} />
                        <span className="leading-tight break-words">{item}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </div>
    </VizSurface>
  );
}
