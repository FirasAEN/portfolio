---
title: DDD & Hexagonal Architecture
publishDate: 2022-08-15 00:00:00
img: assets/work/Gemini_Generated_Image_qc713uqc713uqc71.png
imgThumbnail: assets/work/Gemini_Generated_Image_qc713uqc713uqc71.png
img_alt: Hexagonal architecture diagram showing ports and adapters pattern
description: |
  Designed and implemented a Domain-Driven Design approach with Hexagonal Architecture
  for back-end services, ensuring clean separation of business logic from infrastructure.
tags:
  - Dev
  - Backend
  - Architecture
company: adobis
---

## Domain-Driven Design in Practice

Led the architectural redesign of the back-end services, applying Domain-Driven Design principles and the Hexagonal (Ports and Adapters) architecture pattern to improve maintainability, testability, and alignment with business requirements.

### Hexagonal Architecture

The architecture separates the application into three layers:
- **Domain core** — Pure business logic with no framework dependencies. Entities, value objects, aggregates, and domain services live here.
- **Ports** — Interfaces that define how the domain interacts with the outside world (inbound ports for use cases, outbound ports for persistence and external services).
- **Adapters** — Concrete implementations of ports: REST controllers (inbound), JPA repositories, message brokers, and external API clients (outbound).

### Bounded Contexts

Identified and modeled bounded contexts to partition the system along business boundaries:
- Each bounded context owns its data and exposes a well-defined API
- Anti-corruption layers translate between contexts, preventing domain model leakage
- Context mapping documents the relationships (shared kernel, customer-supplier, conformist)

### Benefits Realized

- **Testability** — Domain logic is tested in isolation without databases or HTTP servers.
- **Flexibility** — Infrastructure components (database, messaging, external APIs) can be swapped without touching business logic.
- **Onboarding** — New developers understand the codebase faster thanks to explicit boundaries and consistent patterns.
