"use client";

import { useMemo, useState } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";

type FlowMode = "message" | "reservation" | "search";
type NodeId = "cli" | "server" | "tools" | "sqlite" | "storage" | "git";

interface TopologyNode {
  id: NodeId;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

interface TopologyEdge {
  id: string;
  from: NodeId;
  to: NodeId;
  label: string;
  flows: FlowMode[];
}

const FLOW_META: Record<FlowMode, { label: string; tone: "blue" | "amber" | "green"; color: string }> = {
  message: { label: "Message Flow", tone: "blue", color: "#3B82F6" },
  reservation: { label: "Reservation Flow", tone: "amber", color: "#F59E0B" },
  search: { label: "Search Flow", tone: "green", color: "#22C55E" },
};

const TOPOLOGY_NODES: TopologyNode[] = [
  { id: "cli", label: "CLI / Robot Mode", sublabel: "am + am robot", x: 40, y: 60, w: 180, h: 70, color: "#3B82F6" },
  { id: "server", label: "MCP Server", sublabel: "tool + resource surface", x: 300, y: 60, w: 180, h: 70, color: "#60A5FA" },
  { id: "tools", label: "Tool Handlers", sublabel: "messaging/reservations/search", x: 560, y: 60, w: 220, h: 70, color: "#818CF8" },
  { id: "sqlite", label: "SQLite", sublabel: "query-speed source of truth", x: 300, y: 220, w: 180, h: 70, color: "#10B981" },
  { id: "storage", label: "Storage Layer", sublabel: "coalescer + queue", x: 560, y: 220, w: 220, h: 70, color: "#14B8A6" },
  { id: "git", label: "Git Archive", sublabel: "auditable durable history", x: 560, y: 360, w: 220, h: 70, color: "#22C55E" },
];

const TOPOLOGY_EDGES: TopologyEdge[] = [
  { id: "cli-to-server", from: "cli", to: "server", label: "MCP request", flows: ["message", "reservation", "search"] },
  { id: "server-to-tools", from: "server", to: "tools", label: "dispatch tool", flows: ["message", "reservation", "search"] },
  { id: "tools-to-sqlite", from: "tools", to: "sqlite", label: "persist/query", flows: ["message", "reservation", "search"] },
  { id: "tools-to-storage", from: "tools", to: "storage", label: "enqueue archive write", flows: ["message", "reservation"] },
  { id: "storage-to-git", from: "storage", to: "git", label: "coalesced commit", flows: ["message", "reservation"] },
];

const FLOW_STEPS: Record<FlowMode, string[]> = {
  message: [
    "CLI invokes send_message or reply_message on MCP server.",
    "Server dispatches to messaging tool handler and writes canonical row to SQLite.",
    "Storage layer enqueues mailbox/archive artifacts and coalesces git writes.",
    "Git archive records canonical + inbox/outbox copies for auditability.",
  ],
  reservation: [
    "CLI invokes file_reservation_paths or renewal/release tools.",
    "Server computes overlap/conflict outcome and writes reservation state to SQLite.",
    "Storage layer emits reservation artifacts used by pre-commit guard workflows.",
    "Git archive stores reservation intent and release history for review.",
  ],
  search: [
    "CLI invokes search_messages / search_messages_product.",
    "Server dispatches into search pipeline with scope and ranking parameters.",
    "SQLite + search indexes provide candidate sets for fusion and ranking.",
    "Response returns ranked hits and diagnostics without archive write fanout.",
  ],
};

function centerOf(node: TopologyNode) {
  return {
    x: node.x + node.w / 2,
    y: node.y + node.h / 2,
  };
}

export default function SystemTopologyViz() {
  const reducedMotion = useVizReducedMotion();
  const [mode, setMode] = useState<FlowMode>("message");

  const nodeById = useMemo(
    () => Object.fromEntries(TOPOLOGY_NODES.map((node) => [node.id, node])) as Record<NodeId, TopologyNode>,
    []
  );

  return (
    <VizSurface aria-label="Agent Mail system topology visualization">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">System Topology Map</h3>
          <p className="text-sm text-slate-400">
            Trace request flow across CLI, MCP server, tools, SQLite, storage queue, and git archive.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FLOW_META) as FlowMode[]).map((flow) => (
            <VizControlButton
              key={flow}
              tone={FLOW_META[flow].tone}
              onClick={() => setMode(flow)}
              className={mode === flow ? "opacity-100" : "opacity-70"}
            >
              {FLOW_META[flow].label}
            </VizControlButton>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3">
        <svg viewBox="0 0 820 460" className="mx-auto w-full min-w-[760px]" role="img" aria-label="System topology graph">
          <defs>
            <marker id="topology-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={FLOW_META[mode].color} />
            </marker>
            <marker id="topology-arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
            </marker>
          </defs>

          {TOPOLOGY_EDGES.map((edge) => {
            const fromNode = nodeById[edge.from];
            const toNode = nodeById[edge.to];
            const from = centerOf(fromNode);
            const to = centerOf(toNode);
            const active = edge.flows.includes(mode);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            return (
              <g key={edge.id}>
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={active ? FLOW_META[mode].color : "#334155"}
                  strokeWidth={active ? 2.6 : 1.2}
                  strokeDasharray={active ? "none" : "6 5"}
                  markerEnd={active ? "url(#topology-arrow-active)" : "url(#topology-arrow-muted)"}
                  animate={{
                    stroke: active ? FLOW_META[mode].color : "#334155",
                    strokeWidth: active ? 2.6 : 1.2,
                    opacity: active ? 1 : 0.55,
                  }}
                  transition={{ duration: reducedMotion ? 0 : 0.25 }}
                />
                <text x={midX} y={midY - 8} textAnchor="middle" fill={active ? "#E2E8F0" : "#64748B"} fontSize={10}>
                  {edge.label}
                </text>
                {active && (
                  reducedMotion ? (
                    <circle cx={midX} cy={midY} r={4} fill={FLOW_META[mode].color} />
                  ) : (
                    <motion.circle
                      cx={from.x}
                      cy={from.y}
                      r={4}
                      fill={FLOW_META[mode].color}
                      animate={{ cx: [from.x, to.x], cy: [from.y, to.y] }}
                      transition={{ duration: 1.8, ease: "linear", repeat: Infinity }}
                    />
                  )
                )}
              </g>
            );
          })}

          {TOPOLOGY_NODES.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx={12}
                fill={`${node.color}18`}
                stroke={node.color}
                strokeWidth={1.4}
              />
              <text x={node.x + node.w / 2} y={node.y + 26} textAnchor="middle" fill="#FFFFFF" fontSize={12} fontWeight={700}>
                {node.label}
              </text>
              <text x={node.x + node.w / 2} y={node.y + 46} textAnchor="middle" fill="#94A3B8" fontSize={10}>
                {node.sublabel}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Flow Steps</p>
          <ol className="mt-3 space-y-2 text-sm text-slate-300">
            {FLOW_STEPS[mode].map((step, idx) => (
              <li key={step}>
                <span className="mr-2 font-bold text-white">{idx + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operational Notes</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>SQLite remains the query-speed system of record for agent-facing tools.</li>
            <li>Storage queue/coalescer converts high-frequency writes into fewer git commits.</li>
            <li>Message and reservation flows produce archive artifacts; search flow is mostly read-heavy.</li>
            <li>This map is designed to align with stress and diagnostics modules in the showcase.</li>
          </ul>
        </article>
      </div>
    </VizSurface>
  );
}
