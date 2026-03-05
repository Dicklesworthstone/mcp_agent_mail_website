"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SectionShell from "@/components/section-shell";
import GlitchText from "@/components/glitch-text";
import RobotMascot from "@/components/robot-mascot";
import { SyncContainer } from "@/components/sync-elements";
import { Tooltip } from "@/components/tooltip";

const RegionTreeViz = dynamic(() => import("@/components/viz/region-tree-viz"), { ssr: false });
const CancelProtocolViz = dynamic(() => import("@/components/viz/cancel-protocol-viz"), { ssr: false });
const SchedulerLanesViz = dynamic(() => import("@/components/viz/scheduler-lanes-viz"), { ssr: false });
const ObligationFlowViz = dynamic(() => import("@/components/viz/obligation-flow-viz"), { ssr: false });
const MessageLifecycleViz = dynamic(() => import("@/components/viz/message-lifecycle-viz"), { ssr: false });
const LabRuntimeViz = dynamic(() => import("@/components/viz/lab-runtime-viz"), { ssr: false });
const TokioComparisonViz = dynamic(() => import("@/components/viz/tokio-comparison-viz"), { ssr: false });
const CapabilitySecurityViz = dynamic(() => import("@/components/viz/capability-security-viz"), { ssr: false });
const DporPruningViz = dynamic(() => import("@/components/viz/dpor-pruning-viz"), { ssr: false });
const TwoPhaseEffectsViz = dynamic(() => import("@/components/viz/two-phase-effects-viz"), { ssr: false });
const FountainCodeViz = dynamic(() => import("@/components/viz/fountain-code-viz"), { ssr: false });
const SpectralDeadlockViz = dynamic(() => import("@/components/viz/spectral-deadlock-viz"), { ssr: false });
const SporkOtpViz = dynamic(() => import("@/components/viz/spork-otp-viz"), { ssr: false });
const CalmViz = dynamic(() => import("@/components/viz/calm-theorem-viz"), { ssr: false });
const LyapunovPotentialViz = dynamic(() => import("@/components/viz/lyapunov-potential-viz"), { ssr: false });
const Exp3SchedulerViz = dynamic(() => import("@/components/viz/exp3-scheduler-viz"), { ssr: false });
const CancellationInjectionViz = dynamic(() => import("@/components/viz/cancellation-injection-viz"), { ssr: false });
const TestOraclesViz = dynamic(() => import("@/components/viz/test-oracles-viz"), { ssr: false });
const MacaroonCaveatViz = dynamic(() => import("@/components/viz/macaroon-caveat-viz"), { ssr: false });
const BudgetAlgebraViz = dynamic(() => import("@/components/viz/budget-algebra-viz"), { ssr: false });
const FoataFingerprintViz = dynamic(() => import("@/components/viz/foata-fingerprint-viz"), { ssr: false });
const ConformalCalibrationViz = dynamic(() => import("@/components/viz/conformal-calibration-viz"), { ssr: false });
const CancelFuelViz = dynamic(() => import("@/components/viz/cancel-fuel-viz"), { ssr: false });
const TraceReplayStabilityViz = dynamic(() => import("@/components/viz/trace-replay-stability-viz"), { ssr: false });
const SagaCompensationViz = dynamic(() => import("@/components/viz/saga-compensation-viz"), { ssr: false });
const SmallStepSemanticsViz = dynamic(() => import("@/components/viz/small-step-semantics-viz"), { ssr: false });

const FileReservationViz = dynamic(() => import("@/components/viz/file-reservation-viz"), { ssr: false });
const AgentHandshakeViz = dynamic(() => import("@/components/viz/agent-handshake-viz"), { ssr: false });
const McpArchitectureViz = dynamic(() => import("@/components/viz/mcp-architecture-viz"), { ssr: false });
const McpBeadsIntegrationViz = dynamic(() => import("@/components/viz/mcp-beads-integration-viz"), { ssr: false });
const SearchV3PipelineViz = dynamic(() => import("@/components/viz/search-v3-pipeline-viz"), { ssr: false });
const TuiScreensViz = dynamic(() => import("@/components/viz/tui-screens-viz"), { ssr: false });
const RobotModeViz = dynamic(() => import("@/components/viz/robot-mode-viz"), { ssr: false });
const ProductBusViz = dynamic(() => import("@/components/viz/product-bus-viz"), { ssr: false });
const ReliabilityInternalsViz = dynamic(() => import("@/components/viz/reliability-internals-viz"), { ssr: false });
const BuildSlotCoordinatorViz = dynamic(() => import("@/components/viz/build-slot-coordinator-viz"), { ssr: false });
const HumanOverseerViz = dynamic(() => import("@/components/viz/human-overseer-viz"), { ssr: false });
const DualModeInterfaceViz = dynamic(() => import("@/components/viz/dual-mode-interface-viz"), { ssr: false });

function VizLoader() {
  return (
    <div className="flex items-center justify-center h-64 text-slate-600 text-sm font-mono">
      Loading visualization...
    </div>
  );
}

export default function ShowcasePage() {
  return (
    <main id="main-content">
      <section
        id="showcase-hero"
        data-scaffold-slot="hero"
        className="relative pt-32 pb-20 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-24">
              <RobotMascot />
            </div>
          </div>

          <GlitchText trigger="hover" intensity="medium">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
              Interactive Demos
            </h1>
          </GlitchText>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Explore Agent Mail&apos;s key concepts through interactive visualizations.
          </p>
        </div>
      </section>

      <div id="showcase-viz-gallery" data-scaffold-slot="visualizations">
      {/* ================================================================
          0. Agent Mail Messaging Lifecycle
          ================================================================ */}
      <SectionShell
        id="message-lifecycle"
        icon="monitor"
        eyebrow="Agent Mail Core Loop"
        title="Message Lifecycle + Thread Continuity"
        kicker="Send, persist, deliver, read/ack, and thread-index events are all explicit and auditable."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <MessageLifecycleViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              This flow models MCP Agent Mail&apos;s operational core, not a toy animation: message tool calls
              persist canonical rows in SQLite, fan out inbox/outbox artifacts, and keep thread continuity
              queryable across sessions.
            </p>
            <p>
              Toggle <code className="text-blue-400 font-mono">ack_required</code> to compare explicit
              acknowledgement workflows against standard read-only delivery. Both paths remain searchable and
              replayable through thread and search surfaces.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.1 Agent Handshake Protocol
          ================================================================ */}
      <SectionShell
        id="agent-handshake"
        icon="shield"
        eyebrow="Trust & Consent"
        title="Agent Handshake Protocol"
        kicker="Agents must explicitly request and approve contact before messaging each other."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <AgentHandshakeViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              To prevent an adversarial or uncoordinated swarm from spamming each other, Agent Mail enforces a strict handshake.
              The visualization now includes both approval and rejection branches so you can compare downstream behavior.
            </p>
            <p>
              Watch for the state boundary where permission flips from blocked to trusted. That transition is
              explicit, logged, and queryable, which is critical for post-incident reasoning.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.2 File Reservations
          ================================================================ */}
      <SectionShell
        id="file-reservations"
        icon="lock"
        eyebrow="Conflict Prevention"
        title="Advisory File Reservations"
        kicker="Agents use TTL-based locks to signal intent and avoid stepping on each other's edits."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <FileReservationViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Before editing a file, an agent requests a lock via MCP. If another agent holds it, they get an advisory conflict warning.
            </p>
            <p>
              Step through enforce, warn, and bypass guard modes to see how policy changes commit/push outcomes
              without hiding ownership intent or stale-lock recovery mechanics.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.3 Beads Integration
          ================================================================ */}
      <SectionShell
        id="beads-integration"
        icon="gitMerge"
        eyebrow="Task Tracking"
        title="Beads Integration"
        kicker="Reservations and messages are inextricably linked to 'br' issue tracking."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <McpBeadsIntegrationViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              By passing the issue ID to reservation requests, the entire swarm knows exactly why a file is locked.
            </p>
            <p>
              In discovered-work mode, the demo shows how newly uncovered tasks link back to the parent bead
              instead of becoming disconnected TODO noise.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.4 MCP Architecture
          ================================================================ */}
      <SectionShell
        id="mcp-architecture"
        icon="network"
        eyebrow="System Design"
        title="MCP Architecture"
        kicker="The Model Context Protocol connects LLM clients directly to the Rust-backed mail server."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <McpArchitectureViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Under the hood, Agent Mail acts as an MCP server providing tools over stdio/HTTP. It persists everything locally to SQLite.
            </p>
            <p>
              Use the mode toggles to compare message, reservation, and search request paths on the same architecture diagram.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.5 Search V3 Hybrid Pipeline
          ================================================================ */}
      <SectionShell
        id="search-v3-pipeline"
        icon="sparkles"
        eyebrow="Search Infrastructure"
        title="Hybrid Search V3 Pipeline"
        kicker="Two-tier fusion combining lexical FTS5 and semantic embedding retrieval with reciprocal rank fusion."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <SearchV3PipelineViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Search V3 parses queries, routes them through lexical and semantic tiers with budget-derived candidate caps, fuses results via RRF, and applies field-match and recency reranking. When tiers fail, the pipeline gracefully degrades to a chronological fallback scan.
            </p>
            <p>
              Keep the same query preset while switching modes to see exactly how recall, relevance, and latency shift.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.6 TUI Screens Architecture
          ================================================================ */}
      <SectionShell
        id="tui-screens"
        icon="monitor"
        eyebrow="Operations Console"
        title="15-Screen TUI Architecture"
        kicker="Jump-key navigation across four screen categories: operations, coordination, observability, and system."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <TuiScreensViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The TUI organizes 15 screens into four categories. Each screen answers a single core question
              and surfaces the primary signals needed for operators to make fast decisions. Jump keys provide
              O(1) navigation to any screen.
            </p>
            <p>
              Filter by category, then inspect the selected screen&apos;s core question to understand the information
              architecture logic behind every jump key.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.7 Robot Mode CLI
          ================================================================ */}
      <SectionShell
        id="robot-mode"
        icon="cpu"
        eyebrow="Agent Interface"
        title="Robot Mode CLI"
        kicker="16 non-interactive commands across 5 tracks with toon, JSON, and Markdown output formats."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <RobotModeViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Robot mode provides agents with 16 non-interactive commands designed for machine consumption.
              The toon format minimizes token usage, JSON provides full data fidelity for programmatic use,
              and Markdown renders threads and messages for human-readable contexts.
            </p>
            <p>
              The command recipe panel demonstrates a practical sequence agents can run to triage, decide, and report.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.8 Product Bus + Contact Governance
          ================================================================ */}
      <SectionShell
        id="product-bus"
        icon="network"
        eyebrow="Cross-Project Coordination"
        title="Product Bus + Contact Governance"
        kicker="Link repositories under products for unified search, cross-project messaging, and contact-governed communication."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <ProductBusViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The product bus groups multiple repositories under a shared product umbrella. Once linked,
              agents can search across all repos, send messages to agents in other projects using
              name@project addressing, and coordinate via contact governance policies.
            </p>
            <p>
              The stepper now makes the governance order explicit: contact policy resolution precedes cross-project messaging.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.9 Reliability Internals
          ================================================================ */}
      <SectionShell
        id="reliability-internals"
        icon="shield"
        eyebrow="Storage Reliability"
        title="Reliability Internals"
        kicker="Write batching, backpressure management, lock recovery, and worker loop health monitoring."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <ReliabilityInternalsViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Agent Mail&apos;s SQLite storage layer coalesces individual writes into batched WAL
              transactions. When 17 operations arrive in a 50ms burst, the commit coalescer groups
              them into a single atomic fsync — reducing I/O overhead by an order of magnitude while
              maintaining strict durability guarantees.
            </p>
            <p>
              The backpressure system monitors write queue depth against a configurable threshold (default: 128).
              When the queue exceeds this limit, callers receive advisory backpressure signals to throttle
              submissions. Four independent worker loops — ACK processing, retention enforcement, metrics
              collection, and integrity checking — each recover gracefully from stalls without blocking
              the others.
            </p>
            <p>
              Toggle between normal and stress profiles to see how queue pressure and commit latency move under load.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.10 Dual-Mode Interface Safety
          ================================================================ */}
      <SectionShell
        id="dual-mode-interface"
        icon="terminal"
        eyebrow="Mode Security"
        title="Dual-Mode Surface Isolation"
        kicker="Strict entrypoint separation prevents agents from hallucinating infinite TUI interactions."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <DualModeInterfaceViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              If a coding agent accidentally executes the human operator CLI (<code className="text-blue-400 font-mono">am</code>), 
              the system immediately exits with code 2. This prevents the LLM from burning thousands of tokens trying to parse and interact with 
              ANSI escape sequences in an interactive terminal application.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.11 Build Slot Coordination
          ================================================================ */}
      <SectionShell
        id="build-slot-coordination"
        icon="cpu"
        eyebrow="Resource Management"
        title="Advisory Build Slots"
        kicker="Prevent heavy concurrent compilations from thrashing CPU or corrupting the Cargo target directory lock."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <BuildSlotCoordinatorViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              When multiple agents attempt to compile the same codebase concurrently, it leads to massive performance degradation and lock conflicts. 
              The <code className="text-blue-400 font-mono">acquire_build_slot</code> tool allows agents to request mutually exclusive runtime 
              leases on critical computational resources.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          0.12 Human Overseer Injection
          ================================================================ */}
      <SectionShell
        id="human-overseer"
        icon="shield"
        eyebrow="Agent Steering"
        title="Human Overseer Control"
        kicker="Send absolute-priority override messages directly into any agent's inbox via the Web UI."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <HumanOverseerViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Traditional prompt engineering requires killing the agent session to provide feedback. 
              The Human Overseer mechanism injects messages with <code className="text-blue-400 font-mono">importance: urgent</code> 
              that bypass all standard contact policies. This allows operators to seamlessly pause, pivot, or unblock autonomous swarms mid-execution.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          1. Region Tree
          ================================================================ */}
      <SectionShell
        id="region-tree"
        icon="blocks"
        eyebrow="Structured Concurrency"
        title="Region Tree"
        kicker={<>Click a <Tooltip term="Region">region</Tooltip> to cancel it and watch the cancel cascade propagate through its children.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <RegionTreeViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The visualization displays an Asupersync <Tooltip term="Region Tree">region tree</Tooltip>, the foundational
              data structure behind structured concurrency. Every task in the runtime lives inside
              a <Tooltip term="Region">region</Tooltip>, and regions nest to form a strict hierarchy. When a
              parent region closes or is cancelled, all of its children receive a cancel signal automatically.
            </p>
            <p>
              Click any region node to trigger cancellation. The <Tooltip term="Three-Phase Cancel Protocol">cancel
              protocol</Tooltip> propagates downward through the tree: each child enters
              the <Tooltip term="Drain Phase">drain phase</Tooltip>, runs
              its <Tooltip term="Finalize Phase">finalizers</Tooltip>, and then reports completion upward. This
              structured teardown eliminates orphaned tasks, a class of bugs that plagues runtimes like
              Tokio where <code className="text-blue-400 font-mono">tokio::spawn</code> creates globally-scoped
              futures with no parent linkage.
            </p>
            <p>
              The practical consequence is composability. Because region lifetimes are lexically scoped, you
              can reason about task ownership the same way you reason about variable ownership in Rust. If
              a region is not visible in your code, no task inside it can outlive your scope. See
              the <Link href="/architecture#regions" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">architecture deep-dive</Link> for
              the formal model.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          2. Cancel Protocol
          ================================================================ */}
      <SectionShell
        id="cancel-protocol"
        icon="shield"
        eyebrow="Safety"
        title="Cancel Protocol"
        kicker={<>Step through the <Tooltip term="Three-Phase Cancel Protocol">three-phase cancel protocol</Tooltip> and compare it with Tokio&apos;s silent drop.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <CancelProtocolViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              This visualization walks through Asupersync&apos;s <Tooltip term="Three-Phase Cancel Protocol">three-phase
              cancel protocol</Tooltip>, the mechanism that replaces Tokio&apos;s
              implicit <code className="text-blue-400 font-mono">Drop</code>-based cancellation. In Tokio,
              dropping a <code className="text-blue-400 font-mono">JoinHandle</code> silently abandons the future
              mid-execution with no cleanup guarantee. Asupersync&apos;s protocol ensures that every cancelled task
              follows a structured shutdown sequence: Request, <Tooltip term="Drain Phase">Drain</Tooltip>, <Tooltip term="Finalize Phase">Finalize</Tooltip>.
            </p>
            <p>
              During the Request phase, the runtime sets a flag on the task&apos;s <Tooltip term="Cx">Cx</Tooltip> token.
              The task can observe this flag at any <code className="text-blue-400 font-mono">checkpoint()</code> call
              and begin graceful shutdown. The <Tooltip term="Drain Phase">Drain</Tooltip> phase gives the task a
              bounded <Tooltip term="Budget">budget</Tooltip> to flush buffers, close connections, and release
              locks. Finally, the <Tooltip term="Finalize Phase">Finalize</Tooltip> phase runs registered
              finalizers in LIFO order, guaranteeing that resources acquired last are released first.
            </p>
            <p>
              Step through each phase in the visualization to see the state transitions. Then compare
              the Asupersync side with Tokio&apos;s behavior: notice how Tokio&apos;s drop produces no observable
              cleanup steps, while Asupersync&apos;s protocol generates a deterministic, auditable shutdown trace.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          3. Two-Phase Effects
          ================================================================ */}
      <SectionShell
        id="two-phase-effects"
        icon="package"
        eyebrow="State Consistency"
        title="Two-Phase Effects"
        kicker="Reserve side-effects to make them reversible. Commit them permanently only when safe from cancellation."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <TwoPhaseEffectsViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Two-Phase Effect">Two-phase effects</Tooltip> solve a fundamental problem in
              cancellable systems: what happens to side-effects that are partially committed when cancellation
              arrives? In a traditional runtime, a function might send an email, then get cancelled before
              recording that it did so, leaving the system in an inconsistent state.
            </p>
            <p>
              Asupersync splits every side-effect into two steps. The Reserve step stages the effect as a
              reversible intention, producing a handle the task can hold. The Commit step, which only succeeds
              if the task is not in a cancelled state, makes the effect permanent. If cancellation arrives
              between Reserve and Commit, the runtime automatically rolls back all reserved-but-uncommitted
              effects.
            </p>
            <p>
              The visualization shows effects moving through this lifecycle. Try triggering a cancel during the
              window between reservation and commit to see the rollback in action. This pattern integrates
              with the <Tooltip term="Obligation System">obligation system</Tooltip>: each reserved effect
              produces a <Tooltip term="Permit">permit</Tooltip> that must be either committed or explicitly
              dropped, making leaked effects a compile-time error.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          4. Capability Security
          ================================================================ */}
      <SectionShell
        id="capability-security"
        icon="key"
        eyebrow="Zero Trust"
        title="Capability Security"
        kicker={<>Toggle capabilities on the <Tooltip term="Cx">Cx</Tooltip> token and see how the runtime intercepts unauthorized operations.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <CapabilitySecurityViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Capability Security">Capability security</Tooltip> is Asupersync&apos;s enforcement
              mechanism for the principle of least authority. Every task receives
              a <Tooltip term="Cx">Cx</Tooltip> token at spawn time, and that token carries a
              specific <Tooltip term="Capability Tier">capability tier</Tooltip> that determines what operations
              the task is permitted to perform. A task with <Tooltip term="FiberCap">FiberCap</Tooltip> can only
              compute. A task with <Tooltip term="IoCap">IoCap</Tooltip> can additionally access the network
              and filesystem.
            </p>
            <p>
              Toggle individual capabilities in the visualization to see the runtime&apos;s response. When a task
              attempts an operation outside its tier, the runtime does not panic or silently fail.
              Instead, the <Tooltip term="Capability Gate">capability gate</Tooltip> intercepts the call and
              returns a typed error, allowing the task to handle the denial gracefully.
            </p>
            <p>
              This design eliminates an entire category of security vulnerabilities. Third-party library code
              that you spawn with <Tooltip term="FiberCap">FiberCap</Tooltip> cannot exfiltrate data over the
              network, because the I/O capability simply does not exist in its token. The restriction is
              structural, not policy-based, so it cannot be bypassed by malicious code at runtime.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          5. Attenuating Capabilities (Macaroon Caveats)
          ================================================================ */}
      <SectionShell
        id="macaroon-caveats"
        icon="key"
        eyebrow="Delegation Security"
        title="Attenuating Capabilities"
        kicker={<>Capabilities behave like <Tooltip term="Macaroon">Macaroons</Tooltip>. A child can add further restrictions, but can never strip the parent&apos;s constraints away.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <MacaroonCaveatViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              This visualization demonstrates Asupersync&apos;s <Tooltip term="Macaroon">Macaroon</Tooltip>-inspired
              capability delegation model. When a parent task delegates a capability to a child, it can attach
              additional restrictions (caveats) that narrow the child&apos;s permissions. The critical invariant:
              a child can never widen a capability it received. Delegation is a one-way ratchet toward less
              privilege.
            </p>
            <p>
              The mechanism works without a central authority. Each caveat is cryptographically chained to the
              previous one, so any recipient can verify the full chain of restrictions locally. This means you
              can safely pass capabilities across trust boundaries, because the math guarantees that tampering
              with the caveat chain invalidates the entire token.
            </p>
            <p>
              Try adding caveats in the visualization and observe how they stack. A parent that
              grants <Tooltip term="IoCap">IoCap</Tooltip> with a &ldquo;read-only filesystem&rdquo; caveat
              produces a child token that can never write to disk, regardless of what further delegations occur
              downstream. This composable restriction model is what
              makes Asupersync&apos;s <Tooltip term="Capability Security">capability security</Tooltip> practical
              at scale.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          6. Cancel Budget Algebra
          ================================================================ */}
      <SectionShell
        id="budget-algebra"
        icon="calculator"
        eyebrow="Algebraic Composition"
        title="Cancel Budget Algebra"
        kicker={<>Cancel <Tooltip term="Budget">budgets</Tooltip> mathematically compose downwards across nested <Tooltip term="Region">regions</Tooltip> using a <Tooltip term="Product Semiring">Product Semiring</Tooltip>.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <BudgetAlgebraViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Budget Algebra">Budget algebra</Tooltip> governs how cancellation time limits
              propagate through the <Tooltip term="Region Tree">region tree</Tooltip>.
              Each <Tooltip term="Region">region</Tooltip> declares
              a <Tooltip term="Budget">budget</Tooltip>: the maximum time (or ticks) its tasks are allowed to
              spend in the <Tooltip term="Drain Phase">drain phase</Tooltip> during cancellation. When regions
              nest, their budgets compose using a <Tooltip term="Product Semiring">product semiring</Tooltip>,
              which takes the minimum of parent and child budgets.
            </p>
            <p>
              This algebraic composition ensures a global invariant: no nested region can drain longer than its
              parent permits. If a parent region has a 100ms drain budget and a child declares 500ms, the
              effective child budget is clamped to 100ms. The composition is associative and commutative, so
              the nesting depth does not affect the computation&apos;s correctness.
            </p>
            <p>
              Adjust the budget values in the visualization to see how they propagate. Notice that the effective
              budget at any leaf node is always the minimum along its path from the root. This property is what
              makes <Tooltip term="Cancel Fuel">cancel fuel</Tooltip> a termination proof:
              the <Tooltip term="Lyapunov Potential">Lyapunov potential</Tooltip> is bounded by the root budget,
              guaranteeing that the entire cancel cascade completes in finite time.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          7. Spectral Deadlock Detection
          ================================================================ */}
      <SectionShell
        id="spectral-deadlock"
        icon="network"
        eyebrow="System Lifeline"
        title="Spectral Deadlock Detection"
        kicker={<>Watch the <Tooltip term="Fiedler Value">Fiedler value</Tooltip> plummet as a cyclic <Tooltip term="Wait-Graph">wait-graph</Tooltip> forms, triggering proactive intervention.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <SpectralDeadlockViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Spectral Wait-Graph Analysis">Spectral deadlock detection</Tooltip> monitors the
              runtime&apos;s <Tooltip term="Wait-Graph">wait-graph</Tooltip> in real time by computing the
              second-smallest eigenvalue of its Laplacian matrix, known as
              the <Tooltip term="Fiedler Value">Fiedler value</Tooltip>. A connected graph with no cycles has a
              positive Fiedler value. As a deadlock cycle forms, the Fiedler value drops toward zero, giving
              the runtime advance warning before tasks actually block.
            </p>
            <p>
              The visualization builds a wait-graph incrementally. Watch the Fiedler value in the readout as
              edges are added. When it crosses the critical threshold, the runtime triggers intervention: it
              identifies the task in the cycle with the lowest priority and cancels it via
              the <Tooltip term="Three-Phase Cancel Protocol">cancel protocol</Tooltip>, breaking the deadlock
              without operator intervention.
            </p>
            <p>
              Traditional deadlock detectors are reactive: they find cycles after tasks are already stuck.
              Spectral analysis is predictive. The <Tooltip term="Fiedler Value">Fiedler value</Tooltip> functions
              as a continuous health metric, analogous to monitoring CPU temperature rather than waiting for a
              thermal shutdown. This approach catches near-deadlocks, situations where tasks are one edge away
              from a cycle, before they become production incidents.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          8. RaptorQ Fountain Codes
          ================================================================ */}
      <SectionShell
        id="fountain-codes"
        icon="droplets"
        eyebrow="Resilient Data"
        title="RaptorQ Fountain Codes"
        kicker="Rateless erasure coding over lossy channels perfectly reconstructs data without retransmission requests."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <FountainCodeViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Fountain Code">Fountain codes</Tooltip>
              (specifically <Tooltip term="RaptorQ">RaptorQ</Tooltip>) allow Asupersync to transfer data reliably
              across lossy channels without acknowledgments or retransmission requests. The sender encodes the
              original data into a potentially infinite stream of coded symbols. The receiver can reconstruct
              the original data from any sufficient subset of received symbols, regardless of which specific
              symbols were lost.
            </p>
            <p>
              The visualization shows symbols flowing from sender to receiver with a configurable packet loss
              rate. Unlike TCP, which stalls on every dropped packet to request
              retransmission, <Tooltip term="RaptorQ">RaptorQ</Tooltip> continues transmitting new coded
              symbols. The receiver accumulates symbols until it has slightly more than the original data size
              (typically 0.2% overhead), then reconstructs the complete message in one pass using
              the <Tooltip term="Luby Transform">Luby transform</Tooltip>.
            </p>
            <p>
              This property makes fountain codes ideal for cancel-heavy workloads where connections may be
              interrupted at any moment. If a cancel signal arrives mid-transfer, the receiver either has enough
              symbols to decode (and the data is fully recovered) or it does not (and the partial transfer is
              cleanly discarded). There is no half-received state to reconcile.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          9. Spork (OTP without flaws)
          ================================================================ */}
      <SectionShell
        id="spork-otp"
        icon="layers"
        eyebrow="Actor System"
        title="Spork (OTP without flaws)"
        kicker={<><Tooltip term="GenServer">GenServers</Tooltip> that mathematically cannot forget to reply to clients.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <SporkOtpViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Spork">Spork</Tooltip> is Asupersync&apos;s actor framework, inspired by Erlang/OTP
              but with a critical fix: the <Tooltip term="Linear Obligations">linear obligation</Tooltip> system
              guarantees that every <Tooltip term="GenServer">GenServer</Tooltip> call receives a reply. In
              Erlang, a gen_server that crashes or forgets to
              call <code className="text-blue-400 font-mono">gen_server:reply/2</code> leaves the caller hanging
              indefinitely. In Spork, the reply obligation is a <Tooltip term="Permit">permit</Tooltip> that must
              be consumed before the handler returns, enforced at compile time.
            </p>
            <p>
              The visualization shows message flow through a Spork <Tooltip term="GenServer">GenServer</Tooltip>.
              Each incoming call produces a reply <Tooltip term="Permit">permit</Tooltip>, and
              the <Tooltip term="Mailbox">mailbox</Tooltip> tracks which permits are outstanding. If a handler
              attempts to return without consuming the reply permit,
              the <Tooltip term="ObligationLeak Oracle">ObligationLeak oracle</Tooltip> catches it
              during <Tooltip term="Lab Runtime">Lab</Tooltip> testing.
            </p>
            <p>
              <Tooltip term="Spork">Spork</Tooltip> also integrates with
              the <Tooltip term="Region Tree">region tree</Tooltip>.
              Each <Tooltip term="GenServer">GenServer</Tooltip> lives inside
              a <Tooltip term="Region">region</Tooltip>, and
              its <Tooltip term="Supervisor">supervisor</Tooltip> can restart it using
              the <Tooltip term="Three-Phase Cancel Protocol">cancel protocol</Tooltip> rather than Erlang&apos;s
              abrupt kill-and-restart. This means in-flight messages are drained and finalizers run before the
              new instance starts, eliminating the lost-message window that plagues OTP restarts.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          10. CALM Theorem Optimization
          ================================================================ */}
      <SectionShell
        id="calm-theorem"
        icon="gitMerge"
        eyebrow="Mathematical Scalability"
        title="CALM Theorem Optimization"
        kicker={<>See how the runtime pushes synchronization barriers out of the hot path for <Tooltip term="Monotone Operation">monotone operations</Tooltip>.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <CalmViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The <Tooltip term="CALM Theorem">CALM theorem</Tooltip> (Consistency As Logical Monotonicity)
              states that <Tooltip term="Monotone Operation">monotone operations</Tooltip>, those whose outputs
              only grow as inputs grow, can be computed
              without <Tooltip term="Coordination Barrier">coordination barriers</Tooltip>. Asupersync&apos;s
              runtime performs <Tooltip term="CALM Analysis">CALM analysis</Tooltip> on each operation to determine
              whether it requires synchronization. Operations classified as monotone (like appending to a log or
              adding to a set) execute without barriers,
              while <Tooltip term="Non-Monotone Operation">non-monotone operations</Tooltip> (like reading a
              counter&apos;s final value) insert barriers only where the math demands them.
            </p>
            <p>
              The visualization shows a stream of operations being classified and scheduled.
              Consecutive <Tooltip term="Monotone Operation">monotone operations</Tooltip> are batched and
              executed concurrently. When a <Tooltip term="Non-Monotone Operation">non-monotone
              operation</Tooltip> appears, the runtime inserts
              a <Tooltip term="Coordination Barrier">coordination barrier</Tooltip>, waits for all in-flight
              monotone operations to complete, then proceeds.
            </p>
            <p>
              This optimization is not a heuristic. The <Tooltip term="CALM Theorem">CALM theorem</Tooltip> provides
              a mathematical guarantee that removing these barriers does not affect correctness. The result is
              higher throughput without sacrificing consistency, because synchronization cost is paid only where
              it is provably necessary.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          11. Lyapunov Potential
          ================================================================ */}
      <SectionShell
        id="lyapunov-potential"
        icon="activity"
        eyebrow="Formal Progress"
        title="Lyapunov Potential"
        kicker={<>A mathematical energy function that strictly decreases over time, proving the system will reach <Tooltip term="Quiescence">quiescence</Tooltip>.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <LyapunovPotentialViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              A <Tooltip term="Lyapunov Potential">Lyapunov potential</Tooltip> is a mathematical energy function
              assigned to the runtime&apos;s state. The key property: every scheduler step either decreases the
              potential or leaves it unchanged, and the potential is bounded below by zero. This strict monotonic
              decrease proves that the system must eventually
              reach <Tooltip term="Quiescence">quiescence</Tooltip>, a state where no more work remains.
            </p>
            <p>
              The visualization plots the potential value over time as the scheduler processes tasks. Each
              completed task, each drained <Tooltip term="Region">region</Tooltip>, and each
              consumed <Tooltip term="Permit">permit</Tooltip> reduces the potential. The curve approaches zero
              asymptotically, and the formal proof guarantees it reaches zero in finite steps.
            </p>
            <p>
              This is not just a theoretical curiosity. The <Tooltip term="Lyapunov Potential">Lyapunov
              potential</Tooltip> serves as a progress metric in production. If the potential stops decreasing,
              something is wrong: a task may be livelock-spinning, a <Tooltip term="Region">region</Tooltip> may
              be failing to drain, or a <Tooltip term="Permit">permit</Tooltip> may have leaked.
              The <Tooltip term="Lab Runtime">Lab runtime</Tooltip> checks this invariant via
              a <Tooltip term="Martingale Progress Certificate">martingale progress certificate</Tooltip>,
              catching liveness violations during testing rather than in production.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          12. EXP3 Adaptive Scheduler
          ================================================================ */}
      <SectionShell
        id="exp3-scheduler"
        icon="zap"
        eyebrow="AI Scheduling"
        title="EXP3 Adaptive Scheduler"
        kicker={<>Multi-armed bandit algorithm continuously tunes the scheduler&apos;s cancel-streak limits based on real-time <Tooltip term="Regret Bound">regret</Tooltip> minimization.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <Exp3SchedulerViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The <Tooltip term="EXP3 Scheduler">EXP3 scheduler</Tooltip> treats scheduling policy as an online
              learning problem. Each scheduling decision (how many consecutive cancel tasks to process before
              switching to ready tasks, for example) is an &ldquo;arm&rdquo; in a multi-armed bandit. The EXP3
              algorithm assigns weights to each arm based on observed rewards (throughput, latency, cancel
              responsiveness) and selects arms with probability proportional to their weights.
            </p>
            <p>
              The visualization shows the arm weights updating in real time as the scheduler processes tasks.
              Arms that produce good outcomes gain weight; arms that produce poor outcomes lose weight.
              The <Tooltip term="Regret Bound">regret bound</Tooltip> guarantees that the scheduler&apos;s
              cumulative performance converges to within a logarithmic factor of the best fixed policy in
              hindsight, even if the workload changes adversely.
            </p>
            <p>
              Unlike static scheduling policies that must be tuned by operators, the EXP3 approach adapts
              automatically. A workload that suddenly becomes cancel-heavy will shift weight toward longer
              cancel streaks within milliseconds. The <Tooltip term="Hedge Algorithm">hedge
              algorithm</Tooltip> variant provides even tighter bounds when the number of arms is small, making
              this practical for the <Tooltip term="Three-Lane Scheduler">three-lane scheduler</Tooltip>&apos;s
              finite set of configuration knobs.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          13. Systematic Cancellation Testing
          ================================================================ */}
      <SectionShell
        id="cancellation-injection"
        icon="bomb"
        eyebrow="Chaos Engineering"
        title="Systematic Cancellation Testing"
        kicker={<>The <Tooltip term="Lab Runtime">Lab Runtime</Tooltip> drops cancel bombs at every single await point to mathematically prove your application survives interruption.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <CancellationInjectionViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Systematic cancellation testing replaces ad-hoc timeout tests with exhaustive verification.
              The <Tooltip term="Lab Runtime">Lab runtime</Tooltip> instruments your code to intercept
              every <code className="text-blue-400 font-mono">checkpoint()</code> call, then replays the test
              multiple times, injecting a cancellation at a different await point on each replay. If your code
              has N await points, the Lab runs N+1 executions: one clean run and one cancellation at each
              point.
            </p>
            <p>
              The visualization shows these injection points lighting up as the Lab works through them. Each
              injected cancellation triggers the full <Tooltip term="Three-Phase Cancel Protocol">cancel
              protocol</Tooltip>, and the suite of <Tooltip term="Test Oracle">test oracles</Tooltip> (including
              the <Tooltip term="TaskLeak Oracle">TaskLeak</Tooltip>, <Tooltip term="ObligationLeak Oracle">ObligationLeak</Tooltip>,
              and <Tooltip term="CancelProtocol Oracle">CancelProtocol</Tooltip> oracles) verifies that the
              cancellation was handled correctly.
            </p>
            <p>
              Combined with <Tooltip term="DPOR">DPOR</Tooltip> search pruning
              and <Tooltip term="Seed">seed</Tooltip>-deterministic scheduling, this approach provides a
              mathematical guarantee: if no oracle fires across all injection points and all explored
              interleavings, your code is <Tooltip term="Cancel-Correct">cancel-correct</Tooltip>. This is not a
              confidence interval or a probabilistic claim. It is an exhaustive proof over the tested input
              space.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          14. E-Process Test Oracles
          ================================================================ */}
      <SectionShell
        id="test-oracles"
        icon="search"
        eyebrow="Automated Auditing"
        title="E-Process Test Oracles"
        kicker="Anytime-valid statistical monitors that continuously evaluate runtime invariants and instantly halt tests upon violation."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <TestOraclesViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="E-Process">E-process</Tooltip> <Tooltip term="Test Oracle">test
              oracles</Tooltip> are statistical monitors that run continuously alongside your tests, checking
              runtime invariants without requiring a fixed sample size. Traditional hypothesis tests commit to N
              observations upfront; peeking at intermediate results invalidates the statistical guarantee.
              E-processes use a betting <Tooltip term="Supermartingale">supermartingale</Tooltip> that remains
              valid at every observation, allowing the oracle to halt the test the instant a violation is
              detected.
            </p>
            <p>
              The visualization shows multiple oracles monitoring a running test. Each oracle tracks a specific
              invariant: the <Tooltip term="TaskLeak Oracle">TaskLeak oracle</Tooltip> watches for tasks escaping
              their <Tooltip term="Region">region</Tooltip> scope,
              the <Tooltip term="ObligationLeak Oracle">ObligationLeak oracle</Tooltip> catches
              dropped <Tooltip term="Permit">permits</Tooltip>, and the <Tooltip term="CancelProtocol Oracle">CancelProtocol
              oracle</Tooltip> verifies that every cancellation follows the three-phase contract.
            </p>
            <p>
              The anytime-valid property is critical for <Tooltip term="Lab Runtime">Lab</Tooltip> testing,
              where the number of scheduling interleavings is not known in advance.
              The <Tooltip term="Lab Runtime">Lab</Tooltip> explores interleavings until either an oracle fires
              or <Tooltip term="DPOR">DPOR</Tooltip> reports that all distinct interleavings have been covered.
              Because E-processes maintain their statistical validity at every stopping time, there is no risk
              of false positives from early termination.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          15. Foata Fingerprints
          ================================================================ */}
      <SectionShell
        id="foata-fingerprints"
        icon="gitCompare"
        eyebrow="Trace Theory"
        title="Foata Fingerprints"
        kicker={<>Canonicalizing execution traces to prune <Tooltip term="DPOR">DPOR</Tooltip> search spaces without missing any bugs.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <FoataFingerprintViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              A <Tooltip term="Foata Fingerprint">Foata fingerprint</Tooltip> is a canonical hash of a
              concurrent execution trace. Two traces that differ only in the ordering of independent
              (non-conflicting) operations produce the same fingerprint. This is because the fingerprint is
              computed over the trace&apos;s <Tooltip term="Mazurkiewicz Trace">Mazurkiewicz
              trace</Tooltip> equivalence class: the set of all orderings that differ only in how independent
              events are interleaved.
            </p>
            <p>
              The visualization shows multiple execution traces being reduced to their Foata normal form. In
              this normal form, independent events are grouped into &ldquo;layers&rdquo; where all events within
              a layer can execute in any order. The fingerprint is then a hash of these layers, ignoring
              intra-layer ordering.
            </p>
            <p>
              This technique is essential for <Tooltip term="DPOR">DPOR</Tooltip> efficiency. Without
              fingerprinting, the search algorithm would explore many traces that are equivalent (same
              conflicts, same outcomes, different ordering of independent
              steps). By comparing <Tooltip term="Foata Fingerprint">Foata fingerprints</Tooltip>,
              the <Tooltip term="Lab Runtime">Lab runtime</Tooltip> detects and skips equivalent traces,
              reducing the search space by orders of magnitude while guaranteeing that no distinct behavior is
              missed.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          16. Conformal Calibration
          ================================================================ */}
      <SectionShell
        id="conformal-calibration"
        icon="lineChart"
        eyebrow="Statistical Bounds"
        title="Conformal Calibration"
        kicker="Drawing distribution-free mathematical boundaries to flag anomalous tasks with absolute certainty."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <ConformalCalibrationViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Conformal Calibration">Conformal calibration</Tooltip> constructs prediction
              intervals around expected task behavior without assuming any particular probability distribution.
              Given a calibration set of observed task durations (or resource usage, or any scalar metric),
              conformal prediction outputs an interval such that a new observation falls inside the interval
              with a user-specified probability, say 95%. If a task&apos;s metric falls outside this interval,
              it is flagged as anomalous.
            </p>
            <p>
              The visualization plots task metrics with the conformal prediction band overlaid. Points inside
              the band are normal; points outside are flagged. The width of the band adapts to the observed
              data, widening when variance is high and narrowing when behavior is consistent.
            </p>
            <p>
              The distribution-free guarantee is what distinguishes conformal calibration from parametric
              approaches. You do not need to assume Gaussian, exponential, or any other distributional form.
              The coverage guarantee holds for any data distribution, making it robust against the heavy-tailed
              latency distributions common in async systems. The <Tooltip term="Lab Runtime">Lab
              runtime</Tooltip> uses conformal calibration to set adaptive thresholds
              for <Tooltip term="Test Oracle">test oracles</Tooltip>, replacing hand-tuned timeout constants
              with statistically grounded bounds.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          17. Cancel Fuel
          ================================================================ */}
      <SectionShell
        id="cancel-fuel"
        icon="flame"
        eyebrow="Termination Proof"
        title="Cancel Fuel"
        kicker={<>A strictly decreasing <Tooltip term="Budget">budget</Tooltip> that mathematically guarantees a cancellation cascade will not spin infinitely.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <CancelFuelViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Cancel Fuel">Cancel fuel</Tooltip> is a non-negative integer assigned to each cancel
              propagation event. Every step of the cancellation (entering a
              child <Tooltip term="Region">region</Tooltip>, notifying a task, running a finalizer) costs one unit
              of fuel. When fuel reaches zero, propagation stops. This simple mechanism provides a termination
              proof: the cancel cascade is guaranteed to complete in at most N steps, where N is the initial
              fuel value.
            </p>
            <p>
              The visualization shows fuel depleting as cancellation propagates through
              nested <Tooltip term="Region">regions</Tooltip>. Each region consumes fuel proportional to the
              number of tasks it contains. The initial fuel value is derived from
              the <Tooltip term="Budget Algebra">budget algebra</Tooltip>, which composes parent and
              child <Tooltip term="Budget">budgets</Tooltip> via
              the <Tooltip term="Product Semiring">product semiring</Tooltip>.
            </p>
            <p>
              The formal proof that cancel fuel guarantees termination is
              a <Tooltip term="Supermartingale">supermartingale</Tooltip> argument: the fuel value is a
              non-negative quantity that strictly decreases with each step. Because a non-negative integer
              sequence that strictly decreases must reach zero in finite steps, the cascade terminates. This
              proof is mechanically verified in Lean 4 as part of
              Asupersync&apos;s <Tooltip term="Small-Step Semantics">small-step semantics</Tooltip>.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          18. Trace Replay Stability
          ================================================================ */}
      <SectionShell
        id="trace-replay-stability"
        icon="gitCommit"
        eyebrow="Replay Correctness"
        title="Trace Replay Stability"
        kicker="Resolving concurrent races mathematically. Simultaneous crashes are sorted deterministically, guaranteeing perfect replay."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <TraceReplayStabilityViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Trace replay stability ensures that a recorded execution trace can be replayed identically, even
              when the original execution contained races. The key challenge is tie-breaking: when two events
              occur &ldquo;simultaneously&rdquo; (within the same scheduler tick), the replay engine must
              resolve them in the same order every time. Asupersync uses a deterministic tie-breaking rule
              based on task IDs and <Tooltip term="Region">region</Tooltip> depth, producing a total order over
              concurrent events.
            </p>
            <p>
              The visualization shows concurrent events arriving at the same tick and being sorted into a
              deterministic replay order. Regardless of the order in which the operating system delivers these
              events, the replay engine produces the same sequence. This determinism
              is <Tooltip term="Seed">seed</Tooltip>-dependent: the same <Tooltip term="Seed">seed</Tooltip> always
              produces the same tie-breaking decisions.
            </p>
            <p>
              Stable replay is the foundation of Asupersync&apos;s debugging workflow. When
              a <Tooltip term="Lab Runtime">Lab</Tooltip> test discovers a bug under a
              specific <Tooltip term="Seed">seed</Tooltip>, you can replay that exact execution as many times as
              needed to diagnose the root cause. Without stable tie-breaking, replays would diverge from the
              original execution at the first race, making the recorded trace useless for debugging.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          19. Distributed Sagas
          ================================================================ */}
      <SectionShell
        id="saga-compensation"
        icon="arrowRight"
        eyebrow="Orchestration"
        title="Distributed Sagas"
        kicker="Automatic LIFO compensation of forward actions when long-running workflows fail or are cancelled."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <SagaCompensationViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Saga">Sagas</Tooltip> model multi-step distributed workflows where each step has a
              forward action and a compensating (undo) action. If any step fails or if cancellation arrives
              mid-workflow, the runtime automatically compensates all completed steps in reverse (LIFO) order.
              This ensures that the system returns to a consistent state without manual intervention.
            </p>
            <p>
              The visualization shows a saga executing forward steps (create account, send email, charge card).
              Trigger a failure or cancellation at any point to watch the compensation cascade: the last
              completed step compensates first, then the second-to-last, and so on. Each compensation runs
              through the <Tooltip term="Three-Phase Cancel Protocol">cancel protocol</Tooltip>, so compensating
              actions themselves are subject to the same cleanup guarantees.
            </p>
            <p>
              Asupersync&apos;s saga engine applies <Tooltip term="CALM Analysis">CALM
              analysis</Tooltip> to optimize execution.
              Consecutive <Tooltip term="Monotone Operation">monotone</Tooltip> forward steps (those that can be
              reordered without affecting the outcome) execute concurrently
              without <Tooltip term="Coordination Barrier">coordination barriers</Tooltip>. <Tooltip term="Non-Monotone Operation">Non-monotone</Tooltip> steps
              trigger a barrier. This classification-driven optimization means the saga engine extracts maximum
              concurrency while maintaining correctness, without requiring the developer to annotate parallelism
              manually.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          20. Small-Step Semantics
          ================================================================ */}
      <SectionShell
        id="small-step-semantics"
        icon="braces"
        eyebrow="Formal Verification"
        title="Small-Step Semantics"
        kicker="Machine-checked execution rules in Lean 4 that mathematically prove the soundness of the runtime."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <SmallStepSemanticsViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Small-Step Semantics">Small-step semantics</Tooltip> define the runtime&apos;s
              behavior as a set of <Tooltip term="Transition Rule">transition rules</Tooltip>, each specifying
              how one computation step transforms the system state. The
              rule <code className="text-blue-400 font-mono">SPAWN</code>, for example, says: given an
              expression <code className="text-blue-400 font-mono">spawn(e)</code> and state &#963;, one step
              produces a <Tooltip term="Permit">permit</Tooltip> and registers the new task as Running in &#963;.
              By chaining rules, you can trace any execution from start to finish.
            </p>
            <p>
              The visualization lets you step through these transitions one at a time. Each step highlights the
              active <Tooltip term="Transition Rule">transition rule</Tooltip> and shows how the system state
              changes. Rules
              like <code className="text-blue-400 font-mono">CANCEL-PROPAGATE</code>, <code className="text-blue-400 font-mono">DRAIN-TICK</code>,
              and <code className="text-blue-400 font-mono">EFFECT-RESERVE</code> cover the cancel
              protocol, <Tooltip term="Cancel Fuel">fuel</Tooltip> consumption,
              and <Tooltip term="Two-Phase Effect">two-phase effects</Tooltip> respectively.
            </p>
            <p>
              These rules are not informal pseudocode. They are mechanically verified in Lean 4, meaning a
              theorem prover has checked that the rules are consistent, that safety invariants hold across all
              possible rule applications, and that the system cannot reach an undefined state. This level of
              rigor is what enables Asupersync&apos;s guarantee
              that <Tooltip term="Cancel-Correct">cancel-correctness</Tooltip> is a provable property, not a
              testing aspiration.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          21. Three-Lane Scheduler
          ================================================================ */}
      <SectionShell
        id="scheduler"
        icon="activity"
        eyebrow="Performance"
        title="Three-Lane Scheduler"
        kicker={<>See how cancel, timed, and ready lanes prioritize work in the <Tooltip term="Three-Lane Scheduler">three-lane scheduler</Tooltip>.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <SchedulerLanesViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The <Tooltip term="Three-Lane Scheduler">three-lane scheduler</Tooltip> partitions all runnable
              tasks into three priority lanes. The Cancel lane has the highest priority and processes tasks that
              are in the <Tooltip term="Drain Phase">drain phase</Tooltip> of
              the <Tooltip term="Three-Phase Cancel Protocol">cancel protocol</Tooltip>. The Timed lane handles
              tasks with pending timer expirations. The Ready lane processes all other runnable tasks at the
              lowest priority.
            </p>
            <p>
              The visualization shows tasks flowing through the three lanes. Notice that cancel-phase tasks
              always execute before ready tasks, ensuring that the runtime clears cancellation backlogs before
              taking on new work. This priority ordering is critical: without it, a burst of new task spawns
              could starve the cancel lane, causing drain <Tooltip term="Budget">budgets</Tooltip> to expire
              and forcing hard termination of tasks that could have shut down gracefully.
            </p>
            <p>
              The <Tooltip term="EXP3 Scheduler">EXP3 scheduler</Tooltip> sits on top of this three-lane
              structure, tuning parameters like the maximum cancel streak length (how many consecutive
              cancel-lane tasks to process before giving the ready lane a turn). This layered design separates
              the correctness concern (cancel lane always has priority) from the performance concern (how to
              balance throughput and cancel responsiveness).
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          22. Obligation Flow
          ================================================================ */}
      <SectionShell
        id="obligations"
        icon="lock"
        eyebrow="Linear Types"
        title="Obligation Flow"
        kicker={<>Follow a <Tooltip term="Permit">Permit</Tooltip> through its lifecycle: Reserve &#8594; Hold &#8594; Consume.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <ObligationFlowViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The <Tooltip term="Obligation System">obligation system</Tooltip>
              uses <Tooltip term="Linear Obligations">linear types</Tooltip> to enforce resource lifecycle
              invariants at compile time. When a task acquires a resource (opens a file, takes a lock, reserves
              a side-effect), it receives a <Tooltip term="Permit">permit</Tooltip>. That permit must be
              explicitly consumed (by closing the file, releasing the lock, or committing the effect) before
              the task can complete. Dropping a permit without consuming it is a compile-time error.
            </p>
            <p>
              The visualization traces a <Tooltip term="Permit">permit</Tooltip> through its three lifecycle
              stages. Reserve creates the permit. Hold represents the window during which the task is using
              the resource. Consume releases the permit, satisfying the linear obligation. If the task is
              cancelled during the Hold phase, the <Tooltip term="Drain Phase">drain phase</Tooltip> gives it
              time to consume outstanding permits.
            </p>
            <p>
              <Tooltip term="Lease">Leases</Tooltip> are a time-bounded variant: a lease-permit automatically
              expires after a deadline, releasing the resource without explicit consumption.
              The <Tooltip term="ObligationLeak Oracle">ObligationLeak oracle</Tooltip> in
              the <Tooltip term="Lab Runtime">Lab runtime</Tooltip> catches any permit that reaches task
              completion without being consumed, turning resource leaks from production incidents into test
              failures.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          23. Lab Runtime
          ================================================================ */}
      <SectionShell
        id="lab-runtime"
        icon="sparkles"
        eyebrow="Testing"
        title="Lab Runtime"
        kicker={<>Change the <Tooltip term="Seed">seed</Tooltip> to see different task execution orders. Same code, different interleavings.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <LabRuntimeViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The <Tooltip term="Lab Runtime">Lab runtime</Tooltip> is a deterministic, single-threaded scheduler
              that replaces the production runtime during testing. It accepts
              a <Tooltip term="Seed">seed</Tooltip> value and uses it to control every scheduling decision: task
              selection order, timer resolution, and tie-breaking. The same seed always produces the same
              execution, making concurrency bugs reproducible.
            </p>
            <p>
              The visualization shows a set of tasks executing under different seeds. Change the seed and watch
              the execution order change. Tasks that ran first under one seed may run last under another. Despite
              this reordering, the <Tooltip term="Test Oracle">test oracles</Tooltip> verify that all invariants
              hold across every interleaving.
            </p>
            <p>
              The Lab is not a mock or a simulator. It runs your actual application code, including I/O (via
              capability-controlled stubs), against the
              real <Tooltip term="Obligation System">obligation system</Tooltip>
              and <Tooltip term="Three-Phase Cancel Protocol">cancel protocol</Tooltip>. The only difference from
              production is that scheduling is deterministic rather than OS-driven. Combined with
              systematic <Tooltip term="DPOR">DPOR</Tooltip> exploration, the Lab can cover all distinct
              interleavings for small test scenarios, providing exhaustive verification rather than
              probabilistic confidence.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          24. DPOR Search Pruning
          ================================================================ */}
      <SectionShell
        id="dpor-pruning"
        icon="gitMerge"
        eyebrow="Verification"
        title="DPOR Search Pruning"
        kicker={<>Toggle <Tooltip term="DPOR">DPOR</Tooltip> to see how Asupersync prunes redundant commutations to make testing race conditions practical.</>}
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <DporPruningViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="DPOR">DPOR</Tooltip> (Dynamic Partial Order Reduction) is an algorithm that
              explores concurrent interleavings selectively, skipping orderings that are provably equivalent.
              Two interleavings are equivalent if they differ only in the ordering of independent
              (non-conflicting) operations. DPOR identifies conflict points at runtime, then backtracks only to
              explore orderings that produce genuinely different outcomes.
            </p>
            <p>
              The visualization shows an interleaving search tree. Without DPOR, every possible ordering is
              explored, leading to factorial blowup. Toggle DPOR on to see branches pruned. The remaining
              branches are precisely those that contain at least one conflict-dependent reordering, meaning
              they could exhibit different behavior from previously explored paths.
            </p>
            <p>
              <Tooltip term="Foata Fingerprint">Foata fingerprints</Tooltip> further accelerate this pruning.
              When two unexplored branches produce the same <Tooltip term="Foata Fingerprint">Foata
              fingerprint</Tooltip>, the <Tooltip term="Lab Runtime">Lab</Tooltip> skips the duplicate. The
              combined effect of DPOR and fingerprint deduplication typically reduces the search space from
              factorial to polynomial in the number of tasks, making exhaustive interleaving testing practical
              for real-world async applications.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          25. Tokio vs Asupersync
          ================================================================ */}
      <SectionShell
        id="comparison"
        icon="gitCompare"
        eyebrow="Comparison"
        title="Tokio vs Asupersync"
        kicker="Side-by-side comparison of cancel behavior. Press 'Cancel Now' to see the difference."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} className="p-4 md:p-8">
            <Suspense fallback={<VizLoader />}>
              <TokioComparisonViz />
            </Suspense>
          </SyncContainer>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              This visualization provides a direct comparison between Tokio&apos;s cancellation model and
              Asupersync&apos;s <Tooltip term="Three-Phase Cancel Protocol">three-phase cancel
              protocol</Tooltip>. On the Tokio side, dropping
              a <code className="text-blue-400 font-mono">JoinHandle</code> immediately destroys the future. Any
              in-flight work, open connections, and acquired locks are abandoned without cleanup. On the
              Asupersync side, cancellation initiates the structured
              Request &#8594; <Tooltip term="Drain Phase">Drain</Tooltip> &#8594; <Tooltip term="Finalize Phase">Finalize</Tooltip> sequence.
            </p>
            <p>
              Press the Cancel button and observe both sides simultaneously. Tokio&apos;s side completes
              instantly because the future is simply dropped. Asupersync&apos;s side takes slightly longer
              (bounded by the <Tooltip term="Budget">drain budget</Tooltip>) but produces a clean shutdown:
              buffers are flushed, connections are closed, <Tooltip term="Permit">permits</Tooltip> are consumed,
              and finalizers run in LIFO order.
            </p>
            <p>
              The tradeoff is explicit. Tokio&apos;s approach is faster in the cancellation path, but it
              makes <Tooltip term="Cancel-Correct">cancel-correctness</Tooltip> the developer&apos;s problem.
              Asupersync&apos;s approach adds bounded latency to cancellation, but it makes cleanup automatic
              and verifiable. The <Tooltip term="Lab Runtime">Lab runtime</Tooltip> can prove that your
              application handles cancellation correctly across all interleavings; in Tokio, you must rely on
              manual code review and hope that
              every <code className="text-blue-400 font-mono">.await</code> site handles its drop correctly.
            </p>
          </div>
        </div>
      </SectionShell>
      </div>
    </main>
  );
}
