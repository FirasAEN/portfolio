---
title: Untangling an Inherited Java Monolith
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

## Untangling an inherited Java monolith

The back end I inherited was a monolithic Java application with the business
logic tangled into it. Over four years I have moved new services out of it onto
Domain-Driven Design and Hexagonal boundaries — setting the boundaries, writing
the reference implementation, and driving adoption through pairing sessions.

### The constraint

The monolith was working and paying the bills. Rewriting it wholesale was never
on the table, and a rewrite is the failure mode this kind of work usually dies
of. Whatever the approach, the monolith had to keep running while it shrank.

The deeper problem was that the rules and the framework were the same code.
Exercising a business rule meant standing up a database and a Spring context, so
the rules were hard to test and therefore hard to change with any confidence.

### The decision

Draw the boundary at every *new* service rather than retrofitting the old ones.
Each new service gets a domain core that imports nothing from the outer rings,
ports that define what it needs, and adapters that implement them. The monolith
stays where it is and stops growing.

Two things mattered more than the pattern itself:

- **A reference implementation.** I wrote the first service end to end, so the
  shape was something people could read rather than a diagram in a wiki. "Follow
  this" beats "apply Hexagonal Architecture".
- **Pairing sessions.** Adoption happened by sitting with people while they
  built the second, third and fourth service. An architecture nobody can apply
  unaided is not adopted, it is imposed.

The front end took the same shape: Ports and Adapters, with NgRx for state, RxJS
for streams, and ImmutableJS and Immer for immutability.

### The trade-off

Two idioms now coexist — the monolith's and the new services'. That is a real
cost in navigation and in explaining the codebase to a new joiner, and it is the
price of not stopping to rewrite. It is also why the onboarding programme covers
the architecture explicitly.

Ports and adapters add types and indirection that a CRUD-shaped service never
repays, which is why the boundary is drawn at new services rather than
everywhere.

### Outcome

New services are tested with no database, no broker and no HTTP server. The
monolith is no longer where new business logic lands, and the pattern spreads by
people having built one, not by having been told about it.
