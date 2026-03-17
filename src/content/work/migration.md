---
title: AngularJS to Angular Migration
publishDate: 2021-09-01 00:00:00
img: assets/work/angularJS-angular-migration-2.png
imgThumbnail: assets/work/angularJS-angular-migration.png
img_alt: Diagram showing the migration path from AngularJS to Angular
description: |
  Led an incremental migration of a large-scale AngularJS application to Angular,
  using a hybrid architecture to ensure zero downtime and continuous feature delivery.
tags:
  - Dev
  - Frontend
  - Angular
company: adobis
---

## Incremental Migration Strategy

Orchestrated the migration of a mature AngularJS enterprise application to Angular, running both frameworks simultaneously in a hybrid setup using Angular's `UpgradeModule`. This approach allowed the team to migrate component by component without halting feature development.

### Challenges

- **Large codebase** — Hundreds of AngularJS directives, services, and filters to convert.
- **Active development** — New features continued shipping during the migration, requiring careful coordination.
- **Shared state** — AngularJS and Angular components needed to communicate and share data seamlessly.

### Approach

- **Bottom-up migration** — Started with leaf components (no dependencies on other AngularJS code) and worked upward.
- **Shared services** — Wrapped critical AngularJS services as Angular injectables using `downgradeInjectable` and `upgradeModule`, maintaining a single source of truth.
- **Lazy-loaded Angular modules** — New features were built as lazy-loaded Angular modules, keeping the initial bundle size manageable.
- **Automated testing** — Each migrated component was covered by unit and integration tests before the AngularJS version was removed.

### Results

The migration was completed over several months with zero production incidents. The resulting Angular application benefited from improved performance through ahead-of-time compilation, tree-shaking, and Angular's change detection strategy.
