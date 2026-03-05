"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, GitBranch, Search, Zap,
  Cog, Activity, Image as ImageIcon, Archive,
  FileCode, Sparkles, ShieldCheck, Mail, Bug, Brain, ShieldAlert,
  RefreshCw, Fingerprint, Microscope, Radio, FlaskConical, Dna, Network, Star,
  Github,
} from "lucide-react";
import { flywheelTools, flywheelDescription, siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import BottomSheet from "@/components/bottom-sheet";
import { Magnetic } from "@/components/motion-wrapper";
import { SyncContainer, CircuitJunction, CircuitTrace } from "@/components/sync-elements";
import GlitchText from "@/components/glitch-text";
import { AnimatedNumber } from "@/components/animated-number";
import RobotMascot from "@/components/robot-mascot";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  LayoutGrid, GitBranch, Search, Cog, Activity, Image: ImageIcon,
  Archive, FileCode, Sparkles, ShieldCheck, Mail, Bug, Brain, ShieldAlert, RefreshCw,
  Microscope, Radio, FlaskConical, Dna, Fingerprint,
};

const toolAccentColors: Record<string, string> = {
  ntm:  "#38bdf8",
  slb:  "#f87171",
  mail: "#fbbf24",
  bv:   "#a78bfa",
  ubs:  "#fb923c",
  cm:   "#34d399",
  cass: "#22d3ee",
  acfs: "#60a5fa",
  dcg:  "#ef4444",
  ru:   "#2dd4bf",
  giil: "#e879f9",
  xf:   "#818cf8",
  s2p:  "#a3e635",
  ms:   "#f472b6",
};

const DEFAULT_ACCENT = "#3B82F6";

function getAccent(id: string | null): string {
  return id ? (toolAccentColors[id] ?? DEFAULT_ACCENT) : DEFAULT_ACCENT;
}

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const CONTAINER_SIZE = 600;
const RADIUS = 220;
const CENTER = CONTAINER_SIZE / 2;
const NODE_SIZE = 60;

const SPECTRUM = ["#38bdf8", "#a78bfa", "#f472b6", "#ef4444", "#fb923c", "#fbbf24", "#34d399", "#22d3ee"];

function getNodePosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * RADIUS,
    y: CENTER + Math.sin(angle) * RADIUS,
  };
}

function getLightningPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const segments = 4;
  const path = [`M ${from.x} ${from.y}`];
  const dx = (to.x - from.x) / segments;
  const dy = (to.y - from.y) / segments;

  for (let i = 1; i < segments; i++) {
    const jitter = 12;
    const midX = from.x + dx * i + (Math.random() - 0.5) * jitter;
    const midY = from.y + dy * i + (Math.random() - 0.5) * jitter;
    path.push(`L ${midX} ${midY}`);
  }

  path.push(`L ${to.x} ${to.y}`);
  return path.join(" ");
}

function LightningArc({ from, to, color, dimColor, active }: { from: { x: number; y: number }; to: { x: number; y: number }; color: string; dimColor: string; active: boolean }) {
  const [path, setPath] = useState(() => getLightningPath(from, to));

  useEffect(() => {
    if (!active) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const tick = () => {
      if (!isMounted) return;
      setPath(getLightningPath(from, to));
      timeoutId = setTimeout(tick, 60 + Math.random() * 60);
    };

    timeoutId = setTimeout(tick, 60 + Math.random() * 60);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [from, to, active]);

  return (
    <motion.path
      d={path}
      fill="none"
      stroke={active ? color : dimColor}
      strokeWidth={active ? 2.5 : 0.5}
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? [0.4, 1, 0.6, 1, 0.3] : 0.08 }}
      transition={active ? { repeat: Infinity, duration: 0.2 } : {}}
      style={{ filter: active ? `drop-shadow(0 0 10px ${color})` : "none" }}
    />
  );
}

function prng(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const TOOL_BY_ID = new Map(flywheelTools.map((t) => [t.id, t]));

const POSITIONS = flywheelTools.reduce((acc, tool, index) => {
  acc[tool.id] = getNodePosition(index, flywheelTools.length);
  return acc;
}, {} as Record<string, { x: number; y: number }>);

const CONNECTIONS = (() => {
  const lines: { from: string; to: string }[] = [];
  const seen = new Set<string>();
  flywheelTools.forEach(tool => {
    tool.connectsTo.forEach(target => {
      const key = [tool.id, target].sort().join("-");
      if (!seen.has(key)) {
        seen.add(key);
        lines.push({ from: tool.id, to: target });
      }
    });
  });
  return lines;
})();

const NEURAL_BITS = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  x: prng(i * 17.1) * CONTAINER_SIZE,
  y: prng(i * 29.3) * CONTAINER_SIZE,
  size: 2 + prng(i * 43.7) * 5,
  duration: 8 + prng(i * 59.9) * 20,
  driftX: prng(i * 71.2) * 120 - 60,
  driftY: prng(i * 83.1) * 120 - 60,
  color: SPECTRUM[i % SPECTRUM.length],
}));

function NeuralFragments() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-30">
      {NEURAL_BITS.map(bit => (
        <motion.div
          key={bit.id}
          className="absolute rounded-full"
          style={{ width: bit.size, height: bit.size, left: bit.x, top: bit.y, backgroundColor: withAlpha(bit.color, 0.5) }}
          animate={{
            x: [0, bit.driftX, 0],
            y: [0, bit.driftY, 0],
            opacity: [0.15, 0.7, 0.15],
          }}
          transition={{ duration: bit.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function NodePulse({ active, color }: { active: boolean; color: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ scale: 0.8, opacity: 0, border: `2px solid ${color}` }}
          animate={{ scale: 1.5, opacity: [0, 0.6, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}

function NodeHoverHUD({ tool, color, x }: { tool: typeof flywheelTools[0]; color: string; x: number }) {
  const isRightSide = x > CENTER;

  return (
    <motion.div
      initial={{ opacity: 0, x: isRightSide ? 10 : -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: isRightSide ? 10 : -10, scale: 0.95 }}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-[110] pointer-events-none hidden lg:block",
        isRightSide ? "right-full mr-6" : "left-full ml-6"
      )}
    >
      <div
        className="glass-modern border p-5 rounded-2xl min-w-[260px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
        style={{ borderColor: withAlpha(color, 0.4), backgroundColor: "rgba(2,10,20,0.98)" }}
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l opacity-40" style={{ borderColor: color }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r opacity-40" style={{ borderColor: color }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Agent_Detected</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
              <Zap className="h-2 w-2" style={{ color }} />
              <span className="text-[8px] font-mono font-black" style={{ color }}>{tool.id.toUpperCase()}</span>
            </div>
          </div>
          <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1 italic">{tool.name}</h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-5">{tool.tagline}</p>

          <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-4">
            <div className="space-y-1">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Stars</span>
              <div className="text-sm font-black text-white font-mono flex items-center gap-1">
                {tool.stars || "---"}
                <Star className="h-2.5 w-2.5 text-yellow-500/50" />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Link_Density</span>
              <div className="text-sm font-black text-white font-mono" style={{ color }}>
                {Math.round((tool.connectsTo.length / flywheelTools.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AgentFlywheel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const { lightTap, mediumTap, errorTap } = useHapticFeedback();

  const activeId = selectedId || hoveredId;
  const selectedTool = (selectedId && TOOL_BY_ID.get(selectedId)) || null;
  const activeConnectsTo = useMemo(() => activeId ? (TOOL_BY_ID.get(activeId)?.connectsTo ?? []) : [], [activeId]);
  const activeAccent = getAccent(activeId);

  const handleSelect = useCallback((id: string | null) => {
    if (id === selectedId) {
      setSelectedId(null);
      lightTap();
    } else {
      setSelectedId(id);
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
      mediumTap();
      if (id) errorTap();
    }
  }, [selectedId, lightTap, mediumTap, errorTap]);

  const panelAccent = selectedTool ? getAccent(selectedTool.id) : DEFAULT_ACCENT;

  return (
    <div className="relative py-24 md:py-32">
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0.05, 0.2, 0] }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] pointer-events-none mix-blend-overlay"
            style={{ backgroundColor: withAlpha(activeAccent, 0.15) }}
          />
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 w-full justify-center">
        <div className="h-px w-12 md:w-24" style={{ background: `linear-gradient(to right, transparent, ${withAlpha("#38bdf8", 0.3)}, transparent)` }} />
        <div className="px-4 py-1 rounded-full border backdrop-blur-md" style={{ borderColor: withAlpha(activeAccent, 0.25), backgroundColor: withAlpha(activeAccent, 0.05) }}>
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap" style={{ color: withAlpha(activeAccent, 0.7) }}>Agent_Swarm_Core v4.2</span>
        </div>
        <div className="h-px w-12 md:w-24" style={{ background: `linear-gradient(to left, transparent, ${withAlpha("#a78bfa", 0.3)}, transparent)` }} />
      </div>

      <SyncContainer withPulse={true} className="max-w-[1600px] mx-auto bg-black/60 border-white/5 shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-visible">
        {/* PCB dot-grid texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${withAlpha(activeAccent, 0.25)} 1px, transparent 0)`, backgroundSize: '40px 40px' }}
        />
        {/* Circuit trace overlays along edges */}
        <CircuitTrace color={activeAccent} className="absolute top-2 left-[10%] right-[10%] w-[80%] z-20" />
        <CircuitTrace color={activeAccent} className="absolute bottom-2 left-[10%] right-[10%] w-[80%] z-20" />
        <CircuitTrace color={activeAccent} orientation="vertical" className="absolute left-2 top-[10%] bottom-[10%] h-[80%] z-20" />
        <CircuitTrace color={activeAccent} orientation="vertical" className="absolute right-2 top-[10%] bottom-[10%] h-[80%] z-20" />

        <div className="grid lg:grid-cols-[1fr,1.5fr] xl:grid-cols-[1fr,1.8fr] gap-0 items-stretch">
          {/* THE REACTOR STAGE */}
          <div className="relative flex items-center justify-center p-6 md:p-12 border-r border-white/5 min-h-[500px] md:min-h-[700px] overflow-visible">
            <NeuralFragments />

            <div className="relative scale-[var(--flywheel-scale)] md:scale-[0.85] xl:scale-100" style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE, "--flywheel-scale": 0.5 } as React.CSSProperties}>
              <svg className="absolute inset-0 overflow-visible" width={CONTAINER_SIZE} height={CONTAINER_SIZE}>
                {CONNECTIONS.map(conn => {
                  const isFromActive = activeId === conn.from;
                  const isToActive = activeId === conn.to;
                  const active = isFromActive || isToActive;
                  const arcColor = isFromActive ? getAccent(conn.from) : isToActive ? getAccent(conn.to) : DEFAULT_ACCENT;
                  const dimColor = withAlpha(getAccent(conn.from), 0.12);
                  return (
                    <LightningArc
                      key={`${conn.from}-${conn.to}`}
                      from={POSITIONS[conn.from]}
                      to={POSITIONS[conn.to]}
                      color={arcColor}
                      dimColor={dimColor}
                      active={active}
                    />
                  );
                })}
              </svg>

              <div className="absolute" style={{ left: CENTER - 80, top: CENTER - 80, width: 160, height: 160 }}>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full"
                    style={{ borderStyle: i === 1 ? 'dashed' : 'dotted', borderWidth: 1, borderColor: withAlpha(SPECTRUM[i * 2], 0.15), padding: i * 8 }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                  />
                ))}

                <motion.div
                  className="absolute inset-12 rounded-full flex items-center justify-center group cursor-pointer"
                  style={{ backgroundColor: withAlpha(activeAccent, 0.08), borderWidth: 1, borderStyle: "solid", borderColor: withAlpha(activeAccent, 0.5) }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${withAlpha(activeAccent, 0.2)}`,
                      `0 0 60px ${withAlpha(activeAccent, 0.5)}`,
                      `0 0 20px ${withAlpha(activeAccent, 0.2)}`
                    ],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  onClick={() => handleSelect(null)}
                >
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: withAlpha(activeAccent, 0.15) }} />
                  <Zap className="h-10 w-10 z-10" style={{ color: activeAccent }} />
                </motion.div>
              </div>

              {flywheelTools.map((tool, i) => {
                const isSelected = selectedId === tool.id;
                const isHovered = hoveredId === tool.id;
                const isConnected = !!activeId && (tool.connectsTo.includes(activeId) || activeConnectsTo.includes(tool.id));
                const isDimmed = !!activeId && activeId !== tool.id && !isConnected;
                const nodeColor = getAccent(tool.id);

                return (
                  <motion.div
                    key={tool.id}
                    className="absolute"
                    style={{ left: POSITIONS[tool.id].x - NODE_SIZE/2, top: POSITIONS[tool.id].y - NODE_SIZE/2, width: NODE_SIZE, height: NODE_SIZE, zIndex: isSelected ? 100 : 50 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, opacity: isDimmed ? 0.2 : 1 }}
                    transition={{ type: "spring", delay: i * 0.02 }}
                  >
                    <AnimatePresence>
                      {isHovered && !selectedId && (
                        <NodeHoverHUD tool={tool} color={nodeColor} x={POSITIONS[tool.id].x} />
                      )}
                    </AnimatePresence>

                    <Magnetic strength={0.5}>
                      <button
                        type="button"
                        onClick={() => handleSelect(tool.id)}
                        onMouseEnter={() => setHoveredId(tool.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="relative w-full h-full rounded-xl border flex flex-col items-center justify-center transition-all duration-500 overflow-visible group"
                        style={{
                          backgroundColor: isSelected ? withAlpha(nodeColor, 0.3) : isHovered ? withAlpha(nodeColor, 0.1) : "rgba(0,0,0,0.8)",
                          borderColor: isSelected ? nodeColor : isHovered ? withAlpha(nodeColor, 0.5) : "rgba(255,255,255,0.1)",
                          boxShadow: isSelected ? `0 0 50px ${withAlpha(nodeColor, 0.5)}` : isHovered ? `0 0 20px ${withAlpha(nodeColor, 0.2)}` : "none",
                        }}
                      >
                        <NodePulse active={isSelected} color={nodeColor} />
                        <div className={cn("relative z-10 transition-transform duration-500", isSelected && "scale-110")}>
                          {React.createElement(iconMap[tool.icon] || Zap, {
                            className: "h-6 w-6 mb-1",
                            style: { color: isSelected ? "#ffffff" : isHovered ? nodeColor : withAlpha(nodeColor, 0.7) }
                          })}
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-tighter transition-colors" style={{ color: isSelected ? "#ffffff" : isHovered ? nodeColor : "rgb(148,163,184)" }}>{tool.shortName}</span>
                        {/* Circuit junction decorations at corners */}
                        <CircuitJunction color={nodeColor} size={12} className="absolute -left-1.5 -top-1.5 opacity-40" />
                        <CircuitJunction color={nodeColor} size={12} className="absolute -right-1.5 -bottom-1.5 opacity-40" />
                      </button>
                    </Magnetic>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* THE FORENSIC DASHBOARD */}
          <div className="relative bg-white/[0.01] flex flex-col h-full min-h-[600px] md:min-h-[700px] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/5 lg:hidden" />

            <AnimatePresence mode="wait">
              {selectedTool ? (
                <motion.div
                  key={selectedTool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col h-full overflow-hidden"
                >
                  <div className="p-10 md:p-12 border-b border-white/5 bg-white/[0.02] relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30" style={{ color: panelAccent }} />
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border shadow-xl" style={{ backgroundColor: withAlpha(panelAccent, 0.12), borderColor: withAlpha(panelAccent, 0.3) }}>
                            <Microscope className="h-3.5 w-3.5" style={{ color: panelAccent }} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: panelAccent }}>Node_Analysis_Active</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-600 border border-white/5 px-2 py-1 rounded bg-black/40">UUID: {selectedTool.id.toUpperCase()}</span>
                        </div>
                        <div className="space-y-3 text-left">
                          <GlitchText trigger="always" intensity="low">
                            <h3 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">{selectedTool.name}</h3>
                          </GlitchText>
                          <p className="text-sm font-bold uppercase tracking-[0.4em]" style={{ color: withAlpha(panelAccent, 0.8) }}>{selectedTool.tagline}</p>
                        </div>
                      </div>
                      <div className="flex gap-8 items-center bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner shrink-0">
                        <div className="text-center space-y-1">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">GitHub_Stars</span>
                          <div className="text-3xl font-black text-white font-mono tracking-tighter">
                            <AnimatedNumber value={selectedTool.stars || 0} />
                          </div>
                        </div>
                        <div className="w-px h-10 bg-white/5" />
                        <div className="text-center space-y-1">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Connectivity</span>
                          <div className="text-3xl font-black font-mono tracking-tighter" style={{ color: panelAccent }}>
                            <AnimatedNumber value={Math.round((selectedTool.connectsTo.length / flywheelTools.length) * 100)} suffix="%" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-10 md:p-12 overflow-y-auto custom-scrollbar bg-black/20">
                    <div className="grid md:grid-cols-2 gap-12 text-left">
                      <div className="space-y-8">
                        <div className="flex items-center gap-3">
                          <LayoutGrid className="h-4 w-4" style={{ color: panelAccent }} />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Functionality_Matrix</h4>
                        </div>
                        <div className="grid gap-3">
                          {selectedTool.features.map((f, fi) => (
                            <motion.div
                              key={f}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: fi * 0.05 }}
                              className="group/feature relative p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all flex items-center gap-5 overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover/feature:opacity-100 transition-opacity" />
                              <div className="h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: panelAccent, color: panelAccent }} />
                              <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors relative z-10">{f}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="flex items-center gap-3">
                          <Network className="h-4 w-4" style={{ color: panelAccent }} />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Communication_Links</h4>
                        </div>
                        <div className="space-y-4">
                          {selectedTool.connectsTo.map((tid, ti) => {
                            const target = flywheelTools.find(t => t.id === tid);
                            if (!target) return null;
                            const targetColor = getAccent(tid);
                            return (
                              <motion.div
                                key={tid}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + ti * 0.05 }}
                                className="relative p-5 rounded-2xl border border-white/5 bg-black/40 group/path"
                              >
                                <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-full transition-all group-hover/path:w-2" style={{ backgroundColor: targetColor }} />
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: targetColor }}>{target.name}</span>
                                  <span className="text-[8px] font-mono text-slate-700">LINK_0{ti+1}</span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic pr-4">
                                  &ldquo;{selectedTool.connectionDescriptions[tid]}&rdquo;
                                </p>
                                <div className="mt-4 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5, delay: 0.5 + ti * 0.1 }}
                                    className="h-full opacity-40"
                                    style={{ backgroundColor: targetColor }}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 md:p-12 border-t border-white/5 bg-black/40 relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Deploy_Protocol</p>
                        <p className="text-sm font-medium text-slate-400">Explore the <strong className="text-white">{selectedTool.name}</strong> repository on GitHub.</p>
                      </div>
                      <Magnetic strength={0.2}>
                        <a
                          href={selectedTool.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-4 px-12 py-6 rounded-2xl text-black font-black text-xs uppercase tracking-[0.25em] hover:brightness-110 transition-all active:scale-95 shadow-2xl group/cta"
                          style={{ backgroundColor: panelAccent, boxShadow: `0 0 50px ${withAlpha(panelAccent, 0.4)}` }}
                        >
                          <FlaskConical className="h-5 w-5 animate-bounce group-hover:scale-125 transition-transform" />
                          INSPECT_REPOSITORY
                        </a>
                      </Magnetic>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col h-full items-center justify-center p-12 md:p-20 text-center space-y-12 relative"
                >
                  <div className="absolute top-12 left-12 w-12 h-12 border-t border-l border-white/10" />
                  <div className="absolute top-12 right-12 w-12 h-12 border-t border-r border-white/10" />
                  <div className="absolute bottom-12 left-12 w-12 h-12 border-b border-l border-white/10" />
                  <div className="absolute bottom-12 right-12 w-12 h-12 border-b border-r border-white/10" />

                  <div className="space-y-8 relative z-10 max-w-lg">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-20 h-24">
                        <RobotMascot className="w-full h-full opacity-60" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500/40">Robot_Swarm_Online</span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                        The AI <br /> <span className="text-animate-blue">Flywheel.</span>
                      </h3>
                      <p className="text-xl text-slate-400 font-medium leading-relaxed italic opacity-60 px-8">
                        &ldquo;{flywheelDescription.subtitle}&rdquo;
                      </p>
                    </div>
                    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-black/40 relative overflow-hidden shadow-inner group">
                      <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {/* Simple CSS pulse replacing NeuralPulse */}
                      <div className="absolute inset-0 rounded-[2.5rem] opacity-20 pointer-events-none">
                        <div className="absolute inset-0 animate-ping rounded-[2.5rem]" style={{ backgroundColor: withAlpha("#3B82F6", 0.05) }} />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-[0.2em] relative z-10">
                        {flywheelDescription.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-8 pt-8">
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Active_Nodes</span>
                        <div className="text-3xl font-black text-white font-mono">{flywheelTools.length}</div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Stability</span>
                        <div className="text-3xl font-black text-blue-500 font-mono">100%</div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Uptime</span>
                        <div className="text-3xl font-black text-white font-mono">14d</div>
                      </div>
                    </div>

                    {/* Author credit — integrated into the flywheel idle panel */}
                    <div className="pt-10 mt-10 border-t border-white/5 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                        <Activity className="h-3 w-3" />
                        Origin_Protocol
                      </div>
                      <h4 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-tight">
                        Crafted by <span className="text-animate-blue">Jeffrey Emanuel.</span>
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Built using the AI Flywheel, an interactive ecosystem of specialized
                        autonomous agents for high-velocity Rust development.
                      </p>
                      <Magnetic strength={0.2}>
                        <a
                          href={siteConfig.social.authorGithub}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          <Github className="h-4 w-4" />
                          AUTHOR
                        </a>
                      </Magnetic>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute top-6 right-8 flex items-center gap-4 opacity-30 pointer-events-none">
          <motion.div
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2"
          >
            <Radio className="h-3 w-3" style={{ color: activeAccent }} />
            <span className="text-[8px] font-mono tracking-[0.2em]" style={{ color: activeAccent }}>SIGNAL_LOCK_STABLE</span>
          </motion.div>
        </div>
      </SyncContainer>

      <BottomSheet isOpen={!!selectedId} onClose={() => setSelectedId(null)} title={selectedTool?.name}>
        {selectedTool && (
          <div className="space-y-10 text-left pb-16">
            <div className="flex items-start gap-6">
              <div
                className="h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-2xl border"
                style={{ backgroundColor: `${panelAccent}20`, borderColor: `${panelAccent}40` }}
              >
                {React.createElement(iconMap[selectedTool.icon] || Zap, { className: "h-8 w-8", style: { color: panelAccent } })}
              </div>
              <div className="pt-1">
                <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedTool.name}</h4>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2" style={{ color: panelAccent }}>{selectedTool.tagline}</p>
              </div>
            </div>
            <div className="grid gap-4">
              {selectedTool.features.map(f => (
                <div key={f} className="flex items-center gap-4 text-sm font-bold text-slate-300 bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: panelAccent, boxShadow: `0 0 8px ${panelAccent}` }} />
                  {f}
                </div>
              ))}
            </div>
            <a
              href={selectedTool.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 w-full py-6 rounded-2xl text-black font-black text-sm uppercase tracking-[0.2em] shadow-2xl"
              style={{ backgroundColor: panelAccent }}
            >
              <Radio className="h-4 w-4" /> INSPECT_REPOSITORY
            </a>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
