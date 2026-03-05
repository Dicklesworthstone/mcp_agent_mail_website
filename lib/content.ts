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
  { href: "/showcase", label: "Showcase" },
  { href: "/architecture", label: "Architecture" },
  { href: "/spec-explorer", label: "Spec Explorer" },
  { href: "/getting-started", label: "Get Started" },
  { href: "/glossary", label: "Glossary" },
];

export interface RouteScaffoldSection {
  id: string;
  description: string;
}

export interface RouteScaffold {
  route: string;
  label: string;
  sections: RouteScaffoldSection[];
}

// Canonical route scaffold map used for composition + test invariants.
export const routeScaffolds: RouteScaffold[] = [
  {
    route: "/",
    label: "Home",
    sections: [
      { id: "home-hero", description: "Primary value proposition + hero media" },
      { id: "home-proof-strip", description: "At-a-glance trust metrics" },
      { id: "home-concepts", description: "Interactive conceptual deep-dive" },
      { id: "features", description: "Core feature grid" },
      { id: "comparison", description: "Comparative positioning table" },
      { id: "code", description: "Quickstart/API proof snippet" },
      { id: "architecture-preview", description: "Architecture teaser + timeline" },
      { id: "home-cta", description: "Primary conversion CTA" },
      { id: "flywheel", description: "Ecosystem/flywheel module" },
    ],
  },
  {
    route: "/showcase",
    label: "Showcase",
    sections: [
      { id: "showcase-hero", description: "Gallery framing + orientation" },
      { id: "showcase-viz-gallery", description: "Visualization section stack" },
    ],
  },
  {
    route: "/architecture",
    label: "Architecture",
    sections: [
      { id: "architecture-hero", description: "Architecture framing + summary" },
      { id: "overview", description: "System overview diagram" },
      { id: "regions", description: "Structured execution model" },
      { id: "cancel", description: "Cancel protocol model" },
      { id: "architecture-next-steps", description: "Navigation CTAs" },
    ],
  },
  {
    route: "/getting-started",
    label: "Getting Started",
    sections: [
      { id: "getting-started-hero", description: "Onboarding framing" },
      { id: "install", description: "Install command block" },
      { id: "example", description: "First operational workflow" },
      { id: "config", description: "MCP configuration snippet" },
      { id: "pillars", description: "Operational principles" },
      { id: "faq", description: "Setup troubleshooting FAQ" },
      { id: "getting-started-next-steps", description: "Progression CTAs" },
    ],
  },
  {
    route: "/glossary",
    label: "Glossary",
    sections: [
      { id: "glossary-hero", description: "Glossary context + scope" },
      { id: "glossary-search", description: "Term search controls" },
      { id: "glossary-index", description: "Virtualized term list" },
      { id: "glossary-empty-state", description: "No-results fallback" },
      { id: "glossary-faq-placeholder", description: "Reserved slot for glossary-adjacent FAQ module" },
    ],
  },
  {
    route: "/spec-explorer",
    label: "Spec Explorer",
    sections: [
      { id: "spec-explorer-hero", description: "Spec explorer framing + expectations" },
      { id: "spec-explorer-shell", description: "Search/index/reader shell" },
      { id: "spec-explorer-workspace", description: "Responsive document workspace" },
    ],
  },
];

// Types
export interface Stat {
  id: string;
  label: string;
  value: string;
  helper?: string;
}

export interface Feature {
  id: string;
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
  id: string;
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
  { id: "mcp-tools", label: "MCP Tools", value: "34", helper: "Coordination primitives across messaging/search/reservations" },
  { id: "resources", label: "Resources", value: "20+", helper: "Agent-discoverable resource surfaces" },
  { id: "stress-gauntlet", label: "Stress Gauntlet", value: "10/10", helper: "Representative high-load scenarios passed" },
  { id: "throughput", label: "Sustained Throughput", value: "~49 RPS", helper: "HTTP stress profile baseline (context-dependent)" },
];

// Features
export const features: Feature[] = [
  {
    id: "agent-identity-discovery",
    title: "Agent Identity & Discovery",
    description: "Agents get memorable persistent identities (GreenCastle, BlueLake) with project-scoped registration, program/model metadata, and automatic roster management. No more anonymous processes colliding in the dark.",
    icon: "blocks",
    category: "Identity",
  },
  {
    id: "threaded-messaging",
    title: "Threaded Messaging",
    description: "Asynchronous, threaded conversations with subjects, recipients, CC/BCC, importance levels, and acknowledgment requirements. Messages stored in Git-backed archive, never consuming agent context windows.",
    icon: "activity",
    category: "Messaging",
  },
  {
    id: "advisory-file-reservations",
    title: "Advisory File Reservations",
    description: "Agents declare exclusive or shared leases on file globs before editing. TTL-based expiration, pattern matching, and optional pre-commit guard enforcement prevent conflicts while remaining bypassable.",
    icon: "shield",
    category: "Coordination",
  },
  {
    id: "mcp-tools-clusters",
    title: "34 MCP Tools in 9 Clusters",
    description: "Infrastructure, Identity, Messaging, Contacts, File Reservations, Search, Macros, Product Bus, and Build Slots. Every coordination primitive exposed via the Model Context Protocol standard.",
    icon: "cpu",
    category: "MCP Surface",
  },
  {
    id: "hybrid-search-v3",
    title: "Hybrid Search (V3)",
    description: "Two-tier fusion combining lexical and semantic search with reranking. Field-based filters (subject:, body:, from:), cross-project search via product bus, and relevance scoring built on frankensearch.",
    icon: "sparkles",
    category: "Search",
  },
  {
    id: "tui-operations-console",
    title: "15-Screen Operations TUI",
    description: "Real-time dashboard, message browser, thread explorer, agent roster, unified search, reservation manager, tool metrics, system health, timeline views, contact graph, and more. Five themes including Cyberpunk Aurora.",
    icon: "activity",
    category: "Operator Tooling",
  },
  {
    id: "git-audit-trail",
    title: "Git-Backed Audit Trail",
    description: "Every message, reservation, and agent profile stored as files in per-project Git repositories. Human-auditable, diffable, fully recoverable. Date-partitioned messages with advisory locking for safe concurrent access.",
    icon: "lock",
    category: "Storage",
  },
  {
    id: "cross-repo-coordination",
    title: "Cross-Repository Coordination",
    description: "Product bus links multiple repositories. Contact handshake protocol enables inter-project messaging. Shared thread IDs and contact policy management across your entire codebase.",
    icon: "globe",
    category: "Multi-Project",
  },
  {
    id: "robot-mode-cli",
    title: "Robot Mode CLI",
    description: "16 non-interactive subcommands optimized for agent consumption. Token-efficient output in toon, JSON, or Markdown formats. Status, inbox, timeline, search, reservations, metrics, and health at your fingertips.",
    icon: "cpu",
    category: "CLI",
  },
  {
    id: "pre-commit-guard",
    title: "Pre-Commit Guard",
    description: "Git hook (mcp-agent-mail-guard) blocks commits touching files reserved by other agents. Prevents accidental conflicts while remaining bypassable with AGENT_MAIL_BYPASS=1 for emergencies.",
    icon: "shield",
    category: "Coordination",
  },
  {
    id: "build-slot-management",
    title: "Build Slot Management",
    description: "Acquire, renew, and release build slots to control compilation concurrency across agents. Prevents resource contention on shared build infrastructure.",
    icon: "activity",
    category: "Resource Management",
  },
  {
    id: "session-macros",
    title: "Four Session Macros",
    description: "macro_start_session bootstraps project + agent + inbox in one call. macro_prepare_thread joins existing conversations. macro_file_reservation_cycle manages reserve-work-release flows. macro_contact_handshake sets up cross-agent contacts.",
    icon: "sparkles",
    category: "Developer Experience",
  },
  {
    id: "mcp-resources",
    title: "20+ MCP Resources",
    description: "Fast lookup surfaces for inbox, threads, agents, reservations, metrics, and health \u2014 all accessible without tool calls. resource://inbox/{Agent}, resource://thread/{id}, and more.",
    icon: "globe",
    category: "MCP Surface",
  },
  {
    id: "web-ui-overseer",
    title: "Web UI for Human Oversight",
    description: "Unified inbox across all projects, agent roster views, message detail with attachments, search with field filters, and an Overseer compose form for sending high-priority messages to redirect agents mid-session.",
    icon: "blocks",
    category: "Operator Tooling",
  },
  {
    id: "stress-tested-scale",
    title: "Stress-Tested at Scale",
    description: "30-agent message pipelines, 10-project concurrent ops, pool exhaustion recovery, thundering herd handling, sustained 49 RPS mixed workloads. Every scenario passes with zero errors in the stress gauntlet.",
    icon: "lock",
    category: "Reliability",
  },
  {
    id: "rust-workspace-architecture",
    title: "12-Crate Rust Architecture",
    description: "Modular workspace: core, db, storage, search-core, guard, share, tools, server, CLI, conformance, and WASM. Built on Tokio, frankensearch, frankentui, and fastmcp_rust.",
    icon: "cpu",
    category: "Architecture",
  },
];

// Comparison data
export interface AgentMailComparisonRow {
  id: string;
  feature: string;
  agentMail: string;
  gitWorktrees: string;
  sharedDocs: string;
  noCoordination: string;
}

export type ComparisonStatus = "positive" | "partial" | "negative";

export const comparisonStatusByValue: Record<string, ComparisonStatus> = {
  "Persistent, project-scoped": "positive",
  "Threaded + searchable": "positive",
  "Advisory reservations + guard": "positive",
  "Git + SQLite": "positive",
  "Product bus": "positive",
  "Hybrid lexical + semantic": "positive",
  "15-screen TUI + Web UI": "positive",
  "34 tools + 20 resources": "positive",
  "Auto-detect + register": "positive",
  "Built-in ack protocol": "positive",
  "Build slot management": "positive",
  "10/10 gauntlet (30 agents)": "positive",
  "Isolated branches": "partial",
  "Git history only": "partial",
  "Git log": "partial",
  "File history": "partial",
  "File browser": "partial",
  "Text search": "partial",
  "Append-only files": "partial",
  "Manual naming": "partial",
  "None": "negative",
  "Manual": "negative",
  "N/A": "negative",
  "Race conditions": "negative",
};

export const comparisonData: AgentMailComparisonRow[] = [
  { id: "agent-identity", feature: "Agent Identity", agentMail: "Persistent, project-scoped", gitWorktrees: "None", sharedDocs: "Manual naming", noCoordination: "None" },
  { id: "messaging", feature: "Messaging", agentMail: "Threaded + searchable", gitWorktrees: "None", sharedDocs: "Append-only files", noCoordination: "None" },
  { id: "file-conflict-prevention", feature: "File Conflict Prevention", agentMail: "Advisory reservations + guard", gitWorktrees: "Isolated branches", sharedDocs: "None", noCoordination: "None" },
  { id: "audit-trail", feature: "Audit Trail", agentMail: "Git + SQLite", gitWorktrees: "Git history only", sharedDocs: "File history", noCoordination: "None" },
  { id: "cross-project-coordination", feature: "Cross-Project Coordination", agentMail: "Product bus", gitWorktrees: "None", sharedDocs: "None", noCoordination: "None" },
  { id: "search", feature: "Search", agentMail: "Hybrid lexical + semantic", gitWorktrees: "Git log", sharedDocs: "Text search", noCoordination: "None" },
  { id: "operator-visibility", feature: "Operator Visibility", agentMail: "15-screen TUI + Web UI", gitWorktrees: "Git log", sharedDocs: "File browser", noCoordination: "None" },
  { id: "mcp-integration", feature: "MCP Integration", agentMail: "34 tools + 20 resources", gitWorktrees: "None", sharedDocs: "None", noCoordination: "None" },
  { id: "agent-discovery", feature: "Agent Discovery", agentMail: "Auto-detect + register", gitWorktrees: "Manual", sharedDocs: "Manual", noCoordination: "Manual" },
  { id: "acknowledgments", feature: "Acknowledgments", agentMail: "Built-in ack protocol", gitWorktrees: "None", sharedDocs: "None", noCoordination: "None" },
  { id: "build-concurrency", feature: "Build Concurrency", agentMail: "Build slot management", gitWorktrees: "None", sharedDocs: "None", noCoordination: "Race conditions" },
  { id: "stress-tested", feature: "Stress Tested", agentMail: "10/10 gauntlet (30 agents)", gitWorktrees: "N/A", sharedDocs: "N/A", noCoordination: "N/A" },
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

export interface ToolClusterCopy {
  id: string;
  cluster: string;
  purpose: string;
  whenToUse: string;
  representativeTools: string[];
}

export interface ResourceSurfaceCopy {
  id: string;
  uriPattern: string;
  purpose: string;
  operatorValue: string;
}

export interface TuiScreenCopy {
  id: string;
  screen: string;
  coreQuestion: string;
  primarySignals: string[];
}

export interface RobotCommandTrackCopy {
  id: string;
  track: string;
  objective: string;
  commandExamples: string[];
}

export const toolClusterCopy: ToolClusterCopy[] = [
  {
    id: "cluster-infrastructure",
    cluster: "Infrastructure",
    purpose: "Bootstrap project context, health checks, and server lifecycle visibility.",
    whenToUse: "Use first when an agent joins a repo or diagnostics indicate environment drift.",
    representativeTools: ["health_check", "ensure_project", "macro_start_session"],
  },
  {
    id: "cluster-identity",
    cluster: "Identity",
    purpose: "Create or update persistent agent identities and profile metadata.",
    whenToUse: "Use before sending mail or reserving files so actions are attributable.",
    representativeTools: ["register_agent", "create_agent_identity", "whois"],
  },
  {
    id: "cluster-messaging",
    cluster: "Messaging",
    purpose: "Coordinate work asynchronously with durable, threaded, auditable messages.",
    whenToUse: "Use for handoffs, blockers, design decisions, and escalation paths.",
    representativeTools: ["send_message", "reply_message", "fetch_inbox", "acknowledge_message"],
  },
  {
    id: "cluster-contacts",
    cluster: "Contacts",
    purpose: "Control who can message whom across teams and projects.",
    whenToUse: "Use when adding a new collaborator edge or enforcing contact policy.",
    representativeTools: ["request_contact", "respond_contact", "set_contact_policy"],
  },
  {
    id: "cluster-file-reservations",
    cluster: "File Reservations",
    purpose: "Advertise file ownership intent and avoid stepping on parallel edits.",
    whenToUse: "Use before starting edits and renew/release throughout execution.",
    representativeTools: ["file_reservation_paths", "renew_file_reservations", "release_file_reservations"],
  },
  {
    id: "cluster-search",
    cluster: "Search",
    purpose: "Recover context rapidly from message history and thread archives.",
    whenToUse: "Use before asking teammates for status and before planning new work.",
    representativeTools: ["search_messages", "summarize_thread", "search_messages_product"],
  },
  {
    id: "cluster-macros",
    cluster: "Macros",
    purpose: "Collapse common multi-step workflows into one predictable tool call.",
    whenToUse: "Use when optimizing token budget or reducing orchestration mistakes.",
    representativeTools: ["macro_start_session", "macro_prepare_thread", "macro_file_reservation_cycle", "macro_contact_handshake"],
  },
  {
    id: "cluster-product-bus",
    cluster: "Product Bus",
    purpose: "Link multiple repos under one product-level coordination surface.",
    whenToUse: "Use when architecture spans multiple services/repos with shared releases.",
    representativeTools: ["ensure_product", "products_link", "fetch_inbox_product"],
  },
  {
    id: "cluster-build-slots",
    cluster: "Build Slots",
    purpose: "Throttle expensive builds/tests to prevent CI or machine contention.",
    whenToUse: "Use on shared runners or large swarms doing parallel compile-heavy work.",
    representativeTools: ["acquire_build_slot", "renew_build_slot", "release_build_slot"],
  },
];

export const resourceSurfaceCopy: ResourceSurfaceCopy[] = [
  {
    id: "resource-inbox",
    uriPattern: "resource://inbox/{agent}",
    purpose: "Read latest inbox messages without issuing tool calls.",
    operatorValue: "Fast pull-based coordination with low token overhead.",
  },
  {
    id: "resource-thread",
    uriPattern: "resource://thread/{thread_id}",
    purpose: "Retrieve thread history in one structured snapshot.",
    operatorValue: "Prevents context loss before replying or escalating.",
  },
  {
    id: "resource-agents",
    uriPattern: "resource://agents/{project_key}",
    purpose: "Enumerate known agents and their contactable identities.",
    operatorValue: "Improves discoverability for new or restarted agents.",
  },
  {
    id: "resource-reservations",
    uriPattern: "resource://file_reservations/{project_key}",
    purpose: "Inspect active lease ownership and expiry windows.",
    operatorValue: "Immediate conflict awareness before code edits or commits.",
  },
  {
    id: "resource-contacts",
    uriPattern: "resource://contacts/{agent}",
    purpose: "Show contact graph and approval state.",
    operatorValue: "Clarifies who can be pinged directly vs. needs handshake.",
  },
  {
    id: "resource-metrics",
    uriPattern: "resource://metrics/{project_key}",
    purpose: "Expose throughput/error/latency telemetry snapshots.",
    operatorValue: "Supports operator triage and regression detection.",
  },
  {
    id: "resource-health",
    uriPattern: "resource://health",
    purpose: "Report service readiness and degraded-mode signals.",
    operatorValue: "Early warning for transport/storage/search instability.",
  },
];

export const tuiScreenCopy: TuiScreenCopy[] = [
  {
    id: "screen-dashboard",
    screen: "Dashboard",
    coreQuestion: "Is the system healthy and active right now?",
    primarySignals: ["inbound message rate", "reservation conflicts", "service health"],
  },
  {
    id: "screen-inbox",
    screen: "Inbox Browser",
    coreQuestion: "What requires my immediate response?",
    primarySignals: ["importance", "ack_required", "thread continuity"],
  },
  {
    id: "screen-threads",
    screen: "Thread Explorer",
    coreQuestion: "How did this decision evolve over time?",
    primarySignals: ["participants", "open action items", "decision checkpoints"],
  },
  {
    id: "screen-roster",
    screen: "Agent Roster",
    coreQuestion: "Who is online and what are they doing?",
    primarySignals: ["last active", "task description", "program/model"],
  },
  {
    id: "screen-reservations",
    screen: "Reservation Manager",
    coreQuestion: "Where are file ownership conflicts emerging?",
    primarySignals: ["path overlaps", "exclusive holders", "TTL expiration"],
  },
  {
    id: "screen-search",
    screen: "Unified Search",
    coreQuestion: "Where is the prior context for this topic?",
    primarySignals: ["query relevance", "thread_id", "sender filters"],
  },
  {
    id: "screen-contacts",
    screen: "Contact Graph",
    coreQuestion: "Can this agent message that agent right now?",
    primarySignals: ["approval state", "policy mode", "cross-project links"],
  },
  {
    id: "screen-macros",
    screen: "Macro Inspector",
    coreQuestion: "Which high-level workflows are available and safe?",
    primarySignals: ["macro preconditions", "side effects", "result payload shape"],
  },
  {
    id: "screen-build-slots",
    screen: "Build Slots",
    coreQuestion: "Are build leases saturating shared infrastructure?",
    primarySignals: ["active holders", "expiry", "exclusive contention"],
  },
  {
    id: "screen-product-bus",
    screen: "Product Bus",
    coreQuestion: "How are projects linked under shared products?",
    primarySignals: ["linked repos", "cross-project traffic", "search scope"],
  },
  {
    id: "screen-audit",
    screen: "Audit Timeline",
    coreQuestion: "What happened and when?",
    primarySignals: ["message lifecycle", "reservation changes", "identity updates"],
  },
  {
    id: "screen-health",
    screen: "System Health",
    coreQuestion: "Which subsystem is degraded?",
    primarySignals: ["DB pool pressure", "search fallback", "transport status"],
  },
  {
    id: "screen-overseer",
    screen: "Human Overseer",
    coreQuestion: "How can an operator redirect execution quickly?",
    primarySignals: ["compose path", "recipient targeting", "importance overrides"],
  },
  {
    id: "screen-tool-metrics",
    screen: "Tool Metrics",
    coreQuestion: "Which tools are hot or failing?",
    primarySignals: ["call volume", "error rate", "tail latency"],
  },
  {
    id: "screen-theme-status",
    screen: "Theme + Session Status",
    coreQuestion: "Is this session readable and context-aligned?",
    primarySignals: ["active theme", "connection status", "time windows"],
  },
];

export const robotCommandTrackCopy: RobotCommandTrackCopy[] = [
  {
    id: "track-situational-awareness",
    track: "Situational Awareness",
    objective: "Get fast status before taking action.",
    commandExamples: ["am robot status --format toon", "am robot health --format json"],
  },
  {
    id: "track-message-triage",
    track: "Message Triage",
    objective: "Prioritize and acknowledge inbound coordination tasks.",
    commandExamples: ["am robot inbox --format json --agent GreenCastle", "am robot thread --format md bd-123"],
  },
  {
    id: "track-history-retrieval",
    track: "History Retrieval",
    objective: "Recover past decisions before proposing changes.",
    commandExamples: ["am robot search --format json \"auth refactor\"", "am robot thread --format md bd-123"],
  },
  {
    id: "track-edit-safety",
    track: "Edit Safety",
    objective: "Inspect ownership and avoid reservation collisions.",
    commandExamples: ["am robot reservations --format json", "am robot health --format json"],
  },
  {
    id: "track-operator-reporting",
    track: "Operator Reporting",
    objective: "Produce machine-readable snapshots for automation and dashboards.",
    commandExamples: ["am robot status --format json > status.snapshot.json", "am robot health --format json > health.snapshot.json"],
  },
];

export interface TechnicalSurfaceCopy {
  toolClusters: ToolClusterCopy[];
  resources: ResourceSurfaceCopy[];
  tuiScreens: TuiScreenCopy[];
  robotTracks: RobotCommandTrackCopy[];
}

export const technicalSurfaceCopy: TechnicalSurfaceCopy = {
  toolClusters: toolClusterCopy,
  resources: resourceSurfaceCopy,
  tuiScreens: tuiScreenCopy,
  robotTracks: robotCommandTrackCopy,
};

export type VisualizationTier = "must" | "should" | "stretch";
export type VisualizationPagePlacement =
  | "home"
  | "showcase"
  | "architecture"
  | "getting-started";
export type VisualizationImplementationWave =
  | "wave-1-core-loop"
  | "wave-2-guardrails"
  | "wave-3-scale-observability"
  | "wave-4-advanced-internals";

export interface VisualizationBacklogItem {
  id: string;
  title: string;
  objective: string;
  tier: VisualizationTier;
  pedagogicalOrder: number;
  implementationWave: VisualizationImplementationWave;
  explanatoryValue: 1 | 2 | 3 | 4 | 5;
  implementationComplexity: 1 | 2 | 3 | 4 | 5;
  testingRisk: 1 | 2 | 3 | 4 | 5;
  recommendedPlacement: VisualizationPagePlacement[];
  reuseCandidates: string[];
  dataNeeds: string[];
  interactionNeeds: string[];
  riskNotes: string[];
}

// Priority-ranked execution backlog for visualization implementation beads.
export const visualizationBacklog: VisualizationBacklogItem[] = [
  {
    id: "viz-macro-orchestration",
    title: "Macro Orchestration Flow (Start Session / Prepare Thread / Reservation Cycle)",
    objective: "Teach the happy path first: one operator action expands into deterministic coordination steps.",
    tier: "must",
    pedagogicalOrder: 1,
    implementationWave: "wave-1-core-loop",
    explanatoryValue: 5,
    implementationComplexity: 2,
    testingRisk: 2,
    recommendedPlacement: ["home", "getting-started", "showcase"],
    reuseCandidates: ["obligation-flow-viz", "two-phase-effects-viz"],
    dataNeeds: [
      "macro input/output contracts",
      "ordered underlying tool steps with expected artifacts",
      "common failure/retry branches",
    ],
    interactionNeeds: [
      "macro selector",
      "expand/collapse underlying steps",
      "success/failure branch toggles",
    ],
    riskNotes: [
      "Macro behavior can evolve; visualization should version assumptions in copy.",
      "Too much expansion detail can overwhelm onboarding if defaults are not curated.",
    ],
  },
  {
    id: "viz-message-lifecycle",
    title: "Message Lifecycle + Thread State",
    objective: "Show message flow: send → inbox delivery → read/ack transitions → thread continuity.",
    tier: "must",
    pedagogicalOrder: 2,
    implementationWave: "wave-1-core-loop",
    explanatoryValue: 5,
    implementationComplexity: 3,
    testingRisk: 3,
    recommendedPlacement: ["home", "showcase"],
    reuseCandidates: ["obligation-flow-viz", "cancel-state-machine-viz"],
    dataNeeds: [
      "message payload shape (importance/ack/thread_id)",
      "status states: unread/read/acknowledged",
      "thread grouping model",
    ],
    interactionNeeds: [
      "step-through lifecycle controls",
      "toggle ack_required path",
      "hover details for status transition reasons",
    ],
    riskNotes: [
      "State explosion if per-recipient lifecycle is over-modeled.",
      "Must avoid implying hard-delivery guarantees that are not specified.",
    ],
  },
  {
    id: "viz-reservation-guardrail",
    title: "File Reservation + Guardrail Conflict Resolution",
    objective: "Explain exclusive/shared leases, overlap detection, TTL expiry, and pre-commit guard behavior.",
    tier: "must",
    pedagogicalOrder: 3,
    implementationWave: "wave-2-guardrails",
    explanatoryValue: 5,
    implementationComplexity: 3,
    testingRisk: 3,
    recommendedPlacement: ["home", "showcase", "architecture"],
    reuseCandidates: ["two-phase-effects-viz", "cancel-protocol-viz", "region-tree-viz"],
    dataNeeds: [
      "path pattern overlap examples",
      "reservation state timeline (granted/conflict/expired/released)",
      "guard modes (enforce/warn/bypass)",
    ],
    interactionNeeds: [
      "path overlap simulation controls",
      "TTL slider",
      "toggle exclusive/shared + guard mode",
    ],
    riskNotes: [
      "Glob conflict logic can be misleading if simplified incorrectly.",
      "Need clear copy that reservations are advisory, not absolute locks.",
    ],
  },
  {
    id: "viz-workload-lanes-triage",
    title: "Inbox Workload Lanes + Urgent Triage",
    objective: "Show how urgent/overdue messages are routed for deterministic operator attention.",
    tier: "must",
    pedagogicalOrder: 4,
    implementationWave: "wave-2-guardrails",
    explanatoryValue: 4,
    implementationComplexity: 3,
    testingRisk: 3,
    recommendedPlacement: ["home", "showcase"],
    reuseCandidates: ["scheduler-lanes-viz"],
    dataNeeds: [
      "inbox item schema with importance and ack_required state",
      "lane assignment rules",
      "processed event log shape",
    ],
    interactionNeeds: [
      "inject urgent/deadline scenarios",
      "single-step dequeue controls",
      "reset and replay controls",
    ],
    riskNotes: [
      "Lane labels must match Agent Mail semantics, not inherited asupersync naming.",
      "Visual complexity rises quickly when too many concurrent items are shown.",
    ],
  },
  {
    id: "viz-search-v3-pipeline",
    title: "Search V3 Hybrid Pipeline",
    objective: "Visualize lexical + semantic fusion, ranking, and project/product scope filtering.",
    tier: "must",
    pedagogicalOrder: 5,
    implementationWave: "wave-3-scale-observability",
    explanatoryValue: 5,
    implementationComplexity: 4,
    testingRisk: 4,
    recommendedPlacement: ["showcase", "architecture"],
    reuseCandidates: ["trace-replay-stability-viz", "oracle-dashboard-viz"],
    dataNeeds: [
      "query parsing stages",
      "lexical and semantic score inputs",
      "rerank and final score breakdown",
    ],
    interactionNeeds: [
      "query input with filter chips",
      "stage-by-stage reveal",
      "compare relevance vs recency ranking",
    ],
    riskNotes: [
      "Ranking internals may drift as search tuning evolves.",
      "Avoid overpromising semantic behavior not guaranteed in all modes.",
    ],
  },
  {
    id: "viz-product-bus-topology",
    title: "Product Bus Cross-Project Topology",
    objective: "Show how projects link under a product and how inbox/search/contact operations span repos.",
    tier: "must",
    pedagogicalOrder: 6,
    implementationWave: "wave-3-scale-observability",
    explanatoryValue: 4,
    implementationComplexity: 3,
    testingRisk: 3,
    recommendedPlacement: ["home", "architecture"],
    reuseCandidates: ["region-tree-viz"],
    dataNeeds: [
      "project-product link model",
      "cross-project message path examples",
      "product-scoped search behavior",
    ],
    interactionNeeds: [
      "select source/target project",
      "toggle product-linked vs isolated mode",
      "highlight route of message/search request",
    ],
    riskNotes: [
      "Cross-project permissions can be misunderstood without contact policy context.",
      "Need explicit distinction between project and product scope.",
    ],
  },
  {
    id: "viz-contact-policy-graph",
    title: "Contact Policy + Handshake Graph",
    objective: "Explain contacts-only/auto/open/block_all policy impact on inter-agent messaging.",
    tier: "should",
    pedagogicalOrder: 7,
    implementationWave: "wave-2-guardrails",
    explanatoryValue: 4,
    implementationComplexity: 3,
    testingRisk: 3,
    recommendedPlacement: ["architecture", "showcase"],
    reuseCandidates: ["capability-security-viz", "macaroon-capability-viz"],
    dataNeeds: [
      "policy matrix",
      "request/approve/deny path states",
      "cross-project contact edges",
    ],
    interactionNeeds: [
      "policy toggles",
      "graph edge animation by decision",
      "handshake timeline scrubber",
    ],
    riskNotes: [
      "Graph readability drops quickly with large agent sets.",
      "Need clear legend to separate contact edges from message thread lines.",
    ],
  },
  {
    id: "viz-ack-overdue-risk",
    title: "Acknowledgment Overdue Risk Monitor",
    objective: "Explain ack-required workflows and stale-ack escalation views.",
    tier: "should",
    pedagogicalOrder: 8,
    implementationWave: "wave-2-guardrails",
    explanatoryValue: 4,
    implementationComplexity: 2,
    testingRisk: 2,
    recommendedPlacement: ["showcase", "architecture"],
    reuseCandidates: ["scheduler-lanes-viz", "oracle-dashboard-viz"],
    dataNeeds: [
      "ack_required message subset",
      "staleness thresholds",
      "urgent/high importance overlays",
    ],
    interactionNeeds: [
      "TTL threshold control",
      "filter by importance",
      "highlight overdue messages",
    ],
    riskNotes: [
      "Escalation semantics vary by policy and operator workflow.",
    ],
  },
  {
    id: "viz-build-slot-contention",
    title: "Build Slot Contention + Lease Renewal",
    objective: "Show how build leases cap expensive concurrency and prevent resource thrash.",
    tier: "should",
    pedagogicalOrder: 9,
    implementationWave: "wave-3-scale-observability",
    explanatoryValue: 3,
    implementationComplexity: 2,
    testingRisk: 2,
    recommendedPlacement: ["architecture", "showcase"],
    reuseCandidates: ["scheduler-lanes-viz"],
    dataNeeds: [
      "slot holder list with expiry",
      "renew/release actions",
      "exclusive vs shared slot semantics",
    ],
    interactionNeeds: [
      "simulate competing agents",
      "renew/release controls",
      "timeline of slot occupancy",
    ],
    riskNotes: [
      "Lease timing visuals can become noisy if too many agents are shown.",
    ],
  },
  {
    id: "viz-resource-uri-map",
    title: "MCP Resource URI Map",
    objective: "Map resource:// surfaces to common read-only coordination tasks.",
    tier: "should",
    pedagogicalOrder: 10,
    implementationWave: "wave-3-scale-observability",
    explanatoryValue: 3,
    implementationComplexity: 1,
    testingRisk: 1,
    recommendedPlacement: ["architecture", "showcase"],
    reuseCandidates: ["small-step-semantics-viz"],
    dataNeeds: [
      "resource URI catalog",
      "query parameters by resource",
      "example payload summaries",
    ],
    interactionNeeds: [
      "URI navigator",
      "sample response preview",
      "resource-to-use-case cross-highlighting",
    ],
    riskNotes: [
      "Resource inventory can drift; needs easy maintenance hooks.",
    ],
  },
  {
    id: "viz-tui-screen-atlas",
    title: "15-Screen TUI Atlas",
    objective: "Provide a map of TUI screens, core questions, and operational signals.",
    tier: "should",
    pedagogicalOrder: 11,
    implementationWave: "wave-3-scale-observability",
    explanatoryValue: 3,
    implementationComplexity: 2,
    testingRisk: 2,
    recommendedPlacement: ["showcase", "architecture"],
    reuseCandidates: ["lab-runtime-viz"],
    dataNeeds: [
      "screen metadata",
      "primary signals per screen",
      "common navigation paths",
    ],
    interactionNeeds: [
      "screen selector with mini-preview",
      "next-screen recommendations",
      "signal legend overlays",
    ],
    riskNotes: [
      "Screenshots/video assets may lag behind current TUI behavior.",
    ],
  },
  {
    id: "viz-archive-dual-write",
    title: "SQLite + Git Dual-Write Audit Path",
    objective: "Show runtime write path from API/tool call through DB persistence and Git archive sync.",
    tier: "stretch",
    pedagogicalOrder: 12,
    implementationWave: "wave-4-advanced-internals",
    explanatoryValue: 4,
    implementationComplexity: 4,
    testingRisk: 4,
    recommendedPlacement: ["architecture"],
    reuseCandidates: ["two-phase-effects-viz", "trace-replay-stability-viz"],
    dataNeeds: [
      "storage layer write stages",
      "coalescer behavior",
      "failure and retry paths",
    ],
    interactionNeeds: [
      "pipeline stage stepping",
      "toggle normal vs degraded path",
      "inspect artifacts produced at each stage",
    ],
    riskNotes: [
      "Storage internals are highly implementation-specific and may change.",
      "Too much backend detail can distract non-operator audiences.",
    ],
  },
  {
    id: "viz-stress-gauntlet-outcomes",
    title: "Stress Gauntlet Scenario Outcomes",
    objective: "Summarize representative stress scenarios and what each validates operationally.",
    tier: "stretch",
    pedagogicalOrder: 13,
    implementationWave: "wave-4-advanced-internals",
    explanatoryValue: 3,
    implementationComplexity: 2,
    testingRisk: 3,
    recommendedPlacement: ["home", "showcase"],
    reuseCandidates: ["oracle-dashboard-viz", "test-oracles-viz", "eprocess-monitor-viz"],
    dataNeeds: [
      "scenario catalog",
      "pass/fail criteria",
      "headline throughput/reliability metrics",
    ],
    interactionNeeds: [
      "scenario selector",
      "metrics comparison view",
      "failure mode annotations",
    ],
    riskNotes: [
      "Benchmark numbers can be misread as universal guarantees.",
    ],
  },
];

export const visualizationBacklogByTier: Record<VisualizationTier, VisualizationBacklogItem[]> = {
  must: visualizationBacklog.filter((item) => item.tier === "must"),
  should: visualizationBacklog.filter((item) => item.tier === "should"),
  stretch: visualizationBacklog.filter((item) => item.tier === "stretch"),
};

export const visualizationExecutionOrder = [...visualizationBacklog].sort(
  (a, b) => a.pedagogicalOrder - b.pedagogicalOrder
);

// Changelog
export const changelog: ChangelogEntry[] = [
  {
    id: "python-foundation",
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
    id: "rust-rewrite",
    period: "Phase 2",
    title: "Rust Ground-Up Rewrite",
    items: [
      "12-crate modular workspace architecture with zero unsafe code",
      "Built on Tokio for high-performance async concurrency",
      "SQLite WAL mode with connection pooling and PRAGMA tuning",
      "Git-backed archive with commit coalescing (9x reduction)",
    ],
  },
  {
    id: "mcp-surface-search",
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
    id: "ops-console-cli",
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
    id: "stress-hardening",
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

export interface CoreContentDatasets {
  heroStats: Stat[];
  features: Feature[];
  comparisonRows: AgentMailComparisonRow[];
  changelog: ChangelogEntry[];
}

// Single import point for route composition and contract-style tests.
export const coreContentDatasets: CoreContentDatasets = {
  heroStats,
  features,
  comparisonRows: comparisonData,
  changelog,
};

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

// General FAQ (broader than getting-started, covers architecture and operational questions)
export const generalFaq: FaqItem[] = [
  {
    question: "How does Agent Mail differ from just using Git branches?",
    answer: "Git branches isolate code changes but provide no communication, identity, or coordination between agents. Agent Mail adds threaded messaging, file reservations, search, and operator visibility on top of your existing Git workflow.",
  },
  {
    question: "Does Agent Mail work with any AI coding agent?",
    answer: "Yes. Agent Mail exposes 34 MCP tools and 20+ resources via the Model Context Protocol standard. Any MCP-capable agent (Claude Code, Codex CLI, Gemini CLI, Cursor, etc.) can connect with a single config snippet.",
  },
  {
    question: "What happens if an agent crashes mid-reservation?",
    answer: "All file reservations have a TTL (default 3600 seconds). If an agent crashes, its reservations expire automatically. The stress gauntlet specifically tests stale lock recovery scenarios.",
  },
  {
    question: "Is the pre-commit guard mandatory?",
    answer: "No. The guard is opt-in and bypassable (AGENT_MAIL_BYPASS=1). File reservations are advisory by design, giving you conflict visibility without hard locks that could cause deadlocks.",
  },
  {
    question: "How does cross-project coordination work?",
    answer: "The product bus links multiple repositories under a single umbrella. Agents perform a contact handshake to establish communication channels, then can send messages and search across project boundaries.",
  },
  {
    question: "What is the performance overhead?",
    answer: "Minimal. The stress gauntlet sustains ~49 RPS with 30 concurrent agents. SQLite WAL mode with connection pooling keeps latency low, and the commit coalescer reduces Git write overhead by 9.1x.",
  },
  {
    question: "Can I use Agent Mail for a solo project?",
    answer: "Absolutely. Even solo developers benefit from the audit trail, structured search, and the ability to spin up multiple agents on different tasks within the same project without file conflicts.",
  },
  {
    question: "How is message history preserved?",
    answer: "Messages are stored in SQLite for fast queries and simultaneously archived to per-project Git repositories as date-partitioned files. This gives you both search speed and durable, diffable history.",
  },
  {
    question: "What are the 9 tool clusters?",
    answer: "Infrastructure (health, config), Identity (register, list agents), Messaging (send, reply, fetch inbox), Contacts (request, respond, list), File Reservations (reserve, release, query), Search (messages, cross-project), Macros (start session, prepare thread), Product Bus (link repos), and Build Slots (acquire, renew, release).",
  },
  {
    question: "Does Agent Mail require a separate server?",
    answer: "Agent Mail runs as a single binary (am) that serves both the MCP interface and the HTTP/Web UI. No external databases, message brokers, or cloud services required. Everything is local-first.",
  },
];

// Documentation cross-links: map glossary terms to relevant site sections
export interface DocCrossLink {
  term: string;
  links: { label: string; href: string }[];
}

export const glossaryCrossLinks: DocCrossLink[] = [
  { term: "Agent Identity", links: [{ label: "Getting Started", href: "/getting-started" }, { label: "Architecture", href: "/architecture" }] },
  { term: "File Reservation", links: [{ label: "Getting Started", href: "/getting-started" }, { label: "Showcase", href: "/showcase" }] },
  { term: "MCP", links: [{ label: "Spec Explorer", href: "/spec-explorer" }, { label: "Architecture", href: "/architecture" }] },
  { term: "TUI", links: [{ label: "Showcase", href: "/showcase" }, { label: "Architecture", href: "/architecture" }] },
  { term: "Robot Mode", links: [{ label: "Getting Started", href: "/getting-started" }, { label: "Showcase", href: "/showcase" }] },
  { term: "Pre-Commit Guard", links: [{ label: "Getting Started", href: "/getting-started" }] },
  { term: "Product Bus", links: [{ label: "Architecture", href: "/architecture" }] },
  { term: "Stress Gauntlet", links: [{ label: "Showcase", href: "/showcase" }] },
  { term: "Macro", links: [{ label: "Getting Started", href: "/getting-started" }, { label: "Spec Explorer", href: "/spec-explorer" }] },
  { term: "Web UI", links: [{ label: "Showcase", href: "/showcase" }] },
  { term: "Thread", links: [{ label: "Architecture", href: "/architecture" }] },
  { term: "Build Slot", links: [{ label: "Architecture", href: "/architecture" }] },
];

// Persona-driven marketing narrative
export interface UserPersona {
  id: string;
  name: string;
  role: string;
  context: string;
  painPoints: string[];
  valueProps: string[];
  cta: string;
}

export const userPersonas: UserPersona[] = [
  {
    id: "solo-builder",
    name: "Solo Builder",
    role: "Individual developer running multiple AI agents",
    context: "You launch 3-5 Claude Code or Codex sessions on a single repo. Without coordination, agents overwrite each other's work, create merge conflicts, and waste tokens re-doing lost changes.",
    painPoints: [
      "Agents silently overwrite files another agent just edited",
      "No way to know which agent is working on what",
      "Merge conflicts after every parallel session",
      "Lost work when two agents edit the same function",
    ],
    valueProps: [
      "File reservations prevent edit collisions before they happen",
      "Agent roster shows who is working on what, right now",
      "Threaded messages let agents coordinate task boundaries",
      "Git-backed audit trail means no work is ever silently lost",
    ],
    cta: "Start coordinating your agents in 60 seconds",
  },
  {
    id: "team-lead",
    name: "Team Lead",
    role: "Engineering lead managing a team using AI coding tools",
    context: "Your team runs agent swarms across multiple repositories. You need visibility into what agents are doing, the ability to redirect them mid-session, and confidence that agent-written code follows your standards.",
    painPoints: [
      "No visibility into what agents are doing across repos",
      "Cannot redirect an agent that is going down the wrong path",
      "Agent-written code sometimes contradicts team conventions",
      "No audit trail for who changed what and why",
    ],
    valueProps: [
      "15-screen TUI and Web UI give real-time operational visibility",
      "Human Overseer lets you send urgent redirects to any agent",
      "Pre-commit guard enforces file ownership boundaries",
      "Every message, reservation, and action is searchable and auditable",
    ],
    cta: "Get operational control over your agent fleet",
  },
  {
    id: "platform-engineer",
    name: "Platform Engineer",
    role: "Building internal tooling and multi-agent infrastructure",
    context: "You are building or evaluating coordination infrastructure for AI agents at scale. You need something that is production-hardened, extensible via MCP, and does not require cloud dependencies or vendor lock-in.",
    painPoints: [
      "Existing solutions require cloud services or vendor APIs",
      "No standard protocol for agent-to-agent communication",
      "Coordination tools that work at demo scale but break under load",
      "Integration complexity with diverse agent runtimes",
    ],
    valueProps: [
      "Local-first: single binary, no cloud dependencies, SQLite + Git",
      "MCP standard: 34 tools + 20 resources, works with any MCP-capable agent",
      "Stress-tested: 30-agent pipelines, ~49 RPS sustained, 10/10 gauntlet",
      "12-crate Rust workspace you can extend, fork, or embed",
    ],
    cta: "Evaluate the production-ready coordination fabric",
  },
];

export interface Objection {
  id: string;
  objection: string;
  response: string;
  evidence: string;
}

export const objectionHandlers: Objection[] = [
  {
    id: "just-use-branches",
    objection: "We already use Git branches for isolation",
    response: "Branches isolate code but not communication. When Agent A needs to tell Agent B it changed an API, branches have no mechanism for that. Agent Mail adds the coordination layer that Git lacks.",
    evidence: "The comparison table shows 12 capabilities where Git worktrees have gaps in messaging, identity, search, and operator visibility.",
  },
  {
    id: "too-complex",
    objection: "This adds too much complexity to our workflow",
    response: "Agent Mail is a single binary (am) with a one-line install. The macro_start_session call bootstraps everything in one step. You do not need to configure databases, message brokers, or cloud services.",
    evidence: "Install: curl | bash. Start: am. Bootstrap: one tool call. The getting-started path is under 60 seconds.",
  },
  {
    id: "wont-scale",
    objection: "Advisory locks will not work at scale",
    response: "The stress gauntlet runs 30 concurrent agents across 10 projects with mixed workloads. Advisory reservations with TTL expiration prevent deadlocks while the guard hook provides enforcement when needed.",
    evidence: "10/10 stress gauntlet scenarios pass: 1,494 ops in 30s, pool exhaustion recovery, thundering herd handling.",
  },
  {
    id: "vendor-lockin",
    objection: "I do not want to depend on another tool",
    response: "Agent Mail is open source (MIT), local-first, and stores everything in Git + SQLite. There are no cloud dependencies, no API keys, no accounts. If you stop using it, your data is still in standard formats.",
    evidence: "MIT license, all data in Git repos and SQLite databases, no network calls required for core functionality.",
  },
  {
    id: "agents-dont-need-coordination",
    objection: "Our agents work fine without coordination",
    response: "They work fine until they do not. The first time two agents edit the same file, you lose hours of work. Agent Mail prevents that failure mode while adding structured communication that makes multi-agent workflows more productive.",
    evidence: "Every team that has run 3+ concurrent agents has hit file collision issues. Reservations make these impossible.",
  },
];

export interface ConversionMessage {
  id: string;
  headline: string;
  subhead: string;
  personaIds: string[];
}

export const conversionMessages: ConversionMessage[] = [
  {
    id: "stop-losing-work",
    headline: "Stop Losing Agent Work to File Collisions",
    subhead: "File reservations prevent the most common multi-agent failure mode.",
    personaIds: ["solo-builder", "team-lead"],
  },
  {
    id: "see-everything",
    headline: "See Everything Your Agents Are Doing",
    subhead: "Real-time dashboards, searchable message history, and operator controls.",
    personaIds: ["team-lead", "platform-engineer"],
  },
  {
    id: "zero-config",
    headline: "One Binary. One Command. Zero Cloud Dependencies.",
    subhead: "Install in seconds, coordinate in minutes. No accounts, no API keys, no vendor lock-in.",
    personaIds: ["solo-builder", "platform-engineer"],
  },
  {
    id: "production-ready",
    headline: "Stress-Tested With 30 Concurrent Agents",
    subhead: "Not a prototype. Battle-tested coordination infrastructure backed by a 10-scenario stress gauntlet.",
    personaIds: ["platform-engineer"],
  },
];

// Proof-of-utility: before/after workflow deltas, reliability evidence, use cases
export interface WorkflowDelta {
  id: string;
  scenario: string;
  before: string;
  after: string;
  impact: string;
}

export const workflowDeltas: WorkflowDelta[] = [
  {
    id: "file-collision",
    scenario: "Two agents edit the same file",
    before: "Silent overwrite. Hours of work lost. Discovered only at commit time, if at all.",
    after: "Advisory file reservations surface the conflict before either agent starts. Agents negotiate via threaded messages or pick different files.",
    impact: "Zero lost work from file collisions",
  },
  {
    id: "worktree-debt",
    scenario: "Isolating agents with Git worktrees",
    before: "Each agent works in a separate worktree. Divergence accumulates silently. Merge conflicts pile up. Development velocity drops as you pay back the debt later.",
    after: "Agents work in one shared space with advisory reservations. Conflicts surface immediately and are resolved in real time through messaging. No merge debt.",
    impact: "Eliminates worktree merge debt entirely",
  },
  {
    id: "agent-crash",
    scenario: "Agent crashes or context resets mid-task",
    before: "Stale locks block other agents indefinitely. Manual cleanup required. No record of what the crashed agent was working on.",
    after: "TTL-based reservations expire automatically. Other agents detect stale reservations and reclaim them. Full audit trail in Git shows exactly what happened.",
    impact: "Self-healing, no manual intervention needed",
  },
  {
    id: "context-waste",
    scenario: "Agents broadcasting updates to all peers",
    before: "Every agent receives every message. Context windows fill with irrelevant information. Token costs spike. Signal-to-noise ratio collapses.",
    after: "Targeted messaging with subjects, threads, and recipients. Agents only receive messages addressed to them. Acknowledgment tracking ensures nothing is missed.",
    impact: "Up to 10x reduction in coordination token waste",
  },
  {
    id: "scale-coordination",
    scenario: "Scaling from 3 to 30+ concurrent agents",
    before: "Informal coordination breaks down completely. File conflicts multiply quadratically. No one knows who is doing what.",
    after: "Agent roster shows all active agents and their tasks. File reservations prevent conflicts at any scale. Graph-aware task prioritization (bv) ensures each agent works on the highest-impact task.",
    impact: "Tested with 40-50 concurrent agents across providers",
  },
];

export interface ReliabilityEvidence {
  id: string;
  claim: string;
  evidence: string;
  metric: string;
}

export const reliabilityEvidence: ReliabilityEvidence[] = [
  {
    id: "stress-gauntlet",
    claim: "Production-ready at scale",
    evidence: "10-scenario stress gauntlet covering 30-agent message pipelines, pool exhaustion, thundering herd, stale lock recovery, and sustained mixed workloads.",
    metric: "10/10 scenarios pass with zero errors",
  },
  {
    id: "throughput",
    claim: "Low-latency coordination",
    evidence: "HTTP stress profile sustains ~49 RPS with 1,494 operations in 30 seconds of mixed workloads including messaging, search, and reservations.",
    metric: "~49 RPS sustained throughput",
  },
  {
    id: "commit-efficiency",
    claim: "Minimal Git overhead",
    evidence: "Commit coalescer batches multiple storage writes into fewer Git commits, reducing write amplification.",
    metric: "9.1x write reduction (100 writes to 11 commits)",
  },
  {
    id: "cross-provider",
    claim: "Works with any MCP-capable agent",
    evidence: "First open-source coordination system that works across providers. Battle-tested with Claude Code, Codex CLI, and Gemini CLI running simultaneously on the same project.",
    metric: "40-50 agents concurrently, mixed providers",
  },
  {
    id: "self-healing",
    claim: "Robust to agent failures",
    evidence: "TTL-based reservation expiration, stale lock detection, and automatic cleanup. Designed for the reality that agents crash, context-reset, and disappear without notice.",
    metric: "Zero manual intervention for crashed agents",
  },
];

export interface UseCase {
  id: string;
  title: string;
  description: string;
  personaId: string;
  outcome: string;
}

export const useCases: UseCase[] = [
  {
    id: "rapid-prototyping",
    title: "Rapid Multi-Agent Prototyping",
    description: "Launch 10+ agents on a new project with NTM. Each agent picks the highest-impact task via bv graph analysis. File reservations prevent collisions. Threaded messages coordinate API boundaries.",
    personaId: "solo-builder",
    outcome: "Ship a working prototype in hours, not days",
  },
  {
    id: "refactoring-at-scale",
    title: "Large-Scale Codebase Refactoring",
    description: "Decompose a refactoring plan into beads with dependency tracking. Agents claim work, reserve affected files, and coordinate through thread IDs that map to bead IDs. The pre-commit guard prevents accidental conflicts.",
    personaId: "team-lead",
    outcome: "Refactor 50+ files with zero merge conflicts",
  },
  {
    id: "cross-repo-migration",
    title: "Cross-Repository API Migration",
    description: "Link frontend and backend repos via the product bus. Agents working on the backend notify frontend agents of API changes through cross-project messages. Contact handshakes establish secure communication channels.",
    personaId: "platform-engineer",
    outcome: "Coordinated migrations across repository boundaries",
  },
  {
    id: "continuous-development",
    title: "24/7 Continuous Development",
    description: "Agents work in shifts. Incoming agents use macro_prepare_thread to catch up on conversation history. Semi-persistent identities mean agents can pick up where predecessors left off without breaking coordination state.",
    personaId: "team-lead",
    outcome: "Continuous progress without context loss between sessions",
  },
  {
    id: "audit-compliance",
    title: "Auditable Agent Operations",
    description: "Every message, reservation, and agent action is recorded in SQLite and archived to Git. Searchable audit trail shows exactly what each agent did, when, and why. Human Overseer provides real-time oversight.",
    personaId: "platform-engineer",
    outcome: "Complete audit trail for every agent decision",
  },
];

// Key insight quotes from the creator (sourced from public tweets)
export interface CreatorInsight {
  id: string;
  quote: string;
  context: string;
}

export const creatorInsights: CreatorInsight[] = [
  {
    id: "worktrees-suck",
    quote: "Worktrees suck and just kick the can down the road. Advisory file reservations and messaging ftw.",
    context: "On running 40-50 agents simultaneously with no issues, mixing Claude Code, Codex, and Gemini CLI.",
  },
  {
    id: "footguns",
    quote: "It does exactly what they want and much more, while sidestepping all the many footguns that a naive implementation would fall prey to.",
    context: "On why purpose-built coordination beats ad-hoc solutions.",
  },
  {
    id: "semi-persistent-identity",
    quote: "You want semi-persistent identity. An identity that can last for the duration of a discrete task, but one that can also vanish without a trace and not break things.",
    context: "On designing identity systems robust to agent crashes and context resets.",
  },
  {
    id: "graph-compass",
    quote: "It's like a compass that each agent can use to tell them which direction will unlock the most work overall.",
    context: "On how bv uses dependency graph analysis to prioritize agent work.",
  },
  {
    id: "first-mover",
    quote: "You're going to be hearing about a lot of agent communication systems soon because it's such an obviously good idea, but mine was the first open-source system that works across providers, and still has the best design.",
    context: "On Agent Mail's position as the first cross-provider coordination system.",
  },
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

// ─── Video Placeholder Spec ──────────────────────────────────────

export interface VideoPlaceholderSpec {
  id: string;
  poster: string;
  mediaSrc: string;
  mediaType: string;
  width: number;
  height: number;
  ariaLabel: string;
  captionsTrack: {
    src: string;
    srcLang: string;
    label: string;
    kind: "captions" | "subtitles" | "chapters";
  }[];
  reducedMotionFallback: string;
  overlayTitle: string;
  overlaySubtitle: string;
  replacementSteps: string[];
}

export const heroVideoPlaceholder: VideoPlaceholderSpec = {
  id: "hero-dashboard-video",
  poster: "/images/agent-mail-dashboard-poster-placeholder.svg",
  mediaSrc: "/media/agent-mail-dashboard-placeholder.mp4",
  mediaType: "video/mp4",
  width: 1920,
  height: 1080,
  ariaLabel: "MCP Agent Mail dashboard demo — shows multi-agent coordination in real time",
  captionsTrack: [
    {
      src: "/media/agent-mail-dashboard.vtt",
      srcLang: "en",
      label: "English",
      kind: "captions",
    },
    {
      src: "/media/agent-mail-dashboard-chapters.vtt",
      srcLang: "en",
      label: "Chapters",
      kind: "chapters",
    },
  ],
  reducedMotionFallback: "/images/agent-mail-dashboard-poster-placeholder.svg",
  overlayTitle: "Placeholder: replace with your Agent Mail dashboard recording",
  overlaySubtitle: "expected path: `public/media/agent-mail-dashboard-placeholder.mp4`",
  replacementSteps: [
    "1. Record a screen capture of the Agent Mail TUI or web dashboard showing live multi-agent coordination (recommended: 1920x1080, 30fps, ≤2 min).",
    "2. Export as H.264 MP4 and place at `public/media/agent-mail-dashboard-placeholder.mp4`.",
    "3. Generate a poster frame (first frame or key moment) as PNG/SVG and place at `public/images/agent-mail-dashboard-poster-placeholder.svg`.",
    "4. Optional: author a WebVTT captions file at `public/media/agent-mail-dashboard.vtt` and chapter markers at `public/media/agent-mail-dashboard-chapters.vtt`.",
    "5. The `<video>` element in `app/page.tsx` (hero section) auto-picks up these files. No code changes needed.",
    "6. For reduced-motion users, the poster image is shown instead of autoplaying video (handled by the `prefers-reduced-motion` media query in the component).",
    "7. Verify: `bun run build` and check that the video loads at `/` with poster, controls, captions track, and accessible label.",
  ],
};

// ─── Social Proof & Credibility ──────────────────────────────────

export interface EvidenceBackedClaim {
  id: string;
  claim: string;
  evidence: string;
  source: string;
  category: "scale" | "reliability" | "performance" | "architecture" | "adoption";
}

export const evidenceBackedClaims: EvidenceBackedClaim[] = [
  {
    id: "ebc-concurrent-agents",
    claim: "Runs 40-50 concurrent agents from multiple providers with zero coordination failures",
    evidence: "Stress gauntlet scenario 7 validates sustained 30-second mixed workloads at ~49 RPS with 30+ agent pipelines. Production use confirmed across Claude Code, Codex CLI, and Gemini CLI simultaneously.",
    source: "tests/stress_gauntlet.rs, creator tweet thread (650+ likes)",
    category: "scale",
  },
  {
    id: "ebc-zero-unsafe",
    claim: "12-crate Rust workspace with zero unsafe code blocks",
    evidence: "grep -r 'unsafe' across all .rs files returns zero matches. All FFI boundaries use safe wrappers.",
    source: "Cargo.toml workspace members, codebase grep",
    category: "architecture",
  },
  {
    id: "ebc-commit-coalescing",
    claim: "9x reduction in Git commits through intelligent coalescing",
    evidence: "Commit coalescer batches rapid-fire agent commits into logical groups, measured at 9:1 reduction ratio in stress gauntlet scenario 3.",
    source: "tests/stress_gauntlet.rs scenario 3",
    category: "performance",
  },
  {
    id: "ebc-pool-recovery",
    claim: "Automatic recovery from SQLite connection pool exhaustion",
    evidence: "Stress gauntlet scenario 6 intentionally exhausts the connection pool and validates automatic recovery with zero data loss.",
    source: "tests/stress_gauntlet.rs scenario 6",
    category: "reliability",
  },
  {
    id: "ebc-thundering-herd",
    claim: "Handles thundering herd scenarios with zero errors",
    evidence: "Stress gauntlet scenario 8 simulates 30 agents hitting the same endpoint simultaneously. All requests succeed with bounded latency.",
    source: "tests/stress_gauntlet.rs scenario 8",
    category: "reliability",
  },
  {
    id: "ebc-stale-lock-recovery",
    claim: "Automatic detection and cleanup of stale Git locks from crashed agents",
    evidence: "Stress gauntlet scenario 4 creates stale .git/index.lock files and validates they are detected and cleaned up within the TTL window.",
    source: "tests/stress_gauntlet.rs scenario 4",
    category: "reliability",
  },
  {
    id: "ebc-cross-provider",
    claim: "First open-source system for cross-provider multi-agent coordination",
    evidence: "Uses MCP standard for transport. Any MCP-capable agent (Claude, Codex, Gemini, Copilot) can participate. No vendor lock-in.",
    source: "README.md, MCP tool definitions",
    category: "adoption",
  },
  {
    id: "ebc-34-mcp-tools",
    claim: "34 MCP tools covering the full coordination lifecycle",
    evidence: "Tools span identity (register_agent), messaging (send_message, reply_message, fetch_inbox), reservations (file_reservation_paths), search (search_messages), and macros (macro_start_session).",
    source: "src/tools/ module definitions",
    category: "architecture",
  },
];

export interface CredibilityHighlight {
  id: string;
  metric: string;
  value: string;
  context: string;
  icon: string;
}

export const credibilityHighlights: CredibilityHighlight[] = [
  {
    id: "ch-stress-scenarios",
    metric: "Stress Test Scenarios",
    value: "10/10",
    context: "All 10 stress gauntlet scenarios pass with zero errors",
    icon: "shieldCheck",
  },
  {
    id: "ch-crate-count",
    metric: "Rust Crates",
    value: "12",
    context: "Modular workspace: core, db, storage, search-core, guard, share, tools, server, CLI, conformance, WASM",
    icon: "package",
  },
  {
    id: "ch-tui-screens",
    metric: "TUI Screens",
    value: "15",
    context: "Full operational dashboard: inbox, threads, reservations, agents, system health, and more",
    icon: "monitor",
  },
  {
    id: "ch-search-modes",
    metric: "Search Modes",
    value: "3",
    context: "Lexical (BM25), semantic (embedding), and hybrid search across all message history",
    icon: "search",
  },
  {
    id: "ch-rps",
    metric: "Sustained RPS",
    value: "~49",
    context: "Mixed workload throughput maintained over 30-second stress test windows",
    icon: "zap",
  },
];

export interface AdoptionMessage {
  id: string;
  headline: string;
  subline: string;
  targetAudience: string;
  ctaLabel: string;
  ctaHref: string;
}

export const adoptionMessages: AdoptionMessage[] = [
  {
    id: "am-solo-dev",
    headline: "Stop watching agents fight over files",
    subline: "Advisory reservations and TTL expiration mean your agents coordinate instead of collide — even when they crash.",
    targetAudience: "Solo developers running multiple AI agents",
    ctaLabel: "Get Started Free",
    ctaHref: "/getting-started",
  },
  {
    id: "am-team-lead",
    headline: "See what every agent is doing, in real time",
    subline: "15-screen TUI, web dashboard, and robot mode CLI give you full visibility. Human Overseer lets you intervene when needed.",
    targetAudience: "Team leads managing AI-assisted development",
    ctaLabel: "View Dashboard Demo",
    ctaHref: "/showcase",
  },
  {
    id: "am-platform",
    headline: "The coordination layer your agent platform is missing",
    subline: "34 MCP tools, cross-provider compatibility, and a stress gauntlet proving 40+ concurrent agents. MIT licensed.",
    targetAudience: "Platform engineers building agent infrastructure",
    ctaLabel: "Explore Architecture",
    ctaHref: "/architecture",
  },
];

// ─── Dashboard Demo Storyboard ──────────────────────────────────

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  description: string;
  keyAction: string;
  overlayText: string | null;
  narrativeBeat: string;
}

export interface RecordingBrief {
  totalDurationSeconds: number;
  resolution: string;
  framerate: number;
  format: string;
  recordingSettings: string[];
  scenes: StoryboardScene[];
}

export const dashboardDemoStoryboard: RecordingBrief = {
  totalDurationSeconds: 90,
  resolution: "1920x1080",
  framerate: 30,
  format: "H.264 MP4",
  recordingSettings: [
    "Use the Agent Mail TUI (am) or web UI (localhost:8765/mail) as the recording target.",
    "Set terminal font size to 14-16pt for readability at 1080p.",
    "Use a dark terminal theme that matches the website aesthetic.",
    "Disable notifications and status bar indicators that could leak personal info.",
    "Keep mouse movements smooth and deliberate — avoid fast cursor jitter.",
  ],
  scenes: [
    {
      id: "scene-1-boot",
      sceneNumber: 1,
      title: "Cold Start",
      durationSeconds: 10,
      description: "Run 'am' to start the Agent Mail server. Show the boot sequence, health check output, and the TUI dashboard appearing.",
      keyAction: "Type 'am' and press Enter. The server initializes and the TUI launches.",
      overlayText: "One command to start",
      narrativeBeat: "Establish simplicity — a single command boots the entire coordination system.",
    },
    {
      id: "scene-2-agents-register",
      sceneNumber: 2,
      title: "Agents Register",
      durationSeconds: 15,
      description: "Show 3-5 agents registering via macro_start_session. The agent list populates in real time with names like GreenCastle, BlueLake, RedHarbor.",
      keyAction: "Navigate to the Agents screen. Watch agent entries appear as they register.",
      overlayText: "Semi-persistent identity",
      narrativeBeat: "Demonstrate the identity system — agents get memorable names automatically.",
    },
    {
      id: "scene-3-reservations",
      sceneNumber: 3,
      title: "File Reservations in Action",
      durationSeconds: 15,
      description: "Show an agent reserving files. Navigate to the Reservations screen. Show the TTL countdown, the glob pattern match, and a second agent detecting the reservation.",
      keyAction: "Show reservation creation, the TTL timer, and a conflict detection.",
      overlayText: "Advisory, not rigid",
      narrativeBeat: "Show that reservations prevent conflicts without creating deadlocks.",
    },
    {
      id: "scene-4-messaging",
      sceneNumber: 4,
      title: "Targeted Messaging",
      durationSeconds: 15,
      description: "Show agents exchanging targeted messages. Navigate to the Inbox screen, then drill into a thread. Show the thread view with subject, body, and acknowledgment status.",
      keyAction: "Open inbox, click into a thread, show the full conversation.",
      overlayText: "Targeted, not broadcast",
      narrativeBeat: "Demonstrate that messages are addressed to specific agents, not broadcast-to-all.",
    },
    {
      id: "scene-5-search",
      sceneNumber: 5,
      title: "Hybrid Search",
      durationSeconds: 10,
      description: "Type a search query in the Search screen. Show results from lexical, semantic, and hybrid modes with relevance scores.",
      keyAction: "Type a query, toggle between search modes, show ranked results.",
      overlayText: "Find anything, instantly",
      narrativeBeat: "Show the power of searchable audit trails across all agent communication.",
    },
    {
      id: "scene-6-scale",
      sceneNumber: 6,
      title: "Scale Dashboard",
      durationSeconds: 15,
      description: "Navigate to the System Health screen. Show metrics: active agents, messages/sec, reservation count, connection pool status. Ideally with 10+ agents active.",
      keyAction: "Show the health dashboard with live metrics updating in real time.",
      overlayText: "40-50 agents, zero issues",
      narrativeBeat: "Prove the scale claim — show many agents coordinating smoothly.",
    },
    {
      id: "scene-7-cta",
      sceneNumber: 7,
      title: "Closing CTA",
      durationSeconds: 10,
      description: "Return to the main dashboard view. Pause for 2 seconds on the full TUI showing all active coordination. Fade to the website URL.",
      keyAction: "Navigate back to the main dashboard. Hold the shot.",
      overlayText: "mcpagentmail.com",
      narrativeBeat: "End with the full picture — a coordinated multi-agent workspace in action.",
    },
  ],
};
