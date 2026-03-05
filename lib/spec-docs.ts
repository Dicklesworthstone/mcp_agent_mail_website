export interface SpecDoc {
  slug: string;
  title: string;
  filename: string;
  category: string;
  description: string;
  order: number;
}

export const specCategories = [
  "Core Concepts",
  "Coordination Flows",
  "Storage & Search",
  "Interface Surfaces",
  "Reliability & Safety",
  "Migration & Parity",
] as const;

export type SpecCategory = (typeof specCategories)[number];

const specDocSections = [
  {
    category: "Core Concepts",
    docs: [
      {
        slug: "agent-mail-at-a-glance",
        title: "Agent Mail At A Glance",
        filename: "agent-mail-at-a-glance.md",
        description:
          "A glossary-aware overview of the Rust system: what it is, why it exists, and how the major primitives fit together.",
      },
      {
        slug: "jargon-map",
        title: "Jargon Map",
        filename: "jargon-map.md",
        description:
          "A reader-oriented vocabulary bridge for the terms that appear across the site, MCP surface, TUI, and archive model.",
      },
    ],
  },
  {
    category: "Coordination Flows",
    docs: [
      {
        slug: "system-topology",
        title: "System Topology",
        filename: "system-topology.md",
        description:
          "The end-to-end flow from agent request to SQLite state, git-audited archive artifacts, and operator-visible surfaces.",
      },
      {
        slug: "message-lifecycle-and-threads",
        title: "Message Lifecycle And Threads",
        filename: "message-lifecycle-and-threads.md",
        description:
          "How targeted messages move through inbox delivery, read and ack state, thread continuity, and search visibility.",
      },
      {
        slug: "file-reservations-and-guardrails",
        title: "File Reservations And Guardrails",
        filename: "file-reservations-and-guardrails.md",
        description:
          "How advisory leases, conflict detection, TTL expiry, and the pre-commit guard reduce destructive edit collisions.",
      },
      {
        slug: "product-bus-and-cross-project",
        title: "Product Bus And Cross-Project Coordination",
        filename: "product-bus-and-cross-project.md",
        description:
          "How Agent Mail links multiple repos into one coordination plane without collapsing them into a single git history.",
      },
    ],
  },
  {
    category: "Storage & Search",
    docs: [
      {
        slug: "dual-write-and-commit-coalescer",
        title: "Dual Write And Commit Coalescer",
        filename: "dual-write-and-commit-coalescer.md",
        description:
          "Why the system writes to SQLite first, how archive writes are batched, and how the coalescer avoids git lock contention.",
      },
      {
        slug: "search-v3-explained",
        title: "Search V3 Explained",
        filename: "search-v3-explained.md",
        description:
          "A practical tour of lexical and semantic retrieval, ranking modes, scope filters, and graceful degradation behavior.",
      },
    ],
  },
  {
    category: "Interface Surfaces",
    docs: [
      {
        slug: "mcp-surface-tools-resources-macros",
        title: "MCP Surface: Tools, Resources, And Macros",
        filename: "mcp-surface-tools-resources-macros.md",
        description:
          "How the 34-tool MCP surface is organized, what resources are for, and when the macro helpers collapse multi-step workflows.",
      },
      {
        slug: "operator-surfaces",
        title: "Operator Surfaces",
        filename: "operator-surfaces.md",
        description:
          "How the TUI, robot CLI, and web UI fit together for humans and automation without blurring their responsibilities.",
      },
    ],
  },
  {
    category: "Reliability & Safety",
    docs: [
      {
        slug: "reliability-and-safety",
        title: "Reliability And Safety",
        filename: "reliability-and-safety.md",
        description:
          "Stress gauntlet scenarios, backpressure, lock recovery, privacy boundaries, and the operational safety model behind the Rust rewrite.",
      },
    ],
  },
  {
    category: "Migration & Parity",
    docs: [
      {
        slug: "migration-rollout-and-parity",
        title: "Migration, Rollout, And Parity",
        filename: "migration-rollout-and-parity.md",
        description:
          "How the Rust implementation is rolled out, how parity is proven, and how legacy Python state moves safely into the new system.",
      },
    ],
  },
] as const satisfies ReadonlyArray<{
  category: SpecCategory;
  docs: ReadonlyArray<Omit<SpecDoc, "category" | "order">>;
}>;

export const specDocs: SpecDoc[] = specDocSections
  .flatMap(({ category, docs }) => docs.map((doc) => ({ ...doc, category })))
  .map((doc, index) => ({ ...doc, order: index + 1 }));

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
