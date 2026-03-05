# Product Bus And Cross-Project Coordination

> Multi-agent coding gets much more interesting once the work crosses repo boundaries.

## Visual Mental Model

```text
project A ----+
              +-> product scope -> cross-project search / inbox / contacts
project B ----+
project C ----+
```

## Jargon Anchors

- project: one repo-level coordination boundary.
- product: a grouping of related projects.
- contact policy: whether one agent may directly message another.
- product-scoped search: retrieval across linked repos.

## Why This Exists

Real work rarely stays inside one repository.

A frontend agent may need to coordinate with a backend agent.
A CLI agent may need to notify the docs repo.
A release train may span multiple services that should remain separate git histories.

The product bus solves that without flattening everything into one mega-project.

## The Design Principle

**Projects stay real. Products provide federation.**

That means:

- reservations stay local to the owning repo,
- archive history stays project-specific,
- but inbox/search/contact flows can span linked repos when that is the right operational view.

## Typical Cross-Project Flow

1. Link two or more projects into one product.
2. Use product-scoped search to recover relevant conversations across repos.
3. Send targeted messages across repo boundaries when a dependency or handoff matters.
4. Keep edits and file reservations local to the repo that actually owns the code.

## Why This Matters Operationally

This keeps the coordination story clean:

- you get federation without pretending repositories are interchangeable,
- you avoid accidental cross-repo edits,
- and you still gain one operator view across a broader initiative.

## Common Misunderstanding To Avoid

A product is **not** a permission bypass.

It does not erase project ownership and it does not make every resource universally visible. It is a routing and discovery scope, not a reason to ignore boundaries.

## What To Read Next

- [System Topology](./system-topology.md)
- [Search V3 Explained](./search-v3-explained.md)
- [Operator Surfaces](./operator-surfaces.md)

## Where To See It On The Site

- `/architecture#product-bus`
- `/showcase#product-bus`
