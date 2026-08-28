---
title: A Multi-Tenant Practice SaaS for Solo Practitioners and Medical Teams
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
  A practice-management SaaS I build, deploy and run myself on a VPS. Every customer is a
  tenant, and one organisational model has to fit both a one-person practice and a medical
  group without making the small customer pay for the large one's structure.
company: independent
featured: true
order: 1
---

A practice-management SaaS I build and run myself. Patients browse practitioners
and book; practices run scheduling, records and staff permissions; the whole
thing works in English and Arabic with full right-to-left support.

The customer is a medical practice, which might be one person or a group with
several locations. Both are tenants, and that single sentence is where the real
design problem lives. A group needs structure — sites, departments, clinics —
because it has enough moving parts to need naming. A solo practitioner does not
arrive wanting an organisational chart. They want to see next week. Any design
that makes a solo practitioner create a site and a department before they can
take a booking is wrong, and it is wrong at the data layer, not in the UI: if the
model demands a department then every screen, every endpoint and every seed path
demands one too.

## The correction

My first pass assumed the solo case collapses to one of everything. One site, one
department, one clinic, with the interface hiding the levels.

That was wrong. A solo dentist with two offices and a general/orthodontic split
is an ordinary practice, not an enterprise one. Clinics and departments are
plural at every customer size, and only site reliably collapses to one. So site
is the level that hides, and clinic and department stay first-class for
everybody.

The consequence I would otherwise have got wrong is that every caller has to
state which clinic it is acting in. Had the first assumption survived,
scope-in-request would have looked like a cost only large customers pay, so the
solo path would have been built without it, and it would have been retrofitted
the first time a dentist opened a second office.

A patient does not join an organisation the way staff do. They hold access to one
practice's platform, with a patient role, and book with practitioners on that
platform. The global account underneath is plumbing the patient never perceives;
what they experience is an account with their practice. Getting that distinction
right is what stops a patient-facing directory from quietly becoming a
cross-practice one.

## Isolation, because the data is medical

Tenants here are unrelated businesses and the records are patient health data. A
missed predicate does not leak rows between departments of one company. It leaks
between competitors.

So isolation is enforced in the database with row-level security instead of by
remembering to filter, and the posture everywhere is fail-closed. A connection
with no tenant set is pinned to a sentinel that matches nothing, so an unscoped
query returns zero rows and not every practice's. A principal whose tenant cannot
be resolved is a failed lookup, not a fall-through to some shared scope.

The connection pool is where this gets awkward. Setting the tenant is
session-scoped, so it survives the connection being released back into the pool
and a later checkout inherits whoever came before. The wrapper therefore covers
both checkout paths. Nearly every query goes through one of them, but
transactions take a raw connection, and those few sites are exactly where an
inherited tenant would read another practice's patients with no error to notice.

## Adding tenancy to a schema that already had data

The tenancy model arrived after the domain did, so it landed as a sequence and
not a switch: tenant tables, then nullable columns, then a backfill, then
`NOT NULL`, then the policies. Each step deployable alone, none of them a moment
where the application and the schema disagree.

The single-tenant fallback that made this possible refuses to boot once a second
tenant exists.
