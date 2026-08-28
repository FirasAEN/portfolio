---
title: Keycloak Across Five Tenants
publishDate: 2022-02-01 00:00:00
diagram: oauth-flow
description: |
  Keycloak as the authentication server for the suite — the full OAuth2/OIDC lifecycle for
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

Authentication was handled per module. I moved the whole suite onto Keycloak as
its authentication server and built the module where users, groups and
permissions are administered in one place — hundreds of users across five
tenants.

I took the whole lifecycle across, not only the login step: issuance, refresh,
logout, session handling between modules. A user moves between modules without
re-authenticating and a revocation actually revokes.

Tenancy was the part with no standard answer. DataChain runs for organisations
with real separation requirements — a pharmaceutical company, a public
administration, a consultancy — so every request has to be authorised in the
context of its tenant, and the standard OIDC claim set has no notion of tenant at
all. I wrote a custom OAuth2 token mapper that injects the tenant claim at issue
time. Services then authorise from the token alone: tenant identity arrives
verified and signed, on every request, the same way everywhere.

The cost is that claims are fixed for the lifetime of a token. Change someone's
permissions and nothing happens until their token refreshes, and for that window
they are still operating under the old ones. In a suite holding pharmaceutical
and public-sector data that is not a comfortable sentence to write.

What I got for it was one place where the tenancy rule lives. The alternative
was the same rule restated in every service, drifting apart at whatever rate
services drift apart, and nobody noticing until two of them disagreed about who
a user was.
