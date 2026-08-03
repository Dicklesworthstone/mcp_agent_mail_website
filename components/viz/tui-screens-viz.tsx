"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import {
  LayoutDashboard,
  Inbox,
  MessageSquare,
  Users,
  Lock,
  Search,
  UserCheck,
  Workflow,
  Network,
  Clock,
  HeartPulse,
  Eye,
  BarChart3,
  Paperclip,
  Archive,
  TowerControl,
} from "lucide-react";

/* ---------- data ---------- */

interface TuiScreen {
  id: string;
  label: string;
  jumpKey: string;
  category: "overview" | "communication" | "operations" | "system";
  coreQuestion: string;
  signals: string[];
}

const SCREENS: TuiScreen[] = [
  { id: "dashboard", label: "Dashboard", jumpKey: "1", category: "overview", coreQuestion: "What is happening across Agent Mail right now?", signals: ["live event stream", "operational counters", "latency and throughput"] },
  { id: "messages", label: "Messages", jumpKey: "2", category: "communication", coreQuestion: "Which messages need inspection or acknowledgement?", signals: ["message search", "detail panel", "acknowledgement state"] },
  { id: "threads", label: "Threads", jumpKey: "3", category: "communication", coreQuestion: "How did this conversation evolve?", signals: ["ordered messages", "participants", "thread context"] },
  { id: "agents", label: "Agents", jumpKey: "4", category: "operations", coreQuestion: "Which agents are active, idle, or stale?", signals: ["status", "last activity", "program and model"] },
  { id: "search", label: "Search", jumpKey: "5", category: "communication", coreQuestion: "Where is the relevant context across Agent Mail?", signals: ["facet filters", "ranked results", "selected record"] },
  { id: "reservations", label: "Reservations", jumpKey: "6", category: "operations", coreQuestion: "Where are file reservation conflicts or expirations?", signals: ["reserved paths", "exclusive holders", "TTL and conflicts"] },
  { id: "tool_metrics", label: "Tool Metrics", jumpKey: "7", category: "system", coreQuestion: "Which tools are busy, slow, or failing?", signals: ["call counts", "tail latency", "error rates"] },
  { id: "system_health", label: "System Health", jumpKey: "8", category: "system", coreQuestion: "Are the database, queues, and connections healthy?", signals: ["database diagnostics", "queue pressure", "connection health"] },
  { id: "timeline", label: "Timeline", jumpKey: "9", category: "overview", coreQuestion: "What happened and when?", signals: ["chronological events", "timeline cursor", "event inspector"] },
  { id: "projects", label: "Projects", jumpKey: "0", category: "overview", coreQuestion: "Which projects carry the current activity?", signals: ["project statistics", "agent and message counts", "project detail"] },
  { id: "contacts", label: "Contacts", jumpKey: "!", category: "communication", coreQuestion: "Which cross-agent contact links and policies apply?", signals: ["contact links", "approval state", "policy mode"] },
  { id: "explorer", label: "Explorer", jumpKey: "@", category: "communication", coreQuestion: "What is moving through the inbox and outbox?", signals: ["direction filters", "grouping", "acknowledgement filters"] },
  { id: "analytics", label: "Analytics", jumpKey: "#", category: "system", coreQuestion: "Which anomalies deserve action?", signals: ["confidence score", "supporting evidence", "recommended next step"] },
  { id: "attachments", label: "Attachments", jumpKey: "$", category: "communication", coreQuestion: "What artifacts were shared and where did they come from?", signals: ["attachment type", "inline preview", "source provenance"] },
  { id: "archive_browser", label: "Archive Browser", jumpKey: "%", category: "operations", coreQuestion: "What does the durable Git archive contain?", signals: ["directory tree", "file content", "archive path"] },
  { id: "atc", label: "ATC", jumpKey: "^", category: "system", coreQuestion: "Which coordination decision should happen next?", signals: ["agent liveness", "conflict state", "evidence ledger"] },
];

const ICON_MAP: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  messages: Inbox,
  threads: MessageSquare,
  agents: Users,
  search: Search,
  reservations: Lock,
  tool_metrics: BarChart3,
  system_health: HeartPulse,
  timeline: Clock,
  projects: Network,
  contacts: UserCheck,
  explorer: Workflow,
  analytics: Eye,
  attachments: Paperclip,
  archive_browser: Archive,
  atc: TowerControl,
};

const SCREENS_MAP = new Map(SCREENS.map(s => [s.id, s]));

const CATEGORY_SCREEN_COUNTS: Record<string, number> = Object.fromEntries(
  ["overview", "communication", "operations", "system"].map((cat) => [cat, SCREENS.filter((s) => s.category === cat).length]),
);

const CATEGORY_META: Record<string, { color: string; bg: string; label: string }> = {
  overview: { color: "#3B82F6", bg: "#3B82F61A", label: "Overview" },
  communication: { color: "#22C55E", bg: "#22C55E1A", label: "Communication" },
  operations: { color: "#A855F7", bg: "#A855F71A", label: "Operations" },
  system: { color: "#F59E0B", bg: "#F59E0B1A", label: "System" },
};

type CategoryFilter = "all" | "overview" | "communication" | "operations" | "system";

/* ---------- component ---------- */

export default function TuiScreensViz() {
  const reducedMotion = useVizReducedMotion();
  const [selectedScreen, setSelectedScreen] = useState<string>("dashboard");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filteredScreens = useMemo(
    () =>
      categoryFilter === "all"
        ? SCREENS
        : SCREENS.filter((screen) => screen.category === categoryFilter),
    [categoryFilter]
  );

  const { current, activeScreenId } = useMemo(() => {
    const isActive = filteredScreens.some((screen) => screen.id === selectedScreen);
    const activeId = isActive ? selectedScreen : filteredScreens[0]?.id ?? SCREENS[0].id;
    const curr = SCREENS_MAP.get(activeId) ?? SCREENS[0];
    return { activeScreenId: activeId, current: curr };
  }, [filteredScreens, selectedScreen]);

  const currentMeta = CATEGORY_META[current.category];
  const CurrentIcon = ICON_MAP[current.id] ?? LayoutDashboard;
  const filteredCount = filteredScreens.length;

  return (
    <VizSurface aria-label="TUI screens architecture visualization">
      <VizHeader
        accent="blue"
        eyebrow="Console Information Architecture"
        title="16-Screen TUI Navigation Model"
        subtitle="Filter by category, inspect each screen's core question, and learn the jump-key grammar that keeps operator navigation O(1)."
        controls={
          <div className="flex flex-wrap gap-2">
            {(["all", "overview", "communication", "operations", "system"] as const).map((cat) => (
              <VizControlButton
                key={cat}
                tone={categoryFilter === cat ? "blue" : "neutral"}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === "all" ? "All" : CATEGORY_META[cat].label}
              </VizControlButton>
            ))}
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="Total Screens" value={SCREENS.length} tone="blue" />
        <VizMetricCard label="Visible" value={filteredCount} tone="green" />
        <VizMetricCard label="Jump Key" value={current.jumpKey} tone="amber" />
      </div>

      {/* Screen grid */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5">
          {filteredScreens.map((screen) => {
            const isSelected = screen.id === activeScreenId;
            const meta = CATEGORY_META[screen.category];
            const Icon = ICON_MAP[screen.id] ?? LayoutDashboard;
            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => setSelectedScreen(screen.id)}
                className="relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all cursor-pointer"
                style={{
                  borderColor: isSelected ? meta.color : "#334155",
                  background: isSelected ? meta.bg : "#020617",
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isSelected ? meta.color : "#64748B" }}
                />
                <span className="text-[10px] font-bold text-slate-300 leading-tight">
                  {screen.label}
                </span>
                <span
                  className="text-[9px] font-mono font-bold rounded px-1"
                  style={{
                    color: isSelected ? meta.color : "#64748B",
                    background: isSelected ? `${meta.color}20` : "#1E293B",
                  }}
                >
                  {screen.jumpKey}
                </span>
                {isSelected && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.article
            key={current.id}
            className="rounded-xl border border-white/10 bg-black/30 p-4"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CurrentIcon className="w-6 h-6" style={{ color: currentMeta.color }} />
              <div>
                <p className="text-base font-bold text-white">{current.label}</p>
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ color: currentMeta.color, background: currentMeta.bg }}
                >
                  {currentMeta.label}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-300 italic">&ldquo;{current.coreQuestion}&rdquo;</p>
            <div className="mt-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                Primary Signals
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                {current.signals.map((sig) => (
                  <li key={sig} className="flex gap-2">
                    <span className="text-slate-600 select-none">&bull;</span>
                    {sig}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Jump Key
              </span>
              <kbd
                className="inline-block rounded border px-2 py-0.5 text-xs font-mono font-bold"
                style={{ borderColor: currentMeta.color, color: currentMeta.color }}
              >
                {current.jumpKey}
              </kbd>
            </div>
          </motion.article>
        </AnimatePresence>

        {/* Category legend + navigation map */}
        <div className="flex flex-col gap-4">
          <article className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              Screen Categories
            </p>
            <div className="space-y-2">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-sm text-slate-300 font-medium">{meta.label}</span>
                    <span className="text-xs text-slate-500 ml-auto">{CATEGORY_SCREEN_COUNTS[key]} screens</span>
                  </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              Navigation Model
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="text-slate-600 select-none">&bull;</span>
                <span><kbd className="text-blue-300 font-mono text-xs">1-9, 0, !, @, #, $, %, ^</kbd> jump directly outside Dashboard and text-entry mode</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-600 select-none">&bull;</span>
                <span>On Dashboard, <kbd className="text-blue-300 font-mono text-xs">1-4</kbd> select quick filters; use <kbd className="text-blue-300 font-mono text-xs">Tab</kbd> to enter the shared screen cycle</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-600 select-none">&bull;</span>
                <span><kbd className="text-blue-300 font-mono text-xs">Tab / Shift+Tab</kbd> cycle forward/backward</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-600 select-none">&bull;</span>
                <span><kbd className="text-blue-300 font-mono text-xs">?</kbd> help overlay with all key bindings</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-600 select-none">&bull;</span>
                <span>5 themes: Default, Cyberpunk Aurora, Solarized, Dracula, High Contrast</span>
              </li>
            </ul>
          </article>
        </div>
      </div>

      <VizLearningBlock
        className="mt-4"
        accent="blue"
        title="Pedagogical Takeaways"
        items={[
          "Each screen is anchored to a specific operator question, reducing scanning overhead.",
          "Jump-key access matters most under pressure, where tab-cycling is too slow.",
          "Category grouping keeps navigation scalable even as screen count grows.",
        ]}
      />
    </VizSurface>
  );
}
