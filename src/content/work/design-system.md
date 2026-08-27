---
title: DataChain Design System
publishDate: 2023-01-20 00:00:00
diagram: design-system
description: |
  23 Storybook-documented components — 15 atomic, 8 integration — giving every module
  in the suite one source of UI truth instead of five re-implementations.
tech:
  - Angular
  - TypeScript
  - Storybook
  - Jest
tags:
  - Dev
  - Frontend
  - Design
company: adobis
---

## One source of UI truth across the DataChain suite

Every module in the suite renders the same platform concepts — datasets,
connectors, permissions, lineage — and each was re-implementing the interface
for them. The product drifted visually between modules and every fix had to be
made several times. I built the shared component library, documented in
Storybook, and drove its adoption across all of them.

### The library

Twenty-three components, split deliberately:

- **15 atomic components** — buttons, inputs, selects, and the rest of the
  primitives. No platform knowledge, usable anywhere.
- **8 integration components** — composed, opinionated pieces encoding patterns
  the suite repeats: filterable tables over large datasets, form layouts,
  permission pickers.

The split is what makes it hold. Atomic components stay stable because they
know nothing about DataChain; integration components can follow the product
without destabilising the primitives beneath them.

### Storybook as the contract

Storybook is where each component's states and API are demonstrated. Without it
a shared library becomes a folder people copy out of rather than depend on —
documentation is what makes reuse cheaper than reimplementation, and it is also
where a designer and a developer can disagree about a state before it ships.

### The trade-off

A shared library adds coordination cost: changing a primitive means checking
every consumer across five applications. That cost is real, and smaller than the
same fix being applied five times inconsistently.

### Outcome

Every module takes its UI from one place, as an enforced dependency in the Nx
graph rather than a convention people are asked to follow.
