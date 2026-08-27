---
title: Developer Onboarding Programme
publishDate: 2022-04-01 00:00:00
diagram: onboarding-path
description: |
  Turned ad-hoc ramp-up into a defined path through the architecture and its reasoning.
  Four engineers onboarded to date.
tech:
  - Domain-Driven Design
  - Hexagonal Architecture
  - Nx
tags:
  - Dev
  - Leadership
company: adobis
---

## Turning onboarding from folklore into a programme

New developers were ramped up ad hoc, so how quickly someone became productive
depended on who happened to be free to help them. I built and ran a structured
onboarding programme; four engineers have been through it.

### The problem with ad-hoc onboarding

It is invisible until it fails. The cost lands on whoever is nearest, the
quality varies with who that is, and the same questions get answered from
scratch every time.

DataChain makes this worse than average. A new joiner has to hold several ideas
at once before they can change anything safely: virtualisation rather than
copying, lineage as a first-class concern, tenant-scoped permissions, and a
suite of modules over a shared codebase with enforced dependency rules.

### The programme

A defined path — environment setup, then the architecture and the reasoning
behind it, then supervised work on real tickets.

The architectural decisions are taught explicitly: why Hexagonal, why the Nx
graph rules exist, why tenancy lives in the token. A joiner who understands the
reasoning stops needing to ask what the rules are, and starts being able to tell
when a rule does not apply.

### The trade-off

A written programme has to be maintained, and it goes stale faster than code
because nothing fails when it does. It is kept alive by being used every time
someone joins, rather than by being reviewed on a schedule.

### Outcome

Ramp-up is repeatable rather than dependent on who is available. Four engineers
onboarded to date, and the explicit architecture documentation it required is
now used by the whole team.
