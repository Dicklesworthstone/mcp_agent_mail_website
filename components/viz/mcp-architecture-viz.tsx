"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
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
    <VizSurface aria-label="MCP Agent Mail Architecture">
      <VizHeader
        accent="cyan"
        eyebrow="System Design"
        title="Transport-to-Storage Architecture"
        subtitle="Compare how messaging, reservations, and search traverse the same MCP/runtime layers while producing different persistence and artifact behavior."
        controls={
          <div className="flex flex-wrap gap-2">
            <VizControlButton tone={mode === "messaging" ? "blue" : "neutral"} onClick={() => setMode("messaging")}>
              Message
            </VizControlButton>
            <VizControlButton tone={mode === "reservation" ? "amber" : "neutral"} onClick={() => setMode("reservation")}>
              Reservation
            </VizControlButton>
            <VizControlButton tone={mode === "search" ? "blue" : "neutral"} onClick={() => setMode("search")}>
              Search
            </VizControlButton>
          </div>
        }
      />

      <div className="relative rounded-xl border border-white/10 bg-[#060A14] p-6 lg:p-12 overflow-hidden mb-4 min-h-[500px] flex items-center">
        
        {/* Background Network SVG */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" preserveAspectRatio="none">
             <path d="M 15% 30% Q 30% 50% 50% 50% T 85% 30%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-700" />
             <path d="M 15% 70% Q 30% 50% 50% 50% T 85% 70%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-700" />
             
             {!reducedMotion && Array.from({ length: flow.particleCount }).map((_, i) => (
                <motion.circle key={`${mode}-${i}`} r="3" fill={flow.accent} filter="blur(1px)">
                   <animateMotion dur={`${flow.speed + (i * 0.2)}s`} repeatCount="indefinite" begin={`${i * (flow.speed / flow.particleCount)}s`} path={i % 2 === 0 ? "M 15% 30% Q 30% 50% 50% 50% T 85% 30%" : "M 15% 70% Q 30% 50% 50% 50% T 85% 70%"} />
                </motion.circle>
             ))}
          </svg>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr_1.2fr] w-full relative z-10">
          {/* Column 1: Clients */}
          <article className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Agent Clients</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 hover:bg-cyan-500/20 transition-colors">
                <div className="p-2 bg-cyan-900/50 rounded"><Bot className="h-4 w-4 text-cyan-400" /></div>
                <div>
                  <p className="text-sm font-bold text-white">Claude Code</p>
                  <p className="text-[10px] text-cyan-300 font-mono mt-0.5">stdio MCP client</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 hover:bg-orange-500/20 transition-colors">
                <div className="p-2 bg-orange-900/50 rounded"><Bot className="h-4 w-4 text-orange-400" /></div>
                <div>
                  <p className="text-sm font-bold text-white">Cursor / Windsurf</p>
                  <p className="text-[10px] text-orange-300 font-mono mt-0.5">SSE/HTTP MCP client</p>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-800 pt-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Active Protocol Envelope</p>
                 <pre className="overflow-x-auto rounded border border-white/5 bg-slate-900 p-2 text-[10px] font-mono text-slate-300" style={{ color: flow.accent }}>
  {flow.request}
                 </pre>
              </div>
            </div>
          </article>

          {/* Column 2: Server */}
          <article className="rounded-xl border p-5 shadow-2xl backdrop-blur-md flex flex-col justify-center transition-colors duration-500" style={{ backgroundColor: `${flow.accent}15`, borderColor: `${flow.accent}50` }}>
            <div className="flex justify-center mb-6 relative">
              <div className="absolute inset-0 blur-xl opacity-50" style={{ backgroundColor: flow.accent }}></div>
              <div className="relative bg-black/50 border rounded-2xl p-4 flex items-center gap-3" style={{ borderColor: flow.accent }}>
                <Server className="h-8 w-8" style={{ color: flow.accent }} />
                <div>
                  <p className="text-lg font-black text-white">Agent Mail Server</p>
                  <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: flow.accent }}>Rust Core Runtime</p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-1"><Layers className="w-3 h-3" /> MCP Tool Layer</p>
                <p className="text-xs text-slate-300">Validates JSON-RPC payload, resolves project context & agent identity, enforces global contact/reservation rules.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> Coordination Core</p>
                <p className="text-xs text-slate-300">Applies strict conflict checks, maintains thread continuity, and triggers mode-specific fallbacks.</p>
              </div>
            </div>
            
            <div className="mt-4 rounded-lg border border-white/10 bg-black/60 p-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Active Pipeline Route</p>
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
          <article className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Storage Layer</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm font-bold text-white">SQLite + FTS5</p>
                </div>
                <p className="text-[10px] text-emerald-200/70 font-mono leading-relaxed">{flow.dbPath}</p>
              </div>
              
              <div className="rounded-lg border border-slate-500/30 bg-slate-800/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TerminalSquare className="h-4 w-4 text-slate-300" />
                  <p className="text-sm font-bold text-white">Git Archive</p>
                </div>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">{flow.archivePath}</p>
              </div>

              <div className="rounded-lg border border-white/5 bg-black/40 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Guarantees Applied</p>
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
                        <span className="leading-tight">{item}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="cyan"
        title="Pedagogical Takeaways"
        items={[
          "One runtime serves all flows; only mode-specific invariants and persistence behavior differ.",
          "Messaging and reservations are artifact-heavy; search is mostly read-path with diagnostic output.",
          "Architectural clarity comes from tracing request -> coordination logic -> storage effects.",
        ]}
      />
    </VizSurface>
  );
}
