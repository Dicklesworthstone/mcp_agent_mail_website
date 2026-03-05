"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { Search, Zap, Brain, Merge, BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react";

/* ---------- data model ---------- */

interface PipelineStage {
  id: string;
  label: string;
  icon: "parse" | "lexical" | "semantic" | "fusion" | "rank" | "fallback";
  description: string;
  detail: string[];
}

type SearchMode = "hybrid" | "lexical-only" | "degraded";

const HYBRID_STAGES: PipelineStage[] = [
  {
    id: "parse",
    label: "Query Parse",
    icon: "parse",
    description:
      "Raw query is tokenized, field prefixes extracted (subject:, body:, from:), and the query class is determined.",
    detail: [
      "Tokenize input string",
      "Extract field filters (subject:, body:, from:, to:)",
      "Detect query class: keyword, phrase, boolean, wildcard",
      "Derive candidate budget from query complexity",
    ],
  },
  {
    id: "lexical",
    label: "Lexical Tier",
    icon: "lexical",
    description:
      "FTS5 full-text search over the message corpus with field-weighted BM25 scoring.",
    detail: [
      "SQLite FTS5 query execution",
      "BM25 relevance scoring per document",
      "Field weighting: subject 3x, body 1x, sender 2x",
      "Budget cap: top-K candidates (K derived from query budget)",
    ],
  },
  {
    id: "semantic",
    label: "Semantic Tier",
    icon: "semantic",
    description:
      "Embedding-based similarity search over vector representations of messages.",
    detail: [
      "Encode query via embedding model",
      "Cosine similarity against stored vectors",
      "Cross-project reach via product bus (if enabled)",
      "Budget cap: top-M candidates (M = budget - K)",
    ],
  },
  {
    id: "fusion",
    label: "Fusion",
    icon: "fusion",
    description:
      "Reciprocal Rank Fusion (RRF) merges lexical and semantic candidate lists into a unified ranking.",
    detail: [
      "Deduplicate overlapping candidates",
      "RRF score = Σ 1/(k + rank_i) across tiers",
      "Recency boost: exponential decay on message age",
      "Project-scope weighting for cross-project queries",
    ],
  },
  {
    id: "rank",
    label: "Rerank & Score",
    icon: "rank",
    description:
      "Final reranking applies field-match boosts, thread-coherence signals, and produces the scored result set.",
    detail: [
      "Apply field-match bonus (exact subject hit → +weight)",
      "Thread coherence: boost messages in same thread cluster",
      "Normalize scores to [0, 1] range",
      "Emit diagnostics: per-result score breakdown",
    ],
  },
];

const LEXICAL_ONLY_STAGES: PipelineStage[] = [
  HYBRID_STAGES[0],
  HYBRID_STAGES[1],
  {
    id: "rank-lexical",
    label: "Rank (Lexical)",
    icon: "rank",
    description:
      "Without semantic tier, ranking uses BM25 scores with field-match and recency boosts only.",
    detail: [
      "BM25 + field-match bonus",
      "Recency boost applied",
      "No fusion step needed",
      "Diagnostics note: semantic tier skipped",
    ],
  },
];

const DEGRADED_STAGES: PipelineStage[] = [
  HYBRID_STAGES[0],
  {
    id: "fallback",
    label: "Fallback",
    icon: "fallback",
    description:
      "When both tiers fail or budget is exhausted, the pipeline falls back to recent-message scan.",
    detail: [
      "Detect failure: FTS5 timeout or embedding unavailable",
      "Switch to chronological scan with LIKE matching",
      "Limited to last N messages (configurable)",
      "Diagnostics: degraded mode flag + reason",
    ],
  },
  {
    id: "rank-degraded",
    label: "Best-Effort Rank",
    icon: "rank",
    description:
      "Degraded ranking uses recency as primary signal with basic keyword overlap scoring.",
    detail: [
      "Recency-first ordering",
      "Simple keyword overlap score",
      "No fusion or reranking",
      "Result includes degraded_mode: true in diagnostics",
    ],
  },
];

function getStages(mode: SearchMode): PipelineStage[] {
  switch (mode) {
    case "hybrid":
      return HYBRID_STAGES;
    case "lexical-only":
      return LEXICAL_ONLY_STAGES;
    case "degraded":
      return DEGRADED_STAGES;
  }
}

const ICON_MAP = {
  parse: Search,
  lexical: Zap,
  semantic: Brain,
  fusion: Merge,
  rank: BarChart3,
  fallback: AlertTriangle,
} as const;

const STAGE_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  parse: { border: "#6366F1", bg: "#6366F11A", text: "#A5B4FC" },
  lexical: { border: "#F59E0B", bg: "#F59E0B1A", text: "#FCD34D" },
  semantic: { border: "#8B5CF6", bg: "#8B5CF61A", text: "#C4B5FD" },
  fusion: { border: "#3B82F6", bg: "#3B82F61A", text: "#93C5FD" },
  rank: { border: "#22C55E", bg: "#22C55E1A", text: "#86EFAC" },
  fallback: { border: "#EF4444", bg: "#EF44441A", text: "#FCA5A5" },
};

/* ---------- budget viz ---------- */

interface BudgetBarProps {
  lexicalPct: number;
  semanticPct: number;
  mode: SearchMode;
}

function BudgetBar({ lexicalPct, semanticPct, mode }: BudgetBarProps) {
  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
        Candidate Budget Allocation
      </p>
      <div className="relative h-6 w-full rounded-full bg-slate-800 overflow-hidden flex">
        <motion.div
          className="h-full"
          style={{ backgroundColor: "#F59E0B" }}
          initial={{ width: 0 }}
          animate={{ width: `${lexicalPct}%` }}
          transition={{ duration: 0.5 }}
        />
        {mode === "hybrid" && (
          <motion.div
            className="h-full"
            style={{ backgroundColor: "#8B5CF6" }}
            initial={{ width: 0 }}
            animate={{ width: `${semanticPct}%` }}
            transition={{ duration: 0.5, delay: 0.15 }}
          />
        )}
        {mode === "degraded" && (
          <motion.div
            className="h-full"
            style={{ backgroundColor: "#EF4444" }}
            initial={{ width: 0 }}
            animate={{ width: `${semanticPct}%` }}
            transition={{ duration: 0.5, delay: 0.15 }}
          />
        )}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> Lexical {lexicalPct}%
        </span>
        {mode === "hybrid" && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500" /> Semantic{" "}
            {semanticPct}%
          </span>
        )}
        {mode === "degraded" && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> Fallback scan{" "}
            {semanticPct}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- main viz ---------- */

export default function SearchV3PipelineViz() {
  const reducedMotion = useVizReducedMotion();
  const [mode, setMode] = useState<SearchMode>("hybrid");
  const [stepIndex, setStepIndex] = useState(0);

  const stages = useMemo(() => getStages(mode), [mode]);
  const clampedStep = Math.min(stepIndex, stages.length - 1);
  const currentStage = stages[clampedStep];

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    setStepIndex(0);
  };

  const budgetConfig: Record<SearchMode, { lexical: number; semantic: number }> = {
    hybrid: { lexical: 55, semantic: 45 },
    "lexical-only": { lexical: 100, semantic: 0 },
    degraded: { lexical: 30, semantic: 70 },
  };

  const budget = budgetConfig[mode];
  const Icon = ICON_MAP[currentStage.icon];
  const color = STAGE_COLORS[currentStage.icon];

  return (
    <VizSurface aria-label="Search V3 hybrid pipeline visualization">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Search V3 Hybrid Pipeline</h3>
          <p className="text-sm text-slate-400">
            Step through query parse → lexical/semantic retrieval → fusion → reranking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <VizControlButton
            tone={mode === "hybrid" ? "blue" : "neutral"}
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
      </div>

      {/* Pipeline stages */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
          {stages.map((stage, idx) => {
            const isCurrent = idx === clampedStep;
            const isDone = idx < clampedStep;
            const stageColor = STAGE_COLORS[stage.icon];
            const StageIcon = ICON_MAP[stage.icon];
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setStepIndex(idx)}
                className="relative rounded-lg border p-3 text-left transition-colors cursor-pointer"
                style={{
                  borderColor: isCurrent ? stageColor.border : isDone ? "#22C55E66" : "#334155",
                  background: isCurrent ? stageColor.bg : isDone ? "#22C55E14" : "#020617",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <StageIcon
                    className="w-4 h-4"
                    style={{ color: isCurrent ? stageColor.text : isDone ? "#86EFAC" : "#64748B" }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {idx + 1}/{stages.length}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">{stage.label}</p>
                {isCurrent && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stageColor.border }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: [0.45, 1, 0.45] }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity }}
                  />
                )}
                {isDone && (
                  <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 text-green-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Arrow connectors (visible on md+) */}
        <div className="hidden md:flex items-center justify-around mt-2 px-8">
          {stages.slice(0, -1).map((_, idx) => (
            <motion.div
              key={idx}
              className="flex-1 h-0.5 mx-1 rounded-full"
              style={{
                backgroundColor: idx < clampedStep ? "#22C55E" : idx === clampedStep ? STAGE_COLORS[stages[idx].icon].border : "#334155",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap gap-2">
          <VizControlButton
            tone="neutral"
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={clampedStep === 0}
          >
            Previous
          </VizControlButton>
          <VizControlButton
            tone="blue"
            onClick={() => setStepIndex((prev) => Math.min(stages.length - 1, prev + 1))}
            disabled={clampedStep >= stages.length - 1}
          >
            Next
          </VizControlButton>
          <VizControlButton tone="neutral" onClick={() => setStepIndex(0)}>
            Reset
          </VizControlButton>
        </div>
      </div>

      {/* Detail panels */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.article
            key={currentStage.id}
            className="rounded-xl border border-white/10 bg-black/30 p-4"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" style={{ color: color.text }} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Current Stage
              </p>
            </div>
            <p className="mt-2 text-base font-bold text-white">{currentStage.label}</p>
            <p className="mt-2 text-sm text-slate-300">{currentStage.description}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {currentStage.detail.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-slate-600 select-none">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.article>
        </AnimatePresence>

        <div className="flex flex-col gap-4">
          {/* Mode indicator */}
          <article className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Pipeline Mode
            </p>
            <div className="mt-2 flex items-center gap-2">
              {mode === "hybrid" && (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-bold text-blue-200">Hybrid (Lexical + Semantic)</span>
                </>
              )}
              {mode === "lexical-only" && (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-bold text-amber-200">Lexical Only</span>
                </>
              )}
              {mode === "degraded" && (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-bold text-red-200">Degraded / Fallback</span>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {mode === "hybrid" &&
                "Full pipeline: lexical FTS5 + semantic embeddings fused via RRF."}
              {mode === "lexical-only" &&
                "Semantic tier disabled. BM25 + field matching only."}
              {mode === "degraded" &&
                "Both tiers failed. Falling back to chronological LIKE scan."}
            </p>
          </article>

          {/* Budget bar */}
          <BudgetBar
            lexicalPct={budget.lexical}
            semanticPct={budget.semantic}
            mode={mode}
          />

          {/* Diagnostics */}
          <article className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Diagnostics Output
            </p>
            <pre className="mt-2 text-xs text-slate-400 font-mono whitespace-pre-wrap overflow-x-auto">
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
  "semantic_skip_reason": "disabled",
  "elapsed_ms": 4
}` : `{
  "mode": "degraded",
  "degraded_reason": "fts5_timeout",
  "fallback_scan_rows": 500,
  "final_results": 12,
  "elapsed_ms": 45,
  "degraded_mode": true
}`}
            </pre>
          </article>
        </div>
      </div>
    </VizSurface>
  );
}
