# Reliability And Safety

> Reliability in Agent Mail is not just uptime. It is whether the system stays legible, recoverable, and non-destructive while many agents hit it at once.

## Visual Mental Model

```text
load spike / crash / stale lock / pool pressure / search degradation
                      |
                      v
             detect -> buffer -> recover -> preserve visibility
```

## Jargon Anchors

- stress gauntlet: the multi-scenario load and failure test suite.
- backpressure: controlled slowing of ingestion so the system can recover.
- stale lock recovery: cleanup of dead-process git lock artifacts.
- auditability: the ability for humans to inspect what happened after the fact.

## What "Safe" Means Here

A safe coordination system should avoid four bad outcomes:

1. losing the live state,
2. losing the historical explanation,
3. allowing invisible collisions,
4. failing so hard that operators cannot diagnose what happened.

## The Reliability Story In Practice

### Write pressure

The WBQ and commit coalescer absorb bursts that would otherwise crush the archive path.

### Database pressure

SQLite is configured and exercised so reads and writes remain available under heavier mixed workloads.

### Lock failure

Stale git lock artifacts are treated as an operational reality, not a theoretical impossibility.

### Search failure

The system is designed to degrade rather than abruptly blind the caller.

## The Safety Story In Practice

### Advisory reservations

They make edit collisions visible before damage happens.

### Search scope and privacy

Retrieval is not enough by itself. Visibility and redaction boundaries still matter.

### Auditability

Archive export means humans can inspect the exact thread, message, and reservation history after an incident.

### Operator visibility

The TUI, robot CLI, and web surfaces make it possible to detect trouble before it turns into a mystery.

## Why The Stress Gauntlet Matters

The point of the gauntlet is not just bragging rights. It is proving that the system still behaves like a coordination layer instead of collapsing into a pile of race conditions when many agents use it simultaneously.

## What To Read Next

- [Dual Write And Commit Coalescer](./dual-write-and-commit-coalescer.md)
- [File Reservations And Guardrails](./file-reservations-and-guardrails.md)
- [Migration, Rollout, And Parity](./migration-rollout-and-parity.md)

## Where To See It On The Site

- `/architecture#reliability`
- `/showcase#stress-gauntlet`
- `/showcase#backpressure-health`
- `/showcase#commit-coalescer-race`
