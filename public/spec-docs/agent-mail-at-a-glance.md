# Agent Mail At A Glance

> Start here if you want one mental model that makes the rest of the site make sense.

## Visual Mental Model

```text
Agent -> MCP tool call -> SQLite state -> archive artifacts -> search / inbox / TUI / web UI
          |                |               |
          |                |               +-> git-auditable history for humans
          |                +-> fast query path for agents and operators
          +-> coordination primitive (identity, message, reservation, search)
```

Agent Mail is the coordination layer that lets multiple coding agents work in the same real repository without degenerating into silent overwrites, duplicated effort, or human relay bottlenecks.

The system is built around a small set of primitives:

1. **Project-scoped identity**: each agent gets a memorable `agent_name` inside a `project_key`.
2. **Threaded messaging**: agents send direct, structured messages with subjects, priorities, and optional acknowledgments.
3. **Advisory file reservations**: agents announce intent before editing so collisions become visible early.
4. **Searchable history**: threads, messages, and project activity can be searched instead of re-explained.
5. **Cross-project federation**: related repos can be linked under a product so agents coordinate across boundaries.

## Jargon Anchors

- `project_key`: the absolute path identity for one repo. See `/glossary`.
- `agent_name`: the memorable handle used for routing and audit.
- `thread_id`: the durable conversation key that keeps related messages together.
- `TTL`: reservation lifetime before the lease expires automatically.
- `resource://...`: read-oriented MCP surfaces for fast context recovery.
- `product`: a grouping of multiple projects for cross-repo coordination.

## What Problem It Actually Solves

Without a coordination layer, multi-agent coding usually fails in one of four ways:

1. Two agents edit the same files and one silently overwrites the other.
2. A downstream agent repeats work because the upstream result never reached it.
3. Humans become the message bus, copying status updates between sessions.
4. The project loses its audit trail because coordination happened only in transient chat.

Agent Mail addresses those failure modes without forcing every agent into separate worktrees or separate repos.

## The Practical Shape Of The System

A typical request path looks like this:

1. An agent boots into a repo and establishes `project_key` + identity.
2. It checks inbox, reservations, or search before touching code.
3. It reserves the files it intends to edit.
4. It sends targeted messages when a boundary or handoff matters.
5. The server records those events into SQLite and exports archive artifacts for audit.
6. Humans or other agents recover the history later through search, the TUI, robot CLI, or the web UI.

The important detail is that coordination state lives *outside* any one agent's context window.

## What To Read Next

- [Jargon Map](./jargon-map.md)
- [System Topology](./system-topology.md)
- [Message Lifecycle And Threads](./message-lifecycle-and-threads.md)
- [File Reservations And Guardrails](./file-reservations-and-guardrails.md)

## Where To See It On The Site

- `/architecture#overview`
- `/showcase#swarm-simulation`
- `/showcase#message-lifecycle`
- `/showcase#file-reservations`
