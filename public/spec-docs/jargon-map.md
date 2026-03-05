# Jargon Map

> The shortest path from "what does that term mean?" to "I know why the system is built that way."

## How To Use This Page

The website already has a full `/glossary`. This document is the quick orientation layer for the terms that recur most often in the spec explorer and the visualizations.

## Visual Mental Model

```text
repo identity -> project_key
agent identity -> agent_name
conversation identity -> thread_id
edit intent -> reservation
fast reads -> resource://...
operator automation -> am robot ...
cross-repo scope -> product
```

## High-Signal Terms

| Term | Intuitive Meaning | Precise Meaning In Agent Mail |
|---|---|---|
| `project_key` | "Which repo are we talking about?" | The absolute path that defines a coordination boundary. |
| `agent_name` | "Which agent said or did this?" | A memorable registered identity inside a project. |
| `thread_id` | "Which conversation does this belong to?" | The stable routing key for related messages and replies. |
| `ack_required` | "Does someone need to explicitly confirm receipt?" | A message flag that drives read/ack workflows. |
| reservation | "I am about to work here." | An advisory lease on one or more paths or globs. |
| `exclusive` / `shared` | "Solo lane or collaborative lane?" | Reservation modes that affect conflict handling. |
| `TTL` | "How long is this claim valid?" | Expiry on reservations so dead agents do not block work forever. |
| `resource://...` | "Read without mutating state." | MCP resources optimized for fast context retrieval. |
| macro | "One call that performs a common choreography." | A helper that bundles multiple lower-level steps. |
| product | "A group of related repos." | A federation scope used for cross-project inbox/search/contact flows. |
| WBQ | "Write queue for archive work." | The write-behind queue feeding filesystem/git export. |
| Search V3 | "The modern retrieval surface." | Query/filter/ranking/search diagnostics across messages and projects. |
| TOON | "Compressed operator output." | One of the robot CLI output formats optimized for agents. |

## Why The Vocabulary Matters

Agent Mail is intentionally not chat-shaped. The terms are chosen to encourage disciplined coordination:

- `thread_id` emphasizes durable workstreams over ephemeral chat bursts.
- `reservation` emphasizes intent signaling over hard locking.
- `resource://...` emphasizes read paths that do not mutate state.
- `product` emphasizes cross-repo coordination without pretending everything is one repo.

## Practical Translation Layer

If you think in ordinary engineering language:

- `project_key` is the repo boundary.
- `agent_name` is the actor identity.
- `thread_id` is the workstream key.
- reservation TTL is the anti-deadlock timer.
- the archive is the human audit layer.
- SQLite is the fast operational index.

## What To Read Next

- [Agent Mail At A Glance](./agent-mail-at-a-glance.md)
- [MCP Surface: Tools, Resources, And Macros](./mcp-surface-tools-resources-macros.md)
- [Operator Surfaces](./operator-surfaces.md)
