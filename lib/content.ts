// Site configuration
export const siteConfig = {
  name: "MCP Agent Mail",
  title: "MCP Agent Mail — Coordination Infrastructure For AI Coding Agents",
  description: "Git-auditable, SQLite-backed coordination fabric for multi-agent coding: inboxes, reservations, threads, search, and operator tooling.",
  url: "https://mcpagentmail.com",
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
  agentMail: string;
  gitWorktrees: string;
  sharedDocs: string;
  noCoordination: string;
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
    title: "Agent Identity & Discovery",
    description: "Agents get memorable persistent identities (GreenCastle, BlueLake) with project-scoped registration, program/model metadata, and automatic roster management. No more anonymous processes colliding in the dark.",
    icon: "blocks",
    category: "Identity",
  },
  {
    title: "Threaded Messaging",
    description: "Asynchronous, threaded conversations with subjects, recipients, CC/BCC, importance levels, and acknowledgment requirements. Messages stored in Git-backed archive, never consuming agent context windows.",
    icon: "activity",
    category: "Messaging",
  },
  {
    title: "Advisory File Reservations",
    description: "Agents declare exclusive or shared leases on file globs before editing. TTL-based expiration, pattern matching, and optional pre-commit guard enforcement prevent conflicts while remaining bypassable.",
    icon: "shield",
    category: "Coordination",
  },
  {
    title: "34 MCP Tools in 9 Clusters",
    description: "Infrastructure, Identity, Messaging, Contacts, File Reservations, Search, Macros, Product Bus, and Build Slots. Every coordination primitive exposed via the Model Context Protocol standard.",
    icon: "cpu",
    category: "MCP Surface",
  },
  {
    title: "Hybrid Search (V3)",
    description: "Two-tier fusion combining lexical and semantic search with reranking. Field-based filters (subject:, body:, from:), cross-project search via product bus, and relevance scoring built on frankensearch.",
    icon: "sparkles",
    category: "Search",
  },
  {
    title: "15-Screen Operations TUI",
    description: "Real-time dashboard, message browser, thread explorer, agent roster, unified search, reservation manager, tool metrics, system health, timeline views, contact graph, and more. Five themes including Cyberpunk Aurora.",
    icon: "activity",
    category: "Operator Tooling",
  },
  {
    title: "Git-Backed Audit Trail",
    description: "Every message, reservation, and agent profile stored as files in per-project Git repositories. Human-auditable, diffable, fully recoverable. Date-partitioned messages with advisory locking for safe concurrent access.",
    icon: "lock",
    category: "Storage",
  },
  {
    title: "Cross-Repository Coordination",
    description: "Product bus links multiple repositories. Contact handshake protocol enables inter-project messaging. Shared thread IDs and contact policy management across your entire codebase.",
    icon: "globe",
    category: "Multi-Project",
  },
  {
    title: "Robot Mode CLI",
    description: "16 non-interactive subcommands optimized for agent consumption. Token-efficient output in toon, JSON, or Markdown formats. Status, inbox, timeline, search, reservations, metrics, and health at your fingertips.",
    icon: "cpu",
    category: "CLI",
  },
  {
    title: "Pre-Commit Guard",
    description: "Git hook (mcp-agent-mail-guard) blocks commits touching files reserved by other agents. Prevents accidental conflicts while remaining bypassable with AGENT_MAIL_BYPASS=1 for emergencies.",
    icon: "shield",
    category: "Coordination",
  },
  {
    title: "Build Slot Management",
    description: "Acquire, renew, and release build slots to control compilation concurrency across agents. Prevents resource contention on shared build infrastructure.",
    icon: "activity",
    category: "Resource Management",
  },
  {
    title: "Four Session Macros",
    description: "macro_start_session bootstraps project + agent + inbox in one call. macro_prepare_thread joins existing conversations. macro_file_reservation_cycle manages reserve-work-release flows. macro_contact_handshake sets up cross-agent contacts.",
    icon: "sparkles",
    category: "Developer Experience",
  },
  {
    title: "20+ MCP Resources",
    description: "Fast lookup surfaces for inbox, threads, agents, reservations, metrics, and health \u2014 all accessible without tool calls. resource://inbox/{Agent}, resource://thread/{id}, and more.",
    icon: "globe",
    category: "MCP Surface",
  },
  {
    title: "Web UI for Human Oversight",
    description: "Unified inbox across all projects, agent roster views, message detail with attachments, search with field filters, and an Overseer compose form for sending high-priority messages to redirect agents mid-session.",
    icon: "blocks",
    category: "Operator Tooling",
  },
  {
    title: "Stress-Tested at Scale",
    description: "30-agent message pipelines, 10-project concurrent ops, pool exhaustion recovery, thundering herd handling, sustained 49 RPS mixed workloads. Every scenario passes with zero errors in the stress gauntlet.",
    icon: "lock",
    category: "Reliability",
  },
  {
    title: "12-Crate Rust Architecture",
    description: "Modular workspace: core, db, storage, search-core, guard, share, tools, server, CLI, conformance, and WASM. Built on asupersync (structured concurrency), frankensearch, frankentui, and fastmcp_rust.",
    icon: "cpu",
    category: "Architecture",
  },
];

// Comparison data
export interface AgentMailComparisonRow {
  feature: string;
  agentMail: string;
  gitWorktrees: string;
  sharedDocs: string;
  noCoordination: string;
}

export const comparisonData: AgentMailComparisonRow[] = [
  { feature: "Agent Identity", agentMail: "Persistent, project-scoped", gitWorktrees: "None", sharedDocs: "Manual naming", noCoordination: "None" },
  { feature: "Messaging", agentMail: "Threaded + searchable", gitWorktrees: "None", sharedDocs: "Append-only files", noCoordination: "None" },
  { feature: "File Conflict Prevention", agentMail: "Advisory reservations + guard", gitWorktrees: "Isolated branches", sharedDocs: "None", noCoordination: "None" },
  { feature: "Audit Trail", agentMail: "Git + SQLite", gitWorktrees: "Git history only", sharedDocs: "File history", noCoordination: "None" },
  { feature: "Cross-Project Coordination", agentMail: "Product bus", gitWorktrees: "None", sharedDocs: "None", noCoordination: "None" },
  { feature: "Search", agentMail: "Hybrid lexical + semantic", gitWorktrees: "Git log", sharedDocs: "Text search", noCoordination: "None" },
  { feature: "Operator Visibility", agentMail: "15-screen TUI + Web UI", gitWorktrees: "Git log", sharedDocs: "File browser", noCoordination: "None" },
  { feature: "MCP Integration", agentMail: "34 tools + 20 resources", gitWorktrees: "None", sharedDocs: "None", noCoordination: "None" },
  { feature: "Agent Discovery", agentMail: "Auto-detect + register", gitWorktrees: "Manual", sharedDocs: "Manual", noCoordination: "Manual" },
  { feature: "Acknowledgments", agentMail: "Built-in ack protocol", gitWorktrees: "None", sharedDocs: "None", noCoordination: "None" },
  { feature: "Build Concurrency", agentMail: "Build slot management", gitWorktrees: "None", sharedDocs: "None", noCoordination: "Race conditions" },
  { feature: "Stress Tested", agentMail: "10/10 gauntlet (30 agents)", gitWorktrees: "N/A", sharedDocs: "N/A", noCoordination: "N/A" },
];

// Code example: Agent Mail session bootstrap
export const codeExample = `# Start the MCP Agent Mail server with TUI
am

# Bootstrap a session in one call (project + agent + inbox)
macro_start_session(
  human_key="/abs/path/to/repo",
  program="claude-code",
  model="opus-4.6",
  task_description="Implementing auth module"
)
# Returns: { project, agent, file_reservations, inbox }

# Reserve files before editing
file_reservation_paths(
  project_key="/abs/path/to/repo",
  agent_name="GreenCastle",
  paths=["src/auth/**/*.ts", "src/middleware/auth.ts"],
  ttl_seconds=3600,
  exclusive=true,
  reason="bd-123"
)

# Coordinate through threaded messages
send_message(
  project_key="/abs/path/to/repo",
  sender_name="GreenCastle",
  to=["BlueLake"],
  subject="[bd-123] Starting auth refactor",
  body_md="Reserved src/auth/**. Taking login + token rotation.",
  thread_id="bd-123",
  ack_required=true
)`;

// Second code example: Robot Mode CLI
export const codeExampleRobot = `# Check system status (agent-optimized output)
am robot status --format toon

# Read inbox with priority ordering
am robot inbox --format json --agent GreenCastle

# Search across all messages
am robot search --format json "auth refactor"

# View full thread conversation
am robot thread --format md bd-123

# Check file reservations and TTL warnings
am robot reservations --format json

# System health diagnostics
am robot health --format json`;

// Third code example: Cross-project coordination
export const codeExampleCrossProject = `# Link two projects via product bus
ensure_product(
  product_key="my-platform",
  project_keys=["/path/to/frontend", "/path/to/backend"]
)

# Set up cross-project contacts
macro_contact_handshake(
  from_project="/path/to/frontend",
  from_agent="GreenCastle",
  to_project="/path/to/backend",
  to_agent="BlueLake"
)

# Send cross-project message
send_message(
  project_key="/path/to/frontend",
  sender_name="GreenCastle",
  to=["BlueLake@backend"],
  subject="API contract change",
  body_md="Updated /api/auth/login response shape. See PR #42.",
  thread_id="API-MIGRATION"
)`;

// Changelog
export const changelog: ChangelogEntry[] = [
  {
    period: "Phase 1",
    title: "Python Foundation (1,700+ stars)",
    items: [
      "Built original MCP Agent Mail in Python with SQLite storage",
      "Designed agent identity, messaging, and file reservation primitives",
      "Achieved 1,700+ GitHub stars and broad community adoption",
      "Identified scalability bottlenecks: Git lock contention, SQLite pool exhaustion",
    ],
  },
  {
    period: "Phase 2",
    title: "Rust Ground-Up Rewrite",
    items: [
      "12-crate modular workspace architecture with zero unsafe code",
      "Built on asupersync for structured async concurrency",
      "SQLite WAL mode with connection pooling and PRAGMA tuning",
      "Git-backed archive with commit coalescing (9x reduction)",
    ],
  },
  {
    period: "Phase 3",
    title: "MCP Surface & Search V3",
    items: [
      "Implemented 34 MCP tools across 9 clusters via fastmcp_rust",
      "Added 20+ MCP resources for fast agent-discoverable lookups",
      "Built hybrid search with two-tier fusion and reranking on frankensearch",
      "Cross-project coordination via product bus and contact handshakes",
    ],
  },
  {
    period: "Phase 4",
    title: "Operations Console & CLI",
    items: [
      "15-screen TUI built on frankentui with 5 themes",
      "Robot mode: 16 non-interactive subcommands for agent consumption",
      "Web UI for human oversight with Overseer compose form",
      "Pre-commit guard integration for reservation enforcement",
    ],
  },
  {
    period: "Phase 5",
    title: "Stress Testing & Production Hardening",
    items: [
      "10-scenario stress gauntlet: 30-agent pipelines, pool exhaustion, thundering herd",
      "Sustained ~49 RPS with 1,494 ops in 30s mixed workloads",
      "Commit coalescer achieving 9.1x write reduction",
      "Cross-platform installers for Linux, macOS, and Windows",
    ],
  },
];

// Glossary terms (alphabetically ordered)
export const glossaryTerms: GlossaryTerm[] = [
  { term: "Acknowledgment", short: "Confirmation that a message was received", long: "When a message is sent with ack_required=true, the recipient agent must explicitly acknowledge receipt. The system tracks ack status and can surface overdue acknowledgments to operators." },
  { term: "Advisory Lock", short: "Non-blocking coordination signal", long: "File reservations in Agent Mail are advisory \u2014 they surface conflicts and enable the pre-commit guard, but they can always be bypassed. This prevents deadlocks while still making ownership visible." },
  { term: "Agent Identity", short: "Memorable persistent name for an agent", long: "Each agent gets an adjective+noun identity (GreenCastle, BlueLake, RedHarbor) that persists across sessions. Identities are project-scoped and carry program/model metadata for context." },
  { term: "Agent Mail", short: "Coordination infrastructure for AI coding agents", long: "MCP Agent Mail provides the full operational fabric for multi-agent coding: identities, threaded messaging, file reservations, search, audit trails, and operator tooling \u2014 all backed by SQLite + Git." },
  { term: "Build Slot", short: "Concurrency control for compilation", long: "A lease that controls how many agents can run resource-intensive operations (like cargo build) simultaneously. Agents acquire, renew, and release build slots to prevent contention." },
  { term: "Commit Coalescer", short: "Batches Git commits for efficiency", long: "Instead of creating a Git commit for every write operation, the storage layer batches multiple writes into fewer commits. Stress tests show a 9.1x reduction (100 writes \u2192 11 commits)." },
  { term: "Contact Handshake", short: "Protocol for establishing cross-agent communication", long: "Before agents in different projects can message each other, they perform a contact handshake: request_contact sends the invitation, respond_contact accepts or denies. Contact policies can auto-accept or block by default." },
  { term: "Exclusive Reservation", short: "Sole ownership of files during editing", long: "When an agent reserves files with exclusive=true, no other agent can reserve overlapping paths until the reservation expires or is released. The pre-commit guard enforces this at commit time." },
  { term: "File Reservation", short: "Advisory lease on file paths", long: "An agent declares intent to edit specific file patterns (globs like src/auth/**/*.ts) for a given TTL. Other agents see the reservation and can coordinate accordingly. Conflicts are surfaced but not hard-blocked." },
  { term: "Human Overseer", short: "Web UI for operator intervention", long: "The web interface at localhost:8765/mail allows humans to compose and send high-priority messages to agents, view all inboxes, search messages, and monitor file reservations across projects." },
  { term: "Inbox", short: "Per-agent message queue", long: "Each registered agent has a project-scoped inbox where incoming messages are delivered. Agents fetch their inbox via fetch_inbox or the resource://inbox/{agent} MCP resource." },
  { term: "Macro", short: "Multi-step MCP operation in one call", long: "Agent Mail provides four macros that combine common multi-tool workflows into single calls: macro_start_session, macro_prepare_thread, macro_file_reservation_cycle, and macro_contact_handshake." },
  { term: "MCP", short: "Model Context Protocol", long: "An open standard for connecting AI models to external tools and data sources. Agent Mail exposes its 34 tools and 20+ resources via MCP, making it compatible with any MCP-capable coding agent." },
  { term: "MCP Resource", short: "Read-only data surface discoverable by agents", long: "Unlike tools (which perform actions), MCP resources provide fast read access to data: resource://inbox/{agent}, resource://thread/{id}, resource://agents, etc. No tool call overhead." },
  { term: "Pre-Commit Guard", short: "Git hook enforcing file reservations", long: "The mcp-agent-mail-guard binary installs as a Git pre-commit hook. It checks whether committed files overlap with another agent\u2019s active reservations and blocks the commit if so. Bypassable with AGENT_MAIL_BYPASS=1." },
  { term: "Product Bus", short: "Cross-repository coordination layer", long: "Links multiple Git repositories under a single product umbrella. Enables cross-project search, unified inbox aggregation, and inter-project contact management." },
  { term: "Project Key", short: "Absolute path identifying a repository", long: "The canonical identifier for a project in Agent Mail \u2014 the absolute filesystem path to the repository root. Used in all tool calls and resource URIs." },
  { term: "Robot Mode", short: "Non-interactive CLI for agent consumption", long: "The \u2018am robot\u2019 subcommand provides 16 commands (status, inbox, timeline, thread, search, etc.) that output token-efficient toon, JSON, or Markdown. Designed for agent consumption, not human interaction." },
  { term: "Shared Reservation", short: "Non-exclusive file access declaration", long: "When an agent reserves files with exclusive=false, other agents can also create overlapping reservations. Useful for read-heavy access patterns where coordination is desired but exclusivity isn\u2019t required." },
  { term: "Stress Gauntlet", short: "10-scenario production readiness test suite", long: "A comprehensive stress test suite covering: 30-agent message pipelines, 10-project concurrent ops, commit coalescer batching, stale lock recovery, mixed reservations + messages, pool exhaustion, sustained throughput, thundering herd, and inbox reads during storms." },
  { term: "Thread", short: "Conversation grouping by thread_id", long: "Messages sharing the same thread_id form a conversation thread. Threads enable context-aware communication \u2014 agents can review the full conversation history before replying. Thread IDs often map to bead/issue IDs (e.g., bd-123)." },
  { term: "Tool Cluster", short: "Logical grouping of MCP tools", long: "Agent Mail\u2019s 34 tools are organized into 9 clusters: Infrastructure, Identity, Messaging, Contacts, File Reservations, Search, Macros, Product Bus, and Build Slots. Each cluster handles a distinct coordination concern." },
  { term: "Toon Format", short: "Token-efficient robot output format", long: "The default output format for robot mode at a TTY. Compact, human-scannable, and designed to minimize token consumption when agents parse the output. Alternative formats: json and md." },
  { term: "TTL", short: "Time-to-live for reservations", long: "File reservations and build slots expire after their TTL (default 3600 seconds). Agents can renew before expiration. Expired reservations are automatically cleaned up, preventing stale locks." },
  { term: "TUI", short: "Terminal User Interface operations console", long: "A 15-screen interactive terminal interface built on frankentui. Provides real-time dashboards, message browsing, thread exploration, agent roster, search, reservation management, and system health monitoring." },
  { term: "Web UI", short: "Browser-based operator interface", long: "Served at http://127.0.0.1:8765/mail, the web interface provides unified inbox, project overview, message details, search, file reservations, and the Human Overseer compose form for sending messages to agents." },
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
  subtitle: "A high-velocity AI engineering ecosystem that built Agent Mail.",
  description: "Agent Mail wasn't built manually. It was architected and implemented through a recursive feedback loop of specialized AI agents, each coordinating through the very system they were building.",
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
    question: "When should I use Agent Mail instead of git worktrees?",
    answer: "Use Agent Mail when multiple agents need to work on the same branch simultaneously. Git worktrees isolate agents completely, which prevents conflicts but also prevents coordination. Agent Mail gives agents shared visibility into who's working on what, advisory file reservations, and threaded messaging \u2014 enabling real collaboration rather than just isolation.",
  },
  {
    question: "Does Agent Mail work with Claude Code, Codex, and Gemini?",
    answer: "Yes. Running 'am' auto-detects all installed coding agents (Claude Code, Codex CLI, Gemini CLI, GitHub Copilot CLI) and configures their MCP connections. Agents communicate through the MCP standard, so any MCP-capable coding agent can use Agent Mail.",
  },
  {
    question: "Are file reservations mandatory locks?",
    answer: "No \u2014 they are advisory coordination primitives. Reservations surface conflicts and enable the optional pre-commit guard, but they can always be bypassed with AGENT_MAIL_BYPASS=1. This prevents deadlocks while still making file ownership visible.",
  },
  {
    question: "How does the pre-commit guard work?",
    answer: "The mcp-agent-mail-guard binary installs as a Git pre-commit hook. When you commit, it checks whether any committed files overlap with another agent's active reservations. If they do, the commit is blocked with a clear conflict message. You can bypass it with AGENT_MAIL_BYPASS=1 or set AGENT_MAIL_GUARD_MODE=warn for warning-only mode.",
  },
  {
    question: "How does Agent Mail prevent message history from filling up context windows?",
    answer: "Messages are stored externally in SQLite (for query speed) and Git (for audit trails). Agents only fetch what they need via fetch_inbox or search_messages. The full conversation history lives outside agent context windows, so agents can coordinate across thousands of messages without consuming tokens.",
  },
  {
    question: "Can Agent Mail coordinate across multiple repositories?",
    answer: "Yes. The product bus links multiple repositories under a single umbrella. Agents in different repos can discover each other via contact handshakes, exchange messages across project boundaries, and search across all linked projects.",
  },
  {
    question: "What happens when a reservation expires?",
    answer: "Reservations have a TTL (default 3600 seconds). When the TTL expires, the reservation is automatically cleaned up and other agents can reserve the same files. Agents can renew reservations before expiration to extend their work window.",
  },
  {
    question: "How is Agent Mail different from the Python version?",
    answer: "The Rust rewrite is a ground-up reimplementation that eliminates the Python version's scalability bottlenecks: Git lock contention, SQLite pool exhaustion, and GIL limitations. The Rust version adds hybrid search (V3), a 15-screen TUI, robot mode CLI, build slot management, and passes a 10-scenario stress gauntlet including 30-agent pipelines and sustained 49 RPS workloads.",
  },
  {
    question: "How do I monitor what my agents are doing?",
    answer: "Three ways: (1) The 15-screen TUI provides real-time dashboards, message browsing, thread exploration, and system health monitoring. (2) The web UI at localhost:8765/mail gives browser-based oversight with inbox, search, and the Human Overseer compose form. (3) Robot mode (am robot status) provides machine-readable output for automation.",
  },
  {
    question: "What is the stress gauntlet?",
    answer: "A 10-scenario test suite that validates production readiness: 30-agent message pipelines, 10-project concurrent operations, commit coalescer efficiency, stale Git lock recovery, mixed reservation + messaging loads, connection pool exhaustion recovery, sustained 30-second throughput, thundering herd handling, and inbox reads during message storms. All scenarios pass with zero errors.",
  },
];
