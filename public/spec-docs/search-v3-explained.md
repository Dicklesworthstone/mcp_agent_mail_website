# Search V3 Explained

> Search V3 exists so agents stop asking humans to restate context that the system already knows.

## Visual Mental Model

```text
query
  -> parse filters and scope
  -> choose lexical / semantic / hybrid path
  -> rank and optionally explain
  -> apply visibility / scope rules
  -> return hits + diagnostics
```

## Jargon Anchors

- lexical: token-based retrieval, good for exact language.
- semantic: embedding-based retrieval, good for meaning-level similarity.
- hybrid: a blend of both.
- ranking: relevance vs recency vs engine-specific scoring.
- scope: the visibility boundary over what the caller is allowed to see.
- explain: structured details about why a result appeared.

## Why Search Matters So Much Here

In a serious multi-agent system, the most expensive mistake is not usually a bad edit. It is wasted coordination.

Search is how agents recover:

- prior design decisions,
- thread history,
- project-specific state,
- product-wide discussions,
- and the latest message context they actually need.

## The Practical Query Surface

Search V3 is not just a text box. It is a retrieval contract with multiple dimensions:

- query string,
- filters like sender, thread, importance, or time window,
- ranking mode,
- explain/diagnostic detail,
- and project-vs-product scope.

## Graceful Degradation

A good search system for coordination cannot be all-or-nothing.

The important idea is that the system should degrade rather than blind the caller:

- semantic ranking unavailable? return lexical results,
- expensive path unhealthy? preserve a simpler path,
- diagnostics available? expose them so operators know what changed.

## Why Scope Comes After Retrieval

The site and engine docs both emphasize this separation:

- retrieval finds plausible candidates,
- scope rules decide what the caller may actually see.

That keeps the search engine focused on ranking while privacy and visibility remain first-class policy layers.

## What To Read Next

- [Message Lifecycle And Threads](./message-lifecycle-and-threads.md)
- [Product Bus And Cross-Project Coordination](./product-bus-and-cross-project.md)
- [MCP Surface: Tools, Resources, And Macros](./mcp-surface-tools-resources-macros.md)

## Where To See It On The Site

- `/architecture#search`
- `/showcase#search-v3-pipeline`
- `/glossary`
