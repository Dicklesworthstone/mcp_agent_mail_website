# File Reservations And Guardrails

> Reservations are the system's answer to the question: "How do many agents edit one repo without lying to each other?"

## Visual Mental Model

```text
agent wants to edit files
   -> request reservation on paths/globs
   -> server checks overlap with live leases
   -> grant or report conflicts
   -> TTL ticks down while work happens
   -> release, renew, or expire
   -> optional pre-commit guard blocks boundary violations
```

## Jargon Anchors

- reservation: an advisory lease on files or globs.
- `exclusive`: only one writer should hold the lane.
- `shared`: observational or collaborative access.
- `TTL`: automatic expiry so dead agents do not block the repo forever.
- pre-commit guard: local enforcement before reserved files are committed.

## Advisory, Not Hard Locking

This distinction is central.

Agent Mail does **not** try to turn the repository into a mandatory-locking system. Instead, it makes ownership visible, conflict detection cheap, and stale claims recoverable.

That is why reservations work in practice:

- agents can coordinate before they collide,
- dead sessions do not create permanent deadlocks,
- humans retain emergency escape hatches,
- and the system stays usable even under imperfect behavior.

## The Flow

### 1. Claim intent

An agent asks for paths or globs before editing. Examples:

- `src/auth/**`
- `components/spec-explorer/*`
- `crates/mcp-agent-mail-db/src/search/*.rs`

### 2. Detect overlap

If another active exclusive reservation overlaps, the system reports the conflict instead of pretending all is well.

### 3. Work inside the lane

The reservation is not the work itself. It is the coordination signal that says, "I am in this area now; plan around me."

### 4. Release, renew, or expire

The clean path is explicit release when work finishes. If the agent vanishes, TTL expiry prevents the claim from becoming permanent.

### 5. Enforce at commit time when needed

The optional pre-commit guard is the second line of defense. It catches "I forgot I crossed into someone else's lane" mistakes close to the point of damage.

## Why This Beats Worktrees For This Use Case

The site takes a clear position: shared-space coordination is better than hiding agents from each other.

Worktrees postpone conflicts and multiply branches of reality. Reservations surface them immediately while everyone is still working in the same live codebase.

## Failure Modes The Design Anticipates

- Agent dies and never releases: TTL expiry handles it.
- Agent reserves too broadly: conflicts are visible and negotiable.
- Human must override in an emergency: the system allows escape hatches.
- Someone edits without reserving: the guard can still catch the boundary crossing.

## What To Read Next

- [Message Lifecycle And Threads](./message-lifecycle-and-threads.md)
- [Reliability And Safety](./reliability-and-safety.md)
- [Operator Surfaces](./operator-surfaces.md)

## Where To See It On The Site

- `/showcase#file-reservations`
- `/showcase#territory-map`
- `/showcase#conflict-cascade`
- `/architecture#overview`
