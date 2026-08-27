---
title: DDD & Hexagonal Architecture
publishDate: 2022-08-15 00:00:00
diagram: hexagonal
description: |
  Inverted DataChain's back-end dependencies onto Ports and Adapters, so domain logic
  runs in tests with no database, broker or HTTP server.
tech:
  - Java
  - Spring Boot
  - Hibernate
  - Domain-Driven Design
  - Hexagonal Architecture
  - Ports & Adapters
  - JUnit
  - Mockito
tags:
  - Dev
  - Backend
  - Architecture
featured: true
order: 2
company: adobis
---

## Making DataChain's services testable without infrastructure

DataChain's back-end sits between customer data sources and everything the
platform does with them — virtualising, transforming, tracking lineage. Those
services could not be tested without a database and a running framework, which
made the suite slow to verify and its rules hard to change safely. I led a
redesign onto Domain-Driven Design with a Hexagonal (Ports and Adapters)
architecture, and extended the same shape to the front end.

### The constraint

The business rules were both the valuable part and the risky part. Lineage
semantics, permission resolution, how a transformation composes — these were
entangled with JPA entities and Spring annotations, so exercising a rule meant
standing up infrastructure first.

That matters more than usual here. DataChain runs in pharmaceutical and public
administration contexts where auditability is the product; a rule that cannot be
tested in isolation is a rule nobody can confidently assert is correct.

### The decision

Invert the dependencies. The domain core holds entities, value objects and
aggregates, and imports nothing from the outer rings. Ports define the
interfaces it needs; adapters implement them. Every arrow points inward.

Bounded contexts partition the platform along business boundaries, each owning
its data and exposing a defined API, with anti-corruption layers translating
between them so one context's model cannot leak into another.

The front end takes the same shape: Ports and Adapters over reactive Angular
components, so view logic is decoupled from framework concerns.

### The trade-off

Ports and adapters mean more types and more indirection, and on a genuinely
CRUD-shaped service that overhead is never repaid. It was applied where the
rules are complex enough to be worth isolating — new services — rather than
retrofitted across everything.

### Outcome

Domain logic runs in unit tests with no database, no broker and no HTTP server.
Swapping an infrastructure component means rewriting one adapter. The explicit
boundaries also gave new joiners a map of the platform, which fed directly into
the onboarding programme.
