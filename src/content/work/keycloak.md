---
title: Keycloak & OAuth2 Integration
publishDate: 2022-02-01 00:00:00
img: assets/work/security.png
imgThumbnail: assets/work/oauth-keycloak.png
img_alt: Security architecture diagram showing OAuth2 authentication flows
description: |
  Implemented Keycloak-based authentication and authorization with custom token mappers,
  group management, and SSO across multiple micro-frontend applications.
tags:
  - Dev
  - Backend
  - Security
company: adobis
---

## Enterprise Authentication with Keycloak

Designed and implemented the authentication and authorization layer for the platform using Keycloak as the identity provider, integrating OAuth2/OIDC flows across a micro-frontend architecture.

### Authentication Architecture

- **Authorization Code Flow with PKCE** — Implemented the recommended OAuth2 flow for single-page applications, eliminating the need for client secrets in the browser.
- **Silent token refresh** — Configured automatic token renewal using hidden iframes and refresh tokens, ensuring seamless user sessions.
- **SSO across micro-frontends** — All applications share a single Keycloak session, providing a unified login experience.

### Custom Token Mappers

Developed custom Keycloak token mappers (Java SPIs) to enrich JWT tokens with application-specific claims:
- User roles and permissions derived from group membership
- Tenant-specific attributes for multi-tenancy support
- Feature flags embedded in tokens for fine-grained access control

### Group Management

- **Hierarchical group structure** — Mapped organizational units to Keycloak groups, with inherited role assignments.
- **Self-service administration** — Built an admin UI allowing managers to assign users to groups and roles without IT intervention.
- **Audit logging** — All permission changes are tracked for compliance and troubleshooting.

### Integration Points

The Keycloak integration connects with both the Angular frontend (via angular-auth-oidc-client) and the Spring Boot backend (via Spring Security OAuth2 Resource Server), ensuring consistent authentication across the full stack.
