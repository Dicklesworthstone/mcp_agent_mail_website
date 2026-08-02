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
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
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
      className={`group relative bg-[#020611] ${isFullscreen ? "flex h-dvh w-screen flex-col overflow-hidden" : "w-full overflow-visible"}`}
      data-testid="hero-tui-demo"
      data-fullscreen={isFullscreen ? "true" : "false"}
      data-active-screen={loadError ? "error" : status?.active_screen ?? "loading"}
      data-dashboard-filter={loadError ? "error" : status?.dashboard_filter ?? "loading"}
      data-frame-index={status?.frame_index ?? 0}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
    >
      <div
        className={`absolute right-0 z-20 flex items-center gap-1 border border-white/10 bg-[#020611]/90 p-1 backdrop-blur-sm transition-opacity hover:opacity-100 focus-within:opacity-100 ${
          isFullscreen ? "top-7 opacity-40" : "bottom-[calc(100%+0.25rem)] opacity-70"
        }`}
        data-testid="hero-dashboard-controls"
      >
        <button
          type="button"
          onClick={() => setPaused((current) => !current)}
          className="grid h-9 w-9 place-items-center text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={effectivePaused ? "Play dashboard replay" : "Pause dashboard replay"}
          disabled={prefersReducedMotion}
          title={effectivePaused ? "Play replay" : "Pause replay"}
        >
          {effectivePaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => terminalRef.current?.reset()}
          className="grid h-9 w-9 place-items-center text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label="Reset dashboard replay"
          title="Reset replay"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          ref={fullscreenButtonRef}
          type="button"
          onClick={() => void toggleFullscreen()}
          className="inline-flex h-9 items-center gap-1.5 bg-blue-500/15 px-2.5 text-xs font-bold text-blue-100 transition-colors hover:bg-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          aria-label={isFullscreen ? "Exit dashboard fullscreen" : "Open dashboard fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Fill browser window"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
        </button>
      </div>

      <div
        className={`relative min-h-0 bg-black ${
          isFullscreen ? "flex-1" : "aspect-[2/1] min-h-[340px] w-full sm:min-h-[440px]"
        }`}
      >
        <AgentMailTerminal
          ref={terminalRef}
          paused={effectivePaused}
          reducedMotion={prefersReducedMotion}
          onError={() => {
            setLoadError(true);
            setStatus(null);
          }}
          onReady={(nextStatus) => {
            setLoadError(false);
            setStatus(nextStatus);
          }}
          onStatus={setStatus}
        />
      </div>

      <p
        className={`pointer-events-none absolute z-10 bg-[#020611]/90 px-2 py-1 font-mono text-[9px] text-cyan-100 opacity-0 transition-opacity group-focus-within:opacity-100 ${
          isFullscreen ? "bottom-2 left-2" : "bottom-[calc(100%+0.25rem)] left-0"
        }`}
      >
        Ctrl+Esc returns keyboard focus to the page
      </p>

      <p data-testid="hero-dashboard-runtime-status" className="sr-only" aria-live="polite">
        {loadError
          ? "Interactive terminal unavailable; static preview shown."
          : status
            ? `Agent Mail ${status.active_screen} screen ready. ${status.projects} projects, ${status.agents} agents, ${status.messages} messages.`
            : "Verifying Agent Mail browser assets."}
        {" Aggregate counts come from a read-only Agent Mail SQLite export; names, paths, messages, and replay events are synthetic public-demo details."}
        {fullscreenError ? ` ${fullscreenError}` : ""}
      </p>
    </div>
  );
}
