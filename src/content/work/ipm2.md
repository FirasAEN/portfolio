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

As a consultant at Capgemini-Sogeti High Tech I built the web interfaces for
EATON's Intelligent Power Manager — real-time energy dashboards for UPS-backed
data centres and facilities, including Eaton's own site at Grenoble-Montbonnot.

The interface shows live consumption and lets an operator descend through it,
from a facility down to an individual device. That hierarchy is the feature. A
site-level number tells you something is wrong; the drill-down is how you find
which rack.

Readings arrive continuously from many devices and several views show
overlapping slices of the same data. If each component holds its own
subscription you get views that disagree with each other, and nothing on screen
signals that it has happened, which for monitoring software is the failure you
least want. So the readings live in NgRx as one store, with RxJS composing the
derived streams each view needs and ImmutableJS and Immer keeping updates from
mutating state in place. Components select from the store instead of owning
state, so two views of the same device read the same value.

I also coordinated work packages across the back-end and firmware teams. What
the interface can show is bounded by what the hardware reports and how often, so
the front end could not be specified on its own.
