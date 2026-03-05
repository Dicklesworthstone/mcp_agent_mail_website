"use client";

import { useState } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { Search, Brain, Merge, BarChart3, AlertTriangle, Database, Network, Shield, Lock } from "lucide-react";

/* ---------- data model ---------- */

type SearchMode = "hybrid" | "lexical-only" | "degraded";

export default function SearchV3PipelineViz() {
  const reducedMotion = useVizReducedMotion();
  const [mode, setMode] = useState<SearchMode>("hybrid");
  
  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
  };

  const isHybrid = mode === "hybrid";
  const isLexical = mode === "lexical-only" || mode === "hybrid";
  const isSemantic = mode === "hybrid";
  const isDegraded = mode === "degraded";

  const diagnostics =
    mode === "hybrid"
      ? {
          lexical: 42,
          secondaryLabel: "Semantic Candidates",
          secondaryValue: 28,
          finalResults: 20,
          elapsedMs: 12,
        }
      : mode === "lexical-only"
        ? {
            lexical: 38,
            secondaryLabel: "Semantic Candidates",
            secondaryValue: 0,
            finalResults: 20,
            elapsedMs: 4,
          }
        : {
            lexical: 12,
            secondaryLabel: "Fallback Scan Rows",
            secondaryValue: 500,
            finalResults: 12,
            elapsedMs: 45,
          };

  return (
    <VizSurface aria-label="Search V3 hybrid pipeline visualization">
      <VizHeader
        accent="violet"
        eyebrow="Retrieval Pipeline"
        title="Search V3: Hybrid + Degraded Paths"
        subtitle="Watch how queries propagate through the multi-tier retrieval engine. Compare candidate budgets, RRF fusion, and fallback behavior across modes."
        controls={
          <div className="flex flex-wrap gap-2">
            <VizControlButton
              tone={mode === "hybrid" ? "violet" : "neutral"}
              onClick={() => handleModeChange("hybrid")}
            >
              Hybrid
            </VizControlButton>
            <VizControlButton
              tone={mode === "lexical-only" ? "amber" : "neutral"}
              onClick={() => handleModeChange("lexical-only")}
            >
              Lexical Only
            </VizControlButton>
            <VizControlButton
              tone={mode === "degraded" ? "red" : "neutral"}
              onClick={() => handleModeChange("degraded")}
            >
              Degraded
            </VizControlButton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <VizMetricCard label="Lexical Candidates" value={diagnostics.lexical} tone="amber" />
        <VizMetricCard
          label={diagnostics.secondaryLabel}
          value={diagnostics.secondaryValue}
          tone={mode === "degraded" ? "red" : "blue"}
        />
        <VizMetricCard label="Final Results" value={diagnostics.finalResults} tone="green" />
        <VizMetricCard label="Latency" value={`${diagnostics.elapsedMs}ms`} tone={mode === "degraded" ? "red" : "neutral"} />
      </div>

      <div className="relative rounded-xl border border-slate-700/50 bg-[#0B1120] p-6 lg:p-12 overflow-hidden mb-6 min-h-[450px] flex flex-col items-center justify-center">
        
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

        {/* --- PIPELINE SVG --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">

             {/* Parse -> Split */}
             <path d="M 15 50 L 30 50" fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

             {/* Split -> Lexical */}
             <path d="M 30 50 C 40 50, 40 25, 50 25" fill="none" stroke={isLexical && !isDegraded ? "#F59E0B" : "#334155"} strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

             {/* Split -> Semantic */}
             <path d="M 30 50 C 40 50, 40 75, 50 75" fill="none" stroke={isSemantic ? "#8B5CF6" : "#334155"} strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

             {/* Split -> Fallback */}
             <path d="M 30 50 L 50 50" fill="none" stroke={isDegraded ? "#EF4444" : "#334155"} strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

             {/* Lexical -> Fusion */}
             <path d="M 50 25 C 65 25, 65 50, 75 50" fill="none" stroke={isLexical && !isDegraded ? "#F59E0B" : "#334155"} strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

             {/* Semantic -> Fusion */}
             <path d="M 50 75 C 65 75, 65 50, 75 50" fill="none" stroke={isSemantic ? "#8B5CF6" : "#334155"} strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

             {/* Fallback -> Ranking */}
             <path d="M 50 50 L 75 50" fill="none" stroke={isDegraded ? "#EF4444" : "transparent"} strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

             {/* Fusion -> Rank */}
             <path d="M 75 50 L 90 50" fill="none" stroke={!isDegraded ? "#22C55E" : "#EF4444"} strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

             {!reducedMotion && (
               <>
                 {/* Parse Particle */}
                 <motion.circle r="4" fill="#6366F1" filter="blur(1px)">
                   <animateMotion dur="1s" repeatCount="indefinite" path="M 15 50 L 30 50" />
                 </motion.circle>

                 {/* Lexical Particle */}
                 {isLexical && !isDegraded && (
                   <motion.circle r="4" fill="#F59E0B" filter="blur(1px)">
                     <animateMotion dur="1.5s" repeatCount="indefinite" begin="1s" path="M 30 50 C 40 50, 40 25, 50 25" />
                   </motion.circle>
                 )}
                 {isLexical && !isDegraded && (
                   <motion.circle r="4" fill="#F59E0B" filter="blur(1px)">
                     <animateMotion dur="1.5s" repeatCount="indefinite" begin="2.5s" path="M 50 25 C 65 25, 65 50, 75 50" />
                   </motion.circle>
                 )}

                 {/* Semantic Particle */}
                 {isSemantic && (
                   <motion.circle r="4" fill="#8B5CF6" filter="blur(1px)">
                     <animateMotion dur="1.5s" repeatCount="indefinite" begin="1s" path="M 30 50 C 40 50, 40 75, 50 75" />
                   </motion.circle>
                 )}
                 {isSemantic && (
                   <motion.circle r="4" fill="#8B5CF6" filter="blur(1px)">
                     <animateMotion dur="1.5s" repeatCount="indefinite" begin="2.5s" path="M 50 75 C 65 75, 65 50, 75 50" />
                   </motion.circle>
                 )}

                 {/* Fallback Particle */}
                 {isDegraded && (
                   <motion.circle r="4" fill="#EF4444" filter="blur(1px)">
                     <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 30 50 L 50 50" />
                   </motion.circle>
                 )}
                 {isDegraded && (
                   <motion.circle r="4" fill="#EF4444" filter="blur(1px)">
                     <animateMotion dur="1.5s" repeatCount="indefinite" begin="3s" path="M 50 50 L 75 50" />
                   </motion.circle>
                 )}

                 {/* Output Particle */}
                 <motion.circle r="4" fill={!isDegraded ? "#22C55E" : "#EF4444"} filter="blur(1px)">
                   <animateMotion dur="1s" repeatCount="indefinite" begin="4s" path="M 75 50 L 90 50" />
                 </motion.circle>
               </>
             )}
          </svg>
        </div>

        {/* --- NODES --- */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-[10%] lg:px-[15%] z-10 pointer-events-none">
          
          {/* 1. Parse Node */}
          <div className="flex flex-col items-center transform -translate-y-12 sm:translate-y-0">
            <div className="w-12 h-12 bg-indigo-500/10 border-2 border-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] backdrop-blur-md">
              <Search className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="mt-2 text-center bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-lg">
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Parse</p>
            </div>
          </div>

          {/* 2. Middle Tiers */}
          <div className="flex flex-col justify-between h-64 w-32 relative">
            
            {/* Lexical Tier */}
            <div className={`flex flex-col items-center transition-all duration-500 absolute -top-4 w-full ${isLexical && !isDegraded ? "opacity-100" : "opacity-30 grayscale"}`}>
              <div className="w-12 h-12 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md">
                <Database className="w-5 h-5 text-amber-400" />
              </div>
              <div className="mt-2 text-center bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-lg">
                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Lexical</p>
                <p className="text-[8px] text-amber-500/70 font-mono">FTS5 / BM25</p>
              </div>
            </div>

            {/* Fallback Tier */}
            <div className={`flex flex-col items-center transition-all duration-500 absolute top-1/2 -translate-y-1/2 w-full ${isDegraded ? "opacity-100" : "opacity-0"}`}>
              <div className="w-12 h-12 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] backdrop-blur-md">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="mt-2 text-center bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-lg">
                <p className="text-[10px] font-bold text-red-300 uppercase tracking-widest">Fallback</p>
                <p className="text-[8px] text-red-500/70 font-mono">Chrono Scan</p>
              </div>
            </div>

            {/* Semantic Tier */}
            <div className={`flex flex-col items-center transition-all duration-500 absolute -bottom-4 w-full ${isSemantic ? "opacity-100" : "opacity-30 grayscale"}`}>
              <div className="w-12 h-12 bg-violet-500/10 border-2 border-violet-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-md">
                <Brain className="w-5 h-5 text-violet-400" />
              </div>
              <div className="mt-2 text-center bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-lg">
                <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest">Semantic</p>
                <p className="text-[8px] text-violet-500/70 font-mono">Vector / Cosine</p>
              </div>
            </div>
          </div>

          {/* 3. Fusion & Rank Node */}
          <div className="flex flex-col items-center transform -translate-y-12 sm:translate-y-0">
            <div className={`w-14 h-14 bg-green-500/10 border-2 ${!isDegraded ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"} rounded-xl flex items-center justify-center backdrop-blur-md`}>
              <BarChart3 className={`w-6 h-6 ${!isDegraded ? "text-green-400" : "text-red-400"}`} />
            </div>
            <div className="mt-2 text-center bg-slate-900 border border-slate-800 rounded px-2 py-1 shadow-lg">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${!isDegraded ? "text-green-300" : "text-red-300"}`}>{isHybrid ? "RRF + Rank" : isDegraded ? "Best-Effort" : "BM25 Rank"}</p>
            </div>
          </div>

        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Mode indicator */}
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Pipeline Mode Execution
          </p>
          <div className="mt-3 flex items-center gap-2 mb-2">
            {mode === "hybrid" && (
              <>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-violet-500/20 text-violet-400"><Network className="w-4 h-4"/></span>
                <span className="text-sm font-bold text-violet-300">Hybrid (Lexical + Semantic)</span>
              </>
            )}
            {mode === "lexical-only" && (
              <>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500/20 text-amber-400"><Database className="w-4 h-4"/></span>
                <span className="text-sm font-bold text-amber-300">Lexical Only</span>
              </>
            )}
            {mode === "degraded" && (
              <>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-500/20 text-red-400"><AlertTriangle className="w-4 h-4"/></span>
                <span className="text-sm font-bold text-red-300">Degraded / Fallback</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {mode === "hybrid" &&
              "Query splits into parallel FTS5 and Vector database hits. Candidates are fused via Reciprocal Rank Fusion (RRF)."}
            {mode === "lexical-only" &&
              "Semantic tier disabled to save tokens. BM25 + field matching only."}
            {mode === "degraded" &&
              "SQLite index failure or embedding timeout. System gracefully degrades to a chronological LIKE scan to ensure operability."}
          </p>

          {/* Diagnostics Preview */}
          <div className="mt-4 bg-black/50 border border-slate-700 rounded p-3">
             <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Diagnostics Blob</p>
             <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap">
{mode === "hybrid" ? `{
  "mode": "hybrid",
  "query_class": "phrase",
  "lexical_candidates": 42,
  "semantic_candidates": 28,
  "fused_candidates": 55,
  "final_results": 20,
  "elapsed_ms": 12
}` : mode === "lexical-only" ? `{
  "mode": "lexical_only",
  "query_class": "keyword",
  "lexical_candidates": 38,
  "semantic_candidates": 0,
  "final_results": 20,
  "elapsed_ms": 4
}` : `{
  "mode": "degraded",
  "degraded_reason": "fts5_timeout",
  "fallback_scan_rows": 500,
  "final_results": 12,
  "elapsed_ms": 45
}`}
            </pre>
          </div>
        </article>

        {/* Top Results */}
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Top Results Preview
          </p>
          <div className="mt-4 space-y-3">
            {[
              { title: "Thread: reservation conflict remediation", score: mode === "degraded" ? "0.53" : "0.92", source: "project: mcp_agent_mail", icon: Merge, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
              { title: "Guard policy runbook", score: mode === "degraded" ? "0.47" : "0.84", source: "project: mcp_agent_mail_website", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
              { title: "Stale lock force-release message", score: mode === "degraded" ? "0.41" : "0.79", source: "thread: br-123", icon: Lock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
            ].map((result, i) => (
              <div key={i} className={`rounded-lg border bg-slate-900 p-3 transition-colors ${result.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-md mt-0.5 ${result.bg}`}>
                     <result.icon className={`w-3.5 h-3.5 ${result.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-200 leading-tight">{result.title}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="uppercase tracking-wider">{result.source}</span>
                      <span className="font-mono bg-black px-1.5 py-0.5 rounded text-slate-300">score={result.score}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="violet"
        title="Pedagogical Takeaways"
        items={[
          "Hybrid mode improves relevance by combining exact-match lexical precision with contextual semantic recall.",
          "Degraded mode preserves operability. Agents can still find recent messages even if vector embeddings fail.",
          "Search diagnostic payloads are always attached, letting operators see exactly why a document ranked highly.",
        ]}
      />
    </VizSurface>
  );
}