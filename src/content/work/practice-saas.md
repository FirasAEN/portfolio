---
title: One Hierarchy for a Solo Dentist and a Hospital Group
publishDate: 2026-08-27 00:00:00
tech:
  - PostgreSQL
  - Multi-Tenancy
  - NestJS
  - Prisma
  - TypeScript
  - React
  - Docker
tags:
  - Backend
  - Architecture
  - Product
diagram: rls-tenancy
description: |
  A practice-management SaaS where every customer is a tenant — designing one organisational
  model that fits a one-person practice and a medical group, without making the small
  customer pay for the large one's structure.
company: independent
---

## Every customer is a tenant, and customers are not the same size

A practice-management SaaS I build and run myself: patients browse practitioners
and book, practices run scheduling, records and staff permissions, in English and
Arabic with full right-to-left support.

The customer is a medical practice — which might be one person, or a group with
several locations. Both are tenants. That single sentence is where the real
design problem lives.

### The trap: making the small customer pay for the large one

A group needs structure — sites, departments, clinics — because it has enough
moving parts to need naming. A solo practitioner does not arrive wanting an
organisational chart. They want to see next week.

**Any design that makes a solo practitioner create a site and a department before
they can take a booking is wrong.** The model has to be expressive enough for the
group without the smaller customer meeting the parts that exist for someone else.

That is not a UI problem you can paper over at the end. If the data model demands
a department, then every screen, every endpoint and every seed path demands one
too.

### The correction that changed the model

My first pass assumed the solo case collapses to one of everything — one site,
one department, one clinic — and that the interface could simply hide the levels.

That was wrong, and it is worth stating because the corrected version is the
whole design. **A solo dentist with two offices and a general/orthodontic split
is an ordinary practice, not an enterprise one.** Clinics and departments are
genuinely plural at every customer size.

Only *site* reliably collapses to one. So site is the level that hides; clinic
and department stay first-class for everybody.

That has a consequence I would otherwise have got wrong: every caller has to
state which clinic it is acting in. Had the assumption survived, scope-in-request
would have looked like a cost only large customers pay, and the solo path would
have been built without it — then retrofitted the first time a dentist opened a
second office.

### What a patient actually is

A patient does not join an organisation the way staff do. They hold access to
**one practice's platform**, with a patient role, and book with practitioners on
that platform.

The global account underneath is plumbing the patient never perceives; what they
experience is an account with their practice. Getting that distinction right is
what stops a patient-facing directory from quietly becoming a cross-practice one.

### Isolation, because the data is medical

Tenants here are unrelated businesses, and the records are patient health data.
A missed predicate does not leak rows between departments of one company — it
leaks between competitors.

So isolation is enforced in the database with row-level security rather than by
remembering to filter, and the posture everywhere is fail-closed:

- A connection with no tenant set is pinned to a sentinel that matches nothing,
  so an unscoped query returns zero rows rather than every practice's.
- A principal whose tenant cannot be resolved is a failed lookup, not a
  fall-through to some shared scope.

The subtle part is the connection pool. Setting the tenant is session-scoped, so
it **survives the connection being released back into the pool** — a later
checkout inherits whoever came before. The wrapper therefore covers both checkout
paths: nearly every query goes through one, but transactions take a raw
connection, and those few sites are exactly where an inherited tenant would read
another practice's patients with no error to notice.

### Adding it to a schema that already had data

The tenancy model arrived after the domain did, so it landed as a sequence rather
than a switch: tenant tables, then nullable columns, then a backfill, then
`NOT NULL`, then the policies. Each step deployable alone, none of them a moment
where the application and the schema disagree.

The single-tenant fallback that made this possible refuses to boot once a second
tenant exists. A temporary measure that cannot outlive its own assumption is a
different thing from one that quietly becomes permanent.
