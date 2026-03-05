"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Play,
  Pause,
  FileText,
  List,
  ChevronRight,
  ExternalLink,
  Activity,
  MessageSquare,
  Users,
  ShieldAlert,
} from "lucide-react";
import {
  heroDemoTranscript,
  heroTuiDemo,
} from "@/lib/content";
import { toSafeHref } from "@/lib/utils";

function parseTimecodeToMs(timecode: string): number {
  const [mins = "0", rest = "0.000"] = timecode.split(":");
  const [secs = "0", ms = "0"] = rest.split(".");
  return (
    (Number.parseInt(mins, 10) || 0) * 60_000 +
    (Number.parseInt(secs, 10) || 0) * 1_000 +
    (Number.parseInt(ms, 10) || 0)
  );
}

function normalizeEpochMs(ts: number): number {
  // Support ns/us/ms/s epochs without drifting normal ms timestamps into 1970.
  if (ts >= 1_000_000_000_000_000_000) {
    return Math.floor(ts / 1_000_000);
  }
  if (ts >= 1_000_000_000_000_000) {
    return Math.floor(ts / 1_000);
  }
  if (ts >= 1_000_000_000_000) {
    return ts;
  }
  if (ts >= 1_000_000_000) {
    return ts * 1_000;
  }
  return ts;
}

function formatEventTime(ts: number): string {
  return new Date(normalizeEpochMs(ts)).toISOString().slice(11, 19);
}

function importanceTone(importance: "low" | "normal" | "high" | "urgent"): string {
  if (importance === "urgent") return "text-red-300 border-red-500/30 bg-red-500/10";
  if (importance === "high") return "text-orange-300 border-orange-500/30 bg-orange-500/10";
  if (importance === "low") return "text-slate-300 border-slate-500/30 bg-slate-500/10";
  return "text-blue-300 border-blue-500/30 bg-blue-500/10";
}

export default function HeroMedia() {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [cursor, setCursor] = useState(
    Math.max(heroTuiDemo.feedEvents.length - 1, 0)
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const simulationRunning = isPlaying && !prefersReducedMotion;

  useEffect(() => {
    if (
      prefersReducedMotion ||
      !simulationRunning ||
      heroTuiDemo.feedEvents.length === 0
    ) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setCursor((prev) => (prev + 1) % heroTuiDemo.feedEvents.length);
    }, heroTuiDemo.timelineTickMs);
    return () => window.clearInterval(timer);
  }, [simulationRunning, prefersReducedMotion]);

  const totalChapterMs = useMemo(() => {
    const lastChapter = heroDemoTranscript.chapters[heroDemoTranscript.chapters.length - 1];
    return lastChapter ? parseTimecodeToMs(lastChapter.endTime) : 1;
  }, []);

  const seekTo = useCallback(
    (time: string) => {
      const targetMs = parseTimecodeToMs(time);
      const ratio = totalChapterMs === 0 ? 0 : Math.min(targetMs / totalChapterMs, 1);
      const targetIndex = Math.round(ratio * (heroTuiDemo.feedEvents.length - 1));
      setCursor(Math.max(targetIndex, 0));
      if (!prefersReducedMotion) {
        setIsPlaying(true);
      }
      setShowChapters(false);
    },
    [prefersReducedMotion, totalChapterMs]
  );

  const visibleEvents = useMemo(() => {
    const events = heroTuiDemo.feedEvents;
    if (events.length === 0) {
      return [];
    }
    const windowSize = Math.min(heroTuiDemo.feedWindowSize, events.length);
    const start = cursor - windowSize + 1;
    return Array.from({ length: windowSize }, (_, idx) => {
      const eventIndex = (start + idx + events.length * 1000) % events.length;
      return events[eventIndex];
    });
  }, [cursor]);

  const simulationIndex = cursor % heroTuiDemo.queueDepthSeries.length;
  const queueDepth = heroTuiDemo.queueDepthSeries[simulationIndex];
  const ingressRps = heroTuiDemo.ingressRpsSeries[simulationIndex];
  const conflictCount = heroTuiDemo.conflictSeries[simulationIndex];
  const activeEvent = visibleEvents[visibleEvents.length - 1] ?? null;
  const playbackProgress =
    heroTuiDemo.feedEvents.length > 1
      ? (cursor / (heroTuiDemo.feedEvents.length - 1)) * 100
      : 0;
  const ackBacklog = Math.max(0, 28 - simulationIndex * 2);
  const activeAgentCount =
    heroTuiDemo.activeAgentPreview.length + (simulationIndex % 3);
  const deliveredCount = heroTuiDemo.snapshot.totalMessages + cursor;
  const realWebAppUrl = toSafeHref(heroTuiDemo.realWebAppUrl) ?? "https://mcpagentmail.com";

  return (
    <div className="relative">
      {/* Simulated TUI container */}
      <div className="relative bg-[#020a14] p-6 md:p-8 overflow-hidden min-h-[300px] md:min-h-[420px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.10),transparent_55%)]" />
        <div className="relative h-full rounded-2xl border border-blue-500/25 bg-black/40 overflow-hidden">
          {prefersReducedMotion ? (
            <div className="h-full w-full min-h-[260px] md:min-h-[340px] flex items-center justify-center bg-black/60">
              <Image
                src={heroTuiDemo.reducedMotionFallback}
                alt={heroTuiDemo.ariaLabel}
                width={heroTuiDemo.width}
                height={heroTuiDemo.height}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div
              data-testid="hero-tui-demo"
              className="h-full w-full min-h-[260px] md:min-h-[340px] bg-[#020611] font-mono text-slate-200"
              aria-label={heroTuiDemo.ariaLabel}
            >
              <div className="grid h-full grid-cols-1 gap-3 p-3 md:grid-cols-[2fr_1fr] md:p-4">
                <div className="rounded-xl border border-white/10 bg-black/45 p-3">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    <span>am dashboard --project mcp-agent-mail-production-snapshot</span>
                    <span className="text-blue-300">sqlite snapshot replay</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                      style={{ width: `${Math.max(4, playbackProgress)}%` }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-blue-200">Messages</p>
                      <p className="mt-1 text-sm font-bold text-white tabular-nums">{deliveredCount}</p>
                    </div>
                    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-cyan-200">Ingress rps</p>
                      <p className="mt-1 text-sm font-bold text-white tabular-nums">{ingressRps}</p>
                    </div>
                    <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-2">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-orange-200">Ack backlog</p>
                      <p className="mt-1 text-sm font-bold text-white tabular-nums">{ackBacklog}</p>
                    </div>
                    <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-2">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-green-200">Agents online</p>
                      <p className="mt-1 text-sm font-bold text-white tabular-nums">{activeAgentCount}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          request queue depth
                        </span>
                        <span className="text-blue-300 tabular-nums">{queueDepth}</span>
                      </div>
                      <div className="flex h-14 items-end gap-1">
                        {heroTuiDemo.queueDepthSeries.map((point, idx) => (
                          <div
                            key={`queue-${idx}`}
                            className={`w-full rounded-sm transition-colors ${
                              idx === simulationIndex ? "bg-blue-400" : "bg-blue-500/40"
                            }`}
                            style={{ height: `${Math.max(16, point * 5)}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          active agents
                        </span>
                        <span className="text-cyan-300">{heroTuiDemo.snapshot.totalAgents} total</span>
                      </div>
                      <ul className="space-y-1 text-xs">
                        {heroTuiDemo.activeAgentPreview.map((agent) => (
                          <li key={agent} className="flex items-center justify-between text-slate-300">
                            <span>{agent}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-white/10 bg-black/35 p-3">
                    <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        high-volume threads
                      </span>
                      <span className="text-slate-500">{heroTuiDemo.snapshot.activeThreads} active</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {heroTuiDemo.topThreads.slice(0, 4).map((thread) => (
                        <div key={thread.threadId} className="flex items-center justify-between gap-3">
                          <span className="truncate text-slate-300">{thread.threadId}</span>
                          <span className="tabular-nums text-slate-500">{thread.messageCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/45 p-3">
                  <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    <span>event feed</span>
                    <span className="text-cyan-300">deterministic loop</span>
                  </div>
                  <div data-testid="hero-tui-feed" className="space-y-1.5">
                    {visibleEvents.map((event, idx) => {
                      const isActive = idx === visibleEvents.length - 1;
                      return (
                        <div
                          key={`${event.id}-${idx}`}
                          className={`rounded-md border px-2 py-1.5 text-[11px] ${
                            isActive
                              ? "border-blue-500/40 bg-blue-500/10"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                            <span className="tabular-nums text-slate-500">{formatEventTime(event.createdTs)}</span>
                            <span className={`rounded border px-1.5 py-0.5 ${importanceTone(event.importance)}`}>
                              {event.importance}
                            </span>
                          </div>
                          <p className="truncate text-slate-100">
                            <span className="text-blue-300">{event.sender}</span>
                            {" • "}
                            {event.subject}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="truncate">{event.threadId ?? "no-thread"}</span>
                            <span>{event.ackRequired ? "ack_required" : "no_ack"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 rounded-md border border-white/10 bg-black/40 p-2 text-[10px]">
                    <p className="mb-1 flex items-center gap-1 uppercase tracking-[0.14em] text-slate-400">
                      <ShieldAlert className="h-3 w-3" />
                      Conflict Monitor
                    </p>
                    <p className="text-slate-300">
                      reservation_conflicts={conflictCount} | file_reservations={
                        heroTuiDemo.snapshot.fileReservations
                      }
                    </p>
                    {activeEvent && (
                      <p className="mt-1 truncate text-slate-500">
                        latest_event_id={activeEvent.id} sender_program={activeEvent.program}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/85 to-transparent">
            <p className="text-xs md:text-sm font-bold text-white tracking-wide uppercase">
              {heroTuiDemo.overlayTitle}
            </p>
            <p className="text-[10px] md:text-xs text-slate-300 mt-1 font-mono">
              {heroTuiDemo.overlaySubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-t border-white/5 bg-black/40">
        <button
          type="button"
          onClick={() => {
            if (!prefersReducedMotion) {
              setIsPlaying((prev) => !prev);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          aria-label={simulationRunning ? "Pause simulation" : "Play simulation"}
          disabled={prefersReducedMotion ?? false}
        >
          {simulationRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {simulationRunning ? "Pause" : "Play"}
        </button>

        <button
          type="button"
          onClick={() => { setShowChapters(!showChapters); setShowTranscript(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
            showChapters
              ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          aria-label="Toggle chapter list"
          aria-expanded={showChapters}
        >
          <List className="h-3 w-3" />
          Chapters
        </button>

        <button
          type="button"
          onClick={() => { setShowTranscript(!showTranscript); setShowChapters(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
            showTranscript
              ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          aria-label="Toggle transcript"
          aria-expanded={showTranscript}
        >
          <FileText className="h-3 w-3" />
          Transcript
        </button>

        <a
          data-testid="hero-real-webapp-link"
          href={realWebAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-200 hover:bg-blue-500/20 transition-colors"
          aria-label="Open real Agent Mail web app"
        >
          <ExternalLink className="h-3 w-3" />
          Open Real Web App
        </a>

        <span className="text-[10px] text-slate-500 font-mono">
          source db: {heroTuiDemo.sourceDatabasePath}
        </span>
      </div>

      <AnimatePresence>
        {showChapters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 bg-black/30"
          >
            <div className="p-4 space-y-1">
              {heroDemoTranscript.chapters.map((ch) => (
                <button
                  key={ch.startTime}
                  type="button"
                  onClick={() => seekTo(ch.startTime)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm hover:bg-white/5 transition-colors group"
                >
                  <span className="text-xs font-mono text-blue-400/60 tabular-nums w-14 shrink-0">
                    {ch.startTime.slice(0, 5)}
                  </span>
                  <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
                    {ch.title}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {showTranscript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 bg-black/30"
          >
            <div className="p-4 max-h-64 overflow-y-auto">
              <p className="text-xs text-slate-500 uppercase tracking-[0.14em] mb-2">
                narration track for the simulated flow
              </p>
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                {heroDemoTranscript.fullTranscript}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
