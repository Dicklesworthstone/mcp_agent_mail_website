"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { Terminal, Eye, Inbox, History, Shield, FileOutput, ArrowRight } from "lucide-react";

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

const TRACK_MAP = new Map(TRACKS.map(t => [t.id, t]));
const TOTAL_COMMAND_COUNT = TRACKS.reduce((sum, t) => sum + t.commands.length, 0);

/* ---------- component ---------- */

export default function RobotModeViz() {
  const reducedMotion = useVizReducedMotion();
  const [selectedTrack, setSelectedTrack] = useState("awareness");
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>("toon");

  const track = TRACK_MAP.get(selectedTrack) ?? TRACKS[0];
  const TrackIcon = TRACK_ICONS[track.id] ?? Terminal;
  const format = FORMAT_INFO[selectedFormat];

  return (
    <VizSurface aria-label="Robot mode command-track visualization">
      <VizHeader
        accent="cyan"
        eyebrow="Agent Interface"
        title="Robot Mode Taxonomy"
        subtitle="Inspect the headless API tracks designed specifically for AI models. Agents can fetch machine-readable states with exact format control."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="Commands" value={TOTAL_COMMAND_COUNT} tone="blue" />
        <VizMetricCard label="Tracks" value={TRACKS.length} tone="green" />
        <VizMetricCard label="Format" value={selectedFormat} tone={selectedFormat === "toon" ? "amber" : selectedFormat === "json" ? "blue" : "green"} />
      </div>

      <div className="relative rounded-xl border border-slate-700/50 bg-[#0B1120] p-6 mb-6 overflow-hidden min-h-[480px]">
        {/* Animated HUD Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
        
        {/* Format Selector Bar */}
        <div className="relative z-10 flex flex-col md:flex-row gap-6 h-full items-stretch">
          
          {/* Left Column: Tracks */}
          <div className="w-full md:w-1/3 flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
              Command Tracks
            </p>
            {TRACKS.map((t) => {
              const isSelected = t.id === selectedTrack;
              const Icon = TRACK_ICONS[t.id] ?? Terminal;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTrack(t.id)}
                  className={`relative flex items-center gap-3 rounded-lg border p-3 transition-all cursor-pointer overflow-hidden ${isSelected ? "shadow-lg" : "hover:bg-slate-800/50"}`}
                  style={{
                    borderColor: isSelected ? t.color : "#334155",
                    background: isSelected ? `${t.color}20` : "#0F172A",
                  }}
                >
                  <Icon className="w-5 h-5 z-10 shrink-0" style={{ color: isSelected ? t.color : "#64748B" }} />
                  <div className="flex flex-col text-left z-10 w-full overflow-hidden">
                    <span className="text-xs font-bold text-slate-200 truncate">{t.label}</span>
                    <span className="text-[10px] text-slate-500">{t.commands.length} commands</span>
                  </div>
                  
                  {isSelected && (
                    <motion.div layoutId="track-highlight" className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: t.color }} />
                  )}
                  {isSelected && (
                    <motion.div className="absolute right-3 opacity-50 z-10 hidden sm:block">
                      <ArrowRight className="w-4 h-4" style={{ color: t.color }} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Track Details & Envelopes */}
          <div className="flex-1 flex flex-col h-full z-10">
            <AnimatePresence mode="wait">
              <motion.article
                key={track.id}
                className="flex-1 rounded-xl border border-white/10 bg-black/50 p-5 flex flex-col shadow-2xl backdrop-blur-sm"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                  <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${track.color}20`, border: `1px solid ${track.color}50` }}>
                    <TrackIcon className="w-6 h-6" style={{ color: track.color }} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">{track.label}</h4>
                    <p className="text-xs text-slate-400">{track.objective}</p>
                  </div>
                </div>

                {/* Subcommands Grid */}
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {track.commands.map((cmd) => (
                    <div key={cmd.name} className="rounded border border-slate-700 bg-slate-900/50 p-2.5 hover:border-slate-500 transition-colors group cursor-default">
                      <div className="flex items-center gap-2 mb-1">
                        <Terminal className="w-3 h-3 text-slate-500 group-hover:text-slate-300 shrink-0" />
                        <code className="text-xs font-mono font-bold truncate" style={{ color: track.color }}>
                          am robot {cmd.name}
                        </code>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">{cmd.description}</p>
                    </div>
                  ))}
                </div>

                {/* Format Output Preview */}
                <div className="mt-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Output Format Playground
                    </p>
                    <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1 w-full sm:w-auto">
                      {(["toon", "json", "md"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setSelectedFormat(fmt)}
                          className={`flex-1 sm:flex-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${selectedFormat === fmt ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative rounded-lg border border-slate-700 bg-black overflow-hidden group">
                     {/* Window Header */}
                     <div className="h-6 bg-slate-900 border-b border-slate-800 flex items-center px-3 gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                       <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                       <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                       <div className="mx-auto text-[9px] font-mono text-slate-500 tracking-wider hidden sm:block">am robot {track.commands[0]?.name} --format {selectedFormat}</div>
                     </div>
                     <pre className="p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto min-h-[140px] text-slate-300">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${track.id}-${selectedFormat}`}
                            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {selectedFormat === "json" && <span className="text-slate-500 opacity-50 block mb-2">{`{ "_meta": { "cmd": "${track.commands[0]?.name}" }, ... }`}</span>}
                            {format.example}
                          </motion.div>
                        </AnimatePresence>
                     </pre>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 text-right">{format.description}</p>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="cyan"
        title="Pedagogical Takeaways"
        items={[
          "Track-based grouping reduces command selection ambiguity for autonomous agents.",
          "Format choice is a control surface: toon for token cost, JSON for tooling, Markdown for human review.",
          "Consistent _meta envelopes make downstream automation and logging deterministic.",
        ]}
      />
    </VizSurface>
  );
}