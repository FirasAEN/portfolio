---
title: DC Maestro — Visual Workflow Engine
publishDate: 2022-06-15 00:00:00
diagram: workflow-model
description: |
  The module where automation processes are composed visually and configured per task,
  replacing hand-coded process definitions.
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

## The module where automation gets composed, not coded

Automation processes on the platform were hand-coded: every change to a business
process meant a developer and a release. I built the module that replaced that —
where processes are composed visually and each task is configured in place.

### The constraint

The people who understood a process were not the people who could change it. A
new step or a different condition became a ticket, a sprint, a deployment. The
definitions also lived only as code, which is an awkward fit for a platform
whose proposition is that you can see how your data got the way it is.

### The decision

Model a process as a graph and edit it as one, on JointJS. Each node is a task
carrying its own configuration; edges define sequencing and conditions. Tasks
are ordered by their dependencies, so the graph states what must happen before
what rather than merely suggesting it.

The graph *is* the definition — not a picture of a definition kept somewhere
else. There is no second representation to drift out of sync.

Per-task configuration is the part that makes it usable in practice: a step can
be retuned without touching the shape of the process, which is the change people
actually need to make most often.

### The trade-off

Moving definitions out of code gives up compile-time checking of them. The
compensation is validation before save — an unreachable task, a cycle, or a step
pointing at something the user cannot access is caught in the editor and
surfaced on the node itself. That moves the guarantee from the compiler to the
tool, deliberately.

Failure states are modelled rather than bolted on: a task can be failed, or
blocked because something upstream failed, and the graph shows which is which.

### Outcome

Automation processes are composed and reconfigured by the people who own them,
without a code change or a release.
