"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion";
import AgentMailTerminal, {
  type AgentMailTerminalHandle,
} from "@/components/agent-mail-terminal";
import {
  loadDashboardArtifacts,
  type DashboardRunnerStatus,
} from "@/lib/agent-mail-wasm";
import {
  Database,
  ExternalLink,
  Keyboard,
  Maximize2,
  Minimize2,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

if (typeof window !== "undefined") {
  void loadDashboardArtifacts().catch(() => {
    // AgentMailTerminal owns the visible fallback and retry path. Starting the
    // verified fetch here only removes the client-mount delay.
  });
}

export default function HeroMedia() {
  const hostRef = useRef<HTMLDivElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const wasDashboardFullscreenRef = useRef(false);
  const terminalRef = useRef<AgentMailTerminalHandle>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<DashboardRunnerStatus | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const effectivePaused = paused || prefersReducedMotion;

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === hostRef.current;
      const wasDashboardFullscreen = wasDashboardFullscreenRef.current;
      wasDashboardFullscreenRef.current = active;
      setIsFullscreen(active);
      window.requestAnimationFrame(() => {
        terminalRef.current?.refit();
        if (active) terminalRef.current?.focus();
        else if (wasDashboardFullscreen) fullscreenButtonRef.current?.focus();
      });
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    let settledFrame = 0;
    const layoutFrame = window.requestAnimationFrame(() => {
      terminalRef.current?.refit();
      settledFrame = window.requestAnimationFrame(() => terminalRef.current?.refit());
    });
    return () => {
      window.cancelAnimationFrame(layoutFrame);
      if (settledFrame) window.cancelAnimationFrame(settledFrame);
    };
  }, [isFullscreen]);

  async function toggleFullscreen() {
    setFullscreenError(null);
    try {
      if (document.fullscreenElement === hostRef.current) {
        await document.exitFullscreen();
      } else if (hostRef.current) {
        await hostRef.current.requestFullscreen();
      }
    } catch {
      setFullscreenError("Fullscreen is unavailable in this browser context.");
    }
  }

  return (
    <div
      ref={hostRef}
      className={`relative bg-[#020611] ${isFullscreen ? "flex h-screen w-screen flex-col overflow-hidden" : "overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_80px_rgba(2,132,199,0.16)]"}`}
      data-testid="hero-tui-demo"
      data-fullscreen={isFullscreen ? "true" : "false"}
    >
      <div
        className={`relative min-h-0 bg-black ${
          isFullscreen ? "flex-1" : "lg:h-[min(820px,50vw)]"
        }`}
      >
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
      </div>

      <div
        className={`border-t border-white/10 bg-[#050b15] px-3 py-3 sm:px-4 ${isFullscreen ? "shrink-0" : ""}`}
        data-testid="hero-dashboard-controls"
      >
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

          <button
            ref={fullscreenButtonRef}
            type="button"
            onClick={() => void toggleFullscreen()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-200 transition-colors hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label={isFullscreen ? "Exit dashboard fullscreen" : "Open dashboard fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>

          <a
            data-testid="hero-real-webapp-link"
            href="/showcase"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-200 transition-colors hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="Open the Agent Mail visualization showcase"
          >
            <ExternalLink className="h-3 w-3" />
            Showcase
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

        <div className="mt-3 grid gap-2 font-mono text-[9px] leading-relaxed text-slate-500 sm:grid-cols-3 sm:text-[10px]">
          <span className="inline-flex items-center gap-1.5">
            <Database className="h-3 w-3 text-blue-300" />
            {status
              ? `${status.projects.toLocaleString()} projects · ${status.agents.toLocaleString()} agents · ${status.messages.toLocaleString()} messages`
              : "Aggregate snapshot metrics load inside the verified pack"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MousePointer2 className="h-3 w-3 text-cyan-300" />
            Real aggregate counts from a read-only Agent Mail SQLite export. Names, paths, messages, and replay events are synthetic public-demo details.
          </span>
          <span className="inline-flex items-center gap-1.5 sm:justify-end">
            <ShieldCheck className="h-3 w-3 text-emerald-300" />
            {prefersReducedMotion ? "Reduced motion: deterministic static frame" : "18-second deterministic replay loop"}
          </span>
        </div>
        <p className="sr-only" aria-live="polite">{fullscreenError}</p>
      </div>
    </div>
  );
}
