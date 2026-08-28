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

I restructured the front end into an Nx monorepo of five applications — DC Viz,
DC MarketPlace, DC Code, DC Tag IA and the access console — so they build and
release independently.

They share a lot by nature. All five render the same platform concepts, so they
share a design system, a data-access layer and a set of domain types. Splitting
into five repositories would have bought release independence by duplicating all
of that and letting the copies drift. Shipping them together meant every release
was a coordination exercise where five things had to be ready before any of them
could go.

So: one repository, with the dependency graph made explicit and enforced.
Applications at the top, feature libraries below, shared UI and data-access below
that. Dependencies only point downward and the build fails if you break it.
Ports and Adapters applies here as well — an application depends on an interface,
not on another application's internals — and without that the graph rules would
have nothing to check against. Module Federation then lets each application load
its own bundle at runtime.

The risk this concentrates is that a bad change to a shared library reaches all
five applications at once, where separate repositories would have contained it.
That is the price of not duplicating the shared code, and it is why the graph
rules are enforced by the build and why CI rebuilds only what a change actually
affects.

The same structure carried the AngularJS-to-Angular migration of seven modules,
because modules could move one at a time behind the federation boundary.
