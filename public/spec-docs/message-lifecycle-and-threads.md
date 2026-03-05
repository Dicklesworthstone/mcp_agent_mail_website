# Message Lifecycle And Threads

> The message model is where Agent Mail stops looking like generic "agent chat" and starts behaving like a serious coordination system.

## Visual Mental Model

```text
send_message
   -> DB write
   -> archive export
   -> recipient inbox copy
   -> read state
   -> optional acknowledgment
   -> thread search / history recovery
```

## Jargon Anchors

- `thread_id`: durable key for keeping a workstream coherent.
- `ack_required`: explicit confirmation that a message was seen.
- importance: routing hint for triage and urgency.
- inbox / outbox: mailbox views over stored messages.

## The Core Idea

Agent Mail uses a mail metaphor instead of a chat metaphor.

That means:

- messages are discrete units,
- they have subjects,
- they can target specific recipients,
- they can request acknowledgment,
- and they persist outside any one agent session.

This matters because multi-agent coordination breaks down when everything becomes an unstructured flood of status chatter.

## Lifecycle Stages

### 1. Compose and route

A sender chooses recipients, a subject, and often a `thread_id`. This creates a reusable workstream instead of a one-off burst.

### 2. Persist and export

The message is written into SQLite for fast retrieval and exported into the archive so humans can inspect it later.

### 3. Deliver into mailbox views

Recipients see the message in their inbox. The sender can later recover it from outbox or thread search.

### 4. Read and acknowledge

Read state tells you whether a recipient has seen it. `ack_required` is the stronger contract: a recipient is expected to explicitly confirm receipt.

### 5. Recover through search

Later, operators and agents can search by subject, sender, thread, importance, or time window instead of re-explaining what happened.

## Why Threads Matter

`thread_id` is one of the most important pieces of discipline in the whole system.

Without it:
- the same migration gets discussed in five disconnected places,
- handoffs become ambiguous,
- and message search becomes noisy.

With it:
- every related update lands in one recoverable history,
- replies inherit context naturally,
- and humans can inspect exactly how a decision evolved.

## Invariants Worth Caring About

- A message should be attributable to a named sender.
- A thread should represent one coherent workstream.
- Acknowledgment should be used selectively for messages that actually require confirmation.
- Search and archive should make recovery cheaper than re-broadcasting context.

## What To Read Next

- [File Reservations And Guardrails](./file-reservations-and-guardrails.md)
- [Search V3 Explained](./search-v3-explained.md)
- [MCP Surface: Tools, Resources, And Macros](./mcp-surface-tools-resources-macros.md)

## Where To See It On The Site

- `/showcase#message-lifecycle`
- `/showcase#swarm-simulation`
- `/architecture#search`
