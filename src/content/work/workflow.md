---
title: DC Maestro — Visual Orchestration Editor
publishDate: 2022-06-15 00:00:00
diagram: workflow-model
description: |
  The drag-and-drop editor behind DataChain's orchestration module: task graphs with
  per-task configuration, dependency sequencing, and validation before save.
tech:
  - Angular
  - TypeScript
  - JointJS
  - Java
  - Spring Boot
tags:
  - Dev
  - Frontend
  - JointJS
company: adobis
---

## The visual editor behind DC Maestro

DC Maestro is DataChain's orchestration module: it runs the data production
pipelines that keep a customer's datasets current. I built its editor — the
drag-and-drop surface where the people who own a process define it, rather than
filing a ticket for a developer to encode it.

### The constraint

Pipeline definitions used to live in code, so every change to a business
process — a new step, a different order, an altered condition — needed a
developer and a release. The people who understood the process were not the
people who could change it.

### The decision

Model a pipeline as a graph and edit it as one. Each node is a task carrying
its own configuration; edges define sequencing and conditions. Tasks are
ordered by their dependencies, so the graph expresses what must happen before
what.

The graph is the definition — not a picture of a definition stored elsewhere.
There is no second representation to drift out of sync, which matters on a
platform whose whole proposition is traceability.

### The trade-off

Moving definitions out of code gives up compile-time checking of them. The
compensation is validation before save: an unreachable task, a cycle, or a step
pointing at something the user cannot access is caught in the editor and
surfaced on the node itself. That moves the guarantee from the compiler to the
tool — a real shift in where correctness is enforced, and a deliberate one.

Failure states are part of the model rather than an afterthought: a task can be
failed, or blocked because something upstream failed, and the graph shows which.

### Outcome

Automation is reconfigured without a code change or a release, by the people who
own the process.
