---
title: A Job Execution Platform on Spark and Kafka
publishDate: 2026-08-24 00:00:00
tech:
  - Java
  - Spring Boot
  - Spring Modulith
  - Apache Spark
  - Kafka
  - Keycloak
  - PostgreSQL
  - Docker
tags:
  - Backend
  - Architecture
  - Distributed
diagram: job-pipeline
description: |
  Jobs submitted through a BFF, queued on Kafka, executed by a long-running Spark
  application and streamed back over SSE under one trace id — with the domain-specific
  surface narrowed to four extension points.
company: independent
featured: true
order: 6
---

## A platform where the business logic is the plugin

A job execution platform built to be business-agnostic: submission through a
backend-for-frontend, queueing on Kafka, execution by a long-running Spark
Structured Streaming application, and status streamed back to the browser over
server-sent events — the whole path under a single trace id.

Adding a domain means implementing four things: a job handler, the event types,
the tables and endpoints, and the frontend pages. Everything else already exists.
Two domains are built on it, which is the minimum number that proves the seam is
real rather than imagined — with one, the abstraction is a guess.

Ten Maven modules, with boundaries enforced by module verification tests rather
than by agreement.

### Spring Boot 4 and Spark 4 disagree

The parent POM deliberately does **not** inherit `spring-boot-starter-parent`,
which is the first thing a reviewer would flag as a mistake.

Boot 4's dependency management pins Jackson, kafka-clients and Netty in ways that
are right for Spring and wrong for Spark 4. Inheriting the parent hands one of the
two frameworks versions it was never built against. So each Spring service imports
the Boot BOM itself, and the Spark modules pin Spark explicitly.

The consequence is that **Jackson 2 on the Spark side and Jackson 3 on the Spring
side bind the same shared records**. That works only because compilation retains
parameter names — a build flag that looks cosmetic and is load-bearing.

### The reconciler proposes, the backend decides

A reconciler detects stuck jobs. It sends the backend a bare list of job ids — no
thresholds, no reasons, no verdict. The backend re-reads each row and applies its
own rules.

That asymmetry is the whole point: a bug in the reconciler's query cannot talk the
backend into failing healthy jobs. The component that scans is not the component
that decides, so a wrong scan costs a wasted round trip instead of an incident.

Submission goes through a transactional outbox, so a rolled-back submission
produces no message and a failed send leaves a replayable row.

### Trade-offs taken deliberately

- **Every BFF instance consumes the whole status topic** in its own consumer
  group. A shared group would partition events across instances and silently
  starve sessions held elsewhere. Duplicate consumption is the cheaper problem.
- **Identity reconciliation caps its blast radius** at a fifth of linked accounts
  per pass, because a truncated response from the identity provider is
  indistinguishable from a genuine mass departure.
- **The bearer token never reaches the browser** — held server-side against a
  session cookie that is deliberately not forwarded upstream.
- **"Log out" means three different things**: this application, this session, or
  everything including the identity provider. The interface says which one it is
  doing, because that ambiguity is a security problem rather than a wording one.

### Known gap, surfaced rather than buried

There is no cancel path, so a job marked failed and retried may still be running
in Spark. Handlers are therefore required to be idempotent — a requirement stated
in the interface and in the UI, not left in a document nobody opens.

It runs as a self-hosted stack: Postgres, Redpanda, MinIO, Keycloak, Spark,
Traefik and a full observability stack in Compose. It is not deployed publicly
and carries no production traffic.
