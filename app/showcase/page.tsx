"use client";

import dynamic from "next/dynamic";
import SectionShell from "@/components/section-shell";
import GlitchText from "@/components/glitch-text";
import RobotMascot from "@/components/robot-mascot";
import { Tooltip } from "@/components/tooltip";
import { LazyViz } from "@/components/viz/viz-framework";

const MessageLifecycleViz = dynamic(() => import("@/components/viz/message-lifecycle-viz"), { ssr: false });
const SwarmSimulationViz = dynamic(() => import("@/components/viz/swarm-simulation-viz"), { ssr: false });
const ConflictCascadeViz = dynamic(() => import("@/components/viz/conflict-cascade-viz"), { ssr: false });
const CommitCoalescerViz = dynamic(() => import("@/components/viz/commit-coalescer-viz"), { ssr: false });
const TokenEconomyViz = dynamic(() => import("@/components/viz/token-economy-viz"), { ssr: false });
const TerritoryMapViz = dynamic(() => import("@/components/viz/territory-map-viz"), { ssr: false });
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
const CommitCoalescerRaceViz = dynamic(() => import("@/components/viz/commit-coalescer-race-viz"), { ssr: false });
const DualWritePipelineViz = dynamic(() => import("@/components/viz/dual-write-pipeline-viz"), { ssr: false });
const BackpressureHealthViz = dynamic(() => import("@/components/viz/backpressure-health-viz"), { ssr: false });
const StressGauntletViz = dynamic(() => import("@/components/viz/stress-gauntlet-viz"), { ssr: false });

export default function ShowcasePage() {
  return (
    <main id="main-content" tabIndex={-1}>
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
          SIGNATURE EXPERIENCES — The headline visualizations
          ================================================================ */}

      <SectionShell
        id="swarm-simulation"
        icon="network"
        eyebrow="The Big Picture"
        title="Live Agent Swarm"
        kicker="Watch five AI agents coordinate in real time. Messages flow as particles, files get reserved as colored territories, tasks complete and conflicts get caught, all without a human in the loop."
      >
        <div className="space-y-6">
          <LazyViz>
            <SwarmSimulationViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              This simulation models the steady-state of a real <Tooltip term="Agent Mail">Agent Mail</Tooltip> deployment.
              Five agents with persistent <Tooltip term="Agent Identity">identities</Tooltip> (GreenCastle, BlueLake,
              RedHarbor, GoldPeak, CoralBay) work on a shared codebase simultaneously. Each tick, agents send messages,
              claim <Tooltip term="File Reservation">file reservations</Tooltip>, complete tasks, and occasionally
              collide. Conflicts are caught instantly instead of discovered hours later in a merge.
            </p>
            <p>
              The constellation layout shows the social topology: agents are nodes, messages are particles traveling
              between them. The reservation bar below shows which agent holds
              which <Tooltip term="Glob Pattern">glob patterns</Tooltip>, with real-time ownership tracking. The event
              feed on the right captures every coordination action as it happens.
            </p>
            <p>
              Notice that no central coordinator directs the swarm. Each agent makes local decisions using the
              same <Tooltip term="MCP">MCP</Tooltip> tools, and shared coordination state
              in <Tooltip term="Agent Mail">Agent Mail</Tooltip> keeps them aligned. Scale this pattern from five agents
              to fifty and the same guarantees hold, because safety comes from the protocol, not from any single
              agent&apos;s <Tooltip term="Context Window">context window</Tooltip>.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="conflict-cascade"
        icon="bomb"
        eyebrow="The Problem Agent Mail Solves"
        title="The Conflict Problem"
        kicker="Without coordination, multiple agents silently overwrite each other&apos;s work. With Agent Mail, file reservations prevent conflicts before they happen."
      >
        <div className="space-y-6">
          <LazyViz>
            <ConflictCascadeViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The left panel shows what happens without coordination: agents blindly edit the same files, and later
              agents silently overwrite earlier work. The result is wasted compute, lost changes, and humans spending
              hours diagnosing merge conflicts that could have been prevented entirely.
            </p>
            <p>
              The right panel shows the same workload with <Tooltip term="Agent Mail">Agent Mail</Tooltip>. Before
              editing, each agent reserves its <Tooltip term="Glob Pattern">file patterns</Tooltip>. Overlapping claims
              are blocked immediately with a clear conflict message naming the holder. Agents self-organize into
              non-overlapping territories, and all six files get edited in parallel with zero wasted work.
            </p>
            <p>
              This difference compounds with scale. Two agents might survive without coordination through luck;
              ten will not. <Tooltip term="File Reservation">File reservations</Tooltip> make collision impossible
              rather than merely unlikely, and the <Tooltip term="Pre-Commit Guard">pre-commit guard</Tooltip> catches
              any accidental boundary violations at commit time as a second line of defense.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="token-economy"
        icon="calculator"
        eyebrow="Why External Storage Matters"
        title="Token Economy"
        kicker={<>Chat-based coordination burns <Tooltip term="Context Window">context window</Tooltip> tokens. Agent Mail keeps coordination off the token budget entirely.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <TokenEconomyViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Every token spent on coordination is a token not spent on actual coding. When agents coordinate
              through chat (pasting status updates, sharing traces, broadcasting to all),
              the <Tooltip term="Context Window">context window</Tooltip> fills fast. By step 10, the chat-based
              approach has burned over 60% of its budget on overhead alone.
            </p>
            <p>
              <Tooltip term="Agent Mail">Agent Mail</Tooltip> stores all messages, threads, and search indices
              externally in a Git-backed archive with <Tooltip term="FTS5">SQLite FTS5</Tooltip> indexing. Tool calls
              like <code className="text-blue-400 font-mono">send_message</code> and{" "}
              <code className="text-blue-400 font-mono">fetch_inbox</code> cost only a few hundred tokens each.
              The <Tooltip term="Context Window">context window</Tooltip> stays free for reasoning and code generation.
            </p>
            <p>
              Toggle between the two approaches in the visualization to see the divergence over time. The gap widens
              with each coordination step because chat-based overhead is cumulative: every past message stays in context,
              while <Tooltip term="MCP">MCP</Tooltip> tool calls are stateless requests against external storage.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="commit-coalescer"
        icon="gitCommit"
        eyebrow="Rust Engineering"
        title="Git Commit Coalescer"
        kicker="The Python version failed under load because of git lock contention. The Rust rewrite batches rapid-fire writes into far fewer commits, achieving a 9.1x compression ratio."
      >
        <div className="space-y-6">
          <LazyViz>
            <CommitCoalescerViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              When 30 agents send messages simultaneously, each message triggers a Git commit to the archive.
              Without batching, this creates massive lock contention on
              Git&apos;s <code className="text-blue-400 font-mono">index.lock</code> file. This was the exact failure
              mode that plagued the Python implementation under real-world load.
            </p>
            <p>
              The <Tooltip term="Commit Coalescer">commit coalescer</Tooltip> uses
              a <Tooltip term="Write-Behind Queue">write-behind queue</Tooltip> that accumulates rapid writes and
              flushes them as a single batch commit. In stress tests, 100 concurrent writes collapse into just 11
              commits: a 9.1x reduction with zero lock errors, zero timeouts, and zero data loss.
            </p>
            <p>
              The pipeline visualization shows writes entering the buffer, coalescing, and emerging as compact batch
              commits. Adjust the message rate to see how the coalescer adapts; higher throughput produces larger
              batches, and the compression ratio improves with load rather than degrading.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="territory-map"
        icon="layers"
        eyebrow="Spatial Awareness"
        title="Reservation Territory Map"
        kicker={<>See <Tooltip term="File Reservation">file ownership</Tooltip> as a spatial map. Agents claim <Tooltip term="Glob Pattern">glob patterns</Tooltip>, territories light up, conflicts flash red, and <Tooltip term="TTL">TTL</Tooltip>-based expiry prevents deadlocks from crashed agents.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <TerritoryMapViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="File Reservation">File reservations</Tooltip> are <Tooltip term="Advisory Lock">advisory,
              TTL-based leases</Tooltip>, not hard locks. This treemap renders a project&apos;s file structure as a
              spatial layout. When an agent reserves a <Tooltip term="Glob Pattern">glob pattern</Tooltip> like{" "}
              <code className="text-blue-400 font-mono">src/auth/**</code>, matching files light up in that
              agent&apos;s color.
            </p>
            <p>
              Watch the scenario unfold: four agents claim non-overlapping territories, a fifth agent tries to
              claim an occupied zone and gets blocked, then the original holder releases. Reservations expire
              on <Tooltip term="TTL">TTL</Tooltip>, so a crashed agent never holds files hostage indefinitely.
            </p>
            <p>
              The <Tooltip term="Pre-Commit Guard">pre-commit guard</Tooltip> enforces these boundaries at commit
              time, catching accidental edits to reserved files before they reach the repository. This two-layer
              approach (advisory visibility first, enforcement second) gives agents maximum flexibility while
              preventing the conflict scenarios that make multi-agent coding fragile.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="commit-coalescer-race"
        icon="zap"
        eyebrow="Python vs Rust"
        title="Commit Coalescer Race"
        kicker={<>A live split-screen race showing how the Rust <Tooltip term="Write-Behind Queue">write-behind queue</Tooltip> eliminates Git lock contention that plagued the Python implementation.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <CommitCoalescerRaceViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The Python implementation committed every message individually to the Git archive. Under 30-agent load,
              this created massive <code className="text-blue-400 font-mono">index.lock</code> contention, the failure
              mode that prompted the Rust rewrite.
            </p>
            <p>
              The Rust side uses a <Tooltip term="Write-Behind Queue">write-behind queue</Tooltip> that accumulates
              rapid-fire messages and flushes them as batch commits. In the
              10-test <Tooltip term="Stress Gauntlet">stress gauntlet</Tooltip>, 100 concurrent writes collapsed into
              just 11 commits: a 9.1x reduction. Lock-free Git plumbing commits
              avoid <code className="text-blue-400 font-mono">index.lock</code> entirely.
            </p>
            <p>
              Adjust the message rate and batch window to see how throughput changes. The split-screen layout makes the
              performance difference visceral: the Python side accumulates errors while the Rust side processes the
              same workload cleanly. This is the kind of regression that only surfaces under real multi-agent load,
              which is exactly what the <Tooltip term="Stress Gauntlet">stress gauntlet</Tooltip> is designed to catch.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="dual-write-pipeline"
        icon="gitMerge"
        eyebrow="Architecture Deep Dive"
        title="Dual Persistence Pipeline"
        kicker="Every message flows through two parallel paths simultaneously: SQLite for sub-millisecond queries, and Git for a human-auditable, diffable archive."
      >
        <div className="space-y-6">
          <LazyViz>
            <DualWritePipelineViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Neither SQLite nor Git is sufficient alone. SQLite gives
              sub-millisecond <Tooltip term="FTS5">FTS5</Tooltip> full-text search and structured queries, but
              it is opaque to humans and hard to diff. Git gives a human-readable, diffable audit trail, but it is
              too slow for real-time agent queries.
            </p>
            <p>
              Watch the split point: each <code className="text-blue-400 font-mono">send_message</code> call
              spawns two parallel data flows. The SQLite path completes in microseconds. The Git path accumulates
              in the <Tooltip term="Write-Behind Queue">write-behind queue</Tooltip> and flushes as batch commits
              via the <Tooltip term="Commit Coalescer">commit coalescer</Tooltip>, decoupling write latency from
              archive durability.
            </p>
            <p>
              Toggle &quot;Show Read Paths&quot; to see how each store serves different consumers. Agents
              query SQLite for speed; operators browse the Git archive for auditing. Both stores contain the same
              data, but optimized for their respective access patterns. The dual-write design means neither store
              is a single point of failure: if SQLite is corrupted, the Git archive can reconstruct it.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="backpressure-health"
        icon="activity"
        eyebrow="Reliability Engineering"
        title="Three-Level Health & Backpressure"
        kicker={<>The system continuously monitors pool utilization, <Tooltip term="Write-Behind Queue">WBQ</Tooltip> depth, and commit queue pressure. Under overload, <Tooltip term="Backpressure">backpressure</Tooltip> sheds low-priority maintenance while high-priority messaging always flows.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <BackpressureHealthViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Agent Mail">Agent Mail</Tooltip> tracks four health signals in real time: connection pool
              utilization, pool acquire P95 latency, <Tooltip term="Write-Behind Queue">write-behind queue</Tooltip> depth,
              and commit queue pending count. When any signal crosses a threshold, the system transitions from Green
              to Yellow to Red.
            </p>
            <p>
              Under Red, <Tooltip term="Backpressure">backpressure</Tooltip> kicks in: low-priority tools
              like <code className="text-blue-400 font-mono">archive_repair</code> and{" "}
              <code className="text-blue-400 font-mono">compact_index</code> are rejected immediately. High-priority
              tools like <code className="text-blue-400 font-mono">fetch_inbox</code> and{" "}
              <code className="text-blue-400 font-mono">send_message</code> are never shed. Agent communication
              always flows, even under extreme load.
            </p>
            <p>
              Drag the load slider to see <Tooltip term="Backpressure">backpressure</Tooltip> in action. The priority
              distinction matters because maintenance can always be retried later, but an agent blocked on its inbox
              is an agent burning tokens while waiting. Shedding the right work under pressure keeps the system
              responsive where it counts.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="stress-gauntlet"
        icon="flame"
        eyebrow="Battle Tested"
        title="10-Test Stress Gauntlet"
        kicker="Every commit runs a battery of 10 concurrent stress tests that validate the system under extreme multi-agent conditions, from 50-thread thundering herds to 30-second sustained loads."
      >
        <div className="space-y-6">
          <LazyViz>
            <StressGauntletViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The Python implementation failed under real-world multi-agent load due to three root causes: Git lock
              contention, SQLite pool exhaustion, and cascading failures when agents stormed the system simultaneously.
              The Rust rewrite eliminates all three and proves it with a
              10-test <Tooltip term="Stress Gauntlet">gauntlet</Tooltip>.
            </p>
            <p>
              Click &quot;Run Gauntlet&quot; to watch all 10 tests execute sequentially. Each test targets a specific
              failure mode: pool warmup validates zero SQLITE_BUSY errors, thundering herd proves idempotent agent
              registration, <Tooltip term="Write-Behind Queue">WBQ</Tooltip> saturation confirms zero fallbacks at 2000
              writes, and sustained load maintains ~50 RPS for 30 seconds with sub-3-second P99 latency.
            </p>
            <p>
              These are not synthetic benchmarks. Every scenario models a real failure that occurred in production
              with the Python implementation. The gauntlet runs on every commit, so regressions in concurrency
              handling are caught before they ship.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          EXISTING SECTIONS — Detailed concept explorations
          ================================================================ */}

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
          <LazyViz>
            <MessageLifecycleViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              This flow models <Tooltip term="Agent Mail">Agent Mail</Tooltip>&apos;s operational core. Message
              tool calls persist canonical rows in SQLite, fan out <Tooltip term="Inbox">inbox</Tooltip>/outbox
              artifacts to the Git archive, and keep <Tooltip term="Thread">thread</Tooltip> continuity queryable
              across sessions. Every state transition (sent, delivered, read, acknowledged) is an explicit, logged
              event.
            </p>
            <p>
              Toggle <code className="text-blue-400 font-mono">ack_required</code> to compare
              explicit <Tooltip term="Acknowledgment">acknowledgement</Tooltip> workflows against standard read-only
              delivery. With acknowledgements enabled, the sender knows exactly when the recipient processed
              the message. Without them, delivery is fire-and-forget, suitable for informational broadcasts.
            </p>
            <p>
              Both paths remain searchable and replayable through <Tooltip term="Thread">thread</Tooltip> and search
              surfaces. This matters when a new agent joins mid-conversation:
              the <Tooltip term="Macro">macro_prepare_thread</Tooltip> call lets it catch up on the full conversation
              history without any participant needing to repeat context.
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
          <LazyViz>
            <AgentHandshakeViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              To prevent an uncoordinated swarm from spamming each
              other, <Tooltip term="Agent Mail">Agent Mail</Tooltip> enforces a
              strict <Tooltip term="Contact Handshake">contact handshake</Tooltip>. Before two agents can exchange
              messages, one must
              send <code className="text-blue-400 font-mono">request_contact</code> and the other must explicitly
              approve with <code className="text-blue-400 font-mono">respond_contact</code>. Until approval, all
              messages between them are blocked.
            </p>
            <p>
              The visualization includes both approval and rejection branches so you can compare downstream behavior.
              Watch for the state boundary where permission flips from blocked to trusted. That transition is
              explicit, logged, and queryable.
            </p>
            <p>
              This consent model is critical for post-incident reasoning: if an agent sent a bad instruction to
              another, the contact graph shows exactly who approved that communication channel and when. For
              cross-project coordination via the <Tooltip term="Product Bus">product bus</Tooltip>, the handshake
              also establishes trust across repository boundaries.
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
        kicker={<>Agents use <Tooltip term="TTL">TTL</Tooltip>-based <Tooltip term="Advisory Lock">advisory locks</Tooltip> to signal intent and avoid stepping on each other&apos;s edits.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <FileReservationViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Before editing a file, an agent requests
              an <Tooltip term="Advisory Lock">advisory lock</Tooltip> via <Tooltip term="MCP">MCP</Tooltip>. If
              another agent already holds a reservation on overlapping paths, the requester receives a conflict warning
              naming the holder, the held <Tooltip term="Glob Pattern">glob patterns</Tooltip>, and the remaining
              <Tooltip term="TTL">TTL</Tooltip>.
            </p>
            <p>
              Step through the three <Tooltip term="Pre-Commit Guard">guard</Tooltip> modes (enforce, warn, bypass) to
              see how policy changes commit/push outcomes. In enforce mode, commits touching reserved files are blocked.
              In warn mode, they proceed with a logged warning. In bypass mode, reservations are purely informational.
            </p>
            <p>
              The advisory design is deliberate: hard locks cause deadlocks when agents crash. With <Tooltip term="TTL">TTL</Tooltip>-based
              expiration, a crashed agent&apos;s reservations clear automatically. The guard adds enforcement for
              teams that want it, without making it mandatory for those who prefer lighter coordination.
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
          <LazyViz>
            <McpBeadsIntegrationViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              A single bead ID (like <code className="text-blue-400 font-mono">br-123</code>) threads through
              every coordination primitive: it becomes
              the <Tooltip term="Thread">thread_id</Tooltip> for messages,
              the <code className="text-blue-400 font-mono">reason</code> field
              on <Tooltip term="File Reservation">file reservations</Tooltip>, and the subject prefix on commit
              messages. The entire swarm knows exactly why a file is locked and which conversation to follow for
              context.
            </p>
            <p>
              Switch to &quot;Discovered Work&quot; mode to see what happens when an agent finds an out-of-scope bug
              while working on its assigned bead. Instead of silently fixing it (creating untraceable changes) or
              ignoring it (leaving technical debt), the agent creates a new bead linked
              with <code className="text-blue-400 font-mono">discovered-from:br-123</code>, preserving the causal
              chain.
            </p>
            <p>
              This linkage pattern prevents the orphan-task problem common in multi-agent workflows: tasks spawned
              without clear provenance that no one remembers creating. Every piece of discovered work traces back to
              the context that surfaced it.
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
        kicker={<>The <Tooltip term="MCP">Model Context Protocol</Tooltip> connects LLM clients directly to the Rust-backed mail server.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <McpArchitectureViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Agent Mail">Agent Mail</Tooltip> runs as
              an <Tooltip term="MCP">MCP</Tooltip> server, accepting JSON-RPC requests over stdio (for Claude Code)
              or HTTP/SSE (for Cursor, Windsurf, and similar clients). A single Rust binary handles both transports,
              persisting everything locally to SQLite with a Git archive for durability.
            </p>
            <p>
              Use the mode toggles to compare how messaging, reservation, and search requests traverse the same
              architecture. All three flows pass through the same coordination core, but they diverge at the
              persistence layer: messaging produces both SQLite rows and Git artifacts, reservations update SQLite
              state with TTL tracking, and search is a read-heavy path that mostly queries
              the <Tooltip term="FTS5">FTS5</Tooltip> index.
            </p>
            <p>
              The single-binary design means there is no deployment complexity, no message broker, and no cloud
              dependency. The same <code className="text-blue-400 font-mono">mcp-agent-mail</code> binary that agents
              connect to also serves the <Tooltip term="Web UI">Web UI</Tooltip> and
              the <Tooltip term="TUI">operator TUI</Tooltip>.
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
        kicker={<>Two-tier fusion combining lexical <Tooltip term="FTS5">FTS5</Tooltip> and semantic embedding retrieval with reciprocal rank fusion.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <SearchV3PipelineViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Search V3 parses each query into structured tokens, then routes them through two parallel
              tiers: <Tooltip term="FTS5">FTS5</Tooltip> lexical search for exact keyword matches and semantic
              embedding retrieval for conceptual similarity. Results from both tiers are fused via reciprocal rank
              fusion (RRF), then reranked by field-match strength and recency.
            </p>
            <p>
              When a tier fails or returns no results, the pipeline gracefully degrades: semantic-only when FTS5
              misses, lexical-only when embeddings are unavailable, and a chronological fallback scan as the last
              resort. This layered degradation ensures agents always get results, even under partial system failure.
            </p>
            <p>
              Keep the same query preset while switching modes to see exactly how recall, relevance, and latency
              shift. The hybrid mode consistently outperforms either tier alone because keyword and semantic signals
              are complementary: keywords catch exact identifiers, while embeddings catch conceptually related
              messages that use different terminology.
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
          <LazyViz>
            <TuiScreensViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The <Tooltip term="TUI">TUI</Tooltip> organizes 15 screens into four categories: operations (dashboard,
              inbox, threads), coordination (agents, reservations, contacts), observability (metrics, health, timeline),
              and system (search, projects, settings). Each screen answers a single core question and surfaces the
              primary signals an operator needs for fast decisions.
            </p>
            <p>
              Jump keys provide O(1) navigation to any screen. Press <code className="text-blue-400 font-mono">d</code> for
              dashboard, <code className="text-blue-400 font-mono">i</code> for inbox, <code className="text-blue-400 font-mono">r</code> for
              reservations. Filter by category in the visualization, then inspect the selected screen&apos;s core
              question to understand the information architecture behind each key.
            </p>
            <p>
              The design principle: an operator should be able to assess swarm health, identify blocked agents, and
              intervene, all without leaving the terminal. The <Tooltip term="Web UI">Web UI</Tooltip> provides
              the same data for browser-based workflows, but the TUI is optimized for the keyboard-driven speed
              that incident response demands.
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
        kicker={<>16 non-interactive commands across 5 tracks with <Tooltip term="Toon Format">toon</Tooltip>, JSON, and Markdown output formats.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <RobotModeViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Robot Mode">Robot mode</Tooltip> provides agents with 16 non-interactive commands designed
              for machine consumption. The <Tooltip term="Toon Format">toon format</Tooltip> minimizes token usage with
              a compact, human-scannable layout. JSON provides full data fidelity for programmatic use. Markdown
              renders threads and messages for contexts where readability matters more than token efficiency.
            </p>
            <p>
              Commands are organized into five tracks: status/health, inbox/messaging, search/discovery,
              reservations/coordination, and metrics/diagnostics. The command recipe panel demonstrates a practical
              sequence an agent can run to triage its workload, make a decision, and report back.
            </p>
            <p>
              The distinction from the <Tooltip term="TUI">TUI</Tooltip> is critical. The TUI is an interactive
              terminal application for human operators. If an AI agent accidentally launches it, the system immediately
              exits to prevent the agent from burning tokens parsing ANSI escape sequences. Robot mode is the
              agent-safe counterpart: every command produces structured output and exits cleanly.
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
          <LazyViz>
            <ProductBusViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              The <Tooltip term="Product Bus">product bus</Tooltip> groups multiple repositories under a shared product
              umbrella. Once linked, agents can search across all repos, send messages to agents in other projects
              using <code className="text-blue-400 font-mono">name@project</code> addressing, and coordinate
              via <Tooltip term="Contact Handshake">contact governance</Tooltip> policies.
            </p>
            <p>
              The stepper makes the governance order explicit:
              a <Tooltip term="Contact Handshake">contact handshake</Tooltip> must succeed before cross-project
              messaging is permitted. This prevents a rogue agent in one repository from spamming agents in another.
              Once contacts are established, cross-project search lets an agent query the full message history across
              all linked repositories.
            </p>
            <p>
              This architecture models how real codebases work: a frontend and backend repo need coordinated API
              changes, a shared library update affects all downstream consumers, or a migration spans multiple
              services. The product bus provides the coordination layer that repository boundaries would otherwise
              prevent.
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
        kicker={<>Write batching, <Tooltip term="Backpressure">backpressure</Tooltip> management, lock recovery, and worker loop health monitoring.</>}
      >
        <div className="space-y-6">
          <LazyViz>
            <ReliabilityInternalsViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Agent Mail">Agent Mail</Tooltip>&apos;s SQLite storage layer coalesces individual writes
              into batched <Tooltip term="WAL">WAL</Tooltip> transactions. When 17 operations arrive in a 50ms burst,
              the <Tooltip term="Commit Coalescer">commit coalescer</Tooltip> groups them into a single atomic fsync,
              reducing I/O overhead by an order of magnitude while maintaining strict durability guarantees.
            </p>
            <p>
              The <Tooltip term="Backpressure">backpressure</Tooltip> system monitors write queue depth against a
              configurable threshold (default: 128). When the queue exceeds this limit, callers receive advisory
              backpressure signals to throttle submissions. Four independent worker loops (ACK processing, retention
              enforcement, metrics collection, and integrity checking) each recover gracefully from stalls without
              blocking the others.
            </p>
            <p>
              Toggle between normal and stress profiles to see how queue pressure and commit latency shift under load.
              The key insight: these internals are invisible during normal operation, but they determine whether the
              system degrades gracefully or cascades into failure when 30 agents hit it simultaneously.
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
          <LazyViz>
            <DualModeInterfaceViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Agent Mail">Agent Mail</Tooltip> ships as a single binary with two entrypoints.
              The <code className="text-blue-400 font-mono">mcp-agent-mail</code> entrypoint starts the
              JSON-RPC <Tooltip term="MCP">MCP</Tooltip> server for agent consumption.
              The <code className="text-blue-400 font-mono">am</code> entrypoint launches the
              interactive <Tooltip term="TUI">TUI</Tooltip> for human operators. These two surfaces share the same
              core logic and database, but their runtime contexts are incompatible.
            </p>
            <p>
              Select different context/command combinations in the visualization to see the guardrails in action.
              If a coding agent accidentally executes <code className="text-blue-400 font-mono">am</code>, the system
              immediately exits with code 2. If a human runs the raw MCP server in a terminal, it gracefully aborts
              with guidance to use <code className="text-blue-400 font-mono">am</code> instead.
            </p>
            <p>
              The agent-side guardrail prevents a costly failure mode: an LLM interpreting ANSI escape sequences
              as text, then generating responses to phantom UI elements, burning thousands of tokens on
              hallucinated interactions. The human-side guardrail prevents a confusing failure mode: a blank terminal
              waiting for JSON-RPC input that a human would never type.
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
          <LazyViz>
            <BuildSlotCoordinatorViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              When multiple agents attempt to compile the same codebase concurrently, the results range from slow
              builds to corrupted artifacts to <code className="text-blue-400 font-mono">Cargo.lock</code> conflicts.
              <Tooltip term="Build Slot">Build slots</Tooltip> solve this
              with <code className="text-blue-400 font-mono">acquire_build_slot</code>, which lets agents request
              mutually exclusive runtime leases on critical computational resources.
            </p>
            <p>
              The visualization shows agents queuing for build slots. When the pool is full, new requests wait rather
              than competing. Each slot has a <Tooltip term="TTL">TTL</Tooltip>, so a crashed agent&apos;s slot is
              reclaimed automatically. Agents can renew active slots if their build takes longer than expected.
            </p>
            <p>
              Like <Tooltip term="File Reservation">file reservations</Tooltip>, build slots are advisory and
              TTL-governed. The pattern is the same: signal intent, get confirmation, do the work, release. This
              consistency across Agent Mail&apos;s coordination primitives means agents learn one pattern and apply
              it to both file ownership and build concurrency.
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
          <LazyViz>
            <HumanOverseerViz />
          </LazyViz>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Traditional approaches to redirecting an AI agent require killing the session and restarting with
              new instructions, losing all accumulated context.
              The <Tooltip term="Human Overseer">Human Overseer</Tooltip> mechanism injects messages
              with <code className="text-blue-400 font-mono">importance: urgent</code> directly into any
              agent&apos;s <Tooltip term="Inbox">inbox</Tooltip>, bypassing all
              standard <Tooltip term="Contact Handshake">contact policies</Tooltip>.
            </p>
            <p>
              The visualization shows the message path from the <Tooltip term="Web UI">Web UI</Tooltip> compose form
              into a running agent&apos;s inbox. Urgent messages surface at the top of
              the <code className="text-blue-400 font-mono">fetch_inbox</code> response, so agents process them before
              any queued normal-priority work.
            </p>
            <p>
              This gives operators a live steering wheel for autonomous swarms. An agent heading down the wrong path
              can be redirected mid-task. A blocked agent can be unblocked with a priority override. A runaway swarm
              can be paused with a broadcast to all agents. The operator never needs to touch the agent&apos;s terminal
              session.
            </p>
          </div>
        </div>
      </SectionShell>

      </div>
    </main>
  );
}
