export interface SpecDoc {
  slug: string;
  title: string;
  filename: string;
  category: string;
  description: string;
  order: number;
}

export const specCategories = [
  "Formal Semantics",
  "Testing",
  "Security",
  "RaptorQ",
  "Spork",
  "Operations",
  "Development",
] as const;

export type SpecCategory = (typeof specCategories)[number];

export const specDocs: SpecDoc[] = [
  // ── Formal Semantics ─────────────────────────────────────────────
  {
    slug: "formal-semantics",
    title: "V4 Formal Semantics",
    filename: "asupersync_v4_formal_semantics.md",
    category: "Formal Semantics",
    description: "Complete formal semantics specification for the Agent Mail v4 runtime.",
    order: 1,
  },
  {
    slug: "calm-analysis",
    title: "CALM Analysis",
    filename: "calm_analysis.md",
    category: "Formal Semantics",
    description: "Consistency As Logical Monotonicity analysis of runtime invariants.",
    order: 2,
  },
  {
    slug: "otp-comparison",
    title: "OTP Comparison",
    filename: "otp_comparison.md",
    category: "Formal Semantics",
    description: "Comparison of Agent Mail's supervision model with Erlang/OTP.",
    order: 3,
  },

  // ── Testing ──────────────────────────────────────────────────────
  {
    slug: "cancellation-testing",
    title: "Cancellation Testing",
    filename: "cancellation-testing.md",
    category: "Testing",
    description: "Test strategies and harnesses for validating cancel-correctness.",
    order: 4,
  },
  {
    slug: "benchmarking",
    title: "Benchmarking",
    filename: "benchmarking.md",
    category: "Testing",
    description: "Performance benchmarks and methodology for the Agent Mail runtime.",
    order: 5,
  },
  {
    slug: "replay-debugging",
    title: "Replay Debugging",
    filename: "replay-debugging.md",
    category: "Testing",
    description: "Deterministic replay infrastructure for reproducing concurrency bugs.",
    order: 6,
  },

  // ── Security ─────────────────────────────────────────────────────
  {
    slug: "security-threat-model",
    title: "Security Threat Model",
    filename: "security_threat_model.md",
    category: "Security",
    description: "Threat model covering capability isolation, resource exhaustion, and side-channels.",
    order: 7,
  },
  {
    slug: "threat-model",
    title: "THREAT_MODEL",
    filename: "THREAT_MODEL.md",
    category: "Security",
    description: "Top-level threat model document with attack trees and mitigations.",
    order: 8,
  },

  // ── RaptorQ ──────────────────────────────────────────────────────
  {
    slug: "raptorq-baseline-bench",
    title: "RaptorQ Baseline Bench Profile",
    filename: "raptorq_baseline_bench_profile.md",
    category: "RaptorQ",
    description: "Baseline benchmarks for the RaptorQ forward-error-correction codec.",
    order: 9,
  },
  {
    slug: "raptorq-rollout-policy",
    title: "RaptorQ Controlled Rollout Policy",
    filename: "raptorq_controlled_rollout_policy.md",
    category: "RaptorQ",
    description: "Staged rollout plan for enabling RaptorQ in production.",
    order: 10,
  },
  {
    slug: "raptorq-expected-loss",
    title: "RaptorQ Expected Loss Contract",
    filename: "raptorq_expected_loss_decision_contract.md",
    category: "RaptorQ",
    description: "Decision contract for acceptable packet-loss thresholds.",
    order: 11,
  },
  {
    slug: "raptorq-optimization",
    title: "RaptorQ Optimization Records",
    filename: "raptorq_optimization_decision_records.md",
    category: "RaptorQ",
    description: "ADRs for RaptorQ performance optimizations.",
    order: 12,
  },
  {
    slug: "raptorq-closure-backlog",
    title: "RaptorQ Closure Backlog",
    filename: "raptorq_post_closure_opportunity_backlog.md",
    category: "RaptorQ",
    description: "Post-closure opportunity backlog for further RaptorQ improvements.",
    order: 13,
  },
  {
    slug: "raptorq-closure-signoff",
    title: "RaptorQ Closure Signoff",
    filename: "raptorq_program_closure_signoff_packet.md",
    category: "RaptorQ",
    description: "Program closure signoff packet for RaptorQ implementation.",
    order: 14,
  },
  {
    slug: "raptorq-rfc6330",
    title: "RaptorQ RFC 6330 Clause Matrix",
    filename: "raptorq_rfc6330_clause_matrix.md",
    category: "RaptorQ",
    description: "Compliance matrix mapping RFC 6330 clauses to implementation.",
    order: 15,
  },
  {
    slug: "raptorq-unit-tests",
    title: "RaptorQ Unit Test Matrix",
    filename: "raptorq_unit_test_matrix.md",
    category: "RaptorQ",
    description: "Comprehensive unit test coverage matrix for the RaptorQ codec.",
    order: 16,
  },

  // ── Spork ────────────────────────────────────────────────────────
  {
    slug: "spork-deterministic-ordering",
    title: "Spork Deterministic Ordering",
    filename: "spork_deterministic_ordering.md",
    category: "Spork",
    description: "Deterministic ordering guarantees for Spork (spawn+fork) operations.",
    order: 17,
  },
  {
    slug: "spork-glossary-invariants",
    title: "Spork Glossary & Invariants",
    filename: "spork_glossary_invariants.md",
    category: "Spork",
    description: "Glossary of Spork terms and the invariants they must maintain.",
    order: 18,
  },
  {
    slug: "spork-operational-semantics",
    title: "Spork Operational Semantics",
    filename: "spork_operational_semantics.md",
    category: "Spork",
    description: "Formal operational semantics of the Spork concurrency primitive.",
    order: 19,
  },

  // ── Operations ───────────────────────────────────────────────────
  {
    slug: "deadline-monitoring",
    title: "Deadline Monitoring",
    filename: "deadline-monitoring.md",
    category: "Operations",
    description: "Runtime deadline monitoring and alerting infrastructure.",
    order: 20,
  },
  {
    slug: "runtime-state-contention",
    title: "Runtime State Contention Inventory",
    filename: "runtime_state_contention_inventory.md",
    category: "Operations",
    description: "Catalog of contention points in the runtime's shared state.",
    order: 21,
  },
  {
    slug: "scheduler-arena-plan",
    title: "Scheduler Arena Plan",
    filename: "scheduler_arena_plan.md",
    category: "Operations",
    description: "Arena allocation strategy for the three-lane scheduler.",
    order: 22,
  },
  {
    slug: "integration",
    title: "Integration Guide",
    filename: "integration.md",
    category: "Operations",
    description: "Guide for integrating Agent Mail with existing Rust projects.",
    order: 23,
  },

  // ── Development ──────────────────────────────────────────────────
  {
    slug: "api-audit",
    title: "API Audit",
    filename: "api_audit.md",
    category: "Development",
    description: "Audit of the public API surface for consistency and ergonomics.",
    order: 24,
  },
  {
    slug: "macro-dsl",
    title: "Macro DSL",
    filename: "macro-dsl.md",
    category: "Development",
    description: "Design of the #[agent_mail::main] and Region macro DSL.",
    order: 25,
  },
  {
    slug: "bead-harmonization",
    title: "Bead Harmonization Migration",
    filename: "bead-harmonization-migration.md",
    category: "Development",
    description: "Migration plan for harmonizing bead-based task tracking.",
    order: 26,
  },
];

const specDocFilenameLookup = new Map(
  specDocs.map((doc) => [doc.filename.toLowerCase(), doc]),
);

export function resolveSpecDocFromHref(href: string): SpecDoc | null {
  const trimmed = href.trim();
  if (!trimmed) return null;

  if (/^(?:https?:|mailto:|tel:|#)/i.test(trimmed)) {
    return null;
  }

  const withoutFragment = trimmed.split("#", 1)[0] ?? "";
  const withoutQuery = withoutFragment.split("?", 1)[0] ?? "";
  const segments = withoutQuery.split("/").filter(Boolean);
  const basename = segments.at(-1)?.trim().toLowerCase();
  if (!basename || !basename.endsWith(".md")) {
    return null;
  }

  return specDocFilenameLookup.get(basename) ?? null;
}

export function toSpecDocPublicHref(href: string): string | null {
  const doc = resolveSpecDocFromHref(href);
  if (!doc) return null;

  const hashIndex = href.indexOf("#");
  const fragment = hashIndex >= 0 ? href.slice(hashIndex) : "";
  return `/spec-docs/${encodeURIComponent(doc.filename)}${fragment}`;
}
