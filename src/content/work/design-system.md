---
title: DataChain Design System
publishDate: 2023-01-20 00:00:00
diagram: design-system
description: |
  Ended the duplicated components each team was maintaining — 23 shared Angular Material
  components, plus the contribution guidelines and versioning that made adoption stick.
tech:
  - Angular
  - TypeScript
  - Storybook
  - Jest
tags:
  - Dev
  - Frontend
  - Design
company: adobis
---

Every front-end team was maintaining its own version of the same interface
components. The product drifted between modules and each fix had to be made
several times over, in several slightly different places. I built the shared
library that ended it.

Twenty-three components on Angular Material, documented in Storybook, split into
fifteen atomic ones and eight integration ones. The atomic components are
primitives with no domain knowledge, usable anywhere. The integration components
are composed pieces encoding the patterns the suite repeats. That split is what
keeps the thing stable: the primitives have no reason to change when the product
does, so the foundation stays still while the layer above moves.

The library on its own would not have been enough. Teams already had working
components, so "use this instead" is a cost to them before it is a benefit, and
most of the work was making the cost smaller than the benefit. Storybook, so
that finding out what a component does is faster than rebuilding it.
Contribution guidelines, so a team that needs something the library lacks has a
route to add it instead of a reason to fork. Versioning, so consumers upgrade
when they choose. And sessions with each team, which I ran, because none of the
above gets used by being announced.

A shared library concentrates coordination. Changing a primitive means checking
every consumer, and versioning means supporting more than one version at a time.
That is more process than five teams each keeping a copy, and it is the reason
the same bug stopped being fixed five times.
