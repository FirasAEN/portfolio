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

## Ending five teams' worth of duplicated components

Every front-end team was maintaining its own version of the same interface
components. The product drifted between modules, and each fix had to be made
several times over. I built the shared library that ended it.

### The library

Twenty-three shared components on Angular Material, documented in Storybook and
split deliberately:

- **15 atomic components** — the primitives. No domain knowledge, usable anywhere.
- **8 integration components** — composed pieces encoding the patterns the suite
  repeats.

The split is what keeps it stable: atomic components have no reason to change
when the product does, so the foundation stays still while the layer above moves.

### Why a library alone would have failed

A shared library is not a technical problem, it is an adoption problem. Teams
already had working components; "use this instead" is a cost to them before it is
a benefit. So the library shipped with the things that make adoption rational:

- **Storybook documentation** — every state and API visible, so using a component
  is cheaper than rebuilding it.
- **Contribution guidelines** — a team that needs something the library lacks has
  a route to add it, rather than a reason to fork.
- **Versioning** — consumers upgrade deliberately instead of being broken by
  someone else's change.
- **Adoption sessions** — I ran these with the teams. Nothing gets adopted by
  announcement.

### The trade-off

A shared library concentrates coordination: changing a primitive means checking
every consumer, and versioning means supporting more than one version at a time.
That is strictly more process than each team owning its own copy — and cheaper
than the same bug being fixed five times, differently.

### Outcome

One library, adopted by every front-end team, with a contribution path that
keeps it that way.
