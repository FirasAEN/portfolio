---
title: Design System Library
publishDate: 2023-01-20 00:00:00
description: |
  Built a shared design system library providing consistent, reusable UI components
  across multiple micro-frontend applications with Storybook documentation.
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

## One source of UI truth across every module

Each front-end module was re-implementing the same interface elements, so the
product drifted visually and every fix had to be made several times. I built a
shared component library, documented in Storybook, and drove its adoption
across all modules.

### The library

Twenty-three components, split deliberately:

- **15 atomic components** — buttons, inputs, selects, and the rest of the
  primitives. No business knowledge, usable anywhere.
- **8 integration components** — composed, opinionated pieces that encode
  product patterns such as filterable tables and form layouts.

The split matters: atomic components stay stable because they know nothing
about the domain, while integration components can change with the product
without destabilising the primitives beneath them.

### Storybook as the contract

Storybook is where each component's states and API are demonstrated. Without
it, a shared library becomes a folder people copy out of rather than depend on
— documentation is what makes reuse cheaper than reimplementation.

### The trade-off

A shared library adds a coordination cost: changing a primitive means checking
every consumer. That cost is real, and it is smaller than the cost of the same
fix being applied inconsistently in each module.

### Outcome

Every front-end module now takes its UI from one place, and the library is a
dependency of the Nx graph rather than a convention.
