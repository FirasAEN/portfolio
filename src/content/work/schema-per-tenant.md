---
title: Schema-per-Tenant on Hibernate 7
publishDate: 2026-08-26 00:00:00
tech:
  - Java
  - Spring Boot
  - Hibernate
  - PostgreSQL
  - Flyway
  - Spring Modulith
  - Multi-Tenancy
tags:
  - Backend
  - Architecture
  - Multi-Tenancy
diagram: schema-tenancy
description: |
  A Spring Boot reference architecture giving each tenant its own Postgres schema —
  where the connection provider deliberately does nothing, because Hibernate 7 already
  performs the switch itself.
company: independent
---

## The other answer to the same question

Having retrofitted row-level security onto an existing platform, I wanted the
alternative built properly rather than argued about: a schema per tenant, on
Spring Boot with Hibernate 7, greenfield.

They are genuinely different trade-offs. Row-level security keeps one schema and
pushes the guarantee into the database's policy engine. Schema-per-tenant gives
each tenant its own namespace and pushes the guarantee into connection routing
and migration. Having built both, I can say which suits a situation and why,
rather than defending whichever one I happen to know.

### The provider that does nothing, on purpose

The most interesting piece is a `MultiTenantConnectionProvider` whose methods are
deliberately empty.

Hibernate 7 performs the schema switch itself — it asks the schema mapper, calls
`setSchema`, and restores the previous value before releasing the connection. The
provider exists only because Hibernate checks that one is registered before
enabling multi-tenancy at all.

Adding a manual `SET search_path` there is the Hibernate 6 pattern. Carried
forward, it double-switches and defeats Hibernate's own restore. I verified the
behaviour rather than trusting the documentation: with a pool of exactly one
connection, a freshly borrowed connection after a tenant-scoped session reports
`search_path -> public`. The pool size of one is what makes the test mean
anything — with a larger pool you cannot tell whether you were handed a restored
connection or simply a different one.

### A startup window that fails open

Tenant resolution rejects unresolvable tenants, but only once the application is
ready — otherwise it rejects its own startup work.

The obvious gate is the "application started" event. It is the wrong one. Boot
starts the web server and scheduled tasks *inside* context refresh, which
completes **before** that event fires — leaving a real window in which a served
request resolves fail-open. Gating on context refresh closes it, and has the
useful side effect of firing in a plain context runner, so the path is testable
without booting a server.

### Provisioning is where the edge cases live

Creating a tenant means inserting a row, creating a schema, running migrations,
then activating. It cannot be one transaction, because the migration tool opens
its own connections.

Each fix exposed the next problem:

- Compensation must only drop a schema **this call created**, or a retry destroys
  a working tenant.
- Rejecting on "already exists" made provisioning un-retryable — a failed attempt
  leaves a row behind, so every retry was refused, and the compensation guard was
  protecting a retry that could never happen.
- Allowing resumption then opened a race: two concurrent calls could both reach
  the migration step, and the first one's failure would drop the schema out from
  under a tenant the second had already activated.

The span is serialised with a database advisory lock. Each step is only
defensible in the context of the one before it, which is why the reasoning is
recorded next to the code.

### Tenant codes are hostile input

A tenant code reaches DDL, where identifiers cannot be parameterised. It gets a
strict pattern, a reserved-name denylist, and an identifier quoter that doubles
quotes even though the pattern already forbids them — three defences, because
this is the one place where a bad string becomes executable.

### Deliberate startup strictness

The service has no default profile, so booting without one fails immediately
rather than silently falling back to development settings against a real
database. The test profile declares no datasource, so a test that forgets its
container fails loudly instead of quietly reaching a developer's local Postgres.
