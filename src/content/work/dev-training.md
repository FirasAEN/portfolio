---
title: Onboarding by Pairing
publishDate: 2022-04-01 00:00:00
diagram: onboarding-path
description: |
  Onboarding by pairing people through the architecture rather than handing them
  documentation. Four engineers to date.
tech:
  - Domain-Driven Design
  - Hexagonal Architecture
  - Nx
tags:
  - Dev
  - Leadership
company: adobis
---

## Onboarding by pairing, not by documentation

New developers were ramped up ad hoc, so how fast someone became productive
depended on who happened to be free. I built and ran the training programme;
four engineers have been through it.

### The problem with ad-hoc onboarding

It is invisible until it fails. The cost lands on whoever sits nearest, the
quality varies with who that is, and the same questions get answered from
scratch every time.

This codebase makes it harder than average. A new joiner meets two idioms at
once — the inherited monolith and the DDD/Hexagonal services moving out of it —
plus an Nx graph with enforced dependency rules and a platform whose core
concepts (virtualisation, lineage, tenancy) are not the ones they arrive with.

### The programme

The method is pairing, not reading. New joiners are paired through the
architecture: they build inside it while someone who knows it is sitting there,
which is the same way the DDD boundaries were adopted across the team.

Written material exists, but it supports the pairing rather than replacing it. A
document can state that the domain core imports nothing from the outer rings. It
cannot catch you the first time you reach for a repository from inside it.

### The trade-off

Pairing costs a senior engineer's time in real hours, and it does not scale past
a handful of joiners a year. At four engineers to date, that is the right trade;
at a much higher intake it would have to become something more scalable and less
effective.

### Outcome

Ramp-up no longer depends on who is free. Four engineers onboarded, and the
architecture gets explained the way it is actually applied.
