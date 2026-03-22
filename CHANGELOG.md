# Changelog

All notable changes to the **MCP Agent Mail Website** are documented here.

This project has no formal release tags or GitHub releases. Changes are organized by capability area within each development phase, derived from the full commit history. Every entry links to its commit on GitHub.

- Repository: <https://github.com/Dicklesworthstone/mcp_agent_mail_website>
- Live site: <https://mcpagentmail.com>
- Engine source: <https://github.com/Dicklesworthstone/mcp_agent_mail_rust>

---

## Phase 5 — Stability and Housekeeping (2026-03-08 through 2026-03-16)

A maintenance window focused on one targeted animation bug fix and repository hygiene.

### Animation / Cursor

- **Fix DataDebris particles corrupting shared mouse MotionValues** — The `DataDebris` component (floating hex/binary decorations near code blocks) passed the shared `mouseX`/`mouseY` MotionValues to each particle via `style={{ x, y }}` while simultaneously driving `animate={{ x, y }}` keyframes on the same properties. Framer-motion wrote keyframe values back into the shared MotionValues, so five particles continuously overwrote the cursor position with near-zero drift offsets. The custom cursor (outer ring, inner dot, crosshair) flew to approximately `(0, 0)` the instant the mouse entered any `<pre>` or `<code>` element, and because the native cursor was hidden with `cursor: none !important`, users saw no cursor at all. The fix wraps all particles in a single `motion.div` that consumes the shared MotionValues read-only, with individual particles using only `style={{ left, top }}` for their own offsets. ([`ab83c7b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ab83c7b0e78a4d6179af04e4f035a1517d403995))

### Repository Hygiene

- Remove three corrupt SQLite backup files (`storage.sqlite3-wal.corrupt-*`, `storage.sqlite3.corrupt-*`) that were artifacts of a storage recovery event on 2026-03-04 and should never have been tracked. ([`de4ab63`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/de4ab639a25f9ec1285e6deb13f9996ac266a85c))
- Add ACFS ephemeral file patterns to `.gitignore` (core dumps, MCP config backups, agent-mail project IDs, SQLite corruption artifacts, beads DB recovery snapshots). ([`f79ee1a`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/f79ee1ae01eb2e7f23b19d1f9ec9eccb04d69e06))
- Snapshot beads issue tracker history from 2026-03-06 session (159-line JSONL). ([`2d3a4c9`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2d3a4c95ce3ec5760f5deb7f76702a3ef4da0524))

---

## Phase 4 — Spec Explorer Rebuild, Hydration Safety, and Mobile Hardening (2026-03-05 afternoon)

The spec explorer received a ground-up rebuild: placeholder content replaced with real Agent Mail documentation, the rendering pipeline swapped from DOMPurify to a React AST renderer, deep-linkable URL state added, and comprehensive mobile regression tests written. Hydration mismatches were fixed across six components.

### Spec Explorer — Content

- **Replace placeholder spec registry with Agent Mail domain docs** — Swapped the 26-entry placeholder registry (Formal Semantics, RaptorQ, Spork, etc.) for a 12-entry Agent Mail-native registry organized into 6 domain categories: Core Concepts, Coordination Flows, Storage & Search, Interface Surfaces, Reliability & Safety, and Migration & Parity. Added 42 markdown specification files to `public/spec-docs/` covering ADRs, SPECs, runbooks, incident reports, rollout playbooks, migration guides, TUI contracts, developer guide, operator runbook, release checklist, and a vision document. Refactored `specDocs` from a flat array to a grouped `specDocSections` structure with auto-numbering. Updated category icons to `Search`, `Network`, `RefreshCw`, `AlertTriangle`. ([`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8))

### Spec Explorer — Rendering

- **Replace DOMPurify HTML rendering with React AST renderer** — The old pipeline parsed markdown to HTML, sanitized it with DOMPurify, and injected it via `dangerouslySetInnerHTML`. The new renderer walks `marked`'s token AST directly and produces React elements, enabling: per-section color tones with accent borders and halo backgrounds; code block copy-to-clipboard buttons; inter-document link resolution (clicking a `.md` reference navigates within the spec explorer instead of triggering a full page load); section-level navigation chips with heading icons; and structured document stats (word count, read time, code/table/link counts). Removed approximately 174 lines of "Spec Explorer Prose" CSS. DOMPurify is no longer imported by this component. ([`ac6d868`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ac6d868a103194dc4d777ffe209d8f31582979b3))

### Spec Explorer — URL State and Navigation

- **Deep-linkable URL state** — Full query-param-driven state (`?doc=`, `?category=`, `?q=`, `#section-id`) with proper browser history integration. A `popstate` listener restores state on back/forward navigation. `historyModeRef` tracks whether the next URL update should push (user-initiated) or replace (filter/scroll). Reader progress is tracked via scroll position and displayed as a gradient progress bar and percentage in both the overview header and the desktop section rail. The section rail gains animated dot indicators with a `layoutId` spring animation for the active section highlight. Related-doc buttons carry `data-spec-related-doc` attributes for targeted E2E assertions. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8), [`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))

### Hydration Mismatch Fixes

- **Centralize reduced-motion access** — Multiple components imported `useReducedMotion` directly from framer-motion, which returns `null` on the server and a boolean on the client. All access is now centralized through `@/components/motion` using `useSyncExternalStore` to return a stable `false` during SSR and the real preference only after hydration. Affected components: `animated-number`, `client-shell`, `custom-cursor`, `robot-mascot`, `section-shell`, `sync-elements`, `glow-orbits`. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8))
- **Fix GlowOrbits parallax hydration** — Server rendered motion values at `(0, 0)` while the client immediately computed different values from actual viewport dimensions, triggering a React hydration error. Replaced the `parallaxReady` state flag with a `getInitialPointerValue` helper providing stable initial values for the motion values themselves, removing the conditional style branch entirely. ([`ac6d868`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ac6d868a103194dc4d777ffe209d8f31582979b3))
- **Fix hero-media conditional DOM tree** — The reduced-motion fallback branch rendered an `<Image>` element while the animated branch rendered the TUI demo markup, guaranteeing a mismatch when the server picked one branch and the client the other. The conditional branch was removed; animation timers simply do not fire when reduced motion is active. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8))
- **Fix decoding-text and glitch-text hydration** — Ensure client-only animation state initialization so server and client render identical initial markup. ([`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))

### Mobile Responsive Layout

- **Agent Flywheel** — Replaced broken CSS variable scaling approach with explicit responsive wrapper (300px through 600px) and deterministic scale transform (0.5 through 1.0). `NodeHoverHUD` gated to desktop only; `BottomSheet` gated to mobile only. `SyncContainer` overflow set to hidden on mobile, visible at `lg+`. Added responsive padding/spacing throughout. ([`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8))
- **Hero Media** — Added `min-w-0` to all flex children in the TUI demo panel. Switched dashboard header from single-row to stacked layout on mobile (`flex-col gap-2`, `sm:flex-row`). Added `break-all` and `shrink-0` to prevent long command strings from blowing out containers. Hidden horizontal sweep animations below `md` breakpoint. ([`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8))
- **File Reservation Viz** — Converted the three-column horizontal agent-file-agent layout to a vertical stack on mobile (`flex-col`, `md:flex-row`) with connecting lines rotating from horizontal to vertical. Increased mobile min-height to 420px. ([`9c97318`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9c9731806516098e1fe41ecd3914b1251d7c27d8))
- **Redesigned site header** — Responsive mobile navigation with animated hamburger menu and scroll-aware background blur transitions. ([`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))

### Testing

- **Mobile Playwright regression suite** — Four targeted regression tests running exclusively in the `mobile-chrome` project: hero media stays within viewport bounds; file reservation visualization has no horizontal overflow; flywheel uses bottom-sheet dialog interaction without overflow; home page renders without hydration or runtime console errors. Each test captures annotated screenshots and asserts `scrollWidth <= innerWidth`. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8))
- **Deep-link restoration E2E test** — Navigates to a parameterized URL, verifies doc/category/fragment state, clicks a related doc, then uses `page.goBack()` to confirm browser history state is properly restored. ([`bc2d192`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/bc2d192e02c02ec7ba087125549f1e20710996a8))
- **Content unit tests** — Spec document structure validation tests added. ([`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))
- **Visualization E2E** — Refactored visualization E2E tests for deterministic assertions with shared test fixtures for consistent viewport configurations. ([`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))

### State Management

- Refactor `site-state.tsx` to use URL-synchronized state atoms with debounced hash updates, replacing the previous in-memory-only approach that lost context on page reload. ([`149baa1`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/149baa10c7faa3573d148394d0f7973ba0556ff6))

---

## Phase 3 — Content Expansion, UI Polish, and Accessibility (2026-03-05 morning)

A full-day push adding new homepage content sections, three new visualization components, extensive UI and accessibility improvements, expanded test coverage, and the first comprehensive README.

### New Content Sections

- **Workflow Deltas** — Before/after comparison cards showing how coordination transforms multi-agent workflows. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Proven Reliability** — Evidence grid with metrics drawn from stress gauntlet testing results. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Common Objections** — FAQ section using collapsible `<details>` elements for progressive disclosure. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Creator Insights** — Social proof quotes section. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Real-World Use Cases** — Grid section on the Getting Started page consuming `useCases` from `lib/content`. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Technical Surface Map** — Tool clusters, resource URIs, TUI screens, and robot command tracks added to the spec explorer page. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

### New Visualizations

- **Backpressure Health** (`backpressure-health-viz.tsx`) — Interactive system load and flow control monitoring visualization. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- **Commit Coalescer** (`commit-coalescer-viz.tsx`) — Batched write optimization behavior visualization. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- **Conflict Cascade** (`conflict-cascade-viz.tsx`) — Reservation conflict propagation through agent networks. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))

### Accessibility

- Replace `dl`/`dt`/`dd` with `div`/`p` in spec-explorer `MetricTile` for semantic correctness. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- Add `aria-expanded` to glossary FAQ accordion buttons. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- Switch tooltip focus trigger from `group-focus-within` to `group-focus-visible` for keyboard-only activation. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- Add `prefers-reduced-motion: reduce` animation disabling in CSS. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- Robot mascot: respect `prefers-reduced-motion` across all animation props (`whileHover`, spring transitions, floating keyframe animations) by gating on `enableMotion` flag. Replace `motion.circle` antenna tip with static circle. Group eye pupil and iris into `motion.g` containers to reduce animated node count. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

### Bug Fixes

- **Spec-explorer link resolution** — Add `resolveSpecDocFromHref` and `toSpecDocPublicHref` to `lib/spec-docs.ts` for safe inter-doc markdown link normalization. Fix `normalizeRenderedLinks` to rewrite relative `.md` links to public `/spec-docs/` paths instead of silently skipping them. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- **SVG gradient ID collisions** — `mcp-beads-integration-viz` now generates unique IDs via React `useId()` hook when multiple instances render on the same page. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Invalid SVG attribute** — Replace `strokeDasharray="none"` with `undefined` in `obligation-flow`, `product-bus`, and `system-topology` vizzes to avoid strict renderer warnings. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Invalid timecode** — Correct `"00:60.000"` to `"01:00.000"` in `heroDemoTranscript` within `lib/content.ts`. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Tooltip mobile clipping** — Left-align on small screens (`left-0`), center on `sm+` (`sm:left-1/2 sm:-translate-x-1/2`). Reposition caret arrow to match new alignment breakpoints. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- **Section shell overflow** — Remove `GlitchText` wrapper around heading to fix overflow/clipping issues. Add `min-w-0` to grid children and `break-words` to heading for long-title safety. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

### UI Polish

- Refine homepage layout, spacing, and content hierarchy. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- Expand site-header navigation with improved responsive behavior. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- Enhance mobile bottom sheet with smoother animations and better touch handling. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- Improve client-shell state management and layout calculations. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- Refine cursor tracking behavior, tooltip positioning and styling, and orbital glow effects. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- Expand flywheel animation with richer state transitions. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))

### Visualization Refinements

- **Agent Handshake** — Major refactor with improved animation flow, better state machine, and cleaner visual hierarchy. Extract `getNextHandshakeState()` and `getPreviousHandshakeState()` as exported pure functions for testability. Rename `DecisionMode` value `"deny"` to `"reject"` for consistency. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e), [`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- Territory map color scaling and boundary detection improvements. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))
- Stress gauntlet, swarm simulation, and reliability internals clarity and layout improvements. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))

### Testing

- 5 new unit tests: spec-doc file existence, link resolution, public href generation, `SpecSearch` keyboard shortcuts (`/`, `Escape`). ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))
- Agent handshake transition tests covering accept/reject branching from pending, `rejected->request` loop, `messaging->unconnected` reset, and previous-state navigation. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))
- Expand metadata validation coverage, update navigation test expectations and smoke test assertions. ([`4864f71`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4864f71116a8d3b7a606f37a7aeb00c9bc42b42e))

### Documentation

- Add comprehensive 879-line project README covering architecture, tech stack, routes, 34 MCP tools, 20+ resources, 15-screen TUI, robot mode CLI, session macros, visualization system, installation, testing, deployment, and contribution guidelines. ([`2e01cfe`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/2e01cfecdd9425b607c3c1ae469e951028768f3b))

---

## Phase 2 — Visualization Engine, Testing Infrastructure, and Template Cleanup (2026-03-04 evening through 2026-03-05 early morning)

Rapid iteration building the full interactive visualization gallery (18 new components), standing up the test framework (Vitest + Playwright), adding JSON-LD structured data, redesigning the homepage, and then aggressively removing all inherited asupersync template code.

### Visualization Components — Core Coordination

- **Agent Handshake** (`agent-handshake-viz.tsx`) — Identity lifecycle and contact handshake animation with state machine. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))
- **File Reservation** (`file-reservation-viz.tsx`) — Timeline animation and conflict resolution flows showing exclusive/shared lease mechanics. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))
- **Message Lifecycle** (`message-lifecycle-viz.tsx`) — Animated message state machine: send, deliver, ack, archive. ([`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9))
- **Build Slot Coordinator** (`build-slot-coordinator-viz.tsx`) — Build concurrency slot management and contention visualization. ([`0d19902`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/0d199022cbee55d0ed733aff85d7f53a37111a74))
- **Human Overseer** (`human-overseer-viz.tsx`) — Operator compose and agent redirect flow. ([`0d19902`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/0d199022cbee55d0ed733aff85d7f53a37111a74))

### Visualization Components — Architecture and Search

- **MCP Architecture** (`mcp-architecture-viz.tsx`) — MCP tool and resource architecture overview showing the 34-tool, 20-resource surface. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))
- **MCP Beads Integration** (`mcp-beads-integration-viz.tsx`) — Beads issue tracking integration diagram. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))
- **System Topology** (`system-topology-viz.tsx`) — Animated flow diagram: CLI/Robot Mode through MCP Server through Tool Handlers through SQLite through Storage Layer through Git Archive. Three flow modes (message in blue, reservation in amber, search in green). ([`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9))
- **Search V3 Pipeline** (`search-v3-pipeline-viz.tsx`) — Hybrid search pipeline showing FTS5 + semantic + RRF fusion. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Token Economy** (`token-economy-viz.tsx`) — Side-by-side token budget comparison: chat-based coordination (~12,000 tokens/step) vs Agent Mail (~200 tokens/step). ([`4877558`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4877558a54f0a136e59b6cf089444eba05a80dfc))
- **Territory Map** (`territory-map-viz.tsx`) — Treemap visualization of file tree structure with four color-coded agents, glob pattern matching, and interactive reservation lifecycle scenarios. ([`4877558`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4877558a54f0a136e59b6cf089444eba05a80dfc))

### Visualization Components — Operator Surfaces

- **Product Bus** (`product-bus-viz.tsx`) — Cross-project message bus architecture diagram. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Reliability Internals** (`reliability-internals-viz.tsx`) — Circuit breaker, retry, and health monitoring. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Robot Mode** (`robot-mode-viz.tsx`) — Robot/TUI mode switching visualization. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **TUI Screens** (`tui-screens-viz.tsx`) — TUI dashboard screen tour across 15 operational screens. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Dual-Mode Interface** (`dual-mode-interface-viz.tsx`) — TUI + Web UI dual interface visualization. ([`0d19902`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/0d199022cbee55d0ed733aff85d7f53a37111a74))

### Visualization Components — Shared Framework

- **Viz Framework** (`viz-framework.tsx`) — Shared visualization utilities and base components: `VizSurface` (viewport-aware container with intersection observer), `VizControlButton` (styled button with tone variants), `VizHeader`, `VizLearningBlock`, `VizMetricCard`, `LazyViz` (defers mounting until 600px from viewport), `useVizInViewport()`, and `useVizReducedMotion()`. ([`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9))

### Visualization Components — Visual Quality Upgrades

- **SVG path animations, glows, and framer-motion** — All existing viz components overhauled with proper SVG `<path>` elements, glowing effects, and framer-motion spring/keyframe animations replacing CSS transitions. File reservation, human overseer, MCP architecture, and MCP beads integration components received the most extensive rework. ([`cce990a`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cce990af1e0ba782bdab3ba16d23c7f100a940df))
- **Search V3, Territory Map, Robot Mode, Token Economy** — Massive visual overhaul with advanced SVG animations, glowing effects, and strict TypeScript compliance. ([`4877558`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4877558a54f0a136e59b6cf089444eba05a80dfc))
- **Product Bus and Reliability Internals** — Overhauled with dynamic SVGs, replacing O(n) array loops with optimized rendering patterns. Added swarm simulation and stress gauntlet components. ([`19b4cdb`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/19b4cdb67507af9734770bfed3b0bafbb4cb5a54))
- **Stricter types and performance** — Remaining viz components (`commit-coalescer-race`, `dual-mode-interface`, `dual-write-pipeline`, `mcp-architecture`, `territory-map`, `obligation-flow`, `reliability-internals`, `stress-gauntlet`, `token-economy`, `swarm-simulation`, `system-topology`) refined with TypeScript strict mode fixes, responsive behavior improvements, and spec-viewer search/navigation overhaul. ([`5954810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/5954810a9f783c0c47b8a8f1888c30affb2fd955))

### Testing Infrastructure

- **Vitest + Playwright** — Added `vitest.config.ts` (jsdom, v8 coverage, 70%+ thresholds) and `playwright.config.ts` (multi-browser, artifact upload). Unit tests in `__tests__/` covering content validation, navigation, conversion tracking, viz state management, and UI primitives. Seven E2E specs in `e2e/` covering accessibility, hero media, metadata, navigation, performance, smoke tests, and visualizations. Added `lib/test-architecture.ts` for test helpers and `.github/workflows/test.yml` for CI. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))

### SEO and Structured Data

- **JSON-LD structured data** — New `JsonLd` component generating five schema.org types: `WebSite`, `SoftwareApplication`, `VideoObject`, `FAQPage`, and `HowTo`. Applied site-wide in `layout.tsx`, on Getting Started (FAQ + HowTo), and on the homepage (VideoObject). Generator functions added to `lib/content.ts`. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))

### Homepage Redesign

- **Hero Media component** — Dedicated `HeroMedia` component with chapter navigation and transcript panel support, wrapped in Suspense with loading skeleton for progressive rendering. Replaced inline video placeholder. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))
- **Interactive homepage** — Replaced placeholder visualization divs with lazy-loaded real components (`FileReservationViz`, `MessageLifecycleViz`, `AgentHandshakeViz`, `ReliabilityInternalsViz`). Added credibility evidence strip with hover-reveal context tooltips and adoption social proof section with rotating trust messages. Added side-by-side Git Worktrees vs Agent Mail feature comparison grid. ([`cfcbd27`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/cfcbd27295862b98fa53a139676cdd7bdc99ee82))

### Template Cleanup

- **Remove asupersync routing and component references** — Massive cleanup of leftover asupersync template code from architecture and showcase route pages. Expanded `viz-framework.tsx` with a shared registration system. ([`aa518be`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/aa518bea13910136b40992d13aa88acaff846cde))
- **Remove 30 asupersync visualization components** — Deleted: `budget-algebra`, `calm-theorem`, `cancel-fuel`, `cancel-protocol`, `cancel-state-machine`, `cancellation-injection`, `capability-security`, `conformal-calibration`, `dpor-pruning`, `eprocess-monitor`, `exp3-scheduler`, `foata-fingerprint`, `fountain-code`, `lab-runtime`, `lyapunov-potential`, `macaroon-capability`, `macaroon-caveat`, `oracle-dashboard`, `region-tree`, `saga-compensation`, `scheduler-lanes`, `small-step-semantics`, `spectral-deadlock`, `spork-otp`, `test-oracles`, `tokio-comparison`, `trace-replay-stability`, `two-phase-effect`, `two-phase-effects`, and `problem-scenario`. Total: 6,754 lines removed. ([`a0eeb5b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/a0eeb5b1f6d3377fd039b693639c006f36b409e3))
- **Remove stale Asupersync branding** from `globals.css` comments. ([`1e7fbb6`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/1e7fbb69d2a7037b60313f8505218a210abfc1a1))

### Performance

- Apply extreme optimization patterns to O(n) array loops across high-traffic UI components (homepage, agent flywheel, feature cards, site header). ([`fff03b4`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/fff03b40c54b5c5a518b11a52cc7fa2a4cf86985), [`19b4cdb`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/19b4cdb67507af9734770bfed3b0bafbb4cb5a54))

### Bug Fixes

- Resolve ESLint warnings, fix React synchronous effect updates, and clean up unused imports across commit-coalescer-race, dual-write-pipeline, territory-map, and token-economy. ([`3b2d630`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3b2d630a92a0b46d0da73854b309b7a133e2b1ff))
- Add custom cursor component, improve mascot interaction logic, scroll-to-top behavior, and site state management with new flags. ([`8df9e5f`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/8df9e5fb37ab20c59608d20b93afdb0ee9bdca26))

### Content Architecture

- Streamline content architecture: simplify spec-explorer page (~170 lines removed), refactor glossary term rendering and filtering, simplify architecture page structure. Expand `content.ts` with ~400 lines of improved section metadata, feature descriptions, and visualization mappings. Add webpack and image optimization settings in `next.config.ts`. Add ESLint rule configurations. ([`b57b597`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/b57b59741673ad0c4e08399c70b60606bffbe560))

---

## Phase 1 — Project Foundation (2026-03-04)

The site was scaffolded from an existing asupersync website template and systematically rewritten to serve MCP Agent Mail. All content, components, and metadata were replaced in a single day.

### Scaffold

- **Initial scaffold from asupersync_website** — 597-file, 43,656-line starting point using Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict mode), Tailwind CSS 4, framer-motion, and lucide-react. Configured for Bun package manager and Vercel deployment. Includes six routes: `/` (landing), `/showcase` (visualization gallery), `/architecture` (engine internals), `/spec-explorer` (specification browser), `/getting-started` (onboarding guide), `/glossary` (terminology reference). ([`ef870fa`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ef870fa53ca83b949f78e06e8a7944cfa7f26164))

### Content Replacement

- **Replace all asupersync content with Agent Mail domain content** — Complete rewrite of `lib/content.ts` with: 16 Agent Mail features (identity, messaging, reservations, MCP tools, search, TUI, etc.); comparison table (Agent Mail vs Git Worktrees vs Shared Docs vs No Coordination); 3 code examples (session bootstrap, robot mode CLI, cross-project coordination); 5-phase changelog; 26 glossary terms; and 10 FAQ entries. Updated site URL to `mcpagentmail.com`. Removed tracked SQLite database files. ([`4ff70e8`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4ff70e8d455a1a85d41f2446904242ec4ec1e945))
- **Remove node_modules from git tracking** — Deleted 25,982 files (3.88M lines) of tracked `node_modules`. ([`052562b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/052562b197755b3bc195e97147b3717386a12df3))

### Content System

- **Expand content system** — Added ~675 lines to `lib/content.ts` with comprehensive glossary entries, architecture documentation, spec explorer data, and showcase content. Added client-side error boundary (`app/error.tsx`) with retry functionality. Expanded sitemap with new content pages. Refined social share images (`opengraph-image.tsx`, `twitter-image.tsx`) and favicon generation (`icon.tsx`). Improved comparison table, site header, stats grid, and timeline components. Added `.vercelignore` for deployment exclusions (build artifacts, beads, git, core dumps, SQLite files). ([`aecf430`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/aecf430928b30f95b50a7b3304c3c02a7923d5be))
- **Additional documentation entries** — 168 more lines of content entries in `lib/content.ts`. ([`855ab55`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/855ab55911a963381728c7c4ae30a7d65ca94eed))

### Homepage

- **Streamline homepage** — Removed 20+ dynamic viz component imports that were causing heavy client-side bundle bloat and slow initial page loads. Visualizations relocated to dedicated route pages (architecture, showcase) where they are contextually appropriate. Added `heroVideoPlaceholder` content configuration. Expanded `lib/content.ts` with ~708 lines covering Agent Mail's full feature surface: messaging protocol, file reservations, identity system, TUI dashboard, MCP tools, CLI commands, and architectural concepts. Each entry includes route-aligned metadata, source anchors, and proof-point inventory. ([`3442151`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/3442151a2f7d05db50385b9b7708a47e686dccf9))

### Early Visualizations

- **MCP Agent Mail showcase** — First four visualization components added to the showcase page: `agent-handshake-viz`, `file-reservation-viz`, `mcp-architecture-viz`, and `mcp-beads-integration-viz`. ([`9714810`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/97148105400e817ac58a4270d4577f1c9dbec19e))

---

## Commit Index

Complete commit list in chronological order for cross-referencing. Chore-only commits (beads tracker updates, gitignore changes) are included for completeness.

| Date | Hash | Category | Summary |
|------|------|----------|---------|
| 2026-03-04 | [`ef870fa`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/ef870fa53ca83b949f78e06e8a7944cfa7f26164) | scaffold | Initial scaffold from asupersync_website |
| 2026-03-04 | [`9eede1b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/9eede1b4418c1b2758145f8fdf91cc92cbc8030a) | chore | Close bd-ty7.4.1 (hero narrative) |
| 2026-03-04 | [`4ff70e8`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/4ff70e8d455a1a85d41f2446904242ec4ec1e945) | content | Replace asupersync content with Agent Mail |
| 2026-03-04 | [`052562b`](https://github.com/Dicklesworthstone/mcp_agent_mail_website/commit/052562b197755b3bc195e97147b3717386a12df3) | chore | Remove node_modules from git tracking |
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
