---
title: A Hexagonal Reference Architecture for New Services
publishDate: 2022-08-15 00:00:00
diagram: hexagonal
description: |
  Moved new services off an inherited Java monolith onto DDD and Hexagonal boundaries —
  writing the reference implementation and pairing people through it.
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
company: adobis
featured: true
order: 2
---

The back end I inherited was a monolithic Java application with the business
logic tangled into it. Over four years I have moved new services out of it onto
Domain-Driven Design and Hexagonal boundaries, setting the boundaries, writing
the reference implementation, and pairing people through it.

The monolith was working and paying the bills. Rewriting it wholesale was never
on the table, and a wholesale rewrite is the failure mode this kind of work
usually dies of, so whatever I did had to keep it running while it shrank.

The problem underneath was that the rules and the framework were the same code.
Exercising a business rule meant standing up a database and a Spring context.
That made the rules slow to test, which made them hard to change with any
confidence, which meant nobody changed them unless they had to — and the ones
nobody wants to touch are the ones the business keeps wanting to change.

So I drew the boundary at every new service and left the old ones alone.
Domain core that imports nothing from the outer rings, ports for what it needs,
adapters that implement them. The monolith stays where it is and stops growing.

The pattern was the easy part. I wrote the first service end to end before asking
anyone else to write one, so the thing people had to follow was a service they
could open and read, not a diagram on a wiki page. Then I paired through the
second, third and fourth. That is most of where the four years went, and it is
the part I would defend if someone told me the architecture could have been
rolled out in a quarter. It could have been announced in a quarter.

The front end took the same shape: Ports and Adapters, NgRx for state, RxJS for
streams, ImmutableJS and Immer for immutability.

Two idioms now coexist, the monolith's and the new services'. That costs real
navigation time and it costs something out of every new joiner's first week,
which is part of why the onboarding programme covers the architecture explicitly.
Ports and adapters also add types and indirection that a CRUD-shaped service
never repays, which is why the boundary sits at new services and not everywhere.

New services are tested with no database, no broker and no HTTP server. The
monolith is no longer where new business logic lands.
