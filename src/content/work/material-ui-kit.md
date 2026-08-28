---
title: A Component Library as an Angular Workspace
publishDate: 2026-08-20 00:00:00
company: independent
tech:
  - Angular
  - TypeScript
  - Storybook
  - Jest
tags:
  - Frontend
  - Design
  - Tooling
diagram: token-layers
links:
  - url: https://material-storybook.cyberonix.dev/
    label: browse the Storybook
description: |
  A Material-style UI kit I built on my own — 35 components, 265 stories — where each
  component is its own Angular library and every style resolves through a three-tier token
  system.
featured: true
order: 3
---

A Material-style UI kit I built on my own, published as a Storybook of 265
stories across 35 components. Each component is its own Angular library under
`projects/ui-kit`, so a consumer depends on the piece it needs and not on the
whole kit.

## Tokens resolve in three tiers and only one of them is public

Every value lands as a CSS custom property, layered primitive → semantic →
component.

Primitives are the raw palette: `--color-dark-blue-500`, `--space-4`,
`--radius-md`. Components never read them. They read semantic tokens only —
`--color-accent`, `--color-text-muted`, `--space-md` — the names that say what a
thing means and not what it is.

The rule that makes it hold is the one about what to do when it does not fit. If
no semantic token covers your case, you add one. You do not reach past it to a
primitive. That constraint is what keeps a palette swap or a dark theme from
turning into an archaeology exercise: the mapping lives in one tier, so retheming
edits that tier and nothing else.

## The catalogue is layered the same way

Primitives — Button, Chip, Input, Toggle, Tooltip — compose into Composites like
Card, Stat Badge and Dot Chip Container. Above both sit Integration stories: a
wizard, a form, a stepper, a card grid, exercising several components at once.

The third tier is the one I care most about, because the places a component
library breaks are the seams. Focus order across a wizard's steps. A popover
inside a scrolling grid. A select that has to close when a modal does. None of
those are visible until the pieces are assembled, so they are documented
assembled.
