// Site configuration
export const siteConfig = {
  name: "MCP Agent Mail",
  title: "MCP Agent Mail — Coordination Infrastructure For AI Coding Agents",
  description: "Git-auditable, SQLite-backed coordination fabric for multi-agent coding: inboxes, reservations, threads, search, and operator tooling.",
  url: "https://mcp-agent-mail.com",
  github: "https://github.com/Dicklesworthstone/mcp_agent_mail_rust",
  social: {
    github: "https://github.com/Dicklesworthstone/mcp_agent_mail_rust",
    x: "https://x.com/doodlestein",
    authorGithub: "https://github.com/Dicklesworthstone",
  },
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Interactive Demos" },
  { href: "/architecture", label: "Architecture" },
  { href: "/spec-explorer", label: "Spec Explorer" },
  { href: "/getting-started", label: "Get Started" },
  { href: "/glossary", label: "Glossary" },
];

// Types
export interface Stat {
  label: string;
  value: string;
  helper?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
  category?: string;
}

export interface ComparisonRow {
  feature: string;
  asupersync: string;
  tokio: string;
  asyncStd: string;
  smol: string;
}

export interface ChangelogEntry {
  period: string;
  title: string;
  items: string[];
}

export interface GlossaryTerm {
  term: string;
  short: string;
  long: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GettingStartedPillar {
  title: string;
  description: string;
  color: string;
  icon: "blocks" | "shield" | "sparkles";
}

export interface GettingStartedFaqItem {
  question: string;
  answer: string;
}

export const gettingStartedInstallCommand =
  'curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/mcp_agent_mail_rust/main/install.sh?$(date +%s)" | bash';

export const gettingStartedQuickstartExample = `# 1) Start MCP Agent Mail server + TUI
am

# 2) Bootstrap session context in one call
macro_start_session(
  project_key="/abs/path/to/repo",
  program="codex-cli",
  model="gpt-5"
)

# 3) Reserve files before editing
file_reservation_paths(
  project_key,
  agent_name,
  ["src/**"],
  ttl_seconds=3600,
  exclusive=true
)

# 4) Coordinate through threaded messages
send_message(
  project_key,
  sender_name="GreenCastle",
  to=["BlueLake"],
  subject="Starting auth refactor",
  thread_id="FEAT-123",
  ack_required=true,
  body_md="I have reservations on src/auth/**; taking login + token rotation."
)
fetch_inbox(project_key, agent_name)
acknowledge_message(project_key, agent_name, message_id)`;

export const gettingStartedMcpConfigSnippet = `{
  "mcpServers": {
    "agent-mail": {
      "command": "mcp-agent-mail",
      "args": []
    }
  }
}`;

export const gettingStartedPillars: GettingStartedPillar[] = [
  {
    icon: "blocks",
    title: "Scoped Agent Identity",
    description:
      "Project-scoped identities, thread continuity, and explicit inbox semantics keep parallel agents coordinated instead of colliding.",
    color: "#3B82F6",
  },
  {
    icon: "shield",
    title: "Reservation Guardrails",
    description:
      "Advisory file reservations plus optional guard enforcement make ownership visible before edits and safer at commit time.",
    color: "#F97316",
  },
  {
    icon: "sparkles",
    title: "Auditable Workflows",
    description:
      "Messages, acknowledgements, and search traces are queryable in SQLite and preserved in a Git-auditable archive.",
    color: "#22c55e",
  },
];

export const gettingStartedFaq: GettingStartedFaqItem[] = [
  {
    question: "Do I need to configure every agent manually?",
    answer:
      "No. Running `am` auto-detects common coding agents and can bootstrap MCP connectivity. Manual config snippets are still available for Claude Code, Codex CLI, and Gemini CLI when needed.",
  },
  {
    question: "What is the fastest way to start on a repository?",
    answer:
      "Start `am`, then use `macro_start_session` to register the agent, fetch inbox context, and begin reservation-aware work in one step.",
  },
  {
    question: "Are file reservations mandatory locks?",
    answer:
      "They are advisory coordination primitives with conflict visibility, plus optional pre-commit enforcement if you install the guard integration.",
  },
  {
    question: "How does Agent Mail avoid losing message history?",
    answer:
      "Messages are recorded in SQLite for query speed and exported into a Git-auditable archive for durable, reviewable history.",
  },
  {
    question: "Can this work across multiple repos/projects?",
    answer:
      "Yes. Product-level search, inbox aggregation, and cross-project contact workflows are built in for multi-repo coordination.",
  },
];

// Hero stats
export const heroStats: Stat[] = [
  { label: "MCP Tools", value: "34", helper: "Coordination primitives across messaging/search/reservations" },
  { label: "Resources", value: "20+", helper: "Agent-discoverable resource surfaces" },
  { label: "Stress Gauntlet", value: "10/10", helper: "Representative high-load scenarios passed" },
  { label: "Sustained Throughput", value: "~49 RPS", helper: "HTTP stress profile baseline (context-dependent)" },
];

// Features
export const features: Feature[] = [
  {
    title: "Structured Concurrency",
    description: "Every task lives inside a Region. When a Region closes, all tasks within it are cancelled, awaited, and cleaned up — automatically. No orphaned futures, no leaked goroutines.",
    icon: "blocks",
    category: "Concurrency Model",
  },
  {
    title: "Cancel-Correct Protocol",
    description: "Three-phase cancellation: Request → Drain → Finalize. Tasks get budgeted time to clean up connections, flush buffers, and release resources. Never a silent drop again.",
    icon: "shield",
    category: "Core Runtime Protocol",
  },
  {
    title: "Linear Obligations",
    description: "Permits must be explicitly consumed — sent, completed, or aborted. The type system prevents you from forgetting to handle them. Compile-time resource leak prevention.",
    icon: "lock",
    category: "Type System Guarantee",
  },
  {
    title: "Capability Security",
    description: "Tasks receive a Cx (capability context) that controls what they can do. Spawn, I/O, timers — all gated by capabilities. Principle of least authority, enforced by the runtime.",
    icon: "cpu",
    category: "Security Model",
  },
  {
    title: "Lab Runtime",
    description: "Deterministic testing with seed-controlled execution order. Replay any interleaving. Integrated DPOR (Dynamic Partial Order Reduction) finds concurrency bugs systematically.",
    icon: "sparkles",
    category: "Testing Infrastructure",
  },
  {
    title: "Three-Lane Scheduler",
    description: "Cancel lane (highest priority), Timed lane (deadlines), Ready lane (normal work). Cancellation always wins the race, ensuring prompt cleanup even under load.",
    icon: "activity",
    category: "Scheduler Design",
  },
  {
    title: "Built-in Ecosystem",
    description: "Cancel-correct TCP, HTTP, channels, mutexes, and supervisors out of the box. Every protocol respects the cancel contract. No need to wrap Tokio primitives.",
    icon: "globe",
    category: "Protocol Ecosystem",
  },
  {
    title: "Two-Phase Effects",
    description: "Reserve/commit pattern: side effects are staged before cancellation checkpoints, then committed atomically. If cancellation arrives mid-operation, only reserved (uncommitted) work is rolled back.",
    icon: "shield",
    category: "Effect Safety",
  },
  {
    title: "Budget Algebra",
    description: "Cancel budgets compose algebraically as a product semiring. When regions nest, their budgets merge via min(deadlines) \u00D7 min(quotas) \u00D7 max(priority). Consistent cancel timing across arbitrarily deep hierarchies.",
    icon: "cpu",
    category: "Formal Foundations",
  },
  {
    title: "17 Test Oracles",
    description: "The Lab runtime ships with 17 built-in correctness monitors — from TaskLeak and ObligationLeak to CancelProtocol and DeadlineMonotone. Each oracle independently watches for a specific class of concurrency bug during deterministic testing.",
    icon: "sparkles",
    category: "Testing Infrastructure",
  },
  {
    title: "Spectral Deadlock Detection",
    description: "Analyzes the wait-graph\u2019s Laplacian eigenvalues in real time. When the Fiedler value drops near zero, the scheduler detects incipient deadlocks before they fully form.",
    icon: "activity",
    category: "Scheduler Design",
  },
  {
    title: "Formal Small-Step Semantics",
    description: "35 transition rules define every possible async state change — from SPAWN and CANCEL-PROPAGATE to CHECKPOINT-MASKED and CLOSE-RUN-FINALIZER. These rules are mechanized in Lean 4, bridging the gap between spec-doc prose and machine-checked proofs.",
    icon: "lock",
    category: "Formal Foundations",
  },
  {
    title: "Macaroon Capability Attenuation",
    description: "Capabilities use a decentralized Macaroon model with 8 caveat predicates: time bounds, region scope, task scope, max uses, resource glob patterns, rate limits, and custom key-value constraints. Caveats can only restrict — never widen — making delegation safe without a central authority.",
    icon: "lock",
    category: "Security Model",
  },
  {
    title: "E-Process Invariant Monitoring",
    description: "The Lab runtime uses E-processes (betting martingales via Ville's inequality) for anytime-valid statistical monitoring. Unlike fixed-sample tests, you can peek at any time and reject if the E-value exceeds 1/α — no p-hacking, no multiple-testing correction needed.",
    icon: "activity",
    category: "Testing Infrastructure",
  },
  {
    title: "Saga Compensation",
    description: "Distributed operations use a Saga pattern with 16 operation kinds split into monotone (coordination-free) and non-monotone (barrier-required) classes. CALM analysis batches consecutive monotone steps, inserting coordination barriers only before non-monotone operations like Commit or Release.",
    icon: "globe",
    category: "Effect Safety",
  },
  {
    title: "Lyapunov Potential Scheduling",
    description: "A 4-component Lyapunov function — live tasks, obligation age, draining regions, and deadline pressure — provides a formal energy measure that strictly decreases over time. The scheduler uses this potential to prove that the system always makes progress toward quiescence.",
    icon: "activity",
    category: "Scheduler Design",
  },
];

// Comparison data
export const comparisonData: ComparisonRow[] = [
  { feature: "Structured Concurrency", asupersync: "First-class", tokio: "Manual", asyncStd: "Manual", smol: "Manual" },
  { feature: "Cancel Protocol", asupersync: "3-phase", tokio: "Silent drop", asyncStd: "Silent drop", smol: "Silent drop" },
  { feature: "Linear Obligations", asupersync: "Enforced", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Capability Security", asupersync: "Built-in", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Deterministic Testing", asupersync: "Lab Runtime", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Resource Leak Prevention", asupersync: "Compile-time", tokio: "Manual", asyncStd: "Manual", smol: "Manual" },
  { feature: "Scheduler Priority", asupersync: "3-lane", tokio: "Work-stealing", asyncStd: "Work-stealing", smol: "Work-stealing" },
  { feature: "Cancellation Priority", asupersync: "Guaranteed", tokio: "Best-effort", asyncStd: "Best-effort", smol: "Best-effort" },
  { feature: "Built-in Protocols", asupersync: "8+", tokio: "Separate crates", asyncStd: "Partial", smol: "Minimal" },
  { feature: "Formal Verification", asupersync: "12 proofs", tokio: "Loom tests", asyncStd: "No", smol: "No" },
  { feature: "Two-Phase Effects", asupersync: "Reserve/Commit", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Formal Semantics", asupersync: "35 rules (Lean)", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Deadlock Detection", asupersync: "Spectral (real-time)", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Test Oracles", asupersync: "17 built-in", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Capability Attenuation", asupersync: "Macaroon (8 caveats)", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Statistical Monitoring", asupersync: "E-process (anytime)", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Saga Compensation", asupersync: "16 op kinds (CALM)", tokio: "No", asyncStd: "No", smol: "No" },
  { feature: "Progress Proofs", asupersync: "Lyapunov + martingale", tokio: "No", asyncStd: "No", smol: "No" },
];

// Code example
export const codeExample = `use asupersync::{Region, Cx, Outcome, Budget};
use std::time::Duration;

#[asupersync::main]
async fn main(cx: &Cx) -> Outcome<()> {
    // Open a region — all tasks scoped here
    Region::open(cx, "server", async |cx| {
        // Spawn a listener with cancel capability
        let permit = cx.spawn("listener", async |cx| {
            let listener = cx.tcp_bind("0.0.0.0:8080").await?;
            loop {
                let (stream, _) = listener.accept(cx).await?;
                cx.spawn("conn", handle_connection(stream));
            }
        });

        // Wait for shutdown signal
        cx.shutdown_signal().await;

        // Cancel with budget — tasks get 5s to drain
        permit.cancel(Budget::timeout(Duration::from_secs(5)));
    }).await
}`;

// Second code example: Two-Phase Effects
export const codeExampleTwoPhase = `use asupersync::{Region, Cx, Outcome, Effect};

async fn transfer_funds(cx: &Cx, from: Account, to: Account, amount: u64) -> Outcome<()> {
    // Phase 1: Reserve — stage the side effects
    let debit = cx.reserve(Effect::debit(&from, amount)).await?;
    let credit = cx.reserve(Effect::credit(&to, amount)).await?;

    // Cancellation checkpoint — if cancelled here,
    // reservations are automatically rolled back. No money lost.
    cx.cancel_checkpoint().await?;

    // Phase 2: Commit — atomically apply both effects
    debit.commit().await?;
    credit.commit().await?;
    Outcome::ok(())
}`;

// Third code example: Saga Compensation
export const codeExampleSaga = `use asupersync::{Cx, Outcome, Saga};

async fn provision_user(cx: &Cx, email: String) -> Outcome<()> {
    let saga = Saga::begin(cx).await;

    // Step 1: Create account (monotone — no barrier needed)
    let account = saga.step(
        || db::create_account(&email),     // forward
        |a| db::delete_account(a.id),      // compensate
    ).await?;

    // Step 2: Send welcome email (monotone — batched with step 1)
    saga.step(
        || mailer::send_welcome(&email),   // forward
        |_| mailer::send_retraction(&email), // compensate
    ).await?;

    // Step 3: Charge card (non-monotone — CALM inserts barrier here)
    saga.step(
        || billing::charge(account.id, 9_99),  // forward
        |_| billing::refund(account.id, 9_99), // compensate
    ).await?;

    // If cancelled, steps unwind in LIFO order:
    // refund → retract email → delete account
    saga.commit().await
}`;

// Changelog
export const changelog: ChangelogEntry[] = [
  {
    period: "Phase 1",
    title: "Core Runtime & Region Model",
    items: [
      "Designed the Region tree model with parent-child lifetime scoping",
      "Implemented the three-phase cancel protocol (Request → Drain → Finalize)",
      "Built the Cx capability context with spawn/IO/timer gates",
      "Formal proofs for cancel-safety and region closure guarantees",
    ],
  },
  {
    period: "Phase 2",
    title: "Linear Obligations & Permits",
    items: [
      "Designed the Permit/Lease linear type system",
      "Implemented compile-time must-use enforcement",
      "Built the three consumption paths: Send, Complete, Abort",
      "Added Spork (spawn + fork) for structured task hierarchies",
    ],
  },
  {
    period: "Phase 3",
    title: "Three-Lane Scheduler",
    items: [
      "Implemented Cancel/Timed/Ready lane architecture",
      "Built priority inversion prevention for cancel propagation",
      "Designed quiescence detection for region closure",
      "Benchmarked against Tokio's work-stealing scheduler",
    ],
  },
  {
    period: "Phase 4",
    title: "Lab Runtime & DPOR",
    items: [
      "Built deterministic executor with seed-controlled ordering",
      "Implemented Dynamic Partial Order Reduction for systematic testing",
      "Added replay capability for reproducing concurrency bugs",
      "Integrated with cargo test for seamless developer experience",
    ],
  },
  {
    period: "Phase 5",
    title: "Built-in Protocols & Ecosystem",
    items: [
      "Implemented cancel-correct TCP, HTTP/1.1, and WebSocket protocols",
      "Built cancel-aware channels, mutexes, and semaphores",
      "Added supervisor trees with restart policies",
      "Published to crates.io with comprehensive documentation",
    ],
  },
];

// Glossary terms (alphabetically ordered)
export const glossaryTerms: GlossaryTerm[] = [
  { term: "Budget", short: "Countdown timer for task cleanups", long: "When cancellation strikes, tasks aren't killed instantly—they're given a 'Budget' (a specific amount of time, like 5 seconds) to clean up their mess during the Drain phase. If they run out of time, they are forcefully Finalized." },
  { term: "Budget Algebra", short: "Product semiring for composing cancel budgets", long: "Cancel budgets compose algebraically as a product semiring. When regions nest, their budgets merge element-wise: min(deadlines), min(quotas), max(priority). This means the tightest deadline and smallest quota always win, while the highest priority propagates upward — guaranteeing consistent cancel timing across arbitrarily deep region hierarchies." },
  { term: "CALM Analysis", short: "Identifies which operations need coordination", long: "Consistency As Logical Monotonicity — a principle that determines which operations can run coordination-free (monotone operations like Reserve and Send) and which require barriers (non-monotone operations like Commit and Release). Asupersync's Saga engine uses CALM to automatically batch consecutive monotone steps, inserting coordination barriers only where the math demands it." },
  { term: "CALM Theorem", short: "Consistency As Logical Monotonicity", long: "A formal theorem from distributed systems theory: a program can be made eventually consistent without coordination if and only if it is monotone (i.e., it never retracts information). Asupersync applies this to classify operations: monotone operations (Reserve, Send, Acquire) can execute lock-free, while non-monotone operations (Commit, Release, RegionClose) require synchronization barriers." },
  { term: "Cancel Contract", short: "Protocol compliance guarantee", long: "A strict promise that a given protocol (like TCP, HTTP, or channels) correctly implements the three-phase cancel protocol. All built-in Asupersync protocols satisfy this contract out of the box." },
  { term: "Cancel Fuel", short: "Monotonically decreasing termination counter", long: "A counter that strictly decreases with each step of cancel propagation, serving as a termination proof. Like a rocket with a finite fuel tank — the cancel signal can only travel so far before the fuel runs out, mathematically guaranteeing that cancellation always finishes." },
  { term: "Cancel-Correct", short: "Guaranteed safe shutdown", long: "In standard Rust, dropping a future might instantly stop it mid-execution, leaving connections open or data half-written. 'Cancel-Correct' means the runtime enforces a graceful 3-phase shutdown: tasks are asked to stop, given time to clean up, and finally swept away safely." },
  { term: "CancelProtocol Oracle", short: "Verifies tasks obey the 3-phase cancel contract", long: "A specialized test oracle that monitors every task during Lab testing to ensure it correctly follows the three-phase cancel protocol. If a task tries to skip the Drain phase or ignores a cancel request, the oracle catches it immediately and reports the exact violation." },
  { term: "Capability Gate", short: "Permission check on Cx", long: "A check on the Cx that determines whether a task has permission to perform a specific operation. Gates can be spawn, io, timer, or even custom application-defined capabilities." },
  { term: "Capability Security", short: "Need-to-know task management", long: "A 'Zero Trust' model for concurrency. Tasks receive a 'Cx' token that explicitly grants them permissions—like the ability to spawn other tasks, use the network, or access timers. If a task is hijacked or buggy, its damage is contained to its specific capabilities." },
  { term: "Capability Tier", short: "Hierarchical permission level for tasks", long: "A five-level permission hierarchy: FiberCap (compute-only), TaskCap (can spawn children), IoCap (network/filesystem access), RemoteCap (cross-machine communication), and SupervisorCap (can manage and restart other tasks). Each tier extends the one below it, enforcing the principle of least authority." },
  { term: "Conformal Calibration", short: "Distribution-free prediction intervals for Lab metrics", long: "A statistical technique that produces valid prediction intervals without assuming any particular data distribution. The Lab runtime uses conformal calibration to set alert thresholds on runtime metrics — if a test run's timing falls outside the conformal band, the oracle flags it as anomalous, even if the underlying distribution is completely unknown." },
  { term: "Cx", short: "Capability context token", long: "The magic key passed to every task. It controls what operations that task may perform. Spawning, I/O, timers, and other effects are gated by capabilities on the Cx. This enforces the principle of least authority." },
  { term: "Coordination Barrier", short: "Sync point required before non-monotone operations", long: "A synchronization point that the Saga engine inserts before non-monotone operations (like Commit or Release). Monotone operations (like Reserve and Send) can execute without barriers because they're order-independent. CALM analysis determines exactly where barriers are needed, minimizing unnecessary synchronization." },
  { term: "DPOR", short: "Dynamic Partial Order Reduction", long: "A smart algorithm used by the Lab Runtime. Instead of testing every single possible way tasks could overlap (which would take billions of years), DPOR only tests the interleavings that actually interact with each other. It finds the needle in the concurrency haystack mathematically." },
  { term: "Drain Phase", short: "Graceful cleanup during cancellation", long: "The second phase of the cancel protocol. After a cancel request, tasks enter Drain where they can finish in-flight work, flush buffers, close connections, and release resources within their Budget." },
  { term: "E-Process", short: "Anytime-valid statistical monitor using betting martingales", long: "A betting martingale that lets you continuously monitor a hypothesis and reject it the instant the evidence is strong enough — without any penalty for peeking. Unlike traditional p-values (which require a fixed sample size), an E-process stays valid no matter when you check it. Asupersync's Lab runtime uses E-processes to monitor three oracle invariants (task leak, obligation leak, quiescence) with guaranteed Type-I error control via Ville's inequality." },
  { term: "EXP3 Scheduler", short: "Adaptive scheduling via exponential weights", long: "An online learning algorithm (Exponential-weight algorithm for Exploration and Exploitation) that adapts the scheduler's behavior based on observed cancellation patterns. The scheduler maintains 5 arms [4, 8, 16, 32, 64] representing cancel-streak thresholds. If certain thresholds consistently perform better, EXP3 shifts weight toward them with exploration rate γ=0.07, converging toward the optimal strategy over time." },
  { term: "FiberCap", short: "Minimal capability: compute-only, no I/O", long: "The lowest capability tier. A task with only FiberCap can perform pure computation — no spawning, no I/O, no timers. It's the most restricted permission level, ideal for untrusted or sandboxed computations." },
  { term: "Fiedler Value", short: "Eigenvalue that signals deadlock risk", long: "The second-smallest eigenvalue of the wait-graph's Laplacian matrix. When it's large, tasks flow freely (no bottleneck). When it drops near zero, the graph is about to split into disconnected components — meaning a deadlock is forming. Think of it as a 'traffic congestion score' for your concurrent system." },
  { term: "Finalize Phase", short: "Final cleanup after draining", long: "The Finalize phase runs after Drain completes (or the Budget expires). It executes registered finalizers in LIFO order — similar to defer in Go but tightly integrated with the cancel protocol." },
  { term: "Foata Fingerprint", short: "Canonical hash of concurrent execution traces", long: "A technique for canonicalizing concurrent execution traces using Foata normal form. Two interleavings that differ only in the order of independent (non-conflicting) operations produce the same fingerprint. DPOR uses this to detect when two different schedules are actually equivalent — pruning redundant exploration without missing real bugs." },
  { term: "Fountain Code", short: "Rateless erasure code for data transfer", long: "A class of erasure codes where the sender generates a potentially infinite stream of encoded symbols, and the receiver can reconstruct the original data from any sufficient subset. Like a magic fountain — you just need to collect enough drops, regardless of which specific drops you catch." },
  { term: "Hedge Algorithm", short: "Online learning for cancel-streak thresholds", long: "An online learning algorithm that tunes the scheduler's cancel-streak detection thresholds. When the runtime sees repeated cancellations in a region, Hedge adjusts how aggressively the scheduler pre-empts work there, minimizing wasted computation without over-reacting to transient patterns." },
  { term: "IoCap", short: "Capability for network and filesystem access", long: "A mid-tier capability that extends TaskCap with permission to perform I/O operations: reading and writing files, opening network connections, and setting timers. Required for any task that needs to interact with the outside world." },
  { term: "Lab Runtime", short: "Deterministic testing sandbox", long: "A virtual time-machine for your code. The Lab Runtime replaces the chaotic real-world scheduler with a perfectly controlled one. By feeding it a 'Seed', developers can reproduce insanely complex concurrency bugs (race conditions) every single time. Bye-bye flaky tests." },
  { term: "Lyapunov Potential", short: "4-component energy function proving system progress", long: "A formal 'energy measure' composed of four terms: live task count, pending obligation age, draining region count, and deadline pressure. Like a ball's potential energy decreasing as it rolls downhill, this function strictly decreases with each scheduler step — mathematically proving the runtime always makes progress toward quiescence. The scheduler can tune weights (obligation-focused vs deadline-focused) to prioritize different workload patterns." },
  { term: "Lease", short: "Scoped resource borrow", long: "Temporary ownership of a shared resource (like a database connection). Unlike standard Rust where drops are passive, if a Lease's owning Region is cancelled, the resource is actively and safely returned to its pool via the cancel protocol." },
  { term: "Linear Obligations", short: "Mandatory return policy for resources", long: "A strict resource management system backed by Rust's type system. Think of it as a library book you must explicitly return. If a code path forgets to consume a resource (like a Permit or Lease), the program refuses to compile, preventing resource leaks at compile-time." },
  { term: "Luby Transform", short: "Degree distribution for fountain codes", long: "A specific probability distribution that determines how many source symbols are combined into each encoded symbol in LT codes (a type of fountain code). Named after Michael Luby, it's the mathematical trick that makes fountain codes work efficiently with near-optimal overhead." },
  { term: "Macaroon", short: "Decentralized capability token with attenuating caveats", long: "A bearer credential (inspired by Google's Macaroons paper) where anyone holding the token can add restrictions (caveats) but can never remove them. In Asupersync, capabilities are Macaroon-based: you can delegate a capability to a child task while attenuating it (e.g., adding a deadline, restricting to a specific Region, or limiting to N uses). The 8 caveat predicates include TimeBefore, TimeAfter, RegionScope, TaskScope, MaxUses, ResourceScope, RateLimit, and Custom." },
  { term: "Mazurkiewicz Trace", short: "Equivalence class of concurrent interleavings", long: "A concept from concurrency theory: two execution traces are 'Mazurkiewicz equivalent' if they differ only in the order of independent (non-conflicting) operations. Asupersync's DPOR uses Mazurkiewicz traces to avoid redundantly testing schedules that produce identical outcomes — a massive reduction in the search space for concurrency testing." },
  { term: "Martingale Progress Certificate", short: "Probabilistic proof of task completion", long: "A formal certificate based on supermartingale theory that proves tasks make monotonic progress toward completion. Like a ball rolling downhill — the certificate mathematically guarantees the ball can never roll back up, ensuring every task eventually finishes or is cleanly cancelled." },
  { term: "Monotone Operation", short: "Order-independent operation that needs no coordination", long: "An operation whose result doesn't depend on the order it's executed relative to other monotone operations. Reserve, Send, Acquire, Renew, and CrdtMerge are all monotone in Asupersync's Saga engine. Because they're order-independent, they can be batched and executed without coordination barriers — a key performance optimization identified by CALM analysis." },
  { term: "Obligation System", short: "Framework ensuring all resources are consumed", long: "The formal framework that tracks every Permit and Lease in the system and guarantees they are all explicitly consumed before their owning scope exits. If a resource escapes without being handled, the compiler or runtime catches it — no resource can silently leak." },
  { term: "ObligationLeak Oracle", short: "Catches leaked Permits and Leases", long: "A test oracle that monitors for Permits or Leases that are dropped without being explicitly consumed (sent, completed, or aborted). When it catches one, it reports exactly which obligation was leaked and where it was created." },
  { term: "Oracle", short: "Strict runtime referee", long: "A system component that watches over your application's execution. If an Oracle spots a broken promise—like a task ignoring a cancellation request, or a lease being dropped instead of properly returned—it halts the test and flags the exact line of code that violated the rules." },
  { term: "Outcome", short: "Result type for async operations", long: "A super-powered Result enum. Instead of just Ok(T) or Err(E), Outcome explicitly includes Cancelled. It forces you to write code that consciously handles the scenario where an operation was interrupted." },
  { term: "Permit", short: "Must-use lifecycle token", long: "When you spawn a task, you get a Permit. You can't just throw it away; you must explicitly wait for the task, detach it, or cancel it. It's how Asupersync enforces that you are always paying attention to the tasks you create." },
  { term: "Product Semiring", short: "Algebraic structure for budget composition", long: "A mathematical structure where budgets compose element-wise using min and max operations. It's called a 'semiring' because it has two combining operations (like addition and multiplication, but using min and max instead). This gives budget composition clean algebraic properties: it's associative, commutative, and has identity elements." },
  { term: "Quiescence", short: "When a region goes completely silent", long: "The state of a Region when all its tasks have finished, and no new tasks can possibly be created inside it. It's the equivalent of making sure everyone has left the building and the doors are locked before turning off the lights." },
  { term: "RaptorQ", short: "RFC 6330 fountain code for erasure-coded transfer", long: "An advanced fountain code standardized in RFC 6330 that Asupersync uses for erasure-coded data transfer. It generates repair symbols so efficiently that receivers can reconstruct original data from any sufficient subset of symbols, with less than 1% overhead beyond the theoretical minimum." },
  { term: "Region", short: "A structured concurrency scope", long: "A lifetime-bounded scope that owns tasks. When a Region closes, all tasks within it are cancelled (via the cancel protocol), awaited to completion, and their resources cleaned up. Regions nest hierarchically, forming a tree." },
  { term: "Region Tree", short: "Hierarchy of nested scopes", long: "A family tree for tasks. Instead of tasks floating around independently, every task in Asupersync belongs to a 'Region'. When a parent Region is cancelled, the entire branch of child Regions and tasks is cleanly pruned from the bottom up. No task is ever orphaned." },
  { term: "Saga", short: "Distributed operation with automatic compensation on failure", long: "A pattern for long-running operations that span multiple steps. Each step has a forward action and a compensating action. If any step fails (or cancellation arrives), the Saga automatically runs compensating actions for all completed steps in LIFO order. Asupersync's Saga engine classifies its 16 operation kinds into monotone and non-monotone using CALM analysis, minimizing the coordination overhead." },
  { term: "Regret Bound", short: "Convergence guarantee for adaptive scheduling", long: "A mathematical proof that the EXP3 adaptive scheduler's cumulative 'regret' (difference between its performance and the best fixed strategy in hindsight) grows sublinearly. In practice, this means the scheduler converges to optimal behavior — it can't be fooled for long by adversarial workloads." },
  { term: "Seed", short: "Deterministic execution parameter", long: "An integer that controls the Lab runtime's scheduling decisions. The exact same seed always produces the exact same task interleaving, enabling perfectly reproducible testing and bug replay." },
  { term: "Small-Step Semantics", short: "Formal rules defining single computation steps", long: "A mathematical framework where each computation step is defined by a transition rule of the form \u27E8e, \u03C3\u27E9 \u2192 \u27E8e\u2032, \u03C3\u2032\u27E9 (expression e in state \u03C3 steps to expression e\u2032 in state \u03C3\u2032). Asupersync has 35 such rules covering spawning, cancellation, effect reservation, region closure, and more — each mechanized in Lean 4 for machine-checked correctness." },
  { term: "Spectral Wait-Graph Analysis", short: "Eigenvalue-based deadlock prediction", long: "A technique that analyzes the eigenvalues of the wait-graph's Laplacian matrix to predict deadlocks before they fully form. Instead of waiting for tasks to actually freeze, it detects the mathematical signature of an emerging deadlock (the Fiedler value approaching zero) and intervenes proactively." },
  { term: "Spork", short: "Spawn + Fork primitive", long: "A portmanteau of Spawn and Fork. It creates a new task while simultaneously branching off a new child Region. The new task inherits a subset of the parent's capabilities and is tightly bound to its new Region's lifecycle." },
  { term: "Supermartingale", short: "Stochastic process proving termination", long: "A mathematical sequence of values that, on average, decreases over time. Asupersync uses supermartingales as termination proofs: by showing that a certain measure of 'remaining work' is a supermartingale, it mathematically proves that tasks always make progress and eventually complete." },
  { term: "Supervisor", short: "Fault-tolerant task manager", long: "A task that monitors child tasks and applies restart policies when they fail. Crucially, Supervisors respect the cancel protocol: during Region cancellation, they stop restarting and allow children to drain gracefully." },
  { term: "TaskLeak Oracle", short: "Detects tasks escaping their Region scope", long: "A test oracle that catches tasks which outlive their owning Region — the concurrent equivalent of a dangling pointer. If a task is still running after its Region has closed, the TaskLeak oracle flags it immediately, preventing 'zombie' tasks from silently consuming resources." },
  { term: "Test Oracle", short: "Runtime correctness monitor for Lab testing", long: "A specialized runtime monitor that checks a specific class of correctness invariant during Lab testing. Each of the 17 built-in oracles watches for a different kind of bug — from resource leaks to protocol violations to budget overruns — acting as an automated auditor for your concurrent code." },
  { term: "Three-Lane Scheduler", short: "Cancel / Timed / Ready priorities", long: "A traffic control system for tasks. The 'Cancel Lane' is the ambulance: it always gets priority so cleanups happen instantly. The 'Timed Lane' is for scheduled events, and the 'Ready Lane' handles normal traffic." },
  { term: "Three-Phase Cancel Protocol", short: "Request \u2192 Drain \u2192 Finalize", long: "A rigorous lifecycle for stopping tasks. Phase 1: Request (signal intent to stop). Phase 2: Drain (allow tasks to finish writing to disk, closing network sockets, etc.). Phase 3: Finalize (force-release all remaining resources). This prevents the 'silent drop' problem." },
  { term: "Transition Rule", short: "One formal rule in the small-step semantics", long: "A single rule in the small-step operational semantics that defines how one kind of computation step works. For example, the SPAWN rule defines what happens when a task is created, and the CANCEL-PROPAGATE rule defines how cancellation flows through the Region tree. Asupersync has 35 such rules, all mechanized in Lean 4." },
  { term: "Two-Phase Effect", short: "Reserve/commit pattern preventing partial side-effects", long: "A pattern where side effects are split into two stages: Reserve (stage the effect, making it reversible) and Commit (apply it permanently). If cancellation arrives between Reserve and Commit, the reservation is automatically rolled back. Think of it like a bank placing a hold on your account before transferring — if the transfer is cancelled, the hold is simply released." },
  { term: "Wait-Graph", short: "Directed graph of task dependencies", long: "A directed graph where nodes are tasks and edges represent 'task A is waiting on task B'. The runtime maintains this graph in real time and uses spectral analysis on its Laplacian matrix to detect deadlocks before they fully form." },
  { term: "GenServer", short: "Generic Server for stateful actors", long: "A battle-tested server pattern borrowed from Erlang/OTP used to encapsulate state, handle concurrent requests, and manage a mailbox. In Asupersync, GenServers are supercharged with compile-time Reply Obligations, meaning a server can mathematically never 'forget' to respond to a client." },
  { term: "Mailbox", short: "Message queue for actor tasks", long: "The receiving queue for a GenServer. While standard Erlang uses unbounded mailboxes that can silently grow until the system runs out of memory and crashes, Asupersync mailboxes are explicitly bounded and enforce backpressure safely." },
  { term: "Monotone Operation", short: "Coordination-free action", long: "An operation that only ever adds information (like appending an item to a set or moving forward in a state machine). Because it never relies on checking if something is 'empty' or 'missing', it can execute concurrently without any locks. It is infinitely scalable." },
  { term: "Non-Monotone Operation", short: "Barrier-requiring action", long: "An operation that checks a threshold or relies on negation (e.g., 'close this region only if zero tasks remain'). Because it must ensure no other thread is secretly adding a task while it checks, it fundamentally requires a heavy synchronization lock to execute safely." },
];

// Flywheel
export interface FlywheelTool {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  color: string;
  href: string;
  features: string[];
  connectsTo: string[];
  connectionDescriptions: Record<string, string>;
  projectSlug?: string;
  demoUrl?: string;
  stars?: number;
}

export const flywheelDescription = {
  title: "The AI Flywheel",
  subtitle: "A high-velocity AI engineering ecosystem that built Asupersync.",
  description: "Asupersync wasn't built manually. It was architected and implemented through a recursive feedback loop of specialized AI agents, each handling a different layer of the runtime's formal verification, testing, and implementation pipeline.",
};

export const flywheelTools: FlywheelTool[] = [
  {
    id: "ntm",
    name: "Named Tmux Manager",
    shortName: "NTM",
    href: "https://github.com/Dicklesworthstone/ntm",
    icon: "LayoutGrid",
    color: "from-sky-500 to-blue-600",
    tagline: "Multi-agent tmux orchestration",
    connectsTo: ["slb", "mail", "cass", "bv"],
    connectionDescriptions: {
      slb: "Routes dangerous commands through safety checks",
      mail: "Human Overseer messaging and file reservations",
      cass: "Duplicate detection and session history search",
      bv: "Dashboard shows beads status; --robot-triage for dispatch",
    },
    stars: 133,
    projectSlug: "named-tmux-manager",
    features: [
      "Spawn 10+ Claude/Codex/Gemini agents in parallel",
      "Smart broadcast with type/variant/tag filtering",
      "60fps animated dashboard with health monitoring",
    ],
  },
  {
    id: "slb",
    name: "Simultaneous Launch Button",
    shortName: "SLB",
    href: "https://github.com/Dicklesworthstone/slb",
    icon: "ShieldCheck",
    color: "from-red-500 to-rose-600",
    tagline: "Peer review for dangerous commands",
    connectsTo: ["mail", "ubs"],
    connectionDescriptions: {
      mail: "Notifications sent to reviewer inboxes",
      ubs: "Pre-flight scans before execution",
    },
    stars: 56,
    projectSlug: "simultaneous-launch-button",
    features: [
      "Three-tier risk classification (CRITICAL/DANGEROUS/CAUTION)",
      "Cryptographic command binding with SHA256+HMAC",
      "Dynamic quorum based on active agents",
    ],
  },
  {
    id: "mail",
    name: "MCP Agent Mail",
    shortName: "Mail",
    href: "https://github.com/Dicklesworthstone/mcp_agent_mail",
    icon: "Mail",
    color: "from-amber-500 to-yellow-600",
    tagline: "Inter-agent messaging & coordination",
    connectsTo: ["bv", "cm", "slb"],
    connectionDescriptions: {
      bv: "Task IDs link conversations to Beads issues",
      cm: "Shared context across agent sessions",
      slb: "Approval requests delivered to inboxes",
    },
    stars: 1654,
    demoUrl: "https://dicklesworthstone.github.io/cass-memory-system-agent-mailbox-viewer/viewer/",
    projectSlug: "mcp-agent-mail",
    features: [
      "GitHub-flavored Markdown messaging between agents",
      "Advisory file reservations to prevent conflicts",
      "SQLite-backed storage for complete audit trails",
    ],
  },
  {
    id: "bv",
    name: "Beads Viewer",
    shortName: "BV",
    href: "https://github.com/Dicklesworthstone/beads_viewer",
    icon: "GitBranch",
    color: "from-violet-500 to-purple-600",
    tagline: "Graph analytics for task dependencies",
    connectsTo: ["mail", "ubs", "cass"],
    connectionDescriptions: {
      mail: "Task updates trigger mail notifications",
      ubs: "Bug scanner results create blocking issues",
      cass: "Search prior sessions for task context",
    },
    stars: 1211,
    demoUrl: "https://dicklesworthstone.github.io/beads_viewer-pages/",
    projectSlug: "beads-viewer",
    features: [
      "9 graph metrics: PageRank, Betweenness, Critical Path",
      "Robot protocol (--robot-*) for AI-ready JSON",
      "60fps TUI rendering via Bubble Tea",
    ],
  },
  {
    id: "ubs",
    name: "Ultimate Bug Scanner",
    shortName: "UBS",
    href: "https://github.com/Dicklesworthstone/ultimate_bug_scanner",
    icon: "Bug",
    color: "from-orange-500 to-amber-600",
    tagline: "Pattern-based bug detection",
    connectsTo: ["bv", "slb"],
    connectionDescriptions: {
      bv: "Creates issues for discovered bugs",
      slb: "Validates code before risky commits",
    },
    stars: 152,
    projectSlug: "ultimate-bug-scanner",
    features: [
      "1,000+ custom detection patterns across languages",
      "Consistent JSON output for all languages",
      "Perfect for pre-commit hooks and CI/CD",
    ],
  },
  {
    id: "cm",
    name: "CASS Memory System",
    shortName: "CM",
    href: "https://github.com/Dicklesworthstone/cass_memory_system",
    icon: "Brain",
    color: "from-emerald-500 to-green-600",
    tagline: "Persistent memory across sessions",
    connectsTo: ["mail", "cass", "bv"],
    connectionDescriptions: {
      mail: "Stores conversation summaries for recall",
      cass: "Semantic search over stored memories",
      bv: "Remembers task patterns and solutions",
    },
    stars: 212,
    demoUrl: "https://dicklesworthstone.github.io/cass-memory-system-agent-mailbox-viewer/viewer/",
    projectSlug: "cass-memory-system",
    features: [
      "Three-layer cognitive: episodic, working, procedural memory",
      "MCP tools for cross-session context persistence",
      "Built on top of CASS for semantic search",
    ],
  },
  {
    id: "cass",
    name: "Coding Agent Session Search",
    shortName: "CASS",
    href: "https://github.com/Dicklesworthstone/coding_agent_session_search",
    icon: "Search",
    color: "from-cyan-500 to-sky-600",
    tagline: "Unified search across 11+ agent formats",
    connectsTo: ["cm", "ntm", "bv", "mail"],
    connectionDescriptions: {
      cm: "CM integrates CASS for memory retrieval",
      ntm: "Duplicate detection before broadcasting",
      bv: "Links search results to related tasks",
      mail: "Agents query history before asking colleagues",
    },
    stars: 446,
    projectSlug: "cass",
    features: [
      "11 formats: Claude Code, Codex, Cursor, Gemini, ChatGPT, Aider, etc.",
      "Sub-5ms cached search, hybrid semantic + keyword",
      "Multi-machine sync via SSH with path mapping",
    ],
  },
  {
    id: "acfs",
    name: "Flywheel Setup",
    shortName: "ACFS",
    href: "https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup",
    icon: "Cog",
    color: "from-blue-500 to-indigo-600",
    tagline: "One-command environment bootstrap",
    connectsTo: ["ntm", "mail", "dcg"],
    connectionDescriptions: {
      ntm: "Installs and configures NTM",
      mail: "Sets up Agent Mail MCP server",
      dcg: "Installs DCG safety hooks",
    },
    stars: 1006,
    projectSlug: "agentic-coding-flywheel-setup",
    features: [
      "30-minute zero-to-hero setup",
      "Installs Claude Code, Codex, Gemini CLI",
      "All flywheel tools pre-configured",
    ],
  },
  {
    id: "dcg",
    name: "Destructive Command Guard",
    shortName: "DCG",
    href: "https://github.com/Dicklesworthstone/destructive_command_guard",
    icon: "ShieldAlert",
    color: "from-red-600 to-orange-600",
    tagline: "Intercepts dangerous shell commands",
    connectsTo: ["slb", "ntm"],
    connectionDescriptions: {
      slb: "Works alongside SLB for layered command safety",
      ntm: "Guards all commands in NTM-managed sessions",
    },
    stars: 349,
    projectSlug: "destructive-command-guard",
    features: [
      "Intercepts rm -rf, git reset --hard, etc.",
      "SIMD-accelerated pattern matching",
      "Command audit logging",
    ],
  },
  {
    id: "ru",
    name: "Repo Updater",
    shortName: "RU",
    href: "https://github.com/Dicklesworthstone/repo_updater",
    icon: "RefreshCw",
    color: "from-teal-500 to-cyan-600",
    tagline: "Multi-repo sync in one command",
    connectsTo: ["ubs", "ntm"],
    connectionDescriptions: {
      ubs: "Run bug scans across all synced repos",
      ntm: "NTM integration for agent-driven sweeps",
    },
    stars: 49,
    features: [
      "One-command multi-repo sync",
      "Parallel operations with conflict detection",
      "AI code review integration",
    ],
  },
  {
    id: "giil",
    name: "Get Image from Internet Link",
    shortName: "GIIL",
    href: "https://github.com/Dicklesworthstone/giil",
    icon: "Image",
    color: "from-fuchsia-500 to-pink-600",
    tagline: "Download images from share links",
    connectsTo: ["mail", "cass"],
    connectionDescriptions: {
      mail: "Downloaded images can be referenced in Agent Mail",
      cass: "Image analysis sessions are searchable",
    },
    stars: 27,
    features: [
      "iCloud share link support",
      "CLI-based image download",
      "Works over SSH without GUI",
    ],
  },
  {
    id: "xf",
    name: "X Archive Search",
    shortName: "XF",
    href: "https://github.com/Dicklesworthstone/xf",
    icon: "Archive",
    color: "from-indigo-500 to-violet-600",
    tagline: "Ultra-fast X/Twitter archive search",
    connectsTo: ["cass", "cm"],
    connectionDescriptions: {
      cass: "Similar search architecture and patterns",
      cm: "Found tweets can become memories",
    },
    stars: 67,
    features: [
      "Sub-second search over large archives",
      "Semantic + keyword hybrid search",
      "Privacy-preserving local processing",
    ],
  },
  {
    id: "s2p",
    name: "Source to Prompt TUI",
    shortName: "s2p",
    href: "https://github.com/Dicklesworthstone/source_to_prompt_tui",
    icon: "FileCode",
    color: "from-lime-500 to-green-600",
    tagline: "Combine source files into LLM prompts",
    connectsTo: ["cass", "cm"],
    connectionDescriptions: {
      cass: "Generated prompts can be searched later",
      cm: "Effective prompts stored as memories",
    },
    stars: 13,
    features: [
      "Interactive file selection TUI",
      "Real-time token counting",
      "Gitignore-aware filtering",
    ],
  },
  {
    id: "ms",
    name: "Meta Skill",
    shortName: "MS",
    href: "https://github.com/Dicklesworthstone/meta_skill",
    icon: "Sparkles",
    color: "from-pink-500 to-rose-600",
    tagline: "Skill management with effectiveness tracking",
    connectsTo: ["cass", "cm", "bv"],
    connectionDescriptions: {
      cass: "One input source for skill extraction",
      cm: "Skills and CM memories are complementary layers",
      bv: "Graph analysis for skill dependency insights",
    },
    stars: 108,
    features: [
      "MCP server for native AI agent integration",
      "Thompson sampling optimizes suggestions",
      "Multi-layer security (ACIP, DCG, path policy)",
    ],
  },
];

// FAQ
export const faq: FaqItem[] = [
  {
    question: "When should I use Asupersync instead of Tokio?",
    answer: "Use Asupersync when correctness matters more than raw throughput. If you're building servers, pipelines, or systems where resource leaks, orphaned tasks, or silent cancellation failures would be bugs — Asupersync makes those bugs impossible by construction. Tokio is better for maximum single-server throughput where you're willing to handle cancellation safety manually.",
  },
  {
    question: "Can I use Tokio crates with Asupersync?",
    answer: "Not directly — Asupersync uses its own runtime and async primitives. However, we provide bridge adapters for common Tokio ecosystem crates. The built-in protocol library covers most needs (TCP, HTTP, channels, mutexes) with cancel-correctness guarantees that Tokio wrappers can't provide.",
  },
  {
    question: "How does performance compare to Tokio?",
    answer: "For I/O-bound workloads, Asupersync is within 5-15% of Tokio's throughput. The three-lane scheduler adds minimal overhead, and the cancel protocol only activates during actual cancellation. The Lab runtime (deterministic mode) is slower by design — it's for testing, not production.",
  },
  {
    question: "Is Asupersync production-ready?",
    answer: "Asupersync is currently in v0.2.x — suitable for new projects and experimentation, but not yet battle-tested at scale. The core runtime has 12 formal proofs and extensive property-based testing. We recommend it for greenfield projects where you want correctness guarantees from day one.",
  },
  {
    question: "What does 'cancel-correct' mean?",
    answer: "Cancel-correct means that when a task is cancelled, it always gets a chance to clean up (Drain phase), its finalizers always run (Finalize phase), and resources are never silently leaked. In Tokio, dropping a future just... stops it. Buffers may not flush. Connections may not close. Locks may not release. Asupersync makes this impossible.",
  },
  {
    question: "How does the Lab runtime find bugs?",
    answer: "The Lab runtime uses Dynamic Partial Order Reduction (DPOR) to systematically explore task interleavings. Given a concurrent program, it identifies which interleavings produce different outcomes and tests a representative subset. This is far more effective than random testing — it can find bugs that might take billions of random runs to hit.",
  },
  {
    question: "Do I need to learn a new async syntax?",
    answer: "No — Asupersync uses standard Rust async/await. The main difference is that your main function receives a Cx (capability context) parameter, and you use Region::open instead of bare task spawning. If you've used structured concurrency in Kotlin (coroutineScope) or Swift (TaskGroup), the patterns will feel familiar.",
  },
  {
    question: "What's the minimum Rust version?",
    answer: "Asupersync requires Rust 1.75+ for async trait support and RPITIT. We track stable Rust and don't require nightly features.",
  },
  {
    question: "What are Two-Phase Effects?",
    answer: "Two-Phase Effects split side effects into Reserve (stage the change, making it reversible) and Commit (apply it permanently). Think of a bank transfer: first, the money is placed on hold (Reserve). If the operation is cancelled before it finishes, the hold is simply released — no money lost. Only after a cancellation checkpoint confirms no cancel is pending does the transfer actually go through (Commit). This prevents the half-executed side-effects that plague traditional async runtimes.",
  },
  {
    question: "How does the spectral deadlock detector work?",
    answer: "Asupersync maintains a real-time wait-graph — a directed graph where edges mean 'task A is waiting on task B'. The runtime continuously computes the Fiedler value (second-smallest eigenvalue of the graph's Laplacian matrix). When this value drops near zero, the graph is about to split into disconnected components — the mathematical signature of an emerging deadlock. Think of it like a traffic congestion sensor: it detects gridlock forming before cars actually stop, letting the scheduler intervene proactively.",
  },
  {
    question: "What makes the formal semantics useful in practice?",
    answer: "The 35 small-step transition rules aren't just academic exercises — they're mechanized in Lean 4, which means a computer has verified they're logically consistent. This bridges the gap between the spec document (what Asupersync should do) and the runtime implementation (what it actually does). When a bug is found, the formal rules precisely identify whether it's a spec error or an implementation error. It also enables automated property-based testing: the Lab runtime generates random programs and checks that every execution trace conforms to the formal rules.",
  },
  {
    question: "How do the 17 test oracles work together?",
    answer: "Each oracle is an independent correctness monitor that watches for one specific class of bug during Lab testing. TaskLeak catches tasks that outlive their Region. ObligationLeak catches dropped Permits or Leases. CancelProtocol verifies the 3-phase shutdown is followed correctly. BudgetOverrun catches tasks that exceed their Drain budget. When you run a Lab test, all 17 oracles are active simultaneously — like having 17 specialized auditors reviewing every step of your concurrent program's execution.",
  },
  {
    question: "How does Macaroon-based capability attenuation work?",
    answer: "Capabilities in Asupersync are bearer tokens inspired by Google's Macaroons paper. The key property: anyone holding a capability can add restrictions (caveats) but can never remove them. When you delegate a capability to a child task, you can attenuate it — for example, adding a TimeBefore deadline, restricting it to a specific Region, limiting it to N uses, or applying a rate limit. There are 8 caveat predicates in total, including a Custom(key, value) escape hatch for application-specific restrictions. This means delegation is always safe: you can hand out capabilities freely, knowing they can only become more restricted, never less.",
  },
  {
    question: "What are E-processes and why do they matter for testing?",
    answer: "E-processes are a modern statistical technique (betting martingales) that let you continuously monitor a hypothesis and reject it the instant evidence is strong enough — without any penalty for 'peeking' at intermediate results. Traditional p-values require you to commit to a fixed sample size upfront. E-processes don't. The Lab runtime uses them to monitor three critical invariants (task leak, obligation leak, quiescence) during testing. Via Ville's inequality, if the E-value ever exceeds 1/α, you know with mathematical certainty that an invariant was violated — no matter when you checked.",
  },
  {
    question: "How does Saga compensation handle distributed failures?",
    answer: "When a multi-step operation spans several services (create account → send email → charge card), failure at any step triggers automatic LIFO compensation — unwinding completed steps in reverse order. What makes Asupersync's Saga engine special is CALM analysis: it classifies each of the 16 operation kinds as either monotone (coordination-free, like Reserve and Send) or non-monotone (barrier-required, like Commit and Release). Consecutive monotone steps are batched without synchronization, and barriers are inserted only before non-monotone steps. This minimizes coordination overhead while maintaining correctness.",
  },
  {
    question: "What is the Lyapunov potential function?",
    answer: "It's a 4-component 'energy measure' that the scheduler uses to formally prove the system always makes progress. The four components are: (1) live task count, (2) pending obligation age, (3) draining region count, and (4) deadline pressure. Like a ball rolling downhill, this function strictly decreases with each scheduler step — mathematically guaranteeing the runtime converges toward quiescence. The scheduler can tune the component weights: obligation-focused mode prioritizes clearing aged obligations, while deadline-focused mode prioritizes tasks approaching their deadlines.",
  },
];
