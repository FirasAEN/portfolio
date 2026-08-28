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

A job execution platform I built to be business-agnostic: submission through a
backend-for-frontend, queueing on Kafka, execution by a long-running Spark
Structured Streaming application, status streamed back to the browser over
server-sent events, the whole path under one trace id. It runs as a self-hosted
Compose stack — Postgres, Redpanda, MinIO, Keycloak, Spark, Traefik and a full
observability stack. It is not deployed publicly and it carries no production
traffic.

Adding a domain means implementing four things: a job handler, the event types,
the tables and endpoints, and the frontend pages. Everything else already exists.
There are two domains on it, which is the smallest number that tells you
anything, because with one the seam is a guess. Ten Maven modules, with the
boundaries checked by module verification tests.

## Spring Boot 4 and Spark 4 disagree

The parent POM does not inherit `spring-boot-starter-parent`.

Boot 4's dependency management pins Jackson, kafka-clients and Netty in ways that
are right for Spring and wrong for Spark 4, so inheriting the parent hands one of
the two frameworks versions it was never built against. Each Spring service
imports the Boot BOM itself instead, and the Spark modules pin Spark explicitly.

Which leaves Jackson 2 on the Spark side and Jackson 3 on the Spring side binding
the same shared records. That works only because the build compiles with
`-parameters` and the record component names survive, which makes it the least
cosmetic-looking cosmetic flag I have.

## The reconciler proposes, the backend decides

A reconciler detects stuck jobs. It sends the backend a bare list of job ids — no
thresholds, no reasons, no verdict — and the backend re-reads each row and
applies its own rules. A bug in the reconciler's query cannot talk the backend
into failing healthy jobs, and a wrong scan costs a round trip.

Submission goes through a transactional outbox, so a rolled-back submission
produces no message and a failed send leaves a replayable row.

Every BFF instance consumes the whole status topic in its own consumer group.
That is duplicate work and I chose it: a shared group would partition events
across instances and starve sessions held elsewhere, with nothing to indicate it
had happened. Identity reconciliation caps its blast radius at a fifth of linked
accounts per pass, because a truncated response from the identity provider looks
exactly like a genuine mass departure. The bearer token never reaches the browser
and is held server-side against a session cookie that is not forwarded upstream.
And "log out" is three separate actions in the interface, because this
application, this session, and everything including the identity provider are
different things and picking the wrong one is a security problem.

There is no cancel path. A job marked failed and retried may still be running in
Spark, so handlers have to be idempotent, and that requirement is stated in the
interface and in the UI.
