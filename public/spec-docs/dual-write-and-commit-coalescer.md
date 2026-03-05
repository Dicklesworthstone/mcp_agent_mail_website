# Dual Write And Commit Coalescer

> If you only remember one infrastructure detail, remember this: SQLite is the fast truth for queries, and the archive is the durable human truth for audit.

## Visual Mental Model

```text
write request
   -> SQLite transaction succeeds first
   -> enqueue archive export work
   -> coalesce many nearby writes
   -> emit fewer git commits
   -> keep audit trail readable without melting under swarm load
```

## Jargon Anchors

- dual write: the combination of DB-first persistence plus archive export.
- WBQ: the write-behind queue that stages archive work.
- commit coalescer: the batching layer that compresses many writes into fewer commits.
- stale lock recovery: cleanup path for dead-process git lock artifacts.

## Why The Rust Rewrite Needed This

The Python implementation hit the same failure mode repeatedly under load: too many concurrent archive writes produced git lock contention and degraded the whole system.

The Rust architecture fixes that by separating the fast path from the audit path.

## The Intended Ordering

1. **Write to SQLite first.**
   This makes the state visible for search, inbox reads, and operator views immediately.

2. **Queue archive export.**
   The filesystem history is still required, but it no longer sits directly on the critical path for every read.

3. **Batch aggressively.**
   A burst of writes should not become a burst of commits. The coalescer turns write storms into fewer, larger archive updates.

## Why This Is Better Than "Just Commit Every Event"

Because the audit trail is for human legibility and recovery, not for forcing the live system to pay the full cost of git plumbing on every single event.

The database answers "what is true right now?"
The archive answers "what happened and how did we get here?"

## Invariants That Matter

- Query-visible state should appear quickly after the request.
- Archive lag is acceptable only within a controlled and recoverable envelope.
- Archive batching must not destroy audit meaning.
- Lock contention must degrade gracefully instead of detonating the system.

## Operational Consequences

This design is why the site emphasizes:

- 9x+ commit reduction through coalescing,
- stale git lock recovery,
- pool exhaustion recovery,
- and sustained mixed workloads instead of toy single-agent scenarios.

## What To Read Next

- [System Topology](./system-topology.md)
- [Search V3 Explained](./search-v3-explained.md)
- [Reliability And Safety](./reliability-and-safety.md)

## Where To See It On The Site

- `/architecture#dual-write`
- `/architecture#coalescer`
- `/showcase#dual-write-pipeline`
- `/showcase#commit-coalescer`
- `/showcase#commit-coalescer-race`
