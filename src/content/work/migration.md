---
title: AngularJS to Angular Migration
publishDate: 2021-09-01 00:00:00
diagram: migration-path
description: |
  Seven DataChain modules moved off end-of-life AngularJS over 18 months, both frameworks
  running side by side so feature delivery never stopped.
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

AngularJS reached end of life in 2021 while seven DataChain modules still
depended on it. I planned and carried out the migration to Angular over 18
months, with the product shipping features throughout.

### The constraint

A framework past end of life is an accumulating security and hiring liability —
and for a platform sold into pharmaceutical and public-sector customers, an
unsupported dependency is a question you get asked in procurement. It had to go.

But a big-bang rewrite would have frozen feature delivery for the whole period,
which is not an acceptable trade for a product with paying customers.

### The decision

Migrate incrementally, one module at a time, with both frameworks running in the
same page behind a bridge layer. Each module could be moved, released and
verified on its own, and the work could be paused whenever feature delivery
needed the capacity — which it did, more than once.

### The trade-off

Running two frameworks side by side means a heavier bundle and a bridge layer
that is itself code to maintain, for a year and a half. That was the deliberate
price of never stopping delivery. The bridge was deleted once the last module
moved.

### Outcome

All seven modules run on Angular and the AngularJS dependency is gone. The
migration rode on the Nx monorepo structure, which is what made module-by-module
movement practical rather than theoretical.
