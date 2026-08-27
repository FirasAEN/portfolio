---
title: EATON — Intelligent Power Manager
publishDate: 2020-09-01 00:00:00
diagram: streaming-state
description: |
  Real-time energy dashboards for UPS-backed data centres, with facility- and device-level
  drill-down kept consistent under continuous streams by NgRx.
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

## Real-time energy dashboards for UPS-backed data centres

As a consultant at Capgemini-Sogeti High Tech, I built the web interfaces for
EATON's Intelligent Power Manager (IPM2): real-time energy dashboards for
UPS-backed data centres and facilities, including Eaton's own site at
Grenoble-Montbonnot.

### Live consumption, with drill-down

The interface shows live consumption and lets an operator descend through it —
from a facility down to an individual device. That hierarchy is the feature. A
site-level number tells you something is wrong; the drill-down is how you find
which rack.

### The constraint: everything updates at once

This is a streaming problem, not a page-load problem. Readings arrive
continuously from many devices, several views show overlapping slices of the
same data, and an operator has to be able to trust that what is on screen is
current and internally consistent.

Per-component subscriptions produce views that quietly disagree with each other —
the worst failure mode for monitoring software, because nothing signals that it
has happened.

### The decision

Hold the readings in NgRx as one source of truth, with RxJS composing the
derived streams each view needs, and ImmutableJS and Immer keeping updates from
mutating state in place. Components select from the store rather than owning
state, so two views of the same device read the same value by construction.

### The trade-off

NgRx is heavy machinery — actions, reducers, effects, selectors — for data that
could be fetched directly. On a form-driven screen that ceremony is never
repaid. On continuously updating monitoring views where consistency *is* the
product, it is.

### Beyond the front end

I coordinated work packages across the back-end and firmware teams. What the
interface can show is bounded by what the hardware reports and how often, so the
front end could not be specified independently of the firmware.

### Technical environment

Angular, AngularJS, TypeScript, NgRx, RxJS, ImmutableJS, Immer, Angular Material.
