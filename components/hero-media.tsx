"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion";
import AgentMailTerminal, {
  type AgentMailTerminalHandle,
} from "@/components/agent-mail-terminal";
import type { DashboardRunnerStatus } from "@/lib/agent-mail-wasm";
import {
  Database,
  ExternalLink,
  Keyboard,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function HeroMedia() {
  const terminalRef = useRef<AgentMailTerminalHandle>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<DashboardRunnerStatus | null>(null);
  const [loadError, setLoadError] = useState(false);
  const effectivePaused = paused || prefersReducedMotion;

  return (
    <div className="relative" data-testid="hero-tui-demo">
      <div className="relative min-h-[360px] overflow-hidden bg-[#020a14] p-3 sm:p-5 md:min-h-[500px] md:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.12),transparent_55%)]" />
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/25 bg-black/50 shadow-[0_30px_100px_rgba(2,132,199,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/95 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400 sm:px-4 sm:text-[10px]">
            <span className="inline-flex items-center gap-2 text-cyan-200">
              <Zap className="h-3 w-3" />
              Production DashboardScreen · Rust → WASM
            </span>
            <span className="inline-flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="h-3 w-3" />
              Verified public replay
            </span>
          </div>

          <AgentMailTerminal
            ref={terminalRef}
            paused={effectivePaused}
            reducedMotion={prefersReducedMotion}
            onError={() => setLoadError(true)}
            onReady={(nextStatus) => {
              setLoadError(false);
              setStatus(nextStatus);
            }}
            onStatus={setStatus}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 pb-4 pt-12 sm:px-5">
            <p className="text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
              The actual Agent Mail TUI, running in your browser
            </p>
            <p className="mt-1 max-w-3xl font-mono text-[9px] leading-relaxed text-slate-300 sm:text-[10px]">
              Real aggregate counts from a read-only Agent Mail SQLite export. Names, paths, messages, and replay events are synthetic public-demo details.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/45 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={effectivePaused ? "Play dashboard replay" : "Pause dashboard replay"}
            disabled={prefersReducedMotion}
          >
            {effectivePaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {effectivePaused ? "Play" : "Pause"}
          </button>

          <button
            type="button"
            onClick={() => terminalRef.current?.reset()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label="Reset dashboard replay"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>

          <button
            type="button"
            onClick={() => terminalRef.current?.focus()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-200 transition-colors hover:bg-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label="Focus interactive terminal"
          >
            <Keyboard className="h-3 w-3" />
            Interact
          </button>

          <a
            data-testid="hero-real-webapp-link"
            href="/showcase"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-200 transition-colors hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="Open the Agent Mail visualization showcase"
          >
            <ExternalLink className="h-3 w-3" />
            Full Showcase
          </a>

          <span
            data-testid="hero-dashboard-runtime-status"
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${
              loadError
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                : status
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-500/30 bg-slate-500/10 text-slate-400"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {loadError ? "Static fallback" : status ? `WASM frame ${status.frame_index}` : "Verifying assets"}
          </span>
        </div>

        <div className="mt-3 grid gap-2 text-[10px] text-slate-500 sm:grid-cols-3">
          <span className="inline-flex items-center gap-1.5">
            <Database className="h-3 w-3 text-blue-300" />
            {status
              ? `${status.projects.toLocaleString()} projects · ${status.agents.toLocaleString()} agents · ${status.messages.toLocaleString()} messages`
              : "Aggregate snapshot metrics load inside the verified pack"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MousePointer2 className="h-3 w-3 text-cyan-300" />
            Click the terminal, then use arrows, j/k, /, Enter, Esc, and number keys
          </span>
          <span className="inline-flex items-center gap-1.5 sm:justify-end">
            <ShieldCheck className="h-3 w-3 text-emerald-300" />
            {prefersReducedMotion ? "Reduced motion: deterministic static frame" : "18-second deterministic replay loop"}
          </span>
        </div>
      </div>
    </div>
  );
}
