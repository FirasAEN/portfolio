---
title: Identity & Access Across the Suite
publishDate: 2022-02-01 00:00:00
diagram: oauth-flow
description: |
  Centralised users, groups and permissions behind one Keycloak OAuth2/OIDC flow —
  hundreds of users across five tenants, with a custom token mapper carrying tenancy.
tech:
  - Keycloak
  - OAuth2
  - OIDC
  - Spring Security
  - Java
tags:
  - Dev
  - Backend
  - Security
company: adobis
---

## One identity model for the whole suite

DataChain ships as several modules, each of which had been handling
authentication for itself. I built the centralised identity and access module
for the suite — users, groups and permissions in one place — behind a single
Keycloak OAuth2/OIDC flow serving hundreds of users across five tenants.

### The constraint

Multi-tenancy was the hard part. DataChain runs for organisations with real
separation requirements — a pharmaceutical company, a public administration, a
consultancy — so every request has to be authorised in the context of its
tenant, and the standard OIDC claim set carries no notion of tenant at all.

### The decision

Rather than resolving tenancy per request inside each service — a lookup on
every call, and a rule each service could get subtly wrong — I wrote a custom
token mapper that injects the tenant claim into the token at issue time.

Services then authorise from the token alone. Tenant identity arrives already
verified and signed by Keycloak, on every request, identically everywhere.

Groups sit on top of that: permissions are granted to groups rather than to
individuals, so access is administered once for a team instead of per person
per module.

### The trade-off

Claims are fixed for the lifetime of a token, so a permission change does not
take effect until the token refreshes. In exchange, authorisation costs nothing
per request and the tenancy rule lives in exactly one place instead of being
restated — and eventually diverging — in every service.

### Outcome

One flow serves all five tenants and every module in the suite. Adding a service
means trusting the token rather than re-implementing tenancy.
