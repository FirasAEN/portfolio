---
title: Nx Monorepo & Micro-Frontends
publishDate: 2023-05-10 00:00:00
diagram: nx-graph
description: |
  Set up an Nx monorepo with Module Federation for micro-frontend architecture,
  enabling independent deployment, shared libraries, and optimized builds.
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
featured: true
order: 1
company: adobis
---

## Five applications, one codebase, independent releases

Five front-end applications shared a codebase but could not ship
independently — any release meant coordinating all of them. I designed and
rolled out an Nx monorepo with Module Federation so each app builds, tests and
releases on its own cadence.

### The constraint

The shared code was real and worth keeping: one design system, one HTTP layer,
one set of domain types. Splitting into five repositories would have bought
independence at the cost of duplicating all of it, and of version drift between
copies.

### The decision

Keep one repository, but make the dependency graph explicit and enforced.
Applications sit at the top, feature libraries below them, shared UI and
data-access below that. Dependencies only point downward, and the build fails
if that rule is broken — the constraint is checked, not merely documented.

Module Federation then lets each application load its own bundle at runtime
rather than everything being linked into one artefact.

### The trade-off

A monorepo concentrates risk: a bad change to a shared library can affect every
application at once. That is the price of not duplicating the shared code, and
it is why the graph rules are enforced by tooling and why CI rebuilds only what
a change actually affects.

### Outcome

Five applications now build and release independently from one codebase. This
architecture also carried the AngularJS-to-Angular migration of seven modules,
because modules could move one at a time behind the same federation boundary.
