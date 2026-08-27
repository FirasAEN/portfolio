---
title: AngularJS to Angular Migration
publishDate: 2021-09-01 00:00:00
diagram: migration-path
description: |
  Led an incremental migration of a large-scale AngularJS application to Angular,
  using a hybrid architecture to ensure zero downtime and continuous feature delivery.
tech:
  - Angular
  - AngularJS
  - TypeScript
  - Nx
tags:
  - Dev
  - Frontend
  - Angular
company: adobis
---

## Retiring an end-of-life framework without pausing delivery

AngularJS reached end of life in 2021 while seven modules still depended on it.
I planned and carried out the migration to Angular over 18 months, with the
product shipping features throughout.

### The constraint

A framework past end of life is an accumulating security and hiring liability,
so it had to go. But a big-bang rewrite would have frozen feature delivery for
the entire period — not an acceptable trade for a product with active users.

### The decision

Migrate incrementally, one module at a time, with both frameworks running in
the same page behind a bridge layer. Each module could be moved, released and
verified on its own, and the work could be paused whenever feature delivery
needed the capacity.

### The trade-off

Running two frameworks side by side means a heavier bundle and a bridge layer
that is itself code to maintain — for a year and a half. That was the
deliberate price of never stopping delivery. The bridge was deleted once the
last module moved.

### Outcome

All seven modules now run on Angular and the AngularJS dependency is gone. The
migration rode on the Nx monorepo structure, which is what made module-by-module
movement practical.
