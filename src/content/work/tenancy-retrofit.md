---
title: Retrofitting Multi-Tenancy onto a Live Schema
publishDate: 2026-08-27 00:00:00
tech:
  - PostgreSQL
  - NestJS
  - Prisma
  - TypeScript
  - Docker
tags:
  - Backend
  - Architecture
  - Security
diagram: rls-tenancy
description: |
  Adding tenant isolation to a 27-model schema already in use — row-level security,
  a session variable per request, and a pool that fails closed rather than leaking
  the previous request's tenant.
company: independent
---

## Adding isolation to a schema that already exists

A healthcare scheduling platform I build and run myself needed tenant isolation
after the fact — 27 data models, all of them already carrying data. Retrofitting
isolation is a different problem from designing for it: there is no clean slate,
and every intermediate state has to be safe.

I chose row-level security with a `tenant_id` column and a session variable set
per request, rather than a schema per tenant.

### The migration had to be safe at every step

The change landed as a sequence rather than a switch: tenant tables, then
`tenant_id` columns as nullable, then a backfill, then `NOT NULL`, then the
row-level security policies. Expand, backfill, contract — each step deployable on
its own, and none of them a moment where the application and the schema disagree.

### The failure mode that shaped the design

The subtle part was the connection pool. Setting the tenant is session-scoped, so
it **survives the connection being released back into the pool**. A connection
checked out later inherits whatever tenant the previous request set.

That is a cross-tenant read the database considers entirely legitimate. No error,
no constraint violation — correct-looking data belonging to someone else.

So the pool wrapper covers both paths. Almost every query goes through the pool's
query method, but transactions check out a raw connection instead — two call
sites out of nearly two hundred, and exactly the two where a leak would be
invisible. Wrapping only the common path would have looked complete and been
wrong.

### Fail closed, not open

A connection with no tenant set is pinned to a sentinel identifier that matches
nothing, so an unscoped query returns zero rows rather than everything. The
difference matters: an unset tenant is a bug either way, but one version returns
empty and the other returns the whole table.

Tenant resolution has the same posture — a principal whose tenant cannot be
resolved is a failed lookup, not a fall-through to some shared scope.

### The temporary crutch with an expiry

Single-tenant operation still had to work during the transition, so there is a
fallback that assumes the single tenant present. It refuses to boot if a second
tenant ever exists.

A temporary measure that cannot outlive its own assumption is a different thing
from one that quietly becomes permanent.
