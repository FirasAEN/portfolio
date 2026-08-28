---
title: AngularJS to Angular Migration
publishDate: 2021-09-01 00:00:00
diagram: migration-path
description: |
  Seven DataChain modules off end-of-life AngularJS over 18 months, both frameworks
  running in the same page behind a bridge so feature delivery never stopped.
tech:
  - Angular
  - AngularJS
  - TypeScript
  - Nx
tags:
  - Dev
  - Frontend
  - Angular
company: adobis
---

AngularJS reached end of life in 2021 and seven DataChain modules still depended
on it. I planned the migration to Angular and carried it out over eighteen
months, with the product shipping features throughout.

DataChain sells into pharmaceutical and public-sector customers. An unsupported
framework there is not only technical debt; it is a line in a procurement
questionnaire that someone eventually asks about.

A big-bang rewrite would have frozen delivery for the whole eighteen months, so
I went module by module, with both frameworks running in the same page behind a
bridge layer. Each module could be moved, released and verified on its own. The
property that mattered more than I expected was that the work could be paused
whenever feature delivery needed the capacity, and it was, more than once.

The cost was a heavier bundle for a year and a half plus the bridge itself,
which was code someone had to maintain and nobody wanted to own. I deleted it
the week the last module moved.

The migration rode on the Nx monorepo structure. Without the module boundaries
already being real, moving one at a time would have been a much longer argument.
