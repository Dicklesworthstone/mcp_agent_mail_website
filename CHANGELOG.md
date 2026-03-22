# Changelog

All notable changes to the MCP Agent Mail Website are documented here.

This project has no formal release tags or GitHub releases. Changes are organized chronologically by development phase, derived from the full commit history. Each entry links to its commit on GitHub.

Repository: <https://github.com/Dicklesworthstone/mcp_agent_mail_website>
Live site: <https://mcpagentmail.com>

---

## Phase 5 — Stability and Bug Fixes (2026-03-08 to 2026-03-16)

Maintenance period focused on repository hygiene and a targeted animation bug fix.

### Bug Fixes

- **Fix DataDebris particle corruption of shared mouse MotionValues** — The `DataDebris` component (floating hex/binary characters near code blocks) passed shared `mouseX`/`mouseY` MotionValues to each particle via `style={{ x, y }}` while simultaneously animating those same properties with `animate`. Framer-motion wrote keyframe values back into the shared MotionValues, causing the custom cursor to fly off to approximately `(0,0)` whenever the mouse entered a `<pre>` or `<code>` element. Since the native cursor was hidden via `cursor: none !important`, users saw no cursor at all. Fix wraps all particles in a single `motion.div` container that consumes MotionValues read-only, with individual particles using `style={{ left, top }}` for their own offsets. ([`ab83c7b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ab83c7b0e78a4d6179af04e4f035a1517d403995))

### Chores

- Remove three corrupt SQLite database files (`storage.sqlite3-wal.corrupt-*`, `storage.sqlite3.corrupt-*`) that were artifacts of a storage recovery event on 2026-03-04 and should never have been tracked. ([`de4ab63`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/de4ab639a25f9ec1285e6deb13f9996ac266a85c))
- Add ACFS ephemeral file patterns to `.gitignore` (core dumps, MCP config backups, agent-mail project IDs, SQLite corruption artifacts, beads DB recovery snapshots). ([`f79ee1a`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/f79ee1ae01eb2e7f23b19d1f9ec9eccb04d69e06))
- Snapshot beads issue tracker history from 2026-03-06 session (159-line JSONL). ([`2d3a4c9`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2d3a4c95ce3ec5760f5deb7f76702a3ef4da0524))

---

## Phase 4 — Spec Explorer, Hydration Safety, and Mobile Hardening (2026-03-05 afternoon)

The spec explorer was fully rebuilt: placeholder specs replaced with real Agent Mail documentation, the rendering pipeline replaced from DOMPurify to a React AST renderer, deep-linkable URL state added, and comprehensive mobile regression tests written.

### Spec Explorer

- **Replace placeholder spec registry with Agent Mail domain docs** — Replaced 26-entry placeholder registry (Formal Semantics, RaptorQ, Spork, etc.) with a 12-entry Agent Mail-native registry organized into 6 domain categories: Core Concepts, Coordination Flows, Storage & Search, Interface Surfaces, Reliability & Safety, and Migration & Parity. Added 42 markdown specification files to `public/spec-docs/` covering ADRs, SPECs, runbooks, incident reports, rollout playbooks, migration guides, TUI contracts, developer guide, operator runbook, release checklist, and vision doc. ([`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8))
- **Replace DOMPurify HTML rendering with React AST renderer** — The old approach parsed markdown to HTML, sanitized it with DOMPurify, and injected it as raw HTML via `dangerouslySetInnerHTML`. The new renderer walks `marked`'s token AST directly and produces React elements, enabling per-section color tones, code block copy-to-clipboard buttons, inter-document link resolution (clicking a `.md` reference navigates within the spec explorer), section navigation chips, and structured document stats (word count, read time, code/table/link counts). Removed ~174 lines of "Spec Explorer Prose" CSS that styled the old HTML output. ([`ac6d868`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ac6d868a103194dc4d777ffe209d8f31582979b3))
- **Deep-linkable URL state** — Full query-param-driven state (`?doc=`, `?category=`, `?q=`, `#section-id`) with browser history integration. `popstate` listener restores state on back/forward navigation. Reader progress tracked via scroll position and displayed as a gradient progress bar. Section rail gains animated dot indicators and `layoutId` spring animation for the active section highlight. Related-doc buttons carry `data-spec-related-doc` attributes for targeted E2E assertions. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8), [`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))

### Hydration Mismatch Fixes

- **Centralize reduced-motion access** — Several components imported `useReducedMotion` directly from framer-motion, which returns `null` on the server and a boolean on the client. Centralized all access through `@/components/motion` using `useSyncExternalStore` to return a stable `false` during SSR. Affected: `animated-number`, `client-shell`, `custom-cursor`, `robot-mascot`, `section-shell`, `sync-elements`, `glow-orbits`. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8))
- **Fix GlowOrbits parallax hydration** — Server rendered motion values at `0,0` while client immediately computed different values from actual viewport dimensions. Replaced `parallaxReady` state flag with a `getInitialPointerValue` helper providing stable initial values. ([`ac6d868`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ac6d868a103194dc4d777ffe209d8f31582979b3))
- **Fix hero-media conditional DOM tree** — Reduced-motion fallback branch rendered an `<Image>` element vs. the animated branch's TUI demo markup, guaranteeing a mismatch. Removed the conditional branch; animation timers simply do not fire when reduced motion is active. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8))
- **Fix decoding-text and glitch-text hydration** — Ensured client-only animation state initialization. ([`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))

### Mobile Responsive Fixes

- **Agent Flywheel** — Replaced broken CSS variable scaling with explicit responsive wrapper (300px to 600px) and deterministic scale transform (0.5 to 1.0). Gate `NodeHoverHUD` to desktop only, `BottomSheet` to mobile only. Switch `SyncContainer` overflow to hidden on mobile, visible at `lg+`. ([`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8))
- **Hero Media** — Add `min-w-0` to flex children, switch dashboard header to stacked layout on mobile, add `break-all` for long command strings. ([`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8))
- **File Reservation Viz** — Convert three-column horizontal layout to vertical stack on mobile (`flex-col`, `md:flex-row`). ([`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8))
- **Redesigned site header** — Responsive mobile navigation with animated hamburger menu and scroll-aware background blur transitions. ([`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))

### Testing

- **Mobile Playwright regression suite** — Four targeted regression tests running exclusively in the `mobile-chrome` project: hero media viewport bounds, file reservation overflow, flywheel bottom-sheet interaction, and home page hydration/runtime error check. Each test captures annotated screenshots and asserts `scrollWidth <= innerWidth`. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8))
- **Deep-link restoration test** — Navigates to a parameterized URL, verifies doc/category/fragment state, clicks a related doc, then uses `page.goBack()` to confirm history state restoration. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8))

---

## Phase 3 — UI Polish, Content Expansion, and Accessibility (2026-03-05 morning)

A full-day push adding new content sections, three new visualizations, extensive UI polish, accessibility improvements, and expanded test coverage.

### New Visualizations

- **Backpressure Health** (`backpressure-health-viz.tsx`) — Interactive system load and flow control monitoring. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- **Commit Coalescer** (`commit-coalescer-viz.tsx`) — Batched write optimization behavior visualization. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- **Conflict Cascade** (`conflict-cascade-viz.tsx`) — Reservation conflict propagation through agent networks. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))

### New Content Sections

- **Workflow Deltas** — Before/after comparison cards showing coordination improvements. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Proven Reliability** — Evidence grid with metrics from stress gauntlet testing. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Common Objections** — FAQ section with collapsible `<details>` elements. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Creator Insights** — Social proof quotes section. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Real-World Use Cases** — Grid section on the Getting Started page. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Technical Surface Map** — Tool clusters, resource URIs, TUI screens, and robot command tracks on the spec explorer page. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

### Accessibility

- Spec-explorer `MetricTile`: replace `dl`/`dt`/`dd` with `div`/`p` for semantic correctness. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- Glossary FAQ: add `aria-expanded` to accordion buttons. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- Tooltip: switch focus trigger from `group-focus-within` to `group-focus-visible` for keyboard-only activation. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- Add `prefers-reduced-motion: reduce` animation disabling in CSS. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- Robot mascot: respect `prefers-reduced-motion` across all animation props (`whileHover`, spring transitions, floating keyframe animations). ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

### Bug Fixes

- **Spec-explorer link resolution** — Add `resolveSpecDocFromHref`/`toSpecDocPublicHref` to `lib/spec-docs.ts` for safe inter-doc markdown link normalization. Fix `normalizeRenderedLinks` to rewrite relative `.md` links to public `/spec-docs/` paths. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- **Fix SVG gradient ID collisions** — `mcp-beads-integration-viz` generates unique IDs via React `useId()` hook when multiple instances render on the same page. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Fix invalid SVG attribute** — Replace `strokeDasharray="none"` with `undefined` in `obligation-flow`, `product-bus`, and `system-topology` vizzes. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Fix invalid timecode** — Correct `"00:60.000"` to `"01:00.000"` in `heroDemoTranscript`. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Tooltip mobile clipping** — Left-align on small screens (`left-0`), center on `sm+`. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Section shell overflow** — Remove `GlitchText` wrapper around heading to fix overflow/clipping. Add `min-w-0` and `break-words` for long titles. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

### Testing

- Add 5 new unit tests: spec-doc file existence, link resolution, public href generation, SpecSearch keyboard shortcuts (`/`, `Escape`). ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- Add agent handshake transition tests covering accept/reject branching, `rejected->request` loop, `messaging->unconnected` reset, and previous-state navigation. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- Extract `getNextHandshakeState()` and `getPreviousHandshakeState()` as exported pure functions for testability. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

### Documentation

- Add comprehensive 879-line project README covering architecture, tech stack, installation, testing, deployment, and contribution guidelines. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

---

## Phase 2 — Visualization Engine and Template Cleanup (2026-03-04 evening to 2026-03-05 early morning)

Rapid iteration building the full interactive visualization gallery, followed by aggressive removal of all inherited asupersync template code.

### Visualization Components — New

- **Search V3 Pipeline** (`search-v3-pipeline-viz.tsx`) — Hybrid search pipeline showing FTS5 + semantic + RRF fusion. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Product Bus** (`product-bus-viz.tsx`) — Cross-project message bus architecture diagram. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Reliability Internals** (`reliability-internals-viz.tsx`) — Circuit breaker, retry, and health monitoring. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Robot Mode** (`robot-mode-viz.tsx`) — Robot/TUI mode switching visualization. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **TUI Screens** (`tui-screens-viz.tsx`) — TUI dashboard screen tour. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Build Slot Coordinator** (`build-slot-coordinator-viz.tsx`) — Build concurrency slot management. ([`0d19902`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/0d199022cbee55d0ed733aff85d7f53a37111a74))
- **Human Overseer** (`human-overseer-viz.tsx`) — Operator compose and redirect flow. ([`0d19902`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/0d199022cbee55d0ed733aff85d7f53a37111a74))
- **Dual-Mode Interface** (`dual-mode-interface-viz.tsx`) — TUI + Web UI dual interface. ([`0d19902`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/0d199022cbee55d0ed733aff85d7f53a37111a74))
- **Token Economy** (`token-economy-viz.tsx`) — Token budget and allocation visualization. ([`4877558`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4877558a54f0a136e59b6cf089444eba05a80dfc))
- **Territory Map** (`territory-map-viz.tsx`) — Agent territory ownership visualization. ([`4877558`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4877558a54f0a136e59b6cf089444eba05a80dfc))
- **Message Lifecycle** (`message-lifecycle-viz.tsx`) — Animated message state machine (send, deliver, ack, archive). ([`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9))
- **System Topology** (`system-topology-viz.tsx`) — Interactive architecture diagram showing agent, server, and storage layers. ([`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9))
- **Viz Framework** (`viz-framework.tsx`) — Shared visualization utilities and base components for consistent rendering. ([`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9))
- **Agent Handshake** (`agent-handshake-viz.tsx`) — Identity lifecycle and contact handshake animation. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))
- **File Reservation** (`file-reservation-viz.tsx`) — Timeline animation and conflict resolution flows. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))
- **MCP Architecture** (`mcp-architecture-viz.tsx`) — MCP tool and resource architecture overview. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))
- **MCP Beads Integration** (`mcp-beads-integration-viz.tsx`) — Beads issue tracking integration diagram. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))

### Visualization Components — Major Upgrades

- **SVG path animations, glows, and framer-motion** — All existing viz components overhauled with proper SVG `<path>` elements, glowing effects, and framer-motion spring/keyframe animations replacing CSS transitions. ([`cce990a`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cce990af1e0ba782bdab3ba16d23c7f100a940df))
- **Search V3 + Territory Map + Robot Mode + Token Economy** — Massive visual overhaul with advanced SVG animations, glowing effects, and strict TypeScript compliance. ([`4877558`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4877558a54f0a136e59b6cf089444eba05a80dfc))
- **Product Bus + Reliability Internals** — Overhauled with dynamic SVGs, replacing O(n) array loops with optimized patterns. ([`19b4cdb`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/19b4cdb67507af9734770bfed3b0bafbb4cb5a54))
- **Stricter types and performance** — Remaining viz components (`commit-coalescer-race`, `dual-mode-interface`, `dual-write-pipeline`, `mcp-architecture`, `territory-map`, `obligation-flow`, `reliability-internals`, `stress-gauntlet`, `token-economy`, `swarm-simulation`, `system-topology`) refined with TypeScript strict mode fixes and responsive behavior improvements. ([`5954810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/5954810a9f783c0c47b8a8f1888c30affb2fd955))

### Template Cleanup

- **Remove asupersync routing and component references** — Massive cleanup of leftover asupersync template code from architecture and showcase route pages. Expanded `viz-framework.tsx` with shared registration system. ([`aa518be`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/aa518bea13910136b40992d13aa88acaff846cde))
- **Remove 30 asupersync visualization components** — Removed: `budget-algebra`, `calm-theorem`, `cancel-fuel`, `cancel-protocol`, `cancel-state-machine`, `cancellation-injection`, `capability-security`, `conformal-calibration`, `dpor-pruning`, `eprocess-monitor`, `exp3-scheduler`, `foata-fingerprint`, `fountain-code`, `lab-runtime`, `lyapunov-potential`, `macaroon-capability`, `macaroon-caveat`, `oracle-dashboard`, `region-tree`, `saga-compensation`, `scheduler-lanes`, `small-step-semantics`, `spectral-deadlock`, `spork-otp`, `test-oracles`, `tokio-comparison`, `trace-replay-stability`, `two-phase-effect`, `two-phase-effects`, and `problem-scenario`. Total: 6,754 lines deleted. ([`a0eeb5b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/a0eeb5b1f6d3377fd039b693639c006f36b409e3))
- **Remove stale Asupersync branding** from `globals.css` comments. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))

### Infrastructure

- **Testing framework** — Added Vitest (`vitest.config.ts`) and Playwright (`playwright.config.ts`) with unit tests (`__tests__/`: content validation, navigation, conversion tracking, viz state management, UI primitives) and 7 E2E specs (`e2e/`: accessibility, hero media, metadata, navigation, performance, smoke, visualizations). Added `lib/test-architecture.ts` for test helpers and `.github/workflows/test.yml` for CI. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **JSON-LD structured data** — New `JsonLd` component generating five schema.org types: `WebSite`, `SoftwareApplication`, `VideoObject`, `FAQPage`, and `HowTo`. Applied site-wide in `layout.tsx`, on Getting Started (FAQ + HowTo), and homepage (VideoObject). ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Hero Media component** — Dedicated `HeroMedia` component with chapter navigation and transcript panel, wrapped in Suspense with loading skeleton. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Homepage redesign** — Replaced placeholder visualization divs with lazy-loaded interactive components (`FileReservationViz`, `MessageLifecycleViz`, `AgentHandshakeViz`, `ReliabilityInternalsViz`). Added credibility evidence strip with hover-reveal tooltips and adoption social proof section. Added Git Worktrees vs Agent Mail side-by-side comparison grid. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))

### Performance

- Apply extreme optimization patterns to O(n) array loops across high-traffic UI components. ([`19b4cdb`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/19b4cdb67507af9734770bfed3b0bafbb4cb5a54), [`fff03b4`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/fff03b40c54b5c5a518b11a52cc7fa2a4cf86985))

### Bug Fixes

- Resolve ESLint warnings, fix React synchronous effect updates, and clean up unused imports. ([`3b2d630`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3b2d630a92a0b46d0da73854b309b7a133e2b1ff))
- Improve mascot interaction logic, scroll-to-top behavior, and site state management. Add custom cursor component. ([`8df9e5f`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/8df9e5fb37ab20c59608d20b93afdb0ee9bdca26))

### Content Architecture

- Streamline content architecture: simplify spec-explorer (~170 lines removed), refactor glossary term rendering, expand `content.ts` with ~400 lines of improved section metadata. Update webpack and image optimization settings in `next.config.ts`. ([`b57b597`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/b57b59741673ad0c4e08399c70b60606bffbe560))

---

## Phase 1 — Project Foundation (2026-03-04)

The site was scaffolded from an existing asupersync website template, then systematically rewritten to serve MCP Agent Mail. All content, components, and metadata were replaced in a single day.

### Initial Setup

- **Scaffold from asupersync_website** — Initial 597-file, 43,656-line scaffold using Next.js, React 19, TypeScript (strict), Tailwind CSS, and framer-motion. Configured for Bun package manager and Vercel deployment. ([`ef870fa`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ef870fa53ca83b949f78e06e8a7944cfa7f26164))

### Content Replacement

- **Replace all asupersync content with Agent Mail domain content** — Rewrote `lib/content.ts` with 16 Agent Mail features (identity, messaging, reservations, MCP tools, search, TUI, etc.), comparison table (Agent Mail vs Git Worktrees vs Shared Docs vs No Coordination), 3 code examples (session bootstrap, robot mode CLI, cross-project coordination), 5-phase changelog, 26 glossary terms, and 10 FAQ entries. Updated site URL to `mcpagentmail.com`. Removed tracked `node_modules` and SQLite database files. ([`4ff70e8`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4ff70e8d455a1a85d41f2446904242ec4ec1e945), [`052562b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/052562b1e1cd74e1a71e62edee5acbea62f8de87))

### Content System

- **Expand content system** — Added ~675 lines to `lib/content.ts` with comprehensive glossary entries, architecture documentation, spec explorer data, and showcase content. Added error boundary with retry functionality, expanded sitemap, refined social share images and favicon generation, improved comparison table and site header. Added `.vercelignore` for deployment exclusions. ([`aecf430`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/aecf430928b30f95b50a7b3304c3c02a7923d5be), [`855ab55`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/855ab55911a963381728c7c4ae30a7d65ca94eed))

### Homepage

- **Streamline homepage** — Removed 20+ dynamic viz component imports from the homepage that were causing heavy client-side bundle bloat. Visualizations relocated to dedicated route pages (architecture, showcase). Added `heroVideoPlaceholder` content configuration. Added ~708 lines to `lib/content.ts` covering Agent Mail's full feature surface: messaging protocol, file reservations, identity system, TUI dashboard, MCP tools, CLI commands, and architectural concepts. ([`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9))

---

## Commit Index

Full commit list in chronological order, for agent consumption and cross-referencing.

| Date | Hash | Type | Summary |
|------|------|------|---------|
| 2026-03-04 | [`ef870fa`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ef870fa53ca83b949f78e06e8a7944cfa7f26164) | scaffold | Initial scaffold from asupersync_website |
| 2026-03-04 | [`9eede1b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9eede1b4418c1b2758145f8fdf91cc92cbc8030a) | chore | Close bd-ty7.4.1 (hero narrative) |
| 2026-03-04 | [`4ff70e8`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4ff70e8d455a1a85d41f2446904242ec4ec1e945) | content | Replace asupersync content with Agent Mail |
| 2026-03-04 | [`aecf430`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/aecf430928b30f95b50a7b3304c3c02a7923d5be) | feat | Content system, error boundary, SEO |
| 2026-03-04 | [`855ab55`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/855ab55911a963381728c7c4ae30a7d65ca94eed) | feat | Additional documentation entries |
| 2026-03-04 | [`e5b753d`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/e5b753d24c034cbec9804b706a8cd34dfd227191) | chore | Update beads issue tracker |
| 2026-03-04 | [`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9) | feat | Streamline homepage, new viz components |
| 2026-03-04 | [`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e) | feat | Agent Mail visualizations on showcase page |
| 2026-03-04 | [`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82) | feat | Test infrastructure, JSON-LD SEO, hero media, homepage redesign |
| 2026-03-04 | [`0d19902`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/0d199022cbee55d0ed733aff85d7f53a37111a74) | feat | Build Slot, Human Overseer, Dual-Mode vizzes |
| 2026-03-04 | [`3b2d630`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3b2d630a92a0b46d0da73854b309b7a133e2b1ff) | fix | ESLint warnings, React effect updates |
| 2026-03-05 | [`cce990a`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cce990af1e0ba782bdab3ba16d23c7f100a940df) | feat | SVG paths, glows, framer-motion animations |
| 2026-03-05 | [`4877558`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4877558a54f0a136e59b6cf089444eba05a80dfc) | feat | Search V3, Territory Map, Robot Mode, Token Economy overhaul |
| 2026-03-05 | [`19b4cdb`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/19b4cdb67507af9734770bfed3b0bafbb4cb5a54) | refactor | Optimization patterns, Product Bus + Reliability SVGs |
| 2026-03-05 | [`fff03b4`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/fff03b40c54b5c5a518b11a52cc7fa2a4cf86985) | refactor | Optimization patterns across high-traffic components |
| 2026-03-05 | [`aa518be`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/aa518bea13910136b40992d13aa88acaff846cde) | fix | Cleanup leftover asupersync template code |
| 2026-03-05 | [`a0eeb5b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/a0eeb5b1f6d3377fd039b693639c006f36b409e3) | refactor | Remove 30 asupersync viz components (-6,754 lines) |
| 2026-03-05 | [`5954810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/5954810a9f783c0c47b8a8f1888c30affb2fd955) | refactor | Stricter types and performance for remaining vizzes |
| 2026-03-05 | [`b57b597`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/b57b59741673ad0c4e08399c70b60606bffbe560) | refactor | Streamline content architecture, update tests |
| 2026-03-05 | [`8df9e5f`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/8df9e5fb37ab20c59608d20b93afdb0ee9bdca26) | fix | Mascot, scroll, viz animations, site state |
| 2026-03-05 | [`f09f656`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/f09f656da57eb524893219680b68ebd83f755f7b) | chore | Update beads issue tracker |
| 2026-03-05 | [`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1) | fix | Spec-explorer links, accessibility, branding, tests |
| 2026-03-05 | [`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e) | feat | 3 new vizzes, UI polish, expanded tests |
| 2026-03-05 | [`b11d102`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/b11d10214076cfadec74a6d589e6c92dcf50d621) | chore | Ephemeral file patterns in .gitignore |
| 2026-03-05 | [`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b) | feat | New content sections, accessibility, SVG fixes |
| 2026-03-05 | [`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8) | feat | Agent Mail spec docs, mobile responsive fixes |
| 2026-03-05 | [`ac6d868`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ac6d868a103194dc4d777ffe209d8f31582979b3) | feat | React AST renderer, GlowOrbits hydration fix |
| 2026-03-05 | [`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8) | feat | Deep-linkable URLs, hydration fixes, mobile E2E |
| 2026-03-05 | [`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6) | feat | Deep-linkable URL state, mobile header, test coverage |
| 2026-03-08 | [`2d3a4c9`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2d3a4c95ce3ec5760f5deb7f76702a3ef4da0524) | chore | Beads issue tracker snapshot |
| 2026-03-10 | [`f79ee1a`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/f79ee1ae01eb2e7f23b19d1f9ec9eccb04d69e06) | chore | ACFS ephemeral file patterns in .gitignore |
| 2026-03-11 | [`de4ab63`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/de4ab639a25f9ec1285e6deb13f9996ac266a85c) | chore | Remove corrupt SQLite backup files |
| 2026-03-16 | [`ab83c7b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ab83c7b0e78a4d6179af04e4f035a1517d403995) | fix | DataDebris particle MotionValue corruption |
