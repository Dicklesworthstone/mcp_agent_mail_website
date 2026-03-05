# System Topology

> This is the highest-value architecture diagram in prose form: where requests enter, where state lives, and where humans observe the system.

## Visual Mental Model

```text
Coding Agents / Humans
        |
        +-> MCP tools / resources
        +-> am robot
        +-> TUI / web UI
                |
                v
         Agent Mail server surface
                |
        +-------+--------+
        |                |
        v                v
      SQLite         WBQ / storage export
        |                |
        |                v
        |            archive files -> git history
        +----------------+
                |
                v
       inbox, search, metrics, operator views
```

## Jargon Anchors

- `MCP`: the agent-facing transport contract.
- WBQ: the write-behind queue for archive export.
- archive: the human-readable filesystem history.
- resource URI: read-oriented surface for fast recovery.
- operator surface: TUI, web UI, and robot CLI views over the same underlying state.

## Entry Surfaces

Agent Mail has more than one front door, but they all converge on the same underlying coordination state.

### 1. MCP tools and resources

This is the agent-native surface. Agents register, reserve files, send messages, search history, and read resources without caring about terminal UX.

### 2. `am robot`

This is the automation-focused CLI surface. It exposes high-signal read paths and operator flows in `json`, `md`, or `toon` format.

### 3. TUI and web UI

These are the human and operator surfaces. They are how someone overseeing a swarm sees health, conflicts, throughput, thread activity, and project state.

## Core Internal Split

The system deliberately separates *fast operational state* from *human audit state*.

- **SQLite** is the query path.
- **Archive artifacts + git history** are the audit path.

This is why the website spends so much time on the dual-write pipeline and commit coalescer: they are not implementation trivia. They are what make the system usable under real swarm load.

## Why This Shape Works

If every request went directly to git, the system would be too slow and too contention-prone.
If everything lived only in a database, the audit story would be weaker and harder for humans to inspect.

The topology is therefore a compromise with intent:

- database for speed,
- archive for legibility,
- multiple surfaces for different audiences,
- one shared coordination model underneath.

## What To Read Next

- [Dual Write And Commit Coalescer](./dual-write-and-commit-coalescer.md)
- [Operator Surfaces](./operator-surfaces.md)
- [Reliability And Safety](./reliability-and-safety.md)

## Where To See It On The Site

- `/architecture#overview`
- `/showcase#dual-write-pipeline`
- `/showcase#mcp-architecture`
