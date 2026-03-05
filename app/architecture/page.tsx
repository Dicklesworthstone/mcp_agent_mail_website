"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import SectionShell from "@/components/section-shell";
import GlitchText from "@/components/glitch-text";
import { SyncContainer } from "@/components/sync-elements";
import RustCodeBlock from "@/components/rust-code-block";
import Timeline from "@/components/timeline";
import { Tooltip } from "@/components/tooltip";
import { changelog } from "@/lib/content";

const OracleDashboardViz = dynamic(() => import("@/components/viz/oracle-dashboard-viz"), { ssr: false });
const CancelStateMachineViz = dynamic(() => import("@/components/viz/cancel-state-machine-viz"), { ssr: false });
const EProcessMonitorViz = dynamic(() => import("@/components/viz/eprocess-monitor-viz"), { ssr: false });
const MacaroonCapabilityViz = dynamic(() => import("@/components/viz/macaroon-capability-viz"), { ssr: false });
const SagaCompensationViz = dynamic(() => import("@/components/viz/saga-compensation-viz"), { ssr: false });
const SystemTopologyViz = dynamic(() => import("@/components/viz/system-topology-viz"), { ssr: false });
const SearchV3PipelineViz = dynamic(() => import("@/components/viz/search-v3-pipeline-viz"), { ssr: false });

const CAPABILITY_TIERS = [
  { tier: "FiberCap", color: "#64748B", desc: "Compute-only. No spawning, no I/O, no timers.", width: 100 },
  { tier: "TaskCap", color: "#22C55E", desc: "Can spawn child tasks within its Region.", width: 200 },
  { tier: "IoCap", color: "#3B82F6", desc: "Network, filesystem, and timer access.", width: 300 },
  { tier: "RemoteCap", color: "#8B5CF6", desc: "Cross-machine communication and data transfer.", width: 400 },
  { tier: "SupervisorCap", color: "#F97316", desc: "Can manage, restart, and cancel other tasks.", width: 500 },
];

const TRANSITION_RULES = [
  {
    name: "SPAWN",
    rule: "\u27E8spawn(e), \u03C3\u27E9 \u2192 \u27E8permit(id), \u03C3[id \u21A6 Running(e)]\u27E9",
    explanation: "Spawning a task produces a Permit and registers the new task as Running in the state.",
  },
  {
    name: "CANCEL-PROPAGATE",
    rule: "\u27E8cancel(r), \u03C3\u27E9 \u2192 \u27E8(), \u03C3[t.state \u21A6 CancelRequested | t \u2208 r]\u27E9",
    explanation: "Cancelling a Region marks every task in it as CancelRequested.",
  },
  {
    name: "DRAIN-TICK",
    rule: "\u27E8tick, \u03C3[t: Draining(fuel)]\u27E9 \u2192 \u27E8tick, \u03C3[t: Draining(fuel-1)]\u27E9",
    explanation: "Each scheduler tick decrements Cancel Fuel, guaranteeing termination.",
  },
  {
    name: "EFFECT-RESERVE",
    rule: "\u27E8reserve(eff), \u03C3\u27E9 \u2192 \u27E8handle(id), \u03C3[id \u21A6 Reserved(eff)]\u27E9",
    explanation: "Staging an effect creates a reversible reservation — not yet committed.",
  },
  {
    name: "CHECKPOINT-MASKED",
    rule: "\u27E8checkpoint, \u03C3[t: CancelRequested]\u27E9 \u2192 \u27E8Cancelled, \u03C3[t: Draining]\u27E9",
    explanation: "If a cancel is pending at a checkpoint, the task transitions to Draining and returns Cancelled.",
  },
  {
    name: "CLOSE-CANCEL-CHILDREN",
    rule: "\u27E8close(r), \u03C3\u27E9 \u2192 \u27E8(), \u03C3[t.state \u21A6 CancelRequested | t \u2208 children(r)]\u27E9",
    explanation: "Closing a Region first cancels all children, cascading down the Region tree.",
  },
];

const ORACLE_LIST = [
  { name: "TaskLeak", desc: "Detects tasks that escape their Region scope" },
  { name: "ObligationLeak", desc: "Catches Permits/Leases dropped without consumption" },
  { name: "CancelProtocol", desc: "Verifies 3-phase cancel contract compliance" },
  { name: "BudgetOverrun", desc: "Flags tasks exceeding their drain budget" },
  { name: "RegionNesting", desc: "Validates parent-child Region tree invariants" },
  { name: "SchedulerFairness", desc: "Ensures Cancel Lane gets proper priority" },
  { name: "QuiescenceCheck", desc: "Confirms all tasks finished before Region close" },
  { name: "FinalizerOrder", desc: "Verifies LIFO execution order of finalizers" },
  { name: "CapabilityEscalation", desc: "Blocks unauthorized capability upgrades" },
  { name: "SporkInvariant", desc: "Checks fork-spawned Region consistency" },
  { name: "DeadlockFreedom", desc: "Detects cycles in the wait-graph" },
  { name: "ProgressGuarantee", desc: "Validates martingale progress certificates" },
  { name: "SeedDeterminism", desc: "Ensures identical seeds reproduce identical schedules" },
  { name: "MemoryOrdering", desc: "Checks acquire/release memory consistency" },
  { name: "FuelExhaustion", desc: "Prevents cancel propagation past fuel=0" },
  { name: "SupervisorPolicy", desc: "Enforces restart limits and backoff policies" },
  { name: "EffectAtomicity", desc: "Ensures two-phase effects commit atomically" },
];

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
            How Asupersync enforces cancel-correctness, structured concurrency, and deterministic testing.
          </p>
        </div>
      </section>

      {/* Runtime Overview */}
      <SectionShell
        id="overview"
        icon="cpu"
        eyebrow="Overview"
        title="Runtime Architecture"
        kicker="Asupersync&apos;s runtime is built on three pillars: Regions for structure, the Cancel Protocol for cleanup, and the Lab for testing."
      >
        <SyncContainer withPulse={true} className="p-8 md:p-12">
          <svg viewBox="0 0 700 300" className="w-full h-auto" aria-label="Runtime architecture diagram">
            <text x="350" y="25" textAnchor="middle" fill="#60A5FA" fontSize="13" fontWeight="bold" fontFamily="monospace">APPLICATION LAYER</text>
            <rect x="50" y="40" width="600" height="50" rx="8" fill="#0A1628" stroke="#3B82F6" strokeWidth="1" />
            <text x="350" y="70" textAnchor="middle" fill="#93C5FD" fontSize="11" fontFamily="monospace">Region Tree (structured concurrency scopes)</text>

            <line x1="350" y1="90" x2="350" y2="110" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />

            <text x="350" y="125" textAnchor="middle" fill="#F97316" fontSize="13" fontWeight="bold" fontFamily="monospace">CANCEL PROTOCOL</text>
            <rect x="100" y="135" width="150" height="35" rx="6" fill="#ef4444" fillOpacity="0.1" stroke="#ef4444" strokeWidth="0.5" />
            <text x="175" y="157" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">1. Request</text>
            <rect x="275" y="135" width="150" height="35" rx="6" fill="#fbbf24" fillOpacity="0.1" stroke="#fbbf24" strokeWidth="0.5" />
            <text x="350" y="157" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="monospace">2. Drain</text>
            <rect x="450" y="135" width="150" height="35" rx="6" fill="#22c55e" fillOpacity="0.1" stroke="#22c55e" strokeWidth="0.5" />
            <text x="525" y="157" textAnchor="middle" fill="#4ade80" fontSize="10" fontFamily="monospace">3. Finalize</text>

            <line x1="350" y1="170" x2="350" y2="195" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />

            <text x="350" y="210" textAnchor="middle" fill="#60A5FA" fontSize="13" fontWeight="bold" fontFamily="monospace">SCHEDULER</text>
            <rect x="50" y="220" width="600" height="50" rx="8" fill="#0A1628" stroke="#3B82F6" strokeWidth="1" />
            <text x="175" y="250" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">Cancel Lane (hi)</text>
            <text x="350" y="250" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="monospace">Timed Lane (mid)</text>
            <text x="525" y="250" textAnchor="middle" fill="#4ade80" fontSize="10" fontFamily="monospace">Ready Lane (lo)</text>
          </svg>
        </SyncContainer>
      </SectionShell>

      <SectionShell
        id="agent-mail-topology"
        icon="network"
        eyebrow="Agent Mail Topology"
        title="CLI to Archive Dataflow"
        kicker="A practical flow map for how MCP requests move through server handlers into SQLite and git-auditable storage."
      >
        <div className="space-y-5">
          <SyncContainer withPulse={true} className="p-4 md:p-6">
            <SystemTopologyViz />
          </SyncContainer>
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

      {/* Structured Concurrency */}
      <SectionShell
        id="regions"
        icon="blocks"
        eyebrow="Core Model"
        title="Structured Concurrency"
        kicker="Every task lives inside a Region. Regions form a tree. When a parent Region closes, all children are cancelled — automatically."
      >
        <div className="space-y-6">
          <SyncContainer className="p-6 md:p-8">
            <RustCodeBlock
              code={`// Regions scope task lifetimes
Region::open(cx, "server", async |cx| {
    // Child tasks are bound to this Region
    cx.spawn("worker-1", handle_requests());
    cx.spawn("worker-2", process_queue());

    // When this Region closes, workers are cancelled
    // via the cancel protocol (not silently dropped)
    cx.shutdown_signal().await;
}).await`}
              title="regions.rs"
            />
          </SyncContainer>
          <p className="text-slate-400 leading-relaxed">
            Unlike Tokio&apos;s <code className="text-blue-400 font-mono">tokio::spawn</code> which creates globally-scoped tasks,
            Asupersync tasks are always scoped to a Region. This eliminates orphaned futures — if you can&apos;t see
            the task, it can&apos;t outlive you.
          </p>
        </div>
      </SectionShell>

      {/* Cancel Protocol */}
      <SectionShell
        id="cancel"
        icon="shield"
        eyebrow="Safety"
        title="Cancel Protocol"
        kicker="Three phases ensure resources are always cleaned up, even during cancellation."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { phase: "1. Request", color: "#ef4444", desc: "Cancel signal sent. Task sees CancelRequested on its Cx. Can begin graceful shutdown." },
            { phase: "2. Drain", color: "#fbbf24", desc: "Task gets budgeted time to finish in-flight work. Flush buffers, close connections, release locks." },
            { phase: "3. Finalize", color: "#22c55e", desc: "Registered finalizers run in LIFO order. Like defer in Go, but integrated with the cancel protocol." },
          ].map((p) => (
            <div key={p.phase} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="text-sm font-black mb-3" style={{ color: p.color }}>{p.phase}</div>
              <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* ================================================================
          CAPABILITY TIERS
          ================================================================ */}
      <SectionShell
        id="capability-tiers"
        icon="lock"
        eyebrow="Security"
        title="Capability Tiers"
        kicker="Five hierarchical permission levels enforce the principle of least authority. Every task gets exactly the permissions it needs — nothing more."
      >
        <div className="space-y-6">
          {/* SVG Tier Diagram */}
          <SyncContainer withPulse={true} accentColor="#8B5CF6" className="p-6 md:p-10 bg-black/40">
            <svg viewBox="0 0 600 280" className="w-full h-auto" aria-label="Capability tier hierarchy diagram">
              {CAPABILITY_TIERS.map((tier, i) => {
                const y = 20 + i * 52;
                const x = (600 - tier.width) / 2;
                return (
                  <g key={tier.tier}>
                    <rect
                      x={x}
                      y={y}
                      width={tier.width}
                      height={38}
                      rx={8}
                      fill={`${tier.color}15`}
                      stroke={tier.color}
                      strokeWidth={1.5}
                    />
                    <text
                      x={300}
                      y={y + 16}
                      textAnchor="middle"
                      fill={tier.color}
                      fontSize={12}
                      fontWeight={700}
                      fontFamily="monospace"
                    >
                      {tier.tier}
                    </text>
                    <text
                      x={300}
                      y={y + 30}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize={8}
                      fontFamily="inherit"
                    >
                      {tier.desc}
                    </text>
                    {i < CAPABILITY_TIERS.length - 1 && (
                      <line
                        x1={300}
                        y1={y + 38}
                        x2={300}
                        y2={y + 52}
                        stroke="#334155"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </SyncContainer>

          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Each <Tooltip term="Capability Tier">capability tier</Tooltip> extends the one below it.
              A task with <Tooltip term="FiberCap">FiberCap</Tooltip> can only compute — it cannot spawn,
              perform I/O, or set timers. <Tooltip term="IoCap">IoCap</Tooltip> adds network and filesystem
              access. At the top, SupervisorCap can manage and restart other tasks.
            </p>
            <p>
              This hierarchy ensures that if a task is compromised or buggy, its blast radius is limited to
              its granted capabilities. A compute-only fiber cannot exfiltrate data over the network.
              An I/O task cannot restart other tasks.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          FORMAL VERIFICATION
          ================================================================ */}
      <SectionShell
        id="formal-semantics"
        icon="fileText"
        eyebrow="Formal Foundations"
        title="Small-Step Semantics"
        kicker="35 transition rules define every possible async state change. Each rule is mechanized in Lean 4 for machine-checked correctness."
      >
        <div className="space-y-6">
          <p className="text-slate-400 leading-relaxed">
            Think of <Tooltip term="Small-Step Semantics">small-step semantics</Tooltip> like a recipe card
            for the runtime. Each <Tooltip term="Transition Rule">transition rule</Tooltip> says: &ldquo;If the
            system is in state X, then one computation step produces state Y.&rdquo; By chaining rules together,
            you can trace any execution from start to finish — and prove that no step can violate safety guarantees.
          </p>

          {/* Transition Rules Display */}
          <div className="space-y-3">
            {TRANSITION_RULES.map((rule) => (
              <div
                key={rule.name}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                    {rule.name}
                  </span>
                </div>
                <code className="block text-sm font-mono text-slate-300 mb-2 overflow-x-auto">
                  {rule.rule}
                </code>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {rule.explanation}
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500">
            These 6 rules are a sample — the full system has 35 rules covering checkpoint, commit, rollback,
            supervisor restart, and more. See the{" "}
            <Link href="/spec-explorer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              Spec Explorer
            </Link>{" "}
            for the complete formal specification.
          </p>
        </div>
      </SectionShell>

      {/* ================================================================
          ORACLE & LAB TESTING
          ================================================================ */}
      <SectionShell
        id="oracles"
        icon="sparkles"
        eyebrow="Testing Infrastructure"
        title="17 Test Oracles"
        kicker="The Lab runtime ships with 17 independent correctness monitors. Each oracle watches for a specific class of concurrency bug."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} accentColor="#8B5CF6" className="p-1 md:p-2 bg-black/40 shadow-2xl shadow-purple-900/20">
            <OracleDashboardViz />
          </SyncContainer>

          <p className="text-slate-400 leading-relaxed">
            Each <Tooltip term="Test Oracle">test oracle</Tooltip> is an independent auditor.
            When you run a <Tooltip term="Lab Runtime">Lab</Tooltip> test, all 17 oracles are active simultaneously — checking
            for resource leaks, protocol violations, budget overruns, and more.
            Combined with <Tooltip term="DPOR">DPOR</Tooltip> (think of it as a maze solver that only
            explores paths that lead to different outcomes), the Lab systematically finds bugs that
            random testing would miss.
          </p>

          {/* Oracle List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ORACLE_LIST.map((oracle) => (
              <div
                key={oracle.name}
                className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                <div>
                  <span className="text-xs font-bold text-purple-300">{oracle.name}</span>
                  <span className="text-xs text-slate-500 ml-2">{oracle.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          CANCEL STATE MACHINE
          ================================================================ */}
      <SectionShell
        id="cancel-state-machine"
        icon="activity"
        eyebrow="Cancel Lifecycle"
        title="State Machine"
        kicker="Five states, four transitions, and Cancel Fuel that guarantees termination. Walk through the full cancellation lifecycle."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} accentColor="#F97316" className="p-1 md:p-2 bg-black/40 shadow-2xl shadow-orange-900/20">
            <CancelStateMachineViz />
          </SyncContainer>

          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              <Tooltip term="Cancel Fuel">Cancel Fuel</Tooltip> is the key invariant. It&apos;s a counter that
              strictly decreases with each step of cancel propagation — like a rocket with a finite fuel tank.
              The formal proof is a <Tooltip term="Supermartingale">supermartingale</Tooltip>: a mathematical
              sequence that, on average, can only go down. This guarantees that cancellation always terminates,
              even in adversarial workloads.
            </p>
            <p>
              The five states — Running, CancelRequested, Cancelling (Drain), Finalizing, and Completed —
              form a strict total order. A task can only move forward through these states, never backward.
              Combined with the <Tooltip term="Budget Algebra">budget algebra</Tooltip> that composes
              nested region budgets, this gives Asupersync its cancel-correctness guarantee.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          MACAROON CAPABILITY ATTENUATION
          ================================================================ */}
      <SectionShell
        id="macaroon-capabilities"
        icon="lock"
        eyebrow="Security"
        title="Macaroon Attenuation"
        kicker="Capabilities are bearer tokens with 8 caveat predicates. Anyone can add restrictions — nobody can remove them. Delegation is safe by construction."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} accentColor="#14B8A6" className="p-1 md:p-2 bg-black/40 shadow-2xl shadow-teal-900/20">
            <MacaroonCapabilityViz />
          </SyncContainer>

          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Inspired by Google&apos;s Macaroons paper, Asupersync&apos;s capabilities use a <Tooltip term="Macaroon">decentralized attenuation model</Tooltip>.
              When you delegate a capability to a child task, you can restrict it by adding <em>caveats</em> — but you can
              never widen an existing capability. This makes delegation inherently safe: you don&apos;t need a central authority
              to verify that a delegated token is valid.
            </p>
            <p>
              The 8 caveat predicates cover time bounds (<code className="text-teal-400 font-mono">TimeBefore</code>, <code className="text-teal-400 font-mono">TimeAfter</code>),
              spatial scoping (<code className="text-teal-400 font-mono">RegionScope</code>, <code className="text-teal-400 font-mono">TaskScope</code>),
              usage limits (<code className="text-teal-400 font-mono">MaxUses</code>, <code className="text-teal-400 font-mono">RateLimit</code>),
              resource patterns (<code className="text-teal-400 font-mono">ResourceScope</code>), and a <code className="text-teal-400 font-mono">Custom</code> escape
              hatch for application-specific restrictions.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          E-PROCESS MONITORING
          ================================================================ */}
      <SectionShell
        id="eprocess-monitoring"
        icon="activity"
        eyebrow="Statistical Testing"
        title="E-Process Monitoring"
        kicker="Anytime-valid invariant monitoring via Ville's inequality. Peek at any time, reject the instant evidence is strong enough — no p-hacking penalty."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} accentColor="#A855F7" className="p-1 md:p-2 bg-black/40 shadow-2xl shadow-purple-900/20">
            <EProcessMonitorViz />
          </SyncContainer>

          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Traditional statistical tests require a fixed sample size: you commit to N observations upfront, then compute
              a p-value. Peeking at intermediate results invalidates the guarantee. <Tooltip term="E-Process">E-processes</Tooltip> solve
              this using a betting martingale: <code className="text-purple-400 font-mono">E_t = E_(t-1) &times; (1 + &lambda; &times; (X_t - p₀))</code>.
            </p>
            <p>
              Via <strong className="text-purple-300">Ville&apos;s inequality</strong>, if the E-value ever
              exceeds 1/&alpha;, you know with mathematical certainty that the null hypothesis is false — regardless of when
              you checked. The Lab runtime monitors three critical invariants (task leak, obligation leak, quiescence)
              this way, with bet size &lambda;=0.5 and null rate p₀=0.001.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          SAGA COMPENSATION
          ================================================================ */}
      <SectionShell
        id="saga-compensation"
        icon="globe"
        eyebrow="Effect Safety"
        title="Saga Compensation"
        kicker="16 operation kinds, CALM-optimized coordination barriers, and automatic LIFO rollback. Distributed operations that unwind cleanly on failure."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} accentColor="#10B981" className="p-1 md:p-2 bg-black/40 shadow-2xl shadow-emerald-900/20">
            <SagaCompensationViz />
          </SyncContainer>

          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Multi-step operations (create account → send email → charge card) are modeled as <Tooltip term="Saga">Sagas</Tooltip>.
              Each step has a forward action and a compensating action. If any step fails or cancellation arrives,
              completed steps are unwound in LIFO order — the last completed step compensates first.
            </p>
            <p>
              What makes this unique is <Tooltip term="CALM Analysis">CALM analysis</Tooltip>. The Saga engine
              classifies each of its 16 operation kinds as <Tooltip term="Monotone Operation">monotone</Tooltip> (order-independent,
              like Reserve and Send) or non-monotone (barrier-required, like Commit and Release).
              Consecutive <Tooltip term="Monotone Operation">monotone operations</Tooltip> are batched without
              any <Tooltip term="Coordination Barrier">coordination barriers</Tooltip> — synchronization is inserted
              only where the math demands it.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================
          SEARCH V3 HYBRID PIPELINE
          ================================================================ */}
      <SectionShell
        id="search-pipeline"
        icon="sparkles"
        eyebrow="Search Infrastructure"
        title="Hybrid Search V3"
        kicker="Two-tier retrieval combining SQLite FTS5 lexical search with semantic embeddings, fused via Reciprocal Rank Fusion and budget-constrained reranking."
      >
        <div className="space-y-6">
          <SyncContainer withPulse={true} accentColor="#6366F1" className="p-1 md:p-2 bg-black/40 shadow-2xl shadow-indigo-900/20">
            <SearchV3PipelineViz />
          </SyncContainer>

          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Agent Mail&apos;s search pipeline parses incoming queries, splits retrieval budget across lexical
              and semantic tiers, then fuses candidates via <strong className="text-indigo-300">Reciprocal Rank Fusion</strong> (RRF).
              Field-based filters (subject:, body:, from:) narrow scope before scoring. Cross-project queries
              reach through the <Tooltip term="Product Bus">product bus</Tooltip> to search linked repositories.
            </p>
            <p>
              When embedding infrastructure is unavailable, the pipeline gracefully degrades to lexical-only mode.
              If FTS5 also fails, a chronological fallback scan ensures agents always get results — with
              clear diagnostics about which tier was skipped and why.
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
        kicker="From formal proofs to published crate."
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
