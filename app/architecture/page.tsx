"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import SectionShell from "@/components/section-shell";
import GlitchText from "@/components/glitch-text";
import { SyncContainer } from "@/components/sync-elements";
import Timeline from "@/components/timeline";
import { Tooltip } from "@/components/tooltip";
import { changelog } from "@/lib/content";
import { LazyViz } from "@/components/viz/viz-framework";

const SystemTopologyViz = dynamic(() => import("@/components/viz/system-topology-viz"), { ssr: false });
const McpArchitectureViz = dynamic(() => import("@/components/viz/mcp-architecture-viz"), { ssr: false });
const DualWritePipelineViz = dynamic(() => import("@/components/viz/dual-write-pipeline-viz"), { ssr: false });
const CommitCoalescerRaceViz = dynamic(() => import("@/components/viz/commit-coalescer-race-viz"), { ssr: false });
const ReliabilityInternalsViz = dynamic(() => import("@/components/viz/reliability-internals-viz"), { ssr: false });
const ProductBusViz = dynamic(() => import("@/components/viz/product-bus-viz"), { ssr: false });
const SearchV3PipelineViz = dynamic(() => import("@/components/viz/search-v3-pipeline-viz"), { ssr: false });

export default function ArchitecturePage() {
  return (
    <main id="main-content">
      <section
        id="architecture-hero"
        data-scaffold-slot="hero"
        className="relative pt-32 pb-20 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <GlitchText trigger="hover" intensity="medium">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
              Architecture
            </h1>
          </GlitchText>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Explore the high-performance, robust internals of the MCP Agent Mail coordination fabric.
          </p>
        </div>
      </section>

      {/* System Topology */}
      <SectionShell
        id="overview"
        icon="network"
        eyebrow="Agent Mail Topology"
        title="CLI to Archive Dataflow"
        kicker="A practical flow map for how MCP requests move through server handlers into SQLite and git-auditable storage."
      >
        <div className="space-y-5">
          <LazyViz><SystemTopologyViz /></LazyViz>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-400 leading-relaxed">
            <p>
              This map is grounded in the MCP Agent Mail Rust architecture: CLI and robot-mode commands invoke MCP
              tools, handlers persist/query SQLite, and storage workers coalesce archive writes into git history.
            </p>
            <p>
              Use it as the orienting diagram before diving into message lifecycle, reservation guardrails, and
              Search V3 internals in the rest of this page.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* MCP Architecture */}
      <SectionShell
        id="mcp-layer"
        icon="cpu"
        eyebrow="Integration Layer"
        title="MCP Architecture"
        kicker="The Model Context Protocol standardizes communication between the agent runtime and the SQLite coordination layer."
      >
        <div className="space-y-6">
          <LazyViz><McpArchitectureViz /></LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Agent Mail exposes exactly 34 tools and over 20 read-only resources through the <Tooltip term="MCP">Model Context Protocol</Tooltip> surface.
              Because the interface speaks pure JSON-RPC over `stdio`, any modern AI assistant—from Claude Code and Cursor to standalone language models—can seamlessly interoperate with the swarm.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* Dual Write Pipeline */}
      <SectionShell
        id="dual-write"
        icon="package"
        eyebrow="Storage Guarantees"
        title="Dual-Write Pipeline"
        kicker="Achieve sub-millisecond query latency alongside immutable Git auditability."
      >
        <div className="space-y-6">
          <LazyViz><DualWritePipelineViz /></LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Every message and reservation event splits down two concurrent paths. First, it hits <Tooltip term="WAL">SQLite in WAL mode</Tooltip>, guaranteeing immediate visibility for fast FTS5 queries without blocking reads. Simultaneously, it enters a Write-Behind Queue (WBQ) bound for the filesystem.
            </p>
            <p>
              This architecture ensures the live system is blazing fast while still producing human-readable Markdown artifacts in a <Tooltip term="Git-Backed Audit Trail">Git repository</Tooltip>.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* Commit Coalescer */}
      <SectionShell
        id="coalescer"
        icon="gitMerge"
        eyebrow="Write Amplification"
        title="Commit Coalescer"
        kicker="Eliminate Git lock contention by batching concurrent agent writes."
      >
        <div className="space-y-6">
          <LazyViz><CommitCoalescerRaceViz /></LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              When a swarm of 30 agents attempts to log operations simultaneously, raw Git index locks will aggressively contend and crash. The <Tooltip term="Commit Coalescer">Commit Coalescer</Tooltip> intercepts high-frequency filesystem writes and dynamically batches them.
            </p>
            <p>
              Under extreme load, the coalescer can achieve a 9.1x reduction in Git commits, converting an overwhelming storm of isolated operations into clean, atomic filesystem transactions.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* Product Bus */}
      <SectionShell
        id="product-bus"
        icon="globe"
        eyebrow="Cross-Project Federation"
        title="The Product Bus"
        kicker="Federate multiple repositories into a unified coordination layer without sharing a git history."
      >
        <div className="space-y-6">
          <LazyViz><ProductBusViz /></LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The <Tooltip term="Product Bus">Product Bus</Tooltip> maps discrete `project_keys` into a unified namespace. This allows agents to seamlessly search for context, check reservations, and dispatch messages across completely distinct codebases (like a frontend and backend repo) without ever bridging their respective Git archives.
            </p>
          </div>
        </div>
      </SectionShell>
      
      {/* Search V3 */}
      <SectionShell
        id="search"
        icon="search"
        eyebrow="Context Retrieval"
        title="Hybrid Search V3"
        kicker="Two-tier retrieval combining SQLite FTS5 lexical search with semantic embeddings, fused via Reciprocal Rank Fusion."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} accentColor="#6366F1" className="p-4 md:p-6 bg-black/40">
            <LazyViz><SearchV3PipelineViz /></LazyViz>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The Search V3 engine is designed for robust operation. It dispatches queries across lexical (BM25) and semantic vectors in parallel, fusing them with RRF. Crucially, if the semantic model times out, the system degrades gracefully to purely lexical mode—and if SQLite locks up, it falls back to a chronological scan, guaranteeing that an agent is never entirely blinded.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* Reliability Internals */}
      <SectionShell
        id="reliability"
        icon="shield"
        eyebrow="System Resilience"
        title="Reliability Internals"
        kicker="Independent worker loops, backpressure triggers, and robust pool exhaustion recovery."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} accentColor="#EF4444" className="p-4 md:p-6 bg-black/40">
            <LazyViz><ReliabilityInternalsViz /></LazyViz>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Agent Mail is designed to survive the chaos of AI agent swarms. If the <Tooltip term="Write-Behind Queue">WBQ</Tooltip> floods past a threshold of 128 items, the server safely projects <Tooltip term="Backpressure">backpressure</Tooltip> to limit ingestion, giving background workers (Metrics, Integrity, Retention) time to drain buffers.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* Development Timeline */}
      <SectionShell
        id="timeline"
        icon="clock"
        eyebrow="Development"
        title="Build Timeline"
        kicker="From Python foundations to a published Rust crate."
      >
        <Timeline items={changelog} />
      </SectionShell>

      {/* CTA */}
      <section
        id="architecture-next-steps"
        data-scaffold-slot="next-steps"
        className="mx-auto max-w-7xl px-6 py-20 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link href="/showcase" className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 hover:border-blue-500/30 hover:text-white transition-all">
          Interactive Demos
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/getting-started" className="group inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400 transition-all active:scale-95">
          Get Started
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
    </main>
  );
}
