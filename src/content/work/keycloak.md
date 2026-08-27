---
title: Keycloak & OAuth2 Integration
publishDate: 2022-02-01 00:00:00
diagram: oauth-flow
description: |
  Implemented Keycloak-based authentication and authorization with custom token mappers,
  group management, and SSO across multiple micro-frontend applications.
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

## One authentication flow for five tenants

Authentication was handled per application. I centralised it behind a single
Keycloak OAuth2/OIDC flow serving hundreds of users across five tenants,
including a custom token mapper.

### The constraint

Multi-tenancy was the hard part. Every request has to be authorised in the
context of the tenant it belongs to, and the standard OIDC claim set carries no
notion of tenant.

### The decision

Rather than resolving tenancy per request in each service — a database lookup
on every call, and a rule that each service could get subtly wrong — I wrote a
custom token mapper that injects the tenant claim into the token at issue time.

The resource APIs then authorise from the token alone. Tenant identity arrives
already verified, signed by Keycloak, on every request.

### The trade-off

Claims are fixed for the token's lifetime, so a tenancy change does not take
effect until the token is refreshed. In exchange, authorisation costs nothing
per request and the rule lives in exactly one place instead of being restated
in every service.

### Outcome

One flow now serves all five tenants and hundreds of users. Adding a service
means trusting the token, not re-implementing tenancy.
