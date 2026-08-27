---
title: Keycloak Across Five Tenants
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

## One authentication server for hundreds of users across five tenants

Authentication was being handled per module. I integrated Keycloak as the
authentication server for the whole suite — the full OAuth2/OIDC lifecycle for
hundreds of users across five tenants — and built the centralised module where
users, groups and permissions are administered in one place.

### The constraint

Multi-tenancy was the hard part. DataChain runs for organisations with real
separation requirements — a pharmaceutical company, a public administration, a
consultancy — so every request has to be authorised in the context of its
tenant. The standard OIDC claim set carries no notion of tenant at all.

### The decision

Take the whole lifecycle to Keycloak rather than only the login step: issuance,
refresh, logout, and session handling across modules, so a user moves between
them without re-authenticating and a revocation actually revokes.

For tenancy, I wrote a custom OAuth2 token mapper that injects the tenant claim
into the token at issue time. Services then authorise from the token alone —
tenant identity arrives already verified and signed, on every request,
identically everywhere. The alternative was a lookup per request in every
service, and a rule each service could get subtly wrong in its own way.

### The trade-off

Claims are fixed for the lifetime of a token, so a permission change does not
take effect until the token refreshes. That is a real window, and it buys
authorisation that costs nothing per request and a tenancy rule that exists in
exactly one place rather than being restated — and eventually diverging — across
every service in the suite.

### Outcome

One authentication server for the suite, five tenants, hundreds of users, and a
single place where access is administered.
