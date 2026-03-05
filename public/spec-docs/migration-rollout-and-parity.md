# Migration, Rollout, And Parity

> The Rust rewrite matters only if it can replace the old system without losing behavior, operator trust, or history.

## Visual Mental Model

```text
legacy Python system
      |
      +-> import / cutover planning
      +-> parity contracts
      +-> rollout gates
      +-> release checklist
      v
current Rust system with clearer reliability envelope
```

## Jargon Anchors

- parity: proof that the new surface matches required old behavior.
- cutover: the actual switch from the legacy system to the Rust system.
- rollout gate: the condition that must pass before promotion.
- verify-live: the evidence collection step that proves a deployment is healthy.

## Why This Document Exists

A rewrite is only valuable if it is more reliable *and* easier to reason about operationally.

The Rust repo therefore does not treat rollout as an afterthought. It has explicit docs for:

- search migration,
- interface-mode behavior,
- artifact schemas,
- release checklists,
- Python-to-Rust import,
- and parity expectations for operator surfaces.

## The Migration Philosophy

### 1. Preserve history

State and archives from the old system need a principled path into the new one.

### 2. Prove key behaviors

Parity is about the important surfaces: search, UI behavior, interface-mode boundaries, and operator workflows.

### 3. Roll out in stages

The system should move through controlled promotion instead of one giant leap of faith.

### 4. Keep rollback legible

A rollout plan is incomplete if it only explains the happy path.

## Why This Is Part Of The Spec Explorer

The migration story is part of the architecture, not side trivia. It explains why the site focuses so heavily on:

- Python-vs-Rust throughput and lock contention,
- Search V3 contracts,
- web/TUI parity,
- and the discipline around release evidence.

## What To Read Next

- [Search V3 Explained](./search-v3-explained.md)
- [Operator Surfaces](./operator-surfaces.md)
- [Reliability And Safety](./reliability-and-safety.md)

## Where To See It On The Site

- `/showcase#commit-coalescer-race`
- `/architecture#timeline`
- `/spec-explorer`
