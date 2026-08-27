---
title: EATON — Intelligent Power Manager
publishDate: 2020-09-01 00:00:00
diagram: streaming-state
description: |
  Built Angular reactive UIs for EATON's Intelligent Power Manager (IPM2),
  a data center UPS monitoring platform with real-time state management using NgRx.
tech:
  - Angular
  - AngularJS
  - TypeScript
  - NgRx
  - RxJS
  - ImmutableJS
tags:
  - Dev
  - Frontend
  - Enterprise
company: capgemini
---

## Monitoring UPS-backed data centres for EATON

As a consultant at Capgemini-Sogeti High Tech, I built web interfaces for
EATON's Intelligent Power Manager (IPM2) — energy consumption monitoring across
UPS-backed data centres and facilities, including Eaton's own site at
Grenoble-Montbonnot.

### The constraint: everything updates at once

A monitoring interface for power infrastructure is a streaming problem, not a
page-load problem. Readings arrive continuously from many devices, several
views show overlapping slices of the same data, and the operator has to be able
to trust that what is on screen is current and internally consistent.

Naive per-component subscriptions produce views that disagree with each other —
the worst possible failure mode for monitoring software, because it is not
obvious that it has happened.

### The decision

Hold the readings in a single normalised NgRx store as the one source of truth,
with RxJS composing the derived streams each view needs. Components own no
state of their own; they select from the store. If two views show the same
device, they are reading the same value by construction rather than by
coincidence.

### The trade-off

NgRx is heavy machinery — actions, reducers, effects and selectors for data
that could be fetched directly. For a form-driven screen that ceremony is not
repaid. For continuously updating monitoring views where consistency is the
product, it is.

### Beyond the front end

I coordinated work packages across the back-end and firmware teams. Monitoring
software is defined by what the hardware can actually report and how often, so
the interface could not be specified independently of the firmware.

### Technical environment

Angular and AngularJS, TypeScript, NgRx, RxJS, ImmutableJS, Immer, Angular
Material.
