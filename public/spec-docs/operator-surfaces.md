# Operator Surfaces

> Agent Mail has multiple interfaces on purpose. The trick is understanding what each surface is for and what it is not for.

## Visual Mental Model

```text
MCP surface -> coding agents
am robot    -> automation and scripts
TUI         -> live human oversight
web UI      -> browser-based inspection and workflows
```

## Jargon Anchors

- MCP server: the agent-facing protocol surface.
- robot mode: non-interactive CLI output for automation.
- TUI: the live operations console.
- web UI parity: the contract that browser surfaces should match the Rust system's behavior.

## The Big Distinction

The system serves two audiences at once:

1. **coding agents**, which need reliable machine-facing surfaces,
2. **human operators**, which need oversight, triage, and intervention tools.

Trying to make one interface do everything usually harms both.

## Surface By Surface

### MCP

Best when the caller is an agent doing precise coordination work.

### `am robot`

Best when the caller is automation, shell orchestration, or another agent that wants compact CLI output.

### TUI

Best when a human wants to see the whole swarm at once: messages, reservations, health, load, project relationships, and search activity.

### Web UI

Best when browser-native inspection, sharing, or parity with mail-like workflows matters more than terminal presence.

## Why The Site Talks About Dual Mode

The project has spent a lot of effort clarifying how these surfaces should coexist without becoming ambiguous. The important design question is not "which interface is coolest?" It is "which interface is correct for this caller and this task?"

## Practical Rule Of Thumb

- If an agent is coordinating work, think MCP first.
- If automation needs snapshots or reports, think `am robot`.
- If a human is triaging the swarm, think TUI.
- If browser workflows or parity reviews matter, think web UI.

## What To Read Next

- [MCP Surface: Tools, Resources, And Macros](./mcp-surface-tools-resources-macros.md)
- [Reliability And Safety](./reliability-and-safety.md)
- [Migration, Rollout, And Parity](./migration-rollout-and-parity.md)

## Where To See It On The Site

- `/showcase#tui-screens`
- `/showcase#robot-mode`
- `/showcase#dual-mode-interface`
- `/architecture#mcp-layer`
