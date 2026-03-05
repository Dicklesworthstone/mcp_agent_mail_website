"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
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
  Hammer,
  Network,
  Clock,
  HeartPulse,
  Eye,
  BarChart3,
  Palette,
} from "lucide-react";

/* ---------- data ---------- */

interface TuiScreen {
  id: string;
  label: string;
  jumpKey: string;
  category: "operations" | "coordination" | "observability" | "system";
  coreQuestion: string;
  signals: string[];
}

const SCREENS: TuiScreen[] = [
  { id: "dashboard", label: "Dashboard", jumpKey: "1", category: "operations", coreQuestion: "Is the system healthy and active right now?", signals: ["inbound message rate", "reservation conflicts", "service health"] },
  { id: "inbox", label: "Inbox Browser", jumpKey: "2", category: "coordination", coreQuestion: "What requires my immediate response?", signals: ["importance", "ack_required", "thread continuity"] },
  { id: "threads", label: "Thread Explorer", jumpKey: "3", category: "coordination", coreQuestion: "How did this decision evolve over time?", signals: ["participants", "open action items", "decision checkpoints"] },
  { id: "roster", label: "Agent Roster", jumpKey: "4", category: "coordination", coreQuestion: "Who is online and what are they doing?", signals: ["last active", "task description", "program/model"] },
  { id: "reservations", label: "Reservation Mgr", jumpKey: "5", category: "coordination", coreQuestion: "Where are file ownership conflicts emerging?", signals: ["path overlaps", "exclusive holders", "TTL expiration"] },
  { id: "search", label: "Unified Search", jumpKey: "6", category: "operations", coreQuestion: "Where is the prior context for this topic?", signals: ["query relevance", "thread_id", "sender filters"] },
  { id: "contacts", label: "Contact Graph", jumpKey: "7", category: "coordination", coreQuestion: "Can this agent message that agent?", signals: ["approval state", "policy mode", "cross-project links"] },
  { id: "macros", label: "Macro Inspector", jumpKey: "8", category: "operations", coreQuestion: "Which high-level workflows are available?", signals: ["macro preconditions", "side effects", "result shape"] },
  { id: "build-slots", label: "Build Slots", jumpKey: "9", category: "system", coreQuestion: "Are build leases saturating infrastructure?", signals: ["active holders", "expiry", "exclusive contention"] },
  { id: "product-bus", label: "Product Bus", jumpKey: "0", category: "system", coreQuestion: "How are projects linked under products?", signals: ["linked repos", "cross-project traffic", "search scope"] },
  { id: "audit", label: "Audit Timeline", jumpKey: "a", category: "observability", coreQuestion: "What happened and when?", signals: ["message lifecycle", "reservation changes", "identity updates"] },
  { id: "health", label: "System Health", jumpKey: "h", category: "observability", coreQuestion: "Which subsystem is degraded?", signals: ["DB pool pressure", "search fallback", "transport status"] },
  { id: "overseer", label: "Human Overseer", jumpKey: "o", category: "operations", coreQuestion: "How can an operator redirect execution?", signals: ["compose path", "recipient targeting", "importance overrides"] },
  { id: "tool-metrics", label: "Tool Metrics", jumpKey: "m", category: "observability", coreQuestion: "Which tools are hot or failing?", signals: ["call volume", "error rate", "tail latency"] },
  { id: "theme", label: "Theme + Status", jumpKey: "t", category: "system", coreQuestion: "Is the session readable?", signals: ["active theme", "connection status", "time windows"] },
];

const ICON_MAP: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  threads: MessageSquare,
  roster: Users,
  reservations: Lock,
  search: Search,
  contacts: UserCheck,
  macros: Workflow,
  "build-slots": Hammer,
  "product-bus": Network,
  audit: Clock,
  health: HeartPulse,
  overseer: Eye,
  "tool-metrics": BarChart3,
  theme: Palette,
};

const CATEGORY_META: Record<string, { color: string; bg: string; label: string }> = {
  operations: { color: "#3B82F6", bg: "#3B82F61A", label: "Operations" },
  coordination: { color: "#22C55E", bg: "#22C55E1A", label: "Coordination" },
  observability: { color: "#A855F7", bg: "#A855F71A", label: "Observability" },
  system: { color: "#F59E0B", bg: "#F59E0B1A", label: "System" },
};

type CategoryFilter = "all" | "operations" | "coordination" | "observability" | "system";

/* ---------- component ---------- */

export default function TuiScreensViz() {
  const reducedMotion = useVizReducedMotion();
  const [selectedScreen, setSelectedScreen] = useState<string>("dashboard");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filteredScreens = categoryFilter === "all"
    ? SCREENS
    : SCREENS.filter((s) => s.category === categoryFilter);

  const current = SCREENS.find((s) => s.id === selectedScreen) ?? SCREENS[0];
  const currentMeta = CATEGORY_META[current.category];
  const CurrentIcon = ICON_MAP[current.id] ?? LayoutDashboard;

  return (
    <VizSurface aria-label="TUI screens architecture visualization">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">15-Screen Operations Console</h3>
          <p className="text-sm text-slate-400">
            Navigate the TUI screen architecture via jump keys and category filters.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "operations", "coordination", "observability", "system"] as const).map((cat) => (
            <VizControlButton
              key={cat}
              tone={categoryFilter === cat ? "blue" : "neutral"}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === "all" ? "All" : CATEGORY_META[cat].label}
            </VizControlButton>
          ))}
        </div>
      </div>

      {/* Screen grid */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5">
          {filteredScreens.map((screen) => {
            const isSelected = screen.id === selectedScreen;
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
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const count = SCREENS.filter((s) => s.category === key).length;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-sm text-slate-300 font-medium">{meta.label}</span>
                    <span className="text-xs text-slate-500 ml-auto">{count} screens</span>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              Navigation Model
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="text-slate-600 select-none">&bull;</span>
                <span><kbd className="text-blue-300 font-mono text-xs">1-9, 0, a, h, o, m, t</kbd> jump directly to any screen</span>
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
    </VizSurface>
  );
}
