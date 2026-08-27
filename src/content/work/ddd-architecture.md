---
title: DDD & Hexagonal Architecture
publishDate: 2022-08-15 00:00:00
diagram: hexagonal
description: |
  Designed and implemented a Domain-Driven Design approach with Hexagonal Architecture
  for back-end services, ensuring clean separation of business logic from infrastructure.
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

## Making back-end services testable without infrastructure

Back-end services could not be tested without a database and a running
framework, which made the test suite slow and the business rules hard to
verify. I led a redesign onto Domain-Driven Design with a Hexagonal
(Ports and Adapters) architecture, and extended the same idea to the front end.

### The constraint

The business rules were the valuable part and the hardest part to change
safely. They were entangled with JPA entities and Spring annotations, so
exercising a rule meant standing up infrastructure first.

### The decision

Invert the dependencies. The domain core holds entities, value objects and
aggregates, and imports nothing from the outer rings. Ports define the
interfaces it needs; adapters implement them. Every arrow points inward.

Bounded contexts partition the system along business boundaries, each owning
its own data and exposing a defined API, with anti-corruption layers
translating between them so one context's model cannot leak into another.

On the front end the same shape applies: a Ports and Adapters structure over
reactive Angular components, so view logic is decoupled from framework
concerns.

### The trade-off

Ports and adapters mean more types and more indirection, and for a genuinely
CRUD-shaped service that overhead is not repaid. It is worth it where the
business rules are complex enough to be worth isolating — which is why it was
applied to new services rather than retrofitted everywhere.

### Outcome

Domain logic now runs in unit tests with no database, no broker and no HTTP
server. Swapping an infrastructure component means rewriting one adapter and
leaving the domain untouched. Explicit boundaries also gave new joiners a map
of the system, which fed directly into the onboarding programme.
