"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { Terminal, Eye, Inbox, History, Shield, FileOutput } from "lucide-react";

/* ---------- data ---------- */

interface RobotCommand {
  name: string;
  track: string;
  description: string;
}

interface CommandTrack {
  id: string;
  label: string;
  objective: string;
  commands: RobotCommand[];
  color: string;
}

type OutputFormat = "toon" | "json" | "md";

const TRACKS: CommandTrack[] = [
  {
    id: "awareness",
    label: "Situational Awareness",
    objective: "Get fast status before taking action.",
    color: "#3B82F6",
    commands: [
      { name: "status", track: "awareness", description: "Dashboard synthesis: health, inbox counts, activity, anomalies" },
      { name: "health", track: "awareness", description: "System diagnostics: probes, DB pool, disk, anomalies" },
      { name: "agents", track: "awareness", description: "Agent roster with activity status, program, model" },
      { name: "overview", track: "awareness", description: "Cross-project unified summary per project" },
    ],
  },
  {
    id: "triage",
    label: "Message Triage",
    objective: "Prioritize and acknowledge inbound coordination.",
    color: "#22C55E",
    commands: [
      { name: "inbox", track: "triage", description: "Actionable inbox with priority ordering and urgency synthesis" },
      { name: "thread", track: "triage", description: "Full conversation rendering with thread position" },
      { name: "message", track: "triage", description: "Single message with adjacent messages and sender info" },
    ],
  },
  {
    id: "history",
    label: "History Retrieval",
    objective: "Recover past decisions before proposing changes.",
    color: "#A855F7",
    commands: [
      { name: "search", track: "history", description: "Full-text search with facets and relevance scores" },
      { name: "timeline", track: "history", description: "Events since last check with temporal filters" },
      { name: "navigate", track: "history", description: "Resolve any resource:// URI and return in robot format" },
    ],
  },
  {
    id: "safety",
    label: "Edit Safety",
    objective: "Inspect ownership and avoid reservation collisions.",
    color: "#F59E0B",
    commands: [
      { name: "reservations", track: "safety", description: "File reservations with TTL warnings, conflict detection" },
      { name: "contacts", track: "safety", description: "Contact graph with policy surface, pending requests" },
    ],
  },
  {
    id: "reporting",
    label: "Operator Reporting",
    objective: "Machine-readable snapshots for automation.",
    color: "#EF4444",
    commands: [
      { name: "metrics", track: "reporting", description: "Tool performance: calls, errors, error%, latency percentiles" },
      { name: "analytics", track: "reporting", description: "Anomaly insights with severity, confidence, remediation" },
      { name: "projects", track: "reporting", description: "Project summary with per-project agent/message counts" },
      { name: "attachments", track: "reporting", description: "Attachment inventory with type, size, provenance" },
    ],
  },
];

const TRACK_ICONS: Record<string, React.ElementType> = {
  awareness: Eye,
  triage: Inbox,
  history: History,
  safety: Shield,
  reporting: FileOutput,
};

const FORMAT_INFO: Record<OutputFormat, { label: string; description: string; example: string }> = {
  toon: {
    label: "toon",
    description: "Token-efficient compact format. Default at TTY. Minimal token consumption for agent parsing.",
    example: `◉ Status ▸ ok
  unread: 3  urgent: 1  ack: 0
  agents: 2  reservations: 4
  ▸ GreenCastle (active 12s)
  ▸ BlueLake (idle 2m)`,
  },
  json: {
    label: "json",
    description: "Structured JSON for programmatic consumption. Default when piped. Full data fidelity.",
    example: `{
  "_meta": { "command": "robot status" },
  "health": "ok",
  "unread": 3,
  "urgent": 1,
  "active_agents": 2
}`,
  },
  md: {
    label: "md",
    description: "Markdown for readable thread/message rendering. Best for conversation display.",
    example: `## Thread: API-MIGRATION

**GreenCastle** (2m ago)
> Updated /api/auth response shape.

**BlueLake** (1m ago)
> Acknowledged. Updating frontend.`,
  },
};

/* ---------- component ---------- */

export default function RobotModeViz() {
  const reducedMotion = useVizReducedMotion();
  const [selectedTrack, setSelectedTrack] = useState("awareness");
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>("toon");

  const track = TRACKS.find((t) => t.id === selectedTrack) ?? TRACKS[0];
  const TrackIcon = TRACK_ICONS[track.id] ?? Terminal;
  const format = FORMAT_INFO[selectedFormat];

  return (
    <VizSurface aria-label="Robot mode command-track visualization">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-black text-white">Robot Mode CLI</h3>
        <p className="text-sm text-slate-400">
          16 non-interactive subcommands organized into 5 tracks. Three output formats optimized for different consumers.
        </p>
      </div>

      {/* Track selector */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
          Command Tracks
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {TRACKS.map((t) => {
            const isSelected = t.id === selectedTrack;
            const Icon = TRACK_ICONS[t.id] ?? Terminal;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrack(t.id)}
                className="flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all cursor-pointer"
                style={{
                  borderColor: isSelected ? t.color : "#334155",
                  background: isSelected ? `${t.color}1A` : "#020617",
                }}
              >
                <Icon className="w-5 h-5" style={{ color: isSelected ? t.color : "#64748B" }} />
                <span className="text-[10px] font-bold text-slate-300 leading-tight text-center">
                  {t.label}
                </span>
                <span className="text-[9px] text-slate-500">{t.commands.length} cmds</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Track detail + commands */}
        <AnimatePresence mode="wait">
          <motion.article
            key={track.id}
            className="rounded-xl border border-white/10 bg-black/30 p-4"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrackIcon className="w-5 h-5" style={{ color: track.color }} />
              <p className="text-base font-bold text-white">{track.label}</p>
            </div>
            <p className="text-sm text-slate-400 mb-3">{track.objective}</p>
            <div className="space-y-2">
              {track.commands.map((cmd) => (
                <div
                  key={cmd.name}
                  className="rounded-lg border border-white/5 bg-black/30 p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <code className="text-xs font-mono font-bold" style={{ color: track.color }}>
                      am robot {cmd.name}
                    </code>
                  </div>
                  <p className="mt-1 ml-5 text-xs text-slate-400">{cmd.description}</p>
                </div>
              ))}
            </div>
          </motion.article>
        </AnimatePresence>

        {/* Output format panel */}
        <div className="flex flex-col gap-4">
          <article className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              Output Format
            </p>
            <div className="flex gap-2 mb-3">
              {(["toon", "json", "md"] as const).map((fmt) => (
                <VizControlButton
                  key={fmt}
                  tone={selectedFormat === fmt ? "blue" : "neutral"}
                  onClick={() => setSelectedFormat(fmt)}
                >
                  --format {fmt}
                </VizControlButton>
              ))}
            </div>
            <p className="text-sm text-slate-300 mb-3">{format.description}</p>
            <pre className="rounded-lg bg-slate-900 border border-white/5 p-3 text-xs font-mono text-slate-400 whitespace-pre-wrap overflow-x-auto">
              {format.example}
            </pre>
          </article>

          <article className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
              Envelope Metadata
            </p>
            <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap">
{`Every response includes _meta:
{
  "command": "robot ${track.commands[0]?.name ?? "status"}",
  "timestamp": "2026-03-05T...",
  "format": "${selectedFormat}",
  "version": "1.0",
  "project": "my-project"
}`}
            </pre>
          </article>
        </div>
      </div>
    </VizSurface>
  );
}
