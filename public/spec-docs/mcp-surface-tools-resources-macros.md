# MCP Surface: Tools, Resources, And Macros

> Agent Mail is not one big tool. It is a deliberately segmented surface with different shapes for mutation, inspection, and choreography.

## Visual Mental Model

```text
tools     -> change or query state intentionally
resources -> recover read-only context cheaply
macros    -> bundle common multi-step workflows
```

## Jargon Anchors

- tool: a callable MCP operation.
- resource: a read-oriented URI surface.
- macro: a helper that expands into a known choreography.
- thread preparation: bringing an agent up to speed on an existing workstream.

## Why The Surface Is Split This Way

Agents have different needs at different moments.

Sometimes they need to *act*:
- register,
- reserve,
- message,
- search,
- link products.

Sometimes they only need to *read*:
- inbox snapshots,
- thread summaries,
- agent rosters,
- resource surfaces that are cheap to consume.

And sometimes they need a *known workflow*:
- start a session,
- prepare a thread,
- cycle a reservation,
- perform a contact handshake.

That is what tools, resources, and macros are for.

## A Practical Way To Think About It

### Tools are verbs

Use them when an agent needs to cause something to happen or run a precise query.

### Resources are windows

Use them when the agent needs context with less ceremony and less mutation risk.

### Macros are choreography

Use them when repeated multi-step sequences need to stay deterministic and easy to teach.

## Why This Helps Token Efficiency

The split prevents a common failure mode: using heavyweight mutation calls when a cheap read would have been enough, or re-implementing a common workflow from scratch every time.

## Representative Macro Flow

`macro_start_session` is the clearest example:

1. ensure the project exists,
2. register or refresh the agent identity,
3. optionally establish reservations,
4. fetch a usable inbox snapshot,
5. return the minimum context needed to begin coordinating.

That is exactly the kind of workflow agents should not have to rebuild ad hoc.

## What To Read Next

- [Agent Mail At A Glance](./agent-mail-at-a-glance.md)
- [Operator Surfaces](./operator-surfaces.md)
- [Message Lifecycle And Threads](./message-lifecycle-and-threads.md)

## Where To See It On The Site

- `/spec-explorer`
- `/architecture#mcp-layer`
- `/showcase#robot-mode`
- `/showcase#mcp-architecture`
