# MCP Agent Mail Website

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Package_Manager-Bun-000000?logo=bun)](https://bun.sh/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com/)
[![Tests](https://img.shields.io/badge/Tests-109_Unit_+_7_E2E-22c55e)](#testing)
[![License](https://img.shields.io/badge/License-Unspecified-lightgrey)](#license)

</div>

The marketing, documentation, and interactive visualization site for **MCP Agent Mail**, a coordination infrastructure for AI coding agents.

**Live site:** https://mcpagentmail.com
**Engine source:** https://github.com/Dicklesworthstone/mcp_agent_mail_rust

<div align="center">
<h3>Quick Install</h3>

```bash
git clone https://github.com/Dicklesworthstone/mcp_agent_mail_website.git
cd mcp_agent_mail_website
bun install
bun dev
```

<p><em>If you only want to browse, open https://mcpagentmail.com.</em></p>
</div>

## TL;DR

**The Problem:** Multi-agent AI coding sessions (Claude Code, Codex CLI, Gemini CLI) need coordination, but most project sites either explain the internals poorly or treat documentation as an afterthought. Interactive systems with 34 MCP tools, file reservations, threaded messaging, and cross-project coordination need something better than a flat docs page.

**The Solution:** This site keeps product narrative, technical architecture, and interactive demonstrations in one place. 50+ interactive visualizations let users explore identity systems, message lifecycles, file reservations, Search V3, stress gauntlet scenarios, and rollout mechanics, all rendered client-side with zero backend dependencies.

### Why This Setup Works

| Capability | Practical Benefit |
|---|---|
| **Centralized content model** | All static content maintained in one 3200-line `lib/content.ts` |
| **50+ interactive visualizations** | Complex coordination behavior shown through animated components |
| **Spec explorer** | Full technical specification browsable with search and category filtering |
| **Performance-aware frontend** | Heavy components lazy-loaded via `LazyViz` with viewport detection |
| **Strict TypeScript + linting** | Safer refactors and clearer maintenance boundaries |
| **109 unit + 7 E2E tests** | Vitest and Playwright cover content, UI primitives, and critical user flows |
| **JSON-LD structured data** | Five schema types (SoftwareApplication, VideoObject, WebSite, FAQPage, HowTo) |
| **Bun-only workflow** | One package manager and one lockfile path |

## Quick Example

```bash
# 1) Install dependencies
bun install

# 2) Start local dev server (Turbopack)
bun dev

# 3) Visit key pages
#    http://localhost:3000/                  Home (hero, features, comparisons, code examples)
#    http://localhost:3000/showcase          50+ interactive viz gallery
#    http://localhost:3000/architecture      Engine internals
#    http://localhost:3000/spec-explorer     Specification browser
#    http://localhost:3000/getting-started   Onboarding guide
#    http://localhost:3000/glossary          Searchable terminology

# 4) Run static checks
bun tsc --noEmit
bun lint

# 5) Run tests
bun run test                # Unit tests (Vitest)
bun run test:e2e            # 7 E2E specs (Playwright)

# 6) Build production bundle
bun run build
```

## Design Philosophy

1. **Use demonstrations for complex behavior**
   When possible, show coordination behavior directly with interactive visualizations rather than prose. File reservations, message lifecycles, and stress gauntlet scenarios are animated, not just described.

2. **Keep content in one main source file**
   `lib/content.ts` is the single source of truth for all static site copy, feature lists, comparison data, code examples, glossary terms, FAQ, testimonials, JSON-LD generators, and media metadata.

3. **Avoid unnecessary moving parts**
   No CMS, no external APIs for core functionality, no runtime database. All content is compiled into the bundle. The spec explorer fetches markdown files from `/public/spec-docs/` on demand.

4. **Respect user preferences**
   All animations honor `prefers-reduced-motion`. Heavy visualizations defer rendering until near the viewport via `LazyViz`. Lab mode (Ctrl+Shift+X) unlocks experimental features.

5. **Keep quality checks routine**
   Type-checking, linting, unit tests, and E2E tests are part of normal development. CI runs both suites on every push.

## How It Compares

| Dimension | This Project | Generic Static Docs Site | Typical Marketing Landing Page |
|---|---|---|---|
| Technical depth | High (formal models, spec explorer) | Medium/Low | Low |
| Interactivity | 50+ animated visualizations | Low | Medium |
| Coordination demos | Live animated walkthroughs | None | None |
| Content editing model | Single TS source file | Split across many files | Often CMS-based |
| Testing coverage | 109 unit + 7 E2E specs | Rare | Rare |
| SEO structure | Five JSON-LD schema types | Basic meta tags | Basic meta tags |
| Best use case | Product + technical docs for complex systems | Reference docs | Top-of-funnel marketing |

## What MCP Agent Mail Does

MCP Agent Mail provides coordination infrastructure for multi-agent AI coding sessions. When 5, 10, or 40+ AI coding agents (Claude Code, Codex CLI, Gemini CLI) work on the same codebase simultaneously, they need to know who is editing what, communicate about design decisions, and avoid silently overwriting each other's work.

Without coordination, agents step on each other constantly. Two agents edit the same file. A third agent wastes tokens re-implementing something the first agent already finished. Nobody knows what happened or why. The commit history is chaos.

Agent Mail solves this with five core primitives:

**1. Project-Scoped Identity**
Every agent gets a memorable, persistent identity (GreenCastle, BlueLake, RedHarbor), automatically generated on registration. Identities carry metadata (which program, which model, what task) and persist across reconnections, replacing anonymous processes that have no way to identify each other.

**2. Threaded Asynchronous Messaging**
Agents communicate through structured messages with subjects, recipients, CC/BCC, importance levels, and acknowledgment requirements. Messages are stored in a Git-backed archive, never consuming agent context windows. Threads track design decisions over time with full auditability.

**3. Advisory File Reservations**
Before editing, agents declare exclusive or shared leases on file glob patterns (e.g., `src/auth/**/*.ts`). Reservations are advisory by default, visible to all agents and enforced by an optional pre-commit guard hook. TTL-based expiration prevents stale locks from blocking work.

**4. Hybrid Search**
Two-tier fusion combining lexical and semantic search with reranking. Field-based filters (`subject:`, `body:`, `from:`), cross-project search via product bus, and relevance scoring built on frankensearch. Agents recover context from message history before asking teammates for status.

**5. Operator Visibility**
A 15-screen TUI dashboard plus a web UI give humans real-time visibility into what every agent is doing. The Human Overseer compose form lets operators send high-priority messages to redirect agents mid-session.

### The Numbers

| Metric | Value | Context |
|---|---|---|
| MCP Tools | 34 | Coordination primitives across 9 clusters |
| MCP Resources | 20+ | Agent-discoverable read-only surfaces |
| Stress Gauntlet | 10/10 | All representative high-load scenarios passed |
| Sustained Throughput | ~49 RPS | Mixed workload stress profile baseline |
| Concurrent Agents | 40-50 | Proven in production with zero coordination failures |
| Rust Crates | 12 | Modular workspace (core, db, storage, search, guard, tools, server, CLI, WASM) |

### Agent Mail vs. Alternatives

The full comparison across 12 coordination dimensions:

| Feature | Agent Mail | Git Worktrees | Shared Docs | No Coordination |
|---|---|---|---|---|
| Agent Identity | Persistent, project-scoped | None | Manual naming | None |
| Messaging | Threaded + searchable | None | Append-only files | None |
| File Conflict Prevention | Advisory reservations + guard | Isolated branches | None | None |
| Audit Trail | Git + SQLite | Git history only | File history | None |
| Cross-Project Coordination | Product bus | None | None | None |
| Search | Hybrid lexical + semantic | Git log | Text search | None |
| Operator Visibility | 15-screen TUI + Web UI | Git log | File browser | None |
| MCP Integration | 34 tools + 20 resources | None | None | None |
| Agent Discovery | Auto-detect + register | Manual | Manual | Manual |
| Acknowledgments | Built-in ack protocol | None | None | None |
| Build Concurrency | Build slot management | None | None | Race conditions |
| Stress Tested | 10/10 gauntlet (30 agents) | N/A | N/A | N/A |

Git worktrees isolate branches but provide zero communication or coordination primitives. Shared document schemes (files in a `.coordination/` directory) lack threading, search, identity, and acknowledgments. No coordination means silent overwrites, wasted tokens, and merge hell.

### Three Operational Pillars

The Getting Started page organizes Agent Mail around three pillars:

**1. Scoped Agent Identity.** Project-scoped identities maintain thread continuity and explicit inbox semantics. Parallel agents stay coordinated instead of colliding.

**2. Reservation Guardrails.** Advisory file reservations plus optional guard enforcement make ownership visible before edits and safer at commit time.

**3. Auditable Workflows.** Messages, acknowledgements, and search traces are queryable in SQLite and preserved in a Git-auditable archive. Every coordination action is recoverable.

### Agent Mail in Action

```bash
# Install Agent Mail (one-liner)
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/mcp_agent_mail_rust/main/install.sh?$(date +%s)" | bash

# Start the server + TUI
am

# Bootstrap a session (project + agent + inbox in one call)
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
)
```

MCP config for Claude Code (`.mcp.json`):
```json
{
  "mcpServers": {
    "agent-mail": {
      "command": "mcp-agent-mail",
      "args": []
    }
  }
}
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Motion | framer-motion |
| Icons | lucide-react |
| Data layer | TanStack Query + Table + Virtual + Form |
| Markdown | marked + DOMPurify (XSS-safe rendering) |
| Utilities | clsx + tailwind-merge |
| Unit testing | Vitest 4 + Testing Library |
| E2E testing | Playwright 1.58 |
| Package manager | **bun only** |
| Deployment | Vercel |

## Routes

| Route | Purpose | Key Sections |
|---|---|---|
| `/` | Primary landing + value proposition | Hero media, proof strip, concepts deep-dive, features grid, comparison table, code examples, architecture preview, adoption CTAs |
| `/showcase` | Interactive visualization gallery | 50+ animated demos organized by coordination concept |
| `/architecture` | Formal system internals | Runtime model, structured concurrency regions, cancel protocol, state machines, capability tiers |
| `/spec-explorer` | Technical specification browser | Searchable spec library with markdown rendering and category filtering |
| `/getting-started` | Onboarding guide | Installation, quickstart, MCP config, operational pillars, FAQ |
| `/glossary` | Terminology reference | Searchable index with short and long definitions |

## The 34 MCP Tools

Agent Mail exposes 34 tools organized into 9 clusters, all accessible via the Model Context Protocol standard:

### Infrastructure
Bootstrap project context, health checks, server lifecycle.
- `health_check`, `ensure_project`, `macro_start_session`
- **When to use:** When an agent joins a repository or diagnostics indicate drift.

### Identity
Create and update persistent agent identities and metadata.
- `register_agent`, `create_agent_identity`, `whois`
- **When to use:** Before sending mail or reserving files.

### Messaging
Coordinate work asynchronously with durable, threaded, auditable messages.
- `send_message`, `reply_message`, `fetch_inbox`, `acknowledge_message`
- **When to use:** For handoffs, blockers, design decisions, escalation paths.

### Contacts
Control who can message whom across teams and projects.
- `request_contact`, `respond_contact`, `set_contact_policy`
- **When to use:** Adding new collaborators or enforcing contact policy.

### File Reservations
Advertise file ownership intent and avoid stepping on parallel edits.
- `file_reservation_paths`, `renew_file_reservations`, `release_file_reservations`
- **When to use:** Before starting edits, and renewing/releasing throughout execution.

### Search
Recover context rapidly from message history and thread archives.
- `search_messages`, `summarize_thread`, `search_messages_product`
- **When to use:** Before asking teammates for status or planning new work.

### Macros
Collapse common multi-step workflows into one predictable tool call.
- `macro_start_session`, `macro_prepare_thread`, `macro_file_reservation_cycle`, `macro_contact_handshake`
- **When to use:** Optimizing token budget or reducing orchestration mistakes.

### Product Bus
Link multiple repos under one product-level coordination surface.
- `ensure_product`, `products_link`, `fetch_inbox_product`
- **When to use:** Architecture spans multiple services/repos with shared releases.

### Build Slots
Throttle expensive builds/tests to prevent CI or machine contention.
- `acquire_build_slot`, `renew_build_slot`, `release_build_slot`
- **When to use:** Shared runners or large swarms doing parallel compile-heavy work.

## MCP Resources

Over 20 read-only resource surfaces let agents inspect system state without tool calls (lower token overhead):

| Resource URI | Purpose | Operator Value |
|---|---|---|
| `resource://inbox/{agent}` | Latest inbox snapshot | Low-token-overhead inbox check |
| `resource://thread/{thread_id}` | Full thread history | Prevents context loss across sessions |
| `resource://agents/{project_key}` | Known agents + contactable identities | Discoverability for new agents |
| `resource://file_reservations/{project_key}` | Active lease ownership + expiry | Conflict awareness before editing |
| `resource://contacts/{agent}` | Contact graph + approval state | Clarifies who can message whom |
| `resource://metrics/{project_key}` | Throughput/error/latency telemetry | Supports triage decisions |
| `resource://health` | Service readiness + degraded-mode signals | Early warning for operators |

## 15-Screen Operations TUI

The terminal dashboard answers the core operational questions that arise during multi-agent sessions:

| Screen | Question It Answers | Key Signals |
|---|---|---|
| **Dashboard** | Is the system healthy and active? | Inbound message rate, reservation conflicts, service health |
| **Inbox Browser** | What requires my immediate response? | Importance, ack_required, thread continuity |
| **Thread Explorer** | How did this decision evolve? | Participants, open action items, decision checkpoints |
| **Agent Roster** | Who is online and what are they doing? | Last active, task description, program/model |
| **Reservation Manager** | Where are file conflicts emerging? | Path overlaps, exclusive holders, TTL expiration |
| **Unified Search** | Where is the prior context for this topic? | Query relevance, thread_id, sender filters |
| **Contact Graph** | Can this agent message that agent? | Approval state, policy mode, cross-project links |
| **Macro Inspector** | Which workflows are available and safe? | Macro preconditions, side effects, result shape |
| **Build Slots** | Are builds saturating shared infrastructure? | Active holders, expiry, exclusive contention |
| **Product Bus** | How are projects linked under shared products? | Linked repos, cross-project traffic, search scope |
| **Audit Timeline** | What happened and when? | Message lifecycle, reservation changes, identity updates |
| **System Health** | Which subsystem is degraded? | DB pool pressure, search fallback, transport status |
| **Human Overseer** | How can an operator redirect execution? | Compose path, recipient targeting, importance overrides |
| **Tool Metrics** | Which tools are hot or failing? | Call volume, error rate, tail latency |
| **Theme + Session** | Is this session readable and context-aligned? | Active theme (5 options including Cyberpunk Aurora), connection status |

## Robot Mode CLI

The `am robot` CLI provides 16 non-interactive subcommands optimized for agent consumption, organized into 5 operational tracks:

| Track | Objective | Example Commands |
|---|---|---|
| **Situational Awareness** | Get fast status before taking action | `am robot status --format toon`, `am robot health --format json` |
| **Message Triage** | Prioritize and acknowledge inbound tasks | `am robot inbox --format json --agent GreenCastle`, `am robot thread --format md bd-123` |
| **History Retrieval** | Recover past decisions before proposing changes | `am robot search --format json "auth refactor"` |
| **Edit Safety** | Inspect ownership, avoid reservation collisions | `am robot reservations --format json` |
| **Operator Reporting** | Produce machine-readable snapshots | `am robot status --format json > status.snapshot.json` |

Output formats: `toon` (token-efficient), `json` (structured), `md` (human-readable Markdown).

## Session Macros

Four macros collapse common multi-step workflows into single calls:

| Macro | What It Does | Returns |
|---|---|---|
| `macro_start_session` | Bootstraps project + agent + inbox in one call | `{project, agent, file_reservations, inbox}` |
| `macro_prepare_thread` | Joins existing conversations, catches agent up on thread history | Thread context + unread messages |
| `macro_file_reservation_cycle` | Manages reserve-work-release flows atomically | Reservation status |
| `macro_contact_handshake` | Sets up cross-agent contacts with approval handshake | Contact approval state |

`macro_start_session` is the most important: it takes a `project_key`, `program` (e.g., "claude-code"), `model` (e.g., "opus-4.6"), and `task_description`, then registers the agent, fetches the inbox, and returns everything needed to begin coordinating.

## Visualization System

The site features 50+ interactive visualization components built on a shared framework (`components/viz/viz-framework.tsx`):

**Framework primitives:**
- `VizSurface`: viewport-aware container with intersection observer
- `VizControlButton`: styled button with tone variants (info, success, warning, danger)
- `VizHeader`, `VizLearningBlock`, `VizMetricCard`: reusable UI blocks
- `LazyViz`: defers mounting until 600px from viewport
- `useVizInViewport()`, `useVizReducedMotion()`: performance hooks

**Visualization categories:**

| Category | Examples | Count |
|---|---|---|
| Core Coordination | File reservations, message lifecycle, agent handshake, build-slot coordination | ~6 |
| Swarm Dynamics | Swarm simulation, conflict cascade, territory map, human overseer | ~5 |
| Storage & Throughput | Dual-write pipeline, commit coalescer, race view, backpressure health | ~4 |
| Search & Retrieval | Search V3 pipeline, token economy, MCP resource flows | ~3 |
| Operator Surfaces | TUI screens, robot mode, dual-mode interface, Product Bus | ~4 |
| Architecture Maps | System topology, MCP architecture, Beads integration, reliability internals | ~4 |
| Stress & Resilience | Stress gauntlet, failure handling, load behaviors across shared state | ~3 |

### Showcase Highlights

The most complex visualizations simulate real coordination scenarios:

**Swarm Simulation.** Models steady-state deployment with five agents (GreenCastle, BlueLake, RedHarbor, GoldPeak, CoralBay) in a constellation layout. Message particles flow between agents in real time. File reservation bars track ownership. An event feed captures every coordination action. Metrics: message count, reservation count, task count, conflict count.

**Stress Gauntlet.** 10-scenario production readiness test. Each test progresses through idle/checking/pass states: Pool Warmup, Concurrent Project, Concurrent Agent, Message Pipeline, File Reservations, WBQ Saturation, Pool Exhaustion, Sustained Load, Thundering Herd, Inbox Storm. Every scenario has defined metrics and pass/fail thresholds.

**Territory Map.** Treemap visualization of file tree structure with four color-coded agents. Glob patterns match file indices to show ownership and reservation overlaps. Interactive scenario steps walk through the reservation lifecycle.

**Token Economy.** Side-by-side comparison of token consumption. Chat-based coordination burns ~12,000 tokens per step (broadcasts, replies, status updates). Agent Mail uses ~200 tokens per step (targeted MCP tool calls). Over 10 steps with a 200,000 token budget, that is a 60x reduction.

**Conflict Cascade.** Visualizes what happens without coordination: silent overwrites, wasted work, merge conflicts. Then shows how advisory reservations prevent the cascade before it starts.

**System Topology.** Animated flow diagram: CLI/Robot Mode → MCP Server → Tool Handlers → SQLite → Storage Layer → Git Archive. Three flow modes (Message in blue, Reservation in amber, Search in green) show how requests move through the system.

## Installation

### Option 1: Clone Repository

```bash
git clone https://github.com/Dicklesworthstone/mcp_agent_mail_website.git
cd mcp_agent_mail_website
bun install
```

### Option 2: Tarball via `curl`

```bash
export REPO_OWNER="Dicklesworthstone"
export REPO_NAME="mcp_agent_mail_website"
curl -fsSL "https://codeload.github.com/${REPO_OWNER}/${REPO_NAME}/tar.gz/refs/heads/master" \
  | tar -xz
cd "${REPO_NAME}-master"
bun install
```

### Option 3: Existing Local Checkout

```bash
cd /path/to/mcp_agent_mail_website
bun install
```

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   ```
2. Start development server:
   ```bash
   bun dev
   ```
3. Open `http://localhost:3000`.
4. Run checks before pushing:
   ```bash
   bun tsc --noEmit
   bun lint
   bun run build
   ```

## Command Reference

### Bun Scripts

| Command | Purpose |
|---|---|
| `bun dev` | Start Next.js dev server with Turbopack |
| `bun run build` | Build production bundle |
| `bun start` | Run production server |
| `bun lint` | Run ESLint |
| `bun tsc --noEmit` | Type-check without emit |
| `bun run test` | Run unit tests (Vitest) |
| `bun run test:watch` | Run Vitest in watch mode |
| `bun run test:e2e` | Run 7 Playwright E2E specs |
| `bun run test:e2e:ui` | Run Playwright in interactive UI mode |

### Issue Tracking (`br`)

| Command | Purpose |
|---|---|
| `br ready --json` | List unblocked issues |
| `br create "Title" -t task -p 2 --json` | Create issue |
| `br update br-42 --status in_progress --json` | Mark work in progress |
| `br close br-42 --reason "Done"` | Close completed issue |
| `br sync --flush-only` | Export issue state to `.beads/` |

### Bug Scanner (`ubs`)

| Command | Purpose |
|---|---|
| `ubs $(git diff --name-only --cached)` | Scan staged changes |
| `ubs --only=ts,tsx components/` | Scan specific scope |
| `ubs .` | Full project scan |

## Configuration

### Primary Config Files

| File | Purpose |
|---|---|
| `next.config.ts` | Next.js configuration (WebP images, compression, strict mode) |
| `tsconfig.json` | TypeScript settings (ES2017 target, strict, `@/` path alias) |
| `eslint.config.mjs` | ESLint flat config |
| `postcss.config.mjs` | Tailwind/PostCSS setup |
| `vitest.config.ts` | Test config (jsdom, v8 coverage, 70%+ thresholds) |
| `playwright.config.ts` | E2E config (multi-browser, artifact upload) |
| `lib/content.ts` | Main static site content source (3200+ lines) |

### Environment Variables

Core functionality has no required external API environment variables.

Example `.env.local`:

```bash
# Optional local-only values
# Do not commit this file
```

## Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                           Next.js App Router                            │
│  /, /showcase, /architecture, /spec-explorer, /getting-started,         │
│  /glossary                                                              │
└──────────────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Client Shell Layer                              │
│  SiteProvider (lab mode, audio SFX, keyboard shortcuts)                 │
│  + SiteHeader/Footer + GlowOrbits + transitions                        │
└──────────────────────────────────────────────────────────────────────────┘
                  │
        ┌─────────┴──────────────┐
        ▼                        ▼
┌───────────────────┐   ┌──────────────────────────────────────────────────┐
│ Content System    │   │ Visualization Subsystem                          │
│ lib/content.ts    │   │ VizSurface + LazyViz + 50+ viz components       │
│ Static copy/data  │   │ framer-motion animations + useReducedMotion      │
│ JSON-LD generators│   │ Viewport-aware lazy loading                      │
└───────────────────┘   └──────────────────────────────────────────────────┘
        │                        │
        ▼                        ▼
┌───────────────────┐   ┌──────────────────────────────────────────────────┐
│ UI Components     │   │ Spec Explorer Subsystem                          │
│ SectionShell,     │   │ TanStack Query/Table/Virtual + marked            │
│ HeroMedia, cards, │   │ Category-filtered markdown viewer                │
│ GlitchText, etc.  │   │ Keyboard-navigable search (/ to focus, Esc)     │
└───────────────────┘   └──────────────────────────────────────────────────┘
```

### Content Model

All site content lives in `lib/content.ts` (3200+ lines) as typed TypeScript exports:

| Export | Purpose |
|---|---|
| `siteConfig` | Name, title, description, URLs, social links |
| `navItems` | 6 main navigation routes |
| `heroStats` | Trust metrics (34 MCP Tools, 20+ Resources, 10/10 Stress Gauntlet, ~49 RPS) |
| `features` | 16 feature cards with descriptions and categories |
| `comparisonData` | 12-row comparison table (Agent Mail vs. Git Worktrees vs. Shared Docs vs. No Coordination) |
| `codeExample` / `codeExampleRobot` / `codeExampleCrossProject` | Three code blocks demonstrating core workflows |
| `toolClusterCopy` | 9 MCP tool clusters with representative tools |
| `resourceSurfaceCopy` | 20+ MCP resource URI patterns |
| `tuiScreenCopy` | 15 TUI screen descriptions |
| `robotCommandTrackCopy` | 5 CLI command tracks |
| `glossaryTerms` | Full glossary index |
| `faq` | Frequently asked questions |
| `testimonials` | Social proof (48 items) |
| `changelog` | Development timeline |
| `get*JsonLd()` | Five JSON-LD schema generators for SEO |

### Runtime Architecture & Operational Contracts

The architecture page and spec explorer are centered on the actual `mcp_agent_mail_rust` system design:

**Dual persistence.** Agent Mail writes coordination state into SQLite for fast queries while preserving a Git-auditable archive for messages, reservations, and profiles. The site visualizes this as the dual-write pipeline and commit coalescer.

**Dual-mode interface.** The docs cover the contract between the MCP-first server surface and the operator CLI surface, including deny UX, mode switching, rollout, and migration guidance.

**Search V3 migration.** A large part of the corpus is dedicated to the search stack transition: query contracts, quality gates, corpus design, component mapping, and rollout/rollback procedures.

**Operator surfaces.** The TUI product contract, parity matrix, developer guide, operator runbook, and web UI parity docs show how the 15-screen operations console and `/mail/*` surfaces are expected to behave.

**Release, cutover, and incident discipline.** The bundled specs include release gates, artifact schemas, deployment verification, Python-to-Rust import procedures, and real incident diagnostics from the Rust repo.

### Visual Design System

The site uses a dark theme with animated glass-morphism effects:

**GlowOrbits.** Eight-color spectrum (blue, cyan, orange, sky) rendered as three orbital rings with parallax mouse tracking. Spring physics (damping: 50, stiffness: 100) create smooth cursor-following motion. Rotation durations are staggered (30s, 38s, 46s) for depth. Intersection observer defers animation until the element enters the viewport. Reduced-motion media query disables all animation.

**SectionShell.** Reusable page section wrapper with eyebrow text, title, icon (40+ lucide-react options), kicker, and children. Desktop layout uses a sticky left sidebar (`lg:sticky lg:top-32`). Framer-motion reveal animations slide content in from the left. GlitchText hover effects on headings add visual texture.

**Color Palette.** Neon accent colors against dark backgrounds: blue (#3B82F6) for primary actions, orange (#F97316) for warnings and emphasis, green (#22C55E) for success states, purple (#8B5CF6) for advanced/formal concepts. Glass-morphism borders (`border-white/5`, `bg-white/[0.02]`) with gradient overlays and blur effects.

### Hero Media System

The hero section includes a video player with chapters and transcript:

- **Play/Pause controls** with accessible labels
- **Chapter navigation** with seek functionality (7 chapters from Cold Start through Get Started)
- **Searchable transcript** panel with full text of the 90-second walkthrough
- **Reduced-motion fallback** that shows a static poster image instead of autoplay
- **Accessible**, with aria-label describing demo content and WebVTT caption support

The demo walkthrough covers: cold start (single `am` command), agent registration (auto-generated identities), file reservations (TTL-based advisory locks), targeted messaging (threaded inboxes with ack tracking), hybrid search (lexical/semantic/hybrid modes), and the scale dashboard (real-time metrics).

### Lab Mode & Audio SFX

Hidden behind `Ctrl+Shift+X`, Lab Mode unlocks experimental features via the SiteProvider context. The audio SFX system synthesizes four sounds using the Web Audio API:

| Sound | Waveform | Frequency | Duration | Used For |
|---|---|---|---|---|
| click | Sine | 800Hz → 100Hz | 100ms | UI interactions |
| zap | Sine | 600Hz → 80Hz | 150ms | Transitions |
| hum | Triangle | 60Hz | 500ms | Ambient feedback |
| error | Square | 150Hz → 100Hz | 300ms | Error states |

Audio Context lifecycle is managed properly (created on first interaction, resumed after browser suspension). WebkitAudioContext fallback ensures Safari compatibility.

### Spec Explorer Deep Dive

The spec explorer now serves a site-authored library of `mcp_agent_mail_rust` explainers organized around the real system surfaces this website visualizes:

| Category | Representative Docs | Focus |
|---|---|---|
| **Core Concepts** | `agent-mail-at-a-glance`, `jargon-map` | Product mental model and vocabulary |
| **Coordination Flows** | `system-topology`, `message-lifecycle-and-threads`, `file-reservations-and-guardrails`, `product-bus-and-cross-project` | How work moves through the system |
| **Storage & Search** | `dual-write-and-commit-coalescer`, `search-v3-explained` | Persistence, indexing, ranking, and degradation behavior |
| **Interface Surfaces** | `mcp-surface-tools-resources-macros`, `operator-surfaces` | MCP tools/resources, robot CLI, TUI, and web UI responsibilities |
| **Reliability & Safety** | `reliability-and-safety` | Stress gauntlet, backpressure, privacy, auditability, and recovery |
| **Migration & Parity** | `migration-rollout-and-parity` | Python-to-Rust cutover, release discipline, and parity proofs |

The viewer uses TanStack Query for data fetching, TanStack Table for the sidebar index, TanStack Virtual for scroll performance on long documents, and `marked` + DOMPurify for XSS-safe markdown rendering. The docs intentionally cross-link to `/glossary`, `/architecture`, and `/showcase` so the prose and visual explanations reinforce each other. Keyboard navigation: `/` focuses search, `Escape` clears.

### Accessibility

**Reduced Motion.** The `useReducedMotion` hook (framer-motion) checks `prefers-reduced-motion: reduce` at the system level. GlowOrbits disables all orbital animations. Hero media shows a static poster instead of autoplaying video. All framer-motion animations are conditionally applied.

**Semantic HTML & ARIA.** Skip link at the top of every page for keyboard navigation. Aria-expanded on collapsible elements (chapters, transcript panels). Semantic heading hierarchy (h1 → h2 → h3). Alt text on images. Aria-labels on video and interactive elements.

**Keyboard Navigation.** `Ctrl+Shift+X` toggles lab mode (blocked during text input to prevent conflicts). Spec explorer search focuses on `/`, clears on `Escape`. All buttons and interactive elements are properly focusable.

### SEO & Structured Data

Five JSON-LD schema types are embedded in the page markup:

| Schema Type | What It Describes | Where Used |
|---|---|---|
| `SoftwareApplication` | Agent Mail as a developer tool | Root layout |
| `VideoObject` | Hero demo video with transcript + duration | Home page |
| `WebSite` | Site entity with publisher info | Root layout |
| `FAQPage` | Questions and answers | Getting Started |
| `HowTo` | Installation/quickstart instructions | Getting Started |

OpenGraph and Twitter Card meta tags are generated from `siteConfig` in the root layout, with dedicated image endpoints (`/opengraph-image`, `/twitter-image`).

## Testing

### Unit Tests (Vitest)

109 tests across 5 files in `__tests__/`:

| File | Tests | Coverage |
|---|---|---|
| `content.test.ts` | 50 | siteConfig, navItems, arrays, claims, testimonials, storyboard, transcript, media, JSON-LD |
| `navigation.test.ts` | 15 | Nav items, routes, features, glossary, changelog, FAQ, heroStats |
| `viz-state.test.ts` | 12 | Viz framework exports, chapter/caption validation, videoPlaceholder |
| `conversion.test.ts` | 15 | Adoption, credibility, testimonials, evidence claims, cross-module ID uniqueness |
| `ui-primitives.test.tsx` | 17 | JsonLd component, cn utility, isTextInputLike, VizSurface, VizControlButton, motion exports |

### E2E Tests (Playwright)

7 spec files in `e2e/`:

| Spec | Coverage |
|---|---|
| `smoke.spec.ts` | Page loads, basic navigation |
| `navigation.spec.ts` | Route transitions, nav bar behavior |
| `accessibility.spec.ts` | A11y scans, ARIA compliance |
| `metadata.spec.ts` | JSON-LD validation, OG tags, meta elements |
| `performance.spec.ts` | Core Web Vitals, load times |
| `hero-media.spec.ts` | Video playback, transcript, chapters |
| `visualizations.spec.ts` | Viz rendering, LazyViz triggers |

Custom diagnostics fixtures (`e2e/fixtures.ts`) capture console messages, network requests, and breadcrumb trails.

CI pipeline (`.github/workflows/test.yml`) runs both suites with artifact upload.

## Development Workflow

1. Pick work from `br ready`.
2. Implement changes.
3. Run checks:
   ```bash
   bun tsc --noEmit
   bun lint
   ubs --staged
   ```
4. Sync issue state:
   ```bash
   br sync --flush-only
   ```
5. Commit code and `.beads/` together.

## Troubleshooting

### `bun: command not found`

Install Bun first:

```bash
curl -fsSL https://bun.sh/install | bash
exec "$SHELL"
```

### `bun lint` reports errors in `.next_trash*` or generated files

Generated artifacts may be getting linted. Run lint on source files directly while investigating:

```bash
bun lint components/ app/ lib/
```

### Playwright error: missing browser binaries

Install required browsers:

```bash
bunx playwright install
```

### Vitest tests fail with missing jsdom

Ensure dev dependencies are installed:

```bash
bun install
```

### Next.js warning about multiple lockfiles

Set `turbopack.root` in `next.config.ts` or remove unrelated lockfiles in parent directories.

## Limitations

### What This Project Does Not Do

- No CMS-backed content authoring UI
- No built-in auth or account system
- No i18n/localized route support
- No server-side API endpoints for core site functionality
- Bun-only package management by project policy

### Known Constraints

| Capability | Current State | Notes |
|---|---|---|
| Live backend APIs | Not used | Site is entirely static + client-side interactive modules |
| Content authoring UI | Not supported | Edit `lib/content.ts` directly |
| Real-time data | Not implemented | Visualizations use simulated data, not live Agent Mail instances |
| Spec explorer SSR | Partial | Viewer is client-heavy by design (TanStack Query + Virtual) |

## FAQ

### What is MCP Agent Mail?

A coordination infrastructure for AI coding agents. It provides project-scoped identities, threaded messaging, advisory file reservations, hybrid search, and a 15-screen operations TUI, all exposed via 34 MCP tools. See the [engine source](https://github.com/Dicklesworthstone/mcp_agent_mail_rust).

### Is this the Agent Mail server itself?

No. This repository is the marketing and documentation website. The Rust server lives at [mcp_agent_mail_rust](https://github.com/Dicklesworthstone/mcp_agent_mail_rust).

### Where should I edit static site copy?

`lib/content.ts` is the single source of truth for all static content, features, comparisons, code examples, glossary, FAQ, testimonials, and JSON-LD structured data.

### Why are there 50+ visualization components?

Each visualization demonstrates a specific coordination concept interactively. File reservations, message lifecycles, swarm coordination, Search V3, storage internals, and stress behavior are all easier to understand through animation than prose.

### Which package manager is supported?

Only **Bun** (`bun install`, `bun dev`, etc.). Do not use npm, yarn, or pnpm.

### What checks should I run before push?

```bash
bun tsc --noEmit
bun lint
bun run test
bun run build
ubs --staged
```

For unit tests, use `bun run test` (Vitest). Plain `bun test` invokes Bun's native runner and can execute Playwright specs unintentionally.

### Do I need environment variables?

No, for core local development. If needed, use `.env.local` and do not commit it.

### How does the spec explorer work?

It fetches markdown files from `/public/spec-docs/`, renders them with `marked` + DOMPurify, and presents them in a dual-pane layout with TanStack Table for the sidebar index and TanStack Virtual for scroll performance. Search uses the `/` hotkey with debounced filtering.

### What does the architecture page and spec explorer cover?

They cover the actual `mcp_agent_mail_rust` design surface: MCP/CLI dual-mode behavior, SQLite + Git dual-write persistence, Search V3 migration contracts, TUI/web parity, rollout and release gates, Python-to-Rust import/cutover, and incident diagnostics pulled from the Rust repo’s documentation set.

### What is Lab Mode?

A hidden feature toggled with `Ctrl+Shift+X` that unlocks experimental site features. It includes a synthesized audio SFX system (click, zap, hum, error sounds via the Web Audio API).

### Do I need to configure every agent manually?

No. Running `am` auto-detects common coding agents and bootstraps MCP connectivity. Manual config snippets are available for Claude Code, Codex CLI, and Gemini CLI on the Getting Started page.

### Are file reservations mandatory locks?

No. They are advisory coordination primitives with conflict visibility. Other agents can see reservations and choose to respect them. The optional pre-commit guard (`mcp-agent-mail-guard`) enforces them at commit time, but can be bypassed with `AGENT_MAIL_BYPASS=1` for emergencies.

### How does Agent Mail avoid losing message history?

Messages are recorded in SQLite for query speed and exported into a Git-auditable archive. The dual-write pipeline ensures durability: SQLite is the source of truth for queries, Git is the source of truth for audit and recovery.

### What are the GlowOrbits?

The animated orbital rings visible in the site background. Eight colors, three rings with staggered rotation speeds (30s/38s/46s), parallax mouse tracking with spring physics. Disabled automatically when `prefers-reduced-motion` is set.

## Target Audience

The site is designed for three primary personas:

**Solo Builder.** An individual developer running 3-5 agents on a single repo. Without coordination they get silent file overwrites, merge conflicts, and lost work. Reservations prevent collisions, roster visibility shows what each agent is doing, threaded messaging enables handoffs, and audit trails explain what happened.

**Team Lead.** An engineering lead managing agent swarms across multiple repositories. Without visibility into what agents are doing across repos, there is no way to redirect an agent mid-session. The 15-screen TUI and Web UI provide real-time dashboards, Human Overseer messaging redirects agents, pre-commit guard enforces reservation discipline, and the searchable audit trail captures every decision.

**Platform Engineer.** Someone building internal multi-agent infrastructure for their organization. They need scalable coordination without vendor lock-in: open-source, MCP standard (works with any MCP-compatible agent), cross-provider (Claude, GPT, Gemini), and stress-tested at 30+ concurrent agents.

## Evidence-Backed Claims

Each major claim on the site has a corresponding verification source:

| Claim | Evidence |
|---|---|
| Runs 40-50 concurrent agents with zero coordination failures | Stress gauntlet scenario 7: 30+ agent pipelines at 49 RPS |
| 12-crate Rust workspace with zero unsafe code | Grep verification across all `.rs` files in engine repo |
| 9x reduction in Git commits through coalescing | Measured at 9:1 ratio in stress scenario |
| Automatic recovery from connection pool exhaustion | Stress gauntlet scenario 6 validates recovery |
| Handles thundering herd with zero errors | 30 agents hitting endpoint simultaneously in scenario 9 |
| Automatic stale lock detection and cleanup | Scenario 4 creates `.git/index.lock` and verifies cleanup |
| First open-source cross-provider multi-agent coordination | MCP standard, no vendor lock-in, works with any MCP client |
| 34 MCP tools covering full coordination lifecycle | Enumerable in 9 clusters |

## About Contributions

> *About Contributions:* Please don't take this the wrong way, but I do not accept outside contributions for any of my projects. I simply don't have the mental bandwidth to review anything, and it's my name on the thing, so I'm responsible for any problems it causes; thus, the risk-reward is highly asymmetric from my perspective. I'd also have to worry about other "stakeholders," which seems unwise for tools I mostly make for myself for free. Feel free to submit issues, and even PRs if you want to illustrate a proposed fix, but know I won't merge them directly. Instead, I'll have Claude or Codex review submissions via `gh` and independently decide whether and how to address them. Bug reports in particular are welcome. Sorry if this offends, but I want to avoid wasted time and hurt feelings. I understand this isn't in sync with the prevailing open-source ethos that seeks community contributions, but it's the only way I can move at this velocity and keep my sanity.

## License

No explicit license file is currently included in this repository snapshot. Unless or until a license is added by the project owner, default copyright protections apply.
