---
title: Nx Micro-Frontend Architecture
publishDate: 2023-05-10 00:00:00
diagram: nx-graph
description: |
  Restructured the front end into an Nx monorepo of five applications on Ports and Adapters,
  so micro-frontends build and release independently.
tech:
  - Angular
  - TypeScript
  - Nx
  - Module Federation
  - Ports & Adapters
tags:
  - Dev
  - Frontend
  - DevOps
company: adobis
featured: true
order: 4
---

## Restructuring the front end so five apps release independently

I restructured the front end into an Nx monorepo of five applications — DC Viz,
DC MarketPlace, DC Code, DC Tag IA and the access console — so the
micro-frontends build and release independently, on Ports and Adapters.

### The constraint

The five applications share a great deal by nature. They all render the same
platform concepts, so they share a design system, a data-access layer and a set
of domain types. Splitting into five repositories would have bought release
independence by duplicating all of that, and by letting the copies drift.

But shipping them together meant every release was a coordination exercise: five
things had to be ready before any of them could go.

### The decision

One repository, with the dependency graph made explicit and enforced.
Applications at the top, feature libraries below, shared UI and data-access
below that. Dependencies only point downward and the build fails if that is
violated — the constraint is checked by tooling rather than written down and
hoped for.

Ports and Adapters applies here too: an application depends on an interface, not
on another application's internals, which is what makes the graph rules
enforceable rather than aspirational.

Module Federation then lets each application load its own bundle at runtime.

### The trade-off

A monorepo concentrates risk: a bad change to a shared library can reach all
five applications at once, where separate repositories would have contained it.
That is the price of not duplicating the shared code, and it is why the graph
rules are enforced and why CI rebuilds only what a change actually affects.

### Outcome

Five applications build and release on their own cadence from one codebase. The
same structure carried the AngularJS-to-Angular migration of seven modules,
because modules could move one at a time behind the federation boundary.
