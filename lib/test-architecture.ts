/**
 * Test Architecture, Coverage Matrix, and Logging Schema
 *
 * This file defines the complete test strategy for the MCP Agent Mail website.
 * It serves as the implementation blueprint for all test beads (bd-ty7.7.7.*).
 */

// ─── Coverage Matrix ────────────────────────────────────────────────────────
// Maps every route, component category, and feature area to required test types.

export interface CoverageTarget {
  area: string;
  unitTests: string[];
  e2eTests: string[];
  priority: "critical" | "high" | "medium";
}

export const coverageMatrix: CoverageTarget[] = [
  // Routes
  {
    area: "Home Page (/)",
    unitTests: [
      "Content data contracts (heroStats, features, codeExample export shapes)",
      "Homepage JSON-LD output matches schema.org spec",
      "Credibility highlights render all items",
      "Adoption messages map to correct personas",
    ],
    e2eTests: [
      "Full page load and hero visible",
      "Simulated TUI surface renders with deterministic event feed",
      "Chapter navigation opens and seeks simulation timeline correctly",
      "Transcript panel toggles and displays text",
      "Evidence strip renders all 5 credibility highlights",
      "Adoption CTA rail renders 3 persona cards",
      "Get Started CTA links to /getting-started",
      "Reduced-motion: hero uses static fallback image",
    ],
    priority: "critical",
  },
  {
    area: "Showcase Page (/showcase)",
    unitTests: [
      "Viz state machines advance correctly (file-reservation, reliability-internals, etc.)",
      "VizControlButton renders all tone variants",
      "Phase descriptions map 1:1 to SystemPhase union",
    ],
    e2eTests: [
      "All visualization sections visible on scroll",
      "Interactive controls respond (Next, Auto, Reset)",
      "Reduced-motion: animations disabled, static states shown",
      "No console errors during viz interactions",
    ],
    priority: "critical",
  },
  {
    area: "Architecture Page (/architecture)",
    unitTests: [
      "Architecture section data renders without errors",
    ],
    e2eTests: [
      "Page loads with all subsystem sections",
      "Internal links resolve to valid anchors",
      "Visualizations embedded in architecture load",
    ],
    priority: "high",
  },
  {
    area: "Getting Started (/getting-started)",
    unitTests: [
      "FAQ JSON-LD output matches FAQPage schema",
      "HowTo JSON-LD steps are ordered correctly",
      "Install command renders correct text",
    ],
    e2eTests: [
      "Copy button copies install command",
      "FAQ section expandable/collapsible",
      "All pillar cards render",
    ],
    priority: "critical",
  },
  {
    area: "Glossary (/glossary)",
    unitTests: [
      "Glossary terms sorted alphabetically",
      "Cross-reference links resolve to valid terms",
    ],
    e2eTests: [
      "Search/filter narrows visible terms",
      "Term definitions display on interaction",
    ],
    priority: "medium",
  },
  {
    area: "Spec Explorer (/spec-explorer)",
    unitTests: [
      "Spec data structures export correctly",
    ],
    e2eTests: [
      "Page loads with structured reference content",
    ],
    priority: "medium",
  },
  // Component Categories
  {
    area: "Visualization Components",
    unitTests: [
      "State machine: each phase transition produces expected state",
      "useMemo derivations are pure (no side effects)",
      "Worker status color/label mappers cover all variants",
      "Phase descriptions defined for all phases",
    ],
    e2eTests: [
      "Auto-play cycles through all phases",
      "Manual advance wraps from last to first phase",
      "Keyboard accessibility: controls focusable and activatable",
    ],
    priority: "high",
  },
  {
    area: "Shared UI Primitives",
    unitTests: [
      "SectionShell renders children with correct structure",
      "GlitchText applies effect classes",
      "Tooltip shows on hover/focus",
      "JsonLd renders valid script tag with correct type",
    ],
    e2eTests: [
      "Motion components respect prefers-reduced-motion",
      "Skip-to-content link visible on focus",
    ],
    priority: "high",
  },
  {
    area: "Content Data Contracts",
    unitTests: [
      "siteConfig has all required fields (name, url, github, social)",
      "navItems routes match existing page files",
      "All evidence-backed claims have non-empty source",
      "Community testimonials have unique IDs",
      "Storyboard scenes sum to totalDurationSeconds",
      "Caption cues have valid timestamp format (MM:SS.mmm)",
      "Chapter markers cover full demo timeline without gaps",
      "Simulated hero feed events include severity and timestamp metadata",
    ],
    e2eTests: [],
    priority: "high",
  },
  // Infrastructure
  {
    area: "SEO & Metadata",
    unitTests: [
      "JSON-LD generators produce valid schema.org objects",
      "OpenGraph metadata includes all required fields",
    ],
    e2eTests: [
      "Sitemap.xml returns 200 and lists all routes",
      "Robots.txt accessible",
      "OG image route returns valid image",
      "All pages have unique <title> tags",
    ],
    priority: "high",
  },
];

// ─── Fixture Strategy ───────────────────────────────────────────────────────

export interface FixtureConfig {
  /** Deterministic viewport sizes for E2E */
  viewports: { name: string; width: number; height: number }[];
  /** Clock and random seed control */
  deterministicControls: string[];
  /** Stable CSS selectors for E2E targeting */
  selectorStrategy: string;
  /** Retry and timeout policy */
  retryPolicy: {
    maxRetries: number;
    testTimeout: number;
    actionTimeout: number;
    navigationTimeout: number;
  };
}

export const fixtureConfig: FixtureConfig = {
  viewports: [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ],
  deterministicControls: [
    "Freeze Date.now() to a fixed timestamp for snapshot stability.",
    "Seed Math.random() via Playwright's page.evaluate for deterministic animation states.",
    "Disable CSS animations via prefers-reduced-motion: reduce for screenshot comparisons.",
    "Use Playwright's clock API to control setTimeout/setInterval in auto-play tests.",
  ],
  selectorStrategy:
    "Use data-testid attributes for E2E selectors. Fallback to aria-label for accessibility-critical elements. Avoid CSS class selectors.",
  retryPolicy: {
    maxRetries: 2,
    testTimeout: 30_000,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
};

// ─── Diagnostic Logging Schema ──────────────────────────────────────────────

export interface TestLogEntry {
  timestamp: string;
  testId: string;
  suite: "unit" | "e2e" | "a11y" | "perf";
  status: "pass" | "fail" | "skip" | "flaky";
  durationMs: number;
  errorMessage?: string;
  screenshot?: string;
  consoleLogs?: string[];
  networkErrors?: string[];
}

export interface TestRunSummary {
  runId: string;
  startedAt: string;
  completedAt: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  coveragePercent: number;
  entries: TestLogEntry[];
}

// ─── Failure Taxonomy ───────────────────────────────────────────────────────

export const failureSeverity = {
  P0: "Page won't load, critical user journey blocked, data corruption",
  P1: "Feature broken but page loads, degraded UX, wrong content displayed",
  P2: "Visual regression, animation glitch, non-blocking console error",
  P3: "Edge case, minor style inconsistency, tooltip misalignment",
} as const;

export const failureCategories = [
  "render-error",
  "hydration-mismatch",
  "console-error",
  "network-failure",
  "a11y-violation",
  "visual-regression",
  "performance-budget",
  "content-mismatch",
  "navigation-broken",
  "animation-stuck",
] as const;
