---
title: A Training Programme for New Joiners
publishDate: 2022-04-01 00:00:00
diagram: onboarding-path
description: |
  Onboarding by pairing people through the architecture instead of handing them
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

Ramp-up used to depend on whoever was free. The cost landed on whoever sat
nearest the new joiner, so the quality varied with who that was, and the same
questions got answered from scratch every time. I built the training programme
that replaced it. Four engineers have been through it.

This codebase is harder to arrive at than most. A new joiner meets two idioms at
once, the inherited monolith and the DDD/Hexagonal services moving out of it,
plus an Nx graph with dependency rules the build enforces, plus a set of platform
concepts — virtualisation, lineage, tenancy — that nobody turns up already
holding.

So the method is pairing. New joiners build inside the architecture while
someone who knows it sits with them, which is how the DDD boundaries were
adopted across the team in the first place. Written material exists and it is
fine, but it supports the pairing. A document can state that the domain core
imports nothing from the outer rings. It cannot catch you the first time you
reach for a repository from inside it.

It costs a senior engineer real hours and it does not scale. At four people it
is a trade I will take.
