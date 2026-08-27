---
title: DataChain Suite — Nx Monorepo & Micro-Frontends
publishDate: 2023-05-10 00:00:00
diagram: nx-graph
description: |
  Five DataChain modules building and releasing independently from one codebase,
  on an Nx monorepo with Module Federation and an enforced dependency graph.
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

## Five DataChain modules, one codebase, independent releases

DataChain ships as a suite — DC Viz, DC MarketPlace, DC Code, DC Tag IA and the
access console. They shared a codebase but could not ship independently, so any
release meant coordinating all five. I designed and rolled out an Nx monorepo
with Module Federation so each module builds, tests and releases on its own
cadence.

### The constraint

The shared code was real and worth keeping. Every module renders the same
platform concepts — datasets, connectors, lineage, permissions — so they share
a design system, an HTTP layer and a set of domain types. Splitting into five
repositories would have bought independence by duplicating all of it, and by
letting the copies drift apart.

### The decision

Keep one repository, but make the dependency graph explicit and enforced.
Applications sit at the top, feature libraries below them, shared UI and
data-access below that. Dependencies only point downward, and the build fails
if that rule is broken — the constraint is checked by tooling, not documented
in a README and hoped for.

Module Federation then lets each application load its own bundle at runtime, so
a customer running DC Viz does not receive DC Code's code.

### The trade-off

A monorepo concentrates risk: a bad change to a shared library can reach every
module at once. That is the price of not duplicating the shared code, and it is
why the graph rules are enforced and why CI rebuilds only what a change
actually affects rather than everything.

### Outcome

Five modules build and release independently from one codebase. The same
structure carried the AngularJS-to-Angular migration, because modules could
move one at a time behind the federation boundary.
