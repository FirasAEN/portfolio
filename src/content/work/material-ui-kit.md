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
  An independently built Material-style UI kit — 35 components, 265 stories — where each
  component is its own Angular library and every style resolves through a three-tier token
  system rather than a hardcoded value.
---

An independently built Material-style UI kit, published as a Storybook of **265 stories
across 35 components**. Each component is its own Angular library under
`projects/ui-kit`, so a consumer depends on the piece it needs rather than on the whole
kit.

## Tokens resolve in three tiers, and only one of them is public

Every value lands as a CSS custom property, layered **primitive → semantic → component**.

Primitives are the raw palette — `--color-dark-blue-500`, `--space-4`, `--radius-md`.
Components never read them. They read semantic tokens only: `--color-accent`,
`--color-text-muted`, `--space-md`, the names that say what a thing *means* rather than
what it *is*.

The rule that makes it hold is the one about what to do when it doesn't fit: if no
semantic token covers your case, you add one. You do not reach past it to a primitive.
That single constraint is what keeps a palette swap or a dark theme from becoming an
archaeology exercise — the mapping lives in one tier, so retheming edits that tier and
nothing else.

## The catalogue is layered the same way

Primitives — Button, Chip, Input, Toggle, Tooltip — compose into Composites like Card,
Stat Badge and Dot Chip Container. Above both sit **Integration stories**: a wizard, a
form, a stepper, a card grid, exercising several components together.

That third tier is the one most libraries skip, and it is the one that earns its keep. A
kit that ships only primitives has passed the burden of composition to every consumer,
and the places a component library actually breaks are the seams — focus order across a
wizard's steps, a popover inside a scrolling grid, a select that has to close when a modal
does. Those are only visible when the pieces are assembled, so they are documented
assembled.
